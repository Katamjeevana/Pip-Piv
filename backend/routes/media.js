const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { upload, handleMulterError } = require('../middleware/upload');

// GET /api/media - Get all media compositions
router.get('/', mediaController.getAllMedia);

// GET /api/media/:id - Get single media composition
router.get('/:id', mediaController.getMedia);

// POST /api/media - Create new media composition
router.post('/', mediaController.createMedia);

// PUT /api/media/:id - Update media composition
router.put('/:id', mediaController.updateMedia);

// POST /api/media/:id/add-media - Add media to existing composition
router.post('/:id/add-media', 
  upload.single('media'),
  handleMulterError,
  mediaController.addMediaToComposition
);

// DELETE /api/media/:id - Delete media composition
router.delete('/:id', mediaController.deleteMedia);

module.exports = router;