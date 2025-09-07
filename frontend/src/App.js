import React, { useState, useEffect } from 'react';
import Header from './components/Header/Header';
import UploadArea from './components/UploadArea/UploadArea';
import Editor from './components/Editor/Editor';
import Gallery from './components/Gallery/Gallery';
import { mediaAPI } from './services/api';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('upload');
  const [currentMedia, setCurrentMedia] = useState(null);
  const [compositions, setCompositions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load compositions when app starts
  useEffect(() => {
    fetchCompositions();
  }, []);

  const fetchCompositions = async () => {
    try {
      setLoading(true);
      const response = await mediaAPI.getAll();
      setCompositions(response.data);
    } catch (error) {
      console.error('Error fetching compositions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaUpload = (mediaData) => {
    setCurrentMedia(mediaData);
    setCompositions(prev => [mediaData, ...prev]); // Add to compositions list
    setCurrentView('editor');
  };

  const handleEditComposition = (composition) => {
    console.log('Composition received for editing:', composition);
    setCurrentMedia(composition);
    setCurrentView('editor');
  };

  const handleSaveComposition = async (composition) => {
    try {
      // Update the composition in the list
      const updatedCompositions = compositions.map(comp => 
        comp._id === composition._id ? composition : comp
      );
      
      setCompositions(updatedCompositions);
      setCurrentMedia(composition);
      alert('Composition saved successfully!');
    } catch (error) {
      console.error('Error updating composition:', error);
      alert('Failed to save composition. Please try again.');
    }
  };

  const handleBackToGallery = () => {
    setCurrentView('gallery');
    fetchCompositions(); // Refresh the gallery to get latest data
  };

  const viewComponents = {
    upload: <UploadArea onMediaUpload={handleMediaUpload} />,
    editor: currentMedia && (
      <Editor 
        media={currentMedia} 
        onSave={handleSaveComposition} 
        onBack={handleBackToGallery}
      />
    ),
    gallery: <Gallery compositions={compositions} onEdit={handleEditComposition} loading={loading} />
  };

  return (
    <div className="App">
      <Header currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="main-content">
        {viewComponents[currentView]}
      </main>
    </div>
  );
}

export default App;