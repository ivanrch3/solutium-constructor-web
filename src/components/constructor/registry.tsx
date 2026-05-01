import React from 'react';
import { 
  PanelTop,
  Menu,
  PanelBottom,
  SeparatorHorizontal,
  Sparkles,
  ListChecks,
  Info,
  Workflow,
  Images,
  PlayCircle,
  Quote,
  MessageCircleQuestion,
  Handshake,
  ShoppingBag,
  MousePointerClick,
  Tags,
  Send,
  BarChart3,
  PhoneCall,
  Users2,
  FileText, 
  Type, 
  User, 
  Layers, 
  PlusCircle, 
  CheckCircle2, 
  Database, 
  HelpCircle, 
  Users, 
  CreditCard, 
  Mail,
  Zap,
  Shield,
  Headphones,
  Smartphone,
  TrendingUp,
  Check,
  Search,
  PenTool,
  Rocket,
  Plus,
  Clock,
  Award,
  Heart,
  Linkedin,
  Twitter,
  Instagram,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Image as ImageIcon,
  Video,
  Monitor,
  Layout,
  RotateCcw,
  Columns2
} from 'lucide-react';
import { WebModule, SettingGroupType, SettingDefinition } from '../../types/constructor';

const HIGHLIGHT_SETTINGS = (prefix: string = 'title'): SettingDefinition[] => [
  { id: `${prefix}_highlight_type`, label: 'Tipo de Resaltado (**texto**)', type: 'select', defaultValue: 'gradient', options: [
    { label: 'Ninguno', value: 'none' },
    { label: 'Color Sólido', value: 'solid' },
    { label: 'Degradado', value: 'gradient' }
  ]},
  { id: `${prefix}_highlight_color`, label: 'Color de Resaltado', type: 'color', defaultValue: '#3B82F6', showIf: { settingId: `${prefix}_highlight_type`, value: 'solid' } },
  { id: `${prefix}_highlight_gradient`, label: 'Degradado de Resaltado', type: 'gradient', defaultValue: 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)', showIf: { settingId: `${prefix}_highlight_type`, value: 'gradient' } },
  { id: `${prefix}_highlight_bold`, label: 'Resaltado en Black', type: 'boolean', defaultValue: true, showIf: { settingId: `${prefix}_highlight_type`, value: 'none', operator: 'neq' } }
];

const BUTTON_LINK_SETTINGS = (prefix: string, defaultUrl: string = '#'): SettingDefinition[] => [
  { id: `${prefix}_link_type`, label: 'Tipo de Enlace', type: 'select', defaultValue: 'external', options: [
    { label: 'Página Externa / URL', value: 'external' },
    { label: 'Sección Interna (Ancla)', value: 'internal' }
  ]},
  { id: `${prefix}_url`, label: 'URL / Sección', type: 'text', defaultValue: defaultUrl, description: 'Usa #id para secciones internas' },
  { id: `${prefix}_target`, label: 'Abrir en', type: 'select', defaultValue: '_self', options: [
    { label: 'Misma Pestaña', value: '_self' },
    { label: 'Nueva Pestaña', value: '_blank' }
  ]}
];

const PARALLAX_BACKGROUND_SETTINGS: SettingDefinition[] = [
  { id: 'bg_parallax_enabled', label: 'Habilitar Fondo con Paralaje', type: 'boolean', defaultValue: false },
  { id: 'bg_parallax_img', label: 'Imagen de Fondo', type: 'image', defaultValue: '', showIf: { settingId: 'bg_parallax_enabled', value: true } },
  { id: 'bg_parallax_opacity', label: 'Opacidad Imagen', type: 'range', defaultValue: 20, min: 0, max: 100, unit: '%', showIf: { settingId: 'bg_parallax_enabled', value: true } },
  { id: 'bg_parallax_overlay', label: 'Color de Overlay', type: 'color', defaultValue: '#000000', showIf: { settingId: 'bg_parallax_enabled', value: true } },
  { id: 'bg_parallax_speed', label: 'Intensidad de Movimiento', type: 'range', defaultValue: 100, min: 20, max: 300, unit: 'px', showIf: { settingId: 'bg_parallax_enabled', value: true } }
];

export const HEADER_MODULE: WebModule = {
  id: 'mod_header_1',
  type: 'conversion',
  iconKey: 'header',
  name: 'Barra Superior',
  globalGroups: ['estructura', 'estilo', 'interaccion'],
  globalSettings: {
    estructura: [
      { id: 'position', label: 'Posición', type: 'select', defaultValue: 'sticky', options: [
        { label: 'Fijo al Scroll (Sticky)', value: 'sticky' },
        { label: 'Fijo Superior (Fixed)', value: 'fixed' },
        { label: 'Estático', value: 'static' }
      ]},
      { id: 'layout_type', label: 'Distribución', type: 'select', defaultValue: 'standard', options: [
        { label: 'Estándar (Centro - Acciones)', value: 'standard' },
        { label: 'Split (Izquierda - Derecha)', value: 'split' },
        { label: 'Compacto', value: 'compact' }
      ]}
    ],
    estilo: [
      { id: 'dark_mode', label: 'Modo Oscuro', type: 'boolean', defaultValue: false },
      { id: 'bg_type', label: 'Tipo de Fondo', type: 'select', defaultValue: 'glass', options: [
        { label: 'Sólido', value: 'solid' },
        { label: 'Glassmorphism', value: 'glass' },
        { label: 'Gradiente Animado', value: 'gradient_anim' },
        { label: 'Transparente', value: 'transparent' }
      ]},
      { id: 'bg_color', label: 'Color de Fondo', type: 'color', defaultValue: '#FFFFFF' },
      { id: 'accent_color', label: 'Color de Acento', type: 'color', defaultValue: '#3B82F6' },
      { id: 'border_color', label: 'Color de Borde', type: 'color', defaultValue: 'rgba(0,0,0,0.05)' },
      { id: 'shadow', label: 'Sombra', type: 'select', defaultValue: 'sm', options: [
        { label: 'Ninguna', value: 'none' },
        { label: 'Suave', value: 'sm' },
        { label: 'Fuerte', value: 'lg' }
      ]}
    ],
    interaccion: [
      { id: 'shrink_on_scroll', label: 'Reducir al hacer Scroll', type: 'boolean', defaultValue: true },
      { id: 'entrance_anim', label: 'Animación de Entrada', type: 'boolean', defaultValue: true }
    ],
    contenido: [], tipografia: [], multimedia: []
  },
  elements: [
    { id: 'el_header_marquee', name: 'Anuncios (Marquee)', type: 'text', groups: ['contenido', 'estilo', 'interaccion', 'tipografia'], settings: {
      contenido: [
        { id: 'show_marquee', label: 'Mostrar Anuncios', type: 'boolean', defaultValue: true },
        { id: 'messages', label: 'Mensajes', type: 'repeater', defaultValue: [{text: '¡Envío gratis hoy!'}, {text: '10% OFF en tu primera compra'}], fields: [
          { id: 'text', label: 'Texto', type: 'text', defaultValue: 'Anuncio' },
          { id: 'icon', label: 'Icono', type: 'icon', defaultValue: 'Sparkles' }
        ]}
      ],
      estilo: [
        { id: 'bg_color', label: 'Fondo Marquee', type: 'color', defaultValue: '#3B82F6' },
        { id: 'text_color', label: 'Color Texto', type: 'color', defaultValue: '#FFFFFF' }
      ],
      interaccion: [
        { id: 'speed', label: 'Velocidad', type: 'range', defaultValue: 30, min: 10, max: 100 },
        { id: 'direction', label: 'Dirección', type: 'select', defaultValue: 'left', options: [
          { label: 'Izquierda', value: 'left' },
          { label: 'Derecha', value: 'right' }
        ]},
        { id: 'gap', label: 'Espacio entre mensajes', type: 'range', defaultValue: 48, min: 20, max: 120, unit: 'px' },
        { id: 'pause_on_hover', label: 'Pausar al pasar mouse', type: 'boolean', defaultValue: true }
      ],
      tipografia: [
        { id: 'font_size', label: 'Tamaño Fuente', type: 'typography_size', defaultValue: 's', allowedLevels: ['p', 's'] },
        { id: 'font_weight', label: 'Grosor', type: 'font_weight', defaultValue: 'extrabold' }
      ],
      estructura: [], multimedia: []
    }},
    { id: 'el_header_quick_reg', name: 'Registro Rápido', type: 'text', groups: ['contenido', 'estilo', 'estructura'], settings: {
      contenido: [
        { id: 'show_reg', label: 'Mostrar Registro', type: 'boolean', defaultValue: false },
        { id: 'placeholder', label: 'Placeholder Email', type: 'text', defaultValue: 'Tu email para el cupón...' },
        { id: 'btn_text', label: 'Texto Botón', type: 'text', defaultValue: 'Obtener 10%' }
      ],
      estilo: [
        { id: 'input_bg', label: 'Fondo Input', type: 'color', defaultValue: '#F1F5F9' },
        { id: 'btn_bg', label: 'Fondo Botón', type: 'color', defaultValue: '#3B82F6' },
        { id: 'btn_color', label: 'Color Texto Botón', type: 'color', defaultValue: '#FFFFFF' }
      ],
      estructura: [
        { id: 'width', label: 'Ancho Máximo', type: 'range', defaultValue: 300, min: 200, max: 500, unit: 'px' }
      ],
      tipografia: [], multimedia: [], interaccion: []
    }},
    { id: 'el_header_actions', name: 'Llamados a la Acción', type: 'style', groups: ['contenido', 'estilo', 'interaccion'], settings: {
      contenido: [
        { id: 'show_actions', label: 'Mostrar Acciones', type: 'boolean', defaultValue: true },
        { id: 'primary_btn_text', label: 'Botón Principal', type: 'text', defaultValue: 'Reservar' },
        ...BUTTON_LINK_SETTINGS('primary'),
        { id: 'secondary_btn_text', label: 'Botón Secundario', type: 'text', defaultValue: 'WhatsApp' },
        ...BUTTON_LINK_SETTINGS('secondary')
      ],
      estilo: [
        { id: 'primary_bg', label: 'Fondo Principal', type: 'color', defaultValue: '#3B82F6' },
        { id: 'primary_color', label: 'Texto Principal', type: 'color', defaultValue: '#FFFFFF' },
        { id: 'secondary_style', label: 'Estilo Secundario', type: 'select', defaultValue: 'outline', options: [{label:'Sólido', value:'solid'}, {label:'Contorno', value:'outline'}]}
      ],
      interaccion: [
        { id: 'pulse_effect', label: 'Efecto Pulso (Principal)', type: 'boolean', defaultValue: true },
        { id: 'hover_anim', label: 'Animación Hover', type: 'select', defaultValue: 'scale', options: [{label:'Escala', value:'scale'}, {label:'Brillo', value:'glow'}]}
      ],
      estructura: [], tipografia: [], multimedia: []
    }}
  ]
};

export const MENU_MODULE: WebModule = {
  id: 'mod_menu_1',
  type: 'navegacion',
  iconKey: 'menu',
  name: 'Menú',
  globalGroups: ['estructura', 'estilo', 'interaccion'],
  globalSettings: {
    estructura: [
      { id: 'position', label: 'Posición', type: 'select', defaultValue: 'relative', options: [
        { label: 'Estándar (Sigue el scroll)', value: 'relative' },
        { label: 'Fijo al scroll (Sticky)', value: 'sticky' },
        { label: 'Fijo al tope (Fixed)', value: 'fixed' }
      ]},
      { id: 'layout', label: 'Diseño', type: 'select', defaultValue: 'horizontal', options: [
        { label: 'Horizontal (Barra)', value: 'horizontal' },
        { label: 'Vertical (Lista)', value: 'vertical' }
      ]},
      { id: 'invert_order', label: 'Invertir Orden (Logo a la derecha)', type: 'boolean', defaultValue: false, showIf: { settingId: 'layout', value: 'horizontal' } },
      { id: 'align', label: 'Alineación', type: 'select', defaultValue: 'center', options: [
        { label: 'Inicio', value: 'start' },
        { label: 'Centro', value: 'center' },
        { label: 'Fin', value: 'end' }
      ]},
      { id: 'gap', label: 'Espaciado entre items', type: 'range', defaultValue: 24, min: 0, max: 64, unit: 'px' },
      { id: 'padding_y', label: 'Padding Vertical', type: 'range', defaultValue: 20, min: 0, max: 100, unit: 'px' },
      { id: 'desktop_hamburger', label: 'Usar Menú Hamburguesa en Escritorio', type: 'boolean', defaultValue: false }
    ],
    estilo: [
      { id: 'dark_mode', label: 'Modo Oscuro', type: 'boolean', defaultValue: false },
      { id: 'bg_color', label: 'Fondo del Contenedor', type: 'color', defaultValue: 'transparent' },
      { id: 'glass_effect', label: 'Efecto Glassmorphism', type: 'boolean', defaultValue: false },
      { id: 'border_radius', label: 'Redondeado', type: 'range', defaultValue: 12, min: 0, max: 40 }
    ],
    interaccion: [
      { id: 'entrance_anim', label: 'Animación de Entrada', type: 'boolean', defaultValue: true }
    ],
    contenido: [], tipografia: [], multimedia: []
  },
  elements: [
    { id: 'el_menu_logo', name: 'Identidad', type: 'multimedia', groups: ['contenido', 'multimedia', 'estructura', 'tipografia'], settings: {
      contenido: [
        { id: 'logo_type', label: 'Tipo de Logo', type: 'select', defaultValue: 'image', options: [{label:'Imagen', value:'image'}, {label:'Texto', value:'text'}]},
        { id: 'logo_text', label: 'Texto del Logo', type: 'text', defaultValue: 'MI MARCA', showIf: { settingId: 'logo_type', value: 'text' } }
      ],
      multimedia: [
        { id: 'logo_img', label: 'Imagen de Logo', type: 'image', defaultValue: '', showIf: { settingId: 'logo_type', value: 'image' } },
        { id: 'logo_img_alt', label: 'Logo Secundario', type: 'image', defaultValue: '', showIf: { settingId: 'logo_type', value: 'image' } }
      ],
      estructura: [
        { id: 'logo_width', label: 'Ancho del Logo', type: 'range', defaultValue: 120, min: 40, max: 240, unit: 'px', showIf: { settingId: 'logo_type', value: 'image' } }
      ],
      tipografia: [
        { id: 'font_size', label: 'Tamaño Texto Logo', type: 'typography_size', defaultValue: 't3', allowedLevels: ['t2', 't3', 'p'], showIf: { settingId: 'logo_type', value: 'text' } },
        { id: 'font_weight', label: 'Grosor', type: 'font_weight', defaultValue: 'extrabold', showIf: { settingId: 'logo_type', value: 'text' } },
        { id: 'text_color', label: 'Color de Texto', type: 'color', defaultValue: '#0F172A', showIf: { settingId: 'logo_type', value: 'text' } }
      ],
      estilo: [], interaccion: []
    }},
    { id: 'el_menu_items', name: 'Lista de Enlaces', type: 'text', groups: ['contenido', 'tipografia', 'multimedia'], settings: {
      contenido: [
        { 
          id: 'links', 
          label: 'Enlaces', 
          type: 'repeater', 
          defaultValue: [],
          disableAdd: true,
          fields: [
            { id: 'label', label: 'Etiqueta', type: 'text', defaultValue: 'Enlace' },
            { id: 'url', label: 'URL / Ancla (#)', type: 'text', defaultValue: '#' },
            { id: 'icon', label: 'Icono', type: 'icon', defaultValue: '' },
            { id: 'badge', label: 'Badge', type: 'text', defaultValue: '' }
          ]
        }
      ],
      tipografia: [
        { id: 'font_size', label: 'Tamaño Fuente', type: 'typography_size', defaultValue: 'p', allowedLevels: ['t3', 'p', 's'] },
        { id: 'font_weight', label: 'Grosor', type: 'font_weight', defaultValue: 'semibold' },
        { id: 'text_color', label: 'Color de Texto', type: 'color', defaultValue: '#0F172A' },
        { id: 'text_align', label: 'Alineación', type: 'text_align', defaultValue: 'left' },
        { id: 'text_decoration', label: 'Decoración', type: 'text_decoration', defaultValue: [] }
      ],
      multimedia: [
        { id: 'show_icons', label: 'Mostrar Iconos', type: 'boolean', defaultValue: true },
        { id: 'icon_size', label: 'Tamaño Iconos', type: 'range', defaultValue: 18, min: 14, max: 24 }
      ],
      estilo: [], estructura: [], interaccion: []
    }},
    { id: 'el_menu_style', name: 'Estilo de Interacción', type: 'style', groups: ['estilo', 'interaccion'], settings: {
      estilo: [
        { id: 'hover_style', label: 'Estilo Hover', type: 'select', defaultValue: 'pill', options: [
          { label: 'Fondo (Pill)', value: 'pill' },
          { label: 'Línea Inferior', value: 'underline' },
          { label: 'Texto Color', value: 'color' }
        ]},
        { id: 'hover_bg', label: 'Color Fondo Hover', type: 'color', defaultValue: 'rgba(0,0,0,0.05)' },
        { id: 'active_color', label: 'Color Activo', type: 'color', defaultValue: '#3B82F6' }
      ],
      interaccion: [
        { id: 'hover_scale', label: 'Efecto Escala', type: 'boolean', defaultValue: true }
      ],
      contenido: [], tipografia: [], multimedia: [], estructura: []
    }}
  ]
};

export const FOOTER_MODULE: WebModule = {
  id: 'mod_footer_1',
  type: 'footer',
  iconKey: 'footer',
  name: 'Pie de página',
  globalGroups: ['estructura', 'estilo'],
  globalSettings: {
    estructura: [
      { id: 'padding_y', label: 'Padding Vertical', type: 'range', defaultValue: 80, min: 40, max: 160, unit: 'px' },
      { id: 'max_width', label: 'Ancho Máximo', type: 'range', defaultValue: 1400, min: 1000, max: 1920, unit: 'px' }
    ],
    estilo: [
      { id: 'dark_mode', label: 'Modo Oscuro', type: 'boolean', defaultValue: false },
      { id: 'bg_color', label: 'Color de Fondo', type: 'color', defaultValue: '#F8FAFC' },
      { id: 'text_color', label: 'Color de Texto', type: 'color', defaultValue: '#475569' },
      { id: 'border_top', label: 'Borde Superior', type: 'boolean', defaultValue: true },
      { id: 'border_color', label: 'Color de Borde', type: 'color', defaultValue: '#E2E8F0' }
    ],
    contenido: [], tipografia: [], multimedia: [], interaccion: []
  },
  elements: [
    { id: 'el_footer_brand', name: 'Identidad', type: 'multimedia', groups: ['contenido', 'multimedia', 'estructura', 'tipografia'], settings: {
      contenido: [
        { id: 'show_logo', label: 'Mostrar Logo', type: 'boolean', defaultValue: true },
        { id: 'bio', label: 'Biografía / Descripción', type: 'text', defaultValue: 'Creamos soluciones digitales innovadoras para impulsar el crecimiento de tu negocio en la era moderna.' }
      ],
      multimedia: [
        { id: 'logo_img', label: 'Imagen de Logo', type: 'image', defaultValue: '' }
      ],
      estructura: [
        { id: 'logo_width', label: 'Ancho del Logo', type: 'range', defaultValue: 120, min: 40, max: 240, unit: 'px' }
      ],
      tipografia: [
        { id: 'font_size', label: 'Tamaño Bio', type: 'typography_size', defaultValue: 's', allowedLevels: ['p', 's'] },
        { id: 'font_weight', label: 'Grosor', type: 'font_weight', defaultValue: 'normal' },
        { id: 'text_align', label: 'Alineación', type: 'text_align', defaultValue: 'left' }
      ],
      estilo: [], interaccion: []
    }},
    { id: 'el_footer_nav', name: 'Columnas de Navegación', type: 'text', groups: ['contenido', 'tipografia'], settings: {
      contenido: [
        { 
          id: 'columns', 
          label: 'Columnas', 
          type: 'repeater', 
          defaultValue: [
            { title: '**Producto**', links: [{label: 'Características', url: '#'}, {label: 'Precios', url: '#'}] },
            { title: '**Compañía**', links: [{label: 'Sobre Nosotros', url: '#'}, {label: 'Carreras', url: '#'}] }
          ],
          fields: [
            { id: 'title', label: 'Título de Columna', type: 'text', defaultValue: 'Categoría' },
            { 
              id: 'links', 
              label: 'Enlaces', 
              type: 'repeater', 
              defaultValue: [{label: 'Enlace', url: '#'}],
              fields: [
                { id: 'label', label: 'Etiqueta', type: 'text', defaultValue: 'Enlace' },
                { id: 'url', label: 'URL', type: 'text', defaultValue: '#' }
              ]
            }
          ]
        }
      ],
      tipografia: [
        { id: 'title_size', label: 'Tamaño Título', type: 'typography_size', defaultValue: 'p', allowedLevels: ['t3', 'p'] },
        { id: 'title_weight', label: 'Grosor Título', type: 'font_weight', defaultValue: 'extrabold' },
        ...HIGHLIGHT_SETTINGS('title'),
        { id: 'link_size', label: 'Tamaño Enlaces', type: 'typography_size', defaultValue: 's', allowedLevels: ['p', 's'] },
        { id: 'link_weight', label: 'Grosor Enlaces', type: 'font_weight', defaultValue: 'normal' }
      ],
      estilo: [], estructura: [], multimedia: [], interaccion: []
    }},
    { id: 'el_footer_social', name: 'Redes Sociales', type: 'multimedia', groups: ['contenido', 'estilo'], settings: {
      contenido: [
        { 
          id: 'social_links', 
          label: 'Redes Sociales', 
          type: 'repeater', 
          defaultValue: [
            {icon: 'Twitter', url: '#'},
            {icon: 'Instagram', url: '#'},
            {icon: 'Linkedin', url: '#'}
          ],
          fields: [
            { id: 'icon', label: 'Icono', type: 'icon', defaultValue: 'Link' },
            { id: 'url', label: 'URL', type: 'text', defaultValue: '#' }
          ]
        }
      ],
      estilo: [
        { id: 'icon_color', label: 'Color de Iconos', type: 'color', defaultValue: '#64748B' },
        { id: 'icon_hover', label: 'Color Hover', type: 'color', defaultValue: '#3B82F6' }
      ],
      estructura: [], tipografia: [], multimedia: [], interaccion: []
    }},
    { id: 'el_footer_contact', name: 'Información de Contacto', type: 'text', groups: ['contenido', 'estilo'], settings: {
      contenido: [
        { id: 'show_contact', label: 'Mostrar Contacto', type: 'boolean', defaultValue: true },
        { id: 'address', label: 'Dirección', type: 'text', defaultValue: 'Calle Innovación 123, Ciudad Digital' },
        { id: 'phone', label: 'Teléfono', type: 'text', defaultValue: '+1 (555) 000-0000' },
        { id: 'email', label: 'Email', type: 'text', defaultValue: 'hola@mimarca.com' }
      ],
      estilo: [
        { id: 'icon_color', label: 'Color de Iconos', type: 'color', defaultValue: '#3B82F6' }
      ],
      estructura: [], tipografia: [], multimedia: [], interaccion: []
    }},
    { id: 'el_footer_newsletter', name: 'Newsletter', type: 'text', groups: ['contenido', 'estilo', 'interaccion', 'tipografia'], settings: {
      contenido: [
        { id: 'show_newsletter', label: 'Mostrar Newsletter', type: 'boolean', defaultValue: true },
        { id: 'news_title', label: 'Título', type: 'text', defaultValue: '**Suscríbete**' },
        { id: 'news_desc', label: 'Descripción', type: 'text', defaultValue: 'Recibe las últimas noticias y ofertas.' },
        { id: 'placeholder', label: 'Placeholder', type: 'text', defaultValue: 'Tu email' },
        { id: 'btn_text', label: 'Texto Botón', type: 'text', defaultValue: 'Unirse' }
      ],
      tipografia: [
        { id: 'title_size', label: 'Tamaño Título', type: 'typography_size', defaultValue: 'p', allowedLevels: ['t3', 'p'] },
        { id: 'title_weight', label: 'Grosor Título', type: 'font_weight', defaultValue: 'extrabold' },
        ...HIGHLIGHT_SETTINGS('title'),
        { id: 'desc_size', label: 'Tamaño Descripción', type: 'typography_size', defaultValue: 's', allowedLevels: ['p', 's'] },
        { id: 'text_align', label: 'Alineación', type: 'text_align', defaultValue: 'left' }
      ],
      estilo: [
        { id: 'input_bg', label: 'Fondo Input', type: 'color', defaultValue: '#FFFFFF' },
        { id: 'btn_bg', label: 'Fondo Botón', type: 'color', defaultValue: '#3B82F6' },
        { id: 'btn_color', label: 'Color Texto Botón', type: 'color', defaultValue: '#FFFFFF' }
      ],
      interaccion: [
        { id: 'success_msg', label: 'Mensaje de Éxito', type: 'text', defaultValue: '¡Gracias por suscribirte!' }
      ],
      estructura: [], multimedia: []
    }},
    { id: 'el_footer_bottom', name: 'Barra Inferior', type: 'text', groups: ['contenido', 'estilo', 'tipografia'], settings: {
      contenido: [
        { id: 'copyright', label: 'Texto Copyright', type: 'text', defaultValue: '© 2026 Mi Marca. Todos los derechos reservados.' },
        { 
          id: 'legal_links', 
          label: 'Enlaces Legales', 
          type: 'repeater', 
          defaultValue: [
            {label: 'Privacidad', url: '#'},
            {label: 'Términos', url: '#'},
            {label: 'Cookies', url: '#'}
          ],
          fields: [
            { id: 'label', label: 'Etiqueta', type: 'text', defaultValue: 'Enlace' },
            { id: 'url', label: 'URL', type: 'text', defaultValue: '#' }
          ]
        }
      ],
      tipografia: [
        { id: 'font_size', label: 'Tamaño Texto', type: 'typography_size', defaultValue: 's', allowedLevels: ['p', 's'] },
        { id: 'font_weight', label: 'Grosor', type: 'font_weight', defaultValue: 'normal' },
        { id: 'text_align', label: 'Alineación', type: 'text_align', defaultValue: 'center' }
      ],
      estilo: [
        { id: 'bottom_bg', label: 'Fondo Barra Inferior', type: 'color', defaultValue: 'transparent' }
      ],
      estructura: [], multimedia: [], interaccion: []
    }}
  ]
};

