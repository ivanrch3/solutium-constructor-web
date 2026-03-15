// src/context/SatelliteContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { SolutiumPayload, useSolutium } from '../lib/solutium-sdk';
import { supabase } from '../lib/supabase';

interface SolutiumContextType {
  payload: SolutiumPayload | null;
  isReady: boolean;
  saveData: (data: any, metadata?: any) => void;
  fetchCustomers: () => Promise<any[]>;
  fetchProducts: () => Promise<any[]>;
  simulateConnection: () => void;
  customers: any[];
  products: any[];
}

export const SolutiumContext = createContext<SolutiumContextType | undefined>(undefined);

export const SolutiumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { config: payload, isReady, saveData } = useSolutium();
  
  // 1. Añadimos estado interno para los datos
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // 2. Efecto reactivo: Cuando el payload cambia, actualizamos el estado
  useEffect(() => {
    if (payload) {
      if (payload.crmData?.customers) {
        setCustomers(payload.crmData.customers);
      }
      if (payload.productsData?.products) {
        setProducts(payload.productsData.products);
      }
    }
  }, [payload]); // <--- ESTA ES LA CLAVE: Se ejecuta cada vez que el payload cambia

  // Función para obtener clientes directamente desde Supabase usando RLS
  const fetchCustomers = async () => {
    // Prioridad a los datos de la App Madre
    if (payload && payload.crmData && payload.crmData.customers) {
      return payload.crmData.customers;
    }

    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*');
        
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
    // Prioridad a los datos de la App Madre
    if (payload && payload.productsData && payload.productsData.products) {
      return payload.productsData.products;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');
        
      if (error) {
        console.error('Error fetching products from Supabase:', error);
        throw error;
      }
      return data || [];
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
      scopes: ['profile', 'project', 'crm', 'products', 'calendar', 'assets'],
      userProfile: {
        name: 'Usuario Dev',
        email: 'dev@solutium.app'
      },
      projectData: {
        name: 'Proyecto de Desarrollo',
        colors: ['#3b82f6', '#1e293b', '#f59e0b'],
        logoUrl: 'https://via.placeholder.com/150',
        fontFamily: 'Inter',
        baseSize: '16px',
        socials: {
          facebook: 'https://facebook.com/solutium',
          twitter: 'https://twitter.com/solutium',
          instagram: 'https://instagram.com/solutium',
          linkedin: 'https://linkedin.com/company/solutium'
        }
      },
      crmData: {
        apiUrl: 'https://api.mock.solutium.app',
        authToken: 'mock-token',
        customers: [
          { id: '1', name: 'Empresa Alpha', email: 'contacto@alpha.com', status: 'Active' },
          { id: '2', name: 'Soluciones Beta', email: 'info@beta.io', status: 'Pending' },
          { id: '3', name: 'Gamma Corp', email: 'ventas@gamma.net', status: 'Active' }
        ],
        leads: [
          { id: 'l1', name: 'Juan Pérez', email: 'juan@gmail.com' }
        ]
      },
      productsData: {
        apiUrl: 'https://api.mock.solutium.app',
        authToken: 'mock-token',
        products: [
          { id: 'p1', name: 'Licencia Enterprise', price: '999', description: 'Acceso total para grandes corporaciones.', imageUrl: 'https://picsum.photos/seed/p1/400/300' },
          { id: 'p2', name: 'Módulo CRM Pro', price: '249', description: 'Gestión avanzada de clientes y leads.', imageUrl: 'https://picsum.photos/seed/p2/400/300' },
          { id: 'p3', name: 'Soporte 24/7', price: '150', description: 'Asistencia técnica prioritaria en todo momento.', imageUrl: 'https://picsum.photos/seed/p3/400/300' }
        ]
      },
      teamMembers: [
        { name: 'Ana García', role: 'Project Manager', email: 'ana@solutium.app' },
        { name: 'Roberto Sanz', role: 'Lead Developer', email: 'roberto@solutium.app' },
        { name: 'Elena Mora', role: 'UI/UX Designer', email: 'elena@solutium.app' }
      ],
      activeProjects: [
        { id: 'proj-101', name: 'Rediseño Web Corporativa', description: 'Actualización de la identidad visual y UX.', status: 'active', updatedAt: Date.now() },
        { id: 'proj-102', name: 'App Móvil v2.0', description: 'Nueva versión con soporte offline.', status: 'active', updatedAt: Date.now() - 86400000 }
      ],
      calendarConfig: {
        timezone: 'Europe/Madrid',
        workingDays: [1, 2, 3, 4, 5],
        openingTime: '08:30',
        closingTime: '19:00'
      },
      currentAsset: {
        id: 'asset-uuid-999',
        name: 'Landing Page Campaña Q1',
        type: 'landing-page',
        data: {
          version: '3.0.1',
          environment: 'staging',
          autoSync: true
        }
      },
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
      products
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
