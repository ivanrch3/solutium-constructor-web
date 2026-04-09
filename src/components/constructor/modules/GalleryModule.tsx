import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Maximize2, ZoomIn, ChevronLeft, ChevronRight, Play } from 'lucide-react';

const getAspectRatioClass = (ratio: string) => {
  switch (ratio) {
    case '1/1': return 'aspect-square';
    case '16/9': return 'aspect-video';
    case '3/4': return 'aspect-[3/4]';
    default: return '';
  }
};

const isVideo = (url: string) => {
  return url.includes('youtube.com') || url.includes('vimeo.com') || url.endsWith('.mp4');
};

const GalleryItem = ({ 
  img, 
  index, 
  layout, 
  entranceAnim, 
  itemVariants, 
  radius, 
  aspectRatio, 
  enableLightbox, 
  onOpenLightbox, 
  hoverEffect, 
  overlayColor, 
  showCaptions, 
  captionPosition, 
  captionSize, 
  captionColor,
  imageFilter,
  filterOnHover,
  borderWidth,
  borderColor
}: any) => {
  const isBento = layout === 'bento';
  const bentoClass = isBento ? (index === 0 || index === 5 ? '@md:col-span-2 @md:row-span-2' : '@md:col-span-1 @md:row-span-1') : '';
  
  const filterClass = useMemo(() => {
    if (imageFilter === 'none') return '';
    const base = imageFilter === 'grayscale' ? 'grayscale' : imageFilter === 'sepia' ? 'sepia' : imageFilter === 'blur' ? 'blur-sm' : '';
    return filterOnHover ? `${base} group-hover:grayscale-0 group-hover:sepia-0 group-hover:blur-0` : base;
  }, [imageFilter, filterOnHover]);

  const hasVideo = isVideo(img.url);

  return (
    <motion.div
      variants={entranceAnim ? itemVariants : {}}
      className={`relative group overflow-hidden cursor-pointer ${bentoClass} ${getAspectRatioClass(aspectRatio)}`}
      style={{ 
        borderRadius: `${radius}px`,
        border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none'
      }}
      onClick={() => enableLightbox && onOpenLightbox(index)}
    >
      <motion.img 
        src={img.url} 
        alt={img.title}
        className={`w-full h-full object-cover transition-all duration-700 ${filterClass}`}
        whileHover={hoverEffect === 'zoom' ? { scale: 1.1 } : {}}
        referrerPolicy="no-referrer"
      />

      {/* Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className={`absolute inset-0 flex flex-col p-6 transition-opacity duration-300 ${
          captionPosition === 'center' ? 'justify-center items-center text-center' : 
          captionPosition === 'top' ? 'justify-start' : 'justify-end'
        }`}
        style={{ backgroundColor: overlayColor }}
      >
        {showCaptions && (
          <div className="w-full">
            <h4 
              className="font-bold mb-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
              style={{ fontSize: `${captionSize}px`, color: captionColor }}
            >
              {img.title}
            </h4>
            <p className="text-white/70 text-xs transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
              {img.desc}
            </p>
          </div>
        )}
        
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          {hasVideo ? <Play className="text-white fill-white" size={20} /> : <ZoomIn className="text-white" size={20} />}
        </div>

        {hoverEffect === 'glow' && (
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        )}
      </motion.div>

      {hoverEffect === 'lift' && (
        <div className="absolute inset-0 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      )}
    </motion.div>
  );
};

export const GalleryModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any> 
}> = ({ moduleId, settingsValues }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState('Todos');

  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  };

  // Global Settings
  const layout = getVal(null, 'layout', 'grid');
  const columns = getVal(null, 'columns', 3);
  const gap = getVal(null, 'gap', 20);
  const paddingY = getVal(null, 'padding_y', 100);
  const bgColor = getVal(null, 'bg_color', '#FFFFFF');
  const imageFilter = getVal(null, 'image_filter', 'none');
  const filterOnHover = getVal(null, 'filter_on_hover', true);
  const entranceAnim = getVal(null, 'entrance_anim', true);
  const enableLightbox = getVal(null, 'enable_lightbox', true);
  const lightboxNav = getVal(null, 'lightbox_nav', true);
  const showFilters = getVal(null, 'show_filters', true);
  const categoriesStr = getVal(null, 'categories', 'Todos, Diseño, Arquitectura, Naturaleza');

  // Element: Header
  const headerTitle = getVal(`${moduleId}_el_gallery_header`, 'title', 'Nuestra Galería');
  const headerSubtitle = getVal(`${moduleId}_el_gallery_header`, 'subtitle', 'Momentos capturados que cuentan nuestra historia.');
  const headerAlign = getVal(`${moduleId}_el_gallery_header`, 'align', 'center');
  const headerTitleSize = getVal(`${moduleId}_el_gallery_header`, 'title_size', 32);
  const headerMarginB = getVal(`${moduleId}_el_gallery_header`, 'margin_b', 60);

  // Element: Image Style
  const radius = getVal(`${moduleId}_el_gallery_item`, 'radius', 16);
  const overlayColor = getVal(`${moduleId}_el_gallery_item`, 'overlay_color', 'rgba(0,0,0,0.4)');
  const aspectRatio = getVal(`${moduleId}_el_gallery_item`, 'aspect_ratio', 'square');
  const hoverEffect = getVal(`${moduleId}_el_gallery_item`, 'hover_effect', 'zoom');
  const borderWidth = getVal(`${moduleId}_el_gallery_item`, 'border_width', 0);
  const borderColor = getVal(`${moduleId}_el_gallery_item`, 'border_color', 'var(--primary-color)');

  // Element: Captions
  const showCaptions = getVal(`${moduleId}_el_gallery_captions`, 'show_captions', true);
  const captionSize = getVal(`${moduleId}_el_gallery_captions`, 'caption_size', 16);
  const captionColor = getVal(`${moduleId}_el_gallery_captions`, 'caption_color', '#FFFFFF');
  const captionPosition = getVal(`${moduleId}_el_gallery_captions`, 'caption_position', 'bottom');

  const categories = useMemo(() => categoriesStr.split(',').map((c: string) => c.trim()), [categoriesStr]);

  const MOCK_IMAGES = [
    { url: 'https://picsum.photos/seed/gal1/800/800', title: 'Diseño Minimalista', desc: 'Espacios que respiran.', category: 'Diseño' },
    { url: 'https://picsum.photos/seed/gal2/800/1000', title: 'Arquitectura Moderna', desc: 'Líneas y formas.', category: 'Arquitectura' },
    { url: 'https://picsum.photos/seed/gal3/1000/800', title: 'Naturaleza Urbana', desc: 'Verde en la ciudad.', category: 'Naturaleza' },
    { url: 'https://picsum.photos/seed/gal4/800/800', title: 'Detalles Únicos', desc: 'La belleza en lo pequeño.', category: 'Diseño' },
    { url: 'https://picsum.photos/seed/gal5/800/1200', title: 'Luz y Sombra', desc: 'Contrastes dramáticos.', category: 'Arquitectura' },
    { url: 'https://picsum.photos/seed/gal6/1200/800', title: 'Perspectivas', desc: 'Nuevos puntos de vista.', category: 'Naturaleza' },
    { url: 'https://picsum.photos/seed/gal7/1200/720', title: 'Showreel 2024', desc: 'Nuestro trabajo en video.', category: 'Diseño', video: true }
  ];

  const filteredImages = useMemo(() => {
    if (activeFilter === 'Todos') return MOCK_IMAGES;
    return MOCK_IMAGES.filter(img => img.category === activeFilter);
  }, [activeFilter, MOCK_IMAGES]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % filteredImages.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + filteredImages.length) % filteredImages.length);
  };

  return (
    <section 
      className="w-full relative overflow-hidden"
      style={{ 
        backgroundColor: bgColor,
        paddingTop: `${paddingY}px`,
        paddingBottom: `${paddingY}px`
      }}
    >
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <div 
          className={`flex flex-col mb-12 ${headerAlign === 'center' ? 'items-center text-center' : 'items-start text-left'}`}
          style={{ marginBottom: `${headerMarginB}px` }}
        >
          <h2 
            className="font-black text-slate-900 mb-4 leading-tight text-3xl @md:text-4xl @lg:text-5xl"
            style={{ fontSize: `${headerTitleSize}px` }}
          >
            {headerTitle}
          </h2>
          {headerSubtitle && (
            <p className="text-slate-500 max-w-2xl text-lg">
              {headerSubtitle}
            </p>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((cat: string) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                  activeFilter === cat 
                    ? 'bg-slate-900 text-white shadow-lg scale-105' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <motion.div 
          key={activeFilter}
          variants={entranceAnim ? containerVariants : {}}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className={`grid ${layout === 'masonry' ? 'columns-2 @md:columns-3 @lg:columns-4' : (
            columns === 5 ? 'grid-cols-2 @sm:grid-cols-3 @lg:grid-cols-5' :
            columns === 4 ? 'grid-cols-2 @sm:grid-cols-3 @lg:grid-cols-4' :
            columns === 3 ? 'grid-cols-2 @sm:grid-cols-3' :
            columns === 2 ? 'grid-cols-2' : 'grid-cols-1'
          )} ${layout === 'bento' ? '@md:grid-flow-dense' : ''}`}
          style={{ 
            display: layout === 'masonry' ? 'block' : 'grid',
            rowGap: layout !== 'masonry' ? `${gap}px` : undefined,
            columnGap: `${gap}px`
          }}
        >
          {filteredImages.map((img, i) => (
            <div key={`${activeFilter}-${i}`} className={layout === 'masonry' ? 'mb-4 break-inside-avoid' : ''}>
              <GalleryItem 
                img={img} 
                index={i} 
                layout={layout}
                entranceAnim={entranceAnim}
                itemVariants={itemVariants}
                radius={radius}
                aspectRatio={aspectRatio}
                enableLightbox={enableLightbox}
                onOpenLightbox={setSelectedIndex}
                hoverEffect={hoverEffect}
                overlayColor={overlayColor}
                showCaptions={showCaptions}
                captionPosition={captionPosition}
                captionSize={captionSize}
                captionColor={captionColor}
                imageFilter={imageFilter}
                filterOnHover={filterOnHover}
                borderWidth={borderWidth}
                borderColor={borderColor}
              />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-12"
            onClick={() => setSelectedIndex(null)}
          >
            <button 
              className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-[110] bg-white/10 p-2 rounded-full backdrop-blur-md"
              onClick={() => setSelectedIndex(null)}
            >
              <X size={24} />
            </button>

            {lightboxNav && filteredImages.length > 1 && (
              <>
                <button 
                  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-[110] bg-white/10 p-3 rounded-full backdrop-blur-md"
                  onClick={handlePrev}
                >
                  <ChevronLeft size={32} />
                </button>
                <button 
                  className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-[110] bg-white/10 p-3 rounded-full backdrop-blur-md"
                  onClick={handleNext}
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}
            
            <motion.div
              key={selectedIndex}
              initial={{ scale: 0.9, opacity: 0, x: 20 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              exit={{ scale: 0.9, opacity: 0, x: -20 }}
              className="relative max-w-full max-h-full flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {isVideo(filteredImages[selectedIndex].url) ? (
                <div className="aspect-video w-full max-w-5xl bg-black rounded-xl overflow-hidden shadow-2xl">
                  <iframe 
                    src={filteredImages[selectedIndex].url.replace('watch?v=', 'embed/')} 
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              ) : (
                <img 
                  src={filteredImages[selectedIndex].url} 
                  className="max-w-full max-h-[80vh] object-contain shadow-2xl rounded-lg"
                  referrerPolicy="no-referrer"
                />
              )}
              
              <div className="mt-6 text-center">
                <h3 className="text-white text-xl font-bold">{filteredImages[selectedIndex].title}</h3>
                <p className="text-white/60 text-sm mt-1">{filteredImages[selectedIndex].desc}</p>
                <div className="mt-4 px-3 py-1 bg-white/10 rounded-full inline-block">
                  <span className="text-white/40 text-xs font-mono">
                    {selectedIndex + 1} / {filteredImages.length}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
