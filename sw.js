// Service worker: guarda a "casca" da app para abrir depressa e permitir instalação.
// Quando publicar uma versão nova, aumente o número em VERSAO.
const VERSAO = "v1";
const CASCA = ["./", "index.html", "manifest.json", "imgs.js", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSAO).then(c => c.addAll(CASCA)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;                       // pedidos à API (POST) nunca são guardados
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;             // só ficheiros da própria app
  // rede primeiro (para receber actualizações); se falhar, usa a cópia guardada
  e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(VERSAO).then(x => x.put(r, c)); return res; }).catch(() => caches.match(r).then(m => m || caches.match("index.html"))));
});
