import React from 'react';
import { 
  RotateCcw, 
  RotateCw,
  Monitor, 
  Tablet, 
  Smartphone, 
  Maximize, 
  Minimize,
  Check, 
  X, 
  Save, 
  Send
} from 'lucide-react';
import { motion } from 'motion/react';

interface TopBarProps {
  onSave: () => void;
  onPublish: () => void;
  logoUrl: string | null;
  viewport: 'desktop' | 'tablet' | 'mobile';
  setViewport: (v: 'desktop' | 'tablet' | 'mobile') => void;
  isFullscreen: boolean;
  setIsFullscreen: (f: boolean) => void;
  saveStatus: 'idle' | 'loading' | 'success' | 'error';
  publishStatus: 'idle' | 'loading' | 'success' | 'error';
  previewStatus?: 'idle' | 'loading' | 'success' | 'error';
  isMobile: boolean;
  isPreviewMode: boolean;
  hasUnsavedChanges?: boolean;
  isSaving?: boolean;
  isDraftOperationInProgress?: boolean;
  currentStatus?: 'draft' | 'published' | 'modified';
  isNewSite?: boolean;
  onReloadPreview?: () => void;
  assetName?: string;
  autosaveStatus?: 'idle' | 'saving' | 'saved' | 'error' | 'disabled';
  autosaveError?: string | null;
  lastAutosavedAt?: Date | null;
  showAutosaveIndicator?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  onSave, 
  onPublish, 
  logoUrl,
  viewport,
  setViewport,
  isFullscreen,
  setIsFullscreen,
  saveStatus,
  publishStatus,
  previewStatus = 'idle',
  isMobile,
  isPreviewMode,
  hasUnsavedChanges = false,
  isSaving = false,
  isDraftOperationInProgress = false,
  currentStatus = 'draft',
  isNewSite = true,
  onReloadPreview,
  assetName = 'Activo sin nombre',
  autosaveStatus = 'idle',
  autosaveError = null,
  lastAutosavedAt = null,
  showAutosaveIndicator = true
}) => {
  const canSave = saveStatus === 'idle' && !isSaving && !isDraftOperationInProgress && hasUnsavedChanges;
  const isPublishBlocked =
    publishStatus !== 'idle' ||
    saveStatus === 'loading' ||
    autosaveStatus === 'saving' ||
    isSaving ||
    isDraftOperationInProgress ||
    (currentStatus === 'published' && !hasUnsavedChanges);
  const canPublish = !isPublishBlocked;

  return (
  <div className={`bg-surface border-b border-border/60 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 md:px-6 z-20 ${isMobile ? 'h-[70px]' : 'h-[60px]'}`}>
    {/* Left Section: Viewports */}
    <div className="flex items-center gap-4">
      {!isMobile && (
        <div className="flex items-center gap-1 bg-secondary p-1 rounded-xl">
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
      )}
    </div>

    {/* Center Section: Asset Name */}
    <div className="pointer-events-none flex items-center justify-center min-w-0">
      <div className="flex items-center gap-2 min-w-0 max-w-full">
        <h2 className={`${isMobile ? 'text-sm' : 'text-base'} font-bold text-text truncate text-center min-w-0`}>
          {assetName}
        </h2>
        {saveStatus === 'loading' && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 rounded-full">
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <RotateCw size={10} className="text-primary" />
            </motion.div>
            <span className="text-[9px] font-bold text-primary uppercase tracking-tighter shrink-0">Sincronizando...</span>
          </div>
        )}
        {showAutosaveIndicator && saveStatus !== 'loading' && autosaveStatus === 'saving' && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 rounded-full">
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <RotateCw size={10} className="text-primary" />
            </motion.div>
            <span className="text-[9px] font-bold text-primary uppercase tracking-tighter shrink-0">Guardando automáticamente...</span>
          </div>
        )}
        {showAutosaveIndicator && saveStatus !== 'loading' && autosaveStatus === 'saved' && lastAutosavedAt && (
          <div className="px-2 py-0.5 bg-secondary rounded-full">
            <span className="text-[9px] font-bold text-text/70 uppercase tracking-tighter shrink-0">
              Guardado automático {lastAutosavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
        {showAutosaveIndicator && saveStatus !== 'loading' && autosaveStatus === 'error' && (
          <div className="px-2 py-0.5 bg-red-500/10 rounded-full">
            <span className="text-[9px] font-bold text-red-600 uppercase tracking-tighter shrink-0" title={autosaveError || undefined}>
              No se pudo guardar automáticamente
            </span>
          </div>
        )}
        {saveStatus !== 'loading' && autosaveStatus === 'disabled' && (
          <div className="px-2 py-0.5 bg-secondary rounded-full">
            <span className="text-[9px] font-bold text-text/60 uppercase tracking-tighter shrink-0">
              Autoguardado desactivado
            </span>
          </div>
        )}
        {saveStatus !== 'loading' && previewStatus === 'loading' && (
          <div className="px-2 py-0.5 bg-blue-500/10 rounded-full">
            <span className="text-[9px] font-bold text-blue-600 uppercase tracking-tighter shrink-0">
              Actualizando preview
            </span>
          </div>
        )}
        {saveStatus !== 'loading' && previewStatus === 'success' && (
          <div className="px-2 py-0.5 bg-green-500/10 rounded-full">
            <span className="text-[9px] font-bold text-green-600 uppercase tracking-tighter shrink-0">
              Preview actualizado
            </span>
          </div>
        )}
        {saveStatus !== 'loading' && previewStatus === 'error' && (
          <div className="px-2 py-0.5 bg-amber-500/10 rounded-full">
            <span className="text-[9px] font-bold text-amber-700 uppercase tracking-tighter shrink-0">
              Preview pendiente
            </span>
          </div>
        )}
      </div>
    </div>

    {/* Right Section: Actions */}
    <div className="flex items-center justify-end gap-2 md:gap-4">
      <div className="flex items-center gap-2 md:gap-3 border-r border-border/60 pr-2 md:pr-4">
        {!isMobile && (
          <div className="flex items-center gap-1">
            <button 
              onClick={onReloadPreview}
              className="p-2 rounded-lg transition-all text-text/60 hover:text-primary hover:bg-secondary"
              title="Recargar Preview"
            >
              <RotateCcw size={18} />
            </button>
            <button 
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={`p-2 rounded-lg transition-all ${isFullscreen ? 'text-primary bg-primary/10' : 'text-text/60 hover:text-primary hover:bg-secondary'}`}
              title={isFullscreen ? "Salir de Pantalla Completa" : "Pantalla Completa"}
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 md:gap-2">
        <motion.button 
          whileHover={canSave ? { scale: 1.02 } : {}}
          whileTap={canSave ? { scale: 0.98 } : {}}
          onClick={canSave ? onSave : undefined}
          disabled={!canSave}
          className={`flex items-center gap-2 px-3 md:px-4 py-2 font-bold text-[10px] md:text-xs rounded-xl transition-all ${
            saveStatus === 'success' ? 'bg-green-500/10 text-green-600' : 
            saveStatus === 'error' ? 'bg-red-500/10 text-red-600' : 
            hasUnsavedChanges ? 'bg-secondary text-text/80 shadow-sm border border-primary/20' :
            'bg-secondary/50 text-text/30 cursor-not-allowed'
          }`}
        >
          {saveStatus === 'loading' ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
              <RotateCw size={14} />
            </motion.div>
          ) : saveStatus === 'success' ? <Check size={14} /> : saveStatus === 'error' ? <X size={14} /> : <Save size={14} />}
          {isMobile ? (isNewSite ? 'Guardar' : 'Actualizar') : (
            saveStatus === 'loading' ? 'Guardando...' : 
            saveStatus === 'success' ? 'Guardado' : 
            saveStatus === 'error' ? 'Error' : 
            (isNewSite ? 'Guardar Borrador' : 'Guardar Cambios')
          )}
        </motion.button>
        <motion.button 
          whileHover={canPublish ? { scale: 1.02 } : {}}
          whileTap={canPublish ? { scale: 0.98 } : {}}
          onClick={canPublish ? onPublish : undefined}
          disabled={isPublishBlocked}
          className={`flex items-center gap-2 px-3 md:px-5 py-2 font-bold text-[10px] md:text-xs rounded-xl shadow-lg transition-all ${
            publishStatus === 'success' ? 'bg-green-500 text-white shadow-green-500/20' : 
            publishStatus === 'error' ? 'bg-red-500 text-white shadow-red-500/20' : 
            isPublishBlocked ? 'bg-primary/40 text-white/50 shadow-none cursor-not-allowed' :
            'bg-primary text-white shadow-primary/20'
          }`}
        >
          {publishStatus === 'loading' ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
              <RotateCcw size={14} />
            </motion.div>
          ) : publishStatus === 'success' ? <Check size={14} /> : publishStatus === 'error' ? <X size={14} /> : <Send size={14} />}
          {publishStatus === 'loading' ? 'Publicando...' : 
            publishStatus === 'success' ? (currentStatus === 'published' ? 'Actualizado' : 'Publicado') : 
            publishStatus === 'error' ? 'Error' : 
            (currentStatus === 'published' || currentStatus === 'modified' ? 'Actualizar' : 'Publicar')}
        </motion.button>
      </div>
    </div>
  </div>
  );
};
