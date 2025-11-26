const CACHE_NAME = 'realnews-v1';
const OFFLINE_URL = '/offline.html';

// Keshlanishi kerak bo'lgan asosiy resurslar
const STATIC_CACHE = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  // CSS va JS fayllar avtomatik qo'shiladi
];

// Keshlanishi kerak bo'lgan API so'rovlar
const API_CACHE = [
  '/api/categories',
  '/api/articles',
  '/api/articles/featured',
  '/api/articles/breaking',
  '/api/articles/trending'
];

// Service Worker o'rnatilganda
self.addEventListener('install', event => {
  console.log('[SW] Install hodisasi');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Asosiy resurslarni keshlash');
        return cache.addAll(STATIC_CACHE);
      })
      .then(() => {
        // Yangi SW ni darhol faollashtirish
        return self.skipWaiting();
      })
  );
});

// Service Worker faollashganda
self.addEventListener('activate', event => {
  console.log('[SW] Activate hodisasi');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Eski keshllarni o'chirish
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Eski keshni o\'chirish:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Barcha tablarni yangi SW bilan boshqarish
        return self.clients.claim();
      })
  );
});

// So'rovlarni tutish va keshdan javob berish
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Faqat GET so'rovlarini keshlaymiz
  if (request.method !== 'GET') {
    return;
  }

  // HTML sahifalar uchun
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Javobni keshga saqlash
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(request, responseClone));
          return response;
        })
        .catch(() => {
          // Offline holatda keshdan qaytarish
          return caches.match(request)
            .then(response => response || caches.match('/'));
        })
    );
    return;
  }

  // API so'rovlar uchun
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Faqat muvaffaqiyatli javoblarni keshlaymiz
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // Offline holatda keshdan qaytarish
          return caches.match(request);
        })
    );
    return;
  }

  // Statik resurslar uchun (JS, CSS, rasmlar)
  if (request.url.includes('/assets/') || 
      request.url.includes('.js') || 
      request.url.includes('.css') ||
      request.url.includes('.png') ||
      request.url.includes('.jpg') ||
      request.url.includes('.svg')) {
    
    event.respondWith(
      caches.match(request)
        .then(response => {
          if (response) {
            return response;
          }
          
          return fetch(request)
            .then(response => {
              // Javobni keshga saqlash
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(request, responseClone));
              return response;
            });
        })
    );
  }
});

// Push-bildirishnoma uchun
self.addEventListener('push', event => {
  console.log('[SW] Push bildirishnoma olingan');
  
  let data = {};
  if (event.data) {
    data = event.data.json();
  }

  const options = {
    title: data.title || 'RealNews - Yangi xabar',
    body: data.body || 'Yangi yangilik paydo bo\'ldi!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: {
      url: data.url || '/'
    },
    actions: [
      {
        action: 'view',
        title: 'Ko\'rish'
      },
      {
        action: 'close',
        title: 'Yopish'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Bildirishnomaga bosilganda
self.addEventListener('notificationclick', event => {
  console.log('[SW] Bildirishnomagaclick');
  
  event.notification.close();

  if (event.action === 'view' || !event.action) {
    const url = event.notification.data?.url || '/';
    
    event.waitUntil(
      clients.openWindow(url)
    );
  }
});