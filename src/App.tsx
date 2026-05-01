import React, { useEffect, useState } from 'react';
import { startHandshake } from './services/handshakeService';
import { configService } from './services/configService';
import { initSupabase } from './services/supabaseClient';
import { initDOClient } from './services/doService';
import { getProfile, getProject, getWebBuilderSites, getPublishedSites, renameWebBuilderSite } from './services/dataService';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { DataTab } from './components/DataTab';
import { Dashboard } from './components/Dashboard';
import { MethodSelection, CreationMethod } from './components/MethodSelection';
import { ProjectForm, ProjectFormData } from './components/ProjectForm';
import { WebConstructor } from './components/constructor/WebConstructor';
import { AIGenerationOverlay } from './components/constructor/AIGenerationOverlay';
import { useEditorStore } from './store/editorStore';
import { Viewer } from './components/Viewer';
import { Profile, Project, Asset, WebBuilderSite, PublishedSite } from './types/schema';
import { getAssets } from './services/dataService';

type View = 'dashboard' | 'selection-method' | 'form' | 'generator' | 'constructor' | 'viewer';

const AppContent: React.FC = () => {
  const [isHandshakeComplete, setIsHandshakeComplete] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [appId, setAppId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [pages, setPages] = useState<(WebBuilderSite | PublishedSite)[]>([]);
  const [activeTab, setActiveTab] = useState('home');
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedMethod, setSelectedMethod] = useState<CreationMethod | null>(null);
  const [formData, setFormData] = useState<ProjectFormData | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedPage, setSelectedPage] = useState<WebBuilderSite | PublishedSite | null>(null);
  const [loadingLogoError, setLoadingLogoError] = useState(false);
  const [urlLogo, setUrlLogo] = useState<string | null>(null);
  const [urlLogoWhite, setUrlLogoWhite] = useState<string | null>(null);
  const { applyTheme } = useTheme();

  // --- PERSISTENCE PROTOCOL v1.0 ---
  const saveSession = () => {
    try {
      const session = {
        projectId,
        appId,
        currentView,
        selectedPage,
        activeTab
      };
      localStorage.setItem('solutium_session_v2', JSON.stringify(session));
    } catch (e) {
      console.warn('[SESSION] Error saving session:', e);
    }
  };

  // Sync state to local storage
  useEffect(() => {
    if (projectId || currentView !== 'dashboard') {
      saveSession();
    }
  }, [projectId, appId, currentView, selectedPage, activeTab]);

  const refreshData = async (fProjectId?: string) => {
    const idToUse = fProjectId || projectId;
    if (!idToUse) return [];

    try {
      const projectAssets = await getAssets(idToUse, 'web_page');
      setAssets(projectAssets);

      const [drafts, published] = await Promise.all([
        getWebBuilderSites(idToUse),
        getPublishedSites(idToUse)
      ]);
      
      const sitesMap = new Map<string, WebBuilderSite | PublishedSite>();
      published.forEach(p => { 
        if (p.siteId) {
          const siteWithStatus = { ...p, status: 'published' as const };
          sitesMap.set(p.siteId, siteWithStatus); 
        }
      });
      drafts.forEach(d => { 
        if (d.siteId) {
          const existing = sitesMap.get(d.siteId);
          const status = d.status || (existing ? 'modified' : 'draft');
          const siteWithStatus = { ...d, status };
          sitesMap.set(d.siteId, siteWithStatus); 
        }
      });

      const allPages = Array.from(sitesMap.values()).sort((a, b) => {
        const dateA = new Date(a.updatedAt || 0).getTime();
        const dateB = new Date(b.updatedAt || 0).getTime();
        return dateB - dateA;
      });
      
      setPages(allPages);
      return allPages;
    } catch (error) {
      console.error('[DATA] Error refreshing data:', error);
      return [];
    }
  };

  const processHandshake = async (payload: any) => {
    try {
      console.log('[HANDSHAKE] Procesando payload:', payload);
      
      // LOG DE DIAGNÓSTICO SOLICITADO
      console.log('[CONSTRUCTOR_MESSAGE_RECEIVED_DEBUG]', {
        eventType: payload.type, // Note: payload here is the config object from handshakeService
        topLevelFirstSectionContent: payload.sections?.[0]?.content,
        contentFirstSectionContent: payload.content?.sections?.[0]?.content,
        configFirstSectionContent: payload.config?.sections?.[0]?.content,
        fullFirstSection: payload.sections?.[0]
      });

      // Cache the handshake data for literal reloads
      localStorage.setItem('solutium_handshake_cache', JSON.stringify(payload));

      // Actualizar configuración dinámica (API Keys) desde la Madre
      configService.updateConfig({
        geminiApiKey: payload.gemini_api_key || payload.VITE_GEMINI_API_KEY || null,
        pexelsApiKey: payload.pexels_api_key || payload.VITE_PEXELS_API_KEY || null
      });

      // Extraer fontFamily con máxima cobertura de claves posibles
      const handshakeFont = 
        payload.fontFamily || 
        (payload as any).font_family || 
        (payload as any).font ||
        payload.project?.fontFamily || 
        payload.project?.font_family ||
        payload.project?.font ||
        payload.activeThemeData?.fontFamily ||
        payload.activeThemeData?.font_family ||
        payload.activeThemeData?.font ||
        '';

      // Si hay datos de Supabase, inicializamos y cargamos perfil
      if (payload.supabase_url && payload.supabase_anon_key && payload.session_token) {
        const supabase = initSupabase(
          payload.supabase_url,
          payload.supabase_anon_key,
          payload.session_token
        );

        // Intento de obtener usuario con timeout para no bloquear el splash screen infinitamente
        const userPromise = supabase.auth.getUser();
        const userResult = await Promise.race([
          userPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase timeout')), 5000))
        ]).catch(e => ({ data: { user: null }, error: e }));

        const { data: { user }, error: userError } = userResult as any;
        
        if (user && !userError) {
          const mappedProfile = await getProfile(user.id);
          const handshakeThemeData = payload.activeThemeData;
          const handshakeThemeName = payload.profile?.activeTheme || payload.project?.activeTheme;
          const hasThemeData = handshakeThemeData && Object.keys(handshakeThemeData).length > 0;
          const themeToApply = (hasThemeData ? handshakeThemeData : null) || handshakeThemeName || mappedProfile?.activeTheme || 'blue-light';

          if (mappedProfile) {
            setProfile(mappedProfile);
          } else {
            setProfile({ id: user.id, email: user.email, role: 'user', activeTheme: (typeof themeToApply === 'string' ? themeToApply : 'blue-light') as any });
          }

          if (typeof themeToApply === 'object') {
            applyTheme({ ...themeToApply, fontFamily: handshakeFont || themeToApply.fontFamily || themeToApply.font_family });
          } else {
            applyTheme(themeToApply);
            if (handshakeFont) applyTheme({ fontFamily: handshakeFont });
          }
        }
      }
      
      // Update favicon if provided
      const handshakeFavicon = 
        payload.favicon_url || 
        payload.faviconUrl || 
        payload.project?.favicon_url || 
        payload.project?.faviconUrl ||
        payload.activeThemeData?.favicon_url ||
        payload.activeThemeData?.faviconUrl;

      if (handshakeFavicon) {
        let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = handshakeFavicon;
      }

      // Configuration fallbacks from environment with more variants (SIP v5.4)
      const finalEndpoint = payload.do_endpoint || payload.STORAGE_ENDPOINT || payload.storage_endpoint || import.meta.env.VITE_STORAGE_ENDPOINT || (import.meta as any).env?.STORAGE_ENDPOINT || '';
      const finalAccessKey = payload.do_access_key || payload.STORAGE_ACCESS_KEY || payload.storage_access_key || import.meta.env.VITE_STORAGE_ACCESS_KEY || (import.meta as any).env?.STORAGE_ACCESS_KEY || '';
      const finalSecretKey = payload.do_secret_key || payload.STORAGE_SECRET_KEY || payload.storage_secret_key || import.meta.env.VITE_STORAGE_SECRET_KEY || (import.meta as any).env?.STORAGE_SECRET_KEY || '';
      const finalBucket = payload.do_bucket || payload.STORAGE_BUCKET || payload.storage_bucket || import.meta.env.VITE_STORAGE_BUCKET || (import.meta as any).env?.STORAGE_BUCKET || '';

      // Initialize storage service even with empty strings to allow server-side secrets fallback
      initDOClient(finalEndpoint, finalAccessKey, finalSecretKey, finalBucket);

      if (payload.projectId || projectId) {
        const finalProjectId = payload.projectId || projectId;
        setProjectId(finalProjectId);
        
        const handshakeAppId = payload.appId || (payload as any).app_id || '11111111-1111-1111-1111-111111111111';
        setAppId(handshakeAppId);
        
        if (payload.project) {
          setProject(payload.project);
          if (payload.project.logoWhiteUrl || payload.project.logo_white_url) {
            setUrlLogoWhite(payload.project.logoWhiteUrl || payload.project.logo_white_url);
          }
        } else if (finalProjectId) {
          const projectData = await getProject(finalProjectId);
          if (projectData) {
            setProject(projectData);
            if (projectData.logoWhiteUrl) setUrlLogoWhite(projectData.logoWhiteUrl);
          }
        }

        if (finalProjectId) {
          const allPages = await refreshData(finalProjectId);

          if (payload.site_id) {
            // SIP v7.2: Robust search by either logical siteId or primary key id
            const existingPage = allPages.find(p => p.siteId === payload.site_id || (p as any).id === payload.site_id);
            let finalPage = existingPage;
            
            // SIP v5.5 (Protocolo 10.2): Robust hydration from payload
            const providedContent = payload.site_content || payload.site_data || payload.content || payload.full_site;
            
            if (providedContent) {
              console.log('[GATEWAY] Hidratando sitio desde payload (Protocolo 10.2)');
              finalPage = { 
                ...(existingPage || {}),
                siteId: payload.site_id, 
                name: payload.siteName || (existingPage as any)?.name || 'Sitio Remoto',
                content: providedContent,
                isActive: payload.isActive ?? (existingPage as any)?.isActive ?? true
              } as any;
            } else if (existingPage) {
              finalPage = existingPage;
            } else {
              finalPage = { siteId: payload.site_id, name: payload.siteName || 'Nuevo Sitio' } as any;
            }

            setSelectedPage(finalPage);
            
            // Handle rendering modes directly using local variable since state updates are async
            if (payload.force_render || payload.render_mode === 'published') {
              console.log('[GATEWAY] Forzando renderizado directo:', payload.render_mode);
              if (payload.render_mode === 'published') {
                setCurrentView('viewer');
              } else {
                setCurrentView('constructor');
              }
            } else {
              setCurrentView('constructor');
            }
          }
        }
      }
      
      setIsHandshakeComplete(true);
    } catch (err) {
      console.error('Error processing handshake:', err);
      setIsHandshakeComplete(true);
    }
  };

  useEffect(() => {
    // 1. Recover basic session if URL params are missing
    const params = new URLSearchParams(window.location.search);
    const hasInitParams = params.get('satellite_id') || params.get('site_id');
    
    if (!hasInitParams) {
      try {
        const saved = localStorage.getItem('solutium_session_v2');
        if (saved) {
          const session = JSON.parse(saved);
          console.log('[SESSION] Recuperando sesión persistente:', session);
          if (session.projectId) setProjectId(session.projectId);
          if (session.appId) setAppId(session.appId);
          if (session.currentView) setCurrentView(session.currentView);
          if (session.selectedPage) setSelectedPage(session.selectedPage);
          if (session.activeTab) setActiveTab(session.activeTab);
          
          const savedHandshake = localStorage.getItem('solutium_handshake_cache');
          if (savedHandshake) {
            processHandshake(JSON.parse(savedHandshake));
          }
        }
      } catch (e) {
        console.warn('[SESSION] Error recovering session:', e);
      }
    }

    const logo = params.get('logoUrl') || params.get('logo_url') || params.get('isoUrl') || params.get('iso_url');
    if (logo) setUrlLogo(logo);

    const logoWhite = params.get('logoWhiteUrl') || params.get('logo_white_url');
    if (logoWhite) setUrlLogoWhite(logoWhite);
    
    const fontParam = params.get('fontFamily') || params.get('font_family');
    if (fontParam) {
      applyTheme({ fontFamily: fontParam });
    }

    // --- PROTOCOLO SOLUTIUM v5.2: Gateway Override ---
    const isExternal = params.get('external_render') === 'true';
    const assetId = params.get('asset_id');
    const satelliteId = params.get('satellite_id');

    if (isExternal && satelliteId) {
      console.log(`[GATEWAY v5.2] Detectado renderizado externo para Satélite: ${satelliteId}, Asset: ${assetId}`);
      setProjectId(satelliteId);
      if (assetId) {
        // Preparamos el estado para que el constructor cargue este asset
        setSelectedPage({ siteId: assetId, name: 'Cargando sitio...' } as any);
        setCurrentView('constructor');
      }
    }
    
    const favicon = params.get('faviconUrl') || params.get('favicon_url');
    if (favicon) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = favicon;
    }
    
    console.log("--- DIAGNÓSTICO SIP v5.2 ---");
    console.log("1. window.name contenido:", window.name ? (window.name.substring(0, 50) + "...") : "VACÍO");
    console.log("2. ¿Tiene abridor (window.opener)?:", !!window.opener);
    console.log("3. ¿Está en iframe?:", window.parent !== window);
    console.log("4. URL actual:", window.location.href);
    console.log("---------------------------------");
  }, []);

  useEffect(() => {
    startHandshake(processHandshake);
  }, [applyTheme, projectId]);

  const handleNewPage = () => {
    setCurrentView('selection-method');
  };

  const handleSelectMethod = (method: CreationMethod) => {
    setSelectedMethod(method);
    setCurrentView('constructor');
  };

  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setCurrentView('constructor');
  };

  const handleRenamePage = async (siteId: string, newName: string) => {
    if (!projectId) return;
    const success = await renameWebBuilderSite(projectId, siteId, newName);
    if (success) {
      // Refresh pages
      const [drafts, published] = await Promise.all([
        getWebBuilderSites(projectId),
        getPublishedSites(projectId)
      ]);
      
      const sitesMap = new Map<string, WebBuilderSite | PublishedSite>();
      published.forEach(p => { if (p.siteId) sitesMap.set(p.siteId, p); });
      drafts.forEach(d => { if (d.siteId) sitesMap.set(d.siteId, d); });

      const allPages = Array.from(sitesMap.values()).sort((a, b) => {
        const dateA = new Date(a.updatedAt || 0).getTime();
        const dateB = new Date(b.updatedAt || 0).getTime();
        return dateB - dateA;
      });
      
      setPages(allPages);
    }
  };

  const handleFormSubmit = (data: ProjectFormData) => {
    setFormData(data);
    if (selectedMethod === 'ai') {
      setCurrentView('generator');
    } else {
      setCurrentView('constructor');
    }
  };

  if (!isHandshakeComplete) {
    const isDevOrAIStudio = window.location.hostname.includes('run.app') || window.location.hostname.includes('localhost');

    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-text p-6">
        <div className="flex flex-col items-center space-y-12">
          {urlLogo && !loadingLogoError ? (
            <img 
              src={urlLogo} 
              alt="Loading Logo" 
              className="h-24 w-auto object-contain animate-pulse" 
              referrerPolicy="no-referrer" 
              onError={() => setLoadingLogoError(true)}
            />
          ) : null}
          
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        {/* Botón de Emergencia para Desarrollo */}
        {isDevOrAIStudio && (
          <div className="absolute bottom-10">
            <button 
              onClick={() => {
                // Inicialización de emergencia con datos de prueba
                initSupabase(
                  'https://placeholder-project.supabase.co',
                  'placeholder-key',
                  'placeholder-token'
                );
                initDOClient(
                  import.meta.env.VITE_STORAGE_ENDPOINT || 'nyc3.digitaloceanspaces.com',
                  import.meta.env.VITE_STORAGE_ACCESS_KEY || 'mock-key',
                  import.meta.env.VITE_STORAGE_SECRET_KEY || 'mock-secret',
                  import.meta.env.VITE_STORAGE_BUCKET || 'mock-bucket'
                );
                setProjectId('dev-project-id');
                setProfile({
                  id: 'dev-user-id',
                  email: 'admin@solutium.com',
                  role: 'superadmin',
                  activeTheme: 'blue-light'
                });
                setIsHandshakeComplete(true);
              }}
              className="px-6 py-2 bg-secondary hover:bg-secondary/80 text-text/40 rounded-xl text-sm font-medium transition-all border border-border shadow-sm"
            >
              Saltar Handshake (Modo Dev)
            </button>
          </div>
        )}
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            assets={assets} 
            pages={pages}
            onNewPage={() => {
              setSelectedPage(null);
              handleNewPage();
            }} 
            onSelectAsset={handleSelectAsset}
            onSelectPage={(page) => {
              setSelectedPage(page);
              if (!('contentDraft' in page)) {
                setCurrentView('viewer');
              } else {
                setCurrentView('constructor');
              }
            }}
            onRenamePage={handleRenamePage}
            logoUrl={urlLogo}
            logoWhiteUrl={urlLogoWhite}
          />
        );
      case 'selection-method':
        return (
          <MethodSelection 
            onSelect={handleSelectMethod}
            onBack={() => setCurrentView('dashboard')}
            logoUrl={urlLogo}
          />
        );
      case 'form':
        return (
          <>
            <MethodSelection 
              onSelect={handleSelectMethod}
              onBack={() => setCurrentView('dashboard')}
              logoUrl={urlLogo}
            />
            <ProjectForm 
              onSubmit={handleFormSubmit}
              onCancel={() => setCurrentView('selection-method')}
              onSkip={() => {
                if (selectedMethod === 'ai') {
                  setCurrentView('generator');
                } else {
                  setCurrentView('constructor');
                }
              }}
            />
          </>
        );
      case 'generator':
        return (
          <div className="p-8 flex flex-col items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-6"></div>
            <h2 className="text-3xl font-bold">Generando tu página con IA...</h2>
            <p className="text-text/60 mt-2">Estamos creando la estructura perfecta para {formData?.name}</p>
            <button onClick={() => setCurrentView('constructor')} className="mt-8 text-primary font-bold">Saltar a Constructor (Simulación)</button>
          </div>
        );
      case 'constructor':
        return (
          <WebConstructor 
            key={selectedPage?.id || (selectedPage as any)?.siteId || 'new-constructor'}
            onBackToDashboard={() => {
              refreshData();
              setSelectedPage(null);
              setSelectedMethod(null);
              setCurrentView('dashboard');
            }} 
            onCancelOnboarding={() => {
              setCurrentView('selection-method');
              setSelectedMethod(null);
            }}
            projectId={projectId} 
            appId={appId}
            currentUserId={profile?.id || null}
            logoUrl={urlLogo}
            logoWhiteUrl={urlLogoWhite}
            project={project}
            initialPage={selectedPage}
            creationMethod={selectedMethod}
          />
        );
      case 'viewer':
        if (!selectedPage) return (
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        );

        // LOG DE DIAGNÓSTICO SOLICITADO
        console.log('[CONSTRUCTOR_BEFORE_VIEWER_DEBUG]', {
          firstSection: (selectedPage as any).content?.sections?.[0],
          firstSectionContent: (selectedPage as any).content?.sections?.[0]?.content,
          firstSectionSettingsKeys: Object.keys((selectedPage as any).content?.sections?.[0]?.settings || {})
        });

        return (
          <Viewer 
            site={selectedPage as PublishedSite}
            onBack={() => {
              setSelectedPage(null);
              setCurrentView('dashboard');
            }}
          />
        );
      default:
        return <div>Vista no encontrada</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background text-text">
      {renderView()}
      <AIGenerationOverlay />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
