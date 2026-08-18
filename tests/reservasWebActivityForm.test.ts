import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ReservasWebEligibleWhatsAppChannel } from '../src/types/reservasWeb';
import { buildReservasWebActivityArchivePatch, buildReservasWebActivityPatch, createReservasWebActivityDraft, formatReservasWebDateTimeLocalInput, getReservasWebFinalReadiness, getReservasWebGeniusModeLabel, getReservasWebOnvopayUrl, hasReservasWebActivityDraftChanges, normalizeReservasWebActivitySessions, ReservasWebActivityForm, validateReservasWebActivityDraft } from '../src/components/constructor/modules/ReservasWebActivityForm';

const valid = () => ({ ...createReservasWebActivityDraft(), catalog_item_id: 'catalog', title_override: 'Taller', modality: 'presencial' as const, physical_location: 'Sala', total_capacity: 8, sessions: [{ starts_at: '2026-09-01T10:00', ends_at: '2026-09-01T11:00' }] });

test('basic activity draft starts in free create mode and validates catalog, title and one session',()=>{
  const empty=createReservasWebActivityDraft();
  assert.equal(empty.is_free,true);assert.equal(empty.total_capacity,1);assert.equal(empty.sessions.length,1);
  assert.ok(validateReservasWebActivityDraft(empty).some(error=>error.includes('catálogo')));
  assert.deepEqual(validateReservasWebActivityDraft(valid()),[]);
});

