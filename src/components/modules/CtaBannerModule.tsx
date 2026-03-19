import React from 'react';
import { ArrowRight, CheckCircle2, Apple, Play, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { ModuleWrapper } from '../ui/ModuleWrapper';
import { Typography } from '../ui/Typography';
import { usePageLayout } from '../../context/PageLayoutContext';

interface CtaBannerModuleProps {
  data: any;
  onUpdate?: (data: any) => void;
}

export const CtaBannerModule = ({ data, onUpdate }: CtaBannerModuleProps) => {
  const { previewDevice } = usePageLayout();
  const isMobileSimulated = previewDevice === 'mobile';
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
        return 'bg-gradient-to-br from-primary via-primary to-accent';
      case 'mesh':
        return 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary via-accent to-primary';
      case 'solid':
      default:
        return 'bg-primary';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
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

  const renderButtons = () => (
    <motion.div 
      variants={itemVariants}
      className={`flex ${isMobileSimulated ? 'flex-col' : 'flex-col sm:flex-row'} gap-4 ${layoutType === 'center' || layoutType === 'minimal' ? 'justify-center' : ''}`}
    >
      {showAppBadges ? (
        <>
          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 px-8 py-4 bg-black text-white rounded-2xl hover:bg-black/90 transition-all shadow-xl border border-white/10"
          >
            <Apple className="w-8 h-8" />
            <div className="text-left">
              <div className="text-[10px] uppercase font-black tracking-widest opacity-60">Download on the</div>
              <div className="text-xl font-black leading-none">App Store</div>
            </div>
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 px-8 py-4 bg-black text-white rounded-2xl hover:bg-black/90 transition-all shadow-xl border border-white/10"
          >
            <Play className="w-7 h-7 fill-current" />
            <div className="text-left">
              <div className="text-[10px] uppercase font-black tracking-widest opacity-60">Get it on</div>
              <div className="text-xl font-black leading-none">Google Play</div>
            </div>
          </motion.button>
        </>
      ) : showNewsletter ? (
        <form className="flex w-full max-w-lg gap-3" onSubmit={(e) => e.preventDefault()}>
          <div className="relative flex-1 group">
            <input 
              type="email" 
              placeholder={data?.newsletterPlaceholder || "Tu correo electrónico"} 
              className="w-full px-6 py-5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all backdrop-blur-md"
            />
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-10 py-5 bg-white text-primary font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-white/95 transition-all shadow-2xl shadow-white/10"
          >
            <Typography
              variant="span"
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate('newsletterButtonText', text)}
            >
              {data?.newsletterButtonText || 'Suscribirse'}
            </Typography>
          </motion.button>
        </form>
      ) : (
        <>
          {data?.primaryButton?.text && (
            <motion.a 
              href={data.primaryButton.url || '#'}
              target={data.primaryButton.target || '_self'}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                if (onUpdate) e.preventDefault();
              }}
              className="px-10 py-5 bg-white text-primary font-black text-sm uppercase tracking-[0.2em] rounded-2xl hover:bg-white/95 transition-all shadow-2xl shadow-white/10 flex items-center justify-center gap-3 cursor-pointer group"
            >
              <Typography
                variant="span"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('primaryButton.text', text)}
              >
                {data.primaryButton.text}
              </Typography>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.a>
          )}
          {showSecondaryButton && data?.secondaryButton?.text && (
            <motion.a 
              href={data.secondaryButton.url || '#'}
              target={data.secondaryButton.target || '_self'}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                if (onUpdate) e.preventDefault();
              }}
              className="px-10 py-5 bg-white/10 text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl hover:bg-white/20 transition-all backdrop-blur-md border border-white/20 flex items-center justify-center cursor-pointer"
            >
              <Typography
                variant="span"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('secondaryButton.text', text)}
              >
                {data.secondaryButton.text}
              </Typography>
            </motion.a>
          )}
        </>
      )}
    </motion.div>
  );

  const renderContent = () => (
    <div className={`relative z-10 ${layoutType === 'split' && !isMobileSimulated ? 'lg:w-1/2' : 'w-full max-w-4xl mx-auto'}`}>
      <motion.div variants={itemVariants} className={`flex items-center gap-3 mb-8 ${layoutType === 'center' || layoutType === 'minimal' ? 'justify-center' : 'justify-start'}`}>
        <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
          <Sparkles className="w-5 h-5 text-white animate-pulse" />
        </div>
        <span className="text-white font-black tracking-[0.3em] uppercase text-[10px] opacity-80">Acción Inmediata</span>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Typography
          variant="h2"
          className={`font-black tracking-tighter mb-8 leading-[1.1] ${layoutType === 'minimal' ? 'text-4xl md:text-5xl' : isMobileSimulated ? 'text-4xl' : 'text-5xl md:text-7xl'}`}
          editable={!!onUpdate}
          onUpdate={(text) => handleTextUpdate('title', text)}
        >
          {data?.title || '¿Listo para dar el siguiente paso?'}
        </Typography>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <Typography
          variant="p"
          className={`${isMobileSimulated ? 'text-xl' : 'text-2xl md:text-3xl'} opacity-80 mb-12 leading-relaxed font-medium tracking-tight ${layoutType === 'minimal' ? 'max-w-2xl mx-auto' : ''}`}
          editable={!!onUpdate}
          onUpdate={(text) => handleTextUpdate('subtitle', text)}
        >
          {data?.subtitle || 'Empieza hoy mismo y transforma tu presencia digital.'}
        </Typography>
      </motion.div>

      {showChecklist && data?.checklist && (
        <motion.div 
          variants={itemVariants}
          className={`flex flex-wrap gap-6 md:gap-10 mb-12 ${layoutType === 'center' || isMobileSimulated ? 'justify-center' : ''}`}
        >
          {data.checklist.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center gap-3 font-bold uppercase tracking-widest text-[11px] opacity-70 group">
              <div className="p-1 bg-emerald-500/20 rounded-full group-hover:bg-emerald-500/40 transition-colors">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <Typography
                variant="span"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate(`checklist.${idx}.text`, text)}
              >
                {item.text}
              </Typography>
            </div>
          ))}
        </motion.div>
      )}

      {renderButtons()}

      {showMicroCopy && data?.microCopy && (
        <motion.div variants={itemVariants}>
          <Typography
            variant="p"
            className="text-[10px] md:text-xs uppercase tracking-[0.2em] opacity-40 mt-10 font-black"
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate('microCopy', text)}
          >
            {data.microCopy}
          </Typography>
        </motion.div>
      )}
    </div>
  );

  const renderMockup = () => {
    if (!showMockup || !data?.mockupImage) return null;
    
    return (
      <motion.div 
        variants={itemVariants}
        className={`${isMobileSimulated ? 'w-full' : 'lg:w-1/2'} relative mt-16 lg:mt-0`}
      >
        <motion.div 
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-[12px] border-white/10 bg-black"
        >
          <img 
            src={data.mockupImage} 
            alt="App Mockup" 
            className="w-full h-auto"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        {/* Decorative elements behind mockup */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
      </motion.div>
    );
  };

  const getContainerClasses = () => {
    const base = 'relative overflow-hidden text-white';
    
    if (isMobileSimulated) {
      switch (layoutType) {
        case 'full':
          return `${base} py-20 px-6 w-full rounded-none`;
        case 'floating':
          return `${base} py-20 px-6 rounded-[2.5rem] shadow-2xl mx-4 -mb-10 relative z-20`;
        case 'minimal':
          return `${base} py-20 px-6 text-center bg-transparent !text-text`;
        case 'split':
          return `${base} py-20 px-6 rounded-[2.5rem] flex flex-col items-center gap-16`;
        case 'center':
        default:
          return `${base} py-20 px-6 rounded-[2.5rem] text-center`;
      }
    }

    switch (layoutType) {
      case 'full':
        return `${base} py-40 px-6 md:px-12 w-full rounded-none`;
      case 'floating':
        return `${base} py-28 px-8 md:px-20 rounded-[4rem] shadow-2xl mx-4 md:mx-12 -mb-24 relative z-20`;
      case 'minimal':
        return `${base} py-32 px-6 text-center bg-transparent !text-text`;
      case 'split':
        return `${base} py-32 px-8 md:px-20 rounded-[4rem] flex flex-col lg:flex-row items-center gap-24`;
      case 'center':
      default:
        return `${base} py-32 px-8 md:px-20 rounded-[4rem] text-center`;
    }
  };

  return (
    <div className={layoutType === 'minimal' ? '' : isMobileSimulated ? 'p-3' : 'p-6 md:p-12'}>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className={`${getContainerClasses()} ${getBackgroundClass()}`}
        style={backgroundStyle === 'image' && data?.backgroundImage ? {
          backgroundImage: `url(${data.backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {}}
      >
        {/* Overlay for image background */}
        {backgroundStyle === 'image' && (
          <div className="absolute inset-0 bg-black/60 z-0 backdrop-blur-[2px]" />
        )}
        
        {/* Mesh Gradient Overlay */}
        {backgroundStyle === 'mesh' && (
          <div className="absolute inset-0 bg-black/5 z-0 backdrop-blur-[1px]" />
        )}

        {/* Decorative Blobs */}
        {layoutType !== 'minimal' && (
          <>
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-black/10 rounded-full blur-3xl" />
          </>
        )}

        {renderContent()}
        {(layoutType === 'split' || isMobileSimulated) && renderMockup()}
      </motion.div>
    </div>
  );
};
