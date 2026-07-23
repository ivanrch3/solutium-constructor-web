const toBoolean = (value: unknown, fallback = false) => {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'si' || normalized === 'yes';
  }
  return Boolean(value);
};

export const resolveOrderNotesEnabled = (
  explicitAllowOrderNotes: unknown,
  legacyCustomerNotesEnabled: unknown
) => {
  if (explicitAllowOrderNotes !== undefined && explicitAllowOrderNotes !== null) {
    return toBoolean(explicitAllowOrderNotes, false);
  }
  if (legacyCustomerNotesEnabled !== undefined && legacyCustomerNotesEnabled !== null) {
    return toBoolean(legacyCustomerNotesEnabled, false);
  }
  return false;
};

export const normalizeOrderNotes = (value: unknown) => {
  if (typeof value !== 'string') return '';
  return value.slice(0, 1000);
};

export const getOrderNotesForRequest = (notes: string, allowOrderNotes: boolean) => {
  if (!allowOrderNotes) return undefined;
  return notes.trim() || null;
};
