import React from 'react';
import {
  Layers,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Layout,
  GripVertical,
  Trash2,
  Link,
  Image as ImageIcon,
  Type,
  Database,
  Box,
  Star,
  MousePointer2,
  Settings,
  Sparkles,
  Copy,
  Eye,
  EyeOff,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EditorState, WebModule, ModuleElement, SettingGroupType } from '../../types/constructor';
import { Product, Customer, TrustedCompanyLogo } from '../../types/schema';
import { useEditorStore } from '../../store/editorStore';
import { MODULE_INFO, GROUP_LABELS, BENTO_MODULE } from './registry';
import { SettingControl } from './SettingControl';
import { GlobalSettingsPanel } from './GlobalSettingsPanel';
import { BentoCellEditor } from './BentoCellEditor';
import { resolveModuleDisplayLabel } from '../../utils/menuNavigation';
import {
  addCompositionElement,
  buildCompositionTree,
  deleteCompositionElement,
  duplicateCompositionElement,
  getCompositionElementLabel,
  humanizeCompositionType,
  moveCompositionElement,
  resolveCompositionSchema,
  stringifyCompositionSchema,
  CompositionTreeNode
} from '../../utils/compositionEditorUtils';
import {
  COMPOSITION_SCHEMA_DEEP_KEY,
  CompositionElementType,
  CompositionSectionSchema
} from '../../types/compositionSchema';

const COMPOSITION_ADDABLE_TYPES: CompositionElementType[] = [
  'heading',
  'paragraph',
  'button',
  'image',
  'card',
  'container',
  'badge',
  'list',
  'divider'
];

const BENTO_ELEMENT_OPTIONS = [
  { type: 'text', label: 'Texto', icon: <Type size={14} /> },
  { type: 'visual', label: 'Imagen', icon: <ImageIcon size={14} /> },
  { type: 'button', label: 'Botón', icon: <MousePointer2 size={14} /> },
  { type: 'icon', label: 'Ícono', icon: <Sparkles size={14} /> },
  { type: 'badge', label: 'Badge', icon: <Star size={14} /> },
  { type: 'metric', label: 'Métrica', icon: <Database size={14} /> },
  { type: 'list', label: 'Lista', icon: <Layers size={14} /> },
  { type: 'accordion', label: 'Acordeón', icon: <ChevronDown size={14} /> },
  { type: 'marquee', label: 'Cinta animada', icon: <Sparkles size={14} /> },
  { type: 'card', label: 'Tarjeta simple', icon: <Box size={14} /> }
];

const BENTO_DESKTOP_COLUMNS = 24;
const BENTO_MIN_DESKTOP_COLUMNS = 12;
const BENTO_MAX_DESKTOP_COLUMNS = 32;
const BENTO_TABLET_COLUMNS = 6;
const BENTO_MOBILE_COLUMNS = 4;
const BENTO_BASE_VISIBLE_ROWS = 7;
const BENTO_MAX_EDITABLE_ROWS = 240;
const DEFAULT_SETTING_GROUP_ORDER = Object.keys(GROUP_LABELS) as SettingGroupType[];

const uniqueSettingGroups = (groups: SettingGroupType[]) => Array.from(new Set(groups));

const getOrderedSettingGroups = (module: WebModule, element: ModuleElement): SettingGroupType[] => {
  const hasModuleGlobalOrder = element.type === 'global' && !!module.globalGroups?.length;

  if (!hasModuleGlobalOrder) {
    return DEFAULT_SETTING_GROUP_ORDER;
  }

  const globalGroupsWithSettings = DEFAULT_SETTING_GROUP_ORDER.filter(
    (group) => !!module.globalSettings?.[group]?.length
  );

  return uniqueSettingGroups([
    ...module.globalGroups,
    ...globalGroupsWithSettings
  ]);
};

const clampBentoDesktopColumns = (value: any) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return BENTO_DESKTOP_COLUMNS;
  return Math.min(BENTO_MAX_DESKTOP_COLUMNS, Math.max(BENTO_MIN_DESKTOP_COLUMNS, Math.round(parsed)));
};

const getBentoDesktopColumns = (settingsValues: Record<string, any>, moduleId: string) => (
  clampBentoDesktopColumns(settingsValues?.[`${moduleId}_global_columns`])
);

const getBentoElementOption = (type?: string) => {
  const normalizedType = type === 'image' ? 'visual' : type === 'cta' ? 'button' : type === 'stat' ? 'metric' : type;
  return BENTO_ELEMENT_OPTIONS.find((option) => option.type === normalizedType) || BENTO_ELEMENT_OPTIONS[0];
};

const createBentoCellId = () => {
  const randomId = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
  return `bento_cell_${randomId}`;
};

const getBentoPlacementLayout = (item: any, breakpoint: 'desktop' | 'tablet' | 'mobile', cols: number) => {
  const savedLayout = item.layouts?.[breakpoint];
  const declaredColumns = Number(savedLayout?.columns || item.layout_columns?.[breakpoint] || 0);
  const shouldScaleLegacyDesktop = breakpoint === 'desktop'
    && (declaredColumns > 0 ? declaredColumns < cols : cols === BENTO_DESKTOP_COLUMNS);
  const width = breakpoint === 'mobile'
    ? (item.mobile_span || item.col_span || 4)
    : breakpoint === 'tablet'
      ? (item.tablet_span || item.col_span || 2)
      : (item.desktop_span || item.col_span || 4);
  const height = breakpoint === 'mobile' ? (item.mobile_rows || item.row_span || 2) : (item.desktop_rows || item.row_span || 2);
  const rawX = Number(savedLayout?.x ?? item.x ?? 0) || 0;
  const rawW = Number(savedLayout?.w ?? width) || 1;
  const normalizedW = Math.min(shouldScaleLegacyDesktop ? rawW * 2 : rawW, cols);

  return {
    x: Math.min(shouldScaleLegacyDesktop ? rawX * 2 : rawX, Math.max(cols - normalizedW, 0)),
    y: Number(savedLayout?.y ?? item.y ?? 0) || 0,
    w: normalizedW,
    h: Number(savedLayout?.h ?? height) || 1
  };
};

const findFirstFreeBentoPosition = (
  existingItems: any[],
  width: number,
  height: number,
  cols: number,
  breakpoint: 'desktop' | 'tablet' | 'mobile'
) => {
  const normalizedWidth = Math.min(width, cols);
  const collides = (
    candidate: { x: number; y: number; w: number; h: number },
    existing: { x: number; y: number; w: number; h: number }
  ) => (
    candidate.x < existing.x + existing.w &&
    candidate.x + candidate.w > existing.x &&
    candidate.y < existing.y + existing.h &&
    candidate.y + candidate.h > existing.y
  );

  const occupied = existingItems.map((item) => getBentoPlacementLayout(item, breakpoint, cols));

  for (let y = 0; y < BENTO_MAX_EDITABLE_ROWS; y += 1) {
    for (let x = 0; x <= cols - normalizedWidth; x += 1) {
      const candidate = { x, y, w: normalizedWidth, h: height };
      if (!occupied.some((entry) => collides(candidate, entry))) {
        return { x, y };
      }
    }
  }

  const maxY = occupied.length > 0 ? Math.max(...occupied.map((entry) => entry.y + entry.h)) : 0;
  return { x: 0, y: maxY };
};

const getBentoOccupiedRows = (
  items: any[],
  breakpoint: 'desktop' | 'tablet' | 'mobile',
  cols: number
) => Math.ceil(items.reduce((maxRows: number, item: any) => {
  const layout = getBentoPlacementLayout(item, breakpoint, cols);
  return Math.max(maxRows, layout.y + Math.max(layout.h, 1));
}, 0));

