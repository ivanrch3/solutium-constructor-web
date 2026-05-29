import {
  COMPOSITION_SCHEMA_DEEP_KEY,
  CompositionElement,
  CompositionElementType,
  CompositionSectionSchema,
  createDefaultCompositionSchema
} from '../types/compositionSchema';
import { validateCompositionSchema } from './compositionSchemaValidator';

export interface CompositionTreeNode {
  element: CompositionElement;
  children: CompositionTreeNode[];
}

export const getCompositionSchemaKey = (moduleId: string) => `${moduleId}_${COMPOSITION_SCHEMA_DEEP_KEY}`;

export const resolveCompositionSchema = (
  moduleId: string,
  settingsValues?: Record<string, any>,
  content?: any
): CompositionSectionSchema => {
  const deepSchema = settingsValues?.[getCompositionSchemaKey(moduleId)];
  const contentSchema = content?.composition || content;
  return validateCompositionSchema(deepSchema ?? contentSchema ?? createDefaultCompositionSchema());
};

export const stringifyCompositionSchema = (schema: CompositionSectionSchema) =>
  JSON.stringify(validateCompositionSchema(schema), null, 2);

export const buildCompositionTree = (
  schema: CompositionSectionSchema,
  parentId: string | null = null
): CompositionTreeNode[] =>
  schema.elements
    .filter((element) => (element.parentId || null) === parentId)
    .sort((left, right) => left.order - right.order)
    .map((element) => ({
      element,
      children: buildCompositionTree(schema, element.id)
    }));

export const findCompositionElement = (
  schema: CompositionSectionSchema,
  elementId: string | null
) => schema.elements.find((element) => element.id === elementId) || null;

export const getCompositionElementLabel = (element: CompositionElement) => {
  const candidate =
    element.name ||
    element.content?.text ||
    element.content?.label ||
    element.content?.alt ||
    element.content?.items?.[0]?.text ||
    humanizeCompositionType(element.type);

  return candidate.length > 34 ? `${candidate.slice(0, 31)}...` : candidate;
};

export const humanizeCompositionType = (type: string) => {
  const labels: Record<string, string> = {
    heading: 'Heading',
    paragraph: 'Paragraph',
    image: 'Imagen',
    button: 'Botón',
    card: 'Card',
    badge: 'Badge',
    list: 'Lista',
    container: 'Contenedor',
    divider: 'Divisor'
  };

  return labels[type] || type.replace(/_/g, ' ');
};

export const createCompositionElementId = (
  type: CompositionElementType,
  usedIds: Set<string>,
  seed = Date.now()
) => {
  const base = `cmp_${type}_${seed.toString(36)}`;
  let candidate = base;
  let suffix = 2;

  while (usedIds.has(candidate)) {
    candidate = `${base}_${suffix}`;
    suffix += 1;
  }

  return candidate;
};

const getSiblingOrder = (schema: CompositionSectionSchema, parentId: string | null) =>
  schema.elements
    .filter((element) => (element.parentId || null) === parentId)
    .map((element) => element.order);

const getNextOrder = (schema: CompositionSectionSchema, parentId: string | null) => {
  const siblingOrders = getSiblingOrder(schema, parentId);
  return siblingOrders.length > 0 ? Math.max(...siblingOrders) + 1 : 1;
};

export const createCompositionElement = (
  schema: CompositionSectionSchema,
  type: CompositionElementType,
  parentId: string | null = null
): CompositionElement => {
  const usedIds = new Set(schema.elements.map((element) => element.id));
  const id = createCompositionElementId(type, usedIds);
  const baseElement: CompositionElement = {
    id,
    type,
    name: humanizeCompositionType(type),
    parentId,
    order: getNextOrder(schema, parentId),
    layout: {
      desktop: { gridColumn: parentId ? undefined : '1 / span 6' },
      tablet: { gridColumn: parentId ? undefined : '1 / span 6' },
      mobile: { gridColumn: '1' }
    },
    visibility: { desktop: true, tablet: true, mobile: true }
  };

  switch (type) {
    case 'heading':
      return {
        ...baseElement,
        content: { level: 2, text: 'Nuevo título' },
        style: { color: 'var(--color-foreground)', fontSize: 36, fontWeight: 900, lineHeight: 1.12 }
      };
    case 'paragraph':
      return {
        ...baseElement,
        content: { text: 'Nuevo párrafo editable.' },
        style: { color: 'var(--color-muted-foreground)', fontSize: 16, lineHeight: 1.7 }
      };
    case 'button':
      return {
        ...baseElement,
        content: { label: 'Nuevo botón', href: '#' },
        style: {
          background: 'var(--color-primary)',
          color: 'var(--color-primary-foreground)',
          radius: 14,
          fontWeight: 800
        },
        actions: [{ type: 'link', target: '#' }]
      };
    case 'image':
      return {
        ...baseElement,
        content: { src: '', alt: '' },
        style: { radius: 20, objectFit: 'cover', aspectRatio: '16 / 10' }
      };
    case 'card':
    case 'container':
      return {
        ...baseElement,
        layout: {
          desktop: { gridColumn: parentId ? undefined : '1 / span 6', minHeight: 220, padding: 24 },
          tablet: { gridColumn: parentId ? undefined : '1 / span 6', minHeight: 200, padding: 20 },
          mobile: { gridColumn: '1', minHeight: 180, padding: 18 }
        },
        style: {
          background: 'color-mix(in srgb, var(--color-card) 92%, transparent)',
          color: 'var(--color-foreground)',
          radius: 24,
          shadow: 'md'
        }
      };
    case 'badge':
      return {
        ...baseElement,
        content: { text: 'Nueva etiqueta' },
        style: {
          background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
          color: 'var(--color-primary)',
          radius: 999,
          fontWeight: 800
        }
      };
    case 'list':
      return {
        ...baseElement,
        content: {
          items: [
            { id: `${id}_item_1`, text: 'Primer beneficio importante' },
            { id: `${id}_item_2`, text: 'Segundo beneficio editable' }
          ]
        },
        style: { color: 'var(--color-muted-foreground)', fontSize: 15, lineHeight: 1.7 }
      };
    case 'divider':
    default:
      return {
        ...baseElement,
        style: { borderColor: 'color-mix(in srgb, var(--color-border) 70%, transparent)', borderWidth: 1 }
      };
  }
};

