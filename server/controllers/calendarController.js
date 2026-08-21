const calendarService = require('../services/calendarService');
const Appointment = require('../models/Appointment');
const config = require('../config/env');

/**
 * GET /api/auth/google/connect or /api/calendar/oauth/url
 * Initiate Google Calendar connection
 */
const getConnectUrl = async (req, res, next) => {
  try {
    if (!config.GOOGLE_CLIENT_ID || !config.GOOGLE_CLIENT_SECRET) {
      return res.status(400).json({
        success: false,
        message: 'Google Calendar OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in server environment.',
      });
    }

    const userId = (req.user.id || req.user._id).toString();
    const url = calendarService.generateConnectAuthUrl(userId);

    res.status(200).json({
      success: true,
      url,
      authUrl: url,
      data: {
        url,
        authUrl: url,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/google/callback or /api/calendar/oauth/callback
 * Handle OAuth callback redirect from Google
 */
const handleCallback = async (req, res, next) => {
  try {
    const { code, state, error: googleError } = req.query;
    const frontendUrl = config.FRONTEND_URL || config.CLIENT_URL || 'http://localhost:5173';

    if (googleError) {
      console.warn('[CalendarController] Google OAuth error / access denied:', googleError);
      return res.redirect(`${frontendUrl}/patient/appointments?calendar_error=${encodeURIComponent(googleError)}`);
    }

    if (!code || !state) {
      return res.redirect(`${frontendUrl}/patient/appointments?calendar_error=missing_oauth_parameters`);
    }

    const result = await calendarService.handleOAuthCallback(code, state);

    // Initial sync of upcoming booked appointments
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const futureAppointments = await Appointment.find({
        $or: [{ patientId: result.userId }, { doctorId: result.userId }],
        date: { $gte: todayStr },
        status: 'BOOKED',
      }).populate('doctorId', 'name').populate('patientId', 'name');

      for (const app of futureAppointments) {
        const startDateTime = `${app.date}T${app.startTime}:00`;
        const endDateTime = `${app.date}T${app.endTime}:00`;
        calendarService.createEvent(result.userId, {
          summary: `Medical Consultation - Dr. ${app.doctorId?.name || 'Practitioner'}`,
          description: `HealthPulse Appointment Reference: ${app._id}\nReason: ${app.reason || 'General Consultation'}`,
          startDateTime,
          endDateTime,
        }).catch(() => {});
      }
    } catch (syncErr) {
      console.warn('[CalendarController] Post-connect appointment sync warning:', syncErr.message);
    }

    // Redirect cleanly back to Appointments page
    return res.redirect(`${frontendUrl}/patient/appointments?calendar_connected=true`);
  } catch (error) {
    console.error('[CalendarController] OAuth callback error:', error.message);
    const frontendUrl = config.FRONTEND_URL || config.CLIENT_URL || 'http://localhost:5173';
    return res.redirect(
      `${frontendUrl}/patient/appointments?calendar_error=${encodeURIComponent(
        error.message || 'oauth_failed'
      )}`
    );
  }
};

/**
 * GET /api/patient/google-calendar/status or /api/calendar/status
 */
const getStatus = async (req, res, next) => {
  try {
    const userId = (req.user.id || req.user._id).toString();
    const status = await calendarService.getConnectionStatus(userId);

    res.status(200).json({
      success: true,
      data: status,
      ...status,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/patient/google-calendar/disconnect or /api/calendar/disconnect
 */
const disconnect = async (req, res, next) => {
  try {
    const userId = (req.user.id || req.user._id).toString();
    await calendarService.disconnectCalendar(userId);

    res.status(200).json({
      success: true,
      message: 'Google Calendar disconnected successfully',
      data: {
        connected: false,
        isConnected: false,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/calendar/events (List upcoming events for sync check)
 */
const listEvents = async (req, res, next) => {
  try {
    const userId = (req.user.id || req.user._id).toString();
    const events = await calendarService.listUpcomingEvents(userId, req.query);

    res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConnectUrl,
  handleCallback,
  getStatus,
  disconnect,
  listEvents,
};
