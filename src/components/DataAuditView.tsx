import React, { useState, useEffect } from 'react';
import { 
  Database, 
  ShieldCheck, 
  Lock, 
  User, 
  Users, 
  Briefcase, 
  LayoutGrid, 
  Users2, 
  Package, 
  Calendar, 
  Box, 
  Info, 
  AlertCircle,
  Clock,
  Tag,
  FileJson,
  CheckCircle2,
  XCircle,
  Megaphone
} from 'lucide-react';
import { SolutiumPayload } from '../lib/solutium-sdk';

interface DataAuditViewProps {
  config: SolutiumPayload | null;
}

export const DataAuditView: React.FC<DataAuditViewProps> = ({ config }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [crmDataState, setCrmDataState] = useState(config?.crmData || { customers: [], leads: [] });
  const [productsDataState, setProductsDataState] = useState(config?.productsData || { products: [] });

  useEffect(() => {
    if (config?.crmData) setCrmDataState(config.crmData);
    if (config?.productsData) setProductsDataState(config.productsData);
  }, [config]);

  const environment = config?.environment || 'production';

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User, scope: 'profile' },
    { id: 'project', label: 'Proyecto', icon: Briefcase, scope: 'project' },
    { id: 'team', label: 'Equipo', icon: Users, scope: 'project' }, // Scope project covers team
    { id: 'crm', label: 'Clientes', icon: Users2, scope: 'crm' },
    { id: 'products', label: 'Productos', icon: Package, scope: 'products' },
    { id: 'calendar', label: 'Agenda', icon: Calendar, scope: 'calendar' },
    { id: 'assets', label: 'Activos', icon: Box, scope: 'assets' },
  ];

  const renderLockedState = (scope: string) => (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-background/50 rounded-3xl border border-dashed border-text/10">
      <div className="w-16 h-16 bg-text/5 rounded-full flex items-center justify-center mb-4">
        <Lock className="w-8 h-8 text-text/20" />
      </div>
      <h3 className="text-xl font-bold text-text mb-2">Aplicación no autorizada</h3>
      <p className="text-text/60 max-w-md">
        El satellite no tiene los permisos necesarios para acceder a esta información. 
        El scope <code className="px-1.5 py-0.5 bg-text/5 rounded text-primary font-mono text-sm">'{scope}'</code> no está habilitado.
      </p>
    </div>
  );

  const renderEmptyState = (message: string, Icon: any) => (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-primary/40" />
      </div>
      <p className="text-text/60 font-medium">{message}</p>
    </div>
  );

  const renderJson = (data: any) => (
    <div className="bg-background border border-text/10 rounded-xl p-4 overflow-x-auto custom-scrollbar">
      <pre className="text-xs font-mono text-text/80 leading-relaxed">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );

  const renderTabContent = () => {
    const currentTab = tabs.find(t => t.id === activeTab);
    if (!currentTab) return null;

    const isAuthorized = config?.scopes?.includes(currentTab.scope);
    if (!isAuthorized) return renderLockedState(currentTab.scope);

    switch (activeTab) {
      case 'profile':
        if (!config?.userProfile) return renderEmptyState('Sin datos disponibles', User);
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface p-6 rounded-2xl border border-text/5 shadow-sm">
              <h4 className="text-sm font-bold text-text/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Info className="w-4 h-4" /> Información de Usuario
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-text/30 uppercase tracking-tighter">Nombre Completo</label>
                  <p className="text-lg font-bold text-text">{config.userProfile.name}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text/30 uppercase tracking-tighter">Correo Electrónico</label>
                  <p className="text-text/80">{config.userProfile.email}</p>
                </div>
                {config.userProfile.avatar && (
                  <div>
                    <label className="text-[10px] font-bold text-text/30 uppercase tracking-tighter">Avatar URL</label>
                    <p className="text-xs text-primary truncate">{config.userProfile.avatar}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-surface p-6 rounded-2xl border border-text/5 shadow-sm">
              <h4 className="text-sm font-bold text-text/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                <FileJson className="w-4 h-4" /> Raw Payload
              </h4>
              {renderJson(config.userProfile)}
            </div>
          </div>
        );

      case 'project':
        const projectData = config?.projectData;
        const activeProjects = config?.activeProjects;
        
        if (!projectData && (!activeProjects || activeProjects.length === 0)) {
          return renderEmptyState('Sin datos disponibles', Briefcase);
        }

        return (
          <div className="space-y-8">
            {/* Datos Básicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface p-6 rounded-2xl border border-text/5 shadow-sm">
                <h4 className="text-sm font-bold text-text/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Datos del Proyecto
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-text/30 uppercase tracking-tighter">Nombre</label>
                    <p className="text-lg font-bold text-text">{projectData?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-text/30 uppercase tracking-tighter">Tipografía</label>
                    <p className="text-text/80">{projectData?.fontFamily || 'Default'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-text/30 uppercase tracking-tighter">Colores (Hex)</label>
                    <div className="flex gap-2 mt-1">
                      {projectData?.colors?.map((c, i) => (
                        <div key={i} className="w-6 h-6 rounded-full border border-text/10" style={{ backgroundColor: c }} title={c} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-surface p-6 rounded-2xl border border-text/5 shadow-sm">
                <h4 className="text-sm font-bold text-text/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Configuración Social
                </h4>
                {projectData?.socials ? renderJson(projectData.socials) : renderEmptyState('Sin Redes Sociales', AlertCircle)}
              </div>
            </div>

            {/* Proyectos Activos */}
            <div>
              <h4 className="text-sm font-bold text-text/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                <LayoutGrid className="w-4 h-4" /> Proyectos Activos
              </h4>
              {activeProjects && activeProjects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeProjects.map((proj: any, idx: number) => (
                    <div key={idx} className="bg-surface p-5 rounded-2xl border border-text/5 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                          <LayoutGrid className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-[10px] font-mono bg-text/5 px-2 py-1 rounded text-text/40">#{proj.id?.slice(0, 8)}</span>
                      </div>
                      <h5 className="font-bold text-text mb-1">{proj.name}</h5>
                      <p className="text-xs text-text/40 truncate">{proj.description || 'Sin descripción'}</p>
                      <div className="mt-4 pt-4 border-t border-text/5 flex items-center justify-between">
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${proj.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-text/5 text-text/40'}`}>
                          {proj.status || 'Unknown'}
                        </span>
                        <span className="text-[9px] text-text/30 font-mono">{proj.updatedAt ? new Date(proj.updatedAt).toLocaleDateString() : ''}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-surface/50 border border-dashed border-text/10 rounded-2xl p-8 text-center">
                  <p className="text-xs text-text/40 font-medium">No hay proyectos activos registrados</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'team':
        const teamMembers = config?.teamMembers;
        if (!teamMembers || teamMembers.length === 0) {
          return renderEmptyState('Sin datos disponibles', Users);
        }
        return (
          <div>
            <h4 className="text-sm font-bold text-text/40 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" /> Equipo de Trabajo
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.map((member: any, idx: number) => (
                <div key={idx} className="bg-surface p-4 rounded-2xl border border-text/5 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                    {member.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-bold text-text">{member.name}</p>
                    <p className="text-xs text-text/40">{member.role || 'Sin rol'}</p>
                    <p className="text-[10px] text-text/60 mt-1">{member.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'crm':
        console.log('DEBUG CRM Data:', crmDataState);
        const crmData = crmDataState?.customers || [];
        const leads = crmDataState?.leads || [];
        
        // --- HERRAMIENTA DE DIAGNÓSTICO ---
        console.log('DIAGNÓSTICO UI: ¿Qué recibe el componente de clientes?', { crmData, leads });
        // -----------------------------------
        
        if (crmData.length === 0 && leads.length === 0) {
          return renderEmptyState('Sin datos disponibles', Users2);
        }

        return (
          <div className="space-y-8">
            {/* Clientes */}
            <div className="bg-surface p-6 rounded-2xl border border-text/5 shadow-sm">
              <h4 className="text-sm font-bold text-text/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Users2 className="w-4 h-4" /> Clientes Sincronizados
              </h4>
              {crmData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-text/5">
                        <th className="py-3 px-4 text-[10px] font-bold text-text/30 uppercase tracking-widest">Nombre</th>
                        <th className="py-3 px-4 text-[10px] font-bold text-text/30 uppercase tracking-widest">Email</th>
                        <th className="py-3 px-4 text-[10px] font-bold text-text/30 uppercase tracking-widest">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {crmData.map((customer: any, idx: number) => (
                        <tr key={idx} className="border-b border-text/5 hover:bg-text/5 transition-colors">
                          <td className="py-3 px-4 text-sm font-bold text-text">{customer.name}</td>
                          <td className="py-3 px-4 text-sm text-text/60">{customer.email}</td>
                          <td className="py-3 px-4">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-primary/10 text-primary rounded">
                              {customer.status || 'Active'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-text/30 italic text-sm">No hay clientes registrados</div>
              )}
            </div>

            {/* Leads */}
            <div className="bg-surface p-6 rounded-2xl border border-text/5 shadow-sm">
              <h4 className="text-sm font-bold text-text/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Megaphone className="w-4 h-4" /> Leads Recientes
              </h4>
              {leads.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {leads.map((lead: any, idx: number) => (
                    <div key={idx} className="p-4 bg-background rounded-xl border border-text/5 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-text">{lead.name || lead.email}</p>
                        <p className="text-[10px] text-text/40">{lead.source || 'Directo'}</p>
                      </div>
                      <span className="text-[10px] font-mono text-text/30">{lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : ''}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-text/30 italic text-sm">No hay leads registrados</div>
              )}
            </div>

            <div className="bg-surface p-6 rounded-2xl border border-text/5 shadow-sm">
              <h4 className="text-sm font-bold text-text/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                <FileJson className="w-4 h-4" /> CRM Metadata
              </h4>
              {renderJson({ apiUrl: config?.crmData?.apiUrl, customersCount: crmData.length, leadsCount: leads.length })}
            </div>
          </div>
        );

      case 'products':
        console.log('DEBUG Products Data:', productsDataState);
        const products = productsDataState?.products || [];
        if (products.length > 0) {
            console.log('DEBUG First Product Structure:', products[0]);
        }
        
        if (products.length === 0) {
          return renderEmptyState('Sin datos disponibles', Package);
        }
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product: any, idx: number) => (
              <div key={idx} className="bg-surface p-4 rounded-2xl border border-text/5 shadow-sm">
                <div className="aspect-square bg-background rounded-xl mb-3 overflow-hidden border border-text/5">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-text/10" />
                    </div>
                  )}
                </div>
                <h5 className="font-bold text-text text-sm truncate">{product.name}</h5>
                <p className="text-primary font-bold mt-1">${product.price}</p>
                <p className="text-[10px] text-text/40 mt-2 line-clamp-2">{product.description}</p>
              </div>
            ))}
          </div>
        );

      case 'calendar':
        const calendarConfig = config?.calendarConfig;
        if (!calendarConfig) return renderEmptyState('Sin datos disponibles', Calendar);
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface p-6 rounded-2xl border border-text/5 shadow-sm">
              <h4 className="text-sm font-bold text-text/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Configuración de Agenda
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-text/30 uppercase tracking-tighter">Zona Horaria</label>
                  <p className="text-text/80">{calendarConfig.timezone || 'UTC'}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text/30 uppercase tracking-tighter">Días Laborales</label>
                  <div className="flex gap-1 mt-1">
                    {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, i) => (
                      <div key={i} className={`w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold ${calendarConfig.workingDays?.includes(i+1) ? 'bg-primary text-white' : 'bg-text/5 text-text/30'}`}>
                        {day}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-surface p-6 rounded-2xl border border-text/5 shadow-sm">
              <h4 className="text-sm font-bold text-text/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Horarios
              </h4>
              <div className="flex items-center justify-between p-3 bg-background rounded-xl border border-text/5">
                <span className="text-xs font-bold text-text/60">Apertura</span>
                <span className="text-sm font-mono font-bold text-primary">{calendarConfig.openingTime || '09:00'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-background rounded-xl border border-text/5 mt-2">
                <span className="text-xs font-bold text-text/60">Cierre</span>
                <span className="text-sm font-mono font-bold text-primary">{calendarConfig.closingTime || '18:00'}</span>
              </div>
            </div>
          </div>
        );

      case 'assets':
        const currentAsset = config?.currentAsset;
        if (!currentAsset) return renderEmptyState('Sin datos disponibles', Box);
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-surface p-6 rounded-2xl border border-text/5 shadow-sm">
                  <h4 className="text-sm font-bold text-text/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Box className="w-4 h-4" /> Detalles del Activo
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-bold text-text/30 uppercase tracking-tighter">Nombre</label>
                      <p className="text-lg font-bold text-text">{currentAsset.name}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-text/30 uppercase tracking-tighter">UUID</label>
                      <p className="text-xs font-mono text-text/60 break-all">{currentAsset.id}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-text/30 uppercase tracking-tighter">Tipo</label>
                      <p className="text-sm font-bold text-text">{currentAsset.type}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-text/30 uppercase tracking-tighter">Estado</label>
                      <div className="flex items-center gap-2 mt-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Sincronizado</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-surface p-6 rounded-2xl border border-text/5 shadow-sm">
                  <h4 className="text-sm font-bold text-text/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Tag className="w-4 h-4" /> Etiquetas y Metadatos
                  </h4>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {['S.I.P. v2', 'Satellite', 'Mother App', 'Auto-sync'].map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-background border border-text/10 rounded-full text-[10px] font-bold text-text/60">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text/30 uppercase tracking-tighter">Metadata JSON</label>
                    {renderJson(currentAsset.data || {})}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-surface p-6 rounded-2xl border border-text/5 shadow-sm">
                  <h4 className="text-sm font-bold text-text/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <User className="w-4 h-4" /> Autoría
                  </h4>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                      {config.userProfile?.name?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text">{config.userProfile?.name || 'Admin'}</p>
                      <p className="text-[10px] text-text/40">Última edición hoy</p>
                    </div>
                  </div>
                </div>
                <div className="bg-surface p-6 rounded-2xl border border-text/5 shadow-sm">
                  <h4 className="text-sm font-bold text-text/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Historial
                  </h4>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-px bg-text/10 relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text">Creado</p>
                        <p className="text-[10px] text-text/40">{new Date(config.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-px bg-text/10 relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary/40" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text">Sincronizado</p>
                        <p className="text-[10px] text-text/40">Hace unos segundos</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-8 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Database className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-black text-text tracking-tight">Auditoría de Datos (S.I.P.)</h1>
          </div>
          <p className="text-text/60 font-medium">Inspección técnica de los datos inyectados desde la App Madre.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/10 rounded-full">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Modo Administrador</span>
          </div>
          <div className="px-4 py-2 bg-text/5 border border-text/10 rounded-full">
            <span className="text-xs font-mono font-bold text-text/60 uppercase">{environment}</span>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 p-1 bg-surface border border-text/10 rounded-2xl mb-8 overflow-x-auto custom-scrollbar no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isAuthorized = config?.scopes?.includes(tab.scope);
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-text/40 hover:text-text/60 hover:bg-text/5'
              }`}
            >
              <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : 'text-text/30'}`} />
              {tab.label}
              {!isAuthorized && <Lock className="w-3 h-3 opacity-40" />}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <main className="animate-in slide-in-from-bottom-4 duration-500">
        {renderTabContent()}
      </main>

      {/* Footer Info */}
      <footer className="mt-12 pt-8 border-t border-text/5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-text/30">
          <Info className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Protocolo S.I.P. v3.0 Active Connection</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">En Línea</span>
          </div>
          <span className="text-[10px] font-mono text-text/20">Last Sync: {new Date().toLocaleTimeString()}</span>
        </div>
      </footer>
    </div>
  );
};
