
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open('vpm-cache').then(function(cache) {
      return cache.addAll([
        '/',
        '/index.html',
        '/style.css',
        '/script.js'
      ]);
    })
  );
});
