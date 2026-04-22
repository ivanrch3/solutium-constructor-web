import React from 'react';
import { 
  RotateCcw, 
  Eye, 
  Monitor, 
  Tablet, 
  Maximize, 
  Check, 
  X, 
  Save, 
  Send 
} from 'lucide-react';
import { motion } from 'motion/react';

interface TopBarProps {
  onSave: () => void;
  onPublish: () => void;
  onPreview: () => void;
  logoUrl: string | null;
  viewport: 'desktop' | 'tablet' | 'mobile';
  setViewport: (v: 'desktop' | 'tablet' | 'mobile') => void;
  isFullscreen: boolean;
  setIsFullscreen: (f: boolean) => void;
  saveStatus: 'idle' | 'loading' | 'success' | 'error';
  publishStatus: 'idle' | 'loading' | 'success' | 'error';
  isMobile: boolean;
  isPreviewMode: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  onSave, 
  onPublish, 
  onPreview,
  logoUrl,
  viewport,
  setViewport,
  isFullscreen,
  setIsFullscreen,
  saveStatus,
  publishStatus,
  isMobile,
  isPreviewMode
}) => (
  <div className={`bg-surface border-b border-border/60 flex items-center justify-between px-4 md:px-6 z-20 ${isMobile ? 'h-[70px]' : 'h-[60px]'}`}>
    <div className="flex items-center gap-3 md:gap-4">
      {logoUrl && !isMobile && (
        <img 
          src={logoUrl} 
          alt="Logo" 
          className="h-8 w-auto object-contain mr-2" 
          referrerPolicy="no-referrer" 
        />
      )}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <h2 className={`${isMobile ? 'text-sm' : 'text-base'} font-bold text-text`}>
            {isMobile ? 'Constructor Web' : 'Editor de Módulos'}
          </h2>
          {saveStatus === 'loading' && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 rounded-full">
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <RotateCcw size={10} className="text-primary" />
              </motion.div>
              <span className="text-[9px] font-bold text-primary uppercase tracking-tighter">Sincronizando...</span>
            </div>
          )}
        </div>
        {!isMobile && <p className="text-xs font-semibold text-text/50 uppercase tracking-wider">Añade módulos para construir tu página</p>}
      </div>
    </div>

    <div className="flex items-center gap-2 md:gap-4">
      <div className="flex items-center gap-2 md:gap-3 border-r border-border/60 pr-2 md:pr-4">
        {!isMobile && (
          <button 
            onClick={onPreview}
            className="p-1.5 text-text/60 hover:text-primary hover:bg-secondary rounded-lg transition-all"
            title="Previsualizar en pestaña nueva"
          >
            <Eye size={16} />
          </button>
        )}
        {!isMobile && (
          <button 
            onClick={() => setViewport('desktop')}
            className="p-1.5 text-text/60 hover:text-primary hover:bg-secondary rounded-lg transition-all"
            title="Restablecer vista"
          >
            <RotateCcw size={16} />
          </button>
        )}
        <div className="flex items-center gap-1 bg-secondary p-1 rounded-xl">
          <button 
            onClick={() => setViewport('desktop')}
            className={`p-1.5 rounded-lg transition-all ${viewport === 'desktop' ? 'text-primary bg-surface shadow-sm' : 'text-text/60 hover:text-primary'}`}
            title="Vista de Escritorio"
          >
            <Monitor size={isMobile ? 16 : 14} />
          </button>
          <button 
            onClick={() => setViewport('tablet')}
            className={`p-1.5 rounded-lg transition-all ${viewport === 'tablet' ? 'text-primary bg-surface shadow-sm' : 'text-text/60 hover:text-primary'}`}
            title="Vista de Tablet"
          >
            <Tablet size={isMobile ? 16 : 14} />
          </button>
        </div>
        {!isMobile && (
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`p-1.5 rounded-lg transition-all ${isFullscreen ? 'text-primary bg-primary/10' : 'text-text/60 hover:text-primary hover:bg-secondary'}`}
            title="Pantalla Completa"
          >
            <Maximize size={16} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 md:gap-2">
        <motion.button 
          whileHover={saveStatus === 'idle' ? { scale: 1.02 } : {}}
          whileTap={saveStatus === 'idle' ? { scale: 0.98 } : {}}
          onClick={saveStatus === 'idle' ? onSave : undefined}
          disabled={saveStatus !== 'idle'}
          className={`flex items-center gap-2 px-3 md:px-4 py-2 font-bold text-[10px] md:text-xs rounded-xl transition-all ${
            saveStatus === 'success' ? 'bg-green-500/10 text-green-600' : 
            saveStatus === 'error' ? 'bg-red-500/10 text-red-600' : 
            'bg-secondary text-text/80'
          }`}
        >
          {saveStatus === 'loading' ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
              <RotateCcw size={14} />
            </motion.div>
          ) : saveStatus === 'success' ? <Check size={14} /> : saveStatus === 'error' ? <X size={14} /> : <Save size={14} />}
          {isMobile ? 'Guardar' : (saveStatus === 'loading' ? 'Guardando...' : saveStatus === 'success' ? 'Guardado' : saveStatus === 'error' ? 'Error' : 'Guardar Borrador')}
        </motion.button>
        <motion.button 
          whileHover={publishStatus === 'idle' ? { scale: 1.02 } : {}}
          whileTap={publishStatus === 'idle' ? { scale: 0.98 } : {}}
          onClick={publishStatus === 'idle' ? onPublish : undefined}
          disabled={publishStatus !== 'idle'}
          className={`flex items-center gap-2 px-3 md:px-5 py-2 font-bold text-[10px] md:text-xs rounded-xl shadow-lg transition-all ${
            publishStatus === 'success' ? 'bg-green-500 text-white shadow-green-500/20' : 
            publishStatus === 'error' ? 'bg-red-500 text-white shadow-red-500/20' : 
            'bg-primary text-white shadow-primary/20'
          }`}
        >
          {publishStatus === 'loading' ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
              <RotateCcw size={14} />
            </motion.div>
          ) : publishStatus === 'success' ? <Check size={14} /> : publishStatus === 'error' ? <X size={14} /> : <Send size={14} />}
          {isMobile ? 'Publicar' : (publishStatus === 'loading' ? 'Publicando...' : publishStatus === 'success' ? 'Publicado' : publishStatus === 'error' ? 'Error' : 'Publicar')}
        </motion.button>
      </div>
    </div>
  </div>
);
