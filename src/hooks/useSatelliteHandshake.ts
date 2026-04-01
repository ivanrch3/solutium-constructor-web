// src/hooks/useSatelliteHandshake.ts
import { useState, useEffect } from 'react';
import { migrationLogger } from '../lib/migrationLogger';

export const useSatelliteHandshake = () => {
  const [context, setContext] = useState<{ projectId: string; userId: string } | null>(null);

  useEffect(() => {
    const processHandshake = () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(window.location.search);
      let token = params.get('token');

      if (!token && hash.includes('token=')) {
        const match = hash.match(/[#&]token=([^&]+)/);
        if (match) token = match[1];
      }

      if (token) {
        try {
          migrationLogger.log('HANDSHAKE', 'Token detectado, procesando...');
          const cleanToken = decodeURIComponent(token);
          const [base64Payload] = cleanToken.split('.');
          
          if (!base64Payload) throw new Error('Formato de token inválido');

          // Decodificación robusta
          const normalizedBase64 = base64Payload.replace(/ /g, '+').replace(/-/g, '+').replace(/_/g, '/');
          const decodedString = decodeURIComponent(Array.prototype.map.call(window.atob(normalizedBase64), function(c: string) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          
          const decoded = JSON.parse(decodedString);
          
          if (decoded.projectId && decoded.userId) {
            setContext({ projectId: decoded.projectId, userId: decoded.userId });
            migrationLogger.success('HANDSHAKE', `Contexto establecido: Proyecto ${decoded.projectId}`);
          } else {
            throw new Error('El token no contiene projectId o userId');
          }
        } catch (e) {
          migrationLogger.error('HANDSHAKE', 'Error crítico decodificando token', e);
        }
      } else {
        migrationLogger.log('HANDSHAKE', 'No se encontró token en la URL');
      }
    };

    processHandshake();
  }, []);

  return context;
};