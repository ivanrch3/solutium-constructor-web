import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createReservasWebBookingDraft, ReservasWebBookingForm, resolveReservasWebResponsible, validateReservasWebBookingDraft } from '../src/components/constructor/modules/ReservasWebBookingForm';
import { normalizeReservasWebBookingQuantity, ReservasWebBookingQuantityControl } from '../src/components/constructor/modules/ReservasWebBookingStart';

const complete = (quantity = 1) => ({ ...createReservasWebBookingDraft(quantity), contactFirstName: 'Otra', contactLastName: 'Persona', contactWhatsapp: '+506 8888-8888', participants: Array.from({ length: quantity }, (_, index) => ({ firstName: index ? 'María' : 'Iván', lastName: 'Romero', sex: 'prefer_not_to_say' as const, birthDate: '2000-01-02', identificationNumber: `ID-${index + 1}` })) });

test('one participant is selected as responsible by default and only maps their name plus WhatsApp', () => {
  const draft = complete(1); assert.equal(draft.responsibleSelection, 'participant:0');
  assert.deepEqual(resolveReservasWebResponsible(draft), { firstName: 'Iván', lastName: 'Romero', whatsapp: '+506 8888-8888', selection: 'participant:0' });
  assert.deepEqual(validateReservasWebBookingDraft(draft, 1, '2026-08-11'), {});
  const markup = renderToStaticMarkup(React.createElement(ReservasWebBookingForm, { moduleId: 'module-a', quantity: 1, countdown: '02:59', draft, onDraftChange: () => {}, onChangeQuantity: () => {} }));
  assert.ok(markup.indexOf('Participantes') < markup.indexOf('Responsable de la reserva')); assert.match(markup, /Iván Romero/); assert.match(markup, /WhatsApp/); assert.doesNotMatch(markup, /Otra persona.*Nombre/);
});

test('multiple participants require an explicit selection and preserve it when quantity stays compatible', () => {
  const draft = complete(2); assert.equal(draft.responsibleSelection, null); assert.ok(validateReservasWebBookingDraft(draft, 2, '2026-08-11').responsibleSelection);
  const selected = { ...draft, responsibleSelection: 'participant:1' as const }; assert.deepEqual(resolveReservasWebResponsible(selected), { firstName: 'María', lastName: 'Romero', whatsapp: '+506 8888-8888', selection: 'participant:1' });
  assert.equal(createReservasWebBookingDraft(2, selected).responsibleSelection, 'participant:1'); assert.equal(createReservasWebBookingDraft(1, selected).responsibleSelection, 'participant:0');
});

test('another responsible requires a name, last name and WhatsApp while preserving its draft on edit', () => {
  const other = { ...complete(2), responsibleSelection: 'other' as const, contactFirstName: '', contactLastName: '', contactWhatsapp: '' }; const errors = validateReservasWebBookingDraft(other, 2, '2026-08-11');
  for (const key of ['contactFirstName','contactLastName','contactWhatsapp']) assert.ok(errors[key]);
  const filled = { ...other, contactFirstName: 'Ana', contactLastName: 'Responsable', contactWhatsapp: '+506 7777-7777' }; assert.deepEqual(resolveReservasWebResponsible(filled), { firstName: 'Ana', lastName: 'Responsable', whatsapp: '+506 7777-7777', selection: 'other' }); assert.deepEqual(validateReservasWebBookingDraft(filled, 2, '2026-08-11'), {}); assert.equal(createReservasWebBookingDraft(2, filled).contactFirstName, 'Ana');
});

