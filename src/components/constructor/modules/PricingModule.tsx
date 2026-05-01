import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { Check, X, ShieldCheck, Zap, Clock, CreditCard } from 'lucide-react';
import { TYPOGRAPHY_SCALE, FONT_WEIGHTS } from '../../../constants/typography';
import { TextRenderer } from '../TextRenderer';
import { parseNumSafe } from '../utils';

const AnimatedPrice: React.FC<{ value: number, color: string, size: string, weight: string }> = ({ value, color, size, weight }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let start = displayValue;
    const end = value;
    if (start === end) return;

    const duration = 600;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutExpo = 1 - Math.pow(2, -10 * progress);
      
      const current = Math.floor(start + (end - start) * easeOutExpo);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  const fontSize = TYPOGRAPHY_SCALE[size as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 48;
  const fontWeightValue = FONT_WEIGHTS[weight as keyof typeof FONT_WEIGHTS]?.value || 900;

  return (
    <span
      style={{ 
        fontSize: `${fontSize}px`, 
        fontWeight: fontWeightValue,
        color: color 
      }}
    >
      {displayValue}
    </span>
  );
};

import { InlineEditableText } from '../InlineEditableText';
import { useEditorStore } from '../../../store/editorStore';

import { GLOBAL_ANIMATIONS, getGlobalAnimation } from '../../../constants/animations';

export const PricingModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any>,
  isPreviewMode?: boolean
}> = ({ moduleId, settingsValues, isPreviewMode = false }) => {
  const { updateSectionSettings, selectSection, selectElement } = useEditorStore();
  const [isYearly, setIsYearly] = useState(false);

  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  };

  // Global Settings
  const columns = parseNumSafe(getVal(null, 'columns', 3), 3);
  const gap = parseNumSafe(getVal(null, 'gap', 32), 32);
  const darkMode = getVal(null, 'dark_mode', false);
  const bgColor = getVal(null, 'bg_color', darkMode ? '#0F172A' : '#F8FAFC');
  const sectionGradient = getVal(null, 'section_gradient', false);
  const bgGradient = getVal(null, 'bg_gradient', 'linear-gradient(to bottom, #F8FAFC, #FFFFFF)');
  const entranceAnim = getVal(null, 'entrance_anim', 'slide-up');
  const staggerAnim = getVal(null, 'stagger_anim', true);
  
  const globalAnimOverride = getGlobalAnimation(entranceAnim, 'pricing');

  // Element: Header
  const headerEyebrow = getVal(`${moduleId}_el_pricing_header`, 'eyebrow', '');
  const headerTitle = getVal(`${moduleId}_el_pricing_header`, 'title', 'Planes diseñados para tu éxito');
  const headerSubtitle = getVal(`${moduleId}_el_pricing_header`, 'subtitle', 'Elige el plan que mejor se adapte a tus necesidades actuales.');
  const headerSubtitleSize = getVal(`${moduleId}_el_pricing_header`, 'subtitle_size', 'p');
  const headerSubtitleWeight = getVal(`${moduleId}_el_pricing_header`, 'subtitle_weight', 'normal');
  const headerAlign = getVal(`${moduleId}_el_pricing_header`, 'align', 'center');
  const headerTitleSize = getVal(`${moduleId}_el_pricing_header`, 'title_size', 't2');
  const headerTitleWeight = getVal(`${moduleId}_el_pricing_header`, 'title_weight', 'bold');
  const headerMarginB = parseNumSafe(getVal(`${moduleId}_el_pricing_header`, 'margin_b', 60), 60);

  const eyebrowColor = getVal(`${moduleId}_el_pricing_header`, 'eyebrow_color', 'var(--primary-color)');
  const eyebrowWeight = getVal(`${moduleId}_el_pricing_header`, 'eyebrow_weight', 'bold');
  const eyebrowSize = getVal(`${moduleId}_el_pricing_header`, 'eyebrow_size', 's');

  const titleHighlightType = getVal(`${moduleId}_el_pricing_header`, 'title_highlight_type', 'gradient');
  const titleHighlightColor = getVal(`${moduleId}_el_pricing_header`, 'title_highlight_color', '#3B82F6');
  const titleHighlightGradient = getVal(`${moduleId}_el_pricing_header`, 'title_highlight_gradient', 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)');
  const titleHighlightBold = getVal(`${moduleId}_el_pricing_header`, 'title_highlight_bold', true);

  const subtitleHighlightType = getVal(`${moduleId}_el_pricing_header`, 'subtitle_highlight_type', 'none');
  const subtitleHighlightColor = getVal(`${moduleId}_el_pricing_header`, 'subtitle_highlight_color', '#3B82F6');
  const subtitleHighlightGradient = getVal(`${moduleId}_el_pricing_header`, 'subtitle_highlight_gradient', 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)');
  const subtitleHighlightBold = getVal(`${moduleId}_el_pricing_header`, 'subtitle_highlight_bold', true);

  // Element: Toggle
  const showToggle = getVal(`${moduleId}_el_pricing_toggle`, 'show_toggle', true);
  const discountLabel = getVal(`${moduleId}_el_pricing_toggle`, 'discount_label', '-20%');
  const toggleBg = darkMode ? '#1E293B' : getVal(`${moduleId}_el_pricing_toggle`, 'toggle_bg', '#F1F5F9');
  const activeBg = darkMode ? '#334155' : getVal(`${moduleId}_el_pricing_toggle`, 'active_bg', '#FFFFFF');
  const activeColor = darkMode ? '#FFFFFF' : getVal(`${moduleId}_el_pricing_toggle`, 'active_color', '#0F172A');

  // Element: Card
  const cardBg = getVal(`${moduleId}_el_pricing_card`, 'card_bg', '#FFFFFF');
  const cardRadius = parseNumSafe(getVal(`${moduleId}_el_pricing_card`, 'card_radius', 32), 32);
  const highlightColor = getVal(`${moduleId}_el_pricing_card`, 'highlight_color', 'var(--primary-color)');
  const showShadow = getVal(`${moduleId}_el_pricing_card`, 'show_shadow', true);
  const hoverEffect = getVal(`${moduleId}_el_pricing_card`, 'hover_effect', 'lift');
  const glassMode = getVal(`${moduleId}_el_pricing_card`, 'glass_mode', false);

  // Element: Price
  const priceSize = getVal(`${moduleId}_el_pricing_price`, 'price_size', 't1');
  const priceWeight = getVal(`${moduleId}_el_pricing_price`, 'price_weight', 'black');
  const currencySymbol = getVal(`${moduleId}_el_pricing_price`, 'currency_symbol', '$');
  const priceColor = darkMode ? '#FFFFFF' : getVal(`${moduleId}_el_pricing_price`, 'price_color', '#0F172A');

  // Element: Features
  const featSize = getVal(`${moduleId}_el_pricing_features`, 'feat_size', 'p');
  const featWeight = getVal(`${moduleId}_el_pricing_features`, 'feat_weight', 'normal');
  const featColor = darkMode ? '#94A3B8' : getVal(`${moduleId}_el_pricing_features`, 'feat_color', '#475569');
  const iconType = getVal(`${moduleId}_el_pricing_features`, 'icon_type', 'check');
  const iconColor = getVal(`${moduleId}_el_pricing_features`, 'icon_color', 'var(--primary-color)');
  const showNegative = getVal(`${moduleId}_el_pricing_features`, 'show_negative', true);

  // Element: Trust
  const showTrust = getVal(`${moduleId}_el_pricing_trust`, 'show_trust', true);
  const trustItems = getVal(`${moduleId}_el_pricing_trust`, 'trust_items', [
    { icon: 'ShieldCheck', text: 'Garantía de 30 días' },
    { icon: 'Clock', text: 'Soporte 24/7' },
    { icon: 'CreditCard', text: 'Pagos Seguros' }
  ]);

  const plansSettings = settingsValues[`${moduleId}_el_pricing_plans_plans`] || settingsValues[`${moduleId}_global_plans`];
  
  console.log('[PRICING_PLANS_SOURCE_DEBUG]', {
    moduleId,
    directPlans: settingsValues[`${moduleId}_el_pricing_plans_plans`],
    globalPlans: settingsValues[`${moduleId}_global_plans`],
    selectedPlans: plansSettings,
    directFirstPlan: settingsValues[`${moduleId}_el_pricing_plans_plans`]?.[0],
    globalFirstPlan: settingsValues[`${moduleId}_global_plans`]?.[0],
    selectedFirstPlan: plansSettings?.[0]
  });

  const plans = plansSettings || [
    {
      name: 'Básico',
      description: 'Ideal para individuos y proyectos pequeños.',
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: '5 Proyectos\n1GB Almacenamiento\nSoporte por Email\n- Dominio Personalizado\n- Analíticas Pro',
      cta: 'Empezar Gratis',
      icon: 'Rocket',
      highlight: false
    },
    {
      name: 'Profesional',
      description: 'Para equipos que necesitan escalar rápido.',
      monthlyPrice: 29,
      yearlyPrice: 24,
      features: 'Proyectos Ilimitados\n20GB Almacenamiento\nSoporte Prioritario\nAnalíticas Avanzadas\n- SSO & Seguridad',
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
  ];

  const rawHeaderTitle = settingsValues?.[`${moduleId}_el_pricing_header_title`];
  const rawPlans = settingsValues?.[`${moduleId}_global_plans`];
  const rawColumns = settingsValues?.[`${moduleId}_global_columns`];
  const rawLayout = settingsValues?.[`${moduleId}_global_layout`];
  const rawGap = settingsValues?.[`${moduleId}_global_gap`];

  console.log('[PRICING_RENDER_DEBUG]', {
    moduleId,
    title: headerTitle,
    subtitle: headerSubtitle,
    eyebrow: headerEyebrow,
    plansCount: plans?.length,
    firstPlan: plans?.[0],
    highlightedPlan: plans?.find((p: any) => p.highlight || p.highlighted || p.featured)?.name,
    columns,
    gap,
    rawHeaderTitle: settingsValues?.[`${moduleId}_el_pricing_header_title`],
    rawHeaderSubtitle: settingsValues?.[`${moduleId}_el_pricing_header_subtitle`],
    rawHeaderEyebrow: settingsValues?.[`${moduleId}_el_pricing_header_eyebrow`],
    rawPlans: settingsValues?.[`${moduleId}_global_plans`],
    rawColumns: settingsValues?.[`${moduleId}_global_columns`],
    rawGap: settingsValues?.[`${moduleId}_global_gap`]
  });

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

  const getIcon = (iconName: string, size = 20) => {
    const IconComp = (LucideIcons as any)[iconName] || (LucideIcons as any)[iconName.replace('Check', '')] || Check;
    return <IconComp size={size} />;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: staggerAnim ? 0.15 : 0 }
    }
  };

  const itemVariants = globalAnimOverride || {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as any } }
  };

  return (
    <section 
      className="w-full relative overflow-hidden py-12 @md:py-20 @lg:py-24"
      onClick={(e) => {
        if (isPreviewMode) return;
        e.stopPropagation();
        selectSection(moduleId);
      }}
      style={{ 
        backgroundColor: bgColor,
        backgroundImage: (sectionGradient && typeof bgGradient === 'string' && !bgGradient.includes('NaN')) ? bgGradient : 'none'
      }}
    >
      <div className="max-w-7xl mx-auto px-8 @container">
        {/* Header */}
        <div 
          className={`mb-12 flex flex-col ${headerAlign === 'center' ? 'items-center text-center' : 'items-start text-left'}`}
          style={{ marginBottom: `${headerMarginB}px` }}
        >
          {headerEyebrow && (
            <span 
              className="mb-3 uppercase tracking-widest"
              style={{
                ...getTypographyStyle(eyebrowSize as any, eyebrowWeight, headerAlign),
                color: eyebrowColor
              }}
            >
              <InlineEditableText
                moduleId={moduleId}
                elementId={`${moduleId}_el_pricing_header`}
                settingId="eyebrow"
                value={headerEyebrow}
                isPreviewMode={isPreviewMode}
              >
                {headerEyebrow}
              </InlineEditableText>
            </span>
          )}
          <h2 
            className="mb-4 leading-tight"
            style={{ 
              ...getTypographyStyle(headerTitleSize as any, headerTitleWeight, headerAlign),
              color: darkMode ? '#FFFFFF' : '#0F172A'
            }}
          >
            <InlineEditableText
              moduleId={moduleId}
              elementId={`${moduleId}_el_pricing_header`}
              settingId="title"
              value={headerTitle}
              isPreviewMode={isPreviewMode}
            >
              <TextRenderer 
                text={headerTitle}
                highlightType={getVal(`${moduleId}_el_pricing_header`, 'title_highlight_type', 'gradient')}
                highlightColor={getVal(`${moduleId}_el_pricing_header`, 'title_highlight_color', '#3B82F6')}
                highlightGradient={getVal(`${moduleId}_el_pricing_header`, 'title_highlight_gradient', 'linear-gradient(to right, #3B82F6, #2563EB)')}
                highlightBold={getVal(`${moduleId}_el_pricing_header`, 'title_highlight_bold', true)}
              />
            </InlineEditableText>
          </h2>
          {headerSubtitle && (
            <p 
              className="text-lg max-w-2xl leading-relaxed"
              style={{ 
                ...getTypographyStyle(headerSubtitleSize as any, headerSubtitleWeight, headerAlign),
                color: darkMode ? '#94A3B8' : '#64748B' 
              }}
            >
              <InlineEditableText
                moduleId={moduleId}
                elementId={`${moduleId}_el_pricing_header`}
                settingId="subtitle"
                value={headerSubtitle}
                isPreviewMode={isPreviewMode}
              >
                <TextRenderer 
                  text={headerSubtitle}
                  highlightType={subtitleHighlightType}
                  highlightColor={subtitleHighlightColor}
                  highlightGradient={subtitleHighlightGradient}
                  highlightBold={subtitleHighlightBold}
                />
              </InlineEditableText>
            </p>
          )}

          {/* Toggle */}
          {showToggle && (
            <div 
              className={`mt-10 flex items-center p-1.5 rounded-2xl border shadow-sm ${darkMode ? 'border-white/10' : 'border-slate-200/50'}`}
              style={{ backgroundColor: toggleBg }}
            >
              <button 
                onClick={() => setIsYearly(false)}
                className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${!isYearly ? 'shadow-lg scale-105' : (darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700')}`}
                style={{ 
                  backgroundColor: !isYearly ? activeBg : 'transparent',
                  color: !isYearly ? activeColor : undefined
                }}
              >
                Mensual
              </button>
              <button 
                onClick={() => setIsYearly(true)}
                className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 relative ${isYearly ? 'shadow-lg scale-105' : (darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700')}`}
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
          className={`grid gap-8 grid-cols-1 @md:grid-cols-2 @lg:grid-cols-${columns} items-stretch`}
          style={{ gap: `${gap}px` }}
        >
          {plans.map((plan: any, i: number) => {
            const planFeatures = typeof plan.features === 'string' 
              ? plan.features.split(/\n|,|;/).filter((f: string) => f.trim() !== '')
              : Array.isArray(plan.features) ? plan.features : [];

            return (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={hoverEffect === 'lift' ? { y: -15 } : hoverEffect === 'glow' ? { boxShadow: `0 0 40px ${highlightColor}30` } : {}}
                onClick={(e) => {
                  if (isPreviewMode) return;
                  e.stopPropagation();
                  selectSection(moduleId);
                  selectElement(`${moduleId}_global`);
                }}
                className={`relative flex flex-col h-full transition-all duration-500 group p-6 @md:p-10 ${plan.highlight ? 'z-10' : 'z-1'} cursor-pointer`}
                style={{
                  backgroundColor: glassMode ? (darkMode ? 'rgba(30,41,59,0.7)' : 'rgba(255,255,255,0.7)') : (darkMode ? '#1E293B' : cardBg),
                  backdropFilter: glassMode ? 'blur(12px)' : 'none',
                  borderRadius: `${cardRadius}px`,
                  boxShadow: showShadow && !darkMode ? (plan.highlight ? `0 25px 60px -15px ${highlightColor}25` : '0 10px 40px -10px rgba(0,0,0,0.04)') : 'none',
                  border: plan.highlight ? `2px solid ${highlightColor}` : (darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)'),
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
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:rotate-6 duration-300"
                    style={{ backgroundColor: `${highlightColor}10`, color: highlightColor }}
                  >
                    {getIcon(plan.icon, 28)}
                  </div>
                  <h3 
                    className="text-2xl font-black mb-2"
                    style={{ color: darkMode ? '#FFFFFF' : '#0F172A' }}
                  >
                    <InlineEditableText
                      moduleId={moduleId}
                      settingId="name"
                      value={plan.name}
                      isPreviewMode={isPreviewMode}
                      onSave={(val) => {
                        const newPlans = [...plans];
                        newPlans[i] = { ...newPlans[i], name: val };
                        updateSectionSettings(moduleId, { [`${moduleId}_global_plans`]: newPlans });
                      }}
                      tagName="span"
                    />
                  </h3>
                  <p 
                    className="text-sm leading-relaxed"
                    style={{ color: darkMode ? '#94A3B8' : '#64748B' }}
                  >
                    <InlineEditableText
                      moduleId={moduleId}
                      settingId="description"
                      value={plan.description}
                      isPreviewMode={isPreviewMode}
                      onSave={(val) => {
                        const newPlans = [...plans];
                        newPlans[i] = { ...newPlans[i], description: val };
                        updateSectionSettings(moduleId, { [`${moduleId}_global_plans`]: newPlans });
                      }}
                      tagName="span"
                    />
                  </p>
                </div>

                <div className="mb-8 flex items-baseline gap-1.5">
                  <span 
                    className="text-slate-400" 
                    style={{ 
                      fontSize: `${(TYPOGRAPHY_SCALE[priceSize as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 48) * 0.5}px`,
                      fontWeight: FONT_WEIGHTS[priceWeight as keyof typeof FONT_WEIGHTS]?.value || 800 
                    }}
                  >
                    {currencySymbol}
                  </span>
                  <AnimatedPrice 
                    value={isYearly ? plan.yearlyPrice : plan.monthlyPrice} 
                    color={priceColor} 
                    size={priceSize} 
                    weight={priceWeight} 
                  />
                  <span 
                    className="text-slate-400 font-bold"
                    style={{
                      fontSize: `${Math.max(14, (TYPOGRAPHY_SCALE[priceSize as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 48) * 0.3)}px`
                    }}
                  >
                    /mes
                  </span>
                </div>

                <div className="flex-1 space-y-5 mb-10">
                  {planFeatures.map((feature: string, idx: number) => {
                    const isNegative = feature.trim().startsWith('-') || feature.trim().startsWith('x ');
                    const cleanFeature = feature.replace(/^[-x]\s*/, '');
                    
                    if (isNegative && !showNegative) return null;

                    return (
                      <div key={idx} className={`flex items-start gap-3.5 ${isNegative ? 'opacity-40 grayscale' : ''}`}>
                        <div 
                          className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ 
                            backgroundColor: isNegative ? '#E2E8F0' : `${iconColor}15`, 
                            color: isNegative ? '#94A3B8' : iconColor 
                          }}
                        >
                          {isNegative ? <X size={12} /> : getIcon(iconType, 12)}
                        </div>
                        <span 
                          className={`leading-tight ${isNegative ? 'line-through' : ''}`}
                          style={{ 
                            fontSize: `${TYPOGRAPHY_SCALE[featSize as keyof typeof TYPOGRAPHY_SCALE]?.fontSize || 14}px`,
                            fontWeight: FONT_WEIGHTS[featWeight as keyof typeof FONT_WEIGHTS]?.value || 400,
                            color: featColor 
                          }}
                        >
                          {cleanFeature}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {plan.cta && (
                  <a 
                    href={plan.cta_url || plan.url || plan.link || '#'}
                    target={(plan.cta_target || plan.target) === '_blank' ? '_blank' : '_self'}
                    rel={(plan.cta_target || plan.target) === '_blank' ? 'noopener noreferrer' : undefined}
                    className="w-full py-4 rounded-2xl font-black text-sm transition-all active:scale-95 overflow-hidden relative group/btn text-center block"
                    style={{ 
                      backgroundColor: plan.highlight ? highlightColor : (darkMode ? '#334155' : '#F1F5F9'),
                      color: plan.highlight ? '#FFFFFF' : (darkMode ? '#FFFFFF' : '#0F172A'),
                      boxShadow: plan.highlight ? `0 15px 30px -8px ${highlightColor}40` : 'none'
                    }}
                  >
                    <span className="relative z-10">{plan.cta}</span>
                    {plan.highlight && (
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                    )}
                  </a>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Trust Section */}
        {showTrust && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`mt-16 pt-12 border-t flex flex-wrap justify-center gap-x-12 gap-y-6 ${darkMode ? 'border-white/10' : 'border-slate-200/60'}`}
          >
            {trustItems.map((item: any, idx: number) => (
              <div key={idx} className={`flex items-center gap-3 transition-colors group ${darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>
                <div className={`transition-colors ${darkMode ? 'text-slate-600 group-hover:text-primary' : 'text-slate-300 group-hover:text-primary'}`}>
                  {getIcon(item.icon, 20)}
                </div>
                <span className="text-sm font-bold tracking-wide uppercase">{item.text}</span>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};
