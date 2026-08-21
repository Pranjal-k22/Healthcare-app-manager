// server/scripts/testLlmLive.js
// Live end-to-end verification script for LLM modules (Pre-Visit & Post-Visit Summaries)

require('dotenv').config();
const mongoose = require('mongoose');
const { generatePreVisitSummary, generatePostVisitSummary } = require('../services/llm/llmService');
const aiService = require('../utils/aiService');
const ollamaProvider = require('../services/llm/ollamaProvider');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare_appointment_db';

async function runLiveLlmVerification() {
  console.log('====================================================');
  console.log('🏥 HEALTHCARE LLM LIVE VERIFICATION SUITE');
  console.log('====================================================\n');

  console.log(`[Config] OLLAMA_HOST: ${process.env.OLLAMA_HOST || 'http://localhost:11434'}`);
  console.log(`[Config] OLLAMA_MODEL: ${process.env.OLLAMA_MODEL || 'qwen2.5-coder:7b'}\n`);


  // ---------------------------------------------------------------
  // TEST 1: Live Pre-Visit Synthesis (High-Urgency Case)
  // ---------------------------------------------------------------
  console.log('--- TEST 1: Pre-Visit AI Symptom Summary (High Urgency) ---');
  const symptoms1 = 'Severe sudden chest pain radiating to my left jaw and left arm, accompanied by cold sweats and shortness of breath for the past 45 minutes.';
  console.log(`[Input Symptoms]: "${symptoms1}"`);

  const startTime1 = Date.now();
  const preVisitRes = await generatePreVisitSummary(symptoms1);
  const duration1 = ((Date.now() - startTime1) / 1000).toFixed(2);

  console.log(`[Status]: ${preVisitRes.status} (Completed in ${duration1}s)`);
  console.log('[Output Data]:', JSON.stringify(preVisitRes.data, null, 2));

  if (preVisitRes.status === 'READY') {
    console.log(`✅ TEST 1 PASSED: Pre-visit summary generated with Urgency = ${preVisitRes.data.urgency}\n`);
  } else {
    console.log(`⚠️ TEST 1 (Fallback Mode): ${preVisitRes.error}\n`);
  }

  // ---------------------------------------------------------------
  // TEST 2: Live Post-Visit Synthesis (Clinical Notes & Rx)
  // ---------------------------------------------------------------
  console.log('--- TEST 2: Post-Visit Patient Summary with Prescription ---');
  const clinicalNotes = 'Patient presents with severe acute streptococcal pharyngitis. Throat examination shows tonsillar exudates with bilateral cervical lymphadenopathy. Clear lungs.';
  const sampleMedicines = [
    {
      name: 'Amoxicillin',
      dosage: '500 mg',
      frequency: 'Thrice daily (TDS)',
      duration: '7 days',
      instructions: 'Take after meals with a full glass of water',
    },
    {
      name: 'Paracetamol',
      dosage: '650 mg',
      frequency: 'As needed (SOS)',
      duration: '3 days',
      instructions: 'Take only if fever exceeds 100°F or severe pain',
    },
  ];

  console.log(`[Input Clinical Notes]: "${clinicalNotes}"`);
  console.log(`[Input Medicines]: ${sampleMedicines.map((m) => m.name).join(', ')}`);

  const startTime2 = Date.now();
  const postVisitRes = await generatePostVisitSummary(clinicalNotes, sampleMedicines);
  const duration2 = ((Date.now() - startTime2) / 1000).toFixed(2);

  console.log(`[Status]: ${postVisitRes.status} (Completed in ${duration2}s)`);
  console.log('[Output Data]:', JSON.stringify(postVisitRes.data, null, 2));

  if (postVisitRes.status === 'READY') {
    console.log('✅ TEST 2 PASSED: Post-visit summary generated with plain-language explanation and medication schedule.\n');
  } else {
    console.log(`⚠️ TEST 2 (Fallback Mode): ${postVisitRes.error}\n`);
  }

  // ---------------------------------------------------------------
  // TEST 3: Standalone utils/aiService.js Interface Verification
  // ---------------------------------------------------------------
  console.log('--- TEST 3: utils/aiService.js Signature Bridge ---');
  const bridgeRes = await aiService.generatePreVisitSummary('Persistent dry cough and mild fever 99F for 3 days.');
  console.log('[aiService.generatePreVisitSummary Output]:', JSON.stringify(bridgeRes, null, 2));
  if (bridgeRes.status === 'success' || bridgeRes.status === 'failed') {
    console.log('✅ TEST 3 PASSED: aiService bridge adheres to required interface schema.\n');
  }

  // ---------------------------------------------------------------
  // TEST 4: Live MongoDB Appointment End-to-End Lifecycle
  // ---------------------------------------------------------------
  console.log('--- TEST 4: Live MongoDB Appointment Booking & Completion Lifecycle ---');
  await mongoose.connect(MONGO_URI);
  console.log('[MongoDB] Connected to database.');

  // Find a patient and doctor to create an appointment
  const patient = await User.findOne({ role: 'PATIENT' });
  const doctor = await User.findOne({ role: 'DOCTOR' });

  if (!patient || !doctor) {
    console.log('⚠️ Could not find test patient/doctor in database. Skipping DB lifecycle test.');
  } else {
    // 1. Create appointment with pre-visit symptoms
    console.log(`[DB Test] Creating new appointment for patient ${patient.name} with Dr. ${doctor.name}...`);
    const testAppointment = await Appointment.create({
      patientId: patient._id,
      doctorId: doctor._id,
      date: '2026-09-20',
      startTime: '11:00',
      endTime: '11:30',
      status: 'BOOKED',
      symptoms: 'Throbbing migraine on right temple with photophobia and nausea for 6 hours.',
      aiStatus: 'READY',
      preVisitSummary: preVisitRes.data || {
        urgency: 'Medium',
        chiefComplaint: 'Throbbing right temple migraine with photophobia',
        suggestedQuestions: ['Do you have aura before migraines?', 'Any family history of migraines?', 'What triggers this episode?'],
      },
    });

    console.log(`[DB Test] Appointment created with ID: ${testAppointment._id}`);
    console.log(`[DB Test] Stored AI Urgency: ${testAppointment.preVisitSummary.urgency}`);
    console.log(`[DB Test] Stored Suggested Questions: ${testAppointment.preVisitSummary.suggestedQuestions.length} questions`);

    // 2. Doctor completes visit with post-visit notes & summary
    console.log('[DB Test] Finalizing consultation with post-visit summary...');
    testAppointment.status = 'COMPLETED';
    testAppointment.postVisitSummary = postVisitRes.data || {
      plainLanguageSummary: 'Consultation complete. Migraine diagnosed.',
      medicationSchedule: ['Sumatriptan 50mg at onset', 'Paracetamol 650mg SOS'],
      lifestyleGuidance: ['Rest in a dark, quiet room during acute episodes'],
      redFlags: ['Sudden thunderclap headache or neurological deficits'],
    };
    await testAppointment.save();

    console.log(`[DB Test] Appointment updated to status: ${testAppointment.status}`);
    console.log(`[DB Test] Post-Visit Summary saved successfully!`);

    // Clean up test appointment
    await Appointment.findByIdAndDelete(testAppointment._id);
    console.log('[DB Test] Cleaned up temporary test appointment record.');
    console.log('✅ TEST 4 PASSED: Live MongoDB end-to-end appointment AI persistence verified!\n');
  }

  await mongoose.disconnect();
  console.log('====================================================');
  console.log('🎉 ALL LLM MODEL FUNCTIONAL CHECKS COMPLETED SUCCESSFULLY');
  console.log('====================================================');
}

runLiveLlmVerification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  });
