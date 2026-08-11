export const RESERVAS_WEB_CONFIG_VERSION = 1 as const;
export const RESERVAS_WEB_CONFIG_SETTING = 'el_reservas_web_config';

export type ReservasWebConfigV1 = {
  version: typeof RESERVAS_WEB_CONFIG_VERSION;
  activities: { mode: 'selected'; activityIds: string[] };
  display: { showPrice: boolean; showTotalCapacity: boolean; showAvailableCapacity: boolean; showCountdown: boolean };
  content: { reserveButtonLabel: string };
  style: Record<string, never>;
};

const uniqueIds = (value: unknown): string[] => Array.isArray(value)
  ? Array.from(new Set(value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).map((item) => item.trim())))
  : [];

export const createDefaultReservasWebConfig = (): ReservasWebConfigV1 => ({
  version: RESERVAS_WEB_CONFIG_VERSION,
  activities: { mode: 'selected', activityIds: [] },
  display: { showPrice: true, showTotalCapacity: false, showAvailableCapacity: false, showCountdown: true },
  content: { reserveButtonLabel: 'Reservar' },
  style: {}
});

export const normalizeReservasWebConfig = (input: unknown): ReservasWebConfigV1 => {
  const fallback = createDefaultReservasWebConfig();
  if (!input || typeof input !== 'object' || Array.isArray(input)) return fallback;
  const source = input as Record<string, unknown>;
  const activities = source.activities && typeof source.activities === 'object' && !Array.isArray(source.activities) ? source.activities as Record<string, unknown> : {};
  const display = source.display && typeof source.display === 'object' && !Array.isArray(source.display) ? source.display as Record<string, unknown> : {};
  const content = source.content && typeof source.content === 'object' && !Array.isArray(source.content) ? source.content as Record<string, unknown> : {};
  return { version: RESERVAS_WEB_CONFIG_VERSION, activities: { mode: 'selected', activityIds: uniqueIds(activities.activityIds) }, display: {
    showPrice: typeof display.showPrice === 'boolean' ? display.showPrice : fallback.display.showPrice,
    showTotalCapacity: typeof display.showTotalCapacity === 'boolean' ? display.showTotalCapacity : fallback.display.showTotalCapacity,
    showAvailableCapacity: typeof display.showAvailableCapacity === 'boolean' ? display.showAvailableCapacity : fallback.display.showAvailableCapacity,
    showCountdown: typeof display.showCountdown === 'boolean' ? display.showCountdown : fallback.display.showCountdown
  }, content: { reserveButtonLabel: typeof content.reserveButtonLabel === 'string' ? content.reserveButtonLabel : fallback.content.reserveButtonLabel }, style: {} };
};

export const getReservasWebConfigSettingKey = (moduleId: string): string => `${moduleId}_${RESERVAS_WEB_CONFIG_SETTING}`;

export const setReservasWebActivityIds = (input: unknown, activityIds: unknown): ReservasWebConfigV1 => {
  const config = normalizeReservasWebConfig(input);
  return {
    ...config,
    activities: { mode: 'selected', activityIds: uniqueIds(activityIds) }
  };
};
