const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getEmergencyInfo } = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/emergency', protect, getEmergencyInfo);

module.exports = router;
