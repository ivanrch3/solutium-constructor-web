import React, { CSSProperties, useMemo } from 'react';
import {
  COMPOSITION_SCHEMA_DEEP_KEY,
  CompositionElement,
  CompositionElementLayout,
  CompositionElementStyle,
  CompositionSectionSchema,
  createDefaultCompositionSchema
} from '../../../types/compositionSchema';
import { validateCompositionSchema } from '../../../utils/compositionSchemaValidator';

interface CompositionSectionModuleProps {
  moduleId: string;
  settingsValues: Record<string, any>;
  content?: any;
  isPreviewMode?: boolean;
  selectedElementId?: string | null;
  onElementSelect?: (elementId: string) => void;
}

const MAX_WIDTHS: Record<string, string> = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1200px',
  '2xl': '1320px',
  full: '100%'
};

const SHADOWS: Record<string, string> = {
  none: 'none',
  sm: '0 8px 18px rgba(15, 23, 42, 0.08)',
  md: '0 16px 36px rgba(15, 23, 42, 0.12)',
  lg: '0 24px 60px rgba(15, 23, 42, 0.16)',
  xl: '0 36px 90px rgba(15, 23, 42, 0.22)'
};

const toKebab = (value: string) => value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

const UNITLESS_CSS_PROPERTIES = new Set([
  'fontWeight',
  'lineHeight',
  'opacity',
  'order',
  'zIndex'
]);

const cssValue = (key: string, value: string | number) => {
  if (typeof value === 'number' && !UNITLESS_CSS_PROPERTIES.has(key)) {
    return `${value}px`;
  }

  return String(value);
};

const styleToCss = (selector: string, style: CSSProperties) => {
  const declarations = Object.entries(style)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `  ${toKebab(key)}: ${cssValue(key, value as string | number)};`)
    .join('\n');

  return declarations ? `${selector} {\n${declarations}\n}` : '';
};

const getLayoutStyle = (layout?: CompositionElementLayout): CSSProperties => ({
  display: layout?.display,
  gridColumn: layout?.gridColumn,
  gridRow: layout?.gridRow,
  order: layout?.order,
  width: layout?.width,
  minHeight: layout?.minHeight,
  alignSelf: layout?.alignSelf,
  justifySelf: layout?.justifySelf,
  gap: layout?.gap,
  padding: layout?.padding
});

const getElementStyle = (style?: CompositionElementStyle): CSSProperties => {
  const background = style?.gradient || style?.background;

  return {
    color: style?.color,
    background,
    borderColor: style?.borderColor,
    borderWidth: style?.borderWidth,
    borderStyle: style?.borderWidth ? 'solid' : undefined,
    borderRadius: style?.radius,
    boxShadow: style?.shadow ? SHADOWS[style.shadow] : undefined,
    opacity: style?.opacity,
    fontSize: style?.fontSize,
    fontWeight: style?.fontWeight,
    lineHeight: style?.lineHeight,
    textTransform: style?.textTransform,
    objectFit: style?.objectFit,
    aspectRatio: style?.aspectRatio
  };
};

const getChildren = (schema: CompositionSectionSchema, parentId: string | null) =>
  schema.elements
    .filter((element) => (element.parentId || null) === parentId)
    .sort((left, right) => left.order - right.order);

const isElementGloballyHidden = (element: CompositionElement) =>
  element.visibility?.desktop === false &&
  element.visibility?.tablet === false &&
  element.visibility?.mobile === false;

const resolveHref = (element: CompositionElement) => {
  const linkAction = element.actions?.find((action) => action.type === 'link' || action.type === 'scroll_to');
  return element.content?.href || linkAction?.target || '#';
};

