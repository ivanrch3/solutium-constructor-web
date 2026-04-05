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
  User,
  Image as ImageIcon,
  Star,
  MousePointer2,
  Box,
  Send,
  Upload,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DataTab } from '../DataTab';
import { Project, RenderingContract } from '../../types/schema';
import { WebModule, ModuleElement, SettingGroupType, EditorState, SettingDefinition } from '../../types/constructor';
import { ProductsModule } from './modules/ProductsModule';
import { HeroModule } from './modules/HeroModule';
import { FeaturesModule } from './modules/FeaturesModule';
import { saveWebBuilderSiteDraft, publishWebBuilderSite, getProducts } from '../../services/dataService';
import { syncAsset } from '../../services/assetService';
import { Product } from '../../types/schema';

// --- CONSTANTS ---

const PRODUCTS_MODULE: WebModule = {
  id: 'mod_products_1',
  type: 'products',
  name: 'Productos',
  globalGroups: ['contenido', 'estructura', 'estilo', 'multimedia', 'interaccion'],
  globalSettings: {
    contenido: [
      { id: 'section_title', label: 'Título de la Sección', type: 'text', defaultValue: 'Nuestros Productos' },
      { id: 'section_desc', label: 'Descripción', type: 'text', defaultValue: 'Descubre nuestra selección exclusiva de productos.' },
      { id: 'select_products', label: 'Selección de Productos', type: 'button', defaultValue: 'Seleccionar' }
    ],
    estructura: [
      { id: 'columns', label: 'Columnas', type: 'range', defaultValue: 4, min: 1, max: 6 },
      { id: 'gap', label: 'Espaciado', type: 'range', defaultValue: 24, min: 0, max: 100, unit: 'px' }
    ],
    estilo: [
      { id: 'dark_mode', label: 'Modo Oscuro', type: 'boolean', defaultValue: false },
      { id: 'bg_color', label: 'Color de Fondo', type: 'color', defaultValue: '#FFFFFF' }
    ],
    interaccion: [
      { id: 'hover_effect', label: 'Efecto al pasar el mouse', type: 'select', defaultValue: 'zoom', options: [
        { label: 'Ninguno', value: 'none' },
        { label: 'Zoom', value: 'zoom' },
        { label: 'Levantar', value: 'lift' }
      ]}
    ],
    tipografia: [],
    multimedia: [
      { id: 'section_bg_image', label: 'Imagen de Fondo de Sección', type: 'image', defaultValue: '' }
    ]
  },
  elements: [
    { 
      id: 'el_img', 
      name: 'Imagen del Producto', 
      type: 'image', 
      groups: ['contenido', 'estructura', 'estilo', 'multimedia', 'interaccion'],
      settings: {
        multimedia: [
          { id: 'aspect_ratio', label: 'Proporción', type: 'select', defaultValue: '1:1', options: [
            { label: '1:1 (Cuadrado)', value: '1:1' },
            { label: '4:5 (Retrato)', value: '4:5' },
            { label: '16:9 (Panorámico)', value: '16:9' }
          ]}
        ],
        estilo: [
          { id: 'border_radius', label: 'Redondeo', type: 'range', defaultValue: 16, min: 0, max: 50, unit: 'px' }
        ],
        contenido: [],
        estructura: [],
        tipografia: [],
        interaccion: []
      }
    },
    { 
      id: 'el_title', 
      name: 'Título del Producto', 
      type: 'text', 
      groups: ['contenido', 'estructura', 'tipografia', 'interaccion'],
      settings: {
        tipografia: [
          { id: 'font_size', label: 'Tamaño de Fuente', type: 'range', defaultValue: 16, min: 12, max: 24, unit: 'px' },
          { id: 'font_weight', label: 'Grosor', type: 'select', defaultValue: 'bold', options: [
            { label: 'Normal', value: 'normal' },
            { label: 'Medio', value: 'medium' },
            { label: 'Negrita', value: 'bold' },
            { label: 'Extra Negrita', value: 'black' }
          ]}
        ],
        contenido: [],
        estructura: [],
        estilo: [],
        multimedia: [],
        interaccion: []
      }
    },
    { 
      id: 'el_price', 
      name: 'Precio', 
      type: 'price', 
      groups: ['contenido', 'estructura', 'estilo', 'tipografia'],
      settings: {
        contenido: [
          { id: 'currency', label: 'Moneda', type: 'text', defaultValue: '$' }
        ],
        tipografia: [
          { id: 'price_size', label: 'Tamaño del Precio', type: 'range', defaultValue: 18, min: 14, max: 32, unit: 'px' }
        ],
        estructura: [],
        estilo: [],
        multimedia: [],
        interaccion: []
      }
    },
    { id: 'el_badge', name: 'Etiquetas / Badges', type: 'badge', groups: ['contenido', 'estilo'], settings: {
      contenido: [
        { id: 'show_badge', label: 'Mostrar Etiquetas', type: 'boolean', defaultValue: true }
      ],
      estilo: [
        { id: 'badge_bg', label: 'Color de Fondo', type: 'color', defaultValue: '#2563EB' }
      ],
      estructura: [],
      tipografia: [],
      multimedia: [],
      interaccion: []
    }},
    { id: 'el_rating', name: 'Valoración', type: 'rating', groups: ['contenido', 'estilo'], settings: {
      contenido: [
        { id: 'show_rating', label: 'Mostrar Valoración', type: 'boolean', defaultValue: true }
      ],
      estilo: [
        { id: 'star_color', label: 'Color de Estrellas', type: 'color', defaultValue: '#FBBF24' }
      ],
      estructura: [],
      tipografia: [],
      multimedia: [],
      interaccion: []
    }},
    { id: 'el_cta', name: 'Botón de Acción', type: 'button', groups: ['contenido', 'estilo', 'interaccion'], settings: {
      contenido: [
        { id: 'cta_text', label: 'Texto del Botón', type: 'text', defaultValue: 'Añadir' }
      ],
      estilo: [
        { id: 'cta_bg', label: 'Color de Fondo', type: 'color', defaultValue: '#0F172A' },
        { id: 'cta_color', label: 'Color de Texto', type: 'color', defaultValue: '#FFFFFF' }
      ],
      interaccion: [
        { id: 'cta_hover_bg', label: 'Color al pasar el mouse', type: 'color', defaultValue: '#2563EB' }
      ],
      estructura: [],
      tipografia: [],
      multimedia: []
    }},
    { id: 'el_desc', name: 'Descripción Corta', type: 'text', groups: ['contenido', 'tipografia'], settings: {
      contenido: [
        { id: 'show_desc', label: 'Mostrar Descripción', type: 'boolean', defaultValue: false }
      ],
      tipografia: [
        { id: 'desc_size', label: 'Tamaño de Fuente', type: 'range', defaultValue: 12, min: 10, max: 16, unit: 'px' }
      ],
      estructura: [],
      estilo: [],
      multimedia: [],
      interaccion: []
    }},
  ]
};

