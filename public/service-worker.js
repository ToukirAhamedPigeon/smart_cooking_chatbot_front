// public/service-worker.js

console.log('Service Worker loaded');

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  // Activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  // Take control of all clients immediately
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Optional: implement caching here
  // Example:
  // event.respondWith(
  //   caches.match(event.request).then(response => response || fetch(event.request))
  // );
});
