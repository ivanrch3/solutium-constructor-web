import {
  CompositionElement,
  CompositionSectionSchema
} from '../../../types/compositionSchema';
import { validateCompositionSchema } from '../../../utils/compositionSchemaValidator';

export type CompositionPresetId =
  | 'hero_visual_premium'
  | 'saas_split_hero_visual'
  | 'features_bento'
  | 'product_screenshot_showcase'
  | 'faq_split_visual'
  | 'services_grid'
  | 'process_steps'
  | 'cta_premium'
  | 'comparison'
  | 'trust_logos';

export interface CompositionPresetDefinition {
  id: CompositionPresetId;
  label: string;
  description: string;
  schema: CompositionSectionSchema;
}

const root = (gridColumn: string, mobileGridColumn = '1') => ({
  desktop: { gridColumn },
  tablet: { gridColumn: gridColumn.replace('12', '8').replace('7 / span 6', '1 / span 8') },
  mobile: { gridColumn: mobileGridColumn }
});

const cardLayout = (gridColumn: string, minHeight = 240, padding = 24) => ({
  desktop: { gridColumn, minHeight, padding },
  tablet: { gridColumn: '1 / span 4', minHeight: Math.max(180, minHeight - 40), padding: Math.max(18, padding - 4) },
  mobile: { gridColumn: '1', minHeight: Math.max(160, minHeight - 70), padding: Math.max(16, padding - 6) }
});

const baseSection = (
  name: string,
  ariaLabel: string,
  align: CompositionSectionSchema['section']['align'] = 'left'
): Pick<CompositionSectionSchema, 'schemaVersion' | 'type' | 'name' | 'section' | 'layout' | 'background' | 'responsive'> => ({
  schemaVersion: 1,
  type: 'composition_section',
  name,
  section: {
    ariaLabel,
    maxWidth: '2xl',
    paddingY: 96,
    paddingX: 24,
    align,
    overflow: 'hidden'
  },
  layout: {
    mode: 'grid',
    columns: 12,
    gap: 24,
    verticalAlign: 'stretch',
    horizontalAlign: 'stretch'
  },
  background: {
    type: 'gradient',
    color: 'var(--color-background)',
    gradient: 'radial-gradient(circle at top right, color-mix(in srgb, var(--color-primary) 14%, transparent), transparent 42%)'
  },
  responsive: {
    tablet: { columns: 8, gap: 20, paddingY: 72, paddingX: 22 },
    mobile: { columns: 1, gap: 18, paddingY: 56, paddingX: 18 }
  }
});

