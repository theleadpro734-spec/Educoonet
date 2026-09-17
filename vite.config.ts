import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icon.svg', 'icon-maskable.svg', 'logo.png'],
      manifest: {
        name: 'EduConnet - Tu Futuro Educativo Comienza Aqui',
        short_name: 'EduConnet',
        description: 'Conecta instituciones educativas de excelencia con postulantes talentosos. Simplifica el proceso de admision y encuentra tu oportunidad.',
        start_url: '/?source=pwa',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#FEFEFF',
        theme_color: '#0D9488',
        lang: 'es',
        dir: 'ltr',
        categories: ['education', 'productivity', 'utilities'],
        icons: [
          {
            src: '/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: '/icon-maskable.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
          {
            src: '/logo.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
        ],
        shortcuts: [
          {
            name: 'Comenzar Postulacion',
            short_name: 'Postular',
            description: 'Inicia tu proceso de postulacion',
            url: '/?source=pwa&view=student',
            icons: [{ src: '/icon.svg', sizes: '96x96', type: 'image/svg+xml' }],
          },
          {
            name: 'Acceso Instituciones',
            short_name: 'Instituciones',
            description: 'Panel de acceso para instituciones educativas',
            url: '/instituciones/acceso',
            icons: [{ src: '/icon.svg', sizes: '96x96', type: 'image/svg+xml' }],
          },
        ],
      },
      workboxConfig: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: false,
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
