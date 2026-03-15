import React from 'react';
import { Typography } from '../ui/Typography';
import { ModuleWrapper } from '../ui/ModuleWrapper';

interface ProcessModuleProps {
  data: any;
  onUpdate?: (data: any) => void;
}

export const ProcessModule = ({ data, onUpdate }: ProcessModuleProps) => {
  const steps = data?.steps || [
    { step: '01', title: 'Regístrate', desc: 'Crea tu cuenta en segundos y accede al panel.' },
    { step: '02', title: 'Configura', desc: 'Personaliza tus preferencias y sincroniza tus datos.' },
    { step: '03', title: 'Lanza', desc: 'Publica tu sitio y empieza a recibir clientes.' }
  ];

  const handleTextUpdate = (path: string, value: string) => {
    if (onUpdate) {
      const newData = { ...data };
      if (!newData.steps) newData.steps = steps;
      
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

  return (
    <ModuleWrapper 
      theme={data?.theme || 'dark'}
      background={data?.background}
    >
      <div className="text-center max-w-3xl mx-auto mb-16">
        <Typography
          variant="h2"
          className="text-4xl font-black mb-4"
          editable={!!onUpdate}
          onUpdate={(text) => handleTextUpdate('title', text)}
        >
          {data?.title || '¿Cómo funciona?'}
        </Typography>
        <Typography
          variant="p"
          className="opacity-60"
          editable={!!onUpdate}
          onUpdate={(text) => handleTextUpdate('subtitle', text)}
        >
          {data?.subtitle || 'Un proceso simple y transparente diseñado para tu comodidad.'}
        </Typography>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
        <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-current/20 to-transparent" />
        {steps.map((item: any, i: number) => (
          <div key={i} className="relative text-center group">
            <div className="w-24 h-24 bg-current/5 rounded-[2rem] flex items-center justify-center text-3xl font-black text-primary mb-8 mx-auto border border-current/10 group-hover:bg-primary group-hover:text-white transition-all duration-500">
              <Typography
                variant="span"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate(`steps.${i}.step`, text)}
              >
                {item.step}
              </Typography>
            </div>
            <Typography
              variant="h3"
              className="text-xl font-bold mb-3"
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate(`steps.${i}.title`, text)}
            >
              {item.title}
            </Typography>
            <Typography
              variant="p"
              className="opacity-60 text-sm leading-relaxed"
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate(`steps.${i}.desc`, text)}
            >
              {item.desc}
            </Typography>
          </div>
        ))}
      </div>
    </ModuleWrapper>
  );
};
