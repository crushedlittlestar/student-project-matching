const catchAsync = require("../utils/catchAsync");

const {
  validateCreateApplication,
} = require("../validations/application.validation");

const service = require("../services/application.service");


// POST /api/projects/:projectId/applications
const createApplication = catchAsync(async (req, res) => {
  validateCreateApplication(req.body);

  const application = await service.createApplication(
    req.user.userId,
    req.params.projectId,
    req.body.message
  );

  res.status(201).json({
    success: true,
    data: application,
  });
});


// GET /api/applications/me
const getMyApplications = catchAsync(async (req, res) => {
  const applications = await service.getMyApplications(
    req.user.userId,
    req.query
  );

  res.status(200).json({
    success: true,
    data: applications,
  });
});


// GET /api/projects/:projectId/applications
const getProjectApplications = catchAsync(async (req, res) => {
  const applications = await service.getProjectApplications(
    req.user.userId,
    req.params.projectId,
    req.query
  );

  res.status(200).json({
    success: true,
    data: applications,
  });
});


// PATCH /api/applications/:id/accept
const acceptApplication = catchAsync(async (req, res) => {
  const application = await service.acceptApplication(
    req.user.userId,
    req.params.id
  );

  res.status(200).json({
    success: true,
    data: application,
  });
});


// PATCH /api/applications/:id/reject
const rejectApplication = catchAsync(async (req, res) => {
  const application = await service.rejectApplication(
    req.user.userId,
    req.params.id
  );

  res.status(200).json({
    success: true,
    data: application,
  });
});


// DELETE /api/applications/:id
const withdrawApplication = catchAsync(async (req, res) => {
  const application = await service.withdrawApplication(
    req.user.userId,
    req.params.id
  );

  res.status(200).json({
    success: true,
    data: application,
  });
});


module.exports = {
  createApplication,
  getMyApplications,
  getProjectApplications,
  acceptApplication,
  rejectApplication,
  withdrawApplication,
};