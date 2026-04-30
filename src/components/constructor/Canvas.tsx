import React from 'react';
import { 
  PlusCircle, 
  Monitor, 
  Tablet, 
  Smartphone, 
  RotateCcw,
  Minimize 
} from 'lucide-react';
import { EditorState, WebModule } from '../../types/constructor';
import { Product, Customer } from '../../types/schema';
import { useEditorStore } from '../../store/editorStore';
import { isDarkColor } from './utils';
import { ProductsModule } from './modules/ProductsModule';
import { HeroModule } from './modules/HeroModule';
import { FeaturesModule } from './modules/FeaturesModule';
import { AboutModule } from './modules/AboutModule';
import { ProcessModule } from './modules/ProcessModule';
import { GalleryModule } from './modules/GalleryModule';
import { VideoModule } from './modules/VideoModule';
import { TestimonialsModule } from './modules/TestimonialsModule';
import { StatsModule } from './modules/StatsModule';
import { TeamModule } from './modules/TeamModule';
import { PricingModule } from './modules/PricingModule';
import { FAQModule } from './modules/FAQModule';
import { ContactModule } from './modules/ContactModule';
import { ClientsModule } from './modules/ClientsModule';
import { CTAModule } from './modules/CTAModule';
import { NewsletterModule } from './modules/NewsletterModule';
import { HeaderModule } from './modules/HeaderModule';
import { MenuModule } from './modules/MenuModule';
import { FooterModule } from './modules/FooterModule';
import { SpacerModule } from './modules/SpacerModule';
import { BentoModule } from './modules/BentoModule';
import { ComparisonModule } from './modules/ComparisonModule';

interface CanvasProps {
  editorState: EditorState;
  onAddModule: (module: WebModule) => void;
  products: Product[];
  customers: Customer[];
  isDevMode: boolean;
  logoUrl?: string | null;
  logoWhiteUrl?: string | null;
  viewport: 'desktop' | 'tablet' | 'mobile';
  setViewport: (v: 'desktop' | 'tablet' | 'mobile') => void;
  isFullscreen: boolean;
  setIsFullscreen: (f: boolean) => void;
  isPreviewMode: boolean;
  onSettingChange: (elementOrModuleId: string, settingId: string, value: any) => void;
  onReload: () => void;
  reloadKey?: number;
}

