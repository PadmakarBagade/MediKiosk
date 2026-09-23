const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const { logAudit } = require('../middleware/auditMiddleware');

const signToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'medikiosk_super_secure_jwt_secret_key_2026_dev',
    { expiresIn: '7d' }
  );
};

// @desc    Register a new user (Patient or Doctor)
// @route   POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = 'patient',
      phone,
      dateOfBirth,
      gender,
      emergencyContact,
      medicalSpecialization,
      medicalLicenseNumber,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'A user with this email address already exists' });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: ['doctor', 'patient'].includes(role) ? role : 'patient',
      phone: phone || '',
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender: gender || 'Prefer not to say',
      emergencyContact: emergencyContact || { name: '', relation: '', phone: '' },
      medicalSpecialization: role === 'doctor' ? (medicalSpecialization || 'General Physician') : '',
      medicalLicenseNumber: role === 'doctor' ? (medicalLicenseNumber || '') : '',
    });

    // Create baseline PatientProfile if patient
    if (user.role === 'patient') {
      await PatientProfile.create({
        userId: user._id,
        bloodGroup: 'Unknown',
        allergies: [],
        conditions: [],
        medications: [],
        surgeries: [],
        familyHistory: [],
        lifestyle: {},
      });
    }

    const token = signToken(user._id, user.role);

    // Audit log
    await logAudit(user._id, user.role, 'USER_REGISTERED', 'User', user._id.toString(), { email: user.email, role: user.role });

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({
      success: true,
      token,
      user: userObj,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = signToken(user._id, user.role);

    // Audit log
    await logAudit(user._id, user.role, 'USER_LOGIN', 'User', user._id.toString(), { email: user.email });

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      success: true,
      token,
      user: userObj,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get currently logged in user
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    let profile = null;

    if (user.role === 'patient') {
      profile = await PatientProfile.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      user,
      profile,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
