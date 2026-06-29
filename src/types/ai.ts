
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

export type AIBusinessTypeId =
  | 'restaurant'
  | 'professional_services'
  | 'retail_store'
  | 'health_wellness'
  | 'digital_services'
  | 'other';

export type AIFixedModuleType =
  | 'navegacion'
  | 'hero'
  | 'features'
  | 'dynamic_cards'
  | 'pricing'
  | 'comparative'
  | 'process'
  | 'stats'
  | 'gallery'
  | 'video'
  | 'products'
  | 'trusted_logos'
  | 'team'
  | 'testimonials'
  | 'faq'
  | 'cta'
  | 'newsletter'
  | 'contact'
  | 'spacer'
  | 'footer'
  | 'genius_web_wa';

export type AIBlueprintId =
  | 'restaurant_landing_v1'
  | 'professional_services_landing_v1'
  | 'retail_store_landing_v1';

export interface BusinessPageBlueprintModule {
  id: string;
  moduleType: AIFixedModuleType;
  summaryLabel: string;
  purpose: string;
  requiredContentFields: string[];
  defaultSettings?: Record<string, unknown>;
}

export interface BusinessPageBlueprint {
  id: AIBlueprintId;
  businessTypeId: AIBusinessTypeId;
  businessTypeLabel: string;
  version: number;
  pageType: AIPageType;
  modules: BusinessPageBlueprintModule[];
}

export interface GeneratedFeatureItem {
  title: string;
  description: string;
  icon?: string;
  imageUrl?: string;
  imagePrompt?: string;
  badge?: string;
}

export interface GeneratedShowcaseItem {
  name: string;
  description: string;
  tag?: string;
  price?: string;
  imageUrl?: string;
  imagePrompt?: string;
}

export interface GeneratedGalleryItem {
  title: string;
  description: string;
  category?: string;
  imageUrl?: string;
  imagePrompt?: string;
}

export interface GeneratedTestimonialItem {
  author: string;
  role: string;
  text: string;
  stars?: number;
}

export interface GeneratedFaqItem {
  question: string;
  answer: string;
  category?: string;
}

export interface GeneratedBusinessContent {
  businessName: string;
  businessTypeId: AIBusinessTypeId;
  businessTypeLabel: string;
  pageGoal: string;
  primaryCta: string;
  secondaryCta?: string;
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta?: string;
    imageUrl?: string;
    imagePrompt?: string;
  };
  benefits?: {
    eyebrow?: string;
    title: string;
    subtitle: string;
    items: GeneratedFeatureItem[];
  };
  featuredItems?: {
    eyebrow?: string;
    title: string;
    subtitle: string;
    items: GeneratedShowcaseItem[];
  };
  gallery?: {
    eyebrow?: string;
    title: string;
    subtitle: string;
    items: GeneratedGalleryItem[];
  };
  testimonials?: {
    eyebrow?: string;
    title: string;
    subtitle: string;
    items: GeneratedTestimonialItem[];
  };
  faq?: {
    eyebrow?: string;
    title: string;
    subtitle: string;
    items: GeneratedFaqItem[];
    ctaText?: string;
    buttonText?: string;
  };
  cta?: {
    title: string;
    subtitle: string;
    primaryText: string;
    secondaryText?: string;
  };
  contact?: {
    title: string;
    subtitle: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    address?: string;
    hours?: string;
    buttonText?: string;
  };
  menu?: {
    logoText: string;
    links: Array<{
      label: string;
      url: string;
    }>;
  };
  footer?: {
    bio: string;
    copyright?: string;
  };
}

export interface AIPageGenerationBrief {
  pageType: AIPageType;
  businessTypeId?: AIBusinessTypeId;
  businessTypeLabel?: string;
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
  summaryLabel?: string;
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
  businessTypeId?: AIBusinessTypeId;
  businessType?: string;
  businessTypeLabel?: string;
  blueprintId?: AIBlueprintId;
  blueprintVersion?: number;
  contentContractVersion?: 'generated_business_content_v1';
  tone?: string;
  source: 'mock_local' | 'ai_broker' | 'fallback';
  generationMode?: AIPagePlanGenerationMode;
  warnings?: string[];
  estimatedCredits?: number;
  usageSummary?: AIUsageSummary;
  referenceDebug?: ReferenceDebugInfo;
  sections: AIPagePlanSection[];
}

export interface AICreditBalanceSummary {
  monthlyBalance: number;
  bonusBalance: number;
  totalAvailable: number;
  monthlyLimit?: number;
  nextResetAt?: string | null;
}

