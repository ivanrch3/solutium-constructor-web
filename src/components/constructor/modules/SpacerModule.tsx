import React, { useRef } from 'react';
import { motion } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { ParallaxBackground, useParallaxScrollProgress } from '../ParallaxBackground';

const toBoolean = (value: unknown) => value === true || value === 'true' || value === 1 || value === '1';

const resolveThemeColor = (
  value: string | undefined,
  lightDefault: string,
  darkDefault: string,
  darkMode: boolean
) => {
  const safeValue = String(value || '').trim();
  const safeLight = String(lightDefault || '').trim().toLowerCase();
  if (!darkMode) return safeValue || lightDefault;
  if (!safeValue || safeValue.toLowerCase() === safeLight) return darkDefault;
  return safeValue;
};

export const SpacerModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any>,
  isPreviewMode?: boolean
}> = ({ moduleId, settingsValues, isPreviewMode = false }) => {
  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  };

  const containerRef = useRef(null);
  const { scrollYProgress } = useParallaxScrollProgress(containerRef);

  const parseF = (val: any, fallback: number) => {
    const f = parseFloat(val);
    return isNaN(f) ? fallback : f;
  };

  // Global Settings - Estructura
  const heightDesktop = parseF(getVal(null, 'height_desktop', 60), 60);
  const heightMobile = parseF(getVal(null, 'height_mobile', 40), 40);
  const width = parseF(getVal(null, 'width', 100), 100);
  const align = getVal(null, 'align', 'center');

  // Global Settings - Estilo
  const darkMode = toBoolean(getVal(null, 'dark_mode', false));
  const type = getVal(null, 'type', 'none');
  const thickness = parseF(getVal(null, 'thickness', 1), 1);
  const rawColor = getVal(null, 'color', '#E2E8F0');
  const color = resolveThemeColor(rawColor, '#E2E8F0', 'rgba(255,255,255,0.1)', darkMode);
  const rawBgColor = getVal(null, 'bg_color', 'transparent');
  const bgColor = resolveThemeColor(rawBgColor, 'transparent', '#0F172A', darkMode);
  const showContent = getVal(null, 'show_content', false);
  const contentType = getVal(null, 'content_type', 'icon');
  const iconName = getVal(null, 'icon', 'Star');
  const text = getVal(null, 'text', 'SECCIÓN');
  const contentSize = parseF(getVal(null, 'content_size', 16), 16);
  const rawContentColor = getVal(null, 'content_color', '#94A3B8');
  const contentColor = resolveThemeColor(rawContentColor, '#94A3B8', '#CBD5E1', darkMode);

  // Multimedia (Parallax Background)
  const bgParallaxEnabled = getVal(null, 'bg_parallax_enabled', false);
  const bgParallaxImg = getVal(null, 'bg_parallax_img', '');
  const bgParallaxOpacity = parseF(getVal(null, 'bg_parallax_opacity', 20), 20);
  const bgParallaxOverlay = getVal(null, 'bg_parallax_overlay', '#000000');
  const bgParallaxSpeed = parseF(getVal(null, 'bg_parallax_speed', 100), 100);

  const alignmentClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end'
  };

  const getIcon = (name: string) => {
    const IconComponent = (LucideIcons as any)[name];
    return IconComponent ? <IconComponent size={contentSize} /> : null;
  };

  return (
    <div 
      id={moduleId}
      ref={containerRef}
      className="w-full relative flex items-center overflow-hidden transition-all duration-300 group/spacer"
      data-module-type="spacer"
      style={{ 
        backgroundColor: bgColor,
        minHeight: `${heightMobile}px`
      }}
    >
      <ParallaxBackground 
        scrollYProgress={scrollYProgress}
        enabled={bgParallaxEnabled}
        imageUrl={bgParallaxImg}
        opacity={bgParallaxOpacity}
        overlayColor={bgParallaxOverlay}
        speed={bgParallaxSpeed}
      />
      {/* CSS Variable injection for responsive height */}
      <style dangerouslySetInnerHTML={{ __html: `
        #spacer-container-${moduleId} { height: ${heightMobile}px; }
        @media (min-width: 768px) {
          #spacer-container-${moduleId} { height: ${heightDesktop}px; }
        }
      `}} />

      <div 
        id={`spacer-container-${moduleId}`}
        className={`w-full flex items-center transition-[height] duration-300 ${alignmentClasses[align as keyof typeof alignmentClasses]}`}
      >
        <div 
          className="flex items-center w-full transition-all duration-300"
          style={{ 
            width: `${width}%`,
            margin: align === 'center' ? '0 auto' : align === 'end' ? '0 0 0 auto' : '0 auto 0 0'
          }}
        >
          {type !== 'none' ? (
            <>
              <div 
                className="flex-1"
                style={{ 
                  borderTopWidth: `${thickness}px`,
                  borderTopStyle: type as any,
                  borderTopColor: color === '#E2E8F0' ? 'var(--color-border, #E2E8F0)' : color,
                  height: '0px',
                  opacity: color === '#E2E8F0' ? 0.6 : 1
                }}
              />
              
              {showContent && (
                <div 
                  className="px-6 flex-shrink-0 flex items-center justify-center transition-all"
                  style={{ 
                    color: contentColor === '#94A3B8' ? 'var(--color-text-dim, #94A3B8)' : contentColor,
                    fontSize: `${contentSize}px`,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em'
                  }}
                >
                  {contentType === 'icon' ? getIcon(iconName) : text}
                </div>
              )}

              <div 
                className="flex-1"
                style={{ 
                  borderTopWidth: `${thickness}px`,
                  borderTopStyle: type as any,
                  borderTopColor: color === '#E2E8F0' ? 'var(--color-border, #E2E8F0)' : color,
                  height: '0px',
                  opacity: color === '#E2E8F0' ? 0.6 : 1
                }}
              />
            </>
          ) : (
            <div 
              className="w-full group-hover/spacer:opacity-80 transition-opacity" 
              style={{ 
                height: '1px',
                borderTopWidth: '1px',
                borderTopStyle: 'dashed',
                borderTopColor: 'rgba(148, 163, 184, 0.2)'
              }} 
            />
          )}
        </div>
      </div>
    </div>
  );
};
