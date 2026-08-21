/**
 * Wraps an async controller so rejected promises are forwarded to next(err)
 * instead of crashing the process or needing a try/catch in every controller.
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;
