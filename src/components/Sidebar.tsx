import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Code, Layout, Package, Rocket, Settings, Sparkles, Trash2, Plus, ChevronDown, Database, Monitor } from 'lucide-react';
import { VersionDisplay } from './VersionDisplay';
import { SolutiumPayload } from '../lib/solutium-sdk';
import { MODULE_REGISTRY } from '../modules/registry';
import { AssetSettings, PageLayout } from '../types';

interface SidebarProps {
  config: SolutiumPayload | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onAddModule: (type: string) => void;
  onGoHome: () => void;
  onGenerateAi: () => void;
  projects: any[];
  activeProjectId: string | null;
  onSelectProject: (id: string) => void;
  activeAssetId: string | null;
  onSelectAsset: (assetId: string, projectId: string) => void;
  onCreateAsset: () => void;
  showSaveMessage: boolean;
  lastSaveStatus: 'borrador' | 'guardado';
  assetSettings: AssetSettings;
  onUpdateSettings: (settings: Partial<AssetSettings>) => void;
}

export const Sidebar = ({ 
  config, 
  activeTab, 
  setActiveTab, 
  isCollapsed, 
  onToggleCollapse, 
  onAddModule, 
  onGoHome, 
  onGenerateAi,
  projects,
  activeProjectId,
  onSelectProject,
  activeAssetId,
  onSelectAsset,
  onCreateAsset,
  showSaveMessage,
  lastSaveStatus,
  assetSettings,
  onUpdateSettings
}: SidebarProps) => {
  const [isBuilderExpanded, setIsBuilderExpanded] = useState(true);
  const [isDesignExpanded, setIsDesignExpanded] = useState(false);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(activeProjectId);

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Update expanded project when active project changes
  useEffect(() => {
    if (activeProjectId) {
      setExpandedProjectId(activeProjectId);
    }
  }, [activeProjectId]);

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];
  const activeAsset = activeProject?.assets?.find((a: any) => a.id === activeAssetId) || activeProject?.assets?.[0];

  const handleProjectClick = (projectId: string) => {
    setExpandedProjectId(expandedProjectId === projectId ? null : projectId);
  };

  const handleAssetSelect = (projectId: string, assetId: string) => {
    onSelectAsset(assetId, projectId);
    setIsProjectMenuOpen(false);
  };

  const menuItems = [
    { id: 'builder', label: 'Constructor', icon: Layout },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  const handleTabClick = (tabId: string) => {
    if (tabId === 'builder' && activeTab === 'builder') {
      setIsBuilderExpanded(!isBuilderExpanded);
    } else {
      setActiveTab(tabId);
      if (tabId === 'builder') {
        setIsBuilderExpanded(true);
      }
    }
  };

  const designOptions: { id: PageLayout; label: string; description: string }[] = [
    { id: 'seamless', label: 'Borde a Borde', description: 'Módulos continuos sin divisiones visibles.' },
    { id: 'windows', label: 'Ventanas Independientes', description: 'Módulos flotantes sobre un fondo gris.' },
    { id: 'symmetric', label: 'Estructura Simétrica', description: 'Diseño equilibrado con proporciones clásicas.' },
    { id: 'layered', label: 'Estructura Asimétrica', description: 'Elementos que flotan entre módulos.' },
    { id: 'bento', label: 'Bento Grid', description: 'Organización modular en celdas.' },
    { id: 'snap', label: 'Pantalla Completa', description: 'Un módulo por pantalla con scroll suave.' },
    { id: 'split', label: 'Pantalla Dividida', description: 'Contenido dividido verticalmente.' },
  ];

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-surface border-r border-text/10 pt-4 px-4 pb-0 flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out group/sidebar`}>
      <div className="mb-6 relative">
        <button 
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-7 top-2 w-6 h-6 bg-surface border border-text/10 rounded-full items-center justify-center text-text/40 hover:text-primary hover:border-primary/20 shadow-sm z-20 transition-all"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
 
        <div 
          onClick={onGoHome}
          className={`flex flex-col mb-2 cursor-pointer hover:opacity-80 transition-opacity`}
        >
          {isCollapsed ? (
            <div className="flex justify-center">
              <img 
                src="https://solutium.app/logos-de-apps/solutium-constructor-web-isotipo.png" 
                alt="Isotipo" 
                className="w-12 h-12 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className="flex flex-col items-end pr-2">
              <img 
                src="https://solutium.app/logos-de-apps/solutium-constructor-web-imagotipo.png" 
                alt="Imagotipo" 
                className="h-12 w-auto object-contain self-start ml-1"
                style={{ transform: 'scale(1.2)', transformOrigin: 'left center' }}
                referrerPolicy="no-referrer"
              />
              <div className="mt-1">
                <VersionDisplay />
              </div>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-1">
        {/* Design Button */}
        <div className="space-y-1">
          <button
            onClick={() => setIsDesignExpanded(!isDesignExpanded)}
            title={isCollapsed ? 'Diseño' : ''}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-4'} py-3 rounded-xl transition-all duration-200 ${
              isDesignExpanded
                ? 'bg-primary/5 text-primary font-semibold shadow-sm'
                : 'text-text/60 hover:bg-background hover:text-text/80'
            }`}
          >
            <Monitor className={`w-5 h-5 flex-shrink-0 ${isDesignExpanded ? 'text-primary' : 'text-text/40'}`} />
            {!isCollapsed && <span className="truncate flex-1 text-left">Diseño</span>}
            {!isCollapsed && (
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isDesignExpanded ? 'rotate-180' : ''}`} />
            )}
          </button>

          {isDesignExpanded && !isCollapsed && (
            <div className="px-2 pb-4 pt-1 space-y-1">
              {designOptions.slice(0, 7).map((option) => (
                <button
                  key={option.id}
                  onClick={() => onUpdateSettings({ pageLayout: option.id })}
                  className={`w-full flex flex-col items-start text-left px-4 py-3 rounded-xl transition-all ${
                    assetSettings.pageLayout === option.id
                      ? 'bg-primary text-white shadow-md'
                      : 'text-text/60 hover:bg-background hover:text-text/80'
                  }`}
                >
                  <span className="text-sm font-bold text-left">{option.label}</span>
                  <span className={`text-[10px] text-left leading-tight mt-1 ${assetSettings.pageLayout === option.id ? 'text-white/70' : 'text-text/40'}`}>
                    {option.description}
                  </span>
                </button>
              ))}
              <div className="px-4 py-2">
                <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">
                  Próximamente
                </span>
              </div>
              {designOptions.slice(7).map((option) => (
                <div
                  key={option.id}
                  className="w-full flex flex-col items-start text-left px-4 py-3 rounded-xl opacity-40 grayscale cursor-not-allowed"
                >
                  <span className="text-sm font-bold text-left">{option.label}</span>
                  <span className="text-[10px] text-left leading-tight mt-1 text-text/40">
                    {option.description}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {menuItems.map((item) => (
          <div key={item.id} className="space-y-1">
            <button
              onClick={() => handleTabClick(item.id)}
              title={isCollapsed ? item.label : ''}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-4'} py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-primary/5 text-primary font-semibold shadow-sm'
                  : 'text-text/60 hover:bg-background hover:text-text/80'
              }`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${activeTab === item.id ? 'text-primary' : 'text-text/40'}`} />
              {!isCollapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
              {!isCollapsed && item.id === 'builder' && activeTab === 'builder' && (
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isBuilderExpanded ? 'rotate-180' : ''}`} />
              )}
            </button>

            {/* Submenu for Builder */}
            {item.id === 'builder' && activeTab === 'builder' && isBuilderExpanded && (
              <div className={`flex flex-col gap-0.5 ${isCollapsed ? 'items-center' : ''} pb-4 pt-1`}>
                {['navigation', 'main-content', 'social-proof', 'sales', 'contact'].map((category) => {
                  const modules = MODULE_REGISTRY.filter(m => m.category === category);
                  if (modules.length === 0) return null;
 
                  const categoryLabel = {
                    'navigation': 'Navegación',
                    'main-content': 'Contenido',
                    'social-proof': 'Confianza',
                    'sales': 'Ventas',
                    'contact': 'Contacto'
                  }[category as any];
 
                  return (
                    <div key={category} className="space-y-0.5">
                      {!isCollapsed && (
                        <button 
                          onClick={() => setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }))}
                          className="w-full flex items-center justify-between px-4 py-1.5 cursor-pointer hover:bg-primary/5 rounded-lg transition-colors group"
                        >
                          <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest group-hover:text-primary/60 transition-colors">
                            {categoryLabel}
                          </span>
                          <ChevronDown className={`w-3 h-3 text-primary/40 transition-transform duration-300 ${expandedCategories[category] ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                      
                      {/* Only show modules if the category is expanded OR if the sidebar is collapsed (to show icons) */}
                      {(expandedCategories[category] || isCollapsed) && modules.map((module) => (
                        <button
                          key={module.id}
                          onClick={() => onAddModule(module.id)}
                          title={isCollapsed ? `${categoryLabel}: ${module.label}` : ''}
                          className={`flex items-center ${isCollapsed ? 'justify-center w-10 h-10 mx-auto' : 'justify-start gap-3 px-4 py-1.5 w-full'} rounded-xl text-text/60 hover:bg-background hover:text-primary transition-all group`}
                        >
                          <module.icon className="w-5 h-5 flex-shrink-0" />
                          {!isCollapsed && (
                            <span className="text-[14px] font-medium truncate flex-1 text-left">{module.label}</span>
                          )}
                          {!isCollapsed && (
                            <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {/* Data Audit Button - Always visible as per user request to not hide tabs */}
        <button
          onClick={() => setActiveTab('data-audit')}
          title={isCollapsed ? 'Datos' : ''}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-4'} py-3 rounded-xl transition-all duration-200 ${
            activeTab === 'data-audit'
              ? 'bg-primary/5 text-primary font-semibold shadow-sm'
              : 'text-text/60 hover:bg-background hover:text-text/80'
          }`}
        >
          <Database className={`w-5 h-5 flex-shrink-0 ${activeTab === 'data-audit' ? 'text-primary' : 'text-text/40'}`} />
          {!isCollapsed && <span className="truncate flex-1 text-left">Datos</span>}
        </button>
      </nav>

      <div className="mt-auto pt-4 pb-4 space-y-2">
        {/* AI Generator Button - Moved to bottom */}
        <div className="px-2">
          <button
            onClick={onGenerateAi}
            title={isCollapsed ? 'Generar con IA' : ''}
            style={{
              background: `linear-gradient(135deg, ${config?.projectData?.colors?.[0] || '#3B82F6'}, ${config?.projectData?.colors?.[1] || '#1E293B'})`
            }}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-center gap-3 px-4'} py-3 rounded-xl text-white hover:opacity-90 transition-all group/ai shadow-md`}
          >
            <Sparkles className="w-5 h-5 text-white group-hover/ai:animate-pulse" />
            {!isCollapsed && (
              <span className="text-sm font-bold tracking-tight">Generar con IA</span>
            )}
          </button>
        </div>

        {!isCollapsed && (
          <div className="px-2">
            <div className="relative group/project-nav">
              {/* Project Name & Asset Trigger */}
              <div className="relative">
                <button 
                  onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
                  className="w-full flex flex-col items-start gap-0.5 p-3 bg-background border border-text/10 rounded-xl hover:border-primary/30 hover:bg-surface transition-all group/btn shadow-sm"
                >
                  <span className="text-sm font-black text-text truncate w-full text-left">
                    {activeAsset?.name || 'Seleccionar activo'}
                  </span>
                  <div className="flex items-center justify-between w-full mt-0.5">
                    <span className="text-[10px] font-medium text-text/40 tracking-tight text-left">
                      Proyecto: <span className="text-text/60">{activeProject?.name}</span>
                    </span>
                    <div className={`w-3 h-3 text-text/30 transition-transform ${isProjectMenuOpen ? 'rotate-180' : ''}`}>
                      <ChevronDown className="w-full h-full" />
                    </div>
                  </div>
                </button>

                {/* Dropdown Menu (Accordion Style) */}
                {isProjectMenuOpen && (
                  <div className="absolute bottom-full left-0 w-full mb-2 bg-surface border border-text/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="p-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                      <div className="space-y-1">
                        {projects.map(project => (
                          <div key={project.id} className="space-y-1">
                            {/* Project Header (Accordion Trigger) */}
                            <button
                              onClick={() => handleProjectClick(project.id)}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                expandedProjectId === project.id 
                                  ? 'bg-primary/5 text-primary' 
                                  : 'text-text/60 hover:bg-background'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${project.id === activeProject.id ? 'bg-primary' : 'bg-text/30'}`} />
                                <span className="truncate">{project.name}</span>
                              </div>
                              <ChevronDown className={`w-3 h-3 transition-transform ${expandedProjectId === project.id ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Assets Accordion Content */}
                            {expandedProjectId === project.id && (
                              <div className="pl-6 pr-2 py-1 space-y-1 animate-in slide-in-from-top-1 duration-200">
                                {project.assets?.map((asset: any) => (
                                  <button
                                    key={asset.id}
                                    onClick={() => handleAssetSelect(project.id, asset.id)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${
                                      activeAssetId === asset.id && project.id === activeProject.id
                                        ? 'bg-primary text-white' 
                                        : 'text-text/60 hover:bg-primary/5 hover:text-primary'
                                    }`}
                                  >
                                    <span>{asset.name}</span>
                                    {activeAssetId === asset.id && project.id === activeProject.id && <Rocket className="w-3 h-3" />}
                                  </button>
                                ))}
                                
                                {/* New Page Option */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onCreateAsset();
                                    setIsProjectMenuOpen(false);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold text-primary hover:bg-primary/10 transition-all border border-dashed border-primary/20 mt-2"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Nueva página web</span>
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className={`fixed bottom-6 left-6 z-[100] transition-all duration-500 transform ${showSaveMessage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <div className={`${lastSaveStatus === 'guardado' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-amber-500 shadow-amber-500/20'} text-white px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 border border-white/20`}>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest">
              {lastSaveStatus === 'guardado' ? 'Página guardada' : 'Borrador guardado'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
