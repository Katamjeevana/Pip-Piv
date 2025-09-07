const express = require('express');
const router = express.Router();
const { upload, handleMulterError } = require('../middleware/upload');
const uploadController = require('../controllers/uploadController');

// POST /api/upload - Upload files
router.post('/', 
  (req, res, next) => {
    console.log('Upload route hit');
    next();
  },
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'image', maxCount: 1 }
  ]),
  (error, req, res, next) => {
    if (error) {
      console.log('Multer error:', error);
      return handleMulterError(error, req, res, next);
    }
    next();
  },
  uploadController.uploadFiles
);

module.exports = router;