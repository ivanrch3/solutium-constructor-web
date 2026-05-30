import { AIPagePlan, ReferenceSectionBlueprint, SectionLayoutBlueprint } from '../types/ai';
import { CompositionElement, CompositionSectionSchema } from '../types/compositionSchema';
import { validateCompositionSchema } from './compositionSchemaValidator';

type AISection = AIPagePlan['sections'][number];

export type NormalizedVisualSectionIntent =
  | 'hero_visual'
  | 'product_showcase'
  | 'media_showcase'
  | 'feature_media_split'
  | 'feature_grid'
  | 'compact_card_grid'
  | 'benefits_grid'
  | 'social_proof'
  | 'explainer_split'
  | 'faq_split'
  | 'final_cta'
  | 'generic_content_block';

export interface MasterModuleImageCandidate {
  url: string;
  alt?: string;
  source?: 'pexels' | 'placeholder';
  photographer?: string;
  pexelsUrl?: string;
  query?: string;
  queryUsed?: string;
  candidateIndex?: number;
  imageWasReused?: boolean;
  usedImageUrlsCount?: number;
}

export interface BuildMasterModuleSchemaOptions {
  section: AISection;
  sectionIndex: number;
  allSections?: AISection[];
  forcedIntent?: NormalizedVisualSectionIntent;
  image?: MasterModuleImageCandidate | null;
}

const root = (gridColumn: string, minHeight?: number, padding?: number) => ({
  desktop: { gridColumn, minHeight, padding },
  tablet: { gridColumn: '1 / span 8', minHeight, padding },
  mobile: { gridColumn: '1', minHeight, padding: padding ? Math.max(14, Math.round(padding * 0.72)) : undefined }
});

const itemText = (items: unknown, index: number, fallback: string) => {
  if (!Array.isArray(items)) return fallback;
  const item = items[index];
  if (typeof item === 'string') return item;
  if (item && typeof item === 'object' && typeof (item as any).text === 'string') return (item as any).text;
  return fallback;
};

const getBlueprint = (section: AISection): ReferenceSectionBlueprint | null => {
  const blueprint = (section.content as any)?.sectionBlueprint;
  return blueprint && typeof blueprint === 'object' ? blueprint as ReferenceSectionBlueprint : null;
};

const getLayoutBlueprint = (section: AISection): SectionLayoutBlueprint | null => {
  const blueprint = (section.content as any)?.sectionLayoutBlueprint;
  return blueprint && typeof blueprint === 'object' ? blueprint as SectionLayoutBlueprint : null;
};

const normalizeRole = (section: AISection) => {
  const blueprint = getBlueprint(section);
  const layoutBlueprint = getLayoutBlueprint(section);
  const role = String(layoutBlueprint?.roleHint || blueprint?.role || '').toLowerCase();
  if (role === 'showcase') return 'product_showcase';
  if (role === 'feature_grid' || role === 'content_grid') return 'features';
  if (role === 'social_proof') return 'trust';
  return role || 'generic';
};

export const normalizeVisualSectionIntent = (
  section: AISection,
  sectionIndex: number,
  allSections: AISection[] = []
): NormalizedVisualSectionIntent => {
  const role = normalizeRole(section);
  const blueprint = getBlueprint(section);
  const layoutBlueprint = getLayoutBlueprint(section);
  const layoutType = String(layoutBlueprint?.layout?.type || blueprint?.sourceVisualPattern || '').toLowerCase();
  const gridCount = layoutBlueprint?.layout?.grid?.itemCount || 0;
  const hasMedia = Boolean(layoutBlueprint?.mediaIntent?.needsMedia || blueprint?.hasMedia);
  const total = Math.max(1, allSections.length || 1);
  const isLast = sectionIndex >= total - 1;
  const isNearEnd = sectionIndex >= Math.max(0, total - 2);
  const isDark = layoutBlueprint?.background?.style === 'dark' || blueprint?.backgroundStyle === 'dark';

  if (sectionIndex === 0) return 'hero_visual';
  if (hasMedia && layoutType.includes('centered') && sectionIndex <= 2) return 'product_showcase';
  if (isLast && (role === 'cta' || isDark)) return 'final_cta';
  if (role === 'trust' || role === 'testimonials') return 'social_proof';
  if (layoutType.includes('card_grid') || layoutType.includes('bento') || gridCount >= 3) {
    return sectionIndex <= 3 ? 'feature_grid' : 'compact_card_grid';
  }
  if (hasMedia && (role === 'product_showcase' || role === 'showcase' || layoutType.includes('product'))) return 'media_showcase';
  if (hasMedia && (layoutType.includes('split') || layoutType.includes('two_columns') || layoutType.includes('alternating') || layoutType.includes('centered'))) {
    return 'explainer_split';
  }
  if (isNearEnd && role === 'faq') return 'faq_split';
  if (isNearEnd && role === 'contact') return 'explainer_split';
  if (isLast) return 'final_cta';
  if (layoutType.includes('two_columns') || layoutType.includes('split')) return sectionIndex % 2 === 0 ? 'feature_media_split' : 'explainer_split';
  if (layoutType.includes('centered')) return sectionIndex % 2 === 0 ? 'benefits_grid' : 'compact_card_grid';
  return 'benefits_grid';
};

