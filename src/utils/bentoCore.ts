import { estimateBentoCompositeHeight } from './bentoComposite';

export type BentoBreakpoint = 'desktop' | 'tablet' | 'mobile';

export const resolveBentoLayoutBreakpoint = (value: unknown): BentoBreakpoint => {
  if (value === 'mobile' || value === 'xs' || value === 'xxs') return 'mobile';
  if (value === 'tablet' || value === 'md' || value === 'sm') return 'tablet';
  return 'desktop';
};

export const BENTO_ROW_HEIGHT = 80;
export const BENTO_COMPACT_ROW_HEIGHT = 20;

export type BentoLayoutVersion = 1 | 2;

export type BentoEditorTab = 'estructura' | 'contenido' | 'diseno';

export type BentoPadding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
  horizontal: number;
  vertical: number;
};

const hasValue = (value: unknown) => value !== undefined && value !== null;
const nonNegative = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : fallback;
};

/** Resolve new axis padding while preserving the legacy Bento contracts. */
export const resolveBentoPadding = (item: Record<string, any> = {}): BentoPadding => {
  if (item.type === 'icon') {
    const uniform = nonNegative(item.card_padding, 24);
    const hasSides = hasValue(item.card_padding)
      || ['top', 'right', 'bottom', 'left'].some((side) => hasValue(item[`card_padding_${side}`]));
    const fallback = hasSides ? uniform : 0;
    const top = nonNegative(item.card_padding_top, fallback);
    const right = nonNegative(item.card_padding_right, fallback);
    const bottom = nonNegative(item.card_padding_bottom, fallback);
    const left = nonNegative(item.card_padding_left, fallback);
    return { top, right, bottom, left, horizontal: (left + right) / 2, vertical: (top + bottom) / 2 };
  }

  const legacy = nonNegative(item.padding, 32);
  const horizontal = nonNegative(item.horizontal_padding, legacy);
  const vertical = nonNegative(item.vertical_padding, legacy);
  return { top: vertical, right: horizontal, bottom: vertical, left: horizontal, horizontal, vertical };
};

const BENTO_STRUCTURE_SETTING_IDS = new Set([
  'height_mode', 'vertical_align', 'width_preset', 'desktop_span', 'desktop_rows', 'tablet_rows', 'mobile_rows', 'tablet_span', 'mobile_span',
  'element_padding_y', 'card_padding_linked', 'card_padding_top', 'card_padding_right',
  'card_padding_bottom', 'card_padding_left', 'icon_content_gap', 'text_content_gap', 'padding',
  'horizontal_padding', 'vertical_padding', 'align_items', 'content_align', 'composite_layout', 'composite_gap', 'composite_align'
]);
const BENTO_CONTENT_SETTING_IDS = new Set([
  'image', 'icon', 'icon_image', 'card_image', 'title', 'description', 'eyebrow', 'headline',
  'subheadline', 'metric_value', 'metric_prefix', 'metric_suffix', 'metric_label', 'list_items',
  'button_text', 'text_style', 'icon_visual_type', 'alt', 'alt_text', 'btn_url',
  'primary_btn_url', 'secondary_btn_url', 'clickActionType', 'clickUrl', 'clickTarget',
  'clickSectionId', 'clickImageUrl', 'clickImageAlt', 'clickModalId', 'clickWhatsappNumber',
  'clickPhoneNumber', 'clickEmailAddress', 'clickEmailSubject', 'clickEmailBody'
]);
const BENTO_DESIGN_SETTING_IDS = new Set([
  'card_style', 'card_bg', 'card_gradient', 'card_overlay', 'card_radius', 'card_shadow',
  'text_contrast', 'show_border', 'border_style', 'border_width', 'card_border', 'image_fit',
  'image_position', 'image_scale', 'icon_color', 'icon_size', 'icon_image_size', 'show_icon_bg',
  'icon_bg', 'hover_effect'
]);

/** Canonical editor placement. Legacy pillar names are accepted only as fallback. */
export const resolveBentoEditorTab = (settingId: string, legacyGroup?: string): BentoEditorTab => {
  if (BENTO_STRUCTURE_SETTING_IDS.has(settingId)) return 'estructura';
  if (BENTO_CONTENT_SETTING_IDS.has(settingId)) return 'contenido';
  if (BENTO_DESIGN_SETTING_IDS.has(settingId)) return 'diseno';
  if (legacyGroup === 'contenido' || legacyGroup === 'content') return 'contenido';
  if (legacyGroup === 'estructura') return 'estructura';
  return 'diseno';
};

