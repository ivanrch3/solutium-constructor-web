import { WebModule } from '../types/constructor';
import { resolveModuleEditorLabel, resolveSectionHref } from './menuNavigation';

export type InternalSectionOption = { label: string; value: string };

export const resolveSectionLinkControlMode = (linkType: unknown): 'internal' | 'external' =>
  linkType === 'internal' ? 'internal' : 'external';

export const buildInternalSectionOptions = (
  modules: WebModule[] = [],
  currentModuleId?: string,
  currentValue?: unknown
): InternalSectionOption[] => {
  const labelCounts = new Map<string, number>();
  const options = modules
    .filter((module) => module?.id && module.id !== currentModuleId)
    .map((module) => {
      const baseLabel = resolveModuleEditorLabel(module);
      const count = (labelCounts.get(baseLabel) || 0) + 1;
      labelCounts.set(baseLabel, count);
      return {
        label: count > 1 ? `${baseLabel} (${count})` : baseLabel,
        value: resolveSectionHref(module.id)
      };
    });

  const baseOptions = [{ label: 'Seleccione una sección', value: '' }, ...options];
  const currentString = String(currentValue || '').trim();
  const currentCanonical = currentString ? resolveSectionHref(currentString) : '';
  const matchedOption = options.find((option) => option.value === currentCanonical);
  const optionsWithLegacySelection = matchedOption && currentString !== matchedOption.value
    ? baseOptions.map((option) => option.value === matchedOption.value ? { ...option, value: currentString } : option)
    : baseOptions;
  const hasCurrentOption = optionsWithLegacySelection.some((option) => option.value === currentString);

  if (currentString && currentString !== '#' && !hasCurrentOption) {
    return [{ label: `No disponible (${currentString})`, value: currentString }, ...optionsWithLegacySelection];
  }

  return optionsWithLegacySelection;
};