export const applySectionVariety = (
  intent: NormalizedVisualSectionIntent,
  sectionIndex: number,
  previousIntents: NormalizedVisualSectionIntent[]
): NormalizedVisualSectionIntent => {
  const previous = previousIntents[previousIntents.length - 1];
  if (!previous || previous !== intent) return intent;

  if (intent === 'media_showcase') return 'feature_media_split';
  if (intent === 'feature_media_split') return 'explainer_split';
  if (intent === 'explainer_split') return 'feature_media_split';
  if (intent === 'feature_grid') return 'compact_card_grid';
  if (intent === 'compact_card_grid') return 'benefits_grid';
  if (intent === 'benefits_grid') return sectionIndex % 2 === 0 ? 'social_proof' : 'compact_card_grid';
  if (intent === 'generic_content_block') return sectionIndex % 2 === 0 ? 'benefits_grid' : 'compact_card_grid';
  return intent;
};

const sectionBackground = (section: AISection) => {
  const blueprint = getBlueprint(section);
  const layoutBlueprint = getLayoutBlueprint(section);
  const style = layoutBlueprint?.background?.style || blueprint?.backgroundStyle;
  if (style === 'dark') {
    return { type: 'gradient' as const, color: '#111827', gradient: 'linear-gradient(135deg, #111827, #1f2937 56%, #312e81)' };
  }
  if (style === 'lavender' || style === 'soft_tint' || style === 'cards') {
    return {
      type: 'gradient' as const,
      color: 'color-mix(in srgb, var(--color-primary) 6%, var(--color-background))',
      gradient: 'radial-gradient(circle at top right, color-mix(in srgb, var(--color-primary) 16%, transparent), transparent 38%)'
    };
  }
  return { type: 'solid' as const, color: 'var(--color-background)' };
};

const baseSchema = (section: AISection, sectionIndex: number): CompositionSectionSchema => ({
  schemaVersion: 1,
  type: 'composition_section',
  name: `Sección ${sectionIndex + 1}`,
  section: {
    maxWidth: '2xl',
    paddingY: 96,
    paddingX: 24,
    align: 'left',
    overflow: 'hidden',
    ariaLabel: `Sección ${sectionIndex + 1}`
  },
  layout: {
    mode: 'grid',
    columns: 12,
    gap: 28,
    verticalAlign: 'center',
    horizontalAlign: 'stretch'
  },
  background: sectionBackground(section),
  responsive: {
    tablet: { columns: 8, gap: 22, paddingY: 72 },
    mobile: { columns: 1, gap: 18, paddingY: 56, paddingX: 18 }
  },
  elements: []
});

const textElements = (section: AISection, prefix: string, startOrder = 1, gridColumn = '1 / span 6'): CompositionElement[] => [
  {
    id: `${prefix}_badge`,
    type: 'badge',
    name: 'Cejilla',
    parentId: null,
    order: startOrder,
    content: { text: String(section.content.eyebrow || section.content.businessType || 'Nuevo') },
    layout: root(gridColumn),
    style: { color: 'var(--color-primary)', background: 'color-mix(in srgb, var(--color-primary) 10%, white)', radius: 999, fontWeight: 900, textTransform: 'uppercase' }
  },
  {
    id: `${prefix}_heading`,
    type: 'heading',
    name: 'Título',
    parentId: null,
    order: startOrder + 1,
    content: { level: startOrder === 1 ? 1 : 2, text: String(section.content.title || section.title || `Sección ${startOrder}`) },
    layout: root(gridColumn),
    style: { color: 'var(--color-foreground)', fontSize: startOrder === 1 ? 60 : 46, fontWeight: 900, lineHeight: 1.05 }
  },
  {
    id: `${prefix}_paragraph`,
    type: 'paragraph',
    name: 'Descripción',
    parentId: null,
    order: startOrder + 2,
    content: { text: String(section.content.description || section.purpose || '') },
    layout: root(gridColumn),
    style: { color: 'var(--color-muted-foreground)', fontSize: 18, lineHeight: 1.7 }
  }
];

