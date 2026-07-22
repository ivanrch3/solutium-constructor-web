import { PHONE_COUNTRIES, PHONE_COUNTRY_FALLBACK, type PhoneCountry } from '../constants/phoneCountries';

export type StructuredPhone = {
  phoneCountryCode: string;
  phoneCallingCode: string;
  phoneNationalNumber: string;
};

const normalizeCountryCode = (value: unknown) => String(value || '').trim().toUpperCase();
const digitsOnly = (value: unknown) => String(value || '').replace(/\D/g, '');

export const findPhoneCountry = (countryCode: unknown): PhoneCountry | undefined =>
  PHONE_COUNTRIES.find((country) => country.countryCode === normalizeCountryCode(countryCode));

export const getDefaultPhoneCountry = () =>
  findPhoneCountry(PHONE_COUNTRY_FALLBACK) || PHONE_COUNTRIES[0];

const getCountryFromLocale = (locale: unknown): string | null => {
  const match = String(locale || '').trim().match(/[-_]([A-Za-z]{2})(?:$|[-_])/);
  return match ? normalizeCountryCode(match[1]) : null;
};

export const resolveInitialPhoneCountry = (source?: Record<string, unknown> | null, locales?: readonly string[]) => {
  const configuredCode = normalizeCountryCode(
    source?.phoneCountryCode
    ?? source?.phone_country_code
    ?? source?.countryCode
    ?? source?.country_code
    ?? source?.country
  );
  const configured = findPhoneCountry(configuredCode);
  if (configured) return configured;

  const configuredLocale = getCountryFromLocale(source?.locale ?? (source?.regionalSettings as any)?.locale);
  const fromConfiguredLocale = findPhoneCountry(configuredLocale);
  if (fromConfiguredLocale) return fromConfiguredLocale;

  const browserLocales = locales || (typeof navigator === 'undefined' ? [] : navigator.languages?.length ? navigator.languages : [navigator.language]);
  for (const locale of browserLocales) {
    const country = findPhoneCountry(getCountryFromLocale(locale));
    if (country) return country;
  }

  return getDefaultPhoneCountry();
};

export const normalizeNationalPhoneNumber = (value: unknown) => digitsOnly(value).slice(0, 15);

export const buildInternationalPhone = (phone: StructuredPhone) => {
  const callingDigits = digitsOnly(phone.phoneCallingCode);
  const nationalDigits = normalizeNationalPhoneNumber(phone.phoneNationalNumber);
  return callingDigits && nationalDigits ? `+${callingDigits}${nationalDigits}` : '';
};

export const getPhoneValidationError = (phone: StructuredPhone): string | null => {
  if (!findPhoneCountry(phone.phoneCountryCode)) return 'Selecciona un pais.';
  if (!digitsOnly(phone.phoneCallingCode)) return 'Selecciona un pais.';
  const rawNationalNumber = String(phone.phoneNationalNumber || '').trim();
  if (!rawNationalNumber) return 'Ingresa tu numero de WhatsApp.';
  if (/[A-Za-z]/.test(rawNationalNumber)) return 'El numero de WhatsApp no es valido.';
  const nationalDigits = normalizeNationalPhoneNumber(rawNationalNumber);
  if (nationalDigits.length < 6 || nationalDigits.length > 15) return 'El numero de WhatsApp no es valido.';
  return null;
};

export const migrateLegacyWhatsApp = (whatsapp: unknown, fallbackCountry: PhoneCountry): StructuredPhone => {
  const raw = String(whatsapp || '').trim();
  const digits = digitsOnly(raw);
  const matchingCountry = raw.startsWith('+')
    ? [...PHONE_COUNTRIES]
      .sort((left, right) => right.callingCode.length - left.callingCode.length)
      .find((country) => digits.startsWith(digitsOnly(country.callingCode)))
    : undefined;
  const country = matchingCountry || fallbackCountry;
  const callingDigits = digitsOnly(country.callingCode);
  const nationalDigits = matchingCountry ? digits.slice(callingDigits.length) : digits;

  return {
    phoneCountryCode: country.countryCode,
    phoneCallingCode: country.callingCode,
    phoneNationalNumber: nationalDigits
  };
};
