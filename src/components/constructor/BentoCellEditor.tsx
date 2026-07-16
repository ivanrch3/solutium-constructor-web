import React from 'react';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown,
  ChevronRight,
  Image as ImageIcon,
  Layout,
  MousePointer2,
  Palette,
  Type,
  X
} from 'lucide-react';
import { logDebug } from '../../utils/debug';
import { resolveBentoIconSpacing, updateBentoIconSpacing, type BentoIconDevice } from '../../utils/bentoIconSpacing';
import { SettingControl } from './SettingControl';

const PILLAR_ICONS: Record<string, React.ReactNode> = {
  contenido: <Type size={16} />,
  estructura: <Layout size={16} />,
  estilo: <Palette size={16} />,
  tipografia: <Type size={16} />,
  multimedia: <ImageIcon size={16} />,
  interaccion: <MousePointer2 size={16} />,
  content: <Type size={16} />,
  structure: <Layout size={16} />,
  style: <Palette size={16} />,
  typography: <Type size={16} />,
  multimedia_pillar: <ImageIcon size={16} />,
  interaction: <MousePointer2 size={16} />
};

const PILLAR_LABELS: Record<string, string> = {
  contenido: 'Contenido',
  estructura: 'Estructura',
  estilo: 'Estilo',
  tipografia: 'Tipografía',
  multimedia: 'Multimedia',
  interaccion: 'Interacción'
};

const PILLARS_ORDER: string[] = ['contenido', 'estructura', 'estilo', 'tipografia', 'multimedia', 'interaccion'];
const ICON_SETTINGS_TABS = [
  { id: 'structure', label: 'Estructura', pillars: ['estructura', 'estilo', 'interaccion'] },
  { id: 'text', label: 'Texto', pillars: ['contenido', 'tipografia'] },
  { id: 'media', label: 'Multimedia', pillars: ['multimedia'] }
] as const;
type IconSettingsTab = typeof ICON_SETTINGS_TABS[number]['id'];

const ICON_DEVICE_OPTIONS = [
  { label: 'Escritorio', value: 'desktop' },
  { label: 'Tablet', value: 'tablet' },
  { label: 'Móvil', value: 'mobile' }
] as const;

const ICON_TEXT_SETTING_IDS = new Set([
  'title',
  'description',
  'title_size',
  'title_weight',
  'title_color',
  'description_size',
  'description_weight',
  'description_color',
  'text_contrast'
]);

const ICON_MEDIA_SETTING_IDS = new Set([
  'icon_visual_type',
  'icon',
  'icon_color',
  'icon_size',
  'show_icon_bg',
  'icon_bg',
  'icon_image',
  'icon_image_size',
  'card_bg',
  'card_gradient',
  'card_image',
  'card_overlay'
]);
const BENTO_DESKTOP_COLUMNS = 24;
const BENTO_MIN_DESKTOP_COLUMNS = 12;
const BENTO_MAX_DESKTOP_COLUMNS = 32;
const BENTO_TABLET_COLUMNS = 6;
const BENTO_MOBILE_COLUMNS = 4;
const BENTO_BASE_VISIBLE_ROWS = 7;
const BENTO_MAX_EDITABLE_ROWS = 240;

const TEXT_STYLE_PRESETS: Record<string, Record<string, any>> = {
  display: { title_size: 't1', title_weight: 'black', description_size: 'p', line_height: 1.05, letter_spacing: -2 },
  heading_large: { title_size: 't2', title_weight: 'black', description_size: 'p', line_height: 1.1, letter_spacing: -1 },
  heading: { title_size: 't3', title_weight: 'extrabold', description_size: 'p', line_height: 1.2, letter_spacing: 0 },
  subtitle: { title_size: 'p', title_weight: 'semibold', description_size: 'p', line_height: 1.35, letter_spacing: 0 },
  paragraph: { title_size: 'p', title_weight: 'normal', description_size: 'p', line_height: 1.55, letter_spacing: 0 },
  small: { title_size: 's', title_weight: 'normal', description_size: 's', line_height: 1.45, letter_spacing: 0 },
  caption: { title_size: 's', title_weight: 'bold', description_size: 's', line_height: 1.3, letter_spacing: 1 }
};

