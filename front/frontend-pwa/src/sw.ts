/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare let self: ServiceWorkerGlobalScope;

// Cleanup outdated caches
cleanupOutdatedCaches();

// Take control of the page immediately
clientsClaim();
self.skipWaiting();

// Precache static assets
precacheAndRoute(self.__WB_MANIFEST);

// Cache API responses for the product catalog
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/v1/catalogo/productos'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache-catalogo',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
      }),
    ],
  })
);

// Cache API responses for categories
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/v1/catalogo/categorias/'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache-categorias',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
      }),
    ],
  })
);

// Cache API responses for packages
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/v1/catalogo/paquetes/'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache-paquetes',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
      }),
    ],
  })
);

// Cache API responses for shop info
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/contenido/info/'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache-info',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
      }),
    ],
  })
);

// Push Notification Listeners
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();

    const options: NotificationOptions & { vibrate?: number[] } = {
      body: data.body,
      icon: '/gabunniLogo.jpg',
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

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.openWindow(event.notification.data.url || '/')
  );
});
