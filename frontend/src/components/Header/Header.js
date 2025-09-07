import React from 'react';
import './Header.css';

const Header = ({ currentView, onViewChange }) => {
  const menuItems = [
    { key: 'upload', label: 'Upload', icon: '📤' },
    { key: 'editor', label: 'Editor', icon: '🎨' },
    { key: 'gallery', label: 'Gallery', icon: '📁' },
  ];

  return (
    <header className="header">
      <div className="logo">
        <h1>🎬 Media Editor</h1>
        <p>Create amazing PIP & PIV compositions</p>
      </div>
      
      <nav className="nav">
        {menuItems.map((item) => (
          <button
            key={item.key}
            className={`nav-item ${currentView === item.key ? 'active' : ''}`}
            onClick={() => onViewChange(item.key)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
};

export default Header;