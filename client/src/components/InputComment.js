import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { createComment } from '../redux/actions/commentAction'

const InputComment = ({ target, onReply, setOnReply, targetType, onCommentAdded }) => {
    const [content, setContent] = useState('')
    const { auth, socket } = useSelector(state => state)
    const dispatch = useDispatch()

    console.log('📝 InputComment - auth:', auth);
    console.log('📝 InputComment - auth.token:', auth?.token);
    console.log('📝 InputComment - auth.user:', auth?.user);

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!content.trim()) {
            if (setOnReply) setOnReply(false)
            return
        }

        // Si pas de token, rediriger vers login
        if (!auth?.token) {
            console.error('❌ Utilisateur non connecté');
            window.location.href = '/login';
            return
        }

        if (!target || !target._id) {
            console.error('❌ Target invalide');
            return
        }

        const newComment = {
            content,
            likes: [],
            user: auth.user,
            createdAt: new Date().toISOString(),
            reply: onReply?.commentId || null,
            tag: onReply?.user || null
        }
        
        console.log('📤 Envoi du commentaire:', newComment);
        
        setContent('')
        
        await dispatch(createComment({ 
            target, 
            newComment, 
            auth, 
            socket, 
            targetType: targetType || 'video' 
        }))
        
        if (onCommentAdded) {
            console.log('🔄 Appel onCommentAdded');
            onCommentAdded()
        }
        
        if (setOnReply) setOnReply(false)
    }

    // Afficher champ désactivé si l'utilisateur n'est pas connecté
    if (!auth?.token) {
        return (
            <form onSubmit={handleSubmit} style={{ 
                display: 'flex', 
                padding: '10px', 
                gap: '10px',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
                <input 
                    type="text" 
                    placeholder="Connectez-vous pour commenter..."
                    disabled
                    style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '20px',
                        border: '1px solid #ccc',
                        background: '#f0f0f0',
                        color: '#999'
                    }}
                />
                <button 
                    type="button" 
                    style={{ 
                        padding: '10px 20px', 
                        borderRadius: '20px', 
                        background: '#ccc', 
                        color: 'white', 
                        border: 'none',
                        cursor: 'not-allowed'
                    }}
                    disabled
                >
                    Publier
                </button>
            </form>
        )
    }

    return (
        <form onSubmit={handleSubmit} style={{ 
            display: 'flex', 
            padding: '10px', 
            gap: '10px',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
            <input 
                type="text" 
                placeholder="Ajouter un commentaire..."
                value={content} 
                onChange={e => setContent(e.target.value)}
                style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '20px',
                    border: '1px solid #ccc',
                    background: 'white',
                    color: 'black'
                }}
                autoFocus
            />
            <button 
                type="submit" 
                style={{ 
                    padding: '10px 20px', 
                    borderRadius: '20px', 
                    background: content.trim() ? '#0a84ff' : '#ccc', 
                    color: 'white', 
                    border: 'none',
                    cursor: content.trim() ? 'pointer' : 'not-allowed'
                }}
                disabled={!content.trim()}
            >
                Publier
            </button>
        </form>
    )
}

export default InputComment