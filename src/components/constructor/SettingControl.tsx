import { logDebug } from '../../utils/debug';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Image as ImageIcon,
  Upload,
  Loader2,
  Check,
  X,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Italic,
  Underline,
  Strikethrough,
  CheckCircle2,
  Plus,
  Trash2,
  ShoppingBag,
  Users
} from 'lucide-react';
import { SettingDefinition } from '../../types/constructor';
import { Product, Customer, TrustedCompanyLogo } from '../../types/schema';
import { syncAsset } from '../../services/assetService';
import { TYPOGRAPHY_SCALE, FONT_WEIGHTS } from '../../constants/typography';
import { MOCK_PRODUCTS, MOCK_CUSTOMERS } from '../../constants/mockData';
import { PexelsImagePickerModal, SelectedPexelsImageMetadata } from './media/PexelsImagePickerModal';

import { normalizeSocialPlatform, SOCIAL_PLATFORMS, getIconForPlatform } from '../../utils/socialUtils';

interface SettingControlProps {
  setting: SettingDefinition;
  value: any;
  onChange: (value: any, extraUpdates?: Record<string, any>) => void;
  projectId: string | null;
  products?: Product[];
  customers?: Customer[];
  trustedCompanyLogos?: TrustedCompanyLogo[];
  projectColors?: string[]; // New prop for theme colors
  project?: any;
  contextId?: string;
  moduleType?: string;
  settingsValues?: Record<string, any>;
}

// --- REFACTORED COLOR PICKER COMPONENTS ---

const PRESET_COLORS = [
  '#3B82F6', '#2563EB', '#1D4ED8', // Blues
  '#10B981', '#059669', '#047857', // Greens
  '#F59E0B', '#D97706', '#B45309', // Ambers
  '#EF4444', '#DC2626', '#B91C1C', // Reds
  '#8B5CF6', '#7C3AED', '#6D28D9', // Purples
  '#EC4899', '#DB2777', '#BE185D', // Pinks
  '#000000', '#1E293B', '#475569', '#94A3B8', '#F8FAFC', '#FFFFFF' // Neutrals
];

const SOCIAL_ICONS = ['Facebook', 'Instagram', 'Twitter', 'Linkedin', 'Youtube', 'Github', 'Twitch', 'MessageCircle', 'Music2', 'Globe', 'Link'];

const STOCK_IMAGE_BLOCKLIST = ['logo', 'logos', 'signature', 'firma', 'brand', 'company_logo', 'trusted', 'partner'];

const ICON_CATEGORY_ORDER = [
  'Favoritos',
  'Interfaz',
  'Negocio',
  'Comercio',
  'Comunicacion',
  'Personas',
  'Media',
  'Archivos',
  'Datos',
  'Seguridad',
  'Redes',
  'Navegacion',
  'Tiempo',
  'Lugares',
  'Objetos',
  'Formas',
  'Otros'
] as const;

const ICON_CATEGORY_KEYWORDS: Array<{ category: typeof ICON_CATEGORY_ORDER[number]; keywords: string[] }> = [
  { category: 'Comunicacion', keywords: ['mail', 'message', 'messages', 'phone', 'send', 'reply', 'contact', 'inbox', 'voicemail', 'badgehelp', 'badgeinfo'] },
  { category: 'Redes', keywords: ['facebook', 'instagram', 'linkedin', 'twitter', 'youtube', 'github', 'twitch', 'dribbble', 'figma', 'slack', 'disc', 'rss', 'globe', 'share', 'wifi'] },
  { category: 'Personas', keywords: ['user', 'users', 'contact', 'person', 'baby'] },
  { category: 'Negocio', keywords: ['briefcase', 'building', 'target', 'presentation', 'handshake', 'badgecent', 'banknote', 'wallet', 'scale', 'filebadge'] },
  { category: 'Comercio', keywords: ['shopping', 'cart', 'bag', 'package', 'store', 'tag', 'receipt', 'creditcard', 'badgepercent', 'gift'] },
  { category: 'Seguridad', keywords: ['shield', 'lock', 'unlock', 'key', 'fingerprint', 'scanface', 'shieldcheck', 'shieldalert'] },
  { category: 'Datos', keywords: ['database', 'server', 'harddrive', 'cpu', 'binary', 'chart', 'barchart', 'piechart', 'activity', 'workflow', 'network', 'monitor', 'smartphone', 'tablet', 'laptop'] },
  { category: 'Media', keywords: ['image', 'camera', 'video', 'film', 'mic', 'music', 'play', 'pause', 'volume', 'radio', 'tv', 'headphones'] },
  { category: 'Archivos', keywords: ['file', 'folder', 'archive', 'book', 'bookmark', 'newspaper', 'scroll', 'clipboard', 'notebook', 'pen', 'pencil'] },
  { category: 'Tiempo', keywords: ['clock', 'calendar', 'timer', 'watch', 'hourglass', 'alarm'] },
  { category: 'Lugares', keywords: ['map', 'pin', 'route', 'compass', 'navigation', 'plane', 'car', 'bike', 'train', 'ship', 'hotel', 'house', 'home'] },
  { category: 'Formas', keywords: ['circle', 'square', 'triangle', 'hexagon', 'star', 'sparkles', 'diamond'] },
  { category: 'Navegacion', keywords: ['arrow', 'chevron', 'move', 'corner', 'expand', 'shrink', 'align', 'menu', 'panel', 'sidebar', 'layout', 'list', 'columns', 'rows'] },
  { category: 'Objetos', keywords: ['heart', 'bell', 'flame', 'sun', 'moon', 'cloud', 'umbrella', 'lamp', 'rocket', 'bot', 'trophy', 'medal', 'gem', 'palette'] },
  { category: 'Interfaz', keywords: ['plus', 'minus', 'x', 'check', 'settings', 'sliders', 'filter', 'search', 'edit', 'trash', 'copy', 'link', 'external', 'refresh', 'loader', 'ellipsis', 'mouse', 'pointer', 'toggle'] }
];

const ICON_FAVORITES = [
  'Star', 'Sparkles', 'Zap', 'Shield', 'ShieldCheck', 'CheckCircle2', 'ArrowRight',
  'Play', 'Mail', 'Phone', 'MessageCircle', 'Globe', 'Users', 'User', 'Briefcase',
  'ShoppingCart', 'Package', 'Heart', 'Award', 'Rocket', 'Target', 'Camera',
  'Image', 'Headphones', 'Clock', 'Calendar', 'MapPin', 'Link'
];

const normalizeIconName = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '');

const categorizeIconName = (iconName: string): typeof ICON_CATEGORY_ORDER[number] => {
  const normalized = normalizeIconName(iconName);
  for (const entry of ICON_CATEGORY_KEYWORDS) {
    if (entry.keywords.some(keyword => normalized.includes(keyword))) {
      return entry.category;
    }
  }
  return 'Otros';
};

const getPreferredProjectGradientColors = (projectColors?: string[]) => {
  const fallback = { color1: '#3B82F6', color2: '#8B5CF6' };
  if (!projectColors || projectColors.length === 0) return fallback;

  const [primary, secondary, accent] = projectColors;
  return {
    color1: primary || fallback.color1,
    color2: accent || secondary || primary || fallback.color2
  };
};

const shouldHidePexelsButton = (setting: SettingDefinition, moduleType?: string) => {
  if (setting.disablePexels) return true;
  const raw = `${setting.id} ${setting.label || ''} ${moduleType || ''}`.toLowerCase();
  if (moduleType === 'trusted_logos') return true;
  return STOCK_IMAGE_BLOCKLIST.some(token => raw.includes(token));
};

