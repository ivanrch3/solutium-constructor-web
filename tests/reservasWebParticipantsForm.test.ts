import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createReservasWebBookingDraft, ReservasWebBookingForm, validateReservasWebBookingDraft } from '../src/components/constructor/modules/ReservasWebBookingForm';

const validDraft = (quantity = 1) => {
  const draft = createReservasWebBookingDraft(quantity);
  return {
    ...draft,
    contactFirstName: ' Ana ', contactLastName: ' Responsable ', contactWhatsapp: '+506 8888-8888',
    participants: draft.participants.map((_, index) => ({ firstName: `Participante ${index + 1}`, lastName: 'Apellido', sex: 'prefer_not_to_say' as const, birthDate: '2000-01-02', identificationNumber: `ID-${index + 1}` }))
  };
};

test('participant drafts always match the active hold quantity and preserve compatible memory-only fields', () => {
  const first = validDraft(1);
  const three = createReservasWebBookingDraft(3, first);
  assert.equal(first.participants.length, 1);
  assert.equal(three.participants.length, 3);
  assert.equal(three.participants[0].identificationNumber, 'ID-1');
  assert.equal(three.participants[1].identificationNumber, '');
  const markup = renderToStaticMarkup(React.createElement(ReservasWebBookingForm, { moduleId: 'module-a', activityTitle: 'Taller', quantity: 3, countdown: '02:59', draft: three, onDraftChange: () => {}, onChangeQuantity: () => {} }));
  assert.match(markup, /Participante 1/); assert.match(markup, /Participante 2/); assert.match(markup, /Participante 3/);
  assert.match(markup, /Cambiar cantidad/); assert.doesNotMatch(markup, /Agregar participante|Eliminar participante/);
});

test('validates the canonical backend contact and participant fields without treating identification as numeric', () => {
  const invalid = createReservasWebBookingDraft(1);
  const errors = validateReservasWebBookingDraft(invalid, 1, '2026-08-11');
  for (const key of ['contactFirstName', 'contactLastName', 'contactWhatsapp', 'participants.0.firstName', 'participants.0.lastName', 'participants.0.sex', 'participants.0.birthDate', 'participants.0.identificationNumber']) assert.ok(errors[key]);
  assert.ok(validateReservasWebBookingDraft({ ...validDraft(), participants: [{ ...validDraft().participants[0], birthDate: '2026-08-12' }] }, 1, '2026-08-11')['participants.0.birthDate']);
  assert.ok(validateReservasWebBookingDraft({ ...validDraft(), participants: [{ ...validDraft().participants[0], birthDate: '2026-02-31' }] }, 1, '2026-08-11')['participants.0.birthDate']);
  assert.deepEqual(validateReservasWebBookingDraft(validDraft(), 1, '2026-08-11'), {});
  assert.ok(validateReservasWebBookingDraft(validDraft(), 2, '2026-08-11').participants);
});

test('participants form keeps PII in memory and delegates submission to the public booking flow', () => {
  const form = fs.readFileSync(new URL('../src/components/constructor/modules/ReservasWebBookingForm.tsx', import.meta.url), 'utf8');
  const start = fs.readFileSync(new URL('../src/components/constructor/modules/ReservasWebBookingStart.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(form, /localStorage|sessionStorage|settingsValues|console\.|fetch\(|\/reservations|holdToken/i);
  assert.doesNotMatch(start, /localStorage|sessionStorage|console\./i);
  assert.match(start, /createReservasWebBookingDraft\(next\.quantity, current\)/);
  assert.match(start, /Reservar espacios de nuevo/);
});
