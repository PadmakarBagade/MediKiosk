const express = require('express');
const router = express.Router();
const { extractEntities, summarizeConsultation } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/extract', protect, extractEntities);
router.post('/summarize', protect, summarizeConsultation);

module.exports = router;
