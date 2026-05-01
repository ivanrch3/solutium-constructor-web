import React from 'react';
import { PublishedSite } from '../types/schema';
import { HeroModule } from './constructor/modules/HeroModule';
import { FeaturesModule } from './constructor/modules/FeaturesModule';
import { AboutModule } from './constructor/modules/AboutModule';
import { ProcessModule } from './constructor/modules/ProcessModule';
import { GalleryModule } from './constructor/modules/GalleryModule';
import { TestimonialsModule } from './constructor/modules/TestimonialsModule';
import { StatsModule } from './constructor/modules/StatsModule';
import { TeamModule } from './constructor/modules/TeamModule';
import { PricingModule } from './constructor/modules/PricingModule';
import { FAQModule } from './constructor/modules/FAQModule';
import { ContactModule } from './constructor/modules/ContactModule';
import { ProductsModule } from './constructor/modules/ProductsModule';
import { ClientsModule } from './constructor/modules/ClientsModule';
import { CTAModule } from './constructor/modules/CTAModule';
import { HeaderModule } from './constructor/modules/HeaderModule';
import { FooterModule } from './constructor/modules/FooterModule';
import { NewsletterModule } from './constructor/modules/NewsletterModule';
import { VideoModule } from './constructor/modules/VideoModule';
import { SpacerModule } from './constructor/modules/SpacerModule';
import { MenuModule } from './constructor/modules/MenuModule';
import { AlertCircle } from 'lucide-react';
import { logDebug } from '../utils/debug';
import { bridgeModuleContent } from '../utils/hydrationBridge';

interface ViewerProps {
  site: PublishedSite;
  onBack?: () => void;
}

