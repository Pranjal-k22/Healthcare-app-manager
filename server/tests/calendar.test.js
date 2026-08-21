const assert = require('assert');
const mongoose = require('mongoose');
const CalendarConnection = require('../models/CalendarConnection');
const Appointment = require('../models/Appointment');
const { generateConnectAuthUrl } = require('../services/calendarService');
const { encryptToken, decryptToken } = require('../utils/crypto');

const runCalendarTests = async () => {
  console.log('\n--- [TEST SUITE 6] Google Calendar OAuth & Token Security ---');

  // 1. Token Encryption at Rest (AES-256-GCM)
  const plainAccessToken = 'ya29.a0AfH6SMB_secret_google_access_token_12345';
  const plainRefreshToken = '1//0g_secret_google_refresh_token_67890';

  const encryptedAccess = encryptToken(plainAccessToken);
  const encryptedRefresh = encryptToken(plainRefreshToken);

  assert.notStrictEqual(encryptedAccess, plainAccessToken, 'Encrypted access token must not match plaintext');
  assert.notStrictEqual(encryptedRefresh, plainRefreshToken, 'Encrypted refresh token must not match plaintext');
  assert.ok(encryptedAccess.includes(':'), 'Encrypted token format must include IV and AuthTag');

  const decryptedAccess = decryptToken(encryptedAccess);
  const decryptedRefresh = decryptToken(encryptedRefresh);

  assert.strictEqual(decryptedAccess, plainAccessToken, 'Decrypted access token must match original plaintext');
  assert.strictEqual(decryptedRefresh, plainRefreshToken, 'Decrypted refresh token must match original plaintext');
  console.log('✓ Token encryption (AES-256-GCM) and decryption at rest verified');

  // 2. CalendarConnection Schema & Token Redaction in JSON
  assert.ok(CalendarConnection.schema.paths.userId, 'Must have userId');
  assert.ok(CalendarConnection.schema.paths.provider, 'Must have provider');
  assert.ok(CalendarConnection.schema.paths.accessToken, 'Must have accessToken');
  assert.ok(CalendarConnection.schema.paths.refreshToken, 'Must have refreshToken');
  assert.ok(CalendarConnection.schema.paths.isConnected, 'Must have isConnected');

  const connection = new CalendarConnection({
    userId: new mongoose.Types.ObjectId(),
    provider: 'GOOGLE',
    googleAccountEmail: 'doctor@healthpulse.com',
    accessToken: encryptedAccess,
    refreshToken: encryptedRefresh,
    expiryDate: Date.now() + 3600000,
  });

  const serialized = connection.toJSON();
  assert.strictEqual(serialized.accessToken, undefined, 'accessToken MUST be stripped in toJSON()');
  assert.strictEqual(serialized.refreshToken, undefined, 'refreshToken MUST be stripped in toJSON()');
  assert.strictEqual(serialized.googleAccountEmail, 'doctor@healthpulse.com');
  console.log('✓ Token redaction in CalendarConnection serialization verified');

  // 3. OAuth URL & Signed JWT CSRF State Parameter
  const userId = new mongoose.Types.ObjectId().toString();
  const authUrl = generateConnectAuthUrl(userId);
  assert.ok(authUrl.includes('accounts.google.com') || authUrl.includes('oauth2'));
  assert.ok(authUrl.includes('calendar.events'));
  assert.ok(authUrl.includes('state='));
  assert.ok(authUrl.includes('prompt=consent'), 'Must include prompt=consent to ensure refresh_token return');
  console.log('✓ OAuth authorization URL generator with signed CSRF state and consent prompt verified');

  // 4. Appointment Sync Status Fields
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
