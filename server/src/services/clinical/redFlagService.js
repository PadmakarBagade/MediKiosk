/**
 * Red-Flag Clinical Detection Service
 * 
 * Simple rule-based screening engine to identify high-risk presentations
 * directly from the patient's chief complaint during pre-consultation intake.
 * Designed for immediate clinician alerting and triage prioritization in OPD/kiosks.
 */

const RED_FLAG_RULES = [
  {
    keywords: ['chest pain', 'breathless', 'shortness of breath', 'chest tightness', 'heart attack'],
    label: 'Possible cardiac emergency',
  },
  {
    keywords: ['severe headache', 'vision loss', 'slurred speech', 'facial droop', 'sudden weakness', 'paralysis'],
    label: 'Possible stroke symptoms',
  },
  {
    keywords: ['heavy bleeding', 'coughing blood', 'vomiting blood', 'blood in stool', 'rectal bleeding'],
    label: 'Active hemorrhage',
  },
  {
    keywords: ['unconscious', 'loss of consciousness', 'seizure', 'convulsions', 'fainted', 'syncope'],
    label: 'Altered sensorium or seizure activity',
  },
  {
    keywords: ['throat swelling', 'unable to breathe', 'choking', 'anaphylaxis', 'stridor'],
    label: 'Airway compromise or severe allergic reaction',
  },
  {
    keywords: ['severe abdominal pain', 'acute abdomen', 'rigid abdomen', 'excruciating stomach pain'],
    label: 'Possible acute abdomen / surgical emergency',
  },
  {
    keywords: ['suicidal', 'kill myself', 'self harm', 'end my life'],
    label: 'Psychiatric crisis / self-harm alert',
  },
];

/**
 * Checks chief complaint text against clinical red-flag rules.
 * 
 * @param {string|object} chiefComplaint - The problem string or chiefComplaint object
 * @returns {{ isRedFlag: boolean, matchedRules: string[] }}
 */
function checkRedFlags(chiefComplaint) {
  // Gracefully extract string whether caller passes problem string or chiefComplaint object
  const problemText = typeof chiefComplaint === 'string'
    ? chiefComplaint
    : (chiefComplaint?.problem || '');

  if (!problemText || typeof problemText !== 'string') {
    return {
      isRedFlag: false,
      matchedRules: [],
    };
  }

  const normalized = problemText.toLowerCase();
  const matchedRules = [];

  for (const rule of RED_FLAG_RULES) {
    const hasMatch = rule.keywords.some((kw) => normalized.includes(kw.toLowerCase()));
    if (hasMatch && !matchedRules.includes(rule.label)) {
      matchedRules.push(rule.label);
    }
  }

  return {
    isRedFlag: matchedRules.length > 0,
    matchedRules,
  };
}

module.exports = {
  checkRedFlags,
  RED_FLAG_RULES,
};
