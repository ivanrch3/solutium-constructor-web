export type BentoCompositeElementType =
  | 'label'
  | 'image'
  | 'icon'
  | 'title'
  | 'description'
  | 'list'
  | 'button_primary'
  | 'button_secondary';

export type BentoCompositeElement = {
  id: string;
  type: BentoCompositeElementType;
  enabled: boolean;
  [key: string]: any;
};

export type BentoCompositeListItem = { id: string; text: string };

export type BentoButtonSize = 'small' | 'medium' | 'large';
export const BENTO_BUTTON_SIZE_PRESETS: Record<BentoButtonSize, { label: string; fontSize: number; paddingX: number; paddingY: number; minHeight: number }> = {
  small: { label: 'Pequeño', fontSize: 11, paddingX: 12, paddingY: 6, minHeight: 32 },
  medium: { label: 'Mediano', fontSize: 12, paddingX: 16, paddingY: 8, minHeight: 36 },
  large: { label: 'Grande', fontSize: 14, paddingX: 20, paddingY: 10, minHeight: 44 }
};
export const resolveBentoButtonSize = (value: unknown): BentoButtonSize => value === 'small' || value === 'large' ? value : 'medium';
export const getBentoButtonSizePreset = (value: unknown) => BENTO_BUTTON_SIZE_PRESETS[resolveBentoButtonSize(value)];
export const resolveBentoCompositeTextAlign = (value: unknown): 'left' | 'center' | 'right' => value === 'center' ? 'center' : value === 'end' || value === 'right' ? 'right' : 'left';

export const normalizeBentoCompositeListItems = (value: unknown): BentoCompositeListItem[] => (
  Array.isArray(value)
    ? value.map((item, index) => typeof item === 'string'
      ? { id: `composite_list_${index + 1}`, text: item }
      : { id: item?.id || `composite_list_${index + 1}`, text: String(item?.text || '') })
    : []
);

export const reorderBentoCompositeListItems = (items: BentoCompositeListItem[], fromIndex: number, toIndex: number) => {
  if (fromIndex < 0 || toIndex < 0 || fromIndex >= items.length || toIndex >= items.length) return items;
  if (fromIndex === toIndex) return items;
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
};

export const regenerateBentoCompositeListItemIds = (items: BentoCompositeListItem[], prefix = `composite_list_${Date.now()}`) => (
  items.map((item, index) => ({ ...item, id: `${prefix}_${index + 1}` }))
);

export const BENTO_COMPOSITE_ELEMENT_TYPES: BentoCompositeElementType[] = [
  'label', 'image', 'icon', 'title', 'description', 'list', 'button_primary', 'button_secondary'
];

export const resolveBentoCompositeLayout = (layout: unknown, breakpoint: 'desktop' | 'tablet' | 'mobile' = 'desktop') => (
  layout === 'horizontal' && breakpoint !== 'mobile' ? 'horizontal' : 'vertical'
);

export const regenerateBentoCompositeElementIds = (
  elements: BentoCompositeElement[],
  createId: (type: BentoCompositeElementType, index: number) => string = (type, index) => `composite_${type}_${Date.now()}_${index + 1}`
) : BentoCompositeElement[] => elements.map((element, index) => ({ ...element, id: createId(element.type, index) }));

const defaultId = (type: BentoCompositeElementType, index: number) => `composite_${type}_${index + 1}`;

