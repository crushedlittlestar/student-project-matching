const mongoose = require("mongoose");

const APPLICATION_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN",
];

const applicationSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project is required"],
    },

    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Applicant is required"],
    },

    message: {
      type: String,
      required: [true, "Application message is required"],
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },

    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

/*
 * Prevent the same student from applying
 * to the same project more than once.
 */
applicationSchema.index(
  {
    project: 1,
    applicant: 1,
  },
  {
    unique: true,
  }
);

applicationSchema.statics.STATUSES = APPLICATION_STATUSES;

module.exports =
  mongoose.models.Application ||
  mongoose.model("Application", applicationSchema);