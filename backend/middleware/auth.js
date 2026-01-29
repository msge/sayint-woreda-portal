const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = {
  // Protect routes
  protect: async (req, res, next) => {
    try {
      let token;
      
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      }
      
      if (!token) {
        return res.status(401).json({
          status: 'error',
          message: 'You are not logged in. Please log in to get access.',
        });
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if user still exists
      const user = await User.findByPk(decoded.id);
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'The user belonging to this token no longer exists.',
        });
      }
      
      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          status: 'error',
          message: 'Your account has been deactivated.',
        });
      }
      
      // Grant access
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token.',
      });
    }
  },
  
  // Restrict to roles
  restrictTo: (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to perform this action.',
        });
      }
      next();
    };
  },
  
  // Generate token
  generateToken: (user) => {
    return jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  },
};

module.exports = auth;