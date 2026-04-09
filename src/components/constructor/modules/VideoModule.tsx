import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { Play, X, Maximize2, ArrowRight } from 'lucide-react';

export const VideoModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any> 
}> = ({ moduleId, settingsValues }) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues && settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  };

  // Global Settings
  const layout = getVal(null, 'layout', 'centered');
  const aspectRatio = getVal(null, 'aspect_ratio', '16/9');
  const paddingY = getVal(null, 'padding_y', 100);
  const maxWidth = getVal(null, 'max_width', 1000);
  const bgColor = getVal(null, 'bg_color', '#FFFFFF');
  const overlayColor = getVal(null, 'overlay_color', 'rgba(0,0,0,0.2)');
  const videoFilter = getVal(null, 'video_filter', 'none');
  const entranceAnim = getVal(null, 'entrance_anim', true);
  const parallaxEffect = getVal(null, 'parallax_effect', false);
  const hoverToPlay = getVal(null, 'hover_to_play', false);
  const maskShape = getVal(null, 'mask_shape', 'none');

  // Element: Video Player
  const videoUrl = getVal(`${moduleId}_el_video_player`, 'video_url', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const posterUrl = getVal(`${moduleId}_el_video_player`, 'poster_url', 'https://picsum.photos/seed/video/1280/720');
  const autoplay = getVal(`${moduleId}_el_video_player`, 'autoplay', false);
  const loop = getVal(`${moduleId}_el_video_player`, 'loop', true);
  const controls = getVal(`${moduleId}_el_video_player`, 'controls', true);
  const radius = getVal(`${moduleId}_el_video_player`, 'radius', 24);
  const shadow = getVal(`${moduleId}_el_video_player`, 'shadow', true);
  const borderColor = getVal(`${moduleId}_el_video_player`, 'border_color', 'rgba(0,0,0,0.1)');
  const useLightbox = getVal(`${moduleId}_el_video_player`, 'lightbox', false);
  const playButtonStyle = getVal(`${moduleId}_el_video_player`, 'play_button_style', 'pulse');

  // Element: Text
  const showText = getVal(`${moduleId}_el_video_text`, 'show_text', true);
  const eyebrow = getVal(`${moduleId}_el_video_text`, 'eyebrow', 'SHOWCASE');
  const title = getVal(`${moduleId}_el_video_text`, 'title', 'Descubre nuestra visión');
  const subtitle = getVal(`${moduleId}_el_video_text`, 'subtitle', 'Un recorrido visual por lo que nos hace únicos.');
  const ctaText = getVal(`${moduleId}_el_video_text`, 'cta_text', '');
  const textAlign = getVal(`${moduleId}_el_video_text`, 'align', 'center');
  const titleSize = getVal(`${moduleId}_el_video_text`, 'title_size', 40);
  const titleColor = getVal(`${moduleId}_el_video_text`, 'title_color', '#0F172A');
  const eyebrowColor = getVal(`${moduleId}_el_video_text`, 'eyebrow_color', 'var(--primary-color)');
  const marginB = getVal(`${moduleId}_el_video_text`, 'margin_b', 40);

  const y = useTransform(scrollYProgress, [0, 1], [0, parallaxEffect ? 100 : 0]);

  const filterClass = useMemo(() => {
    switch (videoFilter) {
      case 'grayscale': return 'grayscale';
      case 'sepia': return 'sepia';
      case 'blur': return 'blur-sm';
      default: return '';
    }
  }, [videoFilter]);

  const maskClass = useMemo(() => {
    switch (maskShape) {
      case 'blob': return 'mask-blob'; // Requires CSS or SVG mask
      case 'circle': return 'rounded-full';
      default: return '';
    }
  }, [maskShape]);

  const getAspectRatioPadding = (ratio: string) => {
    switch (ratio) {
      case '16/9': return '56.25%';
      case '9/16': return '177.77%';
      case '4/3': return '75%';
      default: return '56.25%';
    }
  };

  const isYouTube = typeof videoUrl === 'string' && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'));
  const isVimeo = typeof videoUrl === 'string' && videoUrl.includes('vimeo.com');

  const getEmbedUrl = (url: any, forceAutoplay = false) => {
    if (typeof url !== 'string' || !url) return '';
    const shouldAutoplay = forceAutoplay || autoplay || (hoverToPlay && isHovered);
    
    if (isYouTube) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      const id = (match && match[2].length === 11) ? match[2] : null;
      if (!id) return url;
      return `https://www.youtube.com/embed/${id}?autoplay=${shouldAutoplay ? 1 : 0}&loop=${loop ? 1 : 0}&controls=${controls ? 1 : 0}&mute=${shouldAutoplay ? 1 : 0}&playlist=${id}&rel=0`;
    }
    if (isVimeo) {
      const id = url.split('/').filter(p => p).pop()?.split('?')[0];
      return `https://player.vimeo.com/video/${id}?autoplay=${shouldAutoplay ? 1 : 0}&loop=${loop ? 1 : 0}&muted=${shouldAutoplay ? 1 : 0}`;
    }
    return url;
  };

  const handlePlayClick = () => {
    if (useLightbox) {
      setIsLightboxOpen(true);
    } else {
      setIsPlaying(true);
      if (videoRef.current) {
        videoRef.current.play().catch(err => console.error("Error playing video:", err));
      }
    }
  };

  const renderVideo = (inLightbox = false) => {
    if (isYouTube || isVimeo) {
      return (
        <iframe
          key={`${videoUrl}-${inLightbox || isPlaying || (hoverToPlay && isHovered)}`}
          src={getEmbedUrl(videoUrl, inLightbox || isPlaying)}
          className={`absolute inset-0 w-full h-full border-0 transition-all duration-700 ${filterClass}`}
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; gyroscope"
          title="Video Player"
          loading="lazy"
        />
      );
    }

    return (
      <video
        ref={videoRef}
        src={typeof videoUrl === 'string' ? videoUrl : ''}
        poster={typeof posterUrl === 'string' ? posterUrl : ''}
        autoPlay={autoplay || isPlaying || (hoverToPlay && isHovered)}
        loop={loop}
        muted={(autoplay || hoverToPlay) && !isPlaying}
        controls={controls}
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${filterClass}`}
      />
    );
  };

  const renderPlayButton = () => {
    if (playButtonStyle === 'none') return null;

    return (
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handlePlayClick}
        className="absolute inset-0 m-auto w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl z-20 group"
      >
        {playButtonStyle === 'pulse' && (
          <motion.div 
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-white rounded-full"
          />
        )}
        <Play className="text-primary fill-primary ml-1 group-hover:scale-110 transition-transform" size={32} />
      </motion.button>
    );
  };

  const renderTextContent = (isOverlay = false) => {
    if (!showText) return null;
    const colorClass = isOverlay ? 'text-white' : '';
    const subColorClass = isOverlay ? 'text-white/80' : 'text-slate-500';

    return (
      <div 
        className={`flex flex-col ${textAlign === 'center' ? 'items-center text-center' : 'items-start text-left'}`}
        style={{ marginBottom: isOverlay ? 0 : `${marginB}px` }}
      >
        {eyebrow && (
          <span 
            className="text-sm font-bold tracking-widest mb-3 uppercase"
            style={{ color: isOverlay ? 'white' : eyebrowColor }}
          >
            {eyebrow}
          </span>
        )}
        <h2 
          className={`font-black leading-tight mb-4 ${colorClass}`}
          style={{ fontSize: `${titleSize}px`, color: isOverlay ? 'white' : titleColor }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className={`max-w-2xl text-lg mb-8 ${subColorClass}`}>
            {subtitle}
          </p>
        )}
        {ctaText && (
          <button className="px-8 py-3 bg-primary text-white rounded-full font-bold flex items-center gap-2 hover:gap-4 transition-all group">
            {ctaText}
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    );
  };

  const videoContainer = (
    <motion.div 
      className={`relative overflow-hidden group ${shadow ? 'shadow-2xl' : ''} ${maskClass}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        y,
        borderRadius: maskShape === 'circle' ? '50%' : `${radius}px`,
        paddingBottom: getAspectRatioPadding(aspectRatio),
        border: `1px solid ${borderColor}`
      }}
    >
      {/* Poster Overlay */}
      {(!autoplay && !isPlaying && !isLightboxOpen && (!hoverToPlay || !isHovered)) && (
        <div className="absolute inset-0 z-10">
          {posterUrl && (
            <img 
              src={posterUrl} 
              alt="Video Poster" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="absolute inset-0" style={{ backgroundColor: overlayColor }} />
          {renderPlayButton()}
        </div>
      )}

      {/* Actual Video */}
      {(autoplay || isPlaying || !useLightbox || (hoverToPlay && isHovered)) && renderVideo()}
    </motion.div>
  );

  if (layout === 'background') {
    return (
      <section 
        ref={containerRef}
        className="w-full relative overflow-hidden min-h-[600px] flex items-center justify-center py-20"
      >
        <div className="absolute inset-0 z-0">
          {renderVideo()}
          <div className="absolute inset-0" style={{ backgroundColor: overlayColor }} />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-8">
          <motion.div
            initial={entranceAnim ? { opacity: 0, y: 30 } : {}}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {renderTextContent(true)}
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section 
      ref={containerRef}
      className="w-full relative overflow-hidden @container"
      style={{ 
        backgroundColor: bgColor,
        paddingTop: `${paddingY}px`,
        paddingBottom: `${paddingY}px`
      }}
    >
      <div className="mx-auto px-8" style={{ maxWidth: layout === 'full' ? '100%' : `${maxWidth}px` }}>
        {layout === 'split' ? (
          <div className="grid grid-cols-1 @lg:grid-cols-2 gap-12 @md:gap-16 items-center">
            <motion.div
              initial={entranceAnim ? { opacity: 0, x: -30 } : {}}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              {renderTextContent()}
            </motion.div>
            <motion.div
              initial={entranceAnim ? { opacity: 0, x: 30 } : {}}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              {videoContainer}
            </motion.div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <motion.div
              initial={entranceAnim ? { opacity: 0, y: -30 } : {}}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="w-full"
            >
              {renderTextContent()}
            </motion.div>
            <motion.div
              initial={entranceAnim ? { opacity: 0, y: 30 } : {}}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="w-full"
            >
              {videoContainer}
            </motion.div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-12"
            onClick={() => setIsLightboxOpen(false)}
          >
            <button 
              className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-[110] bg-white/10 p-2 rounded-full backdrop-blur-md"
              onClick={() => setIsLightboxOpen(false)}
            >
              <X size={24} />
            </button>
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-6xl relative"
              style={{ paddingBottom: getAspectRatioPadding(aspectRatio) }}
              onClick={(e) => e.stopPropagation()}
            >
              {renderVideo(true)}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
