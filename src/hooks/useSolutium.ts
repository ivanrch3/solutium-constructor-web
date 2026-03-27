import { useState, useEffect } from 'react';

export interface SolutiumProject {
  id: string;
  name: string;
  fontFamily?: string;
  baseSize?: string;
  borderRadius?: string;
  uiStyle?: 'minimal' | 'glass' | 'brutal' | 'luxury';
  activeTheme?: 'light' | 'dark' | 'system';
}

export interface SolutiumProfile {
  fontFamily: string;
  baseSize: string;
  borderRadius: string;
  uiStyle: 'minimal' | 'glass' | 'brutal' | 'luxury';
  activeTheme: 'light' | 'dark' | 'system';
}

export interface SolutiumProduct {
  id: string;
  projectId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  status: 'active' | 'inactive';
}

export interface SolutiumConfig {
  project: SolutiumProject;
  profile: SolutiumProfile;
  products: SolutiumProduct[];
}

export const useSolutium = () => {
  // Mocking the SDK behavior
  const [config, setConfig] = useState<SolutiumConfig>({
    project: {
      id: 'proj_123',
      name: 'Mi Proyecto Solutium',
      fontFamily: 'Inter',
      baseSize: '16px',
      borderRadius: '12px',
      uiStyle: 'minimal',
      activeTheme: 'light',
    },
    profile: {
      fontFamily: 'Inter',
      baseSize: '16px',
      borderRadius: '8px',
      uiStyle: 'minimal',
      activeTheme: 'light',
    },
    products: [
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
      },
      {
        id: 'prod_3',
        projectId: 'other_proj',
        name: 'Producto Ajeno',
        description: 'No debería verse.',
        price: 10.00,
        image: 'https://picsum.photos/seed/prod3/400/400',
        status: 'active',
      },
    ],
  });

  const saveData = async (data: any) => {
    console.log('Saving data via Solutium SDK:', data);
    // Simulate API call
    return { success: true };
  };

  const publishSite = async () => {
    console.log('Publishing site via Solutium SDK...');
    // Simulate API call
    return { success: true, url: 'https://mi-sitio.solutium.app' };
  };

  useEffect(() => {
    // Apply CSS variables based on config
    const root = document.documentElement;
    const project = config.project;
    const profile = config.profile;

    const fontFamily = project.fontFamily || profile.fontFamily;
    const baseSize = project.baseSize || profile.baseSize;
    const borderRadius = project.borderRadius || profile.borderRadius;

    root.style.setProperty('--font-family', fontFamily);
    root.style.setProperty('--base-size', baseSize);
    root.style.setProperty('--border-radius', borderRadius);
    
    // Set theme class
    const theme = project.activeTheme || profile.activeTheme;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [config]);

  return {
    config,
    saveData,
    publishSite,
  };
};
