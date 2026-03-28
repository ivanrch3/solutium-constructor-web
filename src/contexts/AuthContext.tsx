import React, { createContext, useContext, useEffect, useState } from 'react';
import { Profile, Project, AuthContextType } from '../types';
import { toCamelCase } from '../lib/utils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
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
    // 1. Detect if running in iframe or popup (Strict check)
    const embedded = window.self !== window.top || !!window.opener;
    setIsEmbedded(embedded);

    const target = window.opener || window.parent;

    // 2. Robust Token Parser (Fallback)
    const parseTokenFromHash = () => {
      const hash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : hash);
      const token = hashParams.get('token');

      if (token) {
        try {
          const cleanToken = decodeURIComponent(token).replace(/ /g, '+');
          const base64Payload = cleanToken.split('.')[0];
          const tokenData = JSON.parse(atob(base64Payload));
          
          console.log('Token data from hash (S.I.P. v4.0 Fallback):', tokenData);
          
          if (tokenData.projectId) setProjectId(tokenData.projectId);
          if (tokenData.userId) {
            setUser(prev => prev ? { ...prev, id: tokenData.userId } : { id: tokenData.userId } as Profile);
          }
        } catch (e) {
          console.warn('Failed to parse token from hash:', e);
        }
      }
    };

    // 3. Define message handler (Unified Schema v4.0)
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      
      if (data && data.type === 'SOLUTIUM_CONFIG') {
        console.log('SOLUTIUM_CONFIG received (v4.0):', data.payload);
        const config = data.payload;
        
        if (config.profile) setUser(config.profile);
        if (config.project) {
          setProject(config.project);
          setProjectId(config.project.id);
          
          // Apply Theme Visual
          if (config.project.brandColors && config.project.brandColors.length > 0) {
            document.documentElement.style.setProperty('--primary', config.project.brandColors[0]);
            document.documentElement.style.setProperty('--primary-dark', config.project.brandColors[1] || config.project.brandColors[0]);
          }
          if (config.project.fontFamily) {
            document.documentElement.style.setProperty('--font-family', config.project.fontFamily);
          }
        }
        if (config.products) setProducts(config.products);
        if (config.customers) setCustomers(config.customers);
        if (config.members) setMembers(config.members);
        if (config.integrations) setIntegrations(config.integrations);
        if (config.assets) setAssets(config.assets);
        
        // Send ACK back
        if (target) {
          target.postMessage({ 
            type: 'SOLUTIUM_ACK', 
            payload: { status: 'connected', timestamp: Date.now() } 
          }, '*');
        }
        
        setLoading(false);
      }
    };

    // 4. Register listener
    window.addEventListener('message', handleMessage);

    // 5. Handshake Logic (S.I.P. v4.0)
    let handshakeInterval: any;
    let fallbackTimer: any;

    if (embedded) {
      // Send SOLUTIUM_SATELLITE_READY immediately and then every 500ms
      const sendReady = () => {
        console.log('Sending SOLUTIUM_SATELLITE_READY (v2.1.0) to Mother App...');
        if (target) {
          target.postMessage({ 
            type: 'SOLUTIUM_SATELLITE_READY', 
            payload: { version: '2.1.0', timestamp: Date.now() } 
          }, '*');
        }
      };

      sendReady();
      handshakeInterval = setInterval(sendReady, 500);
      
      // Fallback: If no config in 3s, try hash token
      fallbackTimer = setTimeout(() => {
        parseTokenFromHash();
      }, 3000);

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
      
      // Clear timers on config reception
      const originalHandler = handleMessage;
      const wrappedHandler = (event: MessageEvent) => {
        if (event.data && event.data.type === 'SOLUTIUM_CONFIG') {
          clearInterval(handshakeInterval);
          clearTimeout(fallbackTimer);
          clearTimeout(safetyTimer);
        }
        originalHandler(event);
      };
      
      window.removeEventListener('message', handleMessage);
      window.addEventListener('message', wrappedHandler);
      
      return () => {
        window.removeEventListener('message', wrappedHandler);
        clearInterval(handshakeInterval);
        clearTimeout(fallbackTimer);
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
    <AuthContext.Provider value={{ 
      user, 
      project, 
      projectId, 
      products, 
      customers,
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
