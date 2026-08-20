const path = require('path');

// Ensure module resolution uses server/node_modules
const dotenv = require(path.join(__dirname, '../../server/node_modules/dotenv'));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const mongoose = require(path.join(__dirname, '../../server/node_modules/mongoose'));
const config = require('../../server/config/env');
const User = require('../../server/models/User');
const DoctorProfile = require('../../server/models/DoctorProfile');

const DEMO_DOCTORS = [
  {
    name: 'Dr. Sarah Jenkins',
    email: 'dr.sarah@healthcare.com',
    password: 'DoctorPassword123!',
    role: 'DOCTOR',
    specialization: 'Cardiology',
    qualifications: ['MBBS', 'MD (Cardiology)', 'FACC'],
    experienceYears: 12,
    consultationFee: 150,
    clinicName: 'HealthPulse Heart & Vascular Institute',
    clinicAddress: '742 Evergreen Terrace, Suite 400, Springfield',
    bio: 'Board-certified cardiologist specializing in preventive cardiology, echocardiography, and hypertension management with over 12 years of clinical excellence.',
    phone: '+1 (555) 234-5678',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    slotDuration: 30,
    isAvailable: true,
    isActive: true,
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
      {
        date: '2026-11-26',
        reason: 'Thanksgiving Holiday',
      },
    ],
  },
  {
    name: 'Dr. Marcus Vance',
    email: 'dr.marcus@healthcare.com',
    password: 'DoctorPassword123!',
    role: 'DOCTOR',
    specialization: 'Neurology',
    qualifications: ['MBBS', 'DM (Neurology)'],
    experienceYears: 9,
    consultationFee: 180,
    clinicName: 'HealthPulse Brain & Spine Center',
    clinicAddress: '100 Medical Parkway, Building B, Springfield',
    bio: 'Experienced clinical neurologist focusing on migraines, neurodegenerative conditions, and neuromuscular disorders.',
    phone: '+1 (555) 876-5432',
    workingDays: ['Tuesday', 'Wednesday', 'Thursday', 'Saturday'],
    slotDuration: 45,
    isAvailable: true,
    isActive: true,
    workingHours: {
      monday: { enabled: false, start: null, end: null },
      tuesday: { enabled: true, start: '10:00', end: '18:00' },
      wednesday: { enabled: true, start: '10:00', end: '18:00' },
      thursday: { enabled: true, start: '10:00', end: '18:00' },
      friday: { enabled: false, start: null, end: null },
      saturday: { enabled: true, start: '09:00', end: '14:00' },
      sunday: { enabled: false, start: null, end: null },
    },
    leaves: [],
  },
];

const seedDoctors = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB database...');
    await mongoose.connect(config.MONGO_URI);
    console.log('[Seed] ✓ Connected to MongoDB');

    for (const docData of DEMO_DOCTORS) {
      let user = await User.findOne({ email: docData.email });

      if (!user) {
        user = await User.create({
          name: docData.name,
          email: docData.email,
          password: docData.password,
          role: 'DOCTOR',
        });
        console.log(`[Seed] ✓ Created User account for ${docData.name} (${docData.email})`);
      } else {
        console.log(`[Seed] - User account exists for ${docData.name}`);
      }

      let profile = await DoctorProfile.findOne({ userId: user._id });

      const profilePayload = {
        userId: user._id,
        specialization: docData.specialization,
        qualifications: docData.qualifications,
        experienceYears: docData.experienceYears,
        consultationFee: docData.consultationFee,
        clinicName: docData.clinicName,
        clinicAddress: docData.clinicAddress,
        bio: docData.bio,
        phone: docData.phone,
        workingDays: docData.workingDays,
        slotDuration: docData.slotDuration,
        isAvailable: docData.isAvailable,
        isActive: docData.isActive,
        workingHours: docData.workingHours,
        leaves: docData.leaves,
      };

      if (!profile) {
        await DoctorProfile.create(profilePayload);
        console.log(`[Seed] ✓ Created DoctorProfile for ${docData.name}`);
      } else {
        await DoctorProfile.findByIdAndUpdate(profile._id, profilePayload);
        console.log(`[Seed] ✓ Updated DoctorProfile for ${docData.name}`);
      }
    }

    console.log('====================================================');
    console.log('🎉 DEMO DOCTORS SEED COMPLETED SUCCESSFULLY!');
    console.log('====================================================');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] ❌ Doctor seeding failed:', error.message);
    process.exit(1);
  }
};

seedDoctors();
