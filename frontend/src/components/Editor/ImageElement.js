// frontend/src/components/Editor/ImageElement.js
import React from 'react';
import { Image } from 'react-konva';
import useImage from 'use-image';

const ImageElement = ({ file, elementId, index, compositionType, onDragEnd, onTransformEnd, onClick }) => {
  // Ensure the URL is properly formatted with the base URL
  const imageUrl = file.url && file.url.startsWith('http') 
    ? file.url 
    : `http://localhost:5000${file.url}`;
  
  const [image] = useImage(imageUrl || '', 'anonymous');
  
  // Ensure all numeric values are valid numbers
  const x = Number(file.x) || 50 + index * 30;
  const y = Number(file.y) || 50 + index * 30;
  const width = Number(file.width) || 200;
  const height = Number(file.height) || 150;
  const rotation = Number(file.rotation) || 0;
  
  if (!image) {
    return null; // Don't render anything while image is loading
  }
  
  return (
    <Image
      id={elementId}
      image={image}
      x={x}
      y={y}
      width={width}
      height={height}
      rotation={rotation}
      draggable={compositionType === 'custom'}
      cornerRadius={10}
      shadowBlur={10}
      shadowColor="rgba(0,0,0,0.5)"
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
      onClick={onClick}
    />
  );
};

export default ImageElement;