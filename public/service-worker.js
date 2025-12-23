const CACHE_NAME = 'smart-cooking-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon-192.png',
  '/favicon-512.png',
  '/offline.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request).then(fetchRes => {
        if (event.request.method === 'GET') {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, fetchRes.clone()));
        }
        return fetchRes;
      })).catch(() => caches.match('/offline.html'))
  );
});
