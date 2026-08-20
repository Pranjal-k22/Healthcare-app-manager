# Local LLM Setup & Operational Guide: HealthPulse (Phase 10)

## 1. Overview
HealthPulse integrates a local Large Language Model (LLM) runtime using **Ollama** to provide clinical assistance features without exposing sensitive patient health information to external third-party cloud APIs.

---

## 2. Why Local LLM? (Privacy & Compliance Architecture)
- **Zero Patient Data Exposure**: Protected Health Information (PHI) and clinical symptoms are processed strictly within the local host memory. No data is sent over the public internet to commercial cloud providers.
- **Offline Development & Independence**: Complete development and staging workflows function without cloud API keys, billing quotas, or internet connectivity.
- **Deterministic Latency**: Eliminates third-party rate limits, API key revocation risks, and cloud service disruptions.
- **Provider Abstraction**: The backend service layer communicates via a clean provider interface (`llmService.js` ➔ `ollamaProvider.js`), allowing seamless model swaps.

---

## 3. Ollama Installation & Setup

### Step 1: Install Ollama
Download and install Ollama from [https://ollama.com/download](https://ollama.com/download):
- **macOS / Linux**: `curl -fsSL https://ollama.ai/install.sh | sh`
- **Windows**: Download the official Windows installer.

### Step 2: Pull the Recommended Model
HealthPulse supports any locally running instruction-following model. The recommended models are:
```bash
# Recommended default (8B parameters)
ollama pull llama3

# High performance alternative (7B parameters)
ollama pull qwen2.5:7b

# Lightweight alternative (7B parameters)
ollama pull mistral
```

### Step 3: Verify the Ollama Daemon
Ensure Ollama is running on port `11434`:
```bash
curl http://localhost:11434/api/tags
```

---

## 4. Environment Configuration
In your root `.env` (or `server/.env`) file, configure the following variables:

```env
# Local Ollama LLM Configuration (Phase 10)
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3
```

---

## 5. CPU vs GPU Considerations
- **With GPU (NVIDIA CUDA / Apple Silicon Metal)**: Response latency is typically under 1.5 seconds.
- **CPU Only**: Response latency ranges from 3 to 8 seconds. HealthPulse implements non-blocking asynchronous generation with 25-30s timeouts and bounded retries so the application never hangs or blocks clinical transactions on slow CPU inference.

---

## 6. Troubleshooting & Diagnostics

| Symptom | Cause | Resolution |
| :--- | :--- | :--- |
| `aiStatus: FAILED` | Ollama daemon is stopped | Run `ollama serve` in terminal. |
| `fetch failed` error | Wrong port or host in `.env` | Verify `OLLAMA_HOST=http://localhost:11434`. |
| Validation failed | Model hallucinated medication | Model omitted prescribed drug; system safely marked as failed. |
| Model not found | Configured model not pulled | Run `ollama pull <model-name>`. |
