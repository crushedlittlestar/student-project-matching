const Application = require('../models/application.model');
const Project = require('../models/project.model');
const User = require('../models/user.model');

// Generate platform metrics including Application analytics
 
const getPlatformAnalytics = async () => {
  // Application statistics aggregation
  const applicationStats = await Application.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Transform aggregation array into a structured object
  const appsByStatus = {
    total: 0,
    PENDING: 0,
    ACCEPTED: 0,
    REJECTED: 0
  };

  applicationStats.forEach(stat => {
    if (appsByStatus.hasOwnProperty(stat._id)) {
      appsByStatus[stat._id] = stat.count;
    }
    appsByStatus.total += stat.count;
  });

  // Calculate acceptance rate percentage
  const acceptanceRate = appsByStatus.total > 0 
    ? ((appsByStatus.ACCEPTED / appsByStatus.total) * 100).toFixed(2) + '%'
    : '0%';

  // Count totals for broader context
  const totalUsers = await User.countDocuments();
  const totalProjects = await Project.countDocuments();

  return {
    overview: {
      totalUsers,
      totalProjects,
      totalApplications: appsByStatus.total,
      acceptanceRate
    },
    applicationsBreakdown: appsByStatus
  };
};

module.exports = {
  getPlatformAnalytics
};