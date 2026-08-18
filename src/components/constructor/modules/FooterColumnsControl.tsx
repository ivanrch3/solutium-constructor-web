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
const typeLabel = (type: FooterColumnType) => TYPES.find((item) => item.value === type)?.label || type;

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
  <div className="flex items-center gap-0.5">
    <button type="button" title="Subir" disabled={index === 0} onClick={() => onMove('up')} className="rounded p-1 text-text/45 hover:bg-primary/10 hover:text-primary disabled:opacity-20"><ChevronUp size={13} /></button>
    <button type="button" title="Bajar" disabled={index === length - 1} onClick={() => onMove('down')} className="rounded p-1 text-text/45 hover:bg-primary/10 hover:text-primary disabled:opacity-20"><ChevronDown size={13} /></button>
  </div>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="border-b border-border/40 pb-1 text-[10px] font-bold uppercase tracking-wider text-text/45">{children}</p>
);

const CompactMenuLinks = ({ column, onChange, showTitle = true }: { column: Extract<FooterColumn, { type: 'menu' }>; onChange: (column: Extract<FooterColumn, { type: 'menu' }>) => void; showTitle?: boolean }) => {
  const updateLink = (index: number, patch: Partial<FooterLink>) => onChange({ ...column, links: column.links.map((link, linkIndex) => linkIndex === index ? { ...link, ...patch } : link) });
  const moveLink = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= column.links.length) return;
    const links = [...column.links];
    [links[index], links[target]] = [links[target], links[index]];
    onChange({ ...column, links });
  };
  return <div className="space-y-2">{showTitle && <Field label="Título" value={column.title} onChange={(value) => onChange({ ...column, title: value })} />}<SectionLabel>Enlaces</SectionLabel>{column.links.map((link, index) => <details key={link.id} className="rounded-lg border border-border/40 bg-surface/70"><summary className="flex cursor-pointer list-none items-center gap-2 px-2.5 py-2 text-[11px] font-semibold text-text/75"><span className="min-w-0 flex-1 truncate">{link.label || `Enlace ${index + 1}`}</span><MoveButtons index={index} length={column.links.length} onMove={(direction) => moveLink(index, direction)} /><button type="button" title="Eliminar enlace" onClick={(event) => { event.preventDefault(); onChange({ ...column, links: column.links.filter((_, linkIndex) => linkIndex !== index) }); }} className="text-red-500"><Trash2 size={13} /></button></summary><div className="grid gap-2 border-t border-border/30 p-2.5"><Field label="Etiqueta" value={link.label} onChange={(value) => updateLink(index, { label: value })} /><Field label="Destino" value={link.url} onChange={(value) => updateLink(index, { url: value, kind: value.startsWith('/') || value.startsWith('#') ? 'internal' : 'external' })} /><div className="flex items-center justify-between gap-2"><span className="text-[10px] text-text/50">Tipo: {link.kind === 'internal' ? 'Interno' : 'Externo'}</span><select className="rounded border border-border/50 bg-surface px-2 py-1 text-[10px]" value={link.target || '_self'} onChange={(event) => updateLink(index, { target: event.target.value as '_self' | '_blank' })}><option value="_self">Misma pestaña</option><option value="_blank">Nueva pestaña</option></select></div></div></details>)}<button type="button" onClick={() => onChange({ ...column, links: [...column.links, { id: `footer_link_${globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)}`, label: 'Enlace', url: '#', kind: 'internal', target: '_self' }] })} className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary"><Plus size={13} /> Agregar enlace</button></div>;
};

