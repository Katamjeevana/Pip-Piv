// frontend/src/components/Gallery/Gallery.js
import React, { useState, useEffect } from 'react';
import { mediaAPI } from '../../services/api';
import './Gallery.css';

const Gallery = ({ onEdit }) => {
  const [compositions, setCompositions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompositions();
  }, []);

  const fetchCompositions = async () => {
    try {
      const response = await mediaAPI.getAll();
      console.log('Fetched compositions:', response.data);
      setCompositions(response.data);
    } catch (error) {
      console.error('Error fetching compositions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this composition?')) return;
    
    try {
      await mediaAPI.delete(id);
      setCompositions(compositions.filter(comp => comp._id !== id));
    } catch (error) {
      console.error('Error deleting composition:', error);
      alert('Failed to delete composition. Please try again.');
    }
  };

  const renderMediaPreview = (composition) => {
    if (!composition.mediaFiles || composition.mediaFiles.length === 0) {
      return <div className="no-media">No media</div>;
    }

    // Get the first image for preview
    const firstImage = composition.mediaFiles.find(file => file.type === 'image');
    
    if (firstImage) {
      const imageUrl = `http://localhost:5000${firstImage.url}`;
      
      return (
        <div className="single-media-preview">
          <img 
            src={imageUrl} 
            alt={composition.title}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<div class="no-media">Image not found</div>';
            }}
          />
          {/* Show text elements as badges */}
          {composition.elements && composition.elements.filter(el => el.type === 'text').length > 0 && (
            <span className="text-badge">Text: {composition.elements.filter(el => el.type === 'text').length}</span>
          )}
          {composition.mediaFiles.length > 1 && (
            <span className="media-badge">+{composition.mediaFiles.length - 1}</span>
          )}
        </div>
      );
    }

    return <div className="no-media">No image available</div>;
  };

  if (loading) {
    return (
      <div className="gallery-loading">
        <div className="loading-spinner"></div>
        <p>Loading your compositions...</p>
      </div>
    );
  }

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h1>Your Compositions</h1>
        <p>Edit or view your saved media compositions</p>
      </div>

      {compositions.length === 0 ? (
        <div className="empty-gallery">
          <div className="empty-icon">🎨</div>
          <h3>No compositions yet</h3>
          <p>Create your first composition to get started</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {compositions.map((composition) => (
            <div key={composition._id} className="gallery-item">
              <div className="composition-preview">
                {renderMediaPreview(composition)}
                
                <div className="composition-overlay">
                  <button 
                    className="edit-btn"
                    onClick={() => onEdit(composition)}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(composition._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="composition-info">
                <h4>{composition.title}</h4>
                <p>{composition.compositionType} • {new Date(composition.createdAt).toLocaleDateString()}</p>
                {composition.mediaFiles && (
                  <small>{composition.mediaFiles.length} media file(s)</small>
                )}
                {composition.elements && composition.elements.length > 0 && (
                  <small>• {composition.elements.length} element(s)</small>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;