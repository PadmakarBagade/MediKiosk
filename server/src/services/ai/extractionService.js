const aiProvider = require('./aiProvider');

/**
 * Deterministic fallback extractor if external LLM is not active or returns null
 */
const ruleBasedClinicalExtraction = (patientData, reportsData = []) => {
  const conditions = [];
  const medications = [];
  const allergies = [];
  const investigations = [];
  const procedures = [];
  const importantDates = [];
  const verificationFlags = [];

  // 1. Process patient medical history
  if (Array.isArray(patientData.medicalHistory)) {
    for (const item of patientData.medicalHistory) {
      if (item.hasCondition === 'Yes') {
        conditions.push(item.conditionName);
        if (item.details) {
          importantDates.push({ item: item.conditionName, date: item.details });
        }
      } else if (item.hasCondition === 'Not sure') {
        verificationFlags.push(`Patient is unsure about history of ${item.conditionName}`);
      }
    }
  }

  // 2. Process medications
  if (Array.isArray(patientData.medications)) {
    for (const med of patientData.medications) {
      if (med.isUnknown) {
        verificationFlags.push('Patient is taking an unverified/unknown medication');
      } else if (med.name && med.name.trim()) {
        medications.push({
          name: med.name.trim(),
          dose: med.dosage || 'Not mentioned',
          frequency: med.frequency || 'Not mentioned',
          reason: med.reason || 'Not mentioned',
        });
        if (!med.dosage || med.dosage === 'Not mentioned') {
          verificationFlags.push(`Dosage for medication ${med.name} not specified`);
        }
      }
    }
  }

  // 3. Process allergies
  if (Array.isArray(patientData.allergies)) {
    for (const alg of patientData.allergies) {
      if (alg.allergen && alg.allergen.trim()) {
        allergies.push({
          allergy: alg.allergen.trim(),
          category: alg.category || 'Medicine',
          reaction: alg.reaction || 'Not mentioned',
        });
      }
    }
  }

  // 4. Process investigations from uploaded reports
  for (const report of reportsData) {
    if (report.extractedData && Array.isArray(report.extractedData.findings)) {
      for (const finding of report.extractedData.findings) {
        investigations.push({
          testName: finding.testName,
          value: finding.value,
          unit: finding.unit || '',
          referenceRange: finding.referenceRange || 'Not mentioned',
          status: finding.status || 'Normal',
          sourceFile: report.originalName || report.fileName,
        });
      }
    }
  }

  // 5. Look for procedures mentioned in history
  if (Array.isArray(patientData.medicalHistory)) {
    const surgeryItem = patientData.medicalHistory.find(
      (m) => m.conditionName && m.conditionName.toLowerCase().includes('surger')
    );
    if (surgeryItem && surgeryItem.hasCondition === 'Yes') {
      procedures.push({
        procedure: 'Past Surgical Procedure',
        details: surgeryItem.details || 'Not mentioned',
      });
      if (!surgeryItem.details || surgeryItem.details === 'Not mentioned') {
        verificationFlags.push('Date and type of past surgical procedure requires clinician verification');
      }
    }

    const hospItem = patientData.medicalHistory.find(
      (m) => m.conditionName && m.conditionName.toLowerCase().includes('hospital')
    );
    if (hospItem && hospItem.hasCondition === 'Yes') {
      procedures.push({
        procedure: 'Previous Hospitalization',
        details: hospItem.details || 'Not mentioned',
      });
    }
  }

  return {
    conditions: conditions.length > 0 ? conditions : ['Not mentioned'],
    medications: medications.length > 0 ? medications : [{ name: 'Not mentioned', dose: 'Not mentioned', frequency: 'Not mentioned' }],
    allergies: allergies.length > 0 ? allergies : [{ allergy: 'No known allergies reported', reaction: 'None' }],
    investigations: investigations.length > 0 ? investigations : [{ testName: 'No lab reports available', value: 'N/A' }],
    procedures: procedures.length > 0 ? procedures : [{ procedure: 'Not mentioned' }],
    importantDates: importantDates.length > 0 ? importantDates : [{ item: 'Not mentioned', date: 'Not mentioned' }],
    verificationFlags: verificationFlags.length > 0 ? verificationFlags : ['All patient-provided details appear self-consistent.'],
  };
};

/**
 * Main Extract Structured Information method
 */
const extractStructuredMedicalInformation = async (patientData, reportsData = []) => {
  const ruleBasedResult = ruleBasedClinicalExtraction(patientData, reportsData);

  // If Gemini API is available, try to enhance entity normalization
  if (aiProvider.hasExternalKey) {
    try {
      const prompt = `
You are a medical information structuring assistant. 
Input patient questionnaire data:
${JSON.stringify(patientData, null, 2)}

Uploaded report findings:
${JSON.stringify(reportsData.map(r => ({ name: r.originalName, text: r.extractedText, findings: r.extractedData?.findings })), null, 2)}

Task: Extract medical information into a STRICT JSON object without making up or guessing missing data.
Use the phrase "Not mentioned" for any field not explicitly provided.
Do NOT diagnose diseases or prescribe treatments.

Schema:
{
  "conditions": ["string"],
  "medications": [{"name": "string", "dose": "string", "frequency": "string", "reason": "string"}],
  "allergies": [{"allergy": "string", "reaction": "string"}],
  "investigations": [{"testName": "string", "date": "string", "result": "string", "unit": "string", "referenceRange": "string"}],
  "procedures": [{"procedure": "string", "details": "string"}],
  "importantDates": [{"item": "string", "date": "string"}],
  "verificationFlags": ["string"]
}
`;
      const systemInstruction = 'You are an assist tool for healthcare professionals. Return ONLY valid JSON. Never diagnose diseases or prescribe medications.';
      const llmResponse = await aiProvider.callGemini(prompt, systemInstruction);
      if (llmResponse) {
        const cleanJson = llmResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        return parsed;
      }
    } catch (err) {
      console.warn('[ExtractionService] LLM parse error, returning clinical rule-based extraction:', err.message);
    }
  }

  return ruleBasedResult;
};

module.exports = {
  extractStructuredMedicalInformation,
  ruleBasedClinicalExtraction,
};