const BENTO_CLICK_ACTION_FIELDS = [
  {
    label: 'Acción al hacer clic',
    setting: {
      id: 'clickActionType',
      label: 'Acción al hacer clic',
      type: 'select',
      defaultValue: 'none',
      options: [
        { label: 'Sin acción', value: 'none' },
        { label: 'Abrir URL', value: 'url' },
        { label: 'Abrir imagen ampliada', value: 'image' },
        { label: 'Abrir modal informativo', value: 'modal' },
        { label: 'Ir a sección', value: 'section' },
        { label: 'WhatsApp', value: 'whatsapp' },
        { label: 'Teléfono', value: 'phone' },
        { label: 'Email', value: 'email' }
      ],
      description: 'La acción se aplica a toda la tarjeta en preview limpio y sitio publicado.'
    }
  },
  {
    label: 'URL',
    setting: {
      id: 'clickUrl',
      label: 'URL',
      type: 'url',
      defaultValue: '',
      placeholder: 'https://...',
      showIf: { settingId: 'clickActionType', value: 'url' }
    }
  },
  {
    label: 'Destino',
    setting: {
      id: 'clickOpenTarget',
      label: 'Destino',
      type: 'select',
      defaultValue: 'new_tab',
      options: [
        { label: 'Nueva pestaña', value: 'new_tab' },
        { label: 'Misma pestaña', value: 'same_tab' }
      ],
      showIf: { settingId: 'clickActionType', value: 'url' }
    }
  },
  {
    label: 'Imagen ampliada',
    setting: {
      id: 'clickImageUrl',
      label: 'Imagen ampliada',
      type: 'image',
      defaultValue: '',
      showIf: { settingId: 'clickActionType', value: 'image' }
    }
  },
  {
    label: 'Título de imagen',
    setting: {
      id: 'clickImageTitle',
      label: 'Título de imagen',
      type: 'text',
      defaultValue: '',
      showIf: { settingId: 'clickActionType', value: 'image' }
    }
  },
  {
    label: 'Descripción de imagen',
    setting: {
      id: 'clickImageDescription',
      label: 'Descripción de imagen',
      type: 'textarea',
      rows: 3,
      defaultValue: '',
      showIf: { settingId: 'clickActionType', value: 'image' }
    }
  },
  {
    label: 'Título del modal',
    setting: {
      id: 'clickModalTitle',
      label: 'Título del modal',
      type: 'text',
      defaultValue: '',
      showIf: { settingId: 'clickActionType', value: 'modal' }
    }
  },
  {
    label: 'Descripción del modal',
    setting: {
      id: 'clickModalDescription',
      label: 'Descripción del modal',
      type: 'textarea',
      rows: 4,
      defaultValue: '',
      showIf: { settingId: 'clickActionType', value: 'modal' }
    }
  },
  {
    label: 'Imagen del modal',
    setting: {
      id: 'clickModalImageUrl',
      label: 'Imagen del modal',
      type: 'image',
      defaultValue: '',
      showIf: { settingId: 'clickActionType', value: 'modal' }
    }
  },
  {
    label: 'Texto CTA',
    setting: {
      id: 'clickModalCtaText',
      label: 'Texto CTA',
      type: 'text',
      defaultValue: '',
      showIf: { settingId: 'clickActionType', value: 'modal' }
    }
  },
  {
    label: 'URL CTA',
    setting: {
      id: 'clickModalCtaUrl',
      label: 'URL CTA',
      type: 'url',
      defaultValue: '',
      showIf: { settingId: 'clickActionType', value: 'modal' }
    }
  },
  {
    label: 'Ancla de sección',
    setting: {
      id: 'clickSectionAnchor',
      label: 'Ancla de sección',
      type: 'text',
      defaultValue: '',
      placeholder: '#contacto',
      showIf: { settingId: 'clickActionType', value: 'section' }
    }
  },
  {
    label: 'Número de WhatsApp',
    setting: {
      id: 'clickWhatsappNumber',
      label: 'Número de WhatsApp',
      type: 'text',
      defaultValue: '',
      placeholder: '+50688888888',
      showIf: { settingId: 'clickActionType', value: 'whatsapp' }
    }
  },
  {
    label: 'Mensaje de WhatsApp',
    setting: {
      id: 'clickWhatsappMessage',
      label: 'Mensaje de WhatsApp',
      type: 'textarea',
      rows: 3,
      defaultValue: '',
      showIf: { settingId: 'clickActionType', value: 'whatsapp' }
    }
  },
  {
    label: 'Número de teléfono',
    setting: {
      id: 'clickPhoneNumber',
      label: 'Número de teléfono',
      type: 'text',
      defaultValue: '',
      placeholder: '+50688888888',
      showIf: { settingId: 'clickActionType', value: 'phone' }
    }
  },
  {
    label: 'Email',
    setting: {
      id: 'clickEmail',
      label: 'Email',
      type: 'text',
      defaultValue: '',
      placeholder: 'hola@empresa.com',
      showIf: { settingId: 'clickActionType', value: 'email' }
    }
  },
  {
    label: 'Asunto',
    setting: {
      id: 'clickEmailSubject',
      label: 'Asunto',
      type: 'text',
      defaultValue: '',
      showIf: { settingId: 'clickActionType', value: 'email' }
    }
  },
  {
    label: 'Mensaje',
    setting: {
      id: 'clickEmailBody',
      label: 'Mensaje',
      type: 'textarea',
      rows: 3,
      defaultValue: '',
      showIf: { settingId: 'clickActionType', value: 'email' }
    }
  }
];

const ICON_INTERACTION_SETTING_IDS = new Set(BENTO_CLICK_ACTION_FIELDS.map((field) => field.setting.id));

const clampBentoDesktopColumns = (value: any) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return BENTO_DESKTOP_COLUMNS;
  return Math.min(BENTO_MAX_DESKTOP_COLUMNS, Math.max(BENTO_MIN_DESKTOP_COLUMNS, Math.round(parsed)));
};

interface BentoCellEditorProps {
  selectedSection: any;
  moduleDef: any;
  selectedBentoCellIndex: number;
  setSelectedBentoCellIndex: (index: number | null) => void;
  settingsValues?: Record<string, any>;
  onSettingChange?: (elementOrModuleId: string, settingId: string, value: any) => void;
  updateSectionSettings: (sectionId: string, settingsUpdate: Record<string, any>) => void;
  project?: any;
  projectColors: string[];
  title?: string;
  onClose?: () => void;
  embedded?: boolean;
  activeViewport?: 'desktop' | 'tablet' | 'mobile';
}

