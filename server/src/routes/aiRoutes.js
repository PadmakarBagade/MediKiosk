const express = require('express');
const router = express.Router();
const {
  extractEntities,
  summarizeConsultation,
  getFollowUpQuestions,
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/extract', protect, extractEntities);
router.post('/summarize', protect, summarizeConsultation);
router.post('/follow-up', getFollowUpQuestions);

module.exports = router;
