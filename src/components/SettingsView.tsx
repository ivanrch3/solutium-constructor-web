import React, { useState } from 'react';
import { Settings, Globe, CheckCircle, Clock, Tag, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsViewProps {
  activeProject: any;
  activeAsset: any;
  config: any;
  assetSettings: any;
  selectedProductIds: string[];
  updateAssetSettings: (settings: any) => void;
  updateAssetName: (name: string) => void;
  updateSelectedProducts: (ids: string[]) => void;
  setActiveTab: (tab: string) => void;
  onSave: () => void;
  isSaving: boolean;
  isDirty: boolean;
  autoSaveInterval: number;
  setAutoSaveInterval: (interval: number) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  activeProject,
  activeAsset,
  config,
  assetSettings,
  selectedProductIds,
  updateAssetSettings,
  updateAssetName,
  updateSelectedProducts,
  setActiveTab,
  onSave,
  isSaving,
  isDirty,
  autoSaveInterval,
  setAutoSaveInterval
}) => {
  const [activeSettingsTab, setActiveSettingsTab] = useState<'general' | 'domain'>('general');
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      const currentTags = assetSettings.tags || [];
      if (!currentTags.includes(tagInput.trim())) {
        updateAssetSettings({ tags: [...currentTags, tagInput.trim()] });
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = assetSettings.tags || [];
    updateAssetSettings({ tags: currentTags.filter((t: string) => t !== tagToRemove) });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-2">
            <Settings className="w-3 h-3" />
            Ajustes del Activo
          </div>
          <h3 className="text-3xl font-black text-text mb-1">{activeAsset?.name || 'Configuración'}</h3>
          <p className="text-text/60">Configura las opciones específicas para este activo del proyecto.</p>
        </div>
      </div>

      {/* Settings Sub-tabs */}
      <div className="flex items-center gap-1 p-1 bg-surface rounded-2xl mb-8 w-fit">
        {[
          { id: 'general', label: 'General', icon: Settings },
          { id: 'domain', label: 'Dominio', icon: Globe },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSettingsTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeSettingsTab === tab.id
                ? 'bg-background text-primary shadow-sm'
                : 'text-text/60 hover:text-text/80'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeSettingsTab === 'general' && (
          <motion.div
            key="general"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 gap-6"
          >
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <Edit3 className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-text">Información del Activo</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-text/40 uppercase tracking-wider mb-2">Nombre del Activo</label>
                  <input 
                    type="text" 
                    value={activeAsset?.name || ''} 
                    onChange={(e) => updateAssetName(e.target.value)}
                    placeholder="Nombre del activo..."
                    className="w-full px-4 py-3 bg-background border border-text/10 rounded-xl text-text focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text/40 uppercase tracking-wider mb-2">Tipo de Activo</label>
                  <div className="px-4 py-3 bg-background border border-text/10 rounded-xl text-text/60 capitalize">
                    {(activeAsset as any)?.type || 'N/A'}
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-text/40 uppercase tracking-wider mb-2">Etiquetas (Tags)</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(assetSettings.tags || []).map((tag: string) => (
                      <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="hover:text-primary/70">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text/30" />
                    <input 
                      type="text" 
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder="Escribe una etiqueta y pulsa Enter..."
                      className="w-full pl-11 pr-4 py-3 bg-background border border-text/10 rounded-xl text-text focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-text">Autoguardado Automático</h4>
              </div>
              
              <p className="text-sm text-text/60 mb-6">
                Selecciona cada cuánto tiempo quieres que la aplicación guarde automáticamente tus cambios como borrador.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: '1 Minuto', value: 60000 },
                  { label: '3 Minutos', value: 180000 },
                  { label: '5 Minutos', value: 300000 },
                  { label: '10 Minutos', value: 600000 },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setAutoSaveInterval(option.value)}
                    className={`px-4 py-3 rounded-xl text-sm font-bold transition-all border ${
                      autoSaveInterval === option.value
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                        : 'bg-surface border-text/10 text-text/60 hover:border-primary/30 hover:text-primary'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeSettingsTab === 'domain' && (
          <motion.div
            key="domain"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary mb-6">
                <Globe className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-text mb-2">Dominio y SEO</h4>
              <p className="text-sm text-text/60 mb-8 leading-relaxed">
                Configura cómo se verá tu tienda en los buscadores y conecta tu dominio propio para una imagen profesional.
              </p>
              
              <div className="space-y-6">
                <div className="p-6 bg-background rounded-2xl border border-text/10">
                  <h5 className="font-bold text-text mb-4">Dominio Personalizado</h5>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="ejemplo.com"
                      value={assetSettings.domain}
                      onChange={(e) => {
                        updateAssetSettings({ domain: e.target.value });
                      }}
                      className="flex-1 px-4 py-3 bg-surface border border-text/10 rounded-xl text-text/70 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                    <button 
                      onClick={onSave}
                      disabled={isSaving || !isDirty}
                      className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                  <p className="mt-4 text-xs text-text/40">
                    Asegúrate de configurar los registros A y CNAME en tu proveedor de dominio.
                  </p>
                </div>

                <div className="p-6 bg-background rounded-2xl border border-text/10">
                  <h5 className="font-bold text-text mb-4">Configuración SEO</h5>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-text/40 uppercase tracking-wider mb-2">Título de la Página</label>
                      <input 
                        type="text" 
                        placeholder="Mi Increíble Tienda"
                        value={assetSettings.seoTitle}
                        onChange={(e) => {
                          updateAssetSettings({ seoTitle: e.target.value });
                        }}
                        className="w-full px-4 py-3 bg-surface border border-text/10 rounded-xl text-text/70 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text/40 uppercase tracking-wider mb-2">Meta Descripción</label>
                      <textarea 
                        rows={3}
                        placeholder="Describe brevemente tu negocio para los buscadores..."
                        value={assetSettings.seoDescription}
                        onChange={(e) => {
                          updateAssetSettings({ seoDescription: e.target.value });
                        }}
                        className="w-full px-4 py-3 bg-surface border border-text/10 rounded-xl text-text/70 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

