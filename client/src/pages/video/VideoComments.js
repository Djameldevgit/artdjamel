// components/VideoComments.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Comments from '../../components/Comments';
import { getDataAPI } from '../../utils/fetchData';
import './VideoCommentsModern.css';

const VideoComments = ({ videoId, videoData, totalComments, onClose, onRefresh }) => {
    const { auth } = useSelector(state => state);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    // Cargar comentarios desde el backend
    const loadComments = async () => {
        if (!videoId || videoId.length < 24) {
            console.error('❌ videoId invalide:', videoId);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const cleanVideoId = videoId.trim();
            const res = await getDataAPI(`comments?targetId=${cleanVideoId}&targetModel=video`, auth.token);
            if (res.data.success) {
                const allComments = [...res.data.data.comments, ...res.data.data.replies];
                setComments(allComments);
            }
        } catch (err) {
            console.error('❌ Error loading comments:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadComments();
    }, [videoId, refreshKey]);

    // Función para refrescar después de agregar un comentario (desde el componente Comments)
    const handleCommentAction = () => {
        setRefreshKey(prev => prev + 1);
        if (onRefresh) onRefresh();
    };

    // Objeto target unificado para Comments (sin input)
    const target = {
        _id: videoId,
        user: {
            _id: videoData?.user?._id || auth.user?._id,
            username: videoData?.user?.username || auth.user?.username,
            avatar: videoData?.user?.avatar || auth.user?.avatar
        },
        title: videoData?.title || '',
        content: videoData?.description || '',
        images: videoData?.thumbnail ? [{ url: videoData.thumbnail }] : [],
        comments: comments
    };

    if (loading) {
        return (
            <div className="video-comments-container">
                {onClose && (
                    <div className="comments-header">
                        <div className="header-drag-handle">
                            <div className="drag-bar" />
                        </div>
                        <button className="close-button" onClick={onClose}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                )}
                <div className="text-center py-4">Chargement des commentaires...</div>
            </div>
        );
    }

    return (
        <div className="video-comments-container">
            {/* Cabecera del modal (si tiene botón cerrar) */}
            {onClose && (
                <div className="comments-header">
                    <div className="header-drag-handle">
                        <div className="drag-bar" />
                    </div>
                    <h3>
                        <span className="comments-count">{comments.length}</span>
                        {comments.length === 1 ? ' Commentaire' : ' Commentaires'}
                    </h3>
                    <button className="close-button" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
            )}

            {!onClose && (
                <div className="comments-header">
                    <h5>{comments.length} {comments.length === 1 ? 'commentaire' : 'commentaires'}</h5>
                </div>
            )}

            {/* ⚠️ INPUT ELIMINADO – solo se usa en VideoCommentsSheet */}

            {/* Lista de comentarios */}
            <div className="comments-list-scrollable">
                <Comments
                    target={target}
                    targetType="video"
                    key={refreshKey}
                    onCommentAction={handleCommentAction}
                />
            </div>

            {/* Estilos inline para scroll */}
            <style>{`
                .comments-list-scrollable {
                    flex: 1;
                    overflow-y: auto;
                    overflow-x: hidden;
                    padding: 8px 0;
                }
                .comments-list-scrollable::-webkit-scrollbar {
                    width: 8px;
                }
                .comments-list-scrollable::-webkit-scrollbar-track {
                    background: #2a2a2a;
                    border-radius: 10px;
                }
                .comments-list-scrollable::-webkit-scrollbar-thumb {
                    background: #666;
                    border-radius: 10px;
                }
                .text-center {
                    text-align: center;
                }
                .py-4 {
                    padding: 1rem 0;
                }
            `}</style>
        </div>
    );
};

export default VideoComments;