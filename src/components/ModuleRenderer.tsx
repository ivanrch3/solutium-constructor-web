import React from 'react';
import { 
  Trash2, 
  GripVertical, 
  Settings2, 
  Image as ImageIcon, 
  ArrowRightCircle, 
  MousePointer2, 
  ArrowRight,
  Menu,
  X,
  ShieldCheck,
  BookOpen,
  PlayCircle,
  Mail,
  HelpCircle,
  EyeOff
} from 'lucide-react';
import { SolutiumPayload } from '../lib/solutium-sdk';
import {
  TopBarModule,
  HeaderModule,
  HeroModule,
  FeaturesModule,
  ProductShowcaseModule,
  TestimonialsModule,
  PricingModule,
  ContactModule,
  FooterModule,
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
} from './modules';

import { usePageLayout } from '../context/PageLayoutContext';

interface ModuleRendererProps {
  module: any;
  modules?: any[];
  onRemove: (id: string) => void;
  onUpdate: (id: string, data: any) => void;
  onOpenImagePicker: (callback: (url: string) => void) => void;
  onSelect: (moduleId: string) => void;
  onEdit: (moduleId: string) => void;
  isSelected?: boolean;
  config: SolutiumPayload | null;
  selectedProductIds: string[];
  isPreview?: boolean;
}

export const ModuleRenderer = ({ 
  module, 
  modules = [],
  onRemove, 
  onUpdate, 
  onOpenImagePicker, 
  onSelect, 
  onEdit,
  isSelected, 
  config, 
  selectedProductIds,
  isPreview = false
}: ModuleRendererProps) => {
  const { pageLayout } = usePageLayout();
  const isSeamless = pageLayout === 'seamless';

  // Calculate effective theme based on automatic alternation and continuity control
  const getEffectiveTheme = () => {
    const index = modules.findIndex(m => m.id === module.id);
    if (index === -1) return module.data?.theme || 'light';

    let currentTheme = 'light'; // Default baseline
    
    for (let i = 0; i <= index; i++) {
      const m = modules[i];
      const isFirst = i === 0;
      const explicitTheme = m.data?.theme;
      const disableAlternation = m.data?.disableColorAlternation;

      if (isFirst) {
        currentTheme = explicitTheme || 'light';
      } else {
        if (explicitTheme) {
          // If a theme is explicitly chosen, it becomes the new baseline
          currentTheme = explicitTheme;
        } else {
          // If no theme is chosen, we decide based on alternation setting
          if (!disableAlternation) {
            // Default: alternate
            currentTheme = currentTheme === 'light' ? 'dark' : 'light';
          }
          // If disableAlternation is true, currentTheme remains the same as previous
        }
      }
    }
    
    return currentTheme;
  };

  const effectiveTheme = getEffectiveTheme();
  const moduleData = { ...module.data, theme: effectiveTheme };

  const handleCTA = (e: React.MouseEvent) => {
    if (!isPreview) return;
    e.preventDefault();
    e.stopPropagation();
    
    // Simple logic: scroll to the next section
    const currentElement = document.getElementById(`module-${module.id}`);
    const nextSection = currentElement?.parentElement?.nextElementSibling?.querySelector('[id^="module-"]');
    
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If no next section, scroll to contact if it exists
      const contactSection = document.querySelector('[id*="contact"]');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const renderContent = () => {
    switch (module.type) {
      case 'top-bar':
        return <TopBarModule data={moduleData} isPreview={isPreview} config={config} />;
      case 'header':
        return <HeaderModule data={moduleData} modules={modules} isPreview={isPreview} onCTA={handleCTA} config={config} />;
      case 'hero':
        return <HeroModule data={moduleData} onUpdate={(newData) => onUpdate(module.id, newData)} onCTA={handleCTA} />;
      case 'features':
        return <FeaturesModule data={moduleData} />;
      case 'product-showcase':
        return <ProductShowcaseModule data={moduleData} config={config} selectedProductIds={selectedProductIds} />;
      case 'testimonials':
        return <TestimonialsModule data={moduleData} />;
      case 'pricing':
        return <PricingModule data={moduleData} onCTA={handleCTA} />;
      case 'contact':
        return <ContactModule data={moduleData} />;
      case 'footer':
        return <FooterModule data={moduleData} config={config} />;

      case 'trust-bar':
        return <TrustBarModule data={moduleData} />;
      case 'about':
        return <AboutModule data={moduleData} />;
      case 'process':
        return <ProcessModule data={moduleData} />;
      case 'stats':
        return <StatsModule data={moduleData} />;
      case 'gallery':
        return <GalleryModule data={moduleData} />;
      case 'video':
        return <VideoModule data={moduleData} />;
      case 'newsletter':
        return <NewsletterModule data={moduleData} />;
      case 'cta-banner':
        return <CtaBannerModule data={moduleData} />;
      case 'team':
        return <TeamModule data={moduleData} />;
      case 'faq':
        return <FaqModule data={moduleData} />;
      case 'spacer':
        return <SpacerModule data={moduleData} isPreview={isPreview} />;
      default:
        return (
          <div className="p-12 bg-background border border-dashed border-text/10 rounded-2xl text-center">
            <p className="text-text/40 font-medium">Módulo {module.type} en desarrollo</p>
          </div>
        );
    }
  };

  if (module.data?.isHidden && isPreview) {
    return null;
  }

  return (
    <div 
      id={`module-${module.id}`}
      className={`group relative ${isPreview || isSeamless ? '' : 'mb-8'} transition-all duration-300 ${isSelected && !isPreview ? `ring-2 ring-[#FF0080] ring-offset-4 ${isSeamless ? 'rounded-none' : 'rounded-2xl'}` : ''} ${module.data?.isHidden ? 'opacity-50 grayscale' : ''}`}
      onClick={() => onSelect(module.id)}
    >
      {/* Module Controls */}
      {!isPreview && module.type !== 'top-bar' && (
        <div className={`absolute top-4 right-4 flex items-center gap-2 transition-all duration-300 z-30 ${
          isSelected 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'
        }`}>
          <div className="flex items-center gap-1 bg-surface/90 backdrop-blur-md p-1.5 rounded-2xl shadow-2xl border border-text/10">
            <button 
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(module.id);
              }}
              className="p-2.5 text-text/40 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
              title="Ajustes del módulo"
            >
              <Settings2 className="w-4 h-4" />
            </button>
            <button 
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onRemove(module.id);
              }}
              className="p-2.5 text-text/40 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              title="Eliminar módulo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Module Content */}
      <div className="relative">
        {module.data?.isHidden && !isPreview && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/50 backdrop-blur-[2px] pointer-events-none">
            <div className="bg-surface px-4 py-2 rounded-full shadow-lg border border-text/10 flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-text/60" />
              <span className="text-sm font-medium text-text/60">Módulo oculto</span>
            </div>
          </div>
        )}
        {renderContent()}
      </div>
    </div>
  );
};
