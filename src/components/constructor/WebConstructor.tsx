import React, { useState } from 'react';
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
  RotateCcw, 
  Maximize, 
  Plus, 
  ChevronDown, 
  ChevronRight, 
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
  Box,
  Send,
  Upload,
  Loader2
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
import { ClientsModule } from './modules/ClientsModule';
import { saveWebBuilderSiteDraft, publishWebBuilderSite, getProducts, getCustomers } from '../../services/dataService';
import { syncAsset } from '../../services/assetService';
import { Product, Customer } from '../../types/schema';
import { MOCK_PRODUCTS, MOCK_CUSTOMERS } from '../../constants/mockData';

// --- CONSTANTS ---

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
      groups: ['contenido', 'estructura', 'estilo', 'multimedia', 'interaccion'],
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
        contenido: [],
        estructura: [],
        tipografia: [],
        interaccion: []
      }
    },
    { 
      id: 'el_title', 
      name: 'Título del Producto', 
      type: 'text', 
      groups: ['contenido', 'estructura', 'tipografia', 'interaccion'],
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
        contenido: [],
        estructura: [],
        estilo: [],
        multimedia: [],
        interaccion: []
      }
    },
    { 
      id: 'el_price', 
      name: 'Precio', 
      type: 'price', 
      groups: ['contenido', 'estructura', 'estilo', 'tipografia'],
      settings: {
        contenido: [
          { id: 'currency', label: 'Moneda', type: 'text', defaultValue: '$' }
        ],
        tipografia: [
          { id: 'price_size', label: 'Tamaño del Precio', type: 'range', defaultValue: 18, min: 14, max: 32, unit: 'px' }
        ],
        estructura: [],
        estilo: [],
        multimedia: [],
        interaccion: []
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
  globalGroups: ['estructura', 'estilo', 'interaccion'],
  globalSettings: {
    estructura: [
      { id: 'layout', label: 'Diseño de Grilla', type: 'select', defaultValue: 'grid', options: [
        { label: 'Grilla Estándar', value: 'grid' },
        { label: 'Lista (Icono Lateral)', value: 'list' },
        { label: 'Bento (Asimétrico)', value: 'bento' }
      ]},
      { id: 'columns', label: 'Columnas (Desktop)', type: 'range', defaultValue: 3, min: 1, max: 4 },
      { id: 'gap', label: 'Espacio entre tarjetas', type: 'range', defaultValue: 32, min: 16, max: 64, unit: 'px' },
      { id: 'padding_y', label: 'Padding Vertical', type: 'range', defaultValue: 80, min: 40, max: 160, unit: 'px' }
    ],
    estilo: [
      { id: 'bg_color', label: 'Fondo de Sección', type: 'color', defaultValue: 'transparent' }
    ],
    interaccion: [
      { id: 'stagger_anim', label: 'Entrada Escalonada', type: 'boolean', defaultValue: true }
    ],
    contenido: [], tipografia: [], multimedia: []
  },
  elements: [
    { id: 'el_features_header', name: 'Encabezado de Sección', type: 'text', groups: ['contenido', 'tipografia', 'estructura'], settings: {
      contenido: [
        { id: 'title', label: 'Título', type: 'text', defaultValue: '¿Por qué elegirnos?' },
        { id: 'subtitle', label: 'Subtítulo', type: 'text', defaultValue: 'Soluciones diseñadas para escalar tu negocio al siguiente nivel.' }
      ],
      tipografia: [
        { id: 'align', label: 'Alineación', type: 'select', defaultValue: 'center', options: [{label:'Izquierda', value:'left'}, {label:'Centro', value:'center'}]},
        { id: 'title_size', label: 'Tamaño Título', type: 'range', defaultValue: 32, min: 24, max: 48 }
      ],
      estructura: [{ id: 'margin_b', label: 'Margen Inferior', type: 'range', defaultValue: 60, min: 20, max: 100 }],
      estilo: [], multimedia: [], interaccion: []
    }},
    { id: 'el_feature_card', name: 'Estilo de Tarjeta', type: 'style', groups: ['estilo', 'estructura', 'interaccion'], settings: {
      estilo: [
        { id: 'card_bg', label: 'Fondo de Tarjeta', type: 'color', defaultValue: '#FFFFFF' },
        { id: 'card_border', label: 'Color de Borde', type: 'color', defaultValue: 'rgba(0,0,0,0.05)' },
        { id: 'card_shadow', label: 'Sombra', type: 'select', defaultValue: 'sm', options: [{label:'Ninguna', value:'none'}, {label:'Suave', value:'sm'}, {label:'Fuerte', value:'lg'}]}
      ],
      estructura: [
        { id: 'card_padding', label: 'Padding Interno', type: 'range', defaultValue: 32, min: 16, max: 48 },
        { id: 'card_radius', label: 'Radio de Borde', type: 'range', defaultValue: 24, min: 0, max: 40 }
      ],
      interaccion: [
        { id: 'hover_lift', label: 'Elevar al pasar mouse', type: 'boolean', defaultValue: true }
      ],
      contenido: [], tipografia: [], multimedia: []
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
        { label: 'Centrado (Narrativo)', value: 'centered' }
      ]},
      { id: 'padding_y', label: 'Padding Vertical', type: 'range', defaultValue: 100, min: 40, max: 200, unit: 'px' },
      { id: 'content_width', label: 'Ancho de Contenido', type: 'range', defaultValue: 1200, min: 800, max: 1400, unit: 'px' }
    ],
    estilo: [
      { id: 'bg_color', label: 'Fondo de Sección', type: 'color', defaultValue: '#FFFFFF' }
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
        { id: 'description', label: 'Descripción', type: 'text', defaultValue: 'Desde 2015, hemos transformado la manera en que las empresas interactúan con la tecnología, poniendo siempre a las personas en el centro de cada solución.' }
      ],
      tipografia: [
        { id: 'title_size', label: 'Tamaño Título', type: 'range', defaultValue: 48, min: 32, max: 72 },
        { id: 'title_color', label: 'Color Título', type: 'color', defaultValue: '#0F172A' },
        { id: 'desc_size', label: 'Tamaño Descripción', type: 'range', defaultValue: 18, min: 14, max: 24 }
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
        { id: 'show_frame', label: 'Marco Decorativo', type: 'boolean', defaultValue: false }
      ],
      interaccion: [
        { id: 'floating', label: 'Efecto Flotante', type: 'boolean', defaultValue: false }
      ],
      contenido: [], tipografia: [], estructura: []
    }},
    { id: 'el_about_stats', name: 'Estadísticas (Stats)', type: 'style', groups: ['contenido', 'estilo', 'estructura'], settings: {
      contenido: [
        { id: 'show_stats', label: 'Mostrar Estadísticas', type: 'boolean', defaultValue: true }
      ],
      estilo: [
        { id: 'stat_color', label: 'Color de Números', type: 'color', defaultValue: 'var(--primary-color)' }
      ],
      estructura: [
        { id: 'columns', label: 'Columnas', type: 'range', defaultValue: 3, min: 2, max: 4 }
      ],
      tipografia: [], multimedia: [], interaccion: []
    }}
  ]
};

