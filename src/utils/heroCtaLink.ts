import { normalizeSectionAnchorId } from './menuNavigation';

export type HeroCtaLinkType = 'external' | 'internal';

export type ResolvedHeroCtaLink = {
  href: string;
  target?: '_blank';
  rel?: 'noopener noreferrer';
  type: HeroCtaLinkType;
};

const UNSAFE_PROTOCOL = /^(javascript|data|vbscript):/i;

const normalizeInternalAnchor = (value: string) => {
  const clean = value.trim();
  if (!clean || clean === '#') return null;

  const anchorId = clean.replace(/^#/, '');
  if (!anchorId || /[\u0000-\u001f\u007f]/.test(anchorId)) return null;

  return `#${normalizeSectionAnchorId(anchorId)}`;
};

const normalizeExternalUrl = (value: string) => {
  const clean = value.trim();
  if (!clean || UNSAFE_PROTOCOL.test(clean)) return null;

  if (/^www\./i.test(clean)) return `https://${clean}`;
  if (/^(https?):\/\//i.test(clean)) {
    try {
      const parsed = new URL(clean);
      return parsed.hostname ? clean : null;
    } catch {
      return null;
    }
  }
  if (/^(mailto|tel):/i.test(clean) || /^wa\.me\//i.test(clean)) {
    return /^wa\.me\//i.test(clean) ? `https://${clean}` : clean;
  }
  if (/^\.?\.?\//.test(clean)) return clean;

  return null;
};

export const resolveHeroCtaLink = (
  rawValue: unknown,
  rawType: unknown = 'external',
  rawTarget: unknown = '_self'
): ResolvedHeroCtaLink | null => {
  const value = String(rawValue ?? '').trim();
  const requestedType: HeroCtaLinkType = rawType === 'internal' ? 'internal' : 'external';
  // Legacy Hero data stored anchors in the URL field without a link type.
  const type: HeroCtaLinkType = requestedType === 'internal' || value.startsWith('#') ? 'internal' : 'external';
  const href = type === 'internal' ? normalizeInternalAnchor(value) : normalizeExternalUrl(value);
  if (!href) return null;

  if (type === 'internal') return { href, type };
  if (rawTarget === '_blank') return { href, target: '_blank', rel: 'noopener noreferrer', type };
  return { href, type };
};
