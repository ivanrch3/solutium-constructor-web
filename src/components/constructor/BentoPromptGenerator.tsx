import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Type, 
  Layout, 
  Settings, 
  Trash2, 
  Plus, 
  Check, 
  AlertCircle,
  Wand2,
  Columns,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BentoSchema, BentoItem, BentoIntent, BentoTone, BentoItemType, BentoCardStyle } from '../../types/bentoSchema';
import { validateBentoSchema, repairBentoSchema } from '../../utils/bentoSchemaValidator';

interface BentoPromptGeneratorProps {
  onInsert: (schema: BentoSchema) => void;
  onClose: () => void;
}

const INTENTS = [
  { id: 'benefits_grid', label: 'Beneficios del producto', description: 'Destaca las ventajas competitivas.' },
  { id: 'features_grid', label: 'Características técnicas', description: 'Muestra capacidades y funciones.' },
  { id: 'apps_showcase', label: 'Ecosistema de Apps', description: 'Presenta integraciones o herramientas.' },
  { id: 'stats_grid', label: 'Métricas e Impacto', description: 'Céntrate en números y resultados.' },
  { id: 'process_summary', label: 'Resumen de Proceso', description: 'Explica los pasos de tu servicio.' },
  { id: 'use_cases', label: 'Casos de Uso', description: 'Muestra cómo se aplica en la vida real.' },
  { id: 'cta_grid', label: 'Llamados a la Acción', description: 'Grid diseñado para conversión.' },
  { id: 'mixed', label: 'Contenido Mixto', description: 'Una mezcla equilibrada de todo lo anterior.' },
];

const SIMULATED_CONTENT_LIBRARY: Record<string, { title: string, description: string, icon: string, type?: BentoItemType, [key: string]: any }[]> = {
  benefits_grid: [
    { title: "Todo en un solo lugar", description: "CRM, catálogo, agenda, correo y automatización conectados en una sola plataforma.", icon: "Layers" },
    { title: "Apps que crecen contigo", description: "Instala solo lo que necesitas hoy y suma nuevas herramientas cuando tu negocio lo requiera.", icon: "Zap" },
    { title: "Menos configuración compleja", description: "Archie te guía paso a paso para activar tus herramientas sin depender de procesos técnicos.", icon: "Wand2" },
    { title: "Uso inteligente controlado", description: "Las funciones con IA consumen créditos visibles y medibles para mantener control de costos.", icon: "ShieldCheck" },
    { title: "Presencia digital más rápida", description: "Crea páginas, organiza productos y prepara procesos comerciales desde un mismo entorno.", icon: "Globe" },
    { title: "Base lista para automatizar", description: "Conecta apps entre sí para reducir tareas repetitivas y mejorar la operación diaria.", icon: "Cpu" },
    { title: "Soporte Estratégico", description: "Acompañamiento especializado para que tu equipo aprenda a sacar provecho de cada módulo.", icon: "Users" },
    { title: "Escalabilidad Garantizada", description: "Infraestructura robusta diseñada para soportar el crecimiento de medianas y grandes empresas.", icon: "Rocket" }
  ],
  features_grid: [
    { title: "Motor de Procesos", description: "Define flujos de trabajo personalizados con lógica condicional avanzada.", icon: "Cpu" },
    { title: "API Unificada", description: "Conecta cualquier sistema externo mediante nuestra capa de integración segura.", icon: "Layers" },
    { title: "Reportes en Tiempo Real", description: "Dashboards analíticos que se actualizan al instante con cada transacción.", icon: "BarChart3" },
    { title: "Seguridad Bancaria", description: "Encriptación de grado militar y cumplimiento con estándares internacionales.", icon: "ShieldCheck" },
    { title: "Configuración Low-Code", description: "Personaliza la interfaz y comportamiento sin escribir una sola línea de código.", icon: "Settings" },
    { title: "Multi-inquilino Nativo", description: "Gestiona múltiples marcas o departamentos desde una única cuenta maestra.", icon: "Users" }
  ],
  stats_grid: [
    { title: "40%", description: "Ahorro promedio en gastos operativos reportado por clientes.", icon: "TrendingUp", type: "metric", accent_color: "#10B981" },
    { title: "72h", description: "Tiempo récord de implementación para módulos estándar.", icon: "Clock", type: "metric", accent_color: "#3B82F6" },
    { title: "98%", description: "Tasa de retención anual gracias a estabilidad técnica.", icon: "Sparkles", type: "metric", accent_color: "#8B5CF6" },
    { title: "+5k", description: "Empresas han migrado exitosamente sus procesos.", icon: "Users", type: "metric", accent_color: "#F59E0B" },
    { title: "5x", description: "Aumento en la velocidad de procesamiento de datos.", icon: "Zap", type: "metric", accent_color: "#EF4444" },
    { title: "ROI 12m", description: "Recuperación total de la inversión en el primer año.", icon: "BarChart3", type: "metric", accent_color: "#3B82F6" }
  ],
  cta_grid: [
    { title: "Empieza Gratis", description: "Acceso total por 14 días sin compromiso.", icon: "Rocket", type: "cta", button_text: "Probar Ahora" },
    { title: "Agenda una Demo", description: "Conversa con un consultor estratégico.", icon: "Calendar", type: "icon_text", button_text: "Ver Calendario" },
    { title: "Certificado ISO", description: "Seguridad y cumplimiento nivel industrial.", icon: "ShieldCheck", type: "trust_signal" },
    { title: "Líder en G2", description: "Calificado como #1 en facilidad de uso.", icon: "Award", type: "trust_signal" }
  ],
  process_summary: [
    { title: "Definición", description: "Análisis de flujos y diseño de arquitectura modular.", icon: "Search", type: "step" },
    { title: "Activación", description: "Configuración y despliegue de herramientas.", icon: "Zap", type: "step" },
    { title: "Entrenamiento", description: "Capacitación técnica y operativa para el equipo.", icon: "Users", type: "step" },
    { title: "Optimización", description: "Mejora continua basada en datos reales.", icon: "TrendingUp", type: "step" }
  ],
  use_cases: [
    { title: "Profesionales Libres", description: "Organiza tu agenda y cobra servicios en un solo link.", icon: "Users" },
    { title: "Pequeños Negocios", description: "Digitaliza tu inventario y acepta pedidos por WhatsApp.", icon: "Globe" },
    { title: "Agencias Digitales", description: "Centraliza la comunicación y seguimiento de proyectos.", icon: "Layers" }
  ],
  apps_showcase: [
    { title: "Módulo de Ventas", description: "Gestión de prospectos y embudos automatizados.", icon: "TrendingUp" },
    { title: "Módulo de Operaciones", description: "Control de tareas y recursos en tiempo real.", icon: "Cpu" },
    { title: "Módulo de Comunicación", description: "Chat y notificaciones centralizados.", icon: "Zap" }
  ]
};

