import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Customer } from '../../../types/schema';
import { MOCK_CUSTOMERS } from '../../../constants/mockData';
import { Users } from 'lucide-react';

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

  const selectedCustomerIds = getVal(null, 'select_customers', []);
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
  const bgColor = getVal(null, 'bg_color', '#FFFFFF');
  const sectionGradient = getVal(null, 'section_gradient', false);
  const animationSpeed = getVal(null, 'animation_speed', 30);
  const marqueeDirection = getVal(null, 'marquee_direction', 'left');
  const pauseOnHover = getVal(null, 'pause_on_hover', true);
  const entranceAnimation = getVal(null, 'entrance_animation', true);

  // Element Settings: Header
  const eyebrow = getVal(`${moduleId}_el_clients_header`, 'eyebrow', 'TRUSTED BY');
  const titleText = getVal(`${moduleId}_el_clients_header`, 'title_text', 'Empresas que confían en nosotros');
  const subtitleText = getVal(`${moduleId}_el_clients_header`, 'subtitle_text', 'Trabajamos con los mejores para ofrecerte lo mejor.');
  const headerAlign = getVal(`${moduleId}_el_clients_header`, 'align', 'center');
  const titleSize = getVal(`${moduleId}_el_clients_header`, 'title_size', 32);
  const titleColor = getVal(`${moduleId}_el_clients_header`, 'title_color', '#0F172A');
  const eyebrowColor = getVal(`${moduleId}_el_clients_header`, 'eyebrow_color', 'var(--primary-color)');
  const headerMarginB = getVal(`${moduleId}_el_clients_header`, 'margin_b', 60);

  // Element Settings: Logo
  const logoHeight = getVal(`${moduleId}_el_client_logo`, 'logo_height', 40);
  const logoFit = getVal(`${moduleId}_el_client_logo`, 'logo_fit', 'contain');
  const logoFilter = getVal(`${moduleId}_el_client_logo`, 'logo_filter', 'grayscale');
  const logoOpacity = getVal(`${moduleId}_el_client_logo`, 'logo_opacity', 60);
  const logoBorderRadius = getVal(`${moduleId}_el_client_logo`, 'logo_border_radius', 0);
  const hoverReveal = getVal(`${moduleId}_el_client_logo`, 'hover_reveal', true);
  const hoverScale = getVal(`${moduleId}_el_client_logo`, 'hover_scale', 110);
  const hoverGlow = getVal(`${moduleId}_el_client_logo`, 'hover_glow', false);
  const showTooltips = getVal(`${moduleId}_el_client_logo`, 'show_tooltips', true);
  const enableLinks = getVal(`${moduleId}_el_client_logo`, 'enable_links', false);

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
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-inherit to-transparent z-10 pointer-events-none" style={{ backgroundColor: bgColor }} />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-inherit to-transparent z-10 pointer-events-none" style={{ backgroundColor: bgColor }} />
          
          <motion.div 
            className="flex items-center gap-20 whitespace-nowrap w-max"
            animate={{ x: marqueeDirection === 'left' ? [0, -1500] : [-1500, 0] }}
            transition={{ 
              repeat: Infinity, 
              duration: animationSpeed, 
              ease: "linear" 
            }}
            whileHover={pauseOnHover ? { animationPlayState: 'paused' } : {}}
          >
            {marqueeLogos.map((customer, idx) => (
              <LogoItem 
                key={`${customer.id}-${idx}`} 
                customer={customer}
                {...logoProps}
                entranceAnimation={false}
              />
            ))}
          </motion.div>
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
        backgroundImage: sectionGradient ? `linear-gradient(to bottom, ${bgColor}, white)` : 'none',
        paddingTop: `${paddingY}px`,
        paddingBottom: `${paddingY}px`
      }}
    >
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <div 
          className={`flex flex-col mb-12 ${getAlignmentClass(headerAlign)}`}
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
            className="font-black mb-4 leading-tight text-2xl @md:text-3xl @lg:text-4xl"
            style={{ 
              color: titleColor,
              fontSize: `${titleSize}px`
            }}
          >
            {titleText}
          </h2>
          {subtitleText && (
            <p 
              className="text-slate-500 max-w-2xl text-lg"
              style={{ color: '#64748B' }}
            >
              {subtitleText}
            </p>
          )}
        </div>

        {/* Logos */}
        {displayCustomers.length > 0 ? (
          renderLogos()
        ) : (
          <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="text-primary w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-slate-900">No hay clientes seleccionados</h3>
            <p className="text-sm text-slate-500">
              Selecciona los logotipos de clientes en la Configuración Global para mostrarlos aquí.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
