const User = require("../models/user.model");
const Project = require('../models/project.model');
const Report = require('../models/Report.model');
const { ApiError, logger, sendSuccess } = require('../utils');


// GET /api/admin/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    return sendSuccess(res, users, 'Users retrieved successfully', 200);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/users/:id
exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, isBlocked } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { ...(role && { role }), ...(isBlocked !== undefined && { isBlocked }) },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    logger?.info?.(`Admin action: user ${req.user.id || req.user.userId} updated user ${id} at ${new Date().toISOString()}`);

    return sendSuccess(res, user, 'User updated successfully', 200);
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/projects
exports.getAllProjects = async (req, res, next) => {
  try {
    const projects = await Project.find();
    return sendSuccess(res, projects, 'Projects retrieved successfully', 200);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/projects/:id
exports.deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return next(new ApiError(404, 'Project not found'));
    }

    logger?.info?.(`Admin action: user ${req.user.id || req.user.userId} deleted project ${id} at ${new Date().toISOString()}`);

    return sendSuccess(res, null, 'Project deleted successfully', 200);
  } catch (err) {
    next(err);
  }
};
// GET /api/admin/reports
exports.getAllReports = async (req, res, next) => {
  try {
    const reports = await Report.find().populate('reporter', 'name email');
    return sendSuccess(res, reports, 'Reports retrieved successfully', 200);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/reports/:id/resolve
exports.resolveReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'resolved' or 'dismissed'

    const report = await Report.findByIdAndUpdate(
      id,
      { status, resolvedBy: req.user.id || req.user.userId, resolvedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!report) {
      return next(new ApiError(404, 'Report not found'));
    }

    logger?.info?.(`Admin action: user ${req.user.id || req.user.userId} updated report ${id} status to ${status}`);

    return sendSuccess(res, report, 'Report resolved successfully', 200);
  } catch (err) {
    next(err);
  }
};
// GET /api/admin/applications (Placeholder)
exports.getAllApplications = async (req, res, next) => {
  try {
    return sendSuccess(res, [], 'Applications module pending merge', 200);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/skills/:id (Placeholder)
exports.deleteSkill = async (req, res, next) => {
  try {
    const { id } = req.params;
    logger?.info?.(`Admin action: user ${req.user.id || req.user.userId} deleted skill ${id} at ${new Date().toISOString()}`);
    return sendSuccess(res, null, 'Skill deleted successfully', 200);
  } catch (err) {
    next(err);
  }
};