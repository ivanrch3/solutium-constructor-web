import {
  AIBusinessTypeId,
  AIPageGenerationBrief,
  AIPagePlan,
  AIPagePlanSection,
  BusinessPageBlueprint,
  GeneratedBusinessContent,
  GeneratedFaqItem,
  GeneratedFeatureItem,
  GeneratedGalleryItem,
  GeneratedShowcaseItem,
  GeneratedTestimonialItem
} from '../types/ai';
import {
  AI_FIXED_MODULE_LABELS,
  AI_FIXED_PAGE_MODULE_TYPES,
  getAIBlueprintForBusinessType,
  getAIBusinessTypeOption
} from '../constants/aiPageBlueprints';

export const AI_PAGE_PLAN_ACTION_SLUG = 'website_ai_generate_page';
export const AI_PAGE_PLAN_ESTIMATED_CREDITS = 15;

export const ALLOWED_AI_PAGE_MODULE_TYPES = [...AI_FIXED_PAGE_MODULE_TYPES] as const;

export const ALLOWED_REFERENCE_AI_PAGE_MODULE_TYPES = [
  ...AI_FIXED_PAGE_MODULE_TYPES,
  'composition_section'
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

type AllowedModuleTypeList = readonly string[];
type NormalizedCompositionPreset = typeof ALLOWED_COMPOSITION_PRESETS[number];

const PRESET_ALIASES: Record<string, NormalizedCompositionPreset> = {
  servicios: 'services_grid',
  proceso: 'process_steps',
  confianza_logos: 'trust_logos',
  comparativa: 'comparison'
};

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
    .replace(/\s+/g, ' ')
    .trim()
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

const sanitizeItems = <T>(
  value: unknown,
  mapper: (item: Record<string, unknown>, index: number) => T | null,
  maxItems = 6
): T[] => {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, maxItems)
    .map((item, index) => (isRecord(item) ? mapper(item, index) : null))
    .filter(Boolean) as T[];
};

const sanitizeStringArray = (value: unknown, maxItems = 6) => {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, maxItems)
    .map(item => stripUnsafeText(item))
    .filter(Boolean);
};

