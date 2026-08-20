const Appointment = require('../../models/Appointment');
const ClinicalRecord = require('../../models/ClinicalRecord');
const {
  buildPreVisitPrompt,
  buildPostVisitPrompt,
  PRE_VISIT_PROMPT_VERSION,
  POST_VISIT_PROMPT_VERSION,
  CLINICAL_SAFETY_SYSTEM_PROMPT,
} = require('./prompts');
const { validatePreVisitSummary, validatePostVisitSummary } = require('./validator');
const { generateCompletion } = require('./ollamaProvider');
const config = require('../../config/env');

/**
 * Safely parse JSON from raw LLM text (handles markdown code fences if any)
 * @param {string} text
 * @returns {object|null}
 */
const parseJsonFromText = (text) => {
  if (!text || typeof text !== 'string') return null;

  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch (e) {
    // Extract JSON substring between first { and last }
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (err) {
        return null;
      }
    }
    return null;
  }
};

/**
 * Generate Pre-Visit Summary for an appointment with 2-attempt bounded retry
 * @param {string} appointmentId
 * @param {string} symptoms
 * @param {number} maxRetries - Default 2 attempts
 * @returns {Promise<object|null>}
 */
const generatePreVisitSummary = async (appointmentId, symptoms, maxRetries = 2) => {
  if (!symptoms || !symptoms.trim()) {
    await Appointment.findByIdAndUpdate(appointmentId, {
      aiStatus: 'FAILED',
    });
    return null;
  }

  const prompt = buildPreVisitPrompt(symptoms.trim());
  let attempt = 0;
  const startTime = Date.now();

  while (attempt < maxRetries) {
    attempt++;
    try {
      const rawResponse = await generateCompletion({
        prompt,
        system: CLINICAL_SAFETY_SYSTEM_PROMPT,
        format: 'json',
        timeoutMs: 25000,
      });

      const parsed = parseJsonFromText(rawResponse);
      const validation = validatePreVisitSummary(parsed);

      if (validation.valid && validation.data) {
        const payload = {
          ...validation.data,
          meta: {
            model: config.OLLAMA_MODEL || 'llama3',
            promptVersion: PRE_VISIT_PROMPT_VERSION,
            generatedAt: new Date().toISOString(),
          },
        };

        const updated = await Appointment.findByIdAndUpdate(
          appointmentId,
          {
            preVisitSummary: payload,
            aiStatus: 'READY',
          },
          { new: true }
        );

        const durationMs = Date.now() - startTime;
        console.log(
          `[LLMService] Pre-visit summary generated (AppID: ${appointmentId}, Model: ${config.OLLAMA_MODEL || 'llama3'}, Version: ${PRE_VISIT_PROMPT_VERSION}, Duration: ${durationMs}ms, Attempt: ${attempt}/${maxRetries})`
        );
        return updated?.preVisitSummary || payload;
      } else {
        console.warn(
          `[LLMService] Pre-visit summary validation failed (Attempt ${attempt}/${maxRetries}): ${validation.error}`
        );
      }
    } catch (err) {
      console.error(
        `[LLMService] Pre-visit summary error (Attempt ${attempt}/${maxRetries}): ${err.message}`
      );
    }

    if (attempt < maxRetries) {
      // Exponential backoff (300ms, 600ms...)
      await new Promise((res) => setTimeout(res, attempt * 300));
    }
  }

  // Mark as FAILED on final attempt failure
  console.warn(
    `[LLMService] Pre-visit summary generation failed after ${maxRetries} attempts for appointment ${appointmentId}. Marking aiStatus=FAILED.`
  );
  await Appointment.findByIdAndUpdate(appointmentId, {
    aiStatus: 'FAILED',
  });
  return null;
};

/**
 * Generate Post-Visit Summary for a clinical record & prescription
 * @param {string} clinicalRecordId
 * @param {string} appointmentId
 * @param {string} clinicalNotes
 * @param {Array<object>} medicines
 * @param {number} maxRetries - Default 2 attempts
 * @returns {Promise<string|null>}
 */
const generatePostVisitSummary = async (
  clinicalRecordId,
  appointmentId,
  clinicalNotes,
  medicines = [],
  maxRetries = 2
) => {
  if (!clinicalNotes || !clinicalNotes.trim()) {
    if (clinicalRecordId) {
      await ClinicalRecord.findByIdAndUpdate(clinicalRecordId, { aiStatus: 'FAILED' });
    }
    return null;
  }

  // Format real prescription data into prompt payload to prevent hallucinations
  let formattedNotes = `Clinical Notes: ${clinicalNotes.trim()}`;
  if (Array.isArray(medicines) && medicines.length > 0) {
    formattedNotes += '\nPrescribed Medications:\n';
    medicines.forEach((m) => {
      formattedNotes += `- ${m.name}: ${m.dosage || ''}, ${m.frequency || ''}, ${m.duration || ''}. Instructions: ${m.instructions || ''}\n`;
    });
  } else {
    formattedNotes += '\nNo medications prescribed.';
  }

  const prompt = buildPostVisitPrompt(formattedNotes);
  let attempt = 0;
  const startTime = Date.now();

  while (attempt < maxRetries) {
    attempt++;
    try {
      const rawResponse = await generateCompletion({
        prompt,
        system: CLINICAL_SAFETY_SYSTEM_PROMPT,
        timeoutMs: 30000,
      });

      const validation = validatePostVisitSummary(rawResponse, medicines);

      if (validation.valid && validation.data) {
        if (clinicalRecordId) {
          await ClinicalRecord.findByIdAndUpdate(clinicalRecordId, {
            postVisitSummary: validation.data,
            aiStatus: 'READY',
          });
        }

        const durationMs = Date.now() - startTime;
        console.log(
          `[LLMService] Post-visit summary generated (RecordID: ${clinicalRecordId}, Model: ${config.OLLAMA_MODEL || 'llama3'}, Version: ${POST_VISIT_PROMPT_VERSION}, Duration: ${durationMs}ms, Attempt: ${attempt}/${maxRetries})`
        );
        return validation.data;
      } else {
        console.warn(
          `[LLMService] Post-visit summary validation failed (Attempt ${attempt}/${maxRetries}): ${validation.error}`
        );
      }
    } catch (err) {
      console.error(
        `[LLMService] Post-visit summary error (Attempt ${attempt}/${maxRetries}): ${err.message}`
      );
    }

    if (attempt < maxRetries) {
      // Exponential backoff (300ms, 600ms...)
      await new Promise((res) => setTimeout(res, attempt * 300));
    }
  }

  // Mark as FAILED on final attempt failure
  console.warn(
    `[LLMService] Post-visit summary generation failed after ${maxRetries} attempts for record ${clinicalRecordId}. Marking aiStatus=FAILED.`
  );
  if (clinicalRecordId) {
    await ClinicalRecord.findByIdAndUpdate(clinicalRecordId, {
      aiStatus: 'FAILED',
    });
  }
  return null;
};

module.exports = {
  generatePreVisitSummary,
  generatePostVisitSummary,
  parseJsonFromText,
};
