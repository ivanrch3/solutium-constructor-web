// src/context/SatelliteContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { SolutiumPayload, useSolutium, SolutiumLog } from '../lib/solutium-sdk';
import { supabase } from '../lib/supabase';

interface SolutiumContextType {
  payload: SolutiumPayload | null;
  isReady: boolean;
  saveData: (assetId: string, data: any, metadata?: any) => void;
  fetchCustomers: () => Promise<any[]>;
  fetchProducts: () => Promise<any[]>;
  simulateConnection: () => void;
  customers: any[];
  products: any[];
  assets: any[];
  logs: SolutiumLog[];
}

export const SolutiumContext = createContext<SolutiumContextType | undefined>(undefined);

export const SolutiumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { config: payload, isReady, saveData, logs } = useSolutium();
  
  // 1. Añadimos estado interno para los datos
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);

  // 2. Efecto reactivo: Cuando el payload cambia, actualizamos el estado
  useEffect(() => {
    if (payload) {
      const customersData = payload.customers || (payload as any).crmData || (payload as any).crm_data;
      if (customersData) {
        setCustomers(customersData);
      }
      
      const productsData = payload.products || (payload as any).products_data;
      if (productsData) {
        setProducts(productsData);
      }
      
      const assetsData = payload.assets || (payload as any).assets_data;
      if (assetsData) {
        setAssets(assetsData);
      }
    }
  }, [payload]); // <--- ESTA ES LA CLAVE: Se ejecuta cada vez que el payload cambia

  // Función para obtener clientes directamente desde Supabase usando RLS
  const fetchCustomers = async () => {
    if (!isReady || !(supabase as any).isInitialized) {
      console.warn('[Boot Observer] Supabase no listo para fetchCustomers');
      return [];
    }
    // Prioridad a los datos de la App Madre
    const customersData = payload?.customers || (payload as any)?.crmData || (payload as any)?.crm_data;
    if (customersData) {
      return customersData;
    }

    try {
      let query = supabase.from('customers').select('*');
      
      // Filtrar por proyecto si tenemos el ID (Estándar V2)
      if (payload?.projectId) {
        query = query.eq('project_id', payload.projectId);
      }

      const { data, error } = await query;
        
      if (error) {
        console.error('Error fetching customers from Supabase:', error);
        throw error;
      }
      return data || [];
    } catch (e) {
      console.warn("No se pudieron obtener los clientes de Supabase, usando fallback vacío.");
      return [];
    }
  };

  // Función para obtener productos directamente desde Supabase usando RLS
  const fetchProducts = async () => {
    if (!isReady || !(supabase as any).isInitialized) {
      console.warn('[Boot Observer] Supabase no listo para fetchProducts');
      return [];
    }
    // Prioridad a los datos de la App Madre
    const productsData = payload?.products || (payload as any)?.products_data || (payload as any)?.inventory;
    if (productsData) {
      return productsData;
    }

    try {
      let query = supabase.from('products').select('*');
      
      // Filtrar por proyecto si tenemos el ID (Estándar V2)
      if (payload?.projectId) {
        query = query.eq('project_id', payload.projectId);
      }

      const { data, error } = await query;
        
      if (error) {
        console.error('Error fetching products from Supabase:', error);
        throw error;
      }
      
      // Mapear snake_case a camelCase para compatibilidad con la UI si es necesario
      return (data || []).map((p: any) => ({
        ...p,
        unitCost: p.unit_cost,
        imageUrl: p.image_url,
        appData: p.app_data,
        projectId: p.project_id
      }));
    } catch (e) {
      console.warn("No se pudieron obtener los productos de Supabase, usando fallback vacío.");
      return [];
    }
  };

  const simulateConnection = () => {
    const mockPayload: SolutiumPayload = {
      userId: 'dev-user-1',
      projectId: 'dev-project-1',
      role: 'super-admin',
      timestamp: Date.now(),
      scopes: ['profile', 'project', 'crm', 'products', 'calendar', 'assets', 'integrations'],
      environment: 'development',
      profile: {
        id: 'dev-user-1',
        fullName: 'Usuario Dev',
        email: 'dev@solutium.app',
        avatarUrl: 'https://picsum.photos/seed/user/200',
        role: 'super-admin',
        language: 'es',
        businessName: 'Solutium Dev Studio',
        onboardingCompleted: true,
        schemaVersion: '4.0.0',
        uiStyle: 'modern',
        activeTheme: 'dark',
        fontFamily: 'Inter',
        baseSize: '16px',
        borderRadius: '12px',
        themePreference: 'system',
        subscriptionPlan: 'pro'
      },
      project: {
        id: 'dev-project-1',
        name: 'Proyecto de Desarrollo',
        brandColors: ['#3b82f6', '#1e293b', '#f59e0b', '#ffffff', '#f3f4f6', '#111827'],
        logoUrl: 'https://via.placeholder.com/150',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        installedAppIds: [],
        assignedMemberIds: []
      },
      projects: [],
      customers: [],
      members: [],
      assets: [],
      currentAsset: null,
      products: [],
      integrations: [],
      supabaseData: {
        url: 'https://placeholder.supabase.co',
        anonKey: 'placeholder'
      }
    };
    
    // Enviar el mock payload usando postMessage para que useSolutium lo intercepte
    window.postMessage({ type: 'SOLUTIUM_CONFIG', payload: mockPayload }, window.location.origin);
  };

  return (
    <SolutiumContext.Provider value={{ 
      payload, 
      isReady, 
      saveData, 
      fetchCustomers, 
      fetchProducts, 
      simulateConnection,
      customers,
      products,
      assets,
      logs
    }}>
      {children}
    </SolutiumContext.Provider>
  );
};

export const useSolutiumContext = () => {
  const context = useContext(SolutiumContext);
  if (context === undefined) throw new Error('useSolutiumContext must be used within a SolutiumProvider');
  return context;
};
