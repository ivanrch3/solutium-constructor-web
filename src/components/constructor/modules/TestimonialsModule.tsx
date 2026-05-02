import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useScroll } from 'motion/react';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { TYPOGRAPHY_SCALE, FONT_WEIGHTS } from '../../../constants/typography';
import { TextRenderer } from '../TextRenderer';
import { ParallaxBackground } from '../ParallaxBackground';

const MOCK_TESTIMONIALS = [
  {
    id: 1,
    text: "La mejor decisión que hemos tomado para nuestro negocio. La interfaz es intuitiva y el soporte es excepcional.",
    author: "Elena Rodríguez",
    role: "CEO en TechFlow",
    avatar: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNFMkU4RjAiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjQwIiByPSIyMCIgZmlsbD0iIzk0QTNDQiIvPjxwYXRoIGQ9Ik0yMCA4MEMyMCA2OC45NTQzIDI4Ljk1NDMgNjAgNDAgNjBINTBDNjEuMDQ1NyA2MCA3MCA2OC45NTQzIDcwIDgwVjg1SDIwVjgwWiIgZmlsbD0iIzk0QTNDQiIvPjwvc3ZnPg==",
    logo: "https://picsum.photos/seed/logo1/100/40",
    stars: 5
  },
  {
    id: 2,
    text: "Increíble nivel de detalle y personalización. Logramos lanzar nuestra plataforma en tiempo récord.",
    author: "Marcos Pérez",
    role: "Director Creativo",
    avatar: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNFMkU4RjAiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjQwIiByPSIyMCIgZmlsbD0iIzk0QTNDQiIvPjxwYXRoIGQ9Ik0yMCA4MEMyMCA2OC45NTQzIDI4Ljk1NDMgNjAgNDAgNjBINTBDNjEuMDQ1NyA2MCA3MCA2OC45NTQzIDcwIDgwVjg1SDIwVjgwWiIgZmlsbD0iIzk0QTNDQiIvPjwvc3ZnPg==",
    logo: "https://picsum.photos/seed/logo2/100/40",
    stars: 5
  },
  {
    id: 3,
    text: "Un cambio total en nuestra productividad. Las herramientas de automatización son simplemente brillantes.",
    author: "Sofía Martínez",
    role: "Product Manager",
    avatar: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNFMkU4RjAiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjQwIiByPSIyMCIgZmlsbD0iIzk0QTNDQiIvPjxwYXRoIGQ9Ik0yMCA4MEMyMCA2OC45NTQzIDI4Ljk1NDMgNjAgNDAgNjBINTBDNjEuMDQ1NyA2MCA3MCA2OC45NTQzIDcwIDgwVjg1SDIwVjgwWiIgZmlsbD0iIzk0QTNDQiIvPjwvc3ZnPg==",
    logo: "https://picsum.photos/seed/logo3/100/40",
    stars: 4
  },
  {
    id: 4,
    text: "Calidad premium en cada detalle. No hay otra herramienta que se le acerque en el mercado actual.",
    author: "Javier López",
    role: "Fundador de StartupX",
    avatar: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNFMkU4RjAiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjQwIiByPSIyMCIgZmlsbD0iIzk0QTNDQiIvPjxwYXRoIGQ9Ik0yMCA4MEMyMCA2OC45NTQzIDI4Ljk1NDMgNjAgNDAgNjBINTBDNjEuMDQ1NyA2MCA3MCA2OC45NTQzIDcwIDgwVjg1SDIwVjgwWiIgZmlsbD0iIzk0QTNDQiIvPjwvc3ZnPg==",
    logo: "https://picsum.photos/seed/logo4/100/40",
    stars: 5
  }
];

import { InlineEditableText } from '../InlineEditableText';
import { useEditorStore } from '../../../store/editorStore';
import { GLOBAL_ANIMATIONS, getGlobalAnimation } from '../../../constants/animations';

