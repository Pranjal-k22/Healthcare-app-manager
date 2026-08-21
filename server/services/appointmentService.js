const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const SlotHold = require('../models/SlotHold');
const {
  isDateInPast,
  isSlotInPast,
  getWeekdayFromDate,
  addMinutesToTime,
  timeToMinutes,
} = require('../validators/appointmentValidator');
const {
  dispatchAppointmentBooked,
  dispatchAppointmentCancelled,
  dispatchAppointmentRescheduled,
} = require('./notificationService');
const { queueCalendarJob } = require('./jobs/calendarJob');
const { isDoctorOnLeave } = require('./leaveService');
const llmService = require('./llm/llmService');
const { AI_STATUS } = require('./llm/schemas');

/**
 * Format populated appointment document into safe, clean response object
 * @param {object} appDoc
 * @returns {object}
 */
const formatAppointmentResponse = (appDoc) => {
  const patient = appDoc.patientId || {};
  const doctor = appDoc.doctorId || {};

  return {
    id: appDoc._id,
    patientId: patient._id || appDoc.patientId,
    patientName: patient.name || 'Patient',
    patientEmail: patient.email || '',
    doctorId: doctor._id || appDoc.doctorId,
    doctorName: doctor.name || 'Doctor',
    doctorEmail: doctor.email || '',
    date: appDoc.date,
    appointmentDate: appDoc.date,
    startTime: appDoc.startTime,
    endTime: appDoc.endTime,
    status: appDoc.status,
    reason: appDoc.reason || '',
    patientNotes: appDoc.patientNotes || '',
    symptoms: appDoc.symptoms || '',
    preVisitSummary: appDoc.preVisitSummary || null,
    aiStatus: appDoc.aiStatus || 'PENDING',
    createdAt: appDoc.createdAt,
    updatedAt: appDoc.updatedAt,
  };
};

/**
 * Shared validation for doctor slot eligibility (availability, leave, working hours)
 * @param {object} doctorProfile
 * @param {object} doctorUser
 * @param {string} date - YYYY-MM-DD
 * @param {string} startTime - HH:mm
 * @param {object} [options] - { actionVerb: 'hold' | 'book' }
 * @returns {Promise<{ weekday: string, daySchedule: object, slotDuration: number }>}
 */
const validateSlotEligibility = async (
  doctorProfile,
  doctorUser,
  date,
  startTime,
  { actionVerb = 'book' } = {}
) => {
  if (!doctorUser || !doctorProfile) {
    const error = new Error('Doctor profile not found or invalid provider ID');
    error.statusCode = 404;
    throw error;
  }

  if (doctorProfile.isActive === false || doctorProfile.isAvailable === false) {
    const error = new Error('This doctor is currently not accepting appointments');
    error.statusCode = 400;
    throw error;
  }

  const doctorUserId = doctorUser._id;

  if (isDateInPast(date)) {
    const error = new Error(
      actionVerb === 'hold'
        ? 'Cannot hold a slot for past dates'
        : 'Appointments cannot be booked for past dates'
    );
    error.statusCode = 400;
    throw error;
  }

  if (isSlotInPast(date, startTime)) {
    const error = new Error(
      actionVerb === 'hold'
        ? 'Cannot hold a time slot that has already passed'
        : 'Cannot book a time slot that has already passed'
    );
    error.statusCode = 400;
    throw error;
  }

  const isOnDoctorLeave = await isDoctorOnLeave(doctorUserId, date);
  if (isOnDoctorLeave) {
    const error = new Error(`Doctor is on scheduled leave on ${date}`);
    error.statusCode = 400;
    throw error;
  }

  const weekday = getWeekdayFromDate(date);
  const daySchedule = doctorProfile.workingHours
    ? doctorProfile.workingHours[weekday]
    : null;

  if (!daySchedule || !daySchedule.enabled || !daySchedule.start || !daySchedule.end) {
    const error = new Error(`Doctor does not take consultations on ${weekday}s`);
    error.statusCode = 400;
    throw error;
  }

  const slotDuration = doctorProfile.slotDuration || 30;
  const requestedStartMinutes = timeToMinutes(startTime);
  const requestedEndMinutes = requestedStartMinutes + slotDuration;

  const workStartMinutes = timeToMinutes(daySchedule.start);
  const workEndMinutes = timeToMinutes(daySchedule.end);

  if (
    requestedStartMinutes < workStartMinutes ||
    requestedEndMinutes > workEndMinutes
  ) {
    const error = new Error(
      `Requested slot (${startTime}) falls outside doctor's consultation hours (${daySchedule.start} - ${daySchedule.end})`
    );
    error.statusCode = 400;
    throw error;
  }

  return { weekday, daySchedule, slotDuration };
};

