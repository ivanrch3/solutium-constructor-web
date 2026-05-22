export type BrandColorsInput =
  | string[]
  | {
      primary?: string | null;
      secondary?: string | null;
      accent?: string | null;
      background?: string | null;
      text?: string | null;
      muted?: string | null;
      border?: string | null;
      primaryColor?: string | null;
      secondaryColor?: string | null;
      accentColor?: string | null;
      backgroundColor?: string | null;
      textColor?: string | null;
      mutedColor?: string | null;
      borderColor?: string | null;
      primary_color?: string | null;
      secondary_color?: string | null;
      accent_color?: string | null;
      background_color?: string | null;
      text_color?: string | null;
      muted_color?: string | null;
      border_color?: string | null;
    }
  | null
  | undefined;

export interface ProjectThemeTokens {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  muted: string;
  border: string;
}

export const PROJECT_THEME_FALLBACKS: ProjectThemeTokens = {
  primary: '#3B82F6',
  secondary: '#8B5CF6',
  accent: '#10B981',
  background: '#FFFFFF',
  text: '#0F172A',
  muted: '#64748B',
  border: '#E2E8F0'
};

const pickString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim() !== '') {
      return value.trim();
    }
  }
  return null;
};

export const normalizeThemeValue = (value: unknown) =>
  typeof value === 'string'
    ? value.trim().toLowerCase().replace(/\s+/g, '')
    : '';

export const normalizeProjectBrandColors = (
  input?: BrandColorsInput,
  overrides?: Partial<ProjectThemeTokens>
): ProjectThemeTokens => {
  const raw = Array.isArray(input) ? {
    primary: input[0],
    secondary: input[1],
    accent: input[2]
  } : (input || {});

  return {
    primary: pickString(raw.primary, raw.primaryColor, raw.primary_color, overrides?.primary, PROJECT_THEME_FALLBACKS.primary) || PROJECT_THEME_FALLBACKS.primary,
    secondary: pickString(raw.secondary, raw.secondaryColor, raw.secondary_color, overrides?.secondary, PROJECT_THEME_FALLBACKS.secondary) || PROJECT_THEME_FALLBACKS.secondary,
    accent: pickString(raw.accent, raw.accentColor, raw.accent_color, overrides?.accent, PROJECT_THEME_FALLBACKS.accent) || PROJECT_THEME_FALLBACKS.accent,
    background: pickString(raw.background, raw.backgroundColor, raw.background_color, overrides?.background, PROJECT_THEME_FALLBACKS.background) || PROJECT_THEME_FALLBACKS.background,
    text: pickString(raw.text, raw.textColor, raw.text_color, overrides?.text, PROJECT_THEME_FALLBACKS.text) || PROJECT_THEME_FALLBACKS.text,
    muted: pickString(raw.muted, raw.mutedColor, raw.muted_color, overrides?.muted, PROJECT_THEME_FALLBACKS.muted) || PROJECT_THEME_FALLBACKS.muted,
    border: pickString(raw.border, raw.borderColor, raw.border_color, overrides?.border, PROJECT_THEME_FALLBACKS.border) || PROJECT_THEME_FALLBACKS.border
  };
};

export const getProjectThemeFromSettings = (
  settingsValues?: Record<string, any>,
  fallback?: Partial<ProjectThemeTokens>
): ProjectThemeTokens => {
  const settings = settingsValues || {};
  const base = normalizeProjectBrandColors(null, fallback);

  return normalizeProjectBrandColors({
    primary: settings['global_theme_primary_color'],
    secondary: settings['global_theme_secondary_color'],
    accent: settings['global_theme_accent_color'],
    background: settings['global_theme_background_color'],
    text: settings['global_theme_text_color'],
    muted: settings['global_theme_muted_color'],
    border: settings['global_theme_border_color']
  }, base);
};

export const resolveBrandColor = ({
  value,
  defaultValue,
  token,
  projectTheme
}: {
  value?: unknown;
  defaultValue?: string | string[];
  token: keyof ProjectThemeTokens;
  projectTheme: ProjectThemeTokens;
}) => {
  const safeValue = typeof value === 'string' ? value.trim() : value;
  const tokenValue = projectTheme[token] || PROJECT_THEME_FALLBACKS[token];

  if (safeValue === undefined || safeValue === null || safeValue === '') {
    return tokenValue;
  }

  const defaults = Array.isArray(defaultValue) ? defaultValue : [defaultValue];
  const normalizedCurrent = normalizeThemeValue(safeValue);
  const matchesDefault = defaults
    .filter((candidate): candidate is string => typeof candidate === 'string')
    .some((candidate) => normalizeThemeValue(candidate) === normalizedCurrent);

  return matchesDefault ? tokenValue : String(safeValue);
};

export const buildProjectThemeCssVariables = (theme: ProjectThemeTokens) => ({
  '--brand-primary': theme.primary,
  '--brand-secondary': theme.secondary,
  '--brand-accent': theme.accent,
  '--brand-bg': theme.background,
  '--brand-text': theme.text,
  '--brand-muted': theme.muted,
  '--brand-border': theme.border,
  '--primary-color': theme.primary,
  '--secondary-color': theme.secondary,
  '--accent-color': theme.accent,
  '--background-color': theme.background,
  '--foreground-color': theme.text,
  '--border-color': theme.border
}) as Record<string, string>;