export const resolveBentoLayoutVersion = (value: unknown, hasExplicitValue = true): BentoLayoutVersion => {
  if (!hasExplicitValue) return 1;
  return Number(value) === 2 ? 2 : 1;
};

export const resolveBentoRowHeight = (value: unknown, hasExplicitValue = true) => (
  resolveBentoLayoutVersion(value, hasExplicitValue) === 2 ? BENTO_COMPACT_ROW_HEIGHT : BENTO_ROW_HEIGHT
);

export type BentoSizeMode = 'auto' | 'manual';
export type BentoWidthPreset = 'narrow' | 'medium' | 'wide' | 'full' | 'custom';

const BENTO_WIDTH_PRESET_BASE_COLUMNS: Record<Exclude<BentoWidthPreset, 'custom'>, { desktop: number; tablet: number; mobile: number }> = {
  narrow: { desktop: 3, tablet: 3, mobile: 4 },
  medium: { desktop: 5, tablet: 4, mobile: 4 },
  wide: { desktop: 8, tablet: 6, mobile: 4 },
  full: { desktop: 12, tablet: 6, mobile: 4 }
};

const BENTO_DEFAULT_PRESET_BY_TYPE: Record<string, Exclude<BentoWidthPreset, 'custom'>> = {
  button: 'narrow', badge: 'narrow', metric: 'narrow',
  icon: 'medium', text: 'medium', card: 'medium', list: 'medium', accordion: 'medium',
  visual: 'wide', composite: 'wide', hero: 'full'
};

export const resolveBentoDefaultWidthPreset = (type?: unknown): Exclude<BentoWidthPreset, 'custom'> => (
  BENTO_DEFAULT_PRESET_BY_TYPE[String(type || 'text')] || 'medium'
);

export const resolveBentoWidthPreset = (
  item: Record<string, any> = {},
  breakpoint: BentoBreakpoint,
  columns: number
): BentoWidthPreset => {
  const explicit = item.width_preset;
  if (explicit === 'narrow' || explicit === 'medium' || explicit === 'wide' || explicit === 'full' || explicit === 'custom') {
    return explicit;
  }

  // Recent auto-width records are normalized read-time from their derived snapshot.
  if (item.width_mode === 'auto') {
    const derivedWidth = Number(item.layouts?.[breakpoint]?.w);
    if (Number.isFinite(derivedWidth) && derivedWidth > 0) {
      const matched = (Object.keys(BENTO_WIDTH_PRESET_BASE_COLUMNS) as Array<Exclude<BentoWidthPreset, 'custom'>>)
        .find((preset) => resolveBentoPresetColumns(preset, breakpoint, columns) === Math.round(derivedWidth));
      return matched || 'custom';
    }
    return 'medium';
  }

  // Missing/manual width_mode is legacy custom and must preserve existing spans.
  return 'custom';
};

export const resolveBentoPresetColumns = (
  preset: Exclude<BentoWidthPreset, 'custom'>,
  breakpoint: BentoBreakpoint,
  actualColumns: number
) => {
  const safeColumns = Math.max(1, Math.floor(toNumber(actualColumns, breakpoint === 'desktop' ? 24 : breakpoint === 'tablet' ? 6 : 4)));
  const base = BENTO_WIDTH_PRESET_BASE_COLUMNS[preset][breakpoint];
  const scale = breakpoint === 'desktop' ? safeColumns / 12 : 1;
  return Math.max(1, Math.min(safeColumns, Math.round(base * scale)));
};

/** Explicit modes win; legacy items remain manual-width compatible. */
export const resolveBentoWidthMode = (item?: Record<string, unknown>): BentoSizeMode => (
  item?.width_mode === 'auto' ? 'auto' : 'manual'
);

export const resolveBentoHeightMode = (item?: Record<string, unknown>): BentoSizeMode => (
  item?.height_mode === 'manual' ? 'manual' : 'auto'
);

const BENTO_MANUAL_ROW_FIELDS: Record<BentoBreakpoint, string> = {
  desktop: 'desktop_rows',
  tablet: 'tablet_rows',
  mobile: 'mobile_rows'
};

