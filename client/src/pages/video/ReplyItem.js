// components/Video/ReplyItem.jsx
import React, { useState } from 'react';
import { MoreVertical, Edit2, Trash2, Check, X } from 'lucide-react';
import './ReplyItem.css';

const ReplyItem = ({ reply, commentId, currentUserId, canModify, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(reply.text);

  const formatDate = (date) => {
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000);
    if (diff < 60) return 'maintenant';
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `il y a ${Math.floor(diff / 86400)}j`;
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleSaveEdit = () => {
    if (editText.trim() && editText !== reply.text) {
      onEdit(editText);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(reply.text);
    setIsEditing(false);
  };

  return (
    <div className="reply-item">
      <img 
        src={reply.user?.avatar || '/default-avatar.png'} 
        alt={reply.user?.username} 
        className="reply-avatar" 
      />
      
      <div className="reply-content">
        <div className="reply-header">
          <div className="reply-user-info">
            <strong className="reply-username">@{reply.user?.username}</strong>
            <span className="reply-time">{formatDate(reply.createdAt)}</span>
            {reply.edited && <span className="edited-badge">modifié</span>}
          </div>
          
          {canModify && !isEditing && (
            <div className="reply-menu">
              <button className="menu-trigger" onClick={() => setShowMenu(!showMenu)}>
                <MoreVertical size={12} />
              </button>
              {showMenu && (
                <div className="menu-dropdown small">
                  <button onClick={handleEdit}>
                    <Edit2 size={12} /> Modifier
                  </button>
                  <button onClick={onDelete} className="danger">
                    <Trash2 size={12} /> Supprimer
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {isEditing ? (
          <div className="edit-mode inline">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows="2"
              autoFocus
            />
            <div className="edit-actions">
              <button className="save-btn" onClick={handleSaveEdit}>
                <Check size={12} /> Enregistrer
              </button>
              <button className="cancel-btn" onClick={handleCancelEdit}>
                <X size={12} /> Annuler
              </button>
            </div>
          </div>
        ) : (
          <p className="reply-text">{reply.text}</p>
        )}
      </div>
    </div>
  );
};

export default ReplyItem;