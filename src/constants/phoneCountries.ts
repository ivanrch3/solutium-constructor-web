export type PhoneCountry = {
  countryCode: string;
  countryName: string;
  callingCode: string;
};

// The picker derives flags from ISO codes so country data remains easy to maintain.
export const PHONE_COUNTRIES: PhoneCountry[] = [
  ['AR', 'Argentina', '+54'], ['AU', 'Australia', '+61'], ['AT', 'Austria', '+43'],
  ['BE', 'Belgica', '+32'], ['BO', 'Bolivia', '+591'], ['BR', 'Brasil', '+55'],
  ['CA', 'Canada', '+1'], ['CL', 'Chile', '+56'], ['CO', 'Colombia', '+57'],
  ['CR', 'Costa Rica', '+506'], ['CU', 'Cuba', '+53'], ['DO', 'Republica Dominicana', '+1'],
  ['EC', 'Ecuador', '+593'], ['SV', 'El Salvador', '+503'], ['ES', 'Espana', '+34'],
  ['US', 'Estados Unidos', '+1'], ['FR', 'Francia', '+33'], ['DE', 'Alemania', '+49'],
  ['GT', 'Guatemala', '+502'], ['HN', 'Honduras', '+504'], ['IE', 'Irlanda', '+353'],
  ['IT', 'Italia', '+39'], ['JM', 'Jamaica', '+1'], ['JP', 'Japon', '+81'],
  ['MX', 'Mexico', '+52'], ['NI', 'Nicaragua', '+505'], ['NZ', 'Nueva Zelanda', '+64'],
  ['PA', 'Panama', '+507'], ['PY', 'Paraguay', '+595'], ['PE', 'Peru', '+51'],
  ['PR', 'Puerto Rico', '+1'], ['PT', 'Portugal', '+351'], ['GB', 'Reino Unido', '+44'],
  ['UY', 'Uruguay', '+598'], ['VE', 'Venezuela', '+58'], ['ZA', 'Sudafrica', '+27'],
  ['AE', 'Emiratos Arabes Unidos', '+971'], ['CN', 'China', '+86'], ['IN', 'India', '+91'],
  ['KR', 'Corea del Sur', '+82'], ['PH', 'Filipinas', '+63'], ['SG', 'Singapur', '+65'],
  ['CH', 'Suiza', '+41'], ['SE', 'Suecia', '+46'], ['NO', 'Noruega', '+47'], ['DK', 'Dinamarca', '+45'],
  ['NL', 'Paises Bajos', '+31'], ['PL', 'Polonia', '+48'], ['TR', 'Turquia', '+90']
].map(([countryCode, countryName, callingCode]) => ({ countryCode, countryName, callingCode }));

export const PHONE_COUNTRY_FALLBACK = 'CR';

export const getPhoneCountryFlag = (countryCode: string) => {
  const normalized = String(countryCode || '').trim().toUpperCase();
  return /^[A-Z]{2}$/.test(normalized)
    ? String.fromCodePoint(...[...normalized].map((letter) => 0x1F1E6 + letter.charCodeAt(0) - 65))
    : '';
};
