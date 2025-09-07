// frontend/src/components/Editor/AddMediaModal.js
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './AddMediaModal.css';

const AddMediaModal = ({ onClose, onSave }) => {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState('image');
  const [isBackground, setIsBackground] = useState(false);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles[0]) {
      setFile(acceptedFiles[0]);
      // Auto-detect file type
      if (acceptedFiles[0].type.startsWith('image/')) {
        setFileType('image');
      } else if (acceptedFiles[0].type.startsWith('video/')) {
        setFileType('video');
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.webm', '.mov'],
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false
  });

  const handleSave = () => {
    if (file) {
      setUploading(true);
      onSave(file, fileType, isBackground);
      // Reset after a short delay to show feedback
      setTimeout(() => {
        setUploading(false);
      }, 1000);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add Media to Composition</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label>Media Type:</label>
            <select 
              value={fileType} 
              onChange={(e) => setFileType(e.target.value)}
              disabled={!!file} // Disable if file is already selected (auto-detected)
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={isBackground}
                onChange={(e) => setIsBackground(e.target.checked)}
                disabled={fileType === 'video'} // Videos can't be background
              />
              Use as background
            </label>
            {fileType === 'video' && (
              <small className="help-text">(Videos cannot be used as background)</small>
            )}
          </div>
          
          <div 
            {...getRootProps()} 
            className={`dropzone ${isDragActive ? 'active' : ''}`}
          >
            <input {...getInputProps()} />
            <div className="dropzone-content">
              {file ? (
                <div className="file-preview">
                  {file.type.startsWith('image/') ? (
                    <img src={URL.createObjectURL(file)} alt="Preview" className="preview" />
                  ) : (
                    <video src={URL.createObjectURL(file)} controls className="preview" />
                  )}
                  <p className="file-name">{file.name}</p>
                  <button type="button" className="remove-file-btn" onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}>
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <div className="dropzone-icon">📁</div>
                  <p>Drag & drop file here, or click to select</p>
                  <small>Supported: Images (JPEG, PNG, GIF, WebP) and Videos (MP4, WebM, MOV)</small>
                </>
              )}
            </div>
          </div>
          
          <div className="modal-actions">
            <button onClick={onClose} className="cancel-btn" disabled={uploading}>
              Cancel
            </button>
            <button 
              onClick={handleSave} 
              disabled={!file || uploading} 
              className="save-btn"
            >
              {uploading ? 'Uploading...' : 'Add Media'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMediaModal;