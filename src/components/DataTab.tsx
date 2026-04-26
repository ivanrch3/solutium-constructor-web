import React, { useState, useEffect } from 'react';
import { getProfiles, getProjects, getCustomers, getProducts } from '../services/dataService';
import { syncAsset } from '../services/assetService';
import { isStorageReady } from '../services/doService';
import { 
  Users, 
  Briefcase, 
  UserCheck, 
  Package, 
  Settings2, 
  CheckCircle2, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Database,
  Cloud,
  FileText,
  Clock,
  ExternalLink,
  RefreshCw,
  Search
} from 'lucide-react';

type SubTab = 'profiles' | 'projects' | 'customers' | 'products' | 'test';

interface DataTabProps {
  projectId: string | null;
  currentUserId: string | null;
}

export const DataTab: React.FC<DataTabProps> = ({ projectId, currentUserId }) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('profiles');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [storageStatus, setStorageStatus] = useState<boolean>(false);
  const pageSize = 12; // Adjusted for grid layout

  const fetchData = async (tab: SubTab, pageIndex: number) => {
    if (!projectId || !currentUserId) {
      setData([]);
      return;
    }

    setLoading(true);
    try {
      let result: any[] = [];
      switch (tab) {
        case 'profiles':
          result = await getProfiles(pageIndex, pageSize, projectId, currentUserId);
          break;
        case 'projects':
          result = await getProjects(pageIndex, pageSize, projectId);
          break;
        case 'customers':
          result = await getCustomers(pageIndex, pageSize, projectId);
          break;
        case 'products':
          result = await getProducts(pageIndex, pageSize, projectId);
          break;
      }
      setData(result);
    } catch (err) {
      console.error('Unexpected error fetching data:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activeSubTab, page);
    setStorageStatus(isStorageReady());
  }, [activeSubTab, page, projectId, currentUserId]);

  // Periodic check for storage status
  useEffect(() => {
    const interval = setInterval(() => {
      setStorageStatus(isStorageReady());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTabChange = (tab: SubTab) => {
    setActiveSubTab(tab);
    setPage(0);
    setSearchTerm('');
  };

  const handleTestSync = async () => {
    if (!projectId) {
      setTestResult({ success: false, message: 'No hay un proyecto activo para la prueba.' });
      return;
    }

    setLoading(true);
    setTestResult(null);
    try {
      const testEntity = {
        id: `test_${Date.now()}`,
        projectId: projectId,
        status: 'testing',
        customerName: 'Prueba de Sistema'
      };

      const testContent = `Archivo de prueba generado el ${new Date().toLocaleString()}`;
      const url = await syncAsset(
        testEntity,
        'test',
        testContent,
        'txt',
        'text/plain',
        'Prueba de Sincronización'
      );

      setTestResult({ 
        success: true, 
        message: `¡Prueba exitosa! Archivo subido y registrado. URL: ${url}` 
      });
    } catch (err) {
      console.error('Error en la prueba de sincronización:', err);
      setTestResult({ 
        success: false, 
        message: err instanceof Error ? err.message : 'Error desconocido en la prueba.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: SubTab; label: string; icon: any }[] = [
    { id: 'profiles', label: 'Perfiles', icon: Users },
    { id: 'projects', label: 'Proyectos', icon: Briefcase },
    { id: 'customers', label: 'Clientes', icon: UserCheck },
    { id: 'products', label: 'Productos', icon: Package },
    { id: 'test', label: 'Sincronización', icon: RefreshCw },
  ];

  const filteredData = Array.isArray(data) ? data.filter(item => {
    if (!item) return false;
    if (!searchTerm) return true;
    return Object.values(item).some(val => 
      String(val || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }) : [];

  const renderCard = (item: any, type: SubTab) => {
    if (!item) return null;

    // FIND icon safely
    const tabConfig = tabs.find(t => t.id === type);
    const Icon = tabConfig?.icon || Database;

    // Custom card content based on type
    const title = item.name || item.fullName || item.label || item.id || 'Sin nombre';
    const subtitle = item.email || item.category || item.status || (type === 'projects' ? item.clientName : '') || 'Sin detalles';
    const date = item.createdAt || item.created_at;

    return (
      <div 
        key={item.id || Math.random().toString()} 
        className="bg-surface rounded-xl border border-border/20 p-5 hover:border-primary/40 hover:shadow-lg transition-all group relative overflow-hidden flex flex-col h-full"
      >
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
          <Icon size={48} />
        </div>

        <div className="flex items-start justify-between mb-4">
          <div className="p-2.5 rounded-lg bg-secondary text-primary">
            <Icon size={20} />
          </div>
          {item.status && (
            <span className={`text-[10px] uppercase font-black px-2 py-1 rounded-full ${
              item.status === 'activo' || item.status === 'active' || item.status === 'completed' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-slate-100 text-slate-500'
            }`}>
              {item.status}
            </span>
          )}
        </div>

        <h3 className="font-bold text-text mb-1 truncate pr-8" title={title}>{title}</h3>
        <p className="text-sm text-text/60 mb-4 truncate">{subtitle}</p>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/10">
          <div className="flex items-center gap-2 text-[11px] text-text/40">
            <Clock size={12} />
            {date ? new Date(date).toLocaleDateString() : 'Sin fecha'}
          </div>
          <button className="text-primary hover:text-primary/80">
            <ExternalLink size={14} />
          </button>
        </div>

        <div className="hidden group-hover:block absolute bottom-0 left-0 right-0 h-1 bg-primary/20" />
      </div>
    );
  };

  return (
    <div className="p-8 h-full flex flex-col bg-secondary/30">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Database className="text-primary" size={28} />
            <h2 className="text-2xl font-black text-text tracking-tight uppercase">Base de Datos</h2>
          </div>
          <p className="text-text/50 text-sm">Gestiona y visualiza la información sincronizada del proyecto.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
            storageStatus 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : 'bg-red-50 text-red-700 border-red-200 animate-pulse'
          }`}>
            <Cloud size={14} />
            <span>Storage: {storageStatus ? 'Conectado' : 'Desconectado'}</span>
          </div>
          
          {activeSubTab !== 'test' && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text/30" size={16} />
              <input 
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-surface border border-border/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all w-64"
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="flex gap-2 mb-8 bg-surface/50 p-1 rounded-xl border border-border/10 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeSubTab === tab.id 
                  ? 'bg-surface text-primary shadow-sm ring-1 ring-border/20' 
                  : 'text-text/40 hover:text-text hover:bg-surface/50'
              }`}
            >
              <Icon size={18} />
              <span className="hidden @md:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>
      
      <div className="flex-1 overflow-auto min-h-0 pr-2 custom-scrollbar">
        {activeSubTab === 'test' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center h-full">
            <div className="bg-surface rounded-2xl border border-border/20 p-10 shadow-sm">
              <div className="p-4 rounded-xl bg-primary/5 text-primary w-fit mb-6">
                <RefreshCw size={32} />
              </div>
              <h3 className="text-2xl font-black mb-4 text-text uppercase tracking-tight">Sincronización Multi-Sitio</h3>
              <p className="text-text/60 mb-8 leading-relaxed">
                Esta herramienta valida la integridad de la conexión entre el Constructor Web, Supabase y Digital Ocean Spaces.
                Sigue el estándar SIP v5.4 para asegurar que los activos generados aquí sean accesibles por la Aplicación Madre.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4 p-4 rounded-xl border border-border/10 bg-secondary/20">
                  <div className="text-primary mt-1"><CheckCircle2 size={16} /></div>
                  <div>
                    <h4 className="text-sm font-bold uppercase text-text/80 mb-1">Paso 1: Generación</h4>
                    <p className="text-xs text-text/50">Crea un activo de prueba con metadatos específicos.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl border border-border/10 bg-secondary/20">
                  <div className="text-primary mt-1"><CheckCircle2 size={16} /></div>
                  <div>
                    <h4 className="text-sm font-bold uppercase text-text/80 mb-1">Paso 2: Almacenamiento</h4>
                    <p className="text-xs text-text/50">Sube el archivo vía S3 (DO Spaces) usando el proxy seguro.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl border border-border/10 bg-secondary/20">
                  <div className="text-primary mt-1"><CheckCircle2 size={16} /></div>
                  <div>
                    <h4 className="text-sm font-bold uppercase text-text/80 mb-1">Paso 3: Registro</h4>
                    <p className="text-xs text-text/50">Notifica a Supabase sobre el nuevo activo sincronizado.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleTestSync}
                disabled={loading}
                className="w-full bg-primary text-white font-black py-4 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="animate-spin" size={20} /> : <Database size={20} />}
                {loading ? 'SINCRONIZANDO...' : 'EJECUTAR PRUEBA DE ALTA FIDELIDAD'}
              </button>

              {testResult && (
                <div className={`mt-8 p-6 rounded-xl border-2 animate-in fade-in slide-in-from-top-2 ${
                  testResult.success 
                    ? 'bg-green-50/50 border-green-200 text-green-800' 
                    : 'bg-red-50/50 border-red-200 text-red-800'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    {testResult.success ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                    <span className="text-lg font-black uppercase">{testResult.success ? 'Diagnóstico Positivo' : 'Fallo de Handshake'}</span>
                  </div>
                  <p className="text-sm leading-relaxed font-medium break-words opacity-80">{testResult.message}</p>
                </div>
              )}
            </div>

            <div className="hidden lg:flex flex-col items-center justify-center p-12 text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <Cloud size={120} className="text-primary relative animate-bounce" style={{ animationDuration: '3s' }} />
              </div>
              <h4 className="text-xl font-bold mt-8 mb-4 text-text/80">Monitor de Ecosistema</h4>
              <p className="text-text/40 text-sm max-w-sm">
                La Aplicación Madre (Solutium) actúa como orquestador. Las credenciales deben ser inyectadas mediante el handshake seguro para activar los servicios de nube.
              </p>
            </div>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <RefreshCw className="animate-spin text-primary" size={40} />
            <p className="text-text/40 font-bold uppercase tracking-widest text-xs">Cargando Datos...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 p-8 bg-surface rounded-2xl border border-dashed border-border/40">
            <div className="p-4 rounded-full bg-secondary/50 text-text/20">
              <Settings2 size={48} />
            </div>
            <p className="text-text/40 font-medium">No se encontraron registros para esta categoría.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 @md:grid-cols-2 @2xl:grid-cols-3 @4xl:grid-cols-4 gap-6 pb-8">
            {filteredData.map(item => renderCard(item, activeSubTab))}
          </div>
        )}
      </div>
      
      {activeSubTab !== 'test' && (
        <div className="mt-8 flex items-center justify-between bg-surface p-4 rounded-xl border border-border/10 shadow-sm">
          <div className="text-sm text-text/40 font-medium">
            Mostrando <span className="font-bold text-text/60">{filteredData.length}</span> resultados de la página <span className="font-bold text-text/60">{page + 1}</span>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
              className="p-2 rounded-lg border border-border/20 text-text/60 hover:bg-secondary disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => setPage(p => p + 1)}
              disabled={data.length < pageSize || loading}
              className="p-2 rounded-lg border border-border/20 text-text/60 hover:bg-secondary disabled:opacity-30 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
