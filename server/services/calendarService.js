const { google } = require('googleapis');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const CalendarConnection = require('../models/CalendarConnection');
const { encryptToken, decryptToken } = require('../utils/crypto');
const config = require('../config/env');

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/userinfo.email',
];

/**
 * Instantiate a fresh Google OAuth2 Client for a specific request
 * @returns {InstanceType<typeof google.auth.OAuth2>}
 */
const createOAuth2Client = () => {
  return new google.auth.OAuth2(
    config.GOOGLE_CLIENT_ID,
    config.GOOGLE_CLIENT_SECRET,
    config.GOOGLE_REDIRECT_URI
  );
};

/**
 * Generate Google OAuth authorization URL with signed state containing userId & nonce
 * @param {string} userId - Authenticated user ID
 * @returns {string} - Full Google consent authorization URL
 */
const generateConnectAuthUrl = (userId) => {
  const oauth2Client = createOAuth2Client();

  // Create a signed state token (valid for 10 minutes) to prevent CSRF and identify user on return
  const nonce = crypto.randomBytes(16).toString('hex');
  const signedState = jwt.sign(
    { userId, nonce, type: 'google_calendar_connect' },
    config.GOOGLE_OAUTH_STATE_SECRET,
    { expiresIn: '10m' }
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    state: signedState,
    prompt: 'consent', // Guarantees Google returns a refresh_token
  });

  return authUrl;
};

/**
 * Handle Google OAuth callback: verify state, exchange code, encrypt tokens & persist connection
 * @param {string} code - Authorization code from Google
 * @param {string} state - Signed JWT state parameter
 * @returns {Promise<{ success: boolean, userId: string, email: string }>}
 */
const handleOAuthCallback = async (code, state) => {
  if (!state) {
    const error = new Error('Missing OAuth state parameter');
    error.statusCode = 400;
    throw error;
  }

  let decoded;
  try {
    decoded = jwt.verify(state, config.GOOGLE_OAUTH_STATE_SECRET);
  } catch (err) {
    const error = new Error('Invalid or expired OAuth state parameter. Please try connecting again.');
    error.statusCode = 400;
    throw error;
  }

  const { userId } = decoded;
  if (!userId) {
    const error = new Error('Invalid user context in OAuth state');
    error.statusCode = 400;
    throw error;
  }

  const oauth2Client = createOAuth2Client();
  let tokens;
  try {
    const tokenResponse = await oauth2Client.getToken(code);
    tokens = tokenResponse.tokens;
  } catch (tokenErr) {
    console.error('[CalendarService] Error exchanging code for tokens:', tokenErr.response?.data || tokenErr.message);
    const customErr = new Error(tokenErr.response?.data?.error_description || tokenErr.message || 'invalid_client');
    customErr.statusCode = 400;
    throw customErr;
  }
  oauth2Client.setCredentials(tokens);

  // Fetch Google account email
  let googleAccountEmail = '';
  try {
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    googleAccountEmail = userInfo.data.email || '';
  } catch (err) {
    console.warn('[CalendarService] Could not fetch Google user email:', err.message);
  }

  // Encrypt tokens before saving to database (never store in plaintext)
  const encryptedAccessToken = encryptToken(tokens.access_token);
  const encryptedRefreshToken = tokens.refresh_token ? encryptToken(tokens.refresh_token) : undefined;

  const existingConnection = await CalendarConnection.findOne({ userId });

  const updatePayload = {
    userId,
    provider: 'GOOGLE',
    googleAccountEmail,
    accessToken: encryptedAccessToken,
    expiryDate: tokens.expiry_date || 0,
    scope: tokens.scope ? tokens.scope.split(' ') : SCOPES,
    calendarId: 'primary',
    isConnected: true,
    connectedAt: new Date(),
  };

  // Only update refresh token if Google returned a new one
  if (encryptedRefreshToken) {
    updatePayload.refreshToken = encryptedRefreshToken;
  } else if (!existingConnection || !existingConnection.refreshToken) {
    updatePayload.refreshToken = '';
    console.warn(
      `[CalendarService] Warning: Google did not return a refresh_token for user ${userId}. ` +
      'If token refresh fails in future, user should revoke app access at https://myaccount.google.com/permissions and reconnect.'
    );
  }

  await CalendarConnection.findOneAndUpdate(
    { userId },
    updatePayload,
    { new: true, upsert: true }
  );

  console.log(`[CalendarService] Successfully linked Google Calendar for user ${userId} (${googleAccountEmail})`);

  return {
    success: true,
    userId,
    email: googleAccountEmail,
  };
};

/**
 * Build an authorized OAuth2 Client for a specific user, loading and decrypting their tokens
 * Registers automatic token refresh listener to persist new tokens back to MongoDB
 * @param {string} userId
 * @returns {Promise<InstanceType<typeof google.auth.OAuth2>|null>}
 */
