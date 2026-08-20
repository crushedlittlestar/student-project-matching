const mongoose = require('mongoose');
const Profile = require('../models/profile.model');
const Skill = require('../models/skill.model');

async function getOrCreateProfile(userId) 
{
  let profile = await Profile.findOne({ user: userId });
  if (!profile) 
  {
    profile = await Profile.create({ user: userId });
  }
  return profile;
}

async function getMySkills(req, res, next) 
{
  try 
  {
    const profile = await getOrCreateProfile(req.user.userId);
    await profile.populate('skills');
    res.json({ skills: profile.skills });
  } 
  catch (err) 
  {
    next(err);
  }
}

async function addMySkill(req, res, next) 
{
  try 
  {
    const { skillId } = req.body;
    if (!skillId || !mongoose.Types.ObjectId.isValid(skillId)) 
    {
      return res.status(400).json({ message: 'Valid skillId is required' });
    }
    const skill = await Skill.findById(skillId);
    if (!skill) 
    {
      return res.status(404).json({ message: 'Skill not found' });
    }
    const profile = await getOrCreateProfile(req.user.userId);
    
    const alreadyHasSkill = profile.skills.some((id) => id.toString() === skillId);
    if (alreadyHasSkill) 
    {
      return res.status(409).json({ message: 'Skill already added' });
    }

    profile.skills.push(skillId);
    await profile.save();
    await profile.populate('skills');
    res.status(201).json({ skills: profile.skills });
  } 
  catch (err)
  {
    next(err);
  }
}

async function removeMySkill(req, res, next) 
{
  try 
  {
    const { skillId } = req.params;
    const profile = await getOrCreateProfile(req.user.userId);

    profile.skills = profile.skills.filter((id) => id.toString() !== skillId);

    await profile.save();
    res.json({ skills: profile.skills });
  } 
  catch (err)
  {
    next(err);
  }
}

async function updateProfilePicture(req, res, next) 
{
  try 
  {
    if (!req.file) 
    {
      return res.status(400).json({ message: 'No image file uploaded' });
    }
    const profile = await getOrCreateProfile(req.user.userId);
    profile.profilePicture ='/uploads/profile-pictures/' + req.file.filename;

    await profile.save();
    res.json({ profilePicture: profile.profilePicture });
  } 
  catch (err) 
  {
    next(err);
  }
}
async function searchStudents(req, res, next)
{
  try
  {
    const { skill, skills, page = 1, limit = 10 } = req.query;
    let skillNames = [];
    if (skill) 
    {
      skillNames = [skill];
    }
    if (skills) 
    {
      skillNames = skills.split(',').map((s) => s.trim());
    }
    onst filter = {};
    if (skillNames.length > 0)
    {
      const matchedSkills = await Skill.find({
        name: 
        {
          $in: skillNames.map((s) => new RegExp('^' + s + '$', 'i'))
        }
      });

      filter.skills = 
      {
        $in: matchedSkills.map((s) => s._id)
      };
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1),50);

    const [profiles, total] = await Promise.all([
      Profile.find(filter).populate('user', 'name').populate('skills').skip((pageNum - 1) * limitNum).limit(limitNum),
      Profile.countDocuments(filter)
    ]);

    res.json(
      {
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      students: profiles
    });
  } 
  catch (err) 
  {
    next(err);
  }
}

async function getStudentProfile(req, res, next) 
{
  try 
  {
    const profile = await Profile.findOne({ user: req.params.id }).populate('user', 'name').populate('skills');

    if (!profile) 
    {
      return res.status(404).json({message: 'Student profile not found'});
    }
    res.json({ profile });
  } 
  catch (err)
  {
    next(err);
  }
}

module.exports = {getMySkills,addMySkill,removeMySkill,updateProfilePicture,searchStudents,getStudentProfile};