/**
 * Hold a slot temporarily for 5 minutes (Idempotent for same patient)
 * @param {object} payload - { patientId, doctorId, date, startTime }
 * @returns {Promise<object>}
 */
const holdSlot = async (payload) => {
  const { doctorId, patientId, date, startTime } = payload;

  // 1. Validate ObjectIDs
  if (!mongoose.Types.ObjectId.isValid(doctorId)) {
    const error = new Error('Invalid Doctor ID format');
    error.statusCode = 400;
    throw error;
  }

  if (!mongoose.Types.ObjectId.isValid(patientId)) {
    const error = new Error('Invalid Patient ID format');
    error.statusCode = 400;
    throw error;
  }

  // 2. Resolve Doctor User & Doctor Profile
  let doctorUser = await User.findById(doctorId);
  let doctorProfile = null;

  if (doctorUser && doctorUser.role === 'DOCTOR') {
    doctorProfile = await DoctorProfile.findOne({ userId: doctorUser._id });
  } else {
    doctorProfile = await DoctorProfile.findById(doctorId);
    if (doctorProfile) {
      doctorUser = await User.findById(doctorProfile.userId);
    }
  }

  await validateSlotEligibility(doctorProfile, doctorUser, date, startTime, {
    actionVerb: 'hold',
  });

  const doctorUserId = doctorUser._id;
  const now = new Date();

  // Check 1: Existing Appointment with status BOOKED or COMPLETED
  const existingActiveAppointment = await Appointment.findOne({
    doctorId: doctorUserId,
    date,
    startTime,
    status: { $in: ['BOOKED', 'COMPLETED'] },
  });

  if (existingActiveAppointment) {
    const error = new Error('This appointment slot is already booked');
    error.statusCode = 409;
    throw error;
  }

  // Check 2: Existing unexpired SlotHold for DIFFERENT patient
  const existingHoldDifferentPatient = await SlotHold.findOne({
    doctorId: doctorUserId,
    date,
    startTime,
    expiresAt: { $gt: now },
    patientId: { $ne: patientId },
  });

  if (existingHoldDifferentPatient) {
    const error = new Error(
      'This slot is currently held by another patient. Please select another slot or try again shortly.'
    );
    error.statusCode = 409;
    throw error;
  }

  // Check 3: If unexpired hold exists for SAME patient, refresh/extend expiresAt
  const existingHoldSamePatient = await SlotHold.findOne({
    doctorId: doctorUserId,
    date,
    startTime,
    expiresAt: { $gt: now },
    patientId,
  });

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  if (existingHoldSamePatient) {
    existingHoldSamePatient.expiresAt = expiresAt;
    await existingHoldSamePatient.save();
    return existingHoldSamePatient;
  }

  // Clean up any expired holds for this slot
  await SlotHold.deleteMany({
    doctorId: doctorUserId,
    date,
    startTime,
    expiresAt: { $lte: now },
  });

  // Create new SlotHold
  const hold = await SlotHold.create({
    doctorId: doctorUserId,
    date,
    startTime,
    patientId,
    expiresAt,
  });

  // Concurrency collision post-check: if multiple unexpired holds were created simultaneously,
  // the first one created wins, and any competing hold is discarded with 409
  const allActiveHolds = await SlotHold.find({
    doctorId: doctorUserId,
    date,
    startTime,
    expiresAt: { $gt: now },
  }).sort({ createdAt: 1, _id: 1 });

  if (
    allActiveHolds.length > 1 &&
    allActiveHolds[0]._id.toString() !== hold._id.toString()
  ) {
    await SlotHold.findByIdAndDelete(hold._id).catch(() => {});
    const error = new Error(
      'This slot is currently held by another patient. Please select another slot or try again shortly.'
    );
    error.statusCode = 409;
    throw error;
  }

  return hold;
};

