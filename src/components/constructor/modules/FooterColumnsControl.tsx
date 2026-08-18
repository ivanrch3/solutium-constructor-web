import React from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import {
  createDefaultFooterV2Config,
  getFooterDayDefaults,
  isValidFooterV2Config,
  migrateLegacyFooterToV2,
  normalizeFooterV2Config,
  type FooterColumn,
  type FooterColumnType,
  type FooterLink,
  type FooterV2Config
} from './footerConfig';

const TYPES: Array<{ value: FooterColumnType; label: string }> = [
  { value: 'brand', label: 'Marca' },
  { value: 'menu', label: 'Menú' },
  { value: 'contact', label: 'Contacto' },
  { value: 'social', label: 'Redes sociales' },
  { value: 'text', label: 'Texto' },
  { value: 'hours', label: 'Horario' }
];

const inputClass = 'w-full rounded-lg border border-border/60 bg-surface px-2.5 py-2 text-[11px] text-text outline-none focus:border-primary';
const getText = (value: unknown) => typeof value === 'string' ? value : '';

const createColumn = (type: FooterColumnType): FooterColumn => {
  const base = { id: `footer_column_${globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)}` };
  if (type === 'brand') return { ...base, type, logoSource: 'project', showLogo: true, showName: true, showDescription: true };
  if (type === 'menu') return { ...base, type, title: 'Enlaces', links: [] };
  if (type === 'contact') return { ...base, type, title: 'Contacto', showPhone: false, showWhatsapp: false, showEmail: false, showAddress: false, showIcons: true };
  if (type === 'social') return { ...base, type, title: 'Síguenos', links: [], presentation: 'icon' };
  if (type === 'hours') return { ...base, type, title: 'Horario', days: getFooterDayDefaults() };
  return { ...base, type: 'text', title: '', content: '' };
};

const Field = ({ label, value, onChange, placeholder }: { label: string; value: unknown; onChange: (value: string) => void; placeholder?: string }) => (
  <label className="block space-y-1">
    <span className="text-[10px] font-semibold text-text/55">{label}</span>
    <input className={inputClass} value={getText(value)} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
  </label>
);

const Toggle = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) => (
  <label className="flex items-center gap-2 text-[10px] text-text/70">
    <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="accent-primary" />
    {label}
  </label>
);

const MoveButtons = ({ index, length, onMove }: { index: number; length: number; onMove: (direction: 'up' | 'down') => void }) => (
  <div className="flex items-center gap-1">
    <button type="button" title="Subir" disabled={index === 0} onClick={() => onMove('up')} className="rounded p-1 text-text/45 hover:bg-primary/10 hover:text-primary disabled:opacity-20"><ChevronUp size={14} /></button>
    <button type="button" title="Bajar" disabled={index === length - 1} onClick={() => onMove('down')} className="rounded p-1 text-text/45 hover:bg-primary/10 hover:text-primary disabled:opacity-20"><ChevronDown size={14} /></button>
  </div>
);

