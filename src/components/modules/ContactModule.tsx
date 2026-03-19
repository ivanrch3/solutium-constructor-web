import React, { useState } from 'react';
import { Mail, MapPin, Phone, Send, Linkedin, Twitter, Instagram, Facebook, Youtube, CheckCircle2, Sparkles, MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ModuleWrapper } from '../ui/ModuleWrapper';
import { Typography } from '../ui/Typography';
import { usePageLayout } from '../../context/PageLayoutContext';

interface ContactModuleProps {
  data: any;
  onUpdate?: (data: any) => void;
}

export const ContactModule = ({ data, onUpdate }: ContactModuleProps) => {
  const { previewDevice } = usePageLayout();
  const isMobileSimulated = previewDevice === 'mobile';
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');

  const layoutType = data?.layoutType || 'split'; // split, center, map-immersive, sidebar
  const showMap = data?.showMap !== false;
  const mapUrl = data?.mapUrl || '';
  const socialLinks = data?.socialLinks || [
    { platform: 'linkedin', url: '#' },
    { platform: 'twitter', url: '#' },
    { platform: 'instagram', url: '#' }
  ];
  const businessHours = data?.businessHours || [
    { days: 'Lunes - Viernes', hours: '9:00 AM - 6:00 PM' },
    { days: 'Sábado', hours: '10:00 AM - 2:00 PM' },
    { days: 'Domingo', hours: 'Cerrado' }
  ];

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const renderSocialIcon = (platform: string) => {
    const icons: any = {
      linkedin: <Linkedin className="w-5 h-5" />,
      twitter: <Twitter className="w-5 h-5" />,
      instagram: <Instagram className="w-5 h-5" />,
      facebook: <Facebook className="w-5 h-5" />,
      youtube: <Youtube className="w-5 h-5" />
    };
    return icons[platform] || null;
  };

  const renderContactCard = (icon: any, label: string, value: string, path: string, delay: number = 0) => (
    <motion.div 
      variants={itemVariants}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`flex items-center gap-6 p-6 bg-current/[0.03] rounded-[2rem] border border-current/5 hover:border-primary/30 hover:bg-current/[0.05] transition-all duration-300 group`}
    >
      <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-lg group-hover:shadow-primary/30">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">{label}</p>
        <Typography
          variant="p"
          className="text-lg font-black tracking-tight text-current"
          editable={!!onUpdate}
          onUpdate={(text) => handleTextUpdate(path, text)}
        >
          {value}
        </Typography>
      </div>
    </motion.div>
  );

  const renderForm = () => (
    <motion.div 
      variants={itemVariants}
      className={`bg-current/[0.02] p-8 md:p-12 rounded-[3rem] border border-current/5 shadow-2xl backdrop-blur-md relative overflow-hidden`}
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
      
      <Typography
        variant="h3"
        className="text-2xl md:text-3xl font-black tracking-tighter mb-8 relative z-10"
        editable={!!onUpdate}
        onUpdate={(text) => handleTextUpdate('formTitle', text)}
      >
        {data?.formTitle || 'Envíanos un mensaje'}
      </Typography>

      <AnimatePresence mode="wait">
        {formState === 'success' ? (
          <motion.div 
            key="success"
            className="flex flex-col items-center justify-center py-12 text-center relative z-10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="w-20 h-20 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <Typography variant="h4" className="text-2xl font-black tracking-tight mb-3">¡Mensaje Enviado!</Typography>
            <Typography variant="p" className="text-lg opacity-60 font-medium max-w-xs mx-auto">
              {data?.successMessage || 'Gracias por contactarnos. Te responderemos en menos de 24 horas.'}
            </Typography>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFormState('idle')}
              className="mt-10 px-8 py-4 bg-primary/10 text-primary font-black text-xs uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all"
            >
              Enviar otro mensaje
            </motion.button>
          </motion.div>
        ) : (
          <motion.form 
            key="form"
            className="space-y-6 relative z-10" 
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3 ml-1">Nombre Completo</label>
                <input required type="text" className="w-full px-6 py-4 bg-current/[0.03] border border-current/10 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-medium group-hover:bg-current/[0.05]" placeholder="Tu nombre" />
              </div>
              <div className="group">
                <label className="block text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3 ml-1">Correo Electrónico</label>
                <input required type="email" className="w-full px-6 py-4 bg-current/[0.03] border border-current/10 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-medium group-hover:bg-current/[0.05]" placeholder="tu@email.com" />
              </div>
            </div>

            <div className="group">
              <label className="block text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3 ml-1">Asunto</label>
              <input type="text" className="w-full px-6 py-4 bg-current/[0.03] border border-current/10 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-medium group-hover:bg-current/[0.05]" placeholder="¿En qué podemos ayudarte?" />
            </div>

            <div className="group">
              <label className="block text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3 ml-1">Mensaje</label>
              <textarea required rows={5} className="w-full px-6 py-4 bg-current/[0.03] border border-current/10 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all resize-none text-sm font-medium group-hover:bg-current/[0.05]" placeholder="Escribe tu mensaje aquí..."></textarea>
            </div>

            <motion.button 
              disabled={formState === 'submitting'}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-5 bg-primary text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl hover:bg-primary/90 transition-all shadow-2xl shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {formState === 'submitting' ? (
                <span className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{data?.buttonText || 'Enviar Mensaje'}</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <ModuleWrapper 
      theme={data?.theme}
      background={data?.background}
    >
      <div className={`${isMobileSimulated ? 'max-w-full' : 'max-w-7xl'} mx-auto px-6`}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`text-center ${isMobileSimulated ? 'mb-16' : 'mb-24'}`}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            </div>
            <span className="text-primary font-black tracking-[0.3em] uppercase text-[10px]">Contacto</span>
          </div>
          <Typography
            variant="h2"
            className={`${isMobileSimulated ? 'text-4xl' : 'text-5xl md:text-7xl'} font-black tracking-tighter mb-6 leading-none`}
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate('title', text)}
          >
            {data?.title || 'Hablemos de tu Proyecto'}
          </Typography>
          <Typography
            variant="p"
            className={`${isMobileSimulated ? 'text-lg' : 'text-xl md:text-2xl'} opacity-60 max-w-3xl mx-auto font-medium tracking-tight`}
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate('subtitle', text)}
          >
            {data?.subtitle || 'Estamos listos para convertir tus ideas en realidades digitales impactantes.'}
          </Typography>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className={`grid ${isMobileSimulated ? 'grid-cols-1 gap-16' : 'lg:grid-cols-2 gap-24'} items-start`}
        >
          <div className="space-y-12">
            <div className="grid grid-cols-1 gap-6">
              {renderContactCard(<Mail className="w-6 h-6" />, 'Email', data?.email || 'hola@solutium.com', 'email')}
              {renderContactCard(<Phone className="w-6 h-6" />, 'Teléfono', data?.phone || '+34 900 000 000', 'phone')}
              {renderContactCard(<MapPin className="w-6 h-6" />, 'Ubicación', data?.address || 'Madrid, España', 'address')}
            </div>

            <motion.div variants={itemVariants} className="p-8 bg-current/[0.02] rounded-[2.5rem] border border-current/5">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                  <Clock className="w-6 h-6" />
                </div>
                <Typography variant="h4" className="text-xl font-black tracking-tight">Horario de Atención</Typography>
              </div>
              <div className="space-y-4">
                {businessHours.map((h: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center border-b border-current/5 pb-4 last:border-0 last:pb-0">
                    <span className="text-sm font-bold uppercase tracking-widest opacity-40">{h.days}</span>
                    <span className="text-sm font-black text-current">{h.hours}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-4">
              <Typography variant="span" className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mr-4">Síguenos</Typography>
              <div className="flex gap-3">
                {socialLinks.map((link: any, idx: number) => (
                  <motion.a 
                    key={idx}
                    href={link.url}
                    whileHover={{ y: -3, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-12 h-12 rounded-2xl bg-current/[0.03] border border-current/10 flex items-center justify-center text-current/60 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all"
                  >
                    {renderSocialIcon(link.platform)}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="space-y-12">
            {renderForm()}
            
            {showMap && mapUrl && (
              <motion.div 
                variants={itemVariants}
                className={`h-[400px] w-full rounded-[3rem] overflow-hidden shadow-2xl border border-current/10 relative group`}
              >
                <iframe 
                  src={mapUrl} 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale group-hover:grayscale-0 transition-all duration-1000"
                />
                <div className="absolute inset-0 pointer-events-none border-[12px] border-white/10 rounded-[3rem]" />
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </ModuleWrapper>
  );
};
