import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';

const MOCK_TESTIMONIALS = [
  {
    id: 1,
    text: "La mejor decisión que hemos tomado para nuestro negocio. La interfaz es intuitiva y el soporte es excepcional.",
    author: "Elena Rodríguez",
    role: "CEO en TechFlow",
    avatar: "https://i.pravatar.cc/150?u=elena",
    stars: 5
  },
  {
    id: 2,
    text: "Increíble nivel de detalle y personalización. Logramos lanzar nuestra plataforma en tiempo récord.",
    author: "Marcos Pérez",
    role: "Director Creativo",
    avatar: "https://i.pravatar.cc/150?u=marcos",
    stars: 5
  },
  {
    id: 3,
    text: "Un cambio total en nuestra productividad. Las herramientas de automatización son simplemente brillantes.",
    author: "Sofía Martínez",
    role: "Product Manager",
    avatar: "https://i.pravatar.cc/150?u=sofia",
    stars: 4
  },
  {
    id: 4,
    text: "Calidad premium en cada detalle. No hay otra herramienta que se le acerque en el mercado actual.",
    author: "Javier López",
    role: "Fundador de StartupX",
    avatar: "https://i.pravatar.cc/150?u=javier",
    stars: 5
  }
];

const TestimonialCard = ({ 
  testimonial, 
  entranceAnim, 
  itemVariants, 
  hoverLift, 
  showShadow, 
  cardBg, 
  cardRadius, 
  cardPadding, 
  showAvatar, 
  authorColor, 
  roleColor, 
  showStars 
}: any) => (
  <motion.div
    variants={entranceAnim ? itemVariants : {}}
    whileHover={hoverLift ? { y: -8, transition: { duration: 0.3 } } : {}}
    className={`flex flex-col h-full transition-all duration-300 ${showShadow ? 'shadow-xl shadow-slate-200/50' : ''} p-6 @md:p-8`}
    style={{ 
      backgroundColor: cardBg, 
      borderRadius: `${cardRadius}px`
    }}
  >
    <div className="mb-6 text-primary/20">
      <Quote size={40} fill="currentColor" />
    </div>
    
    <p className="text-slate-600 leading-relaxed mb-8 italic flex-grow">
      "{testimonial.text}"
    </p>

    <div className="flex items-center gap-4 mt-auto">
      {showAvatar && (
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/10 flex-shrink-0">
          <img src={testimonial.avatar} alt={testimonial.author} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
      )}
      <div className="flex flex-col overflow-hidden">
        <span className="font-bold truncate" style={{ color: authorColor }}>{testimonial.author}</span>
        <span className="text-xs truncate" style={{ color: roleColor }}>{testimonial.role}</span>
        {showStars && (
          <div className="flex gap-0.5 mt-1">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={12} 
                className={i < testimonial.stars ? "text-amber-400 fill-amber-400" : "text-slate-200"} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  </motion.div>
);

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
  const autoplay = getVal(null, 'autoplay', true);
  const entranceAnim = getVal(null, 'entrance_anim', true);

  // Element: Header
  const headerTitle = getVal(`${moduleId}_el_testimonials_header`, 'title', 'Lo que dicen nuestros clientes');
  const headerSubtitle = getVal(`${moduleId}_el_testimonials_header`, 'subtitle', 'Historias reales de personas que confían en nosotros.');
  const headerAlign = getVal(`${moduleId}_el_testimonials_header`, 'align', 'center');
  const headerTitleSize = getVal(`${moduleId}_el_testimonials_header`, 'title_size', 32);
  const headerMarginB = getVal(`${moduleId}_el_testimonials_header`, 'margin_b', 60);

  // Element: Card Style
  const cardBg = getVal(`${moduleId}_el_testimonial_card`, 'card_bg', '#FFFFFF');
  const cardRadius = getVal(`${moduleId}_el_testimonial_card`, 'card_radius', 24);
  const showShadow = getVal(`${moduleId}_el_testimonial_card`, 'show_shadow', true);
  const cardPadding = getVal(`${moduleId}_el_testimonial_card`, 'card_padding', 32);
  const hoverLift = getVal(`${moduleId}_el_testimonial_card`, 'hover_lift', true);

  // Element: Author Style
  const authorColor = getVal(`${moduleId}_el_testimonial_author`, 'author_color', '#0F172A');
  const roleColor = getVal(`${moduleId}_el_testimonial_author`, 'role_color', '#64748B');
  const showAvatar = getVal(`${moduleId}_el_testimonial_author`, 'show_avatar', true);
  const showStars = getVal(`${moduleId}_el_testimonial_author`, 'show_stars', true);

  useEffect(() => {
    if (autoplay && layout === 'carousel') {
      const interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % MOCK_TESTIMONIALS.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoplay, layout]);

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

        {/* Content */}
        {layout === 'carousel' ? (
          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden px-4 py-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  <TestimonialCard 
                    testimonial={MOCK_TESTIMONIALS[activeIndex]} 
                    entranceAnim={entranceAnim}
                    itemVariants={itemVariants}
                    hoverLift={hoverLift}
                    showShadow={showShadow}
                    cardBg={cardBg}
                    cardRadius={cardRadius}
                    cardPadding={cardPadding}
                    showAvatar={showAvatar}
                    authorColor={authorColor}
                    roleColor={roleColor}
                    showStars={showStars}
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
                  entranceAnim={entranceAnim}
                  itemVariants={itemVariants}
                  hoverLift={hoverLift}
                  showShadow={showShadow}
                  cardBg={cardBg}
                  cardRadius={cardRadius}
                  cardPadding={cardPadding}
                  showAvatar={showAvatar}
                  authorColor={authorColor}
                  roleColor={roleColor}
                  showStars={showStars}
                />
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};
