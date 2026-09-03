export type MetaPixelCtaEvent = 'Lead' | 'Contact' | 'None';
export type MetaPixelCtaOverride = MetaPixelCtaEvent;

export interface MetaPixelCta {
  id: string;
  text: string;
  href: string;
  pageId?: string;
  sectionId: string;
  moduleType: string;
  elementId: string;
  actionType?: string;
  location?: string;
}

export const META_PIXEL_CTA_EVENT_OPTIONS: Array<{ value: MetaPixelCtaEvent; label: string }> = [
  { value: 'None', label: 'Ninguno' },
  { value: 'Lead', label: 'Lead' },
  { value: 'Contact', label: 'Contact' }
];

const normalize = (value: unknown) => String(value ?? '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const acquisition = /crear cuenta|crea el tuyo gratis|comenzar gratis|registrarme|crear catalogo|crear en linea|empezar|iniciar registro|alta|solicitar alta/;
const contact = /whatsapp|escribenos|contactanos|contacto|telefono|llamanos|correo|email|mail/;
const navigation = /ver mas|conocer mas|saber mas|leer mas|abrir catalogo|mapa|faq|planes|pasos/;

export const suggestMetaPixelEventForCta = (cta: Pick<MetaPixelCta, 'text' | 'href' | 'actionType'>): MetaPixelCtaEvent => {
  const text = normalize(cta.text);
  const href = normalize(cta.href);
  const intent = `${text} ${normalize(cta.actionType)}`;
  if (acquisition.test(intent)) return 'Lead';
  if (href.startsWith('mailto:') || href.startsWith('tel:') || href.includes('wa.me') || href.includes('whatsapp')) return contact.test(intent) ? 'Contact' : 'Contact';
  if (navigation.test(intent) || href.startsWith('#') || href.startsWith('/') || href.startsWith('./')) return 'None';
  if (contact.test(intent)) return 'Contact';
  return 'None';
};

export const resolveMetaPixelCtaEvent = (cta: MetaPixelCta, overrides?: Record<string, string>): { suggested: MetaPixelCtaEvent; applied: MetaPixelCtaEvent; manual: boolean } => {
  const suggested = suggestMetaPixelEventForCta(cta);
  const override = overrides?.[cta.id];
  const applied = override === 'Lead' || override === 'Contact' || override === 'None' ? override : suggested;
  return { suggested, applied, manual: Boolean(override && ['Lead', 'Contact', 'None'].includes(override)) };
};

const textFrom = (value: any) => String(value?.text ?? value?.label ?? value?.title ?? value?.name ?? '').trim();
const hrefFrom = (value: any) => String(value?.href ?? value?.url ?? value?.link ?? value?.target ?? '').trim();

/** Extracts common CTA contracts without requiring every module to know about Pixel. */
export const collectMetaPixelCtas = (siteContent: any): MetaPixelCta[] => {
  const result: MetaPixelCta[] = [];
  const seen = new Set<string>();
  const sections = Array.isArray(siteContent?.sections) ? siteContent.sections : [];
  const add = (cta: MetaPixelCta) => {
    if (!cta.text && !cta.href) return;
    if (seen.has(cta.id)) return;
    seen.add(cta.id); result.push(cta);
  };
  sections.forEach((section: any, sectionIndex: number) => {
    const sectionId = String(section?.id || `section-${sectionIndex + 1}`);
    const moduleType = String(section?.type || section?.tipo || 'module');
    const location = String(section?.editor_label || section?.name || section?.content?.title || `Sección ${sectionIndex + 1}`);
    const values = { ...(section?.settings || {}), ...(section?.settingsValues || {}) };
    const fields = new Map<string, any>();
    Object.entries(values).forEach(([key, value]) => {
      const match = key.match(/^(.*)_((?:primary|secondary|main|cta)_?(?:text|label|url|href|link))$/i);
      if (!match) return;
      const base = match[1];
      const field = match[2].toLowerCase();
      const role = match[2].match(/^(primary|secondary|main|cta)/i)?.[1]?.toLowerCase() || 'cta';
      const group = base.replace(new RegExp(`^${sectionId}_?`), '').replace(/_(?:text|label|url|href|link)$/i, '');
      const fieldKey = `${sectionId}:${group}:${role}`;
      const current = fields.get(fieldKey) || { text: '', href: '', elementId: `${group || base}.${role}` };
      if (field.includes('text') || field.includes('label')) current.text = String(value ?? ''); else current.href = String(value ?? '');
      fields.set(fieldKey, current);
    });
    fields.forEach((field, fieldKey) => {
      if (!fieldKey.startsWith(`${sectionId}:`)) return;
      add({ id: `${sectionId}.${field.elementId}`, text: field.text, href: field.href, sectionId, moduleType, elementId: field.elementId, location });
    });
    const walk = (value: any, path: string, depth = 0) => {
      if (depth > 5 || !value || typeof value !== 'object') return;
      if (!Array.isArray(value)) {
        const text = textFrom(value), href = hrefFrom(value);
        const looksLikeAction = /cta|button|action|link|url|href/i.test(path) || value.actionType;
        if (href || (text && looksLikeAction)) add({ id: `${sectionId}.${path}`, text, href, sectionId, moduleType, elementId: path, actionType: value.actionType, location });
      }
      Object.entries(value).forEach(([key, child]) => walk(child, `${path}.${key}`, depth + 1));
    };
    walk(section?.content, 'content');
  });
  return result;
};

export const formatMetaPixelCtaDestination = (href: string) => {
  const value = String(href || '').trim();
  if (!value) return 'Sin destino';
  if (value.startsWith('mailto:')) return 'Correo';
  if (value.startsWith('tel:')) return 'Teléfono';
  if (/wa\.me|whatsapp/i.test(value)) return 'WhatsApp';
  if (value.startsWith('#')) return value;
  if (/^https?:\/\//i.test(value)) return 'Página externa';
  return value;
};
