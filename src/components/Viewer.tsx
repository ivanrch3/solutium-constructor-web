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
        const settings = section.settings || section.content || {};

        if (!moduleId) {
          console.warn('⚠️ [VIEWER] Saltando sección sin ID.');
          return null;
        }

        // SIP v5.5: Adapt settings for modules that expect moduleId prefix
        const settingsValues = Object.entries(settings).reduce((acc, [key, value]) => {
          // Si la clave ya tiene el prefijo del módulo, la dejamos como está
          if (key.startsWith(moduleId)) {
            acc[key] = value;
          } else if (key.startsWith('global_')) {
            acc[`${moduleId}_${key}`] = value;
          } else {
            // Si es una clave plana, intentamos mapearla (por ejemplo, 'title' -> 'mod_id_el_module_type_typography_title')
            // Esto es un fallback agresivo para payloads directos menos estructurados
            acc[key] = value;
            acc[`${moduleId}_${key}`] = value;
          }
          return acc;
        }, {} as Record<string, any>);

        switch (type) {
          case 'header':
            return <HeaderModule key={moduleId} moduleId={moduleId} settingsValues={settingsValues} />;
          case 'hero':
            return <HeroModule key={moduleId} moduleId={moduleId} settingsValues={settingsValues} />;
          case 'features':
            return <FeaturesModule key={moduleId} moduleId={moduleId} settingsValues={settingsValues} />;
          case 'about':
            return <AboutModule key={moduleId} moduleId={moduleId} settingsValues={settingsValues} />;
          case 'process':
            return <ProcessModule key={moduleId} moduleId={moduleId} settingsValues={settingsValues} />;
          case 'gallery':
            return <GalleryModule key={moduleId} moduleId={moduleId} settingsValues={settingsValues} />;
          case 'testimonials':
            return <TestimonialsModule key={moduleId} moduleId={moduleId} settingsValues={settingsValues} />;
          case 'stats':
            return <StatsModule key={moduleId} moduleId={moduleId} settingsValues={settingsValues} />;
          case 'team':
            return <TeamModule key={moduleId} moduleId={moduleId} settingsValues={settingsValues} />;
          case 'pricing':
            return <PricingModule key={moduleId} moduleId={moduleId} settingsValues={settingsValues} />;
          case 'faq':
            return <FAQModule key={moduleId} moduleId={moduleId} settingsValues={settingsValues} />;
          case 'contact':
            return <ContactModule key={moduleId} moduleId={moduleId} settingsValues={settingsValues} />;
          case 'products':
            return <ProductsModule key={moduleId} moduleId={moduleId} settingsValues={settingsValues} products={[]} />;
          case 'clients':
            return <ClientsModule key={moduleId} moduleId={moduleId} settingsValues={settingsValues} customers={[]} />;
          case 'cta':
            return <CTAModule key={moduleId} moduleId={moduleId} settingsValues={settingsValues} />;
          case 'newsletter':
            return <NewsletterModule key={moduleId} moduleId={moduleId} settingsValues={settingsValues} />;
          case 'video':
            return <VideoModule key={moduleId} moduleId={moduleId} settingsValues={settingsValues} />;
          case 'spacer':
            return <SpacerModule key={moduleId} moduleId={moduleId} settingsValues={settingsValues} />;
          case 'menu':
            return <MenuModule key={moduleId} moduleId={moduleId} settingsValues={settingsValues} />;
          case 'footer':
            return <FooterModule key={moduleId} moduleId={moduleId} settingsValues={settingsValues} />;
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
