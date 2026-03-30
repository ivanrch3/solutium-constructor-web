import React, { useEffect, useState } from 'react';
import { listenForHandshake } from './services/handshakeService';
import { initSupabase } from './services/supabaseClient';
import { initDOClient } from './services/doService';
import { getProfile } from './services/dataService';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { DataTab } from './components/DataTab';
import { AssetGenerator } from './components/AssetGenerator';
import { Profile } from './types/schema';

const AppContent: React.FC = () => {
  const [isHandshakeComplete, setIsHandshakeComplete] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const { setTheme } = useTheme();

  useEffect(() => {
    const cleanup = listenForHandshake(async (payload) => {
      try {
        const supabase = initSupabase(
          payload.supabase_url,
          payload.supabase_anon_key,
          payload.session_token
        );

        if (payload.do_endpoint && payload.do_access_key && payload.do_secret_key && payload.do_bucket) {
          initDOClient(
            payload.do_endpoint,
            payload.do_access_key,
            payload.do_secret_key,
            payload.do_bucket
          );
        }

        // Fetch user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('Error fetching user:', userError);
          return;
        }

        // Fetch profile using the data service
        const mappedProfile = await getProfile(user.id);

        if (mappedProfile) {
          setProfile(mappedProfile);
          setTheme(mappedProfile.activeTheme, mappedProfile.fontFamily);
        } else {
          // Fallback profile if fetch or validation fails but handshake succeeded
          const fallbackProfile: Profile = {
            id: user.id,
            role: 'user',
            activeTheme: 'blue-light',
            fontFamily: 'Inter, sans-serif'
          };
          setProfile(fallbackProfile);
          setTheme('blue-light', 'Inter, sans-serif');
        }
        
        setIsHandshakeComplete(true);
      } catch (err) {
        console.error('Handshake processing error:', err);
      }
    });

    // For development/testing without an iframe parent, we can simulate a handshake
    // setTimeout(() => {
    //   window.postMessage({
    //     satellite_id: 'test',
    //     supabase_url: 'https://test.supabase.co',
    //     supabase_anon_key: 'test',
    //     session_token: 'test'
    //   }, '*');
    // }, 1000);

    return cleanup;
  }, [setTheme]);

  if (!isHandshakeComplete) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-text">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <h2 className="text-xl font-semibold">Esperando handshake...</h2>
        <p className="text-gray-500 mt-2">Conectando con la base principal de Solutium</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar 
        role={profile?.role || 'user'} 
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
        
        {activeTab === 'activos' && profile && (
          <div className="p-8">
            <AssetGenerator userId={profile.id} />
          </div>
        )}

        {activeTab === 'datos' && profile?.role === 'superadmin' && (
          <DataTab />
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
