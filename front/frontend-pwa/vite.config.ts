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
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}'],
      },
      includeAssets: ['gabunniLogo.jpg', 'vite.svg'], // Precache public assets
      devOptions: {
        enabled: true, // Enable PWA in dev mode for testing
        type: 'module',
      },
      manifest: {
        name: 'Digital Gabunni',
        short_name: 'Gabbuni',
        description: 'App de pedidos de chapatas y comida saludables',
        theme_color: '#f97316',
        icons: [
          {
            src: '/gabunniLogo.jpg', // Using absolute path from public
            sizes: '192x192',
            type: 'image/jpg',
          },
          {
            src: '/gabunniLogo.jpg',
            sizes: '512x512',
            type: 'image/jpg',
          },
        ],
      },
    })
  ],
});