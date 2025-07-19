
const cacheName = 'vpm-cache-v1';
const resourcesToPrecache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/service-worker.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(resourcesToPrecache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
