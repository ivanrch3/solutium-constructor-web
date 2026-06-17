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
  HERO2_MODULE,
  FEATURES_MODULE,
  ABOUT_MODULE,
  PROCESS_MODULE,
  STATS_MODULE,
  TEAM_MODULE,
  CTA_MODULE,
  DYNAMIC_CARDS_MODULE,
  PRICING_MODULE,
  CONTACT_MODULE,
  GENIUS_WEB_WA_MODULE,
  NEWSLETTER_MODULE,
  GALLERY_MODULE,
  VIDEO_MODULE,
  TESTIMONIALS_MODULE,
  TRUSTED_LOGOS_MODULE,
  FAQ_MODULE,
  PRODUCTS_MODULE,
  SPACER_MODULE,
  BENTO_MODULE,
  COMPARISON_MODULE
} from './registry';

const CONSTRUCTOR_WEB_LOGO_URL = 'https://nyc3.digitaloceanspaces.com/solutium-space/988cd339-a2c7-4951-b944-998d32dc349b-solutium-constructor-web-imagotipo.png';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
      active
        ? 'border-primary/20 bg-primary/10 text-primary font-bold shadow-sm'
        : 'border-transparent text-slate-600 hover:text-primary hover:bg-primary/5'
    }`}
  >
    <div className={active ? 'text-primary' : 'text-slate-500 group-hover:text-primary'}>{icon}</div>
    <span className="text-base">{label}</span>
  </button>
);

export const ModuleItem = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="group w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:text-primary hover:bg-primary/5 transition-all text-left"
  >
    <div className="text-slate-500 group-hover:text-primary transition-colors shrink-0">{icon}</div>
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
  onOpenBentoGenerator?: () => void;
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
  onOpenBentoGenerator,
  onLogoClick
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('constructor');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const sidebarScrollRef = React.useRef<HTMLDivElement | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const toggleCategory = (category: string) => {
    const scrollNode = sidebarScrollRef.current;
    const currentScrollTop = scrollNode?.scrollTop ?? 0;
    setExpandedCategory(expandedCategory === category ? null : category);
    requestAnimationFrame(() => {
      if (scrollNode) scrollNode.scrollTop = currentScrollTop;
    });
  };

  const displayLogo = CONSTRUCTOR_WEB_LOGO_URL;

  return (
    <div className="w-64 bg-white flex flex-col z-40 h-full border-r border-slate-200">
      {/* Logo Section */}
      <div className="p-6">
        <div
          className="flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity group"
          onClick={onLogoClick}
        >
          <div className="h-14 w-full flex items-center justify-center relative">
            {displayLogo ? (
              <img src={displayLogo} alt="Solutium Constructor Web" className="h-full max-w-[180px] w-auto object-contain" referrerPolicy="no-referrer" />
            ) : (
            <FileText className="text-slate-400 w-10 h-10" />
            )}
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity" />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div ref={sidebarScrollRef} className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar pb-10">
        {/* CONSTRUCTOR */}
        <div className="space-y-1">
          <button
            onClick={() => {
              toggleSection('constructor');
              onTabChange('constructor');
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
              expandedSection === 'constructor'
                ? 'text-slate-900 font-bold bg-slate-50'
                : 'text-slate-600 hover:text-primary hover:bg-primary/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <Layout size={20} />
              <span className="text-base">Módulos</span>
            </div>
            <ChevronDown size={16} className={`transition-transform ${expandedSection === 'constructor' ? 'rotate-180' : ''}`} />
          </button>
        </div>

          {expandedSection === 'constructor' && (
            <div className="mt-1 space-y-3">
              <div className="space-y-0.5 px-2">
                <ModuleItem
                  icon={React.createElement(MODULE_INFO.menu.icon, { size: 18 })}
                  label="Menú"
                  onClick={() => onAddModule(MENU_MODULE)}
                />
              </div>

              <div className="mx-4 border-t border-slate-200" />

              {/* CONTENIDO */}
              <div className="space-y-2">
                <button
                  onClick={() => toggleCategory('contenido')}
                  className={`w-full flex items-center justify-between px-4 py-1 text-xs uppercase tracking-widest transition-all ${
                    expandedCategory === 'contenido' ? 'font-bold text-slate-900' : 'font-semibold text-slate-500 hover:text-primary'
                  }`}
                >
                  Contenido
                  <ChevronDown size={12} className={`transition-transform ${expandedCategory === 'contenido' ? 'rotate-180' : ''}`} />
                </button>
                {expandedCategory === 'contenido' && (
                  <div className="space-y-0.5 px-2">
                    <ModuleItem icon={React.createElement(MODULE_INFO.features.icon, { size: 18 })} label="Características" onClick={() => onAddModule(FEATURES_MODULE)} />
                    <ModuleItem icon={React.createElement(MODULE_INFO.team.icon, { size: 18 })} label="Equipo" onClick={() => onAddModule(TEAM_MODULE)} />
                    <ModuleItem icon={React.createElement(MODULE_INFO.stats.icon, { size: 18 })} label="Estadísticas" onClick={() => onAddModule(STATS_MODULE)} />
                    <ModuleItem icon={React.createElement(MODULE_INFO.hero.icon, { size: 18 })} label="Portada" onClick={() => onAddModule(HERO_MODULE)} />
                    <ModuleItem icon={React.createElement(MODULE_INFO.hero2.icon, { size: 18 })} label="Portada Solutium" onClick={() => onAddModule(HERO2_MODULE)} />
                    <ModuleItem icon={React.createElement(MODULE_INFO.process.icon, { size: 18 })} label="Proceso" onClick={() => onAddModule(PROCESS_MODULE)} />
                    <ModuleItem icon={React.createElement(MODULE_INFO.about.icon, { size: 18 })} label="Sobre Nosotros" onClick={() => onAddModule(ABOUT_MODULE)} />
                  </div>
                )}
              </div>

              {/* CONVERSI?N */}
              <div className="space-y-2">
                <button
                  onClick={() => toggleCategory('conversion')}
                  className={`w-full flex items-center justify-between px-4 py-1 text-xs uppercase tracking-widest transition-all ${
                    expandedCategory === 'conversion' ? 'font-bold text-slate-900' : 'font-semibold text-slate-500 hover:text-primary'
                  }`}
                >
                  Conversión
                  <ChevronDown size={12} className={`transition-transform ${expandedCategory === 'conversion' ? 'rotate-180' : ''}`} />
                </button>
                {expandedCategory === 'conversion' && (
                  <div className="space-y-0.5 px-2">
                    <ModuleItem icon={React.createElement(MODULE_INFO.cta.icon, { size: 18 })} label="Call to Action" onClick={() => onAddModule(CTA_MODULE)} />
                    <ModuleItem icon={React.createElement(MODULE_INFO.dynamic_cards.icon, { size: 18 })} label="Tarjetas dinámicas" onClick={() => onAddModule(DYNAMIC_CARDS_MODULE)} />
                    <ModuleItem icon={React.createElement(MODULE_INFO.contact.icon, { size: 18 })} label="Contacto" onClick={() => onAddModule(CONTACT_MODULE)} />
                    <ModuleItem icon={React.createElement(MODULE_INFO.genius_web_wa.icon, { size: 18 })} label="Genius Web-WA" onClick={() => onAddModule(GENIUS_WEB_WA_MODULE)} />
                    <ModuleItem icon={React.createElement(MODULE_INFO.newsletter.icon, { size: 18 })} label="Newsletter" onClick={() => onAddModule(NEWSLETTER_MODULE)} />
                    <ModuleItem icon={React.createElement(MODULE_INFO.pricing.icon, { size: 18 })} label="Planes" onClick={() => onAddModule(PRICING_MODULE)} />
                    <ModuleItem icon={React.createElement(MODULE_INFO.header.icon, { size: 18 })} label="Publicidad" onClick={() => onAddModule(HEADER_MODULE)} />
                    <ModuleItem icon={React.createElement(MODULE_INFO.products.icon, { size: 18 })} label="Productos y Servicios" onClick={() => onAddModule(PRODUCTS_MODULE)} />
                  </div>
                )}
              </div>

              {/* SOCIAL */}
              <div className="space-y-2">
                <button
                  onClick={() => toggleCategory('social')}
                  className={`w-full flex items-center justify-between px-4 py-1 text-xs uppercase tracking-widest transition-all ${
                    expandedCategory === 'social' ? 'font-bold text-slate-900' : 'font-semibold text-slate-500 hover:text-primary'
                  }`}
                >
                  Social
                  <ChevronDown size={12} className={`transition-transform ${expandedCategory === 'social' ? 'rotate-180' : ''}`} />
                </button>
                {expandedCategory === 'social' && (
                  <div className="space-y-0.5 px-2">
                    <ModuleItem icon={React.createElement(MODULE_INFO.faq.icon, { size: 18 })} label="FAQ" onClick={() => onAddModule(FAQ_MODULE)} />
                    <ModuleItem icon={React.createElement(MODULE_INFO.trusted_logos.icon, { size: 18 })} label="Logos de Empresas" onClick={() => onAddModule(TRUSTED_LOGOS_MODULE)} />
                    <ModuleItem icon={React.createElement(MODULE_INFO.testimonials.icon, { size: 18 })} label="Testimonios" onClick={() => onAddModule(TESTIMONIALS_MODULE)} />
                  </div>
                )}
              </div>

              {/* MULTIMEDIA */}
              <div className="space-y-2">
                <button
                  onClick={() => toggleCategory('multimedia')}
                  className={`w-full flex items-center justify-between px-4 py-1 text-xs uppercase tracking-widest transition-all ${
                    expandedCategory === 'multimedia' ? 'font-bold text-slate-900' : 'font-semibold text-slate-500 hover:text-primary'
                  }`}
                >
                  Multimedia
                  <ChevronDown size={12} className={`transition-transform ${expandedCategory === 'multimedia' ? 'rotate-180' : ''}`} />
                </button>
                {expandedCategory === 'multimedia' && (
                  <div className="space-y-0.5 px-2">
                    <ModuleItem icon={React.createElement(MODULE_INFO.comparative.icon, { size: 18 })} label="Comparativo" onClick={() => onAddModule(COMPARISON_MODULE)} />
                    <ModuleItem icon={React.createElement(MODULE_INFO.gallery.icon, { size: 18 })} label="Galería" onClick={() => onAddModule(GALLERY_MODULE)} />
                    <ModuleItem icon={React.createElement(MODULE_INFO.video.icon, { size: 18 })} label="Video" onClick={() => onAddModule(VIDEO_MODULE)} />
                  </div>
                )}
              </div>

              <div className="mx-4 border-t border-slate-200" />

              <div className="space-y-0.5 px-2">
                <ModuleItem icon={React.createElement(MODULE_INFO.bento.icon, { size: 18 })} label="Diseño libre" onClick={() => onAddModule(BENTO_MODULE)} />
                <ModuleItem icon={React.createElement(MODULE_INFO.footer.icon, { size: 18 })} label="Pie de página" onClick={() => onAddModule(FOOTER_MODULE)} />
                <ModuleItem icon={React.createElement(MODULE_INFO.spacer.icon, { size: 18 })} label="Espaciadores" onClick={() => onAddModule(SPACER_MODULE)} />
              </div>
            </div>
          )}


        <div className="space-y-1">
          <button
            onClick={() => toggleSection('diseno')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
              expandedSection === 'diseno' ? 'text-slate-900 font-bold bg-slate-50' : 'text-slate-600 hover:text-primary hover:bg-primary/5'
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

        {/* AJUSTES */}
        <SidebarItem
          icon={<Settings size={20} />}
          label="Ajustes"
          active={activeTab === 'settings'}
          onClick={() => onTabChange('settings')}
        />

      </div>

      {/* User Profile Section */}
      <div className="p-6 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden">
            {project?.projectIconUrl ? (
              <img src={project.projectIconUrl} alt="Project Icon" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User className="text-slate-500 w-5 h-5" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-slate-800 leading-none truncate max-w-[160px]">
              {project?.name || 'Proyecto'}
            </span>
            <span className="text-xs text-slate-500 font-normal mt-1 tracking-wider">Proyecto Activo</span>
          </div>
        </div>
      </div>
    </div>
  );
};



