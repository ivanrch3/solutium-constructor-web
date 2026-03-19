import React from 'react';
import { 
  Layout, 
  MousePointer2, 
  Type, 
  Settings2, 
  ChevronDown, 
  ChevronRight,
  Plus,
  Trash2,
  GripVertical,
  Search,
  Globe,
  Share2,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react';
import { ColorPicker } from './ColorPicker';
import { TypographyManager } from './TypographyManager';

interface HeaderManagerProps {
  data: any;
  onUpdate: (data: any) => void;
  onOpenImagePicker: (callback: (url: string) => void) => void;
  textElements: any[];
  module: any;
}

export const HeaderManager = ({ data, onUpdate, onOpenImagePicker, textElements, module }: HeaderManagerProps) => {
  const [expandedSection, setExpandedSection] = React.useState<string | null>(null);

  const updateData = (newData: any) => {
    onUpdate({ ...data, ...newData });
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleAddMenuItem = () => {
    const newItems = [...(data.menuItems || []), { label: 'Nuevo Link', link: '#' }];
    updateData({ menuItems: newItems });
  };

  const handleRemoveMenuItem = (index: number) => {
    const newItems = data.menuItems.filter((_: any, i: number) => i !== index);
    updateData({ menuItems: newItems });
  };

  const handleUpdateMenuItem = (index: number, field: string, value: string) => {
    const newItems = [...data.menuItems];
    newItems[index] = { ...newItems[index], [field]: value };
    updateData({ menuItems: newItems });
  };

  return (
    <div className="space-y-6">
      {/* 1. Editor de Textos */}
      <div className="space-y-4">
        <button 
          onClick={() => toggleSection('text')}
          className="w-full flex items-center justify-between group"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
              <Type className="w-3 h-3" />
            </div>
            <span className="text-[10px] font-black text-text/60 uppercase tracking-widest group-hover:text-primary transition-colors">
              Editor de Textos
            </span>
          </div>
          {expandedSection === 'text' ? <ChevronDown className="w-3 h-3 text-text/30" /> : <ChevronRight className="w-3 h-3 text-text/30" />}
        </button>

        {expandedSection === 'text' && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <TypographyManager 
              module={module}
              data={data}
              onUpdate={onUpdate}
              textElements={textElements}
            />
          </div>
        )}
      </div>

      {/* 2. Estructura y Comportamiento */}
      <div className="space-y-4 pt-4 border-t border-text/5">
        <button 
          onClick={() => toggleSection('structure')}
          className="w-full flex items-center justify-between group"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
              <Layout className="w-3 h-3" />
            </div>
            <span className="text-[10px] font-black text-text/60 uppercase tracking-widest group-hover:text-primary transition-colors">
              Estructura y Comportamiento
            </span>
          </div>
          {expandedSection === 'structure' ? <ChevronDown className="w-3 h-3 text-text/30" /> : <ChevronRight className="w-3 h-3 text-text/30" />}
        </button>

        {expandedSection === 'structure' && (
          <div className="space-y-6 p-4 bg-background/30 rounded-2xl border border-text/5 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest">Tipo de Logo</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'inherited', label: 'Logo de la aplicación (Heredado)' },
                  { id: 'custom', label: 'Subir nuevo logo / URL' },
                  { id: 'none', label: 'Sin logo (Solo texto)' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => updateData({ logoType: opt.id })}
                    className={`py-2 px-3 text-[10px] font-bold uppercase tracking-wider rounded-lg border text-left transition-all ${
                      (data.logoType || 'inherited') === opt.id
                        ? 'bg-primary/5 border-primary text-primary'
                        : 'bg-background border-text/10 text-text/60 hover:border-text/20'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {data.logoType === 'custom' && (
              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest">Imagen del Logo Personalizado</label>
                <div className="flex items-center gap-3 p-3 bg-background rounded-xl border border-text/5">
                  <div className="w-12 h-12 rounded-lg bg-text/5 flex items-center justify-center overflow-hidden border border-text/5">
                    {data.logoImage ? (
                      <img src={data.logoImage} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <Layout className="w-5 h-5 text-text/20" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <button 
                      onClick={() => onOpenImagePicker((url) => updateData({ logoImage: url }))}
                      className="w-full py-1.5 px-3 bg-primary text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Cambiar Imagen
                    </button>
                    <input 
                      type="text" 
                      placeholder="O pega una URL..."
                      value={data.logoImage || ''}
                      onChange={(e) => updateData({ logoImage: e.target.value })}
                      className="w-full bg-transparent text-[10px] font-medium text-text/60 outline-none border-b border-text/10 focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest">Tema del Menú</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'light', label: 'Claro' },
                  { id: 'dark', label: 'Oscuro' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => updateData({ theme: opt.id })}
                    className={`py-2 px-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${
                      (data.theme || 'dark') === opt.id
                        ? 'bg-primary/5 border-primary text-primary'
                        : 'bg-background border-text/10 text-text/60 hover:border-text/20'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest">Disposición (Layout)</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'logo-left', label: 'Logo Izq' },
                  { id: 'logo-center', label: 'Logo Centro' },
                  { id: 'logo-right', label: 'Logo Der' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => updateData({ layoutType: opt.id })}
                    className={`py-2 px-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${
                      (data.layoutType || 'logo-left') === opt.id
                        ? 'bg-primary/5 border-primary text-primary'
                        : 'bg-background border-text/10 text-text/60 hover:border-text/20'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest">Modo de Scroll</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'static', label: 'Estático' },
                  { id: 'sticky', label: 'Fijo' },
                  { id: 'smart-hide', label: 'Inteligente' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => updateData({ scrollMode: opt.id })}
                    className={`py-2 px-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${
                      (data.scrollMode || 'static') === opt.id
                        ? 'bg-primary/5 border-primary text-primary'
                        : 'bg-background border-text/10 text-text/60 hover:border-text/20'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest">Altura del Menú ({data.height || 80}px)</label>
              <input 
                type="range" 
                min="60" 
                max="120" 
                value={data.height || 80}
                onChange={(e) => updateData({ height: parseInt(e.target.value) })}
                className="w-full accent-primary"
              />
            </div>

            <div className="space-y-3 pt-2 border-t border-text/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-text/60">Barra de progreso</span>
                <button 
                  onClick={() => updateData({ showProgressBar: !data.showProgressBar })}
                  className={`w-10 h-5 rounded-full transition-colors relative ${data.showProgressBar ? 'bg-primary' : 'bg-text/10'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${data.showProgressBar ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-text/60">Indicador activo</span>
                <button 
                  onClick={() => updateData({ showActiveIndicator: !data.showActiveIndicator })}
                  className={`w-10 h-5 rounded-full transition-colors relative ${data.showActiveIndicator ? 'bg-primary' : 'bg-text/10'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${data.showActiveIndicator ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Estilo y Apariencia */}
      <div className="space-y-4 pt-4 border-t border-text/5">
        <button 
          onClick={() => toggleSection('style')}
          className="w-full flex items-center justify-between group"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
              <Settings2 className="w-3 h-3" />
            </div>
            <span className="text-[10px] font-black text-text/60 uppercase tracking-widest group-hover:text-primary transition-colors">
              Estilo y Apariencia
            </span>
          </div>
          {expandedSection === 'style' ? <ChevronDown className="w-3 h-3 text-text/30" /> : <ChevronRight className="w-3 h-3 text-text/30" />}
        </button>

        {expandedSection === 'style' && (
          <div className="space-y-6 p-4 bg-background/30 rounded-2xl border border-text/5 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest">Tipo de Fondo</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'solid', label: 'Sólido' },
                  { id: 'transparent', label: 'Transp.' },
                  { id: 'glass', label: 'Cristal' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => updateData({ bgType: opt.id })}
                    className={`py-2 px-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${
                      (data.bgType || 'glass') === opt.id
                        ? 'bg-primary/5 border-primary text-primary'
                        : 'bg-background border-text/10 text-text/60 hover:border-text/20'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest">Efecto Hover</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'underline', label: 'Línea' },
                  { id: 'capsule', label: 'Cápsula' },
                  { id: 'color', label: 'Color' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => updateData({ hoverEffect: opt.id })}
                    className={`py-2 px-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${
                      (data.hoverEffect || 'underline') === opt.id
                        ? 'bg-primary/5 border-primary text-primary'
                        : 'bg-background border-text/10 text-text/60 hover:border-text/20'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ColorPicker 
                label="Fondo" 
                color={data.backgroundColor || '#ffffff'} 
                onChange={(color) => updateData({ backgroundColor: color })} 
              />
              <ColorPicker 
                label="Texto" 
                color={data.textColor || '#000000'} 
                onChange={(color) => updateData({ textColor: color })} 
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. Navegación y Botones */}
      <div className="space-y-4 pt-4 border-t border-text/5">
        <button 
          onClick={() => toggleSection('content')}
          className="w-full flex items-center justify-between group"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
              <MousePointer2 className="w-3 h-3" />
            </div>
            <span className="text-[10px] font-black text-text/60 uppercase tracking-widest group-hover:text-primary transition-colors">
              Navegación y Botones
            </span>
          </div>
          {expandedSection === 'content' ? <ChevronDown className="w-3 h-3 text-text/30" /> : <ChevronRight className="w-3 h-3 text-text/30" />}
        </button>

        {expandedSection === 'content' && (
          <div className="space-y-6 p-4 bg-background/30 rounded-2xl border border-text/5 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Menu Items Manager */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest">Items del Menú</label>
                <button 
                  onClick={handleAddMenuItem}
                  className="p-1 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-2">
                {(data.menuItems || []).map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-background rounded-xl border border-text/5 group">
                    <GripVertical className="w-3 h-3 text-text/20 cursor-grab" />
                    <input 
                      type="text" 
                      value={item.label}
                      onChange={(e) => handleUpdateMenuItem(idx, 'label', e.target.value)}
                      className="flex-1 bg-transparent text-xs font-bold outline-none"
                    />
                    <button 
                      onClick={() => handleRemoveMenuItem(idx)}
                      className="p-1 text-text/20 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* CTAs Manager */}
            <div className="space-y-4 pt-4 border-t border-text/5">
              <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest">Botones de Acción</label>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-background rounded-xl border border-text/5">
                  <span className="text-xs font-medium text-text/60">Botón Primario</span>
                  <button 
                    onClick={() => updateData({ showCTA: data.showCTA !== false ? false : true })}
                    className={`w-10 h-5 rounded-full transition-colors relative ${data.showCTA !== false ? 'bg-primary' : 'bg-text/10'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${data.showCTA !== false ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-background rounded-xl border border-text/5">
                  <span className="text-xs font-medium text-text/60">Botón Secundario</span>
                  <button 
                    onClick={() => updateData({ showSecondaryCTA: !data.showSecondaryCTA })}
                    className={`w-10 h-5 rounded-full transition-colors relative ${data.showSecondaryCTA ? 'bg-primary' : 'bg-text/10'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${data.showSecondaryCTA ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Modules */}
            <div className="space-y-4 pt-4 border-t border-text/5">
              <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest">Módulos Rápidos</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'showSearch', icon: Search, label: 'Buscar' },
                  { id: 'showLanguage', icon: Globe, label: 'Idioma' },
                  { id: 'showSocials', icon: Share2, label: 'Social' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => updateData({ [opt.id]: !data[opt.id] })}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                      data[opt.id]
                        ? 'bg-primary/5 border-primary text-primary'
                        : 'bg-background border-text/10 text-text/40 hover:border-text/20'
                    }`}
                  >
                    <opt.icon className="w-4 h-4" />
                    <span className="text-[8px] font-black uppercase tracking-widest">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
