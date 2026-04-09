import React from 'react';
import { motion } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { CheckCircle2 } from 'lucide-react';

const StepItem = ({ 
  step, 
  index, 
  layout, 
  staggerAnim, 
  itemVariants, 
  hoverLift, 
  cardBg, 
  cardPadding, 
  cardRadius, 
  cardBorder, 
  indicatorBg, 
  indicatorColor, 
  indicatorSize,
  indicatorGlow,
  useIcons,
  isLast,
  connectorStyle,
  connectorColor,
  drawConnectors,
  titleSize,
  descSize,
  hoverGlow
}: any) => {
  const IconComponent = (LucideIcons as any)[step.icon] || CheckCircle2;
  const isHorizontal = layout === 'horizontal';
  const isVertical = layout === 'vertical';
  const isAlternating = layout === 'alternating';

  const renderIndicator = () => (
    <div 
      className={`flex items-center justify-center flex-shrink-0 z-10 relative group-hover:scale-110 transition-transform duration-500 ${indicatorGlow ? 'shadow-lg' : ''}`}
      style={{ 
        width: `${indicatorSize}px`, 
        height: `${indicatorSize}px`, 
        backgroundColor: indicatorBg,
        color: indicatorColor,
        borderRadius: '50%',
        boxShadow: indicatorGlow ? `0 0 20px ${indicatorBg}44` : '0 4px 12px rgba(0,0,0,0.1)'
      }}
    >
      {useIcons ? <IconComponent size={indicatorSize * 0.45} /> : <span className="font-black" style={{ fontSize: `${indicatorSize * 0.4}px` }}>{index + 1}</span>}
      
      {hoverGlow && (
        <div 
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"
          style={{ backgroundColor: indicatorBg }}
        />
      )}
    </div>
  );

  const renderConnector = () => {
    if (isLast || connectorStyle === 'none') return null;
    
    const isDashed = connectorStyle === 'dashed';
    const isGradient = connectorStyle === 'gradient';
    
    if (isHorizontal) {
      return (
        <div className="absolute top-6 left-1/2 w-full -z-0">
          <motion.div 
            initial={drawConnectors ? { scaleX: 0 } : { scaleX: 1 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 1, delay: index * 0.2 }}
            className="origin-left h-[2px] w-full"
            style={{ 
              borderTop: isDashed ? `2px dashed ${connectorColor}` : isGradient ? 'none' : `2px solid ${connectorColor}`,
              background: isGradient ? `linear-gradient(to right, ${connectorColor}, transparent)` : 'none'
            }} 
          />
        </div>
      );
    }
    
    if (isVertical || isAlternating) {
      const leftPos = isAlternating ? (index % 2 === 0 ? 'left-6' : 'right-6') : 'left-6';
      return (
        <div className={`absolute top-12 ${leftPos} h-full -z-0`}>
          <motion.div 
            initial={drawConnectors ? { scaleY: 0 } : { scaleY: 1 }}
            whileInView={{ scaleY: 1 }}
            transition={{ duration: 1, delay: index * 0.2 }}
            className="origin-top w-[2px] h-full"
            style={{ 
              borderLeft: isDashed ? `2px dashed ${connectorColor}` : isGradient ? 'none' : `2px solid ${connectorColor}`,
              background: isGradient ? `linear-gradient(to bottom, ${connectorColor}, transparent)` : 'none'
            }} 
          />
        </div>
      );
    }
    
    return null;
  };

  const CardWrapper = step.link ? 'a' : 'div';

  return (
    <motion.div
      variants={staggerAnim ? itemVariants : {}}
      className={`relative flex flex-col items-center text-center group @md:flex-row @md:gap-8 @md:items-start ${isHorizontal ? '@md:flex-col @md:items-center @md:text-center' : '@md:text-left'}`}
    >
      {renderConnector()}
      
      <div className={`${isHorizontal ? 'mb-6 @md:mb-6' : 'mb-6 @md:mb-0 @md:mt-1'}`}>
        {renderIndicator()}
      </div>

      <CardWrapper
        href={step.link}
        className={`flex-1 transition-all duration-500 block ${step.link ? 'hover:scale-[1.02]' : ''}`}
        style={{ 
          backgroundColor: isHorizontal ? 'transparent' : cardBg,
          padding: isHorizontal ? '0' : `${cardPadding}px`,
          borderRadius: `${cardRadius}px`,
          border: isHorizontal ? 'none' : `1px solid ${cardBorder}`,
        }}
      >
        <motion.div
          whileHover={hoverLift ? { y: -8 } : {}}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {step.badge && (
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full mb-3">
              {step.badge}
            </span>
          )}
          <h3 className="font-bold text-slate-900 mb-3 leading-tight" style={{ fontSize: `${titleSize}px` }}>
            {step.title}
          </h3>
          <p className="text-slate-500 leading-relaxed" style={{ fontSize: `${descSize}px` }}>
            {step.desc}
          </p>
          
          {step.link && (
            <div className="mt-4 flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
              Ver más <LucideIcons.ArrowRight size={14} />
            </div>
          )}
        </motion.div>
      </CardWrapper>
    </motion.div>
  );
};

