import { logDebug } from '../../utils/debug';
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
import {
  CompositionElement,
  COMPOSITION_SCHEMA_DEEP_KEY,
  CompositionElementType,
  CompositionSectionSchema
} from '../../types/compositionSchema';
import { validateCompositionSchema } from '../../utils/compositionSchemaValidator';
import {
  addCompositionElement,
  deleteCompositionElement,
  duplicateCompositionElement,
  findCompositionElement,
  getCompositionElementLabel,
  getCompositionSchemaKey,
  humanizeCompositionType,
  resolveCompositionSchema,
  stringifyCompositionSchema,
  updateCompositionElement
} from '../../utils/compositionEditorUtils';
import {
  cloneCompositionPresetSchema,
  COMPOSITION_PRESETS,
  CompositionPresetId
} from './modules/compositionPresets';

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
const COMPOSITION_ADDABLE_TYPES: CompositionElementType[] = [
  'heading',
  'paragraph',
  'button',
  'image',
  'card',
  'container',
  'badge',
  'list',
  'divider'
];

interface PropertyEditorProps {
  settingsValues?: Record<string, any>;
  onSettingChange?: (elementOrModuleId: string, settingId: string, value: any) => void;
}

export const PropertyEditor: React.FC<PropertyEditorProps> = ({
  settingsValues,
  onSettingChange
}) => {
  const { 
    siteContent, 
    selectedSectionId, 
    updateSectionSettings,
    selectedBentoCellIndex,
    setSelectedBentoCellIndex,
    selectedCompositionElementId,
    setSelectedCompositionElementId,
    project
  } = useEditorStore();
  
  const [expandedPillars, setExpandedPillars] = React.useState<Record<string, boolean>>({
    contenido: true,
    estructura: false,
    estilo: false,
    tipografia: false,
    multimedia: false,
    interaccion: false
  });
  const [expandedSubsections, setExpandedSubsections] = React.useState<Record<string, boolean>>({});
  const [compositionJsonDraft, setCompositionJsonDraft] = React.useState('');
  const [compositionJsonError, setCompositionJsonError] = React.useState<string | null>(null);
  const [selectedCompositionPresetId, setSelectedCompositionPresetId] = React.useState<CompositionPresetId>('hero_visual_premium');
  const [pendingCompositionPresetId, setPendingCompositionPresetId] = React.useState<CompositionPresetId | null>(null);

  const selectedSection = siteContent.sections.find(s => s.id === selectedSectionId);
  const isCompositionSection = selectedSection?.type === 'composition_section';
  const compositionSettingsValues = settingsValues || selectedSection?.settings;
  const compositionSchema = React.useMemo(
    () => selectedSection && isCompositionSection
      ? resolveCompositionSchema(selectedSection.id, compositionSettingsValues, selectedSection.content)
      : null,
    [compositionSettingsValues, isCompositionSection, selectedSection]
  );
  const selectedCompositionElement = React.useMemo(
    () => compositionSchema ? findCompositionElement(compositionSchema, selectedCompositionElementId) : null,
    [compositionSchema, selectedCompositionElementId]
  );
  const compositionSchemaText = React.useMemo(
    () => compositionSchema ? stringifyCompositionSchema(compositionSchema) : '',
    [compositionSchema]
  );

  React.useEffect(() => {
    if (!selectedSection || !isCompositionSection) {
      if (selectedCompositionElementId) setSelectedCompositionElementId(null);
      return;
    }

    if (selectedCompositionElementId && !selectedCompositionElement) {
      setSelectedCompositionElementId(null);
    }
  }, [
    isCompositionSection,
    selectedCompositionElement,
    selectedCompositionElementId,
    selectedSection,
    setSelectedCompositionElementId
  ]);

  React.useEffect(() => {
    setCompositionJsonDraft(compositionSchemaText);
    setCompositionJsonError(null);
  }, [compositionSchemaText]);
  const projectColors = Array.from(new Set([
    project?.brandColors?.primary,
    project?.brandColors?.secondary,
    project?.brandColors?.accent,
  ].filter((color): color is string => typeof color === 'string' && color.trim().length > 0)));
  
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
      return selectedSection.id.startsWith((m as any).id) || selectedSection.type === (m as any).type;
    }
    return false;
  }) as any;

  if (!moduleDef) {
    return <div className="p-4 text-xs text-amber-600 bg-amber-50">Definición de módulo no encontrada</div>;
  }

  const updateCompositionSchema = (schema: CompositionSectionSchema) => {
    const normalizedSchema = validateCompositionSchema(schema);
    const schemaJson = stringifyCompositionSchema(normalizedSchema);

    if (onSettingChange) {
      onSettingChange(selectedSection.id, COMPOSITION_SCHEMA_DEEP_KEY, schemaJson);
      return;
    }

    updateSectionSettings(selectedSection.id, {
      [getCompositionSchemaKey(selectedSection.id)]: schemaJson
    });
  };

  const updateSelectedCompositionElement = (
    updater: (element: CompositionElement) => CompositionElement
  ) => {
    if (!compositionSchema || !selectedCompositionElementId) return;
    updateCompositionSchema(updateCompositionElement(compositionSchema, selectedCompositionElementId, updater));
  };

  const updateCompositionContent = (updates: Record<string, any>) => {
    updateSelectedCompositionElement((element) => ({
      ...element,
      content: {
        ...(element.content || {}),
        ...updates
      }
    }));
  };

  const updateCompositionStyle = (updates: Record<string, any>) => {
    updateSelectedCompositionElement((element) => ({
      ...element,
      style: {
        ...(element.style || {}),
        ...updates
      }
    }));
  };

  const duplicateSelectedCompositionElement = () => {
    if (!compositionSchema || !selectedCompositionElementId) return;
    const result = duplicateCompositionElement(compositionSchema, selectedCompositionElementId);
    updateCompositionSchema(result.schema);
    setSelectedCompositionElementId(result.selectedElementId);
  };

  const deleteSelectedCompositionElement = () => {
    if (!compositionSchema || !selectedCompositionElementId) return;
    const result = deleteCompositionElement(compositionSchema, selectedCompositionElementId);
    updateCompositionSchema(result.schema);
    setSelectedCompositionElementId(result.selectedElementId);
  };

  const addCompositionElementFromEditor = (type: CompositionElementType) => {
    if (!compositionSchema) return;
    const canNestInSelected = selectedCompositionElement && ['card', 'container'].includes(selectedCompositionElement.type);
    const result = addCompositionElement(
      compositionSchema,
      type,
      canNestInSelected ? selectedCompositionElement.id : null
    );
    updateCompositionSchema(result.schema);
    setSelectedCompositionElementId(result.selectedElementId);
  };

  const updateCompositionPadding = (padding: number) => {
    updateSelectedCompositionElement((element) => ({
      ...element,
      layout: {
        ...(element.layout || {}),
        desktop: { ...(element.layout?.desktop || {}), padding },
        tablet: { ...(element.layout?.tablet || {}), padding },
        mobile: { ...(element.layout?.mobile || {}), padding }
      }
    }));
  };

  const applyCompositionJson = () => {
    try {
      const parsed = JSON.parse(compositionJsonDraft);
      const normalizedSchema = validateCompositionSchema(parsed);
      updateCompositionSchema(normalizedSchema);
      if (
        selectedCompositionElementId &&
        !normalizedSchema.elements.some((element) => element.id === selectedCompositionElementId)
      ) {
        setSelectedCompositionElementId(null);
      }
      setCompositionJsonDraft(stringifyCompositionSchema(normalizedSchema));
      setCompositionJsonError(null);
    } catch (error) {
      setCompositionJsonError(error instanceof Error ? error.message : 'JSON inválido');
    }
  };

  const applyCompositionPreset = () => {
    if (!compositionSchema) return;

    if (pendingCompositionPresetId !== selectedCompositionPresetId) {
      setPendingCompositionPresetId(selectedCompositionPresetId);
      return;
    }

    const nextSchema = cloneCompositionPresetSchema(selectedCompositionPresetId);
    updateCompositionSchema(nextSchema);
    setSelectedCompositionElementId(null);
    setCompositionJsonDraft(stringifyCompositionSchema(nextSchema));
    setCompositionJsonError(null);
    setPendingCompositionPresetId(null);
  };

  const renderInput = (
    label: string,
    value: string | number | undefined,
    onChange: (value: string) => void,
    type: 'text' | 'number' | 'color' | 'url' = 'text'
  ) => (
    <label className="space-y-1 block">
      <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">{label}</span>
      <input
        type={type === 'url' ? 'text' : type}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );

  const renderTextarea = (label: string, value: string, onChange: (value: string) => void, rows = 4) => (
    <label className="space-y-1 block">
      <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">{label}</span>
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );

  const renderSelect = (
    label: string,
    value: string | number | undefined,
    options: Array<{ label: string; value: string | number }>,
    onChange: (value: string) => void
  ) => (
    <label className="space-y-1 block">
      <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">{label}</span>
      <select
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );

  if (isCompositionSection && selectedCompositionElement && compositionSchema) {
    const element = selectedCompositionElement;
    const listText = (element.content?.items || []).map((item) => item.text).join('\n');
    const currentPadding =
      element.layout?.desktop?.padding ??
      element.layout?.tablet?.padding ??
      element.layout?.mobile?.padding ??
      '';

    return (
      <div className="flex flex-col h-full bg-white border-l border-gray-100 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center text-white">
                <CustomSettingsIcon size={14} />
              </div>
              {getCompositionElementLabel(element)}
            </h3>
            <div className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-mono text-gray-500 uppercase">
              {humanizeCompositionType(element.type)}
            </div>
          </div>
          <button
            onClick={() => setSelectedCompositionElementId(null)}
            className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-2 py-1 rounded w-fit"
          >
            <LucideIcons.ArrowLeft size={10} />
            Volver a configuración del módulo
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-5">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 space-y-4">
            <p className="text-[11px] font-black uppercase tracking-wider text-blue-700">Gestión del elemento</p>
            {renderInput('Nombre en estructura', element.name ?? '', (value) => {
              updateSelectedCompositionElement((current) => ({ ...current, name: value }));
            })}
            <label className="flex items-center justify-between gap-3 rounded-xl border border-blue-100 bg-white px-3 py-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Visible</span>
              <input
                type="checkbox"
                checked={
                  element.visibility?.desktop !== false ||
                  element.visibility?.tablet !== false ||
                  element.visibility?.mobile !== false
                }
                onChange={(event) => {
                  const visible = event.target.checked;
                  updateSelectedCompositionElement((current) => ({
                    ...current,
                    visibility: { desktop: visible, tablet: visible, mobile: visible }
                  }));
                }}
                className="h-4 w-4 accent-blue-600"
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={duplicateSelectedCompositionElement}
                className="rounded-xl border border-blue-100 bg-white px-3 py-2 text-[11px] font-black text-blue-700 hover:bg-blue-50 transition-colors"
              >
                Duplicar
              </button>
              <button
                type="button"
                onClick={deleteSelectedCompositionElement}
                className="rounded-xl border border-rose-100 bg-white px-3 py-2 text-[11px] font-black text-rose-600 hover:bg-rose-50 transition-colors"
              >
                Eliminar
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Agregar {['card', 'container'].includes(element.type) ? 'dentro del contenedor' : 'a la raíz'}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {COMPOSITION_ADDABLE_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => addCompositionElementFromEditor(type)}
                    className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-[10px] font-bold text-gray-600 hover:border-blue-200 hover:text-blue-700 transition-colors"
                  >
                    {humanizeCompositionType(type)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 space-y-4">
            <p className="text-[11px] font-black uppercase tracking-wider text-gray-700">Contenido</p>
            {element.type === 'heading' && (
              <>
                {renderTextarea('Texto', element.content?.text ?? '', (value) => updateCompositionContent({ text: value }), 3)}
                {renderSelect('Nivel', element.content?.level ?? 2, [1, 2, 3, 4, 5, 6].map((level) => ({ label: `H${level}`, value: level })), (value) => updateCompositionContent({ level: Number(value) }))}
              </>
            )}
            {element.type === 'paragraph' && renderTextarea('Texto', element.content?.text ?? '', (value) => updateCompositionContent({ text: value }), 5)}
            {element.type === 'button' && (
              <>
                {renderInput('Label', element.content?.label ?? '', (value) => updateCompositionContent({ label: value }))}
                {renderInput('Href', element.content?.href ?? '', (value) => {
                  updateSelectedCompositionElement((current) => ({
                    ...current,
                    content: { ...(current.content || {}), href: value },
                    actions: [{ type: 'link', target: value }]
                  }));
                }, 'url')}
              </>
            )}
            {element.type === 'image' && (
              <>
                {renderInput('Src', element.content?.src ?? '', (value) => updateCompositionContent({ src: value }), 'url')}
                {renderInput('Alt', element.content?.alt ?? '', (value) => updateCompositionContent({ alt: value }))}
              </>
            )}
            {element.type === 'badge' && renderInput('Texto', element.content?.text ?? '', (value) => updateCompositionContent({ text: value }))}
            {element.type === 'list' && renderTextarea('Items', listText, (value) => updateCompositionContent({
              items: value.split('\n').map((text, index) => ({
                id: element.content?.items?.[index]?.id || `${element.id}_item_${index + 1}`,
                text
              }))
            }), 6)}
            {['card', 'container', 'divider'].includes(element.type) && (
              <p className="text-xs text-gray-400">Este elemento no tiene contenido textual directo en esta fase.</p>
            )}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 space-y-4">
            <p className="text-[11px] font-black uppercase tracking-wider text-gray-700">Estilo</p>
            {element.type !== 'divider' && renderInput('Color', element.style?.color || '', (value) => updateCompositionStyle({ color: value }))}
            {['button', 'badge', 'card', 'container'].includes(element.type) && renderInput('Background', element.style?.background || '', (value) => updateCompositionStyle({ background: value }))}
            {['button', 'badge', 'card', 'container', 'image'].includes(element.type) && renderInput('Radius', element.style?.radius ?? '', (value) => updateCompositionStyle({ radius: Number(value) || 0 }), 'number')}
            {['heading', 'paragraph', 'button', 'badge', 'list'].includes(element.type) && (
              <>
                {renderInput('Font size', element.style?.fontSize ?? '', (value) => updateCompositionStyle({ fontSize: Number(value) || undefined }), 'number')}
                {renderInput('Font weight', element.style?.fontWeight ?? '', (value) => updateCompositionStyle({ fontWeight: Number(value) || undefined }), 'number')}
                {renderInput('Line height', element.style?.lineHeight ?? '', (value) => updateCompositionStyle({ lineHeight: Number(value) || undefined }), 'number')}
              </>
            )}
            {element.type === 'image' && renderSelect('Object fit', element.style?.objectFit || 'cover', [
              { label: 'Cover', value: 'cover' },
              { label: 'Contain', value: 'contain' },
              { label: 'Fill', value: 'fill' }
            ], (value) => updateCompositionStyle({ objectFit: value }))}
            {['card', 'container'].includes(element.type) && (
              <>
                {renderInput('Padding', currentPadding, (value) => updateCompositionPadding(Number(value) || 0), 'number')}
                {renderInput('Border color', element.style?.borderColor || '', (value) => updateCompositionStyle({ borderColor: value }))}
                {renderSelect('Shadow', element.style?.shadow || 'none', [
                  { label: 'None', value: 'none' },
                  { label: 'SM', value: 'sm' },
                  { label: 'MD', value: 'md' },
                  { label: 'LG', value: 'lg' },
                  { label: 'XL', value: 'xl' }
                ], (value) => updateCompositionStyle({ shadow: value }))}
              </>
            )}
            {element.type === 'divider' && (
              <>
                {renderInput('Color', element.style?.borderColor || element.style?.color || '', (value) => updateCompositionStyle({ borderColor: value, color: value }))}
                {renderInput('Border width', element.style?.borderWidth ?? 1, (value) => updateCompositionStyle({ borderWidth: Number(value) || 1 }), 'number')}
              </>
            )}
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 space-y-3">
            <p className="text-[11px] font-black uppercase tracking-wider text-amber-700">Avanzado · Schema JSON</p>
            <textarea
              rows={10}
              value={compositionJsonDraft}
              onChange={(event) => setCompositionJsonDraft(event.target.value)}
              className="w-full rounded-xl border border-amber-100 bg-white px-3 py-2 text-[11px] font-mono text-gray-700 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
            />
            {compositionJsonError && <p className="text-[10px] font-bold text-rose-500">{compositionJsonError}</p>}
            <button
              onClick={applyCompositionJson}
              className="w-full rounded-xl bg-amber-500 px-3 py-2 text-xs font-black text-white hover:bg-amber-600 transition-colors"
            >
              Aplicar JSON
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isCompositionSection && compositionSchema) {
    const selectedPreset = COMPOSITION_PRESETS.find((preset) => preset.id === selectedCompositionPresetId) || COMPOSITION_PRESETS[0];

    return (
      <div className="flex flex-col h-full bg-white border-l border-gray-100 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center text-white">
                <CustomSettingsIcon size={14} />
              </div>
              {selectedSection.name}
            </h3>
            <div className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-mono text-gray-500 uppercase">
              composition_section
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-5">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 space-y-4">
            <div className="space-y-1">
              <p className="text-[11px] font-black uppercase tracking-wider text-blue-700">Preset de composición</p>
              <p className="text-xs text-blue-700/70">
                Elige una base premium. Aplicar un preset reemplaza la composición actual y conserva edición interna por elementos.
              </p>
            </div>

            {renderSelect(
              'Biblioteca',
              selectedCompositionPresetId,
              COMPOSITION_PRESETS.map((preset) => ({ label: preset.label, value: preset.id })),
              (value) => {
                setSelectedCompositionPresetId(value as CompositionPresetId);
                setPendingCompositionPresetId(null);
              }
            )}

            <div className="rounded-xl border border-blue-100 bg-white px-3 py-2">
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">Descripción</p>
              <p className="mt-1 text-xs text-gray-600 leading-relaxed">{selectedPreset.description}</p>
            </div>

            <button
              type="button"
              onClick={applyCompositionPreset}
              className={`w-full rounded-xl px-3 py-2 text-xs font-black text-white transition-colors ${
                pendingCompositionPresetId === selectedCompositionPresetId
                  ? 'bg-amber-500 hover:bg-amber-600'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {pendingCompositionPresetId === selectedCompositionPresetId ? 'Confirmar reemplazo' : 'Aplicar preset'}
            </button>
            {pendingCompositionPresetId === selectedCompositionPresetId && (
              <p className="text-[10px] font-bold text-amber-700">
                Este preset reemplazará la composición actual. Presiona confirmar para continuar.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 space-y-3">
            <p className="text-[11px] font-black uppercase tracking-wider text-gray-700">Gestión de elementos</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Selecciona un elemento desde el Canvas o desde Estructura para editar textos, botones, cards, visibilidad y orden.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {COMPOSITION_ADDABLE_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => addCompositionElementFromEditor(type)}
                  className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-[10px] font-bold text-gray-600 hover:border-blue-200 hover:text-blue-700 transition-colors"
                >
                  {humanizeCompositionType(type)}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 space-y-3">
            <p className="text-[11px] font-black uppercase tracking-wider text-amber-700">Avanzado · Schema JSON</p>
            <textarea
              rows={14}
              value={compositionJsonDraft}
              onChange={(event) => setCompositionJsonDraft(event.target.value)}
              className="w-full rounded-xl border border-amber-100 bg-white px-3 py-2 text-[11px] font-mono text-gray-700 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
            />
            {compositionJsonError && <p className="text-[10px] font-bold text-rose-500">{compositionJsonError}</p>}
            <button
              onClick={applyCompositionJson}
              className="w-full rounded-xl bg-amber-500 px-3 py-2 text-xs font-black text-white hover:bg-amber-600 transition-colors"
            >
              Aplicar JSON
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getBentoItems = () => {
    const sectionId = selectedSection.id;
    const repeaterKey = `${sectionId}_el_bento_items_items`;
    const sources = [
      settingsValues?.[repeaterKey],
      selectedSection.settings?.[repeaterKey],
      selectedSection.content?.items,
      selectedSection.content?.blocks,
      selectedSection.content?.cells,
      selectedSection.content?.data?.items,
      selectedSection.content?.data?.blocks
    ];

    return sources.find(Array.isArray) || [];
  };

  const getSelectedBentoItem = () => {
    if (selectedBentoCellIndex === null) return null;
    const items = getBentoItems();
    return items[selectedBentoCellIndex] || null;
  };

  // Agrupar todos los settings por Pilar
  const settingsByPillar: Record<string, { label: string, setting: any, contextId: string }[]> = {};

  const isBento = selectedSection.type === 'bento'
    || selectedSection.templateId === 'mod_bento_1'
    || selectedSection.id.startsWith('mod_bento_1');
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
            const cellSettings = s.type === 'repeater' && Array.isArray(s.fields) ? s.fields : [s];
            cellSettings.forEach((field: any) => {
              settingsByPillar[targetPillar].push({
                label: field.label,
                setting: field,
                contextId: `${selectedSection.id}_${element.id}_${selectedBentoCellIndex}`
              });
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

  const toggleSubsection = (subsectionKey: string) => {
    setExpandedSubsections(prev => ({ ...prev, [subsectionKey]: !prev[subsectionKey] }));
  };

  const evaluateCondition = (condition: any, currentSettings: Record<string, any>, contextId: string) => {
    if (!condition) return { result: true };

    let val = currentSettings[`${contextId}_${condition.settingId}`];
    if (val === undefined) {
      const modulePrefix = contextId.split('_').slice(0, 3).join('_') + '_global';
      val = currentSettings[`${modulePrefix}_${condition.settingId}`];
    }

    const op = condition.operator || 'eq';
    let result = false;

    switch (op) {
      case 'eq':
        result = Array.isArray(condition.value) ? condition.value.includes(val) : val === condition.value;
        break;
      case 'neq':
        result = Array.isArray(condition.value) ? !condition.value.includes(val) : val !== condition.value;
        break;
      case 'includes':
        result = Array.isArray(val) ? val.includes(condition.value) : Array.isArray(condition.value) ? condition.value.includes(val) : false;
        break;
      case 'not_includes':
        result = Array.isArray(val) ? !val.includes(condition.value) : Array.isArray(condition.value) ? !condition.value.includes(val) : true;
        break;
    }

    return { result, message: condition.message };
  };

  const handleFieldChange = (contextId: string, settingId: string, value: any, extraUpdates?: Record<string, any>) => {
    logDebug('[PROPERTY_EDITOR_CHANGE_DEBUG]', { contextId, settingId, value, extraUpdates });
    // Si estamos editando una celda de un repeater (ej: Bento), necesitamos actualizar el array de items
    if (contextId.includes('_el_bento_items_')) {
      const [sectionId, , indexStr] = contextId.split('_el_bento_items_');
      const realSectionId = sectionId || selectedSection.id;
      const index = parseInt(indexStr);
      
      const repeaterKey = `${realSectionId}_el_bento_items_items`;
      const currentItems = getBentoItems();
      const newItems = [...currentItems];
      if (newItems[index]) {
        newItems[index] = { ...newItems[index], [settingId]: value };
        if (onSettingChange) {
          onSettingChange(`${realSectionId}_el_bento_items`, 'items', newItems);
        } else {
          updateSectionSettings(selectedSection.id, { [repeaterKey]: newItems });
        }
      }
      return;
    }

    // El store maneja settings planos. La clave completa es={`${contextId}_${settingId}`}
    let updates: Record<string, any> = { [`${contextId}_${settingId}`]: value };
    
    // Support for multiple updates at once (e.g. selection + touched flag)
    if (extraUpdates) {
      updates = { ...updates, ...extraUpdates };
    }
    
    updateSectionSettings(selectedSection.id, updates);
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
                      {Object.entries(
                        fields.reduce((acc, field) => {
                          const subsection = field.setting.subsection || '__default__';
                          if (!acc[subsection]) acc[subsection] = [];
                          acc[subsection].push(field);
                          return acc;
                        }, {} as Record<string, typeof fields>)
                      ).map(([subsection, subsectionFields]) => {
                        const renderField = ({ label, setting, contextId }: typeof subsectionFields[number]) => {
                          const bentoItem = isCellSelected && contextId.includes('_el_bento_items_') ? getSelectedBentoItem() : null;
                          const conditionSettings = bentoItem
                            ? {
                              ...selectedSection.settings,
                              ...Object.fromEntries(Object.entries(bentoItem).map(([key, itemValue]) => [`${contextId}_${key}`, itemValue]))
                            }
                            : selectedSection.settings;
                          const show = evaluateCondition(setting.showIf, conditionSettings, contextId);
                          if (!show.result) return null;

                          const defaultValue = setting.defaultValue;
                          const value = bentoItem
                            ? bentoItem[setting.id] ?? defaultValue
                            : selectedSection.settings[`${contextId}_${setting.id}`] ?? defaultValue;

                          if (setting.id === 'social_links' && selectedSection.type === 'footer') {
                            logDebug('[FOOTER_PROPERTY_EDITOR_SOCIAL_STATE_DEBUG]', {
                              moduleId: selectedSection.id,
                              fieldKey: `${contextId}_${setting.id}`,
                              rawEditorValue: selectedSection.settings[`${contextId}_${setting.id}`],
                              plainEditorValue: value,
                              itemsCount: Array.isArray(value) ? value.length : 0,
                              items: value
                            });
                          }

                          return (
                            <div key={`${contextId}_${setting.id}`} className="space-y-1">
                              <SettingControl 
                                setting={{ ...setting, label: setting.subsection ? setting.label : label }}
                                value={value}
                                onChange={(val, extras) => handleFieldChange(contextId, setting.id, val, extras)}
                                projectId={project?.id || null}
                                products={project?.products || []}
                                customers={project?.customers || []}
                                projectColors={projectColors}
                                project={project}
                                contextId={contextId}
                                moduleType={selectedSection.type}
                              />
                              {setting.description && (
                                <p className="text-[10px] text-gray-400 mt-1 italic pl-1">{setting.description}</p>
                              )}
                            </div>
                          );
                        };

                        if (subsection === '__default__') {
                          return subsectionFields.map(renderField);
                        }

                        const subsectionKey = `${selectedSection.id}:${pillar}:${subsection}`;
                        const isSubsectionExpanded = expandedSubsections[subsectionKey] ?? true;

                        return (
                          <div key={subsectionKey} className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/70">
                            <button
                              onClick={() => toggleSubsection(subsectionKey)}
                              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100/80 transition-colors"
                            >
                              <span className="text-[11px] font-black uppercase tracking-wider text-gray-700">
                                {subsection}
                              </span>
                              {isSubsectionExpanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                            </button>
                            <AnimatePresence initial={false}>
                              {isSubsectionExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-4 pb-4 space-y-4">
                                    {subsectionFields.map(renderField)}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
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
