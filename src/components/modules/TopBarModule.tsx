import React, { useState, useContext, useEffect } from 'react';
import { Mail, Phone, Facebook, Twitter, Instagram, Linkedin, Youtube, Megaphone, Zap, Gift, Truck, Star, X } from 'lucide-react';
import { Typography } from '../ui/Typography';
import { SolutiumContext } from '../../context/SatelliteContext';
import { usePageLayout } from '../../context/PageLayoutContext';

const ICONS: Record<string, React.ElementType> = {
  Megaphone,
  Zap,
  Gift,
  Truck,
  Star
};

export const TopBarModule = ({ data, isPreview, onUpdate }: { data: any, isPreview?: boolean, onUpdate?: (data: any) => void }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const satellite = useContext(SolutiumContext);
  const { previewDevice, pageLayout } = usePageLayout();
  const isMobileSimulated = previewDevice === 'mobile';

  const advancedMode = data?.advancedMode || 'none';
  const timerData = data?.timer || { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const carouselData = data?.carousel || ['Mensaje 1'];
  const isSeamless = pageLayout === 'seamless';
 
  useEffect(() => {
    if (advancedMode === 'carousel' && carouselData.length > 1) {
      const interval = setInterval(() => {
        setCurrentCarouselIndex((prev) => (prev + 1) % carouselData.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [advancedMode, carouselData.length]);
 
  useEffect(() => {
    if (advancedMode === 'timer') {
      // Calculate target date based on timerData initially
      const target = new Date();
      target.setDate(target.getDate() + (timerData.days || 0));
      target.setHours(target.getHours() + (timerData.hours || 0));
      target.setMinutes(target.getMinutes() + (timerData.minutes || 0));
      target.setSeconds(target.getSeconds() + (timerData.seconds || 0));
 
      const interval = setInterval(() => {
        const now = new Date();
        const difference = target.getTime() - now.getTime();
 
        if (difference <= 0) {
          clearInterval(interval);
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        } else {
          setTimeLeft({
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60)
          });
        }
      }, 1000);
 
      // Initial set
      setTimeLeft({
        days: timerData.days || 0,
        hours: timerData.hours || 0,
        minutes: timerData.minutes || 0,
        seconds: timerData.seconds || 0
      });
 
      return () => clearInterval(interval);
    }
  }, [advancedMode, timerData.days, timerData.hours, timerData.minutes, timerData.seconds]);

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

  if (!isVisible) return null;

  const SelectedIcon = data?.icon && data.icon !== 'none' ? ICONS[data.icon] : null;

  const paddingClass = {
    thin: 'py-1',
    normal: 'py-2',
    thick: 'py-3'
  }[data?.padding || 'normal'];

  const visibilityClass = {
    all: 'flex',
    desktop: isMobileSimulated ? 'hidden' : 'hidden md:flex',
    mobile: isMobileSimulated ? 'flex' : 'flex md:hidden'
  }[data?.visibility || 'all'];

  const shapeClass = isSeamless ? 'w-full rounded-none' : {
    'bottom-rounded': 'w-full rounded-b-[2.5rem]',
    'top-rounded': 'w-full rounded-t-[2.5rem]',
    'pill': isMobileSimulated ? 'w-[calc(100%-1rem)] rounded-full mx-auto mt-2' : 'w-[calc(100%-2rem)] rounded-full mx-auto mt-2',
    'square': 'w-full rounded-none',
    'slightly-rounded': 'w-[calc(100%-1rem)] rounded-lg mx-auto mt-2'
  }[data?.shape || 'bottom-rounded'];

  const currentTheme = data?.theme || 'dark';
  const themeBg = currentTheme === 'dark' ? 'rgb(var(--color-primary-rgb))' : '#ffffff';
  const themeText = currentTheme === 'dark' ? '#ffffff' : 'rgb(var(--color-primary-rgb))';
  const bgColor = data?.backgroundColor || themeBg;
  const textColor = data?.textColor || themeText;

  const socials = data?.socials || { useProjectSocials: true };
  const isUsingProject = socials.useProjectSocials !== false;
  const projectSocials = satellite?.payload?.projectsData?.socials || satellite?.payload?.projectData?.socials || {};
  const currentSocials = isUsingProject ? projectSocials : socials;

  return (
    <div 
      className={`${paddingClass} px-6 ${shapeClass} flex-col ${isMobileSimulated ? 'flex' : 'sm:flex-row'} items-center justify-between gap-2 text-[11px] font-medium transition-colors ${visibilityClass}`}
      style={{ 
        backgroundColor: bgColor,
        color: textColor
      }}
    >
      <div className={`flex items-center gap-4 ${isMobileSimulated ? 'order-2' : ''}`}>
        {data?.email && (
          <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
            <Mail className="w-3 h-3" />
            <Typography
              variant="span"
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate('email', text)}
            >
              {data.email}
            </Typography>
          </div>
        )}
        {data?.phone && (
          <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
            <Phone className="w-3 h-3" />
            <Typography
              variant="span"
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate('phone', text)}
            >
              {data.phone}
            </Typography>
          </div>
        )}
      </div>
      
      <div className={`flex items-center justify-center gap-3 flex-1 ${isMobileSimulated ? 'order-1' : ''}`}>
        {advancedMode === 'carousel' ? (
          <div className={`flex items-center justify-center gap-2 overflow-hidden relative h-6 w-full ${isMobileSimulated ? 'max-w-[200px]' : 'max-w-md'}`}>
            {carouselData.map((msg: string, idx: number) => (
              <div
                key={idx}
                className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
                  idx === currentCarouselIndex ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
                }`}
              >
                {SelectedIcon && <SelectedIcon className="w-4 h-4 mr-2 animate-pulse" />}
                <span className="inline-block">
                  <Typography
                    variant="span"
                    align={data?.messageStyle?.align}
                    weight={data?.messageStyle?.weight}
                    className={data?.messageStyle?.size === 'small' ? 'text-xs' : (data?.messageStyle?.size === 'large' ? 'text-sm' : 'text-[11px]')}
                    editable={!!onUpdate && idx === currentCarouselIndex}
                    onUpdate={(text) => handleTextUpdate(`carousel.${idx}`, text)}
                  >
                    {typeof msg === 'string' ? msg : (msg as any).text}
                  </Typography>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <>
            {SelectedIcon && <SelectedIcon className="w-4 h-4 animate-pulse" />}
            {data?.message && (
              <span className="inline-block">
                <Typography
                  variant="span"
                  align={data?.messageStyle?.align}
                  weight={data?.messageStyle?.weight}
                  className={data?.messageStyle?.size === 'small' ? 'text-xs' : (data?.messageStyle?.size === 'large' ? 'text-sm' : 'text-[11px]')}
                  editable={!!onUpdate}
                  onUpdate={(text) => handleTextUpdate('message', text)}
                >
                  {data.message}
                </Typography>
              </span>
            )}
            {advancedMode === 'timer' && (
              <div className="flex items-center gap-1 ml-2 font-mono bg-black/10 px-2 py-1 rounded-md">
                <span className="font-bold">{String(timeLeft.days).padStart(2, '0')}</span>d :
                <span className="font-bold ml-1">{String(timeLeft.hours).padStart(2, '0')}</span>h :
                <span className="font-bold ml-1">{String(timeLeft.minutes).padStart(2, '0')}</span>m :
                <span className="font-bold ml-1">{String(timeLeft.seconds).padStart(2, '0')}</span>s
              </div>
            )}
          </>
        )}
        
        {data?.link?.text && data?.link?.url && (
          <a 
            href={data.link.url}
            target={data.link.target || '_self'}
            className="ml-2 px-3 py-1 hover:opacity-90 rounded-full transition-all text-xs font-bold shadow-sm"
            style={{
              backgroundColor: data.link.color || 'var(--color-primary)',
              color: '#ffffff'
            }}
            onClick={(e) => {
              if (!isPreview) e.preventDefault();
            }}
          >
            {data.link.text}
          </a>
        )}
      </div>

      <div className={`flex items-center gap-4 ${isMobileSimulated ? 'order-3' : ''}`}>
        {data?.showSocial !== false && (
          <div className="flex items-center gap-3">
            {currentSocials.facebook && (
              <a href={currentSocials.facebook} target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-all">
                <Facebook className="w-3 h-3" />
              </a>
            )}
            {currentSocials.twitter && (
              <a href={currentSocials.twitter} target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-all">
                <Twitter className="w-3 h-3" />
              </a>
            )}
            {currentSocials.instagram && (
              <a href={currentSocials.instagram} target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-all">
                <Instagram className="w-3 h-3" />
              </a>
            )}
            {currentSocials.linkedin && (
              <a href={currentSocials.linkedin} target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-all">
                <Linkedin className="w-3 h-3" />
              </a>
            )}
            {currentSocials.youtube && (
              <a href={currentSocials.youtube} target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-all">
                <Youtube className="w-3 h-3" />
              </a>
            )}
            {/* Fallback if no socials are defined anywhere but showSocial is true */}
            {!currentSocials.facebook && !currentSocials.twitter && !currentSocials.instagram && !currentSocials.linkedin && !currentSocials.youtube && (
              <>
                <Facebook className="w-3 h-3 opacity-60 hover:opacity-100 cursor-pointer transition-all" />
                <Twitter className="w-3 h-3 opacity-60 hover:opacity-100 cursor-pointer transition-all" />
                <Instagram className="w-3 h-3 opacity-60 hover:opacity-100 cursor-pointer transition-all" />
                <Linkedin className="w-3 h-3 opacity-60 hover:opacity-100 cursor-pointer transition-all" />
              </>
            )}
          </div>
        )}
        
        {data?.isDismissible !== false && (
          <button 
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Cerrar barra superior"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