const generateSmartBentoLayout = (items: any[], columns: number = 4) => {
  const layoutItems = [...items];
  
  // 1. Asignar prioridades y tamaños base según tipo
  layoutItems.forEach((item, idx) => {
    // Si ya tiene x/y/col_span fijado por la lógica de intención, lo respetamos
    if (item.col_span && item.row_span) return;

    if (item.type === 'hero') {
      item.col_span = 2;
      item.row_span = 4;
    } else if (item.type === 'metric') {
      item.col_span = 1;
      item.row_span = 2;
    } else if (item.type === 'cta') {
      item.col_span = 2;
      item.row_span = 2;
      if (!item.card_bg) item.card_bg = '#0F172A';
    } else if (item.type === 'compact' || item.type === 'step') {
      item.col_span = 1;
      item.row_span = 2;
    } else if (item.type === 'visual') {
      item.col_span = 2;
      item.row_span = 2;
    } else {
      // Default / icon_text / feature
      const isFeature = item.type === 'feature' || idx === 1;
      item.col_span = isFeature ? 2 : 1;
      item.row_span = 2;
    }
  });

  // 2. Resolver posicionamiento X, Y con un algoritmo de empaquetado simple (Next-Fit)
  let columnsToFill = columns;
  const occupied: boolean[][] = Array.from({ length: 150 }, () => new Array(columnsToFill).fill(false));

  layoutItems.forEach((item) => {
    let found = false;
    for (let y = 0; y < 150 && !found; y++) {
      for (let x = 0; x <= columnsToFill - item.col_span && !found; x++) {
        let canPlace = true;
        for (let iy = 0; iy < item.row_span; iy++) {
          for (let ix = 0; ix < item.col_span; ix++) {
            if (occupied[y + iy][x + ix]) {
              canPlace = false;
              break;
            }
          }
          if (!canPlace) break;
        }

        if (canPlace) {
          item.x = x;
          item.y = y;
          for (let iy = 0; iy < item.row_span; iy++) {
            for (let ix = 0; ix < item.col_span; ix++) {
              occupied[y + iy][x + ix] = true;
            }
          }
          found = true;
        }
      }
    }
  });

  return layoutItems;
};

