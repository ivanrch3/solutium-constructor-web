import React from 'react';
import { Star, CheckCircle2, Quote, Linkedin, Twitter, MessageSquare, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ModuleWrapper } from '../ui/ModuleWrapper';
import { Typography } from '../ui/Typography';
import { usePageLayout } from '../../context/PageLayoutContext';

export const TestimonialsModule = ({ data, onUpdate }: { data: any, onUpdate?: (data: any) => void }) => {
  const { previewDevice } = usePageLayout();
  const isMobileSimulated = previewDevice === 'mobile';
  const [activeSpotlight, setActiveSpotlight] = React.useState(0);
  const layoutType = data?.layoutType || 'grid';
  const entranceAnimation = data?.entranceAnimation || 'fade';
  const smartMode = data?.smartMode || false;
  const columns = data?.columns || 3;
  const alignment = data?.alignment || 'center';
  const gap = data?.gap !== undefined ? data.gap : 32;
  const cardStyle = data?.cardStyle || { border: true, shadow: 'sm', borderRadius: 'xl', style: 'classic' };
  const testimonials = data?.testimonials || [];

  const effectiveLayout = smartMode 
    ? (isMobileSimulated ? 'carousel' : 'grid')
    : layoutType;
  
  const showRating = data?.showRating !== false;
  const showAvatar = data?.showAvatar !== false;
  const showRole = data?.showRole !== false;
  const showCompany = data?.showCompany !== false;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
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

  const getAnimationVariants = (idx: number) => {
    switch (entranceAnimation) {
      case 'slide':
        return {
          hidden: { opacity: 0, x: -30 },
          visible: { opacity: 1, x: 0, transition: { duration: 0.6, delay: idx * 0.1 } }
        };
      case 'zoom':
        return {
          hidden: { opacity: 0, scale: 0.8 },
          visible: { opacity: 1, scale: 1, transition: { duration: 0.8, delay: idx * 0.1 } }
        };
      case 'stagger-reveal':
        return {
          hidden: { opacity: 0, y: 50, rotate: 2 },
          visible: { opacity: 1, y: 0, rotate: 0, transition: { duration: 0.8, delay: idx * 0.15, ease: [0.215, 0.61, 0.355, 1] } }
        };
      default: // fade
        return {
          hidden: { opacity: 0, y: 30 },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              type: "spring",
              stiffness: 100,
              damping: 15,
              delay: idx * 0.1
            }
          }
        };
    }
  };

  const getCardClasses = () => {
    const classes = ['h-full transition-all duration-500 group flex flex-col relative'];
    
    // Base Style
    if (cardStyle.style === 'bubble') {
      classes.push('bg-surface p-8 rounded-2xl relative mb-4');
      if (cardStyle.border) classes.push('border border-text/10');
    } else if (cardStyle.style === 'flat') {
      classes.push('bg-transparent p-0');
    } else {
      // Classic
      if (cardStyle.glass) classes.push('bg-surface/50 backdrop-blur-xl border border-white/10');
      else classes.push('bg-surface');
      
      if (cardStyle.border) classes.push('border border-text/10 hover:border-primary/40');
      
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
        xl: 'rounded-[2.5rem]',
        '3xl': 'rounded-[3.5rem]'
      };
      classes.push(radiusMap[cardStyle.borderRadius || 'xl']);
      
      classes.push('p-8 md:p-10');
    }

    if (alignment === 'center') classes.push('items-center text-center');
    else classes.push('items-start text-left');

    return classes.join(' ');
  };

  const renderRating = (rating: number) => {
    if (!showRating) return null;
    return (
      <div className={`flex gap-1.5 mb-6 ${alignment === 'center' ? 'justify-center' : ''}`}>
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`w-4 h-4 transition-transform group-hover:scale-110 ${i < rating ? 'text-amber-400 fill-current' : 'text-text/10'}`} 
          />
        ))}
      </div>
    );
  };

  const renderSourceIcon = (source: string) => {
    switch (source) {
      case 'linkedin': return <Linkedin className="w-3.5 h-3.5 text-[#0077b5]" />;
      case 'twitter': return <Twitter className="w-3.5 h-3.5 text-[#1DA1F2]" />;
      case 'trustpilot': return <Star className="w-3.5 h-3.5 text-[#00b67a] fill-current" />;
      default: return null;
    }
  };

  const renderTestimonial = (test: any, idx: number) => (
    <motion.div 
      key={idx} 
      variants={getAnimationVariants(idx)}
      className={getCardClasses()}
      whileHover={{ y: -10 }}
    >
      {cardStyle.style === 'bubble' && (
        <div className={`absolute -bottom-3 ${alignment === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-8'} w-6 h-6 bg-surface border-b border-r border-text/10 rotate-45 transform`} />
      )}
      
      {cardStyle.style !== 'minimal' && (
        <div className={`mb-6 p-3 rounded-2xl bg-primary/5 w-fit ${alignment === 'center' ? 'mx-auto' : ''}`}>
          <Quote className="w-6 h-6 text-primary" />
        </div>
      )}

      {renderRating(test.rating || 5)}

      <Typography
        variant="p"
        className="text-lg md:text-xl leading-relaxed font-medium mb-8 flex-grow opacity-90 tracking-tight"
        editable={!!onUpdate}
        onUpdate={(text) => handleTextUpdate(`testimonials.${idx}.content`, text)}
      >
        {`"${test.content}"`}
      </Typography>

      <div className={`flex items-center gap-4 mt-auto w-full ${alignment === 'center' ? 'justify-center' : ''} ${cardStyle.style === 'bubble' ? 'pt-4' : ''}`}>
        {showAvatar && test.avatar && (
          <div className="relative group/avatar">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
            <img 
              src={test.avatar} 
              alt={test.name} 
              className="w-14 h-14 rounded-full object-cover border-2 border-surface shadow-md relative z-10"
              referrerPolicy="no-referrer"
            />
            {test.source && test.source !== 'none' && (
              <div className="absolute -bottom-1 -right-1 bg-surface rounded-full p-1.5 shadow-lg border border-text/5 z-20">
                {renderSourceIcon(test.source)}
              </div>
            )}
          </div>
        )}
        
        <div className={alignment === 'center' && !showAvatar ? 'w-full' : ''}>
          <div className={`flex items-center gap-2 ${alignment === 'center' ? 'justify-center' : 'justify-start'}`}>
            <Typography
              variant="h4"
              className="font-black text-sm uppercase tracking-wider"
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate(`testimonials.${idx}.name`, text)}
            >
              {test.name}
            </Typography>
            {test.verified && (
              <div className="bg-emerald-500/10 p-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </div>
            )}
          </div>
          
          {(showRole || showCompany) && (
            <div className={`text-xs font-bold uppercase tracking-widest opacity-40 flex gap-2 mt-1 ${alignment === 'center' ? 'justify-center' : 'justify-start'}`}>
              {showRole && (
                <Typography
                  variant="span"
                  editable={!!onUpdate}
                  onUpdate={(text) => handleTextUpdate(`testimonials.${idx}.role`, text)}
                >
                  {test.role}
                </Typography>
              )}
              {showRole && showCompany && <span className="text-primary">•</span>}
              {showCompany && (
                <Typography
                  variant="span"
                  editable={!!onUpdate}
                  onUpdate={(text) => handleTextUpdate(`testimonials.${idx}.company`, text)}
                >
                  {test.company}
                </Typography>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  const renderHeader = () => (
    <motion.div 
      className={`mb-20 ${alignment === 'center' ? 'text-center' : 'text-left'}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className={`flex items-center gap-3 mb-6 ${alignment === 'center' ? 'justify-center' : 'justify-start'} relative`}>
        {data?.smartMode && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-0.5 bg-primary/20 backdrop-blur-md border border-primary/30 rounded-full whitespace-nowrap">
            <Sparkles className="w-2.5 h-2.5 text-primary" />
            <span className="text-[7px] font-black uppercase tracking-widest text-primary">IA Optimizado</span>
          </div>
        )}
        <div className="p-2 bg-primary/10 rounded-xl">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
        </div>
        <span className="text-primary font-black tracking-[0.2em] uppercase text-[10px]">Testimonios</span>
      </div>
      <Typography 
        variant={data?.titleStyle?.size || 'h2'}
        weight={data?.titleStyle?.weight || '900'}
        align={data?.titleStyle?.align || alignment}
        className="text-4xl md:text-6xl mb-6 tracking-tighter"
        editable={!!onUpdate}
        onUpdate={(text) => handleTextUpdate('title', text)}
        highlightType={data?.titleStyle?.highlightType}
        highlightColor1={data?.titleStyle?.highlightColor1}
        highlightColor2={data?.titleStyle?.highlightColor2}
      >
        {data?.title || 'Lo que dicen nuestros clientes'}
      </Typography>
      <Typography 
        variant={data?.subtitleStyle?.size || 'p'}
        weight={data?.subtitleStyle?.weight || '400'}
        align={data?.subtitleStyle?.align || alignment}
        className="text-xl opacity-60 max-w-2xl mx-auto leading-relaxed"
        editable={!!onUpdate}
        onUpdate={(text) => handleTextUpdate('subtitle', text)}
      >
        {data?.subtitle || 'Historias de éxito de personas como tú.'}
      </Typography>
    </motion.div>
  );

  const renderContent = () => {
    const gridCols = isMobileSimulated ? 'grid-cols-1' : {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    }[columns as 1|2|3|4] || 'grid-cols-1 md:grid-cols-3';

    switch (effectiveLayout) {
      case 'masonry':
        return (
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className={`columns-1 ${isMobileSimulated ? '' : 'md:columns-2 lg:columns-3'} gap-8 space-y-8`}
          >
            {testimonials.map((test: any, idx: number) => (
              <div key={idx} className="break-inside-avoid">
                {renderTestimonial(test, idx)}
              </div>
            ))}
          </motion.div>
        );

      case 'carousel':
        return (
          <div className="relative group/carousel">
            <div className="flex gap-8 overflow-x-auto pb-12 snap-x no-scrollbar px-4 -mx-4 scroll-smooth">
              {testimonials.map((test: any, idx: number) => (
                <div key={idx} className={`${isMobileSimulated ? 'min-w-[300px]' : 'min-w-[350px] md:min-w-[450px]'} snap-center`}>
                  {renderTestimonial(test, idx)}
                </div>
              ))}
            </div>
            {/* Subtle fade edges */}
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-surface to-transparent pointer-events-none opacity-0 group-hover/carousel:opacity-100 transition-opacity" />
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-surface to-transparent pointer-events-none opacity-0 group-hover/carousel:opacity-100 transition-opacity" />
          </div>
        );

      case 'spotlight':
        const spotlight = testimonials[activeSpotlight] || testimonials[0];
        if (!spotlight) return null;
        return (
          <div className="max-w-5xl mx-auto text-center relative">
            <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full -z-10" />
            <Quote className={`${isMobileSimulated ? 'w-12 h-12' : 'w-24 h-24'} text-primary/10 mx-auto mb-12`} />
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSpotlight}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.05, y: -20 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              >
                <div className={`${isMobileSimulated ? 'min-h-[150px]' : 'min-h-[250px]'} flex items-center justify-center mb-16`}>
                  <Typography
                    variant="h3"
                    className={`${isMobileSimulated ? 'text-2xl' : 'text-4xl md:text-6xl'} font-black leading-[1.1] tracking-tight`}
                    editable={!!onUpdate}
                    onUpdate={(text) => handleTextUpdate(`testimonials.${activeSpotlight}.content`, text)}
                  >
                    {`"${spotlight.content}"`}
                  </Typography>
                </div>
              
                <div className="flex flex-col items-center gap-6">
                  {showAvatar && spotlight.avatar && (
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full" />
                      <img 
                        src={spotlight.avatar} 
                        alt={spotlight.name} 
                        className={`${isMobileSimulated ? 'w-20 h-20' : 'w-28 h-28'} rounded-full object-cover border-4 border-surface shadow-2xl relative z-10`}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  <div>
                    <div className={`${isMobileSimulated ? 'text-xl' : 'text-2xl'} font-black flex items-center gap-3 justify-center uppercase tracking-wider`}>
                      <Typography
                        variant="span"
                        editable={!!onUpdate}
                        onUpdate={(text) => handleTextUpdate(`testimonials.${activeSpotlight}.name`, text)}
                      >
                        {spotlight.name}
                      </Typography>
                      {spotlight.verified && (
                        <div className="bg-emerald-500/10 p-1 rounded-full">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        </div>
                      )}
                    </div>
                    {(showRole || showCompany) && (
                      <div className="opacity-40 font-bold uppercase tracking-[0.2em] flex gap-2 justify-center text-xs mt-3">
                        {showRole && (
                          <Typography
                            variant="span"
                            editable={!!onUpdate}
                            onUpdate={(text) => handleTextUpdate(`testimonials.${activeSpotlight}.role`, text)}
                          >
                            {spotlight.role}
                          </Typography>
                        )}
                        {showRole && showCompany && <span className="text-primary">•</span>}
                        {showCompany && (
                          <Typography
                            variant="span"
                            editable={!!onUpdate}
                            onUpdate={(text) => handleTextUpdate(`testimonials.${activeSpotlight}.company`, text)}
                          >
                            {spotlight.company}
                          </Typography>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {testimonials.length > 1 && (
              <div className="flex justify-center gap-3 mt-16">
                {testimonials.map((_: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSpotlight(idx)}
                    className={`h-2 rounded-full transition-all duration-500 ${idx === activeSpotlight ? 'bg-primary w-12' : 'bg-text/10 hover:bg-text/30 w-3'}`}
                  />
                ))}
              </div>
            )}
          </div>
        );

      case 'minimal':
        return (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className={`grid ${gridCols} gap-12 ${isMobileSimulated ? 'divide-y' : 'divide-y md:divide-y-0 md:divide-x'} divide-text/10`}
          >
            {testimonials.map((test: any, idx: number) => (
              <motion.div 
                key={idx} 
                variants={itemVariants}
                className={`${isMobileSimulated ? 'py-8 first:pt-0 last:pb-0' : 'px-8 first:pl-0 last:pr-0'}`}
              >
                {showRating && (
                  <div className="flex gap-1.5 text-primary mb-6">
                    {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < (test.rating || 5) ? 'fill-current' : 'text-text/10'}`} />)}
                  </div>
                )}
                <Typography
                  variant="p"
                  className={`${isMobileSimulated ? 'text-lg' : 'text-xl'} font-medium mb-8 leading-relaxed italic opacity-90`}
                  editable={!!onUpdate}
                  onUpdate={(text) => handleTextUpdate(`testimonials.${idx}.content`, text)}
                >
                  {`"${test.content}"`}
                </Typography>
                <div className="flex items-center gap-4">
                  {showAvatar && test.avatar && (
                    <img src={test.avatar} className="w-12 h-12 rounded-full border-2 border-surface shadow-md" alt={test.name} referrerPolicy="no-referrer" />
                  )}
                  <div>
                    <Typography
                      variant="p"
                      className="font-black text-sm uppercase tracking-wider"
                      editable={!!onUpdate}
                      onUpdate={(text) => handleTextUpdate(`testimonials.${idx}.name`, text)}
                    >
                      {test.name}
                    </Typography>
                    {(showRole || showCompany) && (
                      <div className="text-[10px] font-bold uppercase tracking-widest opacity-40 flex gap-2 mt-1">
                        {showRole && <span>{test.role}</span>}
                        {showRole && showCompany && <span className="text-primary">•</span>}
                        {showCompany && <span>{test.company}</span>}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        );

      default: // Grid
        return (
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className={`grid ${gridCols}`} 
            style={{ gap: `${gap}px` }}
          >
            {testimonials.map((test: any, idx: number) => renderTestimonial(test, idx))}
          </motion.div>
        );
    }
  };

  return (
    <ModuleWrapper 
      theme={data?.theme}
      background={data?.background}
    >
      <div className="max-w-7xl mx-auto px-4">
        {renderHeader()}
        {renderContent()}
        
        {data?.sectionButton?.text && (
          <motion.div 
            className={`mt-24 flex ${alignment === 'center' ? 'justify-center' : 'justify-start'}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.a 
              href={data.sectionButton.url || '#'} 
              target={data.sectionButton.target || '_self'}
              className="px-12 py-6 bg-primary text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-primary/20 hover:bg-primary/90 transition-all"
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              {data.sectionButton.text}
            </motion.a>
          </motion.div>
        )}
      </div>
    </ModuleWrapper>
  );
};
