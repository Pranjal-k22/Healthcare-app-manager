class LLMError extends Error {
  constructor(message, { code, retryable = false, cause } = {}) {
    super(message);
    this.name = 'LLMError';
    this.code = code || 'LLM_ERROR';
    this.retryable = retryable;
    if (cause) this.cause = cause;
  }
}

/** Ollama daemon unreachable (ECONNREFUSED) or DNS/host resolution failure. */
class LLMConnectionError extends LLMError {
  constructor(message = 'Could not reach the local LLM runtime', cause) {
    super(message, { code: 'LLM_CONNECTION_ERROR', retryable: true, cause });
    this.name = 'LLMConnectionError';
  }
}

/** Request exceeded the configured timeout (25-30s). */
class LLMTimeoutError extends LLMError {
  constructor(message = 'Local LLM request timed out', cause) {
    super(message, { code: 'LLM_TIMEOUT_ERROR', retryable: true, cause });
    this.name = 'LLMTimeoutError';
  }
}

/** Ollama responded but with a non-2xx HTTP status (e.g. model not pulled -> 404). */
class LLMProviderError extends LLMError {
  constructor(message = 'Local LLM runtime returned an error', { status, cause } = {}) {
    super(message, { code: 'LLM_PROVIDER_ERROR', retryable: status >= 500, cause });
    this.name = 'LLMProviderError';
    this.status = status;
  }
}

/** Model responded, but the text wasn't parseable JSON at all. */
class LLMParseError extends LLMError {
  constructor(message = 'Local LLM response was not valid JSON', cause) {
    super(message, { code: 'LLM_PARSE_ERROR', retryable: true, cause });
    this.name = 'LLMParseError';
  }
}

/** Response parsed as JSON but failed schema validation (missing fields, wrong enum, etc). */
class LLMValidationError extends LLMError {
  constructor(message = 'Local LLM response failed schema validation', { issues = [] } = {}) {
    super(message, { code: 'LLM_VALIDATION_ERROR', retryable: true });
    this.name = 'LLMValidationError';
    this.issues = issues;
  }
}

/** Post-visit specific: a prescribed medicine name is missing from the generated summary. */
class LLMHallucinationGuardError extends LLMError {
  constructor(message = 'Generated summary omitted a prescribed medicine', { missingMedicines = [] } = {}) {
    super(message, { code: 'LLM_HALLUCINATION_GUARD_ERROR', retryable: true });
    this.name = 'LLMHallucinationGuardError';
    this.missingMedicines = missingMedicines;
  }
}

/** All bounded retry attempts were exhausted. This is what llmService.js catches at the top level. */
class LLMExhaustedRetriesError extends LLMError {
  constructor(message = 'Local LLM failed after all retry attempts', { attempts = 0, lastError } = {}) {
    super(message, { code: 'LLM_EXHAUSTED_RETRIES', retryable: false, cause: lastError });
    this.name = 'LLMExhaustedRetriesError';
    this.attempts = attempts;
    this.lastError = lastError;
  }
}

module.exports = {
  LLMError,
  LLMBaseError: LLMError,
  LLMConnectionError,
  LLMTimeoutError,
  LLMProviderError,
  LLMResponseError: LLMProviderError,
  LLMParseError,
  LLMValidationError,
  LLMHallucinationGuardError,
  LLMExhaustedRetriesError,
};
