import { SOCIAL_PLATFORMS, normalizeSocialPlatform, resolveFooterSocialLinks } from '../../../utils/socialUtils';

export type FooterColumnType = 'brand' | 'menu' | 'contact' | 'social' | 'text' | 'hours';
export type FooterLinkKind = 'internal' | 'external';

export type FooterLink = {
  id: string;
  label: string;
  url: string;
  kind?: FooterLinkKind;
  target?: '_self' | '_blank';
};

export type FooterSocial = {
  id: string;
  platform: string;
  url: string;
  label?: string;
};

export type FooterHoursDay = {
  id: string;
  label: string;
  closed: boolean;
  open?: string;
  close?: string;
};

export type FooterColumn =
  | { id: string; type: 'brand'; logoSource: 'project' | 'custom'; customLogoUrl?: string; showLogo: boolean; name?: string; showName: boolean; description?: string; showDescription: boolean }
  | { id: string; type: 'menu'; title?: string; links: FooterLink[] }
  | { id: string; type: 'contact'; title?: string; phone?: string; whatsapp?: string; email?: string; address?: string; showPhone: boolean; showWhatsapp: boolean; showEmail: boolean; showAddress: boolean; showIcons: boolean }
  | { id: string; type: 'social'; title?: string; links: FooterSocial[]; presentation: 'icon' | 'icon_label' }
  | { id: string; type: 'text'; title?: string; content: string }
  | { id: string; type: 'hours'; title?: string; days: FooterHoursDay[] };

export type FooterBottomBar = {
  enabled: boolean;
  copyright: string;
  yearMode: 'fixed' | 'current';
  fixedYear?: number;
  legalLinks: FooterLink[];
};

export type FooterV2Config = {
  version: 2;
  columns: FooterColumn[];
  bottomBar: FooterBottomBar;
};

export const FOOTER_CONFIG_SETTING = 'el_footer_config';
export const FOOTER_COLUMN_TYPES: FooterColumnType[] = ['brand', 'menu', 'contact', 'social', 'text', 'hours'];

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const createId = (prefix: string) => `${prefix}_${globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)}`;
const isRecord = (value: unknown): value is Record<string, any> => !!value && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown, fallback = '') => typeof value === 'string' ? value : value == null ? fallback : String(value);
const bool = (value: unknown, fallback: boolean) => value === undefined ? fallback : value === true || value === 'true' || value === 1 || value === '1';
const nonEmpty = (value: unknown) => text(value).trim().length > 0;

const normalizeLink = (value: any, fallbackLabel = 'Enlace'): FooterLink => {
  const url = text(value?.url ?? value?.href ?? '#', '#').trim() || '#';
  const kind: FooterLinkKind = value?.kind === 'internal' || url.startsWith('#') || url.startsWith('/') ? 'internal' : 'external';
  return {
    id: nonEmpty(value?.id) ? text(value.id) : createId('footer_link'),
    label: text(value?.label, fallbackLabel),
    url,
    kind,
    target: value?.target === '_blank' ? '_blank' : '_self'
  };
};

const normalizeSocial = (value: any): FooterSocial => {
  const platform = normalizeSocialPlatform(value?.platform) || 'website';
  const platformConfig = SOCIAL_PLATFORMS[platform as keyof typeof SOCIAL_PLATFORMS];
  return {
    id: nonEmpty(value?.id) ? text(value.id) : createId('footer_social'),
    platform,
    url: text(value?.url, '').trim(),
    ...(value?.label || platformConfig?.label ? { label: text(value?.label, platformConfig?.label) } : {})
  };
};

