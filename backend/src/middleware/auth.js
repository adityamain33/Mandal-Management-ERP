import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;

    // Scoping to Active Mandal
    const headerMandalId = req.headers['x-mandal-id'];
    const activeMandalId = headerMandalId || user.activeMandalId;

    if (activeMandalId) {
      req.mandalId = activeMandalId;
      // Get the role of the user for this specific mandal
      const currentMandalRole = user.mandalRoles.find(
        (mr) => mr.mandalId.toString() === activeMandalId.toString()
      );
      req.role = currentMandalRole ? currentMandalRole.role : 'VIEWER';
    } else {
      req.mandalId = null;
      req.role = 'VIEWER';
    }

    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.role) {
      return res.status(403).json({ message: 'Forbidden, no role mapped' });
    }

    // MANDAL_ADMIN and SUPER_ADMIN have full override permissions
    if (req.role === 'MANDAL_ADMIN' || req.role === 'SUPER_ADMIN') {
      return next();
    }

    if (!roles.includes(req.role)) {
      return res.status(403).json({
        message: `Forbidden: Role '${req.role}' is not authorized to access this resource`,
      });
    }
    next();
  };
};