const normalizeBentoWorkspaceRows = (currentValue: any, items: any[], desktopColumns = BENTO_DESKTOP_COLUMNS) => {
  const currentRows = typeof currentValue === 'object' && currentValue !== null ? currentValue : {};
  const nextRows = {
    ...currentRows,
    desktop: Math.min(
      BENTO_MAX_EDITABLE_ROWS,
      Math.max(BENTO_BASE_VISIBLE_ROWS, getBentoOccupiedRows(items, 'desktop', desktopColumns))
    ),
    tablet: Math.min(
      BENTO_MAX_EDITABLE_ROWS,
      Math.max(BENTO_BASE_VISIBLE_ROWS, getBentoOccupiedRows(items, 'tablet', BENTO_TABLET_COLUMNS))
    ),
    mobile: Math.min(
      BENTO_MAX_EDITABLE_ROWS,
      Math.max(BENTO_BASE_VISIBLE_ROWS, getBentoOccupiedRows(items, 'mobile', BENTO_MOBILE_COLUMNS))
    )
  };

  return nextRows;
};

const createBentoPanelElementPreset = (kind: string, existingItems: any[], desktopColumns = BENTO_DESKTOP_COLUMNS) => {
  const withLayout = (item: any, desktopW: number, desktopH: number, tabletW = Math.min(desktopW, BENTO_TABLET_COLUMNS), mobileW = BENTO_MOBILE_COLUMNS) => {
    const safeDesktopW = Math.min(desktopW, desktopColumns);
    const desktopPos = findFirstFreeBentoPosition(existingItems, safeDesktopW, desktopH, desktopColumns, 'desktop');
    const tabletPos = findFirstFreeBentoPosition(existingItems, tabletW, desktopH, BENTO_TABLET_COLUMNS, 'tablet');
    const mobilePos = findFirstFreeBentoPosition(existingItems, mobileW, desktopH, BENTO_MOBILE_COLUMNS, 'mobile');

    return {
      id: createBentoCellId(),
      card_style: 'solid',
      card_radius: 28,
      card_shadow: 'sm',
      padding: 32,
      element_padding_y: 20,
      content_align: 'center',
      clickActionType: 'none',
      ...item,
      col_span: safeDesktopW,
      row_span: desktopH,
      desktop_span: safeDesktopW,
      desktop_rows: desktopH,
      tablet_span: tabletW,
      mobile_span: mobileW,
      x: desktopPos.x,
      y: desktopPos.y,
      layouts: {
        desktop: { x: desktopPos.x, y: desktopPos.y, w: safeDesktopW, h: desktopH, columns: desktopColumns },
        tablet: { x: tabletPos.x, y: tabletPos.y, w: tabletW, h: desktopH, columns: BENTO_TABLET_COLUMNS },
        mobile: { x: mobilePos.x, y: mobilePos.y, w: mobileW, h: desktopH, columns: BENTO_MOBILE_COLUMNS }
      },
      layout_columns: {
        desktop: desktopColumns,
        tablet: BENTO_TABLET_COLUMNS,
        mobile: BENTO_MOBILE_COLUMNS
      }
    };
  };

  switch (kind) {
    case 'visual':
      return withLayout({ type: 'visual', title: '', description: '', image: '', card_style: 'transparent', padding: 0 }, 6, 2, 3, 4);
    case 'button':
      return withLayout({ type: 'button', title: 'Haz clic aquí', button_text: 'Haz clic aquí', btn_url: '#', card_style: 'transparent', padding: 16 }, 6, 1, 3, 4);
    case 'icon':
      return withLayout({
        type: 'icon',
        title: 'Ícono destacado',
        icon_visual_type: 'icon',
        icon: 'Sparkles',
        icon_color: '#2563EB',
        icon_image: '',
        icon_image_size: 72,
        description: 'Describe brevemente este ícono.'
      }, 4, 2, 2, 4);
    case 'badge':
      return withLayout({ type: 'badge', title: 'Nuevo', icon: 'Tag', card_style: 'transparent', padding: 12 }, 4, 1, 2, 4);
    case 'metric':
      return withLayout({ type: 'metric', title: '99+', description: 'Impacto medible', metric_value: '99+', metric_label: 'Impacto', icon: 'BarChart3', accent_color: '#3B82F6' }, 6, 2, 3, 4);
    case 'list':
      return withLayout({ type: 'list', title: 'Puntos clave', description: '', list_items: ['Primer punto', 'Segundo punto', 'Tercer punto'], icon: 'ListChecks' }, 8, 3, 4, 4);
    case 'accordion':
      return withLayout({ type: 'accordion', title: 'Ver más detalles', description: 'Contenido desplegable para ampliar esta idea.', icon: 'ChevronDown' }, 8, 2, 4, 4);
    case 'marquee':
      return withLayout({ type: 'marquee', title: 'PROMO • NUEVO • 24/7', card_style: 'transparent', padding: 12 }, 16, 1, 6, 4);
    case 'card':
      return withLayout({ type: 'card', title: 'Tarjeta simple', description: 'Combina texto, estilo e imagen de fondo.', icon: 'PanelTop' }, 8, 2, 3, 4);
    case 'text':
    default:
      return withLayout({ type: 'text', text_style: 'heading', title: 'Título del texto', description: 'Escribe aquí tu contenido...', icon: 'Type' }, 8, 2, 3, 4);
  }
};

const cloneBentoValue = (value: any) => {
  try {
    return structuredClone(value);
  } catch {
    return JSON.parse(JSON.stringify(value));
  }
};

const createDuplicatedBentoItem = (sourceItem: any, existingItems: any[], desktopColumns = BENTO_DESKTOP_COLUMNS) => {
  const clonedItem = cloneBentoValue(sourceItem);
  const sourceDesktop = getBentoPlacementLayout(sourceItem, 'desktop', desktopColumns);
  const sourceTablet = getBentoPlacementLayout(sourceItem, 'tablet', BENTO_TABLET_COLUMNS);
  const sourceMobile = getBentoPlacementLayout(sourceItem, 'mobile', BENTO_MOBILE_COLUMNS);
  const resolveDuplicatePosition = (
    sourceLayout: { x: number; y: number; w: number; h: number },
    cols: number,
    breakpoint: 'desktop' | 'tablet' | 'mobile'
  ) => {
    const candidateX = Math.min(sourceLayout.x + 1, Math.max(cols - sourceLayout.w, 0));
    const candidateY = sourceLayout.y + 1;
    const candidate = { x: candidateX, y: candidateY, w: sourceLayout.w, h: sourceLayout.h };
    const occupied = existingItems.map((item) => getBentoPlacementLayout(item, breakpoint, cols));
    const collides = occupied.some((entry) => (
      candidate.x < entry.x + entry.w &&
      candidate.x + candidate.w > entry.x &&
      candidate.y < entry.y + entry.h &&
      candidate.y + candidate.h > entry.y
    ));

    return collides
      ? findFirstFreeBentoPosition(existingItems, sourceLayout.w, sourceLayout.h, cols, breakpoint)
      : { x: candidateX, y: candidateY };
  };

  const desktopPos = resolveDuplicatePosition(sourceDesktop, desktopColumns, 'desktop');
  const tabletPos = resolveDuplicatePosition(sourceTablet, BENTO_TABLET_COLUMNS, 'tablet');
  const mobilePos = resolveDuplicatePosition(sourceMobile, BENTO_MOBILE_COLUMNS, 'mobile');

  return {
    ...clonedItem,
    id: createBentoCellId(),
    admin_label: clonedItem.admin_label ? `${clonedItem.admin_label} copia` : undefined,
    x: desktopPos.x,
    y: desktopPos.y,
    col_span: sourceDesktop.w,
    row_span: sourceDesktop.h,
    desktop_span: sourceDesktop.w,
    desktop_rows: sourceDesktop.h,
    tablet_span: sourceTablet.w,
    mobile_span: sourceMobile.w,
    layouts: {
      ...(clonedItem.layouts || {}),
      desktop: { x: desktopPos.x, y: desktopPos.y, w: sourceDesktop.w, h: sourceDesktop.h, columns: desktopColumns },
      tablet: { x: tabletPos.x, y: tabletPos.y, w: sourceTablet.w, h: sourceTablet.h, columns: BENTO_TABLET_COLUMNS },
      mobile: { x: mobilePos.x, y: mobilePos.y, w: sourceMobile.w, h: sourceMobile.h, columns: BENTO_MOBILE_COLUMNS }
    },
    layout_columns: {
      ...(clonedItem.layout_columns || {}),
      desktop: desktopColumns,
      tablet: BENTO_TABLET_COLUMNS,
      mobile: BENTO_MOBILE_COLUMNS
    }
  };
};

