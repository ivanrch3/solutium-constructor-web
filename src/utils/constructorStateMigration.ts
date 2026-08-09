import type { EditorState, ModuleElement, WebModule } from '../types/constructor';

const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export const isPersistentModuleInstanceId = (value: string) =>
  /^mod_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

const isPersistentModuleId = (value: string) => isUuid(value) || isPersistentModuleInstanceId(value);

const getElementSuffix = (elementId: string, moduleId: string) =>
  elementId.startsWith(`${moduleId}_`) ? elementId.slice(moduleId.length + 1) : elementId;

/**
 * Migrates legacy module ids without losing their instance-scoped settings.
 *
 * Older drafts can contain a registry id such as `mod_special_event_1` while
 * their element definitions are still unprefixed. The former migration only
 * remapped settings when those element ids already contained the module id,
 * leaving values behind under the retired id after the module was upgraded.
 */
export const migrateEditorStateToPersistentModuleIds = (
  state: EditorState,
  createModuleId: () => string
): EditorState => {
  const modules = Array.isArray(state.addedModules) ? state.addedModules : [];
  const idMap = new Map<string, string>();

  modules.forEach((module) => {
    if (module?.id && !isPersistentModuleId(module.id)) {
      idMap.set(module.id, createModuleId());
    }
  });

  if (idMap.size === 0) return state;

  const settingsValues: Record<string, unknown> = {};
  Object.entries(state.settingsValues || {}).forEach(([key, value]) => {
    let migratedKey = key;

    for (const [oldId, newId] of idMap) {
      if (key.startsWith(`${oldId}_`)) {
        migratedKey = `${newId}${key.slice(oldId.length)}`;
        break;
      }

      const legacyModule = modules.find((module) => module.id === oldId);
      const hasUnprefixedElementKey = (legacyModule?.elements || []).some((element: ModuleElement) =>
        !element.id.startsWith(`${oldId}_`) && key.startsWith(`${element.id}_`)
      );
      if (hasUnprefixedElementKey) {
        migratedKey = `${newId}_${key}`;
        break;
      }
    }

    settingsValues[migratedKey] = value;
  });

  const addedModules = modules.map((module): WebModule => {
    const newId = idMap.get(module.id);
    if (!newId) return module;

    return {
      ...module,
      id: newId,
      elements: (module.elements || []).map((element) => ({
        ...element,
        id: `${newId}_${getElementSuffix(element.id, module.id)}`
      }))
    };
  });

  const remapScopedId = (value: string | null) => {
    if (!value) return value;
    for (const [oldId, newId] of idMap) {
      if (value === oldId) return newId;
      if (value.startsWith(`${oldId}_`)) return `${newId}${value.slice(oldId.length)}`;
    }
    return value;
  };

  return {
    ...state,
    addedModules,
    settingsValues,
    expandedModuleId: remapScopedId(state.expandedModuleId),
    selectedElementId: remapScopedId(state.selectedElementId)
  };
};
