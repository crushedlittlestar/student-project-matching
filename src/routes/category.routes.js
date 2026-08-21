const express = require('express');
const  authenticate  = require('../middlewares/auth.middleware');
const   authorize  = require('../middlewares/role.middleware');

const {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/category.controller');

const router = express.Router();

// @route  GET /api/categories
// @access Public
router.get('/', listCategories);

// @route  POST /api/categories
// @access Admin
router.post('/', authenticate, authorize('Admin'), createCategory);

// @route  PATCH /api/categories/:id
// @access Admin
router.patch('/:id', authenticate, authorize('Admin'), updateCategory);

// @route  DELETE /api/categories/:id
// @access Admin
router.delete('/:id', authenticate, authorize('Admin'), deleteCategory);

module.exports = router;
