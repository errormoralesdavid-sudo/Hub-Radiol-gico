const CACHE_NAME = 'radiologia-pro-v1';

// Archivos que guardaremos en el teléfono del usuario
const assetsToCache = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js'
];

// Evento de Instalación (Guarda los archivos en caché)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Archivos cacheados exitosamente');
        return cache.addAll(assetsToCache);
      })
  );
});

// Evento de Activación (Limpia cachés viejos si actualizamos la app)
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

// Evento Fetch (Intercepta peticiones. Si no hay internet, sirve desde la caché)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si el archivo está en caché, lo devuelve. Si no, va a internet.
        return response || fetch(event.request);
      })
  );
});
