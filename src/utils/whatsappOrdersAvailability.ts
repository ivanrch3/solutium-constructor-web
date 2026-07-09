export type WhatsAppOrdersAvailabilityState = 'allowed' | 'blocked' | 'unknown';

export interface ResolveWhatsAppOrdersAvailabilityInput {
  planSlug?: string | null;
  isTrialUser?: boolean | null;
  trialStartedAt?: string | null;
  now?: Date;
}

export interface WhatsAppOrdersAvailability {
  known: boolean;
  allowed: boolean;
  state: WhatsAppOrdersAvailabilityState;
  normalizedPlanSlug: string | null;
  message: string | null;
  reason:
    | 'allowed'
    | 'plan_not_allowed'
    | 'trial_active'
    | 'trial_expired'
    | 'trial_data_unavailable'
    | 'unknown_plan'
    | 'missing_plan';
}

const TRIAL_WINDOW_DAYS = 15;
const UPGRADE_MESSAGE = 'Disponible en planes superiores';

const normalizePlanSlug = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;

  if (normalized === 'expansión') return 'expansion';
  return normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

export const resolveWhatsAppOrdersAvailability = (
  input: ResolveWhatsAppOrdersAvailabilityInput
): WhatsAppOrdersAvailability => {
  const planSlug = normalizePlanSlug(input.planSlug);
  const now = input.now instanceof Date ? input.now : new Date();

  if (!planSlug) {
    return {
      known: false,
      allowed: true,
      state: 'unknown',
      normalizedPlanSlug: null,
      message: null,
      reason: 'missing_plan'
    };
  }

  if (planSlug === 'emprendiendo' || planSlug === 'expansion') {
    return {
      known: true,
      allowed: true,
      state: 'allowed',
      normalizedPlanSlug: planSlug,
      message: null,
      reason: 'allowed'
    };
  }

  if (planSlug === 'exploracion') {
    return {
      known: true,
      allowed: false,
      state: 'blocked',
      normalizedPlanSlug: planSlug,
      message: UPGRADE_MESSAGE,
      reason: 'plan_not_allowed'
    };
  }

  if (planSlug === 'esencial') {
    if (input.isTrialUser !== true) {
      return {
        known: true,
        allowed: false,
        state: 'blocked',
        normalizedPlanSlug: planSlug,
        message: UPGRADE_MESSAGE,
        reason: 'trial_expired'
      };
    }

    const trialStartedAt = typeof input.trialStartedAt === 'string' ? input.trialStartedAt.trim() : '';
    const trialStartMs = Date.parse(trialStartedAt);
    if (!trialStartedAt || !Number.isFinite(trialStartMs)) {
      return {
        known: true,
        allowed: false,
        state: 'blocked',
        normalizedPlanSlug: planSlug,
        message: UPGRADE_MESSAGE,
        reason: 'trial_data_unavailable'
      };
    }

    const trialEndsAt = new Date(trialStartMs);
    trialEndsAt.setUTCDate(trialEndsAt.getUTCDate() + TRIAL_WINDOW_DAYS);

    if (now.getTime() < trialEndsAt.getTime()) {
      return {
        known: true,
        allowed: true,
        state: 'allowed',
        normalizedPlanSlug: planSlug,
        message: null,
        reason: 'trial_active'
      };
    }

    return {
      known: true,
      allowed: false,
      state: 'blocked',
      normalizedPlanSlug: planSlug,
      message: UPGRADE_MESSAGE,
      reason: 'trial_expired'
    };
  }

  return {
    known: false,
    allowed: true,
    state: 'unknown',
    normalizedPlanSlug: planSlug,
    message: null,
    reason: 'unknown_plan'
  };
};
