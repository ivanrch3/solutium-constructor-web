import React from 'react';
import { Database, Home, Settings, User } from 'lucide-react';
import { Profile, Project } from '../types/schema';

interface SidebarProps {
  profile: Profile | null;
  project: Project | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ profile, project, activeTab, onTabChange }) => {
  const role = profile?.role || 'user';
  const isSuperAdmin = role.toLowerCase().replace('-', '') === 'superadmin';

  // Custom styles from profile
  const sidebarStyle = {
    backgroundColor: profile?.sidebarBg || 'var(--surface)',
    color: profile?.sidebarForeground || 'var(--text)',
    borderColor: profile?.sidebarBorder || 'var(--border)',
  };

  const activeButtonStyle = {
    backgroundColor: profile?.sidebarAccent || 'rgba(var(--primary-rgb), 0.1)',
    color: 'var(--primary)',
  };

  return (
    <div 
      className="w-64 h-screen border-r flex flex-col transition-colors duration-200"
      style={sidebarStyle}
    >
      <div className="p-6 flex items-center space-x-3">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl overflow-hidden">
          {project?.logoUrl ? (
            <img src={project.logoUrl} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
          ) : (
            <span>S</span>
          )}
        </div>
        <div>
          <h1 className="text-xl font-bold leading-tight truncate max-w-[140px]">
            {project?.name || 'Solutium'}
          </h1>
          <p className="text-xs opacity-60">Satellite Base</p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        <button
          onClick={() => onTabChange('home')}
          className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
            activeTab === 'home' ? '' : 'hover:bg-black/5 dark:hover:bg-white/5'
          }`}
          style={activeTab === 'home' ? activeButtonStyle : {}}
        >
          <Home size={18} />
          <span className="font-medium">Inicio</span>
        </button>
        
        <button
          onClick={() => onTabChange('settings')}
          className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
            activeTab === 'settings' ? '' : 'hover:bg-black/5 dark:hover:bg-white/5'
          }`}
          style={activeTab === 'settings' ? activeButtonStyle : {}}
        >
          <Settings size={18} />
          <span className="font-medium">Ajustes</span>
        </button>

        {isSuperAdmin && (
          <button
            onClick={() => onTabChange('datos')}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
              activeTab === 'datos' ? '' : 'hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            style={activeTab === 'datos' ? activeButtonStyle : {}}
          >
            <Database size={18} />
            <span className="font-medium">Datos</span>
          </button>
        )}
      </nav>

      <div className="p-4 border-t" style={{ borderColor: profile?.sidebarBorder || 'var(--border)' }}>
        <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200 group">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden border-2 border-transparent group-hover:border-primary transition-colors">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary">
                <User size={20} />
              </div>
            )}
          </div>
          <div className="flex-1 text-left truncate">
            <p className="text-sm font-bold truncate">{profile?.fullName || 'Usuario'}</p>
            <p className="text-xs opacity-60 truncate capitalize">{role}</p>
          </div>
        </button>
      </div>
    </div>
  );
};
