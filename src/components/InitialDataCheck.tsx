import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DataAudit from './DataAudit';
import { Database, Loader2 } from 'lucide-react';

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
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Verificación de Datos</h1>
            <p className="text-xs text-gray-500">Esquema Unificado v4.0</p>
          </div>
        </div>
        
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          Reintentar Handshake
        </button>
      </nav>

      <main className="max-w-7xl mx-auto">
        <DataAudit />
      </main>

      <div className="fixed bottom-8 right-8">
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('SOLUTIUM_PROCEED'))}
          className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold shadow-2xl hover:bg-black transition-all active:scale-95 flex items-center gap-3"
        >
          Continuar a la Aplicación
        </button>
      </div>
    </div>
  );
};

export default InitialDataCheck;