const renderElement = (
  schema: CompositionSectionSchema,
  element: CompositionElement,
  editorOptions?: {
    enabled: boolean;
    selectedElementId?: string | null;
    onElementSelect?: (elementId: string) => void;
  }
): React.ReactNode => {
  const isHidden = isElementGloballyHidden(element);
  if (isHidden && !editorOptions?.enabled) return null;

  const children = getChildren(schema, element.id);
  const isSelected = editorOptions?.enabled && editorOptions.selectedElementId === element.id;
  const className = [
    'composition-element',
    `composition-element-${element.type}`,
    `composition-element-${element.id}`,
    editorOptions?.enabled ? 'composition-element-editable' : '',
    isHidden ? 'composition-element-hidden-editor' : '',
    isSelected ? 'composition-element-selected' : ''
  ].filter(Boolean).join(' ');
  const childNodes = children.map((child) => renderElement(schema, child, editorOptions));
  const editorProps = editorOptions?.enabled
    ? {
        'data-composition-element-id': element.id,
        'data-composition-element-type': element.type,
        onClick: (event: React.MouseEvent) => {
          event.preventDefault();
          event.stopPropagation();
          editorOptions.onElementSelect?.(element.id);
        }
      }
    : {
        'data-composition-element-id': element.id,
        'data-composition-element-type': element.type
      };
  const emptyPlaceholder = editorOptions?.enabled
    ? <span className="composition-empty-placeholder">Texto vacío</span>
    : null;

  switch (element.type) {
    case 'heading': {
      const level = element.content?.level ?? 2;
      return React.createElement(`h${level}`, { key: element.id, className, ...editorProps }, element.content?.text || emptyPlaceholder);
    }
    case 'paragraph':
      return <p key={element.id} className={className} {...editorProps}>{element.content?.text || emptyPlaceholder}</p>;
    case 'badge':
      return <span key={element.id} className={className} {...editorProps}>{element.content?.text || emptyPlaceholder}</span>;
    case 'button':
      return (
        <a key={element.id} className={className} href={resolveHref(element)} {...editorProps}>
          {element.content?.label || emptyPlaceholder}
        </a>
      );
    case 'image':
      if (!element.content?.src) {
        return <div key={element.id} className={`${className} composition-image-fallback`} aria-hidden="true" {...editorProps} />;
      }

      return (
        <img
          key={element.id}
          className={className}
          src={element.content.src}
          alt={element.content.alt ?? ''}
          loading="lazy"
          referrerPolicy="no-referrer"
          {...editorProps}
        />
      );
    case 'list':
      return (
        <ul key={element.id} className={className} {...editorProps}>
          {(element.content?.items || []).map((item) => (
            <li key={item.id}>{item.text || emptyPlaceholder}</li>
          ))}
        </ul>
      );
    case 'divider':
      return <hr key={element.id} className={className} {...editorProps} />;
    case 'card':
    case 'container':
      return <div key={element.id} className={className} {...editorProps}>{childNodes}</div>;
    default:
      return null;
  }
};

