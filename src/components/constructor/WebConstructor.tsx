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
  PRODUCTS_MODULE, HERO_MODULE, FEATURES_MODULE, ABOUT_MODULE, 
  PROCESS_MODULE, GALLERY_MODULE, VIDEO_MODULE, TESTIMONIALS_MODULE, 
  STATS_MODULE, NEWSLETTER_MODULE, CONTACT_MODULE, TEAM_MODULE, 
  CTA_MODULE, PRICING_MODULE, FAQ_MODULE, CLIENTS_MODULE,
  BENTO_MODULE, COMPARISON_MODULE
} from './registry';
import { saveWebBuilderSiteDraft, publishWebBuilderSite, getProducts, getCustomers, upsertPage, upsertPageSections, logEvolutionRequest, getPageBySiteId } from '../../services/dataService';
import { sendToMother } from '../../services/handshakeService';
import { Product, Customer, PageSection } from '../../types/schema';
import { MOCK_PRODUCTS, MOCK_CUSTOMERS } from '../../constants/mockData';
import { MainSidebar, ModuleItem } from './MainSidebar';
import { StructurePanel } from './StructurePanel';
import { TopBar } from './TopBar';
import { Canvas } from './Canvas';
import { GlobalSettingsPanel } from './GlobalSettingsPanel';
import { 
  MobileBottomNav, 
  UnsavedChangesModal, 
  DeleteConfirmationModal, 
  PublishModal,
  AIGenerationModal
} from './ConstructorModals';
import { 
  getThemeVal,
  getFontFamily,
  getBorderRadius,
} from './utils';
import { generateSite } from '../../services/aiService';
import { AIGenerationContext } from '../../types/ai';
import { ProjectForm, ProjectFormData } from '../ProjectForm';
import { useEditorStore } from '../../store/editorStore';
import { PropertyEditor } from './PropertyEditor';
import { logDebug } from '../../utils/debug';

// --- CONSTANTS ---
const MASTER_DICTIONARY = {
  modules: [
    'hero', 'features', 'about', 'process', 'gallery', 'video', 'testimonials', 
    'stats', 'newsletter', 'contact', 'team', 'cta', 'pricing', 'faq', 'clients', 
    'bento', 'comparative', 'header', 'menu', 'footer', 'spacer', 'products'
  ],
  styles: [
    'border_radius', 'box_shadow', 'font_family', 'button_styles', 
    'bg_type', 'dark_mode', 'primary_color', 'accent_color', 'text_color'
  ]
};