const getModuleIdFromContext = (contextId?: string) => {
  if (!contextId) return '';
  const markerIndex = contextId.indexOf('_el_');
  if (markerIndex > 0) return contextId.slice(0, markerIndex);
  const globalIndex = contextId.indexOf('_global');
  if (globalIndex > 0) return contextId.slice(0, globalIndex);
  return '';
};

const toBooleanSetting = (value: unknown, fallback = false) => {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return ['true', '1', 'yes', 'si'].includes(value.trim().toLowerCase());
  if (typeof value === 'number') return value === 1;
  return Boolean(value);
};

const dispatchDynamicCardsEditingEvent = (moduleId: string, active: boolean) => {
  if (!moduleId || typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('dynamic-cards-editor-focus', {
    detail: { moduleId, active }
  }));
};

const normalizeOptionList = (rawValue: any) => {
  if (Array.isArray(rawValue)) {
    return rawValue
      .map((item) => {
        if (typeof item === 'string') return item.trim();
        if (item && typeof item === 'object') return String(item.label || item.value || item.name || '').trim();
        return '';
      })
      .filter(Boolean);
  }

  return String(rawValue || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const isLikelyTransparentImageUrl = (value: unknown) => {
  const normalized = String(value || '').toLowerCase().trim();
  if (!normalized) return false;

  return (
    /\.png($|[?#])/.test(normalized) ||
    /\.svg($|[?#])/.test(normalized) ||
    normalized.includes('format=png') ||
    normalized.includes('transparent')
  );
};

const inferPexelsOrientation = (setting: SettingDefinition, moduleType?: string): 'landscape' | 'portrait' | 'square' => {
  const raw = `${setting.id} ${setting.label || ''} ${moduleType || ''}`.toLowerCase();
  if (/(avatar|team|portrait)/.test(raw)) return 'portrait';
  if (/(square|icon|card_image)/.test(raw)) return 'square';
  if (/(bg|background|hero|poster)/.test(raw)) return 'landscape';
  return 'landscape';
};

const InlineColorPicker = ({ value, onChange, label, projectColors }: { value: string, onChange: (v: string) => void, label?: string, projectColors?: string[] }) => {
  const [projectPaletteOpen, setProjectPaletteOpen] = useState(true);
  const [presetPaletteOpen, setPresetPaletteOpen] = useState(true);

  return (
    <div className="space-y-3 p-3 bg-secondary/30 rounded-2xl border border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
      {label && <p className="text-[10px] font-black text-text/30 uppercase tracking-widest">{label}</p>}
      
      {/* Project Colors Section */}
      {projectColors && projectColors.length > 0 && (
        <div className="space-y-2 pb-2 border-b border-border/30">
          <button
            type="button"
            onClick={() => setProjectPaletteOpen((prev) => !prev)}
            className="flex w-full items-center justify-between gap-2"
          >
            <p className="text-[8px] font-bold text-primary uppercase tracking-tighter">Colores del Proyecto</p>
            {projectPaletteOpen ? (
              <LucideIcons.ChevronUp size={12} className="text-primary/70" />
            ) : (
              <LucideIcons.ChevronDown size={12} className="text-primary/70" />
            )}
          </button>

          {projectPaletteOpen && (
            <div className="flex flex-wrap gap-1.5">
              {projectColors.map((color, idx) => (
                <button
                  key={`${color}-${idx}`}
                  onClick={() => onChange(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 active:scale-95 shadow-sm ${
                    value?.toLowerCase() === color.toLowerCase() 
                      ? 'border-primary ring-2 ring-primary/20 scale-110 z-10' 
                      : 'border-white hover:border-primary/30'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={() => setPresetPaletteOpen((prev) => !prev)}
          className="flex w-full items-center justify-between gap-2"
        >
          <p className="text-[8px] font-bold text-text/40 uppercase tracking-tighter">Paleta Base</p>
          {presetPaletteOpen ? (
            <LucideIcons.ChevronUp size={12} className="text-text/40" />
          ) : (
            <LucideIcons.ChevronDown size={12} className="text-text/40" />
          )}
        </button>

        {presetPaletteOpen && (
          <div className="grid grid-cols-6 gap-1.5">
            {PRESET_COLORS.map(color => (
              <button
                key={color}
                onClick={() => onChange(color)}
                className={`w-full aspect-square rounded-lg border transition-all hover:scale-110 active:scale-95 ${
                  value?.toLowerCase() === color.toLowerCase() 
                    ? 'border-primary ring-2 ring-primary/20 scale-110 z-10 shadow-sm' 
                    : 'border-black/5 hover:border-black/20'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-1 border-t border-border/30">
        <div className="relative group">
          <input 
            type="color" 
            value={value?.startsWith('#') ? value : '#3B82F6'} 
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-none p-0 overflow-hidden"
          />
          <div className="absolute inset-0 pointer-events-none rounded-xl border border-black/10 shadow-inner group-hover:border-primary/30 transition-colors" />
        </div>
        <div className="flex-1">
          <input 
            type="text" 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
            className="w-full bg-transparent text-sm font-mono font-black focus:outline-none uppercase"
          />
          <p className="text-[9px] text-text/40 font-medium">Personalizado (HEX)</p>
        </div>
      </div>
    </div>
  );
};

export const SettingControl: React.FC<SettingControlProps> = ({ 
  setting, 
  value, 
  onChange, 
  projectId, 
  products, 
  customers,
  trustedCompanyLogos,
  projectColors,
  project,
  contextId,
  moduleType,
  settingsValues
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [isPexelsOpen, setIsPexelsOpen] = useState(false);
  const [openRepeaterItems, setOpenRepeaterItems] = useState<Record<string, number | null>>({});
  const [openRepeaterSections, setOpenRepeaterSections] = useState<Record<string, string | null>>({});
  const currentValue = value !== undefined ? value : setting.defaultValue;
  const dynamicCardsBulletsTimerRef = useRef<number | null>(null);
  const dynamicCardsCommittedValueRef = useRef(currentValue);
  const dynamicCardsBulletsEditingRef = useRef(false);
  const [dynamicCardsDraftValue, setDynamicCardsDraftValue] = useState(currentValue ?? '');

  const isDisabled = setting.disabledMessage !== undefined;
  const shouldShowPexels = setting.type === 'image' && !shouldHidePexelsButton(setting, moduleType);
  const preferredOrientation = inferPexelsOrientation(setting, moduleType);
  const contextModuleId = getModuleIdFromContext(contextId);
  const shouldPauseDynamicCardsEditing =
    moduleType === 'dynamic_cards' &&
    !!contextModuleId &&
    ['text', 'textarea', 'url'].includes(setting.type || 'text');
  const shouldBufferDynamicCardsBullets =
    moduleType === 'dynamic_cards' &&
    !!contextModuleId &&
    setting.id === 'bullets' &&
    setting.type === 'textarea';

  useEffect(() => {
    dynamicCardsCommittedValueRef.current = currentValue;
    if (shouldBufferDynamicCardsBullets && !dynamicCardsBulletsEditingRef.current) {
      setDynamicCardsDraftValue(currentValue ?? '');
    }
  }, [currentValue, shouldBufferDynamicCardsBullets]);

  useEffect(() => () => {
    if (dynamicCardsBulletsTimerRef.current !== null) {
      window.clearTimeout(dynamicCardsBulletsTimerRef.current);
      dynamicCardsBulletsTimerRef.current = null;
    }
  }, []);

  const clearDynamicCardsBulletsTimer = () => {
    if (dynamicCardsBulletsTimerRef.current !== null) {
      window.clearTimeout(dynamicCardsBulletsTimerRef.current);
      dynamicCardsBulletsTimerRef.current = null;
    }
  };

  const commitDynamicCardsBullets = (nextValue: string) => {
    clearDynamicCardsBulletsTimer();
    if (dynamicCardsCommittedValueRef.current === nextValue) return;
    dynamicCardsCommittedValueRef.current = nextValue;
    onChange(nextValue);
  };

  const scheduleDynamicCardsBulletsCommit = (nextValue: string) => {
    if (!shouldBufferDynamicCardsBullets) {
      onChange(nextValue);
      return;
    }
    clearDynamicCardsBulletsTimer();
    dynamicCardsBulletsTimerRef.current = window.setTimeout(() => {
      commitDynamicCardsBullets(nextValue);
    }, 180);
  };

  const dynamicCardsEditingHandlers = shouldPauseDynamicCardsEditing
    ? {
      onFocus: () => {
        if (shouldBufferDynamicCardsBullets) {
          dynamicCardsBulletsEditingRef.current = true;
        }
        dispatchDynamicCardsEditingEvent(contextModuleId, true);
      },
      onBlur: () => {
        if (shouldBufferDynamicCardsBullets) {
          commitDynamicCardsBullets(String(dynamicCardsDraftValue ?? ''));
          dynamicCardsBulletsEditingRef.current = false;
        }
        dispatchDynamicCardsEditingEvent(contextModuleId, false);
      }
    }
    : {};

  const resolveDynamicOptions = (targetSetting: SettingDefinition, targetValue: any = currentValue) => {
    if (!targetSetting.dynamicOptionsFrom) {
      return targetSetting.options || [];
    }

    const moduleId = getModuleIdFromContext(contextId);
    const sourceKey = targetSetting.dynamicOptionsFrom.startsWith(moduleId)
      ? targetSetting.dynamicOptionsFrom
      : `${moduleId}_${targetSetting.dynamicOptionsFrom}`;
    const rawSource = settingsValues?.[sourceKey];
    const excluded = new Set((targetSetting.dynamicOptionsExclude || []).map((item) => String(item).trim().toLowerCase()));
    const values = normalizeOptionList(rawSource).filter((option) => !excluded.has(option.toLowerCase()));
    const uniqueValues = Array.from(new Set(values));
    let options = uniqueValues.map((option) => ({ label: option, value: option }));

    if (options.length === 0) {
      options = targetSetting.fallbackOptions || targetSetting.options || [];
    }

    const currentString = String(targetValue || '').trim();
    if (
      targetSetting.preserveCurrentOption &&
      currentString &&
      !options.some((option) => String(option.value) === currentString)
    ) {
      options = [{ label: `${currentString} (actual)`, value: currentString }, ...options];
    }

    return options;
  };

  const getRepeaterFieldDefaultValue = (field: SettingDefinition) => {
    if (field.type === 'select' && field.dynamicOptionsFrom) {
      return resolveDynamicOptions(field, field.defaultValue)[0]?.value ?? field.defaultValue;
    }
    return field.defaultValue;
  };

  // Helpers for Gradient parsing
  const parseGradient = (grad: string) => {
    // Expected: linear-gradient(135deg, #color1 0%, #color2 100%)
    const match = grad.match(/linear-gradient\((\d+)deg,\s*(#[a-fA-F0-9]{6}|[a-fA-F0-9]{3})\s*\d+%,\s*(#[a-fA-F0-9]{6}|[a-fA-F0-9]{3})\s*\d+%\)/);
    if (match) {
      return { angle: parseInt(match[1]), color1: match[2], color2: match[3] };
    }
    const preferred = getPreferredProjectGradientColors(projectColors);
    return { angle: 135, color1: preferred.color1, color2: preferred.color2 };
  };

  const stringifyGradient = (angle: number, c1: string, c2: string) => {
    return `linear-gradient(${angle}deg, ${c1} 0%, ${c2} 100%)`;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    const file = e.target.files?.[0];
    if (!file || !projectId) return;

    setIsUploading(true);
    try {
      const extension = file.name.split('.').pop() || 'png';
      const { url } = await syncAsset(
        { id: `asset_${Date.now()}`, projectId, metadata: { fileName: file.name } },
        'image',
        file,
        extension,
        file.type,
        file.name
      );
      onChange(url);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePexelsSelect = (imageUrl: string, metadata: SelectedPexelsImageMetadata) => {
    const extras = contextId
      ? {
          [`${contextId}_${setting.id}_media_metadata`]: metadata
        }
      : undefined;

    onChange(imageUrl, extras);
    setIsPexelsOpen(false);
  };

  switch (setting.type) {
    case 'product_selection':
    case 'customer_selection':
    case 'trusted_logo_selection':
      const isProduct = setting.type === 'product_selection';
      const isTrustedLogo = setting.type === 'trusted_logo_selection';
      const isRealProject = projectId && projectId !== 'dev-project-id';
      let availableItems: any[] = isTrustedLogo
        ? (trustedCompanyLogos || [])
        : isProduct 
        ? ((products && products.length > 0) ? products : (projectId === 'dev-project-id' ? MOCK_PRODUCTS : []))
        : ((customers && customers.length > 0) ? customers : (projectId === 'dev-project-id' ? MOCK_CUSTOMERS : []));
      
      // SIP v13.4: Filter customers with logo if requested
      if (!isProduct && !isTrustedLogo) {
        availableItems = availableItems.filter((c: any) => c.companyLogoUrl);
      }
      
      return (
        <div className={`space-y-3 ${isDisabled ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-text/60 uppercase tracking-widest">{setting.label}</label>
              {isDisabled && <span className="text-[8px] font-bold text-red-500/60 italic">{setting.disabledMessage}</span>}
            </div>
            {isProduct && isRealProject && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/5 border border-primary/10 rounded-lg">
                <LucideIcons.Database size={10} className="text-primary" />
                <span className="text-[9px] font-bold text-primary uppercase">Productos del catálogo del proyecto</span>
              </div>
            )}
            {!isProduct && !isTrustedLogo && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/5 border border-primary/10 rounded-lg">
                <LucideIcons.Info size={10} className="text-primary" />
                <span className="text-[9px] font-bold text-primary uppercase leading-tight">Solo se muestran clientes con logo de empresa</span>
              </div>
            )}
            {isTrustedLogo && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/5 border border-primary/10 rounded-lg">
                <LucideIcons.Building2 size={10} className="text-primary" />
                <span className="text-[9px] font-bold text-primary uppercase leading-tight">Empresas normalizadas desde customers del proyecto</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {availableItems.map((item: any, idx: number) => {
              const itemId = String(isTrustedLogo ? item.company_id : item.id);
              const isExplicitArray = Array.isArray(currentValue);
              const normalizedValue = isExplicitArray ? currentValue.map(id => String(id)) : [];
              
              // [FASE 4] Auditar el control visual de selección
              const isSelected = !isExplicitArray ? true : normalizedValue.includes(itemId);
              
              const imageUrl = isTrustedLogo ? item.logo_url : isProduct ? item.imageUrl : item.companyLogoUrl;
              
              return (
                <div 
                  key={itemId || `select-item-${idx}`}
                onClick={() => {
                    let newValue: string[];
                    const previousSelectedIds = isExplicitArray ? currentValue.map((id: any) => String(id)) : availableItems.map((i: any) => String(isTrustedLogo ? i.company_id : i.id));
                    
                    if (!isExplicitArray) {
                      // Transition to explicit mode
                      newValue = availableItems
                        .map((i: any) => String(isTrustedLogo ? i.company_id : i.id))
                        .filter((id: string) => id !== itemId);
                    } else {
                      // Normal toggle
                      newValue = isSelected 
                        ? normalizedValue.filter(id => id !== itemId)
                        : [...normalizedValue, itemId];
                    }

                    logDebug('[PRODUCTS_SELECTION_CLICK_FORENSIC_DEBUG]', {
                      moduleId: (setting as any).moduleId || 'unknown',
                      productIdClicked: itemId,
                      productName: item.name,
                      checkedBefore: isSelected,
                      checkedAfter: !isSelected,
                      selectedIdsBefore: previousSelectedIds,
                      selectedIdsAfter: newValue,
                      updatedKey: (setting as any).id || setting.id,
                      updatedValueCount: newValue.length,
                      timestamp: Date.now()
                    });
                    
                    // [PRODUCTS_SELECTION_WRITE_VERIFY_DEBUG]
                    const selectionTouchedKey = isProduct 
                      ? `${(setting as any).moduleId}_el_products_config_selection_touched`
                      : `${(setting as any).moduleId}_el_client_logos_data_selection_touched`;
                    const selectedProductsKey = (setting as any).id || setting.id;

                    logDebug('[PRODUCTS_SELECTION_WRITE_VERIFY_DEBUG]', {
                      moduleId: (setting as any).moduleId || 'unknown',
                      expectedSelectedIds: newValue,
                      actualSelectedIdsCount: newValue.length,
                      selectionTouched: true,
                      targetKey: selectedProductsKey,
                      touchedKey: selectionTouchedKey,
                      matches: true
                    });

                    // Set selection AND touched flag in one call
                    onChange(newValue, isTrustedLogo ? undefined : { [selectionTouchedKey]: true });
                  }}
                  className={`flex items-center gap-3 p-2.5 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden ${
                    isSelected 
                      ? 'bg-primary/5 border-primary/30 shadow-md ring-1 ring-primary/10' 
                      : 'bg-surface border-border/60 hover:bg-secondary/20 hover:border-border'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-0 right-0 w-8 h-8 bg-primary text-white flex items-center justify-center rounded-bl-2xl shadow-lg">
                      <Check size={14} strokeWidth={4} />
                    </div>
                  )}

                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-secondary flex-shrink-0 border border-border/30 shadow-inner group-hover:scale-105 transition-transform">
                    {imageUrl ? (
                      <img src={imageUrl} alt={item.name} className={`w-full h-full ${isProduct ? 'object-cover' : 'object-contain p-1'}`} referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text/10">
                        {isProduct ? <ShoppingBag size={20} /> : <Users size={20} />}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-text/30 uppercase tracking-tighter mb-0.5">
                        {isTrustedLogo ? 'Empresa' : isProduct ? (item.category || 'Sin Categoría') : 'Cliente'}
                      </span>
                      <p className={`text-[12px] font-black truncate leading-tight mb-1 ${isSelected ? 'text-primary' : 'text-text'}`}>
                         {isTrustedLogo ? item.name : item.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className={`text-[11px] font-bold ${isSelected ? 'text-primary' : 'text-text/60'}`}>
                          {isTrustedLogo ? (item.website_url || item.alt || 'Logo empresarial') : isProduct ? `${item.currency || '$'}${item.price}` : (item.company || 'Empresa')}
                        </p>
                        {isProduct && item.compareAtPrice && (
                          <p className="text-[9px] text-text/30 line-through">${item.compareAtPrice}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {availableItems.length === 0 && (
              <div className="p-8 text-center bg-secondary/50 rounded-2xl border border-dashed border-border/50 flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-text/10 shadow-sm">
                  {isTrustedLogo ? <LucideIcons.Building2 size={24} /> : isProduct ? <ShoppingBag size={24} /> : <Users size={24} />}
                </div>
                <p className="text-[10px] text-text/40 font-black uppercase tracking-widest leading-relaxed">
                  No hay {isTrustedLogo ? 'empresas con logo' : isProduct ? 'productos' : 'clientes con logo'}<br/>en el catálogo
                </p>
              </div>
            )}
          </div>
        </div>
      );
    case 'image':
      const transparentPreviewMode = isLikelyTransparentImageUrl(currentValue);
      return (
        <div className={`space-y-2 ${isDisabled ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-text/40">{setting.label}</label>
            {isDisabled && <span className="text-[8px] font-bold text-red-500/60 italic">{setting.disabledMessage}</span>}
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-[56px_minmax(0,1fr)] gap-3 items-start">
              <div className={`w-14 h-14 rounded-xl flex-shrink-0 ${transparentPreviewMode ? 'overflow-visible bg-transparent border-none shadow-none' : 'bg-secondary border border-border overflow-hidden shadow-inner'}`}>
                {currentValue ? (
                  <img src={currentValue} alt="Preview" className={`w-full h-full ${transparentPreviewMode ? 'object-contain' : 'object-cover'}`} referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text/20">
                    <ImageIcon size={20} />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="relative">
                   <input 
                    type="text" 
                    value={currentValue || ''} 
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Pega la URL de la imagen aquí..."
                    className="w-full pl-8 pr-3 py-2 border border-border rounded-xl text-[10px] font-medium focus:outline-none focus:border-primary/50 bg-white shadow-sm transition-all" 
                  />
                  <LucideIcons.Globe size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text/30" />
                </div>
                <p className="text-[9px] text-text/30">Se recomienda usar URLs seguras (https)</p>
              </div>
            </div>

            {transparentPreviewMode && (
              <div className="rounded-xl border border-primary/10 bg-primary/5 px-3 py-2">
                <p className="text-[9px] font-bold text-primary uppercase tracking-wide">PNG/SVG con transparencia detectado</p>
                <p className="mt-1 text-[9px] text-text/50 leading-relaxed">La vista previa del editor ya no muestra un contenedor sólido detrás de la imagen.</p>
              </div>
            )}

            <div className={`grid gap-2 items-stretch ${shouldShowPexels ? 'grid-cols-[minmax(0,1fr)_minmax(0,1fr)_44px]' : 'grid-cols-[minmax(0,1fr)_44px]'}`}>
              <div className="relative">
                 <button 
                  disabled={isUploading || isDisabled}
                  className="w-full h-full flex items-center justify-center gap-2 py-2 px-3 border border-dashed border-border rounded-xl text-[10px] font-bold bg-secondary/30 text-text/60 hover:bg-secondary/50 hover:border-primary/30 transition-all overflow-hidden"
                >
                  {isUploading ? (
                    <Loader2 size={12} className="animate-spin text-primary" />
                  ) : (
                    <Upload size={12} />
                  )}
                  {isUploading ? 'Subiendo...' : 'Subir Archivo'}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                </button>
              </div>
              {shouldShowPexels && (
                <button
                  type="button"
                  onClick={() => setIsPexelsOpen(true)}
                  className="px-3 py-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl hover:bg-blue-100 transition-colors text-[10px] font-bold whitespace-nowrap"
                  title="Buscar en Pexels"
                >
                  Buscar en Pexels
                </button>
              )}
              <button 
                onClick={() => onChange('')}
                disabled={!currentValue}
                className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-500 border border-red-100 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Eliminar imagen"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {shouldShowPexels && (
              <PexelsImagePickerModal
                isOpen={isPexelsOpen}
                onClose={() => setIsPexelsOpen(false)}
                onSelect={handlePexelsSelect}
                projectId={projectId}
                industry={project?.industry}
                moduleType={moduleType}
                fieldKey={setting.id}
                fieldLabel={setting.label}
                initialOrientation={preferredOrientation}
              />
            )}
          </div>
        </div>
      );
    case 'range':
      return (
        <div className={`space-y-1.5 ${isDisabled ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-text/40">{setting.label}</label>
            <div className="flex items-center gap-2">
              {isDisabled && <span className="text-[8px] font-bold text-red-500/60 italic">{setting.disabledMessage}</span>}
              <span className="text-[10px] font-medium text-primary">{currentValue}{setting.unit}</span>
            </div>
          </div>
          <input 
            type="range" 
            min={setting.min} 
            max={setting.max} 
            step={setting.step || 1}
            value={currentValue}
            disabled={isDisabled}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary" 
          />
        </div>
      );
    case 'select':
      const selectOptions = resolveDynamicOptions(setting);
      return (
        <div className={`space-y-1.5 ${isDisabled ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-text/40">{setting.label}</label>
            {isDisabled && <span className="text-[8px] font-bold text-red-500/60 italic">{setting.disabledMessage}</span>}
          </div>
          <select 
            value={currentValue}
            disabled={isDisabled}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-1.5 border border-border rounded-md text-[10px] font-medium focus:outline-none focus:border-primary/30 bg-surface"
          >
            {selectOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      );
    case 'boolean':
      return (
        <div className={`flex items-center justify-between p-1.5 bg-secondary rounded-md ${isDisabled ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-text/60">{setting.label}</span>
            {isDisabled && <span className="text-[8px] font-bold text-red-500/60 italic">{setting.disabledMessage}</span>}
          </div>
          <button 
            disabled={isDisabled}
            onClick={() => onChange(!currentValue)}
            className={`w-7 h-3.5 rounded-full relative transition-colors ${currentValue ? 'bg-primary' : 'bg-secondary-foreground/20'}`}
          >
            <div className={`absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full shadow-sm transition-all ${currentValue ? 'left-4' : 'left-0.5'}`}></div>
          </button>
        </div>
      );
    case 'color':
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-text/40 uppercase tracking-wider">{setting.label}</label>
            <button 
              onClick={() => setShowPicker(!showPicker)}
              className={`group flex items-center gap-2 px-3 py-1.5 bg-surface border rounded-xl transition-all ${
                showPicker ? 'border-primary shadow-sm bg-primary/5' : 'border-border hover:border-border/80'
              }`}
            >
              <div 
                className="w-4 h-4 rounded-full border border-black/5 shadow-inner" 
                style={{ backgroundColor: currentValue }} 
              />
              <span className="text-[11px] font-mono font-bold text-text/60 leading-none">{currentValue}</span>
              {showPicker ? <LucideIcons.ChevronUp size={12} className="text-primary" /> : <LucideIcons.ChevronDown size={12} className="text-text/30" />}
            </button>
          </div>
          
          {showPicker && (
            <InlineColorPicker value={currentValue} onChange={onChange} projectColors={projectColors} />
          )}
        </div>
      );
    case 'gradient':
      const gradData = parseGradient(currentValue);
      const isSafeGradient = (val: any) => typeof val === 'string' && !val.includes('NaN');
      const preferredGradient = getPreferredProjectGradientColors(projectColors);
      const safeGradientValue = isSafeGradient(currentValue)
        ? currentValue
        : stringifyGradient(135, preferredGradient.color1, preferredGradient.color2);

      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-text/40 uppercase tracking-wider">{setting.label}</label>
            <button 
              onClick={() => setShowPicker(!showPicker)}
              className="px-2 py-1 text-[9px] font-bold bg-secondary hover:bg-secondary/80 text-text/60 rounded transition-colors"
            >
              {showPicker ? 'Cerrar' : 'Configurar'}
            </button>
          </div>
          <div 
            className="w-full h-8 rounded-xl border border-border shadow-inner cursor-pointer overflow-hidden transition-transform active:scale-95"
            style={{ background: safeGradientValue }}
            onClick={() => setShowPicker(!showPicker)}
          />
          
          {showPicker && (
            <div className="space-y-4 p-4 bg-secondary/30 rounded-2xl border border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
               <div className="space-y-3">
                 <InlineColorPicker 
                   label="Color 1 (Inicial)"
                   value={gradData.color1} 
                   onChange={(c) => onChange(stringifyGradient(gradData.angle, c, gradData.color2))} 
                   projectColors={projectColors}
                 />
                 <InlineColorPicker 
                   label="Color 2 (Final)"
                   value={gradData.color2} 
                   onChange={(c) => onChange(stringifyGradient(gradData.angle, gradData.color1, c))} 
                   projectColors={projectColors}
                 />
               </div>

               <div className="pt-2">
                 <div className="flex items-center justify-between mb-2">
                   <label className="text-[10px] font-black text-text/30 uppercase tracking-widest">Ángulo</label>
                   <span className="text-[10px] font-bold text-primary">{gradData.angle}°</span>
                 </div>
                 <input 
                   type="range" 
                   min="0" 
                   max="360"
                   value={gradData.angle}
                   onChange={(e) => onChange(stringifyGradient(Number(e.target.value), gradData.color1, gradData.color2))}
                   className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                 />
               </div>

             </div>
          )}
        </div>
      );
    case 'icon':
      const [searchTerm, setSearchTerm] = useState('');
      const [activeIconCategory, setActiveIconCategory] = useState<string>('Favoritos');
      
      let allIconNames = Object.keys(LucideIcons).filter(name => 
        typeof (LucideIcons as any)[name] === 'function' || 
        (typeof (LucideIcons as any)[name] === 'object' && (LucideIcons as any)[name].$$typeof)
      );

      // SIP v11.5: Filter social icons if socialOnly is enabled
      if ((setting as any).socialOnly) {
        allIconNames = allIconNames.filter(name => SOCIAL_ICONS.includes(name));
      }
      
      const iconCategories = useMemo(() => {
        const grouped = new Map<string, string[]>();
        ICON_CATEGORY_ORDER.forEach(category => grouped.set(category, []));

        [...allIconNames]
          .sort((a, b) => a.localeCompare(b))
          .forEach(iconName => {
            const category = ICON_FAVORITES.includes(iconName) ? 'Favoritos' : categorizeIconName(iconName);
            const icons = grouped.get(category) || [];
            if (!icons.includes(iconName)) {
              icons.push(iconName);
              grouped.set(category, icons);
            }
          });

        if (!grouped.get('Favoritos')?.length) {
          grouped.delete('Favoritos');
        }

        return grouped;
      }, [allIconNames]);

      const normalizedSearch = searchTerm.trim().toLowerCase();

      const searchResults = useMemo(() => {
        if (!normalizedSearch) return [];
        return [...allIconNames]
          .filter(name => name.toLowerCase().includes(normalizedSearch))
          .sort((a, b) => a.localeCompare(b));
      }, [allIconNames, normalizedSearch]);

      const visibleCategories = useMemo(
        () => Array.from(iconCategories.entries()).filter(([, icons]) => icons.length > 0),
        [iconCategories]
      );

      const fallbackCategory = visibleCategories[0]?.[0] || 'Favoritos';
      const resolvedCategory = iconCategories.has(activeIconCategory) ? activeIconCategory : fallbackCategory;
      const displayedIcons = normalizedSearch ? searchResults : (iconCategories.get(resolvedCategory) || []);
      
      const SelectedIconComp = currentValue ? (LucideIcons as any)[currentValue] : null;

      return (
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text/40 uppercase tracking-wider">{setting.label}</label>
          
          <div className="relative z-10">
            <button
              onClick={() => setShowPicker(!showPicker)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                showPicker ? 'border-primary bg-primary/5' : 'border-border bg-surface hover:border-border/80'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${currentValue ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-secondary text-text/20'}`}>
                {SelectedIconComp ? <SelectedIconComp size={20} /> : <Plus size={20} />}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-[11px] font-bold text-text truncate">
                  {currentValue || 'Seleccionar Ícono'}
                </p>
                <p className="text-[9px] text-text/40 font-medium">
                  {showPicker ? 'Cerrar selector' : 'Click para cambiar'}
                </p>
              </div>
              {currentValue && (
                <div 
                  onClick={(e) => { e.stopPropagation(); onChange(''); }}
                  className="p-1.5 hover:bg-red-50 text-text/30 hover:text-red-500 rounded-lg transition-colors"
                >
                  <X size={14} />
                </div>
              )}
            </button>

            <AnimatePresence>
              {showPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="mt-2 p-3 bg-white rounded-2xl border border-slate-200 shadow-2xl space-y-3"
                >
                  <div className="px-1">
                    <input 
                      type="text" 
                      placeholder="Buscar ícono..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full p-2 text-[10px] border border-slate-100 rounded-lg bg-slate-50 focus:outline-none focus:border-primary/30"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  {!normalizedSearch && visibleCategories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 px-1">
                      {visibleCategories.map(([category]) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setActiveIconCategory(category)}
                          className={`px-2.5 py-1 rounded-full border text-[9px] font-bold transition-all ${
                            category === resolvedCategory
                              ? 'bg-primary text-white border-primary shadow-sm'
                              : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-primary/30 hover:text-primary'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="px-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[9px] font-black uppercase tracking-wider text-text/35">
                        {normalizedSearch ? `Resultados (${searchResults.length})` : `${resolvedCategory} (${displayedIcons.length})`}
                      </p>
                      {!normalizedSearch && displayedIcons.length > 20 && (
                        <p className="text-[8px] text-text/35">Desplaza para ver más</p>
                      )}
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
                    {displayedIcons.map(iconName => {
                      const IconComp = (LucideIcons as any)[iconName];
                      const isSelected = currentValue === iconName;
                      return (
                        <button
                          key={iconName}
                          onClick={() => {
                            onChange(iconName);
                            setShowPicker(false);
                            setSearchTerm('');
                          }}
                          title={iconName}
                          className={`min-h-[72px] p-2 flex flex-col items-center justify-center gap-1.5 rounded-xl transition-all ${
                            isSelected 
                              ? 'bg-primary text-white shadow-md shadow-primary/20 scale-110 z-10' 
                              : 'bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 border border-slate-100'
                          }`}
                        >
                          {IconComp ? <IconComp size={18} /> : <span className="text-[8px]">{iconName}</span>}
                          <span className={`text-[8px] leading-tight text-center break-words ${isSelected ? 'text-white/90' : 'text-slate-500'}`}>
                            {iconName}
                          </span>
                        </button>
                      );
                      })}
                    </div>
                  </div>
                  {displayedIcons.length === 0 && (
                    <div className="py-8 text-center">
                      <p className="text-[10px] text-slate-400">No se encontraron íconos.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      );

    case 'repeater':
      const items = Array.isArray(currentValue) ? currentValue : [];
      const minItems = typeof setting.min === 'number' ? setting.min : 0;
      const maxItems = typeof setting.max === 'number' ? setting.max : Infinity;
      const canRemoveItems = items.length > Math.max(0, minItems);
      const canAddItems = items.length < maxItems;
      const singularItemLabel = setting.itemLabel || 'item';
      const pluralItemLabel = setting.itemLabelPlural || `${singularItemLabel}s`;
      const formattedSingularItemLabel = singularItemLabel.charAt(0).toUpperCase() + singularItemLabel.slice(1);
      const addItemLabel = setting.addLabel || 'Agregar Item';
      const minItemsMessage = setting.minItemsMessage || 'No se puede eliminar el ultimo item';
      const limitMessage = 'Límite máximo alcanzado';
      const fieldsBySection = (setting.fields || []).reduce<Record<string, SettingDefinition[]>>((acc, field) => {
        const sectionName = field.subsection || 'General';
        acc[sectionName] = acc[sectionName] || [];
        acc[sectionName].push(field);
        return acc;
      }, {});
      const sectionEntries = Object.entries(fieldsBySection);
      const shouldUseFieldSections = !!setting.useFieldSections && sectionEntries.length > 1;
      const moduleId = getModuleIdFromContext(contextId);
      const repeaterStateKey = `${contextId || 'root'}_${setting.id}`;
      const isDynamicCardsAnimationLocked = moduleType === 'dynamic_cards' &&
        toBooleanSetting(settingsValues?.[`${moduleId}_global_use_global_effect`], true);
      const isDynamicCardsTextLocked = moduleType === 'dynamic_cards' &&
        toBooleanSetting(settingsValues?.[`${moduleId}_global_use_global_text_styles`], true);
      const isDynamicCardsBackgroundLocked = moduleType === 'dynamic_cards' &&
        toBooleanSetting(settingsValues?.[`${moduleId}_global_use_global_background`], true);
      const dynamicCardsAnimationLockMessage = 'Las animaciones por tarjeta están deshabilitadas porque se está usando la configuración global. Desactiva \'Usar animaciones globales\' en Configuración Global para personalizarlas por tarjeta.';
      const dynamicCardsTextLockMessage = 'Los estilos de texto por tarjeta están deshabilitados porque se está usando la configuración global. Desactiva \'Usar estilos de texto globales\' en Configuración Global para personalizarlos por tarjeta.';
      const dynamicCardsBackgroundLockMessage = 'El fondo por tarjeta está deshabilitado porque se está usando el fondo global. Desactiva \'Usar fondo global\' en Configuración Global para personalizarlo por tarjeta.';
      const dynamicCardsTextStyleFields = new Set([
        'titleSize', 'titleWeight', 'titleColor', 'titleAlign', 'titleLineHeight', 'titleLetterSpacing',
        'bulletIcon', 'bodySize', 'bodyWeight', 'bodyColor', 'bodyAlign', 'ctaSize', 'ctaColor'
      ]);
      const dynamicCardsBackgroundFields = new Set([
        'backgroundType', 'bgColor', 'gradientFrom', 'gradientTo', 'gradientDirection',
        'bgImage', 'overlayEnabled', 'overlayColor', 'overlayOpacity', 'imageFit', 'imagePosition'
      ]);
      const getDynamicCardsLockMessage = (field: SettingDefinition) => {
        if (isDynamicCardsAnimationLocked && field.subsection === 'Animaciones') return dynamicCardsAnimationLockMessage;
        if (isDynamicCardsBackgroundLocked && dynamicCardsBackgroundFields.has(field.id)) return dynamicCardsBackgroundLockMessage;
        if (isDynamicCardsTextLocked && dynamicCardsTextStyleFields.has(field.id)) return dynamicCardsTextLockMessage;
        return undefined;
      };
      const renderRepeaterField = (field: SettingDefinition, item: any, index: number) => (
        (() => {
          const fieldValue = field.id === 'icon'
            ? (item.icon ?? item.iconName ?? item.iconId ?? '')
            : item[field.id];

          return (
        <SettingControl
          key={field.id}
          setting={getDynamicCardsLockMessage(field)
            ? { ...field, disabledMessage: getDynamicCardsLockMessage(field) }
            : field}
          value={fieldValue}
          projectId={projectId}
          products={products}
          customers={customers}
          trustedCompanyLogos={trustedCompanyLogos}
          projectColors={projectColors}
          project={project}
          contextId={contextId}
          moduleType={moduleType}
          settingsValues={settingsValues}
          onChange={(val) => {
            const newItems = [...items];
            let updatedItem = { ...item, [field.id]: val };
            const isMenuLinksRepeater = setting.id === 'links' && (moduleType === 'menu' || moduleType === 'navegacion');

            if (isMenuLinksRepeater) {
              if (field.id === 'label') {
                updatedItem.customLabel = true;
                updatedItem.isCustomized = true;
              }

              if (field.id === 'icon') {
                updatedItem.icon = val;
                updatedItem.customIcon = true;
                updatedItem.isCustomized = true;
              }

              if (field.id === 'badge') {
                updatedItem.customBadge = true;
                updatedItem.isCustomized = true;
              }

              if (field.id === 'url') {
                const nextUrl = String(val || '').trim();
                updatedItem.url = nextUrl;
                updatedItem.href = nextUrl;
                updatedItem.isCustomized = true;

                if (nextUrl.startsWith('#')) {
                  const normalizedTarget = nextUrl
                    .replace(/^#/, '')
                    .replace(/^section-/, '');
                  updatedItem.targetSectionId = normalizedTarget || updatedItem.targetSectionId;
                  updatedItem.moduleId = normalizedTarget || updatedItem.moduleId;
                  updatedItem.type = 'internal';
                } else {
                  updatedItem.targetSectionId = undefined;
                  updatedItem.type = 'external';
                  updatedItem.source = 'manual';
                }
              }
            }

            // SIP v11.4: Special logic for social platform dependency
            if (field.id === 'platform') {
              const norm = normalizeSocialPlatform(val);
              if (norm && SOCIAL_PLATFORMS[norm as any]) {
                const platformConfig = SOCIAL_PLATFORMS[norm as any];
                updatedItem.icon = platformConfig.icon;
                updatedItem.label = platformConfig.label;

                // If URL is empty or a generic placeholder, suggest a better one
                if (!updatedItem.url || updatedItem.url === 'usuario' || updatedItem.url === '#' || updatedItem.url === '') {
                  updatedItem.url = 'usuario';
                }
              }
            }

            newItems[index] = updatedItem;
            onChange(newItems);
          }}
        />
          );
        })()
      );
      return (
        <div className="space-y-3">
          {!setting.hideLabel && (
            <div>
              <label className="text-[10px] font-bold text-text/40 uppercase tracking-wider">{setting.label}</label>
            </div>
          )}
          <div className="space-y-2">
            {items.map((item: any, index: number) => {
              const itemToneClass = setting.alternateItemTone
                ? index % 2 === 0
                  ? 'bg-indigo-50/70 border-indigo-100/80 hover:bg-indigo-50/90'
                  : 'bg-cyan-50/70 border-cyan-100/80 hover:bg-cyan-50/90'
                : 'bg-secondary/30 border-border';
              const openItemIndex = openRepeaterItems[repeaterStateKey];
              const isItemOpen = openItemIndex === undefined ? index === 0 : openItemIndex === index;
              const itemSectionKey = `${repeaterStateKey}:${index}`;

              return (
              <details key={index} className={`${itemToneClass} border rounded-xl relative group overflow-hidden transition-colors`} open={isItemOpen}>
                <summary
                  className="flex cursor-pointer list-none items-center justify-between gap-2 p-3"
                  onClick={(event) => {
                    event.preventDefault();
                    setOpenRepeaterItems((current) => ({
                      ...current,
                      [repeaterStateKey]: isItemOpen ? null : index
                    }));
                    setOpenRepeaterSections((current) => ({
                      ...current,
                      [itemSectionKey]: null
                    }));
                  }}
                >
                  <span className="min-w-0">
                    <span className="block text-[10px] font-bold text-text/50 truncate">
                      {setting.itemLabel ? `${formattedSingularItemLabel} ${index + 1}` : item.titleText || item.title || item.name || item.text || `Item #${index + 1}`}
                    </span>
                    {setting.itemLabel && (item.titleText || item.title || item.name || item.text) && (
                      <span className="block text-[9px] font-medium text-text/30 truncate">
                        {item.titleText || item.title || item.name || item.text}
                      </span>
                    )}
                  </span>
                  <button 
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      if (!canRemoveItems) return;
                      const newItems = [...items];
                      newItems.splice(index, 1);
                      onChange(newItems);
                    }}
                    disabled={!canRemoveItems}
                    className={`transition-colors ${canRemoveItems ? 'text-text/40 hover:text-red-500' : 'text-text/15 cursor-not-allowed'}`}
                    title={canRemoveItems ? `Eliminar ${singularItemLabel}` : minItemsMessage}
                  >
                    <Trash2 size={14} />
                  </button>
                </summary>
                <div className="space-y-3 px-3 pb-3">
                  {shouldUseFieldSections
                    ? sectionEntries.map(([sectionName, fields]) => {
                      const isSectionOpen = openRepeaterSections[itemSectionKey] === sectionName;
                      const showTextLockMessage = isDynamicCardsTextLocked && sectionName === 'Textos';
                      const showCtaTextLockMessage = isDynamicCardsTextLocked && sectionName === 'CTA';
                      const showBackgroundLockMessage = isDynamicCardsBackgroundLocked && sectionName === 'Fondo';
                      const showAnimationLockMessage = isDynamicCardsAnimationLocked && sectionName === 'Animaciones';

                      return (
                      <details key={sectionName} className="overflow-hidden rounded-lg border border-border/40 bg-surface/80" open={isSectionOpen}>
                        <summary
                          className="cursor-pointer list-none px-3 py-2 text-[10px] font-black uppercase tracking-wider text-text/45 hover:text-primary"
                          onClick={(event) => {
                            event.preventDefault();
                            setOpenRepeaterSections((current) => ({
                              ...current,
                              [itemSectionKey]: isSectionOpen ? null : sectionName
                            }));
                          }}
                        >
                          {sectionName}
                        </summary>
                        <div className="space-y-3 border-t border-border/30 p-3">
                          {(showTextLockMessage || showCtaTextLockMessage) && (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] font-semibold leading-relaxed text-amber-800">
                              {dynamicCardsTextLockMessage}
                            </div>
                          )}
                          {showBackgroundLockMessage && (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] font-semibold leading-relaxed text-amber-800">
                              {dynamicCardsBackgroundLockMessage}
                            </div>
                          )}
                          {showAnimationLockMessage && (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] font-semibold leading-relaxed text-amber-800">
                              {dynamicCardsAnimationLockMessage}
                            </div>
                          )}
                          {fields.map(field => renderRepeaterField(field, item, index))}
                        </div>
                      </details>
                      );
                    })
                    : setting.fields?.map(field => renderRepeaterField(field, item, index))}
                </div>
              </details>
              );
            })}
            {Number.isFinite(maxItems) && (
              <div className="px-1 text-right text-[9px] font-black uppercase tracking-wider text-text/35">
                {items.length}/{maxItems} {pluralItemLabel}
              </div>
            )}
            {!setting.disableAdd && canAddItems && (
              <button 
                onClick={() => {
                  const newItem: any = {};
                  setting.fields?.forEach(f => {
                    newItem[f.id] = getRepeaterFieldDefaultValue(f);
                  });
                  onChange([...items, newItem]);
                }}
                className="w-full py-2 bg-surface border border-dashed border-border rounded-xl text-[10px] font-bold text-primary hover:bg-primary/5 hover:border-primary/20 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={14} /> {addItemLabel}
              </button>
            )}
            {!setting.disableAdd && !canAddItems && Number.isFinite(maxItems) && (
              <div className="w-full rounded-xl border border-border bg-secondary/20 px-3 py-2 text-center text-[10px] font-bold text-text/35">
                {limitMessage}
              </div>
            )}
          </div>
        </div>
      );
    case 'button':
      return (
        <div className="p-2 bg-primary/5 border border-primary/10 rounded-lg">
          <p className="text-[10px] font-bold text-primary mb-2">{setting.label}</p>
          <button className="w-full py-1.5 bg-surface border border-primary/20 rounded-md text-[10px] font-bold text-primary hover:bg-primary/10 transition-all flex items-center justify-center gap-1.5">
            <Plus size={12} /> {setting.defaultValue}
          </button>
        </div>
      );
    case 'typography_size':
      const levels = setting.allowedLevels || ['t1', 't2', 't3', 'p', 's'];
      return (
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text/40 uppercase tracking-wider">{setting.label}</label>
          <div className="flex flex-wrap gap-1">
            {levels.map((level: any) => {
              const info = TYPOGRAPHY_SCALE[level as keyof typeof TYPOGRAPHY_SCALE];
              const isSelected = currentValue === level;
              return (
                <button
                  key={level}
                  onClick={() => onChange(level)}
                  className={`flex-1 min-w-[45px] py-2 px-1 rounded-lg border text-[10px] font-bold transition-all ${
                    isSelected 
                      ? 'bg-primary text-white border-primary shadow-sm' 
                      : 'bg-surface text-text/60 border-border hover:border-border/80'
                  }`}
                  title={info?.label}
                >
                  {level.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>
      );
    case 'font_weight':
      return (
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text/40 uppercase tracking-wider">{setting.label}</label>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(FONT_WEIGHTS).map(([key, info]) => {
              const isSelected = currentValue === key;
              return (
                <button
                  key={key}
                  onClick={() => onChange(key)}
                  className={`py-1.5 px-2 rounded-lg border text-[10px] transition-all text-left flex items-center justify-between ${
                    isSelected 
                      ? 'bg-primary/10 border-primary/30 text-primary font-bold' 
                      : 'bg-surface border-border text-text/60 hover:border-border/80'
                  }`}
                >
                  <span style={{ fontWeight: info.value }}>{info.label}</span>
                  {isSelected && <Check size={10} />}
                </button>
              );
            })}
          </div>
        </div>
      );
    case 'text_align':
      const alignments = [
        { id: 'left', icon: <AlignLeft size={14} /> },
        { id: 'center', icon: <AlignCenter size={14} /> },
        { id: 'right', icon: <AlignRight size={14} /> },
        { id: 'justify', icon: <AlignJustify size={14} /> }
      ];
      return (
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text/40 uppercase tracking-wider">{setting.label}</label>
          <div className="flex bg-secondary/50 p-1 rounded-xl border border-border/50">
            {alignments.map(align => {
              const isSelected = currentValue === align.id;
              return (
                <button
                  key={align.id}
                  onClick={() => onChange(align.id)}
                  className={`flex-1 flex items-center justify-center py-1.5 rounded-lg transition-all ${
                    isSelected 
                      ? 'bg-surface text-primary shadow-sm border border-border/30' 
                      : 'text-text/40 hover:text-text/60'
                  }`}
                >
                  {align.icon}
                </button>
              );
            })}
          </div>
        </div>
      );
    case 'text_decoration':
      const decorations = [
        { id: 'italic', icon: <Italic size={14} />, label: 'Itálica' },
        { id: 'underline', icon: <Underline size={14} />, label: 'Subrayado' },
        { id: 'strikethrough', icon: <Strikethrough size={14} />, label: 'Tachado' }
      ];
      const currentDecorations = Array.isArray(currentValue) ? currentValue : [];
      return (
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text/40 uppercase tracking-wider">{setting.label}</label>
          <div className="flex gap-1.5">
            {decorations.map(dec => {
              const isSelected = currentDecorations.includes(dec.id);
              return (
                <button
                  key={dec.id}
                  onClick={() => {
                    const newValue = isSelected 
                      ? currentDecorations.filter(id => id !== dec.id)
                      : [...currentDecorations, dec.id];
                    onChange(newValue);
                  }}
                  className={`flex-1 flex items-center justify-center py-2 rounded-xl border transition-all ${
                    isSelected 
                      ? 'bg-primary/10 border-primary/20 text-primary shadow-sm' 
                      : 'bg-surface border-border text-text/40 hover:border-border/80'
                  }`}
                  title={dec.label}
                >
                  {dec.icon}
                </button>
              );
            })}
          </div>
        </div>
      );
    case 'toggle_group':
      return (
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text/40 uppercase tracking-wider">{setting.label}</label>
          <div className="flex bg-secondary/50 p-1 rounded-xl border border-border/50">
            {setting.options?.map(opt => {
              const isSelected = currentValue === opt.value;
              const IconComp = opt.icon ? (LucideIcons as any)[opt.icon] : null;
              return (
                <button
                  key={opt.value}
                  onClick={() => onChange(opt.value)}
                  className={`flex-1 flex items-center justify-center py-1.5 px-2 rounded-lg transition-all text-[10px] font-bold ${
                    isSelected 
                      ? 'bg-surface text-primary shadow-sm border border-border/30' 
                      : 'text-text/40 hover:text-text/60'
                  }`}
                >
                  {IconComp ? <IconComp size={14} className="mr-1" /> : null}
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      );
    case 'textarea':
      const textareaRows = typeof (setting as any).rows === 'number' ? (setting as any).rows : 4;
      return (
        <div className={`space-y-1.5 ${isDisabled ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-text/40">{setting.label}</label>
            {isDisabled && <span className="text-[8px] font-bold text-red-500/60 italic">{setting.disabledMessage}</span>}
          </div>
          <textarea 
            value={shouldBufferDynamicCardsBullets ? dynamicCardsDraftValue : currentValue}
            disabled={isDisabled}
            onChange={(e) => {
              if (shouldBufferDynamicCardsBullets) {
                setDynamicCardsDraftValue(e.target.value);
                scheduleDynamicCardsBulletsCommit(e.target.value);
                return;
              }
              onChange(e.target.value);
            }}
            {...dynamicCardsEditingHandlers}
            rows={textareaRows}
            className="w-full p-2 border border-border rounded-xl text-[10px] font-medium focus:outline-none focus:border-primary/30 bg-surface resize-none" 
            style={{ minHeight: `${Math.max(textareaRows, 3) * 22}px` }}
          />
        </div>
      );
    case 'text':
    default:
      return (
        <div className={`space-y-1.5 ${isDisabled ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-text/40">{setting.label}</label>
            {isDisabled && <span className="text-[8px] font-bold text-red-500/60 italic">{setting.disabledMessage}</span>}
          </div>
          <input 
            type="text" 
            value={currentValue} 
            disabled={isDisabled}
            onChange={(e) => onChange(e.target.value)}
            {...dynamicCardsEditingHandlers}
            className="w-full p-1.5 border border-border rounded-md text-[10px] font-medium focus:outline-none focus:border-primary/30 bg-surface" 
          />
        </div>
      );
  }
};
