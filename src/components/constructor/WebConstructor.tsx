import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { 
  Home, 
  PlusCircle, 
  Settings, 
  Database,
  Layout, 
  Type, 
  Layers, 
  Eye, 
  Save, 
  Smartphone, 
  Monitor, 
  Tablet,
  RotateCcw, 
  Maximize, 
  Plus, 
  Mail,
  Users,
  ChevronDown, 
  ChevronRight, 
  ChevronLeft,
  ChevronUp,
  Sparkles, 
  Trash2, 
  Link as LinkIcon, 
  GripVertical,
  CheckCircle2,
  FileText,
  User,
  Image as ImageIcon,
  Star,
  MousePointer2,
  HelpCircle,
  Box,
  Send,
  CreditCard,
  Upload,
  Loader2,
  Check,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DataTab } from '../DataTab';
import { Project, RenderingContract, WebBuilderSite, PublishedSite } from '../../types/schema';
import { WebModule, ModuleElement, SettingGroupType, EditorState, SettingDefinition } from '../../types/constructor';
import { ProductsModule } from './modules/ProductsModule';
import { HeroModule } from './modules/HeroModule';
import { FeaturesModule } from './modules/FeaturesModule';
import { AboutModule } from './modules/AboutModule';
import { ProcessModule } from './modules/ProcessModule';
import { GalleryModule } from './modules/GalleryModule';
import { VideoModule } from './modules/VideoModule';
import { TestimonialsModule } from './modules/TestimonialsModule';
import { StatsModule } from './modules/StatsModule';
import { TeamModule } from './modules/TeamModule';
import { PricingModule } from './modules/PricingModule';
import { FAQModule } from './modules/FAQModule';
import { ContactModule } from './modules/ContactModule';
import { ClientsModule } from './modules/ClientsModule';
import { CTAModule } from './modules/CTAModule';
import { NewsletterModule } from './modules/NewsletterModule';
import { HeaderModule } from './modules/HeaderModule';
import { MenuModule } from './modules/MenuModule';
import { FooterModule } from './modules/FooterModule';
import { SpacerModule } from './modules/SpacerModule';
import { saveWebBuilderSiteDraft, publishWebBuilderSite, linkSubdomain, getProducts, getCustomers } from '../../services/dataService';
import { syncAsset } from '../../services/assetService';
import { Product, Customer } from '../../types/schema';
import { MOCK_PRODUCTS, MOCK_CUSTOMERS } from '../../constants/mockData';

// --- CONSTANTS ---

