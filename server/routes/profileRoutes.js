const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
} = require('../controllers/profileController');

const router = express.Router();

// Ensure upload directory exists
const avatarUploadDir = path.join(__dirname, '../uploads/avatars');
if (!fs.existsSync(avatarUploadDir)) {
  fs.mkdirSync(avatarUploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `avatar-${req.user.id || req.user._id}-${uniqueSuffix}${ext}`);
  },
});

// Multer File Filter & Limits
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB Max
  fileFilter: (req, file, cb) => {
    const allowedExtensions = /jpeg|jpg|png|webp/;
    const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedExtensions.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG, JPG, PNG, and WEBP image files are allowed (max 2MB)'));
  },
});

// Rate limiter for change-password endpoint
const passwordChangeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 5, // 5 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many password change attempts. Please try again after 15 minutes.',
  },
});

// Protect all profile routes & restrict to PATIENT
router.use(protect);
router.use(authorizeRoles('PATIENT'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/profile/change-password', passwordChangeLimiter, changePassword);
router.post('/profile/avatar', upload.single('avatar'), uploadAvatar);

module.exports = router;
