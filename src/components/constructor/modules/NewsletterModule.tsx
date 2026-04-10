import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Check, Send, Bell } from 'lucide-react';

export const NewsletterModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any> 
}> = ({ moduleId, settingsValues }) => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

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
  const placeholder = getVal(`${moduleId}_el_news_form`, 'placeholder', 'tu@email.com');
  const buttonText = getVal(`${moduleId}_el_news_form`, 'button_text', 'Suscribirse');
  const inputBg = getVal(`${moduleId}_el_news_form`, 'input_bg', '#F8FAFC');
  const btnBg = getVal(`${moduleId}_el_news_form`, 'btn_bg', 'var(--primary-color)');
  const btnColor = getVal(`${moduleId}_el_news_form`, 'btn_color', '#FFFFFF');
  const inputRadius = getVal(`${moduleId}_el_news_form`, 'input_radius', 16);
  const hoverEffect = getVal(`${moduleId}_el_news_form`, 'hover_effect', 'scale');

  // Element: Trust
  const privacyText = getVal(`${moduleId}_el_news_trust`, 'privacy_text', 'Respetamos tu privacidad. Sin spam, solo valor.');
  const subscriberCount = getVal(`${moduleId}_el_news_trust`, 'subscriber_count', 'Únete a +2,000 suscriptores');
  const trustTextSize = getVal(`${moduleId}_el_news_trust`, 'text_size', 12);
  const trustTextColor = getVal(`${moduleId}_el_news_trust`, 'text_color', '#64748B');
  const showIcon = getVal(`${moduleId}_el_news_trust`, 'show_icon', true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setTimeout(() => {
        setIsSubscribed(false);
        setEmail('');
      }, 5000);
    }
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: `${maxWidth}px`,
    borderRadius: `${borderRadius}px`,
    boxShadow: showShadow ? '0 20px 50px -12px rgba(0,0,0,0.08)' : 'none',
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

  return (
    <section className="w-full px-8 py-12">
      <motion.div 
        {...animProps}
        className={`mx-auto px-8 @md:px-12 relative overflow-hidden transition-all duration-500 py-12 @md:py-16 @lg:py-20`}
        style={containerStyle}
      >
        <div className={`flex flex-col ${layout === 'horizontal' ? '@lg:flex-row @lg:items-center @lg:gap-12' : 'items-center text-center'}`}>
          
          {/* Header Content */}
          <div className={`${layout === 'horizontal' ? '@lg:flex-1 @lg:text-left' : 'w-full'}`} style={{ marginBottom: layout === 'horizontal' ? 0 : `${marginB}px` }}>
            <div className={`flex items-center gap-3 mb-4 ${layout === 'horizontal' ? 'justify-start' : 'justify-center'}`}>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Bell size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Newsletter</span>
            </div>
            <h2 
              className="font-black leading-tight mb-4 text-2xl @md:text-3xl @lg:text-4xl"
              style={{ color: textColor, textAlign: layout === 'horizontal' ? 'left' : (align as any) }}
            >
              {title}
            </h2>
            <p 
              className="text-base opacity-70 max-w-xl leading-relaxed"
              style={{ color: textColor, textAlign: layout === 'horizontal' ? 'left' : (align as any) }}
            >
              {subtitle}
            </p>
          </div>

          {/* Form Area */}
          <div className={`${layout === 'horizontal' ? '@lg:w-[400px]' : 'w-full max-w-md mt-4'}`}>
            <AnimatePresence mode="wait">
              {isSubscribed ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="bg-green-50 border border-green-100 p-6 rounded-2xl text-center"
                >
                  <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-green-200">
                    <Check size={24} />
                  </div>
                  <h4 className="font-bold text-green-900 mb-1">¡Te has suscrito!</h4>
                  <p className="text-green-700 text-xs">Revisa tu bandeja de entrada pronto.</p>
                </motion.div>
              ) : (
                <motion.form 
                  key="form"
                  onSubmit={handleSubmit}
                  className={`flex flex-col gap-3 ${layout === 'minimal' ? '' : '@sm:flex-row @sm:items-stretch @sm:p-1.5 @sm:bg-white @sm:shadow-xl @sm:shadow-slate-200/50'}`}
                  style={{ borderRadius: `${inputRadius}px` }}
                >
                  <div className="relative flex-1">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Mail size={18} />
                    </div>
                    <input 
                      required
                      type="email"
                      placeholder={placeholder}
                      className={`w-full pl-12 pr-4 py-4 text-sm font-medium focus:outline-none transition-all ${layout === 'minimal' ? 'border border-slate-200 bg-white' : 'bg-transparent'}`}
                      style={{ borderRadius: `${inputRadius}px` }}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <motion.button
                    whileHover={hoverEffect === 'scale' ? { scale: 1.02 } : { boxShadow: `0 0 20px ${btnBg}40` }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-8 py-4 font-black text-sm shadow-lg flex items-center justify-center gap-2 transition-all"
                    style={{ backgroundColor: btnBg, color: btnColor, borderRadius: `${inputRadius - 4}px` }}
                  >
                    {buttonText}
                    <Send size={16} />
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Trust Info */}
            <div className={`mt-6 flex flex-col gap-2 ${layout === 'horizontal' ? 'items-start' : 'items-center'}`}>
              <div className="flex items-center gap-2">
                {showIcon && <Mail size={14} style={{ color: trustTextColor }} />}
                <span style={{ fontSize: `${trustTextSize}px`, color: trustTextColor }}>{privacyText}</span>
              </div>
              {subscriberCount && (
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full">
                  <div className="flex -space-x-1.5">
                    {[1, 2, 3].map(i => (
                      <img key={i} src={`https://i.pravatar.cc/100?u=${i + 50}`} className="w-5 h-5 rounded-full border border-white" alt="user" referrerPolicy="no-referrer" />
                    ))}
                  </div>
                  <span className="font-bold tracking-tight" style={{ fontSize: '10px', color: trustTextColor }}>{subscriberCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
