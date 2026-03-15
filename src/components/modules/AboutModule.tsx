import React from 'react';
import { BookOpen } from 'lucide-react';
import { Typography } from '../ui/Typography';
import { ModuleWrapper } from '../ui/ModuleWrapper';

interface AboutModuleProps {
  data: any;
  onUpdate?: (data: any) => void;
}

export const AboutModule = ({ data, onUpdate }: AboutModuleProps) => {
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

  return (
    <ModuleWrapper 
      theme={data?.theme}
      background={data?.background}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <div className="aspect-square bg-current/5 rounded-[3rem] overflow-hidden relative z-10">
            <img 
              src={data?.image || `https://picsum.photos/seed/about/800/800`} 
              alt="About Us" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-primary rounded-[2rem] -z-0" />
          <div className="absolute -top-6 -left-6 w-32 h-32 bg-current rounded-[2rem] -z-0 opacity-10" />
        </div>
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold mb-6">
            <BookOpen className="w-4 h-4" />
            <Typography
              variant="span"
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate('badge', text)}
            >
              {data?.badge || 'Nuestra Historia'}
            </Typography>
          </div>
          <Typography
            variant="h2"
            className="text-4xl md:text-5xl font-black mb-6 leading-tight"
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate('title', text)}
          >
            {data?.title || 'Más de 10 años impulsando el éxito digital'}
          </Typography>
          <Typography
            variant="p"
            className="text-lg opacity-60 mb-8 leading-relaxed"
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate('description', text)}
          >
            {data?.description || 'Nacimos con una misión clara: democratizar el acceso a la mejor tecnología para negocios de todos los tamaños. Hoy, somos líderes en soluciones inteligentes para el mercado hispano.'}
          </Typography>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <Typography
                variant="h4"
                className="text-3xl font-black text-primary mb-1"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('stat1.value', text)}
              >
                {data?.stat1?.value || '99%'}
              </Typography>
              <Typography
                variant="p"
                className="text-sm opacity-40 font-bold uppercase tracking-wider"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('stat1.label', text)}
              >
                {data?.stat1?.label || 'Satisfacción'}
              </Typography>
            </div>
            <div>
              <Typography
                variant="h4"
                className="text-3xl font-black mb-1"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('stat2.value', text)}
              >
                {data?.stat2?.value || '24/7'}
              </Typography>
              <Typography
                variant="p"
                className="text-sm opacity-40 font-bold uppercase tracking-wider"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate('stat2.label', text)}
              >
                {data?.stat2?.label || 'Soporte Real'}
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </ModuleWrapper>
  );
};
