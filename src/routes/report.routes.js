const router = require('express').Router();

const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const validateReport = require('../middlewares/report.middleware');
const {
  createReport,
  getReports,
  resolveReport
} = require('../controllers/report.controller');

// POST /api/reports any logged-in user
router.post(
  '/reports',
  authenticate,
  validateReport,
  createReport
);
// GET /api/reports admin only
router.get(
  '/reports',
  authenticate,
  authorize('Admin'),
  getReports
);

// PATCH /api/reports/:id/resolve admin only.
router.patch(
  '/reports/:id/resolve',
  authenticate,
  authorize('Admin'),
  resolveReport
);

module.exports = router;