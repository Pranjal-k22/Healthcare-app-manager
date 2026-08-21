// server/services/llm/llmService.js
// Dual-Engine Clinical LLM Service supporting both Google Gemini (@google/generative-ai)
// and Local Ollama (qwen2.5-coder / mistral / llama3) with automatic fallback and zero-hallucination guardrails.

const geminiProvider = require('./geminiProvider');
const ollamaProvider = require('./ollamaProvider');
const {
  buildPreVisitPrompt,
  buildPostVisitPrompt,
  PRE_VISIT_PROMPT_VERSION,
  POST_VISIT_PROMPT_VERSION,
} = require('./prompts');
const { extractJson, validatePreVisit, validatePostVisit } = require('./validator');
const { AI_STATUS } = require('./schemas');

/**
 * Unified dispatch helper: executes prompt against Gemini or Ollama based on LLM_PROVIDER
 * config with intelligent fallback when provider === 'auto' (the default).
 *
 * @param {{ system: string, user: string }} prompt
 * @param {'gemini'|'ollama'|'auto'} [forcedProvider]
 * @returns {Promise<{ rawText: string, providerUsed: string }>}
 */
async function executeDualEnginePrompt(prompt, forcedProvider) {
  const providerMode = (forcedProvider || process.env.LLM_PROVIDER || 'auto').toLowerCase();

  // Mode 1: Gemini explicitly requested
  if (providerMode === 'gemini') {
    const rawText = await geminiProvider.generate(
      `${prompt.system}\n\n${prompt.user}`
    );
    return { rawText, providerUsed: 'gemini' };
  }

  // Mode 2: Ollama explicitly requested
  if (providerMode === 'ollama') {
    const rawText = await ollamaProvider.generate(prompt);
    return { rawText, providerUsed: 'ollama' };
  }

  // Mode 3: 'auto' (Gemini first with Ollama fallback, or Ollama first if no Gemini key)
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());

  if (hasGeminiKey) {
    try {
      const rawText = await geminiProvider.generate(
        `${prompt.system}\n\n${prompt.user}`
      );
      return { rawText, providerUsed: 'gemini' };
    } catch (geminiErr) {
      console.warn(`[LLM Service] Gemini attempt failed (${geminiErr.message}), falling back to Local Ollama...`);
      try {
        const rawText = await ollamaProvider.generate(prompt);
        return { rawText, providerUsed: 'ollama' };
      } catch (ollamaErr) {
        throw new Error(`Both Gemini (${geminiErr.message}) and Local Ollama (${ollamaErr.message}) failed.`);
      }
    }
  } else {
    // No Gemini key configured; use Local Ollama directly
    const rawText = await ollamaProvider.generate(prompt);
    return { rawText, providerUsed: 'ollama' };
  }
}

/**
 * FEATURE 1: PRE-VISIT SUMMARY GENERATION
 * Supports both Google Gemini and Local Ollama.
 *
 * @param {string} symptoms - Raw patient symptoms
 * @param {'gemini'|'ollama'|'auto'} [provider]
 * @returns {Promise<{ status: 'READY'|'FAILED', data: object|null, promptVersion: string, provider?: string, error?: string }>}
 */
exports.generatePreVisitSummary = async (symptoms, provider) => {
  const promptVersion = PRE_VISIT_PROMPT_VERSION;

  if (!symptoms || !symptoms.trim()) {
    return {
      status: AI_STATUS.FAILED,
      promptVersion,
      data: null,
      error: 'No symptoms provided',
    };
  }

  const prompt = buildPreVisitPrompt(symptoms);

  try {
    const { rawText, providerUsed } = await executeDualEnginePrompt(prompt, provider);
    const parsed = extractJson(rawText);

    // Validate structured shape
    const validated = validatePreVisit(parsed);

    return {
      status: AI_STATUS.READY,
      data: validated,
      promptVersion,
      provider: providerUsed,
    };
  } catch (error) {
    console.error('[LLM Service] Pre-visit summary error:', error.message);
    return {
      status: AI_STATUS.FAILED,
      promptVersion,
      error: error.message,
      data: null,
    };
  }
};

/**
 * FEATURE 2: POST-VISIT SUMMARY GENERATION (WITH MEDICATION GUARDRAIL)
 * Supports both Google Gemini and Local Ollama.
 *
 * @param {string} clinicalNotes - Doctor clinical observations and findings
 * @param {Array} [prescriptions] - Prescribed medicines
 * @param {'gemini'|'ollama'|'auto'} [provider]
 * @returns {Promise<{ status: 'READY'|'FAILED', data: object|null, promptVersion: string, provider?: string, error?: string }>}
 */
exports.generatePostVisitSummary = async (clinicalNotes, prescriptions = [], provider) => {
  const promptVersion = POST_VISIT_PROMPT_VERSION;
  const notesText = clinicalNotes || 'Consultation completed.';
  const rxArray = Array.isArray(prescriptions) ? prescriptions : prescriptions ? [prescriptions] : [];

  const prompt = buildPostVisitPrompt(notesText, rxArray);

  try {
    const { rawText, providerUsed } = await executeDualEnginePrompt(prompt, provider);
    const parsed = extractJson(rawText);

    // Normalize property names (patientSummary vs summary)
    if (parsed.patientSummary && !parsed.summary) {
      parsed.summary = parsed.patientSummary;
    }
    if (Array.isArray(parsed.medicationSchedule)) {
      parsed.medicationSchedule = parsed.medicationSchedule.join('. ');
    }
    if (Array.isArray(parsed.followUpSteps)) {
      parsed.followUpSteps = parsed.followUpSteps.join('. ');
    }

    // Run Zero-Hallucination Medication Guardrail validation
    const validated = validatePostVisit(parsed, rxArray);

    // Format output with both array and string structures for maximum client flexibility
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

    const cleanData = {
      patientSummary: validated.summary,
      summary: validated.summary,
      medicationSchedule: medicationScheduleList.length > 0 ? medicationScheduleList : [validated.medicationSchedule],
      followUpSteps: followUpStepsList.length > 0 ? followUpStepsList : [validated.followUpSteps],
    };

    return {
      status: AI_STATUS.READY,
      data: cleanData,
      promptVersion,
      provider: providerUsed,
    };
  } catch (error) {
    console.error('[LLM Service] Post-visit summary error:', error.message);
    return {
      status: AI_STATUS.FAILED,
      promptVersion,
      error: error.message,
      data: null,
    };
  }
};

module.exports = {
  generatePreVisitSummary: exports.generatePreVisitSummary,
  generatePostVisitSummary: exports.generatePostVisitSummary,
  executeDualEnginePrompt,
};