const getLegacyBentoRows = (item: Record<string, any>, breakpoint: BentoBreakpoint, fallback = 2) => {
  const field = BENTO_MANUAL_ROW_FIELDS[breakpoint];
  const layoutRows = item.layouts?.[breakpoint]?.h;
  const desktopRows = item.desktop_rows ?? item.layouts?.desktop?.h;
  const legacyRows = breakpoint === 'desktop'
    ? item.row_span
    : breakpoint === 'mobile'
      ? item.row_span ?? desktopRows
      : item.row_span ?? desktopRows;
  return Math.max(1, toNumber(item[field] ?? layoutRows ?? legacyRows, fallback));
};

/** Materializes legacy height fields in memory without persisting derived geometry. */
export const normalizeBentoHeightState = <T extends Record<string, any>>(item: T, fallback = 2): T => ({
  ...item,
  desktop_rows: getLegacyBentoRows(item, 'desktop', fallback),
  tablet_rows: getLegacyBentoRows(item, 'tablet', fallback),
  mobile_rows: getLegacyBentoRows(item, 'mobile', fallback)
});

export const resolveBentoManualRows = (
  item: Record<string, any> = {},
  breakpoint: BentoBreakpoint,
  fallback = 2
) => getLegacyBentoRows(item, breakpoint, fallback);

export const resolveBentoEffectiveWidth = (
  item: Record<string, any> = {},
  breakpoint: BentoBreakpoint,
  columns: number
) => {
  const safeColumns = Math.max(1, toNumber(columns, 1));
  const preset = resolveBentoWidthPreset(item, breakpoint, safeColumns);
  if (preset !== 'custom') return resolveBentoPresetColumns(preset, breakpoint, safeColumns);
  if (item.width_preset === undefined && item.width_mode === 'auto') {
    const derivedWidth = Number(item.layouts?.[breakpoint]?.w);
    if (Number.isFinite(derivedWidth) && derivedWidth > 0) {
      return Math.max(1, Math.min(safeColumns, Math.round(derivedWidth)));
    }
  }
  const value = breakpoint === 'desktop' ? item.desktop_span || item.col_span
    : breakpoint === 'tablet' ? item.tablet_span || item.col_span : item.mobile_span || item.col_span;
  return Math.max(1, Math.min(safeColumns, toNumber(value, safeColumns)));
};

export const resolveBentoEffectiveRows = (
  item: Record<string, any> = {},
  breakpoint: BentoBreakpoint,
  savedRows: unknown,
  rowHeight = BENTO_ROW_HEIGHT,
  rowGap = 20,
  colSpan?: number,
  intrinsicHeightPx?: number,
  verticalPaddingPx = 0
) => resolveBentoHeightMode(item) === 'manual'
  ? Math.max(1, toNumber(savedRows, 1))
  : Number.isFinite(intrinsicHeightPx)
    ? intrinsicHeightToGridRows(intrinsicHeightPx as number, rowHeight, rowGap, verticalPaddingPx)
    : resolveBentoAutoRows(item, breakpoint, rowHeight, rowGap, colSpan);

export const intrinsicHeightToGridRows = (
  intrinsicHeightPx: number,
  rowHeight: number,
  rowGap = 0,
  verticalPaddingPx = 0
) => {
  const safeHeight = Number.isFinite(intrinsicHeightPx) ? Math.max(0, intrinsicHeightPx) : 0;
  const safeRowHeight = Math.max(1, toNumber(rowHeight, BENTO_ROW_HEIGHT));
  const safeGap = Number.isFinite(rowGap) ? Math.max(0, rowGap) : 0;
  const safePadding = Number.isFinite(verticalPaddingPx) ? Math.max(0, verticalPaddingPx) : 0;
  const requiredHeight = Math.max(0, safeHeight + safePadding);
  const rows = Math.max(1, Math.ceil((requiredHeight + safeGap) / (safeRowHeight + safeGap)));
  const renderedHeight = rows * safeRowHeight + Math.max(0, rows - 1) * safeGap;
  // Protect against floating-point/subpixel under-allocation without adding a
  // row at an exact grid boundary.
  return renderedHeight + Number.EPSILON < requiredHeight ? rows + 1 : rows;
};

export type BentoIntrinsicSizes = Record<string, { height: number }>;

