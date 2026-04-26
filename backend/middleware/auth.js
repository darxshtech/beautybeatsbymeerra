const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Handle the pseudo-admin ID from AuthService induction credentials
      if (decoded.id === 'SYSTEM_ADMIN_ID' || decoded.id === '000000000000000000000000') {
        req.user = {
          _id: '000000000000000000000000',
          id: '000000000000000000000000',
          name: 'System Admin',
          email: process.env.ADMIN_EMAIL,
          role: 'ADMIN'
        };
        return next();
      }

      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
         return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      return next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const optionalProtect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    
    // Guard against literal "null" or "undefined" strings from frontend
    if (!token || token === 'null' || token === 'undefined') {
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (decoded.id === 'SYSTEM_ADMIN_ID' || decoded.id === '000000000000000000000000') {
        req.user = {
          _id: '000000000000000000000000',
          id: '000000000000000000000000',
          name: 'System Admin',
          email: process.env.ADMIN_EMAIL,
          role: 'ADMIN'
        };
      } else {
        req.user = await User.findById(decoded.id).select('-password');
      }
    } catch (error) {
      console.error('Optional auth failed:', error.message);
    }
  }
  return next();
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role || 'GUEST'} is not authorized to access this route`
      });
    }
    return next();
  };
};

module.exports = { protect, authorize, optionalProtect };
