import React from 'react';
import { Typography } from '../ui/Typography';
import { ModuleWrapper } from '../ui/ModuleWrapper';
import { usePageLayout } from '../../context/PageLayoutContext';

interface TeamModuleProps {
  data: any;
  onUpdate?: (data: any) => void;
}

export const TeamModule = ({ data, onUpdate }: TeamModuleProps) => {
  const { previewDevice } = usePageLayout();
  const is_mobile_simulated = previewDevice === 'mobile';
  const items = data?.items || [
    { name: 'Nombre Apellido', role: 'Cargo / Especialidad', image: '' },
    { name: 'Nombre Apellido', role: 'Cargo / Especialidad', image: '' },
    { name: 'Nombre Apellido', role: 'Cargo / Especialidad', image: '' },
    { name: 'Nombre Apellido', role: 'Cargo / Especialidad', image: '' }
  ];

  const handleTextUpdate = (path: string, value: string) => {
    if (onUpdate) {
      const newData = { ...data };
      // Ensure items exist in data if we are updating them
      if (!newData.items) {
        newData.items = items;
      }

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
    >
      <div className={`text-center ${is_mobile_simulated ? 'mb-10' : 'mb-16'}`}>
        <Typography
          variant="h2"
          className={`${is_mobile_simulated ? 'text-2xl' : 'text-3xl'} font-bold mb-4`}
          editable={!!onUpdate}
          onUpdate={(text) => handleTextUpdate('title', text)}
        >
          {data?.title || 'Nuestro Equipo'}
        </Typography>
        <Typography
          variant="p"
          className="opacity-60 max-w-xl mx-auto"
          editable={!!onUpdate}
          onUpdate={(text) => handleTextUpdate('subtitle', text)}
        >
          {data?.subtitle || 'Profesionales apasionados por la tecnología y el diseño.'}
        </Typography>
      </div>
      <div className={`grid ${is_mobile_simulated ? 'grid-cols-1 gap-10' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8'}`}>
        {items.map((item: any, i: number) => (
          <div key={i} className="text-center group">
            <div className={`aspect-square bg-current/5 ${is_mobile_simulated ? 'rounded-2xl' : 'rounded-3xl'} mb-4 overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500`}>
              <img src={item.image || `https://picsum.photos/seed/team${i}/400/400`} alt={item.name || "Team Member"} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <Typography
              variant="h4"
              className="font-bold"
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate(`items.${i}.name`, text)}
            >
              {item.name || 'Nombre Apellido'}
            </Typography>
            <Typography
              variant="p"
              className="text-xs opacity-40 uppercase tracking-widest mt-1"
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate(`items.${i}.role`, text)}
            >
              {item.role || 'Cargo / Especialidad'}
            </Typography>
          </div>
        ))}
      </div>
    </ModuleWrapper>
  );
};
