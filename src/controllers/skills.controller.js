const Skill = require('../models/skill.model');

async function listSkills(req, res, next) 
{
  try 
  {
    const skills = await Skill.find({ status: 'active' }).sort('name');
    res.json({ count: skills.length, skills });
  } 
  catch (err) { next(err); }
}

async function createSkill(req, res, next) 
{
  try
  {
    const { name, category } = req.body;
    if (!name || !name.trim()) 
    {
      return res.status(400).json({ message: 'Skill name is required' });
    }
    const existing = await Skill.findOne({ name: new RegExp(`^${name.trim()}$`, 'i') });
    if (existing) return res.status(409).json({ message: 'Skill already exists' });
    const skill = await Skill.create({ name: name.trim(), category });
    res.status(201).json({ skill });
  } 
  catch (err) { next(err); }
}

async function updateSkill(req, res, next) 
{
  try 
  {
    const { name, category, status } = req.body;
    const skill = await Skill.findByIdAndUpdate( req.params.id,
      { ...(name && { name: name.trim() }), category, status },
      { new: true, runValidators: true }
    );
    if (!skill) return res.status(404).json({ message: 'Skill not found' });
    res.json({ skill });
  } 
  catch (err) { next(err); }
}

async function deleteSkill(req, res, next) 
{
  try 
  {
    const skill = await Skill.findByIdAndDelete(req.params.id);
    if (!skill) return res.status(404).json({ message: 'Skill not found' });
    res.json({ message: 'Skill deleted' });
  } 
  catch (err) { next(err); }
}

module.exports = { listSkills, createSkill, updateSkill, deleteSkill };
