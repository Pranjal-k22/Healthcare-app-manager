/**
 * HealthPulse LLM Schemas & Configuration Constants (Phase 10)
 * 
 * Enforces structured schema shapes, versioning constants, and valid enum states.
 */

const PRE_VISIT_PROMPT_VERSION = 'v1';
const POST_VISIT_PROMPT_VERSION = 'v1';

// Supported Urgency Levels (Normalized Title Case and Upper Case)
const VALID_URGENCY_LEVELS = ['Low', 'Medium', 'High', 'Emergency'];
const URGENCY_ENUM_MAP = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  emergency: 'Emergency',
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  EMERGENCY: 'Emergency',
};

// Maximum input string lengths to prevent local LLM compute exhaustion
const MAX_INPUT_LENGTHS = {
  symptoms: 2000,
  clinicalNotes: 5000,
  prescriptionText: 4000,
};

// Expected schema structures
const PRE_VISIT_SCHEMA = {
  type: 'object',
  required: ['urgency', 'chiefComplaint', 'suggestedQuestions'],
  properties: {
    urgency: {
      type: 'string',
      enum: ['Low', 'Medium', 'High', 'Emergency'],
    },
    chiefComplaint: {
      type: 'string',
      minLength: 3,
      maxLength: 500,
    },
    suggestedQuestions: {
      type: 'array',
      minItems: 3,
      maxItems: 3,
      items: {
        type: 'string',
        minLength: 5,
        maxLength: 300,
      },
    },
  },
};

const POST_VISIT_SCHEMA = {
  type: 'object',
  required: ['summary'],
  properties: {
    summary: {
      type: 'string',
      minLength: 10,
    },
  },
};

module.exports = {
  PRE_VISIT_PROMPT_VERSION,
  POST_VISIT_PROMPT_VERSION,
  VALID_URGENCY_LEVELS,
  URGENCY_ENUM_MAP,
  MAX_INPUT_LENGTHS,
  PRE_VISIT_SCHEMA,
  POST_VISIT_SCHEMA,
};
