const CACHE_NAME = "fanoos-cache-v3";

const ASSETS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./app.js",
  "./storage.js",
  "./logo/Fanoosblack.png",
  "./logo/Fanooswhite.png"
];

// Install
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// Activate
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
});

// Fetch offline-first
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(res => {
      return res || fetch(event.request);
    })
  );
});
