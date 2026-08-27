import React, { useState } from 'react';
import { ChevronDown, ChevronRight, ChevronUp } from 'lucide-react';
import {
  normalizeBentoCompositeElements,
  normalizeBentoCompositeListItems,
  reorderBentoCompositeListItems,
  reorderBentoCompositeElements,
  updateBentoCompositeElement,
  type BentoCompositeElement,
} from '../../../utils/bentoComposite';
import { SettingControl } from '../SettingControl';

const labels: Record<string, string> = {
  label: 'Etiqueta', image: 'Imagen', icon: 'Ícono', title: 'Título', description: 'Descripción',
  list: 'Lista', button_primary: 'Botón principal', button_secondary: 'Botón secundario'
};

type Props = { value: unknown; onChange: (value: BentoCompositeElement[]) => void; project?: any; projectColors?: string[]; moduleType?: string; contextId?: string };

const ListEditor = ({ element, update }: { element: BentoCompositeElement; update: (id: string, updates: Record<string, unknown>) => void }) => {
  const items = normalizeBentoCompositeListItems(element.items);
  const setItems = (next: typeof items) => update(element.id, { items: next });
  return <div className="space-y-2">
    <span className="text-[10px] font-bold text-gray-600">Items</span>
    {items.map((item, index) => <div key={item.id} className="flex items-center gap-1.5">
      <input aria-label={`Texto del elemento ${index + 1}`} value={item.text} onChange={(event) => setItems(items.map((current) => current.id === item.id ? { ...current, text: event.target.value } : current))} className="min-w-0 flex-1 rounded-lg border border-gray-200 px-2.5 py-2 text-xs" />
      <button type="button" aria-label="Subir elemento" disabled={index === 0} onClick={() => setItems(reorderBentoCompositeListItems(items, index, index - 1))} className="text-gray-400 disabled:opacity-30"><ChevronUp size={14} /></button>
      <button type="button" aria-label="Bajar elemento" disabled={index === items.length - 1} onClick={() => setItems(reorderBentoCompositeListItems(items, index, index + 1))} className="text-gray-400 disabled:opacity-30"><ChevronDown size={14} /></button>
      <button type="button" aria-label="Eliminar elemento" onClick={() => setItems(items.filter((current) => current.id !== item.id))} className="text-red-400">×</button>
    </div>)}
    <button type="button" onClick={() => setItems([...items, { id: `composite_list_${Date.now()}`, text: 'Nuevo elemento' }])} className="text-[10px] font-bold text-blue-600">+ Agregar elemento</button>
  </div>;
};

