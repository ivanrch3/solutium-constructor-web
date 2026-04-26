import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ArrowRight, Sparkles, Phone } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { TYPOGRAPHY_SCALE, FONT_WEIGHTS } from '../../../constants/typography';

export const HeaderModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any>,
  isPreviewMode?: boolean
}> = ({ moduleId, settingsValues, isPreviewMode = false }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Global Settings
  const position = getVal(null, 'position', 'sticky');
  const layoutType = getVal(null, 'layout_type', 'standard');
  const darkMode = getVal(null, 'dark_mode', false);
  const bgType = getVal(null, 'bg_type', 'glass');
  const bgColor = getVal(null, 'bg_color', darkMode ? '#0F172A' : '#FFFFFF');
  const accentColor = getVal(null, 'accent_color', 'var(--primary-color)');
  const borderColor = darkMode ? 'rgba(255,255,255,0.1)' : getVal(null, 'border_color', 'rgba(0,0,0,0.05)');
  const shadow = getVal(null, 'shadow', 'sm');
  const shrinkOnScroll = getVal(null, 'shrink_on_scroll', true);
  const entranceAnim = getVal(null, 'entrance_anim', true);

  // Element: Marquee
  const showMarquee = getVal(`${moduleId}_el_header_marquee`, 'show_marquee', true);
  const marqueeMessages = getVal(`${moduleId}_el_header_marquee`, 'messages', [
    {text: '¡Envío gratis hoy!', icon: 'Sparkles'}, 
    {text: '10% OFF en tu primera compra', icon: 'Zap'}
  ]);
  const marqueeBg = getVal(`${moduleId}_el_header_marquee`, 'bg_color', 'var(--primary-color)');
  const marqueeTextColor = getVal(`${moduleId}_el_header_marquee`, 'text_color', '#FFFFFF');
  const marqueeSpeed = parseFloat(getVal(`${moduleId}_el_header_marquee`, 'speed', 30)) || 30;
  const marqueeDirection = getVal(`${moduleId}_el_header_marquee`, 'direction', 'left');
  const marqueeGap = parseFloat(getVal(`${moduleId}_el_header_marquee`, 'gap', 48)) || 48;
  const pauseOnHover = getVal(`${moduleId}_el_header_marquee`, 'pause_on_hover', true);
  const marqueeFontSize = getVal(`${moduleId}_el_header_marquee`, 'font_size', 's');
  const marqueeFontWeight = getVal(`${moduleId}_el_header_marquee`, 'font_weight', 'bold');

  // Element: Quick Reg
  const showReg = getVal(`${moduleId}_el_header_quick_reg`, 'show_reg', false);
  const regPlaceholder = getVal(`${moduleId}_el_header_quick_reg`, 'placeholder', 'Tu email para el cupón...');
  const regBtnText = getVal(`${moduleId}_el_header_quick_reg`, 'btn_text', 'Obtener 10%');
  const regInputBg = getVal(`${moduleId}_el_header_quick_reg`, 'input_bg', '#F1F5F9');
  const regBtnBg = getVal(`${moduleId}_el_header_quick_reg`, 'btn_bg', 'var(--primary-color)');
  const regBtnColor = getVal(`${moduleId}_el_header_quick_reg`, 'btn_color', '#FFFFFF');
  const regWidth = parseFloat(getVal(`${moduleId}_el_header_quick_reg`, 'width', 300)) || 300;

  // Element: Actions
  const showActions = getVal(`${moduleId}_el_header_actions`, 'show_actions', true);
  const primaryBtnText = getVal(`${moduleId}_el_header_actions`, 'primary_btn_text', 'Reservar');
  const primaryType = getVal(`${moduleId}_el_header_actions`, 'primary_link_type', 'external');
  const primaryUrl = getVal(`${moduleId}_el_header_actions`, 'primary_url', '');
  const primaryTarget = getVal(`${moduleId}_el_header_actions`, 'primary_target', '_self');
  
  const secondaryBtnText = getVal(`${moduleId}_el_header_actions`, 'secondary_btn_text', 'WhatsApp');
  const secondaryType = getVal(`${moduleId}_el_header_actions`, 'secondary_link_type', 'external');
  const secondaryUrl = getVal(`${moduleId}_el_header_actions`, 'secondary_url', '');
  const secondaryTarget = getVal(`${moduleId}_el_header_actions`, 'secondary_target', '_self');

  const hasPrimary = primaryUrl !== '';
  const hasSecondary = secondaryUrl !== '';
  const primaryBg = getVal(`${moduleId}_el_header_actions`, 'primary_bg', 'var(--primary-color)');
  const primaryColor = getVal(`${moduleId}_el_header_actions`, 'primary_color', '#FFFFFF');
  const secondaryStyle = getVal(`${moduleId}_el_header_actions`, 'secondary_style', 'outline');
  const pulseEffect = getVal(`${moduleId}_el_header_actions`, 'pulse_effect', true);
  const hoverAnim = getVal(`${moduleId}_el_header_actions`, 'hover_anim', 'scale');

  const hasButtons = (showActions && (hasPrimary || hasSecondary));
  const showContent = showReg || hasButtons;

  const isCompact = layoutType === 'compact';
  const py = isCompact ? 12 : 20;

  const headerStyle: React.CSSProperties = {
    paddingTop: showContent ? `${py}px` : '0px',
    paddingBottom: showContent ? `${py}px` : '0px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    top: 0
  };

  if (bgType === 'solid') {
    headerStyle.backgroundColor = bgColor;
  } else if (bgType === 'glass') {
    headerStyle.backgroundColor = bgColor.startsWith('#') ? `${bgColor}CC` : bgColor;
    headerStyle.backdropFilter = 'blur(12px)';
    headerStyle.WebkitBackdropFilter = 'blur(12px)';
  } else if (bgType === 'gradient_anim') {
    headerStyle.background = `linear-gradient(-45deg, ${bgColor}, ${accentColor}, ${bgColor})`;
    headerStyle.backgroundSize = '400% 400%';
    headerStyle.animation = 'gradient 15s ease infinite';
  } else if (bgType === 'transparent') {
    headerStyle.backgroundColor = isScrolled ? (bgColor.startsWith('#') ? `${bgColor}CC` : bgColor) : 'transparent';
    if (isScrolled) {
      headerStyle.backdropFilter = 'blur(12px)';
      headerStyle.WebkitBackdropFilter = 'blur(12px)';
    }
  } else {
    headerStyle.backgroundColor = isScrolled ? (bgColor.startsWith('#') ? `${bgColor}CC` : bgColor) : 'transparent';
    if (isScrolled) {
      headerStyle.backdropFilter = 'blur(12px)';
      headerStyle.WebkitBackdropFilter = 'blur(12px)';
    }
  }

  if (isScrolled || bgType !== 'transparent') {
    headerStyle.borderBottomWidth = '1px';
    headerStyle.borderBottomStyle = 'solid';
    headerStyle.borderBottomColor = borderColor;
    if (shadow === 'sm') headerStyle.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
    if (shadow === 'lg') headerStyle.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
  }

  const positionClass = 'relative';

  const isTransparentMode = bgType === 'transparent' && !isScrolled;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setTimeout(() => setIsSubscribed(false), 3000);
      setEmail('');
    }
  };

  return (
    <div className={`${positionClass} w-full z-[100] ${entranceAnim ? 'animate-in fade-in slide-in-from-top duration-700' : ''}`}>
      {/* Marquee Banner */}
      {showMarquee && marqueeMessages.length > 0 && (
        <div 
          className="w-full overflow-hidden py-2 relative z-[110]"
          style={{ backgroundColor: marqueeBg, color: marqueeTextColor }}
        >
          <div 
            className="marquee-container flex whitespace-nowrap items-center"
            style={{ 
              '--speed': `${200 / (marqueeSpeed / 10)}s`,
              '--pause': pauseOnHover ? 'paused' : 'running',
              '--direction': marqueeDirection === 'left' ? 'marquee-left' : 'marquee-right',
              gap: `${marqueeGap}px`
            } as any}
          >
            {[...Array(20)].map((_, i) => (
              <React.Fragment key={i}>
                {marqueeMessages.map((msg: any, idx: number) => {
                  const Icon = (LucideIcons as any)[msg.icon] || Sparkles;
                  const fontSizeValue = TYPOGRAPHY_SCALE[marqueeFontSize as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 12;
                  const fontWeightValue = FONT_WEIGHTS[marqueeFontWeight as keyof typeof FONT_WEIGHTS]?.value || 800;

                  return (
                    <div key={`${i}-${idx}`} className="flex items-center gap-2 px-4" style={{ marginRight: `${marqueeGap}px` }}>
                      <Icon size={fontSizeValue * 1.2} />
                      <span 
                        className="uppercase tracking-widest"
                        style={{ 
                          fontSize: `${fontSizeValue}px`,
                          fontWeight: fontWeightValue
                        }}
                      >
                        {msg.text}
                      </span>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {showContent && (
        <header className="w-full flex items-center" style={headerStyle}>
          <div className={`mx-auto px-6 w-full flex items-center ${layoutType === 'standard' ? 'justify-center gap-12' : 'justify-between gap-8'}`} style={{ maxWidth: '1400px' }}>
            
            {/* Registro / Centro */}
            <div className={`flex items-center ${layoutType === 'split' ? 'flex-1 justify-start' : ''}`}>
            {showReg && (
              <form 
                onSubmit={handleSubscribe}
                className={`flex items-center rounded-full p-1 border overflow-hidden shadow-inner transition-all ${
                  isTransparentMode || darkMode 
                    ? 'bg-white/10 border-white/20' 
                    : 'bg-black/5 border-black/10'
                } ${isSubscribed ? 'ring-2 ring-green-500/50' : ''}`}
                style={{ maxWidth: `${regWidth}px`, width: '100%' }}
              >
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={regPlaceholder}
                  className={`bg-transparent border-none outline-none px-4 py-1.5 text-xs flex-1 transition-colors ${
                    isTransparentMode || darkMode 
                      ? 'text-white placeholder:text-white/40' 
                      : 'text-slate-900 placeholder:text-slate-900/40'
                  }`}
                  required
                />
                <button 
                  type="submit"
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center gap-2 ${isSubscribed ? 'bg-green-500 text-white' : ''}`}
                  style={{ 
                    backgroundColor: isSubscribed ? undefined : regBtnBg, 
                    color: isSubscribed ? undefined : regBtnColor 
                  }}
                >
                  {isSubscribed ? (
                    <>
                      <LucideIcons.Check size={12} />
                      ¡Listo!
                    </>
                  ) : regBtnText}
                </button>
              </form>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 z-10">
            {showActions && (
              <div className="hidden @md:flex items-center gap-3">
                {hasPrimary && (
                  <motion.a
                    href={primaryUrl}
                    target={primaryTarget === '_blank' ? '_blank' : undefined}
                    rel={primaryTarget === '_blank' ? 'noopener noreferrer' : undefined}
                    whileHover={hoverAnim === 'scale' ? { scale: 1.05 } : { boxShadow: primaryBg.startsWith('#') ? `0 0 20px ${primaryBg}40` : `0 0 20px rgba(0,0,0,0.1)` }}
                    whileTap={{ scale: 0.95 }}
                    animate={pulseEffect ? { 
                      boxShadow: primaryBg.startsWith('#') ? [
                        `0 0 0 0px ${primaryBg}40`,
                        `0 0 0 10px ${primaryBg}00`
                      ] : [
                        `0 0 0 0px rgba(0,0,0,0.1)`,
                        `0 0 0 10px rgba(0,0,0,0)`
                      ]
                    } : {}}
                    transition={pulseEffect ? { repeat: Infinity, duration: 2 } : {}}
                    className={`flex items-center gap-2 font-black uppercase tracking-widest transition-all shadow-lg ${isCompact ? 'px-4 py-2 text-[9px]' : 'px-6 py-2.5 text-[10px]'}`}
                    style={{ 
                      backgroundColor: primaryBg,
                      color: primaryColor,
                      borderRadius: `${parseFloat(isCompact ? '10' : '14') || 14}px`
                    }}
                  >
                    {primaryBtnText}
                    <ArrowRight size={isCompact ? 12 : 14} />
                  </motion.a>
                )}

                {hasSecondary && (
                  <motion.a
                    href={secondaryUrl}
                    target={secondaryTarget === '_blank' ? '_blank' : undefined}
                    rel={secondaryTarget === '_blank' ? 'noopener noreferrer' : undefined}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 font-black uppercase tracking-widest transition-all ${isCompact ? 'px-3 py-2 text-[9px]' : 'px-4 py-2.5 text-[10px]'}`}
                    style={{ 
                      backgroundColor: secondaryStyle === 'solid' ? (darkMode ? '#334155' : '#F1F5F9') : 'transparent',
                      color: isTransparentMode ? '#FFFFFF' : (darkMode ? '#FFFFFF' : '#0F172A'),
                      borderWidth: secondaryStyle === 'outline' ? '1px' : '0px',
                      borderStyle: secondaryStyle === 'outline' ? 'solid' : 'none',
                      borderColor: isTransparentMode ? 'rgba(255,255,255,0.3)' : borderColor,
                      borderRadius: isCompact ? '10px' : '14px'
                    }}
                  >
                    <Phone size={isCompact ? 12 : 14} />
                    {secondaryBtnText}
                  </motion.a>
                )}
              </div>
            )}

            {/* Mobile Toggle */}
            <button 
              className="@md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{ color: isTransparentMode ? '#FFFFFF' : (darkMode ? '#FFFFFF' : '#0F172A') }}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="absolute top-full left-0 right-0 overflow-hidden @md:hidden shadow-2xl"
              style={{ 
                backgroundColor: bgColor,
                borderBottomWidth: '1px',
                borderBottomStyle: 'solid',
                borderBottomColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(241, 245, 249, 1)'
              }}
            >
              <div className="flex flex-col p-8 gap-6">
                {showReg && (
                  <div className="space-y-3">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-white/40' : 'text-slate-900/40'}`}>Oferta Exclusiva</p>
                    <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={regPlaceholder}
                        className={`w-full px-4 py-3 rounded-xl text-sm transition-colors`}
                        style={{
                          backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(248, 250, 252, 1)',
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(226, 232, 240, 1)',
                          color: darkMode ? '#FFFFFF' : '#0F172A'
                        }}
                        required
                      />
                      <button 
                        type="submit"
                        className="w-full py-3 rounded-xl font-black uppercase tracking-widest shadow-lg"
                        style={{ backgroundColor: regBtnBg, color: regBtnColor }}
                      >
                        {isSubscribed ? '¡Suscrito!' : regBtnText}
                      </button>
                    </form>
                  </div>
                )}
                
                <div className="space-y-3">
                  <p className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-white/40' : 'text-slate-900/40'}`}>Acciones Rápidas</p>
                  {hasPrimary && (
                    <a
                      href={primaryUrl}
                      target={primaryTarget === '_blank' ? '_blank' : undefined}
                      rel={primaryTarget === '_blank' ? 'noopener noreferrer' : undefined}
                      className="w-full py-4 font-black text-center shadow-lg rounded-xl flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                      style={{ backgroundColor: primaryBg, color: primaryColor }}
                    >
                      {primaryBtnText}
                      <ArrowRight size={18} />
                    </a>
                  )}
                  {hasSecondary && (
                    <a
                      href={secondaryUrl}
                      target={secondaryTarget === '_blank' ? '_blank' : undefined}
                      rel={secondaryTarget === '_blank' ? 'noopener noreferrer' : undefined}
                      className="w-full py-4 font-bold text-center rounded-xl flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                      style={{ 
                        color: darkMode ? '#FFFFFF' : '#0F172A',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(226, 232, 240, 1)'
                      }}
                    >
                      <Phone size={18} />
                      {secondaryBtnText}
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    )}
      
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .marquee-container {
          display: flex;
          width: max-content;
          animation: var(--direction) var(--speed) linear infinite;
        }
        .marquee-container:hover {
          animation-play-state: var(--pause);
        }
      `}</style>
    </div>
  );
};
