// server/services/llm/llmService.js
// Provider-agnostic orchestration layer supporting both Cloud (Google Gemini 1.5 Flash)
// and Local (Ollama / Llama3 / Qwen2.5) with automatic fallback and zero-crash degradation.

const ollamaProvider = require('./ollamaProvider');
const geminiProvider = require('./geminiProvider');
const prompts = require('./prompts');
const validator = require('./validator');
const { AI_STATUS } = require('./schemas');
const { LLMExhaustedRetriesError } = require('./llmErrors');

const MAX_ATTEMPTS = Number(process.env.LLM_MAX_ATTEMPTS || 2);
const BACKOFF_BASE_MS = Number(process.env.LLM_BACKOFF_BASE_MS || 300);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Returns the active LLM provider (Gemini Cloud or Ollama Local)
 */
function getActiveProvider() {
  const configuredProvider = (process.env.LLM_PROVIDER || '').toLowerCase();

  if (configuredProvider === 'gemini' || (configuredProvider !== 'ollama' && geminiProvider.isConfigured())) {
    return geminiProvider;
  }
  return ollamaProvider;
}

/**
 * Runs `attemptFn` up to MAX_ATTEMPTS times with exponential backoff.
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
  throw new LLMExhaustedRetriesError('LLM generation failed after bounded retries', {
    attempts: MAX_ATTEMPTS,
    lastError,
  });
}

/**
 * Helper to generate text using the active provider with automatic secondary fallback.
 */
async function generateWithProvider(prompt) {
  const primary = getActiveProvider();
  try {
    return await primary.generate(prompt);
  } catch (err) {
    // If primary is Gemini and failed/unconfigured, try Ollama as secondary fallback (if different)
    if (primary === geminiProvider) {
      console.warn(`[llmService] Gemini primary failed (${err.message}). Attempting Ollama fallback...`);
      return await ollamaProvider.generate(prompt);
    }
    // If primary was Ollama and Gemini is configured, try Gemini fallback
    if (primary === ollamaProvider && geminiProvider.isConfigured()) {
      console.warn(`[llmService] Ollama primary failed (${err.message}). Attempting Gemini fallback...`);
      return await geminiProvider.generate(prompt);
    }
    throw err;
  }
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
      const rawText = await generateWithProvider(prompt);
      const parsed = validator.extractJson(rawText);
      return validator.validatePreVisit(parsed);
    });
    return { status: AI_STATUS.READY, data: result, promptVersion };
  } catch (err) {
    logLlmFailure('pre-visit', err);
    return {
      status: AI_STATUS.FAILED,
      promptVersion,
      error: err.message,
      data: {
        urgency: 'Medium',
        chiefComplaint: symptoms ? `Patient reported: ${symptoms.substring(0, 100)}` : 'Symptoms submitted for clinical review.',
        suggestedQuestions: [
          'What is the onset and duration of your main symptoms?',
          'Have you experienced these symptoms previously?',
          'Are you currently taking any prescription medications or supplements?',
        ],
      },
    };
  }
}

/**
 * Post-visit patient-friendly summary with zero-hallucination medicine guard.
 * @param {string} clinicalNotes
 * @param {Array<{name:string,dosage:string,frequency:string,duration:string,instructions?:string}>} medicines
 * @returns {Promise<{status: 'READY'|'FAILED', data?: object, promptVersion: string, error?: string}>}
 */
async function generatePostVisitSummary(clinicalNotes, medicines = []) {
  const promptVersion = prompts.POST_VISIT_PROMPT_VERSION;
  try {
    const result = await withBoundedRetry(async () => {
      const prompt = prompts.buildPostVisitPrompt(clinicalNotes, medicines);
      const rawText = await generateWithProvider(prompt);
      const parsed = validator.extractJson(rawText);
      return validator.validatePostVisit(parsed, medicines);
    });
    return { status: AI_STATUS.READY, data: result, promptVersion };
  } catch (err) {
    logLlmFailure('post-visit', err);
    return {
      status: AI_STATUS.FAILED,
      promptVersion,
      error: err.message,
      data: {
        plainLanguageSummary: clinicalNotes || 'Clinical consultation completed. Please review doctor notes.',
        medicationSchedule: medicines.map((m) => `${m.name} ${m.dosage} - ${m.frequency} for ${m.duration}`),
        lifestyleGuidance: ['Follow doctor recommended rest and recovery instructions.'],
        redFlags: ['Seek immediate emergency medical care if symptoms worsen significantly.'],
        followUpRecommended: false,
      },
    };
  }
}

function logLlmFailure(kind, err) {
  console.warn(`[llmService] ${kind} generation failed after retries: ${err?.code || err?.name}: ${err?.message}`);
}

module.exports = {
  generatePreVisitSummary,
  generatePostVisitSummary,
  withBoundedRetry,
  getActiveProvider,
};
