// sw.js - Service Worker avec notifications push et son (version Djamel Art)

const CACHE_NAME = 'djamel-art-v1.0';

const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icon-web-01.png',
  '/sounds/notify.mp3'
];

// Installation
self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker en cours d\'installation...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Cache ouvert');
        return Promise.all(
          urlsToCache.map((url) => {
            return cache.add(url).catch((error) => {
              console.log(`❌ Erreur lors de la mise en cache de ${url} :`, error);
            });
          })
        );
      })
      .then(() => {
        console.log('✅ Toutes les ressources sont en cache');
        return self.skipWaiting();
      })
  );
});

// Activation
self.addEventListener('activate', (event) => {
  console.log('🎯 Service Worker activé');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Suppression de l\'ancien cache :', cacheName);
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
// ✅ NOTIFICATIONS PUSH POUR PWA INSTALLÉE
// ============================================

// Écoute des messages du client
self.addEventListener('message', (event) => {
  console.log('📨 Message reçu dans le SW :', event.data);
  
  if (event.data?.type === 'PLAY_SOUND') {
    const audioUrl = event.data.url || '/sounds/notify.mp3';
    
    caches.match(audioUrl).then(response => {
      if (response) {
        console.log('🔊 Son trouvé dans le cache');
      }
    });
  }
});

// Réception d'une notification push
self.addEventListener('push', (event) => {
  console.log('📨 Notification push reçue :', event);
  
  let notificationData = {
    title: 'Djamel Art',
    body: 'Nouvelle œuvre d\'art disponible !',
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
  
  // Extraction des données du push
  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = { ...notificationData, ...payload };
      console.log('📦 Données de notification :', notificationData);
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
  
  // Tentative d'utilisation du son personnalisé (si le navigateur le supporte)
  if ('sound' in options) {
    options.sound = '/sounds/notify.mp3';
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Gestion du clic sur une notification
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Clic sur la notification :', event);
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

// Gestion de la fermeture de la notification
self.addEventListener('notificationclose', (event) => {
  console.log('❌ Notification fermée');
});

// ============================================
// FETCH - Stratégie de cache
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
        .catch(() => caches.match('/').then(cached => cached || new Response('Hors ligne', { status: 503 })))
    );
    return;
  }

  // Sons - Network First avec fallback cache
  if (event.request.url.includes('/sounds/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Ressources statiques - Cache First
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
            return new Response('Hors ligne', { status: 503 });
          });
      })
  );
});