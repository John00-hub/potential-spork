/* ===================================================
   Timeout Restaurant — Service Worker  v1.0
   Scope: /
   Strategy:
     • Shell + core assets  →  Cache-first (offline works)
     • Menu images          →  Stale-while-revalidate
     • API / Paystack / FB  →  Network-only (never cache)
=================================================== */

const CACHE_NAME    = 'timeout-v3'; /* v3: ad-traffic conversion pass — forces fresh shell */
const RUNTIME_CACHE = 'timeout-images-v3';

/* ─── Core shell: cached on install ─── */
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/main.js',
  '/redesign.css',
  '/redesign.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-180.png',
  /* key menu images — add more as needed */
  '/images/jollof-chicken.webp',
  '/images/jollof-rice.webp',
  '/images/fried-rice.webp',
  '/images/logo.png'
];

/* ─── Never cache these origins / paths ─── */
const NETWORK_ONLY = [
  'js.paystack.co',
  'api.paystack.co',
  'firebaseio.com',
  'gstatic.com',
  'googletagmanager.com',
  'connect.facebook.net',
  'api.web3forms.com',
  'emailjs.com'
];

function isNetworkOnly(url) {
  return NETWORK_ONLY.some(host => url.includes(host));
}

function isImageRequest(url) {
  return /\.(webp|png|jpg|jpeg|gif|svg|ico)(\?.*)?$/.test(url);
}

/* ════════════ INSTALL ════════════ */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* ════════════ ACTIVATE ════════════ */
self.addEventListener('activate', event => {
  const KEEP = new Set([CACHE_NAME, RUNTIME_CACHE]);
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => !KEEP.has(k)).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* ════════════ FETCH ════════════ */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = request.url;

  /* Only handle GET */
  if (request.method !== 'GET') return;

  /* Never cache payments, analytics, Firebase */
  if (isNetworkOnly(url)) return;

  /* Images: stale-while-revalidate */
  if (isImageRequest(url)) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }

  /* Everything else: cache-first → network → offline fallback */
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request)
        .then(response => {
          /* Cache successful same-origin responses */
          if (
            response.ok &&
            response.type === 'basic' &&
            !url.includes('admin')     /* don't cache admin panel */
          ) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(c => c.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          /* Offline fallback: return cached homepage for navigation requests */
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
    })
  );
});

/* ─── Stale-While-Revalidate helper ─── */
function staleWhileRevalidate(request, cacheName) {
  return caches.open(cacheName).then(cache => {
    return cache.match(request).then(cached => {
      const networkFetch = fetch(request).then(response => {
        if (response.ok) cache.put(request, response.clone());
        return response;
      }).catch(() => cached); /* offline: return stale */
      return cached || networkFetch;
    });
  });
}
