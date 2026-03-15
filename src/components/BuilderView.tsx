import React from 'react';
import { Layout, Plus, Eye, Save, Rocket, Loader2, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ModuleRenderer } from './ModuleRenderer';
import { ModuleProvider } from '../context/ModuleContext';
import { PageLayout } from '../types';

interface BuilderViewProps {
  isPreviewMode: boolean;
  setIsPreviewMode: (mode: boolean) => void;
  setIsMobileMenuOpen: (open: boolean) => void;
  handleSave: () => void;
  isSaving: boolean;
  isDirty: boolean;
  handlePublish: () => void;
  publishStatus: 'idle' | 'publishing' | 'success' | 'error';
  modules: any[];
  setShowPicker: (show: boolean) => void;
  removeModule: (id: string) => void;
  updateModule: (id: string, data: any) => void;
  handleSelectModule: (id: string) => void;
  handleEditModule: (id: string) => void;
  selectedModuleId: string | null;
  setImagePickerCallback: (callback: any) => void;
  setIsImagePickerOpen: (open: boolean) => void;
  config: any;
  selectedProductIds: string[];
  pageLayout?: PageLayout;
}

export const BuilderView: React.FC<BuilderViewProps> = ({
  isPreviewMode,
  setIsPreviewMode,
  setIsMobileMenuOpen,
  handleSave,
  isSaving,
  isDirty,
  handlePublish,
  publishStatus,
  modules,
  setShowPicker,
  removeModule,
  updateModule,
  handleSelectModule,
  handleEditModule,
  selectedModuleId,
  setImagePickerCallback,
  setIsImagePickerOpen,
  config,
  selectedProductIds,
  pageLayout = 'seamless'
}) => {
  const isSeamless = pageLayout === 'seamless';
  const isSymmetric = pageLayout === 'symmetric';
  const isLayered = pageLayout === 'layered';
  const isBento = pageLayout === 'bento';
  const isSnap = pageLayout === 'snap';
  const isSplit = pageLayout === 'split';

  const layoutWidthClass = isSeamless || isSnap || isSplit ? 'w-full' : isSymmetric ? 'max-w-7xl mx-auto' : isLayered ? 'max-w-6xl mx-auto px-4 md:px-0' : isBento ? 'max-w-7xl mx-auto px-4' : 'max-w-5xl mx-auto';

  return (
    <div className={`${layoutWidthClass} transition-all duration-500`}>
      {!isPreviewMode && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-text/60 hover:bg-background rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h3 className="text-2xl font-black text-text mb-1">Editor de Módulos</h3>
              <p className="text-text/60 text-sm">Añade módulos desde el constructor a la izquierda para construir tu página.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <button 
              onClick={() => setIsPreviewMode(true)} 
              className="flex items-center gap-2 px-4 py-2.5 text-text/70 hover:bg-surface hover:shadow-sm font-bold text-sm rounded-xl transition-all border border-transparent hover:border-text/10"
            >
              <Eye className="w-4 h-4" />
              <span>Vista Previa</span>
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 bg-surface border border-text/10 text-text/80 font-bold text-sm rounded-xl hover:bg-background hover:border-text/20 transition-all shadow-sm disabled:opacity-50 relative"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Guardar</span>
              {isDirty && !isSaving && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 border-2 border-white rounded-full animate-pulse" title="Cambios sin guardar" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Canvas */}
      <div className={`${
        isSeamless ? 'flex flex-col pb-0' : 
        isSymmetric ? 'flex flex-col pb-20 space-y-px bg-text/5' : 
        isLayered ? 'flex flex-col pb-20 space-y-12 md:space-y-20' : 
        isBento ? 'grid grid-cols-1 md:grid-cols-12 gap-4 pb-20' :
        isSnap ? 'flex flex-col h-[calc(100vh-120px)] overflow-y-auto snap-y snap-mandatory scroll-smooth' :
        isSplit ? 'grid grid-cols-1 md:grid-cols-2 gap-0 pb-0' :
        'space-y-6 pb-20'
      } min-h-[600px] transition-all duration-500`}>
        {modules.length === 0 ? (
          !isPreviewMode && (
            <div className="bg-surface rounded-[2.5rem] border-2 border-dashed border-text/10 p-20 flex flex-col items-center justify-center text-center group hover:border-primary/30 transition-colors">
              <div className="w-20 h-20 bg-background rounded-3xl flex items-center justify-center text-text/30 mb-6 group-hover:bg-primary/5 group-hover:text-primary/60 transition-all duration-500">
                <Layout className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-text mb-2">Tu lienzo está vacío</h4>
              <p className="text-text/40 max-w-xs mb-10 leading-relaxed">
                Empieza añadiendo tu primer módulo o deja que nuestra IA lo haga por ti.
              </p>
              <button 
                onClick={() => setShowPicker(true)}
                className="flex items-center gap-3 px-8 py-4 bg-text text-background font-bold rounded-2xl hover:bg-primary transition-all shadow-xl shadow-text/10"
              >
                <Plus className="w-5 h-5" />
                Añadir Primer Módulo
              </button>
            </div>
          )
        ) : (
          <>
            <AnimatePresence>
              {modules.map((module, index) => {
                if (module.data?.isHidden && isPreviewMode) {
                  return null;
                }
                const isStickyNav = (module.type === 'top-bar' && module.data?.isSticky !== false) || 
                                    (module.type === 'header' && (module.data?.scrollMode === 'sticky' || module.data?.scrollMode === 'smart-hide'));
                
                // Aplicar temas: Usar el tema definido en el módulo, o el valor por defecto solicitado
                const themeClass = module.data?.theme === 'dark' ? 'theme-dark' : 
                                   module.data?.theme === 'light' ? 'theme-light' : 
                                   (module.type === 'header' || module.type === 'top-bar' ? 'theme-dark' : 
                                    module.type === 'hero' ? 'theme-light' : '');

                // Bento Grid column spans
                let bentoClass = '';
                if (isBento) {
                  const fullWidthTypes = ['header', 'top-bar', 'footer', 'hero', 'cta-banner'];
                  if (fullWidthTypes.includes(module.type)) {
                    bentoClass = 'md:col-span-12';
                  } else {
                    // Pattern: 8-4, 4-8, 6-6
                    const patternIndex = index % 3;
                    if (patternIndex === 0) bentoClass = 'md:col-span-8';
                    else if (patternIndex === 1) bentoClass = 'md:col-span-4';
                    else bentoClass = 'md:col-span-6';
                  }
                } else if (isSplit) {
                  const fullWidthTypes = ['header', 'top-bar', 'footer'];
                  if (fullWidthTypes.includes(module.type)) {
                    bentoClass = 'md:col-span-2';
                  }
                }

                return (
                  <motion.div
                    key={module.id}
                    initial={isPreviewMode ? false : { opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.1 }}
                    className={`${isStickyNav ? 'sticky top-0 z-[40]' : ''} ${themeClass} ${bentoClass}`}
                  >
                    <ModuleProvider index={index}>
                      <ModuleRenderer 
                        module={module} 
                        modules={modules}
                        onRemove={removeModule} 
                        onUpdate={updateModule}
                        onSelect={(id) => !isPreviewMode && handleSelectModule(id)}
                        onEdit={(id) => !isPreviewMode && handleEditModule(id)}
                        isSelected={selectedModuleId === module.id && !isPreviewMode}
                        onOpenImagePicker={(callback) => {
                          setImagePickerCallback(() => callback);
                          setIsImagePickerOpen(true);
                        }}
                        config={config}
                        selectedProductIds={selectedProductIds}
                        isPreview={isPreviewMode}
                      />
                    </ModuleProvider>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {!isPreviewMode && (
              <div className="flex justify-center pt-8">
                <button 
                  onClick={() => setShowPicker(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-surface border border-text/10 text-text/60 font-bold rounded-2xl hover:bg-background hover:border-text/20 transition-all shadow-sm"
                >
                  <Plus className="w-5 h-5" />
                  Añadir Módulo
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
