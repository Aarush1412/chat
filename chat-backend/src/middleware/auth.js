const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    const err = new Error('Not authorized, no token');
    err.statusCode = 401;
    throw err;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id; // attach user ID to request
    next();
  } catch (err) {
    const error = new Error('Not authorized, token failed');
    error.statusCode = 401;
    throw error;
  }
});

module.exports = { protect };