export const createBentoCompositeElements = (createId: (type: BentoCompositeElementType, index: number) => string = defaultId): BentoCompositeElement[] => [
  { id: createId('label', 0), type: 'label', enabled: false, text: 'Etiqueta' },
  { id: createId('image', 1), type: 'image', enabled: false, src: '', alt: '' },
  { id: createId('icon', 2), type: 'icon', enabled: false, name: 'Sparkles', color: 'var(--color-primary, #2563EB)', size: 36 },
  { id: createId('title', 3), type: 'title', enabled: true, text: 'Tu título', font_size: 't3', font_weight: '800', color: 'var(--color-foreground, #0F172A)', line_height: 1.2, letter_spacing: 0 },
  { id: createId('description', 4), type: 'description', enabled: true, text: 'Agrega una descripción para este bloque.', font_size: 'p', font_weight: '400', color: 'var(--color-muted-foreground, #64748B)', line_height: 1.45, letter_spacing: 0 },
  { id: createId('list', 5), type: 'list', enabled: false, items: [{ id: 'composite_list_1', text: 'Primer punto' }, { id: 'composite_list_2', text: 'Segundo punto' }] },
  { id: createId('button_primary', 6), type: 'button_primary', enabled: false, text: 'Ver más', url: '#', target: '_self', style: 'solid', buttonSize: 'medium' },
  { id: createId('button_secondary', 7), type: 'button_secondary', enabled: false, text: 'Saber más', url: '#', target: '_self', style: 'outline', buttonSize: 'medium' }
];

export const normalizeBentoCompositeElements = (value: unknown): BentoCompositeElement[] => {
  if (!Array.isArray(value)) return createBentoCompositeElements();
  return value.map((element, index) => ({
    ...element,
    id: element?.id || defaultId(element?.type || 'title', index),
    type: BENTO_COMPOSITE_ELEMENT_TYPES.includes(element?.type) ? element.type : 'title',
    enabled: element?.enabled === true
  }));
};

export const reorderBentoCompositeElements = <T extends BentoCompositeElement>(elements: T[], fromIndex: number, toIndex: number) => {
  if (!Array.isArray(elements) || fromIndex < 0 || toIndex < 0 || fromIndex >= elements.length || toIndex >= elements.length) return elements;
  if (fromIndex === toIndex) return elements;
  const next = [...elements];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
};

export const updateBentoCompositeElement = (
  elements: BentoCompositeElement[],
  id: string,
  updates: Record<string, any>
) => elements.map((element) => element.id === id ? { ...element, ...updates } : element);

const textLines = (text: unknown, charsPerLine: number) => {
  const value = String(text || '').trim();
  return value ? Math.max(1, Math.ceil(value.length / Math.max(charsPerLine, 1))) : 0;
};

export const estimateBentoCompositeHeight = (item: Record<string, any> = {}, breakpoint: 'desktop' | 'tablet' | 'mobile' = 'desktop') => {
  const elements = normalizeBentoCompositeElements(item.composite_elements).filter((element) => element.enabled);
  const span = breakpoint === 'mobile' ? item.mobile_span || item.col_span || 4 : breakpoint === 'tablet' ? item.tablet_span || item.col_span || 3 : item.desktop_span || item.col_span || 8;
  const charsPerLine = breakpoint === 'mobile' ? 20 : Math.max(18, Math.round(Number(span) * 4.5));
  const padding = Math.max(0, Number(item.padding) || 32);
  const gap = Math.max(0, Number(item.composite_gap) || 12);
  const visualTypes = new Set(['image', 'icon']);
  const visual = elements.filter((element) => visualTypes.has(element.type));
  const content = elements.filter((element) => !visualTypes.has(element.type));
  const elementHeight = (element: BentoCompositeElement) => {
    if (element.type === 'image') return breakpoint === 'mobile' ? 140 : 180;
    if (element.type === 'icon') return Math.max(40, Number(element.size) || 36) + 16;
    if (element.type === 'label') return 24;
    if (element.type === 'title') return textLines(element.text, charsPerLine) * 32;
    if (element.type === 'description') return textLines(element.text, charsPerLine) * 24;
    if (element.type === 'list') return Math.max(1, Array.isArray(element.items) ? element.items.length : 0) * 30;
    return 44;
  };
  const sum = (items: BentoCompositeElement[]) => items.reduce((total, element) => total + elementHeight(element), 0) + Math.max(items.length - 1, 0) * gap;
  const isHorizontal = resolveBentoCompositeLayout(item.composite_layout, breakpoint) === 'horizontal';
  const contentHeight = sum(content);
  const visualHeight = visual.length ? Math.max(...visual.map(elementHeight)) + Math.max(visual.length - 1, 0) * gap : 0;
  return Math.max(20, (isHorizontal ? Math.max(visualHeight, contentHeight) : sum(elements)) + padding * 2);
};