const CompactSocialLinks = ({ column, onChange }: { column: Extract<FooterColumn, { type: 'social' }>; onChange: (column: Extract<FooterColumn, { type: 'social' }>) => void }) => (
  <div className="space-y-2"><Field label="Título" value={column.title} onChange={(value) => onChange({ ...column, title: value })} /><select className={inputClass} value={column.presentation} onChange={(event) => onChange({ ...column, presentation: event.target.value as 'icon' | 'icon_label' })}><option value="icon">Solo icono</option><option value="icon_label">Icono y etiqueta</option></select><SectionLabel>Redes sociales</SectionLabel>{column.links.map((link, index) => <details key={link.id} className="rounded-lg border border-border/40 bg-surface/70"><summary className="flex cursor-pointer list-none items-center gap-2 px-2.5 py-2 text-[11px] font-semibold text-text/75"><span className="min-w-0 flex-1 truncate">{link.label || link.platform || `Red ${index + 1}`}</span><button type="button" title="Eliminar red social" onClick={(event) => { event.preventDefault(); onChange({ ...column, links: column.links.filter((_, linkIndex) => linkIndex !== index) }); }} className="text-red-500"><Trash2 size={13} /></button></summary><div className="grid gap-2 border-t border-border/30 p-2.5"><Field label="Plataforma" value={link.platform} onChange={(value) => onChange({ ...column, links: column.links.map((item, linkIndex) => linkIndex === index ? { ...item, platform: value } : item) })} /><Field label="URL completa" value={link.url} onChange={(value) => onChange({ ...column, links: column.links.map((item, linkIndex) => linkIndex === index ? { ...item, url: value } : item) })} /><Field label="Etiqueta opcional" value={link.label} onChange={(value) => onChange({ ...column, links: column.links.map((item, linkIndex) => linkIndex === index ? { ...item, label: value } : item) })} /></div></details>)}<button type="button" onClick={() => onChange({ ...column, links: [...column.links, { id: `footer_social_${globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)}`, platform: 'website', url: '' }] })} className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary"><Plus size={13} /> Agregar red social</button></div>
);

const ColumnFields = ({ column, onChange }: { column: FooterColumn; onChange: (column: FooterColumn) => void }) => {
  if (column.type === 'brand') return <div className="space-y-3"><SectionLabel>Contenido</SectionLabel><select className={inputClass} value={column.logoSource} onChange={(event) => onChange({ ...column, logoSource: event.target.value as 'project' | 'custom' })}><option value="project">Logo del proyecto</option><option value="custom">Logo personalizado</option></select>{column.logoSource === 'custom' && <Field label="URL del logo" value={column.customLogoUrl} onChange={(value) => onChange({ ...column, customLogoUrl: value })} />}<Field label="Nombre" value={column.name} onChange={(value) => onChange({ ...column, name: value })} /><Field label="Descripción" value={column.description} onChange={(value) => onChange({ ...column, description: value })} /><SectionLabel>Visibilidad</SectionLabel><div className="grid gap-2"><Toggle label="Mostrar logo" checked={column.showLogo} onChange={(value) => onChange({ ...column, showLogo: value })} /><Toggle label="Mostrar nombre" checked={column.showName} onChange={(value) => onChange({ ...column, showName: value })} /><Toggle label="Mostrar descripción" checked={column.showDescription} onChange={(value) => onChange({ ...column, showDescription: value })} /></div></div>;
  if (column.type === 'menu') return <CompactMenuLinks column={column} onChange={onChange} />;
  if (column.type === 'contact') return <div className="space-y-3"><SectionLabel>Datos</SectionLabel><Field label="Teléfono" value={column.phone} onChange={(value) => onChange({ ...column, phone: value, showPhone: !!value })} /><Field label="WhatsApp" value={column.whatsapp} onChange={(value) => onChange({ ...column, whatsapp: value, showWhatsapp: !!value })} /><Field label="Correo" value={column.email} onChange={(value) => onChange({ ...column, email: value, showEmail: !!value })} /><Field label="Dirección" value={column.address} onChange={(value) => onChange({ ...column, address: value, showAddress: !!value })} /><SectionLabel>Visibilidad</SectionLabel><div className="grid gap-2"><Toggle label="Mostrar teléfono" checked={column.showPhone} onChange={(value) => onChange({ ...column, showPhone: value })} /><Toggle label="Mostrar WhatsApp" checked={column.showWhatsapp} onChange={(value) => onChange({ ...column, showWhatsapp: value })} /><Toggle label="Mostrar correo" checked={column.showEmail} onChange={(value) => onChange({ ...column, showEmail: value })} /><Toggle label="Mostrar dirección" checked={column.showAddress} onChange={(value) => onChange({ ...column, showAddress: value })} /><Toggle label="Mostrar iconos" checked={column.showIcons} onChange={(value) => onChange({ ...column, showIcons: value })} /></div></div>;
  if (column.type === 'social') return <CompactSocialLinks column={column} onChange={onChange} />;
  if (column.type === 'text') return <div className="space-y-3"><SectionLabel>Contenido</SectionLabel><Field label="Título opcional" value={column.title} onChange={(value) => onChange({ ...column, title: value })} /><label className="block space-y-1"><span className="text-[10px] font-semibold text-text/55">Contenido</span><textarea className={`${inputClass} min-h-24`} value={column.content} onChange={(event) => onChange({ ...column, content: event.target.value })} /></label></div>;
  return <div className="space-y-3"><Field label="Título" value={column.title} onChange={(value) => onChange({ ...column, title: value })} /><SectionLabel>Días y horas</SectionLabel>{column.days.map((day, dayIndex) => <div key={day.id} className="rounded-lg border border-border/40 p-2"><div className="flex items-center justify-between gap-2"><span className="text-[10px] font-semibold text-text/70">{day.label}</span><Toggle label="Cerrado" checked={day.closed} onChange={(value) => onChange({ ...column, days: column.days.map((item, itemIndex) => itemIndex === dayIndex ? { ...item, closed: value } : item) })} /></div><div className="mt-2 grid grid-cols-2 gap-2"><input className={inputClass} type="time" disabled={day.closed} value={day.open || ''} onChange={(event) => onChange({ ...column, days: column.days.map((item, itemIndex) => itemIndex === dayIndex ? { ...item, open: event.target.value } : item) })} /><input className={inputClass} type="time" disabled={day.closed} value={day.close || ''} onChange={(event) => onChange({ ...column, days: column.days.map((item, itemIndex) => itemIndex === dayIndex ? { ...item, close: event.target.value } : item) })} /></div></div>)}</div>;
};

