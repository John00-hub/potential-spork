const CACHE_NAME = 'timeout-restaurant-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/admin.html',
  '/contact.html',
  '/check-out.html',
  '/main.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-180.png'
];

// Install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).catch(() => caches.match('/index.html'));
    })
  );
});