const PROCESS_MODULE: WebModule = {
  id: 'mod_process_1',
  type: 'process',
  name: 'Proceso / Roadmap Premium',
  globalGroups: ['estructura', 'estilo', 'interaccion'],
  globalSettings: {
    estructura: [
      { id: 'layout', label: 'Diseño de Proceso', type: 'select', defaultValue: 'horizontal', options: [
        { label: 'Pasos Horizontales', value: 'horizontal' },
        { label: 'Timeline Vertical', value: 'vertical' },
        { label: 'Lista Alternada', value: 'alternating' }
      ]},
      { id: 'padding_y', label: 'Padding Vertical', type: 'range', defaultValue: 100, min: 40, max: 200, unit: 'px' },
      { id: 'gap', label: 'Espacio entre pasos', type: 'range', defaultValue: 40, min: 20, max: 100, unit: 'px' }
    ],
    estilo: [
      { id: 'bg_color', label: 'Fondo de Sección', type: 'color', defaultValue: '#F8FAFC' },
      { id: 'connector_style', label: 'Estilo de Conector', type: 'select', defaultValue: 'dashed', options: [
        { label: 'Sólido', value: 'solid' },
        { label: 'Punteado', value: 'dashed' },
        { label: 'Oculto', value: 'none' }
      ]}
    ],
    interaccion: [
      { id: 'entrance_anim', label: 'Animación de Entrada', type: 'boolean', defaultValue: true },
      { id: 'draw_connectors', label: 'Dibujar Conectores', type: 'boolean', defaultValue: true }
    ],
    contenido: [], tipografia: [], multimedia: []
  },
  elements: [
    { id: 'el_process_header', name: 'Encabezado', type: 'text', groups: ['contenido', 'tipografia', 'estructura'], settings: {
      contenido: [
        { id: 'title', label: 'Título', type: 'text', defaultValue: 'Nuestro Proceso' },
        { id: 'subtitle', label: 'Subtítulo', type: 'text', defaultValue: 'Cómo trabajamos para hacer realidad tus ideas.' }
      ],
      tipografia: [
        { id: 'align', label: 'Alineación', type: 'select', defaultValue: 'center', options: [{label:'Izquierda', value:'left'}, {label:'Centro', value:'center'}]},
        { id: 'title_size', label: 'Tamaño Título', type: 'range', defaultValue: 32, min: 24, max: 48 }
      ],
      estructura: [{ id: 'margin_b', label: 'Margen Inferior', type: 'range', defaultValue: 60, min: 20, max: 100 }],
      estilo: [], multimedia: [], interaccion: []
    }},
    { id: 'el_process_step', name: 'Estilo de Paso', type: 'style', groups: ['estilo', 'estructura', 'interaccion'], settings: {
      estilo: [
        { id: 'card_bg', label: 'Fondo de Tarjeta', type: 'color', defaultValue: '#FFFFFF' },
        { id: 'card_border', label: 'Color de Borde', type: 'color', defaultValue: 'rgba(0,0,0,0.05)' },
        { id: 'card_radius', label: 'Radio de Borde', type: 'range', defaultValue: 24, min: 0, max: 40 }
      ],
      estructura: [
        { id: 'card_padding', label: 'Padding Interno', type: 'range', defaultValue: 32, min: 16, max: 48 }
      ],
      interaccion: [
        { id: 'hover_lift', label: 'Elevar al pasar mouse', type: 'boolean', defaultValue: true }
      ],
      contenido: [], tipografia: [], multimedia: []
    }},
    { id: 'el_process_indicator', name: 'Indicador (Número/Icono)', type: 'style', groups: ['estilo', 'multimedia'], settings: {
      estilo: [
        { id: 'indicator_bg', label: 'Fondo Indicador', type: 'color', defaultValue: 'var(--primary-color)' },
        { id: 'indicator_color', label: 'Color Texto/Icono', type: 'color', defaultValue: '#FFFFFF' }
      ],
      multimedia: [
        { id: 'use_icons', label: 'Usar Iconos en vez de Números', type: 'boolean', defaultValue: false }
      ],
      contenido: [], tipografia: [], estructura: [], interaccion: []
    }}
  ]
};