export const SPACER_MODULE: WebModule = {
  id: 'mod_spacer_1',
  type: 'spacer',
  iconKey: 'spacer',
  name: 'Espaciador y Divisor',
  globalGroups: ['estructura', 'estilo', 'multimedia'],
  globalSettings: {
    estructura: [
      { id: 'height_desktop', label: 'Altura (Escritorio)', type: 'range', defaultValue: 60, min: 0, max: 200, unit: 'px' },
      { id: 'height_mobile', label: 'Altura (Móvil)', type: 'range', defaultValue: 40, min: 0, max: 200, unit: 'px' },
      { id: 'width', label: 'Ancho del Divisor', type: 'range', defaultValue: 100, min: 5, max: 100, unit: '%' },
      { id: 'align', label: 'Alineación', type: 'select', defaultValue: 'center', options: [
        { label: 'Inicio', value: 'start' },
        { label: 'Centro', value: 'center' },
        { label: 'Fin', value: 'end' }
      ]}
    ],
    estilo: [
      { id: 'dark_mode', label: 'Modo Oscuro', type: 'boolean', defaultValue: false },
      { id: 'type', label: 'Tipo de Divisor', type: 'select', defaultValue: 'none', options: [
        { label: 'Solo Espacio', value: 'none' },
        { label: 'Línea Sólida', value: 'solid' },
        { label: 'Línea Punteada', value: 'dotted' },
        { label: 'Línea con Guiones', value: 'dashed' }
      ]},
      { id: 'thickness', label: 'Grosor de Línea', type: 'range', defaultValue: 2, min: 1, max: 10, unit: 'px' },
      { id: 'color', label: 'Color de Línea', type: 'color', defaultValue: '#E2E8F0' },
      { id: 'bg_color', label: 'Color de Fondo de Bloque', type: 'color', defaultValue: 'transparent' },
      { id: 'show_content', label: 'Mostrar Icono/Texto', type: 'boolean', defaultValue: false },
      { id: 'content_type', label: 'Tipo de Contenido', type: 'select', defaultValue: 'icon', options: [
        { label: 'Icono', value: 'icon' },
        { label: 'Texto', value: 'text' }
      ]},
      { id: 'icon', label: 'Icono', type: 'icon', defaultValue: 'Star' },
      { id: 'text', label: 'Texto Central', type: 'text', defaultValue: 'SECCIÓN' },
      { id: 'content_size', label: 'Tamaño Contenido', type: 'range', defaultValue: 18, min: 10, max: 40, unit: 'px' },
      { id: 'content_color', label: 'Color Contenido', type: 'color', defaultValue: '#94A3B8' }
    ],
    multimedia: [...PARALLAX_BACKGROUND_SETTINGS],
    contenido: [], tipografia: [], interaccion: []
  },
  elements: []
};

export const PRODUCTS_MODULE: WebModule = {
  id: 'mod_products_1',
  type: 'products',
  iconKey: 'products',
  name: 'Productos Premium',
  globalGroups: ['contenido', 'estructura', 'estilo', 'interaccion'],
  globalSettings: {
    contenido: [],
    estructura: [
      { id: 'layout', label: 'Diseño de Visualización', type: 'select', defaultValue: 'grid', options: [
        { label: 'Grilla Clásica', value: 'grid' },
        { label: 'Carrusel (Slider)', value: 'carousel' },
        { label: 'Lista Detallada', value: 'list' }
      ]},
      { id: 'columns', label: 'Columnas (Desktop)', type: 'range', defaultValue: 4, min: 1, max: 6 },
      { id: 'gap', label: 'Espaciado entre productos', type: 'range', defaultValue: 24, min: 0, max: 80, unit: 'px' },
      { id: 'padding_y', label: 'Padding Vertical', type: 'range', defaultValue: 100, min: 40, max: 200, unit: 'px' }
    ],
    estilo: [
      { id: 'dark_mode', label: 'Modo Oscuro', type: 'boolean', defaultValue: false },
      { id: 'bg_color', label: 'Color de Fondo', type: 'color', defaultValue: '#FFFFFF' },
      { id: 'section_gradient', label: 'Gradiente de Fondo', type: 'boolean', defaultValue: false },
      { id: 'bg_gradient', label: 'Gradiente Personalizado', type: 'gradient', defaultValue: 'linear-gradient(to bottom, #FFFFFF, #F8FAFC)' }
    ],
    interaccion: [
      { id: 'entrance_anim', label: 'Animación de Entrada', type: 'boolean', defaultValue: true },
      { id: 'enable_quickview', label: 'Habilitar Vista Rápida', type: 'boolean', defaultValue: true },
      { id: 'show_pagination', label: 'Mostrar Paginación (Carrusel)', type: 'boolean', defaultValue: true },
      { id: 'show_urgency', label: 'Mostrar Indicadores de Urgencia', type: 'boolean', defaultValue: false },
      { id: 'show_stock_bar', label: 'Mostrar Barra de Stock', type: 'boolean', defaultValue: false }
    ],
    tipografia: [
      { id: 'title_size', label: 'Tamaño Título Sección', type: 'typography_size', defaultValue: 't2' },
      { id: 'title_weight', label: 'Peso Título Sección', type: 'font_weight', defaultValue: 'black' },
      ...HIGHLIGHT_SETTINGS('title')
    ],
    multimedia: []
  },
  elements: [
    { 
      id: 'el_products_header', 
      name: 'Textos', 
      type: 'text', 
      groups: ['title', 'subtitle', 'estructura'],
      settings: {
        title: [
          { id: 'title', label: 'Título de la Sección', type: 'text', defaultValue: 'Nuestros **Productos**' },
          { id: 'title_size', label: 'Tamaño', type: 'typography_size', defaultValue: 't2', allowedLevels: ['t1', 't2', 't3'] },
          { id: 'title_weight', label: 'Peso', type: 'font_weight', defaultValue: 'black' },
          ...HIGHLIGHT_SETTINGS('title')
        ],
        subtitle: [
          { id: 'subtitle', label: 'Descripción', type: 'text', defaultValue: 'Descubre nuestra selección exclusiva de productos.' },
          { id: 'subtitle_size', label: 'Tamaño', type: 'typography_size', defaultValue: 'p', allowedLevels: ['t3', 'p', 's'] },
          { id: 'subtitle_weight', label: 'Peso', type: 'font_weight', defaultValue: 'normal' },
          ...HIGHLIGHT_SETTINGS('subtitle')
        ],
        estructura: [
          { id: 'align', label: 'Alineación', type: 'select', defaultValue: 'center', options: [
            { label: 'Izquierda', value: 'left' },
            { label: 'Centro', value: 'center' },
            { label: 'Derecha', value: 'right' }
          ]},
          { id: 'margin_b', label: 'Margen Inferior', type: 'range', defaultValue: 60, min: 20, max: 120 }
        ],
        multimedia: [], interaccion: []
      }
    },
    {
      id: 'el_products_config',
      name: 'Configuración de Selección',
      type: 'style',
      groups: ['contenido'],
      settings: {
        contenido: [
          { id: 'selection_mode', label: 'Modo de Selección', type: 'select', defaultValue: 'manual', options: [
            { label: 'Manual (Selección)', value: 'manual' },
            { label: 'Automático (Recientes)', value: 'auto' }
          ]},
          { id: 'select_products', label: 'Selección de Productos', type: 'product_selection', defaultValue: [] },
          { id: 'show_tabs', label: 'Mostrar Pestañas de Categoría', type: 'boolean', defaultValue: true }
        ],
        estilo: [], estructura: [], tipografia: [], multimedia: [], interaccion: []
      }
    },
    { 
      id: 'el_img', 
      name: 'Imagen del Producto', 
      type: 'image', 
      groups: ['multimedia', 'estilo', 'interaccion'],
      settings: {
        multimedia: [
          { id: 'aspect_ratio', label: 'Proporción', type: 'select', defaultValue: '1:1', options: [
            { label: '1:1 (Cuadrado)', value: '1:1' },
            { label: '4:5 (Retrato)', value: '4:5' },
            { label: '16:9 (Panorámico)', value: '16:9' }
          ]},
          { id: 'hover_swap', label: 'Cambiar imagen en hover', type: 'boolean', defaultValue: true },
          { id: 'badge_color', label: 'Color de Etiquetas', type: 'color', defaultValue: '#3B82F6' }
        ],
        estilo: [
          { id: 'border_radius', label: 'Redondeo', type: 'range', defaultValue: 16, min: 0, max: 50, unit: 'px' }
        ],
        interaccion: [
          { id: 'hover_effect', label: 'Efecto Hover', type: 'select', defaultValue: 'zoom', options: [
            { label: 'Zoom Suave', value: 'zoom' },
            { label: 'Lupa (Scale)', value: 'scale' },
            { label: 'Ninguno', value: 'none' }
          ]}
        ],
        contenido: [], estructura: [], tipografia: []
      }
    },
    { 
      id: 'el_product_card', 
      name: 'Estilo de Tarjeta', 
      type: 'style', 
      groups: ['estilo', 'interaccion'],
      settings: {
        estilo: [
          { id: 'card_style', label: 'Estilo Visual', type: 'select', defaultValue: 'solid', options: [
            { label: 'Sólido', value: 'solid' },
            { label: 'Glassmorphism', value: 'glass' },
            { label: 'Minimalista', value: 'minimal' },
            { label: 'Bordeado', value: 'bordered' }
          ]},
          { id: 'card_bg', label: 'Fondo de Tarjeta', type: 'color', defaultValue: '#FFFFFF' },
          { id: 'card_shadow', label: 'Sombra', type: 'select', defaultValue: 'sm', options: [
            { label: 'Ninguna', value: 'none' },
            { label: 'Suave', value: 'sm' },
            { label: 'Fuerte', value: 'lg' }
          ]}
        ],
        interaccion: [
          { id: 'hover_lift', label: 'Elevar al pasar mouse', type: 'boolean', defaultValue: true }
        ],
        contenido: [], estructura: [], tipografia: [], multimedia: []
      }
    },
    { 
      id: 'el_title', 
      name: 'Título del Producto', 
      type: 'text', 
      groups: ['tipografia', 'estilo'],
      settings: {
        tipografia: [
          { id: 'font_size', label: 'Tamaño de Fuente', type: 'typography_size', defaultValue: 'p', allowedLevels: ['t3', 'p', 's'] },
          { id: 'font_weight', label: 'Grosor', type: 'font_weight', defaultValue: 'extrabold' },
          { id: 'text_align', label: 'Alineación', type: 'text_align', defaultValue: 'left' }
        ],
        estilo: [
          { id: 'title_color', label: 'Color de Título', type: 'color', defaultValue: '#0F172A' }
        ],
        contenido: [], estructura: [], multimedia: [], interaccion: []
      }
    },
    { 
      id: 'el_price', 
      name: 'Precio y Ofertas', 
      type: 'price', 
      groups: ['contenido', 'tipografia', 'estilo'],
      settings: {
        contenido: [
          { id: 'currency', label: 'Moneda', type: 'text', defaultValue: '$' },
          { id: 'show_savings', label: 'Mostrar % de Ahorro', type: 'boolean', defaultValue: true }
        ],
        tipografia: [
          { id: 'price_size', label: 'Tamaño del Precio', type: 'typography_size', defaultValue: 't3', allowedLevels: ['t2', 't3', 'p'] },
          { id: 'price_weight', label: 'Grosor', type: 'font_weight', defaultValue: 'extrabold' }
        ],
        estilo: [
          { id: 'price_color', label: 'Color de Precio', type: 'color', defaultValue: '#0F172A' },
          { id: 'sale_color', label: 'Color de Oferta', type: 'color', defaultValue: '#EF4444' }
        ],
        estructura: [], multimedia: [], interaccion: []
      }
    },
    { id: 'el_cta', name: 'Botón de Compra', type: 'button', groups: ['contenido', 'estilo', 'interaccion'], settings: {
      contenido: [
        { id: 'cta_text', label: 'Texto del Botón', type: 'text', defaultValue: 'Añadir' },
        { id: 'show_icon', label: 'Mostrar Icono Carrito', type: 'boolean', defaultValue: true }
      ],
      estilo: [
        { id: 'cta_bg', label: 'Fondo Botón', type: 'color', defaultValue: '#0F172A' },
        { id: 'cta_color', label: 'Color Texto', type: 'color', defaultValue: '#FFFFFF' },
        { id: 'cta_radius', label: 'Redondeado', type: 'range', defaultValue: 12, min: 0, max: 30 }
      ],
      interaccion: [
        { id: 'cta_hover_bg', label: 'Fondo Hover', type: 'color', defaultValue: '#2563EB' }
      ],
      estructura: [], tipografia: [], multimedia: []
    }}
  ]
};

export const HERO_MODULE: WebModule = {
  id: 'mod_hero_1',
  type: 'hero',
  iconKey: 'hero',
  name: 'Sección Hero (Impacto)',
  globalGroups: ['contenido', 'estructura', 'estilo', 'interaccion', 'multimedia'],
  globalSettings: {
    contenido: [],
    estructura: [
      { id: 'layout', label: 'Diseño de Layout', type: 'select', defaultValue: 'split', options: [
        { label: 'Dividido (Texto + Imagen)', value: 'split' },
        { label: 'Centrado (Impacto)', value: 'center' },
        { label: 'Invertido (Imagen + Texto)', value: 'reverse' },
        { label: 'Fondo Completo', value: 'full_bg' }
      ]},
      { id: 'height', label: 'Altura de Sección', type: 'select', defaultValue: 'screen', options: [
        { label: 'Pantalla Completa (100vh)', value: 'screen' },
        { label: 'Grande (80vh)', value: 'large' },
        { label: 'Mediana (60vh)', value: 'medium' },
        { label: 'Automática', value: 'auto' }
      ]},
      { id: 'max_width', label: 'Ancho Máximo Contenido', type: 'range', defaultValue: 1200, min: 800, max: 1600, unit: 'px' }
    ],
    estilo: [
      { id: 'dark_mode', label: 'Modo Oscuro', type: 'boolean', defaultValue: false },
      { id: 'bg_type', label: 'Tipo de Fondo', type: 'select', defaultValue: 'color', options: [
        { label: 'Color Sólido', value: 'color' },
        { label: 'Gradiente', value: 'gradient' },
        { label: 'Imagen', value: 'image' },
        { label: 'Video', value: 'video' }
      ]},
      { id: 'bg_color', label: 'Color de Fondo', type: 'color', defaultValue: '#FFFFFF', showIf: { settingId: 'bg_type', value: 'color' } },
      { id: 'bg_gradient', label: 'Gradiente', type: 'gradient', defaultValue: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)', showIf: { settingId: 'bg_type', value: 'gradient' } },
      { id: 'overlay_color', label: 'Color de Overlay', type: 'color', defaultValue: '#000000', showIf: { settingId: 'bg_type', value: ['image', 'video'] } },
      { id: 'overlay_opacity', label: 'Opacidad Overlay', type: 'range', defaultValue: 0, min: 0, max: 100, unit: '%', showIf: { settingId: 'bg_type', value: ['image', 'video'] } },
      { id: 'show_pattern', label: 'Mostrar Patrón de Puntos', type: 'boolean', defaultValue: true },
      { id: 'show_blobs', label: 'Mostrar Blobs Decorativos', type: 'boolean', defaultValue: true }
    ],
    interaccion: [
      { id: 'scroll_indicator', label: 'Indicador de Scroll', type: 'boolean', defaultValue: true },
      { id: 'scroll_text', label: 'Texto de Scroll', type: 'text', defaultValue: 'SCROLL' },
      { id: 'entrance_anim', label: 'Animación de Entrada', type: 'select', defaultValue: 'fade_up', options: [
        { label: 'Desvanecer Arriba', value: 'fade_up' },
        { label: 'Revelar Lados', value: 'reveal' },
        { label: 'Zoom Suave', value: 'zoom' }
      ]}
    ],
    multimedia: [...PARALLAX_BACKGROUND_SETTINGS],
    tipografia: []
  },
  elements: [
    { id: 'el_hero_typography', name: 'Textos', type: 'text', groups: ['eyebrow', 'title', 'subtitle', 'texto_rotativo', 'estructura'], settings: {
      eyebrow: [
        { id: 'eyebrow', label: 'Texto de la Cejilla', type: 'text', defaultValue: 'NUEVA SOLUCIÓN' },
        { id: 'eyebrow_color', label: 'Color de Texto', type: 'color', defaultValue: '#3B82F6' },
        { id: 'eyebrow_bg', label: 'Color de Fondo', type: 'color', defaultValue: 'rgba(59, 130, 246, 0.1)' }
      ],
      title: [
        { id: 'title', label: 'Texto del Título', type: 'text', defaultValue: 'Solutium es **la mejor alternativa** para tu negocio' },
        { id: 'title_size', label: 'Tamaño', type: 'typography_size', defaultValue: 't1', allowedLevels: ['t1', 't2', 't3'] },
        { id: 'title_weight', label: 'Peso', type: 'font_weight', defaultValue: 'extrabold' },
        ...HIGHLIGHT_SETTINGS('title')
      ],
      subtitle: [
        { id: 'subtitle', label: 'Texto del Subtítulo', type: 'text', defaultValue: 'Impulsamos el **éxito** de emprendedores y empresas con soluciones digitales innovadoras y personalizadas.' },
        { id: 'subtitle_size', label: 'Tamaño', type: 'typography_size', defaultValue: 'p', allowedLevels: ['t3', 'p', 's'] },
        { id: 'subtitle_weight', label: 'Peso', type: 'font_weight', defaultValue: 'normal' },
        ...HIGHLIGHT_SETTINGS('subtitle')
      ],
      texto_rotativo: [
        { id: 'rotating_enabled', label: 'Habilitar Título Rotativo', type: 'boolean', defaultValue: true },
        { id: 'rotating_fixed', label: 'Parte Fija', type: 'text', defaultValue: 'Solutium es la mejor alternativa para ', showIf: { settingId: 'rotating_enabled', value: true } },
        { id: 'rotating_options', label: 'Opciones que Cambian', type: 'repeater', defaultValue: [{text: 'emprendedores'}, {text: 'profesionales'}, {text: 'empresas'}], fields: [
          { id: 'text', label: 'Frase', type: 'text', defaultValue: 'Nueva opción' }
        ], showIf: { settingId: 'rotating_enabled', value: true } },
        { id: 'rotating_anim', label: 'Tipo de Animación', type: 'select', defaultValue: 'fade', options: [
          { label: 'Desvanecer (Fade)', value: 'fade' },
          { label: 'Deslizar (Slide)', value: 'slide' }
        ], showIf: { settingId: 'rotating_enabled', value: true } },
        { id: 'rotating_speed', label: 'Velocidad de Cambio', type: 'range', defaultValue: 3000, min: 1000, max: 10000, unit: 'ms', step: 500, showIf: { settingId: 'rotating_enabled', value: true } },
        { id: 'rotating_color', label: 'Color Texto Dinámico', type: 'color', defaultValue: '#3B82F6', showIf: { settingId: 'rotating_enabled', value: true } },
        { id: 'rotating_gradient', label: 'Degradado Texto Dinámico', type: 'gradient', defaultValue: 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)', showIf: { settingId: 'rotating_enabled', value: true } }
      ],
      estructura: [
        { id: 'align', label: 'Alineación', type: 'select', defaultValue: 'inherit', options: [
          { label: 'Heredar de Layout', value: 'inherit' },
          { label: 'Izquierda', value: 'left' },
          { label: 'Centro', value: 'center' },
          { label: 'Derecha', value: 'right' }
        ]},
        { id: 'margin_b', label: 'Margen Inferior', type: 'range', defaultValue: 0, min: 0, max: 100, unit: 'px' }
      ]
    }},
    { id: 'el_hero_media', name: 'Multimedia Principal', type: 'multimedia', groups: ['multimedia', 'estilo', 'estructura', 'interaccion'], settings: {
      multimedia: [
        { id: 'media_type', label: 'Tipo', type: 'select', defaultValue: 'image', options: [{label:'Imagen', value:'image'}, {label:'Video', value:'video'}]},
        { id: 'image', label: 'Imagen', type: 'image', defaultValue: 'https://picsum.photos/seed/hero/1200/800', showIf: { settingId: 'media_type', value: 'image' } },
        { id: 'video_url', label: 'URL Video (MP4)', type: 'text', defaultValue: '', showIf: { settingId: 'media_type', value: 'video' } }
      ],
      estilo: [
        { id: 'border_radius', label: 'Redondeado', type: 'range', defaultValue: 24, min: 0, max: 60 },
        { id: 'shadow', label: 'Sombra', type: 'select', defaultValue: 'lg', options: [{label:'Ninguna', value:'none'}, {label:'Suave', value:'sm'}, {label:'Fuerte', value:'lg'}]}
      ],
      estructura: [
        { id: 'object_fit', label: 'Ajuste', type: 'select', defaultValue: 'cover', options: [{label:'Cubrir', value:'cover'}, {label:'Contener', value:'contain'}]},
        { id: 'perspective', label: 'Perspectiva 3D', type: 'range', defaultValue: 1000, min: 0, max: 2000 },
        { id: 'rotation_y', label: 'Rotación Y (Grados)', type: 'range', defaultValue: 15, min: -45, max: 45 }
      ],
      interaccion: [
        { id: 'floating_anim', label: 'Animación Flotante', type: 'boolean', defaultValue: true }
      ],
      contenido: [], tipografia: []
    }},
    { id: 'el_hero_ctas', name: 'Llamados a la Acción', type: 'button', groups: ['contenido', 'estilo', 'interaccion', 'estructura'], settings: {
      contenido: [
        { id: 'primary_text', label: 'Botón Primario', type: 'text', defaultValue: 'Comenzar Ahora' },
        { id: 'primary_icon', label: 'Icono Primario', type: 'icon', defaultValue: 'ArrowRight' },
        ...BUTTON_LINK_SETTINGS('primary'),
        { id: 'secondary_text', label: 'Botón Secundario', type: 'text', defaultValue: 'Saber Más' },
        { id: 'secondary_icon', label: 'Icono Secundario', type: 'icon', defaultValue: '' },
        ...BUTTON_LINK_SETTINGS('secondary')
      ],
      estilo: [
        { id: 'primary_bg', label: 'Fondo Primario', type: 'color', defaultValue: '#3B82F6' },
        { id: 'primary_color', label: 'Texto Primario', type: 'color', defaultValue: '#FFFFFF' },
        { id: 'secondary_style', label: 'Estilo Secundario', type: 'select', defaultValue: 'outline', options: [{label:'Sólido', value:'solid'}, {label:'Contorno', value:'outline'}]},
        { id: 'shimmer_effect', label: 'Efecto Shimmer', type: 'boolean', defaultValue: false }
      ],
      interaccion: [
        { id: 'hover_effect', label: 'Efecto Hover', type: 'select', defaultValue: 'lift', options: [{label:'Elevar', value:'lift'}, {label:'Brillo', value:'glow'}]},
        { id: 'pulse_effect', label: 'Efecto Pulso (Principal)', type: 'boolean', defaultValue: true }
      ],
      estructura: [
        { id: 'btn_radius', label: 'Redondeado Botones', type: 'range', defaultValue: 16, min: 0, max: 40 },
        { id: 'btn_width', label: 'Ancho (Mobile)', type: 'select', defaultValue: 'auto', options: [{label:'Automático', value:'auto'}, {label:'Ancho Completo', value:'full'}]}
      ],
      tipografia: [], multimedia: []
    }},
    { id: 'el_hero_social_proof', name: 'Prueba Social', type: 'text', groups: ['contenido', 'estructura', 'tipografia', 'multimedia'], settings: {
      contenido: [
        { id: 'show_proof', label: 'Mostrar Prueba Social', type: 'boolean', defaultValue: true },
        { id: 'proof_text', label: 'Texto', type: 'text', defaultValue: 'Confiado por +500 empresas' }
      ],
      estructura: [
        { id: 'margin_b', label: 'Margen Inferior', type: 'range', defaultValue: 0, min: 0, max: 100, unit: 'px' }
      ],
      multimedia: [
        { id: 'avatars', label: 'Avatares (Imágenes)', type: 'repeater', defaultValue: [], fields: [{id:'img', label:'Imagen', type:'image', defaultValue: ''}]}
      ],
      tipografia: [
        { id: 'font_size', label: 'Tamaño', type: 'typography_size', defaultValue: 's', allowedLevels: ['t3', 'p', 's'] },
        { id: 'font_weight', label: 'Peso', type: 'font_weight', defaultValue: 'extrabold' }
      ],
      estilo: [], interaccion: []
    }}
  ]
};

