import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, X, FileText } from 'lucide-react';
import { ModuleWrapper } from '../ui/ModuleWrapper';
import { Typography } from '../ui/Typography';

interface VideoModuleProps {
  data: any;
  onUpdate?: (data: any) => void;
}

export const VideoModule = ({ data, onUpdate }: VideoModuleProps) => {
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
    const base = "w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110";
    switch (playButtonStyle) {
      case 'outline': return `${base} border-2 border-white text-white hover:bg-white hover:text-primary`;
      case 'glass': return `${base} bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/30`;
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
            if (layoutType === 'popup') {
              setIsModalOpen(true);
            } else {
              setIsPlaying(true);
            }
          }}
        >
          <img 
            src={posterImage} 
            alt="Video Poster" 
            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          
          {showPlayButton && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className={getPlayButtonClass()}>
                <Play className="w-8 h-8 md:w-10 md:h-10 ml-1" fill="currentColor" />
              </div>
            </div>
          )}

          {showOverlay && (
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
              <Typography
                variant="h4"
                className="text-white font-bold text-xl mb-2"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('overlayTitle', text)}
              >
                {data?.overlayTitle || 'Video Promocional'}
              </Typography>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className={`relative w-full h-full bg-black overflow-hidden ${!isModal ? getMaskClass() : 'rounded-xl'}`}>
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
    if (layoutType === 'hero') {
      return (
        <div className="relative h-[80vh] w-full overflow-hidden">
          <div className="absolute inset-0">
            {renderVideoPlayer()}
          </div>
          <div className="absolute inset-0 bg-black/40 pointer-events-none flex items-center justify-center text-center p-8">
            <div className="max-w-4xl pointer-events-auto">
              <Typography
                variant="h1"
                className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('title', text)}
              >
                {data?.title || 'Mira nuestra presentación'}
              </Typography>
              <Typography
                variant="p"
                className="text-xl md:text-2xl text-white/90 mb-10 leading-relaxed"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('subtitle', text)}
              >
                {data?.subtitle || 'Descubre cómo transformamos negocios.'}
              </Typography>
              {data?.showCTA && (
                <a 
                  href={data?.ctaUrl || '#'}
                  onClick={(e) => {
                    if (onUpdate) e.preventDefault();
                  }}
                  className="inline-flex items-center px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:scale-105 cursor-pointer"
                >
                  <Typography
                    variant="span"
                    editable={!!onUpdate}
                    onUpdate={(text) => handleTextUpdate('ctaText', text)}
                  >
                    {data?.ctaText || 'Empezar Ahora'}
                  </Typography>
                </a>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (layoutType === 'split') {
      return (
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Typography
              variant="h2"
              className="text-4xl md:text-5xl font-black text-text mb-6 tracking-tight"
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate('title', text)}
            >
              {data?.title || 'Mira nuestra presentación'}
            </Typography>
            <Typography
              variant="p"
              className="text-xl text-text/60 mb-8 leading-relaxed"
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate('subtitle', text)}
            >
              {data?.subtitle || 'Descubre cómo transformamos negocios.'}
            </Typography>
            
            {data?.showTranscription && (
              <div className="mb-8">
                <button 
                  onClick={() => setShowTranscription(!showTranscription)}
                  className="flex items-center gap-2 text-primary font-bold hover:underline mb-4"
                >
                  <FileText className="w-4 h-4" />
                  {showTranscription ? 'Ocultar Transcripción' : 'Ver Transcripción'}
                </button>
                {showTranscription && (
                  <div className="p-6 bg-surface border border-text/10 rounded-xl text-text/70 text-sm leading-relaxed animate-in fade-in slide-in-from-top-2">
                    <Typography
                      variant="p"
                      editable={!!onUpdate}
                      onUpdate={(text) => handleTextUpdate('transcriptionText', text)}
                    >
                      {data?.transcriptionText || 'Aquí va la transcripción del video...'}
                    </Typography>
                  </div>
                )}
              </div>
            )}

            {data?.showCTA && (
              <a 
                href={data?.ctaUrl || '#'}
                onClick={(e) => {
                  if (onUpdate) e.preventDefault();
                }}
                className="inline-flex items-center px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg cursor-pointer"
              >
                <Typography
                  variant="span"
                  editable={!!onUpdate}
                  onUpdate={(text) => handleTextUpdate('ctaText', text)}
                >
                  {data?.ctaText || 'Empezar Ahora'}
                </Typography>
              </a>
            )}
          </div>
          <div className="aspect-video shadow-2xl rounded-[2rem]">
            {renderVideoPlayer()}
          </div>
        </div>
      );
    }

    // Classic & Popup
    return (
      <div className="max-w-5xl mx-auto text-center">
        <div className="mb-12">
          <Typography
            variant="h2"
            className="text-4xl md:text-5xl font-black text-text mb-4 tracking-tight"
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate('title', text)}
          >
            {data?.title || 'Mira nuestra presentación'}
          </Typography>
          <Typography
            variant="p"
            className="text-xl text-text/60 max-w-2xl mx-auto"
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate('subtitle', text)}
          >
            {data?.subtitle || 'Descubre cómo transformamos negocios.'}
          </Typography>
        </div>

        <div className={`aspect-video shadow-2xl mx-auto ${layoutType === 'popup' ? 'max-w-3xl' : 'w-full'}`}>
          {renderVideoPlayer()}
        </div>

        {data?.showTranscription && (
          <div className="mt-8 text-left max-w-3xl mx-auto">
            <button 
              onClick={() => setShowTranscription(!showTranscription)}
              className="flex items-center gap-2 text-primary font-bold hover:underline mb-4 mx-auto"
            >
              <FileText className="w-4 h-4" />
              {showTranscription ? 'Ocultar Transcripción' : 'Ver Transcripción'}
            </button>
            {showTranscription && (
              <div className="p-6 bg-surface border border-text/10 rounded-xl text-text/70 text-sm leading-relaxed animate-in fade-in slide-in-from-top-2">
                <Typography
                  variant="p"
                  editable={!!onUpdate}
                  onUpdate={(text) => handleTextUpdate('transcriptionText', text)}
                >
                  {data?.transcriptionText || 'Aquí va la transcripción del video...'}
                </Typography>
              </div>
            )}
          </div>
        )}

        {data?.showCTA && (
          <div className="mt-12">
            <a 
              href={data?.ctaUrl || '#'}
              onClick={(e) => {
                if (onUpdate) e.preventDefault();
              }}
              className="inline-flex items-center px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:scale-105 cursor-pointer"
            >
              <Typography
                variant="span"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('ctaText', text)}
              >
                {data?.ctaText || 'Empezar Ahora'}
              </Typography>
            </a>
          </div>
        )}
      </div>
    );
  };

  return (
    <ModuleWrapper 
      theme={data?.theme}
      background={data?.background}
    >
      {renderContent()}

      {/* Modal for Popup Layout */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
          <button 
            onClick={() => setIsModalOpen(false)}
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="w-full max-w-6xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
            {renderVideoPlayer(true)}
          </div>
        </div>
      )}
    </ModuleWrapper>
  );
};
