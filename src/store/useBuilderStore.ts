import { create } from 'zustand';
import { Module, Project, AssetSettings } from '../types';
import { getModuleDefinition } from '../modules/registry';

interface BuilderStore {
  // State
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
  auto_save_interval: number;
  
  // Actions
  setProjects: (projects: Project[]) => void;
  setActiveProject: (project_id: string) => void;
  setActiveAsset: (asset_id: string) => void;
  setModules: (modules: Module[]) => void;
  setAutoSaveInterval: (interval: number) => void;
  
  // Module Actions
  addModule: (type: string) => void;
  removeModule: (id: string) => void;
  updateModule: (id: string, data: any) => void;
  reorderModules: (new_modules: Module[]) => void;
  
  // Selection Actions
  selectModule: (id: string | null) => void;
  editModule: (id: string | null) => void;
  
  // Settings Actions
  updateAssetSettings: (settings: Partial<AssetSettings>) => void;
  updateAssetName: (name: string) => void;
  update_selected_products: (product_ids: string[]) => void;
  
  // Save Actions
  setDirty: (is_dirty: boolean) => void;
  setSaving: (is_saving: boolean) => void;
  setLastSaved: (date: Date) => void;
}

export const useBuilderStore = create<BuilderStore>((set, get) => ({
  projects: [],
  active_project_id: null,
  active_asset_id: null,
  modules: [],
  is_dirty: false,
  is_saving: false,
  last_saved: null,
  selected_module_id: null,
  editing_module_id: null,
  asset_settings: {
    domain: '',
    seo_title: '',
    seo_description: '',
    tags: [],
    page_layout: 'seamless'
  },
  selected_product_ids: [],
  auto_save_interval: 60000, // 1 minute default

  setProjects: (projects) => set({ projects }),
  
  setActiveProject: (project_id) => set({ active_project_id: project_id }),
  
  setActiveAsset: (asset_id) => {
    const { projects, active_project_id } = get();
    const project = projects.find(p => p.id === active_project_id);
    const asset = project?.assets?.find(a => a.id === asset_id);
    
    set({ 
      active_asset_id: asset_id,
      modules: asset?.modules || [],
      asset_settings: asset?.settings || { domain: '', seo_title: '', seo_description: '', page_layout: 'seamless' },
      selected_product_ids: asset?.selected_product_ids || [],
      is_dirty: false,
      selected_module_id: null,
      editing_module_id: null
    });
  },

  setModules: (modules) => set({ modules }),

  setAutoSaveInterval: (interval) => set({ auto_save_interval: interval }),

  addModule: (type) => {
    const def = getModuleDefinition(type);
    const newModule: Module = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      data: { 
        ...(def?.defaultData || {}),
        smartMode: true 
      }
    };
    
    set((state) => ({
      modules: [...state.modules, newModule],
      is_dirty: true,
      selected_module_id: newModule.id,
      editing_module_id: newModule.id
    }));
  },

  removeModule: (id) => {
    set((state) => ({
      modules: state.modules.filter(m => m.id !== id),
      is_dirty: true,
      selected_module_id: state.selected_module_id === id ? null : state.selected_module_id,
      editing_module_id: state.editing_module_id === id ? null : state.editing_module_id
    }));
  },

  updateModule: (id, data) => {
    set((state) => ({
      modules: state.modules.map(m => 
        m.id === id ? { ...m, data: { ...m.data, ...data } } : m
      ),
      is_dirty: true
    }));
  },

  reorderModules: (new_modules) => {
    set({ modules: new_modules, is_dirty: true });
  },

  selectModule: (id) => set({ selected_module_id: id }),
  
  editModule: (id) => set({ editing_module_id: id }),

  updateAssetSettings: (settings) => {
    set((state) => ({
      asset_settings: { ...state.asset_settings, ...settings },
      is_dirty: true
    }));
  },

  updateAssetName: (name) => {
    const { projects, active_project_id, active_asset_id } = get();
    const updatedProjects = projects.map(p => {
      if (p.id === active_project_id) {
        return {
          ...p,
          assets: p.assets.map(a => 
            a.id === active_asset_id ? { ...a, name } : a
          )
        };
      }
      return p;
    });
    set({ projects: updatedProjects, is_dirty: true });
  },

  update_selected_products: (product_ids) => {
    set({ selected_product_ids: product_ids, is_dirty: true });
  },

  setDirty: (is_dirty) => set({ is_dirty }),
  setSaving: (is_saving) => set({ is_saving }),
  setLastSaved: (date) => set({ last_saved: date })
}));
