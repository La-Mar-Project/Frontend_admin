import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/ships': {
        target: 'https://jjubul.duckdns.org',
        changeOrigin: true,
        secure: true,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('[Vite Proxy] 요청:', req.method, req.url, '→', proxyReq.getHeader('host') + req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('[Vite Proxy] 응답:', req.method, req.url, '→', proxyRes.statusCode, proxyRes.statusMessage);
          });
        },
      },
      '/schedules': {
        target: 'https://jjubul.duckdns.org',
        changeOrigin: true,
        secure: true,
      },
      '/reservations': {
        target: 'https://jjubul.duckdns.org',
        changeOrigin: true,
        secure: true,
      },
      '/sms': {
        target: 'https://jjubul.duckdns.org',
        changeOrigin: true,
        secure: true,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('[Vite Proxy] SMS 요청:', req.method, req.url, '→', proxyReq.getHeader('host') + req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('[Vite Proxy] SMS 응답:', req.method, req.url, '→', proxyRes.statusCode, proxyRes.statusMessage);
          });
        },
      },
      '/auth': {
        target: 'https://jjubul.duckdns.org',
        changeOrigin: true,
        secure: true,
      },
      '/user': {
        target: 'https://jjubul.duckdns.org',
        changeOrigin: true,
        secure: true,
      },
      '/users': {
        target: 'https://jjubul.duckdns.org',
        changeOrigin: true,
        secure: true,
      },
      '/api': {
        target: 'https://jjubul.duckdns.org',
        changeOrigin: true,
        secure: true,
      },
      '/main': {
        target: 'https://jjubul.duckdns.org',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
