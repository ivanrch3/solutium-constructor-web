
export type SettingGroupType = 'contenido' | 'estructura' | 'estilo' | 'tipografia' | 'multimedia' | 'interaccion' | 'secciones' | 'eyebrow' | 'title' | 'subtitle' | 'description' | 'texto_rotativo';

export type SettingType = 
  | 'text' | 'number' | 'color' | 'gradient' | 'select' | 'boolean' | 'range' | 'button' 
  | 'image' | 'icon' | 'product_selection' | 'customer_selection' | 'repeater' | 'url'
  | 'typography_size' | 'font_weight' | 'text_align' | 'text_decoration' | 'toggle_group';

export interface SettingCondition {
  settingId: string;
  value: any;
  operator?: 'eq' | 'neq' | 'includes' | 'not_includes';
  message?: string;
}

export interface SettingDefinition {
  id: string;
  label: string;
  type: SettingType;
  defaultValue: any;
  options?: { label: string; value: any; icon?: string }[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  icon?: string;
  description?: string;
  placeholder?: string;
  fields?: SettingDefinition[];
  /** Used for typography_size to filter available levels (e.g. ['t1', 't2']) */
  allowedLevels?: string[];
  disableAdd?: boolean;
  disabledMessage?: string;
  showIf?: SettingCondition;
  disabledIf?: SettingCondition;
}

export interface ModuleElement {
  id: string;
  name: string;
  type: string;
  groups: SettingGroupType[];
  settings?: Partial<Record<SettingGroupType, SettingDefinition[]>>;
}

export interface WebModule {
  id: string;
  type: string;
  iconKey?: string;
  name: string;
  elements: ModuleElement[];
  globalGroups: SettingGroupType[];
  globalSettings?: Partial<Record<SettingGroupType, SettingDefinition[]>>;
}

export interface EditorState {
  addedModules: WebModule[];
  expandedModuleId: string | null;
  selectedElementId: string | null;
  expandedGroupsByElement: Record<string, SettingGroupType | null>;
  settingsValues: Record<string, any>;
  recentlyAddedModuleId?: string | null;
  totalModulesAdded?: number;
  showMenuRecommendation?: boolean;
}
