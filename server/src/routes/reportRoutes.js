const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const {
  uploadReport,
  getReportById,
  updateExtractedData,
  getPatientReports,
} = require('../controllers/reportController');

router.post('/upload', protect, upload.single('file'), uploadReport);
router.get('/', protect, getPatientReports);
router.get('/:id', protect, getReportById);
router.put('/:id/correct', protect, updateExtractedData);

module.exports = router;
