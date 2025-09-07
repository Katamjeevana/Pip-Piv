const Media = require('../models/Media'); // ADD THIS IMPORT
const fs = require('fs');
const path = require('path');

// Get all media compositions
exports.getAllMedia = async (req, res) => {
  try {
    const media = await Media.find().sort({ createdAt: -1 });
    res.json(media);
  } catch (error) {
    console.error('Get all media error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get single media item
exports.getMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }
    res.json(media);
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create new media composition
exports.createMedia = async (req, res) => {
  try {
    console.log('Create media request body:', req.body);
    
    const { title, description, compositionType } = req.body;
    
    const media = new Media({
      title: title || 'My Composition',
      description: description || '',
      compositionType: compositionType || 'custom',
      mediaFiles: [], // Initialize empty array
      elements: [],
      backgroundColor: '#ffffff'
    });
    
    const savedMedia = await media.save();
    console.log('Media created successfully:', savedMedia._id);
    
    res.status(201).json(savedMedia);
  } catch (error) {
    console.error('Create media error details:', error);
    res.status(500).json({ 
      error: 'Failed to create media',
      message: error.message
    });
  }
};

// Update media composition - KEEP ONLY THIS ONE
// backend/controllers/mediaController.js
// In the updateMedia function, ensure proper data structure:
// backend/controllers/mediaController.js
// Update the updateMedia function:

exports.updateMedia = async (req, res) => {
  try {
    console.log('Update media request:', req.params.id, req.body);
    
    const { elements, backgroundColor, compositionType, mediaFiles } = req.body;
    
    // Helper function to sanitize element values
    const sanitizeElement = (element) => {
      const defaults = {
        x: 0,
        y: 0,
        opacity: 1,
        draggable: true
      };
      
      const textDefaults = {
        fontSize: 24,
        fontFamily: 'Arial',
        fill: '#ffffff',
        stroke: '#000000',
        strokeWidth: 1,
        shadowBlur: 5,
        shadowOffset: { x: 2, y: 2 }
      };
      
      const shapeDefaults = {
        width: 100,
        height: 100,
        fill: '#ff5722',
        stroke: '#000000',
        strokeWidth: 2
      };
      
      let sanitized = { ...defaults, ...element };
      
      if (sanitized.type === 'text') {
        sanitized = { ...textDefaults, ...sanitized };
      } else if (sanitized.type === 'rect') {
        sanitized = { ...shapeDefaults, ...sanitized };
      }
      
      // Ensure all numeric values are valid numbers
      const numericProps = ['x', 'y', 'width', 'height', 'fontSize', 'strokeWidth', 'shadowBlur', 'opacity', 'rotation'];
      numericProps.forEach(prop => {
        if (sanitized[prop] !== undefined) {
          sanitized[prop] = Number(sanitized[prop]) || 0;
        }
      });
      
      // Ensure shadowOffset has valid values
      if (sanitized.shadowOffset) {
        sanitized.shadowOffset = {
          x: Number(sanitized.shadowOffset.x) || 2,
          y: Number(sanitized.shadowOffset.y) || 2
        };
      }
      
      return sanitized;
    };
    
    // Ensure all elements have proper numeric values
    const sanitizedElements = (elements || []).map(sanitizeElement);
    
    // Sanitize media files - ensure all numeric values are proper numbers
    const sanitizedMediaFiles = (mediaFiles || []).map((file, index) => {
      return {
        ...file,
        // Ensure numeric values are proper numbers
        x: Number(file.x) || 50 + index * 30,
        y: Number(file.y) || 50 + index * 30,
        width: Number(file.width) || 200,
        height: Number(file.height) || 150,
        rotation: Number(file.rotation) || 0,
        // Remove position and size objects if they exist
        position: undefined,
        size: undefined
      };
    });
    
    const updates = {
      elements: sanitizedElements,
      backgroundColor: backgroundColor || '#ffffff',
      compositionType: compositionType || 'custom',
      mediaFiles: sanitizedMediaFiles
    };
    
    console.log('Updating with sanitized elements:', sanitizedElements);
    console.log('Updating with sanitized media files:', sanitizedMediaFiles);
    // Add these console logs in the updateMedia function:
console.log('Raw elements from request:', elements);
console.log('Sanitized elements:', sanitizedElements);
    
    const media = await Media.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }
    
    console.log('Media updated successfully:', media);
    res.json(media);
  } catch (error) {
    console.error('Update media error:', error);
    res.status(500).json({ error: error.message });
  }
};
// Delete media composition
exports.deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }
    
    // Delete associated files
    if (media.mediaFiles && media.mediaFiles.length > 0) {
      for (const file of media.mediaFiles) {
        const filePath = path.join(
          __dirname, 
          '../uploads', 
          file.type === 'image' ? 'images' : 'videos', 
          file.filename
        );
        
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('Deleted file:', filePath);
        }
      }
    }
    
    await Media.findByIdAndDelete(req.params.id);
    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add method to add media to existing composition
exports.addMediaToComposition = async (req, res) => {
  try {
    const { mediaId } = req.params;
    const { fileType, isBackground } = req.body;
    
    const media = await Media.findById(mediaId);
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }
    
    if (req.files && req.files['media'] && req.files['media'][0]) {
      const mediaFile = req.files['media'][0];
      const detectedFileType = mediaFile.mimetype.startsWith('image/') ? 'image' : 'video';
      
      const newMediaFile = {
        type: fileType || detectedFileType,
        filename: mediaFile.filename,
        url: `/uploads/${detectedFileType}s/${mediaFile.filename}`,
        isBackground: isBackground === 'true',
        x: 50, // Add default position
        y: 50,
        width: 200, // Add default size
        height: 150,
        rotation: 0
      };
      
      // Initialize mediaFiles array if it doesn't exist
      if (!media.mediaFiles) {
        media.mediaFiles = [];
      }
      
      media.mediaFiles.push(newMediaFile);
      await media.save();
      
      res.json(media);
    } else {
      res.status(400).json({ error: 'No file uploaded' });
    }
  } catch (error) {
    console.error('Add media error:', error);
    res.status(500).json({ error: error.message });
  }
};