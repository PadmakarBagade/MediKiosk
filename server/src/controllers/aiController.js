const { extractStructuredMedicalInformation } = require('../services/ai/extractionService');
const { generateDoctorFacingSummary } = require('../services/ai/summaryService');
const { generateFollowUpQuestions } = require('../services/ai/followUpService');

// @desc    Extract structured clinical entities from payload
// @route   POST /api/ai/extract
const extractEntities = async (req, res, next) => {
  try {
    const { patientData, reportsData = [] } = req.body;
    const result = await extractStructuredMedicalInformation(patientData, reportsData);
    res.status(200).json({
      success: true,
      extracted: result,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Synthesize doctor-facing summary
// @route   POST /api/ai/summarize
const summarizeConsultation = async (req, res, next) => {
  try {
    const { patientUser, consultationData, structuredData, reportsData = [] } = req.body;
    const summary = await generateDoctorFacingSummary(
      patientUser || req.user,
      consultationData,
      structuredData,
      reportsData
    );
    res.status(200).json({
      success: true,
      summary,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Generate adaptive clinical follow-up questions
// @route   POST /api/ai/follow-up
const getFollowUpQuestions = async (req, res, next) => {
  try {
    const { chiefComplaint, problem } = req.body;
    const complaintText = (typeof chiefComplaint === 'string' ? chiefComplaint : chiefComplaint?.problem) || problem || '';

    const result = await generateFollowUpQuestions(complaintText);
    const questions = Array.isArray(result) ? result : result.questions;
    const groundedInGuidelines = Array.isArray(result?.groundedInGuidelines) ? result.groundedInGuidelines : [];

    res.status(200).json({
      success: true,
      count: questions.length,
      questions,
      groundedInGuidelines,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  extractEntities,
  summarizeConsultation,
  getFollowUpQuestions,
};
