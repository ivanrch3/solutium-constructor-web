import React from 'react';
import { motion } from 'motion/react';

export const AboutModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any> 
}> = ({ moduleId, settingsValues }) => {
  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  };

  // Global Settings
  const layout = getVal(null, 'layout', 'split_right');
  const paddingY = getVal(null, 'padding_y', 100);
  const contentWidth = getVal(null, 'content_width', 1200);
  const bgColor = getVal(null, 'bg_color', '#FFFFFF');
  const entranceAnim = getVal(null, 'entrance_anim', true);

  // Element: Narrative
  const eyebrow = getVal(`${moduleId}_el_about_narrative`, 'eyebrow', 'NUESTRA HISTORIA');
  const title = getVal(`${moduleId}_el_about_narrative`, 'title', 'Innovación con propósito humano');
  const description = getVal(`${moduleId}_el_about_narrative`, 'description', 'Desde 2015, hemos transformado la manera en que las empresas interactúan con la tecnología, poniendo siempre a las personas en el centro de cada solución.');
  const titleSize = getVal(`${moduleId}_el_about_narrative`, 'title_size', 48);
  const titleColor = getVal(`${moduleId}_el_about_narrative`, 'title_color', '#0F172A');
  const descSize = getVal(`${moduleId}_el_about_narrative`, 'desc_size', 18);
  const textAlign = getVal(`${moduleId}_el_about_narrative`, 'align', 'left');

  // Element: Visual
  const imageUrl = getVal(`${moduleId}_el_about_visual`, 'image_url', 'https://picsum.photos/seed/about/800/600');
  const visualFit = getVal(`${moduleId}_el_about_visual`, 'visual_fit', 'cover');
  const radius = getVal(`${moduleId}_el_about_visual`, 'radius', 24);
  const showFrame = getVal(`${moduleId}_el_about_visual`, 'show_frame', false);
  const floating = getVal(`${moduleId}_el_about_visual`, 'floating', false);

  // Element: Stats
  const showStats = getVal(`${moduleId}_el_about_stats`, 'show_stats', true);
  const statColor = getVal(`${moduleId}_el_about_stats`, 'stat_color', 'var(--primary-color)');
  const statColumns = getVal(`${moduleId}_el_about_stats`, 'columns', 3);

  const MOCK_STATS = [
    { value: '10+', label: 'Años de Experiencia' },
    { value: '500+', label: 'Proyectos Exitosos' },
    { value: '24/7', label: 'Soporte Dedicado' }
  ];

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
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const renderNarrative = () => (
    <motion.div 
      variants={entranceAnim ? containerVariants : {}}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.3 }}
      className={`flex flex-col ${textAlign === 'center' ? 'items-center text-center' : textAlign === 'right' ? 'items-end text-right' : 'items-start text-left'}`}
    >
      {eyebrow && (
        <motion.span 
          variants={entranceAnim ? itemVariants : {}}
          className="text-primary font-bold tracking-widest text-xs uppercase mb-4"
        >
          {eyebrow}
        </motion.span>
      )}
      <motion.h2 
        variants={entranceAnim ? itemVariants : {}}
        className="font-black leading-tight mb-6"
        style={{ fontSize: `${titleSize}px`, color: titleColor }}
      >
        {title}
      </motion.h2>
      <motion.p 
        variants={entranceAnim ? itemVariants : {}}
        className="text-slate-500 leading-relaxed mb-8"
        style={{ fontSize: `${descSize}px` }}
      >
        {description}
      </motion.p>

      {showStats && (
        <motion.div 
          variants={entranceAnim ? itemVariants : {}}
          className="grid gap-8 w-full mt-4"
          style={{ gridTemplateColumns: `repeat(${statColumns}, minmax(0, 1fr))` }}
        >
          {MOCK_STATS.slice(0, statColumns).map((stat, i) => (
            <div key={i} className="flex flex-col">
              <span className="text-3xl font-black mb-1" style={{ color: statColor }}>{stat.value}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );

  const renderVisual = () => (
    <motion.div 
      initial={entranceAnim ? { opacity: 0, x: layout === 'split_left' ? -30 : 30 } : {}}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: false, amount: 0.3 }}
      className="relative"
    >
      {showFrame && (
        <div 
          className="absolute -inset-4 border-2 border-primary/20 rounded-[inherit] z-0 translate-x-4 translate-y-4"
          style={{ borderRadius: `${radius + 4}px` }}
        />
      )}
      <motion.div
        animate={floating ? { y: [0, -15, 0] } : {}}
        transition={floating ? { duration: 5, repeat: Infinity, ease: "easeInOut" } : {}}
        className="relative z-10 overflow-hidden shadow-2xl"
        style={{ borderRadius: `${radius}px` }}
      >
        <img 
          src={imageUrl} 
          alt="About Us Visual" 
          className="w-full h-auto block"
          style={{ objectFit: visualFit as any, minHeight: '400px' }}
          referrerPolicy="no-referrer"
        />
      </motion.div>
    </motion.div>
  );

  return (
    <section 
      className="w-full relative overflow-hidden py-12 @md:py-20 @lg:py-24"
      style={{ 
        backgroundColor: bgColor
      }}
    >
      <div 
        className="px-8 mx-auto"
        style={{ maxWidth: `${contentWidth}px` }}
      >
        {layout === 'centered' ? (
          <div className="flex flex-col items-center gap-12 @md:gap-16">
            <div className="max-w-3xl">
              <motion.div 
                variants={entranceAnim ? containerVariants : {}}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.3 }}
                className={`flex flex-col ${textAlign === 'center' ? 'items-center text-center' : textAlign === 'right' ? 'items-end text-right' : 'items-start text-left'}`}
              >
                {eyebrow && (
                  <motion.span 
                    variants={entranceAnim ? itemVariants : {}}
                    className="text-primary font-bold tracking-widest text-xs uppercase mb-4"
                  >
                    {eyebrow}
                  </motion.span>
                )}
                <motion.h2 
                  variants={entranceAnim ? itemVariants : {}}
                  className="font-black leading-tight mb-6 text-3xl @md:text-4xl @lg:text-5xl"
                  style={{ color: titleColor }}
                >
                  {title}
                </motion.h2>
                <motion.p 
                  variants={entranceAnim ? itemVariants : {}}
                  className="text-slate-500 leading-relaxed mb-8 text-base @md:text-lg"
                >
                  {description}
                </motion.p>

                {showStats && (
                  <motion.div 
                    variants={entranceAnim ? itemVariants : {}}
                    className={`grid gap-6 @md:gap-8 w-full mt-4 ${
                      statColumns === 3 ? 'grid-cols-1 @sm:grid-cols-3' :
                      statColumns === 2 ? 'grid-cols-1 @sm:grid-cols-2' : 'grid-cols-1'
                    }`}
                  >
                    {MOCK_STATS.slice(0, statColumns).map((stat, i) => (
                      <div key={i} className="flex flex-col">
                        <span className="text-3xl font-black mb-1" style={{ color: statColor }}>{stat.value}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            </div>
            <div className="w-full max-w-4xl">
              {renderVisual()}
            </div>
          </div>
        ) : (
          <div className={`grid grid-cols-1 @lg:grid-cols-2 gap-12 @md:gap-16 items-center ${layout === 'split_left' ? '@lg:direction-rtl' : ''}`}>
            <div className={layout === 'split_left' ? '@lg:order-2' : '@lg:order-1'}>
              <motion.div 
                variants={entranceAnim ? containerVariants : {}}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.3 }}
                className={`flex flex-col ${textAlign === 'center' ? 'items-center text-center' : textAlign === 'right' ? 'items-end text-right' : 'items-start text-left'}`}
              >
                {eyebrow && (
                  <motion.span 
                    variants={entranceAnim ? itemVariants : {}}
                    className="text-primary font-bold tracking-widest text-xs uppercase mb-4"
                  >
                    {eyebrow}
                  </motion.span>
                )}
                <motion.h2 
                  variants={entranceAnim ? itemVariants : {}}
                  className="font-black leading-tight mb-6 text-3xl @md:text-4xl @lg:text-5xl"
                  style={{ color: titleColor }}
                >
                  {title}
                </motion.h2>
                <motion.p 
                  variants={entranceAnim ? itemVariants : {}}
                  className="text-slate-500 leading-relaxed mb-8 text-base @md:text-lg"
                >
                  {description}
                </motion.p>

                {showStats && (
                  <motion.div 
                    variants={entranceAnim ? itemVariants : {}}
                    className={`grid gap-6 @md:gap-8 w-full mt-4 ${
                      statColumns === 3 ? 'grid-cols-1 @sm:grid-cols-3' :
                      statColumns === 2 ? 'grid-cols-1 @sm:grid-cols-2' : 'grid-cols-1'
                    }`}
                  >
                    {MOCK_STATS.slice(0, statColumns).map((stat, i) => (
                      <div key={i} className="flex flex-col">
                        <span className="text-3xl font-black mb-1" style={{ color: statColor }}>{stat.value}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
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
