import React from 'react';
import { ArrowRight, CheckCircle2, Apple, Play } from 'lucide-react';
import { ModuleWrapper } from '../ui/ModuleWrapper';
import { Typography } from '../ui/Typography';

interface CtaBannerModuleProps {
  data: any;
  onUpdate?: (data: any) => void;
}

export const CtaBannerModule = ({ data, onUpdate }: CtaBannerModuleProps) => {
  const layoutType = data?.layoutType || 'center';
  const backgroundStyle = data?.backgroundStyle || 'solid';
  const showSecondaryButton = data?.showSecondaryButton !== false;
  const showAppBadges = data?.showAppBadges || false;
  const showNewsletter = data?.showNewsletter || false;
  const showMicroCopy = data?.showMicroCopy !== false;
  const showChecklist = data?.showChecklist || false;
  const showMockup = data?.showMockup || false;

  const handleTextUpdate = (path: string, value: string) => {
    if (onUpdate) {
      const newData = { ...data };
      const parts = path.split('.');
      let current = newData;
      for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i];
        if (Array.isArray(current[key])) {
          current[key] = [...current[key]];
        } else {
          current[key] = { ...current[key] };
        }
        current = current[key];
      }
      current[parts[parts.length - 1]] = value;
      onUpdate(newData);
    }
  };

  const getBackgroundClass = () => {
    if (data?.backgroundImage && backgroundStyle === 'image') return '';
    
    switch (backgroundStyle) {
      case 'gradient':
        return 'bg-gradient-to-br from-primary to-accent';
      case 'mesh':
        return 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary via-accent to-background';
      case 'solid':
      default:
        return 'bg-primary';
    }
  };

  const renderButtons = () => (
    <div className={`flex flex-col sm:flex-row gap-4 ${layoutType === 'center' || layoutType === 'minimal' ? 'justify-center' : ''}`}>
      {showAppBadges ? (
        <>
          <button className="flex items-center gap-3 px-6 py-3 bg-black text-white rounded-xl hover:bg-black/80 transition-all">
            <Apple className="w-8 h-8" />
            <div className="text-left">
              <div className="text-[10px] uppercase font-bold opacity-60">Download on the</div>
              <div className="text-lg font-bold leading-none">App Store</div>
            </div>
          </button>
          <button className="flex items-center gap-3 px-6 py-3 bg-black text-white rounded-xl hover:bg-black/80 transition-all">
            <Play className="w-7 h-7 fill-current" />
            <div className="text-left">
              <div className="text-[10px] uppercase font-bold opacity-60">Get it on</div>
              <div className="text-lg font-bold leading-none">Google Play</div>
            </div>
          </button>
        </>
      ) : showNewsletter ? (
        <form className="flex w-full max-w-md gap-2" onSubmit={(e) => e.preventDefault()}>
          <input 
            type="email" 
            placeholder={data?.newsletterPlaceholder || "Tu correo electrónico"} 
            className="flex-1 px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
          <button className="px-8 py-4 bg-white text-primary font-bold rounded-xl hover:bg-white/90 transition-all">
            <Typography
              variant="span"
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate('newsletterButtonText', text)}
            >
              {data?.newsletterButtonText || 'Suscribirse'}
            </Typography>
          </button>
        </form>
      ) : (
        <>
          {data?.primaryButton?.text && (
            <a 
              href={data.primaryButton.url || '#'}
              target={data.primaryButton.target || '_self'}
              onClick={(e) => {
                if (onUpdate) e.preventDefault();
              }}
              className="px-8 py-4 bg-white text-primary font-bold rounded-xl hover:bg-white/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Typography
                variant="span"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('primaryButton.text', text)}
              >
                {data.primaryButton.text}
              </Typography>
              <ArrowRight className="w-5 h-5" />
            </a>
          )}
          {showSecondaryButton && data?.secondaryButton?.text && (
            <a 
              href={data.secondaryButton.url || '#'}
              target={data.secondaryButton.target || '_self'}
              onClick={(e) => {
                if (onUpdate) e.preventDefault();
              }}
              className="px-8 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm flex items-center justify-center cursor-pointer"
            >
              <Typography
                variant="span"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('secondaryButton.text', text)}
              >
                {data.secondaryButton.text}
              </Typography>
            </a>
          )}
        </>
      )}
    </div>
  );

  const renderContent = () => (
    <div className={`relative z-10 ${layoutType === 'split' ? 'lg:w-1/2' : 'w-full max-w-4xl mx-auto'}`}>
      <Typography
        variant="h2"
        className={`font-black tracking-tight mb-6 ${layoutType === 'minimal' ? 'text-4xl' : 'text-4xl md:text-6xl'}`}
        editable={!!onUpdate}
        onUpdate={(text) => handleTextUpdate('title', text)}
      >
        {data?.title || '¿Listo para dar el siguiente paso?'}
      </Typography>
      
      <Typography
        variant="p"
        className={`text-xl md:text-2xl opacity-90 mb-10 leading-relaxed ${layoutType === 'minimal' ? 'max-w-2xl mx-auto' : ''}`}
        editable={!!onUpdate}
        onUpdate={(text) => handleTextUpdate('subtitle', text)}
      >
        {data?.subtitle || 'Empieza hoy mismo y transforma tu presencia digital.'}
      </Typography>

      {showChecklist && data?.checklist && (
        <div className={`flex flex-wrap gap-6 mb-10 ${layoutType === 'center' ? 'justify-center' : ''}`}>
          {data.checklist.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center gap-2 font-medium opacity-90">
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              <Typography
                variant="span"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate(`checklist.${idx}.text`, text)}
              >
                {item.text}
              </Typography>
            </div>
          ))}
        </div>
      )}

      {renderButtons()}

      {showMicroCopy && data?.microCopy && (
        <Typography
          variant="p"
          className="text-sm opacity-60 mt-6 font-medium"
          editable={!!onUpdate}
          onUpdate={(text) => handleTextUpdate('microCopy', text)}
        >
          {data.microCopy}
        </Typography>
      )}
    </div>
  );

  const renderMockup = () => {
    if (!showMockup || !data?.mockupImage) return null;
    
    return (
      <div className="lg:w-1/2 relative mt-12 lg:mt-0">
        <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-8 border-white/10 bg-black">
          <img 
            src={data.mockupImage} 
            alt="App Mockup" 
            className="w-full h-auto"
            referrerPolicy="no-referrer"
          />
        </div>
        {/* Decorative elements behind mockup */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/30 rounded-full blur-3xl" />
      </div>
    );
  };

  const getContainerClasses = () => {
    const base = 'relative overflow-hidden text-white';
    
    switch (layoutType) {
      case 'full':
        return `${base} py-32 px-6 md:px-12 w-full rounded-none`;
      case 'floating':
        return `${base} py-20 px-8 md:px-16 rounded-[3rem] shadow-2xl mx-4 md:mx-8 -mb-20 relative z-20`;
      case 'minimal':
        return `${base} py-24 px-6 text-center bg-transparent !text-text`;
      case 'split':
        return `${base} py-24 px-8 md:px-16 rounded-[3rem] flex flex-col lg:flex-row items-center gap-16`;
      case 'center':
      default:
        return `${base} py-24 px-8 md:px-16 rounded-[3rem] text-center`;
    }
  };

  return (
    <div className={layoutType === 'minimal' ? '' : 'p-4 md:p-8'}>
      <div 
        className={`${getContainerClasses()} ${getBackgroundClass()}`}
        style={backgroundStyle === 'image' && data?.backgroundImage ? {
          backgroundImage: `url(${data.backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {}}
      >
        {/* Overlay for image background */}
        {backgroundStyle === 'image' && (
          <div className="absolute inset-0 bg-black/50 z-0" />
        )}
        
        {/* Mesh Gradient Overlay */}
        {backgroundStyle === 'mesh' && (
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] z-0" />
        )}

        {renderContent()}
        {layoutType === 'split' && renderMockup()}
      </div>
    </div>
  );
};
