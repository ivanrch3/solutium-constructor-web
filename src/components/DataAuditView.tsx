import React, { useState, useEffect, useMemo } from 'react';
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
  Megaphone,
  Link2
} from 'lucide-react';
import { SolutiumPayload } from '../lib/solutium-sdk';

interface DataAuditViewProps {
  config: SolutiumPayload | null;
}

export const DataAuditView: React.FC<DataAuditViewProps> = ({ config }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [customers_data_state, setCustomersDataState] = useState<any[]>(config?.customers_data || []);
  const [products_data_state, setProductsDataState] = useState<any[]>(config?.products_data || []);
  const [assets_data_state, setAssetsDataState] = useState<any[]>(config?.assets_data || []);
  const [profiles_data_state, setProfilesDataState] = useState<any[]>(config?.profiles_data || []);
  const [team_members_data_state, setTeamMembersDataState] = useState<any[]>(config?.team_members_data || []);
  const [projects_data_state, setProjectsDataState] = useState<any[]>(config?.projects_data || []);
  const [integrations_data_state, setIntegrationsDataState] = useState<any[]>(config?.integrations_data || []);
  const [inspectedRow, setInspectedRow] = useState<any | null>(null);

  useEffect(() => {
    if (config?.customers_data) setCustomersDataState(config.customers_data);
    if (config?.products_data) setProductsDataState(config.products_data);
    if (config?.assets_data) setAssetsDataState(config.assets_data);
    if (config?.profiles_data) setProfilesDataState(config.profiles_data);
    if (config?.team_members_data) setTeamMembersDataState(config.team_members_data);
    if (config?.projects_data) setProjectsDataState(config.projects_data);
    if (config?.integrations_data) setIntegrationsDataState(config.integrations_data);
  }, [config]);

  const environment = config?.environment || 'production';

  const tabs = useMemo(() => {
    return [
      { id: 'profiles', label: 'Perfil', icon: User, scope: 'profile', show: !!config?.profiles_data },
      { id: 'projects', label: 'Proyecto', icon: Briefcase, scope: 'project', show: !!config?.projects_data },
      { id: 'team', label: 'Equipo', icon: Users, scope: 'team', show: true },
      { id: 'customers', label: 'Clientes', icon: Users2, scope: 'crm', show: true },
      { id: 'products', label: 'Productos', icon: Package, scope: 'products', show: true },
      { id: 'integrations', label: 'Integraciones', icon: Link2, scope: 'integrations', show: !!config?.integrations_data },
      { id: 'assets', label: 'Activos', icon: Box, scope: 'assets', show: true },
    ].filter(tab => tab.show);
  }, [config]);

  // Asegurar que activeTab sea válida si las pestañas cambian
  useEffect(() => {
    if (tabs.length > 0 && !tabs.find(t => t.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab]);

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

  const renderRowInspector = () => {
    if (!inspectedRow) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-surface w-full max-w-2xl max-h-[80vh] rounded-3xl border border-text/10 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="p-6 border-b border-text/5 flex items-center justify-between bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <FileJson className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-text">Inspección de Payload</h3>
                <p className="text-[10px] text-text/40 uppercase font-black tracking-widest">Detalle técnico del registro</p>
              </div>
            </div>
            <button 
              onClick={() => setInspectedRow(null)}
              className="w-10 h-10 rounded-full hover:bg-text/5 flex items-center justify-center transition-colors"
            >
              <XCircle className="w-6 h-6 text-text/20 hover:text-text/40" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            {renderJson(inspectedRow)}
          </div>
          <div className="p-4 bg-text/5 border-t border-text/5 flex justify-end">
            <button 
              onClick={() => setInspectedRow(null)}
              className="px-6 py-2 bg-text text-background font-bold rounded-xl text-sm hover:opacity-90 transition-opacity"
            >
              Cerrar Inspector
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    const currentTab = tabs.find(t => t.id === activeTab);
    if (!currentTab) return null;

    const isAuthorized = config?.scopes?.includes(currentTab.scope);
    if (!isAuthorized) return renderLockedState(currentTab.scope);

    switch (activeTab) {
      case 'profile':
        if (!config?.user_profile) return renderEmptyState('Sin datos disponibles', User);
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface p-6 rounded-2xl border border-text/5 shadow-sm">
              <h4 className="text-sm font-bold text-text/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Info className="w-4 h-4" /> Información de Usuario
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-text/30 uppercase tracking-tighter">Nombre Completo</label>
                  <p className="text-lg font-bold text-text">{config.user_profile?.full_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text/30 uppercase tracking-tighter">Correo Electrónico</label>
                  <p className="text-text/80">{config.user_profile?.email || 'N/A'}</p>
                </div>
                {config.user_profile?.avatar_url && (
                  <div>
                    <label className="text-[10px] font-bold text-text/30 uppercase tracking-tighter">Avatar URL</label>
                    <p className="text-xs text-primary truncate">{config.user_profile.avatar_url}</p>
                  </div>
                )}
                <div>
                  <label className="text-[10px] font-bold text-text/30 uppercase tracking-tighter">Rol</label>
                  <p className="text-text/80">{config.user_profile?.role || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text/30 uppercase tracking-tighter">Empresa</label>
                  <p className="text-text/80">{config.user_profile?.business_name || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="bg-surface p-6 rounded-2xl border border-text/5 shadow-sm">
              <h4 className="text-sm font-bold text-text/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                <FileJson className="w-4 h-4" /> Raw Payload
              </h4>
              {renderJson(config.user_profile)}
            </div>
          </div>
        );

      case 'profiles':
        const profiles = profiles_data_state || {};
        if (Object.keys(profiles).length === 0) return renderEmptyState('Sin perfiles sincronizados', Users2);
        return (
          <div className="space-y-6">
            <div className="bg-surface p-6 rounded-2xl border border-text/5 shadow-sm">
              <h4 className="text-sm font-bold text-text/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                <FileJson className="w-4 h-4" /> Perfil (Raw Data)
              </h4>
              {renderJson(profiles)}
            </div>
          </div>
        );

      case 'projects':
        const projects = projects_data_state || {};
        if (Object.keys(projects).length === 0) return renderEmptyState('Sin datos disponibles', Briefcase);
        return (
          <div className="space-y-6">
            <div className="bg-surface p-6 rounded-2xl border border-text/5 shadow-sm">
              <h4 className="text-sm font-bold text-text/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Proyecto (Raw Data)
              </h4>
              {renderJson(projects)}
            </div>
          </div>
        );

      case 'team':
        const team_members = config?.team_members;
        if (!team_members || team_members.length === 0) {
          return renderEmptyState('Sin datos disponibles', Users);
        }
        return (
          <div>
            <h4 className="text-sm font-bold text-text/40 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" /> Equipo de Trabajo
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {team_members.map((member: any, idx: number) => (
                <div key={idx} className="bg-surface p-4 rounded-2xl border border-text/5 shadow-sm flex items-center gap-4 relative overflow-hidden">
                  {member.status && (
                    <div className={`absolute top-0 right-0 px-2 py-0.5 text-[8px] font-black uppercase ${member.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-text/10 text-text/40'}`}>
                      {member.status}
                    </div>
                  )}
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold overflow-hidden border border-text/5">
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      member.name?.charAt(0) || '?'
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-text">{member.name || 'N/A'}</p>
                    <p className="text-xs text-text/40">{member.role || 'Sin rol'}</p>
                    <p className="text-[10px] text-text/60 mt-1">{member.email || 'Sin email'}</p>
                    <div className="flex items-center justify-between mt-2">
                      {member.assigned_at && (
                        <p className="text-[8px] text-text/30 uppercase tracking-tighter">Asignado: {new Date(member.assigned_at).toLocaleDateString()}</p>
                      )}
                      <button 
                        onClick={() => setInspectedRow(member)}
                        className="text-[9px] font-bold text-primary hover:underline uppercase"
                      >
                        Payload
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'customers':
        console.log('DEBUG Customers Data:', customers_data_state);
        const customers_data = Array.isArray(customers_data_state) ? customers_data_state : [];
        
        // --- HERRAMIENTA DE DIAGNÓSTICO ---
        console.log('DIAGNÓSTICO UI: ¿Qué recibe el componente de clientes?', { customers_data });
        // -----------------------------------
        
        if (customers_data.length === 0) {
          return renderEmptyState('Sin datos disponibles', Users2);
        }

        return (
          <div className="space-y-8">
            {/* Clientes */}
            <div className="bg-surface p-6 rounded-2xl border border-text/5 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-sm font-bold text-text/40 uppercase tracking-widest flex items-center gap-2">
                  <Users2 className="w-4 h-4" /> Clientes Sincronizados
                </h4>
                <span className="text-[10px] font-mono bg-text/5 px-2 py-1 rounded text-text/40">
                  {customers_data.length} Registros
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-text/5">
                      <th className="py-3 px-4 text-[10px] font-bold text-text/30 uppercase tracking-widest">Cliente</th>
                      <th className="py-3 px-4 text-[10px] font-bold text-text/30 uppercase tracking-widest">Empresa / Rol</th>
                      <th className="py-3 px-4 text-[10px] font-bold text-text/30 uppercase tracking-widest">Contacto</th>
                      <th className="py-3 px-4 text-[10px] font-bold text-text/30 uppercase tracking-widest">Status / Origen</th>
                      <th className="py-3 px-4 text-[10px] font-bold text-text/30 uppercase tracking-widest">v.</th>
                      <th className="py-3 px-4 text-[10px] font-bold text-text/30 uppercase tracking-widest text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers_data.map((customer: any, idx: number) => (
                      <tr key={idx} className="border-b border-text/5 hover:bg-text/5 transition-colors group">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            {(customer.profile_photo_url || customer.company_logo_url) && (
                              <img 
                                src={customer.profile_photo_url || customer.company_logo_url} 
                                alt={customer.name} 
                                className="w-8 h-8 rounded-full object-cover" 
                                referrerPolicy="no-referrer"
                              />
                            )}
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-text group-hover:text-primary transition-colors">{customer?.name}</span>
                              <span className="text-[10px] text-text/30 font-mono">{customer?.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-text/80">{customer?.company || 'N/A'}</span>
                            <span className="text-[10px] text-text/40 italic">{customer?.role || 'Sin rol'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-xs text-text/60">
                              <span className="w-1 h-1 rounded-full bg-text/20"></span>
                              {customer?.email || 'Sin email'}
                            </div>
                            {customer?.phone && (
                              <div className="flex items-center gap-1.5 text-[10px] text-text/40">
                                <span className="w-1 h-1 rounded-full bg-text/20"></span>
                                {customer?.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-2">
                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded w-fit ${
                              customer?.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 
                              customer?.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 
                              'bg-text/10 text-text/40'
                            }`}>
                              {customer?.status || 'Active'}
                            </span>
                            <span className="text-[10px] text-text/30 flex items-center gap-1">
                              <Tag className="w-3 h-3" /> {customer?.source || 'Directo'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-[10px] font-mono text-text/20">{customer?.schema_version || '1.0'}</span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button 
                            onClick={() => setInspectedRow(customer)}
                            className="p-2 hover:bg-primary/10 rounded-lg transition-colors group/btn"
                            title="Ver Payload Completo"
                          >
                            <FileJson className="w-4 h-4 text-text/20 group-hover/btn:text-primary" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-surface p-6 rounded-2xl border border-text/5 shadow-sm">
              <h4 className="text-sm font-bold text-text/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                <FileJson className="w-4 h-4" /> Customers Raw Data
              </h4>
              {renderJson(customers_data)}
            </div>
          </div>
        );

      case 'products':
        console.log('DEBUG Products Data:', products_data_state);
        const products = products_data_state || [];
        if (products.length > 0) {
            console.log('DEBUG First Product Structure:', products[0]);
        }
        
        if (products.length === 0) {
          return renderEmptyState('Sin datos disponibles', Package);
        }
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {products.map((product: any, idx: number) => (
                <div key={idx} className="bg-surface p-4 rounded-2xl border border-text/5 shadow-sm relative overflow-hidden">
                  {product.status && (
                    <div className={`absolute top-0 right-0 px-2 py-0.5 text-[8px] font-black uppercase ${product.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-text/10 text-text/40'}`}>
                      {product.status}
                    </div>
                  )}
                  <div className="aspect-square bg-background rounded-xl mb-3 overflow-hidden border border-text/5 flex items-center justify-center">
                    {(product.photo_url || product.app_data?.imageUrl) ? (
                      <img 
                        src={product.photo_url || product.app_data.imageUrl} 
                        alt={product.name} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer" 
                      />
                    ) : (
                      <Package className="w-8 h-8 text-text/10" />
                    )}
                  </div>
                  <h5 className="font-bold text-text text-sm truncate">{product.name || 'N/A'}</h5>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-primary font-bold">${product.unit_cost || 0}</p>
                    {product.sku && <span className="text-[8px] font-mono text-text/30">SKU: {product.sku}</span>}
                  </div>
                  <p className="text-[10px] text-text/40 mt-2 line-clamp-2">{product.description || 'Sin descripción'}</p>
                  
                  <div className="mt-3 pt-3 border-t border-text/5 flex items-center justify-between">
                    <span className="text-[9px] font-bold text-text/30 uppercase">{product.type || 'General'}</span>
                    <button 
                      onClick={() => setInspectedRow(product)}
                      className="text-[9px] font-bold text-primary hover:underline uppercase tracking-widest"
                    >
                      Payload
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-surface p-6 rounded-2xl border border-text/5 shadow-sm">
              <h4 className="text-sm font-bold text-text/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                <FileJson className="w-4 h-4" /> Raw Products Data
              </h4>
              {renderJson(products)}
            </div>
          </div>
        );

      case 'calendar':
        const calendar_config = config?.calendar_config;
        if (!calendar_config) return renderEmptyState('Sin datos disponibles', Calendar);
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface p-6 rounded-2xl border border-text/5 shadow-sm">
              <h4 className="text-sm font-bold text-text/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Configuración de Agenda
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-text/30 uppercase tracking-tighter">Zona Horaria</label>
                  <p className="text-text/80">{calendar_config.timezone || 'UTC'}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text/30 uppercase tracking-tighter">Días Laborales</label>
                  <div className="flex gap-1 mt-1">
                    {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, i) => (
                      <div key={i} className={`w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold ${calendar_config.working_days?.includes(i+1) ? 'bg-primary text-white' : 'bg-text/5 text-text/30'}`}>
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
                <span className="text-sm font-mono font-bold text-primary">{calendar_config.opening_time || '09:00'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-background rounded-xl border border-text/5 mt-2">
                <span className="text-xs font-bold text-text/60">Cierre</span>
                <span className="text-sm font-mono font-bold text-primary">{calendar_config.closing_time || '18:00'}</span>
              </div>
            </div>
          </div>
        );

      case 'assets':
        const assets = assets_data_state || [];
        const current_asset = config?.current_asset;
        
        if (assets.length === 0 && !current_asset) {
          return renderEmptyState('Sin datos disponibles', Box);
        }

        return (
          <div className="space-y-8">
            {/* Activo Actual (Contexto de edición) */}
            {current_asset && (
              <div className="bg-primary/5 p-6 rounded-3xl border border-primary/20 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                    <Box className="w-4 h-4" /> Activo en Edición
                  </h4>
                  <span className="text-[10px] font-black bg-primary text-white px-2 py-0.5 rounded-full uppercase">En Foco</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-primary/40 uppercase tracking-tighter">Nombre</label>
                      <p className="text-lg font-bold text-text">{current_asset.name}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-primary/40 uppercase tracking-tighter">Tipo</label>
                      <p className="text-sm font-bold text-text">{current_asset.type}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-primary/40 uppercase tracking-tighter">UUID</label>
                      <p className="text-xs font-mono text-text/60 break-all">{current_asset.id}</p>
                    </div>
                  </div>
                  <div className="bg-surface/50 p-4 rounded-2xl border border-primary/10">
                    <label className="text-[10px] font-bold text-primary/40 uppercase tracking-tighter mb-2 block">Metadata Contextual</label>
                    {renderJson(current_asset.data || {})}
                  </div>
                </div>
              </div>
            )}

            {/* Listado de Activos Sincronizados */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-sm font-bold text-text/40 uppercase tracking-widest flex items-center gap-2">
                  <Database className="w-4 h-4" /> Activos Sincronizados
                </h4>
                <span className="text-[10px] font-mono bg-text/5 px-2 py-1 rounded text-text/40">
                  {assets.length} Activos
                </span>
              </div>

              {assets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {assets.map((asset: any, idx: number) => (
                    <div key={idx} className="bg-surface p-6 rounded-3xl border border-text/5 shadow-sm hover:border-primary/30 transition-all group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-text/5 rounded-2xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <Box className="w-6 h-6 text-text/20 group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase ${
                            asset.status === 'published' ? 'bg-emerald-500 text-white' : 
                            asset.status === 'draft' ? 'bg-amber-500 text-white' : 
                            'bg-text/10 text-text/40'
                          }`}>
                            {asset.status || 'N/A'}
                          </span>
                          {asset.schema_version && <span className="text-[8px] font-mono text-text/20">v{asset.schema_version}</span>}
                        </div>
                      </div>

                      <h5 className="font-bold text-text mb-1 truncate">{asset.name}</h5>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded uppercase tracking-wider">{asset.type || 'General'}</span>
                        <span className="text-[10px] text-text/30 italic">por {asset.author || 'Sistema'}</span>
                      </div>

                      <div className="space-y-3 mb-6">
                        {asset.url && (
                          <div className="flex items-center gap-2 text-[10px] text-primary hover:underline truncate">
                            <Link2 className="w-3 h-3" />
                            <a href={asset.url} target="_blank" rel="noopener noreferrer">{asset.url}</a>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {asset.tags && Array.isArray(asset.tags) && asset.tags.map((tag: string, i: number) => (
                            <span key={i} className="text-[8px] font-bold bg-text/5 text-text/40 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-text/5 flex items-center justify-between">
                        <span className="text-[9px] text-text/30 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {asset.created_at ? new Date(asset.created_at).toLocaleDateString() : 'N/A'}
                        </span>
                        <button 
                          onClick={() => setInspectedRow(asset)}
                          className="text-[9px] font-bold text-primary hover:underline uppercase"
                        >
                          Payload
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-surface/50 border border-dashed border-text/10 rounded-3xl p-12 text-center">
                  <p className="text-sm text-text/40 font-medium">No hay activos sincronizados adicionales</p>
                </div>
              )}
            </div>

            <div className="bg-surface p-6 rounded-2xl border border-text/5 shadow-sm">
              <h4 className="text-sm font-bold text-text/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                <FileJson className="w-4 h-4" /> Assets Raw Data
              </h4>
              {renderJson(assets)}
            </div>
          </div>
        );

      case 'apps':
        const apps_data = config?.apps_data;
        const project_apps_data = config?.project_apps_data || [];
        
        if (!apps_data || apps_data.length === 0) {
          return renderEmptyState('Sin datos de aplicaciones disponibles', LayoutGrid);
        }
        return (
          <div className="space-y-8">
            <div>
              <h4 className="text-sm font-bold text-text/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                <LayoutGrid className="w-4 h-4" /> Ecosistema de Aplicaciones
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {apps_data.map((app, idx) => {
                  const installation = project_apps_data.find(pa => pa.app_id === app.id);
                  const isInstalled = !!installation;

                  return (
                    <div key={idx} className={`bg-surface p-6 rounded-2xl border transition-all group ${isInstalled ? 'border-primary/20 shadow-md shadow-primary/5' : 'border-text/5 shadow-sm hover:border-primary/30'}`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          {app.logo_url ? (
                            <img src={app.logo_url} alt={app.name} className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                          ) : (
                            <LayoutGrid className="w-6 h-6 text-primary" />
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {isInstalled && <span className="text-[8px] font-black bg-primary text-white px-1.5 py-0.5 rounded-full uppercase">Instalada</span>}
                          {app.is_new && <span className="text-[8px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-full uppercase">Nuevo</span>}
                          {app.requires_pro && <span className="text-[8px] font-black bg-amber-500 text-white px-1.5 py-0.5 rounded-full uppercase">Pro</span>}
                        </div>
                      </div>
                      <h5 className="font-bold text-text mb-1 flex items-center gap-2">
                        {app.name}
                        {app.is_featured && <CheckCircle2 className="w-3 h-3 text-primary" />}
                      </h5>
                      <p className="text-[10px] text-text/40 mb-3 line-clamp-2">{app.description || 'Sin descripción disponible'}</p>
                      
                      {isInstalled && installation.installed_at && (
                        <p className="text-[9px] text-text/30 mb-3 italic">Instalada el {new Date(installation.installed_at).toLocaleDateString()}</p>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-text/5">
                        <span className="text-[9px] font-bold text-text/30 uppercase">{app.category || 'General'}</span>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => setInspectedRow(app)}
                            className="text-[10px] font-bold text-text/40 hover:text-primary uppercase"
                          >
                            Payload
                          </button>
                          <a 
                            href={app.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold text-primary hover:underline"
                          >
                            Abrir
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {project_apps_data.length > 0 && (
              <div className="bg-surface p-6 rounded-2xl border border-text/5 shadow-sm">
                <h4 className="text-sm font-bold text-text/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <FileJson className="w-4 h-4" /> Relaciones de Instalación (project_apps)
                </h4>
                {renderJson(project_apps_data)}
              </div>
            )}
          </div>
        );
      
      case 'integrations':
        const integrations_data = config?.integrations_data;
        if (!integrations_data || integrations_data.length === 0) {
          return renderEmptyState('Sin integraciones configuradas', Link2);
        }
        return (
          <div className="space-y-8">
            <div>
              <h4 className="text-sm font-bold text-text/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Link2 className="w-4 h-4" /> Integraciones de Usuario
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {integrations_data.map((integration, idx) => (
                  <div key={idx} className="bg-surface p-6 rounded-2xl border border-text/5 shadow-sm hover:border-primary/30 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                          <span className="text-lg font-black text-primary uppercase">{integration.provider?.charAt(0)}</span>
                        </div>
                        <div>
                          <h5 className="font-bold text-text capitalize">{integration.provider}</h5>
                          <p className="text-[10px] text-text/40 font-mono">ID: {integration.id?.slice(0, 8)}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[8px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-full uppercase">Conectado</span>
                        <button 
                          onClick={() => setInspectedRow(integration)}
                          className="text-[9px] font-bold text-primary hover:underline uppercase"
                        >
                          Payload
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-[8px] font-bold text-text/30 uppercase">Access Token</label>
                        <div className="flex items-center gap-2 mt-0.5">
                          <code className="text-[10px] bg-text/5 px-2 py-1 rounded text-text/60 truncate flex-1">
                            {integration.access_token?.slice(0, 20)}...
                          </code>
                          <Lock className="w-3 h-3 text-text/20" />
                        </div>
                      </div>
                      
                      {integration.expires_at && (
                        <div>
                          <label className="text-[8px] font-bold text-text/30 uppercase">Expira el</label>
                          <p className="text-[10px] text-text/60">{new Date(integration.expires_at).toLocaleString()}</p>
                        </div>
                      )}

                      {integration.metadata && (
                        <div>
                          <label className="text-[8px] font-bold text-text/30 uppercase">Metadata</label>
                          <div className="mt-1">
                            {renderJson(integration.metadata)}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-text/5 flex items-center justify-between">
                      <span className="text-[9px] text-text/30">Sincronizado: {integration.updated_at ? new Date(integration.updated_at).toLocaleDateString() : 'N/A'}</span>
                      <button className="text-[10px] font-bold text-primary hover:underline">Gestionar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface p-6 rounded-2xl border border-text/5 shadow-sm">
              <h4 className="text-sm font-bold text-text/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                <FileJson className="w-4 h-4" /> Raw Integrations Data
              </h4>
              {renderJson(integrations_data)}
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
      {renderRowInspector()}
    </div>
  );
};
