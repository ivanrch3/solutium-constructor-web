import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { SolutiumProvider } from './context/SatelliteContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SolutiumProvider>
      <App />
    </SolutiumProvider>
  </StrictMode>,
);
