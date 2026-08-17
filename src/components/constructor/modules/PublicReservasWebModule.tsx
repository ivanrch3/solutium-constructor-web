import React from 'react';
import type { ReservasWebPublishedSnapshot } from './reservasWebPublishedContract';
import { getPublicReservasWebActivity, type PublicReservasWebActivity } from '../../../services/reservasWebPublicApi';
import { getPrimaryPublicReservasWebActivityIdentifier } from './reservasWebPublicContract';
import { ReservasWebBookingStart } from './ReservasWebBookingStart';
import { ReservasWebWaitlistForm } from './ReservasWebWaitlistForm';

type PublicReservasWebModuleProps = { moduleId: string; snapshot: ReservasWebPublishedSnapshot | null; enabled: boolean };

const localDay = (value: number, timeZone: string) => new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
export const getPublicReservasWebCountdown = (target: string | null, now = Date.now(), timeZone = 'America/Costa_Rica'): string | null => {
  if (!target) return null;
  const targetTime = Date.parse(target);
  if (!Number.isFinite(targetTime) || targetTime <= now) return null;
  const difference = targetTime - now;
  if (localDay(targetTime, timeZone) === localDay(now, timeZone)) return 'El taller es hoy';
  const days = Math.floor(difference / 86_400_000);
  const hours = Math.floor((difference % 86_400_000) / 3_600_000);
  const minutes = Math.floor((difference % 3_600_000) / 60_000);
  return days > 0 ? `${days} d ${hours} h ${minutes} min` : hours > 0 ? `${hours} h ${minutes} min` : `${Math.max(1, minutes)} min`;
};

