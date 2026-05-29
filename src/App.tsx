import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { startHandshake } from './services/handshakeService';
import { configService } from './services/configService';
import { initSupabase } from './services/supabaseClient';
import { captureAuthToken } from './services/authTokenProvider';
import { ensureActiveSupabaseSession } from './services/supabaseSessionService';
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
import { logDebug } from './utils/debug';
import { Profile, Project, Asset, WebBuilderSite, PublishedSite } from './types/schema';
import { getAssets } from './services/dataService';
import { normalizeProjectBrandColors } from './utils/projectTheme';

type View = 'dashboard' | 'selection-method' | 'form' | 'generator' | 'constructor' | 'viewer';

const CONSTRUCTOR_WEB_LOGO_URL = 'https://nyc3.digitaloceanspaces.com/solutium-space/988cd339-a2c7-4951-b944-998d32dc349b-solutium-constructor-web-imagotipo.png';
const PREVENTIVE_SUPABASE_REFRESH_INTERVAL_MS = 10 * 60 * 1000;
const PREVENTIVE_SUPABASE_REFRESH_THROTTLE_MS = 30 * 1000;

const normalizeIncomingProject = (rawProject: any): Project | null => {
  if (!rawProject || typeof rawProject !== 'object') return null;

  return {
    ...rawProject,
    logoWhiteUrl: rawProject.logoWhiteUrl || rawProject.logo_white_url || null,
    projectIconUrl: rawProject.projectIconUrl || rawProject.project_icon_url || null,
    fontFamily: rawProject.fontFamily || rawProject.font_family || null,
    brandColors: normalizeProjectBrandColors(rawProject.brandColors || rawProject.brand_colors),
    webConfig: rawProject.webConfig || rawProject.web_config || null,
    imageMappings: rawProject.imageMappings || rawProject.image_mappings || null,
    schemaVersion: rawProject.schemaVersion || rawProject.schema_version || null,
    createdAt: rawProject.createdAt || rawProject.created_at || null,
    updatedAt: rawProject.updatedAt || rawProject.updated_at || null
  } as Project;
};

const normalizeDraftLifecycleStatus = (
  rawStatus: unknown,
  hasActivePublishedVersion: boolean
): 'draft' | 'published' | 'modified' => {
  const normalized = String(rawStatus || '').trim().toLowerCase();

  if (hasActivePublishedVersion) {
    return normalized === 'draft' ? 'draft' : 'modified';
  }

  if (normalized === 'published' || normalized === 'modified' || normalized === 'unpublished') {
    return 'draft';
  }

  return 'draft';
};

const mergePagesByCurrentLifecycle = (
  drafts: WebBuilderSite[],
  published: PublishedSite[]
): (WebBuilderSite | PublishedSite)[] => {
  const sitesMap = new Map<string, WebBuilderSite | PublishedSite>();

  published.forEach((site) => {
    if (site.siteId) {
      sitesMap.set(site.siteId, { ...site, status: 'published' as const });
    }
  });

  drafts.forEach((site) => {
    if (!site.siteId) return;

    const existingPublished = sitesMap.get(site.siteId);
    const status = normalizeDraftLifecycleStatus(site.status, Boolean(existingPublished));
    sitesMap.set(site.siteId, {
      ...existingPublished,
      ...site,
      status
    } as WebBuilderSite | PublishedSite);
  });

  return Array.from(sitesMap.values()).sort((a, b) => {
    const dateA = new Date(a.updatedAt || 0).getTime();
    const dateB = new Date(b.updatedAt || 0).getTime();
    return dateB - dateA;
  });
};

const getLaunchSiteContext = () => {
  const params = new URLSearchParams(window.location.search);
  const launchSiteId = params.get('site_id') || params.get('asset_id') || null;
  const rawLaunchStatus = params.get('site_status');
  const launchSiteStatus =
    rawLaunchStatus && ['draft', 'published', 'modified', 'unpublished'].includes(rawLaunchStatus.toLowerCase())
      ? rawLaunchStatus.toLowerCase()
      : null;

  return {
    launchSiteId,
    launchSiteStatus
  };
};

const getMotherApiBaseUrl = () => {
  const envUrl =
    import.meta.env.VITE_APP_MADRE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    'https://solutium.app';

  return String(envUrl).replace(/\/$/, '');
};

