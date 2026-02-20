import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  base: '',
  build: {
    outDir: '../static/dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: { app: resolve(__dirname, 'app.html') },
      external: [
        'vue',
        'vue-router',
        '@iconify/vue',
        'primevue',
        'primevue/config',
        'primevue/button',
        'primevue/tag',
        'primevue/dialog',
        'primevue/checkbox',
        'axios',
      ],
      output: {
        entryFileNames: '[name].js',
        assetFileNames: '[name]-[hash][extname]',
      },
    },
  },
})
