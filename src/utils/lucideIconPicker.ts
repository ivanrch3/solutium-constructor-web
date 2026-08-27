type LucideExport = {
  $$typeof?: unknown;
  displayName?: unknown;
  render?: unknown;
};

export const normalizeLucideIconSearch = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
};

export const isValidLucideIconExport = (name: unknown, value: unknown): boolean => {
  if (typeof name !== 'string' || !/^[A-Z]/.test(name)) return false;
  if (!value || typeof value !== 'object') return false;

  const icon = value as LucideExport;
  return Boolean(icon.$$typeof) && typeof icon.render === 'function' && typeof icon.displayName === 'string';
};

export const getAvailableLucideIconNames = (exports: Record<string, unknown>): string[] => {
  const validNames = new Set(
    Object.entries(exports)
      .filter(([name, value]) => isValidLucideIconExport(name, value))
      .map(([name]) => name)
  );

  return Array.from(validNames)
    .filter((name) => !name.endsWith('Icon') || !validNames.has(name.slice(0, -4)))
    .sort((a, b) => a.localeCompare(b));
};

export const filterLucideIconNames = (iconNames: readonly string[], search: unknown): string[] => {
  const normalizedSearch = normalizeLucideIconSearch(search);
  if (!normalizedSearch) return [];

  return iconNames.filter((iconName) =>
    normalizeLucideIconSearch(iconName).includes(normalizedSearch)
  );
};
