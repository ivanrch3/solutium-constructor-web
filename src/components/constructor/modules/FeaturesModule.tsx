import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export const FeaturesModule: React.FC<{ 
  moduleId: string, 
  settingsValues: Record<string, any> 
}> = ({ moduleId, settingsValues }) => {
  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  };

  const title = getVal(null, 'title', 'Nuestras Ventajas');
  const columns = getVal(null, 'columns', 3);
  const sectionIcon = getVal(null, 'section_icon', '');

  const MOCK_FEATURES = [
    { title: 'Velocidad Increíble', desc: 'Optimizado para cargar en menos de 1 segundo.' },
    { title: 'Seguridad Total', desc: 'Protección de datos con los más altos estándares.' },
    { title: 'Soporte 24/7', desc: 'Estamos aquí para ayudarte en cualquier momento.' },
    { title: 'Diseño Adaptable', desc: 'Se ve perfecto en cualquier dispositivo.' },
    { title: 'Fácil de Usar', desc: 'Interfaz intuitiva diseñada para todos.' },
    { title: 'Escalabilidad', desc: 'Crece con tu negocio sin complicaciones.' }
  ];

  return (
    <section className="py-20 px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center mb-16">
          {sectionIcon && (
            <img 
              src={sectionIcon} 
              alt="Section Icon" 
              className="w-16 h-16 object-contain mb-6"
              referrerPolicy="no-referrer"
            />
          )}
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
            {title}
          </h2>
          <div className="w-20 h-1.5 bg-blue-600 rounded-full"></div>
        </div>

        <div 
          className="grid gap-8"
          style={{ 
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` 
          }}
        >
          {MOCK_FEATURES.slice(0, columns * 2).map((feature, i) => (
            <div key={i} className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-blue-200">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
