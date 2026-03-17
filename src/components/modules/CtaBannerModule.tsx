import React from 'react';
import { ArrowRight, CheckCircle2, Apple, Play } from 'lucide-react';
import { ModuleWrapper } from '../ui/ModuleWrapper';
import { Typography } from '../ui/Typography';
import { usePageLayout } from '../../context/PageLayoutContext';

interface CtaBannerModuleProps {
  data: any;
  onUpdate?: (data: any) => void;
}

export const CtaBannerModule = ({ data, onUpdate }: CtaBannerModuleProps) => {
  const { previewDevice } = usePageLayout();
  const is_mobile_simulated = previewDevice === 'mobile';
  const layout_type = data?.layout_type || 'center';
  const background_style = data?.background_style || 'solid';
  const show_secondary_button = data?.show_secondary_button !== false;
  const show_app_badges = data?.show_app_badges || false;
  const show_newsletter = data?.show_newsletter || false;
  const show_micro_copy = data?.show_micro_copy !== false;
  const show_checklist = data?.show_checklist || false;
  const show_mockup = data?.show_mockup || false;

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

  const get_background_class = () => {
    if (data?.background_image && background_style === 'image') return '';
    
    switch (background_style) {
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
    <div className={`flex ${is_mobile_simulated ? 'flex-col' : 'flex-col sm:flex-row'} gap-4 ${layout_type === 'center' || layout_type === 'minimal' ? 'justify-center' : ''}`}>
      {show_app_badges ? (
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
      ) : show_newsletter ? (
        <form className="flex w-full max-w-md gap-2" onSubmit={(e) => e.preventDefault()}>
          <input 
            type="email" 
            placeholder={data?.newsletter_placeholder || "Tu correo electrónico"} 
            className="flex-1 px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
          <button className="px-8 py-4 bg-white text-primary font-bold rounded-xl hover:bg-white/90 transition-all">
            <Typography
              variant="span"
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate('newsletter_button_text', text)}
            >
              {data?.newsletter_button_text || 'Suscribirse'}
            </Typography>
          </button>
        </form>
      ) : (
        <>
          {data?.primary_button?.text && (
            <a 
              href={data.primary_button.url || '#'}
              target={data.primary_button.target || '_self'}
              onClick={(e) => {
                if (onUpdate) e.preventDefault();
              }}
              className="px-8 py-4 bg-white text-primary font-bold rounded-xl hover:bg-white/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Typography
                variant="span"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('primary_button.text', text)}
              >
                {data.primary_button.text}
              </Typography>
              <ArrowRight className="w-5 h-5" />
            </a>
          )}
          {show_secondary_button && data?.secondary_button?.text && (
            <a 
              href={data.secondary_button.url || '#'}
              target={data.secondary_button.target || '_self'}
              onClick={(e) => {
                if (onUpdate) e.preventDefault();
              }}
              className="px-8 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm flex items-center justify-center cursor-pointer"
            >
              <Typography
                variant="span"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('secondary_button.text', text)}
              >
                {data.secondary_button.text}
              </Typography>
            </a>
          )}
        </>
      )}
    </div>
  );

  const renderContent = () => (
    <div className={`relative z-10 ${layout_type === 'split' && !is_mobile_simulated ? 'lg:w-1/2' : 'w-full max-w-4xl mx-auto'}`}>
      <Typography
        variant="h2"
        className={`font-black tracking-tight mb-6 ${layout_type === 'minimal' ? 'text-3xl md:text-4xl' : is_mobile_simulated ? 'text-3xl' : 'text-4xl md:text-6xl'}`}
        editable={!!onUpdate}
        onUpdate={(text) => handleTextUpdate('title', text)}
      >
        {data?.title || '¿Listo para dar el siguiente paso?'}
      </Typography>
      
      <Typography
        variant="p"
        className={`${is_mobile_simulated ? 'text-lg' : 'text-xl md:text-2xl'} opacity-90 mb-10 leading-relaxed ${layout_type === 'minimal' ? 'max-w-2xl mx-auto' : ''}`}
        editable={!!onUpdate}
        onUpdate={(text) => handleTextUpdate('subtitle', text)}
      >
        {data?.subtitle || 'Empieza hoy mismo y transforma tu presencia digital.'}
      </Typography>

      {show_checklist && data?.checklist && (
        <div className={`flex flex-wrap gap-4 md:gap-6 mb-10 ${layout_type === 'center' || is_mobile_simulated ? 'justify-center' : ''}`}>
          {data.checklist.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center gap-2 font-medium opacity-90">
              <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-emerald-300" />
              <Typography
                variant="span"
                className="text-sm md:text-base"
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

      {show_micro_copy && data?.micro_copy && (
        <Typography
          variant="p"
          className="text-xs md:text-sm opacity-60 mt-6 font-medium"
          editable={!!onUpdate}
          onUpdate={(text) => handleTextUpdate('micro_copy', text)}
        >
          {data.micro_copy}
        </Typography>
      )}
    </div>
  );

  const render_mockup = () => {
    if (!show_mockup || !data?.mockup_image) return null;
    
    return (
      <div className={`${is_mobile_simulated ? 'w-full' : 'lg:w-1/2'} relative mt-12 lg:mt-0`}>
        <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-8 border-white/10 bg-black">
          <img 
            src={data.mockup_image} 
            alt="App Mockup" 
            className="w-full h-auto"
            referrerPolicy="no-referrer"
          />
        </div>
        {/* Decorative elements behind mockup */}
        <div className="absolute -top-10 -right-10 w-24 h-24 md:w-40 md:h-40 bg-accent/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-24 h-24 md:w-40 md:h-40 bg-primary/30 rounded-full blur-3xl" />
      </div>
    );
  };

  const get_container_classes = () => {
    const base = 'relative overflow-hidden text-white';
    
    if (is_mobile_simulated) {
      switch (layout_type) {
        case 'full':
          return `${base} py-16 px-6 w-full rounded-none`;
        case 'floating':
          return `${base} py-16 px-6 rounded-[2rem] shadow-2xl mx-4 -mb-10 relative z-20`;
        case 'minimal':
          return `${base} py-16 px-6 text-center bg-transparent !text-text`;
        case 'split':
          return `${base} py-16 px-6 rounded-[2rem] flex flex-col items-center gap-12`;
        case 'center':
        default:
          return `${base} py-16 px-6 rounded-[2rem] text-center`;
      }
    }

    switch (layout_type) {
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
    <div className={layout_type === 'minimal' ? '' : is_mobile_simulated ? 'p-2' : 'p-4 md:p-8'}>
      <div 
        className={`${get_container_classes()} ${get_background_class()}`}
        style={background_style === 'image' && data?.background_image ? {
          backgroundImage: `url(${data.background_image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {}}
      >
        {/* Overlay for image background */}
        {background_style === 'image' && (
          <div className="absolute inset-0 bg-black/50 z-0" />
        )}
        
        {/* Mesh Gradient Overlay */}
        {background_style === 'mesh' && (
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] z-0" />
        )}

        {renderContent()}
        {(layout_type === 'split' || is_mobile_simulated) && render_mockup()}
      </div>
    </div>
  );
};
