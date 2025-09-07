// backend/controllers/uploadController.js
const Media = require('../models/Media');
const path = require('path');

exports.uploadFiles = async (req, res) => {
  try {
    console.log('Upload request received - Body:', req.body);
    console.log('Upload request received - Files:', req.files);
    
    const { mediaId } = req.body;
    
    if (!mediaId) {
      return res.status(400).json({ error: 'Media ID is required' });
    }
    
    const media = await Media.findById(mediaId);
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }
    
    // Initialize mediaFiles array if it doesn't exist
    if (!media.mediaFiles) {
      media.mediaFiles = [];
    }
    
    let uploadedFiles = [];
    
    // Process image files
    if (req.files && req.files['image']) {
      for (const imageFile of req.files['image']) {
        const newMediaFile = {
          type: 'image',
          filename: imageFile.filename,
          url: `/uploads/images/${imageFile.filename}`,
          isBackground: req.body.isBackground === 'true' || media.mediaFiles.length === 0 // First image is background if not specified
        };
        media.mediaFiles.push(newMediaFile);
        uploadedFiles.push(newMediaFile);
        console.log('Image file added:', imageFile.filename);
      }
    }
    
    // Process video files
    if (req.files && req.files['video']) {
      for (const videoFile of req.files['video']) {
        const newMediaFile = {
          type: 'video',
          filename: videoFile.filename,
          url: `/uploads/videos/${videoFile.filename}`,
          isBackground: false // Videos can't be background
        };
        media.mediaFiles.push(newMediaFile);
        uploadedFiles.push(newMediaFile);
        console.log('Video file added:', videoFile.filename);
      }
    }
    
    if (uploadedFiles.length === 0) {
      return res.status(400).json({ error: 'No files were uploaded' });
    }
    
    const updatedMedia = await media.save();
    console.log('Total media files now:', updatedMedia.mediaFiles.length);
    
    res.json(updatedMedia);
  } catch (error) {
    console.error('Upload error details:', error);
    res.status(500).json({ 
      error: 'Internal server error during file upload',
      message: error.message
    });
  }
};