export const Viewer: React.FC<ViewerProps> = ({ site, onBack }) => {
  // SIP v5.0: Respect the Master Switch
  if (site.isActive === false) {
    return (
      <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-surface p-12 rounded-3xl shadow-xl border border-border max-w-md w-full flex flex-col items-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-text mb-4">Sitio deshabilitado</h1>
          <p className="text-text/60 mb-8 leading-relaxed">
            Este sitio ha sido deshabilitado por el administrador. Por favor, contacta con soporte si crees que esto es un error.
          </p>
          {onBack && (
            <button 
              onClick={onBack}
              className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
            >
              Volver al Dashboard
            </button>
          )}
        </div>
      </div>
    );
  }

  const { content } = site;
  
  // SIP v5.5 (Protocolo 10.2) - Integrity Check
  if (!content || !content.theme || !Array.isArray(content.sections)) {
    console.error('❌ [VIEWER] Error de Integridad: Campos obligatorios faltantes (content.theme, content.sections).');
    return (
      <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-surface p-12 rounded-3xl shadow-xl border border-border max-w-md w-full flex flex-col items-center border-rose-200">
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-rose-600" />
          </div>
          <h1 className="text-2xl font-bold text-text mb-4">Error de Hidratación</h1>
          <p className="text-text/60 mb-8 leading-relaxed text-sm">
            La integridad del sitio no pudo ser validada. Asegúrate de que el payload contenga <code className="bg-secondary px-1 py-0.5 rounded">theme</code> y <code className="bg-secondary px-1 py-0.5 rounded">sections</code> válidos (Protocolo 10.2).
          </p>
        </div>
      </div>
    );
  }

  const { theme, sections } = content;

  return (
    <div 
      className="min-h-screen bg-surface"
      style={{ 
        '--primary-color': theme.primaryColor || '#3B82F6',
        fontFamily: theme.fontFamily || 'sans-serif'
      } as React.CSSProperties}
    >
      {sections.map((section) => {
        const moduleId = section.id;
        // SOP: Fallback entre 'type' y 'tipo' para máxima compatibilidad
        const type = section.type || section.tipo; 
        const settings = section.settings || {};
        const content = section.content || {};

        if (!moduleId) {
          console.warn('⚠️ [VIEWER] Saltando sección sin ID.');
          return null;
        }

        // DIAGNÓSTICO PROFUNDO
        const isRenderMode = window.location.search.includes('mode=render') || window.location.search.includes('external_render=true');
        if (isRenderMode) {
          logDebug('[VIEWER_SECTION_DEBUG]', {
            moduleId,
            type,
            hasContent: !!section.content,
            contentKeys: section.content ? Object.keys(section.content) : [],
            title: section.content?.title,
            subtitle: section.content?.subtitle,
            settingsKeys: section.settings ? Object.keys(section.settings) : []
          });
        }

        // SIP v5.5: Adapt settings for modules that expect moduleId prefix
        // Now using relativeKey-preserving contract (Protocolo 12.0)
        const settingsValues = Object.entries(settings).reduce((acc, [key, value]) => {
          // If the key is already prefixed with the moduleId, use it as is
          if (key.startsWith(moduleId)) {
            acc[key] = value;
          } else {
            // Reconstruct the full key by prepending the moduleId (e.g., el_hero_title -> mod_123_el_hero_title)
            acc[`${moduleId}_${key}`] = value;
            
            // Fallback: If it's a legacy flat key (e.g., 'title'), we still set it 
            // the module might have logic to handle both or we might need it for global_ defaults
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, any>);

        // SIP v5.5 (Protocolo 10.5) - Centralized Hydration Bridge
        const finalSettingsValues = bridgeModuleContent({
          type,
          moduleId,
          content,
          settings,
          existingDeepValues: settingsValues
        });

        // Debug diagnostic for rendered sections
        if (isRenderMode && (type === 'hero' || type === 'features')) {
          logDebug('[SOLUTIUM_RENDER_DEBUG]', {
            type,
            moduleId,
            contentTitle: content?.title,
            finalTitle: finalSettingsValues[`${moduleId}_el_${type === 'hero' ? 'hero_typography' : 'features_header'}_title`],
            iframeUrl: window.location.href
          });
        }

        switch (type) {
          case 'header':
            return <HeaderModule key={moduleId} moduleId={moduleId} settingsValues={finalSettingsValues} />;
          case 'hero':
            return <HeroModule key={moduleId} moduleId={moduleId} settingsValues={finalSettingsValues} />;
          case 'features':
            return <FeaturesModule key={moduleId} moduleId={moduleId} settingsValues={finalSettingsValues} />;
          case 'about':
            return <AboutModule key={moduleId} moduleId={moduleId} settingsValues={finalSettingsValues} />;
          case 'process':
            return <ProcessModule key={moduleId} moduleId={moduleId} settingsValues={finalSettingsValues} />;
          case 'gallery':
            return <GalleryModule key={moduleId} moduleId={moduleId} settingsValues={finalSettingsValues} />;
          case 'testimonials':
            return <TestimonialsModule key={moduleId} moduleId={moduleId} settingsValues={finalSettingsValues} />;
          case 'stats':
            return <StatsModule key={moduleId} moduleId={moduleId} settingsValues={finalSettingsValues} />;
          case 'team':
            return <TeamModule key={moduleId} moduleId={moduleId} settingsValues={finalSettingsValues} />;
          case 'pricing':
            return <PricingModule key={moduleId} moduleId={moduleId} settingsValues={finalSettingsValues} />;
          case 'faq':
            return <FAQModule key={moduleId} moduleId={moduleId} settingsValues={finalSettingsValues} />;
          case 'contact':
            return <ContactModule key={moduleId} moduleId={moduleId} settingsValues={finalSettingsValues} />;
          case 'products':
            return <ProductsModule key={moduleId} moduleId={moduleId} settingsValues={finalSettingsValues} products={[]} />;
          case 'clients':
            return <ClientsModule key={moduleId} moduleId={moduleId} settingsValues={finalSettingsValues} customers={[]} />;
          case 'cta':
            return <CTAModule key={moduleId} moduleId={moduleId} settingsValues={finalSettingsValues} />;
          case 'newsletter':
            return <NewsletterModule key={moduleId} moduleId={moduleId} settingsValues={finalSettingsValues} />;
          case 'video':
            return <VideoModule key={moduleId} moduleId={moduleId} settingsValues={finalSettingsValues} />;
          case 'spacer':
            return <SpacerModule key={moduleId} moduleId={moduleId} settingsValues={finalSettingsValues} />;
          case 'menu':
          case 'navegacion':
            return <MenuModule key={moduleId} moduleId={moduleId} settingsValues={finalSettingsValues} />;
          case 'footer':
            return <FooterModule key={moduleId} moduleId={moduleId} settingsValues={finalSettingsValues} />;
          default:
            return null;
        }
      })}

      {onBack && (
        <button 
          onClick={onBack}
          className="fixed bottom-8 right-8 bg-surface/80 backdrop-blur-md border border-border p-3 rounded-full shadow-xl hover:bg-surface transition-all z-50 text-text/60 hover:text-primary"
          title="Cerrar vista previa"
        >
          <AlertCircle className="w-6 h-6 rotate-180" />
        </button>
      )}
    </div>
  );
};
