import { Theme } from '../types';

export type VisualStyle = 'minimalist' | 'bold' | 'corporate' | 'modern' | 'playful';

export const mapStyleToTheme = (style: VisualStyle, brandColors: Record<string, string>): Theme => {
  const primary = brandColors.primary || '#3B82F6';
  const secondary = brandColors.secondary || '#1E293B';

  const baseThemes: Record<VisualStyle, Theme> = {
    minimalist: {
      primaryColor: primary,
      secondaryColor: '#F8FAFC',
      fontFamily: 'Inter, sans-serif',
      borderRadius: '0px',
      backgroundColor: '#FFFFFF',
      textColor: '#0F172A',
    },
    bold: {
      primaryColor: primary,
      secondaryColor: secondary,
      fontFamily: 'Outfit, sans-serif',
      borderRadius: '24px',
      backgroundColor: '#FFFFFF',
      textColor: '#0F172A',
    },
    corporate: {
      primaryColor: primary,
      secondaryColor: '#64748B',
      fontFamily: 'Inter, sans-serif',
      borderRadius: '4px',
      backgroundColor: '#F1F5F9',
      textColor: '#334155',
    },
    modern: {
      primaryColor: primary,
      secondaryColor: secondary,
      fontFamily: 'Space Grotesk, sans-serif',
      borderRadius: '12px',
      backgroundColor: '#FFFFFF',
      textColor: '#0F172A',
    },
    playful: {
      primaryColor: primary,
      secondaryColor: '#FACC15',
      fontFamily: 'Outfit, sans-serif',
      borderRadius: '32px',
      backgroundColor: '#FFFBEB',
      textColor: '#92400E',
    }
  };

  return baseThemes[style] || baseThemes.modern;
};
