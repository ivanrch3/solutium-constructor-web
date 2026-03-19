import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, X, Sparkles, Users, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ModuleWrapper } from '../ui/ModuleWrapper';
import { Typography } from '../ui/Typography';
import { usePageLayout } from '../../context/PageLayoutContext';

interface NewsletterModuleProps {
  data: any;
  onUpdate?: (data: any) => void;
}

export const NewsletterModule = ({ data, onUpdate }: NewsletterModuleProps) => {
  const { previewDevice } = usePageLayout();
  const isMobileSimulated = previewDevice === 'mobile';
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [isPopupOpen, setIsPopupOpen] = useState(true);

  const layoutType = data?.layoutType || 'center'; // center, split, slim, popup
  const showNameField = data?.showNameField || false;
  const showSocialProof = data?.showSocialProof !== false;
  const backgroundImage = data?.backgroundImage;

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

  const renderForm = (isSlim = false) => {
    return (
      <AnimatePresence mode="wait">
        {formState === 'success' ? (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center justify-center py-4 text-center"
          >
            <div className="w-16 h-16 bg-emerald-500 text-white rounded-[1.5rem] flex items-center justify-center mb-4 shadow-xl shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <Typography variant="h4" className="text-xl font-black tracking-tight mb-2">¡Bienvenido a bordo!</Typography>
            <Typography variant="p" className="text-sm opacity-60 font-medium">{data?.successMessage || 'Ya eres parte de nuestra comunidad exclusiva.'}</Typography>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFormState('idle')}
              className="mt-6 text-xs font-black text-primary uppercase tracking-widest hover:underline"
            >
              Suscribir otro correo
            </motion.button>
          </motion.div>
        ) : (
          <motion.form 
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`flex ${isSlim && !isMobileSimulated ? 'flex-row items-center' : isMobileSimulated ? 'flex-col' : 'flex-col sm:flex-row'} gap-4 w-full`} 
            onSubmit={handleSubmit}
          >
            {showNameField && (
              <div className="flex-1 group">
                <input 
                  type="text" 
                  placeholder={data?.namePlaceholder || 'Tu nombre'} 
                  className="w-full px-6 py-4 bg-current/[0.03] border border-current/10 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium placeholder:text-current/30 text-sm group-hover:bg-current/[0.05]"
                  required
                />
              </div>
            )}
            <div className="flex-1 group">
              <input 
                type="email" 
                placeholder={data?.emailPlaceholder || 'tu@email.com'} 
                className="w-full px-6 py-4 bg-current/[0.03] border border-current/10 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium placeholder:text-current/30 text-sm group-hover:bg-current/[0.05]"
                required
              />
            </div>
            <motion.button 
              disabled={formState === 'submitting'}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="px-10 py-4 bg-primary text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl hover:bg-primary/90 transition-all shadow-2xl shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 whitespace-nowrap"
            >
              {formState === 'submitting' ? (
                <span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Typography
                    variant="span"
                    editable={!!onUpdate}
                    onUpdate={(text) => handleTextUpdate('buttonText', text)}
                  >
                    {data?.buttonText || 'Suscribirme'}
                  </Typography>
                  <Send className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    );
  };

  const renderSocialProof = () => {
    if (!showSocialProof) return null;
    return (
      <motion.div variants={itemVariants} className="flex items-center justify-center gap-4 mt-10">
        <div className="flex -space-x-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-10 h-10 rounded-full border-4 border-background overflow-hidden bg-current/10">
              <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          ))}
          <div className="w-10 h-10 rounded-full border-4 border-background bg-primary text-white flex items-center justify-center text-[10px] font-black">
            +10k
          </div>
        </div>
        <div className="text-left">
          <div className="text-xs font-black tracking-tight">Únete a +10,000 suscriptores</div>
          <div className="text-[10px] opacity-40 font-black uppercase tracking-widest">Consejos semanales y ofertas</div>
        </div>
      </motion.div>
    );
  };

  const renderContent = () => {
    if (layoutType === 'slim') {
      return (
        <div className={`flex flex-col ${isMobileSimulated ? '' : 'lg:flex-row'} items-center justify-between gap-12 max-w-7xl mx-auto`}>
          <div className={`flex items-center gap-6 ${isMobileSimulated ? 'text-center flex-col' : 'text-left'} flex-1`}>
            <div className="w-16 h-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center text-primary flex-shrink-0 shadow-xl shadow-primary/5">
              <Bell className="w-8 h-8 animate-bounce" />
            </div>
            <div>
              <Typography
                variant="h3"
                className="text-2xl font-black tracking-tighter mb-2"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('title', text)}
              >
                {data?.title || 'No te pierdas nada'}
              </Typography>
              <Typography
                variant="p"
                className="text-base opacity-60 font-medium tracking-tight"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('subtitle', text)}
              >
                {data?.subtitle || 'Recibe las últimas novedades directamente en tu correo.'}
              </Typography>
            </div>
          </div>
          <div className={`w-full ${isMobileSimulated ? '' : 'lg:w-auto min-w-[500px]'}`}>
            {renderForm(true)}
          </div>
        </div>
      );
    }

    if (layoutType === 'split') {
      return (
        <div className={`grid ${isMobileSimulated ? 'grid-cols-1' : 'lg:grid-cols-2'} gap-24 items-center max-w-7xl mx-auto`}>
          <div className={`${isMobileSimulated ? 'text-center' : 'text-left'} space-y-10`}>
            <div className={`w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary border border-primary/20 shadow-2xl shadow-primary/10 ${isMobileSimulated ? 'mx-auto' : ''}`}>
              <Mail className="w-10 h-10" />
            </div>
            <div>
              <Typography
                variant="h2"
                className={`${isMobileSimulated ? 'text-4xl' : 'text-5xl md:text-7xl'} font-black mb-6 tracking-tighter leading-none`}
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('title', text)}
              >
                {data?.title || 'Nuestra Newsletter'}
              </Typography>
              <Typography
                variant="p"
                className={`${isMobileSimulated ? 'text-lg' : 'text-xl md:text-2xl'} opacity-60 leading-relaxed font-medium tracking-tight`}
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('subtitle', text)}
              >
                {data?.subtitle || 'Recibe consejos semanales sobre crecimiento digital y ofertas exclusivas directamente en tu bandeja de entrada.'}
              </Typography>
            </div>
            <div className={`${isMobileSimulated ? 'w-full' : 'max-w-xl'}`}>
              {renderForm()}
              {renderSocialProof()}
            </div>
          </div>
          <div className={`relative aspect-square ${isMobileSimulated ? 'h-[400px]' : 'lg:aspect-auto lg:h-[700px]'} rounded-[4rem] overflow-hidden shadow-2xl group`}>
             <motion.img 
              whileHover={{ scale: 1.05 }}
              src={backgroundImage || "https://picsum.photos/seed/newsletter/1000/1200"} 
              alt="Newsletter" 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-12">
              <div className="text-white">
                <Typography variant="h3" className="text-3xl font-black tracking-tighter mb-2">Comunidad VIP</Typography>
                <Typography variant="p" className="text-lg opacity-80 font-medium">Contenido exclusivo cada semana.</Typography>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Default Center Layout
    return (
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 mb-8">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <span className="text-primary font-black tracking-[0.3em] uppercase text-[10px]">Newsletter Semanal</span>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Typography
            variant="h2"
            className={`${isMobileSimulated ? 'text-4xl' : 'text-5xl md:text-8xl'} font-black mb-8 tracking-tighter leading-none`}
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate('title', text)}
          >
            {data?.title || 'Únete al Futuro'}
          </Typography>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Typography
            variant="p"
            className={`${isMobileSimulated ? 'text-lg' : 'text-xl md:text-3xl'} opacity-60 mb-16 max-w-3xl mx-auto leading-relaxed font-medium tracking-tight`}
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate('subtitle', text)}
          >
            {data?.subtitle || 'Recibe consejos semanales sobre crecimiento digital y ofertas exclusivas directamente en tu bandeja de entrada.'}
          </Typography>
        </motion.div>
        
        <motion.div variants={itemVariants} className={`${isMobileSimulated ? 'w-full' : 'max-w-2xl'} mx-auto`}>
          {renderForm()}
          {renderSocialProof()}
        </motion.div>
      </div>
    );
  };

  if (layoutType === 'popup') {
    if (!isPopupOpen) return null;
    return (
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`relative w-full max-w-5xl bg-background rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] flex flex-col ${isMobileSimulated ? '' : 'md:flex-row'} border border-current/10`}
          >
            <button 
              onClick={() => setIsPopupOpen(false)}
              className="absolute top-6 right-6 z-20 p-3 bg-black/10 hover:bg-black/20 rounded-2xl transition-all hover:rotate-90"
            >
              <X className="w-6 h-6" />
            </button>
            <div className={`${isMobileSimulated ? 'h-[250px]' : 'md:w-1/2'} relative min-h-[250px] group`}>
              <img 
                src={backgroundImage || "https://picsum.photos/seed/newsletter-popup/800/1000"} 
                alt="Newsletter" 
                className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent mix-blend-overlay" />
            </div>
            <div className={`${isMobileSimulated ? 'w-full' : 'md:w-1/2'} p-8 md:p-16 flex flex-col justify-center text-left`}>
              <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-primary/5">
                <Mail className="w-7 h-7" />
              </div>
              <Typography
                variant="h3"
                className={`${isMobileSimulated ? 'text-3xl' : 'text-4xl md:text-5xl'} font-black tracking-tighter mb-6 leading-none`}
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('title', text)}
              >
                {data?.title || 'No te pierdas nada'}
              </Typography>
              <Typography
                variant="p"
                className="text-lg text-text/60 mb-10 font-medium tracking-tight leading-relaxed"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('subtitle', text)}
              >
                {data?.subtitle || 'Suscríbete para recibir las últimas novedades y contenido exclusivo.'}
              </Typography>
              {renderForm()}
              {renderSocialProof()}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <ModuleWrapper 
      theme={data?.theme}
      background={data?.background}
      className="relative overflow-hidden"
    >
      {backgroundImage && layoutType !== 'split' && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-0" />
      )}
      
      {/* Decorative Elements for Center Layout */}
      {layoutType === 'center' && !backgroundImage && (
        <>
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
        </>
      )}

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative z-10"
      >
        {renderContent()}
      </motion.div>
    </ModuleWrapper>
  );
};
