import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Zap, Shield, Headphones, Smartphone, Layout, TrendingUp, Star, Globe, Clock, Heart, Zap as ZapIcon } from 'lucide-react';

const ICON_MAP: Record<string, any> = {
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

const FeatureCard = ({ 
  feature, 
  index, 
  layout, 
  staggerAnim, 
  itemVariants, 
  hoverLift, 
  cardBg, 
  cardPadding, 
  cardRadius, 
  cardBorder, 
  cardShadow, 
  getShadowClass, 
  iconSize, 
  iconBg, 
  iconRadius, 
  iconColor 
}: any) => {
  const IconComponent = ICON_MAP[feature.icon] || CheckCircle2;
  const isBento = layout === 'bento';
  const bentoClass = isBento ? (index === 0 || index === 3 ? '@md:col-span-2' : '@md:col-span-1') : '';

  return (
    <motion.div
      variants={staggerAnim ? itemVariants : {}}
      whileHover={hoverLift ? { y: -8, transition: { duration: 0.3 } } : {}}
      className={`group transition-all duration-300 ${bentoClass} flex ${layout === 'list' ? 'flex-row gap-6' : 'flex-col'}`}
      style={{ 
        backgroundColor: cardBg,
        padding: `${cardPadding}px`,
        borderRadius: `${cardRadius}px`,
        border: `1px solid ${cardBorder}`,
        boxShadow: getShadowClass(cardShadow) === 'shadow-none' ? 'none' : undefined
      }}
    >
      <div 
        className={`flex items-center justify-center flex-shrink-0 ${layout === 'list' ? 'mb-0' : 'mb-6'}`}
        style={{ 
          width: `${iconSize * 2}px`, 
          height: `${iconSize * 2}px`, 
          backgroundColor: iconBg,
          borderRadius: `${iconRadius}px`
        }}
      >
        <IconComponent size={iconSize} style={{ color: iconColor }} />
      </div>
      
      <div className="flex-1">
        <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
        <p className="text-slate-500 leading-relaxed text-sm">{feature.desc}</p>
      </div>
    </motion.div>
  );
};

export const FeaturesModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any> 
}> = ({ moduleId, settingsValues }) => {
  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  };

  // Global Settings
  const layout = getVal(null, 'layout', 'grid');
  const columns = getVal(null, 'columns', 3);
  const gap = getVal(null, 'gap', 32);
  const paddingY = getVal(null, 'padding_y', 80);
  const bgColor = getVal(null, 'bg_color', 'transparent');
  const staggerAnim = getVal(null, 'stagger_anim', true);

  // Element: Header
  const headerTitle = getVal(`${moduleId}_el_features_header`, 'title', '¿Por qué elegirnos?');
  const headerSubtitle = getVal(`${moduleId}_el_features_header`, 'subtitle', 'Soluciones diseñadas para escalar tu negocio al siguiente nivel.');
  const headerAlign = getVal(`${moduleId}_el_features_header`, 'align', 'center');
  const headerTitleSize = getVal(`${moduleId}_el_features_header`, 'title_size', 32);
  const headerMarginB = getVal(`${moduleId}_el_features_header`, 'margin_b', 60);

  // Element: Card Style
  const cardBg = getVal(`${moduleId}_el_feature_card`, 'card_bg', '#FFFFFF');
  const cardBorder = getVal(`${moduleId}_el_feature_card`, 'card_border', 'rgba(0,0,0,0.05)');
  const cardShadow = getVal(`${moduleId}_el_feature_card`, 'card_shadow', 'sm');
  const cardPadding = getVal(`${moduleId}_el_feature_card`, 'card_padding', 32);
  const cardRadius = getVal(`${moduleId}_el_feature_card`, 'card_radius', 24);
  const hoverLift = getVal(`${moduleId}_el_feature_card`, 'hover_lift', true);

  // Element: Icon Style
  const iconSize = getVal(`${moduleId}_el_feature_icon`, 'icon_size', 24);
  const iconColor = getVal(`${moduleId}_el_feature_icon`, 'icon_color', 'var(--primary-color)');
  const iconBg = getVal(`${moduleId}_el_feature_icon`, 'icon_bg', 'rgba(var(--primary-rgb), 0.1)');
  const iconRadius = getVal(`${moduleId}_el_feature_icon`, 'icon_radius', 12);

  const MOCK_FEATURES = [
    { title: 'Velocidad Increíble', desc: 'Optimizado para cargar en menos de 1 segundo.', icon: 'zap' },
    { title: 'Seguridad Total', desc: 'Protección de datos con los más altos estándares.', icon: 'shield' },
    { title: 'Soporte 24/7', desc: 'Estamos aquí para ayudarte en cualquier momento.', icon: 'headphones' },
    { title: 'Diseño Adaptable', desc: 'Se ve perfecto en cualquier dispositivo.', icon: 'smartphone' },
    { title: 'Fácil de Usar', desc: 'Interfaz intuitiva diseñada para todos.', icon: 'layout' },
    { title: 'Escalabilidad', desc: 'Crece con tu negocio sin complicaciones.', icon: 'trending' }
  ];

  const getShadowClass = (s: string) => {
    switch (s) {
      case 'sm': return 'shadow-sm';
      case 'lg': return 'shadow-xl';
      default: return 'shadow-none';
    }
  };

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
          {headerAlign === 'center' && (
            <div className="w-16 h-1.5 bg-primary rounded-full mt-6"></div>
          )}
        </div>

        {/* Grid */}
        <motion.div 
          variants={staggerAnim ? containerVariants : {}}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          className={`grid gap-8 ${layout === 'list' ? 'grid-cols-1' : (
            columns === 4 ? 'grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-4' :
            columns === 3 ? 'grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3' :
            columns === 2 ? 'grid-cols-1 @sm:grid-cols-2' : 'grid-cols-1'
          )}`}
          style={{ 
            gap: `${gap}px`
          }}
        >
          {MOCK_FEATURES.map((feature, i) => (
            <FeatureCard 
              key={i} 
              feature={feature} 
              index={i} 
              layout={layout}
              staggerAnim={staggerAnim}
              itemVariants={itemVariants}
              hoverLift={hoverLift}
              cardBg={cardBg}
              cardPadding={cardPadding}
              cardRadius={cardRadius}
              cardBorder={cardBorder}
              cardShadow={cardShadow}
              getShadowClass={getShadowClass}
              iconSize={iconSize}
              iconBg={iconBg}
              iconRadius={iconRadius}
              iconColor={iconColor}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};
