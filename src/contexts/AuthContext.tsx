import React, { createContext, useContext, useEffect, useState } from 'react';
import { Profile, Project, AuthContextType } from '../types';
import { supabase, initialPayload } from '../services/supabase';
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
      if (initialPayload) {
        const { projectId: pId, userId } = initialPayload;
        setProjectId(pId);
        
        try {
          // Fetch profile and project in parallel using the singleton client
          const [profileRes, projectRes] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', userId).single(),
            supabase.from('projects').select('*').eq('id', pId).single()
          ]);
          
          if (profileRes.error) throw profileRes.error;
          if (projectRes.error) throw projectRes.error;
          
          setUser(toCamelCase(profileRes.data));
          setProject(toCamelCase(projectRes.data));
        } catch (error) {
          console.error('Error fetching auth data:', error);
        }
      }
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
