import React, { useState, useEffect } from 'react';
import { ScrollAnimation, AnimationType } from './ScrollAnimation';
import { PageLayout } from '../../types';
import { usePageLayout } from '../../context/PageLayoutContext';
import { useModuleContext } from '../../context/ModuleContext';
import { motion, AnimatePresence } from 'motion/react';

interface ModuleWrapperProps {
  layout?: 'layout-1' | 'layout-2' | 'layout-3' | 'layout-4' | 'layout-5' | 'layout-6' | 'layout-7';
  theme?: 'light' | 'dark';
  background?: {
    type?: 'image' | 'video' | 'carousel' | 'particles';
    image?: string;
    videoUrl?: string;
    carouselImages?: string[];
    carouselTransition?: 'fade' | 'slide';
    particlesStyle?: 'stars' | 'network' | 'bubbles';
    size?: 'cover' | 'contain' | 'repeat' | 'auto';
    overlayOpacity?: number;
    overlayType?: 'solid' | 'gradient';
    parallax?: boolean;
    topDivider?: 'none' | 'waves' | 'curve' | 'triangle';
    bottomDivider?: 'none' | 'waves' | 'curve' | 'triangle';
  };
  animation?: AnimationType;
  pageLayout?: PageLayout;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  noPadding?: boolean;
  index?: number;
  id?: string;
}

