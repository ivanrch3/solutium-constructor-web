
export type SettingGroupType = 'contenido' | 'estructura' | 'estilo' | 'tipografia' | 'multimedia' | 'interaccion';

export type SettingType = 'text' | 'number' | 'color' | 'select' | 'boolean' | 'range' | 'button' | 'image' | 'icon' | 'product_selection' | 'customer_selection' | 'repeater' | 'url';

export interface SettingDefinition {
  id: string;
  label: string;
  type: SettingType;
  defaultValue: any;
  options?: { label: string; value: any }[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  icon?: string;
  fields?: SettingDefinition[];
}

export interface ModuleElement {
  id: string;
  name: string;
  type: string;
  groups: SettingGroupType[];
  settings?: Record<SettingGroupType, SettingDefinition[]>;
}

export interface WebModule {
  id: string;
  type: string;
  name: string;
  elements: ModuleElement[];
  globalGroups: SettingGroupType[];
  globalSettings?: Record<SettingGroupType, SettingDefinition[]>;
}

export interface EditorState {
  addedModules: WebModule[];
  expandedModuleId: string | null;
  selectedElementId: string | null;
  expandedGroupsByElement: Record<string, SettingGroupType | null>;
  settingsValues: Record<string, any>;
}