export const updateCompositionElement = (
  schema: CompositionSectionSchema,
  elementId: string,
  updater: (element: CompositionElement) => CompositionElement
) =>
  validateCompositionSchema({
    ...schema,
    elements: schema.elements.map((element) => (
      element.id === elementId ? updater(element) : element
    ))
  });

const collectCompositionDescendantIds = (schema: CompositionSectionSchema, elementId: string): string[] => {
  const childIds = schema.elements
    .filter((element) => element.parentId === elementId)
    .map((element) => element.id);

  return childIds.flatMap((childId) => [childId, ...collectCompositionDescendantIds(schema, childId)]);
};

export const addCompositionElement = (
  schema: CompositionSectionSchema,
  type: CompositionElementType,
  parentId: string | null = null
) => {
  const nextElement = createCompositionElement(schema, type, parentId);
  return {
    schema: validateCompositionSchema({
      ...schema,
      elements: [...schema.elements, nextElement]
    }),
    selectedElementId: nextElement.id
  };
};

export const duplicateCompositionElement = (
  schema: CompositionSectionSchema,
  elementId: string
) => {
  const target = findCompositionElement(schema, elementId);
  if (!target) return { schema, selectedElementId: elementId };

  const usedIds = new Set(schema.elements.map((element) => element.id));
  const descendantIds = collectCompositionDescendantIds(schema, elementId);
  const idsToDuplicate = [elementId, ...descendantIds];
  const idMap = new Map<string, string>();

  idsToDuplicate.forEach((id, index) => {
    const element = findCompositionElement(schema, id);
    if (!element) return;
    const nextId = createCompositionElementId(element.type, usedIds, Date.now() + index);
    usedIds.add(nextId);
    idMap.set(id, nextId);
  });

  const duplicatedElements = idsToDuplicate
    .map((id) => findCompositionElement(schema, id))
    .filter(Boolean)
    .map((element) => {
      const nextId = idMap.get(element!.id)!;
      const originalParentId = element!.parentId || null;
      const nextParentId = originalParentId === target.parentId
        ? originalParentId
        : idMap.get(originalParentId || '') || originalParentId;

      return {
        ...element!,
        id: nextId,
        name: element!.name ? `${element!.name} copia` : undefined,
        parentId: nextParentId,
        order: element!.id === target.id ? target.order + 0.5 : element!.order
      };
    });

  return {
    schema: normalizeCompositionOrders(validateCompositionSchema({
      ...schema,
      elements: [...schema.elements, ...duplicatedElements]
    })),
    selectedElementId: idMap.get(elementId) || elementId
  };
};

export const deleteCompositionElement = (
  schema: CompositionSectionSchema,
  elementId: string
) => {
  const idsToDelete = new Set([elementId, ...collectCompositionDescendantIds(schema, elementId)]);
  const target = findCompositionElement(schema, elementId);
  const remainingElements = schema.elements.filter((element) => !idsToDelete.has(element.id));
  const siblings = remainingElements
    .filter((element) => (element.parentId || null) === (target?.parentId || null))
    .sort((left, right) => left.order - right.order);
  const selectedElementId = siblings[0]?.id || remainingElements[0]?.id || null;

  return {
    schema: normalizeCompositionOrders(validateCompositionSchema({
      ...schema,
      elements: remainingElements
    })),
    selectedElementId
  };
};

export const normalizeCompositionOrders = (schema: CompositionSectionSchema) => {
  const elements = [...schema.elements];
  const parentIds = new Set(elements.map((element) => element.parentId || null));
  const normalized = elements.map((element) => ({ ...element }));

  parentIds.forEach((parentId) => {
    normalized
      .filter((element) => (element.parentId || null) === parentId)
      .sort((left, right) => left.order - right.order)
      .forEach((element, index) => {
        element.order = index + 1;
      });
  });

  return validateCompositionSchema({ ...schema, elements: normalized });
};

export const moveCompositionElement = (
  schema: CompositionSectionSchema,
  elementId: string,
  direction: 'up' | 'down'
) => {
  const target = findCompositionElement(schema, elementId);
  if (!target) return schema;

  const siblings = schema.elements
    .filter((element) => (element.parentId || null) === (target.parentId || null))
    .sort((left, right) => left.order - right.order);
  const currentIndex = siblings.findIndex((element) => element.id === elementId);
  const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
  const siblingToSwap = siblings[nextIndex];

  if (!siblingToSwap) return schema;

  return normalizeCompositionOrders(validateCompositionSchema({
    ...schema,
    elements: schema.elements.map((element) => {
      if (element.id === target.id) return { ...element, order: siblingToSwap.order };
      if (element.id === siblingToSwap.id) return { ...element, order: target.order };
      return element;
    })
  }));
};
