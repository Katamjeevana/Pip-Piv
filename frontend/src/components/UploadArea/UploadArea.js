import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { mediaAPI, uploadAPI } from '../../services/api';
import './UploadArea.css';

const UploadArea = ({ onMediaUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [files, setFiles] = useState({
    video: null,
    image: null
  });

  const onDrop = useCallback((acceptedFiles) => {
    // Clear previous files
    setFiles({ video: null, image: null });
    
    acceptedFiles.forEach(file => {
      if (file.type.startsWith('video/')) {
        setFiles(prev => ({ ...prev, video: file }));
      } else if (file.type.startsWith('image/')) {
        setFiles(prev => ({ ...prev, image: file }));
      }
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.webm', '.mov'],
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true
  });

  const handleUpload = async () => {
    if (!files.video && !files.image) return;

    setUploading(true);
    setProgress(0);
    
    try {
      // Determine composition type based on files
      let compositionType = 'custom';
      if (files.video && files.image) {
        compositionType = 'pip';
      }
      
      console.log('Creating media with composition type:', compositionType);
      
      // Create media record first
      const mediaResponse = await mediaAPI.create({
        title: 'My Composition',
        compositionType: compositionType
      });
      
      console.log('Media created, ID:', mediaResponse.data._id);
      
      const mediaId = mediaResponse.data._id;
      const formData = new FormData();
      
      // Add files to form data
      if (files.video) {
        formData.append('video', files.video);
        console.log('Adding video file:', files.video.name);
      }
      if (files.image) {
        formData.append('image', files.image);
        console.log('Adding image file:', files.image.name);
      }
      formData.append('mediaId', mediaId);
      
      console.log('Uploading files...');
      
      // Upload files
      const uploadResponse = await uploadAPI.upload(formData, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
        setProgress(percent);
      });
      
      console.log('Upload successful, media files:', uploadResponse.data.mediaFiles);
      onMediaUpload(uploadResponse.data);
    } catch (error) {
      console.error('Upload error details:', error);
      const errorMessage = error.response?.data?.message || error.message;
      alert(`Upload failed: ${errorMessage}`);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const removeFile = (type) => {
    setFiles(prev => ({ ...prev, [type]: null }));
  };

  return (
    <div className="upload-area">
      <div className="upload-header">
        <h1>Create Amazing Media Compositions</h1>
        <p>Upload videos and images to create Picture-in-Picture or Picture-in-Video compositions</p>
      </div>

      <div className="upload-content">
        <div 
          {...getRootProps()} 
          className={`dropzone ${isDragActive ? 'active' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="dropzone-content">
            <div className="dropzone-icon">📁</div>
            <h3>Drag & Drop Files Here</h3>
            <p>Or click to select video and image files</p>
            <div className="file-types">
              <span>Supported: MP4, WebM, MOV, JPEG, PNG, GIF, WebP</span>
            </div>
          </div>
        </div>

        <div className="selected-files">
          <h3>Selected Files</h3>
          <div className="file-list">
            {files.video && (
              <div className="file-item">
                <span className="file-type">🎥</span>
                <span className="file-name">{files.video.name}</span>
                <span className="file-size">({Math.round(files.video.size / 1024 / 1024)}MB)</span>
                <button onClick={() => removeFile('video')} className="remove-btn">×</button>
              </div>
            )}
            
            {files.image && (
              <div className="file-item">
                <span className="file-type">🖼️</span>
                <span className="file-name">{files.image.name}</span>
                <span className="file-size">({Math.round(files.image.size / 1024)}KB)</span>
                <button onClick={() => removeFile('image')} className="remove-btn">×</button>
              </div>
            )}
            
            {!files.video && !files.image && (
              <p className="no-files">No files selected</p>
            )}
          </div>
        </div>

        {uploading && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="progress-text">{progress}%</span>
          </div>
        )}

        <button
          className="upload-btn"
          onClick={handleUpload}
          disabled={uploading || (!files.video && !files.image)}
        >
          {uploading ? 'Uploading...' : 'Start Creating'}
        </button>
      </div>
    </div>
  );
};

export default UploadArea;