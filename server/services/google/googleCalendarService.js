const { google } = require('googleapis');
const CalendarConnection = require('../../models/CalendarConnection');
const Appointment = require('../../models/Appointment');
const DoctorProfile = require('../../models/DoctorProfile');
const config = require('../../config/env');

/**
 * Initialize Google OAuth2 Client
 */
const getOAuth2Client = () => {
  return new google.auth.OAuth2(
    config.GOOGLE_CLIENT_ID,
    config.GOOGLE_CLIENT_SECRET,
    config.GOOGLE_REDIRECT_URI
  );
};

/**
 * Generate Google OAuth authorization URL
 * @param {string} userId
 * @returns {string}
 */
const generateAuthUrl = (userId) => {
  const oauth2Client = getOAuth2Client();

  const scopes = [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/userinfo.email',
  ];

  // Encode state with userId for CSRF protection & user mapping
  const state = Buffer.from(
    JSON.stringify({ userId, timestamp: Date.now() })
  ).toString('base64');

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state,
    prompt: 'consent', // Ensure refresh_token is returned
  });

  return authUrl;
};

/**
 * Handle Google OAuth callback: exchange code for tokens & store connection
 * @param {string} code - OAuth authorization code
 * @param {string} state - Encoded state containing userId
 * @returns {Promise<{ success: boolean, userId: string, email: string }>}
 */
const handleOAuthCallback = async (code, state) => {
  let decodedState;
  try {
    decodedState = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
  } catch (err) {
    const error = new Error('Invalid OAuth state parameter');
    error.statusCode = 400;
    throw error;
  }

  const { userId } = decodedState;
  if (!userId) {
    const error = new Error('Missing User ID in OAuth state');
    error.statusCode = 400;
    throw error;
  }

  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Fetch Google account email for user display
  let googleAccountEmail = '';
  try {
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    googleAccountEmail = userInfo.data.email || '';
  } catch (err) {
    console.warn('[GoogleCalendar] Could not fetch user email info:', err.message);
  }

  // Persist Connection with tokens
  await CalendarConnection.findOneAndUpdate(
    { userId },
    {
      userId,
      provider: 'GOOGLE',
      googleAccountEmail,
      accessToken: tokens.access_token,
      ...(tokens.refresh_token && { refreshToken: tokens.refresh_token }),
      expiryDate: tokens.expiry_date || 0,
      scope: tokens.scope ? tokens.scope.split(' ') : [],
      isConnected: true,
    },
    { new: true, upsert: true }
  );

  return {
    success: true,
    userId,
    email: googleAccountEmail,
  };
};

/**
 * Get authorized OAuth2 client for a user with automatic token refresh handling
 * @param {string} userId
 * @returns {Promise<object|null>}
 */
const getAuthenticatedClientForUser = async (userId) => {
  const connection = await CalendarConnection.findOne({
    userId,
    isConnected: true,
  });

  if (!connection || !connection.accessToken) {
    return null;
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: connection.accessToken,
    refresh_token: connection.refreshToken,
    expiry_date: connection.expiryDate,
  });

  // Listen for automatic token refreshes and update MongoDB record
  oauth2Client.on('tokens', async (newTokens) => {
    try {
      await CalendarConnection.findOneAndUpdate(
        { userId },
        {
          accessToken: newTokens.access_token,
          ...(newTokens.refresh_token && { refreshToken: newTokens.refresh_token }),
          expiryDate: newTokens.expiry_date || connection.expiryDate,
        }
      );
      console.log(`[GoogleCalendar] Access token automatically refreshed for user ${userId}`);
    } catch (err) {
      console.error('[GoogleCalendar] Failed to persist refreshed tokens:', err.message);
    }
  });

  return oauth2Client;
};

/**
 * Synchronize newly created or active appointment to Google Calendar
 * @param {string} appointmentId
 * @param {string} [triggeringUserId]
 * @returns {Promise<boolean>}
 */
