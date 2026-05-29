import {
  CompositionBreakpoint,
  CompositionElement,
  CompositionElementAction,
  CompositionElementContent,
  CompositionElementLayout,
  CompositionElementStyle,
  CompositionElementType,
  CompositionSectionSchema,
  createDefaultCompositionSchema
} from '../types/compositionSchema';

const ALLOWED_TYPES: CompositionElementType[] = [
  'heading',
  'paragraph',
  'image',
  'button',
  'card',
  'badge',
  'list',
  'container',
  'divider'
];

const ALLOWED_BREAKPOINTS: CompositionBreakpoint[] = ['desktop', 'tablet', 'mobile'];
const SAFE_GRID_LINE = /^(auto|span\s+\d+|\d+|[-]?\d+\s*\/\s*(span\s+\d+|[-]?\d+))$/;
const UNSAFE_URL_PROTOCOL = /^(javascript|data:text\/html|vbscript):/i;

const clampNumber = (value: unknown, fallback: number, min: number, max: number) => {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
};

const safeString = (value: unknown, fallback = '') => {
  if (value === undefined || value === null) return fallback;
  return String(value).replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '').trim();
};

const safeVisibleText = (value: unknown, fallback = '') => {
  if (value === undefined || value === null) return fallback;
  return String(value).replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
};

const safeUrl = (value: unknown) => {
  const url = safeString(value);
  if (!url || UNSAFE_URL_PROTOCOL.test(url)) return '';
  return url;
};

const normalizeId = (value: unknown, fallback: string) => {
  const normalized = safeString(value, fallback)
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  return normalized || fallback;
};

const normalizeGridLine = (value: unknown) => {
  const normalized = safeString(value);
  if (!normalized) return undefined;
  return SAFE_GRID_LINE.test(normalized) ? normalized : undefined;
};

const normalizeLayout = (layout: unknown): Partial<Record<CompositionBreakpoint, CompositionElementLayout>> | undefined => {
  if (!layout || typeof layout !== 'object') return undefined;
  const normalized: Partial<Record<CompositionBreakpoint, CompositionElementLayout>> = {};
  const source = layout as Record<string, any>;

  ALLOWED_BREAKPOINTS.forEach((breakpoint) => {
    const current = source[breakpoint];
    if (!current || typeof current !== 'object') return;

    normalized[breakpoint] = {
      display: ['block', 'flex', 'grid'].includes(current.display) ? current.display : undefined,
      gridColumn: normalizeGridLine(current.gridColumn),
      gridRow: normalizeGridLine(current.gridRow),
      order: current.order === undefined ? undefined : clampNumber(current.order, 0, -100, 100),
      width: safeString(current.width) || undefined,
      minHeight: current.minHeight === undefined ? undefined : clampNumber(current.minHeight, 0, 0, 1200),
      alignSelf: ['start', 'center', 'end', 'stretch'].includes(current.alignSelf) ? current.alignSelf : undefined,
      justifySelf: ['start', 'center', 'end', 'stretch'].includes(current.justifySelf) ? current.justifySelf : undefined,
      gap: current.gap === undefined ? undefined : clampNumber(current.gap, 0, 0, 120),
      padding: current.padding === undefined ? undefined : clampNumber(current.padding, 0, 0, 160)
    };
  });

  return Object.keys(normalized).length > 0 ? normalized : undefined;
};

const normalizeContent = (type: CompositionElementType, content: unknown): CompositionElementContent => {
  const source = content && typeof content === 'object' ? content as Record<string, any> : {};
  const normalized: CompositionElementContent = {};

  if (type === 'heading') {
    normalized.level = clampNumber(source.level, 2, 1, 6) as 1 | 2 | 3 | 4 | 5 | 6;
    normalized.text = safeVisibleText(source.text);
  }

  if (type === 'paragraph' || type === 'badge') {
    normalized.text = safeVisibleText(source.text);
  }

  if (type === 'image') {
    normalized.src = safeUrl(source.src);
    normalized.alt = safeVisibleText(source.alt);
  }

  if (type === 'button') {
    normalized.label = safeVisibleText(source.label ?? source.text);
    normalized.href = safeUrl(source.href ?? source.url ?? '#') || '#';
  }

  if (type === 'list') {
    normalized.items = Array.isArray(source.items)
      ? source.items.slice(0, 12).map((item: any, index: number) => ({
          id: normalizeId(item?.id, `item_${index + 1}`),
          text: safeVisibleText(item?.text)
        }))
      : [];
  }

  return normalized;
};

