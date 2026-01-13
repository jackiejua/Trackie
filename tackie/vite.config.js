// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa'; // Import the plugin

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Caches all application assets (JS, CSS, HTML, images)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        // Optional: Strategy for external APIs (if you had one)
        // runtimeCaching: [...]
      },
      manifest: {
        name: "Campus Manager PWA",
        short_name: "CampusMgr",
        theme_color: "#4f46e5",
        icons: [/* ... (copy icons from manifest.json) */]
      }
    }),
  ],
});