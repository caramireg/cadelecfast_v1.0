const CACHE_NAME = 'cadelec-fast-offline-v2.2';

const OFFLINE_ASSETS = [
  './',
  './index.html',
  './app.html',
  './manifest.json',
  './CADELEC.png',
  './logo.png',
  './logo.ico',
  './simbolos/Tablero.png',
  './simbolos/tomacorriente.png',
  './simbolos/luminaria.png',
  './simbolos/Interruptor%20sencillo.png',
  './simbolos/Interruptor%20conmutado.png',
  './Dise%C3%B1os/Designer1.png',
  './Dise%C3%B1os/Designer%202.png',
  './Dise%C3%B1os/Designer%203.png',
  './Dise%C3%B1os/Designer%204.png',
  './Dise%C3%B1os/Designer%205.png',
  './Dise%C3%B1os/Designer%206.png',
  './Dise%C3%B1os/Designer%207.png',
  './Dise%C3%B1os/Designer%208.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of OFFLINE_ASSETS) {
        try {
          await cache.add(asset);
        } catch (_) {}
      }
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      if (cachedResponse) {
        // Actualizar en segundo plano si hay internet (Stale-While-Revalidate)
        fetch(event.request)
          .then((netRes) => {
            if (netRes && netRes.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, netRes.clone()));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }
      return fetch(event.request)
        .then((netRes) => {
          if (netRes && netRes.status === 200 && netRes.type === 'basic') {
            const clone = netRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return netRes;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('./app.html') || caches.match('./index.html');
          }
        });
    })
  );
});
