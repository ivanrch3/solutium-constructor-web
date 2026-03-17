import React from 'react';
import * as LucideIcons from 'lucide-react';
import { ModuleWrapper } from '../ui/ModuleWrapper';
import { Typography } from '../ui/Typography';
import { usePageLayout } from '../../context/PageLayoutContext';

const getIcon = (name: string) => {
  const Icon = (LucideIcons as any)[name] || LucideIcons.Zap;
  return Icon;
};

export const FeaturesModule = ({ data, onUpdate }: { data: any, onUpdate?: (data: any) => void }) => {
  const { previewDevice } = usePageLayout();
  const is_mobile_simulated = previewDevice === 'mobile';
  const layout_type = data?.layout_type || 'grid';
  const columns = data?.columns || 3;
  const alignment = data?.alignment || 'center';
  const gap = data?.gap !== undefined ? data.gap : 32;
  const card_style = data?.card_style || { border: true, shadow: 'sm', border_radius: 'xl' };
  const features = data?.features || [];
  const show_icons = data?.show_icons !== false;
  const show_descriptions = data?.show_descriptions !== false;

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

  const getCardClasses = () => {
    const classes = ['h-full transition-all duration-300 group flex flex-col'];
    
    if (card_style.border) classes.push('border border-text/10 hover:border-primary/30');
    if (card_style.glass) classes.push('bg-surface/50 backdrop-blur-md');
    else classes.push('bg-surface');
    
    const shadowMap: Record<string, string> = {
      none: '',
      sm: 'shadow-sm hover:shadow-xl hover:shadow-primary/5',
      md: 'shadow-md hover:shadow-2xl hover:shadow-primary/10',
      lg: 'shadow-xl hover:shadow-3xl hover:shadow-primary/20'
    };
    classes.push(shadowMap[card_style.shadow || 'none']);

    const radiusMap: Record<string, string> = {
      none: 'rounded-none',
      md: 'rounded-2xl',
      xl: 'rounded-[2rem]',
      '3xl': 'rounded-[3rem]'
    };
    classes.push(radiusMap[card_style.border_radius || 'xl']);

    if (alignment === 'center') classes.push('items-center text-center p-10');
    else classes.push('items-start text-left p-10');

    return classes.join(' ');
  };

  const renderMedia = (feature: any, idx: number) => {
    if (!show_icons) return null;

    if (feature.media_type === 'image' && feature.image) {
      return (
        <div className="mb-8 w-full aspect-video rounded-xl overflow-hidden border border-text/5">
          <img 
            src={feature.image} 
            alt={feature.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        </div>
      );
    }

    const Icon = getIcon(feature.icon || 'Zap');
    const shapeClasses = {
      circle: 'rounded-full',
      square: 'rounded-xl',
      squircle: 'rounded-[1.5rem]'
    }[feature.icon_style?.shape || 'circle'];

    const typeClasses = {
      solid: 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white',
      gradient: 'bg-gradient-to-br from-primary/20 to-accent/20 text-primary group-hover:from-primary group-hover:to-accent group-hover:text-white',
      outlined: 'border-2 border-primary/20 text-primary group-hover:border-primary group-hover:bg-primary/5'
    }[feature.icon_style?.type || 'solid'];

    return (
      <div className={`w-16 h-16 flex items-center justify-center mb-8 transition-all duration-300 group-hover:scale-110 ${shapeClasses} ${typeClasses}`}>
        <Icon className="w-8 h-8" />
      </div>
    );
  };

  const renderFeature = (feature: any, idx: number) => (
    <div key={idx} className={getCardClasses()}>
      {feature.badge && (
        <span className="mb-4 px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full inline-block">
          <Typography
            variant="span"
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate(`features.${idx}.badge`, text)}
          >
            {feature.badge}
          </Typography>
        </span>
      )}
      
      {renderMedia(feature, idx)}

      <Typography
        variant="h3"
        className="text-2xl font-bold text-text mb-4"
        editable={!!onUpdate}
        onUpdate={(text) => handleTextUpdate(`features.${idx}.title`, text)}
      >
        {feature.title || 'Característica'}
      </Typography>

      {show_descriptions && (
        <Typography
          variant="p"
          className="text-text/60 leading-relaxed mb-6 flex-grow"
          editable={!!onUpdate}
          onUpdate={(text) => handleTextUpdate(`features.${idx}.description`, text)}
        >
          {feature.description || 'Descripción de la característica.'}
        </Typography>
      )}

      {feature.link?.text && (
        <a 
          href={feature.link.url || '#'} 
          target={feature.link.target || '_self'}
          onClick={(e) => {
            if (onUpdate) e.preventDefault();
          }}
          className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:gap-3 transition-all cursor-pointer"
        >
          <Typography
            variant="span"
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate(`features.${idx}.link.text`, text)}
          >
            {feature.link.text}
          </Typography>
          <LucideIcons.ArrowRight className="w-4 h-4" />
        </a>
      )}
    </div>
  );

  const renderHeader = () => (
    <div className={`mb-20 ${alignment === 'center' ? 'text-center' : 'text-left'}`}>
      <Typography 
        variant={data?.title_style?.size || 'h2'}
        weight={data?.title_style?.weight || '900'}
        align={data?.title_style?.align || alignment}
        className="mb-6 tracking-tight"
        editable={!!onUpdate}
        onUpdate={(text) => handleTextUpdate('title', text)}
      >
        {data?.title || 'Nuestros Servicios'}
      </Typography>
      <Typography 
        variant={data?.subtitle_style?.size || 'p'}
        weight={data?.subtitle_style?.weight || '400'}
        align={data?.subtitle_style?.align || alignment}
        className="opacity-60 max-w-2xl mx-auto leading-relaxed"
        editable={!!onUpdate}
        onUpdate={(text) => handleTextUpdate('subtitle', text)}
      >
        {data?.subtitle || 'Descubre cómo podemos ayudarte a alcanzar tus objetivos.'}
      </Typography>
    </div>
  );

  const renderContent = () => {
    const gridCols = is_mobile_simulated ? 'grid-cols-1' : {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    }[columns as 1|2|3|4] || 'grid-cols-1 md:grid-cols-3';

    switch (layout_type) {
      case 'bento':
        return (
          <div className={`grid ${is_mobile_simulated ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-4'} gap-6`}>
            {features.map((feature: any, idx: number) => {
              const is_large = idx === 0 || idx === 3;
              return (
                <div key={idx} className={`${is_large && !is_mobile_simulated ? 'md:col-span-2' : 'md:col-span-1'}`}>
                  {renderFeature(feature, idx)}
                </div>
              );
            })}
          </div>
        );
      
      case 'zigzag':
        return (
          <div className="space-y-16 md:space-y-24">
            {features.map((feature: any, idx: number) => (
              <div key={idx} className={`flex flex-col ${is_mobile_simulated ? '' : 'lg:flex-row'} items-center gap-8 md:gap-12 ${idx % 2 !== 0 && !is_mobile_simulated ? 'lg:flex-row-reverse' : ''}`}>
                <div className={`${is_mobile_simulated ? 'w-full' : 'lg:w-1/2 w-full'}`}>
                  <div className="aspect-video rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl border border-text/10">
                    <img 
                      src={feature.image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80'} 
                      className="w-full h-full object-cover"
                      alt={feature.title}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
                <div className={`${is_mobile_simulated ? 'w-full' : 'lg:w-1/2 w-full'}`}>
                  <div className={`${is_mobile_simulated ? 'w-full' : 'max-w-md'}`}>
                    {renderFeature({ ...feature, media_type: 'none' }, idx)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'list':
        return (
          <div className={`grid ${is_mobile_simulated ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-x-12 gap-y-6 md:gap-y-8`}>
            {features.map((feature: any, idx: number) => (
              <div key={idx} className="flex items-start gap-4 md:gap-6 p-4 md:p-6 hover:bg-surface rounded-3xl transition-colors group">
                {show_icons && (
                  <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                    {React.createElement(getIcon(feature.icon || 'Zap'), { className: 'w-5 h-5 md:w-6 md:h-6' })}
                  </div>
                )}
                <div className="flex-grow">
                  <Typography 
                    variant="h4" 
                    className="text-lg md:text-xl font-bold mb-1 md:mb-2"
                    editable={!!onUpdate}
                    onUpdate={(text) => handleTextUpdate(`features.${idx}.title`, text)}
                  >
                    {feature.title}
                  </Typography>
                  {show_descriptions && (
                    <Typography 
                      variant="p" 
                      className="text-sm opacity-60"
                      editable={!!onUpdate}
                      onUpdate={(text) => handleTextUpdate(`features.${idx}.description`, text)}
                    >
                      {feature.description}
                    </Typography>
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      case 'carousel':
        return (
          <div className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar">
            {features.map((feature: any, idx: number) => (
              <div key={idx} className="min-w-[300px] md:min-w-[400px] snap-center">
                {renderFeature(feature, idx)}
              </div>
            ))}
          </div>
        );

      default: // Grid
        return (
          <div className={`grid ${gridCols}`} style={{ gap: `${gap}px` }}>
            {features.map((feature: any, idx: number) => renderFeature(feature, idx))}
          </div>
        );
    }
  };

  return (
    <ModuleWrapper 
      theme={data?.theme}
      background={data?.background}
    >
      {renderHeader()}
      {renderContent()}
      
      {data?.section_button?.text && (
        <div className={`mt-20 flex ${alignment === 'center' ? 'justify-center' : 'justify-start'}`}>
          <a 
            href={data.section_button.url || '#'} 
            target={data.section_button.target || '_self'}
            onClick={(e) => {
              if (onUpdate) e.preventDefault();
            }}
            className="px-10 py-5 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Typography
              variant="span"
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate('section_button.text', text)}
            >
              {data.section_button.text}
            </Typography>
          </a>
        </div>
      )}
    </ModuleWrapper>
  );
};
