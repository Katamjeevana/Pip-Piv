import React from 'react';
import { motion } from 'framer-motion';
import './MediaDisplay.css';

const MediaDisplay = ({ media, onEdit }) => {
  if (!media) return null;

  return (
    <motion.div 
      className="media-display"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="media-header">
        <h2>{media.title || 'Untitled Composition'}</h2>
        <button className="edit-btn" onClick={onEdit}>
          Edit Composition
        </button>
      </div>
      
      <div className="media-content">
        {media.originalMedia.video && (
          <div className="video-player">
            <video controls autoPlay loop muted>
              <source src={media.originalMedia.video.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}
        
        {media.originalMedia.image && (
          <div className="image-preview">
            <img 
              src={media.originalMedia.image.url} 
              alt={media.title || 'Composition'} 
            />
          </div>
        )}
        
        {media.elements && media.elements.length > 0 && (
          <div className="elements-info">
            <h4>Added Elements:</h4>
            <ul>
              {media.elements.map((element, index) => (
                <li key={index}>
                  {element.type}: {element.text || 'Element'}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MediaDisplay;