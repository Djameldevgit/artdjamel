// components/AvatarWithFallback.jsx
import React, { useState } from 'react';

// ============================================
// COMPONENTE AVATAR CORREGIDO - USA IMAGEN LOCAL
// ============================================
const AvatarWithFallback = ({ src, alt, className, username }) => {
  const [imgError, setImgError] = useState(false);
  
  // ✅ Si no hay src o hay error, usar imagen local
  if (!src || imgError) {
    return (
      <img
        src="https://res.cloudinary.com/dfjipgj2o/image/upload/v1777252420/tassili8_cqqk5n.png"
        alt={alt || username || 'avatar'}
        className={className}
      />
    );
  }
  
  return (
    <img
      src={src}
      alt={alt || username || 'avatar'}
      className={className}
      onError={() => setImgError(true)}
    />
  );
};

export default AvatarWithFallback;