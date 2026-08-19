const mongoose = require('mongoose');

// TEMPORARY placeholder — replace once Module 2 (Projects) is merged into main.
// Only exists so Report.controller.js's require() doesn't crash during
// development. The real schema will have many more fields.
const projectSchema = new mongoose.Schema({
  title: String,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED'],
    default: 'OPEN'
  }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);