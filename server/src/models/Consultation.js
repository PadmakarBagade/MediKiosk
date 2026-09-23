const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['draft', 'pending_review', 'reviewed', 'archived'],
      default: 'pending_review',
    },
    redFlag: {
      type: Boolean,
      default: false,
      index: true,
    },
    redFlagReasons: [{ type: String }],
    kioskSession: {
      type: Boolean,
      default: false,
    },
    chiefComplaint: {
      problem: { type: String, default: '' },
      onsetDuration: { type: String, default: '' },
      progression: {
        type: String,
        enum: ['better', 'worse', 'same', 'fluctuating', 'not_specified'],
        default: 'not_specified',
      },
      severityScore: { type: Number, min: 1, max: 10, default: 5 },
      aggravatingFactors: { type: String, default: '' },
      relievingFactors: { type: String, default: '' },
    },
    medicalHistory: [
      {
        conditionName: { type: String, required: true },
        hasCondition: {
          type: String,
          enum: ['Yes', 'No', 'Not sure'],
          default: 'No',
        },
        details: { type: String, default: '' },
      },
    ],
    medications: [
      {
        name: { type: String, default: '' },
        dosage: { type: String, default: '' },
        frequency: { type: String, default: '' },
        reason: { type: String, default: '' },
        isUnknown: { type: Boolean, default: false },
      },
    ],
    allergies: [
      {
        allergen: { type: String, default: '' },
        category: {
          type: String,
          enum: ['Medicine', 'Food', 'Environmental', 'Other'],
          default: 'Medicine',
        },
        reaction: { type: String, default: '' },
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
      exercise: { type: String, default: 'Moderate' },
      sleepHours: { type: String, default: '7-8 hours' },
      diet: { type: String, default: 'Balanced' },
      occupation: { type: String, default: '' },
    },
    uploadedReports: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MedicalReport',
      },
    ],
    patientReviewed: {
      type: Boolean,
      default: true,
    },
    aiSummary: {
      doctorFacingText: { type: String, default: '' },
      structuredData: {
        conditions: [{ type: String }],
        medications: [{ type: Object }],
        allergies: [{ type: Object }],
        investigations: [{ type: Object }],
        procedures: [{ type: Object }],
        importantDates: [{ type: Object }],
        verificationFlags: [{ type: String }],
      },
      generatedAt: { type: Date, default: Date.now },
      disclaimer: {
        type: String,
        default: 'AI-generated summary for clinician review. This information does not constitute a diagnosis or treatment recommendation.',
      },
    },
    sourceProvenance: [
      {
        field: { type: String, required: true },
        sourceType: {
          type: String,
          enum: ['patient_entered', 'ocr_extracted', 'ai_extracted', 'doctor_verified'],
          required: true,
        },
        sourceDetail: { type: String, default: '' },
      },
    ],
    doctorNotes: {
      clinicalNotes: { type: String, default: '' },
      differentialDiagnosisConsiderations: { type: String, default: '' },
      recommendedNextSteps: { type: String, default: '' },
      reviewedAt: { type: Date, default: null },
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Consultation', consultationSchema);
