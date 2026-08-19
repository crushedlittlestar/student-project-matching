const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads', 'profile-pictures');
if (!fs.existsSync(uploadDir)) 
{
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = req.user.userId + '-' + Date.now() + ext;
    cb(null, uniqueName);
  },
});

const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
const maxSizeInBytes = 2 * 1024 * 1024;

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return cb(new Error('Only .jpg, .jpeg, .png and .webp images are allowed'), false);
  }
  cb(null, true);
}

const uploadProfilePicture = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSizeInBytes },
});

module.exports = { uploadProfilePicture };