/**
 * Book a new appointment for a patient with double-booking protection
 * @param {object} payload - { patientId, doctorId, date, startTime, reason, patientNotes }
 * @returns {Promise<object>}
 */
const bookAppointment = async (payload) => {
  const {
    patientId,
    doctorId,
    date: rawDate,
    appointmentDate,
    startTime,
    reason,
    patientNotes,
    symptoms: rawSymptoms,
  } = payload;

  const date = rawDate || appointmentDate;
  const symptoms = (rawSymptoms || reason || '').trim();

  // 1. Verify Patient Existence & Role
  const patient = await User.findById(patientId);
  if (!patient || patient.role !== 'PATIENT') {
    const error = new Error('Invalid patient account for appointment booking');
    error.statusCode = 400;
    throw error;
  }

  // 2. Resolve Doctor User & DoctorProfile
  let doctorUser = await User.findById(doctorId);
  let doctorProfile = null;

  if (doctorUser && doctorUser.role === 'DOCTOR') {
    doctorProfile = await DoctorProfile.findOne({ userId: doctorUser._id });
  } else {
    // If client passed DoctorProfile ID instead of Doctor User ID
    doctorProfile = await DoctorProfile.findById(doctorId);
    if (doctorProfile) {
      doctorUser = await User.findById(doctorProfile.userId);
    }
  }

  const { slotDuration } = await validateSlotEligibility(
    doctorProfile,
    doctorUser,
    date,
    startTime,
    { actionVerb: 'book' }
  );

  const doctorUserId = doctorUser._id;
  // Calculate strict server-side endTime
  const endTime = addMinutesToTime(startTime, slotDuration);

  // 6. Application-level Active Conflict Pre-check
  const existingActiveAppointment = await Appointment.findOne({
    doctorId: doctorUserId,
    date,
    startTime,
    status: { $in: ['BOOKED', 'COMPLETED'] },
  });

  if (existingActiveAppointment) {
    const error = new Error('This appointment slot is no longer available');
    error.statusCode = 409;
    throw error;
  }

  // 6b. Hold Conflict Check: Reject if slot is currently held by another patient
  const now = new Date();
  const existingHoldOtherPatient = await SlotHold.findOne({
    doctorId: doctorUserId,
    date,
    startTime,
    expiresAt: { $gt: now },
    patientId: { $ne: patientId },
  });

  if (existingHoldOtherPatient) {
    const error = new Error(
      'This appointment slot is currently reserved by another patient. Please choose a different slot.'
    );
    error.statusCode = 409;
    throw error;
  }

  // 7. Insert Appointment document (Guarded by DB Partial Unique Index)
  try {
    const appointment = await Appointment.create({
      patientId,
      doctorId: doctorUserId,
      date,
      startTime,
      endTime,
      status: 'BOOKED',
      reason: reason ? reason.trim() : '',
      patientNotes: patientNotes ? patientNotes.trim() : '',
      symptoms,
      aiStatus: symptoms ? 'PENDING' : 'FAILED',
    });

    // Delete any slot holds for this doctor/date/startTime upon successful booking
    await SlotHold.deleteMany({
      doctorId: doctorUserId,
      date,
      startTime,
    }).catch(() => {});

    const populated = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email');

    const formatted = formatAppointmentResponse(populated);

    // Asynchronously dispatch notifications & calendar job (Non-blocking)
    dispatchAppointmentBooked(populated).catch((err) => {
      console.error('[Notification] dispatchAppointmentBooked error:', err.message);
    });
    queueCalendarJob('CALENDAR_CREATE_EVENT', { appointmentId: appointment._id });

    // Asynchronously trigger Pre-Visit LLM summary generation (Non-blocking fire-and-forget)
    if (symptoms) {
      triggerPreVisitSummary(appointment._id, symptoms);
    }

    return formatted;
  } catch (dbError) {
    // Catch MongoDB compound partial unique index violation (Error 11000)
    if (dbError.code === 11000) {
      const conflictError = new Error(
        'This appointment slot was just booked by another patient. Please select another slot.'
      );
      conflictError.statusCode = 409;
      throw conflictError;
    }
    throw dbError;
  }
};

