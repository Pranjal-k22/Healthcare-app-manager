// server/services/llm/geminiProvider.js
// Cloud LLM Provider for Google Gemini 1.5 Flash via standard REST API
// Used as high-reliability fallback when local Ollama is offline or times out.

const { LLMConnectionError, LLMTimeoutError, LLMProviderError } = require('./llmErrors');

const DEFAULT_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS || 20000);
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

/**
 * Sends a single generation request to Google Gemini API
 * @param {string|{system: string, user: string}} prompt
 * @param {{ timeoutMs?: number, model?: string, apiKey?: string }} [opts]
 * @returns {Promise<string>} raw model output text
 */
async function generate(prompt, opts = {}) {
  const apiKey = opts.apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new LLMProviderError('GEMINI_API_KEY is not configured in environment');
  }

  const model = opts.model || GEMINI_MODEL;
  const timeoutMs = opts.timeoutMs || DEFAULT_TIMEOUT_MS;

  let systemInstruction = '';
  let userText = '';

  if (typeof prompt === 'string') {
    userText = prompt;
  } else if (prompt && typeof prompt === 'object') {
    systemInstruction = prompt.system || '';
    userText = prompt.user || '';
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: userText }],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  };

  if (systemInstruction) {
    requestBody.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify(requestBody),
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new LLMTimeoutError(`Gemini request exceeded ${timeoutMs}ms timeout`, err);
    }
    throw new LLMConnectionError(`Could not reach Google Gemini API: ${err.message}`, err);
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    let cleanMessage = `Gemini API error HTTP ${response.status}`;
    try {
      const parsedErr = JSON.parse(errorBody);
      if (parsedErr?.error?.message) {
        if (response.status === 429) {
          cleanMessage = `Gemini API rate limit / quota exceeded (HTTP 429). Google free-tier quota reached. Please retry in a few moments or check Local Ollama.`;
        } else {
          cleanMessage = `Gemini API (${parsedErr.error.status || response.status}): ${parsedErr.error.message}`;
        }
      }
    } catch {
      cleanMessage = `Gemini API error HTTP ${response.status}: ${errorBody}`;
    }

    throw new LLMProviderError(cleanMessage, {
      status: response.status,
      cause: errorBody,
    });
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (typeof rawText !== 'string') {
    throw new LLMProviderError('Gemini API response missing candidates text', { status: response.status });
  }

  return rawText;
}

/** Checks whether a Gemini API key is configured. */
function isConfigured() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  return Boolean(apiKey && apiKey.trim());
}

module.exports = {
  generate,
  isConfigured,
  GEMINI_MODEL,
};
