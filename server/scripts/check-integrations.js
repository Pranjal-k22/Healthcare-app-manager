/**
 * HealthPulse Diagnostic & Integration Verification Script
 * 
 * Non-destructively audits connectivity and configuration for:
 * 1. MongoDB Database
 * 2. Local Ollama LLM Runtime
 * 3. Google Calendar OAuth Configuration
 * 4. Transactional Email / SMTP Service
 * 5. JWT Authentication & Environment Variables
 */

const mongoose = require('mongoose');
const config = require('../config/env');

const runAudit = async () => {
  console.log('================================================================');
  console.log('  HEALTHPULSE — FULL SYSTEM INTEGRATION & CONNECTIVITY AUDIT  ');
  console.log('================================================================\n');

  const results = {
    mongo: false,
    ollama: false,
    google: false,
    email: false,
    auth: false,
  };

  // 1. Audit Authentication & Secrets Configuration
  console.log('[1/5] Auditing Authentication & Core Environment:');
  if (config.JWT_SECRET && config.JWT_SECRET.length >= 16) {
    console.log(`  ✓ JWT Secret configured (${config.JWT_SECRET.length} chars, Expiry: ${config.JWT_EXPIRES_IN})`);
    console.log(`  ✓ Client CORS Origin: ${config.CLIENT_URL}`);
    console.log(`  ✓ Server Port: ${config.PORT} (Mode: ${config.NODE_ENV})`);
    results.auth = true;
  } else {
    console.log('  ✗ JWT Secret is missing or too short');
  }

  // 2. Audit MongoDB Connectivity
  console.log('\n[2/5] Auditing MongoDB Database:');
  try {
    const mongoUri = config.MONGO_URI;
    console.log(`  Connecting to: ${mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}...`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.log(`  ✓ MongoDB Connected Successfully! (Host: ${mongoose.connection.host}, DB: ${mongoose.connection.name})`);
    results.mongo = true;
  } catch (err) {
    console.log(`  ✗ MongoDB Connection Failed: ${err.message}`);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  }

  // 3. Audit Local Ollama LLM Connection
  console.log('\n[3/5] Auditing Local Ollama LLM Integration:');
  const ollamaHost = config.OLLAMA_HOST.replace(/\/+$/, '');
  const ollamaModel = config.OLLAMA_MODEL;
  console.log(`  Target Host: ${ollamaHost}`);
  console.log(`  Configured Model: ${ollamaModel}`);
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${ollamaHost}/api/tags`, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const availableModels = (data.models || []).map((m) => m.name);
      console.log(`  ✓ Ollama Daemon is ONLINE & Reachable`);
      console.log(`  Available Local Models: ${availableModels.length > 0 ? availableModels.join(', ') : 'None pulled yet'}`);
      results.ollama = true;
    } else {
      console.log(`  ! Ollama responded with HTTP ${res.status}`);
      results.ollama = false;
    }
  } catch (err) {
    console.log(`  ! Ollama Daemon is currently OFFLINE at ${ollamaHost} (${err.message})`);
    console.log(`  (Note: System will safely degrade to aiStatus=FAILED without blocking core clinic operations)`);
    results.ollama = false;
  }

  // 4. Audit Google Calendar OAuth Configuration
  console.log('\n[4/5] Auditing Google Calendar OAuth Configuration:');
  const hasGoogleId = Boolean(config.GOOGLE_CLIENT_ID && !config.GOOGLE_CLIENT_ID.includes('your_google'));
  const hasGoogleSecret = Boolean(config.GOOGLE_CLIENT_SECRET && !config.GOOGLE_CLIENT_SECRET.includes('your_google'));
  console.log(`  Redirect URI: ${config.GOOGLE_REDIRECT_URI}`);
  if (hasGoogleId && hasGoogleSecret) {
    console.log(`  ✓ Google Client ID configured (${config.GOOGLE_CLIENT_ID.slice(0, 15)}...)`);
    console.log(`  ✓ Google Client Secret configured`);
    results.google = true;
  } else {
    console.log(`  ! Google OAuth credentials incomplete or placeholder in .env`);
    console.log(`  (Manual user action: Add credentials in .env from Google Cloud Console)`);
    results.google = false;
  }

  // 5. Audit Email / SMTP Configuration
  console.log('\n[5/5] Auditing Email / SMTP Notification Service:');
  console.log(`  Sender Address: ${config.EMAIL_FROM}`);
  if (config.ENABLE_EMAIL_NOTIFICATIONS) {
    console.log(`  Delivery Mode: LIVE SMTP (${config.SMTP_HOST}:${config.SMTP_PORT})`);
    if (config.SMTP_USER && config.SMTP_PASS) {
      console.log(`  ✓ SMTP User & Password configured`);
      results.email = true;
    } else {
      console.log(`  ! SMTP credentials incomplete for live email delivery`);
      results.email = false;
    }
  } else {
    console.log(`  ✓ Delivery Mode: DEVELOPMENT MOCK (Logs emails to console safely without sending)`);
    results.email = true;
  }

  console.log('\n================================================================');
  console.log('  AUDIT SUMMARY:');
  console.log(`  MongoDB:         ${results.mongo ? 'PASS (Connected)' : 'FAIL / NOT RUNNING'}`);
  console.log(`  Authentication:  ${results.auth ? 'PASS (Verified)' : 'FAIL'}`);
  console.log(`  Email Service:   ${results.email ? 'PASS (Mock/Live Ready)' : 'PARTIAL'}`);
  console.log(`  Local LLM:       ${results.ollama ? 'PASS (Online)' : 'MANUAL START (Ollama Offline)'}`);
  console.log(`  Google Calendar: ${results.google ? 'PASS (Configured)' : 'MANUAL CONFIG REQUIRED'}`);
  console.log('================================================================\n');

  process.exit(0);
};

runAudit().catch((err) => {
  console.error('Audit encountered unexpected error:', err);
  process.exit(1);
});
