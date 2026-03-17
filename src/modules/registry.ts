import React from 'react';
import { 
  Type, 
  Layout, 
  Image as ImageIcon, 
  Type as TypeIcon, 
  List, 
  CheckCircle, 
  Users, 
  HelpCircle, 
  Mail, 
  Smartphone,
  CreditCard,
  MessageSquare,
  Star,
  Package,
  ShieldCheck,
  PlayCircle,
  ArrowRightCircle,
  MoveVertical,
  Menu,
  Megaphone,
  Briefcase,
  Layers,
  Info,
  MapPin,
  Video,
  PanelTop,
  PanelBottom,
  LayoutTemplate
} from 'lucide-react';

export interface FieldSchema {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'color' | 'image' | 'boolean' | 'select' | 'array' | 'object' | 'range' | 'toggle-group';
  options?: { label: string; value: string; icon?: any; preview?: React.ReactNode }[]; // For select and toggle-group
  itemSchema?: FieldSchema[]; // For array and object
  category?: 'content' | 'design'; // For tabs
  min?: number; // For range
  max?: number; // For range
  step?: number; // For range
}

import { TYPOGRAPHY_PROPS, DESIGN_PROPS, BUTTON_GROUP_PROPS } from './shared-schemas';

export interface ModuleDefinition {
  id: string;
  label: string;
  icon: any;
  description: string;
  defaultData: any;
  category: 'navigation' | 'main-content' | 'social-proof' | 'sales' | 'contact';
  schema: FieldSchema[];
}

