import { useState } from 'react';
import type { Product } from '../../../types/schema';
import { isReservasWebActivityArchived, type ReservasWebActivitySummary, type ReservasWebEligibleWhatsAppChannel, type ReservasWebWhatsAppReadiness } from '../../../types/reservasWeb';
import { getReservasWebActivity, type ReservasWebActivityAdminDetail } from '../../../services/reservasWebAdminApi';
import { ReservasWebActivityForm, type ReservasWebActivityFormMode } from './ReservasWebActivityForm';
import {
  getReservasWebConfigSettingKey,
  normalizeReservasWebConfig,
  setReservasWebActivityIds,
  type ReservasWebConfigV1
} from './reservasWebConfig';

const readinessMessages: Record<ReservasWebWhatsAppReadiness, string> = {
  ready: 'Canal Genius listo',
  unavailable: 'Reservas Web requiere una conexión Genius activa.',
  selection_required: 'Hay varias conexiones Genius disponibles. Debe seleccionarse una en la configuración de la actividad.',
  invalid_selection: 'La conexión Genius seleccionada ya no está disponible.'
};

export const getReservasWebWhatsAppReadinessMessage = (readiness: ReservasWebWhatsAppReadiness): string => readinessMessages[readiness];
export const getReservasWebActivityReadinessMessage = (activity: ReservasWebActivitySummary): string => {
  if (isReservasWebActivityArchived(activity)) return 'Esta actividad está archivada y no puede recibir nuevas reservas.';
  if (activity.bookable === true) return activity.status === 'active'
    ? 'LISTA PARA RESERVAS · No hay configuraciones pendientes.'
    : 'LISTA PARA PUBLICAR · No hay configuraciones pendientes.';
  return getReservasWebWhatsAppReadinessMessage(activity.whatsappReadiness);
};

export const formatReservasWebSessionSummary = (activity: ReservasWebActivitySummary): string => {
  const { count, firstStartsAt } = activity.sessionsSummary;
  if (!count) return 'Sin sesiones programadas';
  if (!firstStartsAt) return `${count} sesión${count === 1 ? '' : 'es'}`;
  const date = new Date(firstStartsAt);
  return `${Number.isNaN(date.getTime()) ? firstStartsAt : date.toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short', timeZone: activity.timezone || undefined })}${count > 1 ? ` · ${count} sesiones` : ''}`;
};

export const formatReservasWebPrice = (activity: ReservasWebActivitySummary): string => {
  if (activity.isFree) return 'Gratis';
  const amount = activity.promotionalPrice ?? activity.regularPrice;
  return amount === null ? 'Precio no disponible' : new Intl.NumberFormat('es', { style: 'currency', currency: activity.currency || 'USD' }).format(amount);
};

type ReservasWebSettingsProps = { moduleId: string; projectId?: string | null; products?: Product[]; settingsValues: Record<string, unknown>; reservasWebActivities?: ReservasWebActivitySummary[]; reservasWebEligibleWhatsAppChannels?: ReservasWebEligibleWhatsAppChannel[]; onActivitiesRefreshed?: (activities: ReservasWebActivitySummary[]) => void; onSettingChange: (elementId: string, settingId: string, value: unknown) => void; };
type ToggleKey = keyof ReservasWebConfigV1['display'];

const asSummary = (detail: ReservasWebActivityAdminDetail): ReservasWebActivitySummary => ({ id: detail.id, catalogItemId: detail.catalogItemId, catalogItemName: detail.catalogItem?.name || null, catalogItemImageUrl: detail.catalogItem?.imageUrl || null, title: detail.title || '', shortDescription: detail.shortDescription, facilitator: detail.facilitator, modality: detail.modality, status: detail.archivedAt ? 'archived' : detail.status, archivedAt: detail.archivedAt, bookable: detail.readiness.bookable, readinessReasons: detail.readiness.reasons, timezone: detail.timezone, sessionsSummary: { count: detail.sessions.length, firstStartsAt: detail.sessions[0]?.startAt || detail.sessions[0]?.starts_at || null, firstEndsAt: detail.sessions[0]?.endAt || detail.sessions[0]?.ends_at || null }, totalCapacity: detail.totalCapacity, isFree: detail.isFree, regularPrice: detail.regularPrice, promotionalPrice: detail.promotionalPrice, promotionEndsAt: detail.promotionEndsAt, currency: detail.currency, selectedWhatsAppChannelId: detail.selectedWhatsappChannelId, whatsappReadiness: ['ready','unavailable','selection_required','invalid_selection'].includes(detail.readiness.whatsapp) ? detail.readiness.whatsapp as ReservasWebWhatsAppReadiness : 'unavailable' });

