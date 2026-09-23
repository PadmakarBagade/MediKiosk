const ClinicalGuideline = require('../../models/ClinicalGuideline');
const aiProvider = require('./aiProvider');

/**
 * Calculates cosine similarity between two numerical vectors.
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dotProduct / denom;
}

/**
 * Searches for clinically relevant guideline protocols using Atlas Vector Search,
 * with seamless fallback to in-memory cosine similarity.
 *
 * @param {string} chiefComplaintText
 * @param {number} limit
 * @returns {Promise<Array<object>>}
 */
async function searchRelevantGuidelines(chiefComplaintText, limit = 2) {
  if (!chiefComplaintText || typeof chiefComplaintText !== 'string' || !chiefComplaintText.trim()) {
    return [];
  }

  const queryVector = await aiProvider.generateEmbedding(chiefComplaintText);

  // Strategy 1: Attempt MongoDB Atlas $vectorSearch (if Atlas Vector Index exists)
  try {
    const atlasResults = await ClinicalGuideline.aggregate([
      {
        $vectorSearch: {
          index: 'clinical_guidelines_vector_index',
          path: 'embedding',
          queryVector: queryVector,
          numCandidates: 15,
          limit: limit,
        },
      },
      {
        $project: {
          title: 1,
          category: 1,
          source: 1,
          summaryText: 1,
          clinicalCriteria: 1,
          recommendedFollowUpQuestions: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ]);

    if (Array.isArray(atlasResults) && atlasResults.length > 0) {
      return atlasResults;
    }
  } catch (atlasErr) {
    // Atlas $vectorSearch index not yet defined or running on local replica set
    // Fall back smoothly to Strategy 2 (In-memory Cosine Similarity)
  }

  // Strategy 2: In-memory Cosine Similarity Ranking across ingested guidelines
  try {
    const allGuidelines = await ClinicalGuideline.find({}).lean();
    if (!allGuidelines || allGuidelines.length === 0) {
      return [];
    }

    const ranked = allGuidelines
      .map((g) => ({
        ...g,
        score: cosineSimilarity(queryVector, g.embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return ranked;
  } catch (err) {
    console.warn('[RAG Guideline Service] Error ranking guidelines:', err.message);
    return [];
  }
}

/**
 * Formats retrieved clinical guidelines into prompt-friendly grounding context.
 *
 * @param {Array<object>} guidelines
 * @returns {string}
 */
function formatGuidelinesForPrompt(guidelines) {
  if (!Array.isArray(guidelines) || guidelines.length === 0) {
    return 'Standard WHO/ICMR general outpatient pre-consultation triage standards apply.';
  }

  return guidelines
    .map((g, idx) => {
      const criteria = (g.clinicalCriteria || [])
        .map((c) => `  - Parameter: ${c.parameter} | Red Flag Sign: ${c.redFlagSign} | Probing: ${c.investigationPrompt}`)
        .join('\n');

      const recommended = (g.recommendedFollowUpQuestions || [])
        .map((q) => `  - "${q}"`)
        .join('\n');

      return `[GUIDELINE ${idx + 1}: ${g.title} (${g.source})]\n` +
        `Summary: ${g.summaryText}\n` +
        (criteria ? `Key Clinical Red-Flags & Parameters:\n${criteria}\n` : '') +
        (recommended ? `Recommended Question Topics:\n${recommended}\n` : '');
    })
    .join('\n---\n');
}

module.exports = {
  searchRelevantGuidelines,
  formatGuidelinesForPrompt,
  cosineSimilarity,
};
