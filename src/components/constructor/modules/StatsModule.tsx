import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useInView, useSpring, useTransform, animate } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { Star } from 'lucide-react';

const CountUp = ({ value, duration = 2, easing = 'spring' }: { value: number, duration?: number, easing?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);
  
  const spring = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
    stiffness: 100,
    damping: 30
  });

  const springValue = useTransform(spring, (latest) => Math.floor(latest));

  useEffect(() => {
    if (isInView) {
      if (easing === 'spring') {
        spring.set(value);
      } else {
        const controls = animate(0, value, {
          duration: duration,
          ease: "linear",
          onUpdate: (latest) => setDisplay(Math.floor(latest))
        });
        return () => controls.stop();
      }
    }
  }, [isInView, value, spring, easing, duration]);

  return (
    <motion.span ref={ref}>
      {easing === 'spring' ? <motion.span>{springValue}</motion.span> : display}
    </motion.span>
  );
};

const IconShape = ({ shape, color, bg, size, icon: Icon }: any) => {
  const shapeStyles: Record<string, string> = {
    circle: 'rounded-full',
    squircle: 'rounded-[30%]',
    blob: 'rounded-[40%_60%_70%_30%/40%_50%_60%_50%]',
    none: 'bg-transparent'
  };

  return (
    <div 
      className={`flex items-center justify-center mb-6 transition-all duration-500 ${shapeStyles[shape] || 'rounded-2xl'}`}
      style={{ 
        backgroundColor: shape === 'none' ? 'transparent' : bg, 
        color: color,
        width: `${size * 2.5}px`,
        height: `${size * 2.5}px`
      }}
    >
      <Icon size={size} />
    </div>
  );
};

