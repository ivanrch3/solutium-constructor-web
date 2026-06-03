import React, { createContext, useContext, useEffect } from 'react';
import { Theme } from '../types/schema';
import { logDebug } from '../utils/debug';
import { getAppMadreBaseUrl, getLaunchTokenFromUrl } from '../services/secureLaunchSession';

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
  primarySoft: '#DBEAFE',
  primaryHover: '#1D4ED8',
  primaryContrast: '#FFFFFF',
  activeBg: '#EFF6FF',
  activeText: '#1E3A8A',
  secondary: '#F2F4F8',
  accent: '#7C3AED',
  background: '#F7F8FC',
  surface: '#FFFFFF',
  text: '#0F172A',
  muted: '#64748B',
  border: '#E2E8F0',
  sidebarBg: '#FFFFFF',
  sidebarText: '#2563EB',
  sidebarMuted: '#64748B',
  sidebarActiveBg: '#DBEAFE',
  sidebarActiveText: '#2563EB',
  sidebarBorder: '#E2E8F0'
} as const;

const applyBuilderShellTheme = (root: HTMLElement) => {
  root.style.setProperty('--builder-primary', BUILDER_UI_THEME.primary);
  root.style.setProperty('--builder-primary-soft', BUILDER_UI_THEME.primarySoft);
  root.style.setProperty('--builder-primary-hover', BUILDER_UI_THEME.primaryHover);
  root.style.setProperty('--builder-primary-contrast', BUILDER_UI_THEME.primaryContrast);
  root.style.setProperty('--builder-active-bg', BUILDER_UI_THEME.activeBg);
  root.style.setProperty('--builder-active-text', BUILDER_UI_THEME.activeText);
  root.style.setProperty('--builder-bg', BUILDER_UI_THEME.background);
  root.style.setProperty('--builder-surface', BUILDER_UI_THEME.surface);
  root.style.setProperty('--builder-surface-muted', BUILDER_UI_THEME.secondary);
  root.style.setProperty('--builder-text', BUILDER_UI_THEME.text);
  root.style.setProperty('--builder-muted', BUILDER_UI_THEME.muted);
  root.style.setProperty('--builder-border', BUILDER_UI_THEME.border);
  root.style.setProperty('--builder-sidebar-bg', BUILDER_UI_THEME.sidebarBg);
  root.style.setProperty('--builder-sidebar-text', BUILDER_UI_THEME.sidebarText);
  root.style.setProperty('--builder-sidebar-muted', BUILDER_UI_THEME.sidebarMuted);
  root.style.setProperty('--builder-sidebar-active-bg', BUILDER_UI_THEME.sidebarActiveBg);
  root.style.setProperty('--builder-sidebar-active-text', BUILDER_UI_THEME.sidebarActiveText);
  root.style.setProperty('--builder-sidebar-border', BUILDER_UI_THEME.sidebarBorder);

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

const pickThemeString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim() !== '') {
      return value.trim();
    }
  }
  return null;
};

const setCssVar = (root: HTMLElement, name: string, value: string | null) => {
  if (value) root.style.setProperty(name, value);
};

const resolveExpectedThemeOrigin = () => {
  try {
    if (document.referrer) return new URL(document.referrer).origin;
  } catch {
    // noop
  }

  try {
    return new URL(getAppMadreBaseUrl()).origin;
  } catch {
    return window.location.origin;
  }
};