test('participants form keeps PII in memory and maps the selected responsible only at public submission', () => {
  const form = fs.readFileSync(new URL('../src/components/constructor/modules/ReservasWebBookingForm.tsx', import.meta.url), 'utf8'); const start = fs.readFileSync(new URL('../src/components/constructor/modules/ReservasWebBookingStart.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(form, /localStorage|sessionStorage|settingsValues|console\.|fetch\(|\/reservations|holdToken/i); assert.doesNotMatch(start, /localStorage|sessionStorage|console\./i); assert.match(start, /resolveReservasWebResponsible\(draft\)/); assert.match(start, /contactFirstName: responsible\.firstName\.trim\(\)/); assert.match(start, /createReservasWebBookingDraft\(next\.quantity, current\)/);
});

test('the public booking quantity control supports temporary empty editing, clamps on normalization, and renders explicit controls', () => {
  const start = fs.readFileSync(new URL('../src/components/constructor/modules/ReservasWebBookingStart.tsx', import.meta.url), 'utf8');
  const markup = renderToStaticMarkup(React.createElement(ReservasWebBookingQuantityControl, { value: '1', disabled: false, onChange: () => {}, onNormalize: () => {}, onDecrement: () => {}, onIncrement: () => {} }));
  assert.equal(normalizeReservasWebBookingQuantity('', 8), 1);
  assert.equal(normalizeReservasWebBookingQuantity('3', 8), 3);
  assert.equal(normalizeReservasWebBookingQuantity('99', 8), 8);
  assert.match(markup, /aria-label="Disminuir cantidad"/);
  assert.match(markup, /aria-label="Aumentar cantidad"/);
  assert.match(markup, /type="button"/);
  assert.match(markup, /inputMode="numeric"/);
  assert.match(markup, /min-h-\[44px\].*min-w-\[44px\]/);
  assert.doesNotMatch(markup, /type="number"/);
  assert.match(start, /<ReservasWebBookingQuantityControl/);
  assert.match(start, /createPublicReservasWebHold\(publicIdentifier, nextQuantity, key\(\)\)/);
});

test('the public WhatsApp select renders only calling codes and leaves the remaining width to the phone input', () => {
  const draft = complete(1);
  const markup = renderToStaticMarkup(React.createElement(ReservasWebBookingForm, { moduleId: 'module-a', quantity: 1, countdown: '02:59', draft, onDraftChange: () => {}, onChangeQuantity: () => {} }));
  assert.match(markup, /<option value="CR" selected="">\+506<\/option>/);
  assert.doesNotMatch(markup, /<option[^>]*>[^<]*(?:Costa Rica|CR)[^<]*<\/option>/);
  const form = fs.readFileSync(new URL('../src/components/constructor/modules/ReservasWebBookingForm.tsx', import.meta.url), 'utf8');
  assert.match(form, /<option key=\{country\.countryCode\} value=\{country\.countryCode\}>\{country\.callingCode\}<\/option>/);
  assert.match(form, /className="w-auto flex-none/);
  assert.match(form, /className="min-w-0 flex-1/);
  assert.match(form, /text-white disabled:text-text\/50/);
});

test('a valid FREE booking reaches exactly one reservation attempt on the first Confirmar tap', () => {
  const start = fs.readFileSync(new URL('../src/components/constructor/modules/ReservasWebBookingStart.tsx', import.meta.url), 'utf8');
  const draft = complete(1);
  assert.deepEqual(validateReservasWebBookingDraft(draft, 1, '2026-08-11'), {});
  assert.equal((start.match(/onClick=\{onSubmit\}/g) || []).length, 1);
  assert.equal((start.match(/createPublicReservasWebReservation\(\{/g) || []).length, 1);
  assert.match(start, /const mode = activity\.pricing\.isFree \? null : paymentMode/);
  assert.match(start, /if \(!activity\.pricing\.isFree && \(!paymentMethod/);
  assert.match(start, /<button type="button" disabled=\{disabled \|\| \(paid &&/);
  const submitBody = start.slice(start.indexOf('const submit ='), start.indexOf("  if (state === 'success'"));
  assert.doesNotMatch(submitBody, /preventDefault|setTimeout|retry|double.?click/i);
});

test('booking controls retain structural safeguards for mobile through desktop widths', () => {
  const start = fs.readFileSync(new URL('../src/components/constructor/modules/ReservasWebBookingStart.tsx', import.meta.url), 'utf8');
  const form = fs.readFileSync(new URL('../src/components/constructor/modules/ReservasWebBookingForm.tsx', import.meta.url), 'utf8');
  assert.match(start, /className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-center"/);
  assert.match(start, /min-h-\[44px\] min-w-\[44px\] shrink-0/);
  assert.match(start, /className="mt-1 flex min-w-0 items-center gap-2"/);
  assert.match(form, /className="w-auto flex-none/);
  assert.match(form, /className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 font-normal"/);
});