test('payment options support full, deposit, both and a semantic dirty baseline',()=>{
  const original={...valid(),is_free:false,regular_price:100,currency:'CRC',sinpe_phone:'88888888',sinpe_beneficiary:'Ana',allow_full_payment:true,allow_deposit_payment:false,deposit_amount:null,deposit_refundable:null};
  assert.deepEqual(validateReservasWebActivityDraft(original),[]);
  const deposit={...original,allow_full_payment:false,allow_deposit_payment:true,deposit_amount:25,deposit_refundable:false};
  assert.deepEqual(validateReservasWebActivityDraft(deposit),[]);
  assert.deepEqual(validateReservasWebActivityDraft({...original,allow_full_payment:true,allow_deposit_payment:true,deposit_amount:25,deposit_refundable:true}),[]);
  assert.ok(validateReservasWebActivityDraft({...original,allow_full_payment:false,allow_deposit_payment:false}).some(error=>error.includes('opción de pago')));
  assert.equal(hasReservasWebActivityDraftChanges({...original,allow_deposit_payment:true,deposit_amount:25,deposit_refundable:false},original),true);
  assert.equal(hasReservasWebActivityDraftChanges(original,original),false);
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

test('activity editor separates information from configuration and keeps lifecycle actions at the footer',()=>{
  const markup=renderToStaticMarkup(React.createElement(ReservasWebActivityForm,{mode:'create',projectId:'project-a',products:[],eligibleWhatsAppChannels:[],onClose:()=>{},onSaved:()=>{}}));
  const source=fs.readFileSync(new URL('../src/components/constructor/modules/ReservasWebActivityForm.tsx',import.meta.url),'utf8');
  assert.match(markup,/Información/);assert.match(markup,/Configuración/);
  assert.ok(source.indexOf("setFormTab('information')") < source.indexOf("setFormTab('configuration')"));
  assert.ok(source.indexOf('Cerrar</button>{mode === \'edit\'') < source.indexOf('Guardar actividad'));
});

test('edit hydration uses the activity timezone and preserves the local datetime payload on a no-op save',()=>{
  const detail:any={id:'activity-a',catalogItemId:'catalog',title:'Taller',shortDescription:null,expandedDescription:null,imageSource:'catalog_item',customImageUrl:null,facilitator:null,facilitatorWhatsapp:null,modality:'presencial',location:'Sala',mapsUrl:null,privateVirtualUrl:null,timezone:'America/Costa_Rica',bookingClosesAt:null,totalCapacity:8,isFree:true,regularPrice:0,promotionalPrice:null,promotionEndsAt:null,currency:null,paymentMode:'full',depositAmount:null,depositRefundable:null,sinpePhone:null,sinpeBeneficiary:null,paymentReceiptWhatsapp:null,onvopayUrl:null,selectedWhatsappChannelId:null,status:'draft',archivedAt:null,sessions:[{startAt:'2026-08-17T17:00:00.000Z',endAt:'2026-08-17T18:30:00.000Z',sequence:1}],readiness:{bookable:true,reasons:[],whatsapp:'ready'}};
  const draft=createReservasWebActivityDraft(detail);
  assert.equal(formatReservasWebDateTimeLocalInput('2026-08-17T17:00:00.000Z','America/Costa_Rica'),'2026-08-17T11:00');
  assert.equal(draft.sessions[0].starts_at,'2026-08-17T11:00');
  assert.equal(draft.sessions[0].ends_at,'2026-08-17T12:30');
  assert.deepEqual(buildReservasWebActivityPatch(draft,draft),{});
  assert.deepEqual(normalizeReservasWebActivitySessions(draft.sessions),draft.sessions);
});

test('save uses a semantic dirty baseline and returns to disabled after reverting activity fields or sessions',()=>{
  const baseline=valid();
  assert.equal(hasReservasWebActivityDraftChanges(baseline,baseline),false);
  assert.equal(hasReservasWebActivityDraftChanges({...baseline,title_override:'Otro título'},baseline),true);
  assert.equal(hasReservasWebActivityDraftChanges({...baseline,title_override:baseline.title_override},baseline),false);
  assert.equal(hasReservasWebActivityDraftChanges({...baseline,sessions:[{starts_at:'2026-09-01T10:30',ends_at:'2026-09-01T11:00'}]},baseline),true);
  assert.equal(hasReservasWebActivityDraftChanges({...baseline,sessions:[...baseline.sessions]},baseline),false);
  assert.equal(hasReservasWebActivityDraftChanges({...baseline,short_description_override:null},{...baseline,short_description_override:''}),false);
  const source=fs.readFileSync(new URL('../src/components/constructor/modules/ReservasWebActivityForm.tsx',import.meta.url),'utf8');
  assert.match(source,/disabled=\{!canSave\}/);assert.match(source,/setBaseline\(normalizedDraft\)/);assert.match(source,/grid-cols-3/);assert.match(source,/Archivar actividad.*Guardar actividad.*Cerrar/);assert.match(source,/sinpe_beneficiary: detail\.sinpeBeneficiary/);
});

test('paid activities require price, currency and one valid payment method while free stays valid',()=>{
  const free=valid();assert.deepEqual(validateReservasWebActivityDraft(free),[]);
  const paid={...free,is_free:false,regular_price:100,currency:'CRC',sinpe_phone:'+506 8888 8888',sinpe_beneficiary:'Tesorería'};
  assert.deepEqual(validateReservasWebActivityDraft(paid),[]);
  assert.ok(validateReservasWebActivityDraft({...paid,regular_price:0}).some(error=>error.includes('precio regular')));
  assert.ok(validateReservasWebActivityDraft({...paid,currency:null}).some(error=>error.includes('moneda')));
  assert.deepEqual(validateReservasWebActivityDraft({...paid,allow_full_payment:false,allow_deposit_payment:true,deposit_amount:10,deposit_refundable:false}),[]);
  assert.ok(validateReservasWebActivityDraft({...paid,allow_full_payment:false,allow_deposit_payment:true,deposit_amount:100,deposit_refundable:false}).some(error=>error.includes('monto de reserva')));
  assert.ok(validateReservasWebActivityDraft({...paid,sinpe_phone:null,onvopay_url:null}).some(error=>error.includes('SINPE')));
  assert.ok(validateReservasWebActivityDraft({...paid,sinpe_beneficiary:null,onvopay_url:null}).some(error=>error.includes('SINPE')));
  assert.deepEqual(validateReservasWebActivityDraft({...paid,sinpe_phone:null,onvopay_url:'https://pay.example'}),[]);
  assert.ok(validateReservasWebActivityDraft({...paid,sinpe_phone:null,onvopay_url:'http://pay.example'}).some(error=>error.includes('HTTPS')));
});

test('activity image uses the catalog by default and permits only an explicit HTTPS override',()=>{
  const base=valid();
  assert.equal(createReservasWebActivityDraft().image_source,'catalog_item');
  assert.deepEqual(validateReservasWebActivityDraft({...base,image_source:'url',custom_image_url:'https://images.example/activity.jpg'}),[]);
  assert.ok(validateReservasWebActivityDraft({...base,image_source:'url',custom_image_url:'http://images.example/activity.jpg'}).some(error=>error.includes('imagen personalizada')));
  assert.deepEqual(buildReservasWebActivityPatch({...base,image_source:'url',custom_image_url:'https://images.example/activity.jpg'},base),{image_source:'url',custom_image_url:'https://images.example/activity.jpg'});
});

test('promotion validates its range and PATCH preserves explicit payment clears',()=>{
  const paid={...valid(),is_free:false,regular_price:100,currency:'CRC',sinpe_phone:'+506 8888 8888',sinpe_beneficiary:'Tesorería',promotional_price:80,promotion_ends_at:'2026-10-01T10:00'};
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

test('Genius selector uses only the secure eligible channel collection and preserves differential channel PATCHes',()=>{
  const channels: ReservasWebEligibleWhatsAppChannel[]=[{id:'genius-1',displayLabel:'Genius principal',phoneNumber:'+50611111111',mode:'genius',connected:true},{id:'flash-1',displayLabel:'Genius Flash',phoneNumber:'+50622222222',mode:'flash',connected:true}];
  const base=valid();
  assert.deepEqual(validateReservasWebActivityDraft(base,[]),[]);
  assert.ok(validateReservasWebActivityDraft(base,channels).some(error=>error.includes('Selecciona una conexión Genius')));
  assert.deepEqual(validateReservasWebActivityDraft({...base,selected_whatsapp_channel_id:'genius-1'},channels),[]);
  assert.ok(validateReservasWebActivityDraft({...base,selected_whatsapp_channel_id:'missing'},channels).some(error=>error.includes('ya no está disponible')));
  assert.deepEqual(buildReservasWebActivityPatch({...base,selected_whatsapp_channel_id:'genius-1'},{...base,selected_whatsapp_channel_id:'genius-1'}),{});
  assert.deepEqual(buildReservasWebActivityPatch({...base,selected_whatsapp_channel_id:'flash-1'},base),{selected_whatsapp_channel_id:'flash-1'});
  assert.equal(getReservasWebGeniusModeLabel('genius'),'Genius');assert.equal(getReservasWebGeniusModeLabel('flash'),'Genius Flash');
  const invalidDetail={id:'activity-a',catalogItemId:'catalog',title:'Taller',shortDescription:null,expandedDescription:null,facilitator:null,facilitatorWhatsapp:null,modality:'presencial',location:'Sala',mapsUrl:null,privateVirtualUrl:null,timezone:'America/Costa_Rica',bookingClosesAt:null,totalCapacity:8,isFree:true,regularPrice:0,promotionalPrice:null,promotionEndsAt:null,currency:null,sinpePhone:null,paymentReceiptWhatsapp:null,onvopayUrl:null,selectedWhatsappChannelId:'missing',status:'active',archivedAt:null,sessions:[{starts_at:'2026-09-01T10:00',ends_at:'2026-09-01T11:00',sequence:1}],readiness:{bookable:false,reasons:[],whatsapp:'invalid_selection'}};
  assert.equal(invalidDetail.selectedWhatsappChannelId,'missing');
  const source=fs.readFileSync(new URL('../src/components/constructor/modules/ReservasWebActivityForm.tsx',import.meta.url),'utf8');
  assert.doesNotMatch(source,/settingsValues|providerCredentials|api_key|access_token/i);
  assert.match(source,/Reservas Web requiere una conexión Genius activa/);assert.match(source,/Este canal se utilizará automáticamente/);assert.match(source,/getReservasWebGeniusModeLabel/);assert.match(source,/La conexión Genius seleccionada ya no está disponible/);assert.match(source,/Facilitador/);assert.match(source,/Número SINPE/);assert.match(source,/Número para recibir comprobantes/);
});

test('administrative readiness and archive lifecycle keep backend authority and use isolated PATCHes',()=>{
  const readiness=(bookable:boolean,whatsapp:'ready'|'unavailable'|'selection_required'|'invalid_selection',archivedAt:string|null=null,reasons:string[]=[],status='draft'):any=>({archivedAt,status,readiness:{bookable,reasons,whatsapp}});
  assert.equal(getReservasWebFinalReadiness(readiness(true,'ready')).state,'ready_to_publish');
  assert.equal(getReservasWebFinalReadiness(readiness(true,'ready',null,[],'active')).state,'ready');
  assert.match(getReservasWebFinalReadiness(readiness(false,'unavailable')).reasons.join(' '),/conexión Genius activa/);
  assert.match(getReservasWebFinalReadiness(readiness(false,'selection_required')).reasons.join(' '),/Selecciona una conexión Genius/);
  assert.match(getReservasWebFinalReadiness(readiness(false,'invalid_selection')).reasons.join(' '),/ya no está disponible/);
  assert.equal(getReservasWebFinalReadiness(readiness(true,'ready','2026-09-01T00:00:00.000Z')).state,'archived');
  const archivePatch=buildReservasWebActivityArchivePatch(true);assert.deepEqual(Object.keys(archivePatch),['archived_at']);assert.match(String(archivePatch.archived_at),/^\d{4}-\d\d-\d\dT.*Z$/);assert.deepEqual(buildReservasWebActivityArchivePatch(false),{archived_at:null});
  const archivedDetail={id:'activity-a',catalogItemId:'catalog',title:'Taller',shortDescription:null,expandedDescription:null,facilitator:null,facilitatorWhatsapp:null,modality:'presencial',location:'Sala',mapsUrl:null,privateVirtualUrl:null,timezone:'America/Costa_Rica',bookingClosesAt:null,totalCapacity:8,isFree:true,regularPrice:0,promotionalPrice:null,promotionEndsAt:null,currency:null,sinpePhone:null,paymentReceiptWhatsapp:null,onvopayUrl:null,selectedWhatsappChannelId:null,status:'active',archivedAt:'2026-09-01T00:00:00.000Z',sessions:[{starts_at:'2026-09-01T10:00',ends_at:'2026-09-01T11:00',sequence:1}],readiness:{bookable:true,reasons:[],whatsapp:'ready'}};
  const markup=renderToStaticMarkup(React.createElement(ReservasWebActivityForm,{mode:'edit',projectId:'project-a',products:[],detail:archivedDetail as any,eligibleWhatsAppChannels:[],onClose:()=>{},onSaved:()=>{}}));
  assert.match(markup,/ARCHIVADA/);assert.match(markup,/Restaurar actividad/);assert.doesNotMatch(markup,/Archivar actividad/);
  const source=fs.readFileSync(new URL('../src/components/constructor/modules/ReservasWebActivityForm.tsx',import.meta.url),'utf8');
  assert.match(source,/Confirmar archivado/);assert.match(source,/updateReservasWebActivity\(projectId, detail.id, buildReservasWebActivityArchivePatch/);assert.doesNotMatch(source,/window\.confirm|delete\(|DELETE|reservations/i);
});

test('Onvopay mode URLs are visible only for enabled modes, dirty tracked, and retain legacy fallback routing',()=>{
  const paid={...valid(),is_free:false,regular_price:100,currency:'CRC',sinpe_phone:null,sinpe_beneficiary:null,onvopay_url:'https://legacy.example',onvopay_full_url:'https://full.example',onvopay_deposit_url:'https://deposit.example'};
  assert.equal(getReservasWebOnvopayUrl(paid,'full'),'https://full.example');
  assert.equal(getReservasWebOnvopayUrl(paid,'deposit'),'https://deposit.example');
  assert.equal(getReservasWebOnvopayUrl({...paid,onvopay_deposit_url:null},'deposit'),'https://legacy.example');
  assert.equal(hasReservasWebActivityDraftChanges({...paid,onvopay_full_url:'https://full-next.example'},paid),true);
  assert.deepEqual(buildReservasWebActivityPatch({...paid,onvopay_deposit_url:'https://deposit-next.example'},paid),{onvopay_deposit_url:'https://deposit-next.example'});
  assert.deepEqual(validateReservasWebActivityDraft({...paid,allow_full_payment:true,allow_deposit_payment:false,onvopay_full_url:'https://full.example',onvopay_deposit_url:null}),[]);
  assert.deepEqual(validateReservasWebActivityDraft({...paid,allow_full_payment:false,allow_deposit_payment:true,onvopay_full_url:null,onvopay_deposit_url:'https://deposit.example',deposit_amount:25,deposit_refundable:false}),[]);
  const source=fs.readFileSync(new URL('../src/components/constructor/modules/ReservasWebActivityForm.tsx',import.meta.url),'utf8');
  assert.doesNotMatch(source,/URL de pago con tarjeta \(Onvopay\)/);
  assert.match(source,/URL de pago total \(Onvopay\)/);assert.match(source,/URL de pago parcial \/ reserva \(Onvopay\)/);
});
