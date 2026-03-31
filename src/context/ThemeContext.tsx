import React, { createContext, useContext, useEffect } from 'react';
import { Theme } from '../types/schema';

export const SOLUTIUM_COLORS = {
  green: '#004D61',
  violet: '#700AB1',
  blue: '#3D248B',
  deepGray: '#1E2128',
  darkGray: '#4A4A4E',
  lightGray: '#F8FAFC',
};

export const SOLUTIUM_THEMES: Theme[] = [
  {
    name: 'emerald-light',
    displayName: 'Esmeralda Corporativo (Claro)',
    colors: {
      primary: SOLUTIUM_COLORS.green,
      secondary: SOLUTIUM_COLORS.lightGray,
      accent: SOLUTIUM_COLORS.violet,
      background: '#FFFFFF',
      text: SOLUTIUM_COLORS.deepGray,
      card: '#FFFFFF',
      border: '#E2E8F0',
      sidebar_bg: SOLUTIUM_COLORS.green,
      sidebar_foreground: '#FFFFFF',
      sidebar_accent: 'rgba(255, 255, 255, 0.1)',
      sidebar_border: 'rgba(255, 255, 255, 0.1)',
    },
    uiTheme: 'light',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '0.5rem',
    baseSize: '16px',
  },
  {
    name: 'indigo-light',
    displayName: 'Índigo Creativo (Claro)',
    colors: {
      primary: SOLUTIUM_COLORS.violet,
      secondary: SOLUTIUM_COLORS.lightGray,
      accent: SOLUTIUM_COLORS.green,
      background: '#FFFFFF',
      text: SOLUTIUM_COLORS.deepGray,
      card: '#FFFFFF',
      border: '#E2E8F0',
      sidebar_bg: SOLUTIUM_COLORS.violet,
      sidebar_foreground: '#FFFFFF',
      sidebar_accent: 'rgba(255, 255, 255, 0.1)',
      sidebar_border: 'rgba(255, 255, 255, 0.1)',
    },
    uiTheme: 'light',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '1rem',
    baseSize: '16px',
  },
  {
    name: 'blue-light',
    displayName: 'Azul Moderno (Claro)',
    colors: {
      primary: SOLUTIUM_COLORS.blue,
      secondary: SOLUTIUM_COLORS.lightGray,
      accent: SOLUTIUM_COLORS.violet,
      background: '#FFFFFF',
      text: SOLUTIUM_COLORS.deepGray,
      card: '#FFFFFF',
      border: '#E2E8F0',
      sidebar_bg: SOLUTIUM_COLORS.blue,
      sidebar_foreground: '#FFFFFF',
      sidebar_accent: 'rgba(255, 255, 255, 0.1)',
      sidebar_border: 'rgba(255, 255, 255, 0.1)',
    },
    uiTheme: 'light',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '0.75rem',
    baseSize: '16px',
  },
  {
    name: 'slate-light',
    displayName: 'Slate Ejecutivo (Claro)',
    colors: {
      primary: SOLUTIUM_COLORS.deepGray,
      secondary: SOLUTIUM_COLORS.lightGray,
      accent: SOLUTIUM_COLORS.green,
      background: '#FFFFFF',
      text: SOLUTIUM_COLORS.deepGray,
      card: '#FFFFFF',
      border: '#E2E8F0',
      sidebar_bg: SOLUTIUM_COLORS.deepGray,
      sidebar_foreground: '#FFFFFF',
      sidebar_accent: 'rgba(255, 255, 255, 0.1)',
      sidebar_border: 'rgba(255, 255, 255, 0.1)',
    },
    uiTheme: 'light',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '0.25rem',
    baseSize: '16px',
  }
];

interface ThemeContextProps {
  applyTheme: (themeData: any) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const applyTheme = (themeData: any) => {
    const root = document.documentElement;
    
    // Si recibimos un nombre de tema (string), buscamos en nuestros temas predefinidos
    if (typeof themeData === 'string') {
      const normalizedName = themeData.toLowerCase();
      console.log(`[THEME] Aplicando tema predefinido: "${themeData}"`);
      
      const theme = SOLUTIUM_THEMES.find(t => t.name.toLowerCase() === normalizedName) || SOLUTIUM_THEMES[2];
      
      root.style.setProperty('--primary-color', theme.colors.primary);
      root.style.setProperty('--secondary-color', theme.colors.secondary);
      root.style.setProperty('--accent-color', theme.colors.accent);
      root.style.setProperty('--background-color', theme.colors.background);
      root.style.setProperty('--card-color', theme.colors.card);
      root.style.setProperty('--foreground-color', theme.colors.text);
      root.style.setProperty('--border-color', theme.colors.border);
      
      // Sidebar variables
      root.style.setProperty('--sidebar-bg', theme.colors.sidebar_bg || theme.colors.card);
      root.style.setProperty('--sidebar-foreground', theme.colors.sidebar_foreground || theme.colors.text);
      root.style.setProperty('--sidebar-accent', theme.colors.sidebar_accent || 'rgba(59, 130, 246, 0.1)');
      root.style.setProperty('--sidebar-border', theme.colors.sidebar_border || theme.colors.border);
      
      const font = theme.fontFamily || 'Inter, sans-serif';
      root.style.setProperty('--solutium-font', font);
      document.body.style.fontFamily = font;
      
      if (theme.borderRadius) root.style.setProperty('--radius', theme.borderRadius);
      return;
    }

    // Si recibimos un objeto de tema calculado por la App Madre
    const theme = themeData;
    console.log('[THEME] Aplicando tema calculado:', theme);

    if (theme.primary) root.style.setProperty('--primary-color', theme.primary);
    if (theme.secondary) root.style.setProperty('--secondary-color', theme.secondary);
    if (theme.accent) root.style.setProperty('--accent-color', theme.accent);
    if (theme.background) root.style.setProperty('--background-color', theme.background);
    if (theme.card || theme.surface) root.style.setProperty('--card-color', theme.card || theme.surface);
    if (theme.text || theme.foreground) root.style.setProperty('--foreground-color', theme.text || theme.foreground);
    if (theme.border) root.style.setProperty('--border-color', theme.border);
    
    // Contraste Crítico
    if (theme.dark) root.style.setProperty('--solutium-dark', theme.dark);

    // Sidebar variables
    if (theme.sidebar_bg) root.style.setProperty('--sidebar-bg', theme.sidebar_bg);
    if (theme.sidebar_foreground) root.style.setProperty('--sidebar-foreground', theme.sidebar_foreground);
    if (theme.sidebar_accent) root.style.setProperty('--sidebar-accent', theme.sidebar_accent);
    if (theme.sidebar_border) root.style.setProperty('--sidebar-border', theme.sidebar_border);

    // Tipografía
    const font = theme.fontFamily || theme.font_family;
    if (font) {
      console.log('[THEME] Aplicando fontFamily:', font);
      root.style.setProperty('--solutium-font', font);
      document.body.style.fontFamily = font;
    }

    // Modo Visual (Windows / Fluent UI)
    if (theme.uiStyle === 'windows') {
      root.style.setProperty('--radius', '2px'); // Bordes más rectos para Windows
    } else if (theme.borderRadius) {
      root.style.setProperty('--radius', theme.borderRadius);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SOLUTIUM_THEME') {
        const themePayload = event.data.payload.theme || event.data.payload;
        applyTheme(themePayload);
        
        // Responder con ACK
        if (window.parent !== window) {
          window.parent.postMessage({ type: 'SOLUTIUM_THEME_ACK' }, '*');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <ThemeContext.Provider value={{ applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
