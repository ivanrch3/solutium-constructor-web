import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { buildReservasWebActivityPatch, createReservasWebActivityDraft, normalizeReservasWebActivitySessions, validateReservasWebActivityDraft } from '../src/components/constructor/modules/ReservasWebActivityForm';

const valid = () => ({ ...createReservasWebActivityDraft(), catalog_item_id: 'catalog', title_override: 'Taller', modality: 'presencial' as const, physical_location: 'Sala', total_capacity: 8, sessions: [{ starts_at: '2026-09-01T10:00', ends_at: '2026-09-01T11:00' }] });

test('basic activity draft starts in free create mode and validates catalog, title and one session',()=>{
  const empty=createReservasWebActivityDraft();
  assert.equal(empty.is_free,true);assert.equal(empty.total_capacity,1);assert.equal(empty.sessions.length,1);
  assert.ok(validateReservasWebActivityDraft(empty).some(error=>error.includes('catálogo')));
  assert.deepEqual(validateReservasWebActivityDraft(valid()),[]);
});

test('modality requires only its corresponding location or private virtual URL',()=>{
  const presencial=valid();assert.deepEqual(validateReservasWebActivityDraft(presencial),[]);
  assert.ok(validateReservasWebActivityDraft({...presencial,physical_location:null}).some(error=>error.includes('ubicación')));
  const virtual={...valid(),modality:'virtual' as const,physical_location:null,private_virtual_url:'https://private.example/room'};
  assert.deepEqual(validateReservasWebActivityDraft(virtual),[]);
  assert.ok(validateReservasWebActivityDraft({...virtual,private_virtual_url:null}).some(error=>error.includes('URL virtual')));
  const hybrid={...virtual,modality:'hybrid' as const,physical_location:'Sala'};assert.deepEqual(validateReservasWebActivityDraft(hybrid),[]);
});

test('sessions reject invalid or duplicate ranges and PATCH only includes changes',()=>{
  const base=valid();
  assert.ok(validateReservasWebActivityDraft({...base,sessions:[{starts_at:'2026-09-01T11:00',ends_at:'2026-09-01T10:00'}]}).some(error=>error.includes('fechas')));
  assert.ok(validateReservasWebActivityDraft({...base,sessions:[base.sessions[0],base.sessions[0]]}).some(error=>error.includes('repitas')));
  assert.deepEqual(buildReservasWebActivityPatch(base,base),{});
  assert.deepEqual(buildReservasWebActivityPatch({...base,physical_location:null},base),{physical_location:null});
  assert.deepEqual(buildReservasWebActivityPatch({...base,sessions:[]},base),{sessions:[]});
  assert.deepEqual(normalizeReservasWebActivitySessions([{starts_at:'2026-09-02T10:00',ends_at:'2026-09-02T11:00'},{starts_at:'2026-09-01T10:00',ends_at:'2026-09-01T11:00'}]).map(session=>session.starts_at),['2026-09-01T10:00','2026-09-02T10:00']);
});

test('paid activities require price, currency and one valid payment method while free stays valid',()=>{
  const free=valid();assert.deepEqual(validateReservasWebActivityDraft(free),[]);
  const paid={...free,is_free:false,regular_price:100,currency:'CRC',sinpe_phone:'+506 8888 8888'};
  assert.deepEqual(validateReservasWebActivityDraft(paid),[]);
  assert.ok(validateReservasWebActivityDraft({...paid,regular_price:0}).some(error=>error.includes('precio regular')));
  assert.ok(validateReservasWebActivityDraft({...paid,currency:null}).some(error=>error.includes('moneda')));
  assert.ok(validateReservasWebActivityDraft({...paid,sinpe_phone:null,onvopay_url:null}).some(error=>error.includes('SINPE')));
  assert.deepEqual(validateReservasWebActivityDraft({...paid,sinpe_phone:null,onvopay_url:'https://pay.example'}),[]);
  assert.ok(validateReservasWebActivityDraft({...paid,sinpe_phone:null,onvopay_url:'http://pay.example'}).some(error=>error.includes('HTTPS')));
});

test('promotion validates its range and PATCH preserves explicit payment clears',()=>{
  const paid={...valid(),is_free:false,regular_price:100,currency:'CRC',sinpe_phone:'+506 8888 8888',promotional_price:80,promotion_ends_at:'2026-10-01T10:00'};
  assert.deepEqual(validateReservasWebActivityDraft(paid),[]);
  assert.ok(validateReservasWebActivityDraft({...paid,promotional_price:100}).some(error=>error.includes('promocional')));
  assert.ok(validateReservasWebActivityDraft({...paid,promotion_ends_at:null}).some(error=>error.includes('promocional')));
  assert.deepEqual(buildReservasWebActivityPatch({...paid,promotional_price:null,promotion_ends_at:null},paid),{promotional_price:null,promotion_ends_at:null});
  assert.deepEqual(buildReservasWebActivityPatch({...paid,is_free:true,regular_price:0,promotional_price:null,promotion_ends_at:null},paid),{is_free:true,regular_price:0,promotional_price:null,promotion_ends_at:null});
});

test('form source keeps admin detail out of settings and uses only the phase 8B.1 API client',()=>{
  const source=fs.readFileSync(new URL('../src/components/constructor/modules/ReservasWebActivityForm.tsx',import.meta.url),'utf8');
  assert.match(source,/createReservasWebActivity|updateReservasWebActivity|refreshReservasWebActivities/);
  assert.doesNotMatch(source,/fetch\(|settingsValues|onSettingChange|reservations|providerCredentials/i);
});
