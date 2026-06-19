import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { Menu as HamburgerIcon, X as CloseIcon } from 'lucide-react';
import { TYPOGRAPHY_SCALE, FONT_WEIGHTS } from '../../../constants/typography';
import { InlineEditableText } from '../InlineEditableText';
import { logDebug } from '../../../utils/debug';
import { SectionAnimation } from '../animations/SectionAnimation';
import { normalizeSectionAnimation } from '../../../constants/moduleAnimations';
import { MODULE_INFO } from '../registry';
import { MenuMode, dedupeMenuLinks, normalizeSectionAnchorId, resolveMenuMode, resolveSectionHref } from '../../../utils/menuNavigation';

const toBoolean = (value: unknown) => value === true || value === 'true' || value === 1 || value === '1';

const normalizeExternalHref = (value: unknown) => {
  const rawUrl = String(value || '').trim();
  if (!rawUrl) return '#top';
  if (/^(https?:|mailto:|tel:|#|\/)/i.test(rawUrl)) return rawUrl;
  return `https://${rawUrl}`;
};

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

export const MenuModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any>,
  logoUrl?: string | null,
  logoWhiteUrl?: string | null,
  isPreviewMode?: boolean,
  isEditorCanvas?: boolean,
  menuMode?: MenuMode,
  automaticMenuItems?: any[],
  stackedTopOffset?: number
}> = ({ moduleId, settingsValues, logoUrl, logoWhiteUrl, isPreviewMode = false, isEditorCanvas = false, menuMode: menuModeProp, automaticMenuItems = [], stackedTopOffset = 0 }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [menuContainerWidth, setMenuContainerWidth] = useState<number | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);

  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    const rawValue = settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
    return rawValue && typeof rawValue === 'object' && 'value' in rawValue && !Array.isArray(rawValue)
      ? rawValue.value
      : rawValue;
  };

  const parseNumberSetting = (value: unknown, fallback: number, min?: number, max?: number) => {
    const parsed = typeof value === 'number'
      ? value
      : parseFloat(String(value ?? '').replace(/[^\d.,-]/g, '').replace(',', '.'));
    const safeValue = Number.isFinite(parsed) ? parsed : fallback;
    return Math.min(max ?? safeValue, Math.max(min ?? safeValue, safeValue));
  };

  // Global Settings
  const sticky = getVal(null, 'sticky', false);
  const rawPosition = getVal(null, 'position', sticky ? 'sticky' : 'relative');
  const position = rawPosition === 'standard' || rawPosition === 'static' || rawPosition === 'normal'
    ? 'relative'
    : rawPosition;
  const rawLayout = getVal(null, 'layout', 'horizontal');
  const layout = rawLayout === 'vertical' ? 'vertical' : 'horizontal';
  const desktopHamburger = toBoolean(getVal(null, 'desktop_hamburger', false));

  // Logo Resolution with Priority
  const logoType = getVal(`${moduleId}_el_menu_logo`, 'logo_type', 'image');
  const logoText = getVal(`${moduleId}_el_menu_logo`, 'logo_text', 'MI MARCA');
  const logoImgSetting = getVal(`${moduleId}_el_menu_logo`, 'logo_img', '');
  const logoImgFallback = settingsValues[`${moduleId}_el_menu_logo_logo_img`] || settingsValues[`el_menu_logo_logo_img`] || '';
  const logoImg = logoImgSetting || logoImgFallback || logoUrl || '';
  
  const logoImgAlt = getVal(`${moduleId}_el_menu_logo`, 'logo_img_alt', '');
  const logoWidth = parseNumberSetting(getVal(`${moduleId}_el_menu_logo`, 'logo_width', 120), 120, 40, 240);
  const rawLogoColor = getVal(`${moduleId}_el_menu_logo`, 'text_color', '#0F172A');
  const logoFontSize = getVal(`${moduleId}_el_menu_logo`, 'font_size', 't3');
  const logoFontWeight = getVal(`${moduleId}_el_menu_logo`, 'font_weight', 'bold');
  const logoLinkType = getVal(`${moduleId}_el_menu_logo`, 'logo_link_type', 'home');
  const logoTargetSectionId = getVal(`${moduleId}_el_menu_logo`, 'logo_target_section_id', '');
  const logoExternalUrl = getVal(`${moduleId}_el_menu_logo`, 'logo_external_url', '');
  const logoHref = (() => {
    if (logoLinkType === 'section' && logoTargetSectionId) {
      return resolveSectionHref(String(logoTargetSectionId));
    }
    if (logoLinkType === 'external') {
      return normalizeExternalHref(logoExternalUrl);
    }
    return '#top';
  })();

  // Element: Items
  const resolvedMenuMode = menuModeProp || resolveMenuMode(moduleId, settingsValues);
  const rawLinks = getVal(`${moduleId}_el_menu_items`, 'links', []);
  const manualLinks = dedupeMenuLinks(Array.isArray(rawLinks) ? rawLinks : []);
  const links = resolvedMenuMode === 'automatic'
    ? dedupeMenuLinks(automaticMenuItems)
    : manualLinks;

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  logDebug('[MENU_PUBLIC_LAYOUT_DEBUG]', {
    moduleId,
    isPreviewMode,
    windowWidth: typeof window !== 'undefined' ? window.innerWidth : null,
    logoType,
    logoText,
    logoImg,
    linksCount: links.length,
    layout,
    position,
    sticky,
    desktopHamburger,
    isOpen: isMobileMenuOpen,
    rawLogoImg: settingsValues?.[`${moduleId}_el_menu_logo_logo_img`],
    rawLogoText: settingsValues?.[`${moduleId}_el_menu_logo_logo_text`],
    rawLogoType: settingsValues?.[`${moduleId}_el_menu_logo_logo_type`],
    rawDesktopHamburger: settingsValues?.[`${moduleId}_global_desktop_hamburger`],
    rawPosition: settingsValues?.[`${moduleId}_global_position`],
    rawLayout: settingsValues?.[`${moduleId}_global_layout`]
  });

  logDebug('[MENU_LOGO_SOURCE_DEBUG]', {
    moduleId,
    logoType,
    logoImg,
    logoUrl,
    rawDeepLogoImg: settingsValues?.[`${moduleId}_el_menu_logo_logo_img`],
    rawRelativeLogoImg: settingsValues?.[`el_menu_logo_logo_img`],
    rawLogoType: settingsValues?.[`${moduleId}_el_menu_logo_logo_type`]
  });

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

    // Observe section anchors instead of array indexes so menu links survive reordering.
    const modules = document.querySelectorAll('[data-module-id]');
    modules.forEach(m => {
      const moduleId = m.getAttribute('data-module-id') || m.id;
      if (!moduleId.includes('menu') && !moduleId.includes('header') && !moduleId.includes('footer')) {
        observer.observe(m);
      }
    });

    return () => observer.disconnect();
  }, [isPreviewMode, links.length]);

  // Global Settings
  const rawAlign = getVal(null, 'align', 'center');
  const align = ['start', 'center', 'end', 'between'].includes(String(rawAlign)) ? String(rawAlign) : 'center';
  const gap = parseNumberSetting(getVal(null, 'gap', 24), 24, 0, 64);
  const rawPaddingY = parseNumberSetting(getVal(null, 'padding_y', 14), 14, 0, 100);
  const paddingY = Number.isFinite(rawPaddingY) ? rawPaddingY : 14;
  const darkMode = toBoolean(getVal(null, 'dark_mode', false));
  const rawBgColor = getVal(null, 'bg_color', 'transparent');
  const glassEffect = getVal(null, 'glass_effect', false);
  const isSticky = position === 'sticky';
  const isFixed = position === 'fixed';
  const isFloating = isSticky || isFixed;
  const fallbackMenuHeight = Math.max(56, paddingY * 2 + 40);
  const [menuHeight, setMenuHeight] = useState(fallbackMenuHeight);
  const hasMeasuredViewport = typeof menuContainerWidth === 'number' && menuContainerWidth > 0;
  const isTabletOrMobileViewport = hasMeasuredViewport ? menuContainerWidth < 1024 : true;
  const visibleLinkLimit = desktopHamburger || isTabletOrMobileViewport ? 0 : 7;
  const forceHamburgerMenu = desktopHamburger || isTabletOrMobileViewport;
  const visibleLinks = forceHamburgerMenu ? [] : links.slice(0, visibleLinkLimit);
  const overflowLinks = forceHamburgerMenu ? links : links.slice(visibleLinkLimit);
  const hasOverflowLinks = overflowLinks.length > 0;
  const dropdownLinks = forceHamburgerMenu ? links : overflowLinks;
  const editorTopOffset = isEditorCanvas ? 60 : 0;
  const effectivePosition: React.CSSProperties['position'] = isEditorCanvas && isFixed
    ? 'sticky'
    : isFixed
      ? 'fixed'
      : isSticky
        ? 'sticky'
        : 'relative';
  const canOpenOverlayMenu = forceHamburgerMenu || hasOverflowLinks;
  const menuPanelId = `${moduleId}-mobile-menu-panel`;
  const topOffset = editorTopOffset + stackedTopOffset;

  const resolvedBgColor = resolveThemeColor(rawBgColor, 'transparent', '#0F172A', darkMode);
  const bgColor = (isFloating && resolvedBgColor === 'transparent') 
    ? (darkMode ? '#1E293B' : '#FFFFFF') 
    : resolvedBgColor;
  const borderRadius = parseFloat(getVal(null, 'border_radius', 12)) || 12;
  const legacyEntranceAnim = getVal(null, 'entrance_anim', true);
  const globalThemeSectionAnimation = settingsValues['global_theme_section_animation'];
  const globalThemeSectionAnimationSpeed = parseFloat(settingsValues['global_theme_section_animation_speed']) || 1;
  const moduleSectionAnimation = getVal(null, 'section_animation', undefined);
  const sectionAnimation = normalizeSectionAnimation(
    globalThemeSectionAnimation ?? moduleSectionAnimation ?? legacyEntranceAnim,
    'fade-up'
  );
  const entranceAnim = false;
  const invertOrder = getVal(null, 'invert_order', false);
  const borderColor = resolveThemeColor(getVal(null, 'border_color', 'rgba(0,0,0,0.05)'), 'rgba(0,0,0,0.05)', 'rgba(255,255,255,0.1)', darkMode);

  // Helper to safely apply opacity to hex colors
  const getGlassColor = (color: string) => {
    if (!glassEffect) return color;
    if (color === 'transparent') return 'transparent';
    if (color.startsWith('#') && color.length === 7) return `${color}CC`;
    return color;
  };

  const fontSize = getVal(`${moduleId}_el_menu_items`, 'font_size', 'p');
  const fontWeight = getVal(`${moduleId}_el_menu_items`, 'font_weight', 'medium');
  const rawTextColor = getVal(`${moduleId}_el_menu_items`, 'text_color', '#0F172A');
  const textColor = resolveThemeColor(rawTextColor, '#0F172A', '#FFFFFF', darkMode);
  const showIcons = toBoolean(getVal(`${moduleId}_el_menu_items`, 'show_icons', false));
  const iconSize = getVal(`${moduleId}_el_menu_items`, 'icon_size', 18);
  const logoColor = resolveThemeColor(rawLogoColor, '#0F172A', '#FFFFFF', darkMode);

  // Element: Style
  const hoverStyle = getVal(`${moduleId}_el_menu_style`, 'hover_style', 'pill');
  const rawHoverBg = getVal(`${moduleId}_el_menu_style`, 'hover_bg', 'rgba(0,0,0,0.05)');
  const hoverBg = resolveThemeColor(rawHoverBg, 'rgba(0,0,0,0.05)', 'rgba(255,255,255,0.1)', darkMode);
  const activeColor = getVal(`${moduleId}_el_menu_style`, 'active_color', 'var(--primary-color)');
  const hoverScale = getVal(`${moduleId}_el_menu_style`, 'hover_scale', true);
  const activeLogo = logoImg || logoImgAlt || logoUrl || logoWhiteUrl || '';

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const updateMenuMeasurements = () => {
      const measuredHeight = nav.getBoundingClientRect().height;
      if (measuredHeight > 0) setMenuHeight(measuredHeight);
      const measuredWidth = nav.offsetWidth || nav.getBoundingClientRect().width;
      if (measuredWidth > 0) setMenuContainerWidth(measuredWidth);
    };

    updateMenuMeasurements();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateMenuMeasurements);
      return () => window.removeEventListener('resize', updateMenuMeasurements);
    }

    const observer = new ResizeObserver(updateMenuMeasurements);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [paddingY, layout, desktopHamburger, links.length, logoWidth, activeLogo, logoText]);

  useEffect(() => {
    if (!canOpenOverlayMenu && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [canOpenOverlayMenu, isMobileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target || !shellRef.current) return;
      if (!shellRef.current.contains(target)) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleNavigationStateChange = () => {
      setIsMobileMenuOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('hashchange', handleNavigationStateChange);
    window.addEventListener('popstate', handleNavigationStateChange);
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hashchange', handleNavigationStateChange);
      window.removeEventListener('popstate', handleNavigationStateChange);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isMobileMenuOpen]);

  const getIcon = (iconName: string) => {
    const moduleIcon = (MODULE_INFO as any)?.[iconName]?.icon;
    if (moduleIcon) {
      return React.createElement(moduleIcon, { size: iconSize });
    }
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
    end: layout === 'vertical' ? 'items-end' : 'justify-end',
    between: layout === 'vertical' ? 'items-stretch' : 'justify-between'
  };

  const linkListAlignmentClass = align === 'between'
    ? 'justify-between w-full'
    : alignmentClasses[align as keyof typeof alignmentClasses];

  const animProps = entranceAnim ? {
    initial: { opacity: 0, y: 10 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5, ease: 'easeOut' as any }
  } : {};

  const navStyle: React.CSSProperties = {
    backgroundColor: getGlassColor(bgColor),
    backdropFilter: glassEffect || isFloating ? 'blur(12px)' : 'none',
    WebkitBackdropFilter: glassEffect || isFloating ? 'blur(12px)' : 'none',
    borderRadius: isFloating
      ? (isEditorCanvas ? '24px 24px 0 0' : '0px')
      : `${borderRadius}px`,
    paddingTop: `${paddingY}px`,
    paddingBottom: `${paddingY}px`,
    width: '100%',
    borderBottom: isFloating ? `1px solid ${borderColor}` : 'none'
  };

  const shellStyle: React.CSSProperties = {
    position: effectivePosition,
    top: effectivePosition === 'sticky' || effectivePosition === 'fixed' ? topOffset : undefined,
    left: effectivePosition === 'fixed' ? 0 : undefined,
    right: effectivePosition === 'fixed' ? 0 : undefined,
    width: '100%',
    zIndex: effectivePosition === 'relative' ? 1 : 1000
  };

  const renderLinks = (shouldCloseOverlay: boolean = false, linkList: any[] = links) => {
    return linkList.map((link: any, idx: number) => {
      const isTitle = link.is_title;
      const linkHref = String(link.href || link.url || '#').trim() || '#';
      const iconKey = link.icon || link.iconName || link.iconId || '';
      const isActive = linkHref === `#${activeSectionId}`;
      
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
          href={linkHref}
          whileHover={hoverScale && !shouldCloseOverlay ? { scale: 1.05 } : {}}
          onClick={(e) => {
            if (linkHref.startsWith('#')) {
              e.preventDefault();
              const targetId = linkHref.substring(1);
              const target =
                document.getElementById(targetId) ||
                document.getElementById(normalizeSectionAnchorId(link.targetSectionId || link.moduleId || targetId));
              if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setActiveSectionId(target.id);
              }
            }
            if (shouldCloseOverlay) setIsMobileMenuOpen(false);
          }}
          className="relative flex w-full items-center gap-3 px-4 py-2.5 transition-all group no-underline"
          style={{ 
            fontSize: `${TYPOGRAPHY_SCALE[fontSize as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 15}px`,
            fontWeight: isActive ? 800 : (FONT_WEIGHTS[fontWeight as keyof typeof FONT_WEIGHTS]?.value || 500),
            color: isActive ? activeColor : textColor
          }}
        >
          {(hoverStyle === 'pill' || isActive) && (
            <motion.span 
              className={`absolute inset-0 transition-all duration-300 ${isActive ? 'opacity-100' : (shouldCloseOverlay ? 'opacity-0' : 'opacity-0 group-hover:opacity-100')}`}
              style={{ 
                backgroundColor: isActive ? 'transparent' : hoverBg, 
                borderRadius: '12px',
                border: isActive ? `1.5px solid ${activeColor}` : 'none',
              }}
            />
          )}

          <div className="relative flex items-center gap-2.5 z-10 w-full">
            {showIcons && iconKey && (
              <span 
                className={`${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'} transition-opacity`}
                style={{ color: isActive ? activeColor : 'inherit' }}
              >
                {getIcon(iconKey)}
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

  const handleInternalAnchorClick = (href: string, fallbackTargetId?: string) => {
    const targetId = href.substring(1);
    const target =
      document.getElementById(targetId) ||
      document.getElementById(normalizeSectionAnchorId(fallbackTargetId || targetId));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSectionId(target.id);
      return true;
    }
    if (targetId === 'top') {
      const scrollParent = navRef.current?.closest('#constructor-canvas-scroll-container') as HTMLElement | null;
      if (scrollParent) {
        scrollParent.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setActiveSectionId('top');
      return true;
    }
    return false;
  };

  const handleLogoClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isPreviewMode && logoType === 'text') {
      event.preventDefault();
      return;
    }
    if (!logoHref.startsWith('#')) return;
    event.preventDefault();
    handleInternalAnchorClick(logoHref, logoTargetSectionId);
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

    return (
      <SectionAnimation animation={sectionAnimation} speed={globalThemeSectionAnimationSpeed} disabled={isFloating}>
        <div className="w-full @container">
        <div ref={shellRef} className="relative w-full min-w-0" style={shellStyle}>
        <nav ref={navRef} className={`w-full transition-all duration-300 ${isFloating ? 'shadow-sm' : ''}`} style={navStyle}>
          <motion.div 
            {...animProps}
            className={`${containerClasses[layout as keyof typeof containerClasses]} mx-auto flex w-full min-w-0 max-w-7xl items-center gap-8 px-4 sm:px-6 ${invertOrder && layout === 'horizontal' ? 'flex-row-reverse' : ''} ${layout === 'vertical' ? alignmentClasses[align as keyof typeof alignmentClasses] : ''}`}
            style={{ gap: `${gap}px` }}
          >
          {/* Logo */}
          <a
            href={logoHref}
            onClick={handleLogoClick}
            className="min-w-0 flex-shrink-0"
            aria-label="Ir al destino del logo"
          >
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
                  color: logoColor,
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
          </a>

          {/* Links Logic */}
          <div className={`flex min-w-0 flex-1 items-center gap-4 sm:gap-6 ${forceHamburgerMenu ? 'justify-end' : (layout === 'horizontal' ? alignmentClasses[align as keyof typeof alignmentClasses] : 'flex-col items-center')}`}>
            {forceHamburgerMenu ? (
              <div className="ml-auto flex items-center justify-end">
                <button 
                  type="button"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="rounded-full p-2 transition-colors hover:bg-black/5"
                  style={{ color: textColor }}
                  aria-label={isMobileMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
                  aria-expanded={isMobileMenuOpen}
                  aria-controls={menuPanelId}
                >
                  {isMobileMenuOpen ? <CloseIcon size={24} /> : <HamburgerIcon size={24} />}
                </button>
              </div>
            ) : (
              <div className={`flex min-w-0 items-center gap-4 ${linkListAlignmentClass}`}>
                {renderLinks(false, visibleLinks)}
                {hasOverflowLinks && (
                  <button 
                    type="button"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="rounded-full p-2 transition-colors hover:bg-black/5"
                    style={{ color: textColor }}
                    aria-label={isMobileMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
                    aria-expanded={isMobileMenuOpen}
                    aria-controls={menuPanelId}
                  >
                    {isMobileMenuOpen ? <CloseIcon size={24} /> : <HamburgerIcon size={24} />}
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Mobile menu and Desktop hamburger menu content */}
        <AnimatePresence>
          {isMobileMenuOpen && canOpenOverlayMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              id={menuPanelId}
              className="absolute left-0 right-0 top-full z-[1001] mt-2 overflow-hidden rounded-3xl border shadow-2xl"
              style={{ 
                backgroundColor: darkMode ? '#1E293B' : '#FFFFFF',
                borderColor: borderColor,
                maxWidth: '100%'
              }}
            >
              <div className="flex max-h-[min(70vh,32rem)] flex-col gap-2 overflow-y-auto p-6">
                <div className="mb-4 flex items-center justify-between border-b pb-4 border-border/50">
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Navegación</span>
                   <button type="button" onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg p-1 transition-colors hover:bg-black/5">
                     <CloseIcon size={16} style={{ color: textColor }} />
                   </button>
                </div>
                {renderLinks(true, dropdownLinks)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      </div>
      {isFixed && (
        <div
          aria-hidden="true"
          className="w-full shrink-0"
          style={{ height: `${menuHeight || fallbackMenuHeight}px` }}
        />
      )}
        </div>
      </SectionAnimation>
  );
};
