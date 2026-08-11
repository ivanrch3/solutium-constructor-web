import { getAppMadreBaseUrl } from './secureLaunchSession';

export type PublicReservasWebActivity = {
  publicId: string;
  title: string;
  shortDescription: string | null;
  longDescription: string | null;
  image: string | null;
  facilitator: string | null;
  modality: string;
  location: string | null;
  maps: string | null;
  sessions: Array<{ startsAt: string; endsAt: string; sequence: number }>;
  timezone: string;
  pricing: { isFree: boolean; regularPrice: number; promotionalPrice: number | null; promotionEndsAt: string | null; effectivePrice: number; currency: string };
  booking: { enabled: boolean; closesAt: string | null; started: boolean; soldOut: boolean; waitlistAvailable: boolean };
  capacity: { visible: boolean; total?: number; available?: number };
  countdownTarget: string | null;
};

export class PublicReservasWebApiError extends Error {
  constructor(public readonly status: number) {
    super('PUBLIC_RESERVAS_WEB_REQUEST_FAILED');
    this.name = 'PublicReservasWebApiError';
  }
}

export class PublicReservasWebHoldError extends Error {
  constructor(public readonly status: number, public readonly code: string) {
    super('PUBLIC_RESERVAS_WEB_HOLD_FAILED');
    this.name = 'PublicReservasWebHoldError';
  }
}

export type PublicReservasWebHold = { holdToken: string; quantity: number; expiresAt: string; availableCapacity: number; idempotentReplay: boolean };

export const buildPublicReservasWebActivityUrl = (publicIdentifier: string, baseUrl = getAppMadreBaseUrl()) =>
  `${baseUrl.replace(/\/+$/, '')}/api/public/reservas-web/activities/${encodeURIComponent(publicIdentifier)}`;

const asText = (value: unknown): string | null => typeof value === 'string' && value.trim() ? value.trim() : null;
const asNumber = (value: unknown): number => typeof value === 'number' && Number.isFinite(value) ? value : 0;
const asOptionalNumber = (value: unknown): number | undefined => typeof value === 'number' && Number.isFinite(value) ? value : undefined;
const asRecord = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};

const sanitizeActivity = (value: unknown): PublicReservasWebActivity | null => {
  const activity = asRecord(value);
  const title = asText(activity.title);
  const publicId = asText(activity.publicId);
  if (!title || !publicId) return null;

  const pricing = asRecord(activity.pricing);
  const booking = asRecord(activity.booking);
  const capacity = asRecord(activity.capacity);
  const sessions = Array.isArray(activity.sessions)
    ? activity.sessions.map((entry) => {
      const session = asRecord(entry);
      const startsAt = asText(session.startsAt);
      const endsAt = asText(session.endsAt);
      return startsAt && endsAt ? { startsAt, endsAt, sequence: asNumber(session.sequence) } : null;
    }).filter((entry): entry is { startsAt: string; endsAt: string; sequence: number } => Boolean(entry))
    : [];

  return {
    publicId,
    title,
    shortDescription: asText(activity.shortDescription),
    longDescription: asText(activity.longDescription),
    image: asText(activity.image),
    facilitator: asText(activity.facilitator),
    modality: asText(activity.modality) || '',
    location: asText(activity.location),
    maps: asText(activity.maps),
    sessions,
    timezone: asText(activity.timezone) || 'UTC',
    pricing: { isFree: pricing.isFree === true, regularPrice: asNumber(pricing.regularPrice), promotionalPrice: asText(pricing.promotionalPrice) === null ? asOptionalNumber(pricing.promotionalPrice) ?? null : asOptionalNumber(pricing.promotionalPrice) ?? null, promotionEndsAt: asText(pricing.promotionEndsAt), effectivePrice: asNumber(pricing.effectivePrice), currency: asText(pricing.currency) || 'USD' },
    booking: { enabled: booking.enabled === true, closesAt: asText(booking.closesAt), started: booking.started === true, soldOut: booking.soldOut === true, waitlistAvailable: booking.waitlistAvailable === true },
    capacity: { visible: capacity.visible === true, ...(asOptionalNumber(capacity.total) !== undefined ? { total: asOptionalNumber(capacity.total) } : {}), ...(asOptionalNumber(capacity.available) !== undefined ? { available: asOptionalNumber(capacity.available) } : {}) },
    countdownTarget: asText(activity.countdownTarget)
  };
};

export const getPublicReservasWebActivity = async (
  publicIdentifier: string,
  signal?: AbortSignal,
  baseUrl = getAppMadreBaseUrl()
): Promise<PublicReservasWebActivity | null> => {
  const identifier = publicIdentifier.trim();
  if (!identifier) return null;

  const response = await fetch(buildPublicReservasWebActivityUrl(identifier, baseUrl), {
    method: 'GET',
    headers: { Accept: 'application/json' },
    credentials: 'omit',
    signal
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new PublicReservasWebApiError(response.status);

  const payload = await response.json().catch(() => null) as { success?: boolean; activity?: unknown } | null;
  return payload?.success === true ? sanitizeActivity(payload.activity) : null;
};

export const createPublicReservasWebHold = async (
  publicIdentifier: string,
  quantity: number,
  idempotencyKey: string,
  signal?: AbortSignal,
  baseUrl = getAppMadreBaseUrl()
): Promise<PublicReservasWebHold> => {
  const identifier = publicIdentifier.trim();
  if (!identifier || !Number.isInteger(quantity) || quantity < 1 || quantity > 100 || !idempotencyKey.trim()) {
    throw new PublicReservasWebHoldError(400, 'INVALID_HOLD_REQUEST');
  }

  const response = await fetch(`${buildPublicReservasWebActivityUrl(identifier, baseUrl)}/holds`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    credentials: 'omit',
    body: JSON.stringify({ quantity, idempotencyKey: idempotencyKey.trim() }),
    signal
  });
  const payload = await response.json().catch(() => null) as Record<string, unknown> | null;
  const code = asText(payload?.error) || 'PUBLIC_RESERVAS_REQUEST_FAILED';
  if (!response.ok || payload?.success !== true) throw new PublicReservasWebHoldError(response.status, code);

  const holdToken = asText(payload.holdToken);
  const expiresAt = asText(payload.expiresAt);
  const responseQuantity = asOptionalNumber(payload.quantity);
  const availableCapacity = asOptionalNumber(payload.availableCapacity);
  if (!holdToken || !expiresAt || !responseQuantity || availableCapacity === undefined) {
    throw new PublicReservasWebHoldError(502, 'PUBLIC_RESERVAS_REQUEST_FAILED');
  }
  return { holdToken, expiresAt, quantity: responseQuantity, availableCapacity, idempotentReplay: payload.idempotentReplay === true };
};
