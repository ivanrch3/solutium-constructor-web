import { GoogleGenAI, Type } from "@google/genai";
import { SiteContent, VisualStyle } from "../types";
import { AIGenerationContext, AIPageGenerationBrief, AIPagePlan, ReferenceUrlAnalysis, ReferenceUrlAnalysisRequest } from "../types/ai";
import {
  AI_PAGE_PLAN_ESTIMATED_CREDITS,
  ALLOWED_AI_PAGE_MODULE_TYPES,
  ALLOWED_COMPOSITION_PRESETS,
  createLocalAIPagePlanFallback,
  validateAIPagePlan
} from "../utils/aiPagePlanValidator";
import { configService } from "./configService";
import { mapStyleToTheme } from "../lib/styleMapper";
import { searchPexelsMedia } from "./pexelsMediaClient";

const getAI = () => {
  const key = configService.geminiApiKey || '';
  return new GoogleGenAI({ apiKey: key });
};

// Pexels ya no debe resolverse desde config runtime del frontend.

/**
 * Busca imágenes en Pexels basadas en una consulta
 */
const searchStockPhotos = async (
  query: string,
  options?: {
    projectId?: string | null;
    moduleType?: string;
    fieldKey?: string;
    industry?: string;
    orientation?: string;
  }
): Promise<string[]> => {
  try {
    const response = await searchPexelsMedia({
      query,
      per_page: 5,
      projectId: options?.projectId,
      moduleType: options?.moduleType,
      fieldKey: options?.fieldKey,
      industry: options?.industry,
      orientation: options?.orientation
    });
    return response.photos?.map((p: any) => p?.src?.large || p?.src?.landscape || p?.src?.medium).filter(Boolean) || [];
  } catch (err) {
    console.error("Secure stock search error:", err);
    return [];
  }
};

const SITE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    sections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          type: { type: Type.STRING, description: "Type of module: mod_header_1, mod_hero_1, mod_menu_1, mod_products_1, mod_footer_1, mod_features_1, mod_gallery_1, mod_testimonials_1" },
          name: { type: Type.STRING },
          elements: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "Element ID from registry (e.g., el_hero_typography, el_menu_logo)" },
                name: { type: Type.STRING },
                type: { type: Type.STRING },
                fields: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING, description: "Field ID (e.g., title, subtitle, logo_text, description)" },
                      value: { type: Type.STRING, description: "Generated text/content or image keyword" }
                    }
                  }
                }
              }
            }
          },
          settings: { 
            type: Type.OBJECT, 
            properties: {
              layout: { type: Type.STRING },
              bg_type: { type: Type.STRING },
              dark_mode: { type: Type.BOOLEAN }
            }
          }
        },
        required: ["id", "type", "name", "elements"]
      }
    }
  },
  required: ["sections"]
};

export const generateSiteContent = async (brief: AIGenerationContext): Promise<SiteContent> => {
  // Refrescar configuración justo antes de usarla por si la Madre inyectó algo tarde
  configService.refreshConfig();
  
  const apiKey = configService.geminiApiKey;
  if (!apiKey) {
    throw new Error("La API Key de Gemini no está configurada. Debe ser provista por la App Madre para iniciar el motor de IA.");
  }

  const ai = getAI();

  const systemInstruction = `
    Eres un Copywriter y Diseñador Web premium de Solutium.
    Tu tarea es generar un sitio web ESTRATÉGICO y MINIMALISTA.
    
    INDUSTRIA: ${brief.industry}
    NEGOCIO: ${brief.siteName}
    DESCRIPCIÓN: ${brief.description}
    OBJETIVO: ${brief.goal}
    ESTILO: ${brief.style}

    REGLAS CRÍTICAS:
    1. Máximo 4 secciones totales.
    2. Usa sintaxis **resaltado** para textos impactantes.
    3. Si es imagen, devuelve una keyword de Pexels en inglés.
    4. NO generes textos largos. Se directo y persuasivo.
    5. Solo usa estos IDs: mod_menu_1, mod_hero_1, mod_products_1, mod_footer_1.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Genera una Landing Page para ${brief.siteName}. Responde solo con JSON conciso.`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: SITE_SCHEMA as any
      }
    });

    let text = response.text;
    
    // Mitigación agresiva para JSON truncado (string no terminado)
    try {
      return await processResponse(text, brief);
    } catch (parseError) {
      console.warn("Retrying JSON fix for unterminated string...");
      // Si falla, intentamos cerrar la última comilla si hay una abierta
      if (text.split('"').length % 2 === 0) { // Comillas impares significa una abierta
        text += '"'; 
      }
      // Re-intentar cerrar objetos y arrays
      const openBrackets = (text.match(/\{/g) || []).length;
      const closeBrackets = (text.match(/\}/g) || []).length;
      text += '}'.repeat(Math.max(0, openBrackets - closeBrackets));
      
      const openSquares = (text.match(/\[/g) || []).length;
      const closeSquares = (text.match(/\]/g) || []).length;
      text += ']'.repeat(Math.max(0, openSquares - closeSquares));

      return await processResponse(text, brief);
    }
  } catch (error) {
    console.error("AI Generation failed:", error);
    throw error;
  }
};

