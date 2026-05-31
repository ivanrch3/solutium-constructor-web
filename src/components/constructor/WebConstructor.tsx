import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as LucideIcons from 'lucide-react';
import { 
  Monitor, 
  PlusCircle, 
  Database,
  Layout, 
  Type, 
  Layers, 
  Eye, 
  Smartphone, 
  Tablet,
  RotateCcw, 
  Plus, 
  Mail,
  Users,
  Trash2, 
  CheckCircle2,
  FileText,
  User,
  HelpCircle,
  Settings,
  Sparkles,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DataTab } from '../DataTab';
import { Project, RenderingContract, WebBuilderSite, PublishedSite, Page } from '../../types/schema';
import { WebModule, EditorState } from '../../types/constructor';
import * as registryModules from './registry';
import { 
  MODULE_INFO,
  HEADER_MODULE, MENU_MODULE, FOOTER_MODULE, SPACER_MODULE, 
  PRODUCTS_MODULE, HERO_MODULE, HERO2_MODULE, FEATURES_MODULE, ABOUT_MODULE, 
  PROCESS_MODULE, GALLERY_MODULE, VIDEO_MODULE, TESTIMONIALS_MODULE, 
  STATS_MODULE, NEWSLETTER_MODULE, CONTACT_MODULE, TEAM_MODULE, 
  CTA_MODULE, PRICING_MODULE, FAQ_MODULE, TRUSTED_LOGOS_MODULE,
  BENTO_MODULE, COMPARISON_MODULE, COMPOSITION_SECTION_MODULE
} from './registry';
import { saveWebBuilderSiteDraft, publishWebBuilderSite, getProducts, getCustomers, getTrustedCompanyLogos, normalizeTrustedCompanyLogos, upsertPage, upsertPageSections, logEvolutionRequest, getPageBySiteId, generatePreviewServerSide } from '../../services/dataService';
import { sendToMother } from '../../services/handshakeService';
import { ensureActiveSupabaseSession, SupabaseSessionError } from '../../services/supabaseSessionService';
import { Product, Customer, PageSection, TrustedCompanyLogo } from '../../types/schema';
import { MOCK_PRODUCTS, MOCK_CUSTOMERS } from '../../constants/mockData';
import { MainSidebar, ModuleItem } from './MainSidebar';
import { StructurePanel } from './StructurePanel';
import { TopBar } from './TopBar';
import { Canvas } from './Canvas';
import { GlobalSettingsPanel } from './GlobalSettingsPanel';
import { normalizeSocialUrl, getIconForPlatform, resolveFooterSocialLinks, FOOTER_DEFAULTS } from '../../utils/socialUtils';
import { 
  MobileBottomNav, 
  UnsavedChangesModal, 
  DeleteConfirmationModal, 
  PublishModal,
  AIPagePlanModal,
  AIGenerationModal,
  MotherAIPageConfirmationModal,
  AIUsageSuccessModal
} from './ConstructorModals';
import { BentoPromptGenerator } from './BentoPromptGenerator';
import { BentoSchema } from '../../types/bentoSchema';

const DEFAULT_PARALLAX_BG_IMAGE = '/parallax-default-centered.svg';
import { generateSite, generateLandingWithMotherAI, generateLandingDryRunLocal, generateAIPagePlan, MotherAIPageResponse } from '../../services/aiService';
import { AIGenerationContext, AIPageGenerationBrief, AIPagePlan } from '../../types/ai';
import { ProjectForm, ProjectFormData } from '../ProjectForm';
import { initialContent, useEditorStore } from '../../store/editorStore';
import { logDebug } from '../../utils/debug';
import {
  PROJECT_THEME_FALLBACKS,
  buildProjectThemeCssVariables,
  getProjectThemeFromSettings,
  normalizeProjectBrandColors
} from '../../utils/projectTheme';
import {
  buildAutomaticMenuItems,
  dedupeMenuLinks,
  getMenuModeKey,
  getShowInMenuKey,
  isMenuEligibleModule,
  isUtilityMenuModule,
  resolveMenuMode,
  resolveShowInMenuState
} from '../../utils/menuNavigation';
import { bridgeModuleContent } from '../../utils/hydrationBridge';
import { cloneCompositionPresetSchema, CompositionPresetId } from './modules/compositionPresets';
import { validateCompositionSchema } from '../../utils/compositionSchemaValidator';

// --- CONSTANTS ---
const MASTER_DICTIONARY = {
  modules: [
    'hero', 'hero2', 'features', 'about', 'process', 'gallery', 'video', 'testimonials', 
    'stats', 'newsletter', 'contact', 'team', 'cta', 'pricing', 'faq', 'clients', 'trusted_logos',
    'bento', 'comparative', 'header', 'menu', 'footer', 'spacer', 'products'
  ],
  styles: [
    'border_radius', 'box_shadow', 'font_family', 'button_styles', 
    'bg_type', 'dark_mode', 'primary_color', 'accent_color', 'text_color',
    'title_mode', 'rotating_enabled', 'rotating_fixed', 'rotating_options', 'rotating_speed', 'rotating_anim', 'rotating_color', 'rotating_gradient'
  ]
};

const AUTOSAVE_DISABLED_VALUE = 'disabled';
const AUTOSAVE_INTERVAL_OPTIONS = [60000, 120000, 180000, 300000, 600000] as const;
const DEFAULT_AUTOSAVE_INTERVAL_MS = 180000;

const resolveBooleanSetting = (value: any, fallback: boolean): boolean => {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return Boolean(value);
};

const resolveAutosaveInterval = (value: any): number => {
  const numericValue = Number(value);
  return AUTOSAVE_INTERVAL_OPTIONS.includes(numericValue as typeof AUTOSAVE_INTERVAL_OPTIONS[number])
    ? numericValue
    : DEFAULT_AUTOSAVE_INTERVAL_MS;
};

// --- HELPERS ---
const getPlainValue = (val: any) => {
  if (val && typeof val === 'object' && 'value' in val && !Array.isArray(val)) {
    return val.value;
  }
  return val;
};

const PROJECT_BRAND_COLOR_DEFAULTS = new Set([
  '#3b82f6', '#2563eb', '#1d4ed8',
  '#8b5cf6', '#7c3aed', '#6d28d9'
]);

const isProjectBrandDefaultColor = (value: any) => {
  return typeof value === 'string' && PROJECT_BRAND_COLOR_DEFAULTS.has(value.trim().toLowerCase());
};

const isGradientTextSetting = (settingId: string, label?: string) => {
  const raw = `${settingId} ${label || ''}`.toLowerCase();
  return /(highlight|rotating|texto|title|subtitle|eyebrow|heading)/.test(raw) && /gradient|degrad/.test(raw);
};

const isProjectTextAccentSetting = (settingId: string, label?: string) => {
  const raw = `${settingId} ${label || ''}`.toLowerCase();
  return /(eyebrow|highlight|accent|role|icon|rotating|price|search_border|handle_color|active_color|trust_color|btn(_|[a-z])|button|primary_bg|secondary_bg|primary_color|secondary_color|cta_bg|color)/.test(raw);
};

const checkDictionarySync = async (contract: RenderingContract): Promise<void> => {
  const unknowns: any[] = [];
  
  contract.sections.forEach(section => {
    // 1. Check Module Type
    const baseType = section.type.split('_')[0]; 
    if (!MASTER_DICTIONARY.modules.includes(baseType as any)) {
      unknowns.push({ type: 'module', value: section.type, id: section.id });
    }
    
    // 2. Check Styles
    if (section.styles) {
      Object.keys(section.styles).forEach(styleKey => {
        const cleanKey = styleKey.replace(/-/g, '_');
        if (!MASTER_DICTIONARY.styles.includes(cleanKey as any)) {
          unknowns.push({ type: 'style', value: styleKey, id: section.id });
        }
      });
    }
  });

  if (unknowns.length > 0) {
    await logEvolutionRequest('Unknown Schema Detected', {
      unknowns,
      contract_timestamp: new Date().toISOString(),
      status: 'pending'
    });
    logDebug(`[Sync Check] Se detectaron componentes o estilos desconocidos (${unknowns.length}). Registrados en Evolution Buffer.`);
  }
};

// --- MODULE DEFINITIONS (Migrated to registry.tsx) ---














// --- SUB-COMPONENTS (Migrated to separate files) ---






;















// --- MAIN COMPONENT ---

interface WebConstructorProps {
  onBackToDashboard: () => void;
  onCancelOnboarding?: () => void;
  projectId: string | null;
  appId: string | null;
  currentUserId: string | null;
  logoUrl: string | null;
  logoWhiteUrl: string | null;
  project: Project | null;
  initialPage?: WebBuilderSite | PublishedSite | Page | null;
  creationMethod?: 'ai' | 'template' | 'scratch' | null;
}

const resolveLifecycleStatusFromPage = (
  page?: WebBuilderSite | PublishedSite | Page | null
): 'draft' | 'published' | 'modified' => {
  if (page && 'status' in page) {
    return ((page as any).status || 'draft') as 'draft' | 'published' | 'modified';
  }

  if (page && !('status' in page)) {
    return 'published';
  }

  return 'draft';
};

