import React, { useState } from 'react';
import { 
  Home, 
  PlusCircle, 
  Settings, 
  Database,
  Layout, 
  Type, 
  Layers, 
  Eye, 
  Save, 
  Smartphone, 
  Monitor, 
  RotateCcw, 
  Maximize, 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  Sparkles, 
  Trash2, 
  Link as LinkIcon, 
  GripVertical,
  CheckCircle2,
  FileText,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DataTab } from '../DataTab';
import { Project } from '../../types/schema';

// --- SUB-COMPONENTS ---

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
        ? 'bg-white/10 text-white font-bold' 
        : 'text-white/60 hover:text-white hover:bg-white/5 font-medium'
    }`}
  >
    <div className={active ? 'text-white' : 'text-white/60'}>{icon}</div>
    <span className="text-sm">{label}</span>
  </button>
);

const MainSidebar = ({ 
  activeTab, 
  onTabChange, 
  onBackToDashboard,
  logoUrl,
  project
}: { 
  activeTab: string, 
  onTabChange: (tab: string) => void, 
  onBackToDashboard: () => void,
  logoUrl: string | null,
  project: Project | null
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('constructor');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('navegacion');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  return (
    <div className="w-[280px] bg-[#004D56] flex flex-col z-40 h-full border-r border-white/5">
      {/* Logo Section */}
      <div className="p-8 pb-10">
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2" referrerPolicy="no-referrer" />
            ) : (
              <FileText className="text-[#004D56] w-8 h-8" />
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar pb-10">
        {/* DISEÑO */}
        <div className="space-y-1">
          <button 
            onClick={() => toggleSection('diseno')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
              expandedSection === 'diseno' ? 'text-white font-bold' : 'text-white/60 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Monitor size={20} />
              <span className="text-sm">Diseño</span>
            </div>
            <ChevronDown size={16} className={`transition-transform ${expandedSection === 'diseno' ? 'rotate-180' : ''}`} />
          </button>
          {expandedSection === 'diseno' && (
            <div className="pl-12 py-2 space-y-2">
              <p className="text-[11px] text-white/40 font-bold uppercase tracking-widest">Opciones de diseño</p>
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
                ? 'bg-white text-[#3B82F6] font-bold shadow-xl shadow-black/10' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Layout size={20} />
              <span className="text-sm">Constructor</span>
            </div>
            <ChevronDown size={16} className={`transition-transform ${expandedSection === 'constructor' ? 'rotate-180' : ''}`} />
          </button>

          {expandedSection === 'constructor' && (
            <div className="mt-4 space-y-4">
              {/* NAVEGACIÓN */}
              <div className="space-y-2">
                <button 
                  onClick={() => toggleCategory('navegacion')}
                  className="w-full flex items-center justify-between px-4 py-1 text-[10px] font-black text-blue-300 uppercase tracking-widest"
                >
                  Navegación
                  <ChevronDown size={12} className={`transition-transform ${expandedCategory === 'navegacion' ? 'rotate-180' : ''}`} />
                </button>
                {expandedCategory === 'navegacion' && (
                  <div className="space-y-0.5 px-2">
                    <ModuleItem icon={<Monitor size={18} />} label="Barra superior" />
                    <ModuleItem icon={<FileText size={18} />} label="Menú" />
                    <ModuleItem icon={<Layout size={18} />} label="Pie de página" />
                    <ModuleItem icon={<RotateCcw size={18} className="rotate-90" />} label="Espaciadores" />
                  </div>
                )}
              </div>

              {/* CONTENIDO */}
              <div className="space-y-2">
                <button 
                  onClick={() => toggleCategory('contenido')}
                  className="w-full flex items-center justify-between px-4 py-1 text-[10px] font-black text-blue-300 uppercase tracking-widest"
                >
                  Contenido
                  <ChevronDown size={12} className={`transition-transform ${expandedCategory === 'contenido' ? 'rotate-180' : ''}`} />
                </button>
                {expandedCategory === 'contenido' && (
                  <div className="space-y-0.5 px-2">
                    <ModuleItem icon={<Sparkles size={18} />} label="Portada" />
                    <ModuleItem icon={<Type size={18} />} label="Características" />
                    <ModuleItem icon={<User size={18} />} label="Sobre Nosotros" />
                    <ModuleItem icon={<Layers size={18} />} label="Proceso" />
                    <ModuleItem icon={<PlusCircle size={18} />} label="Galería" />
                    <ModuleItem icon={<Monitor size={18} />} label="Video" />
                  </div>
                )}
              </div>

              {/* CONFIANZA */}
              <div className="space-y-2">
                <button 
                  onClick={() => toggleCategory('confianza')}
                  className="w-full flex items-center justify-between px-4 py-1 text-[10px] font-black text-blue-300 uppercase tracking-widest"
                >
                  Confianza
                  <ChevronDown size={12} className={`transition-transform ${expandedCategory === 'confianza' ? 'rotate-180' : ''}`} />
                </button>
                {expandedCategory === 'confianza' && (
                  <div className="space-y-0.5 px-2">
                    <ModuleItem icon={<FileText size={18} />} label="Testimonios" />
                    <ModuleItem icon={<CheckCircle2 size={18} />} label="Clientes" />
                    <ModuleItem icon={<Database size={18} />} label="Estadísticas" />
                    <ModuleItem icon={<User size={18} />} label="Equipo" />
                  </div>
                )}
              </div>

              {/* VENTAS */}
              <div className="space-y-2">
                <button 
                  onClick={() => toggleCategory('ventas')}
                  className="w-full flex items-center justify-between px-4 py-1 text-[10px] font-black text-blue-300 uppercase tracking-widest"
                >
                  Ventas
                  <ChevronDown size={12} className={`transition-transform ${expandedCategory === 'ventas' ? 'rotate-180' : ''}`} />
                </button>
                {expandedCategory === 'ventas' && (
                  <div className="space-y-0.5 px-2">
                    <ModuleItem icon={<Layout size={18} />} label="Productos" />
                    <ModuleItem icon={<Settings size={18} />} label="Planes" />
                    <ModuleItem icon={<PlusCircle size={18} />} label="Call to Action (C...)" />
                  </div>
                )}
              </div>

              {/* CONTACTO */}
              <div className="space-y-2">
                <button 
                  onClick={() => toggleCategory('contacto')}
                  className="w-full flex items-center justify-between px-4 py-1 text-[10px] font-black text-blue-300 uppercase tracking-widest"
                >
                  Contacto
                  <ChevronDown size={12} className={`transition-transform ${expandedCategory === 'contacto' ? 'rotate-180' : ''}`} />
                </button>
                {expandedCategory === 'contacto' && (
                  <div className="space-y-0.5 px-2">
                    <ModuleItem icon={<Home size={18} />} label="Contacto" />
                    <ModuleItem icon={<FileText size={18} />} label="Newsletter" />
                    <ModuleItem icon={<Settings size={18} />} label="FAQ" />
                  </div>
                )}
              </div>
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

        {/* DATOS */}
        <SidebarItem 
          icon={<Database size={20} />} 
          label="Datos" 
          active={activeTab === 'datos'} 
          onClick={() => onTabChange('datos')}
        />
      </div>

      {/* User Profile Section */}
      <div className="p-6 border-t border-white/5 bg-black/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center overflow-hidden">
            {project?.projectIconUrl ? (
              <img src={project.projectIconUrl} alt="Project Icon" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User className="text-white w-5 h-5" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white leading-none truncate max-w-[160px]">
              {project?.name || 'Proyecto'}
            </span>
            <span className="text-[10px] text-white/40 font-bold mt-1 uppercase tracking-wider">Proyecto Activo</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ModuleItem = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
  <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all group">
    <div className="text-white/40 group-hover:text-white transition-colors">{icon}</div>
    <span className="text-[13px] font-medium">{label}</span>
  </button>
);

const StructurePanel = () => (
  <div className="w-[260px] bg-white border-r border-slate-100 flex flex-col z-30 shadow-xl shadow-slate-200/30">
    <div className="p-4 flex items-center justify-between border-b border-slate-50">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-rose-500 rounded-lg flex items-center justify-center">
          <Layers className="text-white w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-bold text-slate-800">Estructura</span>
      </div>
      <button className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-lg transition-colors">
        <RotateCcw size={14} />
      </button>
    </div>

    <div className="p-3 space-y-2">
      {/* Barra Superior Item */}
      <div className="flex items-center gap-2.5 p-2.5 bg-slate-50/50 rounded-xl border border-slate-100 group cursor-pointer hover:border-slate-200 transition-all">
        <GripVertical className="text-slate-300" size={14} />
        <div className="w-7 h-7 bg-white border border-slate-100 rounded-lg flex items-center justify-center">
          <Monitor className="text-slate-400" size={12} />
        </div>
        <span className="text-[11px] font-bold text-slate-700 flex-1">Barra Superior</span>
      </div>

      {/* Portada Item */}
      <div className="flex items-center gap-2.5 p-2.5 bg-blue-50/50 rounded-xl border border-blue-100 group cursor-pointer hover:bg-blue-50 transition-all">
        <GripVertical className="text-blue-200" size={14} />
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
          <Sparkles className="text-white w-3.5 h-3.5" />
        </div>
        <span className="text-[11px] font-bold text-blue-700 flex-1">Portada</span>
        <div className="flex items-center gap-1.5">
          <Eye size={12} className="text-blue-400 hover:text-blue-600" />
          <LinkIcon size={12} className="text-blue-400 hover:text-blue-600" />
          <Trash2 size={12} className="text-blue-400 hover:text-blue-600" />
        </div>
      </div>
    </div>

    {/* Editor Panel Section */}
    <div className="flex-1 overflow-y-auto border-t border-slate-50 custom-scrollbar">
      <div className="p-4 space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-rose-500 rounded-md flex items-center justify-center">
            <Sparkles className="text-white w-2.5 h-2.5" />
          </div>
          <span className="text-[11px] font-bold text-slate-800">Portada</span>
          <ChevronDown size={12} className="ml-auto text-slate-400" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-2">
              <Type size={12} className="text-blue-500" />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Editor de textos</span>
            </div>
            <ChevronDown size={12} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-300 uppercase tracking-widest pl-1">Elemento a editar</label>
            <div className="flex items-center justify-between p-2.5 border border-slate-100 rounded-xl text-[11px] font-bold text-slate-700 bg-white shadow-sm hover:border-slate-200 cursor-pointer transition-all">
              Título
              <ChevronDown size={12} className="text-slate-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-300 uppercase tracking-widest pl-1">Contenido del texto</label>
            <div className="p-3.5 border border-slate-100 rounded-xl bg-slate-50/30 min-h-[70px] hover:bg-slate-50 transition-colors">
              <p className="text-[11px] font-bold text-slate-800 leading-relaxed">Bienvenido al constructor web</p>
              <p className="text-[8px] text-slate-300 mt-2 font-bold italic tracking-wide uppercase">* Usa asteriscos para resaltar: *texto*</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-300 uppercase tracking-widest pl-1">Tamaño</label>
              <div className="flex items-center justify-between p-2 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-700 bg-white hover:border-slate-200 cursor-pointer transition-all">
                Título 1 (H1)
                <ChevronDown size={10} className="text-slate-400" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-300 uppercase tracking-widest pl-1">Peso</label>
              <div className="flex items-center justify-between p-2 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-700 bg-white hover:border-slate-200 cursor-pointer transition-all">
                Black
                <ChevronDown size={10} className="text-slate-400" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-50/50 rounded-xl border border-slate-100">
            <div className="flex-1 flex justify-center p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg cursor-pointer transition-all"><Layout size={12} /></div>
            <div className="flex-1 flex justify-center p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg cursor-pointer transition-all"><Layout size={12} className="rotate-90" /></div>
            <div className="flex-1 flex justify-center p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg cursor-pointer transition-all"><Layout size={12} className="rotate-180" /></div>
            <div className="w-px h-3 bg-slate-200 mx-0.5"></div>
            <div className="flex-1 flex justify-center p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg cursor-pointer italic font-serif text-xs font-bold">I</div>
            <div className="flex-1 flex justify-center p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg cursor-pointer underline text-xs font-bold">U</div>
            <div className="flex-1 flex justify-center p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg cursor-pointer line-through text-xs font-bold">S</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const TopBar = () => (
  <div className="h-[60px] bg-white border-b border-slate-100 flex items-center justify-between px-6 z-20">
    <div className="flex flex-col">
      <h2 className="text-sm font-bold text-slate-800">Editor de Módulos</h2>
      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Añade módulos para construir tu página</p>
    </div>

    <div className="flex items-center gap-4">
      <div className="flex items-center gap-3 border-r border-slate-100 pr-4">
        <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-all"><RotateCcw size={16} /></button>
        <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl">
          <button className="p-1.5 text-blue-600 bg-white shadow-sm rounded-lg transition-all"><Monitor size={14} /></button>
          <button className="p-1.5 text-slate-400 hover:text-blue-600 transition-all"><Smartphone size={14} /></button>
        </div>
        <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-all"><Maximize size={16} /></button>
      </div>

      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 px-4 py-2 text-slate-600 font-bold text-xs hover:bg-slate-50 rounded-xl transition-all">
          <Eye size={16} />
          Vista Previa
        </button>
        <button className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-100 transition-all">
          <Save size={16} />
          Guardar
        </button>
      </div>
    </div>
  </div>
);

const Canvas = () => (
  <div className="flex-1 bg-slate-50 p-12 overflow-y-auto flex flex-col items-center">
    {/* Preview Window */}
    <div className="w-full max-w-5xl bg-white shadow-2xl rounded-2xl overflow-hidden border border-slate-200/50 min-h-[800px] flex flex-col">
      {/* Top Banner */}
      <div className="bg-blue-600 py-2 px-6 flex items-center justify-between text-white text-[10px] font-bold">
        <div className="flex items-center gap-4">
          <span>¡Bienvenidos a nuestro sitio web!</span>
          <span className="underline cursor-pointer">Comprar ahora</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <span>f</span><span>y</span><span>o</span><span>in</span>
          </div>
          <span className="opacity-50">x</span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="flex-1 bg-[#0F172A] flex flex-col items-center justify-center text-center p-20 relative group">
        {/* IA Badge */}
        <div className="absolute top-8 right-8 flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
          <Sparkles size={12} className="text-blue-400" />
          <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Optimizado por IA</span>
        </div>

        {/* Edit Controls Overlay (Visible on Hover) */}
        <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"><Settings size={14} /></button>
          <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"><Trash2 size={14} /></button>
        </div>

        <h1 className="text-6xl font-black text-white mb-8 max-w-3xl leading-[1.1]">
          Bienvenido al <br /> constructor web
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mb-12 leading-relaxed">
          Empieza a construir tu página agregando módulos desde el constructor a la izquierda.
        </p>

        <div className="flex items-center gap-6">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-bold text-sm shadow-xl shadow-blue-900/20 transition-all">
            EMPEZAR AHORA
          </button>
          <button className="text-slate-400 hover:text-white font-bold text-sm flex items-center gap-2 transition-colors">
            VER DEMO
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Add Module Button */}
      <div className="p-12 flex justify-center bg-white">
        <button className="flex items-center gap-3 px-8 py-4 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 font-bold hover:border-blue-200 hover:text-blue-500 transition-all group">
          <Plus size={20} className="group-hover:scale-110 transition-transform" />
          Añadir Módulo
        </button>
      </div>
    </div>

    {/* Bottom Status Bar */}
    <div className="fixed bottom-8 right-8 flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-100">
      <div className="w-5 h-5 bg-emerald-50 rounded-full flex items-center justify-center">
        <CheckCircle2 className="text-emerald-500 w-3.5 h-3.5" />
      </div>
      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Configuración Recibida</span>
    </div>
  </div>
);

// --- MAIN COMPONENT ---

interface WebConstructorProps {
  onBackToDashboard: () => void;
  projectId: string | null;
  currentUserId: string | null;
  logoUrl: string | null;
  project: Project | null;
}

export const WebConstructor: React.FC<WebConstructorProps> = ({ 
  onBackToDashboard, 
  projectId, 
  currentUserId,
  logoUrl,
  project
}) => {
  const [activeTab, setActiveTab] = useState('constructor');

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-white font-sans antialiased">
      <MainSidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onBackToDashboard={onBackToDashboard} 
        logoUrl={logoUrl}
        project={project}
      />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {activeTab === 'constructor' && (
          <div className="flex flex-1 h-full overflow-hidden">
            <StructurePanel />
            <div className="flex-1 flex flex-col h-full">
              <TopBar />
              <Canvas />
            </div>
          </div>
        )}

        {activeTab === 'datos' && (
          <div className="flex-1 h-full overflow-auto bg-[#F8FAFC]">
            <div className="p-8">
              <div className="flex flex-col mb-8">
                <h2 className="text-3xl font-bold text-slate-800">Gestión de Datos</h2>
                <p className="text-sm text-slate-400 font-medium">Administra la información de tu proyecto de forma profesional.</p>
              </div>
              <DataTab projectId={projectId || ''} currentUserId={currentUserId || ''} />
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="flex-1 h-full overflow-auto bg-[#F8FAFC] flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                <Settings className="text-slate-400 w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Ajustes del Proyecto</h2>
              <p className="text-slate-400 max-w-xs mx-auto">Configura los parámetros generales de tu sitio web.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
