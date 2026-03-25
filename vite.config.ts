import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: process.env.BASE_URL ?? '/focusquest/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['assets/**/*'],
      workbox: {
        globPatterns: ['**/*.{js,css,ico,png,svg,woff2,webmanifest}'],
        skipWaiting: true,
        clientsClaim: true,
      },
      manifest: {
        name: 'FocusQuest',
        short_name: 'FocusQuest',
        description: 'Entraînement cognitif pour enfants TDAH',
        theme_color: '#0D7377',
        // Icons will be added when available
      },
    }),
  ],
  server: {
    port: 8080,
  },
});