export const WebConstructor: React.FC<WebConstructorProps> = ({ 
  onBackToDashboard, 
  onCancelOnboarding,
  projectId, 
  appId,
  currentUserId,
  logoUrl,
  logoWhiteUrl,
  project,
  initialPage,
  creationMethod
}) => {
  const { 
    siteContent, 
    selectedSectionId, 
    selectSection, 
    undo, 
    redo,
    setSiteContent,
    updateTheme,
    addSection,
    removeSection,
    setProject,
    resetEditorStore
  } = useEditorStore();

  useEffect(() => {
    logDebug('[CONSTRUCTOR_RUNTIME_VERSION]', {
      version: "bento-editor-ux-v1",
      hasBentoEmptyState: true,
      hasBentoEditorWrapper: true,
      hasBentoCellEditor: true,
      buildTime: new Date().toISOString()
    });

    if (initialPage && 'content' in initialPage && (initialPage as any).content) {
      setSiteContent((initialPage as any).content);
    } else if (initialPage && 'contentDraft' in initialPage && initialPage.contentDraft) {
      // SIP v7.4: Ensure that if we have a draft, we also have a valid siteContent 
      // for the Canvas to render during the first 1.5s (before standard sync kicks in)
      const draft = initialPage.contentDraft;
    } else if (!initialPage) {
      resetEditorStore();
      setSiteContent(initialContent);
    }
  }, []);

  useEffect(() => {
    if (project) {
      setProject(project);
    }
  }, [project, initialPage, setProject]);

  const [activeTab, setActiveTab] = useState('constructor');
  const [mobileTab, setMobileTab] = useState<'constructor' | 'structure' | 'preview'>('constructor');
  const [activeModuleCategory, setActiveModuleCategory] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [trustedCompanyLogos, setTrustedCompanyLogos] = useState<TrustedCompanyLogo[]>([]);
  const [moduleToDelete, setModuleToDelete] = useState<WebModule | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [siteName, setSiteName] = useState(() => {
    if (!initialPage) return '';
    return (initialPage as any).siteName || (initialPage as any).title || '';
  });
  const assetDisplayName = (siteName || (initialPage as any)?.siteName || (initialPage as any)?.title || 'Activo sin nombre').trim();

  const [currentSiteId] = useState(() => {
    // 1. Si estamos editando una página existente (Borrador o Publicada), usamos su siteId.
    if (initialPage && (initialPage as any).siteId) return (initialPage as any).siteId;
    if (initialPage && (initialPage as any).web_builder_site_id) return (initialPage as any).web_builder_site_id;
    
    // 2. Si es una página NUEVA, generamos un ID único para que sea independiente.
    return crypto.randomUUID();
  });

  useEffect(() => {
    // Synchronize IDs with window for evolution logging fallbacks
    // Use snake_case as requested for consistency
    (window as any).PROJECT_ID = projectId;
    (window as any).WEB_BUILDER_SITE_ID = initialPage?.id;
    (window as any).SITE_ID = currentSiteId;
    
    // Also provide as objects for more robust fallbacks
    (window as any).currentProject = { id: projectId };
    (window as any).currentSite = { id: initialPage?.id, site_id: currentSiteId };
    (window as any).webBuilderSite = { id: initialPage?.id };
    
    // [CONSTRUCTOR_RUNTIME_VERSION]
    logDebug('[CONSTRUCTOR_RUNTIME_VERSION]', {
      version: "footer-social-resolution-v3",
      buildTime: new Date().toISOString(),
      hasFooterSocialResolver: true,
      hasFooterLogoResolver: true,
      hasAutoPreviewOnPublish: true
    });

    // [PROJECT_SOCIALS_RUNTIME_DEBUG]
    if (project) {
      logDebug('[PROJECT_SOCIALS_RUNTIME_DEBUG]', {
        projectId: project.id,
        projectSocialsRaw: project.socials,
        projectSocialsKeys: project.socials ? Object.keys(project.socials) : [],
        configuredSocialsCount: project.socials ? Object.values(project.socials).filter(v => !!v && v !== '' && v !== '#').length : 0
      });
    }
  }, [projectId, initialPage, currentSiteId, project]);

  const [isSaving, setIsSaving] = useState(false);
  const [isDraftOperationInProgress, setIsDraftOperationInProgress] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [publishStatus, setPublishStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [authNotice, setAuthNotice] = useState<{ type: 'info' | 'error'; message: string } | null>(null);
  const [previewStatus, setPreviewStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [previewWarning, setPreviewWarning] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<'draft' | 'published' | 'modified'>(() => (
    resolveLifecycleStatusFromPage(initialPage)
  ));
  const [structurePanelCollapsed, setStructurePanelCollapsed] = useState(false);
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [showBentoPrompt, setShowBentoPrompt] = useState(false);

  const setPreviewWarningsFromResult = useCallback((
    warnings: string[] | undefined,
    fallbackMessage: string
  ) => {
    if (Array.isArray(warnings) && warnings.length > 0) {
      setPreviewWarning(`${fallbackMessage} ${warnings.join(' ')}`);
    }
  }, []);

  useEffect(() => {
    if (!authNotice || authNotice.type !== 'info') return;
    const timer = window.setTimeout(() => setAuthNotice(null), 3500);
    return () => window.clearTimeout(timer);
  }, [authNotice]);

  const projectThemeSeed = React.useMemo(() => {
    const tokens = normalizeProjectBrandColors(project?.brandColors, {
      background: PROJECT_THEME_FALLBACKS.background,
      text: PROJECT_THEME_FALLBACKS.text,
      muted: PROJECT_THEME_FALLBACKS.muted,
      border: PROJECT_THEME_FALLBACKS.border
    });

    return {
      ...tokens,
      fontSans: project?.fontFamily || 'Inter',
      fontHeading: project?.fontFamily || 'Inter'
    };
  }, [project]);

  const incomingLifecycleStatus = React.useMemo(
    () => resolveLifecycleStatusFromPage(initialPage),
    [initialPage]
  );

  useEffect(() => {
    setCurrentStatus((previousStatus) => (
      previousStatus === incomingLifecycleStatus ? previousStatus : incomingLifecycleStatus
    ));
  }, [
    incomingLifecycleStatus,
    initialPage ? ((initialPage as any).siteId || (initialPage as any).id || null) : null,
    initialPage && 'status' in initialPage ? (initialPage as any).status : 'published'
  ]);

  const getThemePaletteForDefaults = useCallback((settingsValues?: Record<string, any>) => {
    return getProjectThemeFromSettings(settingsValues, projectThemeSeed);
  }, [projectThemeSeed]);

  const resolveProjectAwareSettingDefault = useCallback((setting: any, rawValue: any, settingsValues?: Record<string, any>) => {
    const palette = getThemePaletteForDefaults(settingsValues);
    const label = setting?.label || '';

    if (setting?.type === 'gradient' && isGradientTextSetting(setting.id, label)) {
      return `linear-gradient(90deg, ${palette.primary} 0%, ${palette.accent} 100%)`;
    }

    if (setting?.type === 'color' && isProjectBrandDefaultColor(rawValue) && isProjectTextAccentSetting(setting.id, label)) {
      return palette.primary;
    }

    return rawValue;
  }, [getThemePaletteForDefaults]);
  
  const [editorState, setEditorState] = useState<EditorState>(() => {
    const defaultState: EditorState = {
        addedModules: [],
        expandedModuleId: null,
        selectedElementId: null,
        expandedGroupsByElement: {},
        settingsValues: {
          'global_theme_primary_color': projectThemeSeed.primary,
          'global_theme_secondary_color': projectThemeSeed.secondary,
          'global_theme_accent_color': projectThemeSeed.accent,
          'global_theme_background_color': projectThemeSeed.background,
          'global_theme_text_color': projectThemeSeed.text,
          'global_theme_muted_color': projectThemeSeed.muted,
          'global_theme_border_color': projectThemeSeed.border,
          'global_theme_font_sans': projectThemeSeed.fontSans,
          'global_theme_font_heading': projectThemeSeed.fontHeading,
          'global_theme_radius': 12,
          'global_theme_container_width': 1400,
          'global_theme_builder_autosave_enabled': true,
          'global_theme_builder_autosave_interval_ms': DEFAULT_AUTOSAVE_INTERVAL_MS,
          'global_theme_builder_autosave_show_indicator': true
        },
      recentlyAddedModuleId: null,
      totalModulesAdded: 0
    };

    const site = initialPage as any;
    const isValidDraft = site?.contentDraft && 
                         Array.isArray(site.contentDraft.addedModules) && 
                         site.contentDraft.settingsValues && 
                         typeof site.contentDraft.settingsValues === 'object';

    // 1. PRIORIDAD: contentDraft (Tabla web_builder_sites) - SIP v7.1
    if (isValidDraft) {
      const draft = site.contentDraft;
      const addedModules = draft.addedModules;
      
      const hydrated = {
        ...defaultState,
        ...draft,
        addedModules,
        expandedGroupsByElement: draft.expandedGroupsByElement || {},
        settingsValues: {
          ...defaultState.settingsValues,
          ...(draft.settingsValues || {})
        },
        totalModulesAdded: draft.totalModulesAdded !== undefined ? draft.totalModulesAdded : addedModules.length
      };

      return hydrated;
    }

    // 2. SEGUNDA PRIORIDAD: metadata.editor_state (Fallback App Madre)
    if (site?.metadata?.editor_state) {
      const draft = site.metadata.editor_state as any;
      const addedModules = Array.isArray(draft.addedModules) ? draft.addedModules : [];
      
      const hydrated = {
        ...defaultState,
        ...draft,
        addedModules,
        settingsValues: { ...defaultState.settingsValues, ...(draft.settingsValues || {}) }
      };

      logDebug('[CONSTRUCTOR_HYDRATION_SOURCE]', {
        siteId: site.id || site.web_builder_site_id,
        used: 'metadata_editor_state',
        hasValidDraft: false,
        addedModulesCount: hydrated.addedModules?.length,
        settingsValuesCount: Object.keys(hydrated.settingsValues || {}).length
      });

      logDebug('[EDITOR_STATE_AFTER_HYDRATION_DEBUG]', hydrated);

      return hydrated;
    }

    // 3. TERCERA PRIORIDAD: Reconstrucción desde Contrato (PublishedSite sin draft)
    if (site?.content) {
      const contract = site.content as RenderingContract;
      if (contract.sections && Array.isArray(contract.sections)) {
        const reconstructedModules: WebModule[] = [];
        const reconstructedSettings: Record<string, any> = { ...defaultState.settingsValues };

        contract.sections.forEach(section => {
          // Reconstruir módulo con fidelidad de tipos (SIP v7.0)
          reconstructedModules.push({
            id: section.id,
            type: section.type || section.tipo,
            name: (section as any).name || section.type || section.tipo || 'Módulo',
            elements: [],
            globalGroups: [],
            globalSettings: {}
          } as WebModule);

          // Re-aplanar settings y content
          const prefix = section.id;
          const sectionSettings = section.settings || {};
          const seededDeepValues: Record<string, any> = {};
          
          if (section.settings) {
            Object.entries(section.settings).forEach(([k, v]) => {
              const key = k.startsWith(prefix) ? k : `${prefix}_${k}`;
              reconstructedSettings[key] = v;
              seededDeepValues[key] = v;
            });
          }

          if (section.content) {
            Object.assign(
              reconstructedSettings,
              bridgeModuleContent({
                type: section.type || section.tipo || '',
                moduleId: prefix,
                content: section.content,
                settings: sectionSettings,
                existingDeepValues: seededDeepValues
              })
            );
          }
        });

        const hydrated = {
          ...defaultState,
          addedModules: reconstructedModules,
          settingsValues: reconstructedSettings,
          totalModulesAdded: reconstructedModules.length
        };

        logDebug('[CONSTRUCTOR_HYDRATION_SOURCE]', {
          siteId: site.id || site.web_builder_site_id,
          used: 'rendering_contract_reconstruction',
          hasValidDraft: false,
          addedModulesCount: hydrated.addedModules?.length,
          settingsValuesCount: Object.keys(hydrated.settingsValues || {}).length
        });

        logDebug('[EDITOR_STATE_AFTER_HYDRATION_DEBUG]', hydrated);

        return hydrated;
      }
    }

    logDebug('[CONSTRUCTOR_HYDRATION_SOURCE]', {
      used: 'defaults'
    });


      return defaultState;
    });

    useEffect(() => {
      if (!project) return;

      const shouldSeedValue = (currentValue: unknown, defaults: string[]) => {
        if (currentValue === undefined || currentValue === null || String(currentValue).trim() === '') {
          return true;
        }

        const normalizedCurrent = String(currentValue).trim().toLowerCase();
        return defaults.some((candidate) => normalizedCurrent === candidate.toLowerCase());
      };

      updateEditorState((prev) => {
        const nextSettings = { ...prev.settingsValues };
        let changed = false;

        const seedThemeValue = (key: string, nextValue: string, defaults: string[]) => {
          if (!nextValue) return;
          if (shouldSeedValue(nextSettings[key], defaults) && nextSettings[key] !== nextValue) {
            nextSettings[key] = nextValue;
            changed = true;
          }
        };

        seedThemeValue('global_theme_primary_color', projectThemeSeed.primary, ['#3B82F6', '#3b82f6']);
        seedThemeValue('global_theme_secondary_color', projectThemeSeed.secondary, ['#F1F5F9', '#f1f5f9', '#8B5CF6', '#8b5cf6']);
        seedThemeValue('global_theme_accent_color', projectThemeSeed.accent, ['#7C3AED', '#7c3aed', '#10B981', '#10b981']);
        seedThemeValue('global_theme_background_color', projectThemeSeed.background, ['#F8FAFC', '#f8fafc', '#FFFFFF', '#ffffff']);
        seedThemeValue('global_theme_text_color', projectThemeSeed.text, ['#0F172A', '#0f172a']);
        seedThemeValue('global_theme_muted_color', projectThemeSeed.muted, ['#64748B', '#64748b']);
        seedThemeValue('global_theme_border_color', projectThemeSeed.border, ['#E2E8F0', '#e2e8f0']);
        seedThemeValue('global_theme_font_sans', projectThemeSeed.fontSans, ['Inter', 'inter']);
        seedThemeValue('global_theme_font_heading', projectThemeSeed.fontHeading, ['Inter', 'inter']);

        Object.keys(nextSettings).forEach((key) => {
          const currentValue = nextSettings[key];
          const normalizedKey = key.toLowerCase();

          if (typeof currentValue === 'string' && isProjectBrandDefaultColor(currentValue)) {
            if (normalizedKey.includes('gradient')) {
              nextSettings[key] = `linear-gradient(90deg, ${projectThemeSeed.primary} 0%, ${projectThemeSeed.accent} 100%)`;
              changed = true;
              return;
            }

            if (/(btn(_|[a-z])|button|primary_bg|secondary_bg|eyebrow_color|highlight_color|accent_color|role_color|icon_color|price_color|rotating_color|trust_color|search_border|handle_color|active_color)/.test(normalizedKey)) {
              nextSettings[key] = projectThemeSeed.primary;
              changed = true;
            }
          }
        });

        prev.addedModules.forEach((module) => {
          Object.values(module.globalSettings || {}).forEach((groupSettings) => {
            groupSettings.forEach((setting: any) => {
              const key = `${module.id}_global_${setting.id}`;
              if (nextSettings[key] !== undefined) return;

              const projectAwareDefault = resolveProjectAwareSettingDefault(setting, setting.defaultValue, nextSettings);
              if (projectAwareDefault !== setting.defaultValue) {
                nextSettings[key] = projectAwareDefault;
                changed = true;
              }
            });
          });

          module.elements.forEach((element) => {
            Object.values(element.settings || {}).forEach((groupSettings) => {
              groupSettings.forEach((setting: any) => {
                const key = `${element.id}_${setting.id}`;
                if (nextSettings[key] !== undefined) return;

                const projectAwareDefault = resolveProjectAwareSettingDefault(setting, setting.defaultValue, nextSettings);
                if (projectAwareDefault !== setting.defaultValue) {
                  nextSettings[key] = projectAwareDefault;
                  changed = true;
                }
              });
            });
          });
        });

        return changed ? { ...prev, settingsValues: nextSettings } : prev;
      });

      const themeDefaults = {
        primaryColor: ['#3b82f6'],
        secondaryColor: ['#1e293b', '#f1f5f9', '#8b5cf6'],
        accentColor: ['#7c3aed', '#10b981'],
        backgroundColor: ['#ffffff', '#f8fafc'],
        textColor: ['#1f2937', '#0f172a'],
        mutedColor: ['#64748b'],
        borderColor: ['#e2e8f0'],
        fontFamily: ['inter']
      };

      const shouldSeedThemeValue = (currentValue: unknown, nextValue: string, defaults: string[]) => {
        if (currentValue === undefined || currentValue === null || String(currentValue).trim() === '') {
          return true;
        }

        const normalizedCurrent = String(currentValue).trim().toLowerCase();
        const normalizedNext = String(nextValue || '').trim().toLowerCase();
        if (normalizedCurrent === normalizedNext) {
          return false;
        }
        return defaults.some((candidate) => normalizedCurrent === candidate.toLowerCase());
      };

      const themeUpdate: Record<string, any> = {};
      if (shouldSeedThemeValue(siteContent.theme?.primaryColor, projectThemeSeed.primary, themeDefaults.primaryColor)) themeUpdate.primaryColor = projectThemeSeed.primary;
      if (shouldSeedThemeValue(siteContent.theme?.secondaryColor, projectThemeSeed.secondary, themeDefaults.secondaryColor)) themeUpdate.secondaryColor = projectThemeSeed.secondary;
      if (shouldSeedThemeValue(siteContent.theme?.accentColor, projectThemeSeed.accent, themeDefaults.accentColor)) themeUpdate.accentColor = projectThemeSeed.accent;
      if (shouldSeedThemeValue(siteContent.theme?.backgroundColor, projectThemeSeed.background, themeDefaults.backgroundColor)) themeUpdate.backgroundColor = projectThemeSeed.background;
      if (shouldSeedThemeValue(siteContent.theme?.textColor, projectThemeSeed.text, themeDefaults.textColor)) themeUpdate.textColor = projectThemeSeed.text;
      if (shouldSeedThemeValue((siteContent.theme as any)?.mutedColor, projectThemeSeed.muted, themeDefaults.mutedColor)) (themeUpdate as any).mutedColor = projectThemeSeed.muted;
      if (shouldSeedThemeValue((siteContent.theme as any)?.borderColor, projectThemeSeed.border, themeDefaults.borderColor)) (themeUpdate as any).borderColor = projectThemeSeed.border;
      if (shouldSeedThemeValue(siteContent.theme?.fontFamily, projectThemeSeed.fontSans, themeDefaults.fontFamily)) themeUpdate.fontFamily = projectThemeSeed.fontSans;

      if (Object.keys(themeUpdate).length > 0) {
        updateTheme(themeUpdate);
      }
    }, [project, projectThemeSeed, siteContent.theme, updateTheme]);

  // Effect to load from pages table strictly if we only have a siteId (SIP v6.1)
  useEffect(() => {
    const loadFromPagesTable = async () => {
      // If we have an initialPage but it lacks editor state, try fetching from 'pages'
      const pageId = (initialPage as any)?.id;
      if (pageId && !(initialPage as any).contentDraft && !(initialPage as any).metadata?.editor_state) {
        const page = await getPageBySiteId(pageId, projectId); // Added projectId as fallback
        if (page && page.metadata?.editor_state) {
          setEditorState(migrateEditorStateToUUIDs(page.metadata.editor_state));
        }
      }
    };
    loadFromPagesTable();
  }, [initialPage]);
  
  // AI Generation State
  const [onboardingFinished, setOnboardingFinished] = useState(() => {
    // Si ya hay módulos, el onboarding terminó
    if ((initialPage && !!(initialPage as any).contentDraft) || (editorState.addedModules && editorState.addedModules.length > 0)) {
      return true;
    }
    // Si elegimos "scratch", no queremos onboarding
    if (creationMethod === 'scratch') return true;
    
    return false;
  });
  const [showAIInitialForm, setShowAIInitialForm] = useState(() => {
    // Solo mostrar si es un sitio nuevo Y elegimos AI
    return !initialPage && creationMethod === 'ai';
  });
  const [hasStartedAI, setHasStartedAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiGenerationStep, setAiGenerationStep] = useState(0);
  const [aiPagePlan, setAiPagePlan] = useState<AIPagePlan | null>(null);
  const aiSteps = [
    "Diseñando estructura por industria...",
    "Redactando contenido persuasivo...",
    "Sincronizando paleta de marca y estilo...",
    "Curando imágenes de stock y activos..."
  ];

  // --- [PHASE 3D.5.2] Secure AI Generation States ---
  const [isMotherAIConfirmationOpen, setIsMotherAIConfirmationOpen] = useState(false);
  const [isDryRun, setIsDryRun] = useState(true); // Default to dry-run (preview)
  const [motherAIBrief, setMotherAIBrief] = useState<ProjectFormData | null>(null);
  const [activeIdempotencyKey, setActiveIdempotencyKey] = useState<string | null>(null);
  const [aiUsageSuccess, setAiUsageSuccess] = useState<{costCredits: number, totalTokens: number, aiUsageLogId: string, isDryRun?: boolean} | null>(null);
  const isRunningRef = useRef(false); // Ref for blocking double clics

  const [isPreviewMode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('mode') === 'preview';
  });

  // --- PROTOCOLO SOLUTIUM v5.2: Dynamic Gateway Detection ---
  const [isExternalRender] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('external_render') === 'true';
  });

  const [gatewayToken] = useState(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#token=')) {
      return hash.replace('#token=', '');
    }
    return null;
  });

  // Integrity Hash for Master App Audit
  const SOLUTIUM_MODULES_HASH = "v5.2-sha256-render-engine-stable";
  const [reloadKey, setReloadKey] = useState(0);
  const handleReloadPreview = useCallback(() => {
    setReloadKey((prev) => prev + 1);
  }, []);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastAutosavedAt, setLastAutosavedAt] = useState<Date | null>(null);
  const [autosaveError, setAutosaveError] = useState<string | null>(null);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const isInitialLoad = useRef(true);
  const saveInProgressRef = useRef(false);
  const autosaveInProgressRef = useRef(false);
  const publishInProgressRef = useRef(false);
  const pendingChangesDuringSaveRef = useRef(false);
  const lastSaveSourceRef = useRef<'manual' | 'autosave' | 'prepublish' | null>(null);
  const activeSavePromiseRef = useRef<Promise<boolean> | null>(null);
  const changeVersionRef = useRef(0);
  const lastSaveChangeVersionRef = useRef(0);
  const editorStateRef = useRef(editorState);
  const siteNameRef = useRef(siteName);
  const currentStatusRef = useRef(currentStatus);
  const autosaveIntervalSetting = editorState.settingsValues['global_theme_builder_autosave_interval_ms'];
  const autosaveDisabledByInterval = String(autosaveIntervalSetting).trim().toLowerCase() === AUTOSAVE_DISABLED_VALUE;
  const autosaveEnabled = !autosaveDisabledByInterval && resolveBooleanSetting(
    editorState.settingsValues['global_theme_builder_autosave_enabled'],
    true
  );
  const autosaveIntervalMs = resolveAutosaveInterval(
    autosaveIntervalSetting
  );
  const autosaveShowIndicator = resolveBooleanSetting(
    editorState.settingsValues['global_theme_builder_autosave_show_indicator'],
    true
  );

  // Mark initial load as finished after a short delay to allow sync effects to run
  useEffect(() => {
    const timer = setTimeout(() => {
      isInitialLoad.current = false;
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (autosaveStatus !== 'saved') return;
    const timer = window.setTimeout(() => setAutosaveStatus('idle'), 4000);
    return () => window.clearTimeout(timer);
  }, [autosaveStatus]);

  useEffect(() => {
    editorStateRef.current = editorState;
  }, [editorState]);

  useEffect(() => {
    siteNameRef.current = siteName;
  }, [siteName]);

  useEffect(() => {
    currentStatusRef.current = currentStatus;
  }, [currentStatus]);

  useEffect(() => {
    if (autosaveEnabled) return;
    setAutosaveStatus('idle');
    setAutosaveError(null);
  }, [autosaveEnabled]);

  const markUnsavedChanges = useCallback(() => {
    changeVersionRef.current += 1;
    if (saveInProgressRef.current) {
      pendingChangesDuringSaveRef.current = true;
    }
    setHasUnsavedChanges(true);
    setSaveStatus('idle');
    setPublishStatus('idle');
    setAutosaveStatus('idle');
    setAutosaveError(null);
  }, []);

  // Apply Global Theme to CSS Variables
  useEffect(() => {
    const siteRoot = document.getElementById('constructor-canvas-render');
    if (!siteRoot) return;

    const themeTokens = getProjectThemeFromSettings(editorState.settingsValues, projectThemeSeed);
    const cssVars = buildProjectThemeCssVariables(themeTokens);

    Object.entries(cssVars).forEach(([key, value]) => {
      siteRoot.style.setProperty(key, value);
    });
    siteRoot.style.setProperty('--card-color', themeTokens.background);
    
    // Apply Typography
    const fontSans = editorState.settingsValues['global_theme_font_sans'] ?? projectThemeSeed.fontSans;
    const fontHeading = editorState.settingsValues['global_theme_font_heading'] ?? projectThemeSeed.fontHeading;
    siteRoot.style.setProperty('--solutium-font', `"${fontSans}", sans-serif`);
    siteRoot.style.setProperty('--font-heading', `"${fontHeading}", sans-serif`);

    // Dynamic Font Loading
    const fontsToLoad = Array.from(new Set([fontSans, fontHeading]));
    fontsToLoad.forEach(font => {
      const fontId = `font-${font.replace(/\s+/g, '-').toLowerCase()}`;
      if (!document.getElementById(fontId)) {
        const link = document.createElement('link');
        link.id = fontId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/\s+/g, '+')}:wght@100;200;300;400;500;600;700;800;900&display=swap`;
        document.head.appendChild(link);
      }
    });
    
    // Apply Layout
    siteRoot.style.setProperty('--radius', `${editorState.settingsValues['global_theme_radius'] ?? 12}px`);
    siteRoot.style.setProperty('--max-width', `${editorState.settingsValues['global_theme_container_width'] ?? 1400}px`);
    
  }, [editorState.settingsValues, projectThemeSeed]);

  // [PRODUCTS_SELECTION_STATE_AUDIT]
  useEffect(() => {
    siteContent.sections.forEach(section => {
      if (section.type === 'products' || section.type === 'product_grid') {
        const moduleId = section.id;
        const selectKey = `${moduleId}_el_products_config_select_products`;
        const contentProducts = section.content?.products || (section.content as any)?.productos;
        const snapshotKey = `${moduleId}_el_products_items_products`;
        
        logDebug('[PRODUCTS_SELECTION_STATE_AFTER_UPDATE_DEBUG]', {
          moduleId,
          sectionId: section.id,
          sectionType: section.type,
          selectedIdsFromSettings: section.settings?.[selectKey],
          selectedIdsFromEditorState: editorState.settingsValues[selectKey],
          selectedIdsFromContent: (section.content as any)?.selectedProductIds,
          productsInSectionContentCount: Array.isArray(contentProducts) ? contentProducts.length : 0,
          productsSnapshotCount: Array.isArray(section.settings?.[snapshotKey]) ? section.settings[snapshotKey].length : 0,
          timestamp: Date.now()
        });
      }
    });
  }, [siteContent, editorState.settingsValues]);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  React.useEffect(() => {
    if (projectId) {
      getProducts(0, 100, projectId).then(data => {
        setProducts(data || []);
      });
      getCustomers(0, 50, projectId).then(data => {
        setCustomers(data || []);
      });
      getTrustedCompanyLogos(projectId).then(data => {
        setTrustedCompanyLogos(data || []);
      });
    }
  }, [projectId]);

  // Track unsaved changes
  React.useEffect(() => {
    // We skip the first render by checking if editorState has modules or if it's different from initial
    // But a simpler way is to just set it to true after any change
    // For now, let's assume any change to editorState or siteName after mount makes it dirty
  }, [editorState, siteName]);

  // We need to wrap setEditorState and setSiteName to set hasUnsavedChanges
  const updateEditorState = (updater: (prev: EditorState) => EditorState) => {
    setEditorState(prev => {
      const next = updater(prev);
      if (next !== prev) {
        editorStateRef.current = next;
      }
      if (next !== prev && !isInitialLoad.current) {
        // Only mark as dirty if functional editor state changed (SIP v7.5)
        const dataChanged = 
          next.addedModules !== prev.addedModules || 
          next.settingsValues !== prev.settingsValues;

        if (dataChanged) {
          markUnsavedChanges();
        }
      }
      return next;
    });
  };

  const updateSiteName = (name: string) => {
    siteNameRef.current = name;
    setSiteName(name);
    if (!isInitialLoad.current) {
      markUnsavedChanges();
    }
  };

  // Synchronize local editorState TO store siteContent whenever it changes
  useEffect(() => {
    if (isInitialLoad.current && (!editorState.addedModules || editorState.addedModules.length === 0)) return;
    
    // Generar el contrato de renderizado (SiteContent)
    const contract = generateRenderingContract(siteName);
    
    // Solo actualizar si realmente hay cambios para evitar bucles infinitos
    const currentSectionsHash = JSON.stringify(siteContent.sections);
    const newSectionsHash = JSON.stringify(contract.sections);
    
    if (currentSectionsHash !== newSectionsHash) {
      setSiteContent(contract as any);
    }
  }, [editorState.addedModules, editorState.settingsValues, siteName]);

  // Synchronize store settings back to local editorState
  useEffect(() => {
    if (siteContent.sections.length > 0) {
      setEditorState(prev => {
        const newSettings = { ...prev.settingsValues };
        let changed = false;
        
        siteContent.sections.forEach(section => {
          Object.entries(section.settings).forEach(([key, val]) => {
            const moduleId = section.id;
            const settingsKey = key.startsWith(`${moduleId}_`) ? key : `${moduleId}_${key}`;

            if (
              Object.prototype.hasOwnProperty.call(newSettings, settingsKey) &&
              newSettings[settingsKey] !== val
            ) {
              newSettings[settingsKey] = val;
              changed = true;
            }
          });
        });

        if (changed) {
          const next = { ...prev, settingsValues: newSettings };
          editorStateRef.current = next;
          return next;
        }
        return prev;
      });
    }
  }, [siteContent.sections]);

  // [SIP v12.0] Auto-sanitization of Footer Social Links
  // If the footer has empty placeholders and the project has real socials, update the editable state
  useEffect(() => {
    if (!project || !project.socials) return;
    
    const footerModules = editorState.addedModules.filter(m => m.type === 'footer' || m.id.startsWith('mod_footer'));
    if (footerModules.length === 0) return;

    let totalChanged = false;
    const newSettings = { ...editorState.settingsValues };

    footerModules.forEach(module => {
      const socialKey = `${module.id}_el_footer_social_social_links`;
      const currentSocials = getPlainValue(editorState.settingsValues[socialKey]);
      
      // We only auto-update if the current state is EXACTLY the default placeholder state
      // or if it's empty/missing
      const isPlaceholderState = !currentSocials || 
        !Array.isArray(currentSocials) || 
        currentSocials.length === 0 ||
        (currentSocials.length === 3 && 
         currentSocials.every(s => !s.url || s.url === '' || s.url === '#'));

      if (isPlaceholderState) {
        const resolved = resolveFooterSocialLinks(undefined, project.socials, { debug: true, moduleId: module.id });
        
        // Only update if we resolved something real (not more placeholders)
        const hasRealSocials = resolved.some(s => s.url && s.url !== '');
        
        if (hasRealSocials) {
          logDebug(`[SIP v12.0] Sincronizando redes de perfil para módulo ${module.id}`);
          newSettings[socialKey] = resolved;
          totalChanged = true;
        }
      }
    });

    if (totalChanged) {
      updateEditorState(prev => ({ ...prev, settingsValues: newSettings }));
    }
  }, [project, editorState.addedModules.length]);

  // Synchronize store selection back to local editorState
  const storeSelectedSectionId = useEditorStore(state => state.selectedSectionId);
  const storeSelectedElementId = useEditorStore(state => state.selectedElementId);

  const handlePreviewClick = useCallback(() => {
    if (activeTab === 'design-style' || activeTab === 'design-animations') {
      setActiveTab('constructor');
      setMobileTab('structure');
    }
  }, [activeTab]);

  useEffect(() => {
    updateEditorState(prev => {
      let changed = false;
      const newState = { ...prev };
      
      if (storeSelectedSectionId !== prev.expandedModuleId) {
        newState.expandedModuleId = storeSelectedSectionId;
        changed = true;
        
        // Auto-switch to constructor tab if selecting a section while in design tabs
        if (storeSelectedSectionId && (activeTab === 'design-style' || activeTab === 'design-animations')) {
          setActiveTab('constructor');
          setMobileTab('structure');
        }
      }
      
      if (storeSelectedElementId !== prev.selectedElementId) {
        newState.selectedElementId = storeSelectedElementId;
        changed = true;
      }

      if (changed) return newState;
      return prev;
    });
  }, [storeSelectedSectionId, storeSelectedElementId, activeTab]);

  const mapAICompositionPreset = (preset: AIPagePlan['sections'][number]['preset'] | string | null): CompositionPresetId => {
    if (preset === 'servicios') return 'services_grid';
    if (preset === 'proceso') return 'process_steps';
    if (preset === 'comparativa') return 'comparison';
    if (preset === 'confianza_logos') return 'trust_logos';
    return (preset || 'hero_visual_premium') as CompositionPresetId;
  };

  const resolveAISectionModule = (section: AIPagePlan['sections'][number]): WebModule => {
    switch (section.moduleType) {
      case 'contact':
        return CONTACT_MODULE;
      case 'faq':
        return FAQ_MODULE;
      case 'testimonials':
        return TESTIMONIALS_MODULE;
      case 'gallery':
        return GALLERY_MODULE;
      case 'cta':
        return CTA_MODULE;
      case 'features':
        return FEATURES_MODULE;
      case 'process':
        return PROCESS_MODULE;
      case 'composition_section':
      default:
        return COMPOSITION_SECTION_MODULE;
    }
  };

  const hydrateCompositionSchemaFromAISection = (section: AIPagePlan['sections'][number]) => {
    const schema = cloneCompositionPresetSchema(mapAICompositionPreset(section.preset));
    const textQueue = [
      section.content.eyebrow,
      section.content.title || section.title,
      section.content.description,
      ...(section.content.items || [])
    ].filter(Boolean) as string[];
    let textIndex = 0;

    const elements = schema.elements.map(element => {
      const nextElement = { ...element, content: element.content ? { ...element.content } : undefined };

      if (nextElement.content?.items && section.content.items?.length) {
        nextElement.content.items = nextElement.content.items.map((item, index) => ({
          ...item,
          text: section.content.items?.[index] || item.text
        }));
      }

      if (nextElement.type === 'button' && nextElement.content) {
        const label = section.content.cta || nextElement.content.label || 'Solicitar informacion';
        nextElement.content.label = label;
        nextElement.content.href = nextElement.content.href || '#';
        nextElement.actions = [{ type: 'link', target: nextElement.content.href, label }];
        return nextElement;
      }

      if ((nextElement.content?.text !== undefined) && ['badge', 'heading', 'paragraph'].includes(nextElement.type)) {
        nextElement.content.text = textQueue[textIndex] || nextElement.content.text;
        textIndex += 1;
      }

      return nextElement;
    });

    return validateCompositionSchema({
      ...schema,
      name: section.title,
      section: {
        ...schema.section,
        ariaLabel: section.title
      },
      elements
    });
  };

  const createModuleInstanceFromTemplate = (
    baseModule: WebModule,
    section?: AIPagePlan['sections'][number]
  ) => {
    const moduleId = `mod_${crypto.randomUUID()}`;
    const newElements = baseModule.elements.map(el => ({
      ...el,
      id: `${moduleId}_${el.id}`
    }));
    const initialValues: Record<string, any> = {};

    Object.values(baseModule.globalSettings || {}).forEach(groupSettings => {
      groupSettings.forEach(setting => {
        initialValues[`${moduleId}_global_${setting.id}`] = resolveProjectAwareSettingDefault(setting, setting.defaultValue);
      });
    });

    newElements.forEach(element => {
      Object.values(element.settings || {}).forEach(groupSettings => {
        groupSettings.forEach(setting => {
          let val = resolveProjectAwareSettingDefault(setting, setting.defaultValue);
          const settingId = setting.id;

          if (baseModule.type === 'contact') {
            if (settingId === 'title') val = section?.content.title || section?.title || val;
            if (settingId === 'subtitle' || settingId === 'description') val = section?.content.description || val;
            if (settingId === 'button_text' || settingId === 'cta_text') val = section?.content.cta || val;
            if ((settingId === 'phone' || settingId === 'whatsapp_number') && project?.whatsapp) val = project.whatsapp;
            if (settingId === 'email' && project?.email) val = project.email;
            if (settingId === 'address' && project?.address) val = project.address;
          } else if (section) {
            if (settingId === 'title' || settingId.endsWith('_title')) val = section.content.title || section.title || val;
            if (settingId === 'subtitle' || settingId === 'description' || settingId.endsWith('_description')) val = section.content.description || val;
            if (settingId === 'button_text' || settingId === 'cta_text' || settingId.endsWith('_cta_text')) val = section.content.cta || val;
          }

          initialValues[`${element.id}_${setting.id}`] = val;
        });
      });
    });

    const newModule: WebModule = {
      ...baseModule,
      id: moduleId,
      templateId: baseModule.id,
      name: section?.title || baseModule.name,
      elements: newElements
    };

    return { moduleId, newModule, initialValues };
  };

  const handleGenerateAIPagePlan = async (brief: AIPageGenerationBrief) => {
    setIsGeneratingAI(true);
    setAiError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 650));
      setAiPagePlan(await generateAIPagePlan({
        ...brief,
        businessName: brief.businessName || project?.name || siteName
      }, {
        projectId,
        userId: currentUserId
      }));
    } catch (error: any) {
      setAiError(error.message || 'No se pudo generar el plan de pagina.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleApplyAIPagePlan = () => {
    if (!aiPagePlan) return;

    updateEditorState(prev => {
      const nextSettings = { ...prev.settingsValues };
      const nextModules: WebModule[] = [];

      aiPagePlan.sections.forEach(section => {
        const baseModule = resolveAISectionModule(section);
        const { moduleId, newModule, initialValues } = createModuleInstanceFromTemplate(baseModule, section);
        Object.assign(nextSettings, initialValues);

        if (baseModule.type === 'composition_section') {
          const schema = hydrateCompositionSchemaFromAISection(section);
          nextSettings[`${moduleId}_el_composition_tree_schema`] = JSON.stringify(schema, null, 2);
          (newModule as any).content = { composition: schema };
        }

        nextSettings[getShowInMenuKey(moduleId)] = isMenuEligibleModule(baseModule);
        nextModules.push(newModule);
      });

      return {
        ...prev,
        addedModules: nextModules,
        settingsValues: nextSettings,
        expandedModuleId: nextModules[0]?.id || prev.expandedModuleId,
        selectedElementId: nextModules[0] ? `${nextModules[0].id}_global` : prev.selectedElementId,
        recentlyAddedModuleId: nextModules[0]?.id,
        totalModulesAdded: nextModules.length
      };
    });

    setShowAIInitialForm(false);
    setOnboardingFinished(true);
    setAiPagePlan(null);
    markUnsavedChanges();
  };

  const handleAISubmit = async (data: ProjectFormData) => {
    // [PHASE 3D.5.2] INTERCEPTAMOS EL FLUJO PARA USAR EL ENDPOINT SEGURO
    setMotherAIBrief(data);
    setIsMotherAIConfirmationOpen(true);
    
    // Generar key persistente para este intento
    const key = `web-landing-${projectId || 'anon'}-${Date.now()}`;
    setActiveIdempotencyKey(key);
  };

  const executeSecureAIGeneration = async () => {
    if (!motherAIBrief || !projectId) {
      setAiError("Cerrado: Faltan datos del proyecto o del brief.");
      return;
    }

    // Bloquear dobles clics
    if (isRunningRef.current) {
      logDebug('[CONSTRUCTOR_GENERATE_LANDING_DUPLICATE_BLOCKED]', {
        idempotencyKey: activeIdempotencyKey,
        actionSlug: 'web_ai_generate_landing'
      });
      return;
    }

    logDebug(isDryRun ? '[CONSTRUCTOR_LANDING_DRY_RUN_LOCAL]' : '[CONSTRUCTOR_LANDING_REAL_EXECUTION_START]', {
      mode: isDryRun ? "dry-run" : "real",
      willCallBackend: !isDryRun,
      estimatedCostCredits: 15,
      actionSlug: 'web_ai_generate_landing',
      idempotencyKey: activeIdempotencyKey
    });

    isRunningRef.current = true;
    setIsMotherAIConfirmationOpen(false);
    setHasStartedAI(true);
    setIsGeneratingAI(true);
    setAiGenerationStep(0);
    setAiError(null);

    const stepInterval = setInterval(() => {
      setAiGenerationStep(prev => (prev < 3 ? prev + 1 : prev));
    }, isDryRun ? 1000 : 4000); // Dry run faster

    try {
      let response: MotherAIPageResponse;

      if (isDryRun) {
        logDebug('[CONSTRUCTOR_LANDING_DRY_RUN_GUARD_BLOCKED_FETCH]', {
          reason: "dry-run must be 100% local",
          actionSlug: 'web_ai_generate_landing'
        });
        
        // Simular un pequeño delay para feedback visual
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        response = generateLandingDryRunLocal({
          businessName: motherAIBrief.name,
          industry: motherAIBrief.industry
        });
      } else {
        response = await generateLandingWithMotherAI(
          projectId,
          {
            businessName: motherAIBrief.name,
            industry: motherAIBrief.industry || 'General',
            description: motherAIBrief.description,
            goal: motherAIBrief.goal || 'Branding',
            tone: motherAIBrief.tone || 'Profesional',
            style: motherAIBrief.style || 'Moderno',
            targetAudience: motherAIBrief.targetAudience || 'Clientes potenciales'
          },
          activeIdempotencyKey!,
          { isDryRun: false }
        );
      }

      clearInterval(stepInterval);

      if (!response.success) {
        throw new Error(response.error || 'La generación con IA falló.');
      }

      if (isDryRun) {
        setIsGeneratingAI(false);
        // [FASE 4] Mostrar estado SIMULADO
        setAiUsageSuccess({
          costCredits: 15,
          totalTokens: 0,
          aiUsageLogId: "dry_run_simulated",
          isDryRun: true
        });
        logDebug('[CONSTRUCTOR_LANDING_DRY_RUN_RESULT_LOCAL]', response);
        isRunningRef.current = false;
        return;
      }

      const backendPage = response.data?.page;
      if (!backendPage || !Array.isArray(backendPage.sections) || backendPage.sections.length === 0) {
        throw new Error("El servidor no devolvió secciones válidas.");
      }

      // [PROTOCOL 13.1] HIDRATACIÓN DESDE BACKEND SEGURO
      updateEditorState(prev => {
        let newSettings = { ...prev.settingsValues };
        const newAddedModules: WebModule[] = [];
        
        backendPage.sections.forEach((sec: any) => {
          const baseModule = Object.values(registryModules).find((m: any) => 
            (m as any).id === sec.type || (m as any).id === sec.moduleId
          ) as WebModule;
          
          if (!baseModule) {
            console.warn(`[AI_HYDRATION] Módulo no reconocido: ${sec.type}`);
            return;
          }

          const moduleId = `mod_${crypto.randomUUID()}`;
          const moduleElements = baseModule.elements.map(el => {
            const elId = `${moduleId}_${el.id}`;
            const backendElements = sec.elements || [];
            const backendEl = backendElements.find((be: any) => 
              be.id === el.id || be.id === el.id.replace('el_', '')
            );

            if (backendEl && backendEl.fields) {
              backendEl.fields.forEach((f: any) => {
                newSettings[`${elId}_${f.id}`] = f.value;
              });
            } else if (sec.content) {
              Object.entries(sec.content).forEach(([k, v]) => {
                if (k === 'title' && el.id.includes('typography')) newSettings[`${elId}_title`] = v;
                if (k === 'subtitle' && el.id.includes('typography')) newSettings[`${elId}_subtitle`] = v;
                if (k === 'image_url' && el.id.includes('media')) newSettings[`${elId}_image`] = v;
              });
            }

            return { ...el, id: elId };
          });

          newAddedModules.push({
            ...baseModule,
            id: moduleId,
            name: sec.name || baseModule.name,
            elements: moduleElements
          });
        });

        return {
          ...prev,
          addedModules: newAddedModules, 
          settingsValues: newSettings,
          totalModulesAdded: newAddedModules.length
        };
      });

      // [FASE 6] Corregir mapeo de costo para soportar totalConsumed
      const usageData = response.usage as any;
      const cost = usageData?.costCredits || usageData?.total_consumed || usageData?.totalConsumed || 15;
      
      setAiUsageSuccess({
        costCredits: cost,
        totalTokens: response.usage?.totalTokens || 0,
        aiUsageLogId: response.usage?.aiUsageLogId || 'unknown'
      });

      logDebug('[CONSTRUCTOR_GENERATE_LANDING_REAL_SUCCESS]', {
        idempotencyKey: activeIdempotencyKey,
        costCredits: cost
      });

      setSiteName(motherAIBrief.name);
      markUnsavedChanges();
      setIsGeneratingAI(false);
      setOnboardingFinished(true);

    } catch (err: any) {
      console.error('[AI_GENERATION_ERROR]', err);
      setAiError(err.message || 'Error en la generación segura.');
      setIsGeneratingAI(false);
    } finally {
      isRunningRef.current = false;
    }
  };

  const handleAISubmitLegacy = async (data: ProjectFormData) => {
    setShowAIInitialForm(false);
    setHasStartedAI(true);
    setIsGeneratingAI(true);
    setAiGenerationStep(0);
    setAiError(null);

    try {
      const context: AIGenerationContext = {
        siteName: data.name,
        industry: data.industry,
        description: data.description,
        goal: data.goal,
        style: data.style,
        brandColors: [
          editorState.settingsValues['global_theme_primary_color'],
          editorState.settingsValues['global_theme_secondary_color'],
          editorState.settingsValues['global_theme_accent_color'],
        ].filter(Boolean)
      };

      const generationPromise = generateSite(context);
      setHasStartedAI(true);
      setOnboardingFinished(true); // Persistir que ya terminamos el onboarding
      
      setTimeout(() => setAiGenerationStep(1), 2000);
      setTimeout(() => setAiGenerationStep(2), 5000);
      setTimeout(() => setAiGenerationStep(3), 8000);

      const result = await generationPromise;

      updateEditorState(prev => {
        let newSettings = { ...prev.settingsValues };
        
        newSettings['global_theme_primary_color'] = result.theme.primaryColor;
        newSettings['global_theme_accent_color'] = result.theme.accentColor;
        newSettings['global_theme_background_color'] = result.theme.backgroundColor;
        newSettings['global_theme_text_color'] = result.theme.textColor;
        newSettings['global_theme_font_sans'] = result.theme.fontSans;
        newSettings['global_theme_font_heading'] = result.theme.fontDisplay;
        newSettings['global_theme_radius'] = parseInt(result.theme.borderRadius);

        const newAddedModules: WebModule[] = [];
        
        result.sections.forEach((sec, idx) => {
          const baseModule = Object.values(registryModules).find((m: any) => (m as any).id === sec.moduleId) as WebModule;
          if (!baseModule) return;

          // Use persistent UUIDs (Solutium Protocol v2.0)
          const rawId = crypto.randomUUID();
          const moduleId = `mod_${rawId}`;
          const newElements = baseModule.elements.map(el => {
            const elId = `${moduleId}_${el.id}`;
            Object.entries(sec.settingsValues).forEach(([key, val]) => {
              if (key.startsWith(el.id)) {
                const settingKey = key.replace(`${el.id}_`, '');
                newSettings[`${elId}_${settingKey}`] = val;
              } else if (sec.settingsValues[key] !== undefined) {
                newSettings[`${elId}_${key}`] = sec.settingsValues[key];
              }
            });
            return { ...el, id: elId };
          });

          if (sec.settingsValues) {
            Object.entries(sec.settingsValues).forEach(([key, val]) => {
              newSettings[`${moduleId}_global_${key}`] = val;
            });
          }

          newAddedModules.push({
            ...baseModule,
            id: moduleId,
            templateId: baseModule.id,
            elements: newElements
          });
        });

        return {
          ...prev,
          addedModules: newAddedModules,
          settingsValues: newSettings,
          totalModulesAdded: newAddedModules.length
        };
      });

      setSiteName(data.name);
      markUnsavedChanges();
      setIsGeneratingAI(false);
    } catch (error: any) {
      console.error("Error en Solutium AI Engine:", error);
      setIsGeneratingAI(false);
      setAiError(error.message || "No se pudo generar el sitio. Por favor, verifica tu conexión o las API Keys en Staging.");
    }
  };

  const addModule = (module: WebModule) => {
    logDebug('Adding module:', module.type);
    // Use persistent UUIDs (Solutium Protocol v2.0)
    const rawId = crypto.randomUUID();
    const moduleId = `mod_${rawId}`;
    
    // Prefix element IDs to ensure uniqueness
    const newElements = module.elements.map(el => ({
      ...el,
      id: `${moduleId}_${el.id}`
    }));

    const newModule = { 
      ...module, 
      id: moduleId,
      templateId: module.id,
      elements: newElements
    };

    // Initialize default values for all settings in the module
    const initialValues: Record<string, any> = {};
    
    // Global settings
    if (module.globalSettings) {
      Object.values(module.globalSettings).forEach(groupSettings => {
        groupSettings.forEach(setting => {
          let val = resolveProjectAwareSettingDefault(setting, setting.defaultValue);
          
          // Custom logic for specific settings
          if (setting.id === 'logo_text' && project?.name) {
            val = project.name.toUpperCase();
          }
          
          if (setting.type === 'product_selection') {
            const availableProducts = (products?.length || 0) > 0 ? products : (projectId === 'dev-project-id' ? MOCK_PRODUCTS : []);
            if ((availableProducts?.length || 0) > 0) {
              val = availableProducts.slice(0, 8).map(p => p.id);
            }
          }
          if (setting.type === 'customer_selection') {
            const availableCustomers = projectId === 'dev-project-id' ? MOCK_CUSTOMERS : [];
            if (availableCustomers.length > 0) {
              val = availableCustomers.slice(0, 6).map(c => c.id);
            }
          }
          if (setting.type === 'trusted_logo_selection') {
            const availableCompanies = (trustedCompanyLogos?.length || 0) > 0
              ? trustedCompanyLogos
              : (projectId === 'dev-project-id' ? normalizeTrustedCompanyLogos(MOCK_CUSTOMERS) : []);
            if (availableCompanies.length > 0) {
              val = availableCompanies.slice(0, 8).map(company => company.company_id);
            }
          }
          initialValues[`${moduleId}_global_${setting.id}`] = val;
        });
      });
    }

    // Element settings
    newElements.forEach(element => {
      if (element.settings) {
        Object.values(element.settings).forEach(groupSettings => {
          groupSettings.forEach(setting => {
            let val = resolveProjectAwareSettingDefault(setting, setting.defaultValue);
            
            // Custom logic for specific settings
            if ((setting.id === 'logo_text' || setting.id === 'brand_name') && project?.name) {
              val = project.name.toUpperCase();
            }

            // SIP v12.1: Intelligent product defaults
            if (module.type === 'products' || module.type === 'product_grid') {
              if (setting.id === 'selection_mode') {
                // If we have real DB products, default to 'auto' to show them instantly
                if ((products?.length || 0) > 0) {
                  val = 'auto';
                }
              }
              if (setting.id === 'select_products') {
                val = setting.defaultValue ?? null;
              }
            }

            if (module.type === 'trusted_logos' && setting.id === 'select_companies') {
              const availableCompanies = (trustedCompanyLogos?.length || 0) > 0
                ? trustedCompanyLogos
                : (projectId === 'dev-project-id' ? normalizeTrustedCompanyLogos(MOCK_CUSTOMERS) : []);
              if (availableCompanies.length > 0) {
                val = availableCompanies.slice(0, 8).map(company => company.company_id);
              }
            }

            if (setting.id === 'logo_img' && (project?.logoUrl || logoUrl)) {
              val = project?.logoUrl || logoUrl;
            }

            if (setting.id === 'logo_white_img' && (project?.logoWhiteUrl || logoWhiteUrl)) {
              val = project?.logoWhiteUrl || logoWhiteUrl;
            }

            if (setting.id === 'logo_img_alt' && project?.logoWhiteUrl) {
              val = project.logoWhiteUrl;
            }

            // SIP v11.2: Footer specific project data initialization
            if (module.type === 'footer') {
              if (setting.id === 'email' && project?.email) val = project.email;
              if (setting.id === 'phone' && project?.whatsapp) val = project.whatsapp;
              if (setting.id === 'address' && project?.address) val = project.address;
              if (setting.id === 'bio' && (project?.industry || project?.name)) {
                val = project?.industry || `Servicios profesionales de ${project?.name}`;
              }
              if (setting.id === 'copyright' && project?.name) {
                val = `© ${new Date().getFullYear()} ${project.name}. Todos los derechos reservados.`;
              }
            }

            if (module.type === 'contact') {
              if (setting.id === 'email' && project?.email) val = project.email;
              if (setting.id === 'phone' && project?.whatsapp) val = project.whatsapp;
              if (setting.id === 'whatsapp_number' && project?.whatsapp) val = project.whatsapp;
              if (setting.id === 'address' && project?.address) val = project.address;
              if (setting.id === 'button_text' && project?.whatsapp) val = 'Enviar por WhatsApp';
            }

            // The element.id already contains the moduleId prefix
            initialValues[`${element.id}_${setting.id}`] = val;
          });
        });
      }
    });

    updateEditorState(prev => {
      const addedModules = prev.addedModules || [];
      let newModules = [...addedModules];
      
      if (module.id === 'mod_header_1') {
        // Always at the very top
        newModules = [newModule, ...addedModules];
      } else if (module.id === 'mod_menu_1') {
        // Top, but below header if exists
        const headerIndex = addedModules.findIndex(m => m.id.startsWith('mod_header_1'));
        if (headerIndex !== -1) {
          newModules.splice(headerIndex + 1, 0, newModule);
        } else {
          newModules = [newModule, ...addedModules];
        }
      } else if (module.id === 'mod_footer_1') {
        // Always at the end
        newModules = [...addedModules, newModule];
      } else {
        // Standard module: insert before footer if exists, otherwise at the end
        const footerIndex = addedModules.findIndex(m => m.id.startsWith('mod_footer_1'));
        if (footerIndex !== -1) {
          newModules.splice(footerIndex, 0, newModule);
        } else {
          newModules = [...addedModules, newModule];
        }
      }

      const isUtilityModule = isUtilityMenuModule(module);

      let finalState: EditorState = {
        ...prev,
        addedModules: newModules,
        expandedModuleId: moduleId,
        selectedElementId: `${moduleId}_global`,
        expandedGroupsByElement: {
          ...prev.expandedGroupsByElement,
          [`${moduleId}_global`]: null
        },
        settingsValues: {
          ...prev.settingsValues,
          ...initialValues
        },
        recentlyAddedModuleId: moduleId,
        totalModulesAdded: (prev.totalModulesAdded || 0) + 1
      };

      if (isMenuEligibleModule(module)) {
        finalState.settingsValues[getShowInMenuKey(moduleId)] = true;
      } else {
        finalState.settingsValues[getShowInMenuKey(moduleId)] = false;
      }

      if (module.type === 'navegacion' || module.type === 'menu') {
        finalState.settingsValues[getMenuModeKey(moduleId)] =
          finalState.settingsValues[getMenuModeKey(moduleId)] || 'automatic';
      }

      // SOP: Auto-generate menu link if not utility
      if (!isPreviewMode && !isUtilityModule) {
        const menuMod = newModules.find(m => m.type === 'navegacion' || m.type === 'menu');
        if (menuMod) {
          finalState = rebuildMenuLinksIfNeeded(finalState, menuMod.id);
        }
      }

      if (!isPreviewMode && (module.type === 'navegacion' || module.type === 'menu')) {
        finalState = rebuildMenuLinksIfNeeded(finalState, moduleId);
      }

      return finalState;
    });

    // Mobile flow: jump to structure tab and show groups
    setMobileTab('structure');
  };

  const removeModule = (moduleId: string) => {
    const module = (editorState.addedModules || []).find(m => m.id === moduleId);
    if (module) {
      setModuleToDelete(module);
    }
  };

  const moveModule = (moduleId: string, direction: 'up' | 'down') => {
    updateEditorState(prev => {
      const addedModules = prev.addedModules || [];
      const index = addedModules.findIndex(m => m.id === moduleId);
      if (index === -1) return prev;
      
      const module = addedModules[index];
      
      // Restriction: Header cannot move down, Menu cannot move at all, Footer cannot move up
      if (module.id.startsWith('mod_header_1') && direction === 'down') return prev;
      if (module.id.startsWith('mod_menu_1')) return prev;
      if (module.id.startsWith('mod_footer_1') && direction === 'up') return prev;

      const newModules = [...addedModules];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      
      if (targetIndex < 0 || targetIndex >= newModules.length) return prev;

      const targetModule = addedModules[targetIndex];

      // Restriction: Cannot move a module above Header or Menu, or below Footer
      if (direction === 'up' && (targetModule.id.startsWith('mod_header_1') || targetModule.id.startsWith('mod_menu_1'))) return prev;
      if (direction === 'down' && targetModule.id.startsWith('mod_footer_1')) return prev;
      
      const temp = newModules[index];
      newModules[index] = newModules[targetIndex];
      newModules[targetIndex] = temp;
      
      return {
        ...prev,
        addedModules: newModules
      };
    });
  };

  const confirmRemoveModule = () => {
    if (!moduleToDelete) return;
    
    const moduleId = moduleToDelete.id;
    updateEditorState(prev => {
      const newModules = prev.addedModules.filter(m => m.id !== moduleId);
      
      // Clean up settings for this module
      const newSettingsValues = { ...prev.settingsValues };
      Object.keys(newSettingsValues).forEach(key => {
        if (key.startsWith(moduleId)) {
          delete newSettingsValues[key];
        }
      });

      const menuModule = newModules.find(m => m.type === 'navegacion' || m.type === 'menu');
      if (menuModule) {
        newSettingsValues[getShowInMenuKey(moduleId)] = false;
      }

      let nextState: EditorState = {
        ...prev,
        addedModules: newModules,
        expandedModuleId: prev.expandedModuleId === moduleId ? null : prev.expandedModuleId,
        selectedElementId: prev.selectedElementId?.startsWith(moduleId) ? null : prev.selectedElementId,
        settingsValues: newSettingsValues
      };

      if (menuModule) {
        nextState = rebuildMenuLinksIfNeeded(nextState, menuModule.id);
      }

      return nextState;
    });
    setModuleToDelete(null);
  };

  const rebuildMenuLinksIfNeeded = (state: EditorState, menuModuleId: string) => {
    const menuItemsElId = `${menuModuleId}_el_menu_items`;
    const menuLinksKey = `${menuItemsElId}_links`;
    const currentLinks = dedupeMenuLinks(state.settingsValues[menuLinksKey] || []);
    const autoAnchors = new Set(
      (state.addedModules || [])
        .filter((module) => isMenuEligibleModule(module))
        .map((module) => `#${module.id}`)
    );

    const manualLinks = currentLinks.filter((link) => {
      if (!link || typeof link !== 'object') return false;
      if (link.is_title) return true;
      const url = String(link.url || '').trim();
      if (!url.startsWith('#')) return true;
      return !autoAnchors.has(url);
    });

    const visibleLinks = buildAutomaticMenuItems({
      modules: state.addedModules || [],
      settingsValues: state.settingsValues
    });

    return {
      ...state,
      settingsValues: {
        ...state.settingsValues,
        [menuLinksKey]: dedupeMenuLinks([...visibleLinks, ...manualLinks])
      }
    };
  };

  const handleSettingChange = (elementOrModuleId: string, settingId: string, value: any) => {
    updateEditorState(prev => {
      const nextSettingsValues: Record<string, any> = {
        ...prev.settingsValues,
        [`${elementOrModuleId}_${settingId}`]: value
      };

      if (settingId === 'bg_parallax_enabled' && value === true) {
        const parallaxImageKey = `${elementOrModuleId}_bg_parallax_img`;
        const parallaxOpacityKey = `${elementOrModuleId}_bg_parallax_opacity`;
        const parallaxSpeedKey = `${elementOrModuleId}_bg_parallax_speed`;
        const currentParallaxImage = prev.settingsValues[parallaxImageKey];
        const currentParallaxOpacity = prev.settingsValues[parallaxOpacityKey];
        const currentParallaxSpeed = prev.settingsValues[parallaxSpeedKey];

        if (!currentParallaxImage || String(currentParallaxImage).trim() === '') {
          nextSettingsValues[parallaxImageKey] = DEFAULT_PARALLAX_BG_IMAGE;
        }
        if (currentParallaxOpacity === undefined || currentParallaxOpacity === null || currentParallaxOpacity === 20 || currentParallaxOpacity === '20') {
          nextSettingsValues[parallaxOpacityKey] = 38;
        }
        if (currentParallaxSpeed === undefined || currentParallaxSpeed === null || currentParallaxSpeed === 100 || currentParallaxSpeed === '100') {
          nextSettingsValues[parallaxSpeedKey] = 160;
        }
      }

      let nextState: EditorState = {
        ...prev,
        settingsValues: nextSettingsValues
      };

      const isDesktopHamburgerToggle =
        settingId === 'global_desktop_hamburger' ||
        settingId === 'desktop_hamburger';
      const isShowInMenuToggle =
        settingId === 'global_show_in_menu' ||
        settingId === 'show_in_menu';

      if (isDesktopHamburgerToggle && value === false) {
        const menuModule = prev.addedModules.find(
          (module) =>
            module.id === elementOrModuleId ||
            module.type === 'navegacion' ||
            module.type === 'menu'
        );

        if (menuModule) {
          nextState = rebuildMenuLinksIfNeeded(nextState, menuModule.id);
        }
      }

      if (isShowInMenuToggle) {
        const menuModule = prev.addedModules.find(
          (module) => module.type === 'navegacion' || module.type === 'menu'
        );

        if (menuModule) {
          nextState = rebuildMenuLinksIfNeeded(nextState, menuModule.id);
        }
      }

      return nextState;
    });
  };

  const handleMobileTabChange = (tab: 'constructor' | 'structure' | 'preview') => {
    setMobileTab(tab);
    if (tab === 'preview') {
      setViewport('mobile');
    }
  };

  // --- HELPERS ---

// Helper to check for persistent UUIDs (Solutium Protocol v2.0)
const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

const migrateEditorStateToUUIDs = (state: any): any => {
  let changed = false;
  let newState = { ...state };
  let newSettings = { ...state.settingsValues };

  const addedModules = state.addedModules || [];
  const newAddedModules = addedModules.map((mod: any) => {
    if (!isUUID(mod.id)) {
      const oldId = mod.id;
      const newId = crypto.randomUUID();
      changed = true;
      
      const updatedMod = { ...mod, id: newId };
      updatedMod.elements = (mod.elements || []).map((el: any) => {
        const oldElId = el.id;
        const newElId = el.id.replace(oldId, newId);
        
        Object.keys(newSettings).forEach(key => {
          if (key.startsWith(oldElId)) {
            const newKey = key.replace(oldElId, newElId);
            newSettings[newKey] = newSettings[key];
            delete newSettings[key];
          }
        });
        
        return { ...el, id: newElId };
      });

      Object.keys(newSettings).forEach(key => {
        if (key.startsWith(`${oldId}_global`)) {
          const newKey = key.replace(oldId, newId);
          newSettings[newKey] = newSettings[key];
          delete newSettings[key];
        }
      });

      return updatedMod;
    }
    return mod;
  });

  if (changed) {
    if (newState.expandedModuleId && !isUUID(newState.expandedModuleId)) {
        const idx = addedModules.findIndex((m: any) => m.id === newState.expandedModuleId);
        if (idx !== -1) newState.expandedModuleId = newAddedModules[idx].id;
    }
    if (newState.selectedElementId && !isUUID(newState.selectedElementId.split('_')[0])) {
        const parts = newState.selectedElementId.split('_');
        const oldId = parts[0];
        const idx = addedModules.findIndex((m: any) => m.id === oldId);
        if (idx !== -1) {
            parts[0] = newAddedModules[idx].id;
            newState.selectedElementId = parts.join('_');
        }
    }

    return {
      ...newState,
      addedModules: newAddedModules,
      settingsValues: newSettings
    };
  }
  return state;
};

const formatTimestampName = () => {
    const now = new Date();
    const yy = now.getFullYear().toString().slice(-2);
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
    const dd = now.getDate().toString().padStart(2, '0');
    
    let hours = now.getHours();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hh = hours.toString().padStart(2, '0');
    
    const min = now.getMinutes().toString().padStart(2, '0');
    const ss = now.getSeconds().toString().padStart(2, '0');
    
    return `${yy}-${mm}-${dd}_${hh}-${min}-${ss}-${ampm}`;
  };

  const handleLogoClick = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedModal(true);
    } else {
      onBackToDashboard();
    }
  };

  const handleSaveAndExit = async () => {
    await handleSaveDraft();
    onBackToDashboard();
  };

  const handleExitWithoutSaving = () => {
    onBackToDashboard();
  };

  const generateRenderingContract = (finalSiteName: string, stateToUse?: any): RenderingContract => {
    const currentState = stateToUse || editorState;
    const automaticMenuItems = buildAutomaticMenuItems({
      modules: currentState.addedModules || [],
      settingsValues: currentState.settingsValues || {}
    });
    // Helper to get setting value with fallback and CLEAN value extraction
    const getVal = (moduleId: string, elementId: string | null, settingId: string, defaultValue: any) => {
      const key = elementId ? `${moduleId}_${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
      const rawValue = currentState.settingsValues[key] !== undefined ? currentState.settingsValues[key] : defaultValue;
      
      // Clean value: If it's an object with a 'value' property (editor metadata), extract just the value
      if (rawValue && typeof rawValue === 'object' && 'value' in rawValue && !Array.isArray(rawValue)) {
        return rawValue.value;
      }
      return rawValue;
    };

    // --- ORDEN DE SERIALIZACIÓN BIT-A-BIT (PROTOCOLO SOLUTIUM v2.3) ---
    const atomicTransform = (key: string, value: any) => {
      const result: Record<string, any> = {};
      
      // 1. Colometría Detallada (Standard --sv-)
      if (typeof value === 'string' && (value.startsWith('#') || value.startsWith('rgba') || value.startsWith('rgb') || value.includes('var('))) {
        const varName = value.includes('var(') ? value.match(/var\(([^)]+)\)/)?.[1] : `--sv-${key.replace(/_/g, '-')}`;
        result[`${key}_hex`] = value.startsWith('#') ? value : null;
        result[`${key}_rgba`] = (value.startsWith('rgb') && !value.includes('var(')) ? value : null;
        result[`${key}_variable`] = varName;
        result[`${key}_fallback`] = value.startsWith('#') ? '#000000' : 'rgba(0,0,0,1)';
        result[key] = value;
        return result;
      }

      // 2. Dimensiones Bit-a-Bit con Unidad Explícita
      const dimensionKeys = ['radius', 'gap', 'padding', 'width', 'height', 'thickness', 'size', 'margin', 'offset', 'letter_spacing', 'line_height', 'blur', 'spread'];
      if (typeof value === 'number' && dimensionKeys.some(dk => key.includes(dk))) {
        let unit = 'px';
        if (key.includes('line_height')) unit = 'em';
        else if (key.includes('vh')) unit = 'vh';
        else if (key.includes('vw')) unit = 'vw';
        else if (key.includes('%')) unit = '%';
        
        result[key] = `${value}${unit}`;
        result[`${key}_val`] = value;
        result[`${key}_unit`] = unit;
        return result;
      }

      // 3. Desfase de Efectos (Audit Ready)
      if (key.includes('shadow') && typeof value === 'string' && value.includes('px')) {
        const parts = value.split(' ');
        result[`${key}_details`] = {
          x: parts[0] || '0px',
          y: parts[1] || '0px',
          blur: parts[2] || '0px',
          spread: parts[3] || '0px',
          color: parts[4] || '#000000'
        };
      }

      // 4. Tipografía Obligatoria & Booleans
      result[key] = value;
      return result;
    };

    // Helper for Config Hash (Solutium Protocol v2.3 compliant)
    const computeConfigHash = (obj: any): string => {
        const str = JSON.stringify(obj);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return `sha23-${Math.abs(hash).toString(16)}`;
    };

    // 1. Determine Global Theme
    const resolvedTheme = getProjectThemeFromSettings(currentState.settingsValues, projectThemeSeed);
    const primaryColor = resolvedTheme.primary;
    const secondaryColor = resolvedTheme.secondary;
    const accentColor = resolvedTheme.accent;
    const backgroundColor = resolvedTheme.background;
    const textColor = resolvedTheme.text;
    const mutedColor = resolvedTheme.muted;
    const borderColor = resolvedTheme.border;

    const sections = currentState.addedModules.map(module => {
        const content: any = {
          eyebrow: '',
          title: '',
          subtitle: '',
          primary_cta: { text: '', url: '' },
          secondary_cta: { text: '', url: '' },
          image_url: ''
        };
        const settings: any = {};
        const styles: any = {
          'border-radius': '0px',
          'box-shadow': 'none',
          'font-family': project?.fontFamily || 'Inter',
          'button-styles': {}
        };
        const audit_specs: any = {};

        // Extract ALL settings for this module
        Object.entries(currentState.settingsValues).forEach(([key, rawValue]) => {
          if (key.startsWith(module.id)) {
            // Clean value: Extract primitive if it's an editor-wrapped object
            let value = rawValue;
            if (rawValue && typeof rawValue === 'object' && 'value' in rawValue && !Array.isArray(rawValue)) {
              value = rawValue.value;
            }

            // Remove module ID prefix
            const relativeKey = key.replace(`${module.id}_`, '');
            
            // Remove secondary technical prefixes like "el_hero_", "el_contact_", etc. 
            // for INTERNAL detection logic (not for storage)
            // Apply Atomic Transform using the FULL relative key to preserve fidelity
            const atomicValues = atomicTransform(relativeKey, value);

            // --- SEPARATION OF POWERS (Solutium Protocol v7.7) ---
            // High fidelity identification using exact suffixes
            const isEyebrowText = relativeKey.endsWith('_eyebrow') && !relativeKey.includes('_color') && !relativeKey.includes('_bg');
            const isTitleText = (relativeKey.endsWith('_title') || relativeKey.endsWith('_texto_principal')) && !relativeKey.includes('_color') && !relativeKey.includes('_size') && !relativeKey.includes('_weight') && !relativeKey.includes('_highlight');
            const isSubtitleText = (relativeKey.endsWith('_subtitle') || relativeKey.endsWith('_texto_secundario')) && !relativeKey.includes('_color') && !relativeKey.includes('_size') && !relativeKey.includes('_weight') && !relativeKey.includes('_highlight');
            
            const isPrimaryCtaText = relativeKey.endsWith('_primary_text') || relativeKey.endsWith('_cta_text');
            const isPrimaryCtaUrl = relativeKey.endsWith('_primary_url') || relativeKey.endsWith('_cta_url');
            const isSecondaryCtaText = relativeKey.endsWith('_secondary_text');
            const isSecondaryCtaUrl = relativeKey.endsWith('_secondary_url');

            const isImageField = (relativeKey.endsWith('_image') || relativeKey.endsWith('_image_url') || relativeKey.endsWith('_img')) && !isPrimaryCtaUrl && !isSecondaryCtaUrl;
            
            // Map legacy cleanKey for other detections
            const cleanKey = relativeKey.replace(/^el_[a-zA-Z0-9]+_/, '').replace(/^global_/, '');
            
            // Rotating Text Detection (Solutium Protocol)
            const isRotatingFixed = cleanKey === 'rotating_fixed' || cleanKey === 'texto_base' || cleanKey.endsWith('_rotating_fixed');
            const isRotatingOptions = cleanKey === 'rotating_options' || cleanKey === 'rotating_items' || cleanKey === 'rotating_words' || cleanKey === 'palabras_efecto' || cleanKey.endsWith('_rotating_options');
            const isTitleMode = cleanKey === 'title_mode' || cleanKey.endsWith('_title_mode');
            const isRotatingEnabled = cleanKey === 'rotating_enabled' || cleanKey === 'is_rotating_active' || cleanKey.endsWith('_rotating_enabled');
            const isRotatingSpeed = cleanKey === 'rotating_speed' || cleanKey === 'intervalo_ms' || cleanKey.endsWith('_rotating_speed');

            // --- ALLOCATION (Solutium v7.7 - Order Sensitive) ---
            const isContentField = isEyebrowText || isTitleText || isSubtitleText || isImageField || isPrimaryCtaText || isPrimaryCtaUrl || isSecondaryCtaText || isSecondaryCtaUrl || isRotatingOptions || isRotatingFixed || isTitleMode || isRotatingEnabled || isRotatingSpeed;

            if (isEyebrowText) {
              content.eyebrow = value;
            } else if (isTitleText && !content.title) {
              if (module.type === 'hero' || module.id.startsWith('mod_hero')) {
                content.texto_principal = value;
              }
              content.title = value;
            } else if (isSubtitleText && !content.subtitle) {
              if (module.type === 'hero' || module.id.startsWith('mod_hero')) {
                content.texto_secundario = value;
                content.texto_descripcion = value;
              }
              content.subtitle = value;
            } else if (isPrimaryCtaText) {
              content.primary_cta.text = value;
            } else if (isPrimaryCtaUrl) {
              content.primary_cta.url = value;
            } else if (isSecondaryCtaText) {
              content.secondary_cta.text = value;
            } else if (isSecondaryCtaUrl) {
              content.secondary_cta.url = value;
            } else if (isImageField && !content.image_url) {
              content.image_url = value;
            } else if (isRotatingFixed) {
              content.texto_base = value;
            } else if (isRotatingOptions) {
              if (Array.isArray(value)) {
                content.palabras_efecto = value.map((item: any) => typeof item === 'object' ? (item.text || item.value || '') : item);
              } else {
                content.palabras_efecto = [value];
              }
            } else if (isTitleMode) {
              const normalizedTitleMode = value === 'dynamic' ? 'dynamic' : 'static';
              content.title_mode = normalizedTitleMode;
              content.is_rotating_active = normalizedTitleMode === 'dynamic';
            } else if (isRotatingEnabled) {
              content.is_rotating_active = value === true || value === 'true';
            } else if (isRotatingSpeed) {
              content.intervalo_ms = parseInt(String(value)) || 3000;
            }
            
            // Allocation to Styles/Settings & Audit Specs (Solutium Protocol v2.3)
            // Note: Colors and styles should ALWAYS go to settings, even if they contain text-like keywords
            if (!isContentField || isPrimaryCtaUrl || isPrimaryCtaText || isEyebrowText || isImageField || isRotatingOptions || isRotatingFixed || isTitleMode || isRotatingEnabled || isRotatingSpeed) {
              // Standard mapping for common containers
              const isBorderRadius = cleanKey.includes('radius') || cleanKey.includes('rounded');
              const isShadow = cleanKey.includes('shadow');
              const isFontFamily = cleanKey === 'font_family' || cleanKey === 'fontFamily';
              const isButtonStyles = cleanKey.includes('button_style') || cleanKey.includes('btn_');

              if (isBorderRadius) {
                styles['border-radius'] = typeof value === 'number' ? `${value}px` : value;
                audit_specs['.module-container'] = { ...audit_specs['.module-container'], 'border-radius': styles['border-radius'] };
              } else if (isShadow) {
                styles['box-shadow'] = value;
                audit_specs['.module-container'] = { ...audit_specs['.module-container'], 'box-shadow': value };
              } else if (isFontFamily) {
                styles['font-family'] = value;
                audit_specs['.module-container'] = { ...audit_specs['.module-container'], 'font-family': value };
              } else if (isButtonStyles) {
                Object.assign(styles['button-styles'], atomicValues);
                audit_specs['.btn-primary'] = { ...audit_specs['.btn-primary'], ...atomicValues };
              } else if (cleanKey.includes('color') || cleanKey.includes('bg_') || cleanKey.includes('text_')) {
                // Map all colors to common selectors
                const targetSelector = cleanKey.includes('text') ? '.title-element' : '.module-container';
                audit_specs[targetSelector] = { ...audit_specs[targetSelector], ...atomicValues };
              }
              
              // Directiva v1.5: Everything not explicitly forbidden goes to settings
              const forbiddenKeys = ['label', 'defaultValue', 'min', 'max', 'showIf', 'options', 'unit', 'step'];
              if (!forbiddenKeys.includes(cleanKey)) {
                Object.assign(settings, atomicValues);
              }
            }
          }
        });

        // Safeguard: Ensure content has meaningful values or generic placeholders
        if (!content.title) content.title = module.name;

        if ((module.type === 'menu' || module.type === 'navegacion') && !module.id.startsWith('mod_footer_1')) {
          const menuMode = resolveMenuMode(module.id, currentState.settingsValues || {});
          const manualLinksKey = `${module.id}_el_menu_items_links`;
          const manualLinks = dedupeMenuLinks(
            Array.isArray(currentState.settingsValues?.[manualLinksKey])
              ? currentState.settingsValues[manualLinksKey]
              : []
          );

          settings['global_menu_mode'] = menuMode;
          settings['el_menu_items_links'] = menuMode === 'manual' ? manualLinks : automaticMenuItems;
        }

        // Specific overrides for modules that have multiple items (like products/clients)
        if (module.type === 'products' || module.type === 'product_grid') {
          // [SIP v5.5 FIX] Correctly resolve product selection settings from el_products_config
          const selectionMode = String(getVal(module.id, 'el_products_config', 'selection_mode', 'auto') || 'auto').toLowerCase();
          const rawSelectedIds = getVal(module.id, 'el_products_config', 'select_products', []);
          const selectedIds = Array.isArray(rawSelectedIds) ? rawSelectedIds.map(String).filter(Boolean) : [];
          const catalogProducts = Array.isArray(products) ? products.filter(Boolean) : [];
          const isManualSelectionMode = ['manual', 'selected', 'selection', 'featured', 'custom'].includes(selectionMode);
          
          content.selectionMode = selectionMode;
          content.productIds = selectedIds;

          // [PROTOCOL 12.1] ATOMIC SNAPSHOT: Resolve real products for the published contract
          let finalProducts: Product[] = [];
          
          if (catalogProducts.length > 0) {
            if (isManualSelectionMode) {
              if (selectedIds.length > 0) {
                const selectedIdSet = new Set(selectedIds);
                finalProducts = catalogProducts.filter(p => selectedIdSet.has(String(p.id)));
                logDebug(`[PRODUCTS_CONTRACT_DEBUG] Resolved ${finalProducts.length} manually selected products.`);
              } else {
                // [SIP v5.6 FIX] If manual mode but empty selection, publish EMPTY list, do NOT fallback to latest products
                finalProducts = [];
                logDebug(`[PRODUCTS_CONTRACT_DEBUG] Manual selection is empty. Publishing empty product list.`);
              }
            } else {
              // Default to auto: publish the full real project catalog for 'auto' mode
              finalProducts = [...catalogProducts]
                .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
              logDebug(`[PRODUCTS_CONTRACT_DEBUG] Resolved ${finalProducts.length} automated products (Mode: ${selectionMode}).`);
            }
          }


          if (finalProducts.length > 0) {
            // [PROTOCOL 12.3] DATA NORMALIZATION
            const normalizedProducts = finalProducts.map((p, idx) => {
              const rawPrice = (p as any).price;
              const rawRefPrice = (p as any).priceReference;
              const rawStock = (p as any).stock;

              const priceNum = typeof rawPrice === 'string' ? parseFloat(rawPrice.replace(/[^\d.,-]/g, '').replace(',', '.')) : rawPrice;
              const refPriceNum = typeof rawRefPrice === 'string' ? parseFloat(rawRefPrice.replace(/[^\d.,-]/g, '').replace(',', '.')) : rawRefPrice;
              const stockNum = typeof rawStock === 'string' ? parseInt(rawStock, 10) : rawStock;

              return {
                ...p,
                id: String(p.id || `prod_${idx}`),
                name: String(p.name || `Producto ${idx + 1}`),
                price: Number.isFinite(priceNum) ? Number(priceNum) : undefined,
                priceReference: Number.isFinite(refPriceNum) ? Number(refPriceNum) : undefined,
                stock: Number.isFinite(stockNum) ? Number(stockNum) : undefined,
                ratingAverage: Number.isFinite(p.ratingAverage) ? Number(p.ratingAverage) : 5,
                reviewCount: Number.isFinite(p.reviewCount) ? Number(p.reviewCount) : 0
              };
            });

            content.products = normalizedProducts;
            content.productos = normalizedProducts; // Legacy fallback
            content.items = normalizedProducts; // Legacy fallback
            
            // Also store in deep settings for hydrationBridge consistency
            const snapshotKey = `${module.id}_el_products_items_products`;
            settings[snapshotKey] = normalizedProducts;
            
            logDebug('[PRODUCTS_LEGACY_PUBLISH_SNAPSHOT_DEBUG]', {
              sectionId: module.id,
              moduleId: module.id,
              sectionType: module.type,
              selectionMode,
              selectedProductIds: selectedIds,
              selectedProductIdsCount: selectedIds.length,
              catalogProductsCount: catalogProducts.length,
              finalProductsCount: normalizedProducts.length,
              finalProductIds: normalizedProducts.map(p => p.id),
              finalProductNames: normalizedProducts.map(p => p.name),
              source: selectionMode,
              snapshotKey,
              hasContentProducts: !!content.products,
              hasSettingsSnapshot: !!settings[snapshotKey]
            });
            
            logDebug('[PRODUCTS_PUBLISH_SNAPSHOT_FINAL_CONTRACT_DEBUG]', {
              sectionId: module.id,
              moduleId: module.id,
              selectionMode,
              selectedProductIds: selectedIds,
              selectedProductsCount: selectedIds.length,
              contentProductsCount: normalizedProducts.length,
              finalContentKeys: Object.keys(content),
              finalSettingsKeys: Object.keys(settings).filter(k => k.startsWith(module.id)),
              productsPreview: normalizedProducts.slice(0, 2).map(p => p.name)
            });
            
            logDebug('[PRODUCTS_PUBLISH_SNAPSHOT_FINAL_CONTRACT_DEBUG_V2]', {
              sectionId: module.id,
              moduleId: module.id,
              finalProductsCount: normalizedProducts.length,
              snapshotKey,
              hasSnapshotInSettings: !!settings[snapshotKey],
              hasProductsInContent: !!content.products,
              firstProduct: normalizedProducts[0]?.name,
              targetTables: ["web_builder_sites.content_published", "published_sites.content"]
            });
          } else {
            console.warn('[PRODUCTS_PUBLISH_SNAPSHOT_EMPTY_WARNING]', {
              moduleId: module.id,
              selectionMode,
              selectedIdsCount: selectedIds.length,
              availableProductsCount: catalogProducts.length
            });
          }
        }

        // [SIP v12.13] ADVANCED SNAPSHOT FOR PRODUCTS_SHOWCASE
        if (module.type === 'products_showcase') {
          const selectKey = `${module.id}_el_products_showcase_config_select_products`;
          const selectedIds = currentState.settingsValues[selectKey] || null;
          
          let snapshot: Product[] = [];
          
          // Debug logs for selection state
          logDebug('[PRODUCTS_SHOWCASE_V2_SELECTION_DEBUG]', {
            moduleId: module.id,
            selectKey,
            selectedIdsRaw: selectedIds,
            hasProducts: Array.isArray(products) && products.length > 0
          });

          if (Array.isArray(products) && products.length > 0) {
            if (selectedIds === null || selectedIds === undefined) {
              // Default selection if none is made: keep the full real project catalog
              snapshot = products;
            } else if (Array.isArray(selectedIds)) {
              const stringIds = selectedIds.map(String);
              snapshot = products.filter(p => stringIds.includes(String(p.id)));
            }
          }

          if (snapshot.length > 0) {
            // [PROTOCOL 12.3] DATA NORMALIZATION (Copied from products logic for consistency)
            const normalizedSnapshot = snapshot.map((p, idx) => {
              const rawPrice = (p as any).price;
              const rawRefPrice = (p as any).priceReference;
              const priceNum = typeof rawPrice === 'string' ? parseFloat(rawPrice.replace(/[^\d.,-]/g, '').replace(',', '.')) : rawPrice;
              const refPriceNum = typeof rawRefPrice === 'string' ? parseFloat(rawRefPrice.replace(/[^\d.,-]/g, '').replace(',', '.')) : rawRefPrice;
              
              return {
                ...p,
                id: String(p.id || `prod_v2_${idx}`),
                name: String(p.name || `Producto ${idx + 1}`),
                price: Number.isFinite(priceNum) ? Number(priceNum) : undefined,
                priceReference: Number.isFinite(refPriceNum) ? Number(refPriceNum) : undefined
              };
            });

            // Inyectar snapshot en múltiples lugares para redundancia total
            content.products = normalizedSnapshot;
            content.items = normalizedSnapshot;
            content.productos = normalizedSnapshot;
            content.selectedProductIds = normalizedSnapshot.map(p => p.id);
            
            // También en settings para hidratación delegada
            const itemsKey = `${module.id}_el_products_showcase_items_products`;
            settings[itemsKey] = normalizedSnapshot;
            settings.productsSnapshot = normalizedSnapshot;
            
            // Preserve selection key in settings
            settings[selectKey] = normalizedSnapshot.map(p => p.id);

            logDebug('[PRODUCTS_SHOWCASE_V2_PUBLISH_SNAPSHOT_DEBUG]', {
              moduleId: module.id,
              selectedCount: Array.isArray(selectedIds) ? selectedIds.length : 'all',
              snapshotCount: normalizedSnapshot.length,
              targetKeys: ['content.products', `settings.${itemsKey}`]
            });
          }
        }
        if (module.type === 'clients') {
          const selectedIds = getVal(module.id, null, 'select_customers', []);
          content.customerIds = selectedIds;
          
          let finalCustomers: Customer[] = [];
          if (Array.isArray(customers) && customers.length > 0 && Array.isArray(selectedIds)) {
            finalCustomers = customers.filter(c => selectedIds.includes(c.id));
          }

          if (finalCustomers.length > 0) {
            content.customers = finalCustomers;
            const snapshotKey = `${module.id}_el_clients_items_customers`;
            settings[snapshotKey] = finalCustomers;
          }
        }
        if (module.type === 'trusted_logos') {
          const selectKey = `${module.id}_el_trusted_logos_data_select_companies`;
          const snapshotKey = `${module.id}_el_trusted_logos_items_companies`;
          const selectedIdsRaw = currentState.settingsValues[selectKey];
          const selectedIds = Array.isArray(selectedIdsRaw) ? selectedIdsRaw.filter(Boolean) : [];
          const availableCompanies = Array.isArray(trustedCompanyLogos) ? trustedCompanyLogos : [];

          const selectedCompanies = selectedIds.length > 0
            ? availableCompanies.filter(company => selectedIds.includes(company.company_id))
            : availableCompanies.slice(0, 8);

          if (selectedCompanies.length > 0) {
            content.companies = selectedCompanies;
            content.logos = selectedCompanies;
            settings[selectKey] = selectedCompanies.map(company => company.company_id);
            settings[snapshotKey] = selectedCompanies;
          }
        }

        // SIP v11.3: Specialized project profile enrichment for Footer
        if (module.type === 'footer' || module.id.startsWith('mod_footer')) {
          const defaults = FOOTER_DEFAULTS;

          const isDefault = (val: any, d: string | string[]) => {
            const cleanVal = getPlainValue(val);
            if (Array.isArray(d)) return !cleanVal || d.includes(cleanVal);
            return !cleanVal || cleanVal === d;
          };
          
          // Enrichment logic - Contact/Bio
          const currentBio = currentState.settingsValues[`${module.id}_el_footer_brand_bio`];
          if (isDefault(currentBio, defaults.bio)) {
            const bioVal = project?.industry || `Servicios profesionales de ${project?.name || 'nuestro negocio'}`;
            content.bio = bioVal;
            content.brand = { ...(content.brand || {}), bio: bioVal, description: bioVal };
            settings[`${module.id}_el_footer_brand_bio`] = bioVal;
          }
          
          const currentEmailVal = currentState.settingsValues[`${module.id}_el_footer_contact_email`];
          if (isDefault(currentEmailVal, defaults.email) && project?.email) {
            content.contacto = { ...(content.contacto || {}), email: project.email };
            content.email = project.email;
            settings[`${module.id}_el_footer_contact_email`] = project.email;
            settings[`${module.id}_el_footer_contact_show_contact`] = true;
          }
          
          const currentPhoneVal = currentState.settingsValues[`${module.id}_el_footer_contact_phone`];
          if (isDefault(currentPhoneVal, defaults.phone) && project?.whatsapp) {
            content.contacto = { ...(content.contacto || {}), telefono: project.whatsapp };
            content.phone = project.whatsapp;
            settings[`${module.id}_el_footer_contact_phone`] = project.whatsapp;
            settings[`${module.id}_el_footer_contact_show_contact`] = true;
          }
          
          const currentAddressVal = currentState.settingsValues[`${module.id}_el_footer_contact_address`];
          if (isDefault(currentAddressVal, defaults.address) && project?.address) {
            content.contacto = { ...(content.contacto || {}), direccion: project.address };
            content.address = project.address;
            settings[`${module.id}_el_footer_contact_address`] = project.address;
            settings[`${module.id}_el_footer_contact_show_contact`] = true;
          }
          
          const currentCopyVal = currentState.settingsValues[`${module.id}_el_footer_bottom_copyright`];
          if (isDefault(currentCopyVal, defaults.copyright)) {
            const copyVal = `© ${new Date().getFullYear()} ${project?.name || 'Solutium'}. Todos los derechos reservados.`;
            content.copyright = copyVal;
            settings[`${module.id}_el_footer_bottom_copyright`] = copyVal;
          }
          
          // Social links enrichment logic
          const currentSocials = getPlainValue(currentState.settingsValues[`${module.id}_el_footer_social_social_links`]);
          const resolvedSocials = resolveFooterSocialLinks(currentSocials, project?.socials);
          
          settings[`${module.id}_el_footer_social_social_links`] = resolvedSocials;
          content.redes_sociales = resolvedSocials;

          // BRAND LOGO Enrichment - Prioritize manual, then project, then default
          const currentLogo = getPlainValue(currentState.settingsValues[`${module.id}_el_footer_brand_logo_img`]);
          const isLogoDefaultValue = isDefault(currentLogo, defaults.logos);
          
          if (isLogoDefaultValue && project?.logoUrl) {
            content.logo_url = project.logoUrl;
            content.brand = { ...(content.brand || {}), logo: project.logoUrl, logo_url: project.logoUrl };
            settings[`${module.id}_el_footer_brand_logo_img`] = project.logoUrl;
            settings[`${module.id}_el_footer_brand_show_logo`] = true;
          }

          // Debug logs for social and logo resolution
          if (true || window.location.search.includes('debug_render=true')) {
            logDebug('[FOOTER_SOCIAL_RESOLUTION_DEBUG]', {
              moduleId: module.id,
              currentSocialsFromSettings: currentSocials,
              projectSocialsRaw: project?.socials,
              finalSocialLinks: resolvedSocials,
              source: (currentSocials && currentSocials.length > 0 && currentSocials.some((s: any) => s.url && s.url !== '#')) ? 'manual' : (project?.socials ? 'project_profile' : 'placeholder')
            });

            logDebug('[FOOTER_LOGO_RESOLUTION_DEBUG]', {
              moduleId: module.id,
              manualLogo: currentLogo,
              projectLogo: project?.logoUrl,
              finalLogo: settings[`${module.id}_el_footer_brand_logo_img`] || currentLogo,
              source: (!isLogoDefaultValue) ? 'manual' : (project?.logoUrl ? 'project_profile' : 'default')
            });
          }
        }

        if (module.type === 'contact') {
          const isDefault = (val: any, d: string | string[]) => {
            const cleanVal = getPlainValue(val);
            if (Array.isArray(d)) return !cleanVal || d.includes(cleanVal);
            return !cleanVal || cleanVal === d;
          };

          const contactDefaults = {
            email: 'hola@tuempresa.com',
            phone: '+34 900 000 000',
            address: 'Calle Innovación 123, Madrid, España',
            whatsappNumber: ''
          };

          const currentEmailVal = currentState.settingsValues[`${module.id}_el_contact_info_email`];
          if (isDefault(currentEmailVal, contactDefaults.email) && project?.email) {
            content.contacto = { ...(content.contacto || {}), email: project.email };
            content.email = project.email;
            settings[`${module.id}_el_contact_info_email`] = project.email;
          }

          const currentPhoneVal = currentState.settingsValues[`${module.id}_el_contact_info_phone`];
          if (isDefault(currentPhoneVal, contactDefaults.phone) && project?.whatsapp) {
            content.contacto = { ...(content.contacto || {}), telefono: project.whatsapp, whatsapp: project.whatsapp };
            content.phone = project.whatsapp;
            settings[`${module.id}_el_contact_info_phone`] = project.whatsapp;
          }

          const currentWhatsappVal = currentState.settingsValues[`${module.id}_el_contact_form_whatsapp_number`];
          if (isDefault(currentWhatsappVal, contactDefaults.whatsappNumber) && project?.whatsapp) {
            content.whatsapp = project.whatsapp;
            settings[`${module.id}_el_contact_form_whatsapp_number`] = project.whatsapp;
          }

          const currentAddressVal = currentState.settingsValues[`${module.id}_el_contact_info_address`];
          if (isDefault(currentAddressVal, contactDefaults.address) && project?.address) {
            content.contacto = { ...(content.contacto || {}), direccion: project.address };
            content.address = project.address;
            settings[`${module.id}_el_contact_info_address`] = project.address;
          }

          if (project?.whatsapp && isDefault(currentState.settingsValues[`${module.id}_el_contact_form_button_text`], ['Enviar Mensaje', 'Enviar por WhatsApp'])) {
            settings[`${module.id}_el_contact_form_button_text`] = 'Enviar por WhatsApp';
          }
        }

        if (module.type === 'hero2') {
          const hero2Cards = getVal(module.id, 'el_hero2_secondary', 'secondary_cards', []);
          const normalizedHero2Cards = Array.isArray(hero2Cards)
            ? hero2Cards.map((card: any, index: number) => ({
                id: String(card?.id || `card-${index + 1}`),
                subtitle: String(card?.subtitle || ''),
                description: String(card?.description || ''),
                bullets: Array.isArray(card?.bullets)
                  ? card.bullets
                      .map((bullet: any) => {
                        if (typeof bullet === 'string') return bullet.trim();
                        if (bullet && typeof bullet === 'object') return String(bullet.text || '').trim();
                        return '';
                      })
                      .filter(Boolean)
                  : []
              }))
            : [];

          content.main_eyebrow = getVal(module.id, 'el_hero2_main', 'main_eyebrow', content.eyebrow || '');
          content.main_title = getVal(module.id, 'el_hero2_main', 'main_title', content.title || module.name);
          content.main_description = getVal(module.id, 'el_hero2_main', 'main_description', content.subtitle || '');
          content.hero2_image = getVal(module.id, 'el_hero2_media', 'hero2_image', content.image_url || '');
          content.hero2_image_alt = getVal(module.id, 'el_hero2_media', 'hero2_image_alt', '');
          content.secondary_cards = normalizedHero2Cards;
          content.cards = normalizedHero2Cards;

          if (!content.title) content.title = content.main_title;
          if (!content.subtitle) content.subtitle = content.main_description;
          if (!content.eyebrow) content.eyebrow = content.main_eyebrow;
          if (!content.image_url) content.image_url = content.hero2_image;
        }

        const resolvedHeroTitleMode =
          content.title_mode === 'dynamic' || content.title_mode === 'static'
            ? content.title_mode
            : content.is_rotating_active === true
              ? 'dynamic'
              : 'static';

        content.title_mode = resolvedHeroTitleMode;
        content.is_rotating_active = resolvedHeroTitleMode === 'dynamic';

        const isDynamic = resolvedHeroTitleMode === 'dynamic';
        const tipo = isDynamic ? `${module.type}_dinamico` : module.type;

        if (isDynamic) {
          const rawBase = content.texto_base || '';
          const marcador = '%ROTATIVO%';
          
          content.config = {
            texto_base: rawBase.includes(marcador) ? rawBase : `${rawBase} ${marcador}`,
            palabras_efecto: content.palabras_efecto || [],
            estilo_efecto: content.estilo_efecto || settings.el_hero_typography_rotating_color || '',
            intervalo_ms: content.intervalo_ms || settings.el_hero_typography_rotating_speed || 3000,
            marcador_posicion: marcador
          };
        }

        logDebug('[HERO_DYNAMIC_PUBLISH_DEBUG]', {
          moduleId: module.id,
          tipo,
          draftTitleMode: currentState.settingsValues?.[`${module.id}_el_hero_typography_title_mode`],
          draftEnabled: currentState.settingsValues?.[`${module.id}_el_hero_typography_rotating_enabled`],
          draftFixed: currentState.settingsValues?.[`${module.id}_el_hero_typography_rotating_fixed`],
          draftOptions: currentState.settingsValues?.[`${module.id}_el_hero_typography_rotating_options`],
          draftSpeed: currentState.settingsValues?.[`${module.id}_el_hero_typography_rotating_speed`],
          draftAnim: currentState.settingsValues?.[`${module.id}_el_hero_typography_rotating_anim`],
          draftColor: currentState.settingsValues?.[`${module.id}_el_hero_typography_rotating_color`],
          draftGradient: currentState.settingsValues?.[`${module.id}_el_hero_typography_rotating_gradient`],

          contractEnabled: content.is_rotating_active,
          contractTitleMode: content.title_mode,
          contractFixed: content.texto_base,
          contractOptions: content.palabras_efecto,
          contractSpeed: content.intervalo_ms,
          settingsOptions: settings.el_hero_typography_rotating_options,
          settingsSpeed: settings.el_hero_typography_rotating_speed
        });

        return {
          id: module.id,
          tipo: tipo,
          templateId: (module as any).templateId || module.id,
          type: module.type as any, // Keep for backward compatibility if needed
          content,
          settings,
          styles,
          audit_specs,
          config_hash: computeConfigHash({ content, styles, settings, audit_specs })
        };
      });

    // Generate CSS block for identical visualization
    let cssBlock = `/* Solutium Generated CSS for Identical Visualization v5.5 */\n`;
    cssBlock += `:root {\n`;
    cssBlock += `  --brand-primary: ${primaryColor};\n`;
    cssBlock += `  --brand-secondary: ${secondaryColor};\n`;
    cssBlock += `  --brand-accent: ${accentColor};\n`;
    cssBlock += `  --brand-bg: ${backgroundColor};\n`;
    cssBlock += `  --brand-text: ${textColor};\n`;
    cssBlock += `  --brand-muted: ${mutedColor};\n`;
    cssBlock += `  --brand-border: ${borderColor};\n`;
    cssBlock += `  --primary-color: ${primaryColor};\n`;
    cssBlock += `  --secondary-color: ${secondaryColor};\n`;
    cssBlock += `  --accent-color: ${accentColor};\n`;
    cssBlock += `  --background-color: ${backgroundColor};\n`;
    cssBlock += `  --foreground-color: ${textColor};\n`;
    cssBlock += `  --border-color: ${borderColor};\n`;
    cssBlock += `}\n`;
    
    sections.forEach(section => {
      const { id, styles, content } = section;
      cssBlock += `\n/* Section ${id} Styles */\n`;
      cssBlock += `#section-${id} {\n`;
      if (styles['border-radius']) cssBlock += `  border-radius: ${styles['border-radius']};\n`;
      if (styles['box-shadow']) cssBlock += `  box-shadow: ${styles['box-shadow']};\n`;
      if (styles['font-family']) cssBlock += `  font-family: ${styles['font-family']};\n`;
      cssBlock += `}\n`;

      // Highlight rules (.destacado) for rotating or special text
      const highlightStyle = content?.config?.estilo_efecto || content?.estilo_efecto;
      if (highlightStyle) {
        cssBlock += `#section-${id} .destacado {\n`;
        if (highlightStyle.includes('gradient')) {
          cssBlock += `  background: ${highlightStyle};\n`;
          cssBlock += `  -webkit-background-clip: text;\n`;
          cssBlock += `  background-clip: text;\n`;
          cssBlock += `  color: transparent;\n`;
        } else {
          cssBlock += `  color: ${highlightStyle};\n`;
        }
        cssBlock += `  font-weight: bold;\n`;
        cssBlock += `  display: inline-block;\n`;
        cssBlock += `}\n`;
      }
      
      // Button styles nesting (simplified)
      if (styles['button-styles'] && typeof styles['button-styles'] === 'object') {
        cssBlock += `#section-${id} button {\n`;
        Object.entries(styles['button-styles']).forEach(([key, val]) => {
          if (typeof val !== 'object') {
             // Convert underscore to hyphen for CSS properties
             const cssProp = key.replace(/_/g, '-');
             cssBlock += `  ${cssProp}: ${val};\n`;
          }
        });
        cssBlock += `}\n`;
      }
    });

    const contractResult: RenderingContract = {
      layout: "full-width",
      inject_tailwind: true,
      css: cssBlock,
      theme: {
        primaryColor,
        secondaryColor,
        accentColor,
        backgroundColor,
        textColor,
        mutedColor,
        borderColor,
        fontFamily: currentState.settingsValues['global_theme_font_sans'] || project?.fontFamily || 'Inter',
      },
      sections
    };

    logDebug('[PRODUCTS_PUBLISH_CONTRACT_FINAL_AUDIT]', {
      siteName: finalSiteName,
      sectionsCount: sections.length,
      productsSections: sections
        .filter(s => {
          const type = (s.type || s.tipo || '').toLowerCase();
          return type.includes('product') || type.includes('catalogo') || type.includes('showcase');
        })
        .map(s => ({
          id: s.id,
          hasProductsInContent: !!s.content.products,
          productsCount: s.content.products?.length || 0,
          hasSnapshotV1: !!s.settings[`${s.id}_el_products_items_products`],
          hasSnapshotV2: !!s.settings[`${s.id}_el_products_showcase_items_products`]
        }))
    });

    return contractResult;
  };

  const handleSaveDraft = async (forcedStatus?: 'draft' | 'published' | 'modified') => {
    if (!projectId || isPreviewMode) return;
    if (saveInProgressRef.current && activeSavePromiseRef.current) {
      const activeSaveResult = await activeSavePromiseRef.current;
      if (!activeSaveResult) return;
    }
    await performDraftSave({
      source: 'manual',
      skipPreview: false,
      silent: false,
      forcedStatus
    });
    return;
    if (!projectId || isPreviewMode || isSaving || saveStatus === 'loading') return;
    const savedCanvasScrollTop = getCanvasScrollContainer()?.scrollTop ?? 0;
    setSaveStatus('loading');
    setIsSaving(true);
    setAuthNotice(null);
    await waitForNextPaint();
    
    try {
      const sessionState = await ensureActiveSupabaseSession();
      if (sessionState.state === 'missing_session' || sessionState.state === 'expired_session') {
        setAuthNotice({
          type: 'error',
          message: 'Tu sesión expiró. Inicia sesión nuevamente para guardar. Tus cambios siguen en pantalla.'
        });
        setSaveStatus('error');
        return;
      }

      if (sessionState.state === 'refreshed') {
        setAuthNotice({
          type: 'info',
          message: 'Sesión actualizada. Guardando cambios...'
        });
      }

      const shouldRefreshAutoName = isDefaultName(siteName);
      const finalSiteName = shouldRefreshAutoName ? formatTimestampName() : (siteName || formatTimestampName());
      if (finalSiteName !== siteName) {
        setSiteName(finalSiteName);
      }
      const siteId = currentSiteId;

      // --- PROTOCOLO SOLUTIUM v6.2: Prep Editor State before saving ---
      const migratedState = migrateEditorStateToUUIDs(editorState);
      if (migratedState !== editorState) {
        setEditorState(migratedState);
        restoreCanvasScroll(savedCanvasScrollTop);
      }
      const activeState = migratedState;

      // Determine new status
      let newStatus: 'draft' | 'published' | 'modified' = currentStatus;
      if (typeof forcedStatus === 'string' && ['draft', 'published', 'modified'].includes(forcedStatus)) {
        newStatus = forcedStatus;
      } else if (currentStatus === 'published') {
        newStatus = 'modified';
      }

      // PROTOCOLO v5.2: DB Compatibility mapping for 'modified' status
      const dbStatus = (newStatus === 'modified') ? 'published' : newStatus;

      // 1. Update basic site info with editor state (SIP v6.2)
      const siteData: Partial<WebBuilderSite> = {
        projectId,
        appId: appId || '11111111-1111-1111-1111-111111111111',
        userId: currentUserId || undefined,
        siteId: siteId,
        siteName: finalSiteName,
        name: finalSiteName,
        contentDraft: activeState, 
        status: dbStatus as any
      };

      if (initialPage && 'id' in initialPage) {
        siteData.id = initialPage.id;
      }
      
      const result = await saveWebBuilderSiteDraft(siteData);
      
      if (!result) {
        throw new Error('Error al guardar el borrador base');
      }

      // 2. Generate Contract and Sync Check
      const contract = generateRenderingContract(finalSiteName, activeState);
      await checkDictionarySync(contract);

      // 3. UPSERT to pages table (SIP v6.1 - Source of Truth)
      // We store the RenderingContract in 'content' and EditorState in 'metadata'
      const savedPage = await upsertPage({
        project_id: projectId,
        web_builder_site_id: result.id, 
        slug: 'index',
        title: finalSiteName,
        content: contract,
        status: newStatus === 'published' || newStatus === 'modified' ? 'published' : 'draft',
        metadata: { 
          origin_app: 'Constructor Web', 
          version: '2.3-Atomic',
          editor_state: activeState // Use migrated state
        }
      });

      // 4. ATOMIC SERIALIZATION V2.3: Save individual sections with Audit Data
      if (savedPage && savedPage.id) {
        const pageSections: Partial<PageSection>[] = contract.sections.map((section: any, idx) => ({
          id: isUUID(section.id) ? section.id : undefined, // Prioritize UUID from contract
          page_id: savedPage.id!,
          section_type: section.tipo,
          content_json: section.content,
          styles_json: { ...section.styles, ...section.settings },
          order_index: idx,
          metadata: { 
            version: '2.3-Atomic',
            audit_specs: section.audit_specs,
            config_hash: section.config_hash
          }
        }));
        await upsertPageSections(savedPage.id!, pageSections);
      }

      if (result) {
        logDebug(`[SIP v6.1] Cambios sincronizados en tabla 'pages' (Status: ${newStatus})`);
        sendToMother('SOLUTIUM_SAVE', {
          site_id: siteId,
          site_name: finalSiteName,
          status: newStatus,
          timestamp: new Date().toISOString()
        });

        setHasUnsavedChanges(false);
        setCurrentStatus(newStatus);
        stabilizeCanvasScroll(savedCanvasScrollTop);

        const previewDisableReason = getPreviewDisableReason(siteId);
        if (isPreviewConfigDisabled(previewDisableReason)) {
          logDebug('[PREVIEW_CAPTURE_DEBUG] Preview generation skipped because backend preview configuration is disabled for this session.', {
            siteId,
            previewDisableReason
          });
          setPreviewWarning(null);
          setPreviewStatus('idle');
        } else {
          setPreviewWarning(null);
          setPreviewStatus('loading');

          try {
            const webBuilderSiteId = result.id || initialPage?.id || (window as any).WEB_BUILDER_SITE_ID;
            const previewResult = await generatePreviewServerSide({
              project_id: projectId!,
              site_id: siteId,
              web_builder_site_id: webBuilderSiteId,
              mode: 'thumbnail'
            });

            if (previewResult.success && previewResult.preview_image_url) {
              setPreviewWarningsFromResult(
                previewResult.warnings,
                'Preview generado, pero hubo advertencias al guardar metadatos.'
              );

              sendToMother('SOLUTIUM_PREVIEW_GENERATED', {
                site_id: siteId,
                preview_image_url: previewResult.preview_image_url,
                preview_thumbnail_url: previewResult.preview_thumbnail_url,
                preview_image_hash: previewResult.preview_image_hash,
                preview_image_updated_at: previewResult.preview_image_updated_at
              });

              logDebug('[PREVIEW_CAPTURE_DEBUG] Server-side preview generated (Save):', { 
                siteId, 
                url: previewResult.preview_image_url 
              });
              setPreviewStatus('success');
            } else {
              if (previewResult.errorCode === 'preview_region_missing' || previewResult.errorCode === 'preview_missing_storage_config') {
                const disableReason = previewResult.errorCode === 'preview_missing_storage_config'
                  ? 'preview_missing_storage_config'
                  : 'preview_region_missing';
                setPreviewDisableReason(disableReason, siteId);
                logDebug('[PREVIEW_CAPTURE_DEBUG] Draft saved. Preview omitted because backend storage is not configured.', {
                  siteId,
                  reason: previewResult.reason || disableReason
                });
                setPreviewStatus('idle');
              } else if (previewResult.skipped) {
                logDebug('[PREVIEW_CAPTURE_DEBUG] Draft saved. Preview skipped by client/backend guard.', {
                  siteId,
                  reason: previewResult.reason || null
                });
                setPreviewStatus('idle');
              } else {
                console.warn('[PREVIEW_CAPTURE_WARNING] Draft saved, but preview generation failed.', previewResult.error);
                setPreviewWarning('Borrador guardado, pero no se pudo actualizar la vista previa.');
                setPreviewStatus('error');
              }
            }
          } catch (pError) {
            console.warn('[PREVIEW_CAPTURE_WARNING] Preview failed after saving draft. Draft remains saved.', pError);
            setPreviewWarning('Borrador guardado, pero no se pudo actualizar la vista previa.');
            setPreviewStatus('error');
          } finally {
            stabilizeCanvasScroll(savedCanvasScrollTop);
            setTimeout(() => setPreviewStatus('idle'), 3000);
          }
        }

        setSaveStatus('success');
        stabilizeCanvasScroll(savedCanvasScrollTop);
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        throw new Error('Error al guardar el borrador');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      if (error instanceof SupabaseSessionError) {
        setAuthNotice({
          type: 'error',
          message: 'Tu sesión expiró. Inicia sesión nuevamente para guardar. Tus cambios siguen en pantalla.'
        });
      }
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const performDraftSave = useCallback(async ({
    source,
    skipPreview,
    silent,
    forcedStatus
  }: {
    source: 'manual' | 'autosave' | 'prepublish';
    skipPreview: boolean;
    silent: boolean;
    forcedStatus?: 'draft' | 'published' | 'modified';
  }): Promise<boolean> => {
    if (!projectId || isPreviewMode) return false;

    if (saveInProgressRef.current && activeSavePromiseRef.current) {
      return activeSavePromiseRef.current;
    }

    const runSave = async (): Promise<boolean> => {
      const isAutosave = source === 'autosave';
      const isInteractiveManualSave = source === 'manual';
      const savedCanvasScrollTop = skipPreview ? 0 : (getCanvasScrollContainer()?.scrollTop ?? 0);
      const changeVersionAtSaveStart = changeVersionRef.current;
      pendingChangesDuringSaveRef.current = false;
      saveInProgressRef.current = true;
      autosaveInProgressRef.current = isAutosave;
      lastSaveSourceRef.current = source;
      setIsDraftOperationInProgress(true);
      setIsSaving(true);
      setAuthNotice(null);

      if (isInteractiveManualSave) {
        setSaveStatus('loading');
        await waitForNextPaint();
      } else if (isAutosave) {
        setAutosaveStatus('saving');
        setAutosaveError(null);
      }

      try {
        const sessionState = await ensureActiveSupabaseSession();
        if (sessionState.state === 'missing_session' || sessionState.state === 'expired_session') {
          const sessionMessage = isAutosave
            ? 'Tu sesión expiró. Inicia sesión nuevamente para continuar guardando. Tus cambios siguen en pantalla.'
            : 'Tu sesiÃ³n expirÃ³. Inicia sesiÃ³n nuevamente para guardar. Tus cambios siguen en pantalla.';
          setAuthNotice({ type: 'error', message: sessionMessage });
          if (isInteractiveManualSave) {
            setSaveStatus('error');
          } else if (isAutosave) {
            setAutosaveStatus('error');
            setAutosaveError(sessionMessage);
          }
          return false;
        }

        if (sessionState.state === 'refreshed' && !silent) {
          setAuthNotice({
            type: 'info',
            message: isAutosave
              ? 'Sesión actualizada. Guardando automáticamente...'
              : 'SesiÃ³n actualizada. Guardando cambios...'
          });
        }

        const latestSiteName = siteNameRef.current;
        const shouldRefreshAutoName = isDefaultName(latestSiteName);
        const finalSiteName = shouldRefreshAutoName ? formatTimestampName() : (latestSiteName || formatTimestampName());
        if (finalSiteName !== latestSiteName) {
          siteNameRef.current = finalSiteName;
          setSiteName(finalSiteName);
        }
        const siteId = currentSiteId;

        const latestEditorState = editorStateRef.current;
        const migratedState = migrateEditorStateToUUIDs(latestEditorState);
        if (migratedState !== latestEditorState) {
          editorStateRef.current = migratedState;
          setEditorState(migratedState);
          if (!skipPreview) {
            restoreCanvasScroll(savedCanvasScrollTop);
          }
        }
        const activeState = migratedState;

        const latestStatus = currentStatusRef.current;
        let newStatus: 'draft' | 'published' | 'modified' = latestStatus;
        if (typeof forcedStatus === 'string' && ['draft', 'published', 'modified'].includes(forcedStatus)) {
          newStatus = forcedStatus;
        } else if (latestStatus === 'published') {
          newStatus = 'modified';
        }

        const dbStatus = (newStatus === 'modified') ? 'published' : newStatus;

        const siteData: Partial<WebBuilderSite> = {
          projectId,
          appId: appId || '11111111-1111-1111-1111-111111111111',
          userId: currentUserId || undefined,
          siteId,
          siteName: finalSiteName,
          name: finalSiteName,
          contentDraft: activeState,
          status: dbStatus as any
        };

        if (initialPage && 'id' in initialPage) {
          siteData.id = initialPage.id;
        }

        const result = await saveWebBuilderSiteDraft(siteData);
        if (!result) {
          throw new Error('Error al guardar el borrador base');
        }

        const contract = generateRenderingContract(finalSiteName, activeState);
        await checkDictionarySync(contract);

        const savedPage = await upsertPage({
          project_id: projectId,
          web_builder_site_id: result.id,
          slug: 'index',
          title: finalSiteName,
          content: contract,
          status: newStatus === 'published' || newStatus === 'modified' ? 'published' : 'draft',
          metadata: {
            origin_app: 'Constructor Web',
            version: '2.3-Atomic',
            editor_state: activeState
          }
        });

        if (savedPage && savedPage.id) {
          const pageSections: Partial<PageSection>[] = contract.sections.map((section: any, idx) => ({
            id: isUUID(section.id) ? section.id : undefined,
            page_id: savedPage.id!,
            section_type: section.tipo,
            content_json: section.content,
            styles_json: { ...section.styles, ...section.settings },
            order_index: idx,
            metadata: {
              version: '2.3-Atomic',
              audit_specs: section.audit_specs,
              config_hash: section.config_hash
            }
          }));
          await upsertPageSections(savedPage.id!, pageSections);
        }

        logDebug(`[SIP v6.1] Cambios sincronizados en tabla 'pages' (Status: ${newStatus}, Source: ${source})`);
        sendToMother('SOLUTIUM_SAVE', {
          site_id: siteId,
          site_name: finalSiteName,
          status: newStatus,
          timestamp: new Date().toISOString()
        });

        const hadChangesDuringSave =
          pendingChangesDuringSaveRef.current || changeVersionRef.current !== changeVersionAtSaveStart;

        if (!hadChangesDuringSave) {
          setHasUnsavedChanges(false);
          lastSaveChangeVersionRef.current = changeVersionAtSaveStart;
        } else {
          setHasUnsavedChanges(true);
        }

        currentStatusRef.current = newStatus;
        setCurrentStatus(newStatus);

        if (!skipPreview) {
          const previewDisableReason = getPreviewDisableReason(siteId);
          if (isPreviewConfigDisabled(previewDisableReason)) {
            logDebug('[PREVIEW_CAPTURE_DEBUG] Preview generation skipped because backend preview configuration is disabled for this session.', {
              siteId,
              previewDisableReason
            });
            setPreviewWarning(null);
            setPreviewStatus('idle');
          } else {
            setPreviewWarning(null);
            setPreviewStatus('loading');

            try {
              const webBuilderSiteId = result.id || initialPage?.id || (window as any).WEB_BUILDER_SITE_ID;
              const previewResult = await generatePreviewServerSide({
                project_id: projectId!,
                site_id: siteId,
                web_builder_site_id: webBuilderSiteId,
                mode: 'thumbnail'
              });

              if (previewResult.success && previewResult.preview_image_url) {
                setPreviewWarningsFromResult(
                  previewResult.warnings,
                  'Preview generado, pero hubo advertencias al guardar metadatos.'
                );

                sendToMother('SOLUTIUM_PREVIEW_GENERATED', {
                  site_id: siteId,
                  preview_image_url: previewResult.preview_image_url,
                  preview_thumbnail_url: previewResult.preview_thumbnail_url,
                  preview_image_hash: previewResult.preview_image_hash,
                  preview_image_updated_at: previewResult.preview_image_updated_at
                });

                logDebug('[PREVIEW_CAPTURE_DEBUG] Server-side preview generated (Save):', {
                  siteId,
                  url: previewResult.preview_image_url
                });
                setPreviewStatus('success');
              } else {
                if (previewResult.errorCode === 'preview_region_missing' || previewResult.errorCode === 'preview_missing_storage_config') {
                  const disableReason = previewResult.errorCode === 'preview_missing_storage_config'
                    ? 'preview_missing_storage_config'
                    : 'preview_region_missing';
                  setPreviewDisableReason(disableReason, siteId);
                  logDebug('[PREVIEW_CAPTURE_DEBUG] Draft saved. Preview omitted because backend storage is not configured.', {
                    siteId,
                    reason: previewResult.reason || disableReason
                  });
                  setPreviewStatus('idle');
                } else if (previewResult.skipped) {
                  logDebug('[PREVIEW_CAPTURE_DEBUG] Draft saved. Preview skipped by client/backend guard.', {
                    siteId,
                    reason: previewResult.reason || null
                  });
                  setPreviewStatus('idle');
                } else {
                  console.warn('[PREVIEW_CAPTURE_WARNING] Draft saved, but preview generation failed.', previewResult.error);
                  setPreviewWarning('Borrador guardado, pero no se pudo actualizar la vista previa.');
                  setPreviewStatus('error');
                }
              }
            } catch (pError) {
              console.warn('[PREVIEW_CAPTURE_WARNING] Preview failed after saving draft. Draft remains saved.', pError);
              setPreviewWarning('Borrador guardado, pero no se pudo actualizar la vista previa.');
              setPreviewStatus('error');
            } finally {
              stabilizeCanvasScroll(savedCanvasScrollTop);
              setTimeout(() => setPreviewStatus('idle'), 3000);
            }
          }
        } else {
          // Autosave deliberately skips preview to avoid expensive render cycles and scroll jumps.
          logDebug('[AUTOSAVE_DEBUG] Preview skipped intentionally during autosave.');
        }

        if (isInteractiveManualSave) {
          if (hadChangesDuringSave) {
            setSaveStatus('idle');
          } else {
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 3000);
          }
          stabilizeCanvasScroll(savedCanvasScrollTop);
        } else if (isAutosave) {
          setAutosaveStatus('saved');
          setLastAutosavedAt(new Date());
          setAutosaveError(null);
        }

        return true;
      } catch (error) {
        console.error(isAutosave ? 'Error autosaving draft:' : 'Error saving draft:', error);
        if (error instanceof SupabaseSessionError) {
          setAuthNotice({
            type: 'error',
            message: isAutosave
              ? 'Tu sesión expiró. Inicia sesión nuevamente para continuar guardando. Tus cambios siguen en pantalla.'
              : 'Tu sesiÃ³n expirÃ³. Inicia sesiÃ³n nuevamente para guardar. Tus cambios siguen en pantalla.'
          });
        }
        if (isInteractiveManualSave) {
          setSaveStatus('error');
          setTimeout(() => setSaveStatus('idle'), 3000);
        } else if (isAutosave) {
          setAutosaveStatus('error');
          setAutosaveError(
            error instanceof SupabaseSessionError
              ? 'Tu sesión expiró. Inicia sesión nuevamente para continuar guardando.'
              : 'No se pudo guardar automáticamente. Tus cambios siguen en pantalla.'
          );
        }
        return false;
      } finally {
        pendingChangesDuringSaveRef.current = false;
        autosaveInProgressRef.current = false;
        saveInProgressRef.current = false;
        lastSaveSourceRef.current = null;
        activeSavePromiseRef.current = null;
        setIsDraftOperationInProgress(false);
        setIsSaving(false);
      }
    };

    const promise = runSave();
    activeSavePromiseRef.current = promise;
    return promise;
  }, [
    appId,
    currentSiteId,
    currentStatus,
    currentUserId,
    editorState,
    generateRenderingContract,
    initialPage,
    isPreviewMode,
    projectId,
    siteName
  ]);

  const waitForActiveSaveIfNeeded = useCallback(async () => {
    if (!activeSavePromiseRef.current) return true;
    return activeSavePromiseRef.current;
  }, []);

  const ensureStableDraftBeforePublish = useCallback(async () => {
    const activeSaveResult = await waitForActiveSaveIfNeeded();
    if (!activeSaveResult) return false;

    const runPrepublishSave = () => performDraftSave({
      source: 'prepublish',
      skipPreview: false,
      silent: true
    });

    let saved = await runPrepublishSave();
    if (!saved) return false;

    if (lastSaveChangeVersionRef.current !== changeVersionRef.current) {
      saved = await runPrepublishSave();
    }

    return saved && lastSaveChangeVersionRef.current === changeVersionRef.current;
  }, [performDraftSave, waitForActiveSaveIfNeeded]);

  const isDefaultName = (name: string) => {
    if (!name) return true;
    const timestampRegex = /^\d{2}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}-(am|pm)$/;
    return timestampRegex.test(name) || name === 'Mi Sitio Web';
  };

  useEffect(() => {
    if (!autosaveEnabled) return;
    if (isPreviewMode || isExternalRender || !projectId || !currentSiteId) return;

    const intervalId = window.setInterval(() => {
      if (!hasUnsavedChanges) return;
      if (saveInProgressRef.current || autosaveInProgressRef.current) return;
      if (publishInProgressRef.current) return;
      if (isSaving || publishStatus === 'loading') return;

      void performDraftSave({
        source: 'autosave',
        skipPreview: true,
        silent: true
      });
    }, autosaveIntervalMs);

    return () => window.clearInterval(intervalId);
  }, [
    autosaveEnabled,
    autosaveIntervalMs,
    currentSiteId,
    hasUnsavedChanges,
    isExternalRender,
    isPreviewMode,
    isSaving,
    performDraftSave,
    projectId,
    publishStatus
  ]);

  const handleCloseOnboarding = () => {
    setShowAIInitialForm(false);
    if (onCancelOnboarding) {
      onCancelOnboarding();
    } else {
      setOnboardingFinished(true);
    }
  };

  const handlePublish = async () => {
    if (!projectId || isPreviewMode || publishInProgressRef.current || publishStatus === 'loading') return;
    
    if (isDefaultName(siteName)) {
      setShowPublishModal(true);
      return;
    }

    publishInProgressRef.current = true;
    setPublishStatus('loading');
    setIsSaving(true);
    setAuthNotice(null);
    try {
      const stableDraft = await ensureStableDraftBeforePublish();
      if (!stableDraft) {
        setAuthNotice({
          type: 'error',
          message: 'No se pudo estabilizar el borrador antes de publicar. Tus cambios siguen en pantalla.'
        });
        setPublishStatus('error');
        setTimeout(() => setPublishStatus('idle'), 3000);
        return;
      }

      const finalSiteName = siteNameRef.current || siteName;

      const sessionState = await ensureActiveSupabaseSession();
      if (sessionState.state === 'missing_session' || sessionState.state === 'expired_session') {
        setAuthNotice({
          type: 'error',
          message: 'Tu sesión expiró. Inicia sesión nuevamente para publicar. Tus cambios siguen en pantalla.'
        });
        setPublishStatus('error');
        return;
      }

      if (sessionState.state === 'refreshed') {
        setAuthNotice({
          type: 'info',
          message: 'Sesión actualizada. Publicando cambios...'
        });
      }

      // --- PROTOCOLO SOLUTIUM v2.0: Identidad UUID Persistente ---
      const latestEditorState = editorStateRef.current;
      const migratedState = migrateEditorStateToUUIDs(latestEditorState);
      if (migratedState !== latestEditorState) {
        setEditorState(migratedState);
        editorStateRef.current = migratedState;
      }
      const activeState = migratedState;

      const contract = generateRenderingContract(finalSiteName, activeState);
      const siteId = currentSiteId;

      // Sync check before publish
      await checkDictionarySync(contract);

      // 1. Sync Site State (SIP v6.2: Preserve current draft state during publish)
      const siteData: Partial<WebBuilderSite> = {
        projectId,
        appId: appId || '11111111-1111-1111-1111-111111111111',
        siteId: siteId,
        siteName: finalSiteName,
        name: finalSiteName,
        contentDraft: activeState,
        status: 'published'
      };
      if (initialPage && 'id' in initialPage) siteData.id = initialPage.id;
      const actualSite = await saveWebBuilderSiteDraft(siteData);
      if (!actualSite) throw new Error('Error al actualizar registro de sitio');
      (window as any).WEB_BUILDER_SITE_ID = actualSite.id;
      (window as any).currentSite = { id: actualSite.id, site_id: siteId };
      (window as any).webBuilderSite = { id: actualSite.id };

      // 2. Publish Site (Legacy published_sites sync)
      const draftHasProductsShowcase = (activeState.addedModules || []).some((m: any) => m.type === 'products_showcase');
      const contractHasProductsShowcase = (contract.sections || []).some((s: any) => s.type === 'products_showcase' || s.tipo === 'products_showcase');

      logDebug('[PRODUCTS_SHOWCASE_PUBLISH_PRESENCE_DEBUG]', {
        draftHasProductsShowcase,
        contractHasProductsShowcase,
        sectionsCount: contract.sections?.length || 0,
        moduleTypes: (contract.sections || []).map((s: any) => s.type || s.tipo),
        moduleId: (contract.sections || []).find((s: any) => s.type === 'products_showcase' || s.tipo === 'products_showcase')?.id,
        appId,
        projectId,
        siteId
      });

      const publishData: Partial<PublishedSite> = {
        projectId,
        appId: appId || '11111111-1111-1111-1111-111111111111',
        siteId: siteId,
        siteName: finalSiteName,
        content: contract,
        isActive: true,
        metadata: {
          publishedAt: new Date().toISOString(),
          origin: 'Constructor Web',
          version: '6.2-Forensic'
        }
      };

      logDebug('[PUBLISH_CONTRACT_INTEGRITY_CHECK]', {
        siteId,
        sectionsCount: contract.sections.length,
        productSnapshots: contract.sections
          .filter((s: any) => s.tipo === 'products' || s.tipo === 'product_grid')
          .map((s: any) => ({
            id: s.id,
            productsInContent: s.content?.products?.length || 0,
            productsInSettings: s.settings?.[`${s.id}_el_products_items_products`]?.length || 0,
            selectionMode: s.content?.selectionMode
          }))
      });

      // [PRODUCTS_LEGACY_FINAL_PUBLISHED_CONTRACT_DEBUG]
      contract.sections
        .filter((s: any) => s.tipo === 'products' || s.tipo === 'product_grid')
        .forEach((s: any) => {
          logDebug('[PRODUCTS_LEGACY_FINAL_PUBLISHED_CONTRACT_DEBUG]', {
            sectionId: s.id,
            moduleId: s.id,
            contentProductsCount: s.content?.products?.length || 0,
            contentProductosCount: s.content?.productos?.length || 0,
            settingsProductsSnapshotCount: s.settings?.[`${s.id}_el_products_items_products`]?.length || 0,
            selectedIdsCount: s.content?.productIds?.length || 0,
            firstProduct: s.content?.products?.[0],
            targetTables: [
              "web_builder_sites.content_published",
              "published_sites.content"
            ]
          });
        });

      const result = await publishWebBuilderSite(publishData);
      
      // 3. UPSERT to pages table (SIP v6.1 - Engine Sync)
      const savedPage = await upsertPage({
        project_id: projectId,
        web_builder_site_id: actualSite.id, // Fixed: use real DB ID to avoid FK violation
        slug: 'index',
        title: finalSiteName,
        content: contract,
        status: 'published',
        metadata: { 
          origin_app: 'Constructor Web', 
          version: '2.3-Atomic', 
          published_at: new Date().toISOString(),
          editor_state: activeState // Use migrated state
        }
      });

      // 4. ATOMIC SERIALIZATION V2.3: Save individual sections with Audit Data
      if (savedPage && savedPage.id) {
        const pageSections: Partial<PageSection>[] = contract.sections.map((section: any, idx) => ({
          id: isUUID(section.id) ? section.id : undefined, // Prioritize UUID from contract
          page_id: savedPage.id!,
          section_type: section.tipo,
          content_json: section.content,
          styles_json: { ...section.styles, ...section.settings },
          order_index: idx,
          metadata: { 
            version: '2.3-Atomic',
            audit_specs: section.audit_specs,
            config_hash: section.config_hash
          }
        }));
        await upsertPageSections(savedPage.id!, pageSections);
      }

      if (result) {
        logDebug('[SIP v6.1] Sitio publicado y sincronizado con Web Engine.');
        setPublishStatus('success');
        currentStatusRef.current = 'published';
        setCurrentStatus('published');
        setHasUnsavedChanges(false);
        setShowPublishModal(false);

        sendToMother('SOLUTIUM_PUBLISH', {
          site_id: siteId,
          site_name: finalSiteName,
          status: 'published',
          timestamp: new Date().toISOString()
        });

        setTimeout(() => setPublishStatus('idle'), 3000);

        // --- BACKGROUND TASK: Generate Server-Side Preview automatically on publish ---
        (async () => {
          if (isGeneratingPreview) return;
          
          try {
            const webBuilderSiteId = actualSite.id || initialPage?.id || (window as any).WEB_BUILDER_SITE_ID;
            
            if (!projectId || !siteId || !webBuilderSiteId) {
              console.warn('[AUTO_PREVIEW_ON_PUBLISH_SKIPPED] Missing IDs for preview generation', { project_id: projectId, site_id: siteId, web_builder_site_id: webBuilderSiteId });
              return;
            }

            setIsGeneratingPreview(true);
            setPreviewWarning(null);
            setPreviewStatus('loading');
            
            // [AUTO_PREVIEW_ON_PUBLISH_REQUEST_DEBUG]
            logDebug('[AUTO_PREVIEW_ON_PUBLISH_REQUEST_DEBUG]', {
              trigger: "publish",
              project_id: projectId,
              site_id: siteId,
              web_builder_site_id: webBuilderSiteId
            });

            const previewResult = await generatePreviewServerSide({
              project_id: projectId,
              site_id: siteId,
              web_builder_site_id: webBuilderSiteId,
              mode: 'thumbnail'
            });

            if (previewResult.success && previewResult.preview_image_url) {
              setPreviewWarningsFromResult(
                previewResult.warnings,
                'Preview publicado generado, pero hubo advertencias al guardar metadatos.'
              );

              logDebug('[AUTO_PREVIEW_ON_PUBLISH_SUCCESS]', {
                preview_image_url: previewResult.preview_image_url,
                preview_image_path: previewResult.preview_image_path,
                preview_image_hash: previewResult.preview_image_hash
              });

              sendToMother('SOLUTIUM_PREVIEW_GENERATED', {
                site_id: siteId,
                preview_image_url: previewResult.preview_image_url,
                preview_thumbnail_url: previewResult.preview_thumbnail_url,
                preview_image_hash: previewResult.preview_image_hash,
                preview_image_updated_at: previewResult.preview_image_updated_at
              });

              setPreviewStatus('success');
              setTimeout(() => setPreviewStatus('idle'), 3000);
            } else if (previewResult.errorCode === 'preview_region_missing' || previewResult.errorCode === 'preview_missing_storage_config') {
              setPreviewDisableReason(
                previewResult.errorCode === 'preview_missing_storage_config'
                  ? 'preview_missing_storage_config'
                  : 'preview_region_missing',
                siteId
              );
              logDebug('[AUTO_PREVIEW_ON_PUBLISH_SKIPPED]', {
                reason: previewResult.reason || previewResult.errorCode
              });
              setPreviewStatus('idle');
            } else if (previewResult.skipped) {
              logDebug('[AUTO_PREVIEW_ON_PUBLISH_SKIPPED]', {
                reason: previewResult.reason || null
              });
              setPreviewStatus('idle');
            } else {
              throw new Error(previewResult.error || 'Preview response was empty or unsuccessful');
            }
          } catch (pError: any) {
            // [AUTO_PREVIEW_ON_PUBLISH_WARNING]
            const wasCorsLikeFailure = pError?.message === 'Failed to fetch' || (pError instanceof TypeError && pError.message.includes('fetch'));
            
            console.warn('[AUTO_PREVIEW_ON_PUBLISH_WARNING]', {
              message: pError?.message,
              status: pError?.status,
              wasCorsLikeFailure,
              trigger: "publish",
              stack: pError?.stack?.substring(0, 300)
            });
            
            logDebug('[AUTO_PREVIEW_ON_PUBLISH_ERROR]', { 
              message: pError.message,
              wasCors: wasCorsLikeFailure
            });
            
            setPreviewWarning('Sitio publicado, pero no se pudo actualizar la vista previa.');
            setPreviewStatus('error');
            setTimeout(() => setPreviewStatus('idle'), 5000);
          } finally {
            setIsGeneratingPreview(false);
          }
        })();
      } else {
        throw new Error('Error al publicar el sitio');
      }
    } catch (error) {
      console.error('Error publishing site:', error);
      if (error instanceof SupabaseSessionError) {
        setAuthNotice({
          type: 'error',
          message: 'Tu sesión expiró. Inicia sesión nuevamente para publicar. Tus cambios siguen en pantalla.'
        });
      }
      setPublishStatus('error');
      setTimeout(() => setPublishStatus('idle'), 3000);
    } finally {
      publishInProgressRef.current = false;
      setIsSaving(false);
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  const getPreviewDisableKey = (siteId?: string) =>
    `preview_generation_disabled_reason_${siteId || currentSiteId || 'unknown'}`;

  const getPreviewDisableReason = (siteId?: string) => {
    try {
      return localStorage.getItem(getPreviewDisableKey(siteId))
        || sessionStorage.getItem(getPreviewDisableKey(siteId));
    } catch {
      return null;
    }
  };

  const setPreviewDisableReason = (reason: string, siteId?: string) => {
    try {
      localStorage.setItem(getPreviewDisableKey(siteId), reason);
      sessionStorage.setItem(getPreviewDisableKey(siteId), reason);
    } catch {
      // ignore sessionStorage access issues
    }
  };

  const isPreviewConfigDisabled = (reason?: string | null) =>
    reason === 'preview_region_missing' || reason === 'preview_missing_storage_config';

  const getCanvasScrollContainer = () => {
    return document.getElementById('constructor-canvas-scroll-container');
  };

  const restoreCanvasScroll = (scrollTop: number) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const container = getCanvasScrollContainer();
        if (container) {
          container.scrollTop = scrollTop;
        }
      });
    });
  };

  const stabilizeCanvasScroll = (scrollTop: number) => {
    restoreCanvasScroll(scrollTop);
    window.setTimeout(() => restoreCanvasScroll(scrollTop), 50);
    window.setTimeout(() => restoreCanvasScroll(scrollTop), 150);
  };

  const handleViewportChange = (nextViewport: 'desktop' | 'tablet' | 'mobile') => {
    const container = getCanvasScrollContainer();
    const savedCanvasScrollTop = container?.scrollTop ?? 0;
    const savedMaxScrollTop = container
      ? Math.max(0, container.scrollHeight - container.clientHeight)
      : 0;
    const savedScrollRatio = savedMaxScrollTop > 0 ? savedCanvasScrollTop / savedMaxScrollTop : 0;
    const restoreViewportScroll = () => {
      const nextContainer = getCanvasScrollContainer();
      if (!nextContainer) return;
      const nextMaxScrollTop = Math.max(0, nextContainer.scrollHeight - nextContainer.clientHeight);
      nextContainer.scrollTop = Math.round(nextMaxScrollTop * savedScrollRatio);
    };

    setViewport(nextViewport);
    restoreCanvasScroll(savedCanvasScrollTop);
    window.requestAnimationFrame(() => window.requestAnimationFrame(restoreViewportScroll));
    window.setTimeout(restoreViewportScroll, 50);
    window.setTimeout(restoreViewportScroll, 150);
    window.setTimeout(restoreViewportScroll, 300);
    window.setTimeout(restoreViewportScroll, 700);
    window.setTimeout(restoreViewportScroll, 1200);
  };

  const waitForNextPaint = async () => {
    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => resolve());
    });
  };

  const handlePreview = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('mode', 'preview');
    url.searchParams.set('site_id', currentSiteId);
    window.open(url.toString(), '_blank');
  };

  // --- AUTO CAPTURE PROTOCOL ---
  useEffect(() => {
    if (projectId && currentSiteId) {
      const shouldAutoCapture = sessionStorage.getItem(`auto_capture_${currentSiteId}`) === 'true';
      if (shouldAutoCapture) {
        logDebug(`[AUTO_CAPTURE] Detectada bandera para sitio: ${currentSiteId}. Iniciando captura automática...`);
        sessionStorage.removeItem(`auto_capture_${currentSiteId}`);
        // Esperamos un momento a que el canvas se hidrate completamente
        setTimeout(() => {
          handleUpdatePreview();
        }, 1500);
      }
    }
  }, [projectId, currentSiteId, currentStatus]);

  const handleUpdatePreview = async () => {
    if (!projectId || isPreviewMode || isGeneratingPreview) return;
    if (isPreviewConfigDisabled(getPreviewDisableReason())) {
      logDebug('[PREVIEW_CAPTURE_DEBUG] Manual preview skipped because backend preview configuration is disabled.');
      setPreviewWarning(null);
      setPreviewStatus('idle');
      return;
    }
    setPreviewWarning(null);
    setPreviewStatus('loading');
    setIsGeneratingPreview(true);
    try {
      const webBuilderSiteId = initialPage?.id || (window as any).WEB_BUILDER_SITE_ID;
      
      const result = await generatePreviewServerSide({
        project_id: projectId,
        site_id: currentSiteId,
        web_builder_site_id: webBuilderSiteId!,
        mode: 'thumbnail'
      });

      if (result.success && result.preview_image_url) {
        setPreviewWarningsFromResult(
          result.warnings,
          'Preview generado, pero hubo advertencias al guardar metadatos.'
        );

        // Notificar a la App Madre para que refresque la miniatura en su UI
        sendToMother('SOLUTIUM_PREVIEW_GENERATED', {
          site_id: currentSiteId,
          preview_image_url: result.preview_image_url,
          preview_thumbnail_url: result.preview_thumbnail_url,
          preview_image_hash: result.preview_image_hash,
          preview_image_updated_at: result.preview_image_updated_at
        });

        setPreviewStatus('success');
      } else {
        if (result.errorCode === 'preview_region_missing' || result.errorCode === 'preview_missing_storage_config') {
          setPreviewDisableReason(
            result.errorCode === 'preview_missing_storage_config'
              ? 'preview_missing_storage_config'
              : 'preview_region_missing'
          );
          logDebug('[PREVIEW_CAPTURE_DEBUG] Manual preview omitted because backend storage is not configured.', {
            reason: result.reason || result.errorCode
          });
          setPreviewStatus('idle');
        } else if (result.skipped) {
          logDebug('[PREVIEW_CAPTURE_DEBUG] Manual preview skipped by client/backend guard.', {
            reason: result.reason || null
          });
          setPreviewStatus('idle');
        } else {
          throw new Error(result.error || 'No se pudo generar la vista previa server-side.');
        }
      }
    } catch (error: any) {
      console.warn('Manual preview update failed:', error);
      setPreviewWarning('No se pudo actualizar la vista previa. El borrador/publicación no se modifica.');
      setPreviewStatus('error');
    } finally {
      setIsGeneratingPreview(false);
      setTimeout(() => setPreviewStatus('idle'), 3000);
    }
  };

  const normalizeBentoSchema = (schema: BentoSchema, prompt: string) => {
    // 1. Limpiar el título (quitar prefijos comunes de prompts)
    let cleanTitle = schema.header.title || prompt;
    const prefixes = [
      /crea (una|un|la|el|información sobre|sección de|página de)\s+/i,
      /genera (una|un|la|el|información sobre)\s+/i,
      /haz (una|un|la|el|información sobre)\s+/i,
      /muéstrame (por qué|cómo|qué)\s+/i,
      /muestra (por qué|cómo|qué)\s+/i,
      /información que muestre\s+/i
    ];
    
    prefixes.forEach(p => {
      cleanTitle = cleanTitle.replace(p, '');
    });
    
    // Capitalización
    cleanTitle = cleanTitle.trim();
    if (cleanTitle) {
      cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
    } else {
      cleanTitle = "Solución Personalizada";
    }

    // 2. Normalizar items y asegurar layout básico
    const normalizedItems = schema.items.map((item, idx) => {
      const colsPerRow = 3;
      const colWidth = 4;
      const rowHeight = 2;
      
      return {
        ...item,
        id: item.id || `item_${idx}_${Math.random().toString(36).substr(2, 9)}`,
        x: typeof item.x === 'number' ? item.x : (idx % colsPerRow) * colWidth,
        y: typeof item.y === 'number' ? item.y : Math.floor(idx / colsPerRow) * rowHeight,
        type: item.type || 'icon_text',
        card_style: item.card_style || 'solid',
        col_span: item.col_span || 4,
        row_span: item.row_span || 2
      };
    });

    return {
      ...schema,
      header: {
        ...schema.header,
        title: cleanTitle
      },
      items: normalizedItems
    };
  };

  const handleBentoPromptInsert = (rawSchema: BentoSchema) => {
    // Intentar obtener el prompt actual del textarea si es posible
    const promptValue = (document.querySelector('textarea[placeholder*="SaaS"]') as HTMLTextAreaElement)?.value || "";
    const schema = normalizeBentoSchema(rawSchema, promptValue);
    
    const rawId = crypto.randomUUID();
    const sectionId = `section_${rawId}`;
    const moduleId = sectionId; 
    
    logDebug('[BENTO_GENERATED_SCHEMA_DEBUG]', {
      originalTitle: rawSchema.header.title,
      cleanTitle: schema.header.title,
      itemsCount: schema.items.length,
      layout: schema.layout
    });

    // 1. elements with prefix
    const newElements = BENTO_MODULE.elements.map(el => ({
      ...el,
      id: `${moduleId}_${el.id}`
    }));

    // 2. initialValues
    const initialValues: Record<string, any> = {};

    // Global settings
    Object.values(BENTO_MODULE.globalSettings || {}).forEach(groupSettings => {
      groupSettings.forEach(setting => {
        let val = resolveProjectAwareSettingDefault(setting, setting.defaultValue);
        if (setting.id === 'columns') val = schema.layout.columns;
        if (setting.id === 'gap') val = schema.layout.gap;
        if (setting.id === 'bento_type') val = schema.layout.bento_type || 'mixed_content';
        initialValues[`${moduleId}_global_${setting.id}`] = val;
      });
    });

    // Element settings
    newElements.forEach(element => {
      const cleanElementId = element.id.replace(`${moduleId}_`, '');
      Object.values(element.settings || {}).forEach(groupSettings => {
        groupSettings.forEach(setting => {
          let val = resolveProjectAwareSettingDefault(setting, setting.defaultValue);
          if (cleanElementId === 'el_bento_header') {
            if (setting.id === 'eyebrow') val = schema.header.eyebrow;
            if (setting.id === 'title') val = schema.header.title;
            if (setting.id === 'subtitle') val = schema.header.subtitle;
          }
          initialValues[`${element.id}_${setting.id}`] = val;
        });
      });
    });

    // 3. Forzar inserción de items en la clave que BentoModule espera
    const itemsKey = `${moduleId}_el_bento_items_items`;
    initialValues[itemsKey] = schema.items.map(item => ({
      ...item,
      icon: item.icon || 'Sparkles',
      image: item.image || '',
      col_span: item.col_span || 4,
      row_span: item.row_span || 2,
      card_style: item.card_style || 'solid',
      button_text: item.button_text || 'Explorar',
      btn_url: item.btn_url || '#',
      eyebrow: item.badge || ''
    }));

    const newModule = { 
      ...BENTO_MODULE, 
      id: moduleId,
      templateId: 'mod_bento_1',
      elements: newElements,
      name: 'Bento / Composición IA',
      // Redundancia solicitada por el usuario
      content: {
        title: schema.header.title,
        subtitle: schema.header.subtitle,
        items: initialValues[itemsKey]
      }
    };

    logDebug('[BENTO_FINAL_SECTION_PAYLOAD_DEBUG]', {
      sectionId,
      moduleId,
      title: newModule.content.title,
      itemsCount: newModule.content.items.length
    });

    updateEditorState(prev => {
      const addedModules = prev.addedModules || [];
      const footerIndex = addedModules.findIndex(m => m.id.startsWith('mod_footer_1'));
      const newModulesList = [...addedModules];
      if (footerIndex !== -1) newModulesList.splice(footerIndex, 0, newModule);
      else newModulesList.push(newModule);
      return {
        ...prev,
        addedModules: newModulesList,
        settingsValues: { ...prev.settingsValues, ...initialValues },
        expandedModuleId: moduleId,
        selectedElementId: `${moduleId}_global`
      };
    });

    setShowBentoPrompt(false);
    
    // 4. Sincronización manual con el store de renderizado (opcional pero seguro)
    // createRenderingContract se disparará vía useEffect al cambiar editorState
    
    // Auto-select and scroll
    setTimeout(() => {
      selectSection(sectionId);
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      logDebug('[BENTO_INSERT_RESULT_DEBUG]', {
        sectionId,
        itemsRendered: document.querySelectorAll(`[id^="${sectionId}"]`).length > 0
      });
    }, 400);
  };

  const useConstructorSplitLayout = Boolean(!isMobile && !isPreviewMode && !isExternalRender);

  return (
    <div className={`h-screen w-screen flex overflow-hidden bg-surface font-sans antialiased ${(isPreviewMode || isExternalRender) ? 'p-0' : ''}`}>
      {/* Desktop Sidebar */}
      {!isMobile && !isPreviewMode && !isExternalRender && (
        <MainSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          onBackToDashboard={onBackToDashboard} 
          logoUrl={logoUrl}
          logoWhiteUrl={logoWhiteUrl}
          project={project}
          onAddModule={addModule}
          onOpenBentoGenerator={() => setShowBentoPrompt(true)}
          onLogoClick={handleLogoClick}
        />
      )}
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {(activeTab === 'constructor' || activeTab === 'design-style' || activeTab === 'design-animations') && (
          <div className="flex flex-1 h-full overflow-hidden relative">
            {/* Mobile Layout */}
            {isMobile ? (
              <div className="flex flex-col flex-1 h-full overflow-hidden pb-[80px]">
                {!isPreviewMode && !isExternalRender && (
                  <TopBar 
                    onSave={handleSaveDraft} 
                    onPublish={handlePublish} 
                    logoUrl={logoUrl}
                    assetName={assetDisplayName}
                    viewport={viewport}
                    setViewport={handleViewportChange}
                    isFullscreen={isFullscreen}
                    setIsFullscreen={setIsFullscreen}
                    onReloadPreview={handleReloadPreview}
                    saveStatus={saveStatus}
                    publishStatus={publishStatus}
                    previewStatus={previewStatus}
                    isMobile={true}
                    isPreviewMode={isPreviewMode}
                    hasUnsavedChanges={hasUnsavedChanges}
                    isSaving={isSaving}
                    isDraftOperationInProgress={isDraftOperationInProgress}
                    autosaveStatus={autosaveEnabled ? autosaveStatus : 'disabled'}
                    autosaveError={autosaveError}
                    lastAutosavedAt={lastAutosavedAt}
                    showAutosaveIndicator={autosaveShowIndicator}
                    currentStatus={currentStatus}
                    isNewSite={!initialPage}
                  />
                )}
                
                <div className="flex-1 overflow-hidden relative">
                  {(activeTab === 'constructor' && mobileTab === 'constructor' && !isPreviewMode && !isExternalRender) && (
                    <div className="h-full overflow-y-auto bg-sidebar-bg custom-scrollbar">
                      <div className="p-6 md:p-10 flex flex-col items-center">
                        <h3 className="text-xl md:text-2xl font-black text-sidebar-foreground uppercase tracking-[0.1em] mb-12 text-center px-2">Catálogo de Módulos</h3>
                        
                        <div className="w-full">
                          {isMobile ? (
                            /* MOBILE/TABLET VIEW: Accordion + Centered */
                            <div className="flex flex-col items-center px-6 py-10">
                              <h3 className="text-xl md:text-2xl font-black text-sidebar-foreground uppercase tracking-[0.1em] mb-12 text-center px-2">Catálogo de Módulos</h3>
                              <div className="w-full max-w-md space-y-4">
                                {[
                                  { id: 'nav', label: 'Navegación', modules: [
                                    { icon: MODULE_INFO.menu.icon, label: "Menú", mod: MENU_MODULE },
                                    { icon: MODULE_INFO.footer.icon, label: "Pie de página", mod: FOOTER_MODULE }
                                  ]},
                                  { id: 'content', label: 'Contenido', modules: [
                                    { icon: MODULE_INFO.hero.icon, label: "Portada", mod: HERO_MODULE },
                                    { icon: MODULE_INFO.hero2.icon, label: "Portada Solutium", mod: HERO2_MODULE },
                                    { icon: MODULE_INFO.features.icon, label: "Características", mod: FEATURES_MODULE },
                                    { icon: MODULE_INFO.about.icon, label: "Sobre Nosotros", mod: ABOUT_MODULE },
                                    { icon: MODULE_INFO.process.icon, label: "Proceso", mod: PROCESS_MODULE },
                                    { icon: MODULE_INFO.stats.icon, label: "Estadísticas", mod: STATS_MODULE },
                                    { icon: MODULE_INFO.team.icon, label: "Equipo", mod: TEAM_MODULE },
                                    { icon: MODULE_INFO.comparative.icon, label: "Comparativo", mod: COMPARISON_MODULE }
                                  ]},
                                  { id: 'multimedia', label: 'Multimedia', modules: [
                                    { icon: MODULE_INFO.gallery.icon, label: "Galería", mod: GALLERY_MODULE },
                                    { icon: MODULE_INFO.video.icon, label: "Video", mod: VIDEO_MODULE }
                                  ]},
                                  { id: 'conversion', label: 'Conversión', modules: [
                                    { icon: MODULE_INFO.header.icon, label: "Barra superior", mod: HEADER_MODULE },
                                    { icon: MODULE_INFO.cta.icon, label: "Call to Action", mod: CTA_MODULE },
                                    { icon: MODULE_INFO.pricing.icon, label: "Precios", mod: PRICING_MODULE },
                                    { icon: MODULE_INFO.contact.icon, label: "Contacto", mod: CONTACT_MODULE },
                                    { icon: MODULE_INFO.newsletter.icon, label: "Newsletter", mod: NEWSLETTER_MODULE }
                                  ]},
                                  { id: 'social', label: 'Social', modules: [
                                    { icon: MODULE_INFO.testimonials.icon, label: "Testimonios", mod: TESTIMONIALS_MODULE },
                                    { icon: MODULE_INFO.trusted_logos.icon, label: "Logos de Empresas", mod: TRUSTED_LOGOS_MODULE },
                                    { icon: MODULE_INFO.faq.icon, label: "FAQ", mod: FAQ_MODULE }
                                  ]},
                                  { id: 'ecommerce', label: 'Catálogo', modules: [
                                    { icon: MODULE_INFO.products.icon, label: "Productos & Servicios", mod: PRODUCTS_MODULE }
                                  ]},
                                  { id: 'structure', label: 'Estructura', modules: [
                                    { icon: MODULE_INFO.spacer.icon, label: "Espaciadores", mod: SPACER_MODULE },
                                    { icon: MODULE_INFO.bento.icon, label: "Composición Libre", mod: BENTO_MODULE },
                                    { icon: MODULE_INFO.composition_section.icon, label: "Composición Visual", mod: COMPOSITION_SECTION_MODULE }
                                  ]}
                                ].map((cat) => (
                                  <div key={cat.id} className="border-b border-sidebar-foreground/5 last:border-0 pb-4">
                                    <button 
                                      onClick={() => setActiveModuleCategory(activeModuleCategory === cat.id ? null : cat.id)}
                                      className="w-full py-4 flex flex-col items-center justify-center group transition-all"
                                    >
                                      <span className={`text-base md:text-lg font-black uppercase tracking-widest transition-colors ${activeModuleCategory === cat.id ? 'text-primary' : 'text-sidebar-foreground/60 group-hover:text-sidebar-foreground'}`}>
                                        {cat.label}
                                      </span>
                                      <div className={`w-8 h-1 bg-primary mt-2 rounded-full transition-all duration-300 ${activeModuleCategory === cat.id ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 group-hover:opacity-40 group-hover:scale-x-50'}`} />
                                    </button>
                                    
                                    <AnimatePresence>
                                      {activeModuleCategory === cat.id && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: 'auto', opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                                          className="overflow-hidden"
                                        >
                                          <div className="flex flex-col items-center pt-4 pb-6">
                                            <div className="w-full max-w-[200px] space-y-1">
                                              {cat.modules.map((m, idx) => (
                                                <ModuleItem 
                                                  key={`cat-mod-${cat.id}-${idx}`}
                                                  icon={React.createElement(m.icon, { size: 18 })} 
                                                  label={m.label} 
                                                  onClick={() => addModule(m.mod)} 
                                                />
                                              ))}
                                            </div>
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            /* DESKTOP VIEW: Original List Alignment */
                            <div className="p-6">
                              <h3 className="text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-[0.2em] mb-8 text-left px-2">Catálogo de Módulos</h3>
                              
                              <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-8">
                                  <div className="space-y-4">
                                    <h4 className="text-[9px] font-black text-primary uppercase tracking-widest px-2">Navegación</h4>
                                    <div className="space-y-1">
                                      <ModuleItem icon={React.createElement(MODULE_INFO.menu.icon, { size: 18 })} label="Menú" onClick={() => addModule(MENU_MODULE)} />
                                      <ModuleItem icon={React.createElement(MODULE_INFO.footer.icon, { size: 18 })} label="Pie de página" onClick={() => addModule(FOOTER_MODULE)} />
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    <h4 className="text-[9px] font-black text-primary uppercase tracking-widest px-2">Contenido</h4>
                                    <div className="space-y-1">
                                      <ModuleItem icon={React.createElement(MODULE_INFO.hero.icon, { size: 18 })} label="Portada" onClick={() => addModule(HERO_MODULE)} />
                                      <ModuleItem icon={React.createElement(MODULE_INFO.hero2.icon, { size: 18 })} label="Portada Solutium" onClick={() => addModule(HERO2_MODULE)} />
                                      <ModuleItem icon={React.createElement(MODULE_INFO.features.icon, { size: 18 })} label="Características" onClick={() => addModule(FEATURES_MODULE)} />
                                      <ModuleItem icon={React.createElement(MODULE_INFO.about.icon, { size: 18 })} label="Sobre Nosotros" onClick={() => addModule(ABOUT_MODULE)} />
                                      <ModuleItem icon={React.createElement(MODULE_INFO.process.icon, { size: 18 })} label="Proceso" onClick={() => addModule(PROCESS_MODULE)} />
                                      <ModuleItem icon={React.createElement(MODULE_INFO.stats.icon, { size: 18 })} label="Estadísticas" onClick={() => addModule(STATS_MODULE)} />
                                      <ModuleItem icon={React.createElement(MODULE_INFO.team.icon, { size: 18 })} label="Equipo" onClick={() => addModule(TEAM_MODULE)} />
                                      <ModuleItem icon={React.createElement(MODULE_INFO.comparative.icon, { size: 18 })} label="Comparativo" onClick={() => addModule(COMPARISON_MODULE)} />
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    <h4 className="text-[9px] font-black text-primary uppercase tracking-widest px-2">Multimedia</h4>
                                    <div className="space-y-1">
                                      <ModuleItem icon={React.createElement(MODULE_INFO.gallery.icon, { size: 18 })} label="Galería" onClick={() => addModule(GALLERY_MODULE)} />
                                      <ModuleItem icon={React.createElement(MODULE_INFO.video.icon, { size: 18 })} label="Video" onClick={() => addModule(VIDEO_MODULE)} />
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-8">
                                  <div className="space-y-4">
                                    <h4 className="text-[9px] font-black text-primary uppercase tracking-widest px-2">Conversión</h4>
                                    <div className="space-y-1">
                                      <ModuleItem icon={React.createElement(MODULE_INFO.header.icon, { size: 18 })} label="Barra superior" onClick={() => addModule(HEADER_MODULE)} />
                                      <ModuleItem icon={React.createElement(MODULE_INFO.cta.icon, { size: 18 })} label="Call to Action" onClick={() => addModule(CTA_MODULE)} />
                                      <ModuleItem icon={React.createElement(MODULE_INFO.pricing.icon, { size: 18 })} label="Precios" onClick={() => addModule(PRICING_MODULE)} />
                                      <ModuleItem icon={React.createElement(MODULE_INFO.contact.icon, { size: 18 })} label="Contacto" onClick={() => addModule(CONTACT_MODULE)} />
                                      <ModuleItem icon={React.createElement(MODULE_INFO.newsletter.icon, { size: 18 })} label="Newsletter" onClick={() => addModule(NEWSLETTER_MODULE)} />
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    <h4 className="text-[9px] font-black text-primary uppercase tracking-widest px-2">Social</h4>
                                    <div className="space-y-1">
                                      <ModuleItem icon={React.createElement(MODULE_INFO.testimonials.icon, { size: 18 })} label="Testimonios" onClick={() => addModule(TESTIMONIALS_MODULE)} />
                                      <ModuleItem icon={React.createElement(MODULE_INFO.trusted_logos.icon, { size: 18 })} label="Logos de Empresas" onClick={() => addModule(TRUSTED_LOGOS_MODULE)} />
                                      <ModuleItem icon={React.createElement(MODULE_INFO.faq.icon, { size: 18 })} label="FAQ" onClick={() => addModule(FAQ_MODULE)} />
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    <h4 className="text-[9px] font-black text-primary uppercase tracking-widest px-2">Catálogo</h4>
                                    <div className="space-y-1">
                                      <ModuleItem icon={React.createElement(MODULE_INFO.products.icon, { size: 18 })} label="Productos & Servicios" onClick={() => addModule(PRODUCTS_MODULE)} />
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    <h4 className="text-[9px] font-black text-primary uppercase tracking-widest px-2">Estructura</h4>
                                    <div className="space-y-1">
                                      <ModuleItem icon={React.createElement(MODULE_INFO.spacer.icon, { size: 18 })} label="Espaciadores" onClick={() => addModule(SPACER_MODULE)} />
                                      <ModuleItem icon={React.createElement(MODULE_INFO.bento.icon, { size: 18 })} label="Composición Libre" onClick={() => addModule(BENTO_MODULE)} />
                                      <ModuleItem icon={React.createElement(MODULE_INFO.composition_section.icon, { size: 18 })} label="Composición Visual" onClick={() => addModule(COMPOSITION_SECTION_MODULE)} />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {(activeTab === 'design-style' || activeTab === 'design-animations') && (
                    <div className="h-full overflow-auto bg-slate-50">
                      <GlobalSettingsPanel 
                        view={activeTab as any}
                        settingsValues={editorState.settingsValues}
                        onSettingChange={handleSettingChange}
                        project={project}
                        projectId={projectId}
                      />
                    </div>
                  )}
                  
                  {mobileTab === 'structure' && (
                    <div className="h-full overflow-hidden bg-surface">
                      <StructurePanel 
                        editorState={editorState} 
                        setEditorState={setEditorState} 
                        onSettingChange={handleSettingChange}
                        onRemoveModule={removeModule}
                        onMoveModule={moveModule}
                        isCollapsed={false}
                        onToggleCollapse={() => {}}
                        projectId={projectId}
                        products={products}
                        customers={customers}
                        trustedCompanyLogos={trustedCompanyLogos}
                        isMobile={true}
                        activeTab={activeTab}
                      />
                    </div>
                  )}
                  
                  {mobileTab === 'preview' || isPreviewMode || isExternalRender ? (
                    <div className="h-full overflow-hidden" onClickCapture={handlePreviewClick}>
                      <Canvas 
                        editorState={editorState} 
                        onAddModule={addModule} 
                        products={products}
                        customers={customers}
                        trustedCompanyLogos={trustedCompanyLogos}
                        isDevMode={projectId === 'dev-project-id'}
                        logoUrl={logoUrl}
                        logoWhiteUrl={logoWhiteUrl}
                        project={project}
                        viewport={viewport}
                        setViewport={handleViewportChange}
                        isFullscreen={false}
                        setIsFullscreen={() => {}}
                        isPreviewMode={isPreviewMode || isExternalRender}
                        onSettingChange={handleSettingChange}
                        onOpenBentoGenerator={() => setShowBentoPrompt(true)}
                      />
                    </div>
                  ) : null}
                </div>
                
                {!isPreviewMode && !isExternalRender && <MobileBottomNav activeTab={mobileTab} onTabChange={handleMobileTabChange} />}
              </div>
            ) : (
              /* Desktop Layout */
              <>
                {!isPreviewMode && !isExternalRender && (
                  <StructurePanel 
                    editorState={editorState} 
                    setEditorState={setEditorState} 
                    onSettingChange={handleSettingChange}
                    onRemoveModule={removeModule}
                    onMoveModule={moveModule}
                    isCollapsed={structurePanelCollapsed}
                    onToggleCollapse={() => setStructurePanelCollapsed(!structurePanelCollapsed)}
                    projectId={projectId}
                    products={products}
                    customers={customers}
                    trustedCompanyLogos={trustedCompanyLogos}
                    activeTab={activeTab}
                    useSplitLayout={useConstructorSplitLayout}
                  />
                )}
                <div className={`${useConstructorSplitLayout ? 'w-[50vw] flex-none' : 'flex-1'} flex flex-col h-full min-w-0`}>
                  {!isPreviewMode && !isExternalRender && (
                  <TopBar 
                    onSave={handleSaveDraft} 
                    onPublish={handlePublish} 
                    logoUrl={logoUrl}
                    assetName={assetDisplayName}
                    viewport={viewport}
                    setViewport={handleViewportChange}
                    isFullscreen={isFullscreen}
                    setIsFullscreen={setIsFullscreen}
                    onReloadPreview={handleReloadPreview}
                    saveStatus={saveStatus}
                    publishStatus={publishStatus}
                    previewStatus={previewStatus}
                    isMobile={false}
                    isPreviewMode={isPreviewMode}
                    hasUnsavedChanges={hasUnsavedChanges}
                      isSaving={isSaving}
                      isDraftOperationInProgress={isDraftOperationInProgress}
                      autosaveStatus={autosaveEnabled ? autosaveStatus : 'disabled'}
                      autosaveError={autosaveError}
                      lastAutosavedAt={lastAutosavedAt}
                      showAutosaveIndicator={autosaveShowIndicator}
                      currentStatus={currentStatus}
                      isNewSite={!initialPage}
                    />
                  )}
                  <div className="flex-1 flex overflow-hidden">
                    <div className="flex-1 flex flex-col h-full overflow-hidden" onClickCapture={handlePreviewClick}>
                      <Canvas 
                        editorState={editorState} 
                        onAddModule={addModule} 
                        products={products}
                        customers={customers}
                        trustedCompanyLogos={trustedCompanyLogos}
                        isDevMode={projectId === 'dev-project-id'}
                        logoUrl={logoUrl}
                        logoWhiteUrl={logoWhiteUrl}
                        project={project}
                        viewport={viewport}
                        setViewport={handleViewportChange}
                      isFullscreen={isFullscreen}
                      setIsFullscreen={setIsFullscreen}
                      isPreviewMode={isPreviewMode || isExternalRender}
                      onSettingChange={handleSettingChange}
                        reloadKey={reloadKey}
                        onOpenBentoGenerator={() => setShowBentoPrompt(true)}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {showUnsavedModal && (
              <UnsavedChangesModal 
                onCancel={() => setShowUnsavedModal(false)}
                onSaveAndExit={handleSaveAndExit}
                onExitWithoutSaving={handleExitWithoutSaving}
              />
            )}
          </div>
        )}

        {activeTab === 'datos' && (
          <div className="flex-1 h-full overflow-auto bg-secondary">
            <div className="p-8">
              <div className="flex flex-col mb-8">
                <h2 className="text-3xl font-bold text-text">Gestión de Datos</h2>
                <p className="text-sm text-text/40 font-medium">Administra la información de tu proyecto de forma profesional.</p>
              </div>
              <DataTab projectId={projectId || ''} currentUserId={currentUserId || ''} />
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="flex-1 h-full overflow-auto bg-slate-50 relative">
            <GlobalSettingsPanel 
              view={activeTab}
              settingsValues={editorState.settingsValues}
              onSettingChange={handleSettingChange}
              project={project}
              projectId={projectId}
            />
          </div>
        )}
      </div>

      {/* AI Error Alert */}
      {authNotice && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`fixed bottom-8 right-8 z-[110] max-w-md w-[90vw] rounded-2xl border p-4 shadow-2xl ${
            authNotice.type === 'error'
              ? 'bg-white border-amber-200'
              : 'bg-white border-blue-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
              authNotice.type === 'error' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {authNotice.type === 'error' ? <LucideIcons.AlertTriangle size={18} /> : <LucideIcons.RefreshCw size={18} />}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-bold ${
                authNotice.type === 'error' ? 'text-amber-900' : 'text-blue-900'
              }`}>
                {authNotice.type === 'error' ? 'Sesión expirada' : 'Sesión actualizada'}
              </p>
              <p className={`text-xs leading-relaxed ${
                authNotice.type === 'error' ? 'text-amber-800' : 'text-blue-800'
              }`}>
                {authNotice.message}
              </p>
            </div>
            <button
              onClick={() => setAuthNotice(null)}
              className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <LucideIcons.X size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {previewWarning && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-8 right-8 z-[110] max-w-md w-[90vw] rounded-2xl border border-amber-200 bg-white p-4 shadow-2xl"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <LucideIcons.ImageOff size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-amber-900">Preview pendiente</p>
              <p className="text-xs leading-relaxed text-amber-800">{previewWarning}</p>
            </div>
            <button
              onClick={() => setPreviewWarning(null)}
              className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <LucideIcons.X size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* AI Error Alert */}
      {aiError && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-white border border-red-200 p-6 rounded-2xl shadow-2xl flex flex-col gap-4 max-w-md w-[90vw]"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
              <LucideIcons.AlertCircle size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-red-900">Error en el motor de IA</p>
              <p className="text-xs text-red-700 leading-relaxed">{aiError}</p>
            </div>
            <button 
              onClick={() => {
                setAiError(null);
                setShowAIInitialForm(true);
              }}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
            >
              <LucideIcons.RotateCcw size={18} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showAIInitialForm && !onboardingFinished && (
          <AIPagePlanModal
            key="ai-page-plan-modal"
            plan={aiPagePlan}
            isGenerating={isGeneratingAI}
            projectName={project?.name || siteName}
            onGenerate={handleGenerateAIPagePlan}
            onApply={handleApplyAIPagePlan}
            onCancel={handleCloseOnboarding}
          />
        )}
        {isGeneratingAI && !showAIInitialForm && (
          <AIGenerationModal 
            key="ai-generation-modal"
            currentStep={aiGenerationStep}
            steps={aiSteps}
            onCancel={() => setIsGeneratingAI(false)}
          />
        )}
        {moduleToDelete && (
          <DeleteConfirmationModal 
            key={`delete-module-${moduleToDelete.id}`}
            moduleName={moduleToDelete.name}
            onConfirm={confirmRemoveModule}
            onCancel={() => setModuleToDelete(null)}
          />
        )}
        {showPublishModal && (
          <PublishModal 
            key="publish-modal"
            siteName={siteName}
            setSiteName={updateSiteName}
            onPublish={handlePublish}
            onCancel={() => setShowPublishModal(false)}
            isSaving={isSaving}
          />
        )}

        {/* [PHASE 3D.5.2] Secure AI Flow Modals */}
        <MotherAIPageConfirmationModal 
          key="mother-ai-confirmation-modal"
          isOpen={isMotherAIConfirmationOpen}
          onClose={() => setIsMotherAIConfirmationOpen(false)}
          onConfirm={executeSecureAIGeneration}
          brief={{
            businessName: motherAIBrief?.name || '',
            industry: motherAIBrief?.industry || '',
            goal: motherAIBrief?.goal || ''
          }}
          costCredits={15}
          isGenerating={isGeneratingAI}
          isDryRun={isDryRun}
          onToggleDryRun={() => setIsDryRun(!isDryRun)}
        />

        {aiUsageSuccess && (
          <AIUsageSuccessModal 
            key="ai-usage-success-modal"
            isOpen={!!aiUsageSuccess}
            onClose={() => setAiUsageSuccess(null)}
            usage={aiUsageSuccess}
          />
        )}

        {showBentoPrompt && (
          <BentoPromptGenerator 
            key="bento-prompt-modal"
            onInsert={handleBentoPromptInsert}
            onClose={() => setShowBentoPrompt(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