const FooterColumnCard = ({ column, index, total, open, onToggle, onChange, onMove, onRemove }: { column: FooterColumn; index: number; total: number; open: boolean; onToggle: () => void; onChange: (column: FooterColumn) => void; onMove: (direction: 'up' | 'down') => void; onRemove: () => void }) => (
  <div className="overflow-hidden rounded-xl border border-border/50 bg-surface"><div className="flex items-center gap-2 px-2.5 py-2"><button type="button" onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-2 text-left"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{index + 1}</span><span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-text">Columna {index + 1} <span className="font-normal text-text/55">· {typeLabel(column.type)}</span></span><ChevronDown size={14} className={`shrink-0 text-text/35 transition-transform ${open ? 'rotate-180 text-primary' : ''}`} /></button><MoveButtons index={index} length={total} onMove={onMove} /><button type="button" disabled={total <= 1} title="Eliminar columna" onClick={onRemove} className="rounded p-1 text-red-500 hover:bg-red-50 disabled:opacity-20"><Trash2 size={14} /></button></div>{open && <div className="space-y-3 border-t border-border/40 bg-secondary/20 p-3"><div><p className="text-[10px] font-bold uppercase tracking-wider text-text/45">Tipo de contenido</p><select className={`${inputClass} mt-1.5`} value={column.type} onChange={(event) => { const next = createColumn(event.target.value as FooterColumnType); onChange({ ...next, id: column.id }); }}><option value="brand">Marca</option><option value="menu">Menú</option><option value="contact">Contacto</option><option value="social">Redes sociales</option><option value="text">Texto</option><option value="hours">Horario</option></select></div><ColumnFields column={column} onChange={onChange} /></div>}</div>
);

