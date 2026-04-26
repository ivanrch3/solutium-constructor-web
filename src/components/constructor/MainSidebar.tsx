import React, { useState } from 'react';
import { 
  Monitor, 
  Layout, 
  ChevronDown, 
  FileText, 
  Sparkles, 
  Type, 
  User, 
  Layers, 
  PlusCircle, 
  Database, 
  Users, 
  CreditCard, 
  Mail, 
  RotateCcw, 
  CheckCircle2, 
  HelpCircle,
  Settings,
  Palette
} from 'lucide-react';
import { Project } from '../../types/schema';
import { WebModule } from '../../types/constructor';
import { 
  MODULE_INFO,
  HEADER_MODULE, 
  MENU_MODULE, 
  FOOTER_MODULE, 
  HERO_MODULE, 
  FEATURES_MODULE, 
  ABOUT_MODULE, 
  PROCESS_MODULE, 
  STATS_MODULE, 
  TEAM_MODULE, 
  CTA_MODULE, 
  PRICING_MODULE, 
  CONTACT_MODULE, 
  NEWSLETTER_MODULE, 
  GALLERY_MODULE, 
  VIDEO_MODULE, 
  TESTIMONIALS_MODULE, 
  CLIENTS_MODULE, 
  FAQ_MODULE, 
  PRODUCTS_MODULE, 
  SPACER_MODULE,
  BENTO_MODULE,
  COMPARISON_MODULE
} from './registry';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active 
        ? 'bg-primary text-white shadow-lg shadow-primary/20 font-bold' 
        : 'text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-foreground/5'
    }`}
  >
    <div className={active ? 'text-white' : 'text-sidebar-foreground/60'}>{icon}</div>
    <span className="text-base">{label}</span>
  </button>
);

export const ModuleItem = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-foreground/5 transition-all group text-left"
  >
    <div className="text-sidebar-foreground/60 group-hover:text-sidebar-foreground transition-colors shrink-0">{icon}</div>
    <span className="text-sm font-medium flex-1 text-left">{label}</span>
  </button>
);

interface MainSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onBackToDashboard: () => void;
  logoUrl: string | null;
  logoWhiteUrl: string | null;
  project: Project | null;
  onAddModule: (module: WebModule) => void;
  onLogoClick?: () => void;
}

export const MainSidebar: React.FC<MainSidebarProps> = ({ 
  activeTab, 
  onTabChange, 
  onBackToDashboard,
  logoUrl,
  logoWhiteUrl,
  project,
  onAddModule,
  onLogoClick
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('constructor');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const displayLogo = logoWhiteUrl || logoUrl;

  return (
    <div className="w-64 bg-sidebar-bg flex flex-col z-40 h-full border-r border-sidebar-border">
      {/* Logo Section */}
      <div className="p-6">
        <div 
          className="flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity group"
          onClick={onLogoClick}
        >
          <div className="h-12 w-full flex items-center justify-center relative">
            {displayLogo ? (
              <img src={displayLogo} alt="Logo" className="h-full w-auto object-contain" referrerPolicy="no-referrer" />
            ) : (
              <FileText className="text-sidebar-foreground/40 w-10 h-10" />
            )}
            <div className="absolute inset-0 bg-sidebar-foreground/5 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity" />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar pb-10">
        <div className="space-y-1">
          <button 
            onClick={() => toggleSection('diseno')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
              expandedSection === 'diseno' ? 'text-sidebar-foreground font-bold' : 'text-sidebar-foreground/80 hover:text-sidebar-foreground'
            }`}
          >
            <div className="flex items-center gap-3">
              <Monitor size={20} />
              <span className="text-base">Diseño</span>
            </div>
            <ChevronDown size={16} className={`transition-transform ${expandedSection === 'diseno' ? 'rotate-180' : ''}`} />
          </button>
          {expandedSection === 'diseno' && (
            <div className="space-y-0.5 px-2 mb-2">
              <ModuleItem 
                icon={<Palette size={18} />}
                label="Estilo"
                onClick={() => onTabChange('design-style')}
              />
              <ModuleItem 
                icon={<Sparkles size={18} />}
                label="Animaciones"
                onClick={() => onTabChange('design-animations')}
              />
            </div>
          )}
        </div>

        {/* CONSTRUCTOR */}
        <div className="space-y-1">
          <button 
            onClick={() => {
              toggleSection('constructor');
              onTabChange('constructor');
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
              expandedSection === 'constructor' 
                ? 'text-sidebar-foreground font-bold' 
                : 'text-sidebar-foreground/80 hover:text-sidebar-foreground'
            }`}
          >
            <div className="flex items-center gap-3">
              <Layout size={20} />
              <span className="text-base">Constructor</span>
            </div>
            <ChevronDown size={16} className={`transition-transform ${expandedSection === 'constructor' ? 'rotate-180' : ''}`} />
          </button>
        </div>

          {expandedSection === 'constructor' && (
            <div className="mt-4 space-y-4">
              {/* NAVEGACIÓN */}
              <div className="space-y-2">
                <button 
                  onClick={() => toggleCategory('navegacion')}
                  className={`w-full flex items-center justify-between px-4 py-1 text-xs uppercase tracking-widest transition-all ${
                    expandedCategory === 'navegacion' ? 'font-bold text-sidebar-foreground' : 'font-normal text-sidebar-foreground/80'
                  }`}
                >
                  Navegación
                  <ChevronDown size={12} className={`transition-transform ${expandedCategory === 'navegacion' ? 'rotate-180' : ''}`} />
                </button>
                {expandedCategory === 'navegacion' && (
                  <div className="space-y-0.5 px-2">
                    <ModuleItem 
                      icon={React.createElement(MODULE_INFO.menu.icon, { size: 18 })} 
                      label="Menú" 
                      onClick={() => onAddModule(MENU_MODULE)}
                    />
                    <ModuleItem 
                      icon={React.createElement(MODULE_INFO.footer.icon, { size: 18 })} 
                      label="Pie de página" 
                      onClick={() => onAddModule(FOOTER_MODULE)}
                    />
                  </div>
                )}
              </div>

              {/* CONTENIDO */}
              <div className="space-y-2">
                <button 
                  onClick={() => toggleCategory('contenido')}
                  className={`w-full flex items-center justify-between px-4 py-1 text-xs uppercase tracking-widest transition-all ${
                    expandedCategory === 'contenido' ? 'font-bold text-sidebar-foreground' : 'font-normal text-sidebar-foreground/80'
                  }`}
                >
                  Contenido
                  <ChevronDown size={12} className={`transition-transform ${expandedCategory === 'contenido' ? 'rotate-180' : ''}`} />
                </button>
                {expandedCategory === 'contenido' && (
                  <div className="space-y-0.5 px-2">
                    <ModuleItem 
                      icon={React.createElement(MODULE_INFO.hero.icon, { size: 18 })} 
                      label="Portada" 
                      onClick={() => onAddModule(HERO_MODULE)}
                    />
                    <ModuleItem 
                      icon={React.createElement(MODULE_INFO.features.icon, { size: 18 })} 
                      label="Características" 
                      onClick={() => onAddModule(FEATURES_MODULE)}
                    />
                    <ModuleItem 
                      icon={React.createElement(MODULE_INFO.about.icon, { size: 18 })} 
                      label="Sobre Nosotros" 
                      onClick={() => onAddModule(ABOUT_MODULE)}
                    />
                    <ModuleItem 
                      icon={React.createElement(MODULE_INFO.process.icon, { size: 18 })} 
                      label="Proceso" 
                      onClick={() => onAddModule(PROCESS_MODULE)}
                    />
                    <ModuleItem 
                      icon={React.createElement(MODULE_INFO.stats.icon, { size: 18 })} 
                      label="Estadísticas" 
                      onClick={() => onAddModule(STATS_MODULE)}
                    />
                    <ModuleItem 
                      icon={React.createElement(MODULE_INFO.team.icon, { size: 18 })} 
                      label="Equipo" 
                      onClick={() => onAddModule(TEAM_MODULE)}
                    />
                    <ModuleItem 
                      icon={React.createElement(MODULE_INFO.bento.icon, { size: 18 })} 
                      label="Composición Libre" 
                      onClick={() => onAddModule(BENTO_MODULE)}
                    />
                    <ModuleItem 
                      icon={React.createElement(MODULE_INFO.comparative.icon, { size: 18 })} 
                      label="Comparativo" 
                      onClick={() => onAddModule(COMPARISON_MODULE)}
                    />
                  </div>
                )}
              </div>

              {/* CONVERSIÓN */}
              <div className="space-y-2">
                <button 
                  onClick={() => toggleCategory('conversion')}
                  className={`w-full flex items-center justify-between px-4 py-1 text-xs uppercase tracking-widest transition-all ${
                    expandedCategory === 'conversion' ? 'font-bold text-sidebar-foreground' : 'font-normal text-sidebar-foreground/80'
                  }`}
                >
                  Conversión
                  <ChevronDown size={12} className={`transition-transform ${expandedCategory === 'conversion' ? 'rotate-180' : ''}`} />
                </button>
                {expandedCategory === 'conversion' && (
                  <div className="space-y-0.5 px-2">
                    <ModuleItem 
                      icon={React.createElement(MODULE_INFO.header.icon, { size: 18 })} 
                      label="Barra superior" 
                      onClick={() => onAddModule(HEADER_MODULE)}
                    />
                    <ModuleItem 
                      icon={React.createElement(MODULE_INFO.cta.icon, { size: 18 })} 
                      label="Call to Action" 
                      onClick={() => onAddModule(CTA_MODULE)}
                    />
                    <ModuleItem 
                      icon={React.createElement(MODULE_INFO.pricing.icon, { size: 18 })} 
                      label="Precios" 
                      onClick={() => onAddModule(PRICING_MODULE)}
                    />
                    <ModuleItem 
                      icon={React.createElement(MODULE_INFO.contact.icon, { size: 18 })} 
                      label="Contacto" 
                      onClick={() => onAddModule(CONTACT_MODULE)}
                    />
                    <ModuleItem 
                      icon={React.createElement(MODULE_INFO.newsletter.icon, { size: 18 })} 
                      label="Newsletter" 
                      onClick={() => onAddModule(NEWSLETTER_MODULE)}
                    />
                  </div>
                )}
              </div>

              {/* MULTIMEDIA */}
              <div className="space-y-2">
                <button 
                  onClick={() => toggleCategory('multimedia')}
                  className={`w-full flex items-center justify-between px-4 py-1 text-xs uppercase tracking-widest transition-all ${
                    expandedCategory === 'multimedia' ? 'font-bold text-sidebar-foreground' : 'font-normal text-sidebar-foreground/80'
                  }`}
                >
                  Multimedia
                  <ChevronDown size={12} className={`transition-transform ${expandedCategory === 'multimedia' ? 'rotate-180' : ''}`} />
                </button>
                {expandedCategory === 'multimedia' && (
                  <div className="space-y-0.5 px-2">
                    <ModuleItem 
                      icon={React.createElement(MODULE_INFO.gallery.icon, { size: 18 })} 
                      label="Galería" 
                      onClick={() => onAddModule(GALLERY_MODULE)}
                    />
                    <ModuleItem 
                      icon={React.createElement(MODULE_INFO.video.icon, { size: 18 })} 
                      label="Video" 
                      onClick={() => onAddModule(VIDEO_MODULE)}
                    />
                  </div>
                )}
              </div>

              {/* SOCIAL */}
              <div className="space-y-2">
                <button 
                  onClick={() => toggleCategory('social')}
                  className={`w-full flex items-center justify-between px-4 py-1 text-xs uppercase tracking-widest transition-all ${
                    expandedCategory === 'social' ? 'font-bold text-sidebar-foreground' : 'font-normal text-sidebar-foreground/80'
                  }`}
                >
                  Social
                  <ChevronDown size={12} className={`transition-transform ${expandedCategory === 'social' ? 'rotate-180' : ''}`} />
                </button>
                {expandedCategory === 'social' && (
                  <div className="space-y-0.5 px-2">
                    <ModuleItem 
                      icon={React.createElement(MODULE_INFO.testimonials.icon, { size: 18 })} 
                      label="Testimonios" 
                      onClick={() => onAddModule(TESTIMONIALS_MODULE)}
                    />
                    <ModuleItem 
                      icon={React.createElement(MODULE_INFO.clients.icon, { size: 18 })} 
                      label="Clientes" 
                      onClick={() => onAddModule(CLIENTS_MODULE)}
                    />
                    <ModuleItem 
                      icon={React.createElement(MODULE_INFO.faq.icon, { size: 18 })} 
                      label="FAQ" 
                      onClick={() => onAddModule(FAQ_MODULE)}
                    />
                  </div>
                )}
              </div>

              {/* E-COMMERCE */}
              <div className="space-y-2">
                <button 
                  onClick={() => toggleCategory('ecommerce')}
                  className={`w-full flex items-center justify-between px-4 py-1 text-xs uppercase tracking-widest transition-all ${
                    expandedCategory === 'ecommerce' ? 'font-bold text-sidebar-foreground' : 'font-normal text-sidebar-foreground/80'
                  }`}
                >
                  E-commerce
                  <ChevronDown size={12} className={`transition-transform ${expandedCategory === 'ecommerce' ? 'rotate-180' : ''}`} />
                </button>
                {expandedCategory === 'ecommerce' && (
                  <div className="space-y-0.5 px-2">
                    <ModuleItem 
                      icon={React.createElement(MODULE_INFO.products.icon, { size: 18 })} 
                      label="Productos" 
                      onClick={() => onAddModule(PRODUCTS_MODULE)}
                    />
                  </div>
                )}
              </div>

              {/* ESTRUCTURA */}
              <div className="space-y-2">
                <button 
                  onClick={() => toggleCategory('estructura')}
                  className={`w-full flex items-center justify-between px-4 py-1 text-xs uppercase tracking-widest transition-all ${
                    expandedCategory === 'estructura' ? 'font-bold text-sidebar-foreground' : 'font-normal text-sidebar-foreground/80'
                  }`}
                >
                  Estructura
                  <ChevronDown size={12} className={`transition-transform ${expandedCategory === 'estructura' ? 'rotate-180' : ''}`} />
                </button>
                {expandedCategory === 'estructura' && (
                  <div className="space-y-0.5 px-2">
                    <ModuleItem 
                      icon={React.createElement(MODULE_INFO.spacer.icon, { size: 18 })} 
                      label="Espaciadores" 
                      onClick={() => onAddModule(SPACER_MODULE)}
                    />
                    <ModuleItem 
                      icon={React.createElement(MODULE_INFO.bento.icon, { size: 18 })} 
                      label="Composición Libre" 
                      onClick={() => onAddModule(BENTO_MODULE)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

        {/* AJUSTES */}
        <SidebarItem 
          icon={<Settings size={20} />} 
          label="Ajustes" 
          active={activeTab === 'settings'} 
          onClick={() => onTabChange('settings')}
        />

        {/* DATOS */}
        <SidebarItem 
          icon={<Database size={20} />} 
          label="Datos" 
          active={activeTab === 'datos'} 
          onClick={() => onTabChange('datos')}
        />
      </div>

      {/* User Profile Section */}
      <div className="p-6 border-t border-sidebar-border bg-sidebar-foreground/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sidebar-foreground/10 rounded-xl flex items-center justify-center overflow-hidden">
            {project?.projectIconUrl ? (
              <img src={project.projectIconUrl} alt="Project Icon" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User className="text-sidebar-foreground w-5 h-5" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-sidebar-foreground leading-none truncate max-w-[160px]">
              {project?.name || 'Proyecto'}
            </span>
            <span className="text-xs text-sidebar-foreground/40 font-normal mt-1 tracking-wider">Proyecto Activo</span>
          </div>
        </div>
      </div>
    </div>
  );
};
