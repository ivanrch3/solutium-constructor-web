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

        // SIP v5.0: Adapt settings for modules that expect moduleId prefix
        const settingsValues = Object.entries(settings).reduce((acc, [key, value]) => {
          if (key.startsWith('global_')) {
            acc[`${moduleId}_${key}`] = value;
          } else {
            acc[key] = value;
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
