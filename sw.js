const CACHE_NAME = 'radiologia-pro-v2'; // Subimos la versión para que los teléfonos actualicen los archivos

// Lista actualizada con los nombres de las 4 imágenes reales
const assetsToCache = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './imagen1.jpg',
  './imagen2.jpg',
  './imagen3.jpg',
  './imagen4.jpg',
  'https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Archivos e imágenes cacheados exitosamente');
        return cache.addAll(assetsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Limpiando caché antigua');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
