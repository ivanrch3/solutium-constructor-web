import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Users } from 'lucide-react';

export const CTAModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any> 
}> = ({ moduleId, settingsValues }) => {
  
  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  };

  // Global Settings
  const layout = getVal(null, 'layout', 'centered');
  const maxWidth = getVal(null, 'max_width', 1000);
  const paddingY = getVal(null, 'padding_y', 100);
  const bgType = getVal(null, 'bg_type', 'color');
  const bgColor = getVal(null, 'bg_color', '#FFFFFF');
  const bgGradient = getVal(null, 'bg_gradient', 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)');
  const overlayOpacity = getVal(null, 'overlay_opacity', 50) / 100;
  const entranceAnim = getVal(null, 'entrance_anim', true);

  // Element: Content
  const title = getVal(`${moduleId}_el_cta_content`, 'title', '¿Listo para transformar tu negocio?');
  const subtitle = getVal(`${moduleId}_el_cta_content`, 'subtitle', 'Únete a miles de profesionales que ya están escalando sus resultados con nuestra plataforma.');
  const titleSize = getVal(`${moduleId}_el_cta_content`, 'title_size', 42);
  const titleWeight = getVal(`${moduleId}_el_cta_content`, 'title_weight', 'black');
  const textColor = getVal(`${moduleId}_el_cta_content`, 'text_color', '#0F172A');
  const marginB = getVal(`${moduleId}_el_cta_content`, 'margin_b', 40);

  // Element: Actions
  const primaryText = getVal(`${moduleId}_el_cta_actions`, 'primary_text', 'Empezar Ahora');
  const secondaryText = getVal(`${moduleId}_el_cta_actions`, 'secondary_text', 'Saber Más');
  const showSecondary = getVal(`${moduleId}_el_cta_actions`, 'show_secondary', true);
  const btnPrimaryBg = getVal(`${moduleId}_el_cta_actions`, 'btn_primary_bg', 'var(--primary-color)');
  const btnPrimaryColor = getVal(`${moduleId}_el_cta_actions`, 'btn_primary_color', '#FFFFFF');
  const btnRadius = getVal(`${moduleId}_el_cta_actions`, 'btn_radius', 16);
  const hoverEffect = getVal(`${moduleId}_el_cta_actions`, 'hover_effect', 'scale');

  // Element: Trust
  const showTrust = getVal(`${moduleId}_el_cta_trust`, 'show_trust', true);
  const trustText = getVal(`${moduleId}_el_cta_trust`, 'trust_text', 'Únete a +5,000 usuarios activos');
  const trustSize = getVal(`${moduleId}_el_cta_trust`, 'trust_size', 14);
  const trustColor = getVal(`${moduleId}_el_cta_trust`, 'trust_color', '#64748B');
  const showAvatars = getVal(`${moduleId}_el_cta_trust`, 'show_avatars', true);

  const bgStyle: React.CSSProperties = {
    paddingTop: `${paddingY}px`,
    paddingBottom: `${paddingY}px`,
  };

  if (bgType === 'color') bgStyle.backgroundColor = bgColor;
  if (bgType === 'gradient') bgStyle.backgroundImage = bgGradient;
  if (bgType === 'image') {
    bgStyle.backgroundImage = `url('https://picsum.photos/seed/cta/1920/1080')`;
    bgStyle.backgroundSize = 'cover';
    bgStyle.backgroundPosition = 'center';
  }

  const animProps = entranceAnim ? {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  } : {};

  const renderContent = () => (
    <div 
      className={`flex flex-col ${layout === 'centered' ? 'items-center text-center' : 'items-start text-left'}`}
      style={{ marginBottom: `${marginB}px` }}
    >
      <h2 
        className="leading-tight mb-6"
        style={{ 
          fontSize: `${titleSize}px`, 
          fontWeight: titleWeight === 'black' ? 900 : 700,
          color: textColor 
        }}
      >
        {title}
      </h2>
      <p 
        className="text-lg opacity-80 max-w-2xl leading-relaxed"
        style={{ color: textColor }}
      >
        {subtitle}
      </p>
    </div>
  );

  const renderActions = () => (
    <div className={`flex flex-wrap gap-4 ${layout === 'centered' ? 'justify-center' : 'justify-start'}`}>
      <motion.button
        whileHover={hoverEffect === 'scale' ? { scale: 1.05 } : { boxShadow: `0 0 30px ${btnPrimaryBg}60` }}
        whileTap={{ scale: 0.95 }}
        className="px-8 py-4 font-black text-sm flex items-center gap-2 shadow-xl transition-all"
        style={{ 
          backgroundColor: btnPrimaryBg, 
          color: btnPrimaryColor,
          borderRadius: `${btnRadius}px` 
        }}
      >
        {primaryText}
        <ArrowRight size={18} />
      </motion.button>
      
      {showSecondary && (
        <motion.button
          whileHover={{ x: 5 }}
          className="px-8 py-4 font-bold text-sm transition-all flex items-center gap-2"
          style={{ 
            color: textColor,
            borderRadius: `${btnRadius}px` 
          }}
        >
          {secondaryText}
        </motion.button>
      )}
    </div>
  );

  const renderTrust = () => {
    if (!showTrust) return null;
    return (
      <div className={`mt-10 flex items-center gap-4 ${layout === 'centered' ? 'justify-center' : 'justify-start'}`}>
        {showAvatars && (
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map((i) => (
              <img 
                key={i}
                src={`https://i.pravatar.cc/100?u=${i + 10}`}
                alt="User"
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
                referrerPolicy="no-referrer"
              />
            ))}
            <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-400">
              +5k
            </div>
          </div>
        )}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Sparkles key={i} size={12} className="text-amber-400 fill-amber-400" />
              ))}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Verificado</span>
          </div>
          <span 
            className="font-medium"
            style={{ fontSize: `${trustSize}px`, color: trustColor }}
          >
            {trustText}
          </span>
        </div>
      </div>
    );
  };

  return (
    <section className="w-full relative overflow-hidden" style={bgStyle}>
      {bgType === 'image' && (
        <div 
          className="absolute inset-0 bg-black" 
          style={{ opacity: overlayOpacity }} 
        />
      )}
      
      <div className="relative z-10 mx-auto px-8" style={{ maxWidth: `${maxWidth}px` }}>
        <motion.div {...animProps}>
          {layout === 'split' ? (
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                {renderContent()}
                {renderActions()}
                {renderTrust()}
              </div>
              <div className="relative">
                <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                  <img 
                    src="https://picsum.photos/seed/cta-side/800/600" 
                    alt="CTA Visual" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
                <div className="absolute -top-6 -left-6 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full" />
              </div>
            </div>
          ) : (
            <>
              {renderContent()}
              {renderActions()}
              {renderTrust()}
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
};
