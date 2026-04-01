import React from 'react';
import { Code } from 'lucide-react';

interface LoadingViewProps {
  projectName?: string;
  onSimulateConnection: () => void;
}

export const LoadingView: React.FC<LoadingViewProps> = ({ projectName, onSimulateConnection }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background space-y-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
        <Code className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary" />
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold text-text mb-1">
          Conectando con {projectName || 'Solutium'}
        </h2>
        <p className="text-text/60 text-sm">Sincronizando tus datos y preferencias...</p>
      </div>
      <button 
        onClick={onSimulateConnection}
        className="px-4 py-2 bg-surface border border-text/10 text-text/60 text-xs font-bold rounded-lg hover:bg-background transition-all shadow-sm"
      >
        (Modo Desarrollo: Simular Conexión)
      </button>
    </div>
  );
};
