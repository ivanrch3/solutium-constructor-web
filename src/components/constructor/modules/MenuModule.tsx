import React from 'react';
import { motion } from 'motion/react';
import * as LucideIcons from 'lucide-react';

export const MenuModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any> 
}> = ({ moduleId, settingsValues }) => {
  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  };

  // Global Settings
  const layout = getVal(null, 'layout', 'horizontal');
  const align = getVal(null, 'align', 'center');
  const gap = getVal(null, 'gap', 24);
  const paddingY = getVal(null, 'padding_y', 20);
  const bgColor = getVal(null, 'bg_color', 'transparent');
  const borderRadius = getVal(null, 'border_radius', 12);
  const entranceAnim = getVal(null, 'entrance_anim', true);

  // Element: Items
  const links = getVal(`${moduleId}_el_menu_items`, 'links', [
    {label: "Inicio", url: "#", icon: "Home"},
    {label: "Servicios", url: "#servicios", badge: "Nuevo"},
    {label: "Portafolio", url: "#portafolio"},
    {label: "Contacto", url: "#contacto"}
  ]);
  const fontSize = getVal(`${moduleId}_el_menu_items`, 'font_size', 15);
  const fontWeight = getVal(`${moduleId}_el_menu_items`, 'font_weight', 'medium');
  const textColor = getVal(`${moduleId}_el_menu_items`, 'text_color', '#0F172A');
  const showIcons = getVal(`${moduleId}_el_menu_items`, 'show_icons', true);
  const iconSize = getVal(`${moduleId}_el_menu_items`, 'icon_size', 18);

  // Element: Style
  const hoverStyle = getVal(`${moduleId}_el_menu_style`, 'hover_style', 'pill');
  const hoverBg = getVal(`${moduleId}_el_menu_style`, 'hover_bg', 'rgba(0,0,0,0.05)');
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
    transition: { duration: 0.5, ease: 'easeOut' }
  } : {};

  return (
    <nav 
      className="w-full"
      style={{ 
        backgroundColor: bgColor, 
        borderRadius: `${borderRadius}px`,
        paddingTop: `${paddingY}px`,
        paddingBottom: `${paddingY}px`
      }}
    >
      <motion.div 
        {...animProps}
        className={`${containerClasses[layout as keyof typeof containerClasses]} ${alignmentClasses[align as keyof typeof alignmentClasses]} w-full mx-auto`}
        style={{ gap: `${gap}px` }}
      >
        {links.map((link: any, idx: number) => {
          const isTitle = link.is_title;
          
          if (isTitle) {
            return (
              <div 
                key={idx}
                className="px-4 py-2 mt-2 first:mt-0"
                style={{ 
                  fontSize: `${fontSize * 0.8}px`,
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
                fontSize: `${fontSize}px`,
                fontWeight: fontWeight === 'bold' ? 700 : fontWeight === 'medium' ? 500 : 400,
                color: textColor
              }}
            >
              {/* Hover Effect Background */}
              {hoverStyle === 'pill' && (
                <span 
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
                <span 
                  className="absolute bottom-0 left-4 right-4 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"
                  style={{ backgroundColor: activeColor }}
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
      </motion.div>
    </nav>
  );
};
