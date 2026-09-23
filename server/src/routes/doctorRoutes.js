const express = require('express');
const router = express.Router();
const {
  getDoctorDashboardStats,
  getConsultationsQueue,
  reviewConsultation,
  getPatientFullHistory,
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/stats', protect, authorize('doctor'), getDoctorDashboardStats);
router.get('/consultations', protect, authorize('doctor'), getConsultationsQueue);
router.post('/consultations/:id/review', protect, authorize('doctor'), reviewConsultation);
router.get('/patients/:patientId/profile', protect, authorize('doctor'), getPatientFullHistory);

module.exports = router;