const normalizeColumn = (value: any): FooterColumn | null => {
  if (!isRecord(value) || !FOOTER_COLUMN_TYPES.includes(value.type)) return null;
  const id = nonEmpty(value.id) ? text(value.id) : createId('footer_column');
  switch (value.type as FooterColumnType) {
    case 'brand':
      return { id, type: 'brand', logoSource: value.logoSource === 'custom' ? 'custom' : 'project', customLogoUrl: text(value.customLogoUrl), showLogo: bool(value.showLogo, true), name: text(value.name), showName: bool(value.showName, true), description: text(value.description), showDescription: bool(value.showDescription, true) };
    case 'menu':
      return { id, type: 'menu', title: text(value.title), links: Array.isArray(value.links) ? value.links.map((link: any) => normalizeLink(link)).filter((link) => nonEmpty(link.label) || link.url !== '#') : [] };
    case 'contact':
      return { id, type: 'contact', title: text(value.title), phone: text(value.phone), whatsapp: text(value.whatsapp), email: text(value.email), address: text(value.address), showPhone: bool(value.showPhone, nonEmpty(value.phone)), showWhatsapp: bool(value.showWhatsapp, nonEmpty(value.whatsapp)), showEmail: bool(value.showEmail, nonEmpty(value.email)), showAddress: bool(value.showAddress, nonEmpty(value.address)), showIcons: bool(value.showIcons, true) };
    case 'social':
      return { id, type: 'social', title: text(value.title), links: Array.isArray(value.links) ? value.links.map(normalizeSocial) : [], presentation: value.presentation === 'icon_label' ? 'icon_label' : 'icon' };
    case 'text':
      return { id, type: 'text', title: text(value.title), content: text(value.content) };
    case 'hours':
      return { id, type: 'hours', title: text(value.title), days: Array.isArray(value.days) ? value.days.map((day: any, index: number) => ({ id: nonEmpty(day?.id) ? text(day.id) : createId('footer_day'), label: text(day?.label, DAYS[index] || `Día ${index + 1}`), closed: bool(day?.closed, false), open: text(day?.open), close: text(day?.close) })) : [] };
  }
};

const defaultLink = (label: string, url = '#'): FooterLink => ({ id: createId('footer_link'), label, url, kind: url === '#' ? 'internal' : 'external', target: '_self' });

const createBrand = (project?: any): FooterColumn => ({ id: createId('footer_column'), type: 'brand', logoSource: 'project', showLogo: true, name: text(project?.name), showName: !!project?.name, description: text(project?.industry), showDescription: !!project?.industry });
const createMenu = (): FooterColumn => ({ id: createId('footer_column'), type: 'menu', title: 'Enlaces', links: [] });
const createContact = (project?: any): FooterColumn => ({ id: createId('footer_column'), type: 'contact', title: 'Contacto', phone: text(project?.phone || project?.whatsapp), whatsapp: text(project?.whatsapp), email: text(project?.email), address: text(project?.address), showPhone: nonEmpty(project?.phone || project?.whatsapp), showWhatsapp: nonEmpty(project?.whatsapp), showEmail: nonEmpty(project?.email), showAddress: nonEmpty(project?.address), showIcons: true });
const createSocial = (project?: any): FooterColumn => ({ id: createId('footer_column'), type: 'social', title: 'Síguenos', links: resolveFooterSocialLinks([], project?.socials).map(normalizeSocial), presentation: 'icon' });

export const createDefaultFooterV2Config = (project?: any): FooterV2Config => ({
  version: 2,
  columns: [createBrand(project), createMenu(), createContact(project), createSocial(project)],
  bottomBar: { enabled: true, copyright: '', yearMode: 'current', legalLinks: [] }
});

export const isValidFooterV2Config = (value: unknown): value is FooterV2Config => {
  return isRecord(value) && value.version === 2 && Array.isArray(value.columns) && value.columns.length >= 1 && value.columns.length <= 4 && value.columns.every((column) => isRecord(column) && FOOTER_COLUMN_TYPES.includes(column.type));
};

export const normalizeFooterV2Config = (value: unknown, project?: any): FooterV2Config | null => {
  if (!isRecord(value) || value.version !== 2) return null;
  const columns = (Array.isArray(value.columns) ? value.columns : []).map(normalizeColumn).filter(Boolean).slice(0, 4) as FooterColumn[];
  if (columns.length === 0) return null;
  const bottom = isRecord(value.bottomBar) ? value.bottomBar : {};
  const defaultBottom = createDefaultFooterV2Config(project).bottomBar;
  return {
    version: 2,
    columns,
    bottomBar: {
      enabled: bool(bottom.enabled, defaultBottom.enabled),
      copyright: text(bottom.copyright, defaultBottom.copyright),
      yearMode: bottom.yearMode === 'fixed' ? 'fixed' : 'current',
      ...(bottom.fixedYear !== undefined && Number.isFinite(Number(bottom.fixedYear)) ? { fixedYear: Number(bottom.fixedYear) } : {}),
      legalLinks: Array.isArray(bottom.legalLinks) ? bottom.legalLinks.map((link: any) => normalizeLink(link)).filter((link) => nonEmpty(link.label) || link.url !== '#') : []
    }
  };
};

