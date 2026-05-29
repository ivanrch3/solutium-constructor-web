export type CompositionBreakpoint = 'desktop' | 'tablet' | 'mobile';

export type CompositionElementType =
  | 'heading'
  | 'paragraph'
  | 'image'
  | 'button'
  | 'card'
  | 'badge'
  | 'list'
  | 'container'
  | 'divider';

export type CompositionLayoutMode = 'grid' | 'flex' | 'stack';

export interface CompositionSectionSchema {
  schemaVersion: 1;
  type: 'composition_section';
  name?: string;
  section: CompositionSectionSettings;
  layout: CompositionLayoutSettings;
  background?: CompositionBackgroundSettings;
  responsive?: Partial<Record<CompositionBreakpoint, CompositionResponsiveSettings>>;
  elements: CompositionElement[];
}

export interface CompositionSectionSettings {
  htmlId?: string;
  ariaLabel?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  paddingY?: number;
  paddingX?: number;
  align?: 'left' | 'center' | 'right';
  overflow?: 'visible' | 'hidden';
}

export interface CompositionLayoutSettings {
  mode: CompositionLayoutMode;
  columns?: number;
  gap?: number;
  verticalAlign?: 'start' | 'center' | 'end' | 'stretch';
  horizontalAlign?: 'start' | 'center' | 'end' | 'stretch';
}

export interface CompositionBackgroundSettings {
  type?: 'solid' | 'gradient' | 'transparent';
  color?: string;
  gradient?: string;
}

export interface CompositionResponsiveSettings {
  columns?: number;
  gap?: number;
  paddingY?: number;
  paddingX?: number;
  stackOrder?: string[];
}

export interface CompositionElement {
  id: string;
  type: CompositionElementType;
  name?: string;
  parentId?: string | null;
  order: number;
  slot?: string;
  content?: CompositionElementContent;
  layout?: Partial<Record<CompositionBreakpoint, CompositionElementLayout>>;
  style?: CompositionElementStyle;
  actions?: CompositionElementAction[];
  visibility?: Partial<Record<CompositionBreakpoint, boolean>>;
}

export interface CompositionElementLayout {
  display?: 'block' | 'flex' | 'grid';
  gridColumn?: string;
  gridRow?: string;
  order?: number;
  width?: string;
  minHeight?: number;
  alignSelf?: 'start' | 'center' | 'end' | 'stretch';
  justifySelf?: 'start' | 'center' | 'end' | 'stretch';
  gap?: number;
  padding?: number;
}

export interface CompositionElementContent {
  text?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  src?: string;
  alt?: string;
  label?: string;
  href?: string;
  items?: Array<{ id: string; text: string }>;
}

export interface CompositionElementStyle {
  color?: string;
  background?: string;
  gradient?: string;
  borderColor?: string;
  borderWidth?: number;
  radius?: number;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  opacity?: number;
  fontSize?: number;
  fontWeight?: number;
  lineHeight?: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  objectFit?: 'cover' | 'contain' | 'fill';
  aspectRatio?: string;
}

export interface CompositionElementAction {
  type: 'link' | 'scroll_to';
  target?: string;
  label?: string;
}

export const COMPOSITION_SCHEMA_DEEP_KEY = 'el_composition_tree_schema';

