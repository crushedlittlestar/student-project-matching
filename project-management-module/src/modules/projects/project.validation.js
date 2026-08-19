const mongoose = require('mongoose');
const ApiError = require('../../utils/ApiError');
const Project = require('./project.model');

const isObjectId = (v) => mongoose.Types.ObjectId.isValid(v);

function validateCreateProject(body) {
  const errors = [];

  if (!body.title || body.title.trim().length < 5 || body.title.trim().length > 100) {
    errors.push('title is required and must be between 5 and 100 characters');
  }
  if (
    !body.description ||
    body.description.trim().length < 20 ||
    body.description.trim().length > 2000
  ) {
    errors.push('description is required and must be between 20 and 2000 characters');
  }
  if (!body.category || !isObjectId(body.category)) {
    errors.push('category must be a valid category id');
  }
  if (
    !Array.isArray(body.requiredSkills) ||
    body.requiredSkills.length === 0 ||
    !body.requiredSkills.every(isObjectId)
  ) {
    errors.push('requiredSkills must be a non-empty array of valid skill ids');
  }
  if (
    body.maxMembers === undefined ||
    !Number.isInteger(body.maxMembers) ||
    body.maxMembers < 2 ||
    body.maxMembers > 20
  ) {
    errors.push('maxMembers must be an integer between 2 and 20');
  }
  if (body.deadline !== undefined) {
    const d = new Date(body.deadline);
    if (Number.isNaN(d.getTime()) || d <= new Date()) {
      errors.push('deadline must be a valid future date');
    }
  }

  if (errors.length) throw new ApiError(400, 'Validation failed', errors);
}

// Fields a student/owner is allowed to edit directly.
const EDITABLE_FIELDS = [
  'title',
  'description',
  'category',
  'requiredSkills',
  'maxMembers',
  'deadline',
  'image',
];

function validateUpdateProject(body) {
  const errors = [];
  const attemptedFields = Object.keys(body);

  // status is changed exclusively via PATCH /api/projects/:id/status
  const forbidden = attemptedFields.filter((f) => !EDITABLE_FIELDS.includes(f));
  if (forbidden.length) {
    errors.push(
      `these fields cannot be updated directly: ${forbidden.join(', ')}`
    );
  }

  if (body.title !== undefined) {
    if (body.title.trim().length < 5 || body.title.trim().length > 100) {
      errors.push('title must be between 5 and 100 characters');
    }
  }
  if (body.description !== undefined) {
    if (body.description.trim().length < 20 || body.description.trim().length > 2000) {
      errors.push('description must be between 20 and 2000 characters');
    }
  }
  if (body.category !== undefined && !isObjectId(body.category)) {
    errors.push('category must be a valid category id');
  }
  if (body.requiredSkills !== undefined) {
    if (
      !Array.isArray(body.requiredSkills) ||
      body.requiredSkills.length === 0 ||
      !body.requiredSkills.every(isObjectId)
    ) {
      errors.push('requiredSkills must be a non-empty array of valid skill ids');
    }
  }
  if (body.maxMembers !== undefined) {
    if (!Number.isInteger(body.maxMembers) || body.maxMembers < 2 || body.maxMembers > 20) {
      errors.push('maxMembers must be an integer between 2 and 20');
    }
  }
  if (body.deadline !== undefined) {
    const d = new Date(body.deadline);
    if (Number.isNaN(d.getTime()) || d <= new Date()) {
      errors.push('deadline must be a valid future date');
    }
  }
  // status is validated separately via the state machine in the service
  // layer (it needs the current status to check the transition), not here.

  if (errors.length) throw new ApiError(400, 'Validation failed', errors);
}

// Body validation for PATCH /api/projects/:id/status.
// The actual transition legality (OPEN -> IN_PROGRESS -> COMPLETED, no
// skipping) is checked in the service layer, since it needs the project's
// current status.
function validateChangeStatus(body) {
  const errors = [];

  if (!body.status || !Project.STATUSES.includes(body.status)) {
    errors.push(`status must be one of: ${Project.STATUSES.join(', ')}`);
  }

  if (errors.length) throw new ApiError(400, 'Validation failed', errors);
}

module.exports = { validateCreateProject, validateUpdateProject, validateChangeStatus };
