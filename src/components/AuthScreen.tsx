import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { APP_NAME, APP_LOGO_URL } from '../constants';

const AuthScreen: React.FC = () => {
  const { setDemoMode } = useAuth();
  const appLogo = APP_LOGO_URL;
  const appName = APP_NAME;

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
          Cargando configuración del proyecto...
        </p>

        <div className="flex flex-col gap-4">
          <div className="flex justify-center py-4">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">O prueba la demo</span>
            </div>
          </div>

          <button
            onClick={setDemoMode}
            className="w-full py-3 px-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-gray-200"
          >
            Saltar Autenticación (Demo)
          </button>
        </div>
      </motion.div>
      
      <p className="mt-8 text-sm text-gray-400">
        Powered by Solutium
      </p>
    </div>
  );
};

export default AuthScreen;
