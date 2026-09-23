const aiProvider = require('./aiProvider');
const { searchRelevantGuidelines, formatGuidelinesForPrompt } = require('./ragGuidelineService');

/**
 * Fallback questions based on chief complaint symptom domain
 * Ensures immediate zero-downtime clinical follow-up even if external LLM API is unavailable.
 */
function getClinicalFallbackQuestions(chiefComplaintText) {
  const text = (chiefComplaintText || '').toLowerCase();

  if (text.includes('chest') || text.includes('heart') || text.includes('breath') || text.includes('palpitat')) {
    return [
      { id: 'q1', question: 'Does the pain or discomfort spread to your left arm, jaw, neck, or back?' },
      { id: 'q2', question: 'Does the breathlessness happen while resting, lying flat, or only during physical exertion?' },
      { id: 'q3', question: 'Are you experiencing any cold sweating, dizziness, nausea, or rapid heartbeat?' },
    ];
  }

  if (text.includes('head') || text.includes('migraine') || text.includes('dizz') || text.includes('vision')) {
    return [
      { id: 'q1', question: 'Did the headache begin suddenly like a thunderclap, or did it build up gradually?' },
      { id: 'q2', question: 'Are you experiencing nausea, sensitivity to bright lights, sound, or visual disturbances?' },
      { id: 'q3', question: 'Have you noticed any neck stiffness, facial weakness, numbness, or difficulty speaking?' },
    ];
  }

  if (text.includes('cough') || text.includes('fever') || text.includes('phlegm') || text.includes('cold') || text.includes('throat')) {
    return [
      { id: 'q1', question: 'Is the cough producing phlegm or mucus? If so, what color is it (clear, yellow, green, or blood-streaked)?' },
      { id: 'q2', question: 'Have you measured your body temperature, and do you experience chills or fever spikes?' },
      { id: 'q3', question: 'Are you experiencing any chest discomfort or shortness of breath when coughing?' },
    ];
  }

  if (text.includes('stomach') || text.includes('abdom') || text.includes('belly') || text.includes('vomit') || text.includes('diarrh') || text.includes('nausea')) {
    return [
      { id: 'q1', question: 'Where is the pain most intense (upper, lower, right side, or left side of your abdomen)?' },
      { id: 'q2', question: 'Is the discomfort related to meals (worse before eating, immediately after eating, or after spicy/fatty food)?' },
      { id: 'q3', question: 'Have you had vomiting, fever, or any noticeable change in bowel habits or stool color?' },
    ];
  }

  if (text.includes('pain') || text.includes('joint') || text.includes('knee') || text.includes('back') || text.includes('muscle') || text.includes('swell')) {
    return [
      { id: 'q1', question: 'How would you describe the pain (e.g., sharp, dull ache, burning, throbbing, or shooting)?' },
      { id: 'q2', question: 'Does the affected area have visible swelling, redness, warmth, or morning stiffness?' },
      { id: 'q3', question: 'Does resting improve the pain, or does it worsen after prolonged standing or walking?' },
    ];
  }

  if (text.includes('skin') || text.includes('rash') || text.includes('itch') || text.includes('allergy')) {
    return [
      { id: 'q1', question: 'Where did the rash or itching first start, and has it spread to other parts of your body?' },
      { id: 'q2', question: 'Have you started any new medications, foods, soaps, or cosmetic products recently?' },
      { id: 'q3', question: 'Is there any swelling of your lips, face, tongue, or difficulty breathing?' },
    ];
  }

  // Universal outpatient fallback
  return [
    { id: 'q1', question: 'How would you describe the exact nature or sensation of this problem?' },
    { id: 'q2', question: 'Have you noticed any other symptoms or bodily changes occurring alongside this?' },
    { id: 'q3', question: 'Have you previously experienced similar symptoms, or taken any medications for relief?' },
  ];
}

/**
 * Generate exactly 3 adaptive clinical follow-up questions from chief complaint,
 * grounded in WHO/ICMR clinical guidelines retrieved via Atlas Vector Search.
 *
 * @param {string} chiefComplaintText
 * @returns {Promise<{ questions: Array<{ id: string, question: string }>, groundedInGuidelines: Array<object> }>}
 */
async function generateFollowUpQuestions(chiefComplaintText) {
  const cleanText = (typeof chiefComplaintText === 'string' ? chiefComplaintText : chiefComplaintText?.problem || '').trim();

  if (!cleanText) {
    return {
      questions: getClinicalFallbackQuestions(''),
      groundedInGuidelines: [],
    };
  }

  // RAG Step: Retrieve top relevant WHO/ICMR clinical guidelines
  let relevantGuidelines = [];
  let guidelineGroundingText = '';
  try {
    relevantGuidelines = await searchRelevantGuidelines(cleanText, 2);
    if (relevantGuidelines.length > 0) {
      guidelineGroundingText = formatGuidelinesForPrompt(relevantGuidelines);
    }
  } catch (ragErr) {
    console.warn('[FollowUpService] RAG retrieval warning:', ragErr.message);
  }

  const formattedGroundedIn = relevantGuidelines.map((g) => ({
    title: g.title,
    category: g.category,
    source: g.source,
    guidelineCode: g.guidelineCode,
    score: g.score ? Number(g.score.toFixed(3)) : null,
  }));

  const prompt = `A patient in an outpatient clinic waiting room has entered the following chief complaint:
"${cleanText}"

${guidelineGroundingText ? `OFFICIAL CLINICAL GUIDELINES & PROTOCOLS FOR GROUNDING:
--------------------------------------------------------------------------------
${guidelineGroundingText}
--------------------------------------------------------------------------------
Based directly on the clinical guidelines above, generate exactly 3 concise, medically relevant follow-up questions to help the doctor better understand the symptom (such as probing for red-flag signs, radiation paths, duration, or triggers from the guideline protocols).` : `Generate exactly 3 concise, medically relevant follow-up questions to help the doctor better understand the symptom (such as symptom character/radiation, onset triggers, or associated red-flag signs).`}
The questions should be clear, polite, and understandable to a layperson.

Return ONLY a valid JSON array containing exactly 3 questions in this format:
[
  { "id": "q1", "question": "Question 1 text here" },
  { "id": "q2", "question": "Question 2 text here" },
  { "id": "q3", "question": "Question 3 text here" }
]
Do not wrap in markdown quotes if possible, output pure JSON.`;

  const systemInstruction = `You are a clinical triage assistant for a patient intake kiosk. Ground questions in evidence-based clinical protocols. Output only valid JSON without any markdown formatting or explanations.`;

  try {
    const rawResponse = await aiProvider.callGemini(prompt, systemInstruction);

    if (rawResponse) {
      // Strip markdown code fences if present (e.g. ```json ... ```)
      const sanitized = rawResponse.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(sanitized);

      if (Array.isArray(parsed) && parsed.length > 0) {
        const questions = parsed.slice(0, 3).map((item, idx) => {
          if (typeof item === 'string') {
            return { id: `q${idx + 1}`, question: item };
          }
          return {
            id: item.id || `q${idx + 1}`,
            question: item.question || item.text || String(item),
          };
        });

        return {
          questions,
          groundedInGuidelines: formattedGroundedIn,
        };
      }
    }
  } catch (err) {
    console.warn('[FollowUpService] Error parsing Gemini response, using clinical fallback:', err.message);
  }

  // Fallback to symptom-aware clinical rules
  return {
    questions: getClinicalFallbackQuestions(cleanText),
    groundedInGuidelines: formattedGroundedIn,
  };
}

module.exports = {
  generateFollowUpQuestions,
  getClinicalFallbackQuestions,
};
