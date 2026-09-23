require('dotenv').config();
const mongoose = require('mongoose');
const ClinicalGuideline = require('../models/ClinicalGuideline');
const aiProvider = require('../services/ai/aiProvider');

const GUIDELINES_DATA = [
  {
    title: 'ICMR / WHO Outpatient Acute Chest Pain & Coronary Triage Protocol',
    category: 'cardiovascular',
    source: 'ICMR Standard Treatment Guidelines & WHO Emergency Triage 2024',
    guidelineCode: 'ICMR-CARD-OPD-01',
    summaryText: 'Outpatient evaluation of acute chest pain, tightness, or pressure. Requires immediate clarification of radiation to neck, jaw, or left arm, relationship to physical exertion, diaphoresis, dyspnea, and past history of coronary artery disease.',
    clinicalCriteria: [
      {
        parameter: 'Pain Character & Radiation',
        redFlagSign: 'Substernal pressure radiating to jaw, left arm, or back',
        investigationPrompt: 'Probe if pain radiates or feels squeezing/crushing',
      },
      {
        parameter: 'Associated Autonomic Symptoms',
        redFlagSign: 'Profuse cold sweating, dizziness, syncope, or vomiting',
        investigationPrompt: 'Ask about diaphoresis, palpitations, and lightheadedness',
      },
      {
        parameter: 'Exertional Correlation',
        redFlagSign: 'Worsens upon minimal exertion and relieved by rest or nitrates',
        investigationPrompt: 'Clarify if symptom began during rest or exertion',
      },
    ],
    recommendedFollowUpQuestions: [
      'Does the chest pain or tightness radiate to your left shoulder, arm, neck, or jaw?',
      'Did you experience any cold sweating, dizziness, nausea, or shortness of breath?',
      'Does the discomfort get worse when you walk or exert yourself, and improve with rest?',
    ],
  },
  {
    title: 'ICMR / WHO Acute Stroke & Focal Neurological Deficits Protocol',
    category: 'neurology',
    source: 'ICMR Guidelines for Management of Acute Ischemic Stroke & WHO PEN',
    guidelineCode: 'ICMR-NEURO-02',
    summaryText: 'Screening for acute focal neurological symptoms, sudden severe thunderclap headaches, speech difficulties, or visual field loss. Essential to record exact time of onset for potential thrombolysis window.',
    clinicalCriteria: [
      {
        parameter: 'Onset & Severity',
        redFlagSign: 'Sudden onset thunderclap headache reaching maximum intensity in seconds',
        investigationPrompt: 'Probe whether onset was instantaneous or gradual',
      },
      {
        parameter: 'FAST Neurological Criteria',
        redFlagSign: 'Facial drooping, unilateral arm weakness, slurred or unintelligible speech',
        investigationPrompt: 'Ask about arm or leg weakness, facial asymmetry, and speech clarity',
      },
      {
        parameter: 'Vision & Balance',
        redFlagSign: 'Sudden loss of vision in one eye, diplopia, or severe vertigo with ataxia',
        investigationPrompt: 'Clarify if patient experienced blurred vision or inability to walk straight',
      },
    ],
    recommendedFollowUpQuestions: [
      'Did the headache or weakness begin suddenly within seconds, or build up slowly over hours?',
      'Have you noticed any slurred speech, facial drooping, or weakness on one side of your body?',
      'Are you experiencing double vision, sudden vision loss, or difficulty balancing?',
    ],
  },
  {
    title: 'WHO Integrated Management of Adult Illness: Acute Respiratory Infections & Pneumonia',
    category: 'respiratory',
    source: 'WHO IMAI Guidelines & ICMR Respiratory Triage Protocol',
    guidelineCode: 'WHO-RESP-03',
    summaryText: 'Standardized assessment of cough, breathlessness, and respiratory distress. Differentiates self-limiting upper respiratory viral infections from pneumonia, acute bronchitis, or COPD exacerbations.',
    clinicalCriteria: [
      {
        parameter: 'Sputum & Hemoptysis',
        redFlagSign: 'Blood-streaked sputum or copious thick yellowish-green purulent phlegm',
        investigationPrompt: 'Inquire about phlegm production, color, and presence of blood',
      },
      {
        parameter: 'Dyspnea Grading',
        redFlagSign: 'Shortness of breath while talking, resting, or inability to complete sentences',
        investigationPrompt: 'Assess if breathing difficulty occurs at rest or on flat lying position',
      },
      {
        parameter: 'Pleuritic Chest Pain',
        redFlagSign: 'Sharp localized pain that sharply worsens upon inspiration or coughing',
        investigationPrompt: 'Ask if taking a deep breath triggers localized chest stabbing pain',
      },
    ],
    recommendedFollowUpQuestions: [
      'Is the cough dry, or producing phlegm/mucus, and have you noticed any traces of blood?',
      'Do you feel breathless when resting quietly, or only when you walk around?',
      'Do you get a sharp pain in your chest when you take a deep breath or cough?',
    ],
  },
  {
    title: 'ICMR Outpatient Acute Abdominal Pain & Gastrointestinal Triage',
    category: 'gastroenterology',
    source: 'ICMR Clinical Guidance for Common Outpatient Gastrointestinal Disorders',
    guidelineCode: 'ICMR-GI-04',
    summaryText: 'Clinical evaluation of acute or persistent abdominal pain. Aims to identify surgical emergencies (appendicitis, cholecystitis, perforation, bowel obstruction) versus functional dyspepsia or gastroenteritis.',
    clinicalCriteria: [
      {
        parameter: 'Pain Localization & Progression',
        redFlagSign: 'Periumbilical pain migrating to right lower quadrant with rigidity or rebound tenderness',
        investigationPrompt: 'Probe the exact starting location and subsequent migration of pain',
      },
      {
        parameter: 'Gastrointestinal Bleeding',
        redFlagSign: 'Vomiting blood (hematemesis) or dark tarry black stools (melena)',
        investigationPrompt: 'Screen for coffee-ground emesis or black stools',
      },
      {
        parameter: 'Obstruction Signs',
        redFlagSign: 'Absolute constipation (no flatus or stool) with abdominal distension and bilious vomiting',
        investigationPrompt: 'Ask about ability to pass flatus and bowel movements over the last 24 hours',
      },
    ],
    recommendedFollowUpQuestions: [
      'Where is the stomach pain most severe, and has it moved to your lower right side or back?',
      'Have you had episodes of vomiting, or noticed any dark/black colored stools?',
      'Is the discomfort worse before meals, right after eating, or when pressing on your abdomen?',
    ],
  },
  {
    title: 'WHO / ICMR Protocol for Acute Febrile Illness & Sepsis Warning',
    category: 'infectious_disease',
    source: 'WHO Guidelines for Febrile Illness in Tropical Settings & ICMR NVBDCP',
    guidelineCode: 'WHO-FEV-05',
    summaryText: 'Systematic triage for acute fever in primary and outpatient settings. Identifies danger signs of vector-borne infections (Dengue, Malaria), typhoid, urinary tract infection, or systemic sepsis.',
    clinicalCriteria: [
      {
        parameter: 'Fever Curve & Chills',
        redFlagSign: 'High-grade fever (>103°F) with shaking rigors or irregular spiking patterns',
        investigationPrompt: 'Inquire about fever measurements, chills, and responsiveness to antipyretics',
      },
      {
        parameter: 'Capillary & Bleeding Signs',
        redFlagSign: 'Petechial rash, spontaneous bleeding from gums or nose, or black stools',
        investigationPrompt: 'Check for skin spots, bruising, and mucosal bleeding',
      },
      {
        parameter: 'Altered Sensorium',
        redFlagSign: 'Lethargy, extreme drowsiness, confusion, or neck stiffness with fever',
        investigationPrompt: 'Ask if family members noticed confusion, disorientation, or stiff neck',
      },
    ],
    recommendedFollowUpQuestions: [
      'How many days have you had the fever, and is it accompanied by shaking chills or body sweating?',
      'Have you noticed any skin rash, small red spots, or bleeding from your gums or nose?',
      'Are you experiencing severe muscle aches, eye pain, persistent vomiting, or extreme fatigue?',
    ],
  },
  {
    title: 'ICMR Musculoskeletal Pain & Inflammatory Arthropathy Guidelines',
    category: 'musculoskeletal',
    source: 'ICMR Guidelines on Management of Rheumatoid & Osteoarthritis',
    guidelineCode: 'ICMR-MSK-06',
    summaryText: 'Outpatient evaluation of joint and soft tissue pain. Differentiates mechanical degenerative conditions from acute inflammatory arthritis, septic joint, or radiculopathy.',
    clinicalCriteria: [
      {
        parameter: 'Morning Stiffness Duration',
        redFlagSign: 'Morning joint stiffness lasting greater than 45 to 60 minutes (inflammatory)',
        investigationPrompt: 'Ask how long morning joint stiffness lasts before easing up',
      },
      {
        parameter: 'Acute Monoarthritis',
        redFlagSign: 'Hot, red, swollen single joint with severe restriction and fever (possible septic arthritis)',
        investigationPrompt: 'Check for localized heat, redness, and inability to bear weight',
      },
      {
        parameter: 'Neurological Compression',
        redFlagSign: 'Radiating pain below knee or elbow with tingling, numbness, or loss of bowel/bladder control',
        investigationPrompt: 'Screen for sciatica, cauda equina signs, and extremity numbness',
      },
    ],
    recommendedFollowUpQuestions: [
      'Does the joint have visible swelling, redness, or feel warm to the touch?',
      'Do you feel stiff when waking up in the morning, and how long does it take to loosen up?',
      'Does the pain shoot or radiate down your leg or arm, accompanied by tingling or numbness?',
    ],
  },
];

