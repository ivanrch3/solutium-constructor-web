import React from 'react';
import { 
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
  category?: 'content' | 'design' | string; // For tabs
  min?: number; // For range
  max?: number; // For range
  step?: number; // For range
  disabled?: boolean;
  condition?: { field: string; operator: '===' | '!==' | 'includes' | 'not-includes'; value: any };
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
      messageStyle: { align: 'center', size: 'small', weight: '600' },
      icon: 'Megaphone',
      link: { text: 'Comprar ahora', url: '#', target: '_self' },
      showSocial: true,
      theme: 'dark',
      smartMode: true,
      disableColorAlternation: false,
      backgroundColor: '',
      textColor: '',
      padding: 'normal',
      isSticky: false,
      isDismissible: true,
      visibility: 'all'
    },
    schema: [
      { name: 'message', label: 'Mensaje Principal', type: 'text', category: 'content' },
      ...TYPOGRAPHY_PROPS('message', 'Estilo del Mensaje'),
      
      { 
        name: 'advancedMode', 
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
      { name: 'backgroundColor', label: 'Color de Fondo', type: 'color', category: 'design' },
      { name: 'textColor', label: 'Color de Texto / Iconos', type: 'color', category: 'design' },
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
      { name: 'isSticky', label: 'Fijar al hacer scroll (Sticky)', type: 'boolean', category: 'design' },
      { name: 'isDismissible', label: 'Permitir cerrar ("X")', type: 'boolean', category: 'design' },
      { 
        name: 'smartMode', 
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
      { name: 'showSocial', label: 'Mostrar Redes Sociales', type: 'boolean', category: 'content' },
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
      logoText: 'Constructor Web',
      logoImage: 'https://solutium.app/logos-de-apps/solutium-constructor-web-imagotipo.png',
      logoPosition: 'left',
      scrollBehavior: 'sticky',
      menuItems: [
        { label: 'Inicio', link: '#' },
        { label: 'Servicios', link: '#features' },
        { label: 'Nosotros', link: '#about' },
        { label: 'Contacto', link: '#contact' }
      ],
      showCta: true,
      ctaText: 'Empezar',
      showLanguage: true,
      theme: 'light',
      logoType: 'inherited',
      disableColorAlternation: false
    },
    schema: [
      // Editor de textos (Prioridad 1)
      { 
        name: 'logoText', 
        label: 'Texto del logo', 
        type: 'text', 
        category: 'content' as const,
        condition: { field: 'logoType', operator: '===', value: 'none' }
      },
      ...TYPOGRAPHY_PROPS('logoText', 'Estilo del texto del logo').map(p => ({ 
        ...p, 
        category: 'content' as const,
        condition: { field: 'logoType', operator: '===', value: 'none' }
      })),
      { 
        name: 'menuItems', 
        label: 'Enlaces del Menú', 
        type: 'array',
        category: 'content' as const,
        itemSchema: [
          { name: 'label', label: 'Etiqueta', type: 'text' },
          { name: 'link', label: 'Enlace', type: 'text' }
        ]
      },
      { name: 'ctaText', label: 'Texto del botón', type: 'text', category: 'content' as const },

      // Resto de propiedades
      { 
        name: 'logoType', 
        label: 'Tipo de Logo', 
        type: 'select',
        category: 'design' as const,
        options: [
          { label: 'Logo de la aplicación (Heredado)', value: 'inherited' },
          { label: 'Subir nuevo logo / URL', value: 'custom' },
          { label: 'Sin logo (Solo texto)', value: 'none' }
        ]
      },
      { name: 'logoImage', label: 'Imagen del Logo', type: 'image', category: 'content' as const },
      { 
        name: 'logoPosition', 
        label: 'Ubicación del Logo', 
        type: 'select',
        category: 'design' as const,
        options: [
          { label: 'Izquierda', value: 'left' },
          { label: 'Centro', value: 'center' },
          { label: 'Derecha', value: 'right' }
        ]
      },
      { 
        name: 'theme', 
        label: 'Tema', 
        type: 'toggle-group',
        category: 'design' as const,
        options: [
          { label: 'Claro', value: 'light' },
          { label: 'Oscuro', value: 'dark' }
        ]
      },
      { 
        name: 'disableColorAlternation', 
        label: 'Desactivar alternancia automática de color', 
        type: 'boolean',
        category: 'design' as const
      },
      { 
        name: 'scrollBehavior', 
        label: 'Comportamiento al desplazar', 
        type: 'select',
        category: 'design' as const,
        options: [
          { label: 'Estático', value: 'static' },
          { label: 'Fijo (Sticky)', value: 'sticky' },
          { label: 'Inteligente (Smart Hide)', value: 'smart-hide' }
        ]
      },
      { name: 'showCta', label: 'Mostrar Botón de Acción', type: 'boolean', category: 'content' as const },
      { name: 'showLanguage', label: 'Mostrar Selector de Idioma', type: 'boolean', category: 'content' as const }
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
      primaryButton: { text: 'Empezar ahora', url: '#', target: '_self' },
      secondaryButton: { text: 'Ver Demo', url: '#', target: '_self' },
      layoutType: 'layout-1',
      theme: 'dark',
      disableColorAlternation: false,
      background: { overlayOpacity: 0.7 },
      titleStyle: { size: 'h1', weight: '900', align: 'center', highlightType: 'gradient' },
      subtitleStyle: { size: 'p', weight: '400', align: 'center', highlightType: 'none' }
    },
    schema: [
      // Editor de textos (Prioridad 1)
      { name: 'title', label: 'Título', type: 'text', category: 'content' },
      ...TYPOGRAPHY_PROPS('title', 'Estilo del título').map(p => ({ ...p, category: 'content' })),
      { name: 'subtitle', label: 'Subtítulo', type: 'textarea', category: 'content' },
      ...TYPOGRAPHY_PROPS('subtitle', 'Estilo del subtítulo').map(p => ({ ...p, category: 'content' })),

      // Botones y otros contenidos
      BUTTON_GROUP_PROPS('primaryButton', 'Botón Primario'),
      BUTTON_GROUP_PROPS('secondaryButton', 'Botón Secundario'),
      
      // Diseño y Configuración
      ...DESIGN_PROPS.map(p => ({ ...p, category: 'design' as const }))
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
      titleStyle: { size: 'h2', weight: '700', align: 'center' },
      subtitleStyle: { size: 'p', weight: '400', align: 'center' },
      layoutType: 'grid',
      columns: 3,
      alignment: 'center',
      gap: 32,
      theme: 'light',
      disableColorAlternation: false,
      cardStyle: {
        border: true,
        shadow: 'sm',
        glass: false,
        borderRadius: 'xl'
      },
      features: [
        { 
          title: 'Rápido', 
          description: 'Optimizado para la mejor velocidad.', 
          icon: 'Zap',
          mediaType: 'icon',
          iconStyle: { shape: 'circle', type: 'solid' },
          badge: 'Popular'
        },
        { 
          title: 'Seguro', 
          description: 'Protección de datos de nivel empresarial.', 
          icon: 'Shield',
          mediaType: 'icon',
          iconStyle: { shape: 'circle', type: 'solid' }
        },
        { 
          title: 'Escalable', 
          description: 'Crece junto con tu negocio.', 
          icon: 'TrendingUp',
          mediaType: 'icon',
          iconStyle: { shape: 'circle', type: 'solid' }
        }
      ],
      showIcons: true,
      showDescriptions: true,
      sectionButton: { text: '', url: '', target: '_self' }
    },
    schema: [
      // Editor de textos (Prioridad 1)
      { name: 'title', label: 'Título de Sección', type: 'text', category: 'content' },
      ...TYPOGRAPHY_PROPS('title', 'Estilo del título').map(p => ({ ...p, category: 'content' })),
      { name: 'subtitle', label: 'Subtítulo de Sección', type: 'textarea', category: 'content' },
      ...TYPOGRAPHY_PROPS('subtitle', 'Estilo del subtítulo').map(p => ({ ...p, category: 'content' })),

      { 
        name: 'layoutType', 
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
        name: 'cardStyle',
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
            name: 'borderRadius', 
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
            name: 'mediaType', 
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
            name: 'iconStyle',
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
      BUTTON_GROUP_PROPS('sectionButton', 'Botón de Sección (Final)'),
      { name: 'showIcons', label: 'Mostrar Multimedia', type: 'boolean', category: 'content' },
      { name: 'showDescriptions', label: 'Mostrar Descripciones', type: 'boolean', category: 'content' },
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
      layoutType: 'grid',
      smartMode: true,
      disableColorAlternation: false
    },
    schema: [
      { name: 'title', label: 'Título', type: 'text', category: 'content' },
      { name: 'subtitle', label: 'Subtítulo', type: 'textarea', category: 'content' },
      ...TYPOGRAPHY_PROPS('title', 'Estilo Título'),
      ...TYPOGRAPHY_PROPS('subtitle', 'Estilo Subtítulo'),
      
      { 
        name: 'smartMode', 
        label: 'Modo Inteligente', 
        type: 'boolean',
        category: 'design'
      },
      { 
        name: 'layoutType', 
        label: 'Diseño', 
        type: 'select',
        category: 'design',
        options: [
          { label: 'Cuadrícula (Grid)', value: 'grid' },
          { label: 'Lista', value: 'list' }
        ]
      },
      ...DESIGN_PROPS.map(p => ({ ...p, category: 'design' as const }))
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
      titleStyle: { size: 'h2', weight: '700', align: 'center' },
      subtitleStyle: { size: 'p', weight: '400', align: 'center' },
      layoutType: 'grid',
      columns: 3,
      alignment: 'center',
      gap: 32,
      theme: 'light',
      disableColorAlternation: false,
      smartMode: true,
      cardStyle: {
        border: true,
        shadow: 'sm',
        glass: false,
        borderRadius: 'xl',
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
      showRating: true,
      showRole: true,
      showCompany: true,
      showAvatar: true,
      sectionButton: { text: '', url: '', target: '_self' }
    },
    schema: [
      { name: 'title', label: 'Título', type: 'text', category: 'content' },
      { name: 'subtitle', label: 'Subtítulo', type: 'textarea', category: 'content' },
      ...TYPOGRAPHY_PROPS('title', 'Estilo Título'),
      ...TYPOGRAPHY_PROPS('subtitle', 'Estilo Subtítulo'),
      
      { 
        name: 'layoutType', 
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
        name: 'cardStyle',
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
            name: 'borderRadius', 
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
      BUTTON_GROUP_PROPS('sectionButton', 'Botón de Sección (Final)'),
      { name: 'showRating', label: 'Mostrar Estrellas', type: 'boolean', category: 'content' },
      { name: 'showAvatar', label: 'Mostrar Fotos', type: 'boolean', category: 'content' },
      { name: 'showRole', label: 'Mostrar Cargo', type: 'boolean', category: 'content' },
      { name: 'showCompany', label: 'Mostrar Empresa', type: 'boolean', category: 'content' },
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
      billingCycle: 'monthly',
      smartMode: true,
      disableColorAlternation: false,
      plans: [
        { 
          name: 'Básico', 
          monthlyPrice: '$19', 
          annualPrice: '$15',
          description: 'Ideal para proyectos personales y freelancers.',
          features: [{ text: '1 Proyecto' }, { text: 'Soporte Email' }, { text: 'Actualizaciones básicas' }] 
        },
        { 
          name: 'Pro', 
          monthlyPrice: '$49', 
          annualPrice: '$39',
          description: 'Para negocios en crecimiento que necesitan más potencia.',
          features: [{ text: 'Proyectos Ilimitados' }, { text: 'Soporte 24/7' }, { text: 'Dominio Personalizado' }, { text: 'Analíticas Avanzadas' }], 
          popular: true 
        },
        { 
          name: 'Enterprise', 
          monthlyPrice: '$99', 
          annualPrice: '$79',
          description: 'Soluciones a medida para grandes organizaciones.',
          features: [{ text: 'Todo lo de Pro' }, { text: 'Gestor de cuenta dedicado' }, { text: 'SLA garantizado' }, { text: 'Seguridad avanzada' }] 
        }
      ]
    },
    schema: [
      // Editor de textos (Prioridad 1)
      { name: 'title', label: 'Título', type: 'text', category: 'content' },
      ...TYPOGRAPHY_PROPS('title', 'Estilo Título').map(p => ({ ...p, category: 'content' })),
      { name: 'subtitle', label: 'Subtítulo', type: 'textarea', category: 'content' },
      ...TYPOGRAPHY_PROPS('subtitle', 'Estilo Subtítulo').map(p => ({ ...p, category: 'content' })),

      { 
        name: 'billingCycle', 
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
          { name: 'monthlyPrice', label: 'Precio Mensual', type: 'text' },
          { name: 'annualPrice', label: 'Precio Anual (por mes)', type: 'text' },
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
      titleStyle: { size: 'h2', weight: '700', align: 'center' },
      subtitleStyle: { size: 'p', weight: '400', align: 'center' },
      layoutType: 'split', // split, center, map-immersive, sidebar
      theme: 'light',
      disableColorAlternation: false,
      email: 'contacto@ejemplo.com',
      phone: '+1 234 567 890',
      address: 'Calle Principal 123, Madrid',
      showMap: true,
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3037.365346083684!2d-3.706058684603912!3d40.41670467936526!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd42287d6da32a33%3A0x1d752f992d918152!2sPuerta%20del%20Sol!5e0!3m2!1ses!2ses!4v1647948345678!5m2!1ses!2ses',
      formTitle: 'Envíanos un mensaje',
      showNameField: true,
      showEmailField: true,
      showPhoneField: false,
      showSubjectField: false,
      showMessageField: true,
      buttonText: 'Enviar Mensaje',
      successMessage: '¡Gracias! Hemos recibido tu mensaje.',
      socialLinks: [
        { platform: 'linkedin', url: '#' },
        { platform: 'twitter', url: '#' },
        { platform: 'instagram', url: '#' }
      ]
    },
    schema: [
      // Editor de textos (Prioridad 1)
      { name: 'title', label: 'Título Principal', type: 'text', category: 'content' },
      ...TYPOGRAPHY_PROPS('title', 'Estilo Título').map(p => ({ ...p, category: 'content' })),
      { name: 'subtitle', label: 'Subtítulo', type: 'textarea', category: 'content' },
      ...TYPOGRAPHY_PROPS('subtitle', 'Estilo Subtítulo').map(p => ({ ...p, category: 'content' })),

      { 
        name: 'layoutType', 
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
      
      { name: 'showMap', label: 'Mostrar Mapa', type: 'boolean', category: 'content' },
      { name: 'mapUrl', label: 'URL del Mapa (Embed)', type: 'text', category: 'content' },
      
      { name: 'formTitle', label: 'Título del Formulario', type: 'text', category: 'content' },
      { name: 'showNameField', label: 'Campo Nombre', type: 'boolean', category: 'content' },
      { name: 'showEmailField', label: 'Campo Email', type: 'boolean', category: 'content' },
      { name: 'showPhoneField', label: 'Campo Teléfono', type: 'boolean', category: 'content' },
      { name: 'showSubjectField', label: 'Campo Asunto', type: 'boolean', category: 'content' },
      { name: 'showMessageField', label: 'Campo Mensaje', type: 'boolean', category: 'content' },
      { name: 'buttonText', label: 'Texto del Botón', type: 'text', category: 'content' },
      { name: 'successMessage', label: 'Mensaje de Éxito', type: 'text', category: 'content' },
      
      { 
        name: 'socialLinks', 
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
      smartMode: true,
      disableColorAlternation: false,
      logos: [
        { name: 'Empresa 1', url: 'https://placehold.co/200x80?text=LOGO+1' },
        { name: 'Empresa 2', url: 'https://placehold.co/200x80?text=LOGO+2' },
        { name: 'Empresa 3', url: 'https://placehold.co/200x80?text=LOGO+3' },
        { name: 'Empresa 4', url: 'https://placehold.co/200x80?text=LOGO+4' },
        { name: 'Empresa 5', url: 'https://placehold.co/200x80?text=LOGO+5' }
      ],
      grayscale: true,
      opacity: 50
    },
    schema: [
      // Editor de textos (Prioridad 1)
      { name: 'title', label: 'Título', type: 'text', category: 'content' },
      ...TYPOGRAPHY_PROPS('title', 'Estilo Título').map(p => ({ ...p, category: 'content' })),

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
      smartMode: true,
      disableColorAlternation: false,
      stat1: { value: '99%', label: 'Satisfacción' },
      stat2: { value: '24/7', label: 'Soporte Real' }
    },
    schema: [
      // Editor de textos (Prioridad 1)
      { name: 'badge', label: 'Etiqueta (Badge)', type: 'text', category: 'content' },
      { name: 'title', label: 'Título', type: 'text', category: 'content' },
      ...TYPOGRAPHY_PROPS('title', 'Estilo Título').map(p => ({ ...p, category: 'content' })),
      { name: 'description', label: 'Descripción', type: 'textarea', category: 'content' },
      ...TYPOGRAPHY_PROPS('description', 'Estilo Descripción').map(p => ({ ...p, category: 'content' })),

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
      smartMode: true,
      disableColorAlternation: false,
      steps: [
        { step: '01', title: 'Regístrate', desc: 'Crea tu cuenta en segundos y accede al panel.' },
        { step: '02', title: 'Configura', desc: 'Personaliza tus preferencias y sincroniza tus datos.' },
        { step: '03', title: 'Lanza', desc: 'Publica tu sitio y empieza a recibir clientes.' }
      ]
    },
    schema: [
      // Editor de textos (Prioridad 1)
      { name: 'title', label: 'Título', type: 'text', category: 'content' },
      ...TYPOGRAPHY_PROPS('title', 'Estilo Título').map(p => ({ ...p, category: 'content' })),
      { name: 'subtitle', label: 'Subtítulo', type: 'textarea', category: 'content' },
      ...TYPOGRAPHY_PROPS('subtitle', 'Estilo Subtítulo').map(p => ({ ...p, category: 'content' })),

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
      smartMode: true,
      disableColorAlternation: false,
      titleStyle: { size: 'h2', weight: '700', align: 'center' },
      stats: [
        { val: '15k+', label: 'Usuarios' },
        { val: '40m', label: 'Ventas' },
        { val: '120', label: 'Países' },
        { val: '24/7', label: 'Soporte' }
      ]
    },
    schema: [
      // Editor de textos (Prioridad 1)
      { name: 'title', label: 'Título (Opcional)', type: 'text', category: 'content' },
      ...TYPOGRAPHY_PROPS('title', 'Estilo Título').map(p => ({ ...p, category: 'content' })),

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
    icon: ImageIcon,
    description: 'Muestra imágenes en un formato atractivo',
    category: 'main-content',
    defaultData: {
      title: 'Galería Visual',
      subtitle: 'Explora nuestro trabajo a través de imágenes.',
      titleStyle: { size: 'h2', weight: '700', align: 'center' },
      subtitleStyle: { size: 'p', weight: '400', align: 'center' },
      layoutType: 'grid',
      columns: 4,
      gap: 16,
      theme: 'light',
      disableColorAlternation: false,
      aspectRatio: 'square',
      images: [
        { url: 'https://picsum.photos/seed/gallery1/800/800', title: 'Proyecto Alpha', category: 'Diseño' },
        { url: 'https://picsum.photos/seed/gallery2/800/800', title: 'Branding Beta', category: 'Branding' },
        { url: 'https://picsum.photos/seed/gallery3/800/800', title: 'Web Gamma', category: 'Web' },
        { url: 'https://picsum.photos/seed/gallery4/800/800', title: 'App Delta', category: 'Mobile' },
        { url: 'https://picsum.photos/seed/gallery5/800/800', title: 'Photo Epsilon', category: 'Foto' },
        { url: 'https://picsum.photos/seed/gallery6/800/800', title: 'Art Zeta', category: 'Arte' }
      ],
      showFilters: true,
      showOverlay: true,
      overlayStyle: 'hover', // hover, always
      hoverEffect: 'zoom', // zoom, grayscale, tilt, none
      borderRadius: 'xl',
      showViewAllButton: true,
      viewAllButtonText: 'Ver Todo',
      viewAllButtonUrl: '#'
    },
    schema: [
      // Editor de textos (Prioridad 1)
      { name: 'title', label: 'Título', type: 'text', category: 'content' },
      ...TYPOGRAPHY_PROPS('title', 'Estilo Título').map(p => ({ ...p, category: 'content' })),
      { name: 'subtitle', label: 'Subtítulo', type: 'textarea', category: 'content' },
      ...TYPOGRAPHY_PROPS('subtitle', 'Estilo Subtítulo').map(p => ({ ...p, category: 'content' })),

      { 
        name: 'layoutType', 
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
        name: 'aspectRatio', 
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
        name: 'borderRadius', 
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
        name: 'hoverEffect', 
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
      { name: 'showOverlay', label: 'Mostrar Info al Pasar Mouse', type: 'boolean', category: 'content' },
      { name: 'showFilters', label: 'Mostrar Filtros de Categoría', type: 'boolean', category: 'content' },
      
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
      { name: 'showViewAllButton', label: 'Mostrar Botón "Ver Todo"', type: 'boolean', category: 'content' },
      { name: 'viewAllButtonText', label: 'Texto del botón Ver Todo', type: 'text', category: 'content' },
      { name: 'viewAllButtonUrl', label: 'URL Botón Ver Todo', type: 'text', category: 'content' },
      
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
      titleStyle: { size: 'h2', weight: '700', align: 'center' },
      subtitleStyle: { size: 'p', weight: '400', align: 'center' },
      layoutType: 'classic', // classic, hero, split, popup
      theme: 'dark',
      disableColorAlternation: false,
      videoType: 'youtube', // youtube, vimeo, custom
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      posterImage: 'https://picsum.photos/seed/video-poster/1280/720',
      autoplay: false,
      muted: false,
      loop: false,
      showControls: true,
      showOverlay: true,
      overlayTitle: 'Video Promocional',
      showPlayButton: true,
      playButtonStyle: 'solid', // solid, outline, glass
      maskShape: 'none', // none, rounded, circle, blob
      showTranscription: false,
      transcriptionText: 'Aquí va la transcripción del video...',
      showCta: false,
      ctaText: 'Empezar Ahora',
      ctaUrl: '#'
    },
    schema: [
      // Editor de textos (Prioridad 1)
      { name: 'title', label: 'Título', type: 'text', category: 'content' },
      ...TYPOGRAPHY_PROPS('title', 'Estilo Título').map(p => ({ ...p, category: 'content' })),
      { name: 'subtitle', label: 'Subtítulo', type: 'textarea', category: 'content' },
      ...TYPOGRAPHY_PROPS('subtitle', 'Estilo Subtítulo').map(p => ({ ...p, category: 'content' })),

      { 
        name: 'layoutType', 
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
        name: 'videoType', 
        label: 'Fuente de Video', 
        type: 'select', 
        category: 'content',
        options: [
          { label: 'YouTube', value: 'youtube' },
          { label: 'Vimeo', value: 'vimeo' },
          { label: 'Archivo Directo (.mp4)', value: 'custom' }
        ]
      },
      { name: 'videoUrl', label: 'URL del Video', type: 'text', category: 'content' },
      { name: 'posterImage', label: 'Imagen de Portada (Poster)', type: 'image', category: 'content' },
      
      { name: 'autoplay', label: 'Autoplay (Silenciado)', type: 'boolean', category: 'content' },
      { name: 'muted', label: 'Silenciar por defecto', type: 'boolean', category: 'content' },
      { name: 'loop', label: 'Repetir en bucle', type: 'boolean', category: 'content' },
      { name: 'showControls', label: 'Mostrar Controles', type: 'boolean', category: 'content' },
      
      { name: 'showPlayButton', label: 'Mostrar Botón Play', type: 'boolean', category: 'design' },
      { 
        name: 'playButtonStyle', 
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
        name: 'maskShape', 
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
      
      { name: 'showTranscription', label: 'Mostrar Transcripción', type: 'boolean', category: 'content' },
      { name: 'transcriptionText', label: 'Texto Transcripción', type: 'textarea', category: 'content' },
      
      { name: 'showCta', label: 'Mostrar Botón Final', type: 'boolean', category: 'content' },
      { name: 'ctaText', label: 'Texto Botón', type: 'text', category: 'content' },
      { name: 'ctaUrl', label: 'URL Botón', type: 'text', category: 'content' },
      
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
      titleStyle: { size: 'h2', weight: '700', align: 'center' },
      subtitleStyle: { size: 'p', weight: '400', align: 'center' },
      layoutType: 'center', // center, split, slim, popup
      theme: 'dark',
      disableColorAlternation: false,
      backgroundImage: '',
      showNameField: false,
      emailPlaceholder: 'tu@email.com',
      namePlaceholder: 'Tu nombre',
      buttonText: 'Suscribirme',
      successMessage: '¡Gracias por suscribirte! Revisa tu correo.',
      disclaimer: 'Prometemos no enviar spam. Puedes darte de baja en cualquier momento.',
      showDisclaimer: true
    },
    schema: [
      // Editor de textos (Prioridad 1)
      { name: 'title', label: 'Título', type: 'text', category: 'content' },
      ...TYPOGRAPHY_PROPS('title', 'Estilo Título').map(p => ({ ...p, category: 'content' })),
      { name: 'subtitle', label: 'Subtítulo', type: 'textarea', category: 'content' },
      ...TYPOGRAPHY_PROPS('subtitle', 'Estilo Subtítulo').map(p => ({ ...p, category: 'content' })),

      { 
        name: 'layoutType', 
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
      
      { name: 'backgroundImage', label: 'Imagen de Fondo', type: 'image', category: 'design' },
      
      { name: 'showNameField', label: 'Pedir Nombre', type: 'boolean', category: 'content' },
      { name: 'emailPlaceholder', label: 'Placeholder Email', type: 'text', category: 'content' },
      { name: 'namePlaceholder', label: 'Placeholder Nombre', type: 'text', category: 'content' },
      { name: 'buttonText', label: 'Texto Botón', type: 'text', category: 'content' },
      { name: 'successMessage', label: 'Mensaje de Éxito', type: 'text', category: 'content' },
      
      { name: 'showDisclaimer', label: 'Mostrar Disclaimer', type: 'boolean', category: 'content' },
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
      titleStyle: { size: 'h2', weight: '700', align: 'center' },
      subtitleStyle: { size: 'p', weight: '400', align: 'center' },
      layoutType: 'center',
      theme: 'dark',
      disableColorAlternation: false,
      primaryButton: { text: 'Comenzar Ahora', url: '#', target: '_self' },
      secondaryButton: { text: 'Saber más', url: '#', target: '_self' },
      showSecondaryButton: true,
      showAppBadges: false,
      showNewsletter: false,
      microCopy: 'No requiere tarjeta de crédito. 14 días de prueba.',
      showMicroCopy: true,
      showChecklist: false,
      checklist: [
        { text: 'Configuración instantánea' },
        { text: 'Soporte 24/7' },
        { text: 'Cancelación en cualquier momento' }
      ],
      backgroundImage: '',
      backgroundStyle: 'solid', // solid, gradient, mesh, image
      mockupImage: '',
      showMockup: false
    },
    schema: [
      // Editor de textos (Prioridad 1)
      { name: 'title', label: 'Título Principal', type: 'text', category: 'content' },
      ...TYPOGRAPHY_PROPS('title', 'Estilo Título').map(p => ({ ...p, category: 'content' })),
      { name: 'subtitle', label: 'Subtítulo', type: 'textarea', category: 'content' },
      ...TYPOGRAPHY_PROPS('subtitle', 'Estilo Subtítulo').map(p => ({ ...p, category: 'content' })),

      { 
        name: 'layoutType', 
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
        name: 'backgroundStyle',
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
      { name: 'backgroundImage', label: 'Imagen de Fondo', type: 'image', category: 'design' },
      
      BUTTON_GROUP_PROPS('primaryButton', 'Botón Primario'),
      { name: 'showSecondaryButton', label: 'Mostrar Botón Secundario', type: 'boolean', category: 'content' },
      BUTTON_GROUP_PROPS('secondaryButton', 'Botón Secundario'),
      
      { name: 'showAppBadges', label: 'Mostrar Badges de App Store', type: 'boolean', category: 'content' },
      { name: 'showNewsletter', label: 'Mostrar Captura de Email', type: 'boolean', category: 'content' },
      
      { name: 'showMicroCopy', label: 'Mostrar Texto de Confianza', type: 'boolean', category: 'content' },
      { name: 'microCopy', label: 'Texto de Confianza (Micro-copy)', type: 'text', category: 'content' },
      
      { name: 'showChecklist', label: 'Mostrar Checklist', type: 'boolean', category: 'content' },
      {
        name: 'checklist',
        label: 'Puntos de Checklist',
        type: 'array',
        category: 'content',
        itemSchema: [
          { name: 'text', label: 'Texto', type: 'text' }
        ]
      },
      
      { name: 'showMockup', label: 'Mostrar Mockup de Producto', type: 'boolean', category: 'design' },
      { name: 'mockupImage', label: 'Imagen del Mockup', type: 'image', category: 'design' },
      
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
      smartMode: true,
      disableColorAlternation: false,
      items: [
        { name: 'Ana Silva', role: 'CEO & Fundadora' },
        { name: 'Carlos Ruiz', role: 'Director Técnico' },
        { name: 'Laura Gómez', role: 'Diseñadora Principal' },
        { name: 'Miguel Ángel', role: 'Líder de Marketing' }
      ]
    },
    schema: [
      { name: 'title', label: 'Título', type: 'text', category: 'content' },
      { name: 'subtitle', label: 'Subtítulo', type: 'textarea', category: 'content' },
      ...TYPOGRAPHY_PROPS('title', 'Estilo Título'),
      ...TYPOGRAPHY_PROPS('subtitle', 'Estilo Subtítulo'),
      
      { 
        name: 'smartMode', 
        label: 'Modo Inteligente', 
        type: 'boolean',
        category: 'design'
      },
      { 
        name: 'items', 
        label: 'Miembros', 
        type: 'array',
        category: 'content',
        itemSchema: [
          { name: 'name', label: 'Nombre', type: 'text' },
          { name: 'role', label: 'Cargo', type: 'text' },
          { name: 'image', label: 'Foto', type: 'image' }
        ]
      },
      ...DESIGN_PROPS.map(p => ({ ...p, category: 'design' as const }))
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
      smartMode: true,
      items: [
        { q: '¿Cómo funciona la sincronización con Solutium?', a: 'Es automática. Una vez conectas tu cuenta, todos tus productos y leads se sincronizan en tiempo real.' },
        { q: '¿Puedo usar mi propio dominio?', a: 'Sí, en el plan Pro y superiores puedes conectar cualquier dominio que ya poseas.' },
        { q: '¿Ofrecen soporte técnico?', a: 'Por supuesto. Nuestro equipo está disponible 24/7 para ayudarte con cualquier duda o problema.' }
      ]
    },
    schema: [
      { name: 'title', label: 'Título', type: 'text', category: 'content' },
      { name: 'subtitle', label: 'Subtítulo', type: 'textarea', category: 'content' },
      ...TYPOGRAPHY_PROPS('title', 'Estilo Título'),
      ...TYPOGRAPHY_PROPS('subtitle', 'Estilo Subtítulo'),
      
      { 
        name: 'smartMode', 
        label: 'Modo Inteligente', 
        type: 'boolean',
        category: 'design'
      },
      { 
        name: 'items', 
        label: 'Preguntas', 
        type: 'array',
        category: 'content',
        itemSchema: [
          { name: 'q', label: 'Pregunta', type: 'text' },
          { name: 'a', label: 'Respuesta', type: 'textarea' }
        ]
      },
      ...DESIGN_PROPS.map(p => ({ ...p, category: 'design' as const }))
    ]
  },
  {
    id: 'footer',
    label: 'Pie de página',
    icon: PanelBottom,
    description: 'Sección final con enlaces legales y redes sociales',
    category: 'navigation',
    defaultData: {
      layoutType: 'columns', // columns, simple, centered, minimal
      theme: 'dark',
      smartMode: true,
      disableColorAlternation: false,
      logoText: 'Constructor Web',
      logoImage: 'https://solutium.app/logos-de-apps/solutium-constructor-web-imagotipo.png',
      description: 'Construyendo el futuro de la web. Soluciones inteligentes para negocios modernos.',
      copyright: '© 2024 Constructor Web. Todos los derechos reservados.',
      showSocialLinks: true,
      socialLinks: [
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
      showNewsletter: true,
      newsletterTitle: 'Suscríbete',
      newsletterText: 'Recibe las últimas noticias y actualizaciones.',
      bottomLinks: [
        { text: 'Privacidad', url: '#' },
        { text: 'Términos', url: '#' },
        { text: 'Cookies', url: '#' }
      ]
    },
    schema: [
      { name: 'logoText', label: 'Texto del logo', type: 'text', category: 'content' },
      { name: 'description', label: 'Descripción', type: 'textarea', category: 'content' },
      { name: 'copyright', label: 'Copyright', type: 'text', category: 'content' },
      ...TYPOGRAPHY_PROPS('logo', 'Estilo del texto del logo'),
      ...TYPOGRAPHY_PROPS('description', 'Estilo de la descripción'),
      
      { 
        name: 'layoutType', 
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
      { name: 'logoImage', label: 'Imagen del Logo', type: 'image', category: 'design' },
      
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
      
      { name: 'showSocialLinks', label: 'Mostrar Redes Sociales', type: 'boolean', category: 'content' },
      { 
        name: 'socialLinks', 
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
      
      { name: 'showNewsletter', label: 'Mostrar Newsletter', type: 'boolean', category: 'content' },
      { name: 'newsletterTitle', label: 'Título Newsletter', type: 'text', category: 'content' },
      { name: 'newsletterText', label: 'Texto Newsletter', type: 'textarea', category: 'content' },
      
      { 
        name: 'bottomLinks', 
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
      spacerType: 'smart',
      smartMode: true,
      disableColorAlternation: false,
      height: 40,
      lineStyle: 'solid',
      lineWidth: 100,
      lineColor: '#e2e8f0',
      lineThickness: 1,
      iconName: 'Star',
      labelText: 'SECCIÓN',
      shaperType: 'wave',
      patternType: 'dots',
      backgroundColor: 'transparent'
    },
    schema: [
      {
        name: 'smartMode',
        label: 'Modo Inteligente',
        type: 'boolean',
        category: 'design'
      },
      {
        name: 'spacerType',
        label: 'Tipo de Espaciador',
        type: 'select',
        category: 'design',
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
      { name: 'backgroundColor', label: 'Color de Fondo del Bloque', type: 'color', category: 'design' },
      
      // Smart Spacer
      { name: 'height', label: 'Altura (px)', type: 'range', min: 0, max: 200, step: 1, category: 'design' },
      
      // Line / Icon / Label common
      { name: 'lineWidth', label: 'Ancho (%)', type: 'range', min: 10, max: 100, step: 1, category: 'design' },
      { name: 'lineThickness', label: 'Grosor (px)', type: 'range', min: 1, max: 10, step: 1, category: 'design' },
      { name: 'lineColor', label: 'Color de Línea/Elemento', type: 'color', category: 'design' },
      { 
        name: 'lineStyle', 
        label: 'Estilo de Línea', 
        type: 'select',
        category: 'design',
        options: [
          { label: 'Sólida', value: 'solid' },
          { label: 'Discontinua', value: 'dashed' },
          { label: 'Punteada', value: 'dotted' }
        ]
      },
      
      // Icon specific
      { name: 'iconName', label: 'Nombre del Icono (ej: Star, Heart, Zap)', type: 'text', category: 'content' },
      
      // Label specific
      { name: 'labelText', label: 'Texto del Divisor', type: 'text', category: 'content' },
      
      // Shaper specific
      { 
        name: 'shaperType', 
        label: 'Tipo de Forma', 
        type: 'select',
        category: 'design',
        options: [
          { label: 'Onda', value: 'wave' },
          { label: 'Curva', value: 'curve' },
          { label: 'Diagonal', value: 'diagonal' }
        ]
      },
      
      // Pattern specific
      { 
        name: 'patternType', 
        label: 'Tipo de Patrón', 
        type: 'select',
        category: 'design',
        options: [
          { label: 'Puntos', value: 'dots' },
          { label: 'Líneas', value: 'stripes' }
        ]
      },
      
      ...DESIGN_PROPS.map(p => ({ ...p, category: 'design' as const }))
    ]
  }
];

export const getModuleDefinition = (type: string) => {
  return MODULE_REGISTRY.find(m => m.id === type);
};
