const mongoose = require('mongoose');
const config = require('../../server/config/env');
const User = require('../../server/models/User');
const DoctorProfile = require('../../server/models/DoctorProfile');

const sampleDoctors = [
  {
    name: 'Dr. Sarah Jenkins',
    email: 'dr.sarah@healthcare.com',
    password: 'DoctorPassword123!',
    specialization: 'Cardiology',
    slotDuration: 30,
    workingHours: {
      monday: { enabled: true, start: '09:00', end: '17:00' },
      tuesday: { enabled: true, start: '09:00', end: '17:00' },
      wednesday: { enabled: true, start: '09:00', end: '17:00' },
      thursday: { enabled: true, start: '09:00', end: '17:00' },
      friday: { enabled: true, start: '09:00', end: '15:00' },
      saturday: { enabled: false, start: null, end: null },
      sunday: { enabled: false, start: null, end: null },
    },
    leaves: [
      { date: '2026-09-20', reason: 'Cardiology World Summit' },
    ],
  },
  {
    name: 'Dr. Marcus Vance',
    email: 'dr.marcus@healthcare.com',
    password: 'DoctorPassword123!',
    specialization: 'Neurology',
    slotDuration: 45,
    workingHours: {
      monday: { enabled: true, start: '10:00', end: '18:00' },
      tuesday: { enabled: true, start: '10:00', end: '18:00' },
      wednesday: { enabled: true, start: '10:00', end: '18:00' },
      thursday: { enabled: true, start: '10:00', end: '18:00' },
      friday: { enabled: false, start: null, end: null },
      saturday: { enabled: true, start: '09:00', end: '13:00' },
      sunday: { enabled: false, start: null, end: null },
    },
    leaves: [],
  },
];

const seedDoctors = async () => {
  try {
    console.log('[SeedDoctors] Connecting to MongoDB...');
    await mongoose.connect(config.MONGO_URI);
    console.log('[SeedDoctors] MongoDB Connected.');

    for (const docData of sampleDoctors) {
      const email = docData.email.toLowerCase().trim();
      let user = await User.findOne({ email });

      if (!user) {
        user = await User.create({
          name: docData.name,
          email,
          password: docData.password,
          role: 'DOCTOR',
        });
        console.log(`[SeedDoctors] Created User account for: ${docData.name} (${email})`);
      } else {
        console.log(`[SeedDoctors] User already exists for: ${docData.name} (${email})`);
      }

      let profile = await DoctorProfile.findOne({ userId: user._id });
      if (!profile) {
        profile = await DoctorProfile.create({
          userId: user._id,
          specialization: docData.specialization,
          slotDuration: docData.slotDuration,
          workingHours: docData.workingHours,
          leaves: docData.leaves,
        });
        console.log(`[SeedDoctors] Created DoctorProfile for: ${docData.name}`);
      } else {
        console.log(`[SeedDoctors] DoctorProfile already exists for: ${docData.name}`);
      }
    }

    console.log('==============================================');
    console.log('🎉 Sample Doctors seeded successfully!');
    console.log('1. Dr. Sarah Jenkins (dr.sarah@healthcare.com / DoctorPassword123!) - Cardiology');
    console.log('2. Dr. Marcus Vance (dr.marcus@healthcare.com / DoctorPassword123!) - Neurology');
    console.log('==============================================');

    process.exit(0);
  } catch (error) {
    console.error(`[SeedDoctors] Error: ${error.message}`);
    process.exit(1);
  }
};

seedDoctors();
