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
    },
    uiTheme: 'light',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '0.25rem',
    baseSize: '16px',
  }
];

interface ThemeContextProps {
  setTheme: (themeName: string, fontFamily: string) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const setTheme = (themeName: string, fontFamily: string) => {
    const theme = SOLUTIUM_THEMES.find(t => t.name === themeName) || SOLUTIUM_THEMES[2]; // Default to blue-light
    
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.colors.primary);
    root.style.setProperty('--secondary', theme.colors.secondary);
    root.style.setProperty('--accent', theme.colors.accent);
    root.style.setProperty('--background', theme.colors.background);
    root.style.setProperty('--card', theme.colors.card);
    root.style.setProperty('--foreground', theme.colors.text);
    root.style.setProperty('--border', theme.colors.border);
    
    root.style.setProperty('--font-family', fontFamily || theme.fontFamily || 'Inter, sans-serif');
    if (theme.borderRadius) root.style.setProperty('--radius', theme.borderRadius);
    if (theme.baseSize) root.style.setProperty('--base-size', theme.baseSize);
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validar el tipo de mensaje de la App Madre
      if (event.data?.type === 'SOLUTIUM_THEME') {
        const theme = event.data.payload.theme;
        const root = document.documentElement;

        // Aplicar variables CSS para Tailwind y estilos globales
        root.style.setProperty('--primary', theme.primary);
        root.style.setProperty('--secondary', theme.secondary);
        root.style.setProperty('--accent', theme.accent);
        root.style.setProperty('--background', theme.background);
        root.style.setProperty('--card', theme.card || theme.surface); // Use card or surface as fallback
        root.style.setProperty('--foreground', theme.text);
        root.style.setProperty('--border', theme.border);
        
        // Estilos de interfaz
        if (theme.fontFamily) {
          document.body.style.fontFamily = theme.fontFamily;
          root.style.setProperty('--font-family', theme.fontFamily);
        }
        if (theme.borderRadius) root.style.setProperty('--radius', theme.borderRadius);
        if (theme.baseSize) root.style.setProperty('--base-size', theme.baseSize);

        console.log('Tema sincronizado con App Madre:', theme.name);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <ThemeContext.Provider value={{ setTheme }}>
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
