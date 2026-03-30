import React from 'react';
import { Database, Home, Settings, FileBox } from 'lucide-react';

interface SidebarProps {
  role: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, activeTab, onTabChange }) => {
  return (
    <div className="w-64 h-screen bg-surface border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">Solutium</h1>
        <p className="text-sm text-gray-500">Satellite Base</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        <button
          onClick={() => onTabChange('home')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
            activeTab === 'home' ? 'bg-primary/10 text-primary' : 'text-text hover:bg-gray-100'
          }`}
        >
          <Home size={20} />
          <span>Inicio</span>
        </button>
        
        <button
          onClick={() => onTabChange('activos')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
            activeTab === 'activos' ? 'bg-primary/10 text-primary' : 'text-text hover:bg-gray-100'
          }`}
        >
          <FileBox size={20} />
          <span>Activos</span>
        </button>
        
        {role === 'superadmin' && (
          <button
            onClick={() => onTabChange('datos')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'datos' ? 'bg-primary/10 text-primary' : 'text-text hover:bg-gray-100'
            }`}
          >
            <Database size={20} />
            <span>Datos</span>
          </button>
        )}
        
        <button
          onClick={() => onTabChange('settings')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
            activeTab === 'settings' ? 'bg-primary/10 text-primary' : 'text-text hover:bg-gray-100'
          }`}
        >
          <Settings size={20} />
          <span>Ajustes</span>
        </button>
      </nav>
    </div>
  );
};