const buttonElement = (section: AISection, prefix: string, order: number, gridColumn = '1 / span 3'): CompositionElement => {
  const label = String(section.content.cta || 'Conocer más');
  return {
    id: `${prefix}_button`,
    type: 'button',
    name: 'Botón principal',
    parentId: null,
    order,
    content: { label, href: '#' },
    layout: root(gridColumn),
    style: { color: 'var(--color-primary-foreground)', background: 'var(--color-primary)', radius: 999, fontWeight: 900 },
    actions: [{ type: 'link', target: '#', label }]
  };
};

const mediaElement = (section: AISection, prefix: string, image: MasterModuleImageCandidate | null | undefined, order: number, gridColumn = '7 / span 6', minHeight = 440): CompositionElement[] => {
  const hasImage = Boolean(image?.url);
  const visualCard: CompositionElement = {
    id: `${prefix}_media_card`,
    type: 'card',
    name: hasImage ? 'Imagen visual' : 'Placeholder visual',
    parentId: null,
    order,
    layout: root(gridColumn, minHeight, 18),
    style: { color: 'var(--color-foreground)', background: 'linear-gradient(145deg, #f3efff, #ffffff 54%, #ede7ff)', borderColor: '#ded3ff', borderWidth: 1, radius: 34, shadow: 'xl' as const }
  };

  if (hasImage) {
    return [
      visualCard,
      {
        id: `${prefix}_image`,
        type: 'image',
        name: image?.source === 'pexels' ? 'Imagen Pexels editable' : 'Imagen editable',
        parentId: `${prefix}_media_card`,
        order: 1,
        content: { src: image?.url || '', alt: image?.alt || String(section.content.title || section.title || '') },
        layout: {
          desktop: { gridColumn: '1', minHeight: Math.max(260, minHeight - 60) },
          tablet: { gridColumn: '1', minHeight: 320 },
          mobile: { gridColumn: '1', minHeight: 260 }
        },
        style: { objectFit: 'cover' as const, radius: 26, aspectRatio: '4 / 3' }
      },
      ...(image?.photographer ? [{
        id: `${prefix}_image_credit`,
        type: 'paragraph' as const,
        name: 'Crédito imagen',
        parentId: `${prefix}_media_card`,
        order: 2,
        content: { text: `Foto: ${image.photographer} · Pexels` },
        style: { color: 'var(--color-muted-foreground)', fontSize: 11, lineHeight: 1.4 }
      }] : [])
    ];
  }

  return [
    visualCard,
    {
      id: `${prefix}_image_placeholder`,
      type: 'image',
      name: 'Placeholder de imagen editable',
      parentId: `${prefix}_media_card`,
      order: 1,
      content: { src: '', alt: String(section.content.title || section.title || 'Imagen editable') },
      layout: {
        desktop: { gridColumn: '1', minHeight: Math.max(220, minHeight - 120) },
        tablet: { gridColumn: '1', minHeight: 280 },
        mobile: { gridColumn: '1', minHeight: 220 }
      },
      style: { objectFit: 'cover' as const, radius: 26, aspectRatio: '4 / 3' }
    },
    ...['Visual editable', 'Elemento destacado', 'Detalle de apoyo'].map((label, index) => ({
      id: `${prefix}_mock_${index + 1}`,
      type: 'card' as const,
      name: label,
      parentId: `${prefix}_media_card`,
      order: index + 2,
      style: { color: 'var(--color-foreground)', background: 'rgba(255,255,255,0.86)', borderColor: '#e7ddff', borderWidth: 1, radius: 20, shadow: 'sm' as const }
    }))
  ];
};

const getDetectedColumns = (section: AISection) => {
  const columns = getLayoutBlueprint(section)?.layout?.columns;
  return Array.isArray(columns) && columns.some(column => Array.isArray(column.elements) && column.elements.length > 0)
    ? columns
    : [];
};