export const updateBentoIntrinsicSize = (
  sizes: BentoIntrinsicSizes,
  itemId: string,
  breakpoint: BentoBreakpoint,
  height: number
): BentoIntrinsicSizes => {
  const safeHeight = Number.isFinite(height) ? Math.max(0, height) : 0;
  const key = `${itemId}:${breakpoint}`;
  const previous = sizes[key];
  if (previous && Math.abs(previous.height - safeHeight) <= 0.1) return sizes;
  return { ...sizes, [key]: { height: safeHeight } };
};

export type BentoRuntimeRect = { i: string; x: number; y: number; w: number; h: number };

export const rectanglesOverlap = (a: BentoRuntimeRect, b: BentoRuntimeRect) => (
  a.x < b.x + b.w &&
  a.x + a.w > b.x &&
  a.y < b.y + b.h &&
  a.y + a.h > b.y
);

/**
 * Reconciles only runtime geometry. Product x/y values are never written back.
 * Items retain their stable visual order and move down only when their actual
 * rectangles overlap; side-by-side items keep the same y coordinate.
 */
export const reconcileBentoRuntimeAutoLayout = <T extends BentoRuntimeRect>(layout: readonly T[]) => {
  const indexed = layout.map((entry, index) => ({ entry, index }));
  const ordered = [...indexed].sort((left, right) => (
    left.entry.y - right.entry.y || left.entry.x - right.entry.x || left.index - right.index
  ));
  const placed: BentoRuntimeRect[] = [];
  const resolved = new Map<number, T>();

  ordered.forEach(({ entry, index }) => {
    let candidate = { ...entry, y: Math.max(0, entry.y) };
    let blockers = placed.filter((previous) => rectanglesOverlap(candidate, previous));
    while (blockers.length > 0) {
      candidate = {
        ...candidate,
        y: Math.max(...blockers.map((blocker) => blocker.y + blocker.h))
      };
      blockers = placed.filter((previous) => rectanglesOverlap(candidate, previous));
    }
    placed.push(candidate);
    resolved.set(index, candidate as T);
  });

  return layout.map((_, index) => resolved.get(index) as T);
};

export const resolveBentoResizeHandles = (
  item: Record<string, any> = {},
  isPreviewMode = false,
  breakpoint: BentoBreakpoint = 'desktop',
  columns = breakpoint === 'desktop' ? 24 : breakpoint === 'tablet' ? 6 : 4
) => {
  if (isPreviewMode) return [] as string[];
  const widthManual = resolveBentoWidthPreset(item, breakpoint, columns) === 'custom';
  const heightManual = resolveBentoHeightMode(item) === 'manual';
  if (widthManual && heightManual) return ['se'];
  if (widthManual) return ['e'];
  if (heightManual) return ['s'];
  return [] as string[];
};

/** Physical height of the occupied grid plus the configured bottom padding. */
export const resolveBentoGridContentHeight = (
  layout: Array<{ y?: unknown; h?: unknown }> = [],
  rowHeight = BENTO_ROW_HEIGHT,
  rowGap = 20,
  paddingBottom = 0
) => {
  const safeRowHeight = Math.max(toNumber(rowHeight, BENTO_ROW_HEIGHT), 1);
  const safeGap = Math.max(toNumber(rowGap, 0), 0);
  const safePaddingBottom = Math.max(toNumber(paddingBottom, 0), 0);
  const bottomRow = layout.reduce((max, item) => (
    Math.max(max, Math.max(toNumber(item?.y, 0), 0) + Math.max(toNumber(item?.h, 1), 1))
  ), 0);
  const gridHeight = bottomRow > 0
    ? (bottomRow * safeRowHeight) + ((bottomRow - 1) * safeGap)
    : 0;
  return gridHeight + safePaddingBottom;
};

export const hasExplicitBentoLayout = (item: Record<string, any> = {}, breakpoint: BentoBreakpoint) => (
  Boolean(item.layouts?.[breakpoint]) && item.layout_sources?.[breakpoint] !== 'derived'
);

/** A derived layout is still a valid persisted render snapshot, just not a manual preference. */
export const hasPersistedBentoLayout = (item: Record<string, any> = {}, breakpoint: BentoBreakpoint) => (
  Boolean(item.layouts?.[breakpoint])
);

export const resolveBentoVerticalAlign = (value: unknown, legacyValue?: unknown) => {
  const candidate = value === undefined ? legacyValue : value;
  return candidate === 'center' || candidate === 'end' || candidate === 'start' ? candidate : 'start';
};

const toNumber = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const stableFingerprint = (value: unknown) => {
  const serialized = JSON.stringify(value);
  let hash = 2166136261;
  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
};

