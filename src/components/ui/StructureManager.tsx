import React from 'react';
import { Layout, Sun, Moon, Image as ImageIcon, Settings, Trash2, ChevronDown, Video, Layers, Sparkles, Waves } from 'lucide-react';
import { PremiumBadge } from './PremiumBadge';

interface StructureManagerProps {
  data: any;
  onUpdate: (data: any) => void;
  onOpenImagePicker: (callback: (url: string) => void) => void;
  moduleType?: string;
  isPremiumUser?: boolean;
}

export const StructureManager = ({ data, onUpdate, onOpenImagePicker, moduleType, isPremiumUser = false }: StructureManagerProps) => {
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
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!isPremiumUser && (val === 'pill' || val === 'bottom-rounded')) return;
                    onUpdate({ shape: val });
                  }}
                  className="w-full p-3 bg-background border border-text/10 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer"
                >
                  <option value="square">Totalmente cuadrada</option>
                  <option value="slightly-rounded">Leve curvatura en las esquinas</option>
                  <option value="bottom-rounded" disabled={!isPremiumUser}>Bordes achatados hacia abajo {!isPremiumUser ? '(PRO)' : ''}</option>
                  <option value="top-rounded">Bordes achatados hacia arriba</option>
                  <option value="pill" disabled={!isPremiumUser}>Bordes redondeados {!isPremiumUser ? '(PRO)' : ''}</option>
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
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!isPremiumUser && (val === 'desktop' || val === 'mobile')) return;
                    onUpdate({ visibility: val });
                  }}
                  className="w-full p-3 bg-background border border-text/10 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer"
                >
                  <option value="all">Todos los dispositivos</option>
                  <option value="desktop" disabled={!isPremiumUser}>Solo Escritorio {!isPremiumUser ? '(PRO)' : ''}</option>
                  <option value="mobile" disabled={!isPremiumUser}>Solo Móvil {!isPremiumUser ? '(PRO)' : ''}</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text/40 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className={`flex items-center gap-3 p-3 bg-background border border-text/10 rounded-xl transition-colors relative ${!isPremiumUser ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'}`}>
                {!isPremiumUser && <PremiumBadge />}
                <input
                  type="checkbox"
                  checked={data.isSticky !== false}
                  onChange={(e) => {
                    if (!isPremiumUser) return;
                    onUpdate({ isSticky: e.target.checked });
                  }}
                  disabled={!isPremiumUser}
                  className="w-4 h-4 text-primary rounded border-text/20 focus:ring-primary"
                />
                <span className="text-sm font-medium text-text/80">Fijar al hacer scroll (Sticky)</span>
              </label>
              
              <label className={`flex items-center gap-3 p-3 bg-background border border-text/10 rounded-xl transition-colors relative ${!isPremiumUser ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'}`}>
                {!isPremiumUser && <PremiumBadge />}
                <input
                  type="checkbox"
                  checked={data.smartMode !== false}
                  onChange={(e) => {
                    if (!isPremiumUser) return;
                    onUpdate({ smartMode: e.target.checked });
                  }}
                  disabled={!isPremiumUser}
                  className="w-4 h-4 text-primary rounded border-text/20 focus:ring-primary"
                />
                <span className="text-sm font-medium text-text/80">Modo Inteligente (Ocultar al bajar)</span>
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

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-text/5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest">Color de Fondo</label>
                <div className="flex items-center gap-2 p-2 bg-background border border-text/10 rounded-xl">
                  <input
                    type="color"
                    value={data.backgroundColor || '#000000'}
                    onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                  />
                  <span className="text-xs text-text/60 font-mono">{data.backgroundColor || 'Tema'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest">Color de Texto</label>
                <div className="flex items-center gap-2 p-2 bg-background border border-text/10 rounded-xl">
                  <input
                    type="color"
                    value={data.textColor || '#ffffff'}
                    onChange={(e) => onUpdate({ textColor: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                  />
                  <span className="text-xs text-text/60 font-mono">{data.textColor || 'Tema'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-text/5">
              <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest flex items-center gap-2">
                Grosor (Padding)
              </label>
              <div className="relative">
                <select
                  value={data.padding || 'normal'}
                  onChange={(e) => onUpdate({ padding: e.target.value })}
                  className="w-full p-3 bg-background border border-text/10 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer"
                >
                  <option value="thin">Delgado</option>
                  <option value="normal">Normal</option>
                  <option value="thick">Grueso</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text/40 pointer-events-none" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Background Settings */}
      <div className="space-y-4 pt-6 border-t border-text/5">
        <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest flex items-center gap-2">
          <ImageIcon className="w-3 h-3" /> {(data.layoutType === 'layout-2' || data.layoutType === 'layout-7') ? 'Imagen Principal' : 'Fondo del Módulo'}
        </label>

        {/* Background Type Selector */}
        <div className="flex bg-background p-1 rounded-xl border border-text/10 relative">
          <button
            onClick={() => updateBackground('type', 'image')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
              (background.type || 'image') === 'image' 
                ? 'bg-surface text-primary shadow-sm' 
                : 'text-text/40 hover:text-text/60'
            }`}
          >
            <ImageIcon className="w-3 h-3" />
            Imagen
          </button>
          <button
            onClick={() => {
              if (!isPremiumUser) return;
              updateBackground('type', 'video');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all relative ${
              background.type === 'video' 
                ? 'bg-surface text-primary shadow-sm' 
                : !isPremiumUser
                ? 'text-text/30 cursor-not-allowed'
                : 'text-text/40 hover:text-text/60'
            }`}
          >
            {!isPremiumUser && <PremiumBadge />}
            <Video className="w-3 h-3" />
            Video
          </button>
          <button
            onClick={() => {
              if (!isPremiumUser) return;
              updateBackground('type', 'carousel');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all relative ${
              background.type === 'carousel' 
                ? 'bg-surface text-primary shadow-sm' 
                : !isPremiumUser
                ? 'text-text/30 cursor-not-allowed'
                : 'text-text/40 hover:text-text/60'
            }`}
          >
            {!isPremiumUser && <PremiumBadge />}
            <Layers className="w-3 h-3" />
            Carrusel
          </button>
          <button
            onClick={() => {
              if (!isPremiumUser) return;
              updateBackground('type', 'particles');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all relative ${
              background.type === 'particles' 
                ? 'bg-surface text-primary shadow-sm' 
                : !isPremiumUser
                ? 'text-text/30 cursor-not-allowed'
                : 'text-text/40 hover:text-text/60'
            }`}
          >
            {!isPremiumUser && <PremiumBadge />}
            <Sparkles className="w-3 h-3" />
            Partículas
          </button>
        </div>
        
        {(!background.type || background.type === 'image') && (
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
        )}

        {background.type === 'video' && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest">URL del Video (YouTube, Vimeo, MP4)</label>
            <input
              type="text"
              value={background.videoUrl || ''}
              onChange={(e) => updateBackground('videoUrl', e.target.value)}
              placeholder="https://..."
              className="w-full p-3 bg-background border border-text/10 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        )}

        {background.type === 'carousel' && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest">Imágenes del Carrusel</label>
            <div className="grid grid-cols-3 gap-2">
              {(background.carouselImages || []).map((img: string, i: number) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                  <img src={img} className="w-full h-full object-cover" alt={`Slide ${i}`} />
                  <button 
                    onClick={() => {
                      const newImages = [...(background.carouselImages || [])];
                      newImages.splice(i, 1);
                      updateBackground('carouselImages', newImages);
                    }}
                    className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button 
                onClick={() => onOpenImagePicker((url) => {
                  updateBackground('carouselImages', [...(background.carouselImages || []), url]);
                })}
                className="aspect-square rounded-lg border-2 border-dashed border-text/10 flex items-center justify-center text-text/40 hover:border-primary/50 transition-colors"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest">Transición</label>
              <select
                value={background.carouselTransition || 'fade'}
                onChange={(e) => updateBackground('carouselTransition', e.target.value)}
                className="p-2 bg-background border border-text/10 rounded-lg text-xs outline-none"
              >
                <option value="fade">Desvanecer (Fade)</option>
                <option value="slide">Deslizar (Slide)</option>
              </select>
            </div>
          </div>
        )}

        {background.type === 'particles' && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest">Estilo de Partículas</label>
            <select
              value={background.particlesStyle || 'stars'}
              onChange={(e) => updateBackground('particlesStyle', e.target.value)}
              className="w-full p-3 bg-background border border-text/10 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="stars">Estrellas</option>
              <option value="network">Red Conectada</option>
              <option value="bubbles">Burbujas</option>
            </select>
          </div>
        )}

        {((!background.type || background.type === 'image') && background.image) && (
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

            <label className={`flex items-center gap-3 p-3 bg-background border border-text/10 rounded-xl transition-colors relative ${!isPremiumUser ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'}`}>
              {!isPremiumUser && <PremiumBadge />}
              <input
                type="checkbox"
                checked={background.parallax !== false}
                onChange={(e) => {
                  if (!isPremiumUser) return;
                  updateBackground('parallax', e.target.checked);
                }}
                disabled={!isPremiumUser}
                className="w-4 h-4 text-primary rounded border-text/20 focus:ring-primary"
              />
              <span className="text-sm font-medium text-text/80">Efecto Parallax al hacer scroll</span>
            </label>
          </div>
        )}

        {/* Overlay Settings */}
        <div className="space-y-4 pt-4 border-t border-text/5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest flex items-center gap-2">
              <Settings className="w-3 h-3" /> Superposición (Overlay)
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
          
          <div className="flex items-center gap-3">
            <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest">Tipo</label>
            <div className="flex bg-background p-1 rounded-lg border border-text/10 relative">
              <button
                onClick={() => updateBackground('overlayType', 'solid')}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all ${
                  (background.overlayType || 'solid') === 'solid' 
                    ? 'bg-surface text-primary shadow-sm' 
                    : 'text-text/40 hover:text-text/60'
                }`}
              >
                Sólido
              </button>
              <button
                onClick={() => {
                  if (!isPremiumUser) return;
                  updateBackground('overlayType', 'gradient');
                }}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all relative ${
                  background.overlayType === 'gradient' 
                    ? 'bg-surface text-primary shadow-sm' 
                    : !isPremiumUser
                    ? 'text-text/30 cursor-not-allowed'
                    : 'text-text/40 hover:text-text/60'
                }`}
              >
                {!isPremiumUser && <PremiumBadge />}
                Degradado
              </button>
            </div>
          </div>
        </div>

        {/* Shape Dividers */}
        <div className="space-y-4 pt-4 border-t border-text/5">
          <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest flex items-center gap-2">
            <Waves className="w-3 h-3" /> Separadores de Forma (Shape Dividers)
          </label>
          
          <div className="space-y-3">
            <div className="relative">
              <select
                value={background.topDivider || 'none'}
                onChange={(e) => {
                  if (!isPremiumUser && e.target.value !== 'none') return;
                  updateBackground('topDivider', e.target.value);
                }}
                className={`w-full p-3 bg-background border border-text/10 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary outline-none appearance-none ${!isPremiumUser ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <option value="none">Superior: Ninguno</option>
                <option value="waves" disabled={!isPremiumUser}>Olas {!isPremiumUser ? '(PRO)' : ''}</option>
                <option value="curve" disabled={!isPremiumUser}>Curva {!isPremiumUser ? '(PRO)' : ''}</option>
                <option value="triangle" disabled={!isPremiumUser}>Triángulo {!isPremiumUser ? '(PRO)' : ''}</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text/40 pointer-events-none" />
              {!isPremiumUser && <PremiumBadge />}
            </div>

            <div className="relative">
              <select
                value={background.bottomDivider || 'none'}
                onChange={(e) => {
                  if (!isPremiumUser && e.target.value !== 'none') return;
                  updateBackground('bottomDivider', e.target.value);
                }}
                className={`w-full p-3 bg-background border border-text/10 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary outline-none appearance-none ${!isPremiumUser ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <option value="none">Inferior: Ninguno</option>
                <option value="waves" disabled={!isPremiumUser}>Olas {!isPremiumUser ? '(PRO)' : ''}</option>
                <option value="curve" disabled={!isPremiumUser}>Curva {!isPremiumUser ? '(PRO)' : ''}</option>
                <option value="triangle" disabled={!isPremiumUser}>Triángulo {!isPremiumUser ? '(PRO)' : ''}</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text/40 pointer-events-none" />
              {!isPremiumUser && <PremiumBadge />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
