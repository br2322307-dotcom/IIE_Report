import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// This file configures Vite, which is the build tool and development server for our React app.
export default defineConfig({
  // Load the React plugin so Vite understands JSX syntax
  plugins: [react()],
  
  // Configure the development server
  server: {
    // We set up a 'proxy' here. 
    // This is VERY important because our React app runs on port 5173, but our Flask backend runs on port 5000.
    // If React tries to send a fetch request to /api/login directly, the browser might block it due to CORS.
    // By using this proxy, any request React makes that starts with '/api' will secretly be forwarded 
    // to the Flask server ('http://127.0.0.1:5000') by the Vite server.
    // This makes the browser think everything is running on the same port, ensuring a smooth connection!
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      }
    }
  }
})
