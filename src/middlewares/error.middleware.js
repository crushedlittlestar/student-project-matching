const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server error';

  // Mongoose bad ObjectId 
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }

  // Mongoose duplicate key error (e.g. duplicate email, duplicate report)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for field: ${field}`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Log every error that reaches this point, with enough context (method,
  // URL, resulting status) to debug later from the log files alone.
  // We log err.message here, never the raw request body, since some
  // requests (login, register) contain passwords/tokens.  logger.error(`${req.method} ${req.originalUrl} - ${statusCode} - ${message}`);
  // One consistent response shape for every error in the whole API,
  // regardless of which module or route it came from.
  res.status(statusCode).json({
    success: false,
    message
  });
};