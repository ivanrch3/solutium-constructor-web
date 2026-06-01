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
import { AIPageGenerationBrief, AIPagePlan, AIPageTone, AIPageType } from '../../types/ai';

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
      onClick={onCancel}
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
  { value: 'home', label: 'Pagina de inicio' },
  { value: 'services', label: 'Pagina de servicios' },
  { value: 'product', label: 'Pagina de producto' },
  { value: 'contact', label: 'Pagina de contacto' },
  { value: 'promo', label: 'Pagina promocional' }
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

const getAIPlanModeLabel = (plan: AIPagePlan) => {
  if (plan.generationMode === 'fallback' || plan.source === 'fallback') return 'Fallback seguro';
  if (plan.generationMode === 'broker' || plan.source === 'ai_broker') return 'AI Broker';
  return 'Mock local';
};

export const AIPagePlanModal: React.FC<{
  plan: AIPagePlan | null,
  isGenerating: boolean,
  projectName?: string,
  onGenerate: (brief: AIPageGenerationBrief) => void,
  onApply: () => void,
  onCancel: () => void
}> = ({ plan, isGenerating, projectName, onGenerate, onApply, onCancel }) => {
  const [brief, setBrief] = React.useState<AIPageGenerationBrief>({
    pageType: 'landing',
    businessType: '',
    pageGoal: GOAL_OPTIONS[0],
    instructions: '',
    tone: 'profesional',
    primaryCta: '',
    businessName: projectName || ''
  });

  const updateBrief = (patch: Partial<AIPageGenerationBrief>) => {
    setBrief(prev => ({ ...prev, ...patch }));
  };

  const canGenerate = brief.businessType.trim().length > 1 && brief.instructions.trim().length > 8 && brief.primaryCta.trim().length > 1;

  return (
    <div className="fixed inset-0 z-[2150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        className="w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-3xl bg-surface shadow-2xl border border-border"
      >
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Crear con IA - Fase 1</p>
            <h2 className="text-xl font-black text-text">Generar pagina editable</h2>
          </div>
          <button onClick={onCancel} className="rounded-xl p-2 text-text/40 hover:bg-secondary hover:text-text transition-all">
            <ArrowLeft size={20} />
          </button>
        </div>

        <div className="grid max-h-[calc(92vh-82px)] grid-cols-1 overflow-y-auto lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-5 p-6">
            <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
              <p className="text-xs font-bold text-primary">Generacion simulada local</p>
              <p className="mt-1 text-xs leading-relaxed text-text/60">
                Esta fase crea un pagePlan compatible con el Constructor. No llama APIs externas ni genera HTML libre.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-text/45">Tipo de pagina</span>
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
                <input
                  value={brief.businessType}
                  onChange={(event) => updateBrief({ businessType: event.target.value })}
                  placeholder="restaurante, consultoria, clinica, software..."
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-primary"
                />
              </label>
            </div>

            <label className="space-y-2 block">
              <span className="text-xs font-black uppercase tracking-widest text-text/45">Objetivo de la pagina</span>
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
                placeholder="Describe que quieres que tenga la pagina..."
                rows={5}
                className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-primary"
              />
            </label>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-text/45">Tono de comunicacion</span>
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
                  placeholder="Solicitar informacion, Agendar cita..."
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-primary"
                />
              </label>
            </div>

            <button
              onClick={() => onGenerate(brief)}
              disabled={!canGenerate || isGenerating}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isGenerating ? <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Sparkles size={18} />}
              {plan ? 'Regenerar pagina' : 'Generar pagina'}
            </button>
          </div>

          <div className="border-t border-border/60 bg-secondary/35 p-6 lg:border-l lg:border-t-0">
            <h3 className="text-sm font-black uppercase tracking-widest text-text/45">Resumen generado</h3>
            {!plan ? (
              <div className="mt-5 rounded-2xl border border-dashed border-border bg-surface/70 p-8 text-center">
                <Sparkles className="mx-auto mb-4 text-text/25" size={30} />
                <p className="text-sm font-bold text-text/50">Completa el formulario para generar el plan de pagina.</p>
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

                {Array.isArray(plan.warnings) && plan.warnings.length > 0 && (
                  <div className="rounded-2xl border border-amber-300/60 bg-amber-50 p-4">
                    <p className="text-xs font-black uppercase tracking-widest text-amber-700">Advertencias</p>
                    <ul className="mt-2 space-y-1 text-xs leading-relaxed text-amber-800">
                      {plan.warnings.slice(0, 4).map((warning, index) => (
                        <li key={`${warning}-${index}`}>• {warning}</li>
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
                          <p className="text-sm font-black text-text">{section.title}</p>
                          <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-text/40">
                            {section.moduleType}{section.preset ? ` · ${section.preset}` : ''}
                          </p>
                          <p className="mt-2 text-xs leading-relaxed text-text/55">{section.purpose}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
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
                </div>
              </div>
            )}
          </div>
        </div>
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