/**
 * Get all appointments for a patient
 * @param {string} patientId
 * @param {string} [statusFilter]
 * @returns {Promise<Array>}
 */
const getPatientAppointments = async (patientId, statusFilter) => {
  const query = { patientId };
  if (statusFilter && ['BOOKED', 'COMPLETED', 'CANCELLED'].includes(statusFilter)) {
    query.status = statusFilter;
  }

  const appointments = await Appointment.find(query)
    .populate('doctorId', 'name email')
    .populate('patientId', 'name email')
    .sort({ date: 1, startTime: 1 });

  return appointments.map(formatAppointmentResponse);
};

/**
 * Get all appointments for a doctor
 * @param {string} doctorUserId
 * @param {string} [statusFilter]
 * @param {string} [dateFilter]
 * @returns {Promise<Array>}
 */
const getDoctorAppointments = async (doctorUserId, statusFilter, dateFilter) => {
  const query = { doctorId: doctorUserId };
  if (statusFilter && ['BOOKED', 'COMPLETED', 'CANCELLED'].includes(statusFilter)) {
    query.status = statusFilter;
  }
  if (dateFilter) {
    query.date = dateFilter;
  }

  const appointments = await Appointment.find(query)
    .populate('patientId', 'name email')
    .populate('doctorId', 'name email')
    .sort({ date: 1, startTime: 1 });

  return appointments.map(formatAppointmentResponse);
};

/**
 * Get single appointment by ID with role ownership authorization
 * @param {string} id - Appointment ID
 * @param {object} requestingUser - { _id, role }
 * @returns {Promise<object>}
 */
const getAppointmentById = async (id, requestingUser) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid Appointment ID');
    error.statusCode = 400;
    throw error;
  }

  const appointment = await Appointment.findById(id)
    .populate('patientId', 'name email')
    .populate('doctorId', 'name email');

  if (!appointment) {
    const error = new Error('Appointment not found');
    error.statusCode = 404;
    throw error;
  }

  // Ownership verification
  const isPatient =
    appointment.patientId._id.toString() === requestingUser._id.toString();
  const isDoctor =
    appointment.doctorId._id.toString() === requestingUser._id.toString();
  const isAdmin = requestingUser.role === 'ADMIN';

  if (!isPatient && !isDoctor && !isAdmin) {
    const error = new Error(
      'Access denied: You are not authorized to view this appointment'
    );
    error.statusCode = 403;
    throw error;
  }

  return formatAppointmentResponse(appointment);
};

/**
 * Cancel an appointment
 * @param {string} id - Appointment ID
 * @param {object} requestingUser - { _id, role }
 * @returns {Promise<object>}
 */
