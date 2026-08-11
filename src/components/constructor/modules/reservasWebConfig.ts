export const RESERVAS_WEB_CONFIG_VERSION = 1 as const;
export const RESERVAS_WEB_CONFIG_SETTING = 'el_reservas_web_config';

export type ReservasWebConfigV1 = {
  version: typeof RESERVAS_WEB_CONFIG_VERSION;
  activities: { mode: 'selected'; activityIds: string[] };
  display: { showPrice: boolean; showTotalCapacity: boolean; showAvailableCapacity: boolean; showCountdown: boolean };
  content: { reserveButtonLabel: string };
  style: ReservasWebStyleV1;
};

export type ReservasWebStyleV1 = {
  surfaceColor: string;
  borderColor: string;
  borderRadius: number;
  padding: number;
  ctaBackgroundColor: string;
  ctaTextColor: string;
};

const uniqueIds = (value: unknown): string[] => Array.isArray(value)
  ? Array.from(new Set(value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).map((item) => item.trim())))
  : [];

const safeColor = (value: unknown, fallback: string): string => typeof value === 'string' && value.trim().length <= 32 ? value.trim() : fallback;
const safeNumber = (value: unknown, fallback: number, min: number, max: number): number => typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;

export const createDefaultReservasWebConfig = (): ReservasWebConfigV1 => ({
  version: RESERVAS_WEB_CONFIG_VERSION,
  activities: { mode: 'selected', activityIds: [] },
  display: { showPrice: true, showTotalCapacity: false, showAvailableCapacity: false, showCountdown: true },
  content: { reserveButtonLabel: 'Reservar' },
  style: { surfaceColor: '', borderColor: '', borderRadius: 16, padding: 20, ctaBackgroundColor: '', ctaTextColor: '' }
});

export const normalizeReservasWebConfig = (input: unknown): ReservasWebConfigV1 => {
  const fallback = createDefaultReservasWebConfig();
  if (!input || typeof input !== 'object' || Array.isArray(input)) return fallback;
  const source = input as Record<string, unknown>;
  const activities = source.activities && typeof source.activities === 'object' && !Array.isArray(source.activities) ? source.activities as Record<string, unknown> : {};
  const display = source.display && typeof source.display === 'object' && !Array.isArray(source.display) ? source.display as Record<string, unknown> : {};
  const content = source.content && typeof source.content === 'object' && !Array.isArray(source.content) ? source.content as Record<string, unknown> : {};
  const style = source.style && typeof source.style === 'object' && !Array.isArray(source.style) ? source.style as Record<string, unknown> : {};
  return { version: RESERVAS_WEB_CONFIG_VERSION, activities: { mode: 'selected', activityIds: uniqueIds(activities.activityIds) }, display: {
    showPrice: typeof display.showPrice === 'boolean' ? display.showPrice : fallback.display.showPrice,
    showTotalCapacity: typeof display.showTotalCapacity === 'boolean' ? display.showTotalCapacity : fallback.display.showTotalCapacity,
    showAvailableCapacity: typeof display.showAvailableCapacity === 'boolean' ? display.showAvailableCapacity : fallback.display.showAvailableCapacity,
    showCountdown: typeof display.showCountdown === 'boolean' ? display.showCountdown : fallback.display.showCountdown
  }, content: { reserveButtonLabel: typeof content.reserveButtonLabel === 'string' && content.reserveButtonLabel.trim() && !/[<>]/.test(content.reserveButtonLabel) ? content.reserveButtonLabel.trim().slice(0, 60) : fallback.content.reserveButtonLabel }, style: {
    surfaceColor: safeColor(style.surfaceColor, fallback.style.surfaceColor),
    borderColor: safeColor(style.borderColor, fallback.style.borderColor),
    borderRadius: safeNumber(style.borderRadius, fallback.style.borderRadius, 0, 32),
    padding: safeNumber(style.padding, fallback.style.padding, 12, 40),
    ctaBackgroundColor: safeColor(style.ctaBackgroundColor, fallback.style.ctaBackgroundColor),
    ctaTextColor: safeColor(style.ctaTextColor, fallback.style.ctaTextColor)
  } };
};

export const getReservasWebConfigSettingKey = (moduleId: string): string => `${moduleId}_${RESERVAS_WEB_CONFIG_SETTING}`;

export const setReservasWebActivityIds = (input: unknown, activityIds: unknown): ReservasWebConfigV1 => {
  const config = normalizeReservasWebConfig(input);
  return {
    ...config,
    activities: { mode: 'selected', activityIds: uniqueIds(activityIds) }
  };
};
