import React from 'react';

const PropertiesPanel = ({ element, onChange, onDelete }) => {
  if (!element) return null;

  return (
    <div className="properties-panel">
      <h3>Properties</h3>
      
      {element.type === 'text' && (
        <>
          <div className="property-group">
            <label>Text Content</label>
            <input
              type="text"
              value={element.text}
              onChange={(e) => onChange({ text: e.target.value })}
            />
          </div>
          
          <div className="property-group">
            <label>Font Size</label>
            <input
              type="range"
              min="12"
              max="72"
              value={element.fontSize}
              onChange={(e) => onChange({ fontSize: parseInt(e.target.value) })}
            />
            <span>{element.fontSize}px</span>
          </div>
          
          <div className="property-group">
            <label>Text Color</label>
            <input
              type="color"
              value={element.fill}
              onChange={(e) => onChange({ fill: e.target.value })}
            />
          </div>
          
          <div className="property-group">
            <label>Stroke Color</label>
            <input
              type="color"
              value={element.stroke}
              onChange={(e) => onChange({ stroke: e.target.value })}
            />
          </div>
        </>
      )}
      
      {element.type === 'rect' && (
        <>
          <div className="property-group">
            <label>Fill Color</label>
            <input
              type="color"
              value={element.fill}
              onChange={(e) => onChange({ fill: e.target.value })}
            />
          </div>
          
          <div className="property-group">
            <label>Stroke Color</label>
            <input
              type="color"
              value={element.stroke}
              onChange={(e) => onChange({ stroke: e.target.value })}
            />
          </div>
        </>
      )}
      
      <div className="property-group">
        <label>Opacity</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={element.opacity}
          onChange={(e) => onChange({ opacity: parseFloat(e.target.value) })}
        />
        <span>{element.opacity}</span>
      </div>
      
      <div className="property-actions">
        <button className="delete-btn" onClick={onDelete}>
          🗑️ Delete
        </button>
      </div>
    </div>
  );
};

export default PropertiesPanel;