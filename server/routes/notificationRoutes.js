const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getNotificationsHandler,
  getUnreadCountHandler,
  markAsReadHandler,
  markAllAsReadHandler,
  deleteNotificationHandler,
} = require('../controllers/notificationController');

// All notification routes require authenticated user session
router.use(protect);

router.get('/', getNotificationsHandler);
router.get('/unread-count', getUnreadCountHandler);
router.patch('/read-all', markAllAsReadHandler);
router.patch('/:id/read', markAsReadHandler);
router.delete('/:id', deleteNotificationHandler);

module.exports = router;
