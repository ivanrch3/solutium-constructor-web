import React, { createContext, useContext, useEffect, useState } from 'react';
import { Profile, Project, AuthContextType } from '../types';
import { toCamelCase } from '../lib/utils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
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
    // Detect if running in iframe or has projectId in URL
    const searchParams = new URLSearchParams(window.location.search);
    const hasProjectId = searchParams.has('projectId');
    const embedded = window.self !== window.top || hasProjectId;
    setIsEmbedded(embedded);

    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      
      if (data && data.type === 'SOLUTIUM_CONFIG') {
        console.log('SOLUTIUM_CONFIG received:', data.payload);
        const { user: userData, project: projectData, products: productsData } = data.payload;
        
        if (userData) setUser(userData);
        if (projectData) {
          setProject(projectData);
          setProjectId(projectData.id);
        }
        if (productsData) setProducts(productsData);
        
        setLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);

    // Notify Mother App that we are ready
    if (embedded) {
      window.parent.postMessage({ type: 'SOLUTIUM_READY' }, '*');
      
      // Even if embedded, if we don't get a config after 3 seconds, 
      // maybe the mother app is not sending it. 
      // But we should probably wait longer or show a specific loading state.
    } else {
      // If not embedded, use mocks after a short delay
      const timer = setTimeout(() => {
        if (loading && !isDemo) {
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
          setProducts([
            {
              id: 'prod_1',
              projectId: 'proj_123',
              name: 'Producto Premium',
              description: 'Una descripción increíble del producto.',
              price: 99.99,
              image: 'https://picsum.photos/seed/prod1/400/400',
              status: 'active',
            },
            {
              id: 'prod_2',
              projectId: 'proj_123',
              name: 'Producto Básico',
              description: 'Algo más sencillo pero útil.',
              price: 49.99,
              image: 'https://picsum.photos/seed/prod2/400/400',
              status: 'active',
            }
          ]);
          setLoading(false);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }

    return () => window.removeEventListener('message', handleMessage);
  }, [loading, isDemo]);

  return (
    <AuthContext.Provider value={{ user, project, projectId, products, loading, isDemo, isEmbedded, setDemoMode }}>
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
