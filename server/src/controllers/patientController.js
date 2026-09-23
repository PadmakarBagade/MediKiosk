const PatientProfile = require('../models/PatientProfile');
const User = require('../models/User');
const { logAudit } = require('../middleware/auditMiddleware');

// @desc    Get current patient medical profile
// @route   GET /api/patients/profile
const getProfile = async (req, res, next) => {
  try {
    let profile = await PatientProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await PatientProfile.create({
        userId: req.user._id,
        bloodGroup: 'Unknown',
        allergies: [],
        conditions: [],
        medications: [],
        surgeries: [],
        familyHistory: [],
        lifestyle: {},
      });
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update patient medical profile
// @route   PUT /api/patients/profile
const updateProfile = async (req, res, next) => {
  try {
    const {
      bloodGroup,
      height,
      weight,
      allergies,
      conditions,
      medications,
      surgeries,
      familyHistory,
      lifestyle,
    } = req.body;

    let profile = await PatientProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = new PatientProfile({ userId: req.user._id });
    }

    if (bloodGroup !== undefined) profile.bloodGroup = bloodGroup;
    if (height !== undefined) profile.height = height;
    if (weight !== undefined) profile.weight = weight;
    if (allergies !== undefined) profile.allergies = allergies;
    if (conditions !== undefined) profile.conditions = conditions;
    if (medications !== undefined) profile.medications = medications;
    if (surgeries !== undefined) profile.surgeries = surgeries;
    if (familyHistory !== undefined) profile.familyHistory = familyHistory;
    if (lifestyle !== undefined) profile.lifestyle = lifestyle;

    await profile.save();

    await logAudit(req.user._id, req.user.role, 'UPDATE_PROFILE', 'PatientProfile', profile._id.toString());

    res.status(200).json({
      success: true,
      message: 'Medical profile updated successfully',
      profile,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get quick emergency info for the patient
// @route   GET /api/patients/emergency
const getEmergencyInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const profile = await PatientProfile.findOne({ userId: req.user._id });

    const emergencyData = {
      patientName: user.name,
      emergencyContact: user.emergencyContact || {},
      bloodGroup: profile ? profile.bloodGroup : 'Unknown',
      severeAllergies: profile ? profile.allergies.filter(a => a.severity === 'Severe' || a.severity === 'Moderate') : [],
      chronicConditions: profile ? profile.conditions : [],
      currentMedications: profile ? profile.medications : [],
    };

    res.status(200).json({
      success: true,
      emergencyData,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getEmergencyInfo,
};
