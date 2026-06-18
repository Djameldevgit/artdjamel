// components/video/VideoPlayer.jsx - VERSIÓN ACTUALIZADA

import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import Comments from '../../components/Comments'
import InputComment from '../../components/InputComment'
 
import VideoCommentsSheet from './VideoCommentsSheet'
 
const VideoPlayer = ({ video }) => {
    const { auth } = useSelector(state => state)
    const [showComments, setShowComments] = useState(false)
    const [showFullComments, setShowFullComments] = useState(false)

    // Para mobile - bottom sheet
    if (showFullComments) {
        return (
            <VideoCommentsSheet 
                show={showFullComments}
                onClose={() => setShowFullComments(false)}
                video={video}
                commentsCount={video.comments?.length || 0}
            />
        )
    }

    return (
        <div className="video-player-container">
            {/* Reproductor de video */}
            <div className="video-wrapper">
                <video 
                    src={video.videoUrl}
                    poster={video.thumbnail}
                    controls
                    className="video-element"
                />
            </div>

            {/* Información del video */}
            <div className="video-info">
                <h3>{video.title}</h3>
                <p>{video.description}</p>
                
                {/* Botón de comentarios */}
                <button 
                    className="comments-toggle-btn"
                    onClick={() => {
                        if (window.innerWidth < 768) {
                            setShowFullComments(true)  // Mobile: bottom sheet
                        } else {
                            setShowComments(!showComments)  // Desktop: inline
                        }
                    }}
                >
                    💬 {video.comments?.length || 0} comentarios
                </button>
            </div>

            {/* Sección de comentarios (Desktop) */}
            {showComments && (
                <div className="comments-section">
                    <div className="comments-header">
                        <h4>Comentarios ({video.comments?.length || 0})</h4>
                        <button onClick={() => setShowComments(false)}>✕</button>
                    </div>
                    
                    {/* Input para nuevo comentario */}
                    {auth.token && (
                        <InputComment 
                            video={video}
                            onReply={null}
                            setOnReply={null}
                        />
                    )}
                    
                    {/* Lista de comentarios */}
                    <Comments video={video} />
                </div>
            )}
        </div>
    )
}

export default VideoPlayer