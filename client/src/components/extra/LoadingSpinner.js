// src/components/extra/LoadingSpinner.js - CREAR ESTE ARCHIVO
import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Chargement...' }) => {
  const sizes = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border-lg'
  };
  
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5">
      <div className={`spinner-border ${sizes[size]} text-primary`} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      {text && <p className="mt-2 text-muted">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;