export const FEATURES_MODULE: WebModule = {
  id: 'mod_features_1',
  type: 'features',
  iconKey: 'features',
  name: 'Características y Beneficios',
  globalGroups: ['contenido', 'estructura', 'estilo', 'interaccion'],
  globalSettings: {
    contenido: [],
    estructura: [
      { id: 'layout', label: 'Diseño', type: 'select', defaultValue: 'grid', options: [
        { label: 'Grilla (Columnas)', value: 'grid' },
        { label: 'Lista con Iconos', value: 'list' },
        { label: 'Zig-Zag (Alternado)', value: 'zigzag' },
        { label: 'Mosaico (Bento)', value: 'bento' }
      ]},
      { id: 'columns', label: 'Columnas (Grilla)', type: 'range', defaultValue: 3, min: 1, max: 4 },
      { id: 'gap', label: 'Espaciado entre Tarjetas', type: 'range', defaultValue: 32, min: 16, max: 80, unit: 'px' },
      { id: 'padding_y', label: 'Padding Vertical', type: 'range', defaultValue: 100, min: 40, max: 200, unit: 'px' }
    ],
    estilo: [
      { id: 'dark_mode', label: 'Modo Oscuro', type: 'boolean', defaultValue: false },
      { id: 'bg_color', label: 'Color de Fondo', type: 'color', defaultValue: '#FFFFFF' },
      { id: 'section_gradient', label: 'Usar Gradiente de Fondo', type: 'boolean', defaultValue: false },
      { id: 'bg_gradient', label: 'Gradiente Personalizado', type: 'gradient', defaultValue: 'linear-gradient(to bottom, #FFFFFF, #F8FAFC)', showIf: { settingId: 'section_gradient', value: true } }
    ],
    interaccion: [
      { id: 'stagger_anim', label: 'Animación en Cascada', type: 'boolean', defaultValue: true }
    ],
    tipografia: [], multimedia: []
  },
  elements: [
    { id: 'el_features_header', name: 'Textos', type: 'text', groups: ['eyebrow', 'title', 'subtitle', 'estructura'], settings: {
      eyebrow: [
        { id: 'eyebrow', label: 'Texto de la Cejilla', type: 'text', defaultValue: 'CARACTERÍSTICAS' },
        { id: 'eyebrow_color', label: 'Color de Texto', type: 'color', defaultValue: '#3B82F6' },
        { id: 'eyebrow_bg', label: 'Color de Fondo', type: 'color', defaultValue: 'rgba(59, 130, 246, 0.1)' }
      ],
      title: [
        { id: 'title', label: 'Texto del Título', type: 'text', defaultValue: '¿Por qué **elegirnos**?' },
        { id: 'title_size', label: 'Tamaño', type: 'typography_size', defaultValue: 't2', allowedLevels: ['t1', 't2', 't3'] },
        { id: 'title_weight', label: 'Peso', type: 'font_weight', defaultValue: 'extrabold' },
        ...HIGHLIGHT_SETTINGS('title')
      ],
      subtitle: [
        { id: 'subtitle', label: 'Texto del Subtítulo', type: 'text', defaultValue: 'Soluciones diseñadas para escalar tu negocio al siguiente nivel.' },
        { id: 'subtitle_size', label: 'Tamaño', type: 'typography_size', defaultValue: 'p', allowedLevels: ['t3', 'p', 's'] },
        { id: 'subtitle_weight', label: 'Peso', type: 'font_weight', defaultValue: 'normal' },
        ...HIGHLIGHT_SETTINGS('subtitle')
      ],
      estructura: [
        { id: 'align', label: 'Alineación', type: 'select', defaultValue: 'center', options: [
          { label: 'Izquierda', value: 'left' },
          { label: 'Centro', value: 'center' },
          { label: 'Derecha', value: 'right' }
        ]},
        { id: 'margin_b', label: 'Margen Inferior', type: 'range', defaultValue: 80, min: 0, max: 120, unit: 'px' }
      ]
    }},
    { id: 'el_feature_card', name: 'Tarjetas de Características', type: 'repeater', groups: ['contenido', 'multimedia', 'estilo', 'tipografia', 'estructura'], settings: {
      contenido: [
        { 
          id: 'items', 
          label: 'Lista de Características', 
          type: 'repeater', 
          defaultValue: [
            { title: 'Velocidad Extrema', desc: 'Optimizado para cargar en menos de 1 segundo.', icon: 'Zap', media_type: 'icon' },
            { title: 'Seguridad Total', desc: 'Encriptación de grado militar en todos tus datos.', icon: 'Shield', media_type: 'icon' },
            { title: 'Soporte 24/7', desc: 'Equipo dedicado para ayudarte en cualquier momento.', icon: 'Headphones', media_type: 'icon' }
          ],
          fields: [
            { id: 'title', label: 'Título', type: 'text', defaultValue: 'Característica' },
            { id: 'desc', label: 'Descripción', type: 'text', defaultValue: 'Descripción corta del beneficio.' },
            { id: 'media_type', label: 'Tipo Multimedia', type: 'select', defaultValue: 'icon', options: [{label:'Icono', value:'icon'}, {label:'Imagen', value:'image'}] },
            { id: 'icon', label: 'Icono', type: 'icon', defaultValue: 'Star', showIf: { settingId: 'media_type', value: 'icon' } },
            { id: 'image', label: 'Imagen', type: 'image', defaultValue: 'https://picsum.photos/seed/feature/800/600', showIf: { settingId: 'media_type', value: 'image' } },
            ...BUTTON_LINK_SETTINGS('link', ''),
            { id: 'link_text', label: 'Texto Enlace', type: 'text', defaultValue: 'Saber más' }
          ]
        }
      ],
      multimedia: [
        { id: 'icon_style', label: 'Estilo de Icono', type: 'select', defaultValue: 'soft', options: [
          { label: 'Simple', value: 'simple' },
          { label: 'Fondo Suave', value: 'soft' },
          { label: 'Fondo Sólido', value: 'solid' },
          { label: 'Contorno', value: 'outline' }
        ]},
        { id: 'icon_size', label: 'Tamaño de Icono', type: 'range', defaultValue: 24, min: 16, max: 48 },
        { id: 'icon_color', label: 'Color de Icono', type: 'color', defaultValue: '#3B82F6' },
        { id: 'icon_bg', label: 'Fondo de Icono', type: 'color', defaultValue: 'rgba(59, 130, 246, 0.1)' },
        { id: 'icon_radius', label: 'Redondeado Icono', type: 'range', defaultValue: 12, min: 0, max: 30 }
      ],
      estilo: [
        { id: 'card_bg', label: 'Fondo Tarjeta', type: 'color', defaultValue: '#FFFFFF' },
        { id: 'card_border', label: 'Color de Borde', type: 'color', defaultValue: 'rgba(0,0,0,0.05)' },
        { id: 'card_shadow', label: 'Sombra', type: 'select', defaultValue: 'sm', options: [
          { label: 'Ninguna', value: 'none' },
          { label: 'Suave', value: 'sm' },
          { label: 'Media', value: 'md' },
          { label: 'Fuerte', value: 'lg' }
        ]},
        { id: 'hover_lift', label: 'Elevar al Hover', type: 'boolean', defaultValue: true }
      ],
      tipografia: [
        { id: 'title_size', label: 'Tamaño Título Card', type: 'typography_size', defaultValue: 't3', allowedLevels: ['t3', 'p', 's'] },
        { id: 'title_weight', label: 'Peso Título Card', type: 'font_weight', defaultValue: 'extrabold' },
        { id: 'desc_size', label: 'Tamaño Descripción', type: 'typography_size', defaultValue: 'p', allowedLevels: ['t3', 'p', 's'] },
        { id: 'desc_weight', label: 'Peso Descripción', type: 'font_weight', defaultValue: 'normal' },
        { id: 'text_align', label: 'Alineación Texto', type: 'text_align', defaultValue: 'inherit' }
      ],
      estructura: [
        { id: 'card_padding', label: 'Padding Interno', type: 'range', defaultValue: 32, min: 16, max: 60 },
        { id: 'card_radius', label: 'Redondeado Tarjeta', type: 'range', defaultValue: 24, min: 0, max: 60 }
      ],
      interaccion: []
    }}
  ]
};

export const ABOUT_MODULE: WebModule = {
  id: 'mod_about_1',
  type: 'about',
  iconKey: 'about',
  name: 'Sobre Nosotros / Historia',
  globalGroups: ['contenido', 'estructura', 'estilo', 'interaccion', 'multimedia'],
  globalSettings: {
    contenido: [],
    estructura: [
      { id: 'layout', label: 'Diseño', type: 'select', defaultValue: 'split_right', options: [
        { label: 'Dividido (Imagen Derecha)', value: 'split_right' },
        { label: 'Dividido (Imagen Izquierda)', value: 'split_left' },
        { label: 'Centrado', value: 'centered' },
        { label: 'Superpuesto (Overlapping)', value: 'overlapping' }
      ]},
      { id: 'content_width', label: 'Ancho Máximo Contenido', type: 'range', defaultValue: 1200, min: 800, max: 1600, unit: 'px' },
      { id: 'padding_y', label: 'Padding Vertical', type: 'range', defaultValue: 120, min: 40, max: 200, unit: 'px' }
    ],
    estilo: [
      { id: 'dark_mode', label: 'Modo Oscuro', type: 'boolean', defaultValue: false },
      { id: 'bg_color', label: 'Color de Fondo', type: 'color', defaultValue: '#FFFFFF' },
      { id: 'section_gradient', label: 'Gradiente de Fondo', type: 'boolean', defaultValue: false },
      { id: 'bg_gradient', label: 'Gradiente Personalizado', type: 'gradient', defaultValue: 'linear-gradient(to bottom, #FFFFFF, #F8FAFC)' },
      { id: 'show_decor', label: 'Mostrar Decoraciones', type: 'boolean', defaultValue: true }
    ],
    interaccion: [
      { id: 'entrance_anim', label: 'Animación de Entrada', type: 'boolean', defaultValue: true }
    ],
    multimedia: [...PARALLAX_BACKGROUND_SETTINGS],
    tipografia: []
  },
  elements: [
    { 
      id: 'el_about_narrative', 
      name: 'Textos', 
      type: 'content', 
      groups: ['eyebrow', 'title', 'description', 'estructura'],
      settings: {
        eyebrow: [
          { id: 'eyebrow', label: 'Cejilla (Eyebrow)', type: 'text', defaultValue: 'NUESTRA HISTORIA' },
          { id: 'eyebrow_color', label: 'Color Cejilla', type: 'color', defaultValue: '#3B82F6' }
        ],
        title: [
          { id: 'title', label: 'Título Principal', type: 'text', defaultValue: 'Pasión por la **excelencia** digital' },
          { id: 'title_size', label: 'Tamaño', type: 'typography_size', defaultValue: 't2', allowedLevels: ['t1', 't2', 't3'] },
          { id: 'title_weight', label: 'Peso', type: 'font_weight', defaultValue: 'extrabold' },
          ...HIGHLIGHT_SETTINGS('title'),
          { id: 'title_color', label: 'Color Título', type: 'color', defaultValue: '#0F172A' }
        ],
        description: [
          { id: 'description', label: 'Descripción Principal', type: 'text', defaultValue: 'Desde 2010, hemos ayudado a miles de empresas a navegar el complejo mundo digital con soluciones creativas y resultados medibles.' },
          { id: 'desc_size', label: 'Tamaño', type: 'typography_size', defaultValue: 'p', allowedLevels: ['t3', 'p', 's'] },
          { id: 'desc_weight', label: 'Peso', type: 'font_weight', defaultValue: 'normal' },
          { id: 'quote', label: 'Cita Destacada', type: 'text', defaultValue: '' },
          { id: 'signature_url', label: 'URL de Firma', type: 'image', defaultValue: '' }
        ],
        estructura: [
          { id: 'align', label: 'Alineación', type: 'select', defaultValue: 'left', options: [
            { label: 'Izquierda', value: 'left' },
            { label: 'Centro', value: 'center' },
            { label: 'Derecha', value: 'right' }
          ]},
          { id: 'margin_b', label: 'Margen Inferior', type: 'range', defaultValue: 40, min: 0, max: 100, unit: 'px' }
        ],
        contenido: [
          { id: 'button_text', label: 'Texto del Botón', type: 'text', defaultValue: 'Saber más' },
          ...BUTTON_LINK_SETTINGS('button', '')
        ],
        estilo: [], multimedia: [], interaccion: [], tipografia: []
      }
    },
    { 
      id: 'el_about_visual', 
      name: 'Imagen y Efectos', 
      type: 'multimedia', 
      groups: ['multimedia', 'estilo', 'interaccion', 'estructura'],
      settings: {
        multimedia: [
          { id: 'image_url', label: 'Imagen Principal', type: 'image', defaultValue: 'https://picsum.photos/seed/about/800/600' },
          { id: 'visual_fit', label: 'Ajuste de Imagen', type: 'select', defaultValue: 'cover', options: [
            { label: 'Cubrir (Cover)', value: 'cover' },
            { label: 'Contener (Contain)', value: 'contain' }
          ]},
          { id: 'mask_type', label: 'Máscara de Forma', type: 'select', defaultValue: 'none', options: [
            { label: 'Ninguna', value: 'none' },
            { label: 'Círculo', value: 'circle' },
            { label: 'Orgánica (Blob)', value: 'organic' },
            { label: 'Arco', value: 'arch' }
          ]}
        ],
        estilo: [
          { id: 'radius', label: 'Redondeado', type: 'range', defaultValue: 24, min: 0, max: 100 },
          { id: 'show_frame', label: 'Mostrar Marco Decorativo', type: 'boolean', defaultValue: false }
        ],
        interaccion: [
          { id: 'floating', label: 'Efecto Flotante', type: 'boolean', defaultValue: false },
          { id: 'parallax', label: 'Efecto Paralaje (Scroll)', type: 'boolean', defaultValue: false }
        ],
        estructura: [], contenido: [], tipografia: []
      }
    },
    { 
      id: 'el_about_stats', 
      name: 'Estadísticas Rápidas', 
      type: 'repeater', 
      groups: ['contenido', 'estilo', 'estructura', 'multimedia'],
      settings: {
        contenido: [
          { 
            id: 'stats_list', 
            label: 'Métricas', 
            type: 'repeater', 
            defaultValue: [
              { label: 'Clientes Felices', value: '2.5k+', icon: 'Users' },
              { label: 'Proyectos', value: '450+', icon: 'Briefcase' },
              { label: 'Premios', value: '12', icon: 'Trophy' }
            ],
            fields: [
              { id: 'label', label: 'Etiqueta', type: 'text', defaultValue: 'Métrica' },
              { id: 'value', label: 'Valor', type: 'text', defaultValue: '100+' },
              { id: 'icon', label: 'Icono', type: 'icon', defaultValue: 'Star' }
            ]
          }
        ],
        estilo: [
          { id: 'stat_color', label: 'Color de Valor', type: 'color', defaultValue: '#3B82F6' },
          { id: 'stat_bg', label: 'Fondo de Bloque', type: 'color', defaultValue: 'transparent' }
        ],
        estructura: [
          { id: 'columns', label: 'Columnas', type: 'range', defaultValue: 3, min: 1, max: 4 }
        ],
        multimedia: [
          { id: 'show_stats', label: 'Mostrar Estadísticas', type: 'boolean', defaultValue: true }
        ],
        tipografia: [], interaccion: []
      }
    }
  ]
};

