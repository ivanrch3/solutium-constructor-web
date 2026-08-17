import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createReservasWebBookingDraft, ReservasWebBookingForm, resolveReservasWebResponsible, validateReservasWebBookingDraft } from '../src/components/constructor/modules/ReservasWebBookingForm';
import { getHoldCountdownLabel, isReservasWebHoldExpired, normalizeReservasWebBookingQuantity, ReservasWebBookingQuantityControl } from '../src/components/constructor/modules/ReservasWebBookingStart';

const complete = (quantity = 1) => ({ ...createReservasWebBookingDraft(quantity), contactFirstName: 'Otra', contactLastName: 'Persona', contactWhatsapp: '+506 8888-8888', participants: Array.from({ length: quantity }, (_, index) => ({ firstName: index ? 'María' : 'Iván', lastName: 'Romero', sex: 'prefer_not_to_say' as const, age: '26', identificationNumber: `ID-${index + 1}` })) });

test('Edad replaces birthDate and validates the 0..120 public contract', () => {
  const draft = complete(); assert.deepEqual(validateReservasWebBookingDraft(draft, 1), {});
  assert.ok(validateReservasWebBookingDraft({ ...draft, participants: [{ ...draft.participants[0], age: '121' }] }, 1)['participants.0.age']);
  const markup = renderToStaticMarkup(React.createElement(ReservasWebBookingForm, { moduleId: 'module-a', quantity: 1, countdown: '02:59', draft, onDraftChange: () => {}, onChangeQuantity: () => {} }));
  assert.match(markup, /Edad/); assert.match(markup, /type="number"/); assert.match(markup, /inputMode="numeric"/); assert.doesNotMatch(markup, /Fecha de nacimiento|birthDate/);
});
test('responsible selection and responsive controls retain their safeguards', () => {
  const draft = complete(2); const selected = { ...draft, responsibleSelection: 'participant:1' as const };
  assert.deepEqual(resolveReservasWebResponsible(selected), { firstName: 'María', lastName: 'Romero', whatsapp: '+506 8888-8888', selection: 'participant:1' });
  const markup = renderToStaticMarkup(React.createElement(ReservasWebBookingQuantityControl, { value: '1', disabled: false, onChange: () => {}, onNormalize: () => {}, onDecrement: () => {}, onIncrement: () => {} }));
  assert.equal(normalizeReservasWebBookingQuantity('99', 8), 8); assert.match(markup, /min-h-\[44px\].*min-w-\[44px\]/);
});
test('public submit maps age, consumes backend hold expiry, shows processing, and guards duplicate posts', () => {
  const source = fs.readFileSync(new URL('../src/components/constructor/modules/ReservasWebBookingStart.tsx', import.meta.url), 'utf8');
  const now = Date.parse('2099-08-20T14:00:00.000Z'); assert.equal(getHoldCountdownLabel('2099-08-20T14:03:00.000Z', now), '03:00'); assert.equal(isReservasWebHoldExpired('2099-08-20T14:00:00.000Z', now), true);
  assert.match(source, /age: Number\(participant\.age\)/); assert.doesNotMatch(source, /birthDate/); assert.match(source, /submittingRef\.current/); assert.match(source, /Procesando reserva/); assert.match(source, /El tiempo para completar el registro venció\. Por favor, inténtalo de nuevo\./);
});