const heroVisualPremium = (): CompositionSectionSchema => validateCompositionSchema({
  ...baseSection('Hero visual premium', 'Hero visual premium'),
  elements: [
    {
      id: 'hero_badge',
      type: 'badge',
      name: 'Cejilla',
      parentId: null,
      order: 1,
      content: { text: 'Nueva experiencia digital' },
      layout: root('1 / span 5'),
      style: {
        color: 'var(--color-primary)',
        background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
        radius: 999,
        fontWeight: 900,
        textTransform: 'uppercase'
      }
    },
    {
      id: 'hero_heading',
      type: 'heading',
      name: 'Título principal',
      parentId: null,
      order: 2,
      content: { level: 1, text: 'Convierte tu presencia digital en una experiencia memorable' },
      layout: root('1 / span 6'),
      style: { color: 'var(--color-foreground)', fontSize: 64, fontWeight: 900, lineHeight: 1.02 }
    },
    {
      id: 'hero_paragraph',
      type: 'paragraph',
      name: 'Descripción',
      parentId: null,
      order: 3,
      content: { text: 'Una sección flexible, editable y lista para comunicar valor con claridad desde el primer vistazo.' },
      layout: root('1 / span 5'),
      style: { color: 'var(--color-muted-foreground)', fontSize: 19, lineHeight: 1.7 }
    },
    {
      id: 'hero_primary_button',
      type: 'button',
      name: 'Botón principal',
      parentId: null,
      order: 4,
      content: { label: 'Empezar ahora', href: '#' },
      layout: root('1 / span 2'),
      style: { color: 'var(--color-primary-foreground)', background: 'var(--color-primary)', radius: 16, fontWeight: 900 },
      actions: [{ type: 'link', target: '#', label: 'Empezar ahora' }]
    },
    {
      id: 'hero_secondary_button',
      type: 'button',
      name: 'Botón secundario',
      parentId: null,
      order: 5,
      content: { label: 'Ver detalles', href: '#' },
      layout: root('3 / span 2'),
      style: {
        color: 'var(--color-foreground)',
        background: 'color-mix(in srgb, var(--color-card) 88%, transparent)',
        borderColor: 'color-mix(in srgb, var(--color-primary) 24%, transparent)',
        borderWidth: 1,
        radius: 16,
        fontWeight: 800
      },
      actions: [{ type: 'link', target: '#', label: 'Ver detalles' }]
    },
    {
      id: 'hero_visual_card',
      type: 'card',
      name: 'Mockup visual',
      parentId: null,
      order: 6,
      layout: {
        desktop: { gridColumn: '7 / span 6', gridRow: '1 / span 6', minHeight: 460, padding: 28 },
        tablet: { gridColumn: '1 / span 8', minHeight: 380, padding: 24 },
        mobile: { gridColumn: '1', minHeight: 320, padding: 20 }
      },
      style: {
        color: 'var(--color-primary-foreground)',
        background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 92%, white), color-mix(in srgb, var(--color-primary) 44%, black))',
        radius: 34,
        shadow: 'xl'
      }
    },
    {
      id: 'hero_visual_heading',
      type: 'heading',
      name: 'Título mockup',
      parentId: 'hero_visual_card',
      order: 1,
      content: { level: 3, text: 'Panel listo para adaptar' },
      style: { color: 'var(--color-primary-foreground)', fontSize: 30, fontWeight: 900, lineHeight: 1.1 }
    },
    {
      id: 'hero_visual_list',
      type: 'list',
      name: 'Puntos mockup',
      parentId: 'hero_visual_card',
      order: 2,
      content: {
        items: [
          { id: 'hero_visual_item_1', text: 'Estructura editable por elementos' },
          { id: 'hero_visual_item_2', text: 'Responsive por breakpoint' },
          { id: 'hero_visual_item_3', text: 'Publicado con renderer liviano' }
        ]
      },
      style: { color: 'color-mix(in srgb, var(--color-primary-foreground) 88%, transparent)', fontSize: 15, lineHeight: 1.7 }
    }
  ]
});

