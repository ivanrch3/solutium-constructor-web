import React from 'react';
import * as LucideIcons from 'lucide-react';
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
import { SettingControl } from './SettingControl';

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
    updateSectionSettings,
    selectedBentoCellIndex,
    setSelectedBentoCellIndex
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

  const isBento = selectedSection.id.startsWith('mod_bento');
  const isCellSelected = isBento && selectedBentoCellIndex !== null;

  // 1. Settings Globales del Módulo (Hiding if a cell is selected in Bento)
  if (moduleDef.globalSettings && (!isBento || !isCellSelected)) {
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
    // Si es Bento y hay una celda seleccionada, solo mostramos los settings de 'el_bento_items' para esa celda
    if (isBento && isCellSelected) {
      if (element.id === 'el_bento_items' && element.settings) {
        Object.entries(element.settings).forEach(([pillar, settings]) => {
          let targetPillar = pillar;
          if (pillar === 'title' || pillar === 'subtitle' || pillar === 'eyebrow') targetPillar = 'contenido';
          if (!settingsByPillar[targetPillar]) settingsByPillar[targetPillar] = [];
          
          (settings as any[]).forEach(s => {
            settingsByPillar[targetPillar].push({
              label: s.label,
              setting: s,
              contextId: `${selectedSection.id}_${element.id}_${selectedBentoCellIndex}`
            });
          });
        });
      }
      return; // Skip other elements if cell is selected
    }

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
    console.log('[PROPERTY_EDITOR_CHANGE_DEBUG]', { contextId, settingId, value });
    // Si estamos editando una celda de un repeater (ej: Bento), necesitamos actualizar el array de items
    if (contextId.includes('_el_bento_items_')) {
      const [sectionId, elementId, indexStr] = contextId.split('_el_bento_items_');
      const realSectionId = sectionId.startsWith('mod_bento') ? sectionId : selectedSection.id;
      const index = parseInt(indexStr);
      
      const repeaterKey = `${realSectionId}_el_bento_items_items`;
      const currentItems = selectedSection.settings[repeaterKey] || [];
      const newItems = [...currentItems];
      if (newItems[index]) {
        newItems[index] = { ...newItems[index], [settingId]: value };
        updateSectionSettings(selectedSection.id, { [repeaterKey]: newItems });
      }
      return;
    }

    // El store maneja settings planos. La clave completa es={`${contextId}_${settingId}`}
    updateSectionSettings(selectedSection.id, { [`${contextId}_${settingId}`]: value });
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-100 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center text-white">
              <CustomSettingsIcon size={14} />
            </div>
            {isCellSelected ? 'Editar Celda' : selectedSection.name}
          </h3>
          <div className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-mono text-gray-500 uppercase">
            {isCellSelected ? `Item #${selectedBentoCellIndex + 1}` : moduleDef.type}
          </div>
        </div>
        
        {isCellSelected && (
          <button 
            onClick={() => setSelectedBentoCellIndex(null)}
            className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-2 py-1 rounded w-fit"
          >
            <LucideIcons.ArrowLeft size={10} />
            Volver a Configuración Global
          </button>
        )}
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
                        const defaultValue = setting.defaultValue;
                        const value = selectedSection.settings[`${contextId}_${setting.id}`] ?? defaultValue;
                        
                        if (setting.id === 'social_links' && selectedSection.type === 'footer') {
                          console.log('[FOOTER_PROPERTY_EDITOR_SOCIAL_STATE_DEBUG]', {
                            moduleId: selectedSection.id,
                            fieldKey: `${contextId}_${setting.id}`,
                            rawEditorValue: selectedSection.settings[`${contextId}_${setting.id}`],
                            plainEditorValue: value,
                            itemsCount: Array.isArray(value) ? value.length : 0,
                            items: value
                          });
                        }

                        // Get project data from store for SettingControl
                        const project = useEditorStore.getState().project;
                        const brandColors = project?.brandColors ? Object.values(project.brandColors).filter(c => typeof c === 'string') as string[] : [];

                        return (
                          <div key={`${contextId}_${setting.id}`} className="space-y-1">
                            <SettingControl 
                              setting={{ ...setting, label }} // Forward label to SettingControl
                              value={value}
                              onChange={(val) => handleFieldChange(contextId, setting.id, val)}
                              projectId={project?.id || null}
                              products={project?.products || []}
                              customers={project?.customers || []}
                              projectColors={brandColors}
                            />
                            {setting.description && (
                              <p className="text-[10px] text-gray-400 mt-1 italic pl-1">{setting.description}</p>
                            )}
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
