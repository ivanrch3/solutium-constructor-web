import React from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Typography } from '../ui/Typography';
import { ModuleWrapper } from '../ui/ModuleWrapper';
import { usePageLayout } from '../../context/PageLayoutContext';

export const PricingModule = ({ data, onCTA, onUpdate }: { data: any, onCTA: (e: React.MouseEvent) => void, onUpdate?: (data: any) => void }) => {
  const { previewDevice } = usePageLayout();
  const isMobileSimulated = previewDevice === 'mobile';
  const billingCycle = data?.billingCycle || 'monthly';
  const plans = data?.plans || [
    { 
      name: 'Básico', 
      monthlyPrice: '$19', 
      annualPrice: '$15',
      description: 'Ideal para proyectos personales y freelancers.',
      features: [{ text: '1 Proyecto' }, { text: 'Soporte Email' }, { text: 'Actualizaciones básicas' }] 
    },
    { 
      name: 'Pro', 
      monthlyPrice: '$49', 
      annualPrice: '$39',
      description: 'Para negocios en crecimiento que necesitan más potencia.',
      features: [{ text: 'Proyectos Ilimitados' }, { text: 'Soporte 24/7' }, { text: 'Dominio Personalizado' }, { text: 'Analíticas Avanzadas' }], 
      popular: true 
    },
    { 
      name: 'Enterprise', 
      monthlyPrice: '$99', 
      annualPrice: '$79',
      description: 'Soluciones a medida para grandes organizaciones.',
      features: [{ text: 'Todo lo de Pro' }, { text: 'Gestor de cuenta dedicado' }, { text: 'SLA garantizado' }, { text: 'Seguridad avanzada' }] 
    }
  ];

  const handleTextUpdate = (path: string, value: string) => {
    if (onUpdate) {
      const newData = { ...data };
      if (!newData.plans) newData.plans = plans;

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

  const setBillingCycle = (cycle: 'monthly' | 'annual') => {
    if (onUpdate) {
      onUpdate({ ...data, billingCycle: cycle });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <ModuleWrapper 
      theme={data?.theme}
      background={data?.background}
    >
      <div className="max-w-7xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Typography
            variant="h2"
            className="text-4xl md:text-6xl font-black mb-6 tracking-tight"
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate('title', text)}
            highlightType={data?.titleStyle?.highlightType}
            highlightColor1={data?.titleStyle?.highlightColor1}
            highlightColor2={data?.titleStyle?.highlightColor2}
          >
            {data?.title || 'Planes Flexibles'}
          </Typography>
          <Typography
            variant="p"
            className="text-xl opacity-60 max-w-2xl mx-auto leading-relaxed mb-10"
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate('subtitle', text)}
          >
            {data?.subtitle || 'Elige el plan que mejor se adapte a tus necesidades.'}
          </Typography>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`text-sm font-black uppercase tracking-widest transition-all duration-300 ${billingCycle === 'monthly' ? 'text-primary scale-110' : 'opacity-40 hover:opacity-60'}`}
            >
              <Typography
                variant="span"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('monthlyLabel', text)}
              >
                {data?.monthlyLabel || 'Mensual'}
              </Typography>
            </button>
            
            <button 
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className="w-16 h-8 bg-current/5 border border-current/10 rounded-full relative transition-all hover:border-primary/50 group"
            >
              <motion.div 
                animate={{ x: billingCycle === 'monthly' ? 4 : 36 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="absolute top-1 w-6 h-6 bg-primary rounded-full shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform" 
              />
            </button>

            <button
              onClick={() => setBillingCycle('annual')}
              className={`flex items-center gap-3 text-sm font-black uppercase tracking-widest transition-all duration-300 ${billingCycle === 'annual' ? 'text-primary scale-110' : 'opacity-40 hover:opacity-60'}`}
            >
              <Typography
                variant="span"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('annualLabel', text)}
              >
                {data?.annualLabel || 'Anual'}
              </Typography>
              <span className="inline-block bg-emerald-500/10 text-emerald-500 text-[10px] px-3 py-1 rounded-full border border-emerald-500/20">
                <Typography
                  variant="span"
                  editable={!!onUpdate}
                  onUpdate={(text) => handleTextUpdate('discountLabel', text)}
                >
                  {data?.discountLabel || '-20%'}
                </Typography>
              </span>
            </button>
          </div>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className={`grid ${isMobileSimulated ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'} gap-8 max-w-6xl mx-auto`}
        >
          {plans.map((plan: any, idx: number) => (
            <motion.div 
              key={idx} 
              variants={itemVariants}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className={`p-8 md:p-10 rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden flex flex-col group ${
                plan.popular 
                  ? 'bg-primary text-white border-primary shadow-2xl shadow-primary/30 scale-100 md:scale-105 z-10' 
                  : 'bg-current/5 border-current/10 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5'
              }`}
            >
              {plan.popular && (
                <>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-16 -mt-16" />
                  <div className="absolute top-6 right-6 bg-white text-primary text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-xl flex items-center gap-2 z-20">
                    <Sparkles className="w-3.5 h-3.5" />
                    <Typography
                      variant="span"
                      editable={!!onUpdate}
                      onUpdate={(text) => handleTextUpdate('popularLabel', text)}
                    >
                      {data?.popularLabel || 'Más Popular'}
                    </Typography>
                  </div>
                </>
              )}
              
              <div className="mb-8 relative z-10">
                <Typography
                  variant="h3"
                  className={`text-2xl font-black mb-3 ${plan.popular ? 'text-white' : ''}`}
                  editable={!!onUpdate}
                  onUpdate={(text) => handleTextUpdate(`plans.${idx}.name`, text)}
                >
                  {plan.name}
                </Typography>
                <Typography
                  variant="p"
                  className={`text-sm leading-relaxed font-medium ${plan.popular ? 'text-white/70' : 'opacity-60'}`}
                  editable={!!onUpdate}
                  onUpdate={(text) => handleTextUpdate(`plans.${idx}.description`, text)}
                >
                  {plan.description}
                </Typography>
              </div>

              <div className="mb-10 flex items-baseline gap-2 relative z-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={billingCycle}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-baseline gap-2"
                  >
                    <Typography
                      variant="span"
                      className="text-6xl font-black tracking-tighter"
                      editable={!!onUpdate}
                      onUpdate={(text) => handleTextUpdate(billingCycle === 'monthly' ? `plans.${idx}.monthlyPrice` : `plans.${idx}.annualPrice`, text)}
                    >
                      {billingCycle === 'monthly' 
                        ? (plan.monthlyPrice || plan.price || '$0') 
                        : (plan.annualPrice || plan.price || '$0')}
                    </Typography>
                    <span className={`text-sm font-black uppercase tracking-widest ${plan.popular ? 'text-white/40' : 'opacity-40'}`}>
                      <Typography
                        variant="span"
                        editable={!!onUpdate}
                        onUpdate={(text) => handleTextUpdate('perMonthLabel', text)}
                      >
                        {data?.perMonthLabel || '/mes'}
                      </Typography>
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>

              <ul className="space-y-5 mb-12 flex-1 relative z-10">
                {plan.features?.map((feat: any, i: number) => (
                  <li key={i} className="flex items-start gap-4 text-sm group/feat">
                    <div className={`mt-0.5 p-0.5 rounded-full transition-colors ${plan.popular ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary group-hover/feat:bg-primary group-hover/feat:text-white'}`}>
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    </div>
                    <Typography
                      variant="span"
                      className={`leading-tight font-medium ${plan.popular ? 'text-white/80' : 'opacity-70'}`}
                      editable={!!onUpdate}
                      onUpdate={(text) => handleTextUpdate(`plans.${idx}.features.${i}.text`, text)}
                    >
                      {typeof feat === 'string' ? feat : feat.text}
                    </Typography>
                  </li>
                ))}
              </ul>

              <motion.button 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCTA}
                className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all relative z-10 ${
                  plan.popular 
                    ? 'bg-white text-primary hover:bg-white/95 shadow-xl shadow-white/10' 
                    : 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20'
                }`}
              >
                <Typography
                  variant="span"
                  editable={!!onUpdate}
                  onUpdate={(text) => handleTextUpdate('ctaLabel', text)}
                >
                  {data?.ctaLabel || 'Empezar ahora'}
                </Typography>
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </ModuleWrapper>
  );
};
