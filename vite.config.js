import { createRequire } from 'node:module'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

const require = createRequire(import.meta.url)
const pkg = require('./package.json')

export default defineConfig({
  base: '/z-services/',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __GITHUB_USER__: JSON.stringify('zuzu59'),
    __GITHUB_REPO__: JSON.stringify('z-services')
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-icon.svg'],
      manifest: {
        name: 'Z-Services',
        short_name: 'Z-Services',
        description: 'Gestion locale et chiffrée des services hébergés chez soi',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        scope: '/z-services/',
        start_url: '/z-services/',
        icons: [
          {
            src: '/z-services/pwa-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          }
        ]
      },
      workbox: {
        navigateFallback: '/z-services/index.html'
      }
    })
  ],
  server: {
    host: '0.0.0.0'
  }
})
