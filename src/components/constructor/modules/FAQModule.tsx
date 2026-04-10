import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, ChevronDown, Search, HelpCircle, MessageCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import * as LucideIcons from 'lucide-react';

const DEFAULT_CATEGORIES = [
  { id: 'all', label: 'Todas' },
  { id: 'general', label: 'General' },
  { id: 'pagos', label: 'Pagos' },
  { id: 'soporte', label: 'Soporte' }
];

const DEFAULT_FAQS = [
  {
    category: 'general',
    question: "¿Cómo puedo empezar con la plataforma?",
    answer: "Es muy sencillo. Solo tienes que registrarte con tu correo electrónico, elegir una plantilla que te guste y empezar a personalizarla con nuestro editor visual. No necesitas conocimientos de programación.\n\n**Pasos principales:**\n1. Registro gratuito\n2. Selección de plantilla\n3. Personalización visual\n4. Publicación",
    icon: 'Zap'
  },
  {
    category: 'soporte',
    question: "¿Ofrecen soporte técnico personalizado?",
    answer: "Sí, todos nuestros planes incluyen soporte. Los planes Pro y Enterprise cuentan con soporte prioritario 24/7 a través de chat y correo electrónico para resolver cualquier duda técnica.\n\n[Contactar soporte ahora](mailto:soporte@ejemplo.com)",
    icon: 'LifeBuoy'
  },
  {
    category: 'general',
    question: "¿Puedo usar mi propio dominio?",
    answer: "¡Por supuesto! Puedes vincular cualquier dominio que ya poseas o adquirir uno nuevo directamente desde nuestro panel de administración. Nosotros nos encargamos de la configuración SSL gratuita.",
    icon: 'Globe'
  },
  {
    category: 'pagos',
    question: "¿Cuáles son los métodos de pago aceptados?",
    answer: "Aceptamos todas las tarjetas de crédito y débito principales (Visa, Mastercard, American Express), así como PayPal y transferencias bancarias para planes anuales Enterprise.",
    icon: 'CreditCard'
  },
  {
    category: 'general',
    question: "¿Puedo cancelar mi suscripción en cualquier momento?",
    answer: "Sí, no hay contratos de permanencia. Puedes cancelar tu suscripción desde los ajustes de tu cuenta en cualquier momento y seguirás teniendo acceso hasta el final del periodo facturado.",
    icon: 'ShieldCheck'
  }
];

const IconRenderer = ({ name, size = 20, className = "" }: { name: string, size?: number, className?: string }) => {
  const IconComponent = (LucideIcons as any)[name];
  if (!IconComponent) return null;
  return <IconComponent size={size} className={className} />;
};

