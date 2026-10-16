const CACHE_NAME = 'jogos-filosoficos-v2';

// Arquivos que serão salvos para funcionar sem internet
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192-v2.png',
  './jogos/mario-empatia.html',
  './jogos/filo-race.html',
  './jogos/filo-race-alienacao.html' // <--- Novo jogo adicionado ao Cache
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

// Limpeza de caches antigos quando atualizar o app
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

// Estratégia de busca: busca na rede primeiro, se estiver sem internet carrega do cache offline
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        // Atualiza o cache silenciosamente enquanto houver conexão
        if (networkResponse && networkResponse.status === 200 && e.request.method === 'GET') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseClone));
        }
        return networkResponse;
      })
      .catch(() => {
        // Se estiver sem internet (offline), serve o arquivo direto do cache
        return caches.match(e.request);
      })
  );
});
