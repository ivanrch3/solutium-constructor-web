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
      const mockItems: any[] = [];
      
      for (let i = 0; i < itemsCount; i++) {
        const typeRand = Math.random();
        let type: BentoItemType = "icon_text";
        if (typeRand > 0.8) type = "cta";
        else if (typeRand > 0.6) type = "stat";
        else if (typeRand > 0.4) type = "image";

        const styleRand = Math.random();
        let card_style: BentoCardStyle = "solid";
        if (styleRand > 0.8) card_style = "glow";
        else if (styleRand > 0.6) card_style = "glass";
        else if (styleRand > 0.4) card_style = "gradient";

        mockItems.push({
          type,
          title: `Item ${i + 1} de ${intent}`,
          description: `Descripción simulada para el prompt: "${prompt.substring(0, 30)}..."`,
          icon: MOCK_ICONS[Math.floor(Math.random() * MOCK_ICONS.length)],
          card_style,
          col_span: Math.random() > 0.7 ? 2 : 1,
          row_span: Math.random() > 0.8 ? 2 : 1,
          button_text: type === 'cta' ? 'Empezar ahora' : undefined,
          btn_url: type === 'cta' ? '#contacto' : undefined,
          value: type === 'stat' ? `${Math.floor(Math.random() * 100)}%` : undefined
        });
      }

      const rawSchema = {
        header: {
          eyebrow: tone.toUpperCase(),
          title: prompt || "Solución Personalizada",
          subtitle: `Inspirado en tu intención de ${intent}.`
        },
        items: mockItems,
        layout: {
          columns: 4,
          gap: 24
        }
      };

      const repaired = repairBentoSchema(rawSchema);
      const validated = validateBentoSchema(repaired);

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
                  {generatedSchema.items.map((item, idx) => (
                    <div 
                      key={idx}
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
