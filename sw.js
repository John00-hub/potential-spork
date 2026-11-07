/* ===================================================
   Timeout Restaurant — Service Worker  v1.0
   Scope: /
   Strategy:
     • Pages / navigations  →  Network-first (fresh deploy wins; cache only offline)
     • Images               →  Stale-while-revalidate
     • Other static assets  →  Cache-first
     • API / Paystack / FB  →  Network-only (never cache)
=================================================== */

const CACHE_NAME    = 'timeout-v9'; /* v9: network-first pages, scoped cache cleanup (audit #9) */
const RUNTIME_CACHE = 'timeout-images-v9';
const CACHE_PREFIX  = 'timeout';    /* only ever delete caches we own */

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
      .then(cache => Promise.all(
        PRECACHE_ASSETS.map(asset =>
          cache.add(asset).catch(err => {
            /* One bad entry (e.g. a redirected /index.html) must not
               abort the whole install. */
            console.warn('[sw] precache skipped:', asset, err && err.message);
          })
        )
      ))
      .then(() => self.skipWaiting())
  );
});

/* ════════════ ACTIVATE ════════════ */
self.addEventListener('activate', event => {
  const KEEP = new Set([CACHE_NAME, RUNTIME_CACHE]);
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => !KEEP.has(k))
          .filter(k => k.indexOf(CACHE_PREFIX) === 0)   /* ours only */
          .map(k => caches.delete(k))
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

  /* Pages: network-first, so a new deploy reaches returning visitors */
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  /* Images: stale-while-revalidate */
  if (isImageRequest(url)) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }

  /* Everything else: cache-first, refreshed when it is fetched */
  event.respondWith(cacheFirst(request));
});

/* ─── Network-first for navigations (max 3.5s, then cached shell) ─── */
function networkFirst(request) {
  var timer;
  var cachedFallback = new Promise(function (resolve) {
    timer = setTimeout(function () {
      caches.match(request).then(function (r) {
        resolve(r || caches.match('/') || caches.match('/index.html') || null);
      });
    }, 3500);
  });

  var network = fetch(request).then(function (response) {
    clearTimeout(timer);
    if (response && response.ok && response.type === 'basic' && request.url.indexOf('admin') === -1) {
      var copy = response.clone();
      caches.open(CACHE_NAME).then(function (c) { c.put(request, copy); });
    }
    return response;
  }).catch(function () {
    clearTimeout(timer);
    return caches.match(request).then(function (r) {
      return r || caches.match('/') || caches.match('/index.html');
    });
  });

  return Promise.race([
    network,
    cachedFallback.then(function (r) { return r || network; })
  ]);
}

/* ─── Cache-first for static assets ─── */
function cacheFirst(request) {
  return caches.match(request).then(function (cached) {
    if (cached) return cached;
    return fetch(request).then(function (response) {
      if (response && response.ok && response.type === 'basic' && request.url.indexOf('admin') === -1) {
        var copy = response.clone();
        caches.open(CACHE_NAME).then(function (c) { c.put(request, copy); });
      }
      return response;
    });
  });
}

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
