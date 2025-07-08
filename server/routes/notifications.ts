import express from 'express';
import { protect } from '../middleware/auth';
import Notification from '../models/Notification';

const router = express.Router();

// Get all notifications for the user
router.get('/', protect, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authorized' });
    }
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.put('/:id/read', protect, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authorized' });
    }
    const notification = await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { read: true, readAt: new Date() }, { new: true });
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.put('/markAllRead', protect, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authorized' });
    }
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true, readAt: new Date() });
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark all notifications as read' });
  }
});

export default router;

