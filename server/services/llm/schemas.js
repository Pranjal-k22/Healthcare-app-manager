// server/services/llm/schemas.js
// Canonical schemas + enums for LLM outputs. Kept separate from validator.js so
// the shapes can be imported by Mongoose models/tests without pulling in the
// validation logic itself.

const URGENCY_LEVELS = ['Low', 'Medium', 'High'];

const AI_STATUS = {
  PENDING: 'PENDING',
  READY: 'READY',
  FAILED: 'FAILED',
};

// JSON-Schema-ish description of the pre-visit output, used both for documentation
// and as a lightweight reference the validator checks against field by field.
const PRE_VISIT_SCHEMA = {
  type: 'object',
  required: ['urgency', 'chiefComplaint', 'suggestedQuestions'],
  properties: {
    urgency: { type: 'string', enum: URGENCY_LEVELS },
    chiefComplaint: { type: 'string', minLength: 3 },
    suggestedQuestions: {
      type: 'array',
      minItems: 3,
      maxItems: 3,
      items: { type: 'string', minLength: 5 },
    },
  },
};

const POST_VISIT_SCHEMA = {
  type: 'object',
  required: ['summary', 'medicationSchedule', 'followUpSteps'],
  properties: {
    summary: { type: 'string', minLength: 10 },
    medicationSchedule: { type: 'string', minLength: 0 }, // may legitimately be empty if no meds
    followUpSteps: { type: 'string', minLength: 0 },
  },
};

module.exports = {
  URGENCY_LEVELS,
  AI_STATUS,
  PRE_VISIT_SCHEMA,
  POST_VISIT_SCHEMA,
};
