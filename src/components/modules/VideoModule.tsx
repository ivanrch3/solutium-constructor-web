import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, X, FileText } from 'lucide-react';
import { ModuleWrapper } from '../ui/ModuleWrapper';
import { Typography } from '../ui/Typography';
import { usePageLayout } from '../../context/PageLayoutContext';

interface VideoModuleProps {
  data: any;
  onUpdate?: (data: any) => void;
}

export const VideoModule = ({ data, onUpdate }: VideoModuleProps) => {
  const { previewDevice } = usePageLayout();
  const is_mobile_simulated = previewDevice === 'mobile';
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(data?.muted || false);
  const [show_transcription, setShowTranscription] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const layout_type = data?.layout_type || 'classic';
  const video_type = data?.video_type || 'youtube';
  const video_url = data?.video_url || '';
  const poster_image = data?.poster_image || '';
  const show_controls = data?.show_controls !== false;
  const show_overlay = data?.show_overlay !== false;
  const show_play_button = data?.show_play_button !== false;
  const play_button_style = data?.play_button_style || 'solid';
  const mask_shape = data?.mask_shape || 'none';

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

  const get_embed_url = (url: string, type: string) => {
    if (!url) return '';
    if (type === 'youtube') {
      const videoId = url.includes('v=') ? url.split('v=')[1] : url.split('/').pop();
      return `https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}&mute=${isMuted ? 1 : 0}&controls=${show_controls ? 1 : 0}&loop=${data?.loop ? 1 : 0}`;
    }
    if (type === 'vimeo') {
      const videoId = url.split('/').pop();
      return `https://player.vimeo.com/video/${videoId}?autoplay=${isPlaying ? 1 : 0}&muted=${isMuted ? 1 : 0}&loop=${data?.loop ? 1 : 0}`;
    }
    return url;
  };

  const get_mask_class = () => {
    switch (mask_shape) {
      case 'circle': return 'rounded-full aspect-square';
      case 'rounded': return 'rounded-[3rem]';
      case 'blob': return 'rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%]';
      case 'none':
      default: return 'rounded-2xl';
    }
  };

  const get_play_button_class = () => {
    const base = `w-16 h-16 ${is_mobile_simulated ? '' : 'md:w-24 md:h-24'} rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110`;
    switch (play_button_style) {
      case 'outline': return `${base} border-2 border-white text-white hover:bg-white hover:text-primary`;
      case 'glass': return `${base} bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/30`;
      case 'solid':
      default: return `${base} bg-primary text-white shadow-2xl shadow-primary/40`;
    }
  };

  const renderVideoPlayer = (isModal = false) => {
    const embed_url = get_embed_url(video_url, video_type);

    if (!isPlaying && !isModal && poster_image) {
      return (
        <div 
          className={`relative w-full h-full bg-black cursor-pointer group overflow-hidden ${get_mask_class()}`}
          onClick={() => {
            if (layout_type === 'popup') {
              setIsModalOpen(true);
            } else {
              setIsPlaying(true);
            }
          }}
        >
          <img 
            src={poster_image} 
            alt="Video Poster" 
            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          
          {show_play_button && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className={get_play_button_class()}>
                <Play className={`${is_mobile_simulated ? 'w-6 h-6' : 'w-8 h-8 md:w-10 md:h-10'} ml-1`} fill="currentColor" />
              </div>
            </div>
          )}

          {show_overlay && (
            <div className={`absolute bottom-0 left-0 right-0 ${is_mobile_simulated ? 'p-4' : 'p-8'} bg-gradient-to-t from-black/80 to-transparent`}>
              <Typography
                variant="h4"
                className={`text-white font-bold ${is_mobile_simulated ? 'text-lg' : 'text-xl'} mb-2`}
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('overlay_title', text)}
              >
                {data?.overlay_title || 'Video Promocional'}
              </Typography>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className={`relative w-full h-full bg-black overflow-hidden ${!isModal ? get_mask_class() : 'rounded-xl'}`}>
        {video_type === 'custom' ? (
          <video
            src={video_url}
            className="w-full h-full object-cover"
            controls={show_controls}
            autoPlay={isPlaying || isModal}
            muted={isMuted}
            loop={data?.loop}
          />
        ) : (
          <iframe
            src={embed_url}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (layout_type === 'hero') {
      return (
        <div className={`relative ${is_mobile_simulated ? 'h-[50vh]' : 'h-[80vh]'} w-full overflow-hidden`}>
          <div className="absolute inset-0">
            {renderVideoPlayer()}
          </div>
          <div className="absolute inset-0 bg-black/40 pointer-events-none flex items-center justify-center text-center p-6 md:p-8">
            <div className="max-w-4xl pointer-events-auto">
              <Typography
                variant="h1"
                className={`${is_mobile_simulated ? 'text-4xl' : 'text-5xl md:text-7xl'} font-black text-white mb-6 tracking-tight`}
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('title', text)}
              >
                {data?.title || 'Mira nuestra presentación'}
              </Typography>
              <Typography
                variant="p"
                className={`${is_mobile_simulated ? 'text-lg' : 'text-xl md:text-2xl'} text-white/90 mb-10 leading-relaxed`}
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('subtitle', text)}
              >
                {data?.subtitle || 'Descubre cómo transformamos negocios.'}
              </Typography>
              {data?.show_cta && (
                <a 
                  href={data?.cta_url || '#'}
                  onClick={(e) => {
                    if (onUpdate) e.preventDefault();
                  }}
                  className="inline-flex items-center px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:scale-105 cursor-pointer"
                >
                  <Typography
                    variant="span"
                    editable={!!onUpdate}
                    onUpdate={(text) => handleTextUpdate('cta_text', text)}
                  >
                    {data?.cta_text || 'Empezar Ahora'}
                  </Typography>
                </a>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (layout_type === 'split') {
      return (
        <div className={`grid ${is_mobile_simulated ? 'grid-cols-1' : 'lg:grid-cols-2'} gap-12 items-center`}>
          <div className={is_mobile_simulated ? 'text-center' : ''}>
            <Typography
              variant="h2"
              className={`${is_mobile_simulated ? 'text-3xl' : 'text-4xl md:text-5xl'} font-black text-text mb-6 tracking-tight`}
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate('title', text)}
            >
              {data?.title || 'Mira nuestra presentación'}
            </Typography>
            <Typography
              variant="p"
              className={`${is_mobile_simulated ? 'text-lg' : 'text-xl'} text-text/60 mb-8 leading-relaxed`}
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate('subtitle', text)}
            >
              {data?.subtitle || 'Descubre cómo transformamos negocios.'}
            </Typography>
            
            {data?.show_transcription && (
              <div className="mb-8">
                <button 
                  onClick={() => setShowTranscription(!show_transcription)}
                  className={`flex items-center gap-2 text-primary font-bold hover:underline mb-4 ${is_mobile_simulated ? 'mx-auto' : ''}`}
                >
                  <FileText className="w-4 h-4" />
                  {show_transcription ? 'Ocultar Transcripción' : 'Ver Transcripción'}
                </button>
                {show_transcription && (
                  <div className="p-6 bg-surface border border-text/10 rounded-xl text-text/70 text-sm leading-relaxed animate-in fade-in slide-in-from-top-2">
                    <Typography
                      variant="p"
                      editable={!!onUpdate}
                      onUpdate={(text) => handleTextUpdate('transcription_text', text)}
                    >
                      {data?.transcription_text || 'Aquí va la transcripción del video...'}
                    </Typography>
                  </div>
                )}
              </div>
            )}

            {data?.show_cta && (
              <a 
                href={data?.cta_url || '#'}
                onClick={(e) => {
                  if (onUpdate) e.preventDefault();
                }}
                className="inline-flex items-center px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg cursor-pointer"
              >
                <Typography
                  variant="span"
                  editable={!!onUpdate}
                  onUpdate={(text) => handleTextUpdate('cta_text', text)}
                >
                  {data?.cta_text || 'Empezar Ahora'}
                </Typography>
              </a>
            )}
          </div>
          <div className={`aspect-video shadow-2xl ${is_mobile_simulated ? 'rounded-2xl' : 'rounded-[2rem]'}`}>
            {renderVideoPlayer()}
          </div>
        </div>
      );
    }

    // Classic & Popup
    return (
      <div className="max-w-5xl mx-auto text-center">
        <div className={is_mobile_simulated ? 'mb-8' : 'mb-12'}>
          <Typography
            variant="h2"
            className={`${is_mobile_simulated ? 'text-3xl' : 'text-4xl md:text-5xl'} font-black text-text mb-4 tracking-tight`}
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate('title', text)}
          >
            {data?.title || 'Mira nuestra presentación'}
          </Typography>
          <Typography
            variant="p"
            className={`${is_mobile_simulated ? 'text-lg' : 'text-xl'} text-text/60 max-w-2xl mx-auto`}
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate('subtitle', text)}
          >
            {data?.subtitle || 'Descubre cómo transformamos negocios.'}
          </Typography>
        </div>

        <div className={`aspect-video shadow-2xl mx-auto ${layout_type === 'popup' ? 'max-w-3xl' : 'w-full'}`}>
          {renderVideoPlayer()}
        </div>

        {data?.show_transcription && (
          <div className="mt-8 text-left max-w-3xl mx-auto">
            <button 
              onClick={() => setShowTranscription(!show_transcription)}
              className="flex items-center gap-2 text-primary font-bold hover:underline mb-4 mx-auto"
            >
              <FileText className="w-4 h-4" />
              {show_transcription ? 'Ocultar Transcripción' : 'Ver Transcripción'}
            </button>
            {show_transcription && (
              <div className="p-6 bg-surface border border-text/10 rounded-xl text-text/70 text-sm leading-relaxed animate-in fade-in slide-in-from-top-2">
                <Typography
                  variant="p"
                  editable={!!onUpdate}
                  onUpdate={(text) => handleTextUpdate('transcription_text', text)}
                >
                  {data?.transcription_text || 'Aquí va la transcripción del video...'}
                </Typography>
              </div>
            )}
          </div>
        )}

        {data?.show_cta && (
          <div className={is_mobile_simulated ? 'mt-8' : 'mt-12'}>
            <a 
              href={data?.cta_url || '#'}
              onClick={(e) => {
                if (onUpdate) e.preventDefault();
              }}
              className="inline-flex items-center px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:scale-105 cursor-pointer"
            >
              <Typography
                variant="span"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('cta_text', text)}
              >
                {data?.cta_text || 'Empezar Ahora'}
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
