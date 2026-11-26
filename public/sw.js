// Service Worker para Notificaciones Push y Alertas Programadas del Cockpit TPI
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes("/grilla") && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow("/grilla");
      }
    })
  );
});

// Listener para disparar recordatorios de turnos (12:15, 17:15, 21:00)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SCHEDULE_NOTIFICATION") {
    const { title, body, delayMs, tag } = event.data;
    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        icon: "/logo.png",
        badge: "/logo.png",
        tag: tag || "tpi-alert",
        vibrate: [200, 100, 200],
        data: { url: "/grilla" },
      });
    }, Math.max(0, delayMs));
  }
});
