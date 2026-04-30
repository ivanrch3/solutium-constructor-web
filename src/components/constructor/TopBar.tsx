import React from 'react';
import { 
  RotateCcw, 
  Eye, 
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
  onReload: () => void;
  logoUrl: string | null;
  viewport: 'desktop' | 'tablet' | 'mobile';
  setViewport: (v: 'desktop' | 'tablet' | 'mobile') => void;
  isFullscreen: boolean;
  setIsFullscreen: (f: boolean) => void;
  saveStatus: 'idle' | 'loading' | 'success' | 'error';
  publishStatus: 'idle' | 'loading' | 'success' | 'error';
  isMobile: boolean;
  isPreviewMode: boolean;
  hasUnsavedChanges?: boolean;
  currentStatus?: 'draft' | 'published' | 'modified';
  isNewSite?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  onSave, 
  onPublish, 
  onReload,
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
  currentStatus = 'draft',
  isNewSite = true
}) => (
  <div className={`bg-surface border-b border-border/60 flex items-center justify-between px-4 md:px-6 z-20 ${isMobile ? 'h-[70px]' : 'h-[60px]'}`}>
    {/* Left Section: Viewports */}
    <div className="flex-1 flex items-center gap-4">
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

    {/* Center Section: Brand/Status */}
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="flex items-center gap-2">
        <h2 className={`${isMobile ? 'text-sm' : 'text-base'} font-bold text-text truncate`}>
          Constructor Web
        </h2>
        {saveStatus === 'loading' && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 rounded-full">
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <RotateCcw size={10} className="text-primary" />
            </motion.div>
            <span className="text-[9px] font-bold text-primary uppercase tracking-tighter shrink-0">Sincronizando...</span>
          </div>
        )}
      </div>
      {!isMobile && <p className="text-[9px] font-semibold text-text/30 uppercase tracking-[0.2em] whitespace-nowrap">Constructor Web</p>}
    </div>

    {/* Right Section: Actions */}
    <div className="flex-1 flex items-center justify-end gap-2 md:gap-4">
      <div className="flex items-center gap-2 md:gap-3 border-r border-border/60 pr-2 md:pr-4">
        {!isMobile && (
          <div className="flex items-center gap-1">
            <button 
              onClick={onReload}
              className="p-2 text-text/60 hover:text-primary hover:bg-secondary rounded-lg transition-all"
              title="Recargar página"
            >
              <RotateCcw size={16} />
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
          whileHover={(saveStatus === 'idle' && hasUnsavedChanges) ? { scale: 1.02 } : {}}
          whileTap={(saveStatus === 'idle' && hasUnsavedChanges) ? { scale: 0.98 } : {}}
          onClick={(saveStatus === 'idle' && hasUnsavedChanges) ? onSave : undefined}
          disabled={saveStatus !== 'idle' || !hasUnsavedChanges}
          className={`flex items-center gap-2 px-3 md:px-4 py-2 font-bold text-[10px] md:text-xs rounded-xl transition-all ${
            saveStatus === 'success' ? 'bg-green-500/10 text-green-600' : 
            saveStatus === 'error' ? 'bg-red-500/10 text-red-600' : 
            hasUnsavedChanges ? 'bg-secondary text-text/80 shadow-sm border border-primary/20' :
            'bg-secondary/50 text-text/30 cursor-not-allowed'
          }`}
        >
          {saveStatus === 'loading' ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
              <RotateCcw size={14} />
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
          whileHover={(publishStatus === 'idle' && !hasUnsavedChanges && currentStatus !== 'published') ? { scale: 1.02 } : {}}
          whileTap={(publishStatus === 'idle' && !hasUnsavedChanges && currentStatus !== 'published') ? { scale: 0.98 } : {}}
          onClick={(publishStatus === 'idle' && !hasUnsavedChanges && currentStatus !== 'published') ? onPublish : undefined}
          disabled={publishStatus !== 'idle' || hasUnsavedChanges || currentStatus === 'published'}
          className={`flex items-center gap-2 px-3 md:px-5 py-2 font-bold text-[10px] md:text-xs rounded-xl shadow-lg transition-all ${
            publishStatus === 'success' ? 'bg-green-500 text-white shadow-green-500/20' : 
            publishStatus === 'error' ? 'bg-red-500 text-white shadow-red-500/20' : 
            (hasUnsavedChanges || currentStatus === 'published') ? 'bg-primary/40 text-white/50 shadow-none cursor-not-allowed' :
            'bg-primary text-white shadow-primary/20'
          }`}
        >
          {publishStatus === 'loading' ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
              <RotateCcw size={14} />
            </motion.div>
          ) : publishStatus === 'success' ? <Check size={14} /> : publishStatus === 'error' ? <X size={14} /> : <Send size={14} />}
          {isMobile ? (currentStatus === 'published' ? 'Actualizar' : 'Publicar') : (
            publishStatus === 'loading' ? 'Publicando...' : 
            publishStatus === 'success' ? 'Publicado' : 
            publishStatus === 'error' ? 'Error' : 
            (currentStatus === 'published' || currentStatus === 'modified' ? 'Actualizar Sitio' : 'Publicar Sitio')
          )}
        </motion.button>
      </div>
    </div>
  </div>
);
