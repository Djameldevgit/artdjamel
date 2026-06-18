import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { createComment } from '../../redux/actions/commentAction'
import Icons from '../Icons'

const InputComment = ({children, post, onReply, setOnReply}) => {
    const [content, setContent] = useState('')

    const { auth, socket, theme, languageReducer } = useSelector(state => state)
    const dispatch = useDispatch()
    const { t, i18n } = useTranslation('comments')
    const lang = languageReducer.language || 'es'

    const handleSubmit = (e) => {
        e.preventDefault()
        if(!content.trim()){
            if(setOnReply) return setOnReply(false);
            return;
        }

        setContent('')
        
        const newComment = {
            content,
            likes: [],
            user: auth.user,
            createdAt: new Date().toISOString(),
            reply: onReply && onReply.commentId,
            tag: onReply && onReply.user
        }
        
        dispatch(createComment({post, newComment, auth, socket}))

        if(setOnReply) return setOnReply(false);
    }

    const getPlaceholder = () => {
        if (onReply) {
            return t('writeReply', 'Escribe una respuesta...')
        }
        return t('writeComment', 'Escribe un comentario...')
    }

    return (
        <form 
            className="card-footer comment_input" 
            onSubmit={handleSubmit}
            style={{
                padding: '15px',
                borderTop: '1px solid #e0e0e0',
                backgroundColor: theme ? 'rgba(255,255,255,0.05)' : '#f8f9fa',
                borderRadius: '0 0 10px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}
        >
            {children}
            <input 
                type="text" 
                placeholder={getPlaceholder()}
                value={content} 
                onChange={e => setContent(e.target.value)}
                style={{
                    filter: theme ? 'invert(1)' : 'invert(0)',
                    color: theme ? 'white' : '#111',
                    background: theme ? 'rgba(0,0,0,0.1)' : '#fff',
                    border: theme ? '1px solid #444' : '1px solid #ddd',
                    borderRadius: '25px',
                    padding: '12px 20px',
                    fontSize: '14px',
                    flex: 1,
                    outline: 'none',
                    transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                    e.target.style.borderColor = theme ? '#667eea' : '#007bff';
                    e.target.style.boxShadow = theme 
                        ? '0 0 0 2px rgba(102, 126, 234, 0.25)' 
                        : '0 0 0 2px rgba(0, 123, 255, 0.25)';
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = theme ? '#444' : '#ddd';
                    e.target.style.boxShadow = 'none';
                }}
            />

            <Icons setContent={setContent} content={content} theme={theme} />

            <button 
                type="submit" 
                className="postBtn"
                disabled={!content.trim()}
                style={{
                    backgroundColor: content.trim() ? '#007bff' : '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '25px',
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: content.trim() ? 'pointer' : 'not-allowed',
                    opacity: content.trim() ? 1 : 0.6,
                    transition: 'all 0.3s ease',
                    minWidth: '80px'
                }}
                onMouseEnter={(e) => {
                    if (content.trim()) {
                        e.target.style.backgroundColor = '#0056b3';
                        e.target.style.transform = 'translateY(-1px)';
                    }
                }}
                onMouseLeave={(e) => {
                    if (content.trim()) {
                        e.target.style.backgroundColor = '#007bff';
                        e.target.style.transform = 'translateY(0)';
                    }
                }}
            >
                {t('postComment', 'Publicar')}
            </button>
        </form>
    )
}

export default InputComment