export const createDefaultCompositionSchema = (): CompositionSectionSchema => ({
  schemaVersion: 1,
  type: 'composition_section',
  name: 'Hero visual',
  section: {
    maxWidth: '2xl',
    paddingY: 96,
    paddingX: 24,
    align: 'left',
    overflow: 'hidden',
    ariaLabel: 'Composición visual'
  },
  layout: {
    mode: 'grid',
    columns: 12,
    gap: 28,
    verticalAlign: 'center',
    horizontalAlign: 'stretch'
  },
  background: {
    type: 'gradient',
    color: 'var(--color-background)',
    gradient: 'radial-gradient(circle at top right, color-mix(in srgb, var(--color-primary) 16%, transparent), transparent 42%)'
  },
  responsive: {
    tablet: { columns: 8, gap: 22, paddingY: 72 },
    mobile: { columns: 1, gap: 18, paddingY: 56, paddingX: 18 }
  },
  elements: [
    {
      id: 'cmp_badge_intro',
      type: 'badge',
      name: 'Cejilla',
      parentId: null,
      order: 1,
      content: { text: 'Composición Visual' },
      layout: {
        desktop: { gridColumn: '1 / span 5' },
        tablet: { gridColumn: '1 / span 5' },
        mobile: { gridColumn: '1' }
      },
      style: {
        background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
        color: 'var(--color-primary)',
        radius: 999,
        fontWeight: 800,
        textTransform: 'uppercase'
      }
    },
    {
      id: 'cmp_heading_main',
      type: 'heading',
      name: 'Título',
      parentId: null,
      order: 2,
      content: { level: 2, text: 'Diseña secciones visuales y editables' },
      layout: {
        desktop: { gridColumn: '1 / span 6' },
        tablet: { gridColumn: '1 / span 6' },
        mobile: { gridColumn: '1' }
      },
      style: {
        color: 'var(--color-foreground)',
        fontSize: 58,
        fontWeight: 900,
        lineHeight: 1.04
      }
    },
    {
      id: 'cmp_paragraph_main',
      type: 'paragraph',
      name: 'Descripción',
      parentId: null,
      order: 3,
      content: { text: 'Una base flexible para futuras secciones generadas por IA, con estructura segura y renderer liviano.' },
      layout: {
        desktop: { gridColumn: '1 / span 5' },
        tablet: { gridColumn: '1 / span 6' },
        mobile: { gridColumn: '1' }
      },
      style: {
        color: 'var(--color-muted-foreground)',
        fontSize: 18,
        lineHeight: 1.7
      }
    },
    {
      id: 'cmp_button_primary',
      type: 'button',
      name: 'Botón',
      parentId: null,
      order: 4,
      content: { label: 'Explorar sección', href: '#' },
      layout: {
        desktop: { gridColumn: '1 / span 3' },
        tablet: { gridColumn: '1 / span 3' },
        mobile: { gridColumn: '1' }
      },
      style: {
        background: 'var(--color-primary)',
        color: 'var(--color-primary-foreground)',
        radius: 16,
        fontWeight: 800
      },
      actions: [{ type: 'link', target: '#' }]
    },
    {
      id: 'cmp_visual_card',
      type: 'card',
      name: 'Tarjeta visual',
      parentId: null,
      order: 5,
      layout: {
        desktop: { gridColumn: '7 / span 6', gridRow: '1 / span 5', minHeight: 420, padding: 28 },
        tablet: { gridColumn: '1 / span 8', minHeight: 360, padding: 24 },
        mobile: { gridColumn: '1', minHeight: 300, padding: 20 }
      },
      style: {
        background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 88%, white), color-mix(in srgb, var(--color-primary) 36%, black))',
        color: '#ffffff',
        radius: 32,
        shadow: 'xl'
      }
    },
    {
      id: 'cmp_visual_title',
      type: 'heading',
      name: 'Título visual',
      parentId: 'cmp_visual_card',
      order: 1,
      content: { level: 3, text: 'Lista para Canvas, preview y published' },
      style: { color: '#ffffff', fontSize: 30, fontWeight: 900, lineHeight: 1.1 }
    },
    {
      id: 'cmp_visual_list',
      type: 'list',
      name: 'Lista visual',
      parentId: 'cmp_visual_card',
      order: 2,
      content: {
        items: [
          { id: 'cmp_li_1', text: 'IDs internos estables' },
          { id: 'cmp_li_2', text: 'Responsive por breakpoint' },
          { id: 'cmp_li_3', text: 'Sin dependencias de drag en published' }
        ]
      },
      style: { color: 'rgba(255,255,255,0.88)', fontSize: 15, lineHeight: 1.7 }
    }
  ]
});
