const CACHE = 'divino-app-v2'

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.add('/divinotv.jpg')))
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ))
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  const url = new URL(e.request.url)

  // HTML sempre da rede (evita servir index.html antigo com chunks velhos)
  if (url.pathname === '/' || url.pathname.endsWith('.html')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)))
    return
  }

  // Assets com hash (Vite fingerprinting) → cache-first são imutáveis
  if (url.pathname.startsWith('/assets/')) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached
        return fetch(e.request).then(res => {
          if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()))
          return res
        })
      })
    )
    return
  }

  // Todo o resto: rede primeiro
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)))
})