const GALLERY_MODULE: WebModule = {
  id: 'mod_gallery_1',
  type: 'gallery',
  name: 'Galería Visual Premium',
  globalGroups: ['estructura', 'estilo', 'interaccion'],
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
      { id: 'bg_color', label: 'Fondo de Sección', type: 'color', defaultValue: '#FFFFFF' }
    ],
    interaccion: [
      { id: 'entrance_anim', label: 'Animación de Entrada', type: 'boolean', defaultValue: true },
      { id: 'enable_lightbox', label: 'Habilitar Lightbox (Zoom)', type: 'boolean', defaultValue: true }
    ],
    contenido: [], tipografia: [], multimedia: []
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
        { id: 'overlay_color', label: 'Color de Overlay (Hover)', type: 'color', defaultValue: 'rgba(0,0,0,0.4)' }
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
          { label: 'Centro', value: 'center' }
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
  globalGroups: ['estructura', 'estilo', 'interaccion'],
  globalSettings: {
    estructura: [
      { id: 'layout', label: 'Diseño de Video', type: 'select', defaultValue: 'centered', options: [
        { label: 'Ancho Completo (Inmersivo)', value: 'full' },
        { label: 'Tarjeta Centrada', value: 'centered' },
        { label: 'Split (Texto + Video)', value: 'split' }
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
      { id: 'overlay_color', label: 'Color de Overlay', type: 'color', defaultValue: 'rgba(0,0,0,0.2)' }
    ],
    interaccion: [
      { id: 'entrance_anim', label: 'Animación de Entrada', type: 'boolean', defaultValue: true }
    ],
    contenido: [], tipografia: [], multimedia: []
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
        { id: 'shadow', label: 'Sombra Profunda', type: 'boolean', defaultValue: true }
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
    { id: 'el_video_text', name: 'Textos de Apoyo', type: 'text', groups: ['contenido', 'tipografia'], settings: {
      contenido: [
        { id: 'show_text', label: 'Mostrar Textos', type: 'boolean', defaultValue: true },
        { id: 'title', label: 'Título del Video', type: 'text', defaultValue: 'Descubre nuestra visión' },
        { id: 'subtitle', label: 'Subtítulo', type: 'text', defaultValue: 'Un recorrido visual por lo que nos hace únicos.' }
      ],
      tipografia: [
        { id: 'align', label: 'Alineación', type: 'select', defaultValue: 'center', options: [{label:'Izquierda', value:'left'}, {label:'Centro', value:'center'}]},
        { id: 'title_size', label: 'Tamaño Título', type: 'range', defaultValue: 32, min: 24, max: 48 }
      ],
      estilo: [], multimedia: [], estructura: [], interaccion: []
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
        { label: 'Masonry (Dinámico)', value: 'masonry' }
      ]},
      { id: 'columns', label: 'Columnas (Desktop)', type: 'range', defaultValue: 3, min: 1, max: 4 },
      { id: 'gap', label: 'Espacio entre tarjetas', type: 'range', defaultValue: 30, min: 10, max: 60, unit: 'px' },
      { id: 'padding_y', label: 'Padding Vertical', type: 'range', defaultValue: 100, min: 40, max: 200, unit: 'px' }
    ],
    estilo: [
      { id: 'bg_color', label: 'Fondo de Sección', type: 'color', defaultValue: '#F8FAFC' }
    ],
    interaccion: [
      { id: 'autoplay', label: 'Reproducción Automática', type: 'boolean', defaultValue: true },
      { id: 'entrance_anim', label: 'Animación de Entrada', type: 'boolean', defaultValue: true }
    ],
    contenido: [], tipografia: [], multimedia: []
  },
  elements: [
    { id: 'el_testimonials_header', name: 'Encabezado', type: 'text', groups: ['contenido', 'tipografia', 'estructura'], settings: {
      contenido: [
        { id: 'title', label: 'Título', type: 'text', defaultValue: 'Lo que dicen nuestros clientes' },
        { id: 'subtitle', label: 'Subtítulo', type: 'text', defaultValue: 'Historias reales de personas que confían en nosotros.' }
      ],
      tipografia: [
        { id: 'align', label: 'Alineación', type: 'select', defaultValue: 'center', options: [{label:'Izquierda', value:'left'}, {label:'Centro', value:'center'}]},
        { id: 'title_size', label: 'Tamaño Título', type: 'range', defaultValue: 32, min: 24, max: 48 }
      ],
      estructura: [{ id: 'margin_b', label: 'Margen Inferior', type: 'range', defaultValue: 60, min: 20, max: 100 }],
      estilo: [], multimedia: [], interaccion: []
    }},
    { id: 'el_testimonial_card', name: 'Estilo de Tarjeta', type: 'style', groups: ['estilo', 'estructura', 'interaccion'], settings: {
      estilo: [
        { id: 'card_bg', label: 'Fondo de Tarjeta', type: 'color', defaultValue: '#FFFFFF' },
        { id: 'card_radius', label: 'Radio de Borde', type: 'range', defaultValue: 24, min: 0, max: 40 },
        { id: 'show_shadow', label: 'Mostrar Sombra', type: 'boolean', defaultValue: true }
      ],
      estructura: [
        { id: 'card_padding', label: 'Padding Interno', type: 'range', defaultValue: 32, min: 16, max: 48 }
      ],
      interaccion: [
        { id: 'hover_lift', label: 'Elevar al pasar mouse', type: 'boolean', defaultValue: true }
      ],
      contenido: [], tipografia: [], multimedia: []
    }},
    { id: 'el_testimonial_author', name: 'Estilo de Autor', type: 'style', groups: ['estilo', 'multimedia'], settings: {
      estilo: [
        { id: 'author_color', label: 'Color Nombre', type: 'color', defaultValue: '#0F172A' },
        { id: 'role_color', label: 'Color Cargo', type: 'color', defaultValue: '#64748B' }
      ],
      multimedia: [
        { id: 'show_avatar', label: 'Mostrar Avatar', type: 'boolean', defaultValue: true },
        { id: 'show_stars', label: 'Mostrar Calificación (Estrellas)', type: 'boolean', defaultValue: true }
      ],
      contenido: [], tipografia: [], estructura: [], interaccion: []
    }}
  ]
};

