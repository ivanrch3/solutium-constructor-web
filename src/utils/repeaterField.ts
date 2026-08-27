export const resolveRepeaterFieldEffectiveValue = (
  item: Record<string, unknown> | null | undefined,
  settingId: string,
  fields: Array<{ id: string; defaultValue?: unknown }> = []
) => {
  if (item && item[settingId] !== undefined) return item[settingId];
  return fields.find((field) => field.id === settingId)?.defaultValue;
};

export const evaluateRepeaterShowIf = (
  item: Record<string, unknown> | null | undefined,
  condition: any,
  fields: Array<{ id: string; defaultValue?: unknown }> = []
) => {
  if (!condition) return true;
  const currentValue = resolveRepeaterFieldEffectiveValue(item, condition.settingId, fields);
  const expected = condition.value;
  if (condition.operator === 'neq') return currentValue !== expected;
  if (condition.operator === 'includes') return Array.isArray(expected) && expected.includes(currentValue);
  return Array.isArray(expected) ? expected.includes(currentValue) : currentValue === expected;
};

export const getRepeaterFieldIdentity = (parentContext: string | undefined, item: Record<string, unknown> | null | undefined, index: number, fieldId: string) => {
  const base = `${parentContext || 'root'}__item_${item?.id || index}`;
  return { itemContextId: base, fieldKey: `${base}__${fieldId}` };
};
