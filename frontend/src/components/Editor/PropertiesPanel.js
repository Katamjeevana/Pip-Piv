import React from 'react';
import './PropertiesPanel.css'; // Make sure you have this CSS file

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
              value={element.text || ''}
              onChange={(e) => onChange({ text: e.target.value })}
              placeholder="Enter text here"
            />
          </div>
          
          <div className="property-group">
            <label>Font Size: {element.fontSize}px</label>
            <input
              type="range"
              min="12"
              max="72"
              value={element.fontSize || 24}
              onChange={(e) => onChange({ fontSize: parseInt(e.target.value) })}
            />
          </div>
          
          <div className="property-group">
            <label>Font Family</label>
            <select
              value={element.fontFamily || 'Arial'}
              onChange={(e) => onChange({ fontFamily: e.target.value })}
            >
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Georgia">Georgia</option>
              <option value="Courier New">Courier New</option>
            </select>
          </div>
          
          <div className="color-group">
            <div className="property-group">
              <label>Text Color</label>
              <input
                type="color"
                value={element.fill || '#ffffff'}
                onChange={(e) => onChange({ fill: e.target.value })}
              />
            </div>
            
            <div className="property-group">
              <label>Stroke Color</label>
              <input
                type="color"
                value={element.stroke || '#000000'}
                onChange={(e) => onChange({ stroke: e.target.value })}
              />
            </div>
          </div>
          
          <div className="property-group">
            <label>Stroke Width: {element.strokeWidth || 1}px</label>
            <input
              type="range"
              min="0"
              max="5"
              value={element.strokeWidth || 1}
              onChange={(e) => onChange({ strokeWidth: parseInt(e.target.value) })}
            />
          </div>
        </>
      )}
      
      {element.type === 'rect' && (
        <>
          <div className="property-group">
            <label>Width: {element.width || 100}px</label>
            <input
              type="range"
              min="10"
              max="500"
              value={element.width || 100}
              onChange={(e) => onChange({ width: parseInt(e.target.value) })}
            />
          </div>
          
          <div className="property-group">
            <label>Height: {element.height || 100}px</label>
            <input
              type="range"
              min="10"
              max="500"
              value={element.height || 100}
              onChange={(e) => onChange({ height: parseInt(e.target.value) })}
            />
          </div>
          
          <div className="color-group">
            <div className="property-group">
              <label>Fill Color</label>
              <input
                type="color"
                value={element.fill || '#ff5722'}
                onChange={(e) => onChange({ fill: e.target.value })}
              />
            </div>
            
            <div className="property-group">
              <label>Stroke Color</label>
              <input
                type="color"
                value={element.stroke || '#000000'}
                onChange={(e) => onChange({ stroke: e.target.value })}
              />
            </div>
          </div>
          
          <div className="property-group">
            <label>Stroke Width: {element.strokeWidth || 2}px</label>
            <input
              type="range"
              min="0"
              max="10"
              value={element.strokeWidth || 2}
              onChange={(e) => onChange({ strokeWidth: parseInt(e.target.value) })}
            />
          </div>
        </>
      )}
      
      <div className="property-group">
        <label>Opacity: {element.opacity || 1}</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={element.opacity || 1}
          onChange={(e) => onChange({ opacity: parseFloat(e.target.value) })}
        />
      </div>
      
      <div className="property-group">
        <label>Position X: {element.x || 0}px</label>
        <input
          type="number"
          value={element.x || 0}
          onChange={(e) => onChange({ x: parseInt(e.target.value) || 0 })}
          min="0"
          max="800"
        />
      </div>
      
      <div className="property-group">
        <label>Position Y: {element.y || 0}px</label>
        <input
          type="number"
          value={element.y || 0}
          onChange={(e) => onChange({ y: parseInt(e.target.value) || 0 })}
          min="0"
          max="600"
        />
      </div>
      
      <div className="property-actions">
        <button className="delete-btn" onClick={onDelete}>
          🗑️ Delete Element
        </button>
      </div>
    </div>
  );
};

export default PropertiesPanel;