interface StructurePanelProps {
  editorState: EditorState;
  setEditorState: React.Dispatch<React.SetStateAction<EditorState>>;
  onSettingChange: (elementId: string, settingId: string, value: any) => void;
  onRemoveModule: (moduleId: string) => void;
  onDuplicateModule: (moduleId: string) => void;
  onMoveModule: (moduleId: string, direction: 'up' | 'down') => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  projectId: string | null;
  products?: Product[];
  customers?: Customer[];
  trustedCompanyLogos?: TrustedCompanyLogo[];
  isMobile?: boolean;
  activeTab?: string;
  useSplitLayout?: boolean;
  activeViewport?: 'desktop' | 'tablet' | 'mobile';
}

export const StructurePanel: React.FC<StructurePanelProps> = ({
  editorState,
  setEditorState,
  onSettingChange,
  onRemoveModule,
  onDuplicateModule,
  onMoveModule,
  isCollapsed,
  onToggleCollapse,
  projectId,
  products,
  customers,
  trustedCompanyLogos,
  isMobile,
  activeTab = 'constructor',
  useSplitLayout = false,
  activeViewport = 'desktop'
}) => {
  const {
    siteContent,
    project,
    selectedBentoCellIndex,
    setSelectedBentoCellIndex,
    selectSection,
    updateSectionSettings,
    selectedCompositionElementId,
    setSelectedCompositionElementId,
    selectCompositionElement
  } = useEditorStore();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const bentoLayerRefs = React.useRef<Record<number, HTMLDivElement | null>>({});
  const [shiningGroup, setShiningGroup] = React.useState<string | null>(null);
  const [expandedBentoItem, setExpandedBentoItem] = React.useState<number | null>(null);
  const [isBentoAddExpanded, setIsBentoAddExpanded] = React.useState(false);

  const resolveElementSettingsPrefix = React.useCallback((moduleId: string, elementId: string) => {
    if (!moduleId || !elementId) return elementId;
    if (elementId.startsWith(`${moduleId}_`)) return elementId;
    if (elementId.startsWith('el_')) return `${moduleId}_${elementId}`;
    return elementId;
  }, []);

  const isDynamicCardsRepeaterElement = React.useCallback((moduleId: string, elementId: string) => {
    const resolvedElementId = resolveElementSettingsPrefix(moduleId, elementId);
    return resolvedElementId.endsWith('_el_dynamic_cards_cards');
  }, [resolveElementSettingsPrefix]);

  const autoExpandedBentoModuleRef = React.useRef<string | null>(null);
  const shiningIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const shiningTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Effect to scroll to selected module/element
  React.useEffect(() => {
    if (isCollapsed) return;

    const targetId = editorState.selectedElementId
      ? `structure_el_${editorState.selectedElementId}`
      : editorState.expandedModuleId
        ? `structure_mod_${editorState.expandedModuleId}`
        : null;

    if (targetId) {
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300); // Wait for animations
    }
  }, [editorState.expandedModuleId, editorState.selectedElementId, isCollapsed]);

  React.useEffect(() => {
    if (selectedBentoCellIndex !== null) {
      setExpandedBentoItem(selectedBentoCellIndex);
      if (typeof window === 'undefined') return;
      window.requestAnimationFrame(() => {
        bentoLayerRefs.current[selectedBentoCellIndex]?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      });
    }
  }, [selectedBentoCellIndex]);

  React.useEffect(() => {
    const activeBentoModule = editorState.addedModules.find(
      (module) => module.id === editorState.expandedModuleId && module.type === 'bento'
    );
    if (!activeBentoModule) return;
    if (autoExpandedBentoModuleRef.current === activeBentoModule.id) return;

    const bentoItems = editorState.settingsValues[`${activeBentoModule.id}_el_bento_items_items`] || [];
    if (Array.isArray(bentoItems) && bentoItems.length === 0 && selectedBentoCellIndex === null) {
      setIsBentoAddExpanded(true);
      autoExpandedBentoModuleRef.current = activeBentoModule.id;
    }
  }, [editorState.addedModules, editorState.expandedModuleId, editorState.settingsValues, selectedBentoCellIndex]);

  // Effect to handle shining animation
  React.useEffect(() => {
    // Only start shining if:
    // 1. A module was recently added (recentlyAddedModuleId is set)
    // 2. It's one of the first 3 modules added (totalModulesAdded <= 3)
    // 3. No group is currently expanded
    const isRecentlyAdded = editorState.recentlyAddedModuleId === editorState.expandedModuleId;
    const isWithinFirstThree = (editorState.totalModulesAdded || 0) <= 3;

    if (editorState.expandedModuleId && editorState.selectedElementId && isRecentlyAdded && isWithinFirstThree) {
      const elementId = editorState.selectedElementId;
      const module = editorState.addedModules.find(m => m.id === editorState.expandedModuleId);
      const element = module?.elements.find(e => e.id === elementId) ||
                      (elementId.endsWith('_global') ? { id: elementId, groups: module?.globalGroups || [] } : null);

      const availableGroups = element?.groups || [];
      const currentExpandedGroup = editorState.expandedGroupsByElement[elementId];

      if (availableGroups.length > 0 && !currentExpandedGroup) {
        let currentIndex = 0;
        setShiningGroup(availableGroups[0]);

        if (shiningIntervalRef.current) clearInterval(shiningIntervalRef.current);
        if (shiningTimeoutRef.current) clearTimeout(shiningTimeoutRef.current);

        shiningIntervalRef.current = setInterval(() => {
          const nextIndex = Math.floor(Math.random() * availableGroups.length);
          setShiningGroup(availableGroups[nextIndex]);
        }, 1500);

        // Auto-stop after 5 seconds
        shiningTimeoutRef.current = setTimeout(() => {
          stopShining();
          // Clear recentlyAddedModuleId from state to prevent re-triggering
          setEditorState(prev => ({ ...prev, recentlyAddedModuleId: null }));
        }, 5000);
      } else {
        setShiningGroup(null);
        if (shiningIntervalRef.current) {
          clearInterval(shiningIntervalRef.current);
          shiningIntervalRef.current = null;
        }
        if (shiningTimeoutRef.current) {
          clearTimeout(shiningTimeoutRef.current);
          shiningTimeoutRef.current = null;
        }
      }
    } else {
      setShiningGroup(null);
      if (shiningIntervalRef.current) {
        clearInterval(shiningIntervalRef.current);
        shiningIntervalRef.current = null;
      }
      if (shiningTimeoutRef.current) {
        clearTimeout(shiningTimeoutRef.current);
        shiningTimeoutRef.current = null;
      }
    }

    return () => {
      if (shiningIntervalRef.current) clearInterval(shiningIntervalRef.current);
      if (shiningTimeoutRef.current) clearTimeout(shiningTimeoutRef.current);
    };
  }, [editorState.expandedModuleId, editorState.selectedElementId, editorState.expandedGroupsByElement, editorState.recentlyAddedModuleId, editorState.totalModulesAdded]);

  const stopShining = () => {
    setShiningGroup(null);
    if (shiningIntervalRef.current) {
      clearInterval(shiningIntervalRef.current);
      shiningIntervalRef.current = null;
    }
    if (shiningTimeoutRef.current) {
      clearTimeout(shiningTimeoutRef.current);
      shiningTimeoutRef.current = null;
    }
    // Also clear the flag in global state if it exists
    if (editorState.recentlyAddedModuleId) {
      setEditorState(prev => ({ ...prev, recentlyAddedModuleId: null }));
    }
  };

  // Extract project theme colors for the ColorPicker
  const getProjectColors = () => {
    const projectBrandColors = [
      project?.brandColors?.primary,
      project?.brandColors?.secondary,
      project?.brandColors?.accent
    ].filter(Boolean) as string[];

    if (projectBrandColors.length > 0) {
      return Array.from(new Set(projectBrandColors));
    }

    const settings = editorState.settingsValues;
    const colors = [
      settings['global_theme_primary_color'],
      settings['global_theme_secondary_color'],
      settings['global_theme_accent_color'],
    ].filter(Boolean) as string[];

    // Add default solutium primary if not exists
    if (colors.length === 0) return ['#3B82F6', '#8B5CF6', '#1E293B'];

    return Array.from(new Set(colors));
  };

  const projectColors = getProjectColors();

  const toggleModule = (moduleId: string) => {
    stopShining();
    setSelectedCompositionElementId(null);
    setEditorState(prev => ({
      ...prev,
      expandedModuleId: prev.expandedModuleId === moduleId ? null : moduleId
    }));
  };

  const toggleElement = (elementId: string) => {
    stopShining();
    setSelectedCompositionElementId(null);
    setEditorState(prev => ({
      ...prev,
      selectedElementId: prev.selectedElementId === elementId ? null : elementId
    }));
  };

  const toggleGroup = (elementId: string, group: SettingGroupType) => {
    stopShining();
    setEditorState(prev => ({
      ...prev,
      expandedGroupsByElement: {
        ...prev.expandedGroupsByElement,
        [elementId]: prev.expandedGroupsByElement[elementId] === group ? null : group
      }
    }));
  };

  const updateCompositionSchema = (
    moduleId: string,
    schema: CompositionSectionSchema,
    nextSelectedElementId?: string | null
  ) => {
    onSettingChange(moduleId, COMPOSITION_SCHEMA_DEEP_KEY, stringifyCompositionSchema(schema));
    if (nextSelectedElementId !== undefined) {
      selectCompositionElement(moduleId, nextSelectedElementId);
      setEditorState(prev => ({ ...prev, expandedModuleId: moduleId, selectedElementId: null }));
    }
  };

  const renderCompositionNode = (
    moduleId: string,
    schema: CompositionSectionSchema,
    node: CompositionTreeNode,
    depth = 0
  ): React.ReactNode => {
    const { element, children } = node;
    const isSelected = selectedCompositionElementId === element.id;
    const isHidden =
      element.visibility?.desktop === false &&
      element.visibility?.tablet === false &&
      element.visibility?.mobile === false;

    return (
      <div key={element.id} className="space-y-1">
        <div className={`rounded-lg border transition-all ${
          isSelected
            ? 'bg-primary/10 border-primary/30 text-primary'
            : 'bg-surface border-border/30 hover:bg-secondary text-text/70'
        } ${isHidden ? 'opacity-50' : ''}`}>
          <button
            type="button"
            onClick={() => {
              selectCompositionElement(moduleId, isSelected ? null : element.id);
              setEditorState(prev => ({ ...prev, expandedModuleId: moduleId, selectedElementId: null }));
            }}
            className="w-full flex items-center gap-2 p-2 text-left"
            style={{ paddingLeft: `${8 + depth * 14}px` }}
          >
            <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black ${
              isSelected ? 'bg-primary text-white' : 'bg-secondary text-text/40'
            }`}>
              {getElementIcon(element.type)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold truncate">{getCompositionElementLabel(element)}</p>
              <p className="text-[9px] uppercase tracking-wide opacity-60">{humanizeCompositionType(element.type)}</p>
            </div>
            {isHidden && <EyeOff size={12} className="shrink-0 opacity-70" />}
          </button>
          <div className="flex items-center justify-end gap-1 px-2 pb-2">
            <button
              type="button"
              title="Mover arriba"
              onClick={(event) => {
                event.stopPropagation();
                updateCompositionSchema(moduleId, moveCompositionElement(schema, element.id, 'up'));
              }}
              className="p-1 rounded hover:bg-secondary"
            >
              <ChevronUp size={12} />
            </button>
            <button
              type="button"
              title="Mover abajo"
              onClick={(event) => {
                event.stopPropagation();
                updateCompositionSchema(moduleId, moveCompositionElement(schema, element.id, 'down'));
              }}
              className="p-1 rounded hover:bg-secondary"
            >
              <ChevronDown size={12} />
            </button>
            <button
              type="button"
              title={isHidden ? 'Mostrar' : 'Ocultar'}
              onClick={(event) => {
                event.stopPropagation();
                const visible = isHidden;
                updateCompositionSchema(
                  moduleId,
                  {
                    ...schema,
                    elements: schema.elements.map((current) => (
                      current.id === element.id
                        ? { ...current, visibility: { desktop: visible, tablet: visible, mobile: visible } }
                        : current
                    ))
                  },
                  element.id
                );
              }}
              className="p-1 rounded hover:bg-secondary"
            >
              {isHidden ? <Eye size={12} /> : <EyeOff size={12} />}
            </button>
            <button
              type="button"
              title="Duplicar"
              onClick={(event) => {
                event.stopPropagation();
                const result = duplicateCompositionElement(schema, element.id);
                updateCompositionSchema(moduleId, result.schema, result.selectedElementId);
              }}
              className="p-1 rounded hover:bg-secondary"
            >
              <Copy size={12} />
            </button>
            <button
              type="button"
              title="Eliminar"
              onClick={(event) => {
                event.stopPropagation();
                const result = deleteCompositionElement(schema, element.id);
                updateCompositionSchema(moduleId, result.schema, result.selectedElementId);
              }}
              className="p-1 rounded hover:bg-rose-50 hover:text-rose-600"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
        {children.length > 0 && (
          <div className="ml-2 border-l border-border/30 pl-1 space-y-1">
            {children.map((child) => renderCompositionNode(moduleId, schema, child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const toggleMenuLink = (moduleId: string) => {
    const menuModule = editorState.addedModules.find(m => m.type === 'navegacion' || m.type === 'menu');
    if (!menuModule) return;

    const module = editorState.addedModules.find(m => m.id === moduleId);
    const isUtilityModule = module
      ? ['navegacion', 'menu', 'espaciador', 'footer'].includes(module.type) ||
        module.id.startsWith('mod_header_1') ||
        module.id.startsWith('mod_menu_1') ||
        module.id.startsWith('mod_footer_1')
      : true;
    if (!module || isUtilityModule) return;

    const currentState = isModuleLinked(moduleId);
    onSettingChange(moduleId, 'global_show_in_menu', !currentState);
  };

  const isModuleLinked = (moduleId: string) => {
    const module = editorState.addedModules.find(m => m.id === moduleId);
    if (!module) return false;

    const isUtilityModule =
      ['navegacion', 'menu', 'espaciador', 'footer'].includes(module.type) ||
      module.id.startsWith('mod_header_1') ||
      module.id.startsWith('mod_menu_1') ||
      module.id.startsWith('mod_footer_1');

    if (isUtilityModule) return false;

    const rawValue = editorState.settingsValues[`${moduleId}_global_show_in_menu`];
    if (rawValue === undefined || rawValue === null) return true;
    if (typeof rawValue === 'string') {
      const normalized = rawValue.trim().toLowerCase();
      if (normalized === 'true') return true;
      if (normalized === 'false') return false;
    }
    return Boolean(rawValue);
  };

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon size={12} />;
      case 'text': return <Type size={12} />;
      case 'price': return <Database size={12} />;
      case 'badge': return <Box size={12} />;
      case 'rating': return <Star size={12} />;
      case 'button': return <MousePointer2 size={12} />;
      case 'global': return <Settings size={12} />;
      default: return <Layers size={12} />;
    }
  };

  return (
    <div className={`h-full bg-surface border-r border-border flex flex-col z-30 shadow-xl shadow-text/10 overflow-hidden transition-all duration-300 shrink-0 ${isMobile ? 'w-full' : (isCollapsed ? 'w-[70px]' : (useSplitLayout ? 'w-[calc(50vw-16rem)] min-w-[320px] max-w-[640px]' : 'w-80'))}`}>
      <div className={`p-4 flex items-center border-b border-border/60 ${isCollapsed && !isMobile ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <Layers className="text-white w-3.5 h-3.5" />
          </div>
          {(!isCollapsed || isMobile) && <span className="text-sm font-bold text-text">Estructura</span>}
        </div>
        {!isMobile && (
          <button
            onClick={onToggleCollapse}
            className="text-text/40 hover:text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors"
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
        {(activeTab === 'design-style' || activeTab === 'design-animations') ? (
          <div className="h-full">
            <GlobalSettingsPanel
              view={activeTab as any}
              settingsValues={editorState.settingsValues}
              onSettingChange={onSettingChange}
              projectId={projectId}
              project={{ id: projectId || '', name: '', brandColors: { primary: '', secondary: '' } } as any} // Minimal project object or pass it correctly
              isSidebarMode={true}
            />
          </div>
        ) : (
          <>
            {(!siteContent.sections || siteContent.sections.length === 0) && (
          <div className={`p-8 text-center space-y-4 ${isCollapsed ? 'px-2' : ''}`}>
            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto">
              <Layout className="text-text/40 w-6 h-6" />
            </div>
            {!isCollapsed && <p className="text-[11px] font-semibold text-text/60">No hay módulos añadidos aún.</p>}
          </div>
        )}

        {(editorState.addedModules || []).map((module, index) => {
          const isModuleExpanded = editorState.expandedModuleId === module.id;
          const isHeader = module.id.startsWith('mod_header_1');
          const isMenu = module.id.startsWith('mod_menu_1');
          const isFooter = module.id.startsWith('mod_footer_1');

          const canMoveUp = index > 0 && !isMenu && !isFooter;
          const canMoveDown = index < (editorState.addedModules?.length || 0) - 1 && !isHeader && !isMenu;
          const hasMultipleModules = (editorState.addedModules?.length || 0) > 1;
          const hasMenuModule = editorState.addedModules.some(m => m.type === 'navegacion' || m.type === 'menu');
          const canDuplicateModule = !isMenu && !isFooter && !['navegacion', 'menu', 'footer'].includes(module.type);
          const isMenuEligible =
            !['navegacion', 'menu', 'espaciador', 'footer'].includes(module.type) &&
            !module.id.startsWith('mod_header_1') &&
            !module.id.startsWith('mod_menu_1') &&
            !module.id.startsWith('mod_footer_1');

          const moduleInfo = (module.iconKey && MODULE_INFO[module.iconKey]) || MODULE_INFO[module.type] || { icon: Layout, label: resolveModuleDisplayLabel(module) };

          // Virtual element for global configuration
          const globalElement: ModuleElement = {
            id: module.id + '_global',
            name: 'Configuración Global',
            type: 'global',
            groups: module.globalGroups
          };

          const isBento = module.type === 'bento'
            || (module as any).templateId === 'mod_bento_1'
            || module.id.startsWith('mod_bento_1');
          const allElements = [globalElement, ...module.elements].filter((element) => (
            !isBento || (element.id !== 'el_bento_items' && element.id !== `${module.id}_el_bento_items`)
          ));
          const isCompositionSection = module.type === 'composition_section';

          return (
            <div
              key={module.id}
              id={`structure_mod_${module.id}`}
              className={`p-3 border-b border-border/30 last:border-0 ${isCollapsed ? 'px-2' : ''}`}
            >
              <div
                onClick={() => !isCollapsed && toggleModule(module.id)}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer group ${
                  isModuleExpanded && !isCollapsed
                    ? 'bg-primary/10 border-primary/20'
                    : 'bg-secondary/50 border-border/50 hover:border-border'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? moduleInfo.label : undefined}
              >
                {!isCollapsed && (
                  <>
                    {hasMultipleModules ? (
                      <div className="flex flex-col gap-0.5">
                        {canMoveUp && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onMoveModule(module.id, 'up'); }}
                            className="p-0.5 rounded hover:bg-primary/20 transition-colors text-text/40 hover:text-primary"
                          >
                            <ChevronUp size={12} />
                          </button>
                        )}
                        {canMoveDown && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onMoveModule(module.id, 'down'); }}
                            className="p-0.5 rounded hover:bg-primary/20 transition-colors text-text/40 hover:text-primary"
                          >
                            <ChevronDown size={12} />
                          </button>
                        )}
                      </div>
                    ) : (
                      <GripVertical className={isModuleExpanded ? 'text-primary/30' : 'text-text/20'} size={14} />
                    )}
                  </>
                )}

                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  isModuleExpanded && !isCollapsed ? 'bg-primary' : 'bg-surface border border-border/50'
                }`}>
                  {React.createElement(moduleInfo.icon, {
                    size: 12,
                    className: isModuleExpanded && !isCollapsed ? 'text-white' : 'text-text/40'
                  })}
                </div>

                {!isCollapsed && (
                  <>
                    <span className={`text-[14px] font-bold flex-1 truncate ${
                      isModuleExpanded ? 'text-primary' : 'text-text'
                    }`}>
                      {moduleInfo.label}
                    </span>

                    {isMenuEligible && hasMenuModule && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMenuLink(module.id);
                        }}
                        className={`p-1.5 rounded-lg transition-all ${
                          isModuleLinked(module.id)
                            ? 'text-primary bg-primary/10 opacity-100'
                            : 'text-text/35 hover:text-primary hover:bg-primary/5 opacity-70 group-hover:opacity-100'
                        }`}
                        title={isModuleLinked(module.id) ? "Quitar del menú" : "Agregar al menú"}
                      >
                        <Link size={14} />
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (canDuplicateModule) {
                          onDuplicateModule(module.id);
                        }
                      }}
                      disabled={!canDuplicateModule}
                      className={`p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${
                        canDuplicateModule
                          ? 'text-text/35 hover:text-primary hover:bg-primary/10'
                          : 'text-text/15 cursor-not-allowed'
                      }`}
                      title={canDuplicateModule ? "Duplicar módulo" : "Este módulo es único"}
                    >
                      <Copy size={14} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveModule(module.id);
                      }}
                      className="p-1.5 text-text/20 hover:text-error hover:bg-error/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Eliminar módulo"
                    >
                      <Trash2 size={14} />
                    </button>

                    <ChevronDown size={14} className={`text-text/20 transition-transform ${isModuleExpanded ? 'rotate-180 text-primary' : ''}`} />
                  </>
                )}
              </div>

              {/* Composition Section Internal Tree */}
              <AnimatePresence>
                {isModuleExpanded && isCompositionSection && !isCollapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 mb-2 p-3 bg-primary/5 rounded-2xl border border-primary/10 overflow-hidden"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Layers className="text-primary w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Elementos internos</span>
                    </div>
                    <div className="space-y-1.5">
                      {(() => {
                        const sectionContent = siteContent.sections.find((section) => section.id === module.id)?.content;
                        const schema = resolveCompositionSchema(module.id, editorState.settingsValues, sectionContent);
                        const tree = buildCompositionTree(schema);
                        const selectedElement = schema.elements.find((element) => element.id === selectedCompositionElementId);
                        const canNestInSelected = selectedElement && ['card', 'container'].includes(selectedElement.type);

                        return (
                          <>
                            <div className="mb-3 rounded-xl border border-primary/10 bg-surface p-2">
                              <div className="flex items-center gap-1 mb-2 text-[9px] font-bold uppercase tracking-wider text-text/50">
                                <Plus size={10} />
                                Agregar {canNestInSelected ? 'dentro del seleccionado' : 'a la raíz'}
                              </div>
                              <div className="grid grid-cols-3 gap-1">
                                {COMPOSITION_ADDABLE_TYPES.map((type) => (
                                  <button
                                    key={type}
                                    type="button"
                                    onClick={() => {
                                      const result = addCompositionElement(
                                        schema,
                                        type,
                                        canNestInSelected ? selectedElement!.id : null
                                      );
                                      updateCompositionSchema(module.id, result.schema, result.selectedElementId);
                                    }}
                                    className="rounded-lg border border-border/40 px-1.5 py-1 text-[9px] font-bold hover:border-primary/30 hover:text-primary transition-colors"
                                  >
                                    {humanizeCompositionType(type)}
                                  </button>
                                ))}
                              </div>
                            </div>
                            {tree.length === 0 ? (
                              <div className="p-4 border border-dashed border-border rounded-xl text-center text-[10px] text-text/40">
                                No hay elementos internos.
                              </div>
                            ) : (
                              tree.map((node) => renderCompositionNode(module.id, schema, node))
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Elements List */}
              <AnimatePresence>
                {isModuleExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-2 ml-4 border-l-2 border-border/30 pl-3 space-y-1.5 overflow-hidden"
                  >
                    {allElements.map(element => {
                      const isBentoItemsElement = isBento && element.id === `${module.id}_el_bento_items`;
                      const isElementSelected = editorState.selectedElementId === element.id
                        || (isBentoItemsElement && selectedBentoCellIndex !== null);

                      return (
                        <div
                          key={element.id}
                          id={`structure_el_${element.id}`}
                          className="space-y-1"
                        >
                          <div
                            onClick={() => {
                              if (isBento) setSelectedBentoCellIndex(null);
                              toggleElement(element.id);
                            }}
                            className={`flex items-center gap-2.5 p-2 rounded-lg border transition-all cursor-pointer ${
                              isElementSelected
                                ? 'bg-primary/5 border-primary/20'
                                : 'bg-transparent border-transparent hover:bg-secondary'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                              isElementSelected ? 'bg-primary/20 text-primary' : 'bg-secondary text-text/40'
                            }`}>
                              {getElementIcon(element.type)}
                            </div>
                            <span className={`text-[11px] font-medium flex-1 ${
                              isElementSelected ? 'text-primary' : 'text-text/60'
                            }`}>
                              {element.name}
                            </span>
                            <ChevronDown size={12} className={`text-text/20 transition-transform ${isElementSelected ? 'rotate-180 text-primary' : ''}`} />
                          </div>

                          {/* Inline Configuration Groups */}
                          <AnimatePresence>
                            {isElementSelected && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="ml-2 space-y-1 overflow-hidden pb-2"
                              >
                                {isBentoItemsElement && selectedBentoCellIndex !== null && (
                                  <div className="mb-3 overflow-hidden rounded-2xl border border-primary/15 bg-white shadow-sm">
                                    <BentoCellEditor
                                      selectedSection={module}
                                      moduleDef={BENTO_MODULE}
                                      selectedBentoCellIndex={selectedBentoCellIndex}
                                      setSelectedBentoCellIndex={(index) => {
                                        setSelectedBentoCellIndex(index);
                                        setExpandedBentoItem(index);
                                        setEditorState(prev => ({
                                          ...prev,
                                          expandedModuleId: module.id,
                                          selectedElementId: index === null ? `${module.id}_global` : `${module.id}_el_bento_items`
                                        }));
                                      }}
                                      settingsValues={editorState.settingsValues}
                                      onSettingChange={onSettingChange}
                                      updateSectionSettings={updateSectionSettings}
                                      project={project}
                                      projectColors={projectColors}
                                      title="Editar elemento Bento"
                                      activeViewport={activeViewport}
                                    />
                                  </div>
                                )}

                                {module.type === 'dynamic_cards' && isDynamicCardsRepeaterElement(module.id, element.id) && (() => {
                                  const cardsSetting = element.settings?.contenido?.find((setting) => setting.id === 'cards');
                                  if (!cardsSetting) return null;
                                  const prefix = resolveElementSettingsPrefix(module.id, element.id);

                                  return (
                                    <div className="rounded-lg border border-border/30 bg-surface p-3 shadow-sm">
                                      <SettingControl
                                        setting={cardsSetting}
                                        value={editorState.settingsValues[`${prefix}_${cardsSetting.id}`]}
                                        onChange={(val) => onSettingChange(prefix, cardsSetting.id, val)}
                                        projectId={projectId}
                                        products={products}
                                        customers={customers}
                                        trustedCompanyLogos={trustedCompanyLogos}
                                        projectColors={projectColors}
                                        contextId={prefix}
                                        moduleType={module.type}
                                        settingsValues={editorState.settingsValues}
                                      />
                                    </div>
                                  );
                                })()}

                                {!(isBentoItemsElement && selectedBentoCellIndex !== null) && getOrderedSettingGroups(module, element).map(group => {
                                  if (module.type === 'dynamic_cards' && isDynamicCardsRepeaterElement(module.id, element.id)) return null;
                                  const hasSettings = element.type === 'global'
                                    ? !!module.globalSettings?.[group]?.length
                                    : !!element.settings?.[group]?.length;
                                  const isAvailable = element.type === 'global'
                                    ? element.groups.includes(group) || hasSettings
                                    : element.groups.includes(group);

                                  if (!isAvailable || !hasSettings) return null;

                                  const isGroupExpanded = editorState.expandedGroupsByElement[element.id] === group;
                                  const isShining = shiningGroup === group;
                                  const dynamicCardsGlobalGroupLabels: Partial<Record<SettingGroupType, string>> = {
                                    title: 'Texto principal',
                                    subtitle: 'Texto secundario',
                                    description: 'Viñetas',
                                    estilo: 'CTA',
                                    multimedia: 'Fondo',
                                    estructura: 'Altura',
                                    interaccion: 'Avanzado'
                                  };
                                  const groupLabel = module.type === 'dynamic_cards' && element.type === 'global'
                                    ? dynamicCardsGlobalGroupLabels[group] || GROUP_LABELS[group]
                                    : GROUP_LABELS[group];

                                  return (
                                    <div key={group} className={`border rounded-lg bg-surface overflow-hidden shadow-sm transition-all duration-500 ${
                                      isShining ? 'border-primary shadow-[0_0_15px_rgba(59,130,246,0.5)] ring-1 ring-primary/30' : 'border-border/30'
                                    }`}>
                                      <button
                                        onClick={() => toggleGroup(element.id, group)}
                                        className={`w-full flex items-center justify-between p-2 hover:bg-secondary transition-colors relative overflow-hidden ${
                                          isShining ? 'bg-primary/5' : ''
                                        }`}
                                      >
                                        {isShining && (
                                          <motion.div
                                            initial={{ x: '-100%' }}
                                            animate={{ x: '200%' }}
                                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/2 skew-x-[-20deg]"
                                          />
                                        )}
                                        <span className={`text-[12px] transition-all relative z-10 ${
                                          isGroupExpanded || isShining ? 'font-bold text-primary' : 'font-normal text-text/60'
                                        }`}>
                                          {groupLabel}
                                        </span>
                                        <ChevronDown size={10} className={`text-text/20 transition-transform relative z-10 ${isGroupExpanded ? 'rotate-180 text-primary' : ''}`} />
                                      </button>

                                      <AnimatePresence>
                                        {isGroupExpanded && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                          >
                                            <div className="p-3 pt-0 space-y-4 border-t border-border/30 mt-1">
                                              {/* DYNAMIC SETTINGS FOR EACH GROUP */}
                                              {(() => {
                                                const evaluateCondition = (
                                                  condition: any,
                                                  currentSettings: Record<string, any>,
                                                  prefix: string,
                                                  moduleId: string
                                                ) => {
                                                  if (!condition) return { result: true };

                                                  // Try with prefix first (element-specific), then without (global/module-wide)
                                                  let val = currentSettings[`${prefix}_${condition.settingId}`];
                                                  if (val === undefined) {
                                                    const modulePrefix = `${moduleId}_global`;
                                                    val = currentSettings[`${modulePrefix}_${condition.settingId}`];
                                                  }

                                                  const op = condition.operator || 'eq';
                                                  let result = false;

                                                  switch (op) {
                                                    case 'eq': result = val === condition.value; break;
                                                    case 'neq': result = val !== condition.value; break;
                                                    case 'includes': result = Array.isArray(val) && val.includes(condition.value); break;
                                                    case 'not_includes': result = !Array.isArray(val) || !val.includes(condition.value); break;
                                                  }

                                                  return { result, message: condition.message };
                                                };

                                                const settingsToRender = element.type === 'global'
                                                  ? module.globalSettings?.[group]
                                                  : element.settings?.[group];

                                                return settingsToRender?.map((setting, settingIndex) => {
                                                  const prefix = resolveElementSettingsPrefix(module.id, element.id);
                                                  const show = evaluateCondition(setting.showIf, editorState.settingsValues, prefix, module.id);
                                                  if (!show.result) return null;

                                                  const disabled = evaluateCondition(setting.disabledIf, editorState.settingsValues, prefix, module.id);
                                                  const finalSetting = {
                                                    ...setting,
                                                    disabledMessage: !disabled.result ? undefined : (disabled.message || setting.disabledMessage)
                                                  };
                                                  const showDynamicCardsSubsection = module.type === 'dynamic_cards' &&
                                                    element.type === 'global' &&
                                                    setting.subsection &&
                                                    settingsToRender[settingIndex - 1]?.subsection !== setting.subsection;

                                                  return (
                                                    <React.Fragment key={setting.id}>
                                                      {showDynamicCardsSubsection && (
                                                        <div className="border-t border-border/40 pt-3 first:border-t-0 first:pt-0">
                                                          <p className="text-[9px] font-black uppercase tracking-wider text-primary/70">
                                                            {setting.subsection}
                                                          </p>
                                                        </div>
                                                      )}
                                                      <SettingControl
                                                        setting={finalSetting}
                                                        value={editorState.settingsValues[`${prefix}_${setting.id}`]}
                                                        onChange={(val) => onSettingChange(prefix, setting.id, val)}
                                                        projectId={projectId}
                                                        products={products}
                                                        customers={customers}
                                                        trustedCompanyLogos={trustedCompanyLogos}
                                                        projectColors={projectColors}
                                                        contextId={prefix}
                                                        moduleType={module.type}
                                                        settingsValues={editorState.settingsValues}
                                                        availableModules={editorState.addedModules}
                                                      />
                                                    </React.Fragment>
                                                  );
                                                });
                                              })()}

                                              {/* Fallback if no settings defined for this group */}
                                              {((element.type === 'global' && !module.globalSettings?.[group]?.length) ||
                                                (element.type !== 'global' && !element.settings?.[group]?.length)) && (
                                                <p className="text-[10px] text-text/40 italic pt-2">No hay opciones disponibles para este grupo.</p>
                                              )}
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Add design elements */}
              <AnimatePresence>
                {isModuleExpanded && isBento && !isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 mb-2"
                  >
                    <div className="rounded-2xl border border-primary/10 bg-primary/5 p-2">
                      <button
                        type="button"
                        onClick={() => setIsBentoAddExpanded((expanded) => !expanded)}
                        className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left transition-colors hover:bg-primary/10"
                        aria-expanded={isBentoAddExpanded}
                      >
                        <Sparkles className="h-3 w-3 text-primary" />
                        <span className="flex-1 text-[11px] font-bold text-primary">Agregar elemento</span>
                        <ChevronDown size={14} className={`text-primary/60 transition-transform ${isBentoAddExpanded ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence initial={false}>
                        {isBentoAddExpanded && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <div className="px-2 pb-2 pt-1">
                              <p className="mb-3 text-[10px] text-text/50">Agrega elementos para construir tu diseño.</p>
                              <div className="grid grid-cols-2 gap-2">
                                {BENTO_ELEMENT_OPTIONS.map((item) => (
                                  <div
                                    key={item.type}
                                    draggable={false}
                                    unselectable="on"
                                    onClick={() => {
                                      const bentoItems = editorState.settingsValues[`${module.id}_el_bento_items_items`] || [];
                                      const desktopColumns = getBentoDesktopColumns(editorState.settingsValues, module.id);
                                      const newItem = createBentoPanelElementPreset(item.type, bentoItems, desktopColumns);
                                      const newItems = [...bentoItems, newItem];
                                      const nextWorkspaceRows = normalizeBentoWorkspaceRows(
                                        editorState.settingsValues[`${module.id}_el_bento_items_workspace_rows`],
                                        newItems,
                                        desktopColumns
                                      );
                                      onSettingChange(`${module.id}_el_bento_items`, 'items', newItems);
                                      onSettingChange(`${module.id}_el_bento_items`, 'workspace_rows', nextWorkspaceRows);
                                      selectSection(module.id);
                                      setSelectedBentoCellIndex(newItems.length - 1);
                                      setEditorState(prev => ({
                                        ...prev,
                                        expandedModuleId: module.id,
                                        selectedElementId: `${module.id}_el_bento_items`
                                      }));
                                      setTimeout(() => {
                                        setExpandedBentoItem(newItems.length - 1);
                                      }, 100);
                                    }}
                                    className="flex items-center gap-2 p-2 bg-surface border border-border/50 rounded-xl cursor-pointer hover:border-primary/30 hover:shadow-md transition-all active:scale-95 group"
                                    title="Haz clic para añadir"
                                  >
                                    <div className="text-text/40 group-hover:text-primary transition-colors">
                                      {item.icon}
                                    </div>
                                    <span className="text-[10px] font-bold text-text/60 group-hover:text-text transition-colors">
                                      {item.label}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Bento Layers Navigator (Internal Structure) */}
                    <div className="mt-4 border-t border-border/20 pt-4 space-y-2">
                       <div className="flex items-center gap-2 mb-2">
                          <Layers className="text-primary w-3 h-3" />
                          <span className="text-[11px] font-bold text-text/70">Elementos</span>
                       </div>

                        {(() => {
                          const bentoItems = editorState.settingsValues[`${module.id}_el_bento_items_items`] || [];

                         if (bentoItems.length === 0) {
                           return <div className="p-4 border border-dashed border-border rounded-xl text-center text-[10px] text-text/40">No hay capas todavía</div>;
                         }

                         const visibleBentoItems = bentoItems.map((item: any, itemIndex: number) => ({ item, itemIndex }));

                         return (
                           <>
                              {visibleBentoItems.map(({ item, itemIndex }: { item: any; itemIndex: number }) => {
                                const isItemExpanded = expandedBentoItem === itemIndex;
                                const elementOption = getBentoElementOption(item.type);

                                 return (
                                  <div
                                    key={item.id || itemIndex}
                                    ref={(node) => {
                                      bentoLayerRefs.current[itemIndex] = node;
                                    }}
                                    className="space-y-1"
                                  >
                                    <div
                                      onClick={() => {
                                        const shouldCollapseEditor = isItemExpanded && selectedBentoCellIndex === itemIndex;
                                        const nextExpandedIndex = shouldCollapseEditor ? null : itemIndex;
                                        selectSection(module.id);
                                        setSelectedBentoCellIndex(itemIndex);
                                        setExpandedBentoItem(nextExpandedIndex);
                                        setEditorState(prev => ({
                                          ...prev,
                                          expandedModuleId: module.id,
                                          selectedElementId: `${module.id}_el_bento_items`
                                        }));
                                      }}
                                      className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all cursor-pointer ${
                                        isItemExpanded ? 'bg-primary/5 border-primary/20' : 'bg-surface border-border/30 hover:border-border'
                                      }`}
                                    >
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                          isItemExpanded ? 'bg-primary text-white' : 'bg-secondary text-text/40'
                                        }`}>
                                          {elementOption.icon}
                                        </div>
                                       <div className="flex-1 min-w-0">
                                          <p className={`text-[11px] font-bold truncate ${isItemExpanded ? 'text-primary' : 'text-text'}`}>
                                            {item.admin_label || item.title || `Elemento ${itemIndex + 1}`}
                                          </p>
                                           <p className="text-[9px] text-text/40 uppercase font-medium">{item.type === 'text' ? (item.text_style || 'texto') : elementOption.label}</p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-1">
                                          <button
                                            type="button"
                                            onClick={(event) => {
                                              event.stopPropagation();
                                              const desktopColumns = getBentoDesktopColumns(editorState.settingsValues, module.id);
                                              const duplicatedItem = createDuplicatedBentoItem(item, bentoItems, desktopColumns);
                                              const newItems = [...bentoItems, duplicatedItem];
                                              const duplicatedIndex = newItems.length - 1;
                                              const nextWorkspaceRows = normalizeBentoWorkspaceRows(
                                                editorState.settingsValues[`${module.id}_el_bento_items_workspace_rows`],
                                                newItems,
                                                desktopColumns
                                              );
                                              onSettingChange(`${module.id}_el_bento_items`, 'items', newItems);
                                              onSettingChange(`${module.id}_el_bento_items`, 'workspace_rows', nextWorkspaceRows);
                                              selectSection(module.id);
                                              setSelectedBentoCellIndex(duplicatedIndex);
                                              setExpandedBentoItem(duplicatedIndex);
                                              setEditorState(prev => ({
                                                ...prev,
                                                expandedModuleId: module.id,
                                                selectedElementId: `${module.id}_el_bento_items`
                                              }));
                                            }}
                                            className="rounded-lg p-1.5 text-text/30 transition-colors hover:bg-blue-50 hover:text-primary"
                                            title="Duplicar elemento"
                                            aria-label="Duplicar elemento"
                                          >
                                            <Copy size={13} />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={(event) => {
                                              event.stopPropagation();
                                              const newItems = bentoItems.filter((_: any, idx: number) => idx !== itemIndex);
                                              const desktopColumns = getBentoDesktopColumns(editorState.settingsValues, module.id);
                                              const nextWorkspaceRows = normalizeBentoWorkspaceRows(
                                                editorState.settingsValues[`${module.id}_el_bento_items_workspace_rows`],
                                                newItems,
                                                desktopColumns
                                              );
                                              onSettingChange(`${module.id}_el_bento_items`, 'items', newItems);
                                              onSettingChange(`${module.id}_el_bento_items`, 'workspace_rows', nextWorkspaceRows);
                                              if (selectedBentoCellIndex === itemIndex) {
                                                setSelectedBentoCellIndex(null);
                                              } else if (selectedBentoCellIndex !== null && selectedBentoCellIndex > itemIndex) {
                                                setSelectedBentoCellIndex(selectedBentoCellIndex - 1);
                                              }
                                              setExpandedBentoItem(null);
                                            }}
                                            className="rounded-lg p-1.5 text-text/30 transition-colors hover:bg-rose-50 hover:text-rose-500"
                                            title="Eliminar elemento"
                                            aria-label="Eliminar elemento"
                                          >
                                            <Trash2 size={13} />
                                          </button>
                                        </div>
                                        <ChevronDown size={14} className={`text-text/20 transition-transform ${isItemExpanded ? 'rotate-180 text-primary' : ''}`} />
                                     </div>

                                    <AnimatePresence>
                                      {isItemExpanded && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: 'auto', opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          className="ml-3 border-l-2 border-primary/20 pl-3 py-2 space-y-1.5 overflow-hidden"
                                        >
                                           {selectedBentoCellIndex === itemIndex && (
                                             <div className="mb-3 overflow-hidden rounded-2xl border border-primary/15 bg-white shadow-sm">
                                               <BentoCellEditor
                                                 selectedSection={module}
                                                 moduleDef={BENTO_MODULE}
                                                 selectedBentoCellIndex={selectedBentoCellIndex}
                                                 setSelectedBentoCellIndex={(index) => {
                                                   setSelectedBentoCellIndex(index);
                                                   setExpandedBentoItem(index);
                                                   setEditorState(prev => ({
                                                     ...prev,
                                                     expandedModuleId: module.id,
                                                     selectedElementId: index === null ? `${module.id}_global` : `${module.id}_el_bento_items`
                                                   }));
                                                 }}
                                                 settingsValues={editorState.settingsValues}
                                                 onSettingChange={onSettingChange}
                                                 updateSectionSettings={updateSectionSettings}
                                                 project={project}
                                                 projectColors={projectColors}
                                                 title="Editar elemento"
                                                 activeViewport={activeViewport}
                                                 embedded
                                               />
                                             </div>
                                           )}
                                         </motion.div>
                                      )}
                                    </AnimatePresence>
                                 </div>
                               );
                             })}
                           </>
                         );
                       })()}
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
    </div>
  );
};