const TestimonialCard = ({ 
  testimonial, 
  entranceAnim, 
  itemVariants, 
  hoverLift, 
  hoverGlow,
  showShadow, 
  cardBg, 
  cardRadius, 
  cardPadding, 
  borderColor,
  quoteStyle,
  showAvatar, 
  avatarShape,
  authorColor, 
  roleColor, 
  showStars,
  starColor,
  quoteSize,
  quoteWeight,
  quoteAlign,
  showCompanyLogo,
  darkMode,
  moduleId,
  isPreviewMode,
  onSave
}: any) => {
  const avatarClass = useMemo(() => {
    switch (avatarShape) {
      case 'squircle': return 'rounded-2xl';
      case 'square': return 'rounded-lg';
      default: return 'rounded-full';
    }
  }, [avatarShape]);

  const finalCardBg = darkMode ? '#1E293B' : cardBg;
  const finalBorderColor = darkMode ? 'rgba(255,255,255,0.1)' : borderColor;
  const finalQuoteColor = darkMode ? '#94A3B8' : '#475569';
  const finalAuthorColor = darkMode ? '#FFFFFF' : authorColor;
  const finalRoleColor = darkMode ? '#64748B' : roleColor;

  return (
    <motion.div
      variants={entranceAnim ? itemVariants : {}}
      whileHover={{ 
        y: hoverLift ? -8 : 0,
        boxShadow: hoverGlow ? `0 20px 40px -10px ${starColor}33` : undefined,
        transition: { duration: 0.3 } 
      }}
      className={`flex flex-col h-full relative transition-all duration-300 overflow-hidden ${showShadow && !darkMode ? 'shadow-xl shadow-slate-200/50' : ''}`}
      style={{ 
        backgroundColor: finalCardBg, 
        borderRadius: `${cardRadius}px`,
        padding: `${cardPadding}px`,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: finalBorderColor
      }}
    >
      {quoteStyle === 'background' && (
        <div className="absolute -top-4 -right-4 text-primary/5 opacity-10 pointer-events-none">
          <Quote size={160} fill="currentColor" />
        </div>
      )}

      {quoteStyle === 'top-left' && (
        <div className="mb-6 text-primary/20">
          <Quote size={40} fill="currentColor" />
        </div>
      )}
      
      <p 
        className="leading-relaxed mb-8 italic flex-grow relative z-10"
        style={{ 
          fontSize: `${TYPOGRAPHY_SCALE[quoteSize as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 18}px`,
          fontWeight: FONT_WEIGHTS[quoteWeight as keyof typeof FONT_WEIGHTS]?.value || 400,
          textAlign: quoteAlign !== 'inherit' ? quoteAlign : undefined,
          color: finalQuoteColor
        }}
      >
        <InlineEditableText
          moduleId={moduleId}
          settingId="text"
          value={testimonial.text}
          isPreviewMode={isPreviewMode}
          onSave={(val) => onSave('text', val)}
          tagName="span"
        />
      </p>

      <div className="flex items-center justify-between gap-4 mt-auto relative z-10">
        <div className="flex items-center gap-4 overflow-hidden">
          {showAvatar && testimonial.avatar && (
            <div className={`w-12 h-12 overflow-hidden border-2 border-primary/10 flex-shrink-0 ${avatarClass}`}>
              <img src={testimonial.avatar} alt={testimonial.author} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="font-bold truncate" style={{ color: finalAuthorColor }}>
              <InlineEditableText
                moduleId={moduleId}
                settingId="author"
                value={testimonial.author}
                isPreviewMode={isPreviewMode}
                onSave={(val) => onSave('author', val)}
                tagName="span"
              />
            </span>
            <span className="text-xs truncate" style={{ color: finalRoleColor }}>
              <InlineEditableText
                moduleId={moduleId}
                settingId="role"
                value={testimonial.role}
                isPreviewMode={isPreviewMode}
                onSave={(val) => onSave('role', val)}
                tagName="span"
              />
            </span>
            {showStars && (
              <div className="flex gap-0.5 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={12} 
                    className={i < testimonial.stars ? "" : "text-slate-200"} 
                    style={{ color: i < testimonial.stars ? starColor : undefined, fill: i < testimonial.stars ? starColor : 'transparent' }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        
        {showCompanyLogo && testimonial.logo && (
          <div className="h-8 w-20 flex-shrink-0 opacity-40 grayscale hover:grayscale-0 transition-all">
            <img src={testimonial.logo} alt="Company Logo" className="h-full w-full object-contain" referrerPolicy="no-referrer" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const TestimonialsModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any>,
  isPreviewMode?: boolean
}> = ({ moduleId, settingsValues, isPreviewMode = false }) => {
  const { updateSectionSettings } = useEditorStore();
  const [activeIndex, setActiveIndex] = useState(0);

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  };

  const parseF = (val: any, fallback: number) => {
    const f = parseFloat(val);
    return isNaN(f) ? fallback : f;
  };

  // Global Settings
  const layout = getVal(null, 'layout', 'carousel');
  const columns = Math.max(1, parseInt(getVal(null, 'columns', 3)) || 3);
  const gap = parseF(getVal(null, 'gap', 30), 30);
  const paddingY = parseF(getVal(null, 'padding_y', 100), 100);
  const darkMode = getVal(null, 'dark_mode', false);
  const bgColor = getVal(null, 'bg_color', darkMode ? '#0F172A' : '#F8FAFC');
  const sectionGradient = getVal(null, 'section_gradient', false);
  const bgGradient = getVal(null, 'bg_gradient', 'linear-gradient(to bottom, #F8FAFC, #FFFFFF)');
  const autoplay = getVal(null, 'autoplay', true);
  const autoplaySpeed = parseF(getVal(null, 'autoplay_speed', 5000), 5000);
  const entranceAnim = getVal(null, 'entrance_anim', 'fade_up');

  // Animation Overrides
  const globalAnimOverride = getGlobalAnimation(entranceAnim, 'testimonials');

  // Multimedia (Parallax Background)
  const bgParallaxEnabled = getVal(null, 'bg_parallax_enabled', false);
  const bgParallaxImg = getVal(null, 'bg_parallax_img', '');
  const bgParallaxOpacity = parseF(getVal(null, 'bg_parallax_opacity', 20), 20);
  const bgParallaxOverlay = getVal(null, 'bg_parallax_overlay', '#000000');
  const bgParallaxSpeed = parseF(getVal(null, 'bg_parallax_speed', 100), 100);

  // Element: Header
  const eyebrow = getVal(`${moduleId}_el_testimonials_header`, 'eyebrow', 'TESTIMONIOS');
  const headerTitle = getVal(`${moduleId}_el_testimonials_header`, 'title', 'Lo que dicen nuestros clientes');
  const headerSubtitle = getVal(`${moduleId}_el_testimonials_header`, 'subtitle', 'Historias reales de personas que confían en nosotros.');
  const headerSubtitleSize = getVal(`${moduleId}_el_testimonials_header`, 'subtitle_size', 'p');
  const headerSubtitleWeight = getVal(`${moduleId}_el_testimonials_header`, 'subtitle_weight', 'normal');
  const headerAlign = getVal(`${moduleId}_el_testimonials_header`, 'align', 'center');
  const headerTitleSize = getVal(`${moduleId}_el_testimonials_header`, 'title_size', 't2');
  const headerTitleWeight = getVal(`${moduleId}_el_testimonials_header`, 'title_weight', 'bold');
  const headerTitleColor = darkMode ? '#FFFFFF' : getVal(`${moduleId}_el_testimonials_header`, 'title_color', '#0F172A');
  const eyebrowColor = getVal(`${moduleId}_el_testimonials_header`, 'eyebrow_color', 'var(--primary-color)');
  const headerMarginB = parseF(getVal(`${moduleId}_el_testimonials_header`, 'margin_b', 60), 60);

  // Highlight Settings
  const titleHighlightType = getVal(`${moduleId}_el_testimonials_header`, 'title_highlight_type', 'gradient');
  const titleHighlightColor = getVal(`${moduleId}_el_testimonials_header`, 'title_highlight_color', '#3B82F6');
  const titleHighlightGradient = getVal(`${moduleId}_el_testimonials_header`, 'title_highlight_gradient', 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)');
  const titleHighlightBold = getVal(`${moduleId}_el_testimonials_header`, 'title_highlight_bold', true);

  const subtitleHighlightType = getVal(`${moduleId}_el_testimonials_header`, 'subtitle_highlight_type', 'none');
  const subtitleHighlightColor = getVal(`${moduleId}_el_testimonials_header`, 'subtitle_highlight_color', '#3B82F6');
  const subtitleHighlightGradient = getVal(`${moduleId}_el_testimonials_header`, 'subtitle_highlight_gradient', 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)');
  const subtitleHighlightBold = getVal(`${moduleId}_el_testimonials_header`, 'subtitle_highlight_bold', true);

  // Element: Card Style
  const cardBg = getVal(`${moduleId}_el_testimonial_card`, 'card_bg', '#FFFFFF');
  const cardRadius = parseF(getVal(`${moduleId}_el_testimonial_card`, 'card_radius', 24), 24);
  const showShadow = getVal(`${moduleId}_el_testimonial_card`, 'show_shadow', true);
  const borderColor = getVal(`${moduleId}_el_testimonial_card`, 'border_color', 'transparent');
  const quoteStyle = getVal(`${moduleId}_el_testimonial_card`, 'quote_style', 'top-left');
  const cardPadding = parseF(getVal(`${moduleId}_el_testimonial_card`, 'card_padding', 32), 32);
  const hoverLift = getVal(`${moduleId}_el_testimonial_card`, 'hover_lift', true);
  const hoverGlow = getVal(`${moduleId}_el_testimonial_card`, 'hover_glow', false);

  // Element: Author Style
  const authorColor = getVal(`${moduleId}_el_testimonial_author`, 'author_color', '#0F172A');
  const roleColor = getVal(`${moduleId}_el_testimonial_author`, 'role_color', '#64748B');
  const starColor = getVal(`${moduleId}_el_testimonial_author`, 'star_color', '#FBBF24');
  const showAvatar = getVal(`${moduleId}_el_testimonial_author`, 'show_avatar', true);
  const avatarShape = getVal(`${moduleId}_el_testimonial_author`, 'avatar_shape', 'circle');
  const showStars = getVal(`${moduleId}_el_testimonial_author`, 'show_stars', true);
  const showCompanyLogo = getVal(`${moduleId}_el_testimonial_author`, 'show_company_logo', false);
  const quoteSize = getVal(`${moduleId}_el_testimonial_author`, 'quote_size', 'p');
  const quoteWeight = getVal(`${moduleId}_el_testimonial_author`, 'quote_weight', 'normal');
  const quoteAlign = getVal(`${moduleId}_el_testimonial_author`, 'quote_align', 'inherit');

  // Element: Items
  const userItems = getVal(`${moduleId}_el_testimonial_items`, 'items', []);
  const testimonials = userItems.length > 0 ? userItems : MOCK_TESTIMONIALS;

  useEffect(() => {
    if (autoplay && (layout === 'carousel' || layout === 'focus')) {
      const interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % testimonials.length);
      }, autoplaySpeed);
      return () => clearInterval(interval);
    }
  }, [autoplay, layout, autoplaySpeed, testimonials.length]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = globalAnimOverride || {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

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

  const cardProps = {
    entranceAnim,
    itemVariants,
    hoverLift,
    hoverGlow,
    showShadow,
    cardBg,
    cardRadius,
    cardPadding,
    borderColor,
    quoteStyle,
    showAvatar,
    avatarShape,
    authorColor,
    roleColor,
    showStars,
    starColor,
    quoteSize,
    quoteWeight,
    quoteAlign,
    showCompanyLogo,
    darkMode
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
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <div 
          className={`flex flex-col w-full mb-12 ${headerAlign === 'center' ? 'items-center text-center' : headerAlign === 'right' ? 'items-end text-right' : 'items-start text-left'}`}
          style={{ marginBottom: `${headerMarginB}px` }}
        >
          {eyebrow && (
            <span 
              className="text-sm font-bold tracking-widest mb-3 uppercase"
              style={{ color: eyebrowColor }}
            >
              <InlineEditableText
                moduleId={moduleId}
                elementId={`${moduleId}_el_testimonials_header`}
                settingId="eyebrow"
                value={eyebrow}
                isPreviewMode={isPreviewMode}
              />
            </span>
          )}
          <h2 
            className="mb-4 leading-tight"
            style={{ 
              ...getTypographyStyle(headerTitleSize as any, headerTitleWeight, headerAlign),
              color: headerTitleColor 
            }}
          >
            <InlineEditableText
              moduleId={moduleId}
              elementId={`${moduleId}_el_testimonials_header`}
              settingId="title"
              value={headerTitle}
              isPreviewMode={isPreviewMode}
            >
              <TextRenderer 
                text={headerTitle} 
                highlightType={titleHighlightType}
                highlightColor={titleHighlightColor}
                highlightGradient={titleHighlightGradient}
                highlightBold={titleHighlightBold}
              />
            </InlineEditableText>
          </h2>
          {headerSubtitle && (
            <p 
              className="max-w-2xl text-lg"
              style={{ 
                ...getTypographyStyle(headerSubtitleSize as any, headerSubtitleWeight, headerAlign),
                color: darkMode ? '#94A3B8' : '#64748B' 
              }}
            >
              <InlineEditableText
                moduleId={moduleId}
                elementId={`${moduleId}_el_testimonials_header`}
                settingId="subtitle"
                value={headerSubtitle}
                isPreviewMode={isPreviewMode}
              >
                <TextRenderer 
                  text={headerSubtitle} 
                  highlightType={subtitleHighlightType}
                  highlightColor={subtitleHighlightColor}
                  highlightGradient={subtitleHighlightGradient}
                  highlightBold={subtitleHighlightBold}
                />
              </InlineEditableText>
            </p>
          )}
        </div>

        {/* Content */}
        {layout === 'carousel' || layout === 'focus' ? (
          <div className={`relative mx-auto ${layout === 'focus' ? 'max-w-2xl' : 'max-w-4xl'}`}>
            <div className="overflow-hidden px-4 py-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, x: 50, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -50, scale: 0.95 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  <TestimonialCard 
                    testimonial={testimonials[activeIndex]} 
                    {...cardProps}
                    moduleId={moduleId}
                    isPreviewMode={isPreviewMode}
                    onSave={(field: string, val: string) => {
                      const newItems = [...testimonials];
                      newItems[activeIndex] = { ...newItems[activeIndex], [field]: val };
                      updateSectionSettings(moduleId, { [`${moduleId}_el_testimonial_items_items`]: newItems });
                    }}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button 
                onClick={() => setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                className={`p-3 rounded-full shadow-md transition-all ${darkMode ? 'bg-slate-800 text-slate-400 hover:bg-primary hover:text-white' : 'bg-white text-slate-400 hover:bg-primary hover:text-white'}`}
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${i === activeIndex ? 'bg-primary w-6' : (darkMode ? 'bg-slate-700' : 'bg-slate-300')}`}
                  />
                ))}
              </div>
              <button 
                onClick={() => setActiveIndex((prev) => (prev + 1) % testimonials.length)}
                className={`p-3 rounded-full shadow-md transition-all ${darkMode ? 'bg-slate-800 text-slate-400 hover:bg-primary hover:text-white' : 'bg-white text-slate-400 hover:bg-primary hover:text-white'}`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        ) : (
          <motion.div 
            variants={entranceAnim ? containerVariants : {}}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className={`grid ${layout === 'masonry' ? 'columns-1 @md:columns-2 @lg:columns-3' : (
              columns === 4 ? 'grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-4' :
              columns === 3 ? 'grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3' :
              columns === 2 ? 'grid-cols-1 @sm:grid-cols-2' : 'grid-cols-1'
            )}`}
            style={{ 
              display: layout === 'masonry' ? 'block' : 'grid',
              gap: `${gap}px`
            }}
          >
            {testimonials.map((testimonial, i) => (
              <div key={testimonial.id || i} className={layout === 'masonry' ? 'mb-8 break-inside-avoid' : ''}>
                <TestimonialCard 
                  testimonial={testimonial} 
                  {...cardProps}
                  moduleId={moduleId}
                  isPreviewMode={isPreviewMode}
                  onSave={(field: string, val: string) => {
                    const newItems = [...testimonials];
                    newItems[i] = { ...newItems[i], [field]: val };
                    updateSectionSettings(moduleId, { [`${moduleId}_el_testimonial_items_items`]: newItems });
                  }}
                />
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};
