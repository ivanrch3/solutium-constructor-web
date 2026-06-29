import {
  AIBlueprintId,
  AIBusinessTypeId,
  AIFixedModuleType,
  BusinessPageBlueprint
} from '../types/ai';

export interface AIBusinessTypeOption {
  id: AIBusinessTypeId;
  label: string;
  description: string;
  blueprintId?: AIBlueprintId;
  usesCustomFallback?: boolean;
}

export const AI_FIXED_PAGE_MODULE_TYPES: AIFixedModuleType[] = [
  'navegacion',
  'hero',
  'features',
  'dynamic_cards',
  'pricing',
  'comparative',
  'process',
  'stats',
  'gallery',
  'video',
  'products',
  'trusted_logos',
  'team',
  'testimonials',
  'faq',
  'cta',
  'newsletter',
  'contact',
  'spacer',
  'footer',
  'genius_web_wa'
];

export const AI_FIXED_MODULE_LABELS: Record<string, string> = {
  navegacion: 'Menú',
  hero: 'Hero principal',
  features: 'Beneficios',
  dynamic_cards: 'Tarjetas dinámicas',
  pricing: 'Planes',
  comparative: 'Comparativo',
  process: 'Proceso',
  stats: 'Estadísticas',
  gallery: 'Galería',
  video: 'Video',
  products: 'Productos',
  trusted_logos: 'Logos de confianza',
  team: 'Equipo',
  testimonials: 'Testimonios',
  faq: 'Preguntas frecuentes',
  cta: 'Llamada a la acción',
  newsletter: 'Newsletter',
  contact: 'Contacto',
  spacer: 'Espaciador',
  footer: 'Pie de página',
  genius_web_wa: 'WhatsApp'
};

export const AI_BUSINESS_TYPE_OPTIONS: AIBusinessTypeOption[] = [
  {
    id: 'restaurant',
    label: 'Restaurante',
    description: 'Comida, bebidas, reservas, delivery o consumo en sitio.',
    blueprintId: 'restaurant_landing_v1'
  },
  {
    id: 'professional_services',
    label: 'Servicios profesionales',
    description: 'Consultoría, despachos, agencias o servicios por cita.',
    blueprintId: 'professional_services_landing_v1'
  },
  {
    id: 'retail_store',
    label: 'Tienda o comercio',
    description: 'Negocios con catálogo, productos destacados o promociones.',
    blueprintId: 'retail_store_landing_v1'
  },
  {
    id: 'health_wellness',
    label: 'Salud y bienestar',
    description: 'Clínicas, nutrición, fitness o bienestar integral.',
    blueprintId: 'professional_services_landing_v1'
  },
  {
    id: 'digital_services',
    label: 'Servicios digitales',
    description: 'Software, automatización, diseño o soluciones digitales.',
    blueprintId: 'professional_services_landing_v1'
  },
  {
    id: 'other',
    label: 'Otro',
    description: 'Usa una etiqueta personalizada con el blueprint más cercano.',
    usesCustomFallback: true,
    blueprintId: 'professional_services_landing_v1'
  }
];

