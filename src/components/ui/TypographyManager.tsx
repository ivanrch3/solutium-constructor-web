import React, { useState, useEffect } from 'react';
import { ColorPicker } from './ColorPicker';
import { 
  Type, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Palette,
  ChevronDown,
  ChevronRight,
  Megaphone,
  Zap,
  Gift,
  Truck,
  Star,
  Image as ImageIcon
} from 'lucide-react';
import { Typography } from '../ui/Typography';
import { 
  HeroModule, 
  FeaturesModule, 
  TestimonialsModule, 
  PricingModule, 
  ContactModule, 
  FooterModule,
  HeaderModule,
  TopBarModule,
  TrustBarModule,
  AboutModule,
  ProcessModule,
  StatsModule,
  GalleryModule,
  VideoModule,
  NewsletterModule,
  CtaBannerModule,
  TeamModule,
  FaqModule,
  SpacerModule
} from '../modules';

interface TypographyManagerProps {
  module: any;
  data: any;
  onUpdate: (data: any) => void;
  textElements: { 
    key: string; 
    label: string; 
    defaultText: string; 
    isButton?: boolean; 
    isDisabled?: boolean;
  }[];
}

export const TypographyManager = ({ module, data, onUpdate, textElements }: TypographyManagerProps) => {
  const [selectedElement, setSelectedElement] = useState(() => {
    const firstEnabled = textElements.find(el => !el.isDisabled);
    return firstEnabled?.key || textElements[0]?.key || '';
  });

  // Update selection if current element becomes disabled or if module changes
  useEffect(() => {
    const current = textElements.find(el => el.key === selectedElement);
    if (!current || current.isDisabled) {
      const firstEnabled = textElements.find(el => !el.isDisabled);
      if (firstEnabled) {
        setSelectedElement(firstEnabled.key);
      }
    }
  }, [textElements, selectedElement]);

  // Helper to get nested value
  const getValue = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  // The style key is usually the base name of the element
  const styleKey = selectedElement.split('.')[0];
  const currentStyle = data[`${styleKey}Style`] || {};
  const currentText = getValue(data, selectedElement) || textElements.find(e => e.key === selectedElement)?.defaultText || '';
  const currentElement = textElements.find(e => e.key === selectedElement);

  // Only allow highlight effect for main titles
  const isMainTitle = ['title', 'formTitle', 'newsletterTitle', 'logoText', 'message'].includes(styleKey);
  const isButton = currentElement?.isButton;
  const isDisabled = currentElement?.isDisabled;

  const updateStyle = (key: string, value: any) => {
    onUpdate({
      [`${styleKey}Style`]: {
        ...currentStyle,
        [key]: value
      }
    });
  };

  const updateStyles = (updates: Record<string, any>) => {
    onUpdate({
      [`${styleKey}Style`]: {
        ...currentStyle,
        ...updates
      }
    });
  };

  const renderMiniModule = () => {
    const previewData = { ...module.data };
    
    const dummyHandler = () => {};
    const props = { 
      data: previewData, 
      isPreview: true,
      onCTA: dummyHandler,
      onUpdate: dummyHandler
    };

    switch (module.type) {
      case 'hero': return <HeroModule {...props} />;
      case 'features': return <FeaturesModule {...props} />;
      case 'testimonials': return <TestimonialsModule {...props} />;
      case 'pricing': return <PricingModule {...props} />;
      case 'contact': return <ContactModule {...props} />;
      case 'footer': return <FooterModule {...props} />;
      case 'header': return <HeaderModule {...props} />;
      case 'top-bar': return <TopBarModule {...props} />;
      case 'trust-bar': return <TrustBarModule {...props} />;
      case 'about': return <AboutModule {...props} />;
      case 'process': return <ProcessModule {...props} />;
      case 'stats': return <StatsModule {...props} />;
      case 'gallery': return <GalleryModule {...props} />;
      case 'video': return <VideoModule {...props} />;
      case 'newsletter': return <NewsletterModule {...props} />;
      case 'cta-banner': return <CtaBannerModule {...props} />;
      case 'team': return <TeamModule {...props} />;
      case 'faq': return <FaqModule {...props} />;
      case 'spacer': return <SpacerModule {...props} />;
      default: return null;
    }
  };

  const getThemeColorHex = (variableName: string, fallbackHex: string) => {
    if (typeof window === 'undefined') return fallbackHex;
    const rgbStr = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
    if (!rgbStr) return fallbackHex;
    const parts = rgbStr.split(' ').map(p => parseInt(p, 10));
    if (parts.length === 3 && !parts.some(isNaN)) {
      return '#' + parts.map(x => x.toString(16).padStart(2, '0')).join('');
    }
    return fallbackHex;
  };

  const defaultColor1 = currentStyle.highlightColor1 || getThemeColorHex('--color-primary-rgb', '#3B82F6');
  const defaultColor2 = currentStyle.highlightColor2 || getThemeColorHex('--color-accent-rgb', '#F59E0B');

  return (
    <div className="space-y-6">
      {/* Element Selector (Only show if there are multiple text elements) */}
      {textElements.length > 1 ? (
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest flex items-center gap-2">
            <Type className="w-3 h-3" /> Elemento a Editar
          </label>
          <div className="relative">
            <select
              value={selectedElement}
              onChange={(e) => setSelectedElement(e.target.value)}
              className="w-full p-3 bg-background border border-text/10 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer"
            >
              {textElements.map((el) => (
                <option key={el.key} value={el.key} disabled={el.isDisabled}>
                  {el.label} {el.isDisabled ? '(Deshabilitado)' : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text/40 pointer-events-none" />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest flex items-center gap-2">
            <Type className="w-3 h-3" /> {textElements[0].label}
          </label>
        </div>
      )}

      {/* Text Content Editor */}
      <div className={`space-y-2 p-4 bg-background/30 rounded-2xl border border-text/5 transition-opacity ${isDisabled ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest flex items-center gap-2">
            Contenido del Texto
          </label>
          {isDisabled && (
            <span className="text-[8px] font-bold text-text/40 uppercase tracking-tighter bg-text/5 px-1.5 py-0.5 rounded">
              Deshabilitado en el módulo
            </span>
          )}
        </div>
        {selectedElement.includes('subtitle') || selectedElement.includes('description') || selectedElement.includes('content') ? (
          <textarea
            value={currentText}
            onChange={(e) => {
              const path = selectedElement.split('.');
              if (path.length > 1) {
                const obj = { ...data[path[0]] };
                obj[path[1]] = e.target.value;
                onUpdate({ [path[0]]: obj });
              } else {
                onUpdate({ [selectedElement]: e.target.value });
              }
            }}
            className="w-full p-3 bg-background border border-text/10 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all resize-none h-24"
            placeholder="Escribe el contenido..."
          />
        ) : (
          <input
            type="text"
            value={currentText}
            onChange={(e) => {
              const path = selectedElement.split('.');
              if (path.length > 1) {
                const obj = { ...data[path[0]] };
                obj[path[1]] = e.target.value;
                onUpdate({ [path[0]]: obj });
              } else {
                onUpdate({ [selectedElement]: e.target.value });
              }
            }}
            className="w-full p-3 bg-background border border-text/10 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
            placeholder="Escribe el contenido..."
          />
        )}
        <p className="text-[9px] text-text/30 italic mt-1">
          * Usa asteriscos para resaltar: *texto resaltado*
        </p>
      </div>

      {/* TopBar Icon Selector */}
      {module.type === 'top-bar' && selectedElement === 'message' && (
        <div className="space-y-2 p-4 bg-background/30 rounded-2xl border border-text/5">
          <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest flex items-center gap-2">
            <ImageIcon className="w-3 h-3" /> Icono Acompañante
          </label>
          <div className="relative">
            <select
              value={data.icon || 'none'}
              onChange={(e) => onUpdate({ icon: e.target.value })}
              className="w-full p-3 bg-background border border-text/10 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer"
            >
              <option value="none">Ninguno</option>
              <option value="Megaphone">Anuncio (Megáfono)</option>
              <option value="Zap">Oferta (Rayo)</option>
              <option value="Gift">Regalo (Caja)</option>
              <option value="Truck">Envío (Camión)</option>
              <option value="Star">Estrella</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text/40 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Main Controls */}
      {module.type !== 'top-bar' && (
        <div className={isDisabled ? 'opacity-40 pointer-events-none' : ''}>
          <div className="space-y-4">
            {/* Size & Weight Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest">Tamaño</label>
                <select
                  value={currentStyle.size || (isButton ? 'p' : 'p')}
                  onChange={(e) => updateStyle('size', e.target.value)}
                  className="w-full p-2.5 bg-background border border-text/10 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="h1" disabled={isButton}>Título 1 (H1)</option>
                  <option value="h2" disabled={isButton}>Título 2 (H2)</option>
                  <option value="h3">Título 3 (H3)</option>
                  <option value="p">Párrafo</option>
                  <option value="small" disabled={isButton}>Pequeño</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest">Peso</label>
                <select
                  value={currentStyle.weight || '400'}
                  onChange={(e) => updateStyle('weight', e.target.value)}
                  className="w-full p-2.5 bg-background border border-text/10 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="400">Normal</option>
                  <option value="600">Semibold</option>
                  <option value="700">Bold</option>
                  <option value="800">Extra Bold</option>
                  <option value="900">Black</option>
                </select>
              </div>
            </div>

            {/* Alignment & Decoration Row */}
            <div className="flex items-center justify-between gap-2 p-1 bg-background rounded-lg border border-text/10">
              <div className="flex items-center gap-1 border-r border-text/10 pr-2">
                {[
                  { value: 'left', icon: AlignLeft },
                  { value: 'center', icon: AlignCenter },
                  { value: 'right', icon: AlignRight }
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateStyle('align', opt.value)}
                    className={`p-1.5 rounded-md transition-colors ${
                      (currentStyle.align || 'left') === opt.value 
                        ? 'bg-surface text-primary shadow-sm' 
                        : 'text-text/40 hover:text-text/60'
                    }`}
                  >
                    <opt.icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-1 pl-2">
                <button
                  onClick={() => updateStyle('italic', !currentStyle.italic)}
                  className={`p-1.5 rounded-md transition-colors ${
                    currentStyle.italic ? 'bg-surface text-primary shadow-sm' : 'text-text/40 hover:text-text/60'
                  }`}
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const newVal = !currentStyle.underline;
                    updateStyles({
                      underline: newVal,
                      strike: newVal ? false : currentStyle.strike
                    });
                  }}
                  className={`p-1.5 rounded-md transition-colors ${
                    currentStyle.underline ? 'bg-surface text-primary shadow-sm' : 'text-text/40 hover:text-text/60'
                  }`}
                >
                  <Underline className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const newVal = !currentStyle.strike;
                    updateStyles({
                      strike: newVal,
                      underline: newVal ? false : currentStyle.underline
                    });
                  }}
                  className={`p-1.5 rounded-md transition-colors ${
                    currentStyle.strike ? 'bg-surface text-primary shadow-sm' : 'text-text/40 hover:text-text/60'
                  }`}
                >
                  <Strikethrough className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Highlight Options */}
            <div className={`space-y-3 pt-2 border-t border-text/5 transition-opacity ${!isMainTitle ? 'opacity-40 pointer-events-none grayscale-[0.5]' : ''}`}>
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest flex items-center gap-2">
                  <Palette className="w-3 h-3" /> Efecto de Resalte (*texto*)
                </label>
                {!isMainTitle && (
                  <span className="text-[8px] font-bold text-primary uppercase tracking-tighter bg-primary/10 px-1.5 py-0.5 rounded">
                    Solo Títulos
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Ninguno', value: 'none' },
                  { label: 'Sólido', value: 'solid' },
                  { label: 'Degradado', value: 'gradient' }
                ].map((opt) => (
                  <button
                    key={opt.value}
                    disabled={!isMainTitle}
                    onClick={() => updateStyle('highlightType', opt.value)}
                    className={`py-2 px-3 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${
                      (currentStyle.highlightType || 'none') === opt.value
                        ? 'bg-primary/5 border-primary text-primary'
                        : 'bg-background border-text/10 text-text/60 hover:border-text/20'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {currentStyle.highlightType && currentStyle.highlightType !== 'none' && isMainTitle && (
                <div className="grid grid-cols-2 gap-3">
                  <ColorPicker
                    label="Color 1"
                    color={defaultColor1}
                    onChange={(color) => updateStyle('highlightColor1', color)}
                  />
                  {currentStyle.highlightType !== 'solid' && (
                    <ColorPicker
                      label="Color 2"
                      color={defaultColor2}
                      onChange={(color) => updateStyle('highlightColor2', color)}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mini Module Preview - Proportionate box at the bottom */}
          <div className="pt-8 border-t border-text/5 mt-8">
            <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest mb-3 block">
              Vista Previa del Módulo
            </label>
            <div className="relative w-full aspect-video bg-background rounded-xl border border-text/10 overflow-hidden shadow-inner group">
              <div className="absolute inset-0 origin-top-left scale-[0.25] w-[400%] h-[400%] pointer-events-none">
                {renderMiniModule()}
              </div>
              {/* Overlay to indicate it's a preview */}
              <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
            </div>
            <p className="text-[9px] text-text/30 mt-2 text-center italic">
              Vista previa contextual del módulo completo
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

