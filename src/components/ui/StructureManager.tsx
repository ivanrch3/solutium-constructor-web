import React from 'react';
import { Layout, Sun, Moon, Image as ImageIcon, Settings, Trash2, ChevronDown } from 'lucide-react';

interface StructureManagerProps {
  data: any;
  onUpdate: (data: any) => void;
  onOpenImagePicker: (callback: (url: string) => void) => void;
  moduleType?: string;
}

export const StructureManager = ({ data, onUpdate, onOpenImagePicker, moduleType }: StructureManagerProps) => {
  const background = data.background || {};

  const updateBackground = (key: string, value: any) => {
    onUpdate({
      background: {
        ...background,
        [key]: value
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Layout & Theme */}
      <div className="grid grid-cols-1 gap-6">
        {/* Theme Toggle */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest flex items-center gap-2">
            {(data.theme || (moduleType === 'top-bar' ? 'dark' : 'light')) === 'dark' ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />} Tema del Módulo
          </label>
          <div className="flex bg-background p-1 rounded-xl border border-text/10">
            {[
              { label: 'Claro', value: 'light', icon: Sun },
              { label: 'Oscuro', value: 'dark', icon: Moon }
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => onUpdate({ theme: opt.value })}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                  (data.theme || (moduleType === 'top-bar' ? 'dark' : 'light')) === opt.value 
                    ? 'bg-surface text-primary shadow-sm' 
                    : 'text-text/40 hover:text-text/60'
                }`}
              >
                <opt.icon className="w-3 h-3" />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Layout Selector */}
        {moduleType !== 'top-bar' && (
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest flex items-center gap-2">
              <Layout className="w-3 h-3" /> Disposición (Layout)
            </label>
            <div className="grid grid-cols-2 gap-2 bg-background p-1.5 rounded-xl border border-text/10">
              {[
                { label: 'Centrado', value: 'layout-1' },
                { label: 'Dividido', value: 'layout-2' },
                { label: 'Asimétrico', value: 'layout-3' },
                { label: 'Caja Flotante', value: 'layout-4' },
                { label: 'Lateral', value: 'layout-5' },
                { label: 'Bento', value: 'layout-6' },
                { label: 'Superposición', value: 'layout-7' }
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onUpdate({ layoutType: opt.value })}
                  className={`py-2.5 px-3 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all text-center ${
                    (data.layoutType || 'layout-1') === opt.value 
                      ? 'bg-surface text-primary shadow-sm ring-1 ring-primary/20' 
                      : 'text-text/40 hover:text-text/60 hover:bg-text/5'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TopBar Specific Options */}
        {moduleType === 'top-bar' && (
          <>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest flex items-center gap-2">
                <Layout className="w-3 h-3" /> Forma de la Barra
              </label>
              <div className="relative">
                <select
                  value={data.shape || 'bottom-rounded'}
                  onChange={(e) => onUpdate({ shape: e.target.value })}
                  className="w-full p-3 bg-background border border-text/10 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer"
                >
                  <option value="bottom-rounded">Bordes achatados hacia abajo</option>
                  <option value="top-rounded">Bordes achatados hacia arriba</option>
                  <option value="pill">Bordes redondeados</option>
                  <option value="square">Totalmente cuadrada</option>
                  <option value="slightly-rounded">Leve curvatura en las esquinas</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text/40 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest flex items-center gap-2">
                Visibilidad por Dispositivo
              </label>
              <div className="relative">
                <select
                  value={data.visibility || 'all'}
                  onChange={(e) => onUpdate({ visibility: e.target.value })}
                  className="w-full p-3 bg-background border border-text/10 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer"
                >
                  <option value="all">Todos los dispositivos</option>
                  <option value="desktop">Solo Escritorio</option>
                  <option value="mobile">Solo Móvil</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text/40 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 p-3 bg-background border border-text/10 rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
                <input
                  type="checkbox"
                  checked={data.isSticky !== false}
                  onChange={(e) => onUpdate({ isSticky: e.target.checked })}
                  className="w-4 h-4 text-primary rounded border-text/20 focus:ring-primary"
                />
                <span className="text-sm font-medium text-text/80">Fijar al hacer scroll (Sticky)</span>
              </label>
              
              <label className="flex items-center gap-3 p-3 bg-background border border-text/10 rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
                <input
                  type="checkbox"
                  checked={data.isDismissible !== false}
                  onChange={(e) => onUpdate({ isDismissible: e.target.checked })}
                  className="w-4 h-4 text-primary rounded border-text/20 focus:ring-primary"
                />
                <span className="text-sm font-medium text-text/80">Mostrar botón de cerrar ("X")</span>
              </label>
            </div>
          </>
        )}
      </div>

      {/* Background Settings */}
      <div className="space-y-4 pt-6 border-t border-text/5">
        <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest flex items-center gap-2">
          <ImageIcon className="w-3 h-3" /> {(data.layoutType === 'layout-2' || data.layoutType === 'layout-7') ? 'Imagen Principal' : 'Imagen de Fondo'}
        </label>
        
        <div 
          onClick={() => onOpenImagePicker((url) => updateBackground('image', url))}
          className="relative aspect-video bg-background rounded-xl border-2 border-dashed border-text/10 overflow-hidden cursor-pointer group hover:border-primary/50 transition-all"
        >
          {background.image ? (
            <>
              <img 
                src={background.image} 
                className="w-full h-full object-cover" 
                alt="Fondo" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-text/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-2">
                <span className="text-background text-[10px] font-bold uppercase tracking-wider">Cambiar</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    updateBackground('image', '');
                  }}
                  className="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-text/40">
              <ImageIcon className="w-6 h-6 mb-2" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Seleccionar Imagen</span>
            </div>
          )}
        </div>

        {background.image && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest">Ajuste de Imagen</label>
              <div className="relative">
                <select
                  value={background.size || 'cover'}
                  onChange={(e) => updateBackground('size', e.target.value)}
                  className="w-full p-2.5 bg-background border border-text/10 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer"
                >
                  <option value="cover">Rellenar (Cover)</option>
                  <option value="contain">Ajustar (Contain)</option>
                  <option value="repeat">Mosaico (Tile)</option>
                  <option value="auto">Original</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-text/40 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest flex items-center gap-2">
                  <Settings className="w-3 h-3" /> Opacidad Superposición
                </label>
                <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {Math.round((background.overlayOpacity || 0) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={background.overlayOpacity || 0}
                onChange={(e) => updateBackground('overlayOpacity', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-text/10 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
