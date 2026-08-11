import { useMemo, useRef, useState } from 'react';
import type { Product } from '../../../types/schema';
import {
  createReservasWebActivityAttempt,
  createReservasWebActivity,
  refreshReservasWebActivities,
  ReservasWebAdminApiError,
  updateReservasWebActivity,
  type CreateReservasWebActivityInput,
  type ReservasWebActivityAdminDetail,
  type ReservasWebActivitySessionInput,
  type UpdateReservasWebActivityPatch
} from '../../../services/reservasWebAdminApi';

type Draft = Omit<CreateReservasWebActivityInput, 'sessions'> & { sessions: ReservasWebActivitySessionInput[] };
export type ReservasWebActivityFormMode = 'create' | 'edit';

const blankSession = (): ReservasWebActivitySessionInput => ({ starts_at: '', ends_at: '' });
export const createReservasWebActivityDraft = (detail?: ReservasWebActivityAdminDetail | null, timezone = 'America/Costa_Rica'): Draft => detail ? {
  catalog_item_id: detail.catalogItemId, title_override: detail.title, short_description_override: detail.shortDescription, long_description_override: detail.expandedDescription,
  facilitator_name: detail.facilitator, facilitator_whatsapp: detail.facilitatorWhatsapp, modality: detail.modality as Draft['modality'], physical_location: detail.location,
  maps_url: detail.mapsUrl, private_virtual_url: detail.privateVirtualUrl, timezone: detail.timezone, total_capacity: detail.totalCapacity, is_free: detail.isFree,
  sessions: detail.sessions.map(session => ({ starts_at: session.startAt || session.starts_at || '', ends_at: session.endAt || session.ends_at || '' }))
} : { catalog_item_id: '', title_override: '', modality: 'presencial', physical_location: '', maps_url: '', private_virtual_url: '', timezone, total_capacity: 1, is_free: true, sessions: [blankSession()] };

const optional = (value: string | null | undefined) => value?.trim() ? value.trim() : null;
const isUrl = (value: string | null | undefined) => !optional(value) || /^https?:\/\//i.test(String(value));
export const normalizeReservasWebActivitySessions = (sessions: ReservasWebActivitySessionInput[]) => [...sessions].sort((left, right) => left.starts_at.localeCompare(right.starts_at));
export const validateReservasWebActivityDraft = (draft: Draft) => {
  const errors: string[] = [];
  if (!draft.catalog_item_id) errors.push('Selecciona un item del catálogo.');
  if (!optional(draft.title_override)) errors.push('El título es obligatorio.');
  if (!Number.isInteger(draft.total_capacity) || draft.total_capacity < 1) errors.push('El cupo total debe ser mayor que cero.');
  if ((draft.modality === 'presencial' || draft.modality === 'hybrid') && !optional(draft.physical_location)) errors.push('La ubicación es obligatoria para esta modalidad.');
  if ((draft.modality === 'virtual' || draft.modality === 'hybrid') && !optional(draft.private_virtual_url)) errors.push('La URL virtual es obligatoria para esta modalidad.');
  if (!isUrl(draft.maps_url) || !isUrl(draft.private_virtual_url)) errors.push('Revisa las URLs ingresadas.');
  if (draft.facilitator_whatsapp && !/^\+?[0-9\s()\-]{7,20}$/.test(draft.facilitator_whatsapp)) errors.push('Revisa el WhatsApp del facilitador.');
  if (!draft.sessions.length) errors.push('Agrega al menos una sesión.');
  const pairs = new Set<string>();
  draft.sessions.forEach(session => { if (!session.starts_at || !session.ends_at || new Date(session.starts_at) >= new Date(session.ends_at)) errors.push('Revisa las fechas y horas de las sesiones.'); const key = `${session.starts_at}|${session.ends_at}`; if (pairs.has(key)) errors.push('No repitas la misma sesión.'); pairs.add(key); });
  return errors;
};

