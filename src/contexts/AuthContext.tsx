import React, { createContext, useContext, useEffect, useState } from 'react';
import { Profile, Project, AuthContextType } from '../types';
import { decodeToken } from '../lib/utils';
import { getSupabaseClient } from '../services/supabase';

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
      full_name: 'Usuario Demo',
      email: 'demo@solutium.app',
      role: 'super-admin',
      avatar_url: 'https://picsum.photos/seed/user/200',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    setProject({
      id: 'demo-project',
      owner_id: 'demo-user',
      name: 'Proyecto Demo',
      brand_colors: ['#3b82f6', '#1e40af'],
      logo_url: 'https://solutium.app/logo.png',
      ui_style: 'modern',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    setProjectId('demo-project');
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      const hash = window.location.hash;
      if (hash.startsWith('#token=')) {
        const token = hash.replace('#token=', '');
        const payload = decodeToken(token);
        
        if (payload) {
          const { projectId, userId, sessionToken } = payload;
          setProjectId(projectId);
          
          const supabase = getSupabaseClient(sessionToken);
          
          try {
            // Fetch profile
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single();
            
            // Fetch project
            const { data: projectData } = await supabase
              .from('projects')
              .select('*')
              .eq('id', projectId)
              .single();
            
            setUser(profileData);
            setProject(projectData);
          } catch (error) {
            console.error('Error fetching auth data:', error);
          }
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
