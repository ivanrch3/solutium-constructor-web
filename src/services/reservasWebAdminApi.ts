import { getAppMadreBaseUrl, getStoredLaunchAccessSession } from './secureLaunchSession';

export type ReservasWebActivitySession = {
  id?: string;
  starts_at?: string;
  ends_at?: string;
  startAt?: string;
  endAt?: string;
  sequence: number;
};

export type ReservasWebActivityListItem = {
  id: string;
  title: string | null;
  modality: string;
  status: string;
  archivedAt: string | null;
  totalCapacity: number;
  isFree: boolean;
  regularPrice: number | null;
  currency: string | null;
  sessions: Array<Pick<ReservasWebActivitySession, 'startAt' | 'endAt' | 'sequence'>>;
};

export type ReservasWebAdminReadiness = {
  bookable: boolean;
  reasons: string[];
  whatsapp: 'ready' | 'unavailable' | 'selection_required' | 'invalid_selection' | string;
};

export type ReservasWebActivityAdminDetail = {
  id: string;
  projectId: string;
  catalogItemId: string;
  catalogItem: { id: string; name: string; imageUrl: string | null } | null;
  title: string | null;
  shortDescription: string | null;
  expandedDescription: string | null;
  facilitator: string | null;
  facilitatorWhatsapp: string | null;
  modality: string;
  location: string | null;
  mapsUrl: string | null;
  privateVirtualUrl: string | null;
  timezone: string;
  bookingClosesAt: string | null;
  totalCapacity: number;
  isFree: boolean;
  regularPrice: number | null;
  promotionalPrice: number | null;
  promotionEndsAt: string | null;
  currency: string | null;
  sinpePhone: string | null;
  paymentReceiptWhatsapp: string | null;
  onvopayUrl: string | null;
  selectedWhatsappChannelId: string | null;
  status: string;
  archivedAt: string | null;
  sessions: ReservasWebActivitySession[];
  readiness: ReservasWebAdminReadiness;
};

export type ReservasWebActivitySessionInput = {
  starts_at: string;
  ends_at: string;
};

type ReservasWebActivityWritableFields = {
  catalog_item_id: string;
  title_override?: string | null;
  short_description_override?: string | null;
  long_description_override?: string | null;
  facilitator_name?: string | null;
  facilitator_whatsapp?: string | null;
  modality: 'presencial' | 'virtual' | 'hybrid';
  physical_location?: string | null;
  maps_url?: string | null;
  private_virtual_url?: string | null;
  timezone?: string | null;
  booking_closes_at?: string | null;
  total_capacity: number;
  is_free: boolean;
  regular_price?: number | null;
  promotional_price?: number | null;
  promotion_ends_at?: string | null;
  currency?: string | null;
  sinpe_phone?: string | null;
  payment_receipt_whatsapp?: string | null;
  onvopay_url?: string | null;
  selected_whatsapp_channel_id?: string | null;
  status?: string | null;
  archived_at?: string | null;
};

export type CreateReservasWebActivityInput = ReservasWebActivityWritableFields & {
  sessions: ReservasWebActivitySessionInput[];
};

export type UpdateReservasWebActivityPatch = Partial<ReservasWebActivityWritableFields> & {
  sessions?: ReservasWebActivitySessionInput[];
};

export class ReservasWebAdminApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string
  ) {
    super(message);
    this.name = 'ReservasWebAdminApiError';
  }
}

const authMessage = 'La sesión segura del Constructor ya no es válida. Por favor vuelve a lanzar el Constructor Web desde Solutium.';
const genericMessage = 'No se pudo completar la operación administrativa de Reservas Web.';
const parseErrorCode = (result: Record<string, unknown>, status: number) =>
  typeof result.error === 'string' && result.error.trim() ? result.error : `HTTP_${status}`;

type ReservasWebAdminApiOptions = { baseUrl?: string };

const requestReservasWebAdmin = async <T>(path: string, init: RequestInit = {}, options: ReservasWebAdminApiOptions = {}): Promise<T> => {
  const session = getStoredLaunchAccessSession();
  if (!session.active || !session.token) {
    throw new ReservasWebAdminApiError(authMessage, 401, 'LAUNCH_ACCESS_TOKEN_MISSING');
  }

  const response = await fetch(`${options.baseUrl || getAppMadreBaseUrl()}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${session.token}`,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers || {})
    }
  });
  const result = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok || result.success === false) {
    const code = parseErrorCode(result, response.status);
    const message = response.status === 401 || response.status === 403 ? authMessage : genericMessage;
    throw new ReservasWebAdminApiError(message, response.status, code);
  }
  return result as T;
};

const projectPath = (projectId: string) => `/api/reservas-web/admin/projects/${encodeURIComponent(projectId)}/activities`;

export const createReservasWebActivityIdempotencyKey = () => {
  if (typeof crypto?.randomUUID === 'function') return crypto.randomUUID();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const createReservasWebActivityAttempt = (options: ReservasWebAdminApiOptions = {}) => {
  const idempotencyKey = createReservasWebActivityIdempotencyKey();
  return {
    idempotencyKey,
    create: (projectId: string, input: CreateReservasWebActivityInput) =>
      createReservasWebActivity(projectId, input, idempotencyKey, options)
  };
};

export const listReservasWebActivities = async (projectId: string, options: ReservasWebAdminApiOptions = {}): Promise<ReservasWebActivityListItem[]> => {
  const result = await requestReservasWebAdmin<{ activities?: ReservasWebActivityListItem[] }>(projectPath(projectId), {}, options);
  return Array.isArray(result.activities) ? result.activities : [];
};

export const getReservasWebActivity = async (projectId: string, activityId: string, options: ReservasWebAdminApiOptions = {}): Promise<ReservasWebActivityAdminDetail> => {
  const result = await requestReservasWebAdmin<{ activity: ReservasWebActivityAdminDetail }>(`${projectPath(projectId)}/${encodeURIComponent(activityId)}`, {}, options);
  return result.activity;
};

export const createReservasWebActivity = async (
  projectId: string,
  input: CreateReservasWebActivityInput,
  idempotencyKey: string,
  options: ReservasWebAdminApiOptions = {}
): Promise<ReservasWebActivityAdminDetail> => {
  const result = await requestReservasWebAdmin<{ activity: ReservasWebActivityAdminDetail }>(projectPath(projectId), {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify(input)
  }, options);
  return result.activity;
};

export const updateReservasWebActivity = async (
  projectId: string,
  activityId: string,
  patch: UpdateReservasWebActivityPatch,
  options: ReservasWebAdminApiOptions = {}
): Promise<ReservasWebActivityAdminDetail> => {
  const result = await requestReservasWebAdmin<{ activity: ReservasWebActivityAdminDetail }>(`${projectPath(projectId)}/${encodeURIComponent(activityId)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch)
  }, options);
  return result.activity;
};

export const refreshReservasWebActivities = listReservasWebActivities;
