const catchAsync = require('../utils/catchAsync');
const {
  validateCreateProject,
  validateUpdateProject,
  validateChangeStatus,
} = require('../validations/project.validation');
const service = require('../services/project.service');

// POST /api/projects
const createProject = catchAsync(async (req, res) => {
  validateCreateProject(req.body);
  const project = await service.createProject(req.user.id, req.body);
  res.status(201).json({ success: true, data: project });
});

// GET /api/projects
const listProjects = catchAsync(async (req, res) => {
  const { data, meta } = await service.listProjects(req.query);
  res.status(200).json({ success: true, data, meta });
});

// GET /api/projects/:id
const getProject = catchAsync(async (req, res) => {
  const project = await service.getProjectById(req.params.id);
  res.status(200).json({ success: true, data: project });
});

// PATCH /api/projects/:id
// status is not editable here — use PATCH /api/projects/:id/status instead.
const updateProject = catchAsync(async (req, res) => {
  validateUpdateProject(req.body);
  const project = await service.updateProject(req.params.id, req.user, req.body);
  res.status(200).json({ success: true, data: project });
});

// PATCH /api/projects/:id/status
// Body: { status: 'IN_PROGRESS' | 'COMPLETED' }
// Enforces OPEN -> IN_PROGRESS -> COMPLETED, no skipping.
const changeStatus = catchAsync(async (req, res) => {
  validateChangeStatus(req.body);
  const project = await service.changeStatus(req.params.id, req.user, req.body.status);
  res.status(200).json({ success: true, data: project });
});

// DELETE /api/projects/:id
const deleteProject = catchAsync(async (req, res) => {
  await service.deleteProject(req.params.id, req.user);
  res.status(204).send();
});

module.exports = {
  createProject,
  listProjects,
  getProject,
  updateProject,
  changeStatus,
  deleteProject,
};
