const {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('../services/notificationService');

/**
 * @desc    Get current user's notifications
 * @route   GET /api/notifications
 * @access  Private (All Authenticated)
 */
const getNotificationsHandler = async (req, res, next) => {
  try {
    const { isRead, limit, page } = req.query;
    const result = await getUserNotifications(req.user._id, {
      isRead,
      limit,
      page,
    });

    res.status(200).json({
      success: true,
      data: result.notifications,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get unread notification count for current user
 * @route   GET /api/notifications/unread-count
 * @access  Private (All Authenticated)
 */
const getUnreadCountHandler = async (req, res, next) => {
  try {
    const count = await getUnreadCount(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        unreadCount: count,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private (All Authenticated)
 */
const markAsReadHandler = async (req, res, next) => {
  try {
    const notification = await markAsRead(req.params.id, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all user notifications as read
 * @route   PATCH /api/notifications/read-all
 * @access  Private (All Authenticated)
 */
const markAllAsReadHandler = async (req, res, next) => {
  try {
    const updatedCount = await markAllAsRead(req.user._id);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: {
        updatedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a notification
 * @route   DELETE /api/notifications/:id
 * @access  Private (All Authenticated)
 */
const deleteNotificationHandler = async (req, res, next) => {
  try {
    await deleteNotification(req.params.id, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotificationsHandler,
  getUnreadCountHandler,
  markAsReadHandler,
  markAllAsReadHandler,
  deleteNotificationHandler,
};
