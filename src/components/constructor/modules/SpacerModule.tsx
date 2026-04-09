import React from 'react';
import { motion } from 'motion/react';
import * as LucideIcons from 'lucide-react';

export const SpacerModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any> 
}> = ({ moduleId, settingsValues }) => {
  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  };

  // Global Settings - Estructura
  const heightDesktop = getVal(null, 'height_desktop', 60);
  const heightMobile = getVal(null, 'height_mobile', 40);
  const width = getVal(null, 'width', 100);
  const align = getVal(null, 'align', 'center');

  // Global Settings - Estilo
  const type = getVal(null, 'type', 'none');
  const thickness = getVal(null, 'thickness', 1);
  const color = getVal(null, 'color', '#E2E8F0');
  const bgColor = getVal(null, 'bg_color', 'transparent');
  const showContent = getVal(null, 'show_content', false);
  const contentType = getVal(null, 'content_type', 'icon');
  const iconName = getVal(null, 'icon', 'Star');
  const text = getVal(null, 'text', 'SECCIÓN');
  const contentSize = getVal(null, 'content_size', 16);
  const contentColor = getVal(null, 'content_color', '#94A3B8');

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
      className="w-full flex items-center overflow-hidden transition-all duration-300 group/spacer"
      data-module-type="spacer"
      style={{ 
        backgroundColor: bgColor,
        minHeight: `${heightMobile}px`
      }}
    >
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
                  borderTop: `${thickness}px ${type} ${color === '#E2E8F0' ? 'var(--color-border, #E2E8F0)' : color}`,
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
                  borderTop: `${thickness}px ${type} ${color === '#E2E8F0' ? 'var(--color-border, #E2E8F0)' : color}`,
                  height: '0px',
                  opacity: color === '#E2E8F0' ? 0.6 : 1
                }}
              />
            </>
          ) : (
            <div className="w-full border-t border-dashed border-border/20 group-hover/spacer:border-border/40 transition-colors" style={{ height: '1px' }} />
          )}
        </div>
      </div>
    </div>
  );
};
