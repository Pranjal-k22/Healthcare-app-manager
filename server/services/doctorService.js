const mongoose = require('mongoose');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const DoctorLeave = require('../models/DoctorLeave');
const Appointment = require('../models/Appointment');
const notificationService = require('./notificationService');

/**
 * Format populated doctor entity into clean, safe API response object
 * @param {object} profileDoc - Mongoose DoctorProfile document with populated userId
 * @returns {Promise<object>}
 */
const formatDoctorResponse = async (profileDoc) => {
  const user = profileDoc.userId || {};
  const doctorUserId = user._id || profileDoc.userId;

  let leaves = [];
  if (doctorUserId) {
    const doctorLeaves = await DoctorLeave.find({
      doctorId: doctorUserId,
      status: 'APPROVED',
    }).sort({ startDate: 1 });

    leaves = doctorLeaves.map((l) => ({
      id: l._id.toString(),
      _id: l._id,
      date: l.startDate,
      startDate: l.startDate,
      endDate: l.endDate,
      reason: l.reason,
      status: l.status,
    }));
  }

  return {
    id: profileDoc._id,
    userId: doctorUserId,
    name: user.name || 'Doctor',
    email: user.email || '',
    role: user.role || 'DOCTOR',
    specialization: profileDoc.specialization,
    qualifications: profileDoc.qualifications || ['MBBS'],
    experienceYears: profileDoc.experienceYears || 0,
    consultationFee: profileDoc.consultationFee || 0,
    clinicName: profileDoc.clinicName || 'HealthPulse Medical Center',
    clinicAddress: profileDoc.clinicAddress || '',
    bio: profileDoc.bio || '',
    phone: profileDoc.phone || '',
    profileImage: profileDoc.profileImage || '',
    workingDays: profileDoc.workingDays || [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
    ],
    slotDuration: profileDoc.slotDuration,
    isAvailable: profileDoc.isAvailable !== false,
    isActive: profileDoc.isActive !== false,
    workingHours: profileDoc.workingHours,
    leaves,
    createdAt: profileDoc.createdAt,
    updatedAt: profileDoc.updatedAt,
  };
};

/**
 * Create a new Doctor User account and associated DoctorProfile
 * @param {object} data
 * @returns {Promise<object>}
 */
const createDoctor = async (data) => {
  const {
    name,
    email,
    password,
    specialization,
    slotDuration = 30,
    workingHours,
    qualifications,
    experienceYears = 0,
    consultationFee = 0,
    clinicName,
    clinicAddress,
    bio,
    phone,
    profileImage,
    workingDays,
    isAvailable = true,
  } = data;

  // 1. Duplicate check
  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    const error = new Error('A user with this email address already exists');
    error.statusCode = 409;
    throw error;
  }

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch (err) {
    // MongoDB standalone instance without replica set fallback
    session = null;
  }

  let createdUser = null;
  try {
    // 2. Create User entity with DOCTOR role
    const userDocs = await User.create(
      [
        {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password,
          role: 'DOCTOR',
        },
      ],
      session ? { session } : {}
    );
    createdUser = userDocs[0];

    // 3. Create DoctorProfile linked by userId
    const profilePayload = {
      userId: createdUser._id,
      specialization: specialization.trim(),
      slotDuration,
      experienceYears,
      consultationFee,
      isAvailable,
      isActive: true,
      ...(qualifications && { qualifications }),
      ...(clinicName && { clinicName: clinicName.trim() }),
      ...(clinicAddress && { clinicAddress: clinicAddress.trim() }),
      ...(bio && { bio: bio.trim() }),
      ...(phone && { phone: phone.trim() }),
      ...(profileImage && { profileImage: profileImage.trim() }),
      ...(workingDays && { workingDays }),
      ...(workingHours && { workingHours }),
    };

    const profileDocs = await DoctorProfile.create(
      [profilePayload],
      session ? { session } : {}
    );
    const doctorProfile = profileDocs[0];

    if (session) {
      await session.commitTransaction();
      session.endSession();
    }

    const populated = await DoctorProfile.findById(doctorProfile._id).populate(
      'userId',
      'name email role createdAt'
    );

    return await formatDoctorResponse(populated);
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    } else if (createdUser) {
      // Compensating rollback for standalone MongoDB
      await User.findByIdAndDelete(createdUser._id);
    }
    throw error;
  }
};

/**
 * Retrieve all doctors with optional filters (search, specialization, availability)
 * @param {object} filters
 * @returns {Promise<Array>}
 */