/**
 * Procesa la respuesta de texto a JSON y enriquece con imágenes
 */
async function processResponse(text: string, brief: AIGenerationContext): Promise<SiteContent> {
  let cleanedText = text;
  
  // Limpieza básica de caracteres antes/después del JSON
  const start = cleanedText.indexOf('{');
  const end = cleanedText.lastIndexOf('}');
  if (start !== -1 && end !== -1) {
    cleanedText = cleanedText.substring(start, end + 1);
  }

  const generatedData = JSON.parse(cleanedText);
  
  // Capa D: Curador de Imágenes (Pexels)
  const sectionsWithImages = await Promise.all(generatedData.sections.map(async (section: any) => {
    const enrichedElements = await Promise.all(section.elements.map(async (el: any) => {
      const enrichedFields = await Promise.all(el.fields.map(async (field: any) => {
        if (field.id.includes('img') || field.id.includes('logo')) {
          const photos = await searchStockPhotos(`${brief.industry} ${field.value || ''}`, {
            moduleType: section.type,
            fieldKey: field.id,
            industry: brief.industry
          });
          return { ...field, value: photos[0] || 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg' };
        }
        return field;
      }));
      return { ...el, fields: enrichedFields };
    }));
    return { ...section, elements: enrichedElements };
  }));

  const theme = mapStyleToTheme(brief.style as VisualStyle, {
    primary: brief.brandColors?.[0] || '#3B82F6',
    secondary: brief.brandColors?.[1] || '#1E293B'
  });

  return {
    theme,
    sections: sectionsWithImages.map((s: any) => ({
      ...s,
      settings: s.settings || {
        paddingY: 'py-20',
        backgroundColor: '#FFFFFF',
      }
    }))
  };
}

export const generateSite = generateSiteContent;

import { getUploadAuthToken } from './authTokenProvider';

export interface MotherAIPageResponse {
  success: boolean;
  data?: {
    page: {
      title: string;
      slug: string;
      metadata: any;
      sections: any[];
    };
  };
  usage?: {
    aiUsageLogId: string;
    costCredits: number;
    totalConsumed?: number; // Soporte para App Madre 
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  error?: string;
  detail?: string;
}

/**
 * [OBLIGATORIO] DRY-RUN LOCAL: No consume créditos, no hace fetch, no llama al backend.
 */
export const generateLandingDryRunLocal = (brief: any): MotherAIPageResponse => {
  console.log('[CONSTRUCTOR_LANDING_DRY_RUN_LOCAL]', {
    mode: "dry-run",
    willCallBackend: false,
    estimatedCostCredits: 15,
    actionSlug: "web_ai_generate_landing"
  });

  return {
    success: true,
    data: {
      page: {
        title: brief.businessName || brief.name || "Preview Landing",
        slug: "preview-landing",
        metadata: { dry_run: true, simulatedAt: new Date().toISOString() },
        sections: [
          { type: "hero", name: "Sección Hero (Simulada)" },
          { type: "about", name: "Sobre Nosotros (Simulada)" },
          { type: "services", name: "Servicios (Simulada)" },
          { type: "cta", name: "Llamada a la Acción (Simulada)" }
        ]
      }
    },
    usage: undefined, // Totalmente local
    detail: "Dry-run local: 100% aislado del backend."
  } as any;
};

const titleCase = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

const normalizeBriefText = (value: string, fallback: string) => {
  const clean = value.trim();
  return clean || fallback;
};

/**
 * Fase 1 Crear con IA: genera un pagePlan local compatible con el Constructor.
 * No llama APIs externas ni genera HTML libre; queda listo para reemplazar por ai_broker.
 */
export const generatePagePlanLocal = (brief: AIPageGenerationBrief): AIPagePlan => {
  const businessType = normalizeBriefText(brief.businessType, 'servicios profesionales');
  const businessName = normalizeBriefText(brief.businessName || '', titleCase(businessType));
  const goal = normalizeBriefText(brief.pageGoal, 'conseguir clientes potenciales');
  const instructions = normalizeBriefText(brief.instructions, `Presentar ${businessName} con una propuesta clara y editable.`);
  const primaryCta = normalizeBriefText(brief.primaryCta, 'Solicitar informacion');
  const tone = brief.tone || 'profesional';
  const isContactFocused = /contact|whatsapp|mensaje|cita|agenda/i.test(`${brief.pageType} ${goal} ${instructions}`);
  const isProductFocused = brief.pageType === 'product' || /producto|comprar|venta/i.test(`${goal} ${instructions}`);

  const pageTitle = brief.pageType === 'contact'
    ? `Contacto para ${businessName}`
    : brief.pageType === 'services'
      ? `Servicios de ${businessName}`
      : brief.pageType === 'product'
        ? `${businessName}: producto destacado`
        : `${businessName}: pagina generada con IA`;

  const valueWord = tone === 'premium' ? 'premium' : tone === 'cercano' ? 'simple y cercana' : 'profesional';
  const benefitItems = [
    `Atencion ${valueWord} desde el primer contacto`,
    `Informacion clara para decidir con confianza`,
    `Ruta directa hacia: ${goal}`
  ];
  const serviceItems = isProductFocused
    ? ['Beneficio principal del producto', 'Caracteristicas editables', 'Soporte antes y despues de la compra']
    : ['Diagnostico inicial', 'Solucion a la medida', 'Acompanamiento y seguimiento'];

  const sections: AIPagePlan['sections'] = [
    {
      id: 'ai-hero',
      moduleType: 'composition_section',
      preset: 'hero_visual_premium',
      title: 'Hero principal',
      purpose: 'Presentar la oferta y orientar al CTA principal.',
      content: {
        eyebrow: titleCase(businessType),
        title: `${businessName} para ${goal}`,
        description: instructions,
        cta: primaryCta,
        secondaryCta: 'Ver detalles',
        items: benefitItems
      },
      settings: {}
    },
    {
      id: 'ai-benefits',
      moduleType: 'composition_section',
      preset: 'features_bento',
      title: 'Beneficios clave',
      purpose: 'Resumir por que la propuesta es relevante.',
      content: {
        eyebrow: 'Beneficios',
        title: 'Una experiencia pensada para convertir visitas en oportunidades',
        description: `Contenido editable con tono ${tone} para explicar el valor de ${businessName}.`,
        items: benefitItems
      },
      settings: {}
    },
    {
      id: 'ai-services',
      moduleType: 'composition_section',
      preset: 'services_grid',
      title: isProductFocused ? 'Producto y valor' : 'Servicios principales',
      purpose: 'Mostrar la oferta de forma escaneable.',
      content: {
        eyebrow: isProductFocused ? 'Producto' : 'Servicios',
        title: isProductFocused ? 'Todo lo necesario para avanzar con confianza' : 'Servicios creados para resolver necesidades reales',
        description: 'Cada bloque puede editarse desde el panel de propiedades.',
        items: serviceItems
      },
      settings: {}
    },
    {
      id: 'ai-process',
      moduleType: 'composition_section',
      preset: 'process_steps',
      title: 'Proceso',
      purpose: 'Explicar los pasos esperados antes de la conversion.',
      content: {
        eyebrow: 'Como funciona',
        title: 'Un camino claro desde el primer mensaje',
        description: 'Una secuencia simple para que el visitante entienda que ocurre despues.',
        items: ['Cuentanos que necesitas', 'Recibe una propuesta clara', 'Avanza con acompanamiento']
      },
      settings: {}
    },
    {
      id: 'ai-trust',
      moduleType: 'composition_section',
      preset: 'trust_logos',
      title: 'Confianza',
      purpose: 'Reservar espacio editable para pruebas sociales o logos.',
      content: {
        eyebrow: 'Confianza',
        title: 'Senales que ayudan a decidir',
        description: 'Agrega clientes, certificaciones, metricas o testimonios cuando los tengas.',
        items: ['Clientes', 'Resultados', 'Garantia']
      },
      settings: {}
    },
    {
      id: 'ai-cta',
      moduleType: 'composition_section',
      preset: 'cta_premium',
      title: 'CTA principal',
      purpose: 'Cerrar la pagina con una accion concreta.',
      content: {
        eyebrow: 'Siguiente paso',
        title: isContactFocused ? 'Hablemos hoy mismo' : 'Convierte esta visita en una oportunidad',
        description: `Invita al usuario a avanzar con el objetivo: ${goal}.`,
        cta: primaryCta
      },
      settings: {}
    }
  ];

  if (isContactFocused) {
    sections.push({
      id: 'ai-contact',
      moduleType: 'contact',
      preset: null,
      title: 'Contacto',
      purpose: 'Facilitar el contacto posterior a la revision.',
      content: {
        title: 'Contacto rapido',
        description: 'Completa los datos de contacto reales antes de publicar.',
        cta: primaryCta
      },
      settings: {}
    });
  }

  return {
    pageTitle,
    pageGoal: goal,
    businessType,
    tone,
    source: 'mock_local',
    generationMode: 'mock',
    estimatedCredits: 0,
    warnings: [],
    sections: sections.slice(0, 7)
  };
};

export const buildAIPagePlanPrompt = (brief: AIPageGenerationBrief) => {
  const modules = ALLOWED_AI_PAGE_MODULE_TYPES.join(', ');
  const presets = ALLOWED_COMPOSITION_PRESETS.join(', ');

  return `
Eres el planificador de páginas editables del Constructor Web de Solutium.

Responde ÚNICAMENTE JSON válido. No uses markdown, comentarios, HTML, CSS, scripts ni bloques de código.

Objetivo:
Generar un AIPagePlan estructurado para que el Constructor lo convierta en módulos editables.

Datos del usuario:
- Tipo de página: ${brief.pageType}
- Tipo de negocio: ${brief.businessType}
- Objetivo: ${brief.pageGoal}
- Tono: ${brief.tone}
- CTA principal: ${brief.primaryCta}
- Nombre del negocio/proyecto: ${brief.businessName || 'No indicado'}
- Instrucciones: ${brief.instructions}

Módulos permitidos:
${modules}

Presets permitidos para composition_section:
${presets}

Reglas:
- Prioriza composition_section con presets premium.
- Usa módulos estándar solo si encajan claramente.
- Genera entre 4 y 7 secciones.
- Todo texto debe estar en español y ser editable.
- No inventes datos sensibles, números legales, testimonios reales, marcas de terceros, logos, imágenes externas ni identidad ajena.
- No copies contenido protegido.
- No incluyas URLs externas salvo "#".
- No generes HTML libre.
- No generes CSS.
- No generes scripts.
- No incluyas instrucciones fuera del JSON.

Estructura exacta:
{
  "pageTitle": "string",
  "pageGoal": "string",
  "businessType": "string",
  "tone": "string",
  "estimatedCredits": ${AI_PAGE_PLAN_ESTIMATED_CREDITS},
  "sections": [
    {
      "id": "string-unico-kebab-case",
      "moduleType": "composition_section",
      "preset": "hero_visual_premium",
      "title": "string",
      "purpose": "string",
      "content": {
        "eyebrow": "string",
        "title": "string",
        "description": "string",
        "cta": "string",
        "secondaryCta": "string",
        "items": ["string"]
      },
      "settings": {}
    }
  ]
}
`.trim();
};

export const generateAIPagePlan = async (
  brief: AIPageGenerationBrief,
  options: {
    projectId?: string | null;
    siteId?: string | null;
    userId?: string | null;
    forceFallback?: boolean;
    brokerResponseOverride?: unknown;
  } = {}
): Promise<AIPagePlan> => {
  const localPlan = validateAIPagePlan(generatePagePlanLocal(brief), brief, {
    source: 'mock_local',
    generationMode: 'mock'
  });

  if (options.forceFallback) {
    return createLocalAIPagePlanFallback(brief, ['Fallback forzado para validacion.']);
  }

  if (options.brokerResponseOverride !== undefined) {
    return validateAIPagePlan(options.brokerResponseOverride, brief, {
      source: 'ai_broker',
      generationMode: 'broker'
    });
  }

  const brokerEnabled = import.meta.env.VITE_ENABLE_AI_PAGE_PLAN_BROKER === 'true';
  const brokerUrl = import.meta.env.VITE_AI_PAGE_PLAN_BROKER_URL as string | undefined;

  if (!brokerEnabled || !brokerUrl) {
    return {
      ...localPlan,
      warnings: [
        ...(localPlan.warnings || []),
        'Broker IA seguro no configurado; se uso generacion local editable.'
      ]
    };
  }

  const authData = await getUploadAuthToken();
  const token = authData.token || '';

  if (!token || token.split('.').length !== 3) {
    return createLocalAIPagePlanFallback(brief, [
      'No hay sesion valida para llamar al broker IA. Se uso fallback editable.'
    ]);
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetch(brokerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        projectId: options.projectId,
        siteId: options.siteId || null,
        pageType: brief.pageType,
        businessType: brief.businessType,
        pageGoal: brief.pageGoal,
        tone: brief.tone,
        cta: brief.primaryCta,
        instructions: brief.instructions,
        idempotencyKey: `website_ai_generate_page:${options.projectId || 'unknown'}:${Date.now()}`
      })
    });

    const text = await response.text();
    const parsed = (() => {
      try {
        return JSON.parse(text);
      } catch {
        return null;
      }
    })();

    if (!response.ok) {
      const safeError = parsed && typeof parsed === 'object'
        ? parsed as { error?: string; message?: string; warnings?: string[]; reason?: string }
        : null;
      const reason = safeError?.reason || safeError?.error || safeError?.message || `HTTP ${response.status}`;
      const warning =
        response.status === 401
          ? 'Sesion invalida o expirada para el broker IA. Se uso fallback editable.'
          : response.status === 402
            ? 'Creditos IA insuficientes para generar con broker real. Se uso fallback editable.'
            : response.status === 403
              ? 'No hay permisos para generar con IA en este proyecto. Se uso fallback editable.'
              : `Broker IA respondio ${reason}. Se uso fallback editable.`;

      return createLocalAIPagePlanFallback(brief, [
        warning,
        ...(Array.isArray(safeError?.warnings) ? safeError.warnings : [])
      ]);
    }

    if (!parsed || typeof parsed !== 'object') {
      return createLocalAIPagePlanFallback(brief, [
        'El broker IA devolvio una respuesta no JSON. Se uso fallback editable.'
      ]);
    }

    const responseBody = parsed as {
      success?: boolean;
      plan?: unknown;
      warnings?: string[];
      usage?: {
        actionSlug?: string;
        estimatedCredits?: number;
        model?: string;
        aiUsageLogId?: string;
        totalConsumed?: number;
      };
    };

    if (responseBody.success !== true || !responseBody.plan) {
      return createLocalAIPagePlanFallback(brief, [
        'El broker IA no devolvio un AIPagePlan valido. Se uso fallback editable.',
        ...(Array.isArray(responseBody.warnings) ? responseBody.warnings : [])
      ]);
    }

    const plan = validateAIPagePlan(responseBody.plan, brief, {
      source: 'ai_broker',
      generationMode: 'broker'
    });

    return {
      ...plan,
      estimatedCredits: responseBody.usage?.estimatedCredits ?? plan.estimatedCredits ?? AI_PAGE_PLAN_ESTIMATED_CREDITS,
      warnings: [
        ...(plan.warnings || []),
        ...(Array.isArray(responseBody.warnings) ? responseBody.warnings : []),
        ...(responseBody.usage?.aiUsageLogId ? [`AI Broker ref: ${responseBody.usage.aiUsageLogId}`] : []),
        ...(responseBody.usage?.totalConsumed !== undefined ? [`Creditos consumidos: ${responseBody.usage.totalConsumed}`] : [])
      ]
    };
  } catch (error: any) {
    return createLocalAIPagePlanFallback(brief, [
      error?.name === 'AbortError'
        ? 'El broker IA supero el tiempo de espera. Se uso fallback editable.'
        : 'No se pudo contactar el broker IA. Se uso fallback editable.'
    ]);
  } finally {
    window.clearTimeout(timeout);
  }
};

