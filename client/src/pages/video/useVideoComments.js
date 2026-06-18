// hooks/useVideoComments.js
import { useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addComment, addCommentReply, likeComment, deleteComment, editComment } from '../redux/actions/videoAction';

export const useVideoComments = (videoId, videoData) => {
  const dispatch = useDispatch();
  const { auth, socket } = useSelector(state => state);
  const [state, setState] = useState({
    newComment: '',
    replyStates: {},
    activeReplyId: null,
    showEmojiPicker: false,
    isSubmitting: false,
    editingComment: null
  });
  
  const inputRef = useRef(null);
  
  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);
  
  const handleAddComment = useCallback(async () => {
    if (!state.newComment.trim() || !auth.token || state.isSubmitting) return;
    
    updateState({ isSubmitting: true });
    
    const result = await dispatch(addComment(
      videoId, state.newComment, auth.token, auth, socket, videoData
    ));
    
    if (result.success) {
      updateState({ newComment: '', showEmojiPicker: false });
      if (inputRef.current) inputRef.current.focus();
    }
    
    updateState({ isSubmitting: false });
  }, [state.newComment, auth.token, state.isSubmitting, dispatch, videoId, auth, socket, videoData, updateState]);
  
  const handleReply = useCallback((commentId) => {
    updateState({
      activeReplyId: state.activeReplyId === commentId ? null : commentId,
      replyStates: { ...state.replyStates, [commentId]: { text: '', show: !state.replyStates[commentId]?.show } }
    });
  }, [state.activeReplyId, state.replyStates, updateState]);
  
  const handleAddReply = useCallback(async (commentId) => {
    const text = state.replyStates[commentId]?.text;
    if (!text?.trim() || !auth.token || state.isSubmitting) return;
    
    updateState({ isSubmitting: true });
    
    const result = await dispatch(addCommentReply(
      videoId, commentId, text, auth.token, auth, socket, null, videoData
    ));
    
    if (result.success) {
      updateState({
        replyStates: { ...state.replyStates, [commentId]: { text: '', show: false } },
        activeReplyId: null
      });
    }
    
    updateState({ isSubmitting: false });
  }, [state.replyStates, auth.token, state.isSubmitting, dispatch, videoId, auth, socket, videoData, updateState]);
  
  const handleLike = useCallback(async (commentId, isReply = false, parentId = null) => {
    if (!auth.token) return;
    await dispatch(likeComment(videoId, commentId, auth.token, auth, socket, null, videoData));
  }, [auth.token, dispatch, videoId, auth, socket, videoData]);
  
  const handleDelete = useCallback(async (commentId, isReply = false, replyId = null) => {
    if (!window.confirm('Supprimer ce commentaire ?')) return;
    
    if (isReply) {
      await dispatch(deleteReply(videoId, commentId, replyId, auth.token));
    } else {
      await dispatch(deleteComment(videoId, commentId, auth.token));
    }
  }, [dispatch, videoId, auth.token]);
  
  const handleEdit = useCallback((commentId, text, isReply = false, replyId = null) => {
    updateState({ editingComment: { id: commentId, text, isReply, replyId } });
  }, [updateState]);
  
  const handleSaveEdit = useCallback(async () => {
    if (!state.editingComment?.text.trim()) return;
    
    const { id, text, isReply, replyId } = state.editingComment;
    let result;
    
    if (isReply) {
      result = await dispatch(editReply(videoId, id, replyId, text, auth.token));
    } else {
      result = await dispatch(editComment(videoId, id, text, auth.token));
    }
    
    if (result.success) {
      updateState({ editingComment: null });
    }
  }, [state.editingComment, dispatch, videoId, auth.token, updateState]);
  
  const onEmojiClick = useCallback((emojiObject) => {
    updateState({ newComment: state.newComment + emojiObject.emoji });
  }, [state.newComment, updateState]);
  
  const canModify = useCallback((userId) => {
    return auth.user && (auth.user._id === userId || auth.user.role === 'admin' || auth.user.role === 'moderator');
  }, [auth.user]);
  
  return {
    state,
    handlers: {
      setNewComment: (text) => updateState({ newComment: text }),
      setReplyText: (commentId, text) => updateState({
        replyStates: { ...state.replyStates, [commentId]: { ...state.replyStates[commentId], text } }
      }),
      setShowEmojiPicker: (show) => updateState({ showEmojiPicker: show }),
      handleAddComment,
      handleReply,
      handleAddReply,
      handleLike,
      handleDelete,
      handleEdit,
      handleSaveEdit,
      onEmojiClick,
      canModify
    },
    refs: { inputRef }
  };
};