const Consultation = require('../models/Consultation');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const { logAudit } = require('../middleware/auditMiddleware');

// @desc    Get metrics for Doctor Dashboard
// @route   GET /api/doctors/stats
const getDoctorDashboardStats = async (req, res, next) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [pendingReviews, completedConsultations, todayConsultations, totalPatients, redFlagAlerts] = await Promise.all([
      Consultation.countDocuments({ status: 'pending_review' }),
      Consultation.countDocuments({ status: 'reviewed' }),
      Consultation.countDocuments({ createdAt: { $gte: startOfToday } }),
      User.countDocuments({ role: 'patient' }),
      Consultation.countDocuments({ redFlag: true, status: 'pending_review' }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        newPatients: totalPatients,
        pendingReviews,
        todayConsultations,
        completedConsultations,
        redFlagAlerts,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get queue of patient consultations
// @route   GET /api/doctors/consultations
const getConsultationsQueue = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    let consultations = await Consultation.find(query)
      .populate('patientId', 'name email phone gender dateOfBirth emergencyContact')
      .populate('doctorId', 'name medicalSpecialization')
      .populate('uploadedReports', 'fileName originalName processingStatus')
      .sort({ redFlag: -1, createdAt: -1 });

    // Filter in-memory by search if provided
    if (search && search.trim()) {
      const s = search.toLowerCase().trim();
      consultations = consultations.filter((c) => {
        const patientName = c.patientId?.name?.toLowerCase() || '';
        const complaint = c.chiefComplaint?.problem?.toLowerCase() || '';
        return patientName.includes(s) || complaint.includes(s);
      });
    }

    res.status(200).json({
      success: true,
      count: consultations.length,
      consultations,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add doctor clinical notes and mark consultation as reviewed
// @route   POST /api/doctors/consultations/:id/review
const reviewConsultation = async (req, res, next) => {
  try {
    const { clinicalNotes, differentialDiagnosisConsiderations, recommendedNextSteps } = req.body;
    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }

    consultation.doctorNotes = {
      clinicalNotes: clinicalNotes || '',
      differentialDiagnosisConsiderations: differentialDiagnosisConsiderations || '',
      recommendedNextSteps: recommendedNextSteps || '',
      reviewedAt: new Date(),
      reviewedBy: req.user._id,
    };
    consultation.doctorId = req.user._id;
    consultation.status = 'reviewed';

    // Add source provenance tag for doctor verification
    consultation.sourceProvenance.push({
      field: 'doctorNotes',
      sourceType: 'doctor_verified',
      sourceDetail: `Reviewed and validated by Dr. ${req.user.name}`,
    });

    await consultation.save();

    await logAudit(req.user._id, 'doctor', 'REVIEW_CONSULTATION', 'Consultation', consultation._id.toString(), {
      doctorName: req.user.name,
      patientId: consultation.patientId.toString(),
    });

    const populatedConsultation = await Consultation.findById(consultation._id)
      .populate('patientId', 'name email phone gender dateOfBirth emergencyContact')
      .populate('doctorId', 'name medicalSpecialization medicalLicenseNumber')
      .populate('uploadedReports')
      .populate('doctorNotes.reviewedBy', 'name medicalSpecialization');

    res.status(200).json({
      success: true,
      message: 'Consultation clinical review recorded successfully.',
      consultation: populatedConsultation,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get full patient medical history profile for doctor
// @route   GET /api/doctors/patients/:patientId/profile
const getPatientFullHistory = async (req, res, next) => {
  try {
    const patientUser = await User.findById(req.params.patientId).select('-password');
    if (!patientUser) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const [profile, previousConsultations] = await Promise.all([
      PatientProfile.findOne({ userId: patientUser._id }),
      Consultation.find({ patientId: patientUser._id }).sort({ createdAt: -1 }),
    ]);

    res.status(200).json({
      success: true,
      patient: patientUser,
      profile,
      previousConsultations,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDoctorDashboardStats,
  getConsultationsQueue,
  reviewConsultation,
  getPatientFullHistory,
};
