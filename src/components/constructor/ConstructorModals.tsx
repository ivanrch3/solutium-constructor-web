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
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

// DeleteConfirmationModal Component
export const DeleteConfirmationModal: React.FC<{ 
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

// PublishModal Component
export const PublishModal: React.FC<{
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

// AIGenerationModal Component
export const AIGenerationModal: React.FC<{
  currentStep: number,
  steps: string[],
  onCancel: () => void
}> = ({ currentStep, steps, onCancel }) => (
  <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
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
