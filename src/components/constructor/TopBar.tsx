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
  Send,
  ExternalLink,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { motion } from 'motion/react';

type TopBarAuthNotice = {
  type: 'info' | 'error';
  title?: string;
  message: string;
};

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
  publishedUrl?: string | null;
  canOpenPublishedUrl?: boolean;
  onOpenPublished?: () => void;
  onReloadPreview?: () => void;
  assetName?: string;
  autosaveStatus?: 'idle' | 'saving' | 'saved' | 'error' | 'disabled';
  autosaveError?: string | null;
  lastAutosavedAt?: Date | null;
  showAutosaveIndicator?: boolean;
  authNotice?: TopBarAuthNotice | null;
  onDismissAuthNotice?: () => void;
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
  isMobile,
  isPreviewMode,
  hasUnsavedChanges = false,
  isSaving = false,
  isDraftOperationInProgress = false,
  currentStatus = 'draft',
  isNewSite = true,
  publishedUrl = null,
  canOpenPublishedUrl = false,
  onOpenPublished,
  onReloadPreview,
  assetName = 'Activo sin nombre',
  autosaveStatus = 'idle',
  autosaveError = null,
  lastAutosavedAt = null,
  showAutosaveIndicator = true,
  authNotice = null,
  onDismissAuthNotice
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
  const shouldShowOpenPublished = Boolean(onOpenPublished);
  const hasRealPublishedUrl = Boolean(publishedUrl && canOpenPublishedUrl);
  const hasPublishedPendingChanges = currentStatus === 'modified' || hasUnsavedChanges;
  const isOpenPublishedDisabled = !hasRealPublishedUrl || publishStatus === 'loading';
  const openPublishedButtonClass = isOpenPublishedDisabled
    ? 'bg-secondary/70 text-text/35 border border-border cursor-not-allowed shadow-none'
    : hasPublishedPendingChanges
      ? 'bg-primary text-white border border-primary shadow-lg shadow-primary/20 hover:bg-primary/90'
    : 'bg-green-500 text-white shadow-lg shadow-green-500/20 hover:bg-green-600';
  const openPublishedTooltip = hasRealPublishedUrl
    ? hasPublishedPendingChanges
      ? 'Abrir la versión publicada. Hay cambios pendientes por actualizar.'
      : 'Abrir sitio publicado actualizado'
    : currentStatus === 'draft' || isNewSite
      ? 'Publica el sitio y vincula un dominio o subdominio para abrirlo.'
      : 'Vincula un dominio o subdominio para abrir el sitio publicado.';

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
      </div>
    </div>

    {/* Right Section: Actions */}
    <div className="relative flex items-center justify-end gap-2 md:gap-4">
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
        {shouldShowOpenPublished && (
          <motion.button
            whileHover={!isOpenPublishedDisabled ? { scale: 1.02 } : {}}
            whileTap={!isOpenPublishedDisabled ? { scale: 0.98 } : {}}
            onClick={!isOpenPublishedDisabled ? onOpenPublished : undefined}
            disabled={isOpenPublishedDisabled}
            className={`flex items-center gap-2 px-3 md:px-4 py-2 font-bold text-[10px] md:text-xs rounded-xl transition-all ${openPublishedButtonClass}`}
            title={openPublishedTooltip}
          >
            <ExternalLink size={14} />
            {!isMobile && 'Abrir'}
          </motion.button>
        )}
      </div>
      {authNotice && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className={`absolute right-0 top-[calc(100%+0.5rem)] z-30 w-[min(92vw,420px)] rounded-xl border p-3 shadow-xl ${
            authNotice.type === 'error'
              ? 'border-amber-200 bg-amber-50 text-amber-900'
              : 'border-blue-200 bg-blue-50 text-blue-900'
          }`}
          role={authNotice.type === 'error' ? 'alert' : 'status'}
        >
          <div className="flex items-start gap-2.5">
            <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
              authNotice.type === 'error' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {authNotice.type === 'error' ? <AlertTriangle size={15} /> : <RefreshCw size={15} />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold">
                {authNotice.title || (authNotice.type === 'error' ? 'Sesión expirada' : 'Sesión actualizada')}
              </p>
              <p className="mt-0.5 text-[11px] leading-snug">
                {authNotice.message}
              </p>
            </div>
            {onDismissAuthNotice && (
              <button
                type="button"
                onClick={onDismissAuthNotice}
                className="rounded-md p-1 text-current/55 transition-colors hover:bg-white/70 hover:text-current"
                aria-label="Cerrar aviso de sesión"
                title="Cerrar aviso de sesión"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  </div>
  );
};
