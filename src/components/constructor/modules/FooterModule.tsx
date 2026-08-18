import React from 'react';
import { motion } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { TYPOGRAPHY_SCALE, FONT_WEIGHTS } from '../../../constants/typography';
import { TextRenderer } from '../TextRenderer';
import { InlineEditableText } from '../InlineEditableText';
import { useEditorStore } from '../../../store/editorStore';
import { resolveFooterSocialLinks, SOCIAL_PLATFORMS, normalizeSocialPlatform } from '../../../utils/socialUtils';
import { composeFooterCopyright, normalizeFooterV2Config, resolveFooterBrandLogo, type FooterColumn, type FooterLink } from './footerConfig';
import { SectionAnimation } from '../animations/SectionAnimation';
import { normalizeSectionAnimation } from '../../../constants/moduleAnimations';

const toBoolean = (value: unknown) => value === true || value === 'true' || value === 1 || value === '1';

const resolveThemeColor = (
  value: string | undefined,
  lightDefault: string,
  darkDefault: string,
  darkMode: boolean
) => {
  const safeValue = String(value || '').trim();
  const safeLight = String(lightDefault || '').trim().toLowerCase();
  if (!darkMode) return safeValue || lightDefault;
  if (!safeValue || safeValue.toLowerCase() === safeLight) return darkDefault;
  return safeValue;
};

const footerHref = (value: string, type: 'phone' | 'email' | 'whatsapp') => {
  const clean = String(value || '').trim();
  if (!clean) return '';
  if (clean.startsWith('tel:') || clean.startsWith('mailto:') || clean.startsWith('http://') || clean.startsWith('https://')) return clean;
  if (type === 'phone') return `tel:${clean.replace(/[^+\d]/g, '')}`;
  if (type === 'email') return `mailto:${clean}`;
  return `https://wa.me/${clean.replace(/\D/g, '')}`;
};

const V2FooterLink: React.FC<{ link: FooterLink }> = ({ link }) => (
  <a href={link.url} target={link.target} rel={link.target === '_blank' ? 'noreferrer' : undefined} className="break-words opacity-70 transition-opacity hover:opacity-100 hover:underline">{link.label}</a>
);

