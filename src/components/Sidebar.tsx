import React from 'react';
import { Database, Home, Settings, User, Cloud } from 'lucide-react';
import { Profile, Project } from '../types/schema';

interface SidebarProps {
  profile: Profile | null;
  project: Project | null;
  urlLogo?: string | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ profile, project, urlLogo, activeTab, onTabChange }) => {
  const role = profile?.role || 'user';
  const isSuperAdmin = role.toLowerCase().replace('-', '') === 'superadmin';
  const isDebug = new URLSearchParams(window.location.search).get('debug_render') === 'true';

  // Sidebar styles are derived from CSS variables set by ThemeContext
  const sidebarStyle = {
    backgroundColor: 'var(--sidebar-bg)',
    color: 'var(--sidebar-foreground)',
    borderColor: 'var(--sidebar-border)',
  };

  const activeButtonStyle = {
    backgroundColor: 'var(--sidebar-accent)',
    color: 'inherit', // Use inherit to let the foreground color rule
  };

  const [logoError, setLogoError] = React.useState(false);
  const displayLogo = urlLogo || project?.logoUrl || project?.isoUrl;

  return (
    <div 
      className="w-64 h-screen border-r flex flex-col transition-colors duration-200"
      style={sidebarStyle}
    >
      <div className="h-24 p-6 flex items-center justify-center">
        <div className="h-full w-full flex items-center justify-center overflow-hidden">
          {displayLogo && !logoError ? (
            <img 
              src={displayLogo} 
              alt={`Logo de ${project?.name || 'Solutium'}`} 
              className="h-full w-auto object-contain" 
              referrerPolicy="no-referrer" 
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
              <span>{project?.name?.charAt(0) || 'S'}</span>
            </div>
          )}
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        <button
          onClick={() => onTabChange('home')}
          className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
            activeTab === 'home' ? '' : 'hover:bg-sidebar-foreground/5'
          }`}
          style={activeTab === 'home' ? activeButtonStyle : {}}
        >
          <Home size={18} />
          <span className="text-base font-medium">Inicio</span>
        </button>
        
        <button
          onClick={() => onTabChange('settings')}
          className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
            activeTab === 'settings' ? '' : 'hover:bg-sidebar-foreground/5'
          }`}
          style={activeTab === 'settings' ? activeButtonStyle : {}}
        >
          <Settings size={18} />
          <span className="text-base font-medium">Ajustes</span>
        </button>

        {isSuperAdmin && (
          <button
            onClick={() => onTabChange('datos')}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
              activeTab === 'datos' ? '' : 'hover:bg-sidebar-foreground/5'
            }`}
            style={activeTab === 'datos' ? activeButtonStyle : {}}
          >
            <Database size={18} />
            <span className="text-base font-medium">Datos</span>
          </button>
        )}

        {isDebug && !isSuperAdmin && (
          <button
            onClick={() => onTabChange('datos')}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 border border-amber-500/20 bg-amber-500/5 ${
              activeTab === 'datos' ? '' : 'hover:bg-amber-500/10'
            }`}
            style={activeTab === 'datos' ? { backgroundColor: 'rgb(245 158 11 / 0.2)' } : {}}
          >
            <Cloud size={18} className="text-amber-600" />
            <span className="text-base font-bold text-amber-900">DEBUG ASSETS</span>
          </button>
        )}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200">
          <div className="w-10 h-10 rounded-xl bg-sidebar-foreground/10 flex-shrink-0 overflow-hidden border border-sidebar-border">
            {project?.projectIconUrl ? (
              <img 
                src={project.projectIconUrl} 
                alt="Proyecto" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                <Database size={20} />
              </div>
            )}
          </div>
          <div className="flex-1 text-left truncate">
            <p className="text-base font-bold truncate text-inherit">{project?.name || 'Proyecto'}</p>
            <p className="text-xs font-medium opacity-60 truncate">Proyecto Activo</p>
          </div>
        </div>
      </div>
    </div>
  );
};
