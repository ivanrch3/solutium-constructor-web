import React, { useEffect, useState, useRef } from 'react';
import * as LucideIcons from 'lucide-react';
import { motion, useInView, useSpring, useTransform } from 'motion/react';
import { Typography } from '../ui/Typography';
import { ModuleWrapper } from '../ui/ModuleWrapper';
import { usePageLayout } from '../../context/PageLayoutContext';

const getIcon = (name: string) => {
  const Icon = (LucideIcons as any)[name];
  return Icon;
};

const Counter = ({ value, className }: { value: string | number, className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const stringValue = String(value || '0');
  // Extract number and suffix (e.g., "15k+" -> 15, "k+")
  const numberMatch = stringValue.match(/(\d+)/);
  const numberValue = numberMatch ? parseInt(numberMatch[0], 10) : 0;
  const suffix = stringValue.replace(numberMatch ? numberMatch[0] : '', '');

  const spring = useSpring(0, {
    mass: 1,
    stiffness: 100,
    damping: 30,
  });

  const displayValue = useTransform(spring, (current) => 
    `${Math.floor(current)}${suffix}`
  );

  useEffect(() => {
    if (isInView) {
      spring.set(numberValue);
    }
  }, [isInView, numberValue, spring]);

  return (
    <motion.span ref={ref} className={className}>
      {displayValue}
    </motion.span>
  );
};

interface StatsModuleProps {
  data: any;
  onUpdate?: (data: any) => void;
}

export const StatsModule = ({ data, onUpdate }: StatsModuleProps) => {
  const { previewDevice } = usePageLayout();
  const isMobileSimulated = previewDevice === 'mobile';
  const rawStats = data?.stats;
  const stats = Array.isArray(rawStats) ? rawStats : [
    { value: '15k+', label: 'Usuarios', iconName: 'Users' },
    { value: '40m', label: 'Ventas', iconName: 'TrendingUp' },
    { value: '120', label: 'Países', iconName: 'Globe' },
    { value: '24/7', label: 'Soporte', iconName: 'Headphones' }
  ];

  const handleTextUpdate = (path: string, value: string) => {
    if (onUpdate) {
      const newData = { ...data };
      if (!newData.stats) newData.stats = stats;

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

  const isLight = data?.theme === 'light';
  const smartMode = data?.smartMode || false;
  const entranceAnimation = data?.entranceAnimation || 'fade';

  const getEntranceAnimation = (idx: number) => {
    const baseDelay = 0.1;
    const stagger = 0.1;

    switch (entranceAnimation) {
      case 'slide':
        return {
          initial: { opacity: 0, x: -30 },
          whileInView: { opacity: 1, x: 0 },
          viewport: { once: true },
          transition: { duration: 0.8, delay: baseDelay + idx * stagger, ease: [0.21, 0.45, 0.32, 0.9] }
        };
      case 'zoom':
        return {
          initial: { opacity: 0, scale: 0.8 },
          whileInView: { opacity: 1, scale: 1 },
          viewport: { once: true },
          transition: { duration: 0.8, delay: baseDelay + idx * stagger, ease: [0.21, 0.45, 0.32, 0.9] }
        };
      case 'reveal':
        return {
          initial: { opacity: 0, y: 40 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true },
          transition: { duration: 1, delay: baseDelay + idx * stagger, ease: [0.21, 0.45, 0.32, 0.9] }
        };
      default: // fade
        return {
          initial: { opacity: 0, y: 20 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true },
          transition: { duration: 0.7, delay: baseDelay + idx * stagger }
        };
    }
  };

  const effectiveLayout = smartMode ? (isMobileSimulated ? 'stack' : 'grid') : (data?.layoutType || 'grid');
  const gridCols = isMobileSimulated ? 'grid-cols-1 gap-12' : 
    effectiveLayout === 'grid' ? 'grid-cols-2 md:grid-cols-4 gap-12' : 'grid-cols-1 gap-16';

  return (
    <ModuleWrapper 
      theme={data?.theme || 'dark'}
      background={data?.background}
      className={`relative overflow-hidden ${isLight ? 'bg-surface' : 'bg-primary'}`}
    >
      {/* Background Decorative Elements */}
      {!isLight && (
        <>
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent rounded-full blur-[120px]" />
          </div>
        </>
      )}

      <div className="container mx-auto px-4 relative z-10">
        {data?.title && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`text-center ${isMobileSimulated ? 'mb-12' : 'mb-20'}`}
          >
            <Typography
              variant="h2"
              className={`${isMobileSimulated ? 'text-3xl' : 'text-5xl'} font-black mb-4 tracking-tighter ${isLight ? 'text-text' : 'text-white'}`}
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate('title', text)}
            >
              {data?.title}
            </Typography>
            {data?.subtitle && (
              <Typography
                variant="p"
                className={`max-w-2xl mx-auto text-lg opacity-70 ${isLight ? 'text-text' : 'text-white'}`}
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('subtitle', text)}
              >
                {data?.subtitle}
              </Typography>
            )}
          </motion.div>
        )}

        <div className={`grid ${gridCols} text-center`}>
          {stats.map((stat: any, i: number) => {
            if (!stat) return null;
            const Icon = stat?.iconName ? getIcon(stat.iconName) : null;
            const animation = getEntranceAnimation(i);
            return (
              <motion.div 
                key={i}
                {...animation}
                whileHover={{ y: -5 }}
                className={`flex flex-col items-center group ${effectiveLayout === 'stack' ? 'max-w-md mx-auto w-full' : ''}`}
              >
                {Icon && (
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`mb-6 p-5 rounded-[2rem] transition-all duration-500 shadow-lg ${isLight ? 'bg-primary/10 text-primary shadow-primary/5' : 'bg-white/10 text-white shadow-black/20'}`}
                  >
                    <Icon className="w-8 h-8" />
                  </motion.div>
                )}
                
                <div className="relative">
                  <Typography
                    variant="p"
                    className={`${isMobileSimulated ? 'text-5xl' : 'text-6xl md:text-7xl'} font-black mb-3 tracking-tighter ${isLight ? 'text-primary' : 'text-white'} flex items-center justify-center`}
                  >
                    <Counter 
                      value={stat?.value || stat?.val || '0'} 
                      className="inline-block"
                    />
                  </Typography>
                  
                  {/* Subtle glow effect for numbers */}
                  {!isLight && (
                    <div className="absolute inset-0 bg-white/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  )}
                </div>

                <Typography
                  variant="p"
                  className={`${isLight ? 'text-text/60' : 'text-white/70'} text-xs md:text-sm font-black uppercase tracking-[0.3em] mb-2`}
                  editable={!!onUpdate}
                  onUpdate={(text) => handleTextUpdate(`stats.${i}.label`, text)}
                >
                  {stat?.label || 'Métrica'}
                </Typography>
                
                {stat?.description && (
                  <Typography
                    variant="p"
                    className={`text-xs opacity-50 max-w-[200px] ${isLight ? 'text-text' : 'text-white'}`}
                    editable={!!onUpdate}
                    onUpdate={(text) => handleTextUpdate(`stats.${i}.description`, text)}
                  >
                    {stat?.description}
                  </Typography>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </ModuleWrapper>
  );
};
