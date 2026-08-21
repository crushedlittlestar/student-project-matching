const express = require("express");
const swaggerUi = require("swagger-ui-express");

const swaggerSpec = require("./config/swagger");
const ApiError = require('./utils/ApiError');

const projectRoutes = require('./routes/project.routes');
const categoryRoutes = require('./routes/category.routes');
const reportRouter = require('./routes/report.routes');
const authRouter = require('./routes/auth.routes');
const userRouter = require('./routes/user.routes');
const errorHandler = require('./middlewares/error.middleware');
const adminRoutes = require('./routes/admin.routes');
const skillRoutes = require('./routes/skills.routes');
const studentRoutes = require('./routes/students.routes');

const app = express();
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/projects', projectRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reports', reportRouter);

app.use('/api/admin', adminRoutes);
app.use('/api', skillRoutes);
app.use('/api', studentRoutes);


// 404 handler
app.use((req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
});

// Central error handler
app.use(errorHandler);

module.exports = app;
