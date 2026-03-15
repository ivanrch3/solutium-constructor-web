import React, { useState } from 'react';
import { Mail, MapPin, Phone, Send, Linkedin, Twitter, Instagram, Facebook, Youtube, CheckCircle2 } from 'lucide-react';
import { ModuleWrapper } from '../ui/ModuleWrapper';
import { Typography } from '../ui/Typography';

interface ContactModuleProps {
  data: any;
  onUpdate?: (data: any) => void;
}

export const ContactModule = ({ data, onUpdate }: ContactModuleProps) => {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');

  const layoutType = data?.layoutType || 'split';
  const showMap = data?.showMap !== false;
  const mapUrl = data?.mapUrl || '';
  const socialLinks = data?.socialLinks || [];

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
    setFormState('submitting');
    setTimeout(() => {
      setFormState('success');
    }, 1500);
  };

  const renderSocialIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin': return <Linkedin className="w-5 h-5" />;
      case 'twitter': return <Twitter className="w-5 h-5" />;
      case 'instagram': return <Instagram className="w-5 h-5" />;
      case 'facebook': return <Facebook className="w-5 h-5" />;
      case 'youtube': return <Youtube className="w-5 h-5" />;
      default: return null;
    }
  };

  const renderContactInfo = () => (
    <div className="space-y-8">
      {data?.email && (
        <div className="flex items-center gap-6 p-6 bg-surface rounded-2xl border border-text/10 hover:border-primary/30 transition-colors group">
          <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-text/40 uppercase tracking-widest mb-1">Email</p>
            <Typography
              variant="p"
              className="text-lg font-bold text-text"
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate('email', text)}
            >
              {data.email}
            </Typography>
          </div>
        </div>
      )}
      
      {data?.phone && (
        <div className="flex items-center gap-6 p-6 bg-surface rounded-2xl border border-text/10 hover:border-primary/30 transition-colors group">
          <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-text/40 uppercase tracking-widest mb-1">Teléfono</p>
            <Typography
              variant="p"
              className="text-lg font-bold text-text"
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate('phone', text)}
            >
              {data.phone}
            </Typography>
          </div>
        </div>
      )}

      {data?.address && (
        <div className="flex items-center gap-6 p-6 bg-surface rounded-2xl border border-text/10 hover:border-primary/30 transition-colors group">
          <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-text/40 uppercase tracking-widest mb-1">Ubicación</p>
            <Typography
              variant="p"
              className="text-lg font-bold text-text"
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate('address', text)}
            >
              {data.address}
            </Typography>
          </div>
        </div>
      )}

      {socialLinks.length > 0 && (
        <div className="flex gap-4 pt-4">
          {socialLinks.map((link: any, idx: number) => (
            <a 
              key={idx}
              href={link.url}
              className="w-10 h-10 rounded-full bg-surface border border-text/10 flex items-center justify-center text-text/60 hover:text-primary hover:border-primary hover:scale-110 transition-all"
            >
              {renderSocialIcon(link.platform)}
            </a>
          ))}
        </div>
      )}
    </div>
  );

  const renderForm = () => (
    <div className={`bg-surface p-8 md:p-10 rounded-[2rem] border border-text/10 shadow-xl shadow-text/5 ${layoutType === 'map-immersive' ? 'backdrop-blur-md bg-surface/90' : ''}`}>
      <Typography
        variant="h3"
        className="text-2xl font-bold mb-6"
        editable={!!onUpdate}
        onUpdate={(text) => handleTextUpdate('formTitle', text)}
      >
        {data?.formTitle || 'Envíanos un mensaje'}
      </Typography>

      {formState === 'success' ? (
        <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-bold text-emerald-800 mb-2">¡Mensaje Enviado!</h4>
          <p className="text-emerald-600/80">{data?.successMessage || 'Gracias por contactarnos.'}</p>
          <button 
            onClick={() => setFormState('idle')}
            className="mt-6 text-sm font-bold text-emerald-700 hover:underline"
          >
            Enviar otro mensaje
          </button>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          {data?.showNameField !== false && (
            <div>
              <label className="block text-xs font-bold text-text/60 uppercase mb-2">Nombre</label>
              <input required type="text" className="w-full px-4 py-3 bg-background border border-text/10 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Tu nombre" />
            </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-4">
            {data?.showEmailField !== false && (
              <div>
                <label className="block text-xs font-bold text-text/60 uppercase mb-2">Email</label>
                <input required type="email" className="w-full px-4 py-3 bg-background border border-text/10 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="tu@email.com" />
              </div>
            )}
            {data?.showPhoneField && (
              <div>
                <label className="block text-xs font-bold text-text/60 uppercase mb-2">Teléfono</label>
                <input type="tel" className="w-full px-4 py-3 bg-background border border-text/10 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="+1 234..." />
              </div>
            )}
          </div>

          {data?.showSubjectField && (
            <div>
              <label className="block text-xs font-bold text-text/60 uppercase mb-2">Asunto</label>
              <input type="text" className="w-full px-4 py-3 bg-background border border-text/10 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Motivo de contacto" />
            </div>
          )}

          {data?.showMessageField !== false && (
            <div>
              <label className="block text-xs font-bold text-text/60 uppercase mb-2">Mensaje</label>
              <textarea required rows={4} className="w-full px-4 py-3 bg-background border border-text/10 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none" placeholder="¿En qué podemos ayudarte?"></textarea>
            </div>
          )}

          <button 
            disabled={formState === 'submitting'}
            className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {formState === 'submitting' ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {data?.buttonText || 'Enviar Mensaje'} <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );

  const renderMap = () => {
    if (!showMap || !mapUrl) return null;
    return (
      <div className={`w-full h-full min-h-[400px] rounded-[2rem] overflow-hidden shadow-inner border border-text/10 bg-surface relative z-0`}>
        <iframe 
          src={mapUrl} 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          className="grayscale hover:grayscale-0 transition-all duration-700"
        />
      </div>
    );
  };

  const renderContent = () => {
    switch (layoutType) {
      case 'center':
        return (
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-12">
              <Typography
                variant="h2"
                className="text-4xl md:text-5xl font-black mb-4"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('title', text)}
              >
                {data?.title || 'Contáctanos'}
              </Typography>
              <Typography
                variant="p"
                className="text-xl opacity-60 max-w-2xl mx-auto"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('subtitle', text)}
              >
                {data?.subtitle || 'Estamos aquí para ayudarte.'}
              </Typography>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 text-left mb-16">
               <div className="space-y-8">
                  {renderContactInfo()}
               </div>
               <div>
                  {renderForm()}
               </div>
            </div>

            {showMap && (
              <div className="h-[400px] w-full rounded-[2rem] overflow-hidden shadow-xl border border-text/10">
                {renderMap()}
              </div>
            )}
          </div>
        );

      case 'map-immersive':
        return (
          <div className="relative min-h-[700px] rounded-[3rem] overflow-hidden group">
            <div className="absolute inset-0 z-0">
              {showMap && mapUrl ? (
                <iframe 
                  src={mapUrl} 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale group-hover:grayscale-0 transition-all duration-700 w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-surface flex items-center justify-center text-text/20 font-bold text-2xl">
                  Mapa no configurado
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent pointer-events-none" />
            </div>
            
            <div className="relative z-10 grid md:grid-cols-2 lg:grid-cols-12 gap-8 p-8 md:p-16 h-full items-center">
              <div className="lg:col-span-5 space-y-8">
                <div className="bg-surface/80 backdrop-blur-md p-8 rounded-[2rem] border border-text/10 shadow-2xl">
                  <Typography
                    variant="h2"
                    className="text-4xl font-black mb-4"
                    editable={!!onUpdate}
                    onUpdate={(text) => handleTextUpdate('title', text)}
                  >
                    {data?.title || 'Contáctanos'}
                  </Typography>
                  <Typography
                    variant="p"
                    className="text-lg opacity-60 mb-8"
                    editable={!!onUpdate}
                    onUpdate={(text) => handleTextUpdate('subtitle', text)}
                  >
                    {data?.subtitle || 'Envíanos un mensaje y te responderemos pronto.'}
                  </Typography>
                  {renderContactInfo()}
                </div>
              </div>
              <div className="lg:col-span-5 lg:col-start-8">
                 {renderForm()}
              </div>
            </div>
          </div>
        );

      case 'sidebar':
        return (
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 space-y-8 h-full flex flex-col">
              <div>
                <Typography
                  variant="h2"
                  className="text-4xl font-black mb-4"
                  editable={!!onUpdate}
                  onUpdate={(text) => handleTextUpdate('title', text)}
                >
                  {data?.title || 'Información de Contacto'}
                </Typography>
                <Typography
                  variant="p"
                  className="text-lg opacity-60"
                  editable={!!onUpdate}
                  onUpdate={(text) => handleTextUpdate('subtitle', text)}
                >
                  {data?.subtitle || 'Estamos disponibles para atenderte.'}
                </Typography>
              </div>
              <div className="flex-grow">
                {renderContactInfo()}
              </div>
              {showMap && (
                <div className="h-64 w-full rounded-2xl overflow-hidden border border-text/10 shadow-lg">
                  {renderMap()}
                </div>
              )}
            </div>
            <div className="lg:col-span-8">
              {renderForm()}
            </div>
          </div>
        );

      case 'split':
      default:
        return (
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <Typography
                variant="h2"
                className="text-4xl md:text-5xl font-black mb-6 tracking-tight"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('title', text)}
              >
                {data?.title || '¿Tienes alguna duda?'}
              </Typography>
              <Typography
                variant="p"
                className="text-xl opacity-60 mb-12 leading-relaxed"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('subtitle', text)}
              >
                {data?.subtitle || 'Estamos aquí para ayudarte.'}
              </Typography>
              {renderContactInfo()}
            </div>
            <div className="space-y-8">
              {renderForm()}
              {showMap && (
                <div className="h-[400px] w-full rounded-[2rem] overflow-hidden shadow-xl border border-text/10">
                  {renderMap()}
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <ModuleWrapper 
      theme={data?.theme}
      background={data?.background}
    >
      {renderContent()}
    </ModuleWrapper>
  );
};
