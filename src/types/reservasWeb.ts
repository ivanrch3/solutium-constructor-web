export type ReservasWebWhatsAppReadiness =
  | 'ready'
  | 'unavailable'
  | 'selection_required'
  | 'invalid_selection';

export type ReservasWebEligibleWhatsAppChannel = {
  id: string;
  displayLabel: string;
  phoneNumber: string | null;
  mode: 'genius' | 'flash';
  connected: boolean;
};

export type ReservasWebSessionSummary = {
  count: number;
  firstStartsAt: string | null;
  firstEndsAt: string | null;
};

export type ReservasWebActivitySummary = {
  id: string;
  publicIdentifier?: string | null;
  catalogItemId: string | null;
  catalogItemName: string | null;
  catalogItemImageUrl: string | null;
  title: string;
  shortDescription: string | null;
  facilitator: string | null;
  modality: string | null;
  status: string | null;
  archivedAt?: string | null;
  bookable?: boolean | null;
  readinessReasons?: string[];
  timezone: string | null;
  sessionsSummary: ReservasWebSessionSummary;
  totalCapacity: number | null;
  isFree: boolean;
  regularPrice: number | null;
  promotionalPrice: number | null;
  promotionEndsAt: string | null;
  currency: string | null;
  selectedWhatsAppChannelId: string | null;
  whatsappReadiness: ReservasWebWhatsAppReadiness;
};

export const isReservasWebActivityArchived = (activity: Pick<ReservasWebActivitySummary, 'status' | 'archivedAt'>) =>
  Boolean(activity.archivedAt) || activity.status === 'archived';
