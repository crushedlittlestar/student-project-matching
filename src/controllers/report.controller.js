const Report = require('../models/Report.model');
const Project = require('../models/project.model');
const reportService = require('../services/report.service');
const { AppError, sendSuccess, sendError } = require('../utils');

// CREATE a report — any logged-in user can report a Project or a User.
const createReport = async (req, res, next) => {
  try {
    const { targetType, targetId, reason } = req.body;

    // BUSINESS RULE: you can't report your own project.
    if (targetType === 'Project') {
      const project = await Project.findById(targetId);

      if (!project) {
        return next(new AppError('Project not found', 404));
      }

      if (project.owner.toString() === req.user.userId) {
        return next(new AppError('You cannot report your own project', 400));
      }
    }

    const report = await Report.create({
      reporter: req.user.userId,
      targetType,
      targetId,
      reason
    });

    return sendSuccess(res, report, 'Report submitted successfully', 201);

  } catch (err) {
    if (err.code === 11000) {
      return next(new AppError('You have already reported this', 400));
    }
    next(err);
  }
};

// GET reports — admin only (enforced by route middleware).
const getReports = async (req, res, next) => {
  try {
    const { status = 'Pending' } = req.query;

    const reports = await Report.find({ status })
      .populate('reporter', 'name email');

    return sendSuccess(res, reports, 'Reports fetched successfully', 200);

  } catch (err) {
    next(err);
  }
};

// RESOLVE report: admin dismiss it or take action.
const resolveReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    const report = await Report.findById(id);

    if (!report) {
      return next(new AppError('Report not found', 404));
    }

    if (report.status !== 'Pending') {
      return next(new AppError('This report has already been resolved', 400));
    }

    if (action === 'takeAction' && report.targetType === 'Project') {
      await Project.findByIdAndDelete(report.targetId);
    }

    report.status = action === 'dismiss' ? 'Dismissed' : 'Reviewed';
    report.resolvedBy = req.user.userId;
    await report.save();

    return sendSuccess(res, report, 'Report resolved successfully', 200);

  } catch (err) {
    next(err);
  }
};

// GET /api/reports/analytics
const getAnalyticsReport = async (req, res, next) => {
  try {
    const analytics = await reportService.getPlatformAnalytics();
    return sendSuccess(res, analytics, 'Analytics report generated successfully', 200);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createReport,
  getReports,
  resolveReport,
  getAnalyticsReport
};