const normalizeStyle = (style: unknown): CompositionElementStyle | undefined => {
  if (!style || typeof style !== 'object') return undefined;
  const source = style as Record<string, any>;
  const normalized: CompositionElementStyle = {
    color: safeString(source.color) || undefined,
    background: safeString(source.background) || undefined,
    gradient: safeString(source.gradient) || undefined,
    borderColor: safeString(source.borderColor) || undefined,
    borderWidth: source.borderWidth === undefined ? undefined : clampNumber(source.borderWidth, 0, 0, 12),
    radius: source.radius === undefined ? undefined : clampNumber(source.radius, 0, 0, 999),
    shadow: ['none', 'sm', 'md', 'lg', 'xl'].includes(source.shadow) ? source.shadow : undefined,
    opacity: source.opacity === undefined ? undefined : clampNumber(source.opacity, 1, 0, 1),
    fontSize: source.fontSize === undefined ? undefined : clampNumber(source.fontSize, 16, 8, 120),
    fontWeight: source.fontWeight === undefined ? undefined : clampNumber(source.fontWeight, 400, 100, 950),
    lineHeight: source.lineHeight === undefined ? undefined : clampNumber(source.lineHeight, 1.4, 0.8, 3),
    textTransform: ['none', 'uppercase', 'lowercase', 'capitalize'].includes(source.textTransform) ? source.textTransform : undefined,
    objectFit: ['cover', 'contain', 'fill'].includes(source.objectFit) ? source.objectFit : undefined,
    aspectRatio: safeString(source.aspectRatio) || undefined
  };

  return Object.fromEntries(Object.entries(normalized).filter(([, value]) => value !== undefined)) as CompositionElementStyle;
};

const normalizeActions = (actions: unknown): CompositionElementAction[] | undefined => {
  if (!Array.isArray(actions)) return undefined;

  const normalized = actions.slice(0, 3).map((action) => {
    if (!action || typeof action !== 'object') return null;
    const type = (action as any).type;
    if (type !== 'link' && type !== 'scroll_to') return null;
    return {
      type,
      target: safeUrl((action as any).target),
      label: safeString((action as any).label)
    };
  }).filter(Boolean) as CompositionElementAction[];

  return normalized.length > 0 ? normalized : undefined;
};

const normalizeElement = (element: unknown, index: number, usedIds: Set<string>): CompositionElement | null => {
  if (!element || typeof element !== 'object') return null;
  const source = element as Record<string, any>;
  if (!ALLOWED_TYPES.includes(source.type)) return null;

  let id = normalizeId(source.id, `cmp_el_${index + 1}`);
  if (usedIds.has(id)) {
    let suffix = 2;
    while (usedIds.has(`${id}_${suffix}`)) suffix += 1;
    id = `${id}_${suffix}`;
  }
  usedIds.add(id);

  const type = source.type as CompositionElementType;

  return {
    id,
    type,
    name: safeString(source.name) || undefined,
    parentId: source.parentId === undefined ? null : source.parentId,
    order: clampNumber(source.order, index + 1, -1000, 1000),
    slot: safeString(source.slot) || undefined,
    content: normalizeContent(type, source.content),
    layout: normalizeLayout(source.layout),
    style: normalizeStyle(source.style),
    actions: normalizeActions(source.actions),
    visibility: normalizeVisibility(source.visibility)
  };
};

const normalizeVisibility = (visibility: unknown): Partial<Record<CompositionBreakpoint, boolean>> | undefined => {
  if (!visibility || typeof visibility !== 'object') return undefined;
  const source = visibility as Record<string, any>;
  const normalized: Partial<Record<CompositionBreakpoint, boolean>> = {};

  ALLOWED_BREAKPOINTS.forEach((breakpoint) => {
    if (typeof source[breakpoint] === 'boolean') normalized[breakpoint] = source[breakpoint];
  });

  return Object.keys(normalized).length > 0 ? normalized : undefined;
};

