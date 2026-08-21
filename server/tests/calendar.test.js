const assert = require('assert');
const mongoose = require('mongoose');
const CalendarConnection = require('../models/CalendarConnection');
const Appointment = require('../models/Appointment');
const { generateAuthUrl } = require('../services/google/googleCalendarService');

const runCalendarTests = async () => {
  console.log('\n--- [TEST SUITE 6] Google Calendar OAuth & Token Security ---');

  // 1. CalendarConnection Schema & Token Redaction in JSON
  assert.ok(CalendarConnection.schema.paths.userId, 'Must have userId');
  assert.ok(CalendarConnection.schema.paths.provider, 'Must have provider');
  assert.ok(CalendarConnection.schema.paths.accessToken, 'Must have accessToken');
  assert.ok(CalendarConnection.schema.paths.refreshToken, 'Must have refreshToken');
  assert.ok(CalendarConnection.schema.paths.isConnected, 'Must have isConnected');

  const connection = new CalendarConnection({
    userId: new mongoose.Types.ObjectId(),
    provider: 'GOOGLE',
    googleAccountEmail: 'doctor@healthpulse.com',
    accessToken: 'sensitive_oauth_access_token_xyz',
    refreshToken: 'sensitive_oauth_refresh_token_abc',
    expiryDate: Date.now() + 3600000,
  });

  const serialized = connection.toJSON();
  assert.strictEqual(serialized.accessToken, undefined, 'accessToken MUST be stripped in toJSON()');
  assert.strictEqual(serialized.refreshToken, undefined, 'refreshToken MUST be stripped in toJSON()');
  assert.strictEqual(serialized.googleAccountEmail, 'doctor@healthpulse.com');
  console.log('✓ Token redaction in CalendarConnection serialization verified');

  // 2. OAuth URL & CSRF State Parameter
  const userId = new mongoose.Types.ObjectId().toString();
  const authUrl = generateAuthUrl(userId);
  assert.ok(authUrl.includes('accounts.google.com') || authUrl.includes('oauth2'));
  assert.ok(authUrl.includes('calendar.events'));
  assert.ok(authUrl.includes('state='));
  console.log('✓ OAuth authorization URL generator with CSRF state verified');

  // 3. Appointment Sync Status Fields
  assert.ok(Appointment.schema.paths.calendarEvents, 'Appointment must have calendarEvents');
  assert.ok(Appointment.schema.paths.calendarSyncStatus, 'Appointment must have calendarSyncStatus');
  const statuses = Appointment.schema.paths.calendarSyncStatus.enumValues;
  assert.deepStrictEqual(statuses, ['NOT_REQUIRED', 'PENDING', 'SYNCED', 'FAILED']);
  console.log('✓ Appointment calendar sync status states verified');

  console.log('✓ [PASS] All Google Calendar Integration Tests Passed!');
};

module.exports = runCalendarTests;
if (require.main === module) {
  runCalendarTests().catch((err) => {
    console.error('Calendar test failed:', err);
    process.exit(1);
  });
}
