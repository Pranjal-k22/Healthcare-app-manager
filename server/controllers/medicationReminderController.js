const {
  getPatientReminders,
  markReminderTaken,
  markReminderSkipped,
  generateRemindersForPrescription,
} = require('../services/medication/medicationScheduleService');
const MedicationReminder = require('../models/MedicationReminder');

/**
 * @desc    Get patient's medication reminders for today
 * @route   GET /api/medication-reminders/today
 * @access  Private (Patient)
 */
const getTodayRemindersHandler = async (req, res, next) => {
  try {
    const reminders = await getPatientReminders(req.user._id, {
      filter: 'today',
      date: req.query.date,
    });

    res.status(200).json({
      success: true,
      count: reminders.length,
      data: reminders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get patient's upcoming scheduled doses
 * @route   GET /api/medication-reminders/upcoming
 * @access  Private (Patient)
 */
const getUpcomingRemindersHandler = async (req, res, next) => {
  try {
    const reminders = await getPatientReminders(req.user._id, {
      filter: 'upcoming',
      date: req.query.date,
    });

    res.status(200).json({
      success: true,
      count: reminders.length,
      data: reminders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get patient's complete medication reminder history
 * @route   GET /api/medication-reminders/history
 * @access  Private (Patient)
 */
const getReminderHistoryHandler = async (req, res, next) => {
  try {
    const reminders = await getPatientReminders(req.user._id, {
      filter: 'history',
    });

    res.status(200).json({
      success: true,
      count: reminders.length,
      data: reminders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a medication dose as taken
 * @route   PATCH /api/medication-reminders/:id/taken
 * @access  Private (Patient)
 */
const markTakenHandler = async (req, res, next) => {
  try {
    const updated = await markReminderTaken(req.params.id, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Medication marked as taken',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a medication dose as skipped / missed
 * @route   PATCH /api/medication-reminders/:id/skip
 * @access  Private (Patient)
 */
const markSkippedHandler = async (req, res, next) => {
  try {
    const updated = await markReminderSkipped(req.params.id, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Medication marked as skipped',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get reminders for a specific prescription (Patient or assigned Doctor)
 * @route   GET /api/prescriptions/:prescriptionId/reminders
 * @access  Private
 */
const getPrescriptionRemindersHandler = async (req, res, next) => {
  try {
    const { prescriptionId } = req.params;
    const reminders = await MedicationReminder.find({ prescriptionId }).sort({
      scheduledDateTime: 1,
    });

    res.status(200).json({
      success: true,
      count: reminders.length,
      data: reminders,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTodayRemindersHandler,
  getUpcomingRemindersHandler,
  getReminderHistoryHandler,
  markTakenHandler,
  markSkippedHandler,
  getPrescriptionRemindersHandler,
};
