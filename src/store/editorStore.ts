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
    
    // Simular progreso para UX de valor añadido
    const progressInterval = setInterval(() => {
      const { generationStep, generationSteps } = get();
      if (generationStep < generationSteps.length - 2) {
        set({ generationStep: generationStep + 1 });
      }
    }, 2500);

    try {
      const content = await generateSiteContent(brief);
      clearInterval(progressInterval);
      
      set({ 
        generationStep: get().generationSteps.length - 1,
      });

      // Breve pausa para que se vea el último paso
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
    const { history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(content);
    
    set({ 
      siteContent: content, 
      history: newHistory,
      historyIndex: newHistory.length - 1
    });
  },

  selectSection: (id) => set({ selectedSectionId: id, selectedElementId: null }),
  
  selectElement: (id) => set({ selectedElementId: id }),

  updateTheme: (themeUpdate) => {
    const { siteContent } = get();
    const newContent = {
      ...siteContent,
      theme: { ...siteContent.theme, ...themeUpdate }
    };
    get().setSiteContent(newContent);
  },

  updateSectionSettings: (sectionId, settingsUpdate) => {
    const { siteContent } = get();
    const newSections = siteContent.sections.map(s => 
      s.id === sectionId 
        ? { ...s, settings: { ...s.settings, ...settingsUpdate } }
        : s
    );
    get().setSiteContent({ ...siteContent, sections: newSections });
  },

  addSection: (section) => {
    const { siteContent } = get();
    get().setSiteContent({
      ...siteContent,
      sections: [...siteContent.sections, section]
    });
  },

  removeSection: (id) => {
    const { siteContent } = get();
    get().setSiteContent({
      ...siteContent,
      sections: siteContent.sections.filter(s => s.id !== id)
    });
  },

  reorderSections: (startIndex, endIndex) => {
    const { siteContent } = get();
    const newSections = Array.from(siteContent.sections);
    const [removed] = newSections.splice(startIndex, 1);
    newSections.splice(endIndex, 0, removed);
    get().setSiteContent({ ...siteContent, sections: newSections });
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
