
export interface AIGenerationContext {
  siteName: string;
  industry: string;
  description: string;
  goal: string;
  style: string;
  brandColors: string[];
}

export interface AISectionResult {
  moduleId: string;
  settingsValues: Record<string, any>;
  imageQueries?: Record<string, string>;
  aiImagePrompt?: string;
}

export interface AIGenerationResult {
  theme: {
    fontSans: string;
    fontDisplay: string;
    borderRadius: string;
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
  };
  sections: AISectionResult[];
}

export type AIPageType =
  | 'landing'
  | 'home'
  | 'services'
  | 'product'
  | 'contact'
  | 'promo';

export type AIPageTone =
  | 'profesional'
  | 'cercano'
  | 'moderno'
  | 'premium'
  | 'juvenil'
  | 'institucional';

export interface AIPageGenerationBrief {
  pageType: AIPageType;
  businessType: string;
  pageGoal: string;
  instructions: string;
  tone: AIPageTone;
  primaryCta: string;
  businessName?: string;
}

export type AIPagePlanGenerationMode = 'mock' | 'broker' | 'reference_url_broker' | 'fallback';

export type AIPagePlanPreset =
  | 'hero_visual_premium'
  | 'features_bento'
  | 'services_grid'
  | 'process_steps'
  | 'cta_premium'
  | 'comparison'
  | 'trust_logos'
  | 'servicios'
  | 'proceso'
  | 'comparativa'
  | 'confianza_logos';

export interface AIPagePlanSection {
  id: string;
  moduleType: string;
  preset?: AIPagePlanPreset | null;
  title: string;
  purpose: string;
  content: Record<string, unknown> & {
    eyebrow?: string;
    title?: string;
    description?: string;
    cta?: string;
    secondaryCta?: string;
    items?: string[];
  };
  settings?: Record<string, unknown>;
}

export interface AIPagePlan {
  pageTitle: string;
  pageGoal: string;
  businessType?: string;
  tone?: string;
  source: 'mock_local' | 'ai_broker' | 'fallback';
  generationMode?: AIPagePlanGenerationMode;
  warnings?: string[];
  estimatedCredits?: number;
  sections: AIPagePlanSection[];
}

export interface ReferenceUrlAnalysisRequest {
  projectId: string;
  siteId?: string;
  referenceUrl: string;
  businessType?: string;
  pageGoal?: string;
  tone?: string;
  cta?: string;
}

export type ReferenceSectionRole =
  | 'hero'
  | 'features'
  | 'services'
  | 'process'
  | 'testimonials'
  | 'trust'
  | 'pricing'
  | 'faq'
  | 'contact'
  | 'cta'
  | 'gallery'
  | 'about'
  | 'comparison'
  | 'unknown';

export interface ReferenceSectionAnalysis {
  id: string;
  order: number;
  detectedRole: ReferenceSectionRole;
  layoutPattern: string;
  purpose: string;
  visualNotes: string;
  recommendedModuleType: string;
  recommendedPreset?: string | null;
  confidence: number;
}

export interface ProposedReferencePageStructure {
  pageType: string;
  recommendedSections: Array<{
    role: string;
    moduleType: string;
    preset?: string | null;
    reason: string;
  }>;
}

export interface ReferenceUrlAnalysis {
  referenceUrl: string;
  detectedPageType: string;
  detectedBusinessCategory?: string;
  overallStructure: string;
  visualStyleSummary: string;
  sections: ReferenceSectionAnalysis[];
  proposedStructure: ProposedReferencePageStructure;
  warnings: string[];
  generationMode: 'broker' | 'fallback';
  estimatedCredits?: number;
}

export interface PexelsImage {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
}
