// server/services/llm/geminiProvider.js
// Cloud LLM provider using Google Generative AI (Gemini 1.5 Flash).
// Provides sub-second latency, zero local VRAM overhead, and native JSON output.

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { LLMProviderError, LLMTimeoutError } = require('./llmErrors');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const TIMEOUT_MS = Number(process.env.LLM_TIMEOUT_MS || 15000);

let genAI = null;
let modelInstance = null;

function getModel() {
  if (!genAI) {
    if (!GEMINI_API_KEY) {
      throw new LLMProviderError('GEMINI_API_KEY environment variable is not configured', {
        status: 401,
        retryable: false,
      });
    }
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    modelInstance = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });
  }
  return modelInstance;
}

/**
 * Generate completion text using Google Gemini Flash.
 * @param {string} prompt
 * @param {object} [options]
 * @returns {Promise<string>}
 */
async function generate(prompt, options = {}) {
  const model = getModel();

  const generatePromise = (async () => {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (err) {
      throw new LLMProviderError(`Gemini API error: ${err.message}`, {
        status: err.status || 500,
        retryable: err.status === 429 || err.status >= 500,
      });
    }
  })();

  // Enforce timeout
  const timeoutPromise = new Promise((_, reject) => {
    const timer = setTimeout(() => {
      reject(
        new LLMTimeoutError(`Gemini request timed out after ${TIMEOUT_MS}ms`, {
          timeoutMs: TIMEOUT_MS,
        })
      );
    }, TIMEOUT_MS);
    if (timer.unref) timer.unref();
  });

  return Promise.race([generatePromise, timeoutPromise]);
}

/**
 * Checks if Gemini provider is configured and available.
 */
function isConfigured() {
  return Boolean(process.env.GEMINI_API_KEY);
}

module.exports = {
  generate,
  isConfigured,
  getModel,
};
