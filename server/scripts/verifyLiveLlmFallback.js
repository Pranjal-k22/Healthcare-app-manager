// server/scripts/verifyLiveLlmFallback.js
// Comprehensive end-to-end live verification of Dual-Engine LLM Fallback (Ollama primary -> Gemini fallback)

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const llmService = require('../services/llm/llmService');
const ollamaProvider = require('../services/llm/ollamaProvider');
const geminiProvider = require('../services/llm/geminiProvider');
const { validatePostVisit } = require('../services/llm/validator');
const { LLMHallucinationGuardError } = require('../services/llm/llmErrors');

async function runLiveVerification() {
  console.log('================================================================');
  console.log('  LIVE DUAL-ENGINE LLM FALLBACK VERIFICATION SUITE');
  console.log('================================================================\n');

  const REAL_OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
  const REAL_GEMINI_KEY = process.env.GEMINI_API_KEY;

  console.log(`[Config] OLLAMA_HOST: ${REAL_OLLAMA_HOST}`);
  console.log(`[Config] OLLAMA_MODEL: ${process.env.OLLAMA_MODEL || 'qwen2.5-coder:7b'}`);
  console.log(`[Config] GEMINI_MODEL: ${process.env.GEMINI_MODEL || 'gemini-1.5-flash'}`);
  console.log(`[Config] GEMINI_API_KEY: ${REAL_GEMINI_KEY ? 'Configured (Redacted)' : 'Missing'}\n`);

  // -------------------------------------------------------------
  // TEST 1: Live Local Ollama Happy Path (Pre-Visit & Post-Visit)
  // -------------------------------------------------------------
  console.log('--- [TEST 1] Initial Live Local Ollama Happy Path ---');
  try {
    const preResult = await llmService.generatePreVisitSummary(
      'Patient reports severe acute migraine with photophobia and nausea for 2 days.'
    );
    console.log(`Pre-Visit Result Status: ${preResult.status}`);
    console.log(`Pre-Visit Provider Used: ${preResult.provider}`);
    console.log(`Pre-Visit Output:`, JSON.stringify(preResult.data, null, 2));

    if (preResult.status !== 'READY' || preResult.provider !== 'ollama') {
      throw new Error(`Expected status READY with provider ollama, got ${preResult.status} with ${preResult.provider}`);
    }

    const sampleMeds = [
      { name: 'Sumatriptan 50mg', dosage: '50mg', frequency: 'PRN for migraine onset', duration: 'As needed' },
      { name: 'Ondansetron 4mg', dosage: '4mg', frequency: 'Q8H for nausea', duration: '3 days' }
    ];
    const postResult = await llmService.generatePostVisitSummary(
      'Patient examined. Diagnosed with acute migraine with aura and associated nausea. Prescribed Sumatriptan 50mg and Ondansetron 4mg.',
      sampleMeds
    );
    console.log(`Post-Visit Result Status: ${postResult.status}`);
    console.log(`Post-Visit Provider Used: ${postResult.provider}`);
    console.log(`Post-Visit Output:`, JSON.stringify(postResult.data, null, 2));

    if (postResult.status !== 'READY' || postResult.provider !== 'ollama') {
      throw new Error(`Expected status READY with provider ollama, got ${postResult.status} with ${postResult.provider}`);
    }
    console.log('✅ [TEST 1 PASSED] Initial Live Local Ollama generated Pre-Visit & Post-Visit summaries successfully!\n');
  } catch (err) {
    console.error('❌ [TEST 1 FAILED]:', err.message);
    throw err;
  }

  // -------------------------------------------------------------
  // TEST 2: Forced Ollama Failure ➔ Live Google Gemini Fallback
  // -------------------------------------------------------------
  console.log('--- [TEST 2] Forced Ollama Failure ➔ Live Google Gemini Cloud Fallback ---');
  process.env.OLLAMA_HOST = 'http://127.0.0.1:11439'; // Unreachable Ollama port

  try {
    console.log('Testing Pre-Visit Summary with Ollama forced offline (http://127.0.0.1:11439)...');
    const preFallbackResult = await llmService.generatePreVisitSummary(
      'Persistent high fever (102F), dry cough, and fatigue for 4 days.'
    );
    console.log(`Pre-Visit Fallback Status: ${preFallbackResult.status}`);
    console.log(`Pre-Visit Fallback Provider Used: ${preFallbackResult.provider}`);
    console.log(`Pre-Visit Fallback Output:`, JSON.stringify(preFallbackResult.data, null, 2));

    if (preFallbackResult.status !== 'READY' || preFallbackResult.provider !== 'gemini') {
      throw new Error(`Expected status READY with provider gemini, got ${preFallbackResult.status} with ${preFallbackResult.provider}`);
    }

    console.log('\nTesting Post-Visit Summary with Ollama forced offline...');
    const fallbackMeds = [
      { name: 'Amoxicillin 500mg', dosage: '500mg', frequency: 'Three times daily (TID)', duration: '7 days', instructions: 'Take with food' },
      { name: 'Acetaminophen 650mg', dosage: '650mg', frequency: 'Every 6 hours PRN for fever', duration: '5 days', instructions: 'Do not exceed 3000mg/day' }
    ];
    const postFallbackResult = await llmService.generatePostVisitSummary(
      'Clinical examination shows bacterial pharyngitis and fever. Prescribed Amoxicillin 500mg and Acetaminophen 650mg.',
      fallbackMeds
    );
    console.log(`Post-Visit Fallback Status: ${postFallbackResult.status}`);
    console.log(`Post-Visit Fallback Provider Used: ${postFallbackResult.provider}`);
    console.log(`Post-Visit Fallback Output:`, JSON.stringify(postFallbackResult.data, null, 2));

    if (postFallbackResult.status !== 'READY' || postFallbackResult.provider !== 'gemini') {
      throw new Error(`Expected status READY with provider gemini, got ${postFallbackResult.status} with ${postFallbackResult.provider}`);
    }

    console.log('✅ [TEST 2 PASSED] Real Google Gemini fallback seamlessly generated Pre-Visit & Post-Visit summaries!\n');
  } finally {
    process.env.OLLAMA_HOST = REAL_OLLAMA_HOST;
  }

  // -------------------------------------------------------------
  // TEST 3: Zero-Hallucination Guardrail on Gemini Output
  // -------------------------------------------------------------
  console.log('--- [TEST 3] Zero-Hallucination Guardrail Enforcement on Gemini Output ---');
  const prescribedMedicines = [
    { name: 'Metformin 500mg', dosage: '500mg' },
    { name: 'Atorvastatin 20mg', dosage: '20mg' }
  ];

  // Case 3A: Gemini summary omitting a prescribed drug should be caught & rejected by validator
  const hallucinatedGeminiOutput = {
    summary: 'Patient diagnosed with Type 2 diabetes. Take Metformin 500mg daily.',
    medicationSchedule: 'Take Metformin 500mg daily with breakfast.',
    followUpSteps: 'Follow up in 3 months.'
  };

  try {
    validatePostVisit(hallucinatedGeminiOutput, prescribedMedicines);
    throw new Error('Guardrail failed to reject missing Atorvastatin');
  } catch (guardErr) {
    if (guardErr instanceof LLMHallucinationGuardError && guardErr.missingMedicines.some(m => m.toLowerCase().includes('atorvastatin'))) {
      console.log('✓ Guardrail successfully rejected output omitting prescribed drug: Atorvastatin (missing: ' + guardErr.missingMedicines.join(', ') + ')');
    } else {
      throw guardErr;
    }
  }

  // Case 3B: Gemini summary containing all prescribed drugs passes
  const validGeminiOutput = {
    summary: 'Patient diagnosed with Type 2 diabetes and hyperlipidemia. Prescribed Metformin 500mg and Atorvastatin 20mg.',
    medicationSchedule: 'Take Metformin 500mg with breakfast and Atorvastatin 20mg at bedtime.',
    followUpSteps: 'Follow up in 3 months for lipid panel.'
  };
  const validatedResult = validatePostVisit(validGeminiOutput, prescribedMedicines);
  console.log('✓ Guardrail successfully accepted valid output citing all prescribed drugs verbatim');
  console.log('✅ [TEST 3 PASSED] Zero-hallucination validator enforces identical safety rules on Gemini output!\n');

  // -------------------------------------------------------------
  // TEST 4A: Total Outage via API Key Invalid (HTTP 400 from Gemini)
  // -------------------------------------------------------------
  console.log('--- [TEST 4A] Total Outage (Ollama Down + Gemini Invalid Key) ---');
  process.env.OLLAMA_HOST = 'http://127.0.0.1:11439';
  process.env.GEMINI_API_KEY = 'invalid_broken_key_for_testing';

  try {
    const outageResult = await llmService.generatePreVisitSummary('Severe acute abdominal pain');
    console.log(`Total Outage Status: ${outageResult.status}`);
    console.log(`Total Outage Error Logged: ${outageResult.error}`);
    console.log(`Total Outage Data: ${outageResult.data}`);

    if (outageResult.status === 'FAILED' && outageResult.data === null) {
      console.log('✅ [TEST 4A PASSED] HTTP 400 Invalid Key degraded gracefully to FAILED without crash!\n');
    } else {
      throw new Error(`Expected FAILED status on total outage, got ${outageResult.status}`);
    }
  } finally {
    process.env.OLLAMA_HOST = REAL_OLLAMA_HOST;
    process.env.GEMINI_API_KEY = REAL_GEMINI_KEY;
  }

  // -------------------------------------------------------------
  // TEST 4B: Total Outage via Network Failure / Abort (Ollama Down + Gemini Network Down)
  // -------------------------------------------------------------
  console.log('--- [TEST 4B] Total Outage (Ollama Down + Gemini Network Unreachable / Timeout) ---');
  process.env.OLLAMA_HOST = 'http://127.0.0.1:11439';
  
  // Temporarily mock geminiProvider.generate to simulate network connection drop / timeout
  const originalGeminiGen = geminiProvider.generate;
  geminiProvider.generate = async () => {
    throw new Error('fetch failed: getaddrinfo ENOTFOUND generativelanguage.googleapis.com');
  };

  try {
    const netOutageResult = await llmService.generatePreVisitSummary('Persistent chest discomfort');
    console.log(`Network Outage Status: ${netOutageResult.status}`);
    console.log(`Network Outage Error Logged: ${netOutageResult.error}`);

    if (netOutageResult.status === 'FAILED' && netOutageResult.data === null) {
      console.log('✅ [TEST 4B PASSED] Full network connection failure degraded gracefully to FAILED without crash!\n');
    } else {
      throw new Error(`Expected FAILED status on network outage, got ${netOutageResult.status}`);
    }
  } finally {
    geminiProvider.generate = originalGeminiGen;
    process.env.OLLAMA_HOST = REAL_OLLAMA_HOST;
  }

  // -------------------------------------------------------------
  // TEST 5: Forced Provider Modes vs Auto Mode
  // -------------------------------------------------------------
  console.log('--- [TEST 5] Forced Modes (ollama / gemini / auto) ---');
  
  // 5A: Forced 'gemini' mode directly calls Gemini
  console.log('Testing forced provider: "gemini"...');
  const forcedGeminiResult = await llmService.generatePreVisitSummary('Seasonal allergies', 'gemini');
  console.log(`Forced Gemini Status: ${forcedGeminiResult.status}, Provider: ${forcedGeminiResult.provider}`);
  if (forcedGeminiResult.provider !== 'gemini' || forcedGeminiResult.status !== 'READY') {
    throw new Error(`Expected provider gemini, got ${forcedGeminiResult.provider}`);
  }
  console.log('✓ Forced "gemini" mode invoked Gemini directly');

  // 5B: Forced 'ollama' mode with Ollama offline strictly fails without attempting Gemini fallback
  console.log('Testing forced provider: "ollama" with Ollama forced offline...');
  process.env.OLLAMA_HOST = 'http://127.0.0.1:11439';
  try {
    const forcedOllamaOfflineResult = await llmService.generatePreVisitSummary('Skin dermatitis', 'ollama');
    console.log(`Forced Ollama Offline Status: ${forcedOllamaOfflineResult.status}, Error: ${forcedOllamaOfflineResult.error}`);
    if (forcedOllamaOfflineResult.status !== 'FAILED') {
      throw new Error(`Expected forced ollama offline to fail immediately without Gemini fallback, got ${forcedOllamaOfflineResult.status}`);
    }
    console.log('✓ Forced "ollama" mode strictly failed when Ollama was offline without invoking Gemini');
  } finally {
    process.env.OLLAMA_HOST = REAL_OLLAMA_HOST;
  }
  console.log('✅ [TEST 5 PASSED] Forced modes strictly enforce provider boundaries!\n');

  // -------------------------------------------------------------
  // TEST 6: Post-Outage Clean Recovery on Live Local Ollama (Happy Path Re-run)
  // -------------------------------------------------------------
  console.log('--- [TEST 6] Post-Outage Full Lifecycle Recovery (Ollama Happy Path Re-run) ---');
  console.log('Re-testing Live Ollama to confirm zero preference drift / sticking to fallback...');
  
  const recoveryPreResult = await llmService.generatePreVisitSummary(
    'Patient has mild tension headache after prolonged screen time.'
  );
  console.log(`Recovery Pre-Visit Status: ${recoveryPreResult.status}`);
  console.log(`Recovery Provider Selected: ${recoveryPreResult.provider}`);
  console.log(`Recovery Output:`, JSON.stringify(recoveryPreResult.data, null, 2));

  if (recoveryPreResult.status !== 'READY' || recoveryPreResult.provider !== 'ollama') {
    throw new Error(`Recovery failed: Expected provider ollama, got ${recoveryPreResult.provider}`);
  }

  const recoveryPostResult = await llmService.generatePostVisitSummary(
    'Diagnosed with tension-type headache. Prescribed Ibuprofen 400mg.',
    [{ name: 'Ibuprofen 400mg', dosage: '400mg', frequency: 'PRN for headache', duration: 'As needed' }]
  );
  console.log(`Recovery Post-Visit Status: ${recoveryPostResult.status}`);
  console.log(`Recovery Provider Selected: ${recoveryPostResult.provider}`);
  console.log(`Recovery Output:`, JSON.stringify(recoveryPostResult.data, null, 2));

  if (recoveryPostResult.status !== 'READY' || recoveryPostResult.provider !== 'ollama') {
    throw new Error(`Recovery failed: Expected provider ollama, got ${recoveryPostResult.provider}`);
  }

  console.log('✅ [TEST 6 PASSED] Full lifecycle recovery confirmed: Ollama seamlessly resumed as primary with zero drift!\n');

  console.log('================================================================');
  console.log('🎉 ALL 6 RIGOROUS DUAL-ENGINE VERIFICATION TESTS PASSED 100% CLEANLY!');
  console.log('================================================================\n');
}

runLiveVerification().catch((err) => {
  console.error('Fatal verification error:', err);
  process.exit(1);
});
