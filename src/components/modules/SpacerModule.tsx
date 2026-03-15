import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Typography } from '../ui/Typography';
import { ModuleWrapper } from '../ui/ModuleWrapper';

interface SpacerModuleProps {
  data: any;
  isPreview?: boolean;
  onUpdate?: (data: any) => void;
}

export const SpacerModule = ({ data, isPreview, onUpdate }: SpacerModuleProps) => {
  const {
    spacerType = 'smart',
    height = 40,
    lineStyle = 'solid',
    lineWidth = 100,
    lineColor = '#e2e8f0',
    lineThickness = 1,
    iconName = 'Star',
    labelText = 'SECCIÓN',
    shaperType = 'wave',
    patternType = 'dots',
    backgroundColor = 'transparent'
  } = data;

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

  const renderSpacer = () => {
    switch (spacerType) {
      case 'smart':
        return <div style={{ height: `${height}px` }} />;

      case 'line':
        return (
          <div className="flex justify-center py-4">
            <div 
              style={{ 
                width: `${lineWidth}%`, 
                borderTop: `${lineThickness}px ${lineStyle} ${lineColor}` 
              }} 
            />
          </div>
        );

      case 'icon':
        const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Star;
        return (
          <div className="flex items-center gap-4 py-4">
            <div className="flex-1" style={{ borderTop: `${lineThickness}px ${lineStyle} ${lineColor}` }} />
            <IconComponent size={20} style={{ color: lineColor }} />
            <div className="flex-1" style={{ borderTop: `${lineThickness}px ${lineStyle} ${lineColor}` }} />
          </div>
        );

      case 'label':
        return (
          <div className="flex items-center gap-4 py-4">
            <div className="flex-1" style={{ borderTop: `${lineThickness}px ${lineStyle} ${lineColor}` }} />
            <Typography 
              variant="small" 
              weight="900" 
              className="uppercase tracking-[0.2em] whitespace-nowrap"
              style={{ color: lineColor }}
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate('labelText', text)}
            >
              {labelText}
            </Typography>
            <div className="flex-1" style={{ borderTop: `${lineThickness}px ${lineStyle} ${lineColor}` }} />
          </div>
        );

      case 'shaper':
        return (
          <div className="relative w-full overflow-hidden" style={{ height: `${height}px` }}>
            {shaperType === 'wave' && (
              <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute inset-0 w-full h-full fill-current" style={{ color: lineColor }}>
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
              </svg>
            )}
            {shaperType === 'curve' && (
              <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute inset-0 w-full h-full fill-current" style={{ color: lineColor }}>
                <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"></path>
              </svg>
            )}
            {shaperType === 'diagonal' && (
              <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute inset-0 w-full h-full fill-current" style={{ color: lineColor }}>
                <path d="M1200 120L0 16.48V0h1200v120z"></path>
              </svg>
            )}
          </div>
        );

      case 'pattern':
        return (
          <div 
            className="w-full py-8" 
            style={{ 
              height: `${height}px`,
              backgroundImage: patternType === 'dots' 
                ? `radial-gradient(${lineColor} 1px, transparent 1px)` 
                : `repeating-linear-gradient(45deg, ${lineColor}, ${lineColor} 1px, transparent 1px, transparent 10px)`,
              backgroundSize: patternType === 'dots' ? '20px 20px' : '20px 20px',
              opacity: 0.3
            }} 
          />
        );

      case 'scroll':
        return (
          <div className="flex flex-col items-center gap-2 py-8">
            <div className="w-px h-16 bg-gradient-to-b from-transparent to-current" style={{ color: lineColor }} />
            <Typography variant="small" weight="700" className="uppercase tracking-widest text-[8px]" style={{ color: lineColor }}>
              Scroll
            </Typography>
          </div>
        );

      default:
        return <div style={{ height: '40px' }} />;
    }
  };

  return (
    <ModuleWrapper 
      theme={data?.theme}
      background={data?.background}
      noPadding
      className="w-full overflow-hidden"
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
    >
      <div className="max-w-7xl mx-auto px-6">
        {renderSpacer()}
      </div>
    </ModuleWrapper>
  );
};