const cancelAppointment = async (id, requestingUser) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid Appointment ID');
    error.statusCode = 400;
    throw error;
  }

  const appointment = await Appointment.findById(id)
    .populate('patientId', 'name email')
    .populate('doctorId', 'name email');

  if (!appointment) {
    const error = new Error('Appointment not found');
    error.statusCode = 404;
    throw error;
  }

  // Ownership check
  const isPatient =
    appointment.patientId._id.toString() === requestingUser._id.toString();
  const isDoctor =
    appointment.doctorId._id.toString() === requestingUser._id.toString();
  const isAdmin = requestingUser.role === 'ADMIN';

  if (!isPatient && !isDoctor && !isAdmin) {
    const error = new Error(
      'Access denied: You are not authorized to cancel this appointment'
    );
    error.statusCode = 403;
    throw error;
  }

  // State machine validation
  if (appointment.status === 'CANCELLED') {
    const error = new Error('Appointment is already cancelled');
    error.statusCode = 400;
    throw error;
  }

  if (appointment.status === 'COMPLETED') {
    const error = new Error('Completed appointments cannot be cancelled');
    error.statusCode = 400;
    throw error;
  }

  // Policy check: cannot cancel an appointment whose start time has already passed
  if (isSlotInPast(appointment.date, appointment.startTime)) {
    const error = new Error('Cannot cancel an appointment that has already started or passed');
    error.statusCode = 400;
    throw error;
  }

  appointment.status = 'CANCELLED';
  await appointment.save();

  // Asynchronously dispatch notifications (Non-blocking)
  dispatchAppointmentCancelled(appointment, requestingUser).catch((err) => {
    console.error('[Notification] dispatchAppointmentCancelled error:', err.message);
  });
  queueCalendarJob('CALENDAR_DELETE_EVENT', { appointmentId: appointment._id });

  return formatAppointmentResponse(appointment);
};

/**
 * Reschedule an appointment atomically
 * @param {string} id - Original Appointment ID
 * @param {object} newSlot - { date, appointmentDate, startTime }
 * @param {object} requestingUser - { _id, role }
 * @returns {Promise<object>} - Newly created appointment
 */
const rescheduleAppointment = async (id, newSlot, requestingUser) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid Appointment ID');
    error.statusCode = 400;
    throw error;
  }

  const oldAppointment = await Appointment.findById(id);
  if (!oldAppointment) {
    const error = new Error('Appointment not found');
    error.statusCode = 404;
    throw error;
  }

  // Ownership check: only the patient who booked or an admin can reschedule
  const isPatient =
    oldAppointment.patientId.toString() === requestingUser._id.toString();
  const isAdmin = requestingUser.role === 'ADMIN';

  if (!isPatient && !isAdmin) {
    const error = new Error(
      'Access denied: Only the booking patient or an admin can reschedule this appointment'
    );
    error.statusCode = 403;
    throw error;
  }

  if (oldAppointment.status !== 'BOOKED') {
    const error = new Error(
      `Cannot reschedule an appointment with status '${oldAppointment.status}'`
    );
    error.statusCode = 400;
    throw error;
  }

  const targetDate = newSlot.date || newSlot.appointmentDate;

  // Same-slot reschedule protection
  if (
    oldAppointment.date === targetDate &&
    oldAppointment.startTime === newSlot.startTime
  ) {
    const populated = await Appointment.findById(oldAppointment._id)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email');
    return formatAppointmentResponse(populated);
  }

  // 1. Attempt to create the new appointment first (Guarantees old is not lost if new slot conflicts)
  const newAppointment = await bookAppointment({
    patientId: oldAppointment.patientId,
    doctorId: oldAppointment.doctorId,
    date: targetDate,
    startTime: newSlot.startTime,
    reason: oldAppointment.reason,
    patientNotes: oldAppointment.patientNotes,
  });

  // 2. Mark old appointment as CANCELLED upon successful new booking
  oldAppointment.status = 'CANCELLED';
  await oldAppointment.save();

  // 3. Asynchronously dispatch reschedule notifications & calendar update (Non-blocking)
  dispatchAppointmentRescheduled(newAppointment, oldAppointment).catch((err) => {
    console.error('[Notification] dispatchAppointmentRescheduled error:', err.message);
  });
  queueCalendarJob('CALENDAR_UPDATE_EVENT', {
    newAppointmentId: newAppointment.id,
    oldAppointmentId: oldAppointment._id,
  });

  return newAppointment;
};

