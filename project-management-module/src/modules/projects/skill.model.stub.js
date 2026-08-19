/**
 * INTEGRATION CONTRACT with Member 2 (Skills & Student Profiles).
 * This stub exists ONLY so project.service.js can validate that the
 * requiredSkills sent when creating/updating a project actually exist.
 *
 * Delete this file once merged and instead require Member 2's real Skill
 * model from its module path — as long as it exposes `name` and `status`
 * fields, project.service.js needs no changes.
 */
const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    category: { type: String, trim: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Skill || mongoose.model('Skill', skillSchema);