export const parseCompositionSchemaInput = (value: unknown): unknown => {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const validateCompositionSchema = (input: unknown): CompositionSectionSchema => {
  const fallback = createDefaultCompositionSchema();
  const source = parseCompositionSchemaInput(input);

  if (!source || typeof source !== 'object') return fallback;
  const raw = source as Record<string, any>;
  if (raw.schemaVersion !== 1 || raw.type !== 'composition_section') return fallback;

  const usedIds = new Set<string>();
  const elements = Array.isArray(raw.elements)
    ? raw.elements.map((element, index) => normalizeElement(element, index, usedIds)).filter(Boolean) as CompositionElement[]
    : [];

  const existingIds = new Set(elements.map((element) => element.id));
  const normalizedElements = elements
    .map((element) => ({
      ...element,
      parentId: element.parentId && existingIds.has(String(element.parentId)) ? String(element.parentId) : null
    }))
    .sort((left, right) => left.order - right.order);

  const sectionSource = raw.section && typeof raw.section === 'object' ? raw.section : {};
  const layoutSource = raw.layout && typeof raw.layout === 'object' ? raw.layout : {};
  const backgroundSource = raw.background && typeof raw.background === 'object' ? raw.background : {};
  const responsiveSource = raw.responsive && typeof raw.responsive === 'object' ? raw.responsive : {};

  return {
    schemaVersion: 1,
    type: 'composition_section',
    name: safeString(raw.name, fallback.name),
    section: {
      htmlId: normalizeId(sectionSource.htmlId, '') || undefined,
      ariaLabel: safeString(sectionSource.ariaLabel, fallback.section.ariaLabel),
      maxWidth: ['sm', 'md', 'lg', 'xl', '2xl', 'full'].includes(sectionSource.maxWidth) ? sectionSource.maxWidth : fallback.section.maxWidth,
      paddingY: clampNumber(sectionSource.paddingY, fallback.section.paddingY || 80, 0, 240),
      paddingX: clampNumber(sectionSource.paddingX, fallback.section.paddingX || 24, 0, 80),
      align: ['left', 'center', 'right'].includes(sectionSource.align) ? sectionSource.align : fallback.section.align,
      overflow: ['visible', 'hidden'].includes(sectionSource.overflow) ? sectionSource.overflow : fallback.section.overflow
    },
    layout: {
      mode: ['grid', 'flex', 'stack'].includes(layoutSource.mode) ? layoutSource.mode : fallback.layout.mode,
      columns: clampNumber(layoutSource.columns, fallback.layout.columns || 12, 1, 12),
      gap: clampNumber(layoutSource.gap, fallback.layout.gap || 24, 0, 96),
      verticalAlign: ['start', 'center', 'end', 'stretch'].includes(layoutSource.verticalAlign) ? layoutSource.verticalAlign : fallback.layout.verticalAlign,
      horizontalAlign: ['start', 'center', 'end', 'stretch'].includes(layoutSource.horizontalAlign) ? layoutSource.horizontalAlign : fallback.layout.horizontalAlign
    },
    background: {
      type: ['solid', 'gradient', 'transparent'].includes(backgroundSource.type) ? backgroundSource.type : fallback.background?.type,
      color: safeString(backgroundSource.color, fallback.background?.color),
      gradient: safeString(backgroundSource.gradient, fallback.background?.gradient)
    },
    responsive: normalizeResponsive(responsiveSource, fallback.responsive),
    elements: normalizedElements.length > 0 ? normalizedElements : fallback.elements
  };
};

const normalizeResponsive = (responsive: Record<string, any>, fallback: CompositionSectionSchema['responsive']) => {
  const normalized: CompositionSectionSchema['responsive'] = {};

  ALLOWED_BREAKPOINTS.forEach((breakpoint) => {
    const current = responsive[breakpoint];
    const fallbackCurrent = fallback?.[breakpoint];
    if (!current && !fallbackCurrent) return;
    const source = current && typeof current === 'object' ? current : {};

    normalized[breakpoint] = {
      columns: clampNumber(source.columns, fallbackCurrent?.columns || 12, 1, 12),
      gap: clampNumber(source.gap, fallbackCurrent?.gap || 24, 0, 96),
      paddingY: source.paddingY === undefined ? fallbackCurrent?.paddingY : clampNumber(source.paddingY, fallbackCurrent?.paddingY || 80, 0, 240),
      paddingX: source.paddingX === undefined ? fallbackCurrent?.paddingX : clampNumber(source.paddingX, fallbackCurrent?.paddingX || 24, 0, 80),
      stackOrder: Array.isArray(source.stackOrder) ? source.stackOrder.map((id: unknown) => normalizeId(id, '')).filter(Boolean) : fallbackCurrent?.stackOrder
    };
  });

  return normalized;
};

