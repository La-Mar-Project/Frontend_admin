import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { join } from 'path'

// Chrome 경로 찾기 (Windows)
function getChromePath() {
  try {
    const possiblePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
    ]
    
    for (const path of possiblePaths) {
      if (path && existsSync(path)) {
        return path
      }
    }
    
    // Chrome이 PATH에 있는 경우
    try {
      execSync('where chrome', { stdio: 'ignore' })
      return 'chrome'
    } catch {
      return true // 기본 브라우저 사용
    }
  } catch (error) {
    console.warn('Chrome 경로 찾기 실패:', error);
    return true // 기본 브라우저 사용
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true, // 기본 브라우저 사용 (Chrome 경로 문제 방지)
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
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('[Vite Proxy] /main 요청:', req.method, req.url, '→', proxyReq.getHeader('host') + req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('[Vite Proxy] /main 응답:', req.method, req.url, '→', proxyRes.statusCode, proxyRes.statusMessage);
          });
        },
      },
    },
  },
})
