import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

function ensureTrailingSlash(url: string) {
  return url.endsWith('/') ? url : `${url}/`;
}

export default defineConfig(({mode, command}) => {
  const env = loadEnv(mode, '.', '');
  const explicitBase =
    env.VITE_BASE_URL ||
    env.BASE_URL;
  const isServe = command === 'serve';
  const base = isServe
    ? '/'
    : explicitBase
      ? ensureTrailingSlash(explicitBase)
      : '/';

  return {
    plugins: [react(), tailwindcss()],
    base,
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: Number(env.PORT || env.VITE_LOCAL_PORT || 3010),
      strictPort: false,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: env.DISABLE_HMR === 'true' ? false : {
        host: 'localhost',
        protocol: 'ws',
        port: Number(env.VITE_HMR_PORT || 24679),
        clientPort: Number(env.VITE_HMR_PORT || 24679),
      },
    },
  };
});
