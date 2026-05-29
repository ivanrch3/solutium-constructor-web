
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
  | 'saas_split_hero_visual'
  | 'features_bento'
  | 'product_screenshot_showcase'
  | 'faq_split_visual'
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
  | 'product_showcase'
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

export interface ReferenceStructureSignals {
  approximateSectionCount: number;
  hasNavigation: boolean;
  hasFooter: boolean;
  hasContactForm: boolean;
  heroPattern: string;
  ctaPattern: string;
  textDensity: 'baja' | 'media' | 'alta';
  styleCategory: string;
  visualHierarchy: string;
  detectedLayoutPatterns: string[];
}

export interface ReferenceVisualBlueprint {
  globalStyle: {
    styleFamily: 'saas' | 'corporate' | 'minimal' | 'ecommerce' | 'editorial' | 'playful';
    backgroundRhythm: string;
    colorMood: string;
    sectionDensity: 'low' | 'medium' | 'high';
    visualComplexity: 'simple' | 'medium' | 'rich';
  };
  layoutPatterns: Array<{
    order: number;
    role: string;
    layout: 'split_hero' | 'centered_hero' | 'product_screenshot' | 'card_grid' | 'bento_grid' | 'alternating_media_text' | 'faq_split' | 'dark_cta' | 'logo_trust' | 'social_proof' | 'contact_split' | 'unknown';
    hasMedia: boolean;
    mediaKind?: 'illustration' | 'product_screenshot' | 'photo' | 'icons' | 'none';
    backgroundStyle?: 'white' | 'soft_tint' | 'dark' | 'gradient' | 'cards';
    cardStyle?: 'flat' | 'soft_shadow' | 'rounded_pastel' | 'bordered';
    ctaPattern?: 'single' | 'double' | 'trial' | 'contact' | 'whatsapp';
  }>;
}

export interface ReferenceSectionBlueprint {
  id: string;
  order: number;
  role: ReferenceSectionRole | 'product_showcase';
  sourceVisualPattern:
    | 'split_hero_with_media'
    | 'centered_hero'
    | 'product_screenshot_showcase'
    | 'card_grid'
    | 'bento_grid'
    | 'alternating_media_text'
    | 'faq_split'
    | 'dark_cta'
    | 'logo_trust'
    | 'social_proof'
    | 'contact_split'
    | 'unknown';
  backgroundStyle: 'white' | 'soft_tint' | 'lavender' | 'dark' | 'gradient' | 'cards' | 'unknown';
  visualDensity: 'low' | 'medium' | 'high';
  hasMedia: boolean;
  mediaKind?: 'illustration' | 'product_screenshot' | 'photo' | 'icons' | 'mockup' | 'none';
  ctaPattern?: 'single' | 'double' | 'trial' | 'contact' | 'whatsapp' | 'none';
  recommendedMasterPreset: string;
  adaptationNotes: string;
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
  structureSignals?: ReferenceStructureSignals;
  visualBlueprint?: ReferenceVisualBlueprint;
  sectionBlueprints?: ReferenceSectionBlueprint[];
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
