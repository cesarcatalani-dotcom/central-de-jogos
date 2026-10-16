const CACHE_NAME = 'jogos-filosoficos-v4';

// Lista de todos os arquivos do PWA para funcionamento sem internet
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192-v2.png',
  './jogos/mario-empatia.html',
  './jogos/filo-race.html',
  './jogos/filo-race-alienacao.html',
  './jogos/tarefa-sp-3.html',
  './jogos/tarefa-sp-quatro.html',
  './jogos/revisao-provao-3.html'
];

// Instalação do Service Worker e gravação do Cache
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estratégia de busca: tenta buscar na rede primeiro e, se estiver offline, responde com o cache
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && e.request.method === 'GET') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseClone));
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(e.request);
      })
  );
});
