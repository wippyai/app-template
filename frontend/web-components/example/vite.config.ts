import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue(),
  ],
  build: {
    target: 'esnext',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'UploadsManager',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'src/index.ts'),
      },
      // Externalize dependencies that are provided by the import map
      external: [
        'vue',
        'pinia',
        '@iconify/vue',
        'nanoevents',
        'luxon',
        '@wippy-fe/proxy',
      ],
      output: {
        // Enable to test dynamic imports and bundle content
        // preserveModules: true,
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash][extname]',
      }
    },
    sourcemap: true,
  },
})
