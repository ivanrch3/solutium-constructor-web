import React, { createContext, useContext, useEffect, useState } from 'react';
import { Profile, Project, AuthContextType } from '../types';
import { toCamelCase } from '../lib/utils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  const setDemoMode = () => {
    setIsDemo(true);
    setUser({
      id: 'demo-user',
      fullName: 'Usuario Demo',
      email: 'demo@solutium.app',
      role: 'super-admin',
      avatarUrl: 'https://picsum.photos/seed/user/200',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setProject({
      id: 'demo-project',
      ownerId: 'demo-user',
      name: 'Proyecto Demo',
      brandColors: ['#3b82f6', '#1e40af'],
      logoUrl: 'https://solutium.app/logo.png',
      uiStyle: 'modern',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setProjectId('demo-project');
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      // Mocking initial load
      setUser({
        id: 'proj_user_123',
        fullName: 'Ivan Solutium',
        email: 'ivanrch3@gmail.com',
        role: 'admin',
        avatarUrl: 'https://picsum.photos/seed/ivan/200',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setProject({
        id: 'proj_123',
        ownerId: 'proj_user_123',
        name: 'Mi Proyecto Solutium',
        brandColors: ['#3b82f6', '#1e40af'],
        logoUrl: 'https://solutium.app/logo.png',
        uiStyle: 'minimal',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setProjectId('proj_123');
      setLoading(false);
    };

    init();
  }, []);

  return (
    <AuthContext.Provider value={{ user, project, projectId, loading, isDemo, setDemoMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