export const BentoCellEditor: React.FC<BentoCellEditorProps> = ({
  selectedSection,
  moduleDef,
  selectedBentoCellIndex,
  setSelectedBentoCellIndex,
  settingsValues,
  onSettingChange,
  updateSectionSettings,
  project,
  projectColors,
  title = 'Editar elemento',
  onClose,
  embedded = false,
  activeViewport = 'desktop'
}) => {
  const [expandedPillars, setExpandedPillars] = React.useState<Record<string, boolean>>({
    contenido: true,
    estructura: false,
    estilo: false,
    tipografia: false,
    multimedia: false,
    interaccion: false
  });
  const [expandedSubsections, setExpandedSubsections] = React.useState<Record<string, boolean>>({});
  const [activeIconSettingsTab, setActiveIconSettingsTab] = React.useState<IconSettingsTab>('structure');
  const [iconLayoutDevice, setIconLayoutDevice] = React.useState<BentoIconDevice>('desktop');
  const [iconSpacingDevice, setIconSpacingDevice] = React.useState<BentoIconDevice>('desktop');

  const getBentoItems = () => {
    const sectionId = selectedSection.id;
    const repeaterKey = `${sectionId}_el_bento_items_items`;
    const sources = [
      settingsValues?.[repeaterKey],
      selectedSection.settings?.[repeaterKey],
      selectedSection.content?.items,
      selectedSection.content?.blocks,
      selectedSection.content?.cells,
      selectedSection.content?.data?.items,
      selectedSection.content?.data?.blocks
    ];

    return sources.find(Array.isArray) || [];
  };

  const getSelectedBentoItem = () => {
    const items = getBentoItems();
    return items[selectedBentoCellIndex] || null;
  };

  const selectedBentoItem = getSelectedBentoItem();
  const selectedType = selectedBentoItem?.type || 'text';

  React.useEffect(() => {
    if (selectedType === 'icon') {
      setActiveIconSettingsTab('structure');
      setIconLayoutDevice('desktop');
      setIconSpacingDevice('desktop');
    }
  }, [selectedBentoCellIndex, selectedType]);
  const activeLayoutKey = activeViewport;
  const desktopColumns = clampBentoDesktopColumns(
    settingsValues?.[`${selectedSection.id}_global_columns`]
      ?? selectedSection.settings?.[`${selectedSection.id}_global_columns`]
      ?? selectedSection.content?.columns
  );
  const activeColumns = activeViewport === 'desktop'
    ? desktopColumns
    : activeViewport === 'tablet'
      ? BENTO_TABLET_COLUMNS
      : BENTO_MOBILE_COLUMNS;

  const clampNumber = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
  const parseNumber = (value: any, fallback: number) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const getResponsiveMinimumRows = (item: any) => {
    if (activeLayoutKey === 'desktop') return 1;
    if (item?.type === 'icon') {
      const visualSize = item.icon_visual_type === 'image'
        ? parseNumber(item.icon_image_size, 72)
        : Math.max(parseNumber(item.icon_size, 32) + 16, 40);
      const hasText = Boolean(item.title || item.description);
      const spacing = resolveBentoIconSpacing(item, activeLayoutKey);
      const hasExplicitSpacing = Boolean(item?.icon_spacing?.[activeLayoutKey])
        || item?.card_padding !== undefined
        || ['top', 'right', 'bottom', 'left'].some((side) => item?.[`card_padding_${side}`] !== undefined);
      const textPadding = hasExplicitSpacing ? 0 : parseNumber(item.padding, 32);
      const estimatedHeight = visualSize
        + (hasText ? 92 + (textPadding * 2) + spacing.internalGap : 0)
        + spacing.top
        + spacing.bottom;
      return Math.max(2, Math.ceil(estimatedHeight / 96));
    }
    if (item?.type === 'list') return 3;
    if (item?.type === 'visual') return 3;
    return 2;
  };

  const getWorkspaceRows = () => {
    const workspaceRowsKey = `${selectedSection.id}_el_bento_items_workspace_rows`;
    const workspaceRowsValue = settingsValues?.[workspaceRowsKey] ?? selectedSection.settings?.[workspaceRowsKey];
    const rawRows = typeof workspaceRowsValue === 'object' && workspaceRowsValue !== null
      ? workspaceRowsValue[activeLayoutKey]
      : workspaceRowsValue;
    const parsedRows = Number(rawRows);
    return clampNumber(
      Number.isFinite(parsedRows) ? parsedRows : BENTO_BASE_VISIBLE_ROWS,
      BENTO_BASE_VISIBLE_ROWS,
      BENTO_MAX_EDITABLE_ROWS
    );
  };

  const getOccupiedRows = (items: any[]) => Math.ceil(items.reduce((maxRows: number, item: any) => {
    const layout = getActiveLayout(item);
    return Math.max(maxRows, layout.y + Math.max(layout.h, 1));
  }, 0));

  const updateWorkspaceRows = (rows: number) => {
    const nextRows = clampNumber(rows, BENTO_BASE_VISIBLE_ROWS, BENTO_MAX_EDITABLE_ROWS);
    const workspaceRowsKey = `${selectedSection.id}_el_bento_items_workspace_rows`;
    const currentValue = settingsValues?.[workspaceRowsKey] ?? selectedSection.settings?.[workspaceRowsKey];
    const currentRows = getWorkspaceRows();
    if (currentRows === nextRows) return;

    const nextValue = {
      ...(typeof currentValue === 'object' && currentValue !== null ? currentValue : {}),
      [activeLayoutKey]: nextRows
    };

    if (onSettingChange) {
      onSettingChange(`${selectedSection.id}_el_bento_items`, 'workspace_rows', nextValue);
    } else {
      updateSectionSettings(selectedSection.id, { [workspaceRowsKey]: nextValue });
    }
  };

  const shouldScaleLegacyDesktopLayout = (item: any, layout: any) => {
    const declaredColumns = Number(layout?.columns || item?.layout_columns?.desktop || item?.layoutColumns?.desktop || 0);
    return activeLayoutKey === 'desktop'
      && (declaredColumns > 0 ? declaredColumns < activeColumns : activeColumns === BENTO_DESKTOP_COLUMNS);
  };

  const getActiveLayout = (item: any) => {
    const savedLayout = item.layouts?.[activeLayoutKey];
    const defaultW = activeLayoutKey === 'desktop'
      ? (item.desktop_span || item.col_span || 8)
      : activeLayoutKey === 'tablet'
        ? (item.tablet_span || Math.min(item.col_span || 3, BENTO_TABLET_COLUMNS))
        : (item.mobile_span || BENTO_MOBILE_COLUMNS);
    const defaultH = activeLayoutKey === 'mobile'
      ? (item.mobile_rows || item.row_span || 2)
      : (item.desktop_rows || item.row_span || 2);
    const rawLayout = {
      x: Number(savedLayout?.x ?? item.x ?? 0) || 0,
      y: Number(savedLayout?.y ?? item.y ?? 0) || 0,
      w: Number(savedLayout?.w ?? defaultW) || 1,
      h: Number(savedLayout?.h ?? defaultH) || 1
    };
    const scaleLegacyDesktop = savedLayout
      ? shouldScaleLegacyDesktopLayout(item, savedLayout)
      : shouldScaleLegacyDesktopLayout(item, rawLayout);
    const w = clampNumber(scaleLegacyDesktop ? rawLayout.w * 2 : rawLayout.w, 1, activeColumns);

    return {
      x: clampNumber(scaleLegacyDesktop ? rawLayout.x * 2 : rawLayout.x, 0, Math.max(activeColumns - w, 0)),
      y: Math.max(rawLayout.y, 0),
      w,
      h: Math.max(rawLayout.h, getResponsiveMinimumRows(item))
    };
  };

  const layoutsCollide = (
    candidate: { x: number; y: number; w: number; h: number },
    existing: { x: number; y: number; w: number; h: number }
  ) => (
    candidate.x < existing.x + existing.w &&
    candidate.x + candidate.w > existing.x &&
    candidate.y < existing.y + existing.h &&
    candidate.y + candidate.h > existing.y
  );

  const moveSelectedCell = (dx: number, dy: number) => {
    const currentItems = getBentoItems();
    const currentItem = currentItems[selectedBentoCellIndex];
    if (!currentItem) return;

    const currentLayout = getActiveLayout(currentItem);
    const nextLayout = {
      ...currentLayout,
      x: clampNumber(currentLayout.x + dx, 0, Math.max(activeColumns - currentLayout.w, 0)),
      y: Math.max(currentLayout.y + dy, 0)
    };

    if (nextLayout.x === currentLayout.x && nextLayout.y === currentLayout.y) return;

    const collides = currentItems.some((item: any, index: number) => {
      if (index === selectedBentoCellIndex) return false;
      return layoutsCollide(nextLayout, getActiveLayout(item));
    });
    if (collides) return;

    const currentWorkspaceRows = getWorkspaceRows();
    const nextBottom = nextLayout.y + nextLayout.h;
    if (nextBottom > BENTO_MAX_EDITABLE_ROWS) return;

    const newItems = [...currentItems];
    const existingLayouts = currentItem.layouts || {};
    const nextItem = {
      ...currentItem,
      layouts: {
        ...existingLayouts,
        [activeLayoutKey]: { ...nextLayout, columns: activeColumns }
      },
      layout_columns: {
        ...(currentItem.layout_columns || {}),
        [activeLayoutKey]: activeColumns
      },
      ...(activeLayoutKey === 'desktop'
        ? {
          x: nextLayout.x,
          y: nextLayout.y,
          col_span: nextLayout.w,
          row_span: nextLayout.h,
          desktop_span: nextLayout.w,
          desktop_rows: nextLayout.h
        }
        : {}),
      ...(activeLayoutKey === 'tablet' ? { tablet_span: nextLayout.w } : {}),
      ...(activeLayoutKey === 'mobile' ? { mobile_span: nextLayout.w } : {})
    };

    newItems[selectedBentoCellIndex] = nextItem;
    if (onSettingChange) {
      onSettingChange(`${selectedSection.id}_el_bento_items`, 'items', newItems);
    } else {
      updateSectionSettings(selectedSection.id, { [`${selectedSection.id}_el_bento_items_items`]: newItems });
    }

    if (dy > 0 && nextBottom > currentWorkspaceRows) {
      updateWorkspaceRows(nextBottom);
    } else if (dy < 0) {
      updateWorkspaceRows(Math.max(BENTO_BASE_VISIBLE_ROWS, getOccupiedRows(newItems)));
    }
  };

  const selectedLayout = selectedBentoItem ? getActiveLayout(selectedBentoItem) : null;
  const canMoveSelectedCell = (dx: number, dy: number) => {
    if (!selectedLayout) return false;

    const nextLayout = {
      ...selectedLayout,
      x: clampNumber(selectedLayout.x + dx, 0, Math.max(activeColumns - selectedLayout.w, 0)),
      y: Math.max(selectedLayout.y + dy, 0)
    };

    if (nextLayout.x === selectedLayout.x && nextLayout.y === selectedLayout.y) return false;
    if (nextLayout.y + nextLayout.h > BENTO_MAX_EDITABLE_ROWS) return false;

    return !getBentoItems().some((item: any, index: number) => {
      if (index === selectedBentoCellIndex) return false;
      return layoutsCollide(nextLayout, getActiveLayout(item));
    });
  };

  const visibleFieldsByType: Record<string, string[]> = {
    text: ['text_style', 'title', 'description', 'title_size', 'title_weight', 'font_family', 'title_color', 'description_size', 'content_align', 'line_height', 'letter_spacing', 'card_image', 'card_overlay', 'desktop_span', 'desktop_rows', 'tablet_span', 'mobile_span', 'padding', 'align_items', 'card_style', 'card_bg', 'card_gradient', 'card_radius', 'card_shadow', 'text_contrast'],
    visual: ['image', 'image_fit', 'card_image', 'card_overlay', 'desktop_span', 'desktop_rows', 'tablet_span', 'mobile_span', 'padding', 'align_items', 'card_style', 'card_bg', 'card_gradient', 'card_radius', 'card_shadow'],
    button: ['button_text', 'btn_url', 'desktop_span', 'desktop_rows', 'tablet_span', 'mobile_span', 'padding', 'align_items', 'card_style', 'card_bg', 'card_gradient', 'card_image', 'card_overlay', 'card_radius', 'card_shadow'],
    icon: ['title', 'description', 'icon_visual_type', 'icon', 'icon_color', 'icon_size', 'show_icon_bg', 'icon_bg', 'icon_image', 'icon_image_size', 'title_size', 'title_weight', 'title_color', 'description_size', 'description_weight', 'description_color', 'content_align', 'desktop_span', 'desktop_rows', 'tablet_span', 'mobile_span', 'element_padding_y', 'card_padding_linked', 'card_padding_top', 'card_padding_right', 'card_padding_bottom', 'card_padding_left', 'icon_content_gap', 'text_content_gap', 'padding', 'align_items', 'card_style', 'card_bg', 'card_gradient', 'card_image', 'card_overlay', 'card_radius', 'card_shadow', 'text_contrast'],
    badge: ['title', 'icon', 'title_size', 'title_weight', 'title_color', 'desktop_span', 'desktop_rows', 'tablet_span', 'mobile_span', 'padding', 'align_items', 'card_style', 'card_bg', 'card_gradient', 'card_image', 'card_overlay', 'card_radius', 'card_shadow'],
    metric: ['metric_value', 'metric_prefix', 'metric_suffix', 'metric_label', 'accent_color', 'icon', 'desktop_span', 'desktop_rows', 'tablet_span', 'mobile_span', 'padding', 'align_items', 'card_style', 'card_bg', 'card_gradient', 'card_image', 'card_overlay', 'card_radius', 'card_shadow'],
    list: ['title', 'list_items', 'icon', 'title_size', 'title_weight', 'title_color', 'desktop_span', 'desktop_rows', 'tablet_span', 'mobile_span', 'padding', 'align_items', 'card_style', 'card_bg', 'card_gradient', 'card_image', 'card_overlay', 'card_radius', 'card_shadow'],
    accordion: ['title', 'description', 'title_size', 'title_weight', 'title_color', 'desktop_span', 'desktop_rows', 'tablet_span', 'mobile_span', 'padding', 'align_items', 'card_style', 'card_bg', 'card_gradient', 'card_image', 'card_overlay', 'card_radius', 'card_shadow'],
    marquee: ['title', 'title_size', 'title_weight', 'title_color', 'desktop_span', 'desktop_rows', 'tablet_span', 'mobile_span', 'padding', 'align_items', 'card_style', 'card_bg', 'card_gradient', 'card_image', 'card_overlay', 'card_radius', 'card_shadow'],
    card: ['title', 'description', 'icon', 'title_size', 'title_weight', 'title_color', 'description_size', 'desktop_span', 'desktop_rows', 'tablet_span', 'mobile_span', 'padding', 'align_items', 'card_style', 'card_bg', 'card_gradient', 'card_image', 'card_overlay', 'card_radius', 'card_shadow', 'text_contrast']
  };

  const shouldShowFieldForType = (field: any) => {
    const visibleFields = visibleFieldsByType[selectedType] || visibleFieldsByType.text;
    const iconVisualType = selectedBentoItem?.icon_visual_type || 'icon';
    if (selectedType === 'icon' && iconVisualType === 'image') {
      if (['icon', 'icon_color', 'icon_size', 'show_icon_bg', 'icon_bg'].includes(field.id)) return false;
    }
    if (selectedType === 'icon' && iconVisualType !== 'image' && ['icon_image', 'icon_image_size'].includes(field.id)) return false;
    return visibleFields.includes(field.id);
  };

  const settingsByPillar: Record<string, { label: string, setting: any, contextId: string }[]> = {};

  const normalizeFieldForSelectedType = (field: any) => {
    let nextField = field;
    if (selectedType === 'icon' && field.id === 'title_size') {
      nextField = { ...nextField, allowedLevels: ['t1', 't2', 't3'] };
    }
    if (selectedType === 'icon' && field.id === 'description_size') {
      nextField = { ...nextField, allowedLevels: ['t3', 'p', 's'] };
    }
    if (selectedType === 'icon' && field.id === 'desktop_span') {
      nextField = { ...nextField, label: 'Ancho de celda en escritorio', max: desktopColumns, subsection: 'Tamaño de celda', description: 'Ajusta el espacio que ocupa el bloque en el grid; no cambia el tamaño interno del icono o la imagen.' };
    } else if (field.id === 'desktop_span') {
      nextField = { ...nextField, max: desktopColumns };
    }
    if (selectedType === 'icon' && field.id === 'desktop_rows') {
      nextField = { ...nextField, label: 'Alto de celda en escritorio', subsection: 'Tamaño de celda', description: 'Ajusta filas de alto de la celda. También puedes usar el resize visual del canvas.' };
    }
    if (selectedType === 'icon' && field.id === 'tablet_span') {
      nextField = { ...nextField, label: 'Ancho de celda en tablet', subsection: 'Tamaño de celda', description: 'Ajusta el ancho del bloque en el grid tablet.' };
    }
    if (selectedType === 'icon' && field.id === 'mobile_span') {
      nextField = { ...nextField, label: 'Ancho de celda en móvil', subsection: 'Tamaño de celda', description: 'Ajusta el ancho del bloque en el grid móvil.' };
    }
    if (selectedType === 'icon' && field.id === 'element_padding_y') {
      nextField = { ...nextField, label: 'Separación vertical del elemento', subsection: 'Espaciado del elemento', description: 'Aire superior e inferior del conjunto visual + textos dentro de la celda.' };
    }
    if (selectedType === 'icon' && field.id === 'card_padding_linked') {
      nextField = { ...nextField, subsection: 'Espaciado de la tarjeta' };
    }
    if (selectedType === 'icon' && field.id === 'padding') {
      nextField = { ...nextField, label: 'Separación interna de textos', description: 'Espacio propio del bloque de título y descripción; no cambia el tamaño ni la posición del visual.' };
    }
    if (selectedType === 'icon' && field.id === 'align_items') {
      nextField = { ...nextField, label: 'Alineación vertical del contenido', description: 'Mueve juntos el visual, título y descripción dentro de una celda alta.' };
    }
    if (selectedType === 'icon' && field.id === 'card_style') {
      nextField = { ...nextField, label: 'Estilo del contenedor', description: 'Cambia el fondo visual de la celda completa, no el icono o imagen interna.' };
    }
    if (selectedType === 'icon' && field.id === 'card_bg') {
      nextField = { ...nextField, label: 'Fondo del contenedor' };
    }
    if (selectedType === 'icon' && field.id === 'card_gradient') {
      nextField = { ...nextField, label: 'Degradado del contenedor' };
    }
    if (selectedType === 'icon' && field.id === 'card_image') {
      nextField = { ...nextField, label: 'Imagen de fondo del contenedor' };
    }
    if (selectedType === 'icon' && field.id === 'card_overlay') {
      nextField = { ...nextField, label: 'Opacidad de imagen de fondo' };
    }
    if (selectedType === 'icon' && field.id === 'card_radius') {
      nextField = { ...nextField, label: 'Redondeo del contenedor' };
    }
    if (selectedType === 'icon' && field.id === 'card_shadow') {
      nextField = { ...nextField, label: 'Sombra del contenedor' };
    }
    return nextField;
  };

  moduleDef.elements.forEach((element: any) => {
    if (element.id !== 'el_bento_items' || !element.settings) return;

    Object.entries(element.settings).forEach(([pillar, settings]) => {
      let targetPillar = pillar;
      if (pillar === 'title' || pillar === 'subtitle' || pillar === 'eyebrow') targetPillar = 'contenido';
      if (!settingsByPillar[targetPillar]) settingsByPillar[targetPillar] = [];

      (settings as any[]).forEach((setting) => {
        const cellSettings = setting.type === 'repeater' && Array.isArray(setting.fields) ? setting.fields : [setting];
        cellSettings.filter(shouldShowFieldForType).forEach((field: any) => {
          const normalizedField = normalizeFieldForSelectedType(field);
          settingsByPillar[targetPillar].push({
            label: normalizedField.label,
            setting: normalizedField,
            contextId: `${selectedSection.id}_${element.id}_${selectedBentoCellIndex}`
          });
        });
      });
    });
  });

  const interactionContextId = `${selectedSection.id}_el_bento_items_${selectedBentoCellIndex}`;
  if (!settingsByPillar.interaccion) settingsByPillar.interaccion = [];
  settingsByPillar.interaccion.push(
    ...BENTO_CLICK_ACTION_FIELDS.map((field) => ({
      ...field,
      contextId: interactionContextId
    }))
  );

  const iconSettingsByTab = Object.values(settingsByPillar)
    .flat()
    .reduce((tabs, field) => {
      const settingId = field.setting.id;
      const tab: IconSettingsTab = ICON_MEDIA_SETTING_IDS.has(settingId)
        ? 'media'
        : ICON_TEXT_SETTING_IDS.has(settingId)
          ? 'text'
          : 'structure';
      tabs[tab].push(field);
      return tabs;
    }, {
      structure: [],
      text: [],
      media: []
    } as Record<IconSettingsTab, any[]>);

  const togglePillar = (pillar: string) => {
    setExpandedPillars(prev => ({ ...prev, [pillar]: !prev[pillar] }));
  };

  const toggleSubsection = (subsectionKey: string) => {
    setExpandedSubsections(prev => ({ ...prev, [subsectionKey]: !prev[subsectionKey] }));
  };

  const evaluateCondition = (condition: any, currentSettings: Record<string, any>, contextId: string) => {
    if (!condition) return { result: true };

    let val = currentSettings[`${contextId}_${condition.settingId}`];
    if (val === undefined) {
      const modulePrefix = contextId.split('_').slice(0, 3).join('_') + '_global';
      val = currentSettings[`${modulePrefix}_${condition.settingId}`];
    }

    const op = condition.operator || 'eq';
    let result = false;

    switch (op) {
      case 'eq':
        result = Array.isArray(condition.value) ? condition.value.includes(val) : val === condition.value;
        break;
      case 'neq':
        result = Array.isArray(condition.value) ? !condition.value.includes(val) : val !== condition.value;
        break;
      case 'includes':
        result = Array.isArray(val) ? val.includes(condition.value) : Array.isArray(condition.value) ? condition.value.includes(val) : false;
        break;
      case 'not_includes':
        result = Array.isArray(val) ? !val.includes(condition.value) : Array.isArray(condition.value) ? !condition.value.includes(val) : true;
        break;
    }

    return { result, message: condition.message };
  };

  const handleFieldChange = (contextId: string, settingId: string, value: any) => {
    logDebug('[BENTO_CELL_EDITOR_CHANGE_DEBUG]', { contextId, settingId, value });
    const [sectionId, indexStr] = contextId.split('_el_bento_items_');
    const realSectionId = sectionId || selectedSection.id;
    const index = parseInt(indexStr);
    const repeaterKey = `${realSectionId}_el_bento_items_items`;
    const currentItems = getBentoItems();
    const newItems = [...currentItems];

    if (newItems[index]) {
      const textStylePreset = settingId === 'text_style'
        ? TEXT_STYLE_PRESETS[value as string] || {}
        : {};
      const currentItem = newItems[index];
      let nextItem = { ...currentItem, [settingId]: value, ...textStylePreset };
      const numericValue = Number(value);

      const isCardPaddingSide = ['card_padding_top', 'card_padding_right', 'card_padding_bottom', 'card_padding_left'].includes(settingId);
      const isCardPaddingLinked = currentItem.card_padding_linked !== false && currentItem.card_padding_linked !== 'false';
      if (isCardPaddingSide && isCardPaddingLinked) {
        nextItem = {
          ...nextItem,
          card_padding: value,
          card_padding_top: value,
          card_padding_right: value,
          card_padding_bottom: value,
          card_padding_left: value
        };
      }

      if (settingId === 'card_padding_linked' && (value === true || value === 'true')) {
        const uniformPadding = currentItem.card_padding_top
          ?? currentItem.card_padding
          ?? 24;
        nextItem = {
          ...nextItem,
          card_padding: uniformPadding,
          card_padding_top: uniformPadding,
          card_padding_right: uniformPadding,
          card_padding_bottom: uniformPadding,
          card_padding_left: uniformPadding
        };
      }

      if (Number.isFinite(numericValue) && ['desktop_span', 'desktop_rows', 'tablet_span', 'mobile_span'].includes(settingId)) {
        const existingLayouts = currentItem.layouts || {};
        const updateLayoutSize = (
          breakpoint: 'desktop' | 'tablet' | 'mobile',
          cols: number,
          updates: { w?: number; h?: number }
        ) => {
          const currentLayout = breakpoint === activeLayoutKey
            ? getActiveLayout(currentItem)
            : (() => {
                const savedLayout = existingLayouts[breakpoint];
                const fallbackW = breakpoint === 'desktop'
                  ? (currentItem.desktop_span || currentItem.col_span || 4)
                  : breakpoint === 'tablet'
                    ? (currentItem.tablet_span || Math.min(currentItem.col_span || 3, BENTO_TABLET_COLUMNS))
                    : (currentItem.mobile_span || BENTO_MOBILE_COLUMNS);
                const fallbackH = breakpoint === 'mobile'
                  ? (currentItem.mobile_rows || currentItem.row_span || 2)
                  : (currentItem.desktop_rows || currentItem.row_span || 2);
                return {
                  x: Number(savedLayout?.x ?? currentItem.x ?? 0) || 0,
                  y: Number(savedLayout?.y ?? currentItem.y ?? 0) || 0,
                  w: Number(savedLayout?.w ?? fallbackW) || 1,
                  h: Number(savedLayout?.h ?? fallbackH) || 1
                };
              })();
          const nextW = clampNumber(updates.w ?? currentLayout.w, 1, cols);
          const nextH = Math.max(updates.h ?? currentLayout.h, 1);

          return {
            x: clampNumber(currentLayout.x, 0, Math.max(cols - nextW, 0)),
            y: Math.max(currentLayout.y, 0),
            w: nextW,
            h: nextH,
            columns: cols
          };
        };

        if (settingId === 'desktop_span') {
          const layout = updateLayoutSize('desktop', desktopColumns, { w: numericValue });
          nextItem = {
            ...nextItem,
            x: layout.x,
            y: layout.y,
            col_span: layout.w,
            desktop_span: layout.w,
            layouts: { ...existingLayouts, desktop: layout },
            layout_columns: { ...(currentItem.layout_columns || {}), desktop: desktopColumns }
          };
        }
        if (settingId === 'desktop_rows') {
          const layout = updateLayoutSize('desktop', desktopColumns, { h: numericValue });
          nextItem = {
            ...nextItem,
            y: layout.y,
            row_span: layout.h,
            desktop_rows: layout.h,
            layouts: { ...(nextItem.layouts || existingLayouts), desktop: layout },
            layout_columns: { ...(currentItem.layout_columns || {}), desktop: desktopColumns }
          };
        }
        if (settingId === 'tablet_span') {
          const layout = updateLayoutSize('tablet', BENTO_TABLET_COLUMNS, { w: numericValue });
          nextItem = {
            ...nextItem,
            tablet_span: layout.w,
            layouts: { ...existingLayouts, tablet: layout },
            layout_columns: { ...(currentItem.layout_columns || {}), tablet: BENTO_TABLET_COLUMNS }
          };
        }
        if (settingId === 'mobile_span') {
          const layout = updateLayoutSize('mobile', BENTO_MOBILE_COLUMNS, { w: numericValue });
          nextItem = {
            ...nextItem,
            mobile_span: layout.w,
            layouts: { ...existingLayouts, mobile: layout },
            layout_columns: { ...(currentItem.layout_columns || {}), mobile: BENTO_MOBILE_COLUMNS }
          };
        }
      }

      newItems[index] = nextItem;
      if (onSettingChange) {
        onSettingChange(`${realSectionId}_el_bento_items`, 'items', newItems);
      } else {
        updateSectionSettings(selectedSection.id, { [repeaterKey]: newItems });
      }
    }
  };

  const renderFieldControl = ({ label, setting, contextId }: { label: string; setting: any; contextId: string }) => {
    const conditionSettings = selectedBentoItem
      ? {
        ...selectedSection.settings,
        ...Object.fromEntries(Object.entries(selectedBentoItem).map(([key, itemValue]) => [`${contextId}_${key}`, itemValue]))
      }
      : selectedSection.settings;
    const show = evaluateCondition(setting.showIf, conditionSettings, contextId);
    const forceShowButtonField = selectedType === 'button' && ['button_text', 'btn_url'].includes(setting.id);
    if (!show.result && !forceShowButtonField) return null;

    const value = selectedBentoItem && selectedBentoItem[setting.id] !== undefined
      ? selectedBentoItem[setting.id]
      : setting.defaultValue;

    return (
      <div key={`${contextId}_${setting.id}`} className="space-y-1">
        <SettingControl
          setting={{ ...setting, label: setting.subsection ? setting.label : label }}
          value={value}
          onChange={(val) => handleFieldChange(contextId, setting.id, val)}
          projectId={project?.id || null}
          products={project?.products || []}
          customers={project?.customers || []}
          projectColors={projectColors}
          project={project}
          contextId={contextId}
          moduleType={selectedSection.type}
        />
        {setting.description && (
          <p className="text-[10px] text-gray-400 mt-1 italic pl-1">{setting.description}</p>
        )}
      </div>
    );
  };

  const activeViewportLabel = activeViewport === 'desktop'
    ? 'Desktop'
    : activeViewport === 'tablet'
      ? 'Tablet'
      : 'Móvil';

  const movementControls = selectedLayout && (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-blue-700">Mover en {activeViewportLabel}</p>
          <p className="text-[10px] text-blue-500">x {selectedLayout.x} / y {selectedLayout.y}</p>
        </div>
        <div className="rounded-lg bg-white px-2 py-1 text-[10px] font-mono font-bold text-blue-600">
          {activeColumns} cols
        </div>
      </div>
      <div className="mx-auto grid w-28 grid-cols-3 gap-1">
        <span />
        <button
          type="button"
          onClick={() => moveSelectedCell(0, -1)}
          disabled={!canMoveSelectedCell(0, -1)}
          className="flex h-8 items-center justify-center rounded-lg border border-blue-100 bg-white text-blue-600 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
          title="Mover arriba"
          aria-label="Mover arriba"
        >
          <LucideIcons.ArrowUp size={14} />
        </button>
        <span />
        <button
          type="button"
          onClick={() => moveSelectedCell(-1, 0)}
          disabled={!canMoveSelectedCell(-1, 0)}
          className="flex h-8 items-center justify-center rounded-lg border border-blue-100 bg-white text-blue-600 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
          title="Mover izquierda"
          aria-label="Mover izquierda"
        >
          <LucideIcons.ArrowLeft size={14} />
        </button>
        <div className="flex h-8 items-center justify-center rounded-lg bg-blue-100 text-[10px] font-black text-blue-700">
          1
        </div>
        <button
          type="button"
          onClick={() => moveSelectedCell(1, 0)}
          disabled={!canMoveSelectedCell(1, 0)}
          className="flex h-8 items-center justify-center rounded-lg border border-blue-100 bg-white text-blue-600 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
          title="Mover derecha"
          aria-label="Mover derecha"
        >
          <LucideIcons.ArrowRight size={14} />
        </button>
        <span />
        <button
          type="button"
          onClick={() => moveSelectedCell(0, 1)}
          disabled={!canMoveSelectedCell(0, 1)}
          className="flex h-8 items-center justify-center rounded-lg border border-blue-100 bg-white text-blue-600 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
          title="Mover abajo"
          aria-label="Mover abajo"
        >
          <LucideIcons.ArrowDown size={14} />
        </button>
        <span />
      </div>
    </div>
  );

  const iconFieldsById = new Map(
    Object.values(iconSettingsByTab)
      .flat()
      .map((field) => [field.setting.id, field])
  );
  const iconContextId = `${selectedSection.id}_el_bento_items_${selectedBentoCellIndex}`;
  const iconSpacing = resolveBentoIconSpacing(selectedBentoItem, iconSpacingDevice);
  const iconWidthSettingId = iconLayoutDevice === 'desktop'
    ? 'desktop_span'
    : iconLayoutDevice === 'tablet'
      ? 'tablet_span'
      : 'mobile_span';
  const iconWidthMax = iconLayoutDevice === 'desktop'
    ? desktopColumns
    : iconLayoutDevice === 'tablet'
      ? BENTO_TABLET_COLUMNS
      : BENTO_MOBILE_COLUMNS;
  const iconWidthFallback = iconLayoutDevice === 'desktop' ? 4 : iconLayoutDevice === 'tablet' ? 2 : 4;
  const iconWidthValue = Number(selectedBentoItem?.[iconWidthSettingId] ?? iconWidthFallback);

  const renderIconField = (settingId: string, label?: string) => {
    const field = iconFieldsById.get(settingId);
    if (!field) return null;
    const setting = label ? { ...field.setting, label } : field.setting;
    return renderFieldControl({ ...field, label: label || field.label, setting });
  };

  const renderIconLocalControl = (setting: any, value: any, onChange: (value: any) => void) => (
    <div key={setting.id} className="space-y-1">
      <SettingControl
        setting={setting}
        value={value}
        onChange={onChange}
        projectId={project?.id || null}
        products={project?.products || []}
        customers={project?.customers || []}
        projectColors={projectColors}
        project={project}
        contextId={iconContextId}
        moduleType={selectedSection.type}
      />
    </div>
  );

  const renderIconSectionHeading = (label: string) => (
    <h4 className="border-b border-gray-100 pb-2 text-[10px] font-black uppercase tracking-wider text-gray-700">
      {label}
    </h4>
  );

  const updateSelectedIconSpacing = (updates: Parameters<typeof updateBentoIconSpacing>[2]) => {
    if (!selectedBentoItem) return;
    handleFieldChange(
      iconContextId,
      'icon_spacing',
      updateBentoIconSpacing(selectedBentoItem, iconSpacingDevice, updates)
    );
  };

  const iconStructureControls = (
    <div className="space-y-5">
      <div className="space-y-3">
        {renderIconSectionHeading('Distribución')}
        {renderIconLocalControl({ id: 'icon_layout_device', label: 'Dispositivo', type: 'select', options: ICON_DEVICE_OPTIONS }, iconLayoutDevice, (value) => setIconLayoutDevice(value as BentoIconDevice))}
        {renderIconLocalControl({ id: 'icon_cell_width', label: 'Ancho de celda', type: 'range', min: 1, max: iconWidthMax, step: 1 }, iconWidthValue, (value) => handleFieldChange(iconContextId, iconWidthSettingId, value))}
      </div>

      <div className="space-y-3">
        {renderIconSectionHeading('Espaciado')}
        {renderIconLocalControl({ id: 'icon_spacing_device', label: 'Dispositivo', type: 'select', options: ICON_DEVICE_OPTIONS }, iconSpacingDevice, (value) => setIconSpacingDevice(value as BentoIconDevice))}
        {renderIconLocalControl({ id: 'icon_vertical_padding', label: 'Aire vertical', type: 'range', min: 0, max: 64, step: 2, unit: 'px' }, iconSpacing.top, (value) => updateSelectedIconSpacing({ verticalPadding: Number(value) }))}
        {renderIconLocalControl({ id: 'icon_horizontal_padding', label: 'Aire horizontal', type: 'range', min: 0, max: 64, step: 2, unit: 'px' }, iconSpacing.left, (value) => updateSelectedIconSpacing({ horizontalPadding: Number(value) }))}
        {renderIconLocalControl({ id: 'icon_internal_gap', label: 'Separación interna', type: 'range', min: 0, max: 48, step: 2, unit: 'px' }, iconSpacing.internalGap, (value) => updateSelectedIconSpacing({ internalGap: Number(value) }))}
      </div>

      <div className="space-y-3">
        {renderIconSectionHeading('Alineación')}
        {renderIconField('align_items', 'Alineación vertical')}
        {renderIconField('content_align', 'Alineación horizontal')}
      </div>

      <div className="space-y-3">
        {renderIconSectionHeading('Tarjeta')}
        {renderIconField('card_style', 'Estilo')}
        {renderIconField('card_radius', 'Radio')}
        {renderIconField('card_shadow', 'Sombra')}
        {[...ICON_INTERACTION_SETTING_IDS].map((settingId) => renderIconField(settingId))}
      </div>
    </div>
  );

  const iconTextControls = (
    <div className="space-y-5">
      <div className="space-y-3">
        {renderIconSectionHeading('Título')}
        {renderIconField('title', 'Título')}
        {renderIconField('title_size', 'Tamaño')}
        {renderIconField('title_weight', 'Peso')}
        {renderIconField('title_color', 'Color')}
      </div>
      <div className="space-y-3">
        {renderIconSectionHeading('Descripción')}
        {renderIconField('description', 'Descripción')}
        {renderIconField('description_size', 'Tamaño')}
        {renderIconField('description_weight', 'Peso')}
        {renderIconField('description_color', 'Color')}
        {renderIconField('text_contrast', 'Contraste')}
      </div>
    </div>
  );

  const iconMediaControls = (
    <div className="space-y-5">
      <div className="space-y-3">
        {renderIconSectionHeading('Ícono o imagen')}
        {renderIconField('icon_visual_type', 'Tipo visual')}
        {renderIconField('icon', 'Ícono')}
        {renderIconField('icon_image', 'Imagen')}
        {renderIconField('icon_size', 'Tamaño del ícono')}
        {renderIconField('icon_image_size', 'Tamaño de imagen')}
        {renderIconField('icon_color', 'Color del ícono')}
        {renderIconField('show_icon_bg', 'Mostrar fondo del ícono')}
        {renderIconField('icon_bg', 'Fondo del ícono')}
      </div>
      <div className="space-y-3">
        {renderIconSectionHeading('Fondo del contenedor')}
        {renderIconField('card_bg', 'Color de fondo')}
        {renderIconField('card_gradient', 'Degradado')}
        {renderIconField('card_image', 'Imagen de fondo')}
        {renderIconField('card_overlay', 'Opacidad de imagen de fondo')}
      </div>
    </div>
  );

  const iconSettingsPanel = selectedType === 'icon' && (
    <section
      id={`icon-settings-${activeIconSettingsTab}-panel`}
      role="tabpanel"
      aria-labelledby={`icon-settings-${activeIconSettingsTab}-tab`}
      className="space-y-4"
    >
      {activeIconSettingsTab === 'structure'
        ? iconStructureControls
        : activeIconSettingsTab === 'text'
          ? iconTextControls
          : iconMediaControls}
    </section>
  );

  const iconSettingsTabs = selectedType === 'icon' && (
    <div className="grid grid-cols-3 gap-1 rounded-lg bg-gray-100 p-1" role="tablist" aria-label="Configuración del ícono">
      {ICON_SETTINGS_TABS.map(tab => {
        const isActive = activeIconSettingsTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            id={`icon-settings-${tab.id}-tab`}
            role="tab"
            aria-selected={isActive}
            aria-controls={`icon-settings-${tab.id}-panel`}
            onClick={() => setActiveIconSettingsTab(tab.id)}
            className={`rounded-md px-2 py-1.5 text-[10px] font-bold transition-colors ${isActive ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className={`flex flex-col h-full bg-white overflow-hidden ${embedded ? '' : 'border-l border-gray-100 shadow-sm'}`}>
      {!embedded && <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center text-white">
              <CustomSettingsIcon size={14} />
            </div>
            {title}
          </h3>
          <div className="flex items-center gap-2">
            <div className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-mono text-gray-500 uppercase">
              Item #{selectedBentoCellIndex + 1}
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Cerrar editor Bento"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <button
          onClick={() => setSelectedBentoCellIndex(null)}
          className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-2 py-1 rounded w-fit"
        >
          <LucideIcons.ArrowLeft size={10} />
          Volver a Configuración Global
        </button>
      </div>}

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {embedded ? (
          <div className="space-y-5 p-3">
            {movementControls}
            {iconSettingsTabs}
            {selectedType === 'icon' ? iconSettingsPanel : PILLARS_ORDER.map(pillar => {
              const fields = settingsByPillar[pillar];
              if (!fields || fields.length === 0) return null;

              return (
                <section key={pillar} className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                    <span className="text-blue-600">{PILLAR_ICONS[pillar]}</span>
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-gray-700">
                      {PILLAR_LABELS[pillar]}
                    </h4>
                  </div>
                  <div className="space-y-4">
                    {fields.map(renderFieldControl)}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <>
          <div className="p-4 pb-2">
            {movementControls}
            {iconSettingsTabs && <div className={movementControls ? 'mt-3' : ''}>{iconSettingsTabs}</div>}
          </div>
          {selectedType === 'icon' ? (
            <div className="p-4 pt-2">{iconSettingsPanel}</div>
          ) : PILLARS_ORDER.map(pillar => {
            const fields = settingsByPillar[pillar];
            if (!fields || fields.length === 0) return null;

            const isExpanded = expandedPillars[pillar];

            return (
              <div key={pillar} className="border-b border-gray-50 last:border-none">
                <button
                  onClick={() => togglePillar(pillar)}
                  className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3 text-sm font-semibold text-gray-700">
                    <span className={`transition-colors ${isExpanded ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                      {PILLAR_ICONS[pillar]}
                    </span>
                    {PILLAR_LABELS[pillar]}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded-full text-gray-400 font-bold">
                      {fields.length}
                    </span>
                    {isExpanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-5 space-y-5">
                        {Object.entries(
                          fields.reduce((acc, field) => {
                            const subsection = field.setting.subsection || '__default__';
                            if (!acc[subsection]) acc[subsection] = [];
                            acc[subsection].push(field);
                            return acc;
                          }, {} as Record<string, typeof fields>)
                        ).map(([subsection, subsectionFields]) => {
                          if (subsection === '__default__') {
                            return subsectionFields.map(renderFieldControl);
                          }

                          const subsectionKey = `${selectedSection.id}:${pillar}:${subsection}`;
                          const isSubsectionExpanded = expandedSubsections[subsectionKey] === true;

                          return (
                            <div key={subsectionKey} className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/70">
                              <button
                                onClick={() => toggleSubsection(subsectionKey)}
                                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100/80 transition-colors"
                              >
                                <span className="text-[11px] font-black uppercase tracking-wider text-gray-700">
                                  {subsection}
                                </span>
                                {isSubsectionExpanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                              </button>
                              <AnimatePresence initial={false}>
                                {isSubsectionExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                                    className="overflow-hidden"
                                  >
                                    <div className="px-4 pb-4 space-y-4">
                                      {subsectionFields.map(renderFieldControl)}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
          </>
        )}
      </div>
      {!embedded && <div className="p-4 border-t border-gray-100 bg-gray-50/30">
        <p className="text-[10px] text-gray-400 text-center leading-relaxed">
          Protocolo Solutium 6 Pilares v4.0<br/>
          Diseño Granular y Alta Fidelidad
        </p>
      </div>}
    </div>
  );
};

const CustomSettingsIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
