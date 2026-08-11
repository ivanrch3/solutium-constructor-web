import React from 'react';
import {
  createPublicReservasWebHold,
  PublicReservasWebHoldError,
  type PublicReservasWebActivity,
  type PublicReservasWebHold
} from '../../../services/reservasWebPublicApi';
import { createReservasWebBookingDraft, ReservasWebBookingForm, type ReservasWebBookingDraft } from './ReservasWebBookingForm';

type BookingState = 'idle' | 'choosing_quantity' | 'creating_hold' | 'hold_active' | 'hold_expired' | 'error';
type ReservasWebBookingStartProps = { moduleId: string; publicIdentifier: string; activity: PublicReservasWebActivity; label: string; ctaBackgroundColor: string; ctaTextColor: string; onRefreshActivity: () => void };

const createIdempotencyKey = () => crypto.randomUUID();

const publicErrorMessage = (error: unknown) => {
  if (!(error instanceof PublicReservasWebHoldError)) return 'No se pudo iniciar la reserva temporal. Inténtalo de nuevo.';
  if (error.code === 'NO_CAPACITY') return 'Ya no hay suficientes espacios disponibles para esa cantidad.';
  if (error.code === 'PUBLIC_ACTIVITY_UNAVAILABLE') return 'Esta actividad no está disponible.';
  if (error.status === 429) return 'Hay demasiados intentos. Espera un momento antes de continuar.';
  if (error.code === 'INVALID_HOLD_REQUEST' || error.code.startsWith('INVALID_')) return 'La cantidad seleccionada no es válida.';
  return 'No se pudo iniciar la reserva temporal. Inténtalo de nuevo.';
};

const isAmbiguousFailure = (error: unknown) => !(error instanceof PublicReservasWebHoldError) || error.status === 0 || error.status >= 500;

export const getHoldCountdownLabel = (expiresAt: string, now = Date.now()) => {
  const milliseconds = Date.parse(expiresAt) - now;
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) return null;
  const seconds = Math.ceil(milliseconds / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
};

export const ReservasWebBookingStart = ({ moduleId, publicIdentifier, activity, label, ctaBackgroundColor, ctaTextColor, onRefreshActivity }: ReservasWebBookingStartProps) => {
  const maximum = Math.max(1, Math.min(100, typeof activity.capacity.available === 'number' ? activity.capacity.available : 100));
  const [state, setState] = React.useState<BookingState>('idle');
  const [quantity, setQuantity] = React.useState(1);
  const [hold, setHold] = React.useState<PublicReservasWebHold | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<ReservasWebBookingDraft>(() => createReservasWebBookingDraft(1));
  const idempotencyKeyRef = React.useRef<string | null>(null);
  const [now, setNow] = React.useState(Date.now());

  React.useEffect(() => {
    if (state !== 'hold_active' || !hold) return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [hold, state]);

  React.useEffect(() => {
    if (state !== 'hold_active' || !hold || getHoldCountdownLabel(hold.expiresAt, now)) return;
    setHold(null);
    idempotencyKeyRef.current = null;
    setMessage('El tiempo de reserva temporal terminó.');
    setState('hold_expired');
    onRefreshActivity();
  }, [hold, now, onRefreshActivity, state]);

  const startHold = async () => {
    if (!activity.booking.enabled || state === 'creating_hold' || quantity < 1 || quantity > maximum) return;
    const idempotencyKey = idempotencyKeyRef.current || createIdempotencyKey();
    idempotencyKeyRef.current = idempotencyKey;
    setState('creating_hold');
    setMessage(null);
    try {
      const nextHold = await createPublicReservasWebHold(publicIdentifier, quantity, idempotencyKey);
      setDraft((current) => createReservasWebBookingDraft(nextHold.quantity, current));
      setHold(nextHold);
      setState('hold_active');
      onRefreshActivity();
    } catch (error) {
      if (!isAmbiguousFailure(error)) idempotencyKeyRef.current = null;
      if (error instanceof PublicReservasWebHoldError && (error.code === 'NO_CAPACITY' || error.code === 'PUBLIC_ACTIVITY_UNAVAILABLE')) onRefreshActivity();
      setMessage(publicErrorMessage(error));
      setState('error');
    }
  };

  if (state === 'hold_active' && hold) {
    const countdown = getHoldCountdownLabel(hold.expiresAt, now);
    return <ReservasWebBookingForm moduleId={moduleId} activityTitle={activity.title} quantity={hold.quantity} countdown={countdown || '00:00'} draft={draft} onDraftChange={setDraft} onChangeQuantity={() => { setHold(null); idempotencyKeyRef.current = null; setState('choosing_quantity'); }} />;
  }

  if (state === 'choosing_quantity' || state === 'creating_hold' || state === 'error') {
    return <div className="space-y-3 rounded-lg border border-border/60 p-3">
      <label className="block text-sm font-semibold" htmlFor={`${moduleId}-quantity`}>¿Cuántas personas desea reservar?</label>
      <input id={`${moduleId}-quantity`} type="number" min={1} max={maximum} value={quantity} disabled={state === 'creating_hold'} onChange={(event) => setQuantity(Math.min(maximum, Math.max(1, Number(event.target.value) || 1)))} className="w-full rounded-lg border border-border bg-background px-3 py-2" />
      {message && <p role="status" className="text-sm text-text/70">{message}</p>}
      <div className="flex gap-2"><button type="button" disabled={state === 'creating_hold'} onClick={() => { idempotencyKeyRef.current = null; setMessage(null); setState('idle'); }} className="rounded-lg border border-border px-3 py-2 text-sm">Cancelar</button><button type="button" disabled={state === 'creating_hold'} onClick={() => void startHold()} style={{ backgroundColor: ctaBackgroundColor || undefined, color: ctaTextColor || undefined }} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">{state === 'creating_hold' ? 'Reservando…' : state === 'error' && idempotencyKeyRef.current ? 'Reintentar' : 'Continuar'}</button></div>
    </div>;
  }

  return <div className="space-y-2"><button type="button" disabled={!activity.booking.enabled} onClick={() => { if (state !== 'hold_expired') setQuantity(1); setMessage(null); setState('choosing_quantity'); }} style={{ backgroundColor: ctaBackgroundColor || undefined, color: ctaTextColor || undefined }} className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50">{state === 'hold_expired' ? 'Reservar espacios de nuevo' : label}</button>{state === 'hold_expired' && message && <p role="status" className="text-sm text-text/70">{message}</p>}</div>;
};
