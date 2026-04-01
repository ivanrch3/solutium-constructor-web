import React from 'react';
import { ShieldCheck, Star, Award, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Typography } from '../ui/Typography';
import { ModuleWrapper } from '../ui/ModuleWrapper';
import { usePageLayout } from '../../context/PageLayoutContext';

interface TrustBarModuleProps {
  data: any;
  onUpdate?: (data: any) => void;
}

export const TrustBarModule = ({ data, onUpdate }: TrustBarModuleProps) => {
  const { previewDevice } = usePageLayout();
  const isMobileSimulated = previewDevice === 'mobile';
  
  const layoutType = data?.layoutType || 'marquee'; // marquee, grid, minimal
  const logos = data?.logos || [
    { name: 'Solutium', url: '' },
    { name: 'TechFlow', url: '' },
    { name: 'Innovate', url: '' },
    { name: 'GlobalSys', url: '' },
    { name: 'NextGen', url: '' },
    { name: 'CloudScale', url: '' }
  ];

  const isGrayscale = data?.grayscale !== false;
  const showBadges = data?.showBadges || false;
  const entranceAnimation = data?.entranceAnimation || 'fade';
  const smartMode = data?.smartMode || false;

  const getAnimationVariants = (idx: number) => {
    switch (entranceAnimation) {
      case 'slide':
        return {
          initial: { opacity: 0, x: -30 },
          whileInView: { opacity: 1, x: 0 },
          transition: { duration: 0.6, delay: idx * 0.1 }
        };
      case 'zoom':
        return {
          initial: { opacity: 0, scale: 0.8 },
          whileInView: { opacity: 1, scale: 1 },
          transition: { duration: 0.8, delay: idx * 0.1 }
        };
      default: // fade
        return {
          initial: { opacity: 0, y: 20 },
          whileInView: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay: idx * 0.1 }
        };
    }
  };

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

  const renderLogo = (logo: any, i: number) => {
    const animation = getAnimationVariants(i);
    return (
      <motion.div 
        key={i} 
        initial={animation.initial}
        whileInView={animation.whileInView}
        viewport={{ once: true }}
        transition={animation.transition}
        whileHover={{ scale: 1.05, y: -2 }}
        className={`flex items-center gap-3 px-8 py-4 bg-current/[0.02] rounded-2xl border border-current/5 transition-all duration-300 group hover:bg-current/[0.04] hover:border-primary/20`}
      >
        {logo.url ? (
          <img 
            src={logo.url} 
            alt={logo.name} 
            className={`h-8 md:h-10 w-auto object-contain transition-all duration-500 ${isGrayscale ? 'grayscale group-hover:grayscale-0' : ''}`}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <Typography
              variant="span"
              className="font-black text-lg md:text-xl tracking-tighter italic opacity-60 group-hover:opacity-100 transition-opacity"
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate(`logos.${i}.name`, text)}
            >
              {logo.name}
            </Typography>
          </div>
        )}
      </motion.div>
    );
  };

  const marqueeVariants = {
    animate: {
      x: [0, -1000],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: 25,
          ease: "linear",
        },
      },
    },
  };

  const effectiveLayout = smartMode 
    ? (isMobileSimulated || logos.length > 5 ? 'marquee' : 'grid')
    : layoutType;

  return (
    <ModuleWrapper 
      theme={data?.theme}
      background={data?.background}
      noPadding
    >
      <div className={`py-16 overflow-hidden`}>
        <div className="max-w-7xl mx-auto px-6 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center justify-center gap-4 text-center"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full border border-primary/10">
              <Sparkles className="w-4 h-4 text-primary" />
              <Typography
                variant="span"
                className="text-[10px] font-black uppercase tracking-[0.2em] text-primary"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('title', text)}
              >
                {data?.title || 'Empresas que confían en nosotros'}
              </Typography>
            </div>
            {showBadges && (
              <div className="flex items-center gap-6 opacity-40">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-[10px] font-black uppercase tracking-widest">4.9/5 Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Top Rated 2024</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {effectiveLayout === 'marquee' ? (
          <div className="relative">
            {/* Gradient Fades */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
            
            <motion.div 
              variants={marqueeVariants}
              animate="animate"
              className="flex gap-8 whitespace-nowrap"
            >
              {[...logos, ...logos, ...logos].map((logo, i) => renderLogo(logo, i))}
            </motion.div>
          </div>
        ) : (
          <div className={`max-w-7xl mx-auto px-6 grid ${isMobileSimulated ? 'grid-cols-2 gap-4' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6'}`}>
            {logos.map((logo, i) => renderLogo(logo, i))}
          </div>
        )}
      </div>
    </ModuleWrapper>
  );
};