const resolveThemeColors = (theme: any) => {
  const projectColors = Array.isArray(theme?.projectColors)
    ? theme.projectColors
    : Array.isArray(theme?.project_colors)
      ? theme.project_colors
      : [];
  const uiTokens = theme?.uiTokens && typeof theme.uiTokens === 'object' ? theme.uiTokens : {};
  const colors = theme?.colors && typeof theme.colors === 'object'
    ? theme.colors
    : uiTokens.colors && typeof uiTokens.colors === 'object'
      ? uiTokens.colors
      : {};
  const palette = theme?.palette && typeof theme.palette === 'object' ? theme.palette : {};
  const sidebar = theme?.sidebar && typeof theme.sidebar === 'object'
    ? theme.sidebar
    : uiTokens.sidebar && typeof uiTokens.sidebar === 'object'
      ? uiTokens.sidebar
      : {};

  return {
    primary: pickThemeString(theme?.primary, theme?.primaryColor, theme?.primary_color, colors.primary, colors.primaryColor, colors.primary_color, palette.primary, projectColors[0]),
    secondary: pickThemeString(theme?.secondary, theme?.secondaryColor, theme?.secondary_color, colors.secondary, colors.secondaryColor, colors.secondary_color, palette.secondary, projectColors[1]),
    accent: pickThemeString(theme?.accent, theme?.accentColor, theme?.accent_color, colors.accent, colors.accentColor, colors.accent_color, palette.accent, projectColors[2]),
    background: pickThemeString(theme?.background, theme?.backgroundColor, theme?.background_color, colors.background, colors.backgroundColor, colors.background_color, palette.background),
    text: pickThemeString(theme?.text, theme?.textColor, theme?.text_color, colors.text, colors.textColor, colors.text_color, palette.text),
    muted: pickThemeString(theme?.muted, theme?.mutedColor, theme?.muted_color, colors.muted, colors.mutedColor, colors.muted_color, palette.muted),
    border: pickThemeString(theme?.border, theme?.borderColor, theme?.border_color, colors.border, colors.borderColor, colors.border_color, palette.border),
    sidebarBg: pickThemeString(theme?.sidebar_bg, theme?.sidebarBg, theme?.sidebarBackground, colors.sidebar_bg, colors.sidebarBg, sidebar.background, sidebar.bg),
    sidebarForeground: pickThemeString(theme?.sidebar_foreground, theme?.sidebarForeground, theme?.sidebarText, colors.sidebar_foreground, colors.sidebarForeground, sidebar.foreground, sidebar.text),
    sidebarAccent: pickThemeString(theme?.sidebar_accent, theme?.sidebarAccent, colors.sidebar_accent, colors.sidebarAccent, sidebar.accent),
    sidebarBorder: pickThemeString(theme?.sidebar_border, theme?.sidebarBorder, colors.sidebar_border, colors.sidebarBorder, sidebar.border),
    surface: pickThemeString(theme?.surface, theme?.surfaceColor, theme?.surface_color, theme?.card, theme?.cardColor, theme?.card_color, colors.surface, colors.surfaceColor, colors.surface_color, colors.card, colors.cardColor, colors.card_color, palette.surface, palette.card),
    surfaceMuted: pickThemeString(theme?.surfaceMuted, theme?.surface_muted, theme?.mutedSurface, theme?.muted_surface, colors.surfaceMuted, colors.surface_muted, colors.mutedSurface, colors.muted_surface, palette.surfaceMuted, palette.surface_muted),
    primarySoft: pickThemeString(theme?.primarySoft, theme?.primary_soft, colors.primarySoft, colors.primary_soft, sidebar.accent)
  };
};

const isValidHexColor = (value?: string | null) => Boolean(
  value && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim())
);

const expandHexColor = (value: string) => {
  const normalized = value.trim();
  if (normalized.length === 4) {
    return `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`;
  }
  return normalized;
};

const hexToRgb = (value: string) => {
  if (!isValidHexColor(value)) return null;
  const hex = expandHexColor(value).slice(1);
  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16)
  };
};

const rgbToHex = ({ r, g, b }: { r: number; g: number; b: number }) => (
  `#${[r, g, b].map((channel) => Math.round(Math.max(0, Math.min(255, channel))).toString(16).padStart(2, '0')).join('')}`
);

const mixHexColors = (base: string, target: string, amount: number) => {
  const baseRgb = hexToRgb(base);
  const targetRgb = hexToRgb(target);
  if (!baseRgb || !targetRgb) return base;
  const ratio = Math.max(0, Math.min(1, amount));
  return rgbToHex({
    r: baseRgb.r + (targetRgb.r - baseRgb.r) * ratio,
    g: baseRgb.g + (targetRgb.g - baseRgb.g) * ratio,
    b: baseRgb.b + (targetRgb.b - baseRgb.b) * ratio
  });
};

