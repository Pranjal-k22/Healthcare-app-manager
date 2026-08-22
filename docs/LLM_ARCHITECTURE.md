# Local LLM Architecture & Safety Guardrails (Phase 10)

## 1. Architectural Overview

HealthPulse integrates a local Ollama LLM strictly as an **explanation and clinical-assistance layer**, never as an authoritative clinical decision-maker or prescriber.

```text
React (Client)
      │
      ▼  (HTTP REST API with JWT Bearer Auth)
Express Controllers & Services (appointmentService.js / clinicalService.js)
      │  (Fire-and-forget asynchronous triggers)
      ▼
server/services/llm/
  ├── llmService.js       (Orchestrator: 2-attempt bounded retry, exponential backoff, never throws)
  ├── ollamaProvider.js   (Thin HTTP client for Ollama /api/chat with AbortController timeout)
  ├── prompts.js          (Verbatim prompt templates + system safety directive + sanitization)
  ├── schemas.js          (AI_STATUS enum, URGENCY_LEVELS, JSON schema contracts)
  ├── validator.js        (JSON extraction, schema validation, zero-hallucination medicine check)
  └── llmErrors.js        (Custom error hierarchy: connection, timeout, provider, parse, validation, hallucination, exhausted)
      │
      ▼
Ollama Daemon (http://localhost:11434/api/chat)
      │
      ▼
Local LLM (llama3 / qwen2.5 / mistral)
```

---

## 2. Non-Negotiable Architectural Constraints

1. **Client Isolation**: React never communicates with Ollama directly. All LLM calls originate server-side within Express background triggers.
2. **Non-Blocking HTTP Responses**: Appointment booking and consultation completion persist to MongoDB and respond to the client immediately (HTTP 201/200) *before* the LLM generation resolves.
3. **Zero-Hallucination Guardrail (Hard Gate)**: Post-visit summaries must contain 100% of prescribed medicine names verbatim. If any medicine is omitted or renamed, the generation is rejected and `aiStatus` is marked `FAILED`.
4. **Bounded Retries**: Maximum 2 attempts per generation with exponential backoff (`attempt * 300ms`).
5. **Hard Timeouts**: 28-second timeout via `AbortController` on every Ollama HTTP request to prevent stalled workers on slow CPU inference.
6. **Fault Tolerance (Never Crash)**: All failure paths (connection refused, timeout, malformed JSON, schema violation, exhausted retries) resolve to `{ status: 'FAILED' }` without throwing unhandled rejections into core business transactions.
7. **Untrusted Data Isolation**: Patient and doctor free text is treated strictly as data, with input sanitization and explicit system prompt directives neutralizing prompt injection attempts.
8. **No AI-Authored Prescriptions**: The LLM is forbidden from diagnosing conditions or inventing medications/dosages not present in the doctor's structured MongoDB record.

---

## 3. Workflows & Prompt Versions

### Feature 1: Pre-Visit Clinical Intake Synthesis (`pre-visit-v1`)
- **Trigger**: Invoked when a patient books an appointment with symptoms (`appointmentService.js` -> `triggerPreVisitSummary`).
- **Verbatim User Prompt**:
  `"Analyse these symptoms and return: urgency level (Low / Medium / High), chief complaint, and three suggested questions for the doctor. Symptoms: <sanitized symptoms>"`
- **JSON Schema**:
  - `urgency`: Enum `['Low', 'Medium', 'High']`
  - `chiefComplaint`: String (minimum 3 characters)
  - `suggestedQuestions`: Array of **exactly 3** strings (minimum 5 characters each)
- **Target Storage**: `Appointment.preVisitSummary` + `Appointment.aiStatus` + `Appointment.aiPromptVersion`.
- **UI Visibility**: Rendered exclusively in the Doctor Consultation Room.

### Feature 2: Post-Visit Consultation Summary & Medication Guidance (`post-visit-v1`)
- **Trigger**: Invoked when the doctor completes consultation notes and prescription (`clinicalService.js` -> `triggerPostVisitSummary`).
- **Verbatim User Prompt**:
  `"Convert these clinical notes into a patient-friendly summary with medication schedule and follow-up steps: <sanitized notes>\n\nPrescribed medicines (include every one of these by name in the summary, verbatim, do not omit or rename any): <medicineList>\n\nRespond with ONLY this JSON shape, no other text:\n{\"summary\": \"string\", \"medicationSchedule\": \"string\", \"followUpSteps\": \"string\"}"`
- **JSON Schema & Guardrail**:
  - `summary`: String (minimum 10 characters)
  - `medicationSchedule`: String
  - `followUpSteps`: String
  - Zero-hallucination check: 100% of prescribed medicine names must appear in combined summary text.
- **Prompt Engineering & Safety Note**: The core directive matches the brief (`"Convert these clinical notes into a patient-friendly summary with medication schedule and follow-up steps: <notes>"`), augmented with prescribed medications and JSON schema constraints specifically to guarantee zero-hallucination validation and deterministic output.
- **Target Storage**: `ClinicalRecord.postVisitSummary` + `ClinicalRecord.aiStatus` + `ClinicalRecord.aiPromptVersion`.
- **UI Visibility**: Rendered exclusively in the Patient Appointment Record view.

---

## 4. Error Hierarchy (`llmErrors.js`)

| Error Class | Code | Retryable | Description |
|---|---|---|---|
| `LLMError` | `LLM_ERROR` | `false` | Base error class |
| `LLMConnectionError` | `LLM_CONNECTION_ERROR` | `true` | Ollama daemon unreachable (ECONNREFUSED / DNS) |
| `LLMTimeoutError` | `LLM_TIMEOUT_ERROR` | `true` | Request exceeded configured timeout |
| `LLMProviderError` | `LLM_PROVIDER_ERROR` | `status >= 500` | Non-2xx HTTP status from Ollama |
| `LLMParseError` | `LLM_PARSE_ERROR` | `true` | Response was not valid/extractable JSON |
| `LLMValidationError` | `LLM_VALIDATION_ERROR` | `true` | JSON failed schema checks (carries `issues: []`) |
| `LLMHallucinationGuardError` | `LLM_HALLUCINATION_GUARD_ERROR` | `true` | Prescribed medicine missing from post-visit text |
| `LLMExhaustedRetriesError` | `LLM_EXHAUSTED_RETRIES` | `false` | All bounded attempts failed |
