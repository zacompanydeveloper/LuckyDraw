import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Ensure scoped styles work properly
          scopeId: true,
        },
      },
    }),
    tailwindcss(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
  server: {
    proxy: {
      // any request starting with /api will be proxied
      '/api': {
        target: 'http://sweetyhomebackend.test',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
