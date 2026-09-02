const CACHE_NAME = "niftit-shell-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Registered (satisfies PWA installability) but intentionally does not
// cache/intercept anything — signal and subscription data must always be
// fresh, never served stale from a cache.
self.addEventListener("fetch", () => {});

self.addEventListener("push", (event) => {
  let payload = { title: "Niftit", body: "New signal" };
  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload = { title: "Niftit", body: event.data.text() };
    }
  }

  const options = {
    body: payload.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { url: payload.url || "/app" },
  };

  event.waitUntil(self.registration.showNotification(payload.title || "Niftit", options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/app";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      const existing = clientList.find((c) => c.url.includes(url));
      if (existing) return existing.focus();
      return self.clients.openWindow(url);
    })
  );
});
