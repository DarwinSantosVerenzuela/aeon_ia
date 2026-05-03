// Aeon IA — Service Worker v2.0
// Estrategia: Network First para todo, Cache para offline fallback
// NUNCA cachea chunks de Next.js para evitar stale content

const CACHE_VERSION = 'v2.0.0';
const STATIC_CACHE = `aeon-static-${CACHE_VERSION}`;

// Solo pre-cachear assets inmutables (iconos, manifest)
const PRECACHE_ASSETS = [
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/brand/symbol-dark.png',
  '/brand/text-dark.png',
];

// ────────────────────────────────────────────
// INSTALL — pre-cachear assets inmutables
// ────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// ────────────────────────────────────────────
// ACTIVATE — limpiar TODOS los caches anteriores
// ────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE)
          .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// ────────────────────────────────────────────
// FETCH — Network First siempre
// Solo cachea assets inmutables (iconos, brand)
// NUNCA intercepta /_next/ chunks ni páginas HTML
// ────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // No interceptar: non-GET, API, HMR, Next.js chunks
  if (request.method !== 'GET') return;
  if (url.pathname.startsWith('/api/')) return;
  if (url.pathname.startsWith('/_next/')) return;
  if (url.pathname.includes('webpack-hmr')) return;
  if (url.pathname.includes('turbopack')) return;

  // Solo cachear assets estáticos inmutables
  if (
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/brand/') ||
    url.pathname === '/manifest.json' ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.ico')
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Todo lo demás: Network First (páginas HTML, etc.)
  event.respondWith(networkFirst(request));
});

// ────────────────────────────────────────────
// Helpers
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
    return new Response('', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    return await fetch(request);
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response('Aeon IA — Sin conexión', {
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
