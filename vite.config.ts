import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'railway-same-origin-assets',
      transformIndexHtml: {
        order: 'post',
        handler: (html) =>
          html
            .replaceAll(' crossorigin', '')
            .replaceAll('type="module"', 'defer'),
      },
    },
  ],
})
