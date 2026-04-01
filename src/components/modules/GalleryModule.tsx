import React, { useState, useEffect } from 'react';
import { ArrowRight, ZoomIn, Sparkles, X, ChevronLeft, ChevronRight, Share2, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ModuleWrapper } from '../ui/ModuleWrapper';
import { Typography } from '../ui/Typography';
import { usePageLayout } from '../../context/PageLayoutContext';

interface GalleryModuleProps {
  data: any;
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
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.5, ease: [0.215, 0.61, 0.355, 1] }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: 0.2 }
  }
};

export const GalleryModule = ({ data, onUpdate }: GalleryModuleProps) => {
  const { previewDevice } = usePageLayout();
  const isMobileSimulated = previewDevice === 'mobile';
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const layoutType = data?.layoutType || 'grid';
  const columns = data?.columns || 3;
  const gap = data?.gap !== undefined ? data.gap : 16;
  const aspectRatio = data?.aspectRatio || 'square';
  const images = data?.images || [];
  const showFilters = data?.showFilters !== false;
  const showOverlay = data?.showOverlay !== false;
  const hoverEffect = data?.hoverEffect || 'zoom';
  const borderRadius = data?.borderRadius || 'xl';
  const showViewAllButton = data?.showViewAllButton !== false;
  const entranceAnimation = data?.entranceAnimation || 'fade';
  const smartMode = data?.smartMode || false;

  const effectiveLayout = smartMode 
    ? (isMobileSimulated ? 'masonry' : 'grid')
    : layoutType;

  const getAnimationVariants = (idx: number) => {
    switch (entranceAnimation) {
      case 'slide':
        return {
          hidden: { opacity: 0, x: -30 },
          visible: { 
            opacity: 1, 
            x: 0,
            transition: { duration: 0.6, delay: idx * 0.05 }
          }
        };
      case 'zoom':
        return {
          hidden: { opacity: 0, scale: 0.8 },
          visible: { 
            opacity: 1, 
            scale: 1,
            transition: { duration: 0.8, delay: idx * 0.05 }
          }
        };
      default: // fade
        return {
          hidden: { opacity: 0, y: 20 },
          visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.7, delay: idx * 0.05 }
          }
        };
    }
  };

  const categories = ['All', ...Array.from(new Set(images.map((img: any) => img.category).filter(Boolean)))];
  
  const filteredImages = activeFilter === 'All' 
    ? images 
    : images.filter((img: any) => img.category === activeFilter);

  // Handle keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;
      if (e.key === 'Escape') setSelectedImageIndex(null);
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
      if (e.key === 'ArrowRight') navigateLightbox(1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, filteredImages.length]);

  const navigateLightbox = (direction: number) => {
    if (selectedImageIndex === null) return;
    const newIndex = (selectedImageIndex + direction + filteredImages.length) % filteredImages.length;
    setSelectedImageIndex(newIndex);
  };

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

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'portrait': return 'aspect-[3/4]';
      case 'landscape': return 'aspect-video';
      case 'auto': return '';
      case 'square':
      default: return 'aspect-square';
    }
  };

  const getRadiusClass = () => {
    switch (borderRadius) {
      case 'none': return 'rounded-none';
      case 'md': return 'rounded-lg';
      case '3xl': return 'rounded-[2rem]';
      case 'xl':
      default: return 'rounded-2xl';
    }
  };

  const getHoverClass = () => {
    switch (hoverEffect) {
      case 'grayscale': return 'grayscale group-hover:grayscale-0 transition-all duration-700 ease-out';
      case 'tilt': return 'group-hover:scale-[1.05] group-hover:-rotate-1 transition-transform duration-500 ease-out';
      case 'zoom': 
      default: return 'group-hover:scale-110 transition-transform duration-1000 ease-out';
    }
  };

  const renderOverlay = (img: any, idx: number) => {
    if (!showOverlay) return null;
    return (
      <motion.div 
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6"
        initial={false}
      >
        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
          <div className="flex items-center justify-between mb-2">
            {img.category && (
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 px-2 py-1 rounded backdrop-blur-md">
                {img.category}
              </span>
            )}
            <div className="flex gap-2">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex(idx);
                }}
              >
                <ZoomIn className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
          <h3 className="text-white font-bold text-lg leading-tight mb-1">{img.title}</h3>
          {img.description && (
            <p className="text-white/60 text-xs line-clamp-2 mb-3 font-medium">{img.description}</p>
          )}
          {img.link && (
            <div className="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-wider group/link">
              <span>Ver Proyecto</span>
              <ArrowRight className="w-3 h-3 transform group-hover/link:translate-x-1 transition-transform" />
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderImage = (img: any, idx: number, extraClasses = '') => {
    const animation = getAnimationVariants(idx);
    return (
      <motion.div 
        key={img.id || idx}
        variants={animation}
        layout
        className={`relative overflow-hidden group cursor-pointer bg-surface/50 backdrop-blur-sm border border-text/5 ${getRadiusClass()} ${getAspectRatioClass()} ${extraClasses}`}
        onClick={() => setSelectedImageIndex(idx)}
      >
        <img 
          src={img.url} 
          alt={img.title} 
          className={`w-full h-full object-cover will-change-transform ${getHoverClass()}`}
          referrerPolicy="no-referrer"
        />
        {renderOverlay(img, idx)}
      </motion.div>
    );
  };

  const renderContent = () => {
    if (effectiveLayout === 'carousel') {
      return (
        <div className="relative group/carousel">
          <div className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar -mx-4 px-4">
            <AnimatePresence mode="popLayout">
              {filteredImages.map((img: any, idx: number) => (
                <motion.div 
                  key={img.id || idx} 
                  variants={getAnimationVariants(idx)}
                  className="min-w-[300px] md:min-w-[450px] snap-center"
                >
                  {renderImage(img, idx)}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      );
    }

    if (effectiveLayout === 'masonry') {
      return (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className={`columns-1 ${isMobileSimulated ? '' : 'md:columns-2 lg:columns-' + Math.min(columns, 4)} gap-6 space-y-6`}
        >
          <AnimatePresence mode="popLayout">
            {filteredImages.map((img: any, idx: number) => (
              <div key={img.id || idx} className="break-inside-avoid">
                {renderImage(img, idx, '!aspect-auto')}
              </div>
            ))}
          </AnimatePresence>
        </motion.div>
      );
    }

    if (effectiveLayout === 'mosaic') {
      return (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className={`grid ${isMobileSimulated ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-4'} gap-6`}
        >
          <AnimatePresence mode="popLayout">
            {filteredImages.map((img: any, idx: number) => {
              const isLarge = idx % 5 === 0;
              return renderImage(img, idx, isLarge && !isMobileSimulated ? 'col-span-2 row-span-2' : '');
            })}
          </AnimatePresence>
        </motion.div>
      );
    }

    // Default Grid
    const gridCols = isMobileSimulated ? 'grid-cols-1' : {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-2 md:grid-cols-4',
      5: 'grid-cols-2 md:grid-cols-5',
      6: 'grid-cols-2 md:grid-cols-6'
    }[columns as 1|2|3|4|5|6] || 'grid-cols-2 md:grid-cols-3';

    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className={`grid ${gridCols}`} 
        style={{ gap: `${gap}px` }}
      >
        <AnimatePresence mode="popLayout">
          {filteredImages.map((img: any, idx: number) => renderImage(img, idx))}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <ModuleWrapper 
      theme={data?.theme}
      background={data?.background}
    >
      <motion.div 
        className={`flex flex-col ${isMobileSimulated ? '' : 'md:flex-row md:items-end'} justify-between gap-8 mb-16`}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-2xl">
          <motion.div 
            className="flex items-center gap-2 mb-4"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-8 h-[1px] bg-primary" />
            <span className="text-primary font-black tracking-[0.3em] uppercase text-[10px]">
              {data?.badge || 'Galería'}
            </span>
          </motion.div>
          <Typography
            variant="h2"
            className={`${isMobileSimulated ? 'text-4xl' : 'text-5xl lg:text-6xl'} font-black text-text mb-6 tracking-tight leading-[0.9]`}
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate('title', text)}
          >
            {data?.title || 'Galería Visual'}
          </Typography>
          <Typography
            variant="p"
            className={`text-text/60 ${isMobileSimulated ? 'text-base' : 'text-xl'} font-medium max-w-xl`}
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate('subtitle', text)}
          >
            {data?.subtitle || 'Explora nuestro trabajo a través de imágenes.'}
          </Typography>
        </div>

        {showViewAllButton && (
          <motion.a 
            href={data?.viewAllButtonUrl || '#'}
            onClick={(e) => {
              if (onUpdate) e.preventDefault();
            }}
            className={`${isMobileSimulated ? 'hidden' : 'hidden md:flex'} items-center gap-3 px-8 py-4 bg-surface border border-text/10 text-text font-black uppercase tracking-widest text-xs rounded-full hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-xl shadow-black/5`}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Typography
              variant="span"
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate('viewAllButtonText', text)}
            >
              {data?.viewAllButtonText || 'Ver Todo'}
            </Typography>
            <ArrowRight className="w-4 h-4" />
          </motion.a>
        )}
      </motion.div>

      {showFilters && categories.length > 1 && (
        <motion.div 
          className="flex flex-wrap gap-3 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          {categories.map((cat: any) => (
            <motion.button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                activeFilter === cat 
                  ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-105' 
                  : 'bg-surface border border-text/10 text-text/60 hover:text-text hover:border-text/30'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {cat}
            </motion.button>
          ))}
        </motion.div>
      )}

      {renderContent()}

      {showViewAllButton && (
        <motion.div 
          className={`mt-12 ${isMobileSimulated ? 'block' : 'md:hidden'}`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.a 
            href={data?.viewAllButtonUrl || '#'}
            onClick={(e) => {
              if (onUpdate) e.preventDefault();
            }}
            className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-surface border border-text/10 text-text font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-primary hover:text-white transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Typography
              variant="span"
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate('viewAllButtonText', text)}
            >
              {data?.viewAllButtonText || 'Ver Todo'}
            </Typography>
            <ArrowRight className="w-4 h-4" />
          </motion.a>
        </motion.div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImageIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-10"
            onClick={() => setSelectedImageIndex(null)}
          >
            <motion.button
              className="absolute top-6 right-6 z-[110] w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              onClick={() => setSelectedImageIndex(null)}
              whileHover={{ rotate: 90 }}
            >
              <X className="w-6 h-6" />
            </motion.button>

            <div className="absolute top-6 left-6 z-[110] flex gap-4">
              <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </div>

            <button 
              className="absolute left-4 md:left-10 z-[110] w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <button 
              className="absolute right-4 md:right-10 z-[110] w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            <motion.div 
              className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center gap-6"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-2xl">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImageIndex}
                    src={filteredImages[selectedImageIndex].url}
                    alt={filteredImages[selectedImageIndex].title}
                    className="max-w-full max-h-full object-contain shadow-2xl"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  />
                </AnimatePresence>
              </div>

              <div className="text-center max-w-2xl">
                <motion.span 
                  key={`cat-${selectedImageIndex}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-primary font-black tracking-[0.3em] uppercase text-[10px] mb-2 block"
                >
                  {filteredImages[selectedImageIndex].category}
                </motion.span>
                <motion.h2 
                  key={`title-${selectedImageIndex}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-white text-2xl md:text-3xl font-black mb-2"
                >
                  {filteredImages[selectedImageIndex].title}
                </motion.h2>
                <motion.p 
                  key={`desc-${selectedImageIndex}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-white/60 text-sm md:text-base font-medium"
                >
                  {filteredImages[selectedImageIndex].description}
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ModuleWrapper>
  );
};
