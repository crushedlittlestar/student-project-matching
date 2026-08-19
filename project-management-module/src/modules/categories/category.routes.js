const express = require('express');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('./category.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Project category management
 */

// @route  GET /api/categories
// @access Public
router.get('/', listCategories);

// @route  POST /api/categories
// @access Admin
router.post('/', authenticate, authorize('admin'), createCategory);

// @route  PATCH /api/categories/:id
// @access Admin
router.patch('/:id', authenticate, authorize('admin'), updateCategory);

// @route  DELETE /api/categories/:id
// @access Admin
router.delete('/:id', authenticate, authorize('admin'), deleteCategory);

module.exports = router;
