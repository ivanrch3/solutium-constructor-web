import React from 'react';
import { useEditorStore } from '../../store/editorStore';
import { PropertyPillar } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Type, 
  Layout, 
  Palette, 
  Image as ImageIcon, 
  MousePointer2, 
  Layers,
  ChevronDown,
  ChevronRight,
  Settings as LucideSettings,
  HelpCircle,
  Hash
} from 'lucide-react';
import * as registryModules from './registry';

const PILLAR_ICONS: Record<string, React.ReactNode> = {
  contenido: <Type size={16} />,
  estructura: <Layout size={16} />,
  estilo: <Palette size={16} />,
  tipografia: <Type size={16} />,
  multimedia: <ImageIcon size={16} />,
  interaccion: <MousePointer2 size={16} />,
  // Mapeo para pilares en inglés (types.ts) a español (registry.tsx)
  content: <Type size={16} />,
  structure: <Layout size={16} />,
  style: <Palette size={16} />,
  typography: <Type size={16} />,
  multimedia_pillar: <ImageIcon size={16} />,
  interaction: <MousePointer2 size={16} />
};

const PILLAR_LABELS: Record<string, string> = {
  contenido: 'Contenido',
  estructura: 'Estructura',
  estilo: 'Estilo',
  tipografia: 'Tipografía',
  multimedia: 'Multimedia',
  interaccion: 'Interacción'
};

const PILLARS_ORDER: string[] = ['contenido', 'estructura', 'estilo', 'tipografia', 'multimedia', 'interaccion'];