const featuresBento = (): CompositionSectionSchema => validateCompositionSchema({
  ...baseSection('Features Bento', 'Características destacadas'),
  elements: [
    {
      id: 'features_badge',
      type: 'badge',
      name: 'Cejilla',
      parentId: null,
      order: 1,
      content: { text: 'Funciones clave' },
      layout: root('1 / span 4'),
      style: { color: 'var(--color-primary)', background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', radius: 999, fontWeight: 900, textTransform: 'uppercase' }
    },
    {
      id: 'features_heading',
      type: 'heading',
      name: 'Título',
      parentId: null,
      order: 2,
      content: { level: 2, text: 'Todo lo importante, organizado en bloques visuales' },
      layout: root('1 / span 7'),
      style: { color: 'var(--color-foreground)', fontSize: 48, fontWeight: 900, lineHeight: 1.08 }
    },
    {
      id: 'features_paragraph',
      type: 'paragraph',
      name: 'Descripción',
      parentId: null,
      order: 3,
      content: { text: 'Combina tarjetas, listas y llamados a la acción en un grid irregular fácil de editar.' },
      layout: root('8 / span 5'),
      style: { color: 'var(--color-muted-foreground)', fontSize: 17, lineHeight: 1.7 }
    },
    {
      id: 'features_card_main',
      type: 'card',
      name: 'Card destacada',
      parentId: null,
      order: 4,
      layout: cardLayout('1 / span 6', 360, 28),
      style: { color: 'var(--color-primary-foreground)', background: 'linear-gradient(135deg, var(--color-primary), color-mix(in srgb, var(--color-primary) 54%, black))', radius: 30, shadow: 'xl' }
    },
    {
      id: 'features_card_main_title',
      type: 'heading',
      name: 'Título card destacada',
      parentId: 'features_card_main',
      order: 1,
      content: { level: 3, text: 'Experiencia adaptable' },
      style: { color: 'var(--color-primary-foreground)', fontSize: 30, fontWeight: 900, lineHeight: 1.15 }
    },
    {
      id: 'features_card_main_text',
      type: 'paragraph',
      name: 'Texto card destacada',
      parentId: 'features_card_main',
      order: 2,
      content: { text: 'Una composición base para narrativas visuales, páginas generadas y secciones premium.' },
      style: { color: 'color-mix(in srgb, var(--color-primary-foreground) 86%, transparent)', fontSize: 16, lineHeight: 1.7 }
    },
    ...[
      ['features_card_speed', 'Entrega rápida', 'Estructura lista para editar y publicar.'],
      ['features_card_control', 'Control granular', 'Selecciona, duplica, oculta o reordena elementos.'],
      ['features_card_mobile', 'Responsive estable', 'Grid desktop y stack móvil sin lógica pesada.'],
      ['features_card_theme', 'Tema integrado', 'Colores conectados a variables visuales del proyecto.']
    ].flatMap(([cardId, title, text], index) => [
      {
        id: cardId,
        type: 'card',
        name: title,
        parentId: null,
        order: 5 + index,
        layout: cardLayout(index < 2 ? '7 / span 3' : `${1 + (index - 2) * 3} / span 3`, 190, 22),
        style: { color: 'var(--color-foreground)', background: 'color-mix(in srgb, var(--color-card) 94%, transparent)', borderColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', borderWidth: 1, radius: 24, shadow: 'md' }
      },
      {
        id: `${cardId}_title`,
        type: 'heading',
        name: `Título ${title}`,
        parentId: cardId,
        order: 1,
        content: { level: 3, text: title },
        style: { color: 'var(--color-foreground)', fontSize: 22, fontWeight: 900, lineHeight: 1.15 }
      },
      {
        id: `${cardId}_text`,
        type: 'paragraph',
        name: `Texto ${title}`,
        parentId: cardId,
        order: 2,
        content: { text },
        style: { color: 'var(--color-muted-foreground)', fontSize: 15, lineHeight: 1.65 }
      }
    ])
  ]
});

const servicesGrid = (): CompositionSectionSchema => validateCompositionSchema({
  ...baseSection('Servicios', 'Servicios destacados'),
  elements: [
    {
      id: 'services_heading',
      type: 'heading',
      name: 'Título',
      parentId: null,
      order: 1,
      content: { level: 2, text: 'Servicios diseñados para avanzar con claridad' },
      layout: root('1 / span 7'),
      style: { color: 'var(--color-foreground)', fontSize: 48, fontWeight: 900, lineHeight: 1.08 }
    },
    {
      id: 'services_paragraph',
      type: 'paragraph',
      name: 'Descripción',
      parentId: null,
      order: 2,
      content: { text: 'Presenta tus líneas principales con tarjetas editables, textos breves y enlaces accionables.' },
      layout: root('1 / span 6'),
      style: { color: 'var(--color-muted-foreground)', fontSize: 17, lineHeight: 1.7 }
    },
    ...['Estrategia digital', 'Implementación', 'Optimización continua'].flatMap((title, index) => {
      const cardId = `services_card_${index + 1}`;
      return [
        {
          id: cardId,
          type: 'card',
          name: title,
          parentId: null,
          order: 3 + index,
          layout: cardLayout(`${1 + index * 4} / span 4`, 300, 26),
          style: { color: 'var(--color-foreground)', background: 'var(--color-card)', borderColor: 'color-mix(in srgb, var(--color-primary) 14%, transparent)', borderWidth: 1, radius: 28, shadow: 'lg' }
        },
        {
          id: `${cardId}_badge`,
          type: 'badge',
          name: `Número ${title}`,
          parentId: cardId,
          order: 1,
          content: { text: `0${index + 1}` },
          style: { color: 'var(--color-primary)', background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', radius: 999, fontWeight: 900 }
        },
        {
          id: `${cardId}_title`,
          type: 'heading',
          name: `Título ${title}`,
          parentId: cardId,
          order: 2,
          content: { level: 3, text: title },
          style: { color: 'var(--color-foreground)', fontSize: 25, fontWeight: 900, lineHeight: 1.15 }
        },
        {
          id: `${cardId}_text`,
          type: 'paragraph',
          name: `Texto ${title}`,
          parentId: cardId,
          order: 3,
          content: { text: 'Describe este servicio con una promesa concreta y fácil de entender.' },
          style: { color: 'var(--color-muted-foreground)', fontSize: 15, lineHeight: 1.7 }
        },
        {
          id: `${cardId}_button`,
          type: 'button',
          name: `Enlace ${title}`,
          parentId: cardId,
          order: 4,
          content: { label: 'Conocer más', href: '#' },
          style: { color: 'var(--color-primary)', background: 'transparent', fontWeight: 900, radius: 10 },
          actions: [{ type: 'link', target: '#', label: 'Conocer más' }]
        }
      ];
    })
  ]
});

const processSteps = (): CompositionSectionSchema => validateCompositionSchema({
  ...baseSection('Proceso en pasos', 'Proceso en pasos'),
  elements: [
    {
      id: 'process_heading',
      type: 'heading',
      name: 'Título',
      parentId: null,
      order: 1,
      content: { level: 2, text: 'Un proceso simple para pasar de idea a resultado' },
      layout: root('1 / span 7'),
      style: { color: 'var(--color-foreground)', fontSize: 48, fontWeight: 900, lineHeight: 1.08 }
    },
    {
      id: 'process_paragraph',
      type: 'paragraph',
      name: 'Descripción',
      parentId: null,
      order: 2,
      content: { text: 'Comunica la metodología con pasos claros, editables y visualmente consistentes.' },
      layout: root('1 / span 6'),
      style: { color: 'var(--color-muted-foreground)', fontSize: 17, lineHeight: 1.7 }
    },
    ...['Diagnóstico', 'Diseño', 'Implementación', 'Mejora'].flatMap((title, index) => {
      const cardId = `process_step_${index + 1}`;
      return [
        {
          id: cardId,
          type: 'card',
          name: title,
          parentId: null,
          order: 3 + index,
          layout: cardLayout(`${1 + index * 3} / span 3`, 260, 24),
          style: { color: 'var(--color-foreground)', background: 'color-mix(in srgb, var(--color-card) 94%, transparent)', borderColor: 'color-mix(in srgb, var(--color-primary) 16%, transparent)', borderWidth: 1, radius: 26, shadow: 'md' }
        },
        {
          id: `${cardId}_number`,
          type: 'badge',
          name: `Paso ${index + 1}`,
          parentId: cardId,
          order: 1,
          content: { text: `${index + 1}` },
          style: { color: 'var(--color-primary-foreground)', background: 'var(--color-primary)', radius: 999, fontWeight: 900 }
        },
        {
          id: `${cardId}_title`,
          type: 'heading',
          name: `Título ${title}`,
          parentId: cardId,
          order: 2,
          content: { level: 3, text: title },
          style: { color: 'var(--color-foreground)', fontSize: 23, fontWeight: 900, lineHeight: 1.15 }
        },
        {
          id: `${cardId}_text`,
          type: 'paragraph',
          name: `Descripción ${title}`,
          parentId: cardId,
          order: 3,
          content: { text: 'Texto breve para explicar qué ocurre en esta etapa.' },
          style: { color: 'var(--color-muted-foreground)', fontSize: 15, lineHeight: 1.65 }
        }
      ];
    })
  ]
});

const ctaPremium = (): CompositionSectionSchema => validateCompositionSchema({
  ...baseSection('CTA premium', 'Llamado a la acción premium', 'center'),
  background: {
    type: 'gradient',
    color: 'var(--color-primary)',
    gradient: 'linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 94%, white), color-mix(in srgb, var(--color-primary) 58%, black))'
  },
  elements: [
    {
      id: 'cta_badge',
      type: 'badge',
      name: 'Cejilla',
      parentId: null,
      order: 1,
      content: { text: 'Siguiente paso' },
      layout: root('4 / span 6'),
      style: { color: 'var(--color-primary-foreground)', background: 'color-mix(in srgb, var(--color-primary-foreground) 14%, transparent)', radius: 999, fontWeight: 900, textTransform: 'uppercase' }
    },
    {
      id: 'cta_heading',
      type: 'heading',
      name: 'Título',
      parentId: null,
      order: 2,
      content: { level: 2, text: 'Construye una sección lista para convertir' },
      layout: root('3 / span 8'),
      style: { color: 'var(--color-primary-foreground)', fontSize: 52, fontWeight: 900, lineHeight: 1.08 }
    },
    {
      id: 'cta_paragraph',
      type: 'paragraph',
      name: 'Descripción',
      parentId: null,
      order: 3,
      content: { text: 'Edita el mensaje, conecta el botón y publica una llamada a la acción consistente con tu marca.' },
      layout: root('4 / span 6'),
      style: { color: 'color-mix(in srgb, var(--color-primary-foreground) 84%, transparent)', fontSize: 18, lineHeight: 1.7 }
    },
    {
      id: 'cta_button',
      type: 'button',
      name: 'Botón principal',
      parentId: null,
      order: 4,
      content: { label: 'Solicitar propuesta', href: '#' },
      layout: root('5 / span 4'),
      style: { color: 'var(--color-primary)', background: 'var(--color-primary-foreground)', radius: 18, fontWeight: 900 },
      actions: [{ type: 'link', target: '#', label: 'Solicitar propuesta' }]
    }
  ]
});

const comparison = (): CompositionSectionSchema => validateCompositionSchema({
  ...baseSection('Comparativa', 'Comparativa antes y después'),
  elements: [
    {
      id: 'comparison_heading',
      type: 'heading',
      name: 'Título',
      parentId: null,
      order: 1,
      content: { level: 2, text: 'Compara el antes y el después de forma clara' },
      layout: root('1 / span 7'),
      style: { color: 'var(--color-foreground)', fontSize: 48, fontWeight: 900, lineHeight: 1.08 }
    },
    {
      id: 'comparison_paragraph',
      type: 'paragraph',
      name: 'Descripción',
      parentId: null,
      order: 2,
      content: { text: 'Ideal para explicar una transformación, una mejora de proceso o una propuesta de valor.' },
      layout: root('1 / span 6'),
      style: { color: 'var(--color-muted-foreground)', fontSize: 17, lineHeight: 1.7 }
    },
    ...[
      ['comparison_before', 'Sin Solutium', ['Procesos dispersos', 'Seguimiento manual', 'Poca visibilidad']],
      ['comparison_after', 'Con Solutium', ['Flujos conectados', 'Datos accionables', 'Experiencia consistente']]
    ].flatMap(([cardId, title, items], index) => [
      {
        id: cardId as string,
        type: 'card',
        name: title as string,
        parentId: null,
        order: 3 + index,
        layout: cardLayout(index === 0 ? '1 / span 6' : '7 / span 6', 340, 28),
        style: {
          color: 'var(--color-foreground)',
          background: index === 0 ? 'color-mix(in srgb, var(--color-muted) 64%, var(--color-card))' : 'color-mix(in srgb, var(--color-primary) 10%, var(--color-card))',
          borderColor: 'color-mix(in srgb, var(--color-primary) 18%, transparent)',
          borderWidth: 1,
          radius: 30,
          shadow: 'lg'
        }
      },
      {
        id: `${cardId}_title`,
        type: 'heading',
        name: `Título ${title}`,
        parentId: cardId as string,
        order: 1,
        content: { level: 3, text: title as string },
        style: { color: 'var(--color-foreground)', fontSize: 28, fontWeight: 900, lineHeight: 1.15 }
      },
      {
        id: `${cardId}_list`,
        type: 'list',
        name: `Lista ${title}`,
        parentId: cardId as string,
        order: 2,
        content: {
          items: (items as string[]).map((text, itemIndex) => ({ id: `${cardId}_item_${itemIndex + 1}`, text }))
        },
        style: { color: 'var(--color-muted-foreground)', fontSize: 16, lineHeight: 1.8 }
      }
    ])
  ]
});

const trustLogos = (): CompositionSectionSchema => validateCompositionSchema({
  ...baseSection('Confianza / logos', 'Bloque de confianza y logos', 'center'),
  elements: [
    {
      id: 'trust_heading',
      type: 'heading',
      name: 'Título',
      parentId: null,
      order: 1,
      content: { level: 2, text: 'Una base confiable para crecer' },
      layout: root('3 / span 8'),
      style: { color: 'var(--color-foreground)', fontSize: 42, fontWeight: 900, lineHeight: 1.1 }
    },
    {
      id: 'trust_paragraph',
      type: 'paragraph',
      name: 'Descripción',
      parentId: null,
      order: 2,
      content: { text: 'Usa estos espacios como placeholders editables para clientes, métricas o señales de confianza.' },
      layout: root('4 / span 6'),
      style: { color: 'var(--color-muted-foreground)', fontSize: 16, lineHeight: 1.7 }
    },
    ...['Logo editable', 'Cliente ideal', 'Aliado clave', 'Caso destacado', 'Comunidad'].map((label, index) => ({
      id: `trust_logo_${index + 1}`,
      type: 'card',
      name: label,
      parentId: null,
      order: 3 + index,
      layout: cardLayout(`${1 + (index % 5) * 2} / span 2`, 130, 18),
      style: { color: 'var(--color-muted-foreground)', background: 'var(--color-card)', borderColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', borderWidth: 1, radius: 22, shadow: 'sm' }
    } as CompositionElement)),
    ...['Logo editable', 'Cliente ideal', 'Aliado clave', 'Caso destacado', 'Comunidad'].map((label, index) => ({
      id: `trust_logo_${index + 1}_text`,
      type: 'paragraph',
      name: `Texto ${label}`,
      parentId: `trust_logo_${index + 1}`,
      order: 1,
      content: { text: label },
      style: { color: 'var(--color-muted-foreground)', fontSize: 14, fontWeight: 800, lineHeight: 1.4 }
    } as CompositionElement))
  ]
});

const saasSplitHeroVisual = (): CompositionSectionSchema => validateCompositionSchema({
  ...baseSection('SaaS split hero visual', 'Hero SaaS con bloque visual'),
  background: {
    type: 'solid',
    color: 'var(--color-background)'
  },
  elements: [
    {
      id: 'saas_hero_badge',
      type: 'badge',
      name: 'Cejilla SaaS',
      parentId: null,
      order: 1,
      content: { text: 'Solucion conectada' },
      layout: root('1 / span 5'),
      style: { color: 'var(--color-primary)', background: 'color-mix(in srgb, var(--color-primary) 10%, white)', radius: 999, fontWeight: 900, textTransform: 'uppercase' }
    },
    {
      id: 'saas_hero_heading',
      type: 'heading',
      name: 'Titulo hero SaaS',
      parentId: null,
      order: 2,
      content: { level: 1, text: 'Gestiona conversaciones y oportunidades desde un solo lugar' },
      layout: root('1 / span 6'),
      style: { color: 'var(--color-foreground)', fontSize: 62, fontWeight: 900, lineHeight: 1.02 }
    },
    {
      id: 'saas_hero_text',
      type: 'paragraph',
      name: 'Texto hero SaaS',
      parentId: null,
      order: 3,
      content: { text: 'Una pagina inspirada en estructuras SaaS: mensaje claro, CTA doble y una visualizacion editable del producto.' },
      layout: root('1 / span 5'),
      style: { color: 'var(--color-muted-foreground)', fontSize: 18, lineHeight: 1.72 }
    },
    {
      id: 'saas_hero_primary',
      type: 'button',
      name: 'CTA principal',
      parentId: null,
      order: 4,
      content: { label: 'Probar ahora', href: '#' },
      layout: root('1 / span 2'),
      style: { color: 'var(--color-primary-foreground)', background: 'var(--color-primary)', radius: 999, fontWeight: 900 },
      actions: [{ type: 'link', target: '#', label: 'Probar ahora' }]
    },
    {
      id: 'saas_hero_secondary',
      type: 'button',
      name: 'CTA secundario',
      parentId: null,
      order: 5,
      content: { label: 'Ver demo', href: '#' },
      layout: root('3 / span 2'),
      style: { color: 'var(--color-foreground)', background: 'var(--color-card)', borderColor: 'color-mix(in srgb, var(--color-primary) 18%, transparent)', borderWidth: 1, radius: 999, fontWeight: 900 },
      actions: [{ type: 'link', target: '#', label: 'Ver demo' }]
    },
    {
      id: 'saas_hero_visual',
      type: 'card',
      name: 'Ilustracion producto',
      parentId: null,
      order: 6,
      layout: {
        desktop: { gridColumn: '7 / span 6', gridRow: '1 / span 6', minHeight: 460, padding: 24 },
        tablet: { gridColumn: '1 / span 8', minHeight: 380, padding: 22 },
        mobile: { gridColumn: '1', minHeight: 320, padding: 18 }
      },
      style: { color: 'var(--color-foreground)', background: 'linear-gradient(145deg, #f3efff, #ffffff 54%, #ede7ff)', borderColor: '#ded3ff', borderWidth: 1, radius: 36, shadow: 'xl' }
    },
    ...['Conversaciones', 'Pipeline', 'Automatizacion'].flatMap((title, index) => [
      {
        id: `saas_hero_panel_${index + 1}`,
        type: 'card',
        name: title,
        parentId: 'saas_hero_visual',
        order: index + 1,
        style: { color: 'var(--color-foreground)', background: 'rgba(255,255,255,0.88)', borderColor: '#e7ddff', borderWidth: 1, radius: 22, shadow: 'md' }
      },
      {
        id: `saas_hero_panel_${index + 1}_text`,
        type: 'paragraph',
        name: `Texto ${title}`,
        parentId: `saas_hero_panel_${index + 1}`,
        order: 1,
        content: { text: title },
        style: { color: 'var(--color-foreground)', fontSize: 15, fontWeight: 900, lineHeight: 1.4 }
      }
    ] as CompositionElement[])
  ]
});

const productScreenshotShowcase = (): CompositionSectionSchema => validateCompositionSchema({
  ...baseSection('Product screenshot showcase', 'Showcase de producto'),
  background: { type: 'solid', color: 'color-mix(in srgb, var(--color-primary) 5%, var(--color-background))' },
  elements: [
    {
      id: 'product_showcase_heading',
      type: 'heading',
      name: 'Titulo showcase',
      parentId: null,
      order: 1,
      content: { level: 2, text: 'Visualiza el flujo completo antes de dar el siguiente paso' },
      layout: root('1 / span 7'),
      style: { color: 'var(--color-foreground)', fontSize: 48, fontWeight: 900, lineHeight: 1.08 }
    },
    {
      id: 'product_showcase_text',
      type: 'paragraph',
      name: 'Texto showcase',
      parentId: null,
      order: 2,
      content: { text: 'Usa esta seccion para representar capturas, tableros o estados de producto con placeholders editables.' },
      layout: root('8 / span 5'),
      style: { color: 'var(--color-muted-foreground)', fontSize: 17, lineHeight: 1.7 }
    },
    {
      id: 'product_showcase_screen',
      type: 'card',
      name: 'Pantalla principal',
      parentId: null,
      order: 3,
      layout: cardLayout('1 / span 8', 430, 24),
      style: { color: 'var(--color-foreground)', background: 'var(--color-card)', borderColor: 'color-mix(in srgb, var(--color-primary) 18%, transparent)', borderWidth: 1, radius: 34, shadow: 'xl' }
    },
    {
      id: 'product_showcase_header',
      type: 'badge',
      name: 'Barra superior',
      parentId: 'product_showcase_screen',
      order: 1,
      content: { text: 'Dashboard editable' },
      style: { color: 'var(--color-primary)', background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', radius: 999, fontWeight: 900 }
    },
    {
      id: 'product_showcase_list',
      type: 'list',
      name: 'Datos dashboard',
      parentId: 'product_showcase_screen',
      order: 2,
      content: { items: [
        { id: 'product_showcase_item_1', text: 'Nuevo lead recibido' },
        { id: 'product_showcase_item_2', text: 'Seguimiento automatizado' },
        { id: 'product_showcase_item_3', text: 'Conversion lista para revisar' }
      ] },
      style: { color: 'var(--color-muted-foreground)', fontSize: 16, lineHeight: 1.9 }
    },
    ...['Vista de equipo', 'Metrica clave', 'Accion siguiente'].flatMap((title, index) => [
      {
        id: `product_showcase_side_${index + 1}`,
        type: 'card',
        name: title,
        parentId: null,
        order: 4 + index,
        layout: cardLayout('9 / span 4', 130, 20),
        style: { color: 'var(--color-foreground)', background: 'var(--color-card)', borderColor: 'color-mix(in srgb, var(--color-primary) 14%, transparent)', borderWidth: 1, radius: 24, shadow: 'md' }
      },
      {
        id: `product_showcase_side_${index + 1}_text`,
        type: 'paragraph',
        name: `Texto ${title}`,
        parentId: `product_showcase_side_${index + 1}`,
        order: 1,
        content: { text: title },
        style: { color: 'var(--color-foreground)', fontSize: 15, fontWeight: 900, lineHeight: 1.5 }
      }
    ] as CompositionElement[])
  ]
});

const faqSplitVisual = (): CompositionSectionSchema => validateCompositionSchema({
  ...baseSection('FAQ split visual', 'Ayuda y preguntas frecuentes'),
  elements: [
    {
      id: 'faq_visual_card',
      type: 'card',
      name: 'Bloque visual ayuda',
      parentId: null,
      order: 1,
      layout: cardLayout('1 / span 5', 420, 28),
      style: { color: 'var(--color-foreground)', background: 'linear-gradient(145deg, #f5f0ff, #ffffff)', borderColor: '#e5dcff', borderWidth: 1, radius: 34, shadow: 'lg' }
    },
    {
      id: 'faq_visual_heading',
      type: 'heading',
      name: 'Titulo visual',
      parentId: 'faq_visual_card',
      order: 1,
      content: { level: 3, text: 'Soporte para avanzar con claridad' },
      style: { color: 'var(--color-foreground)', fontSize: 28, fontWeight: 900, lineHeight: 1.15 }
    },
    {
      id: 'faq_visual_text',
      type: 'paragraph',
      name: 'Texto visual',
      parentId: 'faq_visual_card',
      order: 2,
      content: { text: 'Un espacio editable para explicar ayuda, acompanamiento o siguientes pasos.' },
      style: { color: 'var(--color-muted-foreground)', fontSize: 16, lineHeight: 1.7 }
    },
    {
      id: 'faq_heading',
      type: 'heading',
      name: 'Titulo FAQ',
      parentId: null,
      order: 2,
      content: { level: 2, text: 'Preguntas frecuentes antes de empezar' },
      layout: root('7 / span 6'),
      style: { color: 'var(--color-foreground)', fontSize: 46, fontWeight: 900, lineHeight: 1.08 }
    },
    {
      id: 'faq_text',
      type: 'paragraph',
      name: 'Intro FAQ',
      parentId: null,
      order: 3,
      content: { text: 'Responde dudas clave con bloques simples y editables, sin depender de contenido externo.' },
      layout: root('7 / span 5'),
      style: { color: 'var(--color-muted-foreground)', fontSize: 17, lineHeight: 1.7 }
    },
    ...['Como funciona', 'Que incluye', 'Como empiezo'].flatMap((title, index) => [
      {
        id: `faq_item_${index + 1}`,
        type: 'card',
        name: title,
        parentId: null,
        order: 4 + index,
        layout: cardLayout('7 / span 6', 118, 20),
        style: { color: 'var(--color-foreground)', background: 'var(--color-card)', borderColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', borderWidth: 1, radius: 22, shadow: 'sm' }
      },
      {
        id: `faq_item_${index + 1}_text`,
        type: 'paragraph',
        name: `Pregunta ${title}`,
        parentId: `faq_item_${index + 1}`,
        order: 1,
        content: { text: `${title}: respuesta breve editable para orientar al visitante.` },
        style: { color: 'var(--color-foreground)', fontSize: 15, fontWeight: 800, lineHeight: 1.55 }
      }
    ] as CompositionElement[])
  ]
});

export const COMPOSITION_PRESETS: CompositionPresetDefinition[] = [
  {
    id: 'hero_visual_premium',
    label: 'Hero visual premium',
    description: 'Hero de alto impacto con CTA doble y tarjeta visual.',
    schema: heroVisualPremium()
  },
  {
    id: 'saas_split_hero_visual',
    label: 'SaaS split hero visual',
    description: 'Hero blanco con CTA doble y visual tipo producto/CRM.',
    schema: saasSplitHeroVisual()
  },
  {
    id: 'features_bento',
    label: 'Features Bento',
    description: 'Grid irregular de características con una card destacada.',
    schema: featuresBento()
  },
  {
    id: 'product_screenshot_showcase',
    label: 'Showcase de producto',
    description: 'Bloque visual tipo dashboard/captura con cards laterales.',
    schema: productScreenshotShowcase()
  },
  {
    id: 'faq_split_visual',
    label: 'FAQ visual dividido',
    description: 'Seccion de ayuda/FAQ con bloque visual y preguntas.',
    schema: faqSplitVisual()
  },
  {
    id: 'services_grid',
    label: 'Servicios',
    description: 'Tres cards de servicios con títulos, texto y enlace.',
    schema: servicesGrid()
  },
  {
    id: 'process_steps',
    label: 'Proceso en pasos',
    description: 'Timeline visual en cards numeradas.',
    schema: processSteps()
  },
  {
    id: 'cta_premium',
    label: 'CTA premium',
    description: 'Bloque centrado de conversión con fondo destacado.',
    schema: ctaPremium()
  },
  {
    id: 'comparison',
    label: 'Comparativa',
    description: 'Dos columnas para antes/después o sin/con.',
    schema: comparison()
  },
  {
    id: 'trust_logos',
    label: 'Confianza / logos',
    description: 'Grid de placeholders editables para confianza.',
    schema: trustLogos()
  }
];

export const getCompositionPreset = (presetId: CompositionPresetId) =>
  COMPOSITION_PRESETS.find((preset) => preset.id === presetId) || COMPOSITION_PRESETS[0];

const createPresetInstanceSuffix = () =>
  `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const cloneCompositionPresetSchema = (
  presetId: CompositionPresetId,
  suffix = createPresetInstanceSuffix()
): CompositionSectionSchema => {
  const preset = getCompositionPreset(presetId);
  const idMap = new Map<string, string>();

  preset.schema.elements.forEach((element) => {
    idMap.set(element.id, `${element.id}_${suffix}`);
  });

  const elements = preset.schema.elements.map((element) => ({
    ...element,
    id: idMap.get(element.id) || element.id,
    parentId: element.parentId ? idMap.get(element.parentId) || null : null,
    content: element.content?.items
      ? {
          ...element.content,
          items: element.content.items.map((item) => ({
            ...item,
            id: `${item.id}_${suffix}`
          }))
        }
      : element.content
  }));

  return validateCompositionSchema({
    ...preset.schema,
    elements
  });
};

export const createCompositionPresetSchema = (presetId: CompositionPresetId) =>
  cloneCompositionPresetSchema(presetId);