export type FooterMigrationResult = { config: FooterV2Config } | { error: string };

export const migrateLegacyFooterToV2 = (settingsValues: Record<string, any>, moduleId: string, project?: any): FooterMigrationResult => {
  const get = (element: string, key: string, fallback?: any) => settingsValues[`${moduleId}_${element}_${key}`] ?? fallback;
  if (get('el_footer_newsletter', 'show_newsletter', true) === true) {
    return { error: 'Este pie de página utiliza Newsletter. Footer V2 todavía no incluye este tipo de contenido. Desactiva Newsletter antes de convertir para evitar perder información.' };
  }
  const legacyColumns = Array.isArray(get('el_footer_nav', 'columns', [])) ? get('el_footer_nav', 'columns', []) : [];
  const columns: FooterColumn[] = [
    { id: createId('footer_column'), type: 'brand', logoSource: nonEmpty(get('el_footer_brand', 'logo_img')) ? 'custom' : 'project', customLogoUrl: text(get('el_footer_brand', 'logo_img')), showLogo: bool(get('el_footer_brand', 'show_logo'), true), name: text(project?.name), showName: !!project?.name, description: text(get('el_footer_brand', 'bio'), text(project?.industry)), showDescription: true },
    ...legacyColumns.map((column: any) => ({ id: createId('footer_column'), type: 'menu' as const, title: text(column?.title), links: Array.isArray(column?.links) ? column.links.map((link: any) => normalizeLink(link)) : [] })),
    { id: createId('footer_column'), type: 'contact', title: 'Contacto', phone: text(get('el_footer_contact', 'phone')), whatsapp: text(get('el_footer_contact', 'phone')), email: text(get('el_footer_contact', 'email')), address: text(get('el_footer_contact', 'address')), showPhone: bool(get('el_footer_contact', 'show_contact'), true) && nonEmpty(get('el_footer_contact', 'phone')), showWhatsapp: false, showEmail: bool(get('el_footer_contact', 'show_contact'), true) && nonEmpty(get('el_footer_contact', 'email')), showAddress: bool(get('el_footer_contact', 'show_contact'), true) && nonEmpty(get('el_footer_contact', 'address')), showIcons: true },
    { id: createId('footer_column'), type: 'social', title: 'Síguenos', links: (Array.isArray(get('el_footer_social', 'social_links', [])) ? get('el_footer_social', 'social_links', []) : []).map(normalizeSocial), presentation: 'icon' }
  ];
  if (columns.length > 4) return { error: 'Este pie de página tiene más contenido del que Footer V2 puede representar en cuatro columnas. Reduce las columnas de navegación antes de convertir para evitar perder información.' };
  return { config: { version: 2, columns, bottomBar: { enabled: true, copyright: text(get('el_footer_bottom', 'copyright')), yearMode: 'current', legalLinks: (Array.isArray(get('el_footer_bottom', 'legal_links', [])) ? get('el_footer_bottom', 'legal_links', []) : []).map((link: any) => normalizeLink(link)) } } };
};

export const getFooterConfigKey = (moduleId: string) => `${moduleId}_${FOOTER_CONFIG_SETTING}`;
export const hasFooterV2Config = (settingsValues: Record<string, any>, moduleId: string) => (
  isValidFooterV2Config(settingsValues?.[getFooterConfigKey(moduleId)])
);
export const composeFooterCopyright = (bottomBar: FooterBottomBar, currentYear: number) => {
  const year = bottomBar.yearMode === 'fixed' && Number.isFinite(bottomBar.fixedYear)
    ? String(bottomBar.fixedYear)
    : String(currentYear);
  return [year, text(bottomBar.copyright).trim()].filter(Boolean).join(' ');
};
export const resolveFooterBrandLogo = (
  column: FooterColumn,
  legacyLogoUrl?: string | null,
  logoUrl?: string | null,
  logoWhiteUrl?: string | null,
  projectLogoUrl?: string | null
) => {
  if (column.type !== 'brand' || !column.showLogo) return '';
  if (column.logoSource === 'custom') return text(column.customLogoUrl).trim();
  return text(legacyLogoUrl || logoUrl || logoWhiteUrl || projectLogoUrl).trim();
};
export const getFooterDayDefaults = () => DAYS.map((label) => ({ id: createId('footer_day'), label, closed: false, open: '09:00', close: '17:00' }));
