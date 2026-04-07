import React from 'react';
import { motion } from 'motion/react';
import { Customer } from '../../../types/schema';
import { MOCK_CUSTOMERS } from '../../../constants/mockData';
import { Users } from 'lucide-react';

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
  
  const displayCustomers = baseCustomers.filter(c => 
    Array.isArray(selectedCustomerIds) && selectedCustomerIds.includes(c.id)
  );

  // Global Settings
  const layout = getVal(null, 'layout', 'grid');
  const alignment = getVal(null, 'alignment', 'center');
  const columns = getVal(null, 'columns', 5);
  const gap = getVal(null, 'gap', 40);
  const paddingY = getVal(null, 'padding_y', 60);
  const bgColor = getVal(null, 'bg_color', 'transparent');
  const animationSpeed = getVal(null, 'animation_speed', 30);

  // Element Settings: Title
  const titleText = getVal(`${moduleId}_el_clients_title`, 'title_text', 'Empresas que confían en nosotros');
  const titleSize = getVal(`${moduleId}_el_clients_title`, 'title_size', 24);
  const titleWeight = getVal(`${moduleId}_el_clients_title`, 'title_weight', 'bold');
  const titleColor = getVal(`${moduleId}_el_clients_title`, 'title_color', 'var(--foreground-color)');
  const titleMarginBottom = getVal(`${moduleId}_el_clients_title`, 'title_margin_bottom', 16);

  // Element Settings: Subtitle
  const subtitleText = getVal(`${moduleId}_el_clients_subtitle`, 'subtitle_text', 'Trabajamos con los mejores para ofrecerte lo mejor.');
  const subtitleSize = getVal(`${moduleId}_el_clients_subtitle`, 'subtitle_size', 16);
  const subtitleColor = getVal(`${moduleId}_el_clients_subtitle`, 'subtitle_color', 'var(--foreground-color)');
  const subtitleMarginBottom = getVal(`${moduleId}_el_clients_subtitle`, 'subtitle_margin_bottom', 40);

  // Element Settings: Logo
  const logoHeight = getVal(`${moduleId}_el_client_logo`, 'logo_height', 40);
  const logoFit = getVal(`${moduleId}_el_client_logo`, 'logo_fit', 'contain');
  const logoFilter = getVal(`${moduleId}_el_client_logo`, 'logo_filter', 'grayscale');
  const logoOpacity = getVal(`${moduleId}_el_client_logo`, 'logo_opacity', 60);
  const logoBorderRadius = getVal(`${moduleId}_el_client_logo`, 'logo_border_radius', 0);
  const hoverEffect = getVal(`${moduleId}_el_client_logo`, 'hover_effect', true);
  const hoverScale = getVal(`${moduleId}_el_client_logo`, 'hover_scale', 110);
  const enableLinks = getVal(`${moduleId}_el_client_logo`, 'enable_links', false);

  const getFontWeightClass = (weight: string) => {
    switch (weight) {
      case 'medium': return 'font-medium';
      case 'normal': return 'font-normal';
      default: return 'font-bold';
    }
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
      case 'brightness(0) invert(1)': return 'brightness(0) invert(1)';
      default: return 'none';
    }
  };

  const renderLogos = () => {
    if (layout === 'grid') {
      return (
        <div 
          className={`grid ${getJustifyClass(alignment)}`}
          style={{ 
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gap: `${gap}px`
          }}
        >
          {displayCustomers.map((customer) => (
            <LogoItem key={customer.id} customer={customer} />
          ))}
        </div>
      );
    }

    if (layout === 'marquee') {
      return (
        <div className="overflow-hidden relative py-4">
          <motion.div 
            className="flex items-center gap-20 whitespace-nowrap"
            animate={{ x: [0, -1000] }}
            transition={{ 
              repeat: Infinity, 
              duration: animationSpeed, 
              ease: "linear" 
            }}
          >
            {[...displayCustomers, ...displayCustomers, ...displayCustomers].map((customer, idx) => (
              <LogoItem key={`${customer.id}-${idx}`} customer={customer} />
            ))}
          </motion.div>
        </div>
      );
    }

    // Carousel (Simple horizontal scroll for now)
    return (
      <div className={`flex items-center ${getJustifyClass(alignment)} gap-12 overflow-x-auto pb-4 no-scrollbar`}>
        {displayCustomers.map((customer) => (
          <LogoItem key={customer.id} customer={customer} />
        ))}
      </div>
    );
  };

  const LogoItem = ({ customer }: { customer: Customer, key?: any }) => {
    const content = (
      <motion.div
        whileHover={hoverEffect ? { scale: hoverScale / 100 } : {}}
        className="flex items-center justify-center transition-all duration-300"
        style={{ 
          height: `${logoHeight}px`,
          opacity: logoOpacity / 100,
          filter: getFilterStyle(logoFilter),
          borderRadius: `${logoBorderRadius}px`,
          overflow: logoBorderRadius > 0 ? 'hidden' : 'visible'
        }}
      >
        <img 
          src={customer.companyLogoUrl || 'https://via.placeholder.com/150x50?text=Logo'} 
          alt={customer.name}
          className="max-w-full max-h-full transition-all duration-300 hover:filter-none hover:opacity-100"
          style={{ objectFit: logoFit as any }}
          referrerPolicy="no-referrer"
        />
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

  return (
    <section 
      className="w-full relative overflow-hidden"
      style={{ 
        backgroundColor: bgColor,
        paddingTop: `${paddingY}px`,
        paddingBottom: `${paddingY}px`
      }}
    >
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <div className={`flex flex-col ${getAlignmentClass(alignment)}`}>
          <h2 
            className={`mb-2 ${getFontWeightClass(titleWeight)}`}
            style={{ 
              fontSize: `${titleSize}px`, 
              color: titleColor,
              marginBottom: `${titleMarginBottom}px`
            }}
          >
            {titleText}
          </h2>
          {subtitleText && (
            <p 
              className={`max-w-2xl ${alignment === 'center' ? 'mx-auto' : ''}`}
              style={{ 
                fontSize: `${subtitleSize}px`, 
                color: subtitleColor,
                marginBottom: `${subtitleMarginBottom}px`
              }}
            >
              {subtitleText}
            </p>
          )}
        </div>

        {/* Logos */}
        {displayCustomers.length > 0 ? (
          renderLogos()
        ) : (
          <div className="py-12 text-center border-2 border-dashed border-border rounded-3xl bg-secondary/30">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="text-primary w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-text">No hay clientes seleccionados</h3>
            <p className="text-sm text-text/60">
              Selecciona los logotipos de clientes en la Configuración Global para mostrarlos aquí.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
