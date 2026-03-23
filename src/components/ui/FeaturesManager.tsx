import React from 'react';
import { Layout, Image as ImageIcon, Link as LinkIcon, Plus, Trash2, Settings2, ChevronDown, AlignLeft, AlignCenter, AlignRight, Type, Sparkles } from 'lucide-react';
import { ColorPicker } from './ColorPicker';
import { PremiumBadge } from './PremiumBadge';

interface FeaturesManagerProps {
  data: any;
  onUpdate: (data: any) => void;
  onOpenImagePicker: (callback: (url: string) => void) => void;
  isPremiumUser?: boolean;
}

export const FeaturesManager = ({ data, onUpdate, onOpenImagePicker, isPremiumUser = false }: FeaturesManagerProps) => {
  const [expandedFeature, setExpandedFeature] = React.useState<number | null>(null);
  const features = data.features || [];

  const updateData = (newData: any) => {
    onUpdate({ ...data, ...newData });
  };

  const updateFeature = (index: number, key: string, value: any) => {
    const newFeatures = [...features];
    newFeatures[index] = { ...newFeatures[index], [key]: value };
    updateData({ features: newFeatures });
  };

  const updateFeatureStyle = (index: number, key: string, value: any) => {
    const newFeatures = [...features];
    newFeatures[index] = { 
      ...newFeatures[index], 
      iconStyle: { ...newFeatures[index].iconStyle, [key]: value } 
    };
    updateData({ features: newFeatures });
  };

  const addFeature = () => {
    const newFeature = {
      title: 'Nueva Característica',
      description: 'Descripción de la nueva característica.',
      icon: 'Zap',
      mediaType: 'icon',
      iconStyle: { shape: 'circle', type: 'solid' }
    };
    updateData({ features: [...features, newFeature] });
    setExpandedFeature(features.length);
  };

  const removeFeature = (index: number) => {
    const newFeatures = features.filter((_: any, i: number) => i !== index);
    updateData({ features: newFeatures });
    if (expandedFeature === index) setExpandedFeature(null);
  };

  const toggleFeature = (index: number) => {
    setExpandedFeature(expandedFeature === index ? null : index);
  };

  return (
    <div className="space-y-6">
      {/* Global Settings */}
      <div className="space-y-4">
        <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest flex items-center gap-2">
          <Settings2 className="w-3 h-3" /> Configuración Global
        </label>
        
        <div className="grid grid-cols-2 gap-2">
          <label className="flex items-center gap-2 p-2 bg-background border border-text/10 rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
            <input
              type="checkbox"
              checked={data.showIcons !== false}
              onChange={(e) => updateData({ showIcons: e.target.checked })}
              className="w-3.5 h-3.5 text-primary rounded border-text/20 focus:ring-primary"
            />
            <span className="text-[11px] font-medium text-text/80">Mostrar Iconos</span>
          </label>
          <label className="flex items-center gap-2 p-2 bg-background border border-text/10 rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
            <input
              type="checkbox"
              checked={data.showDescriptions !== false}
              onChange={(e) => updateData({ showDescriptions: e.target.checked })}
              className="w-3.5 h-3.5 text-primary rounded border-text/20 focus:ring-primary"
            />
            <span className="text-[11px] font-medium text-text/80">Mostrar Descripciones</span>
          </label>
        </div>
      </div>

      {/* Features List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest flex items-center gap-2">
            <Layout className="w-3 h-3" /> Elementos
          </label>
          <button
            onClick={addFeature}
            className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
            title="Añadir característica"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2">
          {features.map((feature: any, index: number) => (
            <div key={index} className="border border-text/10 rounded-xl overflow-hidden bg-background">
              <div 
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-text/5 transition-colors"
                onClick={() => toggleFeature(index)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <span className="text-xs font-bold text-text truncate max-w-[150px]">
                    {feature.title || 'Sin título'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFeature(index);
                    }}
                    className="p-1.5 text-text/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <ChevronDown className={`w-4 h-4 text-text/40 transition-transform ${expandedFeature === index ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {expandedFeature === index && (
                <div className="p-4 border-t border-text/10 space-y-4 bg-surface/50">
                  {/* Etiqueta */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest">Etiqueta (Opcional)</label>
                    <input
                      type="text"
                      value={feature.badge || ''}
                      onChange={(e) => updateFeature(index, 'badge', e.target.value)}
                      className="w-full p-2.5 bg-background border border-text/10 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none"
                      placeholder="Ej: Popular, Nuevo"
                    />
                  </div>

                  {/* Multimedia Type */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest">Tipo de Multimedia</label>
                    <div className="relative">
                      <select
                        value={feature.mediaType || 'icon'}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!isPremiumUser && val === 'image') return;
                          updateFeature(index, 'mediaType', val);
                        }}
                        className={`w-full p-2.5 bg-background border border-text/10 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none appearance-none ${!isPremiumUser ? 'opacity-80' : ''}`}
                      >
                        <option value="icon">Icono (Lucide)</option>
                        <option value="image" disabled={!isPremiumUser}>Imagen {!isPremiumUser ? '(PRO)' : ''}</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-text/40 pointer-events-none" />
                      {!isPremiumUser && feature.mediaType !== 'image' && (
                        <div className="absolute right-8 top-1/2 -translate-y-1/2">
                          <PremiumBadge inline />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Icon or Image */}
                  {feature.mediaType === 'image' ? (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest">Imagen</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={feature.image || ''}
                          onChange={(e) => updateFeature(index, 'image', e.target.value)}
                          className="flex-1 p-2.5 bg-background border border-text/10 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none"
                          placeholder="URL de la imagen"
                        />
                        <button
                          onClick={() => onOpenImagePicker((url) => updateFeature(index, 'image', url))}
                          className="p-2.5 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest">Nombre del Icono</label>
                        <input
                          type="text"
                          value={feature.icon || ''}
                          onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                          className="w-full p-2.5 bg-background border border-text/10 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none"
                          placeholder="Ej: Zap, Shield, Star"
                        />
                        <p className="text-[9px] text-text/40">Usa nombres de lucide.dev/icons</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest">Forma</label>
                          <div className="relative">
                            <select
                              value={feature.iconStyle?.shape || 'circle'}
                              onChange={(e) => updateFeatureStyle(index, 'shape', e.target.value)}
                              className="w-full p-2 bg-background border border-text/10 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none appearance-none"
                            >
                              <option value="circle">Círculo</option>
                              <option value="square">Cuadrado</option>
                              <option value="squircle">Squircle</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text/40 pointer-events-none" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest">Estilo</label>
                          <div className="relative">
                            <select
                              value={feature.iconStyle?.type || 'solid'}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (!isPremiumUser && val === 'gradient') return;
                                updateFeatureStyle(index, 'type', val);
                              }}
                              className="w-full p-2 bg-background border border-text/10 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none appearance-none"
                            >
                              <option value="solid">Sólido</option>
                              <option value="outlined">Contorno</option>
                              <option value="gradient" disabled={!isPremiumUser}>Degradado {!isPremiumUser ? '(PRO)' : ''}</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text/40 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Link */}
                  <div className="space-y-2 pt-2 border-t border-text/5">
                    <label className="text-[10px] font-bold text-text/40 uppercase tracking-widest flex items-center gap-2">
                      <LinkIcon className="w-3 h-3" /> Enlace (Opcional)
                    </label>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={feature.link?.text || ''}
                        onChange={(e) => updateFeature(index, 'link', { ...feature.link, text: e.target.value })}
                        className="w-full p-2.5 bg-background border border-text/10 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none"
                        placeholder="Texto del enlace (ej: Saber más)"
                      />
                      <input
                        type="text"
                        value={feature.link?.url || ''}
                        onChange={(e) => updateFeature(index, 'link', { ...feature.link, url: e.target.value })}
                        className="w-full p-2.5 bg-background border border-text/10 rounded-lg text-xs focus:ring-2 focus:ring-primary outline-none"
                        placeholder="URL (ej: https://... o #seccion)"
                      />
                    </div>
                  </div>

                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
