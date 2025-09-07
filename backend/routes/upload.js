const express = require('express');
const router = express.Router();
const { upload, handleMulterError } = require('../middleware/upload');
const uploadController = require('../controllers/uploadController');

// POST /api/upload - Upload files
router.post('/', 
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 }
  ]),
  handleMulterError,
  uploadController.uploadFiles
);

module.exports = router;