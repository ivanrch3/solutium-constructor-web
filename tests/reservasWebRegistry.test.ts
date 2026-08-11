import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { RESERVAS_WEB_MODULE, PRODUCTS_MODULE } from '../src/components/constructor/registry';
import { ReservasWebModule } from '../src/components/constructor/modules/ReservasWebModule';
import { createDefaultReservasWebConfig } from '../src/components/constructor/modules/reservasWebConfig';

test('Reservas Web is registered with canonical defaults and a safe Canvas fallback', () => {
  const config = createDefaultReservasWebConfig();
  const constructorSource = fs.readFileSync(new URL('../src/components/constructor/WebConstructor.tsx', import.meta.url), 'utf8');

  assert.equal(RESERVAS_WEB_MODULE.type, 'reservas_web');
  assert.equal(RESERVAS_WEB_MODULE.name, 'Reservas Web');
  assert.deepEqual(config.activities.activityIds, []);
  assert.equal(config.content.reserveButtonLabel, 'Reservar');
  assert.match(constructorSource, /getReservasWebConfigSettingKey\(moduleId\)[\s\S]*createDefaultReservasWebConfig\(\)/);
  assert.doesNotMatch(JSON.stringify(config), /customerId|reservationId|holdId|whatsapp.*token/i);
  assert.equal(PRODUCTS_MODULE.type, 'products');
  assert.match(renderToStaticMarkup(React.createElement(ReservasWebModule)), /Configura una actividad para este módulo\./);
});
