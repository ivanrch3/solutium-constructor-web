import { GoogleGenAI, Type } from "@google/genai";
import { SiteContent } from "../types";
import { mapStyleToTheme, VisualStyle } from "../lib/styleMapper";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const PEXELS_API_KEY = process.env.PEXELS_API_KEY || '';

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
  if (!PEXELS_API_KEY) return [];
  try {
    const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5`, {
      headers: {
        Authorization: PEXELS_API_KEY
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
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined");
  }

  const systemInstruction = `
    Eres un Copywriter y Diseñador Web profesional experto en marketing digital para Solutium.
    Tu tarea es generar la estructura y contenido de un sitio web premium.
    
    INDUSTRIA: ${brief.industry}
    NEGOCIO: ${brief.name}
    DESCRIPCIÓN: ${brief.description}
    OBJETIVO: ${brief.goal}
    ESTILO: ${brief.style}

    DEBES usar exclusivamente estos IDs de módulos:
    - Navegación: mod_menu_1 (el_menu_logo, el_menu_items)
    - Impacto: mod_hero_1 (el_hero_typography)
    - Productos/Servicios: mod_products_1 (el_products_header)
    - Pie: mod_footer_1 (el_footer_brand, el_footer_nav, el_footer_contact)

    PRINCIPIOS DE REDACCIÓN:
    - Títulos persuasivos usando sintaxis de resaltado: **texto resaltado**.
    - Copys orientados al objetivo (${brief.goal}).
    - Si el valor es una imagen, devuelve una QUERY DE BÚSQUEDA en inglés para stock photos.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Genera el sitio web para ${brief.name} (${brief.industry}).`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: SITE_SCHEMA as any
      }
    });

    const generatedData = JSON.parse(response.text);
    
    // Capa D: Curador de Imágenes (Pexels)
    const sectionsWithImages = await Promise.all(generatedData.sections.map(async (section: any) => {
      const enrichedElements = await Promise.all(section.elements.map(async (el: any) => {
        const enrichedFields = await Promise.all(el.fields.map(async (field: any) => {
          // Detectar si el campo requiere una imagen basada en metadatos o keyword
          if (field.id.includes('img') || field.id.includes('logo')) {
            const photos = await searchStockPhotos(`${brief.industry} ${field.value || ''}`);
            return { ...field, value: photos[0] || 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg' }; // Fallback
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
  } catch (error) {
    console.error("AI Generation failed:", error);
    throw error;
  }
};

export const generateSite = generateSiteContent;
