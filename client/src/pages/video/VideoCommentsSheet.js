import React, { useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import Comments from '../../components/Comments'
import InputComment from '../../components/InputComment'
import { useSelector } from 'react-redux'
import './VideoCommentsSheet.css'

const VideoCommentsSheet = ({ show, onClose, video, commentsCount }) => {
    const { auth } = useSelector(state => state)
    const sheetRef = useRef(null)
    const startY = useRef(0)
    const currentY = useRef(0)
    
    // ✅ Vérifier que l'ID du video est complet
    console.log('🎬 VideoCommentsSheet - video:', video?._id);
    
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && show) onClose()
        }
        
        document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [show, onClose])
    
    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [show])
    
    const handleTouchStart = (e) => {
        startY.current = e.touches[0].clientY
    }
    
    const handleTouchMove = (e) => {
        const deltaY = e.touches[0].clientY - startY.current
        if (deltaY > 0 && sheetRef.current) {
            currentY.current = deltaY
            sheetRef.current.style.transform = `translateY(${deltaY}px)`
        }
    }
    
    const handleTouchEnd = () => {
        if (currentY.current > 100) {
            onClose()
        }
        if (sheetRef.current) {
            sheetRef.current.style.transform = ''
            currentY.current = 0
        }
    }
    
    if (!show) return null
    
    return (
        <div className="comments-sheet-overlay">
            <div className="comments-backdrop" onClick={onClose} />
            
            <div 
                ref={sheetRef}
                className="comments-sheet"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div className="sheet-drag-handle">
                    <div className="sheet-drag-bar" />
                </div>
                
                <div className="sheet-header">
                    <h5>{commentsCount} commentaire{commentsCount !== 1 ? 's' : ''}</h5>
                    <button className="sheet-close-btn" onClick={onClose}>
                        <X size={22} />
                    </button>
                </div>
                
                {/* Video miniaturizado */}
                {video && video.videoUrl && (
                    <div className="video-preview">
                        <div className="video-preview-container">
                            <video
                                src={video.videoUrl}
                                autoPlay
                                loop
                                muted
                                playsInline
                            />
                        </div>
                        <div className="video-preview-info">
                            <span className="video-title">{video.title}</span>
                        </div>
                    </div>
                )}
                
                {/* Input para comentarios */}
                {auth.token && video && (
                    <div className="sheet-input-container">
                        <InputComment 
                            video={video}
                            onReply={null}
                            setOnReply={null}
                        />
                    </div>
                )}
                
                {/* Lista de comentarios */}
                <div className="sheet-comments-container">
                    {video && <Comments video={video} />}
                </div>
            </div>
        </div>
    )
}

export default VideoCommentsSheet