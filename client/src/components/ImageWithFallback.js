// components/ImageWithFallback.jsx
import React, { useState } from 'react';
import { Image } from 'react-bootstrap';

const ImageWithFallback = ({ 
    src, 
    alt, 
    fallbackSrc = 'https://via.placeholder.com/300x200?text=No+Image',
    className = '',
    style = {},
    ...props 
}) => {
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleError = () => {
        console.log('❌ Error cargando imagen:', src);
        setHasError(true);
        setIsLoading(false);
    };

    const handleLoad = () => {
        setIsLoading(false);
    };

    return (
        <div className="position-relative" style={{ overflow: 'hidden' }}>
            {isLoading && (
                <div 
                    className="position-absolute top-0 start-0 w-100 h-100"
                    style={{
                        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'loading 1.5s infinite',
                        zIndex: 1
                    }}
                />
            )}
            
            <img
                src={hasError ? fallbackSrc : src}
                alt={alt}
                className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                style={{
                    transition: 'opacity 0.3s ease',
                    ...style
                }}
                onError={handleError}
                onLoad={handleLoad}
                loading="lazy"
                {...props}
            />
            
            <style jsx>{`
                @keyframes loading {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </div>
    );
};

export default ImageWithFallback;