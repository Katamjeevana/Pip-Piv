require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files - serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1d', // Cache for 1 day
  etag: true,
  lastModified: true
}));

// Debug route to check uploaded files
app.get('/api/debug/files', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const imagesPath = path.join(__dirname, 'uploads/images');
    const videosPath = path.join(__dirname, 'uploads/videos');
    
    let images = [];
    let videos = [];
    
    // Check if directories exist
    const imagesDirExists = fs.existsSync(imagesPath);
    const videosDirExists = fs.existsSync(videosPath);
    
    if (imagesDirExists) {
      images = fs.readdirSync(imagesPath);
    }
    
    if (videosDirExists) {
      videos = fs.readdirSync(videosPath);
    }
    
    res.json({
      images_directory: imagesPath,
      images_directory_exists: imagesDirExists,
      images_files: images,
      videos_directory: videosPath,
      videos_directory_exists: videosDirExists,
      videos_files: videos
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/media', require('./routes/media'));
app.use('/api/upload', require('./routes/upload'));


// Debug route to check upload directory
app.get('/api/debug/uploads', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  const imageDir = path.join(__dirname, 'uploads/images');
  const videoDir = path.join(__dirname, 'uploads/videos');
  
  let images = [];
  let videos = [];
  
  try {
    images = fs.readdirSync(imageDir);
  } catch (e) {
    console.error('Error reading images directory:', e.message);
  }
  
  try {
    videos = fs.readdirSync(videoDir);
  } catch (e) {
    console.error('Error reading videos directory:', e.message);
  }
  
  res.json({
    images_dir: imageDir,
    videos_dir: videoDir,
    images: images,
    videos: videos
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mediaeditor';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler - FIXED: Use proper route pattern instead of '*'
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});