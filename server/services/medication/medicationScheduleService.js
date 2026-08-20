const mongoose = require('mongoose');
const Prescription = require('../../models/Prescription');
const Appointment = require('../../models/Appointment');
const MedicationReminder = require('../../models/MedicationReminder');

/**
 * Parse structured frequency into discrete daily time slots (HH:mm)
 * @param {string} frequency
 * @returns {string[]}
 */
const parseFrequencyToTimes = (frequency) => {
  if (!frequency || typeof frequency !== 'string') {
    return ['08:00'];
  }

  const f = frequency.trim().toLowerCase();

  // Check if explicit comma/space separated HH:mm times are provided (e.g. "09:00, 21:00")
  const explicitTimes = f.match(/\b([01]\d|2[0-3]):([0-5]\d)\b/g);
  if (explicitTimes && explicitTimes.length > 0) {
    return Array.from(new Set(explicitTimes)).sort();
  }

  if (f.includes('bedtime') || f.includes('night') || f.includes('hs')) {
    return ['21:00'];
  }

  if (
    f.includes('four') ||
    f.includes('4 times') ||
    f.includes('4x') ||
    f === 'qid'
  ) {
    return ['08:00', '12:00', '16:00', '20:00'];
  }

  if (
    f.includes('three') ||
    f.includes('3 times') ||
    f.includes('3x') ||
    f === 'tid'
  ) {
    return ['08:00', '14:00', '20:00'];
  }

  if (
    f.includes('twice') ||
    f.includes('2 times') ||
    f.includes('2x') ||
    f === 'bid' ||
    f === 'bd'
  ) {
    return ['08:00', '20:00'];
  }

  if (f.includes('every 6 hours') || f.includes('q6h')) {
    return ['06:00', '12:00', '18:00', '00:00'];
  }

  if (f.includes('every 8 hours') || f.includes('q8h')) {
    return ['08:00', '16:00', '00:00'];
  }

  if (f.includes('every 12 hours') || f.includes('q12h')) {
    return ['08:00', '20:00'];
  }

  // Once daily default
  return ['08:00'];
};

/**
 * Parse structured duration into number of active days
 * @param {string} duration
 * @returns {number}
 */
const parseDurationToDays = (duration) => {
  if (!duration || typeof duration !== 'string') {
    return 7;
  }

  const d = duration.trim().toLowerCase();

  const weekMatch = d.match(/(\d+)\s*week/);
  if (weekMatch) {
    return parseInt(weekMatch[1], 10) * 7;
  }

  const monthMatch = d.match(/(\d+)\s*month/);
  if (monthMatch) {
    return parseInt(monthMatch[1], 10) * 30;
  }

  const dayMatch = d.match(/(\d+)\s*day/);
  if (dayMatch) {
    return parseInt(dayMatch[1], 10);
  }

  const genericNum = d.match(/\b(\d+)\b/);
  if (genericNum) {
    return parseInt(genericNum[1], 10);
  }

  return 7;
};

/**
 * Generate and persist medication reminder records from a structured prescription
 * @param {string} prescriptionId
 * @returns {Promise<Array>}
 */
const generateRemindersForPrescription = async (prescriptionId) => {
  if (!mongoose.Types.ObjectId.isValid(prescriptionId)) {
    const error = new Error('Invalid Prescription ID');
    error.statusCode = 400;
    throw error;
  }

  const prescription = await Prescription.findById(prescriptionId).populate(
    'appointmentId'
  );
  if (!prescription) {
    const error = new Error('Prescription not found');
    error.statusCode = 404;
    throw error;
  }

  const appointment = prescription.appointmentId;
  const startDateStr =
    appointment && appointment.date
      ? appointment.date
      : new Date().toISOString().split('T')[0];

  // 1. Cancel existing PENDING reminders for this prescription if it was modified
  await MedicationReminder.updateMany(
    { prescriptionId, status: 'PENDING' },
    { status: 'CANCELLED' }
  );

  const newReminderDocs = [];

  for (const medicine of prescription.medicines || []) {
    const times = parseFrequencyToTimes(medicine.frequency);
    const totalDays = Math.min(parseDurationToDays(medicine.duration), 90); // Cap at 90 days for safety

    const baseDate = new Date(startDateStr);

    for (let dayOffset = 0; dayOffset < totalDays; dayOffset++) {
      const currentDate = new Date(baseDate);
      currentDate.setDate(baseDate.getDate() + dayOffset);
      const dateStr = currentDate.toISOString().split('T')[0];

      for (const timeStr of times) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const scheduledDateTime = new Date(currentDate);
        scheduledDateTime.setHours(hours, minutes, 0, 0);

        newReminderDocs.push({
          patientId: prescription.patientId,
          doctorId: prescription.doctorId,
          prescriptionId: prescription._id,
          appointmentId: prescription.appointmentId?._id || prescription.appointmentId,
          medicineName: medicine.name,
          dosage: medicine.dosage,
          instructions: medicine.instructions || 'Take with water after meals',
          scheduledDate: dateStr,
          scheduledTime: timeStr,
          scheduledDateTime,
          status: 'PENDING',
        });
      }
    }
  }

  if (newReminderDocs.length === 0) {
    return [];
  }

  // Insert using bulk write with upsert / ignore duplicates
  try {
    const operations = newReminderDocs.map((doc) => ({
      updateOne: {
        filter: {
          prescriptionId: doc.prescriptionId,
          medicineName: doc.medicineName,
          scheduledDate: doc.scheduledDate,
          scheduledTime: doc.scheduledTime,
        },
        update: { $setOnInsert: doc },
        upsert: true,
      },
    }));

    await MedicationReminder.bulkWrite(operations, { ordered: false });
    console.log(
      `[MedicationReminder] Scheduled ${newReminderDocs.length} dose reminders for Prescription ${prescriptionId}`
    );
  } catch (bulkError) {
    console.warn('[MedicationReminder] Warning during bulk upsert:', bulkError.message);
  }

  return await MedicationReminder.find({
    prescriptionId,
    status: { $in: ['PENDING', 'SENT'] },
  }).sort({ scheduledDateTime: 1 });
};

