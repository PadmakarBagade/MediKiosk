const express = require('express');
const router = express.Router();
const {
  getDoctorDashboardStats,
  getConsultationsQueue,
  reviewConsultation,
  getPatientFullHistory,
  updateAiSummary,
  requestPatientAccess,
  verifyPatientAccess,
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/stats', protect, authorize('doctor'), getDoctorDashboardStats);
router.get('/consultations', protect, authorize('doctor'), getConsultationsQueue);
router.post('/consultations/:id/review', protect, authorize('doctor'), reviewConsultation);
router.put('/consultations/:id/summary', protect, authorize('doctor'), updateAiSummary);
router.post('/patients/:patientId/request-access', protect, authorize('doctor'), requestPatientAccess);
router.post('/patients/:patientId/verify-access', protect, authorize('doctor'), verifyPatientAccess);
router.get('/patients/:patientId/profile', protect, authorize('doctor'), getPatientFullHistory);

module.exports = router;
