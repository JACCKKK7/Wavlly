const express = require('express');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');
const { validatePagination } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get user's notifications
// @access  Private
router.get('/', [auth, validatePagination], async (req, res) => {
  try {
    const { page, limit } = req.pagination;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('sender', 'username fullName avatar isVerified')
      .populate('relatedPost', 'content')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Count unread notifications
    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false
    });

    // Transform notifications to match frontend expectations
    const transformedNotifications = notifications.map(notification => ({
      id: notification._id.toString(),
      _id: notification._id.toString(),
      type: notification.type,
      message: notification.message,
      read: notification.isRead,
      createdAt: notification.createdAt,
      from: {
        _id: notification.sender._id.toString(),
        id: notification.sender._id.toString(),
        username: notification.sender.username,
        fullName: notification.sender.fullName,
        avatar: notification.sender.avatar
      },
      post: notification.relatedPost ? {
        _id: notification.relatedPost._id.toString(),
        id: notification.relatedPost._id.toString()
      } : undefined
    }));

    res.json({
      notifications: transformedNotifications,
      unreadCount,
      currentPage: page,
      hasMore: notifications.length === limit
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if user owns the notification
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await notification.markAsRead();

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if user owns the notification
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/notifications/unread-count
// @desc    Get unread notification count
// @access  Private
router.get('/unread-count', auth, async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to create notifications (used by other routes)
const createNotification = async (data) => {
  try {
    const notification = new Notification(data);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
  }
};

module.exports = { router, createNotification };
