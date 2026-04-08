import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export const HeroModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any>,
  logoUrl?: string | null,
  logoWhiteUrl?: string | null
}> = ({ moduleId, settingsValues, logoUrl, logoWhiteUrl }) => {
  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  };

  // Global Settings
  const layout = getVal(null, 'layout', 'split');
  const paddingY = getVal(null, 'padding_y', 100);
  const contentWidth = getVal(null, 'content_width', 1200);
  const bgColor = getVal(null, 'bg_color', '#FFFFFF');
  const overlayOpacity = getVal(null, 'overlay_opacity', 0);
  const bgImage = getVal(null, 'bg_image', '');
  const bgVideo = getVal(null, 'bg_video', '');
  const entranceAnim = getVal(null, 'entrance_anim', true);
  const parallax = getVal(null, 'parallax', false);

  // Element: Eyebrow
  const eyebrowText = getVal(`${moduleId}_el_hero_eyebrow`, 'text', 'NUEVA FUNCIÓN');
  const eyebrowSize = getVal(`${moduleId}_el_hero_eyebrow`, 'size', 14);
  const eyebrowWeight = getVal(`${moduleId}_el_hero_eyebrow`, 'weight', 'bold');
  const eyebrowColor = getVal(`${moduleId}_el_hero_eyebrow`, 'color', 'var(--primary-color)');
  const eyebrowUpper = getVal(`${moduleId}_el_hero_eyebrow`, 'uppercase', true);
  const eyebrowMarginB = getVal(`${moduleId}_el_hero_eyebrow`, 'margin_b', 12);

  // Element: Title
  const titleText = getVal(`${moduleId}_el_hero_title`, 'text', 'Construye tu futuro digital');
  const titleSize = getVal(`${moduleId}_el_hero_title`, 'size', 56);
  const titleWeight = getVal(`${moduleId}_el_hero_title`, 'weight', 'bold');
  const titleColor = getVal(`${moduleId}_el_hero_title`, 'color', '#0F172A');
  const useGradient = getVal(`${moduleId}_el_hero_title`, 'use_gradient', false);
  const gradientColor = getVal(`${moduleId}_el_hero_title`, 'gradient_color', 'var(--primary-color)');

  // Element: Subtitle
  const subtitleText = getVal(`${moduleId}_el_hero_subtitle`, 'text', 'La plataforma todo-en-uno para gestionar tu presencia online con elegancia y potencia.');
  const subtitleSize = getVal(`${moduleId}_el_hero_subtitle`, 'size', 18);
  const subtitleColor = getVal(`${moduleId}_el_hero_subtitle`, 'color', '#64748B');
  const subtitleMarginB = getVal(`${moduleId}_el_hero_subtitle`, 'margin_b', 32);

  // Element: CTA
  const ctaText = getVal(`${moduleId}_el_hero_cta`, 'text', 'Empezar ahora');
  const ctaBg = getVal(`${moduleId}_el_hero_cta`, 'bg_color', 'var(--primary-color)');
  const ctaTextColor = getVal(`${moduleId}_el_hero_cta`, 'text_color', '#FFFFFF');
  const ctaHoverScale = getVal(`${moduleId}_el_hero_cta`, 'hover_scale', true);

  // Element: Visual
  const visualUrl = getVal(`${moduleId}_el_hero_visual`, 'url', 'https://picsum.photos/seed/hero/800/600');
  const visualFit = getVal(`${moduleId}_el_hero_visual`, 'fit', 'contain');
  const visualMaxWidth = getVal(`${moduleId}_el_hero_visual`, 'max_width', 600);
  const visualRadius = getVal(`${moduleId}_el_hero_visual`, 'radius', 24);
  const floating = getVal(`${moduleId}_el_hero_visual`, 'floating', true);

  const getFontWeight = (w: string) => {
    if (w === 'medium') return 500;
    if (w === 'normal') return 400;
    return 700;
  };

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
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  const renderContent = () => (
    <motion.div 
      variants={entranceAnim ? containerVariants : {}}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={`flex flex-col ${layout === 'centered' ? 'items-center text-center' : 'items-start text-left'} z-20`}
    >
      {eyebrowText && (
        <motion.span 
          variants={entranceAnim ? itemVariants : {}}
          className={`inline-block ${eyebrowUpper ? 'uppercase tracking-widest' : ''}`}
          style={{ 
            fontSize: `${eyebrowSize}px`, 
            fontWeight: getFontWeight(eyebrowWeight),
            color: eyebrowColor,
            marginBottom: `${eyebrowMarginB}px`
          }}
        >
          {eyebrowText}
        </motion.span>
      )}
      
      <motion.h1 
        variants={entranceAnim ? itemVariants : {}}
        className="leading-[1.1] mb-6"
        style={{ 
          fontSize: `${titleSize}px`, 
          fontWeight: getFontWeight(titleWeight),
          color: useGradient ? 'transparent' : titleColor,
          backgroundImage: useGradient ? `linear-gradient(to right, ${titleColor}, ${gradientColor})` : 'none',
          WebkitBackgroundClip: useGradient ? 'text' : 'none',
          backgroundClip: useGradient ? 'text' : 'none',
        }}
      >
        {titleText}
      </motion.h1>

      {subtitleText && (
        <motion.p
          variants={entranceAnim ? itemVariants : {}}
          className="max-w-xl leading-relaxed"
          style={{ 
            fontSize: `${subtitleSize}px`, 
            color: subtitleColor,
            marginBottom: `${subtitleMarginB}px`
          }}
        >
          {subtitleText}
        </motion.p>
      )}

      <motion.div variants={entranceAnim ? itemVariants : {}} className="flex flex-wrap gap-4">
        <motion.button 
          whileHover={ctaHoverScale ? { scale: 1.05 } : {}}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 font-bold rounded-2xl shadow-xl shadow-primary/20 transition-all"
          style={{ 
            backgroundColor: ctaBg,
            color: ctaTextColor
          }}
        >
          {ctaText}
        </motion.button>
      </motion.div>
    </motion.div>
  );

  const renderVisual = () => (
    <motion.div 
      initial={entranceAnim ? { opacity: 0, scale: 0.9 } : {}}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      viewport={{ once: true }}
      className="relative z-20 flex justify-center items-center"
    >
      <motion.div
        animate={floating ? { y: [0, -20, 0] } : {}}
        transition={floating ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : {}}
        className="shadow-2xl overflow-hidden"
        style={{ 
          maxWidth: `${visualMaxWidth}px`,
          borderRadius: `${visualRadius}px`,
          backgroundColor: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <img 
          src={visualUrl} 
          alt="Hero Visual" 
          className="w-full h-auto block"
          style={{ objectFit: visualFit as any }}
          referrerPolicy="no-referrer"
        />
      </motion.div>
    </motion.div>
  );

  return (
    <section 
      className="relative w-full overflow-hidden flex items-center justify-center"
      style={{ 
        backgroundColor: bgColor,
        paddingTop: `${paddingY}px`,
        paddingBottom: `${paddingY}px`,
        minHeight: layout === 'full' ? '100vh' : 'auto'
      }}
    >
      {/* Background Media */}
      {bgImage && (
        <div 
          className={`absolute inset-0 z-0 ${parallax ? 'scale-110' : ''}`}
          style={{ 
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}
      
      {bgVideo && (
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src={bgVideo} type="video/mp4" />
        </video>
      )}

      {/* Overlay */}
      <div 
        className="absolute inset-0 z-10 bg-black" 
        style={{ opacity: overlayOpacity / 100 }}
      />

      <div 
        className="relative z-20 w-full px-8 mx-auto"
        style={{ maxWidth: `${contentWidth}px` }}
      >
        {layout === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {renderContent()}
            {renderVisual()}
          </div>
        )}

        {layout === 'centered' && (
          <div className="flex flex-col items-center gap-12">
            {renderContent()}
            {renderVisual()}
          </div>
        )}

        {layout === 'full' && (
          <div className="flex flex-col items-center justify-center text-center min-h-[60vh]">
            {renderContent()}
          </div>
        )}
      </div>
    </section>
  );
};