const buildInlineSvgPlaceholder = (title: string, subtitle: string, accent: string) => {
  const safeTitle = stripUnsafeText(title, 'Imagen');
  const safeSubtitle = stripUnsafeText(subtitle, '');
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0F172A"/>
          <stop offset="100%" stop-color="${accent}"/>
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#bg)"/>
      <circle cx="1240" cy="220" r="160" fill="rgba(255,255,255,0.10)"/>
      <circle cx="320" cy="700" r="190" fill="rgba(255,255,255,0.08)"/>
      <rect x="180" y="180" width="1240" height="540" rx="40" fill="rgba(15,23,42,0.25)" stroke="rgba(255,255,255,0.16)"/>
      <text x="220" y="360" fill="#F8FAFC" font-family="Inter, Arial, sans-serif" font-size="78" font-weight="800">${safeTitle}</text>
      <text x="220" y="440" fill="#DBEAFE" font-family="Inter, Arial, sans-serif" font-size="34">${safeSubtitle}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const toAbsoluteAnchor = (value: string, fallback = '#top') => {
  const clean = stripUnsafeText(value, fallback);
  if (!clean) return fallback;
  if (clean.startsWith('#')) return clean;
  return clean;
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

const normalizeModuleType = (
  moduleType: unknown,
  warnings: string[],
  allowedModuleTypes: AllowedModuleTypeList
) => {
  const clean = stripUnsafeText(moduleType, allowedModuleTypes[0] || 'hero')
    .toLowerCase()
    .replace(/[^a-z0-9_/-]+/g, '_');

  if (allowedModuleTypes.includes(clean)) {
    return clean;
  }

  warnings.push(`Tipo de m\u00F3dulo no permitido descartado: ${clean || 'vac\u00EDo'}`);
  return allowedModuleTypes[0] || 'hero';
};

const buildDefaultMenuLinks = () => [
  { label: 'Inicio', url: '#top' },
  { label: 'Beneficios', url: '#section-benefits' },
  { label: 'Contacto', url: '#section-contact' }
];

const resolveBusinessLabel = (brief: AIPageGenerationBrief) => {
  const fallbackOption = getAIBusinessTypeOption(brief.businessTypeId);
  const rawBusinessType = stripUnsafeText(brief.businessType);
  const businessTypeLabel = stripUnsafeText(
    brief.businessTypeLabel,
    rawBusinessType || fallbackOption.label
  );
  const businessTypeId = (brief.businessTypeId || fallbackOption.id || 'professional_services') as AIBusinessTypeId;

  return { businessTypeId, businessTypeLabel };
};

const sanitizeFeatureItems = (value: unknown, fallbackPrefix: string): GeneratedFeatureItem[] => {
  const items = sanitizeItems<GeneratedFeatureItem>(
    value,
    (item, index) => ({
      title: stripUnsafeText(item.title, `${fallbackPrefix} ${index + 1}`),
      description: stripUnsafeText(item.description || item.desc, 'Contenido editable para esta tarjeta.'),
      icon: stripUnsafeText(item.icon, 'Star'),
      imageUrl: stripUnsafeText(item.imageUrl || item.image, ''),
      imagePrompt: stripUnsafeText(item.imagePrompt, ''),
      badge: stripUnsafeText(item.badge, '')
    }),
    6
  );

  return items.filter(item => item.title && item.description);
};

const sanitizeShowcaseItems = (value: unknown, fallbackPrefix: string): GeneratedShowcaseItem[] => {
  const items = sanitizeItems<GeneratedShowcaseItem>(
    value,
    (item, index) => ({
      name: stripUnsafeText(item.name || item.title, `${fallbackPrefix} ${index + 1}`),
      description: stripUnsafeText(item.description || item.desc, 'Descripci\u00F3n editable del elemento destacado.'),
      tag: stripUnsafeText(item.tag || item.badge, ''),
      price: stripUnsafeText(item.price, ''),
      imageUrl: stripUnsafeText(item.imageUrl || item.image, ''),
      imagePrompt: stripUnsafeText(item.imagePrompt, '')
    }),
    6
  );

  return items.filter(item => item.name && item.description);
};

const sanitizeGalleryItems = (value: unknown, fallbackPrefix: string): GeneratedGalleryItem[] => {
  const items = sanitizeItems<GeneratedGalleryItem>(
    value,
    (item, index) => ({
      title: stripUnsafeText(item.title || item.name, `${fallbackPrefix} ${index + 1}`),
      description: stripUnsafeText(item.description || item.desc, 'Imagen editable para esta secci\u00F3n.'),
      category: stripUnsafeText(item.category, 'Galer\u00EDa'),
      imageUrl: stripUnsafeText(item.imageUrl || item.url, ''),
      imagePrompt: stripUnsafeText(item.imagePrompt, '')
    }),
    8
  );

  return items.filter(item => item.title);
};

const sanitizeTestimonials = (value: unknown): GeneratedTestimonialItem[] => {
  const items = sanitizeItems<GeneratedTestimonialItem>(
    value,
    (item, index) => ({
      author: stripUnsafeText(item.author, `Cliente ${index + 1}`),
      role: stripUnsafeText(item.role, 'Cliente'),
      text: stripUnsafeText(item.text, 'Testimonio editable para revisar antes de publicar.'),
      stars: Math.max(4, Math.min(5, Number(item.stars || 5) || 5))
    }),
    6
  );

  return items.filter(item => item.author && item.text);
};

const sanitizeFaqItems = (value: unknown): GeneratedFaqItem[] => {
  const items = sanitizeItems<GeneratedFaqItem>(
    value,
    (item, index) => ({
      question: stripUnsafeText(item.question, `Pregunta frecuente ${index + 1}`),
      answer: stripUnsafeText(item.answer, 'Respuesta editable para esta pregunta frecuente.'),
      category: stripUnsafeText(item.category, 'general')
    }),
    8
  );

  return items.filter(item => item.question && item.answer);
};

export const buildMinimalGeneratedBusinessContent = (
  brief: AIPageGenerationBrief,
  blueprint: BusinessPageBlueprint,
  warnings: string[] = []
): GeneratedBusinessContent => {
  const { businessTypeId, businessTypeLabel } = resolveBusinessLabel(brief);
  const businessName = stripUnsafeText(brief.businessName, stripUnsafeText(brief.businessType, businessTypeLabel));
  const pageGoal = stripUnsafeText(brief.pageGoal, 'Conseguir clientes potenciales');
  const instructions = stripUnsafeText(
    brief.instructions,
    `Presentar ${businessName} con una estructura editable y coherente para ${businessTypeLabel}.`
  );
  const primaryCta = stripUnsafeText(brief.primaryCta, 'Solicitar informaci\u00F3n');
  const secondaryCta = pageGoal.toLowerCase().includes('cliente') ? 'Ver men\u00FA' : 'Conocer m\u00E1s';

  if (warnings.length === 0) {
    warnings.push('No hay una sesi\u00F3n v\u00E1lida para usar la IA. Se gener\u00F3 una versi\u00F3n editable con una plantilla base.');
  }

  if (blueprint.id === 'restaurant_landing_v1') {
    const dishSeed = instructions.toLowerCase();
    const heroPlaceholder = buildInlineSvgPlaceholder(
      'Batidos y cocina fresca',
      businessName,
      '#22C55E'
    );
    const dishItems = [
      dishSeed.includes('batido')
        ? {
            name: 'Batidos de fruta natural',
            description: 'Recetas frescas preparadas al momento con sabores tropicales y combinaciones ligeras.',
            tag: 'Favorito',
            imageUrl: buildInlineSvgPlaceholder('Batidos naturales', 'Fruta fresca y energía ligera', '#F97316'),
            imagePrompt: 'Batidos de fruta natural con presentaci\u00F3n saludable y colorida'
          }
        : {
            name: 'Especialidad de la casa',
            description: 'Selecci\u00F3n destacada pensada para convertir una primera visita en una reserva.',
            tag: 'Recomendado',
            imageUrl: buildInlineSvgPlaceholder('Especialidad de la casa', 'Presentación cuidada y apetecible', '#F97316'),
            imagePrompt: 'Plato principal de restaurante con presentaci\u00F3n cuidada'
          },
      {
        name: dishSeed.includes('panini') ? 'Paninis artesanales' : 'Opciones saladas',
        description: 'Preparaciones calientes con ingredientes frescos y combinaciones f\u00E1ciles de elegir.',
        tag: 'Nuevo',
        imageUrl: buildInlineSvgPlaceholder('Paninis artesanales', 'Ingredientes frescos y cocina cálida', '#F59E0B'),
        imagePrompt: 'Panini artesanal con ingredientes frescos y fondo c\u00E1lido'
      },
      {
        name: dishSeed.includes('quesadilla') ? 'Quesadillas al momento' : 'Platos ligeros',
        description: 'Alternativas r\u00E1pidas, bien presentadas y adaptables a diferentes horarios del d\u00EDa.',
        tag: 'Top ventas',
        imageUrl: buildInlineSvgPlaceholder('Quesadillas al momento', 'Servicio ágil y antojo inmediato', '#EF4444'),
        imagePrompt: 'Quesadillas reci\u00E9n hechas servidas en mesa de restaurante'
      },
      {
        name: dishSeed.includes('ensalada') ? 'Ensaladas frescas' : 'Opciones saludables',
        description: 'Preparaciones ligeras para clientes que buscan una experiencia saludable y pr\u00E1ctica.',
        tag: 'Saludable',
        imageUrl: buildInlineSvgPlaceholder('Ensaladas frescas', 'Color, ligereza y propuesta saludable', '#10B981'),
        imagePrompt: 'Ensalada fresca colorida con ingredientes naturales'
      }
    ];

    return {
      businessName,
      businessTypeId,
      businessTypeLabel,
      pageGoal,
      primaryCta,
      secondaryCta,
      hero: {
        eyebrow: 'Restaurante saludable',
        title: `${businessName} con batidos, paninis y opciones frescas para volver hoy mismo`,
        subtitle: instructions,
        primaryCta,
        secondaryCta,
        imageUrl: heroPlaceholder,
        imagePrompt: 'Restaurante de comida saludable con batidos de fruta natural y ambiente luminoso'
      },
      benefits: {
        eyebrow: 'Por qu\u00E9 elegirnos',
        title: 'Una experiencia fresca, r\u00E1pida y f\u00E1cil de recomendar',
        subtitle: 'Destacamos los beneficios que mejor conectan con una visita, pedido o reserva.',
        items: [
          { title: 'Ingredientes frescos', description: 'Productos preparados con una propuesta ligera y visualmente atractiva.', icon: 'Leaf' },
          { title: 'Opciones para cada momento', description: 'Desde un snack r\u00E1pido hasta una comida completa con bebidas saludables.', icon: 'Sparkles' },
          { title: 'Atenci\u00F3n \u00E1gil', description: 'Proceso claro para pedir, consultar horarios o reservar sin fricci\u00F3n.', icon: 'Timer' }
        ]
      },
      featuredItems: {
        eyebrow: 'Men\u00FA destacado',
        title: 'Lo m\u00E1s pedido por quienes descubren el lugar',
        subtitle: 'Puedes editar nombres, descripciones y enfoque comercial antes de publicar.',
        items: dishItems
      },
      gallery: {
        eyebrow: 'Galer\u00EDa',
        title: 'Sabores, ambiente y detalles que invitan a volver',
        subtitle: 'Usa esta secci\u00F3n para mostrar producto real, preparaci\u00F3n y experiencia en local.',
        items: [
          {
            title: 'Batidos y bebidas',
            description: 'Presentaci\u00F3n colorida con frutas frescas y enfoque saludable.',
            category: 'Bebidas',
            imageUrl: buildInlineSvgPlaceholder('Batidos naturales', 'Color, frescura y barra saludable', '#F97316'),
            imagePrompt: 'Batidos de frutas naturales servidos en barra moderna'
          },
          {
            title: 'Paninis y cocina caliente',
            description: 'Preparaciones listas para mostrar variedad y practicidad.',
            category: 'Cocina',
            imageUrl: buildInlineSvgPlaceholder('Paninis artesanales', 'Cocina caliente y ambiente acogedor', '#F59E0B'),
            imagePrompt: 'Paninis artesanales reci\u00E9n preparados en restaurante luminoso'
          },
          {
            title: 'Ensaladas y opciones ligeras',
            description: 'Ideal para transmitir frescura y una propuesta balanceada.',
            category: 'Saludable',
            imageUrl: buildInlineSvgPlaceholder('Ensaladas frescas', 'Ingredientes naturales y propuesta ligera', '#10B981'),
            imagePrompt: 'Ensaladas frescas con ingredientes naturales y presentaci\u00F3n moderna'
          }
        ]
      },
      testimonials: {
        eyebrow: 'Clientes',
        title: 'Testimonios editables para reforzar confianza',
        subtitle: 'Revisa estos textos y sustit\u00FAyelos por testimonios reales antes de publicar.',
        items: [
          { author: 'Cliente frecuente', role: 'Visita semanal', text: 'Los batidos son frescos, el men\u00FA es claro y siempre encuentro algo ligero para pedir.', stars: 5 },
          { author: 'Pedido para oficina', role: 'Compra recurrente', text: 'La propuesta combina opciones saludables con rapidez en la atenci\u00F3n y buena presentaci\u00F3n.', stars: 5 },
          { author: 'Primera visita', role: 'Nuevo cliente', text: 'La experiencia fue simple, visualmente atractiva y f\u00E1cil de recomendar a otras personas.', stars: 4 }
        ]
      },
      faq: {
        eyebrow: 'FAQ',
        title: 'Preguntas frecuentes antes de hacer un pedido o visitar el local',
        subtitle: 'Aclara disponibilidad, horarios, pedidos y opciones especiales.',
        items: [
          { question: '\u00BFQu\u00E9 tipo de comida ofrecen?', answer: 'Puedes destacar aqu\u00ED batidos, paninis, quesadillas, ensaladas y cualquier otra especialidad real del negocio.' },
          { question: '\u00BFTienen opciones saludables o personalizables?', answer: 'Incluye aqu\u00ED restricciones alimentarias, extras disponibles o combinaciones que el cliente pueda solicitar.' },
          { question: '\u00BFPuedo pedir para llevar o reservar?', answer: 'Usa esta respuesta para indicar si trabajas con pedidos, consumo en sitio, delivery o reservas previas.' }
        ],
        ctaText: '\u00BFTienes una duda antes de pedir?',
        buttonText: 'Escr\u00EDbenos'
      },
      cta: {
        title: 'Convierte esta visita en una reserva, pedido o mensaje',
        subtitle: 'Cierra la p\u00E1gina con una acci\u00F3n concreta y f\u00E1cil de ejecutar.',
        primaryText: primaryCta,
        secondaryText: secondaryCta
      },
      contact: {
        title: 'Estamos listos para atenderte',
        subtitle: 'Completa aqu\u00ED ubicaci\u00F3n, horario, WhatsApp y correo real antes de publicar.',
        phone: '',
        whatsapp: '',
        email: '',
        address: '',
        hours: 'Lunes a domingo \u00B7 Horario editable',
        buttonText: primaryCta
      },
      menu: {
        logoText: businessName,
        links: [
          { label: 'Inicio', url: '#top' },
          { label: 'Beneficios', url: '#section-benefits' },
          { label: 'Men\u00FA', url: '#section-featured-menu' },
          { label: 'Galer\u00EDa', url: '#section-gallery' },
          { label: 'Contacto', url: '#section-contact' }
        ]
      },
      footer: {
        bio: `Presenta ${businessName} como una propuesta fresca, cercana y f\u00E1cil de elegir para ${businessTypeLabel.toLowerCase()}.`,
        copyright: `\u00A9 ${new Date().getFullYear()} ${businessName}. Todos los derechos reservados.`
      }
    };
  }

  const benefitsTitle = blueprint.id === 'retail_store_landing_v1'
    ? 'Compra con claridad, confianza y foco en lo que realmente importa'
    : 'Una propuesta clara para convertir visitas en conversaciones \u00FAtiles';

  const featuredTitle = blueprint.id === 'retail_store_landing_v1'
    ? 'Productos y categor\u00EDas que conviene destacar primero'
    : 'Servicios y entregables que conviene presentar primero';

  return {
    businessName,
    businessTypeId,
    businessTypeLabel,
    pageGoal,
    primaryCta,
    secondaryCta,
    hero: {
      eyebrow: businessTypeLabel,
      title: `${businessName}: una p\u00E1gina clara para ${pageGoal.toLowerCase()}`,
      subtitle: instructions,
      primaryCta,
      secondaryCta,
      imagePrompt: `${businessTypeLabel} profesional con presencia digital clara y confiable`
    },
    benefits: {
      eyebrow: 'Propuesta de valor',
      title: benefitsTitle,
      subtitle: 'Organiza aqu\u00ED los diferenciales principales del negocio con copy directo y editable.',
      items: [
        { title: 'Mensaje claro', description: 'Explica r\u00E1pido qu\u00E9 haces, para qui\u00E9n y por qu\u00E9 conviene avanzar.', icon: 'BadgeCheck' },
        { title: 'Confianza editable', description: 'Deja lista una estructura para casos, resultados o evidencia social.', icon: 'ShieldCheck' },
        { title: 'Siguiente paso simple', description: 'Conecta la visita con una consulta, cotizaci\u00F3n o compra sin fricci\u00F3n.', icon: 'ArrowRight' }
      ]
    },
    featuredItems: {
      eyebrow: blueprint.id === 'retail_store_landing_v1' ? 'Destacados' : 'Oferta principal',
      title: featuredTitle,
      subtitle: 'Puedes adaptar esta secci\u00F3n a l\u00EDneas de servicio, paquetes, categor\u00EDas o productos concretos.',
      items: [
        { name: 'Opci\u00F3n destacada 1', description: 'Descripci\u00F3n editable del primer servicio o producto principal.', tag: 'Principal' },
        { name: 'Opci\u00F3n destacada 2', description: 'Descripci\u00F3n editable del segundo servicio o producto destacado.', tag: 'Popular' },
        { name: 'Opci\u00F3n destacada 3', description: 'Descripci\u00F3n editable pensada para profundizar la propuesta.', tag: 'Flexible' }
      ]
    },
    gallery: {
      eyebrow: 'Galer\u00EDa',
      title: blueprint.id === 'retail_store_landing_v1' ? 'Visuales para apoyar la compra' : 'Visuales para apoyar la confianza',
      subtitle: 'Usa esta secci\u00F3n para mostrar productos, equipo, instalaciones o resultados reales.',
      items: [
        { title: 'Visual principal', description: 'Reemplaza este placeholder por material real del negocio.', category: 'Principal' },
        { title: 'Detalle \u00FAtil', description: 'Ideal para mostrar contexto, servicio o producto en uso.', category: 'Detalle' },
        { title: 'Contexto de marca', description: 'Refuerza el tipo de experiencia que ofreces.', category: 'Marca' }
      ]
    },
    testimonials: {
      eyebrow: 'Clientes',
      title: 'Testimonios editables para revisar antes de publicar',
      subtitle: 'Sustituye estos ejemplos por testimonios reales cuando los tengas.',
      items: [
        { author: 'Cliente 1', role: 'Caso real', text: 'La p\u00E1gina transmite con claridad el valor del negocio y facilita el siguiente paso.', stars: 5 },
        { author: 'Cliente 2', role: 'Recomendaci\u00F3n', text: 'La propuesta es f\u00E1cil de entender y el contacto se siente directo y profesional.', stars: 4 }
      ]
    },
    faq: {
      eyebrow: 'FAQ',
      title: 'Preguntas frecuentes para reducir fricci\u00F3n antes del contacto',
      subtitle: 'Explica aqu\u00ED procesos, tiempos, coberturas o condiciones importantes.',
      items: [
        { question: '\u00BFC\u00F3mo funciona el servicio o la compra?', answer: 'Describe aqu\u00ED el proceso real que seguir\u00E1 tu cliente desde el primer contacto.' },
        { question: '\u00BFQu\u00E9 incluye la propuesta?', answer: 'Aclara entregables, alcance o condiciones con lenguaje simple y directo.' },
        { question: '\u00BFC\u00F3mo puedo avanzar?', answer: 'Indica si el siguiente paso es cotizar, agendar, visitar o escribir por WhatsApp.' }
      ],
      ctaText: '\u00BFNecesitas una respuesta m\u00E1s espec\u00EDfica?',
      buttonText: 'Hablar con un asesor'
    },
    cta: {
      title: blueprint.id === 'retail_store_landing_v1'
        ? 'Lleva esta visita a una compra o consulta concreta'
        : 'Convierte esta visita en una conversaci\u00F3n real',
      subtitle: 'Cierra la p\u00E1gina con una acci\u00F3n principal y una alternativa secundaria editable.',
      primaryText: primaryCta,
      secondaryText: secondaryCta
    },
    contact: {
      title: 'Hablemos cuando lo necesites',
      subtitle: 'Completa aqu\u00ED datos reales de atenci\u00F3n, ubicaci\u00F3n o cobertura.',
      phone: '',
      whatsapp: '',
      email: '',
      address: '',
      buttonText: primaryCta
    },
    menu: {
      logoText: businessName,
      links: buildDefaultMenuLinks()
    },
    footer: {
      bio: `Presenta ${businessName} con una estructura editable alineada a ${businessTypeLabel.toLowerCase()}.`,
      copyright: `\u00A9 ${new Date().getFullYear()} ${businessName}. Todos los derechos reservados.`
    }
  };
};

export const validateGeneratedBusinessContent = (
  rawContent: unknown,
  brief: AIPageGenerationBrief,
  blueprint: BusinessPageBlueprint,
  warnings: string[] = []
): GeneratedBusinessContent => {
  const fallback = buildMinimalGeneratedBusinessContent(brief, blueprint, warnings);
  const { businessTypeId, businessTypeLabel } = resolveBusinessLabel(brief);

  if (!isRecord(rawContent)) {
    return fallback;
  }

  const heroRecord = isRecord(rawContent.hero) ? rawContent.hero : {};
  const benefitsRecord = isRecord(rawContent.benefits) ? rawContent.benefits : {};
  const featuredItemsRecord = isRecord(rawContent.featuredItems) ? rawContent.featuredItems : {};
  const galleryRecord = isRecord(rawContent.gallery) ? rawContent.gallery : {};
  const testimonialsRecord = isRecord(rawContent.testimonials) ? rawContent.testimonials : {};
  const faqRecord = isRecord(rawContent.faq) ? rawContent.faq : {};
  const ctaRecord = isRecord(rawContent.cta) ? rawContent.cta : {};
  const contactRecord = isRecord(rawContent.contact) ? rawContent.contact : {};
  const menuRecord = isRecord(rawContent.menu) ? rawContent.menu : {};
  const footerRecord = isRecord(rawContent.footer) ? rawContent.footer : {};

  const menuLinks = sanitizeItems(
    menuRecord.links,
    item => ({
      label: stripUnsafeText(item.label, 'Enlace'),
      url: toAbsoluteAnchor(stripUnsafeText(item.url, '#'))
    }),
    6
  );

  return {
    businessName: stripUnsafeText(rawContent.businessName, fallback.businessName),
    businessTypeId,
    businessTypeLabel,
    pageGoal: stripUnsafeText(rawContent.pageGoal, fallback.pageGoal),
    primaryCta: stripUnsafeText(rawContent.primaryCta, fallback.primaryCta),
    secondaryCta: stripUnsafeText(rawContent.secondaryCta, fallback.secondaryCta || ''),
    hero: {
      eyebrow: stripUnsafeText(heroRecord.eyebrow, fallback.hero.eyebrow),
      title: stripUnsafeText(heroRecord.title, fallback.hero.title),
      subtitle: stripUnsafeText(heroRecord.subtitle || heroRecord.description, fallback.hero.subtitle),
      primaryCta: stripUnsafeText(heroRecord.primaryCta || heroRecord.cta, fallback.hero.primaryCta),
      secondaryCta: stripUnsafeText(heroRecord.secondaryCta, fallback.hero.secondaryCta || ''),
      imageUrl: stripUnsafeText(heroRecord.imageUrl || heroRecord.image, fallback.hero.imageUrl || ''),
      imagePrompt: stripUnsafeText(heroRecord.imagePrompt, fallback.hero.imagePrompt || '')
    },
    benefits: {
      eyebrow: stripUnsafeText(benefitsRecord.eyebrow, fallback.benefits?.eyebrow || ''),
      title: stripUnsafeText(benefitsRecord.title, fallback.benefits?.title || ''),
      subtitle: stripUnsafeText(benefitsRecord.subtitle || benefitsRecord.description, fallback.benefits?.subtitle || ''),
      items: sanitizeFeatureItems(benefitsRecord.items, 'Beneficio').length > 0
        ? sanitizeFeatureItems(benefitsRecord.items, 'Beneficio')
        : (fallback.benefits?.items || [])
    },
    featuredItems: {
      eyebrow: stripUnsafeText(featuredItemsRecord.eyebrow, fallback.featuredItems?.eyebrow || ''),
      title: stripUnsafeText(featuredItemsRecord.title, fallback.featuredItems?.title || ''),
      subtitle: stripUnsafeText(featuredItemsRecord.subtitle || featuredItemsRecord.description, fallback.featuredItems?.subtitle || ''),
      items: sanitizeShowcaseItems(featuredItemsRecord.items, 'Elemento').length > 0
        ? sanitizeShowcaseItems(featuredItemsRecord.items, 'Elemento')
        : (fallback.featuredItems?.items || [])
    },
    gallery: {
      eyebrow: stripUnsafeText(galleryRecord.eyebrow, fallback.gallery?.eyebrow || ''),
      title: stripUnsafeText(galleryRecord.title, fallback.gallery?.title || ''),
      subtitle: stripUnsafeText(galleryRecord.subtitle || galleryRecord.description, fallback.gallery?.subtitle || ''),
      items: sanitizeGalleryItems(galleryRecord.items, 'Imagen').length > 0
        ? sanitizeGalleryItems(galleryRecord.items, 'Imagen')
        : (fallback.gallery?.items || [])
    },
    testimonials: {
      eyebrow: stripUnsafeText(testimonialsRecord.eyebrow, fallback.testimonials?.eyebrow || ''),
      title: stripUnsafeText(testimonialsRecord.title, fallback.testimonials?.title || ''),
      subtitle: stripUnsafeText(testimonialsRecord.subtitle || testimonialsRecord.description, fallback.testimonials?.subtitle || ''),
      items: sanitizeTestimonials(testimonialsRecord.items).length > 0
        ? sanitizeTestimonials(testimonialsRecord.items)
        : (fallback.testimonials?.items || [])
    },
    faq: {
      eyebrow: stripUnsafeText(faqRecord.eyebrow, fallback.faq?.eyebrow || ''),
      title: stripUnsafeText(faqRecord.title, fallback.faq?.title || ''),
      subtitle: stripUnsafeText(faqRecord.subtitle || faqRecord.description, fallback.faq?.subtitle || ''),
      items: sanitizeFaqItems(faqRecord.items).length > 0
        ? sanitizeFaqItems(faqRecord.items)
        : (fallback.faq?.items || []),
      ctaText: stripUnsafeText(faqRecord.ctaText, fallback.faq?.ctaText || ''),
      buttonText: stripUnsafeText(faqRecord.buttonText, fallback.faq?.buttonText || '')
    },
    cta: {
      title: stripUnsafeText(ctaRecord.title, fallback.cta?.title || ''),
      subtitle: stripUnsafeText(ctaRecord.subtitle || ctaRecord.description, fallback.cta?.subtitle || ''),
      primaryText: stripUnsafeText(ctaRecord.primaryText || ctaRecord.cta, fallback.cta?.primaryText || ''),
      secondaryText: stripUnsafeText(ctaRecord.secondaryText, fallback.cta?.secondaryText || '')
    },
    contact: {
      title: stripUnsafeText(contactRecord.title, fallback.contact?.title || ''),
      subtitle: stripUnsafeText(contactRecord.subtitle || contactRecord.description, fallback.contact?.subtitle || ''),
      phone: stripUnsafeText(contactRecord.phone, fallback.contact?.phone || ''),
      whatsapp: stripUnsafeText(contactRecord.whatsapp, fallback.contact?.whatsapp || ''),
      email: stripUnsafeText(contactRecord.email, fallback.contact?.email || ''),
      address: stripUnsafeText(contactRecord.address, fallback.contact?.address || ''),
      hours: stripUnsafeText(contactRecord.hours, fallback.contact?.hours || ''),
      buttonText: stripUnsafeText(contactRecord.buttonText || contactRecord.cta, fallback.contact?.buttonText || '')
    },
    menu: {
      logoText: stripUnsafeText(menuRecord.logoText, fallback.menu?.logoText || fallback.businessName),
      links: menuLinks.length > 0 ? menuLinks : (fallback.menu?.links || buildDefaultMenuLinks())
    },
    footer: {
      bio: stripUnsafeText(footerRecord.bio || footerRecord.description, fallback.footer?.bio || ''),
      copyright: stripUnsafeText(footerRecord.copyright, fallback.footer?.copyright || '')
    }
  };
};

const buildSectionContent = (
  blueprint: BusinessPageBlueprint,
  sectionId: string,
  content: GeneratedBusinessContent
) => {
  switch (sectionId) {
    case 'menu':
      return {
        logoText: content.menu?.logoText || content.businessName,
        links: content.menu?.links || buildDefaultMenuLinks()
      };
    case 'hero':
      return {
        eyebrow: content.hero.eyebrow,
        title: content.hero.title,
        description: content.hero.subtitle,
        cta: content.hero.primaryCta,
        secondaryCta: content.hero.secondaryCta,
        imageUrl: content.hero.imageUrl,
        imagePrompt: content.hero.imagePrompt
      };
    case 'benefits':
      return {
        eyebrow: content.benefits?.eyebrow || 'Beneficios',
        title: content.benefits?.title || 'Beneficios',
        description: content.benefits?.subtitle || '',
        featureItems: content.benefits?.items || []
      };
    case 'featured_menu':
      return {
        eyebrow: content.featuredItems?.eyebrow || 'Destacados',
        title: content.featuredItems?.title || 'Destacados',
        description: content.featuredItems?.subtitle || '',
        showcaseItems: content.featuredItems?.items || []
      };
    case 'process':
      return {
        eyebrow: content.featuredItems?.eyebrow || 'Proceso',
        title: content.featuredItems?.title || 'Proceso',
        description: content.featuredItems?.subtitle || '',
        processItems: content.featuredItems?.items || []
      };
    case 'gallery':
      return {
        eyebrow: content.gallery?.eyebrow || 'Galer\u00EDa',
        title: content.gallery?.title || 'Galer\u00EDa',
        description: content.gallery?.subtitle || '',
        galleryItems: content.gallery?.items || []
      };
    case 'testimonials':
      return {
        eyebrow: content.testimonials?.eyebrow || 'Testimonios',
        title: content.testimonials?.title || 'Testimonios',
        description: content.testimonials?.subtitle || '',
        testimonialItems: content.testimonials?.items || []
      };
    case 'faq':
      return {
        eyebrow: content.faq?.eyebrow || 'FAQ',
        title: content.faq?.title || 'Preguntas frecuentes',
        description: content.faq?.subtitle || '',
        faqItems: content.faq?.items || [],
        ctaText: content.faq?.ctaText,
        buttonText: content.faq?.buttonText
      };
    case 'cta':
      return {
        title: content.cta?.title || 'CTA',
        description: content.cta?.subtitle || '',
        cta: content.cta?.primaryText || content.primaryCta,
        secondaryCta: content.cta?.secondaryText || content.secondaryCta
      };
    case 'contact':
      return {
        title: content.contact?.title || 'Contacto',
        description: content.contact?.subtitle || '',
        phone: content.contact?.phone,
        whatsapp: content.contact?.whatsapp,
        email: content.contact?.email,
        address: content.contact?.address,
        hours: content.contact?.hours,
        cta: content.contact?.buttonText || content.primaryCta
      };
    case 'footer':
      return {
        title: blueprint.businessTypeLabel,
        description: content.footer?.bio || '',
        copyright: content.footer?.copyright
      };
    default:
      return {};
  }
};

export const buildPlanFromBlueprint = (
  brief: AIPageGenerationBrief,
  blueprint: BusinessPageBlueprint,
  content: GeneratedBusinessContent,
  options: {
    source: AIPagePlan['source'];
    generationMode: AIPagePlan['generationMode'];
    warnings?: string[];
    estimatedCredits?: number;
    usageSummary?: AIPagePlan['usageSummary'];
  }
): AIPagePlan => {
  const businessName = stripUnsafeText(content.businessName, brief.businessName || brief.businessType || blueprint.businessTypeLabel);
  const pageGoal = stripUnsafeText(content.pageGoal, brief.pageGoal);
  const sections: AIPagePlanSection[] = blueprint.modules.map((module, index) => ({
    id: sanitizeId(module.id, `ai-section-${index + 1}`),
    moduleType: module.moduleType,
    preset: null,
    title: module.summaryLabel,
    summaryLabel: module.summaryLabel,
    purpose: module.purpose,
    content: buildSectionContent(blueprint, module.id, content),
    settings: module.defaultSettings || {}
  }));

  return {
    pageTitle: `${businessName}: p\u00E1gina editable`,
    pageGoal,
    businessTypeId: content.businessTypeId,
    businessType: content.businessTypeLabel,
    businessTypeLabel: content.businessTypeLabel,
    blueprintId: blueprint.id,
    blueprintVersion: blueprint.version,
    contentContractVersion: 'generated_business_content_v1',
    tone: brief.tone,
    source: options.source,
    generationMode: options.generationMode,
    estimatedCredits: options.estimatedCredits ?? 0,
    usageSummary: options.usageSummary,
    warnings: options.warnings || [],
    sections
  };
};

const normalizeLegacyPlanSection = (
  rawSection: unknown,
  index: number,
  usedIds: Set<string>,
  warnings: string[],
  brief?: AIPageGenerationBrief,
  allowedModuleTypes: AllowedModuleTypeList = ALLOWED_AI_PAGE_MODULE_TYPES
): AIPagePlanSection | null => {
  if (!isRecord(rawSection)) {
    warnings.push(`Secci\u00F3n ${index + 1} descartada: formato inv\u00E1lido.`);
    return null;
  }

  const moduleType = normalizeModuleType(rawSection.moduleType, warnings, allowedModuleTypes);
  const preset = moduleType === 'composition_section'
    ? normalizePreset(rawSection.preset, warnings)
    : null;

  const fallbackId = `ai-section-${index + 1}`;
  let id = sanitizeId(rawSection.id, fallbackId);
  while (usedIds.has(id)) {
    id = `${id}-${usedIds.size + 1}`;
  }
  usedIds.add(id);

  const rawContent = isRecord(rawSection.content) ? rawSection.content : {};
  const title = stripUnsafeText(rawSection.title, AI_FIXED_MODULE_LABELS[moduleType] || `Secci\u00F3n ${index + 1}`);
  const description = stripUnsafeText(rawContent.description || rawSection.purpose, 'Contenido editable generado para la secci\u00F3n.');

  return {
    id,
    moduleType,
    preset,
    title,
    summaryLabel: stripUnsafeText(rawSection.summaryLabel, AI_FIXED_MODULE_LABELS[moduleType] || title),
    purpose: stripUnsafeText(rawSection.purpose, description),
    content: {
      ...rawContent,
      eyebrow: stripUnsafeText(rawContent.eyebrow, title),
      title: stripUnsafeText(rawContent.title, title),
      description,
      cta: stripUnsafeText(rawContent.cta, brief?.primaryCta || 'Solicitar informaci\u00F3n'),
      secondaryCta: stripUnsafeText(rawContent.secondaryCta, ''),
      items: sanitizeStringArray(rawContent.items, 8)
    },
    settings: isRecord(rawSection.settings) ? rawSection.settings : {}
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
  options: {
    fallbackWarnings?: string[];
    source?: AIPagePlan['source'];
    generationMode?: AIPagePlan['generationMode'];
    allowedModuleTypes?: AllowedModuleTypeList;
  } = {}
): AIPagePlan => {
  const blueprint = getAIBlueprintForBusinessType(brief.businessTypeId);
  const warnings = [...(options.fallbackWarnings || [])];
  const planRecord = extractJSONFromAIResponse(rawPlan);

  if (!isRecord(planRecord)) {
    return createLocalAIPagePlanFallback(brief, [...warnings, 'La respuesta IA no fue JSON v\u00E1lido. Se us\u00F3 una plantilla base.']);
  }

  const allowedModuleTypes = options.allowedModuleTypes || ALLOWED_AI_PAGE_MODULE_TYPES;
  const rawSections = Array.isArray(planRecord.sections) ? planRecord.sections : [];
  if (rawSections.length === 0) {
    return createLocalAIPagePlanFallback(brief, [...warnings, 'El plan IA no incluy\u00F3 secciones v\u00E1lidas. Se us\u00F3 una plantilla base.']);
  }

  const usedIds = new Set<string>();
  const normalizedSections = rawSections
    .slice(0, 12)
    .map((section, index) => normalizeLegacyPlanSection(section, index, usedIds, warnings, brief, allowedModuleTypes))
    .filter(Boolean) as AIPagePlanSection[];

  if (normalizedSections.length === 0) {
    return createLocalAIPagePlanFallback(brief, [...warnings, 'El plan IA no respet\u00F3 los m\u00F3dulos permitidos. Se us\u00F3 una plantilla base.']);
  }

  return {
    pageTitle: stripUnsafeText(planRecord.pageTitle, `${stripUnsafeText(brief.businessType, blueprint.businessTypeLabel)}: p\u00E1gina editable`),
    pageGoal: stripUnsafeText(planRecord.pageGoal, brief.pageGoal),
    businessTypeId: brief.businessTypeId,
    businessType: stripUnsafeText(planRecord.businessType, brief.businessType),
    businessTypeLabel: stripUnsafeText(planRecord.businessTypeLabel, brief.businessTypeLabel || brief.businessType),
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

export const createLocalAIPagePlanFallback = (brief: AIPageGenerationBrief, warnings: string[] = []) => {
  const blueprint = getAIBlueprintForBusinessType(brief.businessTypeId);
  const content = buildMinimalGeneratedBusinessContent(brief, blueprint, warnings);
  return buildPlanFromBlueprint(brief, blueprint, content, {
    source: 'fallback',
    generationMode: 'fallback',
    estimatedCredits: 0,
    warnings
  });
};
