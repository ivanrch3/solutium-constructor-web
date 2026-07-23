import type { PhoneCountry } from '../constants/phoneCountries';
import {
  findPhoneCountry,
  migrateLegacyWhatsApp,
  normalizeNationalPhoneNumber,
  type StructuredPhone
} from './phoneCountry';

export type PublicWhatsAppOrderCustomerProfile = StructuredPhone & {
  name: string;
  email: string;
  whatsapp?: string;
};

const text = (value: unknown) => String(value || '').trim();

export const buildCustomerProfileStorageKey = (scopeId: string) =>
  `solutium_whatsapp_orders_customer_profile:${scopeId}`;

export const normalizePublicWhatsAppOrderCustomerProfile = (
  value: unknown,
  fallbackCountry: PhoneCountry
): PublicWhatsAppOrderCustomerProfile => {
  const candidate = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const country = findPhoneCountry(candidate.phoneCountryCode) || fallbackCountry;
  const legacyPhone = migrateLegacyWhatsApp(candidate.whatsapp, country);
  const phoneNationalNumber = normalizeNationalPhoneNumber(
    candidate.phoneNationalNumber ?? legacyPhone.phoneNationalNumber
  );

  return {
    name: text(candidate.name),
    email: text(candidate.email),
    phoneCountryCode: country.countryCode,
    phoneCallingCode: country.callingCode,
    phoneNationalNumber,
    whatsapp: text(candidate.whatsapp) || undefined
  };
};

export const mergePublicWhatsAppOrderCustomerProfiles = (
  primary: PublicWhatsAppOrderCustomerProfile | null,
  fallback: PublicWhatsAppOrderCustomerProfile | null,
  defaultCountry: PhoneCountry
): PublicWhatsAppOrderCustomerProfile => {
  const preferredPhone = primary?.phoneNationalNumber ? primary : fallback;
  return {
    name: primary?.name || fallback?.name || '',
    email: primary?.email || fallback?.email || '',
    phoneCountryCode: preferredPhone?.phoneCountryCode || defaultCountry.countryCode,
    phoneCallingCode: preferredPhone?.phoneCallingCode || defaultCountry.callingCode,
    phoneNationalNumber: preferredPhone?.phoneNationalNumber || '',
    whatsapp: preferredPhone?.whatsapp || fallback?.whatsapp
  };
};
