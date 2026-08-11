import type { ReservasWebActivitySummary, ReservasWebWhatsAppReadiness } from '../../../types/reservasWeb';
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

export const formatReservasWebSessionSummary = (activity: ReservasWebActivitySummary): string => {
  const { count, firstStartsAt } = activity.sessionsSummary;
  if (!count) return 'Sin sesiones programadas';
  if (!firstStartsAt) return `${count} sesión${count === 1 ? '' : 'es'}`;
  const date = new Date(firstStartsAt);
  return `${Number.isNaN(date.getTime()) ? firstStartsAt : date.toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' })}${count > 1 ? ` · ${count} sesiones` : ''}`;
};

export const formatReservasWebPrice = (activity: ReservasWebActivitySummary): string => {
  if (activity.isFree) return 'Gratis';
  const amount = activity.promotionalPrice ?? activity.regularPrice;
  return amount === null ? 'Precio no disponible' : new Intl.NumberFormat('es', { style: 'currency', currency: activity.currency || 'USD' }).format(amount);
};

type ReservasWebSettingsProps = { moduleId: string; settingsValues: Record<string, unknown>; reservasWebActivities?: ReservasWebActivitySummary[]; onSettingChange: (elementId: string, settingId: string, value: unknown) => void; };
type ToggleKey = keyof ReservasWebConfigV1['display'];

export const ReservasWebSettings = ({ moduleId, settingsValues, reservasWebActivities = [], onSettingChange }: ReservasWebSettingsProps) => {
  const configKey = getReservasWebConfigSettingKey(moduleId);
  const config = normalizeReservasWebConfig(settingsValues[configKey]);
  const selectedActivityId = config.activities.activityIds[0] || '';
  const selectedActivity = reservasWebActivities.find((activity) => activity.id === selectedActivityId) || null;
  const persist = (nextConfig: ReservasWebConfigV1) => onSettingChange(moduleId, 'el_reservas_web_config', nextConfig);
  const updateDisplay = (key: ToggleKey, value: boolean) => persist({ ...config, display: { ...config.display, [key]: value } });
  const updateStyle = (key: keyof ReservasWebConfigV1['style'], value: string | number) => persist({ ...config, style: { ...config.style, [key]: value } });
  const persistActivityId = (activityId: string | null) => persist(setReservasWebActivityIds(config, activityId ? [activityId] : []));

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-border/40 bg-surface p-3 text-sm text-text">
      <section className="space-y-2"><h3 className="text-xs font-semibold">Actividad</h3>
        <label className="block space-y-1"><span className="text-xs">Actividad</span><select value={selectedActivityId} onChange={(event) => persistActivityId(event.target.value || null)} className="w-full rounded-lg border border-border bg-background px-3 py-2"><option value="">Selecciona una actividad</option>{reservasWebActivities.map((activity) => <option key={activity.id} value={activity.id}>{activity.title} · {activity.catalogItemName || 'Sin item de catálogo'} · {activity.modality || 'Sin modalidad'}</option>)}</select></label>
        {reservasWebActivities.length === 0 && <p className="rounded-lg bg-secondary/50 p-3 text-xs">No hay actividades configuradas para Reservas Web.</p>}
        {selectedActivityId && !selectedActivity && <div className="space-y-2 rounded-lg border border-border/40 bg-secondary/50 p-3 text-xs"><p>La actividad seleccionada ya no está disponible.</p><button type="button" onClick={() => persistActivityId(null)} className="font-semibold text-primary underline">Limpiar selección</button></div>}
        {selectedActivity && <div className="space-y-2 rounded-lg border border-border/40 p-3 text-xs"><p className="font-semibold">{selectedActivity.catalogItemName || 'Sin item de catálogo'}</p><p>{selectedActivity.facilitator || 'Facilitador no definido'} · {selectedActivity.modality || 'Modalidad no definida'}</p><p>{formatReservasWebSessionSummary(selectedActivity)}</p><p>Capacidad total: {selectedActivity.totalCapacity ?? 'No definida'}</p><p>{formatReservasWebPrice(selectedActivity)}</p><p>{getReservasWebWhatsAppReadinessMessage(selectedActivity.whatsappReadiness)}</p><button type="button" onClick={() => persistActivityId(null)} className="font-semibold text-primary underline">Cambiar actividad</button></div>}
      </section>

      <section className="space-y-2 border-t border-border/40 pt-3"><h3 className="text-xs font-semibold">Visualización</h3>
        {([['showPrice', 'Mostrar precio'], ['showTotalCapacity', 'Mostrar capacidad total'], ['showAvailableCapacity', 'Mostrar disponibilidad'], ['showCountdown', 'Mostrar cuenta regresiva']] as const).map(([key, label]) => <label key={key} className="flex items-center justify-between gap-3"><span>{label}</span><input type="checkbox" checked={config.display[key]} onChange={(event) => updateDisplay(key, event.target.checked)} /></label>)}
      </section>

      <section className="space-y-2 border-t border-border/40 pt-3"><h3 className="text-xs font-semibold">Botón</h3>
        <label className="block space-y-1"><span className="text-xs">Texto del CTA</span><input value={config.content.reserveButtonLabel} maxLength={60} onChange={(event) => persist({ ...config, content: { reserveButtonLabel: event.target.value } })} className="w-full rounded-lg border border-border bg-background px-3 py-2" /></label>
      </section>

      <section className="space-y-2 border-t border-border/40 pt-3"><h3 className="text-xs font-semibold">Estilo</h3>
        <div className="grid grid-cols-2 gap-2"><label className="text-xs">Fondo<input aria-label="Color de fondo" type="color" value={config.style.surfaceColor || '#ffffff'} onChange={(event) => updateStyle('surfaceColor', event.target.value)} className="mt-1 block w-full" /></label><label className="text-xs">Borde<input aria-label="Color de borde" type="color" value={config.style.borderColor || '#cccccc'} onChange={(event) => updateStyle('borderColor', event.target.value)} className="mt-1 block w-full" /></label><label className="text-xs">CTA<input aria-label="Color CTA" type="color" value={config.style.ctaBackgroundColor || '#2563eb'} onChange={(event) => updateStyle('ctaBackgroundColor', event.target.value)} className="mt-1 block w-full" /></label><label className="text-xs">Texto CTA<input aria-label="Color texto CTA" type="color" value={config.style.ctaTextColor || '#ffffff'} onChange={(event) => updateStyle('ctaTextColor', event.target.value)} className="mt-1 block w-full" /></label></div>
        <label className="block text-xs">Radio {config.style.borderRadius}px<input aria-label="Radio del borde" type="range" min="0" max="32" value={config.style.borderRadius} onChange={(event) => updateStyle('borderRadius', Number(event.target.value))} className="block w-full" /></label>
        <label className="block text-xs">Espaciado {config.style.padding}px<input aria-label="Espaciado interno" type="range" min="12" max="40" value={config.style.padding} onChange={(event) => updateStyle('padding', Number(event.target.value))} className="block w-full" /></label>
      </section>
    </div>
  );
};
