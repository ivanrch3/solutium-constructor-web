import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// BLOCK WINDOW CLOSE (Fase 1 de diagnóstico)
const originalClose = window.close;
window.close = function() {
  // originalClose.call(window); // Comentado para mantener la pestaña abierta
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
