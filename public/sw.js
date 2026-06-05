// Service worker conservador do FreeMe.
// Objectivo: tornar a app instalavel e dar uma pagina offline, SEM cachear
// paginas autenticadas, o fluxo de pagamento, nem chamadas a APIs externas.

const VERSION = "freeme-v1";
const STATIC_CACHE = `freeme-static-${VERSION}`;
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll([OFFLINE_URL, "/icon-192.png", "/icon-512.png"])),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== STATIC_CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Cross-origin (PayPal SDK, Supabase, Google Fonts): nao intercetar.
  if (url.origin !== self.location.origin) return;

  // Nunca tocar nas APIs.
  if (url.pathname.startsWith("/api/")) return;

  // Navegacoes (paginas): rede primeiro, offline so quando nao ha rede.
  // Assim as paginas autenticadas nunca ficam em cache desatualizada.
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  // Assets estaticos com hash ou imagens/fontes/icones: cache primeiro.
  const isStatic =
    url.pathname.startsWith("/_next/static/") ||
    /\.(png|jpe?g|svg|gif|ico|webmanifest|woff2?)$/.test(url.pathname);

  if (isStatic) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            if (res.ok && res.type === "basic") {
              const copy = res.clone();
              caches.open(STATIC_CACHE).then((c) => c.put(request, copy));
            }
            return res;
          }),
      ),
    );
  }
  // Restante: deixar o browser tratar normalmente (sem cache).
});
