# Local LLM Architecture & Safety Guardrails (Phase 10)

## 1. Architectural Overview

HealthPulse integrates a local LLM strictly as an **explanation and assistance layer**, never as an authoritative clinical decision-maker.

```text
React (Client)
      │
      ▼  (HTTP REST API with JWT Bearer Auth)
Express Controllers & Services
      │
      ▼
server/services/llm/
  ├── llmService.js      (Provider-agnostic orchestration, retry/backoff)
  ├── ollamaProvider.js  (HTTP interface to local Ollama daemon)
  ├── prompts.js         (Verbatim prompt templates + injection defenses)
  ├── schemas.js         (JSON schemas & versioning constants)
  ├── validator.js       (Schema validation & medicine presence checks)
  └── llmErrors.js       (Categorized error hierarchy)
      │
      ▼
Ollama Runtime (http://localhost:11434)
      │
      ▼
Local LLM (llama3 / qwen2.5 / mistral)
```

---

## 2. Feature Workflows

### Feature 1: Pre-Visit Clinical Intake Synthesis
- **Trigger**: Automatically invoked when a patient books an appointment with symptoms.
- **Input**: Patient-submitted symptoms text.
- **Prompt (v1)**:
  `"Analyse these symptoms and return: urgency level (Low / Medium / High), chief complaint, and three suggested questions for the doctor. Symptoms: <symptoms>"`
- **Validation**: Strict JSON schema requiring `urgency` (`Low` | `Medium` | `High`), non-empty `chiefComplaint`, and **exactly 3** non-empty `suggestedQuestions`.
- **Target Storage**: `Appointment.preVisitSummary` + `Appointment.aiStatus` (`PENDING` | `READY` | `FAILED`).
- **UI Visibility**: Rendered exclusively in the Doctor Consultation Room (`/doctor/consultation/:appointmentId`).

### Feature 2: Post-Visit Consultation Summary & Medication Guidance
- **Trigger**: Invoked when the doctor completes consultation notes and structured prescriptions.
- **Input**: `ClinicalRecord.clinicalNotes` + structured `Prescription.medicines` (`name`, `dosage`, `frequency`, `duration`, `instructions`).
- **Prompt (v1)**:
  `"Convert these clinical notes into a patient-friendly summary with medication schedule and follow-up steps: <notes>"`
- **Zero-Hallucination Guardrail**: `validator.js` enforces that **100% of prescribed medicine names** exist in the generated summary. If any prescribed drug is omitted or altered, the output is rejected as a validation failure.
- **Target Storage**: `ClinicalRecord.postVisitSummary` + `ClinicalRecord.aiStatus` (`PENDING` | `READY` | `FAILED`).
- **UI Visibility**: Rendered exclusively in the Patient Appointment Record view (`/patient/appointments/:id`).

---

## 3. Medical Safety & Non-Negotiable Boundaries

1. **No AI Prescriptions or Diagnosis**: The LLM is prohibited from diagnosing conditions, prescribing drugs, or modifying dosages.
2. **Authoritative Structured Data**: The doctor's structured prescription in MongoDB remains the single source of truth for the Medication Reminder Engine.
3. **Decoupled Asynchronous Execution**: All LLM calls execute asynchronously via non-blocking promises. If Ollama is offline, crashes, or times out, the appointment booking and consultation completion proceed successfully with `aiStatus = FAILED`.
4. **Prompt Injection Resistance**: All patient inputs are explicitly scoped as untrusted data within system directives, preventing prompt injection attacks from overriding application logic.
