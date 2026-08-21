const ApiError = require('../utils/ApiError');

function validateCreateCategory(body) {
  const errors = [];
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
    errors.push('name is required and must be at least 2 characters');
  }
  if (body.description && body.description.length > 200) {
    errors.push('description must be 200 characters or fewer');
  }
  if (errors.length) throw new ApiError(400, 'Validation failed', errors);
}

function validateUpdateCategory(body) {
  const errors = [];
  if (body.name !== undefined && body.name.trim().length < 2) {
    errors.push('name must be at least 2 characters');
  }
  if (body.status !== undefined && !['Active', 'Inactive'].includes(body.status)) {
    errors.push('status must be Active or Inactive');
  }
  if (errors.length) throw new ApiError(400, 'Validation failed', errors);
}

module.exports = { validateCreateCategory, validateUpdateCategory };
