import { FieldSchema } from './registry';

export const TYPOGRAPHY_PROPS = (prefix: string, label: string): FieldSchema[] => [
  {
    name: `${prefix}_style`,
    label: `${label} - Estilo`,
    type: 'object',
    itemSchema: [
      { 
        name: 'size', 
        label: 'Tamaño', 
        type: 'select', 
        options: [
          { label: 'Título 1', value: 'h1' },
          { label: 'Título 2', value: 'h2' },
          { label: 'Título 3', value: 'h3' },
          { label: 'Párrafo', value: 'p' },
          { label: 'Pequeño', value: 'small' }
        ]
      },
      { 
        name: 'weight', 
        label: 'Peso', 
        type: 'select', 
        options: [
          { label: 'Normal (400)', value: '400' },
          { label: 'Semibold (600)', value: '600' },
          { label: 'Bold (700)', value: '700' },
          { label: 'Extra Bold (800)', value: '800' },
          { label: 'Black (900)', value: '900' }
        ]
      },
      { name: 'italic', label: 'Itálica', type: 'boolean' },
      { name: 'underline', label: 'Subrayado', type: 'boolean' },
      { name: 'strike', label: 'Tachado', type: 'boolean' },
      { 
        name: 'align', 
        label: 'Alineación', 
        type: 'toggle-group', 
        options: [
          { label: 'Izquierda', value: 'left' },
          { label: 'Centro', value: 'center' },
          { label: 'Derecha', value: 'right' }
        ]
      },
      { 
        name: 'highlightType', 
        label: 'Efecto de Resalte (*texto*)', 
        type: 'select', 
        options: [
          { label: 'Ninguno', value: 'none' },
          { label: 'Sólido (Primario)', value: 'solid' },
          { label: 'Degradado (Proyecto)', value: 'gradient' },
          { label: 'Personalizado', value: 'custom' }
        ]
      },
      { name: 'highlightColor1', label: 'Color Personalizado 1', type: 'color' },
      { name: 'highlightColor2', label: 'Color Personalizado 2', type: 'color' }
    ]
  }
];

export const BUTTON_GROUP_PROPS = (name: string, label: string): FieldSchema => ({
  name,
  label,
  type: 'object',
  category: 'content',
  itemSchema: [
    { name: 'text', label: 'Texto del Botón', type: 'text' },
    { name: 'url', label: 'URL / Enlace', type: 'text' },
    { 
      name: 'target', 
      label: 'Abrir en', 
      type: 'select', 
      options: [
        { label: 'Misma pestaña', value: '_self' },
        { label: 'Nueva pestaña', value: '_blank' }
      ]
    }
  ]
});

export const DESIGN_PROPS: FieldSchema[] = [
  {
    name: 'layout',
    label: 'Disposición (Layout)',
    type: 'toggle-group',
    options: [
      { label: 'Centrado', value: 'layout-1' },
      { label: 'Dividido', value: 'layout-2' },
      { label: 'Asimétrico', value: 'layout-3' },
      { label: 'Caja Flotante', value: 'layout-4' },
      { label: 'Lateral', value: 'layout-5' },
      { label: 'Bento', value: 'layout-6' },
      { label: 'Superposición', value: 'layout-7' }
    ]
  },
  {
    name: 'smartMode',
    label: 'Modo Inteligente',
    type: 'boolean',
    category: 'design'
  },
  {
    name: 'theme',
    label: 'Tema del Módulo',
    type: 'toggle-group',
    options: [
      { label: 'Claro', value: 'light' },
      { label: 'Oscuro', value: 'dark' }
    ]
  },
  {
    name: 'animation',
    label: 'Animación de Entrada',
    type: 'select',
    options: [
      { label: 'Ninguna', value: 'none' },
      { label: 'Desvanecer Arriba (Fade Up)', value: 'fade-up' },
      { label: 'Desvanecer (Fade In)', value: 'fade-in' },
      { label: 'Deslizar Izquierda', value: 'slide-left' },
      { label: 'Deslizar Derecha', value: 'slide-right' },
      { label: 'Zoom In', value: 'zoom-in' },
      { label: 'Zoom Out', value: 'zoom-out' },
      { label: 'Flip Up', value: 'flip-up' }
    ]
  },
  {
    name: 'background',
    label: 'Fondo del Módulo',
    type: 'object',
    itemSchema: [
      { name: 'image', label: 'Imagen de Fondo', type: 'image' },
      { 
        name: 'size', 
        label: 'Ajuste de Imagen', 
        type: 'select', 
        options: [
          { label: 'Rellenar (Cover)', value: 'cover' },
          { label: 'Ajustar (Contain)', value: 'contain' },
          { label: 'Mosaico (Tile)', value: 'repeat' },
          { label: 'Original', value: 'auto' }
        ]
      },
      { 
        name: 'overlayOpacity', 
        label: 'Opacidad Superposición', 
        type: 'range',
        min: 0,
        max: 1,
        step: 0.05
      }
    ]
  }
];