const STATS_MODULE: WebModule = {
  id: 'mod_stats_1',
  type: 'stats',
  name: 'Estadísticas de Impacto',
  globalGroups: ['estructura', 'estilo', 'interaccion'],
  globalSettings: {
    estructura: [
      { id: 'layout', label: 'Diseño de Grilla', type: 'select', defaultValue: 'grid', options: [
        { label: 'Grilla Clásica', value: 'grid' },
        { label: 'Bento (Destacado)', value: 'bento' },
        { label: 'Minimalista', value: 'minimal' }
      ]},
      { id: 'columns', label: 'Columnas (Desktop)', type: 'range', defaultValue: 4, min: 1, max: 5 },
      { id: 'gap', label: 'Espaciado', type: 'range', defaultValue: 30, min: 0, max: 80, unit: 'px' },
      { id: 'padding_y', label: 'Padding Vertical', type: 'range', defaultValue: 80, min: 20, max: 200, unit: 'px' }
    ],
    estilo: [
      { id: 'bg_color', label: 'Fondo de Sección', type: 'color', defaultValue: '#FFFFFF' }
    ],
    interaccion: [
      { id: 'entrance_anim', label: 'Animación de Entrada', type: 'boolean', defaultValue: true },
      { id: 'count_speed', label: 'Velocidad de Conteo', type: 'range', defaultValue: 2, min: 1, max: 5, unit: 's' }
    ],
    contenido: [], tipografia: [], multimedia: []
  },
  elements: [
    { id: 'el_stats_header', name: 'Encabezado', type: 'text', groups: ['contenido', 'tipografia', 'estructura'], settings: {
      contenido: [
        { id: 'show_header', label: 'Mostrar Encabezado', type: 'boolean', defaultValue: false },
        { id: 'title', label: 'Título', type: 'text', defaultValue: 'Nuestros Logros' },
        { id: 'subtitle', label: 'Subtítulo', type: 'text', defaultValue: 'Números que respaldan nuestra trayectoria.' }
      ],
      tipografia: [
        { id: 'align', label: 'Alineación', type: 'select', defaultValue: 'center', options: [{label:'Izquierda', value:'left'}, {label:'Centro', value:'center'}]},
        { id: 'title_size', label: 'Tamaño Título', type: 'range', defaultValue: 32, min: 24, max: 48 }
      ],
      estructura: [{ id: 'margin_b', label: 'Margen Inferior', type: 'range', defaultValue: 60, min: 20, max: 100 }],
      estilo: [], multimedia: [], interaccion: []
    }},
    { id: 'el_stat_item', name: 'Estilo de Métrica', type: 'style', groups: ['estilo', 'tipografia', 'interaccion'], settings: {
      estilo: [
        { id: 'card_bg', label: 'Fondo de Item', type: 'color', defaultValue: 'transparent' },
        { id: 'card_radius', label: 'Radio de Borde', type: 'range', defaultValue: 16, min: 0, max: 40 },
        { id: 'show_border', label: 'Mostrar Borde', type: 'boolean', defaultValue: false }
      ],
      tipografia: [
        { id: 'number_color', label: 'Color del Número', type: 'color', defaultValue: 'var(--primary-color)' },
        { id: 'label_color', label: 'Color de Etiqueta', type: 'color', defaultValue: '#64748B' },
        { id: 'number_size', label: 'Tamaño del Número', type: 'range', defaultValue: 48, min: 32, max: 80 }
      ],
      interaccion: [
        { id: 'hover_scale', label: 'Escalar al pasar mouse', type: 'boolean', defaultValue: true }
      ],
      contenido: [], multimedia: [], estructura: []
    }},
    { id: 'el_stat_icon', name: 'Iconografía', type: 'style', groups: ['multimedia', 'estilo'], settings: {
      multimedia: [
        { id: 'show_icons', label: 'Mostrar Iconos', type: 'boolean', defaultValue: true }
      ],
      estilo: [
        { id: 'icon_color', label: 'Color de Icono', type: 'color', defaultValue: 'var(--primary-color)' },
        { id: 'icon_bg', label: 'Fondo de Icono', type: 'color', defaultValue: 'rgba(59, 130, 246, 0.1)' }
      ],
      contenido: [], tipografia: [], estructura: [], interaccion: []
    }}
  ]
};

