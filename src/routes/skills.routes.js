const router = require('express').Router();
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const { listSkills, createSkill, updateSkill, deleteSkill } = require('../controllers/skills.controller');
const { getMySkills, addMySkill, removeMySkill } = require('../controllers/profiles.controller');

router.get('/skills', authenticate, listSkills);
router.post('/skills', authenticate, authorize('Admin'), createSkill);
router.patch('/skills/:id', authenticate, authorize('Admin'), updateSkill);
router.delete('/skills/:id', authenticate, authorize('Admin'), deleteSkill);

router.get('/users/me/skills', authenticate, getMySkills);
router.post('/users/me/skills', authenticate, addMySkill);
router.delete('/users/me/skills/:skillId', authenticate, removeMySkill);

module.exports = router;
