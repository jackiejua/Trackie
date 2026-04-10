// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa'; // Import the plugin

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'icon-192x192.png', 'icon-512x512.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        navigateFallback: '/offline.html',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true
      },
      manifest: {
        name: 'Trackie Student Planner',
        short_name: 'Trackie',
        start_url: '/',
        display: 'standalone',
        background_color: '#121212',
        theme_color: '#121212',
        description: 'Track classes, assignments, and daily productivity offline.',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    }),
  ],
});