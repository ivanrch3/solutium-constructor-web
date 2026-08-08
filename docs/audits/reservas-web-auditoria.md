# Auditoría técnica — Reservas Web

**Fecha:** 2026-08-07 · **Alcance:** solo lectura.  
Etiquetas: **[C]** confirmado en código; **[I]** inferencia; **[P]** propuesta.

## 1. Resumen ejecutivo

**[P]** Reservas Web debe ser un módulo visual `reservas_web` en el Constructor y un
subdominio transaccional de la App Madre. El snapshot publicado contiene únicamente
configuración y referencias; disponibilidad, holds, reservas, PII y mensajes se leen
mediante una API pública mínima y mutan exclusivamente mediante RPCs transaccionales.
No se debe convertir `products` ni `whatsapp_orders` en reservas.

La dependencia crítica es App Madre: antes de exponer el módulo debe existir una
conexión Genius elegible, el backend de capacidad atómica y las rutas públicas. El
Constructor puede configurar y renderizar el shell del módulo, pero nunca ser fuente
de verdad de cupos.

Benchmark SOP: Eventbrite contabiliza órdenes pendientes como capacidad ocupada y
abre waitlist cuando no hay tickets; permite liberación manual. Ticket Tailor y Cvent
exponen el estado de lista de espera en administración; Calendly aplica límites como
restricción de disponibilidad. Adoptar: capacidad centralizada, cierre de venta y
lista manual MVP. No adoptar aún promoción automática ni calendarios complejos.

## 2. Estado de repositorios

| Repositorio | Rama | Modificados | No rastreados |
|---|---|---|---|
| Constructor Web | `main` | ninguno | ninguno |
| App Madre | `codex/solutium-go-official-whatsapp-channel` | `components/admin/SolutiumGoAdminPanel.tsx`, `controllers/solutiumGoAdminController.ts`, `server.ts`, `services/solutiumGoAdminClient.ts`, `tests/solutiumGoAdmin.test.ts` | `migrations/20260807_solutium_go_official_whatsapp_settings.sql`, `services/solutiumGoOfficialWhatsappService.ts` |

Esos cambios de App Madre no pertenecen a esta auditoría y no fueron tocados.

## 3–4. Reutilización

**Reutilizable [C].** `registry.tsx`, `StructurePanel`, `Canvas` y `Viewer` ya tienen
registro por tipo, settings con claves profundas y renderizadores explícitos. El
bridge de hidratación establece que las deep keys prevalecen y no deben hidratarse con
`if(value)`. `products` ya resuelve selección y snapshot de ítems. `ContactModule`
ofrece patrón de ubicación/mapa; `SettingControl` soporta imagen, icono, toggles,
selectores y tipografía. `WebConstructor` publica a `web_builder_sites.content_published`
y `published_sites.content`; el backend hace `upsert` por `site_id` y por
`project_id,app_id,site_id`.

**No reutilizar [C/P].** `ProductsModule` ni `WhatsAppOrders` como entidad de reserva:
sus contratos congelan datos de catálogo y sus cupos no son autoridad transaccional.
El widget `GeniusWebWaModule` genera `wa.me` directo y no selecciona un canal ni deja
historial. Las tablas `appointments` y el catálogo de sistema `system_whatsapp_bookings`
son indicios de Agenda/Genius, pero la migración declara expresamente que no entrega
runtime transaccional completo; no satisfacen cupos de talleres.

## 5–12. Arquitectura, datos, estados, cupos, holds, concurrencia e idempotencia

**[P] Nombres consistentes:** usar prefijo `web_reservation_` para evitar confundir
Agenda y órdenes. Todas las tablas incluyen `id uuid`, `project_id`, `created_at`,
`updated_at`; las operativas llevan `archived_at` cuando proceda.

