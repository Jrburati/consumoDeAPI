import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      includeAssets: [
        'brt-play-logo-cyberpunk.png',
        'brt-play-symbol-transparent.png',
        'apple-touch-icon.png',
        'favicon-64.png',
        'home-hero-cyberpunk.png',
        'home-pokeball-hologram.png',
        'home-movies-hologram.png',
        'home-dragonball-hologram.png',
      ],
      manifest: {
        id: '/',
        name: 'BRT Play',
        short_name: 'BRT Play',
        description: 'Plataforma BRT Play em formato PWA.',
        lang: 'pt-BR',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#8818FA',
        background_color: '#080914',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg}'],
        globIgnores: ['**/api/**', '**/.env*'],
        cleanupOutdatedCaches: true,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api(?:\/|$)/, /^\/\./],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname === '/api' || url.pathname.startsWith('/api/'),
            handler: 'NetworkOnly',
            options: { fetchOptions: { cache: 'no-store' } },
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:3001',
    },
  },
})
