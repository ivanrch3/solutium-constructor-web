const SOLUTIUM_REFERRAL_QUERY_KEY = 'ref';

const SOLUTIUM_HOSTS = new Set([
  'solutium.app',
  'www.solutium.app',
  'app.solutium.app',
  'constructor.solutium.app'
]);

const LOCAL_SOLUTIUM_HOSTS = new Set([
  'localhost',
  '127.0.0.1'
]);

const SOLUTIUM_REFERRAL_PATHS = new Set([
  '/',
  '/login',
  '/register',
  '/onboarding'
]);

const ABSOLUTE_URL_PATTERN = /^[a-zA-Z][a-zA-Z\d+\-.]*:/;

export const normalizeReferralCode = (value: unknown) =>
  typeof value === 'string'
    ? value.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '').slice(0, 48)
    : '';

export const extractReferralCodeFromSearch = (search: string) => {
  const params = new URLSearchParams(search);
  return normalizeReferralCode(params.get(SOLUTIUM_REFERRAL_QUERY_KEY));
};

const normalizePathname = (pathname: string) => {
  if (!pathname) return '/';
  const trimmed = pathname.replace(/\/+$/, '');
  return trimmed || '/';
};

const isSolutiumHostname = (hostname: string) => {
  const normalized = hostname.trim().toLowerCase();
  return SOLUTIUM_HOSTS.has(normalized) || LOCAL_SOLUTIUM_HOSTS.has(normalized);
};

const isEligibleSolutiumPath = (pathname: string) => {
  return SOLUTIUM_REFERRAL_PATHS.has(normalizePathname(pathname));
};

const isSpecialProtocolUrl = (rawUrl: string) => {
  const lowerUrl = rawUrl.trim().toLowerCase();
  return (
    lowerUrl.startsWith('mailto:') ||
    lowerUrl.startsWith('tel:') ||
    lowerUrl.startsWith('sms:') ||
    lowerUrl.startsWith('whatsapp:') ||
    lowerUrl.startsWith('javascript:') ||
    lowerUrl.startsWith('data:') ||
    lowerUrl.startsWith('blob:')
  );
};

const shouldReturnRelativeUrl = (rawUrl: string, resolvedUrl: URL, baseOrigin: string) => {
  if (rawUrl.startsWith('/')) return true;
  if (rawUrl.startsWith('?')) return true;
  if (rawUrl.startsWith('./') || rawUrl.startsWith('../')) return true;
  if (!ABSOLUTE_URL_PATTERN.test(rawUrl) && !rawUrl.startsWith('//') && resolvedUrl.origin === baseOrigin) {
    return true;
  }
  return false;
};

const toRelativeUrl = (url: URL) => {
  return `${url.pathname}${url.search}${url.hash}`;
};

export const appendReferralParamToSolutiumUrl = (rawUrl: string, refCode: string, baseOrigin?: string) => {
  const normalizedRefCode = normalizeReferralCode(refCode);
  const trimmedUrl = String(rawUrl || '').trim();

  if (!normalizedRefCode || !trimmedUrl) return trimmedUrl;
  if (trimmedUrl.startsWith('#') || isSpecialProtocolUrl(trimmedUrl)) return trimmedUrl;

  const origin = baseOrigin || (typeof window !== 'undefined' ? window.location.origin : 'https://solutium.app');

  let resolvedUrl: URL;
  try {
    resolvedUrl = new URL(trimmedUrl, origin);
  } catch {
    return trimmedUrl;
  }

  if (!['http:', 'https:'].includes(resolvedUrl.protocol)) return trimmedUrl;
  if (!isSolutiumHostname(resolvedUrl.hostname)) return trimmedUrl;
  if (!isEligibleSolutiumPath(resolvedUrl.pathname)) return trimmedUrl;
  if (normalizeReferralCode(resolvedUrl.searchParams.get(SOLUTIUM_REFERRAL_QUERY_KEY)) || resolvedUrl.searchParams.has(SOLUTIUM_REFERRAL_QUERY_KEY)) {
    return trimmedUrl;
  }

  resolvedUrl.searchParams.set(SOLUTIUM_REFERRAL_QUERY_KEY, normalizedRefCode);

  if (shouldReturnRelativeUrl(trimmedUrl, resolvedUrl, origin)) {
    return toRelativeUrl(resolvedUrl);
  }

  return resolvedUrl.toString();
};

