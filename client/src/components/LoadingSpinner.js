// components/LoadingSpinner.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', text = 'Chargement...', fullPage = false }) => {
  const sizes = {
    small: '20px',
    medium: '40px',
    large: '60px'
  };

  const spinnerSize = sizes[size] || sizes.medium;

  if (fullPage) {
    return (
      <div className="loading-spinner-fullpage">
        <div className="loading-spinner-container">
          <div 
            className="loading-spinner-ring" 
            style={{ width: spinnerSize, height: spinnerSize }}
          >
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          {text && <p className="loading-spinner-text">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="loading-spinner-container">
      <div 
        className="loading-spinner-ring" 
        style={{ width: spinnerSize, height: spinnerSize }}
      >
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      {text && <p className="loading-spinner-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;