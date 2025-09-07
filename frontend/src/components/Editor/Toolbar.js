import React from 'react';
import './Toolbar.css';

const Toolbar = ({
  activeTool,
  onToolChange,
  onAddText,
  onAddShape,
  onAddMedia,
  onDelete,
  onSave,
  onTogglePiP,
  onBack,
  zoomLevel,
  onZoomChange,
  onResetZoom,
  backgroundColor,
  onBackgroundColorChange,
  compositionType,
  onCompositionTypeChange,
  hasSelection,
  hasVideo,
  hasImage,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}) => {
  return (
    <div className="editor-toolbar">
      <div className="toolbar-left">
        <button className="toolbar-btn" onClick={onBack}>
          <span className="toolbar-icon">←</span>
          Back
        </button>
        
        <div className="tool-group">
          <button 
            className={`toolbar-btn ${activeTool === 'select' ? 'active' : ''}`}
            onClick={() => onToolChange('select')}
            title="Selection Tool"
          >
            <span className="toolbar-icon">✏️</span>
            Select
          </button>
          <button 
            className={`toolbar-btn ${activeTool === 'pan' ? 'active' : ''}`}
            onClick={() => onToolChange('pan')}
            title="Pan Tool"
          >
            <span className="toolbar-icon">🖐️</span>
            Pan
          </button>
        </div>

        {/* Undo/Redo buttons */}
        <div className="tool-group">
          <button 
            className="toolbar-btn" 
            onClick={onUndo} 
            disabled={!canUndo}
            title="Undo"
          >
            <span className="toolbar-icon">↶</span>
            Undo
          </button>
          <button 
            className="toolbar-btn" 
            onClick={onRedo} 
            disabled={!canRedo}
            title="Redo"
          >
            <span className="toolbar-icon">↷</span>
            Redo
          </button>
        </div>
      </div>

      <div className="toolbar-center">
        <div className="tool-group">
          <button className="toolbar-btn" onClick={onAddText} title="Add Text">
            <span className="toolbar-icon">🅃</span>
            Text
          </button>
          <button className="toolbar-btn" onClick={() => onAddShape('rect')} title="Add Shape">
            <span className="toolbar-icon">◼️</span>
            Shape
          </button>
          <button className="toolbar-btn" onClick={onAddMedia} title="Add Media">
            <span className="toolbar-icon">➕</span>
            Add Media
          </button>
          <button 
            className="toolbar-btn" 
            onClick={onDelete} 
            disabled={!hasSelection}
            title="Delete Selected"
          >
            <span className="toolbar-icon">🗑️</span>
            Delete
          </button>
        </div>

        <div className="tool-group">
          <select 
            value={compositionType} 
            onChange={(e) => onCompositionTypeChange(e.target.value)}
            className="composition-select"
            title="Composition Type"
          >
            <option value="custom">Custom Layout</option>
            <option value="pip">PIP (Picture-in-Picture)</option>
            <option value="piv">PIV (Picture-in-Video)</option>
          </select>
        </div>
      </div>

      <div className="toolbar-right">
        <div className="tool-group">
          <span>Zoom: {Math.round(zoomLevel * 100)}%</span>
          <input
            type="range"
            min="10"
            max="500"
            value={zoomLevel * 100}
            onChange={(e) => onZoomChange(parseInt(e.target.value) / 100)}
            className="zoom-slider"
            title="Zoom Level"
          />
          <button className="toolbar-btn" onClick={onResetZoom} title="Reset Zoom">
            <span className="toolbar-icon">🔍</span>
            Reset
          </button>
        </div>

        <div className="tool-group">
          <label>BG:</label>
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => onBackgroundColorChange(e.target.value)}
            className="color-picker-input"
            title="Background Color"
          />
        </div>

        {hasVideo && (
          <button className="toolbar-btn" onClick={onTogglePiP} title="Toggle Picture-in-Picture">
            <span className="toolbar-icon">📺</span>
            PiP
          </button>
        )}

        <button className="toolbar-btn primary" onClick={onSave} title="Save Composition">
          <span className="toolbar-icon">💾</span>
          Save
        </button>
      </div>
    </div>
  );
};

export default Toolbar;