export const PropertyEditor: React.FC = () => {
  const { 
    siteContent, 
    selectedSectionId, 
    updateSectionSettings 
  } = useEditorStore();
  
  const [expandedPillars, setExpandedPillars] = React.useState<Record<string, boolean>>({
    contenido: true,
    estructura: false,
    estilo: false,
    tipografia: false,
    multimedia: false,
    interaccion: false
  });

  const selectedSection = siteContent.sections.find(s => s.id === selectedSectionId);
  
  if (!selectedSection) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-400 bg-white">
        <Layers className="mb-4 opacity-10" size={64} />
        <p className="text-sm font-medium">Selecciona un módulo en el canvas para editar sus propiedades</p>
      </div>
    );
  }

  // Encontrar la definición del módulo en el registro
  const moduleDef = Object.values(registryModules).find(m => {
    // El ID real en el store puede tener un sufijo de timestamp. Buscamos el prefijo.
    if ('id' in m) {
      return selectedSection.id.startsWith((m as any).id);
    }
    return false;
  }) as any;

  if (!moduleDef) {
    return <div className="p-4 text-xs text-amber-600 bg-amber-50">Definición de módulo no encontrada</div>;
  }

  // Agrupar todos los settings por Pilar
  const settingsByPillar: Record<string, { label: string, setting: any, contextId: string }[]> = {};

  // 1. Settings Globales del Módulo
  if (moduleDef.globalSettings) {
    Object.entries(moduleDef.globalSettings).forEach(([pillar, settings]) => {
      if (!settingsByPillar[pillar]) settingsByPillar[pillar] = [];
      (settings as any[]).forEach(s => {
        settingsByPillar[pillar].push({
          label: s.label,
          setting: s,
          contextId: `${selectedSection.id}_global`
        });
      });
    });
  }

  // 2. Settings de los Elementos del Módulo
  moduleDef.elements.forEach((element: any) => {
    if (element.settings) {
      Object.entries(element.settings).forEach(([pillar, settings]) => {
        // Mapeo de nombres de pilares extendidos (ej: title, subtitle) a los 6 pilares base
        let targetPillar = pillar;
        if (pillar === 'title' || pillar === 'subtitle' || pillar === 'eyebrow' || pillar === 'texto_rotativo') targetPillar = 'contenido';
        
        if (!settingsByPillar[targetPillar]) settingsByPillar[targetPillar] = [];
        (settings as any[]).forEach(s => {
          settingsByPillar[targetPillar].push({
            label: `${element.name}: ${s.label}`,
            setting: s,
            contextId: `${selectedSection.id}_${element.id}`
          });
        });
      });
    }
  });

  const togglePillar = (pillar: string) => {
    setExpandedPillars(prev => ({ ...prev, [pillar]: !prev[pillar] }));
  };

  const handleFieldChange = (contextId: string, settingId: string, value: any) => {
    // El store maneja settings planos. La clave completa es={`${contextId}_${settingId}`}
    updateSectionSettings(selectedSection.id, { [`${contextId}_${settingId}`]: value });
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-100 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center text-white">
            <CustomSettingsIcon size={14} />
          </div>
          {selectedSection.name}
        </h3>
        <div className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-mono text-gray-500 uppercase">
          {moduleDef.type}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {PILLARS_ORDER.map(pillar => {
          const fields = settingsByPillar[pillar];
          if (!fields || fields.length === 0) return null;

          const isExpanded = expandedPillars[pillar];

          return (
            <div key={pillar} className="border-b border-gray-50 last:border-none">
              <button
                onClick={() => togglePillar(pillar)}
                className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-3 text-sm font-semibold text-gray-700">
                  <span className={`transition-colors ${isExpanded ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                    {PILLAR_ICONS[pillar]}
                  </span>
                  {PILLAR_LABELS[pillar]}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded-full text-gray-400 font-bold">
                    {fields.length}
                  </span>
                  {isExpanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-5 space-y-5">
                      {fields.map(({ label, setting, contextId }) => {
                        const value = selectedSection.settings[`${contextId}_${setting.id}`] ?? setting.defaultValue;
                        
                        return (
                          <div key={`${contextId}_${setting.id}`} className="space-y-2">
                            <div className="flex items-center justify-between group/label">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                {label}
                                {setting.description && (
                                  <div className="relative group/desc">
                                    <HelpCircle size={10} className="text-gray-300 hover:text-blue-500 cursor-help" />
                                    <div className="absolute left-0 bottom-full mb-1 w-48 p-2 bg-gray-900 text-white text-[10px] rounded shadow-xl hidden group-hover/desc:block z-50 normal-case tracking-normal">
                                      {setting.description}
                                    </div>
                                  </div>
                                )}
                              </label>
                            </div>

                            {/* Renderizado de Controles basado en el tipo del setting */}
                            {setting.type === 'text' && (
                              <textarea
                                value={value}
                                onChange={(e) => handleFieldChange(contextId, setting.id, e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all min-h-[40px] resize-y"
                                rows={value?.length > 40 ? 3 : 1}
                              />
                            )}

                            {(setting.type === 'color') && (
                              <div className="space-y-3">
                                {/* Sugerencias de Colores Heredados */}
                                {useEditorStore.getState().project?.brandColors && (
                                  <div className="flex flex-wrap gap-1.5 px-0.5">
                                    {Object.entries(useEditorStore.getState().project.brandColors).map(([name, color]: [string, any]) => (
                                      <button
                                        key={name}
                                        onClick={() => handleFieldChange(contextId, setting.id, color)}
                                        className="relative group/swatch"
                                        title={`${name}: ${color}`}
                                      >
                                        <div 
                                          className="w-6 h-6 rounded-md border border-gray-200 shadow-sm transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                                          style={{ backgroundColor: color }}
                                        />
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-gray-900 text-white text-[9px] rounded hidden group-hover/swatch:block z-50 whitespace-nowrap">
                                          {name}
                                        </div>
                                      </button>
                                    ))}
                                    <div className="w-px h-6 bg-gray-100 mx-1" />
                                    {/* Otros colores comunes */}
                                    {['#FFFFFF', '#000000', '#F1F5F9', '#94A3B8'].map(c => (
                                      <button
                                        key={c}
                                        onClick={() => handleFieldChange(contextId, setting.id, c)}
                                        className="w-6 h-6 rounded-md border border-gray-200 shadow-sm hover:scale-110 transition-transform cursor-pointer"
                                        style={{ backgroundColor: c }}
                                      />
                                    ))}
                                  </div>
                                )}
                                
                                <div className="flex items-center gap-2">
                                  <div className="relative w-10 h-10 shrink-0 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                                    <input
                                      type="color"
                                      value={value}
                                      onChange={(e) => handleFieldChange(contextId, setting.id, e.target.value)}
                                      className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer border-none p-0"
                                    />
                                  </div>
                                  <div className="flex-1 flex items-center bg-gray-50 rounded-lg border border-gray-100 px-3 py-2">
                                    <Hash size={12} className="text-gray-400 mr-1" />
                                    <input
                                      type="text"
                                      value={value?.toUpperCase()}
                                      onChange={(e) => handleFieldChange(contextId, setting.id, e.target.value)}
                                      className="w-full bg-transparent text-xs font-mono font-bold text-gray-700 outline-none"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {setting.type === 'range' && (
                              <div className="space-y-3 pt-1">
                                <input
                                  type="range"
                                  min={setting.min ?? 0}
                                  max={setting.max ?? 100}
                                  step={setting.step ?? 1}
                                  value={value}
                                  onChange={(e) => handleFieldChange(contextId, setting.id, parseInt(e.target.value))}
                                  className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                                />
                                <div className="flex justify-between items-center px-1">
                                  <span className="text-[10px] text-gray-400 font-medium">
                                    {(setting.min ?? 0)}{setting.unit}
                                  </span>
                                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold">
                                    {value}{setting.unit}
                                  </span>
                                  <span className="text-[10px] text-gray-400 font-medium">
                                    {(setting.max ?? 100)}{setting.unit}
                                  </span>
                                </div>
                              </div>
                            )}

                            {setting.type === 'boolean' && (
                              <button
                                onClick={() => handleFieldChange(contextId, setting.id, !value)}
                                className={`w-full group flex items-center justify-between p-3 rounded-xl border transition-all ${
                                  value 
                                    ? 'bg-blue-50/50 border-blue-200 shadow-sm' 
                                    : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'
                                }`}
                              >
                                <span className={`text-xs font-semibold ${value ? 'text-blue-700' : 'text-gray-500'}`}>
                                  {value ? 'Activado' : 'Desactivado'}
                                </span>
                                <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${value ? 'bg-blue-600' : 'bg-gray-200'}`}>
                                  <motion.div 
                                    animate={{ x: value ? 20 : 2 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm" 
                                  />
                                </div>
                              </button>
                            )}

                            {setting.type === 'select' && (
                              <div className="relative">
                                <select
                                  value={value}
                                  onChange={(e) => handleFieldChange(contextId, setting.id, e.target.value)}
                                  className="w-full px-3 py-2 text-xs font-medium border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none appearance-none cursor-pointer"
                                >
                                  {setting.options?.map((opt: any) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                              </div>
                            )}

                            {/* Otros tipos de controles se añadirán según necesidad */}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-gray-100 bg-gray-50/30">
        <p className="text-[10px] text-gray-400 text-center leading-relaxed">
         Protocolo Solutium 6 Pilares v4.0<br/>
         Diseño Granular y Alta Fidelidad
        </p>
      </div>
    </div>
  );
};

const CustomSettingsIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
