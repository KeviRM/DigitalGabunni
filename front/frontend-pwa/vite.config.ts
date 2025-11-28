// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa'; // Importar
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir:'public',
      filename:'sw.js',
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'], 
        runtimeCaching: [
            {
                urlPattern: ({ url }) => url.pathname.startsWith('/api/v1/catalogo/productos'),
                handler: 'StaleWhileRevalidate',
                options: {
                    cacheName: 'api-cache-catalogo',
                    expiration: {
                        maxEntries: 10,
                        maxAgeSeconds: 60 * 60 * 24 * 7, 
                    },
                },
            },
        ],
      },
      // manifest: {
      //   name: 'Digital Gabunni',
      //   short_name: 'Gabbuni',
      //   description: 'App de pedidos de chapatas y comida saludables',
      //   theme_color: '#f97316', 
      //   icons: [
      //     {
      //       src: 'src/assets/gabunniLogo.jpg',
      //       sizes: '192x192',
      //       type: 'image/jpg',
      //     },
      //     {
      //       src: 'src/assets/gabunniLogo.jpg',
      //       sizes: '512x512',
      //       type: 'image/jpg',
      //     },
      //   ],
      // },
    })
  ],
});