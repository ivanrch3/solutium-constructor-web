import React from 'react';
import { motion, useScroll } from 'motion/react';
import { ArrowRight, ChevronDown, Play } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { TYPOGRAPHY_SCALE, FONT_WEIGHTS } from '../../../constants/typography';
import { TextRenderer } from '../TextRenderer';
import { ParallaxBackground } from '../ParallaxBackground';
import { RotatingText } from '../RotatingText';
import { InlineEditableText } from '../InlineEditableText';
import { parseNumSafe } from '../utils';
import { useEditorStore } from '../../../store/editorStore';

import { GLOBAL_ANIMATIONS, getGlobalAnimation } from '../../../constants/animations';

export const HeroModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any>,
  logoUrl?: string | null,
  logoWhiteUrl?: string | null,
  isPreviewMode?: boolean
}> = ({ moduleId, settingsValues, logoUrl, logoWhiteUrl, isPreviewMode = false }) => {
  const { updateSectionSettings, selectSection, selectElement } = useEditorStore();
  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  };

  const containerRef = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Global Settings
  const layout = getVal(null, 'layout', 'split');
  const height = getVal(null, 'height', 'screen');
  const maxWidth = parseNumSafe(getVal(null, 'max_width', 1200), 1200);
  const darkMode = getVal(null, 'dark_mode', false);
  const bgType = getVal(null, 'bg_type', 'color');
  const bgColor = getVal(null, 'bg_color', darkMode ? '#0F172A' : '#FFFFFF');
  const bgGradient = getVal(null, 'bg_gradient', 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)');
  const overlayColor = getVal(null, 'overlay_color', '#000000');
  const overlayOpacity = parseNumSafe(getVal(null, 'overlay_opacity', 0), 0);
  const showPattern = getVal(null, 'show_pattern', true);
  const showBlobs = getVal(null, 'show_blobs', true);
  const scrollIndicator = getVal(null, 'scroll_indicator', true);
  const scrollText = getVal(null, 'scroll_text', 'SCROLL');
  const entranceAnim = getVal(null, 'entrance_anim', 'fade_up');

  // Animation Overrides
  const globalAnimOverride = getGlobalAnimation(entranceAnim, 'hero');

  // Multimedia (Parallax Background)
  const bgParallaxEnabled = getVal(null, 'bg_parallax_enabled', false);
  const bgParallaxImg = getVal(null, 'bg_parallax_img', '');
  const bgParallaxOpacity = parseNumSafe(getVal(null, 'bg_parallax_opacity', 20), 20);
  const bgParallaxOverlay = getVal(null, 'bg_parallax_overlay', '#000000');
  const bgParallaxSpeed = parseNumSafe(getVal(null, 'bg_parallax_speed', 100), 100);

  // Element: Typography
  const eyebrow = getVal(`${moduleId}_el_hero_typography`, 'eyebrow', 'NUEVA SOLUCIÓN');
  const title = getVal(`${moduleId}_el_hero_typography`, 'title', 'Transforma tu presencia digital hoy');
  const subtitle = getVal(`${moduleId}_el_hero_typography`, 'subtitle', 'Construimos el futuro de tu marca con herramientas de última generación.');
  const titleSize = getVal(`${moduleId}_el_hero_typography`, 'title_size', 't1');
  const titleWeight = getVal(`${moduleId}_el_hero_typography`, 'title_weight', 'bold');
  const subtitleSize = getVal(`${moduleId}_el_hero_typography`, 'subtitle_size', 'p');
  const subtitleWeight = getVal(`${moduleId}_el_hero_typography`, 'subtitle_weight', 'normal');
  
  // Highlight Settings
  const titleHighlightType = getVal(`${moduleId}_el_hero_typography`, 'title_highlight_type', 'gradient');
  const titleHighlightColor = getVal(`${moduleId}_el_hero_typography`, 'title_highlight_color', '#3B82F6');
  const titleHighlightGradient = getVal(`${moduleId}_el_hero_typography`, 'title_highlight_gradient', 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)');
  const titleHighlightBold = getVal(`${moduleId}_el_hero_typography`, 'title_highlight_bold', true);

  // Rotating Text Settings
  const rotatingEnabled = getVal(`${moduleId}_el_hero_typography`, 'rotating_enabled', false);
  const rotatingFixed = getVal(`${moduleId}_el_hero_typography`, 'rotating_fixed', 'Mi sueño en esta vida es');
  const rotatingOptions = getVal(`${moduleId}_el_hero_typography`, 'rotating_options', []);
  const rotatingAnim = getVal(`${moduleId}_el_hero_typography`, 'rotating_anim', 'fade');
  const rotatingSpeed = getVal(`${moduleId}_el_hero_typography`, 'rotating_speed', 3000);
  const rotatingColor = getVal(`${moduleId}_el_hero_typography`, 'rotating_color', '#3B82F6');
  const rotatingGradient = getVal(`${moduleId}_el_hero_typography`, 'rotating_gradient', '');

  const subtitleHighlightType = getVal(`${moduleId}_el_hero_typography`, 'subtitle_highlight_type', 'gradient');
  const subtitleHighlightColor = getVal(`${moduleId}_el_hero_typography`, 'subtitle_highlight_color', '#3B82F6');
  const subtitleHighlightGradient = getVal(`${moduleId}_el_hero_typography`, 'subtitle_highlight_gradient', 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)');
  const subtitleHighlightBold = getVal(`${moduleId}_el_hero_typography`, 'subtitle_highlight_bold', true);

  const eyebrowBg = getVal(`${moduleId}_el_hero_typography`, 'eyebrow_bg', 'rgba(59, 130, 246, 0.1)');
  const eyebrowColor = getVal(`${moduleId}_el_hero_typography`, 'eyebrow_color', '#3B82F6');
  const typographyAlign = getVal(`${moduleId}_el_hero_typography`, 'align', 'inherit');
  const typographyMarginB = parseNumSafe(getVal(`${moduleId}_el_hero_typography`, 'margin_b', 0), 0);

  // Element: Media
  const mediaType = getVal(`${moduleId}_el_hero_media`, 'media_type', 'image');
  const visualImage = getVal(`${moduleId}_el_hero_media`, 'image', 'https://picsum.photos/seed/hero/1200/800') || 'https://picsum.photos/seed/hero/1200/800';
  const visualVideo = getVal(`${moduleId}_el_hero_media`, 'video_url', '');
  const visualRadius = parseNumSafe(getVal(`${moduleId}_el_hero_media`, 'border_radius', 24), 24);
  const visualShadow = getVal(`${moduleId}_el_hero_media`, 'shadow', 'lg');
  const visualFit = getVal(`${moduleId}_el_hero_media`, 'object_fit', 'cover');
  const perspective = parseNumSafe(getVal(`${moduleId}_el_hero_media`, 'perspective', 1000), 1000);
  const rotationY = parseNumSafe(getVal(`${moduleId}_el_hero_media`, 'rotation_y', 15), 15);
  const floatingAnim = getVal(`${moduleId}_el_hero_media`, 'floating_anim', true);

  // Element: CTAs
  const primaryText = getVal(`${moduleId}_el_hero_ctas`, 'primary_text', 'Comenzar Ahora');
  const primaryIcon = getVal(`${moduleId}_el_hero_ctas`, 'primary_icon', 'ArrowRight');
  const primaryType = getVal(`${moduleId}_el_hero_ctas`, 'primary_link_type', 'external');
  const primaryUrl = getVal(`${moduleId}_el_hero_ctas`, 'primary_url', '');
  const primaryTarget = getVal(`${moduleId}_el_hero_ctas`, 'primary_target', '_self');
  
  const secondaryText = getVal(`${moduleId}_el_hero_ctas`, 'secondary_text', 'Saber Más');
  const secondaryIcon = getVal(`${moduleId}_el_hero_ctas`, 'secondary_icon', '');
  const secondaryType = getVal(`${moduleId}_el_hero_ctas`, 'secondary_link_type', 'external');
  const secondaryUrl = getVal(`${moduleId}_el_hero_ctas`, 'secondary_url', '');
  const secondaryTarget = getVal(`${moduleId}_el_hero_ctas`, 'secondary_target', '_self');

  const hasPrimary = primaryUrl && primaryUrl !== '';
  const hasSecondary = secondaryUrl && secondaryUrl !== '';

  const primaryBg = getVal(`${moduleId}_el_hero_ctas`, 'primary_bg', 'var(--primary-color)');
  const primaryColor = getVal(`${moduleId}_el_hero_ctas`, 'primary_color', '#FFFFFF');
  const secondaryStyle = getVal(`${moduleId}_el_hero_ctas`, 'secondary_style', 'outline');
  const shimmerEffect = getVal(`${moduleId}_el_hero_ctas`, 'shimmer_effect', false);
  const hoverEffect = getVal(`${moduleId}_el_hero_ctas`, 'hover_effect', 'lift');
  const pulseEffect = getVal(`${moduleId}_el_hero_ctas`, 'pulse_effect', true);
  const btnRadius = parseNumSafe(getVal(`${moduleId}_el_hero_ctas`, 'btn_radius', 16), 16);
  const btnWidthMobile = getVal(`${moduleId}_el_hero_ctas`, 'btn_width', 'auto');

  // Element: Social Proof
  const showProof = getVal(`${moduleId}_el_hero_social_proof`, 'show_proof', true);
  const proofText = getVal(`${moduleId}_el_hero_social_proof`, 'proof_text', 'Confiado por +500 empresas');
  const avatars = getVal(`${moduleId}_el_hero_social_proof`, 'avatars', []);
  const proofFontSize = getVal(`${moduleId}_el_hero_social_proof`, 'font_size', 's');
  const proofWeight = getVal(`${moduleId}_el_hero_social_proof`, 'font_weight', 'bold');
  const proofMarginB = parseNumSafe(getVal(`${moduleId}_el_hero_social_proof`, 'margin_b', 0), 0);

  const IconRenderer = ({ name, size = 16, className = "" }: { name: string, size?: number, className?: string }) => {
    const IconComponent = (LucideIcons as any)[name];
    if (!IconComponent) return null;
    return <IconComponent size={size} className={className} />;
  };

  const getTypographyStyle = (sizeToken: string, weightToken: string) => {
    const size = TYPOGRAPHY_SCALE[sizeToken as keyof typeof TYPOGRAPHY_SCALE] || TYPOGRAPHY_SCALE.p;
    const weight = FONT_WEIGHTS[weightToken as keyof typeof FONT_WEIGHTS] || FONT_WEIGHTS.normal;
    return {
      fontSize: `${size.fontSize}px`,
      lineHeight: size.lineHeight,
      fontWeight: weight.value,
    } as React.CSSProperties;
  };

  const sectionHeight = height === 'screen' ? 'min-h-screen' : 
                        height === 'large' ? 'min-h-[80vh]' : 
                        height === 'medium' ? 'min-h-[60vh]' : 'min-h-auto';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants: any = globalAnimOverride || {
    fade_up: {
      hidden: { y: 30, opacity: 0 },
      visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
    },
    reveal: {
      hidden: { x: -30, opacity: 0 },
      visible: { x: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } }
    },
    zoom: {
      hidden: { scale: 0.9, opacity: 0 },
      visible: { scale: 1, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } }
    }
  }[entranceAnim as 'fade_up' | 'reveal' | 'zoom'] || {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.8 } }
  };

  const renderContent = (isCentered = false) => {
    const finalAlign = typographyAlign === 'inherit' ? (isCentered ? 'center' : 'left') : typographyAlign;
    
    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className={`flex flex-col w-full ${
          finalAlign === 'center' ? 'items-center text-center mx-auto' : 
          finalAlign === 'right' ? 'items-end text-right ml-auto' : 
          'items-start text-left mr-auto'
        } gap-6 max-w-2xl relative z-30`}
        style={{ marginBottom: `${typographyMarginB}px` }}
      >
      {eyebrow && (
        <InlineEditableText
          moduleId={moduleId}
          elementId={`${moduleId}_el_hero_typography`}
          settingId="eyebrow"
          value={eyebrow}
          tagName="span"
          isPreviewMode={isPreviewMode}
          className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]"
          style={{ backgroundColor: eyebrowBg, color: eyebrowColor, display: 'inline-block' }}
        />
      )}
      
      <motion.h1 
        variants={itemVariants}
        className="leading-[1.1] tracking-tight"
        style={{ 
          ...getTypographyStyle(titleSize, titleWeight),
          color: darkMode ? '#FFFFFF' : '#0F172A'
        }}
      >
        {rotatingEnabled ? (
          <RotatingText 
            fixedText={rotatingFixed}
            options={rotatingOptions.map((opt: any) => opt.text)}
            color={rotatingColor}
            gradient={rotatingGradient}
            speed={rotatingSpeed}
            animationType={rotatingAnim as any}
            moduleId={moduleId}
            isPreviewMode={isPreviewMode}
            onSaveFixed={(val) => {
              updateSectionSettings(moduleId, { [`${moduleId}_el_hero_typography_rotating_fixed`]: val });
            }}
            onSaveOption={(idx, val) => {
              const newOptions = [...rotatingOptions];
              newOptions[idx] = { ...newOptions[idx], text: val };
              updateSectionSettings(moduleId, { [`${moduleId}_el_hero_typography_rotating_options`]: newOptions });
            }}
          />
        ) : (
          <InlineEditableText
            moduleId={moduleId}
            elementId={`${moduleId}_el_hero_typography`}
            settingId="title"
            value={title}
            tagName="span"
            isPreviewMode={isPreviewMode}
            style={{ display: 'inline-block', width: '100%' }}
          >
            <TextRenderer 
              text={title} 
              highlightType={titleHighlightType}
              highlightColor={titleHighlightColor}
              highlightGradient={titleHighlightGradient}
              highlightBold={titleHighlightBold}
            />
          </InlineEditableText>
        )}
      </motion.h1>

      {subtitle && (
        <motion.p
          variants={itemVariants}
          className="text-lg leading-relaxed opacity-70"
          style={{ 
            ...getTypographyStyle(subtitleSize, subtitleWeight),
            color: darkMode ? '#94A3B8' : '#475569'
          }}
        >
          <InlineEditableText
            moduleId={moduleId}
            elementId={`${moduleId}_el_hero_typography`}
            settingId="subtitle"
            value={subtitle}
            tagName="span"
            isPreviewMode={isPreviewMode}
            style={{ display: 'inline-block', width: '100%' }}
          >
            <TextRenderer 
              text={subtitle} 
              highlightType={subtitleHighlightType}
              highlightColor={subtitleHighlightColor}
              highlightGradient={subtitleHighlightGradient}
              highlightBold={subtitleHighlightBold}
            />
          </InlineEditableText>
        </motion.p>
      )}

      <motion.div 
        variants={itemVariants} 
        className={`flex flex-wrap gap-4 w-full ${isCentered ? 'justify-center' : 'justify-start'}`}
      >
        {hasPrimary && (
          <motion.a 
            href={primaryUrl}
            target={primaryTarget === '_blank' ? '_blank' : undefined}
            rel={primaryTarget === '_blank' ? 'noopener noreferrer' : undefined}
            whileHover={hoverEffect === 'lift' ? { y: -5 } : { boxShadow: `0 0 20px ${primaryBg}40` }}
            whileTap={{ scale: 0.95 }}
            animate={pulseEffect ? { 
              boxShadow: [`0 0 0 0px ${primaryBg}40`, `0 0 0 15px ${primaryBg}00`]
            } : {}}
            transition={pulseEffect ? { repeat: Infinity, duration: 2 } : {}}
            onClick={(e) => {
              if (isPreviewMode) return;
              e.stopPropagation();
              selectSection(moduleId);
              selectElement(`${moduleId}_el_hero_ctas`);
            }}
            className={`group relative overflow-hidden flex items-center justify-center gap-2 px-8 py-4 font-black uppercase tracking-widest text-[11px] shadow-2xl transition-all ${btnWidthMobile === 'full' ? 'w-full sm:w-auto' : 'w-auto'}`}
            style={{ 
              backgroundColor: primaryBg,
              color: primaryColor,
              borderRadius: `${btnRadius}px`
            }}
          >
            {shimmerEffect && (
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            )}
            <InlineEditableText
              moduleId={moduleId}
              elementId={`${moduleId}_el_hero_ctas`}
              settingId="primary_text"
              value={primaryText}
              tagName="span"
              isPreviewMode={isPreviewMode}
            />
            {primaryIcon && <IconRenderer name={primaryIcon} className="group-hover:translate-x-1 transition-transform" />}
          </motion.a>
        )}

        {hasSecondary && (
          <motion.a 
            href={secondaryUrl}
            target={secondaryTarget === '_blank' ? '_blank' : undefined}
            rel={secondaryTarget === '_blank' ? 'noopener noreferrer' : undefined}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              if (isPreviewMode) return;
              e.stopPropagation();
              selectSection(moduleId);
              selectElement(`${moduleId}_el_hero_ctas`);
            }}
            className={`flex items-center justify-center gap-2 px-8 py-4 font-black uppercase tracking-widest text-[11px] transition-all ${btnWidthMobile === 'full' ? 'w-full sm:w-auto' : 'w-auto'}`}
            style={{ 
              backgroundColor: secondaryStyle === 'solid' ? (darkMode ? '#334155' : '#F1F5F9') : 'transparent',
              color: darkMode ? '#FFFFFF' : '#0F172A',
              border: secondaryStyle === 'outline' ? `2px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` : 'none',
              borderRadius: `${btnRadius}px`
            }}
          >
            <InlineEditableText
              moduleId={moduleId}
              elementId={`${moduleId}_el_hero_ctas`}
              settingId="secondary_text"
              value={secondaryText}
              tagName="span"
              isPreviewMode={isPreviewMode}
            />
            {secondaryIcon && <IconRenderer name={secondaryIcon} />}
          </motion.a>
        )}
      </motion.div>

      {showProof && (
        <motion.div 
          variants={itemVariants} 
          className="flex items-center gap-4 mt-4"
          style={{ marginBottom: `${proofMarginB}px` }}
        >
          <div className="flex -space-x-3">
            {(avatars.length > 0 ? avatars : [1,2,3,4]).map((avatar: any, i: number) => {
              const baseSize = TYPOGRAPHY_SCALE[proofFontSize as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 12;
              const avatarSize = Math.max(32, baseSize * 2.5);
              return (
                <div 
                  key={i} 
                  className="rounded-full border-2 border-white overflow-hidden bg-slate-100"
                  style={{ 
                    width: `${avatarSize}px`, 
                    height: `${avatarSize}px`,
                    borderColor: darkMode ? '#0F172A' : '#FFFFFF' 
                  }}
                >
                  <img 
                    src={avatar.img || `https://i.pravatar.cc/100?u=${i}`} 
                    alt="User" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              );
            })}
          </div>
          <InlineEditableText
            moduleId={moduleId}
            elementId={`${moduleId}_el_hero_social_proof`}
            settingId="proof_text"
            value={proofText}
            tagName="span"
            isPreviewMode={isPreviewMode}
            className="opacity-60 uppercase tracking-wider"
            style={{ 
              fontSize: `${TYPOGRAPHY_SCALE[proofFontSize as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 12}px`,
              fontWeight: FONT_WEIGHTS[proofWeight as keyof typeof FONT_WEIGHTS]?.value || 800
            }}
          />
        </motion.div>
      )}
    </motion.div>
    );
  };

  const renderVisual = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, rotateY: rotationY }}
      whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
      animate={floatingAnim ? {
        y: [0, -15, 0],
        rotate: [0, 1, 0]
      } : {}}
      transition={floatingAnim ? {
        y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" },
        opacity: { duration: 1 },
        scale: { duration: 1 }
      } : { duration: 1 }}
      viewport={{ once: true }}
      onClick={(e) => {
        if (isPreviewMode) return;
        e.stopPropagation();
        selectSection(moduleId);
        selectElement(`${moduleId}_el_hero_media`);
      }}
      className="relative z-30"
      style={{ perspective: `${perspective}px` }}
    >
      <div 
        className={`relative overflow-hidden transition-all duration-500 ${
          visualShadow === 'lg' ? 'shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)]' : 
          visualShadow === 'sm' ? 'shadow-xl' : ''
        }`}
        style={{ 
          borderRadius: `${visualRadius}px`,
          backgroundColor: darkMode ? '#1E293B' : '#F8FAFC'
        }}
      >
        {mediaType === 'image' && visualImage ? (
          <img 
            src={visualImage} 
            alt="Hero Visual" 
            className="w-full h-auto block"
            style={{ objectFit: visualFit as any }}
            referrerPolicy="no-referrer"
          />
        ) : mediaType === 'image' ? (
          <div className="aspect-video bg-slate-100 flex items-center justify-center text-slate-300">
            <LucideIcons.Image size={48} />
          </div>
        ) : (
          <div className="relative aspect-video bg-black flex items-center justify-center group">
            <video 
              src={visualVideo} 
              className="w-full h-full object-cover"
              autoPlay muted loop playsInline
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-all">
                <Play fill="currentColor" size={24} />
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Decorative elements */}
      {showBlobs && (
        <>
          <div className="absolute -z-10 -top-12 -right-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -z-10 -bottom-12 -left-12 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </>
      )}
    </motion.div>
  );

  const renderBackground = () => {
    if (bgType === 'video' && visualVideo) {
      return (
        <div className="absolute inset-0 z-0">
          <video 
            src={visualVideo} 
            autoPlay muted loop playsInline 
            className="w-full h-full object-cover"
          />
          <div 
            className="absolute inset-0" 
            style={{ backgroundColor: overlayColor, opacity: overlayOpacity / 100 }}
          />
        </div>
      );
    }
    if (bgType === 'image' && visualImage) {
      return (
        <div className="absolute inset-0 z-0">
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${visualImage})` }}
          />
          <div 
            className="absolute inset-0" 
            style={{ backgroundColor: overlayColor, opacity: overlayOpacity / 100 }}
          />
        </div>
      );
    }
    if (bgType === 'gradient') {
      return (
        <div 
          className="absolute inset-0 z-0" 
          style={{ background: (typeof bgGradient === 'string' && !bgGradient.includes('NaN')) ? bgGradient : 'none' }}
        />
      );
    }
    return (
      <div 
        className="absolute inset-0 z-0" 
        style={{ backgroundColor: bgColor }}
      />
    );
  };

  return (
    <section 
      id={moduleId}
      ref={containerRef}
      className={`relative w-full overflow-hidden flex items-center ${sectionHeight}`}
      onClick={(e) => {
        if (isPreviewMode) return;
        e.stopPropagation();
        selectSection(moduleId);
        selectElement(`${moduleId}_global`);
      }}
    >
      {renderBackground()}

      <ParallaxBackground 
        scrollYProgress={scrollYProgress}
        enabled={bgParallaxEnabled}
        imageUrl={bgParallaxImg}
        opacity={bgParallaxOpacity}
        overlayColor={bgParallaxOverlay}
        speed={bgParallaxSpeed}
      />

      <div 
        className="relative z-30 w-full px-8 mx-auto py-20"
        style={{ maxWidth: `${maxWidth}px` }}
      >
        {layout === 'split' && (
          <div className="grid grid-cols-1 @lg:grid-cols-2 gap-16 @lg:gap-24 items-center">
            {renderContent()}
            {renderVisual()}
          </div>
        )}

        {layout === 'reverse' && (
          <div className="grid grid-cols-1 @lg:grid-cols-2 gap-16 @lg:gap-24 items-center">
            <div className="order-2 @lg:order-1">
              {renderVisual()}
            </div>
            <div className="order-1 @lg:order-2">
              {renderContent()}
            </div>
          </div>
        )}

        {(layout === 'center' || layout === 'full_bg') && (
          <div className="flex flex-col items-center gap-16">
            {renderContent(true)}
            {layout === 'center' && renderVisual()}
          </div>
        )}
      </div>

      {scrollIndicator && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 text-primary"
        >
          <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-50">{scrollText}</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown size={20} />
          </motion.div>
        </motion.div>
      )}

      {/* Background patterns */}
      {showPattern && (
        <div className="absolute inset-0 z-10 opacity-[0.03] pointer-events-none" 
          style={{ backgroundImage: `radial-gradient(${darkMode ? '#fff' : '#000'} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} 
        />
      )}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </section>
  );
};
