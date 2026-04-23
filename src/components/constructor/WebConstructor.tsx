import React, { useState, useEffect } from 'react';
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
import { Project, RenderingContract, WebBuilderSite, PublishedSite } from '../../types/schema';
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
import { saveWebBuilderSiteDraft, publishWebBuilderSite, getProducts, getCustomers } from '../../services/dataService';
import { sendToMother } from '../../services/handshakeService';
import { Product, Customer } from '../../types/schema';
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

// --- CONSTANTS ---

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
  initialPage?: WebBuilderSite | PublishedSite | null;
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
    setProject
  } = useEditorStore();

  useEffect(() => {
    if (project) {
      setProject(project);
    }
  }, [project, setProject]);

  const [activeTab, setActiveTab] = useState('constructor');
  const [mobileTab, setMobileTab] = useState<'constructor' | 'structure' | 'preview'>('constructor');
  const [isMobile, setIsMobile] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [moduleToDelete, setModuleToDelete] = useState<WebModule | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [siteName, setSiteName] = useState(initialPage?.siteName || '');
  
  const [currentSiteId] = useState(() => {
    // 1. Si estamos editando una página existente (Borrador o Publicada), usamos su siteId.
    if (initialPage?.siteId) return initialPage.siteId;
    
    // 2. Si es una página NUEVA, generamos un ID único para que sea independiente y no sobreescriba otras.
    // Solo usamos el ID del proyecto si no hay ninguna otra página, para facilitar la configuración inicial,
    // pero el usuario ha pedido independencia total para nuevos sitios.
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

    if (initialPage && 'contentDraft' in initialPage && initialPage.contentDraft) {
      const draft = initialPage.contentDraft as any;
      const addedModules = Array.isArray(draft.addedModules) ? draft.addedModules : [];
      
      // Merge draft values over default theme values to preserve user customizations
      return {
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
    }
    
    // Fallback for PublishedSite if contentDraft is missing but content exists
    if (initialPage && 'content' in initialPage && (initialPage as any).content) {
      // If it's a published site, we might need to reconstruct the editor state
      // but usually we save a draft alongside the publication.
      // For now, just return default if no draft.
    }

    return defaultState;
  });
  
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
  const [reloadKey, setReloadKey] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

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
      if (next !== prev) setHasUnsavedChanges(true);
      return next;
    });
  };

  const updateSiteName = (name: string) => {
    setSiteName(name);
    setHasUnsavedChanges(true);
  };

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

          const moduleId = `${baseModule.id}_${Date.now()}_${idx}`;
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
      setIsGeneratingAI(false);
    } catch (error: any) {
      console.error("Error en Solutium AI Engine:", error);
      setIsGeneratingAI(false);
      setAiError(error.message || "No se pudo generar el sitio. Por favor, verifica tu conexión o las API Keys en Staging.");
    }
  };

  const addModule = (module: WebModule) => {
    console.log('Adding module:', module.type);
    const moduleId = `${module.id}_${Date.now()}`;
    
    // Prefix element IDs to ensure uniqueness
    const newElements = module.elements.map(el => ({
      ...el,
      id: `${moduleId}_${el.id}`
    }));

    const newModule = { 
      ...module, 
      id: moduleId,
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

      return {
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
    setEditorState(prev => {
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

  const generateRenderingContract = (finalSiteName: string): RenderingContract => {
    // Helper to get setting value with fallback
    const getVal = (moduleId: string, elementId: string | null, settingId: string, defaultValue: any) => {
      const key = elementId ? `${moduleId}_${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
      return editorState.settingsValues[key] !== undefined ? editorState.settingsValues[key] : defaultValue;
    };

    // 1. Determine Global Theme
    const firstModuleId = editorState.addedModules[0]?.id;
    const primaryColor = firstModuleId 
      ? getVal(firstModuleId, null, 'primary_color', project?.brandColors?.primary || '#2563EB')
      : (project?.brandColors?.primary || '#2563EB');

    return {
      theme: {
        primaryColor,
        fontFamily: project?.fontFamily || 'Inter',
      },
      sections: editorState.addedModules.map(module => {
        const content: any = {};

        // Extract specific content fields for the mother app's expected structure
        if (module.type === 'hero') {
          content.title = getVal(module.id, 'el_hero_title', 'text', '');
          content.subtitle = getVal(module.id, 'el_hero_subtitle', 'text', '');
          content.buttonText = getVal(module.id, 'el_hero_cta', 'text', '');
          content.imageUrl = getVal(module.id, 'el_hero_visual', 'url', '');
        } else if (module.type === 'features') {
          content.title = getVal(module.id, 'el_features_header', 'title', '');
          content.subtitle = getVal(module.id, 'el_features_header', 'subtitle', '');
        } else if (module.type === 'contact') {
          content.title = getVal(module.id, 'el_contact_info', 'title', '');
          content.subtitle = getVal(module.id, 'el_contact_info', 'subtitle', '');
          content.buttonText = getVal(module.id, 'el_contact_form', 'button_text', '');
        } else if (module.type === 'team') {
          content.title = getVal(module.id, 'el_team_header', 'title', '');
          content.subtitle = getVal(module.id, 'el_team_header', 'subtitle', '');
        } else if (module.type === 'pricing') {
          content.title = getVal(module.id, 'el_pricing_header', 'title', '');
          content.subtitle = getVal(module.id, 'el_pricing_header', 'subtitle', '');
        } else if (module.type === 'faq') {
          content.title = getVal(module.id, 'el_faq_header', 'title', '');
          content.subtitle = getVal(module.id, 'el_faq_header', 'subtitle', '');
        } else {
          // Fallback for other modules
          content.title = getVal(module.id, 'el_testimonials_header', 'title', 
                          getVal(module.id, 'el_process_header', 'title', 
                          getVal(module.id, 'el_stats_header', 'title', 
                          getVal(module.id, 'el_team_header', 'title', 
                          getVal(module.id, 'el_pricing_header', 'title', 
                          getVal(module.id, 'el_faq_header', 'title', ''))))));
          content.subtitle = getVal(module.id, 'el_testimonials_header', 'subtitle', 
                             getVal(module.id, 'el_process_header', 'subtitle', 
                             getVal(module.id, 'el_stats_header', 'subtitle', 
                             getVal(module.id, 'el_team_header', 'subtitle', 
                             getVal(module.id, 'el_pricing_header', 'subtitle', 
                             getVal(module.id, 'el_faq_header', 'subtitle', ''))))));
        }

        if (module.type === 'products') {
          content.productIds = getVal(module.id, null, 'select_products', []);
        }
        if (module.type === 'clients') {
          content.customerIds = getVal(module.id, null, 'select_customers', []);
        }

        // Extract ALL settings for this module to preserve styling
        const settings: any = {};
        Object.entries(editorState.settingsValues).forEach(([key, value]) => {
          if (key.startsWith(module.id)) {
            const relativeKey = key.replace(`${module.id}_`, '');
            settings[relativeKey] = value;
          }
        });

        return {
          id: module.id,
          type: module.type as any,
          content,
          settings
        };
      })
    };
  };

  const handleSaveDraft = async (forcedStatus?: 'draft' | 'published' | 'modified') => {
    if (!projectId || isPreviewMode) return;
    setSaveStatus('loading');
    setIsSaving(true);
    
    try {
      const finalSiteName = siteName || formatTimestampName();
      const siteId = currentSiteId;

      // Determine new status based on SIP v5.1 logic
      let newStatus: 'draft' | 'published' | 'modified' = currentStatus;
      
      if (typeof forcedStatus === 'string' && ['draft', 'published', 'modified'].includes(forcedStatus)) {
        newStatus = forcedStatus;
      } else if (currentStatus === 'published') {
        newStatus = 'modified';
      }

      const siteData: Partial<WebBuilderSite> = {
        projectId,
        appId: appId || '11111111-1111-1111-1111-111111111111',
        userId: currentUserId || undefined,
        siteId: siteId,
        siteName: finalSiteName,
        name: finalSiteName,
        contentDraft: editorState,
        status: newStatus
      };

      if (initialPage && 'id' in initialPage) {
        siteData.id = initialPage.id;
      }
      
      const result = await saveWebBuilderSiteDraft(siteData);
      if (result) {
        console.log(`[SIP v5.3] Borrador guardado con éxito (Status: ${newStatus})`);
        setSaveStatus('success');
        setHasUnsavedChanges(false);
        setCurrentStatus(newStatus);

        // Notificar a la Madre (Opcional pero recomendado para UI de la Madre)
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
    
    // Si no tiene nombre real, pedimos uno
    if (isDefaultName(siteName)) {
      setShowPublishModal(true);
      return;
    }

    const finalSiteName = siteName;
    setPublishStatus('loading');
    setIsSaving(true);
    try {
      const renderingContract = generateRenderingContract(finalSiteName);
      const siteId = currentSiteId;

      // Sincronizar el borrador con el nuevo nombre antes de publicar
      const siteData: Partial<WebBuilderSite> = {
        projectId,
        appId: appId || '11111111-1111-1111-1111-111111111111',
        siteId: siteId,
        siteName: finalSiteName,
        name: finalSiteName,
        contentDraft: editorState,
        status: 'published'
      };
      if (initialPage && 'id' in initialPage) siteData.id = initialPage.id;
      await saveWebBuilderSiteDraft(siteData);

      const publishData: Partial<PublishedSite> = {
        projectId,
        appId: appId || '11111111-1111-1111-1111-111111111111',
        siteId: siteId,
        siteName: finalSiteName,
        content: renderingContract,
        isActive: true,
        metadata: {
          publishedAt: new Date().toISOString(),
          editorVersion: '2.0'
        }
      };

      const result = await publishWebBuilderSite(publishData);
      
      if (result) {
        console.log('[SIP v5.3] Sitio publicado con éxito.');
        setPublishStatus('success');
        setCurrentStatus('published');
        setHasUnsavedChanges(false);
        setShowPublishModal(false);

        // Notificar a la Madre (Opcional pero recomendado)
        sendToMother('SOLUTIUM_PUBLISH', {
          site_id: siteId,
          site_name: finalSiteName,
          status: 'published',
          timestamp: new Date().toISOString()
        });

        setTimeout(() => setPublishStatus('idle'), 3000);
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
    <div className={`h-screen w-screen flex overflow-hidden bg-surface font-sans antialiased ${isPreviewMode ? 'p-0' : ''}`}>
      {/* Desktop Sidebar */}
      {!isMobile && !isPreviewMode && (
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
        {activeTab === 'constructor' && (
          <div className="flex flex-1 h-full overflow-hidden relative">
            {/* Mobile Layout */}
            {isMobile ? (
              <div className="flex flex-col flex-1 h-full overflow-hidden pb-[80px]">
                {!isPreviewMode && (
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
                  />
                )}
                
                <div className="flex-1 overflow-hidden relative">
                  {mobileTab === 'constructor' && !isPreviewMode && (
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
                      />
                    </div>
                  )}
                  
                  {mobileTab === 'preview' || isPreviewMode ? (
                    <div className="h-full overflow-hidden">
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
                        isPreviewMode={isPreviewMode}
                        onSettingChange={handleSettingChange}
                      />
                    </div>
                  ) : null}
                </div>
                
                {!isPreviewMode && <MobileBottomNav activeTab={mobileTab} onTabChange={handleMobileTabChange} />}
              </div>
            ) : (
              /* Desktop Layout */
              <>
                {!isPreviewMode && (
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
                  />
                )}
                <div className="flex-1 flex flex-col h-full">
                  {!isPreviewMode && (
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
                    />
                  )}
                  <div className="flex-1 flex overflow-hidden">
                    <div className="flex-1 flex flex-col h-full overflow-hidden">
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
                        isPreviewMode={isPreviewMode}
                        onSettingChange={handleSettingChange}
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
      </AnimatePresence>
    </div>
  );
};
