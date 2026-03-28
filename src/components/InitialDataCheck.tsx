import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DataAudit from './DataAudit';
import { Loader2 } from 'lucide-react';

const InitialDataCheck: React.FC = () => {
  const { loading } = useAuth();
  const [showFullApp, setShowFullApp] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Sincronizando con Solutium...</h2>
        <p className="text-gray-500 text-center max-w-xs">
          Estamos estableciendo el apretón de manos y cargando los datos de la base de datos.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 overflow-hidden">
        <DataAudit />
      </div>

      <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
        >
          Reintentar Handshake
        </button>
        
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('SOLUTIUM_PROCEED'))}
          className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-3 uppercase tracking-widest text-xs"
        >
          Continuar a la Aplicación
        </button>
      </div>
    </div>
  );
};

export default InitialDataCheck;