const getAllDoctors = async (filters = {}) => {
  const { specialization, search, isAvailable, includeInactive = false } = filters;

  const profileQuery = {};

  if (!includeInactive) {
    profileQuery.isActive = true;
  }

  if (isAvailable !== undefined) {
    profileQuery.isAvailable = isAvailable === true || isAvailable === 'true';
  }

  if (specialization) {
    profileQuery.specialization = { $regex: specialization, $options: 'i' };
  }

  let doctorProfiles = await DoctorProfile.find(profileQuery)
    .populate('userId', 'name email role createdAt')
    .sort({ createdAt: -1 });

  // Filter out any profiles whose User accounts were deleted or not DOCTOR
  doctorProfiles = doctorProfiles.filter(
    (profile) => profile.userId && profile.userId.role === 'DOCTOR'
  );

  // Keyword search on doctor name, specialization, clinicName, and bio
  if (search && search.trim()) {
    const term = search.toLowerCase().trim();
    doctorProfiles = doctorProfiles.filter((doc) => {
      const name = doc.userId ? doc.userId.name.toLowerCase() : '';
      const spec = doc.specialization ? doc.specialization.toLowerCase() : '';
      const clinic = doc.clinicName ? doc.clinicName.toLowerCase() : '';
      const bio = doc.bio ? doc.bio.toLowerCase() : '';
      return (
        name.includes(term) ||
        spec.includes(term) ||
        clinic.includes(term) ||
        bio.includes(term)
      );
    });
  }

  return await Promise.all(doctorProfiles.map(formatDoctorResponse));
};

/**
 * Retrieve single doctor profile by ID (DoctorProfile ID or User ID)
 * @param {string} id
 * @returns {Promise<object>}
 */
const getDoctorById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid Doctor ID');
    error.statusCode = 400;
    throw error;
  }

  let profile = await DoctorProfile.findById(id).populate(
    'userId',
    'name email role createdAt'
  );

  if (!profile) {
    profile = await DoctorProfile.findOne({ userId: id }).populate(
      'userId',
      'name email role createdAt'
    );
  }

  if (!profile || !profile.userId || profile.userId.role !== 'DOCTOR') {
    const error = new Error('Doctor profile not found');
    error.statusCode = 404;
    throw error;
  }

  return await formatDoctorResponse(profile);
};

/**
 * Get doctor profile for currently authenticated doctor user
 * @param {string} userId
 * @returns {Promise<object>}
 */
const getDoctorByUserId = async (userId) => {
  const profile = await DoctorProfile.findOne({ userId }).populate(
    'userId',
    'name email role createdAt'
  );

  if (!profile) {
    const error = new Error('Doctor profile not found for this account');
    error.statusCode = 404;
    throw error;
  }

  return await formatDoctorResponse(profile);
};

/**
 * Update doctor profile (Admin authority)
 * @param {string} id
 * @param {object} updateData
 * @returns {Promise<object>}
 */
const updateDoctor = async (id, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid Doctor ID');
    error.statusCode = 400;
    throw error;
  }

  let profile = await DoctorProfile.findById(id);
  if (!profile) {
    profile = await DoctorProfile.findOne({ userId: id });
  }

  if (!profile) {
    const error = new Error('Doctor profile not found');
    error.statusCode = 404;
    throw error;
  }

  const {
    name,
    specialization,
    slotDuration,
    workingHours,
    qualifications,
    experienceYears,
    consultationFee,
    clinicName,
    clinicAddress,
    bio,
    phone,
    profileImage,
    workingDays,
    isAvailable,
    isActive,
  } = updateData;

  // Update User name if provided
  if (name && name.trim()) {
    await User.findByIdAndUpdate(profile.userId, { name: name.trim() });
  }

  // Update DoctorProfile fields
  if (specialization) profile.specialization = specialization.trim();
  if (slotDuration !== undefined) profile.slotDuration = slotDuration;
  if (experienceYears !== undefined) profile.experienceYears = experienceYears;
  if (consultationFee !== undefined) profile.consultationFee = consultationFee;
  if (qualifications !== undefined) profile.qualifications = qualifications;
  if (clinicName !== undefined) profile.clinicName = clinicName.trim();
  if (clinicAddress !== undefined) profile.clinicAddress = clinicAddress.trim();
  if (bio !== undefined) profile.bio = bio.trim();
  if (phone !== undefined) profile.phone = phone.trim();
  if (profileImage !== undefined) profile.profileImage = profileImage.trim();
  if (workingDays !== undefined) profile.workingDays = workingDays;
  if (isAvailable !== undefined) profile.isAvailable = isAvailable;
  if (isActive !== undefined) profile.isActive = isActive;

  if (workingHours) {
    profile.workingHours = {
      ...profile.workingHours,
      ...workingHours,
    };
  }

  await profile.save();

  const populated = await DoctorProfile.findById(profile._id).populate(
    'userId',
    'name email role createdAt'
  );

  return await formatDoctorResponse(populated);
};

