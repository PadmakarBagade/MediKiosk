const MedicalReport = require('../models/MedicalReport');
const { extractTextAndData } = require('../services/ocr/ocrService');
const { logAudit } = require('../middleware/auditMiddleware');

// @desc    Upload a new medical report and trigger OCR extraction
// @route   POST /api/reports/upload
const uploadReport = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF or image file' });
    }

    const { consultationId } = req.body;
    const patientId = req.user.role === 'doctor' && req.body.patientId ? req.body.patientId : req.user._id;

    // Create initial report entry
    const report = await MedicalReport.create({
      patientId,
      consultationId: consultationId || null,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      processingStatus: 'Processing',
    });

    // Run OCR extraction
    const extractionResult = await extractTextAndData(req.file.path, req.file.originalname);

    report.extractedText = extractionResult.extractedText;
    report.extractedData = extractionResult.extractedData;
    const hasFindings = extractionResult.success && extractionResult.extractedData?.findings?.length > 0;
    report.processingStatus = hasFindings ? 'Extracted' : 'Failed';
    await report.save();

    await logAudit(req.user._id, req.user.role, 'UPLOAD_REPORT', 'MedicalReport', report._id.toString(), {
      originalName: report.originalName,
      status: report.processingStatus,
    });

    res.status(201).json({
      success: true,
      message: 'Medical report uploaded and extracted successfully',
      report,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get report by ID
// @route   GET /api/reports/:id
const getReportById = async (req, res, next) => {
  try {
    const report = await MedicalReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Medical report not found' });
    }

    // Access control: only report owner or doctors
    if (req.user.role !== 'doctor' && report.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this report' });
    }

    res.status(200).json({
      success: true,
      report,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update/correct extracted findings in a report
// @route   PUT /api/reports/:id/correct
const updateExtractedData = async (req, res, next) => {
  try {
    const { findings, testCategory, clinicalSummary } = req.body;
    const report = await MedicalReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Medical report not found' });
    }

    if (req.user.role !== 'doctor' && report.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this report' });
    }

    if (findings) {
      report.extractedData.findings = findings.map(f => ({ ...f, isCorrectedByPatient: true }));
    }
    if (testCategory) {
      report.extractedData.testCategory = testCategory;
    }
    if (clinicalSummary) {
      report.extractedData.clinicalSummary = clinicalSummary;
    }
    report.processingStatus = 'Reviewed';

    await report.save();

    await logAudit(req.user._id, req.user.role, 'CORRECT_REPORT_DATA', 'MedicalReport', report._id.toString());

    res.status(200).json({
      success: true,
      message: 'Report findings updated successfully',
      report,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all reports for the logged in patient (or specified patient if doctor)
// @route   GET /api/reports
const getPatientReports = async (req, res, next) => {
  try {
    let patientId = req.user._id;
    if (req.user.role === 'doctor' && req.query.patientId) {
      patientId = req.query.patientId;
    }

    const reports = await MedicalReport.find({ patientId }).sort({ uploadedAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadReport,
  getReportById,
  updateExtractedData,
  getPatientReports,
};
