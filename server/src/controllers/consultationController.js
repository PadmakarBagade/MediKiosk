const Consultation = require('../models/Consultation');
const MedicalReport = require('../models/MedicalReport');
const PatientProfile = require('../models/PatientProfile');
const User = require('../models/User');
const { extractStructuredMedicalInformation } = require('../services/ai/extractionService');
const { generateDoctorFacingSummary } = require('../services/ai/summaryService');
const { logAudit } = require('../middleware/auditMiddleware');
const { checkRedFlags } = require('../services/clinical/redFlagService');

// @desc    Submit a new consultation (Patient or Kiosk session)
// @route   POST /api/consultations
const createConsultation = async (req, res, next) => {
  try {
    const {
      chiefComplaint,
      medicalHistory,
      medications,
      allergies,
      familyHistory,
      lifestyle,
      uploadedReports = [],
      kioskSession = false,
      patientReviewed = true,
      sourceProvenance = [],
    } = req.body;

    // Detect clinical red flags from chief complaint immediately
    const problemText = chiefComplaint?.problem || (typeof chiefComplaint === 'string' ? chiefComplaint : '');
    const redFlagResult = checkRedFlags(problemText);

    const patientId = req.user._id;
    const patientUser = await User.findById(patientId);

    // Fetch reports data if report IDs provided
    let reportsData = [];
    if (Array.isArray(uploadedReports) && uploadedReports.length > 0) {
      reportsData = await MedicalReport.find({ _id: { $in: uploadedReports } });
    }

    // AI Step 1: Extract structured entities
    const consultationPayload = {
      chiefComplaint,
      medicalHistory,
      medications,
      allergies,
      familyHistory,
      lifestyle,
    };
    const structuredData = await extractStructuredMedicalInformation(consultationPayload, reportsData);

    // AI Step 2: Generate Doctor-facing Clinical Summary
    const aiSummary = await generateDoctorFacingSummary(
      patientUser,
      consultationPayload,
      structuredData,
      reportsData
    );

    // Build default source provenance tags if not explicitly sent
    const provenanceList = sourceProvenance.length > 0 ? sourceProvenance : [
      { field: 'chiefComplaint', sourceType: 'patient_entered', sourceDetail: 'Patient Intake Questionnaire' },
      { field: 'medicalHistory', sourceType: 'patient_entered', sourceDetail: 'Patient History Screen' },
      { field: 'medications', sourceType: 'patient_entered', sourceDetail: 'Current Medication Form' },
      { field: 'allergies', sourceType: 'patient_entered', sourceDetail: 'Allergy Screen' },
      { field: 'reports', sourceType: 'ocr_extracted', sourceDetail: 'Medical Report OCR Parser' },
      { field: 'aiSummary', sourceType: 'ai_extracted', sourceDetail: 'MediKiosk Clinical Synthesizer' },
    ];

    // Create consultation
    const consultation = await Consultation.create({
      patientId,
      status: 'pending_review',
      kioskSession: Boolean(kioskSession),
      redFlag: redFlagResult.isRedFlag,
      redFlagReasons: redFlagResult.matchedRules,
      chiefComplaint,
      medicalHistory,
      medications,
      allergies,
      familyHistory,
      lifestyle,
      uploadedReports,
      patientReviewed: Boolean(patientReviewed),
      aiSummary,
      sourceProvenance: provenanceList,
    });

    // Link uploaded reports to this consultation
    if (uploadedReports.length > 0) {
      await MedicalReport.updateMany(
        { _id: { $in: uploadedReports } },
        { consultationId: consultation._id }
      );
    }

    // Sync profile baseline in background
    try {
      let profile = await PatientProfile.findOne({ userId: patientId });
      if (profile) {
        if (lifestyle) profile.lifestyle = { ...profile.lifestyle, ...lifestyle };
        if (Array.isArray(allergies) && allergies.length > 0) {
          // Merge unique allergies
          allergies.forEach(a => {
            if (a.allergen && !profile.allergies.some(p => p.allergen.toLowerCase() === a.allergen.toLowerCase())) {
              profile.allergies.push(a);
            }
          });
        }
        await profile.save();
      }
    } catch (e) {
      console.warn('[Profile Sync Warning]:', e.message);
    }

    await logAudit(patientId, req.user.role, 'CREATE_CONSULTATION', 'Consultation', consultation._id.toString(), {
      kioskSession,
      problem: chiefComplaint?.problem,
      isRedFlag: redFlagResult.isRedFlag,
      redFlagReasons: redFlagResult.matchedRules,
    });

    res.status(201).json({
      success: true,
      message: 'Consultation intake submitted successfully. AI summary prepared for doctor review.',
      consultation,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all consultations for logged-in patient
// @route   GET /api/consultations/my
const getMyConsultations = async (req, res, next) => {
  try {
    const consultations = await Consultation.find({ patientId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('uploadedReports', 'fileName originalName fileType processingStatus uploadedAt')
      .populate('doctorId', 'name medicalSpecialization');

    res.status(200).json({
      success: true,
      count: consultations.length,
      consultations,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single consultation by ID
// @route   GET /api/consultations/:id
const getConsultationById = async (req, res, next) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('patientId', 'name email phone gender dateOfBirth emergencyContact')
      .populate('doctorId', 'name medicalSpecialization medicalLicenseNumber')
      .populate('uploadedReports')
      .populate('doctorNotes.reviewedBy', 'name medicalSpecialization');

    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }

    // Access check: Only the patient themselves or doctors can view
    if (req.user.role !== 'doctor' && consultation.patientId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this consultation' });
    }

    res.status(200).json({
      success: true,
      consultation,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update consultation details (edit/correct before or after review)
// @route   PUT /api/consultations/:id
const updateConsultation = async (req, res, next) => {
  try {
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }

    if (req.user.role !== 'doctor' && consultation.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this consultation' });
    }

    const {
      chiefComplaint,
      medicalHistory,
      medications,
      allergies,
      familyHistory,
      lifestyle,
    } = req.body;

    if (chiefComplaint) {
      consultation.chiefComplaint = chiefComplaint;
      const updatedRedFlag = checkRedFlags(chiefComplaint?.problem || (typeof chiefComplaint === 'string' ? chiefComplaint : ''));
      consultation.redFlag = updatedRedFlag.isRedFlag;
      consultation.redFlagReasons = updatedRedFlag.matchedRules;
    }
    if (medicalHistory) consultation.medicalHistory = medicalHistory;
    if (medications) consultation.medications = medications;
    if (allergies) consultation.allergies = allergies;
    if (familyHistory) consultation.familyHistory = familyHistory;
    if (lifestyle) consultation.lifestyle = lifestyle;

    // Regenerate AI summary if requested or if patient edited
    const patientUser = await User.findById(consultation.patientId);
    const reportsData = await MedicalReport.find({ _id: { $in: consultation.uploadedReports } });
    const structuredData = await extractStructuredMedicalInformation(consultation, reportsData);
    consultation.aiSummary = await generateDoctorFacingSummary(patientUser, consultation, structuredData, reportsData);

    await consultation.save();

    await logAudit(req.user._id, req.user.role, 'UPDATE_CONSULTATION', 'Consultation', consultation._id.toString());

    res.status(200).json({
      success: true,
      message: 'Consultation updated successfully',
      consultation,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createConsultation,
  getMyConsultations,
  getConsultationById,
  updateConsultation,
};