const getAuthorizedClientForUser = async (userId) => {
  try {
    const connection = await CalendarConnection.findOne({
      userId,
      isConnected: true,
    });

    if (!connection || !connection.accessToken) {
      return null;
    }

    const decryptedAccessToken = decryptToken(connection.accessToken);
    const decryptedRefreshToken = connection.refreshToken ? decryptToken(connection.refreshToken) : '';

    if (!decryptedAccessToken && !decryptedRefreshToken) {
      return null;
    }

    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({
      access_token: decryptedAccessToken,
      refresh_token: decryptedRefreshToken,
      expiry_date: connection.expiryDate,
    });

    // Automatic token refresh listener
    oauth2Client.on('tokens', async (newTokens) => {
      try {
        const updateData = {
          accessToken: encryptToken(newTokens.access_token),
          expiryDate: newTokens.expiry_date || connection.expiryDate,
        };

        if (newTokens.refresh_token) {
          updateData.refreshToken = encryptToken(newTokens.refresh_token);
        }

        await CalendarConnection.findOneAndUpdate({ userId }, updateData);
        console.log(`[CalendarService] Automatically refreshed & stored OAuth access token for user ${userId}`);
      } catch (saveErr) {
        console.error('[CalendarService] Failed to persist refreshed token:', saveErr.message);
      }
    });

    return oauth2Client;
  } catch (err) {
    console.error(`[CalendarService] Error building authorized client for user ${userId}:`, err.message);
    return null;
  }
};

/**
 * Create an event in user's connected Google Calendar
 * @param {string} userId
 * @param {object} eventDetails - { summary, description, startDateTime, endDateTime, timeZone, location }
 * @returns {Promise<string|null>} - Returns created Google Event ID or null
 */
const createEvent = async (userId, eventDetails) => {
  try {
    const authClient = await getAuthorizedClientForUser(userId);
    if (!authClient) {
      return null; // Graceful skip if user has not connected calendar
    }

    const calendar = google.calendar({ version: 'v3', auth: authClient });

    const timeZone = eventDetails.timeZone || config.APPOINTMENT_TIMEZONE || 'Asia/Kolkata';
    const resolvedTz = (timeZone === 'UTC') ? 'UTC' : 'Asia/Kolkata';
    
    const ensureIsoOffset = (dtStr, tz) => {
      if (!dtStr) return dtStr;
      if (/([+-]\d{2}:\d{2}|Z)$/.test(dtStr)) return dtStr;
      return `${dtStr}${tz === 'UTC' ? 'Z' : '+05:30'}`;
    };

    const startDateTime = ensureIsoOffset(eventDetails.startDateTime, resolvedTz);
    const endDateTime = ensureIsoOffset(eventDetails.endDateTime, resolvedTz);

    const eventPayload = {
      summary: eventDetails.summary || 'Medical Appointment',
      description: eventDetails.description || 'HealthPulse Healthcare Appointment',
      location: eventDetails.location || '',
      start: {
        dateTime: startDateTime,
        timeZone: resolvedTz,
      },
      end: {
        dateTime: endDateTime,
        timeZone: resolvedTz,
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 60 },
          { method: 'popup', minutes: 15 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: eventPayload,
    });

    const eventId = response.data?.id || null;
    if (eventId) {
      console.log(`[CalendarService] Event created in Google Calendar (${eventId}) for user ${userId}`);
    }
    return eventId;
  } catch (err) {
    console.warn(`[CalendarService] Error creating calendar event for user ${userId}:`, err.message);
    if (err.message && (err.message.includes('invalid_grant') || err.message.includes('Token has been expired or revoked'))) {
      // Mark connection as disconnected if token was revoked externally
      await CalendarConnection.findOneAndUpdate({ userId }, { isConnected: false }).catch(() => {});
    }
    return null;
  }
};

/**
 * Update an existing event in user's connected Google Calendar
 * @param {string} userId
 * @param {string} eventId
 * @param {object} eventDetails
 * @returns {Promise<boolean>}
 */
