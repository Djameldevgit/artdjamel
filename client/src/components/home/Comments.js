import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import CommentDisplay from './comments/CommentDisplay'

const Comments = ({post}) => {
    const [comments, setComments] = useState([])
    const [showComments, setShowComments] = useState([])
    const [next, setNext] = useState(2)
    const [replyComments, setReplyComments] = useState([])
    
    const { languageReducer } = useSelector(state => state)
    const { t, i18n } = useTranslation('comments')
    const lang = languageReducer.language || 'es'

    useEffect(() => {
        if (lang && lang !== i18n.language) {
            i18n.changeLanguage(lang);
        }
    }, [lang, i18n])

    useEffect(() => {
        const newCm = post.comments.filter(cm => !cm.reply)
        setComments(newCm)
        setShowComments(newCm.slice(newCm.length - next))
    },[post.comments, next])

    useEffect(()=> {
        const newRep = post.comments.filter(cm => cm.reply)
        setReplyComments(newRep)
    }, [post.comments])

    return (
        <div className="comments">
            {
                showComments.map((comment, index) => (
                    <CommentDisplay 
                        key={index} 
                        comment={comment} 
                        post={post}
                        replyCm={replyComments.filter(item => item.reply === comment._id)} 
                    />
                ))
            }

            {
                comments.length - next > 0
                ? <div 
                    className="p-2 border-top"
                    style={{
                        cursor: 'pointer', 
                        color: '#007bff',
                        fontWeight: '500',
                        fontSize: '14px',
                        textAlign: 'center',
                        padding: '12px',
                        backgroundColor: 'rgba(0, 123, 255, 0.05)',
                        border: '1px solid rgba(0, 123, 255, 0.2)',
                        borderRadius: '8px',
                        margin: '10px 0',
                        transition: 'all 0.3s ease'
                    }}
                    onClick={() => setNext(next + 10)}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
                        e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'rgba(0, 123, 255, 0.05)';
                        e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    {t('seeMoreComments', 'Ver más comentarios...')}
                  </div>

                : comments.length > 2 &&
                <div 
                    className="p-2 border-top"
                    style={{
                        cursor: 'pointer', 
                        color: '#6c757d',
                        fontWeight: '500',
                        fontSize: '14px',
                        textAlign: 'center',
                        padding: '12px',
                        backgroundColor: 'rgba(108, 117, 125, 0.05)',
                        border: '1px solid rgba(108, 117, 125, 0.2)',
                        borderRadius: '8px',
                        margin: '10px 0',
                        transition: 'all 0.3s ease'
                    }}
                    onClick={() => setNext(2)}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'rgba(108, 117, 125, 0.1)';
                        e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'rgba(108, 117, 125, 0.05)';
                        e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    {t('hideComments', 'Ocultar comentarios...')}
                  </div>
            }

            {/* Mensaje cuando no hay comentarios */}
            {comments.length === 0 && (
                <div 
                    style={{
                        textAlign: 'center',
                        color: '#6c757d',
                        padding: '20px',
                        fontStyle: 'italic',
                        backgroundColor: 'rgba(108, 117, 125, 0.05)',
                        borderRadius: '8px',
                        margin: '10px 0'
                    }}
                >
                    {t('noComments', 'No hay comentarios aún')}
                </div>
            )}
        </div>
    )
}

export default Comments
