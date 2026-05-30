import { AIPageGenerationBrief, AIPagePlan, AIPagePlanPreset, AIPagePlanSection } from '../types/ai';

export const AI_PAGE_PLAN_ACTION_SLUG = 'website_ai_generate_page';
export const AI_PAGE_PLAN_ESTIMATED_CREDITS = 15;

export const ALLOWED_AI_PAGE_MODULE_TYPES = [
  'composition_section',
  'contact',
  'faq',
  'testimonials',
  'gallery',
  'cta',
  'features',
  'process'
] as const;

export const ALLOWED_COMPOSITION_PRESETS = [
  'hero_visual_premium',
  'saas_split_hero_visual',
  'features_bento',
  'product_screenshot_showcase',
  'faq_split_visual',
  'services_grid',
  'process_steps',
  'trust_logos',
  'cta_premium',
  'comparison'
] as const;

export type NormalizedCompositionPreset = typeof ALLOWED_COMPOSITION_PRESETS[number];

const PRESET_ALIASES: Record<string, NormalizedCompositionPreset> = {
  servicios: 'services_grid',
  proceso: 'process_steps',
  confianza_logos: 'trust_logos',
  comparativa: 'comparison'
};

const DEFAULT_SECTIONS: Array<{ preset: NormalizedCompositionPreset; title: string; purpose: string }> = [
  { preset: 'saas_split_hero_visual', title: 'Hero principal', purpose: 'Presentar la propuesta y guiar al CTA.' },
  { preset: 'features_bento', title: 'Beneficios clave', purpose: 'Mostrar beneficios de forma escaneable.' },
  { preset: 'product_screenshot_showcase', title: 'Showcase de producto', purpose: 'Representar el producto o flujo principal.' },
  { preset: 'services_grid', title: 'Servicios principales', purpose: 'Explicar la oferta editable.' },
  { preset: 'faq_split_visual', title: 'Ayuda y preguntas', purpose: 'Resolver dudas clave con apoyo visual.' },
  { preset: 'cta_premium', title: 'CTA final', purpose: 'Cerrar con una accion clara.' }
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const stripUnsafeText = (value: unknown, fallback = '') => {
  if (typeof value !== 'string') return fallback;

  return value
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<\/?script[^>]*>/gi, '')
    .replace(/<\/?style[^>]*>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\b(?:javascript|data|vbscript):/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .slice(0, 1200);
};

const sanitizeId = (value: unknown, fallback: string) => {
  const clean = stripUnsafeText(value, fallback)
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
  return clean || fallback;
};

const normalizePreset = (preset: unknown, warnings: string[]): NormalizedCompositionPreset => {
  const rawPreset = typeof preset === 'string' ? preset.trim() : '';
  const aliased = PRESET_ALIASES[rawPreset] || rawPreset;

  if ((ALLOWED_COMPOSITION_PRESETS as readonly string[]).includes(aliased)) {
    return aliased as NormalizedCompositionPreset;
  }

  if (rawPreset) {
    warnings.push(`Preset no permitido normalizado a hero_visual_premium: ${rawPreset}`);
  }

  return 'hero_visual_premium';
};

const normalizeModuleType = (moduleType: unknown, warnings: string[]) => {
  const clean = stripUnsafeText(moduleType, 'composition_section')
    .toLowerCase()
    .replace(/[^a-z0-9_/-]+/g, '_');

  if ((ALLOWED_AI_PAGE_MODULE_TYPES as readonly string[]).includes(clean)) {
    return clean;
  }

  warnings.push(`Tipo de módulo no permitido convertido a composition_section: ${clean || 'vacío'}`);
  return 'composition_section';
};

const sanitizeContentValue = (value: unknown): unknown => {
  if (typeof value === 'string') return stripUnsafeText(value);
  if (Array.isArray(value)) {
    return value
      .slice(0, 12)
      .map(item => {
        if (typeof item === 'string') return stripUnsafeText(item);
        if (isRecord(item)) return sanitizeContentRecord(item);
        return '';
      });
  }
  if (isRecord(value)) return sanitizeContentRecord(value);
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  return undefined;
};

const sanitizeContentRecord = (content: Record<string, unknown>) => {
  const safe: Record<string, unknown> = {};

  Object.entries(content).slice(0, 40).forEach(([key, value]) => {
    const safeKey = key.replace(/[^a-zA-Z0-9_]+/g, '').slice(0, 48);
    if (!safeKey) return;

    const sanitized = sanitizeContentValue(value);
    if (sanitized !== undefined) {
      safe[safeKey] = sanitized;
    }
  });

  return safe;
};

const normalizeItems = (content: Record<string, unknown>) => {
  const rawItems = content.items;
  if (!Array.isArray(rawItems)) return [];

  return rawItems
    .map(item => {
      if (typeof item === 'string') return stripUnsafeText(item);
      if (isRecord(item)) return stripUnsafeText(item.text || item.title || item.label || '');
      return '';
    })
    .filter(Boolean)
    .slice(0, 8);
};

const normalizeSection = (
  rawSection: unknown,
  index: number,
  usedIds: Set<string>,
  warnings: string[],
  brief?: AIPageGenerationBrief
): AIPagePlanSection | null => {
  if (!isRecord(rawSection)) {
    warnings.push(`Sección ${index + 1} descartada: formato inválido.`);
    return null;
  }

  const moduleType = normalizeModuleType(rawSection.moduleType, warnings);
  const preset = moduleType === 'composition_section'
    ? normalizePreset(rawSection.preset, warnings)
    : null;

  const fallbackId = `ai-section-${index + 1}`;
  let id = sanitizeId(rawSection.id, fallbackId);
  while (usedIds.has(id)) {
    id = `${id}-${usedIds.size + 1}`;
  }
  usedIds.add(id);

  const rawContent = isRecord(rawSection.content) ? sanitizeContentRecord(rawSection.content) : {};
  const title = stripUnsafeText(rawSection.title, DEFAULT_SECTIONS[index % DEFAULT_SECTIONS.length].title);
  const description = stripUnsafeText(rawContent.description, stripUnsafeText(rawSection.purpose, 'Contenido editable generado para la sección.'));

  const content = {
    ...rawContent,
    eyebrow: stripUnsafeText(rawContent.eyebrow, title),
    title: stripUnsafeText(rawContent.title, title),
    description,
    cta: stripUnsafeText(rawContent.cta, brief?.primaryCta || 'Solicitar información'),
    secondaryCta: stripUnsafeText(rawContent.secondaryCta, ''),
    items: normalizeItems(rawContent)
  };

  return {
    id,
    moduleType,
    preset,
    title,
    purpose: stripUnsafeText(rawSection.purpose, DEFAULT_SECTIONS[index % DEFAULT_SECTIONS.length].purpose),
    content,
    settings: isRecord(rawSection.settings) ? sanitizeContentRecord(rawSection.settings) : {}
  };
};

const buildFallbackPlan = (brief: AIPageGenerationBrief, warnings: string[] = []): AIPagePlan => {
  const businessType = stripUnsafeText(brief.businessType, 'servicios profesionales');
  const businessName = stripUnsafeText(brief.businessName, businessType);
  const pageGoal = stripUnsafeText(brief.pageGoal, 'conseguir clientes potenciales');
  const instructions = stripUnsafeText(brief.instructions, `Presentar ${businessName} con claridad.`);
  const cta = stripUnsafeText(brief.primaryCta, 'Solicitar información');

  return {
    pageTitle: `${businessName}: página editable`,
    pageGoal,
    businessType,
    tone: brief.tone,
    source: 'fallback',
    generationMode: 'fallback',
    estimatedCredits: 0,
    warnings,
    sections: DEFAULT_SECTIONS.map((section, index) => ({
      id: `fallback-${section.preset}-${index + 1}`,
      moduleType: 'composition_section',
      preset: section.preset,
      title: section.title,
      purpose: section.purpose,
      content: {
        eyebrow: index === 0 ? businessType : section.title,
        title: index === 0 ? `${businessName} para ${pageGoal}` : section.title,
        description: index === 0 ? instructions : `Bloque editable con tono ${brief.tone}.`,
        cta,
        items: [
          'Propuesta clara y editable',
          'Contenido orientado a conversión',
          'Estructura lista para personalizar'
        ]
      },
      settings: {}
    }))
  };
};

export const extractJSONFromAIResponse = (rawResponse: unknown) => {
  if (isRecord(rawResponse)) {
    const content = rawResponse.content || rawResponse.text || rawResponse.response || rawResponse.data;
    if (isRecord(content)) return content;
    if (typeof content === 'string') return extractJSONFromAIResponse(content);
    return rawResponse;
  }

  if (typeof rawResponse !== 'string') return null;

  const trimmed = rawResponse.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      try {
        return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
};

export const validateAIPagePlan = (
  rawPlan: unknown,
  brief: AIPageGenerationBrief,
  options: { fallbackWarnings?: string[]; source?: AIPagePlan['source']; generationMode?: AIPagePlan['generationMode'] } = {}
): AIPagePlan => {
  const warnings = [...(options.fallbackWarnings || [])];
  const planRecord = extractJSONFromAIResponse(rawPlan);

  if (!isRecord(planRecord)) {
    return buildFallbackPlan(brief, [...warnings, 'La respuesta IA no fue JSON válido. Se usó fallback editable.']);
  }

  const rawSections = Array.isArray(planRecord.sections) ? planRecord.sections : [];
  if (rawSections.length === 0) {
    return buildFallbackPlan(brief, [...warnings, 'El plan IA no incluyó secciones. Se usó fallback editable.']);
  }

  const usedIds = new Set<string>();
  const maxSections = options.generationMode === 'reference_url_broker' ? 10 : 7;
  const normalizedSections = rawSections
    .slice(0, maxSections)
    .map((section, index) => normalizeSection(section, index, usedIds, warnings, brief))
    .filter(Boolean) as AIPagePlanSection[];

  if (rawSections.length < 4) {
    warnings.push('El plan IA tenía menos de 4 secciones; se completó con secciones fallback.');
  }

  while (normalizedSections.length < 4) {
    const fallbackSection = DEFAULT_SECTIONS[normalizedSections.length % DEFAULT_SECTIONS.length];
    normalizedSections.push({
      id: `fallback-extra-${fallbackSection.preset}-${normalizedSections.length + 1}`,
      moduleType: 'composition_section',
      preset: fallbackSection.preset,
      title: fallbackSection.title,
      purpose: fallbackSection.purpose,
      content: {
        eyebrow: fallbackSection.title,
        title: fallbackSection.title,
        description: `Sección editable para ${stripUnsafeText(brief.businessType, 'tu negocio')}.`,
        cta: stripUnsafeText(brief.primaryCta, 'Solicitar información'),
        items: ['Editable', 'Flexible', 'Lista para publicar']
      },
      settings: {}
    });
  }

  return {
    pageTitle: stripUnsafeText(planRecord.pageTitle, `${stripUnsafeText(brief.businessType, 'Página')} editable`),
    pageGoal: stripUnsafeText(planRecord.pageGoal, brief.pageGoal),
    businessType: stripUnsafeText(planRecord.businessType, brief.businessType),
    tone: stripUnsafeText(planRecord.tone, brief.tone),
    source: options.source || 'ai_broker',
    generationMode: options.generationMode || 'broker',
    estimatedCredits: typeof planRecord.estimatedCredits === 'number'
      ? Math.max(0, Math.min(100, planRecord.estimatedCredits))
      : AI_PAGE_PLAN_ESTIMATED_CREDITS,
    warnings,
    sections: normalizedSections
  };
};

export const createLocalAIPagePlanFallback = (brief: AIPageGenerationBrief, warnings: string[] = []) =>
  buildFallbackPlan(brief, warnings);
