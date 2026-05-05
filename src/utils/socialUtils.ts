
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

export const normalizeSocialUrl = (platform: string, value: string): string => {
  if (!value) return '';
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  
  const p = platform.toLowerCase() as SocialPlatform;
  const config = SOCIAL_PLATFORMS[p];
  if (!config) return value;

  let username = value.trim();
  // Remove leading @ if it exists (but keep it for the final URL construction if needed by baseUrl)
  if (username.startsWith('@')) username = username.substring(1);
  
  return `${config.baseUrl}${username}`;
};

export const getIconForPlatform = (platform: string): string => {
  const p = platform.toLowerCase() as SocialPlatform;
  return SOCIAL_PLATFORMS[p]?.icon || 'Link';
};
