import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('example-'),
        },
      },
    }),
  ],
  base: '/app/main/',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    cssCodeSplit: false,
    sourcemap: true,
    rollupOptions: {
      input: { app: resolve(__dirname, 'app.html') },
      external: [
        'vue',
        'pinia',
        'vue-router',
        '@iconify/vue',
        'nanoevents',
        'luxon',
        '@wippy-fe/proxy',
        'primevue',
        'primevue/config',
        'primevue/button',
        'primevue/tag',
        'primevue/dialog',
        'primevue/checkbox',
        'primevue/inputtext',
        'primevue/password',
        'primevue/select',
        'primevue/datatable',
        'primevue/column',
        'primevue/avatar',
        'primevue/accordion',
        'primevue/accordionpanel',
        'primevue/accordionheader',
        'primevue/accordioncontent',
        'primevue/chip',
        'axios',
      ],
      output: {
        entryFileNames: '[name].js',
        assetFileNames: '[name]-[hash][extname]',
      },
    },
  },
})
