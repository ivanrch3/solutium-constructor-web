
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

export const normalizeSocialPlatform = (input: string): SocialPlatform | undefined => {
  if (!input) return undefined;
  const p = input.toLowerCase().trim();
  
  if (['facebook', 'fb', 'facebook.com'].includes(p)) return 'facebook';
  if (['instagram', 'ig', 'instagram.com'].includes(p)) return 'instagram';
  if (['tiktok', 'tik_tok', 'tt', 'music2', 'tiktok.com'].includes(p)) return 'tiktok';
  if (['x', 'twitter', 'twitter.com'].includes(p)) return 'x';
  if (['linkedin', 'linkedin.com'].includes(p)) return 'linkedin';
  if (['youtube', 'yt', 'youtube.com'].includes(p)) return 'youtube';
  if (['whatsapp', 'wa', 'wa.me'].includes(p)) return 'whatsapp';
  if (['website', 'web', 'globe', 'site'].includes(p)) return 'website';
  
  // Extra mapping for common icon names
  if (p === 'twitter') return 'x';
  if (p === 'music2') return 'tiktok';
  if (p === 'messagecircle') return 'whatsapp';
  if (p === 'globe') return 'website';
  
  return undefined;
};

export const normalizeSocialUrl = (platform: string, value: string): string => {
  if (!value) return '';
  const trimmed = value.trim();
  if (trimmed === '' || trimmed === '#' || trimmed === 'usuario' || trimmed === '@usuario' || trimmed === 'tu_usuario') return '';
  
  // If it's already a full URL, return it
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  
  const normPlatform = normalizeSocialPlatform(platform);
  if (!normPlatform) return trimmed;
  
  const config = SOCIAL_PLATFORMS[normPlatform];
  if (!config) return trimmed;

  let username = trimmed;
  if (username.startsWith('@')) username = username.substring(1);
  
  // Special case for TikTok: baseUrl + @username
  if (normPlatform === 'tiktok' && config.baseUrl.endsWith('@') && username.startsWith('@')) {
    username = username.substring(1);
  }
  
  return `${config.baseUrl}${username}`;
};

export const isRealSocialLink = (item: any): boolean => {
  if (!item) return false;
  
  const platform = normalizeSocialPlatform(item.platform || item.icon || item.label);
  const url = String(item.url || item.value || '').trim();
  
  const isInvalid = !url || url === '' || url === '#' || url === 'usuario' || url === '@usuario' || url === 'tu_usuario';
  if (isInvalid) return false;
  
  // If it's already a full URL, it's real
  if (url.startsWith('http')) return true;
  
  // If we have a platform and some value that isn't a placeholder, it might be real
  // but if it's too short (like single char) maybe not? we'll be generous
  return Boolean(platform) && url.length > 1;
};

export const getIconForPlatform = (platform: string): string => {
  const norm = normalizeSocialPlatform(platform);
  return norm ? SOCIAL_PLATFORMS[norm].icon : 'Link';
};

export interface SocialLink {
  platform?: string;
  icon: string;
  url: string;
  label?: string;
}

export const resolveFooterSocialLinks = (
  manualLinks: SocialLink[] | undefined,
  projectSocials: any,
  options: { debug?: boolean, moduleId?: string } = {}
): SocialLink[] => {
  const { debug = false, moduleId = '' } = options;
  
  // 1. Identify manual real links
  const realManualLinks = (manualLinks || []).filter(item => isRealSocialLink(item)).map(item => ({
    platform: normalizeSocialPlatform(item.platform || item.icon || item.label) || 'website',
    icon: item.icon || getIconForPlatform(item.platform || 'website'),
    url: normalizeSocialUrl(item.platform || item.icon || 'website', item.url),
    label: item.label || SOCIAL_PLATFORMS[normalizeSocialPlatform(item.platform || item.icon || 'website') || 'website']?.label || 'Link'
  }));

  if (realManualLinks.length > 0) {
    if (debug) {
      console.log('[FOOTER_SOCIAL_RESOLUTION_DEBUG]', {
        moduleId,
        manualRealSocials: realManualLinks,
        source: "manual",
        placeholderMode: false
      });
    }
    return realManualLinks;
  }

  // 2. Fallback to Project Profile socials
  const projectLinks: SocialLink[] = [];
  
  if (projectSocials) {
    if (Array.isArray(projectSocials)) {
      // Case if it's an array of { platform, value } or similar
      projectSocials.forEach(item => {
        const pStr = String(item.platform || item.label || item.key || '').trim();
        const vStr = String(item.value || item.url || item.username || '').trim();
        const normP = normalizeSocialPlatform(pStr);
        if (normP && vStr && !['', '#', 'usuario'].includes(vStr)) {
          projectLinks.push({
            platform: normP,
            icon: SOCIAL_PLATFORMS[normP].icon,
            url: normalizeSocialUrl(normP, vStr),
            label: SOCIAL_PLATFORMS[normP].label
          });
        }
      });
    } else if (typeof projectSocials === 'object') {
      // Case if it's an object with keys as platforms
      Object.entries(projectSocials).forEach(([key, value]) => {
        const normP = normalizeSocialPlatform(key);
        const vStr = String(value || '').trim();
        if (normP && vStr && !['', '#', 'usuario'].includes(vStr)) {
          projectLinks.push({
            platform: normP,
            icon: SOCIAL_PLATFORMS[normP].icon,
            url: normalizeSocialUrl(normP, vStr),
            label: SOCIAL_PLATFORMS[normP].label
          });
        }
      });
    }
  }

  if (projectLinks.length > 0) {
    if (debug) {
      console.log('[FOOTER_SOCIAL_RESOLUTION_DEBUG]', {
        moduleId,
        projectSocialsRaw: projectSocials,
        finalSocialLinks: projectLinks,
        source: "project_profile",
        placeholderMode: false
      });
    }
    return projectLinks;
  }

  // 3. Fallback to placeholders
  const placeholders = [
    { platform: 'facebook' as SocialPlatform, icon: 'Facebook', url: '', label: 'Facebook' },
    { platform: 'instagram' as SocialPlatform, icon: 'Instagram', url: '', label: 'Instagram' },
    { platform: 'linkedin' as SocialPlatform, icon: 'Linkedin', url: '', label: 'LinkedIn' }
  ];

  if (debug) {
    console.log('[FOOTER_SOCIAL_RESOLUTION_DEBUG]', {
      moduleId,
      finalSocialLinks: placeholders,
      source: "defaults",
      placeholderMode: true
    });
  }

  return placeholders;
};