const formatSession = (session: PublicReservasWebActivity['sessions'][number], timezone: string) => {
  const start = new Date(session.startsAt);
  const end = new Date(session.endsAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  return `${start.toLocaleDateString('es', { dateStyle: 'medium', timeZone: timezone })} · ${start.toLocaleTimeString('es', { timeStyle: 'short', timeZone: timezone })} – ${end.toLocaleTimeString('es', { timeStyle: 'short', timeZone: timezone })}`;
};

const formatPrice = (activity: PublicReservasWebActivity) => activity.pricing.isFree
  ? 'Gratis'
  : new Intl.NumberFormat('es', { style: 'currency', currency: activity.pricing.currency }).format(activity.pricing.effectivePrice);
const formatMoney = (amount: number, currency: string) => new Intl.NumberFormat('es', { style: 'currency', currency }).format(amount);

export const PublicReservasWebActivityContent = ({ moduleId, snapshot, activity, onRefreshActivity = () => {} }: { moduleId: string; snapshot: ReservasWebPublishedSnapshot; activity: PublicReservasWebActivity; onRefreshActivity?: () => void }) => {
  const countdown = snapshot.display.showCountdown ? getPublicReservasWebCountdown(activity.countdownTarget, Date.now(), activity.timezone) : null;
  const unavailable = !activity.booking.enabled && !activity.waitlist.enabled;
  const sessions = activity.sessions.map((session) => formatSession(session, activity.timezone)).filter((session): session is string => Boolean(session));
  const depositAmount = activity.pricing.paymentOptions?.includes('deposit') ? activity.pricing.depositAmountPerPerson : null;
  const requiredReservationAmount = typeof depositAmount === 'number' ? depositAmount : activity.pricing.requiredAmount;
  const available = activity.capacity.available;
  const showNumericAvailability = activity.capacity.visible && snapshot.display.showAvailableCapacity && typeof available === 'number' && available > 0 && available <= 10;

  return <section data-module-id={moduleId} style={{ backgroundColor: snapshot.style.surfaceColor || undefined, borderColor: snapshot.style.borderColor || undefined, borderRadius: snapshot.style.borderRadius }} className="mx-auto w-full max-w-xl overflow-hidden border bg-surface text-text shadow-sm">
    {activity.image ? <img src={activity.image} alt={activity.title} className="block w-full aspect-[3/1] object-cover" /> : <div role="img" aria-label={`Imagen no disponible para ${activity.title}`} className="w-full aspect-[3/1] bg-secondary" />}
    <div style={{ padding: snapshot.style.padding }} className="space-y-4">
      <div className="space-y-2"><h2 className="text-xl font-bold">{activity.title}</h2>{activity.shortDescription && <p className="text-sm text-text/70">{activity.shortDescription}</p>}</div>
      <dl className="space-y-2 text-sm">
        {activity.facilitator && <div><dt className="font-semibold">Facilitador</dt><dd>{activity.facilitator}</dd></div>}
        {activity.modality && activity.modality.toLocaleLowerCase('es') !== 'presencial' && <div><dt className="font-semibold">Modalidad</dt><dd>{activity.modality}</dd></div>}
        {sessions.length > 0 && <div><dt className="font-semibold">Sesiones</dt><dd className="space-y-1">{sessions.map((session, index) => <div key={`${session}-${index}`}>{session}</div>)}</dd></div>}
        {activity.location && <div><dt className="font-semibold">Ubicación</dt><dd>{activity.maps ? <a href={activity.maps} target="_blank" rel="noreferrer" className="underline">{activity.location}</a> : activity.location}</dd></div>}
        {snapshot.display.showPrice && <><div><dt className="font-semibold">Precio por persona</dt><dd>{formatPrice(activity)}</dd></div>{!activity.pricing.isFree && typeof requiredReservationAmount === 'number' && <div><dt className="font-semibold">Pago requerido para reservar</dt><dd>{formatMoney(requiredReservationAmount, activity.pricing.currency)} por persona</dd>{typeof depositAmount === 'number' && <dd>El monto de reserva es {activity.pricing.depositRefundable ? 'reembolsable' : 'no reembolsable'}.</dd>}</div>}</>}
        {activity.capacity.visible && !showNumericAvailability && <div><dt className="font-semibold">Cupos</dt><dd>Limitados</dd></div>}
        {showNumericAvailability && <div><dt className="font-semibold">Disponibilidad</dt><dd>{available === 1 ? 'Queda 1 espacio' : `Quedan ${available} espacios`}</dd></div>}
        {countdown && <div><dt className="font-semibold">Inicio del evento en:</dt><dd>{countdown}</dd></div>}
      </dl>
      {unavailable && <p id={`${moduleId}-booking-status`} className="rounded-lg bg-secondary p-3 text-xs">Esta actividad no está disponible.</p>}
      {activity.booking.enabled ? <ReservasWebBookingStart moduleId={moduleId} publicIdentifier={activity.publicId} activity={activity} label={snapshot.content.reserveButtonLabel} ctaBackgroundColor={snapshot.style.ctaBackgroundColor} ctaTextColor={snapshot.style.ctaTextColor} onRefreshActivity={onRefreshActivity} /> : activity.waitlist.enabled ? <ReservasWebWaitlistForm moduleId={moduleId} publicIdentifier={activity.publicId} enabled={activity.waitlist.enabled} ctaBackgroundColor={snapshot.style.ctaBackgroundColor} ctaTextColor={snapshot.style.ctaTextColor} onRefreshActivity={onRefreshActivity} /> : null}
    </div>
  </section>;
};

const PublicReservasWebUnavailable = ({ moduleId, message }: { moduleId: string; message: string }) => <section data-module-id={moduleId} className="mx-auto w-full max-w-xl rounded-2xl border border-border/60 bg-surface p-8 text-center text-text"><p>{message}</p></section>;

export const PublicReservasWebModule = ({ moduleId, snapshot, enabled }: PublicReservasWebModuleProps) => {
  const identifier = getPrimaryPublicReservasWebActivityIdentifier(snapshot);
  const [state, setState] = React.useState<{ status: 'loading' | 'ready' | 'unavailable' | 'error'; activity: PublicReservasWebActivity | null }>(() => ({
    status: enabled && identifier ? 'loading' : 'unavailable',
    activity: null
  }));
  const [refreshVersion, setRefreshVersion] = React.useState(0);

  React.useEffect(() => {
    if (!enabled || !identifier) {
      setState({ status: 'unavailable', activity: null });
      return;
    }
    const controller = new AbortController();
    setState((current) => current.activity ? current : { status: 'loading', activity: null });
    void getPublicReservasWebActivity(identifier, controller.signal).then((activity) => {
      if (!controller.signal.aborted) setState(activity ? { status: 'ready', activity } : { status: 'unavailable', activity: null });
    }).catch(() => {
      if (!controller.signal.aborted) setState({ status: 'error', activity: null });
    });
    return () => controller.abort();
  }, [enabled, identifier, refreshVersion]);

  if (state.status === 'loading') return <PublicReservasWebUnavailable moduleId={moduleId} message="Cargando actividad…" />;
  if (state.status === 'unavailable') return <PublicReservasWebUnavailable moduleId={moduleId} message="Esta actividad no está disponible." />;
  if (state.status === 'error') return <PublicReservasWebUnavailable moduleId={moduleId} message="No se pudo cargar la actividad. Inténtalo de nuevo más tarde." />;
  return snapshot && state.activity ? <PublicReservasWebActivityContent moduleId={moduleId} snapshot={snapshot} activity={state.activity} onRefreshActivity={() => setRefreshVersion((version) => version + 1)} /> : <PublicReservasWebUnavailable moduleId={moduleId} message="Esta actividad no está disponible." />;
};
