import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'icon.svg',
        'icon-maskable.svg',
        'logo.png',
        'icon-192.png',
        'icon-512.png',
        'maskable-192.png',
        'maskable-512.png',
        'apple-touch-icon.png',
        'favicon-32.png',
        'favicon-16.png',
        'favicon.ico',
      ],
      manifest: {
        id: '/?source=pwa',
        name: 'EduConnet - Tu Futuro Educativo Comienza Aqui',
        short_name: 'EduConnet',
        description: 'Conecta instituciones educativas de excelencia con postulantes talentosos. Simplifica el proceso de admision y encuentra tu oportunidad.',
        start_url: '/?source=pwa',
        scope: '/',
        display: 'standalone',
        display_override: ['standalone', 'fullscreen', 'minimal-ui', 'browser'],
        orientation: 'portrait-primary',
        background_color: '#FEFEFF',
        theme_color: '#0D9488',
        lang: 'es',
        dir: 'ltr',
        categories: ['education', 'productivity', 'utilities'],
        prefer_related_applications: false,
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/maskable-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
        shortcuts: [
          {
            name: 'Comenzar Postulacion',
            short_name: 'Postular',
            description: 'Inicia tu proceso de postulacion',
            url: '/?source=pwa&view=student',
            icons: [{ src: '/icon-192.png', sizes: '96x96', type: 'image/png' }],
          },
          {
            name: 'Acceso Instituciones',
            short_name: 'Instituciones',
            description: 'Panel de acceso para instituciones educativas',
            url: '/instituciones/acceso',
            icons: [{ src: '/icon-192.png', sizes: '96x96', type: 'image/png' }],
          },
        ],
      },
      workboxConfig: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest,woff,woff2}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        maximumFileSizeToCacheInBytes: 6000000,
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
