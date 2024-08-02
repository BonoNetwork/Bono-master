import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    vue(),
    nodePolyfills()
  ],
  resolve: {
    alias: {
      stream: "rollup-plugin-node-polyfills/polyfills/stream",
      events: "rollup-plugin-node-polyfills/polyfills/events",
      assert: "assert",
      crypto: "crypto-browserify",
      util: "util",
      'near-api-js': 'near-api-js/dist/near-api-js.js',
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@bono': fileURLToPath(new URL('./src/bono', import.meta.url))
    }
  },
  define: {
    "process.env": process.env ?? {},
  },
  build: {
    target: "esnext",
    rollupOptions: {
      plugins: [],
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [],
    },
  },
})