const detectedTextForRole = (section: AISection, role: string, fallback: string) => {
  if (role === 'headline') return String(section.content.title || section.title || fallback);
  if (role === 'subtitle' || role === 'body') return String(section.content.description || section.purpose || fallback);
  if (role === 'eyebrow') return String(section.content.eyebrow || section.content.businessType || fallback);
  if (role === 'primary_cta' || role === 'secondary_cta') return String(section.content.cta || fallback);
  return fallback;
};

const elementStyleFromTraits = (element: any, role: string) => {
  const traits = element.visualTraits || {};
  const fontSize = Number(traits.fontSize || 0);
  const fontWeight = typeof traits.fontWeight === 'number' ? traits.fontWeight : Number(traits.fontWeight) || 0;
  return {
    color: role === 'headline' ? 'var(--color-foreground)' : 'var(--color-muted-foreground)',
    fontSize: role === 'headline'
      ? Math.max(38, Math.min(64, fontSize || 52))
      : role === 'eyebrow'
        ? Math.max(11, Math.min(14, fontSize || 12))
        : Math.max(15, Math.min(22, fontSize || 17)),
    fontWeight: role === 'headline' ? Math.max(800, fontWeight || 900) : role === 'eyebrow' ? 900 : Math.max(400, fontWeight || 500),
    lineHeight: role === 'headline' ? 1.06 : 1.65,
    textTransform: role === 'eyebrow' && traits.isUppercase ? 'uppercase' as const : undefined
  };
};

const roleOrder = (element: any) => {
  const role = String(element.semanticRole || '').toLowerCase();
  const type = String(element.type || '').toLowerCase();
  if (role === 'eyebrow') return 1;
  if (role === 'headline') return 2;
  if (role === 'subtitle') return 3;
  if (role === 'body' || role === 'faq_item') return 4;
  if (role === 'metric') return 5;
  if (role === 'feature_card' || type === 'card') return 6;
  if (role === 'primary_cta' || role === 'secondary_cta' || type === 'button') return 7;
  if (role === 'media' || type === 'image' || element.visualTraits?.isImageLike) return 8;
  return 9;
};

const visualElementY = (element: any) => Number(element.relativeBox?.y ?? element.bbox?.y ?? 0);

const sortDetectedElements = (elements: any[] = []) =>
  [...elements].sort((left, right) => {
    const yDiff = visualElementY(left) - visualElementY(right);
    if (Math.abs(yDiff) > 0.03) return yDiff;
    return roleOrder(left) - roleOrder(right);
  });

const isMediaElement = (element: any) =>
  String(element.semanticRole || '').toLowerCase() === 'media' ||
  String(element.type || '').toLowerCase() === 'image' ||
  Boolean(element.visualTraits?.isImageLike);

const isButtonElement = (element: any) =>
  String(element.semanticRole || '').toLowerCase() === 'primary_cta' ||
  String(element.semanticRole || '').toLowerCase() === 'secondary_cta' ||
  String(element.type || '').toLowerCase() === 'button' ||
  Boolean(element.visualTraits?.isButtonLike);

const columnGridForIndex = (column: any, columnIndex: number, totalColumns: number) => {
  if (totalColumns >= 3) return `${1 + columnIndex * 4} / span 4`;
  if (totalColumns >= 2) return column.position === 'right' || columnIndex === 1 ? '7 / span 6' : '1 / span 6';
  return '2 / span 10';
};

const createColumnContainer = (sectionIndex: number, column: any, columnIndex: number, totalColumns: number, order: number): CompositionElement => ({
  id: `detected_${sectionIndex}_column_${columnIndex + 1}`,
  type: 'container',
  name: `Columna detectada ${columnIndex + 1}`,
  parentId: null,
  order,
  layout: root(columnGridForIndex(column, columnIndex, totalColumns), undefined, 0),
  style: { color: 'var(--color-foreground)', background: 'transparent', radius: 0, shadow: 'none' }
});

