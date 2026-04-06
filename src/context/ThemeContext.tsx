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

const loadGoogleFont = (fontFamily: string) => {
  if (!fontFamily) return;

  // Extraer el primer nombre si es una lista (ej: "Open Sans, sans-serif")
  const mainFont = fontFamily.split(',')[0].trim().replace(/['"]/g, '');
  
  // No cargar si es una fuente genérica del sistema
  const genericFonts = ['sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'inter'];
  if (genericFonts.includes(mainFont.toLowerCase())) {
    return;
  }

  const fontId = `google-font-${mainFont.replace(/\s+/g, '-').toLowerCase()}`;
  if (document.getElementById(fontId)) return;

  const link = document.createElement('link');
  link.id = fontId;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${mainFont.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
  document.head.appendChild(link);
  console.log(`[THEME] Cargando Google Font: ${mainFont}`);
};

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
      const cleanFont = font.split(',')[0].trim().replace(/['"]/g, '');
      loadGoogleFont(cleanFont);
      
      const formattedFont = cleanFont.includes(' ') ? `'${cleanFont}'` : cleanFont;
      const fontValue = font.includes(',') ? font : `${formattedFont}, sans-serif`;
      
      root.style.setProperty('--solutium-font', fontValue);
      document.body.style.fontFamily = fontValue;
      
      if (theme.borderRadius) root.style.setProperty('--radius', theme.borderRadius);
      return;
    }

    // Si recibimos un objeto de tema calculado por la App Madre
    const theme = themeData;
    console.log('[THEME] Aplicando tema calculado:', theme);

    if (theme.primary || theme.primaryColor) root.style.setProperty('--primary-color', theme.primary || theme.primaryColor);
    if (theme.secondary || theme.secondaryColor) root.style.setProperty('--secondary-color', theme.secondary || theme.secondaryColor);
    if (theme.accent || theme.accentColor) root.style.setProperty('--accent-color', theme.accent || theme.accentColor);
    if (theme.background || theme.backgroundColor) root.style.setProperty('--background-color', theme.background || theme.backgroundColor);
    if (theme.card || theme.surface || theme.cardColor) root.style.setProperty('--card-color', theme.card || theme.surface || theme.cardColor);
    if (theme.text || theme.foreground || theme.textColor) root.style.setProperty('--foreground-color', theme.text || theme.foreground || theme.textColor);
    if (theme.border || theme.borderColor) root.style.setProperty('--border-color', theme.border || theme.borderColor);
    
    // Contraste Crítico
    if (theme.dark) root.style.setProperty('--solutium-dark', theme.dark);

    // Sidebar variables - Robustez en nombres de claves
    const sidebarBg = theme.sidebar_bg || theme.sidebarBg || theme.sidebarBackground || theme.primary || theme.primaryColor;
    const sidebarFg = theme.sidebar_foreground || theme.sidebarForeground || theme.sidebarText || '#FFFFFF';
    const sidebarAccent = theme.sidebar_accent || theme.sidebarAccent || 'rgba(255, 255, 255, 0.1)';
    const sidebarBorder = theme.sidebar_border || theme.sidebarBorder || 'rgba(255, 255, 255, 0.1)';

    root.style.setProperty('--sidebar-bg', sidebarBg);
    root.style.setProperty('--sidebar-foreground', sidebarFg);
    root.style.setProperty('--sidebar-accent', sidebarAccent);
    root.style.setProperty('--sidebar-border', sidebarBorder);

    // Tipografía - Máxima robustez en detección de claves
    const font = theme.fontFamily || theme.font_family || theme.font || theme.font_family_base || theme.fontFamilyBase || theme.typography?.fontFamily || theme.typography?.font_family;
    if (font) {
      console.log('[THEME] Aplicando fontFamily:', font);
      loadGoogleFont(font);
      
      const cleanFont = font.split(',')[0].trim().replace(/['"]/g, '');
      const formattedFont = cleanFont.includes(' ') ? `'${cleanFont}'` : cleanFont;
      const fontValue = font.includes(',') ? font : `${formattedFont}, sans-serif`;
      
      root.style.setProperty('--solutium-font', fontValue);
      document.body.style.fontFamily = fontValue;
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