export const FooterColumnsControl: React.FC<{
  moduleId: string;
  settingsValues: Record<string, any>;
  project?: any;
  onSettingChange: (elementId: string, settingId: string, value: any) => void;
}> = ({ moduleId, settingsValues, project, onSettingChange }) => {
  const key = `${moduleId}_el_footer_config`;
  const rawConfig = settingsValues[key];
  const config = normalizeFooterV2Config(rawConfig, project);
  const isV2 = isValidFooterV2Config(rawConfig);
  const [message, setMessage] = React.useState<string | null>(null);

  const save = (next: FooterV2Config) => onSettingChange(moduleId, 'el_footer_config', next);
  const update = (transform: (current: FooterV2Config) => FooterV2Config) => {
    const current = config || createDefaultFooterV2Config(project);
    save(transform(current));
  };

  const convert = () => {
    const result = migrateLegacyFooterToV2(settingsValues, moduleId, project);
    if ('error' in result) {
      setMessage(result.error);
      return;
    }
    setMessage(null);
    save(result.config);
  };

  if (!isV2 || !config) {
    return (
      <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
        <p className="text-[11px] leading-relaxed text-text/70">Este footer todavía usa la configuración legacy. Puedes mantenerla sin cambios o convertirla explícitamente a columnas.</p>
        <button type="button" onClick={convert} className="w-full rounded-lg bg-primary px-3 py-2 text-[11px] font-bold text-white hover:opacity-90">Convertir a columnas</button>
        {message && <p role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-2 text-[10px] leading-relaxed text-amber-800">{message}</p>}
      </div>
    );
  }

  const setColumn = (index: number, next: FooterColumn) => update((current) => ({ ...current, columns: current.columns.map((column, itemIndex) => itemIndex === index ? next : column) }));
  const removeColumn = (index: number) => update((current) => ({ ...current, columns: current.columns.filter((_, itemIndex) => itemIndex !== index) }));
  const moveColumn = (index: number, direction: 'up' | 'down') => update((current) => {
    const next = [...current.columns];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= next.length) return current;
    [next[index], next[target]] = [next[target], next[index]];
    return { ...current, columns: next };
  });

  const updateLink = (column: Extract<FooterColumn, { type: 'menu' }>, index: number, patch: Partial<FooterLink>) => ({ ...column, links: column.links.map((link, linkIndex) => linkIndex === index ? { ...link, ...patch } : link) });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-text">Columnas: {config.columns.length} de 4</p>
        <button type="button" disabled={config.columns.length >= 4} onClick={() => update((current) => ({ ...current, columns: [...current.columns, createColumn('text')] }))} className="inline-flex items-center gap-1 rounded-lg border border-primary/30 px-2 py-1 text-[10px] font-semibold text-primary disabled:opacity-30"><Plus size={13} /> Agregar</button>
      </div>

      {config.columns.map((column, index) => (
        <div key={column.id} className="space-y-3 rounded-xl border border-border/50 bg-surface p-3">
          <div className="flex items-center gap-2">
            <select className={`${inputClass} flex-1`} value={column.type} onChange={(event) => setColumn(index, createColumn(event.target.value as FooterColumnType))}>
              {TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
            </select>
            <MoveButtons index={index} length={config.columns.length} onMove={(direction) => moveColumn(index, direction)} />
            <button type="button" disabled={config.columns.length <= 1} title="Eliminar columna" onClick={() => removeColumn(index)} className="rounded p-1 text-red-500 hover:bg-red-50 disabled:opacity-20"><Trash2 size={14} /></button>
          </div>
          {column.type === 'brand' && <div className="grid gap-2"><select className={inputClass} value={column.logoSource} onChange={(event) => setColumn(index, { ...column, logoSource: event.target.value as 'project' | 'custom' })}><option value="project">Logo del proyecto</option><option value="custom">Logo personalizado</option></select>{column.logoSource === 'custom' && <Field label="URL del logo" value={column.customLogoUrl} onChange={(value) => setColumn(index, { ...column, customLogoUrl: value })} />}<Field label="Nombre" value={column.name} onChange={(value) => setColumn(index, { ...column, name: value })} /><Field label="Descripción" value={column.description} onChange={(value) => setColumn(index, { ...column, description: value })} /><div className="flex flex-wrap gap-3"><Toggle label="Mostrar logo" checked={column.showLogo} onChange={(value) => setColumn(index, { ...column, showLogo: value })} /><Toggle label="Mostrar nombre" checked={column.showName} onChange={(value) => setColumn(index, { ...column, showName: value })} /><Toggle label="Mostrar descripción" checked={column.showDescription} onChange={(value) => setColumn(index, { ...column, showDescription: value })} /></div></div>}
          {column.type === 'menu' && <div className="space-y-2"><Field label="Título" value={column.title} onChange={(value) => setColumn(index, { ...column, title: value })} />{column.links.map((link, linkIndex) => <div key={link.id} className="rounded-lg border border-border/40 p-2"><div className="flex gap-2"><Field label="Etiqueta" value={link.label} onChange={(value) => setColumn(index, updateLink(column, linkIndex, { label: value }))} /><Field label="Destino" value={link.url} onChange={(value) => setColumn(index, updateLink(column, linkIndex, { url: value, kind: value.startsWith('/') || value.startsWith('#') ? 'internal' : 'external' }))} /><button type="button" title="Eliminar enlace" onClick={() => setColumn(index, { ...column, links: column.links.filter((_, itemIndex) => itemIndex !== linkIndex) })} className="mt-4 text-red-500"><Trash2 size={14} /></button></div><div className="mt-2 flex items-center justify-between"><select className="rounded border border-border/50 bg-surface px-2 py-1 text-[10px]" value={link.target || '_self'} onChange={(event) => setColumn(index, updateLink(column, linkIndex, { target: event.target.value as '_self' | '_blank' }))}><option value="_self">Misma pestaña</option><option value="_blank">Nueva pestaña</option></select><MoveButtons index={linkIndex} length={column.links.length} onMove={(direction) => { const target = direction === 'up' ? linkIndex - 1 : linkIndex + 1; if (target < 0 || target >= column.links.length) return; const links = [...column.links]; [links[linkIndex], links[target]] = [links[target], links[linkIndex]]; setColumn(index, { ...column, links }); }} /></div></div>)}<button type="button" onClick={() => setColumn(index, { ...column, links: [...column.links, { id: `footer_link_${globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)}`, label: 'Enlace', url: '#', kind: 'internal', target: '_self' }] })} className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary"><Plus size={13} /> Añadir enlace</button></div>}
          {column.type === 'contact' && <div className="space-y-2"><Field label="Título" value={column.title} onChange={(value) => setColumn(index, { ...column, title: value })} /><Field label="Teléfono" value={column.phone} onChange={(value) => setColumn(index, { ...column, phone: value, showPhone: !!value })} /><Field label="WhatsApp" value={column.whatsapp} onChange={(value) => setColumn(index, { ...column, whatsapp: value, showWhatsapp: !!value })} /><Field label="Correo" value={column.email} onChange={(value) => setColumn(index, { ...column, email: value, showEmail: !!value })} /><Field label="Dirección" value={column.address} onChange={(value) => setColumn(index, { ...column, address: value, showAddress: !!value })} /><div className="flex flex-wrap gap-3"><Toggle label="Iconos" checked={column.showIcons} onChange={(value) => setColumn(index, { ...column, showIcons: value })} /><Toggle label="Teléfono" checked={column.showPhone} onChange={(value) => setColumn(index, { ...column, showPhone: value })} /><Toggle label="WhatsApp" checked={column.showWhatsapp} onChange={(value) => setColumn(index, { ...column, showWhatsapp: value })} /><Toggle label="Correo" checked={column.showEmail} onChange={(value) => setColumn(index, { ...column, showEmail: value })} /><Toggle label="Dirección" checked={column.showAddress} onChange={(value) => setColumn(index, { ...column, showAddress: value })} /></div></div>}
          {column.type === 'social' && <div className="space-y-2"><Field label="Título" value={column.title} onChange={(value) => setColumn(index, { ...column, title: value })} /><select className={inputClass} value={column.presentation} onChange={(event) => setColumn(index, { ...column, presentation: event.target.value as 'icon' | 'icon_label' })}><option value="icon">Solo icono</option><option value="icon_label">Icono y etiqueta</option></select>{column.links.map((link, linkIndex) => <div key={link.id} className="flex gap-2"><Field label="Plataforma" value={link.platform} onChange={(value) => setColumn(index, { ...column, links: column.links.map((item, itemIndex) => itemIndex === linkIndex ? { ...item, platform: value } : item) })} /><Field label="URL completa" value={link.url} onChange={(value) => setColumn(index, { ...column, links: column.links.map((item, itemIndex) => itemIndex === linkIndex ? { ...item, url: value } : item) })} /><button type="button" title="Eliminar red" onClick={() => setColumn(index, { ...column, links: column.links.filter((_, itemIndex) => itemIndex !== linkIndex) })} className="mt-4 text-red-500"><Trash2 size={14} /></button></div>)}<button type="button" onClick={() => setColumn(index, { ...column, links: [...column.links, { id: `footer_social_${globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)}`, platform: 'website', url: '' }] })} className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary"><Plus size={13} /> Añadir red</button></div>}
          {column.type === 'text' && <div className="space-y-2"><Field label="Título opcional" value={column.title} onChange={(value) => setColumn(index, { ...column, title: value })} /><label className="block space-y-1"><span className="text-[10px] font-semibold text-text/55">Contenido</span><textarea className={`${inputClass} min-h-24`} value={column.content} onChange={(event) => setColumn(index, { ...column, content: event.target.value })} /></label></div>}
          {column.type === 'hours' && <div className="space-y-2"><Field label="Título" value={column.title} onChange={(value) => setColumn(index, { ...column, title: value })} />{column.days.map((day, dayIndex) => <div key={day.id} className="grid grid-cols-[1fr_auto_1fr_1fr] items-end gap-1"><span className="text-[10px] text-text/65">{day.label}</span><Toggle label="Cerrado" checked={day.closed} onChange={(value) => setColumn(index, { ...column, days: column.days.map((item, itemIndex) => itemIndex === dayIndex ? { ...item, closed: value } : item) })} /><input className={inputClass} type="time" disabled={day.closed} value={day.open || ''} onChange={(event) => setColumn(index, { ...column, days: column.days.map((item, itemIndex) => itemIndex === dayIndex ? { ...item, open: event.target.value } : item) })} /><input className={inputClass} type="time" disabled={day.closed} value={day.close || ''} onChange={(event) => setColumn(index, { ...column, days: column.days.map((item, itemIndex) => itemIndex === dayIndex ? { ...item, close: event.target.value } : item) })} /></div>)}</div>}
        </div>
      ))}

      <div className="space-y-2 border-t border-border/40 pt-3">
        <p className="text-[11px] font-bold text-text">Barra inferior</p>
        <Toggle label="Mostrar barra inferior" checked={config.bottomBar.enabled} onChange={(value) => update((current) => ({ ...current, bottomBar: { ...current.bottomBar, enabled: value } }))} />
        <Field label="Copyright" value={config.bottomBar.copyright} placeholder="Se muestra el nombre del proyecto si queda vacío" onChange={(value) => update((current) => ({ ...current, bottomBar: { ...current.bottomBar, copyright: value } }))} />
        <select className={inputClass} value={config.bottomBar.yearMode} onChange={(event) => update((current) => ({ ...current, bottomBar: { ...current.bottomBar, yearMode: event.target.value as 'fixed' | 'current' } }))}><option value="current">Año actual</option><option value="fixed">Año fijo</option></select>
      </div>
    </div>
  );
};
