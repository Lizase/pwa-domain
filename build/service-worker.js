
const CACHE_NAME = `offline-1.1.31`;
const OFFLINE_URL = "offline.html";

// 安裝階段
self.addEventListener("install", function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL))
  );
});

// 啟用階段
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  return self.clients.claim();
});

// fetch fallback 僅處理 HTML
self.addEventListener("fetch", function (event) {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.open(CACHE_NAME).then((cache) => cache.match(OFFLINE_URL));
      })
    );
  }
});

// 推播通知
self.addEventListener("push", function (event) {
  const data = event.data?.json() || {};
  const opts = {
    body: data.body || "你有一則新通知",
    icon: data.icon,
    data: { url: data.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(data.title || "通知", opts));
});

// 點擊通知
self.addEventListener("notificationclick", function (event) {
  const data = event.notification.data;
  event.notification.close();
  event.waitUntil(clients.openWindow(data.url));
});
