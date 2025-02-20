import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import react from '@vitejs/plugin-react'
import manifest from './src/manifest.js'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    build: {
      emptyOutDir: true,
      outDir: 'build',
      rollupOptions: {
        input: './index.html', // specify the entry point
        output: {
          chunkFileNames: 'assets/chunk-[hash].js',
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return id.toString().split('node_modules/')[1].split('/')[0].toString();
            }
          },
        },
      },
      chunkSizeWarningLimit: 1000, // Adjust chunk size limit
    },
    plugins: [crx({ manifest }), react(), tailwindcss()],
  }
})
