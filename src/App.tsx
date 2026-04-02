import { 
  Plus, 
  Eye, 
  CheckCircle, 
  AlertCircle, 
  Smartphone, 
  Tablet, 
  Monitor,
  Sparkles
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ModulePicker } from './components/ModulePicker';
import { ImagePicker } from './components/ImagePicker';
import { SidebarPanelWrapper } from './components/SidebarPanelWrapper';
import { LoadingView } from './components/LoadingView';
import { DebugPanel } from './components/DebugPanel';
import { SettingsView } from './components/SettingsView';
import { BuilderView } from './components/BuilderView';
import { DataAuditView } from './components/DataAuditView';
import { MobileNavBar, MobileTab } from './components/MobileNavBar';
import { MobileHeader } from './components/MobileHeader';
import { motion, AnimatePresence } from 'motion/react';
import { PageLayoutProvider } from './context/PageLayoutContext';

import { useBuilderStore } from './store/useBuilderStore';
import { getModuleDefinition } from './modules/registry';
import { getBusinessImage } from './lib/images';
import { useAiGenerator } from './hooks/useAiGenerator';
import { getSupabaseClient } from './services/supabase';
import { migrationLogger } from './lib/migrationLogger';

function App() {
  const [projectData, setProjectData] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<any>(null);
  const logs: any[] = [];
  const simulateConnection = () => {
    setIsReady(true);
  };

  const procesarPayload = async (rawPayload: any, correlationId?: string) => {
    if (!rawPayload) return;

    // Normalización para soportar múltiples estándares de payload (incluyendo el robusto)
    const payload = {
      ...rawPayload,
      projectId: rawPayload.projectId || rawPayload.satellite_id,
      sessionToken: rawPayload.sessionToken || rawPayload.session_token,
      config: rawPayload.config || {
        supabaseUrl: rawPayload.supabase_url,
        supabaseAnonKey: rawPayload.supabase_anon_key || rawPayload.supabase_key || (rawPayload.supabase_url?.includes('supabase.co') ? 'anon-key-placeholder' : null)
      }
    };

    // 1. Logging de Diagnóstico (Enviar al servidor para registro en DB)
    try {
      await fetch('/api/config/receive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Correlation-ID': correlationId || 'no-id'
        },
        body: JSON.stringify({ payload, correlationId })
      });
    } catch (logErr) {
      console.warn("[Diagnostic] No se pudo enviar el log al servidor", logErr);
    }
    
    // 2. Validación y Procesamiento
    try {
      if (!payload.config?.supabaseUrl || !payload.projectId) {
        const errorData = {
          error: "INVALID_PAYLOAD_STRUCTURE",
          details: "El payload recibido no contiene los campos necesarios (supabaseUrl, projectId).",
          payload_summary: JSON.stringify(payload).substring(0, 200),
          correlation_id: correlationId || "no-id"
        };
        console.error("[Solutium] Error de validación:", errorData);
        return;
      }

      // Inicializar Supabase dinámicamente
      const supabase = getSupabaseClient(
        payload.config.supabaseUrl, 
        payload.config.supabaseAnonKey || '', 
        payload.sessionToken
      );

      // Cargar datos usando el cliente dinámico
      const { data, error } = await supabase
        .from('projects')
        .select('*, assets(*)')
        .eq('id', payload.projectId)
        .single();

      if (error) {
        throw new Error(`Error de Supabase: ${error.message} (Código: ${error.code})`);
      }

      setProjectData(data);
      setConfig({
        projectId: data.id,
        project: data,
        projects: [data],
        assets: data.assets,
        profile: payload.profile
      });
      setIsReady(true);

      // 3. Enviar ACK a la App Madre
      const ackMessage = { 
        type: 'SOLUTIUM_SATELLITE_ACK', 
        correlationId: correlationId || 'no-id',
        timestamp: Date.now() 
      };
      if (window.opener) {
        window.opener.postMessage(ackMessage, '*');
      }
      if (window.parent !== window) {
        window.parent.postMessage(ackMessage, '*');
      }
      console.log("[Constructor] ACK enviado a la App Madre");
    } catch (err: any) {
      const errorResponse = {
        error: "PROCESSING_FAILED",
        details: err.message || "Error desconocido durante el procesamiento del payload.",
        payload_summary: JSON.stringify(payload).substring(0, 200),
        correlation_id: correlationId || "no-id"
      };
      console.error('HANDSHAKE', errorResponse);
    } finally {
      setLoading(false);
    }
  };

  // --- NUEVA LÓGICA: HANDSHAKE CON APP MADRE (TRIPLE REDUNDANCIA) ---
  useEffect(() => {
    // 1. Notificar a la App Madre que el satélite está listo
    const readyMessage = { type: 'SOLUTIUM_SATELLITE_READY', timestamp: Date.now() };
    if (window.opener) {
      window.opener.postMessage(readyMessage, '*');
    }
    if (window.parent !== window) {
      window.parent.postMessage(readyMessage, '*');
    }
    console.log("[Constructor] Señal READY enviada a la App Madre");

    // Función de validación y procesamiento (Patrón robusto de referencia)
    const validateAndProcess = (data: any) => {
      if (!data) return false;
      
      // Soporta tanto objeto directo como wrapper SOLUTIUM_CONFIG
      const payload = (data.type === 'SOLUTIUM_CONFIG') ? data.payload : data;
      
      // Campos requeridos según patrón de referencia
      const required = ['satellite_id', 'supabase_url', 'session_token'];
      const isComplete = required.every(field => payload[field]);
      
      // Fallback para el estándar camelCase si el anterior falla
      const isCompleteCamel = !isComplete && payload.projectId && payload.config?.supabaseUrl;

      if (isComplete || isCompleteCamel) {
        console.log("[Constructor] Handshake validado:", payload);
        procesarPayload(payload, data.correlationId);
        return true;
      }
      return false;
    };

    // 1. Prioridad: window.name (Inmune a truncamiento)
    if (window.name) {
      try {
        const nameData = JSON.parse(window.name);
        console.log("[Constructor] Intentando handshake vía window.name");
        if (validateAndProcess(nameData)) return; 
      } catch (e) {
        // Ignorar si no es JSON válido
        console.warn("[Constructor] window.name no contiene JSON válido");
      }
    }

    // 2. Respaldo: postMessage (Escucha activa, sin JSON.parse innecesario)
    const handleMessage = (event: MessageEvent) => {
      try {
        if (!event.data) return;
        
        // NO parseamos event.data, lo tratamos como objeto directamente
        // para evitar SyntaxError por truncamiento o doble parseo.
        console.log("[Constructor] Mensaje recibido vía postMessage:", event.data);
        validateAndProcess(event.data);
      } catch (error) {
        console.error("[Constructor] ERROR CRÍTICO EN LISTENER:", error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    console.log(`🖥️ [App] Estado de conexión: isReady=${isReady}, config=${config ? 'Cargado' : 'Nulo'}`);
  }, [isReady, config]);

  const {
    projects,
    activeProjectId,
    activeAssetId,
    modules,
    isDirty,
    isSaving,
    lastSaved,
    selectedModuleId,
    editingModuleId,
    assetSettings,
    selectedProductIds,
    autoSaveInterval,
    setProjects,
    setActiveProject,
    setActiveAsset,
    setModules,
    setAutoSaveInterval,
    addModule,
    removeModule,
    updateModule,
    reorderModules,
    selectModule,
    editModule,
    updateAssetSettings,
    updateAssetName,
    updateSelectedProducts,
    setBusinessContext,
    businessContext,
    setDirty,
    setSaving,
    setLastSaved
  } = useBuilderStore();

  const [activeTab, setActiveTab] = useState('builder');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [showPicker, setShowPicker] = useState(false);
  const { isGenerating, handleGenerateAi } = useAiGenerator(config);
  const [publishStatus, setPublishStatus] = useState<'idle' | 'publishing' | 'success' | 'error'>('idle');
  const [hasInitializedProducts, setHasInitializedProducts] = useState(false);
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [lastSaveStatus, setLastSaveStatus] = useState<'borrador' | 'guardado'>('borrador');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileTab, setMobileTab] = useState<MobileTab>('preview');
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [imagePickerCallback, setImagePickerCallback] = useState<((url: string) => void) | null>(null);
  const [moduleToDelete, setModuleToDelete] = useState<string | null>(null);
  // Initialize panels as pinned by default, resize handler will collapse on mobile
  const [isSidebarPinned, setIsSidebarPinned] = useState(true);

  const activeProject = projects.find(p => p.id === (activeProjectId || config?.projectId)) || projects[0];
  const activeAsset = activeProject?.assets?.find((a: any) => a.id === activeAssetId) || activeProject?.assets?.[0];

  // Handle window resize to auto-collapse panels on mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarPinned(false);
      }
    };

    // Set initial state based on window size
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setIsSidebarPinned(false);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load initial data if available
  useEffect(() => {
    if (!isReady || !config) return;

    if (projects.length === 0) {
      // 1. Try to get projects from config.projects or initialData
      let initialProjects = config.projects || config.project || [];
      
      // Ensure initialProjects is an array if it's just a single project object
      if (initialProjects && !Array.isArray(initialProjects)) {
        initialProjects = [initialProjects];
      }
      
      // 2. If we have projects, ensure they have the correct structure
      if (initialProjects.length > 0) {
        initialProjects = initialProjects.map((p: any) => ({
          ...p,
          name: p.name || config.project?.name || 'Proyecto Local',
          assets: p.assets?.map((a: any) => ({
            ...a,
            // Prioritize modules from data directly as requested
            modules: a.modules || (Array.isArray(a.data) ? a.data : a.data?.modules) || [],
            settings: a.settings || a.data?.settings || { domain: '', seoTitle: '', seoDescription: '', pageLayout: 'seamless' },
            selectedProductIds: a.selectedProductIds || a.data?.selectedProductIds || []
          })) || []
        }));
      } else {
        // 3. Fallback to a default project if none found
        const defaultProjectId = config.projectId || 'dev-project-1';
        const defaultProjectName = config.project?.name || 'Proyecto Local';
        const defaultAssetId = 'asset-' + Math.random().toString(36).substr(2, 5);
        
        // Create a default initial structure (Header + Hero)
        const createModule = (type: string, customData: any = {}) => {
          const def = getModuleDefinition(type);
          return {
            id: Math.random().toString(36).substr(2, 9),
            type,
            data: { ...(def?.defaultData || {}), ...customData }
          };
        };

        const initialModules = [
          createModule('header', { logoText: defaultProjectName, scrollMode: 'static', theme: 'dark' }),
          createModule('hero', { 
            title: `Bienvenido a *${defaultProjectName}*`, 
            titleStyle: { highlightType: 'gradient', align: 'center' },
            subtitle: 'Empieza a construir tu página agregando módulos desde el constructor a la izquierda.',
            subtitleStyle: { align: 'center' },
            layoutType: 'layout-1',
            primaryButton: null,
            secondaryButton: null,
            theme: 'light',
            background: {
              image: getBusinessImage('')
            }
          })
        ];

        initialProjects = [{
          id: defaultProjectId,
          name: defaultProjectName,
          assets: [{
            id: defaultAssetId,
            name: 'Página Principal',
            modules: initialModules,
            settings: { domain: '', seoTitle: 'Página Principal | ' + defaultProjectName, seoDescription: 'Bienvenido al constructor web' },
            selectedProductIds: []
          }]
        }];
      }
 
      // 4. Handle top-level assets array if present in config
      const topLevelAssets = config.assets || [];
      if (Array.isArray(topLevelAssets) && topLevelAssets.length > 0) {
        topLevelAssets.forEach((asset: any) => {
          const pId = asset.projectId || config.projectId || initialProjects[0].id;
          initialProjects = initialProjects.map((p: any) => {
            if (p.id === pId) {
              const assetExists = p.assets.some((a: any) => a.id === asset.id);
              if (!assetExists) {
                return {
                  ...p,
                  assets: [...p.assets, {
                    ...asset,
                    modules: asset.modules || (Array.isArray(asset.data) ? asset.data : asset.data?.modules) || [],
                    settings: asset.settings || asset.data?.settings || { domain: '', seoTitle: '', seoDescription: '', pageLayout: 'seamless' },
                    selectedProductIds: asset.selectedProductIds || asset.data?.selectedProductIds || []
                  }]
                };
              }
            }
            return p;
          });
        });
      }
 
      setProjects(initialProjects);
      
      // 6. Auto-select project and asset if none active
      const targetProjectId = config.projectId || initialProjects[0]?.id;
      const targetProject = initialProjects.find((p: any) => p.id === targetProjectId) || initialProjects[0];
      
      if (targetProject) {
        if (!activeProjectId) setActiveProject(targetProject.id);
        
        const targetAssetId = targetProject.assets?.[0]?.id;
        const targetAsset = targetProject.assets?.find((a: any) => a.id === targetAssetId) || targetProject.assets?.[0];
        
        if (targetAsset && !activeAssetId) {
          setActiveAsset(targetAsset.id);
          if (targetAsset.modules?.length > 0 && modules.length === 0) {
            setModules(targetAsset.modules);
          }
        }
      }
    }
    
    const products = config?.products;
    if (products && !hasInitializedProducts) {
      updateSelectedProducts(products.map((p: any) => p.id.toString()));
      setHasInitializedProducts(true);
    }
    
    // Initialize asset settings from config if they exist
    if (activeAsset?.settings && !assetSettings.domain && !assetSettings.seoTitle) {
      updateAssetSettings({
        domain: activeAsset.settings.domain || '',
        seoTitle: activeAsset.settings.seoTitle || '',
        seoDescription: activeAsset.settings.seoDescription || ''
      });
    }
  }, [isReady, config, hasInitializedProducts, activeAsset]);

  const handleSave = useCallback(async (status: 'borrador' | 'guardado' = 'borrador') => {
    if (!isReady || isSaving || !activeAssetId) return;
    
    setSaving(true);
    setLastSaveStatus(status);

    const assetDataToSave = {
      modules: modules,
      settings: assetSettings,
      selectedProductIds: selectedProductIds,
      version: "1.0.0"
    };

    const targetProjectId = activeProjectId || config?.projectId || (config as any).project_id;
    const supabase = getSupabaseClient();
    
    const { error } = await supabase
      .from('assets')
      .upsert({
        id: activeAssetId,
        project_id: targetProjectId,
        origin_app: 'constructor-web',
        name: activeAsset?.name || config?.project?.name || 'Landing Page',
        type: 'web_page',
        data: assetDataToSave,
        author: config?.profile?.fullName || 'Usuario',
        status: 'draft',
        tags: assetSettings.tags || [],
        updated_at: new Date().toISOString()
      });

    if (error) {
      migrationLogger.error('SAVE', 'Error al guardar en Supabase', error);
    } else {
      migrationLogger.success('SAVE', 'Datos guardados en Supabase');
      setShowSaveMessage(true);
      setTimeout(() => setShowSaveMessage(false), 3000);
    }

    setDirty(false);
    setLastSaved(new Date());
    setSaving(false);
  }, [modules, config, isSaving, setSaving, setDirty, setLastSaved, activeAssetId, activeAsset, assetSettings, selectedProductIds, activeProjectId]);

  // Auto-save logic
  useEffect(() => {
    if (!isDirty || isSaving) return;

    const timer = setTimeout(() => {
      handleSave('borrador');
    }, autoSaveInterval);

    return () => clearTimeout(timer);
  }, [isDirty, isSaving, modules, selectedProductIds, assetSettings, handleSave, autoSaveInterval]);

  const handleAddModule = (type: string) => {
    if (type === 'ai-generator') {
      onGenerateAi();
      setShowPicker(false);
      return;
    }
    addModule(type);
    setShowPicker(false);
    setIsMobileMenuOpen(false);
    
    if (isMobile) {
      setMobileTab('editor');
    }

    // Scroll to the new module (which is added at the end)
    setTimeout(() => {
      const allModules = document.querySelectorAll('[id^="module-"]');
      if (allModules.length > 0) {
        const lastModule = allModules[allModules.length - 1];
        lastModule.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleRemoveModule = (id: string) => {
    setModuleToDelete(id);
  };

  const confirmDelete = () => {
    if (moduleToDelete) {
      removeModule(moduleToDelete);
      setModuleToDelete(null);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    if (imagePickerCallback) {
      imagePickerCallback(imageUrl);
      setIsImagePickerOpen(false);
      setImagePickerCallback(null);
    }
  };

  const onGenerateAi = async (
    customName?: string, 
    targetProjectId?: string, 
    targetAssetId?: string, 
    currentProjectsList?: any[], 
    assetName?: string, 
    context?: {
      name: string;
      sector: string;
      description: string;
      objective: string;
      visualStyle: string;
    }
  ) => {
    const finalContext = context || businessContext;
    const businessName = finalContext?.name || customName || activeProject?.name || config?.project?.name || 'Proyecto Local';
    handleGenerateAi(businessName, targetProjectId, targetAssetId, currentProjectsList, assetName, finalContext || undefined);
  };

  const handlePublish = async () => {
    if (!isReady || !activeAssetId) return;
    setPublishStatus('publishing');
    
    const assetDataToSave = {
      modules: modules,
      settings: assetSettings,
      selectedProductIds: selectedProductIds,
      version: 'published-' + Date.now()
    };

    const targetProjectId = activeProjectId || config?.projectId || (config as any).project_id;
    const supabase = getSupabaseClient();
    
    const { error } = await supabase
      .from('assets')
      .upsert({
        id: activeAssetId,
        project_id: targetProjectId,
        origin_app: 'constructor-web',
        name: activeAsset?.name || config?.project?.name || 'Landing Page',
        type: 'web_page',
        data: assetDataToSave,
        author: config?.profile?.fullName || 'Usuario',
        status: 'published',
        tags: ['Landing Page', 'Publicado'],
        updated_at: new Date().toISOString()
      });

    if (error) {
      migrationLogger.error('PUBLISH', 'Error al publicar en Supabase', error);
    } else {
      migrationLogger.success('PUBLISH', 'Datos publicados en Supabase');
    }

    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Simulate validation: check if domain is configured (mock check)
    const hasDomain = config?.projectId !== 'dev-project-1'; 
    
    if (hasDomain) {
      setPublishStatus('success');
    } else {
      setPublishStatus('error');
    }
    
    setTimeout(() => setPublishStatus('idle'), 5000);
  };

  const handleCreateNewAssetClick = () => {
    if (isDirty) {
      if (!window.confirm('Tienes cambios sin guardar en el proyecto actual. ¿Estás seguro de que quieres crear una nueva página y perder los cambios no guardados?')) {
        return;
      }
    }
    
    // Create a new blank asset directly
    const currentProjectId = activeProjectId || config?.projectId || config?.project_id || projects[0]?.id || 'dev-project-1';
    const finalProjectName = config?.project?.name || 'Proyecto Local';
    const newAssetId = 'asset-' + Math.random().toString(36).substr(2, 5);
    const finalAssetName = 'Nueva Página';

    const createModule = (type: string, customData: any = {}) => {
      const def = getModuleDefinition(type);
      return {
        id: Math.random().toString(36).substr(2, 9),
        type,
        data: { ...(def?.defaultData || {}), ...customData }
      };
    };

    const initialModules = [
      createModule('header', { logoText: finalProjectName, scrollMode: 'static', theme: 'dark' }),
      createModule('hero', { 
        title: 'Nueva Página', 
        titleStyle: { highlightType: 'gradient', align: 'center' },
        subtitle: 'Empieza a construir tu página agregando módulos desde el constructor a la izquierda.',
        subtitleStyle: { align: 'center' },
        layoutType: 'layout-1',
        primaryButton: null,
        secondaryButton: null,
        theme: 'light',
        background: {
          image: getBusinessImage('')
        }
      })
    ];

    const newAsset = {
      id: newAssetId,
      name: finalAssetName,
      modules: initialModules,
      settings: {
        domain: '',
        seoTitle: finalAssetName + ' | ' + finalProjectName,
        seoDescription: `Bienvenido a ${finalAssetName}`
      }
    };

    const updatedProjects = projects.map(p => {
      if (p.id === currentProjectId) {
        return {
          ...p,
          assets: [...(p.assets || []), newAsset]
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    setActiveProject(currentProjectId);
    setActiveAsset(newAssetId);
    setModules(initialModules);
    setDirty(false);
  };

  const handleReorderModules = (newModules: any[]) => {
    reorderModules(newModules);
  };

  const handleSelectProject = (projectId: string) => {
    setActiveProject(projectId);
    const project = projects.find(p => p.id === projectId);
    if (project && project.assets?.length > 0) {
      const firstAsset = project.assets[0];
      setActiveAsset(firstAsset.id);
    }
  };

  const handleSelectAsset = (assetId: string, projectId: string) => {
    if (isDirty) {
      if (!window.confirm('Tienes cambios sin guardar en el activo actual. ¿Estás seguro de que quieres cambiar de página y perder los cambios no guardados?')) {
        return;
      }
    }
    
    if (projectId !== activeProjectId) {
      setActiveProject(projectId);
    }
    
    setActiveAsset(assetId);
  };

  const handleSelectModule = (id: string | null, source: 'canvas' | 'structure' = 'canvas') => {
    const isAlreadySelected = id === selectedModuleId;
    
    // If clicking from structure and it's already selected, we still want to trigger the panel switch
    // so we don't return early here if we want the "collapse structure" behavior to work
    // However, if we want to prevent deselection, we just ensure newSelectedId is the same
    const newSelectedId = isAlreadySelected ? (source === 'structure' ? id : null) : id;
    
    selectModule(newSelectedId);
    
    // Open property panel logic:
    // 1. If source is 'structure', ALWAYS open properties (even on mobile)
    // 2. If source is 'canvas', open properties ONLY on desktop (mobile uses inline editing)
    if (newSelectedId) {
      if (source === 'structure' || window.innerWidth > 768) {
        editModule(newSelectedId);
        if (isMobile) {
          setMobileTab('editor');
        }
      } else {
        editModule(null);
      }
    } else {
      editModule(null);
    }
    
    if (newSelectedId) {
      setTimeout(() => {
        const element = document.getElementById(`module-${newSelectedId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  const handleEditModule = (id: string | null) => {
    editModule(id);
    if (id) {
      selectModule(id);
      setTimeout(() => {
        const element = document.getElementById(`module-${id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  if (!isReady) {
    return <LoadingView projectName={config?.project?.name} onSimulateConnection={simulateConnection} />;
  }

  return (
    <div className={`h-screen flex font-sans relative ${isPreviewMode ? 'overflow-x-hidden' : ''} ${
      assetSettings.pageLayout === 'seamless' ? 'bg-surface' : 'bg-background'
    }`}>
      {/* AI Generation Loading Overlay */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-background/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="relative w-24 h-24 mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-4 border-primary/20 rounded-full"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-4 border-4 border-accent/40 rounded-full border-t-transparent"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary animate-pulse" />
              </div>
            </div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-black text-text mb-2"
            >
              Diseñando tu sitio con IA
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-text/60 max-w-md"
            >
              Estamos creando la estructura, redactando los textos y seleccionando las mejores imágenes para tu negocio. Esto tomará solo unos segundos...
            </motion.p>
            
            <div className="mt-8 flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  className="w-2 h-2 bg-primary rounded-full"
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Debug Panel */}
      <DebugPanel logs={logs} projectId={config?.projectId} isReady={isReady} />

      {/* Exit Preview Button & Device Switcher */}
      {isPreviewMode && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-4">
          {/* Device Switcher */}
          <div className="flex items-center gap-1 p-1.5 bg-text/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10">
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`p-2.5 rounded-xl transition-all ${
                previewDevice === 'mobile' 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}
              title="Vista Móvil"
            >
              <Smartphone className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPreviewDevice('tablet')}
              className={`p-2.5 rounded-xl transition-all ${
                previewDevice === 'tablet' 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}
              title="Vista Tablet"
            >
              <Tablet className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`p-2.5 rounded-xl transition-all ${
                previewDevice === 'desktop' 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}
              title="Vista Escritorio"
            >
              <Monitor className="w-5 h-5" />
            </button>
          </div>

          <button 
            onClick={() => setIsPreviewMode(false)}
            className="flex items-center gap-2 px-6 py-3 bg-[#FF0080] text-white font-bold rounded-2xl shadow-2xl hover:opacity-90 transition-all group"
          >
            <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Salir de Vista Previa
          </button>
        </div>
      )}

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && !isPreviewMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-text/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className={`
        fixed inset-y-0 left-0 z-[90] lg:relative lg:z-[90] transition-transform duration-300 transform
        ${isPreviewMode ? '-translate-x-full lg:hidden' : ''}
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar 
          config={config} 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setIsMobileMenuOpen(false);
          }} 
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onAddModule={handleAddModule}
          onGoHome={() => {}}
          onGenerateAi={() => onGenerateAi()}
          projects={projects}
          activeProjectId={activeProjectId || config?.projectId || config?.project_id || (projects[0]?.id)}
          onSelectProject={handleSelectProject}
          activeAssetId={activeAssetId}
          onSelectAsset={handleSelectAsset}
          onCreateAsset={handleCreateNewAssetClick}
          showSaveMessage={showSaveMessage}
          lastSaveStatus={lastSaveStatus}
          assetSettings={assetSettings}
          onUpdateSettings={updateAssetSettings}
        />
      </div>

      {/* Left Panels Container (Structure & Properties) */}
      {!isPreviewMode && activeTab === 'builder' && !isMobile && (
        <SidebarPanelWrapper
          modules={modules}
          onReorder={handleReorderModules}
          onRemove={handleRemoveModule}
          onSelect={handleSelectModule}
          onEdit={handleEditModule}
          selectedModuleId={selectedModuleId}
          editingModuleId={editingModuleId}
          isSidebarCollapsed={isSidebarCollapsed}
          isPinned={isSidebarPinned}
          onTogglePin={() => setIsSidebarPinned(!isSidebarPinned)}
          updateModule={updateModule}
          onOpenImagePicker={(callback) => {
            setImagePickerCallback(() => callback);
            setIsImagePickerOpen(true);
          }}
          config={config}
        />
      )}

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {isMobile && !isPreviewMode && activeTab === 'builder' && (
          <MobileHeader
            projectName={activeProject?.name || config?.project?.name || (config as any)?.projectsData?.name || (config as any)?.projectData?.name || 'Proyecto Local'}
            assetName={activeAsset?.name || 'Página'}
            onOpenSettings={() => setActiveTab('settings')}
            onOpenData={() => setActiveTab('data-audit')}
            onOpenAi={() => onGenerateAi()}
            onOpenAssetSelector={() => {}}
          />
        )}
        {/* Content Area */}
        <div className={`flex-1 overflow-y-auto custom-scrollbar transition-all duration-500 ${
          isPreviewMode || assetSettings.pageLayout === 'seamless' || isMobile
            ? (isMobile && !isPreviewMode && activeTab === 'builder' ? 'pt-16 p-0 bg-surface' : 'p-0 bg-surface')
            : 'p-4 md:p-8 lg:p-10 bg-background'
        }`}>
          <div className={`transition-all duration-500 mx-auto ${
            (isPreviewMode && previewDevice === 'mobile') || (isMobile && mobileTab === 'preview') ? 'max-w-[375px] my-12 border-[12px] border-text/90 rounded-[3rem] shadow-2xl h-[760px] bg-white overflow-y-auto custom-scrollbar relative' :
            isPreviewMode && previewDevice === 'tablet' ? 'max-w-[768px] my-12 border-[12px] border-text/90 rounded-[2.5rem] shadow-2xl h-[1024px] bg-white overflow-y-auto custom-scrollbar relative' :
            'w-full'
          }`}>
            {isPreviewMode && previewDevice !== 'desktop' && (
              <div className="sticky top-0 left-0 right-0 h-6 bg-text/90 z-[50] flex items-center justify-center">
                <div className="w-20 h-1.5 bg-white/20 rounded-full" />
              </div>
            )}
            <AnimatePresence>
              {publishStatus === 'success' && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-4 text-emerald-800"
              >
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold">¡Sitio publicado con éxito!</h4>
                  <p className="text-sm opacity-80">Tu sitio ya está disponible en tu dominio personalizado.</p>
                </div>
              </motion.div>
            )}

            {publishStatus === 'error' && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-8 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-4 text-rose-800"
              >
                <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-100">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold">Error al publicar</h4>
                  <p className="text-sm opacity-80">No se detectó un dominio configurado. Por favor, revisa los ajustes del proyecto.</p>
                </div>
              </motion.div>
            )}
            </AnimatePresence>

            {activeTab === 'builder' && (
              <div className="flex flex-col h-full">
                {isMobile ? (
                  <div className="flex-1 flex flex-col min-h-0">
                    {mobileTab === 'constructor' && (
                      <div className="flex-1 p-6 bg-background overflow-y-auto pb-32">
                        <div className="mb-8">
                          <h3 className="text-2xl font-black text-text tracking-tight">Biblioteca</h3>
                          <p className="text-sm text-text/60">Añade nuevos módulos a tu página.</p>
                        </div>
                        <ModulePicker onAdd={handleAddModule} />
                      </div>
                    )}
                    
                    {mobileTab === 'editor' && (
                      <div className="flex-1 p-4 bg-background overflow-y-auto pb-32">
                        <SidebarPanelWrapper
                          modules={modules}
                          onReorder={handleReorderModules}
                          onRemove={handleRemoveModule}
                          onSelect={handleSelectModule}
                          onEdit={handleEditModule}
                          selectedModuleId={selectedModuleId}
                          editingModuleId={editingModuleId}
                          isSidebarCollapsed={false}
                          isPinned={true}
                          onTogglePin={() => {}}
                          updateModule={updateModule}
                          onOpenImagePicker={(callback) => {
                            setImagePickerCallback(() => callback);
                            setIsImagePickerOpen(true);
                          }}
                          config={config}
                        />
                      </div>
                    )}

                    {mobileTab === 'preview' && (
                      <PageLayoutProvider 
                        pageLayout={assetSettings.pageLayout || 'seamless'}
                        previewDevice="mobile"
                      >
                        <BuilderView
                          isPreviewMode={true}
                          setIsPreviewMode={setIsPreviewMode}
                          setIsMobileMenuOpen={setIsMobileMenuOpen}
                          onSave={() => handleSave('guardado')}
                          isSaving={isSaving}
                          isDirty={isDirty}
                          onPublish={handlePublish}
                          publishStatus={publishStatus}
                          modules={modules}
                          setShowPicker={setShowPicker}
                          onRemoveModule={removeModule}
                          onUpdateModule={updateModule}
                          onSelectModule={handleSelectModule}
                          onEditModule={handleEditModule}
                          selectedModuleId={selectedModuleId}
                          setImagePickerCallback={setImagePickerCallback}
                          setIsImagePickerOpen={setIsImagePickerOpen}
                          config={config}
                          selectedProductIds={selectedProductIds}
                          pageLayout={assetSettings.pageLayout || 'seamless'}
                        />
                      </PageLayoutProvider>
                    )}
                  </div>
                ) : (
                  <PageLayoutProvider 
                    pageLayout={assetSettings.pageLayout || 'seamless'}
                    previewDevice={isPreviewMode ? previewDevice : 'desktop'}
                  >
                    <BuilderView
                      isPreviewMode={isPreviewMode}
                      setIsPreviewMode={setIsPreviewMode}
                      setIsMobileMenuOpen={setIsMobileMenuOpen}
                      onSave={() => handleSave('guardado')}
                      isSaving={isSaving}
                      isDirty={isDirty}
                      onPublish={handlePublish}
                      publishStatus={publishStatus}
                      modules={modules}
                      setShowPicker={setShowPicker}
                      onRemoveModule={removeModule}
                      onUpdateModule={updateModule}
                      onSelectModule={handleSelectModule}
                      onEditModule={handleEditModule}
                      selectedModuleId={selectedModuleId}
                      setImagePickerCallback={setImagePickerCallback}
                      setIsImagePickerOpen={setIsImagePickerOpen}
                      config={config}
                      selectedProductIds={selectedProductIds}
                      pageLayout={assetSettings.pageLayout || 'seamless'}
                    />
                  </PageLayoutProvider>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <SettingsView
                activeProject={activeProject}
                activeAsset={activeAsset}
                config={config}
                assetSettings={assetSettings}
                selectedProductIds={selectedProductIds}
                updateAssetSettings={updateAssetSettings}
                updateAssetName={updateAssetName}
                updateSelectedProducts={updateSelectedProducts}
                setActiveTab={setActiveTab}
                onSave={() => handleSave('guardado')}
                isSaving={isSaving}
                isDirty={isDirty}
                autoSaveInterval={autoSaveInterval}
                setAutoSaveInterval={setAutoSaveInterval}
                onBack={() => setActiveTab('builder')}
              />
            )}

            {activeTab === 'data-audit' && (
              <DataAuditView 
                config={config} 
                logs={logs}
                isReady={isReady}
                onBack={() => setActiveTab('builder')}
              />
            )}
          </div>
        </div>
      </main>

      {isMobile && activeTab === 'builder' && (
        <MobileNavBar activeTab={mobileTab} onTabChange={setMobileTab} />
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {moduleToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModuleToDelete(null)}
              className="absolute inset-0 bg-text/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-surface rounded-[2rem] shadow-2xl overflow-hidden p-8 text-center"
            >
              <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-6">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-text mb-2">¿Eliminar módulo?</h3>
              <p className="text-text/60 text-sm mb-8 leading-relaxed">
                Esta acción no se puede deshacer. Todos los datos de este módulo se perderán permanentemente.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={confirmDelete}
                  className="w-full py-4 bg-rose-500 text-white font-bold rounded-2xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-100"
                >
                  Sí, eliminar módulo
                </button>
                <button 
                  onClick={() => setModuleToDelete(null)}
                  className="w-full py-4 bg-background text-text/70 font-bold rounded-2xl hover:bg-text/5 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Module Picker Modal */}
      <AnimatePresence>
        {showPicker && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPicker(false)}
              className="absolute inset-0 bg-text/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl bg-background rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 bg-surface border-b border-text/10 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-text">Añadir Módulo</h3>
                  <p className="text-sm text-text/60">Selecciona el tipo de sección que quieres añadir a tu página.</p>
                </div>
                <button 
                  onClick={() => setShowPicker(false)}
                  className="p-2 hover:bg-background rounded-full transition-colors"
                >
                  <Plus className="w-6 h-6 rotate-45 text-text/40" />
                </button>
              </div>
              <div className="p-8 max-h-[70vh] overflow-y-auto">
                <ModulePicker onAdd={handleAddModule} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Picker Modal */}
      <ImagePicker 
        isOpen={isImagePickerOpen}
        onClose={() => setIsImagePickerOpen(false)}
        onSelect={handleImageSelect}
      />
    </div>
  );
}

export default App;