const RESTAURANT_BLUEPRINT: BusinessPageBlueprint = {
  id: 'restaurant_landing_v1',
  businessTypeId: 'restaurant',
  businessTypeLabel: 'Restaurante',
  version: 1,
  pageType: 'landing',
  modules: [
    {
      id: 'menu',
      moduleType: 'navegacion',
      summaryLabel: 'Menú',
      purpose: 'Abrir la página con identidad de marca y enlaces a secciones.',
      requiredContentFields: ['menu.logoText', 'menu.links']
    },
    {
      id: 'hero',
      moduleType: 'hero',
      summaryLabel: 'Hero principal',
      purpose: 'Presentar la propuesta principal del restaurante y el CTA.',
      requiredContentFields: ['hero.title', 'hero.subtitle', 'hero.primaryCta']
    },
    {
      id: 'benefits',
      moduleType: 'features',
      summaryLabel: 'Beneficios',
      purpose: 'Explicar por qué elegir el negocio.',
      requiredContentFields: ['benefits.title', 'benefits.subtitle', 'benefits.items']
    },
    {
      id: 'featured_menu',
      moduleType: 'dynamic_cards',
      summaryLabel: 'Menú destacado',
      purpose: 'Mostrar productos o platos destacados con copy editable.',
      requiredContentFields: ['featuredItems.title', 'featuredItems.subtitle', 'featuredItems.items']
    },
    {
      id: 'gallery',
      moduleType: 'gallery',
      summaryLabel: 'Galería',
      purpose: 'Mostrar productos, ambiente o preparación.',
      requiredContentFields: ['gallery.title', 'gallery.subtitle', 'gallery.items']
    },
    {
      id: 'testimonials',
      moduleType: 'testimonials',
      summaryLabel: 'Testimonios',
      purpose: 'Agregar prueba social editable.',
      requiredContentFields: ['testimonials.title', 'testimonials.subtitle', 'testimonials.items']
    },
    {
      id: 'faq',
      moduleType: 'faq',
      summaryLabel: 'Preguntas frecuentes',
      purpose: 'Resolver dudas sobre horarios, pedidos y atención.',
      requiredContentFields: ['faq.title', 'faq.subtitle', 'faq.items']
    },
    {
      id: 'cta',
      moduleType: 'cta',
      summaryLabel: 'Llamada a la acción',
      purpose: 'Cerrar la página con un siguiente paso claro.',
      requiredContentFields: ['cta.title', 'cta.subtitle', 'cta.primaryText']
    },
    {
      id: 'contact',
      moduleType: 'contact',
      summaryLabel: 'Contacto',
      purpose: 'Mostrar datos de atención, ubicación y acceso rápido.',
      requiredContentFields: ['contact.title', 'contact.subtitle']
    },
    {
      id: 'footer',
      moduleType: 'footer',
      summaryLabel: 'Pie de página',
      purpose: 'Cerrar con identidad y datos básicos del negocio.',
      requiredContentFields: ['footer.bio']
    }
  ]
};

const PROFESSIONAL_SERVICES_BLUEPRINT: BusinessPageBlueprint = {
  id: 'professional_services_landing_v1',
  businessTypeId: 'professional_services',
  businessTypeLabel: 'Servicios profesionales',
  version: 1,
  pageType: 'landing',
  modules: [
    {
      id: 'menu',
      moduleType: 'navegacion',
      summaryLabel: 'Menú',
      purpose: 'Identidad y navegación principal.',
      requiredContentFields: ['menu.logoText', 'menu.links']
    },
    {
      id: 'hero',
      moduleType: 'hero',
      summaryLabel: 'Hero principal',
      purpose: 'Definir propuesta de valor y CTA.',
      requiredContentFields: ['hero.title', 'hero.subtitle', 'hero.primaryCta']
    },
    {
      id: 'benefits',
      moduleType: 'features',
      summaryLabel: 'Servicios y beneficios',
      purpose: 'Explicar diferenciales y áreas de apoyo.',
      requiredContentFields: ['benefits.title', 'benefits.subtitle', 'benefits.items']
    },
    {
      id: 'process',
      moduleType: 'process',
      summaryLabel: 'Proceso',
      purpose: 'Explicar cómo se trabaja con el cliente.',
      requiredContentFields: ['featuredItems.title', 'featuredItems.subtitle', 'featuredItems.items']
    },
    {
      id: 'testimonials',
      moduleType: 'testimonials',
      summaryLabel: 'Testimonios',
      purpose: 'Agregar confianza editable.',
      requiredContentFields: ['testimonials.title', 'testimonials.subtitle', 'testimonials.items']
    },
    {
      id: 'faq',
      moduleType: 'faq',
      summaryLabel: 'Preguntas frecuentes',
      purpose: 'Resolver dudas sobre trabajo, entregables y tiempos.',
      requiredContentFields: ['faq.title', 'faq.subtitle', 'faq.items']
    },
    {
      id: 'cta',
      moduleType: 'cta',
      summaryLabel: 'Llamada a la acción',
      purpose: 'Llevar a agendar o solicitar diagnóstico.',
      requiredContentFields: ['cta.title', 'cta.subtitle', 'cta.primaryText']
    },
    {
      id: 'contact',
      moduleType: 'contact',
      summaryLabel: 'Contacto',
      purpose: 'Mostrar canales de atención.',
      requiredContentFields: ['contact.title', 'contact.subtitle']
    },
    {
      id: 'footer',
      moduleType: 'footer',
      summaryLabel: 'Pie de página',
      purpose: 'Cerrar con identidad y datos clave.',
      requiredContentFields: ['footer.bio']
    }
  ]
};

