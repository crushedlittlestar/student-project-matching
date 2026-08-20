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

module.exports = validateReport;