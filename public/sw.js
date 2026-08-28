const CACHE = 'low-energy-menu-v2';
const SHELL = ['/', '/index.html', '/privacy/', '/terms/', '/offline.html', '/manifest.webmanifest', '/icons/icon.svg', '/icons/icon-192.png', '/icons/icon-512.png', '/assets/week-rhythm.webp'];
self.addEventListener('install', (event) => event.waitUntil((async () => {
  const cache = await caches.open(CACHE);
  await cache.addAll(SHELL);
  const index = await cache.match('/');
  const html = await index.text();
  const builtAssets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((match) => match[1]);
  await Promise.all([...new Set(builtAssets)].map(async (asset) => {
    const response = await fetch(asset, { cache: 'reload' });
    if (response.ok) await cache.put(asset, response);
  }));
})()));
self.addEventListener('activate', (event) => event.waitUntil(Promise.all([
  caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))),
  self.clients.claim(),
])));
self.addEventListener('message', (event) => { if (event.data?.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match(event.request, { ignoreVary: true }).then((hit) => hit || caches.match('/', { ignoreVary: true }) || caches.match('/offline.html', { ignoreVary: true }))));
    return;
  }
  event.respondWith(caches.match(event.request, { ignoreVary: true }).then((hit) => hit || fetch(event.request).then((response) => {
    if (response.ok) caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()));
    return response;
  })));
});
