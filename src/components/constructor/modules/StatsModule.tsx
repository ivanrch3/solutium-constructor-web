import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useSpring, useTransform } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { Star } from 'lucide-react';

const CountUp = ({ value, duration = 2 }: { value: number, duration?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  const spring = useSpring(0, {
    duration: duration * 1000,
    bounce: 0
  });

  const displayValue = useTransform(spring, (latest) => Math.floor(latest));

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, value, spring]);

  return <motion.span ref={ref}>{displayValue}</motion.span>;
};

const StatItem = ({ 
  stat, 
  index, 
  layout, 
  entranceAnim, 
  itemVariants, 
  hoverScale, 
  cardBg, 
  cardRadius, 
  showBorder, 
  numberColor, 
  labelColor, 
  numberSize, 
  showIcons, 
  iconColor, 
  iconBg,
  countSpeed
}: any) => {
  const IconComponent = (LucideIcons as any)[stat.icon] || Star;
  const isMinimal = layout === 'minimal';
  const isBento = layout === 'bento';
  
  const bentoClass = isBento ? (index === 0 ? '@md:col-span-2 @md:row-span-2' : '@md:col-span-1 @md:row-span-1') : '';

  return (
    <motion.div
      variants={entranceAnim ? itemVariants : {}}
      whileHover={hoverScale ? { scale: 1.05, transition: { duration: 0.3 } } : {}}
      className={`flex flex-col items-center text-center p-8 transition-all duration-300 ${bentoClass} ${showBorder ? 'border border-slate-100' : ''}`}
      style={{ 
        backgroundColor: cardBg, 
        borderRadius: `${cardRadius}px`
      }}
    >
      {showIcons && (
        <div 
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          <IconComponent size={32} />
        </div>
      )}
      
      <div 
        className="font-black mb-2 flex items-baseline gap-1"
        style={{ color: numberColor, fontSize: isBento && index === 0 ? `${numberSize * 1.5}px` : `${numberSize}px` }}
      >
        {stat.prefix && <span className="text-0.6em opacity-70">{stat.prefix}</span>}
        <CountUp value={stat.value} duration={countSpeed} />
        {stat.suffix && <span className="text-0.6em opacity-70">{stat.suffix}</span>}
      </div>
      
      <span 
        className="font-bold uppercase tracking-widest text-xs"
        style={{ color: labelColor }}
      >
        {stat.label}
      </span>
    </motion.div>
  );
};

export const StatsModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any> 
}> = ({ moduleId, settingsValues }) => {
  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  };

  // Global Settings
  const layout = getVal(null, 'layout', 'grid');
  const columns = getVal(null, 'columns', 4);
  const gap = getVal(null, 'gap', 30);
  const paddingY = getVal(null, 'padding_y', 80);
  const bgColor = getVal(null, 'bg_color', '#FFFFFF');
  const entranceAnim = getVal(null, 'entrance_anim', true);
  const countSpeed = getVal(null, 'count_speed', 2);

  // Element: Header
  const showHeader = getVal(`${moduleId}_el_stats_header`, 'show_header', false);
  const headerTitle = getVal(`${moduleId}_el_stats_header`, 'title', 'Nuestros Logros');
  const headerSubtitle = getVal(`${moduleId}_el_stats_header`, 'subtitle', 'Números que respaldan nuestra trayectoria.');
  const headerAlign = getVal(`${moduleId}_el_stats_header`, 'align', 'center');
  const headerTitleSize = getVal(`${moduleId}_el_stats_header`, 'title_size', 32);
  const headerMarginB = getVal(`${moduleId}_el_stats_header`, 'margin_b', 60);

  // Element: Stat Item Style
  const cardBg = getVal(`${moduleId}_el_stat_item`, 'card_bg', 'transparent');
  const cardRadius = getVal(`${moduleId}_el_stat_item`, 'card_radius', 16);
  const showBorder = getVal(`${moduleId}_el_stat_item`, 'show_border', false);
  const numberColor = getVal(`${moduleId}_el_stat_item`, 'number_color', 'var(--primary-color)');
  const labelColor = getVal(`${moduleId}_el_stat_item`, 'label_color', '#64748B');
  const numberSize = getVal(`${moduleId}_el_stat_item`, 'number_size', 48);
  const hoverScale = getVal(`${moduleId}_el_stat_item`, 'hover_scale', true);

  // Element: Icon Style
  const showIcons = getVal(`${moduleId}_el_stat_icon`, 'show_icons', true);
  const iconColor = getVal(`${moduleId}_el_stat_icon`, 'icon_color', 'var(--primary-color)');
  const iconBg = getVal(`${moduleId}_el_stat_icon`, 'icon_bg', 'rgba(59, 130, 246, 0.1)');

  const stats = getVal(null, 'stats', [
    { value: 500, prefix: '', suffix: '+', label: 'Clientes Felices', icon: 'Users' },
    { value: 120, prefix: '', suffix: 'k', label: 'Líneas de Código', icon: 'Zap' },
    { value: 15, prefix: '', suffix: '', label: 'Premios Ganados', icon: 'Award' },
    { value: 99, prefix: '', suffix: '%', label: 'Satisfacción', icon: 'Heart' }
  ]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <section 
      className="w-full relative overflow-hidden py-12 @md:py-20 @lg:py-24"
      style={{ 
        backgroundColor: bgColor
      }}
    >
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        {showHeader && (
          <div 
            className={`flex flex-col mb-12 ${headerAlign === 'center' ? 'items-center text-center' : 'items-start text-left'}`}
            style={{ marginBottom: `${headerMarginB}px` }}
          >
            <h2 
              className="font-black text-slate-900 mb-4 leading-tight text-3xl @md:text-4xl @lg:text-5xl"
            >
              {headerTitle}
            </h2>
            {headerSubtitle && (
              <p className="text-slate-500 max-w-2xl text-lg">
                {headerSubtitle}
              </p>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <motion.div 
          variants={entranceAnim ? containerVariants : {}}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className={`grid ${layout === 'bento' ? '@md:grid-flow-dense' : ''} ${
            columns === 4 ? 'grid-cols-2 @sm:grid-cols-3 @lg:grid-cols-4' :
            columns === 3 ? 'grid-cols-2 @sm:grid-cols-3' :
            columns === 2 ? 'grid-cols-2' : 'grid-cols-1'
          }`}
          style={{ 
            gap: `${gap}px`
          }}
        >
          {stats.map((stat: any, i: number) => (
            <StatItem 
              key={i} 
              stat={stat} 
              index={i} 
              layout={layout}
              entranceAnim={entranceAnim}
              itemVariants={itemVariants}
              hoverScale={hoverScale}
              cardBg={cardBg}
              cardRadius={cardRadius}
              showBorder={showBorder}
              numberColor={numberColor}
              labelColor={labelColor}
              numberSize={numberSize}
              showIcons={showIcons}
              iconColor={iconColor}
              iconBg={iconBg}
              countSpeed={countSpeed}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};