const fields: Array<keyof Omit<Draft, 'sessions'>> = ['catalog_item_id','title_override','short_description_override','long_description_override','facilitator_name','facilitator_whatsapp','modality','physical_location','maps_url','private_virtual_url','timezone','total_capacity','is_free'];
export const buildReservasWebActivityPatch = (draft: Draft, original: Draft): UpdateReservasWebActivityPatch => {
  const patch: Record<string, unknown> = {};
  fields.forEach(field => { if (draft[field] !== original[field]) patch[field] = draft[field]; });
  if (JSON.stringify(draft.sessions) !== JSON.stringify(original.sessions)) patch.sessions = normalizeReservasWebActivitySessions(draft.sessions);
  return patch as UpdateReservasWebActivityPatch;
};

const errorMessage = (error: unknown) => {
  if (error instanceof ReservasWebAdminApiError) {
    if (error.code === 'SESSION_INVALID') return 'Revisa las fechas y horas de las sesiones.';
    if (error.code === 'IDEMPOTENCY_CONFLICT') return 'Este intento de creación cambió. Cancélalo e inicia uno nuevo.';
    if (error.code === 'WHATSAPP_CHANNEL_INVALID') return 'La configuración de WhatsApp de esta actividad requiere revisión.';
  }
  return 'No pudimos guardar la actividad. Intenta nuevamente.';
};

