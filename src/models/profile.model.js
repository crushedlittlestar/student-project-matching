const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    user: 
    { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true, 
      unique: true 
    },
    bio:
    { 
      type: String, 
      trim: true, 
      maxlength: 500, 
      default: '' 
    },
    university: 
    { 
      type: String, 
      trim: true, 
      default: '' 
    },
    profilePicture: 
    { 
      type: String, 
      default: ''
    },
    skills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Profile', profileSchema);
