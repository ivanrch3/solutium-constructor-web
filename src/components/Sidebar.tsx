import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { 
  LayoutDashboard, 
  Database, 
  Settings, 
  LogOut, 
  User,
  PlusCircle,
  Layers,
  Palette,
  Eye,
  Save
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const { user, project } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === 'admin' || user?.role === 'super-admin';

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Layers, label: 'Constructor', path: '/builder' },
    ...(isAdmin ? [{ icon: Database, label: 'Datos', path: '/data' }] : []),
    { icon: Settings, label: 'Configuración', path: '/settings' },
  ];

  const brandColor = project?.brandColors?.[0] || '#3b82f6';

  return (
    <aside className="w-64 bg-white border-right border-gray-200 flex flex-col h-screen fixed left-0 top-0 z-50">
      {/* Logo Section */}
      <div className="p-6 border-bottom border-gray-100 flex items-center gap-3">
        {project?.logoUrl ? (
          <img src={project.logoUrl} alt="Logo" className="h-8 w-auto" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold">
            {project?.name?.charAt(0) || 'C'}
          </div>
        )}
        <span className="font-bold text-gray-900 truncate">{project?.name || 'Constructor Web'}</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
              location.pathname === item.path 
                ? "bg-gray-100 text-gray-900" 
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            )}
            style={location.pathname === item.path ? { borderLeft: `4px solid ${brandColor}` } : {}}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-top border-gray-100">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full border border-gray-200" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
              <User className="w-6 h-6" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.fullName || 'Usuario'}</p>
            <p className="text-xs text-gray-500 truncate capitalize">{user?.role || 'User'}</p>
          </div>
          <LogOut className="w-4 h-4 text-gray-400 hover:text-red-500" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