export const ModuleWrapper = ({
  layout = 'layout-1',
  theme = 'light',
  background,
  animation = 'fade-up',
  pageLayout: manualPageLayout,
  children,
  className = '',
  style = {},
  noPadding = false,
  index: manualIndex,
  id
}: ModuleWrapperProps) => {
  const { pageLayout: contextPageLayout } = usePageLayout();
  const { index: contextIndex } = useModuleContext();
  
  const pageLayout = manualPageLayout || contextPageLayout || 'seamless';
  const index = manualIndex !== undefined ? manualIndex : contextIndex;

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (background?.type === 'carousel' && background.carouselImages?.length) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % background.carouselImages!.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [background?.type, background?.carouselImages]);

  const themeClasses = theme === 'dark' 
    ? 'bg-text text-background border-text/20' 
    : 'bg-surface text-text border-text/10';

  const isLayered = pageLayout === 'layered';
  const isBento = pageLayout === 'bento';
  const isSnap = pageLayout === 'snap';
  const isSplit = pageLayout === 'split';
  const isEven = index % 2 === 0;

  const layoutClasses = pageLayout === 'seamless' 
    ? 'rounded-none border-0' 
    : pageLayout === 'symmetric'
    ? 'rounded-none border-x border-text/5'
    : isLayered
    ? `rounded-[3rem] border shadow-xl ${isEven ? 'md:ml-[-5%] md:mr-[5%]' : 'md:mr-[-5%] md:ml-[5%]'}`
    : isBento
    ? 'rounded-3xl border shadow-sm h-full'
    : isSnap
    ? 'rounded-none border-0 snap-start min-h-[calc(100vh-120px)] flex items-center justify-center'
    : isSplit
    ? 'rounded-none border-0 min-h-[60vh] flex items-center justify-center'
    : 'rounded-[2.5rem] border';

  const backgroundStyles: React.CSSProperties = {};
  if ((!background?.type || background.type === 'image') && background?.image) {
    backgroundStyles.backgroundImage = `url(${background.image})`;
    backgroundStyles.backgroundSize = background.size || 'cover';
    backgroundStyles.backgroundPosition = 'center';
    backgroundStyles.backgroundRepeat = background.size === 'repeat' ? 'repeat' : 'no-repeat';
    if (background.parallax) {
      backgroundStyles.backgroundAttachment = 'fixed';
    }
  }

  const overlayOpacity = background?.overlayOpacity ?? (theme === 'dark' ? 0.7 : 0.1);
  const overlayType = background?.overlayType || 'solid';
  
  const overlayStyle: React.CSSProperties = {
    opacity: overlayOpacity
  };

  if (overlayType === 'solid') {
    overlayStyle.backgroundColor = theme === 'dark' ? 'rgb(var(--color-text-rgb))' : 'rgb(var(--color-background-rgb))';
  } else if (overlayType === 'gradient') {
    const color1 = theme === 'dark' ? 'rgba(var(--color-text-rgb), 1)' : 'rgba(var(--color-background-rgb), 1)';
    const color2 = theme === 'dark' ? 'rgba(var(--color-primary-rgb), 0.8)' : 'rgba(var(--color-primary-rgb), 0.2)';
    overlayStyle.backgroundImage = `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
  }

  const paddingClass = noPadding ? '' : isBento ? 'py-12 md:py-16 px-6 md:px-8' : isSnap || isSplit ? 'py-16 md:py-20 px-6 md:px-10' : 'py-12 md:py-24 px-6 md:px-10';

  const renderShapeDivider = (position: 'top' | 'bottom', type: string) => {
    if (!type || type === 'none') return null;
    
    const fillClass = theme === 'dark' ? 'fill-background' : 'fill-surface';
    const transform = position === 'top' ? 'rotate-180' : '';
    const positionClass = position === 'top' ? 'top-0' : 'bottom-0';

    let svgPath = '';
    if (type === 'waves') {
      svgPath = "M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,85.3C672,75,768,85,864,112C960,139,1056,181,1152,181.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z";
    } else if (type === 'curve') {
      svgPath = "M0,160L1440,0L1440,320L0,320Z"; // Simplified curve
    } else if (type === 'triangle') {
      svgPath = "M720,160L1440,320L0,320Z";
    }

    return (
      <div className={`absolute left-0 w-full overflow-hidden leading-none z-0 ${positionClass} ${transform}`}>
        <svg className="relative block w-[calc(100%+1.3px)] h-[100px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path d={svgPath} className={fillClass}></path>
        </svg>
      </div>
    );
  };

  const renderVideoBackground = () => {
    if (background?.type !== 'video' || !background.videoUrl) return null;
    
    // Simple check for youtube/vimeo, otherwise assume direct mp4
    const isYouTube = background.videoUrl.includes('youtube.com') || background.videoUrl.includes('youtu.be');
    const isVimeo = background.videoUrl.includes('vimeo.com');

    if (isYouTube) {
      const videoId = background.videoUrl.split('v=')[1] || background.videoUrl.split('youtu.be/')[1];
      return (
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <iframe 
            className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&playsinline=1`}
            allow="autoplay; encrypted-media"
            style={{ border: 'none' }}
          />
        </div>
      );
    }

    if (isVimeo) {
      const videoId = background.videoUrl.split('vimeo.com/')[1];
      return (
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <iframe 
            className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2"
            src={`https://player.vimeo.com/video/${videoId}?background=1&autoplay=1&loop=1&byline=0&title=0`}
            allow="autoplay; encrypted-media"
            style={{ border: 'none' }}
          />
        </div>
      );
    }

    return (
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
      >
        <source src={background.videoUrl} type="video/mp4" />
      </video>
    );
  };

  const renderCarouselBackground = () => {
    if (background?.type !== 'carousel' || !background.carouselImages?.length) return null;

    const transition = background.carouselTransition || 'fade';

    return (
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <AnimatePresence mode="popLayout">
          <motion.img
            key={currentSlide}
            src={background.carouselImages[currentSlide]}
            initial={transition === 'slide' ? { x: '100%' } : { opacity: 0 }}
            animate={transition === 'slide' ? { x: 0 } : { opacity: 1 }}
            exit={transition === 'slide' ? { x: '-100%' } : { opacity: 0 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
      </div>
    );
  };

  const renderParticlesBackground = () => {
    if (background?.type !== 'particles') return null;
    
    // A simple CSS-based particle effect placeholder
    // In a real app, you'd use a library like tsParticles
    return (
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent animate-pulse" />
        {/* We can add simple CSS dots here if needed */}
      </div>
    );
  };

  return (
    <ScrollAnimation 
      animation={animation} 
      tag="section"
      id={id}
      className={`relative ${paddingClass} overflow-hidden transition-all duration-500 ${themeClasses} ${layoutClasses} ${className}`}
      style={{ ...backgroundStyles, ...style }}
    >
      {renderVideoBackground()}
      {renderCarouselBackground()}
      {renderParticlesBackground()}
      
      {(background?.image || background?.type === 'video' || background?.type === 'carousel' || background?.type === 'particles') && (
        <div className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-500" style={overlayStyle} />
      )}

      {renderShapeDivider('top', background?.topDivider || 'none')}
      {renderShapeDivider('bottom', background?.bottomDivider || 'none')}

      <div className="relative z-10 max-w-7xl mx-auto">
        {children}
      </div>
    </ScrollAnimation>
  );
};

