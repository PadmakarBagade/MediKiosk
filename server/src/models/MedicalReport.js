const mongoose = require('mongoose');

const medicalReportSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    consultationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consultation',
      default: null,
    },
    fileName: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    extractedText: {
      type: String,
      default: '',
    },
    extractedData: {
      testCategory: { type: String, default: 'General Medical Report' },
      findings: [
        {
          testName: { type: String, required: true },
          value: { type: String, required: true },
          unit: { type: String, default: '' },
          referenceRange: { type: String, default: '' },
          status: {
            type: String,
            enum: ['Normal', 'Abnormal', 'High', 'Low', 'Critical', 'Unspecified'],
            default: 'Normal',
          },
          isCorrectedByPatient: { type: Boolean, default: false },
        },
      ],
      clinicalSummary: { type: String, default: '' },
    },
    processingStatus: {
      type: String,
      enum: ['Uploading', 'Processing', 'Extracted', 'Reviewed', 'Failed'],
      default: 'Processing',
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MedicalReport', medicalReportSchema);