export const ReservasWebSettings = ({ moduleId, projectId = null, products = [], settingsValues, reservasWebActivities = [], reservasWebEligibleWhatsAppChannels = [], onActivitiesRefreshed, onSettingChange }: ReservasWebSettingsProps) => {
  const configKey = getReservasWebConfigSettingKey(moduleId);
  const config = normalizeReservasWebConfig(settingsValues[configKey]);
  const selectedActivityId = config.activities.activityIds[0] || '';
  const selectedActivity = reservasWebActivities.find((activity) => activity.id === selectedActivityId) || null;
  const selectableActivities = reservasWebActivities.filter(activity => !isReservasWebActivityArchived(activity) || activity.id === selectedActivityId);
  const persist = (nextConfig: ReservasWebConfigV1) => onSettingChange(moduleId, 'el_reservas_web_config', nextConfig);
  const updateDisplay = (key: ToggleKey, value: boolean) => persist({ ...config, display: { ...config.display, [key]: value } });
  const persistActivityId = (activityId: string | null) => persist(setReservasWebActivityIds(config, activityId ? [activityId] : []));
  const [form, setForm] = useState<{ mode: ReservasWebActivityFormMode; detail?: ReservasWebActivityAdminDetail } | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const openEdit = async () => { if (!projectId || !selectedActivityId) return; setLoadingDetail(true); try { setForm({ mode: 'edit', detail: await getReservasWebActivity(projectId, selectedActivityId) }); } finally { setLoadingDetail(false); } };
  const saved = async (detail: ReservasWebActivityAdminDetail) => { const summary = asSummary(detail); const next = [...reservasWebActivities.filter(item => item.id !== detail.id), summary]; onActivitiesRefreshed?.(next); if (form?.mode === 'create') persistActivityId(detail.id); setForm(null); };

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-border/40 bg-surface p-3 text-sm text-text">
      <section className="space-y-2"><h3 className="text-xs font-semibold">Actividad</h3>
        <label className="block space-y-1"><span className="text-xs">Actividad</span><select value={selectedActivityId} onChange={(event) => persistActivityId(event.target.value || null)} className="w-full rounded-lg border border-border bg-background px-3 py-2"><option value="">Selecciona una actividad</option>{selectableActivities.map((activity) => <option key={activity.id} value={activity.id}>{activity.title} · {activity.catalogItemName || 'Sin item de catálogo'} · {activity.modality || 'Sin modalidad'}{isReservasWebActivityArchived(activity) ? ' · Archivada' : ''}</option>)}</select></label>
        <div className="flex gap-2"><button type="button" disabled={!projectId} onClick={() => setForm({ mode: 'create' })} className="rounded border border-primary/40 px-2 py-1 font-semibold text-primary disabled:opacity-40">Crear actividad</button><button type="button" disabled={!projectId || !selectedActivityId || loadingDetail} onClick={openEdit} className="rounded border border-border px-2 py-1 font-semibold disabled:opacity-40">{loadingDetail ? 'Cargando…' : 'Editar actividad'}</button></div>
        {form && projectId && <ReservasWebActivityForm mode={form.mode} projectId={projectId} products={products} detail={form.detail} eligibleWhatsAppChannels={reservasWebEligibleWhatsAppChannels} onClose={() => setForm(null)} onSaved={saved} />}
        {reservasWebActivities.length === 0 && <p className="rounded-lg bg-secondary/50 p-3 text-xs">No hay actividades configuradas para Reservas Web.</p>}
        {selectedActivityId && !selectedActivity && <div className="space-y-2 rounded-lg border border-border/40 bg-secondary/50 p-3 text-xs"><p>La actividad seleccionada ya no está disponible.</p><button type="button" onClick={() => persistActivityId(null)} className="font-semibold text-primary underline">Limpiar selección</button></div>}
        {selectedActivity && <div className="space-y-2 rounded-lg border border-border/40 p-3 text-xs"><p className="font-semibold">{selectedActivity.catalogItemName || 'Sin item de catálogo'}{isReservasWebActivityArchived(selectedActivity) ? ' · Archivada' : ''}</p><p>{selectedActivity.facilitator || 'Facilitador no definido'} · {selectedActivity.modality || 'Modalidad no definida'}</p><p>{formatReservasWebSessionSummary(selectedActivity)}</p><p>Capacidad total: {selectedActivity.totalCapacity ?? 'No definida'}</p><p>{formatReservasWebPrice(selectedActivity)}</p><p>{getReservasWebActivityReadinessMessage(selectedActivity)}</p><button type="button" onClick={() => persistActivityId(null)} className="font-semibold text-primary underline">Cambiar actividad</button></div>}
      </section>

      {(selectedActivity || form) && <><section className="space-y-2 border-t border-border/40 pt-3"><h3 className="text-xs font-semibold">Visualización</h3>
        {([['showPrice', 'Mostrar precio'], ['showTotalCapacity', 'Mostrar capacidad total'], ['showAvailableCapacity', 'Mostrar disponibilidad'], ['showCountdown', 'Mostrar cuenta regresiva']] as const).map(([key, label]) => <label key={key} className="flex items-center justify-between gap-3"><span>{label}</span><input type="checkbox" checked={config.display[key]} onChange={(event) => updateDisplay(key, event.target.checked)} /></label>)}
      </section>

      <section className="space-y-2 border-t border-border/40 pt-3"><h3 className="text-xs font-semibold">Botón</h3>
        <label className="block space-y-1"><span className="text-xs">Texto del CTA</span><input value={config.content.reserveButtonLabel} maxLength={60} onChange={(event) => persist({ ...config, content: { reserveButtonLabel: event.target.value } })} className="w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
      </section></>}
    </div>
  );
};
