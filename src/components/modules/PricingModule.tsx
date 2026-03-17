import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Typography } from '../ui/Typography';
import { ModuleWrapper } from '../ui/ModuleWrapper';
import { usePageLayout } from '../../context/PageLayoutContext';

export const PricingModule = ({ data, onCTA, onUpdate }: { data: any, onCTA: (e: React.MouseEvent) => void, onUpdate?: (data: any) => void }) => {
  const { previewDevice } = usePageLayout();
  const is_mobile_simulated = previewDevice === 'mobile';
  const billing_cycle = data?.billing_cycle || 'monthly';
  const plans = data?.plans || [
    { 
      name: 'Básico', 
      monthly_price: '$19', 
      annual_price: '$15',
      description: 'Ideal para proyectos personales y freelancers.',
      features: [{ text: '1 Proyecto' }, { text: 'Soporte Email' }, { text: 'Actualizaciones básicas' }] 
    },
    { 
      name: 'Pro', 
      monthly_price: '$49', 
      annual_price: '$39',
      description: 'Para negocios en crecimiento que necesitan más potencia.',
      features: [{ text: 'Proyectos Ilimitados' }, { text: 'Soporte 24/7' }, { text: 'Dominio Personalizado' }, { text: 'Analíticas Avanzadas' }], 
      popular: true 
    },
    { 
      name: 'Enterprise', 
      monthly_price: '$99', 
      annual_price: '$79',
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
      onUpdate({ ...data, billing_cycle: cycle });
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
              className={`text-sm font-bold uppercase tracking-widest transition-colors ${billing_cycle === 'monthly' ? 'text-primary' : 'opacity-40'}`}
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate('monthly_label', text)}
            >
              {data?.monthly_label || 'Mensual'}
            </Typography>
            <button 
              onClick={() => setBillingCycle(billing_cycle === 'monthly' ? 'annual' : 'monthly')}
              className="w-14 h-7 bg-current/5 border border-current/10 rounded-full relative transition-colors hover:border-primary/50"
            >
              <div className={`absolute top-1 w-5 h-5 bg-primary rounded-full transition-all duration-300 ${billing_cycle === 'monthly' ? 'left-1' : 'left-8'}`} />
            </button>
            <span className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors ${billing_cycle === 'annual' ? 'text-primary' : 'opacity-40'}`}>
              <Typography
                variant="span"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('annual_label', text)}
              >
                {data?.annual_label || 'Anual'}
              </Typography>
              <span className="inline-block bg-emerald-500/10 text-emerald-500 text-[10px] px-2 py-0.5 rounded-full">
                <Typography
                  variant="span"
                  editable={!!onUpdate}
                  onUpdate={(text) => handleTextUpdate('discount_label', text)}
                >
                  {data?.discount_label || '-20%'}
                </Typography>
              </span>
            </span>
          </div>
        </div>

        <div className={`grid ${is_mobile_simulated ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'} gap-8 max-w-6xl mx-auto`}>
          {plans.map((plan: any, idx: number) => (
            <div 
              key={idx} 
              className={`p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden flex flex-col ${
                plan.popular 
                  ? 'bg-primary text-white border-primary shadow-2xl shadow-primary/20 scale-100 md:scale-105 z-10' 
                  : 'bg-current/5 border-current/10 hover:border-primary/50 hover:shadow-xl'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-6 right-6 bg-white text-primary text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                  <Typography
                    variant="span"
                    editable={!!onUpdate}
                    onUpdate={(text) => handleTextUpdate('popular_label', text)}
                  >
                    {data?.popular_label || 'Más Popular'}
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
                  onUpdate={(text) => handleTextUpdate(billing_cycle === 'monthly' ? `plans.${idx}.monthly_price` : `plans.${idx}.annual_price`, text)}
                >
                  {billing_cycle === 'monthly' ? plan.monthly_price : plan.annual_price}
                </Typography>
                <span className={`text-sm font-bold uppercase tracking-widest ${plan.popular ? 'text-white/40' : 'opacity-40'}`}>
                  <Typography
                    variant="span"
                    editable={!!onUpdate}
                    onUpdate={(text) => handleTextUpdate('per_month_label', text)}
                  >
                    {data?.per_month_label || '/mes'}
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
                  onUpdate={(text) => handleTextUpdate('cta_label', text)}
                >
                  {data?.cta_label || 'Empezar ahora'}
                </Typography>
              </button>
            </div>
          ))}
        </div>
      </div>
    </ModuleWrapper>
  );
};
