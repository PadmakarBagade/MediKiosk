const aiProvider = require('./aiProvider');

/**
 * Generate a doctor-facing clinical pre-consultation summary
 */
const generateDoctorFacingSummary = async (patientUser, consultationData, structuredData, reportsData = []) => {
  const age = patientUser.dateOfBirth 
    ? Math.floor((new Date() - new Date(patientUser.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
    : 'Not specified';
  const gender = patientUser.gender || 'Not specified';
  const name = patientUser.name || 'Patient';

  const complaint = consultationData.chiefComplaint || {};
  const problem = complaint.problem || 'None reported';
  const duration = complaint.onsetDuration || 'Not mentioned';
  const severity = complaint.severityScore ? `${complaint.severityScore}/10` : 'Not rated';
  const progression = complaint.progression || 'Not mentioned';
  const aggravating = complaint.aggravatingFactors || 'None identified';
  const relieving = complaint.relievingFactors || 'None identified';

  // Build the deterministic clinical pre-consultation summary text
  let summaryText = `==========================================================\n`;
  summaryText += `PATIENT PRE-CONSULTATION SUMMARY (CLINICIAN VIEW)\n`;
  summaryText += `==========================================================\n\n`;

  summaryText += `Patient: ${name}\n`;
  summaryText += `Age: ${age} | Gender: ${gender}\n\n`;

  summaryText += `## Chief Complaint [Source: Patient Questionnaire]\n`;
  summaryText += `Patient reports ${problem}. Duration: approximately ${duration}.\n`;
  summaryText += `Note: Further clinical examination and diagnostic correlation required.\n\n`;

  summaryText += `## History of Present Complaint [Source: Patient Questionnaire]\n`;
  summaryText += `• Onset / Duration: ${duration}\n`;
  summaryText += `• Severity Rating: ${severity}\n`;
  summaryText += `• Symptom Course: ${progression}\n`;
  summaryText += `• Aggravating Factors: ${aggravating}\n`;
  summaryText += `• Relieving Factors: ${relieving}\n\n`;

  if (Array.isArray(complaint.followUpQuestions) && complaint.followUpQuestions.length > 0) {
    const answered = complaint.followUpQuestions.filter((f) => f.answer && f.answer.trim());
    if (answered.length > 0) {
      summaryText += `## Adaptive Follow-up Responses [Source: AI Clarification Intake]\n`;
      answered.forEach((f) => {
        summaryText += `• Q: ${f.question}\n  A: ${f.answer}\n`;
      });
      summaryText += `\n`;
    }
  }

  summaryText += `## Known Medical Conditions [Source: Patient Questionnaire & AI Structuring]\n`;
  if (Array.isArray(structuredData.conditions) && structuredData.conditions.length > 0 && structuredData.conditions[0] !== 'Not mentioned') {
    structuredData.conditions.forEach((c) => {
      summaryText += `• ${c}\n`;
    });
  } else {
    summaryText += `• No chronic conditions reported by patient.\n`;
  }
  summaryText += `\n`;

  summaryText += `## Current Medications [Source: Patient Questionnaire]\n`;
  if (Array.isArray(structuredData.medications) && structuredData.medications.length > 0 && structuredData.medications[0].name !== 'Not mentioned') {
    structuredData.medications.forEach((m) => {
      summaryText += `• ${m.name} (Dose: ${m.dose || 'Not specified'}, Frequency: ${m.frequency || 'Not specified'}${m.reason ? `, Reason: ${m.reason}` : ''})\n`;
    });
  } else {
    summaryText += `• None reported / Not taking regular prescription medications.\n`;
  }
  summaryText += `\n`;

  summaryText += `## Allergies [Source: Patient Questionnaire - High Priority]\n`;
  if (Array.isArray(structuredData.allergies) && structuredData.allergies.length > 0 && structuredData.allergies[0].allergy !== 'No known allergies reported') {
    structuredData.allergies.forEach((a) => {
      summaryText += `• ${a.allergy} (${a.category || 'Medicine'}): Reaction - ${a.reaction || 'Unspecified'}\n`;
    });
  } else {
    summaryText += `• No known drug or food allergies reported.\n`;
  }
  summaryText += `\n`;

  summaryText += `## Previous Procedures / Hospitalizations [Source: Patient Questionnaire]\n`;
  if (Array.isArray(structuredData.procedures) && structuredData.procedures.length > 0 && structuredData.procedures[0].procedure !== 'Not mentioned') {
    structuredData.procedures.forEach((p) => {
      summaryText += `• ${p.procedure}: ${p.details || 'Not mentioned'}\n`;
    });
  } else {
    summaryText += `• No prior major surgical procedures reported.\n`;
  }
  summaryText += `\n`;

  summaryText += `## Relevant Report Findings [Source: Uploaded Reports / OCR Text Extraction]\n`;
  let hasReports = false;
  for (const rep of reportsData) {
    if (rep.extractedData && Array.isArray(rep.extractedData.findings) && rep.extractedData.findings.length > 0) {
      hasReports = true;
      summaryText += `Document: ${rep.originalName} (${rep.extractedData.testCategory || 'General'})\n`;
      rep.extractedData.findings.forEach((f) => {
        const flag = f.status !== 'Normal' ? ` [${f.status.toUpperCase()}]` : '';
        summaryText += `  - ${f.testName}: ${f.value} ${f.unit} (Ref: ${f.referenceRange})${flag}\n`;
      });
    }
  }
  if (!hasReports) {
    summaryText += `• No uploaded medical reports attached to this consultation session.\n`;
  }
  summaryText += `\n`;

  summaryText += `## Family History [Source: Patient Questionnaire]\n`;
  if (Array.isArray(consultationData.familyHistory) && consultationData.familyHistory.length > 0) {
    consultationData.familyHistory.forEach((f) => {
      summaryText += `• ${f.condition} in ${f.relation}\n`;
    });
  } else {
    summaryText += `• Non-contributory / None reported.\n`;
  }
  summaryText += `\n`;

  summaryText += `## Lifestyle [Source: Patient Questionnaire]\n`;
  const life = consultationData.lifestyle || {};
  summaryText += `• Smoking: ${life.smoking || 'Not mentioned'}\n`;
  summaryText += `• Alcohol: ${life.alcohol || 'Not mentioned'}\n`;
  summaryText += `• Physical Activity: ${life.exercise || 'Not mentioned'}\n`;
  summaryText += `• Sleep: ${life.sleepHours || 'Not mentioned'}\n`;
  summaryText += `• Diet: ${life.diet || 'Not mentioned'}\n`;
  summaryText += `• Occupation: ${life.occupation || 'Not mentioned'}\n\n`;

  summaryText += `## Information Requiring Verification [Source: AI Validation Check]\n`;
  if (Array.isArray(structuredData.verificationFlags) && structuredData.verificationFlags.length > 0) {
    structuredData.verificationFlags.forEach((v) => {
      summaryText += `• ⚠️ ${v}\n`;
    });
  } else {
    summaryText += `• Basic patient inputs are self-consistent.\n`;
  }
  summaryText += `\n`;

  summaryText += `----------------------------------------------------------\n`;
  summaryText += `IMPORTANT CLINICAL DISCLAIMER:\n`;
  summaryText += `AI-generated summary for clinician review. This information does not constitute a diagnosis or treatment recommendation. All clinical decisions, examination, and treatment planning remain the sole responsibility of the licensed medical practitioner.\n`;
  summaryText += `----------------------------------------------------------\n`;

  // If Gemini API is active, we can refine the clinical summary narrative
  if (aiProvider.hasExternalKey) {
    try {
      const prompt = `
Generate a structured, professional clinical pre-consultation summary from the following data:
Patient Profile: ${name}, Age: ${age}, Gender: ${gender}
Questionnaire details:
${JSON.stringify(consultationData, null, 2)}
Reports:
${JSON.stringify(reportsData.map(r => ({ name: r.originalName, findings: r.extractedData?.findings })), null, 2)}

Strict Rules:
1. Do NOT diagnose any disease (e.g. do not say "patient has myocardial infarction", say "patient reports chest discomfort; clinical evaluation required").
2. Do NOT prescribe any drugs or advise dosage alterations.
3. Clearly mark source tags: [Patient Questionnaire], [Uploaded Report OCR], [AI Extraction].
4. Include an "Information Requiring Verification" section.
5. End with the exact disclaimer: "AI-generated summary for clinician review. This information does not constitute a diagnosis or treatment recommendation."
`;
      const systemInstruction = 'You are a healthcare pre-consultation documentation assistant for registered medical practitioners.';
      const llmResult = await aiProvider.callGemini(prompt, systemInstruction);
      if (llmResult && llmResult.length > 100) {
        summaryText = llmResult;
      }
    } catch (e) {
      console.warn('[SummaryService] Using standard clinical rule summary:', e.message);
    }
  }

  return {
    doctorFacingText: summaryText,
    structuredData,
    generatedAt: new Date(),
    disclaimer: 'AI-generated summary for clinician review. This information does not constitute a diagnosis or treatment recommendation.',
  };
};

module.exports = {
  generateDoctorFacingSummary,
};