export const analyzeReferenceUrl = async (
  request: ReferenceUrlAnalysisRequest
): Promise<ReferenceUrlAnalysis> => {
  const brokerUrl = import.meta.env.VITE_REFERENCE_URL_ANALYSIS_BROKER_URL
    || `${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api').replace(/\/$/, '')}/ai/reference-url/analyze`;

  const authData = await getUploadAuthToken();
  const token = authData.token || '';

  if (!token || token.split('.').length !== 3) {
    throw new Error('No hay sesion valida para analizar URL de referencia.');
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetch(brokerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        ...request,
        idempotencyKey: `website_ai_analyze_reference_url:${request.projectId}:${Date.now()}`
      })
    });

    const text = await response.text();
    const parsed = (() => {
      try {
        return JSON.parse(text);
      } catch {
        return null;
      }
    })() as {
      success?: boolean;
      analysis?: ReferenceUrlAnalysis;
      error?: string;
      message?: string;
      warnings?: string[];
      usage?: {
        estimatedCredits?: number;
        totalConsumed?: number;
        aiUsageLogId?: string;
      };
    } | null;

    if (!response.ok || !parsed?.success || !parsed.analysis) {
      const warningText = Array.isArray(parsed?.warnings) && parsed.warnings.length
        ? ` ${parsed.warnings.join(' ')}`
        : '';
      throw new Error(`${parsed?.error || parsed?.message || `HTTP ${response.status}`}${warningText}`);
    }

    return {
      ...parsed.analysis,
      estimatedCredits: parsed.usage?.estimatedCredits ?? parsed.analysis.estimatedCredits,
      warnings: [
        ...(parsed.analysis.warnings || []),
        ...(Array.isArray(parsed.warnings) ? parsed.warnings : []),
        ...(parsed.usage?.aiUsageLogId ? [`AI Broker ref: ${parsed.usage.aiUsageLogId}`] : []),
        ...(parsed.usage?.totalConsumed !== undefined ? [`Creditos consumidos: ${parsed.usage.totalConsumed}`] : [])
      ]
    };
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new Error('El analisis de URL supero el tiempo de espera.');
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
};