type Props = { mode: ReservasWebActivityFormMode; projectId: string; products: Product[]; detail?: ReservasWebActivityAdminDetail | null; timezone?: string | null; onClose: () => void; onSaved: (detail: ReservasWebActivityAdminDetail) => Promise<void> | void; };
export const ReservasWebActivityForm = ({ mode, projectId, products, detail, timezone, onClose, onSaved }: Props) => {
  const original = useMemo(() => createReservasWebActivityDraft(detail, timezone || 'America/Costa_Rica'), [detail, timezone]);
  const [draft, setDraft] = useState<Draft>(original); const [state, setState] = useState<'idle'|'saving'|'success'|'error'>('idle'); const [error, setError] = useState<string | null>(null);
  const attemptRef = useRef(mode === 'create' ? createReservasWebActivityAttempt() : null);
  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft(current => ({ ...current, [key]: value }));
  const submit = async () => { const errors = validateReservasWebActivityDraft(draft); if (errors.length) { setError(errors[0]); setState('error'); return; } setState('saving'); setError(null); try { const normalizedDraft = { ...draft, sessions: normalizeReservasWebActivitySessions(draft.sessions) }; const saved = mode === 'create' ? await createReservasWebActivity(projectId, normalizedDraft, attemptRef.current!.idempotencyKey) : await updateReservasWebActivity(projectId, detail!.id, buildReservasWebActivityPatch(normalizedDraft, original)); await refreshReservasWebActivities(projectId); await onSaved(saved); setState('success'); } catch (cause) { setError(errorMessage(cause)); setState('error'); } };
  const needsLocation = draft.modality === 'presencial' || draft.modality === 'hybrid'; const needsVirtual = draft.modality === 'virtual' || draft.modality === 'hybrid';
  return <div className="mt-3 space-y-3 rounded-xl border border-primary/30 bg-background p-3 text-xs"><div className="flex items-center justify-between"><h3 className="font-semibold">{mode === 'create' ? 'Crear actividad' : 'Editar actividad'}</h3><button type="button" onClick={onClose} className="text-primary underline">Cerrar</button></div>
    <label className="block">Item del catálogo<select value={draft.catalog_item_id} onChange={event => update('catalog_item_id', event.target.value)} className="mt-1 w-full rounded border border-border bg-surface p-2"><option value="">Selecciona un item</option>{products.map(product => <option key={product.id} value={product.id}>{product.name}{product.category ? ` · ${product.category}` : ''}</option>)}</select></label>
    {draft.catalog_item_id && products.find(product => product.id === draft.catalog_item_id)?.imageUrl && <img src={products.find(product => product.id === draft.catalog_item_id)?.imageUrl} alt="Vista previa del catálogo" className="h-16 w-16 rounded object-cover" />}
    <label className="block">Título<input value={draft.title_override || ''} maxLength={160} onChange={event => update('title_override', event.target.value)} className="mt-1 w-full rounded border border-border bg-surface p-2" /></label>
    <label className="block">Descripción corta<textarea value={draft.short_description_override || ''} maxLength={500} onChange={event => update('short_description_override', event.target.value)} className="mt-1 w-full rounded border border-border bg-surface p-2" /></label>
    <label className="block">Descripción ampliada<textarea value={draft.long_description_override || ''} maxLength={4000} onChange={event => update('long_description_override', event.target.value)} className="mt-1 min-h-24 w-full rounded border border-border bg-surface p-2" /></label>
    <div className="grid grid-cols-2 gap-2"><label>Facilitador<input value={draft.facilitator_name || ''} onChange={event => update('facilitator_name', event.target.value)} className="mt-1 w-full rounded border border-border bg-surface p-2" /></label><label>WhatsApp<input value={draft.facilitator_whatsapp || ''} onChange={event => update('facilitator_whatsapp', event.target.value)} className="mt-1 w-full rounded border border-border bg-surface p-2" /></label></div>
    <label className="block">Modalidad<select value={draft.modality} onChange={event => update('modality', event.target.value as Draft['modality'])} className="mt-1 w-full rounded border border-border bg-surface p-2"><option value="presencial">Presencial</option><option value="virtual">Virtual</option><option value="hybrid">Híbrida</option></select></label>
    {needsLocation && <><label className="block">Ubicación<input value={draft.physical_location || ''} onChange={event => update('physical_location', event.target.value)} className="mt-1 w-full rounded border border-border bg-surface p-2" /></label><label className="block">Maps URL (opcional)<input value={draft.maps_url || ''} onChange={event => update('maps_url', event.target.value)} className="mt-1 w-full rounded border border-border bg-surface p-2" /></label>{draft.physical_location && <button type="button" onClick={() => update('physical_location', null)} className="text-primary underline">Limpiar ubicación</button>}</>}
    {needsVirtual && <><label className="block">URL virtual privada<input value={draft.private_virtual_url || ''} onChange={event => update('private_virtual_url', event.target.value)} className="mt-1 w-full rounded border border-border bg-surface p-2" /></label>{draft.private_virtual_url && <button type="button" onClick={() => update('private_virtual_url', null)} className="text-primary underline">Limpiar URL virtual</button>}</>}
    <div className="grid grid-cols-2 gap-2"><label>Zona horaria<input value={draft.timezone || ''} onChange={event => update('timezone', event.target.value)} className="mt-1 w-full rounded border border-border bg-surface p-2" /></label><label>Cupo total<input type="number" min="1" value={draft.total_capacity} onChange={event => update('total_capacity', Number(event.target.value))} className="mt-1 w-full rounded border border-border bg-surface p-2" /></label></div><p className="text-text/60">Esta fase crea actividades gratuitas. Los pagos se configurarán después.</p>
    <section className="space-y-2 border-t border-border/40 pt-2"><div className="flex items-center justify-between"><span className="font-semibold">Sesiones</span><button type="button" onClick={() => update('sessions', [...draft.sessions, blankSession()])} className="text-primary underline">Agregar</button></div>{draft.sessions.map((session,index) => <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2"><input aria-label={`Inicio sesión ${index + 1}`} type="datetime-local" value={session.starts_at} onChange={event => update('sessions', draft.sessions.map((item, i) => i === index ? { ...item, starts_at: event.target.value } : item))} className="rounded border border-border bg-surface p-2"/><input aria-label={`Fin sesión ${index + 1}`} type="datetime-local" value={session.ends_at} onChange={event => update('sessions', draft.sessions.map((item, i) => i === index ? { ...item, ends_at: event.target.value } : item))} className="rounded border border-border bg-surface p-2"/><button type="button" disabled={draft.sessions.length === 1} onClick={() => update('sessions', draft.sessions.filter((_, i) => i !== index))} className="text-primary underline disabled:text-text/30">Eliminar</button></div>)}</section>
    {error && <p role="alert" className="rounded bg-red-50 p-2 text-red-700">{error}</p>}{state === 'success' && <p className="text-green-700">Actividad guardada.</p>}<button type="button" disabled={state === 'saving'} onClick={submit} className="w-full rounded bg-primary px-3 py-2 font-semibold text-primary-foreground disabled:opacity-50">{state === 'saving' ? 'Guardando…' : 'Guardar actividad'}</button>
  </div>;
};