// --- HELPERS ---
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
    updateSectionSettings,
    addSection,
    removeSection,
    setProject,
    showMenuRecommendation,
    setShowMenuRecommendation
  } = useEditorStore();

  useEffect(() => {
    if (initialPage && 'content' in initialPage && (initialPage as any).content) {
      setSiteContent((initialPage as any).content);
    } else if (initialPage && 'contentDraft' in initialPage && initialPage.contentDraft) {
      // SIP v7.4: Ensure that if we have a draft, we also have a valid siteContent 
      // for the Canvas to render during the first 1.5s (before standard sync kicks in)
      const draft = initialPage.contentDraft;
    }
  }, []);

  useEffect(() => {
    if (project) {
      setProject(project);
    }
  }, [project, initialPage, setProject]);

  const [activeTab, setActiveTab] = useState('constructor');
  const [mobileTab, setMobileTab] = useState<'constructor' | 'structure' | 'preview'>('constructor');
  const [isMobile, setIsMobile] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [moduleToDelete, setModuleToDelete] = useState<WebModule | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [siteName, setSiteName] = useState(() => {
    if (!initialPage) return '';
    return (initialPage as any).siteName || (initialPage as any).title || '';
  });
  
  const [currentSiteId] = useState(() => {
    // 1. Si estamos editando una página existente (Borrador o Publicada), usamos su siteId.
    if (initialPage && (initialPage as any).siteId) return (initialPage as any).siteId;
    if (initialPage && (initialPage as any).web_builder_site_id) return (initialPage as any).web_builder_site_id;
    
    // 2. Si es una página NUEVA, generamos un ID único para que sea independiente.
    return crypto.randomUUID();
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [publishStatus, setPublishStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [currentStatus, setCurrentStatus] = useState<'draft' | 'published' | 'modified'>(() => {
    if (initialPage && 'status' in initialPage) {
      return (initialPage as any).status || 'draft';
    }
    // Si es una PublishedSite (no tiene status field pero existe), asumimos published
    if (initialPage && !('status' in initialPage)) return 'published';
    return 'draft';
  });
  const [structurePanelCollapsed, setStructurePanelCollapsed] = useState(false);
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [editorState, setEditorState] = useState<EditorState>(() => {
    const defaultState: EditorState = {
      addedModules: [],
      expandedModuleId: null,
      selectedElementId: null,
      expandedGroupsByElement: {},
      settingsValues: {
        'global_theme_primary_color': project?.brandColors?.primary || '#3B82F6',
        'global_theme_secondary_color': project?.brandColors?.secondary || '#F1F5F9',
        'global_theme_accent_color': project?.brandColors?.accent || '#7C3AED',
        'global_theme_background_color': '#F8FAFC',
        'global_theme_text_color': '#0F172A',
        'global_theme_font_sans': project?.fontFamily || 'Inter',
        'global_theme_font_heading': project?.fontFamily || 'Inter',
        'global_theme_radius': 12,
        'global_theme_container_width': 1400
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
          
          if (section.settings) {
            Object.entries(section.settings).forEach(([k, v]) => {
              const key = k.startsWith(prefix) ? k : `${prefix}_${k}`;
              reconstructedSettings[key] = v;
            });
          }

          if (section.content) {
            Object.entries(section.content).forEach(([k, v]) => {
              // Mapeo inverso de content a deep settings keys
              if (k === 'title' || k === 'texto_principal' || k === 'texto_base') {
                reconstructedSettings[`${prefix}_el_hero_typography_title`] = v;
              } else if (k === 'subtitle' || k === 'texto_secundario' || k === 'texto_descripcion') {
                reconstructedSettings[`${prefix}_el_hero_typography_subtitle`] = v;
              } else if (k === 'eyebrow') {
                reconstructedSettings[`${prefix}_el_hero_typography_eyebrow`] = v;
              } else if (k === 'image_url') {
                reconstructedSettings[`${prefix}_el_hero_media_image`] = v;
              }
              if (k === 'primary_cta' && v && typeof v === 'object') {
                reconstructedSettings[`${prefix}_el_hero_ctas_primary_text`] = (v as any).text;
                reconstructedSettings[`${prefix}_el_hero_ctas_primary_url`] = (v as any).url;
              }
            });
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
  const aiSteps = [
    "Diseñando estructura por industria...",
    "Redactando contenido persuasivo...",
    "Sincronizando paleta de marca y estilo...",
    "Curando imágenes de stock y activos..."
  ];

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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const isInitialLoad = useRef(true);

  // Mark initial load as finished after a short delay to allow sync effects to run
  useEffect(() => {
    const timer = setTimeout(() => {
      isInitialLoad.current = false;
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Apply Global Theme to CSS Variables
  useEffect(() => {
    const root = document.documentElement;
    const settings = editorState.settingsValues;
    
    const getThemeVal = (key: string, fallback: any) => settings[`global_theme_${key}`] ?? fallback;

    // Apply Colors
    root.style.setProperty('--primary-color', getThemeVal('primary_color', project?.brandColors?.primary || '#3B82F6'));
    root.style.setProperty('--secondary-color', getThemeVal('secondary_color', '#F1F5F9'));
    root.style.setProperty('--accent-color', getThemeVal('accent_color', '#7C3AED'));
    root.style.setProperty('--background-color', getThemeVal('background_color', '#F8FAFC'));
    root.style.setProperty('--foreground-color', getThemeVal('text_color', '#0F172A'));
    root.style.setProperty('--card-color', getThemeVal('background_color', '#F8FAFC'));
    
    // Apply Typography
    const fontSans = getThemeVal('font_sans', 'Inter');
    const fontHeading = getThemeVal('font_heading', 'Inter');
    root.style.setProperty('--solutium-font', `"${fontSans}", sans-serif`);
    root.style.setProperty('--font-heading', `"${fontHeading}", sans-serif`);

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
    root.style.setProperty('--radius', `${getThemeVal('radius', 12)}px`);
    root.style.setProperty('--max-width', `${getThemeVal('container_width', 1400)}px`);
    
  }, [editorState.settingsValues, project]);

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
      getProducts(0, 12, projectId).then(data => {
        setProducts(data || []);
      });
      getCustomers(0, 50, projectId).then(data => {
        setCustomers(data || []);
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
      if (next !== prev && !isInitialLoad.current) setHasUnsavedChanges(true);
      return next;
    });
  };

  const updateSiteName = (name: string) => {
    setSiteName(name);
    if (!isInitialLoad.current) setHasUnsavedChanges(true);
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
      updateEditorState(prev => {
        const newSettings = { ...prev.settingsValues };
        let changed = false;
        
        siteContent.sections.forEach(section => {
          Object.entries(section.settings).forEach(([key, val]) => {
            if (newSettings[key] !== val) {
              newSettings[key] = val;
              changed = true;
            }
          });
        });

        if (changed) return { ...prev, settingsValues: newSettings };
        return prev;
      });
    }
  }, [siteContent.sections]);

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

  const handleAISubmit = async (data: ProjectFormData) => {
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
      setHasUnsavedChanges(true);
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
          let val = setting.defaultValue;
          
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
          initialValues[`${moduleId}_global_${setting.id}`] = val;
        });
      });
    }

    // Element settings
    newElements.forEach(element => {
      if (element.settings) {
        Object.values(element.settings).forEach(groupSettings => {
          groupSettings.forEach(setting => {
            let val = setting.defaultValue;
            
            // Custom logic for specific settings
            if ((setting.id === 'logo_text' || setting.id === 'brand_name') && project?.name) {
              val = project.name.toUpperCase();
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

      const isUtilityModule = ['navegacion', 'espaciador', 'footer'].includes(module.type) || module.id.startsWith('mod_header_1') || module.id.startsWith('mod_menu_1') || module.id.startsWith('mod_footer_1');

      const finalState = {
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

      // SOP: Auto-generate menu link if not utility
      if (!isPreviewMode && !isUtilityModule) {
        const menuMod = newModules.find(m => m.type === 'navegacion');
        if (menuMod) {
          const menuItemsElId = `${menuMod.id}_el_menu_items`;
          const currentLinks = finalState.settingsValues[`${menuItemsElId}_links`] || [];
          const anchor = `#${moduleId}`;
          const isLinked = currentLinks.some((l: any) => l.url === anchor);
          
          if (!isLinked) {
            const moduleInfo = (module.iconKey && MODULE_INFO[module.iconKey]) || MODULE_INFO[module.type] || { label: module.name };
            const iconKey = module?.iconKey || module?.type || '';
            const newLinks = [...currentLinks, { label: moduleInfo.label, url: anchor, icon: iconKey }];
            finalState.settingsValues[`${menuItemsElId}_links`] = newLinks;
          }
        }
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

      // Automatically remove link from menu if it exists
      const menuModule = newModules.find(m => m.type === 'navegacion');
      if (menuModule) {
        const menuElementId = `${menuModule.id}_el_menu_items`;
        const currentLinks = newSettingsValues[`${menuElementId}_links`] || [];
        const anchor = `#${moduleId}`;
        if (currentLinks.some((l: any) => l.url === anchor)) {
          newSettingsValues[`${menuElementId}_links`] = currentLinks.filter((l: any) => l.url !== anchor);
        }
      }

      return {
        ...prev,
        addedModules: newModules,
        expandedModuleId: prev.expandedModuleId === moduleId ? null : prev.expandedModuleId,
        selectedElementId: prev.selectedElementId?.startsWith(moduleId) ? null : prev.selectedElementId,
        settingsValues: newSettingsValues
      };
    });
    setModuleToDelete(null);
  };

  const handleSettingChange = (elementOrModuleId: string, settingId: string, value: any) => {
    updateEditorState(prev => ({
      ...prev,
      settingsValues: {
        ...prev.settingsValues,
        [`${elementOrModuleId}_${settingId}`]: value
      }
    }));
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
    const firstModuleId = currentState.addedModules[0]?.id;
    const primaryColor = firstModuleId 
      ? getVal(firstModuleId, null, 'primary_color', project?.brandColors?.primary || '#2563EB')
      : (project?.brandColors?.primary || '#2563EB');

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
            const isRotatingFixed = cleanKey === 'rotating_fixed' || cleanKey.endsWith('_rotating_fixed');
            const isRotatingOptions = cleanKey === 'rotating_options' || cleanKey.endsWith('_rotating_options');
            const isRotatingEnabled = cleanKey === 'rotating_enabled' || cleanKey.endsWith('_rotating_enabled');

            // --- ALLOCATION (Solutium v7.7 - Order Sensitive) ---
            const isContentField = isEyebrowText || isTitleText || isSubtitleText || isImageField || isPrimaryCtaText || isPrimaryCtaUrl || isSecondaryCtaText || isSecondaryCtaUrl || isRotatingOptions || isRotatingFixed || isRotatingEnabled || cleanKey.includes('rotating_speed');

            if (isEyebrowText) {
              content.eyebrow = value;
            } else if (isTitleText && !content.title) {
              if (module.type === 'hero' || module.id.startsWith('mod_hero')) {
                content.texto_principal = value;
                content.texto_base = value;
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
            } else if (isRotatingEnabled) {
              content.is_rotating_active = value;
            } else if (cleanKey.includes('rotating_speed')) {
              content.intervalo_ms = value;
            }
            
            // Allocation to Styles/Settings & Audit Specs (Solutium Protocol v2.3)
            // Note: Colors and styles should ALWAYS go to settings, even if they contain text-like keywords
            if (!isContentField || isPrimaryCtaUrl || isPrimaryCtaText || isEyebrowText || isImageField || isRotatingOptions || isRotatingFixed || isRotatingEnabled) {
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

        // Specific overrides for modules that have multiple items (like products/clients)
        if (module.type === 'products') {
          content.productIds = getVal(module.id, null, 'select_products', []);
        }
        if (module.type === 'clients') {
          content.customerIds = getVal(module.id, null, 'select_customers', []);
        }

        const isDynamic = content.is_rotating_active === true;
        const tipo = isDynamic ? `${module.type}_dinamico` : module.type;

        if (isDynamic) {
          const rawBase = content.texto_base || content.texto_principal || content.title || '';
          const marcador = '%ROTATIVO%';
          
          content.config = {
            texto_base: rawBase.includes(marcador) ? rawBase : `${rawBase} ${marcador}`,
            palabras_efecto: content.palabras_efecto || [],
            estilo_efecto: content.estilo_efecto || '',
            intervalo_ms: content.intervalo_ms || 3000,
            marcador_posicion: marcador
          };
        }

        return {
          id: module.id,
          tipo: tipo,
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
    cssBlock += `:root { --primary-color: ${primaryColor}; }\n`;
    
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

    return {
      layout: "full-width",
      inject_tailwind: true,
      css: cssBlock,
      theme: {
        primaryColor,
        fontFamily: project?.fontFamily || 'Inter',
      },
      sections
    };
  };

  const handleSaveDraft = async (forcedStatus?: 'draft' | 'published' | 'modified') => {
    if (!projectId || isPreviewMode) return;
    setSaveStatus('loading');
    setIsSaving(true);
    
    try {
      const finalSiteName = siteName || formatTimestampName();
      const siteId = currentSiteId;

      // --- PROTOCOLO SOLUTIUM v6.2: Prep Editor State before saving ---
      const migratedState = migrateEditorStateToUUIDs(editorState);
      if (migratedState !== editorState) {
        setEditorState(migratedState);
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
        setSaveStatus('success');
        setHasUnsavedChanges(false);
        setCurrentStatus(newStatus);
        
        sendToMother('SOLUTIUM_SAVE', {
          site_id: siteId,
          site_name: finalSiteName,
          status: newStatus,
          timestamp: new Date().toISOString()
        });

        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        throw new Error('Error al guardar el borrador');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const isDefaultName = (name: string) => {
    if (!name) return true;
    const timestampRegex = /^\d{2}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}-(am|pm)$/;
    return timestampRegex.test(name) || name === 'Mi Sitio Web';
  };

  const handleCloseOnboarding = () => {
    setShowAIInitialForm(false);
    if (onCancelOnboarding) {
      onCancelOnboarding();
    } else {
      setOnboardingFinished(true);
    }
  };

  const handlePublish = async () => {
    if (!projectId || isPreviewMode) return;
    
    if (isDefaultName(siteName)) {
      setShowPublishModal(true);
      return;
    }

    const finalSiteName = siteName;
    setPublishStatus('loading');
    setIsSaving(true);
    try {
      // --- PROTOCOLO SOLUTIUM v2.0: Identidad UUID Persistente ---
      const migratedState = migrateEditorStateToUUIDs(editorState);
      if (migratedState !== editorState) {
        setEditorState(migratedState);
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

      // 2. Publish Site (Legacy published_sites sync)
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
          version: '6.1'
        }
      };

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
        setCurrentStatus('published');
        setHasUnsavedChanges(false);
        setShowPublishModal(false);

        sendToMother('SOLUTIUM_PUBLISH', {
          site_id: siteId,
          site_name: finalSiteName,
          status: 'published',
          timestamp: new Date().toISOString()
        });
      } else {
        throw new Error('Error al publicar el sitio');
      }
    } catch (error) {
      console.error('Error publishing site:', error);
      setPublishStatus('error');
      setTimeout(() => setPublishStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSwitchToHamburgerGlobal = () => {
    const menuMod = editorState.addedModules.find(m => m.type === 'navegacion');
    if (menuMod) {
      const fullKey = `${menuMod.id}_global_desktop_hamburger`;
      
      // Update local editorState directly as it's the primary source of truth for the Canvas
      handleSettingChange(menuMod.id, 'global_desktop_hamburger', true);
      
      // Also update store to prevent the synchronization useEffect from overwriting it
      updateSectionSettings(menuMod.id, { [fullKey]: true });

      // Scroll to menu immediately so user can see it
      setTimeout(() => {
        const element = document.getElementById(menuMod.id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      
      setShowMenuRecommendation(false);
    }
  };

  const handleReload = () => {
    setReloadKey(prev => prev + 1);
  };

  const handlePreview = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('mode', 'preview');
    url.searchParams.set('site_id', currentSiteId);
    window.open(url.toString(), '_blank');
  };

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
                    onReload={handleReload}
                    logoUrl={logoUrl}
                    viewport={viewport}
                    setViewport={setViewport}
                    isFullscreen={isFullscreen}
                    setIsFullscreen={setIsFullscreen}
                    saveStatus={saveStatus}
                    publishStatus={publishStatus}
                    isMobile={true}
                    isPreviewMode={isPreviewMode}
                    hasUnsavedChanges={hasUnsavedChanges}
                    currentStatus={currentStatus}
                    isNewSite={!initialPage}
                  />
                )}
                
                <div className="flex-1 overflow-hidden relative">
                  {(activeTab === 'constructor' && mobileTab === 'constructor' && !isPreviewMode && !isExternalRender) && (
                    <div className="h-full overflow-y-auto bg-sidebar-bg custom-scrollbar">
                      <div className="p-6">
                        <h3 className="text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-[0.2em] mb-8 text-left px-2">Catálogo de Módulos</h3>
                        
                        <div className="grid grid-cols-2 gap-8">
                          {/* Columna Izquierda: Navegación, Contenido, Multimedia */}
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

                          {/* Columna Derecha: Conversión, Social, E-commerce, Estructura */}
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
                                <ModuleItem icon={React.createElement(MODULE_INFO.clients.icon, { size: 18 })} label="Clientes" onClick={() => addModule(CLIENTS_MODULE)} />
                                <ModuleItem icon={React.createElement(MODULE_INFO.faq.icon, { size: 18 })} label="FAQ" onClick={() => addModule(FAQ_MODULE)} />
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h4 className="text-[9px] font-black text-primary uppercase tracking-widest px-2">E-commerce</h4>
                              <div className="space-y-1">
                                <ModuleItem icon={React.createElement(MODULE_INFO.products.icon, { size: 18 })} label="Productos" onClick={() => addModule(PRODUCTS_MODULE)} />
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h4 className="text-[9px] font-black text-primary uppercase tracking-widest px-2">Estructura</h4>
                              <div className="space-y-1">
                                <ModuleItem icon={React.createElement(MODULE_INFO.spacer.icon, { size: 18 })} label="Espaciadores" onClick={() => addModule(SPACER_MODULE)} />
                                <ModuleItem icon={React.createElement(MODULE_INFO.bento.icon, { size: 18 })} label="Composición Libre" onClick={() => addModule(BENTO_MODULE)} />
                              </div>
                            </div>
                          </div>
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
                        isDevMode={projectId === 'dev-project-id'}
                        logoUrl={logoUrl}
                        logoWhiteUrl={logoWhiteUrl}
                        viewport={viewport}
                        setViewport={setViewport}
                        isFullscreen={false}
                        setIsFullscreen={() => {}}
                        isPreviewMode={isPreviewMode || isExternalRender}
                        onSettingChange={handleSettingChange}
                        onReload={handleReload}
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
                    activeTab={activeTab}
                  />
                )}
                <div className="flex-1 flex flex-col h-full">
                  {!isPreviewMode && !isExternalRender && (
                    <TopBar 
                      onSave={handleSaveDraft} 
                      onPublish={handlePublish} 
                      onReload={handleReload}
                      logoUrl={logoUrl}
                      viewport={viewport}
                      setViewport={setViewport}
                      isFullscreen={isFullscreen}
                      setIsFullscreen={setIsFullscreen}
                      saveStatus={saveStatus}
                      publishStatus={publishStatus}
                      isMobile={false}
                      isPreviewMode={isPreviewMode}
                      hasUnsavedChanges={hasUnsavedChanges}
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
                        isDevMode={projectId === 'dev-project-id'}
                        logoUrl={logoUrl}
                        logoWhiteUrl={logoWhiteUrl}
                        viewport={viewport}
                        setViewport={setViewport}
                        isFullscreen={isFullscreen}
                        setIsFullscreen={setIsFullscreen}
                        isPreviewMode={isPreviewMode || isExternalRender}
                        onSettingChange={handleSettingChange}
                        onReload={handleReload}
                        reloadKey={reloadKey}
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
          <ProjectForm 
            onSubmit={handleAISubmit}
            onCancel={handleCloseOnboarding}
          />
        )}
        {isGeneratingAI && (
          <AIGenerationModal 
            currentStep={aiGenerationStep}
            steps={aiSteps}
            onCancel={() => setIsGeneratingAI(false)}
          />
        )}
        {moduleToDelete && (
          <DeleteConfirmationModal 
            moduleName={moduleToDelete.name}
            onConfirm={confirmRemoveModule}
            onCancel={() => setModuleToDelete(null)}
          />
        )}
        {showPublishModal && (
          <PublishModal 
            siteName={siteName}
            setSiteName={setSiteName}
            onPublish={handlePublish}
            onCancel={() => setShowPublishModal(false)}
            isSaving={isSaving}
          />
        )}

        {showMenuRecommendation && (
          <>
            {/* Extremely high z-index backdrop and modal for the recommendation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999998]"
              onClick={() => setShowMenuRecommendation(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[999999] max-w-2xl w-[90%] bg-white border border-slate-200 shadow-[0_32px_128px_-12px_rgba(0,0,0,0.5)] rounded-[40px] p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 overflow-hidden"
            >
              {/* Sparkles decoration */}
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <LucideIcons.Sparkles size={160} />
              </div>

              {/* Visual Guide Representation */}
              <div className="w-40 h-40 shrink-0 bg-slate-50 rounded-[32px] border border-slate-200 flex flex-col items-center justify-center relative group p-2 shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
                
                {/* Simulated UI element representing the Structure Panel link button */}
                <div className="w-full flex items-center justify-between gap-1 p-2 bg-white border border-slate-100 rounded-xl shadow-md mb-3 scale-90">
                  <div className="w-12 h-2 bg-slate-100 rounded-full" />
                  <div className="bg-blue-500/10 text-blue-600 p-1.5 rounded-md border border-blue-500/20 shadow-sm">
                    <LucideIcons.Link size={12} />
                  </div>
                </div>

                <div className="bg-blue-500/20 text-blue-600 p-5 rounded-2xl border border-blue-500/30 relative shadow-lg">
                  <LucideIcons.Link size={40} />
                  <motion.div 
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-600 rounded-full border-4 border-white" 
                  />
                </div>
                <p className="text-[10px] font-black text-blue-600 mt-4 uppercase tracking-[0.2em] text-center leading-none">
                  Desactivar Link
                </p>
              </div>

              {/* Text Content */}
              <div className="flex-1 text-center md:text-left space-y-4">
                <div className="flex items-center justify-center md:justify-start gap-2 text-blue-600 font-bold">
                  <LucideIcons.Info size={20} />
                  <span className="text-sm tracking-[0.2em] uppercase">Optimización UI</span>
                </div>
                <h4 className="text-3xl font-black text-slate-900 leading-tight">¡Tu menú ha crecido mucho!</h4>
                <p className="text-lg text-slate-500 leading-relaxed">
                  Detectamos demasiados enlaces en tu navegación. Para que tu sitio luzca impecable en todos los dispositivos:
                </p>
                
                <div className="space-y-2 pb-4">
                   <div className="flex items-center gap-3 text-slate-600">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">1</div>
                      <p className="text-sm">Desactiva enlaces en algunos módulos</p>
                   </div>
                   <div className="flex items-center gap-3 text-slate-600">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">2</div>
                      <p className="text-sm">O simplemente usa el menú hamburguesa estilo móvil</p>
                   </div>
                </div>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <button 
                    onClick={handleSwitchToHamburgerGlobal}
                    className="px-8 py-4 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 shadow-2xl shadow-blue-500/30 transition-all flex items-center gap-3"
                  >
                    <LucideIcons.Menu size={16} />
                    Activar Hamburguesa
                  </button>
                  <button 
                    onClick={() => setShowMenuRecommendation(false)}
                    className="px-8 py-4 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-full hover:bg-slate-200 transition-all"
                  >
                    Entendido
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
