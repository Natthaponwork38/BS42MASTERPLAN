import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const base = process.env.BASE_PATH ?? '/';
if (!base.startsWith('/') || !base.endsWith('/')) throw new Error('BASE_PATH must begin and end with /');
export default defineConfig({
  base,
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['icons/*.png', 'fonts/*.ttf'],
    manifest: {
      id: base, name: 'BS42 · Bangsaen Marathon 2026', short_name: 'BS42',
      description: 'The complete BS42 training plan, long run roadmap and guardrails.',
      start_url: base, scope: base, display: 'standalone', lang: 'en',
      theme_color: '#F7F7F5', background_color: '#F7F7F5',
      icons: [
        { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{html,js,css,json,ttf,png,webmanifest}'],
      navigateFallback: `${base}index.html`, cleanupOutdatedCaches: true,
      clientsClaim: true, skipWaiting: true,
    },
  })],
});