const updateEvent = async (userId, eventId, eventDetails) => {
  if (!eventId) {
    return false;
  }

  try {
    const authClient = await getAuthorizedClientForUser(userId);
    if (!authClient) {
      return false;
    }

    const timeZone = eventDetails.timeZone || config.APPOINTMENT_TIMEZONE || 'Asia/Kolkata';
    const resolvedTz = (timeZone === 'UTC') ? 'UTC' : 'Asia/Kolkata';
    
    const ensureIsoOffset = (dtStr, tz) => {
      if (!dtStr) return dtStr;
      if (/([+-]\d{2}:\d{2}|Z)$/.test(dtStr)) return dtStr;
      return `${dtStr}${tz === 'UTC' ? 'Z' : '+05:30'}`;
    };

    const startDateTime = ensureIsoOffset(eventDetails.startDateTime, resolvedTz);
    const endDateTime = ensureIsoOffset(eventDetails.endDateTime, resolvedTz);

    const eventPayload = {
      summary: eventDetails.summary,
      description: eventDetails.description,
      location: eventDetails.location || '',
      start: {
        dateTime: startDateTime,
        timeZone: resolvedTz,
      },
      end: {
        dateTime: endDateTime,
        timeZone: resolvedTz,
      },
    };

    await calendar.events.update({
      calendarId: 'primary',
      eventId,
      resource: eventPayload,
    });

    console.log(`[CalendarService] Event updated in Google Calendar (${eventId}) for user ${userId}`);
    return true;
  } catch (err) {
    console.warn(`[CalendarService] Error updating calendar event ${eventId} for user ${userId}:`, err.message);
    if (err.message && (err.message.includes('invalid_grant') || err.message.includes('Token has been expired or revoked'))) {
      await CalendarConnection.findOneAndUpdate({ userId }, { isConnected: false }).catch(() => {});
    }
    return false;
  }
};

/**
 * Delete an event from user's connected Google Calendar
 * @param {string} userId
 * @param {string} eventId
 * @returns {Promise<boolean>}
 */
const deleteEvent = async (userId, eventId) => {
  if (!eventId) {
    return false;
  }

  try {
    const authClient = await getAuthorizedClientForUser(userId);
    if (!authClient) {
      return false;
    }

    const calendar = google.calendar({ version: 'v3', auth: authClient });
    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
    });

    console.log(`[CalendarService] Event deleted from Google Calendar (${eventId}) for user ${userId}`);
    return true;
  } catch (err) {
    // 404 or 410 means already deleted in Google Calendar
    if ([404, 410].includes(err.code || err.status)) {
      return true;
    }
    console.warn(`[CalendarService] Error deleting calendar event ${eventId} for user ${userId}:`, err.message);
    if (err.message && (err.message.includes('invalid_grant') || err.message.includes('Token has been expired or revoked'))) {
      await CalendarConnection.findOneAndUpdate({ userId }, { isConnected: false }).catch(() => {});
    }
    return false;
  }
};

/**
 * List upcoming events for sync check or debugging
 * @param {string} userId
 * @param {object} opts
 * @returns {Promise<Array>}
 */
const listUpcomingEvents = async (userId, opts = {}) => {
  try {
    const authClient = await getAuthorizedClientForUser(userId);
    if (!authClient) {
      return [];
    }

    const calendar = google.calendar({ version: 'v3', auth: authClient });
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: opts.timeMin || new Date().toISOString(),
      maxResults: opts.maxResults || 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items || [];
  } catch (err) {
    console.warn(`[CalendarService] Error listing events for user ${userId}:`, err.message);
    return [];
  }
};

/**
 * Disconnect Google Calendar and revoke tokens
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
const disconnectCalendar = async (userId) => {
  const connection = await CalendarConnection.findOne({ userId, isConnected: true });
  if (!connection) {
    return true;
  }

  try {
    if (connection.accessToken) {
      const decryptedToken = decryptToken(connection.accessToken);
      const oauth2Client = createOAuth2Client();
      await oauth2Client.revokeToken(decryptedToken).catch(() => {});
    }
  } catch (err) {
    console.warn('[CalendarService] Error revoking token with Google:', err.message);
  }

  connection.isConnected = false;
  connection.accessToken = '';
  connection.refreshToken = '';
  await connection.save();

  console.log(`[CalendarService] Disconnected Google Calendar for user ${userId}`);
  return true;
};

/**
 * Get current Google Calendar connection status for a user
 * @param {string} userId
 * @returns {Promise<{ connected: boolean, googleAccountEmail: string, connectedAt: Date|null, calendarId: string }>}
 */
const getConnectionStatus = async (userId) => {
  const connection = await CalendarConnection.findOne({ userId });

  if (!connection || !connection.isConnected) {
    return {
      connected: false,
      isConnected: false,
      googleAccountEmail: '',
      connectedAt: null,
      calendarId: 'primary',
    };
  }

  return {
    connected: true,
    isConnected: true,
    googleAccountEmail: connection.googleAccountEmail || '',
    connectedAt: connection.connectedAt || connection.updatedAt,
    calendarId: connection.calendarId || 'primary',
  };
};

module.exports = {
  createOAuth2Client,
  generateConnectAuthUrl,
  handleOAuthCallback,
  getAuthorizedClientForUser,
  createEvent,
  updateEvent,
  deleteEvent,
  listUpcomingEvents,
  disconnectCalendar,
  getConnectionStatus,
};
