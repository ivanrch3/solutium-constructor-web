import { WebModule } from '../types/constructor';
import { resolveModuleDisplayLabel, resolveSectionHref } from './menuNavigation';

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
      const baseLabel = resolveModuleDisplayLabel(module);
      const count = (labelCounts.get(baseLabel) || 0) + 1;
      labelCounts.set(baseLabel, count);
      return {
        label: count > 1 ? `${baseLabel} (${count})` : baseLabel,
        value: resolveSectionHref(module.id)
      };
    });

  const baseOptions = [{ label: 'Seleccione una sección', value: '' }, ...options];
  const currentString = String(currentValue || '').trim();
  const isAnchor = currentString.startsWith('#');
  const hasCurrentOption = baseOptions.some((option) => option.value === currentString);

  if (isAnchor && !hasCurrentOption) {
    return [{ label: `No disponible (${currentString})`, value: currentString }, ...baseOptions];
  }

  return baseOptions;
};
