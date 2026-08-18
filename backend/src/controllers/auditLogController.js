import AuditLog from '../models/AuditLog.js';

export const getAuditLogs = async (req, res) => {
  const mandalId = req.mandalId;
  try {
    const logs = await AuditLog.find({ mandalId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(100); // return last 100 entries for performance
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving audit logs' });
  }
};
