const express = require('express');
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all notifications
router.get('/', notificationController.getNotifications);

// Get unread count
router.get('/unread-count', notificationController.getUnreadCount);

// Get single notification
router.get('/:id', notificationController.getNotification);

// Mark as read
router.put('/:id/read', notificationController.markAsRead);

// Mark all as read
router.put('/mark-all-read', notificationController.markAllAsRead);

// Dismiss notification
router.delete('/:id', notificationController.dismissNotification);

// Dismiss all
router.delete('/dismiss-all', notificationController.dismissAll);

module.exports = router;
