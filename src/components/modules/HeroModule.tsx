import React from 'react';
import { ArrowRightCircle } from 'lucide-react';
import { ModuleWrapper } from '../ui/ModuleWrapper';
import { Typography } from '../ui/Typography';

export const HeroModule = ({ data, onUpdate, onCTA }: { data: any, onUpdate?: (data: any) => void, onCTA: (e: React.MouseEvent) => void }) => {
  const layout = data?.layout || 'layout-1';
  
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

  const renderContent = (alignment: 'center' | 'left' = 'center', maxWidth: string = 'max-w-4xl') => (
    <div className={`flex flex-col ${alignment === 'center' ? 'items-center text-center' : 'items-start text-left'} ${maxWidth} ${alignment === 'center' ? 'mx-auto' : ''}`}>
      <Typography 
        variant={data?.title_style?.size || 'h2'}
        weight={data?.title_style?.weight || '900'}
        italic={data?.title_style?.italic}
        underline={data?.title_style?.underline}
        strike={data?.title_style?.strike}
        align={data?.title_style?.align || alignment}
        highlightType={data?.title_style?.highlightType}
        highlightColor1={data?.title_style?.highlightColor1}
        highlightColor2={data?.title_style?.highlightColor2}
        className="mb-6 tracking-tight"
        editable={!!onUpdate}
        onUpdate={(text) => handleTextUpdate('title', text)}
      >
        {data?.title || 'Construye el Futuro de tu Negocio'}
      </Typography>
      
      <Typography 
        variant={data?.subtitle_style?.size || 'p'}
        weight={data?.subtitle_style?.weight || '400'}
        italic={data?.subtitle_style?.italic}
        underline={data?.subtitle_style?.underline}
        strike={data?.subtitle_style?.strike}
        align={data?.subtitle_style?.align || alignment}
        className="mb-10 opacity-70 max-w-2xl"
        editable={!!onUpdate}
        onUpdate={(text) => handleTextUpdate('subtitle', text)}
      >
        {data?.subtitle || 'La plataforma todo-en-uno para gestionar, vender y crecer con Solutium.'}
      </Typography>

      <div className={`flex flex-col sm:flex-row items-center gap-4 w-full ${alignment === 'center' ? 'justify-center' : 'justify-start'}`}>
        {data?.primaryButton?.text && (
          <div className="w-full sm:w-auto">
            <a 
              href={data.primaryButton.url || '#'}
              target={data.primaryButton.target || '_self'}
              onClick={(e) => {
                if (onUpdate) e.preventDefault();
                if (!data.primaryButton.url || data.primaryButton.url === '#') {
                  onCTA(e);
                }
              }}
              className="w-full sm:w-auto px-10 py-5 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 text-center block cursor-pointer"
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
          </div>
        )}
        {data?.secondaryButton?.text && (
          <div className="w-full sm:w-auto">
            <a 
              href={data?.secondaryButton?.url || '#'}
              target={data?.secondaryButton?.target || '_self'}
              onClick={(e) => {
                if (onUpdate) e.preventDefault();
              }}
              className="w-full sm:w-auto px-10 py-5 bg-text/5 text-text font-bold rounded-2xl hover:bg-text/10 transition-all backdrop-blur-sm flex items-center justify-center gap-2 border border-text/10 text-center block cursor-pointer"
            >
              <Typography
                variant="span"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('secondaryButton.text', text)}
                className="pointer-events-auto"
              >
                {data.secondaryButton.text}
              </Typography>
              <ArrowRightCircle className="w-5 h-5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );

  const renderLayout = () => {
    switch (layout) {
      case 'layout-1': // Centered
        return renderContent('center');
      
      case 'layout-2': // Split
        return (
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {renderContent('left')}
            <div className="relative aspect-square md:aspect-video lg:aspect-square rounded-[2rem] overflow-hidden shadow-2xl border border-text/10">
              <img 
                src={data?.background?.image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80'} 
                className="w-full h-full object-cover"
                alt="Hero Visual"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        );

      case 'layout-3': // Offset Editorial
        return (
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              {renderContent('left', 'max-w-none')}
            </div>
            <div className="lg:col-span-4 flex items-end">
              <div className="p-8 bg-primary/5 rounded-3xl border border-primary/10 backdrop-blur-sm w-full">
                <Typography 
                  variant="small" 
                  weight="700" 
                  className="uppercase tracking-widest text-primary mb-2 block"
                  editable={!!onUpdate}
                  onUpdate={(text) => handleTextUpdate('badge', text)}
                >
                  {data?.badge || 'Dato Clave'}
                </Typography>
                <Typography 
                  variant="p" 
                  className="text-sm opacity-70 italic"
                  editable={!!onUpdate}
                  onUpdate={(text) => handleTextUpdate('quote', text)}
                >
                  {data?.quote || '"La innovación es lo que distingue a un líder de los demás."'}
                </Typography>
              </div>
            </div>
          </div>
        );

      case 'layout-4': // Floating Card
        return (
          <div className="flex justify-center py-12">
            <div className="bg-surface/80 backdrop-blur-xl p-10 md:p-16 rounded-[3rem] border border-text/10 shadow-2xl max-w-4xl w-full">
              {renderContent('center')}
            </div>
          </div>
        );

      case 'layout-5': // Sidebar Rail
        return (
          <div className="flex justify-start">
            <div className="max-w-md w-full">
              {renderContent('left')}
            </div>
          </div>
        );

      case 'layout-6': // Bento Box
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-3 bg-primary/5 p-12 rounded-[2.5rem] border border-primary/10">
               <Typography 
                variant={data?.title_style?.size || 'h2'}
                weight={data?.title_style?.weight || '900'}
                align="left"
                className="mb-0 tracking-tight"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('title', text)}
              >
                {data?.title || 'Construye el Futuro de tu Negocio'}
              </Typography>
            </div>
            <div className="md:col-span-2 bg-text/5 p-10 rounded-[2.5rem] border border-text/10">
              <Typography 
                variant={data?.subtitle_style?.size || 'p'}
                weight={data?.subtitle_style?.weight || '400'}
                align="left"
                className="opacity-70"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('subtitle', text)}
              >
                {data?.subtitle || 'La plataforma todo-en-uno para gestionar, vender y crecer con Solutium.'}
              </Typography>
            </div>
            <div className="bg-primary p-10 rounded-[2.5rem] flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer">
              {data?.primaryButton?.text ? (
                <a 
                  href={data.primaryButton.url || '#'}
                  target={data.primaryButton.target || '_self'}
                  onClick={(e) => {
                    if (onUpdate) e.preventDefault();
                  }}
                  className="text-white font-bold text-xl w-full h-full flex items-center justify-center"
                >
                  <Typography
                    variant="span"
                    editable={!!onUpdate}
                    onUpdate={(text) => handleTextUpdate('primaryButton.text', text)}
                  >
                    {data.primaryButton.text}
                  </Typography>
                </a>
              ) : (
                <div className="text-white/50 italic text-sm">Sin botón</div>
              )}
            </div>
          </div>
        );

      case 'layout-7': // Overlap
        return (
          <div className="relative pt-20">
            <div className="absolute top-0 right-0 w-2/3 h-full rounded-[3rem] overflow-hidden opacity-50 lg:opacity-100">
              <img 
                src={data?.background?.image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80'} 
                className="w-full h-full object-cover"
                alt="Hero Visual"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="relative z-10 bg-surface/90 backdrop-blur-md p-10 md:p-16 rounded-[3rem] border border-text/10 shadow-2xl max-w-2xl">
              {renderContent('left')}
            </div>
          </div>
        );

      default:
        return renderContent('center');
    }
  };

  return (
    <ModuleWrapper 
      layout={layout}
      theme={data?.theme}
      // For split (layout-2) and overlay (layout-7), we use the image as content, not background
      background={(layout === 'layout-2' || layout === 'layout-7') ? undefined : data?.background}
    >
      {renderLayout()}
    </ModuleWrapper>
  );
};

