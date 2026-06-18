import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import CommentCard from './CommentCard'

const CommentDisplay = ({comment, post, replyCm}) => {
    const [showRep, setShowRep] = useState([])
    const [next, setNext] = useState(1)
    const { languageReducer } = useSelector(state => state)
    const { t, i18n } = useTranslation('comments')
    const lang = languageReducer.language || 'es'

    useEffect(() => {
        if (lang && lang !== i18n.language) {
            i18n.changeLanguage(lang);
        }
    }, [lang, i18n])

    useEffect(() => {
        setShowRep(replyCm.slice(replyCm.length - next))
    },[replyCm, next])

    return (
        <div className="comment_display">
            <CommentCard comment={comment} post={post} commentId={comment._id} >
                <div className="pl-4" style={{ marginLeft: '20px', borderLeft: '2px solid #e0e0e0' }}>
                    {
                        showRep.map((item, index) => (
                            item.reply &&
                            <CommentCard
                                key={index}
                                comment={item}
                                post={post}
                                commentId={comment._id}
                            />
                        ))
                    }

                    {
                        replyCm.length - next > 0
                        ? <div 
                            style={{
                                cursor: 'pointer', 
                                color: '#007bff',
                                fontWeight: '500',
                                fontSize: '14px',
                                margin: '10px 0',
                                padding: '5px 10px',
                                borderRadius: '5px',
                                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                                display: 'inline-block'
                            }}
                            onClick={() => setNext(next + 10)}
                          >
                            {t('seeMoreComments', 'Ver más comentarios...')}
                          </div>

                        : replyCm.length > 1 &&
                        <div 
                            style={{
                                cursor: 'pointer', 
                                color: '#6c757d',
                                fontWeight: '500',
                                fontSize: '14px',
                                margin: '10px 0',
                                padding: '5px 10px',
                                borderRadius: '5px',
                                backgroundColor: 'rgba(108, 117, 125, 0.1)',
                                display: 'inline-block'
                            }}
                            onClick={() => setNext(1)}
                          >
                            {t('hideComments', 'Ocultar comentarios...')}
                          </div>
                    }
                </div>
            </CommentCard>
        </div>
    )
}

export default CommentDisplay
