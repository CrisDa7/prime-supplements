import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // Ajustar según el plugin exacto que use el proyecto

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});