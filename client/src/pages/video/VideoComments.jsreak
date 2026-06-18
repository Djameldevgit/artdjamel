// components/Video/VideoComments.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getComments,
  addComment, 
  addCommentReply, 
  likeComment, 
  deleteComment,
  editComment,
  editReply,
  deleteReply,
  clearComments
} from '../../redux/actions/videoAction';
import { Heart, Reply, Trash2, Send, MoreVertical, Edit2, X, Check } from 'lucide-react';
import './VideoComment.css';

const VideoComments = ({ videoId, videoData }) => {
  const dispatch = useDispatch();
  const { auth, socket } = useSelector(state => state);
  const { 
    comments, 
    commentsTotal, 
    hasMoreComments, 
    commentsLoading 
  } = useSelector(state => state.video);
  
  const [newComment, setNewComment] = useState('');
  const [replyText, setReplyText] = useState({});
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [showMenu, setShowMenu] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editText, setEditText] = useState('');
  const [likedComments, setLikedComments] = useState({});
  
  const commentsContainerRef = useRef(null);
  const observerRef = useRef(null);
  const lastCommentRef = useRef(null);

  // Cargar comentarios
  useEffect(() => {
    dispatch(clearComments());
    dispatch(getComments(videoId, 1));
    return () => dispatch(clearComments());
  }, [dispatch, videoId]);

  // Intersection Observer
  useEffect(() => {
    if (!commentsContainerRef.current || !hasMoreComments || commentsLoading) return;
    
    const options = { root: commentsContainerRef.current, rootMargin: '0px', threshold: 0.1 };
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMoreComments && !commentsLoading) {
        const nextPage = Math.floor(comments.length / 20) + 1;
        dispatch(getComments(videoId, nextPage));
      }
    }, options);
    
    if (lastCommentRef.current) observerRef.current.observe(lastCommentRef.current);
    return () => observerRef.current?.disconnect();
  }, [comments.length, hasMoreComments, commentsLoading, dispatch, videoId]);

  // Socket events
  useEffect(() => {
    if (!socket) return;
    
    socket.emit('join-video-room', videoId);
    
    const handlers = {
      'new-comment': (data) => data.videoId === videoId && data.comment && 
        dispatch({ type: 'ADD_COMMENT', payload: data.comment }),
      'comment-liked': (data) => data.videoId === videoId && 
        dispatch({ type: 'LIKE_COMMENT', payload: { commentId: data.commentId, likes: data.likes, liked: data.liked } }),
      'new-reply': (data) => data.videoId === videoId && 
        dispatch({ type: 'ADD_COMMENT_REPLY', payload: { commentId: data.commentId, reply: data.reply } }),
      'comment-deleted': (data) => data.videoId === videoId && 
        dispatch({ type: 'DELETE_COMMENT', payload: { commentId: data.commentId } }),
    };
    
    Object.entries(handlers).forEach(([event, handler]) => socket.on(event, handler));
    
    return () => {
      socket.emit('leave-video-room', videoId);
      Object.keys(handlers).forEach(event => socket.off(event));
    };
  }, [socket, videoId, dispatch]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !auth.token) return;
    
    const result = await dispatch(addComment(videoId, newComment, auth.token, auth, socket, videoData));
    if (result.success) {
      setNewComment('');
      if (socket) socket.emit('send-comment', { videoId, comment: result.comment });
    }
  };

  const handleAddReply = async (commentId) => {
    const text = replyText[commentId];
    if (!text?.trim() || !auth.token) return;
    
    const parentComment = comments.find(c => c._id === commentId);
    const result = await dispatch(addCommentReply(videoId, commentId, text, auth.token, auth, socket, parentComment, videoData));
    if (result.success) {
      setReplyText(prev => ({ ...prev, [commentId]: '' }));
      setActiveReplyId(null);
      if (socket) socket.emit('send-reply', { videoId, commentId, reply: result.reply });
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!auth.token) return;
    setLikedComments(prev => ({ ...prev, [commentId]: !prev[commentId] }));
    const comment = comments.find(c => c._id === commentId);
    await dispatch(likeComment(videoId, commentId, auth.token, auth, socket, comment, videoData));
  };

  const handleEditComment = async (commentId) => {
    if (!editText.trim()) return;
    const result = await dispatch(editComment(videoId, commentId, editText, auth.token));
    if (result.success) {
      setEditingCommentId(null);
      setEditText('');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Supprimer ce commentaire ?')) return;
    const result = await dispatch(deleteComment(videoId, commentId, auth.token));
    if (result.success && socket) socket.emit('delete-comment', { videoId, commentId });
    setShowMenu(null);
  };

  const handleEditReply = async (commentId, replyId) => {
    if (!editText.trim()) return;
    const result = await dispatch(editReply(videoId, commentId, replyId, editText, auth.token));
    if (result.success) {
      setEditingReplyId(null);
      setEditText('');
    }
  };

  const handleDeleteReply = async (commentId, replyId) => {
    if (!window.confirm('Supprimer cette réponse ?')) return;
    const result = await dispatch(deleteReply(videoId, commentId, replyId, auth.token));
    if (result.success && socket) socket.emit('delete-reply', { videoId, commentId, replyId });
  };

  const canModify = (userId) => {
    return auth.user && (auth.user._id === userId || auth.user.role === 'admin' || auth.user.role === 'moderator');
  };

  const formatDate = (date) => {
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000);
    if (diff < 60) return 'maintenant';
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
    return new Date(date).toLocaleDateString('fr-FR');
  };

  return (
    <div className="video-comments-container">
      <div className="comments-header">
        <h5>{commentsTotal} {commentsTotal === 1 ? 'commentaire' : 'commentaires'}</h5>
      </div>
      
      {/* Formulario principal */}
      {auth.token && (
        <form onSubmit={handleAddComment} className="comment-form-main">
          <img src={auth.user?.avatar || '/default-avatar.png'} alt="" className="comment-main-avatar" />
          <div className="comment-main-input-wrapper">
            <textarea
              className="comment-main-input"
              placeholder="Ajouter un commentaire..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows="1"
            />
            <button type="submit" className="comment-main-send" disabled={!newComment.trim()}>
              <Send size={18} />
            </button>
          </div>
        </form>
      )}
      
      {/* Lista de comentarios */}
      <div className="comments-list" ref={commentsContainerRef}>
        {comments.length === 0 && !commentsLoading ? (
          <div className="no-comments">
            <div className="no-comments-icon">💬</div>
            <p>Aucun commentaire pour le moment</p>
            <span>Soyez le premier à commenter !</span>
          </div>
        ) : (
          comments.map((comment, index) => (
            <div key={comment._id} className="comment-item" ref={index === comments.length - 1 ? lastCommentRef : null}>
              {/* Avatar */}
              <img src={comment.user?.avatar || '/default-avatar.png'} alt="" className="comment-avatar" />
              
              <div className="comment-body">
                {/* Header */}
                <div className="comment-header">
                  <div className="comment-user">
                    <strong>@{comment.user?.username}</strong>
                    <span className="comment-time">{formatDate(comment.createdAt)}</span>
                    {comment.user?.isPro && <span className="pro-badge">Pro</span>}
                    {comment.edited && <span className="edited-badge">modifié</span>}
                  </div>
                  
                  {canModify(comment.user?._id) && editingCommentId !== comment._id && (
                    <div className="comment-menu">
                      <button onClick={() => setShowMenu(showMenu === comment._id ? null : comment._id)}>
                        <MoreVertical size={16} />
                      </button>
                      {showMenu === comment._id && (
                        <div className="comment-dropdown">
                          <button onClick={() => {
                            setEditingCommentId(comment._id);
                            setEditText(comment.text);
                            setShowMenu(null);
                          }}>
                            <Edit2 size={14} /> Modifier
                          </button>
                          <button onClick={() => handleDeleteComment(comment._id)}>
                            <Trash2 size={14} /> Supprimer
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Texto o edición */}
                {editingCommentId === comment._id ? (
                  <div className="edit-area">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows="3"
                      autoFocus
                    />
                    <div className="edit-actions">
                      <button className="save-btn" onClick={() => handleEditComment(comment._id)}>
                        <Check size={14} /> Enregistrer
                      </button>
                      <button className="cancel-btn" onClick={() => setEditingCommentId(null)}>
                        <X size={14} /> Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="comment-text">{comment.text}</p>
                )}
                
                {/* Acciones */}
                <div className="comment-actions">
                  <button className={`like-btn ${likedComments[comment._id] || comment.liked ? 'active' : ''}`} onClick={() => handleLikeComment(comment._id)}>
                    <Heart size={16} />
                    <span>{comment.likes?.length || 0}</span>
                  </button>
                  <button className="reply-btn" onClick={() => setActiveReplyId(activeReplyId === comment._id ? null : comment._id)}>
                    <Reply size={16} />
                    <span>Répondre</span>
                  </button>
                </div>
                
                {/* Respuestas existentes */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="replies-list">
                    {comment.replies.map(reply => (
                      <div key={reply._id} className="reply-item">
                        <img src={reply.user?.avatar || '/default-avatar.png'} alt="" className="reply-avatar" />
                        <div className="reply-body">
                          <div className="reply-header">
                            <strong>@{reply.user?.username}</strong>
                            <span className="reply-time">{formatDate(reply.createdAt)}</span>
                            {reply.edited && <span className="edited-badge">modifié</span>}
                            {canModify(reply.user?._id) && editingReplyId !== reply._id && (
                              <div className="reply-menu">
                                <button onClick={() => setShowMenu(showMenu === reply._id ? null : reply._id)}>
                                  <MoreVertical size={12} />
                                </button>
                                {showMenu === reply._id && (
                                  <div className="reply-dropdown">
                                    <button onClick={() => {
                                      setEditingReplyId(reply._id);
                                      setEditText(reply.text);
                                      setShowMenu(null);
                                    }}>
                                      <Edit2 size={12} /> Modifier
                                    </button>
                                    <button onClick={() => handleDeleteReply(comment._id, reply._id)}>
                                      <Trash2 size={12} /> Supprimer
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {editingReplyId === reply._id ? (
                            <div className="edit-area inline">
                              <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                rows="2"
                                autoFocus
                              />
                              <div className="edit-actions">
                                <button className="save-btn" onClick={() => handleEditReply(comment._id, reply._id)}>
                                  <Check size={12} /> OK
                                </button>
                                <button className="cancel-btn" onClick={() => setEditingReplyId(null)}>
                                  <X size={12} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="reply-text">{reply.text}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Formulario de respuesta */}
                {activeReplyId === comment._id && (
                  <div className="reply-form-container">
                    <img src={auth.user?.avatar || '/default-avatar.png'} alt="" className="reply-form-avatar" />
                    <div className="reply-form-wrapper">
                      <textarea
                        className="reply-form-input"
                        placeholder="Écrire une réponse..."
                        value={replyText[comment._id] || ''}
                        onChange={(e) => setReplyText(prev => ({ ...prev, [comment._id]: e.target.value }))}
                        rows="1"
                      />
                      <button 
                        className="reply-form-send"
                        onClick={() => handleAddReply(comment._id)}
                        disabled={!replyText[comment._id]?.trim()}
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        
        {commentsLoading && (
          <div className="loading-more">
            <div className="loading-spinner"></div>
            <span>Chargement...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoComments;