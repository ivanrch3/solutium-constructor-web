
export type SocialPlatform = 'facebook' | 'instagram' | 'tiktok' | 'x' | 'linkedin' | 'youtube' | 'whatsapp' | 'website';

export const SOCIAL_PLATFORMS: Record<SocialPlatform, { icon: string, label: string, color: string, baseUrl: string }> = {
  facebook: { icon: 'Facebook', label: 'Facebook', color: '#1877F2', baseUrl: 'https://facebook.com/' },
  instagram: { icon: 'Instagram', label: 'Instagram', color: '#E4405F', baseUrl: 'https://instagram.com/' },
  tiktok: { icon: 'Music2', label: 'TikTok', color: '#000000', baseUrl: 'https://tiktok.com/@' },
  x: { icon: 'Twitter', label: 'X / Twitter', color: '#000000', baseUrl: 'https://x.com/' },
  linkedin: { icon: 'Linkedin', label: 'LinkedIn', color: '#0077B5', baseUrl: 'https://linkedin.com/in/' },
  youtube: { icon: 'Youtube', label: 'YouTube', color: '#FF0000', baseUrl: 'https://youtube.com/' },
  whatsapp: { icon: 'MessageCircle', label: 'WhatsApp', color: '#25D366', baseUrl: 'https://wa.me/' },
  website: { icon: 'Globe', label: 'Sitio web', color: '#64748B', baseUrl: '' }
};

export const FOOTER_DEFAULTS = {
  bio: 'Creamos soluciones digitales innovadoras para impulsar el crecimiento de tu negocio en la era moderna.',
  address: 'Calle Innovación 123, Ciudad Digital',
  phone: '+1 (555) 000-0000',
  email: 'hola@mimarca.com',
  copyright: '© 2026 Mi Marca. Todos los derechos reservados.',
  logos: [
    'https://solutium.app/logo.png',
    'https://solutium.app/logo-white.png',
    'logo-solutium'
  ]
};

export const normalizeSocialUrl = (platform: string, value: string): string => {
  if (!value) return '';
  const trimmed = value.trim();
  if (trimmed === '' || trimmed === '#') return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  
  const p = platform.toLowerCase() as SocialPlatform;
  const config = SOCIAL_PLATFORMS[p];
  if (!config) return trimmed;

  let username = trimmed;
  if (username.startsWith('@')) username = username.substring(1);
  
  return `${config.baseUrl}${username}`;
};

export const getIconForPlatform = (platform: string): string => {
  const p = platform.toLowerCase() as SocialPlatform;
  return SOCIAL_PLATFORMS[p]?.icon || 'Link';
};

export interface SocialLink {
  platform?: string;
  icon: string;
  url: string;
  label?: string;
}

export const resolveFooterSocialLinks = (
  manualLinks: SocialLink[] | undefined,
  projectSocials: any
): SocialLink[] => {
  // 1. Identify manual real links (those that have a real URL)
  const realManualLinks = (manualLinks || []).filter(link => 
    link.url && link.url !== '#' && link.url !== ''
  );

  if (realManualLinks.length > 0) {
    return realManualLinks;
  }

  // 2. Fallback to Project Profile socials
  if (projectSocials && typeof projectSocials === 'object' && !Array.isArray(projectSocials)) {
    const projectLinks = Object.entries(projectSocials)
      .filter(([_, value]) => !!value && String(value).trim() !== '' && String(value).trim() !== '#')
      .map(([platform, value]) => ({
        platform,
        icon: getIconForPlatform(platform),
        url: normalizeSocialUrl(platform, String(value)),
        label: SOCIAL_PLATFORMS[platform as SocialPlatform]?.label || platform
      }));

    if (projectLinks.length > 0) {
      return projectLinks;
    }
  }

  // 3. Fallback to placeholders ONLY if no real socials found
  return [
    { platform: 'facebook', icon: 'Facebook', url: '', label: 'Facebook' },
    { platform: 'instagram', icon: 'Instagram', url: '', label: 'Instagram' },
    { platform: 'linkedin', icon: 'Linkedin', url: '', label: 'LinkedIn' }
  ];
};