export const PROCESS_MODULE: WebModule = {
  id: 'mod_process_1',
  type: 'process',
  iconKey: 'process',
  name: 'Nuestro Proceso (Pasos)',
  globalGroups: ['contenido', 'estructura', 'estilo', 'interaccion'],
  globalSettings: {
    contenido: [],
    estructura: [
      { id: 'layout', label: 'Diseño', type: 'select', defaultValue: 'horizontal', options: [
        { label: 'Pasos Horizontales', value: 'horizontal' },
        { label: 'Pasos Verticales', value: 'vertical' },
        { label: 'Alternado', value: 'alternating' }
      ]},
      { id: 'columns', label: 'Columnas (Horizontal)', type: 'range', defaultValue: 4, min: 2, max: 5 },
      { id: 'gap', label: 'Espaciado', type: 'range', defaultValue: 40, min: 20, max: 100, unit: 'px' },
      { id: 'padding_y', label: 'Padding Vertical', type: 'range', defaultValue: 120, min: 40, max: 200, unit: 'px' }
    ],
    estilo: [
      { id: 'dark_mode', label: 'Modo Oscuro', type: 'boolean', defaultValue: false },
      { id: 'bg_color', label: 'Color de Fondo', type: 'color', defaultValue: '#F8FAFC' },
      { id: 'section_gradient', label: 'Usar Gradiente de Fondo', type: 'boolean', defaultValue: false },
      { id: 'bg_gradient', label: 'Gradiente Personalizado', type: 'gradient', defaultValue: 'linear-gradient(to bottom, #F8FAFC, #FFFFFF)', showIf: { settingId: 'section_gradient', value: true } },
      { id: 'connector_style', label: 'Estilo de Conector', type: 'select', defaultValue: 'dashed', options: [
        { label: 'Sólido', value: 'solid' },
        { label: 'Punteado', value: 'dashed' },
        { label: 'Gradiente', value: 'gradient' },
        { label: 'Curvo (Vertical)', value: 'curved' },
        { label: 'Ninguno', value: 'none' }
      ]},
      { id: 'connector_color', label: 'Color de Conector', type: 'color', defaultValue: 'rgba(59, 130, 246, 0.2)' }
    ],
    interaccion: [
      { id: 'entrance_anim', label: 'Animación de Entrada', type: 'boolean', defaultValue: true },
      { id: 'draw_connectors', label: 'Animar Conectores (Scroll)', type: 'boolean', defaultValue: true },
      { id: 'hover_glow', label: 'Brillo al pasar mouse', type: 'boolean', defaultValue: true }
    ],
    tipografia: [], multimedia: []
  },
  elements: [
    { id: 'el_process_header', name: 'Textos', type: 'text', groups: ['eyebrow', 'title', 'subtitle', 'estructura'], settings: {
      eyebrow: [
        { id: 'eyebrow', label: 'Texto de la Cejilla', type: 'text', defaultValue: 'METODOLOGÍA' },
        { id: 'eyebrow_color', label: 'Color de Texto', type: 'color', defaultValue: '#3B82F6' },
        { id: 'eyebrow_bg', label: 'Color de Fondo', type: 'color', defaultValue: 'rgba(59, 130, 246, 0.1)' }
      ],
      title: [
        { id: 'title', label: 'Texto del Título', type: 'text', defaultValue: 'Nuestro **Proceso**' },
        { id: 'title_size', label: 'Tamaño', type: 'typography_size', defaultValue: 't2', allowedLevels: ['t1', 't2', 't3'] },
        { id: 'title_weight', label: 'Peso', type: 'font_weight', defaultValue: 'extrabold' },
        ...HIGHLIGHT_SETTINGS('title')
      ],
      subtitle: [
        { id: 'subtitle', label: 'Texto del Subtítulo', type: 'text', defaultValue: 'Cómo trabajamos para hacer realidad tus ideas.' },
        { id: 'subtitle_size', label: 'Tamaño', type: 'typography_size', defaultValue: 'p', allowedLevels: ['t3', 'p', 's'] },
        { id: 'subtitle_weight', label: 'Peso', type: 'font_weight', defaultValue: 'normal' },
        ...HIGHLIGHT_SETTINGS('subtitle')
      ],
      estructura: [
        { id: 'align', label: 'Alineación', type: 'select', defaultValue: 'center', options: [
          { label: 'Izquierda', value: 'left' },
          { label: 'Centro', value: 'center' },
          { label: 'Derecha', value: 'right' }
        ]},
        { id: 'margin_b', label: 'Margen Inferior', type: 'range', defaultValue: 80, min: 0, max: 120, unit: 'px' }
      ]
    }},
    { id: 'el_process_step', name: 'Estilo de Pasos', type: 'style', groups: ['estilo', 'tipografia', 'interaccion', 'estructura'], settings: {
      estilo: [
        { id: 'card_bg', label: 'Fondo Tarjeta', type: 'color', defaultValue: '#FFFFFF' },
        { id: 'card_radius', label: 'Redondeado', type: 'range', defaultValue: 24, min: 0, max: 60 },
        { id: 'card_border', label: 'Borde Tarjeta', type: 'color', defaultValue: 'rgba(0,0,0,0.05)' }
      ],
      tipografia: [
        { id: 'step_title_size', label: 'Tamaño Título', type: 'typography_size', defaultValue: 't3', allowedLevels: ['t3', 'p', 's'] },
        { id: 'step_title_weight', label: 'Peso Título', type: 'font_weight', defaultValue: 'extrabold' },
        { id: 'step_desc_size', label: 'Tamaño Descripción', type: 'typography_size', defaultValue: 'p', allowedLevels: ['t3', 'p', 's'] },
        { id: 'text_align', label: 'Alineación Texto', type: 'text_align', defaultValue: 'inherit' }
      ],
      interaccion: [
        { id: 'hover_lift', label: 'Elevar al pasar mouse', type: 'boolean', defaultValue: true }
      ],
      estructura: [
        { id: 'card_padding', label: 'Padding Interno', type: 'range', defaultValue: 32, min: 16, max: 60 }
      ],
      contenido: [], multimedia: []
    }},
    { id: 'el_process_indicator', name: 'Indicador / Número', type: 'style', groups: ['estilo', 'multimedia', 'estructura'], settings: {
      estilo: [
        { id: 'indicator_bg', label: 'Color de Fondo', type: 'color', defaultValue: '#3B82F6' },
        { id: 'indicator_color', label: 'Color de Texto/Icono', type: 'color', defaultValue: '#FFFFFF' },
        { id: 'indicator_shape', label: 'Forma del Indicador', type: 'select', defaultValue: 'circle', options: [
          { label: 'Círculo', value: 'circle' },
          { label: 'Squircle (Suave)', value: 'squircle' },
          { label: 'Rombo', value: 'diamond' },
          { label: 'Hexágono', value: 'hexagon' }
        ]},
        { id: 'indicator_glow', label: 'Efecto Resplandor', type: 'boolean', defaultValue: true }
      ],
      multimedia: [
        { id: 'use_icons', label: 'Usar Iconos en lugar de Números', type: 'boolean', defaultValue: true }
      ],
      estructura: [
        { id: 'indicator_size', label: 'Tamaño del Indicador', type: 'range', defaultValue: 48, min: 32, max: 80 }
      ],
      contenido: [], tipografia: [], interaccion: []
    }},
    { id: 'el_process_items', name: 'Lista de Pasos', type: 'repeater', groups: ['contenido'], settings: {
      contenido: [
        { 
          id: 'steps', 
          label: 'Pasos del Proceso', 
          type: 'repeater', 
          defaultValue: [
            { title: 'Descubrimiento', desc: 'Analizamos tus necesidades y objetivos.', icon: 'Search', badge: 'Paso 1', image: '' },
            { title: 'Estrategia', desc: 'Diseñamos un plan personalizado.', icon: 'Target', badge: 'Paso 2', image: '' },
            { title: 'Ejecución', desc: 'Desarrollamos la solución con precisión.', icon: 'Code', badge: 'Paso 3', image: '' },
            { title: 'Lanzamiento', desc: 'Desplegamos y optimizamos resultados.', icon: 'Rocket', badge: 'Paso 4', image: '' }
          ],
          fields: [
            { id: 'title', label: 'Título', type: 'text', defaultValue: 'Paso' },
            { id: 'desc', label: 'Descripción', type: 'text', defaultValue: 'Detalle del paso.' },
            { id: 'media_type', label: 'Tipo Multimedia', type: 'select', defaultValue: 'icon', options: [{label:'Icono', value:'icon'}, {label:'Imagen', value:'image'}] },
            { id: 'icon', label: 'Icono', type: 'icon', defaultValue: 'CheckCircle2', showIf: { settingId: 'media_type', value: 'icon' } },
            { id: 'image', label: 'Imagen/Ilustración', type: 'image', defaultValue: '', showIf: { settingId: 'media_type', value: 'image' } },
            { id: 'badge', label: 'Etiqueta/Badge', type: 'text', defaultValue: '' },
            ...BUTTON_LINK_SETTINGS('link', '')
          ]
        }
      ],
      estructura: [], estilo: [], tipografia: [], multimedia: [], interaccion: []
    }}
  ]
};

export const GALLERY_MODULE: WebModule = {
  id: 'mod_gallery_1',
  type: 'gallery',
  iconKey: 'gallery',
  name: 'Galería de Imágenes',
  globalGroups: ['contenido', 'estructura', 'estilo'],
  globalSettings: {
    contenido: [],
    estructura: [
      { id: 'layout', label: 'Diseño', type: 'select', defaultValue: 'grid', options: [
        { label: 'Grilla Uniforme', value: 'grid' },
        { label: 'Masonry (Dinámico)', value: 'masonry' },
        { label: 'Bento (Mosaico)', value: 'bento' }
      ]},
      { id: 'columns', label: 'Columnas', type: 'range', defaultValue: 3, min: 1, max: 5 },
      { id: 'gap', label: 'Espaciado', type: 'range', defaultValue: 20, min: 0, max: 60, unit: 'px' },
      { id: 'padding_y', label: 'Padding Vertical', type: 'range', defaultValue: 100, min: 40, max: 200, unit: 'px' }
    ],
    estilo: [
      { id: 'dark_mode', label: 'Modo Oscuro', type: 'boolean', defaultValue: false },
      { id: 'bg_color', label: 'Color de Fondo', type: 'color', defaultValue: '#FFFFFF' },
      { id: 'section_gradient', label: 'Gradiente de Fondo', type: 'boolean', defaultValue: false },
      { id: 'bg_gradient', label: 'Gradiente Personalizado', type: 'gradient', defaultValue: 'linear-gradient(to bottom, #FFFFFF, #F8FAFC)' },
      { id: 'image_filter', label: 'Filtro de Imagen', type: 'select', defaultValue: 'none', options: [
        { label: 'Ninguno', value: 'none' },
        { label: 'Escala de Grises', value: 'grayscale' },
        { label: 'Sepia', value: 'sepia' },
        { label: 'Desenfoque (Blur)', value: 'blur' }
      ]},
      { id: 'filter_on_hover', label: 'Quitar filtro al pasar mouse', type: 'boolean', defaultValue: true }
    ],
    tipografia: [], multimedia: [], interaccion: []
  },
  elements: [
    { 
      id: 'el_gallery_header', 
      name: 'Textos', 
      type: 'content', 
      groups: ['title', 'subtitle', 'estructura'],
      settings: {
        title: [
          { id: 'title', label: 'Título de Sección', type: 'text', defaultValue: 'Nuestra **Galería**' },
          { id: 'title_size', label: 'Tamaño', type: 'typography_size', defaultValue: 't2', allowedLevels: ['t1', 't2', 't3'] },
          { id: 'title_weight', label: 'Grosor Título', type: 'font_weight', defaultValue: 'extrabold' },
          ...HIGHLIGHT_SETTINGS('title')
        ],
        subtitle: [
          { id: 'subtitle', label: 'Subtítulo', type: 'text', defaultValue: 'Momentos capturados que cuentan nuestra historia.' },
          { id: 'subtitle_size', label: 'Tamaño', type: 'typography_size', defaultValue: 'p', allowedLevels: ['t3', 'p', 's'] },
          { id: 'subtitle_weight', label: 'Peso', type: 'font_weight', defaultValue: 'normal' },
          ...HIGHLIGHT_SETTINGS('subtitle')
        ],
        estructura: [
          { id: 'align', label: 'Alineación', type: 'select', defaultValue: 'center', options: [
            { label: 'Izquierda', value: 'left' },
            { label: 'Centro', value: 'center' },
            { label: 'Derecha', value: 'right' }
          ]},
          { id: 'margin_b', label: 'Margen Inferior', type: 'range', defaultValue: 60, min: 20, max: 120 }
        ],
        multimedia: [], interaccion: []
      }
    },
    {
      id: 'el_gallery_filters',
      name: 'Filtros de Categoría',
      type: 'style',
      groups: ['contenido'],
      settings: {
        contenido: [
          { id: 'show_filters', label: 'Mostrar Filtros de Categoría', type: 'boolean', defaultValue: true },
          { id: 'categories', label: 'Categorías (Separadas por coma)', type: 'text', defaultValue: 'Todos, Diseño, Arquitectura, Naturaleza' }
        ],
        estilo: [], estructura: [], tipografia: [], multimedia: [], interaccion: []
      }
    },
    { 
      id: 'el_gallery_item', 
      name: 'Estilo de Imagen', 
      type: 'style', 
      groups: ['multimedia', 'estilo', 'interaccion'],
      settings: {
        multimedia: [
          { id: 'aspect_ratio', label: 'Proporción de Imagen', type: 'select', defaultValue: 'square', options: [
            { label: 'Original', value: 'auto' },
            { label: 'Cuadrado (1:1)', value: 'square' },
            { label: 'Video (16:9)', value: '16/9' },
            { label: 'Retrato (3:4)', value: '3/4' }
          ]}
        ],
        estilo: [
          { id: 'radius', label: 'Redondeado', type: 'range', defaultValue: 16, min: 0, max: 60 },
          { id: 'overlay_color', label: 'Color Overlay (Hover)', type: 'color', defaultValue: 'rgba(0,0,0,0.4)' },
          { id: 'border_width', label: 'Grosor de Borde', type: 'range', defaultValue: 0, min: 0, max: 10 },
          { id: 'border_color', label: 'Color de Borde', type: 'color', defaultValue: '#3B82F6' }
        ],
        interaccion: [
          { id: 'hover_effect', label: 'Efecto al pasar mouse', type: 'select', defaultValue: 'zoom', options: [
            { label: 'Zoom', value: 'zoom' },
            { label: 'Levantar', value: 'lift' },
            { label: 'Resplandor', value: 'glow' },
            { label: 'Ninguno', value: 'none' }
          ]},
          { id: 'enable_lightbox', label: 'Habilitar Lightbox (Zoom)', type: 'boolean', defaultValue: true },
          { id: 'lightbox_nav', label: 'Navegación en Lightbox', type: 'boolean', defaultValue: true }
        ],
        contenido: [], estructura: [], tipografia: []
      }
    },
    { 
      id: 'el_gallery_captions', 
      name: 'Textos (Captions)', 
      type: 'style', 
      groups: ['contenido', 'estilo'],
      settings: {
        contenido: [
          { id: 'show_captions', label: 'Mostrar Títulos en Hover', type: 'boolean', defaultValue: true },
          { id: 'caption_position', label: 'Posición del Texto', type: 'select', defaultValue: 'bottom', options: [
            { label: 'Arriba', value: 'top' },
            { label: 'Centro', value: 'center' },
            { label: 'Abajo', value: 'bottom' }
          ]}
        ],
        estilo: [
          { id: 'caption_size', label: 'Tamaño de Fuente', type: 'range', defaultValue: 16, min: 12, max: 24 },
          { id: 'caption_color', label: 'Color de Texto', type: 'color', defaultValue: '#FFFFFF' }
        ],
        estructura: [], tipografia: [], multimedia: [], interaccion: []
      }
    },
    { 
      id: 'el_gallery_items', 
      name: 'Contenido de Galería', 
      type: 'repeater', 
      groups: ['contenido'],
      settings: {
        contenido: [
          { 
            id: 'items', 
            label: 'Imágenes y Videos', 
            type: 'repeater', 
            defaultValue: [
              { title: 'Proyecto Alpha', desc: 'Diseño minimalista.', category: 'Diseño', url: 'https://picsum.photos/seed/gal1/800/800' },
              { title: 'Arquitectura Moderna', desc: 'Líneas y formas.', category: 'Arquitectura', url: 'https://picsum.photos/seed/gal2/800/1000' },
              { title: 'Naturaleza Urbana', desc: 'Verde en la ciudad.', category: 'Naturaleza', url: 'https://picsum.photos/seed/gal3/1000/800' }
            ],
            fields: [
              { id: 'url', label: 'URL Imagen/Video', type: 'text', defaultValue: '' },
              { id: 'title', label: 'Título', type: 'text', defaultValue: 'Imagen' },
              { id: 'desc', label: 'Descripción Corta', type: 'text', defaultValue: '' },
              { id: 'category', label: 'Categoría', type: 'text', defaultValue: 'General' }
            ]
          }
        ],
        estructura: [], estilo: [], tipografia: [], multimedia: [], interaccion: []
      }
    }
  ]
};