export const generateAIPagePlanFromReferenceAnalysis = async (
  request: {
    projectId: string;
    siteId?: string | null;
    referenceUrl: string;
    analysis: ReferenceUrlAnalysis;
    businessType?: string;
    pageGoal?: string;
    tone?: string;
    cta?: string;
    instructions?: string;
  },
  brief: AIPageGenerationBrief
): Promise<AIPagePlan> => {
  const brokerEnabled = import.meta.env.VITE_ENABLE_REFERENCE_URL_PAGE_PLAN_BROKER === 'true';
  const brokerUrl = import.meta.env.VITE_REFERENCE_URL_PAGE_PLAN_BROKER_URL
    || `${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api').replace(/\/$/, '')}/ai/reference-url/generate-page-plan`;

  if (!brokerEnabled || !brokerUrl) {
    return createLocalAIPagePlanFallback(brief, [
      'Broker para generar desde URL no configurado; se uso fallback editable.'
    ]);
  }

  const authData = await getUploadAuthToken();
  const token = authData.token || '';

  if (!token || token.split('.').length !== 3) {
    return createLocalAIPagePlanFallback(brief, [
      'No hay sesion valida para generar desde URL. Se uso fallback editable.'
    ]);
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 55000);

  try {
    const response = await fetch(brokerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        ...request,
        idempotencyKey: `website_ai_generate_page_from_reference_url:${request.projectId}:${Date.now()}`
      })
    });

    const text = await response.text();
    const parsed = (() => {
      try {
        return JSON.parse(text);
      } catch {
        return null;
      }
    })() as {
      success?: boolean;
      plan?: unknown;
      error?: string;
      message?: string;
      warnings?: string[];
      usage?: {
        estimatedCredits?: number;
        totalConsumed?: number;
        aiUsageLogId?: string;
      };
    } | null;

    if (!response.ok || !parsed?.success || !parsed.plan) {
      const safeWarnings = Array.isArray(parsed?.warnings) ? parsed.warnings : [];
      const warning =
        response.status === 401
          ? 'Sesion invalida o expirada para generar desde URL. Se uso fallback editable.'
          : response.status === 402
            ? 'Creditos IA insuficientes para generar desde URL. Se uso fallback editable.'
            : response.status === 403
              ? 'No hay permisos para generar desde URL en este proyecto. Se uso fallback editable.'
              : parsed?.error || parsed?.message || `HTTP ${response.status}`;

      return createLocalAIPagePlanFallback(brief, [warning, ...safeWarnings]);
    }

    const plan = validateAIPagePlan(parsed.plan, brief, {
      source: 'ai_broker',
      generationMode: 'reference_url_broker'
    });

    return {
      ...plan,
      estimatedCredits: parsed.usage?.estimatedCredits ?? plan.estimatedCredits ?? 20,
      warnings: [
        ...(plan.warnings || []),
        ...(Array.isArray(parsed.warnings) ? parsed.warnings : []),
        'Pagina original inspirada en la estructura de referencia; no se copiaron textos, imagenes, logos ni codigo.',
        ...(parsed.usage?.aiUsageLogId ? [`AI Broker ref: ${parsed.usage.aiUsageLogId}`] : []),
        ...(parsed.usage?.totalConsumed !== undefined ? [`Creditos consumidos: ${parsed.usage.totalConsumed}`] : [])
      ]
    };
  } catch (error: any) {
    return createLocalAIPagePlanFallback(brief, [
      error?.name === 'AbortError'
        ? 'La generacion desde URL supero el tiempo de espera. Se uso fallback editable.'
        : 'No se pudo contactar el broker para generar desde URL. Se uso fallback editable.'
    ]);
  } finally {
    window.clearTimeout(timeout);
  }
};

