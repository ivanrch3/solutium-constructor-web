import React from 'react';
import { BookOpen, Target, Heart, Zap, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Typography } from '../ui/Typography';
import { ModuleWrapper } from '../ui/ModuleWrapper';
import { usePageLayout } from '../../context/PageLayoutContext';

interface AboutModuleProps {
  data: any;
  onUpdate?: (data: any) => void;
}

export const AboutModule = ({ data, onUpdate }: AboutModuleProps) => {
  const { previewDevice } = usePageLayout();
  const isMobileSimulated = previewDevice === 'mobile';
  
  const layoutType = data?.layoutType || 'split'; // split, centered, minimal
  const showValues = data?.showValues !== false;
  const values = data?.values || [
    { icon: <Target className="w-6 h-6" />, title: 'Misión', desc: 'Democratizar el acceso a la mejor tecnología para negocios de todos los tamaños.' },
    { icon: <Heart className="w-6 h-6" />, title: 'Pasión', desc: 'Nos apasiona crear soluciones que generen un impacto real en nuestros clientes.' },
    { icon: <Zap className="w-6 h-6" />, title: 'Innovación', desc: 'Buscamos constantemente nuevas formas de mejorar y evolucionar digitalmente.' }
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
      transition: { staggerChildren: 0.15 }
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

  const renderContent = () => (
    <div className={layoutType === 'centered' ? 'text-center max-w-4xl mx-auto' : 'text-left'}>
      <motion.div variants={itemVariants} className={`flex items-center gap-3 mb-8 ${layoutType === 'centered' ? 'justify-center' : 'justify-start'}`}>
        <div className="p-2 bg-primary/10 rounded-xl">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
        <Typography
          variant="span"
          className="text-primary font-black tracking-[0.3em] uppercase text-[10px]"
          editable={!!onUpdate}
          onUpdate={(text) => handleTextUpdate('badge', text)}
        >
          {data?.badge || 'Nuestra Historia'}
        </Typography>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Typography
          variant="h2"
          className={`${isMobileSimulated ? 'text-4xl' : 'text-5xl md:text-7xl'} font-black tracking-tighter mb-8 leading-none`}
          editable={!!onUpdate}
          onUpdate={(text) => handleTextUpdate('title', text)}
        >
          {data?.title || 'Más de 10 años impulsando el éxito digital'}
        </Typography>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Typography
          variant="p"
          className={`${isMobileSimulated ? 'text-lg' : 'text-xl md:text-2xl'} opacity-60 mb-12 leading-relaxed font-medium tracking-tight`}
          editable={!!onUpdate}
          onUpdate={(text) => handleTextUpdate('description', text)}
        >
          {data?.description || 'Nacimos con una misión clara: democratizar el acceso a la mejor tecnología para negocios de todos los tamaños. Hoy, somos líderes en soluciones inteligentes para el mercado hispano.'}
        </Typography>
      </motion.div>

      <motion.div variants={itemVariants} className={`grid grid-cols-2 gap-12 mb-16 ${layoutType === 'centered' ? 'max-w-md mx-auto' : ''}`}>
        <div className="group">
          <Typography
            variant="h4"
            className={`${isMobileSimulated ? 'text-4xl' : 'text-5xl'} font-black text-primary mb-2 group-hover:scale-110 transition-transform origin-left`}
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate('stat1.value', text)}
          >
            {data?.stat1?.value || '99%'}
          </Typography>
          <Typography
            variant="p"
            className="text-xs font-black uppercase tracking-[0.2em] opacity-40"
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate('stat1.label', text)}
          >
            {data?.stat1?.label || 'Satisfacción'}
          </Typography>
        </div>
        <div className="group">
          <Typography
            variant="h4"
            className={`${isMobileSimulated ? 'text-4xl' : 'text-5xl'} font-black mb-2 group-hover:scale-110 transition-transform origin-left`}
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate('stat2.value', text)}
          >
            {data?.stat2?.value || '24/7'}
          </Typography>
          <Typography
            variant="p"
            className="text-xs font-black uppercase tracking-[0.2em] opacity-40"
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate('stat2.label', text)}
          >
            {data?.stat2?.label || 'Soporte Real'}
          </Typography>
        </div>
      </motion.div>

      {showValues && (
        <motion.div variants={itemVariants} className={`grid grid-cols-1 md:grid-cols-3 gap-8 ${layoutType === 'centered' ? 'text-center' : 'text-left'}`}>
          {values.map((v: any, i: number) => (
            <div key={i} className="group">
              <div className={`p-3 bg-current/[0.03] rounded-2xl w-fit mb-4 group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-300 ${layoutType === 'centered' ? 'mx-auto' : ''}`}>
                {v.icon}
              </div>
              <Typography variant="h4" className="text-lg font-black tracking-tight mb-2">{v.title}</Typography>
              <Typography variant="p" className="text-sm opacity-60 leading-relaxed font-medium">{v.desc}</Typography>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );

  return (
    <ModuleWrapper 
      theme={data?.theme}
      background={data?.background}
    >
      <div className={`${isMobileSimulated ? 'max-w-full' : 'max-w-7xl'} mx-auto px-6`}>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className={`grid grid-cols-1 ${layoutType === 'split' && !isMobileSimulated ? 'lg:grid-cols-2' : ''} gap-24 items-center`}
        >
          {layoutType === 'split' && !isMobileSimulated && (
            <motion.div variants={itemVariants} className="relative group">
              <div className="absolute inset-0 bg-primary/20 rounded-[4rem] blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="relative aspect-[4/5] rounded-[4rem] overflow-hidden border-[12px] border-current/5 shadow-2xl">
                <motion.img 
                  whileHover={{ scale: 1.05 }}
                  src={data?.image || `https://picsum.photos/seed/about/1000/1250`} 
                  alt="About Us" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-12">
                  <div className="text-white">
                    <Typography variant="h3" className="text-3xl font-black tracking-tighter mb-2">Nuestra Esencia</Typography>
                    <Typography variant="p" className="text-lg opacity-80 font-medium">Comprometidos con tu crecimiento digital.</Typography>
                  </div>
                </div>
              </div>
              
              {/* Floating Badge */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-10 -right-10 p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl border border-current/5 z-20"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary rounded-2xl text-white">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-black tracking-tighter text-current">10+ Años</div>
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-40">De Experiencia</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {renderContent()}
        </motion.div>
      </div>
    </ModuleWrapper>
  );
};
