import React, { createContext, useContext, useEffect } from 'react';
import { Theme } from '../types/schema';
import { logDebug } from '../utils/debug';

export const SOLUTIUM_COLORS = {
  green: '#004D61',
  violet: '#700AB1',
  blue: '#3D248B',
  deepGray: '#0F172A',
  darkGray: '#334155',
  lightGray: '#F1F5F9'
};

const BUILDER_UI_THEME = {
  primary: '#2563EB',
  primarySoft: 'rgba(37, 99, 235, 0.1)',
  secondary: '#F1F5F9',
  accent: '#7C3AED',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  muted: '#64748B',
  border: '#E2E8F0',
  sidebarBg: SOLUTIUM_COLORS.green,
  sidebarForeground: '#FFFFFF',
  sidebarAccent: 'rgba(255, 255, 255, 0.1)',
  sidebarBorder: 'rgba(255, 255, 255, 0.1)'
} as const;

const applyBuilderShellTheme = (root: HTMLElement) => {
  root.style.setProperty('--builder-primary', BUILDER_UI_THEME.primary);
  root.style.setProperty('--builder-primary-soft', BUILDER_UI_THEME.primarySoft);
  root.style.setProperty('--builder-bg', BUILDER_UI_THEME.background);
  root.style.setProperty('--builder-surface', BUILDER_UI_THEME.surface);
  root.style.setProperty('--builder-surface-muted', BUILDER_UI_THEME.secondary);
  root.style.setProperty('--builder-text', BUILDER_UI_THEME.text);
  root.style.setProperty('--builder-muted', BUILDER_UI_THEME.muted);
  root.style.setProperty('--builder-border', BUILDER_UI_THEME.border);

  root.style.setProperty('--primary-color', BUILDER_UI_THEME.primary);
  root.style.setProperty('--secondary-color', BUILDER_UI_THEME.secondary);
  root.style.setProperty('--accent-color', BUILDER_UI_THEME.accent);
  root.style.setProperty('--background-color', BUILDER_UI_THEME.background);
  root.style.setProperty('--card-color', BUILDER_UI_THEME.surface);
  root.style.setProperty('--foreground-color', BUILDER_UI_THEME.text);
  root.style.setProperty('--border-color', BUILDER_UI_THEME.border);
  root.style.setProperty('--solutium-dark', BUILDER_UI_THEME.text);
};

export const SOLUTIUM_THEMES: Theme[] = [
  {
    name: 'emerald-light',
    displayName: 'Esmeralda Corporativo (Claro)',
    colors: {
      primary: SOLUTIUM_COLORS.green,
      secondary: SOLUTIUM_COLORS.lightGray,
      accent: SOLUTIUM_COLORS.violet,
      background: '#F8FAFC',
      text: SOLUTIUM_COLORS.deepGray,
      card: '#FFFFFF',
      border: '#CBD5E1',
      sidebar_bg: SOLUTIUM_COLORS.green,
      sidebar_foreground: '#FFFFFF',
      sidebar_accent: 'rgba(255, 255, 255, 0.1)',
      sidebar_border: 'rgba(255, 255, 255, 0.1)'
    },
    uiTheme: 'light',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '0.5rem',
    baseSize: '16px'
  },
  {
    name: 'indigo-light',
    displayName: 'Indigo Creativo (Claro)',
    colors: {
      primary: SOLUTIUM_COLORS.violet,
      secondary: SOLUTIUM_COLORS.lightGray,
      accent: SOLUTIUM_COLORS.green,
      background: '#F8FAFC',
      text: SOLUTIUM_COLORS.deepGray,
      card: '#FFFFFF',
      border: '#CBD5E1',
      sidebar_bg: SOLUTIUM_COLORS.violet,
      sidebar_foreground: '#FFFFFF',
      sidebar_accent: 'rgba(255, 255, 255, 0.1)',
      sidebar_border: 'rgba(255, 255, 255, 0.1)'
    },
    uiTheme: 'light',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '1rem',
    baseSize: '16px'
  },
  {
    name: 'blue-light',
    displayName: 'Azul Moderno (Claro)',
    colors: {
      primary: SOLUTIUM_COLORS.blue,
      secondary: SOLUTIUM_COLORS.lightGray,
      accent: SOLUTIUM_COLORS.violet,
      background: '#F8FAFC',
      text: SOLUTIUM_COLORS.deepGray,
      card: '#FFFFFF',
      border: '#CBD5E1',
      sidebar_bg: SOLUTIUM_COLORS.blue,
      sidebar_foreground: '#FFFFFF',
      sidebar_accent: 'rgba(255, 255, 255, 0.1)',
      sidebar_border: 'rgba(255, 255, 255, 0.1)'
    },
    uiTheme: 'light',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '0.75rem',
    baseSize: '16px'
  },
  {
    name: 'slate-light',
    displayName: 'Slate Ejecutivo (Claro)',
    colors: {
      primary: SOLUTIUM_COLORS.deepGray,
      secondary: SOLUTIUM_COLORS.lightGray,
      accent: SOLUTIUM_COLORS.green,
      background: '#F8FAFC',
      text: SOLUTIUM_COLORS.deepGray,
      card: '#FFFFFF',
      border: '#CBD5E1',
      sidebar_bg: SOLUTIUM_COLORS.deepGray,
      sidebar_foreground: '#FFFFFF',
      sidebar_accent: 'rgba(255, 255, 255, 0.1)',
      sidebar_border: 'rgba(255, 255, 255, 0.1)'
    },
    uiTheme: 'light',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '0.25rem',
    baseSize: '16px'
  }
];

