import { MODULE_INFO } from '../components/constructor/registry';

export type MenuMode = 'automatic' | 'manual';

type ModuleLike = {
  id: string;
  type: string;
  iconKey?: string;
  name?: string;
  templateId?: string;
};

type MenuItemLike = {
  id?: string;
  moduleId?: string;
  label?: string;
  url?: string;
  icon?: string;
  is_title?: boolean;
  [key: string]: any;
};

export const getShowInMenuKey = (moduleId: string) => `${moduleId}_global_show_in_menu`;
export const getMenuModeKey = (menuId: string) => `${menuId}_global_menu_mode`;

export const normalizeSectionAnchorId = (sectionId: string) => {
  const normalizedId = String(sectionId || '')
    .trim()
    .replace(/^#/, '')
    .replace(/^section-/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return `section-${normalizedId || 'module'}`;
};

export const resolveSectionHref = (sectionId: string) => `#${normalizeSectionAnchorId(sectionId)}`;

export const isUtilityMenuModule = (module: ModuleLike) =>
  ['navegacion', 'menu', 'espaciador', 'footer'].includes(module.type) ||
  module.id.startsWith('mod_header_1') ||
  module.id.startsWith('mod_menu_1') ||
  module.id.startsWith('mod_footer_1');

export const isMenuModuleLike = (module?: ModuleLike | null) => Boolean(
  module && (
    module.type === 'menu' ||
    module.type === 'navegacion' ||
    module.templateId === 'mod_menu_1' ||
    module.id === 'mod_menu_1' ||
    module.id.startsWith('mod_menu_1')
  )
);

export const isHeaderModuleLike = (module?: ModuleLike | null) => Boolean(
  module && (
    module.type === 'header' ||
    module.type === 'conversion' ||
    module.templateId === 'mod_header_1' ||
    module.id === 'mod_header_1' ||
    module.id.startsWith('mod_header_1')
  )
);

export const isFooterModuleLike = (module?: ModuleLike | null) => Boolean(
  module && (
    module.type === 'footer' ||
    module.templateId === 'mod_footer_1' ||
    module.id === 'mod_footer_1' ||
    module.id.startsWith('mod_footer_1')
  )
);

export const normalizeMenuPositionValue = (rawPosition: unknown, rawSticky?: unknown): 'relative' | 'fixed' => {
  const normalizedPosition = String(rawPosition || '').trim().toLowerCase();
  if (normalizedPosition === 'fixed' || normalizedPosition === 'sticky') return 'fixed';
  if (
    normalizedPosition === 'relative' ||
    normalizedPosition === 'standard' ||
    normalizedPosition === 'static' ||
    normalizedPosition === 'normal'
  ) {
    return 'relative';
  }
  if (rawSticky === true || rawSticky === 'true' || rawSticky === 1 || rawSticky === '1') {
    return 'fixed';
  }
  return 'relative';
};

export const normalizeHeaderPositionValue = (rawPosition: unknown, rawSticky?: unknown): 'relative' | 'fixed' => {
  const normalizedPosition = String(rawPosition || '').trim().toLowerCase();
  if (normalizedPosition === 'fixed' || normalizedPosition === 'sticky') return 'fixed';
  if (
    normalizedPosition === 'relative' ||
    normalizedPosition === 'standard' ||
    normalizedPosition === 'static' ||
    normalizedPosition === 'normal'
  ) {
    return 'relative';
  }
  if (rawSticky === true || rawSticky === 'true' || rawSticky === 1 || rawSticky === '1') {
    return 'fixed';
  }
  return 'relative';
};

export const normalizeMenuFirstOrder = <T extends ModuleLike>(modules: T[]) => {
  const list = Array.isArray(modules) ? modules : [];
  const firstMenuIndex = list.findIndex((module) => isMenuModuleLike(module));
  if (firstMenuIndex <= 0) return list;

  const firstMenu = list[firstMenuIndex];
  return [
    firstMenu,
    ...list.slice(0, firstMenuIndex),
    ...list.slice(firstMenuIndex + 1)
  ];
};

export const normalizeConstructorModuleOrder = <T extends ModuleLike>(modules: T[]) => {
  const ordered = normalizeMenuFirstOrder(modules);
  const footerModules = ordered.filter((module) => isFooterModuleLike(module));
  if (footerModules.length === 0) return ordered;
  const normalized = [
    ...ordered.filter((module) => !isFooterModuleLike(module)),
    ...footerModules
  ];
  const changed = normalized.length !== ordered.length || normalized.some((module, index) => module !== ordered[index]);
  return changed ? normalized : ordered;
};

export const isMenuEligibleModule = (module: ModuleLike) =>
  !isUtilityMenuModule(module) &&
  !['spacer', 'espaciador'].includes(module.type);

export const resolveMenuMode = (menuId: string, settingsValues: Record<string, any>): MenuMode => {
  const raw = String(settingsValues[getMenuModeKey(menuId)] || '').trim().toLowerCase();
  return raw === 'manual' ? 'manual' : 'automatic';
};

export const resolveShowInMenuState = (module: ModuleLike, settingsValues: Record<string, any>) => {
  if (!isMenuEligibleModule(module)) return false;
  const rawValue = settingsValues[getShowInMenuKey(module.id)];
  if (rawValue === undefined || rawValue === null) return true;
  if (typeof rawValue === 'string') {
    const normalized = rawValue.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return Boolean(rawValue);
};

export const dedupeMenuLinks = (links: MenuItemLike[]) => {
  const seen = new Set<string>();
  return (Array.isArray(links) ? links : []).filter((link) => {
    if (!link || typeof link !== 'object') return false;
    if (link.is_title) return true;
    const url = String(link.href || link.url || '').trim();
    const label = String(link.label || '').trim();
    const key = url.startsWith('#') ? url : `${url}__${label}`;
    if (!url || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const resolveModuleDisplayLabel = (module: ModuleLike) => {
  const moduleInfo =
    (module.iconKey && (MODULE_INFO as any)[module.iconKey]) ||
    (MODULE_INFO as any)[module.type];

  return moduleInfo?.label || module.name || module.type;
};

export const buildAutomaticMenuItems = ({
  modules,
  settingsValues
}: {
  modules: ModuleLike[];
  settingsValues: Record<string, any>;
}) => {
  const labelCounts = new Map<string, number>();
  const items = modules
    .filter((module) => resolveShowInMenuState(module, settingsValues))
    .map((module) => {
      const baseLabel = resolveModuleDisplayLabel(module);
      const nextCount = (labelCounts.get(baseLabel) || 0) + 1;
      labelCounts.set(baseLabel, nextCount);
      const href = resolveSectionHref(module.id);

      return {
        id: module.id,
        moduleId: module.id,
        targetSectionId: module.id,
        label: nextCount > 1 ? `${baseLabel} ${nextCount}` : baseLabel,
        href,
        url: href,
        type: 'internal' as const,
        icon: module.iconKey || module.type || '',
        source: 'auto' as const
      };
    });

  return dedupeMenuLinks(items);
};

const normalizeMenuLinkTarget = (value: unknown) => String(value || '')
  .trim()
  .replace(/^#/, '')
  .replace(/^section-/, '');

const getMenuLinkTargets = (link: MenuItemLike) => [
  link.targetSectionId,
  link.moduleId,
  normalizeMenuLinkTarget(link.href),
  normalizeMenuLinkTarget(link.url)
].filter(Boolean).map(String);

export const mergeAutomaticMenuItemsWithExisting = (
  automaticLinks: MenuItemLike[],
  existingLinks: MenuItemLike[]
) => {
  const existing = Array.isArray(existingLinks) ? existingLinks : [];

  return dedupeMenuLinks((Array.isArray(automaticLinks) ? automaticLinks : []).map((autoLink) => {
    const autoTargets = getMenuLinkTargets(autoLink);
    const existingLink = existing.find((link) => {
      if (!link || typeof link !== 'object') return false;
      const existingTargets = getMenuLinkTargets(link);
      return autoTargets.some((target) => existingTargets.includes(target));
    });

    if (!existingLink) return autoLink;

    return {
      ...existingLink,
      ...autoLink,
      label: existingLink.label || autoLink.label,
      icon: existingLink.icon || existingLink.iconName || existingLink.iconId || autoLink.icon,
      badge: existingLink.badge || autoLink.badge,
      customLabel: existingLink.customLabel || undefined,
      customIcon: existingLink.customIcon || undefined,
      customBadge: existingLink.customBadge || undefined,
      isCustomized: existingLink.isCustomized || existingLink.customLabel || existingLink.customIcon || existingLink.customBadge || undefined
    };
  }));
};
