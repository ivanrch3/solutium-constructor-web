import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, FileText, Globe, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { project } = useAuth();

  const stats = [
    { label: 'Páginas', value: '0', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Visitas', value: '0', icon: Globe, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Activos', value: '0', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Hola! Bienvenido a tu Constructor</h1>
        <p className="text-gray-500">Gestiona tus páginas y crea nuevas experiencias profesionales.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={cn("p-3 rounded-xl", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* New Page Card */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center"
        >
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <Plus className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Nueva página</h2>
          <p className="text-gray-500 mb-8 max-w-sm">
            Crea una nueva página desde cero con nuestro constructor web o utilizando inteligencia artificial.
          </p>
          <Link 
            to="/builder"
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            Crear nuevo
          </Link>
        </motion.div>

        {/* Existing Assets */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Activos existentes</h2>
            <button className="text-blue-600 text-sm font-bold hover:underline">Ver todos</button>
          </div>
          
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl">
            <Globe className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm">No existen activos.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

import { cn } from '../lib/utils';
export default Dashboard;
