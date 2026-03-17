import React from 'react';
import { Typography } from '../ui/Typography';
import { ModuleWrapper } from '../ui/ModuleWrapper';
import { usePageLayout } from '../../context/PageLayoutContext';

interface StatsModuleProps {
  data: any;
  onUpdate?: (data: any) => void;
}

export const StatsModule = ({ data, onUpdate }: StatsModuleProps) => {
  const { previewDevice } = usePageLayout();
  const is_mobile_simulated = previewDevice === 'mobile';
  const stats = data?.stats || [
    { val: '15k+', label: 'Usuarios' },
    { val: '40m', label: 'Ventas' },
    { val: '120', label: 'Países' },
    { val: '24/7', label: 'Soporte' }
  ];

  const handleTextUpdate = (path: string, value: string) => {
    if (onUpdate) {
      const newData = { ...data };
      if (!newData.stats) newData.stats = stats;

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
      className={data?.theme === 'light' ? 'bg-surface text-text' : 'bg-primary text-white'}
    >
      {data?.title && (
        <div className={`text-center ${is_mobile_simulated ? 'mb-8' : 'mb-12'}`}>
          <Typography
            variant="h2"
            className={`${is_mobile_simulated ? 'text-2xl' : 'text-3xl'} font-black mb-4 text-white`}
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate('title', text)}
          >
            {data.title}
          </Typography>
        </div>
      )}
      <div className={`grid ${is_mobile_simulated ? 'grid-cols-1 gap-10' : 'grid-cols-2 md:grid-cols-4 gap-8'} text-center`}>
        {stats.map((stat: any, i: number) => (
          <div key={i}>
            <Typography
              variant="p"
              className={`${is_mobile_simulated ? 'text-4xl' : 'text-4xl md:text-5xl'} font-black mb-2`}
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate(`stats.${i}.val`, text)}
            >
              {stat.val}
            </Typography>
            <Typography
              variant="p"
              className="text-white/80 text-xs font-bold uppercase tracking-widest"
              editable={!!onUpdate}
              onUpdate={(text) => handleTextUpdate(`stats.${i}.label`, text)}
            >
              {stat.label}
            </Typography>
          </div>
        ))}
      </div>
    </ModuleWrapper>
  );
};
