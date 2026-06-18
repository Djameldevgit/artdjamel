// sw.js - Service Worker con Push Notifications y Sonido
const CACHE_NAME = 'vetements-boutique-v2.3';

const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icon-web-01.png',
  '/sounds/notify.mp3'
];

// Instalación
self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Cache abierto');
        return Promise.all(
          urlsToCache.map((url) => {
            return cache.add(url).catch((error) => {
              console.log(`❌ Error cacheando ${url}:`, error);
            });
          })
        );
      })
      .then(() => {
        console.log('✅ Todos los recursos cacheados');
        return self.skipWaiting();
      })
  );
});

// Activación
self.addEventListener('activate', (event) => {
  console.log('🎯 Service Worker activado');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eliminando cache antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// ============================================
// ✅ NOTIFICACIONES PUSH PARA PWA INSTALADA
// ============================================

// ✅ Escuchar mensajes del cliente
self.addEventListener('message', (event) => {
  console.log('📨 Mensaje recibido en SW:', event.data);
  
  if (event.data?.type === 'PLAY_SOUND') {
    const audioUrl = event.data.url || '/sounds/notify.mp3';
    
    caches.match(audioUrl).then(response => {
      if (response) {
        console.log('🔊 Sonido encontrado en cache');
      }
    });
  }
});

// ✅ Recibir notificación push
self.addEventListener('push', (event) => {
  console.log('📨 Push notification recibida:', event);
  
  let notificationData = {
    title: 'MarketPlace',
    body: 'Vous avez une nouvelle notification',
    icon: '/icon-web-01.png',
    badge: '/icon-web-01.png',
    vibrate: [200, 100, 200, 100, 400],
    tag: Date.now().toString(),
    renotify: true,
    requireInteraction: true,
    data: {
      url: '/'
    }
  };
  
  // Extraer datos del push
  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = { ...notificationData, ...payload };
      console.log('📦 Datos de notificación:', notificationData);
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }
  
  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    vibrate: notificationData.vibrate,
    tag: notificationData.tag,
    renotify: notificationData.renotify,
    requireInteraction: notificationData.requireInteraction,
    actions: [
      { action: 'open', title: 'Ouvrir' },
      { action: 'close', title: 'Fermer' }
    ],
    data: notificationData.data
  };
  
  // Intentar usar el sonido personalizado (si el navegador lo soporta)
  if ('sound' in options) {
    options.sound = '/sounds/notify.mp3';
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// ✅ Manejar click en notificación
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Click en notificación:', event);
  event.notification.close();
  
  const action = event.action;
  const urlToOpen = event.notification.data?.url || '/';
  
  if (action === 'close') {
    return;
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        for (let client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// ✅ Manejar cierre de notificación
self.addEventListener('notificationclose', (event) => {
  console.log('❌ Notificación cerrada');
});

// ============================================
// FETCH - Estrategia de cache
// ============================================

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // API - Network First
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // HTML - Network First
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => caches.match('/').then(cached => cached || new Response('Offline', { status: 503 })))
    );
    return;
  }

  // Sonidos - Network First con fallback a cache
  if (event.request.url.includes('/sounds/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Recursos estáticos - Cache First
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        
        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') return response;
            
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
            return response;
          })
          .catch(() => {
            if (event.request.destination === 'image') {
              return new Response('', { status: 404 });
            }
            return new Response('Offline', { status: 503 });
          });
      })
  );
});