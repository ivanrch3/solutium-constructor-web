import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {
  ReservasWebAdminApiError,
  createReservasWebActivityAttempt,
  createReservasWebActivityIdempotencyKey,
  createReservasWebActivity,
  getReservasWebActivity,
  listReservasWebActivities,
  updateReservasWebActivity
} from '../src/services/reservasWebAdminApi';

const projectId='11111111-1111-4111-8111-111111111111';
const activityId='22222222-2222-4222-8222-222222222222';
const storage=new Map<string,string>();
Object.assign(import.meta,{env:{}});
Object.assign(globalThis,{window:{location:{hostname:'constructor.solutium.app'},sessionStorage:{getItem:(key:string)=>storage.get(key)??null,setItem:(key:string,value:string)=>storage.set(key,value),removeItem:(key:string)=>storage.delete(key)},SOLUTIUM_CONSTRUCTOR_LAUNCH_ACCESS:{token:'launch-token',expiresAt:'2099-01-01T00:00:00.000Z'}}});

const input={catalog_item_id:'33333333-3333-4333-8333-333333333333',modality:'virtual' as const,private_virtual_url:'https://private.example/room',total_capacity:10,is_free:true,sessions:[{starts_at:'2026-09-01T10:00:00.000Z',ends_at:'2026-09-01T11:00:00.000Z'}]};
const response=(body:unknown,status=200)=>({ok:status>=200&&status<300,status,json:async()=>body});
const options={baseUrl:'https://app.solutium.app'};

test('admin API reuses launch auth and returns typed list/detail URLs',async()=>{
  const calls: Array<[string,RequestInit]> = [];
  globalThis.fetch=(async(url:string,init:RequestInit)=>{calls.push([url,init]);return response(url.endsWith(activityId)?{success:true,activity:{id:activityId,privateVirtualUrl:'https://private.example/room',sessions:[],readiness:{bookable:true,reasons:[],whatsapp:'ready'}}}:{success:true,activities:[{id:activityId,sessions:[]}]}) as never;}) as never;
  const list=await listReservasWebActivities(projectId,options);const detail=await getReservasWebActivity(projectId,activityId,options);
  assert.equal(calls[0][0],`https://app.solutium.app/api/reservas-web/admin/projects/${projectId}/activities`);
  assert.equal(calls[1][0],`${calls[0][0]}/${activityId}`);
  assert.equal((calls[0][1].headers as Record<string,string>).Authorization,'Bearer launch-token');
  assert.equal(list[0].id,activityId);assert.equal(detail.privateVirtualUrl,'https://private.example/room');
});

test('create keeps one idempotency key for a logical retry and a new key for a new attempt',async()=>{
  const keys:string[]=[];
  globalThis.fetch=(async(_url:string,init:RequestInit)=>{keys.push((init.headers as Record<string,string>)['Idempotency-Key']);return response({success:true,activity:{id:activityId}}) as never;}) as never;
  const attempt=createReservasWebActivityAttempt(options);await attempt.create(projectId,input);await attempt.create(projectId,input);const second=createReservasWebActivityAttempt(options);await second.create(projectId,input);
  assert.equal(keys[0],keys[1]);assert.notEqual(keys[0],keys[2]);assert.ok(keys[0].length<=200);assert.notEqual(createReservasWebActivityIdempotencyKey(),createReservasWebActivityIdempotencyKey());
});

test('create uses POST and patch preserves omitted fields, null and explicit empty sessions',async()=>{
  const calls:RequestInit[]=[];
  globalThis.fetch=(async(_url:string,init:RequestInit)=>{calls.push(init);return response({success:true,activity:{id:activityId}}) as never;}) as never;
  await createReservasWebActivity(projectId,input,'logical-key',options);await updateReservasWebActivity(projectId,activityId,{private_virtual_url:null},options);await updateReservasWebActivity(projectId,activityId,{sessions:[]},options);
  assert.equal(calls[0].method,'POST');assert.equal((calls[0].headers as Record<string,string>)['Idempotency-Key'],'logical-key');assert.equal(calls[1].method,'PATCH');assert.deepEqual(JSON.parse(String(calls[1].body)),{private_virtual_url:null});assert.deepEqual(JSON.parse(String(calls[2].body)),{sessions:[]});
});

test('error mapping keeps status/domain code and sanitizes server responses',async()=>{
  for(const [status,code] of [[401,'HTTP_401'],[403,'HTTP_403'],[404,'ACTIVITY_NOT_FOUND'],[409,'IDEMPOTENCY_CONFLICT'],[422,'SESSION_INVALID'],[500,'SQL secret']] as const){globalThis.fetch=(async()=>response({success:false,error:code,message:'SQL password=secret'},status) as never) as never;await assert.rejects(()=>listReservasWebActivities(projectId,options),(error:unknown)=>error instanceof ReservasWebAdminApiError&&error.status===status&&error.code===code&&!error.message.includes('secret'));}
});

test('client source has no service role, settings persistence or reservation/provider DTO fields',()=>{
  const source=fs.readFileSync(new URL('../src/services/reservasWebAdminApi.ts',import.meta.url),'utf8');
  assert.doesNotMatch(source,/service_role|localStorage|admin_idempotency_fingerprint|providerCredentials|reservations|participants/i);
  assert.match(source,/getStoredLaunchAccessSession/);assert.match(source,/getAppMadreBaseUrl/);
});
