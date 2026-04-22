import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useInView, useSpring, useTransform, animate, useScroll } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { Star } from 'lucide-react';
import { TYPOGRAPHY_SCALE, FONT_WEIGHTS } from '../../../constants/typography';
import { TextRenderer } from '../TextRenderer';
import { ParallaxBackground } from '../ParallaxBackground';
import { parseNumSafe } from '../utils';

const CountUp = ({ value, duration = 2, easing = 'spring' }: { value: number | string, duration?: number, easing?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);
  
  const numericValue = parseNumSafe(value, 0);
  
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
        spring.set(numericValue);
      } else {
        const controls = animate(0, numericValue, {
          duration: duration,
          ease: "linear",
          onUpdate: (latest) => setDisplay(Math.floor(latest))
        });
        return () => controls.stop();
      }
    }
  }, [isInView, numericValue, spring, easing, duration]);

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
        width: `${parseNumSafe(size, 24) * 2.5}px`,
        height: `${parseNumSafe(size, 24) * 2.5}px`
      }}
    >
      <Icon size={parseNumSafe(size, 24)} />
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
  numberWeight,
  showIcons, 
  iconSize,
  iconShape,
  iconColor, 
  iconBg,
  countSpeed,
  countEasing,
  darkMode
}: any) => {
  const IconComponent = (LucideIcons as any)[stat.icon] || Star;
  const isMinimal = layout === 'minimal';
  const isBento = layout === 'bento';
  const isInline = layout === 'inline';
  
  const bentoClass = isBento ? (index === 0 ? '@md:col-span-2 @md:row-span-2' : '@md:col-span-1 @md:row-span-1') : '';
  
  const shadowClass = {
    none: '',
    soft: darkMode ? 'shadow-none' : 'shadow-lg shadow-slate-200/50',
    glow: `shadow-xl shadow-[${iconColor}]/10`
  }[cardShadow as string] || '';

  const hoverStyles = {
    none: {},
    scale: { scale: 1.05 },
    lift: { y: -10, boxShadow: darkMode ? '0 20px 40px -15px rgba(0,0,0,0.5)' : '0 20px 40px -15px rgba(0,0,0,0.1)' }
  }[hoverEffect as string] || {};

  return (
    <motion.div
      variants={entranceAnim ? itemVariants : {}}
      whileHover={hoverStyles}
      className={`flex ${isInline ? 'flex-row items-center text-left gap-6' : 'flex-col items-center text-center'} p-8 transition-all duration-300 ${bentoClass} ${shadowClass}`}
      style={{ 
        backgroundColor: cardBg, 
        borderRadius: `${cardRadius}px`,
        borderWidth: showBorder ? '1px' : '0px',
        borderStyle: showBorder ? 'solid' : 'none',
        borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(241, 245, 249, 1)'
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
          className="mb-1 flex items-baseline gap-1 leading-none"
          style={{ 
            color: numberColor, 
            fontSize: `${TYPOGRAPHY_SCALE[numberSize as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 48}px`,
            fontWeight: FONT_WEIGHTS[numberWeight as keyof typeof FONT_WEIGHTS]?.value || 900
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

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Global Settings
  const layout = getVal(null, 'layout', 'grid');
  const columns = parseNumSafe(getVal(null, 'columns', 4), 4);
  const gap = parseNumSafe(getVal(null, 'gap', 30), 30);
  const paddingY = parseNumSafe(getVal(null, 'padding_y', 100), 100);
  const darkMode = getVal(null, 'dark_mode', false);
  const bgColor = darkMode ? '#0F172A' : getVal(null, 'bg_color', '#FFFFFF');
  const sectionGradient = getVal(null, 'section_gradient', false);
  const bgGradient = getVal(null, 'bg_gradient', 'linear-gradient(to bottom, #FFFFFF, #F8FAFC)');
  const entranceAnim = getVal(null, 'entrance_anim', true);
  const countSpeed = parseNumSafe(getVal(null, 'count_speed', 2), 2);
  const countEasing = getVal(null, 'count_easing', 'spring');

  // Multimedia (Parallax Background)
  const bgParallaxEnabled = getVal(null, 'bg_parallax_enabled', false);
  const bgParallaxImg = getVal(null, 'bg_parallax_img', '');
  const bgParallaxOpacity = parseNumSafe(getVal(null, 'bg_parallax_opacity', 20), 20);
  const bgParallaxOverlay = getVal(null, 'bg_parallax_overlay', '#000000');
  const bgParallaxSpeed = parseNumSafe(getVal(null, 'bg_parallax_speed', 100), 100);

  // Element: Header
  const showHeader = getVal(`${moduleId}_el_stats_header`, 'show_header', true);
  const eyebrow = getVal(`${moduleId}_el_stats_header`, 'eyebrow', 'NUESTRO IMPACTO');
  const headerTitle = getVal(`${moduleId}_el_stats_header`, 'title', 'Números que hablan por nosotros');
  const headerSubtitle = getVal(`${moduleId}_el_stats_header`, 'subtitle', 'Resultados tangibles que respaldan nuestra trayectoria.');
  const headerAlign = getVal(`${moduleId}_el_stats_header`, 'align', 'center');
  const headerTitleSize = getVal(`${moduleId}_el_stats_header`, 'title_size', 't2');
  const headerTitleWeight = getVal(`${moduleId}_el_stats_header`, 'title_weight', 'bold');
  const headerSubtitleSize = getVal(`${moduleId}_el_stats_header`, 'subtitle_size', 'p');
  const headerSubtitleWeight = getVal(`${moduleId}_el_stats_header`, 'subtitle_weight', 'normal');
  const headerEyebrowColor = getVal(`${moduleId}_el_stats_header`, 'eyebrow_color', '#3B82F6');
  const headerEyebrowBg = getVal(`${moduleId}_el_stats_header`, 'eyebrow_bg', 'rgba(59, 130, 246, 0.1)');
  const headerMarginB = parseNumSafe(getVal(`${moduleId}_el_stats_header`, 'margin_b', 60), 60);

  const titleHighlightType = getVal(`${moduleId}_el_stats_header`, 'title_highlight_type', 'gradient');
  const titleHighlightColor = getVal(`${moduleId}_el_stats_header`, 'title_highlight_color', '#3B82F6');
  const titleHighlightGradient = getVal(`${moduleId}_el_stats_header`, 'title_highlight_gradient', 'linear-gradient(to right, #3B82F6, #2563EB)');
  const titleHighlightBold = getVal(`${moduleId}_el_stats_header`, 'title_highlight_bold', true);

  const subtitleHighlightType = getVal(`${moduleId}_el_stats_header`, 'subtitle_highlight_type', 'none');
  const subtitleHighlightColor = getVal(`${moduleId}_el_stats_header`, 'subtitle_highlight_color', '#3B82F6');
  const subtitleHighlightGradient = getVal(`${moduleId}_el_stats_header`, 'subtitle_highlight_gradient', 'linear-gradient(to right, #3B82F6, #2563EB)');
  const subtitleHighlightBold = getVal(`${moduleId}_el_stats_header`, 'subtitle_highlight_bold', true);

  const headerTitleColor = darkMode ? '#FFFFFF' : undefined;

  // Element: Stat Item Style
  const cardBg = darkMode ? '#1E293B' : getVal(`${moduleId}_el_stat_item`, 'card_bg', 'transparent');
  const cardRadius = parseNumSafe(getVal(`${moduleId}_el_stat_item`, 'card_radius', 24), 24);
  const showBorder = getVal(`${moduleId}_el_stat_item`, 'show_border', false);
  const cardShadow = getVal(`${moduleId}_el_stat_item`, 'card_shadow', 'none');
  const numberColor = getVal(`${moduleId}_el_stat_item`, 'number_color', darkMode ? '#FFFFFF' : '#0F172A');
  const labelColor = getVal(`${moduleId}_el_stat_item`, 'label_color', darkMode ? '#94A3B8' : '#64748B');
  const descColor = getVal(`${moduleId}_el_stat_item`, 'desc_color', darkMode ? '#64748B' : '#94A3B8');
  const numberSize = getVal(`${moduleId}_el_stat_item`, 'number_size', 't1');
  const numberWeight = getVal(`${moduleId}_el_stat_item`, 'number_weight', 'black');
  const hoverEffect = getVal(`${moduleId}_el_stat_item`, 'hover_effect', 'scale');

  // Element: Icon Style
  const showIcons = getVal(`${moduleId}_el_stat_icon`, 'show_icons', true);
  const iconSize = parseNumSafe(getVal(`${moduleId}_el_stat_icon`, 'icon_size', 24), 24);
  const iconShape = getVal(`${moduleId}_el_stat_icon`, 'icon_shape', 'squircle');
  const iconColor = getVal(`${moduleId}_el_stat_icon`, 'icon_color', 'var(--primary-color)');
  const iconBg = darkMode ? 'rgba(255, 255, 255, 0.05)' : getVal(`${moduleId}_el_stat_icon`, 'icon_bg', 'rgba(59, 130, 246, 0.1)');

  const getTypographyStyle = (sizeToken: string, weightToken: string, alignToken?: string) => {
    const size = TYPOGRAPHY_SCALE[sizeToken as keyof typeof TYPOGRAPHY_SCALE] || TYPOGRAPHY_SCALE.p;
    const weight = FONT_WEIGHTS[weightToken as keyof typeof FONT_WEIGHTS] || FONT_WEIGHTS.normal;
    
    return {
      fontSize: `${size.fontSize}px`,
      lineHeight: size.lineHeight,
      fontWeight: weight.value,
      textAlign: (alignToken && alignToken !== 'inherit') ? alignToken : undefined
    } as React.CSSProperties;
  };

  // Element: Items
  const userItems = getVal(`${moduleId}_el_stats_items`, 'items', []);
  const stats = userItems.length > 0 ? userItems : [
    { value: 500, prefix: '', suffix: '+', label: 'Clientes Felices', description: 'Empresas que confían en nuestra tecnología.', icon: 'Users' },
    { value: 120, prefix: '', suffix: 'k', label: 'Líneas de Código', description: 'Desarrollo robusto y escalable.', icon: 'Zap' },
    { value: 15, prefix: '', suffix: '', label: 'Premios Ganados', description: 'Reconocimientos a la excelencia.', icon: 'Award' },
    { value: 99, prefix: '', suffix: '%', label: 'Satisfacción', description: 'Nuestros clientes nos recomiendan.', icon: 'Heart' }
  ];

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
      id={moduleId}
      ref={containerRef}
      className="w-full relative overflow-hidden"
      style={{ 
        backgroundColor: bgColor,
        backgroundImage: (sectionGradient && typeof bgGradient === 'string' && !bgGradient.includes('NaN')) ? bgGradient : 'none',
        paddingTop: `${paddingY}px`,
        paddingBottom: `${paddingY}px`
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
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        {/* Header */}
        {showHeader && (
          <div 
            className={`flex flex-col w-full mb-12 ${headerAlign === 'center' ? 'items-center text-center' : headerAlign === 'right' ? 'items-end text-right' : 'items-start text-left'}`}
            style={{ marginBottom: `${headerMarginB}px` }}
          >
            {eyebrow && (
              <span 
                className="text-[10px] font-bold tracking-[0.2em] uppercase mb-4 px-3 py-1 rounded-full"
                style={{ 
                  color: headerEyebrowColor,
                  backgroundColor: headerEyebrowBg
                }}
              >
                {eyebrow}
              </span>
            )}
            <h2 
              className="mb-4 leading-tight"
              style={{ 
                ...getTypographyStyle(headerTitleSize as any, headerTitleWeight, headerAlign),
                color: darkMode ? '#FFFFFF' : getVal(`${moduleId}_el_stats_header`, 'title_color', '#0F172A')
              }}
            >
              <TextRenderer 
                text={headerTitle}
                highlightType={titleHighlightType}
                highlightColor={titleHighlightColor}
                highlightGradient={titleHighlightGradient}
                highlightBold={titleHighlightBold}
              />
            </h2>
            {headerSubtitle && (
              <p 
                className="max-w-2xl text-lg leading-relaxed"
                style={{ 
                  ...getTypographyStyle(headerSubtitleSize as any, headerSubtitleWeight, headerAlign),
                  color: darkMode ? '#94A3B8' : getVal(`${moduleId}_el_stats_header`, 'subtitle_color', '#64748B') 
                }}
              >
                <TextRenderer 
                  text={headerSubtitle}
                  highlightType={subtitleHighlightType}
                  highlightColor={subtitleHighlightColor}
                  highlightGradient={subtitleHighlightGradient}
                  highlightBold={subtitleHighlightBold}
                />
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
              numberWeight={numberWeight}
              showIcons={showIcons}
              iconSize={iconSize}
              iconShape={iconShape}
              iconColor={iconColor}
              iconBg={iconBg}
              countSpeed={countSpeed}
              countEasing={countEasing}
              darkMode={darkMode}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};