const HERO_MODULE: WebModule = {
  id: 'mod_hero_1',
  type: 'hero',
  name: 'Portada / Hero',
  globalGroups: ['contenido', 'estructura', 'estilo', 'multimedia', 'interaccion'],
  globalSettings: {
    contenido: [
      { id: 'title', label: 'Título Principal', type: 'text', defaultValue: 'Construye tu futuro hoy' },
      { id: 'subtitle', label: 'Subtítulo', type: 'text', defaultValue: 'La plataforma más completa para gestionar tu negocio.' }
    ],
    estructura: [
      { id: 'height', label: 'Altura (vh)', type: 'range', defaultValue: 80, min: 40, max: 100, unit: 'vh' }
    ],
    estilo: [
      { id: 'overlay_opacity', label: 'Opacidad del Overlay', type: 'range', defaultValue: 50, min: 0, max: 100, unit: '%' }
    ],
    multimedia: [
      { id: 'bg_image', label: 'Imagen de Fondo', type: 'image', defaultValue: '' }
    ],
    interaccion: [],
    tipografia: []
  },
  elements: []
};

const FEATURES_MODULE: WebModule = {
  id: 'mod_features_1',
  type: 'features',
  name: 'Características',
  globalGroups: ['contenido', 'estructura', 'estilo', 'multimedia', 'interaccion'],
  globalSettings: {
    contenido: [
      { id: 'title', label: 'Título', type: 'text', defaultValue: 'Nuestras Ventajas' }
    ],
    estructura: [
      { id: 'columns', label: 'Columnas', type: 'range', defaultValue: 3, min: 1, max: 4 }
    ],
    estilo: [],
    multimedia: [
      { id: 'section_icon', label: 'Icono de Sección', type: 'image', defaultValue: '' }
    ],
    interaccion: [],
    tipografia: []
  },
  elements: []
};

