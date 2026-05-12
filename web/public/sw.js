const CACHE = "veritaslens-shell-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        cache.addAll([OFFLINE_URL, "/manifest.webmanifest"]).catch(() => {}),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res.ok || res.type === "opaqueredirect") return res;
        return caches.match(OFFLINE_URL).then((c) => c ?? res);
      })
      .catch(() => caches.match(OFFLINE_URL)),
  );
});
