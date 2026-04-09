import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, X, Maximize2 } from 'lucide-react';

export const VideoModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any> 
}> = ({ moduleId, settingsValues }) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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
  const entranceAnim = getVal(null, 'entrance_anim', true);

  // Element: Video Player
  const videoUrl = getVal(`${moduleId}_el_video_player`, 'video_url', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const posterUrl = getVal(`${moduleId}_el_video_player`, 'poster_url', 'https://picsum.photos/seed/video/1280/720');
  const autoplay = getVal(`${moduleId}_el_video_player`, 'autoplay', false);
  const loop = getVal(`${moduleId}_el_video_player`, 'loop', true);
  const controls = getVal(`${moduleId}_el_video_player`, 'controls', true);
  const radius = getVal(`${moduleId}_el_video_player`, 'radius', 24);
  const shadow = getVal(`${moduleId}_el_video_player`, 'shadow', true);
  const useLightbox = getVal(`${moduleId}_el_video_player`, 'lightbox', false);
  const playButtonStyle = getVal(`${moduleId}_el_video_player`, 'play_button_style', 'pulse');

  // Element: Text
  const showText = getVal(`${moduleId}_el_video_text`, 'show_text', true);
  const title = getVal(`${moduleId}_el_video_text`, 'title', 'Descubre nuestra visión');
  const subtitle = getVal(`${moduleId}_el_video_text`, 'subtitle', 'Un recorrido visual por lo que nos hace únicos.');
  const textAlign = getVal(`${moduleId}_el_video_text`, 'align', 'center');
  const titleSize = getVal(`${moduleId}_el_video_text`, 'title_size', 32);

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
    const shouldAutoplay = forceAutoplay || autoplay;
    
    if (isYouTube) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      const id = (match && match[2].length === 11) ? match[2] : null;
      if (!id) return url;
      return `https://www.youtube.com/embed/${id}?autoplay=${shouldAutoplay ? 1 : 0}&loop=${loop ? 1 : 0}&controls=${controls ? 1 : 0}&mute=${shouldAutoplay ? 1 : 0}&playlist=${id}`;
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
          key={`${videoUrl}-${inLightbox || isPlaying}`}
          src={getEmbedUrl(videoUrl, inLightbox || isPlaying)}
          className="absolute inset-0 w-full h-full border-0"
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
        autoPlay={autoplay || isPlaying}
        loop={loop}
        muted={autoplay && !isPlaying}
        controls={controls}
        className="absolute inset-0 w-full h-full object-cover"
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

  const renderText = () => (
    <div className={`flex flex-col ${textAlign === 'center' ? 'items-center text-center' : 'items-start text-left'} mb-12`}>
      <h2 
        className="font-black text-slate-900 mb-4 leading-tight"
        style={{ fontSize: `${titleSize}px` }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="text-slate-500 max-w-2xl text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );

  const videoContainer = (
    <div 
      className={`relative overflow-hidden group ${shadow ? 'shadow-2xl' : ''}`}
      style={{ 
        borderRadius: `${radius}px`,
        paddingBottom: getAspectRatioPadding(aspectRatio)
      }}
    >
      {/* Poster Overlay (if not autoplaying and not playing) */}
      {!autoplay && !isPlaying && !isLightboxOpen && (
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

      {/* Actual Video (if not using lightbox or if autoplaying or if playing) */}
      {(autoplay || isPlaying || !useLightbox) && renderVideo()}
    </div>
  );

  return (
    <section 
      className="w-full relative overflow-hidden py-12 @md:py-20 @lg:py-24 @container"
      style={{ 
        backgroundColor: bgColor,
        paddingTop: `${paddingY}px`,
        paddingBottom: `${paddingY}px`
      }}
    >
      <div className="mx-auto px-8" style={{ maxWidth: layout === 'full' ? '100%' : `${maxWidth}px` }}>
        {layout === 'split' ? (
          <div className="grid grid-cols-1 @lg:grid-cols-2 gap-12 @md:gap-16 items-center">
            <div>
              {showText && (
                <div className={`flex flex-col ${textAlign === 'center' ? 'items-center text-center' : 'items-start text-left'} mb-12`}>
                  <h2 
                    className="font-black text-slate-900 mb-4 leading-tight text-3xl @md:text-4xl @lg:text-5xl"
                  >
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="text-slate-500 max-w-2xl text-lg">
                      {subtitle}
                    </p>
                  )}
                </div>
              )}
            </div>
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
            {showText && (
              <div className={`flex flex-col ${textAlign === 'center' ? 'items-center text-center' : 'items-start text-left'} mb-12`}>
                <h2 
                  className="font-black text-slate-900 mb-4 leading-tight text-3xl @md:text-4xl @lg:text-5xl"
                >
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-slate-500 max-w-2xl text-lg">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
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
              className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-[110]"
              onClick={() => setIsLightboxOpen(false)}
            >
              <X size={32} />
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