export const FAQModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any> 
}> = ({ moduleId, settingsValues }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const scrollRef = useRef<HTMLDivElement>(null);

  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  };

  // Global Settings
  const categories = getVal(null, 'categories', DEFAULT_CATEGORIES);
  const layout = getVal(null, 'layout', 'single');
  const maxWidth = getVal(null, 'max_width', 1000);
  const paddingY = getVal(null, 'padding_y', 100);
  const bgColor = getVal(null, 'bg_color', '#FFFFFF');
  const glassmorphism = getVal(null, 'glassmorphism', false);
  const dividerStyle = getVal(null, 'divider_style', 'line');
  const entranceAnim = getVal(null, 'entrance_anim', true);
  const singleOpen = getVal(null, 'single_open', true);
  const scrollToActive = getVal(null, 'scroll_to_active', false);
  const itemGap = getVal(null, 'item_gap', 16);

  // Element: Header
  const headerTitle = getVal(`${moduleId}_el_faq_header`, 'title', 'Preguntas Frecuentes');
  const headerSubtitle = getVal(`${moduleId}_el_faq_header`, 'subtitle', 'Todo lo que necesitas saber sobre nuestro servicio.');
  const headerAlign = getVal(`${moduleId}_el_faq_header`, 'align', 'center');
  const headerTitleSize = getVal(`${moduleId}_el_faq_header`, 'title_size', 40);
  const headerTitleWeight = getVal(`${moduleId}_el_faq_header`, 'title_weight', '900');
  const headerMarginB = getVal(`${moduleId}_el_faq_header`, 'margin_b', 60);

  // Element: Search
  const showSearch = getVal(`${moduleId}_el_faq_search`, 'show_search', true);
  const searchPlaceholder = getVal(`${moduleId}_el_faq_search`, 'placeholder', 'Buscar una pregunta...');
  const searchBg = getVal(`${moduleId}_el_faq_search`, 'search_bg', '#F1F5F9');
  const searchRadius = getVal(`${moduleId}_el_faq_search`, 'search_radius', 16);
  const searchBorder = getVal(`${moduleId}_el_faq_search`, 'search_border', 'var(--primary-color)');

  // Element: Item
  const faqs = getVal(`${moduleId}_el_faq_item`, 'faqs', DEFAULT_FAQS);
  const itemBg = getVal(`${moduleId}_el_faq_item`, 'item_bg', 'transparent');
  const activeBg = getVal(`${moduleId}_el_faq_item`, 'active_bg', '#F8FAFC');
  const borderColor = getVal(`${moduleId}_el_faq_item`, 'border_color', '#E2E8F0');
  const showBorder = getVal(`${moduleId}_el_faq_item`, 'show_border', true);
  const activeShadow = getVal(`${moduleId}_el_faq_item`, 'active_shadow', true);
  const qSize = getVal(`${moduleId}_el_faq_item`, 'q_size', 18);
  const qWeight = getVal(`${moduleId}_el_faq_item`, 'q_weight', '700');
  const qColor = getVal(`${moduleId}_el_faq_item`, 'q_color', '#0F172A');
  const aSize = getVal(`${moduleId}_el_faq_item`, 'a_size', 16);
  const aColor = getVal(`${moduleId}_el_faq_item`, 'a_color', '#64748B');
  const iconType = getVal(`${moduleId}_el_faq_item`, 'icon_type', 'plus');
  const showItemIcons = getVal(`${moduleId}_el_faq_item`, 'show_item_icons', false);

  // Element: CTA
  const showCta = getVal(`${moduleId}_el_faq_cta`, 'show_cta', true);
  const ctaText = getVal(`${moduleId}_el_faq_cta`, 'cta_text', '¿Aún tienes dudas?');
  const btnText = getVal(`${moduleId}_el_faq_cta`, 'btn_text', 'Contactar Soporte');
  const btnBg = getVal(`${moduleId}_el_faq_cta`, 'btn_bg', 'var(--primary-color)');
  const ctaBg = getVal(`${moduleId}_el_faq_cta`, 'cta_bg', '#F8FAFC');
  const btnLink = getVal(`${moduleId}_el_faq_cta`, 'btn_link', '#');

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq: any) => {
      const matchesSearch = !searchQuery || 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, faqs]);

  const toggleItem = (index: number) => {
    const newIndex = openIndex === index ? null : index;
    setOpenIndex(newIndex);
  };

  useEffect(() => {
    if (scrollToActive && openIndex !== null && scrollRef.current) {
      const activeElement = scrollRef.current.querySelector(`[data-faq-index="${openIndex}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [openIndex, scrollToActive]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  };

  const renderFaqItem = (faq: any, index: number) => {
    const isOpen = openIndex === index;
    
    return (
      <motion.div
        key={index}
        data-faq-index={index}
        variants={itemVariants}
        layout
        className={`overflow-hidden transition-all duration-300 ${glassmorphism ? 'backdrop-blur-md bg-white/30' : ''}`}
        style={{
          backgroundColor: isOpen ? activeBg : itemBg,
          borderRadius: '20px',
          border: showBorder ? `1px solid ${borderColor}` : 'none',
          boxShadow: isOpen && activeShadow ? '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' : 'none',
          marginBottom: `${itemGap}px`
        }}
      >
        <button
          onClick={() => toggleItem(index)}
          className="w-full px-7 py-6 flex items-center justify-between gap-4 text-left group"
        >
          <div className="flex items-center gap-4">
            {showItemIcons && faq.icon && (
              <div className={`p-2.5 rounded-xl transition-colors ${isOpen ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'}`}>
                <IconRenderer name={faq.icon} size={20} />
              </div>
            )}
            <span 
              className="leading-tight transition-colors"
              style={{ 
                fontSize: `${qSize}px`, 
                fontWeight: qWeight,
                color: isOpen ? 'var(--primary-color)' : qColor 
              }}
            >
              {faq.question}
            </span>
          </div>
          <div className={`flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            {iconType === 'plus' ? (
              isOpen ? <Minus size={22} className="text-primary" /> : <Plus size={22} className="text-slate-400 group-hover:text-slate-600" />
            ) : (
              <ChevronDown size={22} className={isOpen ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'} />
            )}
          </div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="px-7 pb-7 pt-0">
                {dividerStyle !== 'none' && (
                  <div className={`mb-6 border-t ${dividerStyle === 'dots' ? 'border-dotted' : 'border-solid'}`} style={{ borderColor: borderColor }} />
                )}
                <div 
                  className="prose prose-slate max-w-none"
                  style={{ fontSize: `${aSize}px`, color: aColor }}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {faq.answer}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
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
      <div 
        className="mx-auto px-6 @md:px-12"
        style={{ maxWidth: `${maxWidth}px` }}
      >
        {/* Header */}
        <div 
          className={`mb-12 flex flex-col ${headerAlign === 'center' ? 'items-center text-center' : 'items-start text-left'}`}
          style={{ marginBottom: `${headerMarginB}px` }}
        >
          <h2 
            className="text-slate-900 mb-6 leading-[1.1] tracking-tight"
            style={{ 
              fontSize: `${headerTitleSize}px`,
              fontWeight: headerTitleWeight
            }}
          >
            {headerTitle}
          </h2>
          <p className="text-slate-500 text-lg @md:text-xl max-w-2xl leading-relaxed">
            {headerSubtitle}
          </p>

          {/* Search Bar */}
          {showSearch && (
            <div className="mt-10 w-full max-w-xl relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
              <input 
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4.5 text-base font-medium border-2 border-transparent focus:outline-none transition-all shadow-sm"
                style={{ 
                  backgroundColor: searchBg,
                  borderRadius: `${searchRadius}px`,
                  borderColor: searchQuery ? searchBorder : 'transparent'
                }}
              />
            </div>
          )}
        </div>

        {/* Categories Tabs */}
        {categories.length > 1 && (
          <div className={`flex flex-wrap gap-2 mb-10 ${headerAlign === 'center' ? 'justify-center' : 'justify-start'}`}>
            {categories.map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                  activeCategory === cat.id 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* FAQ Content Layouts */}
        <div ref={scrollRef}>
          {layout === 'tabs_left' ? (
            <div className="grid grid-cols-1 @lg:grid-cols-[250px_1fr] gap-12">
              <div className="hidden @lg:flex flex-col gap-2 sticky top-24 h-fit">
                {categories.map((cat: any) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-6 py-4 rounded-2xl text-left font-bold transition-all flex items-center justify-between group ${
                      activeCategory === cat.id 
                        ? 'bg-primary/5 text-primary border-l-4 border-primary' 
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {cat.label}
                    <ChevronDown size={16} className={`-rotate-90 transition-transform ${activeCategory === cat.id ? 'translate-x-1' : 'opacity-0'}`} />
                  </button>
                ))}
              </div>
              <motion.div 
                variants={containerVariants}
                initial={entranceAnim ? "hidden" : false}
                animate="visible"
                className="flex flex-col"
              >
                {filteredFaqs.map((faq, index) => renderFaqItem(faq, index))}
              </motion.div>
            </div>
          ) : layout === 'tabs_top' ? (
            <div className="flex flex-col gap-8">
              <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar">
                {categories.map((cat: any) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`whitespace-nowrap px-8 py-4 rounded-2xl font-bold transition-all border-2 ${
                      activeCategory === cat.id 
                        ? 'border-primary bg-primary text-white shadow-xl shadow-primary/20' 
                        : 'border-slate-100 text-slate-500 hover:border-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <motion.div 
                variants={containerVariants}
                initial={entranceAnim ? "hidden" : false}
                animate="visible"
                className="grid grid-cols-1 gap-4"
              >
                {filteredFaqs.map((faq, index) => renderFaqItem(faq, index))}
              </motion.div>
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial={entranceAnim ? "hidden" : false}
              animate="visible"
              className={`grid gap-4 ${layout === 'double' ? '@md:grid-cols-2' : 'grid-cols-1'}`}
            >
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, index) => renderFaqItem(faq, index))
              ) : (
                <div className="py-20 text-center col-span-full">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <HelpCircle size={40} className="text-slate-200" />
                  </div>
                  <p className="text-slate-400 text-lg font-medium">No se encontraron resultados para tu búsqueda.</p>
                  <button 
                    onClick={() => {setSearchQuery(''); setActiveCategory('all');}}
                    className="mt-4 text-primary font-bold hover:underline"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* CTA Section */}
        {showCta && (
          <motion.div 
            initial={entranceAnim ? { opacity: 0, y: 30 } : {}}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 p-10 rounded-[2.5rem] flex flex-col @md:flex-row items-center justify-between gap-8 text-center @md:text-left relative overflow-hidden group"
            style={{ backgroundColor: ctaBg }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-primary/10 transition-colors" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3 justify-center @md:justify-start">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <MessageCircle className="text-primary" size={20} />
                </div>
                <h4 className="text-2xl font-black text-slate-900">{ctaText}</h4>
              </div>
              <p className="text-slate-500 text-lg max-w-md">Nuestro equipo está listo para ayudarte con cualquier otra pregunta técnica o comercial.</p>
            </div>
            
            <a 
              href={btnLink}
              className="relative z-10 px-10 py-5 rounded-2xl font-black text-base text-white shadow-2xl shadow-primary/30 hover:scale-105 hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3"
              style={{ backgroundColor: btnBg }}
            >
              {btnText}
              <Plus size={20} />
            </a>
          </motion.div>
        )}
      </div>
    </section>
  );
};