const RETAIL_STORE_BLUEPRINT: BusinessPageBlueprint = {
  id: 'retail_store_landing_v1',
  businessTypeId: 'retail_store',
  businessTypeLabel: 'Tienda o comercio',
  version: 1,
  pageType: 'landing',
  modules: [
    {
      id: 'menu',
      moduleType: 'navegacion',
      summaryLabel: 'Menú',
      purpose: 'Navegación principal del catálogo o campañas.',
      requiredContentFields: ['menu.logoText', 'menu.links']
    },
    {
      id: 'hero',
      moduleType: 'hero',
      summaryLabel: 'Hero principal',
      purpose: 'Presentar la propuesta comercial principal.',
      requiredContentFields: ['hero.title', 'hero.subtitle', 'hero.primaryCta']
    },
    {
      id: 'featured_menu',
      moduleType: 'features',
      summaryLabel: 'Productos destacados',
      purpose: 'Mostrar categorías o productos destacados.',
      requiredContentFields: ['featuredItems.title', 'featuredItems.subtitle', 'featuredItems.items']
    },
    {
      id: 'benefits',
      moduleType: 'features',
      summaryLabel: 'Beneficios de compra',
      purpose: 'Explicar facilidades, despacho o garantía.',
      requiredContentFields: ['benefits.title', 'benefits.subtitle', 'benefits.items']
    },
    {
      id: 'gallery',
      moduleType: 'gallery',
      summaryLabel: 'Galería',
      purpose: 'Mostrar productos y contexto visual.',
      requiredContentFields: ['gallery.title', 'gallery.subtitle', 'gallery.items']
    },
    {
      id: 'testimonials',
      moduleType: 'testimonials',
      summaryLabel: 'Testimonios',
      purpose: 'Agregar confianza editable.',
      requiredContentFields: ['testimonials.title', 'testimonials.subtitle', 'testimonials.items']
    },
    {
      id: 'faq',
      moduleType: 'faq',
      summaryLabel: 'Preguntas frecuentes',
      purpose: 'Resolver dudas de compra, cambios y entregas.',
      requiredContentFields: ['faq.title', 'faq.subtitle', 'faq.items']
    },
    {
      id: 'cta',
      moduleType: 'cta',
      summaryLabel: 'Llamada a la acción',
      purpose: 'Llevar a compra, contacto o visita.',
      requiredContentFields: ['cta.title', 'cta.subtitle', 'cta.primaryText']
    },
    {
      id: 'contact',
      moduleType: 'contact',
      summaryLabel: 'Contacto',
      purpose: 'Mostrar canales de atención y ubicación.',
      requiredContentFields: ['contact.title', 'contact.subtitle']
    },
    {
      id: 'footer',
      moduleType: 'footer',
      summaryLabel: 'Pie de página',
      purpose: 'Cerrar con identidad y datos clave.',
      requiredContentFields: ['footer.bio']
    }
  ]
};

export const AI_PAGE_BLUEPRINTS: Record<AIBlueprintId, BusinessPageBlueprint> = {
  restaurant_landing_v1: RESTAURANT_BLUEPRINT,
  professional_services_landing_v1: PROFESSIONAL_SERVICES_BLUEPRINT,
  retail_store_landing_v1: RETAIL_STORE_BLUEPRINT
};

export const getAIBusinessTypeOption = (businessTypeId?: string | null) =>
  AI_BUSINESS_TYPE_OPTIONS.find(option => option.id === businessTypeId) || AI_BUSINESS_TYPE_OPTIONS[0];

export const getAIBlueprintForBusinessType = (businessTypeId?: string | null) => {
  const option = getAIBusinessTypeOption(businessTypeId);
  return option.blueprintId ? AI_PAGE_BLUEPRINTS[option.blueprintId] : RESTAURANT_BLUEPRINT;
};
