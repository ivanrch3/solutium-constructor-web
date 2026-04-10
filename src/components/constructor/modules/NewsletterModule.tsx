import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Check, Send, Bell, User, ShieldCheck, X } from 'lucide-react';

export const NewsletterModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any> 
}> = ({ moduleId, settingsValues }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [gdprAccepted, setGdprAccepted] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showFloating, setShowFloating] = useState(true);

  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  };

  // Global Settings
  const layout = getVal(null, 'layout', 'centered');
  const maxWidth = getVal(null, 'max_width', 800);
  const paddingY = getVal(null, 'padding_y', 80);
  const bgType = getVal(null, 'bg_type', 'color');
  const bgColor = getVal(null, 'bg_color', '#FFFFFF');
  const bgGradient = getVal(null, 'bg_gradient', 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)');
  const bgPattern = getVal(null, 'bg_pattern', 'none');
  const backdropBlur = getVal(null, 'backdrop_blur', 0);
  const borderRadius = getVal(null, 'border_radius', 32);
  const showShadow = getVal(null, 'show_shadow', true);
  const entranceAnim = getVal(null, 'entrance_anim', true);

  // Element: Header
  const title = getVal(`${moduleId}_el_news_header`, 'title', 'Suscríbete a nuestra Newsletter');
  const subtitle = getVal(`${moduleId}_el_news_header`, 'subtitle', 'Recibe las últimas noticias, consejos y ofertas exclusivas directamente en tu bandeja de entrada.');
  const align = getVal(`${moduleId}_el_news_header`, 'align', 'center');
  const titleSize = getVal(`${moduleId}_el_news_header`, 'title_size', 28);
  const textColor = getVal(`${moduleId}_el_news_header`, 'text_color', '#0F172A');
  const marginB = getVal(`${moduleId}_el_news_header`, 'margin_b', 32);

  // Element: Form
  const showName = getVal(`${moduleId}_el_news_form`, 'show_name', false);
  const placeholder = getVal(`${moduleId}_el_news_form`, 'placeholder', 'tu@email.com');
  const buttonText = getVal(`${moduleId}_el_news_form`, 'button_text', 'Suscribirse');
  const showGdpr = getVal(`${moduleId}_el_news_form`, 'show_gdpr', true);
  const gdprText = getVal(`${moduleId}_el_news_form`, 'gdpr_text', 'Acepto recibir comunicaciones comerciales y la política de privacidad.');
  const inputBg = getVal(`${moduleId}_el_news_form`, 'input_bg', '#F8FAFC');
  const btnBg = getVal(`${moduleId}_el_news_form`, 'btn_bg', 'var(--primary-color)');
  const btnColor = getVal(`${moduleId}_el_news_form`, 'btn_color', '#FFFFFF');
  const inputRadius = getVal(`${moduleId}_el_news_form`, 'input_radius', 16);
  const hoverEffect = getVal(`${moduleId}_el_news_form`, 'hover_effect', 'scale');
  const showConfetti = getVal(`${moduleId}_el_news_form`, 'show_confetti', true);

  // Element: Magnet
  const magnetImage = getVal(`${moduleId}_el_news_magnet`, 'image', 'https://picsum.photos/seed/ebook/600/800');
  const magnetBadge = getVal(`${moduleId}_el_news_magnet`, 'badge_text', 'GRATIS');

  // Element: Trust
  const privacyText = getVal(`${moduleId}_el_news_trust`, 'privacy_text', 'Respetamos tu privacidad. Sin spam, solo valor.');
  const subscriberCount = getVal(`${moduleId}_el_news_trust`, 'subscriber_count', 'Únete a +2,000 suscriptores');
  const trustTextSize = getVal(`${moduleId}_el_news_trust`, 'text_size', 12);
  const trustTextColor = getVal(`${moduleId}_el_news_trust`, 'text_color', '#64748B');
  const showIcon = getVal(`${moduleId}_el_news_trust`, 'show_icon', true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showGdpr && !gdprAccepted) return;
    
    if (email) {
      setIsSubscribed(true);
      setTimeout(() => {
        setIsSubscribed(false);
        setEmail('');
        setName('');
        setGdprAccepted(false);
      }, 6000);
    }
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: layout === 'floating_bar' ? '100%' : `${maxWidth}px`,
    borderRadius: layout === 'floating_bar' ? '0px' : `${borderRadius}px`,
    boxShadow: showShadow ? '0 20px 50px -12px rgba(0,0,0,0.08)' : 'none',
    backdropFilter: backdropBlur > 0 ? `blur(${backdropBlur}px)` : 'none',
    WebkitBackdropFilter: backdropBlur > 0 ? `blur(${backdropBlur}px)` : 'none',
  };

  if (bgType === 'color') containerStyle.backgroundColor = bgColor;
  if (bgType === 'gradient') containerStyle.backgroundImage = bgGradient;
  if (bgType === 'transparent') containerStyle.backgroundColor = 'transparent';

  const animProps = entranceAnim ? {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as any }
  } : {};

  const renderPattern = () => {
    if (bgPattern === 'dots') {
      return (
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
          style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
        />
      );
    }
    if (bgPattern === 'grid') {
      return (
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
          style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
        />
      );
    }
    return null;
  };

  const renderConfetti = () => {
    if (!isSubscribed || !showConfetti) return null;
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ top: -20, left: `${Math.random() * 100}%`, rotate: 0 }}
            animate={{ 
              top: '120%', 
              left: `${Math.random() * 100}%`, 
              rotate: 360,
              transition: { duration: 2 + Math.random() * 2, repeat: Infinity, ease: "linear" }
            }}
            className="absolute w-2 h-2 rounded-sm"
            style={{ backgroundColor: ['#FFD700', '#FF69B4', '#00CED1', '#ADFF2F', '#FFA500'][i % 5] }}
          />
        ))}
      </div>
    );
  };

  if (layout === 'floating_bar') {
    if (!showFloating) return null;
    return (
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] px-6 py-4 flex items-center justify-between gap-8"
        style={{ backdropFilter: backdropBlur > 0 ? `blur(${backdropBlur}px)` : 'none' }}
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
            <Bell size={20} />
          </div>
          <div className="hidden @md:block">
            <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
            <p className="text-xs text-slate-500 line-clamp-1">{subtitle}</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="flex items-center gap-3 flex-1 max-w-lg">
          <input 
            required
            type="email"
            placeholder={placeholder}
            className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button 
            type="submit"
            className="px-6 py-2.5 bg-primary text-white font-bold text-sm rounded-xl hover:opacity-90 transition-all whitespace-nowrap"
            style={{ backgroundColor: btnBg, color: btnColor }}
          >
            {isSubscribed ? '¡Listo!' : buttonText}
          </button>
        </form>

        <button onClick={() => setShowFloating(false)} className="p-2 text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
      </motion.div>
    );
  }

  return (
    <section className={`w-full px-8 ${layout === 'minimal' ? 'py-8' : 'py-12'}`}>
      <motion.div 
        {...animProps}
        className={`mx-auto px-8 @md:px-12 relative overflow-hidden transition-all duration-500 ${layout === 'minimal' ? 'py-8' : 'py-12 @md:py-16 @lg:py-20'}`}
        style={containerStyle}
      >
        {renderPattern()}
        {renderConfetti()}

        <div className={`flex flex-col ${layout === 'horizontal' || layout === 'lead_magnet' ? '@lg:flex-row @lg:items-center @lg:gap-16' : 'items-center text-center'}`}>
          
          {/* Lead Magnet Image */}
          {layout === 'lead_magnet' && (
            <div className="w-full @lg:w-1/3 mb-12 @lg:mb-0 relative group">
              <div className="absolute -top-4 -left-4 z-10 bg-primary text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-xl rotate-[-12deg] group-hover:rotate-0 transition-transform">
                {magnetBadge}
              </div>
              <img 
                src={magnetImage} 
                className="w-full aspect-[3/4] object-cover rounded-2xl shadow-2xl transform group-hover:scale-[1.02] transition-transform duration-500" 
                alt="Lead Magnet"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Header Content */}
          <div className={`${(layout === 'horizontal' || layout === 'lead_magnet') ? '@lg:flex-1 @lg:text-left' : 'w-full'}`} style={{ marginBottom: (layout === 'horizontal' || layout === 'lead_magnet') ? 0 : `${marginB}px` }}>
            <div className={`flex items-center gap-3 mb-4 ${layout === 'horizontal' || layout === 'lead_magnet' ? 'justify-start' : 'justify-center'}`}>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Bell size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Newsletter</span>
            </div>
            <h2 
              className="font-black leading-tight mb-4 text-2xl @md:text-3xl @lg:text-5xl tracking-tighter"
              style={{ color: textColor, textAlign: (layout === 'horizontal' || layout === 'lead_magnet') ? 'left' : (align as any), fontSize: `${titleSize}px` }}
            >
              {title}
            </h2>
            <p 
              className="text-lg opacity-70 max-w-xl leading-relaxed"
              style={{ color: textColor, textAlign: (layout === 'horizontal' || layout === 'lead_magnet') ? 'left' : (align as any) }}
            >
              {subtitle}
            </p>
          </div>

          {/* Form Area */}
          <div className={`${(layout === 'horizontal' || layout === 'lead_magnet') ? '@lg:w-[450px]' : 'w-full max-w-lg mt-4'}`}>
            <AnimatePresence mode="wait">
              {isSubscribed ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 p-8 rounded-3xl text-center shadow-2xl"
                >
                  <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-green-200">
                    <Check size={32} />
                  </div>
                  <h4 className="font-black text-xl mb-2" style={{ color: textColor }}>¡Te has suscrito!</h4>
                  <p className="opacity-70 text-sm" style={{ color: textColor }}>Revisa tu bandeja de entrada para confirmar tu suscripción.</p>
                </motion.div>
              ) : (
                <motion.form 
                  key="form"
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-4"
                >
                  <div className={`flex flex-col gap-3 ${layout === 'minimal' ? '' : 'p-2 bg-white/50 backdrop-blur-md border border-white/20 shadow-2xl'}`} style={{ borderRadius: `${inputRadius}px` }}>
                    {showName && (
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <User size={18} />
                        </div>
                        <input 
                          required
                          type="text"
                          placeholder="Tu nombre"
                          className="w-full pl-12 pr-4 py-4 text-sm font-medium focus:outline-none bg-transparent"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                    )}
                    <div className="relative flex-1 flex flex-col @sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <Mail size={18} />
                        </div>
                        <input 
                          required
                          type="email"
                          placeholder={placeholder}
                          className="w-full pl-12 pr-4 py-4 text-sm font-medium focus:outline-none bg-transparent"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <motion.button
                        whileHover={hoverEffect === 'scale' ? { scale: 1.02 } : { boxShadow: `0 0 25px ${btnBg}60` }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="px-8 py-4 font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all"
                        style={{ backgroundColor: btnBg, color: btnColor, borderRadius: `${inputRadius - 8}px` }}
                      >
                        {buttonText}
                        <Send size={16} />
                      </motion.button>
                    </div>
                  </div>

                  {showGdpr && (
                    <label className="flex items-start gap-3 cursor-pointer group px-2">
                      <div className="relative flex items-center mt-1">
                        <input 
                          type="checkbox" 
                          required
                          className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 bg-white checked:bg-primary checked:border-primary transition-all"
                          checked={gdprAccepted}
                          onChange={(e) => setGdprAccepted(e.target.checked)}
                        />
                        <Check size={12} className="absolute left-0.5 top-0.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                      </div>
                      <span className="text-[11px] leading-tight text-slate-500 group-hover:text-slate-700 transition-colors">
                        {gdprText}
                      </span>
                    </label>
                  )}
                </motion.form>
              )}
            </AnimatePresence>

            {/* Trust Info */}
            <div className={`mt-8 flex flex-col gap-3 ${layout === 'horizontal' || layout === 'lead_magnet' ? 'items-start' : 'items-center'}`}>
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} style={{ color: trustTextColor }} />
                <span style={{ fontSize: `${trustTextSize}px`, color: trustTextColor }}>{privacyText}</span>
              </div>
              {subscriberCount && (
                <div className="flex items-center gap-3 px-4 py-2 bg-white/40 backdrop-blur-sm rounded-full border border-white/20">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map(i => (
                      <img key={i} src={`https://i.pravatar.cc/100?u=${i + 100}`} className="w-6 h-6 rounded-full border-2 border-white shadow-sm" alt="user" referrerPolicy="no-referrer" />
                    ))}
                  </div>
                  <span className="font-black tracking-tight" style={{ fontSize: '11px', color: trustTextColor }}>{subscriberCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
