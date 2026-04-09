import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ArrowRight } from 'lucide-react';

export const HeaderModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any> 
}> = ({ moduleId, settingsValues }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
  const height = getVal(null, 'height', 80);
  const maxWidth = getVal(null, 'max_width', 1400);
  const menuAlignment = getVal(null, 'menu_alignment', 'center');
  const bgType = getVal(null, 'bg_type', 'glass');
  const bgColor = getVal(null, 'bg_color', '#FFFFFF');
  const borderColor = getVal(null, 'border_color', 'rgba(0,0,0,0.05)');
  const shadow = getVal(null, 'shadow', 'sm');
  const shrinkOnScroll = getVal(null, 'shrink_on_scroll', true);
  const entranceAnim = getVal(null, 'entrance_anim', true);

  // Element: Logo
  const logoType = getVal(`${moduleId}_el_header_logo`, 'logo_type', 'image');
  const logoText = getVal(`${moduleId}_el_header_logo`, 'logo_text', 'MI MARCA');
  const logoImg = getVal(`${moduleId}_el_header_logo`, 'logo_img', '');
  const logoImgAlt = getVal(`${moduleId}_el_header_logo`, 'logo_img_alt', '');
  const logoWidth = getVal(`${moduleId}_el_header_logo`, 'logo_width', 120);

  // Element: Nav
  const links = getVal(`${moduleId}_el_header_nav`, 'links', [
    {label: "Inicio", url: "#"},
    {label: "Servicios", url: "#servicios"},
    {label: "Nosotros", url: "#nosotros"},
    {label: "Contacto", url: "#contacto"}
  ]);
  const fontSize = getVal(`${moduleId}_el_header_nav`, 'font_size', 15);
  const fontWeight = getVal(`${moduleId}_el_header_nav`, 'font_weight', 'medium');
  const linkColor = getVal(`${moduleId}_el_header_nav`, 'link_color', '#0F172A');
  const activeStyle = getVal(`${moduleId}_el_header_nav`, 'active_style', 'underline');
  const activeColor = getVal(`${moduleId}_el_header_nav`, 'active_color', 'var(--primary-color)');

  // Element: Actions
  const showBtn = getVal(`${moduleId}_el_header_actions`, 'show_btn', true);
  const btnText = getVal(`${moduleId}_el_header_actions`, 'btn_text', 'Empezar');
  const btnStyle = getVal(`${moduleId}_el_header_actions`, 'btn_style', 'solid');
  const btnBg = getVal(`${moduleId}_el_header_actions`, 'btn_bg', 'var(--primary-color)');
  const btnColor = getVal(`${moduleId}_el_header_actions`, 'btn_color', '#FFFFFF');
  const btnRadius = getVal(`${moduleId}_el_header_actions`, 'btn_radius', 12);
  const btnHover = getVal(`${moduleId}_el_header_actions`, 'btn_hover', 'scale');

  const currentHeight = (shrinkOnScroll && isScrolled) ? height * 0.8 : height;

  const headerStyle: React.CSSProperties = {
    height: `${currentHeight}px`,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  if (bgType === 'solid') {
    headerStyle.backgroundColor = bgColor;
  } else if (bgType === 'glass') {
    headerStyle.backgroundColor = `${bgColor}CC`;
    headerStyle.backdropFilter = 'blur(12px)';
    headerStyle.WebkitBackdropFilter = 'blur(12px)';
  } else {
    headerStyle.backgroundColor = isScrolled ? `${bgColor}CC` : 'transparent';
    if (isScrolled) {
      headerStyle.backdropFilter = 'blur(12px)';
      headerStyle.WebkitBackdropFilter = 'blur(12px)';
    }
  }

  if (isScrolled || bgType !== 'transparent') {
    headerStyle.borderBottom = `1px solid ${borderColor}`;
    if (shadow === 'sm') headerStyle.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
    if (shadow === 'lg') headerStyle.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
  }

  const positionClass = position === 'sticky' ? 'sticky top-0' : position === 'fixed' ? 'fixed top-0 left-0 right-0' : 'relative';

  // Logo selection logic (SIP v5.1)
  const isTransparentMode = bgType === 'transparent' && !isScrolled;
  const activeLogo = (isTransparentMode && logoImgAlt) ? logoImgAlt : logoImg;

  return (
    <header className={`${positionClass} w-full z-[100] flex items-center`} style={headerStyle}>
      <div className="mx-auto px-6 w-full flex items-center justify-between gap-8" style={{ maxWidth: `${maxWidth}px` }}>
        
        {/* Logo */}
        <div className="flex-shrink-0 z-10">
          {logoType === 'image' && activeLogo ? (
            <img 
              src={activeLogo} 
              alt="Logo" 
              style={{ width: `${logoWidth}px` }} 
              className="h-auto object-contain transition-all duration-300"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="font-black tracking-tighter text-xl" style={{ color: isTransparentMode ? '#FFFFFF' : linkColor }}>
              {logoText}
            </span>
          )}
        </div>

        {/* Desktop Nav */}
        <nav className={`hidden @md:flex items-center gap-8 flex-1 ${
          menuAlignment === 'center' ? 'justify-center' : 
          menuAlignment === 'right' ? 'justify-end' : 'justify-start'
        }`}>
          {links.map((link: any, idx: number) => {
            const hasDropdown = link.has_dropdown;
            let submenuItems = [];
            try {
              submenuItems = typeof link.submenu_items === 'string' ? JSON.parse(link.submenu_items) : (link.submenu_items || []);
            } catch (e) {
              submenuItems = [];
            }

            return (
              <div key={idx} className="relative group py-4">
                <a
                  href={link.url}
                  className="flex items-center gap-1 transition-colors"
                  style={{ 
                    fontSize: `${fontSize}px`, 
                    fontWeight: fontWeight === 'bold' ? 700 : fontWeight === 'medium' ? 500 : 400,
                    color: isTransparentMode ? '#FFFFFF' : linkColor 
                  }}
                >
                  {link.label}
                  {hasDropdown && <Menu size={12} className="opacity-50" />}
                  {activeStyle === 'underline' && (
                    <span 
                      className="absolute bottom-3 left-0 w-0 h-0.5 transition-all group-hover:w-full"
                      style={{ backgroundColor: activeColor }}
                    />
                  )}
                </a>

                {hasDropdown && submenuItems.length > 0 && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-50">
                    <div className="bg-surface border border-border rounded-xl shadow-xl p-2 min-w-[200px]">
                      {submenuItems.map((sub: any, sIdx: number) => (
                        <a
                          key={sIdx}
                          href={sub.url}
                          className="block px-4 py-2.5 text-sm rounded-lg hover:bg-secondary transition-colors text-text/80 hover:text-primary font-medium"
                        >
                          {sub.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4 z-10">
          {showBtn && (
            <motion.button
              whileHover={btnHover === 'scale' ? { scale: 1.05 } : { boxShadow: `0 0 20px ${btnBg}40` }}
              whileTap={{ scale: 0.95 }}
              className="hidden @md:flex items-center gap-2 px-6 py-2.5 text-sm font-bold transition-all shadow-sm"
              style={{ 
                backgroundColor: btnStyle === 'solid' ? btnBg : 'transparent',
                color: btnStyle === 'solid' ? btnColor : btnBg,
                border: btnStyle === 'outline' ? `2px solid ${btnBg}` : 'none',
                borderRadius: `${btnRadius}px`
              }}
            >
              {btnText}
              <ArrowRight size={16} />
            </motion.button>
          )}

          {/* Mobile Toggle */}
          <button 
            className="@md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ color: linkColor }}
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
            className="absolute top-full left-0 right-0 border-b border-slate-100 overflow-hidden @md:hidden shadow-xl"
            style={{ backgroundColor: bgColor }}
          >
            <div className="flex flex-col p-6 gap-4">
              {links.map((link: any, idx: number) => (
                <a
                  key={idx}
                  href={link.url}
                  className="text-lg font-bold py-2"
                  style={{ color: linkColor }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              {showBtn && (
                <button
                  className="w-full py-4 mt-4 font-black text-center shadow-lg"
                  style={{ 
                    backgroundColor: btnBg, 
                    color: btnColor,
                    borderRadius: `${btnRadius}px`
                  }}
                >
                  {btnText}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
