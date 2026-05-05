import { logDebug, isRenderDebugEnabled } from './debug';

/**
 * [SIP v10.6] Hydration Bridge Registry
 * Centraliza la compatibilidad entre el contrato de contenido plano (SIP) y las llaves profundas del constructor.
 * 
 * REGLAS TÉCNICAS:
 * 1. content_draft es la fuente del editor; Canvas usa settingsValues (llaves profundas).
 * 2. content_published usa section.content + section.settings planos.
 * 3. Este bridge mapea content plano hacia deep keys para el Viewer.
 * 4. PRIORIDAD: Si una deep key ya existe en existingDeepValues, se PRESERVA. No se sobrescribe.
 * 5. VALIDACIÓN: No usar if(value); usar null/undefined check explícito (0, "", false son válidos).
 * 6. REPEATERS: Mapear hacia las llaves reales del registry para asegurar persistencia.
 */

/**
 * Utility to get values from nested objects using dot notation (e.g. 'primary_cta.text')
 */
function getByPath(obj: any, path: string): any {
  if (!obj) return undefined;
  if (!path.includes('.')) return obj[path];
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

interface ModuleBridgeAdapter {
  contentToSettings?: Record<string, string>;
  settingsToDeep?: Record<string, string>;
}

/**
 * Registro de adaptadores certificados por módulo.
 */
const MODULE_ADAPTERS: Record<string, ModuleBridgeAdapter> = {
  hero: {
    contentToSettings: {
      'title': 'el_hero_typography_title',
      'subtitle': 'el_hero_typography_subtitle',
      'eyebrow': 'el_hero_typography_eyebrow',
      'image_url': 'el_hero_media_image',
      'primary_cta.text': 'el_hero_ctas_primary_text',
      'primary_cta.url': 'el_hero_ctas_primary_url',
      'secondary_cta.text': 'el_hero_ctas_secondary_text',
      'secondary_cta.url': 'el_hero_ctas_secondary_url',
      // Dynamic Text Compatibility (Legacy Spanish keys)
      'is_rotating_active': 'el_hero_typography_rotating_enabled',
      'texto_base': 'el_hero_typography_rotating_fixed',
      'palabras_efecto': 'el_hero_typography_rotating_options',
      'intervalo_ms': 'el_hero_typography_rotating_speed',
      // Dynamic Text Compatibility (New English keys from content.config)
      'config.texto_base': 'el_hero_typography_rotating_fixed',
      'config.palabras_efecto': 'el_hero_typography_rotating_options',
      'config.intervalo_ms': 'el_hero_typography_rotating_speed',
      'config.estilo_efecto': 'el_hero_typography_rotating_color'
    }
  },
  features: {
    contentToSettings: {
      'title': 'el_features_header_title',
      'subtitle': 'el_features_header_subtitle',
      'eyebrow': 'el_features_header_eyebrow'
    },
    settingsToDeep: {
      'columns': 'global_columns',
      'gap': 'global_gap',
      'layout': 'global_layout',
      'items': 'el_feature_card_items'
    }
  },
  pricing: {
    contentToSettings: {
      'title': 'el_pricing_header_title',
      'subtitle': 'el_pricing_header_subtitle',
      'eyebrow': 'el_pricing_header_eyebrow',
      'plans': 'el_pricing_plans_plans'
    },
    settingsToDeep: {
      'columns': 'global_columns',
      'gap': 'global_gap',
      'layout': 'global_layout',
      'plans': 'el_pricing_plans_plans'
    }
  },
  menu: {
    contentToSettings: {
      'logo_text': 'el_menu_logo_logo_text',
      'logo_url': 'el_menu_logo_logo_img',
      'image_url': 'el_menu_logo_logo_img',
      'links': 'el_menu_items_links',
      'items': 'el_menu_items_links'
    },
    settingsToDeep: {
      'sticky': 'global_sticky',
      'position': 'global_position'
    }
  },
  navegacion: {
    contentToSettings: {
      'logo_text': 'el_menu_logo_logo_text',
      'logo_url': 'el_menu_logo_logo_img',
      'image_url': 'el_menu_logo_logo_img',
      'links': 'el_menu_items_links',
      'items': 'el_menu_items_links'
    },
    settingsToDeep: {
      'sticky': 'global_sticky',
      'position': 'global_position'
    }
  },
  about: {
    contentToSettings: {
      // Eyebrow
      'eyebrow': 'el_about_narrative_eyebrow',
      'label': 'el_about_narrative_eyebrow',
      'kicker': 'el_about_narrative_eyebrow',
      
      // Title
      'title': 'el_about_narrative_title',
      'titulo': 'el_about_narrative_title',
      'heading': 'el_about_narrative_title',
      'headline': 'el_about_narrative_title',
      
      // Description
      'description': 'el_about_narrative_description',
      'descripcion': 'el_about_narrative_description',
      'subtitle': 'el_about_narrative_description',
      'subtitulo': 'el_about_narrative_description',
      'summary': 'el_about_narrative_description',
      'resumen': 'el_about_narrative_description',
      'story': 'el_about_narrative_description',
      'historia': 'el_about_narrative_description',
      
      // Quote
      'quote': 'el_about_narrative_quote',
      'cita': 'el_about_narrative_quote',
      'tagline': 'el_about_narrative_quote',
      'frase': 'el_about_narrative_quote',

      // Image
      'image_url': 'el_about_visual_image_url',
      'image.url': 'el_about_visual_image_url',
      'media.url': 'el_about_visual_image_url',
      'image': 'el_about_visual_image_url',
      'img': 'el_about_visual_image_url',
      'featured_image': 'el_about_visual_image_url',
      
      'image_alt': 'el_about_visual_image_alt',
      'image.alt': 'el_about_visual_image_alt',
      'media.alt': 'el_about_visual_image_alt',
      'alt': 'el_about_visual_image_alt',

      // CTA
      'button_text': 'el_about_narrative_button_text',
      'cta_text': 'el_about_narrative_button_text',
      'cta.label': 'el_about_narrative_button_text',
      'cta.text': 'el_about_narrative_button_text',
      'cta.title': 'el_about_narrative_button_text',
      'button_url': 'el_about_narrative_button_url',
      'cta_url': 'el_about_narrative_button_url',
      'cta.url': 'el_about_narrative_button_url',
      'cta.href': 'el_about_narrative_button_url',
      'cta.link': 'el_about_narrative_button_url'
    },
    settingsToDeep: {
      'layout': 'global_layout',
      'image_position': 'global_layout', // En about el layout controla la posición
      'background_style': 'global_bg_color'
    }
  }
};

interface BridgeParams {
  type: string;
  moduleId: string;
  content: any;
  settings: any;
  existingDeepValues: Record<string, any>;
}

/**
 * Fallback genérico para hidratación.
 * Si una key existe en content (ej. "title"), genera una key prefijada (ej. "mod_123_title")
 * solo si no existe ya en el resultado.
 */
function applyGenericFallback(moduleId: string, data: any, result: Record<string, any>, prefix: string = '') {
  if (!data || typeof data !== 'object') return;

  Object.entries(data).forEach(([key, value]) => {
    // Evitar hidratar objetos complejos de configuración a bajo nivel (config, style, etc)
    // a menos que sean de primer nivel y simples.
    if (key === 'config' || key === 'styles' || key === 'settings') return;

    const fullKey = `${moduleId}_${prefix}${key}`;
    const hasValue = value !== undefined && value !== null;

    if (result[fullKey] === undefined && hasValue) {
      result[fullKey] = value;
    }
  });
}

/**
 * Mapea valores desde content/settings raíz hacia settingsValues profundos
 * Respetando la prioridad de los valores existentes.
 */
export const bridgeModuleContent = ({
  type,
  moduleId,
  content,
  settings,
  existingDeepValues
}: BridgeParams): Record<string, any> => {
  // Limpiar tipo si viene con sufijo _dinamico
  const baseType = type.replace('_dinamico', '');
  const adapter = MODULE_ADAPTERS[baseType];
  const result = { ...existingDeepValues };
  
  const debug = isRenderDebugEnabled();
  const originalKeys = Object.keys(result);
  let strategy: 'explicit' | 'generic-fallback' | 'explicit+fallback' = 'generic-fallback';
  let mappedKeys: string[] = [];
  let aliasesUsed: string[] = [];

  // 1. Aplicar adaptador explícito si existe
  if (adapter) {
    strategy = 'explicit+fallback';
    
    // Content Bridge
    if (content) {
      Object.entries(adapter.contentToSettings || {}).forEach(([contentPath, relativeKey]) => {
        const fullKey = `${moduleId}_${relativeKey}`;
        const value = getByPath(content, contentPath);
        const hasValue = value !== undefined && value !== null;

        if (result[fullKey] === undefined && hasValue) {
          result[fullKey] = value;
          mappedKeys.push(fullKey);
          aliasesUsed.push(contentPath);
        }
      });
    }

    // Settings Bridge
    if (settings) {
      Object.entries(adapter.settingsToDeep || {}).forEach(([settingsPath, relativeKey]) => {
        const fullKey = `${moduleId}_${relativeKey}`;
        const value = getByPath(settings, settingsPath);
        const hasValue = value !== undefined && value !== null;

        if (result[fullKey] === undefined && hasValue) {
          result[fullKey] = value;
          mappedKeys.push(fullKey);
        }
      });
    }

    // --- Specialized About Module Logic ---
    if (baseType === 'about' && content) {
      // 1. Layout value mapping
      const layoutKey = `${moduleId}_global_layout`;
      const rawLayout = settings.layout || content.layout || settings.image_position || content.image_position || content.imagePosition;
      
      if (rawLayout && result[layoutKey] === undefined) {
        if (rawLayout === 'left' || rawLayout === 'split_left') result[layoutKey] = 'split_left';
        else if (rawLayout === 'right' || rawLayout === 'split_right') result[layoutKey] = 'split_right';
        else if (rawLayout === 'centered' || rawLayout === 'center') result[layoutKey] = 'centered';
        else if (rawLayout === 'overlapping') result[layoutKey] = 'overlapping';
        mappedKeys.push(layoutKey);
      }

      // 2. Stats Normalization
      const statsKey = `${moduleId}_el_about_stats_stats_list`;
      const statsSource = content.stats || content.metrics || content.stats_list || content.numbers || content.indicators || content.indicadores;
      
      if (Array.isArray(statsSource) && statsSource.length > 0 && result[statsKey] === undefined) {
        result[statsKey] = statsSource.map(item => {
          if (typeof item === 'string') return { value: '', label: item, icon: 'Star' };
          return {
            value: String(item.value || item.numero || item.number || item.metric || item.cifra || ''),
            label: String(item.label || item.title || item.titulo || item.text || item.descripcion || ''),
            icon: String(item.icon || item.icono || 'Star')
          };
        });
        mappedKeys.push(statsKey);
      }

      // Mission/Vision Composition (if description is missing)
      const descKey = `${moduleId}_el_about_narrative_description`;
      const coreDescKeys = ['description', 'descripcion', 'subtitle', 'subtitulo', 'summary', 'resumen', 'story', 'historia'];
      const hasCoreDesc = coreDescKeys.some(k => content[k] !== undefined);
      
      if (!hasCoreDesc && result[descKey] === undefined) {
        const mision = content.mision || content.mission;
        const vision = content.vision;
        if (mision && vision) {
          result[descKey] = `Misión: ${mision}\n\nVisión: ${vision}`;
          mappedKeys.push(descKey);
          aliasesUsed.push('composition:mision+vision');
        } else if (mision) {
          result[descKey] = mision;
          mappedKeys.push(descKey);
          aliasesUsed.push('alias:mision');
        } else if (vision) {
          result[descKey] = vision;
          mappedKeys.push(descKey);
          aliasesUsed.push('alias:vision');
        }
      }
    }
  }

  // 2. Aplicar Fallback Genérico (asegura que keys como 'title' lleguen como 'mod_123_title')
  applyGenericFallback(moduleId, content, result);
  applyGenericFallback(moduleId, settings, result);

  if (debug) {
    const finalKeys = Object.keys(result);
    const addedKeys = finalKeys.filter(k => !originalKeys.includes(k));
    
    logDebug('[HYDRATION_BRIDGE_DEBUG]', {
      moduleId,
      moduleType: type,
      baseType,
      strategy,
      adapter: baseType,
      mappedKeys,
      aliasesUsed,
      statsCount: baseType === 'about' ? (result[`${moduleId}_el_about_stats_stats_list`]?.length || 0) : 0,
      ctaDetected: Boolean(result[`${moduleId}_el_about_narrative_button_text`]),
      imageDetected: Boolean(result[`${moduleId}_el_about_visual_image_url`]),
      originalContentKeys: content ? Object.keys(content) : [],
      addedKeys,
      totalKeys: finalKeys.length
    });
  }

  return result;
};

