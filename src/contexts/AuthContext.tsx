import React, { createContext, useContext, useEffect, useState } from 'react';
import { Profile, Project, AuthContextType, Product, Customer, Asset } from '../types';
import { initSupabase, getSupabase } from '../services/supabase';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomerList] = useState<Customer[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [isEmbedded, setIsEmbedded] = useState(false);

  const setDemoMode = () => {
    setIsDemo(true);
    setUser({
      id: 'demo-user',
      fullName: 'Usuario Demo',
      email: 'demo@solutium.app',
      role: 'super-admin',
      uiStyle: 'minimal',
      activeTheme: 'light',
      fontFamily: 'Inter',
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
    const embedded = window.self !== window.top || !!window.opener;
    setIsEmbedded(embedded);

    const initialize = async () => {
      const hash = window.location.hash.substring(1);
      if (!hash.includes('token=')) {
        setDemoMode();
        return;
      }

      try {
        const tokenPart = hash.split('token=')[1];
        const payloadBase64 = tokenPart.split('.')[0];
        
        // Robust UTF-8 decoding logic from prompt
        const decodedPayload = JSON.parse(
          decodeURIComponent(
            Array.prototype.map.call(
              atob(payloadBase64.replace(/ /g, '+')), 
              (c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join('')
          )
        );

        console.log('[Satellite] Decoded Token Payload:', decodedPayload);

        const { projectId: pid, userId: uid, sessionToken } = decodedPayload;
        setProjectId(pid);

        // Initialize Supabase Singleton with sessionToken
        const supabase = initSupabase(sessionToken);

        // Fetch Project Data (Dynamic Styles)
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', pid)
          .single();

        if (projectData) {
          setProject(projectData);
          // Apply Dynamic Styles
          if (projectData.brand_colors && projectData.brand_colors.length > 0) {
            document.documentElement.style.setProperty('--primary', projectData.brand_colors[0]);
            document.documentElement.style.setProperty('--primary-dark', projectData.brand_colors[1] || projectData.brand_colors[0]);
          }
          if (projectData.logo_url) {
            // Logo is handled in components
          }
        }

        // Fetch User Profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', uid)
          .single();

        if (profileData) setUser(profileData);

        // Fetch other data based on contracts
        const [
          { data: productsData },
          { data: customersData },
          { data: assetsData }
        ] = await Promise.all([
          supabase.from('products').select('*').eq('project_id', pid),
          supabase.from('customers').select('*').eq('project_id', pid),
          supabase.from('assets').select('*').eq('project_id', pid)
        ]);

        if (productsData) setProducts(productsData);
        if (customersData) setCustomerList(customersData);
        if (assetsData) setAssets(assetsData);

      } catch (error) {
        console.error('[Satellite] Initialization Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!isDemo) {
      initialize();
    }
  }, [isDemo]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      project, 
      projectId, 
      products, 
      customers: customers,
      members,
      integrations,
      assets,
      loading, 
      isDemo,
      isEmbedded, 
      setDemoMode 
    }}>
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
