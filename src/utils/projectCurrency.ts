export type ProjectCurrencySettings = {
  currency: string;
  showDecimals: boolean;
  decimalCount: number;
  locale: string;
};

type ProjectCurrencySource = {
  currency?: unknown;
  showDecimals?: unknown;
  show_decimals?: unknown;
  decimalCount?: unknown;
  decimal_count?: unknown;
  locale?: unknown;
  regionalSettings?: unknown;
} | null | undefined;

const LEGACY_PROJECT_CURRENCY: ProjectCurrencySettings = {
  currency: 'USD',
  showDecimals: true,
  decimalCount: 2,
  locale: 'en-US'
};

const LOCALE_BY_CURRENCY: Record<string, string> = {
  CRC: 'es-CR',
  USD: 'en-US',
  EUR: 'es-ES',
  GBP: 'en-GB',
  BRL: 'pt-BR',
  MXN: 'es-MX'
};

const toBoolean = (value: unknown, fallback: boolean) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'si'].includes(normalized)) return true;
    if (['false', '0', 'no'].includes(normalized)) return false;
  }
  return fallback;
};

const toDecimalCount = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.min(6, Math.trunc(parsed))) : fallback;
};

export const resolveProjectCurrencySettings = (source: ProjectCurrencySource): ProjectCurrencySettings => {
  const nested = source?.regionalSettings && typeof source.regionalSettings === 'object'
    ? source.regionalSettings as Record<string, unknown>
    : null;
  const requestedCurrency = String(source?.currency ?? nested?.currency ?? '').trim().toUpperCase();
  const currency = /^[A-Z]{3}$/.test(requestedCurrency) ? requestedCurrency : LEGACY_PROJECT_CURRENCY.currency;
  const showDecimals = toBoolean(
    source?.showDecimals ?? source?.show_decimals ?? nested?.showDecimals,
    LEGACY_PROJECT_CURRENCY.showDecimals
  );
  const decimalCount = toDecimalCount(
    source?.decimalCount ?? source?.decimal_count ?? nested?.decimalCount,
    LEGACY_PROJECT_CURRENCY.decimalCount
  );
  const requestedLocale = String(source?.locale ?? nested?.locale ?? '').trim();

  return {
    currency,
    showDecimals,
    decimalCount,
    locale: requestedLocale || LOCALE_BY_CURRENCY[currency] || LEGACY_PROJECT_CURRENCY.locale
  };
};

export const formatProjectCurrency = (amount: unknown, settings: ProjectCurrencySettings) => {
  const numericAmount = Number(amount);
  const safeAmount = Number.isFinite(numericAmount) ? numericAmount : 0;
  const fractionDigits = settings.showDecimals ? settings.decimalCount : 0;

  try {
    return new Intl.NumberFormat(settings.locale, {
      style: 'currency',
      currency: settings.currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits
    }).format(safeAmount);
  } catch {
    return new Intl.NumberFormat(settings.locale, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits
    }).format(safeAmount);
  }
};