export const ProcessModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any> 
}> = ({ moduleId, settingsValues }) => {
  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  };

  // Global Settings
  const layout = getVal(null, 'layout', 'horizontal');
  const columns = getVal(null, 'columns', 4);
  const paddingY = getVal(null, 'padding_y', 120);
  const gap = getVal(null, 'gap', 40);
  const bgColor = getVal(null, 'bg_color', '#F8FAFC');
  const connectorStyle = getVal(null, 'connector_style', 'dashed');
  const connectorColor = getVal(null, 'connector_color', 'rgba(var(--primary-rgb), 0.2)');
  const entranceAnim = getVal(null, 'entrance_anim', true);
  const drawConnectors = getVal(null, 'draw_connectors', true);
  const hoverGlow = getVal(null, 'hover_glow', true);

  // Element: Header
  const eyebrow = getVal(`${moduleId}_el_process_header`, 'eyebrow', 'METODOLOGÍA');
  const headerTitle = getVal(`${moduleId}_el_process_header`, 'title', 'Nuestro Proceso');
  const headerSubtitle = getVal(`${moduleId}_el_process_header`, 'subtitle', 'Cómo trabajamos para hacer realidad tus ideas.');
  const headerAlign = getVal(`${moduleId}_el_process_header`, 'align', 'center');
  const headerTitleSize = getVal(`${moduleId}_el_process_header`, 'title_size', 40);
  const headerTitleColor = getVal(`${moduleId}_el_process_header`, 'title_color', '#0F172A');
  const eyebrowColor = getVal(`${moduleId}_el_process_header`, 'eyebrow_color', 'var(--primary-color)');
  const headerMarginB = getVal(`${moduleId}_el_process_header`, 'margin_b', 80);

  // Element: Step Style
  const cardBg = getVal(`${moduleId}_el_process_step`, 'card_bg', '#FFFFFF');
  const cardBorder = getVal(`${moduleId}_el_process_step`, 'card_border', 'rgba(0,0,0,0.05)');
  const cardRadius = getVal(`${moduleId}_el_process_step`, 'card_radius', 24);
  const cardPadding = getVal(`${moduleId}_el_process_step`, 'card_padding', 32);
  const stepTitleSize = getVal(`${moduleId}_el_process_step`, 'step_title_size', 20);
  const stepDescSize = getVal(`${moduleId}_el_process_step`, 'step_desc_size', 15);
  const hoverLift = getVal(`${moduleId}_el_process_step`, 'hover_lift', true);

  // Element: Indicator
  const indicatorBg = getVal(`${moduleId}_el_process_indicator`, 'indicator_bg', 'var(--primary-color)');
  const indicatorColor = getVal(`${moduleId}_el_process_indicator`, 'indicator_color', '#FFFFFF');
  const indicatorSize = getVal(`${moduleId}_el_process_indicator`, 'indicator_size', 48);
  const indicatorGlow = getVal(`${moduleId}_el_process_indicator`, 'indicator_glow', true);
  const useIcons = getVal(`${moduleId}_el_process_indicator`, 'use_icons', true);

  const steps = getVal(null, 'steps', []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
  };

  const gridCols = {
    2: '@md:grid-cols-2',
    3: '@md:grid-cols-3',
    4: '@md:grid-cols-4',
    5: '@md:grid-cols-5'
  }[columns as 2|3|4|5] || '@md:grid-cols-4';

  return (
    <section 
      className="w-full relative overflow-hidden"
      style={{ 
        backgroundColor: bgColor,
        paddingTop: `${paddingY}px`,
        paddingBottom: `${paddingY}px`
      }}
    >
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <div 
          className={`flex flex-col ${headerAlign === 'center' ? 'items-center text-center' : 'items-start text-left'}`}
          style={{ marginBottom: `${headerMarginB}px` }}
        >
          {eyebrow && (
            <span className="font-bold tracking-[0.3em] text-[10px] @md:text-xs uppercase mb-4 block" style={{ color: eyebrowColor }}>
              {eyebrow}
            </span>
          )}
          <h2 
            className="font-black leading-tight mb-6"
            style={{ fontSize: `${headerTitleSize}px`, color: headerTitleColor }}
          >
            {headerTitle}
          </h2>
          {headerSubtitle && (
            <p className="text-slate-500 max-w-2xl text-base @md:text-lg">
              {headerSubtitle}
            </p>
          )}
        </div>

        {/* Process Flow */}
        <motion.div 
          variants={entranceAnim ? containerVariants : {}}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className={`grid ${layout === 'horizontal' ? `grid-cols-1 ${gridCols}` : 'grid-cols-1 max-w-4xl mx-auto'}`}
          style={{ gap: `${gap}px` }}
        >
          {steps.map((step: any, i: number) => (
            <StepItem 
              key={i} 
              step={step} 
              index={i} 
              layout={layout}
              staggerAnim={entranceAnim}
              itemVariants={itemVariants}
              hoverLift={hoverLift}
              cardBg={cardBg}
              cardPadding={cardPadding}
              cardRadius={cardRadius}
              cardBorder={cardBorder}
              indicatorBg={indicatorBg}
              indicatorColor={indicatorColor}
              indicatorSize={indicatorSize}
              indicatorGlow={indicatorGlow}
              useIcons={useIcons}
              isLast={i === steps.length - 1}
              connectorStyle={connectorStyle}
              connectorColor={connectorColor}
              drawConnectors={drawConnectors}
              titleSize={stepTitleSize}
              descSize={stepDescSize}
              hoverGlow={hoverGlow}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};