/**
 * Get patient's medication reminders
 * @param {string} patientId
 * @param {object} query - { filter: 'today' | 'upcoming' | 'history', date: 'YYYY-MM-DD' }
 * @returns {Promise<Array>}
 */
const getPatientReminders = async (patientId, query = {}) => {
  const { filter = 'today', date } = query;
  const todayStr = date || new Date().toISOString().split('T')[0];

  const baseQuery = { patientId };

  if (filter === 'today') {
    baseQuery.scheduledDate = todayStr;
    baseQuery.status = { $ne: 'CANCELLED' };
    return await MedicationReminder.find(baseQuery)
      .populate('doctorId', 'name email')
      .sort({ scheduledTime: 1 });
  }

  if (filter === 'upcoming') {
    baseQuery.scheduledDate = { $gte: todayStr };
    baseQuery.status = { $in: ['PENDING', 'SENT'] };
    return await MedicationReminder.find(baseQuery)
      .populate('doctorId', 'name email')
      .sort({ scheduledDateTime: 1 })
      .limit(50);
  }

  // History
  baseQuery.status = { $in: ['TAKEN', 'MISSED', 'SENT', 'PENDING'] };
  return await MedicationReminder.find(baseQuery)
    .populate('doctorId', 'name email')
    .sort({ scheduledDateTime: -1 })
    .limit(100);
};

/**
 * Patient marks medicine as taken
 * @param {string} reminderId
 * @param {string} patientId
 * @returns {Promise<object>}
 */
const markReminderTaken = async (reminderId, patientId) => {
  if (!mongoose.Types.ObjectId.isValid(reminderId)) {
    const error = new Error('Invalid Reminder ID');
    error.statusCode = 400;
    throw error;
  }

  const reminder = await MedicationReminder.findById(reminderId);
  if (!reminder) {
    const error = new Error('Medication reminder not found');
    error.statusCode = 404;
    throw error;
  }

  if (reminder.patientId.toString() !== patientId.toString()) {
    const error = new Error('Access denied: You can only update your own medication reminders');
    error.statusCode = 403;
    throw error;
  }

  reminder.status = 'TAKEN';
  reminder.takenAt = new Date();
  await reminder.save();

  return reminder;
};

/**
 * Patient marks medicine as skipped / missed
 * @param {string} reminderId
 * @param {string} patientId
 * @returns {Promise<object>}
 */
const markReminderSkipped = async (reminderId, patientId) => {
  if (!mongoose.Types.ObjectId.isValid(reminderId)) {
    const error = new Error('Invalid Reminder ID');
    error.statusCode = 400;
    throw error;
  }

  const reminder = await MedicationReminder.findById(reminderId);
  if (!reminder) {
    const error = new Error('Medication reminder not found');
    error.statusCode = 404;
    throw error;
  }

  if (reminder.patientId.toString() !== patientId.toString()) {
    const error = new Error('Access denied: You can only update your own medication reminders');
    error.statusCode = 403;
    throw error;
  }

  reminder.status = 'MISSED';
  await reminder.save();

  return reminder;
};

/**
 * Cancel all pending reminders for a prescription
 * @param {string} prescriptionId
 * @returns {Promise<number>}
 */
const cancelRemindersForPrescription = async (prescriptionId) => {
  const result = await MedicationReminder.updateMany(
    { prescriptionId, status: 'PENDING' },
    { status: 'CANCELLED' }
  );
  return result.modifiedCount;
};

module.exports = {
  parseFrequencyToTimes,
  parseDurationToDays,
  generateRemindersForPrescription,
  getPatientReminders,
  markReminderTaken,
  markReminderSkipped,
  cancelRemindersForPrescription,
};
