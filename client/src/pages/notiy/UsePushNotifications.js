// hooks/usePushNotifications.js
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

// Convertir VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const usePushNotifications = () => {
  const { auth } = useSelector(state => state);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState(Notification.permission);

  // Detectar si es PWA instalada
  const isPWAInstalled = () => {
    return window.matchMedia('(display-mode: standalone)').matches || 
           window.navigator.standalone ||
           localStorage.getItem('pwaInstalled') === 'true';
  };

  // Registrar Service Worker y suscribirse
  const subscribeToPush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('❌ Push no soportado en este navegador');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Verificar suscripción existente
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('✅ Ya existe una suscripción push');
        setIsSubscribed(true);
        return true;
      }

      // VAPID key pública (necesitas generar una)
      const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY;
      
      if (!VAPID_PUBLIC_KEY) {
        console.warn('⚠️ VAPID key no configurada');
        return false;
      }

      // Crear nueva suscripción
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      console.log('✅ Suscrito a push notifications');
      
      // Enviar suscripción al backend
      if (auth?.token) {
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.token}`
          },
          body: JSON.stringify(subscription)
        });
      }
      
      setIsSubscribed(true);
      return true;
    } catch (error) {
      console.error('❌ Error suscribiendo a push:', error);
      return false;
    }
  };

  // Solicitar permiso de notificación
  const requestNotificationPermission = async () => {
    if (permission === 'granted') return true;
    if (permission === 'denied') return false;
    
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        console.log('✅ Permiso de notificación concedido');
        return true;
      }
    } catch (error) {
      console.error('❌ Error pidiendo permiso:', error);
    }
    return false;
  };

  // Inicializar
  useEffect(() => {
    const initPushNotifications = async () => {
      if (!isPWAInstalled()) {
        console.log('📱 No es PWA instalada, push no necesario');
        return;
      }
      
      if (!('serviceWorker' in navigator)) {
        console.log('❌ Service Worker no soportado');
        return;
      }
      
      // Esperar que el SW esté listo
      await navigator.serviceWorker.ready;
      
      // Solo pedir permiso después de interacción
      const handleInteraction = async () => {
        const hasPermission = await requestNotificationPermission();
        if (hasPermission && auth?.token) {
          await subscribeToPush();
        }
        window.removeEventListener('click', handleInteraction);
        window.removeEventListener('touchstart', handleInteraction);
      };
      
      window.addEventListener('click', handleInteraction);
      window.addEventListener('touchstart', handleInteraction);
    };
    
    initPushNotifications();
  }, [auth?.token]);

  // Enviar notificación local (para app abierta)
  const sendLocalNotification = async (title, body, url = '/', icon = '/icon-web-01.png') => {
    if (isPWAInstalled() && 'serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      registration.showNotification(title, {
        body: body,
        icon: icon,
        badge: icon,
        vibrate: [200, 100, 200],
        sound: '/sounds/notify.mp3',
        data: { url: url }
      });
    }
  };

  return {
    isSubscribed,
    permission,
    requestNotificationPermission,
    subscribeToPush,
    sendLocalNotification,
    isPWAInstalled: isPWAInstalled()
  };
};

export default usePushNotifications;