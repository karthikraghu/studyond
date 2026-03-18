import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Tailwind v4 uses a Vite plugin instead of PostCSS
  ],
  resolve: {
    alias: {
      // Enables clean imports like '@/components/...' instead of '../../components/...'
      '@': path.resolve(__dirname, './src'),
    },
  },
})