const fetchPublishedSiteById = async (siteId: string) => {
  const primaryBaseUrl = getMotherApiBaseUrl();
  const fallbackBaseUrl = 'https://solutium.app';
  const baseUrls = Array.from(new Set([primaryBaseUrl, fallbackBaseUrl]));

  let lastError: unknown = null;

  for (const baseUrl of baseUrls) {
    try {
      const response = await fetch(`${baseUrl}/api/published-site-by-id/${encodeURIComponent(siteId)}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = await response.json();
      return payload?.data || payload?.site || payload;
    } catch (error) {
      lastError = error;
      logDebug('[PUBLISHED_RENDER_FETCH_FALLBACK]', {
        baseUrl,
        siteId,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Published site fetch failed');
};

const AppContent: React.FC = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const isPublicRenderMode =
    queryParams.get('mode') === 'render' ||
    queryParams.get('external_render') === 'true' ||
    queryParams.get('published') === 'true';
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
  const loadingMessages = React.useMemo(() => ([
    'Estableciendo handshake seguro...',
    'Inicializando sesión de Supabase...',
    'Sincronizando contexto del proyecto...',
    'Aplicando identidad visual...',
    'Preparando módulos del constructor...'
  ]), []);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const { applyTheme } = useTheme();
  const sessionRefreshInFlightRef = useRef(false);
  const lastSessionRefreshAtRef = useRef(0);
  const handshakeStartedRef = useRef(false);

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

  // [DEBUG_FLAGS_RESOLUTION_DEBUG] (FASE 2)
  const debugParam = queryParams.get('debug');
  const debugRenderParam = queryParams.get('debug_render');
  const debugProductsParam = queryParams.get('debug_products');
  
  const debugEnabled = debugParam === 'true' || debugRenderParam === 'true' || debugParam === 'products';
  const productsDebugEnabled = debugEnabled || debugParam === 'products' || debugProductsParam === 'true';

  useEffect(() => {
    if (debugEnabled) {
      console.log('[DEBUG_FLAGS_RESOLUTION_DEBUG]', {
        debugParam,
        debugRenderParam,
        debugProductsParam,
        debugEnabled,
        productsDebugEnabled,
        search: window.location.search
      });
    }
  }, [debugEnabled, productsDebugEnabled]);

  useEffect(() => {
    if (isHandshakeComplete) return;

    const interval = window.setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1400);

    return () => window.clearInterval(interval);
  }, [isHandshakeComplete, loadingMessages]);

  useEffect(() => {
    if (!isHandshakeComplete || isPublicRenderMode) return;

    let isMounted = true;

    const refreshSupabaseSessionSilently = async (
      reason: 'startup' | 'focus' | 'visibility' | 'interval'
    ) => {
      if (!isMounted || sessionRefreshInFlightRef.current) return;

      const now = Date.now();
      if (
        reason !== 'startup' &&
        now - lastSessionRefreshAtRef.current < PREVENTIVE_SUPABASE_REFRESH_THROTTLE_MS
      ) {
        return;
      }

      sessionRefreshInFlightRef.current = true;

      try {
        const result = await ensureActiveSupabaseSession();
        lastSessionRefreshAtRef.current = Date.now();

        if (result.state === 'refreshed') {
          logDebug('[SUPABASE_PREVENTIVE_REFRESH]', {
            reason,
            state: result.state,
            source: result.source
          });
        } else if (result.state !== 'active') {
          logDebug('[SUPABASE_PREVENTIVE_REFRESH_WARNING]', {
            reason,
            state: result.state,
            source: result.source,
            message: result.message
          });
        }
      } catch (error: any) {
        logDebug('[SUPABASE_PREVENTIVE_REFRESH_ERROR]', {
          reason,
          message: error?.message || 'Unknown preventive refresh error'
        });
      } finally {
        sessionRefreshInFlightRef.current = false;
      }
    };

    void refreshSupabaseSessionSilently('startup');

    const handleWindowFocus = () => {
      void refreshSupabaseSessionSilently('focus');
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void refreshSupabaseSessionSilently('visibility');
      }
    };

    const intervalId = window.setInterval(() => {
      void refreshSupabaseSessionSilently('interval');
    }, PREVENTIVE_SUPABASE_REFRESH_INTERVAL_MS);

    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isHandshakeComplete, isPublicRenderMode]);

  // Sync state to local storage
  useEffect(() => {
    console.log('[CONSTRUCTOR_BOOT_START] 🧩 AppContent montado', {
      timestamp: new Date().toISOString(),
      currentView,
      projectId,
      isHandshakeComplete
    });
    
    // [APP_CONTENT_RENDER_DECISION_DEBUG] (FASE 6)
    if (debugEnabled) {
      console.log('[APP_CONTENT_RENDER_DECISION_DEBUG]', {
        currentView,
        projectId,
        siteId: (selectedPage as any)?.siteId || (selectedPage as any)?.id,
        hasSelectedPage: !!selectedPage,
        hasSections: !!(selectedPage as any)?.content?.sections,
        sectionsCount: (selectedPage as any)?.content?.sections?.length || (selectedPage as any)?.content?.pages?.[0]?.sections?.length || 0,
        isHandshakeComplete,
        willRenderViewer: currentView === 'viewer',
        willRenderEmptyScreen: currentView === 'viewer' && !selectedPage,
        reasonIfEmpty: !selectedPage ? "selectedPage is null" : "None"
      });
    }

    if (projectId || currentView !== 'dashboard') {
      saveSession();
    }
  }, [projectId, appId, currentView, selectedPage, activeTab, isHandshakeComplete]);

  // [VIEWER_HANDSHAKE_BYPASS_DEBUG] (FASE 9)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const siteIdParam = params.get('site_id') || params.get('satellite_id');
    const isPublishedMode = params.get('mode') === 'render' || params.get('external_render') === 'true' || window.location.search.includes('debug=products');

    if ((siteIdParam && isPublishedMode) || (window.location.search.includes('debug=products'))) {
      if (!isHandshakeComplete) {
        console.log('[VIEWER_HANDSHAKE_BYPASS_DEBUG]', {
          currentView,
          isPublishedViewer: true,
          shouldWaitForHandshake: false,
          reason: "published viewer detected from URL params (FORCED-V101)"
        });
        
        // Auto-complete handshake after a short delay if it hasn't finished
        const timer = setTimeout(() => {
          if (!isHandshakeComplete) {
            console.warn('[VIEWER_HANDSHAKE_BYPASS] Forzando isHandshakeComplete=true por timeout (V101).');
            setIsHandshakeComplete(true);
            // Only force view if not already in viewer
            if (currentView !== 'viewer') {
              setCurrentView('viewer');
            }
          }
        }, 500); // Shorter timeout
        return () => clearTimeout(timer);
      }
    }
  }, [isHandshakeComplete, currentView]);

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
      
      const allPages = mergePagesByCurrentLifecycle(drafts, published);
      const { launchSiteId, launchSiteStatus } = getLaunchSiteContext();

      if (launchSiteId && (launchSiteStatus === 'draft' || launchSiteStatus === 'unpublished')) {
        allPages.forEach((page) => {
          if (page.siteId === launchSiteId || (page as any).id === launchSiteId) {
            (page as any).status = 'draft';
          }
        });
      }
      
      setPages(allPages);
      return allPages;
    } catch (error) {
      console.error('[DATA] Error refreshing data:', error);
      return [];
    }
  };

  const hydrateProfileAndThemeFromSession = async (payload: any, handshakeFont: string, fallbackTheme: any) => {
    if (!payload.supabase_url || !payload.supabase_anon_key || !payload.session_token) {
      return;
    }

    try {
      (window as any).SOLUTIUM_SUPABASE_SESSION = { access_token: payload.session_token };

      const supabase = initSupabase(
        payload.supabase_url,
        payload.supabase_anon_key,
        payload.session_token
      );

      if (!supabase) return;

      const userResult = await Promise.race([
        supabase.auth.getUser(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase timeout')), 1500))
      ]).catch((error) => ({ data: { user: null }, error }));

      const { data: { user }, error: userError } = userResult as any;
      if (!user || userError) {
        return;
      }

      const mappedProfile = await getProfile(user.id);
      const themeToApply = mappedProfile?.activeTheme || fallbackTheme || 'blue-light';

      if (mappedProfile) {
        setProfile(mappedProfile);
      } else {
        setProfile({
          id: user.id,
          email: user.email,
          role: 'user',
          activeTheme: (typeof themeToApply === 'string' ? themeToApply : 'blue-light') as any
        });
      }

      if (typeof themeToApply === 'object') {
        applyTheme({
          ...themeToApply,
          fontFamily: handshakeFont || themeToApply.fontFamily || themeToApply.font_family
        });
      } else {
        applyTheme(themeToApply);
        if (handshakeFont) applyTheme({ fontFamily: handshakeFont });
      }
    } catch (error) {
      console.warn('[HANDSHAKE] Delayed profile/theme hydration failed:', error);
    }
  };

  const processHandshake = async (payload: any) => {
    try {
      logDebug('[HANDSHAKE] Procesando payload:', payload);
      
      // [APP_MADRE_PRODUCTS_PAYLOAD_FINAL_DEBUG] (FASE 1)
      const sections = payload.sections || payload.content?.sections || payload.site_content?.sections || [];
      const productsSection = sections.find((s: any) => s.type === 'products' || s.tipo === 'products');
      
      if (productsDebugEnabled) {
        console.log('[APP_MADRE_PRODUCTS_PAYLOAD_FINAL_DEBUG]', {
          siteId: payload.site_id,
          projectId: payload.projectId || payload.satellite_id,
          sectionsCount: sections.length,
          productsSectionFound: !!productsSection,
          sectionId: productsSection?.id,
          moduleId: productsSection?.id,
          sectionType: productsSection?.type || productsSection?.tipo,
          contentProductsCount: productsSection?.content?.products?.length || 0,
          contentProductosCount: productsSection?.content?.productos?.length || 0,
          contentItemsCount: productsSection?.content?.items?.length || 0,
          settingsSnapshotCount: productsSection?.settings?.[`${productsSection?.id}_el_products_items_products`]?.length || 0,
          deepKeySnapshotCount: (payload.settingsValues || {})[`${productsSection?.id}_el_products_items_products`]?.length || 0,
          selectedIdsCount: productsSection?.settings?.[`${productsSection?.id}_el_products_config_select_products`]?.length || 0,
          firstProductName: productsSection?.content?.products?.[0]?.name || productsSection?.content?.productos?.[0]?.name,
          payloadTarget: "satellite/viewer",
          timestamp: new Date().toISOString()
        });
      }

      // LOG DE DIAGNÓSTICO SOLICITADO
      logDebug('[CONSTRUCTOR_MESSAGE_RECEIVED_DEBUG]', {
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
        geminiApiKey: payload.gemini_api_key || payload.VITE_GEMINI_API_KEY || null
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

      const handshakeThemeData = payload.activeThemeData;
      const handshakeThemeName = payload.profile?.activeTheme || payload.project?.activeTheme;
      const hasThemeData = handshakeThemeData && Object.keys(handshakeThemeData).length > 0;
      const initialThemeToApply = (hasThemeData ? handshakeThemeData : null) || handshakeThemeName || 'blue-light';

      if (typeof initialThemeToApply === 'object') {
        applyTheme({
          ...initialThemeToApply,
          fontFamily: handshakeFont || initialThemeToApply.fontFamily || initialThemeToApply.font_family
        });
      } else {
        applyTheme(initialThemeToApply);
        if (handshakeFont) applyTheme({ fontFamily: handshakeFont });
      }

      void hydrateProfileAndThemeFromSession(payload, handshakeFont, initialThemeToApply);
      
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

      if (payload.projectId || projectId) {
        const finalProjectId = payload.projectId || projectId;
        setProjectId(finalProjectId);
        
        const handshakeAppId = payload.appId || (payload as any).app_id || '11111111-1111-1111-1111-111111111111';
        setAppId(handshakeAppId);

        const projectPromise = payload.project
          ? Promise.resolve(normalizeIncomingProject(payload.project))
          : finalProjectId
            ? getProject(finalProjectId).then((data) => normalizeIncomingProject(data))
            : Promise.resolve(null);

        const pagesPromise = finalProjectId ? refreshData(finalProjectId) : Promise.resolve([]);
        const [resolvedProject, allPages] = await Promise.all([projectPromise, pagesPromise]);

        if (resolvedProject) {
          setProject(resolvedProject);
          if (resolvedProject.fontFamily || handshakeFont) {
            applyTheme({
              fontFamily: handshakeFont || resolvedProject.fontFamily || undefined
            });
          }
          if (resolvedProject.logoWhiteUrl) {
            setUrlLogoWhite(resolvedProject.logoWhiteUrl);
          }
        }

        if (finalProjectId) {
          const resolvedSiteId = payload.site_id || payload.asset_id || null;

          if (resolvedSiteId) {
            // SIP v7.2: Robust search by either logical siteId or primary key id
            const existingPage = allPages.find(p => p.siteId === resolvedSiteId || (p as any).id === resolvedSiteId);
            let finalPage = existingPage;
            
            // SIP v5.5 (Protocolo 10.2): Robust hydration from payload
            const providedContent = payload.site_content || payload.site_data || payload.content || payload.full_site;
            
            const launchStatus =
              payload.site_status ||
              payload.editor_mode ||
              payload.status ||
              payload.siteStatus ||
              payload.mode;
            const shouldForceDraftLifecycle =
              typeof launchStatus === 'string' &&
              ['draft', 'unpublished'].includes(launchStatus.toLowerCase());

            if (providedContent) {
              logDebug('[GATEWAY] Hidratando sitio desde payload (Protocolo 10.2)');
              finalPage = { 
                ...(existingPage || {}),
                siteId: resolvedSiteId, 
                name: payload.siteName || (existingPage as any)?.name || 'Sitio Remoto',
                content: providedContent,
                isActive: payload.isActive ?? (existingPage as any)?.isActive ?? true,
                status: shouldForceDraftLifecycle ? 'draft' : ((existingPage as any)?.status || 'draft')
              } as any;
            } else if (existingPage) {
              finalPage = shouldForceDraftLifecycle
                ? ({ ...existingPage, status: 'draft' } as any)
                : existingPage;
            } else {
              finalPage = {
                siteId: resolvedSiteId,
                name: payload.siteName || 'Nuevo Sitio',
                status: 'draft'
              } as any;
            }

            setSelectedPage(finalPage);
            
            // Handle rendering modes directly using local variable since state updates are async
            if (payload.force_render || payload.render_mode === 'published') {
              logDebug('[GATEWAY] Forzando renderizado directo:', payload.render_mode);
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
          logDebug('[SESSION] Recuperando sesión persistente:', session);
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
      logDebug(`[GATEWAY v5.2] Detectado renderizado externo para Satélite: ${satelliteId}, Asset: ${assetId}`);
      setProjectId(satelliteId);
      if (assetId) {
        // Preparamos el estado para que el constructor cargue este asset
        setSelectedPage({ siteId: assetId, name: 'Cargando sitio...' } as any);
        setCurrentView('viewer');

        void fetchPublishedSiteById(assetId)
          .then((publishedSite) => {
            const content =
              publishedSite?.content ||
              publishedSite?.content_published ||
              publishedSite?.site_content ||
              publishedSite?.siteContent;

            if (!content) {
              throw new Error('Published site payload has no content');
            }

            const resolvedProjectId =
              publishedSite.projectId ||
              publishedSite.project_id ||
              satelliteId;

            setProjectId(resolvedProjectId);
            setAppId(
              publishedSite.appId ||
              publishedSite.app_id ||
              '11111111-1111-1111-1111-111111111111'
            );
            setSelectedPage({
              id: publishedSite.id,
              projectId: resolvedProjectId,
              appId: publishedSite.appId || publishedSite.app_id,
              siteId: publishedSite.siteId || publishedSite.site_id || assetId,
              siteName: publishedSite.siteName || publishedSite.site_name || 'Sitio publicado',
              name: publishedSite.siteName || publishedSite.site_name || 'Sitio publicado',
              content,
              metadata: publishedSite.metadata,
              isActive: publishedSite.isActive ?? publishedSite.is_active ?? true,
              status: 'published'
            } as any);
            setCurrentView('viewer');
            setIsHandshakeComplete(true);
          })
          .catch((error) => {
            console.error('[PUBLISHED_RENDER_FETCH_ERROR]', error);
            setIsHandshakeComplete(true);
            setCurrentView('viewer');
          });
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
    
    logDebug("--- DIAGNÓSTICO SIP v5.2 ---");
    logDebug("1. window.name contenido:", window.name ? (window.name.substring(0, 50) + "...") : "VACÍO");
    logDebug("2. ¿Tiene abridor (window.opener)?:", !!window.opener);
    logDebug("3. ¿Está en iframe?:", window.parent !== window);
    logDebug("4. URL actual:", window.location.href);
    logDebug("---------------------------------");

    // Expose test function to console for validation
    (window as any).SOLUTIUM_TEST_UPLOAD_ASSET = async () => {
      console.log("%c[SOLUTIUM] Iniciando validación de upload centralizado...", "color: #3b82f6; font-weight: bold;");
      const { uploadAsset } = await import('./services/assetsClient');
      
      try {
        // Crear un pequeño blob de prueba
        const canvas = document.createElement('canvas');
        canvas.width = 100; canvas.height = 100;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#3b82f6';
          ctx.fillRect(0, 0, 100, 100);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px Arial';
          ctx.fillText('CONSOLE TEST', 10, 50);
        }
        const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b || new Blob()), 'image/png'));

        const result = await uploadAsset(blob, {
          projectId: '5210c610-776e-4736-b3f6-5c176e9a771b',
          siteId: '59a75271-2d5a-4c2f-9c8a-c6584b33b755',
          webBuilderSiteId: '77042df2-0c01-46cd-8acc-e874ebade1e4',
          assetType: 'image',
          sourceApp: 'constructor_web',
          fileName: `console-test-${Date.now()}.png`
        });

        console.log("%c[SOLUTIUM] ¡Subida exitosa!", "color: #10b981; font-weight: bold;");
        console.table(result);
        return result;
      } catch (err: any) {
        console.error("[SOLUTIUM] Error en validación:", err.message);
        return { error: err.message };
      }
    };
  }, []);

  useEffect(() => {
    if (handshakeStartedRef.current) return;
    handshakeStartedRef.current = true;
    startHandshake(processHandshake);
  }, []);

  const handleNewPage = () => {
    setSelectedPage(null);
    setSelectedAsset(null);
    setSelectedMethod(null);
    setFormData(null);
    setCurrentView('selection-method');
  };

  const handleSelectMethod = (method: CreationMethod) => {
    setSelectedPage(null);
    setSelectedAsset(null);
    setSelectedMethod(method);
    setCurrentView('constructor');
  };

  const handleSelectAsset = (asset: Asset) => {
    setSelectedPage(null);
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
      
      const allPages = mergePagesByCurrentLifecycle(drafts, published);
      
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
    if (isPublicRenderMode) {
      return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-white">
          <div className="flex items-center justify-center" aria-label="Cargando sitio">
            <div className="h-10 w-10 rounded-full border-[3px] border-slate-200 border-t-slate-500 animate-spin" />
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center gap-6"
        >
          {/* Solutium Isotipo central */}
          <div className="flex items-center justify-center">
            <motion.div
              animate={{
                opacity: [0.92, 1, 0.92]
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="flex items-center justify-center"
            >
              {loadingLogoError ? (
                <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-white shadow-[0_20px_45px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/80">
                  <div className="h-14 w-14 rounded-[18px] bg-gradient-to-br from-[#FF8A1E] to-[#F97316]" />
                </div>
              ) : (
                <img
                  src={CONSTRUCTOR_WEB_LOGO_URL}
                  alt="Constructor Web"
                  className="h-24 w-auto object-contain drop-shadow-[0_20px_45px_rgba(15,23,42,0.08)]"
                  referrerPolicy="no-referrer"
                  onError={() => setLoadingLogoError(true)}
                />
              )}
            </motion.div>
            
            {/* Círculo de Carga animado */}
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm text-slate-500">
              {loadingMessages[loadingMessageIndex]}
            </p>
          </div>
        </motion.div>

        {/* Botón de Emergencia DISCRETO para Desarrollo */}
        {(window.location.hostname.includes('run.app') || window.location.hostname.includes('localhost')) && (
          <div className="absolute bottom-6 opacity-20 hover:opacity-100 transition-opacity">
            <button 
              onClick={() => {
                initSupabase(
                  'https://placeholder-project.supabase.co',
                  'placeholder-key',
                  'placeholder-token'
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
              className="px-4 py-1 text-[10px] uppercase tracking-widest font-bold text-text/40 hover:text-primary transition-colors"
            >
              Skip
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
              setSelectedAsset(null);
              setSelectedMethod(null);
              setFormData(null);
              setCurrentView('dashboard');
            }} 
            onCancelOnboarding={() => {
              setCurrentView('selection-method');
              setSelectedPage(null);
              setSelectedMethod(null);
              setSelectedAsset(null);
              setFormData(null);
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
        logDebug('[CONSTRUCTOR_BEFORE_VIEWER_DEBUG]', {
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
