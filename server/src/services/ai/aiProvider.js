const https = require('https');

/**
 * AI Provider Abstraction
 * Supports Google Gemini API when GEMINI_API_KEY is configured in .env.
 * Falls back to built-in clinical NLP engine when unconfigured or offline.
 */
class AIProvider {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.hasExternalKey = Boolean(this.apiKey && this.apiKey.trim().length > 10);
  }

  /**
   * Call Gemini 1.5 Flash / 2.0 Flash via standard HTTPS endpoint
   */
  async callGemini(prompt, systemInstruction = '') {
    if (!this.hasExternalKey) {
      return null;
    }

    return new Promise((resolve) => {
      const payload = JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        systemInstruction: systemInstruction ? {
          parts: [{ text: systemInstruction }]
        } : undefined,
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048,
        },
      });

      const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
        timeout: 10000,
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        res.on('end', () => {
          try {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              const json = JSON.parse(responseData);
              const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
              resolve(text || null);
            } else {
              console.warn(`[AIProvider] Gemini returned HTTP ${res.statusCode}. Falling back to internal engine.`);
              resolve(null);
            }
          } catch (e) {
            console.warn(`[AIProvider] Failed parsing Gemini response. Falling back to internal engine.`);
            resolve(null);
          }
        });
      });

      req.on('error', (err) => {
        console.warn(`[AIProvider] Network error calling Gemini (${err.message}). Using clinical engine fallback.`);
        resolve(null);
      });

      req.on('timeout', () => {
        req.destroy();
        console.warn('[AIProvider] Gemini request timed out. Using clinical engine fallback.');
        resolve(null);
      });

      req.write(payload);
      req.end();
    });
  }

  /**
   * Generate vector embeddings using Gemini text-embedding-004
   * Falls back to a deterministic 768-dimensional normalized vector when key is unconfigured or offline
   */
  async generateEmbedding(text) {
    if (!text || typeof text !== 'string') {
      return this.createLocalDeterministicEmbedding('', 768);
    }

    if (this.hasExternalKey) {
      try {
        const payload = JSON.stringify({
          model: 'models/text-embedding-004',
          content: {
            parts: [{ text: text.slice(0, 2048) }],
          },
        });

        const options = {
          hostname: 'generativelanguage.googleapis.com',
          path: `/v1beta/models/text-embedding-004:embedContent?key=${this.apiKey}`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
          },
          timeout: 8000,
        };

        const result = await new Promise((resolve) => {
          const req = https.request(options, (res) => {
            let buf = '';
            res.on('data', (c) => (buf += c));
            res.on('end', () => {
              try {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                  const data = JSON.parse(buf);
                  if (data.embedding?.values && Array.isArray(data.embedding.values)) {
                    return resolve(data.embedding.values);
                  }
                }
                resolve(null);
              } catch {
                resolve(null);
              }
            });
          });
          req.on('error', () => resolve(null));
          req.on('timeout', () => {
            req.destroy();
            resolve(null);
          });
          req.write(payload);
          req.end();
        });

        if (result) return result;
      } catch (err) {
        console.warn('[AIProvider] Gemini embedding error:', err.message);
      }
    }

    // Local deterministic pseudo-vector fallback (768 dimensions)
    return this.createLocalDeterministicEmbedding(text, 768);
  }

  createLocalDeterministicEmbedding(text, dimensions = 768) {
    const vector = new Array(dimensions).fill(0);
    const normalized = (text || '').toLowerCase();

    // Hash tokens into dimensions
    const words = normalized.split(/\W+/).filter(Boolean);
    if (words.length === 0) {
      vector[0] = 1.0;
      return vector;
    }

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      let hash = 0;
      for (let j = 0; j < word.length; j++) {
        hash = (hash * 31 + word.charCodeAt(j)) & 0xffffffff;
      }
      const idx = Math.abs(hash) % dimensions;
      vector[idx] += 1.0 / Math.sqrt(words.length);
    }

    // Unit normalize vector
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
    return vector.map((v) => Number((v / norm).toFixed(6)));
  }
}

module.exports = new AIProvider();