| Tabla propuesta | Campos / relaciones esenciales | Índices y restricciones |
|---|---|---|
| `web_reservation_activities` | `site_id`, `module_id`, `catalog_item_id -> products`, facilitador, modalidad, ubicación/mapa, enlace virtual cifrado, inicio/fin, timezone, cierre, capacidad, precio/configuración de pago, `whatsapp_channel_id` | unique `(project_id,site_id,module_id,archived_at)` parcial; índices `(project_id,start_at)`, catálogo; `capacity_total >= 0` |
| `web_reservation_sessions` | `activity_id`, inicio/fin, orden; permite varios días | `(activity_id,start_at)`; no se requiere para MVP de una sesión |
| `web_reservation_holds` | `activity_id`, `quantity`, `idempotency_key`, `expires_at`, `status=active|converted|expired|released`, payload efímero | unique `(activity_id,idempotency_key)`; parcial active por expiración |
| `web_reservations` | `activity_id`, `hold_id`, `customer_id?`, contacto WhatsApp, estado, `reserved_at`, `payment_due_at`, `confirmed_at`, precio/moneda/promoción/condiciones snapshot, pago | unique `(project_id,idempotency_key)`; índices `(activity_id,status)`, `(payment_due_at)` |
| `web_reservation_participants` | `reservation_id`, nombre/apellido, sexo, nacimiento, cédula cifrada o protegida | índice reservation; no unique global de cédula |
| `web_reservation_waitlist` | `activity_id`, WhatsApp, nombre, estado `waiting|notified|withdrawn`, notified_at | índice FIFO `(activity_id,status,created_at)` |
| `web_reservation_messages` | `reservation_id`, canal, destinatario, plantilla/tipo, estado, provider, provider_message_id, error, timestamps, idempotency_key | unique parcial `(reservation_id,idempotency_key)`; proveedor-message único si disponible |
| `web_reservation_events` | entidad, tipo, actor, request_id, metadata sanitizada | `(project_id,entity_type,entity_id,created_at)` |
| `web_reservation_portal_links` | `activity_id`, `token_hash`, scope, expires_at, revoked_at, created_by/last_used | `token_hash unique`, índices estado/expiración |

**Estados [P].** Reserva: `pending_payment -> confirmed` o `cancelled`; `pending_payment`
con `payment_due_at < now()` se presenta como **pago vencido**, no cambia ni libera
cupo. Hold: `active -> converted|expired|released`. Lista: `waiting -> notified|withdrawn`.

**Cupos [P].** `available = capacity_total - active_holds.quantity - pending_payment.participants - confirmed.participants`.
`cancelled` es cero. El umbral público se calcula con `pending_payment + confirmed >= 5`;
solo entonces se devuelven total/disponible. Al inicio o cierre no se crean holds.

**RPC atómica [P].** `try_create_web_reservation_hold(project, activity, quantity,
idempotency_key, request_fingerprint)` debe: (1) validar proyecto/actividad/ventana,
(2) tomar `SELECT ... FOR UPDATE` de la actividad, (3) expirar holds activos vencidos,
(4) sumar ocupación con bloqueo, (5) insertar o devolver el hold idempotente, y
(6) fallar `CAPACITY_EXHAUSTED` sin insertar si no alcanza. Devuelve hold/expiración
en una única transacción. `convert_hold_to_reservation` bloquea hold+actividad, valida
expiración y crea la reserva con `payment_due_at +24h`.

Esto sigue el patrón confirmado de RPCs `security definer`, operaciones atómicas e
idempotency keys de carritos/quotes de WhatsApp y créditos. No confiar en React ni en
un `count` previo. Todas las mutaciones aceptan key UUID, guardan hash de payload y
devuelven el resultado original si es el mismo request; la misma key con payload
distinto devuelve conflicto. Confirmación, cancelación, CRM y send-outbox también
requieren claves únicas por acción.

## 13–22. Integraciones

**Catálogo [C/P].** `products` pertenece a `project_id`; el contexto seguro del
Constructor ya entrega productos/categorías y el módulo products snapshottea datos.
Exigir `catalog_item_id` en actividad. Snapshot: nombre, descripción corta, imagen
resuelta y precio de referencia para el visual; referencia viva: ID y actividad.
Precio final siempre se snapshottea en reserva. No asumir que `category_id` o tabla
de imágenes tienen contrato adicional: requiere validar esquema al implementar.

**Assets [C/P].** App Madre expone `assets` por proyecto y `assetController` registra
activos; Constructor ya carga assets seguros. Reutilizar su selector para imagen
subida e icono, y resolver primero imagen de producto como fallback. Alta futura debe
usar `origin_app = 'solutium constructor web'` (el código actual usa variante
`Constructor Web`; normalizar mediante contrato, no duplicar valores).

**CRM [C/P].** La entidad existente es `customers`, con consultas por `project_id`
y `phone`/`phone_secondary`; `geniusSalesContactResolverService` normaliza variantes
de teléfono. Identidad recomendada: WhatsApp normalizado como contacto principal;
cédula es atributo de participante, no identidad global automática. Crear/actualizar
el cliente en backend, añadir origen/actividad y tag mediante una futura capa CRM.
La auditoría no confirmó tablas de tags ni actividades: no inventar FKs; descubrirlas
antes de Fase CRM. Guardar asociación `customer_id` y `catalog_item_id` en reserva/evento.