/**
 * Ingest clinical guidelines into MongoDB with 768-dimensional vector embeddings
 */
async function seedClinicalGuidelines() {
  console.log('[RAG Seed] Generating embeddings and ingesting WHO/ICMR clinical guidelines...');
  
  let inserted = 0;
  for (const g of GUIDELINES_DATA) {
    const textToEmbed = `${g.title}\n${g.summaryText}\n${g.clinicalCriteria.map(c => c.parameter + ': ' + c.redFlagSign).join('. ')}`;
    const embedding = await aiProvider.generateEmbedding(textToEmbed);

    await ClinicalGuideline.findOneAndUpdate(
      { guidelineCode: g.guidelineCode },
      {
        ...g,
        embedding,
      },
      { upsert: true, new: true }
    );
    inserted++;
  }

  console.log(`[RAG Seed] Successfully embedded and saved ${inserted} clinical guidelines into database.`);
}

module.exports = {
  seedClinicalGuidelines,
  GUIDELINES_DATA,
};

// Standalone execution if run directly
if (require.main === module) {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medikiosk';
  mongoose.connect(mongoUri).then(async () => {
    await seedClinicalGuidelines();
    await mongoose.disconnect();
    process.exit(0);
  }).catch((err) => {
    console.error('Seeding error:', err);
    process.exit(1);
  });
}
