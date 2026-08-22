// server/services/llm/llmService.js
// Hybrid Dual-Engine Clinical LLM Orchestrator:
// Executes Local Ollama (on-device) and Google Gemini (cloud) simultaneously in parallel
// via Promise.allSettled for dual output generation, verification, and resilience.

const ollamaProvider = require('./ollamaProvider');
const geminiProvider = require('./geminiProvider');
const {
  buildPreVisitPrompt,
  buildPostVisitPrompt,
  PRE_VISIT_PROMPT_VERSION,
  POST_VISIT_PROMPT_VERSION,
} = require('./prompts');
const { extractJson, validatePreVisit, validatePostVisit } = require('./validator');
const { AI_STATUS } = require('./schemas');

/**
 * Determines whether Gemini cloud execution is enabled in config.
 * Enabled when LLM_MODE is not 'local-only' and a Gemini API key is configured.
 */
function isGeminiEnabled() {
  const mode = (process.env.LLM_MODE || 'dual').toLowerCase();
  if (mode === 'local-only') return false;
  return geminiProvider.isConfigured();
}

/**
 * Executes a pre-visit summary prompt against Local Ollama.
 * @param {{ system: string, user: string }} prompt
 * @returns {Promise<{ status: 'READY'|'FAILED', data: object|null, error: string|null }>}
 */
async function executeOllamaPreVisit(prompt) {
  try {
    const rawText = await ollamaProvider.generate(prompt);
    const parsed = extractJson(rawText);
    const validated = validatePreVisit(parsed);
    return {
      status: AI_STATUS.READY,
      data: validated,
      error: null,
    };
  } catch (err) {
    console.error('[LLM Service: Ollama] Pre-visit generation error:', err.message);
    return {
      status: AI_STATUS.FAILED,
      data: null,
      error: err.message,
    };
  }
}

/**
 * Executes a pre-visit summary prompt against Google Gemini.
 * @param {{ system: string, user: string }} prompt
 * @returns {Promise<{ status: 'READY'|'FAILED'|'NOT_CONFIGURED', data: object|null, error: string|null }>}
 */
async function executeGeminiPreVisit(prompt) {
  if (!isGeminiEnabled()) {
    return {
      status: 'NOT_CONFIGURED',
      data: null,
      error: 'Gemini API is disabled or not configured in environment',
    };
  }

  try {
    const rawText = await geminiProvider.generate(prompt);
    const parsed = extractJson(rawText);
    const validated = validatePreVisit(parsed);
    return {
      status: AI_STATUS.READY,
      data: validated,
      error: null,
    };
  } catch (err) {
    console.error('[LLM Service: Gemini] Pre-visit generation error:', err.message);
    return {
      status: AI_STATUS.FAILED,
      data: null,
      error: err.message,
    };
  }
}

/**
 * Normalizes and validates raw post-visit model JSON into structured response.
 * @param {string} rawText
 * @param {Array} rxArray
 * @returns {object}
 */
function processPostVisitRawOutput(rawText, rxArray) {
  const parsed = extractJson(rawText);

  if (parsed.patientSummary && !parsed.summary) {
    parsed.summary = parsed.patientSummary;
  }
  if (Array.isArray(parsed.medicationSchedule)) {
    parsed.medicationSchedule = parsed.medicationSchedule.join('. ');
  }
  if (Array.isArray(parsed.followUpSteps)) {
    parsed.followUpSteps = parsed.followUpSteps.join('. ');
  }

  const validated = validatePostVisit(parsed, rxArray);

  const medicationScheduleList = Array.isArray(parsed.medicationSchedule)
    ? parsed.medicationSchedule
    : typeof parsed.medicationSchedule === 'string'
    ? parsed.medicationSchedule.split(/\.\s+|\n+/).filter(Boolean)
    : [];

  const followUpStepsList = Array.isArray(parsed.followUpSteps)
    ? parsed.followUpSteps
    : typeof parsed.followUpSteps === 'string'
    ? parsed.followUpSteps.split(/\.\s+|\n+/).filter(Boolean)
    : [];

  return {
    patientSummary: validated.summary,
    summary: validated.summary,
    medicationSchedule: medicationScheduleList.length > 0 ? medicationScheduleList : [validated.medicationSchedule],
    followUpSteps: followUpStepsList.length > 0 ? followUpStepsList : [validated.followUpSteps],
  };
}

/**
 * Executes a post-visit summary prompt against Local Ollama.
 * @param {{ system: string, user: string }} prompt
 * @param {Array} rxArray
 * @returns {Promise<{ status: 'READY'|'FAILED', data: object|null, error: string|null }>}
 */
async function executeOllamaPostVisit(prompt, rxArray) {
  try {
    const rawText = await ollamaProvider.generate(prompt);
    const cleanData = processPostVisitRawOutput(rawText, rxArray);
    return {
      status: AI_STATUS.READY,
      data: cleanData,
      error: null,
    };
  } catch (err) {
    console.error('[LLM Service: Ollama] Post-visit generation error:', err.message);
    return {
      status: AI_STATUS.FAILED,
      data: null,
      error: err.message,
    };
  }
}

/**
 * Executes a post-visit summary prompt against Google Gemini.
 * @param {{ system: string, user: string }} prompt
 * @param {Array} rxArray
 * @returns {Promise<{ status: 'READY'|'FAILED'|'NOT_CONFIGURED', data: object|null, error: string|null }>}
 */
