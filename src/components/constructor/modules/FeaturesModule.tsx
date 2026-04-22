import React from 'react';
import { motion } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { TYPOGRAPHY_SCALE, FONT_WEIGHTS } from '../../../constants/typography';
import { TextRenderer } from '../TextRenderer';

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
  iconStyle,
  cardTitleSize,
  cardTitleWeight,
  cardDescSize,
  cardDescWeight,
  cardTextAlign,
  darkMode
}: any) => {
  const IconComponent = (LucideIcons as any)[feature.icon] || LucideIcons.Star;
  const isBento = layout === 'bento';
  const isZigZag = layout === 'zigzag';
  const isList = layout === 'list';

  const bentoClass = isBento ? (index === 0 || index === 3 ? '@lg:col-span-2' : '@lg:col-span-1') : '';
  const zigzagReverse = isZigZag && index % 2 !== 0;

  const hasLink = feature.link_url && feature.link_url !== '#' && feature.link_url !== '';
  const CardWrapper = hasLink ? 'a' : 'div';
  const wrapperProps = hasLink ? { 
    href: feature.link_url, 
    target: feature.link_target === '_blank' ? '_blank' : '_self' ,
    rel: feature.link_target === '_blank' ? 'noopener noreferrer' : undefined 
  } : {};

  const finalCardBg = darkMode ? '#1E293B' : cardBg;
  const finalCardBorder = darkMode ? 'rgba(255,255,255,0.1)' : cardBorder;
  const finalTitleColor = darkMode ? '#FFFFFF' : undefined;
  const finalDescColor = darkMode ? '#94A3B8' : '#64748B';

  const safeIconRadius = parseFloat(iconRadius as any) || 0;
  const safeIconSize = parseFloat(iconSize as any) || 24;
  const safeCardPadding = parseFloat(cardPadding as any) || 32;
  const safeCardRadius = parseFloat(cardRadius as any) || 24;

  const renderMedia = () => {
    if (feature.media_type === 'image') {
      const featureImg = feature.image || `https://picsum.photos/seed/feature-${index}/800/600`;
      return (
        <div 
          className={`overflow-hidden mb-6 ${isList ? 'w-24 h-24' : 'w-full aspect-video'}`}
          style={{ borderRadius: `${safeIconRadius}px` }}
        >
          <img 
            src={featureImg} 
            alt={feature.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      );
    }

    const iconContainerStyle: React.CSSProperties = {
      width: `${safeIconSize * 2}px`,
      height: `${safeIconSize * 2}px`,
      borderRadius: `${safeIconRadius}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      transition: 'all 0.3s ease'
    };

    if (iconStyle === 'soft') {
      iconContainerStyle.backgroundColor = darkMode ? 'rgba(255,255,255,0.05)' : iconBg;
    } else if (iconStyle === 'solid') {
      iconContainerStyle.backgroundColor = iconColor;
    } else if (iconStyle === 'outline') {
      iconContainerStyle.borderWidth = '2px';
      iconContainerStyle.borderStyle = 'solid';
      iconContainerStyle.borderColor = iconColor;
    }

    return (
      <div 
        className={`transition-transform duration-500 group-hover:scale-110 ${isList ? 'mb-0' : 'mb-6'}`}
        style={iconContainerStyle}
      >
        <IconComponent 
          size={iconSize} 
          style={{ color: iconStyle === 'solid' ? '#FFFFFF' : iconColor }} 
        />
      </div>
    );
  };

  if (isZigZag) {
    return (
      <motion.div
        variants={staggerAnim ? itemVariants : {}}
        className={`flex flex-col @lg:flex-row items-center gap-12 @lg:gap-24 py-12 ${zigzagReverse ? '@lg:flex-row-reverse' : ''}`}
      >
        <div className="flex-1 w-full">
          <div 
            className="relative overflow-hidden shadow-2xl"
            style={{ borderRadius: `${cardRadius}px` }}
          >
            <img 
              src={feature.image || `https://picsum.photos/seed/${index}/800/600`} 
              alt={feature.title} 
              className="w-full h-auto block"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
        <div className="flex-1 text-left">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
            style={{ backgroundColor: iconBg, color: iconColor }}
          >
            <IconComponent size={24} />
          </div>
          <h3 
            className="mb-4"
            style={{ 
              fontSize: `${TYPOGRAPHY_SCALE[cardTitleSize as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 28}px`,
              fontWeight: FONT_WEIGHTS[cardTitleWeight as keyof typeof FONT_WEIGHTS]?.value || 800,
              color: finalTitleColor
            }}
          >
            {feature.title}
          </h3>
          <p 
            className="text-lg leading-relaxed mb-8"
            style={{ 
              fontSize: `${TYPOGRAPHY_SCALE[cardDescSize as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 18}px`,
              color: finalDescColor
            }}
          >
            {feature.desc}
          </p>
          {hasLink && (
            <a 
              href={feature.link_url}
              target={feature.link_target === '_blank' ? '_blank' : '_self'}
              rel={feature.link_target === '_blank' ? 'noopener noreferrer' : undefined}
              className="inline-flex items-center gap-2 font-bold text-primary group/link"
            >
              {feature.link_text || 'Saber más'}
              <ArrowRight size={18} className="group-hover/link:translate-x-1 transition-transform" />
            </a>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={staggerAnim ? itemVariants : {}}
      whileHover={hoverLift ? { y: -8 } : {}}
      className={`group relative transition-all duration-300 ${bentoClass} flex ${isList ? 'flex-row gap-6 items-start' : 'flex-col'}`}
      style={{ 
        backgroundColor: finalCardBg,
        padding: `${safeCardPadding}px`,
        borderRadius: `${safeCardRadius}px`,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: finalCardBorder,
        boxShadow: getShadowClass(cardShadow) === 'shadow-none' ? 'none' : undefined
      }}
    >
      {(CardWrapper as any) === 'a' && (
        <a {...(wrapperProps as any)} className="absolute inset-0 z-10" aria-label={feature.title} />
      )}

      {renderMedia()}
      
      <div className="flex-1">
        <h3 
          className="group-hover:text-primary transition-colors mb-2"
          style={{ 
            fontSize: `${TYPOGRAPHY_SCALE[cardTitleSize as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 20}px`,
            fontWeight: FONT_WEIGHTS[cardTitleWeight as keyof typeof FONT_WEIGHTS]?.value || 800,
            textAlign: cardTextAlign !== 'inherit' ? cardTextAlign : undefined,
            color: finalTitleColor
          }}
        >
          {feature.title}
        </h3>
        <p 
          className="leading-relaxed mb-4"
          style={{ 
            fontSize: `${TYPOGRAPHY_SCALE[cardDescSize as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 16}px`,
            fontWeight: FONT_WEIGHTS[cardDescWeight as keyof typeof FONT_WEIGHTS]?.value || 400,
            textAlign: cardTextAlign !== 'inherit' ? cardTextAlign : undefined,
            color: finalDescColor
          }}
        >
          {feature.desc}
        </p>
        {hasLink && feature.link_text && (
          <div className="inline-flex items-center gap-1 text-sm font-bold text-primary mt-auto">
            {feature.link_text}
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        )}
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
  const columns = Math.max(1, parseInt(getVal(null, 'columns', 3)) || 3);
  const gap = parseFloat(getVal(null, 'gap', 32)) || 32;
  const paddingY = parseFloat(getVal(null, 'padding_y', 100)) || 100;
  const darkMode = getVal(null, 'dark_mode', false);
  const bgColor = darkMode ? '#0F172A' : getVal(null, 'bg_color', '#FFFFFF');
  const sectionGradient = getVal(null, 'section_gradient', false);
  const bgGradient = getVal(null, 'bg_gradient', 'linear-gradient(to bottom, #FFFFFF, #F8FAFC)');
  const staggerAnim = getVal(null, 'stagger_anim', true);

  // Header Settings
  const eyebrow = getVal(`${moduleId}_el_features_header`, 'eyebrow', 'CARACTERÍSTICAS');
  const title = getVal(`${moduleId}_el_features_header`, 'title', '¿Por qué elegirnos?');
  const subtitle = getVal(`${moduleId}_el_features_header`, 'subtitle', 'Soluciones diseñadas para escalar tu negocio al siguiente nivel.');
  const headerAlign = getVal(`${moduleId}_el_features_header`, 'align', 'center');
  const headerTitleSize = getVal(`${moduleId}_el_features_header`, 'title_size', 't2');
  const headerTitleWeight = getVal(`${moduleId}_el_features_header`, 'title_weight', 'bold');
  const headerEyebrowColor = getVal(`${moduleId}_el_features_header`, 'eyebrow_color', '#3B82F6');
  const headerEyebrowBg = getVal(`${moduleId}_el_features_header`, 'eyebrow_bg', 'rgba(59, 130, 246, 0.1)');
  const headerMarginB = getVal(`${moduleId}_el_features_header`, 'margin_b', 80);

  const headerTitleColor = darkMode ? '#FFFFFF' : undefined;

  // Highlight Settings
  const titleHighlightType = getVal(`${moduleId}_el_features_header`, 'title_highlight_type', 'gradient');
  const titleHighlightColor = getVal(`${moduleId}_el_features_header`, 'title_highlight_color', '#3B82F6');
  const titleHighlightGradient = getVal(`${moduleId}_el_features_header`, 'title_highlight_gradient', 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)');
  const titleHighlightBold = getVal(`${moduleId}_el_features_header`, 'title_highlight_bold', true);

  // Card Style
  const cardBg = getVal(`${moduleId}_el_feature_card`, 'card_bg', '#FFFFFF');
  const cardBorder = getVal(`${moduleId}_el_feature_card`, 'card_border', 'rgba(0,0,0,0.05)');
  const cardShadow = getVal(`${moduleId}_el_feature_card`, 'card_shadow', 'sm');
  const cardPadding = getVal(`${moduleId}_el_feature_card`, 'card_padding', 32);
  const cardRadius = getVal(`${moduleId}_el_feature_card`, 'card_radius', 24);
  const hoverLift = getVal(`${moduleId}_el_feature_card`, 'hover_lift', true);
  const cardTitleSize = getVal(`${moduleId}_el_feature_card`, 'title_size', 't3');
  const cardTitleWeight = getVal(`${moduleId}_el_feature_card`, 'title_weight', 'bold');
  const cardDescSize = getVal(`${moduleId}_el_feature_card`, 'desc_size', 'p');
  const cardDescWeight = getVal(`${moduleId}_el_feature_card`, 'desc_weight', 'normal');
  const cardTextAlign = getVal(`${moduleId}_el_feature_card`, 'text_align', 'inherit');

  // Icon Style
  const iconSize = getVal(`${moduleId}_el_feature_card`, 'icon_size', 24);
  const iconColor = getVal(`${moduleId}_el_feature_card`, 'icon_color', '#3B82F6');
  const iconBg = getVal(`${moduleId}_el_feature_card`, 'icon_bg', 'rgba(59, 130, 246, 0.1)');
  const iconRadius = getVal(`${moduleId}_el_feature_card`, 'icon_radius', 12);
  const iconStyle = getVal(`${moduleId}_el_feature_card`, 'icon_style', 'soft');

  const features = getVal(`${moduleId}_el_feature_card`, 'items', []);

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
        backgroundImage: sectionGradient ? bgGradient : 'none',
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
              {eyebrow}
            </span>
          )}
          <h2 
            className="mb-6"
            style={{ 
              fontSize: `${TYPOGRAPHY_SCALE[headerTitleSize as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 32}px`,
              fontWeight: FONT_WEIGHTS[headerTitleWeight as keyof typeof FONT_WEIGHTS]?.value || 900,
              color: headerTitleColor,
              textAlign: headerAlign as any
            }}
          >
            <TextRenderer 
              text={title} 
              highlightType={titleHighlightType}
              highlightColor={titleHighlightColor}
              highlightGradient={titleHighlightGradient}
              highlightBold={titleHighlightBold}
            />
          </h2>
          {subtitle && (
            <p 
              className="max-w-2xl text-lg leading-relaxed"
              style={{ color: darkMode ? '#94A3B8' : '#64748B' }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Content */}
        {layout === 'zigzag' ? (
          <div className="flex flex-col">
            {features.map((feature: any, i: number) => (
              <FeatureCard 
                key={i} 
                feature={feature} 
                index={i} 
                layout={layout}
                staggerAnim={staggerAnim}
                itemVariants={itemVariants}
                iconBg={iconBg}
                iconColor={iconColor}
                cardTitleSize={cardTitleSize}
                cardTitleWeight={cardTitleWeight}
                cardDescSize={cardDescSize}
                cardDescWeight={cardDescWeight}
                cardRadius={cardRadius}
                darkMode={darkMode}
              />
            ))}
          </div>
        ) : (
          <motion.div 
            variants={staggerAnim ? containerVariants : {}}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className={`grid ${layout === 'list' ? 'grid-cols-1' : (
              layout === 'bento' ? 'grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3' : (
                columns === 4 ? 'grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-4' :
                columns === 3 ? 'grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3' :
                columns === 2 ? 'grid-cols-1 @sm:grid-cols-2' : 'grid-cols-1'
              )
            )}`}
            style={{ gap: `${gap}px` }}
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
                iconStyle={iconStyle}
                cardTitleSize={cardTitleSize}
                cardTitleWeight={cardTitleWeight}
                cardDescSize={cardDescSize}
                cardDescWeight={cardDescWeight}
                cardTextAlign={cardTextAlign}
                darkMode={darkMode}
              />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};
