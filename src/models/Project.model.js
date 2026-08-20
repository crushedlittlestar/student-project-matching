const mongoose = require('mongoose');

const STATUSES = ['OPEN', 'IN_PROGRESS', 'COMPLETED'];

/**
 * Status meaning:
 *  - OPEN:        initial state, project just created.
 *  - IN_PROGRESS: work has started.
 *  - COMPLETED:   terminal. Project is finished.
 *
 * Allowed transitions (strictly linear, no skipping):
 *  OPEN         -> IN_PROGRESS
 *  IN_PROGRESS  -> COMPLETED
 *  COMPLETED    -> (none — terminal)
 *
 * OPEN -> COMPLETED directly is NOT allowed.
 *
 * Only the project owner or an Admin may trigger a transition (see
 * assertIsOwnerOrAdmin in project.service.js).
 */
const TRANSITIONS = {
  OPEN: ['IN_PROGRESS'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED: [],
};

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: 5,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: 20,
      maxlength: 2000,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
    },
    requiredSkills: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'At least one required skill must be specified',
      },
    },
    maxMembers: {
      type: Number,
      required: true,
      min: [2, 'maxMembers must be at least 2 (owner + at least one teammate)'],
      max: [20, 'maxMembers seems unreasonably high for a bootcamp team'],
    },
    // Owner counts as the first member from creation. Kept in sync by
    // Project.syncMembershipCount(), called from the Applications/Teams
    // module (Member 4 / Member 5) whenever a member is accepted or leaves.
    currentMembersCount: {
      type: Number,
      default: 1,
      min: 1,
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'OPEN',
    },
    deadline: {
      type: Date,
      validate: {
        validator: (v) => !v || v > new Date(),
        message: 'Deadline must be in the future',
      },
    },
    image: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

projectSchema.index({ title: 'text', description: 'text' });
projectSchema.index({ status: 1, category: 1 });

projectSchema.statics.STATUSES = STATUSES;

projectSchema.statics.canTransition = function canTransition(from, to) {
  return TRANSITIONS[from]?.includes(to) ?? false;
};

module.exports =
    mongoose.models.Project ||
    mongoose.model("Project", projectSchema);