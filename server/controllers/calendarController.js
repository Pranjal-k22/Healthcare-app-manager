const {
  generateAuthUrl,
  handleOAuthCallback,
  getConnectionStatus,
  disconnectGoogleCalendar,
  syncAppointmentCreated,
} = require('../services/google/googleCalendarService');
const Appointment = require('../models/Appointment');
const config = require('../config/env');

/**
 * @desc    Get Google OAuth authorization URL
 * @route   GET /api/calendar/oauth/url
 * @access  Private (All Authenticated)
 */
const getAuthUrlHandler = async (req, res, next) => {
  try {
    if (!config.GOOGLE_CLIENT_ID || !config.GOOGLE_CLIENT_SECRET) {
      return res.status(400).json({
        success: false,
        message:
          'Google Calendar OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in server environment.',
      });
    }

    const authUrl = generateAuthUrl(req.user._id.toString());

    res.status(200).json({
      success: true,
      data: {
        authUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Handle Google OAuth callback redirect
 * @route   GET /api/calendar/oauth/callback
 * @access  Public (Redirect from Google OAuth)
 */
const oauthCallbackHandler = async (req, res, next) => {
  try {
    const { code, state, error: googleError } = req.query;

    if (googleError) {
      console.warn('[GoogleCalendar] User denied or encountered OAuth error:', googleError);
      return res.redirect(`${config.CLIENT_URL}/?calendar_error=${encodeURIComponent(googleError)}`);
    }

    if (!code || !state) {
      return res.redirect(`${config.CLIENT_URL}/?calendar_error=missing_oauth_parameters`);
    }

    const result = await handleOAuthCallback(code, state);

    // Sync any future booked appointments for this user
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const futureAppointments = await Appointment.find({
        $or: [{ patientId: result.userId }, { doctorId: result.userId }],
        date: { $gte: todayStr },
        status: 'BOOKED',
      }).select('_id');

      for (const app of futureAppointments) {
        syncAppointmentCreated(app._id.toString(), result.userId).catch(() => {});
      }
    } catch (syncErr) {
      console.warn('[GoogleCalendar] Initial sync after OAuth had warning:', syncErr.message);
    }

    // Redirect safely back to frontend without tokens in URL
    res.redirect(`${config.CLIENT_URL}/?calendar_connected=true`);
  } catch (error) {
    console.error('[GoogleCalendar] OAuth callback error:', error.message);
    res.redirect(
      `${config.CLIENT_URL}/?calendar_error=${encodeURIComponent(
        error.message || 'oauth_failed'
      )}`
    );
  }
};

/**
 * @desc    Get current user's Google Calendar connection status
 * @route   GET /api/calendar/status
 * @access  Private (All Authenticated)
 */
const getConnectionStatusHandler = async (req, res, next) => {
  try {
    const status = await getConnectionStatus(req.user._id);

    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Disconnect Google Calendar for current user
 * @route   POST /api/calendar/disconnect
 * @access  Private (All Authenticated)
 */
const disconnectCalendarHandler = async (req, res, next) => {
  try {
    await disconnectGoogleCalendar(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Google Calendar disconnected successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Manually trigger sync for an appointment
 * @route   POST /api/calendar/sync/:appointmentId
 * @access  Private (All Authenticated)
 */
const manualSyncHandler = async (req, res, next) => {
  try {
    const success = await syncAppointmentCreated(
      req.params.appointmentId,
      req.user._id.toString()
    );

    res.status(200).json({
      success: true,
      message: success
        ? 'Appointment synchronized with Google Calendar'
        : 'Could not synchronize. Please verify Google Calendar connection.',
      data: {
        synced: success,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAuthUrlHandler,
  oauthCallbackHandler,
  getConnectionStatusHandler,
  disconnectCalendarHandler,
  manualSyncHandler,
};
