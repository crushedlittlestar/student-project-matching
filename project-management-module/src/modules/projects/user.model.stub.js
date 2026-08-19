/**
 * INTEGRATION CONTRACT with Member 1 (Authentication & User Management).
 * This stub exists ONLY so project.service.js can populate('owner', ...)
 * when running/testing this module standalone.
 *
 * Delete this file once merged and require Member 1's real User model
 * instead — as long as it exposes `name` and `email`, nothing else here
 * needs to change.
 */
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