/** IDs are preferred; the fingerprint is only a read-only compatibility key for very old items. */
export const getBentoItemId = (item: Record<string, any>) => {
  if (item?.id !== undefined && item?.id !== null && String(item.id)) return String(item.id);
  if (item?.layout_id !== undefined && item?.layout_id !== null && String(item.layout_id)) return String(item.layout_id);
  const { layouts: _layouts, ...identityFields } = item || {};
  return `bento_legacy_${stableFingerprint(identityFields)}`;
};

const estimateTextLines = (value: unknown, charsPerLine: number) => {
  const text = String(value || '').trim();
  return text ? Math.max(1, Math.ceil(text.length / Math.max(charsPerLine, 1))) : 0;
};

const listLength = (value: unknown) => {
  if (Array.isArray(value)) return value.filter(Boolean).length;
  return String(value || '').split('\n').filter((entry) => entry.trim()).length;
};

/** New items persist this value. Undefined intentionally keeps legacy renderer behavior. */
export const resolveBentoHoverEffectDefault = (item?: Record<string, unknown>) => (
  item && item.hover_effect !== undefined ? item.hover_effect : 'lift'
);

export const hasExplicitShowBorder = (item?: Record<string, unknown>) => (
  Boolean(item) && Object.prototype.hasOwnProperty.call(item, 'show_border')
);

export const resolveBentoSettingId = (item: Record<string, any> | null | undefined, settingId: string) => {
  if (!item || item[settingId] !== undefined) return settingId;
  const aliases: Record<string, string[]> = {
    description_size: ['desc_size'],
    description_weight: ['desc_weight'],
    description_color: ['desc_color']
  };
  return (aliases[settingId] || []).find((alias) => item[alias] !== undefined) || settingId;
};

export const resolveBentoBorderStyle = (value: unknown) => (
  value === 'dashed' || value === 'dotted' || value === 'double' || value === 'soft' ? value : 'solid'
);

export const resolveBentoBorderWidth = (value: unknown, style: unknown = 'solid') => {
  const width = Math.min(6, Math.max(1, Math.round(toNumber(value, 1))));
  return style === 'double' ? Math.max(3, width) : width;
};

export const resolveBentoBorderColor = (value: unknown, style: unknown = 'solid') => {
  const color = String(value || 'rgba(0,0,0,0.05)').trim();
  if (style !== 'soft') return color;
  const rgba = color.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)$/i);
  if (rgba) {
    const alpha = Math.min(1, Math.max(0, Number(rgba[4] ?? 1) * 0.4));
    return `rgba(${rgba[1]}, ${rgba[2]}, ${rgba[3]}, ${alpha})`;
  }
  const hex = color.replace('#', '');
  if (/^[\da-f]{3}$/i.test(hex) || /^[\da-f]{6}$/i.test(hex)) {
    const normalized = hex.length === 3 ? hex.split('').map((part) => part + part).join('') : hex;
    return `rgba(${parseInt(normalized.slice(0, 2), 16)}, ${parseInt(normalized.slice(2, 4), 16)}, ${parseInt(normalized.slice(4, 6), 16)}, 0.4)`;
  }
  return `color-mix(in srgb, ${color} 40%, transparent)`;
};

/** Legacy cards keep their historical border unless the new flag is explicitly persisted. */
export const resolveBentoBorderVisibility = (item?: Record<string, unknown>) => {
  if (hasExplicitShowBorder(item)) return item?.show_border === true || item?.show_border === 'true';
  return item?.card_style !== 'transparent' && item?.type !== 'hero' && item?.priority !== 'hero';
};

