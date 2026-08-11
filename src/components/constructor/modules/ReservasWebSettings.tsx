import type { ReservasWebActivitySummary, ReservasWebWhatsAppReadiness } from '../../../types/reservasWeb';
import {
  getReservasWebConfigSettingKey,
  normalizeReservasWebConfig,
  setReservasWebActivityIds
} from './reservasWebConfig';

const readinessMessages: Record<ReservasWebWhatsAppReadiness, string> = {
  ready: 'Canal Genius listo',
  unavailable: 'Reservas Web requiere una conexión Genius activa.',
  selection_required: 'Hay varias conexiones Genius disponibles. Debe seleccionarse una en la configuración de la actividad.',
  invalid_selection: 'La conexión Genius seleccionada ya no está disponible.'
};

export const getReservasWebWhatsAppReadinessMessage = (readiness: ReservasWebWhatsAppReadiness): string =>
  readinessMessages[readiness];

export const formatReservasWebSessionSummary = (activity: ReservasWebActivitySummary): string => {
  const { count, firstStartsAt } = activity.sessionsSummary;
  if (!count) return 'Sin sesiones programadas';
  if (!firstStartsAt) return `${count} sesión${count === 1 ? '' : 'es'}`;
  const date = new Date(firstStartsAt);
  const dateLabel = Number.isNaN(date.getTime()) ? firstStartsAt : date.toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' });
  return `${dateLabel}${count > 1 ? ` · ${count} sesiones` : ''}`;
};

export const formatReservasWebPrice = (activity: ReservasWebActivitySummary): string => {
  if (activity.isFree) return 'Gratis';
  const amount = activity.promotionalPrice ?? activity.regularPrice;
  if (amount === null) return 'Precio no disponible';
  return new Intl.NumberFormat('es', { style: 'currency', currency: activity.currency || 'USD' }).format(amount);
};

type ReservasWebSettingsProps = {
  moduleId: string;
  settingsValues: Record<string, unknown>;
  reservasWebActivities?: ReservasWebActivitySummary[];
  onSettingChange: (elementId: string, settingId: string, value: unknown) => void;
};

export const ReservasWebSettings = ({
  moduleId,
  settingsValues,
  reservasWebActivities = [],
  onSettingChange
}: ReservasWebSettingsProps) => {
  const configKey = getReservasWebConfigSettingKey(moduleId);
  const config = normalizeReservasWebConfig(settingsValues[configKey]);
  const selectedActivityId = config.activities.activityIds[0] || '';
  const selectedActivity = reservasWebActivities.find((activity) => activity.id === selectedActivityId) || null;

  const persistActivityId = (activityId: string | null) => {
    onSettingChange(
      moduleId,
      'el_reservas_web_config',
      setReservasWebActivityIds(config, activityId ? [activityId] : [])
    );
  };

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-border/40 bg-surface p-3 text-sm text-text">
      <label className="block space-y-1">
        <span className="text-xs font-semibold">Actividad</span>
        <select
          value={selectedActivityId}
          onChange={(event) => persistActivityId(event.target.value || null)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2"
        >
          <option value="">Selecciona una actividad</option>
          {reservasWebActivities.map((activity) => (
            <option key={activity.id} value={activity.id}>
              {activity.title} · {activity.catalogItemName || 'Sin item de catálogo'} · {activity.modality || 'Sin modalidad'}
            </option>
          ))}
        </select>
      </label>

      {reservasWebActivities.length === 0 && (
        <p className="rounded-lg bg-secondary/50 p-3 text-xs">No hay actividades configuradas para Reservas Web.</p>
      )}

      {selectedActivityId && !selectedActivity && (
        <div className="space-y-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs">
          <p>La actividad seleccionada ya no está disponible.</p>
          <button type="button" onClick={() => persistActivityId(null)} className="font-semibold text-primary underline">
            Limpiar selección
          </button>
        </div>
      )}

      {selectedActivity && (
        <div className="space-y-2 rounded-lg border border-border/40 p-3 text-xs">
          <div className="flex gap-3">
            {selectedActivity.catalogItemImageUrl && (
              <img src={selectedActivity.catalogItemImageUrl} alt="" className="h-12 w-12 rounded-md object-cover" />
            )}
            <div>
              <p className="font-semibold">{selectedActivity.catalogItemName || 'Sin item de catálogo'}</p>
              <p>{selectedActivity.facilitator || 'Facilitador no definido'} · {selectedActivity.modality || 'Modalidad no definida'}</p>
            </div>
          </div>
          <p>{formatReservasWebSessionSummary(selectedActivity)}</p>
          <p>Capacidad total: {selectedActivity.totalCapacity ?? 'No definida'}</p>
          <p>{formatReservasWebPrice(selectedActivity)}</p>
          <p>{getReservasWebWhatsAppReadinessMessage(selectedActivity.whatsappReadiness)}</p>
          <button type="button" onClick={() => persistActivityId(null)} className="font-semibold text-primary underline">
            Cambiar actividad
          </button>
        </div>
      )}
    </div>
  );
};
