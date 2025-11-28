self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/gabunniLogo.jpg', // Asegúrate de tener este ícono en public
      badge: '/gabunniLogo.jpg',
      vibrate: [100, 50, 100],
      data: {
        url: data.url
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  //se abre noti al tocar
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});