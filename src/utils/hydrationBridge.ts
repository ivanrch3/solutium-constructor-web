import { logDebug } from './debug';

/**
 * [SIP v10.5] Hydration Bridge Registry
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
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

interface ModuleBridgeAdapter {
  contentToSettings?: Record<string, string>;
  settingsToDeep?: Record<string, string>;
}

/**
 * Registro de adaptadores certificados por módulo.
 * Solo incluimos Hero y Features inicialmente como se solicitó.
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
      'secondary_cta.url': 'el_hero_ctas_secondary_url'
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
      'plans': 'el_pricing_plans_plans',
      'el_pricing_plans_plans': 'el_pricing_plans_plans'
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
  const adapter = MODULE_ADAPTERS[type];
  const result = { ...existingDeepValues };

  if (!adapter) return result;

  // 1. Content Bridge (Prioridad: section.content -> deep keys)
  if (content) {
    Object.entries(adapter.contentToSettings || {}).forEach(([contentPath, relativeKey]) => {
      const fullKey = `${moduleId}_${relativeKey}`;
      const value = getByPath(content, contentPath);

      // Verificación explícita de valores (0, "", false son válidos)
      const hasValue = value !== undefined && value !== null;

      // Solo aplicamos si la key NO existe ya en el resultado (preservar prioridad del editor)
      if (result[fullKey] === undefined && hasValue) {
        result[fullKey] = value;
      }
    });
  }

  // 2. Settings Aliases Bridge (Prioridad: section.settings raíz -> deep keys)
  if (settings) {
    Object.entries(adapter.settingsToDeep || {}).forEach(([settingsPath, relativeKey]) => {
      const fullKey = `${moduleId}_${relativeKey}`;
      const value = getByPath(settings, settingsPath);

      const hasValue = value !== undefined && value !== null;

      if (result[fullKey] === undefined && hasValue) {
        result[fullKey] = value;
      }
    });
  }

  return result;
};
