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
const BENTO_DESKTOP_COLUMNS = 24;
const BENTO_TABLET_COLUMNS = 6;
const BENTO_MOBILE_COLUMNS = 4;

const TEXT_STYLE_PRESETS: Record<string, Record<string, any>> = {
  display: { title_size: 't1', title_weight: 'black', description_size: 'p', line_height: 1.05, letter_spacing: -2 },
  heading_large: { title_size: 't2', title_weight: 'black', description_size: 'p', line_height: 1.1, letter_spacing: -1 },
  heading: { title_size: 't3', title_weight: 'extrabold', description_size: 'p', line_height: 1.2, letter_spacing: 0 },
  subtitle: { title_size: 'p', title_weight: 'semibold', description_size: 'p', line_height: 1.35, letter_spacing: 0 },
  paragraph: { title_size: 'p', title_weight: 'normal', description_size: 'p', line_height: 1.55, letter_spacing: 0 },
  small: { title_size: 's', title_weight: 'normal', description_size: 's', line_height: 1.45, letter_spacing: 0 },
  caption: { title_size: 's', title_weight: 'bold', description_size: 's', line_height: 1.3, letter_spacing: 1 }
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
  const activeLayoutKey = activeViewport;
  const activeColumns = activeViewport === 'desktop'
    ? BENTO_DESKTOP_COLUMNS
    : activeViewport === 'tablet'
      ? BENTO_TABLET_COLUMNS
      : BENTO_MOBILE_COLUMNS;

  const clampNumber = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

  const shouldScaleLegacyDesktopLayout = (item: any, layout: any) => {
    const declaredColumns = Number(layout?.columns || item?.layout_columns?.desktop || item?.layoutColumns?.desktop || 0);
    return activeLayoutKey === 'desktop' && declaredColumns < BENTO_DESKTOP_COLUMNS;
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
      h: Math.max(rawLayout.h, 1)
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
  };

  const selectedLayout = selectedBentoItem ? getActiveLayout(selectedBentoItem) : null;

  const visibleFieldsByType: Record<string, string[]> = {
    text: ['text_style', 'title', 'description', 'title_size', 'title_weight', 'font_family', 'title_color', 'description_size', 'content_align', 'line_height', 'letter_spacing', 'card_image', 'card_overlay', 'desktop_span', 'desktop_rows', 'tablet_span', 'mobile_span', 'padding', 'align_items', 'card_style', 'card_bg', 'card_gradient', 'card_radius', 'card_shadow', 'text_contrast'],
    visual: ['image', 'image_fit', 'card_image', 'card_overlay', 'desktop_span', 'desktop_rows', 'tablet_span', 'mobile_span', 'padding', 'align_items', 'card_style', 'card_bg', 'card_gradient', 'card_radius', 'card_shadow'],
    button: ['button_text', 'btn_url', 'desktop_span', 'desktop_rows', 'tablet_span', 'mobile_span', 'padding', 'align_items', 'card_style', 'card_bg', 'card_gradient', 'card_image', 'card_overlay', 'card_radius', 'card_shadow'],
    icon: ['title', 'description', 'icon', 'title_size', 'title_weight', 'title_color', 'desktop_span', 'desktop_rows', 'tablet_span', 'mobile_span', 'padding', 'align_items', 'card_style', 'card_bg', 'card_gradient', 'card_image', 'card_overlay', 'card_radius', 'card_shadow', 'text_contrast'],
    badge: ['title', 'icon', 'title_size', 'title_weight', 'title_color', 'desktop_span', 'desktop_rows', 'tablet_span', 'mobile_span', 'padding', 'align_items', 'card_style', 'card_bg', 'card_gradient', 'card_image', 'card_overlay', 'card_radius', 'card_shadow'],
    metric: ['metric_value', 'metric_prefix', 'metric_suffix', 'metric_label', 'accent_color', 'icon', 'desktop_span', 'desktop_rows', 'tablet_span', 'mobile_span', 'padding', 'align_items', 'card_style', 'card_bg', 'card_gradient', 'card_image', 'card_overlay', 'card_radius', 'card_shadow'],
    list: ['title', 'list_items', 'icon', 'title_size', 'title_weight', 'title_color', 'desktop_span', 'desktop_rows', 'tablet_span', 'mobile_span', 'padding', 'align_items', 'card_style', 'card_bg', 'card_gradient', 'card_image', 'card_overlay', 'card_radius', 'card_shadow'],
    accordion: ['title', 'description', 'title_size', 'title_weight', 'title_color', 'desktop_span', 'desktop_rows', 'tablet_span', 'mobile_span', 'padding', 'align_items', 'card_style', 'card_bg', 'card_gradient', 'card_image', 'card_overlay', 'card_radius', 'card_shadow'],
    marquee: ['title', 'title_size', 'title_weight', 'title_color', 'desktop_span', 'desktop_rows', 'tablet_span', 'mobile_span', 'padding', 'align_items', 'card_style', 'card_bg', 'card_gradient', 'card_image', 'card_overlay', 'card_radius', 'card_shadow'],
    card: ['title', 'description', 'icon', 'title_size', 'title_weight', 'title_color', 'description_size', 'desktop_span', 'desktop_rows', 'tablet_span', 'mobile_span', 'padding', 'align_items', 'card_style', 'card_bg', 'card_gradient', 'card_image', 'card_overlay', 'card_radius', 'card_shadow', 'text_contrast']
  };

  const shouldShowFieldForType = (field: any) => {
    const visibleFields = visibleFieldsByType[selectedType] || visibleFieldsByType.text;
    return visibleFields.includes(field.id);
  };

  const settingsByPillar: Record<string, { label: string, setting: any, contextId: string }[]> = {};

  moduleDef.elements.forEach((element: any) => {
    if (element.id !== 'el_bento_items' || !element.settings) return;

    Object.entries(element.settings).forEach(([pillar, settings]) => {
      let targetPillar = pillar;
      if (pillar === 'title' || pillar === 'subtitle' || pillar === 'eyebrow') targetPillar = 'contenido';
      if (!settingsByPillar[targetPillar]) settingsByPillar[targetPillar] = [];

      (settings as any[]).forEach((setting) => {
        const cellSettings = setting.type === 'repeater' && Array.isArray(setting.fields) ? setting.fields : [setting];
        cellSettings.filter(shouldShowFieldForType).forEach((field: any) => {
          settingsByPillar[targetPillar].push({
            label: field.label,
            setting: field,
            contextId: `${selectedSection.id}_${element.id}_${selectedBentoCellIndex}`
          });
        });
      });
    });
  });

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
      newItems[index] = { ...newItems[index], [settingId]: value, ...textStylePreset };
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
    if (!show.result) return null;

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
          disabled={selectedLayout.y <= 0}
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
          disabled={selectedLayout.x <= 0}
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
          disabled={selectedLayout.x + selectedLayout.w >= activeColumns}
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
          className="flex h-8 items-center justify-center rounded-lg border border-blue-100 bg-white text-blue-600 transition hover:bg-blue-100"
          title="Mover abajo"
          aria-label="Mover abajo"
        >
          <LucideIcons.ArrowDown size={14} />
        </button>
        <span />
      </div>
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
            {PILLARS_ORDER.map(pillar => {
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
          </div>
          {PILLARS_ORDER.map(pillar => {
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
