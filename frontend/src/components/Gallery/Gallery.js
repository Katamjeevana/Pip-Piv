// frontend/src/components/Gallery/Gallery.js
import React, { useState, useEffect } from 'react';
import { mediaAPI } from '../../services/api';
import './Gallery.css';

const Gallery = ({ onEdit, loading: externalLoading }) => {
  const [compositions, setCompositions] = useState([]);
  const [internalLoading, setInternalLoading] = useState(true);

  useEffect(() => {
    fetchCompositions();
  }, []);

  const fetchCompositions = async () => {
    try {
      setInternalLoading(true);
      const response = await mediaAPI.getAll();
      console.log('Fetched compositions:', response.data);
      
      // Debug: Check if elements exist in each composition
      response.data.forEach((comp, index) => {
        console.log(`Composition ${index}:`, {
          title: comp.title,
          elementsCount: comp.elements ? comp.elements.length : 0,
          elements: comp.elements,
          hasTextElements: comp.elements ? comp.elements.filter(el => el && el.type === 'text').length > 0 : false,
          textElementsCount: comp.elements ? comp.elements.filter(el => el && el.type === 'text').length : 0,
          mediaFiles: comp.mediaFiles ? comp.mediaFiles.map(f => ({...f, url: f.url})) : []
        });
      });
      
      setCompositions(response.data);
    } catch (error) {
      console.error('Error fetching compositions:', error);
    } finally {
      setInternalLoading(false);
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

  // Function to properly format image URL
  const getImageUrl = (url) => {
    if (!url) return '';
    
    // If URL already starts with http, return as is
    if (url.startsWith('http')) {
      return url;
    }
    
    // If URL starts with /uploads, add the base URL
    if (url.startsWith('/uploads')) {
      return `http://localhost:5000${url}`;
    }
    
    // For any other case, try to construct the URL
    return `http://localhost:5000/uploads/${url}`;
  };

  const renderMediaPreview = (composition) => {
    // Add null check for mediaFiles and filter out any null values or files without type
    if (!composition.mediaFiles || composition.mediaFiles.length === 0) {
      return <div className="no-media">No media</div>;
    }

    // Filter out null values and files that don't have a type property
    const validMediaFiles = composition.mediaFiles.filter(file => 
      file !== null && file !== undefined && file.type !== null && file.type !== undefined
    );
    
    if (validMediaFiles.length === 0) {
      return <div className="no-media">No media</div>;
    }

    // Get the first image for preview - add additional safety check
    const firstImage = validMediaFiles.find(file => file.type && file.type === 'image');
    
    if (firstImage && firstImage.url) {
      const imageUrl = getImageUrl(firstImage.url);
      console.log('Image URL:', imageUrl); // Debug log
      
      return (
        <div className="single-media-preview">
          <img 
            src={imageUrl} 
            alt={composition.title || 'Composition preview'}
            onError={(e) => {
              console.error('Image failed to load:', imageUrl); // Debug log
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<div class="no-media">Image not found</div>';
            }}
            onLoad={() => console.log('Image loaded successfully:', imageUrl)} // Debug log
          />
          {/* Show text elements as badges - enhanced debugging */}
          {composition.elements && composition.elements.filter(el => el && el.type === 'text').length > 0 && (
            <span className="text-badge" title={`Text elements: ${composition.elements.filter(el => el && el.type === 'text').length}`}>
              📝 {composition.elements.filter(el => el && el.type === 'text').length}
            </span>
          )}
          {validMediaFiles.length > 1 && (
            <span className="media-badge">+{validMediaFiles.length - 1}</span>
          )}
        </div>
      );
    }

    return <div className="no-media">No image available</div>;
  };

  const loading = externalLoading || internalLoading;

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
                <h4>{composition.title || 'Untitled Composition'}</h4>
                <p>{composition.compositionType || 'custom'} • {composition.createdAt ? new Date(composition.createdAt).toLocaleDateString() : 'Unknown date'}</p>
                {composition.mediaFiles && (
                  <small>{composition.mediaFiles.filter(file => file !== null && file !== undefined && file.type).length} media file(s)</small>
                )}
                {composition.elements && composition.elements.length > 0 && (
                  <small>
                    • {composition.elements.filter(el => el !== null).length} element(s)
                    {composition.elements.filter(el => el && el.type === 'text').length > 0 && (
                      <span style={{color: 'blue', marginLeft: '5px'}}>
                        ({composition.elements.filter(el => el && el.type === 'text').length} text)
                      </span>
                    )}
                  </small>
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