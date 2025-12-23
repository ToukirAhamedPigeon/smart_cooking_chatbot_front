// public/service-worker.js

console.log('Service Worker loaded');

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting(); // activate immediately
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  self.clients.claim(); // take control immediately
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open('static-v1').then(cache =>
      cache.match(event.request).then(response => {
        // Return cached response if available
        if (response) return response;

        // Otherwise fetch from network and cache it
        return fetch(event.request).then(networkResponse => {
          // Only cache successful GET requests
          if (event.request.method === 'GET' && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // Optionally return a fallback for failed requests
          return caches.match('/offline.html'); // optional offline page
        });
      })
    )
  );
});
