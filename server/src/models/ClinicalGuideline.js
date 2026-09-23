const mongoose = require('mongoose');

/**
 * Clinical Guideline Schema
 * 
 * Stores evidence-based clinical protocols (WHO, ICMR OPD Standard Triage).
 * Used for Retrieval-Augmented Generation (RAG) and Atlas Vector Search
 * to ground LLM-generated patient follow-up questions and triage alerts.
 */
const clinicalGuidelineSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'cardiovascular',
        'neurology',
        'respiratory',
        'gastroenterology',
        'infectious_disease',
        'musculoskeletal',
        'emergency_triage',
        'general',
      ],
      index: true,
    },
    source: {
      type: String,
      default: 'WHO / ICMR Outpatient Clinical Triage Protocol',
    },
    guidelineCode: {
      type: String,
      default: '',
    },
    summaryText: {
      type: String,
      required: true,
    },
    clinicalCriteria: [
      {
        parameter: { type: String },
        redFlagSign: { type: String },
        investigationPrompt: { type: String },
      },
    ],
    recommendedFollowUpQuestions: [{ type: String }],
    embedding: {
      type: [Number],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ClinicalGuideline', clinicalGuidelineSchema);
