export interface Module {
  id: string;
  type: string;
  data: any;
}

export type PageLayout = 'windows' | 'seamless' | 'layered' | 'bento' | 'snap' | 'split' | 'symmetric';

export interface AssetSettings {
  domain: string;
  seoTitle: string;
  seoDescription: string;
  tags?: string[];
  pageLayout?: PageLayout;
}

export interface Asset {
  id: string;
  name: string;
  modules: Module[];
  settings?: AssetSettings;
  selectedProductIds?: string[];
  businessContext?: {
    name: string;
    sector: string;
    description: string;
    objective: string;
    visualStyle: string;
  } | null;
}

export interface Project {
  id: string;
  name: string;
  assets: Asset[];
  industry?: string;
}

export interface BuilderState {
  projects: Project[];
  activeProjectId: string | null;
  activeAssetId: string | null;
  modules: Module[];
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  selectedModuleId: string | null;
  editingModuleId: string | null;
  assetSettings: AssetSettings;
  selectedProductIds: string[];
}
