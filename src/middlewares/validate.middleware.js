const { validationResult } = require('express-validator');

// This is a REUSABLE middleware — not just for Reports, anyone on the team
// can use this after their own express-validator rules (e.g. registerValidator,
// createProjectValidator, etc.) so nobody has to rewrite this check themselves.
//
// How it fits in the chain: validator rules (like createReportValidator) don't
// throw errors themselves — they just collect problems into a list attached to
// the request. This middleware is the one that actually checks that list and
// stops the request if anything failed.
module.exports = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // 400 = "the request itself is malformed/invalid", not a server problem
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg, // send back the first validation error found
      errors: errors.array() // full list, in case the frontend wants to show all of them
    });
  }

  // no validation errors — let the request continue to the actual controller
  next();
};