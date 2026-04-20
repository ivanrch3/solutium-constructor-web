import React from 'react';
import { 
  Palette, 
  Type, 
  Maximize, 
  ShieldCheck, 
  Globe, 
  Smartphone,
  ChevronRight,
  Sparkles,
  MousePointer2,
  Layout
} from 'lucide-react';
import { motion } from 'motion/react';
import { SettingControl } from './SettingControl';

interface GlobalSettingsPanelProps {
  settingsValues: Record<string, any>;
  onSettingChange: (id: string, settingId: string, value: any) => void;
  project: any;
  projectId: string | null;
}

export const GlobalSettingsPanel: React.FC<GlobalSettingsPanelProps> = ({ 
  settingsValues, 
  onSettingChange,
  project,
  projectId
}) => {
  const getVal = (settingId: string, defaultValue: any) => {
    return settingsValues[`global_theme_${settingId}`] !== undefined 
      ? settingsValues[`global_theme_${settingId}`] 
      : defaultValue;
  };

  const handleThemeChange = (settingId: string, value: any) => {
    onSettingChange('global', `theme_${settingId}`, value);
  };

  const sections = [
    {
      id: 'colors',
      title: 'Paleta de Colores',
      description: 'Define los colores principales de tu identidad visual.',
      icon: <Palette className="w-5 h-5" />,
      settings: [
        {
          id: 'primary_color',
          label: 'Color Primario',
          type: 'color',
          defaultValue: project?.brandColors?.primary || '#3B82F6',
          description: 'Botones principales, acentos y llamadas a la acción.'
        },
        {
          id: 'secondary_color',
          label: 'Color Secundario',
          type: 'color',
          defaultValue: '#F1F5F9',
          description: 'Fondos alternos y elementos de apoyo.'
        },
        {
          id: 'accent_color',
          label: 'Color de Acento',
          type: 'color',
          defaultValue: '#7C3AED',
          description: 'Destacados y micro-interacciones.'
        },
        {
          id: 'background_color',
          label: 'Color de Fondo',
          type: 'color',
          defaultValue: '#F8FAFC',
          description: 'Color base de las secciones del sitio.'
        },
        {
          id: 'text_color',
          label: 'Color de Texto',
          type: 'color',
          defaultValue: '#0F172A',
          description: 'Color para el cuerpo de texto principal.'
        }
      ]
    },
    {
      id: 'typography',
      title: 'Tipografía Maestra',
      description: 'Selecciona las fuentes que darán voz a tu contenido.',
      icon: <Type className="w-5 h-5" />,
      settings: [
        {
          id: 'font_sans',
          label: 'Fuente del Cuerpo',
          type: 'select',
          defaultValue: 'Inter',
          options: [
            { label: 'Inter', value: 'Inter' },
            { label: 'Roboto', value: 'Roboto' },
            { label: 'Poppins', value: 'Poppins' },
            { label: 'Montserrat', value: 'Montserrat' },
            { label: 'Outfit', value: 'Outfit' },
            { label: 'Space Grotesk', value: 'Space Grotesk' }
          ]
        },
        {
          id: 'font_heading',
          label: 'Fuente de Títulos',
          type: 'select',
          defaultValue: 'Inter',
          options: [
            { label: 'Inter', value: 'Inter' },
            { label: 'Space Grotesk', value: 'Space Grotesk' },
            { label: 'Playfair Display', value: 'Playfair Display' },
            { label: 'Clash Display', value: 'Clash Display' },
            { label: 'Outfit', value: 'Outfit' }
          ]
        }
      ]
    },
    {
      id: 'layout',
      title: 'Estructura & Bordes',
      description: 'Ajusta la redondez y densidad del diseño.',
      icon: <Layout className="w-5 h-5" />,
      settings: [
        {
          id: 'radius',
          label: 'Radio de Esquinas',
          type: 'range',
          defaultValue: 12,
          min: 0,
          max: 32,
          unit: 'px'
        },
        {
          id: 'container_width',
          label: 'Ancho Máximo',
          type: 'range',
          defaultValue: 1400,
          min: 1000,
          max: 1800,
          unit: 'px'
        }
      ]
    }
  ];

  return (
    <div className="max-w-4xl w-full mx-auto p-8 space-y-12">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Sparkles className="text-primary w-8 h-8" />
          Ajustes Globales de Estilo
        </h2>
        <p className="text-slate-500 font-medium">Configura el ADN visual de tu proyecto para mantener la consistencia en todos los módulos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-4">
          <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <MousePointer2 className="w-4 h-4 text-primary" />
              Vista Previa
            </h3>
            <div className="space-y-3">
              <div 
                className="h-20 rounded-2xl flex items-center justify-center text-white font-bold p-4 text-center text-xs"
                style={{ 
                  backgroundColor: getVal('primary_color', project?.brandColors?.primary || '#3B82F6'),
                  borderRadius: `${getVal('radius', 12)}px`
                }}
              >
                Botón Principal
              </div>
              <div className="flex gap-2">
                <div 
                  className="flex-1 h-10 rounded-xl border border-slate-200"
                  style={{ backgroundColor: getVal('secondary_color', '#F1F5F9'), borderRadius: `${getVal('radius', 12) * 0.8}px` }}
                />
                <div 
                  className="flex-1 h-10 rounded-xl"
                  style={{ backgroundColor: getVal('accent_color', '#7C3AED'), borderRadius: `${getVal('radius', 12) * 0.8}px` }}
                />
              </div>
              <div className="pt-2">
                <p 
                  className="text-lg font-bold"
                  style={{ fontFamily: getVal('font_heading', 'Inter'), color: getVal('text_color', '#0F172A') }}
                >
                  Título de Ejemplo
                </p>
                <p 
                  className="text-xs text-slate-400 mt-1"
                  style={{ fontFamily: getVal('font_sans', 'Inter') }}
                >
                  Este es un ejemplo de cómo se verá el cuerpo de texto en tu sitio web.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 space-y-2">
            <h4 className="text-xs font-black text-primary uppercase tracking-widest">Tip Pro</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Los cambios que realices aquí se aplicarán automáticamente a todos los módulos que no tengan configuraciones manuales de color.
            </p>
          </div>
        </div>

        <div className="md:col-span-2 space-y-10">
          {sections.map((section) => (
            <section key={section.id} className="space-y-6">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 bg-white rounded-2xl border border-slate-100 flex items-center justify-center shadow-sm text-primary">
                  {section.icon}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{section.title}</h3>
                  <p className="text-xs text-slate-500">{section.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                {section.settings.map((setting) => (
                  <div key={setting.id} className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      {setting.label}
                    </label>
                    <SettingControl
                      setting={setting as any}
                      value={getVal(setting.id, setting.defaultValue)}
                      onChange={(val) => handleThemeChange(setting.id, val)}
                      projectId={projectId}
                    />
                    {setting.description && (
                      <p className="text-[10px] text-slate-400 font-medium italic mt-1">
                        {setting.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};
