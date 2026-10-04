import { AuditLog, User } from '../models/index.js';

export const getAuditLogs = async (req, res) => {
  const mandalId = req.mandalId;
  try {
    const logs = await AuditLog.findAll({
      where: { mandalId: Number(mandalId) },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: 100,
    });

    const formatted = logs.map((l) => {
      const obj = l.toJSON();
      obj._id = l.id;
      obj.userId = l.user ? { ...l.user.toJSON(), _id: l.user.id } : l.userId;
      return obj;
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving audit logs' });
  }
};
