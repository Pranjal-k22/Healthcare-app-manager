// server/services/llm/llmService.js
// Provider-agnostic orchestration layer. Everything above this (appointmentService.js,
// clinicalService.js) calls generatePreVisitSummary / generatePostVisitSummary and
// gets back either a validated payload or a FAILED status -- it never sees a thrown
// exception and never has its own transaction blocked by LLM behavior.

const ollamaProvider = require('./ollamaProvider');
const prompts = require('./prompts');
const validator = require('./validator');
const { AI_STATUS } = require('./schemas');
const { LLMExhaustedRetriesError } = require('./llmErrors');

const MAX_ATTEMPTS = Number(process.env.LLM_MAX_ATTEMPTS || 2); // bounded: 2 attempts total
const BACKOFF_BASE_MS = Number(process.env.LLM_BACKOFF_BASE_MS || 300); // attempt * 300ms

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Runs `attemptFn` up to MAX_ATTEMPTS times with exponential backoff between
 * attempts. Only retries errors marked `retryable` (LLMError subclasses set
 * this appropriately: connection/timeout/parse/validation errors retry;
 * a 4xx "model not found" style provider error does not).
 */
async function withBoundedRetry(attemptFn) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await attemptFn(attempt);
    } catch (err) {
      lastError = err;
      const canRetry = err?.retryable !== false && attempt < MAX_ATTEMPTS;
      if (!canRetry) break;
      await sleep(attempt * BACKOFF_BASE_MS);
    }
  }
  throw new LLMExhaustedRetriesError('Local LLM failed after all retry attempts', {
    attempts: MAX_ATTEMPTS,
    lastError,
  });
}

/**
 * Pre-visit clinical intake synthesis.
 * @param {string} symptoms - raw patient-submitted symptom text
 * @returns {Promise<{status: 'READY'|'FAILED', data?: object, promptVersion: string, error?: string}>}
 */
async function generatePreVisitSummary(symptoms) {
  const promptVersion = prompts.PRE_VISIT_PROMPT_VERSION;
  try {
    const result = await withBoundedRetry(async () => {
      const prompt = prompts.buildPreVisitPrompt(symptoms);
      const rawText = await ollamaProvider.generate(prompt);
      const parsed = validator.extractJson(rawText);
      return validator.validatePreVisit(parsed);
    });
    return { status: AI_STATUS.READY, data: result, promptVersion };
  } catch (err) {
    logLlmFailure('pre-visit', err);
    return { status: AI_STATUS.FAILED, promptVersion, error: err.message };
  }
}

/**
 * Post-visit patient-friendly summary with zero-hallucination medicine guard.
 * @param {string} clinicalNotes
 * @param {Array<{name:string,dosage:string,frequency:string,duration:string,instructions?:string}>} medicines
 * @returns {Promise<{status: 'READY'|'FAILED', data?: object, promptVersion: string, error?: string}>}
 */
async function generatePostVisitSummary(clinicalNotes, medicines) {
  const promptVersion = prompts.POST_VISIT_PROMPT_VERSION;
  try {
    const result = await withBoundedRetry(async () => {
      const prompt = prompts.buildPostVisitPrompt(clinicalNotes, medicines);
      const rawText = await ollamaProvider.generate(prompt);
      const parsed = validator.extractJson(rawText);
      return validator.validatePostVisit(parsed, medicines);
    });
    return { status: AI_STATUS.READY, data: result, promptVersion };
  } catch (err) {
    logLlmFailure('post-visit', err);
    return { status: AI_STATUS.FAILED, promptVersion, error: err.message };
  }
}

function logLlmFailure(kind, err) {
  // Centralized, non-throwing log point. Swap for a structured logger (pino/winston)
  // in production; kept as console here to match the rest of the reference stack.
  console.warn(`[llmService] ${kind} generation failed after retries: ${err?.code || err?.name}: ${err?.message}`);
}

module.exports = {
  generatePreVisitSummary,
  generatePostVisitSummary,
  withBoundedRetry,
};
