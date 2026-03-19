import React from 'react';
import { Rocket, Settings, UserPlus, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Typography } from '../ui/Typography';
import { ModuleWrapper } from '../ui/ModuleWrapper';
import { usePageLayout } from '../../context/PageLayoutContext';

interface ProcessModuleProps {
  data: any;
  onUpdate?: (data: any) => void;
}

export const ProcessModule = ({ data, onUpdate }: ProcessModuleProps) => {
  const { previewDevice } = usePageLayout();
  const isMobileSimulated = previewDevice === 'mobile';
  
  const layoutType = data?.layoutType || 'horizontal'; // horizontal, vertical, zigzag
  const steps = data?.steps || [
    { step: '01', title: 'Regístrate', desc: 'Crea tu cuenta en segundos y accede al panel de control intuitivo.', icon: <UserPlus className="w-8 h-8" /> },
    { step: '02', title: 'Configura', desc: 'Personaliza tus preferencias y sincroniza tus datos con un solo clic.', icon: <Settings className="w-8 h-8" /> },
    { step: '03', title: 'Lanza', desc: 'Publica tu sitio y empieza a recibir clientes de forma inmediata.', icon: <Rocket className="w-8 h-8" /> }
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
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const renderStep = (item: any, i: number) => {
    const isLast = i === steps.length - 1;
    
    if (layoutType === 'zigzag') {
      return (
        <motion.div 
          key={i} 
          variants={itemVariants}
          className={`flex flex-col md:flex-row items-center gap-12 md:gap-24 mb-24 last:mb-0 ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
        >
          <div className="w-full md:w-1/2 relative">
            <div className="absolute inset-0 bg-primary/10 rounded-[3rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative aspect-video bg-current/[0.03] rounded-[3rem] border border-current/10 flex items-center justify-center group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              <div className="relative z-10 p-12 bg-white/10 backdrop-blur-md rounded-[2.5rem] border border-white/20 shadow-2xl scale-110 group-hover:scale-125 transition-transform duration-700 text-primary">
                {item.icon || <CheckCircle2 className="w-12 h-12" />}
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2 text-left">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-6xl font-black text-primary/20 tracking-tighter leading-none">{item.step}</span>
              <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
            </div>
            <Typography
              variant="h3"
              className="text-3xl md:text-4xl font-black tracking-tighter mb-6 leading-tight"
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate(`steps.${i}.title`, text)}
            >
              {item.title}
            </Typography>
            <Typography
              variant="p"
              className="text-lg md:text-xl opacity-60 leading-relaxed font-medium tracking-tight mb-8"
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate(`steps.${i}.desc`, text)}
            >
              {item.desc}
            </Typography>
            <motion.button 
              whileHover={{ x: 5 }}
              className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs"
            >
              <span>Saber más</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div key={i} variants={itemVariants} className="relative text-center group">
        {!isLast && layoutType === 'horizontal' && !isMobileSimulated && (
          <div className="absolute top-12 left-[60%] right-[-40%] h-px bg-gradient-to-r from-primary/30 via-primary/10 to-transparent z-0" />
        )}
        
        <div className="relative z-10">
          <div className="relative mb-10 mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-primary/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-110" />
            <div className="relative w-full h-full bg-current/[0.03] rounded-[2rem] flex items-center justify-center font-black text-primary border border-current/10 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-500 shadow-xl group-hover:shadow-primary/30">
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-white text-primary rounded-full flex items-center justify-center text-xs font-black shadow-lg border border-primary/10">
                {item.step}
              </div>
              {item.icon || <CheckCircle2 className="w-8 h-8" />}
            </div>
          </div>
          <Typography
            variant="h3"
            className="text-2xl font-black tracking-tight mb-4"
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate(`steps.${i}.title`, text)}
          >
            {item.title}
          </Typography>
          <Typography
            variant="p"
            className="opacity-60 text-base leading-relaxed font-medium tracking-tight max-w-xs mx-auto"
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate(`steps.${i}.desc`, text)}
          >
            {item.desc}
          </Typography>
        </div>
      </motion.div>
    );
  };

  return (
    <ModuleWrapper 
      theme={data?.theme}
      background={data?.background}
    >
      <div className={`${isMobileSimulated ? 'max-w-full' : 'max-w-7xl'} mx-auto px-6`}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`text-center ${isMobileSimulated ? 'mb-16' : 'mb-24'}`}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            </div>
            <span className="text-primary font-black tracking-[0.3em] uppercase text-[10px]">Metodología</span>
          </div>
          <Typography
            variant="h2"
            className={`${isMobileSimulated ? 'text-4xl' : 'text-5xl md:text-7xl'} font-black tracking-tighter mb-6 leading-none`}
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate('title', text)}
          >
            {data?.title || '¿Cómo funciona?'}
          </Typography>
          <Typography
            variant="p"
            className={`${isMobileSimulated ? 'text-lg' : 'text-xl md:text-2xl'} opacity-60 max-w-3xl mx-auto font-medium tracking-tight`}
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate('subtitle', text)}
          >
            {data?.subtitle || 'Un proceso simple y transparente diseñado para tu comodidad y el éxito de tu proyecto.'}
          </Typography>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className={layoutType === 'zigzag' ? 'flex flex-col' : `grid ${isMobileSimulated ? 'grid-cols-1 gap-20' : 'md:grid-cols-3 gap-16'} relative`}
        >
          {steps.map((item: any, i: number) => renderStep(item, i))}
        </motion.div>
      </div>
    </ModuleWrapper>
  );
};
