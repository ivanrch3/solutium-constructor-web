import React from 'react';
import { motion } from 'motion/react';
import * as LucideIcons from 'lucide-react';

export const FooterModule: React.FC<{ 
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

  // Element: Contact
  const showContact = getVal(`${moduleId}_el_footer_contact`, 'show_contact', true);
  const address = getVal(`${moduleId}_el_footer_contact`, 'address', 'Calle Innovación 123, Ciudad Digital');
  const phone = getVal(`${moduleId}_el_footer_contact`, 'phone', '+1 (555) 000-0000');
  const email = getVal(`${moduleId}_el_footer_contact`, 'email', 'hola@mimarca.com');
  const contactIconColor = getVal(`${moduleId}_el_footer_contact`, 'icon_color', 'var(--primary-color)');

  // Element: Newsletter
  const showNewsletter = getVal(`${moduleId}_el_footer_newsletter`, 'show_newsletter', true);
  const newsTitle = getVal(`${moduleId}_el_footer_newsletter`, 'news_title', 'Suscríbete');
  const newsDesc = getVal(`${moduleId}_el_footer_newsletter`, 'news_desc', 'Recibe las últimas noticias y ofertas.');
  const newsPlaceholder = getVal(`${moduleId}_el_footer_newsletter`, 'placeholder', 'Tu email');
  const newsBtnText = getVal(`${moduleId}_el_footer_newsletter`, 'btn_text', 'Unirse');
  const newsInputBg = getVal(`${moduleId}_el_footer_newsletter`, 'input_bg', '#FFFFFF');
  const newsBtnBg = getVal(`${moduleId}_el_footer_newsletter`, 'btn_bg', 'var(--primary-color)');
  const newsBtnColor = getVal(`${moduleId}_el_footer_newsletter`, 'btn_color', '#FFFFFF');

  // Element: Bottom
  const copyright = getVal(`${moduleId}_el_footer_bottom`, 'copyright', '© 2026 Mi Marca. Todos los derechos reservados.');
  const legalLinks = getVal(`${moduleId}_el_footer_bottom`, 'legal_links', [
    {label: 'Privacidad', url: '#'},
    {label: 'Términos', url: '#'},
    {label: 'Cookies', url: '#'}
  ]);
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
          {/* Brand & Contact Column */}
          <div className="@md:col-span-4 space-y-8">
            <div className="space-y-6">
              {showLogo && (
                <div className="flex-shrink-0">
                  {(logoUrl || logoImg) ? (
                    <img 
                      src={logoUrl || logoImg} 
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
            </div>

            {showContact && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 text-sm opacity-80">
                  <div style={{ color: contactIconColor }}>
                    <LucideIcons.MapPin size={18} />
                  </div>
                  <span>{address}</span>
                </div>
                <div className="flex items-center gap-3 text-sm opacity-80">
                  <div style={{ color: contactIconColor }}>
                    <LucideIcons.Phone size={18} />
                  </div>
                  <span>{phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm opacity-80">
                  <div style={{ color: contactIconColor }}>
                    <LucideIcons.Mail size={18} />
                  </div>
                  <span>{email}</span>
                </div>
              </div>
            )}
            
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
          <div className="@md:col-span-5 grid grid-cols-2 gap-8">
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

          {/* Newsletter Column */}
          {showNewsletter && (
            <div className="@md:col-span-3 space-y-6">
              <div className="space-y-2">
                <h4 className="font-bold uppercase tracking-widest" style={{ fontSize: `${titleSize}px` }}>
                  {newsTitle}
                </h4>
                <p className="text-sm opacity-70 leading-relaxed">
                  {newsDesc}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <input 
                  type="email" 
                  placeholder={newsPlaceholder}
                  className="px-4 py-3 rounded-xl text-sm border border-border focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  style={{ backgroundColor: newsInputBg }}
                />
                <button 
                  className="px-4 py-3 rounded-xl text-sm font-bold shadow-lg shadow-primary/10 hover:opacity-90 transition-all"
                  style={{ backgroundColor: newsBtnBg, color: newsBtnColor }}
                >
                  {newsBtnText}
                </button>
              </div>
            </div>
          )}
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
            {legalLinks.map((link: any, idx: number) => (
              <a key={idx} href={link.url} className="hover:underline opacity-70 hover:opacity-100 transition-opacity">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
