const config = require('../../config/env');
const {
  LLMConnectionError,
  LLMTimeoutError,
  LLMResponseError,
} = require('./llmErrors');
const { CLINICAL_SAFETY_SYSTEM_PROMPT } = require('./prompts');

/**
 * Ollama Local Provider (Phase 10)
 * Communicates with local Ollama daemon via REST API.
 */

/**
 * Make a generation request to Ollama
 * @param {object} options
 * @param {string} options.prompt - Prompt string
 * @param {string} [options.system] - System instructions
 * @param {string} [options.format] - 'json' or undefined
 * @param {number} [options.timeoutMs] - Timeout in milliseconds (default: 30000)
 * @returns {Promise<string>} - Raw text response from Ollama
 */
const generateCompletion = async ({
  prompt,
  system = CLINICAL_SAFETY_SYSTEM_PROMPT,
  format,
  timeoutMs = 30000,
}) => {
  const host = (config.OLLAMA_HOST || 'http://localhost:11434').replace(/\/+$/, '');
  const model = config.OLLAMA_MODEL || 'llama3';
  const url = `${host}/api/generate`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const payload = {
      model,
      prompt,
      system,
      stream: false,
      ...(format === 'json' && { format: 'json' }),
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new LLMResponseError(
        `Ollama HTTP Error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.response || '';
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new LLMTimeoutError(`Ollama request timed out after ${timeoutMs}ms`);
    }
    if (
      error.code === 'ECONNREFUSED' ||
      error.code === 'ENOTFOUND' ||
      error.message.includes('fetch failed')
    ) {
      throw new LLMConnectionError(
        `Failed to connect to local Ollama runtime at ${host}: ${error.message}`
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

module.exports = {
  generateCompletion,
};