const HEADER_MODULE: WebModule = {
  id: 'mod_header_1',
  type: 'header',
  name: 'Barra Superior (Header)',
  globalGroups: ['estructura', 'estilo', 'interaccion'],
  globalSettings: {
    estructura: [
      { id: 'position', label: 'Posición', type: 'select', defaultValue: 'sticky', options: [
        { label: 'Fijo al Scroll (Sticky)', value: 'sticky' },
        { label: 'Fijo Superior (Fixed)', value: 'fixed' },
        { label: 'Estático', value: 'static' }
      ]},
      { id: 'height', label: 'Altura de Barra', type: 'range', defaultValue: 80, min: 60, max: 120, unit: 'px' },
      { id: 'max_width', label: 'Ancho Máximo', type: 'range', defaultValue: 1400, min: 1000, max: 1920, unit: 'px' },
      { id: 'menu_alignment', label: 'Alineación Menú', type: 'select', defaultValue: 'center', options: [
        { label: 'Izquierda', value: 'left' },
        { label: 'Centro', value: 'center' },
        { label: 'Derecha', value: 'right' }
      ]}
    ],
    estilo: [
      { id: 'bg_type', label: 'Tipo de Fondo', type: 'select', defaultValue: 'glass', options: [
        { label: 'Sólido', value: 'solid' },
        { label: 'Glassmorphism', value: 'glass' },
        { label: 'Transparente', value: 'transparent' }
      ]},
      { id: 'bg_color', label: 'Color de Fondo', type: 'color', defaultValue: '#FFFFFF' },
      { id: 'border_color', label: 'Color de Borde Inferior', type: 'color', defaultValue: 'rgba(0,0,0,0.05)' },
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
    { id: 'el_header_logo', name: 'Identidad (Logo)', type: 'multimedia', groups: ['contenido', 'multimedia', 'estructura'], settings: {
      contenido: [
        { id: 'logo_type', label: 'Tipo de Logo', type: 'select', defaultValue: 'image', options: [{label:'Imagen', value:'image'}, {label:'Texto', value:'text'}]},
        { id: 'logo_text', label: 'Texto del Logo', type: 'text', defaultValue: 'MI MARCA' }
      ],
      multimedia: [
        { id: 'logo_img', label: 'Imagen de Logo', type: 'image', defaultValue: '' },
        { id: 'logo_img_alt', label: 'Logo Secundario (Modo Transparente)', type: 'image', defaultValue: '' }
      ],
      estructura: [
        { id: 'logo_width', label: 'Ancho del Logo', type: 'range', defaultValue: 120, min: 40, max: 240, unit: 'px' }
      ],
      estilo: [], tipografia: [], interaccion: []
    }},
    { id: 'el_header_nav', name: 'Navegación Principal', type: 'text', groups: ['contenido', 'tipografia', 'estilo'], settings: {
      contenido: [
        { 
          id: 'links', 
          label: 'Enlaces', 
          type: 'repeater', 
          defaultValue: [
            {label: "Inicio", url: "#"},
            {label: "Servicios", url: "#servicios"},
            {label: "Nosotros", url: "#nosotros"},
            {label: "Contacto", url: "#contacto"}
          ],
          fields: [
            { id: 'label', label: 'Etiqueta', type: 'text', defaultValue: 'Enlace' },
            { id: 'url', label: 'URL', type: 'text', defaultValue: '#' },
            { id: 'has_dropdown', label: '¿Tiene Submenú?', type: 'boolean', defaultValue: false },
            { id: 'submenu_items', label: 'Items Submenú (JSON)', type: 'text', defaultValue: '[]' }
          ]
        }
      ],
      tipografia: [
        { id: 'font_size', label: 'Tamaño Fuente', type: 'range', defaultValue: 15, min: 12, max: 20 },
        { id: 'font_weight', label: 'Grosor', type: 'select', defaultValue: 'medium', options: [{label:'Regular', value:'normal'}, {label:'Medium', value:'medium'}, {label:'Bold', value:'bold'}]},
        { id: 'link_color', label: 'Color de Enlaces', type: 'color', defaultValue: '#0F172A' }
      ],
      estilo: [
        { id: 'active_style', label: 'Estilo Activo', type: 'select', defaultValue: 'underline', options: [{label:'Línea Inferior', value:'underline'}, {label:'Fondo Suave', value:'pill'}, {label:'Punto', value:'dot'}]},
        { id: 'active_color', label: 'Color Activo', type: 'color', defaultValue: 'var(--primary-color)' }
      ],
      estructura: [], multimedia: [], interaccion: []
    }},
    { id: 'el_header_actions', name: 'Botón de Acción', type: 'style', groups: ['contenido', 'estilo', 'interaccion'], settings: {
      contenido: [
        { id: 'show_btn', label: 'Mostrar Botón', type: 'boolean', defaultValue: true },
        { id: 'btn_text', label: 'Texto del Botón', type: 'text', defaultValue: 'Empezar' }
      ],
      estilo: [
        { id: 'btn_style', label: 'Estilo', type: 'select', defaultValue: 'solid', options: [{label:'Sólido', value:'solid'}, {label:'Contorno', value:'outline'}]},
        { id: 'btn_bg', label: 'Fondo Botón', type: 'color', defaultValue: 'var(--primary-color)' },
        { id: 'btn_color', label: 'Color Texto', type: 'color', defaultValue: '#FFFFFF' },
        { id: 'btn_radius', label: 'Redondeado', type: 'range', defaultValue: 12, min: 0, max: 40 }
      ],
      interaccion: [
        { id: 'btn_hover', label: 'Efecto Hover', type: 'select', defaultValue: 'scale', options: [{label:'Escala', value:'scale'}, {label:'Brillo', value:'glow'}]}
      ],
      estructura: [], tipografia: [], multimedia: []
    }}
  ]
};

const MENU_MODULE: WebModule = {
  id: 'mod_menu_1',
  type: 'menu',
  name: 'Menú de Navegación',
  globalGroups: ['estructura', 'estilo', 'interaccion'],
  globalSettings: {
    estructura: [
      { id: 'layout', label: 'Diseño', type: 'select', defaultValue: 'horizontal', options: [
        { label: 'Horizontal (Barra)', value: 'horizontal' },
        { label: 'Vertical (Lista)', value: 'vertical' },
        { label: 'Grilla (Mega-menú)', value: 'grid' }
      ]},
      { id: 'align', label: 'Alineación', type: 'select', defaultValue: 'center', options: [
        { label: 'Inicio', value: 'start' },
        { label: 'Centro', value: 'center' },
        { label: 'Fin', value: 'end' }
      ]},
      { id: 'gap', label: 'Espaciado entre items', type: 'range', defaultValue: 24, min: 0, max: 64, unit: 'px' },
      { id: 'padding_y', label: 'Padding Vertical', type: 'range', defaultValue: 20, min: 0, max: 100, unit: 'px' }
    ],
    estilo: [
      { id: 'bg_color', label: 'Fondo del Contenedor', type: 'color', defaultValue: 'transparent' },
      { id: 'border_radius', label: 'Redondeado', type: 'range', defaultValue: 12, min: 0, max: 40 }
    ],
    interaccion: [
      { id: 'entrance_anim', label: 'Animación de Entrada', type: 'boolean', defaultValue: true }
    ],
    contenido: [], tipografia: [], multimedia: []
  },
  elements: [
    { id: 'el_menu_items', name: 'Lista de Enlaces', type: 'text', groups: ['contenido', 'tipografia', 'multimedia'], settings: {
      contenido: [
        { 
          id: 'links', 
          label: 'Enlaces', 
          type: 'repeater', 
          defaultValue: [
            {label: "Inicio", url: "#", icon: "Home"},
            {label: "Servicios", url: "#servicios", badge: "Nuevo"},
            {label: "Portafolio", url: "#portafolio"},
            {label: "Contacto", url: "#contacto"}
          ],
          fields: [
            { id: 'label', label: 'Etiqueta', type: 'text', defaultValue: 'Enlace' },
            { id: 'url', label: 'URL', type: 'text', defaultValue: '#' },
            { id: 'icon', label: 'Icono', type: 'icon', defaultValue: '' },
            { id: 'badge', label: 'Badge', type: 'text', defaultValue: '' },
            { id: 'is_title', label: '¿Es Título de Sección?', type: 'boolean', defaultValue: false }
          ]
        }
      ],
      tipografia: [
        { id: 'font_size', label: 'Tamaño Fuente', type: 'range', defaultValue: 15, min: 12, max: 24 },
        { id: 'font_weight', label: 'Grosor', type: 'select', defaultValue: 'medium', options: [{label:'Regular', value:'normal'}, {label:'Medium', value:'medium'}, {label:'Bold', value:'bold'}]},
        { id: 'text_color', label: 'Color de Texto', type: 'color', defaultValue: '#0F172A' }
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
        { id: 'active_color', label: 'Color Activo', type: 'color', defaultValue: 'var(--primary-color)' }
      ],
      interaccion: [
        { id: 'hover_scale', label: 'Efecto Escala', type: 'boolean', defaultValue: true }
      ],
      contenido: [], tipografia: [], multimedia: [], estructura: []
    }}
  ]
};

const FOOTER_MODULE: WebModule = {
  id: 'mod_footer_1',
  type: 'footer',
  name: 'Pie de Página (Footer)',
  globalGroups: ['estructura', 'estilo'],
  globalSettings: {
    estructura: [
      { id: 'padding_y', label: 'Padding Vertical', type: 'range', defaultValue: 80, min: 40, max: 160, unit: 'px' },
      { id: 'max_width', label: 'Ancho Máximo', type: 'range', defaultValue: 1400, min: 1000, max: 1920, unit: 'px' }
    ],
    estilo: [
      { id: 'bg_color', label: 'Color de Fondo', type: 'color', defaultValue: '#F8FAFC' },
      { id: 'text_color', label: 'Color de Texto', type: 'color', defaultValue: '#475569' },
      { id: 'border_top', label: 'Borde Superior', type: 'boolean', defaultValue: true },
      { id: 'border_color', label: 'Color de Borde', type: 'color', defaultValue: '#E2E8F0' }
    ],
    contenido: [], tipografia: [], multimedia: [], interaccion: []
  },
  elements: [
    { id: 'el_footer_brand', name: 'Identidad y Bio', type: 'multimedia', groups: ['contenido', 'multimedia', 'estructura'], settings: {
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
      estilo: [], tipografia: [], interaccion: []
    }},
    { id: 'el_footer_nav', name: 'Columnas de Navegación', type: 'text', groups: ['contenido', 'tipografia'], settings: {
      contenido: [
        { 
          id: 'columns', 
          label: 'Columnas', 
          type: 'repeater', 
          defaultValue: [
            { title: 'Producto', links: [{label: 'Características', url: '#'}, {label: 'Precios', url: '#'}] },
            { title: 'Compañía', links: [{label: 'Sobre Nosotros', url: '#'}, {label: 'Carreras', url: '#'}] }
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
        { id: 'title_size', label: 'Tamaño Título', type: 'range', defaultValue: 14, min: 12, max: 20 },
        { id: 'link_size', label: 'Tamaño Enlaces', type: 'range', defaultValue: 14, min: 12, max: 18 }
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
        { id: 'icon_hover', label: 'Color Hover', type: 'color', defaultValue: 'var(--primary-color)' }
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
        { id: 'icon_color', label: 'Color de Iconos', type: 'color', defaultValue: 'var(--primary-color)' }
      ],
      estructura: [], tipografia: [], multimedia: [], interaccion: []
    }},
    { id: 'el_footer_newsletter', name: 'Newsletter', type: 'text', groups: ['contenido', 'estilo', 'interaccion'], settings: {
      contenido: [
        { id: 'show_newsletter', label: 'Mostrar Newsletter', type: 'boolean', defaultValue: true },
        { id: 'news_title', label: 'Título', type: 'text', defaultValue: 'Suscríbete' },
        { id: 'news_desc', label: 'Descripción', type: 'text', defaultValue: 'Recibe las últimas noticias y ofertas.' },
        { id: 'placeholder', label: 'Placeholder', type: 'text', defaultValue: 'Tu email' },
        { id: 'btn_text', label: 'Texto Botón', type: 'text', defaultValue: 'Unirse' }
      ],
      estilo: [
        { id: 'input_bg', label: 'Fondo Input', type: 'color', defaultValue: '#FFFFFF' },
        { id: 'btn_bg', label: 'Fondo Botón', type: 'color', defaultValue: 'var(--primary-color)' },
        { id: 'btn_color', label: 'Color Texto Botón', type: 'color', defaultValue: '#FFFFFF' }
      ],
      interaccion: [
        { id: 'success_msg', label: 'Mensaje de Éxito', type: 'text', defaultValue: '¡Gracias por suscribirte!' }
      ],
      estructura: [], tipografia: [], multimedia: []
    }},
    { id: 'el_footer_bottom', name: 'Barra Inferior', type: 'text', groups: ['contenido', 'estilo'], settings: {
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
      estilo: [
        { id: 'bottom_bg', label: 'Fondo Barra Inferior', type: 'color', defaultValue: 'transparent' }
      ],
      estructura: [], tipografia: [], multimedia: [], interaccion: []
    }}
  ]
};

const SPACER_MODULE: WebModule = {
  id: 'mod_spacer_1',
  type: 'spacer',
  name: 'Espaciador y Divisor',
  globalGroups: ['estructura', 'estilo'],
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
    contenido: [], tipografia: [], multimedia: [], interaccion: []
  },
  elements: []
};

const PRODUCTS_MODULE: WebModule = {
  id: 'mod_products_1',
  type: 'products',
  name: 'Productos',
  globalGroups: ['contenido', 'estructura', 'estilo', 'multimedia', 'interaccion'],
  globalSettings: {
    contenido: [
      { id: 'section_title', label: 'Título de la Sección', type: 'text', defaultValue: 'Nuestros Productos' },
      { id: 'section_desc', label: 'Descripción', type: 'text', defaultValue: 'Descubre nuestra selección exclusiva de productos.' },
      { id: 'select_products', label: 'Selección de Productos', type: 'product_selection', defaultValue: [] }
    ],
    estructura: [
      { id: 'columns', label: 'Columnas', type: 'range', defaultValue: 4, min: 1, max: 6 },
      { id: 'gap', label: 'Espaciado', type: 'range', defaultValue: 24, min: 0, max: 100, unit: 'px' }
    ],
    estilo: [
      { id: 'dark_mode', label: 'Modo Oscuro', type: 'boolean', defaultValue: false },
      { id: 'bg_color', label: 'Color de Fondo', type: 'color', defaultValue: '#FFFFFF' }
    ],
    interaccion: [
      { id: 'hover_effect', label: 'Efecto al pasar el mouse', type: 'select', defaultValue: 'zoom', options: [
        { label: 'Ninguno', value: 'none' },
        { label: 'Zoom', value: 'zoom' },
        { label: 'Levantar', value: 'lift' }
      ]}
    ],
    tipografia: [],
    multimedia: [
      { id: 'section_bg_image', label: 'Imagen de Fondo de Sección', type: 'image', defaultValue: '' }
    ]
  },
  elements: [
    { 
      id: 'el_img', 
      name: 'Imagen del Producto', 
      type: 'image', 
      groups: ['multimedia', 'estilo'],
      settings: {
        multimedia: [
          { id: 'aspect_ratio', label: 'Proporción', type: 'select', defaultValue: '1:1', options: [
            { label: '1:1 (Cuadrado)', value: '1:1' },
            { label: '4:5 (Retrato)', value: '4:5' },
            { label: '16:9 (Panorámico)', value: '16:9' }
          ]}
        ],
        estilo: [
          { id: 'border_radius', label: 'Redondeo', type: 'range', defaultValue: 16, min: 0, max: 50, unit: 'px' }
        ],
        contenido: [], estructura: [], tipografia: [], interaccion: []
      }
    },
    { 
      id: 'el_title', 
      name: 'Título del Producto', 
      type: 'text', 
      groups: ['tipografia'],
      settings: {
        tipografia: [
          { id: 'font_size', label: 'Tamaño de Fuente', type: 'range', defaultValue: 16, min: 12, max: 24, unit: 'px' },
          { id: 'font_weight', label: 'Grosor', type: 'select', defaultValue: 'bold', options: [
            { label: 'Normal', value: 'normal' },
            { label: 'Medio', value: 'medium' },
            { label: 'Negrita', value: 'bold' },
            { label: 'Extra Negrita', value: 'black' }
          ]}
        ],
        contenido: [], estructura: [], estilo: [], multimedia: [], interaccion: []
      }
    },
    { 
      id: 'el_price', 
      name: 'Precio', 
      type: 'price', 
      groups: ['contenido', 'tipografia'],
      settings: {
        contenido: [
          { id: 'currency', label: 'Moneda', type: 'text', defaultValue: '$' }
        ],
        tipografia: [
          { id: 'price_size', label: 'Tamaño del Precio', type: 'range', defaultValue: 18, min: 14, max: 32, unit: 'px' }
        ],
        estructura: [], estilo: [], multimedia: [], interaccion: []
      }
    },
    { id: 'el_badge', name: 'Etiquetas / Badges', type: 'badge', groups: ['contenido', 'estilo'], settings: {
      contenido: [
        { id: 'show_badge', label: 'Mostrar Etiquetas', type: 'boolean', defaultValue: true }
      ],
      estilo: [
        { id: 'badge_bg', label: 'Color de Fondo', type: 'color', defaultValue: '#2563EB' }
      ],
      estructura: [],
      tipografia: [],
      multimedia: [],
      interaccion: []
    }},
    { id: 'el_rating', name: 'Valoración', type: 'rating', groups: ['contenido', 'estilo'], settings: {
      contenido: [
        { id: 'show_rating', label: 'Mostrar Valoración', type: 'boolean', defaultValue: true }
      ],
      estilo: [
        { id: 'star_color', label: 'Color de Estrellas', type: 'color', defaultValue: '#FBBF24' }
      ],
      estructura: [],
      tipografia: [],
      multimedia: [],
      interaccion: []
    }},
    { id: 'el_cta', name: 'Botón de Acción', type: 'button', groups: ['contenido', 'estilo', 'interaccion'], settings: {
      contenido: [
        { id: 'cta_text', label: 'Texto del Botón', type: 'text', defaultValue: 'Añadir' }
      ],
      estilo: [
        { id: 'cta_bg', label: 'Color de Fondo', type: 'color', defaultValue: '#0F172A' },
        { id: 'cta_color', label: 'Color de Texto', type: 'color', defaultValue: '#FFFFFF' }
      ],
      interaccion: [
        { id: 'cta_hover_bg', label: 'Color al pasar el mouse', type: 'color', defaultValue: '#2563EB' }
      ],
      estructura: [],
      tipografia: [],
      multimedia: []
    }},
    { id: 'el_desc', name: 'Descripción Corta', type: 'text', groups: ['contenido', 'tipografia'], settings: {
      contenido: [
        { id: 'show_desc', label: 'Mostrar Descripción', type: 'boolean', defaultValue: false }
      ],
      tipografia: [
        { id: 'desc_size', label: 'Tamaño de Fuente', type: 'range', defaultValue: 12, min: 10, max: 16, unit: 'px' }
      ],
      estructura: [],
      estilo: [],
      multimedia: [],
      interaccion: []
    }},
  ]
};

const HERO_MODULE: WebModule = {
  id: 'mod_hero_1',
  type: 'hero',
  name: 'Portada / Hero Premium',
  globalGroups: ['estructura', 'estilo', 'multimedia', 'interaccion'],
  globalSettings: {
    estructura: [
      { id: 'layout', label: 'Layout de Portada', type: 'select', defaultValue: 'split', options: [
        { label: 'Dividido (Texto/Imagen)', value: 'split' },
        { label: 'Centrado', value: 'centered' },
        { label: 'Fondo Completo', value: 'full' }
      ]},
      { id: 'padding_y', label: 'Espaciado Vertical', type: 'range', defaultValue: 100, min: 40, max: 200, unit: 'px' },
      { id: 'content_width', label: 'Ancho de Contenido', type: 'range', defaultValue: 1200, min: 800, max: 1400, unit: 'px' }
    ],
    estilo: [
      { id: 'bg_color', label: 'Color de Fondo', type: 'color', defaultValue: '#FFFFFF' },
      { id: 'overlay_opacity', label: 'Opacidad del Overlay', type: 'range', defaultValue: 0, min: 0, max: 100, unit: '%' }
    ],
    multimedia: [
      { id: 'bg_image', label: 'Imagen de Fondo', type: 'image', defaultValue: '' },
      { id: 'bg_video', label: 'URL Video de Fondo (MP4)', type: 'text', defaultValue: '' }
    ],
    interaccion: [
      { id: 'entrance_anim', label: 'Animación de Entrada', type: 'boolean', defaultValue: true },
      { id: 'parallax', label: 'Efecto Parallax', type: 'boolean', defaultValue: false }
    ],
    contenido: [],
    tipografia: []
  },
  elements: [
    { id: 'el_hero_eyebrow', name: 'Eyebrow (Pre-título)', type: 'text', groups: ['contenido', 'tipografia', 'estructura'], settings: {
      contenido: [{ id: 'text', label: 'Texto', type: 'text', defaultValue: 'NUEVA FUNCIÓN' }],
      tipografia: [
        { id: 'size', label: 'Tamaño', type: 'range', defaultValue: 14, min: 10, max: 20 },
        { id: 'weight', label: 'Grosor', type: 'select', defaultValue: 'bold', options: [{label:'Normal', value:'normal'}, {label:'Medio', value:'medium'}, {label:'Negrita', value:'bold'}]},
        { id: 'color', label: 'Color', type: 'color', defaultValue: 'var(--primary-color)' },
        { id: 'uppercase', label: 'Mayúsculas', type: 'boolean', defaultValue: true }
      ],
      estructura: [{ id: 'margin_b', label: 'Margen Inferior', type: 'range', defaultValue: 12, min: 0, max: 40 }],
      estilo: [], multimedia: [], interaccion: []
    }},
    { id: 'el_hero_title', name: 'Título Principal', type: 'text', groups: ['contenido', 'tipografia', 'estilo'], settings: {
      contenido: [{ id: 'text', label: 'Texto', type: 'text', defaultValue: 'Construye tu futuro digital' }],
      tipografia: [
        { id: 'size', label: 'Tamaño', type: 'range', defaultValue: 56, min: 32, max: 120 },
        { id: 'weight', label: 'Grosor', type: 'select', defaultValue: 'bold', options: [{label:'Normal', value:'normal'}, {label:'Medio', value:'medium'}, {label:'Negrita', value:'bold'}]},
        { id: 'color', label: 'Color de Texto', type: 'color', defaultValue: '#0F172A' }
      ],
      estilo: [
        { id: 'use_gradient', label: 'Usar Gradiente', type: 'boolean', defaultValue: false },
        { id: 'gradient_color', label: 'Color Final Gradiente', type: 'color', defaultValue: 'var(--primary-color)' }
      ],
      estructura: [], multimedia: [], interaccion: []
    }},
    { id: 'el_hero_subtitle', name: 'Subtítulo', type: 'text', groups: ['contenido', 'tipografia'], settings: {
      contenido: [{ id: 'text', label: 'Texto', type: 'text', defaultValue: 'La plataforma todo-en-uno para gestionar tu presencia online con elegancia y potencia.' }],
      tipografia: [
        { id: 'size', label: 'Tamaño', type: 'range', defaultValue: 18, min: 14, max: 24 },
        { id: 'color', label: 'Color', type: 'color', defaultValue: '#64748B' }
      ],
      estructura: [{ id: 'margin_b', label: 'Margen Inferior', type: 'range', defaultValue: 32, min: 0, max: 60 }],
      estilo: [], multimedia: [], interaccion: []
    }},
    { id: 'el_hero_cta', name: 'Botón Principal', type: 'button', groups: ['contenido', 'estilo', 'interaccion'], settings: {
      contenido: [
        { id: 'text', label: 'Texto del Botón', type: 'text', defaultValue: 'Empezar ahora' },
        { id: 'link', label: 'Enlace (URL)', type: 'text', defaultValue: '#' }
      ],
      estilo: [
        { id: 'bg_color', label: 'Color de Fondo', type: 'color', defaultValue: 'var(--primary-color)' },
        { id: 'text_color', label: 'Color de Texto', type: 'color', defaultValue: '#FFFFFF' }
      ],
      interaccion: [
        { id: 'hover_scale', label: 'Efecto al pasar mouse', type: 'boolean', defaultValue: true }
      ],
      tipografia: [], estructura: [], multimedia: []
    }},
    { id: 'el_hero_visual', name: 'Imagen/Video Principal', type: 'image', groups: ['multimedia', 'estructura', 'interaccion'], settings: {
      multimedia: [
        { id: 'url', label: 'Imagen', type: 'image', defaultValue: 'https://picsum.photos/seed/hero/800/600' },
        { id: 'fit', label: 'Ajuste', type: 'select', defaultValue: 'contain', options: [{label:'Contener', value:'contain'}, {label:'Cubrir', value:'cover'}]}
      ],
      estructura: [
        { id: 'max_width', label: 'Ancho Máximo', type: 'range', defaultValue: 600, min: 200, max: 1000 },
        { id: 'radius', label: 'Radio de Borde', type: 'range', defaultValue: 24, min: 0, max: 100 }
      ],
      interaccion: [
        { id: 'floating', label: 'Efecto Flotante', type: 'boolean', defaultValue: true }
      ],
      contenido: [], tipografia: [], estilo: []
    }}
  ]
};

const FEATURES_MODULE: WebModule = {
  id: 'mod_features_1',
  type: 'features',
  name: 'Características Avanzadas',
  globalGroups: ['contenido', 'estructura', 'estilo', 'interaccion'],
  globalSettings: {
    contenido: [
      { 
        id: 'features', 
        label: 'Lista de Características', 
        type: 'repeater', 
        defaultValue: [
          { title: 'Velocidad Increíble', desc: 'Optimizado para cargar en menos de 1 segundo.', icon: 'Zap', badge: 'Popular' },
          { title: 'Seguridad Total', desc: 'Protección de datos con los más altos estándares.', icon: 'Shield', badge: '' },
          { title: 'Soporte 24/7', desc: 'Estamos aquí para ayudarte en cualquier momento.', icon: 'Headphones', badge: '' },
          { title: 'Diseño Adaptable', desc: 'Se ve perfecto en cualquier dispositivo.', icon: 'Smartphone', badge: '' },
          { title: 'Fácil de Usar', desc: 'Interfaz intuitiva diseñada para todos.', icon: 'Layout', badge: '' },
          { title: 'Escalabilidad', desc: 'Crece con tu negocio sin complicaciones.', icon: 'TrendingUp', badge: 'Nuevo' }
        ],
        fields: [
          { id: 'title', label: 'Título', type: 'text', defaultValue: 'Nueva Característica' },
          { id: 'desc', label: 'Descripción', type: 'text', defaultValue: 'Descripción de la característica...' },
          { id: 'icon', label: 'Icono', type: 'icon', defaultValue: 'Check' },
          { id: 'badge', label: 'Etiqueta (Badge)', type: 'text', defaultValue: '' },
          { id: 'link', label: 'Enlace (URL)', type: 'text', defaultValue: '' }
        ]
      }
    ],
    estructura: [
      { id: 'layout', label: 'Diseño de Grilla', type: 'select', defaultValue: 'grid', options: [
        { label: 'Grilla Estándar', value: 'grid' },
        { label: 'Lista (Icono Lateral)', value: 'list' },
        { label: 'Bento (Asimétrico)', value: 'bento' }
      ]},
      { id: 'columns', label: 'Columnas (Desktop)', type: 'range', defaultValue: 3, min: 1, max: 4 },
      { id: 'gap', label: 'Espacio entre tarjetas', type: 'range', defaultValue: 32, min: 16, max: 64, unit: 'px' },
      { id: 'padding_y', label: 'Padding Vertical', type: 'range', defaultValue: 100, min: 40, max: 160, unit: 'px' }
    ],
    estilo: [
      { id: 'bg_color', label: 'Fondo de Sección', type: 'color', defaultValue: 'transparent' },
      { id: 'show_divider', label: 'Mostrar Divisor', type: 'boolean', defaultValue: false }
    ],
    interaccion: [
      { id: 'stagger_anim', label: 'Entrada Escalonada', type: 'boolean', defaultValue: true }
    ],
    tipografia: [], multimedia: []
  },
  elements: [
    { id: 'el_features_header', name: 'Encabezado de Sección', type: 'text', groups: ['contenido', 'tipografia', 'estructura'], settings: {
      contenido: [
        { id: 'eyebrow', label: 'Pre-título', type: 'text', defaultValue: 'CARACTERÍSTICAS' },
        { id: 'title', label: 'Título', type: 'text', defaultValue: '¿Por qué elegirnos?' },
        { id: 'subtitle', label: 'Subtítulo', type: 'text', defaultValue: 'Soluciones diseñadas para escalar tu negocio al siguiente nivel.' }
      ],
      tipografia: [
        { id: 'align', label: 'Alineación', type: 'select', defaultValue: 'center', options: [{label:'Izquierda', value:'left'}, {label:'Centro', value:'center'}]},
        { id: 'title_size', label: 'Tamaño Título', type: 'range', defaultValue: 40, min: 24, max: 64 },
        { id: 'title_color', label: 'Color Título', type: 'color', defaultValue: '#0F172A' },
        { id: 'eyebrow_color', label: 'Color Pre-título', type: 'color', defaultValue: 'var(--primary-color)' }
      ],
      estructura: [{ id: 'margin_b', label: 'Margen Inferior', type: 'range', defaultValue: 80, min: 20, max: 120 }],
      estilo: [], multimedia: [], interaccion: []
    }},
    { id: 'el_feature_card', name: 'Estilo de Tarjeta', type: 'style', groups: ['estilo', 'estructura', 'tipografia', 'interaccion'], settings: {
      estilo: [
        { id: 'card_bg', label: 'Fondo de Tarjeta', type: 'color', defaultValue: '#FFFFFF' },
        { id: 'card_border', label: 'Color de Borde', type: 'color', defaultValue: 'rgba(0,0,0,0.05)' },
        { id: 'card_shadow', label: 'Sombra', type: 'select', defaultValue: 'sm', options: [{label:'Ninguna', value:'none'}, {label:'Suave', value:'sm'}, {label:'Fuerte', value:'lg'}]}
      ],
      tipografia: [
        { id: 'card_title_size', label: 'Tamaño Título Card', type: 'range', defaultValue: 20, min: 16, max: 28 },
        { id: 'card_desc_size', label: 'Tamaño Desc Card', type: 'range', defaultValue: 15, min: 12, max: 20 }
      ],
      estructura: [
        { id: 'card_padding', label: 'Padding Interno', type: 'range', defaultValue: 32, min: 16, max: 48 },
        { id: 'card_radius', label: 'Radio de Borde', type: 'range', defaultValue: 24, min: 0, max: 40 }
      ],
      interaccion: [
        { id: 'hover_lift', label: 'Elevar al pasar mouse', type: 'boolean', defaultValue: true }
      ],
      contenido: [], multimedia: []
    }},
    { id: 'el_feature_icon', name: 'Iconografía', type: 'image', groups: ['multimedia', 'estilo', 'estructura'], settings: {
      multimedia: [{ id: 'icon_size', label: 'Tamaño de Icono', type: 'range', defaultValue: 24, min: 16, max: 48 }],
      estilo: [
        { id: 'icon_color', label: 'Color de Icono', type: 'color', defaultValue: 'var(--primary-color)' },
        { id: 'icon_bg', label: 'Fondo del Icono', type: 'color', defaultValue: 'rgba(var(--primary-rgb), 0.1)' }
      ],
      estructura: [{ id: 'icon_radius', label: 'Redondeado Icono', type: 'range', defaultValue: 12, min: 0, max: 24 }],
      contenido: [], tipografia: [], interaccion: []
    }}
  ]
};

const ABOUT_MODULE: WebModule = {
  id: 'mod_about_1',
  type: 'about',
  name: 'Sobre Nosotros Premium',
  globalGroups: ['estructura', 'estilo', 'interaccion'],
  globalSettings: {
    estructura: [
      { id: 'layout', label: 'Layout de Sección', type: 'select', defaultValue: 'split_right', options: [
        { label: 'Imagen Izquierda / Texto Derecha', value: 'split_left' },
        { label: 'Texto Izquierda / Imagen Derecha', value: 'split_right' },
        { label: 'Centrado (Narrativo)', value: 'centered' },
        { label: 'Superposición (Overlapping)', value: 'overlapping' }
      ]},
      { id: 'padding_y', label: 'Padding Vertical', type: 'range', defaultValue: 120, min: 40, max: 240, unit: 'px' },
      { id: 'content_width', label: 'Ancho de Contenido', type: 'range', defaultValue: 1200, min: 800, max: 1400, unit: 'px' }
    ],
    estilo: [
      { id: 'bg_color', label: 'Fondo de Sección', type: 'color', defaultValue: '#FFFFFF' },
      { id: 'show_decor', label: 'Elementos Decorativos', type: 'boolean', defaultValue: true }
    ],
    interaccion: [
      { id: 'entrance_anim', label: 'Animación de Entrada', type: 'boolean', defaultValue: true }
    ],
    contenido: [], tipografia: [], multimedia: []
  },
  elements: [
    { id: 'el_about_narrative', name: 'Bloque Narrativo', type: 'text', groups: ['contenido', 'tipografia', 'estructura'], settings: {
      contenido: [
        { id: 'eyebrow', label: 'Pre-título', type: 'text', defaultValue: 'NUESTRA HISTORIA' },
        { id: 'title', label: 'Título Principal', type: 'text', defaultValue: 'Innovación con propósito humano' },
        { id: 'description', label: 'Descripción', type: 'text', defaultValue: 'Desde 2015, hemos transformado la manera en que las empresas interactúan con la tecnología, poniendo siempre a las personas en el centro de cada solución.' },
        { id: 'quote', label: 'Cita (Quote)', type: 'text', defaultValue: '' },
        { id: 'signature_url', label: 'Imagen de Firma', type: 'image', defaultValue: '' },
        { id: 'button_text', label: 'Texto Botón', type: 'text', defaultValue: 'Saber más' },
        { id: 'button_link', label: 'Enlace Botón', type: 'text', defaultValue: '#' }
      ],
      tipografia: [
        { id: 'title_size', label: 'Tamaño Título', type: 'range', defaultValue: 48, min: 32, max: 72 },
        { id: 'title_color', label: 'Color Título', type: 'color', defaultValue: '#0F172A' },
        { id: 'desc_size', label: 'Tamaño Descripción', type: 'range', defaultValue: 18, min: 14, max: 24 },
        { id: 'eyebrow_color', label: 'Color Pre-título', type: 'color', defaultValue: 'var(--primary-color)' }
      ],
      estructura: [
        { id: 'align', label: 'Alineación de Texto', type: 'select', defaultValue: 'left', options: [{label:'Izquierda', value:'left'}, {label:'Centro', value:'center'}, {label:'Derecha', value:'right'}]}
      ],
      estilo: [], multimedia: [], interaccion: []
    }},
    { id: 'el_about_visual', name: 'Elemento Visual', type: 'image', groups: ['multimedia', 'estilo', 'interaccion'], settings: {
      multimedia: [
        { id: 'image_url', label: 'Imagen / Video', type: 'image', defaultValue: 'https://picsum.photos/seed/about/800/600' },
        { id: 'visual_fit', label: 'Ajuste', type: 'select', defaultValue: 'cover', options: [{label:'Cubrir', value:'cover'}, {label:'Contener', value:'contain'}]}
      ],
      estilo: [
        { id: 'radius', label: 'Redondeado', type: 'range', defaultValue: 24, min: 0, max: 60 },
        { id: 'mask_type', label: 'Máscara de Imagen', type: 'select', defaultValue: 'none', options: [
          { label: 'Ninguna', value: 'none' },
          { label: 'Círculo', value: 'circle' },
          { label: 'Orgánica (Blob)', value: 'organic' },
          { label: 'Arco Superior', value: 'arch' }
        ]},
        { id: 'show_frame', label: 'Marco Decorativo', type: 'boolean', defaultValue: false }
      ],
      interaccion: [
        { id: 'floating', label: 'Efecto Flotante', type: 'boolean', defaultValue: false },
        { id: 'parallax', label: 'Efecto Parallax', type: 'boolean', defaultValue: false }
      ],
      contenido: [], tipografia: [], estructura: []
    }},
    { id: 'el_about_stats', name: 'Estadísticas (Stats)', type: 'style', groups: ['contenido', 'estilo', 'estructura'], settings: {
      contenido: [
        { id: 'show_stats', label: 'Mostrar Estadísticas', type: 'boolean', defaultValue: true },
        { id: 'stats_list', label: 'Lista de Stats', type: 'repeater', defaultValue: [
          { value: '10+', label: 'Años de Experiencia', icon: 'Clock' },
          { value: '500+', label: 'Proyectos Exitosos', icon: 'CheckCircle' },
          { value: '24/7', label: 'Soporte Dedicado', icon: 'Headphones' }
        ], fields: [
          { id: 'value', label: 'Valor', type: 'text', defaultValue: '0' },
          { id: 'label', label: 'Etiqueta', type: 'text', defaultValue: 'Etiqueta' },
          { id: 'icon', label: 'Icono', type: 'icon', defaultValue: 'Star' }
        ]}
      ],
      estilo: [
        { id: 'stat_color', label: 'Color de Números', type: 'color', defaultValue: 'var(--primary-color)' },
        { id: 'stat_bg', label: 'Fondo de Bloque Stats', type: 'color', defaultValue: 'transparent' }
      ],
      estructura: [
        { id: 'columns', label: 'Columnas', type: 'range', defaultValue: 3, min: 1, max: 4 }
      ],
      tipografia: [], multimedia: [], interaccion: []
    }}
  ]
};

const PROCESS_MODULE: WebModule = {
  id: 'mod_process_1',
  type: 'process',
  name: 'Proceso / Roadmap Premium',
  globalGroups: ['contenido', 'estructura', 'estilo', 'interaccion'],
  globalSettings: {
    contenido: [
      {
        id: 'steps',
        label: 'Pasos del Proceso',
        type: 'repeater',
        defaultValue: [
          { title: 'Descubrimiento', desc: 'Analizamos tus necesidades y definimos los objetivos del proyecto.', icon: 'Search', badge: 'Fase 1' },
          { title: 'Diseño', desc: 'Creamos prototipos visuales enfocados en la experiencia del usuario.', icon: 'PenTool', badge: 'Fase 2' },
          { title: 'Desarrollo', desc: 'Construimos la solución utilizando las tecnologías más modernas.', icon: 'Code', badge: 'Fase 3' },
          { title: 'Lanzamiento', desc: 'Desplegamos tu proyecto y aseguramos un inicio exitoso.', icon: 'Rocket', badge: 'Final' }
        ],
        fields: [
          { id: 'title', label: 'Título', type: 'text', defaultValue: 'Nuevo Paso' },
          { id: 'desc', label: 'Descripción', type: 'text', defaultValue: 'Descripción del paso...' },
          { id: 'icon', label: 'Icono', type: 'icon', defaultValue: 'Check' },
          { id: 'badge', label: 'Etiqueta (Badge)', type: 'text', defaultValue: '' },
          { id: 'link', label: 'Enlace (URL)', type: 'text', defaultValue: '' }
        ]
      }
    ],
    estructura: [
      { id: 'layout', label: 'Diseño de Proceso', type: 'select', defaultValue: 'horizontal', options: [
        { label: 'Pasos Horizontales', value: 'horizontal' },
        { label: 'Timeline Vertical', value: 'vertical' },
        { label: 'Lista Alternada', value: 'alternating' }
      ]},
      { id: 'columns', label: 'Columnas (Desktop)', type: 'range', defaultValue: 4, min: 2, max: 5 },
      { id: 'padding_y', label: 'Padding Vertical', type: 'range', defaultValue: 120, min: 40, max: 240, unit: 'px' },
      { id: 'gap', label: 'Espacio entre pasos', type: 'range', defaultValue: 40, min: 20, max: 100, unit: 'px' }
    ],
    estilo: [
      { id: 'bg_color', label: 'Fondo de Sección', type: 'color', defaultValue: '#F8FAFC' },
      { id: 'connector_style', label: 'Estilo de Conector', type: 'select', defaultValue: 'dashed', options: [
        { label: 'Sólido', value: 'solid' },
        { label: 'Punteado', value: 'dashed' },
        { label: 'Gradiente', value: 'gradient' },
        { label: 'Oculto', value: 'none' }
      ]},
      { id: 'connector_color', label: 'Color de Conector', type: 'color', defaultValue: 'rgba(var(--primary-rgb), 0.2)' }
    ],
    interaccion: [
      { id: 'entrance_anim', label: 'Animación de Entrada', type: 'boolean', defaultValue: true },
      { id: 'draw_connectors', label: 'Dibujar Conectores', type: 'boolean', defaultValue: true },
      { id: 'hover_glow', label: 'Brillo al pasar mouse', type: 'boolean', defaultValue: true }
    ],
    tipografia: [], multimedia: []
  },
  elements: [
    { id: 'el_process_header', name: 'Encabezado', type: 'text', groups: ['contenido', 'tipografia', 'estructura'], settings: {
      contenido: [
        { id: 'eyebrow', label: 'Pre-título', type: 'text', defaultValue: 'METODOLOGÍA' },
        { id: 'title', label: 'Título', type: 'text', defaultValue: 'Nuestro Proceso' },
        { id: 'subtitle', label: 'Subtítulo', type: 'text', defaultValue: 'Cómo trabajamos para hacer realidad tus ideas.' }
      ],
      tipografia: [
        { id: 'align', label: 'Alineación', type: 'select', defaultValue: 'center', options: [{label:'Izquierda', value:'left'}, {label:'Centro', value:'center'}]},
        { id: 'title_size', label: 'Tamaño Título', type: 'range', defaultValue: 40, min: 24, max: 64 },
        { id: 'title_color', label: 'Color Título', type: 'color', defaultValue: '#0F172A' },
        { id: 'eyebrow_color', label: 'Color Pre-título', type: 'color', defaultValue: 'var(--primary-color)' }
      ],
      estructura: [{ id: 'margin_b', label: 'Margen Inferior', type: 'range', defaultValue: 80, min: 20, max: 120 }],
      estilo: [], multimedia: [], interaccion: []
    }},
    { id: 'el_process_step', name: 'Estilo de Paso', type: 'style', groups: ['estilo', 'estructura', 'tipografia', 'interaccion'], settings: {
      estilo: [
        { id: 'card_bg', label: 'Fondo de Tarjeta', type: 'color', defaultValue: '#FFFFFF' },
        { id: 'card_border', label: 'Color de Borde', type: 'color', defaultValue: 'rgba(0,0,0,0.05)' },
        { id: 'card_radius', label: 'Radio de Borde', type: 'range', defaultValue: 24, min: 0, max: 40 }
      ],
      tipografia: [
        { id: 'step_title_size', label: 'Tamaño Título Paso', type: 'range', defaultValue: 20, min: 16, max: 28 },
        { id: 'step_desc_size', label: 'Tamaño Desc Paso', type: 'range', defaultValue: 15, min: 12, max: 20 }
      ],
      estructura: [
        { id: 'card_padding', label: 'Padding Interno', type: 'range', defaultValue: 32, min: 16, max: 48 }
      ],
      interaccion: [
        { id: 'hover_lift', label: 'Elevar al pasar mouse', type: 'boolean', defaultValue: true }
      ],
      contenido: [], multimedia: []
    }},
    { id: 'el_process_indicator', name: 'Indicador (Número/Icono)', type: 'style', groups: ['estilo', 'estructura', 'multimedia'], settings: {
      estilo: [
        { id: 'indicator_bg', label: 'Fondo Indicador', type: 'color', defaultValue: 'var(--primary-color)' },
        { id: 'indicator_color', label: 'Color Texto/Icono', type: 'color', defaultValue: '#FFFFFF' },
        { id: 'indicator_glow', label: 'Efecto de Brillo', type: 'boolean', defaultValue: true }
      ],
      estructura: [
        { id: 'indicator_size', label: 'Tamaño Indicador', type: 'range', defaultValue: 48, min: 32, max: 64 }
      ],
      multimedia: [
        { id: 'use_icons', label: 'Usar Iconos en vez de Números', type: 'boolean', defaultValue: true }
      ],
      contenido: [], tipografia: [], interaccion: []
    }}
  ]
};

const GALLERY_MODULE: WebModule = {
  id: 'mod_gallery_1',
  type: 'gallery',
  name: 'Galería Visual Premium',
  globalGroups: ['estructura', 'estilo', 'interaccion', 'multimedia'],
  globalSettings: {
    estructura: [
      { id: 'layout', label: 'Diseño de Grilla', type: 'select', defaultValue: 'grid', options: [
        { label: 'Grilla Uniforme', value: 'grid' },
        { label: 'Masonry (Dinámico)', value: 'masonry' },
        { label: 'Bento (Editorial)', value: 'bento' }
      ]},
      { id: 'columns', label: 'Columnas (Desktop)', type: 'range', defaultValue: 3, min: 2, max: 5 },
      { id: 'gap', label: 'Espacio entre Imágenes', type: 'range', defaultValue: 20, min: 0, max: 60, unit: 'px' },
      { id: 'padding_y', label: 'Padding Vertical', type: 'range', defaultValue: 100, min: 40, max: 200, unit: 'px' }
    ],
    estilo: [
      { id: 'bg_color', label: 'Fondo de Sección', type: 'color', defaultValue: '#FFFFFF' },
      { id: 'image_filter', label: 'Filtro de Imagen', type: 'select', defaultValue: 'none', options: [
        { label: 'Ninguno', value: 'none' },
        { label: 'Escala de Grises', value: 'grayscale' },
        { label: 'Sepia', value: 'sepia' },
        { label: 'Desenfocado', value: 'blur' }
      ]},
      { id: 'filter_on_hover', label: 'Quitar filtro al pasar mouse', type: 'boolean', defaultValue: true }
    ],
    interaccion: [
      { id: 'entrance_anim', label: 'Animación de Entrada', type: 'boolean', defaultValue: true },
      { id: 'enable_lightbox', label: 'Habilitar Lightbox (Zoom)', type: 'boolean', defaultValue: true },
      { id: 'lightbox_nav', label: 'Navegación en Lightbox', type: 'boolean', defaultValue: true }
    ],
    multimedia: [
      { id: 'show_filters', label: 'Mostrar Filtros de Categoría', type: 'boolean', defaultValue: true },
      { id: 'categories', label: 'Categorías (Separadas por coma)', type: 'text', defaultValue: 'Todos, Diseño, Arquitectura, Naturaleza' }
    ],
    contenido: [], tipografia: []
  },
  elements: [
    { id: 'el_gallery_header', name: 'Encabezado', type: 'text', groups: ['contenido', 'tipografia', 'estructura'], settings: {
      contenido: [
        { id: 'title', label: 'Título', type: 'text', defaultValue: 'Nuestra Galería' },
        { id: 'subtitle', label: 'Subtítulo', type: 'text', defaultValue: 'Momentos capturados que cuentan nuestra historia.' }
      ],
      tipografia: [
        { id: 'align', label: 'Alineación', type: 'select', defaultValue: 'center', options: [{label:'Izquierda', value:'left'}, {label:'Centro', value:'center'}]},
        { id: 'title_size', label: 'Tamaño Título', type: 'range', defaultValue: 32, min: 24, max: 48 }
      ],
      estructura: [{ id: 'margin_b', label: 'Margen Inferior', type: 'range', defaultValue: 60, min: 20, max: 100 }],
      estilo: [], multimedia: [], interaccion: []
    }},
    { id: 'el_gallery_item', name: 'Estilo de Imagen', type: 'image', groups: ['estilo', 'estructura', 'interaccion'], settings: {
      estilo: [
        { id: 'radius', label: 'Redondeado', type: 'range', defaultValue: 16, min: 0, max: 40 },
        { id: 'overlay_color', label: 'Color de Overlay (Hover)', type: 'color', defaultValue: 'rgba(0,0,0,0.4)' },
        { id: 'border_width', label: 'Ancho de Borde', type: 'range', defaultValue: 0, min: 0, max: 10, unit: 'px' },
        { id: 'border_color', label: 'Color de Borde', type: 'color', defaultValue: 'var(--primary-color)' }
      ],
      estructura: [
        { id: 'aspect_ratio', label: 'Relación de Aspecto', type: 'select', defaultValue: 'square', options: [
          { label: 'Original', value: 'auto' },
          { label: 'Cuadrado (1:1)', value: '1/1' },
          { label: 'Video (16:9)', value: '16/9' },
          { label: 'Retrato (3:4)', value: '3/4' }
        ]}
      ],
      interaccion: [
        { id: 'hover_effect', label: 'Efecto al pasar mouse', type: 'select', defaultValue: 'zoom', options: [
          { label: 'Zoom Suave', value: 'zoom' },
          { label: 'Levantar', value: 'lift' },
          { label: 'Brillo', value: 'glow' },
          { label: 'Ninguno', value: 'none' }
        ]}
      ],
      contenido: [], tipografia: [], multimedia: []
    }},
    { id: 'el_gallery_captions', name: 'Textos (Captions)', type: 'text', groups: ['contenido', 'tipografia', 'estilo'], settings: {
      contenido: [
        { id: 'show_captions', label: 'Mostrar Títulos en Imágenes', type: 'boolean', defaultValue: true }
      ],
      tipografia: [
        { id: 'caption_size', label: 'Tamaño Título', type: 'range', defaultValue: 16, min: 12, max: 24 },
        { id: 'caption_color', label: 'Color de Texto', type: 'color', defaultValue: '#FFFFFF' }
      ],
      estilo: [
        { id: 'caption_position', label: 'Posición', type: 'select', defaultValue: 'bottom', options: [
          { label: 'Inferior', value: 'bottom' },
          { label: 'Centro', value: 'center' },
          { label: 'Superior', value: 'top' }
        ]}
      ],
      estructura: [], multimedia: [], interaccion: []
    }}
  ]
};

const VIDEO_MODULE: WebModule = {
  id: 'mod_video_1',
  type: 'video',
  name: 'Video Showcase Premium',
  globalGroups: ['estructura', 'estilo', 'interaccion', 'multimedia'],
  globalSettings: {
    estructura: [
      { id: 'layout', label: 'Diseño de Video', type: 'select', defaultValue: 'centered', options: [
        { label: 'Ancho Completo (Inmersivo)', value: 'full' },
        { label: 'Tarjeta Centrada', value: 'centered' },
        { label: 'Split (Texto + Video)', value: 'split' },
        { label: 'Fondo de Sección (Background)', value: 'background' }
      ]},
      { id: 'aspect_ratio', label: 'Relación de Aspecto', type: 'select', defaultValue: '16/9', options: [
        { label: 'Cinematográfico (16:9)', value: '16/9' },
        { label: 'Vertical (9:16)', value: '9/16' },
        { label: 'Estándar (4:3)', value: '4/3' }
      ]},
      { id: 'padding_y', label: 'Padding Vertical', type: 'range', defaultValue: 100, min: 0, max: 200, unit: 'px' },
      { id: 'max_width', label: 'Ancho Máximo', type: 'range', defaultValue: 1000, min: 600, max: 1400, unit: 'px' }
    ],
    estilo: [
      { id: 'bg_color', label: 'Fondo de Sección', type: 'color', defaultValue: '#FFFFFF' },
      { id: 'overlay_color', label: 'Color de Capa (Overlay)', type: 'color', defaultValue: 'rgba(0,0,0,0.2)' },
      { id: 'video_filter', label: 'Filtro de Video', type: 'select', defaultValue: 'none', options: [
        { label: 'Ninguno', value: 'none' },
        { label: 'Escala de Grises', value: 'grayscale' },
        { label: 'Sepia', value: 'sepia' },
        { label: 'Desenfocado', value: 'blur' }
      ]}
    ],
    interaccion: [
      { id: 'entrance_anim', label: 'Animación de Entrada', type: 'boolean', defaultValue: true },
      { id: 'parallax_effect', label: 'Efecto Parallax', type: 'boolean', defaultValue: false },
      { id: 'hover_to_play', label: 'Reproducir al pasar mouse', type: 'boolean', defaultValue: false }
    ],
    multimedia: [
      { id: 'mask_shape', label: 'Forma de Máscara', type: 'select', defaultValue: 'none', options: [
        { label: 'Ninguna', value: 'none' },
        { label: 'Orgánica (Blob)', value: 'blob' },
        { label: 'Círculo', value: 'circle' }
      ]}
    ],
    contenido: [], tipografia: []
  },
  elements: [
    { id: 'el_video_player', name: 'Reproductor de Video', type: 'video', groups: ['multimedia', 'estilo', 'interaccion'], settings: {
      multimedia: [
        { id: 'video_url', label: 'URL del Video (YouTube/Vimeo/MP4)', type: 'text', defaultValue: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
        { id: 'poster_url', label: 'Imagen de Portada (Poster)', type: 'image', defaultValue: 'https://picsum.photos/seed/video/1280/720' },
        { id: 'autoplay', label: 'Autoplay (Silenciado)', type: 'boolean', defaultValue: false },
        { id: 'loop', label: 'Bucle (Loop)', type: 'boolean', defaultValue: true },
        { id: 'controls', label: 'Mostrar Controles', type: 'boolean', defaultValue: true }
      ],
      estilo: [
        { id: 'radius', label: 'Redondeado', type: 'range', defaultValue: 24, min: 0, max: 60 },
        { id: 'shadow', label: 'Sombra Profunda', type: 'boolean', defaultValue: true },
        { id: 'border_color', label: 'Color de Borde', type: 'color', defaultValue: 'rgba(var(--primary-rgb), 0.3)' }
      ],
      interaccion: [
        { id: 'lightbox', label: 'Abrir en Lightbox', type: 'boolean', defaultValue: false },
        { id: 'play_button_style', label: 'Estilo de Botón Play', type: 'select', defaultValue: 'pulse', options: [
          { label: 'Pulso Magnético', value: 'pulse' },
          { label: 'Minimalista', value: 'minimal' },
          { label: 'Oculto', value: 'none' }
        ]}
      ],
      contenido: [], tipografia: [], estructura: []
    }},
    { id: 'el_video_text', name: 'Textos de Apoyo', type: 'text', groups: ['contenido', 'tipografia', 'estructura'], settings: {
      contenido: [
        { id: 'show_text', label: 'Mostrar Textos', type: 'boolean', defaultValue: true },
        { id: 'eyebrow', label: 'Pre-título', type: 'text', defaultValue: 'SHOWCASE' },
        { id: 'title', label: 'Título', type: 'text', defaultValue: 'Descubre nuestra visión' },
        { id: 'subtitle', label: 'Subtítulo', type: 'text', defaultValue: 'Un recorrido visual por lo que nos hace únicos.' },
        { id: 'cta_text', label: 'Texto Botón (Opcional)', type: 'text', defaultValue: '' }
      ],
      tipografia: [
        { id: 'align', label: 'Alineación', type: 'select', defaultValue: 'center', options: [{label:'Izquierda', value:'left'}, {label:'Centro', value:'center'}]},
        { id: 'title_size', label: 'Tamaño Título', type: 'range', defaultValue: 40, min: 24, max: 64 },
        { id: 'title_color', label: 'Color Título', type: 'color', defaultValue: '#0F172A' },
        { id: 'eyebrow_color', label: 'Color Pre-título', type: 'color', defaultValue: 'var(--primary-color)' }
      ],
      estructura: [
        { id: 'margin_b', label: 'Margen Inferior', type: 'range', defaultValue: 40, min: 0, max: 100 }
      ],
      estilo: [], multimedia: [], interaccion: []
    }}
  ]
};

const TESTIMONIALS_MODULE: WebModule = {
  id: 'mod_testimonials_1',
  type: 'testimonials',
  name: 'Testimonios Premium',
  globalGroups: ['estructura', 'estilo', 'interaccion'],
  globalSettings: {
    estructura: [
      { id: 'layout', label: 'Diseño de Testimonios', type: 'select', defaultValue: 'carousel', options: [
        { label: 'Carrusel (Deslizante)', value: 'carousel' },
        { label: 'Grilla (Grid)', value: 'grid' },
        { label: 'Masonry (Wall of Love)', value: 'masonry' },
        { label: 'Enfocado (Single Focus)', value: 'focus' }
      ]},
      { id: 'columns', label: 'Columnas (Desktop)', type: 'range', defaultValue: 3, min: 1, max: 4 },
      { id: 'gap', label: 'Espacio entre tarjetas', type: 'range', defaultValue: 30, min: 10, max: 60, unit: 'px' },
      { id: 'padding_y', label: 'Padding Vertical', type: 'range', defaultValue: 100, min: 40, max: 200, unit: 'px' }
    ],
    estilo: [
      { id: 'bg_color', label: 'Fondo de Sección', type: 'color', defaultValue: '#F8FAFC' },
      { id: 'section_gradient', label: 'Gradiente de Fondo', type: 'boolean', defaultValue: false }
    ],
    interaccion: [
      { id: 'autoplay', label: 'Reproducción Automática', type: 'boolean', defaultValue: true },
      { id: 'autoplay_speed', label: 'Velocidad (ms)', type: 'range', defaultValue: 5000, min: 2000, max: 10000, step: 500 },
      { id: 'entrance_anim', label: 'Animación de Entrada', type: 'boolean', defaultValue: true }
    ],
    contenido: [], tipografia: [], multimedia: []
  },
  elements: [
    { id: 'el_testimonials_header', name: 'Encabezado', type: 'text', groups: ['contenido', 'tipografia', 'estructura'], settings: {
      contenido: [
        { id: 'eyebrow', label: 'Pre-título', type: 'text', defaultValue: 'TESTIMONIOS' },
        { id: 'title', label: 'Título', type: 'text', defaultValue: 'Lo que dicen nuestros clientes' },
        { id: 'subtitle', label: 'Subtítulo', type: 'text', defaultValue: 'Historias reales de personas que confían en nosotros.' }
      ],
      tipografia: [
        { id: 'align', label: 'Alineación', type: 'select', defaultValue: 'center', options: [{label:'Izquierda', value:'left'}, {label:'Centro', value:'center'}]},
        { id: 'title_size', label: 'Tamaño Título', type: 'range', defaultValue: 40, min: 24, max: 64 },
        { id: 'title_color', label: 'Color Título', type: 'color', defaultValue: '#0F172A' },
        { id: 'eyebrow_color', label: 'Color Pre-título', type: 'color', defaultValue: 'var(--primary-color)' }
      ],
      estructura: [{ id: 'margin_b', label: 'Margen Inferior', type: 'range', defaultValue: 60, min: 20, max: 100 }],
      estilo: [], multimedia: [], interaccion: []
    }},
    { id: 'el_testimonial_card', name: 'Estilo de Tarjeta', type: 'style', groups: ['estilo', 'estructura', 'interaccion'], settings: {
      estilo: [
        { id: 'card_bg', label: 'Fondo de Tarjeta', type: 'color', defaultValue: '#FFFFFF' },
        { id: 'card_radius', label: 'Radio de Borde', type: 'range', defaultValue: 24, min: 0, max: 40 },
        { id: 'show_shadow', label: 'Mostrar Sombra', type: 'boolean', defaultValue: true },
        { id: 'border_color', label: 'Color de Borde', type: 'color', defaultValue: 'transparent' },
        { id: 'quote_style', label: 'Estilo de Comillas', type: 'select', defaultValue: 'top-left', options: [
          { label: 'Esquina Superior', value: 'top-left' },
          { label: 'Fondo (Grande)', value: 'background' },
          { label: 'Oculto', value: 'none' }
        ]}
      ],
      estructura: [
        { id: 'card_padding', label: 'Padding Interno', type: 'range', defaultValue: 32, min: 16, max: 48 }
      ],
      interaccion: [
        { id: 'hover_lift', label: 'Elevar al pasar mouse', type: 'boolean', defaultValue: true },
        { id: 'hover_glow', label: 'Brillo al pasar mouse', type: 'boolean', defaultValue: false }
      ],
      contenido: [], tipografia: [], multimedia: []
    }},
    { id: 'el_testimonial_author', name: 'Estilo de Autor', type: 'style', groups: ['estilo', 'multimedia', 'tipografia'], settings: {
      estilo: [
        { id: 'author_color', label: 'Color Nombre', type: 'color', defaultValue: '#0F172A' },
        { id: 'role_color', label: 'Color Cargo', type: 'color', defaultValue: '#64748B' },
        { id: 'star_color', label: 'Color de Estrellas', type: 'color', defaultValue: '#FBBF24' }
      ],
      multimedia: [
        { id: 'show_avatar', label: 'Mostrar Avatar', type: 'boolean', defaultValue: true },
        { id: 'avatar_shape', label: 'Forma de Avatar', type: 'select', defaultValue: 'circle', options: [
          { label: 'Círculo', value: 'circle' },
          { label: 'Squircle (Suave)', value: 'squircle' },
          { label: 'Cuadrado', value: 'square' }
        ]},
        { id: 'show_stars', label: 'Mostrar Calificación', type: 'boolean', defaultValue: true },
        { id: 'show_company_logo', label: 'Mostrar Logo Empresa', type: 'boolean', defaultValue: false }
      ],
      tipografia: [
        { id: 'quote_size', label: 'Tamaño de Testimonio', type: 'range', defaultValue: 18, min: 14, max: 24 }
      ],
      contenido: [], estructura: [], interaccion: []
    }}
  ]
};

const STATS_MODULE: WebModule = {
  id: 'mod_stats_1',
  type: 'stats',
  name: 'Estadísticas Premium',
  globalGroups: ['contenido', 'estructura', 'estilo', 'interaccion'],
  globalSettings: {
    contenido: [
      {
        id: 'stats',
        label: 'Métricas',
        type: 'repeater',
        defaultValue: [
          { value: 500, prefix: '', suffix: '+', label: 'Clientes Felices', description: 'Empresas que confían en nuestra tecnología.', icon: 'Users' },
          { value: 120, prefix: '', suffix: 'k', label: 'Líneas de Código', description: 'Desarrollo robusto y escalable.', icon: 'Zap' },
          { value: 15, prefix: '', suffix: '', label: 'Premios Ganados', description: 'Reconocimientos a la excelencia.', icon: 'Award' },
          { value: 99, prefix: '', suffix: '%', label: 'Satisfacción', description: 'Nuestros clientes nos recomiendan.', icon: 'Heart' }
        ],
        fields: [
          { id: 'label', label: 'Etiqueta', type: 'text', defaultValue: 'Métrica' },
          { id: 'value', label: 'Valor Numérico', type: 'range', defaultValue: 100, min: 0, max: 10000 },
          { id: 'prefix', label: 'Prefijo', type: 'text', defaultValue: '' },
          { id: 'suffix', label: 'Sufijo', type: 'text', defaultValue: '+' },
          { id: 'description', label: 'Descripción Corta', type: 'text', defaultValue: '' },
          { id: 'icon', label: 'Icono', type: 'icon', defaultValue: 'Star' }
        ]
      }
    ],
    estructura: [
      { id: 'layout', label: 'Diseño de Grilla', type: 'select', defaultValue: 'grid', options: [
        { label: 'Grilla Clásica', value: 'grid' },
        { label: 'Bento (Destacado)', value: 'bento' },
        { label: 'Minimalista', value: 'minimal' },
        { label: 'En Línea (Horizontal)', value: 'inline' }
      ]},
      { id: 'columns', label: 'Columnas (Grid)', type: 'range', defaultValue: 4, min: 1, max: 5 },
      { id: 'gap', label: 'Espaciado', type: 'range', defaultValue: 30, min: 0, max: 80, unit: 'px' },
      { id: 'padding_y', label: 'Padding Vertical', type: 'range', defaultValue: 100, min: 20, max: 200, unit: 'px' }
    ],
    estilo: [
      { id: 'bg_color', label: 'Fondo de Sección', type: 'color', defaultValue: '#FFFFFF' },
      { id: 'section_gradient', label: 'Gradiente de Fondo', type: 'boolean', defaultValue: false }
    ],
    interaccion: [
      { id: 'entrance_anim', label: 'Animación de Entrada', type: 'boolean', defaultValue: true },
      { id: 'count_speed', label: 'Velocidad de Conteo', type: 'range', defaultValue: 2, min: 1, max: 5, unit: 's' },
      { id: 'count_easing', label: 'Efecto de Conteo', type: 'select', defaultValue: 'spring', options: [
        { label: 'Suave (Spring)', value: 'spring' },
        { label: 'Lineal', value: 'linear' }
      ]}
    ],
    tipografia: [], multimedia: []
  },
  elements: [
    { id: 'el_stats_header', name: 'Encabezado', type: 'text', groups: ['contenido', 'tipografia', 'estructura'], settings: {
      contenido: [
        { id: 'show_header', label: 'Mostrar Encabezado', type: 'boolean', defaultValue: false },
        { id: 'eyebrow', label: 'Eyebrow (Pre-título)', type: 'text', defaultValue: 'NUESTRO IMPACTO' },
        { id: 'title', label: 'Título', type: 'text', defaultValue: 'Números que hablan por nosotros' },
        { id: 'subtitle', label: 'Subtítulo', type: 'text', defaultValue: 'Resultados tangibles que respaldan nuestra trayectoria.' }
      ],
      tipografia: [
        { id: 'align', label: 'Alineación', type: 'select', defaultValue: 'center', options: [{label:'Izquierda', value:'left'}, {label:'Centro', value:'center'}]},
        { id: 'title_size', label: 'Tamaño Título', type: 'range', defaultValue: 32, min: 24, max: 48 },
        { id: 'eyebrow_color', label: 'Color Eyebrow', type: 'color', defaultValue: 'var(--primary-color)' }
      ],
      estructura: [{ id: 'margin_b', label: 'Margen Inferior', type: 'range', defaultValue: 60, min: 20, max: 100 }],
      estilo: [], multimedia: [], interaccion: []
    }},
    { id: 'el_stat_item', name: 'Estilo de Métrica', type: 'style', groups: ['estilo', 'tipografia', 'interaccion'], settings: {
      estilo: [
        { id: 'card_bg', label: 'Fondo de Item', type: 'color', defaultValue: 'transparent' },
        { id: 'card_radius', label: 'Radio de Borde', type: 'range', defaultValue: 24, min: 0, max: 60 },
        { id: 'show_border', label: 'Mostrar Borde', type: 'boolean', defaultValue: false },
        { id: 'card_shadow', label: 'Sombra', type: 'select', defaultValue: 'none', options: [
          { label: 'Ninguna', value: 'none' },
          { label: 'Suave', value: 'soft' },
          { label: 'Color (Glow)', value: 'glow' }
        ]}
      ],
      tipografia: [
        { id: 'number_color', label: 'Color del Número', type: 'color', defaultValue: '#0F172A' },
        { id: 'label_color', label: 'Color de Etiqueta', type: 'color', defaultValue: '#64748B' },
        { id: 'desc_color', label: 'Color de Descripción', type: 'color', defaultValue: '#94A3B8' },
        { id: 'number_size', label: 'Tamaño del Número', type: 'range', defaultValue: 48, min: 32, max: 80 }
      ],
      interaccion: [
        { id: 'hover_effect', label: 'Efecto Hover', type: 'select', defaultValue: 'scale', options: [
          { label: 'Ninguno', value: 'none' },
          { label: 'Escalar', value: 'scale' },
          { label: 'Elevar', value: 'lift' }
        ]}
      ],
      contenido: [], multimedia: [], estructura: []
    }},
    { id: 'el_stat_icon', name: 'Iconografía', type: 'style', groups: ['multimedia', 'estilo'], settings: {
      multimedia: [
        { id: 'show_icons', label: 'Mostrar Iconos', type: 'boolean', defaultValue: true },
        { id: 'icon_size', label: 'Tamaño Icono', type: 'range', defaultValue: 24, min: 16, max: 48 }
      ],
      estilo: [
        { id: 'icon_shape', label: 'Forma del Contenedor', type: 'select', defaultValue: 'squircle', options: [
          { label: 'Círculo', value: 'circle' },
          { label: 'Squircle', value: 'squircle' },
          { label: 'Blob', value: 'blob' },
          { label: 'Sin Fondo', value: 'none' }
        ]},
        { id: 'icon_color', label: 'Color de Icono', type: 'color', defaultValue: 'var(--primary-color)' },
        { id: 'icon_bg', label: 'Fondo de Icono', type: 'color', defaultValue: 'rgba(59, 130, 246, 0.1)' }
      ],
      contenido: [], tipografia: [], estructura: [], interaccion: []
    }}
  ]
};

const NEWSLETTER_MODULE: WebModule = {
  id: 'mod_newsletter_1',
  type: 'newsletter',
  name: 'Newsletter Premium',
  globalGroups: ['estructura', 'estilo', 'interaccion'],
  globalSettings: {
    estructura: [
      { id: 'layout', label: 'Diseño', type: 'select', defaultValue: 'centered', options: [
        { label: 'Centrado', value: 'centered' },
        { label: 'Horizontal', value: 'horizontal' },
        { label: 'Minimalista', value: 'minimal' }
      ]},
      { id: 'max_width', label: 'Ancho Máximo', type: 'range', defaultValue: 800, min: 600, max: 1200, unit: 'px' },
      { id: 'padding_y', label: 'Padding Vertical', type: 'range', defaultValue: 80, min: 40, max: 160, unit: 'px' }
    ],
    estilo: [
      { id: 'bg_type', label: 'Tipo de Fondo', type: 'select', defaultValue: 'color', options: [
        { label: 'Color Sólido', value: 'color' },
        { label: 'Gradiente', value: 'gradient' },
        { label: 'Transparente', value: 'transparent' }
      ]},
      { id: 'bg_color', label: 'Color de Fondo', type: 'color', defaultValue: '#FFFFFF' },
      { id: 'bg_gradient', label: 'Gradiente', type: 'text', defaultValue: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' },
      { id: 'border_radius', label: 'Redondeado Bloque', type: 'range', defaultValue: 32, min: 0, max: 60 },
      { id: 'show_shadow', label: 'Mostrar Sombra', type: 'boolean', defaultValue: true }
    ],
    interaccion: [
      { id: 'entrance_anim', label: 'Animación de Entrada', type: 'boolean', defaultValue: true }
    ],
    contenido: [], tipografia: [], multimedia: []
  },
  elements: [
    { id: 'el_news_header', name: 'Encabezado', type: 'text', groups: ['contenido', 'tipografia', 'estructura'], settings: {
      contenido: [
        { id: 'title', label: 'Título', type: 'text', defaultValue: 'Suscríbete a nuestra Newsletter' },
        { id: 'subtitle', label: 'Subtítulo', type: 'text', defaultValue: 'Recibe las últimas noticias, consejos y ofertas exclusivas directamente en tu bandeja de entrada.' }
      ],
      tipografia: [
        { id: 'align', label: 'Alineación', type: 'select', defaultValue: 'center', options: [{label:'Izquierda', value:'left'}, {label:'Centro', value:'center'}]},
        { id: 'title_size', label: 'Tamaño Título', type: 'range', defaultValue: 28, min: 20, max: 42 },
        { id: 'text_color', label: 'Color de Texto', type: 'color', defaultValue: '#0F172A' }
      ],
      estructura: [
        { id: 'margin_b', label: 'Margen Inferior', type: 'range', defaultValue: 32, min: 16, max: 64 }
      ],
      estilo: [], multimedia: [], interaccion: []
    }},
    { id: 'el_news_form', name: 'Formulario', type: 'style', groups: ['contenido', 'estilo', 'interaccion'], settings: {
      contenido: [
        { id: 'placeholder', label: 'Placeholder', type: 'text', defaultValue: 'tu@email.com' },
        { id: 'button_text', label: 'Texto Botón', type: 'text', defaultValue: 'Suscribirse' }
      ],
      estilo: [
        { id: 'input_bg', label: 'Fondo Input', type: 'color', defaultValue: '#F8FAFC' },
        { id: 'btn_bg', label: 'Fondo Botón', type: 'color', defaultValue: 'var(--primary-color)' },
        { id: 'btn_color', label: 'Color Texto Botón', type: 'color', defaultValue: '#FFFFFF' },
        { id: 'input_radius', label: 'Redondeado', type: 'range', defaultValue: 16, min: 0, max: 40 }
      ],
      interaccion: [
        { id: 'hover_effect', label: 'Efecto Hover', type: 'select', defaultValue: 'scale', options: [{label:'Escala', value:'scale'}, {label:'Brillo', value:'glow'}]}
      ],
      tipografia: [], estructura: [], multimedia: []
    }},
    { id: 'el_news_trust', name: 'Confianza', type: 'style', groups: ['contenido', 'tipografia', 'multimedia'], settings: {
      contenido: [
        { id: 'privacy_text', label: 'Nota de Privacidad', type: 'text', defaultValue: 'Respetamos tu privacidad. Sin spam, solo valor.' },
        { id: 'subscriber_count', label: 'Contador (Opcional)', type: 'text', defaultValue: 'Únete a +2,000 suscriptores' }
      ],
      tipografia: [
        { id: 'text_size', label: 'Tamaño Texto', type: 'range', defaultValue: 12, min: 10, max: 16 },
        { id: 'text_color', label: 'Color Texto', type: 'color', defaultValue: '#64748B' }
      ],
      multimedia: [
        { id: 'show_icon', label: 'Mostrar Icono', type: 'boolean', defaultValue: true }
      ],
      estructura: [], estilo: [], interaccion: []
    }}
  ]
};

const CONTACT_MODULE: WebModule = {
  id: 'mod_contact_1',
  type: 'contact',
  name: 'Contacto Premium',
  globalGroups: ['estructura', 'estilo', 'interaccion'],
  globalSettings: {
    estructura: [
      { id: 'layout', label: 'Diseño', type: 'select', defaultValue: 'split', options: [
        { label: 'Dividido (Info / Form)', value: 'split' },
        { label: 'Centrado', value: 'centered' },
        { label: 'Mapa Lateral', value: 'map_side' },
        { label: 'Mapa Superior (Full)', value: 'map_top' }
      ]},
      { id: 'max_width', label: 'Ancho Máximo', type: 'range', defaultValue: 1200, min: 800, max: 1600, unit: 'px' },
      { id: 'padding_y', label: 'Padding Vertical', type: 'range', defaultValue: 100, min: 40, max: 200, unit: 'px' }
    ],
    estilo: [
      { id: 'bg_color', label: 'Fondo de Sección', type: 'color', defaultValue: '#F8FAFC' }
    ],
    interaccion: [
      { id: 'entrance_anim', label: 'Animación de Entrada', type: 'boolean', defaultValue: true }
    ],
    contenido: [], tipografia: [], multimedia: []
  },
  elements: [
    { id: 'el_contact_header', name: 'Encabezado de Sección', type: 'text', groups: ['contenido', 'tipografia', 'estructura'], settings: {
      contenido: [
        { id: 'title', label: 'Título', type: 'text', defaultValue: 'Ponte en contacto' },
        { id: 'subtitle', label: 'Subtítulo', type: 'text', defaultValue: 'Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos lo antes posible.' }
      ],
      tipografia: [
        { id: 'align', label: 'Alineación', type: 'select', defaultValue: 'left', options: [{label:'Izquierda', value:'left'}, {label:'Centro', value:'center'}]},
        { id: 'title_size', label: 'Tamaño Título', type: 'range', defaultValue: 32, min: 24, max: 48 },
        { id: 'title_color', label: 'Color Título', type: 'color', defaultValue: '#0F172A' }
      ],
      estructura: [
        { id: 'margin_b', label: 'Margen Inferior', type: 'range', defaultValue: 60, min: 20, max: 100 }
      ],
      estilo: [], multimedia: [], interaccion: []
    }},
    { id: 'el_contact_info', name: 'Información de Contacto', type: 'text', groups: ['contenido', 'tipografia', 'estilo'], settings: {
      contenido: [
        { id: 'email', label: 'Email', type: 'text', defaultValue: 'hola@tuempresa.com' },
        { id: 'phone', label: 'Teléfono', type: 'text', defaultValue: '+34 900 000 000' },
        { id: 'address', label: 'Dirección', type: 'text', defaultValue: 'Calle Innovación 123, Madrid, España' }
      ],
      tipografia: [
        { id: 'info_size', label: 'Tamaño Texto', type: 'range', defaultValue: 16, min: 14, max: 20 },
        { id: 'info_color', label: 'Color Texto', type: 'color', defaultValue: '#475569' }
      ],
      estilo: [
        { id: 'icon_color', label: 'Color de Iconos', type: 'color', defaultValue: 'var(--primary-color)' },
        { id: 'card_bg', label: 'Fondo de Bloque', type: 'color', defaultValue: 'transparent' }
      ],
      multimedia: [], estructura: [], interaccion: []
    }},
    { id: 'el_contact_form', name: 'Formulario de Mensaje', type: 'style', groups: ['contenido', 'estilo', 'interaccion'], settings: {
      contenido: [
        { id: 'button_text', label: 'Texto del Botón', type: 'text', defaultValue: 'Enviar Mensaje' },
        { id: 'whatsapp_number', label: 'Número WhatsApp (Opcional)', type: 'text', defaultValue: '' }
      ],
      estilo: [
        { id: 'input_bg', label: 'Fondo de Inputs', type: 'color', defaultValue: '#FFFFFF' },
        { id: 'input_radius', label: 'Redondeado Inputs', type: 'range', defaultValue: 12, min: 0, max: 30 },
        { id: 'btn_bg', label: 'Color de Botón', type: 'color', defaultValue: 'var(--primary-color)' },
        { id: 'btn_color', label: 'Color Texto Botón', type: 'color', defaultValue: '#FFFFFF' }
      ],
      interaccion: [
        { id: 'hover_effect', label: 'Efecto Hover', type: 'select', defaultValue: 'lift', options: [{label:'Ninguno', value:'none'}, {label:'Elevar', value:'lift'}, {label:'Brillo', value:'glow'}]}
      ],
      tipografia: [], estructura: [], multimedia: []
    }},
    { id: 'el_contact_map', name: 'Mapa de Ubicación', type: 'style', groups: ['contenido', 'estructura', 'estilo'], settings: {
      contenido: [
        { id: 'show_map', label: 'Mostrar Mapa', type: 'boolean', defaultValue: true },
        { id: 'map_url', label: 'URL de Google Maps (Embed)', type: 'text', defaultValue: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3037.615174415891!2d-3.7037902!3d40.4167754!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd42287e00000001%3A0x0!2zUHVlcnRhIGRlbCBTb2w!5e0!3m2!1ses!2ses!4v1625123456789!5m2!1ses!2ses' }
      ],
      estructura: [
        { id: 'map_height', label: 'Altura del Mapa', type: 'range', defaultValue: 400, min: 200, max: 600, unit: 'px' }
      ],
      estilo: [
        { id: 'grayscale', label: 'Mapa en Grises', type: 'boolean', defaultValue: false },
        { id: 'map_radius', label: 'Redondeado Mapa', type: 'range', defaultValue: 24, min: 0, max: 60 }
      ],
      tipografia: [], multimedia: [], interaccion: []
    }}
  ]
};

const TEAM_MODULE: WebModule = {
  id: 'mod_team_1',
  type: 'team',
  name: 'Nuestro Equipo Premium',
  globalGroups: ['estructura', 'estilo', 'interaccion'],
  globalSettings: {
    estructura: [
      { id: 'layout', label: 'Diseño de Grilla', type: 'select', defaultValue: 'grid', options: [
        { label: 'Grilla Clásica', value: 'grid' },
        { label: 'Lista (Fila)', value: 'list' },
        { label: 'Bento (Asimétrico)', value: 'bento' }
      ]},
      { id: 'columns', label: 'Columnas (Desktop)', type: 'range', defaultValue: 3, min: 1, max: 4 },
      { id: 'gap', label: 'Espacio entre miembros', type: 'range', defaultValue: 32, min: 16, max: 64, unit: 'px' },
      { id: 'padding_y', label: 'Padding Vertical', type: 'range', defaultValue: 100, min: 40, max: 200, unit: 'px' }
    ],
    estilo: [
      { id: 'bg_color', label: 'Fondo de Sección', type: 'color', defaultValue: '#FFFFFF' }
    ],
    interaccion: [
      { id: 'entrance_anim', label: 'Animación de Entrada', type: 'boolean', defaultValue: true },
      { id: 'stagger_anim', label: 'Entrada Escalonada', type: 'boolean', defaultValue: true }
    ],
    contenido: [], tipografia: [], multimedia: []
  },
  elements: [
    { id: 'el_team_header', name: 'Encabezado de Sección', type: 'text', groups: ['contenido', 'tipografia', 'estructura'], settings: {
      contenido: [
        { id: 'title', label: 'Título', type: 'text', defaultValue: 'Conoce a nuestro equipo' },
        { id: 'subtitle', label: 'Subtítulo', type: 'text', defaultValue: 'Expertos apasionados dedicados a llevar tu visión a la realidad.' }
      ],
      tipografia: [
        { id: 'align', label: 'Alineación', type: 'select', defaultValue: 'center', options: [{label:'Izquierda', value:'left'}, {label:'Centro', value:'center'}]},
        { id: 'title_size', label: 'Tamaño Título', type: 'range', defaultValue: 32, min: 24, max: 48 }
      ],
      estructura: [{ id: 'margin_b', label: 'Margen Inferior', type: 'range', defaultValue: 60, min: 20, max: 100 }],
      estilo: [], multimedia: [], interaccion: []
    }},
    { id: 'el_team_card', name: 'Estilo de Tarjeta', type: 'style', groups: ['estilo', 'estructura', 'interaccion'], settings: {
      estilo: [
        { id: 'card_bg', label: 'Fondo de Tarjeta', type: 'color', defaultValue: '#FFFFFF' },
        { id: 'card_radius', label: 'Radio de Borde', type: 'range', defaultValue: 24, min: 0, max: 48 },
        { id: 'show_border', label: 'Mostrar Borde', type: 'boolean', defaultValue: false },
        { id: 'card_shadow', label: 'Sombra', type: 'select', defaultValue: 'sm', options: [{label:'Ninguna', value:'none'}, {label:'Suave', value:'sm'}, {label:'Fuerte', value:'lg'}]}
      ],
      estructura: [
        { id: 'card_padding', label: 'Padding Interno', type: 'range', defaultValue: 24, min: 12, max: 48 }
      ],
      interaccion: [
        { id: 'hover_effect', label: 'Efecto al pasar mouse', type: 'select', defaultValue: 'lift', options: [
          { label: 'Ninguno', value: 'none' },
          { label: 'Elevar', value: 'lift' },
          { label: 'Zoom Imagen', value: 'zoom' }
        ]}
      ],
      contenido: [], tipografia: [], multimedia: []
    }},
    { id: 'el_team_image', name: 'Estilo de Imagen', type: 'style', groups: ['estilo', 'estructura'], settings: {
      estilo: [
        { id: 'img_radius', label: 'Redondeado Imagen', type: 'range', defaultValue: 20, min: 0, max: 100 },
        { id: 'img_aspect', label: 'Relación de Aspecto', type: 'select', defaultValue: 'portrait', options: [
          { label: 'Cuadrada (1:1)', value: 'square' },
          { label: 'Retrato (3:4)', value: 'portrait' },
          { label: 'Circular', value: 'circle' }
        ]}
      ],
      estructura: [
        { id: 'img_margin_b', label: 'Margen Inferior', type: 'range', defaultValue: 20, min: 0, max: 40 }
      ],
      contenido: [], tipografia: [], multimedia: [], interaccion: []
    }},
    { id: 'el_team_info', name: 'Tipografía de Miembro', type: 'text', groups: ['tipografia'], settings: {
      tipografia: [
        { id: 'name_size', label: 'Tamaño Nombre', type: 'range', defaultValue: 18, min: 14, max: 24 },
        { id: 'name_color', label: 'Color Nombre', type: 'color', defaultValue: '#0F172A' },
        { id: 'role_size', label: 'Tamaño Cargo', type: 'range', defaultValue: 14, min: 12, max: 18 },
        { id: 'role_color', label: 'Color Cargo', type: 'color', defaultValue: 'var(--primary-color)' }
      ],
      contenido: [], estilo: [], estructura: [], multimedia: [], interaccion: []
    }}
  ]
};

const CTA_MODULE: WebModule = {
  id: 'mod_cta_1',
  type: 'cta',
  name: 'Llamada a la Acción (CTA)',
  globalGroups: ['estructura', 'estilo', 'interaccion'],
  globalSettings: {
    estructura: [
      { id: 'layout', label: 'Diseño', type: 'select', defaultValue: 'centered', options: [
        { label: 'Centrado', value: 'centered' },
        { label: 'Dividido (Texto/Imagen)', value: 'split' },
        { label: 'Minimalista', value: 'minimal' }
      ]},
      { id: 'max_width', label: 'Ancho Máximo', type: 'range', defaultValue: 1000, min: 600, max: 1400, unit: 'px' },
      { id: 'padding_y', label: 'Padding Vertical', type: 'range', defaultValue: 100, min: 40, max: 200, unit: 'px' }
    ],
    estilo: [
      { id: 'bg_type', label: 'Tipo de Fondo', type: 'select', defaultValue: 'color', options: [
        { label: 'Color Sólido', value: 'color' },
        { label: 'Gradiente', value: 'gradient' },
        { label: 'Imagen', value: 'image' }
      ]},
      { id: 'bg_color', label: 'Color de Fondo', type: 'color', defaultValue: '#FFFFFF' },
      { id: 'bg_gradient', label: 'Gradiente', type: 'text', defaultValue: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' },
      { id: 'overlay_opacity', label: 'Opacidad Overlay', type: 'range', defaultValue: 50, min: 0, max: 100, unit: '%' }
    ],
    interaccion: [
      { id: 'entrance_anim', label: 'Animación de Entrada', type: 'boolean', defaultValue: true }
    ],
    contenido: [], tipografia: [], multimedia: []
  },
  elements: [
    { id: 'el_cta_content', name: 'Contenido de Texto', type: 'text', groups: ['contenido', 'tipografia', 'estructura'], settings: {
      contenido: [
        { id: 'title', label: 'Título de Impacto', type: 'text', defaultValue: '¿Listo para transformar tu negocio?' },
        { id: 'subtitle', label: 'Descripción Persuasiva', type: 'text', defaultValue: 'Únete a miles de profesionales que ya están escalando sus resultados con nuestra plataforma.' }
      ],
      tipografia: [
        { id: 'title_size', label: 'Tamaño Título', type: 'range', defaultValue: 42, min: 24, max: 64 },
        { id: 'title_weight', label: 'Grosor Título', type: 'select', defaultValue: 'black', options: [{label:'Bold', value:'bold'}, {label:'Black', value:'black'}]},
        { id: 'text_color', label: 'Color de Texto', type: 'color', defaultValue: '#0F172A' }
      ],
      estructura: [
        { id: 'margin_b', label: 'Margen Inferior', type: 'range', defaultValue: 40, min: 0, max: 100 }
      ],
      estilo: [], multimedia: [], interaccion: []
    }},
    { id: 'el_cta_actions', name: 'Botones de Acción', type: 'style', groups: ['contenido', 'estilo', 'interaccion'], settings: {
      contenido: [
        { id: 'primary_text', label: 'Texto Botón Principal', type: 'text', defaultValue: 'Empezar Ahora' },
        { id: 'secondary_text', label: 'Texto Botón Secundario', type: 'text', defaultValue: 'Saber Más' },
        { id: 'show_secondary', label: 'Mostrar Secundario', type: 'boolean', defaultValue: true }
      ],
      estilo: [
        { id: 'btn_primary_bg', label: 'Fondo Principal', type: 'color', defaultValue: 'var(--primary-color)' },
        { id: 'btn_primary_color', label: 'Texto Principal', type: 'color', defaultValue: '#FFFFFF' },
        { id: 'btn_radius', label: 'Redondeado', type: 'range', defaultValue: 16, min: 0, max: 40 }
      ],
      interaccion: [
        { id: 'hover_effect', label: 'Efecto Hover', type: 'select', defaultValue: 'scale', options: [{label:'Escala', value:'scale'}, {label:'Brillo', value:'glow'}]}
      ],
      estructura: [], tipografia: [], multimedia: []
    }},
    { id: 'el_cta_trust', name: 'Prueba Social', type: 'style', groups: ['contenido', 'tipografia', 'multimedia'], settings: {
      contenido: [
        { id: 'show_trust', label: 'Mostrar Prueba Social', type: 'boolean', defaultValue: true },
        { id: 'trust_text', label: 'Texto de Confianza', type: 'text', defaultValue: 'Únete a +5,000 usuarios activos' }
      ],
      tipografia: [
        { id: 'trust_size', label: 'Tamaño Texto', type: 'range', defaultValue: 14, min: 12, max: 18 },
        { id: 'trust_color', label: 'Color Texto', type: 'color', defaultValue: '#64748B' }
      ],
      multimedia: [
        { id: 'show_avatars', label: 'Mostrar Avatares', type: 'boolean', defaultValue: true }
      ],
      estructura: [], estilo: [], interaccion: []
    }}
  ]
};

const PRICING_MODULE: WebModule = {
  id: 'mod_pricing_1',
  type: 'pricing',
  name: 'Planes y Precios Premium',
  globalGroups: ['contenido', 'estructura', 'estilo', 'interaccion'],
  globalSettings: {
    contenido: [
      {
        id: 'plans',
        label: 'Planes de Precios',
        type: 'repeater',
        defaultValue: [
          {
            name: 'Básico',
            description: 'Ideal para individuos y proyectos pequeños.',
            monthlyPrice: 0,
            yearlyPrice: 0,
            features: '5 Proyectos\n1GB Almacenamiento\nSoporte por Email\nDominio Personalizado',
            cta: 'Empezar Gratis',
            icon: 'Rocket',
            highlight: false
          },
          {
            name: 'Profesional',
            description: 'Para equipos que necesitan escalar rápido.',
            monthlyPrice: 29,
            yearlyPrice: 24,
            features: 'Proyectos Ilimitados\n20GB Almacenamiento\nSoporte Prioritario\nAnalíticas Avanzadas\nColaboradores (hasta 5)',
            cta: 'Prueba Pro Gratis',
            icon: 'Zap',
            highlight: true,
            badge: 'MÁS POPULAR'
          },
          {
            name: 'Empresa',
            description: 'Seguridad y control para grandes organizaciones.',
            monthlyPrice: 99,
            yearlyPrice: 89,
            features: 'Todo en Pro\nAlmacenamiento Ilimitado\nSoporte 24/7\nSSO & Seguridad\nGestor de Cuenta',
            cta: 'Contactar Ventas',
            icon: 'Shield',
            highlight: false
          }
        ],
        fields: [
          { id: 'name', label: 'Nombre del Plan', type: 'text', defaultValue: 'Nuevo Plan' },
          { id: 'description', label: 'Descripción', type: 'text', defaultValue: 'Breve descripción...' },
          { id: 'monthlyPrice', label: 'Precio Mensual', type: 'range', defaultValue: 10, min: 0, max: 1000 },
          { id: 'yearlyPrice', label: 'Precio Anual (Mes)', type: 'range', defaultValue: 8, min: 0, max: 1000 },
          { id: 'features', label: 'Características (una por línea)', type: 'text', defaultValue: 'Característica 1\nCaracterística 2' },
          { id: 'cta', label: 'Texto Botón', type: 'text', defaultValue: 'Comprar' },
          { id: 'icon', label: 'Icono', type: 'icon', defaultValue: 'Check' },
          { id: 'highlight', label: 'Destacar Plan', type: 'boolean', defaultValue: false },
          { id: 'badge', label: 'Etiqueta (Badge)', type: 'text', defaultValue: '' }
        ]
      }
    ],
    estructura: [
      { id: 'columns', label: 'Columnas (Desktop)', type: 'range', defaultValue: 3, min: 1, max: 4 },
      { id: 'gap', label: 'Espacio entre tarjetas', type: 'range', defaultValue: 32, min: 16, max: 64, unit: 'px' },
      { id: 'padding_y', label: 'Padding Vertical', type: 'range', defaultValue: 100, min: 40, max: 200, unit: 'px' }
    ],
    estilo: [
      { id: 'bg_color', label: 'Fondo de Sección', type: 'color', defaultValue: '#F8FAFC' }
    ],
    interaccion: [
      { id: 'entrance_anim', label: 'Animación de Entrada', type: 'boolean', defaultValue: true },
      { id: 'stagger_anim', label: 'Entrada Escalonada', type: 'boolean', defaultValue: true }
    ],
    tipografia: [], multimedia: []
  },
  elements: [
    { id: 'el_pricing_header', name: 'Encabezado de Sección', type: 'text', groups: ['contenido', 'tipografia', 'estructura'], settings: {
      contenido: [
        { id: 'title', label: 'Título', type: 'text', defaultValue: 'Planes diseñados para tu éxito' },
        { id: 'subtitle', label: 'Subtítulo', type: 'text', defaultValue: 'Elige el plan que mejor se adapte a tus necesidades actuales.' }
      ],
      tipografia: [
        { id: 'align', label: 'Alineación', type: 'select', defaultValue: 'center', options: [{label:'Izquierda', value:'left'}, {label:'Centro', value:'center'}]},
        { id: 'title_size', label: 'Tamaño Título', type: 'range', defaultValue: 32, min: 24, max: 48 }
      ],
      estructura: [{ id: 'margin_b', label: 'Margen Inferior', type: 'range', defaultValue: 60, min: 20, max: 100 }],
      estilo: [], multimedia: [], interaccion: []
    }},
    { id: 'el_pricing_toggle', name: 'Selector de Tiempo', type: 'style', groups: ['contenido', 'estilo', 'interaccion'], settings: {
      contenido: [
        { id: 'show_toggle', label: 'Mostrar Selector', type: 'boolean', defaultValue: true },
        { id: 'discount_label', label: 'Etiqueta de Descuento', type: 'text', defaultValue: '-20%' }
      ],
      estilo: [
        { id: 'toggle_bg', label: 'Fondo Selector', type: 'color', defaultValue: '#F1F5F9' },
        { id: 'active_bg', label: 'Fondo Activo', type: 'color', defaultValue: '#FFFFFF' },
        { id: 'active_color', label: 'Color Texto Activo', type: 'color', defaultValue: '#0F172A' }
      ],
      interaccion: [
        { id: 'toggle_type', label: 'Tipo de Cambio', type: 'select', defaultValue: 'switch', options: [{label:'Switch', value:'switch'}, {label:'Tabs', value:'tabs'}]}
      ],
      estructura: [], tipografia: [], multimedia: []
    }},
    { id: 'el_pricing_card', name: 'Estilo de Tarjeta', type: 'style', groups: ['estilo', 'estructura', 'interaccion'], settings: {
      estilo: [
        { id: 'card_bg', label: 'Fondo de Tarjeta', type: 'color', defaultValue: '#FFFFFF' },
        { id: 'card_radius', label: 'Radio de Borde', type: 'range', defaultValue: 32, min: 0, max: 60 },
        { id: 'highlight_color', label: 'Color de Acento', type: 'color', defaultValue: 'var(--primary-color)' },
        { id: 'show_shadow', label: 'Mostrar Sombra', type: 'boolean', defaultValue: true }
      ],
      estructura: [
        { id: 'card_padding', label: 'Padding Interno', type: 'range', defaultValue: 40, min: 20, max: 60 },
        { id: 'featured_scale', label: 'Escala de Plan Destacado', type: 'range', defaultValue: 105, min: 100, max: 115, unit: '%' }
      ],
      interaccion: [
        { id: 'hover_effect', label: 'Efecto Hover', type: 'select', defaultValue: 'lift', options: [{label:'Ninguno', value:'none'}, {label:'Elevar', value:'lift'}, {label:'Brillo', value:'glow'}]}
      ],
      contenido: [], tipografia: [], multimedia: []
    }},
    { id: 'el_pricing_price', name: 'Tipografía de Precio', type: 'text', groups: ['tipografia', 'estilo'], settings: {
      tipografia: [
        { id: 'price_size', label: 'Tamaño Precio', type: 'range', defaultValue: 48, min: 32, max: 72 },
        { id: 'price_weight', label: 'Grosor', type: 'select', defaultValue: 'black', options: [{label:'Bold', value:'bold'}, {label:'Black', value:'black'}]},
        { id: 'currency_symbol', label: 'Símbolo', type: 'text', defaultValue: '$' }
      ],
      estilo: [
        { id: 'price_color', label: 'Color de Precio', type: 'color', defaultValue: '#0F172A' }
      ],
      contenido: [], estructura: [], multimedia: [], interaccion: []
    }},
    { id: 'el_pricing_features', name: 'Lista de Características', type: 'style', groups: ['tipografia', 'multimedia', 'estilo'], settings: {
      tipografia: [
        { id: 'feat_size', label: 'Tamaño Texto', type: 'range', defaultValue: 14, min: 12, max: 18 },
        { id: 'feat_color', label: 'Color Texto', type: 'color', defaultValue: '#475569' }
      ],
      multimedia: [
        { id: 'icon_type', label: 'Icono de Check', type: 'select', defaultValue: 'check', options: [{label:'Check', value:'check'}, {label:'Estrella', value:'star'}, {label:'Rayo', value:'zap'}]}
      ],
      estilo: [
        { id: 'icon_color', label: 'Color de Icono', type: 'color', defaultValue: 'var(--primary-color)' }
      ],
      contenido: [], estructura: [], interaccion: []
    }}
  ]
};

const FAQ_MODULE: WebModule = {
  id: 'mod_faq_1',
  type: 'faq',
  name: 'Preguntas Frecuentes (FAQ)',
  globalGroups: ['estructura', 'estilo', 'interaccion'],
  globalSettings: {
    estructura: [
      { id: 'layout', label: 'Diseño de Lista', type: 'select', defaultValue: 'single', options: [
        { label: 'Columna Única', value: 'single' },
        { label: 'Dos Columnas', value: 'double' }
      ]},
      { id: 'max_width', label: 'Ancho Máximo', type: 'range', defaultValue: 800, min: 600, max: 1200, unit: 'px' },
      { id: 'padding_y', label: 'Padding Vertical', type: 'range', defaultValue: 100, min: 40, max: 200, unit: 'px' }
    ],
    estilo: [
      { id: 'bg_color', label: 'Fondo de Sección', type: 'color', defaultValue: '#FFFFFF' }
    ],
    interaccion: [
      { id: 'entrance_anim', label: 'Animación de Entrada', type: 'boolean', defaultValue: true },
      { id: 'single_open', label: 'Solo uno abierto a la vez', type: 'boolean', defaultValue: true }
    ],
    contenido: [], tipografia: [], multimedia: []
  },
  elements: [
    { id: 'el_faq_header', name: 'Encabezado de Sección', type: 'text', groups: ['contenido', 'tipografia', 'estructura'], settings: {
      contenido: [
        { id: 'title', label: 'Título', type: 'text', defaultValue: 'Preguntas Frecuentes' },
        { id: 'subtitle', label: 'Subtítulo', type: 'text', defaultValue: 'Todo lo que necesitas saber sobre nuestro servicio.' }
      ],
      tipografia: [
        { id: 'align', label: 'Alineación', type: 'select', defaultValue: 'center', options: [{label:'Izquierda', value:'left'}, {label:'Centro', value:'center'}]},
        { id: 'title_size', label: 'Tamaño Título', type: 'range', defaultValue: 32, min: 24, max: 48 }
      ],
      estructura: [{ id: 'margin_b', label: 'Margen Inferior', type: 'range', defaultValue: 60, min: 20, max: 100 }],
      estilo: [], multimedia: [], interaccion: []
    }},
    { id: 'el_faq_search', name: 'Barra de Búsqueda', type: 'style', groups: ['contenido', 'estilo'], settings: {
      contenido: [
        { id: 'show_search', label: 'Mostrar Buscador', type: 'boolean', defaultValue: true },
        { id: 'placeholder', label: 'Placeholder', type: 'text', defaultValue: 'Buscar una pregunta...' }
      ],
      estilo: [
        { id: 'search_bg', label: 'Fondo Buscador', type: 'color', defaultValue: '#F1F5F9' },
        { id: 'search_radius', label: 'Redondeado', type: 'range', defaultValue: 16, min: 0, max: 40 }
      ],
      tipografia: [], estructura: [], multimedia: [], interaccion: []
    }},
    { id: 'el_faq_item', name: 'Estilo de Acordeón', type: 'style', groups: ['contenido', 'estilo', 'tipografia', 'multimedia'], settings: {
      contenido: [
        { 
          id: 'faqs', 
          label: 'Lista de Preguntas', 
          type: 'repeater', 
          defaultValue: [
            { question: '¿Cómo puedo empezar con la plataforma?', answer: 'Es muy sencillo. Solo tienes que registrarte con tu correo electrónico, elegir una plantilla que te guste y empezar a personalizarla con nuestro editor visual. No necesitas conocimientos de programación.' },
            { question: '¿Ofrecen soporte técnico personalizado?', answer: 'Sí, todos nuestros planes incluyen soporte. Los planes Pro y Enterprise cuentan con soporte prioritario 24/7 a través de chat y correo electrónico para resolver cualquier duda técnica.' }
          ],
          fields: [
            { id: 'question', label: 'Pregunta', type: 'text', defaultValue: 'Nueva Pregunta' },
            { id: 'answer', label: 'Respuesta', type: 'text', defaultValue: 'Descripción de la respuesta...' }
          ]
        }
      ],
      estilo: [
        { id: 'item_bg', label: 'Fondo de Item', type: 'color', defaultValue: 'transparent' },
        { id: 'active_bg', label: 'Fondo al Expandir', type: 'color', defaultValue: '#F8FAFC' },
        { id: 'border_color', label: 'Color de Borde', type: 'color', defaultValue: '#E2E8F0' },
        { id: 'show_border', label: 'Mostrar Borde', type: 'boolean', defaultValue: true }
      ],
      tipografia: [
        { id: 'q_size', label: 'Tamaño Pregunta', type: 'range', defaultValue: 16, min: 14, max: 20 },
        { id: 'q_color', label: 'Color Pregunta', type: 'color', defaultValue: '#0F172A' },
        { id: 'a_size', label: 'Tamaño Respuesta', type: 'range', defaultValue: 15, min: 13, max: 18 },
        { id: 'a_color', label: 'Color Respuesta', type: 'color', defaultValue: '#64748B' }
      ],
      multimedia: [
        { id: 'icon_type', label: 'Icono de Estado', type: 'select', defaultValue: 'plus', options: [{label:'Plus/Minus', value:'plus'}, {label:'Chevron', value:'chevron'}]}
      ],
      estructura: [], interaccion: []
    }},
    { id: 'el_faq_cta', name: 'CTA de Soporte', type: 'text', groups: ['contenido', 'estilo', 'interaccion'], settings: {
      contenido: [
        { id: 'show_cta', label: 'Mostrar CTA Final', type: 'boolean', defaultValue: true },
        { id: 'cta_text', label: 'Texto de Ayuda', type: 'text', defaultValue: '¿Aún tienes dudas?' },
        { id: 'btn_text', label: 'Texto Botón', type: 'text', defaultValue: 'Contactar Soporte' }
      ],
      estilo: [
        { id: 'btn_bg', label: 'Color Botón', type: 'color', defaultValue: 'var(--primary-color)' }
      ],
      interaccion: [
        { id: 'btn_link', label: 'Enlace', type: 'text', defaultValue: '#' }
      ],
      tipografia: [], estructura: [], multimedia: []
    }}
  ]
};

const CLIENTS_MODULE: WebModule = {
  id: 'mod_clients_1',
  type: 'clients',
  name: 'Clientes Premium',
  globalGroups: ['contenido', 'estructura', 'estilo', 'interaccion'],
  globalSettings: {
    contenido: [
      { id: 'select_customers', label: 'Selección de Clientes', type: 'customer_selection', defaultValue: [] }
    ],
    estructura: [
      { id: 'layout', label: 'Diseño', type: 'select', defaultValue: 'grid', options: [
        { label: 'Grilla Clásica', value: 'grid' },
        { label: 'Carrusel Suave', value: 'carousel' },
        { label: 'Marquee Infinito', value: 'marquee' }
      ]},
      { id: 'alignment', label: 'Alineación de Sección', type: 'select', defaultValue: 'center', options: [
        { label: 'Izquierda', value: 'left' },
        { label: 'Centro', value: 'center' },
        { label: 'Derecha', value: 'right' }
      ]},
      { id: 'columns', label: 'Columnas (Grid)', type: 'range', defaultValue: 5, min: 1, max: 8 },
      { id: 'gap', label: 'Espaciado', type: 'range', defaultValue: 40, min: 0, max: 120, unit: 'px' },
      { id: 'padding_y', label: 'Padding Vertical', type: 'range', defaultValue: 80, min: 20, max: 200, unit: 'px' }
    ],
    estilo: [
      { id: 'bg_color', label: 'Color de Fondo', type: 'color', defaultValue: '#FFFFFF' },
      { id: 'section_gradient', label: 'Gradiente de Fondo', type: 'boolean', defaultValue: false }
    ],
    interaccion: [
      { id: 'animation_speed', label: 'Velocidad (Marquee)', type: 'range', defaultValue: 30, min: 5, max: 100, unit: 's' },
      { id: 'marquee_direction', label: 'Dirección Marquee', type: 'select', defaultValue: 'left', options: [
        { label: 'Izquierda', value: 'left' },
        { label: 'Derecha', value: 'right' }
      ]},
      { id: 'pause_on_hover', label: 'Pausar al pasar mouse', type: 'boolean', defaultValue: true },
      { id: 'entrance_animation', label: 'Animación de Entrada', type: 'boolean', defaultValue: true }
    ],
    tipografia: [],
    multimedia: []
  },
  elements: [
    {
      id: 'el_clients_header',
      name: 'Encabezado de Sección',
      type: 'text',
      groups: ['contenido', 'tipografia', 'estructura'],
      settings: {
        contenido: [
          { id: 'eyebrow', label: 'Eyebrow (Pre-título)', type: 'text', defaultValue: 'TRUSTED BY' },
          { id: 'title_text', label: 'Título', type: 'text', defaultValue: 'Empresas que confían en nosotros' },
          { id: 'subtitle_text', label: 'Subtítulo', type: 'text', defaultValue: 'Trabajamos con los mejores para ofrecerte lo mejor.' }
        ],
        tipografia: [
          { id: 'align', label: 'Alineación', type: 'select', defaultValue: 'center', options: [{label:'Izquierda', value:'left'}, {label:'Centro', value:'center'}]},
          { id: 'title_size', label: 'Tamaño Título', type: 'range', defaultValue: 32, min: 24, max: 48 },
          { id: 'title_color', label: 'Color Título', type: 'color', defaultValue: '#0F172A' },
          { id: 'eyebrow_color', label: 'Color Eyebrow', type: 'color', defaultValue: 'var(--primary-color)' }
        ],
        estructura: [
          { id: 'margin_b', label: 'Margen Inferior', type: 'range', defaultValue: 60, min: 20, max: 100 }
        ],
        estilo: [], multimedia: [], interaccion: []
      }
    },
    {
      id: 'el_client_logo',
      name: 'Estilo de Logotipo',
      type: 'image',
      groups: ['multimedia', 'estilo', 'interaccion'],
      settings: {
        multimedia: [
          { id: 'logo_height', label: 'Altura Máxima', type: 'range', defaultValue: 40, min: 20, max: 100, unit: 'px' },
          { id: 'logo_fit', label: 'Ajuste de Imagen', type: 'select', defaultValue: 'contain', options: [
            { label: 'Contener', value: 'contain' },
            { label: 'Cubrir', value: 'cover' }
          ]}
        ],
        estilo: [
          { id: 'logo_filter', label: 'Filtro Inicial', type: 'select', defaultValue: 'grayscale', options: [
            { label: 'Original', value: 'none' },
            { label: 'Escala de Grises', value: 'grayscale' },
            { label: 'Invertido (Blanco)', value: 'invert' }
          ]},
          { id: 'logo_opacity', label: 'Opacidad Inicial', type: 'range', defaultValue: 60, min: 0, max: 100, unit: '%' },
          { id: 'logo_border_radius', label: 'Radio de Borde', type: 'range', defaultValue: 0, min: 0, max: 50, unit: 'px' }
        ],
        interaccion: [
          { id: 'hover_reveal', label: 'Revelar Color al Hover', type: 'boolean', defaultValue: true },
          { id: 'hover_scale', label: 'Escala al Hover', type: 'range', defaultValue: 110, min: 100, max: 150, unit: '%' },
          { id: 'hover_glow', label: 'Brillo al Hover', type: 'boolean', defaultValue: false },
          { id: 'show_tooltips', label: 'Mostrar Tooltips', type: 'boolean', defaultValue: true },
          { id: 'enable_links', label: 'Habilitar Enlaces', type: 'boolean', defaultValue: false }
        ],
        contenido: [], estructura: [], tipografia: []
      }
    }
  ]
};

const GROUP_LABELS: Record<SettingGroupType, string> = {
  contenido: 'Contenido',
  estructura: 'Estructura',
  estilo: 'Estilo',
  tipografia: 'Tipografía',
  multimedia: 'Multimedia',
  interaccion: 'Interacción'
};

// --- SUB-COMPONENTS ---

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active 
        ? 'text-sidebar-foreground font-bold' 
        : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-foreground/5 font-medium'
    }`}
  >
    <div className={active ? 'text-sidebar-foreground' : 'text-sidebar-foreground/60'}>{icon}</div>
    <span className="text-base">{label}</span>
  </button>
);

const MainSidebar = ({ 
  activeTab, 
  onTabChange, 
  onBackToDashboard,
  logoUrl,
  logoWhiteUrl,
  project,
  onAddModule,
  onLogoClick
}: { 
  activeTab: string, 
  onTabChange: (tab: string) => void, 
  onBackToDashboard: () => void,
  logoUrl: string | null,
  logoWhiteUrl: string | null,
  project: Project | null,
  onAddModule: (module: WebModule) => void,
  onLogoClick?: () => void
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('constructor');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const displayLogo = logoWhiteUrl || logoUrl;

  return (
    <div className="w-64 bg-sidebar-bg flex flex-col z-40 h-full border-r border-sidebar-border">
      {/* Logo Section */}
      <div className="p-6">
        <div 
          className="flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity group"
          onClick={onLogoClick}
        >
          <div className="h-12 w-full flex items-center justify-center relative">
            {displayLogo ? (
              <img src={displayLogo} alt="Logo" className="h-full w-auto object-contain" referrerPolicy="no-referrer" />
            ) : (
              <FileText className="text-sidebar-foreground/40 w-10 h-10" />
            )}
            <div className="absolute inset-0 bg-sidebar-foreground/5 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity" />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar pb-10">
        {/* DISEÑO */}
        <div className="space-y-1">
          <button 
            onClick={() => toggleSection('diseno')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
              expandedSection === 'diseno' ? 'text-sidebar-foreground font-bold' : 'text-sidebar-foreground/80 hover:text-sidebar-foreground'
            }`}
          >
            <div className="flex items-center gap-3">
              <Monitor size={20} />
              <span className="text-base">Diseño</span>
            </div>
            <ChevronDown size={16} className={`transition-transform ${expandedSection === 'diseno' ? 'rotate-180' : ''}`} />
          </button>
          {expandedSection === 'diseno' && (
            <div className="pl-12 py-2 space-y-2">
              <p className="text-xs text-sidebar-foreground/40 font-normal uppercase tracking-widest">Opciones de diseño</p>
            </div>
          )}
        </div>

        {/* CONSTRUCTOR */}
        <div className="space-y-1">
          <button 
            onClick={() => {
              toggleSection('constructor');
              onTabChange('constructor');
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
              expandedSection === 'constructor' 
                ? 'text-sidebar-foreground font-bold' 
                : 'text-sidebar-foreground/80 hover:text-sidebar-foreground'
            }`}
          >
            <div className="flex items-center gap-3">
              <Layout size={20} />
              <span className="text-base">Constructor</span>
            </div>
            <ChevronDown size={16} className={`transition-transform ${expandedSection === 'constructor' ? 'rotate-180' : ''}`} />
          </button>
        </div>

          {expandedSection === 'constructor' && (
            <div className="mt-4 space-y-4">
              {/* NAVEGACIÓN */}
              <div className="space-y-2">
                <button 
                  onClick={() => toggleCategory('navegacion')}
                  className={`w-full flex items-center justify-between px-4 py-1 text-xs uppercase tracking-widest transition-all ${
                    expandedCategory === 'navegacion' ? 'font-bold text-sidebar-foreground' : 'font-normal text-sidebar-foreground/80'
                  }`}
                >
                  Navegación
                  <ChevronDown size={12} className={`transition-transform ${expandedCategory === 'navegacion' ? 'rotate-180' : ''}`} />
                </button>
                {expandedCategory === 'navegacion' && (
                  <div className="space-y-0.5 px-2">
                    <ModuleItem 
                      icon={<Monitor size={18} />} 
                      label="Barra superior" 
                      onClick={() => onAddModule(HEADER_MODULE)}
                    />
                    <ModuleItem 
                      icon={<FileText size={18} />} 
                      label="Menú" 
                      onClick={() => onAddModule(MENU_MODULE)}
                    />
                    <ModuleItem 
                      icon={<Layout size={18} />} 
                      label="Pie de página" 
                      onClick={() => onAddModule(FOOTER_MODULE)}
                    />
                    <ModuleItem 
                      icon={<RotateCcw size={18} className="rotate-90" />} 
                      label="Espaciadores" 
                      onClick={() => onAddModule(SPACER_MODULE)}
                    />
                  </div>
                )}
              </div>

              {/* CONTENIDO */}
              <div className="space-y-2">
                <button 
                  onClick={() => toggleCategory('contenido')}
                  className={`w-full flex items-center justify-between px-4 py-1 text-xs uppercase tracking-widest transition-all ${
                    expandedCategory === 'contenido' ? 'font-bold text-sidebar-foreground' : 'font-normal text-sidebar-foreground/80'
                  }`}
                >
                  Contenido
                  <ChevronDown size={12} className={`transition-transform ${expandedCategory === 'contenido' ? 'rotate-180' : ''}`} />
                </button>
                {expandedCategory === 'contenido' && (
                  <div className="space-y-0.5 px-2">
                    <ModuleItem 
                      icon={<Sparkles size={18} />} 
                      label="Portada" 
                      onClick={() => onAddModule(HERO_MODULE)}
                    />
                    <ModuleItem 
                      icon={<Type size={18} />} 
                      label="Características" 
                      onClick={() => onAddModule(FEATURES_MODULE)}
                    />
                    <ModuleItem 
                      icon={<User size={18} />} 
                      label="Sobre Nosotros" 
                      onClick={() => onAddModule(ABOUT_MODULE)}
                    />
                    <ModuleItem 
                      icon={<Layers size={18} />} 
                      label="Proceso" 
                      onClick={() => onAddModule(PROCESS_MODULE)}
                    />
                    <ModuleItem 
                      icon={<PlusCircle size={18} />} 
                      label="Galería" 
                      onClick={() => onAddModule(GALLERY_MODULE)}
                    />
                    <ModuleItem 
                      icon={<Monitor size={18} />} 
                      label="Video" 
                      onClick={() => onAddModule(VIDEO_MODULE)}
                    />
                  </div>
                )}
              </div>

              {/* CONFIANZA */}
              <div className="space-y-2">
                <button 
                  onClick={() => toggleCategory('confianza')}
                  className={`w-full flex items-center justify-between px-4 py-1 text-xs uppercase tracking-widest transition-all ${
                    expandedCategory === 'confianza' ? 'font-bold text-sidebar-foreground' : 'font-normal text-sidebar-foreground/80'
                  }`}
                >
                  Confianza
                  <ChevronDown size={12} className={`transition-transform ${expandedCategory === 'confianza' ? 'rotate-180' : ''}`} />
                </button>
                {expandedCategory === 'confianza' && (
                  <div className="space-y-0.5 px-2">
                    <ModuleItem 
                      icon={<FileText size={18} />} 
                      label="Testimonios" 
                      onClick={() => onAddModule(TESTIMONIALS_MODULE)}
                    />
                    <ModuleItem 
                      icon={<CheckCircle2 size={18} />} 
                      label="Clientes" 
                      onClick={() => onAddModule(CLIENTS_MODULE)}
                    />
                    <ModuleItem 
                      icon={<Database size={18} />} 
                      label="Estadísticas" 
                      onClick={() => onAddModule(STATS_MODULE)}
                    />
                    <ModuleItem 
                      icon={<HelpCircle size={18} />} 
                      label="FAQ" 
                      onClick={() => onAddModule(FAQ_MODULE)}
                    />
                    <ModuleItem 
                      icon={<Users size={18} />} 
                      label="Equipo" 
                      onClick={() => onAddModule(TEAM_MODULE)}
                    />
                  </div>
                )}
              </div>

              {/* VENTAS */}
              <div className="space-y-2">
                <button 
                  onClick={() => toggleCategory('ventas')}
                  className={`w-full flex items-center justify-between px-4 py-1 text-xs uppercase tracking-widest transition-all ${
                    expandedCategory === 'ventas' ? 'font-bold text-sidebar-foreground' : 'font-normal text-sidebar-foreground/80'
                  }`}
                >
                  Ventas
                  <ChevronDown size={12} className={`transition-transform ${expandedCategory === 'ventas' ? 'rotate-180' : ''}`} />
                </button>
                {expandedCategory === 'ventas' && (
                  <div className="space-y-0.5 px-2">
                    <ModuleItem 
                      icon={<Layout size={18} />} 
                      label="Productos" 
                      onClick={() => onAddModule(PRODUCTS_MODULE)}
                    />
                    <ModuleItem 
                      icon={<CreditCard size={18} />} 
                      label="Precios" 
                      onClick={() => onAddModule(PRICING_MODULE)}
                    />
                    <ModuleItem 
                      icon={<PlusCircle size={18} />} 
                      label="Call to Action (CTA)" 
                      onClick={() => onAddModule(CTA_MODULE)}
                    />
                  </div>
                )}
              </div>

              {/* CONTACTO */}
              <div className="space-y-2">
                <button 
                  onClick={() => toggleCategory('contacto')}
                  className={`w-full flex items-center justify-between px-4 py-1 text-xs uppercase tracking-widest transition-all ${
                    expandedCategory === 'contacto' ? 'font-bold text-sidebar-foreground' : 'font-normal text-sidebar-foreground/80'
                  }`}
                >
                  Contacto
                  <ChevronDown size={12} className={`transition-transform ${expandedCategory === 'contacto' ? 'rotate-180' : ''}`} />
                </button>
                {expandedCategory === 'contacto' && (
                  <div className="space-y-0.5 px-2">
                    <ModuleItem 
                      icon={<Mail size={18} />} 
                      label="Contacto" 
                      onClick={() => onAddModule(CONTACT_MODULE)}
                    />
                    <ModuleItem 
                      icon={<Mail size={18} />} 
                      label="Newsletter" 
                      onClick={() => onAddModule(NEWSLETTER_MODULE)}
                    />
                    <ModuleItem 
                      icon={<HelpCircle size={18} />} 
                      label="FAQ" 
                      onClick={() => onAddModule(FAQ_MODULE)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

        {/* AJUSTES */}
        <SidebarItem 
          icon={<Settings size={20} />} 
          label="Ajustes" 
          active={activeTab === 'settings'} 
          onClick={() => onTabChange('settings')}
        />

        {/* DATOS */}
        <SidebarItem 
          icon={<Database size={20} />} 
          label="Datos" 
          active={activeTab === 'datos'} 
          onClick={() => onTabChange('datos')}
        />
      </div>

      {/* User Profile Section */}
      <div className="p-6 border-t border-sidebar-border bg-sidebar-foreground/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sidebar-foreground/10 rounded-xl flex items-center justify-center overflow-hidden">
            {project?.projectIconUrl ? (
              <img src={project.projectIconUrl} alt="Project Icon" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User className="text-sidebar-foreground w-5 h-5" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-sidebar-foreground leading-none truncate max-w-[160px]">
              {project?.name || 'Proyecto'}
            </span>
            <span className="text-xs text-sidebar-foreground/40 font-normal mt-1 tracking-wider">Proyecto Activo</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ModuleItem = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-foreground/5 transition-all group"
  >
    <div className="text-sidebar-foreground/60 group-hover:text-sidebar-foreground transition-colors">{icon}</div>
    <span className="text-sm font-medium">{label}</span>
  </button>
);

const MODULE_INFO: Record<string, { icon: React.ReactNode, label: string }> = {
  header: { icon: <Monitor size={18} />, label: 'Barra superior' },
  menu: { icon: <FileText size={18} />, label: 'Menú' },
  footer: { icon: <Layout size={18} />, label: 'Pie de página' },
  spacer: { icon: <RotateCcw size={18} className="rotate-90" />, label: 'Espaciadores' },
  hero: { icon: <Sparkles size={18} />, label: 'Portada' },
  features: { icon: <Type size={18} />, label: 'Características' },
  about: { icon: <User size={18} />, label: 'Sobre Nosotros' },
  process: { icon: <Layers size={18} />, label: 'Proceso' },
  gallery: { icon: <PlusCircle size={18} />, label: 'Galería' },
  video: { icon: <Monitor size={18} />, label: 'Video' },
  testimonials: { icon: <FileText size={18} />, label: 'Testimonios' },
  clients: { icon: <CheckCircle2 size={18} />, label: 'Clientes' },
  stats: { icon: <Database size={18} />, label: 'Estadísticas' },
  faq: { icon: <HelpCircle size={18} />, label: 'FAQ' },
  team: { icon: <Users size={18} />, label: 'Equipo' },
  products: { icon: <Layout size={18} />, label: 'Productos' },
  pricing: { icon: <CreditCard size={18} />, label: 'Precios' },
  cta: { icon: <PlusCircle size={18} />, label: 'Call to Action (CTA)' },
  contact: { icon: <Mail size={18} />, label: 'Contacto' },
  newsletter: { icon: <Mail size={18} />, label: 'Newsletter' },
};

interface StructurePanelProps {
  editorState: EditorState;
  setEditorState: React.Dispatch<React.SetStateAction<EditorState>>;
  onSettingChange: (elementOrModuleId: string, settingId: string, value: any) => void;
  onRemoveModule: (moduleId: string) => void;
  onMoveModule: (moduleId: string, direction: 'up' | 'down') => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  projectId: string | null;
  products: Product[];
  customers: Customer[];
}

const SettingControl: React.FC<{ 
  setting: SettingDefinition, 
  value: any, 
  onChange: (value: any) => void,
  projectId: string | null,
  products?: Product[],
  customers?: Customer[]
}> = ({ setting, value, onChange, projectId, products, customers }) => {
  const [isUploading, setIsUploading] = useState(false);
  const currentValue = value !== undefined ? value : setting.defaultValue;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !projectId) return;

    setIsUploading(true);
    try {
      const extension = file.name.split('.').pop() || 'png';
      const url = await syncAsset(
        { id: `asset_${Date.now()}`, projectId },
        'web_builder_asset',
        file,
        extension,
        file.type,
        file.name
      );
      onChange(url);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  switch (setting.type) {
    case 'product_selection':
    case 'customer_selection':
      const isProduct = setting.type === 'product_selection';
      const availableItems = isProduct 
        ? ((products && products.length > 0) ? products : (projectId === 'dev-project-id' ? MOCK_PRODUCTS : []))
        : ((customers && customers.length > 0) ? customers : (projectId === 'dev-project-id' ? MOCK_CUSTOMERS : []));
      
      return (
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-text/40 uppercase tracking-wider">{setting.label}</label>
          <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {availableItems.map((item: any) => {
              const isSelected = Array.isArray(currentValue) && currentValue.includes(item.id);
              const imageUrl = isProduct ? item.imageUrl : item.companyLogoUrl;
              
              return (
                <div 
                  key={item.id}
                  onClick={() => {
                    const newValue = isSelected 
                      ? (currentValue as string[]).filter(id => id !== item.id)
                      : [...(currentValue as string[] || []), item.id];
                    onChange(newValue);
                  }}
                  className={`flex items-center gap-3 p-2 rounded-xl border transition-all cursor-pointer group ${
                    isSelected 
                      ? 'bg-primary/10 border-primary/20 shadow-sm' 
                      : 'bg-surface border-border hover:border-border/80'
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0 border border-border/30">
                    {imageUrl ? (
                      <img src={imageUrl} alt={item.name} className={`w-full h-full ${isProduct ? 'object-cover' : 'object-contain p-1'}`} referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text/20">
                        <ImageIcon size={16} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-bold truncate ${isSelected ? 'text-primary' : 'text-text'}`}>
                      {item.name}
                    </p>
                    <p className="text-[10px] text-text/40 font-medium">
                      {isProduct ? `$${item.price}` : (item.company || 'Cliente')}
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                    isSelected ? 'bg-primary border-primary' : 'bg-surface border-border group-hover:border-border/80'
                  }`}>
                    {isSelected && <CheckCircle2 size={12} className="text-white" />}
                  </div>
                </div>
              );
            })}
            {availableItems.length === 0 && (
              <div className="p-6 text-center bg-secondary rounded-xl border border-dashed border-border">
                <p className="text-[10px] text-text/40 font-medium">No hay {isProduct ? 'productos' : 'clientes'} disponibles.</p>
              </div>
            )}
          </div>
        </div>
      );
    case 'image':
      return (
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-text/40">{setting.label}</label>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-secondary border border-border overflow-hidden flex-shrink-0">
              {currentValue ? (
                <img src={currentValue} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text/20">
                  <ImageIcon size={14} />
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="cursor-pointer">
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                <div className={`flex items-center justify-center gap-2 py-1.5 px-3 border border-border rounded-md text-[10px] font-bold transition-all ${
                  isUploading ? 'bg-secondary text-text/40' : 'bg-surface text-primary hover:bg-primary/10 hover:border-primary/20'
                }`}>
                  {isUploading ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload size={12} />
                      Subir Imagen
                    </>
                  )}
                </div>
              </label>
            </div>
          </div>
        </div>
      );
    case 'range':
      return (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-text/40">{setting.label}</label>
            <span className="text-[10px] font-medium text-primary">{currentValue}{setting.unit}</span>
          </div>
          <input 
            type="range" 
            min={setting.min} 
            max={setting.max} 
            step={setting.step || 1}
            value={currentValue}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary" 
          />
        </div>
      );
    case 'select':
      return (
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-text/40">{setting.label}</label>
          <select 
            value={currentValue}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-1.5 border border-border rounded-md text-[10px] font-medium focus:outline-none focus:border-primary/30 bg-surface"
          >
            {setting.options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      );
    case 'boolean':
      return (
        <div className="flex items-center justify-between p-1.5 bg-secondary rounded-md">
          <span className="text-[10px] font-medium text-text/60">{setting.label}</span>
          <button 
            onClick={() => onChange(!currentValue)}
            className={`w-7 h-3.5 rounded-full relative transition-colors ${currentValue ? 'bg-primary' : 'bg-secondary-foreground/20'}`}
          >
            <div className={`absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full shadow-sm transition-all ${currentValue ? 'left-4' : 'left-0.5'}`}></div>
          </button>
        </div>
      );
    case 'color':
      return (
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-text/40">{setting.label}</label>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-text/40 uppercase">{currentValue}</span>
            <input 
              type="color"
              value={currentValue}
              onChange={(e) => onChange(e.target.value)}
              className="w-5 h-5 rounded-md border border-border shadow-sm p-0 overflow-hidden cursor-pointer"
            />
          </div>
        </div>
      );
    case 'icon':
      const POPULAR_ICONS = [
        'Home', 'User', 'Settings', 'Mail', 'Phone', 'MapPin', 'Calendar', 'Clock', 'Search', 'Bell',
        'Camera', 'Video', 'Image', 'Music', 'Mic', 'Headphones', 'Play', 'Pause', 'Star', 'Heart',
        'ThumbsUp', 'Share2', 'Link', 'ExternalLink', 'Download', 'Upload', 'Trash2', 'Edit3', 'Plus', 'Check', 'X',
        'AlertCircle', 'Info', 'HelpCircle', 'Lock', 'Shield', 'ShoppingCart', 'CreditCard', 'Tag', 'Gift',
        'Briefcase', 'GraduationCap', 'Book', 'FileText', 'Globe', 'Wifi', 'Smartphone', 'Monitor',
        'Server', 'Database', 'Code', 'Terminal', 'Cpu', 'Zap', 'Flame', 'Droplet', 'Sun', 'Moon',
        'Twitter', 'Instagram', 'Facebook', 'Linkedin', 'Github', 'Youtube', 'Slack', 'Send', 'MessageSquare', 'ArrowRight'
      ];
      
      return (
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text/40 uppercase tracking-wider">{setting.label}</label>
          <div className="flex flex-wrap gap-1.5 p-2 bg-secondary/50 rounded-xl border border-border/50 max-h-[160px] overflow-y-auto custom-scrollbar">
            {POPULAR_ICONS.map(iconName => {
              const IconComp = (LucideIcons as any)[iconName];
              const isSelected = currentValue === iconName;
              return (
                <button
                  key={iconName}
                  onClick={() => onChange(iconName)}
                  title={iconName}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
                    isSelected 
                      ? 'bg-primary text-white shadow-md shadow-primary/20 scale-110 z-10' 
                      : 'bg-surface text-text/60 hover:text-primary hover:bg-primary/5 border border-border/50'
                  }`}
                >
                  {IconComp ? <IconComp size={14} /> : <span className="text-[8px]">{iconName}</span>}
                </button>
              );
            })}
          </div>
          {currentValue && (
            <div className="flex items-center gap-2 px-2 py-1 bg-primary/5 rounded-lg border border-primary/10">
              <span className="text-[9px] font-bold text-primary uppercase tracking-tighter">Seleccionado:</span>
              <span className="text-[10px] font-medium text-text/80">{currentValue}</span>
              <button 
                onClick={() => onChange('')}
                className="ml-auto text-text/40 hover:text-red-500 transition-colors"
              >
                <X size={10} />
              </button>
            </div>
          )}
        </div>
      );
    case 'repeater':
      const items = Array.isArray(currentValue) ? currentValue : [];
      return (
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-text/40 uppercase tracking-wider">{setting.label}</label>
          <div className="space-y-2">
            {items.map((item: any, index: number) => (
              <div key={index} className="p-3 bg-secondary/30 border border-border rounded-xl space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-text/40">Item #{index + 1}</span>
                  <button 
                    onClick={() => {
                      const newItems = [...items];
                      newItems.splice(index, 1);
                      onChange(newItems);
                    }}
                    className="text-text/40 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="space-y-3">
                  {setting.fields?.map(field => (
                    <SettingControl 
                      key={field.id}
                      setting={field}
                      value={item[field.id]}
                      projectId={projectId}
                      products={products}
                      customers={customers}
                      onChange={(val) => {
                        const newItems = [...items];
                        newItems[index] = { ...item, [field.id]: val };
                        onChange(newItems);
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
            <button 
              onClick={() => {
                const newItem: any = {};
                setting.fields?.forEach(f => {
                  newItem[f.id] = f.defaultValue;
                });
                onChange([...items, newItem]);
              }}
              className="w-full py-2 bg-surface border border-dashed border-border rounded-xl text-[10px] font-bold text-primary hover:bg-primary/5 hover:border-primary/20 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={14} /> Agregar Item
            </button>
          </div>
        </div>
      );
    case 'button':
      return (
        <div className="p-2 bg-primary/5 border border-primary/10 rounded-lg">
          <p className="text-[10px] font-bold text-primary mb-2">{setting.label}</p>
          <button className="w-full py-1.5 bg-surface border border-primary/20 rounded-md text-[10px] font-bold text-primary hover:bg-primary/10 transition-all flex items-center justify-center gap-1.5">
            <Plus size={12} /> {setting.defaultValue}
          </button>
        </div>
      );
    default:
      return (
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-text/40">{setting.label}</label>
          <input 
            type="text" 
            value={currentValue} 
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-1.5 border border-border rounded-md text-[10px] font-medium focus:outline-none focus:border-primary/30 bg-surface" 
          />
        </div>
      );
  }
};

const StructurePanel: React.FC<StructurePanelProps> = ({ 
  editorState, 
  setEditorState, 
  onSettingChange, 
  onRemoveModule, 
  onMoveModule,
  isCollapsed,
  onToggleCollapse,
  projectId,
  products,
  customers
}) => {
  const toggleModule = (moduleId: string) => {
    setEditorState(prev => ({
      ...prev,
      expandedModuleId: prev.expandedModuleId === moduleId ? null : moduleId
    }));
  };

  const toggleElement = (elementId: string) => {
    setEditorState(prev => ({
      ...prev,
      selectedElementId: prev.selectedElementId === elementId ? null : elementId
    }));
  };

  const toggleGroup = (elementId: string, group: SettingGroupType) => {
    setEditorState(prev => ({
      ...prev,
      expandedGroupsByElement: {
        ...prev.expandedGroupsByElement,
        [elementId]: prev.expandedGroupsByElement[elementId] === group ? null : group
      }
    }));
  };

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon size={12} />;
      case 'text': return <Type size={12} />;
      case 'price': return <Database size={12} />;
      case 'badge': return <Box size={12} />;
      case 'rating': return <Star size={12} />;
      case 'button': return <MousePointer2 size={12} />;
      case 'global': return <Settings size={12} />;
      default: return <Layers size={12} />;
    }
  };

  return (
    <div className={`h-full bg-surface border-r border-border flex flex-col z-30 shadow-xl shadow-text/10 overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-[70px]' : 'w-64'}`}>
      <div className={`p-4 flex items-center border-b border-border/60 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <Layers className="text-white w-3.5 h-3.5" />
          </div>
          {!isCollapsed && <span className="text-sm font-bold text-text">Estructura</span>}
        </div>
        <button 
          onClick={onToggleCollapse}
          className="text-text/40 hover:text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
        {editorState.addedModules.length === 0 && (
          <div className={`p-8 text-center space-y-4 ${isCollapsed ? 'px-2' : ''}`}>
            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto">
              <Layout className="text-text/40 w-6 h-6" />
            </div>
            {!isCollapsed && <p className="text-[11px] font-semibold text-text/60">No hay módulos añadidos aún.</p>}
          </div>
        )}

        {editorState.addedModules.map((module, index) => {
          const isModuleExpanded = editorState.expandedModuleId === module.id;
          const canMoveUp = index > 0;
          const canMoveDown = index < editorState.addedModules.length - 1;
          const hasMultipleModules = editorState.addedModules.length > 1;
          
          const moduleInfo = MODULE_INFO[module.type] || { icon: <Layout size={12} />, label: module.name };
          
          // Virtual element for global configuration
          const globalElement: ModuleElement = {
            id: module.id + '_global',
            name: 'Configuración Global',
            type: 'global',
            groups: module.globalGroups
          };

          const allElements = [globalElement, ...module.elements];

          return (
            <div key={module.id} className={`p-3 border-b border-border/30 last:border-0 ${isCollapsed ? 'px-2' : ''}`}>
              <div 
                onClick={() => !isCollapsed && toggleModule(module.id)}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer group ${
                  isModuleExpanded && !isCollapsed
                    ? 'bg-primary/10 border-primary/20' 
                    : 'bg-secondary/50 border-border/50 hover:border-border'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? moduleInfo.label : undefined}
              >
                {!isCollapsed && (
                  <>
                    {hasMultipleModules ? (
                      <div className="flex flex-col gap-0.5">
                        <button 
                          disabled={!canMoveUp}
                          onClick={(e) => { e.stopPropagation(); onMoveModule(module.id, 'up'); }}
                          className={`p-0.5 rounded hover:bg-primary/20 transition-colors ${!canMoveUp ? 'opacity-10 text-text/10' : 'text-text/40 hover:text-primary'}`}
                        >
                          <ChevronUp size={12} />
                        </button>
                        <button 
                          disabled={!canMoveDown}
                          onClick={(e) => { e.stopPropagation(); onMoveModule(module.id, 'down'); }}
                          className={`p-0.5 rounded hover:bg-primary/20 transition-colors ${!canMoveDown ? 'opacity-10 text-text/10' : 'text-text/40 hover:text-primary'}`}
                        >
                          <ChevronDown size={12} />
                        </button>
                      </div>
                    ) : (
                      <GripVertical className={isModuleExpanded ? 'text-primary/30' : 'text-text/20'} size={14} />
                    )}
                  </>
                )}
                
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  isModuleExpanded && !isCollapsed ? 'bg-primary' : 'bg-surface border border-border/50'
                }`}>
                  {React.cloneElement(moduleInfo.icon as React.ReactElement, { 
                    size: 12, 
                    className: isModuleExpanded && !isCollapsed ? 'text-white' : 'text-text/40' 
                  })}
                </div>
                
                {!isCollapsed && (
                  <>
                    <span className={`text-[14px] font-bold flex-1 truncate ${
                      isModuleExpanded ? 'text-primary' : 'text-text'
                    }`}>
                      {moduleInfo.label}
                    </span>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveModule(module.id);
                      }}
                      className="p-1.5 text-text/20 hover:text-error hover:bg-error/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Eliminar módulo"
                    >
                      <Trash2 size={14} />
                    </button>

                    <ChevronDown size={14} className={`text-text/20 transition-transform ${isModuleExpanded ? 'rotate-180 text-primary' : ''}`} />
                  </>
                )}
              </div>

              {/* Elements List */}
              <AnimatePresence>
                {isModuleExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-2 ml-4 border-l-2 border-border/30 pl-3 space-y-1.5 overflow-hidden"
                  >
                    {allElements.map(element => {
                      const isElementSelected = editorState.selectedElementId === element.id;
                      
                      return (
                        <div key={element.id} className="space-y-1">
                          <div 
                            onClick={() => toggleElement(element.id)}
                            className={`flex items-center gap-2.5 p-2 rounded-lg border transition-all cursor-pointer ${
                              isElementSelected 
                                ? 'bg-primary/5 border-primary/20' 
                                : 'bg-transparent border-transparent hover:bg-secondary'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                              isElementSelected ? 'bg-primary/20 text-primary' : 'bg-secondary text-text/40'
                            }`}>
                              {getElementIcon(element.type)}
                            </div>
                            <span className={`text-[11px] font-medium flex-1 ${
                              isElementSelected ? 'text-primary' : 'text-text/60'
                            }`}>
                              {element.name}
                            </span>
                            <ChevronDown size={12} className={`text-text/20 transition-transform ${isElementSelected ? 'rotate-180 text-primary' : ''}`} />
                          </div>

                          {/* Inline Configuration Groups */}
                          <AnimatePresence>
                            {isElementSelected && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="ml-2 space-y-1 overflow-hidden pb-2"
                              >
                                {(['contenido', 'estructura', 'estilo', 'tipografia', 'multimedia', 'interaccion'] as SettingGroupType[]).map(group => {
                                  const isAvailable = element.groups.includes(group);
                                  const hasSettings = element.type === 'global' 
                                    ? !!module.globalSettings?.[group]?.length 
                                    : !!element.settings?.[group]?.length;
                                  
                                  if (!isAvailable || !hasSettings) return null;

                                  const isGroupExpanded = editorState.expandedGroupsByElement[element.id] === group;

                                  return (
                                    <div key={group} className="border border-border/30 rounded-lg bg-surface overflow-hidden shadow-sm">
                                      <button 
                                        onClick={() => toggleGroup(element.id, group)}
                                        className="w-full flex items-center justify-between p-2 hover:bg-secondary transition-colors"
                                      >
                                        <span className={`text-[12px] transition-all ${isGroupExpanded ? 'font-bold text-primary' : 'font-normal text-text/60'}`}>
                                          {GROUP_LABELS[group]}
                                        </span>
                                        <ChevronDown size={10} className={`text-text/20 transition-transform ${isGroupExpanded ? 'rotate-180 text-primary' : ''}`} />
                                      </button>
                                      
                                      <AnimatePresence>
                                        {isGroupExpanded && (
                                          <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                          >
                                            <div className="p-3 pt-0 space-y-4 border-t border-border/30 mt-1">
                                              {/* DYNAMIC SETTINGS FOR EACH GROUP */}
                                              {element.type === 'global' ? (
                                                module.globalSettings?.[group]?.map(setting => (
                                                  <SettingControl 
                                                    key={setting.id} 
                                                    setting={setting} 
                                                    value={editorState.settingsValues[`${module.id}_global_${setting.id}`]}
                                                    onChange={(val) => onSettingChange(`${module.id}_global`, setting.id, val)}
                                                    projectId={projectId}
                                                    products={products}
                                                    customers={customers}
                                                  />
                                                ))
                                              ) : (
                                                element.settings?.[group]?.map(setting => (
                                                  <SettingControl 
                                                    key={setting.id} 
                                                    setting={setting} 
                                                    value={editorState.settingsValues[`${element.id}_${setting.id}`]}
                                                    onChange={(val) => onSettingChange(element.id, setting.id, val)}
                                                    projectId={projectId}
                                                  />
                                                ))
                                              )}
                                              
                                              {/* Fallback if no settings defined for this group */}
                                              {((element.type === 'global' && !module.globalSettings?.[group]?.length) || 
                                                (element.type !== 'global' && !element.settings?.[group]?.length)) && (
                                                <p className="text-[10px] text-text/40 italic pt-2">No hay opciones disponibles para este grupo.</p>
                                              )}
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TopBar = ({ 
  onSave, 
  onPublish, 
  logoUrl,
  viewport,
  setViewport,
  isFullscreen,
  setIsFullscreen,
  saveStatus,
  publishStatus
}: { 
  onSave: () => void, 
  onPublish: () => void, 
  logoUrl: string | null,
  viewport: 'desktop' | 'tablet' | 'mobile',
  setViewport: (v: 'desktop' | 'tablet' | 'mobile') => void,
  isFullscreen: boolean,
  setIsFullscreen: (f: boolean) => void,
  saveStatus: 'idle' | 'loading' | 'success' | 'error',
  publishStatus: 'idle' | 'loading' | 'success' | 'error'
}) => (
  <div className="h-[60px] bg-surface border-b border-border/60 flex items-center justify-between px-6 z-20">
    <div className="flex items-center gap-4">
      {logoUrl && (
        <img 
          src={logoUrl} 
          alt="Logo" 
          className="h-8 w-auto object-contain mr-2" 
          referrerPolicy="no-referrer" 
        />
      )}
      <div className="flex flex-col">
        <h2 className="text-base font-bold text-text">Editor de Módulos</h2>
        <p className="text-xs font-semibold text-text/50 uppercase tracking-wider">Añade módulos para construir tu página</p>
      </div>
    </div>

    <div className="flex items-center gap-4">
      <div className="flex items-center gap-3 border-r border-border/60 pr-4">
        <button 
          onClick={() => {
            // Reset to default desktop view
            setViewport('desktop');
          }}
          className="p-1.5 text-text/60 hover:text-primary hover:bg-secondary rounded-lg transition-all"
          title="Restablecer vista"
        >
          <RotateCcw size={16} />
        </button>
        <div className="flex items-center gap-1.5 bg-secondary p-1 rounded-xl">
          <button 
            onClick={() => setViewport('desktop')}
            className={`p-1.5 rounded-lg transition-all ${viewport === 'desktop' ? 'text-primary bg-surface shadow-sm' : 'text-text/60 hover:text-primary'}`}
            title="Vista de Escritorio"
          >
            <Monitor size={14} />
          </button>
          <button 
            onClick={() => setViewport('tablet')}
            className={`p-1.5 rounded-lg transition-all ${viewport === 'tablet' ? 'text-primary bg-surface shadow-sm' : 'text-text/60 hover:text-primary'}`}
            title="Vista de Tablet"
          >
            <Tablet size={14} />
          </button>
          <button 
            onClick={() => setViewport('mobile')}
            className={`p-1.5 rounded-lg transition-all ${viewport === 'mobile' ? 'text-primary bg-surface shadow-sm' : 'text-text/60 hover:text-primary'}`}
            title="Vista de Móvil"
          >
            <Smartphone size={14} />
          </button>
        </div>
        <button 
          onClick={() => setIsFullscreen(!isFullscreen)}
          className={`p-1.5 rounded-lg transition-all ${isFullscreen ? 'text-primary bg-primary/10' : 'text-text/60 hover:text-primary hover:bg-secondary'}`}
          title="Pantalla Completa"
        >
          <Maximize size={16} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <motion.button 
          whileHover={saveStatus === 'idle' ? { scale: 1.02, backgroundColor: 'var(--secondary-color)' } : {}}
          whileTap={saveStatus === 'idle' ? { scale: 0.98 } : {}}
          onClick={saveStatus === 'idle' ? onSave : undefined}
          disabled={saveStatus !== 'idle'}
          className={`flex items-center gap-2 px-4 py-2 font-bold text-xs rounded-xl transition-all ${
            saveStatus === 'success' ? 'bg-green-500/10 text-green-600' : 
            saveStatus === 'error' ? 'bg-red-500/10 text-red-600' : 
            'text-text/80'
          }`}
        >
          {saveStatus === 'loading' ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <RotateCcw size={16} />
            </motion.div>
          ) : saveStatus === 'success' ? (
            <Check size={16} />
          ) : saveStatus === 'error' ? (
            <X size={16} />
          ) : (
            <Save size={16} />
          )}
          {saveStatus === 'loading' ? 'Guardando...' : saveStatus === 'success' ? 'Guardado' : saveStatus === 'error' ? 'Error' : 'Guardar Borrador'}
        </motion.button>
        <motion.button 
          whileHover={publishStatus === 'idle' ? { scale: 1.02, y: -1 } : {}}
          whileTap={publishStatus === 'idle' ? { scale: 0.98 } : {}}
          onClick={publishStatus === 'idle' ? onPublish : undefined}
          disabled={publishStatus !== 'idle'}
          className={`flex items-center gap-2 px-5 py-2 font-bold text-xs rounded-xl shadow-lg transition-all ${
            publishStatus === 'success' ? 'bg-green-500 text-white shadow-green-500/20' : 
            publishStatus === 'error' ? 'bg-red-500 text-white shadow-red-500/20' : 
            'bg-primary text-white shadow-primary/20'
          }`}
        >
          {publishStatus === 'loading' ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <RotateCcw size={16} />
            </motion.div>
          ) : publishStatus === 'success' ? (
            <Check size={16} />
          ) : publishStatus === 'error' ? (
            <X size={16} />
          ) : (
            <Send size={16} />
          )}
          {publishStatus === 'loading' ? 'Publicando...' : publishStatus === 'success' ? 'Publicado' : publishStatus === 'error' ? 'Error' : 'Publicar'}
        </motion.button>
      </div>
    </div>
  </div>
);

const UnsavedChangesModal = ({ 
  onCancel, 
  onSaveAndExit, 
  onExitWithoutSaving 
}: { 
  onCancel: () => void, 
  onSaveAndExit: () => void, 
  onExitWithoutSaving: () => void 
}) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-6">
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="bg-surface rounded-3xl p-8 max-w-md w-full shadow-2xl border border-border"
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6">
          <HelpCircle className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold text-text mb-3">Cambios sin guardar</h2>
        <p className="text-text/60 mb-8 leading-relaxed">
          Tienes cambios en el diseño que no han sido guardados. ¿Qué deseas hacer antes de salir?
        </p>
        
        <div className="flex flex-col gap-3 w-full">
          <button 
            onClick={onSaveAndExit}
            className="w-full py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <Save size={18} />
            Guardar cambios y salir
          </button>
          <button 
            onClick={onExitWithoutSaving}
            className="w-full py-3.5 bg-secondary text-text/80 font-bold rounded-xl hover:bg-border/40 transition-all flex items-center justify-center gap-2"
          >
            <Trash2 size={18} />
            Salir sin guardar
          </button>
          <button 
            onClick={onCancel}
            className="w-full py-3.5 text-text/40 font-bold hover:text-text/60 transition-all"
          >
            Cancelar y seguir editando
          </button>
        </div>
      </div>
    </motion.div>
  </div>
);

const Canvas: React.FC<{ 
  editorState: EditorState, 
  onAddModule: (module: WebModule) => void,
  products: Product[],
  customers: Customer[],
  isDevMode: boolean,
  logoUrl?: string | null,
  logoWhiteUrl?: string | null,
  viewport: 'desktop' | 'tablet' | 'mobile',
  setViewport: (v: 'desktop' | 'tablet' | 'mobile') => void,
  isFullscreen: boolean,
  setIsFullscreen: (f: boolean) => void
}> = ({ editorState, onAddModule, products, customers, isDevMode, logoUrl, logoWhiteUrl, viewport, setViewport, isFullscreen, setIsFullscreen }) => {
  const lastModuleRef = React.useRef<HTMLDivElement>(null);
  const prevModulesLength = React.useRef(editorState.addedModules.length);

  const viewportWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px'
  };

  React.useEffect(() => {
    if (editorState.addedModules.length > prevModulesLength.current) {
      // Use requestAnimationFrame to ensure the DOM has updated and height is calculated
      requestAnimationFrame(() => {
        setTimeout(() => {
          lastModuleRef.current?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }, 100);
      });
    }
    prevModulesLength.current = editorState.addedModules.length;
  }, [editorState.addedModules.length]);

  React.useEffect(() => {
    if (editorState.expandedModuleId) {
      const element = document.getElementById(`module-${editorState.expandedModuleId}`);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }
  }, [editorState.expandedModuleId]);

  return (
    <div className={`flex-1 bg-secondary/50 overflow-y-auto custom-scrollbar transition-all duration-500 ${isFullscreen ? 'fixed inset-0 z-[100] bg-secondary' : ''}`}>
      {isFullscreen && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-2 bg-surface/80 backdrop-blur-md border border-border/50 p-1.5 rounded-2xl shadow-2xl">
          <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-xl">
            <button 
              onClick={() => setViewport('desktop')}
              className={`p-2 rounded-lg transition-all ${viewport === 'desktop' ? 'text-primary bg-surface shadow-sm' : 'text-text/40 hover:text-primary'}`}
              title="Escritorio"
            >
              <Monitor size={16} />
            </button>
            <button 
              onClick={() => setViewport('tablet')}
              className={`p-2 rounded-lg transition-all ${viewport === 'tablet' ? 'text-primary bg-surface shadow-sm' : 'text-text/40 hover:text-primary'}`}
              title="Tablet"
            >
              <Tablet size={16} />
            </button>
            <button 
              onClick={() => setViewport('mobile')}
              className={`p-2 rounded-lg transition-all ${viewport === 'mobile' ? 'text-primary bg-surface shadow-sm' : 'text-text/40 hover:text-primary'}`}
              title="Móvil"
            >
              <Smartphone size={16} />
            </button>
          </div>
          <div className="w-px h-4 bg-border/50 mx-1" />
          <button 
            onClick={() => setIsFullscreen(false)}
            className="p-2 text-text/40 hover:text-rose-500 transition-all"
            title="Salir de Pantalla Completa"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      )}
      <div className={`p-12 flex justify-center min-h-full transition-all duration-500 ${isFullscreen ? 'p-12 pt-24' : ''}`}>
        {/* Preview Window */}
        <div 
          className={`bg-surface shadow-2xl relative overflow-hidden transition-all duration-500 ease-in-out @container ${
            isFullscreen ? 'rounded-3xl border border-border/50' : 'rounded-2xl border border-border/50'
          } ${viewport === 'mobile' ? 'rounded-[3rem] border-[8px] border-slate-900 shadow-[0_0_0_2px_rgba(0,0,0,0.1)]' : ''} ${viewport === 'tablet' ? 'rounded-[2rem] border-[12px] border-slate-900 shadow-[0_0_0_2px_rgba(0,0,0,0.1)]' : ''}`}
          style={{ 
            width: viewportWidths[viewport], 
            maxWidth: viewport === 'desktop' ? '1200px' : viewportWidths[viewport],
            minHeight: viewport === 'mobile' ? '667px' : viewport === 'tablet' ? '1024px' : '800px'
          }}
        >
          {/* Device Notch for Mobile */}
          {viewport === 'mobile' && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-50 flex items-center justify-center">
              <div className="w-10 h-1 bg-slate-800 rounded-full" />
            </div>
          )}
          {/* Dynamic Modules */}
          <div className="w-full">
            {editorState.addedModules.map((module, index) => {
            const isLast = index === editorState.addedModules.length - 1;
            
            return (
              <div key={module.id} id={`module-${module.id}`} ref={isLast ? lastModuleRef : null} className="w-full">
                {module.type === 'products' && (
                  <ProductsModule 
                    moduleId={module.id}
                    settingsValues={editorState.settingsValues}
                    products={products}
                    isDevMode={isDevMode}
                  />
                )}
                {module.type === 'hero' && (
                  <HeroModule 
                    moduleId={module.id}
                    settingsValues={editorState.settingsValues}
                    logoUrl={logoUrl}
                    logoWhiteUrl={logoWhiteUrl}
                  />
                )}
                {module.type === 'features' && (
                  <FeaturesModule 
                    moduleId={module.id}
                    settingsValues={editorState.settingsValues}
                  />
                )}
                {module.type === 'about' && (
                  <AboutModule 
                    moduleId={module.id}
                    settingsValues={editorState.settingsValues}
                  />
                )}
                {module.type === 'process' && (
                  <ProcessModule 
                    moduleId={module.id}
                    settingsValues={editorState.settingsValues}
                  />
                )}
                {module.type === 'gallery' && (
                  <GalleryModule 
                    moduleId={module.id}
                    settingsValues={editorState.settingsValues}
                  />
                )}
                {module.type === 'video' && (
                  <VideoModule 
                    moduleId={module.id}
                    settingsValues={editorState.settingsValues}
                  />
                )}
                {module.type === 'testimonials' && (
                  <TestimonialsModule 
                    moduleId={module.id}
                    settingsValues={editorState.settingsValues}
                  />
                )}
                {module.type === 'stats' && (
                  <StatsModule 
                    moduleId={module.id}
                    settingsValues={editorState.settingsValues}
                  />
                )}
                {module.type === 'team' && (
                  <TeamModule 
                    moduleId={module.id}
                    settingsValues={editorState.settingsValues}
                  />
                )}
                {module.type === 'pricing' && (
                  <PricingModule 
                    moduleId={module.id}
                    settingsValues={editorState.settingsValues}
                  />
                )}
                {module.type === 'cta' && (
                  <CTAModule 
                    moduleId={module.id}
                    settingsValues={editorState.settingsValues}
                  />
                )}
                {module.type === 'faq' && (
                  <FAQModule 
                    moduleId={module.id}
                    settingsValues={editorState.settingsValues}
                  />
                )}
                {module.type === 'contact' && (
                  <ContactModule 
                    moduleId={module.id}
                    settingsValues={editorState.settingsValues}
                  />
                )}
                {module.type === 'newsletter' && (
                  <NewsletterModule 
                    moduleId={module.id}
                    settingsValues={editorState.settingsValues}
                  />
                )}
                {module.type === 'header' && (
                  <HeaderModule 
                    moduleId={module.id}
                    settingsValues={editorState.settingsValues}
                  />
                )}
                {module.type === 'menu' && (
                  <MenuModule 
                    moduleId={module.id}
                    settingsValues={editorState.settingsValues}
                  />
                )}
                {module.type === 'footer' && (
                  <FooterModule 
                    moduleId={module.id}
                    settingsValues={editorState.settingsValues}
                  />
                )}
                {module.type === 'spacer' && (
                  <SpacerModule 
                    moduleId={module.id}
                    settingsValues={editorState.settingsValues}
                  />
                )}
                {module.type === 'clients' && (
                  <ClientsModule 
                    moduleId={module.id}
                    settingsValues={editorState.settingsValues}
                    customers={customers}
                    isDevMode={isDevMode}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State if no modules */}
        {editorState.addedModules.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center border-t border-border/30">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-6">
              <Plus size={32} className="text-text/20" />
            </div>
            <h3 className="text-xl font-bold text-text mb-2">Tu página está vacía</h3>
            <p className="text-text/60 max-w-xs">Selecciona un módulo en el panel de la izquierda para empezar a construir.</p>
          </div>
        )}

        {/* Add Module Button inside Preview */}
        <div className="p-12 flex justify-center bg-surface border-t border-border/30">
          <button 
            onClick={() => onAddModule(PRODUCTS_MODULE)}
            className="flex items-center gap-3 px-8 py-4 border-2 border-dashed border-border rounded-2xl text-text/60 font-bold hover:border-primary/60 hover:text-primary transition-all group"
          >
            <Plus size={20} className="group-hover:scale-110 transition-transform" />
            Añadir Módulo
          </button>
        </div>
      </div>
    </div>
  </div>
);
};

const DeleteConfirmationModal: React.FC<{ 
  moduleName: string, 
  onConfirm: () => void, 
  onCancel: () => void 
}> = ({ moduleName, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
      className="absolute inset-0 bg-text/40 backdrop-blur-sm"
    />
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="relative w-full max-w-sm bg-surface rounded-3xl shadow-2xl overflow-hidden"
    >
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-error/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Trash2 className="text-error w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-text mb-2 font-sans">¿Eliminar módulo?</h3>
        <p className="text-text/60 text-sm leading-relaxed mb-8">
          Estás a punto de eliminar el módulo <span className="font-bold text-text/80">"{moduleName}"</span>. 
          Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <button 
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-secondary hover:bg-secondary/80 text-text/60 font-bold rounded-xl transition-all"
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-3 px-4 bg-error hover:bg-error/90 text-white font-bold rounded-xl shadow-lg shadow-error/20 transition-all"
          >
            Eliminar
          </button>
        </div>
      </div>
    </motion.div>
  </div>
);

const PublishModal: React.FC<{
  siteName: string,
  setSiteName: (name: string) => void,
  onPublish: () => void,
  onCancel: () => void,
  isSaving: boolean
}> = ({ siteName, setSiteName, onPublish, onCancel, isSaving }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
      className="absolute inset-0 bg-text/40 backdrop-blur-sm"
    />
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="relative w-full max-w-md bg-surface rounded-3xl p-8 shadow-2xl border border-border"
    >
      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
        <Send className="text-primary w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-text mb-2">Publicar Sitio</h3>
      <p className="text-sm text-text/60 mb-6 leading-relaxed">
        Asigna un nombre a tu página para identificarla en tu panel de Solutium.
      </p>
      
      <div className="space-y-4 mb-8">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text/40 uppercase tracking-wider">Nombre de la Página</label>
          <input 
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="Ej: Página de Inicio, Landing de Ventas..."
            className="w-full px-4 py-3 bg-secondary border border-border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            autoFocus
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button 
          onClick={onCancel}
          className="flex-1 px-6 py-3 bg-secondary hover:bg-secondary/80 text-text font-bold rounded-2xl transition-all"
        >
          Cancelar
        </button>
        <button 
          onClick={onPublish}
          disabled={!siteName || isSaving}
          className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Publicando...' : 'Publicar Ahora'}
        </button>
      </div>
    </motion.div>
  </div>
);

// --- MAIN COMPONENT ---

interface WebConstructorProps {
  onBackToDashboard: () => void;
  projectId: string | null;
  currentUserId: string | null;
  logoUrl: string | null;
  logoWhiteUrl: string | null;
  project: Project | null;
  initialPage?: WebBuilderSite | PublishedSite | null;
}

export const WebConstructor: React.FC<WebConstructorProps> = ({ 
  onBackToDashboard, 
  projectId, 
  currentUserId,
  logoUrl,
  logoWhiteUrl,
  project,
  initialPage
}) => {
  const [activeTab, setActiveTab] = useState('constructor');
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [moduleToDelete, setModuleToDelete] = useState<WebModule | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [siteName, setSiteName] = useState(initialPage?.siteName || '');
  const [currentSiteId] = useState(() => {
    // 1. Si estamos editando una página existente (Borrador o Publicada), usamos su siteId.
    if (initialPage?.siteId) return initialPage.siteId;
    
    // 2. Si es una página NUEVA, generamos un ID único para que sea independiente y no sobreescriba otras.
    // Solo usamos el ID del proyecto si no hay ninguna otra página, para facilitar la configuración inicial,
    // pero el usuario ha pedido independencia total para nuevos sitios.
    return crypto.randomUUID();
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [publishStatus, setPublishStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [structurePanelCollapsed, setStructurePanelCollapsed] = useState(false);
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [editorState, setEditorState] = useState<EditorState>(() => {
    if (initialPage && 'contentDraft' in initialPage && initialPage.contentDraft) {
      return initialPage.contentDraft as EditorState;
    }
    return {
      addedModules: [],
      expandedModuleId: null,
      selectedElementId: null,
      expandedGroupsByElement: {},
      settingsValues: {}
    };
  });

  React.useEffect(() => {
    if (projectId) {
      getProducts(0, 12, projectId).then(data => {
        setProducts(data || []);
      });
      getCustomers(0, 50, projectId).then(data => {
        setCustomers(data || []);
      });
    }
  }, [projectId]);

  // Track unsaved changes
  React.useEffect(() => {
    // We skip the first render by checking if editorState has modules or if it's different from initial
    // But a simpler way is to just set it to true after any change
    // For now, let's assume any change to editorState or siteName after mount makes it dirty
  }, [editorState, siteName]);

  // We need to wrap setEditorState and setSiteName to set hasUnsavedChanges
  const updateEditorState = (updater: (prev: EditorState) => EditorState) => {
    setEditorState(prev => {
      const next = updater(prev);
      if (next !== prev) setHasUnsavedChanges(true);
      return next;
    });
  };

  const updateSiteName = (name: string) => {
    setSiteName(name);
    setHasUnsavedChanges(true);
  };

  const addModule = (module: WebModule) => {
    console.log('Adding module:', module.type);
    const moduleId = `${module.id}_${Date.now()}`;
    
    // Prefix element IDs to ensure uniqueness
    const newElements = module.elements.map(el => ({
      ...el,
      id: `${moduleId}_${el.id}`
    }));

    const newModule = { 
      ...module, 
      id: moduleId,
      elements: newElements
    };

    // Initialize default values for all settings in the module
    const initialValues: Record<string, any> = {};
    
    // Global settings
    if (module.globalSettings) {
      Object.values(module.globalSettings).forEach(groupSettings => {
        groupSettings.forEach(setting => {
          let val = setting.defaultValue;
          if (setting.type === 'product_selection') {
            const availableProducts = products.length > 0 ? products : (projectId === 'dev-project-id' ? MOCK_PRODUCTS : []);
            if (availableProducts.length > 0) {
              val = availableProducts.slice(0, 8).map(p => p.id);
            }
          }
          if (setting.type === 'customer_selection') {
            const availableCustomers = projectId === 'dev-project-id' ? MOCK_CUSTOMERS : [];
            if (availableCustomers.length > 0) {
              val = availableCustomers.slice(0, 6).map(c => c.id);
            }
          }
          initialValues[`${moduleId}_global_${setting.id}`] = val;
        });
      });
    }

    // Element settings
    newElements.forEach(element => {
      if (element.settings) {
        Object.values(element.settings).forEach(groupSettings => {
          groupSettings.forEach(setting => {
            // The element.id already contains the moduleId prefix
            initialValues[`${element.id}_${setting.id}`] = setting.defaultValue;
          });
        });
      }
    });
    
    updateEditorState(prev => ({
      ...prev,
      addedModules: [...prev.addedModules, newModule],
      expandedModuleId: null,
      selectedElementId: null,
      settingsValues: {
        ...prev.settingsValues,
        ...initialValues
      }
    }));
  };

  const removeModule = (moduleId: string) => {
    const module = editorState.addedModules.find(m => m.id === moduleId);
    if (module) {
      setModuleToDelete(module);
    }
  };

  const moveModule = (moduleId: string, direction: 'up' | 'down') => {
    setEditorState(prev => {
      const index = prev.addedModules.findIndex(m => m.id === moduleId);
      if (index === -1) return prev;
      
      const newModules = [...prev.addedModules];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      
      if (targetIndex < 0 || targetIndex >= newModules.length) return prev;
      
      const temp = newModules[index];
      newModules[index] = newModules[targetIndex];
      newModules[targetIndex] = temp;
      
      return {
        ...prev,
        addedModules: newModules
      };
    });
  };

  const confirmRemoveModule = () => {
    if (!moduleToDelete) return;
    
    const moduleId = moduleToDelete.id;
    updateEditorState(prev => {
      const newModules = prev.addedModules.filter(m => m.id !== moduleId);
      
      // Clean up settings for this module
      const newSettingsValues = { ...prev.settingsValues };
      Object.keys(newSettingsValues).forEach(key => {
        if (key.startsWith(moduleId)) {
          delete newSettingsValues[key];
        }
      });

      return {
        ...prev,
        addedModules: newModules,
        expandedModuleId: prev.expandedModuleId === moduleId ? null : prev.expandedModuleId,
        selectedElementId: prev.selectedElementId?.startsWith(moduleId) ? null : prev.selectedElementId,
        settingsValues: newSettingsValues
      };
    });
    setModuleToDelete(null);
  };

  const handleSettingChange = (elementOrModuleId: string, settingId: string, value: any) => {
    updateEditorState(prev => ({
      ...prev,
      settingsValues: {
        ...prev.settingsValues,
        [`${elementOrModuleId}_${settingId}`]: value
      }
    }));
  };

  const formatTimestampName = () => {
    const now = new Date();
    const yy = now.getFullYear().toString().slice(-2);
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
    const dd = now.getDate().toString().padStart(2, '0');
    
    let hours = now.getHours();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hh = hours.toString().padStart(2, '0');
    
    const min = now.getMinutes().toString().padStart(2, '0');
    const ss = now.getSeconds().toString().padStart(2, '0');
    
    return `${yy}-${mm}-${dd}_${hh}-${min}-${ss}-${ampm}`;
  };

  const handleLogoClick = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedModal(true);
    } else {
      onBackToDashboard();
    }
  };

  const handleSaveAndExit = async () => {
    await handleSaveDraft();
    onBackToDashboard();
  };

  const handleExitWithoutSaving = () => {
    onBackToDashboard();
  };

  const handleSaveDraft = async (forcedStatus?: 'draft' | 'published' | 'modified') => {
    if (!projectId) return;
    setSaveStatus('loading');
    setIsSaving(true);
    
    try {
      const finalSiteName = siteName || formatTimestampName();
      if (!siteName) setSiteName(finalSiteName);

      // Use the stable currentSiteId
      const siteId = currentSiteId;
      
      console.log(`[SAVE DRAFT] Usando siteId: ${siteId} para el proyecto: ${projectId}`);

      // Determine new status based on SIP v5.0 logic
      let newStatus: 'draft' | 'published' | 'modified' = 'draft';
      
      // CRITICAL: Ensure forcedStatus is a valid status string and not a React event object
      if (typeof forcedStatus === 'string' && ['draft', 'published', 'modified'].includes(forcedStatus)) {
        newStatus = forcedStatus;
      } else if (initialPage && 'status' in initialPage) {
        if (initialPage.status === 'published') {
          newStatus = 'modified';
        } else {
          newStatus = initialPage.status as any;
        }
      }

      const payload = {
        type: 'SOLUTIUM_SAVE',
        payload: {
          projectId,
          appId: '11111111-1111-1111-1111-111111111111',
          data: editorState,
          metadata: {
            siteId: siteId,
            siteName: finalSiteName,
            status: newStatus
          }
        }
      };

      // Notify Mother App
      window.parent.postMessage(payload, '*');

      const siteData = {
        id: initialPage && 'contentDraft' in initialPage ? initialPage.id : undefined,
        projectId,
        userId: currentUserId || undefined,
        siteId: siteId,
        siteName: finalSiteName,
        name: finalSiteName,
        contentDraft: editorState,
        status: newStatus,
        subdomain: initialPage && 'subdomain' in initialPage ? (initialPage as any).subdomain : undefined
      };
      
      const result = await saveWebBuilderSiteDraft(siteData);
      if (result) {
        console.log(`Borrador guardado con éxito (Status: ${newStatus}) (SIP v5.0)`);
        setSaveStatus('success');
        setHasUnsavedChanges(false);
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!projectId) return;
    
    const finalSiteName = siteName || formatTimestampName();
    if (!siteName) {
      // If still empty, we show the modal to confirm the name (even if it's the timestamped one)
      setShowPublishModal(true);
      return;
    }

    setPublishStatus('loading');
    setIsSaving(true);
    try {
      // Helper to get setting value with fallback
      const getVal = (moduleId: string, elementId: string | null, settingId: string, defaultValue: any) => {
        const key = elementId ? `${moduleId}_${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
        return editorState.settingsValues[key] !== undefined ? editorState.settingsValues[key] : defaultValue;
      };

      // 1. Determine Global Theme
      const firstModuleId = editorState.addedModules[0]?.id;
      const primaryColor = firstModuleId 
        ? getVal(firstModuleId, null, 'primary_color', project?.brandColors?.primary || '#2563EB')
        : (project?.brandColors?.primary || '#2563EB');

      const renderingContract: RenderingContract = {
        theme: {
          primaryColor,
          fontFamily: project?.fontFamily || 'Inter',
        },
        sections: editorState.addedModules.map(module => {
          const content: any = {};

          // Extract specific content fields for the mother app's expected structure
          if (module.type === 'hero') {
            content.title = getVal(module.id, 'el_hero_title', 'text', '');
            content.subtitle = getVal(module.id, 'el_hero_subtitle', 'text', '');
            content.buttonText = getVal(module.id, 'el_hero_cta', 'text', '');
            content.imageUrl = getVal(module.id, 'el_hero_visual', 'url', '');
          } else if (module.type === 'features') {
            content.title = getVal(module.id, 'el_features_header', 'title', '');
            content.subtitle = getVal(module.id, 'el_features_header', 'subtitle', '');
          } else if (module.type === 'contact') {
            content.title = getVal(module.id, 'el_contact_info', 'title', '');
            content.subtitle = getVal(module.id, 'el_contact_info', 'subtitle', '');
            content.buttonText = getVal(module.id, 'el_contact_form', 'button_text', '');
          } else if (module.type === 'team') {
            content.title = getVal(module.id, 'el_team_header', 'title', '');
            content.subtitle = getVal(module.id, 'el_team_header', 'subtitle', '');
          } else if (module.type === 'pricing') {
            content.title = getVal(module.id, 'el_pricing_header', 'title', '');
            content.subtitle = getVal(module.id, 'el_pricing_header', 'subtitle', '');
          } else if (module.type === 'faq') {
            content.title = getVal(module.id, 'el_faq_header', 'title', '');
            content.subtitle = getVal(module.id, 'el_faq_header', 'subtitle', '');
          } else {
            // Fallback for other modules
            content.title = getVal(module.id, 'el_testimonials_header', 'title', 
                            getVal(module.id, 'el_process_header', 'title', 
                            getVal(module.id, 'el_stats_header', 'title', 
                            getVal(module.id, 'el_team_header', 'title', 
                            getVal(module.id, 'el_pricing_header', 'title', 
                            getVal(module.id, 'el_faq_header', 'title', ''))))));
            content.subtitle = getVal(module.id, 'el_testimonials_header', 'subtitle', 
                               getVal(module.id, 'el_process_header', 'subtitle', 
                               getVal(module.id, 'el_stats_header', 'subtitle', 
                               getVal(module.id, 'el_team_header', 'subtitle', 
                               getVal(module.id, 'el_pricing_header', 'subtitle', 
                               getVal(module.id, 'el_faq_header', 'subtitle', ''))))));
          }

          if (module.type === 'products') {
            content.productIds = getVal(module.id, null, 'select_products', []);
          }
          if (module.type === 'clients') {
            content.customerIds = getVal(module.id, null, 'select_customers', []);
          }

          // Extract ALL settings for this module to preserve styling
          const settings: any = {};
          Object.entries(editorState.settingsValues).forEach(([key, value]) => {
            if (key.startsWith(module.id)) {
              const relativeKey = key.replace(`${module.id}_`, '');
              settings[relativeKey] = value;
            }
          });

          return {
            id: module.id,
            type: module.type as any,
            content,
            settings
          };
        })
      };

      const finalSiteName = siteName || formatTimestampName();
      
      // Use the stable currentSiteId
      const siteId = currentSiteId;

      console.log(`[PUBLISH] Usando siteId: ${siteId} para el proyecto: ${projectId}`);

      const payload = {
        type: 'SOLUTIUM_PUBLISH',
        payload: {
          projectId,
          appId: '11111111-1111-1111-1111-111111111111',
          siteId: siteId
        }
      };

      // Notify Mother App
      window.parent.postMessage(payload, '*');

      // Preserve subdomain/subdomainId to avoid breaking domain links
      const subdomainId = initialPage 
        ? ('subdomainId' in initialPage ? initialPage.subdomainId : (initialPage as any).subdomain)
        : undefined;

      const result = await publishWebBuilderSite({
        id: initialPage && !('contentDraft' in initialPage) ? initialPage.id : undefined,
        projectId,
        siteId: siteId,
        siteName: finalSiteName,
        isActive: true, // Default to true on publish
        content: renderingContract,
        metadata: {
          ...renderingContract.theme,
          siteId,
          siteName: finalSiteName,
          action: 'publishSite'
        },
        subdomainId: subdomainId
      });

      if (result) {
        console.log('Sitio publicado con éxito (SIP v5.0)');
        
        // SIP v5.0: Link subdomain if exists
        const subdomain = initialPage && 'subdomain' in initialPage ? (initialPage as any).subdomain : undefined;
        if (subdomain && result.id) {
          console.log(`[SIP v5.0] Vinculando subdominio: ${subdomain} con published_site_id: ${result.id}`);
          await linkSubdomain(subdomain, result.id);
        }

        setPublishStatus('success');
        // Also save a draft to keep them in sync and update status to 'published'
        await handleSaveDraft('published');
        setTimeout(() => setPublishStatus('idle'), 3000);
        setShowPublishModal(false);
      } else {
        setPublishStatus('error');
        setTimeout(() => setPublishStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Error publishing site:', error);
      setPublishStatus('error');
      setTimeout(() => setPublishStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-surface font-sans antialiased">
      <MainSidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onBackToDashboard={onBackToDashboard} 
        logoUrl={logoUrl}
        logoWhiteUrl={logoWhiteUrl}
        project={project}
        onAddModule={addModule}
      />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {activeTab === 'constructor' && (
          <div className="flex flex-1 h-full overflow-hidden">
            <StructurePanel 
              editorState={editorState} 
              setEditorState={setEditorState} 
              onSettingChange={handleSettingChange}
              onRemoveModule={removeModule}
              onMoveModule={moveModule}
              isCollapsed={structurePanelCollapsed}
              onToggleCollapse={() => setStructurePanelCollapsed(!structurePanelCollapsed)}
              projectId={projectId}
              products={products}
              customers={customers}
            />
            <div className="flex-1 flex flex-col h-full">
              <TopBar 
                onSave={handleSaveDraft} 
                onPublish={handlePublish} 
                logoUrl={logoUrl}
                viewport={viewport}
                setViewport={setViewport}
                isFullscreen={isFullscreen}
                setIsFullscreen={setIsFullscreen}
                saveStatus={saveStatus}
                publishStatus={publishStatus}
              />
              <Canvas 
                editorState={editorState} 
                onAddModule={addModule} 
                products={products}
                customers={customers}
                isDevMode={projectId === 'dev-project-id'}
                logoUrl={logoUrl}
                logoWhiteUrl={logoWhiteUrl}
                viewport={viewport}
                setViewport={setViewport}
                isFullscreen={isFullscreen}
                setIsFullscreen={setIsFullscreen}
              />
              
              {showUnsavedModal && (
                <UnsavedChangesModal 
                  onCancel={() => setShowUnsavedModal(false)}
                  onSaveAndExit={handleSaveAndExit}
                  onExitWithoutSaving={handleExitWithoutSaving}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'datos' && (
          <div className="flex-1 h-full overflow-auto bg-secondary">
            <div className="p-8">
              <div className="flex flex-col mb-8">
                <h2 className="text-3xl font-bold text-text">Gestión de Datos</h2>
                <p className="text-sm text-text/40 font-medium">Administra la información de tu proyecto de forma profesional.</p>
              </div>
              <DataTab projectId={projectId || ''} currentUserId={currentUserId || ''} />
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="flex-1 h-full overflow-auto bg-secondary flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto shadow-sm border border-border">
                <Settings className="text-text/20 w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-text">Ajustes del Proyecto</h2>
              <p className="text-text/40 max-w-xs mx-auto">Configura los parámetros generales de tu sitio web.</p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {moduleToDelete && (
          <DeleteConfirmationModal 
            moduleName={moduleToDelete.name}
            onConfirm={confirmRemoveModule}
            onCancel={() => setModuleToDelete(null)}
          />
        )}
        {showPublishModal && (
          <PublishModal 
            siteName={siteName}
            setSiteName={setSiteName}
            onPublish={handlePublish}
            onCancel={() => setShowPublishModal(false)}
            isSaving={isSaving}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
