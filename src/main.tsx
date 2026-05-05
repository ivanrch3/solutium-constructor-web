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

console.log('[CONSTRUCTOR_BOOT_START] 🟢 Absoluto inicio del bundle main.tsx', {
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