const createTextElementFromDetected = (
  section: AISection,
  detected: any,
  sectionIndex: number,
  columnIndex: number,
  index: number,
  order: number,
  parentId: string | null,
  gridColumn?: string
): CompositionElement => {
  const semanticRole = String(detected.semanticRole || 'generic').toLowerCase();
  const textRole = semanticRole === 'headline' || semanticRole === 'eyebrow' || semanticRole === 'subtitle' || semanticRole === 'body' || semanticRole === 'faq_item' || semanticRole === 'metric'
    ? semanticRole
    : index === 0 ? 'headline' : 'body';
  const normalizedTextRole = textRole === 'faq_item' ? 'body' : textRole;
  const type = normalizedTextRole === 'headline' ? 'heading' : normalizedTextRole === 'eyebrow' ? 'badge' : 'paragraph';
  return {
    id: `detected_${sectionIndex}_${columnIndex}_${index}_${normalizedTextRole}`,
    type,
    name: normalizedTextRole === 'headline' ? 'T?tulo detectado' : normalizedTextRole === 'eyebrow' ? 'Cejilla detectada' : 'Texto detectado',
    parentId,
    order,
    content: normalizedTextRole === 'headline'
      ? { level: sectionIndex === 0 ? 1 : 2, text: detectedTextForRole(section, normalizedTextRole, `Secci?n ${sectionIndex + 1}`) }
      : { text: detectedTextForRole(section, normalizedTextRole, itemText(section.content.items, index, 'Texto editable')) },
    layout: parentId ? undefined : root(gridColumn || '1 / span 12'),
    style: {
      ...elementStyleFromTraits(detected, normalizedTextRole),
      ...(normalizedTextRole === 'eyebrow' ? { background: 'color-mix(in srgb, var(--color-primary) 10%, white)', color: 'var(--color-primary)', radius: 999 } : {})
    }
  };
};

const createButtonElementFromDetected = (
  section: AISection,
  sectionIndex: number,
  columnIndex: number,
  index: number,
  order: number,
  parentId: string | null,
  gridColumn?: string
): CompositionElement => ({
  ...buttonElement(section, `detected_${sectionIndex}_${columnIndex}_${index}`, order, gridColumn || '1 / span 3'),
  parentId,
  layout: parentId ? undefined : root(gridColumn || '1 / span 3')
});

