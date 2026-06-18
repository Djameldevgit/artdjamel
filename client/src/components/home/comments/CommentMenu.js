import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { deleteComment } from '../../../redux/actions/commentAction'

const CommentMenu = ({post, comment, setOnEdit}) => {
    const { auth, socket, languageReducer } = useSelector(state => state)
    const dispatch = useDispatch()
    const { t, i18n } = useTranslation('comments')
    const lang = languageReducer.language || 'es'

    const handleRemove = () => {
        if(post.user._id === auth.user._id || comment.user._id === auth.user._id){
            if(window.confirm(t('confirmDelete', '¿Estás seguro de que quieres eliminar este comentario?'))) {
                dispatch(deleteComment({post, auth, comment, socket}))
            }
        }
    }

    const MenuItem = () => {
        return(
            <>
                <div className="dropdown-item" onClick={() => setOnEdit(true)} style={{ cursor: 'pointer' }}>
                    <span className="material-icons" style={{ fontSize: '18px', marginRight: '8px' }}>create</span> 
                    {t('editComment', 'Editar')}
                </div>
                <div className="dropdown-item" onClick={handleRemove} style={{ cursor: 'pointer' }}>
                    <span className="material-icons" style={{ fontSize: '18px', marginRight: '8px' }}>delete_outline</span> 
                    {t('deleteComment', 'Eliminar')}
                </div>
            </>
        )
    }

    return (
        <div className="menu">
            {
                (post.user._id === auth.user._id || comment.user._id === auth.user._id) &&
                <div className="nav-item dropdown">
                    <span 
                        className="material-icons" 
                        id="moreLink" 
                        data-toggle="dropdown"
                        style={{ 
                            cursor: 'pointer', 
                            fontSize: '20px',
                            color: '#666',
                            padding: '4px',
                            borderRadius: '50%',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(0, 0, 0, 0.1)';
                            e.target.style.color = '#333';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'none';
                            e.target.style.color = '#666';
                        }}
                    >
                        more_vert
                    </span>

                    <div 
                        className="dropdown-menu" 
                        aria-labelledby="moreLink"
                        style={{
                            minWidth: '140px',
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            padding: '8px 0'
                        }}
                    >
                        {
                            post.user._id === auth.user._id
                            ? comment.user._id === auth.user._id
                                ? MenuItem()
                                : <div 
                                    className="dropdown-item" 
                                    onClick={handleRemove}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    <span className="material-icons" style={{ fontSize: '18px', marginRight: '8px' }}>delete_outline</span> 
                                    {t('deleteComment', 'Eliminar')}
                                  </div>
                            : comment.user._id === auth.user._id && MenuItem()
                        }
                    </div>
                </div>
            }
        </div>
    )
}

export default CommentMenu