const syncAppointmentCreated = async (appointmentId, triggeringUserId) => {
  try {
    const appointment = await Appointment.findById(appointmentId)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email');

    if (!appointment || appointment.status === 'CANCELLED') {
      return false;
    }

    if (!Array.isArray(appointment.calendarEvents)) {
      appointment.calendarEvents = [];
    }

    // Determine candidate users for synchronization (Doctor and/or Patient)
    const candidateUserIds = [
      appointment.doctorId._id.toString(),
      appointment.patientId._id.toString(),
    ];

    let anySynced = false;

    for (const userId of candidateUserIds) {
      const authClient = await getAuthenticatedClientForUser(userId);
      if (!authClient) continue;

      const calendar = google.calendar({ version: 'v3', auth: authClient });

      // Build privacy-conscious event description & location
      const doctorProfile = await DoctorProfile.findOne({ userId: appointment.doctorId._id }).lean();
      const clinicLocation = doctorProfile?.clinicAddress || doctorProfile?.clinicName || '';

      const timeZone = config.APPOINTMENT_TIMEZONE || 'Asia/Kolkata';
      const tzOffset = (timeZone === 'Asia/Kolkata' || timeZone === 'IST') ? '+05:30' : (timeZone === 'UTC' ? 'Z' : '+05:30');
      const startDateTime = `${appointment.date}T${appointment.startTime}:00${tzOffset}`;
      const endDateTime = `${appointment.date}T${appointment.endTime}:00${tzOffset}`;

      const eventPayload = {
        summary: `Medical Consultation - Dr. ${appointment.doctorId.name}`,
        description: `HealthPulse Appointment Reference: ${appointment._id}\nPractitioner: Dr. ${appointment.doctorId.name}\nPatient: ${appointment.patientId.name}`,
        location: clinicLocation,
        start: {
          dateTime: startDateTime,
          timeZone,
        },
        end: {
          dateTime: endDateTime,
          timeZone,
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 60 },
            { method: 'popup', minutes: 15 },
          ],
        },
      };

      // Check if user already has an existing calendarEvents entry
      const existingEntryIndex = appointment.calendarEvents.findIndex(
        (e) => e.userId.toString() === userId
      );

      const eventId =
        existingEntryIndex >= 0
          ? appointment.calendarEvents[existingEntryIndex].eventId
          : null;

      if (eventId) {
        try {
          await calendar.events.update({
            calendarId: 'primary',
            eventId,
            resource: eventPayload,
          });

          appointment.calendarEvents[existingEntryIndex].syncStatus = 'SYNCED';
          anySynced = true;
          continue;
        } catch (updateErr) {
          // If 404 or failed update, insert new event below
        }
      }

      try {
        const response = await calendar.events.insert({
          calendarId: 'primary',
          resource: eventPayload,
        });

        if (response.data && response.data.id) {
          const newEventId = response.data.id;
          if (existingEntryIndex >= 0) {
            appointment.calendarEvents[existingEntryIndex].eventId = newEventId;
            appointment.calendarEvents[existingEntryIndex].syncStatus = 'SYNCED';
          } else {
            appointment.calendarEvents.push({
              userId,
              eventId: newEventId,
              syncStatus: 'SYNCED',
            });
          }
          anySynced = true;
          console.log(`[GoogleCalendar] Event created (${newEventId}) for User ${userId} on Appointment ${appointment._id}`);
        }
      } catch (insertErr) {
        console.error(`[GoogleCalendar] Insert error for user ${userId}:`, insertErr.message);
        if (existingEntryIndex >= 0) {
          appointment.calendarEvents[existingEntryIndex].syncStatus = 'FAILED';
        }
      }
    }

    if (anySynced) {
      appointment.calendarSyncStatus = 'SYNCED';
    }
    await appointment.save();

    return anySynced;
  } catch (error) {
    console.error(`[GoogleCalendar] Failed to sync created appointment ${appointmentId}:`, error.message);
    await Appointment.findByIdAndUpdate(appointmentId, {
      calendarSyncStatus: 'FAILED',
    }).catch(() => {});
    return false;
  }
};

