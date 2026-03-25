import React, { useState, useEffect } from 'react';
import { Menu, Search, Globe, Share2, X, ChevronDown, ArrowRight, Sparkles, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Typography } from '../ui/Typography';
import { getModuleDefinition } from '../../modules/registry';
import { usePageLayout } from '../../context/PageLayoutContext';
import { useSolutiumContext } from '../../context/SatelliteContext';

interface HeaderModuleProps {
  data: any;
  modules?: any[];
  isPreview?: boolean;
  onCTA: (e: React.MouseEvent) => void;
  onUpdate?: (data: any) => void;
}

const navVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1 + i * 0.05,
      duration: 0.5,
      ease: [0.215, 0.61, 0.355, 1]
    }
  })
};

export const HeaderModule = ({ data, modules = [], isPreview, onCTA, onUpdate }: HeaderModuleProps) => {
  const { payload } = useSolutiumContext();
  const { previewDevice } = usePageLayout();
  const isMobileSimulated = previewDevice === 'mobile';
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const projectLogo = payload?.projectsData?.logoUrl || payload?.projectData?.logoUrl;
  const projectBusinessName = payload?.projectsData?.name || payload?.projectData?.name || payload?.profilesData?.businessName || payload?.userProfile?.businessName;

  const layoutType = data?.layoutType || 'logo-left';
  const scrollMode = data?.scrollMode || (data?.isSticky ? 'sticky' : 'static');
  const bgType = data?.bgType || 'glass';
  const hoverEffect = data?.hoverEffect || 'underline';
  const height = data?.height || 80;
  const theme = data?.theme || 'light';

  const isDark = theme === 'dark';
  const themeTextClass = isDark ? 'text-white' : 'text-text';
  const themeTextMutedClass = isDark ? 'text-white/60' : 'text-text/60';
  const themeBgClass = isDark ? 'bg-[#0f172a]' : 'bg-surface';
  const themeBorderClass = isDark ? 'border-white/10' : 'border-text/10';

  const socials = data?.socials || { useProjectSocials: true };
  const isUsingProject = socials.useProjectSocials !== false;
  const projectSocials = payload?.projectsData?.socials || payload?.projectData?.socials || {};
  const currentSocials = isUsingProject ? projectSocials : socials;

  const hasSocials = data?.showSocials && Object.keys(currentSocials).some(k => k !== 'useProjectSocials' && currentSocials[k]);

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return Facebook;
      case 'twitter': return Twitter;
      case 'instagram': return Instagram;
      case 'linkedin': return Linkedin;
      case 'youtube': return Youtube;
      default: return Globe;
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Scrolled state for transparent -> solid transition
      setIsScrolled(currentScrollY > 20);

      // Smart hide logic
      if (scrollMode === 'smart-hide') {
        if (currentScrollY > lastScrollY && currentScrollY > height) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      } else {
        setIsVisible(true);
      }

      // Reading progress
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const heightDoc = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / heightDoc) * 100;
      setScrollProgress(scrolled);

      setLastScrollY(currentScrollY);

      // Active section detection
      const sectionIds = menuItems.map((item: any) => item.link?.startsWith('#') ? item.link.substring(1) : null).filter(Boolean);
      let found = false;
      for (const id of sectionIds) {
        const element = document.getElementById(id) || document.getElementById(`module-${id}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(id);
            found = true;
            break;
          }
        }
      }
      if (!found && currentScrollY < 100) setActiveSection(null);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, scrollMode, height]);

  const handleTextUpdate = (path: string, value: string) => {
    if (onUpdate) {
      const newData = { ...data };
      const parts = path.split('.');
      let current = newData;
      for (let i = 0; i < parts.length - 1; i++) {
        current[parts[i]] = { ...current[parts[i]] };
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      onUpdate(newData);
    }
  };

  // Generate menu items from modules if available
  const generatedMenuItems = modules
    .filter(m => !['top-bar', 'header', 'footer', 'spacer'].includes(m.type) && !m.data?.hiddenInMenu)
    .map(m => {
      const moduleDef = getModuleDefinition(m.type);
      let label = m.data?.navLabel || moduleDef?.label || m.data?.title || m.data?.heading || m.type;
      
      if ((label === m.data?.title || label === m.data?.heading) && label.length > 20) {
        label = moduleDef?.label || m.type;
      }

      return {
        label: label.charAt(0).toUpperCase() + label.slice(1),
        link: `#module-${m.id}`,
        id: m.id
      };
    });

  const menuItems = generatedMenuItems.length > 0 ? generatedMenuItems : (data?.menuItems || [
    { label: 'Inicio', link: '#' },
    { label: 'Características', link: '#' },
    { label: 'Precios', link: '#' }
  ]);

  const getBgClass = () => {
    const isGlass = data?.glassmorphism !== false;
    const isTransparentAtTop = data?.transparentAtTop === true;

    if (isTransparentAtTop && !isScrolled) {
      return 'bg-transparent border-transparent';
    }

    if (isGlass) {
      return isDark 
        ? 'bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/10 shadow-xl shadow-black/5'
        : 'bg-surface/80 backdrop-blur-xl border-b border-text/10 shadow-xl shadow-black/5';
    }
    
    return `${themeBgClass} border-b ${themeBorderClass} shadow-xl shadow-black/5`;
  };

  const getHoverClass = (isActive: boolean) => {
    const base = "relative transition-all duration-300 ";
    const activeColor = isActive ? "text-primary" : `${themeTextMutedClass} hover:text-primary`;
    
    if (hoverEffect === 'underline') {
      return base + activeColor + " after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-primary after:transition-transform after:duration-500 after:ease-out " + (isActive ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100");
    }
    if (hoverEffect === 'pill') {
      return base + (isActive ? "bg-primary/10 text-primary px-5 py-2.5 rounded-full" : `${themeTextMutedClass} hover:bg-text/5 px-5 py-2.5 rounded-full`);
    }
    return base + activeColor;
  };

  const renderLogo = () => {
    const logoType = data?.logoType || 'inherited';
    let logoSrc = '';
    
    if (logoType === 'inherited') {
      logoSrc = projectLogo;
    } else if (logoType === 'custom') {
      logoSrc = data?.logoImage;
    }

    const logoText = data?.logoText || projectBusinessName || 'Constructor Web';

    return (
      <a 
        href="#top" 
        onClick={(e) => {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className="flex items-center gap-3 flex-shrink-0 hover:opacity-80 transition-all duration-300 group"
      >
        {logoType !== 'none' && logoSrc ? (
          <motion.img 
            src={logoSrc} 
            alt="Logo" 
            className="h-10 w-auto object-contain"
            referrerPolicy="no-referrer"
            whileHover={{ scale: 1.05 }}
          />
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
              {logoText.charAt(0)}
            </div>
            <Typography
              variant="span"
              className={`text-xl font-black ${themeTextClass} tracking-tighter`}
              editable={!!onUpdate && logoType === 'none'}
              onUpdate={(text) => handleTextUpdate('logoText', text)}
            >
              {logoText}
            </Typography>
          </div>
        )}
      </a>
    );
  };

  const renderNav = () => (
    <nav className={`${isMobileSimulated ? 'hidden' : 'hidden md:flex'} items-center gap-10 ${layoutType === 'logo-center' ? 'flex-1 justify-center' : ''}`}>
      {menuItems.map((link: any, idx: number) => {
        const isActive = activeSection === link.id || activeSection === link.link?.substring(1);
        return (
          <motion.button 
            key={idx}
            custom={idx}
            variants={navVariants}
            initial="hidden"
            animate="visible"
            onClick={(e) => {
              if (!isPreview) return;
              e.preventDefault();
              const targetId = link.link?.startsWith('#') ? link.link.substring(1) : link.link;
              const element = document.getElementById(targetId) || document.getElementById(`module-${targetId}`);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className={getHoverClass(isActive)}
          >
            <Typography
              variant="span"
              style={data?.linkStyle}
              className="whitespace-nowrap"
            >
              {link.label}
            </Typography>
          </motion.button>
        );
      })}
    </nav>
  );

  const renderActions = () => (
    <div className="flex items-center gap-6 flex-shrink-0">
      {hasSocials && (
        <div className="hidden lg:flex items-center gap-3 mr-2">
          {Object.entries(currentSocials).map(([platform, url]) => {
            if (platform === 'useProjectSocials' || !url) return null;
            const Icon = getSocialIcon(platform);
            return (
              <a 
                key={platform} 
                href={url as string} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`p-1.5 ${themeTextMutedClass} hover:text-primary transition-colors`}
              >
                <Icon className="w-4 h-4" />
              </a>
            );
          })}
        </div>
      )}

      {data?.showSearch && (
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsSearchOpen(true)}
          className={`p-2 ${themeTextMutedClass} hover:text-primary transition-colors hidden lg:block`}
        >
          <Search className="w-5 h-5" />
        </motion.button>
      )}
      
      <div className="hidden sm:flex items-center gap-4">
        {/* Primary CTA */}
        {data?.showCta !== false && (
          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCTA}
            className="px-8 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center gap-2"
          >
            <Typography
              variant="span"
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate('ctaText', text)}
            >
              {data?.ctaText || 'Empezar'}
            </Typography>
            <ArrowRight className="w-3 h-3" />
          </motion.button>
        )}
        {/* Secondary CTA */}
        {data?.showSecondaryCta && (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-8 py-3 ${isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-surface border border-text/10 text-text/80'} text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:opacity-80 transition-all backdrop-blur-md`}
          >
            <Typography
              variant="span"
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate('secondaryCtaText', text)}
            >
              {data?.secondaryCtaText || 'Saber más'}
            </Typography>
          </motion.button>
        )}
      </div>

      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={`${isMobileSimulated ? 'block' : 'md:hidden'} p-2.5 ${themeTextMutedClass} hover:bg-primary/10 rounded-xl transition-colors`}
      >
        {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
      </motion.button>

      {data?.showLanguage && (
        <div className="relative">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            onClick={() => setIsLanguageOpen(!isLanguageOpen)}
            className={`flex items-center gap-1.5 p-2 ${themeTextMutedClass} hover:text-primary transition-colors`}
          >
            <Globe className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">ES</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-500 ${isLanguageOpen ? 'rotate-180' : ''}`} />
          </motion.button>
          
          <AnimatePresence>
            {isLanguageOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                className={`absolute top-full right-0 mt-3 w-40 py-3 ${themeBgClass} border ${themeBorderClass} rounded-2xl shadow-2xl z-50 backdrop-blur-xl`}
              >
                {['ES', 'EN'].map((lang) => (
                  <button 
                    key={lang}
                    onClick={() => setIsLanguageOpen(false)}
                    className={`w-full text-left px-5 py-2.5 text-[10px] font-black uppercase tracking-widest ${themeTextClass} hover:bg-primary/10 hover:text-primary transition-all`}
                  >
                    {lang === 'ES' ? 'Español' : 'English'}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );

  return (
    <header 
      className={`
        w-full transition-all duration-700 z-[40]
        ${scrollMode === 'sticky' || scrollMode === 'smart-hide' ? 'sticky top-0' : 'relative'}
        ${isVisible ? 'translate-y-0' : '-translate-y-full'}
        ${getBgClass()}
      `}
      style={{ height: `${height}px` }}
    >
      {/* Reading Progress Bar */}
      {data?.showProgressBar && (
        <div className="absolute bottom-0 left-0 h-[3px] bg-primary transition-all duration-300 ease-out z-50" style={{ width: `${scrollProgress}%` }} />
      )}

      <div className="max-w-7xl mx-auto h-full px-6 md:px-10 flex items-center justify-between gap-10">
        {layoutType === 'logo-left' && (
          <>
            {renderLogo()}
            {renderNav()}
            {renderActions()}
          </>
        )}

        {layoutType === 'logo-center' && (
          <>
            <div className="flex-1 hidden md:block" />
            {renderLogo()}
            {renderNav()}
            {renderActions()}
          </>
        )}

        {layoutType === 'logo-right' && (
          <>
            {renderNav()}
            <div className="flex-1" />
            {renderLogo()}
            {renderActions()}
          </>
        )}
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[45]"
            />
            
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={`fixed top-0 right-0 w-[85%] max-w-sm h-full ${themeBgClass} z-[50] shadow-[0_0_50px_rgba(0,0,0,0.3)] flex flex-col border-l ${themeBorderClass}`}
            >
              <div className="p-8 flex items-center justify-between border-b border-text/5">
                {renderLogo()}
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-3 ${themeTextMutedClass} hover:bg-primary/10 rounded-2xl transition-colors`}
                >
                  <X className="w-7 h-7" />
                </motion.button>
              </div>
              
              <nav className="flex flex-col p-10 gap-8 overflow-y-auto flex-1">
                {menuItems.map((link: any, idx: number) => (
                  <motion.button 
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      if (!isPreview) return;
                      const targetId = link.link?.startsWith('#') ? link.link.substring(1) : link.link;
                      const element = document.getElementById(targetId) || document.getElementById(`module-${targetId}`);
                      if (element) element.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`text-3xl font-black ${themeTextClass} text-left tracking-tighter hover:text-primary transition-colors`}
                  >
                    {link.label}
                  </motion.button>
                ))}
                
                <div className="mt-auto pt-10 flex flex-col gap-5">
                  <motion.button 
                    whileTap={{ scale: 0.98 }}
                    onClick={onCTA}
                    className="w-full py-5 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-3xl shadow-2xl shadow-primary/30 flex items-center justify-center gap-3"
                  >
                    <Typography
                      variant="span"
                      editable={!!onUpdate}
                      onUpdate={(text) => handleTextUpdate('ctaText', text)}
                    >
                      {data?.ctaText || 'Empezar'}
                    </Typography>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                  {data?.showSecondaryCta && (
                    <motion.button 
                      whileTap={{ scale: 0.98 }}
                      className={`w-full py-5 ${isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-surface border border-text/10 text-text'} font-black uppercase tracking-widest text-xs rounded-3xl backdrop-blur-md`}
                    >
                      <Typography
                        variant="span"
                        editable={!!onUpdate}
                        onUpdate={(text) => handleTextUpdate('secondaryCtaText', text)}
                      >
                        {data?.secondaryCtaText || 'Saber más'}
                      </Typography>
                    </motion.button>
                  )}

                  {/* Social Links Mobile */}
                  {hasSocials && (
                    <div className="flex items-center justify-center gap-4 pt-6 border-t border-text/10">
                      {Object.entries(currentSocials).map(([platform, url]) => {
                        if (platform === 'useProjectSocials' || !url) return null;
                        const Icon = getSocialIcon(platform);
                        return (
                          <a 
                            key={platform}
                            href={url as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-3 rounded-full transition-colors ${themeTextMutedClass} hover:${themeTextClass} hover:bg-black/5 dark:hover:bg-white/10`}
                          >
                            <Icon className="w-5 h-5" />
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[60] flex items-center justify-center p-8"
          >
            <motion.button 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setIsSearchOpen(false)}
              className="absolute top-10 right-10 p-4 text-white/40 hover:text-white transition-colors"
              whileHover={{ rotate: 90 }}
            >
              <X className="w-10 h-10" />
            </motion.button>
            
            <div className="w-full max-w-4xl">
              <motion.div 
                className="relative"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-10 h-10 text-primary" />
                <input 
                  autoFocus
                  type="text"
                  placeholder="¿Qué estás buscando?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border-2 border-white/10 rounded-[2.5rem] py-10 pl-24 pr-10 text-4xl text-white placeholder:text-white/10 focus:border-primary outline-none transition-all shadow-2xl"
                />
              </motion.div>
              <motion.div 
                className="mt-10 flex flex-wrap justify-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <span className="text-white/30 text-sm font-bold uppercase tracking-widest mr-2">Sugerencias:</span>
                {['Servicios', 'Precios', 'Contacto', 'Blog'].map(tag => (
                  <button key={tag} className="px-5 py-2 rounded-full bg-white/5 text-white/60 text-xs font-bold hover:bg-primary hover:text-white transition-all">
                    {tag}
                  </button>
                ))}
              </motion.div>
              <p className="mt-12 text-white/20 text-center text-sm font-black uppercase tracking-[0.3em]">Presiona ESC para cerrar</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};


