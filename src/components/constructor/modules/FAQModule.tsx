import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, ChevronDown, Search, HelpCircle } from 'lucide-react';

const DEFAULT_FAQS = [
  {
    question: "¿Cómo puedo empezar con la plataforma?",
    answer: "Es muy sencillo. Solo tienes que registrarte con tu correo electrónico, elegir una plantilla que te guste y empezar a personalizarla con nuestro editor visual. No necesitas conocimientos de programación."
  },
  {
    question: "¿Ofrecen soporte técnico personalizado?",
    answer: "Sí, todos nuestros planes incluyen soporte. Los planes Pro y Enterprise cuentan con soporte prioritario 24/7 a través de chat y correo electrónico para resolver cualquier duda técnica."
  },
  {
    question: "¿Puedo usar mi propio dominio?",
    answer: "¡Por supuesto! Puedes vincular cualquier dominio que ya poseas o adquirir uno nuevo directamente desde nuestro panel de administración. Nosotros nos encargamos de la configuración SSL gratuita."
  },
  {
    question: "¿Cuáles son los métodos de pago aceptados?",
    answer: "Aceptamos todas las tarjetas de crédito y débito principales (Visa, Mastercard, American Express), así como PayPal y transferencias bancarias para planes anuales Enterprise."
  },
  {
    question: "¿Puedo cancelar mi suscripción en cualquier momento?",
    answer: "Sí, no hay contratos de permanencia. Puedes cancelar tu suscripción desde los ajustes de tu cuenta en cualquier momento y seguirás teniendo acceso hasta el final del periodo facturado."
  }
];

export const FAQModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any> 
}> = ({ moduleId, settingsValues }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  };

  // Global Settings
  const layout = getVal(null, 'layout', 'single');
  const maxWidth = getVal(null, 'max_width', 800);
  const paddingY = getVal(null, 'padding_y', 100);
  const bgColor = getVal(null, 'bg_color', '#FFFFFF');
  const entranceAnim = getVal(null, 'entrance_anim', true);
  const singleOpen = getVal(null, 'single_open', true);

  // Element: Header
  const headerTitle = getVal(`${moduleId}_el_faq_header`, 'title', 'Preguntas Frecuentes');
  const headerSubtitle = getVal(`${moduleId}_el_faq_header`, 'subtitle', 'Todo lo que necesitas saber sobre nuestro servicio.');
  const headerAlign = getVal(`${moduleId}_el_faq_header`, 'align', 'center');
  const headerTitleSize = getVal(`${moduleId}_el_faq_header`, 'title_size', 32);
  const headerMarginB = getVal(`${moduleId}_el_faq_header`, 'margin_b', 60);

  // Element: Search
  const showSearch = getVal(`${moduleId}_el_faq_search`, 'show_search', true);
  const searchPlaceholder = getVal(`${moduleId}_el_faq_search`, 'placeholder', 'Buscar una pregunta...');
  const searchBg = getVal(`${moduleId}_el_faq_search`, 'search_bg', '#F1F5F9');
  const searchRadius = getVal(`${moduleId}_el_faq_search`, 'search_radius', 16);

  // Element: Item
  const faqs = getVal(`${moduleId}_el_faq_item`, 'faqs', DEFAULT_FAQS);
  const itemBg = getVal(`${moduleId}_el_faq_item`, 'item_bg', 'transparent');
  const activeBg = getVal(`${moduleId}_el_faq_item`, 'active_bg', '#F8FAFC');
  const borderColor = getVal(`${moduleId}_el_faq_item`, 'border_color', '#E2E8F0');
  const showBorder = getVal(`${moduleId}_el_faq_item`, 'show_border', true);
  const qSize = getVal(`${moduleId}_el_faq_item`, 'q_size', 16);
  const qColor = getVal(`${moduleId}_el_faq_item`, 'q_color', '#0F172A');
  const aSize = getVal(`${moduleId}_el_faq_item`, 'a_size', 15);
  const aColor = getVal(`${moduleId}_el_faq_item`, 'a_color', '#64748B');
  const iconType = getVal(`${moduleId}_el_faq_item`, 'icon_type', 'plus');

  // Element: CTA
  const showCta = getVal(`${moduleId}_el_faq_cta`, 'show_cta', true);
  const ctaText = getVal(`${moduleId}_el_faq_cta`, 'cta_text', '¿Aún tienes dudas?');
  const btnText = getVal(`${moduleId}_el_faq_cta`, 'btn_text', 'Contactar Soporte');
  const btnBg = getVal(`${moduleId}_el_faq_cta`, 'btn_bg', 'var(--primary-color)');

  const filteredFaqs = useMemo(() => {
    if (!searchQuery) return faqs;
    return faqs.filter((faq: any) => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, faqs]);

  const toggleItem = (index: number) => {
    if (singleOpen) {
      setOpenIndex(openIndex === index ? null : index);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <section 
      className="w-full relative overflow-hidden py-12 @md:py-20 @lg:py-24"
      style={{ 
        backgroundColor: bgColor
      }}
    >
      <div 
        className="mx-auto px-8"
        style={{ maxWidth: `${maxWidth}px` }}
      >
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

          {/* Search Bar */}
          {showSearch && (
            <div className="mt-8 w-full max-w-md relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                style={{ 
                  backgroundColor: searchBg,
                  borderRadius: `${searchRadius}px`
                }}
              />
            </div>
          )}
        </div>

        {/* FAQ List */}
        <motion.div 
          variants={containerVariants}
          initial={entranceAnim ? "hidden" : false}
          whileInView="visible"
          viewport={{ once: true }}
          className={`grid gap-4 ${layout === 'double' ? '@md:grid-cols-2' : 'grid-cols-1'}`}
        >
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    backgroundColor: isOpen ? activeBg : itemBg,
                    borderRadius: '16px',
                    border: showBorder ? `1px solid ${borderColor}` : 'none'
                  }}
                >
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left group"
                  >
                    <span 
                      className="font-bold leading-tight transition-colors"
                      style={{ fontSize: `${qSize}px`, color: isOpen ? 'var(--primary-color)' : qColor }}
                    >
                      {faq.question}
                    </span>
                    <div className={`flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                      {iconType === 'plus' ? (
                        isOpen ? <Minus size={20} className="text-primary" /> : <Plus size={20} className="text-slate-400 group-hover:text-slate-600" />
                      ) : (
                        <ChevronDown size={20} className={isOpen ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'} />
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
                        <div className="px-6 pb-6 pt-0">
                          <p 
                            className="leading-relaxed"
                            style={{ fontSize: `${aSize}px`, color: aColor }}
                          >
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          ) : (
            <div className="py-12 text-center col-span-full">
              <HelpCircle size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-medium">No se encontraron resultados para tu búsqueda.</p>
            </div>
          )}
        </motion.div>

        {/* CTA Section */}
        {showCta && (
          <motion.div 
            initial={entranceAnim ? { opacity: 0, y: 20 } : {}}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 p-8 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col @md:flex-row items-center justify-between gap-6 text-center @md:text-left"
          >
            <div>
              <h4 className="text-xl font-black text-slate-900 mb-1">{ctaText}</h4>
              <p className="text-slate-500">Nuestro equipo está listo para ayudarte con cualquier otra pregunta.</p>
            </div>
            <button 
              className="px-8 py-4 rounded-2xl font-black text-sm text-white shadow-xl shadow-primary/20 hover:scale-105 transition-all active:scale-95"
              style={{ backgroundColor: btnBg }}
            >
              {btnText}
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
};
