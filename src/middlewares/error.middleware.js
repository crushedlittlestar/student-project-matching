module.exports = (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error(err);
  }

  const statusCode = err.statusCode || err.status || 500;

  res.status(statusCode).json({
    message: err.message || 'Server error',
    errors: err.errors || []
  });
};