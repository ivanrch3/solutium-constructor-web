/** Produces the flat, section-scoped settings contract used by published sites. */
export const buildPublishedModuleSettings = (
  settingsValues: Record<string, unknown>,
  moduleId: string
): Record<string, unknown> => {
  const prefix = `${moduleId}_`;
  const settings: Record<string, unknown> = {};

  Object.entries(settingsValues || {}).forEach(([key, rawValue]) => {
    if (!key.startsWith(prefix)) return;
    const value = rawValue && typeof rawValue === 'object' && !Array.isArray(rawValue) && 'value' in rawValue
      ? (rawValue as { value: unknown }).value
      : rawValue;
    settings[key.slice(prefix.length)] = value;
  });

  return settings;
};
