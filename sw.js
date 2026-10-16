const CACHE_NAME = 'jogos-filosoficos-v2';

// Lista de arquivos para cache offline (incluindo o novo tarefa-sp-dois.html)
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './tarefa-sp-dois.html',
  './jornada-guardiao.html'
];

// Instalação do Service Worker e armazenamento dos recursos no Cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching todos os arquivos do jogo...');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Ativação e limpeza de caches antigos se a versão mudar
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Apagando cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interpelação das requisições (Estratégia: Cache First, fallback para a rede)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Se a requisição for válida, adiciona uma cópia ao cache
        if (event.request.method === 'GET' && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      });
    }).catch(() => {
      // Se estiver totalmente offline e não encontrar o arquivo
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});
