const express = require('express');
const router = express.Router();
const {
  createConsultation,
  getMyConsultations,
  getConsultationById,
  updateConsultation,
} = require('../controllers/consultationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createConsultation);
router.get('/my', protect, getMyConsultations);
router.get('/:id', protect, getConsultationById);
router.put('/:id', protect, updateConsultation);

module.exports = router;
