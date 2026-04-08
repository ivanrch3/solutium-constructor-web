import React from 'react';
import { motion } from 'motion/react';
import { Search, PenTool, Code, Rocket, CheckCircle2, Zap, Shield, Headphones, Smartphone, Layout, TrendingUp, Star, Globe, Clock, Heart } from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  search: Search,
  pen: PenTool,
  code: Code,
  rocket: Rocket,
  zap: Zap,
  shield: Shield,
  headphones: Headphones,
  smartphone: Smartphone,
  layout: Layout,
  trending: TrendingUp,
  star: Star,
  globe: Globe,
  clock: Clock,
  heart: Heart,
  check: CheckCircle2
};

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
  useIcons,
  isLast,
  connectorStyle,
  drawConnectors
}: any) => {
  const IconComponent = ICON_MAP[step.icon] || CheckCircle2;
  const isHorizontal = layout === 'horizontal';
  const isVertical = layout === 'vertical';
  const isAlternating = layout === 'alternating';

  const renderIndicator = () => (
    <div 
      className="flex items-center justify-center flex-shrink-0 z-10 relative"
      style={{ 
        width: '48px', 
        height: '48px', 
        backgroundColor: indicatorBg,
        color: indicatorColor,
        borderRadius: '50%',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}
    >
      {useIcons ? <IconComponent size={20} /> : <span className="font-black text-lg">{index + 1}</span>}
    </div>
  );

  const renderConnector = () => {
    if (isLast || connectorStyle === 'none') return null;
    
    const style = connectorStyle === 'dashed' ? 'border-dashed' : 'border-solid';
    
    if (isHorizontal) {
      return (
        <motion.div 
          initial={drawConnectors ? { width: 0 } : { width: '100%' }}
          whileInView={{ width: '100%' }}
          transition={{ duration: 1, delay: 0.5 }}
          className={`absolute top-6 left-12 w-full border-t-2 ${style} border-primary/20 -z-0`} 
        />
      );
    }
    
    if (isVertical || isAlternating) {
      return (
        <motion.div 
          initial={drawConnectors ? { height: 0 } : { height: '100%' }}
          whileInView={{ height: '100%' }}
          transition={{ duration: 1, delay: 0.5 }}
          className={`absolute top-12 left-6 h-full border-l-2 ${style} border-primary/20 -z-0`} 
        />
      );
    }
    
    return null;
  };

  return (
    <motion.div
      variants={staggerAnim ? itemVariants : {}}
      className={`relative flex flex-col items-center text-center @md:flex-row @md:gap-8 @md:items-start ${isHorizontal ? '@md:flex-col @md:items-center @md:text-center' : '@md:text-left'}`}
    >
      {renderConnector()}
      
      <div className={`${isHorizontal ? 'mb-6 @md:mb-6' : 'mb-6 @md:mb-0 @md:mt-1'}`}>
        {renderIndicator()}
      </div>

      <motion.div
        whileHover={hoverLift ? { y: -5, transition: { duration: 0.3 } } : {}}
        className="flex-1 transition-all duration-300"
        style={{ 
          backgroundColor: isHorizontal ? 'transparent' : cardBg,
          padding: isHorizontal ? '0' : `${cardPadding}px`,
          borderRadius: `${cardRadius}px`,
          border: isHorizontal ? 'none' : `1px solid ${cardBorder}`,
        }}
      >
        <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
        <p className="text-slate-500 leading-relaxed text-sm">{step.desc}</p>
      </motion.div>
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
  const paddingY = getVal(null, 'padding_y', 100);
  const gap = getVal(null, 'gap', 40);
  const bgColor = getVal(null, 'bg_color', '#F8FAFC');
  const connectorStyle = getVal(null, 'connector_style', 'dashed');
  const entranceAnim = getVal(null, 'entrance_anim', true);
  const drawConnectors = getVal(null, 'draw_connectors', true);

  // Element: Header
  const headerTitle = getVal(`${moduleId}_el_process_header`, 'title', 'Nuestro Proceso');
  const headerSubtitle = getVal(`${moduleId}_el_process_header`, 'subtitle', 'Cómo trabajamos para hacer realidad tus ideas.');
  const headerAlign = getVal(`${moduleId}_el_process_header`, 'align', 'center');
  const headerTitleSize = getVal(`${moduleId}_el_process_header`, 'title_size', 32);
  const headerMarginB = getVal(`${moduleId}_el_process_header`, 'margin_b', 60);

  // Element: Step Style
  const cardBg = getVal(`${moduleId}_el_process_step`, 'card_bg', '#FFFFFF');
  const cardBorder = getVal(`${moduleId}_el_process_step`, 'card_border', 'rgba(0,0,0,0.05)');
  const cardRadius = getVal(`${moduleId}_el_process_step`, 'card_radius', 24);
  const cardPadding = getVal(`${moduleId}_el_process_step`, 'card_padding', 32);
  const hoverLift = getVal(`${moduleId}_el_process_step`, 'hover_lift', true);

  // Element: Indicator
  const indicatorBg = getVal(`${moduleId}_el_process_indicator`, 'indicator_bg', 'var(--primary-color)');
  const indicatorColor = getVal(`${moduleId}_el_process_indicator`, 'indicator_color', '#FFFFFF');
  const useIcons = getVal(`${moduleId}_el_process_indicator`, 'use_icons', false);

  const MOCK_STEPS = [
    { title: 'Descubrimiento', desc: 'Analizamos tus necesidades y definimos los objetivos del proyecto.', icon: 'search' },
    { title: 'Diseño', desc: 'Creamos prototipos visuales enfocados en la experiencia del usuario.', icon: 'pen' },
    { title: 'Desarrollo', desc: 'Construimos la solución utilizando las tecnologías más modernas.', icon: 'code' },
    { title: 'Lanzamiento', desc: 'Desplegamos tu proyecto y aseguramos un inicio exitoso.', icon: 'rocket' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
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

        {/* Process Flow */}
        <motion.div 
          variants={entranceAnim ? containerVariants : {}}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          className={`grid ${layout === 'horizontal' ? 'grid-cols-1 @md:grid-cols-4' : 'grid-cols-1 max-w-3xl mx-auto'}`}
          style={{ gap: `${gap}px` }}
        >
          {MOCK_STEPS.map((step, i) => (
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
              useIcons={useIcons}
              isLast={i === MOCK_STEPS.length - 1}
              connectorStyle={connectorStyle}
              drawConnectors={drawConnectors}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};