const getRelativeLuminance = (value: string) => {
  const rgb = hexToRgb(value);
  if (!rgb) return null;

  const normalize = (channel: number) => {
    const srgb = channel / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * normalize(rgb.r) + 0.7152 * normalize(rgb.g) + 0.0722 * normalize(rgb.b);
};

const getContrastRatio = (foreground: string, background: string) => {
  const fg = getRelativeLuminance(foreground);
  const bg = getRelativeLuminance(background);
  if (fg === null || bg === null) return 0;
  const lighter = Math.max(fg, bg);
  const darker = Math.min(fg, bg);
  return (lighter + 0.05) / (darker + 0.05);
};

const pickReadableTextColor = (background: string) => (
  getContrastRatio('#FFFFFF', background) >= getContrastRatio('#0F172A', background)
    ? '#FFFFFF'
    : '#0F172A'
);

const pickHexColor = (...values: Array<string | null | undefined>) => {
  const value = values.find((candidate) => isValidHexColor(candidate));
  return value ? expandHexColor(value).toUpperCase() : null;
};

const ensureReadableOn = (foreground: string, background: string, fallback: string, minimum = 4.5) => (
  getContrastRatio(foreground, background) >= minimum ? foreground : fallback
);

const normalizeBuilderUiTheme = (themeColors: ReturnType<typeof resolveThemeColors>) => {
  const builderPrimary = pickHexColor(themeColors.primary, themeColors.accent, BUILDER_UI_THEME.primary) || BUILDER_UI_THEME.primary;
  const builderBg = BUILDER_UI_THEME.background;
  const builderSurface = BUILDER_UI_THEME.surface;
  const builderSurfaceMuted = BUILDER_UI_THEME.secondary;
  const builderText = BUILDER_UI_THEME.text;
  const builderMuted = BUILDER_UI_THEME.muted;
  const builderBorder = mixHexColors(builderText, builderSurface, 0.88) || BUILDER_UI_THEME.border;
  const builderPrimarySoft = mixHexColors(builderPrimary, '#FFFFFF', 0.94);
  const builderActiveBg = mixHexColors(builderPrimary, '#FFFFFF', 0.93);
  const builderActiveText = ensureReadableOn(builderText, builderActiveBg, builderText, 4.5);
  const primaryContrastCandidate = pickReadableTextColor(builderPrimary);
  const builderPrimaryContrast = ensureReadableOn(primaryContrastCandidate, builderPrimary, primaryContrastCandidate);
  const builderPrimaryHover = mixHexColors(builderPrimary, '#000000', 0.14);
  const builderSidebarText = ensureReadableOn(builderPrimary, builderSurface, mixHexColors(builderPrimary, '#000000', 0.32), 4.5);
  const builderSidebarMuted = builderMuted;
  const builderSidebarActiveBg = builderPrimarySoft;
  const builderSidebarActiveText = ensureReadableOn(builderSidebarText, builderSidebarActiveBg, builderText, 4.5);

  return {
    builderBg,
    builderSurface,
    builderSurfaceMuted,
    builderText,
    builderMuted,
    builderBorder,
    builderPrimary,
    builderPrimaryHover,
    builderPrimarySoft,
    builderPrimaryContrast,
    builderActiveBg,
    builderActiveText,
    builderSidebarText,
    builderSidebarMuted,
    builderSidebarActiveBg,
    builderSidebarActiveText
  };
};
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const applyTheme = (themeData: any) => {
    const root = document.documentElement;

    if (typeof themeData === 'string') {
      const normalizedName = themeData.toLowerCase();
      logDebug(`[THEME] Aplicando tema predefinido: "${themeData}"`);

      const theme = SOLUTIUM_THEMES.find(t => t.name.toLowerCase() === normalizedName) || SOLUTIUM_THEMES[2];
      applyBuilderShellTheme(root);

      root.style.setProperty('--sidebar-bg', BUILDER_UI_THEME.sidebarBg);
      root.style.setProperty('--sidebar-foreground', BUILDER_UI_THEME.sidebarText);
      root.style.setProperty('--sidebar-muted', BUILDER_UI_THEME.sidebarMuted);
      root.style.setProperty('--sidebar-accent', BUILDER_UI_THEME.sidebarActiveBg);
      root.style.setProperty('--sidebar-active-text', BUILDER_UI_THEME.sidebarActiveText);
      root.style.setProperty('--sidebar-border', BUILDER_UI_THEME.sidebarBorder);

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
    const themeColors = resolveThemeColors(theme);

    const builderTokens = normalizeBuilderUiTheme(themeColors);

    root.style.setProperty('--primary-color', builderTokens.builderPrimary);
    root.style.setProperty('--builder-primary', builderTokens.builderPrimary);
    root.style.setProperty('--builder-primary-hover', builderTokens.builderPrimaryHover);
    root.style.setProperty('--builder-primary-soft', builderTokens.builderPrimarySoft);
    root.style.setProperty('--builder-primary-contrast', builderTokens.builderPrimaryContrast);
    root.style.setProperty('--builder-active-bg', builderTokens.builderActiveBg);
    root.style.setProperty('--builder-active-text', builderTokens.builderActiveText);
    root.style.setProperty('--secondary-color', builderTokens.builderSurfaceMuted);
    setCssVar(root, '--accent-color', pickHexColor(themeColors.accent));
    root.style.setProperty('--background-color', builderTokens.builderBg);
    root.style.setProperty('--builder-bg', builderTokens.builderBg);
    root.style.setProperty('--card-color', builderTokens.builderSurface);
    root.style.setProperty('--builder-surface', builderTokens.builderSurface);
    root.style.setProperty('--builder-surface-muted', builderTokens.builderSurfaceMuted);
    root.style.setProperty('--foreground-color', builderTokens.builderText);
    root.style.setProperty('--builder-text', builderTokens.builderText);
    root.style.setProperty('--solutium-dark', builderTokens.builderText);
    root.style.setProperty('--builder-muted', builderTokens.builderMuted);
    root.style.setProperty('--border-color', builderTokens.builderBorder);
    root.style.setProperty('--builder-border', builderTokens.builderBorder);
    const sidebarBg = builderTokens.builderSurface;
    const sidebarFg = builderTokens.builderSidebarText;
    const sidebarMuted = builderTokens.builderSidebarMuted;
    const sidebarAccent = builderTokens.builderSidebarActiveBg;
    const sidebarActiveText = builderTokens.builderSidebarActiveText;
    const sidebarBorder = builderTokens.builderBorder;
    root.style.setProperty('--builder-sidebar-bg', sidebarBg);
    root.style.setProperty('--builder-sidebar-text', sidebarFg);
    root.style.setProperty('--builder-sidebar-muted', sidebarMuted);
    root.style.setProperty('--builder-sidebar-active-bg', sidebarAccent);
    root.style.setProperty('--builder-sidebar-active-text', sidebarActiveText);
    root.style.setProperty('--builder-sidebar-border', sidebarBorder);
    root.style.setProperty('--sidebar-bg', sidebarBg);
    root.style.setProperty('--sidebar-foreground', sidebarFg);
    root.style.setProperty('--sidebar-muted', sidebarMuted);
    root.style.setProperty('--sidebar-accent', sidebarAccent);
    root.style.setProperty('--sidebar-active-text', sidebarActiveText);
    root.style.setProperty('--sidebar-border', sidebarBorder);

    const font =
      theme.fontFamily ||
      theme.font_family ||
      theme.font ||
      theme.uiTokens?.fontFamily ||
      theme.uiTokens?.font_family ||
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

    const uiStyle = theme.uiStyle || theme.baseStyle || theme.ui_style;
    const borderRadius = theme.borderRadius || theme.border_radius || theme.uiTokens?.borderRadius || theme.uiTokens?.border_radius;

    if (uiStyle === 'windows') {
      root.style.setProperty('--radius', '2px');
    } else if (borderRadius) {
      root.style.setProperty('--radius', borderRadius);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SOLUTIUM_THEME') {
        if (getLaunchTokenFromUrl() && event.origin !== resolveExpectedThemeOrigin()) {
          logDebug('[THEME] Ignorando tema desde origin no autorizado.', {
            origin: event.origin
          });
          return;
        }

        const themePayload = event.data.payload.theme || event.data.payload;
        applyTheme(themePayload);

        const target = window.opener || window.parent;
        if (target && target !== window) {
          target.postMessage({ type: 'SOLUTIUM_THEME_ACK' }, event.origin || window.location.origin);
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
