const Category = require('./category.model');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const {
  validateCreateCategory,
  validateUpdateCategory,
} = require('./category.validation');

// GET /api/categories  (public — students need this to filter/browse projects)
const listCategories = catchAsync(async (req, res) => {
  const filter = req.query.includeInactive ? {} : { status: 'Active' };
  const categories = await Category.find(filter).sort('name');
  res.status(200).json({ success: true, data: categories });
});

// POST /api/categories  (admin only)
const createCategory = catchAsync(async (req, res) => {
  validateCreateCategory(req.body);
  const exists = await Category.findOne({ name: req.body.name.trim() });
  if (exists) throw new ApiError(409, 'A category with this name already exists');

  const category = await Category.create({
    name: req.body.name.trim(),
    description: req.body.description,
  });
  res.status(201).json({ success: true, data: category });
});

// PATCH /api/categories/:id  (admin only)
const updateCategory = catchAsync(async (req, res) => {
  validateUpdateCategory(req.body);
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!category) throw new ApiError(404, 'Category not found');
  res.status(200).json({ success: true, data: category });
});

// DELETE /api/categories/:id  (admin only)
// Soft-guard: refuse to delete a category that's still in use so existing
// projects don't end up pointing at a dangling reference.
const deleteCategory = catchAsync(async (req, res) => {
  const Project = require('../projects/project.model'); // lazy require avoids circular import at module load
  const inUse = await Project.exists({ category: req.params.id });
  if (inUse) {
    throw new ApiError(
      409,
      'Cannot delete a category that is still assigned to projects. Set it to Inactive instead.'
    );
  }
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found');
  res.status(204).send();
});

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };
