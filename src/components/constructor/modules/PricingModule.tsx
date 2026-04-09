import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { Check } from 'lucide-react';

export const PricingModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any> 
}> = ({ moduleId, settingsValues }) => {
  const [isYearly, setIsYearly] = useState(false);

  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  };

  // Global Settings
  const columns = getVal(null, 'columns', 3);
  const gap = getVal(null, 'gap', 32);
  const paddingY = getVal(null, 'padding_y', 100);
  const bgColor = getVal(null, 'bg_color', '#F8FAFC');
  const entranceAnim = getVal(null, 'entrance_anim', true);
  const staggerAnim = getVal(null, 'stagger_anim', true);

  // Element: Header
  const headerTitle = getVal(`${moduleId}_el_pricing_header`, 'title', 'Planes diseñados para tu éxito');
  const headerSubtitle = getVal(`${moduleId}_el_pricing_header`, 'subtitle', 'Elige el plan que mejor se adapte a tus necesidades actuales.');
  const headerAlign = getVal(`${moduleId}_el_pricing_header`, 'align', 'center');
  const headerTitleSize = getVal(`${moduleId}_el_pricing_header`, 'title_size', 32);
  const headerMarginB = getVal(`${moduleId}_el_pricing_header`, 'margin_b', 60);

  // Element: Toggle
  const showToggle = getVal(`${moduleId}_el_pricing_toggle`, 'show_toggle', true);
  const discountLabel = getVal(`${moduleId}_el_pricing_toggle`, 'discount_label', '-20%');
  const toggleBg = getVal(`${moduleId}_el_pricing_toggle`, 'toggle_bg', '#F1F5F9');
  const activeBg = getVal(`${moduleId}_el_pricing_toggle`, 'active_bg', '#FFFFFF');
  const activeColor = getVal(`${moduleId}_el_pricing_toggle`, 'active_color', '#0F172A');
  const toggleType = getVal(`${moduleId}_el_pricing_toggle`, 'toggle_type', 'switch');

  // Element: Card
  const cardBg = getVal(`${moduleId}_el_pricing_card`, 'card_bg', '#FFFFFF');
  const cardRadius = getVal(`${moduleId}_el_pricing_card`, 'card_radius', 32);
  const highlightColor = getVal(`${moduleId}_el_pricing_card`, 'highlight_color', 'var(--primary-color)');
  const showShadow = getVal(`${moduleId}_el_pricing_card`, 'show_shadow', true);
  const cardPadding = getVal(`${moduleId}_el_pricing_card`, 'card_padding', 40);
  const featuredScale = getVal(`${moduleId}_el_pricing_card`, 'featured_scale', 105) / 100;
  const hoverEffect = getVal(`${moduleId}_el_pricing_card`, 'hover_effect', 'lift');

  // Element: Price
  const priceSize = getVal(`${moduleId}_el_pricing_price`, 'price_size', 48);
  const priceWeight = getVal(`${moduleId}_el_pricing_price`, 'price_weight', 'black');
  const currencySymbol = getVal(`${moduleId}_el_pricing_price`, 'currency_symbol', '$');
  const priceColor = getVal(`${moduleId}_el_pricing_price`, 'price_color', '#0F172A');

  // Element: Features
  const featSize = getVal(`${moduleId}_el_pricing_features`, 'feat_size', 14);
  const featColor = getVal(`${moduleId}_el_pricing_features`, 'feat_color', '#475569');
  const iconType = getVal(`${moduleId}_el_pricing_features`, 'icon_type', 'check');
  const iconColor = getVal(`${moduleId}_el_pricing_features`, 'icon_color', 'var(--primary-color)');

  const plans = getVal(null, 'plans', [
    {
      name: 'Básico',
      description: 'Ideal para individuos y proyectos pequeños.',
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: '5 Proyectos\n1GB Almacenamiento\nSoporte por Email\nDominio Personalizado',
      cta: 'Empezar Gratis',
      icon: 'Rocket',
      highlight: false
    },
    {
      name: 'Profesional',
      description: 'Para equipos que necesitan escalar rápido.',
      monthlyPrice: 29,
      yearlyPrice: 24,
      features: 'Proyectos Ilimitados\n20GB Almacenamiento\nSoporte Prioritario\nAnalíticas Avanzadas\nColaboradores (hasta 5)',
      cta: 'Prueba Pro Gratis',
      icon: 'Zap',
      highlight: true,
      badge: 'MÁS POPULAR'
    },
    {
      name: 'Empresa',
      description: 'Seguridad y control para grandes organizaciones.',
      monthlyPrice: 99,
      yearlyPrice: 89,
      features: 'Todo en Pro\nAlmacenamiento Ilimitado\nSoporte 24/7\nSSO & Seguridad\nGestor de Cuenta',
      cta: 'Contactar Ventas',
      icon: 'Shield',
      highlight: false
    }
  ]);

  const getIcon = (iconName: string, size = 20) => {
    const IconComp = (LucideIcons as any)[iconName] || Check;
    return <IconComp size={size} />;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: staggerAnim ? 0.15 : 0 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <section 
      className="w-full relative overflow-hidden py-12 @md:py-20 @lg:py-24"
      style={{ 
        backgroundColor: bgColor
      }}
    >
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <div 
          className={`mb-12 flex flex-col ${headerAlign === 'center' ? 'items-center text-center' : 'items-start text-left'}`}
          style={{ marginBottom: `${headerMarginB}px` }}
        >
          <h2 
            className="font-black text-slate-900 mb-4 leading-tight text-3xl @md:text-4xl @lg:text-5xl"
          >
            {headerTitle}
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl leading-relaxed">
            {headerSubtitle}
          </p>

          {/* Toggle */}
          {showToggle && (
            <div 
              className="mt-10 flex items-center p-1.5 rounded-2xl border border-slate-200/50"
              style={{ backgroundColor: toggleBg }}
            >
              <button 
                onClick={() => setIsYearly(false)}
                className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${!isYearly ? 'shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
                style={{ 
                  backgroundColor: !isYearly ? activeBg : 'transparent',
                  color: !isYearly ? activeColor : undefined
                }}
              >
                Mensual
              </button>
              <button 
                onClick={() => setIsYearly(true)}
                className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 relative ${isYearly ? 'shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
                style={{ 
                  backgroundColor: isYearly ? activeBg : 'transparent',
                  color: isYearly ? activeColor : undefined
                }}
              >
                Anual
                <span 
                  className="absolute -top-3 -right-3 px-2 py-0.5 rounded-full text-[10px] font-black shadow-lg animate-bounce"
                  style={{ backgroundColor: highlightColor, color: '#FFFFFF' }}
                >
                  {discountLabel}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Pricing Grid */}
        <motion.div 
          variants={containerVariants}
          initial={entranceAnim ? "hidden" : false}
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className={`grid gap-8 grid-cols-1 @md:grid-cols-2 @lg:grid-cols-${columns} items-center`}
          style={{ gap: `${gap}px` }}
        >
          {plans.map((plan: any, i: number) => {
            const planFeatures = typeof plan.features === 'string' 
              ? plan.features.split('\n').filter((f: string) => f.trim() !== '')
              : Array.isArray(plan.features) ? plan.features : [];

            return (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={hoverEffect === 'lift' ? { y: -15 } : hoverEffect === 'glow' ? { boxShadow: `0 0 40px ${highlightColor}30` } : {}}
                className={`relative flex flex-col h-full transition-all duration-500 group p-6 @md:p-10 ${plan.highlight ? 'z-10' : 'z-1'}`}
                style={{
                  backgroundColor: cardBg,
                  borderRadius: `${cardRadius}px`,
                  boxShadow: showShadow ? (plan.highlight ? `0 25px 60px -15px ${highlightColor}25` : '0 10px 40px -10px rgba(0,0,0,0.04)') : 'none',
                  border: plan.highlight ? `2px solid ${highlightColor}` : '1px solid rgba(0,0,0,0.05)',
                }}
              >
                {plan.badge && (
                  <div 
                    className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full text-[10px] font-black tracking-widest text-white shadow-xl"
                    style={{ backgroundColor: highlightColor }}
                  >
                    {plan.badge}
                  </div>
                )}

                <div className="mb-8">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300"
                    style={{ backgroundColor: `${highlightColor}10`, color: highlightColor }}
                  >
                    {getIcon(plan.icon, 28)}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">{plan.name}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{plan.description}</p>
                </div>

                <div className="mb-8 flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-slate-400">{currencySymbol}</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={isYearly ? 'yearly' : 'monthly'}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.2 }}
                      className="leading-none"
                      style={{ 
                        fontSize: `${priceSize}px`, 
                        fontWeight: priceWeight === 'black' ? 900 : 700,
                        color: priceColor 
                      }}
                    >
                      {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-slate-400 font-bold text-sm">/mes</span>
                </div>

                <div className="flex-1 space-y-5 mb-10">
                  {planFeatures.map((feature: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3.5">
                      <div 
                        className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${iconColor}15`, color: iconColor }}
                      >
                        {getIcon(iconType, 12)}
                      </div>
                      <span 
                        className="font-medium leading-tight"
                        style={{ fontSize: `${featSize}px`, color: featColor }}
                      >
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <button 
                  className="w-full py-4 rounded-2xl font-black text-sm transition-all active:scale-95 overflow-hidden relative group/btn"
                  style={{ 
                    backgroundColor: plan.highlight ? highlightColor : '#F1F5F9',
                    color: plan.highlight ? '#FFFFFF' : '#0F172A',
                    boxShadow: plan.highlight ? `0 15px 30px -8px ${highlightColor}40` : 'none'
                  }}
                >
                  <span className="relative z-10">{plan.cta}</span>
                  {plan.highlight && (
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                  )}
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
