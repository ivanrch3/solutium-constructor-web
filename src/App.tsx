import React, { useEffect, useState } from 'react';
import { listenForHandshake } from './services/handshakeService';
import { initSupabase } from './services/supabaseClient';
import { initDOClient } from './services/doService';
import { getProfile, getProject } from './services/dataService';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { DataTab } from './components/DataTab';
import { Profile, Project } from './types/schema';

const AppContent: React.FC = () => {
  const [isHandshakeComplete, setIsHandshakeComplete] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [loadingLogoError, setLoadingLogoError] = useState(false);
  const [urlLogo, setUrlLogo] = useState<string | null>(null);
  const { applyTheme } = useTheme();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const logo = params.get('logoUrl') || params.get('logo_url') || params.get('isoUrl') || params.get('iso_url');
    if (logo) setUrlLogo(logo);
    
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

        const handshakeFont = payload.fontFamily || (payload as any).font_family || '';
        console.log('[HANDSHAKE] fontFamily detectada:', handshakeFont);

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
          
          // Prioritize project data from handshake payload if available
          if (payload.project) {
            console.log('[HANDSHAKE] Usando datos de proyecto del payload:', payload.project);
            setProject(payload.project);
          } else {
            const projectData = await getProject(payload.satellite_id);
            if (projectData) setProject(projectData);
          }
        }

        // Fetch user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('Error fetching user:', userError);
          return;
        }

        // Fetch profile using the data service
        const mappedProfile = await getProfile(user.id);

        // Prioritize theme data from handshake payload if available
        const handshakeThemeData = payload.activeThemeData;
        const handshakeThemeName = payload.profile?.activeTheme || payload.project?.activeTheme;
        const themeToApply = handshakeThemeData || handshakeThemeName || mappedProfile?.activeTheme || 'blue-light';

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
          applyTheme({ ...themeToApply, fontFamily: handshakeFont || themeToApply.fontFamily });
        } else {
          applyTheme(themeToApply);
          if (handshakeFont) {
            // If we applied a named theme but have a specific font override
            applyTheme({ fontFamily: handshakeFont });
          }
        }
        
        // Limpiar la URL por seguridad (Ocultar tokens y parámetros)
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

  if (!isHandshakeComplete) {
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
          ) : (
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary font-bold text-3xl animate-pulse">
              S
            </div>
          )}
          
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        
        {import.meta.env.DEV && (
          <div className="absolute bottom-12">
            <button 
              onClick={() => {
                // Initialize Supabase with dummy values for development
                initSupabase(
                  'https://placeholder-project.supabase.co',
                  'placeholder-key',
                  'placeholder-token'
                );
                setProjectId('dev-project');
                setProfile({
                  id: 'dev-user',
                  email: 'dev@solutium.com',
                  role: 'superadmin',
                  activeTheme: 'blue-light'
                });
                applyTheme('blue-light');
                setIsHandshakeComplete(true);
              }}
              className="px-6 py-2.5 bg-surface hover:bg-gray-50 text-gray-600 rounded-xl text-sm font-medium transition-all border border-gray-200 shadow-sm"
            >
              Saltar Handshake (Solo Dev)
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar 
        profile={profile} 
        project={project}
        urlLogo={urlLogo}
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      <main className="flex-1 overflow-auto">
        {activeTab === 'home' && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-text mb-4">Bienvenido a Solutium Satellite</h2>
            <p className="text-gray-600">Has iniciado sesión correctamente.</p>
            <div className="mt-6 p-6 bg-surface rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-2">Tu Perfil</h3>
              <ul className="space-y-2 text-sm">
                <li><span className="font-medium text-gray-500">ID:</span> {profile?.id}</li>
                <li><span className="font-medium text-gray-500">Email:</span> {profile?.email}</li>
                <li><span className="font-medium text-gray-500">Tema:</span> {profile?.activeTheme}</li>
              </ul>
            </div>
          </div>
        )}
        
        {activeTab === 'datos' && profile?.role?.toLowerCase().replace('-', '') === 'superadmin' && (
          <DataTab projectId={projectId} currentUserId={profile?.id || null} />
        )}
        
        {activeTab === 'settings' && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-text mb-4">Ajustes</h2>
            <p className="text-gray-600">Configuración de la aplicación satélite.</p>
          </div>
        )}
      </main>
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
