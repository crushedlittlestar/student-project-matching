const router = require('express').Router();
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const {
  getAllUsers,
  updateUserRole,
  getAllProjects,
  deleteProject,
  getAllApplications,
  deleteApplication,
  deleteSkill,
  getAllReports,
  resolveReport
} = require('../controllers/admin.controller');

// Enforce authentication & Admin role across all routes in this file
router.use(authenticate, authorize('Admin'));

// User routes
/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative management endpoints (Admin authorization required)
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all registered users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users retrieved successfully
 *       401:
 *         description: Unauthorized token missing or invalid
 *       403:
 *         description: Forbidden - Requires Admin role
 */
router.get('/users', getAllUsers);
/**
 * @swagger
 * /api/admin/users/{id}:
 *   patch:
 *     summary: Update a user's role or block status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [Student, Admin]
 *                 example: Admin
 *               isBlocked:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
router.patch('/users/:id', updateUserRole);

// Project routes
/**
 * @swagger
 * /api/admin/projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of projects retrieved successfully
 */
router.get('/projects', getAllProjects);
/**
 * @swagger
 * /api/admin/projects/{id}:
 *   delete:
 *     summary: Delete a project
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The project ID
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       404:
 *         description: Project not found
 */
router.delete('/projects/:id', deleteProject);

// Report routes
/**
 * @swagger
 * /api/admin/reports:
 *   get:
 *     summary: Get all submitted reports
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user reports retrieved
 */
router.get('/reports', getAllReports);
/**
 * @swagger
 * /api/admin/reports/{id}/resolve:
 *   patch:
 *     summary: Resolve or dismiss a report
 *     tags: [Admin]
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
 *         description: Report status updated successfully
 *       404:
 *         description: Report not found
 */
router.patch('/reports/:id/resolve', resolveReport);

// Application management routes

/**
 * @swagger
 * /api/admin/applications:
 *   get:
 *     summary: Get all project applications
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, ACCEPTED, REJECTED]
 *         description: Filter applications by status
 *     responses:
 *       200:
 *         description: List of all applications retrieved successfully
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - Requires Admin role
 */
router.get('/applications', getAllApplications);

/**
 * @swagger
 * /api/admin/applications/{id}:
 *   delete:
 *     summary: Delete or withdraw an application as Admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The application ID
 *     responses:
 *       200:
 *         description: Application deleted successfully
 *       404:
 *         description: Application not found
 */
router.delete('/applications/:id', deleteApplication);
router.get('/applications', getAllApplications);
/**
 * @swagger
 * /api/admin/skills/{id}:
 *   delete:
 *     summary: Delete a skill 
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Skill deleted response
 */
router.delete('/skills/:id', deleteSkill);

module.exports = router;