import React from 'react';
import { ShoppingCart, Star, ArrowRight, Sparkles, Heart, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Typography } from '../ui/Typography';
import { ModuleWrapper } from '../ui/ModuleWrapper';
import { usePageLayout } from '../../context/PageLayoutContext';

interface ProductShowcaseModuleProps {
  data: any;
  config: any;
  selectedProductIds: string[];
  onUpdate?: (data: any) => void;
}

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
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.6, ease: [0.215, 0.61, 0.355, 1] }
  }
};

export const ProductShowcaseModule = ({ data, config, selectedProductIds, onUpdate }: ProductShowcaseModuleProps) => {
  const { previewDevice } = usePageLayout();
  const isMobileSimulated = previewDevice === 'mobile';
  
  // Filtrar por IDs seleccionados Y por projectId actual (Foundry v2)
  const products = (config?.products || []).filter((p: any) => 
    selectedProductIds.includes(p.id.toString()) && 
    (!config?.projectId || p.projectId === config.projectId || p.project_id === config.projectId)
  );

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

  const layoutType = data?.layoutType || 'grid';
  const entranceAnimation = data?.entranceAnimation || 'fade';
  const cardStyle = data?.cardStyle || { border: true, shadow: 'sm', borderRadius: 'xl' };

  const getAnimationVariants = (idx: number) => {
    switch (entranceAnimation) {
      case 'slide':
        return {
          hidden: { opacity: 0, x: -30 },
          visible: { opacity: 1, x: 0, transition: { duration: 0.6, delay: idx * 0.1 } }
        };
      case 'zoom':
        return {
          hidden: { opacity: 0, scale: 0.8 },
          visible: { opacity: 1, scale: 1, transition: { duration: 0.8, delay: idx * 0.1 } }
        };
      case 'stagger-reveal':
        return {
          hidden: { opacity: 0, y: 50, rotate: 2 },
          visible: { opacity: 1, y: 0, rotate: 0, transition: { duration: 0.8, delay: idx * 0.15, ease: [0.215, 0.61, 0.355, 1] } }
        };
      default: // fade
        return {
          hidden: { opacity: 0, y: 30, scale: 0.95 },
          visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, delay: idx * 0.1, ease: [0.215, 0.61, 0.355, 1] } }
        };
    }
  };

  const getCardClasses = () => {
    const classes = ['transition-all duration-700 group overflow-hidden'];
    
    if (cardStyle.border) classes.push('border border-text/5');
    if (cardStyle.glass) classes.push('bg-surface/50 backdrop-blur-sm');
    else classes.push('bg-surface');
    
    const shadowMap: Record<string, string> = {
      none: '',
      sm: 'shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-primary/10',
      md: 'shadow-2xl shadow-black/10 hover:shadow-3xl hover:shadow-primary/15',
      lg: 'shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:shadow-[0_30px_60px_rgba(var(--color-primary-rgb),0.2)]'
    };
    classes.push(shadowMap[cardStyle.shadow || 'sm']);

    const radiusMap: Record<string, string> = {
      none: 'rounded-none',
      md: 'rounded-2xl',
      xl: 'rounded-[2.5rem]',
      '3xl': 'rounded-[3.5rem]'
    };
    classes.push(radiusMap[cardStyle.borderRadius || 'xl']);

    if (layoutType === 'list' && !isMobileSimulated) {
      classes.push('flex flex-col sm:flex-row items-stretch');
    } else {
      classes.push('flex flex-col');
    }

    return classes.join(' ');
  };

  return (
    <ModuleWrapper 
      theme={data?.theme}
      background={data?.background}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className={`text-center ${isMobileSimulated ? 'mb-12' : 'mb-24'} relative`}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {data?.smartMode && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 bg-primary/20 backdrop-blur-md border border-primary/30 rounded-full">
              <Sparkles className="w-3 h-3 text-primary animate-pulse" />
              <span className="text-[8px] font-black uppercase tracking-widest text-primary">IA Optimizado</span>
            </div>
          )}
          <motion.div 
            className="flex items-center justify-center gap-2 mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-12 h-[1px] bg-primary" />
            <span className="text-primary font-black tracking-[0.4em] uppercase text-[10px]">Catálogo</span>
            <div className="w-12 h-[1px] bg-primary" />
          </motion.div>
          <Typography
            variant="h2"
            className={`${isMobileSimulated ? 'text-4xl' : 'text-5xl md:text-7xl'} font-black text-text mb-8 tracking-tighter leading-[0.9]`}
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate('title', text)}
          >
            {data?.title || 'Productos Destacados'}
          </Typography>
          <Typography
            variant="p"
            className={`${isMobileSimulated ? 'text-lg' : 'text-xl md:text-2xl'} text-text/60 max-w-3xl mx-auto leading-tight font-medium`}
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate('subtitle', text)}
          >
            {data?.subtitle || 'Echa un vistazo a nuestras últimas novedades.'}
          </Typography>
        </motion.div>
        
        {products.length > 0 ? (
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className={`grid ${layoutType === 'list' && !isMobileSimulated ? 'grid-cols-1 max-w-5xl mx-auto' : isMobileSimulated ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-10`}
          >
            {products.map((product: any, idx: number) => (
              <motion.div 
                key={product.id} 
                variants={getAnimationVariants(idx)}
                className={getCardClasses()}
              >
                {/* Image Section */}
                <div className={`relative ${layoutType === 'list' && !isMobileSimulated ? 'w-full sm:w-2/5' : 'aspect-[4/3] w-full'} overflow-hidden bg-text/5`}>
                  <img 
                    src={product.appData?.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=compress&cs=tinysrgb&w=800'} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-3">
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-xl hover:bg-primary hover:text-white transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-xl hover:bg-primary hover:text-white transition-colors"
                    >
                      <Heart className="w-5 h-5" />
                    </motion.button>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    {product.unitCost > 100 && (
                      <div className="bg-primary text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                        Premium
                      </div>
                    )}
                    <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black shadow-xl flex items-center gap-1.5 text-black">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      4.9
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className={`${isMobileSimulated ? 'p-8' : 'p-10'} flex-1 flex flex-col ${layoutType === 'list' && !isMobileSimulated ? 'justify-center' : ''}`}>
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                      <span className="text-primary font-black tracking-widest uppercase text-[10px]">Novedad</span>
                    </div>
                    <h3 className={`${isMobileSimulated ? 'text-2xl' : 'text-3xl'} font-black text-text mb-3 tracking-tight group-hover:text-primary transition-colors duration-300 leading-tight`}>
                      {product.name}
                    </h3>
                    <p className="text-text/60 text-base font-medium line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="mt-auto pt-8 flex items-center justify-between border-t border-text/5">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-text/40 uppercase tracking-widest mb-1">Precio</span>
                      <span className={`${isMobileSimulated ? 'text-3xl' : 'text-4xl'} font-black text-text tracking-tighter`}>
                        ${product.unitCost || 0}
                      </span>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`${isMobileSimulated ? 'w-14 h-14' : 'w-16 h-16'} bg-primary text-white rounded-3xl flex items-center justify-center hover:bg-primary/90 transition-all shadow-2xl shadow-primary/30 group/btn`}
                    >
                      <ShoppingCart className={`${isMobileSimulated ? 'w-5 h-5' : 'w-6 h-6'} group-hover/btn:scale-110 transition-transform`} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-center ${isMobileSimulated ? 'py-20' : 'py-32'} bg-surface/50 backdrop-blur-sm ${isMobileSimulated ? 'rounded-3xl' : 'rounded-[3rem]'} border-2 border-dashed border-text/10`}
          >
            <div className="w-24 h-24 bg-text/5 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShoppingCart className={`${isMobileSimulated ? 'w-10 h-10' : 'w-12 h-12'} opacity-20`} />
            </div>
            <h3 className={`${isMobileSimulated ? 'text-2xl' : 'text-3xl'} font-black text-text mb-4 tracking-tight`}>
              No hay productos seleccionados
            </h3>
            <p className="text-text/60 text-lg font-medium max-w-md mx-auto px-6 leading-relaxed">
              Selecciona los productos que quieres mostrar desde el panel de propiedades del módulo para ver la magia.
            </p>
          </motion.div>
        )}
      </div>
    </ModuleWrapper>
  );
};
