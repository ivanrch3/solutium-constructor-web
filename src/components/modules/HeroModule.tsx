import React from 'react';
import { ArrowRightCircle, Sparkles, ChevronRight, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ModuleWrapper } from '../ui/ModuleWrapper';
import { Typography } from '../ui/Typography';
import { usePageLayout } from '../../context/PageLayoutContext';

export const HeroModule = ({ data, onUpdate, onCTA }: { data: any, onUpdate?: (data: any) => void, onCTA: (e: React.MouseEvent) => void }) => {
  const layoutType = data?.layoutType || 'layout-1';
  const { previewDevice } = usePageLayout();
  const isMobile = previewDevice === 'mobile';
  
  const handleTextUpdate = (path: string, value: string) => {
    if (onUpdate) {
      const newData = { ...data };
      const parts = path.split('.');
      let current = newData;
      for (let i = 0; i < parts.length - 1; i++) {
        current[parts[i]] = { ...current[parts[i]] };
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      onUpdate(newData);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }
    }
  };

  const renderContent = (alignment: 'center' | 'left' = 'center', maxWidth: string = 'max-w-4xl') => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={`flex flex-col ${alignment === 'center' ? 'items-center text-center' : 'items-start text-left'} ${maxWidth} ${alignment === 'center' ? 'mx-auto' : ''} w-full relative z-10`}
    >
      {data?.badge && (
        <motion.div 
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          className="mb-8 px-5 py-2 bg-primary/10 border border-primary/20 rounded-full flex items-center gap-3 shadow-sm shadow-primary/5"
        >
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{data.badge}</span>
        </motion.div>
      )}
      
      <motion.div variants={itemVariants} className="w-full">
        <Typography 
          variant={data?.titleStyle?.size || 'h2'}
          weight={data?.titleStyle?.weight || '900'}
          italic={data?.titleStyle?.italic}
          underline={data?.titleStyle?.underline}
          strike={data?.titleStyle?.strike}
          align={data?.titleStyle?.align || alignment}
          highlightType={data?.titleStyle?.highlightType}
          highlightColor1={data?.titleStyle?.highlightColor1}
          highlightColor2={data?.titleStyle?.highlightColor2}
          className="mb-6 md:mb-8 tracking-tighter text-6xl md:text-8xl lg:text-9xl leading-[0.9]"
          editable={!!onUpdate}
          onUpdate={(text) => handleTextUpdate('title', text)}
        >
          {data?.title || 'Construye el Futuro de tu Negocio'}
        </Typography>
      </motion.div>
      
      <motion.div variants={itemVariants} className="w-full">
        <Typography 
          variant={data?.subtitleStyle?.size || 'p'}
          weight={data?.subtitleStyle?.weight || '400'}
          italic={data?.subtitleStyle?.italic}
          underline={data?.subtitleStyle?.underline}
          strike={data?.subtitleStyle?.strike}
          align={data?.subtitleStyle?.align || alignment}
          className="mb-10 md:mb-14 opacity-70 max-w-3xl text-lg md:text-2xl font-medium leading-relaxed"
          editable={!!onUpdate}
          onUpdate={(text) => handleTextUpdate('subtitle', text)}
        >
          {data?.subtitle || 'La plataforma todo-en-uno para gestionar, vender y crecer con Solutium.'}
        </Typography>
      </motion.div>

      <motion.div 
        variants={itemVariants}
        className={`flex flex-col sm:flex-row items-center gap-6 w-full ${alignment === 'center' ? 'justify-center' : 'justify-start'}`}
      >
        {data?.primaryButton?.text && (
          <motion.div 
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto"
          >
            <a 
              href={data.primaryButton.url || '#'}
              target={data.primaryButton.target || '_self'}
              onClick={(e) => {
                if (onUpdate) e.preventDefault();
                if (!data.primaryButton.url || data.primaryButton.url === '#') {
                  onCTA(e);
                }
              }}
              className="w-full sm:w-auto px-10 md:px-14 py-5 md:py-6 bg-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-primary/30 hover:bg-primary/90 transition-all text-center block cursor-pointer text-sm"
            >
              <Typography
                variant="span"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('primaryButton.text', text)}
                className="pointer-events-auto"
              >
                {data.primaryButton.text}
              </Typography>
            </a>
          </motion.div>
        )}
        {data?.secondaryButton?.text && (
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto"
          >
            <a 
              href={data?.secondaryButton?.url || '#'}
              target={data?.secondaryButton?.target || '_self'}
              onClick={(e) => {
                if (onUpdate) e.preventDefault();
              }}
              className="w-full sm:w-auto px-10 md:px-14 py-5 md:py-6 bg-text/5 text-text font-black uppercase tracking-widest rounded-2xl hover:bg-text/10 transition-all backdrop-blur-xl flex items-center justify-center gap-3 border border-text/10 text-center block cursor-pointer text-sm group"
            >
              <Typography
                variant="span"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('secondaryButton.text', text)}
                className="pointer-events-auto"
              >
                {data.secondaryButton.text}
              </Typography>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );

  const renderLayout = () => {
    switch (layoutType) {
      case 'layout-1': // Centered
        return renderContent('center');
      
      case 'layout-2': // Split
        return (
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} gap-12 lg:gap-20 items-center`}>
            <div className={`${isMobile ? 'order-2' : 'order-2 lg:order-1'}`}>
              {renderContent('left')}
            </div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`${isMobile ? 'order-1' : 'order-1 lg:order-2'} relative aspect-[4/3] md:aspect-video lg:aspect-square rounded-[3rem] overflow-hidden shadow-2xl border border-text/10 group`}
            >
              <img 
                src={data?.background?.image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80'} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt="Hero Visual"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                <motion.div 
                  whileHover={{ scale: 1.2 }}
                  className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 cursor-pointer"
                >
                  <Play className="w-8 h-8 text-white fill-white" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        );

      case 'layout-3': // Offset Editorial
        return (
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'} gap-12`}>
            <div className={`${isMobile ? '' : 'lg:col-span-8'}`}>
              {renderContent('left', 'max-w-none')}
            </div>
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className={`${isMobile ? '' : 'lg:col-span-4 flex items-end'}`}
            >
              <div className="p-10 md:p-12 bg-primary/5 rounded-[2.5rem] border border-primary/10 backdrop-blur-xl w-full relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/20 transition-colors" />
                <Typography 
                  variant="small" 
                  weight="900" 
                  className="uppercase tracking-[0.3em] text-primary mb-4 block text-[10px]"
                  editable={!!onUpdate}
                  onUpdate={(text) => handleTextUpdate('badge', text)}
                >
                  {data?.badge || 'Dato Clave'}
                </Typography>
                <Typography 
                  variant="p" 
                  className="text-lg opacity-80 italic font-medium leading-relaxed"
                  editable={!!onUpdate}
                  onUpdate={(text) => handleTextUpdate('quote', text)}
                >
                  {data?.quote || '"La innovación es lo que distingue a un líder de los demás."'}
                </Typography>
              </div>
            </motion.div>
          </div>
        );

      case 'layout-4': // Floating Card
        return (
          <div className="flex justify-center py-12 md:py-20">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="bg-surface/80 backdrop-blur-2xl p-12 md:p-24 rounded-[4rem] border border-text/10 shadow-3xl max-w-5xl w-full relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              {renderContent('center')}
            </motion.div>
          </div>
        );

      case 'layout-5': // Sidebar Rail
        return (
          <div className="flex justify-start">
            <div className="max-w-xl w-full">
              {renderContent('left')}
            </div>
          </div>
        );

      case 'layout-6': // Bento Box
        return (
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'} gap-8`}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className={`${isMobile ? '' : 'md:col-span-3'} bg-primary/5 p-12 md:p-20 rounded-[3rem] border border-primary/10 relative overflow-hidden group`}
            >
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mb-32 blur-3xl group-hover:bg-primary/20 transition-colors" />
               <Typography 
                variant={data?.titleStyle?.size || 'h2'}
                weight={data?.titleStyle?.weight || '900'}
                align="left"
                className="mb-0 tracking-tighter text-6xl md:text-8xl"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('title', text)}
              >
                {data?.title || 'Construye el Futuro de tu Negocio'}
              </Typography>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className={`${isMobile ? '' : 'md:col-span-2'} bg-text/5 p-12 md:p-14 rounded-[3rem] border border-text/10`}
            >
              <Typography 
                variant={data?.subtitleStyle?.size || 'p'}
                weight={data?.subtitleStyle?.weight || '400'}
                align="left"
                className="opacity-70 text-xl md:text-2xl font-medium leading-relaxed"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('subtitle', text)}
              >
                {data?.subtitle || 'La plataforma todo-en-uno para gestionar, vender y crecer con Solutium.'}
              </Typography>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-primary p-12 md:p-14 rounded-[3rem] flex items-center justify-center shadow-2xl shadow-primary/30 cursor-pointer group"
            >
              {data?.primaryButton?.text ? (
                <a 
                  href={data.primaryButton.url || '#'}
                  target={data.primaryButton.target || '_self'}
                  onClick={(e) => {
                    if (onUpdate) e.preventDefault();
                  }}
                  className="text-white font-black text-2xl uppercase tracking-widest w-full h-full flex items-center justify-center gap-3"
                >
                  <Typography
                    variant="span"
                    editable={!!onUpdate}
                    onUpdate={(text) => handleTextUpdate('primaryButton.text', text)}
                  >
                    {data.primaryButton.text}
                  </Typography>
                  <ArrowRightCircle className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                </a>
              ) : (
                <div className="text-white/50 italic text-sm">Sin botón</div>
              )}
            </motion.div>
          </div>
        );

      case 'layout-7': // Overlap
        return (
          <div className={`relative ${isMobile ? 'flex flex-col' : 'pt-0 lg:pt-20 flex flex-col lg:block'}`}>
            <motion.div 
              initial={{ opacity: 0, scale: 1.1 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5 }}
              className={`${isMobile ? 'relative w-full h-80 rounded-[3rem] mb-10' : 'relative lg:absolute top-0 right-0 w-full lg:w-2/3 h-80 lg:h-full rounded-[3rem] lg:rounded-[4rem] overflow-hidden mb-12 lg:mb-0 opacity-80 lg:opacity-100 shadow-2xl'}`}
            >
              <img 
                src={data?.background?.image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80'} 
                className="w-full h-full object-cover"
                alt="Hero Visual"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5 }}
              className={`relative z-10 bg-surface/90 backdrop-blur-2xl ${isMobile ? 'p-10 rounded-[3rem]' : 'p-12 md:p-24 rounded-[3rem] lg:rounded-[4rem]'} border border-text/10 shadow-4xl max-w-3xl`}
            >
              {renderContent('left')}
            </motion.div>
          </div>
        );

      default:
        return renderContent('center');
    }
  };

  return (
    <ModuleWrapper 
      layout={layoutType}
      theme={data?.theme}
      // For split (layout-2) and overlay (layout-7), we use the image as content, not background
      background={(layoutType === 'layout-2' || layoutType === 'layout-7') ? undefined : data?.background}
      id="hero-module"
    >
      {/* Decorative Blobs */}
      {(layoutType === 'layout-1' || layoutType === 'layout-4' || layoutType === 'layout-5') && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              x: [0, 150, 0], 
              y: [0, 100, 0],
              scale: [1, 1.4, 1],
              rotate: [0, 90, 0]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -top-48 -left-48 w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-[120px]"
          />
          <motion.div 
            animate={{ 
              x: [0, -150, 0], 
              y: [0, -100, 0],
              scale: [1, 1.5, 1],
              rotate: [0, -90, 0]
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-48 -right-48 w-[40rem] h-[40rem] bg-accent/10 rounded-full blur-[120px]"
          />
        </div>
      )}
      <div className="container mx-auto px-4 relative z-10">
        {renderLayout()}
      </div>
    </ModuleWrapper>
  );
};