interface ThemeContextProps {
  applyTheme: (themeData: any) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

const loadGoogleFont = (fontFamily: string) => {
  if (!fontFamily) return;

  const mainFont = fontFamily.split(',')[0].trim().replace(/['"]/g, '');
  const genericFonts = ['sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'inter'];
  if (genericFonts.includes(mainFont.toLowerCase())) {
    return;
  }

  const fontId = `google-font-${mainFont.replace(/\s+/g, '-').toLowerCase()}`;
  if (document.getElementById(fontId)) return;

  const link = document.createElement('link');
  link.id = fontId;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${mainFont.replace(/\s+/g, '+')}:wght@300;400;600;800;900&display=swap`;
  document.head.appendChild(link);
  logDebug(`[THEME] Cargando Google Font: ${mainFont}`);
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const applyTheme = (themeData: any) => {
    const root = document.documentElement;
    const currentStyles = getComputedStyle(root);

    if (typeof themeData === 'string') {
      const normalizedName = themeData.toLowerCase();
      logDebug(`[THEME] Aplicando tema predefinido: "${themeData}"`);

      const theme = SOLUTIUM_THEMES.find(t => t.name.toLowerCase() === normalizedName) || SOLUTIUM_THEMES[2];
      applyBuilderShellTheme(root);

      root.style.setProperty('--sidebar-bg', theme.colors.sidebar_bg || BUILDER_UI_THEME.sidebarBg);
      root.style.setProperty('--sidebar-foreground', theme.colors.sidebar_foreground || BUILDER_UI_THEME.sidebarForeground);
      root.style.setProperty('--sidebar-accent', theme.colors.sidebar_accent || BUILDER_UI_THEME.sidebarAccent);
      root.style.setProperty('--sidebar-border', theme.colors.sidebar_border || BUILDER_UI_THEME.sidebarBorder);

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

    const theme = themeData || {};
    logDebug('[THEME] Aplicando tema calculado:', theme);
    applyBuilderShellTheme(root);

    const sidebarBg =
      theme.sidebar_bg ||
      theme.sidebarBg ||
      theme.sidebarBackground ||
      currentStyles.getPropertyValue('--sidebar-bg').trim() ||
      BUILDER_UI_THEME.sidebarBg;
    const sidebarFg =
      theme.sidebar_foreground ||
      theme.sidebarForeground ||
      theme.sidebarText ||
      currentStyles.getPropertyValue('--sidebar-foreground').trim() ||
      BUILDER_UI_THEME.sidebarForeground;
    const sidebarAccent =
      theme.sidebar_accent ||
      theme.sidebarAccent ||
      currentStyles.getPropertyValue('--sidebar-accent').trim() ||
      BUILDER_UI_THEME.sidebarAccent;
    const sidebarBorder =
      theme.sidebar_border ||
      theme.sidebarBorder ||
      currentStyles.getPropertyValue('--sidebar-border').trim() ||
      BUILDER_UI_THEME.sidebarBorder;

    root.style.setProperty('--sidebar-bg', sidebarBg);
    root.style.setProperty('--sidebar-foreground', sidebarFg);
    root.style.setProperty('--sidebar-accent', sidebarAccent);
    root.style.setProperty('--sidebar-border', sidebarBorder);

    const font =
      theme.fontFamily ||
      theme.font_family ||
      theme.font ||
      theme.font_family_base ||
      theme.fontFamilyBase ||
      theme.typography?.fontFamily ||
      theme.typography?.font_family;

    if (font) {
      logDebug('[THEME] Aplicando fontFamily:', font);
      loadGoogleFont(font);

      const cleanFont = font.split(',')[0].trim().replace(/['"]/g, '');
      const formattedFont = cleanFont.includes(' ') ? `'${cleanFont}'` : cleanFont;
      const fontValue = font.includes(',') ? font : `${formattedFont}, sans-serif`;

      root.style.setProperty('--solutium-font', fontValue);
      document.body.style.fontFamily = fontValue;
    }

    if (theme.uiStyle === 'windows') {
      root.style.setProperty('--radius', '2px');
    } else if (theme.borderRadius) {
      root.style.setProperty('--radius', theme.borderRadius);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SOLUTIUM_THEME') {
        const themePayload = event.data.payload.theme || event.data.payload;
        applyTheme(themePayload);

        const target = window.opener || window.parent;
        if (target && target !== window) {
          target.postMessage({ type: 'SOLUTIUM_THEME_ACK' }, '*');
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
