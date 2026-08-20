const {
  validateBookingInput,
  validateRescheduleInput,
} = require('../validators/appointmentValidator');
const { generateAvailableSlots } = require('../services/slotService');
const {
  bookAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  getAppointmentById,
  cancelAppointment,
  rescheduleAppointment,
  completeAppointment,
  getAllAppointmentsAdmin,
} = require('../services/appointmentService');

/**
 * @desc    Get dynamic available slots for a doctor on a specific date
 * @route   GET /api/appointments/slots/:doctorId/:date
 * @access  Private (All Authenticated)
 */
const getAvailableSlots = async (req, res, next) => {
  try {
    const { doctorId, date } = req.params;
    const slots = await generateAvailableSlots(doctorId, date);

    res.status(200).json({
      success: true,
      data: slots,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Book a new appointment
 * @route   POST /api/appointments
 * @access  Private (PATIENT only)
 */
const createAppointment = async (req, res, next) => {
  try {
    const validation = validateBookingInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const payload = {
      patientId: req.user._id,
      doctorId: req.body.doctorId,
      date: req.body.date,
      startTime: req.body.startTime,
      reason: req.body.reason,
    };

    const appointment = await bookAppointment(payload);

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current patient's appointments
 * @route   GET /api/appointments/my
 * @access  Private (PATIENT only)
 */
const getMyAppointments = async (req, res, next) => {
  try {
    const { status } = req.query;
    const appointments = await getPatientAppointments(req.user._id, status);

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get doctor's appointments
 * @route   GET /api/appointments/doctor
 * @access  Private (DOCTOR only)
 */
const getDoctorAppointmentsList = async (req, res, next) => {
  try {
    const { status, date } = req.query;
    const appointments = await getDoctorAppointments(req.user._id, status, date);

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single appointment by ID
 * @route   GET /api/appointments/:id
 * @access  Private (Owner Patient, Assigned Doctor, or Admin)
 */
const getAppointmentDetails = async (req, res, next) => {
  try {
    const appointment = await getAppointmentById(req.params.id, req.user);

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel an appointment
 * @route   PATCH /api/appointments/:id/cancel
 * @access  Private (Owner Patient, Assigned Doctor, or Admin)
 */
const cancelAppointmentHandler = async (req, res, next) => {
  try {
    const appointment = await cancelAppointment(req.params.id, req.user);

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reschedule an appointment
 * @route   PATCH /api/appointments/:id/reschedule
 * @access  Private (Owner Patient or Admin)
 */
const rescheduleAppointmentHandler = async (req, res, next) => {
  try {
    const validation = validateRescheduleInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const newAppointment = await rescheduleAppointment(
      req.params.id,
      {
        date: req.body.date,
        startTime: req.body.startTime,
      },
      req.user
    );

    res.status(200).json({
      success: true,
      message: 'Appointment rescheduled successfully',
      data: newAppointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark appointment as completed
 * @route   PATCH /api/appointments/:id/complete
 * @access  Private (Assigned Doctor or Admin)
 */
const completeAppointmentHandler = async (req, res, next) => {
  try {
    const appointment = await completeAppointment(req.params.id, req.user);

    res.status(200).json({
      success: true,
      message: 'Appointment marked as completed',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: Get all appointments
 * @route   GET /api/appointments/admin/all
 * @access  Private (ADMIN only)
 */
const getAllAppointmentsForAdmin = async (req, res, next) => {
  try {
    const { doctorId, patientId, status, date } = req.query;
    const appointments = await getAllAppointmentsAdmin({
      doctorId,
      patientId,
      status,
      date,
    });

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAvailableSlots,
  createAppointment,
  getMyAppointments,
  getDoctorAppointmentsList,
  getAppointmentDetails,
  cancelAppointmentHandler,
  rescheduleAppointmentHandler,
  completeAppointmentHandler,
  getAllAppointmentsForAdmin,
};
