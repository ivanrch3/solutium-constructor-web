import React from 'react';
import { Star, CheckCircle2, Quote, Linkedin, Twitter, MessageSquare } from 'lucide-react';
import { ModuleWrapper } from '../ui/ModuleWrapper';
import { Typography } from '../ui/Typography';

export const TestimonialsModule = ({ data, onUpdate }: { data: any, onUpdate?: (data: any) => void }) => {
  const [activeSpotlight, setActiveSpotlight] = React.useState(0);
  const layoutType = data?.layoutType || 'grid';
  const columns = data?.columns || 3;
  const alignment = data?.alignment || 'center';
  const gap = data?.gap !== undefined ? data.gap : 32;
  const cardStyle = data?.cardStyle || { border: true, shadow: 'sm', borderRadius: 'xl', style: 'classic' };
  const testimonials = data?.testimonials || [];
  
  const showRating = data?.showRating !== false;
  const showAvatar = data?.showAvatar !== false;
  const showRole = data?.showRole !== false;
  const showCompany = data?.showCompany !== false;

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
  
  // ... (getCardClasses, renderRating, renderSourceIcon, renderTestimonial helper functions remain same)

  const getCardClasses = () => {
    const classes = ['h-full transition-all duration-300 group flex flex-col relative'];
    
    // Base Style
    if (cardStyle.style === 'bubble') {
      classes.push('bg-surface p-8 rounded-2xl relative mb-4');
      if (cardStyle.border) classes.push('border border-text/10');
    } else if (cardStyle.style === 'flat') {
      classes.push('bg-transparent p-0');
    } else {
      // Classic
      if (cardStyle.glass) classes.push('bg-surface/50 backdrop-blur-md');
      else classes.push('bg-surface');
      
      if (cardStyle.border) classes.push('border border-text/10 hover:border-primary/30');
      
      const shadowMap: Record<string, string> = {
        none: '',
        sm: 'shadow-sm hover:shadow-xl hover:shadow-primary/5',
        md: 'shadow-md hover:shadow-2xl hover:shadow-primary/10',
        lg: 'shadow-xl hover:shadow-3xl hover:shadow-primary/20'
      };
      classes.push(shadowMap[cardStyle.shadow || 'none']);

      const radiusMap: Record<string, string> = {
        none: 'rounded-none',
        md: 'rounded-2xl',
        xl: 'rounded-[2rem]',
        '3xl': 'rounded-[3rem]'
      };
      classes.push(radiusMap[cardStyle.borderRadius || 'xl']);
      
      classes.push('p-8');
    }

    if (alignment === 'center') classes.push('items-center text-center');
    else classes.push('items-start text-left');

    return classes.join(' ');
  };

  const renderRating = (rating: number) => {
    if (!showRating) return null;
    return (
      <div className="flex gap-1 text-amber-400 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`w-4 h-4 ${i < rating ? 'fill-current' : 'text-text/20'}`} 
          />
        ))}
      </div>
    );
  };

  const renderSourceIcon = (source: string) => {
    switch (source) {
      case 'linkedin': return <Linkedin className="w-4 h-4 text-[#0077b5]" />;
      case 'twitter': return <Twitter className="w-4 h-4 text-[#1DA1F2]" />;
      case 'trustpilot': return <Star className="w-4 h-4 text-[#00b67a] fill-current" />;
      default: return null;
    }
  };

  const renderTestimonial = (test: any, idx: number) => (
    <div key={idx} className={getCardClasses()}>
      {cardStyle.style === 'bubble' && (
        <div className={`absolute -bottom-3 ${alignment === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-8'} w-6 h-6 bg-surface border-b border-r border-text/10 rotate-45 transform`} />
      )}
      
      {cardStyle.style !== 'minimal' && (
        <Quote className={`w-8 h-8 text-primary/20 mb-4 ${alignment === 'center' ? 'mx-auto' : ''}`} />
      )}

      {renderRating(test.rating || 5)}

      <Typography
        variant="p"
        className="text-lg leading-relaxed italic mb-6 flex-grow opacity-80"
        editable={!!onUpdate}
        onUpdate={(text) => handleTextUpdate(`testimonials.${idx}.content`, text)}
      >
        {`"${test.content}"`}
      </Typography>

      <div className={`flex items-center gap-4 mt-auto ${cardStyle.style === 'bubble' ? 'pt-4' : ''}`}>
        {showAvatar && test.avatar && (
          <div className="relative">
            <img 
              src={test.avatar} 
              alt={test.name} 
              className="w-12 h-12 rounded-full object-cover border-2 border-surface shadow-sm"
              referrerPolicy="no-referrer"
            />
            {test.source && test.source !== 'none' && (
              <div className="absolute -bottom-1 -right-1 bg-surface rounded-full p-1 shadow-sm border border-text/5">
                {renderSourceIcon(test.source)}
              </div>
            )}
          </div>
        )}
        
        <div className={alignment === 'center' && !showAvatar ? 'w-full' : ''}>
          <div className="flex items-center gap-2 justify-center">
            <Typography
              variant="h4"
              className="font-bold text-sm"
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate(`testimonials.${idx}.name`, text)}
            >
              {test.name}
            </Typography>
            {test.verified && (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            )}
          </div>
          
          {(showRole || showCompany) && (
            <div className="text-xs opacity-60 flex gap-1 justify-center">
              {showRole && (
                <Typography
                  variant="span"
                  editable={!!onUpdate}
                  onUpdate={(text) => handleTextUpdate(`testimonials.${idx}.role`, text)}
                >
                  {test.role}
                </Typography>
              )}
              {showRole && showCompany && <span>•</span>}
              {showCompany && (
                <Typography
                  variant="span"
                  editable={!!onUpdate}
                  onUpdate={(text) => handleTextUpdate(`testimonials.${idx}.company`, text)}
                >
                  {test.company}
                </Typography>
              )}
            </div>
          )}
        </div>
      </div>
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
        {data?.title || 'Lo que dicen nuestros clientes'}
      </Typography>
      <Typography 
        variant={data?.subtitle_style?.size || 'p'}
        weight={data?.subtitle_style?.weight || '400'}
        align={data?.subtitle_style?.align || alignment}
        className="opacity-60 max-w-2xl mx-auto leading-relaxed"
        editable={!!onUpdate}
        onUpdate={(text) => handleTextUpdate('subtitle', text)}
      >
        {data?.subtitle || 'Historias de éxito de personas como tú.'}
      </Typography>
    </div>
  );

  const renderContent = () => {
    const gridCols = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    }[columns as 1|2|3|4] || 'grid-cols-1 md:grid-cols-3';

    switch (layoutType) {
      case 'masonry':
        return (
          <div className={`columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8`}>
            {testimonials.map((test: any, idx: number) => (
              <div key={idx} className="break-inside-avoid">
                {renderTestimonial(test, idx)}
              </div>
            ))}
          </div>
        );

      case 'carousel':
        return (
          <div className="flex gap-6 overflow-x-auto pb-12 snap-x no-scrollbar px-4 -mx-4">
            {testimonials.map((test: any, idx: number) => (
              <div key={idx} className="min-w-[300px] md:min-w-[400px] snap-center">
                {renderTestimonial(test, idx)}
              </div>
            ))}
          </div>
        );

      case 'spotlight':
        const spotlight = testimonials[activeSpotlight] || testimonials[0];
        if (!spotlight) return null;
        return (
          <div className="max-w-4xl mx-auto text-center">
            <Quote className="w-16 h-16 text-primary/20 mx-auto mb-8" />
            <div className="min-h-[200px] flex items-center justify-center">
               <Typography
                variant="h3"
                className="text-3xl md:text-5xl font-bold leading-tight mb-12 animate-in fade-in zoom-in duration-500"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate(`testimonials.${activeSpotlight}.content`, text)}
              >
                {`"${spotlight.content}"`}
              </Typography>
            </div>
           
            <div className="flex flex-col items-center gap-4">
              {showAvatar && spotlight.avatar && (
                <img 
                  src={spotlight.avatar} 
                  alt={spotlight.name} 
                  className="w-20 h-20 rounded-full object-cover border-4 border-surface shadow-xl"
                  referrerPolicy="no-referrer"
                />
              )}
              <div>
                <div className="font-bold text-xl flex items-center gap-2 justify-center">
                  <Typography
                    variant="span"
                    editable={!!onUpdate}
                    onUpdate={(text) => handleTextUpdate(`testimonials.${activeSpotlight}.name`, text)}
                  >
                    {spotlight.name}
                  </Typography>
                  {spotlight.verified && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                </div>
                {(showRole || showCompany) && (
                  <div className="opacity-60 flex gap-1 justify-center">
                    {showRole && (
                      <Typography
                        variant="span"
                        editable={!!onUpdate}
                        onUpdate={(text) => handleTextUpdate(`testimonials.${activeSpotlight}.role`, text)}
                      >
                        {spotlight.role}
                      </Typography>
                    )}
                    {showRole && showCompany && <span>@</span>}
                    {showCompany && (
                      <Typography
                        variant="span"
                        editable={!!onUpdate}
                        onUpdate={(text) => handleTextUpdate(`testimonials.${activeSpotlight}.company`, text)}
                      >
                        {spotlight.company}
                      </Typography>
                    )}
                  </div>
                )}
              </div>
            </div>

            {testimonials.length > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                {testimonials.map((_: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSpotlight(idx)}
                    className={`w-3 h-3 rounded-full transition-all ${idx === activeSpotlight ? 'bg-primary w-8' : 'bg-text/20 hover:bg-text/40'}`}
                  />
                ))}
              </div>
            )}
          </div>
        );

      case 'minimal':
        return (
          <div className={`grid ${gridCols} gap-12 divide-y md:divide-y-0 md:divide-x divide-text/10`}>
            {testimonials.map((test: any, idx: number) => (
              <div key={idx} className="px-6 first:pl-0 last:pr-0">
                {showRating && (
                  <div className="flex gap-1 text-primary mb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < (test.rating || 5) ? 'fill-current' : 'text-text/20'}`} />)}
                  </div>
                )}
                <Typography
                  variant="p"
                  className="text-lg font-medium mb-6"
                  editable={!!onUpdate}
                  onUpdate={(text) => handleTextUpdate(`testimonials.${idx}.content`, text)}
                >
                  {`"${test.content}"`}
                </Typography>
                <div className="flex items-center gap-3">
                  {showAvatar && test.avatar && (
                    <img src={test.avatar} className="w-10 h-10 rounded-full" alt={test.name} referrerPolicy="no-referrer" />
                  )}
                  <div>
                    <Typography
                      variant="p"
                      className="font-bold text-sm"
                      editable={!!onUpdate}
                      onUpdate={(text) => handleTextUpdate(`testimonials.${idx}.name`, text)}
                    >
                      {test.name}
                    </Typography>
                    {(showRole || showCompany) && (
                      <div className="text-xs opacity-60 flex gap-1">
                        {showRole && <span>{test.role}</span>}
                        {showRole && showCompany && <span>•</span>}
                        {showCompany && <span>{test.company}</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      default: // Grid
        return (
          <div className={`grid ${gridCols}`} style={{ gap: `${gap}px` }}>
            {testimonials.map((test: any, idx: number) => renderTestimonial(test, idx))}
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
      
      {data?.sectionButton?.text && (
        <div className={`mt-20 flex ${alignment === 'center' ? 'justify-center' : 'justify-start'}`}>
          <a 
            href={data.sectionButton.url || '#'} 
            target={data.sectionButton.target || '_self'}
            className="px-10 py-5 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
          >
            {data.sectionButton.text}
          </a>
        </div>
      )}
    </ModuleWrapper>
  );
};