const buildFromDetectedColumns = (section: AISection, sectionIndex: number, image?: MasterModuleImageCandidate | null) => {
  const layoutBlueprint = getLayoutBlueprint(section);
  const columns = getDetectedColumns(section);
  const globalElements = Array.isArray(layoutBlueprint?.globalElements) ? layoutBlueprint.globalElements : [];
  if (!columns.length && !globalElements.length) return null;

  const schema = baseSchema(section, sectionIndex);
  const layoutType = layoutBlueprint?.layout?.type || 'one_column';
  const shouldPreserveMultipleColumns = columns.length >= 2 || layoutType === 'two_columns' || layoutType === 'split_media_text' || layoutType === 'three_columns';
  const orderedColumns = columns
    .slice()
    .sort((left: any, right: any) => Number(left.xRatio ?? 0) - Number(right.xRatio ?? 0))
    .slice(0, shouldPreserveMultipleColumns ? Math.min(3, columns.length) : 1);
  const renderedColumnCount = shouldPreserveMultipleColumns ? Math.max(2, orderedColumns.length) : 1;
  let order = 1;
  const elements: CompositionElement[] = [];

  if (globalElements.length) {
    sortDetectedElements(globalElements).slice(0, 4).forEach((detected: any, index: number) => {
      if (isMediaElement(detected)) {
        elements.push(...mediaElement(section, `detected_${sectionIndex}_global_${index}`, image, order, layoutType === 'centered' ? '2 / span 10' : '1 / span 12', 360));
        order += 4;
        return;
      }
      if (isButtonElement(detected)) {
        elements.push(createButtonElementFromDetected(section, sectionIndex, 0, index, order, null, '5 / span 4'));
        order += 1;
        return;
      }
      elements.push(createTextElementFromDetected(section, detected, sectionIndex, 0, index, order, null, '2 / span 10'));
      order += 1;
    });
  }

  orderedColumns.forEach((column, columnIndex) => {
    const gridColumn = columnGridForIndex(column, columnIndex, renderedColumnCount);
    const columnElements = sortDetectedElements(column.elements || []).slice(0, 10);
    let mediaRenderedInColumn = false;
    const useColumnContainer = renderedColumnCount >= 2;
    const columnContainer = useColumnContainer ? createColumnContainer(sectionIndex, column, columnIndex, renderedColumnCount, order) : null;

    if (columnContainer) {
      elements.push(columnContainer);
      order += 1;
    }

    let childOrder = 1;
    columnElements.forEach((detected: any, index: number) => {
      const semanticRole = String(detected.semanticRole || 'generic');
      const parentId = columnContainer?.id || null;

      if (isMediaElement(detected)) {
        if (!mediaRenderedInColumn) {
          const mediaElements = mediaElement(
            section,
            `detected_${sectionIndex}_${columnIndex}_${index}`,
            image,
            parentId ? childOrder : order,
            parentId ? '1' : gridColumn,
            column.widthRatio && column.widthRatio > 0.55 ? 500 : 400
          ).map(element => ({
            ...element,
            parentId: element.parentId === null ? parentId : element.parentId
          }));
          elements.push(...mediaElements);
          if (parentId) childOrder += 4;
          else order += 4;
          mediaRenderedInColumn = true;
        }
        return;
      }

      if (isButtonElement(detected)) {
        elements.push(createButtonElementFromDetected(section, sectionIndex, columnIndex, index, parentId ? childOrder : order, parentId, renderedColumnCount >= 2 ? undefined : '5 / span 4'));
        if (parentId) childOrder += 1;
        else order += 1;
        return;
      }

      if (detected.type === 'card' || semanticRole === 'feature_card') {
        const cardId = `detected_${sectionIndex}_${columnIndex}_${index}_card`;
        elements.push({
          id: cardId,
          type: 'card',
          name: 'Card detectada',
          parentId,
          order: parentId ? childOrder : order,
          content: { text: itemText(section.content.items, index, 'Bloque editable') },
          layout: parentId ? undefined : root(gridColumn, 128, 18),
          style: { color: 'var(--color-foreground)', background: 'var(--color-card)', borderColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', borderWidth: 1, radius: 22, shadow: 'sm' as const }
        });
        if (parentId) childOrder += 1;
        else order += 1;
        return;
      }

      elements.push(createTextElementFromDetected(section, detected, sectionIndex, columnIndex, index, parentId ? childOrder : order, parentId, gridColumn));
      if (parentId) childOrder += 1;
      else order += 1;
    });
  });

  if (elements.length < 3) return null;
  schema.elements = elements;
  return validateCompositionSchema(schema);
};

const buildHero = (section: AISection, sectionIndex: number, image?: MasterModuleImageCandidate | null) => {
  const schema = baseSchema(section, sectionIndex);
  schema.elements = [
    ...textElements(section, 'hero', 1, '1 / span 6'),
    buttonElement(section, 'hero', 4, '1 / span 3'),
    ...mediaElement(section, 'hero', image, 5, '7 / span 6', 460)
  ];
  return validateCompositionSchema(schema);
};

const buildMediaShowcase = (section: AISection, sectionIndex: number, image?: MasterModuleImageCandidate | null, alternate = false) => {
  const schema = baseSchema(section, sectionIndex);
  schema.section.paddingY = 88;
  schema.elements = alternate ? [
    ...textElements(section, 'showcase_alt', 1, '1 / span 5'),
    ...[0, 1, 2].map((index) => ({
      id: `showcase_alt_note_${index + 1}`,
      type: 'card' as const,
      name: `Punto visual ${index + 1}`,
      parentId: null,
      order: 4 + index,
      content: { text: itemText(section.content.items, index, ['Detalle editable', 'Beneficio concreto', 'Prueba visual'][index]) },
      layout: root('1 / span 5', 96, 16),
      style: { color: 'var(--color-foreground)', background: 'rgba(255,255,255,0.9)', borderColor: 'color-mix(in srgb, var(--color-primary) 14%, transparent)', borderWidth: 1, radius: 20, shadow: 'sm' as const }
    })),
    ...mediaElement(section, 'showcase_alt', image, 7, '7 / span 6', 390)
  ] : [
    ...textElements(section, 'showcase', 1, '2 / span 10'),
    ...mediaElement(section, 'showcase', image, 4, '2 / span 10', 520),
    ...[0, 1, 2].map((index) => ({
      id: `showcase_note_${index + 1}`,
      type: 'card' as const,
      name: `Detalle visual ${index + 1}`,
      parentId: null,
      order: 7 + index,
      content: { text: itemText(section.content.items, index, ['Vista clara del producto', 'Experiencia fácil de entender', 'Acción orientada al cliente'][index]) },
      layout: root(`${2 + index * 3} / span 3`, 132, 18),
      style: { color: 'var(--color-foreground)', background: 'rgba(255,255,255,0.9)', borderColor: 'color-mix(in srgb, var(--color-primary) 14%, transparent)', borderWidth: 1, radius: 22, shadow: 'sm' as const }
    }))
  ];
  return validateCompositionSchema(schema);
};

const buildFeatureGrid = (section: AISection, sectionIndex: number, image?: MasterModuleImageCandidate | null) => {
  const schema = baseSchema(section, sectionIndex);
  schema.background = { type: 'solid', color: 'color-mix(in srgb, var(--color-primary) 4%, var(--color-background))' };
  schema.elements = [
    ...textElements(section, 'features', 1, '2 / span 10'),
    ...[0, 1, 2, 3].flatMap((index) => {
      const cardId = `features_card_${index + 1}`;
      const column = index % 2 === 0 ? '2 / span 5' : '7 / span 5';
      return [
        {
          id: cardId,
          type: 'card' as const,
          name: `Bloque visual ${index + 1}`,
          parentId: null,
          order: 4 + index,
          layout: root(column, 210, 22),
          style: { color: 'var(--color-foreground)', background: 'var(--color-card)', borderColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)', borderWidth: 1, radius: 28, shadow: 'md' as const }
        },
        ...(index === 0 && image?.url ? [{
          id: `${cardId}_image`,
          type: 'image' as const,
          name: 'Imagen de apoyo',
          parentId: cardId,
          order: 1,
          content: { src: image.url, alt: image.alt || itemText(section.content.items, index, '') },
          layout: { desktop: { gridColumn: '1', minHeight: 116 }, tablet: { gridColumn: '1', minHeight: 112 }, mobile: { gridColumn: '1', minHeight: 128 } },
          style: { objectFit: 'cover' as const, radius: 18, aspectRatio: '16 / 9' }
        }] : []),
        {
          id: `${cardId}_text`,
          type: 'paragraph' as const,
          name: `Texto bloque ${index + 1}`,
          parentId: cardId,
          order: index === 0 && image?.url ? 2 : 1,
          content: { text: itemText(section.content.items, index, ['Beneficio destacado', 'Detalle visual editable', 'Valor para el cliente', 'Siguiente paso claro'][index]) },
          style: { color: 'var(--color-foreground)', fontSize: 16, fontWeight: 800, lineHeight: 1.55 }
        }
      ];
    })
  ];
  return validateCompositionSchema(schema);
};

const buildBenefitsGrid = (section: AISection, sectionIndex: number) => {
  const schema = baseSchema(section, sectionIndex);
  schema.section.align = 'center';
  schema.elements = [
    ...textElements(section, 'benefits', 1, '3 / span 8'),
    ...[0, 1, 2, 3, 4, 5].map((index) => ({
      id: `benefit_${index + 1}`,
      type: 'card' as const,
      name: `Beneficio ${index + 1}`,
      parentId: null,
      order: 4 + index,
      content: { text: itemText(section.content.items, index, ['Beneficio editable', 'Detalle claro', 'Valor diferencial', 'Experiencia simple', 'Confianza', 'Siguiente paso'][index]) },
      layout: root(`${1 + (index % 3) * 4} / span 4`, 132, 18),
      style: { color: 'var(--color-foreground)', background: 'var(--color-card)', borderColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', borderWidth: 1, radius: 24, shadow: 'sm' as const }
    }))
  ];
  return validateCompositionSchema(schema);
};

const buildExplainerSplit = (section: AISection, sectionIndex: number, image?: MasterModuleImageCandidate | null, reverse = false) => {
  const schema = baseSchema(section, sectionIndex);
  const mediaColumn = reverse ? '7 / span 5' : '1 / span 5';
  const textColumn = reverse ? '1 / span 6' : '7 / span 6';
  schema.elements = [
    ...mediaElement(section, 'explainer', image, 1, mediaColumn, 380),
    ...textElements(section, 'explainer', 2, textColumn),
    ...[0, 1, 2].map((index) => ({
      id: `explainer_bullet_${index + 1}`,
      type: 'card' as const,
      name: `Punto ${index + 1}`,
      parentId: null,
      order: 5 + index,
      content: { text: itemText(section.content.items, index, ['Punto editable', 'Beneficio concreto', 'Detalle de apoyo'][index]) },
      layout: root(textColumn.replace('span 6', 'span 5'), 82, 16),
      style: { color: 'var(--color-foreground)', background: 'rgba(255,255,255,0.86)', borderColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', borderWidth: 1, radius: 20, shadow: 'sm' as const }
    }))
  ];
  return validateCompositionSchema(schema);
};

const buildSocialProof = (section: AISection, sectionIndex: number) => {
  const schema = baseSchema(section, sectionIndex);
  schema.section.align = 'center';
  schema.elements = [
    ...textElements(section, 'proof', 1, '3 / span 8'),
    ...[0, 1, 2].map((index) => ({
      id: `proof_metric_${index + 1}`,
      type: 'card' as const,
      name: `Indicador ${index + 1}`,
      parentId: null,
      order: 4 + index,
      content: { text: itemText(section.content.items, index, ['Clientes atendidos', 'Pedidos gestionados', 'Experiencias positivas'][index]) },
      layout: root(`${2 + index * 3} / span 3`, 150, 20),
      style: { color: 'var(--color-foreground)', background: 'var(--color-card)', borderColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', borderWidth: 1, radius: 26, shadow: 'md' as const }
    }))
  ];
  return validateCompositionSchema(schema);
};

const buildFaqSplit = (section: AISection, sectionIndex: number, image?: MasterModuleImageCandidate | null) => {
  const schema = baseSchema(section, sectionIndex);
  schema.elements = [
    ...textElements(section, 'faq', 1, '1 / span 5'),
    ...mediaElement(section, 'faq', image, 4, '7 / span 5', 330),
    ...[0, 1, 2, 3].map((index) => ({
      id: `faq_item_${index + 1}`,
      type: 'card' as const,
      name: `Pregunta visual ${index + 1}`,
      parentId: null,
      order: 7 + index,
      content: { text: itemText(section.content.items, index, ['Pregunta editable', 'Respuesta breve', 'Detalle útil', 'Siguiente duda'][index]) },
      layout: root('1 / span 5', 72, 14),
      style: { color: 'var(--color-foreground)', background: 'rgba(255,255,255,0.9)', borderColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', borderWidth: 1, radius: 18, shadow: 'sm' as const }
    }))
  ];
  return validateCompositionSchema(schema);
};

const buildFinalCta = (section: AISection, sectionIndex: number) => {
  const schema = baseSchema(section, sectionIndex);
  schema.background = { type: 'gradient', color: '#111827', gradient: 'linear-gradient(135deg, #111827, #1f2937 58%, #312e81)' };
  schema.section.align = 'center';
  schema.elements = [
    ...textElements(section, 'cta', 1, '3 / span 8').map(element => ({
      ...element,
      style: {
        ...element.style,
        color: element.type === 'paragraph' ? 'rgba(255,255,255,0.74)' : '#ffffff'
      }
    })),
    buttonElement(section, 'cta', 4, '5 / span 4')
  ];
  return validateCompositionSchema(schema);
};

export function buildMasterModuleSchemaFromSectionBlueprint(options: BuildMasterModuleSchemaOptions): CompositionSectionSchema {
  const { section, sectionIndex, allSections = [], forcedIntent, image } = options;
  const intent = forcedIntent || normalizeVisualSectionIntent(section, sectionIndex, allSections);
  const detailedSchema = buildFromDetectedColumns(section, sectionIndex, image);
  if (detailedSchema) return detailedSchema;

  if (intent === 'hero_visual') return buildHero(section, sectionIndex, image);
  if (intent === 'product_showcase') return buildMediaShowcase(section, sectionIndex, image);
  if (intent === 'media_showcase') return buildMediaShowcase(section, sectionIndex, image);
  if (intent === 'feature_media_split') return buildMediaShowcase(section, sectionIndex, image, true);
  if (intent === 'feature_grid' || intent === 'compact_card_grid') return buildFeatureGrid(section, sectionIndex, image);
  if (intent === 'benefits_grid' || intent === 'generic_content_block') return buildBenefitsGrid(section, sectionIndex);
  if (intent === 'social_proof') return buildSocialProof(section, sectionIndex);
  if (intent === 'faq_split') return buildFaqSplit(section, sectionIndex, image);
  if (intent === 'final_cta') return buildFinalCta(section, sectionIndex);
  return buildExplainerSplit(section, sectionIndex, image, sectionIndex % 2 === 0);
}
