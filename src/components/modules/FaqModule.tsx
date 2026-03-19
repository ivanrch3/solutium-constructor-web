import React, { useState } from 'react';
import { HelpCircle, Plus, Minus, MessageCircle, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Typography } from '../ui/Typography';
import { ModuleWrapper } from '../ui/ModuleWrapper';
import { usePageLayout } from '../../context/PageLayoutContext';

interface FaqModuleProps {
  data: any;
  onUpdate?: (data: any) => void;
}

export const FaqModule = ({ data, onUpdate }: FaqModuleProps) => {
  const { previewDevice } = usePageLayout();
  const isMobileSimulated = previewDevice === 'mobile';
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  
  const layoutType = data?.layoutType || 'accordion'; // accordion, grid, minimal
  const items = data?.items || [
    { q: '¿Cómo funciona la sincronización con Solutium?', a: 'Es automática. Una vez conectas tu cuenta, todos tus productos y leads se sincronizan en tiempo real sin necesidad de configuración manual adicional.' },
    { q: '¿Puedo usar mi propio dominio?', a: 'Sí, en el plan Pro y superiores puedes conectar cualquier dominio que ya poseas. También ofrecemos subdominios gratuitos para que empieces de inmediato.' },
    { q: '¿Ofrecen soporte técnico?', a: 'Por supuesto. Nuestro equipo está disponible 24/7 para ayudarte con cualquier duda o problema técnico que puedas tener durante tu experiencia.' },
    { q: '¿Hay algún costo oculto?', a: 'No, nuestra política de precios es totalmente transparente. Lo que ves en nuestra página de precios es exactamente lo que pagarás mensualmente.' }
  ];

  const handleTextUpdate = (path: string, value: string) => {
    if (onUpdate) {
      const newData = { ...data };
      const parts = path.split('.');
      let current = newData;
      for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i];
        if (Array.isArray(current[key])) {
          current[key] = [...current[key]];
        } else {
          current[key] = { ...current[key] };
        }
        current = current[key];
      }
      current[parts[parts.length - 1]] = value;
      onUpdate(newData);
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
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const renderAccordionItem = (item: any, i: number) => {
    const isExpanded = expandedIndex === i;
    
    return (
      <motion.div 
        key={i}
        variants={itemVariants}
        className={`group border-b border-current/10 last:border-0 transition-all duration-300 ${isExpanded ? 'bg-current/[0.02]' : 'hover:bg-current/[0.01]'}`}
      >
        <button 
          onClick={() => setExpandedIndex(isExpanded ? null : i)}
          className={`w-full flex items-center justify-between text-left py-6 ${isMobileSimulated ? 'px-4' : 'px-6'}`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-xl transition-all duration-300 ${isExpanded ? 'bg-primary text-white scale-110' : 'bg-current/5 text-primary group-hover:bg-current/10'}`}>
              <HelpCircle className="w-5 h-5" />
            </div>
            <Typography
              variant="h4"
              className={`${isMobileSimulated ? 'text-base' : 'text-lg'} font-black tracking-tight`}
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate(`items.${i}.q`, text)}
            >
              {item.q}
            </Typography>
          </div>
          <div className={`p-2 rounded-full transition-transform duration-500 ${isExpanded ? 'rotate-180 bg-primary/10 text-primary' : 'bg-current/5 text-current/40'}`}>
            {isExpanded ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </div>
        </button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className={`${isMobileSimulated ? 'px-4 pb-8' : 'px-20 pb-8'} opacity-70 leading-relaxed`}>
                <Typography
                  variant="p"
                  className={`${isMobileSimulated ? 'text-sm' : 'text-base'} font-medium`}
                  editable={!!onUpdate}
                  onUpdate={(text) => handleTextUpdate(`items.${i}.a`, text)}
                >
                  {item.a}
                </Typography>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const renderGridItem = (item: any, i: number) => (
    <motion.div 
      key={i}
      variants={itemVariants}
      className={`p-8 bg-current/[0.03] rounded-[2rem] border border-current/5 hover:border-primary/20 hover:bg-current/[0.05] transition-all duration-300 group`}
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-primary/10 text-primary rounded-2xl group-hover:scale-110 transition-transform duration-300">
          <HelpCircle className="w-6 h-6" />
        </div>
        <Typography
          variant="h4"
          className="text-xl font-black tracking-tight"
          editable={!!onUpdate}
          onUpdate={(text) => handleTextUpdate(`items.${i}.q`, text)}
        >
          {item.q}
        </Typography>
      </div>
      <Typography
        variant="p"
        className="text-base opacity-60 leading-relaxed font-medium"
        editable={!!onUpdate}
        onUpdate={(text) => handleTextUpdate(`items.${i}.a`, text)}
      >
        {item.a}
      </Typography>
    </motion.div>
  );

  return (
    <ModuleWrapper 
      theme={data?.theme}
      background={data?.background}
    >
      <div className={`${isMobileSimulated ? 'max-w-full' : 'max-w-6xl'} mx-auto px-6`}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`text-center ${isMobileSimulated ? 'mb-12' : 'mb-20'}`}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            </div>
            <span className="text-primary font-black tracking-[0.3em] uppercase text-[10px]">Centro de Ayuda</span>
          </div>
          <Typography
            variant="h2"
            className={`${isMobileSimulated ? 'text-4xl' : 'text-5xl md:text-6xl'} font-black tracking-tighter mb-6 leading-none`}
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate('title', text)}
          >
            {data?.title || 'Preguntas Frecuentes'}
          </Typography>
          <Typography
            variant="p"
            className={`${isMobileSimulated ? 'text-lg' : 'text-xl md:text-2xl'} opacity-60 max-w-3xl mx-auto font-medium tracking-tight`}
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate('subtitle', text)}
          >
            {data?.subtitle || 'Todo lo que necesitas saber sobre nuestro servicio y cómo podemos ayudarte a crecer.'}
          </Typography>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className={layoutType === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-8' : 'space-y-2 max-w-4xl mx-auto'}
        >
          {items.map((item: any, i: number) => (
            layoutType === 'grid' ? renderGridItem(item, i) : renderAccordionItem(item, i)
          ))}
        </motion.div>

        {/* Support CTA */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className={`mt-20 p-8 md:p-12 bg-primary rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-primary/20 relative overflow-hidden group`}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700" />
          <div className="relative z-10 text-center md:text-left">
            <Typography variant="h3" className="text-3xl font-black tracking-tighter mb-3">
              ¿Aún tienes dudas?
            </Typography>
            <Typography variant="p" className="text-lg opacity-80 font-medium">
              Nuestro equipo de soporte está listo para ayudarte en cualquier momento.
            </Typography>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="relative z-10 px-10 py-5 bg-white text-primary font-black text-sm uppercase tracking-[0.2em] rounded-2xl hover:bg-white/95 transition-all shadow-xl flex items-center gap-3 group"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Hablar con Soporte</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    </ModuleWrapper>
  );
};
