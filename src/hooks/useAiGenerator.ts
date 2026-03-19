import { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useBuilderStore } from '../store/useBuilderStore';
import { getModuleDefinition } from '../modules/registry';
import { getBusinessImage } from '../lib/images';
import { INDUSTRIES } from '../lib/industries';
import { useSolutiumContext } from '../context/SatelliteContext';

export const useAiGenerator = () => {
  const { payload } = useSolutiumContext();
  const [isGenerating, setIsGenerating] = useState(false);
  const { 
    projects, 
    activeProjectId, 
    activeAssetId, 
    setModules, 
    setDirty, 
    setProjects 
  } = useBuilderStore();

  const handleGenerateAi = async (
    customName?: string, 
    targetProjectId?: string, 
    targetAssetId?: string, 
    currentProjectsList?: any[], 
    assetName?: string, 
    businessContext?: {
      name: string;
      sector: string;
      description: string;
      objective: string;
      visualStyle: string;
    }
  ) => {
    setIsGenerating(true);
    const projId = targetProjectId || activeProjectId;
    const assId = targetAssetId || activeAssetId;
    const pList = currentProjectsList || projects;

    const saveGeneratedModules = (generated: any[]) => {
      // Ensure all generated modules have default data merged
      const processedModules = generated.map(m => {
        const def = getModuleDefinition(m.type);
        return {
          ...m,
          data: { ...(def?.defaultData || {}), ...m.data }
        };
      });

      setModules(processedModules);
      setDirty(false);
      const finalProjectsList = pList.map(p => {
        if (p.id === projId) {
          return {
            ...p,
            assets: p.assets.map((a: any) => {
              if (a.id === assId) {
                return { ...a, modules: processedModules, businessContext };
              }
              return a;
            })
          };
        }
        return p;
      });
      setProjects(finalProjectsList);
    };

    try {
      const genAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const businessName = businessContext?.name || customName || 'Proyecto Local';
      const pageName = assetName || 'Inicio';
      const industry = businessContext?.sector || 'other';
      
    const industryInfo = INDUSTRIES.find(i => i.id === industry || i.label === industry);
    const industryColors = industryInfo?.colors || { primary: '#000000', secondary: '#F5F5F5', accent: '#3B82F6' };

    const projectLogo = payload?.projectData?.logoUrl;
    const projectBusinessName = payload?.projectData?.name || payload?.userProfile?.businessName;

    const contextString = businessContext 
      ? `
      Información del Negocio:
      - Nombre: ${businessContext.name}
      - Sector: ${businessContext.sector}
      - Descripción: ${businessContext.description}
      - Objetivo de la página: ${businessContext.objective}
      - Estilo Visual deseado: ${businessContext.visualStyle}
      - Colores Recomendados: Primario: ${industryColors.primary}, Secundario: ${industryColors.secondary}, Acento: ${industryColors.accent}
      `
      : '';
    
    const prompt = `Genera una estructura de landing page completa y profesional para la página "${pageName}" de un negocio llamado "${businessName}". 
    ${contextString}
    
    REGLAS CRÍTICAS:
    1. Todo el contenido (títulos, descripciones, características, testimonios, planes, etc.) debe estar ESTRICTAMENTE relacionado con el sector "${businessContext?.sector || 'General'}" y la descripción proporcionada.
    2. Usa un tono profesional y persuasivo.
    3. Para los títulos, usa el formato *texto* para resaltar palabras clave que deben tener un efecto de GRADIENTE. Por ejemplo: "Cuidamos tu *Vehículo* como Propio".
    4. Adapta los colores y estilos al tipo de negocio. EVITA usar fondos negros por defecto. Usa variaciones de color (claros, oscuros, vibrantes) y GRADIENTES en fondos y textos basados en los colores de la industria: Primario: ${industryColors.primary}, Secundario: ${industryColors.secondary}, Acento: ${industryColors.accent}.
    5. En el módulo de características (features), genera EXACTAMENTE 3 o 6 características (nunca 4 ni 5) para mantener la simetría visual.
    6. En el módulo de características, genera ICONOS ÚNICOS y RELEVANTES para cada una (ej: "Search", "Shield", "Zap", "Heart", "Star", "Settings").
    7. En el módulo de características, incluye una DESCRIPCIÓN DETALLADA para cada característica.
    8. En el módulo de testimonios, genera exactamente 3 testimonios completos con nombre, cargo y comentario.
    9. SIEMPRE usa el año 2026 para cualquier fecha o copyright.
    10. Para el módulo 'stats', usa el campo 'stats' (no 'items'). Cada stat debe tener 'label', 'value' (un número o porcentaje, ej: "98%", "500+", "24/7") e 'iconName'.
    11. En el módulo 'footer', NO menciones a "Solutium". El contenido debe ser 100% sobre el negocio "${businessName}".
    
    INSTRUCCIÓN DE ESTRUCTURA:
    No uses siempre los mismos módulos. Debes DECIDIR qué módulos son más efectivos para este tipo de negocio específico. 
    Tipos de módulos disponibles: top-bar, header, hero, features, testimonials, pricing, product-showcase, team, faq, contact, footer, about, gallery, video, newsletter, cta-banner, spacer, trust-bar, process, stats.
    
    Responde ÚNICAMENTE con un array JSON de objetos:
    {
      "id": "string único",
      "type": "tipo de módulo",
      "data": { 
        ... campos específicos según el tipo ...
        "suggestedImageCategory": "valor exacto de categoría de imagen"
      }
    }
    
    ESPECIFICACIONES DE DATA POR TIPO:
    - hero: { title, subtitle, ctaText }
    - features: { title, subtitle, features: [{ title, description, icon, badge }] }
    - testimonials: { title, testimonials: [{ name, role, content }] }
    - pricing: { title, plans: [{ name, monthlyPrice, annualPrice, description, features: [{ text }], isPopular }] }
    - product-showcase: { title, products: [{ name, price, desc }] }
    - team: { title, items: [{ name, role, bio }] }
    - faq: { title, items: [{ question, answer }] }
    - stats: { title, stats: [{ label, value, iconName }] }
    - process: { title, steps: [{ title, description, iconName }] }
    - trust-bar: { title, logos: [{ name }] }
    - about: { title, subtitle, content, badge }
    
    REQUISITOS:
    - Selecciona entre 7 y 10 módulos.
    - El primer módulo DEBE ser 'header' o 'top-bar'.
    - El último módulo DEBE ser 'footer'.`;

      const response = await genAi.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      let generatedModules = JSON.parse(response.text || "[]");
      
      // Post-process to enforce specific requirements and inject curated images
      if (generatedModules.length > 0) {
        generatedModules = generatedModules.map((m: any) => {
          const suggestedCategory = m.data?.suggestedImageCategory || businessContext?.description || businessContext?.sector || '';
          
          // Inject industry colors into the theme if not present
          const theme = {
            primary: industryColors.primary,
            secondary: industryColors.secondary,
            accent: industryColors.accent,
            ...m.data.theme
          };
          m.data.theme = theme;

          if (m.type === 'header') {
            m.data.logoImage = projectLogo || m.data.logoImage;
            m.data.logoText = projectBusinessName || businessName;
          }

          if (m.type === 'footer') {
            m.data.logoImage = projectLogo || m.data.logoImage;
            m.data.logoText = projectBusinessName || businessName;
            m.data.copyright = `© 2026 ${projectBusinessName || businessName}. Todos los derechos reservados.`;
            // Ensure no Solutium mention in description
            if (m.data.description?.includes('Solutium')) {
              m.data.description = m.data.description.replace(/Solutium/g, projectBusinessName || businessName);
            }
          }

          if (m.type === 'hero') {
            return {
              ...m,
              data: {
                ...m.data,
                title: m.data.title || `Bienvenidos a *${businessName}*`,
                titleStyle: {
                  ...m.data.titleStyle,
                  highlightType: 'gradient'
                },
                layoutType: m.data.layoutType || 'layout-2',
                background: {
                  ...m.data.background,
                  image: getBusinessImage(suggestedCategory)
                }
              }
            };
          }

          if (m.type === 'about') {
            return {
              ...m,
              data: {
                ...m.data,
                image: getBusinessImage(suggestedCategory)
              }
            };
          }

          if (m.type === 'features' && m.data.features) {
            return {
              ...m,
              data: {
                ...m.data,
                features: m.data.features.map((f: any) => ({
                  ...f,
                  image: f.mediaType === 'image' ? getBusinessImage(suggestedCategory) : f.image
                }))
              }
            };
          }

          if (m.type === 'gallery' && m.data.images) {
            return {
              ...m,
              data: {
                ...m.data,
                images: m.data.images.map((img: any) => ({
                  ...img,
                  url: getBusinessImage(suggestedCategory)
                }))
              }
            };
          }

          if (m.type === 'video') {
            return {
              ...m,
              data: {
                ...m.data,
                posterImage: getBusinessImage(suggestedCategory)
              }
            };
          }

          if (m.type === 'newsletter') {
            return {
              ...m,
              data: {
                ...m.data,
                backgroundImage: getBusinessImage(suggestedCategory)
              }
            };
          }

          if (m.type === 'cta-banner') {
            return {
              ...m,
              data: {
                ...m.data,
                backgroundImage: m.data.backgroundStyle === 'image' ? getBusinessImage(suggestedCategory) : m.data.backgroundImage,
                mockupImage: m.data.showMockup ? getBusinessImage(suggestedCategory) : m.data.mockupImage
              }
            };
          }

          if (m.type === 'testimonials' && m.data.testimonials) {
            return {
              ...m,
              data: {
                ...m.data,
                testimonials: m.data.testimonials.map((t: any) => ({
                  ...t,
                  image: t.image || `https://i.pravatar.cc/150?u=${t.name || Math.random()}`
                }))
              }
            };
          }

          if (m.type === 'product-showcase' && m.data.products) {
            return {
              ...m,
              data: {
                ...m.data,
                products: m.data.products.map((p: any) => ({
                  ...p,
                  image: getBusinessImage(suggestedCategory)
                }))
              }
            };
          }

          if (m.type === 'pricing' && m.data.plans) {
            return {
              ...m,
              data: {
                ...m.data,
                plans: m.data.plans.map((p: any) => ({
                  ...p,
                  image: p.image ? getBusinessImage(suggestedCategory) : p.image
                }))
              }
            };
          }

          if (m.type === 'team' && m.data.items) {
            return {
              ...m,
              data: {
                ...m.data,
                items: m.data.items.map((item: any) => ({
                  ...item,
                  image: item.image || `https://i.pravatar.cc/150?u=${item.name}`
                }))
              }
            };
          }

          if (m.type === 'trust-bar' && m.data.logos) {
            return {
              ...m,
              data: {
                ...m.data,
                logos: m.data.logos.map((logo: any, idx: number) => ({
                  ...logo,
                  imageUrl: logo.imageUrl || `https://logo.clearbit.com/${logo.name.toLowerCase().replace(/\s+/g, '')}.com` || `https://picsum.photos/seed/logo${idx}/200/100`
                }))
              }
            };
          }

          if (m.type === 'process' && m.data.steps) {
            return {
              ...m,
              data: {
                ...m.data,
                steps: m.data.steps.map((step: any, idx: number) => ({
                  ...step,
                  iconName: step.iconName || (idx === 0 ? 'Search' : idx === 1 ? 'Settings' : 'CheckCircle')
                }))
              }
            };
          }

          if (m.type === 'stats' && m.data.stats) {
            return {
              ...m,
              data: {
                ...m.data,
                stats: m.data.stats.map((item: any, idx: number) => ({
                  ...item,
                  iconName: item.iconName || (idx === 0 ? 'Users' : idx === 1 ? 'Award' : 'Clock')
                }))
              }
            };
          }

          if (m.type === 'footer') {
            m.data.copyright = `© 2026 ${businessName}. Todos los derechos reservados.`;
          }

          return m;
        });
        
        saveGeneratedModules(generatedModules);
      }
    } catch (error) {
      console.error("Error generating AI content:", error);
      // Fallback to mock data if AI fails
      const businessName = businessContext?.name || customName || 'Proyecto Local';
      const pageName = assetName || 'Inicio';
      const aiModules = [
        { id: 'ai-top', type: 'top-bar', data: { message: '¡Bienvenidos a ' + businessName + '!' } },
        { id: 'ai-0', type: 'header', data: { logoText: businessName, isSticky: true } },
        { id: 'ai-1', type: 'hero', data: { title: businessName, subtitle: `Estás viendo la página: ${pageName}` } },
        { id: 'ai-2', type: 'features', data: { title: 'Nuestros Servicios' } },
        { id: 'ai-3', type: 'about', data: { title: 'Sobre Nosotros' } },
        { id: 'ai-4', type: 'testimonials', data: { title: 'Lo que dicen nuestros clientes' } },
        { id: 'ai-5', type: 'contact', data: { title: 'Contáctanos' } },
        { id: 'ai-footer', type: 'footer', data: { logoText: businessName } },
      ];
      saveGeneratedModules(aiModules);
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    handleGenerateAi
  };
};
