/**
 * HealthPulse LLM Error Taxonomy (Phase 10)
 * 
 * Provides categorized error classes for predictable error handling
 * without leaking sensitive data or breaking core clinical transactions.
 */

class LLMBaseError extends Error {
  constructor(message, code = 'LLM_ERROR', statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

class LLMConnectionError extends LLMBaseError {
  constructor(message = 'Unable to connect to local Ollama runtime') {
    super(message, 'LLM_CONNECTION_ERROR', 503);
  }
}

class LLMTimeoutError extends LLMBaseError {
  constructor(message = 'Ollama generation request timed out') {
    super(message, 'LLM_TIMEOUT_ERROR', 504);
  }
}

class LLMValidationError extends LLMBaseError {
  constructor(message = 'LLM response failed schema or clinical safety validation') {
    super(message, 'LLM_VALIDATION_ERROR', 422);
  }
}

class LLMResponseError extends LLMBaseError {
  constructor(message = 'Malformed or unexpected response structure from Ollama') {
    super(message, 'LLM_RESPONSE_ERROR', 502);
  }
}

module.exports = {
  LLMBaseError,
  LLMConnectionError,
  LLMTimeoutError,
  LLMValidationError,
  LLMResponseError,
};
