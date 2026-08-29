import { estimateBentoCompositeHeight } from './bentoComposite';

export type BentoBreakpoint = 'desktop' | 'tablet' | 'mobile';

export const BENTO_ROW_HEIGHT = 80;
export const BENTO_COMPACT_ROW_HEIGHT = 20;

export type BentoLayoutVersion = 1 | 2;

export type BentoEditorTab = 'estructura' | 'contenido' | 'diseno';

const BENTO_STRUCTURE_SETTING_IDS = new Set([
  'height_mode', 'vertical_align', 'desktop_span', 'desktop_rows', 'tablet_span', 'mobile_span',
  'element_padding_y', 'card_padding_linked', 'card_padding_top', 'card_padding_right',
  'card_padding_bottom', 'card_padding_left', 'icon_content_gap', 'text_content_gap', 'padding',
  'align_items', 'content_align', 'composite_layout', 'composite_gap', 'composite_align'
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
  const charsPerLine = breakpoint === 'mobile' ? 20 : Math.max(18, Math.round(span * 4.5));
  const padding = Math.max(0, toNumber(item.padding, 32));
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
  return {
    ...item,
    layouts: { ...(item.layouts || {}), [breakpoint]: nextLayout },
    layout_sources: { ...(item.layout_sources || {}), [breakpoint]: 'explicit' },
    layout_columns: { ...(item.layout_columns || {}), [breakpoint]: layout.columns },
    ...(breakpoint === 'desktop'
      ? { x: layout.x, y: layout.y, col_span: layout.w, row_span: layout.h, desktop_span: layout.w, desktop_rows: layout.h }
      : breakpoint === 'tablet' ? { tablet_span: layout.w } : { mobile_span: layout.w })
  };
});
