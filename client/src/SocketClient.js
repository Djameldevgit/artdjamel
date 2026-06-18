import React, { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { VIDEO_TYPES } from './redux/actions/videoAction'
import { GLOBALTYPES } from './redux/actions/globalTypes'
import { NOTIFY_TYPES } from './redux/actions/notifyAction'
import { MESS_TYPES } from './redux/actions/messageAction'

import audiobell from './audio/got-it-done-613.mp3'

const spawnNotification = (body, icon, url, title) => {
    let options = {
        body, icon
    }
    let n = new Notification(title, options)

    n.onclick = e => {
        e.preventDefault()
        window.open(url, '_blank')
    }
}

const SocketClient = () => {
    const { auth, socket, notify, online, call } = useSelector(state => state)
    const dispatch = useDispatch()

    const audioRef = useRef()

    // joinUser
    useEffect(() => {
        socket.emit('joinUser', auth.user)
    },[socket, auth.user])

    // ============================================
    // LIKES EN VIDEOS (cambiado de likes en posts)
    // ============================================
    useEffect(() => {
        socket.on('likeVideoToClient', newVideo =>{
            dispatch({type: VIDEO_TYPES.UPDATE_VIDEO, payload: newVideo})
        })

        return () => socket.off('likeVideoToClient')
    },[socket, dispatch])

    useEffect(() => {
        socket.on('unLikeVideoToClient', newVideo =>{
            dispatch({type: VIDEO_TYPES.UPDATE_VIDEO, payload: newVideo})
        })

        return () => socket.off('unLikeVideoToClient')
    },[socket, dispatch])

    useEffect(() => {
        socket.on('newVideoNotification', (data) => {
          console.log('📹 Nueva notificación de video:', data);
          
          // Mostrar alerta
          dispatch({
            type: GLOBALTYPES.ALERT,
            payload: { info: data.text }
          });
          
          // También crear notificación en el sistema
          dispatch({
            type: NOTIFY_TYPES.CREATE_NOTIFY,
            payload: {
              ...data,
              user: { username: data.sender?.username, avatar: data.sender?.avatar }
            }
          });
          
          // Notificación de escritorio
          if (notify.sound) {
            audioRef.current?.play();
          }
          spawnNotification(
            data.text,
            data.image,
            data.url,
            'Nouvelle vidéo'
          );
        });
      
        return () => socket.off('newVideoNotification');
      }, [socket, dispatch, notify.sound]);
useEffect(() => {
    socket.on('createCommentVideoToClient', newVideo =>{
        dispatch({type: VIDEO_TYPES.UPDATE_VIDEO, payload: newVideo})
    })
    return () => socket.off('createCommentVideoToClient')
},[socket, dispatch])

useEffect(() => {
    socket.on('deleteCommentVideoToClient', newVideo =>{
        dispatch({type: VIDEO_TYPES.UPDATE_VIDEO, payload: newVideo})
    })
    return () => socket.off('deleteCommentVideoToClient')
},[socket, dispatch])

    // ============================================
    // VISTAS DE VIDEOS (nuevo)
    // ============================================
    useEffect(() => {
        socket.on('viewVideoToClient', newVideo =>{
            dispatch({type: VIDEO_TYPES.UPDATE_VIDEO, payload: newVideo})
        })

        return () => socket.off('viewVideoToClient')
    },[socket, dispatch])

    // ============================================
    // COMPARTIR VIDEOS (nuevo)
    // ============================================
    useEffect(() => {
        socket.on('shareVideoToClient', newVideo =>{
            dispatch({type: VIDEO_TYPES.UPDATE_VIDEO, payload: newVideo})
        })

        return () => socket.off('shareVideoToClient')
    },[socket, dispatch])

    // ============================================
    // FOLLOW / UNFOLLOW (sin cambios)
    // ============================================
    useEffect(() => {
        socket.on('followToClient', newUser =>{
            dispatch({type: GLOBALTYPES.AUTH, payload: {...auth, user: newUser}})
        })

        return () => socket.off('followToClient')
    },[socket, dispatch, auth])

    useEffect(() => {
        socket.on('unFollowToClient', newUser =>{
            dispatch({type: GLOBALTYPES.AUTH, payload: {...auth, user: newUser}})
        })

        return () => socket.off('unFollowToClient')
    },[socket, dispatch, auth])

    // ============================================
    // NOTIFICACIONES (actualizado para videos)
    // ============================================
    useEffect(() => {
        socket.on('createNotifyToClient', msg =>{
            dispatch({type: NOTIFY_TYPES.CREATE_NOTIFY, payload: msg})

            if(notify.sound) audioRef.current.play()
            spawnNotification(
                msg.user.username + ' ' + msg.text,
                msg.user.avatar,
                msg.url,
                'Video Commerce'
            )
        })

        return () => socket.off('createNotifyToClient')
    },[socket, dispatch, notify.sound])

    useEffect(() => {
        socket.on('removeNotifyToClient', msg =>{
            dispatch({type: NOTIFY_TYPES.REMOVE_NOTIFY, payload: msg})
        })

        return () => socket.off('removeNotifyToClient')
    },[socket, dispatch])

    // ============================================
    // MENSAJES (sin cambios)
    // ============================================
    useEffect(() => {
        socket.on('addMessageToClient', msg =>{
            dispatch({type: MESS_TYPES.ADD_MESSAGE, payload: msg})

            dispatch({
                type: MESS_TYPES.ADD_USER, 
                payload: {
                    ...msg.user, 
                    text: msg.text, 
                    media: msg.media
                }
            })
        })

        return () => socket.off('addMessageToClient')
    },[socket, dispatch])

    // ============================================
    // CHECK USER ONLINE / OFFLINE (sin cambios)
    // ============================================
    useEffect(() => {
        socket.emit('checkUserOnline', auth.user)
    },[socket, auth.user])

    useEffect(() => {
        socket.on('checkUserOnlineToMe', data =>{
            data.forEach(item => {
                if(!online.includes(item.id)){
                    dispatch({type: GLOBALTYPES.ONLINE, payload: item.id})
                }
            })
        })

        return () => socket.off('checkUserOnlineToMe')
    },[socket, dispatch, online])

    useEffect(() => {
        socket.on('checkUserOnlineToClient', id =>{
            if(!online.includes(id)){
                dispatch({type: GLOBALTYPES.ONLINE, payload: id})
            }
        })

        return () => socket.off('checkUserOnlineToClient')
    },[socket, dispatch, online])

    // ============================================
    // CHECK USER OFFLINE (sin cambios)
    // ============================================
    useEffect(() => {
        socket.on('CheckUserOffline', id =>{
            dispatch({type: GLOBALTYPES.OFFLINE, payload: id})
        })

        return () => socket.off('CheckUserOffline')
    },[socket, dispatch])

    // ============================================
    // CALL USER (sin cambios)
    // ============================================
    useEffect(() => {
        socket.on('callUserToClient', data =>{
            dispatch({type: GLOBALTYPES.CALL, payload: data})
        })

        return () => socket.off('callUserToClient')
    },[socket, dispatch])

    useEffect(() => {
        socket.on('userBusy', data =>{
            dispatch({type: GLOBALTYPES.ALERT, payload: {error: `${call.username} is busy!`}})
        })

        return () => socket.off('userBusy')
    },[socket, dispatch, call])

    return (
        <>
            <audio controls ref={audioRef} style={{display: 'none'}} >
                <source src={audiobell} type="audio/mp3" />
            </audio>
        </>
    )
}

export default SocketClient