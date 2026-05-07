import { GoogleGenAI, Type } from "@google/genai";
import { SiteContent, VisualStyle } from "../types";
import { AIGenerationContext } from "../types/ai";
import { configService } from "./configService";
import { mapStyleToTheme } from "../lib/styleMapper";

const getAI = () => {
  const key = configService.geminiApiKey || '';
  return new GoogleGenAI({ apiKey: key });
};

const getPexelsKey = () => configService.pexelsApiKey || '';

/**
 * Busca imágenes en Pexels basadas en una consulta
 */
const searchStockPhotos = async (query: string): Promise<string[]> => {
  const pexelsKey = getPexelsKey();
  if (!pexelsKey) return [];
  try {
    const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5`, {
      headers: {
        Authorization: pexelsKey
      }
    });
    const data = await response.json();
    return data.photos?.map((p: any) => p.src.large) || [];
  } catch (err) {
    console.error("Pexels Search Error:", err);
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
          const photos = await searchStockPhotos(`${brief.industry} ${field.value || ''}`);
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
