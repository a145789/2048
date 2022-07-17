import { URL, fileURLToPath } from 'url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import Unocss from 'unocss/vite'
import { BG_COLOR, INIT_BG_COLOR } from './src/constants'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({ reactivityTransform: true }),
    vueJsx(),
    Unocss({
      safelist: [
        ...Object.values(BG_COLOR).map((color) => `bg-${color}`),
        `bg-${INIT_BG_COLOR}`,
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  base: './',
  server: {
    host: '0.0.0.0',
  },
})
