const CACHE = 'tech-camps-spacex-v3'
const CORE = ['/', '/offline-cards.html', '/manifest.webmanifest', '/icons/rocket.svg', '/icons/rocket-180.png', '/icons/rocket-192.png', '/icons/rocket-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()))
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then((response) => {
      const copy = response.clone()
      void caches.open(CACHE).then((cache) => cache.put(request, copy))
      return response
    }).catch(async () => (await caches.match('/offline-cards.html')) || (await caches.match('/'))))
    return
  }

  if (/\.(?:js|css|svg|png|jpe?g|webp|woff2?)$/i.test(url.pathname)) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok) void caches.open(CACHE).then((cache) => cache.put(request, response.clone()))
      return response
    })))
  }
})
