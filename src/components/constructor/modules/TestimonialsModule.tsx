import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';

const MOCK_TESTIMONIALS = [
  {
    id: 1,
    text: "La mejor decisión que hemos tomado para nuestro negocio. La interfaz es intuitiva y el soporte es excepcional.",
    author: "Elena Rodríguez",
    role: "CEO en TechFlow",
    avatar: "https://i.pravatar.cc/150?u=elena",
    logo: "https://picsum.photos/seed/logo1/100/40",
    stars: 5
  },
  {
    id: 2,
    text: "Increíble nivel de detalle y personalización. Logramos lanzar nuestra plataforma en tiempo récord.",
    author: "Marcos Pérez",
    role: "Director Creativo",
    avatar: "https://i.pravatar.cc/150?u=marcos",
    logo: "https://picsum.photos/seed/logo2/100/40",
    stars: 5
  },
  {
    id: 3,
    text: "Un cambio total en nuestra productividad. Las herramientas de automatización son simplemente brillantes.",
    author: "Sofía Martínez",
    role: "Product Manager",
    avatar: "https://i.pravatar.cc/150?u=sofia",
    logo: "https://picsum.photos/seed/logo3/100/40",
    stars: 4
  },
  {
    id: 4,
    text: "Calidad premium en cada detalle. No hay otra herramienta que se le acerque en el mercado actual.",
    author: "Javier López",
    role: "Fundador de StartupX",
    avatar: "https://i.pravatar.cc/150?u=javier",
    logo: "https://picsum.photos/seed/logo4/100/40",
    stars: 5
  }
];

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
  showCompanyLogo
}: any) => {
  const avatarClass = useMemo(() => {
    switch (avatarShape) {
      case 'squircle': return 'rounded-2xl';
      case 'square': return 'rounded-lg';
      default: return 'rounded-full';
    }
  }, [avatarShape]);

  return (
    <motion.div
      variants={entranceAnim ? itemVariants : {}}
      whileHover={{ 
        y: hoverLift ? -8 : 0,
        boxShadow: hoverGlow ? `0 20px 40px -10px ${starColor}33` : undefined,
        transition: { duration: 0.3 } 
      }}
      className={`flex flex-col h-full relative transition-all duration-300 overflow-hidden ${showShadow ? 'shadow-xl shadow-slate-200/50' : ''}`}
      style={{ 
        backgroundColor: cardBg, 
        borderRadius: `${cardRadius}px`,
        padding: `${cardPadding}px`,
        border: `1px solid ${borderColor}`
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
        className="text-slate-600 leading-relaxed mb-8 italic flex-grow relative z-10"
        style={{ fontSize: `${quoteSize}px` }}
      >
        "{testimonial.text}"
      </p>

      <div className="flex items-center justify-between gap-4 mt-auto relative z-10">
        <div className="flex items-center gap-4 overflow-hidden">
          {showAvatar && (
            <div className={`w-12 h-12 overflow-hidden border-2 border-primary/10 flex-shrink-0 ${avatarClass}`}>
              <img src={testimonial.avatar} alt={testimonial.author} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="font-bold truncate" style={{ color: authorColor }}>{testimonial.author}</span>
            <span className="text-xs truncate" style={{ color: roleColor }}>{testimonial.role}</span>
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
  settingsValues: Record<string, any> 
}> = ({ moduleId, settingsValues }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  };

  // Global Settings
  const layout = getVal(null, 'layout', 'carousel');
  const columns = getVal(null, 'columns', 3);
  const gap = getVal(null, 'gap', 30);
  const paddingY = getVal(null, 'padding_y', 100);
  const bgColor = getVal(null, 'bg_color', '#F8FAFC');
  const sectionGradient = getVal(null, 'section_gradient', false);
  const autoplay = getVal(null, 'autoplay', true);
  const autoplaySpeed = getVal(null, 'autoplay_speed', 5000);
  const entranceAnim = getVal(null, 'entrance_anim', true);

  // Element: Header
  const eyebrow = getVal(`${moduleId}_el_testimonials_header`, 'eyebrow', 'TESTIMONIOS');
  const headerTitle = getVal(`${moduleId}_el_testimonials_header`, 'title', 'Lo que dicen nuestros clientes');
  const headerSubtitle = getVal(`${moduleId}_el_testimonials_header`, 'subtitle', 'Historias reales de personas que confían en nosotros.');
  const headerAlign = getVal(`${moduleId}_el_testimonials_header`, 'align', 'center');
  const headerTitleSize = getVal(`${moduleId}_el_testimonials_header`, 'title_size', 40);
  const headerTitleColor = getVal(`${moduleId}_el_testimonials_header`, 'title_color', '#0F172A');
  const eyebrowColor = getVal(`${moduleId}_el_testimonials_header`, 'eyebrow_color', 'var(--primary-color)');
  const headerMarginB = getVal(`${moduleId}_el_testimonials_header`, 'margin_b', 60);

  // Element: Card Style
  const cardBg = getVal(`${moduleId}_el_testimonial_card`, 'card_bg', '#FFFFFF');
  const cardRadius = getVal(`${moduleId}_el_testimonial_card`, 'card_radius', 24);
  const showShadow = getVal(`${moduleId}_el_testimonial_card`, 'show_shadow', true);
  const borderColor = getVal(`${moduleId}_el_testimonial_card`, 'border_color', 'transparent');
  const quoteStyle = getVal(`${moduleId}_el_testimonial_card`, 'quote_style', 'top-left');
  const cardPadding = getVal(`${moduleId}_el_testimonial_card`, 'card_padding', 32);
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
  const quoteSize = getVal(`${moduleId}_el_testimonial_author`, 'quote_size', 18);

  useEffect(() => {
    if (autoplay && (layout === 'carousel' || layout === 'focus')) {
      const interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % MOCK_TESTIMONIALS.length);
      }, autoplaySpeed);
      return () => clearInterval(interval);
    }
  }, [autoplay, layout, autoplaySpeed]);

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
    showCompanyLogo
  };

  return (
    <section 
      className="w-full relative overflow-hidden"
      style={{ 
        backgroundColor: bgColor,
        backgroundImage: sectionGradient ? `linear-gradient(to bottom, ${bgColor}, white)` : 'none',
        paddingTop: `${paddingY}px`,
        paddingBottom: `${paddingY}px`
      }}
    >
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <div 
          className={`flex flex-col mb-12 ${headerAlign === 'center' ? 'items-center text-center' : 'items-start text-left'}`}
          style={{ marginBottom: `${headerMarginB}px` }}
        >
          {eyebrow && (
            <span 
              className="text-sm font-bold tracking-widest mb-3 uppercase"
              style={{ color: eyebrowColor }}
            >
              {eyebrow}
            </span>
          )}
          <h2 
            className="font-black mb-4 leading-tight text-3xl @md:text-4xl @lg:text-5xl"
            style={{ fontSize: `${headerTitleSize}px`, color: headerTitleColor }}
          >
            {headerTitle}
          </h2>
          {headerSubtitle && (
            <p className="text-slate-500 max-w-2xl text-lg">
              {headerSubtitle}
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
                    testimonial={MOCK_TESTIMONIALS[activeIndex]} 
                    {...cardProps}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button 
                onClick={() => setActiveIndex((prev) => (prev - 1 + MOCK_TESTIMONIALS.length) % MOCK_TESTIMONIALS.length)}
                className="p-3 rounded-full bg-white shadow-md hover:bg-primary hover:text-white transition-all text-slate-400"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex gap-2">
                {MOCK_TESTIMONIALS.map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${i === activeIndex ? 'bg-primary w-6' : 'bg-slate-300'}`}
                  />
                ))}
              </div>
              <button 
                onClick={() => setActiveIndex((prev) => (prev + 1) % MOCK_TESTIMONIALS.length)}
                className="p-3 rounded-full bg-white shadow-md hover:bg-primary hover:text-white transition-all text-slate-400"
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
            {MOCK_TESTIMONIALS.map((testimonial, i) => (
              <div key={testimonial.id} className={layout === 'masonry' ? 'mb-8 break-inside-avoid' : ''}>
                <TestimonialCard 
                  testimonial={testimonial} 
                  {...cardProps}
                />
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};
