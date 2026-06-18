import React, { useState, useEffect } from 'react'
import CommentCard from './CommentCard'

const CommentDisplay = ({comment, target, targetType, replyCm, onCommentDeleted, onCommentUpdated}) => {
    const [showRep, setShowRep] = useState([])
    const [next, setNext] = useState(1)

    useEffect(() => {
        setShowRep(replyCm.slice(replyCm.length - next))
    },[replyCm, next])

    return (
        <div className="comment_display">
            <CommentCard 
                comment={comment} 
                target={target} 
                targetType={targetType} 
                commentId={comment._id}
                onCommentDeleted={onCommentDeleted}
                onCommentUpdated={onCommentUpdated}
            >
                <div className="pl-4">
                    {
                        showRep.map((item, index) => (
                            item.reply &&
                            <CommentCard
                                key={index}
                                comment={item}
                                target={target}
                                targetType={targetType}
                                commentId={comment._id}
                                onCommentDeleted={onCommentDeleted}
                                onCommentUpdated={onCommentUpdated}
                            />
                        ))
                    }

                    {
                        replyCm.length - next > 0
                        ? <div style={{cursor: 'pointer', color: 'crimson'}}
                        onClick={() => setNext(next + 10)}>
                            Voir plus de commentaires...
                        </div>

                        : replyCm.length > 1 &&
                        <div style={{cursor: 'pointer', color: 'crimson'}}
                        onClick={() => setNext(1)}>
                            Masquer les commentaires...
                        </div>
                    }
                </div>
            </CommentCard>
        </div>
    )
}

export default CommentDisplay