const mongoose = require('mongoose');

const patientProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown', ''],
      default: 'Unknown',
    },
    height: {
      type: Number, // in cm
      default: null,
    },
    weight: {
      type: Number, // in kg
      default: null,
    },
    allergies: [
      {
        allergen: { type: String, default: '' },
        reaction: { type: String, default: '' },
        severity: { type: String, enum: ['Mild', 'Moderate', 'Severe', 'Unknown'], default: 'Moderate' },
        category: { type: String, enum: ['Medicine', 'Food', 'Environmental', 'Other'], default: 'Medicine' },
      },
    ],
    conditions: [
      {
        name: { type: String, required: true },
        diagnosedYear: { type: String, default: '' },
        status: { type: String, enum: ['Active', 'Managed', 'Resolved'], default: 'Active' },
        notes: { type: String, default: '' },
      },
    ],
    medications: [
      {
        name: { type: String, required: true },
        dosage: { type: String, default: '' },
        frequency: { type: String, default: '' },
        purpose: { type: String, default: '' },
      },
    ],
    surgeries: [
      {
        procedure: { type: String, required: true },
        year: { type: String, default: '' },
        hospital: { type: String, default: '' },
      },
    ],
    familyHistory: [
      {
        condition: { type: String, required: true },
        relation: { type: String, default: '' },
      },
    ],
    lifestyle: {
      smoking: { type: String, default: 'Never' },
      alcohol: { type: String, default: 'Never' },
      exercise: { type: String, default: 'Sedentary' },
      sleepHours: { type: String, default: '7-8 hours' },
      diet: { type: String, default: 'Balanced' },
      occupation: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PatientProfile', patientProfileSchema);
