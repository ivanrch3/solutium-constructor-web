import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { 
  ArrowRight, 
  Sparkles, 
  Users, 
  Mail, 
  Zap, 
  Clock, 
  Star, 
  CheckCircle2,
  X
} from 'lucide-react';

export const CTAModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any> 
}> = ({ moduleId, settingsValues }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
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
  const bgVideo = getVal(null, 'bg_video', '');
  const overlayOpacity = getVal(null, 'overlay_opacity', 50) / 100;
  const entranceAnim = getVal(null, 'entrance_anim', true);
  const enableShimmer = getVal(null, 'enable_shimmer', true);
  const magneticButton = getVal(null, 'magnetic_button', false);
  const showFloatingAssets = getVal(null, 'show_floating_assets', false);
  const floatingIcon1 = getVal(null, 'floating_icon_1', 'Sparkles');
  const floatingIcon2 = getVal(null, 'floating_icon_2', 'Zap');
  const enableCountdown = getVal(null, 'enable_countdown', false);
  const countdownDate = getVal(null, 'countdown_date', '2026-12-31');

  // Element: Content
  const title = getVal(`${moduleId}_el_cta_content`, 'title', '¿Listo para transformar tu negocio?');
  const subtitle = getVal(`${moduleId}_el_cta_content`, 'subtitle', 'Únete a miles de profesionales que ya están escalando sus resultados con nuestra plataforma.');
  const titleSize = getVal(`${moduleId}_el_cta_content`, 'title_size', 42);
  const titleWeight = getVal(`${moduleId}_el_cta_content`, 'title_weight', 'black');
  const textColor = getVal(`${moduleId}_el_cta_content`, 'text_color', '#0F172A');
  const marginB = getVal(`${moduleId}_el_cta_content`, 'margin_b', 40);

  // Element: Actions
  const mode = getVal(`${moduleId}_el_cta_actions`, 'mode', 'buttons');
  const primaryText = getVal(`${moduleId}_el_cta_actions`, 'primary_text', 'Empezar Ahora');
  const placeholder = getVal(`${moduleId}_el_cta_actions`, 'placeholder', 'tu@email.com');
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
  const showLogos = getVal(`${moduleId}_el_cta_trust`, 'show_logos', false);
  const companyLogos = getVal(`${moduleId}_el_cta_trust`, 'company_logos', []);

  useEffect(() => {
    if (!enableCountdown) return;

    const timer = setInterval(() => {
      const target = new Date(countdownDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [enableCountdown, countdownDate]);

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
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as any }
  } : {};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 3000);
    }
  };

  const IconComponent1 = (LucideIcons as any)[floatingIcon1] || Sparkles;
  const IconComponent2 = (LucideIcons as any)[floatingIcon2] || Zap;

  const renderCountdown = () => {
    if (!enableCountdown) return null;
    return (
      <div className="flex gap-4 mb-8">
        {[
          { label: 'Días', value: timeLeft.days },
          { label: 'Hrs', value: timeLeft.hours },
          { label: 'Min', value: timeLeft.minutes },
          { label: 'Seg', value: timeLeft.seconds },
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-lg mb-1"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: textColor, backdropFilter: 'blur(10px)' }}
            >
              {String(item.value).padStart(2, '0')}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60" style={{ color: textColor }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderActions = () => {
    if (mode === 'lead_capture') {
      return (
        <form onSubmit={handleSubmit} className="relative w-full max-w-md">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div 
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex p-1.5 bg-white rounded-2xl shadow-2xl items-center"
              >
                <div className="pl-4 text-slate-400">
                  <Mail size={20} />
                </div>
                <input 
                  type="email" 
                  placeholder={placeholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 font-medium px-4"
                  required
                />
                <button 
                  type="submit"
                  className="px-6 py-3 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-lg"
                  style={{ backgroundColor: btnPrimaryBg, color: btnPrimaryColor }}
                >
                  {primaryText}
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center justify-center gap-3 p-4 bg-green-500 text-white rounded-2xl shadow-xl font-bold"
              >
                <CheckCircle2 size={24} />
                ¡Gracias por suscribirte!
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      );
    }

    return (
      <div className={`flex flex-wrap gap-4 ${layout === 'centered' || layout === 'bento' ? 'justify-center' : 'justify-start'}`}>
        <motion.button
          whileHover={magneticButton ? { x: 5, y: -5, scale: 1.05 } : hoverEffect === 'scale' ? { scale: 1.05 } : { boxShadow: `0 0 30px ${btnPrimaryBg}60` }}
          whileTap={{ scale: 0.95 }}
          className="relative px-8 py-4 font-black text-sm flex items-center gap-2 shadow-xl transition-all overflow-hidden group"
          style={{ 
            backgroundColor: btnPrimaryBg, 
            color: btnPrimaryColor,
            borderRadius: `${btnRadius}px` 
          }}
        >
          {enableShimmer && (
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
          )}
          <span className="relative z-10">{primaryText}</span>
          <ArrowRight size={18} className="relative z-10" />
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
  };

  const renderTrust = () => {
    if (!showTrust) return null;
    return (
      <div className={`mt-10 flex flex-col gap-6 ${layout === 'centered' || layout === 'bento' ? 'items-center' : 'items-start'}`}>
        <div className="flex items-center gap-4">
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
                  <Star key={i} size={12} className="text-amber-400 fill-amber-400" />
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

        {showLogos && companyLogos.length > 0 && (
          <div className="flex flex-wrap gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            {companyLogos.map((logo: string, i: number) => (
              <img key={i} src={logo} alt="Partner" className="h-6 object-contain" referrerPolicy="no-referrer" />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderFloatingAssets = () => {
    if (!showFloatingAssets) return null;
    return (
      <>
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 left-10 text-primary/20"
        >
          <IconComponent1 size={60} />
        </motion.div>
        <motion.div 
          animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-10 right-10 text-purple-500/20"
        >
          <IconComponent2 size={80} />
        </motion.div>
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 right-20 w-40 h-40 bg-primary/10 blur-3xl rounded-full"
        />
      </>
    );
  };

  return (
    <section className="w-full relative overflow-hidden py-12 @md:py-20 @lg:py-24" style={bgStyle}>
      {bgType === 'video' && bgVideo && (
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={bgVideo} type="video/mp4" />
        </video>
      )}
      
      {(bgType === 'image' || bgType === 'video') && (
        <div 
          className="absolute inset-0 bg-black" 
          style={{ opacity: overlayOpacity }} 
        />
      )}
      
      {renderFloatingAssets()}
      
      <div className="relative z-10 mx-auto px-8" style={{ maxWidth: `${maxWidth}px` }}>
        <motion.div {...animProps}>
          {layout === 'bento' ? (
            <div 
              className="p-12 @md:p-20 rounded-[48px] shadow-2xl border border-white/10 relative overflow-hidden"
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.03)', 
                backdropFilter: 'blur(20px)',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
              }}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-32 -mt-32" />
              <div className="relative z-10 flex flex-col items-center text-center">
                {renderCountdown()}
                <h2 
                  className="leading-tight mb-6 text-4xl @md:text-5xl @lg:text-6xl max-w-3xl"
                  style={{ 
                    fontWeight: titleWeight === 'black' ? 900 : 700,
                    color: textColor 
                  }}
                >
                  {title}
                </h2>
                <p 
                  className="text-xl opacity-80 max-w-2xl leading-relaxed mb-10"
                  style={{ color: textColor }}
                >
                  {subtitle}
                </p>
                {renderActions()}
                {renderTrust()}
              </div>
            </div>
          ) : layout === 'split' ? (
            <div className="grid grid-cols-1 @md:grid-cols-2 gap-12 items-center">
              <div>
                <div 
                  className="flex flex-col items-start text-left"
                  style={{ marginBottom: `${marginB}px` }}
                >
                  {renderCountdown()}
                  <h2 
                    className="leading-tight mb-6 text-3xl @md:text-4xl @lg:text-5xl"
                    style={{ 
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
                {renderActions()}
                {renderTrust()}
              </div>
              <div className="relative">
                <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl @md:rotate-2 hover:rotate-0 transition-transform duration-500">
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
            <div className={`flex flex-col ${layout === 'centered' ? 'items-center text-center' : 'items-start text-left'}`}>
              {renderCountdown()}
              <div 
                className={`flex flex-col ${layout === 'centered' ? 'items-center text-center' : 'items-start text-left'}`}
                style={{ marginBottom: `${marginB}px` }}
              >
                <h2 
                  className="leading-tight mb-6 text-3xl @md:text-4xl @lg:text-5xl"
                  style={{ 
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
              {renderActions()}
              {renderTrust()}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};
