import React, { useState, useEffect } from 'react'
import Avatar from '../Avatar'
import { Link } from 'react-router-dom'
import moment from 'moment'
import 'moment/locale/fr' // Importa la localización francesa

import LikeButton from '../LikeButton'
import { useSelector, useDispatch } from 'react-redux'
import CommentMenu from './CommentMenu'
import { updateComment, likeComment, unLikeComment } from '../../redux/actions/commentAction'
import InputComment from '../InputComment'

const CommentCard = ({children, comment, target, targetType, commentId, onCommentDeleted, onCommentUpdated}) => {
    const { auth, theme } = useSelector(state => state)
    const dispatch = useDispatch()

    // Forcer la langue française pour moment
    moment.locale('fr')

    const [content, setContent] = useState('')
    const [readMore, setReadMore] = useState(false)

    const [onEdit, setOnEdit] = useState(false)
    const [isLike, setIsLike] = useState(false)
    const [loadLike, setLoadLike] = useState(false)

    const [onReply, setOnReply] = useState(false)

    useEffect(() => {
        setContent(comment.content)
        setIsLike(false)
        setOnReply(false)
        if(comment.likes?.find(like => like._id === auth.user?._id)){
            setIsLike(true)
        }
    },[comment, auth.user?._id])

    const handleUpdate = async () => {
        if(comment.content !== content){
            await dispatch(updateComment({comment, target, content, auth, targetType}))
            setOnEdit(false)
            if(onCommentUpdated) onCommentUpdated()
        }else{
            setOnEdit(false)
        }
    }

    const handleLike = async () => {
        if(loadLike) return;
        setIsLike(true)

        setLoadLike(true)
        await dispatch(likeComment({comment, target, auth, targetType}))
        setLoadLike(false)
    }

    const handleUnLike = async () => {
        if(loadLike) return;
        setIsLike(false)

        setLoadLike(true)
        await dispatch(unLikeComment({comment, target, auth, targetType}))
        setLoadLike(false)
    }

    const handleReply = () => {
        if(onReply) return setOnReply(false)
        setOnReply({...comment, commentId})
    }

    const handleDelete = async () => {
        const { deleteComment } = await import('../../redux/actions/commentAction')
        await dispatch(deleteComment({target, comment, auth, socket: null, targetType}))
        if(onCommentDeleted) onCommentDeleted()
    }

    const styleCard = {
        opacity: comment._id ? 1 : 0.5,
        pointerEvents: comment._id ? 'inherit' : 'none'
    }

    return (
        <div className="comment_card mt-2" style={styleCard}>
            <Link to={`/profile/${comment.user?._id}`} className="d-flex text-dark">
                <Avatar src={comment.user?.avatar} size="small-avatar" />
                <h6 className="mx-1">{comment.user?.username}</h6>
            </Link>

            <div className="comment_content">
                <div className="flex-fill" 
                style={{
                    filter: theme ? 'invert(1)' : 'invert(0)',
                    color: theme ? 'white' : '#111',
                }}>
                    {
                        onEdit 
                        ? <textarea rows="5" value={content}
                        onChange={e => setContent(e.target.value)} />

                        : <div>
                            {
                                comment.tag && comment.tag._id !== comment.user?._id &&
                                <Link to={`/profile/${comment.tag._id}`} className="mr-1">
                                    @{comment.tag.username}
                                </Link>
                            }
                            <span>
                                {
                                    content.length < 100 ? content :
                                    readMore ? content + ' ' : content.slice(0, 100) + '....'
                                }
                            </span>
                            {
                                content.length > 100 &&
                                <span className="readMore" onClick={() => setReadMore(!readMore)}>
                                    {readMore ? 'Masquer le contenu' : 'Lire la suite'}
                                </span>
                            }
                        </div>
                    }
                    

                    <div style={{cursor: 'pointer'}}>
                        <small className="text-muted mr-3">
                            {moment(comment.createdAt).fromNow()}
                        </small>

                        <small className="font-weight-bold mr-3">
                            {comment.likes?.length || 0} {comment.likes?.length === 1 ? 'j\'aime' : 'j\'aime'}
                        </small>

                        {
                            onEdit
                            ? <>
                                <small className="font-weight-bold mr-3"
                                onClick={handleUpdate}>
                                    Modifier
                                </small>
                                <small className="font-weight-bold mr-3"
                                onClick={() => setOnEdit(false)}>
                                    Annuler
                                </small>
                            </>

                            : <small className="font-weight-bold mr-3"
                            onClick={handleReply}>
                                {onReply ? 'Annuler' : 'Répondre'}
                            </small>
                        }
                        
                    </div>
                    
                </div>


                <div className="d-flex align-items-center mx-2" style={{cursor: 'pointer'}}>
                    <CommentMenu 
                        target={target}
                        comment={comment} 
                        setOnEdit={setOnEdit} 
                        targetType={targetType}
                        onDelete={handleDelete}
                    />
                    <LikeButton isLike={isLike} handleLike={handleLike} handleUnLike={handleUnLike} />
                </div>
            </div> 
            
            {
                onReply &&
                <InputComment 
                    target={target} 
                    onReply={onReply} 
                    setOnReply={setOnReply} 
                    targetType={targetType}
                    onCommentAdded={onCommentUpdated}
                >
                    <Link to={`/profile/${onReply.user._id}`} className="mr-1">
                        @{onReply.user.username}:
                    </Link>
                </InputComment>
            }

            {children}
        </div>
    )
}

export default CommentCard