self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const title = data.title ?? 'StickyThoughts';
  const options = {
    body: data.body,
    icon: data.icon || '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: { url: data.url ?? '/' },
    ...(data.tag && { tag: data.tag }),
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/';
  event.waitUntil(clients.openWindow(url));
});

self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager
      .subscribe(event.oldSubscription?.options ?? { userVisibleOnly: true })
      .then((subscription) => {
        const { endpoint, keys } = subscription.toJSON();
        if (!endpoint || !keys?.p256dh || !keys.auth) return;
        return fetch('/api/user/push-subscriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint, p256dh: keys.p256dh, auth: keys.auth }),
        });
      }),
  );
});
