import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, X, FileText, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ModuleWrapper } from '../ui/ModuleWrapper';
import { Typography } from '../ui/Typography';
import { usePageLayout } from '../../context/PageLayoutContext';

interface VideoModuleProps {
  data: any;
  onUpdate?: (data: any) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.215, 0.61, 0.355, 1] }
  }
};

export const VideoModule = ({ data, onUpdate }: VideoModuleProps) => {
  const { previewDevice } = usePageLayout();
  const isMobileSimulated = previewDevice === 'mobile';
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(data?.muted || false);
  const [showTranscription, setShowTranscription] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const layoutType = data?.layoutType || 'classic';
  const videoType = data?.videoType || 'youtube';
  const videoUrl = data?.videoUrl || '';
  const posterImage = data?.posterImage || '';
  const showControls = data?.showControls !== false;
  const showOverlay = data?.showOverlay !== false;
  const showPlayButton = data?.showPlayButton !== false;
  const playButtonStyle = data?.playButtonStyle || 'solid';
  const maskShape = data?.maskShape || 'none';
  const entranceAnimation = data?.entranceAnimation || 'fade';
  const smartMode = data?.smartMode || false;

  const effectiveLayout = smartMode 
    ? (isMobileSimulated ? 'classic' : 'hero')
    : layoutType;

  const getAnimationVariants = (idx: number) => {
    switch (entranceAnimation) {
      case 'slide':
        return {
          hidden: { opacity: 0, x: -30 },
          visible: { 
            opacity: 1, 
            x: 0,
            transition: { duration: 0.6, delay: idx * 0.1 }
          }
        };
      case 'zoom':
        return {
          hidden: { opacity: 0, scale: 0.8 },
          visible: { 
            opacity: 1, 
            scale: 1,
            transition: { duration: 0.8, delay: idx * 0.1 }
          }
        };
      default: // fade
        return {
          hidden: { opacity: 0, y: 20 },
          visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.7, delay: idx * 0.1 }
          }
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

  const getEmbedUrl = (url: string, type: string) => {
    if (!url) return '';
    if (type === 'youtube') {
      const videoId = url.includes('v=') ? url.split('v=')[1] : url.split('/').pop();
      return `https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}&mute=${isMuted ? 1 : 0}&controls=${showControls ? 1 : 0}&loop=${data?.loop ? 1 : 0}`;
    }
    if (type === 'vimeo') {
      const videoId = url.split('/').pop();
      return `https://player.vimeo.com/video/${videoId}?autoplay=${isPlaying ? 1 : 0}&muted=${isMuted ? 1 : 0}&loop=${data?.loop ? 1 : 0}`;
    }
    return url;
  };

  const getMaskClass = () => {
    switch (maskShape) {
      case 'circle': return 'rounded-full aspect-square';
      case 'rounded': return 'rounded-[3rem]';
      case 'blob': return 'rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%]';
      case 'none':
      default: return 'rounded-2xl';
    }
  };

  const getPlayButtonClass = () => {
    const base = `w-16 h-16 ${isMobileSimulated ? '' : 'md:w-28 md:h-28'} rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110 relative overflow-hidden`;
    switch (playButtonStyle) {
      case 'outline': return `${base} border-2 border-white text-white hover:bg-white hover:text-primary`;
      case 'glass': return `${base} bg-white/10 backdrop-blur-xl text-white border border-white/20 hover:bg-white/20`;
      case 'solid':
      default: return `${base} bg-primary text-white shadow-2xl shadow-primary/40`;
    }
  };

  const renderVideoPlayer = (isModal = false) => {
    const embedUrl = getEmbedUrl(videoUrl, videoType);

    if (!isPlaying && !isModal && posterImage) {
      return (
        <div 
          className={`relative w-full h-full bg-black cursor-pointer group overflow-hidden ${getMaskClass()}`}
          onClick={() => {
            if (effectiveLayout === 'popup') {
              setIsModalOpen(true);
            } else {
              setIsPlaying(true);
            }
          }}
        >
          <img 
            src={posterImage} 
            alt="Video Poster" 
            className="w-full h-full object-cover opacity-70 group-hover:scale-110 transition-transform duration-1000 ease-out"
            referrerPolicy="no-referrer"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {showPlayButton && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <motion.div 
                className={getPlayButtonClass()}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
                <Play className={`${isMobileSimulated ? 'w-6 h-6' : 'w-10 h-10 md:w-12 md:h-12'} ml-1 relative z-10`} fill="currentColor" />
              </motion.div>
              
              {/* Ripple Effect */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-24 h-24 md:w-40 md:h-40 rounded-full border border-white/20 animate-ping opacity-20" />
                <div className="absolute w-32 h-32 md:w-56 md:h-56 rounded-full border border-white/10 animate-ping opacity-10 [animation-delay:0.5s]" />
              </div>
            </div>
          )}

          {showOverlay && (
            <div className={`absolute bottom-0 left-0 right-0 ${isMobileSimulated ? 'p-6' : 'p-10'} bg-gradient-to-t from-black/90 to-transparent`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Typography
                  variant="h4"
                  className={`text-white font-black ${isMobileSimulated ? 'text-xl' : 'text-2xl'} mb-2 tracking-tight`}
                  editable={!!onUpdate}
                  onUpdate={(text) => handleTextUpdate('overlayTitle', text)}
                >
                  {data?.overlayTitle || 'Video Promocional'}
                </Typography>
                <div className="flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-widest">
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span>Click para reproducir</span>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className={`relative w-full h-full bg-black overflow-hidden ${!isModal ? getMaskClass() : 'rounded-2xl shadow-2xl'}`}>
        {videoType === 'custom' ? (
          <video
            src={videoUrl}
            className="w-full h-full object-cover"
            controls={showControls}
            autoPlay={isPlaying || isModal}
            muted={isMuted}
            loop={data?.loop}
          />
        ) : (
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (effectiveLayout === 'hero') {
      return (
        <div className={`relative ${isMobileSimulated ? 'h-[60vh]' : 'h-[90vh]'} w-full overflow-hidden -mx-4 md:-mx-8 lg:-mx-12`}>
          <div className="absolute inset-0">
            {renderVideoPlayer()}
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80 pointer-events-none flex items-center justify-center text-center p-6 md:p-12">
            <motion.div 
              className="max-w-5xl pointer-events-auto"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div variants={getAnimationVariants(0)} className="flex items-center justify-center gap-2 mb-6">
                <div className="w-12 h-[1px] bg-primary" />
                <span className="text-primary font-black tracking-[0.4em] uppercase text-[10px]">Presentación</span>
                <div className="w-12 h-[1px] bg-primary" />
              </motion.div>
              <Typography
                variant="h1"
                className={`${isMobileSimulated ? 'text-4xl' : 'text-6xl md:text-8xl'} font-black text-white mb-8 tracking-tighter leading-[0.85]`}
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('title', text)}
              >
                {data?.title || 'Mira nuestra presentación'}
              </Typography>
              <Typography
                variant="p"
                className={`${isMobileSimulated ? 'text-lg' : 'text-xl md:text-3xl'} text-white/80 mb-12 leading-tight font-medium max-w-3xl mx-auto`}
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('subtitle', text)}
              >
                {data?.subtitle || 'Descubre cómo transformamos negocios.'}
              </Typography>
              {data?.showCta && (
                <motion.a 
                  variants={getAnimationVariants(1)}
                  href={data?.ctaUrl || '#'}
                  onClick={(e) => {
                    if (onUpdate) e.preventDefault();
                  }}
                  className="inline-flex items-center gap-3 px-10 py-5 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-full hover:bg-primary/90 transition-all shadow-2xl shadow-primary/40 hover:scale-105 cursor-pointer"
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Typography
                    variant="span"
                    editable={!!onUpdate}
                    onUpdate={(text) => handleTextUpdate('ctaText', text)}
                  >
                    {data?.ctaText || 'Empezar Ahora'}
                  </Typography>
                  <ArrowRight className="w-4 h-4" />
                </motion.a>
              )}
            </motion.div>
          </div>
        </div>
      );
    }

    if (effectiveLayout === 'split') {
      return (
        <motion.div 
          className={`grid ${isMobileSimulated ? 'grid-cols-1' : 'lg:grid-cols-2'} gap-16 lg:gap-24 items-center`}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className={isMobileSimulated ? 'text-center' : ''}>
            <motion.div variants={getAnimationVariants(0)} className="flex items-center gap-2 mb-6 justify-center lg:justify-start">
              <div className="w-8 h-[1px] bg-primary" />
              <span className="text-primary font-black tracking-[0.3em] uppercase text-[10px]">Video</span>
            </motion.div>
            <Typography
              variant="h2"
              className={`${isMobileSimulated ? 'text-4xl' : 'text-5xl md:text-6xl'} font-black text-text mb-8 tracking-tight leading-[0.9]`}
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate('title', text)}
            >
              {data?.title || 'Mira nuestra presentación'}
            </Typography>
            <Typography
              variant="p"
              className={`${isMobileSimulated ? 'text-lg' : 'text-xl'} text-text/60 mb-10 leading-relaxed font-medium`}
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate('subtitle', text)}
            >
              {data?.subtitle || 'Descubre cómo transformamos negocios.'}
            </Typography>
            
            {data?.showTranscription && (
              <motion.div variants={getAnimationVariants(1)} className="mb-10">
                <button 
                  onClick={() => setShowTranscription(!showTranscription)}
                  className={`flex items-center gap-3 text-text font-black uppercase tracking-widest text-[10px] hover:text-primary transition-colors mb-4 ${isMobileSimulated ? 'mx-auto' : ''}`}
                >
                  <div className="w-8 h-8 rounded-full bg-surface border border-text/10 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  {showTranscription ? 'Ocultar Transcripción' : 'Ver Transcripción'}
                </button>
                <AnimatePresence>
                  {showTranscription && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-8 bg-surface/50 backdrop-blur-sm border border-text/5 rounded-2xl text-text/70 text-sm leading-relaxed font-medium">
                        <Typography
                          variant="p"
                          editable={!!onUpdate}
                          onUpdate={(text) => handleTextUpdate('transcriptionText', text)}
                        >
                          {data?.transcriptionText || 'Aquí va la transcripción del video...'}
                        </Typography>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {data?.showCta && (
              <motion.a 
                variants={getAnimationVariants(2)}
                href={data?.ctaUrl || '#'}
                onClick={(e) => {
                  if (onUpdate) e.preventDefault();
                }}
                className="inline-flex items-center gap-3 px-10 py-5 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-full hover:bg-primary/90 transition-all shadow-2xl shadow-primary/40 cursor-pointer"
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Typography
                  variant="span"
                  editable={!!onUpdate}
                  onUpdate={(text) => handleTextUpdate('ctaText', text)}
                >
                  {data?.ctaText || 'Empezar Ahora'}
                </Typography>
                <ArrowRight className="w-4 h-4" />
              </motion.a>
            )}
          </div>
          <motion.div 
            variants={getAnimationVariants(3)}
            className={`aspect-video shadow-2xl ${isMobileSimulated ? 'rounded-2xl' : 'rounded-[2.5rem]'} relative group`}
          >
            <div className="absolute -inset-4 bg-primary/5 rounded-[3rem] blur-2xl group-hover:bg-primary/10 transition-colors duration-500" />
            <div className="relative h-full w-full">
              {renderVideoPlayer()}
            </div>
          </motion.div>
        </motion.div>
      );
    }

    // Classic & Popup
    return (
      <motion.div 
        className="max-w-6xl mx-auto text-center"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className={isMobileSimulated ? 'mb-12' : 'mb-20'}>
          <motion.div variants={getAnimationVariants(0)} className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-[1px] bg-primary" />
            <span className="text-primary font-black tracking-[0.3em] uppercase text-[10px]">Video</span>
            <div className="w-8 h-[1px] bg-primary" />
          </motion.div>
          <Typography
            variant="h2"
            className={`${isMobileSimulated ? 'text-4xl' : 'text-5xl md:text-7xl'} font-black text-text mb-6 tracking-tight leading-[0.9]`}
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate('title', text)}
          >
            {data?.title || 'Mira nuestra presentación'}
          </Typography>
          <Typography
            variant="p"
            className={`${isMobileSimulated ? 'text-lg' : 'text-xl md:text-2xl'} text-text/60 max-w-3xl mx-auto font-medium`}
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate('subtitle', text)}
          >
            {data?.subtitle || 'Descubre cómo transformamos negocios.'}
          </Typography>
        </div>

        <motion.div 
          variants={getAnimationVariants(1)}
          className={`aspect-video shadow-2xl mx-auto ${effectiveLayout === 'popup' ? 'max-w-4xl' : 'w-full'} relative group`}
        >
          <div className="absolute -inset-6 bg-primary/5 rounded-[3rem] blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />
          <div className="relative h-full w-full">
            {renderVideoPlayer()}
          </div>
        </motion.div>

        {data?.showTranscription && (
          <motion.div variants={getAnimationVariants(2)} className="mt-12 text-left max-w-4xl mx-auto">
            <button 
              onClick={() => setShowTranscription(!showTranscription)}
              className="flex items-center gap-3 text-text font-black uppercase tracking-widest text-[10px] hover:text-primary transition-colors mb-4 mx-auto"
            >
              <div className="w-8 h-8 rounded-full bg-surface border border-text/10 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              {showTranscription ? 'Ocultar Transcripción' : 'Ver Transcripción'}
            </button>
            <AnimatePresence>
              {showTranscription && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-10 bg-surface/50 backdrop-blur-sm border border-text/5 rounded-3xl text-text/70 text-base leading-relaxed font-medium">
                    <Typography
                      variant="p"
                      editable={!!onUpdate}
                      onUpdate={(text) => handleTextUpdate('transcriptionText', text)}
                    >
                      {data?.transcriptionText || 'Aquí va la transcripción del video...'}
                    </Typography>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {data?.showCta && (
          <motion.div variants={getAnimationVariants(3)} className={isMobileSimulated ? 'mt-12' : 'mt-20'}>
            <motion.a 
              href={data?.ctaUrl || '#'}
              onClick={(e) => {
                if (onUpdate) e.preventDefault();
              }}
              className="inline-flex items-center gap-3 px-12 py-6 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-full hover:bg-primary/90 transition-all shadow-2xl shadow-primary/40 hover:scale-105 cursor-pointer"
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Typography
                variant="span"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('ctaText', text)}
              >
                {data?.ctaText || 'Empezar Ahora'}
              </Typography>
              <ArrowRight className="w-4 h-4" />
            </motion.a>
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <ModuleWrapper 
      theme={data?.theme}
      background={data?.background}
    >
      {renderContent()}

      {/* Modal for Popup Layout */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12"
          >
            <motion.button 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute top-8 right-8 w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-[110]"
              whileHover={{ rotate: 90 }}
            >
              <X className="w-8 h-8" />
            </motion.button>
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-7xl aspect-video bg-black rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10"
            >
              {renderVideoPlayer(true)}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ModuleWrapper>
  );
};
