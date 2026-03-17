export interface Module {
  id: string;
  type: string;
  data: any;
}

export type PageLayout = 'windows' | 'seamless' | 'layered' | 'bento' | 'snap' | 'split' | 'symmetric';

export interface AssetSettings {
  domain: string;
  seo_title: string;
  seo_description: string;
  tags?: string[];
  page_layout?: PageLayout;
}

export interface Asset {
  id: string;
  name: string;
  modules: Module[];
  settings?: AssetSettings;
  selected_product_ids?: string[];
}

export interface Project {
  id: string;
  name: string;
  assets: Asset[];
}

export interface BuilderState {
  projects: Project[];
  active_project_id: string | null;
  active_asset_id: string | null;
  modules: Module[];
  is_dirty: boolean;
  is_saving: boolean;
  last_saved: Date | null;
  selected_module_id: string | null;
  editing_module_id: string | null;
  asset_settings: AssetSettings;
  selected_product_ids: string[];
}