export const resolveBentoAutoRows = (
  item: Record<string, any> = {},
  breakpoint: BentoBreakpoint,
  rowHeight = BENTO_ROW_HEIGHT,
  rowGap = 20,
  colSpan?: number
) => {
  const safeRowHeight = Math.max(toNumber(rowHeight, BENTO_ROW_HEIGHT), 1);
  const safeGap = Math.max(toNumber(rowGap, 0), 0);
  const span = Math.max(1, toNumber(colSpan ?? (
    breakpoint === 'desktop' ? item.desktop_span || item.col_span :
      breakpoint === 'tablet' ? item.tablet_span || item.col_span : item.mobile_span || item.col_span
  ), breakpoint === 'mobile' ? 4 : breakpoint === 'tablet' ? 3 : 8));
  const { horizontal, vertical } = resolveBentoPadding(item);
  const charsPerLine = breakpoint === 'mobile'
    ? Math.max(10, 20 - Math.ceil(horizontal / 16))
    : Math.max(18, Math.round(span * 4.5) - Math.ceil(horizontal / 16));
  const padding = vertical;
  const titleLines = estimateTextLines(item.title ?? item.metric_value, charsPerLine);
  const descriptionLines = estimateTextLines(item.description ?? item.metric_label, charsPerLine);
  const textHeight = titleLines * 28 + descriptionLines * 22 + (titleLines && descriptionLines ? 8 : 0);

  let minHeight = 0;
  switch (item.type || 'text') {
    case 'composite':
      minHeight = estimateBentoCompositeHeight(item, breakpoint);
      break;
    case 'visual':
      minHeight = breakpoint === 'mobile' ? 220 : 260;
      break;
    case 'icon': {
      const visualHeight = item.icon_visual_type === 'image'
        ? toNumber(item.icon_image_size, 72)
        : Math.max(toNumber(item.icon_size, 32) + 16, 40);
      minHeight = visualHeight + (textHeight || 0) + padding * 2 + 32;
      break;
    }
    case 'list':
      minHeight = 40 + listLength(item.list_items) * 30 + titleLines * 24 + padding * 2;
      break;
    case 'accordion':
      minHeight = 72 + descriptionLines * 22 + padding * 2;
      break;
    case 'button':
    case 'badge':
    case 'marquee':
      minHeight = 40 + padding * 2;
      break;
    default:
      minHeight = 40 + textHeight + padding * 2;
  }

  return Math.max(1, Math.ceil((Math.max(minHeight, safeRowHeight) + safeGap) / (safeRowHeight + safeGap)));
};

export const reorderBentoItems = <T extends { id?: string }>(items: T[], fromIndex: number, toIndex: number) => {
  if (!Array.isArray(items) || fromIndex < 0 || toIndex < 0 || fromIndex >= items.length || toIndex >= items.length) {
    return items;
  }
  if (fromIndex === toIndex) return items;
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
};

export const resolveBentoSelectedIndex = (items: Array<Record<string, any>>, selectedId?: string | null) => (
  selectedId ? items.findIndex((item) => getBentoItemId(item) === String(selectedId)) : -1
);

export const reconcileBentoLayoutById = <T extends Record<string, any>>(
  items: T[],
  layout: { i: string; x: number; y: number; w: number; h: number; columns?: number },
  breakpoint: BentoBreakpoint
) => items.map((item) => {
  if (getBentoItemId(item) !== String(layout.i)) return item;
  const { i: _itemId, ...nextLayout } = layout;
  const widthManual = resolveBentoWidthPreset(item, breakpoint, layout.columns || 24) === 'custom';
  const heightManual = resolveBentoHeightMode(item) === 'manual';
  const nextSources = { ...(item.layout_sources || {}), [breakpoint]: widthManual || heightManual ? 'explicit' : 'derived' };
  const existingLayout = item.layouts?.[breakpoint] || {};
  const persistedLayout = heightManual
    ? nextLayout
    : { ...existingLayout, x: layout.x, y: layout.y, w: layout.w, columns: layout.columns };
  const sizeFields = breakpoint === 'desktop'
    ? (widthManual && heightManual
      ? { x: layout.x, y: layout.y, col_span: layout.w, row_span: layout.h, desktop_span: layout.w, desktop_rows: layout.h }
      : widthManual
        ? { x: layout.x, y: layout.y, col_span: layout.w, desktop_span: layout.w }
        : heightManual
          ? { x: layout.x, y: layout.y, row_span: layout.h, desktop_rows: layout.h }
          : { x: layout.x, y: layout.y })
    : {};
  return {
    ...item,
    layouts: { ...(item.layouts || {}), [breakpoint]: persistedLayout },
    layout_sources: nextSources,
    layout_columns: { ...(item.layout_columns || {}), [breakpoint]: layout.columns },
    ...(breakpoint === 'desktop'
      ? sizeFields
      : breakpoint === 'tablet'
      ? {
        ...(widthManual ? { tablet_span: layout.w } : {}),
        ...(heightManual ? { tablet_rows: layout.h } : {})
      }
        : {
          ...(widthManual ? { mobile_span: layout.w } : {}),
          ...(heightManual ? { mobile_rows: layout.h } : {})
        })
  };
});
