import React from 'react';
import { 
  Home, 
  Clock, 
  Info, 
  Star, 
  Settings, 
  Layout, 
  Type, 
  Image as ImageIcon, 
  MousePointer2, 
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
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- SUB-COMPONENTS ---

const LeftNav = () => (
  <div className="w-[60px] bg-white border-r border-slate-100 flex flex-col items-center py-6 gap-8 z-50">
    <div className="p-2 text-slate-400 hover:text-blue-600 cursor-pointer transition-colors"><Home size={22} /></div>
    <div className="p-2 text-slate-400 hover:text-blue-600 cursor-pointer transition-colors"><Clock size={22} /></div>
    <div className="p-2 text-slate-400 hover:text-blue-600 cursor-pointer transition-colors"><Info size={22} /></div>
    <div className="p-2 text-slate-400 hover:text-blue-600 cursor-pointer transition-colors"><Star size={22} /></div>
    <div className="mt-auto p-2 text-slate-400 hover:text-blue-600 cursor-pointer transition-colors"><Settings size={22} /></div>
  </div>
);

const MainSidebar = () => (
  <div className="w-[240px] bg-white border-r border-slate-100 flex flex-col z-40">
    <div className="p-5">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 bg-[#E11D48] rounded-lg flex items-center justify-center shadow-sm">
          <FileText className="text-white w-4 h-4" />
        </div>
        <div>
          <h1 className="text-xs font-bold text-slate-800 leading-none">Constructor</h1>
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-slate-800">Web</span>
            <span className="text-[9px] text-slate-400 font-bold mt-0.5">by Solutium</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 mt-1.5 pl-0.5">
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">v1.0.0</span>
      </div>
    </div>

    <div className="flex-1 overflow-y-auto px-3 space-y-5">
      {/* Diseño Section */}
      <div>
        <button className="w-full flex items-center justify-between p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">
          <div className="flex items-center gap-2.5">
            <Monitor size={16} className="text-slate-400" />
            <span className="text-xs font-bold">Diseño</span>
          </div>
          <ChevronDown size={12} className="text-slate-300" />
        </button>
      </div>

      {/* Constructor Section */}
      <div>
        <button className="w-full flex items-center justify-between p-2 text-blue-600 bg-blue-50/50 rounded-xl mb-1">
          <div className="flex items-center gap-2.5">
            <Layout size={16} />
            <span className="text-xs font-bold">Constructor</span>
          </div>
          <ChevronDown size={12} />
        </button>
        
        <div className="pl-3 space-y-3 mt-3">
          <div className="space-y-1.5">
            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest pl-2">Navegación</span>
            <div className="space-y-0.5">
              {['Barra superior', 'Menú', 'Pie de página', 'Espaciadores'].map(item => (
                <div key={item} className="flex items-center gap-2.5 p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg cursor-pointer text-[11px] font-bold transition-all">
                  <div className="w-3.5 h-3.5 border border-slate-200 rounded-md bg-white"></div>
                  {item}
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-1.5">
            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest pl-2">Contenido</span>
            <div className="space-y-0.5">
              {['CONFIANZA', 'VENTAS', 'CONTACTO'].map(item => (
                <div key={item} className="flex items-center justify-between p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer text-[10px] font-bold tracking-wider transition-all">
                  {item}
                  <ChevronRight size={10} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ajustes Section */}
      <div>
        <button className="w-full flex items-center justify-between p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">
          <div className="flex items-center gap-2.5">
            <Settings size={16} className="text-slate-400" />
            <span className="text-xs font-bold">Ajustes</span>
          </div>
        </button>
      </div>
    </div>

    <div className="p-4 space-y-3 border-t border-slate-50">
      <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-blue-100 transition-all">
        <Sparkles size={14} />
        Generar con IA
      </button>
      
      <div className="space-y-1">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-1">Seleccionar activo</span>
        <div className="flex items-center justify-between p-2 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-500 bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-colors">
          Proyecto:
          <ChevronDown size={10} />
        </div>
      </div>
    </div>
  </div>
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

export const WebConstructor: React.FC = () => {
  return (
    <div className="h-screen w-screen flex overflow-hidden bg-white font-sans antialiased">
      <MainSidebar />
      <StructurePanel />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <Canvas />
      </div>
    </div>
  );
};
