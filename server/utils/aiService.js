// server/utils/aiService.js
// Standalone compatibility helper bridging into the resilient LLM pipeline.
// Supports Google Gemini 1.5 Flash Cloud API (@google/generative-ai) and local Ollama.

const {
  generatePreVisitSummary: llmPreVisit,
  generatePostVisitSummary: llmPostVisit,
} = require('../services/llm/llmService');

/**
 * Generates pre-visit doctor summary from patient symptoms.
 * @param {string} symptoms
 * @returns {Promise<{urgencyLevel: string, chiefComplaint: string, suggestedQuestions: string[], rawOutput?: string, status: 'success'|'failed'}>}
 */
async function generatePreVisitSummary(symptoms) {
  const result = await llmPreVisit(symptoms);
  if (result.status === 'READY' && result.data) {
    return {
      urgencyLevel: result.data.urgency || 'Medium',
      chiefComplaint: result.data.chiefComplaint || 'Symptoms submitted for clinical review.',
      suggestedQuestions: result.data.suggestedQuestions || [],
      rawOutput: JSON.stringify(result.data),
      status: 'success',
    };
  }

  return {
    urgencyLevel: result.data?.urgency || 'Unavailable',
    chiefComplaint: result.data?.chiefComplaint || 'Automated summary unavailable. Review raw intake symptoms.',
    suggestedQuestions: result.data?.suggestedQuestions || [],
    rawOutput: result.error || 'LLM generation failed',
    status: 'failed',
  };
}

/**
 * Generates patient-friendly post-visit summary from clinical notes.
 * @param {string} clinicalNotes
 * @param {Array|string} [prescription]
 * @returns {Promise<{patientSummary: string, medicationSchedule: string[], followUpSteps: string[], rawOutput?: string, status: 'success'|'failed'}>}
 */
async function generatePostVisitSummary(clinicalNotes, prescription = []) {
  const medicines = Array.isArray(prescription) ? prescription : [];
  const result = await llmPostVisit(clinicalNotes, medicines);

  if (result.status === 'READY' && result.data) {
    return {
      patientSummary: result.data.plainLanguageSummary || 'Consultation completed.',
      medicationSchedule: result.data.medicationSchedule || [],
      followUpSteps: result.data.lifestyleGuidance || [],
      rawOutput: JSON.stringify(result.data),
      status: 'success',
    };
  }

  return {
    patientSummary: result.data?.plainLanguageSummary || 'Clinical notes could not be converted automatically. Please refer to your prescription.',
    medicationSchedule: result.data?.medicationSchedule || [],
    followUpSteps: result.data?.lifestyleGuidance || [],
    rawOutput: result.error || 'LLM generation failed',
    status: 'failed',
  };
}

module.exports = {
  generatePreVisitSummary,
  generatePostVisitSummary,
};
