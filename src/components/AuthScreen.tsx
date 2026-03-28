import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSolutium } from '../hooks/useSolutium';
import { Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { APP_NAME, APP_LOGO_URL } from '../constants';

const AuthScreen: React.FC = () => {
  const { loading, setDemoMode } = useAuth();
  const { config } = useSolutium();
  const appLogo = config.project.logoUrl || APP_LOGO_URL;
  const appName = config.project.name || APP_NAME;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        <div className="mb-8 flex justify-center">
          <img src={appLogo} alt={appName} className="w-16 h-16 rounded-2xl object-contain shadow-lg shadow-blue-200" referrerPolicy="no-referrer" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{appName}</h1>
        <p className="text-gray-500 mb-8">
          Aplicación Satélite Solutium OS
        </p>

        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-sm text-gray-400 animate-pulse">
              Estableciendo conexión segura...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3 text-left">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900">Esperando inicialización</p>
                <p className="text-xs text-amber-700 mt-1">
                  Esta aplicación debe ser abierta desde Solutium OS para recibir el token de acceso.
                </p>
              </div>
            </div>
            
            <button
              onClick={setDemoMode}
              className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-colors shadow-sm"
            >
              Saltar Autenticación (Demo)
            </button>
          </div>
        )}
      </motion.div>
      
      <p className="mt-8 text-sm text-gray-400">
        Powered by Solutium
      </p>
    </div>
  );
};

export default AuthScreen;
