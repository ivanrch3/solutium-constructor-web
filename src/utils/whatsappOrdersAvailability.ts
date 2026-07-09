export type WhatsAppOrdersAvailabilityState = 'allowed' | 'blocked' | 'unknown';

export type WhatsAppOrdersCapabilityReason =
  | 'allowed'
  | 'plan_not_allowed'
  | 'trial_expired'
  | 'system_not_ready'
  | 'dependency_missing';

export interface WhatsAppOrdersCapability {
  enabled?: boolean;
  reason?: WhatsAppOrdersCapabilityReason | string | null;
}

export interface ResolveWhatsAppOrdersAvailabilityInput {
  capability?: WhatsAppOrdersCapability | null;
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
    | 'system_not_ready'
    | 'dependency_missing'
    | 'unknown_plan'
    | 'missing_plan';
}

const TRIAL_WINDOW_DAYS = 15;
const UPGRADE_MESSAGE = 'Disponible en planes superiores.';
const SYSTEM_NOT_READY_MESSAGE = 'El sistema de pedidos por WhatsApp aún no está configurado para este negocio.';
const DEPENDENCY_MISSING_MESSAGE = 'El sistema de pedidos por WhatsApp requiere configuración adicional.';

const normalizePlanSlug = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;

  if (normalized === 'expansión') return 'expansion';
  return normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

export const extractWhatsAppOrdersCapability = (
  ...sources: unknown[]
): WhatsAppOrdersCapability | null => {
  for (const source of sources) {
    if (!source || typeof source !== 'object') continue;

    const candidate = source as Record<string, unknown>;
    const directEnabled = typeof candidate.enabled === 'boolean';
    const directReason =
      typeof candidate.reason === 'string' && candidate.reason.trim().length > 0
        ? candidate.reason.trim()
        : null;

    if (directEnabled || directReason) {
      return {
        enabled: directEnabled ? (candidate.enabled as boolean) : undefined,
        reason: directReason
      };
    }

    const nested = candidate.whatsapp_orders;
    if (!nested || typeof nested !== 'object') continue;

    const nestedRecord = nested as Record<string, unknown>;
    const nestedEnabled = typeof nestedRecord.enabled === 'boolean';
    const nestedReason =
      typeof nestedRecord.reason === 'string' && nestedRecord.reason.trim().length > 0
        ? nestedRecord.reason.trim()
        : null;

    if (nestedEnabled || nestedReason) {
      return {
        enabled: nestedEnabled ? (nestedRecord.enabled as boolean) : undefined,
        reason: nestedReason
      };
    }
  }

  return null;
};

const mapCapabilityMessage = (reason: string | null | undefined) => {
  switch (reason) {
    case 'plan_not_allowed':
    case 'trial_expired':
      return UPGRADE_MESSAGE;
    case 'system_not_ready':
      return SYSTEM_NOT_READY_MESSAGE;
    case 'dependency_missing':
      return DEPENDENCY_MISSING_MESSAGE;
    default:
      return UPGRADE_MESSAGE;
  }
};

export const resolveWhatsAppOrdersAvailability = (
  input: ResolveWhatsAppOrdersAvailabilityInput
): WhatsAppOrdersAvailability => {
  const explicitCapability = extractWhatsAppOrdersCapability(input.capability);
  if (explicitCapability && typeof explicitCapability.enabled === 'boolean') {
    const rawReason = explicitCapability.reason?.trim() || (explicitCapability.enabled ? 'allowed' : 'system_not_ready');
    const normalizedReason: WhatsAppOrdersAvailability['reason'] =
      rawReason === 'dependency_missing'
        ? 'dependency_missing'
        : rawReason === 'system_not_ready'
          ? 'system_not_ready'
          : rawReason === 'trial_expired'
            ? 'trial_expired'
            : rawReason === 'allowed'
              ? 'allowed'
              : 'plan_not_allowed';

    return {
      known: true,
      allowed: explicitCapability.enabled,
      state: explicitCapability.enabled ? 'allowed' : 'blocked',
      normalizedPlanSlug: null,
      message: explicitCapability.enabled ? null : mapCapabilityMessage(rawReason),
      reason: normalizedReason
    };
  }

  // Legacy fallback: keep the local plan/trial calculation only while older App Madre
  // environments may still omit capabilities.whatsapp_orders from launch/context/live payloads.
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
