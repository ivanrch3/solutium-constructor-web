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
  const { applyTheme } = useTheme();

  useEffect(() => {
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
          const projectData = await getProject(payload.satellite_id);
          if (projectData) setProject(projectData);
        }

        // Fetch user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('Error fetching user:', userError);
          return;
        }

        // Fetch profile using the data service
        const mappedProfile = await getProfile(user.id);

        // Prioritize theme from handshake payload if available
        const handshakeTheme = payload.profile?.activeTheme || payload.project?.activeTheme;
        const themeToApply = handshakeTheme || mappedProfile?.activeTheme || 'blue-light';

        if (mappedProfile) {
          setProfile(mappedProfile);
        } else {
          const fallbackProfile: Profile = {
            id: user.id,
            role: 'user',
            activeTheme: themeToApply as any
          };
          setProfile(fallbackProfile);
        }

        // Apply theme with font from handshake
        applyTheme(themeToApply);
        if (handshakeFont) {
          document.documentElement.style.setProperty('--font-family', handshakeFont);
          document.body.style.fontFamily = handshakeFont;
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-text">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <h2 className="text-xl font-semibold">Esperando handshake...</h2>
        <p className="text-gray-500 mt-2">Conectando con la base principal de Solutium</p>
        
        {import.meta.env.DEV && (
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
                role: 'superadmin',
                activeTheme: 'blue-light'
              });
              applyTheme('blue-light');
              setIsHandshakeComplete(true);
            }}
            className="mt-8 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-sm transition-colors border border-gray-300"
          >
            Saltar Handshake (Solo Dev)
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar 
        profile={profile} 
        project={project}
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
                <li><span className="font-medium text-gray-500">Rol:</span> <span className="capitalize">{profile?.role}</span></li>
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
