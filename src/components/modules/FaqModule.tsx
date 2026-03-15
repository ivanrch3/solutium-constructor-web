import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Typography } from '../ui/Typography';
import { ModuleWrapper } from '../ui/ModuleWrapper';

interface FaqModuleProps {
  data: any;
  onUpdate?: (data: any) => void;
}

export const FaqModule = ({ data, onUpdate }: FaqModuleProps) => {
  const items = data?.items || [
    { q: '¿Cómo funciona la sincronización con Solutium?', a: 'Es automática. Una vez conectas tu cuenta, todos tus productos y leads se sincronizan en tiempo real.' },
    { q: '¿Puedo usar mi propio dominio?', a: 'Sí, en el plan Pro y superiores puedes conectar cualquier dominio que ya poseas.' },
    { q: '¿Ofrecen soporte técnico?', a: 'Por supuesto. Nuestro equipo está disponible 24/7 para ayudarte con cualquier duda o problema.' }
  ];

  const handleTextUpdate = (path: string, value: string) => {
    if (onUpdate) {
      const newData = { ...data };
      if (!newData.items) newData.items = items;

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
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <Typography
            variant="h2"
            className="text-3xl font-bold mb-4"
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate('title', text)}
          >
            {data?.title || 'Preguntas Frecuentes'}
          </Typography>
          <Typography
            variant="p"
            className="opacity-60"
            editable={!!onUpdate}
            onUpdate={(text) => handleTextUpdate('subtitle', text)}
          >
            {data?.subtitle || 'Todo lo que necesitas saber sobre nuestro servicio.'}
          </Typography>
        </div>
        <div className="space-y-4">
          {items.map((item: any, i: number) => (
            <div key={i} className="bg-current/5 p-6 rounded-2xl border border-current/10">
              <div className="flex items-start gap-3 mb-2">
                <HelpCircle className="w-5 h-5 text-primary mt-1 shrink-0" />
                <Typography
                  variant="h4"
                  className="font-bold"
                  editable={!!onUpdate}
                  onUpdate={(text) => handleTextUpdate(`items.${i}.q`, text)}
                >
                  {item.q}
                </Typography>
              </div>
              <Typography
                variant="p"
                className="text-sm opacity-60 leading-relaxed pl-8"
                editable={!!onUpdate}
                onUpdate={(text) => handleTextUpdate(`items.${i}.a`, text)}
              >
                {item.a}
              </Typography>
            </div>
          ))}
        </div>
      </div>
    </ModuleWrapper>
  );
};
