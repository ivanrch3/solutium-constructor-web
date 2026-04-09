import React from 'react';
import { motion } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { CheckCircle2 } from 'lucide-react';

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
  iconColor,
  cardTitleSize,
  cardDescSize
}: any) => {
  const IconComponent = (LucideIcons as any)[feature.icon] || LucideIcons.CheckCircle2;
  const isBento = layout === 'bento';
  const bentoClass = isBento ? (index === 0 || index === 3 ? '@md:col-span-2' : '@md:col-span-1') : '';

  const CardWrapper = feature.link ? 'a' : 'div';
  const wrapperProps = feature.link ? { href: feature.link, target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <motion.div
      variants={staggerAnim ? itemVariants : {}}
      whileHover={hoverLift ? { y: -8, transition: { duration: 0.3 } } : {}}
      className={`group relative transition-all duration-300 ${bentoClass} flex ${layout === 'list' ? 'flex-row gap-6' : 'flex-col'}`}
      style={{ 
        backgroundColor: cardBg,
        padding: `${cardPadding}px`,
        borderRadius: `${cardRadius}px`,
        border: `1px solid ${cardBorder}`,
        boxShadow: getShadowClass(cardShadow) === 'shadow-none' ? 'none' : undefined
      }}
    >
      {(CardWrapper as any) === 'a' && (
        <a {...(wrapperProps as any)} className="absolute inset-0 z-10" aria-label={feature.title} />
      )}

      {feature.badge && (
        <div className="absolute top-4 right-4 z-20">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
            {feature.badge}
          </span>
        </div>
      )}

      <div 
        className={`flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover:scale-110 ${layout === 'list' ? 'mb-0' : 'mb-6'}`}
        style={{ 
          width: `${iconSize * 2.2}px`, 
          height: `${iconSize * 2.2}px`, 
          backgroundColor: iconBg,
          borderRadius: `${iconRadius}px`
        }}
      >
        <IconComponent size={iconSize} style={{ color: iconColor }} />
      </div>
      
      <div className="flex-1">
        <h3 
          className="font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors"
          style={{ fontSize: `${cardTitleSize}px` }}
        >
          {feature.title}
        </h3>
        <p 
          className="text-slate-500 leading-relaxed"
          style={{ fontSize: `${cardDescSize}px` }}
        >
          {feature.desc}
        </p>
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
  const paddingY = getVal(null, 'padding_y', 100);
  const bgColor = getVal(null, 'bg_color', 'transparent');
  const staggerAnim = getVal(null, 'stagger_anim', true);
  const showDivider = getVal(null, 'show_divider', false);

  // Element: Header
  const headerEyebrow = getVal(`${moduleId}_el_features_header`, 'eyebrow', 'CARACTERÍSTICAS');
  const headerTitle = getVal(`${moduleId}_el_features_header`, 'title', '¿Por qué elegirnos?');
  const headerSubtitle = getVal(`${moduleId}_el_features_header`, 'subtitle', 'Soluciones diseñadas para escalar tu negocio al siguiente nivel.');
  const headerAlign = getVal(`${moduleId}_el_features_header`, 'align', 'center');
  const headerTitleSize = getVal(`${moduleId}_el_features_header`, 'title_size', 40);
  const headerTitleColor = getVal(`${moduleId}_el_features_header`, 'title_color', '#0F172A');
  const headerEyebrowColor = getVal(`${moduleId}_el_features_header`, 'eyebrow_color', 'var(--primary-color)');
  const headerMarginB = getVal(`${moduleId}_el_features_header`, 'margin_b', 80);

  // Element: Card Style
  const cardBg = getVal(`${moduleId}_el_feature_card`, 'card_bg', '#FFFFFF');
  const cardBorder = getVal(`${moduleId}_el_feature_card`, 'card_border', 'rgba(0,0,0,0.05)');
  const cardShadow = getVal(`${moduleId}_el_feature_card`, 'card_shadow', 'sm');
  const cardPadding = getVal(`${moduleId}_el_feature_card`, 'card_padding', 32);
  const cardRadius = getVal(`${moduleId}_el_feature_card`, 'card_radius', 24);
  const hoverLift = getVal(`${moduleId}_el_feature_card`, 'hover_lift', true);
  const cardTitleSize = getVal(`${moduleId}_el_feature_card`, 'card_title_size', 20);
  const cardDescSize = getVal(`${moduleId}_el_feature_card`, 'card_desc_size', 15);

  // Element: Icon Style
  const iconSize = getVal(`${moduleId}_el_feature_icon`, 'icon_size', 24);
  const iconColor = getVal(`${moduleId}_el_feature_icon`, 'icon_color', 'var(--primary-color)');
  const iconBg = getVal(`${moduleId}_el_feature_icon`, 'icon_bg', 'rgba(var(--primary-rgb), 0.1)');
  const iconRadius = getVal(`${moduleId}_el_feature_icon`, 'icon_radius', 12);

  const features = getVal(null, 'features', []);

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
      className="w-full relative overflow-hidden"
      style={{ 
        backgroundColor: bgColor,
        paddingTop: `${paddingY}px`,
        paddingBottom: `${paddingY}px`
      }}
    >
      {showDivider && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-primary/50 to-transparent" />
      )}

      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <div 
          className={`flex flex-col ${headerAlign === 'center' ? 'items-center text-center' : 'items-start text-left'}`}
          style={{ marginBottom: `${headerMarginB}px` }}
        >
          {headerEyebrow && (
            <span 
              className="text-xs font-bold tracking-[0.3em] uppercase mb-4 block"
              style={{ color: headerEyebrowColor }}
            >
              {headerEyebrow}
            </span>
          )}
          <h2 
            className="font-black leading-tight text-3xl @md:text-4xl @lg:text-5xl mb-6"
            style={{ 
              fontSize: `${headerTitleSize}px`,
              color: headerTitleColor
            }}
          >
            {headerTitle}
          </h2>
          {headerSubtitle && (
            <p className="text-slate-500 max-w-2xl text-lg leading-relaxed">
              {headerSubtitle}
            </p>
          )}
          {headerAlign === 'center' && (
            <div className="w-12 h-1 bg-primary/20 rounded-full mt-8">
              <div className="w-4 h-full bg-primary rounded-full mx-auto" />
            </div>
          )}
        </div>

        {/* Grid */}
        <motion.div 
          variants={staggerAnim ? containerVariants : {}}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className={`grid ${layout === 'list' ? 'grid-cols-1' : (
            columns === 4 ? 'grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-4' :
            columns === 3 ? 'grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3' :
            columns === 2 ? 'grid-cols-1 @sm:grid-cols-2' : 'grid-cols-1'
          )}`}
          style={{ 
            gap: `${gap}px`
          }}
        >
          {features.map((feature: any, i: number) => (
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
              cardTitleSize={cardTitleSize}
              cardDescSize={cardDescSize}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};
