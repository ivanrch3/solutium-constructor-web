import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// BLOCK WINDOW CLOSE (Fase 1 de diagnóstico)
const originalClose = window.close;
window.close = function() {
  console.error('[CONSTRUCTOR_WINDOW_CLOSE_ATTEMPTED_DEBUG]', {
    stack: new Error().stack,
    timestamp: new Date().toISOString()
  });
  console.warn("🔻 [SIP v5.2] Se intentó cerrar la ventana, pero el cierre está bloqueado por el parche de diagnóstico.");
  // originalClose.call(window); // Comentado para mantener la pestaña abierta
};

console.warn("[LIVE_VIEWER_REAL_ENTRYPOINT_DEBUG]", {
  app: "solutium-live-viewer",
  version: "products-legacy-snapshot-reader-v5-STABLE",
  href: window.location.href,
  origin: window.location.origin,
  timestamp: new Date().toISOString()
});

console.warn("[LIVE_BUNDLE_VERSION_DEBUG]", {
  app: "solutium-live-viewer",
  version: "v6.5-products-snapshot-live-fix-FINAL-RES-V101",
  file: "src/main.tsx",
  buildTime: new Date().toISOString(),
  href: window.location.href,
  origin: window.location.origin,
  search: window.location.search
});

console.log('[CONSTRUCTOR_BOOT_START] 🟢 Absoluto inicio del bundle main.tsx (Force-V101)', {
  href: window.location.href,
  opener: !!window.opener,
  parent: window.parent !== window,
  timestamp: new Date().toISOString()
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
