const { extractStructuredMedicalInformation } = require('../services/ai/extractionService');
const { generateDoctorFacingSummary } = require('../services/ai/summaryService');

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

module.exports = {
  extractEntities,
  summarizeConsultation,
};
