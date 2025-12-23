/// <reference lib="webworker" />

// self কে ServiceWorkerGlobalScope হিসেবে ধরুন
declare const self: ServiceWorkerGlobalScope;

self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('Service Worker installing...');
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('Service Worker activated');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event: FetchEvent) => {
  // Optional: Cache API requests or static assets here
  // Example: event.respondWith(fetch(event.request));
});
