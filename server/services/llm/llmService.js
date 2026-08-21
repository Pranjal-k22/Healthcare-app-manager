// server/services/llm/llmService.js
// Cloud LLM Service using Google Gemini (@google/generative-ai) with graceful failure handling.

const geminiProvider = require('./geminiProvider');
const { AI_STATUS } = require('./schemas');

/**
 * FEATURE 1: PRE-VISIT SUMMARY GENERATION
 * @param {string} symptoms - Raw patient symptoms
 * @returns {Promise<{ status: 'READY'|'FAILED', data: object|null, promptVersion: string, error?: string }>}
 */
exports.generatePreVisitSummary = async (symptoms) => {
  const promptVersion = 'pre-visit-v1';
  if (!symptoms || !symptoms.trim()) {
    return {
      status: AI_STATUS.FAILED,
      promptVersion,
      data: null,
      error: 'No symptoms provided',
    };
  }

  const prompt = `
Analyse these symptoms and return: urgency level (Low / Medium / High), chief complaint, and three suggested questions for the doctor.
Symptoms: ${symptoms.trim()}

Output exactly as JSON:
{
  "urgency": "Low" | "Medium" | "High",
  "chiefComplaint": "string",
  "suggestedQuestions": ["string", "string", "string"]
}`;

  try {
    const rawText = await geminiProvider.generate(prompt);
    const parsed = JSON.parse(rawText);

    // Validate required fields
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Gemini returned non-object JSON');
    }

    const urgency = ['Low', 'Medium', 'High'].includes(parsed.urgency)
      ? parsed.urgency
      : 'Medium';
    const chiefComplaint = String(parsed.chiefComplaint || symptoms.substring(0, 120)).trim();
    const suggestedQuestions = Array.isArray(parsed.suggestedQuestions)
      ? parsed.suggestedQuestions.map((q) => String(q).trim()).filter(Boolean)
      : [];

    while (suggestedQuestions.length < 3) {
      suggestedQuestions.push('What symptoms or changes should prompt urgent clinical care?');
    }

    const cleanData = {
      urgency,
      chiefComplaint,
      suggestedQuestions: suggestedQuestions.slice(0, 3),
    };

    return {
      status: AI_STATUS.READY,
      data: cleanData,
      promptVersion,
    };
  } catch (error) {
    console.error('[Gemini LLM] Pre-visit summary error:', error.message);
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
 * @param {string} clinicalNotes - Doctor clinical observations and diagnosis
 * @param {Array|object} prescriptions - Prescribed medications
 * @returns {Promise<{ status: 'READY'|'FAILED', data: object|null, promptVersion: string, error?: string }>}
 */
exports.generatePostVisitSummary = async (clinicalNotes, prescriptions = []) => {
  const promptVersion = 'post-visit-v1';
  const notesText = clinicalNotes || 'Consultation completed.';
  const rxArray = Array.isArray(prescriptions) ? prescriptions : [prescriptions];
  const rxContext = JSON.stringify(rxArray);
  const context = `Notes: ${notesText}\nPrescriptions: ${rxContext}`;

  const prompt = `
Convert these clinical notes into a patient-friendly summary with medication schedule and follow-up steps: ${context}

Output exactly as JSON:
{
  "patientSummary": "string - plain-language explanation of visit and diagnosis",
  "medicationSchedule": ["string - when/how to take each prescribed medicine"],
  "followUpSteps": ["string - what the patient should do next"]
}`;

  try {
    const rawText = await geminiProvider.generate(prompt);
    const parsed = JSON.parse(rawText);

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Gemini returned non-object JSON');
    }

    const patientSummary = String(parsed.patientSummary || parsed.summary || notesText).trim();
    const medicationSchedule = Array.isArray(parsed.medicationSchedule)
      ? parsed.medicationSchedule.map((s) => String(s).trim()).filter(Boolean)
      : [];
    const followUpSteps = Array.isArray(parsed.followUpSteps)
      ? parsed.followUpSteps.map((s) => String(s).trim()).filter(Boolean)
      : [];

    // Medication Guardrail: Confirm prescribed medication names are present
    const combinedOutputText = `${patientSummary} ${medicationSchedule.join(' ')}`.toLowerCase();
    for (const rx of rxArray) {
      if (rx && rx.name) {
        const medName = String(rx.name).trim().toLowerCase();
        if (medName && !combinedOutputText.includes(medName)) {
          // If omitted by the model, append explicitly to medicationSchedule
          medicationSchedule.push(
            `${rx.name} ${rx.dosage || ''} - ${rx.frequency || 'As directed'} for ${rx.duration || 'prescribed duration'}`.trim()
          );
        }
      }
    }

    const cleanData = {
      patientSummary,
      medicationSchedule,
      followUpSteps,
      summary: patientSummary, // Backwards-compatible alias
    };

    return {
      status: AI_STATUS.READY,
      data: cleanData,
      promptVersion,
    };
  } catch (error) {
    console.error('[Gemini LLM] Post-visit summary error:', error.message);
    return {
      status: AI_STATUS.FAILED,
      promptVersion,
      error: error.message,
      data: null,
    };
  }
};
