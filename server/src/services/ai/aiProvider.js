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
}

module.exports = new AIProvider();
