import React from 'react';

export type ReservasWebContactDraft = { contactFirstName: string; contactLastName: string; contactWhatsapp: string };
export type ReservasWebParticipantDraft = { firstName: string; lastName: string; sex: '' | 'male' | 'female' | 'prefer_not_to_say'; birthDate: string; identificationNumber: string };
export type ReservasWebBookingDraft = ReservasWebContactDraft & { participants: ReservasWebParticipantDraft[] };
export type ReservasWebBookingErrors = Record<string, string>;

const blankParticipant = (): ReservasWebParticipantDraft => ({ firstName: '', lastName: '', sex: '', birthDate: '', identificationNumber: '' });

export const createReservasWebBookingDraft = (quantity: number, existing?: ReservasWebBookingDraft): ReservasWebBookingDraft => ({
  contactFirstName: existing?.contactFirstName || '',
  contactLastName: existing?.contactLastName || '',
  contactWhatsapp: existing?.contactWhatsapp || '',
  participants: Array.from({ length: quantity }, (_, index) => existing?.participants[index] || blankParticipant())
});

const text = (value: string) => value.trim();
const isBirthDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};
const isWhatsapp = (value: string) => text(value).replace(/\D/g, '').length >= 7 && text(value).replace(/\D/g, '').length <= 20;

export const validateReservasWebBookingDraft = (draft: ReservasWebBookingDraft, quantity: number, today = new Date().toISOString().slice(0, 10)): ReservasWebBookingErrors => {
  const errors: ReservasWebBookingErrors = {};
  if (!text(draft.contactFirstName) || text(draft.contactFirstName).length > 100) errors.contactFirstName = 'Ingresa un nombre válido.';
  if (!text(draft.contactLastName) || text(draft.contactLastName).length > 100) errors.contactLastName = 'Ingresa un apellido válido.';
  if (!isWhatsapp(draft.contactWhatsapp)) errors.contactWhatsapp = 'Ingresa un WhatsApp válido.';
  if (draft.participants.length !== quantity) errors.participants = 'La cantidad de participantes debe coincidir con los espacios reservados.';
  draft.participants.forEach((participant, index) => {
    const prefix = `participants.${index}`;
    if (!text(participant.firstName) || text(participant.firstName).length > 100) errors[`${prefix}.firstName`] = 'Ingresa un nombre válido.';
    if (!text(participant.lastName) || text(participant.lastName).length > 100) errors[`${prefix}.lastName`] = 'Ingresa un apellido válido.';
    if (!['male', 'female', 'prefer_not_to_say'].includes(participant.sex)) errors[`${prefix}.sex`] = 'Selecciona una opción.';
    if (!isBirthDate(participant.birthDate) || participant.birthDate > today) errors[`${prefix}.birthDate`] = 'Ingresa una fecha de nacimiento válida.';
    if (!text(participant.identificationNumber) || text(participant.identificationNumber).length > 64) errors[`${prefix}.identificationNumber`] = 'Ingresa una identificación válida.';
  });
  return errors;
};

type ReservasWebBookingFormProps = { moduleId: string; activityTitle: string; quantity: number; countdown: string; draft: ReservasWebBookingDraft; onDraftChange: (draft: ReservasWebBookingDraft) => void; onChangeQuantity: () => void };
const FieldError = ({ id, error }: { id: string; error?: string }) => error ? <p id={id} className="text-xs text-red-700">{error}</p> : null;

export const ReservasWebBookingForm = ({ moduleId, activityTitle, quantity, countdown, draft, onDraftChange, onChangeQuantity }: ReservasWebBookingFormProps) => {
  const [errors, setErrors] = React.useState<ReservasWebBookingErrors>({});
  const [review, setReview] = React.useState(false);
  const updateContact = (key: keyof ReservasWebContactDraft, value: string) => onDraftChange({ ...draft, [key]: value });
  const updateParticipant = (index: number, key: keyof ReservasWebParticipantDraft, value: string) => onDraftChange({ ...draft, participants: draft.participants.map((participant, participantIndex) => participantIndex === index ? { ...participant, [key]: value } : participant) });
  const continueToReview = () => { const nextErrors = validateReservasWebBookingDraft(draft, quantity); setErrors(nextErrors); if (Object.keys(nextErrors).length === 0) setReview(true); };

  if (review) return <section className="space-y-3 rounded-lg border border-border/60 p-3"><p aria-live="polite" className="rounded-lg bg-secondary p-3 text-sm">Tus espacios están reservados por {countdown}.</p><h3 className="font-semibold">Revisa tus datos</h3><p className="text-sm">{activityTitle} · {quantity} participante{quantity === 1 ? '' : 's'}</p><p className="text-sm">Responsable: {text(draft.contactFirstName)} {text(draft.contactLastName)}</p><ul className="space-y-1 text-sm">{draft.participants.map((participant, index) => <li key={index}>Participante {index + 1}: {text(participant.firstName)} {text(participant.lastName)} · Identificación registrada</li>)}</ul><button type="button" onClick={() => setReview(false)} className="rounded-lg border border-border px-3 py-2 text-sm">Editar datos</button></section>;

  return <section className="space-y-4 rounded-lg border border-border/60 p-3"><p aria-live="polite" className="rounded-lg bg-secondary p-3 text-sm">Tus espacios están reservados por {countdown}.</p><div className="space-y-3"><h3 className="font-semibold">Responsable de la reserva</h3>{([['contactFirstName', 'Nombre'], ['contactLastName', 'Apellido'], ['contactWhatsapp', 'WhatsApp']] as const).map(([key, label]) => { const id = `${moduleId}-${key}`; const error = errors[key]; return <label key={key} className="block text-sm font-semibold">{label}<input id={id} value={draft[key]} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} onChange={(event) => updateContact(key, event.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 font-normal" /> <FieldError id={`${id}-error`} error={error} /></label>; })}</div><div className="space-y-3">{draft.participants.map((participant, index) => <fieldset key={index} className="space-y-3 rounded-lg border border-border/60 p-3"><legend className="px-1 text-sm font-semibold">Participante {index + 1}</legend>{([['firstName', 'Nombre', 'text'], ['lastName', 'Apellido', 'text'], ['birthDate', 'Fecha de nacimiento', 'date'], ['identificationNumber', 'Identificación', 'text']] as const).map(([key, label, type]) => { const id = `${moduleId}-${index}-${key}`; const error = errors[`participants.${index}.${key}`]; return <label key={key} className="block text-sm font-semibold">{label}<input id={id} type={type} value={participant[key]} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} onChange={(event) => updateParticipant(index, key, event.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 font-normal" /> <FieldError id={`${id}-error`} error={error} /></label>; })}<label className="block text-sm font-semibold">Sexo<select value={participant.sex} aria-invalid={Boolean(errors[`participants.${index}.sex`])} onChange={(event) => updateParticipant(index, 'sex', event.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 font-normal"><option value="">Selecciona una opción</option><option value="male">Masculino</option><option value="female">Femenino</option><option value="prefer_not_to_say">Prefiero no indicarlo</option></select><FieldError id={`${moduleId}-${index}-sex-error`} error={errors[`participants.${index}.sex`]} /></label></fieldset>)}</div>{errors.participants && <p role="status" className="text-sm text-red-700">{errors.participants}</p>}<div className="flex flex-wrap gap-2"><button type="button" onClick={onChangeQuantity} className="rounded-lg border border-border px-3 py-2 text-sm">Cambiar cantidad</button><button type="button" onClick={continueToReview} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">Continuar</button></div></section>;
};