const CLIENTS_MODULE: WebModule = {
  id: 'mod_clients_1',
  type: 'clients',
  name: 'Clientes',
  globalGroups: ['contenido', 'estructura', 'estilo', 'interaccion'],
  globalSettings: {
    contenido: [
      { id: 'select_customers', label: 'Selección de Clientes', type: 'customer_selection', defaultValue: [] }
    ],
    estructura: [
      { id: 'layout', label: 'Diseño', type: 'select', defaultValue: 'grid', options: [
        { label: 'Grilla', value: 'grid' },
        { label: 'Carrusel', value: 'carousel' },
        { label: 'Marquee (Cinta)', value: 'marquee' }
      ]},
      { id: 'alignment', label: 'Alineación de Sección', type: 'select', defaultValue: 'center', options: [
        { label: 'Izquierda', value: 'left' },
        { label: 'Centro', value: 'center' },
        { label: 'Derecha', value: 'right' }
      ]},
      { id: 'columns', label: 'Columnas (Desktop)', type: 'range', defaultValue: 5, min: 1, max: 8 },
      { id: 'gap', label: 'Espaciado', type: 'range', defaultValue: 40, min: 0, max: 100, unit: 'px' },
      { id: 'padding_y', label: 'Padding Vertical', type: 'range', defaultValue: 60, min: 0, max: 200, unit: 'px' }
    ],
    estilo: [
      { id: 'bg_color', label: 'Color de Fondo', type: 'color', defaultValue: 'transparent' }
    ],
    interaccion: [
      { id: 'animation_speed', label: 'Velocidad de Animación', type: 'range', defaultValue: 30, min: 5, max: 100, unit: 's' },
      { id: 'show_tooltips', label: 'Mostrar Tooltips', type: 'boolean', defaultValue: true },
      { id: 'entrance_animation', label: 'Animación de Entrada', type: 'boolean', defaultValue: true }
    ],
    tipografia: [],
    multimedia: []
  },
  elements: [
    {
      id: 'el_clients_title',
      name: 'Título de la Sección',
      type: 'text',
      groups: ['contenido', 'tipografia', 'estructura'],
      settings: {
        contenido: [
          { id: 'title_text', label: 'Texto del Título', type: 'text', defaultValue: 'Empresas que confían en nosotros' }
        ],
        tipografia: [
          { id: 'title_size', label: 'Tamaño de Fuente', type: 'range', defaultValue: 24, min: 16, max: 48, unit: 'px' },
          { id: 'title_weight', label: 'Grosor', type: 'select', defaultValue: 'bold', options: [
            { label: 'Normal', value: 'normal' },
            { label: 'Medio', value: 'medium' },
            { label: 'Negrita', value: 'bold' }
          ]},
          { id: 'title_color', label: 'Color', type: 'color', defaultValue: 'var(--foreground-color)' }
        ],
        estructura: [
          { id: 'title_margin_bottom', label: 'Margen Inferior', type: 'range', defaultValue: 16, min: 0, max: 100, unit: 'px' }
        ],
        estilo: [],
        multimedia: [],
        interaccion: []
      }
    },
    {
      id: 'el_clients_subtitle',
      name: 'Subtítulo de la Sección',
      type: 'text',
      groups: ['contenido', 'tipografia', 'estructura'],
      settings: {
        contenido: [
          { id: 'subtitle_text', label: 'Texto del Subtítulo', type: 'text', defaultValue: 'Trabajamos con los mejores para ofrecerte lo mejor.' }
        ],
        tipografia: [
          { id: 'subtitle_size', label: 'Tamaño de Fuente', type: 'range', defaultValue: 16, min: 12, max: 24, unit: 'px' },
          { id: 'subtitle_color', label: 'Color', type: 'color', defaultValue: 'var(--foreground-color)' }
        ],
        estructura: [
          { id: 'subtitle_margin_bottom', label: 'Margen Inferior', type: 'range', defaultValue: 40, min: 0, max: 100, unit: 'px' }
        ],
        estilo: [],
        multimedia: [],
        interaccion: []
      }
    },
    {
      id: 'el_client_logo',
      name: 'Logotipo del Cliente',
      type: 'image',
      groups: ['multimedia', 'estilo', 'interaccion'],
      settings: {
        multimedia: [
          { id: 'logo_height', label: 'Altura Máxima', type: 'range', defaultValue: 40, min: 20, max: 100, unit: 'px' },
          { id: 'logo_fit', label: 'Ajuste', type: 'select', defaultValue: 'contain', options: [
            { label: 'Contener', value: 'contain' },
            { label: 'Cubrir', value: 'cover' }
          ]}
        ],
        estilo: [
          { id: 'logo_filter', label: 'Filtro de Color', type: 'select', defaultValue: 'grayscale', options: [
            { label: 'Original', value: 'none' },
            { label: 'Escala de Grises', value: 'grayscale' },
            { label: 'Blanco', value: 'brightness(0) invert(1)' }
          ]},
          { id: 'logo_opacity', label: 'Opacidad', type: 'range', defaultValue: 60, min: 0, max: 100, unit: '%' },
          { id: 'logo_border_radius', label: 'Radio de Borde', type: 'range', defaultValue: 0, min: 0, max: 50, unit: 'px' }
        ],
        interaccion: [
          { id: 'hover_effect', label: 'Efecto Hover', type: 'boolean', defaultValue: true },
          { id: 'hover_scale', label: 'Escala al pasar el mouse', type: 'range', defaultValue: 110, min: 100, max: 150, unit: '%' },
          { id: 'enable_links', label: 'Habilitar Enlaces', type: 'boolean', defaultValue: false }
        ],
        contenido: [],
        estructura: [],
        tipografia: []
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
  onAddModule
}: { 
  activeTab: string, 
  onTabChange: (tab: string) => void, 
  onBackToDashboard: () => void,
  logoUrl: string | null,
  logoWhiteUrl: string | null,
  project: Project | null,
  onAddModule: (module: WebModule) => void
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
        <div className="flex items-center justify-center">
          <div className="h-12 w-full flex items-center justify-center">
            {displayLogo ? (
              <img src={displayLogo} alt="Logo" className="h-full w-auto object-contain" referrerPolicy="no-referrer" />
            ) : (
              <FileText className="text-sidebar-foreground/20 w-10 h-10" />
            )}
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
              expandedSection === 'diseno' ? 'text-sidebar-foreground font-bold' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground'
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
                : 'text-sidebar-foreground/60 hover:text-sidebar-foreground'
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
                    expandedCategory === 'navegacion' ? 'font-bold text-sidebar-foreground' : 'font-normal text-sidebar-foreground/60'
                  }`}
                >
                  Navegación
                  <ChevronDown size={12} className={`transition-transform ${expandedCategory === 'navegacion' ? 'rotate-180' : ''}`} />
                </button>
                {expandedCategory === 'navegacion' && (
                  <div className="space-y-0.5 px-2">
                    <ModuleItem icon={<Monitor size={18} />} label="Barra superior" />
                    <ModuleItem icon={<FileText size={18} />} label="Menú" />
                    <ModuleItem icon={<Layout size={18} />} label="Pie de página" />
                    <ModuleItem icon={<RotateCcw size={18} className="rotate-90" />} label="Espaciadores" />
                  </div>
                )}
              </div>

              {/* CONTENIDO */}
              <div className="space-y-2">
                <button 
                  onClick={() => toggleCategory('contenido')}
                  className={`w-full flex items-center justify-between px-4 py-1 text-xs uppercase tracking-widest transition-all ${
                    expandedCategory === 'contenido' ? 'font-bold text-sidebar-foreground' : 'font-normal text-sidebar-foreground/60'
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
                    expandedCategory === 'confianza' ? 'font-bold text-sidebar-foreground' : 'font-normal text-sidebar-foreground/60'
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
                    <ModuleItem icon={<User size={18} />} label="Equipo" />
                  </div>
                )}
              </div>

              {/* VENTAS */}
              <div className="space-y-2">
                <button 
                  onClick={() => toggleCategory('ventas')}
                  className={`w-full flex items-center justify-between px-4 py-1 text-xs uppercase tracking-widest transition-all ${
                    expandedCategory === 'ventas' ? 'font-bold text-sidebar-foreground' : 'font-normal text-sidebar-foreground/60'
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
                    <ModuleItem icon={<Settings size={18} />} label="Planes" />
                    <ModuleItem icon={<PlusCircle size={18} />} label="Call to Action (C...)" />
                  </div>
                )}
              </div>

              {/* CONTACTO */}
              <div className="space-y-2">
                <button 
                  onClick={() => toggleCategory('contacto')}
                  className={`w-full flex items-center justify-between px-4 py-1 text-xs uppercase tracking-widest transition-all ${
                    expandedCategory === 'contacto' ? 'font-bold text-sidebar-foreground' : 'font-normal text-sidebar-foreground/60'
                  }`}
                >
                  Contacto
                  <ChevronDown size={12} className={`transition-transform ${expandedCategory === 'contacto' ? 'rotate-180' : ''}`} />
                </button>
                {expandedCategory === 'contacto' && (
                  <div className="space-y-0.5 px-2">
                    <ModuleItem icon={<Home size={18} />} label="Contacto" />
                    <ModuleItem icon={<FileText size={18} />} label="Newsletter" />
                    <ModuleItem icon={<Settings size={18} />} label="FAQ" />
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
    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-foreground/5 transition-all group"
  >
    <div className="text-sidebar-foreground/40 group-hover:text-sidebar-foreground transition-colors">{icon}</div>
    <span className="text-sm font-medium">{label}</span>
  </button>
);

interface StructurePanelProps {
  editorState: EditorState;
  setEditorState: React.Dispatch<React.SetStateAction<EditorState>>;
  onSettingChange: (elementOrModuleId: string, settingId: string, value: any) => void;
  onRemoveModule: (moduleId: string) => void;
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
    <div className="w-64 bg-surface border-r border-border flex flex-col z-30 shadow-xl shadow-text/5 overflow-hidden">
      <div className="p-4 flex items-center justify-between border-b border-border/30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <Layers className="text-white w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-bold text-text">Estructura</span>
        </div>
        <button className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors">
          <RotateCcw size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {editorState.addedModules.length === 0 && (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto">
              <Layout className="text-text/20 w-6 h-6" />
            </div>
            <p className="text-[11px] font-medium text-text/40">No hay módulos añadidos aún.</p>
          </div>
        )}

        {editorState.addedModules.map(module => {
          const isModuleExpanded = editorState.expandedModuleId === module.id;
          
          // Virtual element for global configuration
          const globalElement: ModuleElement = {
            id: module.id + '_global',
            name: 'Configuración Global',
            type: 'global',
            groups: module.globalGroups
          };

          const allElements = [globalElement, ...module.elements];

          return (
            <div key={module.id} className="p-3 border-b border-border/30 last:border-0">
              <div 
                onClick={() => toggleModule(module.id)}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer group ${
                  isModuleExpanded 
                    ? 'bg-primary/10 border-primary/20' 
                    : 'bg-secondary/50 border-border/50 hover:border-border'
                }`}
              >
                <GripVertical className={isModuleExpanded ? 'text-primary/30' : 'text-text/20'} size={14} />
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  isModuleExpanded ? 'bg-primary' : 'bg-surface border border-border/50'
                }`}>
                  <Layout className={isModuleExpanded ? 'text-white' : 'text-text/40'} size={12} />
                </div>
                <span className={`text-[14px] font-bold flex-1 ${
                  isModuleExpanded ? 'text-primary' : 'text-text'
                }`}>
                  {module.name}
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
                                  if (!isAvailable) return null;

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

const TopBar = ({ onSave, onPublish, logoUrl }: { onSave: () => void, onPublish: () => void, logoUrl: string | null }) => (
  <div className="h-[60px] bg-surface border-b border-border/30 flex items-center justify-between px-6 z-20">
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
        <p className="text-xs font-normal text-text/20 uppercase tracking-wider">Añade módulos para construir tu página</p>
      </div>
    </div>

    <div className="flex items-center gap-4">
      <div className="flex items-center gap-3 border-r border-border/30 pr-4">
        <button className="p-1.5 text-text/40 hover:text-primary hover:bg-secondary rounded-lg transition-all"><RotateCcw size={16} /></button>
        <div className="flex items-center gap-1.5 bg-secondary p-1 rounded-xl">
          <button className="p-1.5 text-primary bg-surface shadow-sm rounded-lg transition-all"><Monitor size={14} /></button>
          <button className="p-1.5 text-text/40 hover:text-primary transition-all"><Smartphone size={14} /></button>
        </div>
        <button className="p-1.5 text-text/40 hover:text-primary hover:bg-secondary rounded-lg transition-all"><Maximize size={16} /></button>
      </div>

      <div className="flex items-center gap-2">
        <motion.button 
          whileHover={{ scale: 1.02, backgroundColor: 'var(--secondary-color)' }}
          whileTap={{ scale: 0.98 }}
          onClick={onSave}
          className="flex items-center gap-2 px-4 py-2 text-text/60 font-bold text-xs rounded-xl transition-all"
        >
          <Save size={16} />
          Guardar Borrador
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={onPublish}
          className="flex items-center gap-2 px-5 py-2 bg-primary text-white font-bold text-xs rounded-xl shadow-lg shadow-primary/20 transition-all"
        >
          <Send size={16} />
          Publicar
        </motion.button>
      </div>
    </div>
  </div>
);

const Canvas: React.FC<{ 
  editorState: EditorState, 
  onAddModule: (module: WebModule) => void,
  products: Product[],
  customers: Customer[],
  isDevMode: boolean,
  logoUrl?: string | null,
  logoWhiteUrl?: string | null
}> = ({ editorState, onAddModule, products, customers, isDevMode, logoUrl, logoWhiteUrl }) => {
  const lastModuleRef = React.useRef<HTMLDivElement>(null);
  const prevModulesLength = React.useRef(editorState.addedModules.length);

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

  return (
    <div className="flex-1 bg-secondary overflow-y-auto custom-scrollbar">
      <div className="p-12 flex justify-center min-h-full">
        {/* Preview Window */}
        <div className="w-full max-w-5xl bg-surface shadow-2xl rounded-2xl border border-border/50 min-h-[800px] mb-32 relative overflow-hidden">
          {/* Dynamic Modules */}
          <div className="w-full">
            {editorState.addedModules.map((module, index) => {
            const isLast = index === editorState.addedModules.length - 1;
            
            return (
              <div key={module.id} ref={isLast ? lastModuleRef : null} className="w-full">
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

      {/* Bottom Status Bar */}
      <div className="fixed bottom-8 right-8 flex items-center gap-3 bg-surface px-4 py-2.5 rounded-xl shadow-xl border border-border/30">
        <div className="w-5 h-5 bg-emerald-50 rounded-full flex items-center justify-center">
          <CheckCircle2 className="text-emerald-500 w-3.5 h-3.5" />
        </div>
        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Configuración Recibida</span>
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
  const [siteName, setSiteName] = useState(initialPage?.siteName || project?.name || '');
  const [isSaving, setIsSaving] = useState(false);
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

  const addModule = (module: WebModule) => {
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
    
    setEditorState(prev => ({
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

  const confirmRemoveModule = () => {
    if (!moduleToDelete) return;
    
    const moduleId = moduleToDelete.id;
    setEditorState(prev => {
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
    setEditorState(prev => ({
      ...prev,
      settingsValues: {
        ...prev.settingsValues,
        [`${elementOrModuleId}_${settingId}`]: value
      }
    }));
  };

  const handleSaveDraft = async () => {
    if (!projectId) return;
    setIsSaving(true);
    
    try {
      const siteId = initialPage?.siteId || project?.id || `site_${Date.now()}`;
      
      const payload = {
        data: editorState,
        metadata: {
          siteId: siteId,
          siteName: siteName || 'Borrador sin nombre',
          action: 'saveDraft' as const,
          isPublish: false,
          timestamp: Date.now()
        }
      };

      const siteData = {
        id: initialPage && 'contentDraft' in initialPage ? initialPage.id : undefined,
        projectId,
        userId: currentUserId || undefined,
        siteId: payload.metadata.siteId,
        siteName: payload.metadata.siteName,
        isPublish: false,
        name: payload.metadata.siteName,
        contentDraft: payload.data,
        status: 'draft' as const,
      };
      
      const result = await saveWebBuilderSiteDraft(siteData);
      if (result) {
        console.log('Borrador guardado con éxito (SIP v4.0)');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!projectId) return;
    if (!siteName) {
      setShowPublishModal(true);
      return;
    }

    setIsSaving(true);
    try {
      // Helper to get setting value with fallback
      const getSetting = (moduleId: string, settingId: string, defaultValue: any) => {
        const key = `${moduleId}_global_${settingId}`;
        return editorState.settingsValues[key] !== undefined ? editorState.settingsValues[key] : defaultValue;
      };

      // 1. Determine Global Theme
      const firstModuleId = editorState.addedModules[0]?.id;
      const primaryColor = firstModuleId 
        ? getSetting(firstModuleId, 'primary_color', project?.brandColors?.primary || '#2563EB')
        : (project?.brandColors?.primary || '#2563EB');

      const renderingContract: RenderingContract = {
        theme: {
          primaryColor,
          fontFamily: project?.fontFamily || 'Inter',
        },
        sections: editorState.addedModules.map(module => {
          const content: any = {
            title: getSetting(module.id, 'section_title', ''),
            subtitle: getSetting(module.id, 'section_desc', ''),
          };

          if (module.type === 'products') {
            content.productIds = getSetting(module.id, 'select_products', []);
          }
          if (module.type === 'clients') {
            content.customerIds = getSetting(module.id, 'select_customers', []);
          }

          return {
            id: module.id,
            type: module.type as any,
            content
          };
        })
      };

      const siteId = initialPage?.siteId || project?.id || `site_${Date.now()}`;

      const payload = {
        data: renderingContract,
        metadata: {
          siteId: siteId,
          siteName: siteName,
          action: 'publishSite' as const,
          isPublish: true,
          timestamp: Date.now()
        }
      };

      const result = await publishWebBuilderSite({
        id: initialPage && !('contentDraft' in initialPage) ? initialPage.id : undefined,
        projectId,
        siteId: payload.metadata.siteId,
        siteName: payload.metadata.siteName,
        isPublish: true,
        content: payload.data,
        metadata: payload.metadata
      });

      if (result) {
        console.log('Sitio publicado con éxito (SIP v4.0)');
        setShowPublishModal(false);
      }
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
              projectId={projectId}
              products={products}
              customers={customers}
            />
            <div className="flex-1 flex flex-col h-full">
              <TopBar 
                onSave={handleSaveDraft} 
                onPublish={handlePublish} 
                logoUrl={logoUrl}
              />
              <Canvas 
                editorState={editorState} 
                onAddModule={addModule} 
                products={products}
                customers={customers}
                isDevMode={projectId === 'dev-project-id'}
                logoUrl={logoUrl}
                logoWhiteUrl={logoWhiteUrl}
              />
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
