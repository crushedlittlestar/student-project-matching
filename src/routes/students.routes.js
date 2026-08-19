const router = require('express').Router();
const authenticate = require('../middlewares/auth.middleware');
const { uploadProfilePicture } = require('../middlewares/upload.middleware');
const { searchStudents, getStudentProfile, updateProfilePicture } = require('../controllers/profiles.controller');

router.get('/students', authenticate, searchStudents);
router.get('/students/:id', authenticate, getStudentProfile);
router.patch('/users/me/profile-picture', authenticate, uploadProfilePicture.single('picture'), updateProfilePicture);

module.exports = router;
