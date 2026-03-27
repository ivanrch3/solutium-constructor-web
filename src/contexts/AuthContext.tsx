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
    // 1. Detect if running in iframe (Strict check)
    const embedded = window.self !== window.top;
    setIsEmbedded(embedded);

    // 2. Define message handler
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

    // 3. Register listener
    window.addEventListener('message', handleMessage);

    // 4. Handshake Logic
    if (embedded) {
      // Send SOLUTIUM_READY every 500ms until we get a config
      const handshakeInterval = setInterval(() => {
        console.log('Sending SOLUTIUM_READY to Mother App...');
        window.parent.postMessage({ type: 'SOLUTIUM_READY' }, '*');
      }, 500);
      
      // Safety timeout: If no config received in 20s, allow demo mode
      const safetyTimer = setTimeout(() => {
        setLoading((prevLoading) => {
          if (prevLoading) {
            console.warn('Handshake timeout: No config received from Mother App after 20s');
          }
          return prevLoading;
        });
        clearInterval(handshakeInterval);
      }, 20000);
      
      // We need to clear the interval when loading becomes false (config received)
      // But since we are in a useEffect with [] dependencies, we can't easily 
      // react to loading state changes here without re-running the effect.
      // However, the handleMessage will be called, and it sets loading to false.
      // We can check the loading state inside the interval or just let it run 
      // until the component unmounts or we clear it in handleMessage.
      
      // Let's modify handleMessage to clear the interval
      const originalHandler = handleMessage;
      const wrappedHandler = (event: MessageEvent) => {
        if (event.data && event.data.type === 'SOLUTIUM_CONFIG') {
          clearInterval(handshakeInterval);
          clearTimeout(safetyTimer);
        }
        originalHandler(event);
      };
      
      window.removeEventListener('message', handleMessage);
      window.addEventListener('message', wrappedHandler);
      
      return () => {
        window.removeEventListener('message', wrappedHandler);
        clearInterval(handshakeInterval);
        clearTimeout(safetyTimer);
      };
    } else {
      // Standalone mode: Load mocks or demo data
      const timer = setTimeout(() => {
        if (!isDemo) {
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
      }, 500);
      
      return () => {
        window.removeEventListener('message', handleMessage);
        clearTimeout(timer);
      };
    }
  }, [isDemo]);

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
