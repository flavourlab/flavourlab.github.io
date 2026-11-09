// Flavour Lab · funziona anche senza rete.
// Le pagine si chiedono prima alla rete (così gli aggiornamenti arrivano subito) e, se manca, alla copia salvata;
// script, stili, icone e caratteri hanno nomi con impronta di versione: si servono dalla copia salvata.
const V = 'flavourlab-v1';
const CORE = ['./', './index.html', './manifest.webmanifest', './favicon.svg', './icon-192.png'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).catch(() => {})); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put('./index.html', cp)); return res; })
      .catch(() => caches.match('./index.html').then(x => x || caches.match('./'))));
    return;
  }
  const fonts = /fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if (u.origin !== self.location.origin && !fonts) return;
  e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => {
    if (res && (res.ok || res.type === 'opaque')) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); }
    return res;
  })));
});
