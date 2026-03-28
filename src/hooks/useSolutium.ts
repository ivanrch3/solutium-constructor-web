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
  logoUrl?: string;
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
  const { project: authProject, user: authUser, products: authProducts } = useAuth();
  
  // Initialize with authProject and authUser if available
  const [config, setConfig] = useState<SolutiumConfig>({
    project: {
      id: authProject?.id || 'proj_123',
      name: authProject?.name || 'Mi Proyecto Solutium',
      fontFamily: authProject?.fontFamily || 'Inter',
      baseSize: authProject?.baseSize?.toString() || '16px',
      borderRadius: authProject?.borderRadius?.toString() || '12px',
      uiStyle: (authProject?.uiStyle as any) || 'minimal',
      activeTheme: (authProject?.activeTheme as any) || 'light',
      logoUrl: authProject?.logoUrl,
    },
    profile: {
      fontFamily: authUser?.fontFamily || 'Inter',
      baseSize: authUser?.baseSize?.toString() || '16px',
      borderRadius: authUser?.borderRadius?.toString() || '8px',
      uiStyle: (authUser?.uiStyle as any) || 'minimal',
      activeTheme: (authUser?.activeTheme as any) || 'light',
    },
    products: (authProducts as any[]) || [],
  });

  // Update config when authProject, authUser or authProducts change
  useEffect(() => {
    if (authProject || authUser || authProducts) {
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
          logoUrl: authProject.logoUrl,
        } : prev.project,
        profile: authUser ? {
          fontFamily: authUser.fontFamily || 'Inter',
          baseSize: authUser.baseSize?.toString() || '16px',
          borderRadius: authUser.borderRadius?.toString() || '8px',
          uiStyle: (authUser.uiStyle as any) || 'minimal',
          activeTheme: (authUser.activeTheme as any) || 'light',
        } : prev.profile,
        products: (authProducts as any[]) || prev.products
      }));
    }
  }, [authProject, authUser, authProducts]);

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
    // Apply CSS variables based on config - Prioritize Profile as requested
    const root = document.documentElement;
    const profile = config.profile;

    const fontFamily = profile.fontFamily;
    const baseSize = profile.baseSize;
    const borderRadius = profile.borderRadius;

    root.style.setProperty('--font-family', fontFamily);
    root.style.setProperty('--base-size', baseSize);
    root.style.setProperty('--border-radius', borderRadius);
    
    // Set theme class from profile
    const theme = profile.activeTheme;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply UI Style class to body
    const uiStyle = profile.uiStyle || 'minimal';
    root.setAttribute('data-ui-style', uiStyle);
  }, [config]);

  return {
    config,
    saveData,
    publishSite,
  };
};
