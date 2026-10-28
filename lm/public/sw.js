// Service worker ringan: cache aset hashed + gambar cover, shell offline. /api (termasuk audio) tidak pernah di-cache.
const V = 'lm-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil((async () => { for (const k of await caches.keys()) if (k !== V) await caches.delete(k); await clients.claim(); })()));
const trim = async (c, max) => { const ks = await c.keys(); for (let i = 0; i < ks.length - max; i++) await c.delete(ks[i]); };
self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.pathname.startsWith('/api/')) return;
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then((res) => { const c = res.clone(); caches.open(V).then((x) => x.put('/', c)); return res; }).catch(() => caches.match('/')));
    return;
  }
  const asset = u.origin === location.origin && u.pathname.startsWith('/assets/');
  const img = /(googleusercontent\.com|ytimg\.com)$/.test(u.hostname);
  if (asset || img) e.respondWith(caches.open(V).then(async (c) => {
    const hit = await c.match(r); if (hit) return hit;
    const res = await fetch(r);
    if (res.ok || res.type === 'opaque') { c.put(r, res.clone()); if (img) trim(c, 400); }
    return res;
  }));
});
