import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createReservasWebBookingDraft, ReservasWebBookingForm, resolveReservasWebResponsible, validateReservasWebBookingDraft } from '../src/components/constructor/modules/ReservasWebBookingForm';

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
