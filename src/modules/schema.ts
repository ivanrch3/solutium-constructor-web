import { ModuleDefinition, getModuleDefinition } from './registry';

export const getModuleSchema = (type: string) => {
  const def = getModuleDefinition(type);
  return def?.schema || [];
};
