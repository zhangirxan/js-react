import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// deployed next to task 2, in /js-react/task3/
export default defineConfig({
  plugins: [react()],
  base: '/js-react/task3/',
})
