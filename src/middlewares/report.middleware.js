const reportService = require('../services/report.service');
const { sendSuccess } = require('../utils');

const validateReport = (req, res, next) => {
  const errors = [];
  const { targetType, targetId, reason } = req.body;

  if (!targetType || !['Project', 'User'].includes(targetType)) {
    errors.push('targetType must be Project or User');
  }

  if (!targetId || !targetId.match(/^[0-9a-fA-F]{24}$/)) {
    errors.push('targetId must be a valid id');
  }

  if (!reason || reason.trim().length < 5 || reason.trim().length > 500) {
    errors.push('reason must be 5-500 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors.join(', ')
    });
  }

  next();
};

const getAnalyticsReport = async (req, res, next) => {
  try {
    const analytics = await reportService.getPlatformAnalytics();
    return sendSuccess(res, analytics, 'Analytics report generated successfully', 200);
  } catch (err) {
    next(err);
  }
};

// Export both functions as an object:
module.exports = {
  validateReport,
  getAnalyticsReport
};