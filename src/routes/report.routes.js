const router = require('express').Router();

const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const {validateReport, getAnalyticsReport }= require('../middlewares/report.middleware');

const {
  createReport,
  getReports,
  resolveReport
} = require('../controllers/report.controller');

// POST /api/reports any logged-in user
/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: User reporting endpoints
 */

/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: Submit a new violation report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetType
 *               - targetId
 *               - reason
 *             properties:
 *               targetType:
 *                 type: string
 *                 enum: [Project, User]
 *                 example: Project
 *               targetId:
 *                 type: string
 *                 example: 60d5ecb8b5c9c22b102b34a1
 *               reason:
 *                 type: string
 *                 example: Spam or offensive content in title
 *     responses:
 *       201:
 *         description: Report submitted successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 */

router.post(
  '/',
  authenticate,
  validateReport,
  createReport
);

// GET /api/reports admin only
/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Get all reports (Admin only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reports retrieved successfully
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Requires Admin role
 */
router.get(
  '/',
  authenticate,
  authorize('Admin'),
  getReports
);

// PATCH /api/reports/:id/resolve admin only
/**
 * @swagger
 * /api/reports/{id}/resolve:
 *   patch:
 *     summary: Resolve or dismiss a report (Admin only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The report ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [resolved, dismissed]
 *                 example: resolved
 *     responses:
 *       200:
 *         description: Report resolved successfully
 *       400:
 *         description: Invalid status or request body
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       403:
 *         description: Forbidden - Requires Admin role
 *       404:
 *         description: Report not found
 */
router.patch(
  '/:id/resolve',
  authenticate,
  authorize('Admin'),
  resolveReport
);

// Admin-only report route
/**
 * @swagger
 * /api/reports/analytics:
 *   get:
 *     summary: Get overall platform analytics and application statistics
 *     description: Retrieves high-level platform analytics, including total users, total projects, application breakdowns by status, and acceptance rate. Requires Admin authorization.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Analytics report generated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     overview:
 *                       type: object
 *                       properties:
 *                         totalUsers:
 *                           type: integer
 *                           example: 150
 *                         totalProjects:
 *                           type: integer
 *                           example: 45
 *                         totalApplications:
 *                           type: integer
 *                           example: 120
 *                         acceptanceRate:
 *                           type: string
 *                           example: "35.50%"
 *                     applicationsBreakdown:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 120
 *                         PENDING:
 *                           type: integer
 *                           example: 50
 *                         ACCEPTED:
 *                           type: integer
 *                           example: 42
 *                         REJECTED:
 *                           type: integer
 *                           example: 28
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *       403:
 *         description: Forbidden - Requires Admin role
 *       500:
 *         description: Internal server error
 */
router.get('/analytics', authenticate, authorize('Admin'), getAnalyticsReport);

module.exports = router;