const buildScopedStyles = (moduleId: string, schema: CompositionSectionSchema) => {
  const rootClass = `.composition-root-${moduleId}`;
  const gridClass = `.composition-grid-${moduleId}`;
  const desktopColumns = schema.layout.columns || 12;
  const tabletColumns = schema.responsive?.tablet?.columns || Math.min(desktopColumns, 8);
  const mobileColumns = schema.responsive?.mobile?.columns || 1;
  const desktopGap = schema.layout.gap || 24;
  const tabletGap = schema.responsive?.tablet?.gap ?? desktopGap;
  const mobileGap = schema.responsive?.mobile?.gap ?? 18;

  const baseStyles = [
    styleToCss(rootClass, {
      containerType: 'inline-size',
      position: 'relative',
      overflow: schema.section.overflow || 'hidden',
      color: 'var(--color-foreground)'
    } as CSSProperties),
    styleToCss(`${rootClass} ${gridClass}`, {
      display: schema.layout.mode === 'flex' ? 'flex' : 'grid',
      gridTemplateColumns: schema.layout.mode === 'grid' ? `repeat(${desktopColumns}, minmax(0, 1fr))` : undefined,
      gap: `${desktopGap}px`,
      alignItems: schema.layout.verticalAlign,
      justifyItems: schema.layout.horizontalAlign,
      width: '100%'
    } as CSSProperties),
    `${rootClass} .composition-element { min-width: 0; }`,
    `${rootClass} .composition-element-heading, ${rootClass} .composition-element-paragraph, ${rootClass} .composition-element-badge, ${rootClass} .composition-element-button, ${rootClass} .composition-element-list li { white-space: pre-wrap; }`,
    `${rootClass} .composition-element-card, ${rootClass} .composition-element-container { display: flex; flex-direction: column; justify-content: center; gap: 16px; }`,
    `${rootClass} .composition-element-badge { display: inline-flex; width: fit-content; padding: 8px 14px; letter-spacing: 0.08em; font-size: 12px; }`,
    `${rootClass} .composition-element-button { display: inline-flex; width: fit-content; align-items: center; justify-content: center; padding: 14px 20px; text-decoration: none; transition: transform 180ms ease, opacity 180ms ease; }`,
    `${rootClass} .composition-element-button:hover { transform: translateY(-1px); opacity: 0.92; }`,
    `${rootClass} .composition-element-image { width: 100%; height: 100%; display: block; }`,
    `${rootClass} .composition-image-fallback { background: linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 24%, transparent), color-mix(in srgb, var(--color-primary) 8%, transparent)); }`,
    `${rootClass} .composition-element-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }`,
    `${rootClass} .composition-element-list li::before { content: "•"; margin-right: 10px; color: currentColor; opacity: 0.7; }`,
    `${rootClass} .composition-element-divider { width: 100%; border: 0; border-top: 1px solid color-mix(in srgb, currentColor 18%, transparent); }`,
    `${rootClass} .composition-element-editable { cursor: pointer; outline: 1px dashed transparent; outline-offset: 4px; transition: outline-color 160ms ease, box-shadow 160ms ease, opacity 160ms ease; }`,
    `${rootClass} .composition-element-hidden-editor { opacity: 0.36; filter: grayscale(0.45); }`,
    `${rootClass} .composition-element-editable:hover { outline-color: color-mix(in srgb, var(--color-primary) 42%, transparent); }`,
    `${rootClass} .composition-element-selected { outline: 2px solid var(--color-primary); outline-offset: 5px; box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-primary) 12%, transparent); }`,
    `${rootClass} .composition-empty-placeholder { color: color-mix(in srgb, currentColor 42%, transparent); font-style: italic; }`
  ];

  const elementStyles = schema.elements.flatMap((element) => {
    const selector = `${rootClass} .composition-element-${element.id}`;
    return styleToCss(selector, {
        ...getLayoutStyle(element.layout?.desktop),
        ...getElementStyle(element.style)
      });
  });

  const responsiveBlocks = [
    `@container (max-width: 900px) {
  ${rootClass} ${gridClass} {
    grid-template-columns: repeat(${tabletColumns}, minmax(0, 1fr));
    gap: ${tabletGap}px;
  }
${schema.elements.map((element) => styleToCss(`  ${rootClass} .composition-element-${element.id}`, getLayoutStyle(element.layout?.tablet))).filter(Boolean).join('\n')}
}`,
    `@container (max-width: 640px) {
  ${rootClass} {
    text-align: ${schema.section.align === 'center' ? 'center' : 'left'};
  }
  ${rootClass} ${gridClass} {
    grid-template-columns: repeat(${mobileColumns}, minmax(0, 1fr));
    gap: ${mobileGap}px;
  }
${schema.elements.map((element) => styleToCss(`  ${rootClass} .composition-element-${element.id}`, getLayoutStyle(element.layout?.mobile || { gridColumn: '1' }))).filter(Boolean).join('\n')}
  ${rootClass} .composition-element-heading {
    font-size: clamp(30px, 11vw, 48px);
  }
}`
  ];

  return [...baseStyles, ...elementStyles.filter(Boolean), ...responsiveBlocks].join('\n');
};

export const CompositionSectionModule: React.FC<CompositionSectionModuleProps> = ({
  moduleId,
  settingsValues,
  content,
  isPreviewMode = false,
  selectedElementId,
  onElementSelect
}) => {
  const schema = useMemo(() => {
    const deepSchema = settingsValues[`${moduleId}_${COMPOSITION_SCHEMA_DEEP_KEY}`];
    const contentSchema = content?.composition || content;
    return validateCompositionSchema(deepSchema ?? contentSchema ?? createDefaultCompositionSchema());
  }, [content, moduleId, settingsValues]);

  const rootClassName = `composition-root-${moduleId}`;
  const gridClassName = `composition-grid-${moduleId}`;
  const rootElements = getChildren(schema, null);
  const editorOptions = {
    enabled: !isPreviewMode && Boolean(onElementSelect),
    selectedElementId,
    onElementSelect
  };
  const background = schema.background?.type === 'gradient'
    ? schema.background.gradient
    : schema.background?.type === 'transparent'
      ? 'transparent'
      : schema.background?.color;

  return (
    <section
      id={schema.section.htmlId || moduleId}
      aria-label={schema.section.ariaLabel || schema.name || 'Composición Visual'}
      className={rootClassName}
      style={{
        background,
        paddingTop: schema.section.paddingY,
        paddingBottom: schema.section.paddingY,
        paddingLeft: schema.section.paddingX,
        paddingRight: schema.section.paddingX
      }}
    >
      <style>{buildScopedStyles(moduleId, schema)}</style>
      <div
        className={gridClassName}
        style={{
          maxWidth: MAX_WIDTHS[schema.section.maxWidth || '2xl'],
          marginLeft: 'auto',
          marginRight: 'auto'
        }}
      >
        {rootElements.map((element) => renderElement(schema, element, editorOptions))}
      </div>
    </section>
  );
};
