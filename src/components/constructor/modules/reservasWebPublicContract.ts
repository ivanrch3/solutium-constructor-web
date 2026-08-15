import type { ReservasWebPublishedSnapshot } from './reservasWebPublishedContract';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export const readReservasWebPublishedSnapshot = (value: unknown): ReservasWebPublishedSnapshot | null => {
  if (!isRecord(value) || !isRecord(value.activities)) return null;
  const identifiers = value.activities.publicActivityIdentifiers;
  if (!Array.isArray(identifiers) || identifiers.some((identifier) => typeof identifier !== 'string')) return null;
  if (!isRecord(value.display) || !isRecord(value.content) || !isRecord(value.style) || typeof value.version !== 'number') return null;

  return value as unknown as ReservasWebPublishedSnapshot;
};

export const getPrimaryPublicReservasWebActivityIdentifier = (snapshot: ReservasWebPublishedSnapshot | null): string | null => {
  const identifier = snapshot?.activities.publicActivityIdentifiers[0];
  return typeof identifier === 'string' && identifier.trim() ? identifier.trim() : null;
};
