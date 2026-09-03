export type MetaPixelCtaEvent = 'Lead' | 'Contact' | 'None';
export type MetaPixelCtaOverride = MetaPixelCtaEvent;

export interface MetaPixelCta {
  id: string;
  text: string;
  href: string;
  pageId?: string;
  pageName?: string;
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
const acquisition = /crear cuenta|crear gratis|crea el tuyo gratis|comenzar gratis|comenzar|registrarme|registrar|crear catalogo|crear en linea|empezar|iniciar registro|abrir cuenta|solicitar alta|alta/;
const contact = /whatsapp|escribenos|contactanos|contacto|telefono|llamanos|correo|email|mail/;
const navigation = /ver mas|conocer mas|saber mas|leer mas|abrir catalogo|mapa|faq|planes|pasos/;

export const suggestMetaPixelEventForCta = (cta: Pick<MetaPixelCta, 'text' | 'href' | 'actionType'>): MetaPixelCtaEvent => {
  const text = normalize(cta.text);
  const href = normalize(cta.href);
  const intent = `${text} ${normalize(cta.actionType)}`;
  if (acquisition.test(intent)) return 'Lead';
  if (href.startsWith('mailto:') || href.startsWith('tel:') || href.includes('wa.me') || href.includes('whatsapp')) return 'Contact';
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
const hrefFrom = (value: any) => String(value?.href ?? value?.url ?? value?.link ?? '').trim();

/** Extracts common CTA contracts without requiring every module to know about Pixel. */
export const collectMetaPixelCtas = (siteContent: any): MetaPixelCta[] => {
  const result: MetaPixelCta[] = [];
  const seen = new Set<string>();
  const pageSections = Array.isArray(siteContent?.pages)
    ? siteContent.pages.flatMap((page: any) => (Array.isArray(page?.sections) ? page.sections.map((section: any) => ({ section, page })) : []))
    : [];
  const sections = [
    ...(Array.isArray(siteContent?.sections) ? siteContent.sections.map((section: any) => ({ section, page: null })) : []),
    ...pageSections
  ];
  const add = (cta: MetaPixelCta) => {
    if (!cta.text && !cta.href) return;
    if (seen.has(cta.id)) return;
    seen.add(cta.id); result.push(cta);
  };
  sections.forEach(({ section, page }, sectionIndex: number) => {
    const sectionId = String(section?.id || `section-${sectionIndex + 1}`);
    const moduleType = String(section?.type || section?.tipo || 'module');
    const pageId = page?.id || page?.pageId || page?.page_id;
    const pageName = String(page?.name || page?.title || page?.label || '').trim() || undefined;
    const sectionName = String(section?.editor_label || section?.name || section?.content?.title || `Sección ${sectionIndex + 1}`);
    const location = pageName ? `${pageName} · ${sectionName}` : sectionName;
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
      add({ id: `${pageId ? `${pageId}.` : ''}${sectionId}.${field.elementId}`, text: field.text, href: field.href, pageId, pageName, sectionId, moduleType, elementId: field.elementId, location });
    });
    const walk = (value: any, path: string, depth = 0) => {
      if (depth > 5 || !value || typeof value !== 'object') return;
      if (!Array.isArray(value)) {
        const text = textFrom(value), href = hrefFrom(value);
        const looksLikeAction = /cta|button|action|link|url|href/i.test(path) || value.actionType;
        const stablePart = value.id || value.elementId || value.element_id || value.key;
        const stablePath = stablePart ? `${path.replace(/\.\d+$/, '')}.${String(stablePart)}` : path;
        if (href || (text && looksLikeAction)) add({ id: `${pageId ? `${pageId}.` : ''}${sectionId}.${stablePath}`, text, href, pageId, pageName, sectionId, moduleType, elementId: stablePath, actionType: value.actionType || value.action_type, location });
      }
      Object.entries(value).forEach(([key, child]) => walk(child, `${path}.${key}`, depth + 1));
    };
    walk(section?.content, 'content');
    walk(section?.settings, 'settings');
    walk(section?.settingsValues, 'settingsValues');
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
