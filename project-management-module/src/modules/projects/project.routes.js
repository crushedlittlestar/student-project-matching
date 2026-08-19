const express = require('express');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const controller = require('./project.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project creation, browsing, and lifecycle management
 */

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: List / search / filter projects
 *     tags: [Projects]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [OPEN, IN_PROGRESS, COMPLETED] }
 *       - in: query
 *         name: skill
 *         schema: { type: string }
 *         description: Comma-separated skill ids
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: sort
 *         schema: { type: string }
 *         description: e.g. -createdAt,title
 *     responses:
 *       200: { description: OK }
 *   post:
 *     summary: Create a project
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Created }
 *       400: { description: Validation error }
 *       401: { description: Not authenticated }
 */
router.get('/', controller.listProjects);
router.post('/', authenticate, authorize('student'), controller.createProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get a single project
 *     tags: [Projects]
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not found }
 *   patch:
 *     summary: Update a project (owner or admin only)
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Updated }
 *       403: { description: Not the owner or an admin }
 *   delete:
 *     summary: Delete a project (owner or admin only, and only if no teammates yet)
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204: { description: Deleted }
 *       403: { description: Not the owner or an admin }
 *       409: { description: Project already has team members }
 */
router.get('/:id', controller.getProject);
router.patch('/:id', authenticate, controller.updateProject);
router.delete('/:id', authenticate, controller.deleteProject);

/**
 * @swagger
 * /api/projects/{id}/status:
 *   patch:
 *     summary: >
 *       Transition a project's status (owner or admin only).
 *       Strictly linear: OPEN -> IN_PROGRESS -> COMPLETED, no skipping
 *       (e.g. OPEN -> COMPLETED directly is rejected).
 *     tags: [Projects]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [OPEN, IN_PROGRESS, COMPLETED] }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Invalid status value }
 *       403: { description: Not the owner or an admin }
 *       409: { description: Invalid transition from current status }
 */
router.patch('/:id/status', authenticate, controller.changeStatus);

module.exports = router;