export const FooterBottomBarControl: React.FC<{ config: FooterV2Config; onChange: (config: FooterV2Config) => void }> = ({ config, onChange }) => {
  const bottomBar = config.bottomBar;
  return <div className="space-y-3"><Toggle label="Mostrar barra inferior" checked={bottomBar.enabled} onChange={(value) => onChange({ ...config, bottomBar: { ...bottomBar, enabled: value } })} /><Field label="Texto de copyright" value={bottomBar.copyright} placeholder="Nombre o texto de copyright" onChange={(value) => onChange({ ...config, bottomBar: { ...bottomBar, copyright: value } })} /><label className="block space-y-1"><span className="text-[10px] font-semibold text-text/55">Año</span><select className={inputClass} value={bottomBar.yearMode} onChange={(event) => onChange({ ...config, bottomBar: { ...bottomBar, yearMode: event.target.value as 'fixed' | 'current' } })}><option value="current">Año actual</option><option value="fixed">Año fijo</option></select></label>{bottomBar.yearMode === 'fixed' && <label className="block space-y-1"><span className="text-[10px] font-semibold text-text/55">Año fijo</span><input className={inputClass} type="number" value={bottomBar.fixedYear || ''} onChange={(event) => onChange({ ...config, bottomBar: { ...bottomBar, fixedYear: event.target.value ? Number(event.target.value) : undefined } })} /></label>}<SectionLabel>Enlaces legales</SectionLabel><CompactMenuLinks column={{ id: 'footer_bottom_legal_links', type: 'menu', title: '', links: bottomBar.legalLinks }} showTitle={false} onChange={(column) => onChange({ ...config, bottomBar: { ...bottomBar, legalLinks: column.links } })} /></div>;
};

export const FooterColumnsControl: React.FC<{ moduleId: string; settingsValues: Record<string, any>; project?: any; onSettingChange: (elementId: string, settingId: string, value: any) => void }> = ({ moduleId, settingsValues, project, onSettingChange }) => {
  const key = `${moduleId}_el_footer_config`;
  const rawConfig = settingsValues[key];
  const config = normalizeFooterV2Config(rawConfig, project);
  const isV2 = isValidFooterV2Config(rawConfig);
  const [message, setMessage] = React.useState<string | null>(null);
  const [openColumnId, setOpenColumnId] = React.useState<string | null>(null);
  const save = (next: FooterV2Config) => onSettingChange(moduleId, 'el_footer_config', next);
  const update = (transform: (current: FooterV2Config) => FooterV2Config) => save(transform(config || createDefaultFooterV2Config(project)));
  const convert = () => { const result = migrateLegacyFooterToV2(settingsValues, moduleId, project); if ('error' in result) { setMessage(result.error); return; } setMessage(null); save(result.config); };
  if (!isV2 || !config) return <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-3"><p className="text-[11px] leading-relaxed text-text/70">Este footer todavía usa la configuración legacy. Puedes mantenerla sin cambios o convertirla explícitamente a columnas.</p><button type="button" onClick={convert} className="w-full rounded-lg bg-primary px-3 py-2 text-[11px] font-bold text-white hover:opacity-90">Convertir a columnas</button>{message && <p role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-2 text-[10px] leading-relaxed text-amber-800">{message}</p>}</div>;
  const setColumn = (index: number, next: FooterColumn) => update((current) => ({ ...current, columns: current.columns.map((column, itemIndex) => itemIndex === index ? next : column) }));
  const moveColumn = (index: number, direction: 'up' | 'down') => update((current) => { const columns = [...current.columns]; const target = direction === 'up' ? index - 1 : index + 1; if (target < 0 || target >= columns.length) return current; [columns[index], columns[target]] = [columns[target], columns[index]]; return { ...current, columns }; });
  return <div className="space-y-3"><div className="flex items-center justify-between"><div><p className="text-[11px] font-bold text-text">Columnas: {config.columns.length} de 4</p>{config.columns.length === 4 && <p className="mt-0.5 text-[10px] text-text/45">Máximo 4 columnas</p>}</div>{config.columns.length < 4 && <button type="button" onClick={() => update((current) => ({ ...current, columns: [...current.columns, createColumn('text')] }))} className="inline-flex items-center gap-1 rounded-lg border border-primary/30 px-2 py-1 text-[10px] font-semibold text-primary"><Plus size={13} /> Agregar columna</button>}</div>{config.columns.map((column, index) => <FooterColumnCard key={column.id} column={column} index={index} total={config.columns.length} open={openColumnId === column.id} onToggle={() => setOpenColumnId((current) => current === column.id ? null : column.id)} onChange={(next) => setColumn(index, next)} onMove={(direction) => moveColumn(index, direction)} onRemove={() => update((current) => { const next = current.columns.filter((_, itemIndex) => itemIndex !== index); if (openColumnId === column.id) setOpenColumnId(null); return { ...current, columns: next }; })} />)}</div>;
};
