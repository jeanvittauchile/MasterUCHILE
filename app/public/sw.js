/**
 * Service worker de la PWA — cacheo estratégico, sin dependencias externas (sin Workbox).
 *
 * Estrategias:
 * - Navegación (HTML)              → network-first, cae a la shell cacheada si no hay red.
 * - Assets estáticos propios       → cache-first (nombres de archivo con hash: /_expo/, /assets/, /icons/).
 * - Llamadas GET a la API (cross-origin, ej. masteruchile-api.vercel.app) → network-first,
 *   cachea la respuesta para poder verla offline; los métodos de escritura (POST/PATCH/PUT/DELETE)
 *   nunca se cachean ni se sirven desde caché — siempre van directo a red.
 */

const VERSION = 'v1';
const SHELL_CACHE = `shell-${VERSION}`;
const STATIC_CACHE = `static-${VERSION}`;
const API_CACHE = `api-${VERSION}`;
const CURRENT_CACHES = [SHELL_CACHE, STATIC_CACHE, API_CACHE];

const SHELL_URLS = ['/', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((n) => !CURRENT_CACHES.includes(n)).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

function isStaticAsset(url) {
  return url.origin === self.location.origin && (
    url.pathname.startsWith('/_expo/') ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/favicon.ico'
  );
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw err;
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) cache.put(request, response.clone());
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return; // nunca interceptar escrituras

  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirst(request, SHELL_CACHE).catch(() => caches.match('/')),
    );
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  if (url.origin !== self.location.origin) {
    // Llamadas a la API (otro origen): datos frescos si hay red, últimos datos vistos si no.
    event.respondWith(networkFirst(request, API_CACHE));
  }
});
