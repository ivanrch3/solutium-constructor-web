import React, { useState, useEffect } from 'react';
import { Menu, Search, Globe, Share2, X, ChevronDown } from 'lucide-react';
import { Typography } from '../ui/Typography';
import { getModuleDefinition } from '../../modules/registry';

export const HeaderModule = ({ data, modules = [], isPreview, onCTA, onUpdate }: { data: any, modules?: any[], isPreview?: boolean, onCTA: (e: React.MouseEvent) => void, onUpdate?: (data: any) => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const layout = data?.layout || 'logo-left';
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
      const height_doc = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height_doc) * 100;
      setScrollProgress(scrolled);

      setLastScrollY(currentScrollY);

      // Active section detection
      const sectionIds = menuItems.map((item: any) => item.link?.startsWith('#') ? item.link.substring(1) : null).filter(Boolean);
      for (const id of sectionIds) {
        const element = document.getElementById(id) || document.getElementById(`module-${id}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= 300) {
            setActiveSection(id);
            break;
          }
        }
      }
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
    if (bgType === 'transparent') {
      return isScrolled ? `${themeBgClass} border-b ${themeBorderClass} shadow-sm` : 'bg-transparent border-transparent';
    }
    if (bgType === 'glass') {
      return isDark 
        ? 'bg-[#0f172a]/80 backdrop-blur-md border-b border-white/10'
        : 'bg-surface/80 backdrop-blur-md border-b border-text/10';
    }
    return `${themeBgClass} border-b ${themeBorderClass}`;
  };

  const getHoverClass = (isActive: boolean) => {
    const base = "relative text-sm font-medium transition-all duration-300 ";
    const activeColor = isActive ? "text-primary" : `${themeTextMutedClass} hover:text-primary`;
    
    if (hoverEffect === 'underline') {
      return base + activeColor + " after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-primary after:transition-transform after:duration-300 " + (isActive ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100");
    }
    if (hoverEffect === 'capsule') {
      return base + (isActive ? "bg-primary/10 text-primary px-4 py-2 rounded-full" : `${themeTextMutedClass} hover:bg-text/5 px-4 py-2 rounded-full`);
    }
    return base + activeColor;
  };

  const renderLogo = () => (
    <div className="flex items-center gap-2 flex-shrink-0">
      {data?.logoImage ? (
        <img 
          src={data.logoImage} 
          alt="Logo" 
          className="h-8 w-auto object-contain"
          referrerPolicy="no-referrer"
        />
      ) : (
        <Typography
          variant={data?.logoText_style?.size || "span"}
          weight={data?.logoText_style?.weight || "900"}
          className={`text-xl font-black ${themeTextClass} tracking-tighter ${data?.logoText_style?.align === 'center' ? 'text-center' : ''}`}
          editable={!!onUpdate}
          onUpdate={(text) => handleTextUpdate('logoText', text)}
        >
          {data?.logoText || 'SOLUTIUM'}
        </Typography>
      )}
    </div>
  );

  const renderNav = () => (
    <nav className={`hidden md:flex items-center gap-8 ${layout === 'logo-center' ? 'flex-1 justify-center' : ''}`}>
      {menuItems.map((link: any, idx: number) => {
        const isActive = activeSection === link.id || activeSection === link.link?.substring(1);
        return (
          <button 
            key={idx}
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
            {link.label}
          </button>
        );
      })}
    </nav>
  );

  const renderActions = () => (
    <div className="flex items-center gap-4 flex-shrink-0">
      {data?.showSearch && (
        <button className={`p-2 ${themeTextMutedClass} hover:text-primary transition-colors hidden lg:block`}>
          <Search className="w-5 h-5" />
        </button>
      )}
      {data?.showLanguage && (
        <button className={`flex items-center gap-1 p-2 ${themeTextMutedClass} hover:text-primary transition-colors hidden lg:block`}>
          <Globe className="w-4 h-4" />
          <span className="text-xs font-bold uppercase">ES</span>
          <ChevronDown className="w-3 h-3" />
        </button>
      )}
      
      <div className="hidden sm:flex items-center gap-3">
        {/* Primary CTA */}
        {data?.showCTA !== false && (
          <button 
            onClick={onCTA}
            className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            <Typography
              variant="span"
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate('ctaText', text)}
            >
              {data?.ctaText || 'Empezar'}
            </Typography>
          </button>
        )}
        {/* Secondary CTA */}
        {data?.showSecondaryCTA && (
          <button 
            className={`px-6 py-2.5 ${isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-surface border border-text/10 text-text/80'} text-sm font-bold rounded-xl hover:opacity-80 transition-all`}
          >
            <Typography
              variant="span"
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate('secondaryCtaText', text)}
            >
              {data?.secondaryCtaText || 'Saber más'}
            </Typography>
          </button>
        )}
      </div>

      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={`md:hidden p-2 ${themeTextMutedClass} hover:bg-primary/10 rounded-lg`}
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
    </div>
  );

  return (
    <header 
      className={`
        w-full transition-all duration-500 z-[40]
        ${scrollMode === 'sticky' || scrollMode === 'smart-hide' ? 'sticky top-0' : 'relative'}
        ${isVisible ? 'translate-y-0' : '-translate-y-full'}
        ${getBgClass()}
      `}
      style={{ height: `${height}px` }}
    >
      {/* Reading Progress Bar */}
      {data?.showProgressBar && (
        <div className="absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-100" style={{ width: `${scrollProgress}%` }} />
      )}

      <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between gap-8">
        {layout === 'logo-left' && (
          <>
            {renderLogo()}
            {renderNav()}
            {renderActions()}
          </>
        )}

        {layout === 'logo-center' && (
          <>
            <div className="flex-1 hidden md:block" />
            {renderLogo()}
            {renderNav()}
            {renderActions()}
          </>
        )}

        {layout === 'logo-right' && (
          <>
            {renderNav()}
            <div className="flex-1" />
            {renderLogo()}
            {renderActions()}
          </>
        )}
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div 
          className={`fixed inset-0 ${themeBgClass} z-40 md:hidden animate-in fade-in slide-in-from-top-5 duration-300`}
          style={{ top: `${height}px` }}
        >
          <nav className="flex flex-col p-8 gap-6">
            {menuItems.map((link: any, idx: number) => (
              <button 
                key={idx}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (!isPreview) return;
                  const targetId = link.link?.startsWith('#') ? link.link.substring(1) : link.link;
                  const element = document.getElementById(targetId) || document.getElementById(`module-${targetId}`);
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`text-2xl font-bold ${themeTextClass} text-left border-b ${themeBorderClass} pb-4`}
              >
                {link.label}
              </button>
            ))}
            <div className="pt-8 flex flex-col gap-4">
              <button className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20">
                <Typography
                  variant="span"
                  editable={!!onUpdate}
                  onUpdate={(text) => handleTextUpdate('ctaText', text)}
                >
                  {data?.ctaText || 'Empezar'}
                </Typography>
              </button>
              {data?.showSecondaryCTA && (
                <button className={`w-full py-4 ${isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-surface border border-text/10 text-text'} font-bold rounded-2xl`}>
                  <Typography
                    variant="span"
                    editable={!!onUpdate}
                    onUpdate={(text) => handleTextUpdate('secondaryCtaText', text)}
                  >
                    {data?.secondaryCtaText || 'Saber más'}
                  </Typography>
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

