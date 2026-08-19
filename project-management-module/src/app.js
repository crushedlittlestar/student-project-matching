const express = require('express');
const ApiError = require('./utils/ApiError');

const projectRoutes = require('./modules/projects/project.routes');
const categoryRoutes = require('./modules/categories/category.routes');

const app = express();
app.use(express.json());

app.use('/api/projects', projectRoutes);
app.use('/api/categories', categoryRoutes);

// 404 handler
app.use((req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
});

// Global error handler — real one likely owned by Member 6, kept minimal here
// so this module is runnable/testable on its own.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    errors: err.errors || [],
  });
});

module.exports = app;
