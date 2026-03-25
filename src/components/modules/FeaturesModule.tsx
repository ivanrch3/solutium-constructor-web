import React from 'react';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ModuleWrapper } from '../ui/ModuleWrapper';
import { Typography } from '../ui/Typography';
import { usePageLayout } from '../../context/PageLayoutContext';

const getIcon = (name: string) => {
  const Icon = (LucideIcons as any)[name] || LucideIcons.Zap;
  return Icon;
};

export const FeaturesModule = ({ data, onUpdate }: { data: any, onUpdate?: (data: any) => void }) => {
  const { previewDevice } = usePageLayout();
  const isMobileSimulated = previewDevice === 'mobile';
  const layoutType = data?.layoutType || 'grid';
  const hoverEffect = data?.hoverEffect || 'none';
  const entranceAnimation = data?.entranceAnimation || 'fade';
  const smartMode = data?.smartMode || false;
  const columns = data?.columns || 3;
  const alignment = data?.alignment || 'center';
  const gap = data?.gap !== undefined ? data.gap : 32;
  const cardStyle = data?.cardStyle || { border: true, shadow: 'sm', borderRadius: 'xl' };
  const features = data?.features || [];
  const showIcons = data?.showIcons !== false;
  const showDescriptions = data?.showDescriptions !== false;

  const effectiveLayout = smartMode 
    ? (isMobileSimulated ? 'list' : 'grid')
    : layoutType;

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

  const getCardClasses = () => {
    const classes = ['h-full transition-all duration-500 group flex flex-col relative overflow-hidden'];
    
    if (cardStyle.border) classes.push('border border-text/10 hover:border-primary/40');
    if (cardStyle.glass) classes.push('bg-surface/50 backdrop-blur-xl');
    else classes.push('bg-surface');
    
    const shadowMap: Record<string, string> = {
      none: '',
      sm: 'shadow-sm hover:shadow-2xl hover:shadow-primary/10',
      md: 'shadow-md hover:shadow-3xl hover:shadow-primary/15',
      lg: 'shadow-xl hover:shadow-4xl hover:shadow-primary/25'
    };
    classes.push(shadowMap[cardStyle.shadow || 'none']);

    const radiusMap: Record<string, string> = {
      none: 'rounded-none',
      md: 'rounded-2xl',
      xl: 'rounded-[2rem]',
      '3xl': 'rounded-[3rem]'
    };
    classes.push(radiusMap[cardStyle.borderRadius || 'xl']);

    if (alignment === 'center') classes.push('items-center text-center p-8 md:p-12');
    else classes.push('items-start text-left p-8 md:p-12');

    if (hoverEffect === 'lift') classes.push('hover:-translate-y-4');
    if (hoverEffect === 'glow') classes.push('hover:shadow-[0_0_50px_rgba(var(--color-primary-rgb),0.3)]');
    if (hoverEffect === 'border-pulse') classes.push('hover:animate-pulse border-2');

    return classes.join(' ');
  };

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
      case 'stagger-reveal':
        return {
          initial: { opacity: 0, y: 50, rotate: 2 },
          whileInView: { opacity: 1, y: 0, rotate: 0 },
          transition: { duration: 0.8, delay: idx * 0.15, ease: [0.215, 0.61, 0.355, 1] }
        };
      default: // fade
        return {
          initial: { opacity: 0, y: 30 },
          whileInView: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay: idx * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }
        };
    }
  };

  const renderMedia = (feature: any, idx: number) => {
    if (!showIcons) return null;

    if (feature.mediaType === 'image' && feature.image) {
      return (
        <div className="mb-8 w-full aspect-video rounded-2xl overflow-hidden border border-text/5 relative group-hover:shadow-lg transition-all duration-500">
          <img 
            src={feature.image} 
            alt={feature.title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      );
    }

    const Icon = getIcon(feature.icon || 'Zap');
    const shapeClasses = {
      circle: 'rounded-full',
      square: 'rounded-2xl',
      squircle: 'rounded-[1.75rem]'
    }[feature.iconStyle?.shape || 'circle'];

    const typeClasses = {
      solid: 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white',
      gradient: 'bg-gradient-to-br from-primary/20 to-accent/20 text-primary group-hover:from-primary group-hover:to-accent group-hover:text-white',
      outlined: 'border-2 border-primary/20 text-primary group-hover:border-primary group-hover:bg-primary/5'
    }[feature.iconStyle?.type || 'solid'];

    return (
      <motion.div 
        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
        className={`w-20 h-20 flex items-center justify-center mb-8 transition-all duration-500 shadow-sm group-hover:shadow-primary/20 ${shapeClasses} ${typeClasses}`}
      >
        <Icon className="w-10 h-10" />
      </motion.div>
    );
  };

  const renderFeature = (feature: any, idx: number) => {
    const animation = getAnimationVariants(idx);
    
    return (
      <motion.div 
        key={idx} 
        initial={animation.initial}
        whileInView={animation.whileInView}
        viewport={{ once: true, margin: "-50px" }}
        transition={animation.transition}
        whileHover={hoverEffect === 'none' ? { y: -10 } : undefined}
        className={getCardClasses()}
        id={`feature-${idx}`}
      >
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />
      
      {feature.badge && (
        <motion.span 
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="mb-6 px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full inline-block border border-primary/20"
        >
          <Typography
            variant="span"
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate(`features.${idx}.badge`, text)}
          >
            {feature.badge}
          </Typography>
        </motion.span>
      )}
      
      {renderMedia(feature, idx)}

      <Typography
        variant="h3"
        className="text-2xl md:text-3xl font-black text-text mb-4 tracking-tight group-hover:text-primary transition-colors duration-300"
        editable={!!onUpdate}
        onUpdate={(text) => handleTextUpdate(`features.${idx}.title`, text)}
      >
        {feature.title || 'Característica'}
      </Typography>

      {showDescriptions && (
        <Typography
          variant="p"
          className="text-text/60 leading-relaxed mb-8 flex-grow text-base md:text-lg"
          editable={!!onUpdate}
          onUpdate={(text) => handleTextUpdate(`features.${idx}.description`, text)}
        >
          {feature.description || 'Descripción de la característica.'}
        </Typography>
      )}

      {feature.link?.text && (
        <motion.a 
          whileHover={{ x: 8 }}
          href={feature.link.url || '#'} 
          target={feature.link.target || '_self'}
          onClick={(e) => {
            if (onUpdate) e.preventDefault();
          }}
          className="inline-flex items-center gap-3 text-primary font-black text-sm uppercase tracking-widest transition-all cursor-pointer group/link"
        >
          <Typography
            variant="span"
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate(`features.${idx}.link.text`, text)}
          >
            {feature.link.text}
          </Typography>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover/link:bg-primary group-hover/link:text-white transition-all">
            <LucideIcons.ArrowRight className="w-4 h-4" />
          </div>
        </motion.a>
      )}
    </motion.div>
    );
  };

  const renderHeader = () => (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`mb-24 ${alignment === 'center' ? 'text-center' : 'text-left'}`}
    >
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 mb-6 ${alignment === 'center' ? 'mx-auto' : ''} relative`}>
        {data?.smartMode && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-0.5 bg-primary/20 backdrop-blur-md border border-primary/30 rounded-full whitespace-nowrap">
            <LucideIcons.Sparkles className="w-2.5 h-2.5 text-primary" />
            <span className="text-[7px] font-black uppercase tracking-widest text-primary">IA Optimizado</span>
          </div>
        )}
        <LucideIcons.Sparkles className="w-4 h-4 text-primary animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/80">Características</span>
      </div>
      
      <Typography 
        variant={data?.titleStyle?.size || 'h2'}
        weight={data?.titleStyle?.weight || '900'}
        align={data?.titleStyle?.align || alignment}
        highlightType={data?.titleStyle?.highlightType}
        highlightColor1={data?.titleStyle?.highlightColor1}
        highlightColor2={data?.titleStyle?.highlightColor2}
        className="mb-8 tracking-tighter text-5xl md:text-7xl"
        editable={!!onUpdate}
        onUpdate={(text) => handleTextUpdate('title', text)}
      >
        {data?.title || 'Nuestros Servicios'}
      </Typography>
      
      <Typography 
        variant={data?.subtitleStyle?.size || 'p'}
        weight={data?.subtitleStyle?.weight || '400'}
        align={data?.subtitleStyle?.align || alignment}
        className="opacity-70 max-w-3xl mx-auto leading-relaxed text-lg md:text-xl font-medium"
        editable={!!onUpdate}
        onUpdate={(text) => handleTextUpdate('subtitle', text)}
      >
        {data?.subtitle || 'Descubre cómo podemos ayudarte a alcanzar tus objetivos con soluciones innovadoras y personalizadas.'}
      </Typography>
    </motion.div>
  );

  const renderContent = () => {
    // Logic to handle the "3 or 6" rule for desktop grid
    // If we have 4 items, we might want to use 2 columns instead of 3 or 4 to avoid the "empty space"
    // or if we have 5 items, we might want to use a different layout.
    // The user said: "Procure que sean o tres o seis las características a mostrar, nunca cuatro ni cinco."
    
    let gridCols = isMobileSimulated ? 'grid-cols-1' : {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    }[columns as 1|2|3|4] || 'grid-cols-1 md:grid-cols-3';

    // Override gridCols if features.length is 4 and we are in grid mode
    if (!isMobileSimulated && layoutType === 'grid' && features.length === 4 && columns === 3) {
      gridCols = 'grid-cols-1 md:grid-cols-2'; // 2x2 is better than 3+1
    }

    switch (effectiveLayout) {
      case 'bento':
        return (
          <div className={`grid ${isMobileSimulated ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-4'} gap-8`}>
            {features.map((feature: any, idx: number) => {
              const isLarge = idx === 0 || idx === 3;
              return (
                <motion.div 
                  key={idx} 
                  layout
                  className={`${isLarge && !isMobileSimulated ? 'md:col-span-2' : 'md:col-span-1'}`}
                >
                  {renderFeature(feature, idx)}
                </motion.div>
              );
            })}
          </div>
        );
      
      case 'zigzag':
        return (
          <div className="space-y-24 md:space-y-40">
            {features.map((feature: any, idx: number) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`flex flex-col ${isMobileSimulated ? '' : 'lg:flex-row'} items-center gap-12 md:gap-20 ${idx % 2 !== 0 && !isMobileSimulated ? 'lg:flex-row-reverse' : ''}`}
              >
                <div className={`${isMobileSimulated ? 'w-full' : 'lg:w-1/2 w-full'}`}>
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="aspect-video rounded-[3rem] overflow-hidden shadow-2xl border border-text/10 relative group"
                  >
                    <img 
                      src={feature.image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80'} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      alt={feature.title}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-primary/10 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </motion.div>
                </div>
                <div className={`${isMobileSimulated ? 'w-full' : 'lg:w-1/2 w-full'}`}>
                  <div className={`${isMobileSimulated ? 'w-full' : 'max-w-xl'}`}>
                    {renderFeature({ ...feature, mediaType: 'none' }, idx)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        );

      case 'list':
        return (
          <div className={`grid ${isMobileSimulated ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-x-16 gap-y-8 md:gap-y-12`}>
            {features.map((feature: any, idx: number) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-6 md:gap-8 p-6 md:p-8 hover:bg-primary/5 rounded-[2.5rem] transition-all duration-500 group border border-transparent hover:border-primary/10"
              >
                {showIcons && (
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm"
                  >
                    {React.createElement(getIcon(feature.icon || 'Zap'), { className: 'w-7 h-7 md:w-8 h-8' })}
                  </motion.div>
                )}
                <div className="flex-grow">
                  <Typography 
                    variant="h4" 
                    className="text-xl md:text-2xl font-black mb-3 group-hover:text-primary transition-colors duration-300"
                    editable={!!onUpdate}
                    onUpdate={(text) => handleTextUpdate(`features.${idx}.title`, text)}
                  >
                    {feature.title}
                  </Typography>
                  {showDescriptions && (
                    <Typography 
                      variant="p" 
                      className="text-base opacity-70 leading-relaxed"
                      editable={!!onUpdate}
                      onUpdate={(text) => handleTextUpdate(`features.${idx}.description`, text)}
                    >
                      {feature.description}
                    </Typography>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        );

      case 'carousel':
        return (
          <div className="flex gap-8 overflow-x-auto pb-12 snap-x no-scrollbar -mx-4 px-4">
            {features.map((feature: any, idx: number) => (
              <div key={idx} className="min-w-[320px] md:min-w-[450px] snap-center">
                {renderFeature(feature, idx)}
              </div>
            ))}
          </div>
        );

      default: // Grid
        return (
          <div className={`grid ${gridCols}`} style={{ gap: `${gap}px` }}>
            <AnimatePresence mode="popLayout">
              {features.map((feature: any, idx: number) => renderFeature(feature, idx))}
            </AnimatePresence>
          </div>
        );
    }
  };

  return (
    <ModuleWrapper 
      theme={data?.theme}
      background={data?.background}
      id="features-module"
    >
      <div className="container mx-auto px-4">
        {renderHeader()}
        {renderContent()}
        
        {data?.sectionButton?.text && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`mt-24 flex ${alignment === 'center' ? 'justify-center' : 'justify-start'}`}
          >
            <motion.a 
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
              whileTap={{ scale: 0.95 }}
              href={data.sectionButton.url || '#'} 
              target={data.sectionButton.target || '_self'}
              onClick={(e) => {
                if (onUpdate) e.preventDefault();
              }}
              className="px-12 py-6 bg-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-primary/30 hover:bg-primary/90 transition-all cursor-pointer text-sm"
            >
              <Typography
                variant="span"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('sectionButton.text', text)}
              >
                {data.sectionButton.text}
              </Typography>
            </motion.a>
          </motion.div>
        )}
      </div>
    </ModuleWrapper>
  );
};

export default FeaturesModule;
