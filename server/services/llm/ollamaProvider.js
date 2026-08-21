// server/services/llm/ollamaProvider.js
// Thin HTTP client for the local Ollama daemon. Knows nothing about prompts,
// schemas, or retries -- just "send this chat request, get text back, respect
// the timeout." Uses global fetch (Node 18+, matches the stated runtime requirement).

const { LLMConnectionError, LLMTimeoutError, LLMProviderError } = require('./llmErrors');

const OLLAMA_HOST =
  process.env.OLLAMA_BASE_URL ||
  process.env.OLLAMA_HOST ||
  'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5-coder:7b';
const DEFAULT_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS || 28000); // 25-30s per spec


/**
 * Sends a single chat completion request to Ollama and returns the raw text.
 * @param {{system: string, user: string}} prompt
 * @param {{timeoutMs?: number, model?: string}} [opts]
 * @returns {Promise<string>} raw model output text
 */
async function generate({ system, user }, opts = {}) {
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const model = opts.model ?? OLLAMA_MODEL;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        stream: false,
        format: 'json',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        options: {
          temperature: 0.2, // low temperature: this is extraction/summarization, not creative writing
        },
      }),
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new LLMTimeoutError(`Ollama request exceeded ${timeoutMs}ms timeout`, err);
    }
    // fetch throws TypeError on connection refused / DNS failure
    throw new LLMConnectionError(`Could not reach Ollama at ${OLLAMA_HOST}`, err);
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new LLMProviderError(`Ollama responded with HTTP ${response.status}`, {
      status: response.status,
      cause: body,
    });
  }

  const data = await response.json();
  // Ollama /api/chat non-streaming shape: { message: { role, content }, ... }
  const text = data?.message?.content;
  if (typeof text !== 'string') {
    throw new LLMProviderError('Ollama response missing message.content', { status: response.status });
  }
  return text;
}

/** Lightweight health check used by /api/health and startup diagnostics. */
async function isAvailable() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${OLLAMA_HOST}/api/tags`, { signal: controller.signal });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

module.exports = {
  generate,
  isAvailable,
  OLLAMA_HOST,
  OLLAMA_MODEL,
};
