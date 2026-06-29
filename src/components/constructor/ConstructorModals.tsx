import React from 'react';
import {
  Plus,
  Layers,
  Eye,
  HelpCircle,
  Save,
  Trash2,
  Send,
  Sparkles,
  Check,
  ArrowLeft,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AICreditBalanceSummary, AIPageGenerationBrief, AIPagePlan, AIPageTone, AIPageType, ReferenceDebugInfo, ReferenceUrlAnalysis } from '../../types/ai';
import {
  AI_PAGE_CREATION_DEFAULT_MODE,
  AI_PAGE_CREATION_HAS_MODE_SELECTOR,
  AI_PAGE_CREATION_VISIBLE_MODES,
  AI_REFERENCE_PAGE_GENERATION_ENABLED,
  type AIPageCreationMode
} from '../../constants/aiPageGeneration';
import { AI_BUSINESS_TYPE_OPTIONS, getAIBusinessTypeOption } from '../../constants/aiPageBlueprints';

// MobileBottomNav Component
export const MobileBottomNav = ({
  activeTab,
  onTabChange
}: {
  activeTab: 'constructor' | 'structure' | 'preview',
  onTabChange: (tab: 'constructor' | 'structure' | 'preview') => void
}) => (
  <div className="fixed bottom-0 left-0 right-0 h-[80px] bg-surface border-t border-border/60 flex items-center justify-around px-4 z-[60] pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
    <button
      onClick={() => onTabChange('constructor')}
      className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'constructor' ? 'text-primary' : 'text-text/40'}`}
    >
      <div className={`p-2 rounded-xl transition-all ${activeTab === 'constructor' ? 'bg-primary/10' : ''}`}>
        <Plus size={24} />
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider">Constructor</span>
    </button>
    <button
      onClick={() => onTabChange('structure')}
      className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'structure' ? 'text-primary' : 'text-text/40'}`}
    >
      <div className={`p-2 rounded-xl transition-all ${activeTab === 'structure' ? 'bg-primary/10' : ''}`}>
        <Layers size={24} />
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider">Estructura</span>
    </button>
    <button
      onClick={() => onTabChange('preview')}
      className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'preview' ? 'text-primary' : 'text-text/40'}`}
    >
      <div className={`p-2 rounded-xl transition-all ${activeTab === 'preview' ? 'bg-primary/10' : ''}`}>
        <Eye size={24} />
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider">Preview</span>
    </button>
  </div>
);

// UnsavedChangesModal Component
export const UnsavedChangesModal = ({
  onCancel,
  onSaveAndExit,
  onExitWithoutSaving
}: {
  onCancel: () => void,
  onSaveAndExit: () => void,
  onExitWithoutSaving: () => void
}) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[2000] p-6">
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="bg-surface rounded-3xl p-8 max-w-md w-full shadow-2xl border border-border"
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6">
          <HelpCircle className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold text-text mb-3">&iquest;Salir sin guardar?</h2>
        <p className="text-text/60 mb-8 leading-relaxed">
          Tiene cambios pendientes. Puede guardarlos antes de salir o salir sin conservarlos definitivamente.
        </p>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onSaveAndExit}
            className="w-full py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <Save size={18} />
            Guardar
          </button>
          <button
            onClick={onExitWithoutSaving}
            className="w-full py-3.5 bg-amber-500/10 text-amber-700 font-bold rounded-xl hover:bg-amber-500/15 transition-all flex items-center justify-center gap-2"
          >
            <Trash2 size={18} />
            Salir sin guardar
          </button>
          <button
            onClick={onCancel}
            className="w-full py-3.5 text-text/40 font-bold hover:text-text/60 transition-all"
          >
            Cancelar
          </button>
        </div>
      </div>
    </motion.div>
  </div>
);

// DeleteConfirmationModal Component
export const DeleteConfirmationModal: React.FC<{
  moduleName: string,
  onConfirm: () => void,
  onCancel: () => void
}> = ({ moduleName, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
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

// PublishModal Component
export const PublishModal: React.FC<{
  siteName: string,
  setSiteName: (name: string) => void,
  onPublish: () => void,
  onCancel: () => void,
  isSaving: boolean,
  publishStatus?: 'idle' | 'loading' | 'success' | 'error',
  publishedUrl?: string | null,
  publishedAt?: string | null
}> = ({ siteName, setSiteName, onPublish, onCancel, isSaving, publishStatus = 'idle', publishedUrl, publishedAt }) => (
  <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => {
        if (!isSaving) onCancel();
      }}
      className="absolute inset-0 bg-text/40 backdrop-blur-sm"
    />
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="relative w-full max-w-md bg-surface rounded-3xl p-8 shadow-2xl border border-border"
    >
      {publishStatus === 'success' ? (
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-text">Sitio publicado</h3>
          <p className="mb-5 text-sm leading-relaxed text-text/60">
            La página quedó publicada correctamente y el estado local del Constructor ya fue actualizado.
          </p>
          {publishedUrl && (
            <a
              href={publishedUrl}
              target="_blank"
              rel="noreferrer"
              className="mb-4 block truncate rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-xs font-semibold text-green-700 hover:bg-green-100"
            >
              {publishedUrl}
            </a>
          )}
          {publishedAt && (
            <p className="mb-6 text-[10px] font-bold uppercase tracking-wider text-text/40">
              Publicado {new Date(publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
          <button
            onClick={onCancel}
            className="w-full rounded-2xl bg-green-600 px-6 py-3 font-bold text-white shadow-lg shadow-green-600/20 transition-all hover:bg-green-700"
          >
            Listo
          </button>
        </div>
      ) : (
        <>
      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
        <Send className="text-primary w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-text mb-2">Publicar</h3>
      <p className="text-sm text-text/60 mb-6 leading-relaxed">
        Asigna un nombre a tu página para identificarla en tu panel de Solutium.
      </p>

      <div className="space-y-4 mb-8">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text/40 uppercase tracking-wider">Nombre de la página</label>
          <input
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="Ej: Página de inicio, Landing de ventas..."
            className="w-full px-4 py-3 bg-secondary border border-border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            autoFocus
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="flex-1 px-6 py-3 bg-secondary hover:bg-secondary/80 text-text font-bold rounded-2xl transition-all disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={onPublish}
          disabled={!siteName || isSaving}
          className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Publicando...' : 'Publicar'}
        </button>
      </div>
        </>
      )}
    </motion.div>
  </div>
);

const PAGE_TYPE_OPTIONS: Array<{ value: AIPageType; label: string }> = [
  { value: 'landing', label: 'Landing page' },
  { value: 'home', label: 'Página de inicio' },
  { value: 'services', label: 'Página de servicios' },
  { value: 'product', label: 'Página de producto' },
  { value: 'contact', label: 'Página de contacto' },
  { value: 'promo', label: 'Página promocional' }
];

const GOAL_OPTIONS = [
  'conseguir clientes potenciales',
  'recibir mensajes por WhatsApp',
  'vender un producto',
  'presentar servicios',
  'agendar citas',
  'mostrar portafolio'
];

const TONE_OPTIONS: AIPageTone[] = ['profesional', 'cercano', 'moderno', 'premium', 'juvenil', 'institucional'];
const REFERENCE_ANALYSIS_CREDITS = 10;
const REFERENCE_PAGE_PLAN_CREDITS = 20;

const getAIPlanModeLabel = (plan: AIPagePlan) => {
  if (plan.generationMode === 'fallback' || plan.source === 'fallback') return 'Fallback seguro';
  if (plan.generationMode === 'reference_url_broker') return 'URL Broker';
  if (plan.generationMode === 'broker' || plan.source === 'ai_broker') return 'AI Broker';
  return 'Mock local';
};

const getAIUsageStatusLabel = (status?: string) => {
  if (status === 'charged') return 'Cobrado';
  if (status === 'reused') return 'Reutilizado';
  if (status === 'failed') return 'Cobro pendiente';
  if (status === 'skipped') return 'Sin cobro';
  if (status === 'not_required') return 'No requerido';
  return 'Sin estado';
};

const isAIPagePlanBrokerConfigured = () =>
  import.meta.env.VITE_ENABLE_AI_PAGE_PLAN_BROKER === 'true' &&
  Boolean(import.meta.env.VITE_AI_PAGE_PLAN_BROKER_URL);

const StickyActionFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`absolute bottom-0 left-0 right-0 z-30 border-t border-border bg-white px-6 py-4 shadow-[0_-16px_36px_rgba(15,23,42,0.12)] ${className}`}>
    {children}
  </div>
);

const ReferenceWorkingState: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
    <div className="flex items-start gap-3">
      <div className="mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      <div>
        <p className="text-sm font-black text-primary">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-text/60">{description}</p>
      </div>
    </div>
  </div>
);

type AIProcessStep = {
  id: string;
  label: string;
};

const REFERENCE_ANALYSIS_STEPS: AIProcessStep[] = [
  { id: 'validate_url', label: 'Validando URL' },
  { id: 'render_reference', label: 'Renderizando referencia' },
  { id: 'capture_view', label: 'Capturando vista completa' },
  { id: 'detect_sections', label: 'Detectando secciones visuales' },
  { id: 'read_columns', label: 'Leyendo columnas y elementos' },
  { id: 'prepare_structure', label: 'Preparando estructura editable' }
];

const REFERENCE_CREATION_STEPS: AIProcessStep[] = [
  { id: 'transform_structure', label: 'Transformando estructura visual' },
  { id: 'adapt_content', label: 'Adaptando contenido al tipo de negocio' },
  { id: 'search_visuals', label: 'Buscando recursos visuales' },
  { id: 'build_sections', label: 'Construyendo secciones editables' },
  { id: 'insert_editor', label: 'Insertando página en el editor' }
];

const REFERENCE_RETRY_STEPS: AIProcessStep[] = [
  { id: 'retry_start', label: 'Intentando de nuevo' },
  { id: 'review_reference', label: 'Revisando la referencia' },
  { id: 'connect_broker', label: 'Reconectando con el broker' },
  { id: 'safe_response', label: 'Preparando una respuesta segura' }
];

const getSectionPatternLabel = (value?: string | null) => {
  const normalized = String(value || '').replace(/_/g, ' ').trim();
  if (!normalized) return 'Estructura visual adaptable';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const getSectionIntentLabel = (role?: string | null) => {
  const labels: Record<string, string> = {
    hero: 'Presentación principal',
    product_showcase: 'Demostración visual de producto',
    features: 'Beneficios o capacidades',
    services: 'Oferta o soluciones',
    process: 'Proceso o pasos',
    trust: 'Confianza y prueba social',
    testimonials: 'Prueba social',
    faq: 'Ayuda o preguntas frecuentes',
    contact: 'Contacto o conversión',
    cta: 'Llamado a la acción',
    pricing: 'Comparación de opciones',
    comparison: 'Comparativa',
    gallery: 'Galería visual',
    about: 'Contexto de marca'
  };
  return labels[String(role || '').toLowerCase()] || 'Bloque estructural detectado';
};

const AIProcessOverlay: React.FC<{ title: string; steps: AIProcessStep[] }> = ({ title, steps }) => {
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    setActiveIndex(0);
    const interval = window.setInterval(() => {
      setActiveIndex(prev => Math.min(prev + 1, Math.max(steps.length - 1, 0)));
    }, 1200);
    return () => window.clearInterval(interval);
  }, [steps]);

  const visibleSteps = steps.slice(0, Math.min(activeIndex + 2, steps.length));

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/35 px-6">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-surface p-7 shadow-2xl">
        <div className="mx-auto mb-5 h-14 w-14 rounded-full border-4 border-primary/15 border-r-primary border-t-primary animate-spin shadow-lg shadow-primary/10" />
        <p className="text-center text-sm font-black uppercase tracking-widest text-primary">{title}</p>
        <div className="mt-5 space-y-3">
          {visibleSteps.map((step, index) => {
            const isCompleted = index < activeIndex;
            const isActive = index === activeIndex;
            return (
              <div key={step.id} className={`flex items-center gap-3 text-sm transition-all ${isCompleted ? 'text-text/55' : isActive ? 'font-black text-text' : 'text-text/35'}`}>
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${isCompleted ? 'border-primary bg-primary text-white' : isActive ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border text-text/30'}`}>
                  {isCompleted ? (
                    <Check size={12} strokeWidth={3} />
                  ) : isActive ? (
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  )}
                </span>
                <span>{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ReferenceDebugPanel: React.FC<{ debug?: ReferenceDebugInfo | null; warnings?: string[] }> = ({ debug, warnings = [] }) => {
  if (!debug) return null;
  const debugWarnings = Array.from(new Set([...(debug.warnings || []), ...warnings].filter(Boolean)));

  return (
    <details className="rounded-2xl border border-blue-200 bg-blue-50/80 p-4 text-xs text-blue-950" open>
      <summary className="cursor-pointer text-[11px] font-black uppercase tracking-widest text-blue-700">
        Diagnóstico técnico
      </summary>
      <div className="mt-3 space-y-3">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <div className="rounded-xl bg-white p-3">
            <p className="font-black text-blue-700">visualScanUsed</p>
            <p>{String(debug.visualScanUsed)}</p>
          </div>
          <div className="rounded-xl bg-white p-3">
            <p className="font-black text-blue-700">fallbackDomUsed</p>
            <p>{String(debug.fallbackDomUsed)}</p>
          </div>
          <div className="rounded-xl bg-white p-3">
            <p className="font-black text-blue-700">fallbackReason</p>
            <p className="break-words">{debug.fallbackReason || 'Sin registro'}</p>
          </div>
          <div className="rounded-xl bg-white p-3">
            <p className="font-black text-blue-700">secciones</p>
            <p>{debug.sections?.length || 0}</p>
          </div>
        </div>

        {debug.screenshot && (
          <div className="rounded-xl bg-white p-3">
            <p className="font-black text-blue-700">Screenshot</p>
            <p>
              {debug.screenshot.width || 'sin dato'}x{debug.screenshot.height || 'sin dato'} · captured{' '}
              {debug.screenshot.capturedHeight || 'sin dato'} · stored {String(Boolean(debug.screenshot.stored))}
            </p>
          </div>
        )}

        {debug.sections && debug.sections.length > 0 && (
          <div className="overflow-x-auto rounded-xl bg-white p-3">
            <p className="mb-2 font-black text-blue-700">Secciones visual scan</p>
            <table className="min-w-full text-left text-[11px]">
              <thead className="text-blue-700">
                <tr>
                  <th className="pr-3">Sección</th>
                  <th className="pr-3">layout</th>
                  <th className="pr-3">roleHint</th>
                  <th className="pr-3">media</th>
                  <th className="pr-3">confidence</th>
                  <th className="pr-3">queryHint</th>
                </tr>
              </thead>
              <tbody>
                {debug.sections.slice(0, 10).map(section => (
                  <tr key={`${section.index}-${section.layout}`}>
                    <td className="pr-3 font-bold">{section.index}</td>
                    <td className="pr-3">{section.layout}</td>
                    <td className="pr-3">{section.roleHint}</td>
                    <td className="pr-3">{String(section.media)}</td>
                    <td className="pr-3">{typeof section.confidence === 'number' ? `${Math.round(section.confidence * 100)}%` : 'sin dato'}</td>
                    <td className="pr-3">{section.queryHint || 'sin dato'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {debug.generation && (
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {Object.entries(debug.generation).map(([key, value]) => (
              <div key={key} className="rounded-xl bg-white p-3">
                <p className="font-black text-blue-700">{key}</p>
                <p>{String(value)}</p>
              </div>
            ))}
          </div>
        )}

        {debug.pexels && debug.pexels.length > 0 && (
          <div className="overflow-x-auto rounded-xl bg-white p-3">
            <p className="mb-2 font-black text-blue-700">Pexels / placeholders</p>
            <table className="min-w-full text-left text-[11px]">
              <thead className="text-blue-700">
                <tr>
                  <th className="pr-3">Sección</th>
                  <th className="pr-3">source</th>
                  <th className="pr-3">found</th>
                  <th className="pr-3">query</th>
                  <th className="pr-3">candidate</th>
                  <th className="pr-3">usedUrls</th>
                  <th className="pr-3">photographer</th>
                </tr>
              </thead>
              <tbody>
                {debug.pexels.map(row => (
                  <tr key={`${row.section}-${row.query || row.source}`}>
                    <td className="pr-3 font-bold">{row.section}</td>
                    <td className="pr-3">{row.source}</td>
                    <td className="pr-3">{String(row.found)}</td>
                    <td className="pr-3">{row.queryUsed || row.query || 'sin dato'}</td>
                    <td className="pr-3">{typeof row.candidateIndex === 'number' ? row.candidateIndex + 1 : 'sin dato'}</td>
                    <td className="pr-3">{row.usedImageUrlsCount || 'sin dato'}</td>
                    <td className="pr-3">{row.photographer || 'sin dato'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {debugWarnings.length > 0 && (
          <div className="rounded-xl bg-white p-3">
            <p className="font-black text-blue-700">Warnings</p>
            <ul className="mt-1 list-disc pl-4">
              {debugWarnings.slice(0, 12).map((warning, index) => (
                <li key={`${warning}-${index}`} className="break-words">{warning}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </details>
  );
};

export const AIPagePlanModal: React.FC<{
  plan: AIPagePlan | null,
  isGenerating: boolean,
  aiCreditBalance?: AICreditBalanceSummary | null,
  isLoadingAICreditBalance?: boolean,
  aiCreditBalanceError?: string | null,
  projectName?: string,
  onGenerate: (brief: AIPageGenerationBrief) => void,
  onAnalyzeReferenceUrl: (request: {
    referenceUrl: string;
    businessType?: string;
    pageGoal?: string;
    tone?: string;
    cta?: string;
  }) => Promise<ReferenceUrlAnalysis>,
  onGenerateFromReferenceAnalysis: (request: {
    referenceUrl: string;
    analysis: ReferenceUrlAnalysis;
    businessType?: string;
    pageGoal?: string;
    tone?: string;
    cta?: string;
    instructions?: string;
  }) => Promise<void>,
  onRetryAICreditBalance: () => void,
  onApply: () => void,
  onCancel: () => void
}> = ({ plan, isGenerating, aiCreditBalance, isLoadingAICreditBalance = false, aiCreditBalanceError = null, projectName, onGenerate, onAnalyzeReferenceUrl, onGenerateFromReferenceAnalysis, onRetryAICreditBalance, onApply, onCancel }) => {
  const [creationMode, setCreationMode] = React.useState<AIPageCreationMode>(AI_PAGE_CREATION_DEFAULT_MODE);
  const defaultBusinessType = AI_BUSINESS_TYPE_OPTIONS[0];
  const [customBusinessType, setCustomBusinessType] = React.useState('');
  const [referenceUrl, setReferenceUrl] = React.useState('');
  const [referenceBusinessType, setReferenceBusinessType] = React.useState('');
  const [referenceGoal, setReferenceGoal] = React.useState(GOAL_OPTIONS[0]);
  const [referenceTone, setReferenceTone] = React.useState<AIPageTone>('profesional');
  const [referenceCta, setReferenceCta] = React.useState('');
  const [referenceAnalysis, setReferenceAnalysis] = React.useState<ReferenceUrlAnalysis | null>(null);
  const [referenceInstructions, setReferenceInstructions] = React.useState('');
  const [referenceError, setReferenceError] = React.useState<string | null>(null);
  const [referenceErrorStage, setReferenceErrorStage] = React.useState<'analysis' | 'generation' | null>(null);
  const [referenceProcessMode, setReferenceProcessMode] = React.useState<'analysis' | 'generation' | 'retry_analysis' | 'retry_generation' | null>(null);
  const [isAnalyzingReference, setIsAnalyzingReference] = React.useState(false);
  const [isGeneratingReferencePlan, setIsGeneratingReferencePlan] = React.useState(false);
  const [brief, setBrief] = React.useState<AIPageGenerationBrief>({
    pageType: 'landing',
    businessTypeId: defaultBusinessType.id,
    businessTypeLabel: defaultBusinessType.label,
    businessType: defaultBusinessType.label,
    pageGoal: GOAL_OPTIONS[0],
    instructions: '',
    tone: 'profesional',
    primaryCta: '',
    businessName: projectName || ''
  });

  const updateBrief = (patch: Partial<AIPageGenerationBrief>) => {
    setBrief(prev => ({ ...prev, ...patch }));
  };

  const resolvedBusinessType = brief.businessTypeId === 'other'
    ? customBusinessType.trim()
    : brief.businessType.trim();
  const estimatedCredits = plan?.estimatedCredits ?? 15;
  const hasEnoughCredits = typeof aiCreditBalance?.totalAvailable === 'number'
    ? aiCreditBalance.totalAvailable >= estimatedCredits
    : false;
  const hasBlockingCreditError = Boolean(aiCreditBalanceError);
  const canGenerate = resolvedBusinessType.length > 1
    && brief.instructions.trim().length > 8
    && brief.primaryCta.trim().length > 1
    && !isLoadingAICreditBalance
    && !hasBlockingCreditError
    && hasEnoughCredits;
  const isReferenceBusinessTypeValid = referenceBusinessType.trim().length > 1;
  const canAnalyzeReference = referenceUrl.trim().length > 8 && isReferenceBusinessTypeValid && !isAnalyzingReference && !isGeneratingReferencePlan;
  const canGenerateReferencePlan = Boolean(referenceAnalysis) && isReferenceBusinessTypeValid && !isGeneratingReferencePlan;
  const activeReferenceProcess = isAnalyzingReference || isGeneratingReferencePlan;
  const showReferenceDebug = import.meta.env.DEV || import.meta.env.VITE_SHOW_AI_REFERENCE_DEBUG === 'true';
  const activeReferenceDebug = creationMode === 'reference_url'
    ? (plan?.referenceDebug || referenceAnalysis?.referenceDebug)
    : null;
  const processOverlayCopy = referenceProcessMode === 'retry_analysis' || referenceProcessMode === 'retry_generation'
    ? {
      title: 'INTENTANDO DE NUEVO',
      steps: REFERENCE_RETRY_STEPS
    }
    : isGeneratingReferencePlan
      ? {
        title: 'CREANDO PÁGINA',
        steps: REFERENCE_CREATION_STEPS
      }
      : {
        title: 'ANALIZANDO REFERENCIA',
        steps: REFERENCE_ANALYSIS_STEPS
      };

  React.useEffect(() => {
    if (!AI_PAGE_CREATION_VISIBLE_MODES.includes(creationMode)) {
      setCreationMode(AI_PAGE_CREATION_DEFAULT_MODE);
    }
  }, [creationMode]);

  const handleAnalyzeReference = async (isRetry = false) => {
    if (!canAnalyzeReference) return;
    setIsAnalyzingReference(true);
    setReferenceProcessMode(isRetry ? 'retry_analysis' : 'analysis');
    setReferenceError(null);
    setReferenceErrorStage(null);
    try {
      const analysis = await onAnalyzeReferenceUrl({
        referenceUrl,
        businessType: referenceBusinessType,
        pageGoal: referenceGoal,
        tone: referenceTone,
        cta: referenceCta
      });
      setReferenceAnalysis(analysis);
    } catch (error: any) {
      setReferenceError(error?.message || 'No se pudo analizar la URL de referencia.');
      setReferenceErrorStage('analysis');
    } finally {
      setIsAnalyzingReference(false);
      setReferenceProcessMode(null);
    }
  };

  const handleGenerateFromReference = async (isRetry = false) => {
    if (!canGenerateReferencePlan) return;
    setIsGeneratingReferencePlan(true);
    setReferenceProcessMode(isRetry ? 'retry_generation' : 'generation');
    setReferenceError(null);
    setReferenceErrorStage(null);
    try {
      await onGenerateFromReferenceAnalysis({
        referenceUrl: referenceAnalysis.referenceUrl || referenceUrl,
        analysis: referenceAnalysis,
        businessType: referenceBusinessType,
        pageGoal: referenceGoal,
        tone: referenceTone,
        cta: referenceCta,
        instructions: referenceInstructions
      });
    } catch (error: any) {
      setReferenceError(error?.message || 'No se pudo generar la página desde esta estructura.');
      setReferenceErrorStage('generation');
    } finally {
      setIsGeneratingReferencePlan(false);
      setReferenceProcessMode(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[2150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        className="relative flex h-[min(92vh,900px)] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-surface shadow-2xl border border-border"
      >
        <div className="shrink-0 flex items-center justify-between border-b border-border/60 px-6 py-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Crear con IA</p>
            <h2 className="text-xl font-black text-text">Generar página editable</h2>
          </div>
          <button
            onClick={onCancel}
            disabled={activeReferenceProcess || isGenerating}
            className="rounded-xl p-2 text-text/40 hover:bg-secondary hover:text-text transition-all disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ArrowLeft size={20} />
          </button>
        </div>

        {AI_PAGE_CREATION_HAS_MODE_SELECTOR && (
          <div className="shrink-0 border-b border-border/60 px-6 py-4">
            <div className="grid grid-cols-1 gap-3 rounded-2xl bg-secondary/50 p-1 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setCreationMode('instructions')}
                className={`rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest transition-all ${creationMode === 'instructions' ? 'bg-surface text-primary shadow-sm' : 'text-text/45 hover:text-text'}`}
              >
                Crear desde formulario
              </button>
              {AI_REFERENCE_PAGE_GENERATION_ENABLED && (
                <button
                  type="button"
                  onClick={() => setCreationMode('reference_url')}
                  className={`rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest transition-all ${creationMode === 'reference_url' ? 'bg-surface text-primary shadow-sm' : 'text-text/45 hover:text-text'}`}
                >
                  Crear desde URL de referencia
                </button>
              )}
            </div>
          </div>
        )}

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[1fr_0.9fr]">
          {creationMode === 'instructions' ? <div className="min-h-0 space-y-5 overflow-y-auto p-6 pb-28">
            <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
              <p className="text-xs font-bold text-primary">
                {isAIPagePlanBrokerConfigured() ? 'AI Broker seguro activo' : 'Generación local segura'}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-text/60">
                {isAIPagePlanBrokerConfigured()
                  ? 'Esta generación usa App Madre para solicitar solo contenido compatible con un blueprint fijo.'
                  : 'Esta fase crea una versión editable basada en blueprints fijos del Constructor. No genera HTML libre ni composición visual.'}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-text/45">Créditos IA disponibles</p>
                  <p className="mt-1 text-lg font-black text-text">
                    {isLoadingAICreditBalance ? 'Cargando...' : (aiCreditBalance ? `${aiCreditBalance.totalAvailable} créditos` : 'Saldo no disponible')}
                  </p>
                </div>
                <div className="rounded-2xl bg-primary/10 px-3 py-2 text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">Costo estimado</p>
                  <p className="text-sm font-black text-primary">{estimatedCredits} créditos</p>
                </div>
              </div>
              {aiCreditBalance && (
                <p className="mt-2 text-[11px] leading-relaxed text-text/45">
                  Mensuales: {aiCreditBalance.monthlyBalance} · Bono: {aiCreditBalance.bonusBalance}
                </p>
              )}
              {aiCreditBalanceError && (
                <div className="mt-3 rounded-xl border border-amber-300/60 bg-amber-50 p-3">
                  <p className="text-[11px] font-bold leading-relaxed text-amber-800">
                    {aiCreditBalanceError}
                  </p>
                  <button
                    type="button"
                    onClick={onRetryAICreditBalance}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-white px-3 py-2 text-[11px] font-black uppercase tracking-widest text-amber-800 transition-all hover:bg-amber-100"
                  >
                    <RotateCcw size={12} />
                    Reintentar
                  </button>
                </div>
              )}
              {!aiCreditBalanceError && aiCreditBalance && !hasEnoughCredits && (
                <p className="mt-3 text-[11px] font-bold leading-relaxed text-amber-700">
                  No tienes créditos suficientes para esta generación.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-text/45">Tipo de página</span>
                <select
                  value={brief.pageType}
                  onChange={(event) => updateBrief({ pageType: event.target.value as AIPageType })}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-primary"
                >
                  {PAGE_TYPE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-text/45">Tipo de negocio</span>
                <select
                  value={brief.businessTypeId || defaultBusinessType.id}
                  onChange={(event) => {
                    const nextOption = getAIBusinessTypeOption(event.target.value);
                    updateBrief({
                      businessTypeId: nextOption.id,
                      businessTypeLabel: nextOption.label,
                      businessType: nextOption.id === 'other' ? customBusinessType.trim() : nextOption.label
                    });
                  }}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-primary"
                >
                  {AI_BUSINESS_TYPE_OPTIONS.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] leading-relaxed text-text/45">
                  {(AI_BUSINESS_TYPE_OPTIONS.find(option => option.id === brief.businessTypeId) || defaultBusinessType).description}
                </p>
                {brief.businessTypeId === 'other' && (
                  <input
                    value={customBusinessType}
                    onChange={(event) => {
                      const value = event.target.value;
                      setCustomBusinessType(value);
                      updateBrief({
                        businessType: value,
                        businessTypeLabel: value || 'Otro'
                      });
                    }}
                    placeholder="Describe tu tipo de negocio"
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-primary"
                  />
                )}
              </label>
            </div>

            <label className="space-y-2 block">
              <span className="text-xs font-black uppercase tracking-widest text-text/45">Objetivo de la página</span>
              <select
                value={brief.pageGoal}
                onChange={(event) => updateBrief({ pageGoal: event.target.value })}
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-primary"
              >
                {GOAL_OPTIONS.map(goal => (
                  <option key={goal} value={goal}>{goal}</option>
                ))}
              </select>
            </label>

            <label className="space-y-2 block">
              <span className="text-xs font-black uppercase tracking-widest text-text/45">Instrucciones del usuario</span>
              <textarea
                value={brief.instructions}
                onChange={(event) => updateBrief({ instructions: event.target.value })}
                placeholder="Describe qué quieres que tenga la página..."
                rows={5}
                className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-primary"
              />
            </label>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-text/45">Tono de comunicación</span>
                <select
                  value={brief.tone}
                  onChange={(event) => updateBrief({ tone: event.target.value as AIPageTone })}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-primary"
                >
                  {TONE_OPTIONS.map(tone => (
                    <option key={tone} value={tone}>{tone}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-text/45">CTA principal</span>
                <input
                  value={brief.primaryCta}
                  onChange={(event) => updateBrief({ primaryCta: event.target.value })}
                placeholder="Solicitar información, Agendar cita..."
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-primary"
                />
              </label>
            </div>

            <StickyActionFooter>
              <button
                onClick={() => onGenerate({
                  ...brief,
                  businessType: resolvedBusinessType,
                  businessTypeLabel: brief.businessTypeId === 'other' ? (customBusinessType.trim() || 'Otro') : brief.businessTypeLabel
                })}
                disabled={!canGenerate || isGenerating}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {isGenerating ? <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Sparkles size={18} />}
                {plan ? 'Regenerar página' : 'Generar página'}
              </button>
            </StickyActionFooter>
          </div> : <div className="min-h-0 space-y-5 overflow-y-auto p-6 pb-28">
            <div className="rounded-2xl border border-amber-300/60 bg-amber-50 p-4">
              <p className="text-xs font-black uppercase tracking-widest text-amber-700">Inspiración estructural segura</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-800">
                La URL se usará como guía estructural. Solutium creará una versión nueva con secciones editables, textos propios y recursos visuales adaptados a tu negocio.
              </p>
              <p className="mt-3 text-[11px] font-black uppercase tracking-widest text-amber-700">
                Analizar referencia: {REFERENCE_ANALYSIS_CREDITS} Créditos IA · Crear página: {REFERENCE_PAGE_PLAN_CREDITS} Créditos IA
              </p>
            </div>

            <label className="space-y-2 block">
              <span className="text-xs font-black uppercase tracking-widest text-text/45">URL de referencia</span>
              <input
                value={referenceUrl}
                onChange={(event) => setReferenceUrl(event.target.value)}
                placeholder="https://example.com"
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-primary"
              />
            </label>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-text/45">Tipo de página</span>
                <input
                  value={referenceBusinessType}
                  onChange={(event) => setReferenceBusinessType(event.target.value)}
                  placeholder="restaurante, clinica dental, software CRM..."
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-primary"
                />
                {!isReferenceBusinessTypeValid && (
                  <p className="text-[11px] font-bold text-amber-700">Indica el tipo de negocio para adaptar los textos e imágenes de la página generada.</p>
                )}
              </label>

              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-text/45">CTA opcional</span>
                <input
                  value={referenceCta}
                  onChange={(event) => setReferenceCta(event.target.value)}
                  placeholder="Solicitar información, Agendar cita..."
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-primary"
                />
              </label>
            </div>

            <label className="space-y-2 block">
              <span className="text-xs font-black uppercase tracking-widest text-text/45">Objetivo opcional</span>
              <select
                value={referenceGoal}
                onChange={(event) => setReferenceGoal(event.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-primary"
              >
                {GOAL_OPTIONS.map(goal => (
                  <option key={goal} value={goal}>{goal}</option>
                ))}
              </select>
            </label>

            <label className="space-y-2 block">
              <span className="text-xs font-black uppercase tracking-widest text-text/45">Tono opcional</span>
              <select
                value={referenceTone}
                onChange={(event) => setReferenceTone(event.target.value as AIPageTone)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-primary"
              >
                {TONE_OPTIONS.map(tone => (
                  <option key={tone} value={tone}>{tone}</option>
                ))}
              </select>
            </label>

            <label className="space-y-2 block">
              <span className="text-xs font-black uppercase tracking-widest text-text/45">Instrucciones adicionales para la página</span>
              <textarea
                value={referenceInstructions}
                onChange={(event) => setReferenceInstructions(event.target.value)}
                placeholder="Ej: usa un tono mas premium, enfocate en agendar llamadas, evita mencionar precios..."
                rows={4}
                className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-primary"
              />
            </label>

            {isAnalyzingReference && (
              <ReferenceWorkingState
                title="Escaneando visualmente la referencia..."
                description="Renderizamos la página para detectar estructura real sin copiar textos, imágenes, logos ni código."
              />
            )}

            <StickyActionFooter>
              <button
                onClick={() => handleAnalyzeReference(false)}
                disabled={!canAnalyzeReference}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {isAnalyzingReference ? <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Sparkles size={18} />}
                {isAnalyzingReference ? 'Analizando referencia...' : `Analizar referencia · ${REFERENCE_ANALYSIS_CREDITS} Créditos IA`}
              </button>
            </StickyActionFooter>
          </div>}

          <div className="min-h-0 overflow-y-auto border-t border-border/60 bg-secondary/35 p-6 pb-28 lg:border-l lg:border-t-0">
            <h3 className="text-sm font-black uppercase tracking-widest text-text/45">
              {creationMode === 'reference_url' ? 'Análisis de referencia' : 'Resumen generado'}
            </h3>
            {creationMode === 'reference_url' ? (
              <div className="mt-5 space-y-4">
                {isAnalyzingReference && (
                  <ReferenceWorkingState
                    title="Detectando secciones visuales..."
                    description="Estamos leyendo columnas, media, botones, fondos y jerarquía visual desde una vista renderizada."
                  />
                )}
                {isGeneratingReferencePlan && (
                  <ReferenceWorkingState
                    title="Generando página editable desde la referencia..."
                    description="Estamos transformando la estructura detectada en secciones editables de Solutium."
                  />
                )}
                {!referenceAnalysis && !referenceError && !isAnalyzingReference && (
                  <div className="rounded-2xl border border-dashed border-border bg-surface/70 p-8 text-center">
                    <Sparkles className="mx-auto mb-4 text-text/25" size={30} />
                    <p className="text-sm font-bold text-text/50">Pega una URL pública para detectar estructura, secciones y presets sugeridos.</p>
                  </div>
                )}
                {referenceError && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                    <p className="text-xs font-black uppercase tracking-widest text-red-700">
                      {referenceErrorStage === 'generation' ? 'No se pudo generar' : 'No se pudo analizar'}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-red-800">{referenceError}</p>
                    <button
                      type="button"
                      onClick={() => referenceErrorStage === 'generation' ? handleGenerateFromReference(true) : handleAnalyzeReference(true)}
                      disabled={referenceErrorStage === 'generation' ? !canGenerateReferencePlan : !canAnalyzeReference}
                      className="mt-3 inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-[11px] font-black uppercase tracking-widest text-red-700 transition-all hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <RotateCcw size={13} />
                      Intentar de nuevo
                    </button>
                  </div>
                )}
                {referenceAnalysis && (
                  <>
                    <div className="rounded-2xl border border-border bg-surface p-4">
                      <p className="text-base font-black text-text">{referenceAnalysis.detectedPageType}</p>
                      <p className="mt-1 text-xs text-text/55">{referenceAnalysis.overallStructure}</p>
                      <p className="mt-3 text-xs leading-relaxed text-text/55">{referenceAnalysis.visualStyleSummary}</p>
                      {referenceAnalysis.structureSignals && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold text-text/50">{referenceAnalysis.structureSignals.heroPattern}</span>
                          <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold text-text/50">Densidad {referenceAnalysis.structureSignals.textDensity}</span>
                          <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold text-text/50">{referenceAnalysis.structureSignals.ctaPattern}</span>
                        </div>
                      )}
                      {typeof referenceAnalysis.estimatedCredits === 'number' && referenceAnalysis.estimatedCredits > 0 && (
                        <p className="mt-3 text-[11px] font-bold text-text/45">Créditos estimados: {referenceAnalysis.estimatedCredits}</p>
                      )}
                    </div>
                    {referenceAnalysis.warnings.length > 0 && (
                      <div className="rounded-2xl border border-amber-300/60 bg-amber-50 p-4">
                        <p className="text-xs font-black uppercase tracking-widest text-amber-700">Advertencias</p>
                        <ul className="mt-2 space-y-1 text-xs leading-relaxed text-amber-800">
                          {referenceAnalysis.warnings.slice(0, 5).map((warning, index) => (
                            <li key={`${warning}-${index}`}>- {warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {showReferenceDebug && (
                      <ReferenceDebugPanel
                        debug={activeReferenceDebug}
                        warnings={[...(referenceAnalysis.warnings || []), ...(plan?.warnings || [])]}
                      />
                    )}
                    <div className="space-y-2">
                      {referenceAnalysis.sections.map((section, index) => (
                        <div key={section.id} className="rounded-2xl border border-border bg-surface p-4">
                          <div className="flex items-start gap-3">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-black text-primary">{index + 1}</span>
                            <div className="min-w-0">
                              <p className="text-sm font-black text-text">Sección {index + 1}</p>
                              <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-text/40">
                                Patrón detectado: {getSectionPatternLabel(referenceAnalysis.sectionLayoutBlueprints?.[index]?.layout?.type || section.layoutPattern)}
                              </p>
                              <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-text/40">
                                Intención visual: {getSectionIntentLabel(section.detectedRole)}
                              </p>
                              <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-text/40">
                                Elementos detectados: {(referenceAnalysis.sectionLayoutBlueprints?.[index]?.layout?.columns || [])
                                  .flatMap(column => column.elements || [])
                                  .map(element => element.semanticRole || element.type)
                                  .slice(0, 5)
                                  .join(', ') || 'estructura editable'}
                              </p>
                              <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-text/40">
                                Imagen sugerida: {referenceAnalysis.sectionLayoutBlueprints?.[index]?.mediaIntent?.needsMedia ? 'Pexels o placeholder propio' : 'No requerida'}
                              </p>
                              <p className="mt-2 text-xs leading-relaxed text-text/55">{section.purpose}</p>
                              <p className="mt-2 inline-flex rounded-full bg-primary/10 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-primary">Inspirada en estructura</p>
                              <p className="mt-2 text-[11px] text-text/40">Confianza {Math.round(section.confidence * 100)}%</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
                      <p className="text-xs font-black uppercase tracking-widest text-primary">Antes de generar</p>
                      <p className="mt-1 text-xs leading-relaxed text-text/60">
                        La página será una versión nueva inspirada en la estructura de la referencia. No se copiarán textos, imágenes, logos ni código.
                      </p>
                    </div>
                    <StickyActionFooter>
                      <button
                        onClick={() => handleGenerateFromReference(false)}
                        disabled={!canGenerateReferencePlan}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isGeneratingReferencePlan ? <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Sparkles size={15} />}
                        {isGeneratingReferencePlan ? 'Creando página editable...' : `Crear página desde esta referencia · ${REFERENCE_PAGE_PLAN_CREDITS} Créditos IA`}
                      </button>
                    </StickyActionFooter>
                  </>
                )}
              </div>
            ) : (
            <>
            {!plan ? (
              <div className="mt-5 rounded-2xl border border-dashed border-border bg-surface/70 p-8 text-center">
                <Sparkles className="mx-auto mb-4 text-text/25" size={30} />
                <p className="text-sm font-bold text-text/50">Completa el formulario para generar el plan de página.</p>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <p className="text-base font-black text-text">{plan.pageTitle}</p>
                  <p className="mt-1 text-xs text-text/55">{plan.pageGoal}</p>
                  <p className="mt-3 inline-flex rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                    {getAIPlanModeLabel(plan)}
                  </p>
                  {typeof plan.estimatedCredits === 'number' && plan.estimatedCredits > 0 && (
                    <p className="mt-2 text-[11px] font-bold text-text/45">
                      Créditos estimados: {plan.estimatedCredits}
                    </p>
                  )}
                </div>

                {plan.usageSummary && (
                  <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-primary">Consumo confirmado</p>
                        <p className="mt-1 text-sm font-bold text-text">
                          {plan.usageSummary.provider || 'Proveedor IA'} · {plan.usageSummary.model || 'modelo no reportado'}
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                        {getAIUsageStatusLabel(plan.usageSummary.status)}
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-text/70">
                      <div className="rounded-xl bg-white/70 px-3 py-2">
                        <p className="font-black uppercase tracking-widest text-text/35">Créditos</p>
                        <p className="mt-1 text-sm font-black text-text">{plan.usageSummary.costCredits ?? plan.estimatedCredits ?? 0}</p>
                      </div>
                      <div className="rounded-xl bg-white/70 px-3 py-2">
                        <p className="font-black uppercase tracking-widest text-text/35">Tokens</p>
                        <p className="mt-1 text-sm font-black text-text">{plan.usageSummary.totalTokens ?? 0}</p>
                      </div>
                      <div className="rounded-xl bg-white/70 px-3 py-2">
                        <p className="font-black uppercase tracking-widest text-text/35">Entrada / salida</p>
                        <p className="mt-1 text-sm font-black text-text">{plan.usageSummary.inputTokens ?? 0} / {plan.usageSummary.outputTokens ?? 0}</p>
                      </div>
                      <div className="rounded-xl bg-white/70 px-3 py-2">
                        <p className="font-black uppercase tracking-widest text-text/35">Ref</p>
                        <p className="mt-1 break-all text-[11px] font-bold text-text">{plan.usageSummary.aiUsageLogId || 'sin log id'}</p>
                      </div>
                    </div>
                    {(plan.usageSummary.balanceBefore || plan.usageSummary.balanceAfter) && (
                      <div className="mt-4 rounded-xl bg-white/70 px-3 py-3 text-xs text-text/70">
                        <p className="font-black uppercase tracking-widest text-text/35">Saldo del proyecto</p>
                        <p className="mt-1">
                          Antes: {plan.usageSummary.balanceBefore?.totalAvailable ?? '—'} · Después: {plan.usageSummary.balanceAfter?.totalAvailable ?? '—'}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {Array.isArray(plan.warnings) && plan.warnings.length > 0 && (
                  <div className="rounded-2xl border border-amber-300/60 bg-amber-50 p-4">
                    <p className="text-xs font-black uppercase tracking-widest text-amber-700">Advertencias</p>
                    <ul className="mt-2 space-y-1 text-xs leading-relaxed text-amber-800">
                      {plan.warnings.slice(0, 4).map((warning, index) => (
                        <li key={`${warning}-${index}`}>- {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-2">
                  {plan.sections.map((section, index) => (
                    <div key={section.id} className="rounded-2xl border border-border bg-surface p-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-black text-primary">{index + 1}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-text">{section.summaryLabel || section.title}</p>
                          <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-text/40">
                            {section.title}
                          </p>
                          <p className="mt-2 text-xs leading-relaxed text-text/55">{section.purpose}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <StickyActionFooter className="flex gap-3">
                  <button
                    onClick={() => onGenerate(brief)}
                    disabled={isGenerating}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-xs font-black uppercase tracking-widest text-text/55 hover:text-text disabled:opacity-50"
                  >
                    <RotateCcw size={15} />
                    Regenerar
                  </button>
                  <button
                    onClick={onApply}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20"
                  >
                    <Check size={16} />
                    Aplicar al sitio
                  </button>
                </StickyActionFooter>
              </div>
            )}
            </>
            )}
          </div>
        </div>
        {activeReferenceProcess && (
          <AIProcessOverlay
            title={processOverlayCopy.title}
            steps={processOverlayCopy.steps}
          />
        )}
      </motion.div>
    </div>
  );
};

// AIGenerationModal Component
export const AIGenerationModal: React.FC<{
  currentStep: number,
  steps: string[],
  onCancel: () => void
}> = ({ currentStep, steps, onCancel }) => (
  <div className="fixed inset-0 z-[2100] flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-text/80 backdrop-blur-md"
    />
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      className="relative w-full max-w-lg bg-surface rounded-[2.5rem] p-10 shadow-3xl text-center overflow-hidden"
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/10 blur-3xl rounded-full -ml-16 -mb-16" />

      <div className="relative">
        <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl animate-pulse">
          <Sparkles className="text-white w-12 h-12" />
        </div>

        <h2 className="text-3xl font-black text-text mb-4 tracking-tight">
          Solutium <span className="text-primary italic">AI Engine</span>
        </h2>

        <p className="text-text/60 mb-10 max-w-sm mx-auto leading-relaxed">
          Nuestra inteligencia artificial está esculpiendo tu sitio web profesional basándose en tu visión.
        </p>

        <div className="space-y-4 mb-10">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div
                key={idx}
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 border ${
                  isCurrent ? 'bg-primary/5 border-primary/20 shadow-sm' :
                  isCompleted ? 'bg-success/5 border-success/10' : 'bg-transparent border-transparent opacity-30'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  isCompleted ? 'bg-success text-white' :
                  isCurrent ? 'bg-primary text-white animate-bounce' : 'bg-secondary text-text/40'
                }`}>
                  {isCompleted ? <Check className="w-5 h-5" /> : idx + 1}
                </div>
                <div className="text-left flex-1">
                  <p className={`text-sm font-bold ${isCurrent ? 'text-primary' : isCompleted ? 'text-text/80' : 'text-text/40'}`}>
                    {step}
                  </p>
                  {isCurrent && (
                    <motion.div
                      className="h-1 bg-primary/20 rounded-full mt-2 overflow-hidden"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                    >
                      <motion.div
                        className="h-full bg-primary"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      />
                    </motion.div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onCancel}
          className="text-[10px] font-black uppercase tracking-widest text-text/30 hover:text-error transition-all duration-300"
        >
          Interrumpir generación
        </button>
      </div>
    </motion.div>
  </div>
);

// [PHASE 3D.5.2] MotherAIPageConfirmationModal Component
export const MotherAIPageConfirmationModal: React.FC<{
  isOpen: boolean,
  onClose: () => void,
  onConfirm: () => void,
  brief: {
    businessName: string,
    industry: string,
    goal: string
  },
  costCredits: number,
  isGenerating: boolean,
  isDryRun: boolean,
  onToggleDryRun: () => void
}> = ({ isOpen, onClose, onConfirm, brief, costCredits, isGenerating, isDryRun, onToggleDryRun }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[2200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-xl bg-surface rounded-[2.5rem] p-10 shadow-3xl overflow-hidden border border-border/50"
        >
          <div className="flex flex-col items-center text-center">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-2xl ${isDryRun ? 'bg-secondary text-text/40' : 'bg-primary text-white'}`}>
              <Sparkles className="w-10 h-10" />
            </div>

            <h2 className="text-3xl font-black text-text mb-2 tracking-tight">
              Generar sitio con <span className="text-primary italic">Solutium AI</span>
            </h2>

            <p className="text-text/60 mb-8 max-w-md">
              {isDryRun
                ? "Modo Vista Previa: Verás qué se enviaría a la IA sin consumir créditos reales."
                : `Esta acción generará una landing completa y consumirá ${costCredits} créditos del proyecto.`}
            </p>

            <div className="w-full bg-secondary/50 rounded-3xl p-6 mb-8 text-left space-y-4 border border-border/30">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-text/30">Negocio</label>
                  <p className="text-sm font-bold truncate">{brief.businessName}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-text/30">Industria</label>
                  <p className="text-sm font-bold truncate">{brief.industry}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text/30">Objetivo</label>
                  <p className="text-sm font-bold">{brief.goal}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full">
              <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-border/60">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDryRun ? 'bg-secondary text-text/40' : 'bg-primary/10 text-primary'}`}>
                    <Check size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black uppercase tracking-tighter">Costo Estimado</p>
                    <p className="text-lg font-black text-primary leading-none">{isDryRun ? 0 : costCredits} Créditos</p>
                  </div>
                </div>

                <button
                  onClick={onToggleDryRun}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isDryRun ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-secondary text-text/40 hover:bg-secondary/80'}`}
                >
                  {isDryRun ? "Simulación: ON" : "Activar Dry-run"}
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isGenerating}
                  className="flex-1 py-4 bg-secondary text-text/60 font-black uppercase tracking-widest rounded-2xl hover:bg-border/40 transition-all border border-border/10"
                >
                  Cancelar
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isGenerating}
                  className={`flex-1 py-4 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 ${
                    isDryRun
                      ? 'bg-solutium-dark shadow-black/10'
                      : 'bg-primary shadow-primary/30 hover:opacity-90'
                  }`}
                >
                  {isGenerating ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles size={18} />
                      {isDryRun ? "Ver Payload" : "Confirmar y Generar"}
                    </>
                  )}
                </button>
              </div>
            </div>

            {!isDryRun && (
              <p className="mt-4 text-[9px] font-black uppercase tracking-widest text-text/20">
                * El cobro se realiza al recibir la respuesta exitosa de la IA.
              </p>
            )}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export const AIUsageSuccessModal: React.FC<{
  isOpen: boolean,
  onClose: () => void,
  usage: {
    costCredits: number,
    totalTokens: number,
    aiUsageLogId: string,
    isDryRun?: boolean
  }
}> = ({ isOpen, onClose, usage }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[2300] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-primary/20 backdrop-blur-xl"
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 100 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-sm bg-surface rounded-[2.5rem] p-10 shadow-3xl text-center"
        >
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl ${usage.isDryRun ? 'bg-secondary' : 'bg-success shadow-success/20'}`}>
            {usage.isDryRun ? (
              <Eye className="text-text/40 w-10 h-10" strokeWidth={3} />
            ) : (
              <Check className="text-white w-10 h-10" strokeWidth={3} />
            )}
          </div>

          <h2 className="text-2xl font-black text-text mb-2 tracking-tight">
            {usage.isDryRun ? 'Simulación Exitosa' : '¡Página Generada!'}
          </h2>
          <p className="text-text/60 mb-8 text-sm">
            {usage.isDryRun
              ? 'Has completado el dry-run local. No se han consumido créditos reales.'
              : 'Tu sitio ha sido construido exitosamente por el motor de IA.'}
          </p>

          <div className="bg-secondary/50 rounded-2xl p-4 mb-8 grid grid-cols-2 gap-4 border border-border/40">
            <div className="text-left">
              <span className="text-[9px] font-black uppercase text-text/30">Costo {usage.isDryRun ? 'Est.' : ''}</span>
              <p className={`text-lg font-black ${usage.isDryRun ? 'text-text/40' : 'text-primary'}`}>
                {usage.costCredits} Crd.
              </p>
            </div>
            <div className="text-left border-l border-border/40 pl-4">
              <span className="text-[9px] font-black uppercase text-text/30">Tokens</span>
              <p className="text-lg font-black text-text/80">{usage.totalTokens}</p>
            </div>
          </div>

          {usage.isDryRun && (
            <div className="mb-6 py-2 px-4 bg-primary/10 rounded-xl">
               <p className="text-[10px] font-black uppercase text-primary tracking-widest">Estado: Simulador Local</p>
            </div>
          )}

          <button
            onClick={onClose}
            className={`w-full py-4 font-black uppercase tracking-widest rounded-2xl shadow-lg transition-all ${
              usage.isDryRun
                ? 'bg-secondary text-text/60 hover:bg-border/40'
                : 'bg-primary text-white shadow-primary/20 hover:opacity-90'
            }`}
          >
            {usage.isDryRun ? 'Cerrar Simulación' : 'Ver mi sitio'}
          </button>

          <p className="mt-4 text-[9px] font-medium text-text/20">
            {usage.isDryRun ? 'Modo: DRY-RUN / PREVIEW' : `Ref: ${usage.aiUsageLogId}`}
          </p>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
