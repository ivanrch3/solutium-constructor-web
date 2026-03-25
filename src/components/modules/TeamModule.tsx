import React from 'react';
import { Linkedin, Twitter, Github, Sparkles, Instagram } from 'lucide-react';
import { motion } from 'motion/react';
import { Typography } from '../ui/Typography';
import { ModuleWrapper } from '../ui/ModuleWrapper';
import { usePageLayout } from '../../context/PageLayoutContext';

interface TeamModuleProps {
  data: any;
  onUpdate?: (data: any) => void;
}

export const TeamModule = ({ data, onUpdate }: TeamModuleProps) => {
  const { previewDevice } = usePageLayout();
  const isMobileSimulated = previewDevice === 'mobile';
  
  const layoutType = data?.layoutType || 'grid'; // grid, minimal, cards
  const entranceAnimation = data?.entranceAnimation || 'fade';
  const smartMode = data?.smartMode || false;

  const effectiveLayout = smartMode 
    ? (isMobileSimulated ? 'cards' : 'grid')
    : layoutType;

  const getAnimationVariants = (idx: number) => {
    switch (entranceAnimation) {
      case 'slide':
        return {
          hidden: { opacity: 0, x: -30 },
          visible: { 
            opacity: 1, 
            x: 0,
            transition: { duration: 0.6, delay: idx * 0.1 }
          }
        };
      case 'zoom':
        return {
          hidden: { opacity: 0, scale: 0.8 },
          visible: { 
            opacity: 1, 
            scale: 1,
            transition: { duration: 0.8, delay: idx * 0.1 }
          }
        };
      default: // fade
        return {
          hidden: { opacity: 0, y: 20 },
          visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.7, delay: idx * 0.1 }
          }
        };
    }
  };

  const items = data?.items || [
    { name: 'Alex Rivera', role: 'CEO & Fundador', image: '', bio: 'Visionario tecnológico con más de 15 años de experiencia en el sector digital.', social: { linkedin: '#', twitter: '#' } },
    { name: 'Elena Santos', role: 'Directora de Diseño', image: '', bio: 'Apasionada por crear experiencias de usuario intuitivas y visualmente impactantes.', social: { linkedin: '#', instagram: '#' } },
    { name: 'Marcos Díaz', role: 'CTO', image: '', bio: 'Arquitecto de software especializado en sistemas escalables y de alto rendimiento.', social: { github: '#', linkedin: '#' } },
    { name: 'Sofía Luna', role: 'Marketing Manager', image: '', bio: 'Estratega digital enfocada en el crecimiento y la conexión emocional con la marca.', social: { twitter: '#', instagram: '#' } }
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

  const renderSocialIcon = (type: string, url: string) => {
    const icons: any = {
      linkedin: <Linkedin className="w-4 h-4" />,
      twitter: <Twitter className="w-4 h-4" />,
      github: <Github className="w-4 h-4" />,
      instagram: <Instagram className="w-4 h-4" />
    };
    
    return (
      <motion.a 
        key={type}
        href={url}
        whileHover={{ y: -3, scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="p-2 bg-current/5 hover:bg-primary hover:text-white rounded-lg transition-colors duration-300"
      >
        {icons[type]}
      </motion.a>
    );
  };

  const renderTeamMember = (item: any, i: number) => {
    const animation = getAnimationVariants(i);
    if (effectiveLayout === 'minimal') {
      return (
        <motion.div key={i} variants={animation} className="text-center group">
          <div className="relative mb-6 mx-auto w-48 h-48">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-110" />
            <div className="relative aspect-square rounded-full overflow-hidden border-4 border-current/5 group-hover:border-primary/30 transition-all duration-500">
              <motion.img 
                whileHover={{ scale: 1.1 }}
                src={item.image || `https://picsum.photos/seed/team${i}/400/400`} 
                alt={item.name} 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <Typography
            variant="h4"
            className="text-xl font-black tracking-tight"
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate(`items.${i}.name`, text)}
          >
            {item.name}
          </Typography>
          <Typography
            variant="p"
            className="text-xs font-black uppercase tracking-[0.2em] text-primary mt-2"
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate(`items.${i}.role`, text)}
          >
            {item.role}
          </Typography>
          <div className="flex justify-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {item.social && Object.entries(item.social).map(([type, url]) => renderSocialIcon(type, url as string))}
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div 
        key={i} 
        variants={animation} 
        className="group bg-current/[0.02] hover:bg-current/[0.04] rounded-[2.5rem] p-6 border border-current/5 hover:border-primary/20 transition-all duration-500"
      >
        <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden mb-8">
          <motion.img 
            whileHover={{ scale: 1.05 }}
            src={item.image || `https://picsum.photos/seed/team${i}/500/625`} 
            alt={item.name} 
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
            <div className="flex gap-3">
              {item.social && Object.entries(item.social).map(([type, url]) => (
                <motion.a 
                  key={type}
                  href={url as string}
                  whileHover={{ y: -3 }}
                  className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-white hover:text-primary transition-colors duration-300"
                >
                  {renderSocialIcon(type, url as string)}
                </motion.a>
              ))}
            </div>
          </div>
        </div>
        <div className="text-left">
          <Typography
            variant="h4"
            className="text-2xl font-black tracking-tighter"
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate(`items.${i}.name`, text)}
          >
            {item.name}
          </Typography>
          <Typography
            variant="p"
            className="text-xs font-black uppercase tracking-[0.2em] text-primary mt-2 mb-4"
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate(`items.${i}.role`, text)}
          >
            {item.role}
          </Typography>
          <Typography
            variant="p"
            className="text-sm opacity-60 leading-relaxed font-medium line-clamp-2"
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate(`items.${i}.bio`, text)}
          >
            {item.bio}
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
          className={`text-center ${isMobileSimulated ? 'mb-12' : 'mb-24'}`}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            </div>
            <span className="text-primary font-black tracking-[0.3em] uppercase text-[10px]">Nuestro Talento</span>
          </div>
          <Typography
            variant="h2"
            className={`${isMobileSimulated ? 'text-4xl' : 'text-5xl md:text-7xl'} font-black tracking-tighter mb-6 leading-none`}
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate('title', text)}
          >
            {data?.title || 'Mentes Brillantes'}
          </Typography>
          <Typography
            variant="p"
            className={`${isMobileSimulated ? 'text-lg' : 'text-xl md:text-2xl'} opacity-60 max-w-3xl mx-auto font-medium tracking-tight`}
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate('subtitle', text)}
          >
            {data?.subtitle || 'Un equipo multidisciplinar unido por la pasión de crear el futuro digital.'}
          </Typography>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className={`grid ${isMobileSimulated ? 'grid-cols-1 gap-12' : effectiveLayout === 'minimal' ? 'grid-cols-2 md:grid-cols-4 gap-16' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'}`}
        >
          {items.map((item: any, i: number) => renderTeamMember(item, i))}
        </motion.div>
      </div>
    </ModuleWrapper>
  );
};
