import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { Menu as HamburgerIcon, X as CloseIcon, Info, Sparkles, Link } from 'lucide-react';
import { TYPOGRAPHY_SCALE, FONT_WEIGHTS } from '../../../constants/typography';
import { InlineEditableText } from '../InlineEditableText';
import { useEditorStore } from '../../../store/editorStore';

export const MenuModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any>,
  logoUrl?: string | null,
  logoWhiteUrl?: string | null,
  isPreviewMode?: boolean
}> = ({ moduleId, settingsValues, logoUrl, logoWhiteUrl, isPreviewMode = false }) => {
  const { updateSectionSettings, setShowMenuRecommendation } = useEditorStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  };

  // Element: Items
  const links = getVal(`${moduleId}_el_menu_items`, 'links', []);

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  // Scroll Spy Logic
  useEffect(() => {
    if (!isPreviewMode) return;
    
    const options = {
      root: null,
      rootMargin: '-10% 0px -80% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSectionId(entry.target.id);
        }
      });
    }, options);

    // Observe all modules except navigation modules itself
    const modules = document.querySelectorAll('[id^="mod_"]');
    modules.forEach(m => {
      if (!m.id.includes('menu') && !m.id.includes('header') && !m.id.includes('footer')) {
        observer.observe(m);
      }
    });

    return () => observer.disconnect();
  }, [isPreviewMode, links.length]);

  // Global Settings
  const layout = getVal(null, 'layout', 'horizontal');
  const align = getVal(null, 'align', 'center');
  const gap = parseFloat(getVal(null, 'gap', 24)) || 24;
  const paddingY = parseFloat(getVal(null, 'padding_y', 20)) || 20;
  const darkMode = getVal(null, 'dark_mode', false);
  const rawBgColor = getVal(null, 'bg_color', darkMode ? '#0F172A' : 'transparent');
  const glassEffect = getVal(null, 'glass_effect', false);
  const position = getVal(null, 'position', getVal(null, 'sticky', false) ? 'sticky' : 'relative');
  const isFloating = position === 'sticky' || position === 'fixed';
  const desktopHamburger = getVal(null, 'desktop_hamburger', false);

  const bgColor = (isFloating && rawBgColor === 'transparent') 
    ? (darkMode ? '#1E293B' : '#FFFFFF') 
    : rawBgColor;
  const borderRadius = parseFloat(getVal(null, 'border_radius', 12)) || 12;
  const entranceAnim = getVal(null, 'entrance_anim', true);
  const invertOrder = getVal(null, 'invert_order', false);

  // Overflow Detection Logic: Show recommendation if many modules are present (desktop/tablet horizontal)
  useEffect(() => {
    if (!isPreviewMode && links.length > 6 && !desktopHamburger && layout === 'horizontal') {
      const timer = setTimeout(() => setShowMenuRecommendation(true), 1500);
      return () => clearTimeout(timer);
    } else {
      setShowMenuRecommendation(false);
    }
  }, [links.length, desktopHamburger, isPreviewMode, layout, setShowMenuRecommendation]);

  // Helper to safely apply opacity to hex colors
  const getGlassColor = (color: string) => {
    if (!glassEffect) return color;
    if (color === 'transparent') return 'transparent';
    if (color.startsWith('#') && color.length === 7) return `${color}CC`;
    return color;
  };

  // Element: Logo
  const logoType = getVal(`${moduleId}_el_menu_logo`, 'logo_type', 'image');
  const logoText = getVal(`${moduleId}_el_menu_logo`, 'logo_text', 'MI MARCA');
  const logoImg = getVal(`${moduleId}_el_menu_logo`, 'logo_img', '');
  const logoImgAlt = getVal(`${moduleId}_el_menu_logo`, 'logo_img_alt', '');
  const logoWidth = parseFloat(getVal(`${moduleId}_el_menu_logo`, 'logo_width', 120)) || 120;
  const logoColor = getVal(`${moduleId}_el_menu_logo`, 'text_color', '#0F172A');
  const logoFontSize = getVal(`${moduleId}_el_menu_logo`, 'font_size', 't3');
  const logoFontWeight = getVal(`${moduleId}_el_menu_logo`, 'font_weight', 'bold');

  const fontSize = getVal(`${moduleId}_el_menu_items`, 'font_size', 'p');
  const fontWeight = getVal(`${moduleId}_el_menu_items`, 'font_weight', 'medium');
  const textColor = darkMode ? '#FFFFFF' : getVal(`${moduleId}_el_menu_items`, 'text_color', '#0F172A');
  const showIcons = getVal(`${moduleId}_el_menu_items`, 'show_icons', true);
  const iconSize = getVal(`${moduleId}_el_menu_items`, 'icon_size', 18);

  // Element: Style
  const hoverStyle = getVal(`${moduleId}_el_menu_style`, 'hover_style', 'pill');
  const hoverBg = darkMode ? 'rgba(255,255,255,0.1)' : getVal(`${moduleId}_el_menu_style`, 'hover_bg', 'rgba(0,0,0,0.05)');
  const activeColor = getVal(`${moduleId}_el_menu_style`, 'active_color', 'var(--primary-color)');
  const hoverScale = getVal(`${moduleId}_el_menu_style`, 'hover_scale', true);

  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent size={iconSize} /> : null;
  };

  const containerClasses = {
    horizontal: 'flex flex-row flex-wrap',
    vertical: 'flex flex-col'
  };

  const alignmentClasses = {
    start: layout === 'vertical' ? 'items-start' : 'justify-start',
    center: layout === 'vertical' ? 'items-center' : 'justify-center',
    end: layout === 'vertical' ? 'items-end' : 'justify-end'
  };

  const animProps = entranceAnim ? {
    initial: { opacity: 0, y: 10 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5, ease: 'easeOut' as any }
  } : {};

  const activeLogo = darkMode 
    ? (logoImgAlt || logoWhiteUrl) 
    : (logoImg || logoUrl);

  const navStyle: React.CSSProperties = {
    backgroundColor: getGlassColor(bgColor),
    backdropFilter: glassEffect || isFloating ? 'blur(12px)' : 'none',
    WebkitBackdropFilter: glassEffect || isFloating ? 'blur(12px)' : 'none',
    borderRadius: isFloating ? '0px' : `${borderRadius}px`,
    paddingTop: `${paddingY}px`,
    paddingBottom: `${paddingY}px`,
    position: 'relative',
    width: '100%',
    zIndex: 1,
    borderBottom: isFloating ? `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}` : 'none'
  };

  const renderLinks = (isMobile: boolean = false) => {
    return links.map((link: any, idx: number) => {
      const isTitle = link.is_title;
      const isActive = link.url === `#${activeSectionId}`;
      
      if (isTitle) {
        return (
          <div 
            key={idx}
            className="px-4 py-2 mt-2 first:mt-0 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400"
            style={{ 
              fontSize: `${(TYPOGRAPHY_SCALE[fontSize as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 15) * 0.75}px`
            }}
          >
            {link.label}
          </div>
        );
      }

      return (
        <motion.a
          key={idx}
          href={link.url}
          whileHover={hoverScale && !isMobile ? { scale: 1.05 } : {}}
          onClick={(e) => {
            if (link.url?.startsWith('#')) {
              e.preventDefault();
              const targetId = link.url.substring(1);
              const target = document.getElementById(targetId);
              if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setActiveSectionId(targetId);
              }
            }
            if (isMobile) setIsMobileMenuOpen(false);
          }}
          className={`relative flex items-center gap-3 px-4 py-2.5 transition-all group no-underline w-full @md:w-auto`}
          style={{ 
            fontSize: `${TYPOGRAPHY_SCALE[fontSize as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 15}px`,
            fontWeight: isActive ? 800 : (FONT_WEIGHTS[fontWeight as keyof typeof FONT_WEIGHTS]?.value || 500),
            color: isActive ? activeColor : textColor
          }}
        >
          {(hoverStyle === 'pill' || isActive) && (
            <motion.span 
              className={`absolute inset-0 transition-all duration-300 ${isActive ? 'opacity-100' : (isMobile ? 'opacity-0' : 'opacity-0 group-hover:opacity-100')}`}
              style={{ 
                backgroundColor: isActive ? 'transparent' : hoverBg, 
                borderRadius: '12px',
                border: isActive ? `1.5px solid ${activeColor}` : 'none',
              }}
            />
          )}

          <div className="relative flex items-center gap-2.5 z-10 w-full">
            {showIcons && link.icon && (
              <span 
                className={`${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'} transition-opacity`}
                style={{ color: isActive ? activeColor : 'inherit' }}
              >
                {getIcon(link.icon)}
              </span>
            )}
            <span className="flex-1">{link.label}</span>
            
            {link.badge && (
              <span 
                className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-tighter rounded-md text-white shadow-sm"
                style={{ backgroundColor: activeColor }}
              >
                {link.badge}
              </span>
            )}
          </div>

          {hoverStyle === 'underline' && isActive && (
            <motion.span 
              className="absolute bottom-0 left-4 right-4 h-0.5"
              style={{ backgroundColor: activeColor }}
            />
          )}
        </motion.a>
      );
    });
  };

  return (
    <>
      <nav className="w-full" style={navStyle}>
        <motion.div 
          {...animProps}
          className={`${containerClasses[layout as keyof typeof containerClasses]} w-full mx-auto px-6 flex items-center gap-8 ${invertOrder && layout === 'horizontal' ? 'flex-row-reverse' : ''} ${layout === 'vertical' ? alignmentClasses[align as keyof typeof alignmentClasses] : ''}`}
          style={{ gap: `${gap}px` }}
        >
          {/* Logo */}
          <div className="flex-shrink-0">
            {logoType === 'image' && activeLogo ? (
              <img 
                src={activeLogo} 
                alt="Logo" 
                style={{ width: `${logoWidth}px` }} 
                className="h-auto object-contain transition-all duration-300"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span 
                className="tracking-tighter" 
                style={{ 
                  color: darkMode ? '#FFFFFF' : logoColor,
                  fontSize: `${TYPOGRAPHY_SCALE[logoFontSize as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 24}px`,
                  fontWeight: FONT_WEIGHTS[logoFontWeight as keyof typeof FONT_WEIGHTS]?.value || 900
                }}
              >
                <InlineEditableText
                  moduleId={moduleId}
                  elementId={`${moduleId}_el_menu_logo`}
                  settingId="logo_text"
                  value={logoText}
                  isPreviewMode={isPreviewMode}
                />
              </span>
            )}
          </div>

          {/* Links Logic */}
          <div className={`flex flex-1 items-center gap-6 ${desktopHamburger ? 'justify-end' : (layout === 'horizontal' ? alignmentClasses[align as keyof typeof alignmentClasses] : 'flex-col items-center')}`}>
            {desktopHamburger ? (
              /* Forced Hamburger (Desktop/Tablet/Mobile) */
              <div className="flex items-center">
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 rounded-full hover:bg-black/5 transition-colors"
                  style={{ color: textColor }}
                >
                  {isMobileMenuOpen ? <CloseIcon size={24} /> : <HamburgerIcon size={24} />}
                </button>
              </div>
            ) : (
              /* Responsive Logic (Links on Desktop, Hamburger on Mobile) */
              <>
                <div className="hidden @md:flex items-center gap-4">
                  {renderLinks()}
                </div>
                
                <div className="@md:hidden flex items-center">
                  <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-full hover:bg-black/5 transition-colors"
                    style={{ color: textColor }}
                  >
                    {isMobileMenuOpen ? <CloseIcon size={24} /> : <HamburgerIcon size={24} />}
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Mobile menu and Desktop hamburger menu content */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="absolute top-full left-4 right-4 mt-2 p-6 rounded-3xl shadow-2xl z-[100] border overflow-hidden"
              style={{ 
                backgroundColor: darkMode ? '#1E293B' : '#FFFFFF',
                borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
              }}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between mb-4 border-b pb-4 border-border/50">
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Navegación</span>
                   <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 hover:bg-black/5 rounded-lg transition-colors">
                     <CloseIcon size={16} style={{ color: textColor }} />
                   </button>
                </div>
                {renderLinks(true)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};
