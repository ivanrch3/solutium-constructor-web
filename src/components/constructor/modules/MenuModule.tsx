import React from 'react';
import { motion } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { TYPOGRAPHY_SCALE, FONT_WEIGHTS } from '../../../constants/typography';

export const MenuModule: React.FC<{ 
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
  const layout = getVal(null, 'layout', 'horizontal');
  const align = getVal(null, 'align', 'center');
  const gap = getVal(null, 'gap', 24);
  const paddingY = getVal(null, 'padding_y', 20);
  const darkMode = getVal(null, 'dark_mode', false);
  const bgColor = darkMode ? '#0F172A' : getVal(null, 'bg_color', 'transparent');
  const glassEffect = getVal(null, 'glass_effect', false);
  const sticky = getVal(null, 'sticky', false);
  const borderRadius = getVal(null, 'border_radius', 12);
  const entranceAnim = getVal(null, 'entrance_anim', true);

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
  const logoWidth = getVal(`${moduleId}_el_menu_logo`, 'logo_width', 120);
  const logoColor = getVal(`${moduleId}_el_menu_logo`, 'text_color', '#0F172A');
  const logoFontSize = getVal(`${moduleId}_el_menu_logo`, 'font_size', 't3');
  const logoFontWeight = getVal(`${moduleId}_el_menu_logo`, 'font_weight', 'bold');

  // Element: Items
  const links = getVal(`${moduleId}_el_menu_items`, 'links', [
    {label: "Inicio", url: "#", icon: "Home"},
    {label: "Servicios", url: "#servicios", badge: "Nuevo"},
    {label: "Portafolio", url: "#portafolio"},
    {label: "Contacto", url: "#contacto"}
  ]);
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
    vertical: 'flex flex-col',
    grid: 'grid grid-cols-2 @md:grid-cols-3 @lg:grid-cols-4'
  };

  const alignmentClasses = {
    start: 'justify-start items-start',
    center: 'justify-center items-center',
    end: 'justify-end items-end'
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
    backdropFilter: glassEffect ? 'blur(12px)' : 'none',
    WebkitBackdropFilter: glassEffect ? 'blur(12px)' : 'none',
    borderRadius: `${borderRadius}px`,
    paddingTop: `${paddingY}px`,
    paddingBottom: `${paddingY}px`,
    position: sticky ? 'sticky' : 'relative',
    top: sticky ? 0 : 'auto',
    zIndex: sticky ? 50 : 10
  };

  return (
    <nav className="w-full" style={navStyle}>
      <motion.div 
        {...animProps}
        className={`${containerClasses[layout as keyof typeof containerClasses]} ${alignmentClasses[align as keyof typeof alignmentClasses]} w-full mx-auto px-6 flex items-center gap-8`}
        style={{ gap: `${gap}px` }}
      >
        {/* Logo Integration */}
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
              {logoText}
            </span>
          )}
        </div>

        {/* Links */}
        <div className={`flex flex-1 items-center gap-6 ${alignmentClasses[align as keyof typeof alignmentClasses]}`}>
          {links.map((link: any, idx: number) => {
            const isTitle = link.is_title;
            
            if (isTitle) {
              return (
                <div 
                  key={idx}
                  className="px-4 py-2 mt-2 first:mt-0"
                  style={{ 
                    fontSize: `${(TYPOGRAPHY_SCALE[fontSize as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 15) * 0.8}px`,
                    fontWeight: 800,
                    color: textColor,
                    opacity: 0.5,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
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
                whileHover={hoverScale ? { scale: 1.05 } : {}}
                className={`relative flex items-center gap-3 px-4 py-2.5 transition-all group no-underline`}
                style={{ 
                  fontSize: `${TYPOGRAPHY_SCALE[fontSize as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 15}px`,
                  fontWeight: FONT_WEIGHTS[fontWeight as keyof typeof FONT_WEIGHTS]?.value || 500,
                  color: textColor
                }}
              >
                {/* Hover Effect Background */}
                {hoverStyle === 'pill' && (
                  <motion.span 
                    layoutId={`${moduleId}_hover_pill`}
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: hoverBg, borderRadius: '12px' }}
                  />
                )}

                {/* Content */}
                <div className="relative flex items-center gap-2.5 z-10">
                  {showIcons && link.icon && (
                    <span className="opacity-70 group-hover:opacity-100 transition-opacity">
                      {getIcon(link.icon)}
                    </span>
                  )}
                  <span>{link.label}</span>
                  
                  {link.badge && (
                    <span 
                      className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-tighter rounded-md text-white shadow-sm"
                      style={{ backgroundColor: activeColor }}
                    >
                      {link.badge}
                    </span>
                  )}
                </div>

                {/* Underline Effect */}
                {hoverStyle === 'underline' && (
                  <motion.span 
                    layoutId={`${moduleId}_hover_underline`}
                    className="absolute bottom-0 left-4 right-4 h-0.5"
                    style={{ backgroundColor: activeColor }}
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}

                {/* Color Effect */}
                {hoverStyle === 'color' && (
                  <style>{`
                    .group:hover { color: ${activeColor} !important; }
                  `}</style>
                )}
              </motion.a>
            );
          })}
        </div>
      </motion.div>
    </nav>
  );
};
