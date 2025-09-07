// frontend/src/components/Editor/Editor.js
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Transformer, Rect } from 'react-konva';
import useImage from 'use-image';
import Toolbar from './Toolbar';
import PropertiesPanel from './PropertiesPanel';
import AddMediaModal from './AddMediaModal';
import ImageElement from './ImageElement';
import { mediaAPI, uploadAPI } from '../../services/api';
import './Editor.css';

const Editor = ({ media, onSave, onBack }) => {
  const BASE_URL = 'http://localhost:5000';
  
  // State management
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [compositionType, setCompositionType] = useState('custom');
  const [showAddMediaModal, setShowAddMediaModal] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [activeTool, setActiveTool] = useState('select');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  
  // Refs
  const stageRef = useRef();
  const transformerRef = useRef();
  const videoRef = useRef();

  // Load background image
  const backgroundImageFile = mediaFiles.find(f => f.isBackground && f.type === 'image');
  const [backgroundImage] = useImage(
    backgroundImageFile ? `${BASE_URL}${backgroundImageFile.url}` : '', 
    'anonymous'
  );

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

  // Initialize state from media prop
  useEffect(() => {
    if (media) {
      console.log('Loading media:', media);
      
      // Sanitize all elements to ensure they have proper values
      const sanitizedElements = (media.elements || []).map(sanitizeElement);
      
      // Sanitize media files to ensure proper numeric values
      const sanitizedMediaFiles = (media.mediaFiles || []).map((file, index) => {
        // Ensure URL has proper format
        const url = file.url ? (file.url.startsWith('http') ? file.url : `${BASE_URL}${file.url}`) : '';
        
        return {
          ...file,
          url,
          x: Number(file.x) || Number(file.position?.x) || 50 + index * 30,
          y: Number(file.y) || Number(file.position?.y) || 50 + index * 30,
          width: Number(file.width) || Number(file.size?.width) || 200,
          height: Number(file.height) || Number(file.size?.height) || 150,
          rotation: Number(file.rotation) || 0
        };
      });
      
      console.log('Loaded elements:', sanitizedElements);
      console.log('Loaded mediaFiles:', sanitizedMediaFiles);
      
      setElements(sanitizedElements);
      setBackgroundColor(media.backgroundColor || '#ffffff');
      setCompositionType(media.compositionType || 'custom');
      setMediaFiles(sanitizedMediaFiles);
    }
  }, [media]);

  useEffect(() => {
    if (selectedId && transformerRef.current) {
      const node = stageRef.current.findOne(`#${selectedId}`);
      if (node) {
        transformerRef.current.nodes([node]);
        transformerRef.current.getLayer().batchDraw();
      }
    } else {
      transformerRef.current?.nodes([]);
    }
  }, [selectedId]);

  // Enhanced editing functions
  const addText = () => {
    const newText = sanitizeElement({
      id: `element-${Date.now()}`,
      type: 'text',
      text: 'Double click to edit',
      x: 100,
      y: 100
    });
    
    console.log('Adding text element:', newText);
    setElements([...elements, newText]);
    setSelectedId(newText.id);
  };

  const addShape = (shapeType) => {
    const newShape = sanitizeElement({
      id: `element-${Date.now()}`,
      type: shapeType,
      x: 150,
      y: 150
    });
    
    setElements([...elements, newShape]);
    setSelectedId(newShape.id);
  };

  const handleAddMedia = () => {
    setShowAddMediaModal(true);
  };

  const handleSaveMedia = async (file, fileType, isBackground) => {
    try {
      const formData = new FormData();
      
      // Use the correct field name based on file type
      formData.append(fileType, file);
      formData.append('mediaId', media._id);
      formData.append('isBackground', isBackground.toString());
      
      console.log('Uploading media:', file.name, 'Type:', fileType, 'Background:', isBackground);
      
      const response = await uploadAPI.upload(formData);
      console.log('Upload response:', response.data);
      
      const newMediaFiles = response.data.mediaFiles.map((file, index) => {
        // Ensure URL has proper format
        const url = file.url ? (file.url.startsWith('http') ? file.url : `${BASE_URL}${file.url}`) : '';
        
        return {
          ...file,
          url,
          x: Number(file.x) || Number(file.position?.x) || 50 + index * 30,
          y: Number(file.y) || Number(file.position?.y) || 50 + index * 30,
          width: Number(file.width) || Number(file.size?.width) || 200,
          height: Number(file.height) || Number(file.size?.height) || 150,
          rotation: Number(file.rotation) || 0
        };
      });
      
      setMediaFiles(newMediaFiles);
      setShowAddMediaModal(false);
      
      // Show success message
      alert(`${fileType === 'image' ? 'Image' : 'Video'} added successfully!`);
    } catch (error) {
      console.error('Error adding media:', error);
      alert('Failed to add media. Please try again.');
    }
  };

  const handleStageClick = (e) => {
    if (activeTool === 'select') {
      if (e.target === e.target.getStage()) {
        setSelectedId(null);
      } else {
        setSelectedId(e.target.id());
      }
    }
  };

  const handleStageWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale
    };

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    setZoomLevel(newScale);

    setStagePosition({
      x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
      y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale
    });
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setStagePosition({ x: 0, y: 0 });
  };

  const deleteSelected = () => {
    if (selectedId) {
      if (selectedId.startsWith('element-')) {
        setElements(elements.filter(el => el.id !== selectedId));
      } else if (selectedId.startsWith('image-')) {
        const index = parseInt(selectedId.split('-')[1]);
        setMediaFiles(mediaFiles.filter((_, i) => i !== index));
      }
      
      setSelectedId(null);
    }
  };

  const togglePiP = async () => {
    if (videoRef.current) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      } catch (error) {
        console.error('Picture-in-Picture failed:', error);
      }
    }
  };

  // Handle element drag events to update state
  const handleDragEnd = (e, id) => {
    const node = e.target;
    const { x, y } = node;
    
    if (id.startsWith('element-')) {
      setElements(elements.map(el => 
        el.id === id ? { ...el, x: x || 0, y: y || 0 } : el
      ));
    } else if (id.startsWith('image-')) {
      const index = parseInt(id.split('-')[1]);
      setMediaFiles(mediaFiles.map((file, i) => 
        i === index ? { ...file, x: x || 0, y: y || 0 } : file
      ));
    }
  };

  // Handle element transform events to update state
  const handleTransformEnd = (e, id) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const rotation = node.rotation();
    
    // Reset scale for next transformation
    node.scaleX(1);
    node.scaleY(1);
    
    if (id.startsWith('element-')) {
      setElements(elements.map(el => {
        if (el.id === id) {
          const updatedElement = { 
            ...el, 
            x: node.x() || 0,
            y: node.y() || 0,
            rotation: rotation || 0
          };
          
          if (el.type !== 'text') {
            updatedElement.width = Math.max(5, (el.width || 100) * scaleX);
            updatedElement.height = Math.max(5, (el.height || 100) * scaleY);
          } else {
            updatedElement.fontSize = Math.max(12, (el.fontSize || 24) * scaleX);
          }
          
          return sanitizeElement(updatedElement);
        }
        return el;
      }));
    } else if (id.startsWith('image-')) {
      const index = parseInt(id.split('-')[1]);
      setMediaFiles(mediaFiles.map((file, i) => {
        if (i === index) {
          return {
            ...file,
            x: node.x() || 0,
            y: node.y() || 0,
            width: Math.max(5, (file.width || 200) * scaleX),
            height: Math.max(5, (file.height || 150) * scaleY),
            rotation: rotation || 0
          };
        }
        return file;
      }));
    }
  };

  const handleSave = async () => {
    try {
      // Ensure all elements have proper numeric values to avoid NaN errors
      const sanitizedElements = elements.map(sanitizeElement);
      const sanitizedMediaFiles = mediaFiles.map(file => ({
        ...file,
        x: file.x || 0,
        y: file.y || 0,
        width: file.width || 200,
        height: file.height || 150,
        rotation: file.rotation || 0
      }));
      
      console.log('Saving elements:', sanitizedElements);
      console.log('Saving mediaFiles:', sanitizedMediaFiles);
      
      // Debug: Check text elements specifically
      const textElements = sanitizedElements.filter(el => el.type === 'text');
      console.log('Text elements to save:', textElements);
      
      const updatedMedia = await mediaAPI.update(media._id, {
        elements: sanitizedElements,
        backgroundColor,
        compositionType,
        mediaFiles: sanitizedMediaFiles,
        title: media.title || 'Untitled Composition'
      });
      
      console.log('Save response:', updatedMedia.data);
      
      // Debug: Check what elements were returned in the response
      if (updatedMedia.data.elements) {
        const returnedTextElements = updatedMedia.data.elements.filter(el => el && el.type === 'text');
        console.log('Text elements in response:', returnedTextElements);
      }
      
      onSave(updatedMedia.data);
      alert('Composition saved successfully!');
    } catch (error) {
      console.error('Error saving composition:', error);
      alert('Failed to save composition. Please try again.');
    }
  };

  const selectedElement = elements.find(el => el.id === selectedId);
  const hasVideo = mediaFiles.some(file => file.type === 'video');
  const hasImage = mediaFiles.some(file => file.type === 'image');

  if (!media) {
    return <div className="editor-loading">Loading editor...</div>;
  }

  return (
    <div className="editor-container">
      <Toolbar
        activeTool={activeTool}
        onToolChange={setActiveTool}
        onAddText={addText}
        onAddShape={addShape}
        onAddMedia={handleAddMedia}
        onDelete={deleteSelected}
        onSave={handleSave}
        onTogglePiP={togglePiP}
        onBack={onBack}
        zoomLevel={zoomLevel}
        onZoomChange={setZoomLevel}
        onResetZoom={resetZoom}
        backgroundColor={backgroundColor}
        onBackgroundColorChange={setBackgroundColor}
        compositionType={compositionType}
        onCompositionTypeChange={setCompositionType}
        hasSelection={!!selectedId}
        hasVideo={hasVideo}
        hasImage={hasImage}
      />
      
      <div className="editor-content">
        <div className="preview-area">
          {hasVideo && (
            <div className="video-container">
              <video
                ref={videoRef}
                src={`${BASE_URL}${mediaFiles.find(file => file.type === 'video')?.url}`}
                controls
                autoPlay
                loop
                muted
              />
            </div>
          )}
          
          <div className="canvas-container">
            <Stage
              width={1400}
              height={600}
              ref={stageRef}
              scaleX={zoomLevel}
              scaleY={zoomLevel}
              x={stagePosition.x}
              y={stagePosition.y}
              onClick={handleStageClick}
              onWheel={handleStageWheel}
              draggable={activeTool === 'pan'}
              style={{ backgroundColor }}
            >
              <Layer>
                {/* Background image */}
                {backgroundImage && (
                  <KonvaImage
                    image={backgroundImage}
                    width={1400}
                    height={600}
                    x={0}
                    y={0}
                  />
                )}
                
                {/* Foreground images */}
                {mediaFiles.filter(file => !file.isBackground && file.type === 'image').map((file, index) => {
                  const elementId = `image-${index}`;
                  
                  return (
                    <ImageElement
                      key={`image-${index}`}
                      file={file}
                      elementId={elementId}
                      index={index}
                      compositionType={compositionType}
                      onDragEnd={(e) => handleDragEnd(e, elementId)}
                      onTransformEnd={(e) => handleTransformEnd(e, elementId)}
                      onClick={() => setSelectedId(elementId)}
                    />
                  );
                })}
              </Layer>
              
              <Layer>
                {/* Render elements */}
                {elements.map(element => {
                  const safeElement = sanitizeElement(element);
                  
                  if (safeElement.type === 'text') {
                    return (
                      <KonvaText
                        key={safeElement.id}
                        id={safeElement.id}
                        text={safeElement.text}
                        x={safeElement.x}
                        y={safeElement.y}
                        fontSize={safeElement.fontSize}
                        fontFamily={safeElement.fontFamily}
                        fill={safeElement.fill}
                        stroke={safeElement.stroke}
                        strokeWidth={safeElement.strokeWidth}
                        shadowColor={safeElement.shadowColor}
                        shadowBlur={safeElement.shadowBlur}
                        shadowOffset={safeElement.shadowOffset}
                        rotation={safeElement.rotation || 0}
                        draggable={safeElement.draggable}
                        opacity={safeElement.opacity}
                        onDblClick={() => {
                          const newText = prompt('Edit text:', safeElement.text);
                          if (newText !== null) {
                            setElements(elements.map(el => 
                              el.id === safeElement.id ? { ...el, text: newText } : el
                            ));
                          }
                        }}
                        onDragEnd={(e) => handleDragEnd(e, safeElement.id)}
                        onTransformEnd={(e) => handleTransformEnd(e, safeElement.id)}
                      />
                    );
                  } else if (safeElement.type === 'rect') {
                    return (
                      <Rect
                        key={safeElement.id}
                        id={safeElement.id}
                        x={safeElement.x}
                        y={safeElement.y}
                        width={safeElement.width}
                        height={safeElement.height}
                        fill={safeElement.fill}
                        stroke={safeElement.stroke}
                        strokeWidth={safeElement.strokeWidth}
                        rotation={safeElement.rotation || 0}
                        draggable={safeElement.draggable}
                        opacity={safeElement.opacity}
                        cornerRadius={10}
                        onDragEnd={(e) => handleDragEnd(e, safeElement.id)}
                        onTransformEnd={(e) => handleTransformEnd(e, safeElement.id)}
                      />
                    );
                  }
                  return null;
                })}
              </Layer>
              
              <Layer>
                {selectedId && <Transformer ref={transformerRef} />}
              </Layer>
            </Stage>
          </div>
        </div>
        
        {selectedElement && (
          <PropertiesPanel
            element={selectedElement}
            onChange={(updates) => {
              setElements(elements.map(el => 
                el.id === selectedElement.id ? { ...el, ...updates } : el
              ));
            }}
            onDelete={deleteSelected}
          />
        )}
      </div>

      {showAddMediaModal && (
        <AddMediaModal
          onClose={() => setShowAddMediaModal(false)}
          onSave={handleSaveMedia}
        />
      )}
    </div>
  );
};

export default Editor;