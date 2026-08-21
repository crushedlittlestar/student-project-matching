const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({

  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },

    // A report can point at either a Project or a User. We store which
    // TYPE is being reported here, and the actual id below.
 targetType: {
    type: String,
    enum: ['Project', 'User'],
    required: true
  },

 // The id of the actual Project or User being reported
 targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  reason: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 5000
  },

  status: {
    // A report's lifecycle: it starts Pending, and an admin later moves it
    // to Reviewed (action was taken) or Dismissed (nothing wrong found)
    type: String,
    enum: ['Pending', 'Reviewed', 'Dismissed'],
    default: 'Pending'
  },

  resolvedBy: {
    // Which admin resolved this report — null until someone actually does.
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }

}, 
{
  timestamps: true
});

// BUSINESS RULE enforced at the DATABASE level
reportSchema.index(
  { reporter: 1, targetType: 1, targetId: 1 },
  { unique: true }
);

module.exports = mongoose.model('Report', reportSchema);