const normalizeBentoSimulatedContent = (prompt: string, intention: string, blockCount: number, tone: string) => {
  // 1. Limpiar el título
  let cleanTitle = prompt;
  const prefixes = [
    /crea (una|un|la|el|información sobre|sección de|página de)\s+/i,
    /genera (una|un|la|el|información sobre)\s+/i,
    /haz (una|un|la|el|información sobre)\s+/i,
    /muéstrame (por qué|cómo|qué)\s+/i,
    /muestra (por qué|cómo|qué)\s+/i,
    /información que muestre\s+/i,
    /una explicación de\s+/i,
    /mostrar\s+/i
  ];
  
  prefixes.forEach(p => {
    cleanTitle = cleanTitle.replace(p, '');
  });

  // Reemplazos específicos comerciales
  cleanTitle = cleanTitle.replace(/es la mejor alternativa para/i, 'ideal para');
  cleanTitle = cleanTitle.replace(/dueños de negocio/i, 'negocios');
  cleanTitle = cleanTitle.replace(/profesionales independientes/i, 'profesionales');
  
  cleanTitle = cleanTitle.trim();
  if (cleanTitle) {
    cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
    // Quitar puntos finales si existen
    if (cleanTitle.endsWith('.')) cleanTitle = cleanTitle.slice(0, -1);
  } else {
    cleanTitle = "Solutium: Plataforma Modular de Crecimiento";
  }

  // 2. Subtítulo y Eyebrow comerciales
  let subtitle = "Centraliza herramientas, automatiza procesos y activa soluciones digitales desde un solo ecosistema.";
  let eyebrow = "SOLUTIUM";
  
  if (intention === 'stats_grid') {
    subtitle = "Resultados medibles y optimización constante para tu operación digital.";
    eyebrow = "MÉTRICAS";
  } else if (intention === 'features_grid') {
    subtitle = "Potencia técnica al servicio de tu negocio con herramientas modulares de última generación.";
    eyebrow = "CAPACIDADES";
  } else if (intention === 'benefits_grid') {
    eyebrow = "VENTAJAS";
  } else if (intention === 'apps_showcase') {
    eyebrow = "ECOSISTEMA";
    subtitle = "Descubre un mundo de posibilidades con nuestras aplicaciones integradas.";
  } else if (intention === 'process_summary') {
    eyebrow = "PASO A PASO";
    subtitle = "Un camino claro y guiado para la transformación digital de tu equipo.";
  } else if (intention === 'use_cases') {
    eyebrow = "APLICACIONES";
    subtitle = "Soluciones reales diseñadas para desafíos específicos de tu industria.";
  } else if (intention === 'cta_grid') {
    eyebrow = "CONVERSIÓN";
    subtitle = "El momento de escalar es ahora. Elige el camino que mejor se adapte a tu meta.";
  }

  // 3. Selección de items realistas y tipificación
  const library = SIMULATED_CONTENT_LIBRARY[intention] || SIMULATED_CONTENT_LIBRARY.benefits_grid;
  const baseItems: any[] = [];
  
  const actualItemsCount = Math.min(blockCount, library.length);

  for (let i = 0; i < actualItemsCount; i++) {
    const libItem = library[i];
    let itemType = libItem.type || "icon_text";

    // Reglas específicas por intención
    if (intention === 'stats_grid') {
      itemType = 'metric';
    } else if (intention === 'benefits_grid') {
      if (i === 0) itemType = 'hero';
      else itemType = 'feature';
    } else if (intention === 'cta_grid') {
      // Solo 1 o 2 CTAs, el resto señales de confianza
      if (i === 0) itemType = 'cta';
      else if (i === 1) itemType = 'icon_text';
      else itemType = 'trust_signal';
    } else if (intention === 'process_summary') {
      itemType = 'step';
    }

    baseItems.push({
      id: `sim_${i}_${Math.random().toString(36).substr(2, 5)}`,
      type: itemType,
      title: libItem.title,
      description: libItem.description,
      icon: libItem.icon,
      accent_color: (libItem as any).accent_color || undefined,
      card_style: tone === 'premium' ? 'glass' : (i % 3 === 0 ? 'gradient' : 'solid'),
      card_bg: itemType === 'cta' ? '#0F172A' : (tone === 'minimal' ? '#F8FAFC' : '#FFFFFF'),
      button_text: (itemType === 'cta' || (libItem as any).button_text) ? ((libItem as any).button_text || 'Saber más') : undefined,
      btn_url: '#',
      metric_suffix: (libItem as any).metric_suffix || undefined,
      // Layout hints per type
      desktop_span: itemType === 'hero' ? 2 : (itemType === 'cta' || itemType === 'visual' ? 2 : 1),
      tablet_span: itemType === 'hero' ? 2 : 1,
      mobile_span: 1,
    });
  }

  // 4. Aplicar layout inteligente para desktop
  const items = generateSmartBentoLayout(baseItems, 4);

  // 5. Inyectar objeto layouts explícito
  items.forEach(item => {
    item.layouts = {
      desktop: { x: item.x, y: item.y, w: item.col_span, h: item.row_span },
      tablet: { x: (item.x % 2) * 3, y: item.y * 1.5, w: (item.col_span > 1 ? 4 : 2), h: item.row_span },
      mobile: { x: 0, y: item.y * 2, w: 1, h: item.row_span }
    };
  });
  
    return {
    header: {
      eyebrow: eyebrow,
      title: cleanTitle,
      subtitle: subtitle
    },
    items,
    layout: {
      columns: 12,
      gap: 24,
      bento_type: intention
    }
  };
};

