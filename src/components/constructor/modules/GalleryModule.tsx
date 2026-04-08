import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Maximize2, ZoomIn } from 'lucide-react';

const getAspectRatioClass = (ratio: string) => {
  switch (ratio) {
    case '1/1': return 'aspect-square';
    case '16/9': return 'aspect-video';
    case '3/4': return 'aspect-[3/4]';
    default: return '';
  }
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
  setSelectedImage, 
  hoverEffect, 
  overlayColor, 
  showCaptions, 
  captionPosition, 
  captionSize, 
  captionColor 
}: any) => {
  const isBento = layout === 'bento';
  const bentoClass = isBento ? (index === 0 || index === 5 ? '@md:col-span-2 @md:row-span-2' : '@md:col-span-1 @md:row-span-1') : '';
  
  return (
    <motion.div
      variants={entranceAnim ? itemVariants : {}}
      className={`relative group overflow-hidden cursor-pointer ${bentoClass} ${getAspectRatioClass(aspectRatio)}`}
      style={{ borderRadius: `${radius}px` }}
      onClick={() => enableLightbox && setSelectedImage(img.url)}
    >
      <motion.img 
        src={img.url} 
        alt={img.title}
        className="w-full h-full object-cover transition-all duration-700"
        whileHover={hoverEffect === 'zoom' ? { scale: 1.1 } : {}}
        referrerPolicy="no-referrer"
      />

      {/* Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="absolute inset-0 flex flex-col justify-end p-6 transition-opacity duration-300"
        style={{ backgroundColor: overlayColor }}
      >
        {showCaptions && (
          <div className={`w-full ${captionPosition === 'center' ? 'h-full flex flex-col items-center justify-center text-center' : ''}`}>
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
          <ZoomIn className="text-white" size={20} />
        </div>
      </motion.div>
    </motion.div>
  );
};

export const GalleryModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any> 
}> = ({ moduleId, settingsValues }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
  const entranceAnim = getVal(null, 'entrance_anim', true);
  const enableLightbox = getVal(null, 'enable_lightbox', true);

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

  // Element: Captions
  const showCaptions = getVal(`${moduleId}_el_gallery_captions`, 'show_captions', true);
  const captionSize = getVal(`${moduleId}_el_gallery_captions`, 'caption_size', 16);
  const captionColor = getVal(`${moduleId}_el_gallery_captions`, 'caption_color', '#FFFFFF');
  const captionPosition = getVal(`${moduleId}_el_gallery_captions`, 'caption_position', 'bottom');

  const MOCK_IMAGES = [
    { url: 'https://picsum.photos/seed/gal1/800/800', title: 'Diseño Minimalista', desc: 'Espacios que respiran.' },
    { url: 'https://picsum.photos/seed/gal2/800/1000', title: 'Arquitectura Moderna', desc: 'Líneas y formas.' },
    { url: 'https://picsum.photos/seed/gal3/1000/800', title: 'Naturaleza Urbana', desc: 'Verde en la ciudad.' },
    { url: 'https://picsum.photos/seed/gal4/800/800', title: 'Detalles Únicos', desc: 'La belleza en lo pequeño.' },
    { url: 'https://picsum.photos/seed/gal5/800/1200', title: 'Luz y Sombra', desc: 'Contrastes dramáticos.' },
    { url: 'https://picsum.photos/seed/gal6/1200/800', title: 'Perspectivas', desc: 'Nuevos puntos de vista.' }
  ];

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

  return (
    <section 
      className="w-full relative overflow-hidden py-12 @md:py-20 @lg:py-24"
      style={{ 
        backgroundColor: bgColor
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
          >
            {headerTitle}
          </h2>
          {headerSubtitle && (
            <p className="text-slate-500 max-w-2xl text-lg">
              {headerSubtitle}
            </p>
          )}
        </div>

        <motion.div 
          variants={entranceAnim ? containerVariants : {}}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className={`grid ${layout === 'masonry' ? 'columns-2 @md:columns-3 @lg:columns-4' : (
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
          {MOCK_IMAGES.map((img, i) => (
            <div key={i} className={layout === 'masonry' ? 'mb-4 break-inside-avoid' : ''}>
              <GalleryItem 
                img={img} 
                index={i} 
                layout={layout}
                entranceAnim={entranceAnim}
                itemVariants={itemVariants}
                radius={radius}
                aspectRatio={aspectRatio}
                enableLightbox={enableLightbox}
                setSelectedImage={setSelectedImage}
                hoverEffect={hoverEffect}
                overlayColor={overlayColor}
                showCaptions={showCaptions}
                captionPosition={captionPosition}
                captionSize={captionSize}
                captionColor={captionColor}
              />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-12"
            onClick={() => setSelectedImage(null)}
          >
            <button 
              className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-[110]"
              onClick={() => setSelectedImage(null)}
            >
              <X size={32} />
            </button>
            
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={selectedImage} 
              className="max-w-full max-h-full object-contain shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