**Genius/WhatsApp [C/P].** `whatsapp_channels` es por proyecto, con archivo/default;
`genius_channel_settings` es único por `(project_id,channel_id)` y sirve Meta y
Genius Flash/Evolution. Elegibilidad: canal no archivado, activo/conectado, dueño del
proyecto y compatible Genius. Cero: no publicable/operativo; uno: default; varios:
configuración obligatoria. El envío tiene precedentes de delivery con canal, provider,
`provider_message_id`, estado, error e idempotencia en `whatsappSalesQuoteSendService`;
encapsularlo tras un adaptador/outbox de Reservas, no acoplar al quote.

Genius normal puede aprovechar interactive messages **solo tras confirmar capacidad
del provider**. Genius Flash debe usar exclusivamente opciones `1/2/3`; hoy puede
resolver conversación, pero Reserva MVP necesita enlaces y mensajes salientes, no
un flujo conversacional para reservar. No diseñar botones para Flash.

Mensajes MVP [P]: outbox creada en la misma transacción que reserva/confirmación/
cancelación; worker envía participante y facilitador. Registrar `reservation_received`,
`payment_confirmed`, `cancelled`, destinatario, plantilla/snapshot, canal, provider,
intento, timestamps y error. Esto permite reintentos seguros.

**Pagos [P].** SINPE: actividad guarda teléfono, beneficiario, referencia y teléfono
de comprobante por separado. Onvopay: solo URL manual permitida por actividad; no
procesar tarjeta ni almacenar PAN. Ambos quedan `pending_payment` hasta confirmación
manual y snapshot de método/instrucciones en la reserva.

## 23–25. Facilitador, administración y enlaces seguros

Panel interno autenticado: rutas de proyecto con `requireProjectMember`/permiso
específico para listar por actividad, confirmar, cancelar, ver waitlist y mensajes.
Mobile-first: cards de reserva, filtros por estado, tabs, badges y confirm dialog;
es coherente con componentes administrativos existentes, pero debe implementarse
como panel propio.

Portal externo [P]: reutilizar el patrón de `catalog_export_public_links`: token de
32 bytes, SHA-256 almacenado, estado, expiración, revocación, contador y RLS. Para
Reservas no hace falta recuperar token cifrado: emitirlo una vez; si se requiere
revisualización administrativa, cifrarlo AES-GCM con AAD como el patrón existente.
Scope mínimo `activity:read, reservation:manage`; enlaces por actividad, revocables,
cortos, sin PII en URL. Cada request resuelve hash, comprueba estado/expiración y
limita rate; no usar un simple `siteId` o módulo como secreto.

## 26–32. Publicación, APIs, RPCs y RLS

**Contrato [P].** La sección publicada será `{type:'reservas_web', id, content,
settings}`. `content` incluye `activityRef` (ID, site/module), título/textos, visual,
layout y snapshot público permitido. `settings` conserva claves profundas y los seis
pilares. Viewer usa `hydrationBridge` sin sobrescribir `false`, `0` o cadena vacía.
La configuración se guarda con SIP: `content_draft`, después `content_published` y
`published_sites.content`; metadata siempre incluye `siteId` y `siteName`.

| Snapshot | Live exclusivamente |
|---|---|
| título/descripciones, configuración visual, catálogo snapshot, CTA, layout, modalidad/fecha visual y referencias | actividad operativa, inicio/cierre efectivo, cupos, holds, reservas, waitlist, pagos, PII, mensajes, canal, enlace virtual |

La fecha puede snapshotearse para paint inmediato, pero API debe devolver estado
operativo y Viewer mostrarlo como autoridad para no vender tras cambios/cierre.

**API pública [P].** `GET /public/reservas/:site/:module` devuelve DTO agregado sin
PII (actividad, disponibilidad solo si aplica umbral, abierto/cerrado); `POST .../holds`;
`POST .../reservations` con hold; `POST .../waitlist`. Respuestas de mutación no
permiten listar ni consultar reserva por identificador adivinable. Limitar tasa,
CORS al dominio publicado, validar origen/host, payload y captcha/antiabuso opcional.

**API autenticada/portal [P].** CRUD actividad y publicación, lista/lectura de
reservas, confirmar/cancelar, waitlist-notify, mensajes y crear/revocar portal links.
**RPCs:** `try_create_web_reservation_hold`, `convert_web_reservation_hold`,
`expire_web_reservation_holds`, `confirm_web_reservation_payment`,
`cancel_web_reservation`, `adjust_web_reservation_capacity`, `enqueue_web_reservation_message`.

**RLS [P].** Actividades/configuración: miembros del proyecto; PII/reservas/mensajes:
solo rol administrativo/facilitador con scope, nunca `anon`. Las RPC públicas son
`security definer`, con `search_path` fijo, validan que el módulo pertenezca a un
sitio publicado activo y retornan DTO mínimo. Auditoría indicó precedentes RLS por
proyecto en public links; hay que crear políticas explícitas por tabla.

