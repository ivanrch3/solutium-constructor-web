import { create } from 'zustand';
import { SiteContent, Section } from '../types';

interface EditorStoreState {
  siteContent: SiteContent;
  selectedSectionId: string | null;
  selectedElementId: string | null;
  history: SiteContent[];
  historyIndex: number;
  project: any | null;
  isGenerating: boolean;
  generationStep: number;
  generationSteps: string[];
  inlineEditingId: string | null;
  showMenuRecommendation: boolean;
  
  // Acciones
  setProject: (project: any) => void;
  setInlineEditingId: (id: string | null) => void;
  setShowMenuRecommendation: (show: boolean) => void;
  startAIGeneration: (brief: any) => Promise<void>;
  setGenerationStep: (step: number) => void;
  updateSectionSettings: (sectionId: string, settingsUpdate: Record<string, any>) => void;
  setSiteContent: (content: SiteContent) => void;
  selectSection: (id: string | null) => void;
  selectElement: (id: string | null) => void;
  updateTheme: (themeUpdate: any) => void;
  addSection: (section: Section) => void;
  removeSection: (id: string) => void;
  reorderSections: (startIndex: number, endIndex: number) => void;
  undo: () => void;
  redo: () => void;
}

const initialContent: SiteContent = {
  theme: {
    primaryColor: '#3b82f6',
    secondaryColor: '#1e293b',
    fontFamily: 'Inter',
    borderRadius: '0.5rem',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    alternatingDarkMode: false,
    alternatingThemeMode: false,
    themeBackgroundColor: '#1e293b',
    globalAnimationType: 'recommended'
  },
  sections: []
};

export const useEditorStore = create<EditorStoreState>((set, get) => ({
  siteContent: initialContent,
  selectedSectionId: null,
  selectedElementId: null,
  history: [initialContent],
  historyIndex: 0,
  project: null,
  isGenerating: false,
  generationStep: 0,
  generationSteps: [
    'Diseñando estructura estratégica...',
    'Redactando copys persuasivos...',
    'Personalizando identidad visual...',
    'Generando activos multimedia...',
    'Finalizando sitio...'
  ],
  inlineEditingId: null,
  showMenuRecommendation: false,
  
  setProject: (project) => set({ project }),

  setInlineEditingId: (id) => set({ inlineEditingId: id }),

  setShowMenuRecommendation: (show) => set({ showMenuRecommendation: show }),

  startAIGeneration: async (brief) => {
    const { generateSiteContent } = await import('../services/aiService');
    
    set({ isGenerating: true, generationStep: 0 });
    
    const progressInterval = setInterval(() => {
      set((state) => {
        if (state.generationStep < state.generationSteps.length - 2) {
          return { generationStep: state.generationStep + 1 };
        }
        return state;
      });
    }, 2500);

    try {
      const content = await generateSiteContent(brief);
      clearInterval(progressInterval);
      
      set((state) => ({ 
        generationStep: state.generationSteps.length - 1,
      }));

      setTimeout(() => {
        get().setSiteContent(content);
        set({ isGenerating: false, generationStep: 0 });
      }, 1500);

    } catch (error) {
      clearInterval(progressInterval);
      set({ isGenerating: false });
      console.error("Store AI Generation Error:", error);
    }
  },

  setGenerationStep: (step) => set({ generationStep: step }),

  setSiteContent: (content) => {
    set((state) => {
      const { history, historyIndex } = state;
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(content);
      
      return { 
        siteContent: content, 
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  },

  selectSection: (id) => set({ selectedSectionId: id, selectedElementId: null }),
  
  selectElement: (id) => set({ selectedElementId: id }),

  updateTheme: (themeUpdate) => {
    set((state) => {
      const newContent = {
        ...state.siteContent,
        theme: { ...state.siteContent.theme, ...themeUpdate }
      };
      
      // Also update history by calling setSiteContent logic
      const { history, historyIndex } = state;
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newContent);

      return {
        siteContent: newContent,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  },

  updateSectionSettings: (sectionId, settingsUpdate) => {
    set((state) => {
      const { siteContent, history, historyIndex } = state;
      const newSections = siteContent.sections.map(s => 
        s.id === sectionId 
          ? { ...s, settings: { ...s.settings, ...settingsUpdate } }
          : s
      );
      const newContent = { ...siteContent, sections: newSections };
      
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newContent);

      return { 
        siteContent: newContent,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  },

  addSection: (section) => {
    set((state) => {
      const { siteContent, history, historyIndex } = state;
      const newContent = {
        ...siteContent,
        sections: [...siteContent.sections, section]
      };

      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newContent);

      return {
        siteContent: newContent,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  },

  removeSection: (id) => {
    set((state) => {
      const { siteContent, history, historyIndex } = state;
      const newContent = {
        ...siteContent,
        sections: siteContent.sections.filter(s => s.id !== id)
      };

      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newContent);

      return {
        siteContent: newContent,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  },

  reorderSections: (startIndex, endIndex) => {
    set((state) => {
      const { siteContent, history, historyIndex } = state;
      const newSections = Array.from(siteContent.sections);
      const [removed] = newSections.splice(startIndex, 1);
      newSections.splice(endIndex, 0, removed);
      const newContent = { ...siteContent, sections: newSections };

      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newContent);

      return {
        siteContent: newContent,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      set({ 
        historyIndex: historyIndex - 1,
        siteContent: history[historyIndex - 1]
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      set({ 
        historyIndex: historyIndex + 1,
        siteContent: history[historyIndex + 1]
      });
    }
  }
}));
