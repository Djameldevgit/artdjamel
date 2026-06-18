import React, { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { deleteComment } from '../../redux/actions/commentAction'

const CommentMenu = ({target, comment, setOnEdit, targetType, onDelete}) => {
    const [showDropdown, setShowDropdown] = useState(false)
    const dropdownRef = useRef(null)
    const { auth, socket } = useSelector(state => state)
    const dispatch = useDispatch()

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleRemove = () => {
        const confirmDelete = window.confirm('Supprimer ce commentaire ?')
        if (!confirmDelete) return
        
        setShowDropdown(false)
        if(onDelete) {
            onDelete()
        } else {
            if(target?.user?._id === auth.user?._id || comment.user?._id === auth.user?._id){
                dispatch(deleteComment({target, auth, comment, socket, targetType}))
            }
        }
    }

    const handleEdit = () => {
        setShowDropdown(false)
        setOnEdit(true)
    }

    const isTargetOwner = target?.user?._id === auth.user?._id
    const isCommentOwner = comment.user?._id === auth.user?._id
    const isAdmin = auth.user?.role === 'admin' || auth.user?.role === 'moderator'
    
    const canShowMenu = isTargetOwner || isCommentOwner || isAdmin

    if (!canShowMenu) return null

    return (
        <div className="comment-menu-wrapper" ref={dropdownRef} style={{ position: 'relative' }}>
            <span 
                className="material-icons" 
                onClick={() => setShowDropdown(!showDropdown)}
                style={{ 
                    cursor: 'pointer', 
                    fontSize: '20px',
                    padding: '4px',
                    borderRadius: '50%',
                    transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
                more_vert
            </span>

            {showDropdown && (
                <div 
                    className="comment-dropdown-menu"
                    style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '4px',
                        background: '#fff',
                        borderRadius: '8px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                        zIndex: 1000,
                        minWidth: '120px',
                        overflow: 'hidden'
                    }}
                >
                    {(isCommentOwner || isAdmin) && (
                        <div 
                            className="dropdown-item"
                            onClick={handleEdit}
                            style={{
                                padding: '8px 16px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                        >
                            <span className="material-icons" style={{ fontSize: '18px' }}>create</span>
                            <span>Modifier</span>
                        </div>
                    )}
                    
                    {(isCommentOwner || isTargetOwner || isAdmin) && (
                        <div 
                            className="dropdown-item"
                            onClick={handleRemove}
                            style={{
                                padding: '8px 16px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: '#f44336',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                        >
                            <span className="material-icons" style={{ fontSize: '18px' }}>delete_outline</span>
                            <span>Supprimer</span>
                        </div>
                    )}
                </div>
            )}

            <style>{`
                .comment-menu-wrapper {
                    position: relative;
                }
                .comment-dropdown-menu {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    margin-top: 4px;
                    background: #fff;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    z-index: 1000;
                    min-width: 120px;
                    overflow: hidden;
                }
                [data-theme="dark"] .comment-dropdown-menu {
                    background: #2d2d2d;
                    color: #fff;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                }
                [data-theme="dark"] .dropdown-item:hover {
                    background: #3d3d3d !important;
                }
            `}</style>
        </div>
    )
}

export default CommentMenu