export const MODULE_REGISTRY: ModuleDefinition[] = [
  {
    id: 'top-bar',
    label: 'Barra superior',
    icon: PanelTop,
    description: 'Barra delgada para contacto rápido y redes sociales',
    category: 'navigation',
    defaultData: {
      message: '¡Bienvenidos a nuestro sitio web!',
      message_style: { align: 'center', size: 'small', weight: '600' },
      icon: 'Megaphone',
      link: { text: 'Comprar ahora', url: '#', target: '_self' },
      show_social: true,
      theme: 'dark',
      smart_mode: true,
      background_color: '',
      text_color: '',
      padding: 'normal',
      is_sticky: false,
      is_dismissible: true,
      visibility: 'all'
    },
    schema: [
      { name: 'message', label: 'Mensaje Principal', type: 'text', category: 'content' },
      ...TYPOGRAPHY_PROPS('message', 'Estilo del Mensaje'),
      { 
        name: 'advanced_mode', 
        label: 'Modo Avanzado', 
        type: 'select', 
        category: 'content',
        options: [
          { label: 'Estático (Normal)', value: 'none' },
          { label: 'Carrusel de Mensajes', value: 'carousel' },
          { label: 'Cuenta Regresiva (Timer)', value: 'timer' }
        ]
      },
      {
        name: 'carousel',
        label: 'Mensajes del Carrusel',
        type: 'array',
        category: 'content',
        itemSchema: [{ name: 'text', label: 'Texto', type: 'text' }]
      },
      {
        name: 'timer',
        label: 'Configuración del Timer',
        type: 'object',
        category: 'content',
        itemSchema: [
          { name: 'days', label: 'Días', type: 'range', min: 0, max: 30, step: 1 },
          { name: 'hours', label: 'Horas', type: 'range', min: 0, max: 23, step: 1 },
          { name: 'minutes', label: 'Minutos', type: 'range', min: 0, max: 59, step: 1 }
        ]
      },
      { 
        name: 'icon', 
        label: 'Icono Acompañante', 
        type: 'select', 
        category: 'content',
        options: [
          { label: 'Ninguno', value: 'none' },
          { label: 'Anuncio (Megáfono)', value: 'Megaphone' },
          { label: 'Oferta (Rayo)', value: 'Zap' },
          { label: 'Regalo (Caja)', value: 'Gift' },
          { label: 'Envío (Camión)', value: 'Truck' },
          { label: 'Estrella', value: 'Star' }
        ]
      },
      BUTTON_GROUP_PROPS('link', 'Botón de Acción (Opcional)'),
      { name: 'background_color', label: 'Color de Fondo', type: 'color', category: 'design' },
      { name: 'text_color', label: 'Color de Texto / Iconos', type: 'color', category: 'design' },
      { 
        name: 'padding', 
        label: 'Grosor (Padding)', 
        type: 'select', 
        category: 'design',
        options: [
          { label: 'Delgado', value: 'thin' },
          { label: 'Normal', value: 'normal' },
          { label: 'Grueso', value: 'thick' }
        ]
      },
      { 
        name: 'shape', 
        label: 'Forma de la Barra', 
        type: 'select', 
        category: 'design',
        options: [
          { label: 'Rectangular (Full)', value: 'square' },
          { label: 'Redondeada Abajo', value: 'bottom-rounded' },
          { label: 'Píldora Flotante', value: 'pill' }
        ]
      },
      { name: 'is_sticky', label: 'Fijar al hacer scroll (Sticky)', type: 'boolean', category: 'design' },
      { name: 'is_dismissible', label: 'Permitir cerrar ("X")', type: 'boolean', category: 'design' },
      { 
        name: 'smart_mode', 
        label: 'Modo Inteligente', 
        type: 'boolean', 
        category: 'design' 
      },
      { 
        name: 'visibility', 
        label: 'Visibilidad por Dispositivo', 
        type: 'select', 
        category: 'design',
        options: [
          { label: 'Todos los dispositivos', value: 'all' },
          { label: 'Solo Escritorio', value: 'desktop' },
          { label: 'Solo Móvil', value: 'mobile' }
        ]
      },
      { name: 'show_social', label: 'Mostrar Redes Sociales', type: 'boolean', category: 'content' },
      { name: 'email', label: 'Correo (Opcional)', type: 'text', category: 'content' },
      { name: 'phone', label: 'Teléfono (Opcional)', type: 'text', category: 'content' }
    ]
  },
  {
    id: 'header',
    label: 'Menú',
    icon: Menu,
    description: 'Menú principal con logo, enlaces y botón CTA',
    category: 'navigation',
    defaultData: {
      logo_text: 'SOLUTIUM',
      logo_text_style: { size: 'span', weight: '900', align: 'left' },
      layout: 'logo-left',
      scroll_mode: 'static',
      bg_type: 'glass',
      hover_effect: 'underline',
      height: 80,
      show_progress_bar: false,
      show_active_indicator: true,
      menu_items: [
        { label: 'Inicio', link: '#' },
        { label: 'Servicios', link: '#features' },
        { label: 'Contacto', link: '#contact' }
      ],
      show_cta: true,
      cta_text: 'Empezar',
      show_secondary_cta: false,
      secondary_cta_text: 'Saber más',
      show_search: false,
      show_language: false,
      show_socials: false,
      theme: 'light',
      smart_mode: true
    },
    schema: [
      { name: 'logo_text', label: 'Texto del Logo', type: 'text' },
      ...TYPOGRAPHY_PROPS('logo_text', 'Estilo del Logo'),
      { name: 'logo_image', label: 'Imagen del Logo', type: 'image' },
      { 
        name: 'smart_mode', 
        label: 'Modo Inteligente', 
        type: 'boolean' 
      },
      { 
        name: 'theme', 
        label: 'Tema', 
        type: 'select',
        options: [
          { label: 'Claro', value: 'light' },
          { label: 'Oscuro', value: 'dark' }
        ]
      },
      { 
        name: 'layout', 
        label: 'Disposición', 
        type: 'select',
        options: [
          { label: 'Logo Izquierda', value: 'logo-left' },
          { label: 'Logo Centro', value: 'logo-center' },
          { label: 'Logo Derecha', value: 'logo-right' }
        ]
      },
      { 
        name: 'scroll_mode', 
        label: 'Modo de Scroll', 
        type: 'select',
        options: [
          { label: 'Estático', value: 'static' },
          { label: 'Fijo (Sticky)', value: 'sticky' },
          { label: 'Inteligente', value: 'smart-hide' }
        ]
      },
      { 
        name: 'bg_type', 
        label: 'Tipo de Fondo', 
        type: 'select',
        options: [
          { label: 'Sólido', value: 'solid' },
          { label: 'Transparente Inteligente', value: 'transparent' },
          { label: 'Cristal (Glass)', value: 'glass' }
        ]
      },
      { 
        name: 'hover_effect', 
        label: 'Efecto Hover', 
        type: 'select',
        options: [
          { label: 'Línea', value: 'underline' },
          { label: 'Cápsula', value: 'capsule' },
          { label: 'Solo Color', value: 'color' }
        ]
      },
      { name: 'height', label: 'Altura (px)', type: 'range', min: 60, max: 120, step: 1 },
      { name: 'show_progress_bar', label: 'Barra de Progreso', type: 'boolean' },
      { name: 'show_active_indicator', label: 'Indicador Activo', type: 'boolean' },
      { 
        name: 'menu_items', 
        label: 'Enlaces del Menú', 
        type: 'array',
        itemSchema: [
          { name: 'label', label: 'Etiqueta', type: 'text' },
          { name: 'link', label: 'Enlace', type: 'text' }
        ]
      },
      { name: 'show_cta', label: 'Mostrar Botón Primario', type: 'boolean' },
      { name: 'cta_text', label: 'Texto Botón Primario', type: 'text' },
      { name: 'show_secondary_cta', label: 'Mostrar Botón Secundario', type: 'boolean' },
      { name: 'secondary_cta_text', label: 'Texto Botón Secundario', type: 'text' },
      { name: 'show_search', label: 'Mostrar Buscador', type: 'boolean' },
      { name: 'show_language', label: 'Mostrar Idioma', type: 'boolean' },
      { name: 'show_socials', label: 'Mostrar Redes Sociales', type: 'boolean' }
    ]
  },
  {
    id: 'hero',
    label: 'Portada',
    icon: Megaphone,
    description: 'Sección principal con título impactante y CTA',
    category: 'main-content',
    defaultData: {
      title: 'Construye el *Futuro* de tu Negocio',
      subtitle: 'La plataforma todo-en-uno para gestionar, vender y crecer con Solutium.',
      primary_button: { text: 'Empezar ahora', url: '#', target: '_self' },
      secondary_button: { text: 'Ver Demo', url: '#', target: '_self' },
      layout: 'layout-1',
      theme: 'dark',
      smart_mode: true,
      background: { overlay_opacity: 0.7 },
      title_style: { size: 'h1', weight: '900', align: 'center', highlight_type: 'gradient' },
      subtitle_style: { size: 'p', weight: '400', align: 'center', highlight_type: 'none' }
    },
    schema: [
      // Content Tab
      { name: 'title', label: 'Título Principal', type: 'text', category: 'content' },
      { name: 'subtitle', label: 'Subtítulo', type: 'textarea', category: 'content' },
      BUTTON_GROUP_PROPS('primary_button', 'Botón Primario'),
      BUTTON_GROUP_PROPS('secondary_button', 'Botón Secundario'),
      
      // Design Tab
      ...DESIGN_PROPS.map(p => ({ ...p, category: 'design' as const })),
      ...TYPOGRAPHY_PROPS('title', 'Título').map(p => ({ ...p, category: 'design' as const })),
      ...TYPOGRAPHY_PROPS('subtitle', 'Subtítulo').map(p => ({ ...p, category: 'design' as const }))
    ]
  },
  {
    id: 'features',
    label: 'Características',
    icon: List,
    description: 'Lista de beneficios o servicios clave',
    category: 'main-content',
    defaultData: {
      title: 'Nuestros Servicios',
      subtitle: 'Descubre cómo podemos ayudarte a alcanzar tus objetivos.',
      layout_type: 'grid',
      columns: 3,
      alignment: 'center',
      gap: 32,
      theme: 'light',
      smart_mode: true,
      card_style: {
        border: true,
        shadow: 'sm',
        glass: false,
        border_radius: 'xl'
      },
      features: [
        { 
          title: 'Rápido', 
          description: 'Optimizado para la mejor velocidad.', 
          icon: 'Zap',
          media_type: 'icon',
          icon_style: { shape: 'circle', type: 'solid' },
          badge: 'Popular'
        },
        { 
          title: 'Seguro', 
          description: 'Protección de datos de nivel empresarial.', 
          icon: 'Shield',
          media_type: 'icon',
          icon_style: { shape: 'circle', type: 'solid' }
        },
        { 
          title: 'Escalable', 
          description: 'Crece junto con tu negocio.', 
          icon: 'TrendingUp',
          media_type: 'icon',
          icon_style: { shape: 'circle', type: 'solid' }
        }
      ],
      show_icons: true,
      show_descriptions: true,
      section_button: { text: '', url: '', target: '_self' }
    },
    schema: [
      { name: 'title', label: 'Título de Sección', type: 'text', category: 'content' },
      { name: 'subtitle', label: 'Subtítulo de Sección', type: 'textarea', category: 'content' },
      { 
        name: 'layout_type', 
        label: 'Tipo de Diseño', 
        type: 'select', 
        category: 'design',
        options: [
          { label: 'Cuadrícula (Grid)', value: 'grid' },
          { label: 'Bento Grid', value: 'bento' },
          { label: 'Zig-Zag (Alternado)', value: 'zigzag' },
          { label: 'Lista Minimalista', value: 'list' },
          { label: 'Carrusel', value: 'carousel' }
        ]
      },
      { name: 'columns', label: 'Columnas (Escritorio)', type: 'range', min: 1, max: 4, step: 1, category: 'design' },
      { 
        name: 'alignment', 
        label: 'Alineación Global', 
        type: 'toggle-group', 
        category: 'design',
        options: [
          { label: 'Izquierda', value: 'left' },
          { label: 'Centro', value: 'center' }
        ]
      },
      { name: 'gap', label: 'Espaciado (px)', type: 'range', min: 0, max: 100, step: 4, category: 'design' },
      {
        name: 'card_style',
        label: 'Estilo de Tarjeta',
        type: 'object',
        category: 'design',
        itemSchema: [
          { name: 'border', label: 'Borde', type: 'boolean' },
          { 
            name: 'shadow', 
            label: 'Sombra', 
            type: 'select',
            options: [
              { label: 'Ninguna', value: 'none' },
              { label: 'Suave', value: 'sm' },
              { label: 'Media', value: 'md' },
              { label: 'Profunda', value: 'lg' }
            ]
          },
          { name: 'glass', label: 'Efecto Cristal (Glass)', type: 'boolean' },
          { 
            name: 'border_radius', 
            label: 'Redondeo', 
            type: 'select',
            options: [
              { label: 'Ninguno', value: 'none' },
              { label: 'Pequeño', value: 'md' },
              { label: 'Grande', value: 'xl' },
              { label: 'Extra Grande', value: '3xl' }
            ]
          }
        ]
      },
      { 
        name: 'features', 
        label: 'Lista de Características', 
        type: 'array',
        category: 'content',
        itemSchema: [
          { name: 'badge', label: 'Etiqueta (Badge)', type: 'text' },
          { name: 'title', label: 'Título', type: 'text' },
          { name: 'description', label: 'Descripción', type: 'textarea' },
          { 
            name: 'media_type', 
            label: 'Tipo de Multimedia', 
            type: 'select',
            options: [
              { label: 'Icono', value: 'icon' },
              { label: 'Imagen', value: 'image' }
            ]
          },
          { name: 'icon', label: 'Nombre del Icono (Lucide)', type: 'text' },
          { name: 'image', label: 'Imagen', type: 'image' },
          {
            name: 'icon_style',
            label: 'Estilo de Icono',
            type: 'object',
            itemSchema: [
              { 
                name: 'shape', 
                label: 'Forma', 
                type: 'select',
                options: [
                  { label: 'Círculo', value: 'circle' },
                  { label: 'Cuadrado', value: 'square' },
                  { label: 'Squircle', value: 'squircle' }
                ]
              },
              { 
                name: 'type', 
                label: 'Estilo', 
                type: 'select',
                options: [
                  { label: 'Sólido', value: 'solid' },
                  { label: 'Degradado', value: 'gradient' },
                  { label: 'Contorno', value: 'outlined' }
                ]
              }
            ]
          },
          BUTTON_GROUP_PROPS('link', 'Enlace / Botón')
        ]
      },
      BUTTON_GROUP_PROPS('section_button', 'Botón de Sección (Final)'),
      { name: 'show_icons', label: 'Mostrar Multimedia', type: 'boolean', category: 'content' },
      { name: 'show_descriptions', label: 'Mostrar Descripciones', type: 'boolean', category: 'content' },
      ...DESIGN_PROPS.map(p => ({ ...p, category: 'design' as const }))
    ]
  },
  {
    id: 'product-showcase',
    label: 'Productos',
    icon: Package,
    description: 'Muestra tus productos sincronizados de Solutium',
    category: 'sales',
    defaultData: {
      title: 'Productos Destacados',
      subtitle: 'Echa un vistazo a nuestras últimas novedades.',
      layout: 'grid',
      smart_mode: true
    },
    schema: [
      { name: 'title', label: 'Título', type: 'text' },
      { name: 'subtitle', label: 'Subtítulo', type: 'textarea' },
      { 
        name: 'smart_mode', 
        label: 'Modo Inteligente', 
        type: 'boolean' 
      },
      { 
        name: 'layout', 
        label: 'Diseño', 
        type: 'select',
        options: [
          { label: 'Cuadrícula (Grid)', value: 'grid' },
          { label: 'Lista', value: 'list' }
        ]
      }
    ]
  },
  {
    id: 'testimonials',
    label: 'Testimonios',
    icon: MessageSquare,
    description: 'Reseñas reales de clientes satisfechos',
    category: 'social-proof',
    defaultData: {
      title: 'Lo que dicen nuestros clientes',
      subtitle: 'Historias de éxito de personas como tú.',
      layout_type: 'grid',
      columns: 3,
      alignment: 'center',
      gap: 32,
      theme: 'light',
      smart_mode: true,
      card_style: {
        border: true,
        shadow: 'sm',
        glass: false,
        border_radius: 'xl',
        style: 'classic'
      },
      testimonials: [
        { 
          name: 'Juan Pérez', 
          role: 'CEO', 
          company: 'TechCorp',
          content: 'Excelente servicio y atención. Ha transformado la forma en que trabajamos.', 
          avatar: 'https://i.pravatar.cc/150?u=1',
          rating: 5,
          verified: true,
          source: 'linkedin'
        },
        { 
          name: 'María García', 
          role: 'Diseñadora', 
          company: 'Creative Studio',
          content: 'La mejor plataforma que he usado. Intuitiva y potente.', 
          avatar: 'https://i.pravatar.cc/150?u=2',
          rating: 5,
          verified: true,
          source: 'twitter'
        },
        { 
          name: 'Carlos Ruiz', 
          role: 'Marketing', 
          company: 'Growth Inc.',
          content: 'Increíble facilidad de uso y soporte de primera clase.', 
          avatar: 'https://i.pravatar.cc/150?u=3',
          rating: 4,
          verified: false,
          source: 'none'
        }
      ],
      show_rating: true,
      show_role: true,
      show_company: true,
      show_avatar: true,
      section_button: { text: '', url: '', target: '_self' }
    },
    schema: [
      { name: 'title', label: 'Título de Sección', type: 'text', category: 'content' },
      { name: 'subtitle', label: 'Subtítulo de Sección', type: 'textarea', category: 'content' },
      { 
        name: 'layout_type', 
        label: 'Tipo de Diseño', 
        type: 'select', 
        category: 'design',
        options: [
          { label: 'Cuadrícula (Grid)', value: 'grid' },
          { label: 'Masonry (Muro)', value: 'masonry' },
          { label: 'Carrusel Infinito', value: 'carousel' },
          { label: 'Destacado (Spotlight)', value: 'spotlight' },
          { label: 'Minimalista', value: 'minimal' }
        ]
      },
      { name: 'columns', label: 'Columnas (Escritorio)', type: 'range', min: 1, max: 4, step: 1, category: 'design' },
      { 
        name: 'alignment', 
        label: 'Alineación Global', 
        type: 'toggle-group', 
        category: 'design',
        options: [
          { label: 'Izquierda', value: 'left' },
          { label: 'Centro', value: 'center' }
        ]
      },
      { name: 'gap', label: 'Espaciado (px)', type: 'range', min: 0, max: 100, step: 4, category: 'design' },
      {
        name: 'card_style',
        label: 'Estilo de Tarjeta',
        type: 'object',
        category: 'design',
        itemSchema: [
          { 
            name: 'style', 
            label: 'Variante Visual', 
            type: 'select',
            options: [
              { label: 'Clásica', value: 'classic' },
              { label: 'Burbuja de Chat', value: 'bubble' },
              { label: 'Plana (Sin Borde)', value: 'flat' }
            ]
          },
          { name: 'border', label: 'Borde', type: 'boolean' },
          { 
            name: 'shadow', 
            label: 'Sombra', 
            type: 'select',
            options: [
              { label: 'Ninguna', value: 'none' },
              { label: 'Suave', value: 'sm' },
              { label: 'Media', value: 'md' },
              { label: 'Profunda', value: 'lg' }
            ]
          },
          { name: 'glass', label: 'Efecto Cristal (Glass)', type: 'boolean' },
          { 
            name: 'border_radius', 
            label: 'Redondeo', 
            type: 'select',
            options: [
              { label: 'Ninguno', value: 'none' },
              { label: 'Pequeño', value: 'md' },
              { label: 'Grande', value: 'xl' },
              { label: 'Extra Grande', value: '3xl' }
            ]
          }
        ]
      },
      { 
        name: 'testimonials', 
        label: 'Lista de Testimonios', 
        type: 'array',
        category: 'content',
        itemSchema: [
          { name: 'name', label: 'Nombre', type: 'text' },
          { name: 'role', label: 'Cargo / Rol', type: 'text' },
          { name: 'company', label: 'Empresa', type: 'text' },
          { name: 'content', label: 'Testimonio', type: 'textarea' },
          { name: 'avatar', label: 'Foto (URL)', type: 'image' },
          { name: 'rating', label: 'Valoración (1-5)', type: 'range', min: 1, max: 5, step: 1 },
          { name: 'verified', label: 'Compra Verificada', type: 'boolean' },
          { 
            name: 'source', 
            label: 'Fuente', 
            type: 'select',
            options: [
              { label: 'Ninguna', value: 'none' },
              { label: 'LinkedIn', value: 'linkedin' },
              { label: 'Twitter / X', value: 'twitter' },
              { label: 'Trustpilot', value: 'trustpilot' }
            ]
          }
        ]
      },
      BUTTON_GROUP_PROPS('section_button', 'Botón de Sección (Final)'),
      { name: 'show_rating', label: 'Mostrar Estrellas', type: 'boolean', category: 'content' },
      { name: 'show_avatar', label: 'Mostrar Fotos', type: 'boolean', category: 'content' },
      { name: 'show_role', label: 'Mostrar Cargo', type: 'boolean', category: 'content' },
      { name: 'show_company', label: 'Mostrar Empresa', type: 'boolean', category: 'content' },
      ...DESIGN_PROPS.map(p => ({ ...p, category: 'design' as const }))
    ]
  },
  {
    id: 'pricing',
    label: 'Planes',
    icon: CreditCard,
    description: 'Tablas comparativas de planes y precios',
    category: 'sales',
    defaultData: {
      title: 'Planes Flexibles',
      subtitle: 'Elige el plan que mejor se adapte a tus necesidades.',
      billing_cycle: 'monthly',
      smart_mode: true,
      plans: [
        { 
          name: 'Básico', 
          monthly_price: '$19', 
          annual_price: '$15',
          description: 'Ideal para proyectos personales y freelancers.',
          features: [{ text: '1 Proyecto' }, { text: 'Soporte Email' }, { text: 'Actualizaciones básicas' }] 
        },
        { 
          name: 'Pro', 
          monthly_price: '$49', 
          annual_price: '$39',
          description: 'Para negocios en crecimiento que necesitan más potencia.',
          features: [{ text: 'Proyectos Ilimitados' }, { text: 'Soporte 24/7' }, { text: 'Dominio Personalizado' }, { text: 'Analíticas Avanzadas' }], 
          popular: true 
        },
        { 
          name: 'Enterprise', 
          monthly_price: '$99', 
          annual_price: '$79',
          description: 'Soluciones a medida para grandes organizaciones.',
          features: [{ text: 'Todo lo de Pro' }, { text: 'Gestor de cuenta dedicado' }, { text: 'SLA garantizado' }, { text: 'Seguridad avanzada' }] 
        }
      ]
    },
    schema: [
      { name: 'title', label: 'Título', type: 'text', category: 'content' },
      { name: 'subtitle', label: 'Subtítulo', type: 'textarea', category: 'content' },
      { 
        name: 'billing_cycle', 
        label: 'Ciclo de Facturación', 
        type: 'toggle-group',
        category: 'content',
        options: [
          { label: 'Mensual', value: 'monthly' },
          { label: 'Anual', value: 'annual' }
        ]
      },
      { 
        name: 'plans', 
        label: 'Planes', 
        type: 'array',
        category: 'content',
        itemSchema: [
          { name: 'name', label: 'Nombre del Plan', type: 'text' },
          { name: 'description', label: 'Descripción corta', type: 'text' },
          { name: 'monthly_price', label: 'Precio Mensual', type: 'text' },
          { name: 'annual_price', label: 'Precio Anual (por mes)', type: 'text' },
          { name: 'popular', label: 'Destacado', type: 'boolean' },
          { 
            name: 'features', 
            label: 'Características', 
            type: 'array',
            itemSchema: [
              { name: 'text', label: 'Característica', type: 'text' }
            ]
          }
        ]
      },
      ...DESIGN_PROPS.map(p => ({ ...p, category: 'design' as const }))
    ]
  },
  {
    id: 'contact',
    label: 'Contacto',
    icon: MapPin,
    description: 'Formulario, mapa y datos de contacto',
    category: 'contact',
    defaultData: {
      title: '¿Tienes alguna duda?',
      subtitle: 'Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos lo antes posible.',
      layout_type: 'split', // split, center, map-immersive, sidebar
      theme: 'light',
      smart_mode: true,
      email: 'contacto@ejemplo.com',
      phone: '+1 234 567 890',
      address: 'Calle Principal 123, Madrid',
      show_map: true,
      map_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3037.365346083684!2d-3.706058684603912!3d40.41670467936526!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd42287d6da32a33%3A0x1d752f992d918152!2sPuerta%20del%20Sol!5e0!3m2!1ses!2ses!4v1647948345678!5m2!1ses!2ses',
      form_title: 'Envíanos un mensaje',
      show_name_field: true,
      show_email_field: true,
      show_phone_field: false,
      show_subject_field: false,
      show_message_field: true,
      button_text: 'Enviar Mensaje',
      success_message: '¡Gracias! Hemos recibido tu mensaje.',
      social_links: [
        { platform: 'linkedin', url: '#' },
        { platform: 'twitter', url: '#' },
        { platform: 'instagram', url: '#' }
      ]
    },
    schema: [
      { name: 'title', label: 'Título Principal', type: 'text', category: 'content' },
      { name: 'subtitle', label: 'Subtítulo', type: 'textarea', category: 'content' },
      { 
        name: 'layout_type', 
        label: 'Tipo de Diseño', 
        type: 'select', 
        category: 'design',
        options: [
          { label: 'Split (Clásico)', value: 'split' },
          { label: 'Centrado (Minimal)', value: 'center' },
          { label: 'Mapa Inmersivo', value: 'map-immersive' },
          { label: 'Barra Lateral', value: 'sidebar' }
        ]
      },
      { name: 'email', label: 'Email de Contacto', type: 'text', category: 'content' },
      { name: 'phone', label: 'Teléfono', type: 'text', category: 'content' },
      { name: 'address', label: 'Dirección Física', type: 'text', category: 'content' },
      
      { name: 'show_map', label: 'Mostrar Mapa', type: 'boolean', category: 'content' },
      { name: 'map_url', label: 'URL del Mapa (Embed)', type: 'text', category: 'content' },
      
      { name: 'form_title', label: 'Título del Formulario', type: 'text', category: 'content' },
      { name: 'show_name_field', label: 'Campo Nombre', type: 'boolean', category: 'content' },
      { name: 'show_email_field', label: 'Campo Email', type: 'boolean', category: 'content' },
      { name: 'show_phone_field', label: 'Campo Teléfono', type: 'boolean', category: 'content' },
      { name: 'show_subject_field', label: 'Campo Asunto', type: 'boolean', category: 'content' },
      { name: 'show_message_field', label: 'Campo Mensaje', type: 'boolean', category: 'content' },
      { name: 'button_text', label: 'Texto del Botón', type: 'text', category: 'content' },
      { name: 'success_message', label: 'Mensaje de Éxito', type: 'text', category: 'content' },
      
      { 
        name: 'social_links', 
        label: 'Redes Sociales', 
        type: 'array', 
        category: 'content',
        itemSchema: [
          { 
            name: 'platform', 
            label: 'Plataforma', 
            type: 'select',
            options: [
              { label: 'LinkedIn', value: 'linkedin' },
              { label: 'Twitter / X', value: 'twitter' },
              { label: 'Instagram', value: 'instagram' },
              { label: 'Facebook', value: 'facebook' },
              { label: 'YouTube', value: 'youtube' }
            ]
          },
          { name: 'url', label: 'URL Perfil', type: 'text' }
        ]
      },
      
      ...DESIGN_PROPS.map(p => ({ ...p, category: 'design' as const }))
    ]
  },
  {
    id: 'trust-bar',
    label: 'Clientes',
    icon: ShieldCheck,
    description: 'Logos de clientes o socios para generar autoridad',
    category: 'social-proof',
    defaultData: {
      title: 'Empresas que confían en nosotros',
      logos: [
        { name: 'Empresa 1', url: 'https://placehold.co/200x80?text=LOGO+1' },
        { name: 'Empresa 2', url: 'https://placehold.co/200x80?text=LOGO+2' },
        { name: 'Empresa 3', url: 'https://placehold.co/200x80?text=LOGO+3' },
        { name: 'Empresa 4', url: 'https://placehold.co/200x80?text=LOGO+4' },
        { name: 'Empresa 5', url: 'https://placehold.co/200x80?text=LOGO+5' }
      ],
      grayscale: true,
      opacity: 50,
      smart_mode: true
    },
    schema: [
      { name: 'title', label: 'Título', type: 'text', category: 'content' },
      { 
        name: 'logos', 
        label: 'Logos de Clientes', 
        type: 'array', 
        category: 'content',
        itemSchema: [
          { name: 'name', label: 'Nombre Empresa', type: 'text' },
          { name: 'url', label: 'Logo (URL)', type: 'image' }
        ]
      },
      { name: 'grayscale', label: 'Escala de Grises', type: 'boolean', category: 'design' },
      { name: 'opacity', label: 'Opacidad (%)', type: 'range', min: 10, max: 100, step: 10, category: 'design' },
      ...DESIGN_PROPS.map(p => ({ ...p, category: 'design' as const }))
    ]
  },
  {
    id: 'about',
    label: 'Sobre Nosotros',
    icon: Briefcase,
    description: 'Cuenta la narrativa y valores de tu marca',
    category: 'main-content',
    defaultData: {
      badge: 'Nuestra Historia',
      title: 'Más de 10 años impulsando el éxito digital',
      description: 'Nacimos con una misión clara: democratizar el acceso a la mejor tecnología para negocios de todos los tamaños. Hoy, somos líderes en soluciones inteligentes para el mercado hispano.',
      image: 'https://picsum.photos/seed/about/800/800',
      smart_mode: true,
      stat1: { value: '99%', label: 'Satisfacción' },
      stat2: { value: '24/7', label: 'Soporte Real' }
    },
    schema: [
      { name: 'badge', label: 'Etiqueta (Badge)', type: 'text', category: 'content' },
      { name: 'title', label: 'Título', type: 'text', category: 'content' },
      { name: 'description', label: 'Descripción', type: 'textarea', category: 'content' },
      { name: 'image', label: 'Imagen Principal', type: 'image', category: 'content' },
      {
        name: 'stat1',
        label: 'Estadística 1',
        type: 'object',
        category: 'content',
        itemSchema: [
          { name: 'value', label: 'Valor (ej: 99%)', type: 'text' },
          { name: 'label', label: 'Etiqueta', type: 'text' }
        ]
      },
      {
        name: 'stat2',
        label: 'Estadística 2',
        type: 'object',
        category: 'content',
        itemSchema: [
          { name: 'value', label: 'Valor (ej: 24/7)', type: 'text' },
          { name: 'label', label: 'Etiqueta', type: 'text' }
        ]
      },
      ...DESIGN_PROPS.map(p => ({ ...p, category: 'design' as const }))
    ]
  },
  {
    id: 'process',
    label: 'Proceso',
    icon: Layers,
    description: 'Guía visual de cómo funciona tu servicio',
    category: 'main-content',
    defaultData: {
      title: '¿Cómo funciona?',
      subtitle: 'Un proceso simple y transparente diseñado para tu comodidad.',
      smart_mode: true,
      steps: [
        { step: '01', title: 'Regístrate', desc: 'Crea tu cuenta en segundos y accede al panel.' },
        { step: '02', title: 'Configura', desc: 'Personaliza tus preferencias y sincroniza tus datos.' },
        { step: '03', title: 'Lanza', desc: 'Publica tu sitio y empieza a recibir clientes.' }
      ]
    },
    schema: [
      { name: 'title', label: 'Título', type: 'text', category: 'content' },
      { name: 'subtitle', label: 'Subtítulo', type: 'textarea', category: 'content' },
      {
        name: 'steps',
        label: 'Pasos del Proceso',
        type: 'array',
        category: 'content',
        itemSchema: [
          { name: 'step', label: 'Número/Icono', type: 'text' },
          { name: 'title', label: 'Título del Paso', type: 'text' },
          { name: 'desc', label: 'Descripción', type: 'textarea' }
        ]
      },
      ...DESIGN_PROPS.map(p => ({ ...p, category: 'design' as const }))
    ]
  },
  {
    id: 'stats',
    label: 'Estadísticas',
    icon: CheckCircle,
    description: 'Números que cuantifican el éxito de tu negocio',
    category: 'social-proof',
    defaultData: {
      title: 'Nuestros números',
      smart_mode: true,
      stats: [
        { val: '15k+', label: 'Usuarios' },
        { val: '40m', label: 'Ventas' },
        { val: '120', label: 'Países' },
        { val: '24/7', label: 'Soporte' }
      ]
    },
    schema: [
      { name: 'title', label: 'Título (Opcional)', type: 'text', category: 'content' },
      {
        name: 'stats',
        label: 'Métricas',
        type: 'array',
        category: 'content',
        itemSchema: [
          { name: 'val', label: 'Valor (Número)', type: 'text' },
          { name: 'label', label: 'Etiqueta', type: 'text' }
        ]
      },
      ...DESIGN_PROPS.map(p => ({ ...p, category: 'design' as const }))
    ]
  },
  {
    id: 'gallery',
    label: 'Galería',
    icon: Image,
    description: 'Muestra imágenes en un formato atractivo',
    category: 'main-content',
    defaultData: {
      title: 'Galería Visual',
      subtitle: 'Explora nuestro trabajo a través de imágenes.',
      layout_type: 'grid',
      columns: 4,
      gap: 16,
      theme: 'light',
      smart_mode: true,
      aspect_ratio: 'square',
      images: [
        { url: 'https://picsum.photos/seed/gallery1/800/800', title: 'Proyecto Alpha', category: 'Diseño' },
        { url: 'https://picsum.photos/seed/gallery2/800/800', title: 'Branding Beta', category: 'Branding' },
        { url: 'https://picsum.photos/seed/gallery3/800/800', title: 'Web Gamma', category: 'Web' },
        { url: 'https://picsum.photos/seed/gallery4/800/800', title: 'App Delta', category: 'Mobile' },
        { url: 'https://picsum.photos/seed/gallery5/800/800', title: 'Photo Epsilon', category: 'Foto' },
        { url: 'https://picsum.photos/seed/gallery6/800/800', title: 'Art Zeta', category: 'Arte' }
      ],
      show_filters: true,
      show_overlay: true,
      overlay_style: 'hover', // hover, always
      hover_effect: 'zoom', // zoom, grayscale, tilt, none
      border_radius: 'xl',
      show_view_all_button: true,
      view_all_button_text: 'Ver Todo',
      view_all_button_url: '#'
    },
    schema: [
      { name: 'title', label: 'Título', type: 'text', category: 'content' },
      { name: 'subtitle', label: 'Subtítulo', type: 'textarea', category: 'content' },
      { 
        name: 'layout_type', 
        label: 'Tipo de Diseño', 
        type: 'select', 
        category: 'design',
        options: [
          { label: 'Cuadrícula (Grid)', value: 'grid' },
          { label: 'Masonry (Muro)', value: 'masonry' },
          { label: 'Mosaico (Mosaic)', value: 'mosaic' },
          { label: 'Carrusel (Slider)', value: 'carousel' }
        ]
      },
      { name: 'columns', label: 'Columnas (Escritorio)', type: 'range', min: 1, max: 6, step: 1, category: 'design' },
      { name: 'gap', label: 'Espaciado (px)', type: 'range', min: 0, max: 64, step: 4, category: 'design' },
      { 
        name: 'aspect_ratio', 
        label: 'Relación de Aspecto', 
        type: 'select', 
        category: 'design',
        options: [
          { label: 'Cuadrada (1:1)', value: 'square' },
          { label: 'Retrato (3:4)', value: 'portrait' },
          { label: 'Paisaje (16:9)', value: 'landscape' },
          { label: 'Original', value: 'auto' }
        ]
      },
      { 
        name: 'border_radius', 
        label: 'Redondeo', 
        type: 'select', 
        category: 'design',
        options: [
          { label: 'Ninguno', value: 'none' },
          { label: 'Pequeño', value: 'md' },
          { label: 'Grande', value: 'xl' },
          { label: 'Extra Grande', value: '3xl' }
        ]
      },
      { 
        name: 'hover_effect', 
        label: 'Efecto Hover', 
        type: 'select', 
        category: 'design',
        options: [
          { label: 'Ninguno', value: 'none' },
          { label: 'Zoom', value: 'zoom' },
          { label: 'Escala de Grises a Color', value: 'grayscale' },
          { label: 'Tilt 3D', value: 'tilt' }
        ]
      },
      { name: 'show_overlay', label: 'Mostrar Info al Pasar Mouse', type: 'boolean', category: 'content' },
      { name: 'show_filters', label: 'Mostrar Filtros de Categoría', type: 'boolean', category: 'content' },
      
      { 
        name: 'images', 
        label: 'Imágenes', 
        type: 'array', 
        category: 'content',
        itemSchema: [
          { name: 'url', label: 'Imagen', type: 'image' },
          { name: 'title', label: 'Título', type: 'text' },
          { name: 'category', label: 'Categoría', type: 'text' },
          { name: 'link', label: 'Enlace (Opcional)', type: 'text' }
        ]
      },
      { name: 'show_view_all_button', label: 'Mostrar Botón "Ver Todo"', type: 'boolean', category: 'content' },
      { name: 'view_all_button_text', label: 'Texto Botón Ver Todo', type: 'text', category: 'content' },
      { name: 'view_all_button_url', label: 'URL Botón Ver Todo', type: 'text', category: 'content' },
      
      ...DESIGN_PROPS.map(p => ({ ...p, category: 'design' as const }))
    ]
  },
  {
    id: 'video',
    label: 'Video',
    icon: Video,
    description: 'Embebe videos para aumentar el engagement',
    category: 'main-content',
    defaultData: {
      title: 'Mira nuestra presentación',
      subtitle: 'Descubre cómo Solutium puede transformar tu negocio en 2 minutos.',
      layout_type: 'classic', // classic, hero, split, popup
      theme: 'dark',
      smart_mode: true,
      video_type: 'youtube', // youtube, vimeo, custom
      video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      poster_image: 'https://picsum.photos/seed/video-poster/1280/720',
      autoplay: false,
      muted: false,
      loop: false,
      show_controls: true,
      show_overlay: true,
      overlay_title: 'Video Promocional',
      show_play_button: true,
      play_button_style: 'solid', // solid, outline, glass
      mask_shape: 'none', // none, rounded, circle, blob
      show_transcription: false,
      transcription_text: 'Aquí va la transcripción del video...',
      show_cta: false,
      cta_text: 'Empezar Ahora',
      cta_url: '#'
    },
    schema: [
      { name: 'title', label: 'Título', type: 'text', category: 'content' },
      { name: 'subtitle', label: 'Subtítulo', type: 'textarea', category: 'content' },
      
      { 
        name: 'layout_type', 
        label: 'Tipo de Diseño', 
        type: 'select', 
        category: 'design',
        options: [
          { label: 'Clásico (Centrado)', value: 'classic' },
          { label: 'Hero (Pantalla Completa)', value: 'hero' },
          { label: 'Split (Texto + Video)', value: 'split' },
          { label: 'Popup (Modal)', value: 'popup' }
        ]
      },
      
      { 
        name: 'video_type', 
        label: 'Fuente de Video', 
        type: 'select', 
        category: 'content',
        options: [
          { label: 'YouTube', value: 'youtube' },
          { label: 'Vimeo', value: 'vimeo' },
          { label: 'Archivo Directo (.mp4)', value: 'custom' }
        ]
      },
      { name: 'video_url', label: 'URL del Video', type: 'text', category: 'content' },
      { name: 'poster_image', label: 'Imagen de Portada (Poster)', type: 'image', category: 'content' },
      
      { name: 'autoplay', label: 'Autoplay (Silenciado)', type: 'boolean', category: 'content' },
      { name: 'muted', label: 'Silenciar por defecto', type: 'boolean', category: 'content' },
      { name: 'loop', label: 'Repetir en bucle', type: 'boolean', category: 'content' },
      { name: 'show_controls', label: 'Mostrar Controles', type: 'boolean', category: 'content' },
      
      { name: 'show_play_button', label: 'Mostrar Botón Play', type: 'boolean', category: 'design' },
      { 
        name: 'play_button_style', 
        label: 'Estilo Botón Play', 
        type: 'select', 
        category: 'design',
        options: [
          { label: 'Sólido', value: 'solid' },
          { label: 'Contorno', value: 'outline' },
          { label: 'Cristal (Glass)', value: 'glass' }
        ]
      },
      
      { 
        name: 'mask_shape', 
        label: 'Forma de Máscara', 
        type: 'select', 
        category: 'design',
        options: [
          { label: 'Ninguna (Rectangular)', value: 'none' },
          { label: 'Redondeada', value: 'rounded' },
          { label: 'Círculo', value: 'circle' },
          { label: 'Orgánica (Blob)', value: 'blob' }
        ]
      },
      
      { name: 'show_transcription', label: 'Mostrar Transcripción', type: 'boolean', category: 'content' },
      { name: 'transcription_text', label: 'Texto Transcripción', type: 'textarea', category: 'content' },
      
      { name: 'show_cta', label: 'Mostrar Botón Final', type: 'boolean', category: 'content' },
      { name: 'cta_text', label: 'Texto Botón', type: 'text', category: 'content' },
      { name: 'cta_url', label: 'URL Botón', type: 'text', category: 'content' },
      
      ...DESIGN_PROPS.map(p => ({ ...p, category: 'design' as const }))
    ]
  },
  {
    id: 'newsletter',
    label: 'Newsletter',
    icon: Mail,
    description: 'Captación de correos para marketing directo',
    category: 'contact',
    defaultData: {
      title: 'Únete a nuestra Newsletter',
      subtitle: 'Recibe consejos semanales sobre crecimiento digital y ofertas exclusivas directamente en tu bandeja de entrada.',
      layout_type: 'center', // center, split, slim, popup
      theme: 'dark',
      smart_mode: true,
      background_image: '',
      show_name_field: false,
      email_placeholder: 'tu@email.com',
      name_placeholder: 'Tu nombre',
      button_text: 'Suscribirme',
      success_message: '¡Gracias por suscribirte! Revisa tu correo.',
      disclaimer: 'Prometemos no enviar spam. Puedes darte de baja en cualquier momento.',
      show_disclaimer: true
    },
    schema: [
      { name: 'title', label: 'Título', type: 'text', category: 'content' },
      { name: 'subtitle', label: 'Subtítulo', type: 'textarea', category: 'content' },
      
      { 
        name: 'layout_type', 
        label: 'Tipo de Diseño', 
        type: 'select', 
        category: 'design',
        options: [
          { label: 'Centrado (Clásico)', value: 'center' },
          { label: 'Split (Imagen + Form)', value: 'split' },
          { label: 'Slim (Barra)', value: 'slim' },
          { label: 'Popup (Modal)', value: 'popup' }
        ]
      },
      
      { name: 'background_image', label: 'Imagen de Fondo', type: 'image', category: 'design' },
      
      { name: 'show_name_field', label: 'Pedir Nombre', type: 'boolean', category: 'content' },
      { name: 'email_placeholder', label: 'Placeholder Email', type: 'text', category: 'content' },
      { name: 'name_placeholder', label: 'Placeholder Nombre', type: 'text', category: 'content' },
      { name: 'button_text', label: 'Texto Botón', type: 'text', category: 'content' },
      { name: 'success_message', label: 'Mensaje de Éxito', type: 'text', category: 'content' },
      
      { name: 'show_disclaimer', label: 'Mostrar Disclaimer', type: 'boolean', category: 'content' },
      { name: 'disclaimer', label: 'Texto Disclaimer', type: 'text', category: 'content' },
      
      ...DESIGN_PROPS.map(p => ({ ...p, category: 'design' as const }))
    ]
  },
  {
    id: 'cta-banner',
    label: 'Call to Action (CTA)',
    icon: ArrowRightCircle,
    description: 'Última llamada a la acción antes del cierre',
    category: 'sales',
    defaultData: {
      title: '¿Listo para dar el siguiente paso?',
      subtitle: 'Empieza hoy mismo y transforma tu presencia digital con nuestra plataforma.',
      layout_type: 'center',
      theme: 'dark',
      smart_mode: true,
      primary_button: { text: 'Comenzar Ahora', url: '#', target: '_self' },
      secondary_button: { text: 'Saber más', url: '#', target: '_self' },
      show_secondary_button: true,
      show_app_badges: false,
      show_newsletter: false,
      micro_copy: 'No requiere tarjeta de crédito. 14 días de prueba.',
      show_micro_copy: true,
      show_checklist: false,
      checklist: [
        { text: 'Configuración instantánea' },
        { text: 'Soporte 24/7' },
        { text: 'Cancelación en cualquier momento' }
      ],
      background_image: '',
      background_style: 'solid', // solid, gradient, mesh, image
      mockup_image: '',
      show_mockup: false
    },
    schema: [
      { name: 'title', label: 'Título Principal', type: 'text', category: 'content' },
      { name: 'subtitle', label: 'Subtítulo', type: 'textarea', category: 'content' },
      { 
        name: 'layout_type', 
        label: 'Tipo de Diseño', 
        type: 'select', 
        category: 'design',
        options: [
          { label: 'Impacto Central', value: 'center' },
          { label: 'Split con Mockup', value: 'split' },
          { label: 'Barra Flotante', value: 'floating' },
          { label: 'Ancho Completo', value: 'full' },
          { label: 'Minimalista', value: 'minimal' }
        ]
      },
      {
        name: 'background_style',
        label: 'Estilo de Fondo',
        type: 'select',
        category: 'design',
        options: [
          { label: 'Color Sólido', value: 'solid' },
          { label: 'Gradiente Suave', value: 'gradient' },
          { label: 'Mesh Gradient', value: 'mesh' },
          { label: 'Imagen', value: 'image' }
        ]
      },
      { name: 'background_image', label: 'Imagen de Fondo', type: 'image', category: 'design' },
      
      BUTTON_GROUP_PROPS('primary_button', 'Botón Primario'),
      { name: 'show_secondary_button', label: 'Mostrar Botón Secundario', type: 'boolean', category: 'content' },
      BUTTON_GROUP_PROPS('secondary_button', 'Botón Secundario'),
      
      { name: 'show_app_badges', label: 'Mostrar Badges de App Store', type: 'boolean', category: 'content' },
      { name: 'show_newsletter', label: 'Mostrar Captura de Email', type: 'boolean', category: 'content' },
      
      { name: 'show_micro_copy', label: 'Mostrar Texto de Confianza', type: 'boolean', category: 'content' },
      { name: 'micro_copy', label: 'Texto de Confianza (Micro-copy)', type: 'text', category: 'content' },
      
      { name: 'show_checklist', label: 'Mostrar Checklist', type: 'boolean', category: 'content' },
      {
        name: 'checklist',
        label: 'Puntos de Checklist',
        type: 'array',
        category: 'content',
        itemSchema: [
          { name: 'text', label: 'Texto', type: 'text' }
        ]
      },
      
      { name: 'show_mockup', label: 'Mostrar Mockup de Producto', type: 'boolean', category: 'design' },
      { name: 'mockup_image', label: 'Imagen del Mockup', type: 'image', category: 'design' },
      
      ...DESIGN_PROPS.map(p => ({ ...p, category: 'design' as const }))
    ]
  },
  {
    id: 'team',
    label: 'Equipo',
    icon: Users,
    description: 'Presenta a las personas detrás del negocio',
    category: 'social-proof',
    defaultData: {
      title: 'Nuestro Equipo',
      subtitle: 'Profesionales apasionados por la tecnología y el diseño.',
      smart_mode: true,
      items: [
        { name: 'Ana Silva', role: 'CEO & Fundadora' },
        { name: 'Carlos Ruiz', role: 'Director Técnico' },
        { name: 'Laura Gómez', role: 'Diseñadora Principal' },
        { name: 'Miguel Ángel', role: 'Líder de Marketing' }
      ]
    },
    schema: [
      { name: 'title', label: 'Título', type: 'text' },
      { name: 'subtitle', label: 'Subtítulo', type: 'textarea' },
      { 
        name: 'smart_mode', 
        label: 'Modo Inteligente', 
        type: 'boolean' 
      },
      { 
        name: 'items', 
        label: 'Miembros', 
        type: 'array',
        itemSchema: [
          { name: 'name', label: 'Nombre', type: 'text' },
          { name: 'role', label: 'Cargo', type: 'text' },
          { name: 'image', label: 'Foto', type: 'image' }
        ]
      }
    ]
  },
  {
    id: 'faq',
    label: 'FAQ',
    icon: HelpCircle,
    description: 'Resuelve las dudas más comunes de tus clientes',
    category: 'contact',
    defaultData: {
      title: 'Preguntas Frecuentes',
      subtitle: 'Todo lo que necesitas saber sobre nuestro servicio.',
      smart_mode: true,
      items: [
        { q: '¿Cómo funciona la sincronización con Solutium?', a: 'Es automática. Una vez conectas tu cuenta, todos tus productos y leads se sincronizan en tiempo real.' },
        { q: '¿Puedo usar mi propio dominio?', a: 'Sí, en el plan Pro y superiores puedes conectar cualquier dominio que ya poseas.' },
        { q: '¿Ofrecen soporte técnico?', a: 'Por supuesto. Nuestro equipo está disponible 24/7 para ayudarte con cualquier duda o problema.' }
      ]
    },
    schema: [
      { name: 'title', label: 'Título', type: 'text' },
      { name: 'subtitle', label: 'Subtítulo', type: 'textarea' },
      { 
        name: 'smart_mode', 
        label: 'Modo Inteligente', 
        type: 'boolean' 
      },
      { 
        name: 'items', 
        label: 'Preguntas', 
        type: 'array',
        itemSchema: [
          { name: 'q', label: 'Pregunta', type: 'text' },
          { name: 'a', label: 'Respuesta', type: 'textarea' }
        ]
      }
    ]
  },
  {
    id: 'footer',
    label: 'Pie de página',
    icon: PanelBottom,
    description: 'Sección final con enlaces legales y redes sociales',
    category: 'navigation',
    defaultData: {
      layout_type: 'columns', // columns, simple, centered, minimal
      theme: 'dark',
      smart_mode: true,
      logo_text: 'SOLUTIUM',
      logo_image: '',
      description: 'Construyendo el futuro de la web. Soluciones inteligentes para negocios modernos.',
      copyright: '© 2024 Solutium. Todos los derechos reservados.',
      show_social_links: true,
      social_links: [
        { platform: 'linkedin', url: '#' },
        { platform: 'twitter', url: '#' },
        { platform: 'instagram', url: '#' }
      ],
      columns: [
        {
          title: 'Empresa',
          links: [
            { text: 'Sobre Nosotros', url: '#' },
            { text: 'Carreras', url: '#' },
            { text: 'Blog', url: '#' }
          ]
        },
        {
          title: 'Producto',
          links: [
            { text: 'Características', url: '#' },
            { text: 'Precios', url: '#' },
            { text: 'Integraciones', url: '#' }
          ]
        },
        {
          title: 'Recursos',
          links: [
            { text: 'Documentación', url: '#' },
            { text: 'Ayuda', url: '#' },
            { text: 'Comunidad', url: '#' }
          ]
        }
      ],
      show_newsletter: true,
      newsletter_title: 'Suscríbete',
      newsletter_text: 'Recibe las últimas noticias y actualizaciones.',
      bottom_links: [
        { text: 'Privacidad', url: '#' },
        { text: 'Términos', url: '#' },
        { text: 'Cookies', url: '#' }
      ]
    },
    schema: [
      { 
        name: 'layout_type', 
        label: 'Tipo de Diseño', 
        type: 'select', 
        category: 'design',
        options: [
          { label: 'Columnas (Completo)', value: 'columns' },
          { label: 'Simple', value: 'simple' },
          { label: 'Centrado', value: 'centered' },
          { label: 'Minimalista', value: 'minimal' }
        ]
      },
      { name: 'logo_text', label: 'Texto del Logo', type: 'text', category: 'content' },
      { name: 'logo_image', label: 'Imagen del Logo', type: 'image', category: 'design' },
      { name: 'description', label: 'Descripción', type: 'textarea', category: 'content' },
      
      { 
        name: 'columns', 
        label: 'Columnas de Enlaces', 
        type: 'array', 
        category: 'content',
        itemSchema: [
          { name: 'title', label: 'Título Columna', type: 'text' },
          { 
            name: 'links', 
            label: 'Enlaces', 
            type: 'array',
            itemSchema: [
              { name: 'text', label: 'Texto', type: 'text' },
              { name: 'url', label: 'URL', type: 'text' }
            ]
          }
        ]
      },
      
      { name: 'show_social_links', label: 'Mostrar Redes Sociales', type: 'boolean', category: 'content' },
      { 
        name: 'social_links', 
        label: 'Redes Sociales', 
        type: 'array', 
        category: 'content',
        itemSchema: [
          { 
            name: 'platform', 
            label: 'Plataforma', 
            type: 'select',
            options: [
              { label: 'LinkedIn', value: 'linkedin' },
              { label: 'Twitter / X', value: 'twitter' },
              { label: 'Instagram', value: 'instagram' },
              { label: 'Facebook', value: 'facebook' },
              { label: 'YouTube', value: 'youtube' },
              { label: 'GitHub', value: 'github' }
            ]
          },
          { name: 'url', label: 'URL Perfil', type: 'text' }
        ]
      },
      
      { name: 'show_newsletter', label: 'Mostrar Newsletter', type: 'boolean', category: 'content' },
      { name: 'newsletter_title', label: 'Título Newsletter', type: 'text', category: 'content' },
      { name: 'newsletter_text', label: 'Texto Newsletter', type: 'textarea', category: 'content' },
      
      { name: 'copyright', label: 'Texto de Copyright', type: 'text', category: 'content' },
      { 
        name: 'bottom_links', 
        label: 'Enlaces Legales', 
        type: 'array', 
        category: 'content',
        itemSchema: [
          { name: 'text', label: 'Texto', type: 'text' },
          { name: 'url', label: 'URL', type: 'text' }
        ]
      },
      
      ...DESIGN_PROPS.map(p => ({ ...p, category: 'design' as const }))
    ]
  },
  {
    id: 'spacer',
    label: 'Espaciadores',
    icon: MoveVertical,
    description: 'Separadores y espacios para organizar el contenido',
    category: 'navigation',
    defaultData: {
      spacer_type: 'smart',
      smart_mode: true,
      height: 40,
      line_style: 'solid',
      line_width: 100,
      line_color: '#e2e8f0',
      line_thickness: 1,
      icon_name: 'Star',
      label_text: 'SECCIÓN',
      shaper_type: 'wave',
      pattern_type: 'dots',
      background_color: 'transparent'
    },
    schema: [
      {
        name: 'smart_mode',
        label: 'Modo Inteligente',
        type: 'boolean'
      },
      {
        name: 'spacer_type',
        label: 'Tipo de Espaciador',
        type: 'select',
        options: [
          { label: 'Espaciador Inteligente', value: 'smart' },
          { label: 'Divisor Minimalista', value: 'line' },
          { label: 'Divisor con Icono', value: 'icon' },
          { label: 'Divisor Editorial', value: 'label' },
          { label: 'Transición de Forma', value: 'shaper' },
          { label: 'Patrón de Textura', value: 'pattern' },
          { label: 'Indicador de Scroll', value: 'scroll' }
        ]
      },
      // Common
      { name: 'background_color', label: 'Color de Fondo del Bloque', type: 'color' },
      
      // Smart Spacer
      { name: 'height', label: 'Altura (px)', type: 'range', min: 0, max: 200, step: 1 },
      
      // Line / Icon / Label common
      { name: 'line_width', label: 'Ancho (%)', type: 'range', min: 10, max: 100, step: 1 },
      { name: 'line_thickness', label: 'Grosor (px)', type: 'range', min: 1, max: 10, step: 1 },
      { name: 'line_color', label: 'Color de Línea/Elemento', type: 'color' },
      { 
        name: 'line_style', 
        label: 'Estilo de Línea', 
        type: 'select',
        options: [
          { label: 'Sólida', value: 'solid' },
          { label: 'Discontinua', value: 'dashed' },
          { label: 'Punteada', value: 'dotted' }
        ]
      },
      
      // Icon specific
      { name: 'icon_name', label: 'Nombre del Icono (ej: Star, Heart, Zap)', type: 'text' },
      
      // Label specific
      { name: 'label_text', label: 'Texto del Divisor', type: 'text' },
      
      // Shaper specific
      { 
        name: 'shaper_type', 
        label: 'Tipo de Forma', 
        type: 'select',
        options: [
          { label: 'Onda', value: 'wave' },
          { label: 'Curva', value: 'curve' },
          { label: 'Diagonal', value: 'diagonal' }
        ]
      },
      
      // Pattern specific
      { 
        name: 'pattern_type', 
        label: 'Tipo de Patrón', 
        type: 'select',
        options: [
          { label: 'Puntos', value: 'dots' },
          { label: 'Líneas', value: 'stripes' }
        ]
      }
    ]
  }
];

export const getModuleDefinition = (type: string) => {
  return MODULE_REGISTRY.find(m => m.id === type);
};
