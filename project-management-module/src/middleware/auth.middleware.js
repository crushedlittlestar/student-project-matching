/**
 * INTEGRATION CONTRACT with Member 1 (Auth & User Management).
 *
 * This is a minimal, working stand-in so the Projects module can run and be
 * tested in isolation. When merging, DELETE this file and import Member 1's
 * real `authenticate` / `authorize` middleware instead — as long as they:
 *   - set `req.user = { id, role, ...}` on success
 *   - call `next(new ApiError(401, ...))` on invalid/missing token
 *   - `authorize(...roles)` returns 403 if req.user.role isn't included
 *
 * Everything downstream (project.routes.js, ownership checks, tests) only
 * depends on `req.user.id` and `req.user.role` existing — nothing else.
 */
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const authenticate = catchAsync(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;

  if (!token) {
    throw new ApiError(401, 'Authentication token is missing');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired token');
  }
});

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    throw new ApiError(403, 'You do not have permission to perform this action');
  }
  next();
};

module.exports = { authenticate, authorize };
