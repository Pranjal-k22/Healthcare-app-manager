// server/services/llm/validator.js
const { URGENCY_LEVELS } = require('./schemas');
const { LLMParseError, LLMValidationError, LLMHallucinationGuardError } = require('./llmErrors');

/**
 * Extracts a JSON object from raw model text. Local models sometimes wrap
 * output in ```json fences or add a stray sentence despite instructions --
 * this pulls out the first {...} block and parses it.
 */
function extractJson(rawText) {
  if (typeof rawText !== 'string' || !rawText.trim()) {
    throw new LLMParseError('Empty response from local LLM');
  }
  const fenced = rawText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : rawText;

  const firstBrace = candidate.indexOf('{');
  const lastBrace = candidate.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    throw new LLMParseError('No JSON object found in local LLM response');
  }

  const jsonSlice = candidate.slice(firstBrace, lastBrace + 1);
  try {
    return JSON.parse(jsonSlice);
  } catch (err) {
    throw new LLMParseError('Failed to parse JSON from local LLM response', err);
  }
}

/**
 * Validates the pre-visit payload: urgency enum, non-empty chief complaint,
 * and exactly 3 non-empty suggested questions.
 */
function validatePreVisit(parsed) {
  const issues = [];

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    issues.push('response is not an object');
  } else {
    if (!URGENCY_LEVELS.includes(parsed.urgency)) {
      issues.push(`urgency must be one of ${URGENCY_LEVELS.join('/')}, got: ${parsed.urgency}`);
    }
    if (typeof parsed.chiefComplaint !== 'string' || parsed.chiefComplaint.trim().length < 3) {
      issues.push('chiefComplaint must be a non-empty string (min 3 chars)');
    }
    if (
      !Array.isArray(parsed.suggestedQuestions) ||
      parsed.suggestedQuestions.length !== 3 ||
      parsed.suggestedQuestions.some((q) => typeof q !== 'string' || q.trim().length < 5)
    ) {
      issues.push('suggestedQuestions must be an array of exactly 3 non-empty strings (min 5 chars each)');
    }
  }

  if (issues.length) {
    throw new LLMValidationError('Pre-visit summary failed validation', { issues });
  }

  return {
    urgency: parsed.urgency,
    chiefComplaint: parsed.chiefComplaint.trim(),
    suggestedQuestions: parsed.suggestedQuestions.map((q) => q.trim()),
  };
}

/**
 * Validates the post-visit payload shape, THEN runs the zero-hallucination
 * guardrail: every prescribed medicine name must literally appear (case-insensitive,
 * substring match) somewhere in the combined summary text. This is the hard
 * safety gate from the spec -- if the model drops or renames a drug, the whole
 * generation is rejected rather than persisted.
 */
function validatePostVisit(parsed, prescribedMedicines = []) {
  const issues = [];

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    issues.push('response is not an object');
  } else {
    if (typeof parsed.summary !== 'string' || parsed.summary.trim().length < 10) {
      issues.push('summary must be a non-empty string (min 10 chars)');
    }
    if (typeof parsed.medicationSchedule !== 'string') {
      issues.push('medicationSchedule must be a string');
    }
    if (typeof parsed.followUpSteps !== 'string') {
      issues.push('followUpSteps must be a string');
    }
  }

  if (issues.length) {
    throw new LLMValidationError('Post-visit summary failed validation', { issues });
  }

  const combinedText = `${parsed.summary} ${parsed.medicationSchedule} ${parsed.followUpSteps}`.toLowerCase();

  const missingMedicines = (prescribedMedicines || [])
    .map((m) => (typeof m === 'string' ? m : m?.name))
    .filter(Boolean)
    .filter((name) => !combinedText.includes(name.trim().toLowerCase()));

  if (missingMedicines.length > 0) {
    throw new LLMHallucinationGuardError(
      `Generated summary is missing ${missingMedicines.length} prescribed medicine(s)`,
      { missingMedicines }
    );
  }

  return {
    summary: parsed.summary.trim(),
    medicationSchedule: parsed.medicationSchedule.trim(),
    followUpSteps: parsed.followUpSteps.trim(),
  };
}

module.exports = {
  extractJson,
  validatePreVisit,
  validatePostVisit,
};
