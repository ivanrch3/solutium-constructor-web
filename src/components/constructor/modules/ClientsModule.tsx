import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Customer } from '../../../types/schema';
import { MOCK_CUSTOMERS } from '../../../constants/mockData';
import { Users } from 'lucide-react';
import { TYPOGRAPHY_SCALE, FONT_WEIGHTS } from '../../../constants/typography';
import { TextRenderer } from '../TextRenderer';

const LogoItem = ({ 
  customer, 
  entranceAnimation, 
  hoverReveal,
  hoverGlow,
  hoverScale, 
  logoHeight, 
  logoOpacity, 
  logoFilter, 
  getFilterStyle, 
  logoBorderRadius, 
  logoFit, 
  showTooltips, 
  enableLinks 
}: any) => {
  const itemVariantsActual = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  const content = (
    <motion.div
      variants={entranceAnimation ? itemVariantsActual : {}}
      whileHover={{ 
        scale: hoverScale / 100,
        filter: hoverReveal ? 'none' : undefined,
        opacity: hoverReveal ? 1 : undefined,
        boxShadow: hoverGlow ? '0 10px 30px -10px rgba(0,0,0,0.1)' : undefined,
        transition: { duration: 0.3 }
      }}
      className="relative flex items-center justify-center transition-all duration-500 group"
      style={{ 
        height: `${logoHeight}px`,
        opacity: logoOpacity / 100,
        filter: getFilterStyle(logoFilter),
        borderRadius: `${logoBorderRadius}px`,
        overflow: logoBorderRadius > 0 ? 'hidden' : 'visible'
      }}
    >
      <img 
        src={customer.companyLogoUrl || 'https://picsum.photos/seed/logo/150/50'} 
        alt={customer.name}
        className="max-w-full max-h-full transition-all duration-500"
        style={{ objectFit: logoFit as any }}
        referrerPolicy="no-referrer"
      />
      
      {/* Tooltip */}
      {showTooltips && (
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
          {customer.name}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
        </div>
      )}
    </motion.div>
  );

  if (enableLinks && (customer as any).websiteUrl) {
    return (
      <a href={(customer as any).websiteUrl} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return content;
};

export const ClientsModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any>,
  customers?: Customer[],
  isDevMode?: boolean
}> = ({ moduleId, settingsValues, customers, isDevMode }) => {
  // Helper to get setting value
  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  };

  const selectedCustomerIds = getVal(`${moduleId}_el_client_logos_data`, 'select_customers', []);
  const baseCustomers = customers && customers.length > 0 ? customers : (isDevMode ? MOCK_CUSTOMERS : []);
  
  const displayCustomers = useMemo(() => {
    return baseCustomers.filter(c => 
      Array.isArray(selectedCustomerIds) && selectedCustomerIds.includes(c.id)
    );
  }, [baseCustomers, selectedCustomerIds]);

  // Global Settings
  const layout = getVal(null, 'layout', 'grid');
  const alignment = getVal(null, 'alignment', 'center');
  const columns = getVal(null, 'columns', 5);
  const gap = getVal(null, 'gap', 40);
  const paddingY = getVal(null, 'padding_y', 80);
  const darkMode = getVal(null, 'dark_mode', false);
  const bgColor = darkMode ? '#0F172A' : getVal(null, 'bg_color', '#FFFFFF');
  const sectionGradient = getVal(null, 'section_gradient', false);
  const bgGradient = getVal(null, 'bg_gradient', 'linear-gradient(to bottom, #FFFFFF, #F8FAFC)');
  const animationSpeed = getVal(null, 'animation_speed', 30);
  const marqueeDirection = getVal(null, 'marquee_direction', 'left');
  const pauseOnHover = getVal(null, 'pause_on_hover', true);
  const entranceAnimation = getVal(null, 'entrance_animation', true);

  // Element Settings: Header
  const eyebrow = getVal(`${moduleId}_el_clients_header`, 'eyebrow', 'TRUSTED BY');
  const titleText = getVal(`${moduleId}_el_clients_header`, 'title', 'Empresas que confían en nosotros');
  const subtitleText = getVal(`${moduleId}_el_clients_header`, 'subtitle', 'Trabajamos con los mejores para ofrecerte lo mejor.');
  const headerAlign = getVal(`${moduleId}_el_clients_header`, 'align', 'center');
  const titleSize = getVal(`${moduleId}_el_clients_header`, 'title_size', 't2');
  const titleWeight = getVal(`${moduleId}_el_clients_header`, 'title_weight', 'black');
  const subtitleSize = getVal(`${moduleId}_el_clients_header`, 'subtitle_size', 'p');
  const subtitleWeight = getVal(`${moduleId}_el_clients_header`, 'subtitle_weight', 'normal');
  const titleColor = darkMode ? '#FFFFFF' : getVal(`${moduleId}_el_clients_header`, 'title_color', '#0F172A');
  const eyebrowColor = getVal(`${moduleId}_el_clients_header`, 'eyebrow_color', 'var(--primary-color)');
  const headerMarginB = getVal(`${moduleId}_el_clients_header`, 'margin_b', 60);

  const titleHighlightType = getVal(`${moduleId}_el_clients_header`, 'title_highlight_type', 'gradient');
  const titleHighlightColor = getVal(`${moduleId}_el_clients_header`, 'title_highlight_color', '#3B82F6');
  const titleHighlightGradient = getVal(`${moduleId}_el_clients_header`, 'title_highlight_gradient', 'linear-gradient(to right, #3B82F6, #2563EB)');
  const titleHighlightBold = getVal(`${moduleId}_el_clients_header`, 'title_highlight_bold', true);

  const subtitleHighlightType = getVal(`${moduleId}_el_clients_header`, 'subtitle_highlight_type', 'none');
  const subtitleHighlightColor = getVal(`${moduleId}_el_clients_header`, 'subtitle_highlight_color', '#3B82F6');
  const subtitleHighlightGradient = getVal(`${moduleId}_el_clients_header`, 'subtitle_highlight_gradient', 'linear-gradient(to right, #3B82F6, #2563EB)');
  const subtitleHighlightBold = getVal(`${moduleId}_el_clients_header`, 'subtitle_highlight_bold', true);

  // Element Settings: Logo
  const logoHeight = getVal(`${moduleId}_el_client_logo`, 'logo_height', 40);
  const logoFit = getVal(`${moduleId}_el_client_logo`, 'logo_fit', 'contain');
  const logoFilter = darkMode ? 'invert' : getVal(`${moduleId}_el_client_logo`, 'logo_filter', 'grayscale');
  const logoOpacity = getVal(`${moduleId}_el_client_logo`, 'logo_opacity', 60);
  const logoBorderRadius = getVal(`${moduleId}_el_client_logo`, 'logo_border_radius', 0);
  const hoverReveal = getVal(`${moduleId}_el_client_logo`, 'hover_reveal', true);
  const hoverScale = getVal(`${moduleId}_el_client_logo`, 'hover_scale', 110);
  const hoverGlow = getVal(`${moduleId}_el_client_logo`, 'hover_glow', false);
  const showTooltips = getVal(`${moduleId}_el_client_logo`, 'show_tooltips', true);
  const enableLinks = getVal(`${moduleId}_el_client_logo`, 'enable_links', false);

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

  const getAlignmentClass = (align: string) => {
    switch (align) {
      case 'left': return 'text-left items-start';
      case 'right': return 'text-right items-end';
      default: return 'text-center items-center';
    }
  };

  const getJustifyClass = (align: string) => {
    switch (align) {
      case 'left': return 'justify-start';
      case 'right': return 'justify-end';
      default: return 'justify-center';
    }
  };

  const getFilterStyle = (filter: string) => {
    switch (filter) {
      case 'grayscale': return 'grayscale(100%)';
      case 'invert': return 'brightness(0) invert(1)';
      default: return 'none';
    }
  };

  const logoProps = {
    entranceAnimation,
    hoverReveal,
    hoverGlow,
    hoverScale,
    logoHeight,
    logoOpacity,
    logoFilter,
    getFilterStyle,
    logoBorderRadius,
    logoFit,
    showTooltips,
    enableLinks
  };

  const renderLogos = () => {
    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1
        }
      }
    };

    if (layout === 'grid') {
      return (
        <motion.div 
          variants={entranceAnimation ? containerVariants : {}}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className={`grid ${getJustifyClass(alignment)} ${
            columns >= 5 ? 'grid-cols-2 @sm:grid-cols-3 @md:grid-cols-4 @lg:grid-cols-5' :
            columns === 4 ? 'grid-cols-2 @sm:grid-cols-3 @md:grid-cols-4' :
            columns === 3 ? 'grid-cols-2 @sm:grid-cols-3' :
            columns === 2 ? 'grid-cols-2' : 'grid-cols-1'
          }`}
          style={{ 
            gap: `${gap}px`
          }}
        >
          {displayCustomers.map((customer) => (
            <LogoItem 
              key={customer.id} 
              customer={customer}
              {...logoProps}
            />
          ))}
        </motion.div>
      );
    }

    if (layout === 'marquee') {
      const marqueeLogos = [...displayCustomers, ...displayCustomers, ...displayCustomers, ...displayCustomers];
      
      return (
        <div className="overflow-hidden relative py-8 -mx-8">
          <div className={`absolute inset-y-0 left-0 w-32 z-10 pointer-events-none ${darkMode ? 'bg-gradient-to-r from-[#0F172A] to-transparent' : 'bg-gradient-to-r from-white to-transparent'}`} />
          <div className={`absolute inset-y-0 right-0 w-32 z-10 pointer-events-none ${darkMode ? 'bg-gradient-to-l from-[#0F172A] to-transparent' : 'bg-gradient-to-l from-white to-transparent'}`} />
          
          <div 
            className="clients-marquee-container flex items-center gap-20 whitespace-nowrap w-max"
            style={{ 
              '--speed': `${animationSpeed}s`,
              '--pause': pauseOnHover ? 'paused' : 'running',
              '--direction': marqueeDirection === 'left' ? 'marquee-left' : 'marquee-right'
            } as any}
          >
            {marqueeLogos.map((customer, idx) => (
              <LogoItem 
                key={`${customer.id}-${idx}`} 
                customer={customer}
                {...logoProps}
                entranceAnimation={false}
              />
            ))}
          </div>
        </div>
      );
    }

    return (
      <motion.div 
        variants={entranceAnimation ? containerVariants : {}}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className={`flex items-center ${getJustifyClass(alignment)} gap-12 overflow-x-auto pb-8 no-scrollbar`}
      >
        {displayCustomers.map((customer) => (
          <LogoItem 
            key={customer.id} 
            customer={customer}
            {...logoProps}
          />
        ))}
      </motion.div>
    );
  };


  return (
    <section 
      className="w-full relative overflow-hidden"
      style={{ 
        backgroundColor: bgColor,
        backgroundImage: sectionGradient ? bgGradient : 'none',
        paddingTop: `${paddingY}px`,
        paddingBottom: `${paddingY}px`
      }}
    >
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        {/* Header */}
        <div 
          className={`flex flex-col mb-12 w-full ${headerAlign === 'center' ? 'items-center text-center' : headerAlign === 'right' ? 'items-end text-right' : 'items-start text-left'}`}
          style={{ marginBottom: `${headerMarginB}px` }}
        >
          {eyebrow && (
            <span 
              className="text-sm font-bold tracking-widest mb-3 uppercase"
              style={{ color: eyebrowColor }}
            >
              {eyebrow}
            </span>
          )}
          <h2 
            className="mb-4 leading-tight"
            style={{ 
              ...getTypographyStyle(titleSize as any, titleWeight, headerAlign),
              color: titleColor
            }}
          >
            <TextRenderer 
              text={titleText}
              highlightType={titleHighlightType}
              highlightColor={titleHighlightColor}
              highlightGradient={titleHighlightGradient}
              highlightBold={titleHighlightBold}
            />
          </h2>
          {subtitleText && (
            <p 
              className="max-w-2xl text-lg"
              style={{ 
                ...getTypographyStyle(subtitleSize as any, subtitleWeight, headerAlign),
                color: darkMode ? '#94A3B8' : '#64748B' 
              }}
            >
              <TextRenderer 
                text={subtitleText}
                highlightType={subtitleHighlightType}
                highlightColor={subtitleHighlightColor}
                highlightGradient={subtitleHighlightGradient}
                highlightBold={subtitleHighlightBold}
              />
            </p>
          )}
        </div>

        {/* Logos */}
        {displayCustomers.length > 0 ? (
          renderLogos()
        ) : (
          <div 
            className="py-12 text-center rounded-3xl"
            style={{
              backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 1)',
              borderWidth: '2px',
              borderStyle: 'dashed',
              borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(226, 232, 240, 1)'
            }}
          >
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="text-primary w-8 h-8" />
            </div>
            <h3 
              className="text-lg font-bold mb-2"
              style={{ color: darkMode ? '#FFFFFF' : '#0F172A' }}
            >
              No hay clientes seleccionados
            </h3>
            <p 
              className="text-sm"
              style={{ color: darkMode ? '#94A3B8' : '#64748B' }}
            >
              Selecciona los logotipos de clientes en la Configuración Global para mostrarlos aquí.
            </p>
          </div>
        )}
      </div>
      <style>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .clients-marquee-container {
          display: flex;
          width: max-content;
          animation: var(--direction) var(--speed) linear infinite;
        }
        .clients-marquee-container:hover {
          animation-play-state: var(--pause);
        }
      `}</style>
    </section>
  );
};
