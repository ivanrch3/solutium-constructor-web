import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

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
  const { project: authProject, products: authProducts } = useAuth();
  
  // Initialize with authProject if available, otherwise use defaults
  const [config, setConfig] = useState<SolutiumConfig>({
    project: {
      id: authProject?.id || 'proj_123',
      name: authProject?.name || 'Mi Proyecto Solutium',
      fontFamily: authProject?.fontFamily || 'Inter',
      baseSize: authProject?.baseSize?.toString() || '16px',
      borderRadius: authProject?.borderRadius?.toString() || '12px',
      uiStyle: (authProject?.uiStyle as any) || 'minimal',
      activeTheme: (authProject?.activeTheme as any) || 'light',
    },
    profile: {
      fontFamily: 'Inter',
      baseSize: '16px',
      borderRadius: '8px',
      uiStyle: 'minimal',
      activeTheme: 'light',
    },
    products: (authProducts as any[]) || [],
  });

  // Update config when authProject or authProducts change (from handshake)
  useEffect(() => {
    if (authProject || authProducts) {
      setConfig(prev => ({
        ...prev,
        project: authProject ? {
          id: authProject.id,
          name: authProject.name,
          fontFamily: authProject.fontFamily || 'Inter',
          baseSize: authProject.baseSize?.toString() || '16px',
          borderRadius: authProject.borderRadius?.toString() || '12px',
          uiStyle: (authProject.uiStyle as any) || 'minimal',
          activeTheme: (authProject.activeTheme as any) || 'light',
        } : prev.project,
        products: (authProducts as any[]) || prev.products
      }));
    }
  }, [authProject, authProducts]);

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
