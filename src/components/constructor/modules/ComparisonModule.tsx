import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Columns2 } from 'lucide-react';
import { TYPOGRAPHY_SCALE, FONT_WEIGHTS } from '../../../constants/typography';
import { TextRenderer } from '../TextRenderer';
import { parseNumSafe } from '../utils';

export const ComparisonModule: React.FC<{
  moduleId: string, 
  settingsValues: Record<string, any>,
  preview?: boolean 
}> = ({ moduleId, settingsValues, preview }) => {
  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  };

  const [sliderPos, setSliderPos] = useState<number>(() => {
    return parseNumSafe(getVal(null, 'initial_position', 50), 50);
  });
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  
  // Content (Element: Textos)
  const title = getVal(`${moduleId}_el_comp_text`, 'title', 'Nuestros **Resultados**');
  const titleSize = getVal(`${moduleId}_el_comp_text`, 'title_size', 't1');
  const titleWeight = getVal(`${moduleId}_el_comp_text`, 'title_weight', 'extrabold');
  const titleColor = getVal(`${moduleId}_el_comp_text`, 'title_color', 'inherit');
  
  const subtitle = getVal(`${moduleId}_el_comp_text`, 'subtitle', 'Desliza para ver la transformación real de nuestros proyectos.');
  const subtitleSize = getVal(`${moduleId}_el_comp_text`, 'subtitle_size', 'p');
  const subtitleWeight = getVal(`${moduleId}_el_comp_text`, 'subtitle_weight', 'normal');
  const subtitleColor = getVal(`${moduleId}_el_comp_text`, 'subtitle_color', 'inherit');
  
  // Highlight Settings
  const titleHighlightType = getVal(`${moduleId}_el_comp_text`, 'title_highlight_type', 'gradient');
  const titleHighlightColor = getVal(`${moduleId}_el_comp_text`, 'title_highlight_color', '#3B82F6');
  const titleHighlightGradient = getVal(`${moduleId}_el_comp_text`, 'title_highlight_gradient', 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)');
  const titleHighlightBold = getVal(`${moduleId}_el_comp_text`, 'title_highlight_bold', true);

  const subtitleHighlightType = getVal(`${moduleId}_el_comp_text`, 'subtitle_highlight_type', 'gradient');
  const subtitleHighlightColor = getVal(`${moduleId}_el_comp_text`, 'subtitle_highlight_color', '#3B82F6');
  const subtitleHighlightGradient = getVal(`${moduleId}_el_comp_text`, 'subtitle_highlight_gradient', 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)');
  const subtitleHighlightBold = getVal(`${moduleId}_el_comp_text`, 'subtitle_highlight_bold', true);
  
  // Images
  const imgBefore = getVal(`${moduleId}_el_comp_images`, 'img_before', 'https://picsum.photos/seed/before/1920/1080');
  const imgAfter = getVal(`${moduleId}_el_comp_images`, 'img_after', 'https://picsum.photos/seed/after/1920/1080');
  
  // Style
  const darkMode = getVal(null, 'dark_mode', false);
  const bgColor = getVal(null, 'bg_color', '#FFFFFF');
  const handleColor = getVal(null, 'handle_color', '#3B82F6');
  const borderRadius = parseNumSafe(getVal(null, 'border_radius', 24), 24);
  const paddingY = parseNumSafe(getVal(null, 'padding_y', 100), 100);
  const maxWidth = parseNumSafe(getVal(null, 'max_width', 1000), 1000);
  const aspectRatio = getVal(null, 'aspect_ratio', '16/9');
  
  // Interacción
  const showLabels = getVal(null, 'show_labels', true);
  const labelBefore = getVal(null, 'label_before', 'Antes');
  const labelAfter = getVal(null, 'label_after', 'Después');

  // Responsiveness
  const isSmall = containerWidth < 640;
  const isTablet = containerWidth >= 640 && containerWidth < 1024;
  
  const responsivePaddingY = isSmall ? paddingY * 0.6 : paddingY;
  
  const getResponsiveFontSize = (baseSize: number) => {
    if (isSmall) return Math.max(baseSize * 0.7, 24);
    if (isTablet) return baseSize * 0.85;
    return baseSize;
  };

  useEffect(() => {
    const val = parseFloat(getVal(null, 'initial_position', 50));
    if (isFinite(val)) setSliderPos(val);
  }, [settingsValues[`${moduleId}_global_initial_position`]]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const posVal = rect.width > 0 ? ((clientX - rect.left) / rect.width) * 100 : 50;
    const position = isFinite(posVal) ? posVal : 50;
    setSliderPos(Math.min(Math.max(position, 0), 100));
  };

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    handleMove(e.clientX);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (isDragging.current) {
      handleMove(e.clientX);
    }
  };

  const onMouseUp = () => {
    isDragging.current = false;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  return (
    <section 
      id={moduleId}
      style={{ 
        backgroundColor: darkMode ? '#0F172A' : bgColor,
        paddingTop: responsivePaddingY,
        paddingBottom: responsivePaddingY,
        color: darkMode ? '#FFFFFF' : '#0F172A'
      }}
      className="relative overflow-hidden"
    >
      <div className="container mx-auto px-6 text-center mb-8 md:mb-12">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-4 leading-tight tracking-tight"
          style={{ 
            fontSize: getResponsiveFontSize((TYPOGRAPHY_SCALE[titleSize as keyof typeof TYPOGRAPHY_SCALE] || TYPOGRAPHY_SCALE.t1).fontSize),
            lineHeight: (TYPOGRAPHY_SCALE[titleSize as keyof typeof TYPOGRAPHY_SCALE] || TYPOGRAPHY_SCALE.t1).lineHeight,
            fontWeight: (FONT_WEIGHTS[titleWeight as keyof typeof FONT_WEIGHTS] || FONT_WEIGHTS.extrabold).value,
            color: titleColor === 'inherit' ? undefined : titleColor
          }}
        >
          <TextRenderer 
            text={title} 
            highlightType={titleHighlightType}
            highlightColor={titleHighlightColor}
            highlightGradient={titleHighlightGradient}
            highlightBold={titleHighlightBold}
          />
        </motion.h2>
        {subtitle && (
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="opacity-70 max-w-2xl mx-auto"
            style={{ 
              fontSize: isSmall ? 16 : (TYPOGRAPHY_SCALE[subtitleSize as keyof typeof TYPOGRAPHY_SCALE] || TYPOGRAPHY_SCALE.p).fontSize,
              lineHeight: 1.5,
              fontWeight: (FONT_WEIGHTS[subtitleWeight as keyof typeof FONT_WEIGHTS] || FONT_WEIGHTS.normal).value,
              color: subtitleColor === 'inherit' ? undefined : subtitleColor
            }}
          >
            <TextRenderer 
              text={subtitle} 
              highlightType={subtitleHighlightType}
              highlightColor={subtitleHighlightColor}
              highlightGradient={subtitleHighlightGradient}
              highlightBold={subtitleHighlightBold}
            />
          </motion.p>
        )}
      </div>

      <div 
        className="mx-auto relative group select-none touch-none overflow-hidden"
        style={{ 
          width: 'calc(100% - 2rem)',
          maxWidth,
          borderRadius: isSmall ? '16px' : `${borderRadius}px`,
          aspectRatio: aspectRatio === 'auto' ? 'auto' : (String(aspectRatio).includes('NaN') || !aspectRatio ? '16 / 9' : String(aspectRatio).replace('/', ' / ')),
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
        ref={containerRef}
        onMouseDown={onMouseDown}
        onTouchMove={onTouchMove}
      >
        {/* Imagen Después (Fondo) */}
        <img 
          src={imgAfter} 
          alt="Después" 
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Imagen Antes (Overlay) */}
        <div 
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ width: `${isFinite(sliderPos) ? sliderPos : 50}%` }}
        >
          <img 
            src={imgBefore} 
            alt="Antes" 
            className="absolute inset-0 h-full object-cover"
            style={{ width: `${isFinite(containerWidth) && containerWidth > 0 ? containerWidth : 1200}px`, maxWidth: 'none' }}
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        </div>

        {/* Labels */}
        {showLabels && (
          <>
            <div className={`absolute ${isSmall ? 'bottom-3 left-3' : 'bottom-6 left-6'} z-10 pointer-events-none`}>
              <span className={`bg-black/60 backdrop-blur-md ${isSmall ? 'px-2 py-1' : 'px-4 py-2'} rounded-xl text-white text-[10px] md:text-xs font-bold uppercase tracking-widest border border-white/10 shadow-lg`}>
                {labelBefore}
              </span>
            </div>
            <div className={`absolute ${isSmall ? 'bottom-3 right-3' : 'bottom-6 right-6'} z-10 pointer-events-none`}>
              <span className={`bg-black/60 backdrop-blur-md ${isSmall ? 'px-2 py-1' : 'px-4 py-2'} rounded-xl text-white text-[10px] md:text-xs font-bold uppercase tracking-widest border border-white/10 shadow-lg`}>
                {labelAfter}
              </span>
            </div>
          </>
        )}

        {/* Slider Handle */}
        <div 
          className={`absolute inset-y-0 z-20 ${isSmall ? 'w-0.5' : 'w-1'} cursor-ew-resize group-active:scale-x-150 transition-transform`}
          style={{ 
            left: `${isFinite(sliderPos) ? sliderPos : 50}%`, 
            backgroundColor: handleColor 
          }}
        >
          <div 
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${isSmall ? 'w-8 h-8' : 'w-12 h-12'} rounded-full border-2 md:border-4 shadow-xl flex items-center justify-center bg-white transition-transform active:scale-90`}
            style={{ borderColor: handleColor, color: handleColor }}
          >
            <div className="flex gap-0.5 items-center">
              <div className={`${isSmall ? 'w-1 h-1' : 'w-1.5 h-1.5'} rounded-full bg-current`} />
              <div className={`${isSmall ? 'w-1 h-1' : 'w-1.5 h-1.5'} rounded-full bg-current`} />
              <div className={`${isSmall ? 'w-1 h-1' : 'w-1.5 h-1.5'} rounded-full bg-current`} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Min dimensions quality hint (educational/informative) */}
      <div className="mt-8 text-center opacity-30 text-[10px] uppercase tracking-[0.2em]">
        Resolución Recomendada: 1920x1080px o Superior
      </div>
    </section>
  );
};