/**
 * Doctor Self-Update of professional profile
 * @param {string} doctorUserId - Derived from req.user._id
 * @param {object} updateData
 * @returns {Promise<object>}
 */
const updateDoctorSelf = async (doctorUserId, updateData) => {
  const profile = await DoctorProfile.findOne({ userId: doctorUserId });
  if (!profile) {
    const error = new Error('Doctor profile not found');
    error.statusCode = 404;
    throw error;
  }

  const {
    name,
    specialization,
    slotDuration,
    workingHours,
    qualifications,
    experienceYears,
    consultationFee,
    clinicName,
    clinicAddress,
    bio,
    phone,
    profileImage,
    workingDays,
    isAvailable,
  } = updateData;

  if (name && name.trim()) {
    await User.findByIdAndUpdate(doctorUserId, { name: name.trim() });
  }

  if (specialization) profile.specialization = specialization.trim();
  if (slotDuration !== undefined) profile.slotDuration = slotDuration;
  if (experienceYears !== undefined) profile.experienceYears = experienceYears;
  if (consultationFee !== undefined) profile.consultationFee = consultationFee;
  if (qualifications !== undefined) profile.qualifications = qualifications;
  if (clinicName !== undefined) profile.clinicName = clinicName.trim();
  if (clinicAddress !== undefined) profile.clinicAddress = clinicAddress.trim();
  if (bio !== undefined) profile.bio = bio.trim();
  if (phone !== undefined) profile.phone = phone.trim();
  if (profileImage !== undefined) profile.profileImage = profileImage.trim();
  if (workingDays !== undefined) profile.workingDays = workingDays;
  if (isAvailable !== undefined) profile.isAvailable = isAvailable;

  if (workingHours) {
    profile.workingHours = {
      ...profile.workingHours,
      ...workingHours,
    };
  }

  await profile.save();

  const populated = await DoctorProfile.findById(profile._id).populate(
    'userId',
    'name email role createdAt'
  );

  return await formatDoctorResponse(populated);
};

/**
 * Add a leave date for a doctor (Admin Override Flow)
 * Automatically cancels conflicting BOOKED appointments, dispatches cancellation notifications,
 * and creates a DoctorLeave document.
 * @param {string} id - Doctor Profile ID or Doctor User ID
 * @param {object} leaveData - { date: 'YYYY-MM-DD', reason?: string }
 * @returns {Promise<object>} - { leave, leaves, cancelledAppointmentsCount, affectedPatientIds }
 */