const FooterV2Renderer: React.FC<{
  config: ReturnType<typeof normalizeFooterV2Config>;
  moduleId: string;
  project?: any;
  logoUrl?: string | null;
  logoWhiteUrl?: string | null;
  isPreviewMode: boolean;
  bgColor: string;
  textColor: string;
  borderTop: any;
  borderColor: string;
  maxWidth: number;
  sectionAnimation: any;
  animationSpeed: number;
  darkMode: boolean;
}> = ({ config, project, logoUrl, logoWhiteUrl, isPreviewMode, bgColor, textColor, borderTop, borderColor, maxWidth, sectionAnimation, animationSpeed, darkMode }) => {
  if (!config) return null;
  const desktopClass = ({ 1: '@lg:grid-cols-1', 2: '@lg:grid-cols-2', 3: '@lg:grid-cols-3', 4: '@lg:grid-cols-4' } as Record<number, string>)[config.columns.length] || '@lg:grid-cols-1';
  const titleColor = darkMode ? '#FFFFFF' : 'var(--text-color)';
  const renderColumn = (column: FooterColumn) => {
    const heading = column.type !== 'brand' ? column.title : undefined;
    const header = heading ? <h4 className="break-words font-bold uppercase tracking-widest" style={{ color: titleColor }}>{heading}</h4> : null;
    if (column.type === 'brand') {
      const image = resolveFooterBrandLogo(column, logoUrl, logoWhiteUrl, project?.logoUrl);
      return <div className="min-w-0 space-y-4">{column.showLogo && image && <img src={image} alt={column.name || 'Logo'} className="h-auto max-w-full object-contain" referrerPolicy="no-referrer" />}{column.showName && column.name && <h4 className="break-words text-lg font-bold" style={{ color: titleColor }}>{column.name}</h4>}{column.showDescription && column.description && <p className="break-words text-sm leading-relaxed opacity-80">{column.description}</p>}</div>;
    }
    if (column.type === 'menu') return <div className="min-w-0 space-y-4">{header}<ul className="space-y-3 text-sm">{column.links.map((link) => <li key={link.id}><V2FooterLink link={link} /></li>)}</ul></div>;
    if (column.type === 'contact') return <div className="min-w-0 space-y-4">{header}<div className="space-y-3 text-sm">{column.showPhone && column.phone && <a className="block break-words opacity-80 hover:underline" href={footerHref(column.phone, 'phone')}>{column.phone}</a>}{column.showWhatsapp && column.whatsapp && <a className="block break-words opacity-80 hover:underline" href={footerHref(column.whatsapp, 'whatsapp')}>{column.whatsapp}</a>}{column.showEmail && column.email && <a className="block break-words opacity-80 hover:underline" href={footerHref(column.email, 'email')}>{column.email}</a>}{column.showAddress && column.address && <span className="block break-words opacity-80">{column.address}</span>}</div></div>;
    if (column.type === 'social') return <div className="min-w-0 space-y-4">{header}<div className={column.presentation === 'icon_label' ? 'space-y-3 text-sm' : 'flex flex-wrap items-center gap-4'}>{column.links.filter((link) => link.url).map((link) => { const platform = normalizeSocialPlatform(link.platform) || 'website'; const definition = SOCIAL_PLATFORMS[platform as keyof typeof SOCIAL_PLATFORMS]; const label = link.label || definition?.label || platform; return <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-2 break-words opacity-80 hover:opacity-100">{definition?.icon && getIconElement(definition.icon)}{column.presentation === 'icon_label' && <span>{label}</span>}</a>; })}</div></div>;
    if (column.type === 'text') return <div className="min-w-0 space-y-4">{header}{column.content && <p className="break-words whitespace-pre-wrap text-sm leading-relaxed opacity-80">{column.content}</p>}</div>;
    return <div className="min-w-0 space-y-4">{header}<div className="space-y-2 text-sm">{column.days.map((day) => <div key={day.id} className="flex flex-wrap justify-between gap-2"><span>{day.label}</span><span className="opacity-75">{day.closed ? 'Cerrado' : `${day.open || ''} - ${day.close || ''}`}</span></div>)}</div></div>;
  };
  const getIconElement = (iconName?: string) => { const Icon = (LucideIcons as any)[iconName || 'Globe']; return Icon ? <Icon size={18} /> : null; };
  const bottomCopyright = composeFooterCopyright(config.bottomBar, new Date().getFullYear());
  return <SectionAnimation animation={sectionAnimation} speed={animationSpeed}><footer className="w-full py-12 @md:py-16 @lg:py-20" style={{ backgroundColor: bgColor, color: textColor, borderTopWidth: borderTop ? '1px' : '0px', borderTopStyle: 'solid', borderTopColor: borderColor }}><div className="mx-auto px-6" style={{ maxWidth: `${maxWidth}px` }}><div className={`grid grid-cols-1 @md:grid-cols-2 ${desktopClass} gap-8 @lg:gap-10 mb-16`}>{config.columns.map((column) => <div key={column.id}>{renderColumn(column)}</div>)}</div>{config.bottomBar.enabled && <div className="flex flex-col items-center justify-between gap-4 border-t border-current/30 pt-8 @md:flex-row"><p className="break-words text-xs font-medium opacity-70">{bottomCopyright}</p><div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium">{config.bottomBar.legalLinks.map((link) => <V2FooterLink key={link.id} link={link} />)}</div></div>}</div></footer></SectionAnimation>;
};

export const FooterModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any>,
  logoUrl?: string | null,
  logoWhiteUrl?: string | null,
  isPreviewMode?: boolean
}> = ({ moduleId, settingsValues, logoUrl, logoWhiteUrl, isPreviewMode = false }) => {
  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  };

  // Global Settings
  const paddingY = parseFloat(getVal(null, 'padding_y', 80)) || 80;
  const maxWidth = parseFloat(getVal(null, 'max_width', 1400)) || 1400;
  const globalThemeSectionAnimation = settingsValues['global_theme_section_animation'];
  const globalThemeSectionAnimationSpeed = parseFloat(settingsValues['global_theme_section_animation_speed']) || 1;
  const moduleSectionAnimation = getVal(null, 'section_animation', undefined);
  const legacyEntranceAnim = getVal(null, 'entrance_anim', 'none');
  const sectionAnimation = normalizeSectionAnimation(
    globalThemeSectionAnimation ?? moduleSectionAnimation ?? legacyEntranceAnim,
    'fade-up'
  );
  const darkMode = toBoolean(getVal(null, 'dark_mode', false));
  const rawBgColor = getVal(null, 'bg_color', '#F8FAFC');
  const bgColor = resolveThemeColor(rawBgColor, '#F8FAFC', '#0F172A', darkMode);
  const rawTextColor = getVal(null, 'text_color', '#475569');
  const textColor = resolveThemeColor(rawTextColor, '#475569', '#94A3B8', darkMode);
  const borderTop = getVal(null, 'border_top', true);
  const rawBorderColor = getVal(null, 'border_color', '#E2E8F0');
  const borderColor = resolveThemeColor(rawBorderColor, '#E2E8F0', 'rgba(255,255,255,0.1)', darkMode);
  const sectionTitleColor = resolveThemeColor(undefined, '#0F172A', '#FFFFFF', darkMode);
  const project = (useEditorStore.getState() as any).project;
  const v2Config = normalizeFooterV2Config(settingsValues[`${moduleId}_el_footer_config`], project);
  if (v2Config) {
    return <FooterV2Renderer config={v2Config} moduleId={moduleId} project={project} logoUrl={logoUrl} logoWhiteUrl={logoWhiteUrl} isPreviewMode={isPreviewMode} bgColor={bgColor} textColor={textColor} borderTop={borderTop} borderColor={borderColor} maxWidth={maxWidth} sectionAnimation={sectionAnimation} animationSpeed={globalThemeSectionAnimationSpeed} darkMode={darkMode} />;
  }

  // Element: Brand
  const showLogo = getVal(`${moduleId}_el_footer_brand`, 'show_logo', true);
  const defaultBio = 'Creamos soluciones digitales innovadoras para impulsar el crecimiento de tu negocio en la era moderna.';
  const bio = getVal(`${moduleId}_el_footer_brand`, 'bio', defaultBio);
  const logoImg = getVal(`${moduleId}_el_footer_brand`, 'logo_img', '');
  const logoWidth = parseFloat(getVal(`${moduleId}_el_footer_brand`, 'logo_width', 120)) || 120;
  const resolvedLogo = logoImg || logoUrl || logoWhiteUrl || '';

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
  const rawSocialLinks = getVal(`${moduleId}_el_footer_social`, 'social_links', []);
  const socialLinks = resolveFooterSocialLinks(rawSocialLinks, project?.socials, { debug: !isPreviewMode && (window as any).SOLUTIUM_DEBUG_RENDER, moduleId });
  
  const rawIconColor = getVal(`${moduleId}_el_footer_social`, 'icon_color', '#64748B');
  const iconColor = resolveThemeColor(rawIconColor, '#64748B', '#94A3B8', darkMode);
  const iconHover = getVal(`${moduleId}_el_footer_social`, 'icon_hover', 'var(--primary-color)');

  // Element: Contact
  const showContact = getVal(`${moduleId}_el_footer_contact`, 'show_contact', true);
  const address = getVal(`${moduleId}_el_footer_contact`, 'address', 'Calle Innovación 123, Ciudad Digital');
  const phone = getVal(`${moduleId}_el_footer_contact`, 'phone', '+1 (555) 000-0000');
  const email = getVal(`${moduleId}_el_footer_contact`, 'email', 'hola@mimarca.com');
  const contactIconColor = getVal(`${moduleId}_el_footer_contact`, 'icon_color', 'var(--primary-color)');
  const resolvedBio = (bio === defaultBio && (project?.industry || project?.name))
    ? (project?.industry || `Servicios profesionales de ${project?.name}`)
    : bio;
  const resolvedAddress = (address === 'Calle Innovación 123, Ciudad Digital' && project?.address) ? project.address : address;
  const resolvedPhone = (phone === '+1 (555) 000-0000' && project?.whatsapp) ? project.whatsapp : phone;
  const resolvedEmail = (email === 'hola@mimarca.com' && project?.email) ? project.email : email;

  // Element: Newsletter
  const showNewsletter = getVal(`${moduleId}_el_footer_newsletter`, 'show_newsletter', true);
  const newsTitle = getVal(`${moduleId}_el_footer_newsletter`, 'news_title', 'Suscríbete');
  const newsDesc = getVal(`${moduleId}_el_footer_newsletter`, 'news_desc', 'Recibe las últimas noticias y ofertas.');
  const newsPlaceholder = getVal(`${moduleId}_el_footer_newsletter`, 'placeholder', 'Tu email');
  const newsBtnText = getVal(`${moduleId}_el_footer_newsletter`, 'btn_text', 'Unirse');
  const rawNewsInputBg = getVal(`${moduleId}_el_footer_newsletter`, 'input_bg', '#FFFFFF');
  const newsInputBg = resolveThemeColor(rawNewsInputBg, '#FFFFFF', '#1E293B', darkMode);
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
    <SectionAnimation animation={sectionAnimation} speed={globalThemeSectionAnimationSpeed}>
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
                  {resolvedLogo ? (
                    <img 
                      src={resolvedLogo} 
                      alt="Logo" 
                      style={{ width: `${logoWidth}px` }} 
                      className="h-auto object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="font-black tracking-tighter text-xl" style={{ color: sectionTitleColor }}>
                      MI MARCA
                    </span>
                  )}
                </div>
              )}
              <p className="text-sm leading-relaxed opacity-80 max-w-xs">
                <InlineEditableText
                  moduleId={moduleId}
                  elementId={`${moduleId}_el_footer_brand`}
                  settingId="bio"
                    value={resolvedBio}
                  isPreviewMode={isPreviewMode}
                />
              </p>
            </div>

            {showContact && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 text-sm opacity-80">
                  <div style={{ color: contactIconColor }}>
                    <LucideIcons.MapPin size={18} />
                  </div>
                  <span>
                    <InlineEditableText
                      moduleId={moduleId}
                      elementId={`${moduleId}_el_footer_contact`}
                      settingId="address"
                      value={resolvedAddress}
                      isPreviewMode={isPreviewMode}
                    />
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm opacity-80">
                  <div style={{ color: contactIconColor }}>
                    <LucideIcons.Phone size={18} />
                  </div>
                  <span>
                    <InlineEditableText
                      moduleId={moduleId}
                      elementId={`${moduleId}_el_footer_contact`}
                      settingId="phone"
                      value={resolvedPhone}
                      isPreviewMode={isPreviewMode}
                    />
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm opacity-80">
                  <div style={{ color: contactIconColor }}>
                    <LucideIcons.Mail size={18} />
                  </div>
                  <span>
                    <InlineEditableText
                      moduleId={moduleId}
                      elementId={`${moduleId}_el_footer_contact`}
                      settingId="email"
                      value={resolvedEmail}
                      isPreviewMode={isPreviewMode}
                    />
                  </span>
                </div>
              </div>
            )}
            
            {/* Social Links */}
            <div className="flex items-center gap-4 pt-2">
              {socialLinks.filter((s: any) => s.url && s.url !== '' && s.url !== '#').map((social: any, idx: number) => (
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
                      color: sectionTitleColor 
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
                <h4 className="font-bold uppercase tracking-widest" style={{ fontSize: `${TYPOGRAPHY_SCALE[titleSize as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 14}px`, color: sectionTitleColor }}>
                  <InlineEditableText
                    moduleId={moduleId}
                    elementId={`${moduleId}_el_footer_newsletter`}
                    settingId="news_title"
                    value={newsTitle}
                    isPreviewMode={isPreviewMode}
                  >
                    <TextRenderer 
                      text={newsTitle}
                      highlightType={getVal(`${moduleId}_el_footer_newsletter`, 'title_highlight_type', 'gradient')}
                      highlightColor={getVal(`${moduleId}_el_footer_newsletter`, 'title_highlight_color', '#3B82F6')}
                      highlightGradient={getVal(`${moduleId}_el_footer_newsletter`, 'title_highlight_gradient', 'linear-gradient(to right, #3B82F6, #2563EB)')}
                      highlightBold={getVal(`${moduleId}_el_footer_newsletter`, 'title_highlight_bold', true)}
                    />
                  </InlineEditableText>
                </h4>
                <p className="text-sm opacity-70 leading-relaxed">
                  <InlineEditableText
                    moduleId={moduleId}
                    elementId={`${moduleId}_el_footer_newsletter`}
                    settingId="news_desc"
                    value={newsDesc}
                    isPreviewMode={isPreviewMode}
                  />
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <input 
                    type="email" 
                    readOnly
                    placeholder={newsPlaceholder}
                    className={`w-full px-4 py-3 rounded-xl text-sm border focus:ring-2 focus:ring-primary/20 outline-none transition-all ${darkMode ? 'border-white/10 text-white' : 'border-slate-200 text-slate-900'}`}
                    style={{ backgroundColor: newsInputBg }}
                  />
                  <div className="absolute inset-0 z-10 flex items-center px-4 pointer-events-none opacity-0">
                    <InlineEditableText
                      moduleId={moduleId}
                      elementId={`${moduleId}_el_footer_newsletter`}
                      settingId="placeholder"
                      value={newsPlaceholder}
                      isPreviewMode={isPreviewMode}
                    />
                  </div>
                </div>
                <button 
                  className="px-4 py-3 rounded-xl text-sm font-bold shadow-lg shadow-primary/10 hover:opacity-90 transition-all"
                  style={{ backgroundColor: newsBtnBg, color: newsBtnColor }}
                >
                  <InlineEditableText
                    moduleId={moduleId}
                    elementId={`${moduleId}_el_footer_newsletter`}
                    settingId="btn_text"
                    value={newsBtnText}
                    isPreviewMode={isPreviewMode}
                  />
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
            <InlineEditableText
              moduleId={moduleId}
              elementId={`${moduleId}_el_footer_bottom`}
              settingId="copyright"
              value={copyright}
              isPreviewMode={isPreviewMode}
            />
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
    </SectionAnimation>
  );
};