## 33–39. Privacidad, cambios, UI y estilo

PII: cifrar cédula/fecha nacimiento en reposo o separarlas en tabla de acceso muy
restringido; minimizar sexo; no incluir ninguna en snapshot, HTML, logs, URLs ni
localStorage. Enmascarar WhatsApp en listas si el rol no necesita verlo. Log de eventos
solo metadata sanitizada. Definir retención/borrado y exportación antes de producción.

Waitlist MVP es FIFO, manual, sin asignación automática: cuando hay cupo, facilitador
marca `notified` y se registra evento/mensaje. Subir capacidad es válido; bajarla falla
si queda menor que `holds+pending+confirmed`; cancelar libera cupo; expirar hold lo
libera; pago vencido no. Cambios de fecha/hora/modalidad/ubicación/enlace/precio/cupos
crean `activity_updated` con diff y seleccionan reservas afectadas. Precio y condiciones
pasadas no mutan; enlace virtual solo se entrega después de confirmación.

Tipografía [C/P]: reutilizar `TYPOGRAPHY_SCALE` y pesos T1/T2/T3/P/S del Constructor,
incluidos controles `typography_size`/`font_weight`; no crear escala nueva. Settings
namespaced bajo `el_reservas_*`, organizados estrictamente: módulo/global, actividad
(Contenido); layout/lista/formulario (Estructura); cards/CTA/fondo/borde/radius
(Estilo); textos (Tipografía); icono/imágenes (Multimedia); CTA/countdown/toggles
(Interacción). Usar tema y container queries, nunca `window.innerWidth`.

Responsive [P]: móvil primero: card vertical por actividad, CTA ancho completo,
formulario por pasos, contador accesible; tablet 2 columnas de resumen/formulario;
desktop grid de actividades y panel lateral. Administrador/portal: filtros en sheet,
badges, acciones con confirmación y detalles expandibles.

## 40–43. Riesgos, compatibilidad, dependencias y fases

Riesgos: overselling si se consulta desde cliente; exposición PII; doble envío con
fallo ambiguo del provider; cambios de actividad contradictorios con snapshots;
canal Flash en beta/estado desconectado; diferencia de casing de `origin_app`; y
acoplar flujo a tablas de cotizaciones. Mitigar con RPC, outbox, DTOs, eventos,
preflight de canal y contratos versionados.

Compatibilidad: no tocar módulos legacy (`products_showcase`, `clients`, `conversion`),
cases de Canvas/Viewer ni bridges existentes. `reservas_web` es tipo nuevo con fallback
seguro de render. Dependencias: App Madre define tablas/RPC/API/canales/CRM y devuelve
contexto seguro; Constructor registra/configura/snapshottea; Viewer resuelve DTO vivo
por sitio publicado. El `appId` es `11111111-1111-1111-1111-111111111111`.

Fases propuestas:

1. Contrato y migraciones revisadas (tablas, RLS, DTOs, eventos, feature gate).
2. Motor atómico de actividad/capacidad/hold + pruebas de concurrencia e idempotencia.
3. Reserva, participantes, precio snapshot y pago manual; API pública endurecida.
4. Outbox WhatsApp, selección/capability de canal y trazabilidad; CRM adapter.
5. Registro `reservas_web`, editor seis pilares, selección catálogo/assets y publish contract.
6. Viewer/live DTO, countdown, formulario y waitlist pública.
7. Panel interno mobile-first y portal seguro de facilitador.
8. Cambios de actividad, notificación manual asistida y reglas de capacidad.
9. QA: RLS/PII, carga concurrente, reintentos provider, Flash numérico, responsive,
draft/published/legacy y pruebas end-to-end.

## Evidencia principal

- Constructor: `src/components/constructor/registry.tsx`, `Canvas.tsx`, `Viewer.tsx`,
  `WebConstructor.tsx`, `utils/hydrationBridge.ts`, `constants/typography.ts`.
- App Madre: `controllers/appLauncherController.ts` (draft/publish/context);
  `migrations/20260630_whatsapp_sales_carts_v1.sql` y
  `20260702_whatsapp_sales_cart_to_quote_atomic.sql` (atómicos);
  `services/whatsappSalesQuoteSendService.ts` (delivery);
  `services/geniusSalesContactResolverService.ts` (CRM);
  `migrations/20240511_gf4b2_whatsapp_channels_multinumber.sql` y
  `20260512_gf4d1_genius_channel_settings.sql` (canales);
  `migrations/20260726_catalog_export_public_links.sql` y
  `services/catalogExportPublicLinkService.ts` (secure links).
