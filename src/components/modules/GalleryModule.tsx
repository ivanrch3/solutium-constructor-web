import React, { useState } from 'react';
import { ArrowRight, ExternalLink, ZoomIn } from 'lucide-react';
import { ModuleWrapper } from '../ui/ModuleWrapper';
import { Typography } from '../ui/Typography';
import { usePageLayout } from '../../context/PageLayoutContext';

interface GalleryModuleProps {
  data: any;
  onUpdate?: (data: any) => void;
}

export const GalleryModule = ({ data, onUpdate }: GalleryModuleProps) => {
  const { previewDevice } = usePageLayout();
  const is_mobile_simulated = previewDevice === 'mobile';
  const [activeFilter, setActiveFilter] = useState('All');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const layout_type = data?.layout_type || 'grid';
  const columns = data?.columns || 4;
  const gap = data?.gap !== undefined ? data.gap : 16;
  const aspect_ratio = data?.aspect_ratio || 'square';
  const images = data?.images || [];
  const show_filters = data?.show_filters !== false;
  const show_overlay = data?.show_overlay !== false;
  const hover_effect = data?.hover_effect || 'zoom';
  const border_radius = data?.border_radius || 'xl';
  const show_view_all_button = data?.show_view_all_button !== false;

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

  const get_aspect_ratio_class = () => {
    switch (aspect_ratio) {
      case 'portrait': return 'aspect-[3/4]';
      case 'landscape': return 'aspect-video';
      case 'auto': return '';
      case 'square':
      default: return 'aspect-square';
    }
  };

  const get_radius_class = () => {
    switch (border_radius) {
      case 'none': return 'rounded-none';
      case 'md': return 'rounded-lg';
      case '3xl': return 'rounded-[2rem]';
      case 'xl':
      default: return 'rounded-2xl';
    }
  };

  const get_hover_class = () => {
    switch (hover_effect) {
      case 'grayscale': return 'grayscale group-hover:grayscale-0 transition-all duration-500';
      case 'tilt': return 'group-hover:scale-[1.02] group-hover:-rotate-1 transition-transform duration-300';
      case 'zoom': 
      default: return 'group-hover:scale-110 transition-transform duration-700';
    }
  };

  const renderOverlay = (img: any) => {
    if (!show_overlay) return null;
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
      className={`relative overflow-hidden group cursor-pointer bg-surface ${get_radius_class()} ${get_aspect_ratio_class()} ${extraClasses}`}
      onMouseEnter={() => setHoveredIndex(idx)}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <img 
        src={img.url} 
        alt={img.title} 
        className={`w-full h-full object-cover ${get_hover_class()}`}
        referrerPolicy="no-referrer"
      />
      {renderOverlay(img)}
    </div>
  );

  const renderContent = () => {
    if (layout_type === 'carousel') {
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

    if (layout_type === 'masonry') {
      return (
        <div className={`columns-1 ${is_mobile_simulated ? '' : 'md:columns-2 lg:columns-' + Math.min(columns, 4)} gap-4 space-y-4`}>
          {filteredImages.map((img: any, idx: number) => (
            <div key={idx} className="break-inside-avoid">
              {renderImage(img, idx, '!aspect-auto')}
            </div>
          ))}
        </div>
      );
    }

    if (layout_type === 'mosaic') {
      return (
        <div className={`grid ${is_mobile_simulated ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-4'} gap-4`}>
          {filteredImages.map((img: any, idx: number) => {
            const is_large = idx % 5 === 0;
            return renderImage(img, idx, is_large && !is_mobile_simulated ? 'col-span-2 row-span-2' : '');
          })}
        </div>
      );
    }

    // Default Grid
    const gridCols = is_mobile_simulated ? 'grid-cols-1' : {
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
      <div className={`flex flex-col ${is_mobile_simulated ? '' : 'md:flex-row md:items-end'} justify-between gap-8 mb-12`}>
        <div className="max-w-2xl">
          <Typography
            variant="h2"
            className={`${is_mobile_simulated ? 'text-3xl' : 'text-4xl'} font-black text-text mb-4 tracking-tight`}
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate('title', text)}
          >
            {data?.title || 'Galería Visual'}
          </Typography>
          <Typography
            variant="p"
            className={`text-text/60 ${is_mobile_simulated ? 'text-base' : 'text-lg'}`}
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate('subtitle', text)}
          >
            {data?.subtitle || 'Explora nuestro trabajo a través de imágenes.'}
          </Typography>
        </div>

        {show_view_all_button && (
          <a 
            href={data?.view_all_button_url || '#'}
            onClick={(e) => {
              if (onUpdate) e.preventDefault();
            }}
            className={`${is_mobile_simulated ? 'hidden' : 'hidden md:flex'} items-center gap-2 px-6 py-3 bg-surface border border-text/10 text-text font-bold rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-all cursor-pointer`}
          >
            <Typography
              variant="span"
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate('view_all_button_text', text)}
            >
              {data?.view_all_button_text || 'Ver Todo'}
            </Typography>
            <ArrowRight className="w-4 h-4" />
          </a>
        )}
      </div>

      {show_filters && categories.length > 1 && (
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

      {show_view_all_button && (
        <div className={`mt-8 ${is_mobile_simulated ? 'block' : 'md:hidden'}`}>
          <a 
            href={data?.view_all_button_url || '#'}
            onClick={(e) => {
              if (onUpdate) e.preventDefault();
            }}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-surface border border-text/10 text-text font-bold rounded-xl hover:bg-primary hover:text-white transition-all cursor-pointer"
          >
            <Typography
              variant="span"
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate('view_all_button_text', text)}
            >
              {data?.view_all_button_text || 'Ver Todo'}
            </Typography>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      )}
    </ModuleWrapper>
  );
};
