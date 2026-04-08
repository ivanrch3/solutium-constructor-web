import React from 'react';
import { motion } from 'motion/react';
import * as LucideIcons from 'lucide-react';

export const FooterModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any> 
}> = ({ moduleId, settingsValues }) => {
  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  };

  // Global Settings
  const paddingY = getVal(null, 'padding_y', 80);
  const maxWidth = getVal(null, 'max_width', 1400);
  const bgColor = getVal(null, 'bg_color', '#F8FAFC');
  const textColor = getVal(null, 'text_color', '#475569');
  const borderTop = getVal(null, 'border_top', true);
  const borderColor = getVal(null, 'border_color', '#E2E8F0');

  // Element: Brand
  const showLogo = getVal(`${moduleId}_el_footer_brand`, 'show_logo', true);
  const bio = getVal(`${moduleId}_el_footer_brand`, 'bio', 'Creamos soluciones digitales innovadoras para impulsar el crecimiento de tu negocio en la era moderna.');
  const logoImg = getVal(`${moduleId}_el_footer_brand`, 'logo_img', '');
  const logoWidth = getVal(`${moduleId}_el_footer_brand`, 'logo_width', 120);

  // Element: Nav
  const columns = getVal(`${moduleId}_el_footer_nav`, 'columns', [
    { title: 'Producto', links: [{label: 'Características', url: '#'}, {label: 'Precios', url: '#'}] },
    { title: 'Compañía', links: [{label: 'Sobre Nosotros', url: '#'}, {label: 'Carreras', url: '#'}] }
  ]);
  const titleSize = getVal(`${moduleId}_el_footer_nav`, 'title_size', 14);
  const linkSize = getVal(`${moduleId}_el_footer_nav`, 'link_size', 14);

  // Element: Social
  const socialLinks = getVal(`${moduleId}_el_footer_social`, 'social_links', [
    {icon: 'Twitter', url: '#'},
    {icon: 'Instagram', url: '#'},
    {icon: 'Linkedin', url: '#'}
  ]);
  const iconColor = getVal(`${moduleId}_el_footer_social`, 'icon_color', '#64748B');
  const iconHover = getVal(`${moduleId}_el_footer_social`, 'icon_hover', 'var(--primary-color)');

  // Element: Bottom
  const copyright = getVal(`${moduleId}_el_footer_bottom`, 'copyright', '© 2026 Mi Marca. Todos los derechos reservados.');
  const bottomBg = getVal(`${moduleId}_el_footer_bottom`, 'bottom_bg', 'transparent');

  const getIcon = (iconName: string, size: number = 20) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent size={size} /> : null;
  };

  return (
    <footer 
      className="w-full py-12 @md:py-16 @lg:py-20"
      style={{ 
        backgroundColor: bgColor, 
        color: textColor,
        borderTop: borderTop ? `1px solid ${borderColor}` : 'none'
      }}
    >
      <div 
        className="mx-auto px-6" 
        style={{ 
          maxWidth: `${maxWidth}px`
        }}
      >
        <div className="grid grid-cols-1 @md:grid-cols-12 gap-12 mb-16">
          {/* Brand Column */}
          <div className="@md:col-span-4 space-y-6">
            {showLogo && (
              <div className="flex-shrink-0">
                {logoImg ? (
                  <img 
                    src={logoImg} 
                    alt="Logo" 
                    style={{ width: `${logoWidth}px` }} 
                    className="h-auto object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="font-black tracking-tighter text-xl" style={{ color: 'inherit' }}>
                    MI MARCA
                  </span>
                )}
              </div>
            )}
            <p className="text-sm leading-relaxed opacity-80 max-w-xs">
              {bio}
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4 pt-2">
              {socialLinks.map((social: any, idx: number) => (
                <motion.a
                  key={idx}
                  href={social.url}
                  whileHover={{ y: -3 }}
                  className="transition-colors"
                  style={{ color: iconColor }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = iconHover)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = iconColor)}
                >
                  {getIcon(social.icon, 20)}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="@md:col-span-8 grid grid-cols-2 @sm:grid-cols-3 @lg:grid-cols-4 gap-8">
            {columns.map((col: any, colIdx: number) => (
              <div key={colIdx} className="space-y-5">
                <h4 
                  className="font-bold uppercase tracking-widest"
                  style={{ fontSize: `${titleSize}px`, color: 'inherit' }}
                >
                  {col.title}
                </h4>
                <ul className="space-y-3">
                  {col.links?.map((link: any, linkIdx: number) => (
                    <li key={linkIdx}>
                      <a 
                        href={link.url} 
                        className="transition-all hover:translate-x-1 inline-block opacity-70 hover:opacity-100"
                        style={{ fontSize: `${linkSize}px` }}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div 
          className="pt-8 border-t border-current opacity-10 flex flex-col @md:flex-row items-center justify-between gap-4"
          style={{ backgroundColor: bottomBg }}
        >
          <p className="text-xs font-medium">
            {copyright}
          </p>
          <div className="flex items-center gap-6 text-xs font-medium">
            <a href="#" className="hover:underline">Privacidad</a>
            <a href="#" className="hover:underline">Términos</a>
            <a href="#" className="hover:underline">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