const addDoctorLeave = async (id, leaveData) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid Doctor ID');
    error.statusCode = 400;
    throw error;
  }

  let profile = await DoctorProfile.findById(id);
  if (!profile) {
    profile = await DoctorProfile.findOne({ userId: id });
  }

  if (!profile) {
    const error = new Error('Doctor profile not found');
    error.statusCode = 404;
    throw error;
  }

  const { date, reason = 'Unavailable' } = leaveData;
  const doctorUserId = profile.userId;

  // Duplicate leave check querying DoctorLeave collection
  const existingLeave = await DoctorLeave.findOne({
    doctorId: doctorUserId,
    status: 'APPROVED',
    startDate: { $lte: date },
    endDate: { $gte: date },
  });

  if (existingLeave) {
    const error = new Error(`Doctor already has a scheduled leave on ${date}`);
    error.statusCode = 409;
    throw error;
  }

  // 1. Query all Appointment documents for this doctor on this date with status BOOKED
  const conflictingAppointments = await Appointment.find({
    doctorId: doctorUserId,
    date,
    status: 'BOOKED',
  });

  const affectedPatientIds = [];

  // 2. Cancel conflicting appointments & dispatch notifications
  if (conflictingAppointments.length > 0) {
    for (const appointment of conflictingAppointments) {
      appointment.status = 'CANCELLED';
      appointment.cancellationReason = 'DOCTOR_LEAVE';
      await appointment.save();

      if (appointment.patientId) {
        affectedPatientIds.push(appointment.patientId.toString());
      }

      // Dispatch notification & email to patient (and doctor)
      try {
        await notificationService.dispatchAppointmentCancelled(appointment, { role: 'ADMIN' });
      } catch (dispatchErr) {
        console.error(
          `[DoctorService] Failed to dispatch cancellation notification for appointment ${appointment._id}:`,
          dispatchErr.message
        );
      }
    }
  }

  // 3. Create DoctorLeave document in dedicated collection
  const newLeave = await DoctorLeave.create({
    doctorId: doctorUserId,
    startDate: date,
    endDate: date,
    reason: (reason || 'Unavailable').trim(),
    status: 'APPROVED',
    approvedAt: new Date(),
  });

  // Fetch all approved doctor leaves for frontend compatibility
  const allLeaves = await DoctorLeave.find({
    doctorId: doctorUserId,
    status: 'APPROVED',
  }).sort({ startDate: 1 });

  const formattedLeaves = allLeaves.map((l) => ({
    id: l._id.toString(),
    _id: l._id,
    date: l.startDate,
    startDate: l.startDate,
    endDate: l.endDate,
    reason: l.reason,
    status: l.status,
  }));

  return {
    leave: {
      id: newLeave._id.toString(),
      _id: newLeave._id,
      date: newLeave.startDate,
      startDate: newLeave.startDate,
      endDate: newLeave.endDate,
      reason: newLeave.reason,
      status: newLeave.status,
    },
    leaves: formattedLeaves,
    cancelledAppointmentsCount: conflictingAppointments.length,
    affectedPatientIds,
  };
};

/**
 * Remove a scheduled leave date for a doctor (Cancels in DoctorLeave collection)
 * @param {string} id
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @returns {Promise<Array>}
 */
const removeDoctorLeave = async (id, dateStr) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid Doctor ID');
    error.statusCode = 400;
    throw error;
  }

  let profile = await DoctorProfile.findById(id);
  if (!profile) {
    profile = await DoctorProfile.findOne({ userId: id });
  }

  if (!profile) {
    const error = new Error('Doctor profile not found');
    error.statusCode = 404;
    throw error;
  }

  const doctorUserId = profile.userId;

  // Soft-cancel matching leave in DoctorLeave collection
  const leave = await DoctorLeave.findOne({
    doctorId: doctorUserId,
    status: 'APPROVED',
    startDate: { $lte: dateStr },
    endDate: { $gte: dateStr },
  });

  if (leave) {
    leave.status = 'CANCELLED';
    await leave.save();
  }

  const allLeaves = await DoctorLeave.find({
    doctorId: doctorUserId,
    status: 'APPROVED',
  }).sort({ startDate: 1 });

  return allLeaves.map((l) => ({
    id: l._id.toString(),
    _id: l._id,
    date: l.startDate,
    startDate: l.startDate,
    endDate: l.endDate,
    reason: l.reason,
    status: l.status,
  }));
};

/**
 * Get leaves for a doctor from DoctorLeave collection
 * @param {string} id
 * @returns {Promise<Array>}
 */
const getDoctorLeaves = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid Doctor ID');
    error.statusCode = 400;
    throw error;
  }

  let profile = await DoctorProfile.findById(id);
  if (!profile) {
    profile = await DoctorProfile.findOne({ userId: id });
  }

  if (!profile) {
    const error = new Error('Doctor profile not found');
    error.statusCode = 404;
    throw error;
  }

  const doctorUserId = profile.userId;

  const leaves = await DoctorLeave.find({
    doctorId: doctorUserId,
    status: 'APPROVED',
  }).sort({ startDate: 1 });

  return leaves.map((l) => ({
    id: l._id.toString(),
    _id: l._id,
    date: l.startDate,
    startDate: l.startDate,
    endDate: l.endDate,
    reason: l.reason,
    status: l.status,
  }));
};

/**
 * Soft deactivate / activate doctor
 * @param {string} id
 * @param {boolean} isActive
 * @returns {Promise<object>}
 */
const setDoctorActiveStatus = async (id, isActive) => {
  return updateDoctor(id, { isActive });
};

module.exports = {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  getDoctorByUserId,
  updateDoctor,
  updateDoctorSelf,
  addDoctorLeave,
  removeDoctorLeave,
  getDoctorLeaves,
  setDoctorActiveStatus,
  formatDoctorResponse,
};