export interface AIUsageSummary {
  provider?: string;
  model?: string;
  aiUsageLogId?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  costCredits?: number;
  estimatedCredits?: number;
  status?: 'charged' | 'reused' | 'skipped' | 'failed' | 'charge_failed' | 'insufficient_balance' | 'not_required';
  balanceBefore?: AICreditBalanceSummary | null;
  balanceAfter?: AICreditBalanceSummary | null;
  idempotencyReused?: boolean;
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

export interface SectionElementBlueprint {
  id: string;
  type: 'text' | 'button' | 'image' | 'card' | 'list' | 'badge' | 'icon' | 'mockup' | 'divider' | 'form' | 'unknown';
  semanticRole:
    | 'eyebrow'
    | 'headline'
    | 'subtitle'
    | 'body'
    | 'primary_cta'
    | 'secondary_cta'
    | 'hero_visual'
    | 'feature_card'
    | 'media'
    | 'metric'
    | 'testimonial'
    | 'faq_item'
    | 'generic';
  bbox?: { x: number; y: number; width: number; height: number };
  relativeBox?: { x: number; y: number; width: number; height: number };
  visualTraits?: {
    tagName?: string;
    tagApproximation?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'button' | 'img' | 'unknown';
    fontSize?: number;
    fontWeight?: number | string | 'regular' | 'medium' | 'semibold' | 'bold' | 'black';
    textSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'display';
    textSizeRole?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'display';
    alignment?: 'left' | 'center' | 'right';
    style?: 'plain' | 'pill' | 'outlined' | 'filled' | 'shadow' | 'image_card';
    colorRole?: 'primary' | 'secondary' | 'dark' | 'light' | 'muted' | 'accent';
    color?: string;
    background?: string;
    borderRadius?: number;
    isBold?: boolean;
    isUppercase?: boolean;
    isButtonLike?: boolean;
    isImageLike?: boolean;
  };
  contentInstruction: string;
}

export interface VisualElementSummary {
  textCount: number;
  buttonCount: number;
  imageCount: number;
  cardCount: number;
  columnsDetected: number;
}

export interface SectionLayoutBlueprint {
  id: string;
  sectionIndex: number;
  displayName: string;
  roleHint: 'hero' | 'showcase' | 'feature_grid' | 'content_grid' | 'social_proof' | 'faq' | 'cta' | 'pricing' | 'contact' | 'generic';
  layout: {
    type: 'one_column' | 'two_columns' | 'three_columns' | 'centered' | 'card_grid' | 'bento_grid' | 'split_media_text' | 'alternating' | 'unknown';
    columns?: Array<{
      id: string;
      position: 'left' | 'center' | 'right';
      xRatio?: number;
      widthRatio?: number;
      alignment: 'left' | 'center' | 'right';
      verticalAlignment: 'top' | 'center' | 'bottom';
      elements: SectionElementBlueprint[];
    }>;
    grid?: {
      columns: number;
      rows?: number;
      itemCount?: number;
      pattern?: 'uniform' | 'mixed' | 'bento' | 'cards';
    };
  };
  globalElements?: SectionElementBlueprint[];
  background: {
    style: 'white' | 'soft_tint' | 'lavender' | 'dark' | 'gradient' | 'image' | 'unknown';
    intensity?: 'light' | 'medium' | 'strong';
  };
  spacing: {
    top: 'small' | 'medium' | 'large';
    bottom: 'small' | 'medium' | 'large';
    gap: 'small' | 'medium' | 'large';
  };
  elementSummary?: VisualElementSummary;
  layoutConfidence?: number;
  layoutReason?: string;
  mediaIntent?: {
    needsMedia: boolean;
    placement: 'left' | 'right' | 'center' | 'background' | 'cards' | 'none';
    mediaKind: 'photo' | 'illustration' | 'product_screenshot' | 'mockup' | 'icon_cluster' | 'avatar_group' | 'none';
    queryHint?: string;
    fit?: 'cover' | 'contain';
    shape?: 'rounded' | 'circle' | 'freeform' | 'device_frame';
  };
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
  sectionLayoutBlueprints?: SectionLayoutBlueprint[];
  sections: ReferenceSectionAnalysis[];
  proposedStructure: ProposedReferencePageStructure;
  warnings: string[];
  generationMode: 'broker' | 'fallback' | 'visual_scan';
  estimatedCredits?: number;
  referenceDebug?: ReferenceDebugInfo;
}

export interface ReferenceDebugInfo {
  visualScanUsed: boolean;
  fallbackDomUsed: boolean;
  fallbackReason?: string;
  screenshot?: {
    width?: number;
    height?: number;
    capturedHeight?: number;
    stored?: boolean;
  };
  sections?: Array<{
    index: number;
    layout: string;
    roleHint: string;
    media: boolean;
    confidence?: number;
    queryHint?: string;
    columnsDetected?: number;
    layoutReason?: string;
    elementSummary?: VisualElementSummary;
    columns?: Array<{
      id: string;
      position: 'left' | 'center' | 'right';
      xRatio?: number;
      widthRatio?: number;
      alignment: 'left' | 'center' | 'right';
      verticalAlignment: 'top' | 'center' | 'bottom';
      elements: SectionElementBlueprint[];
    }>;
  }>;
  generation?: {
    totalModules: number;
    detectedSectionsCount?: number;
    generatedSectionsCount?: number;
    compositionSections: number;
    legacyModules: number;
    withCompositionSchema: number;
    withPexels: number;
    withPlaceholder: number;
    fallbackPreset: number;
    droppedSections?: Array<{ section: number; dropReason: string }>;
    mergedSections?: Array<{ sections: number[]; mergeReason: string }>;
  };
  pexels?: Array<{
    section: number;
    query?: string;
    found: boolean;
    source: 'pexels' | 'placeholder';
    photographer?: string;
    url?: string;
    reusedCount?: number;
    queryUsed?: string;
    candidateIndex?: number;
    imageWasReused?: boolean;
    usedImageUrlsCount?: number;
    normalizedIntent?: string;
  }>;
  schemaSummary?: Array<{
    section: number;
    originalSectionIndex?: number;
    moduleType: string;
    layout?: string;
    normalizedIntentBeforeVariety?: string;
    normalizedIntent?: string;
    previousIntent?: string;
    elements: number;
    elementTypes: string[];
    imageCount: number;
    cardCount: number;
    buttonCount: number;
    source: 'pexels' | 'placeholder' | 'preset' | 'schema';
    queryUsed?: string;
    warning?: string;
    usedDetailedColumns?: boolean;
    columnsInputCount?: number;
    columnsRenderedCount?: number;
    mediaElementsInputCount?: number;
    imageRendered?: boolean;
    mediaRenderReason?: string;
    layoutInput?: string;
    layoutOutput?: string;
    layoutPreserved?: boolean;
    columnTranslationWarnings?: string[];
  }>;
  warnings?: string[];
}

export interface VisualReferenceScan {
  referenceUrl: string;
  screenshot: {
    width: number;
    height: number;
    capturedHeight: number;
    stored: boolean;
    previewPath?: string | null;
    byteSize?: number;
  };
  sections: VisualScannedSection[];
  sectionLayoutBlueprints: SectionLayoutBlueprint[];
  warnings: string[];
  generationMode: 'visual_scan';
}

export interface VisualScannedSection {
  id: string;
  index: number;
  y: number;
  height: number;
  width: number;
  backgroundHint?: string;
  layoutGuess: 'one_column' | 'two_columns' | 'centered' | 'card_grid' | 'bento_grid' | 'split_media_text' | 'unknown';
  elements: VisualScannedElement[];
  columns?: Array<{
    id: string;
    position: 'left' | 'center' | 'right';
    xRatio: number;
    widthRatio: number;
    alignment: 'left' | 'center' | 'right';
    verticalAlignment: 'top' | 'center' | 'bottom';
    elements: VisualScannedElement[];
  }>;
  globalElements?: VisualScannedElement[];
  elementSummary?: VisualElementSummary;
  dedupedCount?: number;
  layoutConfidence?: number;
  layoutReason?: string;
}

export interface VisualScannedElement {
  id: string;
  type: 'text' | 'button' | 'image' | 'card' | 'link' | 'icon' | 'form' | 'unknown';
  textSample?: string;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  relativeBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  visualRole?: 'eyebrow' | 'headline' | 'subtitle' | 'body' | 'primary_cta' | 'secondary_cta' | 'media' | 'feature_card' | 'metric' | 'testimonial' | 'faq_item' | 'card' | 'cta' | 'generic';
  styleHints?: {
    fontSize?: number;
    fontWeight?: string;
    alignment?: 'left' | 'center' | 'right';
    color?: string;
    background?: string;
    borderRadius?: number;
  };
  visualTraits?: {
    tagName?: string;
    tagApproximation?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'button' | 'img' | 'unknown';
    fontSize?: number;
    fontWeight?: number | string;
    textSizeRole?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'display';
    alignment?: 'left' | 'center' | 'right';
    color?: string;
    background?: string;
    borderRadius?: number;
    isBold?: boolean;
    isUppercase?: boolean;
    isButtonLike?: boolean;
    isImageLike?: boolean;
  };
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
