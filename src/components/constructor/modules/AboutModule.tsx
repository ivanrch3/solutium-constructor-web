import React from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import * as LucideIcons from 'lucide-react';

export const AboutModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any> 
}> = ({ moduleId, settingsValues }) => {
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
  const layout = getVal(null, 'layout', 'split_right');
  const paddingY = getVal(null, 'padding_y', 120);
  const contentWidth = getVal(null, 'content_width', 1200);
  const bgColor = getVal(null, 'bg_color', '#FFFFFF');
  const entranceAnim = getVal(null, 'entrance_anim', true);
  const showDecor = getVal(null, 'show_decor', true);

  // Element: Narrative
  const eyebrow = getVal(`${moduleId}_el_about_narrative`, 'eyebrow', 'NUESTRA HISTORIA');
  const title = getVal(`${moduleId}_el_about_narrative`, 'title', 'Innovación con propósito humano');
  const description = getVal(`${moduleId}_el_about_narrative`, 'description', 'Desde 2015, hemos transformado la manera en que las empresas interactúan con la tecnología, poniendo siempre a las personas en el centro de cada solución.');
  const quote = getVal(`${moduleId}_el_about_narrative`, 'quote', '');
  const signatureUrl = getVal(`${moduleId}_el_about_narrative`, 'signature_url', '');
  const buttonText = getVal(`${moduleId}_el_about_narrative`, 'button_text', 'Saber más');
  const buttonLink = getVal(`${moduleId}_el_about_narrative`, 'button_link', '#');
  
  const titleSize = getVal(`${moduleId}_el_about_narrative`, 'title_size', 48);
  const titleColor = getVal(`${moduleId}_el_about_narrative`, 'title_color', '#0F172A');
  const eyebrowColor = getVal(`${moduleId}_el_about_narrative`, 'eyebrow_color', 'var(--primary-color)');
  const descSize = getVal(`${moduleId}_el_about_narrative`, 'desc_size', 18);
  const textAlign = getVal(`${moduleId}_el_about_narrative`, 'align', 'left');

  // Element: Visual
  const imageUrl = getVal(`${moduleId}_el_about_visual`, 'image_url', 'https://picsum.photos/seed/about/800/600');
  const visualFit = getVal(`${moduleId}_el_about_visual`, 'visual_fit', 'cover');
  const radius = getVal(`${moduleId}_el_about_visual`, 'radius', 24);
  const maskType = getVal(`${moduleId}_el_about_visual`, 'mask_type', 'none');
  const showFrame = getVal(`${moduleId}_el_about_visual`, 'show_frame', false);
  const floating = getVal(`${moduleId}_el_about_visual`, 'floating', false);
  const parallax = getVal(`${moduleId}_el_about_visual`, 'parallax', false);

  // Element: Stats
  const showStats = getVal(`${moduleId}_el_about_stats`, 'show_stats', true);
  const statsList = getVal(`${moduleId}_el_about_stats`, 'stats_list', []);
  const statColor = getVal(`${moduleId}_el_about_stats`, 'stat_color', 'var(--primary-color)');
  const statBg = getVal(`${moduleId}_el_about_stats`, 'stat_bg', 'transparent');
  const statColumns = getVal(`${moduleId}_el_about_stats`, 'columns', 3);

  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -100]);

  const getMaskClass = (type: string) => {
    switch (type) {
      case 'circle': return 'rounded-full aspect-square';
      case 'organic': return 'rounded-[60%_40%_30%_70%/60%_30%_70%_40%]';
      case 'arch': return 'rounded-t-full';
      default: return '';
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

  const itemVariants: any = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const renderNarrative = () => (
    <motion.div 
      variants={entranceAnim ? containerVariants : {}}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className={`flex flex-col relative z-20 ${textAlign === 'center' ? 'items-center text-center' : textAlign === 'right' ? 'items-end text-right' : 'items-start text-left'}`}
    >
      {eyebrow && (
        <motion.span 
          variants={entranceAnim ? itemVariants : {}}
          className="font-bold tracking-[0.3em] text-[10px] @md:text-xs uppercase mb-6 block"
          style={{ color: eyebrowColor }}
        >
          {eyebrow}
        </motion.span>
      )}
      <motion.h2 
        variants={entranceAnim ? itemVariants : {}}
        className="font-black leading-[1.1] mb-8"
        style={{ fontSize: `${titleSize}px`, color: titleColor }}
      >
        {title}
      </motion.h2>
      <motion.p 
        variants={entranceAnim ? itemVariants : {}}
        className="text-slate-500 leading-relaxed mb-10 max-w-xl"
        style={{ fontSize: `${descSize}px` }}
      >
        {description}
      </motion.p>

      {quote && (
        <motion.div 
          variants={entranceAnim ? itemVariants : {}}
          className="border-l-4 border-primary/30 pl-6 py-2 mb-10 italic text-slate-600 text-lg @md:text-xl font-serif"
        >
          "{quote}"
        </motion.div>
      )}

      {(buttonText || signatureUrl) && (
        <motion.div 
          variants={entranceAnim ? itemVariants : {}}
          className="flex flex-wrap items-center gap-8 mb-12"
        >
          {buttonText && (
            <a 
              href={buttonLink}
              className="px-8 py-4 bg-primary text-white font-bold rounded-full hover:scale-105 transition-transform shadow-lg shadow-primary/20"
            >
              {buttonText}
            </a>
          )}
          {signatureUrl && (
            <img 
              src={signatureUrl} 
              alt="Firma" 
              className="h-12 w-auto opacity-80 grayscale hover:grayscale-0 transition-all"
              referrerPolicy="no-referrer"
            />
          )}
        </motion.div>
      )}

      {showStats && statsList.length > 0 && (
        <motion.div 
          variants={entranceAnim ? itemVariants : {}}
          className="grid gap-8 w-full p-8 rounded-3xl"
          style={{ 
            backgroundColor: statBg,
            gridTemplateColumns: `repeat(${statColumns}, minmax(0, 1fr))` 
          }}
        >
          {statsList.map((stat: any, i: number) => {
            const Icon = (LucideIcons as any)[stat.icon] || LucideIcons.Star;
            return (
              <div key={i} className="flex flex-col items-start group">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} className="text-primary/40 group-hover:text-primary transition-colors" />
                  <span className="text-3xl @md:text-4xl font-black tracking-tighter" style={{ color: statColor }}>
                    {stat.value}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                  {stat.label}
                </span>
              </div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );

  const renderVisual = () => (
    <motion.div 
      style={parallax ? { y: yParallax } : {}}
      className="relative"
    >
      {showFrame && (
        <div 
          className="absolute -inset-6 border-2 border-primary/10 rounded-[inherit] z-0 translate-x-6 translate-y-6"
          style={{ borderRadius: `${radius + 6}px` }}
        />
      )}
      
      {showDecor && (
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl z-0" />
      )}

      <motion.div
        animate={floating ? { y: [0, -20, 0] } : {}}
        transition={floating ? { duration: 6, repeat: Infinity, ease: "easeInOut" } : {}}
        className={`relative z-10 overflow-hidden shadow-2xl ${getMaskClass(maskType)}`}
        style={{ borderRadius: maskType === 'none' ? `${radius}px` : undefined }}
      >
        <img 
          src={imageUrl} 
          alt="About Us Visual" 
          className="w-full h-auto block min-h-[400px]"
          style={{ objectFit: visualFit as any }}
          referrerPolicy="no-referrer"
        />
      </motion.div>
      
      {showDecor && (
        <div className="absolute -bottom-8 -left-8 w-24 h-24 border-4 border-primary/10 rounded-full z-20" />
      )}
    </motion.div>
  );

  return (
    <section 
      ref={containerRef}
      className="w-full relative overflow-hidden"
      style={{ 
        backgroundColor: bgColor,
        paddingTop: `${paddingY}px`,
        paddingBottom: `${paddingY}px`
      }}
    >
      {showDecor && (
        <>
          <div className="absolute top-1/4 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -translate-x-1/2" />
          <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] translate-x-1/2" />
        </>
      )}

      <div 
        className="px-8 mx-auto relative z-10"
        style={{ maxWidth: `${contentWidth}px` }}
      >
        {layout === 'centered' ? (
          <div className="flex flex-col items-center gap-16 @md:gap-24">
            <div className="max-w-3xl w-full">
              {renderNarrative()}
            </div>
            <div className="w-full max-w-4xl">
              {renderVisual()}
            </div>
          </div>
        ) : layout === 'overlapping' ? (
          <div className="grid grid-cols-1 @lg:grid-cols-12 gap-12 items-center">
            <div className="@lg:col-span-7 relative z-10">
              {renderVisual()}
            </div>
            <div className="@lg:col-span-6 @lg:-ml-24 relative z-20 bg-white/80 backdrop-blur-md p-8 @md:p-12 rounded-[40px] shadow-2xl shadow-black/5">
              {renderNarrative()}
            </div>
          </div>
        ) : (
          <div className={`grid grid-cols-1 @lg:grid-cols-2 gap-16 @md:gap-24 items-center ${layout === 'split_left' ? '@lg:direction-rtl' : ''}`}>
            <div className={layout === 'split_left' ? '@lg:order-2' : '@lg:order-1'}>
              {renderNarrative()}
            </div>
            <div className={layout === 'split_left' ? '@lg:order-1' : '@lg:order-2'}>
              {renderVisual()}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
