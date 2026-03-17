import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, X } from 'lucide-react';
import { ModuleWrapper } from '../ui/ModuleWrapper';
import { Typography } from '../ui/Typography';
import { usePageLayout } from '../../context/PageLayoutContext';

interface NewsletterModuleProps {
  data: any;
  onUpdate?: (data: any) => void;
}

export const NewsletterModule = ({ data, onUpdate }: NewsletterModuleProps) => {
  const { previewDevice } = usePageLayout();
  const is_mobile_simulated = previewDevice === 'mobile';
  const [form_state, set_form_state] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [is_popup_open, set_is_popup_open] = useState(true);

  const layout_type = data?.layout_type || 'center';
  const show_name_field = data?.show_name_field || false;
  const show_disclaimer = data?.show_disclaimer !== false;
  const background_image = data?.background_image;

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    set_form_state('submitting');
    setTimeout(() => {
      set_form_state('success');
    }, 1500);
  };

  const renderForm = (is_slim = false) => {
    if (form_state === 'success') {
      return (
        <div className="flex flex-col items-center justify-center py-4 animate-in fade-in zoom-in duration-300">
          <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-2">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="font-bold text-lg">{data?.success_message || '¡Suscrito con éxito!'}</p>
        </div>
      );
    }

    return (
      <form 
        className={`flex ${is_slim && !is_mobile_simulated ? 'flex-row items-center' : is_mobile_simulated ? 'flex-col' : 'flex-col sm:flex-row'} gap-3 w-full`} 
        onSubmit={handleSubmit}
      >
        {show_name_field && (
          <input 
            type="text" 
            placeholder={data?.name_placeholder || 'Tu nombre'} 
            className={`flex-1 px-6 py-4 bg-background/10 border border-current/10 rounded-xl outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium placeholder:text-current/40 ${is_slim && !is_mobile_simulated ? 'py-3' : ''} text-sm`}
            required
          />
        )}
        <input 
          type="email" 
          placeholder={data?.email_placeholder || 'tu@email.com'} 
          className={`flex-1 px-6 py-4 bg-background/10 border border-current/10 rounded-xl outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium placeholder:text-current/40 ${is_slim && !is_mobile_simulated ? 'py-3' : ''} text-sm`}
          required
        />
        <button 
          disabled={form_state === 'submitting'}
          className={`px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap ${is_slim && !is_mobile_simulated ? 'py-3' : ''} text-sm`}
        >
          {form_state === 'submitting' ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Typography
                variant="span"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('button_text', text)}
              >
                {data?.button_text || 'Suscribirme'}
              </Typography>
              {(!is_slim || is_mobile_simulated) && <Send className="w-4 h-4" />}
            </>
          )}
        </button>
      </form>
    );
  };

  const renderContent = () => {
    if (layout_type === 'slim') {
      return (
        <div className={`flex flex-col ${is_mobile_simulated ? '' : 'lg:flex-row'} items-center justify-between gap-8 max-w-7xl mx-auto`}>
          <div className={`flex items-center gap-4 ${is_mobile_simulated ? 'text-center flex-col' : 'text-left'} flex-1`}>
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <Typography
                variant="h3"
                className="text-xl font-bold mb-1"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('title', text)}
              >
                {data?.title || 'Únete a nuestra Newsletter'}
              </Typography>
              <Typography
                variant="p"
                className="text-sm opacity-70 line-clamp-1"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('subtitle', text)}
              >
                {data?.subtitle || 'Recibe consejos semanales.'}
              </Typography>
            </div>
          </div>
          <div className={`w-full ${is_mobile_simulated ? '' : 'lg:w-auto min-w-[400px]'}`}>
            {renderForm(true)}
          </div>
        </div>
      );
    }

    if (layout_type === 'split') {
      return (
        <div className={`grid ${is_mobile_simulated ? 'grid-cols-1' : 'lg:grid-cols-2'} gap-12 items-center max-w-7xl mx-auto`}>
          <div className={`${is_mobile_simulated ? 'text-center' : 'text-left'} space-y-6`}>
            <div className={`w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary border border-primary/30 ${is_mobile_simulated ? 'mx-auto' : ''}`}>
              <Mail className="w-8 h-8" />
            </div>
            <div>
              <Typography
                variant="h2"
                className={`${is_mobile_simulated ? 'text-3xl' : 'text-4xl md:text-5xl'} font-black mb-4 tracking-tight`}
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('title', text)}
              >
                {data?.title || 'Únete a nuestra Newsletter'}
              </Typography>
              <Typography
                variant="p"
                className={`${is_mobile_simulated ? 'text-base' : 'text-lg'} opacity-70 leading-relaxed`}
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('subtitle', text)}
              >
                {data?.subtitle || 'Recibe consejos semanales sobre crecimiento digital y ofertas exclusivas.'}
              </Typography>
            </div>
            <div className={`${is_mobile_simulated ? 'w-full' : 'max-w-md'}`}>
              {renderForm()}
              {show_disclaimer && (
                <Typography
                  variant="p"
                  className="mt-4 text-[10px] md:text-xs opacity-50"
                  editable={!!onUpdate}
                  onUpdate={(text) => handleTextUpdate('disclaimer', text)}
                >
                  {data?.disclaimer || 'Prometemos no enviar spam.'}
                </Typography>
              )}
            </div>
          </div>
          <div className={`relative aspect-square ${is_mobile_simulated ? 'h-[300px]' : 'lg:aspect-auto lg:h-[500px]'} rounded-[2.5rem] overflow-hidden shadow-2xl`}>
             <img 
              src={background_image || "https://picsum.photos/seed/newsletter/800/800"} 
              alt="Newsletter" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        </div>
      );
    }

    // Default Center Layout
    return (
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className={`w-16 h-16 md:w-20 md:h-20 bg-primary/20 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center text-primary mb-8 mx-auto border border-primary/30 shadow-lg shadow-primary/10`}>
          <Mail className="w-8 h-8 md:w-10 md:h-10" />
        </div>
        <Typography
          variant="h2"
          className={`${is_mobile_simulated ? 'text-3xl' : 'text-4xl md:text-6xl'} font-black mb-6 tracking-tight`}
          editable={!!onUpdate}
          onUpdate={(text) => handleTextUpdate('title', text)}
        >
          {data?.title || 'Únete a nuestra Newsletter'}
        </Typography>
        <Typography
          variant="p"
          className={`${is_mobile_simulated ? 'text-base' : 'text-xl'} opacity-70 mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed`}
          editable={!!onUpdate}
          onUpdate={(text) => handleTextUpdate('subtitle', text)}
        >
          {data?.subtitle || 'Recibe consejos semanales sobre crecimiento digital y ofertas exclusivas directamente en tu bandeja de entrada.'}
        </Typography>
        
        <div className={`${is_mobile_simulated ? 'w-full' : 'max-w-xl'} mx-auto`}>
          {renderForm()}
          {show_disclaimer && (
            <Typography
              variant="p"
              className="mt-6 text-xs md:text-sm opacity-50 italic"
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate('disclaimer', text)}
            >
              {data?.disclaimer || 'Prometemos no enviar spam. Puedes darte de baja en cualquier momento.'}
            </Typography>
          )}
        </div>
      </div>
    );
  };

  const wrapperStyle = background_image && layout_type !== 'split' ? {
    backgroundImage: `url(${background_image})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  } : {};

  if (layout_type === 'popup') {
    if (!is_popup_open) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div className={`relative w-full max-w-4xl bg-surface rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col ${is_mobile_simulated ? '' : 'md:flex-row'}`}>
          <button 
            onClick={() => set_is_popup_open(false)}
            className="absolute top-4 right-4 z-20 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className={`${is_mobile_simulated ? 'h-[200px]' : 'md:w-1/2'} relative min-h-[200px] md:min-h-[300px]`}>
            <img 
              src={background_image || "https://picsum.photos/seed/newsletter-popup/600/800"} 
              alt="Newsletter" 
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-primary/20 mix-blend-overlay" />
          </div>
          <div className={`${is_mobile_simulated ? 'w-full' : 'md:w-1/2'} p-6 md:p-12 flex flex-col justify-center text-left`}>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
              <Mail className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <Typography
              variant="h3"
              className={`${is_mobile_simulated ? 'text-2xl' : 'text-3xl'} font-black mb-4`}
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate('title', text)}
            >
              {data?.title || 'No te pierdas nada'}
            </Typography>
            <Typography
              variant="p"
              className="text-sm md:text-base text-text/60 mb-8"
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate('subtitle', text)}
            >
              {data?.subtitle || 'Suscríbete para recibir las últimas novedades.'}
            </Typography>
            {renderForm()}
            {show_disclaimer && (
              <Typography
                variant="p"
                className="mt-4 text-[10px] md:text-xs opacity-50"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('disclaimer', text)}
              >
                {data?.disclaimer || 'Prometemos no enviar spam.'}
              </Typography>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <ModuleWrapper 
      theme={data?.theme}
      background={data?.background}
      className="relative overflow-hidden"
      style={wrapperStyle}
    >
      {background_image && layout_type !== 'split' && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-0" />
      )}
      
      {/* Decorative Elements for Center Layout */}
      {layout_type === 'center' && !background_image && (
        <>
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      <div className="relative z-10">
        {renderContent()}
      </div>
    </ModuleWrapper>
  );
};
