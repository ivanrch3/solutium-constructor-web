import React from 'react';
import { motion } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { TYPOGRAPHY_SCALE, FONT_WEIGHTS } from '../../../constants/typography';
import { TextRenderer } from '../TextRenderer';
import { InlineEditableText } from '../InlineEditableText';
import { SectionAnimation } from '../animations/SectionAnimation';
import { useEditorStore } from '../../../store/editorStore';
import { normalizeSectionAnimation } from '../../../constants/moduleAnimations';
import { logDebug } from '../../../utils/debug';
import {
  FEATURES_VISUAL_DEFAULTS,
  IMAGE_SIZE_STYLES,
  resolveFeatureImageAspect,
  resolveFeatureImageSize,
  resolveFeatureObjectFit,
  resolveFeatureObjectPosition,
  resolveFeatureNumber
} from './featuresVisualControls';

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
  iconContainerSize,
  iconAlign,
  iconPosition,
  imageSize,
  imageAspect,
  imageFit,
  imagePosition,
  mediaAlign,
  mediaGap,
  textGap,
  titleColor,
  descColor,
  linkSize,
  linkWeight,
  linkColor,
  cardTitleSize,
  cardTitleWeight,
  cardDescSize,
  cardDescWeight,
  cardTextAlign,
  darkMode,
  moduleId,
  isPreviewMode,
  onSave
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

  const finalCardBg = cardBg;
  const finalCardBorder = cardBorder;
  const finalTitleColor = titleColor || (darkMode ? '#FFFFFF' : '#0F172A');
  const finalDescColor = descColor || (darkMode ? '#94A3B8' : '#64748B');

  const safeIconRadius = parseFloat(iconRadius as any) || 0;
  const safeIconSize = resolveFeatureNumber(iconSize, FEATURES_VISUAL_DEFAULTS.icon_size, 16, 96);
  const safeIconContainerSize = resolveFeatureNumber(iconContainerSize, FEATURES_VISUAL_DEFAULTS.icon_container_size, 32, 96);
  const safeCardPadding = parseFloat(cardPadding as any) || 32;
  const safeCardRadius = parseFloat(cardRadius as any) || 24;
  const safeMediaGap = resolveFeatureNumber(mediaGap, FEATURES_VISUAL_DEFAULTS.media_gap, 0, 64);
  const safeTextGap = resolveFeatureNumber(textGap, FEATURES_VISUAL_DEFAULTS.text_gap, 0, 32);
  const resolvedImageSize = resolveFeatureImageSize(imageSize);
  const imageSizeStyle = IMAGE_SIZE_STYLES[resolvedImageSize];
  const listImageWidth = { small: 72, medium: 96, large: 128, full: 160 }[resolvedImageSize];
  const imageAspectStyle = resolveFeatureImageAspect(imageAspect);
  const objectFit = resolveFeatureObjectFit(imageFit);
  const objectPosition = resolveFeatureObjectPosition(imagePosition);
  const mediaAlignmentStyle: React.CSSProperties = mediaAlign === 'center'
    ? { alignSelf: 'center' }
    : mediaAlign === 'right' ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' };
  const iconAlignmentStyle: React.CSSProperties = iconAlign === 'center'
    ? { alignSelf: 'center' }
    : iconAlign === 'right' ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' };
  const contentLayout = iconPosition === 'left' || iconPosition === 'right' ? 'flex-row' : 'flex-col';
  const mediaOrder = iconPosition === 'right' ? 2 : 0;
  const contentOrder = iconPosition === 'right' ? 0 : 1;
  const linkTypography = {
    ...(() => {
      const size = TYPOGRAPHY_SCALE[linkSize as keyof typeof TYPOGRAPHY_SCALE] || TYPOGRAPHY_SCALE.s;
      const weight = FONT_WEIGHTS[linkWeight as keyof typeof FONT_WEIGHTS] || FONT_WEIGHTS.normal;
      return { fontSize: `${size.fontSize}px`, lineHeight: size.lineHeight, fontWeight: weight.value };
    })()
  };

  const renderMedia = () => {
    if (feature.media_type === 'image') {
      const featureImg = feature.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDgwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSI2MDAiIGZpbGw9IiNFMkU4RjAiLz48cGF0aCBkPSJNMzAwIDMwMEw0MDAgMjAwTDUwMCAzMDBWNDAwSDMwMFYzMDBaIiBmaWxsPSIjOTRBM0NCIi8+PC9zdmc+';
      return (
        <div 
          className="overflow-hidden"
          style={{
            ...mediaAlignmentStyle,
            borderRadius: `${safeIconRadius}px`,
            width: isList ? `${listImageWidth}px` : imageSizeStyle.width,
            maxWidth: '100%',
            maxHeight: imageSizeStyle.maxHeight ? `${imageSizeStyle.maxHeight}px` : undefined,
            aspectRatio: imageAspectStyle,
            marginBottom: isList || iconPosition !== 'top' ? 0 : `${safeMediaGap}px`,
            order: mediaOrder
          }}
        >
          <img 
            src={featureImg} 
            alt={feature.title} 
            className="w-full h-full"
            style={{ objectFit, objectPosition }}
            referrerPolicy="no-referrer"
          />
        </div>
      );
    }

    const iconContainerStyle: React.CSSProperties = {
      width: `${safeIconContainerSize}px`,
      height: `${safeIconContainerSize}px`,
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
        className="transition-transform duration-500 group-hover:scale-110"
        style={{ ...iconContainerStyle, ...iconAlignmentStyle, order: mediaOrder, marginBottom: isList || iconPosition !== 'top' ? 0 : `${safeMediaGap}px` }}
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
        className={`flex flex-col @5xl:flex-row items-center py-12 ${zigzagReverse ? '@5xl:flex-row-reverse' : ''}`}
        style={{ gap: `${safeMediaGap}px` }}
      >
        <div className="flex-1 w-full" style={{ order: zigzagReverse ? 1 : 0, alignSelf: mediaAlign === 'center' ? 'center' : mediaAlign === 'right' ? 'flex-end' : 'flex-start' }}>
          <div 
            className="relative overflow-hidden shadow-2xl"
            style={{ borderRadius: `${cardRadius}px`, width: imageSizeStyle.width, maxWidth: '100%', maxHeight: imageSizeStyle.maxHeight ? `${imageSizeStyle.maxHeight}px` : undefined, aspectRatio: imageAspectStyle, flex: resolvedImageSize === 'small' || resolvedImageSize === 'medium' ? '0 1 240px' : '1 1 0%' }}
          >
            <img 
              src={feature.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDgwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSI2MDAiIGZpbGw9IiNFMkU4RjAiLz48cGF0aCBkPSJNMzAwIDMwMEw0MDAgMjAwTDUwMCAzMDBWNDAwSDMwMFYzMDBaIiBmaWxsPSIjOTRBM0NCIi8+PC9zdmc+'} 
              alt={feature.title} 
              className="w-full h-full block"
              style={{ objectFit, objectPosition }}
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
        <div className="flex-1" style={{ order: zigzagReverse ? 0 : 1, textAlign: cardTextAlign !== 'inherit' ? cardTextAlign : undefined, display: iconPosition === 'top' ? 'block' : 'grid', gap: `${safeMediaGap}px` }}>
          <div 
            className={`rounded-2xl flex items-center justify-center ${iconPosition === 'top' ? '' : 'mb-0'}`}
            style={{ width: `${safeIconContainerSize}px`, height: `${safeIconContainerSize}px`, borderRadius: `${safeIconRadius}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, ...iconAlignmentStyle, backgroundColor: iconBg, color: iconColor, marginBottom: iconPosition === 'top' ? `${safeMediaGap}px` : 0 }}
          >
            <IconComponent size={safeIconSize} />
          </div>
          <h3 
            className=""
            style={{ 
              fontSize: `${TYPOGRAPHY_SCALE[cardTitleSize as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 28}px`,
              fontWeight: FONT_WEIGHTS[cardTitleWeight as keyof typeof FONT_WEIGHTS]?.value || 800,
              color: finalTitleColor,
              marginBottom: `${safeTextGap}px`
            }}
          >
            <InlineEditableText
              moduleId={moduleId}
              settingId={`item_${index}_title`}
              value={feature.title}
              tagName="span"
              isPreviewMode={isPreviewMode}
              onSave={(val: string) => onSave('title', val)}
            />
          </h3>
          <p 
            className="leading-relaxed"
            style={{ 
              fontSize: `${TYPOGRAPHY_SCALE[cardDescSize as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 18}px`,
              fontWeight: FONT_WEIGHTS[cardDescWeight as keyof typeof FONT_WEIGHTS]?.value || 400,
              color: finalDescColor,
              textAlign: cardTextAlign !== 'inherit' ? cardTextAlign : undefined
            }}
          >
            <InlineEditableText
              moduleId={moduleId}
              settingId={`item_${index}_desc`}
              value={feature.desc}
              tagName="span"
              isPreviewMode={isPreviewMode}
              onSave={(val: string) => onSave('desc', val)}
            />
          </p>
          {hasLink && (
            <a 
              href={feature.link_url}
              target={feature.link_target === '_blank' ? '_blank' : '_self'}
              rel={feature.link_target === '_blank' ? 'noopener noreferrer' : undefined}
              className="inline-flex items-center gap-2 group/link"
              style={{ ...linkTypography, color: linkColor }}
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
      onClick={(e) => {
        if (isPreviewMode) return;
        e.stopPropagation();
        // Use selectSection+selectElement to highlight the card element settings
        const { selectSection, selectElement } = useEditorStore.getState();
        selectSection(moduleId);
        selectElement(`${moduleId}_el_feature_card`);
      }}
      className={`group relative transition-all duration-300 ${bentoClass} flex ${isList ? 'flex-row' : contentLayout} items-start`}
      style={{ 
        backgroundColor: finalCardBg,
        padding: `${safeCardPadding}px`,
        borderRadius: `${safeCardRadius}px`,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: finalCardBorder,
        boxShadow: getShadowClass(cardShadow) === 'shadow-none' ? 'none' : undefined,
        gap: `${safeMediaGap}px`
      }}
    >
      {(CardWrapper as any) === 'a' && (
        <a {...(wrapperProps as any)} className="absolute inset-0 z-10" aria-label={feature.title} />
      )}

      {renderMedia()}
      
      <div className="flex-1" style={{ order: contentOrder }}>
        <h3 
          className="group-hover:text-primary transition-colors"
          style={{ 
            fontSize: `${TYPOGRAPHY_SCALE[cardTitleSize as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 20}px`,
            fontWeight: FONT_WEIGHTS[cardTitleWeight as keyof typeof FONT_WEIGHTS]?.value || 800,
            textAlign: cardTextAlign !== 'inherit' ? cardTextAlign : undefined,
            color: finalTitleColor,
            marginBottom: `${safeTextGap}px`,
            order: contentOrder
          }}
        >
          <InlineEditableText
            moduleId={moduleId}
            settingId={`item_${index}_title`}
            value={feature.title}
            tagName="span"
            isPreviewMode={isPreviewMode}
            onSave={(val: string) => onSave('title', val)}
          />
        </h3>
        <p 
          className="leading-relaxed"
          style={{ 
            fontSize: `${TYPOGRAPHY_SCALE[cardDescSize as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 16}px`,
            fontWeight: FONT_WEIGHTS[cardDescWeight as keyof typeof FONT_WEIGHTS]?.value || 400,
            textAlign: cardTextAlign !== 'inherit' ? cardTextAlign : undefined,
            color: finalDescColor,
            order: contentOrder
          }}
        >
          <InlineEditableText
            moduleId={moduleId}
            settingId={`item_${index}_desc`}
            value={feature.desc}
            tagName="span"
            isPreviewMode={isPreviewMode}
            onSave={(val: string) => onSave('desc', val)}
          />
        </p>
        {hasLink && feature.link_text && (
          <div className="inline-flex items-center gap-1 mt-auto" style={{ ...linkTypography, color: linkColor }}>
            <InlineEditableText
              moduleId={moduleId}
              settingId={`item_${index}_link_text`}
              value={feature.link_text}
              tagName="span"
              isPreviewMode={isPreviewMode}
              onSave={(val: string) => onSave('link_text', val)}
            />
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const FeaturesModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any>,
  isPreviewMode?: boolean
}> = ({ moduleId, settingsValues, isPreviewMode = false }) => {
  const { updateSectionSettings, selectSection, selectElement } = useEditorStore();
  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  };

  const toBoolean = (value: unknown) => {
    return value === true || value === 'true' || value === 1 || value === '1';
  };

  const resolveThemeColor = (
    value: string | undefined,
    lightDefault: string,
    darkDefault: string,
    darkMode: boolean
  ) => {
    const safeValue = String(value || '').trim();
    const safeLight = String(lightDefault || '').trim().toLowerCase();

    if (!darkMode) {
      return safeValue || lightDefault;
    }

    if (!safeValue || safeValue.toLowerCase() === safeLight) {
      return darkDefault;
    }

    return safeValue;
  };

  const parseF = (val: any, fallback: number) => {
    const f = parseFloat(val);
    return isNaN(f) ? fallback : f;
  };

  // Global Settings
  const layout = getVal(null, 'layout', 'grid');
  const columns = Math.max(1, parseInt(getVal(null, 'columns', 3)) || 3);
  const gap = parseF(getVal(null, 'gap', 32), 32);
  const paddingY = parseF(getVal(null, 'padding_y', 100), 100);
  const darkMode = toBoolean(getVal(null, 'dark_mode', false));
  const rawBgColor = getVal(null, 'bg_color', '#FFFFFF');
  const bgColor = resolveThemeColor(rawBgColor, '#FFFFFF', '#0F172A', darkMode);
  const sectionGradient = getVal(null, 'section_gradient', false);
  const bgGradient = getVal(null, 'bg_gradient', 'linear-gradient(to bottom, #FFFFFF, #F8FAFC)');
  const staggerAnim = false;
  const globalThemeSectionAnimation = settingsValues['global_theme_section_animation'];
  const globalThemeSectionAnimationSpeed = parseFloat(settingsValues['global_theme_section_animation_speed']) || 1;
  const moduleSectionAnimation = getVal(null, 'section_animation', undefined);
  const entranceAnim = getVal(null, 'entrance_anim', 'none');
  const sectionAnimation = normalizeSectionAnimation(
    globalThemeSectionAnimation ?? moduleSectionAnimation ?? entranceAnim,
    'fade-up'
  );

  // Header Settings
  const eyebrow = getVal(`${moduleId}_el_features_header`, 'eyebrow', 'CARACTERÍSTICAS');
  const title = getVal(`${moduleId}_el_features_header`, 'title', '¿Por qué elegirnos?');
  const subtitle = getVal(`${moduleId}_el_features_header`, 'subtitle', 'Soluciones diseñadas para escalar tu negocio al siguiente nivel.');
  const headerAlign = getVal(`${moduleId}_el_features_header`, 'align', 'center');
  const headerTitleSize = getVal(`${moduleId}_el_features_header`, 'title_size', 't2');
  const headerTitleWeight = getVal(`${moduleId}_el_features_header`, 'title_weight', 'bold');
  const headerSubtitleSize = getVal(`${moduleId}_el_features_header`, 'subtitle_size', 'p');
  const headerSubtitleWeight = getVal(`${moduleId}_el_features_header`, 'subtitle_weight', 'normal');
  const headerEyebrowColor = getVal(`${moduleId}_el_features_header`, 'eyebrow_color', '#3B82F6');
  const headerEyebrowBg = getVal(`${moduleId}_el_features_header`, 'eyebrow_bg', 'rgba(59, 130, 246, 0.1)');
  const headerMarginB = parseF(getVal(`${moduleId}_el_features_header`, 'margin_b', 80), 80);

  const headerTitleColor = darkMode ? '#FFFFFF' : undefined;
  const headerSubtitleColor = darkMode ? '#94A3B8' : '#64748B';

  // Highlight Settings
  const titleHighlightType = getVal(`${moduleId}_el_features_header`, 'title_highlight_type', 'gradient');
  const titleHighlightColor = getVal(`${moduleId}_el_features_header`, 'title_highlight_color', '#3B82F6');
  const titleHighlightGradient = getVal(`${moduleId}_el_features_header`, 'title_highlight_gradient', 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)');
  const titleHighlightBold = getVal(`${moduleId}_el_features_header`, 'title_highlight_bold', true);
  const subtitleHighlightType = getVal(`${moduleId}_el_features_header`, 'subtitle_highlight_type', 'gradient');
  const subtitleHighlightColor = getVal(`${moduleId}_el_features_header`, 'subtitle_highlight_color', '#3B82F6');
  const subtitleHighlightGradient = getVal(`${moduleId}_el_features_header`, 'subtitle_highlight_gradient', 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)');
  const subtitleHighlightBold = getVal(`${moduleId}_el_features_header`, 'subtitle_highlight_bold', true);

  // Card Style
  const rawCardBg = getVal(`${moduleId}_el_feature_card`, 'card_bg', '#FFFFFF');
  const cardBg = resolveThemeColor(rawCardBg, '#FFFFFF', '#1E293B', darkMode);
  const rawCardBorder = getVal(`${moduleId}_el_feature_card`, 'card_border', 'rgba(0,0,0,0.05)');
  const cardBorder = resolveThemeColor(rawCardBorder, 'rgba(0,0,0,0.05)', 'rgba(255,255,255,0.1)', darkMode);
  const cardShadow = getVal(`${moduleId}_el_feature_card`, 'card_shadow', 'sm');
  const cardPadding = getVal(`${moduleId}_el_feature_card`, 'card_padding', 32);
  const cardRadius = getVal(`${moduleId}_el_feature_card`, 'card_radius', 24);
  const hoverLift = getVal(`${moduleId}_el_feature_card`, 'hover_lift', true);
  const cardTitleSize = getVal(`${moduleId}_el_feature_card`, 'title_size', 't3');
  const cardTitleWeight = getVal(`${moduleId}_el_feature_card`, 'title_weight', 'bold');
  const cardDescSize = getVal(`${moduleId}_el_feature_card`, 'desc_size', 'p');
  const cardDescWeight = getVal(`${moduleId}_el_feature_card`, 'desc_weight', 'normal');
  const cardTextAlign = getVal(`${moduleId}_el_feature_card`, 'text_align', 'inherit');
  const titleColor = getVal(`${moduleId}_el_feature_card`, 'title_color', darkMode ? '#FFFFFF' : '#0F172A');
  const descColor = getVal(`${moduleId}_el_feature_card`, 'desc_color', darkMode ? '#94A3B8' : '#64748B');
  const linkSize = getVal(`${moduleId}_el_feature_card`, 'link_size', 's');
  const linkWeight = getVal(`${moduleId}_el_feature_card`, 'link_weight', 'bold');
  const linkColor = getVal(`${moduleId}_el_feature_card`, 'link_color', '#3B82F6');

  // Icon Style
  const iconSize = getVal(`${moduleId}_el_feature_card`, 'icon_size', FEATURES_VISUAL_DEFAULTS.icon_size);
  const iconContainerSize = getVal(`${moduleId}_el_feature_card`, 'icon_container_size', FEATURES_VISUAL_DEFAULTS.icon_container_size);
  const iconAlign = getVal(`${moduleId}_el_feature_card`, 'icon_align', FEATURES_VISUAL_DEFAULTS.icon_align);
  const iconPosition = getVal(`${moduleId}_el_feature_card`, 'icon_position', FEATURES_VISUAL_DEFAULTS.icon_position);
  const iconColor = getVal(`${moduleId}_el_feature_card`, 'icon_color', '#3B82F6');
  const rawIconBg = getVal(`${moduleId}_el_feature_card`, 'icon_bg', 'rgba(59, 130, 246, 0.1)');
  const iconBg = resolveThemeColor(rawIconBg, 'rgba(59, 130, 246, 0.1)', 'rgba(255,255,255,0.05)', darkMode);
  const iconRadius = getVal(`${moduleId}_el_feature_card`, 'icon_radius', 12);
  const iconStyle = getVal(`${moduleId}_el_feature_card`, 'icon_style', 'soft');
  const imageSize = getVal(`${moduleId}_el_feature_card`, 'image_size', FEATURES_VISUAL_DEFAULTS.image_size);
  const imageAspect = getVal(`${moduleId}_el_feature_card`, 'image_aspect', FEATURES_VISUAL_DEFAULTS.image_aspect);
  const imageFit = getVal(`${moduleId}_el_feature_card`, 'image_fit', FEATURES_VISUAL_DEFAULTS.image_fit);
  const imagePosition = getVal(`${moduleId}_el_feature_card`, 'image_position', FEATURES_VISUAL_DEFAULTS.image_position);
  const mediaAlign = getVal(`${moduleId}_el_feature_card`, 'media_align', FEATURES_VISUAL_DEFAULTS.media_align);
  const mediaGap = getVal(`${moduleId}_el_feature_card`, 'media_gap', FEATURES_VISUAL_DEFAULTS.media_gap);
  const textGap = getVal(`${moduleId}_el_feature_card`, 'text_gap', FEATURES_VISUAL_DEFAULTS.text_gap);

  const features = getVal(`${moduleId}_el_feature_card`, 'items', []);

  logDebug('[FEATURES_RENDER_DEBUG]', {
    moduleId,
    eyebrow,
    title,
    subtitle,
    itemsCount: features?.length,
    firstItem: features?.[0],
    layout,
    columns,
    gap,
    cardRadius,
    hoverLift,
    rawHeaderTitle: settingsValues?.[`${moduleId}_el_features_header_title`],
    rawHeaderSubtitle: settingsValues?.[`${moduleId}_el_features_header_subtitle`],
    rawHeaderEyebrow: settingsValues?.[`${moduleId}_el_features_header_eyebrow`],
    rawItems: settingsValues?.[`${moduleId}_el_feature_card_items`],
    rawColumns: settingsValues?.[`${moduleId}_global_columns`],
    rawLayout: settingsValues?.[`${moduleId}_global_layout`],
    rawGap: settingsValues?.[`${moduleId}_global_gap`]
  });

  const getShadowClass = (s: string) => {
    switch (s) {
      case 'sm': return 'shadow-sm';
      case 'lg': return 'shadow-xl';
      default: return 'shadow-none';
    }
  };

  const getTypographyStyle = (sizeToken: string, weightToken: string) => {
    const size = TYPOGRAPHY_SCALE[sizeToken as keyof typeof TYPOGRAPHY_SCALE] || TYPOGRAPHY_SCALE.p;
    const weight = FONT_WEIGHTS[weightToken as keyof typeof FONT_WEIGHTS] || FONT_WEIGHTS.normal;

    return {
      fontSize: `${size.fontSize}px`,
      lineHeight: size.lineHeight,
      fontWeight: weight.value
    } as React.CSSProperties;
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
    <SectionAnimation animation={sectionAnimation} speed={globalThemeSectionAnimationSpeed}>
    <section 
      id={moduleId}
      className="w-full relative overflow-hidden"
      onClick={(e) => {
        if (isPreviewMode) return;
        e.stopPropagation();
        selectSection(moduleId);
        selectElement(`${moduleId}_global`);
      }}
      style={{ 
        backgroundColor: bgColor,
        backgroundImage: (sectionGradient && typeof bgGradient === 'string' && !bgGradient.includes('NaN')) ? bgGradient : 'none',
        paddingTop: `${paddingY}px`,
        paddingBottom: `${paddingY}px`
      }}
    >
      <div className="max-w-7xl mx-auto px-8 @container">
        {/* Header */}
        <div 
          className={`flex flex-col w-full ${headerAlign === 'center' ? 'items-center text-center' : headerAlign === 'right' ? 'items-end text-right' : 'items-start text-left'}`}
          style={{ marginBottom: `${headerMarginB}px` }}
        >
          {eyebrow && (
            <InlineEditableText
              moduleId={moduleId}
              elementId={`${moduleId}_el_features_header`}
              settingId="eyebrow"
              value={eyebrow}
              tagName="span"
              isPreviewMode={isPreviewMode}
              className="text-[10px] font-bold tracking-[0.2em] uppercase mb-4 px-3 py-1 rounded-full"
              style={{ 
                color: headerEyebrowColor,
                backgroundColor: headerEyebrowBg,
                display: 'inline-block'
              }}
            />
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
            <InlineEditableText
              moduleId={moduleId}
              elementId={`${moduleId}_el_features_header`}
              settingId="title"
              value={title}
              tagName="span"
              isPreviewMode={isPreviewMode}
            >
              <TextRenderer 
                text={title} 
                highlightType={titleHighlightType}
                highlightColor={titleHighlightColor}
                highlightGradient={titleHighlightGradient}
                highlightBold={titleHighlightBold}
              />
            </InlineEditableText>
          </h2>
          {subtitle && (
            <InlineEditableText
              moduleId={moduleId}
              elementId={`${moduleId}_el_features_header`}
              settingId="subtitle"
              value={subtitle}
              tagName="p"
              isPreviewMode={isPreviewMode}
              className="max-w-2xl leading-relaxed"
              style={{
                ...getTypographyStyle(headerSubtitleSize, headerSubtitleWeight),
                color: headerSubtitleColor
              }}
            >
              <TextRenderer 
                text={subtitle}
                highlightType={subtitleHighlightType}
                highlightColor={subtitleHighlightColor}
                highlightGradient={subtitleHighlightGradient}
                highlightBold={subtitleHighlightBold}
              />
            </InlineEditableText>
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
                iconSize={iconSize}
                iconContainerSize={iconContainerSize}
                iconAlign={iconAlign}
                iconPosition={iconPosition}
                imageSize={imageSize}
                imageAspect={imageAspect}
                imageFit={imageFit}
                imagePosition={imagePosition}
                mediaAlign={mediaAlign}
                mediaGap={mediaGap}
                textGap={textGap}
                titleColor={titleColor}
                descColor={descColor}
                linkSize={linkSize}
                linkWeight={linkWeight}
                linkColor={linkColor}
                cardTitleSize={cardTitleSize}
                cardTitleWeight={cardTitleWeight}
                cardDescSize={cardDescSize}
                cardDescWeight={cardDescWeight}
                cardRadius={cardRadius}
                darkMode={darkMode}
                moduleId={moduleId}
                isPreviewMode={isPreviewMode}
                onSave={(field: string, val: string) => {
                  const newItems = [...features];
                  newItems[i] = { ...newItems[i], [field]: val };
                  updateSectionSettings(moduleId, { [`${moduleId}_el_feature_card_items`]: newItems });
                }}
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
                iconContainerSize={iconContainerSize}
                iconAlign={iconAlign}
                iconPosition={iconPosition}
                imageSize={imageSize}
                imageAspect={imageAspect}
                imageFit={imageFit}
                imagePosition={imagePosition}
                mediaAlign={mediaAlign}
                mediaGap={mediaGap}
                textGap={textGap}
                titleColor={titleColor}
                descColor={descColor}
                linkSize={linkSize}
                linkWeight={linkWeight}
                linkColor={linkColor}
                cardTitleSize={cardTitleSize}
                cardTitleWeight={cardTitleWeight}
                cardDescSize={cardDescSize}
                cardDescWeight={cardDescWeight}
                cardTextAlign={cardTextAlign}
                darkMode={darkMode}
                moduleId={moduleId}
                isPreviewMode={isPreviewMode}
                onSave={(field: string, val: string) => {
                  const newItems = [...features];
                  newItems[i] = { ...newItems[i], [field]: val };
                  updateSectionSettings(moduleId, { [`${moduleId}_el_feature_card_items`]: newItems });
                }}
              />
            ))}
          </motion.div>
        )}
      </div>
    </section>
    </SectionAnimation>
  );
};
