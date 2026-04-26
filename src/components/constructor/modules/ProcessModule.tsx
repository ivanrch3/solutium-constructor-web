import React from 'react';
import { motion } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { CheckCircle2 } from 'lucide-react';
import { TYPOGRAPHY_SCALE, FONT_WEIGHTS } from '../../../constants/typography';
import { TextRenderer } from '../TextRenderer';
import { InlineEditableText } from '../InlineEditableText';
import { useEditorStore } from '../../../store/editorStore';
import { GLOBAL_ANIMATIONS, getGlobalAnimation } from '../../../constants/animations';

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
  indicatorShape,
  useIcons,
  isLast,
  connectorStyle,
  connectorColor,
  drawConnectors,
  titleSize,
  titleWeight,
  descSize,
  textAlign,
  hoverGlow,
  darkMode,
  moduleId,
  isPreviewMode,
  onSave
}: any) => {
  const IconComponent = (LucideIcons as any)[step.icon] || CheckCircle2;
  const isHorizontal = layout === 'horizontal';
  const isVertical = layout === 'vertical';
  const isAlternating = layout === 'alternating';

  const getShapeClass = (shape: string) => {
    switch (shape) {
      case 'squircle': return 'rounded-[30%]';
      case 'diamond': return 'rotate-45 rounded-sm';
      case 'hexagon': return 'clip-path-hexagon'; // Requiere CSS o inline style
      default: return 'rounded-full';
    }
  };

  const renderIndicator = () => (
    <div 
      className={`flex items-center justify-center flex-shrink-0 z-10 relative group-hover:scale-110 transition-transform duration-500 shadow-lg ${getShapeClass(indicatorShape)}`}
      style={{ 
        width: `${parseFloat(indicatorSize as any) || 48}px`, 
        height: `${parseFloat(indicatorSize as any) || 48}px`, 
        backgroundColor: indicatorBg,
        color: indicatorColor,
        boxShadow: indicatorGlow ? (indicatorBg.startsWith('#') ? `0 0 20px ${indicatorBg}44` : `0 0 20px rgba(0,0,0,0.1)`) : '0 4px 12px rgba(0,0,0,0.1)',
        clipPath: indicatorShape === 'hexagon' ? 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' : 'none'
      }}
    >
      <div className={indicatorShape === 'diamond' ? '-rotate-45' : ''}>
        {useIcons ? <IconComponent size={(parseFloat(indicatorSize as any) || 48) * 0.45} /> : <span className="font-black" style={{ fontSize: `${(parseFloat(indicatorSize as any) || 48) * 0.4}px` }}>{index + 1}</span>}
      </div>
      
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
    const isCurved = connectorStyle === 'curved';
    
    if (isHorizontal) {
      return (
        <div className="absolute top-6 left-1/2 w-full -z-0">
          <motion.div 
            initial={drawConnectors ? { scaleX: 0 } : { scaleX: 1 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 1, delay: index * 0.2 }}
            className="origin-left h-[2px] w-full"
            style={{ 
              borderTopWidth: isHorizontal && !isGradient ? '2px' : '0px',
              borderTopStyle: isDashed ? 'dashed' : 'solid',
              borderTopColor: isHorizontal && !isGradient ? connectorColor : 'transparent',
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
              borderLeftWidth: (isVertical || isAlternating) && !isGradient ? '2px' : '0px',
              borderLeftStyle: isDashed ? 'dashed' : 'solid',
              borderLeftColor: (isVertical || isAlternating) && !isGradient ? connectorColor : 'transparent',
              background: isGradient ? `linear-gradient(to bottom, ${connectorColor}, transparent)` : 'none',
              borderRadius: isCurved ? '20px' : undefined
            }} 
          />
        </div>
      );
    }
    
    return null;
  };

  const hasLink = step.link_url && step.link_url !== '#' && step.link_url !== '';
  const CardWrapper = hasLink ? 'a' : 'div';
  const wrapperProps = hasLink ? { 
    href: step.link_url, 
    target: step.link_target === '_blank' ? '_blank' : '_self' ,
    rel: step.link_target === '_blank' ? 'noopener noreferrer' : undefined 
  } : {};

  return (
    <motion.div
      variants={staggerAnim ? itemVariants : {}}
      className={`relative flex flex-col items-center text-center group @md:flex-row @md:gap-8 @md:items-start ${isHorizontal ? '@md:flex-col @md:items-center @md:text-center' : isAlternating && index % 2 !== 0 ? '@md:flex-row-reverse @md:text-right' : '@md:text-left'}`}
    >
      {renderConnector()}
      
      <div className={`${isHorizontal ? 'mb-6 @md:mb-6' : 'mb-6 @md:mb-0 @md:mt-1'}`}>
        {renderIndicator()}
      </div>

      <CardWrapper
        {...wrapperProps}
        className={`flex-1 transition-all duration-500 block ${hasLink ? 'hover:scale-[1.02]' : ''}`}
        style={{ 
          backgroundColor: isHorizontal ? 'transparent' : cardBg,
          padding: isHorizontal ? '0' : `${parseFloat(cardPadding as any) || 32}px`,
          borderRadius: `${parseFloat(cardRadius as any) || 24}px`,
          borderWidth: isHorizontal ? '0px' : '1px',
          borderStyle: isHorizontal ? 'none' : 'solid',
          borderColor: isHorizontal ? 'transparent' : cardBorder,
        }}
      >
        <motion.div
          whileHover={hoverLift ? { y: -8 } : {}}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {step.image && (
            <div className="mb-6 overflow-hidden rounded-2xl aspect-video bg-slate-100">
              <img src={step.image} alt={step.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
            </div>
          )}
          {step.badge && (
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full mb-3">
              {step.badge}
            </span>
          )}
          <h3 
            className="mb-3 leading-tight" 
            style={{ 
              fontSize: `${TYPOGRAPHY_SCALE[titleSize as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 20}px`,
              fontWeight: FONT_WEIGHTS[titleWeight as keyof typeof FONT_WEIGHTS]?.value || 800,
              textAlign: textAlign !== 'inherit' ? textAlign : undefined,
              color: darkMode ? '#FFFFFF' : '#0F172A'
            }}
          >
            <InlineEditableText
              moduleId={moduleId}
              settingId="title"
              value={step.title}
              isPreviewMode={isPreviewMode}
              onSave={(val) => onSave('title', val)}
            />
          </h3>
          <p 
            className="leading-relaxed" 
            style={{ 
              fontSize: `${TYPOGRAPHY_SCALE[descSize as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 16}px`,
              textAlign: textAlign !== 'inherit' ? textAlign : undefined,
              color: darkMode ? '#94A3B8' : '#64748B'
            }}
          >
            <InlineEditableText
              moduleId={moduleId}
              settingId="desc"
              value={step.desc}
              isPreviewMode={isPreviewMode}
              onSave={(val) => onSave('desc', val)}
            />
          </p>
          
          {hasLink && (
            <div className={`mt-4 flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity ${isAlternating && index % 2 !== 0 ? 'justify-end' : ''}`}>
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
  settingsValues: Record<string, any>,
  isPreviewMode?: boolean
}> = ({ moduleId, settingsValues, isPreviewMode = false }) => {
  const { updateSectionSettings } = useEditorStore();
  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  };

  const parseF = (val: any, fallback: number) => {
    const f = parseFloat(val);
    return isNaN(f) ? fallback : f;
  };

  // Global Settings
  const layout = getVal(null, 'layout', 'horizontal');
  const columns = Math.max(1, parseInt(getVal(null, 'columns', 4)) || 4);
  const paddingY = parseF(getVal(null, 'padding_y', 120), 120);
  const gap = parseF(getVal(null, 'gap', 40), 40);
  const darkMode = getVal(null, 'dark_mode', false);
  const bgColor = getVal(null, 'bg_color', darkMode ? '#0F172A' : '#F8FAFC');
  const sectionGradient = getVal(null, 'section_gradient', false);
  const bgGradient = getVal(null, 'bg_gradient', 'linear-gradient(to bottom, #F8FAFC, #FFFFFF)');
  const connectorStyle = getVal(null, 'connector_style', 'dashed');
  const connectorColor = darkMode ? 'rgba(255,255,255,0.1)' : getVal(null, 'connector_color', 'rgba(59, 130, 246, 0.2)');
  const entranceAnim = getVal(null, 'entrance_anim', 'fade_up');

  // Animation Overrides
  const globalAnimOverride = getGlobalAnimation(entranceAnim, 'process');

  const drawConnectors = getVal(null, 'draw_connectors', true);
  const hoverGlow = getVal(null, 'hover_glow', true);

  // Element: Textos
  const eyebrow = getVal(`${moduleId}_el_process_header`, 'eyebrow', 'METODOLOGÍA');
  const headerTitle = getVal(`${moduleId}_el_process_header`, 'title', 'Nuestro Proceso');
  const headerSubtitle = getVal(`${moduleId}_el_process_header`, 'subtitle', 'Cómo trabajamos para hacer realidad tus ideas.');
  const headerAlign = getVal(`${moduleId}_el_process_header`, 'align', 'center');
  const headerTitleSize = getVal(`${moduleId}_el_process_header`, 'title_size', 't2');
  const headerTitleWeight = getVal(`${moduleId}_el_process_header`, 'title_weight', 'bold');
  const headerEyebrowColor = getVal(`${moduleId}_el_process_header`, 'eyebrow_color', '#3B82F6');
  const headerEyebrowBg = getVal(`${moduleId}_el_process_header`, 'eyebrow_bg', 'rgba(59, 130, 246, 0.1)');
  const headerMarginB = parseF(getVal(`${moduleId}_el_process_header`, 'margin_b', 80), 80);

  const headerTitleColor = darkMode ? '#FFFFFF' : undefined;

  // Element: Lista de Pasos
  const steps = getVal(`${moduleId}_el_process_items`, 'steps', []);

  // Element: Step Style
  const cardBg = darkMode ? '#1E293B' : getVal(`${moduleId}_el_process_step`, 'card_bg', '#FFFFFF');
  const cardBorder = darkMode ? 'rgba(255,255,255,0.1)' : getVal(`${moduleId}_el_process_step`, 'card_border', 'rgba(0,0,0,0.05)');
  const cardRadius = parseF(getVal(`${moduleId}_el_process_step`, 'card_radius', 24), 24);
  const cardPadding = parseF(getVal(`${moduleId}_el_process_step`, 'card_padding', 32), 32);
  const stepTitleSize = getVal(`${moduleId}_el_process_step`, 'step_title_size', 't3');
  const stepTitleWeight = getVal(`${moduleId}_el_process_step`, 'step_title_weight', 'bold');
  const stepDescSize = getVal(`${moduleId}_el_process_step`, 'step_desc_size', 'p');
  const stepTextAlign = getVal(`${moduleId}_el_process_step`, 'text_align', 'inherit');
  const hoverLift = getVal(`${moduleId}_el_process_step`, 'hover_lift', true);

  // Element: Indicator
  const indicatorBg = getVal(`${moduleId}_el_process_indicator`, 'indicator_bg', '#3B82F6');
  const indicatorColor = getVal(`${moduleId}_el_process_indicator`, 'indicator_color', '#FFFFFF');
  const indicatorSize = parseF(getVal(`${moduleId}_el_process_indicator`, 'indicator_size', 48), 48);
  const indicatorGlow = getVal(`${moduleId}_el_process_indicator`, 'indicator_glow', true);
  const indicatorShape = getVal(`${moduleId}_el_process_indicator`, 'indicator_shape', 'circle');
  const useIcons = getVal(`${moduleId}_el_process_indicator`, 'use_icons', true);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = globalAnimOverride || {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
  };

  const gridCols = {
    2: '@md:grid-cols-2',
    3: '@md:grid-cols-3',
    4: '@md:grid-cols-4',
    5: '@md:grid-cols-5'
  }[columns as 2|3|4|5] || '@md:grid-cols-4';

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

  return (
    <section 
      className="w-full relative overflow-hidden"
      style={{ 
        backgroundColor: bgColor,
        backgroundImage: (sectionGradient && typeof bgGradient === 'string' && !bgGradient.includes('NaN')) ? bgGradient : 'none',
        paddingTop: `${paddingY}px`,
        paddingBottom: `${paddingY}px`
      }}
    >
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <div 
          className={`flex flex-col w-full ${headerAlign === 'center' ? 'items-center text-center' : headerAlign === 'right' ? 'items-end text-right' : 'items-start text-left'}`}
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
              <InlineEditableText
                moduleId={moduleId}
                elementId={`${moduleId}_el_process_header`}
                settingId="eyebrow"
                value={eyebrow}
                isPreviewMode={isPreviewMode}
              />
            </span>
          )}
          <h2 
            className="mb-6"
            style={{ 
              ...getTypographyStyle(headerTitleSize as any, headerTitleWeight, headerAlign),
              color: headerTitleColor 
            }}
          >
            <InlineEditableText
              moduleId={moduleId}
              elementId={`${moduleId}_el_process_header`}
              settingId="title"
              value={headerTitle}
              isPreviewMode={isPreviewMode}
            >
              <TextRenderer 
                text={headerTitle}
                highlightType={getVal(`${moduleId}_el_process_header`, 'title_highlight_type', 'gradient')}
                highlightColor={getVal(`${moduleId}_el_process_header`, 'title_highlight_color', '#3B82F6')}
                highlightGradient={getVal(`${moduleId}_el_process_header`, 'title_highlight_gradient', 'linear-gradient(to right, #3B82F6, #2563EB)')}
                highlightBold={getVal(`${moduleId}_el_process_header`, 'title_highlight_bold', true)}
              />
            </InlineEditableText>
          </h2>
          {headerSubtitle && (
            <p 
              className="max-w-2xl text-base @md:text-lg"
              style={{ color: darkMode ? '#94A3B8' : '#64748B' }}
            >
              <InlineEditableText
                moduleId={moduleId}
                elementId={`${moduleId}_el_process_header`}
                settingId="subtitle"
                value={headerSubtitle}
                isPreviewMode={isPreviewMode}
              />
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
              indicatorShape={indicatorShape}
              useIcons={useIcons}
              isLast={i === steps.length - 1}
              connectorStyle={connectorStyle}
              connectorColor={connectorColor}
              drawConnectors={drawConnectors}
              titleSize={stepTitleSize}
              titleWeight={stepTitleWeight}
              descSize={stepDescSize}
              textAlign={stepTextAlign}
              hoverGlow={hoverGlow}
              darkMode={darkMode}
              moduleId={moduleId}
              isPreviewMode={isPreviewMode}
              onSave={(field: string, val: string) => {
                const newItems = [...steps];
                newItems[i] = { ...newItems[i], [field]: val };
                updateSectionSettings(moduleId, { [`${moduleId}_el_process_items_steps`]: newItems });
              }}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};