const StatItem = ({ 
  stat, 
  index, 
  layout, 
  entranceAnim, 
  itemVariants, 
  hoverEffect, 
  cardBg, 
  cardRadius, 
  showBorder, 
  cardShadow,
  numberColor, 
  labelColor, 
  descColor,
  numberSize, 
  showIcons, 
  iconSize,
  iconShape,
  iconColor, 
  iconBg,
  countSpeed,
  countEasing
}: any) => {
  const IconComponent = (LucideIcons as any)[stat.icon] || Star;
  const isMinimal = layout === 'minimal';
  const isBento = layout === 'bento';
  const isInline = layout === 'inline';
  
  const bentoClass = isBento ? (index === 0 ? '@md:col-span-2 @md:row-span-2' : '@md:col-span-1 @md:row-span-1') : '';
  
  const shadowClass = {
    none: '',
    soft: 'shadow-lg shadow-slate-200/50',
    glow: `shadow-xl shadow-[${iconColor}]/10`
  }[cardShadow as string] || '';

  const hoverStyles = {
    none: {},
    scale: { scale: 1.05 },
    lift: { y: -10, boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)' }
  }[hoverEffect as string] || {};

  return (
    <motion.div
      variants={entranceAnim ? itemVariants : {}}
      whileHover={hoverStyles}
      className={`flex ${isInline ? 'flex-row items-center text-left gap-6' : 'flex-col items-center text-center'} p-8 transition-all duration-300 ${bentoClass} ${shadowClass} ${showBorder ? 'border border-slate-100' : ''}`}
      style={{ 
        backgroundColor: cardBg, 
        borderRadius: `${cardRadius}px`
      }}
    >
      {showIcons && (
        <IconShape 
          shape={iconShape} 
          color={iconColor} 
          bg={iconBg} 
          size={iconSize} 
          icon={IconComponent} 
        />
      )}
      
      <div className={isInline ? 'flex flex-col' : ''}>
        <div 
          className="font-black mb-1 flex items-baseline gap-1 leading-none"
          style={{ 
            color: numberColor, 
            fontSize: isBento && index === 0 ? `${numberSize * 1.5}px` : `${numberSize}px` 
          }}
        >
          {stat.prefix && <span className="text-[0.6em] opacity-70 font-bold">{stat.prefix}</span>}
          <CountUp value={stat.value} duration={countSpeed} easing={countEasing} />
          {stat.suffix && <span className="text-[0.6em] opacity-70 font-bold">{stat.suffix}</span>}
        </div>
        
        <span 
          className="font-bold uppercase tracking-widest text-xs mb-2 block"
          style={{ color: labelColor }}
        >
          {stat.label}
        </span>

        {stat.description && (
          <p 
            className="text-sm leading-relaxed max-w-[200px]"
            style={{ color: descColor }}
          >
            {stat.description}
          </p>
        )}
      </div>
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
  const paddingY = getVal(null, 'padding_y', 100);
  const bgColor = getVal(null, 'bg_color', '#FFFFFF');
  const sectionGradient = getVal(null, 'section_gradient', false);
  const entranceAnim = getVal(null, 'entrance_anim', true);
  const countSpeed = getVal(null, 'count_speed', 2);
  const countEasing = getVal(null, 'count_easing', 'spring');

  // Element: Header
  const showHeader = getVal(`${moduleId}_el_stats_header`, 'show_header', false);
  const eyebrow = getVal(`${moduleId}_el_stats_header`, 'eyebrow', 'NUESTRO IMPACTO');
  const headerTitle = getVal(`${moduleId}_el_stats_header`, 'title', 'Números que hablan por nosotros');
  const headerSubtitle = getVal(`${moduleId}_el_stats_header`, 'subtitle', 'Resultados tangibles que respaldan nuestra trayectoria.');
  const headerAlign = getVal(`${moduleId}_el_stats_header`, 'align', 'center');
  const headerTitleSize = getVal(`${moduleId}_el_stats_header`, 'title_size', 32);
  const eyebrowColor = getVal(`${moduleId}_el_stats_header`, 'eyebrow_color', 'var(--primary-color)');
  const headerMarginB = getVal(`${moduleId}_el_stats_header`, 'margin_b', 60);

  // Element: Stat Item Style
  const cardBg = getVal(`${moduleId}_el_stat_item`, 'card_bg', 'transparent');
  const cardRadius = getVal(`${moduleId}_el_stat_item`, 'card_radius', 24);
  const showBorder = getVal(`${moduleId}_el_stat_item`, 'show_border', false);
  const cardShadow = getVal(`${moduleId}_el_stat_item`, 'card_shadow', 'none');
  const numberColor = getVal(`${moduleId}_el_stat_item`, 'number_color', '#0F172A');
  const labelColor = getVal(`${moduleId}_el_stat_item`, 'label_color', '#64748B');
  const descColor = getVal(`${moduleId}_el_stat_item`, 'desc_color', '#94A3B8');
  const numberSize = getVal(`${moduleId}_el_stat_item`, 'number_size', 48);
  const hoverEffect = getVal(`${moduleId}_el_stat_item`, 'hover_effect', 'scale');

  // Element: Icon Style
  const showIcons = getVal(`${moduleId}_el_stat_icon`, 'show_icons', true);
  const iconSize = getVal(`${moduleId}_el_stat_icon`, 'icon_size', 24);
  const iconShape = getVal(`${moduleId}_el_stat_icon`, 'icon_shape', 'squircle');
  const iconColor = getVal(`${moduleId}_el_stat_icon`, 'icon_color', 'var(--primary-color)');
  const iconBg = getVal(`${moduleId}_el_stat_icon`, 'icon_bg', 'rgba(59, 130, 246, 0.1)');

  const stats = getVal(null, 'stats', [
    { value: 500, prefix: '', suffix: '+', label: 'Clientes Felices', description: 'Empresas que confían en nuestra tecnología.', icon: 'Users' },
    { value: 120, prefix: '', suffix: 'k', label: 'Líneas de Código', description: 'Desarrollo robusto y escalable.', icon: 'Zap' },
    { value: 15, prefix: '', suffix: '', label: 'Premios Ganados', description: 'Reconocimientos a la excelencia.', icon: 'Award' },
    { value: 99, prefix: '', suffix: '%', label: 'Satisfacción', description: 'Nuestros clientes nos recomiendan.', icon: 'Heart' }
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
      className="w-full relative overflow-hidden"
      style={{ 
        backgroundColor: bgColor,
        backgroundImage: sectionGradient ? `linear-gradient(to bottom, ${bgColor}, white)` : 'none',
        paddingTop: `${paddingY}px`,
        paddingBottom: `${paddingY}px`
      }}
    >
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        {showHeader && (
          <div 
            className={`flex flex-col mb-12 ${headerAlign === 'center' ? 'items-center text-center' : 'items-start text-left'}`}
            style={{ marginBottom: `${headerMarginB}px` }}
          >
            {eyebrow && (
              <span 
                className="text-sm font-bold tracking-widest mb-3 uppercase"
                style={{ color: eyebrowColor }}
              >
                {eyebrow}
              </span>
            )}
            <h2 
              className="font-black text-slate-900 mb-4 leading-tight text-3xl @md:text-4xl @lg:text-5xl"
              style={{ fontSize: `${headerTitleSize}px` }}
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
            layout === 'inline' ? 'grid-cols-1 @md:grid-cols-2' :
            columns === 5 ? 'grid-cols-2 @sm:grid-cols-3 @lg:grid-cols-5' :
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
              hoverEffect={hoverEffect}
              cardBg={cardBg}
              cardRadius={cardRadius}
              showBorder={showBorder}
              cardShadow={cardShadow}
              numberColor={numberColor}
              labelColor={labelColor}
              descColor={descColor}
              numberSize={numberSize}
              showIcons={showIcons}
              iconSize={iconSize}
              iconShape={iconShape}
              iconColor={iconColor}
              iconBg={iconBg}
              countSpeed={countSpeed}
              countEasing={countEasing}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};
