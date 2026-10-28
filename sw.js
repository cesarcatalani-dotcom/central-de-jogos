const CACHE_NAME = 'hub-jogos-educativos-v11';

// Lista exata de arquivos para armazenar em cache
const ASSETS_TO_CACHE = [
  'index.html',
  '6º-Aula-3.html',
  'sexto-pv-aula-quatro.html',
  '7º-TI-Aulas-3-4.html',
  'setimo-pv-aula-quatro.html',
  'ti-oitavo-aulas-tres-quatro.html',
  'pv-oitavo-aula-tres.html',
  '9º-Aulas-4.html',
  'nono-pv-aula-cinco.html',
  'nono-acessibilizado-aula-cinco.html',
  'terceira-aula-nove.html',
  'filo-race-alienacao.html',
  'mario-empatia.html',
  'revisao-provao-3.html',
  'revisao-provao-quatro.html',
  'revisao-final.html',
  'tarefa-sp-3.html',
  'tarefa-sp-dois.html',
  'tarefa-sp-quatro.html',
  'tarefa-sp-cinco.html',
  'tsp-cinco-acessibilizada.html',
  'tarefa-sp-seis.html'
];

// Instalação do Service Worker com cache tolerante a falhas
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Armazenando jogos no cache...');
      return Promise.allSettled(
        ASSETS_TO_CACHE.map((url) =>
          cache.add(url).catch((err) => console.warn(`Aviso: Falha ao colocar ${url} no cache:`, err))
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// Ativação e remoção de versões antigas do cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Removendo cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptação de requisições: tenta a rede primeiro; cai para o cache se offline
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === 'navigate') {
            return caches.match('index.html');
          }
        });
      })
  );
});
