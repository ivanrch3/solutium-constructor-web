import React from 'react';
import { motion } from 'motion/react';

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

  const alignmentClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end'
  };

  return (
    <div 
      className="w-full flex items-center overflow-hidden"
      style={{ 
        backgroundColor: bgColor,
        // We use a CSS variable for responsive height if needed, 
        // but for now we'll use a simple approach with a wrapper
      }}
    >
      <div 
        className={`w-full flex ${alignmentClasses[align as keyof typeof alignmentClasses]}`}
        style={{ 
          // Simple responsive height using a div with height
          // In a real production app we might use media queries or a more complex hook
          height: `${heightDesktop}px`, 
        }}
      >
        {type !== 'none' && (
          <div 
            style={{ 
              width: `${width}%`,
              borderTop: `${thickness}px ${type} ${color}`,
              height: '0px'
            }}
          />
        )}
      </div>
      
      {/* Mobile Height Override (Simplified for preview) */}
      <style>{`
        @media (max-width: 768px) {
          #spacer-${moduleId} {
            height: ${heightMobile}px !important;
          }
        }
      `}</style>
      <div id={`spacer-${moduleId}`} className="hidden" />
    </div>
  );
};
