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
  assets: any[];
}

export const SolutiumContext = createContext<SolutiumContextType | undefined>(undefined);

export const SolutiumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { config: payload, isReady, saveData } = useSolutium();
  
  // 1. Añadimos estado interno para los datos
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);

  // 2. Efecto reactivo: Cuando el payload cambia, actualizamos el estado
  useEffect(() => {
    if (payload) {
      if (payload.customers_data) {
        setCustomers(payload.customers_data);
      }
      if (payload.products_data) {
        setProducts(payload.products_data);
      }
      if (payload.assets_data) {
        setAssets(payload.assets_data);
      }
    }
  }, [payload]); // <--- ESTA ES LA CLAVE: Se ejecuta cada vez que el payload cambia

  // Función para obtener clientes directamente desde Supabase usando RLS
  const fetchCustomers = async () => {
    // Prioridad a los datos de la App Madre
    if (payload && payload.crm_data) {
      return payload.crm_data;
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
    if (payload && payload.products_data) {
      return payload.products_data;
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
      user_id: 'dev-user-1',
      project_id: 'dev-project-1',
      role: 'super-admin',
      timestamp: Date.now(),
      scopes: ['profile', 'project', 'crm', 'products', 'calendar', 'assets', 'integrations'],
      user_profile: {
        id: 'dev-user-1',
        full_name: 'Usuario Dev',
        email: 'dev@solutium.app',
        avatar_url: 'https://picsum.photos/seed/user/200',
        role: 'super-admin',
        language: 'es',
        business_name: 'Solutium Dev Studio',
        onboarding_completed: true,
        schema_version: '3.0.0'
      },
      project_data: {
        name: 'Proyecto de Desarrollo',
        colors: ['#3b82f6', '#1e293b', '#f59e0b'],
        logo_url: 'https://via.placeholder.com/150',
        font_family: 'Inter',
        base_size: '16px',
        socials: {
          facebook: 'https://facebook.com/solutium',
          twitter: 'https://twitter.com/solutium',
          instagram: 'https://instagram.com/solutium',
          linkedin: 'https://linkedin.com/company/solutium'
        }
      },
      customers_data: [
        { 
          id: '1', 
          name: 'Empresa Alpha', 
          email: 'contacto@alpha.com', 
          status: 'active',
          company: 'Alpha Digital',
          source: 'Web',
          created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
          schema_version: '1.0.0'
        },
        { 
          id: '2', 
          name: 'Soluciones Beta', 
          email: 'info@beta.io', 
          status: 'pending',
          company: 'Beta Systems',
          source: 'Referral',
          created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
          schema_version: '1.0.0'
        },
        { 
          id: '3', 
          name: 'Gamma Corp', 
          email: 'ventas@gamma.net', 
          status: 'active',
          company: 'Gamma Global',
          source: 'LinkedIn',
          created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
          schema_version: '1.0.0'
        }
      ],
      team_members_data: [
        { 
          id: 'tm-1', 
          name: 'Ana García', 
          role: 'Project Manager', 
          email: 'ana@solutium.app',
          avatar_url: 'https://picsum.photos/seed/ana/100',
          status: 'active',
          assigned_at: new Date().toISOString(),
          schema_version: '1.0.0'
        },
        { 
          id: 'tm-2', 
          name: 'Roberto Sanz', 
          role: 'Lead Developer', 
          email: 'roberto@solutium.app',
          status: 'active',
          assigned_at: new Date().toISOString(),
          schema_version: '1.0.0'
        },
        { 
          id: 'tm-3', 
          name: 'Elena Mora', 
          role: 'UI/UX Designer', 
          email: 'elena@solutium.app',
          avatar_url: 'https://picsum.photos/seed/elena/100',
          status: 'away',
          assigned_at: new Date().toISOString(),
          schema_version: '1.0.0'
        }
      ],
      projects_data: [
        { 
          id: 'proj-101', 
          name: 'Rediseño Web Corporativa', 
          industry: 'Tecnología',
          email: 'contacto@corporativa.com',
          website: 'https://corporativa.com',
          is_master: true,
          updated_at: new Date().toISOString(),
          assets: [
            { id: 'asset-101-1', name: 'Home Page', modules: [] },
            { id: 'asset-101-2', name: 'Contact Us', modules: [] }
          ]
        },
        { 
          id: 'proj-102', 
          name: 'App Móvil v2.0', 
          industry: 'Software',
          email: 'soporte@appv2.io',
          is_master: false,
          updated_at: new Date(Date.now() - 86400000).toISOString(),
          assets: [
            { id: 'asset-102-1', name: 'Landing Page', modules: [] }
          ]
        }
      ],
      projects: [
        {
          id: 'dev-project-1',
          name: 'Proyecto de Desarrollo',
          assets: [
            { id: 'asset-1', name: 'Página de Inicio', modules: [] },
            { id: 'asset-2', name: 'Servicios', modules: [] },
            { id: 'asset-3', name: 'Contacto', modules: [] }
          ]
        }
      ],
      calendar_config: {
        timezone: 'Europe/Madrid',
        working_days: [1, 2, 3, 4, 5],
        opening_time: '08:30',
        closing_time: '19:00'
      },
      apps_data: [
        {
          id: 'app-1',
          name: 'CRM Pro',
          url: 'https://crm.solutium.app',
          description: 'Gestión avanzada de clientes y automatización de ventas.',
          category: 'Ventas',
          is_featured: true,
          is_new: false,
          requires_pro: true,
          logo_url: 'https://picsum.photos/seed/crm/100'
        },
        {
          id: 'app-2',
          name: 'Solutium Mail',
          url: 'https://mail.solutium.app',
          description: 'Plataforma de email marketing con segmentación inteligente.',
          category: 'Marketing',
          is_featured: false,
          is_new: true,
          requires_pro: false,
          logo_url: 'https://picsum.photos/seed/mail/100'
        },
        {
          id: 'app-3',
          name: 'Analytics Dashboard',
          url: 'https://stats.solutium.app',
          description: 'Visualización de datos en tiempo real de todos tus canales.',
          category: 'Datos',
          is_coming_soon: true,
          logo_url: 'https://picsum.photos/seed/stats/100'
        }
      ],
      project_apps_data: [
        {
          project_id: 'dev-project-1',
          app_id: 'app-1',
          settings: { notifications: true },
          installed_at: new Date().toISOString(),
          schema_version: '1.0.0'
        },
        {
          project_id: 'dev-project-1',
          app_id: 'app-2',
          settings: { campaign_mode: 'active' },
          installed_at: new Date(Date.now() - 172800000).toISOString(),
          schema_version: '1.0.0'
        }
      ],
      integrations_data: [
        {
          id: 'int-1',
          user_id: 'dev-user-1',
          provider: 'google',
          access_token: 'ya29.mock-token-google',
          refresh_token: '1//mock-refresh-token',
          expires_at: new Date(Date.now() + 3600000).toISOString(),
          metadata: { email: 'dev@solutium.app', scopes: ['gmail.read', 'calendar.events'] },
          created_at: new Date(Date.now() - 864000000).toISOString(),
          updated_at: new Date().toISOString(),
          schema_version: '1.0.0'
        },
        {
          id: 'int-2',
          user_id: 'dev-user-1',
          provider: 'slack',
          access_token: 'xoxb-mock-token-slack',
          metadata: { team_name: 'Solutium Dev', channel: '#notifications' },
          created_at: new Date(Date.now() - 432000000).toISOString(),
          updated_at: new Date().toISOString(),
          schema_version: '1.0.0'
        }
      ],
      assets_data: [
        {
          id: 'asset-1',
          name: 'Manual de Identidad Corporativa',
          type: 'PDF',
          url: 'https://example.com/manual.pdf',
          origin_app: 'Brand Manager',
          author: 'Elena Mora',
          status: 'published',
          tags: ['branding', 'manual', 'v1'],
          metadata: { pages: 45, size: '12MB' },
          created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
          updated_at: new Date().toISOString(),
          schema_version: '1.0.0'
        },
        {
          id: 'asset-2',
          name: 'Logo Principal (Vector)',
          type: 'SVG',
          url: 'https://example.com/logo.svg',
          origin_app: 'Design Studio',
          author: 'Elena Mora',
          status: 'published',
          tags: ['logo', 'vector', 'master'],
          metadata: { dimensions: 'scalable', transparent: true },
          created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
          updated_at: new Date().toISOString(),
          schema_version: '1.0.0'
        },
        {
          id: 'asset-3',
          name: 'Borrador Campaña Verano',
          type: 'DOCX',
          url: 'https://example.com/draft.docx',
          origin_app: 'Content Editor',
          author: 'Ana García',
          status: 'draft',
          tags: ['marketing', 'draft', 'summer'],
          metadata: { wordCount: 1200 },
          created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
          updated_at: new Date().toISOString(),
          schema_version: '1.0.0'
        }
      ],
      profiles_data: [
        {
          id: 'dev-user-1',
          full_name: 'Ivan Developer',
          email: 'ivanrch3@gmail.com',
          avatar_url: 'https://picsum.photos/seed/ivan/200',
          role: 'Administrator',
          language: 'es',
          phone: '+34 600 000 000',
          ui_style: 'modern',
          active_theme: 'dark',
          font_family: 'Inter',
          base_size: '16px',
          border_radius: '12px',
          theme_preference: 'system',
          colored_sidebar_icons: true,
          subscription_plan: 'Enterprise',
          onboarding_completed: true,
          email_it_id: 'it-ivan-123',
          updated_at: new Date().toISOString(),
          has_completed_tour: true,
          business_name: 'Solutium Labs',
          schema_version: '1.0.0'
        },
        {
          id: 'dev-user-2',
          full_name: 'Ana García',
          email: 'ana@solutium.app',
          avatar_url: 'https://picsum.photos/seed/ana/200',
          role: 'Editor',
          language: 'en',
          phone: '+34 600 000 001',
          ui_style: 'classic',
          active_theme: 'light',
          font_family: 'Roboto',
          base_size: '14px',
          border_radius: '8px',
          theme_preference: 'light',
          colored_sidebar_icons: false,
          subscription_plan: 'Pro',
          onboarding_completed: true,
          email_it_id: 'it-ana-456',
          updated_at: new Date().toISOString(),
          has_completed_tour: true,
          business_name: 'Solutium Labs',
          schema_version: '1.0.0'
        }
      ],
      current_asset: {
        id: 'asset-uuid-999',
        name: 'Landing Page Campaña Q1',
        type: 'landing-page',
        data: {
          version: '3.0.1',
          environment: 'staging',
          autoSync: true
        }
      },
      supabase_data: {
        url: 'https://placeholder.supabase.co',
        anon_key: 'placeholder'
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
      assets
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
