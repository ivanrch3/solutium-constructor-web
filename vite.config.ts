import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode, command}) => {
  const env = loadEnv(mode, '.', '');
  const isDev = command === 'serve';

  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'html-csp-plugin',
        transformIndexHtml(html) {
          const cspContent = isDev
            ? "default-src * 'self' 'unsafe-inline' data: gap: content: blob:; script-src * 'self' 'unsafe-inline' 'unsafe-eval'; style-src * 'self' 'unsafe-inline';"
            : "default-src * 'self' 'unsafe-inline' data: gap: content: blob:; script-src * 'self' 'unsafe-inline' 'unsafe-eval'; style-src * 'self' 'unsafe-inline';";
          
          return html.replace(
            '<head>',
            `<head>\n    <meta http-equiv="Content-Security-Policy" content="${cspContent}">`
          );
        }
      }
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    },
  };
});