/**
 * [PHASE 3D.5.2] MIGRACIÓN A ENDPOINT SEGURO DE APP MADRE
 * Esta función ya no llama a Gemini client-side.
 */
export const generateLandingWithMotherAI = async (
  projectId: string,
  brief: {
    businessName: string;
    industry: string;
    description: string;
    goal: string;
    tone: string;
    style: string;
    targetAudience: string;
  },
  idempotencyKey: string,
  options: { isDryRun?: boolean } = {}
): Promise<MotherAIPageResponse> => {
  // [GUARDIA DE SEGURIDAD] Si por error llega aquí un dryRun, bloqueamos el fetch
  if (options.isDryRun) {
    console.warn('[CONSTRUCTOR_LANDING_DRY_RUN_GUARD_BLOCKED_FETCH]', {
      reason: "dry-run cannot call backend",
      actionSlug: 'web_ai_generate_landing'
    });
    return generateLandingDryRunLocal(brief);
  }

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
  const url = `${apiBaseUrl}/web-builder/ai/generate-page`;
  
  const payload = {
    projectId,
    appSlug: "constructor_web",
    actionSlug: "web_ai_generate_landing",
    idempotencyKey,
    brief,
    page: {
      type: "landing",
      language: "es",
      sections: ["hero", "about", "services", "benefits", "cta"]
    },
    dryRun: false // Aquí siempre es false porque el dryrun se maneja localmente
  };

  const authData = await getUploadAuthToken();
  const token = authData.token || '';

  console.log('[CONSTRUCTOR_LANDING_REAL_EXECUTION_START]', {
    mode: "real",
    willCallBackend: true,
    estimatedCostCredits: 15,
    actionSlug: "web_ai_generate_landing",
    idempotencyKey
  });

  if (!token || token.split('.').length !== 3) {
    return {
      success: false,
      error: 'No hay access_token válido de Supabase. Abre el Constructor desde la App Madre o recarga contexto.'
    };
  }

  console.log('[CONSTRUCTOR_GENERATE_LANDING_PAYLOAD_DEBUG]', {
    projectId: payload.projectId,
    appSlug: payload.appSlug,
    actionSlug: payload.actionSlug,
    idempotencyKey: payload.idempotencyKey,
    businessName: payload.brief.businessName,
    sectionsCount: payload.page.sections.length,
    mode: options.isDryRun ? 'dry-run' : 'real'
  });

  console.log('[CONSTRUCTOR_GENERATE_LANDING_ENDPOINT_DEBUG]', {
    endpoint: url,
    hasAccessToken: !!token,
    selectedAuthSource: authData.source,
    actionSlug: payload.actionSlug
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          error: 'Token inválido o expirado (401). Reabre el Constructor desde App Madre o recarga contexto.'
        };
      }

      const text = await response.text();
      let errorBody;
      try {
        errorBody = JSON.parse(text);
      } catch (e) {
        errorBody = { error: text };
      }

      console.error('[CONSTRUCTOR_GENERATE_LANDING_RESPONSE_DEBUG] Error:', {
        status: response.status,
        body: errorBody
      });
      
      return { 
        success: false, 
        error: errorBody.error || errorBody.message || 'Error desconocido del servidor',
        detail: errorBody.detail
      };
    }

    const body = await response.json();
    
    console.log('[CONSTRUCTOR_GENERATE_LANDING_RESPONSE_DEBUG] Success:', {
      success: body.success,
      aiUsageLogId: body.usage?.aiUsageLogId,
      costCredits: body.usage?.costCredits,
      sectionsCount: body.data?.page?.sections?.length || 0,
      totalTokens: body.usage?.totalTokens
    });

    return body;
  } catch (error: any) {
    console.error('[CONSTRUCTOR_GENERATE_LANDING_FAILED]', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * Función para probar la generación real de IA desde el backend de App Madre
 * Se usa exclusivamente para validación de créditos local
 */
export const generateSectionWithRealAI = async (idempotencyKey: string, manualToken?: string) => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
  const url = `${apiBaseUrl}/web-builder/ai/generate-section`;
  
  const payload = {
    projectId: "5210c610-776e-4736-b3f6-5c176e9a771b",
    appSlug: "constructor_web",
    actionSlug: "web_ai_generate_section",
    idempotencyKey: idempotencyKey,
    prompt: "Genera una sección breve para explicar por qué Solutium ayuda a profesionales y pequeños negocios a automatizar procesos.",
    sectionType: "benefits",
    tone: "professional"
  };

  const authData = await getUploadAuthToken();
  const token = manualToken || authData.token || '';

  console.log('[REAL_AI_REQUEST_DEBUG]', {
    fullUrl: url,
    projectId: payload.projectId,
    appSlug: payload.appSlug,
    actionSlug: payload.actionSlug,
    idempotencyKey: payload.idempotencyKey,
    hasAuthToken: !!token,
    tokenSource: manualToken ? 'manual' : authData.source,
    tokenPreview: token ? `${token.substring(0, 7)}...${token.slice(-4)}` : 'none'
  });
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    });
    
    // Si es 401/403, intentamos capturar el texto si no es JSON
    if (!response.ok) {
      const text = await response.text();
      let errorBody;
      try {
        errorBody = JSON.parse(text);
      } catch (e) {
        errorBody = { error: text };
      }

      console.log('[REAL_AI_RESPONSE_DEBUG] Error:', {
        status: response.status,
        body: errorBody
      });
      
      return { 
        status: response.status, 
        ok: false, 
        data: errorBody 
      };
    }

    const body = await response.json();
    
    console.log('[REAL_AI_RESPONSE_DEBUG] Success:', {
      status: response.status,
      ok: response.ok,
      responseBody: body
    });

    return { 
      status: response.status, 
      ok: response.ok, 
      data: body 
    };
  } catch (error: any) {
    console.error('[REAL_AI_REQUEST_FAILED]', error);
    return { 
      status: 500, 
      ok: false, 
      data: { error: error.message } 
    };
  }
};

/**
 * Piloto DevEnv-2: Llama al endpoint de IA en el backend de la App Madre
 */
export const generateSectionPilot = async (prompt: string, projectId: string) => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
  const endpoint = '/web-builder/ai/generate-section';
  const url = `${apiBaseUrl}${endpoint}`;
  const actionSlug = 'web_ai_generate_section';
  const idempotencyKey = crypto.randomUUID();

  console.log('[DRY_RUN_AI_PILOT]', {
    apiBase: apiBaseUrl,
    endpoint: endpoint,
    fullUrl: url,
    appSlug: 'constructor_web',
    actionSlug: actionSlug,
    idempotencyKey: idempotencyKey
  });
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId,
        userId: 'ivanrch3@gmail.com', // Using user's email for trace
        appSlug: 'constructor_web',
        actionSlug: actionSlug,
        prompt,
        idempotencyKey: idempotencyKey
      })
    });
    
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'AI Generation Bridge failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('[AI_BRIDGE_ERROR]', error);
    throw error;
  }
};
