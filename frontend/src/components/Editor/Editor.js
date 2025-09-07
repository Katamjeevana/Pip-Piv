// frontend/src/components/Editor/Editor.js
import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Image, Text as KonvaText, Transformer, Rect } from 'react-konva';
import useImage from 'use-image';
import Toolbar from './Toolbar';
import PropertiesPanel from './PropertiesPanel';
import AddMediaModal from './AddMediaModal';
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

  // Load images
  const backgroundImageFile = mediaFiles.find(f => f.isBackground && f.type === 'image');
  const foregroundImageFile = mediaFiles.find(f => !f.isBackground && f.type === 'image');
  
  const [backgroundImage] = useImage(
    backgroundImageFile ? `${BASE_URL}${backgroundImageFile.url}` : '', 
    'anonymous'
  );
  const [foregroundImage] = useImage(
    foregroundImageFile ? `${BASE_URL}${foregroundImageFile.url}` : '', 
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
    const numericProps = ['x', 'y', 'width', 'height', 'fontSize', 'strokeWidth', 'shadowBlur', 'opacity'];
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
      setElements(sanitizedElements);
      setBackgroundColor(media.backgroundColor || '#ffffff');
      setCompositionType(media.compositionType || 'custom');
      setMediaFiles(media.mediaFiles || []);
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
      id: `text-${Date.now()}`,
      type: 'text',
      text: 'Double click to edit',
      x: 100,
      y: 100
    });
    
    setElements([...elements, newText]);
    setSelectedId(newText.id);
  };

  const addShape = (shapeType) => {
    const newShape = sanitizeElement({
      id: `shape-${Date.now()}`,
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
      
      setMediaFiles(response.data.mediaFiles);
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
      setElements(elements.filter(el => el.id !== selectedId));
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
    
    setElements(elements.map(el => 
      el.id === id ? { ...el, x: x || 0, y: y || 0 } : el
    ));
  };

  // Handle element drag move to update state in real-time
  const handleDragMove = (e, id) => {
    const node = e.target;
    const { x, y } = node;
    
    setElements(elements.map(el => 
      el.id === id ? { ...el, x: x || 0, y: y || 0 } : el
    ));
  };

  // Handle element transform events to update state
  const handleTransformEnd = (e, id) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    // Reset scale for next transformation
    node.scaleX(1);
    node.scaleY(1);
    
    setElements(elements.map(el => {
      if (el.id === id) {
        const updatedElement = { 
          ...el, 
          x: node.x() || 0,
          y: node.y() || 0
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
  };

  // Handle image drag events to update mediaFiles state
  const handleImageDragEnd = (fileIndex, e) => {
    const node = e.target;
    const { x, y } = node;
    
    setMediaFiles(mediaFiles.map((file, index) => 
      index === fileIndex ? { ...file, x: x || 0, y: y || 0 } : file
    ));
  };

  // Handle image drag move to update state in real-time
  const handleImageDragMove = (fileIndex, e) => {
    const node = e.target;
    const { x, y } = node;
    
    setMediaFiles(mediaFiles.map((file, index) => 
      index === fileIndex ? { ...file, x: x || 0, y: y || 0 } : file
    ));
  };

  const handleSave = async () => {
    try {
      // Ensure all elements have proper numeric values to avoid NaN errors
      const sanitizedElements = elements.map(sanitizeElement);
      
      console.log('Saving elements:', sanitizedElements);
      console.log('Saving mediaFiles:', mediaFiles);
      
      const updatedMedia = await mediaAPI.update(media._id, {
        elements: sanitizedElements,
        backgroundColor,
        compositionType,
        mediaFiles: mediaFiles.map(file => ({
          ...file,
          x: file.x || 0,
          y: file.y || 0
        }))
      });
      
      console.log('Save response:', updatedMedia.data);
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
              width={800}
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
                  <Image
                    image={backgroundImage}
                    width={800}
                    height={600}
                    x={0}
                    y={0}
                  />
                )}
                
                {/* Foreground images as draggable elements */}
                {mediaFiles.filter(file => !file.isBackground && file.type === 'image').map((file, index) => {
                  const fileIndex = mediaFiles.findIndex(f => f.url === file.url);
                  const elementId = `image-${index}`;
                  const isSelected = selectedId === elementId;
                  
                  return (
                    <React.Fragment key={`image-${index}`}>
                      <Image
                        id={elementId}
                        image={foregroundImage}
                        x={file.x || 50 + index * 50}
                        y={file.y || 50 + index * 50}
                        width={file.width || 200}
                        height={file.height || 150}
                        draggable={compositionType === 'custom'}
                        cornerRadius={10}
                        shadowBlur={10}
                        shadowColor="rgba(0,0,0,0.5)"
                        onDragEnd={(e) => handleImageDragEnd(fileIndex, e)}
                        onDragMove={(e) => handleImageDragMove(fileIndex, e)}
                        onClick={() => setSelectedId(elementId)}
                      />
                    </React.Fragment>
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
                        onDragMove={(e) => handleDragMove(e, safeElement.id)}
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
                        draggable={safeElement.draggable}
                        opacity={safeElement.opacity}
                        cornerRadius={10}
                        onDragEnd={(e) => handleDragEnd(e, safeElement.id)}
                        onDragMove={(e) => handleDragMove(e, safeElement.id)}
                        onTransformEnd={(e) => handleTransformEnd(e, safeElement.id)}
                      />
                    );
                  }
                  return null;
                })}
              </Layer>
              
              <Layer>
                <Transformer ref={transformerRef} />
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
            onDelete={() => {
              setElements(elements.filter(el => el.id !== selectedElement.id));
              setSelectedId(null);
            }}
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