export const BentoCompositeEditor = ({ value, onChange, project, projectColors = [], moduleType = 'bento', contextId = 'composite' }: Props) => {
  const elements = normalizeBentoCompositeElements(value);
  const [expandedId, setExpandedId] = useState<string | null>(elements.find((element) => element.type === 'title')?.id || null);
  const update = (id: string, updates: Record<string, unknown>) => onChange(updateBentoCompositeElement(elements, id, updates));
  const move = (index: number, delta: number) => onChange(reorderBentoCompositeElements(elements, index, index + delta));
  const native = (element: BentoCompositeElement, id: string, label: string, type: string, extra: Record<string, unknown> = {}) => (
    <SettingControl
      setting={{ id, label, type, defaultValue: element[id] ?? '', ...extra } as any}
      value={element[id]}
      onChange={(next) => update(element.id, { [id]: next })}
      projectId={project?.id || null}
      products={project?.products || []}
      customers={project?.customers || []}
      projectColors={projectColors}
      project={project}
      contextId={`${contextId}_${element.id}`}
      moduleType={moduleType}
    />
  );

  const field = (element: BentoCompositeElement, id: string, label: string, type: 'text' | 'number' = 'text') => (
    <label key={id} className="block space-y-1 text-[10px] font-semibold text-gray-600">
      <span>{label}</span>
      <input type={type} value={Array.isArray(element[id]) ? element[id].join('\n') : (element[id] ?? '')} onChange={(event) => update(element.id, { [id]: id === 'items' ? event.target.value.split('\n') : type === 'number' ? Number(event.target.value) : event.target.value })} className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-xs font-normal text-gray-800 outline-none focus:border-blue-400" />
    </label>
  );

  const typography = (element: BentoCompositeElement) => (
    <div className="grid grid-cols-2 gap-2">
      {native(element, 'font_family', 'Familia tipográfica', 'select', { options: [{ label: 'Heredada del tema', value: 'inherit' }, { label: 'Sans', value: 'sans-serif' }, { label: 'Serif', value: 'serif' }, { label: 'Monoespaciada', value: 'monospace' }] })}
      {native(element, 'font_size', 'Tamaño', 'typography_size', { allowedLevels: element.type === 'title' ? ['t1', 't2', 't3', 'p', 's'] : ['t3', 'p', 's'] })}
      {native(element, 'font_weight', 'Peso', 'font_weight')}
      {native(element, 'color', 'Color', 'color')}
      {native(element, 'line_height', 'Interlineado', 'range', { min: 1, max: 2, step: 0.05 })}
      {native(element, 'letter_spacing', 'Espaciado', 'range', { min: -5, max: 10, step: 0.5, unit: 'px' })}
    </div>
  );

  const editor = (element: BentoCompositeElement) => {
    if (element.type === 'image') return <div className="space-y-2">{native(element, 'src', 'Imagen', 'image')}{field(element, 'alt', 'Texto alternativo')}</div>;
    if (element.type === 'icon') return <div className="space-y-2">{native(element, 'name', 'Ícono', 'icon')}{native(element, 'color', 'Color', 'color')}{native(element, 'size', 'Tamaño', 'range', { min: 16, max: 96, unit: 'px' })}</div>;
    if (element.type === 'list') return <ListEditor element={element} update={update} />;
    if (element.type === 'button_primary' || element.type === 'button_secondary') return (
      <div className="space-y-2">
        {field(element, 'text', 'Texto')}{field(element, 'url', 'URL')}<div className="pt-2"><span className="text-[10px] font-bold text-gray-600">Tipografía</span>{typography(element)}</div>
        <label className="block space-y-1 text-[10px] font-semibold text-gray-600"><span>Destino</span><select value={element.target || '_self'} onChange={(event) => update(element.id, { target: event.target.value })} className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-xs font-normal"><option value="_self">Misma pestaña</option><option value="_blank">Nueva pestaña</option></select></label>
      </div>
    );
    return <div className="space-y-2">{field(element, 'text', 'Texto')}{typography(element)}</div>;
  };

  return <section className="space-y-3 rounded-xl border border-gray-100 bg-gray-50/70 p-3">
    <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-700">Elementos del bloque</h4>
    <div className="space-y-2">
      {elements.map((element, index) => {
        const expanded = expandedId === element.id;
        return <div key={element.id} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center gap-2 px-2 py-2">
            <input aria-label={`Habilitar ${labels[element.type]}`} type="checkbox" checked={element.enabled} onChange={(event) => update(element.id, { enabled: event.target.checked })} />
            <button type="button" onClick={() => setExpandedId(expanded ? null : element.id)} className="flex min-w-0 flex-1 items-center gap-1 text-left text-xs font-bold text-gray-700">{expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}{labels[element.type]}</button>
            <button type="button" aria-label={`Subir ${labels[element.type]}`} disabled={index === 0} onClick={() => move(index, -1)} className="text-gray-400 disabled:opacity-30"><ChevronUp size={14} /></button>
            <button type="button" aria-label={`Bajar ${labels[element.type]}`} disabled={index === elements.length - 1} onClick={() => move(index, 1)} className="text-gray-400 disabled:opacity-30"><ChevronDown size={14} /></button>
          </div>
          {expanded && <div className="space-y-3 border-t border-gray-100 px-3 pb-3 pt-3">{editor(element)}</div>}
        </div>;
      })}
    </div>
  </section>;
};
