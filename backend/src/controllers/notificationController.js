import Notification from '../models/Notification.js';

export const getNotifications = async (req, res) => {
  const mandalId = req.mandalId;
  const userId = req.user._id;

  try {
    const notifications = await Notification.find({
      mandalId,
      readBy: { $ne: userId },
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving notifications' });
  }
};

export const markNotificationRead = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  try {
    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (!notification.readBy.includes(userId)) {
      notification.readBy.push(userId);
      await notification.save();
    }

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error marking notification read' });
  }
};