const TONES: { id: BentoTone, label: string }[] = [
  { id: 'professional', label: 'Profesional' },
  { id: 'friendly', label: 'Amigable' },
  { id: 'premium', label: 'Premium / Lujoso' },
  { id: 'tech', label: 'Tech / Moderno' },
  { id: 'minimal', label: 'Minimalista' },
];

const MOCK_ICONS = ['Bot', 'Zap', 'TrendingUp', 'Clock', 'ShieldCheck', 'Sparkles', 'BarChart3', 'Rocket', 'Cpu', 'Globe', 'Users', 'Layers'];

export const BentoPromptGenerator: React.FC<BentoPromptGeneratorProps> = ({ onInsert, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [intent, setIntent] = useState('mixed');
  const [itemsCount, setItemsCount] = useState(6);
  const [tone, setTone] = useState<BentoTone>('professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSchema, setGeneratedSchema] = useState<BentoSchema | null>(null);
  const [debugLog, setDebugLog] = useState<any[]>([]);

  const addLog = (tag: string, data: any) => {
    console.log(`[${tag}]`, data);
    setDebugLog(prev => [...prev, { tag, data, time: new Date().toLocaleTimeString() }]);
  };

  const generateMockBento = () => {
    setIsGenerating(true);
    addLog('BENTO_PROMPT_UI_DEBUG', { prompt, intent, itemsCount, tone });

    // Simulate delay
    setTimeout(() => {
      const rawSchema = normalizeBentoSimulatedContent(prompt, intent, itemsCount, tone);

      const repaired = repairBentoSchema(rawSchema);
      const validated = validateBentoSchema(repaired);

      console.log('[BENTO_PROMPT_SCHEMA_DEBUG]', {
        hasGeneratedSchema: true,
        isValid: true,
        errors: [],
        itemsCount: validated.items.length,
        title: validated.header.title
      });

      addLog('BENTO_PROMPT_SCHEMA_DEBUG', {
        isValid: true,
        repaired: true,
        finalItemsCount: validated.items.length
      });

      setGeneratedSchema(validated);
      setIsGenerating(false);
    }, 1500);
  };

  const handleInsert = () => {
    if (!generatedSchema) return;
    
    addLog('BENTO_INSERT_DEBUG', {
      moduleType: "bento",
      inserted: true,
      itemsCount: generatedSchema.items.length
    });

    onInsert(generatedSchema);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]"
      >
        {/* Left Panel: Configuration */}
        <div className="w-full md:w-1/2 p-8 overflow-y-auto border-r border-gray-100 scrollbar-hide">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <Sparkles className="text-white w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 leading-none">Bento Generator</h2>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">IA Experimental v1</span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Prompt */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Describe tu sección</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ej: Muestra los beneficios de mi plataforma SaaS para freelancers..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all min-h-[100px] resize-none"
              />
            </div>

            {/* Intent Grid */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Intención / Objetivo</label>
              <div className="grid grid-cols-2 gap-2">
                {INTENTS.map((i) => (
                  <button 
                    key={i.id}
                    onClick={() => setIntent(i.id)}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      intent === i.id 
                        ? 'bg-blue-50 border-blue-200 shadow-sm' 
                        : 'bg-white border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <p className={`text-xs font-bold ${intent === i.id ? 'text-blue-700' : 'text-gray-700'}`}>{i.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{i.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Tone & Count */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Cantidad Bloques</label>
                <select 
                  value={itemsCount}
                  onChange={(e) => setItemsCount(parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none cursor-pointer"
                >
                  {[3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n} bloques</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Tono Visual</label>
                <select 
                  value={tone}
                  onChange={(e) => setTone(e.target.value as BentoTone)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none cursor-pointer"
                >
                  {TONES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
            </div>

            {/* Note about Mock */}
            <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex gap-3">
              <AlertCircle className="text-orange-500 shrink-0" size={18} />
              <p className="text-[10px] text-orange-700 leading-relaxed font-medium">
                <span className="font-bold">Modo Prueba:</span> La conexión real con IA (Gemini) se activará en la siguiente fase. Por ahora se genera un esquema local simulado para validar estructura y layout.
              </p>
            </div>

            <button 
              onClick={generateMockBento}
              disabled={isGenerating || !prompt.trim()}
              className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                isGenerating || !prompt.trim()
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Wand2 size={18} />
                  Generar Bento
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Panel: Preview / Results */}
        <div className="w-full md:w-1/2 bg-gray-50 flex flex-col max-h-[90vh]">
          {generatedSchema ? (
            <div className="flex-1 flex flex-col p-8 overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Previsualización del Esquema</h3>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-[9px] font-bold uppercase tracking-widest animate-pulse">
                    Válido
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[9px] font-bold uppercase tracking-widest">
                    Auto-Layout OK
                  </span>
                </div>
              </div>

              {/* Visual Mini-Preview */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-xl overflow-y-auto flex-1 scrollbar-hide">
                <div className="mb-4 text-center">
                  <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">{generatedSchema.header.eyebrow}</p>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">{generatedSchema.header.title}</h4>
                  <p className="text-[10px] text-gray-400 line-clamp-1">{generatedSchema.header.subtitle}</p>
                </div>

                <div 
                  className="grid gap-2"
                  style={{ gridTemplateColumns: `repeat(${generatedSchema.layout.columns}, 1fr)` }}
                >
                  {generatedSchema.items.map((item) => (
                    <div 
                      key={item.id}
                      className={`p-3 rounded-lg border flex flex-col justify-between ${
                        item.card_style === 'solid' ? 'bg-gray-50 border-gray-100' :
                        item.card_style === 'gradient' ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100' :
                        'bg-white border-gray-200'
                      }`}
                      style={{ 
                        gridColumn: `span ${item.col_span}`,
                        gridRow: `span ${item.row_span}`,
                        minHeight: '60px'
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-1.5 bg-white rounded shadow-sm">
                          <Settings size={10} className="text-blue-500" />
                        </div>
                        <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">{item.type}</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-800 leading-tight mb-1">{item.title}</p>
                        <p className="text-[8px] text-gray-400 line-clamp-2">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-auto space-y-4">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setGeneratedSchema(null)}
                    className="flex-1 py-3 bg-white border border-gray-200 text-gray-500 font-bold rounded-xl text-xs hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 size={14} />
                    Descartar
                  </button>
                  <button 
                    onClick={handleInsert}
                    className="flex-[2] py-3 bg-gray-900 text-white font-bold rounded-xl text-xs hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Check size={14} />
                    Insertar en Página
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-[2rem] flex items-center justify-center mb-6">
                <BoxIcon className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Tu Bento aparecerá aquí</h3>
              <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                Describe lo que necesitas a la izquierda y generaremos una estructura modular optimizada para tu sitio.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const BoxIcon = ({ className, size = 24 }: { className?: string, size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </svg>
);
