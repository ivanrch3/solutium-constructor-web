import React from 'react';
import { joinPublicReservasWebWaitlist, PublicReservasWebHoldError } from '../../../services/reservasWebPublicApi';

type Props = { moduleId: string; publicIdentifier: string; enabled: boolean; ctaBackgroundColor: string; ctaTextColor: string; onRefreshActivity: () => void };
type Draft = { quantity: string; contactFirstName: string; contactLastName: string; contactWhatsapp: string };

const initial: Draft = { quantity: '1', contactFirstName: '', contactLastName: '', contactWhatsapp: '' };
const key = () => crypto.randomUUID();

const validate = (draft: Draft) => {
  const errors: Record<string, string> = {};
  const quantity = Number(draft.quantity);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) errors.quantity = 'Selecciona una cantidad entre 1 y 100.';
  if (!draft.contactFirstName.trim() || draft.contactFirstName.trim().length > 100) errors.contactFirstName = 'Ingresa un nombre válido.';
  if (!draft.contactLastName.trim() || draft.contactLastName.trim().length > 100) errors.contactLastName = 'Ingresa un apellido válido.';
  const digits = draft.contactWhatsapp.trim().replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 20) errors.contactWhatsapp = 'Ingresa un WhatsApp válido.';
  return errors;
};

const message = (error: unknown) => {
  const code = error instanceof PublicReservasWebHoldError ? error.code : '';
  if (code === 'CAPACITY_AVAILABLE') return 'Ahora hay espacios disponibles. Puedes realizar la reserva.';
  if (code === 'ACTIVITY_NOT_FOUND' || code === 'ACTIVITY_NOT_BOOKABLE' || code === 'BOOKING_CLOSED' || code === 'ACTIVITY_STARTED') return 'Esta actividad ya no está disponible.';
  if (code === 'INVALID_QUANTITY') return 'La cantidad seleccionada no es válida.';
  if (code === 'IDEMPOTENCY_CONFLICT') return 'No pudimos completar este intento. Vuelve a iniciar la solicitud.';
  if (error instanceof PublicReservasWebHoldError && error.status === 429) return 'Se realizaron demasiados intentos. Intenta nuevamente en unos minutos.';
  return 'No pudimos confirmar la solicitud. Puedes intentar nuevamente.';
};

export const ReservasWebWaitlistForm = ({ moduleId, publicIdentifier, enabled, ctaBackgroundColor, ctaTextColor, onRefreshActivity }: Props) => {
  const [state, setState] = React.useState<'idle' | 'form' | 'submitting' | 'success' | 'error'>('idle');
  const [draft, setDraft] = React.useState<Draft>(initial);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [notice, setNotice] = React.useState('');
  const [submittedQuantity, setSubmittedQuantity] = React.useState<number | null>(null);
  const [restartRequired, setRestartRequired] = React.useState(false);
  const idempotencyKey = React.useRef<string | null>(null);
  const update = (field: keyof Draft, value: string) => setDraft((current) => ({ ...current, [field]: value }));
  const submit = async () => {
    const next = validate(draft);
    setErrors(next);
    if (Object.keys(next).length || !enabled || state === 'submitting') return;
    const id = idempotencyKey.current || key();
    idempotencyKey.current = id;
    setState('submitting');
    setNotice('');
    try {
      const result = await joinPublicReservasWebWaitlist(publicIdentifier, { idempotencyKey: id, quantity: Number(draft.quantity), contactFirstName: draft.contactFirstName.trim(), contactLastName: draft.contactLastName.trim(), contactWhatsapp: draft.contactWhatsapp.trim() });
      setSubmittedQuantity(result.waitlist.quantity);
      setState('success');
    } catch (error) {
      setNotice(message(error));
      if (error instanceof PublicReservasWebHoldError && (error.code === 'CAPACITY_AVAILABLE' || error.code === 'ACTIVITY_NOT_FOUND' || error.code === 'ACTIVITY_NOT_BOOKABLE' || error.code === 'BOOKING_CLOSED' || error.code === 'ACTIVITY_STARTED')) {
        idempotencyKey.current = null;
        setState('idle');
        onRefreshActivity();
      } else {
        if (error instanceof PublicReservasWebHoldError && error.code === 'IDEMPOTENCY_CONFLICT') {
          idempotencyKey.current = null;
          setRestartRequired(true);
        }
        setState('error');
      }
    }
  };
  const cancel = () => {
    idempotencyKey.current = null;
    setRestartRequired(false);
    setState('idle');
  };

  if (state === 'success') return <section aria-live="polite" className="space-y-2 rounded-lg border border-border/60 p-3"><h3 className="font-semibold">Te agregamos a la lista de espera.</h3><p className="text-sm">Te contactaremos si se libera espacio.</p>{submittedQuantity !== null && <p className="text-sm">Espacios solicitados: {submittedQuantity}</p>}</section>;
  if (state === 'idle') return <div className="space-y-2"><button type="button" disabled={!enabled} onClick={() => { setNotice(''); setState('form'); }} style={{ backgroundColor: ctaBackgroundColor || undefined, color: ctaTextColor || undefined }} className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground">Unirme a la lista de espera</button>{notice && <p role="status" className="text-sm text-text/70">{notice}</p>}</div>;
  return <section className="space-y-3 rounded-lg border border-border/60 p-3"><h3 className="font-semibold">Lista de espera</h3>{([['quantity', '¿Cuántas personas desea incluir?', 'number'], ['contactFirstName', 'Nombre', 'text'], ['contactLastName', 'Apellido', 'text'], ['contactWhatsapp', 'WhatsApp', 'text']] as const).map(([field, label, type]) => <label key={field} className="block text-sm font-semibold">{label}<input type={type} min={field === 'quantity' ? 1 : undefined} max={field === 'quantity' ? 100 : undefined} disabled={state === 'submitting'} value={draft[field]} onChange={(event) => update(field, event.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 font-normal" />{errors[field] && <p className="text-xs text-red-700">{errors[field]}</p>}</label>)}{notice && <p role="status" className="text-sm text-text/70">{notice}</p>}<div className="flex gap-2"><button type="button" disabled={state === 'submitting'} onClick={cancel} className="rounded-lg border border-border px-3 py-2 text-sm">Cancelar</button><button type="button" disabled={state === 'submitting'} onClick={() => void submit()} style={{ backgroundColor: ctaBackgroundColor || undefined, color: ctaTextColor || undefined }} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">{state === 'submitting' ? 'Enviando…' : state === 'error' ? restartRequired ? 'Iniciar de nuevo' : 'Reintentar' : 'Unirme a la lista de espera'}</button></div></section>;
};
