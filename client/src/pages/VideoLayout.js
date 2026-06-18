// layouts/VideoLayout.jsx
import React from 'react';
import HeaderVideo from './HeaderVideo';

const VideoLayout = ({ children }) => {
  return (
    <div className="video-layout">
      {children}
      <HeaderVideo />
    </div>
  );
};

export default VideoLayout;