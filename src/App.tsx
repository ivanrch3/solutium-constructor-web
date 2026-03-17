import { useSolutiumContext } from './context/SatelliteContext';
import { 
  Loader2, 
  Save, 
  Plus, 
  Sparkles, 
  Globe, 
  Eye, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  Layout,
  Code,
  Rocket,
  Package,
  Settings,
  Menu,
  Smartphone,
  Tablet,
  Monitor
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ModulePicker } from './components/ModulePicker';
import { ModuleRenderer } from './components/ModuleRenderer';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ImagePicker } from './components/ImagePicker';
import { SidebarPanelWrapper } from './components/SidebarPanelWrapper';
import { LoadingView } from './components/LoadingView';
import { SettingsView } from './components/SettingsView';
import { BuilderView } from './components/BuilderView';
import { DataAuditView } from './components/DataAuditView';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";
import { PageLayoutProvider } from './context/PageLayoutContext';

import { useBuilderStore } from './store/useBuilderStore';
import { getModuleDefinition } from './modules/registry';

// Curated Pexels images by category to ensure high quality and relevance without API key
const PEXELS_IMAGES = {
  food: [
    'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  ],
  health: [
    'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/305566/pexels-photo-305566.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/2280568/pexels-photo-2280568.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/7089623/pexels-photo-7089623.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  ],
  tech: [
    'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  ],
  finance: [
    'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/5668473/pexels-photo-5668473.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/4476376/pexels-photo-4476376.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/6863202/pexels-photo-6863202.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  ],
  sports: [
    'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/2247179/pexels-photo-2247179.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  ],
  architecture: [
    'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/2121121/pexels-photo-2121121.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  ],
  fashion: [
    'https://images.pexels.com/photos/994517/pexels-photo-994517.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/135620/pexels-photo-135620.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  ],
  education: [
    'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/159844/cellular-education-classroom-159844.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/256417/pexels-photo-256417.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  ],
  travel: [
    'https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/2161449/pexels-photo-2161449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  ],
  general: [
    'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  ]
};

// Helper to get business image
const getBusinessImage = (type: string) => {
  const t = type.toLowerCase();
  let category: keyof typeof PEXELS_IMAGES = 'general';

  if (t.includes('comida') || t.includes('restaurante') || t.includes('chef') || t.includes('gastronomía')) {
    category = 'food';
  } else if (t.includes('salud') || t.includes('clínica') || t.includes('doctor') || t.includes('dental') || t.includes('medicina')) {
    category = 'health';
  } else if (t.includes('tecnología') || t.includes('software') || t.includes('app') || t.includes('digital') || t.includes('web')) {
    category = 'tech';
  } else if (t.includes('finanzas') || t.includes('abogado') || t.includes('legal') || t.includes('banco') || t.includes('contabilidad')) {
    category = 'finance';
  } else if (t.includes('deporte') || t.includes('gym') || t.includes('fitness') || t.includes('entrenador')) {
    category = 'sports';
  } else if (t.includes('arquitectura') || t.includes('construcción') || t.includes('diseño') || t.includes('inmobiliaria')) {
    category = 'architecture';
  } else if (t.includes('moda') || t.includes('ropa') || t.includes('tienda')) {
    category = 'fashion';
  } else if (t.includes('educación') || t.includes('escuela') || t.includes('curso')) {
    category = 'education';
  } else if (t.includes('viaje') || t.includes('turismo') || t.includes('hotel')) {
    category = 'travel';
  }

  // Pick a random image from the selected category
  const images = PEXELS_IMAGES[category];
  return images[Math.floor(Math.random() * images.length)];
};

function App() {
  const { payload: config, isReady, saveData, simulateConnection } = useSolutiumContext();

  const {
    projects,
    active_project_id,
    active_asset_id,
    modules,
    is_dirty,
    is_saving,
    last_saved,
    selected_module_id,
    editing_module_id,
    asset_settings,
    selected_product_ids,
    auto_save_interval,
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
    update_selected_products,
    setDirty,
    setSaving,
    setLastSaved
  } = useBuilderStore();

  const [skipDirty, setSkipDirty] = useState(false);
  const [activeTab, setActiveTab] = useState('builder');
  const [activeSettingsTab, setActiveSettingsTab] = useState<'general' | 'products' | 'domain'>('general');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [showPicker, setShowPicker] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [publishStatus, setPublishStatus] = useState<'idle' | 'publishing' | 'success' | 'error'>('idle');
  const [hasInitializedProducts, setHasInitializedProducts] = useState(false);
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [lastSaveStatus, setLastSaveStatus] = useState<'borrador' | 'guardado'>('borrador');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [is_mobile_menu_open, set_is_mobile_menu_open] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [welcomeMode, setWelcomeMode] = useState<'project' | 'asset'>('asset');
  const [is_image_picker_open, set_is_image_picker_open] = useState(false);
  const [imagePickerCallback, setImagePickerCallback] = useState<((url: string) => void) | null>(null);
  const [moduleToDelete, setModuleToDelete] = useState<string | null>(null);
  // Initialize panels as pinned by default, resize handler will collapse on mobile
  const [isSidebarPinned, setIsSidebarPinned] = useState(true);
  const [isLayersHovered, setIsLayersHovered] = useState(false);

  const active_project = projects.find(p => p.id === (active_project_id || config?.project_id)) || projects[0];
  const active_asset = active_project?.assets?.find((a: any) => a.id === active_asset_id) || active_project?.assets?.[0];

  // Handle window resize to auto-collapse panels on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
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
    if (!config) return;

    if (projects.length === 0) {
      // 1. Try to get projects from config.projects_data
      let initialProjects = config.projects_data || [];
      
      // 2. If we have projects, ensure they have the correct structure
      if (initialProjects.length > 0) {
        initialProjects = initialProjects.map((p: any) => ({
          ...p,
          name: p.name || config.project_data?.name || 'Proyecto Local',
          assets: p.assets?.map((a: any) => ({
            ...a,
            modules: a.modules || a.data?.modules || [],
            settings: a.settings || a.data?.settings || { domain: '', seo_title: '', seo_description: '', page_layout: 'seamless' },
            selected_product_ids: a.selected_product_ids || a.data?.selected_product_ids || []
          })) || []
        }));
      } else {
        // 3. Fallback to a default project if none found
        initialProjects = [{
          id: config.project_id || 'dev-project-1',
          name: config.project_data?.name || 'Proyecto Local',
          assets: []
        }];
      }

      // 4. Handle top-level assets array if present in config
      const topLevelAssets = (config as any).assets || [];
      if (Array.isArray(topLevelAssets) && topLevelAssets.length > 0) {
        topLevelAssets.forEach((asset: any) => {
          const pId = asset.project_id || config.project_id || initialProjects[0].id;
          initialProjects = initialProjects.map((p: any) => {
            if (p.id === pId) {
              const assetExists = p.assets.some((a: any) => a.id === asset.id);
              if (!assetExists) {
                return {
                  ...p,
                  assets: [...p.assets, {
                    ...asset,
                    modules: asset.modules || asset.data?.modules || [],
                    settings: asset.settings || asset.data?.settings || { domain: '', seo_title: '', seo_description: '', page_layout: 'seamless' },
                    selected_product_ids: asset.selected_product_ids || asset.data?.selected_product_ids || []
                  }]
                };
              }
            }
            return p;
          });
        });
      }

      // 5. Handle current_asset if provided by mother app
      if (config.current_asset) {
        const asset = config.current_asset;
        const pId = asset.project_id || config.project_id || initialProjects[0].id;
        
        let projectFound = false;
        initialProjects = initialProjects.map((p: any) => {
          if (p.id === pId) {
            projectFound = true;
            const assetExists = p.assets.some((a: any) => a.id === asset.id);
            if (!assetExists) {
              return {
                ...p,
                assets: [...p.assets, {
                  ...asset,
                  modules: asset.modules || asset.data?.modules || [],
                  settings: asset.settings || asset.data?.settings || { domain: '', seo_title: '', seo_description: '', page_layout: 'seamless' },
                  selected_product_ids: asset.selected_product_ids || asset.data?.selected_product_ids || []
                }]
              };
            }
          }
          return p;
        });

        // If the asset belongs to a project not in the list, add it
        if (!projectFound) {
          initialProjects.push({
            id: pId,
            name: config.project_data?.name || 'Proyecto Externo',
            assets: [{
              ...asset,
              modules: asset.modules || asset.data?.modules || [],
              settings: asset.settings || asset.data?.settings || { domain: '', seo_title: '', seo_description: '', page_layout: 'seamless' },
              selected_product_ids: asset.selected_product_ids || asset.data?.selected_product_ids || []
            }]
          });
        }
      }

      setProjects(initialProjects);
      
      // 6. Auto-select first project and asset if none active
      const firstProject = initialProjects[0];
      if (firstProject) {
        if (!active_project_id) setActiveProject(firstProject.id);
        
        const firstAsset = firstProject.assets?.[0];
        if (firstAsset && !active_asset_id) {
          setActiveAsset(firstAsset.id);
          if (firstAsset.modules?.length > 0 && modules.length === 0) {
            setModules(firstAsset.modules);
          }
        }
      }
    }
    
    if (config?.products_data && !hasInitializedProducts) {
      update_selected_products(config.products_data.map((p: any) => p.id.toString()));
      setHasInitializedProducts(true);
    }
    
    // Initialize asset settings from config if they exist
    if (active_asset?.settings && !asset_settings.domain && !asset_settings.seo_title) {
      updateAssetSettings({
        domain: active_asset.settings.domain || '',
        seo_title: active_asset.settings.seo_title || '',
        seo_description: active_asset.settings.seo_description || ''
      });
    }
  }, [config, hasInitializedProducts, active_asset]);

  const handleSave = useCallback(async (status: 'borrador' | 'guardado' = 'borrador') => {
    if (is_saving) return;
    
    setSaving(true);
    setLastSaveStatus(status);
    
    // 1. Recopila los datos de tu diseño (módulos, textos, etc.)
    const siteData = {
      modules: modules, // Tu estado con los módulos actuales
      lastUpdated: new Date().toISOString(),
      version: "1.0.0"
    };
  
    console.log(`Enviando datos (${status}) a la App Madre...`, siteData);
    
    setShowSaveMessage(true);
    setTimeout(() => setShowSaveMessage(false), 3000);
  
    // 2. Enviar el mensaje a la App Madre (Solutium)
    const TARGET_ORIGIN = '*'; // Usar wildcard para mayor flexibilidad
    
    const message = {
      type: 'SOLUTIUM_SAVE',
      payload: {
        project_id: config?.project_id,
        asset_id: active_asset_id,
        app_id: 'web-constructor',
        data: siteData,
        metadata: {
          status: status,
          name: active_asset?.name || config?.project_data?.name,
          tags: asset_settings.tags || [],
          thumbnail: "https://solutium.app/logos-de-apps/solutium-constructor-web-isotipo.png"
        }
      }
    };

    try {
      let sent = false;
      if (window.opener) {
        window.opener.postMessage(message, TARGET_ORIGIN);
        sent = true;
      }
      
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(message, TARGET_ORIGIN);
        sent = true;
      }

      if (sent) {
        setDirty(false);
        setLastSaved(new Date());
      } else {
        console.error("No se pudo enviar el mensaje: no se encontró ventana padre ni opener.");
      }
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setSaving(false);
    }
  }, [modules, config, is_saving, setSaving, setDirty, setLastSaved, active_asset, active_asset_id, asset_settings]);

  // Auto-save logic
  useEffect(() => {
    if (!is_dirty || is_saving) return;

    const timer = setTimeout(() => {
      handleSave('borrador');
    }, auto_save_interval);

    return () => clearTimeout(timer);
  }, [is_dirty, is_saving, modules, selected_product_ids, asset_settings, handleSave, auto_save_interval]);

  const handleAddModule = (type: string) => {
    addModule(type);
    setWelcomeMode('asset');
    setShowPicker(false);
    set_is_mobile_menu_open(false);
    
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
      set_is_image_picker_open(false);
      setImagePickerCallback(null);
    }
  };

  const handleGenerateAI = async (customName?: string, targetProjectId?: string, targetAssetId?: string, currentProjectsList?: any[], assetName?: string, pageDescription?: string) => {
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is missing");
      return;
    }

    setIsGenerating(true);
    
    const projId = targetProjectId || active_project_id;
    const assId = targetAssetId || active_asset_id;
    const pList = currentProjectsList || projects;

    const saveGeneratedModules = (generated: any[]) => {
      // Ensure all generated modules have default data merged
      const processedModules = generated.map(m => {
        const def = getModuleDefinition(m.type);
        return {
          ...m,
          data: { ...(def?.defaultData || {}), ...m.data }
        };
      });

      setModules(processedModules);
      setDirty(false);
      const finalProjectsList = pList.map(p => {
        if (p.id === projId) {
          return {
            ...p,
            assets: p.assets.map((a: any) => {
              if (a.id === assId) {
                return { ...a, modules: processedModules };
              }
              return a;
            })
          };
        }
        return p;
      });
      setProjects(finalProjectsList);
    };

    try {
      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3-flash-preview";
      
      const businessName = customName || active_project?.name || config?.project_data?.name || 'Proyecto Local';
      const pageName = assetName || 'Inicio';
      const businessContext = pageDescription ? `El negocio se dedica a: "${pageDescription}".` : '';
      
      const prompt = `Genera una estructura de landing page profesional para la página "${pageName}" de un negocio llamado "${businessName}". 
      ${businessContext}
      El objetivo es crear una página atractiva y funcional que refleje la identidad de este tipo de negocio.
      
      Responde ÚNICAMENTE con un array JSON de objetos, donde cada objeto representa un módulo con el siguiente formato:
      {
        "id": "string único",
        "type": "uno de: top-bar, header, hero, features, testimonials, pricing, product-showcase, team, faq, contact, footer",
        "data": { ... datos específicos del módulo, con textos persuasivos adaptados al giro del negocio ... }
      }
      
      Asegúrate de incluir contenido relevante y persuasivo en español. 
      Incluye al menos 8 módulos (top-bar, header, hero, features, product-showcase, testimonials, contact, footer).
      Para el módulo 'header', incluye 'logoText' y 'scrollMode': 'static'.
      Para el módulo 'top-bar', incluye un mensaje de bienvenida o aviso.
      Para el módulo 'footer', incluye 'logoText' y una breve descripción.`;

      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      let generatedModules = JSON.parse(response.text || "[]");
      
      // Post-process to enforce specific requirements
      if (generatedModules.length > 0) {
        generatedModules = generatedModules.map((m: any) => {
          if (m.type === 'hero') {
            return {
              ...m,
              data: {
                ...m.data,
                title: `Bienvenidos a *${businessName}*`,
                title_style: {
                  ...m.data.title_style,
                  highlightType: 'gradient'
                },
                layout: 'layout-2', // Split layout
                background: {
                  ...m.data.background,
                  image: getBusinessImage(pageDescription || '')
                }
              }
            };
          }
          return m;
        });
        
        saveGeneratedModules(generatedModules);
      }
    } catch (error) {
      console.error("Error generating AI content:", error);
      // Fallback to mock data if AI fails
      const businessName = customName || active_project?.name || config?.project_data?.name || 'Proyecto Local';
      const pageName = assetName || 'Inicio';
      const aiModules = [
        { id: 'ai-top', type: 'top-bar', data: { message: '¡Bienvenidos a ' + businessName + '!' } },
        { id: 'ai-0', type: 'header', data: { logoText: businessName, isSticky: true } },
        { id: 'ai-1', type: 'hero', data: { title: businessName, subtitle: `Estás viendo la página: ${pageName}` } },
        { id: 'ai-2', type: 'features', data: {} },
        { id: 'ai-3', type: 'product-showcase', data: {} },
        { id: 'ai-4', type: 'testimonials', data: {} },
        { id: 'ai-5', type: 'contact', data: {} },
        { id: 'ai-footer', type: 'footer', data: { logoText: businessName } },
      ];
      saveGeneratedModules(aiModules);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    setPublishStatus('publishing');
    
    // Save data with 'published' status
    saveData({ 
      modules, 
      selected_product_ids, 
      settings: asset_settings,
      asset_id: active_asset_id,
      project_id: active_project_id,
      version: 'published-' + Date.now(),
      projects: projects
    }, {
      status: 'published',
      tags: ['Landing Page', 'Publicado'],
      author: config?.user_profile?.full_name || 'Usuario',
      updated_at: Date.now()
    });

    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Simulate validation: check if domain is configured (mock check)
    const hasDomain = config?.project_id !== 'dev-project-1'; 
    
    if (hasDomain) {
      setPublishStatus('success');
    } else {
      setPublishStatus('error');
    }
    
    setTimeout(() => setPublishStatus('idle'), 5000);
  };

  const handleWelcomeOption = (option: 'ai' | 'template' | 'blank', pageName: string, pageDescription: string, palette?: { primary: string, secondary: string }) => {
    setShowWelcome(false);
    
    // Apply palette if provided
    if (palette) {
      document.documentElement.style.setProperty('--color-primary', palette.primary);
      document.documentElement.style.setProperty('--color-secondary', palette.secondary);
      // Also update RGB values for Tailwind opacity utilities
      const hexToRgb = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `${r} ${g} ${b}`;
      };
      document.documentElement.style.setProperty('--color-primary-rgb', hexToRgb(palette.primary));
      document.documentElement.style.setProperty('--color-secondary-rgb', hexToRgb(palette.secondary));
    }
    
    let currentProjectId = active_project_id || config?.project_id || projects[0]?.id || 'dev-project-1';
    let currentProjectsList = [...projects];

    // Ensure project exists in list
    if (!currentProjectsList.find(p => p.id === currentProjectId)) {
      currentProjectsList.push({
        id: currentProjectId,
        name: config?.project_data?.name || 'Proyecto Local',
        assets: []
      });
    }

    const finalProjectName = config?.project_data?.name || 'Proyecto Local';
    const finalAssetName = pageName;
    const newAssetId = 'asset-' + Math.random().toString(36).substr(2, 5);

    // Create new asset
    const newAsset = {
      id: newAssetId,
      name: finalAssetName,
      modules: [],
      settings: {
        domain: '',
        seo_title: finalAssetName + ' | ' + finalProjectName,
        seo_description: pageDescription || `Bienvenido a ${finalAssetName}`
      }
    };

    // Add asset to project
    currentProjectsList = currentProjectsList.map(p => {
      if (p.id === currentProjectId) {
        return {
          ...p,
          assets: [...(p.assets || []), newAsset]
        };
      }
      return p;
    });

    setProjects(currentProjectsList);
    setActiveProject(currentProjectId);
    setActiveAsset(newAssetId);

    const createModule = (type: string, customData: any = {}) => {
      const def = getModuleDefinition(type);
      return {
        id: Math.random().toString(36).substr(2, 9),
        type,
        data: { ...(def?.defaultData || {}), ...customData }
      };
    };

    if (option === 'ai') {
      handleGenerateAI(finalProjectName, currentProjectId, newAssetId, currentProjectsList, finalAssetName, pageDescription);
    } else if (option === 'blank') {
      // Initialize with basic structure but customized text based on pageDescription
      const initialModules = [
        createModule('header', { logoText: finalProjectName, scrollMode: 'static', theme: 'dark' }),
        createModule('hero', { 
          title: `Bienvenido a *${finalProjectName}*`, 
          title_style: { highlightType: 'gradient' },
          subtitle: "Nunca fue tan fácil crear su propia página web. Para comenzar, agregue cualquier módulo desde el Constructor a la izquierda",
          layout: 'layout-2', // Split layout
          primaryButton: null,
          secondaryButton: null,
          theme: 'light',
          background: {
            image: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?q=80&w=2000&auto=format&fit=crop'
          }
        })
      ];
      
      setModules(initialModules);
      setDirty(false);
      
      const finalProjectsList = currentProjectsList.map(p => {
        if (p.id === currentProjectId) {
          return {
            ...p,
            assets: p.assets.map((a: any) => {
              if (a.id === newAssetId) {
                return { ...a, modules: initialModules };
              }
              return a;
            })
          };
        }
        return p;
      });
      setProjects(finalProjectsList);
    } else {
      // Template option - for now, just use a default template but customized
      const initialModules = [
        createModule('top-bar', { message: '¡Oferta especial de lanzamiento!', theme: 'dark' }),
        createModule('header', { logoText: finalProjectName, scrollMode: 'static', theme: 'dark' }),
        createModule('hero', { 
          title: `Bienvenidos a *${finalProjectName}*`, 
          title_style: { highlightType: 'gradient' },
          subtitle: `Soluciones profesionales en ${pageDescription || 'tu sector'}.`,
          layout: 'layout-2', // Split layout
          theme: 'light',
          background: {
            image: getBusinessImage(pageDescription || '')
          }
        }),
        createModule('features', { title: '¿Por qué elegirnos?', subtitle: `Diseñamos soluciones de ${pageDescription || 'calidad'} que se adaptan a tus necesidades.` }),
        createModule('contact', { title: 'Contáctanos', subtitle: 'Estamos aquí para ayudarte.' }),
        createModule('footer', { logoText: finalProjectName }),
      ];
      
      setModules(initialModules);
      setDirty(false);
      
      const finalProjectsList = currentProjectsList.map(p => {
        if (p.id === currentProjectId) {
          return {
            ...p,
            assets: p.assets.map((a: any) => {
              if (a.id === newAssetId) {
                return { ...a, modules: initialModules };
              }
              return a;
            })
          };
        }
        return p;
      });
      setProjects(finalProjectsList);
    }
    
    setWelcomeMode('asset'); // Always stay in asset mode
  };

  const handleCreateNewAssetClick = () => {
    if (is_dirty) {
      if (!window.confirm('Tienes cambios sin guardar en el proyecto actual. ¿Estás seguro de que quieres crear una nueva página y perder los cambios no guardados?')) {
        return;
      }
    }
    setWelcomeMode('asset');
    setShowWelcome(true);
  };

  const handleReorderModules = (newModules: any[]) => {
    reorderModules(newModules);
  };

  const handleSelectProject = (projectId: string) => {
    setShowWelcome(false);
    setActiveProject(projectId);
    const project = projects.find(p => p.id === projectId);
    if (project && project.assets?.length > 0) {
      const firstAsset = project.assets[0];
      setActiveAsset(firstAsset.id);
    }
  };

  const handleSelectAsset = (asset_id: string, project_id: string) => {
    if (is_dirty) {
      if (!window.confirm('Tienes cambios sin guardar en el activo actual. ¿Estás seguro de que quieres cambiar de página y perder los cambios no guardados?')) {
        return;
      }
    }
    
    if (project_id !== active_project_id) {
      setActiveProject(project_id);
    }
    
    setActiveAsset(asset_id);
  };

  const handleSelectModule = (id: string | null, source: 'canvas' | 'structure' = 'canvas') => {
    const isAlreadySelected = id === selected_module_id;
    
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
    return <LoadingView projectName={config?.project_data?.name} onSimulateConnection={simulateConnection} />;
  }

  if (showWelcome) {
    return (
      <WelcomeScreen 
        onSelectOption={handleWelcomeOption} 
        onSelectProject={handleSelectProject}
        projects={projects}
        title={config?.project_data?.name || 'Proyecto'}
        brandColors={config?.project_data?.colors}
      />
    );
  }

  return (
    <div className={`h-screen flex font-sans relative ${isPreviewMode ? 'overflow-x-hidden' : ''} ${
      asset_settings.page_layout === 'seamless' ? 'bg-surface' : 'bg-background'
    }`}>
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
        {is_mobile_menu_open && !isPreviewMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => set_is_mobile_menu_open(false)}
            className="fixed inset-0 bg-text/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className={`
        fixed inset-y-0 left-0 z-[90] lg:relative lg:z-[90] transition-transform duration-300 transform
        ${isPreviewMode ? '-translate-x-full lg:hidden' : ''}
        ${is_mobile_menu_open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar 
          config={config} 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            setActiveTab(tab);
            set_is_mobile_menu_open(false);
          }} 
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onAddModule={handleAddModule}
          onGoHome={() => setShowWelcome(true)}
          onGenerateAI={() => handleGenerateAI()}
          projects={projects}
          active_project_id={active_project_id || config?.project_id || (projects[0]?.id)}
          onSelectProject={handleSelectProject}
          active_asset_id={active_asset_id}
          onSelectAsset={handleSelectAsset}
          onCreateAsset={handleCreateNewAssetClick}
          showSaveMessage={showSaveMessage}
          lastSaveStatus={lastSaveStatus}
          asset_settings={asset_settings}
          onUpdateSettings={updateAssetSettings}
        />
      </div>

      {/* Left Panels Container (Structure & Properties) */}
      {!isPreviewMode && activeTab === 'builder' && (
        <SidebarPanelWrapper
          modules={modules}
          onReorder={reorderModules}
          onRemove={handleRemoveModule}
          onSelect={handleSelectModule}
          onEdit={handleEditModule}
          selected_module_id={selected_module_id}
          editing_module_id={editing_module_id}
          sidebarCollapsed={isSidebarCollapsed}
          isPinned={isSidebarPinned}
          onTogglePin={() => setIsSidebarPinned(!isSidebarPinned)}
          updateModule={updateModule}
          onOpenImagePicker={(callback) => {
            setImagePickerCallback(() => callback);
            set_is_image_picker_open(true);
          }}
        />
      )}

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Content Area */}
        <div className={`flex-1 overflow-y-auto custom-scrollbar transition-all duration-500 ${
          isPreviewMode || asset_settings.page_layout === 'seamless' 
            ? 'p-0 bg-surface' 
            : 'p-4 md:p-8 lg:p-10 bg-background'
        }`}>
          <div className={`transition-all duration-500 mx-auto ${
            isPreviewMode && previewDevice === 'mobile' ? 'max-w-[375px] my-12 border-[12px] border-text/90 rounded-[3rem] shadow-2xl h-[760px] bg-white overflow-y-auto custom-scrollbar relative' :
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
            <PageLayoutProvider 
              page_layout={asset_settings.page_layout || 'seamless'}
              previewDevice={isPreviewMode ? previewDevice : 'desktop'}
            >
              <BuilderView
                isPreviewMode={isPreviewMode}
                setIsPreviewMode={setIsPreviewMode}
                set_is_mobile_menu_open={set_is_mobile_menu_open}
                handleSave={() => handleSave('guardado')}
                is_saving={is_saving}
                is_dirty={is_dirty}
                handlePublish={handlePublish}
                publishStatus={publishStatus}
                modules={modules}
                setShowPicker={setShowPicker}
                removeModule={removeModule}
                updateModule={updateModule}
                handleSelectModule={handleSelectModule}
                handleEditModule={handleEditModule}
                selected_module_id={selected_module_id}
                setImagePickerCallback={setImagePickerCallback}
                set_is_image_picker_open={set_is_image_picker_open}
                config={config}
                selected_product_ids={selected_product_ids}
                page_layout={asset_settings.page_layout || 'seamless'}
              />
            </PageLayoutProvider>
          )}

          {activeTab === 'settings' && (
            <SettingsView
              active_project={active_project}
              active_asset={active_asset}
              config={config}
              asset_settings={asset_settings}
              selected_product_ids={selected_product_ids}
              updateAssetSettings={updateAssetSettings}
              updateAssetName={updateAssetName}
              update_selected_products={update_selected_products}
              setActiveTab={setActiveTab}
              handleSave={() => handleSave('guardado')}
              is_saving={is_saving}
              is_dirty={is_dirty}
              auto_save_interval={auto_save_interval}
              setAutoSaveInterval={setAutoSaveInterval}
            />
          )}

          {activeTab === 'data-audit' && (
            <DataAuditView config={config} />
          )}
          </div>
        </div>
      </main>

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
                <ModulePicker onAdd={addModule} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Picker Modal */}
      <ImagePicker 
        is_open={is_image_picker_open}
        onClose={() => set_is_image_picker_open(false)}
        onSelect={handleImageSelect}
      />
    </div>
  );
}

export default App;
