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
  const { theme, sections } = content;

  return (
    <div 
      className="min-h-screen bg-surface"
      style={{ 
        '--primary-color': theme.primaryColor,
        fontFamily: theme.fontFamily 
      } as React.CSSProperties}
    >
      {sections.map((section) => {
        const moduleId = section.id;
        const type = section.type;
        const settings = section.settings || {};

        // Helper to get setting value from the flat settings object
        const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
          const key = elementId ? `${elementId}_${settingId}` : `global_${settingId}`;
          return settings[key] !== undefined ? settings[key] : defaultValue;
        };

        switch (type) {
          case 'hero':
            return (
              <HeroModule 
                key={moduleId}
                moduleId={moduleId}
                getVal={getVal}
                isDevMode={false}
              />
            );
          case 'features':
            return (
              <FeaturesModule 
                key={moduleId}
                moduleId={moduleId}
                getVal={getVal}
                isDevMode={false}
              />
            );
          case 'about':
            return (
              <AboutModule 
                key={moduleId}
                moduleId={moduleId}
                getVal={getVal}
                isDevMode={false}
              />
            );
          case 'process':
            return (
              <ProcessModule 
                key={moduleId}
                moduleId={moduleId}
                getVal={getVal}
                isDevMode={false}
              />
            );
          case 'gallery':
            return (
              <GalleryModule 
                key={moduleId}
                moduleId={moduleId}
                getVal={getVal}
                isDevMode={false}
              />
            );
          case 'testimonials':
            return (
              <TestimonialsModule 
                key={moduleId}
                moduleId={moduleId}
                getVal={getVal}
                isDevMode={false}
              />
            );
          case 'stats':
            return (
              <StatsModule 
                key={moduleId}
                moduleId={moduleId}
                getVal={getVal}
                isDevMode={false}
              />
            );
          case 'team':
            return (
              <TeamModule 
                key={moduleId}
                moduleId={moduleId}
                getVal={getVal}
                isDevMode={false}
              />
            );
          case 'pricing':
            return (
              <PricingModule 
                key={moduleId}
                moduleId={moduleId}
                getVal={getVal}
                isDevMode={false}
              />
            );
          case 'faq':
            return (
              <FAQModule 
                key={moduleId}
                moduleId={moduleId}
                getVal={getVal}
                isDevMode={false}
              />
            );
          case 'contact':
            return (
              <ContactModule 
                key={moduleId}
                moduleId={moduleId}
                getVal={getVal}
                isDevMode={false}
              />
            );
          case 'products':
            return (
              <ProductsModule 
                key={moduleId}
                moduleId={moduleId}
                getVal={getVal}
                isDevMode={false}
                products={[]} // We would need to fetch these if we were a real standalone renderer
              />
            );
          case 'clients':
            return (
              <ClientsModule 
                key={moduleId}
                moduleId={moduleId}
                getVal={getVal}
                isDevMode={false}
                customers={[]} // We would need to fetch these if we were a real standalone renderer
              />
            );
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
