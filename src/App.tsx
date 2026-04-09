import React, { useEffect, useState } from 'react';
import { listenForHandshake } from './services/handshakeService';
import { initSupabase } from './services/supabaseClient';
import { initDOClient } from './services/doService';
import { getProfile, getProject, getWebBuilderSites, getPublishedSites } from './services/dataService';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { DataTab } from './components/DataTab';
import { Dashboard } from './components/Dashboard';
import { MethodSelection, CreationMethod } from './components/MethodSelection';
import { ProjectForm, ProjectFormData } from './components/ProjectForm';
import { WebConstructor } from './components/constructor/WebConstructor';
import { Viewer } from './components/Viewer';
import { Profile, Project, Asset, WebBuilderSite, PublishedSite } from './types/schema';
import { getAssets } from './services/dataService';

type View = 'dashboard' | 'selection-method' | 'form' | 'generator' | 'constructor' | 'viewer';

const AppContent: React.FC = () => {
  const [isHandshakeComplete, setIsHandshakeComplete] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const logo = params.get('logoUrl') || params.get('logo_url') || params.get('isoUrl') || params.get('iso_url');
    if (logo) setUrlLogo(logo);

    const logoWhite = params.get('logoWhiteUrl') || params.get('logo_white_url');
    if (logoWhite) setUrlLogoWhite(logoWhite);
    
    const fontParam = params.get('fontFamily') || params.get('font_family');
    if (fontParam) {
      applyTheme({ fontFamily: fontParam });
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
    
    console.log("--- DIAGNÓSTICO DE EMERGENCIA ---");
    console.log("1. window.name contenido:", window.name ? (window.name.substring(0, 50) + "...") : "VACÍO");
    console.log("2. ¿Tiene abridor (window.opener)?:", !!window.opener);
    console.log("3. ¿Está en iframe?:", window.parent !== window);
    console.log("4. URL actual:", window.location.href);
    console.log("---------------------------------");
  }, []);

  useEffect(() => {
    const cleanup = listenForHandshake(async (payload) => {
      try {
        const supabase = initSupabase(
          payload.supabase_url,
          payload.supabase_anon_key,
          payload.session_token
        );

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
          payload.activeThemeData?.theme?.fontFamily ||
          payload.activeThemeData?.theme?.font_family ||
          (payload as any).theme?.fontFamily ||
          (payload as any).theme?.font_family ||
          (payload as any).theme_data?.fontFamily ||
          (payload as any).theme_data?.font_family ||
          payload.profile?.fontFamily ||
          payload.profile?.font_family ||
          payload.profile?.font ||
          '';

        console.log('[HANDSHAKE] fontFamily detectada:', handshakeFont || 'NINGUNA (vacia)');
        
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

        if (payload.do_endpoint && payload.do_access_key && payload.do_secret_key && payload.do_bucket) {
          initDOClient(
            payload.do_endpoint,
            payload.do_access_key,
            payload.do_secret_key,
            payload.do_bucket
          );
        }

        if (payload.satellite_id) {
          setProjectId(payload.satellite_id);
          
          if (payload.project) {
            setProject(payload.project);
            if (payload.project.logoWhiteUrl || payload.project.logo_white_url) {
              setUrlLogoWhite(payload.project.logoWhiteUrl || payload.project.logo_white_url);
            }
          } else {
            const projectData = await getProject(payload.satellite_id);
            if (projectData) {
              setProject(projectData);
              if (projectData.logoWhiteUrl) {
                setUrlLogoWhite(projectData.logoWhiteUrl);
              }
            }
          }

          // Fetch assets for the project
          const projectAssets = await getAssets(payload.satellite_id, 'web_page');
          setAssets(projectAssets);

          // Fetch pages (drafts and published)
          const [drafts, published] = await Promise.all([
            getWebBuilderSites(payload.satellite_id),
            getPublishedSites(payload.satellite_id)
          ]);
          
          // Combine and sort by updatedAt
          const allPages = [...drafts, ...published].sort((a, b) => {
            const dateA = new Date(a.updatedAt || 0).getTime();
            const dateB = new Date(b.updatedAt || 0).getTime();
            return dateB - dateA;
          });
          setPages(allPages);
        }

        // Fetch user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('Error fetching user:', userError);
          return;
        }

        const mappedProfile = await getProfile(user.id);
        const handshakeThemeData = payload.activeThemeData;
        const handshakeThemeName = payload.profile?.activeTheme || payload.project?.activeTheme;
        
        // Solo usamos handshakeThemeData si tiene propiedades, de lo contrario preferimos el nombre o el perfil
        const hasThemeData = handshakeThemeData && Object.keys(handshakeThemeData).length > 0;
        const themeToApply = (hasThemeData ? handshakeThemeData : null) || handshakeThemeName || mappedProfile?.activeTheme || 'blue-light';

        if (mappedProfile) {
          setProfile(mappedProfile);
        } else {
          const fallbackProfile: Profile = {
            id: user.id,
            email: user.email,
            role: 'user',
            activeTheme: (typeof themeToApply === 'string' ? themeToApply : 'blue-light') as any
          };
          setProfile(fallbackProfile);
        }

        // Apply theme
        if (typeof themeToApply === 'object') {
          applyTheme({ 
            ...themeToApply, 
            fontFamily: handshakeFont || themeToApply.fontFamily || themeToApply.font_family 
          });
        } else {
          applyTheme(themeToApply);
          if (handshakeFont) {
            applyTheme({ fontFamily: handshakeFont });
          }
        }
        
        if (window.history && window.history.replaceState) {
          const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
          window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
        }
        
        setIsHandshakeComplete(true);
      } catch (err) {
        console.error('Handshake processing error:', err);
      }
    });

    return cleanup;
  }, [applyTheme]);

  const handleNewPage = () => {
    setCurrentView('selection-method');
  };

  const handleSelectMethod = (method) => {
    setSelectedMethod(method);
    setCurrentView('form');
  };

  const handleFormSubmit = (data: ProjectFormData) => {
    setFormData(data);
    if (selectedMethod === 'ai') {
      setCurrentView('generator');
    } else {
      setCurrentView('constructor');
    }
  };

  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setCurrentView('constructor');
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
          <div className="text-center space-y-2">
            <p className="text-text/80">Sincronizando con Solutium...</p>
          </div>
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
                  'https://nyc3.digitaloceanspaces.com',
                  'mock-key',
                  'mock-secret',
                  'mock-bucket'
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
            onBackToDashboard={() => {
              setSelectedPage(null);
              setCurrentView('dashboard');
            }} 
            projectId={projectId} 
            currentUserId={profile?.id || null}
            logoUrl={urlLogo}
            logoWhiteUrl={urlLogoWhite}
            project={project}
            initialPage={selectedPage}
          />
        );
      case 'viewer':
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
