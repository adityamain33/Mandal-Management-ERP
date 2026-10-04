import { Notification } from '../models/index.js';

export const getNotifications = async (req, res) => {
  const mandalId = req.mandalId;
  const userId = req.user.id;

  try {
    const notifications = await Notification.findAll({
      where: { mandalId: Number(mandalId) },
      order: [['createdAt', 'DESC']],
    });

    const unread = notifications.filter((n) => {
      const readBy = n.readBy || [];
      return !readBy.some((id) => String(id) === String(userId));
    });

    const formatted = unread.map((n) => {
      const obj = n.toJSON();
      obj._id = n.id;
      return obj;
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving notifications' });
  }
};

export const markNotificationRead = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const readBy = Array.isArray(notification.readBy) ? [...notification.readBy] : [];
    if (!readBy.some((uid) => String(uid) === String(userId))) {
      readBy.push(userId);
      notification.readBy = readBy;
      await notification.save();
    }

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error marking notification read' });
  }
};