export const VIDEO_MODULE: WebModule = {
  id: 'mod_video_1',
  type: 'video',
  iconKey: 'video',
  name: 'Video Destacado',
  globalGroups: ['contenido', 'multimedia', 'estilo', 'interaccion'],
  globalSettings: {
    estilo: [
      { id: 'dark_mode', label: 'Modo Oscuro', type: 'boolean', defaultValue: false },
      { id: 'layout', label: 'Diseño de Sección', type: 'select', defaultValue: 'centered', options: [
        { label: 'Centrado', value: 'centered' },
        { label: 'Ancho Completo', value: 'full' },
        { label: 'Dividido (Texto + Video)', value: 'split' },
        { label: 'Video de Fondo (Hero)', value: 'background' }
      ]},
      { id: 'aspect_ratio', label: 'Relación de Aspecto', type: 'select', defaultValue: '16/9', options: [
        { label: '16:9 (Panorámico)', value: '16/9' },
        { label: '4:3 (Clásico)', value: '4/3' },
        { label: '9:16 (Vertical)', value: '9/16' }
      ]},
      { id: 'bg_color', label: 'Fondo de Sección', type: 'color', defaultValue: '#FFFFFF' },
      { id: 'section_gradient', label: 'Gradiente de Fondo', type: 'boolean', defaultValue: false },
      { id: 'bg_gradient', label: 'Gradiente Personalizado', type: 'gradient', defaultValue: 'linear-gradient(to bottom, #FFFFFF, #F8FAFC)', showIf: { settingId: 'section_gradient', value: true } },
      { id: 'padding_y', label: 'Padding Vertical', type: 'range', defaultValue: 100, min: 40, max: 200, unit: 'px' },
      { id: 'max_width', label: 'Ancho Máximo Contenido', type: 'range', defaultValue: 1000, min: 600, max: 1400, unit: 'px' }
    ],
    multimedia: [
      { id: 'video_filter', label: 'Filtro de Video', type: 'select', defaultValue: 'none', options: [
        { label: 'Ninguno', value: 'none' },
        { label: 'Escala de Grises', value: 'grayscale' },
        { label: 'Sepia', value: 'sepia' },
        { label: 'Desenfoque (Blur)', value: 'blur' }
      ]},
      { id: 'mask_shape', label: 'Forma de Máscara', type: 'select', defaultValue: 'none', options: [
        { label: 'Ninguna', value: 'none' },
        { label: 'Círculo', value: 'circle' },
        { label: 'Orgánica (Blob)', value: 'blob' }
      ]},
      { id: 'overlay_color', label: 'Color de Superposición', type: 'color', defaultValue: 'rgba(0,0,0,0.2)' }
    ],
    interaccion: [
      { id: 'entrance_anim', label: 'Animación de Entrada', type: 'boolean', defaultValue: true },
      { id: 'parallax_effect', label: 'Efecto Paralaje', type: 'boolean', defaultValue: false },
      { id: 'hover_to_play', label: 'Reproducir al pasar mouse', type: 'boolean', defaultValue: false }
    ],
    contenido: [], estructura: [], tipografia: []
  },
  elements: [
    { 
      id: 'el_video_player', 
      name: 'Reproductor de Video', 
      type: 'multimedia', 
      groups: ['multimedia', 'estilo', 'interaccion'],
      settings: {
        multimedia: [
          { id: 'video_url', label: 'URL del Video', type: 'text', defaultValue: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
          { id: 'poster_url', label: 'Imagen de Portada (Poster)', type: 'image', defaultValue: 'https://picsum.photos/seed/video/1280/720' },
          { id: 'autoplay', label: 'Auto-reproducción', type: 'boolean', defaultValue: false },
          { id: 'loop', label: 'Bucle (Loop)', type: 'boolean', defaultValue: true },
          { id: 'controls', label: 'Mostrar Controles', type: 'boolean', defaultValue: true }
        ],
        estilo: [
          { id: 'radius', label: 'Redondeado', type: 'range', defaultValue: 24, min: 0, max: 100 },
          { id: 'shadow', label: 'Sombra Elevada', type: 'boolean', defaultValue: true },
          { id: 'border_color', label: 'Color de Borde', type: 'color', defaultValue: 'rgba(0,0,0,0.1)' },
          { id: 'play_button_style', label: 'Estilo Botón Play', type: 'select', defaultValue: 'pulse', options: [
            { label: 'Pulso', value: 'pulse' },
            { label: 'Simple', value: 'simple' },
            { label: 'Ninguno', value: 'none' }
          ]}
        ],
        interaccion: [
          { id: 'lightbox', label: 'Abrir en Ventana Emergente (Lightbox)', type: 'boolean', defaultValue: false }
        ],
        contenido: [], estructura: [], tipografia: []
      }
    },
    { 
      id: 'el_video_text', 
      name: 'Textos', 
      type: 'content', 
      groups: ['eyebrow', 'title', 'subtitle', 'estructura'],
      settings: {
        eyebrow: [
          { id: 'eyebrow', label: 'Cejilla (Eyebrow)', type: 'text', defaultValue: 'SHOWCASE' },
          { id: 'eyebrow_color', label: 'Color Cejilla', type: 'color', defaultValue: '#3B82F6' }
        ],
        title: [
          { id: 'title', label: 'Título', type: 'text', defaultValue: 'Descubre nuestra **visión**' },
          { id: 'title_size', label: 'Tamaño', type: 'typography_size', defaultValue: 't2', allowedLevels: ['t1', 't2', 't3'] },
          { id: 'title_weight', label: 'Peso', type: 'font_weight', defaultValue: 'extrabold' },
          { id: 'title_color', label: 'Color Título', type: 'color', defaultValue: '#0F172A' },
          ...HIGHLIGHT_SETTINGS('title')
        ],
        subtitle: [
          { id: 'subtitle', label: 'Subtítulo', type: 'text', defaultValue: 'Un recorrido visual por lo que nos hace únicos.' },
          { id: 'subtitle_size', label: 'Tamaño', type: 'typography_size', defaultValue: 'p', allowedLevels: ['t3', 'p', 's'] },
          { id: 'subtitle_weight', label: 'Peso', type: 'font_weight', defaultValue: 'normal' },
          ...HIGHLIGHT_SETTINGS('subtitle')
        ],
        estructura: [
          { id: 'align', label: 'Alineación', type: 'select', defaultValue: 'center', options: [
            { label: 'Izquierda', value: 'left' },
            { label: 'Centro', value: 'center' },
            { label: 'Derecha', value: 'right' }
          ]},
          { id: 'margin_b', label: 'Margen Inferior', type: 'range', defaultValue: 40, min: 0, max: 100 }
        ],
        multimedia: [], interaccion: []
      }
    }
  ]
};

export const TESTIMONIALS_MODULE: WebModule = {
  id: 'mod_testimonials_1',
  type: 'testimonials',
  iconKey: 'testimonials',
  name: 'Testimonios de Clientes',
  globalGroups: ['contenido', 'estructura', 'estilo', 'interaccion', 'multimedia'],
  globalSettings: {
      contenido: [],
      estructura: [
        { id: 'layout', label: 'Diseño', type: 'select', defaultValue: 'carousel', options: [
          { label: 'Carrusel (Slider)', value: 'carousel' },
          { label: 'Grilla de Tarjetas', value: 'grid' },
          { label: 'Mosaico (Masonry)', value: 'masonry' },
          { label: 'Enfoque (Destacado)', value: 'focus' }
        ]},
        { id: 'columns', label: 'Columnas (Grid)', type: 'range', defaultValue: 3, min: 1, max: 4 },
        { id: 'gap', label: 'Espaciado', type: 'range', defaultValue: 30, min: 10, max: 60, unit: 'px' },
        { id: 'padding_y', label: 'Padding Vertical', type: 'range', defaultValue: 100, min: 40, max: 200, unit: 'px' }
      ],
      estilo: [
        { id: 'dark_mode', label: 'Modo Oscuro', type: 'boolean', defaultValue: false },
        { id: 'bg_color', label: 'Color de Fondo', type: 'color', defaultValue: '#F8FAFC' },
        { id: 'section_gradient', label: 'Gradiente de Fondo', type: 'boolean', defaultValue: false },
        { id: 'bg_gradient', label: 'Gradiente Personalizado', type: 'gradient', defaultValue: 'linear-gradient(to bottom, #F8FAFC, #FFFFFF)' }
      ],
      interaccion: [
        { id: 'entrance_anim', label: 'Animación de Entrada', type: 'boolean', defaultValue: true },
        { id: 'autoplay', label: 'Auto-reproducción (Carrusel)', type: 'boolean', defaultValue: true },
        { id: 'autoplay_speed', label: 'Velocidad (ms)', type: 'range', defaultValue: 5000, min: 2000, max: 10000, step: 500 }
      ],
      multimedia: [...PARALLAX_BACKGROUND_SETTINGS],
      tipografia: []
    },
    elements: [
      { 
        id: 'el_testimonials_header', 
        name: 'Textos', 
        type: 'content', 
        groups: ['eyebrow', 'title', 'subtitle', 'estructura'],
        settings: {
          eyebrow: [
            { id: 'eyebrow', label: 'Texto de la Cejilla', type: 'text', defaultValue: 'TESTIMONIOS' },
            { id: 'eyebrow_color', label: 'Color Cejilla', type: 'color', defaultValue: '#3B82F6' }
          ],
          title: [
            { id: 'title', label: 'Texto del Título', type: 'text', defaultValue: 'Lo que **dicen** nuestros clientes' },
            { id: 'title_size', label: 'Tamaño', type: 'typography_size', defaultValue: 't2', allowedLevels: ['t1', 't2', 't3'] },
            { id: 'title_weight', label: 'Peso', type: 'font_weight', defaultValue: 'extrabold' },
            ...HIGHLIGHT_SETTINGS('title'),
            { id: 'title_color', label: 'Color Título', type: 'color', defaultValue: '#0F172A' }
          ],
          subtitle: [
            { id: 'subtitle', label: 'Texto del Subtítulo', type: 'text', defaultValue: 'Historias reales de personas que confían en nosotros.' },
            { id: 'subtitle_size', label: 'Tamaño', type: 'typography_size', defaultValue: 'p', allowedLevels: ['t3', 'p', 's'] },
            { id: 'subtitle_weight', label: 'Peso', type: 'font_weight', defaultValue: 'normal' },
            ...HIGHLIGHT_SETTINGS('subtitle')
          ],
          estructura: [
            { id: 'align', label: 'Alineación', type: 'select', defaultValue: 'center', options: [
              { label: 'Izquierda', value: 'left' },
              { label: 'Centro', value: 'center' },
              { label: 'Derecha', value: 'right' }
            ]},
            { id: 'margin_b', label: 'Margen Inferior', type: 'range', defaultValue: 60, min: 20, max: 120, unit: 'px' }
          ],
          contenido: [], estilo: [], tipografia: [], multimedia: [], interaccion: []
        }
      },
      { 
        id: 'el_testimonial_card', 
        name: 'Estilo de Tarjeta', 
        type: 'style', 
        groups: ['estilo', 'interaccion'],
        settings: {
          estilo: [
            { id: 'card_bg', label: 'Fondo Tarjeta', type: 'color', defaultValue: '#FFFFFF' },
            { id: 'card_radius', label: 'Redondeado', type: 'range', defaultValue: 24, min: 0, max: 60 },
            { id: 'card_padding', label: 'Padding Interno', type: 'range', defaultValue: 32, min: 16, max: 60 },
            { id: 'show_shadow', label: 'Mostrar Sombra', type: 'boolean', defaultValue: true },
            { id: 'border_color', label: 'Color de Borde', type: 'color', defaultValue: 'transparent' },
            { id: 'quote_style', label: 'Estilo de Comillas', type: 'select', defaultValue: 'top-left', options: [
              { label: 'Esquina Superior', value: 'top-left' },
              { label: 'Fondo Gigante', value: 'background' },
              { label: 'Ninguno', value: 'none' }
            ]}
          ],
          interaccion: [
            { id: 'hover_lift', label: 'Elevar al pasar mouse', type: 'boolean', defaultValue: true },
            { id: 'hover_glow', label: 'Resplandor al pasar mouse', type: 'boolean', defaultValue: false }
          ],
          contenido: [], estructura: [], tipografia: [], multimedia: []
        }
      },
      { 
        id: 'el_testimonial_author', 
        name: 'Estilo de Autor', 
        type: 'style', 
        groups: ['multimedia', 'estilo', 'tipografia'],
        settings: {
          multimedia: [
            { id: 'show_avatar', label: 'Mostrar Avatar', type: 'boolean', defaultValue: true },
            { id: 'avatar_shape', label: 'Forma del Avatar', type: 'select', defaultValue: 'circle', options: [
              { label: 'Círculo', value: 'circle' },
              { label: 'Squircle', value: 'squircle' },
              { label: 'Cuadrado', value: 'square' }
            ]},
            { id: 'show_stars', label: 'Mostrar Calificación', type: 'boolean', defaultValue: true },
            { id: 'show_company_logo', label: 'Mostrar Logo de Empresa', type: 'boolean', defaultValue: false }
          ],
          estilo: [
            { id: 'author_color', label: 'Color Nombre', type: 'color', defaultValue: '#0F172A' },
            { id: 'role_color', label: 'Color Cargo', type: 'color', defaultValue: '#64748B' },
            { id: 'star_color', label: 'Color Estrellas', type: 'color', defaultValue: '#FBBF24' }
          ],
          tipografia: [
            { id: 'quote_size', label: 'Tamaño de Cita', type: 'typography_size', defaultValue: 'p' },
            { id: 'quote_weight', label: 'Grosor de Cita', type: 'font_weight', defaultValue: 'normal' },
            { id: 'quote_align', label: 'Alineación de Cita', type: 'text_align', defaultValue: 'inherit' }
          ],
          contenido: [], estructura: [], interaccion: []
        }
      },
      { 
        id: 'el_testimonial_items', 
        name: 'Contenido de Testimonios', 
        type: 'repeater', 
        groups: ['contenido'],
        settings: {
          contenido: [
            { 
              id: 'items', 
              label: 'Testimonios', 
              type: 'repeater', 
              defaultValue: [
                { author: 'Elena Rodríguez', role: 'CEO en TechFlow', text: 'La mejor decisión que hemos tomado para nuestro negocio. La interfaz es intuitiva y el soporte es excepcional.', stars: 5, avatar: 'https://i.pravatar.cc/150?u=elena', logo: 'https://picsum.photos/seed/logo1/100/40' },
                { author: 'Marcos Pérez', role: 'Director Creativo', text: 'Increíble nivel de detalle y personalización. Logramos lanzar nuestra plataforma en tiempo récord.', stars: 5, avatar: 'https://i.pravatar.cc/150?u=marcos', logo: 'https://picsum.photos/seed/logo2/100/40' },
                { author: 'Sofía Martínez', role: 'Product Manager', text: 'Un cambio total en nuestra productividad. Las herramientas de automatización son simplemente brillantes.', stars: 4, avatar: 'https://i.pravatar.cc/150?u=sofia', logo: 'https://picsum.photos/seed/logo3/100/40' }
              ],
              fields: [
                { id: 'author', label: 'Nombre', type: 'text', defaultValue: 'Cliente' },
                { id: 'role', label: 'Cargo / Empresa', type: 'text', defaultValue: 'CEO' },
                { id: 'text', label: 'Testimonio', type: 'text', defaultValue: 'Excelente trabajo.' },
                { id: 'stars', label: 'Calificación (1-5)', type: 'range', defaultValue: 5, min: 1, max: 5 },
                { id: 'avatar', label: 'Foto de Perfil', type: 'image', defaultValue: '' },
                { id: 'logo', label: 'Logo de Empresa', type: 'image', defaultValue: '' }
              ]
            }
          ],
          estructura: [], estilo: [], tipografia: [], multimedia: [], interaccion: []
        }
      }
    ]
};

export const STATS_MODULE: WebModule = {
  id: 'mod_stats_1',
  type: 'stats',
  iconKey: 'stats',
  name: 'Contadores y Estadísticas',
  globalGroups: ['contenido', 'estructura', 'estilo', 'interaccion', 'multimedia'],
  globalSettings: {
    contenido: [],
    estructura: [
      { id: 'layout', label: 'Diseño', type: 'select', defaultValue: 'grid', options: [
        { label: 'Grilla Estándar', value: 'grid' },
        { label: 'Mosaico (Bento)', value: 'bento' },
        { label: 'Línea (Inline)', value: 'inline' },
        { label: 'Mínimo', value: 'minimal' }
      ]},
      { id: 'columns', label: 'Columnas (Desktop)', type: 'range', defaultValue: 4, min: 1, max: 6 },
      { id: 'gap', label: 'Espaciado', type: 'range', defaultValue: 30, min: 10, max: 60, unit: 'px' },
      { id: 'padding_y', label: 'Padding Vertical', type: 'range', defaultValue: 100, min: 40, max: 200, unit: 'px' }
    ],
    estilo: [
      { id: 'dark_mode', label: 'Modo Oscuro', type: 'boolean', defaultValue: false },
      { id: 'bg_color', label: 'Color de Fondo', type: 'color', defaultValue: '#FFFFFF' },
      { id: 'section_gradient', label: 'Gradiente de Fondo', type: 'boolean', defaultValue: false },
      { id: 'bg_gradient', label: 'Gradiente Personalizado', type: 'gradient', defaultValue: 'linear-gradient(to bottom, #FFFFFF, #F8FAFC)' }
    ],
    interaccion: [
      { id: 'entrance_anim', label: 'Animación de Entrada', type: 'boolean', defaultValue: true },
      { id: 'count_speed', label: 'Velocidad de Conteo (seg)', type: 'range', defaultValue: 2, min: 0.5, max: 5, step: 0.5 },
      { id: 'count_easing', label: 'Estilo de Animación', type: 'select', defaultValue: 'spring', options: [
        { label: 'Elástico (Spring)', value: 'spring' },
        { label: 'Lineal', value: 'linear' }
      ]}
    ],
    multimedia: [...PARALLAX_BACKGROUND_SETTINGS],
    tipografia: []
  },
  elements: [
    { id: 'el_stats_header', name: 'Textos', type: 'text', groups: ['eyebrow', 'title', 'subtitle', 'estructura'], settings: {
      eyebrow: [
        { id: 'eyebrow', label: 'Texto de la Cejilla', type: 'text', defaultValue: 'NUESTRO IMPACTO' },
        { id: 'eyebrow_color', label: 'Color de Texto', type: 'color', defaultValue: '#3B82F6' },
        { id: 'eyebrow_bg', label: 'Color de Fondo', type: 'color', defaultValue: 'rgba(59, 130, 246, 0.1)' }
      ],
      title: [
        { id: 'title', label: 'Texto del Título', type: 'text', defaultValue: 'Números que **hablan** por nosotros' },
        { id: 'title_size', label: 'Tamaño', type: 'typography_size', defaultValue: 't2', allowedLevels: ['t1', 't2', 't3'] },
        { id: 'title_weight', label: 'Peso', type: 'font_weight', defaultValue: 'extrabold' },
        ...HIGHLIGHT_SETTINGS('title')
      ],
      subtitle: [
        { id: 'subtitle', label: 'Texto del Subtítulo', type: 'text', defaultValue: 'Resultados tangibles que respaldan nuestra trayectoria.' },
        { id: 'subtitle_size', label: 'Tamaño', type: 'typography_size', defaultValue: 'p', allowedLevels: ['t3', 'p', 's'] },
        { id: 'subtitle_weight', label: 'Peso', type: 'font_weight', defaultValue: 'normal' },
        ...HIGHLIGHT_SETTINGS('subtitle')
      ],
      estructura: [
        { id: 'align', label: 'Alineación', type: 'select', defaultValue: 'center', options: [
          { label: 'Izquierda', value: 'left' },
          { label: 'Centro', value: 'center' },
          { label: 'Derecha', value: 'right' }
        ]},
        { id: 'margin_b', label: 'Margen Inferior', type: 'range', defaultValue: 60, min: 0, max: 120, unit: 'px' }
      ]
    }},
    { id: 'el_stat_item', name: 'Estilo de Tarjeta', type: 'text', groups: ['estilo', 'tipografia', 'estructura'], settings: {
      contenido: [],
      estructura: [
        { id: 'card_radius', label: 'Redondeo', type: 'range', defaultValue: 24, min: 0, max: 48 },
        { id: 'show_border', label: 'Mostrar Borde', type: 'boolean', defaultValue: false }
      ],
      estilo: [
        { id: 'card_bg', label: 'Fondo de Tarjeta', type: 'color', defaultValue: 'transparent' },
        { id: 'card_shadow', label: 'Sombra', type: 'select', defaultValue: 'none', options: [
          { label: 'Ninguna', value: 'none' },
          { label: 'Suave', value: 'soft' },
          { label: 'Resplandor (Glow)', value: 'glow' }
        ]},
        { id: 'hover_effect', label: 'Efecto al Hover', type: 'select', defaultValue: 'scale', options: [
          { label: 'Ninguno', value: 'none' },
          { label: 'Escalar', value: 'scale' },
          { label: 'Elevar', value: 'lift' }
        ]},
        { id: 'number_color', label: 'Color Número', type: 'color', defaultValue: '#0F172A' },
        { id: 'label_color', label: 'Color Etiqueta', type: 'color', defaultValue: '#64748B' },
        { id: 'desc_color', label: 'Color Descripción', type: 'color', defaultValue: '#94A3B8' }
      ],
      tipografia: [
        { id: 'number_size', label: 'Tamaño Número', type: 'typography_size', defaultValue: 't1', allowedLevels: ['t1', 't2', 't3'] },
        { id: 'number_weight', label: 'Peso Número', type: 'font_weight', defaultValue: 'black' }
      ],
      multimedia: [], interaccion: []
    }},
    { id: 'el_stat_icon', name: 'Iconos', type: 'text', groups: ['estilo', 'estructura'], settings: {
      contenido: [],
      estructura: [
        { id: 'show_icons', label: 'Mostrar Iconos', type: 'boolean', defaultValue: true },
        { id: 'icon_size', label: 'Tamaño Icono', type: 'range', defaultValue: 24, min: 16, max: 48 },
        { id: 'icon_shape', label: 'Forma del Fondo', type: 'select', defaultValue: 'squircle', options: [
          { label: 'Círculo', value: 'circle' },
          { label: 'Squircle', value: 'squircle' },
          { label: 'Mancha (Blob)', value: 'blob' },
          { label: 'Ninguna', value: 'none' }
        ]}
      ],
      estilo: [
        { id: 'icon_color', label: 'Color Icono', type: 'color', defaultValue: '#3B82F6' },
        { id: 'icon_bg', label: 'Fondo Icono', type: 'color', defaultValue: 'rgba(59, 130, 246, 0.1)' }
      ],
      tipografia: [], multimedia: [], interaccion: []
    }},
    { id: 'el_stats_items', name: 'Métricas', type: 'repeater', groups: ['contenido'], settings: {
      contenido: [
        { 
          id: 'items', 
          label: 'Lista de Métricas', 
          type: 'repeater', 
          defaultValue: [
            { value: 500, prefix: '', suffix: '+', label: 'Clientes Felices', description: 'Empresas que confían en nuestra tecnología.', icon: 'Users' },
            { value: 120, prefix: '', suffix: 'k', label: 'Líneas de Código', description: 'Desarrollo robusto y escalable.', icon: 'Zap' },
            { value: 15, prefix: '', suffix: '', label: 'Premios Ganados', description: 'Reconocimientos a la excelencia.', icon: 'Award' },
            { value: 99, prefix: '', suffix: '%', label: 'Satisfacción', description: 'Nuestros clientes nos recomiendan.', icon: 'Heart' }
          ],
          fields: [
            { id: 'label', label: 'Etiqueta', type: 'text', defaultValue: 'Métrica' },
            { id: 'value', label: 'Valor Numérico', type: 'number', defaultValue: 100 },
            { id: 'prefix', label: 'Prefijo (ej: $)', type: 'text', defaultValue: '' },
            { id: 'suffix', label: 'Sufijo (ej: +)', type: 'text', defaultValue: '' },
            { id: 'description', label: 'Descripción Corta', type: 'text', defaultValue: '' },
            { id: 'icon', label: 'Icono', type: 'icon', defaultValue: 'Star' }
          ]
        }
      ],
      estructura: [], estilo: [], tipografia: [], multimedia: [], interaccion: []
    }}
  ]
};

export const NEWSLETTER_MODULE: WebModule = {
  id: 'mod_newsletter_1',
  type: 'newsletter',
  iconKey: 'newsletter',
  name: 'Suscripción (Newsletter)',
  globalGroups: ['contenido', 'estructura', 'estilo', 'interaccion', 'multimedia'],
  globalSettings: {
    contenido: [],
    estructura: [
      { id: 'layout', label: 'Diseño', type: 'select', defaultValue: 'centered', options: [
        { label: 'Centrado', value: 'centered' },
        { label: 'Horizontal', value: 'horizontal' },
        { label: 'Lead Magnet (Ebook/Regalo)', value: 'lead_magnet' },
        { label: 'Barra Flotante (Sticky)', value: 'floating_bar' },
        { label: 'Mínimo', value: 'minimal' }
      ]},
      { id: 'max_width', label: 'Ancho Máximo', type: 'range', defaultValue: 800, min: 600, max: 1200, unit: 'px' },
      { id: 'padding_y', label: 'Padding Vertical', type: 'range', defaultValue: 80, min: 20, max: 160, unit: 'px' },
      { id: 'border_radius', label: 'Redondeo de Caja', type: 'range', defaultValue: 32, min: 0, max: 60 }
    ],
    estilo: [
      { id: 'dark_mode', label: 'Modo Oscuro', type: 'boolean', defaultValue: false },
      { id: 'bg_type', label: 'Tipo de Fondo', type: 'select', defaultValue: 'color', options: [
        { label: 'Color Sólido', value: 'color' },
        { label: 'Gradiente', value: 'gradient' },
        { label: 'Transparente', value: 'transparent' }
      ]},
      { id: 'bg_color', label: 'Color de Fondo', type: 'color', defaultValue: '#F8FAFC' },
      { id: 'bg_gradient', label: 'Gradiente Personalizado', type: 'gradient', defaultValue: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' },
      { id: 'bg_pattern', label: 'Patrón de Fondo', type: 'select', defaultValue: 'none', options: [
        { label: 'Ninguno', value: 'none' },
        { label: 'Puntos', value: 'dots' },
        { label: 'Grilla', value: 'grid' }
      ]},
      { id: 'backdrop_blur', label: 'Desenfoque (Blur)', type: 'range', defaultValue: 0, min: 0, max: 20, unit: 'px' },
      { id: 'show_shadow', label: 'Mostrar Sombra', type: 'boolean', defaultValue: true }
    ],
    interaccion: [
      { id: 'entrance_anim', label: 'Animación de Entrada', type: 'boolean', defaultValue: true }
    ],
    multimedia: [...PARALLAX_BACKGROUND_SETTINGS],
    tipografia: []
  },
  elements: [
    { id: 'el_news_header', name: 'Textos', type: 'text', groups: ['title', 'subtitle', 'estructura'], settings: {
      title: [
        { id: 'title', label: 'Título Principal', type: 'text', defaultValue: 'Suscríbete a nuestra **Newsletter**' },
        { id: 'title_size', label: 'Tamaño', type: 'typography_size', defaultValue: 't2', allowedLevels: ['t1', 't2', 't3'] },
        { id: 'title_weight', label: 'Peso', type: 'font_weight', defaultValue: 'black' },
        { id: 'title_color', label: 'Color de Título', type: 'color', defaultValue: '#0F172A' },
        ...HIGHLIGHT_SETTINGS('title')
      ],
      subtitle: [
        { id: 'subtitle', label: 'Subtítulo', type: 'text', defaultValue: 'Recibe las últimas noticias, consejos y ofertas exclusivas directamente en tu bandeja de entrada.' },
        { id: 'subtitle_size', label: 'Tamaño', type: 'typography_size', defaultValue: 'p', allowedLevels: ['t3', 'p', 's'] },
        { id: 'subtitle_weight', label: 'Peso', type: 'font_weight', defaultValue: 'normal' },
        ...HIGHLIGHT_SETTINGS('subtitle')
      ],
      estructura: [
        { id: 'align', label: 'Alineación', type: 'select', defaultValue: 'center', options: [
          { label: 'Izquierda', value: 'left' },
          { label: 'Centro', value: 'center' },
          { label: 'Derecha', value: 'right' }
        ]},
        { id: 'margin_b', label: 'Margen Inferior', type: 'range', defaultValue: 32, min: 0, max: 80 }
      ],
      multimedia: [], interaccion: []
    }},
    { id: 'el_news_form', name: 'Formulario', type: 'text', groups: ['contenido', 'estilo', 'interaccion'], settings: {
      contenido: [
        { id: 'show_name', label: 'Pedir Nombre', type: 'boolean', defaultValue: false },
        { id: 'placeholder', label: 'Placeholder Email', type: 'text', defaultValue: 'tu@email.com' },
        { id: 'button_text', label: 'Texto del Botón', type: 'text', defaultValue: 'Suscribirse' },
        ...BUTTON_LINK_SETTINGS('btn'),
        { id: 'gdpr_text', label: 'Texto GDPR', type: 'text', defaultValue: 'Acepto recibir comunicaciones comerciales y la política de privacidad.' }
      ],
      estilo: [
        { id: 'input_bg', label: 'Fondo de Input', type: 'color', defaultValue: '#FFFFFF' },
        { id: 'btn_bg', label: 'Color Botón', type: 'color', defaultValue: '#3B82F6' },
        { id: 'btn_color', label: 'Color Texto Botón', type: 'color', defaultValue: '#FFFFFF' },
        { id: 'input_radius', label: 'Redondeo Elementos', type: 'range', defaultValue: 16, min: 0, max: 40 },
        { id: 'hover_effect', label: 'Efecto Botón', type: 'select', defaultValue: 'scale', options: [
          { label: 'Escalar', value: 'scale' },
          { label: 'Resplandor', value: 'glow' }
        ]}
      ],
      interaccion: [
        { id: 'show_gdpr', label: 'Mostrar Checkbox GDPR', type: 'boolean', defaultValue: true },
        { id: 'show_confetti', label: 'Efecto Confeti al Éxito', type: 'boolean', defaultValue: true }
      ],
      estructura: [], tipografia: [], multimedia: []
    }},
    { id: 'el_news_magnet', name: 'Lead Magnet (Opcional)', type: 'text', groups: ['contenido', 'multimedia'], settings: {
      contenido: [
        { id: 'badge_text', label: 'Texto de Etiqueta', type: 'text', defaultValue: 'GRATIS' }
      ],
      multimedia: [
        { id: 'image', label: 'Imagen del Regalo', type: 'image', defaultValue: 'https://picsum.photos/seed/ebook/600/800' }
      ],
      estructura: [], estilo: [], tipografia: [], interaccion: []
    }},
    { id: 'el_news_trust', name: 'Señales de Confianza', type: 'text', groups: ['contenido', 'estilo'], settings: {
      contenido: [
        { id: 'privacy_text', label: 'Texto de Privacidad', type: 'text', defaultValue: 'Respetamos tu privacidad. Sin spam, solo valor.' },
        { id: 'subscriber_count', label: 'Contador de Suscriptores', type: 'text', defaultValue: 'Únete a +2,000 suscriptores' }
      ],
      estilo: [
        { id: 'show_icon', label: 'Mostrar Escudo', type: 'boolean', defaultValue: true },
        { id: 'text_size', label: 'Tamaño de Texto', type: 'range', defaultValue: 12, min: 10, max: 16 },
        { id: 'text_color', label: 'Color de Texto', type: 'color', defaultValue: '#64748B' }
      ],
      estructura: [], tipografia: [], multimedia: [], interaccion: []
    }}
  ]
};

export const CONTACT_MODULE: WebModule = {
  id: 'mod_contact_1',
  type: 'contact',
  iconKey: 'contact',
  name: 'Contacto y Ubicación',
  globalGroups: ['contenido', 'estructura', 'estilo', 'interaccion'],
  globalSettings: {
    contenido: [],
    estructura: [
      { id: 'layout', label: 'Diseño', type: 'select', defaultValue: 'split', options: [
        { label: 'Dividido (Info + Form)', value: 'split' },
        { label: 'Mosaico (Bento)', value: 'bento' },
        { label: 'Mapa Lateral', value: 'map_side' },
        { label: 'Mapa Superior', value: 'map_top' },
        { label: 'Centrado', value: 'centered' }
      ]},
      { id: 'max_width', label: 'Ancho Máximo', type: 'range', defaultValue: 1200, min: 800, max: 1600, unit: 'px' },
      { id: 'padding_y', label: 'Padding Vertical', type: 'range', defaultValue: 100, min: 40, max: 200, unit: 'px' }
    ],
    estilo: [
      { id: 'dark_mode', label: 'Modo Oscuro', type: 'boolean', defaultValue: false },
      { id: 'bg_color', label: 'Color de Fondo', type: 'color', defaultValue: '#F8FAFC' },
      { id: 'bg_image', label: 'Imagen de Fondo', type: 'image', defaultValue: '' },
      { id: 'bg_overlay', label: 'Opacidad Overlay', type: 'range', defaultValue: 0, min: 0, max: 100 }
    ],
    interaccion: [
      { id: 'entrance_anim', label: 'Animación de Entrada', type: 'boolean', defaultValue: true }
    ],
    tipografia: [], multimedia: []
  },
  elements: [
    { id: 'el_contact_header', name: 'Textos', type: 'text', groups: ['title', 'subtitle', 'estructura'], settings: {
      title: [
        { id: 'title', label: 'Título de Sección', type: 'text', defaultValue: 'Ponte en **contacto**' },
        { id: 'title_size', label: 'Tamaño', type: 'typography_size', defaultValue: 't2', allowedLevels: ['t1', 't2', 't3'] },
        { id: 'title_weight', label: 'Peso', type: 'font_weight', defaultValue: 'extrabold' },
        ...HIGHLIGHT_SETTINGS('title'),
        { id: 'title_color', label: 'Color Título', type: 'color', defaultValue: '#0F172A' }
      ],
      subtitle: [
        { id: 'subtitle', label: 'Subtítulo', type: 'text', defaultValue: 'Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos lo antes posible.' },
        { id: 'subtitle_size', label: 'Tamaño', type: 'typography_size', defaultValue: 'p', allowedLevels: ['t3', 'p', 's'] },
        { id: 'subtitle_weight', label: 'Peso', type: 'font_weight', defaultValue: 'normal' }
      ],
      estructura: [
        { id: 'align', label: 'Alineación', type: 'select', defaultValue: 'left', options: [
          { label: 'Izquierda', value: 'left' },
          { label: 'Centro', value: 'center' },
          { label: 'Derecha', value: 'right' }
        ]},
        { id: 'margin_b', label: 'Margen Inferior', type: 'range', defaultValue: 60, min: 20, max: 120, unit: 'px' }
      ],
      contenido: [], estilo: [], tipografia: [], multimedia: [], interaccion: []
    }},
    { id: 'el_contact_info', name: 'Información y Redes', type: 'text', groups: ['contenido', 'estilo', 'estructura'], settings: {
      contenido: [
        { id: 'email', label: 'Email de Contacto', type: 'text', defaultValue: 'hola@tuempresa.com' },
        { id: 'phone', label: 'Teléfono', type: 'text', defaultValue: '+34 900 000 000' },
        { id: 'address', label: 'Dirección Física', type: 'text', defaultValue: 'Calle Innovación 123, Madrid, España' },
        { id: 'availability_text', label: 'Texto Disponibilidad', type: 'text', defaultValue: 'Disponible ahora (9:00 - 18:00)' },
        { 
          id: 'social_links', 
          label: 'Redes Sociales', 
          type: 'repeater', 
          defaultValue: [],
          fields: [
            { id: 'platform', label: 'Plataforma', type: 'select', defaultValue: 'linkedin', options: [
              { label: 'LinkedIn', value: 'linkedin' },
              { label: 'Twitter / X', value: 'twitter' },
              { label: 'Instagram', value: 'instagram' },
              { label: 'Facebook', value: 'facebook' },
              { label: 'GitHub', value: 'github' }
            ]},
            { id: 'url', label: 'URL del Perfil', type: 'text', defaultValue: 'https://' }
          ]
        }
      ],
      estructura: [
        { id: 'show_availability', label: 'Mostrar Disponibilidad', type: 'boolean', defaultValue: true },
        { id: 'show_copy_buttons', label: 'Botones de Copiar', type: 'boolean', defaultValue: true }
      ],
      estilo: [
        { id: 'card_bg', label: 'Fondo de Tarjeta', type: 'color', defaultValue: 'transparent' },
        { id: 'icon_color', label: 'Color de Iconos', type: 'color', defaultValue: '#3B82F6' },
        { id: 'info_color', label: 'Color de Texto', type: 'color', defaultValue: '#475569' }
      ],
      tipografia: [
        { id: 'info_size', label: 'Tamaño de Texto', type: 'typography_size', defaultValue: 'p', allowedLevels: ['t3', 'p', 's'] },
        { id: 'info_weight', label: 'Peso de Texto', type: 'font_weight', defaultValue: 'normal' }
      ],
      multimedia: [], interaccion: []
    }},
    { id: 'el_contact_form', name: 'Formulario', type: 'text', groups: ['contenido', 'estilo', 'estructura', 'interaccion', 'tipografia'], settings: {
      contenido: [
        { id: 'button_text', label: 'Texto del Botón', type: 'text', defaultValue: 'Enviar Mensaje' },
        ...BUTTON_LINK_SETTINGS('btn'),
        { id: 'whatsapp_number', label: 'Número WhatsApp (Opcional)', type: 'text', defaultValue: '' },
        { 
          id: 'custom_fields', 
          label: 'Campos del Formulario', 
          type: 'repeater', 
          defaultValue: [
            { label: 'Nombre Completo', type: 'text', placeholder: 'Ej: Juan Pérez', required: true },
            { label: 'Correo Electrónico', type: 'email', placeholder: 'juan@ejemplo.com', required: true },
            { label: 'Mensaje', type: 'textarea', placeholder: '¿En qué podemos ayudarte?', required: true }
          ],
          fields: [
            { id: 'label', label: 'Etiqueta', type: 'text', defaultValue: 'Campo' },
            { id: 'type', label: 'Tipo', type: 'select', defaultValue: 'text', options: [
              { label: 'Texto Corto', value: 'text' },
              { label: 'Email', value: 'email' },
              { label: 'Teléfono', value: 'tel' },
              { label: 'Área de Texto', value: 'textarea' }
            ]},
            { id: 'placeholder', label: 'Placeholder', type: 'text', defaultValue: 'Escribe aquí...' },
            { id: 'required', label: 'Obligatorio', type: 'boolean', defaultValue: true }
          ]
        }
      ],
      estructura: [
        { id: 'input_radius', label: 'Redondeo Elementos', type: 'range', defaultValue: 12, min: 0, max: 40 }
      ],
      estilo: [
        { id: 'input_bg', label: 'Fondo de Inputs', type: 'color', defaultValue: '#FFFFFF' },
        { id: 'btn_bg', label: 'Color Botón', type: 'color', defaultValue: '#3B82F6' },
        { id: 'btn_color', label: 'Color Texto Botón', type: 'color', defaultValue: '#FFFFFF' },
        { id: 'hover_effect', label: 'Efecto Botón', type: 'select', defaultValue: 'lift', options: [
          { label: 'Elevar', value: 'lift' },
          { label: 'Resplandor', value: 'glow' },
          { label: 'Magnético', value: 'magnetic' }
        ]}
      ],
      interaccion: [
        { id: 'shimmer', label: 'Efecto Brillo (Shimmer)', type: 'boolean', defaultValue: false }
      ],
      tipografia: [
        { id: 'label_size', label: 'Tamaño de Etiquetas', type: 'typography_size', defaultValue: 's', allowedLevels: ['p', 's'] },
        { id: 'label_weight', label: 'Peso de Etiquetas', type: 'font_weight', defaultValue: 'extrabold' }
      ],
      multimedia: []
    }},
    { id: 'el_contact_integrations', name: 'Integraciones', type: 'text', groups: ['contenido', 'estilo'], settings: {
      contenido: [
        { id: 'show_calendly', label: 'Mostrar Calendly', type: 'boolean', defaultValue: false },
        { id: 'calendly_url', label: 'URL de Calendly', type: 'text', defaultValue: '' },
        { id: 'calendly_text', label: 'Texto de Invitación', type: 'text', defaultValue: '¿Prefieres una videollamada? Reserva aquí' }
      ],
      estilo: [
        { id: 'calendly_bg', label: 'Fondo de Tarjeta', type: 'color', defaultValue: '#F1F5F9' }
      ],
      estructura: [], tipografia: [], multimedia: [], interaccion: []
    }},
    { id: 'el_contact_map', name: 'Mapa', type: 'text', groups: ['contenido', 'estructura', 'estilo'], settings: {
      contenido: [
        { id: 'show_map', label: 'Mostrar Mapa', type: 'boolean', defaultValue: true },
        { id: 'map_url', label: 'URL Embed de Google Maps', type: 'text', defaultValue: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3037.615174415891!2d-3.7037902!3d40.4167754!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd42287e00000001%3A0x0!2zUHVlcnRhIGRlbCBTb2w!5e0!3m2!1ses!2ses!4v1625123456789!5m2!1ses!2ses' }
      ],
      estructura: [
        { id: 'map_height', label: 'Altura del Mapa', type: 'range', defaultValue: 400, min: 200, max: 800, unit: 'px' },
        { id: 'map_radius', label: 'Redondeo', type: 'range', defaultValue: 24, min: 0, max: 60 }
      ],
      estilo: [
        { id: 'grayscale', label: 'Mapa en Grises', type: 'boolean', defaultValue: false }
      ],
      tipografia: [], multimedia: [], interaccion: []
    }}
  ]
};

export const TEAM_MODULE: WebModule = {
  id: 'mod_team_1',
  type: 'team',
  iconKey: 'team',
  name: 'Nuestro Equipo',
  globalGroups: ['contenido', 'estructura', 'estilo', 'interaccion'],
  globalSettings: {
    contenido: [],
    estructura: [
      { id: 'layout', label: 'Diseño', type: 'select', defaultValue: 'grid', options: [
        { label: 'Grilla de Tarjetas', value: 'grid' },
        { label: 'Lista con Bio', value: 'list' },
        { label: 'Carrusel (Slider)', value: 'carousel' },
        { label: 'Mosaico (Bento)', value: 'bento' }
      ]},
      { id: 'columns', label: 'Columnas (Desktop)', type: 'range', defaultValue: 3, min: 1, max: 4 },
      { id: 'gap', label: 'Espaciado', type: 'range', defaultValue: 32, min: 16, max: 60, unit: 'px' },
      { id: 'padding_y', label: 'Padding Vertical', type: 'range', defaultValue: 100, min: 40, max: 200, unit: 'px' },
      { id: 'show_filters', label: 'Mostrar Filtros', type: 'boolean', defaultValue: true }
    ],
    estilo: [
      { id: 'dark_mode', label: 'Modo Oscuro', type: 'boolean', defaultValue: false },
      { id: 'bg_color', label: 'Color de Fondo', type: 'color', defaultValue: '#FFFFFF' },
      { id: 'section_gradient', label: 'Usar Gradiente', type: 'boolean', defaultValue: false },
      { id: 'bg_gradient', label: 'Gradiente Personalizado', type: 'gradient', defaultValue: 'linear-gradient(to bottom, #FFFFFF, #F8FAFC)' }
    ],
    interaccion: [
      { id: 'entrance_anim', label: 'Animación de Entrada', type: 'boolean', defaultValue: true },
      { id: 'stagger_anim', label: 'Efecto Cascada', type: 'boolean', defaultValue: true },
      { id: 'enable_modal', label: 'Habilitar Modal de Bio', type: 'boolean', defaultValue: true }
    ],
    tipografia: [
      { id: 'title_size', label: 'Tamaño Título', type: 'typography_size', defaultValue: 't2' },
      { id: 'title_weight', label: 'Peso Título', type: 'font_weight', defaultValue: 'black' },
      ...HIGHLIGHT_SETTINGS('title')
    ],
    multimedia: []
  },
  elements: [
    { 
      id: 'el_team_header', 
      name: 'Textos', 
      type: 'content', 
      groups: ['eyebrow', 'title', 'subtitle', 'estructura'],
      settings: {
        eyebrow: [
          { id: 'eyebrow', label: 'Texto de la Cejilla', type: 'text', defaultValue: 'EQUIPO' },
          { id: 'eyebrow_color', label: 'Color Cejilla', type: 'color', defaultValue: '#3B82F6' }
        ],
        title: [
          { id: 'title', label: 'Texto del Título', type: 'text', defaultValue: 'Conoce a nuestro **equipo**' },
          { id: 'title_size', label: 'Tamaño', type: 'typography_size', defaultValue: 't2', allowedLevels: ['t1', 't2', 't3'] },
          { id: 'title_weight', label: 'Peso', type: 'font_weight', defaultValue: 'black' },
          ...HIGHLIGHT_SETTINGS('title'),
          { id: 'title_color', label: 'Color Título', type: 'color', defaultValue: '#0F172A' }
        ],
        subtitle: [
          { id: 'subtitle', label: 'Texto del Subtítulo', type: 'text', defaultValue: 'Expertos apasionados dedicados a llevar tu visión a la realidad.' },
          { id: 'subtitle_size', label: 'Tamaño', type: 'typography_size', defaultValue: 'p', allowedLevels: ['t3', 'p', 's'] },
          { id: 'subtitle_weight', label: 'Peso', type: 'font_weight', defaultValue: 'normal' },
          ...HIGHLIGHT_SETTINGS('subtitle')
        ],
        estructura: [
          { id: 'align', label: 'Alineación', type: 'select', defaultValue: 'center', options: [
            { label: 'Izquierda', value: 'left' },
            { label: 'Centro', value: 'center' },
            { label: 'Derecha', value: 'right' }
          ]},
          { id: 'margin_b', label: 'Margen Inferior', type: 'range', defaultValue: 60, min: 20, max: 120, unit: 'px' }
        ],
        contenido: [], estilo: [], tipografia: [], multimedia: [], interaccion: []
      }
    },
    { 
      id: 'el_team_items', 
      name: 'Miembros del Equipo', 
      type: 'repeater', 
      groups: ['contenido'],
      settings: {
        contenido: [
          { 
            id: 'members', 
            label: 'Lista de Miembros', 
            type: 'repeater', 
            defaultValue: [
              { name: 'Alex Rivera', role: 'Director Creativo', bio: '10 años de experiencia en diseño.', image: 'https://picsum.photos/seed/team1/400/500', category: 'Diseño', linkedin: '#', twitter: '#', web: '#' },
              { name: 'Elena Soler', role: 'Lead Developer', bio: 'Experta en arquitecturas escalables.', image: 'https://picsum.photos/seed/team2/400/500', category: 'Ingeniería', linkedin: '#', twitter: '#', web: '#' },
              { name: 'Marc Costa', role: 'Estratega Digital', bio: 'Especialista en crecimiento de marca.', image: 'https://picsum.photos/seed/team3/400/500', category: 'Marketing', linkedin: '#', twitter: '#', web: '#' }
            ],
            fields: [
              { id: 'name', label: 'Nombre', type: 'text', defaultValue: 'Nombre' },
              { id: 'role', label: 'Cargo', type: 'text', defaultValue: 'Cargo' },
              { id: 'category', label: 'Categoría/Departamento', type: 'text', defaultValue: '' },
              { id: 'bio', label: 'Biografía', type: 'text', defaultValue: '' },
              { id: 'image', label: 'Foto Principal', type: 'image', defaultValue: '' },
              { id: 'image_hover', label: 'Foto Hover (Opcional)', type: 'image', defaultValue: '' },
              { id: 'linkedin', label: 'LinkedIn URL', type: 'text', defaultValue: '#' },
              { id: 'twitter', label: 'Twitter URL', type: 'text', defaultValue: '#' },
              { id: 'web', label: 'Sitio Web', type: 'text', defaultValue: '#' }
            ]
          }
        ],
        estructura: [], estilo: [], tipografia: [], multimedia: [], interaccion: []
      }
    },
    { id: 'el_team_card', name: 'Estilo de Tarjeta', type: 'text', groups: ['estilo', 'estructura', 'interaccion'], settings: {
      estructura: [
        { id: 'card_radius', label: 'Redondeo', type: 'range', defaultValue: 24, min: 0, max: 48 },
        { id: 'card_padding', label: 'Padding Interno', type: 'range', defaultValue: 24, min: 0, max: 48 },
        { id: 'show_border', label: 'Mostrar Borde', type: 'boolean', defaultValue: false }
      ],
      estilo: [
        { id: 'card_style', label: 'Estilo Visual', type: 'select', defaultValue: 'solid', options: [
          { label: 'Sólido', value: 'solid' },
          { label: 'Cristal (Glass)', value: 'glass' },
          { label: 'Mínimo', value: 'minimal' }
        ]},
        { id: 'card_bg', label: 'Fondo Tarjeta', type: 'color', defaultValue: '#FFFFFF' },
        { id: 'card_shadow', label: 'Sombra', type: 'select', defaultValue: 'sm', options: [
          { label: 'Ninguna', value: 'none' },
          { label: 'Suave', value: 'sm' },
          { label: 'Fuerte', value: 'lg' }
        ]}
      ],
      interaccion: [
        { id: 'hover_effect', label: 'Efecto al Hover', type: 'select', defaultValue: 'lift', options: [
          { label: 'Ninguno', value: 'none' },
          { label: 'Elevar', value: 'lift' }
        ]}
      ],
      contenido: [], tipografia: [], multimedia: []
    }},
    { id: 'el_team_image', name: 'Fotos de Miembros', type: 'text', groups: ['estilo', 'estructura', 'interaccion'], settings: {
      estructura: [
        { id: 'img_aspect', label: 'Relación de Aspecto', type: 'select', defaultValue: 'portrait', options: [
          { label: 'Retrato (3:4)', value: 'portrait' },
          { label: 'Cuadrado (1:1)', value: 'square' },
          { label: 'Círculo', value: 'circle' }
        ]},
        { id: 'img_radius', label: 'Redondeo Imagen', type: 'range', defaultValue: 20, min: 0, max: 40 },
        { id: 'img_mask', label: 'Máscara de Forma', type: 'select', defaultValue: 'none', options: [
          { label: 'Ninguna', value: 'none' },
          { label: 'Squircle', value: 'squircle' },
          { label: 'Mancha (Blob)', value: 'blob' }
        ]}
      ],
      estilo: [
        { id: 'hover_image_swap', label: 'Cambiar Imagen al Hover', type: 'boolean', defaultValue: true }
      ],
      interaccion: [], contenido: [], tipografia: [], multimedia: []
    }},
    { id: 'el_team_info', name: 'Textos de Miembros', type: 'text', groups: ['estilo', 'tipografia'], settings: {
      estilo: [
        { id: 'name_color', label: 'Color Nombre', type: 'color', defaultValue: '#0F172A' },
        { id: 'role_color', label: 'Color Cargo', type: 'color', defaultValue: '#3B82F6' },
        { id: 'bio_color', label: 'Color Biografía', type: 'color', defaultValue: '#64748B' }
      ],
      tipografia: [
        { id: 'name_size', label: 'Tamaño Nombre', type: 'typography_size', defaultValue: 't3' },
        { id: 'name_weight', label: 'Peso Nombre', type: 'font_weight', defaultValue: 'black' },
        { id: 'role_size', label: 'Tamaño Cargo', type: 'typography_size', defaultValue: 's' },
        { id: 'role_weight', label: 'Peso Cargo', type: 'font_weight', defaultValue: 'extrabold' },
        { id: 'bio_size', label: 'Tamaño Biografía', type: 'typography_size', defaultValue: 'p', allowedLevels: ['p', 's'] },
        { id: 'bio_weight', label: 'Peso Biografía', type: 'font_weight', defaultValue: 'normal' }
      ],
      contenido: [], estructura: [], multimedia: [], interaccion: []
    }}
  ]
};

export const CTA_MODULE: WebModule = {
  id: 'mod_cta_1',
  type: 'cta',
  iconKey: 'cta',
  name: 'Call to Action',
  globalGroups: ['contenido', 'estructura', 'estilo', 'interaccion', 'multimedia'],
  globalSettings: {
    contenido: [],
    estructura: [
      { id: 'layout', label: 'Diseño', type: 'select', defaultValue: 'centered', options: [
        { label: 'Centrado', value: 'centered' },
        { label: 'Dividido (Texto + Imagen)', value: 'split' },
        { label: 'Mosaico (Bento)', value: 'bento' }
      ]},
      { id: 'max_width', label: 'Ancho Máximo', type: 'range', defaultValue: 1000, min: 600, max: 1400, unit: 'px' },
      { id: 'padding_y', label: 'Padding Vertical', type: 'range', defaultValue: 100, min: 40, max: 240, unit: 'px' }
    ],
    estilo: [
      { id: 'dark_mode', label: 'Modo Oscuro', type: 'boolean', defaultValue: false },
      { id: 'bg_type', label: 'Tipo de Fondo', type: 'select', defaultValue: 'color', options: [
        { label: 'Color Sólido', value: 'color' },
        { label: 'Gradiente', value: 'gradient' },
        { label: 'Imagen', value: 'image' },
        { label: 'Video', value: 'video' }
      ]},
      { id: 'bg_color', label: 'Color de Fondo', type: 'color', defaultValue: '#FFFFFF' },
      { id: 'bg_gradient', label: 'Gradiente Personalizado', type: 'gradient', defaultValue: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' },
      { id: 'bg_video', label: 'URL Video MP4', type: 'text', defaultValue: '' },
      { id: 'overlay_opacity', label: 'Opacidad Capa (Overlay)', type: 'range', defaultValue: 50, min: 0, max: 100 }
    ],
    interaccion: [
      { id: 'entrance_anim', label: 'Animación de Entrada', type: 'boolean', defaultValue: true },
      { id: 'show_floating_assets', label: 'Iconos Flotantes Animados', type: 'boolean', defaultValue: false },
      { id: 'floating_icon_1', label: 'Icono 1', type: 'icon', defaultValue: 'Sparkles' },
      { id: 'floating_icon_2', label: 'Icono 2', type: 'icon', defaultValue: 'Zap' }
    ],
    multimedia: [...PARALLAX_BACKGROUND_SETTINGS],
    tipografia: []
  },
  elements: [
    { id: 'el_cta_content', name: 'Textos', type: 'text', groups: ['title', 'subtitle', 'estructura'], settings: {
      title: [
        { id: 'title', label: 'Título Impactante', type: 'text', defaultValue: '¿Listo para **transformar** tu negocio?' },
        { id: 'title_size', label: 'Tamaño', type: 'typography_size', defaultValue: 't2', allowedLevels: ['t1', 't2', 't3'] },
        { id: 'title_weight', label: 'Peso', type: 'font_weight', defaultValue: 'black' },
        ...HIGHLIGHT_SETTINGS('title'),
        { id: 'title_color', label: 'Color Título', type: 'color', defaultValue: '#0F172A' }
      ],
      subtitle: [
        { id: 'subtitle', label: 'Texto del Subtítulo', type: 'text', defaultValue: 'Únete a miles de **profesionales** que ya están escalando sus resultados con nuestra plataforma.' },
        { id: 'subtitle_size', label: 'Tamaño', type: 'typography_size', defaultValue: 'p', allowedLevels: ['t3', 'p', 's'] },
        { id: 'subtitle_weight', label: 'Peso', type: 'font_weight', defaultValue: 'normal' },
        ...HIGHLIGHT_SETTINGS('subtitle'),
        { id: 'subtitle_color', label: 'Color Subtítulo', type: 'color', defaultValue: '#475569' }
      ],
      estructura: [
        { id: 'text_align', label: 'Alineación', type: 'text_align', defaultValue: 'center' },
        { id: 'margin_b', label: 'Margen Inferior', type: 'range', defaultValue: 40, min: 0, max: 100, unit: 'px' }
      ],
      contenido: [], estilo: [], tipografia: [], multimedia: [], interaccion: []
    }},
    { id: 'el_cta_actions', name: 'Acción Principal', type: 'text', groups: ['contenido', 'estilo', 'interaccion', 'estructura'], settings: {
      contenido: [
        { id: 'mode', label: 'Modo de Acción', type: 'select', defaultValue: 'buttons', options: [
          { label: 'Botones Clásicos', value: 'buttons' },
          { label: 'Captura de Email (Lead)', value: 'lead_capture' }
        ]},
        { id: 'primary_text', label: 'Texto Botón / Acción', type: 'text', defaultValue: 'Empezar Ahora' },
        ...BUTTON_LINK_SETTINGS('primary'),
        { id: 'secondary_text', label: 'Texto Botón Secundario', type: 'text', defaultValue: 'Saber Más' },
        ...BUTTON_LINK_SETTINGS('secondary'),
        { id: 'placeholder', label: 'Placeholder Email', type: 'text', defaultValue: 'tu@email.com' }
      ],
      estructura: [
        { id: 'show_secondary', label: 'Mostrar Secundario', type: 'boolean', defaultValue: true },
        { id: 'btn_radius', label: 'Redondeo Botones', type: 'range', defaultValue: 16, min: 0, max: 40 }
      ],
      estilo: [
        { id: 'btn_primary_bg', label: 'Color Botón Principal', type: 'color', defaultValue: '#3B82F6' },
        { id: 'btn_primary_color', label: 'Color Texto Botón', type: 'color', defaultValue: '#FFFFFF' },
        { id: 'hover_effect', label: 'Efecto al Hover', type: 'select', defaultValue: 'scale', options: [
          { label: 'Escalar', value: 'scale' },
          { label: 'Resplandor', value: 'glow' }
        ]}
      ],
      interaccion: [
        { id: 'enable_shimmer', label: 'Efecto Brillo (Shimmer)', type: 'boolean', defaultValue: true },
        { id: 'magnetic_button', label: 'Botón Magnético', type: 'boolean', defaultValue: false }
      ],
      tipografia: [], multimedia: []
    }},
    { id: 'el_cta_urgency', name: 'Urgencia (Countdown)', type: 'text', groups: ['contenido', 'interaccion'], settings: {
      contenido: [
        { id: 'enable_countdown', label: 'Activar Cuenta Regresiva', type: 'boolean', defaultValue: false },
        { id: 'countdown_date', label: 'Fecha Límite (YYYY-MM-DD)', type: 'text', defaultValue: '2026-12-31' }
      ],
      interaccion: [], estilo: [], estructura: [], tipografia: [], multimedia: []
    }},
    { id: 'el_cta_trust', name: 'Prueba Social', type: 'text', groups: ['contenido', 'estilo', 'estructura'], settings: {
      contenido: [
        { id: 'show_trust', label: 'Mostrar Prueba Social', type: 'boolean', defaultValue: true },
        { id: 'trust_text', label: 'Texto de Confianza', type: 'text', defaultValue: 'Únete a +5,000 usuarios activos' },
        { id: 'company_logos', label: 'Logos de Partners', type: 'repeater', defaultValue: [], fields: [{id: 'url', label: 'URL Logo', type: 'image', defaultValue: ''}]}
      ],
      estructura: [
        { id: 'show_avatars', label: 'Mostrar Avatares', type: 'boolean', defaultValue: true },
        { id: 'show_logos', label: 'Mostrar Logos de Empresas', type: 'boolean', defaultValue: false }
      ],
      estilo: [
        { id: 'trust_size', label: 'Tamaño de Texto', type: 'range', defaultValue: 14, min: 10, max: 18 },
        { id: 'trust_color', label: 'Color de Texto', type: 'color', defaultValue: '#64748B' }
      ],
      tipografia: [], multimedia: [], interaccion: []
    }}
  ]
};

export const PRICING_MODULE: WebModule = {
  id: 'mod_pricing_1',
  type: 'pricing',
  iconKey: 'pricing',
  name: 'Planes de Precios',
  globalGroups: ['contenido', 'estructura', 'estilo', 'interaccion'],
  globalSettings: {
    contenido: [],
    estructura: [
      { id: 'columns', label: 'Columnas (Desktop)', type: 'range', defaultValue: 3, min: 1, max: 4 },
      { id: 'gap', label: 'Espaciado entre Tarjetas', type: 'range', defaultValue: 32, min: 16, max: 60, unit: 'px' },
      { id: 'padding_y', label: 'Padding Vertical', type: 'range', defaultValue: 100, min: 40, max: 200, unit: 'px' }
    ],
    estilo: [
      { id: 'dark_mode', label: 'Modo Oscuro', type: 'boolean', defaultValue: false },
      { id: 'bg_color', label: 'Color de Fondo', type: 'color', defaultValue: '#F8FAFC' },
      { id: 'section_gradient', label: 'Usar Gradiente', type: 'boolean', defaultValue: false },
      { id: 'bg_gradient', label: 'Gradiente Personalizado', type: 'gradient', defaultValue: 'linear-gradient(to bottom, #F8FAFC, #FFFFFF)' }
    ],
    interaccion: [
      { id: 'entrance_anim', label: 'Animación de Entrada', type: 'boolean', defaultValue: true },
      { id: 'stagger_anim', label: 'Efecto Cascada', type: 'boolean', defaultValue: true }
    ],
    tipografia: [], multimedia: []
  },
  elements: [
    { id: 'el_pricing_header', name: 'Textos', type: 'text', groups: ['title', 'subtitle', 'estructura'], settings: {
      title: [
        { id: 'title', label: 'Título de Sección', type: 'text', defaultValue: 'Planes diseñados para tu **éxito**' },
        { id: 'title_size', label: 'Tamaño', type: 'typography_size', defaultValue: 't2', allowedLevels: ['t1', 't2', 't3'] },
        { id: 'title_weight', label: 'Peso', type: 'font_weight', defaultValue: 'extrabold' },
        ...HIGHLIGHT_SETTINGS('title'),
        { id: 'title_color', label: 'Color Título', type: 'color', defaultValue: '#0F172A' }
      ],
      subtitle: [
        { id: 'subtitle', label: 'Subtítulo', type: 'text', defaultValue: 'Elige el plan que mejor se adapte a tus necesidades actuales.' },
        { id: 'subtitle_size', label: 'Tamaño', type: 'typography_size', defaultValue: 'p', allowedLevels: ['t3', 'p', 's'] },
        { id: 'subtitle_weight', label: 'Peso', type: 'font_weight', defaultValue: 'normal' }
      ],
      estructura: [
        { id: 'align', label: 'Alineación', type: 'select', defaultValue: 'center', options: [
          { label: 'Izquierda', value: 'left' },
          { label: 'Centro', value: 'center' },
          { label: 'Derecha', value: 'right' }
        ]},
        { id: 'margin_b', label: 'Margen Inferior', type: 'range', defaultValue: 60, min: 20, max: 120, unit: 'px' }
      ],
      contenido: [], estilo: [], tipografia: [], multimedia: [], interaccion: []
    }},
    { id: 'el_pricing_toggle', name: 'Selector de Facturación', type: 'text', groups: ['contenido', 'estilo'], settings: {
      contenido: [
        { id: 'show_toggle', label: 'Mostrar Selector Mensual/Anual', type: 'boolean', defaultValue: true },
        { id: 'discount_label', label: 'Etiqueta de Descuento', type: 'text', defaultValue: '-20%' }
      ],
      estilo: [
        { id: 'toggle_bg', label: 'Fondo Selector', type: 'color', defaultValue: '#F1F5F9' },
        { id: 'active_bg', label: 'Fondo Activo', type: 'color', defaultValue: '#FFFFFF' },
        { id: 'active_color', label: 'Color Texto Activo', type: 'color', defaultValue: '#0F172A' }
      ],
      estructura: [], tipografia: [], multimedia: [], interaccion: []
    }},
    { id: 'el_pricing_plans', name: 'Configuración de Planes', type: 'text', groups: ['contenido'], settings: {
      contenido: [
        { 
          id: 'plans', 
          label: 'Planes', 
          type: 'repeater', 
          defaultValue: [
            { name: 'Básico', description: 'Ideal para individuos.', monthlyPrice: 0, yearlyPrice: 0, features: '5 Proyectos\n1GB Almacenamiento\nSoporte por Email\n- Dominio Personalizado', cta: 'Empezar Gratis', icon: 'Rocket', highlight: false },
            { name: 'Profesional', description: 'Para equipos en crecimiento.', monthlyPrice: 29, yearlyPrice: 24, features: 'Proyectos Ilimitados\n20GB Almacenamiento\nSoporte Prioritario\nAnalíticas Avanzadas', cta: 'Prueba Pro Gratis', icon: 'Zap', highlight: true, badge: 'MÁS POPULAR' },
            { name: 'Empresa', description: 'Seguridad y control total.', monthlyPrice: 99, yearlyPrice: 89, features: 'Todo en Pro\nAlmacenamiento Ilimitado\nSoporte 24/7\nSSO & Seguridad', cta: 'Contactar Ventas', icon: 'Shield', highlight: false }
          ],
          fields: [
            { id: 'name', label: 'Nombre del Plan', type: 'text', defaultValue: 'Plan' },
            { id: 'description', label: 'Descripción Corta', type: 'text', defaultValue: '' },
            { id: 'monthlyPrice', label: 'Precio Mensual', type: 'number', defaultValue: 0 },
            { id: 'yearlyPrice', label: 'Precio Anual (por mes)', type: 'number', defaultValue: 0 },
            { id: 'features', label: 'Características (una por línea, usa "-" para negativas)', type: 'textarea', defaultValue: '' },
            { id: 'cta', label: 'Texto del Botón', type: 'text', defaultValue: 'Elegir Plan' },
            ...BUTTON_LINK_SETTINGS('cta'),
            { id: 'icon', label: 'Icono (Lucide)', type: 'icon', defaultValue: 'Zap' },
            { id: 'highlight', label: 'Destacar Plan', type: 'boolean', defaultValue: false },
            { id: 'badge', label: 'Etiqueta (Badge)', type: 'text', defaultValue: '' }
          ]
        }
      ],
      estilo: [], estructura: [], tipografia: [], multimedia: [], interaccion: []
    }},
    { id: 'el_pricing_card', name: 'Estilo de Tarjetas', type: 'text', groups: ['estilo', 'estructura'], settings: {
      estructura: [
        { id: 'card_radius', label: 'Redondeo', type: 'range', defaultValue: 32, min: 0, max: 60 }
      ],
      estilo: [
        { id: 'card_bg', label: 'Fondo Tarjeta', type: 'color', defaultValue: '#FFFFFF' },
        { id: 'highlight_color', label: 'Color de Acento', type: 'color', defaultValue: '#3B82F6' },
        { id: 'show_shadow', label: 'Mostrar Sombra', type: 'boolean', defaultValue: true },
        { id: 'glass_mode', label: 'Efecto Cristal (Glass)', type: 'boolean', defaultValue: false },
        { id: 'hover_effect', label: 'Efecto al Hover', type: 'select', defaultValue: 'lift', options: [
          { label: 'Ninguno', value: 'none' },
          { label: 'Elevar', value: 'lift' },
          { label: 'Resplandor', value: 'glow' }
        ]}
      ],
      contenido: [], tipografia: [], multimedia: [], interaccion: []
    }},
    { id: 'el_pricing_price', name: 'Estilo de Precios', type: 'text', groups: ['estilo', 'tipografia'], settings: {
      estilo: [
        { id: 'price_color', label: 'Color Precio', type: 'color', defaultValue: '#0F172A' }
      ],
      tipografia: [
        { id: 'price_size', label: 'Tamaño Precio', type: 'typography_size', defaultValue: 't1' },
        { id: 'price_weight', label: 'Peso Precio', type: 'font_weight', defaultValue: 'black' },
        { id: 'currency_symbol', label: 'Símbolo Moneda', type: 'text', defaultValue: '$' }
      ],
      contenido: [], estructura: [], multimedia: [], interaccion: []
    }},
    { id: 'el_pricing_features', name: 'Estilo de Características', type: 'text', groups: ['estilo', 'tipografia'], settings: {
      estilo: [
        { id: 'feat_color', label: 'Color Texto', type: 'color', defaultValue: '#475569' },
        { id: 'icon_color', label: 'Color Icono Check', type: 'color', defaultValue: '#3B82F6' }
      ],
      tipografia: [
        { id: 'feat_size', label: 'Tamaño Texto', type: 'typography_size', defaultValue: 'p' },
        { id: 'feat_weight', label: 'Peso Texto', type: 'font_weight', defaultValue: 'normal' }
      ],
      estructura: [
        { id: 'icon_type', label: 'Tipo de Icono', type: 'select', defaultValue: 'check', options: [
          { label: 'Check', value: 'Check' },
          { label: 'Rayo', value: 'Zap' },
          { label: 'Estrella', value: 'Star' }
        ]},
        { id: 'show_negative', label: 'Mostrar Ítems Negativos', type: 'boolean', defaultValue: true }
      ],
      contenido: [], multimedia: [], interaccion: []
    }},
    { id: 'el_pricing_trust', name: 'Sección de Confianza', type: 'text', groups: ['contenido'], settings: {
      contenido: [
        { id: 'show_trust', label: 'Mostrar Sellos de Confianza', type: 'boolean', defaultValue: true },
        { 
          id: 'trust_items', 
          label: 'Sellos', 
          type: 'repeater', 
          defaultValue: [
            { icon: 'ShieldCheck', text: 'Garantía de 30 días' },
            { icon: 'Clock', text: 'Soporte 24/7' },
            { icon: 'CreditCard', text: 'Pagos Seguros' }
          ],
          fields: [
            { id: 'icon', label: 'Icono', type: 'icon', defaultValue: 'ShieldCheck' },
            { id: 'text', label: 'Texto', type: 'text', defaultValue: 'Confianza' }
          ]
        }
      ],
      estilo: [], estructura: [], tipografia: [], multimedia: [], interaccion: []
    }}
  ]
};

export const FAQ_MODULE: WebModule = {
  id: 'mod_faq_1',
  type: 'faq',
  iconKey: 'faq',
  name: 'Preguntas Frecuentes',
  globalGroups: ['contenido', 'estructura', 'estilo', 'interaccion'],
  globalSettings: {
    contenido: [],
    estructura: [
      { id: 'layout', label: 'Diseño de Lista', type: 'select', defaultValue: 'single', options: [
        { label: 'Columna Única', value: 'single' },
        { label: 'Doble Columna', value: 'double' },
        { label: 'Pestañas Laterales', value: 'tabs_left' },
        { label: 'Pestañas Superiores', value: 'tabs_top' }
      ]},
      { id: 'max_width', label: 'Ancho Máximo', type: 'range', defaultValue: 1000, min: 600, max: 1200, unit: 'px' },
      { id: 'padding_y', label: 'Padding Vertical', type: 'range', defaultValue: 100, min: 40, max: 200, unit: 'px' },
      { id: 'item_gap', label: 'Espaciado entre Preguntas', type: 'range', defaultValue: 16, min: 0, max: 40, unit: 'px' }
    ],
    estilo: [
      { id: 'dark_mode', label: 'Modo Oscuro', type: 'boolean', defaultValue: false },
      { id: 'bg_color', label: 'Color de Fondo', type: 'color', defaultValue: '#FFFFFF' },
      { id: 'section_gradient', label: 'Usar Gradiente', type: 'boolean', defaultValue: false },
      { id: 'bg_gradient', label: 'Gradiente Personalizado', type: 'gradient', defaultValue: 'linear-gradient(to bottom, #FFFFFF, #F8FAFC)' },
      { id: 'glassmorphism', label: 'Efecto Cristal (Glass)', type: 'boolean', defaultValue: false },
      { id: 'divider_style', label: 'Estilo de Divisor Interno', type: 'select', defaultValue: 'line', options: [
        { label: 'Ninguno', value: 'none' },
        { label: 'Línea Continua', value: 'line' },
        { label: 'Línea de Puntos', value: 'dots' }
      ]}
    ],
    interaccion: [
      { id: 'entrance_anim', label: 'Animación de Entrada', type: 'boolean', defaultValue: true },
      { id: 'single_open', label: 'Cerrar otros al abrir uno', type: 'boolean', defaultValue: true },
      { id: 'scroll_to_active', label: 'Auto-scroll a pregunta activa', type: 'boolean', defaultValue: false }
    ],
    tipografia: [], multimedia: []
  },
  elements: [
    { id: 'el_faq_header', name: 'Textos', type: 'text', groups: ['eyebrow', 'title', 'subtitle', 'secciones', 'estructura'], settings: {
      eyebrow: [
        { id: 'eyebrow', label: 'Cejilla (Eyebrow)', type: 'text', defaultValue: 'AYUDA' },
        { id: 'eyebrow_color', label: 'Color Cejilla', type: 'color', defaultValue: '#3B82F6' }
      ],
      title: [
        { id: 'title', label: 'Título de Sección', type: 'text', defaultValue: 'Preguntas **Frecuentes**' },
        { id: 'title_size', label: 'Tamaño', type: 'typography_size', defaultValue: 't2', allowedLevels: ['t1', 't2', 't3'] },
        { id: 'title_weight', label: 'Peso', type: 'font_weight', defaultValue: 'black' },
        ...HIGHLIGHT_SETTINGS('title'),
        { id: 'title_color', label: 'Color Título', type: 'color', defaultValue: '#0F172A' }
      ],
      subtitle: [
        { id: 'subtitle', label: 'Subtítulo', type: 'text', defaultValue: 'Todo lo que necesitas saber sobre nuestro servicio.' },
        { id: 'subtitle_size', label: 'Tamaño', type: 'typography_size', defaultValue: 'p', allowedLevels: ['t3', 'p', 's'] },
        { id: 'subtitle_weight', label: 'Peso', type: 'font_weight', defaultValue: 'normal' },
        { id: 'subtitle_color', label: 'Color Subtítulo', type: 'color', defaultValue: '#64748B' }
      ],
      secciones: [
        { 
          id: 'categories', 
          label: 'Secciones', 
          type: 'repeater', 
          defaultValue: [
            { id: 'all', label: 'Todas' },
            { id: 'general', label: 'General' },
            { id: 'pagos', label: 'Pagos' },
            { id: 'soporte', label: 'Soporte' }
          ],
          fields: [
            { id: 'id', label: 'ID Categoría', type: 'text', defaultValue: 'general' },
            { id: 'label', label: 'Nombre Visible', type: 'text', defaultValue: 'General' }
          ]
        }
      ],
      estructura: [
        { id: 'align', label: 'Alineación', type: 'select', defaultValue: 'center', options: [
          { label: 'Izquierda', value: 'left' },
          { label: 'Centro', value: 'center' },
          { label: 'Derecha', value: 'right' }
        ]},
        { id: 'margin_b', label: 'Margen Inferior', type: 'range', defaultValue: 60, min: 20, max: 120, unit: 'px' }
      ],
      contenido: [], estilo: [], tipografia: [], multimedia: [], interaccion: []
    }},
    { id: 'el_faq_search', name: 'Buscador', type: 'text', groups: ['contenido', 'estilo', 'estructura'], settings: {
      contenido: [
        { id: 'show_search', label: 'Mostrar Barra de Búsqueda', type: 'boolean', defaultValue: true },
        { id: 'placeholder', label: 'Texto de Ayuda (Placeholder)', type: 'text', defaultValue: 'Buscar una pregunta...' }
      ],
      estilo: [
        { id: 'search_bg', label: 'Color de Fondo', type: 'color', defaultValue: '#F1F5F9' },
        { id: 'search_border', label: 'Color de Borde (Activo)', type: 'color', defaultValue: '#3B82F6' }
      ],
      estructura: [
        { id: 'search_radius', label: 'Redondeo', type: 'range', defaultValue: 16, min: 0, max: 40 }
      ],
      tipografia: [], multimedia: [], interaccion: []
    }},
    { id: 'el_faq_item', name: 'Preguntas Individuales', type: 'text', groups: ['contenido', 'estilo', 'tipografia', 'estructura'], settings: {
      contenido: [
        { 
          id: 'faqs', 
          label: 'Lista de Preguntas', 
          type: 'repeater', 
          defaultValue: [
            { category: 'general', question: "¿Cómo puedo empezar?", answer: "Es muy sencillo. Regístrate y elige una plantilla.", icon: 'Zap' },
            { category: 'soporte', question: "¿Ofrecen soporte técnico?", answer: "Sí, soporte 24/7 incluido.", icon: 'LifeBuoy' }
          ],
          fields: [
            { id: 'category', label: 'ID Categoría', type: 'text', defaultValue: 'general' },
            { id: 'question', label: 'Pregunta', type: 'text', defaultValue: '¿...?' },
            { id: 'answer', label: 'Respuesta (Markdown)', type: 'text', defaultValue: '...' },
            { id: 'icon', label: 'Icono Sugerido', type: 'icon', defaultValue: 'HelpCircle' }
          ]
        }
      ],
      estilo: [
        { id: 'item_bg', label: 'Fondo Ítem (Cerrado)', type: 'color', defaultValue: 'transparent' },
        { id: 'active_bg', label: 'Fondo Ítem (Abierto)', type: 'color', defaultValue: '#F8FAFC' },
        { id: 'border_color', label: 'Color de Borde', type: 'color', defaultValue: '#E2E8F0' },
        { id: 'q_color', label: 'Color Pregunta', type: 'color', defaultValue: '#0F172A' },
        { id: 'a_color', label: 'Color Respuesta', type: 'color', defaultValue: '#64748B' }
      ],
      tipografia: [
        { id: 'q_size', label: 'Tamaño Pregunta', type: 'typography_size', defaultValue: 't3' },
        { id: 'q_weight', label: 'Peso Pregunta', type: 'font_weight', defaultValue: 'extrabold' },
        { id: 'a_size', label: 'Tamaño Respuesta', type: 'typography_size', defaultValue: 'p' },
        { id: 'a_weight', label: 'Peso Respuesta', type: 'font_weight', defaultValue: 'normal' }
      ],
      estructura: [
        { id: 'show_border', label: 'Mostrar Borde', type: 'boolean', defaultValue: true },
        { id: 'active_shadow', label: 'Sombra al Abrir', type: 'boolean', defaultValue: true },
        { id: 'icon_type', label: 'Icono de Apertura', type: 'select', defaultValue: 'plus', options: [
          { label: 'Más / Menos', value: 'plus' },
          { label: 'Flecha (Chevron)', value: 'chevron' }
        ]},
        { id: 'show_item_icons', label: 'Mostrar Iconos de Pregunta', type: 'boolean', defaultValue: false }
      ],
      multimedia: [], interaccion: []
    }},
    { id: 'el_faq_cta', name: 'Llamada al Soporte', type: 'text', groups: ['contenido', 'estilo'], settings: {
      contenido: [
        { id: 'show_cta', label: 'Mostrar Sección de Contacto', type: 'boolean', defaultValue: true },
        { id: 'cta_text', label: 'Título CTA', type: 'text', defaultValue: '¿Aún tienes dudas?' },
        { id: 'btn_text', label: 'Texto del Botón', type: 'text', defaultValue: 'Contactar Soporte' },
        ...BUTTON_LINK_SETTINGS('btn', '#')
      ],
      estilo: [
        { id: 'cta_bg', label: 'Fondo Sección', type: 'color', defaultValue: '#F8FAFC' },
        { id: 'btn_bg', label: 'Color Botón', type: 'color', defaultValue: '#3B82F6' }
      ],
      estructura: [], tipografia: [], multimedia: [], interaccion: []
    }}
  ]
};

export const CLIENTS_MODULE: WebModule = {
  id: 'mod_clients_1',
  type: 'clients',
  iconKey: 'clients',
  name: 'Logos de Clientes',
  globalGroups: ['contenido', 'estructura', 'estilo', 'interaccion'],
  globalSettings: {
    contenido: [],
    estructura: [
      { id: 'layout', label: 'Diseño', type: 'select', defaultValue: 'grid', options: [
        { label: 'Grilla Estática', value: 'grid' },
        { label: 'Marquesina (Scroll Infinito)', value: 'marquee' },
        { label: 'Carrusel Horizontal', value: 'carousel' }
      ]},
      { id: 'columns', label: 'Columnas (Grilla)', type: 'range', defaultValue: 5, min: 2, max: 8 },
      { id: 'alignment', label: 'Alineación Horizontal', type: 'text_align', defaultValue: 'center' },
      { id: 'gap', label: 'Espaciado entre Logos', type: 'range', defaultValue: 40, min: 10, max: 100, unit: 'px' },
      { id: 'padding_y', label: 'Padding Vertical', type: 'range', defaultValue: 80, min: 20, max: 200, unit: 'px' }
    ],
    estilo: [
      { id: 'dark_mode', label: 'Modo Oscuro', type: 'boolean', defaultValue: false },
      { id: 'bg_color', label: 'Color de Fondo', type: 'color', defaultValue: '#FFFFFF' },
      { id: 'section_gradient', label: 'Usar Gradiente', type: 'boolean', defaultValue: false },
      { id: 'bg_gradient', label: 'Gradiente Personalizado', type: 'gradient', defaultValue: 'linear-gradient(to bottom, #FFFFFF, #F8FAFC)' }
    ],
    interaccion: [
      { id: 'entrance_animation', label: 'Animación de Entrada', type: 'boolean', defaultValue: true },
      { id: 'animation_speed', label: 'Velocidad Marquee (seg)', type: 'range', defaultValue: 30, min: 10, max: 100 },
      { id: 'marquee_direction', label: 'Dirección Marquee', type: 'select', defaultValue: 'left', options: [
        { label: 'Izquierda', value: 'left' },
        { label: 'Derecha', value: 'right' }
      ]},
      { id: 'pause_on_hover', label: 'Pausar Marquee al Hover', type: 'boolean', defaultValue: true }
    ],
    tipografia: [], multimedia: []
  },
  elements: [
    { id: 'el_clients_header', name: 'Textos', type: 'text', groups: ['eyebrow', 'title', 'subtitle', 'estructura'], settings: {
      eyebrow: [
        { id: 'eyebrow', label: 'Texto Superior (Eyebrow)', type: 'text', defaultValue: 'TRUSTED BY' },
        { id: 'eyebrow_color', label: 'Color Eyebrow', type: 'color', defaultValue: '#3B82F6' }
      ],
      title: [
        { id: 'title', label: 'Título', type: 'text', defaultValue: 'Empresas que **confían** en nosotros' },
        { id: 'title_size', label: 'Tamaño', type: 'typography_size', defaultValue: 't2', allowedLevels: ['t1', 't2', 't3'] },
        { id: 'title_weight', label: 'Peso', type: 'font_weight', defaultValue: 'black' },
        { id: 'title_color', label: 'Color Título', type: 'color', defaultValue: '#0F172A' },
        ...HIGHLIGHT_SETTINGS('title')
      ],
      subtitle: [
        { id: 'subtitle', label: 'Subtítulo', type: 'text', defaultValue: 'Trabajamos con los mejores para ofrecerte lo mejor.' },
        { id: 'subtitle_size', label: 'Tamaño', type: 'typography_size', defaultValue: 'p', allowedLevels: ['t3', 'p', 's'] },
        { id: 'subtitle_weight', label: 'Peso', type: 'font_weight', defaultValue: 'normal' },
        ...HIGHLIGHT_SETTINGS('subtitle')
      ],
      estructura: [
        { id: 'align', label: 'Alineación', type: 'select', defaultValue: 'center', options: [
          { label: 'Izquierda', value: 'left' },
          { label: 'Centro', value: 'center' },
          { label: 'Derecha', value: 'right' }
        ]},
        { id: 'margin_b', label: 'Margen Inferior', type: 'range', defaultValue: 60, min: 0, max: 120 }
      ],
      multimedia: [], interaccion: []
    }},
    { id: 'el_client_logo', name: 'Estilo de Logotipos', type: 'text', groups: ['estilo', 'multimedia', 'interaccion', 'estructura'], settings: {
      multimedia: [
        { id: 'logo_height', label: 'Altura de Logos', type: 'range', defaultValue: 40, min: 20, max: 120, unit: 'px' },
        { id: 'logo_fit', label: 'Ajuste de Imagen', type: 'select', defaultValue: 'contain', options: [
          { label: 'Contener (Contain)', value: 'contain' },
          { label: 'Cubrir (Cover)', value: 'cover' }
        ]}
      ],
      estilo: [
        { id: 'logo_opacity', label: 'Opacidad Base', type: 'range', defaultValue: 60, min: 0, max: 100 },
        { id: 'logo_filter', label: 'Filtro Visual', type: 'select', defaultValue: 'grayscale', options: [
          { label: 'Ninguno', value: 'none' },
          { label: 'Escala de Grises', value: 'grayscale' },
          { label: 'Invertir (Modo Oscuro)', value: 'invert' }
        ]}
      ],
      estructura: [
        { id: 'logo_border_radius', label: 'Redondeo de Logo', type: 'range', defaultValue: 0, min: 0, max: 40 }
      ],
      interaccion: [
        { id: 'hover_reveal', label: 'Recuperar Color al Hover', type: 'boolean', defaultValue: true },
        { id: 'hover_scale', label: 'Escala al Hover (%)', type: 'range', defaultValue: 110, min: 90, max: 150 },
        { id: 'hover_glow', label: 'Resplandor al Hover', type: 'boolean', defaultValue: false },
        { id: 'show_tooltips', label: 'Mostrar Nombres (Tooltips)', type: 'boolean', defaultValue: true },
        { id: 'enable_links', label: 'Habilitar Enlaces', type: 'boolean', defaultValue: false }
      ],
      contenido: [], tipografia: []
    }},
    { id: 'el_client_logos_data', name: 'Gestión de Logos', type: 'repeater', groups: ['contenido'], settings: {
      contenido: [
        { 
          id: 'select_customers', 
          label: 'Seleccionar Clientes', 
          type: 'repeater', 
          defaultValue: [],
          fields: [
            { id: 'id', label: 'ID del Cliente', type: 'text', defaultValue: '' }
          ]
        }
      ],
      estilo: [], estructura: [], tipografia: [], multimedia: [], interaccion: []
    }}
  ]
};

export const BENTO_MODULE: WebModule = {
  id: 'mod_bento_1',
  type: 'content',
  iconKey: 'bento',
  name: 'Composición Libre (Bento)',
  globalGroups: ['estructura', 'estilo', 'interaccion', 'multimedia'],
  globalSettings: {
    estructura: [
      { id: 'columns', label: 'Columnas Desktop', type: 'range', defaultValue: 4, min: 1, max: 12 },
      { id: 'gap', label: 'Espaciado (Gap)', type: 'range', defaultValue: 20, min: 0, max: 100, unit: 'px' },
      { id: 'padding_y', label: 'Padding Vertical', type: 'range', defaultValue: 100, min: 0, max: 200, unit: 'px' },
      { id: 'max_width', label: 'Ancho Máximo', type: 'range', defaultValue: 1200, min: 800, max: 1600, unit: 'px' }
    ],
    estilo: [
      { id: 'dark_mode', label: 'Modo Oscuro', type: 'boolean', defaultValue: false },
      { id: 'bg_color', label: 'Color de Fondo', type: 'color', defaultValue: '#FFFFFF' },
      { id: 'section_gradient', label: 'Usar Degradado', type: 'boolean', defaultValue: false },
      { id: 'bg_gradient', label: 'Degradado de Fondo', type: 'gradient', defaultValue: 'linear-gradient(to bottom, #FFFFFF, #F8FAFC)', showIf: { settingId: 'section_gradient', value: true } }
    ],
    interaccion: [
      { id: 'entrance_anim', label: 'Animación de Entrada', type: 'boolean', defaultValue: true },
      { id: 'stagger_anim', label: 'Efecto Escalonado', type: 'boolean', defaultValue: true, showIf: { settingId: 'entrance_anim', value: true } }
    ],
    multimedia: [...PARALLAX_BACKGROUND_SETTINGS],
    contenido: [], tipografia: []
  },
  elements: [
    { id: 'el_bento_header', name: 'Textos', type: 'single', groups: ['title', 'subtitle', 'estructura'], settings: {
      title: [
        { id: 'title', label: 'Título Principal', type: 'text', defaultValue: 'Diseño **Flexible** y Dinámico' },
        { id: 'title_size', label: 'Tamaño', type: 'typography_size', defaultValue: 't2', allowedLevels: ['t1', 't2', 't3'] },
        { id: 'title_weight', label: 'Peso', type: 'font_weight', defaultValue: 'extrabold' },
        { id: 'title_color', label: 'Color Título', type: 'color', defaultValue: '#0F172A' },
        ...HIGHLIGHT_SETTINGS('title')
      ],
      subtitle: [
        { id: 'subtitle', label: 'Subtítulo', type: 'text', defaultValue: 'Crea composiciones únicas adaptadas a cualquier necesidad.' },
        { id: 'subtitle_size', label: 'Tamaño', type: 'typography_size', defaultValue: 'p', allowedLevels: ['t3', 'p', 's'] },
        { id: 'subtitle_weight', label: 'Peso', type: 'font_weight', defaultValue: 'normal' },
        { id: 'subtitle_color', label: 'Color Subtítulo', type: 'color', defaultValue: '#64748B' },
        ...HIGHLIGHT_SETTINGS('subtitle')
      ],
      estructura: [
        { id: 'eyebrow', label: 'Cejilla (Eyebrow)', type: 'text', defaultValue: 'CREATIVIDAD' },
        { id: 'eyebrow_color', label: 'Color Cejilla', type: 'color', defaultValue: '#3B82F6' },
        { id: 'align', label: 'Alineación', type: 'select', defaultValue: 'center', options: [
          { label: 'Izquierda', value: 'left' },
          { label: 'Centro', value: 'center' },
          { label: 'Derecha', value: 'right' }
        ]},
        { id: 'margin_b', label: 'Margen Inferior', type: 'range', defaultValue: 60, min: 0, max: 120, unit: 'px' }
      ],
      tipografia: [], estilo: [], multimedia: [], interaccion: []
    }},
    { id: 'el_bento_items', name: 'Bloques de Contenido (Celdas)', type: 'repeater', groups: ['contenido', 'estructura', 'estilo', 'tipografia', 'multimedia', 'interaccion'], settings: {
      contenido: [
        { id: 'type', label: 'Tipo de Celda', type: 'select', defaultValue: 'text', options: [
          { label: 'Texto Editorial', value: 'text' },
          { label: 'Imagen de Impacto', value: 'image' },
          { label: 'Icono + Feature', value: 'icon_text' },
          { label: 'Estadística / Número', value: 'stat' },
          { label: 'Botón / CTA', value: 'cta' },
          { label: 'Video de Fondo', value: 'video' }
        ]},
        { id: 'title', label: 'Título / Valor', type: 'text', defaultValue: 'Título del Bloque', showIf: { settingId: 'type', value: ['image'], operator: 'neq' as const } },
        { id: 'description', label: 'Descripción', type: 'text', defaultValue: 'Descripción corta del bloque.', showIf: { settingId: 'type', value: ['text', 'icon_text', 'stat'], operator: 'includes' as const } },
        { id: 'icon', label: 'Icono', type: 'icon', defaultValue: 'Sparkles', showIf: { settingId: 'type', value: ['icon_text', 'stat'], operator: 'includes' as const } },
        { id: 'button_text', label: 'Texto Botón / Link', type: 'text', defaultValue: 'Explorar', showIf: { settingId: 'type', value: 'cta' } },
        ...BUTTON_LINK_SETTINGS('btn').map(s => ({ ...s, showIf: { settingId: 'type', value: ['cta', 'image', 'text'], operator: 'includes' as const } })),
        { id: 'eyebrow', label: 'Cejilla (Eyebrow)', type: 'text', defaultValue: '', description: 'Pequeño texto arriba del título' }
      ],
      estructura: [
        { id: 'col_span', label: 'Ancho (Columnas 1-12)', type: 'range', defaultValue: 4, min: 1, max: 12 },
        { id: 'row_span', label: 'Alto (Celdas)', type: 'range', defaultValue: 2, min: 1, max: 8 },
        { id: 'padding', label: 'Padding Interno', type: 'range', defaultValue: 32, min: 0, max: 80, unit: 'px' },
        { id: 'content_align', label: 'Alineación Celda', type: 'select', defaultValue: 'center', options: [
          { label: 'Inicio (Arriba-Izquierda)', value: 'top-left' },
          { label: 'Centro', value: 'center' },
          { label: 'Final (Abajo-Derecha)', value: 'bottom-right' }
        ]},
        { id: 'z_index', label: 'Prioridad de Capa (z-index)', type: 'range', defaultValue: 1, min: 1, max: 10 }
      ],
      estilo: [
        { id: 'card_style', label: 'Estilo Visual', type: 'select', defaultValue: 'solid', options: [
          { label: 'Sólido', value: 'solid' },
          { label: 'Degradado', value: 'gradient' },
          { label: 'Cristal (Blur)', value: 'glass' },
          { label: 'Brillo (Glow)', value: 'glow' },
          { label: 'Transparente', value: 'transparent' }
        ]},
        { id: 'card_bg', label: 'Color Fondo', type: 'color', defaultValue: '#FFFFFF', showIf: { settingId: 'card_style', value: 'solid' } },
        { id: 'card_gradient', label: 'Degradado Fondo', type: 'gradient', defaultValue: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)', showIf: { settingId: 'card_style', value: 'gradient' } },
        { id: 'card_border', label: 'Color Borde', type: 'color', defaultValue: 'rgba(0,0,0,0.05)' },
        { id: 'card_radius', label: 'Redondeo (Radio)', type: 'range', defaultValue: 28, min: 0, max: 64, unit: 'px' },
        { id: 'card_shadow', label: 'Sombra', type: 'select', defaultValue: 'sm', options: [
          { label: 'Ninguna', value: 'none' },
          { label: 'Suave', value: 'sm' },
          { label: 'Fuerte', value: 'lg' },
          { label: 'Flotante', value: 'xl' }
        ]},
        { id: 'hover_effect', label: 'Efecto al Hover', type: 'select', defaultValue: 'lift', options: [
          { label: 'Ninguno', value: 'none' },
          { label: 'Levantar', value: 'lift' },
          { label: 'Zoom', value: 'zoom' },
          { label: 'Pulso', value: 'pulse' }
        ]}
      ],
      tipografia: [
        { id: 'title_size', label: 'Tamaño Título', type: 'typography_size', defaultValue: 't3', allowedLevels: ['t1', 't2', 't3', 'p'] },
        { id: 'title_weight', label: 'Peso Título', type: 'font_weight', defaultValue: 'extrabold' },
        { id: 'title_color', label: 'Color Título', type: 'color', defaultValue: '#0F172A' },
        { id: 'desc_size', label: 'Tamaño Descripción', type: 'typography_size', defaultValue: 'p', allowedLevels: ['p', 's'] },
        { id: 'desc_color', label: 'Color Descripción', type: 'color', defaultValue: '#64748B' }
      ],
      multimedia: [
        { id: 'image', label: 'Imagen de Fondo', type: 'image', defaultValue: 'https://picsum.photos/seed/bento/800/600', showIf: { settingId: 'type', value: ['image', 'video', 'text'], operator: 'includes' } },
        { id: 'image_fit', label: 'Ajuste Multimedia', type: 'select', defaultValue: 'cover', options: [
          { label: 'Cubrir (Cover)', value: 'cover' },
          { label: 'Contener (Contain)', value: 'contain' }
        ]},
        { id: 'overlay_opacity', label: 'Opacidad Overlay', type: 'range', defaultValue: 0, min: 0, max: 100, unit: '%' }
      ],
      interaccion: [
        { id: 'hover_effect', label: 'Efecto al Hover', type: 'select', defaultValue: 'lift', options: [
          { label: 'Ninguno', value: 'none' },
          { label: 'Levantar (Lift)', value: 'lift' },
          { label: 'Expandir (Zoom)', value: 'zoom' },
          { label: 'Brillo (Pulse)', value: 'pulse' }
        ]},
        { id: 'parallax_effect', label: 'Efecto Paralaje', type: 'boolean', defaultValue: false }
      ]
    }}
  ]
};

export const COMPARISON_MODULE: WebModule = {
  id: 'mod_comparison_1',
  type: 'comparative',
  iconKey: 'comparative',
  name: 'Comparativo',
  globalGroups: ['contenido', 'estructura', 'estilo', 'interaccion'],
  globalSettings: {
    contenido: [],
    estructura: [
      { id: 'padding_y', label: 'Padding Vertical', type: 'range', defaultValue: 100, min: 40, max: 200, unit: 'px' },
      { id: 'max_width', label: 'Ancho Máximo Slider', type: 'range', defaultValue: 1000, min: 600, max: 1400, unit: 'px' },
      { id: 'aspect_ratio', label: 'Proporción de Imagen', type: 'select', defaultValue: '16/9', options: [
        { label: 'Panorámico (16:9)', value: '16/9' },
        { label: 'Estándar (4:3)', value: '4/3' },
        { label: 'Cuadrado (1:1)', value: '1/1' },
        { label: 'Vertical (9:16)', value: '9/16' },
        { label: 'Automático', value: 'auto' }
      ]}
    ],
    estilo: [
      { id: 'dark_mode', label: 'Modo Oscuro', type: 'boolean', defaultValue: false },
      { id: 'bg_color', label: 'Color de Fondo', type: 'color', defaultValue: '#FFFFFF' },
      { id: 'handle_color', label: 'Color del Slider', type: 'color', defaultValue: '#3B82F6' },
      { id: 'border_radius', label: 'Redondeo Contenedor', type: 'range', defaultValue: 24, min: 0, max: 60 }
    ],
    interaccion: [
      { id: 'initial_position', label: 'Posición Inicial', type: 'range', defaultValue: 50, min: 0, max: 100, unit: '%' },
      { id: 'show_labels', label: 'Mostrar Etiquetas', type: 'boolean', defaultValue: true },
      { id: 'label_before', label: 'Etiqueta Antes', type: 'text', defaultValue: 'Antes' },
      { id: 'label_after', label: 'Etiqueta Después', type: 'text', defaultValue: 'Después' }
    ]
  },
  elements: [
    { id: 'el_comp_text', name: 'Textos', type: 'text', groups: ['title', 'subtitle'], settings: {
      title: [
        { id: 'title', label: 'Texto del Título', type: 'text', defaultValue: 'Nuestros **Resultados**' },
        { id: 'title_size', label: 'Tamaño', type: 'typography_size', defaultValue: 't1', allowedLevels: ['t1', 't2', 't3'] },
        { id: 'title_weight', label: 'Peso', type: 'font_weight', defaultValue: 'extrabold' },
        { id: 'title_color', label: 'Color del Título', type: 'color', defaultValue: 'inherit' },
        ...HIGHLIGHT_SETTINGS('title')
      ],
      subtitle: [
        { id: 'subtitle', label: 'Texto del Subtítulo', type: 'text', defaultValue: 'Desliza para ver la transformación real de nuestros proyectos.' },
        { id: 'subtitle_size', label: 'Tamaño', type: 'typography_size', defaultValue: 'p', allowedLevels: ['t3', 'p', 's'] },
        { id: 'subtitle_weight', label: 'Peso', type: 'font_weight', defaultValue: 'normal' },
        { id: 'subtitle_color', label: 'Color del Subtítulo', type: 'color', defaultValue: 'inherit' },
        ...HIGHLIGHT_SETTINGS('subtitle')
      ]
    }},
    { id: 'el_comp_images', name: 'Imágenes a Comparar', type: 'multimedia', groups: ['multimedia'], settings: {
      multimedia: [
        { id: 'img_before', label: 'Imagen ANTES', type: 'image', defaultValue: 'https://picsum.photos/seed/before/1920/1080' },
        { id: 'img_after', label: 'Imagen DESPUÉS', type: 'image', defaultValue: 'https://picsum.photos/seed/after/1920/1080' }
      ]
    }}
  ]
};

export const GROUP_LABELS: Record<SettingGroupType, string> = {
  contenido: 'Contenido',
  estructura: 'Estructura',
  estilo: 'Estilo',
  tipografia: 'Tipografía',
  multimedia: 'Multimedia',
  interaccion: 'Interacción',
  secciones: 'Secciones',
  eyebrow: 'Cejilla',
  title: 'Título Principal',
  subtitle: 'Subtítulo',
  description: 'Descripción',
  texto_rotativo: 'Texto Dinámico'
};

export const MODULE_INFO: Record<string, { label: string; icon: React.ElementType }> = {
  header: { label: 'Barra superior', icon: PanelTop },
  menu: { label: 'Menú', icon: Menu },
  footer: { label: 'Pie de página', icon: PanelBottom },
  spacer: { label: 'Espaciadores', icon: SeparatorHorizontal },
  products: { label: 'Productos', icon: ShoppingBag },
  hero: { label: 'Portada', icon: Sparkles },
  features: { label: 'Características', icon: ListChecks },
  about: { label: 'Sobre Nosotros', icon: Info },
  process: { label: 'Proceso', icon: Workflow },
  gallery: { label: 'Galería', icon: Images },
  video: { label: 'Video', icon: PlayCircle },
  testimonials: { label: 'Testimonios', icon: Quote },
  stats: { label: 'Estadísticas', icon: BarChart3 },
  newsletter: { label: 'Newsletter', icon: Send },
  contact: { label: 'Contacto', icon: PhoneCall },
  team: { label: 'Equipo', icon: Users2 },
  cta: { label: 'Call to Action', icon: MousePointerClick },
  pricing: { label: 'Precios', icon: Tags },
  faq: { label: 'FAQ', icon: MessageCircleQuestion },
  comparative: { label: 'Comparativo', icon: Columns2 },
  clients: { label: 'Clientes', icon: Handshake },
  bento: { label: 'Composición Libre', icon: Layout }
};
