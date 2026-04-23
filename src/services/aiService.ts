import { GoogleGenAI, Type } from "@google/genai";
import { SiteContent, VisualStyle } from "../types";
import { configService } from "./configService";
import { mapStyleToTheme } from "../lib/styleMapper";

const getAI = () => {
  const key = configService.geminiApiKey || '';
  return new GoogleGenAI({ apiKey: key });
};

const getPexelsKey = () => configService.pexelsApiKey || '';

export interface GenerationBrief {
  name: string;
  industry: string;
  description: string;
  goal: string;
  style: VisualStyle;
  brandColors: Record<string, string>;
}

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

export const generateSiteContent = async (brief: GenerationBrief): Promise<SiteContent> => {
  const apiKey = configService.geminiApiKey;
  if (!apiKey) {
    throw new Error("La API Key de Gemini no está configurada. Debe configurarse en el panel de Staging o ser provista por la App Madre.");
  }

  const ai = getAI();

  const systemInstruction = `
    Eres un Copywriter y Diseñador Web premium de Solutium.
    Tu tarea es generar un sitio web ESTRATÉGICO y MINIMALISTA.
    
    INDUSTRIA: ${brief.industry}
    NEGOCIO: ${brief.name}
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
      contents: `Genera una Landing Page para ${brief.name}. Responde solo con JSON conciso.`,
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
async function processResponse(text: string, brief: GenerationBrief): Promise<SiteContent> {
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

  const theme = mapStyleToTheme(brief.style, brief.brandColors);

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
