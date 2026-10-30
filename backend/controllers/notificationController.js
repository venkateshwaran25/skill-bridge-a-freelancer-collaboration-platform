const Notification = require('../models/Notification');

/**
 * Get all notifications for user
 * GET /api/notifications
 */
exports.getNotifications = async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    const { limit = 20, page = 1, unreadOnly = false } = req.query;

    const skip = (page - 1) * limit;
    let query = { userId, dismissed: false };

    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .populate('relatedUser', 'name image email')
      .populate('relatedProject', 'title')
      .populate('relatedWorkplace', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ userId, read: false, dismissed: false });

    res.json({
      notifications,
      unreadCount,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

/**
 * Get unread notification count
 * GET /api/notifications/unread-count
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();

    const unreadCount = await Notification.countDocuments({
      userId,
      read: false,
      dismissed: false,
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
};

/**
 * Mark single notification as read
 * PUT /api/notifications/:id/read
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req.user._id || req.user.id).toString();

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
};

/**
 * Mark all notifications as read
 * PUT /api/notifications/mark-all-read
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();

    await Notification.updateMany(
      { userId, read: false, dismissed: false },
      { read: true, readAt: new Date() }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ error: 'Failed to update notifications' });
  }
};

/**
 * Dismiss/delete notification
 * DELETE /api/notifications/:id
 */
exports.dismissNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req.user._id || req.user.id).toString();

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    notification.dismissed = true;
    await notification.save();

    res.json({ message: 'Notification dismissed' });
  } catch (error) {
    console.error('Error dismissing notification:', error);
    res.status(500).json({ error: 'Failed to dismiss notification' });
  }
};

/**
 * Dismiss all notifications
 * DELETE /api/notifications/dismiss-all
 */
exports.dismissAll = async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();

    await Notification.updateMany(
      { userId, dismissed: false },
      { dismissed: true }
    );

    res.json({ message: 'All notifications dismissed' });
  } catch (error) {
    console.error('Error dismissing all:', error);
    res.status(500).json({ error: 'Failed to dismiss notifications' });
  }
};

/**
 * Get notification by id
 * GET /api/notifications/:id
 */
exports.getNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req.user._id || req.user.id).toString();

    const notification = await Notification.findById(id)
      .populate('relatedUser', 'name image email')
      .populate('relatedProject', 'title')
      .populate('relatedWorkplace', 'title');

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Mark as read
    if (!notification.read) {
      notification.read = true;
      notification.readAt = new Date();
      await notification.save();
    }

    res.json(notification);
  } catch (error) {
    console.error('Error fetching notification:', error);
    res.status(500).json({ error: 'Failed to fetch notification' });
  }
};

/**
 * Create notification (internal use - called from other controllers)
 */
exports.createNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};