async function executeGeminiPostVisit(prompt, rxArray) {
  if (!isGeminiEnabled()) {
    return {
      status: 'NOT_CONFIGURED',
      data: null,
      error: 'Gemini API is disabled or not configured in environment',
    };
  }

  try {
    const rawText = await geminiProvider.generate(prompt);
    const cleanData = processPostVisitRawOutput(rawText, rxArray);
    return {
      status: AI_STATUS.READY,
      data: cleanData,
      error: null,
    };
  } catch (err) {
    console.error('[LLM Service: Gemini] Post-visit generation error:', err.message);
    return {
      status: AI_STATUS.FAILED,
      data: null,
      error: err.message,
    };
  }
}

/**
 * FEATURE 1: SIMULTANEOUS DUAL-ENGINE PRE-VISIT SUMMARY GENERATION
 * Fires Local Ollama and Google Gemini in parallel via Promise.allSettled.
 *
 * @param {string} symptoms - Raw patient symptoms
 * @returns {Promise<{ status: 'READY'|'FAILED', ollama: object, gemini: object, promptVersion: string, data: object|null }>}
 */
exports.generatePreVisitSummary = async (symptoms) => {
  const promptVersion = PRE_VISIT_PROMPT_VERSION;

  if (!symptoms || !symptoms.trim()) {
    return {
      status: AI_STATUS.FAILED,
      promptVersion,
      ollama: { status: AI_STATUS.FAILED, data: null, error: 'No symptoms provided' },
      gemini: { status: AI_STATUS.FAILED, data: null, error: 'No symptoms provided' },
      data: null,
      error: 'No symptoms provided',
    };
  }

  const prompt = buildPreVisitPrompt(symptoms);

  // Execute both engines in parallel
  const [ollamaSettled, geminiSettled] = await Promise.allSettled([
    executeOllamaPreVisit(prompt),
    executeGeminiPreVisit(prompt),
  ]);

  const ollamaResult = ollamaSettled.status === 'fulfilled'
    ? ollamaSettled.value
    : { status: AI_STATUS.FAILED, data: null, error: ollamaSettled.reason?.message || 'Execution failed' };

  const geminiResult = geminiSettled.status === 'fulfilled'
    ? geminiSettled.value
    : { status: AI_STATUS.FAILED, data: null, error: geminiSettled.reason?.message || 'Execution failed' };

  const isAnyReady = ollamaResult.status === AI_STATUS.READY || geminiResult.status === AI_STATUS.READY;
  const overallStatus = isAnyReady ? AI_STATUS.READY : AI_STATUS.FAILED;

  // Primary data preference: Ollama if ready, otherwise Gemini
  const primaryData = ollamaResult.status === AI_STATUS.READY
    ? ollamaResult.data
    : geminiResult.status === AI_STATUS.READY
    ? geminiResult.data
    : null;

  return {
    status: overallStatus,
    promptVersion,
    ollama: ollamaResult,
    gemini: geminiResult,
    // Root level properties for seamless backward compatibility with existing views
    urgency: primaryData?.urgency || null,
    chiefComplaint: primaryData?.chiefComplaint || null,
    suggestedQuestions: primaryData?.suggestedQuestions || [],
    data: primaryData,
    error: overallStatus === AI_STATUS.FAILED ? (ollamaResult.error || geminiResult.error) : null,
  };
};

/**
 * FEATURE 2: SIMULTANEOUS DUAL-ENGINE POST-VISIT SUMMARY GENERATION
 * Fires Local Ollama and Google Gemini in parallel via Promise.allSettled.
 *
 * @param {string} clinicalNotes - Doctor clinical observations and findings
 * @param {Array} [prescriptions] - Prescribed medicines
 * @returns {Promise<{ status: 'READY'|'FAILED', ollama: object, gemini: object, promptVersion: string, data: object|null }>}
 */
exports.generatePostVisitSummary = async (clinicalNotes, prescriptions = []) => {
  const promptVersion = POST_VISIT_PROMPT_VERSION;
  const notesText = clinicalNotes || 'Consultation completed.';
  const rxArray = Array.isArray(prescriptions) ? prescriptions : prescriptions ? [prescriptions] : [];

  const prompt = buildPostVisitPrompt(notesText, rxArray);

  // Execute both engines in parallel
  const [ollamaSettled, geminiSettled] = await Promise.allSettled([
    executeOllamaPostVisit(prompt, rxArray),
    executeGeminiPostVisit(prompt, rxArray),
  ]);

  const ollamaResult = ollamaSettled.status === 'fulfilled'
    ? ollamaSettled.value
    : { status: AI_STATUS.FAILED, data: null, error: ollamaSettled.reason?.message || 'Execution failed' };

  const geminiResult = geminiSettled.status === 'fulfilled'
    ? geminiSettled.value
    : { status: AI_STATUS.FAILED, data: null, error: geminiSettled.reason?.message || 'Execution failed' };

  const isAnyReady = ollamaResult.status === AI_STATUS.READY || geminiResult.status === AI_STATUS.READY;
  const overallStatus = isAnyReady ? AI_STATUS.READY : AI_STATUS.FAILED;

  // Primary data preference: Ollama if ready, otherwise Gemini
  const primaryData = ollamaResult.status === AI_STATUS.READY
    ? ollamaResult.data
    : geminiResult.status === AI_STATUS.READY
    ? geminiResult.data
    : null;

  return {
    status: overallStatus,
    promptVersion,
    ollama: ollamaResult,
    gemini: geminiResult,
    // Root level properties for backward compatibility
    patientSummary: primaryData?.patientSummary || '',
    summary: primaryData?.summary || '',
    medicationSchedule: primaryData?.medicationSchedule || [],
    followUpSteps: primaryData?.followUpSteps || [],
    data: primaryData,
    error: overallStatus === AI_STATUS.FAILED ? (ollamaResult.error || geminiResult.error) : null,
  };
};

module.exports = {
  generatePreVisitSummary: exports.generatePreVisitSummary,
  generatePostVisitSummary: exports.generatePostVisitSummary,
  isGeminiEnabled,
};