const GROUP_LABELS: Record<SettingGroupType, string> = {
  contenido: 'Contenido',
  estructura: 'Estructura',
  estilo: 'Estilo',
  tipografia: 'Tipografía',
  multimedia: 'Multimedia',
  interaccion: 'Interacción'
};

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
        ? 'text-white font-bold' 
        : 'text-white/60 hover:text-white hover:bg-white/5 font-medium'
    }`}
  >
    <div className={active ? 'text-white' : 'text-white/60'}>{icon}</div>
    <span className="text-base">{label}</span>
  </button>
);

const MainSidebar = ({ 
  activeTab, 
  onTabChange, 
  onBackToDashboard,
  logoUrl,
  project,
  onAddModule
}: { 
  activeTab: string, 
  onTabChange: (tab: string) => void, 
  onBackToDashboard: () => void,
  logoUrl: string | null,
  project: Project | null,
  onAddModule: (module: WebModule) => void
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('constructor');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('ventas');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  return (
    <div className="w-[280px] bg-[#004D56] flex flex-col z-40 h-full border-r border-white/5">
      {/* Logo Section */}
      <div className="p-6">
        <div className="flex items-center justify-center">
          <div className="h-12 w-full flex items-center justify-center">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-full w-auto object-contain" referrerPolicy="no-referrer" />
            ) : (
              <FileText className="text-white/20 w-10 h-10" />
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
              <span className="text-base">Diseño</span>
            </div>
            <ChevronDown size={16} className={`transition-transform ${expandedSection === 'diseno' ? 'rotate-180' : ''}`} />
          </button>
          {expandedSection === 'diseno' && (
            <div className="pl-12 py-2 space-y-2">
              <p className="text-xs text-white/40 font-normal uppercase tracking-widest">Opciones de diseño</p>
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
                ? 'text-white font-bold' 
                : 'text-white/60 hover:text-white'
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
                  className={`w-full flex items-center justify-between px-4 py-1 text-xs text-blue-300 uppercase tracking-widest transition-all ${
                    expandedCategory === 'navegacion' ? 'font-bold' : 'font-normal'
                  }`}
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
                  className={`w-full flex items-center justify-between px-4 py-1 text-xs text-blue-300 uppercase tracking-widest transition-all ${
                    expandedCategory === 'contenido' ? 'font-bold' : 'font-normal'
                  }`}
                >
                  Contenido
                  <ChevronDown size={12} className={`transition-transform ${expandedCategory === 'contenido' ? 'rotate-180' : ''}`} />
                </button>
                {expandedCategory === 'contenido' && (
                  <div className="space-y-0.5 px-2">
                    <ModuleItem 
                      icon={<Sparkles size={18} />} 
                      label="Portada" 
                      onClick={() => onAddModule(HERO_MODULE)}
                    />
                    <ModuleItem 
                      icon={<Type size={18} />} 
                      label="Características" 
                      onClick={() => onAddModule(FEATURES_MODULE)}
                    />
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
                  className={`w-full flex items-center justify-between px-4 py-1 text-xs text-blue-300 uppercase tracking-widest transition-all ${
                    expandedCategory === 'confianza' ? 'font-bold' : 'font-normal'
                  }`}
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
                  className={`w-full flex items-center justify-between px-4 py-1 text-xs text-blue-300 uppercase tracking-widest transition-all ${
                    expandedCategory === 'ventas' ? 'font-bold' : 'font-normal'
                  }`}
                >
                  Ventas
                  <ChevronDown size={12} className={`transition-transform ${expandedCategory === 'ventas' ? 'rotate-180' : ''}`} />
                </button>
                {expandedCategory === 'ventas' && (
                  <div className="space-y-0.5 px-2">
                    <ModuleItem 
                      icon={<Layout size={18} />} 
                      label="Productos" 
                      onClick={() => onAddModule(PRODUCTS_MODULE)}
                    />
                    <ModuleItem icon={<Settings size={18} />} label="Planes" />
                    <ModuleItem icon={<PlusCircle size={18} />} label="Call to Action (C...)" />
                  </div>
                )}
              </div>

              {/* CONTACTO */}
              <div className="space-y-2">
                <button 
                  onClick={() => toggleCategory('contacto')}
                  className={`w-full flex items-center justify-between px-4 py-1 text-xs text-blue-300 uppercase tracking-widest transition-all ${
                    expandedCategory === 'contacto' ? 'font-bold' : 'font-normal'
                  }`}
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
            <span className="text-base font-bold text-white leading-none truncate max-w-[160px]">
              {project?.name || 'Proyecto'}
            </span>
            <span className="text-xs text-white/40 font-normal mt-1 uppercase tracking-wider">Proyecto Activo</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ModuleItem = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all group"
  >
    <div className="text-white/40 group-hover:text-white transition-colors">{icon}</div>
    <span className="text-sm font-medium">{label}</span>
  </button>
);

interface StructurePanelProps {
  editorState: EditorState;
  setEditorState: React.Dispatch<React.SetStateAction<EditorState>>;
  onSettingChange: (elementOrModuleId: string, settingId: string, value: any) => void;
  onRemoveModule: (moduleId: string) => void;
  projectId: string | null;
}

const SettingControl: React.FC<{ 
  setting: SettingDefinition, 
  value: any, 
  onChange: (value: any) => void,
  projectId: string | null
}> = ({ setting, value, onChange, projectId }) => {
  const [isUploading, setIsUploading] = useState(false);
  const currentValue = value !== undefined ? value : setting.defaultValue;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !projectId) return;

    setIsUploading(true);
    try {
      const extension = file.name.split('.').pop() || 'png';
      const url = await syncAsset(
        { id: `asset_${Date.now()}`, projectId },
        'web_builder_asset',
        file,
        extension,
        file.type,
        file.name
      );
      onChange(url);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  switch (setting.type) {
    case 'image':
      return (
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400">{setting.label}</label>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">
              {currentValue ? (
                <img src={currentValue} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <ImageIcon size={14} />
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="cursor-pointer">
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                <div className={`flex items-center justify-center gap-2 py-1.5 px-3 border border-slate-100 rounded-md text-[10px] font-bold transition-all ${
                  isUploading ? 'bg-slate-50 text-slate-400' : 'bg-white text-blue-600 hover:bg-blue-50 hover:border-blue-100'
                }`}>
                  {isUploading ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload size={12} />
                      Subir Imagen
                    </>
                  )}
                </div>
              </label>
            </div>
          </div>
        </div>
      );
    case 'range':
      return (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-slate-400">{setting.label}</label>
            <span className="text-[10px] font-medium text-blue-600">{currentValue}{setting.unit}</span>
          </div>
          <input 
            type="range" 
            min={setting.min} 
            max={setting.max} 
            step={setting.step || 1}
            value={currentValue}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" 
          />
        </div>
      );
    case 'select':
      return (
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400">{setting.label}</label>
          <select 
            value={currentValue}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-1.5 border border-slate-100 rounded-md text-[10px] font-medium focus:outline-none focus:border-blue-300 bg-white"
          >
            {setting.options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      );
    case 'boolean':
      return (
        <div className="flex items-center justify-between p-1.5 bg-slate-50 rounded-md">
          <span className="text-[10px] font-medium text-slate-600">{setting.label}</span>
          <button 
            onClick={() => onChange(!currentValue)}
            className={`w-7 h-3.5 rounded-full relative transition-colors ${currentValue ? 'bg-blue-600' : 'bg-slate-200'}`}
          >
            <div className={`absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full shadow-sm transition-all ${currentValue ? 'left-4' : 'left-0.5'}`}></div>
          </button>
        </div>
      );
    case 'color':
      return (
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-slate-400">{setting.label}</label>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase">{currentValue}</span>
            <input 
              type="color"
              value={currentValue}
              onChange={(e) => onChange(e.target.value)}
              className="w-5 h-5 rounded-md border border-slate-200 shadow-sm p-0 overflow-hidden cursor-pointer"
            />
          </div>
        </div>
      );
    case 'button':
      return (
        <div className="p-2 bg-blue-50/50 border border-blue-100 rounded-lg">
          <p className="text-[10px] font-bold text-blue-600 mb-2">{setting.label}</p>
          <button className="w-full py-1.5 bg-white border border-blue-200 rounded-md text-[10px] font-bold text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-1.5">
            <Plus size={12} /> {setting.defaultValue}
          </button>
        </div>
      );
    default:
      return (
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400">{setting.label}</label>
          <input 
            type="text" 
            value={currentValue} 
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-1.5 border border-slate-100 rounded-md text-[10px] font-medium focus:outline-none focus:border-blue-300" 
          />
        </div>
      );
  }
};

const StructurePanel: React.FC<StructurePanelProps> = ({ editorState, setEditorState, onSettingChange, onRemoveModule, projectId }) => {
  const toggleModule = (moduleId: string) => {
    setEditorState(prev => ({
      ...prev,
      expandedModuleId: prev.expandedModuleId === moduleId ? null : moduleId
    }));
  };

  const toggleElement = (elementId: string) => {
    setEditorState(prev => ({
      ...prev,
      selectedElementId: prev.selectedElementId === elementId ? null : elementId
    }));
  };

  const toggleGroup = (elementId: string, group: SettingGroupType) => {
    setEditorState(prev => ({
      ...prev,
      expandedGroupsByElement: {
        ...prev.expandedGroupsByElement,
        [elementId]: prev.expandedGroupsByElement[elementId] === group ? null : group
      }
    }));
  };

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon size={12} />;
      case 'text': return <Type size={12} />;
      case 'price': return <Database size={12} />;
      case 'badge': return <Box size={12} />;
      case 'rating': return <Star size={12} />;
      case 'button': return <MousePointer2 size={12} />;
      case 'global': return <Settings size={12} />;
      default: return <Layers size={12} />;
    }
  };

  return (
    <div className="w-[300px] bg-white border-r border-slate-100 flex flex-col z-30 shadow-xl shadow-slate-200/30 overflow-hidden">
      <div className="p-4 flex items-center justify-between border-b border-slate-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-rose-500 rounded-lg flex items-center justify-center">
            <Layers className="text-white w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-bold text-slate-800">Estructura</span>
        </div>
        <button className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-lg transition-colors">
          <RotateCcw size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {editorState.addedModules.length === 0 && (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
              <Layout className="text-slate-200 w-6 h-6" />
            </div>
            <p className="text-[11px] font-medium text-slate-400">No hay módulos añadidos aún.</p>
          </div>
        )}

        {editorState.addedModules.map(module => {
          const isModuleExpanded = editorState.expandedModuleId === module.id;
          
          // Virtual element for global configuration
          const globalElement: ModuleElement = {
            id: module.id + '_global',
            name: 'Configuración Global',
            type: 'global',
            groups: module.globalGroups
          };

          const allElements = [globalElement, ...module.elements];

          return (
            <div key={module.id} className="p-3 border-b border-slate-50 last:border-0">
              <div 
                onClick={() => toggleModule(module.id)}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer group ${
                  isModuleExpanded 
                    ? 'bg-blue-50 border-blue-100' 
                    : 'bg-slate-50/50 border-slate-100 hover:border-slate-200'
                }`}
              >
                <GripVertical className={isModuleExpanded ? 'text-blue-300' : 'text-slate-300'} size={14} />
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  isModuleExpanded ? 'bg-blue-600' : 'bg-white border border-slate-100'
                }`}>
                  <Layout className={isModuleExpanded ? 'text-white' : 'text-slate-400'} size={12} />
                </div>
                <span className={`text-[14px] font-bold flex-1 ${
                  isModuleExpanded ? 'text-blue-700' : 'text-slate-700'
                }`}>
                  {module.name}
                </span>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveModule(module.id);
                  }}
                  className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  title="Eliminar módulo"
                >
                  <Trash2 size={14} />
                </button>

                <ChevronDown size={14} className={`text-slate-300 transition-transform ${isModuleExpanded ? 'rotate-180 text-blue-500' : ''}`} />
              </div>

              {/* Elements List */}
              <AnimatePresence>
                {isModuleExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-2 ml-4 border-l-2 border-slate-100 pl-3 space-y-1.5 overflow-hidden"
                  >
                    {allElements.map(element => {
                      const isElementSelected = editorState.selectedElementId === element.id;
                      
                      return (
                        <div key={element.id} className="space-y-1">
                          <div 
                            onClick={() => toggleElement(element.id)}
                            className={`flex items-center gap-2.5 p-2 rounded-lg border transition-all cursor-pointer ${
                              isElementSelected 
                                ? 'bg-blue-50/50 border-blue-100' 
                                : 'bg-transparent border-transparent hover:bg-slate-50'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                              isElementSelected ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
                            }`}>
                              {getElementIcon(element.type)}
                            </div>
                            <span className={`text-[11px] font-medium flex-1 ${
                              isElementSelected ? 'text-blue-700' : 'text-slate-500'
                            }`}>
                              {element.name}
                            </span>
                            <ChevronDown size={12} className={`text-slate-300 transition-transform ${isElementSelected ? 'rotate-180 text-blue-500' : ''}`} />
                          </div>

                          {/* Inline Configuration Groups */}
                          <AnimatePresence>
                            {isElementSelected && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="ml-2 space-y-1 overflow-hidden pb-2"
                              >
                                {(['contenido', 'estructura', 'estilo', 'tipografia', 'multimedia', 'interaccion'] as SettingGroupType[]).map(group => {
                                  const isAvailable = element.groups.includes(group);
                                  if (!isAvailable) return null;

                                  const isGroupExpanded = editorState.expandedGroupsByElement[element.id] === group;

                                  return (
                                    <div key={group} className="border border-slate-100 rounded-lg bg-white overflow-hidden shadow-sm">
                                      <button 
                                        onClick={() => toggleGroup(element.id, group)}
                                        className="w-full flex items-center justify-between p-2 hover:bg-slate-50 transition-colors"
                                      >
                                        <span className={`text-[12px] transition-all ${isGroupExpanded ? 'font-bold text-blue-600' : 'font-normal text-slate-500'}`}>
                                          {GROUP_LABELS[group]}
                                        </span>
                                        <ChevronDown size={10} className={`text-slate-300 transition-transform ${isGroupExpanded ? 'rotate-180 text-blue-500' : ''}`} />
                                      </button>
                                      
                                      <AnimatePresence>
                                        {isGroupExpanded && (
                                          <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                          >
                                            <div className="p-3 pt-0 space-y-4 border-t border-slate-50 mt-1">
                                              {/* DYNAMIC SETTINGS FOR EACH GROUP */}
                                              {element.type === 'global' ? (
                                                module.globalSettings?.[group]?.map(setting => (
                                                  <SettingControl 
                                                    key={setting.id} 
                                                    setting={setting} 
                                                    value={editorState.settingsValues[`${module.id}_global_${setting.id}`]}
                                                    onChange={(val) => onSettingChange(`${module.id}_global`, setting.id, val)}
                                                    projectId={projectId}
                                                  />
                                                ))
                                              ) : (
                                                element.settings?.[group]?.map(setting => (
                                                  <SettingControl 
                                                    key={setting.id} 
                                                    setting={setting} 
                                                    value={editorState.settingsValues[`${element.id}_${setting.id}`]}
                                                    onChange={(val) => onSettingChange(element.id, setting.id, val)}
                                                    projectId={projectId}
                                                  />
                                                ))
                                              )}
                                              
                                              {/* Fallback if no settings defined for this group */}
                                              {((element.type === 'global' && !module.globalSettings?.[group]?.length) || 
                                                (element.type !== 'global' && !element.settings?.[group]?.length)) && (
                                                <p className="text-[10px] text-slate-400 italic pt-2">No hay opciones disponibles para este grupo.</p>
                                              )}
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TopBar = ({ onSave, onPublish }: { onSave: () => void, onPublish: () => void }) => (
  <div className="h-[60px] bg-white border-b border-slate-100 flex items-center justify-between px-6 z-20">
    <div className="flex flex-col">
      <h2 className="text-base font-bold text-slate-800">Editor de Módulos</h2>
      <p className="text-xs font-normal text-slate-300 uppercase tracking-wider">Añade módulos para construir tu página</p>
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
        <button 
          onClick={onSave}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 font-bold text-xs hover:bg-slate-50 rounded-xl transition-all"
        >
          <Save size={16} />
          Guardar Borrador
        </button>
        <button 
          onClick={onPublish}
          className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-100 transition-all"
        >
          <Send size={16} />
          Publicar
        </button>
      </div>
    </div>
  </div>
);

const Canvas: React.FC<{ 
  editorState: EditorState, 
  onAddModule: (module: WebModule) => void,
  products: Product[]
}> = ({ editorState, onAddModule, products }) => (
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

      {/* Dynamic Modules */}
      {editorState.addedModules.map(module => {
        if (module.type === 'products') {
          return (
            <ProductsModule 
              key={module.id} 
              moduleId={module.id}
              settingsValues={editorState.settingsValues}
              products={products}
            />
          );
        }
        if (module.type === 'hero') {
          return (
            <HeroModule 
              key={module.id} 
              moduleId={module.id}
              settingsValues={editorState.settingsValues}
            />
          );
        }
        if (module.type === 'features') {
          return (
            <FeaturesModule 
              key={module.id} 
              moduleId={module.id}
              settingsValues={editorState.settingsValues}
            />
          );
        }
        return null;
      })}

      {/* Empty State if no modules */}
      {editorState.addedModules.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center p-20 text-center border-t border-slate-50">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <Plus size={32} className="text-slate-200" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Tu página está vacía</h3>
          <p className="text-slate-400 max-w-xs">Selecciona un módulo en el panel de la izquierda para empezar a construir.</p>
        </div>
      )}

      {/* Add Module Button */}
      <div className="p-12 flex justify-center bg-white border-t border-slate-50">
        <button 
          onClick={() => onAddModule(PRODUCTS_MODULE)}
          className="flex items-center gap-3 px-8 py-4 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 font-bold hover:border-blue-200 hover:text-blue-500 transition-all group"
        >
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

const DeleteConfirmationModal: React.FC<{ 
  moduleName: string, 
  onConfirm: () => void, 
  onCancel: () => void 
}> = ({ moduleName, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
      className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
    />
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
    >
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Trash2 className="text-rose-500 w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2 font-sans">¿Eliminar módulo?</h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          Estás a punto de eliminar el módulo <span className="font-bold text-slate-700">"{moduleName}"</span>. 
          Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <button 
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-xl transition-all"
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-200 transition-all"
          >
            Eliminar
          </button>
        </div>
      </div>
    </motion.div>
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
  const [products, setProducts] = useState<Product[]>([]);
  const [moduleToDelete, setModuleToDelete] = useState<WebModule | null>(null);
  const [editorState, setEditorState] = useState<EditorState>({
    addedModules: [],
    expandedModuleId: null,
    selectedElementId: null,
    expandedGroupsByElement: {},
    settingsValues: {}
  });

  React.useEffect(() => {
    if (projectId) {
      getProducts(1, 10, projectId).then(data => {
        if (data && data.length > 0) {
          setProducts(data);
        }
      });
    }
  }, [projectId]);

  const addModule = (module: WebModule) => {
    const moduleId = `${module.id}_${Date.now()}`;
    
    // Prefix element IDs to ensure uniqueness
    const newElements = module.elements.map(el => ({
      ...el,
      id: `${moduleId}_${el.id}`
    }));

    const newModule = { 
      ...module, 
      id: moduleId,
      elements: newElements
    };

    // Initialize default values for all settings in the module
    const initialValues: Record<string, any> = {};
    
    // Global settings
    if (module.globalSettings) {
      Object.values(module.globalSettings).forEach(groupSettings => {
        groupSettings.forEach(setting => {
          initialValues[`${moduleId}_global_${setting.id}`] = setting.defaultValue;
        });
      });
    }

    // Element settings
    newElements.forEach(element => {
      if (element.settings) {
        Object.values(element.settings).forEach(groupSettings => {
          groupSettings.forEach(setting => {
            // The element.id already contains the moduleId prefix
            initialValues[`${element.id}_${setting.id}`] = setting.defaultValue;
          });
        });
      }
    });
    
    setEditorState(prev => ({
      ...prev,
      addedModules: [...prev.addedModules, newModule],
      expandedModuleId: null,
      selectedElementId: null,
      settingsValues: {
        ...prev.settingsValues,
        ...initialValues
      }
    }));
  };

  const removeModule = (moduleId: string) => {
    const module = editorState.addedModules.find(m => m.id === moduleId);
    if (module) {
      setModuleToDelete(module);
    }
  };

  const confirmRemoveModule = () => {
    if (!moduleToDelete) return;
    
    const moduleId = moduleToDelete.id;
    setEditorState(prev => {
      const newModules = prev.addedModules.filter(m => m.id !== moduleId);
      
      // Clean up settings for this module
      const newSettingsValues = { ...prev.settingsValues };
      Object.keys(newSettingsValues).forEach(key => {
        if (key.startsWith(moduleId)) {
          delete newSettingsValues[key];
        }
      });

      return {
        ...prev,
        addedModules: newModules,
        expandedModuleId: prev.expandedModuleId === moduleId ? null : prev.expandedModuleId,
        selectedElementId: prev.selectedElementId?.startsWith(moduleId) ? null : prev.selectedElementId,
        settingsValues: newSettingsValues
      };
    });
    setModuleToDelete(null);
  };

  const handleSettingChange = (elementOrModuleId: string, settingId: string, value: any) => {
    setEditorState(prev => ({
      ...prev,
      settingsValues: {
        ...prev.settingsValues,
        [`${elementOrModuleId}_${settingId}`]: value
      }
    }));
  };

  const handleSaveDraft = async () => {
    if (!projectId) return;
    
    const siteData = {
      projectId,
      name: 'Mi Sitio Web',
      contentDraft: editorState,
      status: 'draft' as const,
    };
    
    const result = await saveWebBuilderSiteDraft(siteData);
    if (result) {
      console.log('Borrador guardado con éxito');
    }
  };

  const handlePublish = async () => {
    if (!projectId) return;

    // Helper to get setting value with fallback
    const getSetting = (moduleId: string, settingId: string, defaultValue: any) => {
      const key = `${moduleId}_global_${settingId}`;
      return editorState.settingsValues[key] !== undefined ? editorState.settingsValues[key] : defaultValue;
    };

    // 1. Determine Global Theme
    // We take the primary color from the first module's global settings or project default
    const firstModuleId = editorState.addedModules[0]?.id;
    const primaryColor = firstModuleId 
      ? getSetting(firstModuleId, 'primary_color', project?.brandColors?.primary || '#2563EB')
      : (project?.brandColors?.primary || '#2563EB');

    const renderingContract: RenderingContract = {
      theme: {
        primaryColor,
        fontFamily: project?.fontFamily || 'Inter',
      },
      sections: editorState.addedModules.map(module => {
        // Map module settings to the rendering contract content structure
        const content: any = {
          title: getSetting(module.id, 'section_title', ''),
          subtitle: getSetting(module.id, 'section_desc', ''),
        };

        // Specific mapping based on module type
        if (module.type === 'products') {
          // For products, the renderer usually fetches them by projectId, 
          // but we can pass layout hints in metadata if the contract allows, 
          // or just the basic title/subtitle.
        }

        return {
          id: module.id,
          type: module.type as any,
          content
        };
      })
    };

    const publishData = {
      projectId,
      appId: 'web-builder' as const,
      content: renderingContract,
      metadata: {
        title: project?.webConfig?.seoTitle || project?.name || 'Mi Sitio Web',
        description: project?.webConfig?.seoDescription || 'Construido con Solutium Web Builder',
        ogImage: project?.logoUrl || undefined,
      }
    };

    const result = await publishWebBuilderSite(publishData);
    if (result) {
      console.log('Sitio publicado con éxito');
      // In a real app, we would show a success modal with the URL:
      // https://[subdomain].solutium.app
    }
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-white font-sans antialiased">
      <MainSidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onBackToDashboard={onBackToDashboard} 
        logoUrl={logoUrl}
        project={project}
        onAddModule={addModule}
      />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {activeTab === 'constructor' && (
          <div className="flex flex-1 h-full overflow-hidden">
            <StructurePanel 
              editorState={editorState} 
              setEditorState={setEditorState} 
              onSettingChange={handleSettingChange}
              onRemoveModule={removeModule}
              projectId={projectId}
            />
            <div className="flex-1 flex flex-col h-full">
              <TopBar onSave={handleSaveDraft} onPublish={handlePublish} />
              <Canvas 
                editorState={editorState} 
                onAddModule={addModule} 
                products={products}
              />
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

      {/* Modal de Confirmación de Eliminación */}
      <AnimatePresence>
        {moduleToDelete && (
          <DeleteConfirmationModal 
            moduleName={moduleToDelete.name}
            onConfirm={confirmRemoveModule}
            onCancel={() => setModuleToDelete(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
