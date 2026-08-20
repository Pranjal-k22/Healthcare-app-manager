/**
 * HealthPulse LLM Response Validators (Phase 10)
 * 
 * Enforces strict schema rules for pre-visit summaries and zero-hallucination
 * medicine presence checks for post-visit summaries.
 */

const { VALID_URGENCY_LEVELS, URGENCY_ENUM_MAP } = require('./schemas');
const { LLMValidationError } = require('./llmErrors');

/**
 * Validate Pre-Visit JSON response from LLM
 * Expected format:
 * {
 *   "urgency": "Low" | "Medium" | "High" | "Emergency",
 *   "chiefComplaint": string,
 *   "suggestedQuestions": [string, string, string] // exactly 3
 * }
 * @param {any} parsedData
 * @returns {{ valid: boolean, data?: object, error?: string }}
 */
const validatePreVisitSummary = (parsedData) => {
  if (!parsedData || typeof parsedData !== 'object' || Array.isArray(parsedData)) {
    return { valid: false, error: 'Pre-visit summary response must be a JSON object' };
  }

  const { urgency, chiefComplaint, suggestedQuestions } = parsedData;

  // 1. Validate urgency against allowed enum
  if (!urgency || typeof urgency !== 'string') {
    return { valid: false, error: 'Urgency level is required as a string' };
  }

  const normalizedUrgency = URGENCY_ENUM_MAP[urgency.trim().toLowerCase()] || URGENCY_ENUM_MAP[urgency.trim().toUpperCase()];

  if (!normalizedUrgency || !VALID_URGENCY_LEVELS.includes(normalizedUrgency)) {
    return {
      valid: false,
      error: `Urgency must be one of: ${VALID_URGENCY_LEVELS.join(', ')}. Got: ${urgency}`,
    };
  }

  // 2. Validate chiefComplaint
  if (!chiefComplaint || typeof chiefComplaint !== 'string' || !chiefComplaint.trim()) {
    return { valid: false, error: 'chiefComplaint must be a non-empty string' };
  }

  // 3. Validate suggestedQuestions (Hard constraint: exactly 3 non-empty strings)
  if (!Array.isArray(suggestedQuestions)) {
    return { valid: false, error: 'suggestedQuestions must be an array' };
  }

  if (suggestedQuestions.length !== 3) {
    return {
      valid: false,
      error: `suggestedQuestions must contain exactly 3 questions. Got: ${suggestedQuestions.length}`,
    };
  }

  const validQuestions = suggestedQuestions.every(
    (q) => typeof q === 'string' && q.trim().length > 0
  );

  if (!validQuestions) {
    return { valid: false, error: 'All 3 suggestedQuestions must be non-empty strings' };
  }

  return {
    valid: true,
    data: {
      urgency: normalizedUrgency,
      chiefComplaint: chiefComplaint.trim(),
      suggestedQuestions: suggestedQuestions.map((q) => q.trim()),
    },
  };
};

/**
 * Validate Post-Visit Summary text
 * HARD RULE: Validate the response contains all prescribed medicine names before saving;
 * if any is missing, treat as a validation failure, not a partial success.
 * @param {string} summaryText
 * @param {Array<{ name: string, dosage?: string, frequency?: string, duration?: string }>} medicines
 * @returns {{ valid: boolean, data?: string, error?: string }}
 */
const validatePostVisitSummary = (summaryText, medicines = []) => {
  if (!summaryText || typeof summaryText !== 'string' || !summaryText.trim()) {
    return { valid: false, error: 'Post-visit summary must be a non-empty string' };
  }

  const trimmedText = summaryText.trim();
  const lowerText = trimmedText.toLowerCase();

  // Check that EVERY medicine name in the prescription is mentioned in the output
  if (Array.isArray(medicines) && medicines.length > 0) {
    for (const med of medicines) {
      if (!med || !med.name) continue;
      const medName = med.name.trim().toLowerCase();
      if (!lowerText.includes(medName)) {
        return {
          valid: false,
          error: `Post-visit summary failed validation: Prescribed medicine "${med.name}" is missing from the generated summary.`,
        };
      }
    }
  }

  return {
    valid: true,
    data: trimmedText,
  };
};

module.exports = {
  validatePreVisitSummary,
  validatePostVisitSummary,
};
