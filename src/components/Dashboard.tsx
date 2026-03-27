import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PlusCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { APP_NAME, APP_LOGO_URL } from '../constants';

const Dashboard: React.FC = () => {
  const { project } = useAuth();
  const navigate = useNavigate();
  const appLogo = APP_LOGO_URL;
  const appName = APP_NAME;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-12 px-4">
      {/* Header Logo */}
      <div className="mb-16 flex flex-col items-center">
        <div className="flex items-center gap-3">
          <img src={appLogo} alt={appName} className="h-16 w-16 object-contain" referrerPolicy="no-referrer" />
          <div className="flex flex-col">
            <span className="text-3xl font-bold text-gray-900 leading-none">Constructor</span>
            <span className="text-3xl font-bold text-[#1e3a8a] leading-none">Web</span>
            <span className="text-xs font-medium text-pink-500 self-end mt-1">by Solutium</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl w-full">
        {/* Left Card: Nueva página */}
        <div className="bg-white rounded-[2rem] p-12 shadow-sm border border-gray-100 flex flex-col min-h-[400px]">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Nueva página</h2>
          <p className="text-gray-500 text-lg leading-relaxed mb-12">
            Crea una nueva página desde cero con nuestro constructor web o utilizando inteligencia artificial.
          </p>
          <div className="mt-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/builder')}
              className="bg-[#3b82f6] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 shadow-lg shadow-blue-100"
            >
              <PlusCircle className="w-6 h-6" />
              Crear nuevo
            </motion.button>
          </div>
        </div>

        {/* Right Card: Activos existentes */}
        <div className="bg-white rounded-[2rem] p-12 shadow-sm border border-gray-100 flex flex-col min-h-[400px]">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Activos existentes</h2>
          <div className="flex-1 border-2 border-dashed border-gray-100 rounded-3xl flex items-center justify-center bg-gray-50/50">
            <span className="text-gray-400 font-medium">No existen activos.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
