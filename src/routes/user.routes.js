const express = require("express");
const { getMe, updateMe } = require("../controllers/user.controller");
const authenticate = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { updateProfileSchema } = require("../validations/auth.validation");

const router = express.Router();

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user's profile
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *       401:
 *         description: Authentication required
 *       404:
 *         description: User not found
 */
router.get("/users/me", authenticate, getMe);

/**
 * @swagger
 * /api/users/me:
 *   patch:
 *     summary: Update current user's profile
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jana Updated
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jana.updated@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       404:
 *         description: User not found
 *       409:
 *         description: Email already exists
 */
router.patch(
    "/users/me",
    authenticate,
    validate(updateProfileSchema),
    updateMe
);

module.exports = router;