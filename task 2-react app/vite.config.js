import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// repo name, github pages serves the site from /js-react/
export default defineConfig({
  plugins: [react()],
  base: '/js-react/',
})