export const Canvas: React.FC<CanvasProps> = ({ 
  editorState, 
  onAddModule, 
  products, 
  customers, 
  isDevMode, 
  logoUrl, 
  logoWhiteUrl, 
  viewport, 
  setViewport, 
  isFullscreen, 
  setIsFullscreen,
  isPreviewMode,
  onSettingChange,
  onReload,
  reloadKey = 0
}) => {
  const { selectSection, selectedSectionId, siteContent } = useEditorStore();
  const lastModuleRef = React.useRef<HTMLDivElement>(null);
  const prevModulesLength = React.useRef(editorState.addedModules?.length || 0);

  const viewportWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px'
  };

  React.useEffect(() => {
    if ((editorState.addedModules?.length || 0) > prevModulesLength.current) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          lastModuleRef.current?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }, 100);
      });
    }
    prevModulesLength.current = editorState.addedModules?.length || 0;
  }, [editorState.addedModules?.length]);

  React.useEffect(() => {
    if (editorState.expandedModuleId) {
      const element = document.getElementById(editorState.expandedModuleId);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }
  }, [editorState.expandedModuleId]);

  return (
    <div className={`flex-1 bg-secondary/50 overflow-y-auto custom-scrollbar transition-all duration-500 ${isFullscreen ? 'fixed inset-0 z-[100] bg-secondary' : ''} ${isPreviewMode ? 'bg-surface p-0' : ''}`}>
      {isFullscreen && !isPreviewMode && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-2 bg-surface/80 backdrop-blur-md border border-border/50 p-1.5 rounded-2xl shadow-2xl">
          <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-xl">
            <button 
              onClick={() => setViewport('desktop')}
              className={`p-2 rounded-lg transition-all ${viewport === 'desktop' ? 'text-primary bg-surface shadow-sm' : 'text-text/40 hover:text-primary'}`}
              title="Escritorio"
            >
              <Monitor size={16} />
            </button>
            <button 
              onClick={() => setViewport('tablet')}
              className={`p-2 rounded-lg transition-all ${viewport === 'tablet' ? 'text-primary bg-surface shadow-sm' : 'text-text/40 hover:text-primary'}`}
              title="Tablet"
            >
              <Tablet size={16} />
            </button>
            <button 
              onClick={() => setViewport('mobile')}
              className={`p-2 rounded-lg transition-all ${viewport === 'mobile' ? 'text-primary bg-surface shadow-sm' : 'text-text/40 hover:text-primary'}`}
              title="Móvil"
            >
              <Smartphone size={16} />
            </button>
          </div>
          <div className="w-px h-4 bg-border/50 mx-1" />
          <button 
            onClick={onReload}
            className="p-2 text-text/40 hover:text-primary transition-all"
            title="Recargar página"
          >
            <RotateCcw size={16} />
          </button>
          <button 
            onClick={() => setIsFullscreen(false)}
            className="p-2 text-text/40 hover:text-rose-500 transition-all"
            title="Salir de Pantalla Completa"
          >
            <Minimize size={18} />
          </button>
        </div>
      )}
      <div className={`flex justify-center min-h-full transition-all duration-500 ${isFullscreen ? 'p-12 pt-24' : isPreviewMode ? 'p-0' : 'p-12'}`}>
        <div 
          className={`bg-surface relative transition-all duration-500 ease-in-out @container ${
            isPreviewMode ? 'w-full max-w-none border-none rounded-none shadow-none' : 
            isFullscreen ? 'rounded-3xl border border-border/50 shadow-2xl' : 'rounded-2xl border border-border/50 shadow-2xl'
          } ${viewport === 'mobile' && !isPreviewMode ? 'rounded-[3rem] border-[8px] border-slate-900 shadow-[0_0_0_2px_rgba(0,0,0,0.1)]' : ''} ${viewport === 'tablet' && !isPreviewMode ? 'rounded-[2rem] border-[12px] border-slate-900 shadow-[0_0_0_2px_rgba(0,0,0,0.1)]' : ''}`}
          style={{ 
            width: isPreviewMode ? '100%' : viewportWidths[viewport], 
            maxWidth: isPreviewMode ? 'none' : viewport === 'desktop' ? '1200px' : viewportWidths[viewport],
            minHeight: isPreviewMode ? '100vh' : viewport === 'mobile' ? '667px' : viewport === 'tablet' ? '1024px' : '800px'
          }}
        >
          {viewport === 'mobile' && !isPreviewMode && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-50 flex items-center justify-center">
              <div className="w-10 h-1 bg-slate-800 rounded-full" />
            </div>
          )}
          <div className="w-full" key={reloadKey}>
            {(!editorState.addedModules || editorState.addedModules.length === 0) && !isPreviewMode ? (
              <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
                <div className="w-20 h-20 bg-secondary rounded-3xl flex items-center justify-center mb-6 text-text/20">
                  <PlusCircle size={40} />
                </div>
                <h3 className="text-xl font-bold text-text mb-2">Tu página está vacía</h3>
                <p className="text-text/40 max-w-xs mx-auto mb-8">
                  Empieza añadiendo módulos desde el catálogo lateral para construir tu sitio web.
                </p>
              </div>
            ) : (
              (editorState.addedModules || []).map((module, index) => {
                const isLast = index === (editorState.addedModules?.length || 0) - 1;
                
                // Determine if this module wrapper should be sticky/fixed
                const modulePos = editorState.settingsValues[`${module.id}_global_position`];
                const menuSticky = editorState.settingsValues[`${module.id}_global_sticky`];
                const isSticky = modulePos === 'sticky' || menuSticky === true;
                const isFixed = modulePos === 'fixed';

                // Calculate cumulative top offset for stacking floating modules
                let topOffset = 0;
                if (isSticky || isFixed) {
                  for (let i = 0; i < index; i++) {
                    const prev = editorState.addedModules[i];
                    const prevPos = editorState.settingsValues[`${prev.id}_global_position`];
                    const prevSticky = editorState.settingsValues[`${prev.id}_global_sticky`];
                    const isPrevFloating = prevPos === 'sticky' || prevPos === 'fixed' || prevSticky === true;
                    
                    if (isPrevFloating) {
                      if (prev.type === 'conversion' || prev.type === 'header') {
                        const showMarquee = editorState.settingsValues[`${prev.id}_el_header_marquee_show_marquee`] ?? true;
                        const showReg = editorState.settingsValues[`${prev.id}_el_header_quick_reg_show_reg`] ?? false;
                        const showActions = editorState.settingsValues[`${prev.id}_el_header_actions_show_actions`] ?? true;
                        
                        // Determine if content actually renders (Sync with HeaderModule.tsx)
                        const primaryUrl = editorState.settingsValues[`${prev.id}_el_header_actions_primary_url`] || '';
                        const secondaryUrl = editorState.settingsValues[`${prev.id}_el_header_actions_secondary_url`] || '';
                        const hasPrimary = primaryUrl !== '';
                        const hasSecondary = secondaryUrl !== '';
                        const hasButtons = showActions && (hasPrimary || hasSecondary);
                        const hasContent = showReg || hasButtons;
                        
                        const layoutType = editorState.settingsValues[`${prev.id}_global_layout_type`] || 'standard';
                        const isCompact = layoutType === 'compact';
                        
                        let h = 0;
                        if (showMarquee) h += 32; // Marquee (py-2 = 16px + font-size approx 16px)
                        if (hasContent) {
                          const py = isCompact ? 12 : 20;
                          const contentH = isCompact ? 34 : 38; // Measured base height of buttons/form
                          h += (py * 2) + contentH + 1; // Content + paddings + bottom border
                        }
                        
                        topOffset += h;
                      } else if (prev.type === 'navegacion' || prev.type === 'menu') {
                        const pyValue = editorState.settingsValues[`${prev.id}_global_padding_y`];
                        const py = (typeof pyValue === 'number' ? pyValue : parseFloat(pyValue)) || 20;
                        topOffset += (isNaN(py) ? 20 : py * 2) + 40;
                      }
                    }
                  }
                }

                // Higher z-index for earlier modules to ensure top bar is always on top
                const stackingZIndex = 110 - index;

                const theme = siteContent.theme;
                const invert = theme.invertedAlternatingMode || false;
                const isDarkForced = theme.alternatingDarkMode 
                  ? (invert ? (index % 2 === 0) : (index % 2 !== 0)) 
                  : false;
                const isThemeForced = theme.alternatingThemeMode 
                  ? (invert ? (index % 2 === 0) : (index % 2 !== 0)) 
                  : false;
                
                // Create overrides for this specific module
                const moduleOverrides: Record<string, any> = {};
                
                if (isDarkForced) {
                  moduleOverrides[`${module.id}_global_dark_mode`] = true;
                  moduleOverrides[`${module.id}_global_bg_color`] = '#0F172A';
                  moduleOverrides[`${module.id}_global_bg_type`] = 'color';
                } else if (isThemeForced) {
                  const projectBg = theme.themeBackgroundColor || theme.secondaryColor;
                  const isDark = isDarkColor(projectBg);
                  
                  moduleOverrides[`${module.id}_global_dark_mode`] = isDark;
                  moduleOverrides[`${module.id}_global_bg_color`] = projectBg;
                  moduleOverrides[`${module.id}_global_bg_type`] = 'color';
                }

                // If global animation is set and not custom, we want modules to use it
                // We'll pass it as a special prop or via settings
                if (theme.globalAnimationType && theme.globalAnimationType !== 'custom') {
                  moduleOverrides[`${module.id}_global_entrance_anim`] = theme.globalAnimationType;
                }

                const finalSettings = { ...editorState.settingsValues, ...moduleOverrides };

                return (
                  <div 
                    key={module.id} 
                    id={module.id} 
                    ref={isLast ? lastModuleRef : null} 
                    onClick={(e) => {
                      if (isPreviewMode) return;
                      e.stopPropagation();
                      selectSection(module.id);
                    }}
                    className={`w-full group relative outline-none transition-all duration-300 ${isSticky || isFixed ? 'sticky' : 'relative'} ${
                      (!isPreviewMode && selectedSectionId === module.id) 
                        ? 'ring-2 ring-blue-500 ring-inset shadow-2xl z-50 cursor-pointer' 
                        : !isPreviewMode ? 'hover:ring-1 hover:ring-blue-300/50 ring-inset cursor-pointer' : ''
                    }`}
                    style={{ 
                      top: isSticky || isFixed ? `${topOffset}px` : undefined,
                      zIndex: isSticky || isFixed ? stackingZIndex : (selectedSectionId === module.id ? 50 : 1)
                    }}
                  >
                    {/* Indicador de Selección */}
                    {selectedSectionId === module.id && !isPreviewMode && (
                      <div className="absolute -left-1 top-0 bottom-0 w-1 bg-blue-500 z-50 rounded-full" />
                    )}
                    {module.type === 'products' && (
                      <ProductsModule 
                        moduleId={module.id}
                        settingsValues={finalSettings}
                        products={products}
                        isDevMode={isDevMode}
                        isPreviewMode={isPreviewMode}
                      />
                    )}
                    {module.type === 'hero' && (
                      <HeroModule 
                        moduleId={module.id}
                        settingsValues={finalSettings}
                        logoUrl={logoUrl}
                        logoWhiteUrl={logoWhiteUrl}
                        isPreviewMode={isPreviewMode}
                      />
                    )}
                    {module.type === 'features' && (
                      <FeaturesModule 
                        moduleId={module.id}
                        settingsValues={finalSettings}
                        isPreviewMode={isPreviewMode}
                      />
                    )}
                    {module.type === 'about' && (
                      <AboutModule 
                        moduleId={module.id}
                        settingsValues={finalSettings}
                        isPreviewMode={isPreviewMode}
                      />
                    )}
                    {module.type === 'process' && (
                      <ProcessModule 
                        moduleId={module.id}
                        settingsValues={finalSettings}
                        isPreviewMode={isPreviewMode}
                      />
                    )}
                    {module.type === 'gallery' && (
                      <GalleryModule 
                        moduleId={module.id}
                        settingsValues={finalSettings}
                        isPreviewMode={isPreviewMode}
                      />
                    )}
                    {module.type === 'video' && (
                      <VideoModule 
                        moduleId={module.id}
                        settingsValues={finalSettings}
                        isPreviewMode={isPreviewMode}
                      />
                    )}
                    {module.type === 'testimonials' && (
                      <TestimonialsModule 
                        moduleId={module.id}
                        settingsValues={finalSettings}
                        isPreviewMode={isPreviewMode}
                      />
                    )}
                    {module.type === 'stats' && (
                      <StatsModule 
                        moduleId={module.id}
                        settingsValues={finalSettings}
                        isPreviewMode={isPreviewMode}
                      />
                    )}
                    {module.type === 'team' && (
                      <TeamModule 
                        moduleId={module.id}
                        settingsValues={finalSettings}
                        isPreviewMode={isPreviewMode}
                      />
                    )}
                    {module.type === 'pricing' && (
                      <PricingModule 
                        moduleId={module.id}
                        settingsValues={finalSettings}
                        isPreviewMode={isPreviewMode}
                      />
                    )}
                    {module.type === 'faq' && (
                      <FAQModule 
                        moduleId={module.id}
                        settingsValues={finalSettings}
                        isPreviewMode={isPreviewMode}
                      />
                    )}
                    {module.type === 'contact' && (
                      <ContactModule 
                        moduleId={module.id}
                        settingsValues={finalSettings}
                        isPreviewMode={isPreviewMode}
                      />
                    )}
                    {module.type === 'clients' && (
                      <ClientsModule 
                        moduleId={module.id}
                        settingsValues={finalSettings}
                        customers={customers}
                        isDevMode={isDevMode}
                        isPreviewMode={isPreviewMode}
                      />
                    )}
                    {module.type === 'cta' && (
                      <CTAModule 
                        moduleId={module.id}
                        settingsValues={finalSettings}
                        isPreviewMode={isPreviewMode}
                      />
                    )}
                    {module.type === 'newsletter' && (
                      <NewsletterModule 
                        moduleId={module.id}
                        settingsValues={finalSettings}
                        isPreviewMode={isPreviewMode}
                      />
                    )}
                    {module.type === 'conversion' && (module.templateId === 'mod_header_1' || module.id.startsWith('mod_header_1')) && (
                      <HeaderModule 
                        moduleId={module.id}
                        settingsValues={finalSettings}
                        isPreviewMode={isPreviewMode}
                      />
                    )}
                    {(module.type === 'navegacion' || module.type === 'menu') && (module.templateId === 'mod_menu_1' || module.id.startsWith('mod_menu_1')) && (
                      <MenuModule 
                        moduleId={module.id}
                        settingsValues={finalSettings}
                        logoUrl={logoUrl}
                        logoWhiteUrl={logoWhiteUrl}
                        isPreviewMode={isPreviewMode}
                      />
                    )}
                    {(module.type === 'footer' || module.type === 'navegacion') && (module.templateId === 'mod_footer_1' || module.id.startsWith('mod_footer_1')) && (
                      <FooterModule 
                        moduleId={module.id}
                        settingsValues={finalSettings}
                        logoUrl={logoUrl}
                        logoWhiteUrl={logoWhiteUrl}
                        isPreviewMode={isPreviewMode}
                      />
                    )}
                    {module.type === 'spacer' && (
                      <SpacerModule 
                        moduleId={module.id}
                        settingsValues={finalSettings}
                        isPreviewMode={isPreviewMode}
                      />
                    )}
                    {(module.templateId === 'mod_bento_1' || module.id.startsWith('mod_bento_1')) && (
                      <BentoModule 
                        moduleId={module.id}
                        settingsValues={finalSettings}
                        onSettingChange={onSettingChange}
                        isPreviewMode={isPreviewMode}
                      />
                    )}
                    {module.type === 'comparative' && (
                      <ComparisonModule 
                        moduleId={module.id}
                        settingsValues={finalSettings}
                        preview={isPreviewMode}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