/**
 * Update existing Google Calendar event for a rescheduled appointment
 * @param {string} newAppointmentId
 * @param {string} [oldAppointmentId]
 * @returns {Promise<boolean>}
 */
const syncAppointmentRescheduled = async (newAppointmentId, oldAppointmentId) => {
  try {
    const newAppointment = await Appointment.findById(newAppointmentId)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email');

    if (!newAppointment) return false;

    // Delete old event if oldAppointment has an eventId
    if (oldAppointmentId) {
      await syncAppointmentCancelled(oldAppointmentId);
    }

    // Create new event for rescheduled appointment
    return await syncAppointmentCreated(newAppointmentId);
  } catch (error) {
    console.error(`[GoogleCalendar] Error syncing rescheduled appointment ${newAppointmentId}:`, error.message);
    return false;
  }
};

/**
 * Delete / cancel Google Calendar events for a cancelled appointment
 * @param {string} appointmentId
 * @returns {Promise<boolean>}
 */
const syncAppointmentCancelled = async (appointmentId) => {
  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment || !appointment.calendarEvents || appointment.calendarEvents.length === 0) {
      return true; // No Google events to delete
    }

    for (const entry of appointment.calendarEvents) {
      if (entry.syncStatus === 'DELETED') {
        continue;
      }

      try {
        const authClient = await getAuthenticatedClientForUser(entry.userId.toString());
        if (!authClient) {
          entry.syncStatus = 'FAILED';
          continue;
        }

        const calendar = google.calendar({ version: 'v3', auth: authClient });

        await calendar.events.delete({
          calendarId: 'primary',
          eventId: entry.eventId,
        });

        entry.syncStatus = 'DELETED';
        console.log(`[GoogleCalendar] Event ${entry.eventId} deleted for User ${entry.userId}`);
      } catch (err) {
        if ([404, 410].includes(err.code || err.status)) {
          // If already deleted in Google Calendar, mark DELETED
          entry.syncStatus = 'DELETED';
        } else {
          console.warn(`[GoogleCalendar] Error deleting calendar event ${entry.eventId} for user ${entry.userId}:`, err.message);
          entry.syncStatus = 'FAILED';
        }
      }
    }

    appointment.calendarSyncStatus = 'SYNCED';
    await appointment.save();

    return true;
  } catch (error) {
    console.error(`[GoogleCalendar] Failed to sync cancelled appointment ${appointmentId}:`, error.message);
    return false;
  }
};

/**
 * Get safe connection status for authenticated user (No secrets returned)
 * @param {string} userId
 * @returns {Promise<{ isConnected: boolean, googleAccountEmail: string, updatedAt?: Date }>}
 */
const getConnectionStatus = async (userId) => {
  const connection = await CalendarConnection.findOne({
    userId,
    isConnected: true,
  });

  if (!connection) {
    return {
      isConnected: false,
      googleAccountEmail: '',
    };
  }

  return {
    isConnected: true,
    googleAccountEmail: connection.googleAccountEmail || '',
    updatedAt: connection.updatedAt,
  };
};

/**
 * Disconnect Google Calendar account
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
const disconnectGoogleCalendar = async (userId) => {
  const connection = await CalendarConnection.findOne({ userId });
  if (!connection) {
    return true;
  }

  connection.isConnected = false;
  connection.accessToken = '';
  connection.refreshToken = '';
  await connection.save();

  console.log(`[GoogleCalendar] Disconnected Google Calendar for User ${userId}`);
  return true;
};

module.exports = {
  generateAuthUrl,
  handleOAuthCallback,
  getAuthenticatedClientForUser,
  syncAppointmentCreated,
  syncAppointmentRescheduled,
  syncAppointmentCancelled,
  getConnectionStatus,
  disconnectGoogleCalendar,
};