/**
 * Mark an appointment as COMPLETED (Doctor or Admin only)
 * @param {string} id - Appointment ID
 * @param {object} requestingUser - { _id, role }
 * @returns {Promise<object>}
 */
const completeAppointment = async (id, requestingUser) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid Appointment ID');
    error.statusCode = 400;
    throw error;
  }

  const appointment = await Appointment.findById(id)
    .populate('patientId', 'name email')
    .populate('doctorId', 'name email');

  if (!appointment) {
    const error = new Error('Appointment not found');
    error.statusCode = 404;
    throw error;
  }

  // Ownership check: only the doctor assigned to the appointment or an admin can complete it
  const isDoctor =
    appointment.doctorId._id.toString() === requestingUser._id.toString();
  const isAdmin = requestingUser.role === 'ADMIN';

  if (!isDoctor && !isAdmin) {
    const error = new Error(
      'Access denied: Only the assigned doctor or an admin can complete this appointment'
    );
    error.statusCode = 403;
    throw error;
  }

  if (appointment.status !== 'BOOKED') {
    const error = new Error(
      `Cannot complete an appointment with status '${appointment.status}'`
    );
    error.statusCode = 400;
    throw error;
  }

  appointment.status = 'COMPLETED';
  await appointment.save();

  return formatAppointmentResponse(appointment);
};

/**
 * Admin: Get all appointments with filters
 * @param {object} filters - { doctorId, patientId, status, date }
 * @returns {Promise<Array>}
 */
const getAllAppointmentsAdmin = async (filters = {}) => {
  const query = {};
  if (filters.doctorId && mongoose.Types.ObjectId.isValid(filters.doctorId)) {
    query.doctorId = filters.doctorId;
  }
  if (filters.patientId && mongoose.Types.ObjectId.isValid(filters.patientId)) {
    query.patientId = filters.patientId;
  }
  if (filters.status && ['BOOKED', 'COMPLETED', 'CANCELLED'].includes(filters.status)) {
    query.status = filters.status;
  }
  if (filters.date) {
    query.date = filters.date;
  }

  const appointments = await Appointment.find(query)
    .populate('patientId', 'name email')
    .populate('doctorId', 'name email')
    .sort({ date: -1, startTime: -1 });

  return appointments.map(formatAppointmentResponse);
};

/**
 * Asynchronously synthesize Pre-Visit Clinical Summary via Local LLM Layer
 * Fire-and-forget: does not block HTTP response; updates MongoDB record on completion.
 * @param {string} appointmentId
 * @param {string} symptoms
 */
const triggerPreVisitSummary = async (appointmentId, symptoms) => {
  try {
    const result = await llmService.generatePreVisitSummary(symptoms);
    await Appointment.findByIdAndUpdate(appointmentId, {
      aiStatus: result.status,               // 'READY' or 'FAILED'
      preVisitSummary: result.data || null,  // { urgency, chiefComplaint, suggestedQuestions }
      aiPromptVersion: result.promptVersion,
    });
  } catch (err) {
    // Defense in depth: even if something above llmService throws unexpectedly,
    // never let it propagate into an unhandled rejection that could crash the process.
    await Appointment.findByIdAndUpdate(appointmentId, { aiStatus: AI_STATUS.FAILED }).catch(() => {});
    console.error('[appointmentService] pre-visit trigger crashed:', err.message);
  }
};

module.exports = {
  holdSlot,
  bookAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  getAppointmentById,
  cancelAppointment,
  rescheduleAppointment,
  completeAppointment,
  getAllAppointmentsAdmin,
  triggerPreVisitSummary,
};

