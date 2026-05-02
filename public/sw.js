// Aeon IA — Service Worker v1.0
// Estrategia: Cache First para assets estáticos, Network First para API

const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE = `aeon-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `aeon-dynamic-${CACHE_VERSION}`;

// Assets que se pre-cachean al instalar
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// ────────────────────────────────────────────
// INSTALL — pre-cachear assets críticos
// ────────────────────────────────────────────
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Aeon IA Service Worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Pre-caching critical assets');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// ────────────────────────────────────────────
// ACTIVATE — limpiar caches obsoletos
// ────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Aeon IA Service Worker...');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// ────────────────────────────────────────────
// FETCH — estrategia híbrida
// ────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requests no-GET y requests de la API
  if (request.method !== 'GET') return;
  if (url.pathname.startsWith('/api/')) return;
  if (url.pathname.startsWith('/_next/webpack-hmr')) return;

  // Assets estáticos: Cache First
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname === '/manifest.json'
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Páginas HTML: Network First con fallback a cache
  event.respondWith(networkFirst(request));
});

// ────────────────────────────────────────────
// Helpers de estrategia
// ────────────────────────────────────────────
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Recurso no disponible offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Fallback offline page
    const offlinePage = await caches.match('/');
    return offlinePage || new Response('Aeon IA — Sin conexión', {
      status: 503,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// ────────────────────────────────────────────
// PUSH NOTIFICATIONS (preparado para futuro)
// ────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  self.registration.showNotification(data.title || 'Aeon IA', {
    body: data.body || 'Nueva notificación',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
  });
});
