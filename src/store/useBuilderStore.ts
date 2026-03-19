import { create } from 'zustand';
import { Module, Project, AssetSettings } from '../types';
import { getModuleDefinition } from '../modules/registry';

interface BuilderStore {
  // State
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
  autoSaveInterval: number;
  businessContext: {
    name: string;
    sector: string;
    description: string;
    objective: string;
    visualStyle: string;
  } | null;
  
  // Actions
  setProjects: (projects: Project[]) => void;
  setActiveProject: (projectId: string) => void;
  setActiveAsset: (assetId: string) => void;
  setModules: (modules: Module[]) => void;
  setAutoSaveInterval: (interval: number) => void;
  setBusinessContext: (context: BuilderStore['businessContext']) => void;
  
  // Module Actions
  addModule: (type: string) => void;
  removeModule: (id: string) => void;
  updateModule: (id: string, data: any) => void;
  reorderModules: (newModules: Module[]) => void;
  
  // Selection Actions
  selectModule: (id: string | null) => void;
  editModule: (id: string | null) => void;
  
  // Settings Actions
  updateAssetSettings: (settings: Partial<AssetSettings>) => void;
  updateAssetName: (name: string) => void;
  updateSelectedProducts: (productIds: string[]) => void;
  
  // Save Actions
  setDirty: (isDirty: boolean) => void;
  setSaving: (isSaving: boolean) => void;
  setLastSaved: (date: Date) => void;
}

export const useBuilderStore = create<BuilderStore>((set, get) => ({
  projects: [],
  activeProjectId: null,
  activeAssetId: null,
  modules: [],
  isDirty: false,
  isSaving: false,
  lastSaved: null,
  selectedModuleId: null,
  editingModuleId: null,
  assetSettings: {
    domain: '',
    seoTitle: '',
    seoDescription: '',
    tags: [],
    pageLayout: 'seamless'
  },
  selectedProductIds: [],
  autoSaveInterval: 60000, // 1 minute default
  businessContext: null,

  setProjects: (projects) => set({ projects }),
  
  setActiveProject: (projectId) => set({ activeProjectId: projectId }),
  
  setActiveAsset: (assetId) => {
    const { projects, activeProjectId } = get();
    const project = projects.find(p => p.id === activeProjectId);
    const asset = project?.assets?.find(a => a.id === assetId);
    
    set({ 
      activeAssetId: assetId,
      modules: asset?.modules || [],
      assetSettings: asset?.settings || { domain: '', seoTitle: '', seoDescription: '', pageLayout: 'seamless' },
      selectedProductIds: asset?.selectedProductIds || [],
      isDirty: false,
      selectedModuleId: null,
      editingModuleId: null,
      businessContext: asset?.businessContext || null
    });
  },

  setModules: (modules) => set({ modules }),

  setAutoSaveInterval: (interval) => set({ autoSaveInterval: interval }),

  setBusinessContext: (context) => set({ businessContext: context }),

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
      isDirty: !!state.activeAssetId,
      selectedModuleId: newModule.id,
      editingModuleId: newModule.id
    }));
  },

  removeModule: (id) => {
    set((state) => ({
      modules: state.modules.filter(m => m.id !== id),
      isDirty: !!state.activeAssetId,
      selectedModuleId: state.selectedModuleId === id ? null : state.selectedModuleId,
      editingModuleId: state.editingModuleId === id ? null : state.editingModuleId
    }));
  },

  updateModule: (id, data) => {
    set((state) => ({
      modules: state.modules.map(m => 
        m.id === id ? { ...m, data: { ...m.data, ...data } } : m
      ),
      isDirty: !!state.activeAssetId
    }));
  },

  reorderModules: (newModules) => {
    const { activeAssetId } = get();
    set({ modules: newModules, isDirty: !!activeAssetId });
  },

  selectModule: (id) => set({ selectedModuleId: id }),
  
  editModule: (id) => set({ editingModuleId: id }),

  updateAssetSettings: (settings) => {
    set((state) => ({
      assetSettings: { ...state.assetSettings, ...settings },
      isDirty: !!state.activeAssetId
    }));
  },

  updateAssetName: (name) => {
    const { projects, activeProjectId, activeAssetId } = get();
    const updatedProjects = projects.map(p => {
      if (p.id === activeProjectId) {
        return {
          ...p,
          assets: p.assets.map(a => 
            a.id === activeAssetId ? { ...a, name } : a
          )
        };
      }
      return p;
    });
    set({ projects: updatedProjects, isDirty: !!activeAssetId });
  },

  updateSelectedProducts: (productIds) => {
    const { activeAssetId } = get();
    set({ selectedProductIds: productIds, isDirty: !!activeAssetId });
  },

  setDirty: (isDirty) => set({ isDirty }),
  setSaving: (isSaving) => set({ isSaving }),
  setLastSaved: (date) => set({ lastSaved: date })
}));
