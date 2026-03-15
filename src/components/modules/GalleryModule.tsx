import React, { useState } from 'react';
import { ArrowRight, ExternalLink, ZoomIn } from 'lucide-react';
import { ModuleWrapper } from '../ui/ModuleWrapper';
import { Typography } from '../ui/Typography';

interface GalleryModuleProps {
  data: any;
  onUpdate?: (data: any) => void;
}

export const GalleryModule = ({ data, onUpdate }: GalleryModuleProps) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const layoutType = data?.layoutType || 'grid';
  const columns = data?.columns || 4;
  const gap = data?.gap !== undefined ? data.gap : 16;
  const aspectRatio = data?.aspectRatio || 'square';
  const images = data?.images || [];
  const showFilters = data?.showFilters !== false;
  const showOverlay = data?.showOverlay !== false;
  const hoverEffect = data?.hoverEffect || 'zoom';
  const borderRadius = data?.borderRadius || 'xl';
  const showViewAllButton = data?.showViewAllButton !== false;

  const categories = ['All', ...Array.from(new Set(images.map((img: any) => img.category).filter(Boolean)))];
  
  const filteredImages = activeFilter === 'All' 
    ? images 
    : images.filter((img: any) => img.category === activeFilter);

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
      case 'grayscale': return 'grayscale group-hover:grayscale-0 transition-all duration-500';
      case 'tilt': return 'group-hover:scale-[1.02] group-hover:-rotate-1 transition-transform duration-300';
      case 'zoom': 
      default: return 'group-hover:scale-110 transition-transform duration-700';
    }
  };

  const renderOverlay = (img: any) => {
    if (!showOverlay) return null;
    return (
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          {img.category && (
            <span className="text-xs font-bold text-primary uppercase tracking-widest mb-2 block">
              {img.category}
            </span>
          )}
          <h3 className="text-white font-bold text-xl mb-2">{img.title}</h3>
          {img.link && (
            <div className="flex items-center gap-2 text-white/80 text-sm font-medium mt-2">
              Ver Proyecto <ArrowRight className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderImage = (img: any, idx: number, extraClasses = '') => (
    <div 
      key={idx}
      className={`relative overflow-hidden group cursor-pointer bg-surface ${getRadiusClass()} ${getAspectRatioClass()} ${extraClasses}`}
      onMouseEnter={() => setHoveredIndex(idx)}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <img 
        src={img.url} 
        alt={img.title} 
        className={`w-full h-full object-cover ${getHoverClass()}`}
        referrerPolicy="no-referrer"
      />
      {renderOverlay(img)}
    </div>
  );

  const renderContent = () => {
    if (layoutType === 'carousel') {
      return (
        <div className="flex gap-4 overflow-x-auto pb-8 snap-x no-scrollbar -mx-4 px-4">
          {filteredImages.map((img: any, idx: number) => (
            <div key={idx} className="min-w-[300px] md:min-w-[400px] snap-center">
              {renderImage(img, idx)}
            </div>
          ))}
        </div>
      );
    }

    if (layoutType === 'masonry') {
      return (
        <div className={`columns-1 md:columns-2 lg:columns-${Math.min(columns, 4)} gap-4 space-y-4`}>
          {filteredImages.map((img: any, idx: number) => (
            <div key={idx} className="break-inside-avoid">
              {renderImage(img, idx, '!aspect-auto')}
            </div>
          ))}
        </div>
      );
    }

    if (layoutType === 'mosaic') {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredImages.map((img: any, idx: number) => {
            const isLarge = idx % 5 === 0;
            return renderImage(img, idx, isLarge ? 'col-span-2 row-span-2' : '');
          })}
        </div>
      );
    }

    // Default Grid
    const gridCols = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-2 md:grid-cols-4',
      5: 'grid-cols-2 md:grid-cols-5',
      6: 'grid-cols-2 md:grid-cols-6'
    }[columns as 1|2|3|4|5|6] || 'grid-cols-2 md:grid-cols-4';

    return (
      <div className={`grid ${gridCols}`} style={{ gap: `${gap}px` }}>
        {filteredImages.map((img: any, idx: number) => renderImage(img, idx))}
      </div>
    );
  };

  return (
    <ModuleWrapper 
      theme={data?.theme}
      background={data?.background}
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div className="max-w-2xl">
          <Typography
            variant="h2"
            className="text-4xl font-black text-text mb-4 tracking-tight"
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate('title', text)}
          >
            {data?.title || 'Galería Visual'}
          </Typography>
          <Typography
            variant="p"
            className="text-text/60 text-lg"
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate('subtitle', text)}
          >
            {data?.subtitle || 'Explora nuestro trabajo a través de imágenes.'}
          </Typography>
        </div>

        {showViewAllButton && (
          <a 
            href={data?.viewAllButtonUrl || '#'}
            onClick={(e) => {
              if (onUpdate) e.preventDefault();
            }}
            className="hidden md:flex items-center gap-2 px-6 py-3 bg-surface border border-text/10 text-text font-bold rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-all cursor-pointer"
          >
            <Typography
              variant="span"
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate('viewAllButtonText', text)}
            >
              {data?.viewAllButtonText || 'Ver Todo'}
            </Typography>
            <ArrowRight className="w-4 h-4" />
          </a>
        )}
      </div>

      {showFilters && categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat: any) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                activeFilter === cat 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'bg-surface border border-text/10 text-text/60 hover:text-text hover:border-text/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {renderContent()}

      {showViewAllButton && (
        <div className="mt-8 md:hidden">
          <a 
            href={data?.viewAllButtonUrl || '#'}
            onClick={(e) => {
              if (onUpdate) e.preventDefault();
            }}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-surface border border-text/10 text-text font-bold rounded-xl hover:bg-primary hover:text-white transition-all cursor-pointer"
          >
            <Typography
              variant="span"
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate('viewAllButtonText', text)}
            >
              {data?.viewAllButtonText || 'Ver Todo'}
            </Typography>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      )}
    </ModuleWrapper>
  );
};
