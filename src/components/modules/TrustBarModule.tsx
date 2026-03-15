import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Typography } from '../ui/Typography';
import { ModuleWrapper } from '../ui/ModuleWrapper';

interface TrustBarModuleProps {
  data: any;
  onUpdate?: (data: any) => void;
}

export const TrustBarModule = ({ data, onUpdate }: TrustBarModuleProps) => {
  const logos = data?.logos || [
    { name: 'Empresa 1', url: 'https://placehold.co/200x80?text=LOGO+1' },
    { name: 'Empresa 2', url: 'https://placehold.co/200x80?text=LOGO+2' },
    { name: 'Empresa 3', url: 'https://placehold.co/200x80?text=LOGO+3' },
    { name: 'Empresa 4', url: 'https://placehold.co/200x80?text=LOGO+4' },
    { name: 'Empresa 5', url: 'https://placehold.co/200x80?text=LOGO+5' }
  ];

  const isGrayscale = data?.grayscale !== false;
  const opacity = data?.opacity || 50;

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

  return (
    <ModuleWrapper 
      theme={data?.theme}
      background={data?.background}
      className="rounded-2xl border border-current/10"
      noPadding
    >
      <div className="py-12 px-8">
        <Typography
          variant="p"
          className="text-center text-xs font-bold opacity-40 uppercase tracking-[0.2em] mb-8"
          editable={!!onUpdate}
          onUpdate={(text) => handleTextUpdate('title', text)}
        >
          {data?.title || 'Empresas que confían en nosotros'}
        </Typography>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {logos.map((logo: any, i: number) => (
            <div 
              key={i} 
              className={`flex items-center gap-2 transition-all duration-500 hover:grayscale-0 hover:opacity-100`}
              style={{ 
                filter: isGrayscale ? 'grayscale(100%)' : 'none',
                opacity: opacity / 100
              }}
            >
              {logo.url ? (
                <img 
                  src={logo.url} 
                  alt={logo.name || `Partner ${i}`} 
                  className="h-8 md:h-10 w-auto object-contain invert-0 dark:invert"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6" />
                  <Typography
                    variant="span"
                    className="font-black text-xl tracking-tighter italic"
                    editable={!!onUpdate}
                    onUpdate={(text) => handleTextUpdate(`logos.${i}.name`, text)}
                  >
                    {logo.name || `BRAND ${i + 1}`}
                  </Typography>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </ModuleWrapper>
  );
};
