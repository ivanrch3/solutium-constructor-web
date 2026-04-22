import React from 'react';
import { 
  PlusCircle, 
  Monitor, 
  Tablet, 
  Smartphone, 
  RotateCcw 
} from 'lucide-react';
import { EditorState, WebModule } from '../../types/constructor';
import { Product, Customer } from '../../types/schema';
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
  onSettingChange
}) => {
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
      const element = document.getElementById(`module-${editorState.expandedModuleId}`);
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
            onClick={() => setIsFullscreen(false)}
            className="p-2 text-text/40 hover:text-rose-500 transition-all"
            title="Salir de Pantalla Completa"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      )}
      <div className={`flex justify-center min-h-full transition-all duration-500 ${isFullscreen ? 'p-12 pt-24' : isPreviewMode ? 'p-0' : 'p-12'}`}>
        <div 
          className={`bg-surface relative overflow-hidden transition-all duration-500 ease-in-out @container ${
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
          <div className="w-full">
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
                
                return (
                  <div key={module.id} id={`module-${module.id}`} ref={isLast ? lastModuleRef : null} className="w-full">
                    {module.type === 'products' && (
                      <ProductsModule 
                        moduleId={module.id}
                        settingsValues={editorState.settingsValues}
                        products={products}
                        isDevMode={isDevMode}
                      />
                    )}
                    {module.type === 'hero' && (
                      <HeroModule 
                        moduleId={module.id}
                        settingsValues={editorState.settingsValues}
                        logoUrl={logoUrl}
                        logoWhiteUrl={logoWhiteUrl}
                      />
                    )}
                    {module.type === 'features' && (
                      <FeaturesModule 
                        moduleId={module.id}
                        settingsValues={editorState.settingsValues}
                      />
                    )}
                    {module.type === 'about' && (
                      <AboutModule 
                        moduleId={module.id}
                        settingsValues={editorState.settingsValues}
                      />
                    )}
                    {module.type === 'process' && (
                      <ProcessModule 
                        moduleId={module.id}
                        settingsValues={editorState.settingsValues}
                      />
                    )}
                    {module.type === 'gallery' && (
                      <GalleryModule 
                        moduleId={module.id}
                        settingsValues={editorState.settingsValues}
                      />
                    )}
                    {module.type === 'video' && (
                      <VideoModule 
                        moduleId={module.id}
                        settingsValues={editorState.settingsValues}
                      />
                    )}
                    {module.type === 'testimonials' && (
                      <TestimonialsModule 
                        moduleId={module.id}
                        settingsValues={editorState.settingsValues}
                      />
                    )}
                    {module.type === 'stats' && (
                      <StatsModule 
                        moduleId={module.id}
                        settingsValues={editorState.settingsValues}
                      />
                    )}
                    {module.type === 'team' && (
                      <TeamModule 
                        moduleId={module.id}
                        settingsValues={editorState.settingsValues}
                      />
                    )}
                    {module.type === 'pricing' && (
                      <PricingModule 
                        moduleId={module.id}
                        settingsValues={editorState.settingsValues}
                      />
                    )}
                    {module.type === 'faq' && (
                      <FAQModule 
                        moduleId={module.id}
                        settingsValues={editorState.settingsValues}
                      />
                    )}
                    {module.type === 'contact' && (
                      <ContactModule 
                        moduleId={module.id}
                        settingsValues={editorState.settingsValues}
                      />
                    )}
                    {module.type === 'clients' && (
                      <ClientsModule 
                        moduleId={module.id}
                        settingsValues={editorState.settingsValues}
                        customers={customers}
                        isDevMode={isDevMode}
                      />
                    )}
                    {module.type === 'cta' && (
                      <CTAModule 
                        moduleId={module.id}
                        settingsValues={editorState.settingsValues}
                      />
                    )}
                    {module.type === 'newsletter' && (
                      <NewsletterModule 
                        moduleId={module.id}
                        settingsValues={editorState.settingsValues}
                      />
                    )}
                    {module.type === 'conversion' && module.id.startsWith('mod_header_1') && (
                      <HeaderModule 
                        moduleId={module.id}
                        settingsValues={editorState.settingsValues}
                      />
                    )}
                    {module.type === 'navegacion' && module.id.startsWith('mod_menu_1') && (
                      <MenuModule 
                        moduleId={module.id}
                        settingsValues={editorState.settingsValues}
                        logoUrl={logoUrl}
                        logoWhiteUrl={logoWhiteUrl}
                      />
                    )}
                    {module.type === 'navegacion' && module.id.startsWith('mod_footer_1') && (
                      <FooterModule 
                        moduleId={module.id}
                        settingsValues={editorState.settingsValues}
                        logoUrl={logoUrl}
                        logoWhiteUrl={logoWhiteUrl}
                      />
                    )}
                    {module.type === 'spacer' && (
                      <SpacerModule 
                        moduleId={module.id}
                        settingsValues={editorState.settingsValues}
                      />
                    )}
                    {module.id.startsWith('mod_bento_1') && (
                      <BentoModule 
                        moduleId={module.id}
                        settingsValues={editorState.settingsValues}
                        onSettingChange={onSettingChange}
                        isPreviewMode={isPreviewMode}
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
