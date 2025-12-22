// backend/middleware/authMiddleware.js
console.log('TEST'); 
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// This is your protect middleware, with added console.logs
const protect = asyncHandler(async (req, res, next) => {
  let token;

  console.log('----- PROTECT MIDDLEWARE RUNNING -----');
  console.log('Authorization Header:', req.headers.authorization);

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('Extracted Token:', token);
      console.log('JWT_SECRET from .env:', process.env.JWT_SECRET);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token is valid. Decoded ID:', decoded.id);

      req.user = await User.findById(decoded.id).select('-password');
      console.log('User found:', req.user.name);
       console.log('Calling next() to proceed to the controller.');
      next(); 
    
    } catch (error) {
      console.error('Error during token verification or user lookup:', error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    console.log('No token found in header.');
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Admin middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

// Seller middleware (allows admins too, as they usually have seller capabilities)
const seller = (req, res, next) => {
  if (req.user && req.user.role === 'seller' && req.user.isVerifiedSeller) {
    next();
  } else {
    res.status(401).json({ message: 'Seller access denied. Wait for Admin approval.' });
  }
};

module.exports = { protect, admin, seller };


module.exports = { protect, admin, seller };