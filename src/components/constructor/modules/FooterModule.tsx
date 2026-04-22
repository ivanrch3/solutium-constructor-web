import React from 'react';
import { motion } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { TYPOGRAPHY_SCALE, FONT_WEIGHTS } from '../../../constants/typography';
import { TextRenderer } from '../TextRenderer';

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
  const paddingY = parseFloat(getVal(null, 'padding_y', 80)) || 80;
  const maxWidth = parseFloat(getVal(null, 'max_width', 1400)) || 1400;
  const darkMode = getVal(null, 'dark_mode', false);
  const bgColor = darkMode ? '#0F172A' : getVal(null, 'bg_color', '#F8FAFC');
  const textColor = darkMode ? '#94A3B8' : getVal(null, 'text_color', '#475569');
  const borderTop = getVal(null, 'border_top', true);
  const borderColor = darkMode ? 'rgba(255,255,255,0.1)' : getVal(null, 'border_color', '#E2E8F0');

  // Element: Brand
  const showLogo = getVal(`${moduleId}_el_footer_brand`, 'show_logo', true);
  const bio = getVal(`${moduleId}_el_footer_brand`, 'bio', 'Creamos soluciones digitales innovadoras para impulsar el crecimiento de tu negocio en la era moderna.');
  const logoImg = getVal(`${moduleId}_el_footer_brand`, 'logo_img', '');
  const logoWidth = parseFloat(getVal(`${moduleId}_el_footer_brand`, 'logo_width', 120)) || 120;

  // Element: Nav
  const columns = getVal(`${moduleId}_el_footer_nav`, 'columns', [
    { title: 'Producto', links: [{label: 'Características', url: '#'}, {label: 'Precios', url: '#'}] },
    { title: 'Compañía', links: [{label: 'Sobre Nosotros', url: '#'}, {label: 'Carreras', url: '#'}] }
  ]);
  const titleSize = getVal(`${moduleId}_el_footer_nav`, 'title_size', 's');
  const titleWeight = getVal(`${moduleId}_el_footer_nav`, 'title_weight', 'bold');
  const linkSize = getVal(`${moduleId}_el_footer_nav`, 'link_size', 's');
  const linkWeight = getVal(`${moduleId}_el_footer_nav`, 'link_weight', 'normal');

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
  const newsInputBg = darkMode ? '#1E293B' : getVal(`${moduleId}_el_footer_newsletter`, 'input_bg', '#FFFFFF');
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

  const getTypographyStyle = (sizeToken: string, weightToken: string, alignToken?: string) => {
    const size = TYPOGRAPHY_SCALE[sizeToken as keyof typeof TYPOGRAPHY_SCALE] || TYPOGRAPHY_SCALE.p;
    const weight = FONT_WEIGHTS[weightToken as keyof typeof FONT_WEIGHTS] || FONT_WEIGHTS.normal;
    
    return {
      fontSize: `${size.fontSize}px`,
      lineHeight: size.lineHeight,
      fontWeight: weight.value,
      textAlign: (alignToken && alignToken !== 'inherit') ? alignToken : undefined
    } as React.CSSProperties;
  };

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
        borderTopWidth: borderTop ? '1px' : '0px',
        borderTopStyle: 'solid',
        borderTopColor: borderColor
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
                  {(darkMode ? (logoWhiteUrl || logoImg) : (logoUrl || logoImg)) ? (
                    <img 
                      src={darkMode ? (logoWhiteUrl || logoImg) : (logoUrl || logoImg)} 
                      alt="Logo" 
                      style={{ width: `${logoWidth}px` }} 
                      className="h-auto object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="font-black tracking-tighter text-xl" style={{ color: darkMode ? '#FFFFFF' : 'inherit' }}>
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
                  className="uppercase tracking-widest"
                  style={{ 
                    ...getTypographyStyle(titleSize as any, titleWeight),
                    color: darkMode ? '#FFFFFF' : 'inherit' 
                  }}
                >
                  <TextRenderer 
                    text={col.title}
                    highlightType={getVal(`${moduleId}_el_footer_nav`, 'title_highlight_type', 'gradient')}
                    highlightColor={getVal(`${moduleId}_el_footer_nav`, 'title_highlight_color', '#3B82F6')}
                    highlightGradient={getVal(`${moduleId}_el_footer_nav`, 'title_highlight_gradient', 'linear-gradient(to right, #3B82F6, #2563EB)')}
                    highlightBold={getVal(`${moduleId}_el_footer_nav`, 'title_highlight_bold', true)}
                  />
                </h4>
                <ul className="space-y-3">
                  {col.links?.map((link: any, linkIdx: number) => (
                    <li key={linkIdx}>
                      <a 
                        href={link.url} 
                        className="transition-all hover:translate-x-1 inline-block opacity-70 hover:opacity-100"
                        style={{ 
                          fontSize: `${TYPOGRAPHY_SCALE[linkSize as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 14}px`,
                          fontWeight: FONT_WEIGHTS[linkWeight as keyof typeof FONT_WEIGHTS]?.value || 400
                        }}
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
                <h4 className="font-bold uppercase tracking-widest" style={{ fontSize: `${TYPOGRAPHY_SCALE[titleSize as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 14}px`, color: darkMode ? '#FFFFFF' : 'inherit' }}>
                  <TextRenderer 
                    text={newsTitle}
                    highlightType={getVal(`${moduleId}_el_footer_newsletter`, 'title_highlight_type', 'gradient')}
                    highlightColor={getVal(`${moduleId}_el_footer_newsletter`, 'title_highlight_color', '#3B82F6')}
                    highlightGradient={getVal(`${moduleId}_el_footer_newsletter`, 'title_highlight_gradient', 'linear-gradient(to right, #3B82F6, #2563EB)')}
                    highlightBold={getVal(`${moduleId}_el_footer_newsletter`, 'title_highlight_bold', true)}
                  />
                </h4>
                <p className="text-sm opacity-70 leading-relaxed">
                  {newsDesc}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <input 
                  type="email" 
                  placeholder={newsPlaceholder}
                  className={`px-4 py-3 rounded-xl text-sm border focus:ring-2 focus:ring-primary/20 outline-none transition-all ${darkMode ? 'border-white/10 text-white' : 'border-slate-200 text-slate-900'}`}
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
          className="pt-8 flex flex-col @md:flex-row items-center justify-between gap-4"
          style={{ 
            backgroundColor: bottomBg,
            borderTopWidth: '1px',
            borderTopStyle: 'solid',
            borderTopColor: 'currentColor'
          }}
        >
          <p className="text-xs font-medium opacity-70">
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
