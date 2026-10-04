// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { VitePWA } from "file:///home/project/node_modules/vite-plugin-pwa/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "icon.svg",
        "icon-maskable.svg",
        "logo.png",
        "icon-192.png",
        "icon-512.png",
        "maskable-192.png",
        "maskable-512.png",
        "apple-touch-icon.png",
        "favicon-32.png",
        "favicon-16.png",
        "favicon.ico"
      ],
      manifest: {
        id: "/?source=pwa",
        name: "EduConnet - Tu Futuro Educativo Comienza Aqui",
        short_name: "EduConnet",
        description: "Conecta instituciones educativas de excelencia con postulantes talentosos. Simplifica el proceso de admision y encuentra tu oportunidad.",
        start_url: "/?source=pwa",
        scope: "/",
        display: "standalone",
        display_override: ["standalone", "fullscreen", "minimal-ui", "browser"],
        orientation: "portrait-primary",
        background_color: "#FEFEFF",
        theme_color: "#0D9488",
        lang: "es",
        dir: "ltr",
        categories: ["education", "productivity", "utilities"],
        prefer_related_applications: false,
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/maskable-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: "/maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: "/icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any"
          }
        ],
        shortcuts: [
          {
            name: "Comenzar Postulacion",
            short_name: "Postular",
            description: "Inicia tu proceso de postulacion",
            url: "/?source=pwa&view=student",
            icons: [{ src: "/icon-192.png", sizes: "96x96", type: "image/png" }]
          },
          {
            name: "Acceso Instituciones",
            short_name: "Instituciones",
            description: "Panel de acceso para instituciones educativas",
            url: "/instituciones/acceso",
            icons: [{ src: "/icon-192.png", sizes: "96x96", type: "image/png" }]
          }
        ]
      },
      workboxConfig: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,webmanifest,woff,woff2}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        maximumFileSizeToCacheInBytes: 6e6
      },
      devOptions: {
        enabled: false
      }
    })
  ],
  optimizeDeps: {
    exclude: ["lucide-react"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSAndml0ZS1wbHVnaW4tcHdhJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgVml0ZVBXQSh7XG4gICAgICByZWdpc3RlclR5cGU6ICdhdXRvVXBkYXRlJyxcbiAgICAgIGluY2x1ZGVBc3NldHM6IFtcbiAgICAgICAgJ2ljb24uc3ZnJyxcbiAgICAgICAgJ2ljb24tbWFza2FibGUuc3ZnJyxcbiAgICAgICAgJ2xvZ28ucG5nJyxcbiAgICAgICAgJ2ljb24tMTkyLnBuZycsXG4gICAgICAgICdpY29uLTUxMi5wbmcnLFxuICAgICAgICAnbWFza2FibGUtMTkyLnBuZycsXG4gICAgICAgICdtYXNrYWJsZS01MTIucG5nJyxcbiAgICAgICAgJ2FwcGxlLXRvdWNoLWljb24ucG5nJyxcbiAgICAgICAgJ2Zhdmljb24tMzIucG5nJyxcbiAgICAgICAgJ2Zhdmljb24tMTYucG5nJyxcbiAgICAgICAgJ2Zhdmljb24uaWNvJyxcbiAgICAgIF0sXG4gICAgICBtYW5pZmVzdDoge1xuICAgICAgICBpZDogJy8/c291cmNlPXB3YScsXG4gICAgICAgIG5hbWU6ICdFZHVDb25uZXQgLSBUdSBGdXR1cm8gRWR1Y2F0aXZvIENvbWllbnphIEFxdWknLFxuICAgICAgICBzaG9ydF9uYW1lOiAnRWR1Q29ubmV0JyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdDb25lY3RhIGluc3RpdHVjaW9uZXMgZWR1Y2F0aXZhcyBkZSBleGNlbGVuY2lhIGNvbiBwb3N0dWxhbnRlcyB0YWxlbnRvc29zLiBTaW1wbGlmaWNhIGVsIHByb2Nlc28gZGUgYWRtaXNpb24geSBlbmN1ZW50cmEgdHUgb3BvcnR1bmlkYWQuJyxcbiAgICAgICAgc3RhcnRfdXJsOiAnLz9zb3VyY2U9cHdhJyxcbiAgICAgICAgc2NvcGU6ICcvJyxcbiAgICAgICAgZGlzcGxheTogJ3N0YW5kYWxvbmUnLFxuICAgICAgICBkaXNwbGF5X292ZXJyaWRlOiBbJ3N0YW5kYWxvbmUnLCAnZnVsbHNjcmVlbicsICdtaW5pbWFsLXVpJywgJ2Jyb3dzZXInXSxcbiAgICAgICAgb3JpZW50YXRpb246ICdwb3J0cmFpdC1wcmltYXJ5JyxcbiAgICAgICAgYmFja2dyb3VuZF9jb2xvcjogJyNGRUZFRkYnLFxuICAgICAgICB0aGVtZV9jb2xvcjogJyMwRDk0ODgnLFxuICAgICAgICBsYW5nOiAnZXMnLFxuICAgICAgICBkaXI6ICdsdHInLFxuICAgICAgICBjYXRlZ29yaWVzOiBbJ2VkdWNhdGlvbicsICdwcm9kdWN0aXZpdHknLCAndXRpbGl0aWVzJ10sXG4gICAgICAgIHByZWZlcl9yZWxhdGVkX2FwcGxpY2F0aW9uczogZmFsc2UsXG4gICAgICAgIGljb25zOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiAnL2ljb24tMTkyLnBuZycsXG4gICAgICAgICAgICBzaXplczogJzE5MngxOTInLFxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXG4gICAgICAgICAgICBwdXJwb3NlOiAnYW55JyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogJy9pY29uLTUxMi5wbmcnLFxuICAgICAgICAgICAgc2l6ZXM6ICc1MTJ4NTEyJyxcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxuICAgICAgICAgICAgcHVycG9zZTogJ2FueScsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6ICcvbWFza2FibGUtMTkyLnBuZycsXG4gICAgICAgICAgICBzaXplczogJzE5MngxOTInLFxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXG4gICAgICAgICAgICBwdXJwb3NlOiAnbWFza2FibGUnLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiAnL21hc2thYmxlLTUxMi5wbmcnLFxuICAgICAgICAgICAgc2l6ZXM6ICc1MTJ4NTEyJyxcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxuICAgICAgICAgICAgcHVycG9zZTogJ21hc2thYmxlJyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogJy9pY29uLnN2ZycsXG4gICAgICAgICAgICBzaXplczogJ2FueScsXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2Uvc3ZnK3htbCcsXG4gICAgICAgICAgICBwdXJwb3NlOiAnYW55JyxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgICBzaG9ydGN1dHM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnQ29tZW56YXIgUG9zdHVsYWNpb24nLFxuICAgICAgICAgICAgc2hvcnRfbmFtZTogJ1Bvc3R1bGFyJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnSW5pY2lhIHR1IHByb2Nlc28gZGUgcG9zdHVsYWNpb24nLFxuICAgICAgICAgICAgdXJsOiAnLz9zb3VyY2U9cHdhJnZpZXc9c3R1ZGVudCcsXG4gICAgICAgICAgICBpY29uczogW3sgc3JjOiAnL2ljb24tMTkyLnBuZycsIHNpemVzOiAnOTZ4OTYnLCB0eXBlOiAnaW1hZ2UvcG5nJyB9XSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdBY2Nlc28gSW5zdGl0dWNpb25lcycsXG4gICAgICAgICAgICBzaG9ydF9uYW1lOiAnSW5zdGl0dWNpb25lcycsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1BhbmVsIGRlIGFjY2VzbyBwYXJhIGluc3RpdHVjaW9uZXMgZWR1Y2F0aXZhcycsXG4gICAgICAgICAgICB1cmw6ICcvaW5zdGl0dWNpb25lcy9hY2Nlc28nLFxuICAgICAgICAgICAgaWNvbnM6IFt7IHNyYzogJy9pY29uLTE5Mi5wbmcnLCBzaXplczogJzk2eDk2JywgdHlwZTogJ2ltYWdlL3BuZycgfV0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgICB3b3JrYm94Q29uZmlnOiB7XG4gICAgICAgIGdsb2JQYXR0ZXJuczogWycqKi8qLntqcyxjc3MsaHRtbCxzdmcscG5nLGljbyx3ZWJtYW5pZmVzdCx3b2ZmLHdvZmYyfSddLFxuICAgICAgICBjbGVhbnVwT3V0ZGF0ZWRDYWNoZXM6IHRydWUsXG4gICAgICAgIGNsaWVudHNDbGFpbTogdHJ1ZSxcbiAgICAgICAgc2tpcFdhaXRpbmc6IHRydWUsXG4gICAgICAgIG1heGltdW1GaWxlU2l6ZVRvQ2FjaGVJbkJ5dGVzOiA2MDAwMDAwLFxuICAgICAgfSxcbiAgICAgIGRldk9wdGlvbnM6IHtcbiAgICAgICAgZW5hYmxlZDogZmFsc2UsXG4gICAgICB9LFxuICAgIH0pLFxuICBdLFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBleGNsdWRlOiBbJ2x1Y2lkZS1yZWFjdCddLFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlOLFNBQVMsb0JBQW9CO0FBQ3RQLE9BQU8sV0FBVztBQUNsQixTQUFTLGVBQWU7QUFFeEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sUUFBUTtBQUFBLE1BQ04sY0FBYztBQUFBLE1BQ2QsZUFBZTtBQUFBLFFBQ2I7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLE1BQ0EsVUFBVTtBQUFBLFFBQ1IsSUFBSTtBQUFBLFFBQ0osTUFBTTtBQUFBLFFBQ04sWUFBWTtBQUFBLFFBQ1osYUFBYTtBQUFBLFFBQ2IsV0FBVztBQUFBLFFBQ1gsT0FBTztBQUFBLFFBQ1AsU0FBUztBQUFBLFFBQ1Qsa0JBQWtCLENBQUMsY0FBYyxjQUFjLGNBQWMsU0FBUztBQUFBLFFBQ3RFLGFBQWE7QUFBQSxRQUNiLGtCQUFrQjtBQUFBLFFBQ2xCLGFBQWE7QUFBQSxRQUNiLE1BQU07QUFBQSxRQUNOLEtBQUs7QUFBQSxRQUNMLFlBQVksQ0FBQyxhQUFhLGdCQUFnQixXQUFXO0FBQUEsUUFDckQsNkJBQTZCO0FBQUEsUUFDN0IsT0FBTztBQUFBLFVBQ0w7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxZQUNOLFNBQVM7QUFBQSxVQUNYO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFlBQ04sU0FBUztBQUFBLFVBQ1g7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsWUFDTixTQUFTO0FBQUEsVUFDWDtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxZQUNOLFNBQVM7QUFBQSxVQUNYO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFlBQ04sU0FBUztBQUFBLFVBQ1g7QUFBQSxRQUNGO0FBQUEsUUFDQSxXQUFXO0FBQUEsVUFDVDtBQUFBLFlBQ0UsTUFBTTtBQUFBLFlBQ04sWUFBWTtBQUFBLFlBQ1osYUFBYTtBQUFBLFlBQ2IsS0FBSztBQUFBLFlBQ0wsT0FBTyxDQUFDLEVBQUUsS0FBSyxpQkFBaUIsT0FBTyxTQUFTLE1BQU0sWUFBWSxDQUFDO0FBQUEsVUFDckU7QUFBQSxVQUNBO0FBQUEsWUFDRSxNQUFNO0FBQUEsWUFDTixZQUFZO0FBQUEsWUFDWixhQUFhO0FBQUEsWUFDYixLQUFLO0FBQUEsWUFDTCxPQUFPLENBQUMsRUFBRSxLQUFLLGlCQUFpQixPQUFPLFNBQVMsTUFBTSxZQUFZLENBQUM7QUFBQSxVQUNyRTtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsTUFDQSxlQUFlO0FBQUEsUUFDYixjQUFjLENBQUMsdURBQXVEO0FBQUEsUUFDdEUsdUJBQXVCO0FBQUEsUUFDdkIsY0FBYztBQUFBLFFBQ2QsYUFBYTtBQUFBLFFBQ2IsK0JBQStCO0FBQUEsTUFDakM7QUFBQSxNQUNBLFlBQVk7QUFBQSxRQUNWLFNBQVM7QUFBQSxNQUNYO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLGNBQWM7QUFBQSxFQUMxQjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
