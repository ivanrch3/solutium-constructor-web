import { isReservasWebActivityArchived, type ReservasWebActivitySummary } from '../../../types/reservasWeb';
import type { ReservasWebConfigV1 } from './reservasWebConfig';
import { formatReservasWebMoney } from '../../../utils/reservasWebMoney';

type ReservasWebPreviewProps = {
  moduleId: string;
  config: ReservasWebConfigV1;
  reservasWebActivities?: ReservasWebActivitySummary[];
};

const formatSessionSummary = (activity: ReservasWebActivitySummary): string => {
  const { count, firstStartsAt, firstEndsAt } = activity.sessionsSummary;
  if (!count) return 'Sin sesiones programadas';
  if (!firstStartsAt) return `${count} sesión${count === 1 ? '' : 'es'}`;
  const start = new Date(firstStartsAt);
  const startLabel = Number.isNaN(start.getTime()) ? firstStartsAt : start.toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short', timeZone: activity.timezone || undefined });
  if (!firstEndsAt) return count > 1 ? `${startLabel} · Varias sesiones (${count})` : startLabel;
  const end = new Date(firstEndsAt);
  const endLabel = Number.isNaN(end.getTime()) ? firstEndsAt : end.toLocaleTimeString('es', { timeStyle: 'short', timeZone: activity.timezone || undefined });
  return `${startLabel} – ${endLabel}${count > 1 ? ` · Varias sesiones (${count})` : ''}`;
};

const formatPrice = (activity: ReservasWebActivitySummary): { regular: string; promotional: string | null } => {
  if (activity.isFree) return { regular: 'Gratis', promotional: null };
  const regular = activity.regularPrice === null ? 'Precio no disponible' : formatReservasWebMoney(activity.regularPrice, activity.currency);
  const promotionIsActive = activity.promotionalPrice !== null && (!activity.promotionEndsAt || new Date(activity.promotionEndsAt).getTime() >= Date.now());
  return { regular, promotional: promotionIsActive ? formatReservasWebMoney(activity.promotionalPrice!, activity.currency) : null };
};

export const ReservasWebPreview = ({ moduleId, config, reservasWebActivities = [] }: ReservasWebPreviewProps) => {
  const activityId = config.activities.activityIds[0] || null;
  const activity = activityId ? reservasWebActivities.find((candidate) => candidate.id === activityId) || null : null;

  if (!activityId) return <section data-module-id={moduleId} className="rounded-2xl border border-dashed border-border/60 bg-surface p-8 text-center text-text"><p>Selecciona una actividad para configurar Reservas Web.</p></section>;
  if (!activity) return <section data-module-id={moduleId} className="rounded-2xl border border-dashed border-border/60 bg-surface p-8 text-center text-text"><p>La actividad seleccionada ya no está disponible.</p></section>;

  const title = activity.title || activity.catalogItemName || 'Actividad';
  const price = formatPrice(activity);
  // Constructor preview intentionally accepts a configured draft. Public booking
  // still applies the stricter active/readiness checks on the public endpoint.
  const unavailable = isReservasWebActivityArchived(activity) || activity.whatsappReadiness !== 'ready';

  return (
    <section data-module-id={moduleId} className="mx-auto w-full max-w-xl overflow-hidden rounded-2xl border bg-surface text-text shadow-sm">
      {activity.catalogItemImageUrl ? <img src={activity.catalogItemImageUrl} alt={title} className="h-52 w-full object-cover" /> : <div role="img" aria-label={`Imagen no disponible para ${title}`} className="h-44 w-full bg-secondary" />}
      <div className="space-y-4 p-5">
        <div className="space-y-2"><h2 className="text-xl font-bold">{title}</h2>{activity.shortDescription && <p className="text-sm text-text/70">{activity.shortDescription}</p>}</div>
        <dl className="space-y-2 text-sm">
          {activity.facilitator && <div><dt className="font-semibold">Facilitador</dt><dd>{activity.facilitator}</dd></div>}
          {activity.modality && <div><dt className="font-semibold">Modalidad</dt><dd>{activity.modality}</dd></div>}
          <div><dt className="font-semibold">Sesiones</dt><dd>{formatSessionSummary(activity)}</dd></div>
          {config.display.showPrice && <div><dt className="font-semibold">Precio</dt><dd>{price.promotional ? <><span className="line-through text-text/50">{price.regular}</span> <span className="font-semibold">{price.promotional}</span></> : price.regular}</dd></div>}
          {config.display.showTotalCapacity && <div><dt className="font-semibold">Cupos</dt><dd>Capacidad total: {activity.totalCapacity ?? 'No definida'}</dd></div>}
          {config.display.showAvailableCapacity && <div><dt className="font-semibold">Disponibilidad</dt><dd>Disponibilidad en tiempo real</dd></div>}
          {config.display.showCountdown && <div><dt className="font-semibold">Cuenta regresiva</dt><dd>Vista previa de cuenta regresiva</dd></div>}
        </dl>
        {unavailable && <p className="rounded-lg bg-secondary p-3 text-xs">No disponible para reservas</p>}
        <button type="button" disabled={unavailable} aria-label={config.content.reserveButtonLabel} onClick={(event) => event.preventDefault()} className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50">{config.content.reserveButtonLabel}</button>
      </div>
    </section>
  );
};
