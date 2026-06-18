import React, { useState, useEffect, useCallback } from 'react'
import CommentDisplay from './comments/CommentDisplay'
import InputComment from './InputComment'
import { useSelector } from 'react-redux'
import { getDataAPI } from '../utils/fetchData'

const Comments = ({ target, targetType }) => {
    const { auth } = useSelector(state => state)
    const [comments, setComments] = useState([])
    const [showComments, setShowComments] = useState([])
    const [next, setNext] = useState(5)  // Afficher 5 commentaires initialement
    const [replyComments, setReplyComments] = useState([])
    const [refreshKey, setRefreshKey] = useState(0)
    const [loading, setLoading] = useState(true)

    // Charger les commentaires depuis le serveur
    const loadComments = useCallback(async () => {
        if (!target?._id) {
            console.log('❌ Comments: target._id n\'existe pas');
            setLoading(false);
            return;
        }
        
        setLoading(true);
        
        try {
            const token = auth.token;
            console.log('📥 Chargement des commentaires pour:', target._id);
            console.log('📥 Avec token:', !!token);
            
            const res = await getDataAPI(`comments?targetId=${target._id}&targetModel=${targetType || 'video'}`, token);
            
            console.log('📥 Réponse complète:', res.data);
            
            if (res.data.success) {
                let allComments = [];
                
                if (res.data.data && res.data.data.comments) {
                    allComments = [...res.data.data.comments, ...(res.data.data.replies || [])];
                } else if (Array.isArray(res.data.comments)) {
                    allComments = res.data.comments;
                } else if (Array.isArray(target.comments)) {
                    allComments = target.comments;
                }
                
                console.log('📥 Nombre total de commentaires trouvés:', allComments.length);
                
                // Séparer les commentaires principaux et les réponses
                const newCm = allComments.filter(cm => !cm.reply)
                const newRep = allComments.filter(cm => cm.reply)
                
                setComments(newCm)
                setReplyComments(newRep)
                setShowComments(newCm.slice(0, next))
            } else {
                console.error('❌ Réponse non réussie:', res.data);
                // Fallback à target.comments
                if (target.comments && Array.isArray(target.comments)) {
                    const newCm = target.comments.filter(cm => !cm.reply)
                    const newRep = target.comments.filter(cm => cm.reply)
                    setComments(newCm)
                    setReplyComments(newRep)
                    setShowComments(newCm.slice(0, next))
                }
            }
        } catch (err) {
            console.error('❌ Erreur lors du chargement des commentaires:', err);
            // Fallback
            if (target.comments && Array.isArray(target.comments)) {
                const newCm = target.comments.filter(cm => !cm.reply)
                const newRep = target.comments.filter(cm => cm.reply)
                setComments(newCm)
                setReplyComments(newRep)
                setShowComments(newCm.slice(0, next))
            }
        } finally {
            setLoading(false);
        }
    }, [target?._id, targetType, auth.token, next, target.comments])

    // Charger quand target ou refreshKey change
    useEffect(() => {
        loadComments()
    }, [loadComments, refreshKey])

    // Fonction pour rafraîchir après les actions
    const handleRefresh = () => {
        console.log('🔄 Rafraîchissement des commentaires...');
        setRefreshKey(prev => prev + 1);
        setNext(5); // Réinitialiser le compteur
    }

    if (!target || !target._id) {
        return <div className="text-muted p-3">Chargement des commentaires...</div>
    }

    if (loading) {
        return <div className="text-center text-muted py-3">Chargement des commentaires...</div>
    }

    return (
        <div className="comments">
            <InputComment 
                target={target} 
                targetType={targetType || 'video'}
                onReply={null}
                setOnReply={null}
                onCommentAdded={handleRefresh}
            />
            
            {showComments.length === 0 ? (
                <div className="text-center text-muted py-3">
                    Aucun commentaire pour le moment. Soyez le premier à commenter !
                </div>
            ) : (
                showComments.map((comment, index) => (
                    <CommentDisplay 
                        key={comment._id || index}
                        comment={comment}
                        target={target}
                        targetType={targetType || 'video'}
                        replyCm={replyComments.filter(item => item.reply === comment._id)}
                        onCommentDeleted={handleRefresh}
                        onCommentUpdated={handleRefresh}
                    />
                ))
            )}
            
            {comments.length > next && (
                <div 
                    className="p-2 border-top text-center"
                    style={{cursor: 'pointer', color: '#0a84ff'}}
                    onClick={() => setNext(prev => prev + 5)}
                >
                    Voir plus de commentaires ({comments.length - next} restants)
                </div>
            )}
        </div>
    )
}

export default Comments