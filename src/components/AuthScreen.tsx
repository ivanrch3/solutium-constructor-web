import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { APP_NAME, APP_LOGO_URL } from '../constants';

const AuthScreen: React.FC = () => {
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
        </div>
      </motion.div>
      
      <p className="mt-8 text-sm text-gray-400">
        Powered by Solutium
      </p>
    </div>
  );
};

export default AuthScreen;
