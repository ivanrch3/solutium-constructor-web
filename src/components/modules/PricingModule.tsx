import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Typography } from '../ui/Typography';
import { ModuleWrapper } from '../ui/ModuleWrapper';

export const PricingModule = ({ data, onCTA, onUpdate }: { data: any, onCTA: (e: React.MouseEvent) => void, onUpdate?: (data: any) => void }) => {
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

  return (
    <ModuleWrapper 
      theme={data?.theme}
      background={data?.background}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Typography
            variant="h2"
            className="text-4xl md:text-5xl font-black mb-6 tracking-tight"
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate('title', text)}
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
          <div className="flex items-center justify-center gap-4">
            <Typography
              variant="span"
              className={`text-sm font-bold uppercase tracking-widest transition-colors ${billingCycle === 'monthly' ? 'text-primary' : 'opacity-40'}`}
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate('monthlyLabel', text)}
            >
              {data?.monthlyLabel || 'Mensual'}
            </Typography>
            <button 
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className="w-14 h-7 bg-current/5 border border-current/10 rounded-full relative transition-colors hover:border-primary/50"
            >
              <div className={`absolute top-1 w-5 h-5 bg-primary rounded-full transition-all duration-300 ${billingCycle === 'monthly' ? 'left-1' : 'left-8'}`} />
            </button>
            <span className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors ${billingCycle === 'annual' ? 'text-primary' : 'opacity-40'}`}>
              <Typography
                variant="span"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('annualLabel', text)}
              >
                {data?.annualLabel || 'Anual'}
              </Typography>
              <span className="inline-block bg-emerald-500/10 text-emerald-500 text-[10px] px-2 py-0.5 rounded-full">
                <Typography
                  variant="span"
                  editable={!!onUpdate}
                  onUpdate={(text) => handleTextUpdate('discountLabel', text)}
                >
                  {data?.discountLabel || '-20%'}
                </Typography>
              </span>
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan: any, idx: number) => (
            <div 
              key={idx} 
              className={`p-10 rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden flex flex-col ${
                plan.popular 
                  ? 'bg-primary text-white border-primary shadow-2xl shadow-primary/20 scale-105 z-10' 
                  : 'bg-current/5 border-current/10 hover:border-primary/50 hover:shadow-xl'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-6 right-6 bg-white text-primary text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                  <Typography
                    variant="span"
                    editable={!!onUpdate}
                    onUpdate={(text) => handleTextUpdate('popularLabel', text)}
                  >
                    {data?.popularLabel || 'Más Popular'}
                  </Typography>
                </div>
              )}
              
              <div className="mb-8">
                <Typography
                  variant="h3"
                  className={`text-2xl font-black mb-2 ${plan.popular ? 'text-white' : ''}`}
                  editable={!!onUpdate}
                  onUpdate={(text) => handleTextUpdate(`plans.${idx}.name`, text)}
                >
                  {plan.name}
                </Typography>
                <Typography
                  variant="p"
                  className={`text-sm leading-relaxed ${plan.popular ? 'text-white/60' : 'opacity-60'}`}
                  editable={!!onUpdate}
                  onUpdate={(text) => handleTextUpdate(`plans.${idx}.description`, text)}
                >
                  {plan.description}
                </Typography>
              </div>

              <div className="mb-8 flex items-baseline gap-2">
                <Typography
                  variant="span"
                  className="text-5xl font-black tracking-tighter"
                  editable={!!onUpdate}
                  onUpdate={(text) => handleTextUpdate(billingCycle === 'monthly' ? `plans.${idx}.monthlyPrice` : `plans.${idx}.annualPrice`, text)}
                >
                  {billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice}
                </Typography>
                <span className={`text-sm font-bold uppercase tracking-widest ${plan.popular ? 'text-white/40' : 'opacity-40'}`}>
                  <Typography
                    variant="span"
                    editable={!!onUpdate}
                    onUpdate={(text) => handleTextUpdate('perMonthLabel', text)}
                  >
                    {data?.perMonthLabel || '/mes'}
                  </Typography>
                </span>
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {plan.features?.map((feat: any, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${plan.popular ? 'text-white' : 'text-primary'}`} />
                    <Typography
                      variant="span"
                      className={`leading-tight ${plan.popular ? 'text-white/70' : 'opacity-70'}`}
                      editable={!!onUpdate}
                      onUpdate={(text) => handleTextUpdate(`plans.${idx}.features.${i}.text`, text)}
                    >
                      {typeof feat === 'string' ? feat : feat.text}
                    </Typography>
                  </li>
                ))}
              </ul>

              <button 
                onClick={onCTA}
                className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 ${
                  plan.popular 
                    ? 'bg-white text-primary hover:bg-white/90 shadow-lg' 
                    : 'bg-primary text-white hover:bg-primary/90'
                }`}
              >
                <Typography
                  variant="span"
                  editable={!!onUpdate}
                  onUpdate={(text) => handleTextUpdate('ctaLabel', text)}
                >
                  {data?.ctaLabel || 'Empezar ahora'}
                </Typography>
              </button>
            </div>
          ))}
        </div>
      </div>
    </ModuleWrapper>
  );
};
