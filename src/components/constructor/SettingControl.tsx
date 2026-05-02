import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Image as ImageIcon,
  Upload,
  Loader2,
  Check,
  X,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Italic,
  Underline,
  Strikethrough,
  CheckCircle2,
  Plus,
  Trash2
} from 'lucide-react';
import { SettingDefinition } from '../../types/constructor';
import { Product, Customer } from '../../types/schema';
import { syncAsset } from '../../services/assetService';
import { TYPOGRAPHY_SCALE, FONT_WEIGHTS } from '../../constants/typography';
import { MOCK_PRODUCTS, MOCK_CUSTOMERS } from '../../constants/mockData';

interface SettingControlProps {
  setting: SettingDefinition;
  value: any;
  onChange: (value: any) => void;
  projectId: string | null;
  products?: Product[];
  customers?: Customer[];
  projectColors?: string[]; // New prop for theme colors
}

// --- REFACTORED COLOR PICKER COMPONENTS ---

const PRESET_COLORS = [
  '#3B82F6', '#2563EB', '#1D4ED8', // Blues
  '#10B981', '#059669', '#047857', // Greens
  '#F59E0B', '#D97706', '#B45309', // Ambers
  '#EF4444', '#DC2626', '#B91C1C', // Reds
  '#8B5CF6', '#7C3AED', '#6D28D9', // Purples
  '#EC4899', '#DB2777', '#BE185D', // Pinks
  '#000000', '#1E293B', '#475569', '#94A3B8', '#F8FAFC', '#FFFFFF' // Neutrals
];

const InlineColorPicker = ({ value, onChange, label, projectColors }: { value: string, onChange: (v: string) => void, label?: string, projectColors?: string[] }) => {
  return (
    <div className="space-y-3 p-3 bg-secondary/30 rounded-2xl border border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
      {label && <p className="text-[10px] font-black text-text/30 uppercase tracking-widest">{label}</p>}
      
      {/* Project Colors Section */}
      {projectColors && projectColors.length > 0 && (
        <div className="space-y-2 pb-2 border-b border-border/30">
          <p className="text-[8px] font-bold text-primary uppercase tracking-tighter">Colores del Proyecto</p>
          <div className="flex flex-wrap gap-1.5">
            {projectColors.map((color, idx) => (
              <button
                key={`${color}-${idx}`}
                onClick={() => onChange(color)}
                className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 active:scale-95 shadow-sm ${
                  value?.toLowerCase() === color.toLowerCase() 
                    ? 'border-primary ring-2 ring-primary/20 scale-110 z-10' 
                    : 'border-white hover:border-primary/30'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-6 gap-1.5 pt-1">
        {PRESET_COLORS.map(color => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={`w-full aspect-square rounded-lg border transition-all hover:scale-110 active:scale-95 ${
              value?.toLowerCase() === color.toLowerCase() 
                ? 'border-primary ring-2 ring-primary/20 scale-110 z-10 shadow-sm' 
                : 'border-black/5 hover:border-black/20'
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      <div className="flex items-center gap-3 pt-1 border-t border-border/30">
        <div className="relative group">
          <input 
            type="color" 
            value={value?.startsWith('#') ? value : '#3B82F6'} 
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-none p-0 overflow-hidden"
          />
          <div className="absolute inset-0 pointer-events-none rounded-xl border border-black/10 shadow-inner group-hover:border-primary/30 transition-colors" />
        </div>
        <div className="flex-1">
          <input 
            type="text" 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
            className="w-full bg-transparent text-sm font-mono font-black focus:outline-none uppercase"
          />
          <p className="text-[9px] text-text/40 font-medium">Personalizado (HEX)</p>
        </div>
      </div>
    </div>
  );
};

export const SettingControl: React.FC<SettingControlProps> = ({ 
  setting, 
  value, 
  onChange, 
  projectId, 
  products, 
  customers,
  projectColors
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const currentValue = value !== undefined ? value : setting.defaultValue;

  const isDisabled = setting.disabledMessage !== undefined;

  // Helpers for Gradient parsing
  const parseGradient = (grad: string) => {
    // Expected: linear-gradient(135deg, #color1 0%, #color2 100%)
    const match = grad.match(/linear-gradient\((\d+)deg,\s*(#[a-fA-F0-9]{6}|[a-fA-F0-9]{3})\s*\d+%,\s*(#[a-fA-F0-9]{6}|[a-fA-F0-9]{3})\s*\d+%\)/);
    if (match) {
      return { angle: parseInt(match[1]), color1: match[2], color2: match[3] };
    }
    return { angle: 135, color1: '#3B82F6', color2: '#8B5CF6' };
  };

  const stringifyGradient = (angle: number, c1: string, c2: string) => {
    return `linear-gradient(${angle}deg, ${c1} 0%, ${c2} 100%)`;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    const file = e.target.files?.[0];
    if (!file || !projectId) return;

    setIsUploading(true);
    try {
      const extension = file.name.split('.').pop() || 'png';
      const { url } = await syncAsset(
        { id: `asset_${Date.now()}`, projectId, metadata: { fileName: file.name } },
        'image',
        file,
        extension,
        file.type,
        file.name
      );
      onChange(url);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  switch (setting.type) {
    case 'product_selection':
    case 'customer_selection':
      const isProduct = setting.type === 'product_selection';
      const availableItems = isProduct 
        ? ((products && products.length > 0) ? products : (projectId === 'dev-project-id' ? MOCK_PRODUCTS : []))
        : ((customers && customers.length > 0) ? customers : (projectId === 'dev-project-id' ? MOCK_CUSTOMERS : []));
      
      return (
        <div className={`space-y-3 ${isDisabled ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-text/40 uppercase tracking-wider">{setting.label}</label>
            {isDisabled && <span className="text-[8px] font-bold text-red-500/60 italic">{setting.disabledMessage}</span>}
          </div>
          <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {availableItems.map((item: any) => {
              const isSelected = Array.isArray(currentValue) && currentValue.includes(item.id);
              const imageUrl = isProduct ? item.imageUrl : item.companyLogoUrl;
              
              return (
                <div 
                  key={item.id}
                  onClick={() => {
                    const newValue = isSelected 
                      ? (currentValue as string[]).filter(id => id !== item.id)
                      : [...(currentValue as string[] || []), item.id];
                    onChange(newValue);
                  }}
                  className={`flex items-center gap-3 p-2 rounded-xl border transition-all cursor-pointer group ${
                    isSelected 
                      ? 'bg-primary/10 border-primary/20 shadow-sm' 
                      : 'bg-surface border-border hover:border-border/80'
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0 border border-border/30">
                    {imageUrl ? (
                      <img src={imageUrl} alt={item.name} className={`w-full h-full ${isProduct ? 'object-cover' : 'object-contain p-1'}`} referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text/20">
                        <ImageIcon size={16} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-bold truncate ${isSelected ? 'text-primary' : 'text-text'}`}>
                       {item.name}
                    </p>
                    <p className="text-[10px] text-text/40 font-medium">
                      {isProduct ? `$${item.price}` : (item.company || 'Cliente')}
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                    isSelected ? 'bg-primary border-primary' : 'bg-surface border-border group-hover:border-border/80'
                  }`}>
                    {isSelected && <CheckCircle2 size={12} className="text-white" />}
                  </div>
                </div>
              );
            })}
            {availableItems.length === 0 && (
              <div className="p-6 text-center bg-secondary rounded-xl border border-dashed border-border">
                <p className="text-[10px] text-text/40 font-medium">No hay {isProduct ? 'productos' : 'clientes'} disponibles.</p>
              </div>
            )}
          </div>
        </div>
      );
    case 'image':
      return (
        <div className={`space-y-2 ${isDisabled ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-text/40">{setting.label}</label>
            {isDisabled && <span className="text-[8px] font-bold text-red-500/60 italic">{setting.disabledMessage}</span>}
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-secondary border border-border overflow-hidden flex-shrink-0 shadow-inner">
                {currentValue ? (
                  <img src={currentValue} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text/20">
                    <ImageIcon size={20} />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="relative">
                   <input 
                    type="text" 
                    value={currentValue || ''} 
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Pega la URL de la imagen aquí..."
                    className="w-full pl-8 pr-3 py-2 border border-border rounded-xl text-[10px] font-medium focus:outline-none focus:border-primary/50 bg-white shadow-sm transition-all" 
                  />
                  <LucideIcons.Globe size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text/30" />
                </div>
                <p className="text-[9px] text-text/30">Se recomienda usar URLs seguras (https)</p>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <div className="relative">
                   <button 
                    disabled={isUploading || isDisabled}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-dashed border-border rounded-xl text-[10px] font-bold bg-secondary/30 text-text/60 hover:bg-secondary/50 hover:border-primary/30 transition-all overflow-hidden"
                  >
                    {isUploading ? (
                      <Loader2 size={12} className="animate-spin text-primary" />
                    ) : (
                      <Upload size={12} />
                    )}
                    {isUploading ? 'Subiendo...' : 'Subir Archivo'}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                  </button>
                </div>
              </div>
              {currentValue && (
                <button 
                  onClick={() => onChange('')}
                  className="px-3 py-2 bg-red-50 text-red-500 border border-red-100 rounded-xl hover:bg-red-100 transition-colors"
                  title="Liminar imagen"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      );
    case 'range':
      return (
        <div className={`space-y-1.5 ${isDisabled ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-text/40">{setting.label}</label>
            <div className="flex items-center gap-2">
              {isDisabled && <span className="text-[8px] font-bold text-red-500/60 italic">{setting.disabledMessage}</span>}
              <span className="text-[10px] font-medium text-primary">{currentValue}{setting.unit}</span>
            </div>
          </div>
          <input 
            type="range" 
            min={setting.min} 
            max={setting.max} 
            step={setting.step || 1}
            value={currentValue}
            disabled={isDisabled}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary" 
          />
        </div>
      );
    case 'select':
      return (
        <div className={`space-y-1.5 ${isDisabled ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-text/40">{setting.label}</label>
            {isDisabled && <span className="text-[8px] font-bold text-red-500/60 italic">{setting.disabledMessage}</span>}
          </div>
          <select 
            value={currentValue}
            disabled={isDisabled}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-1.5 border border-border rounded-md text-[10px] font-medium focus:outline-none focus:border-primary/30 bg-surface"
          >
            {setting.options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      );
    case 'boolean':
      return (
        <div className={`flex items-center justify-between p-1.5 bg-secondary rounded-md ${isDisabled ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-text/60">{setting.label}</span>
            {isDisabled && <span className="text-[8px] font-bold text-red-500/60 italic">{setting.disabledMessage}</span>}
          </div>
          <button 
            disabled={isDisabled}
            onClick={() => onChange(!currentValue)}
            className={`w-7 h-3.5 rounded-full relative transition-colors ${currentValue ? 'bg-primary' : 'bg-secondary-foreground/20'}`}
          >
            <div className={`absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full shadow-sm transition-all ${currentValue ? 'left-4' : 'left-0.5'}`}></div>
          </button>
        </div>
      );
    case 'color':
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-text/40 uppercase tracking-wider">{setting.label}</label>
            <button 
              onClick={() => setShowPicker(!showPicker)}
              className={`group flex items-center gap-2 px-3 py-1.5 bg-surface border rounded-xl transition-all ${
                showPicker ? 'border-primary shadow-sm bg-primary/5' : 'border-border hover:border-border/80'
              }`}
            >
              <div 
                className="w-4 h-4 rounded-full border border-black/5 shadow-inner" 
                style={{ backgroundColor: currentValue }} 
              />
              <span className="text-[11px] font-mono font-bold text-text/60 leading-none">{currentValue}</span>
              {showPicker ? <LucideIcons.ChevronUp size={12} className="text-primary" /> : <LucideIcons.ChevronDown size={12} className="text-text/30" />}
            </button>
          </div>
          
          {showPicker && (
            <InlineColorPicker value={currentValue} onChange={onChange} projectColors={projectColors} />
          )}
        </div>
      );
    case 'gradient':
      const gradData = parseGradient(currentValue);
      const isSafeGradient = (val: any) => typeof val === 'string' && !val.includes('NaN');
      const safeGradientValue = isSafeGradient(currentValue) ? currentValue : stringifyGradient(135, '#3B82F6', '#8B5CF6');

      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-text/40 uppercase tracking-wider">{setting.label}</label>
            <button 
              onClick={() => setShowPicker(!showPicker)}
              className="px-2 py-1 text-[9px] font-bold bg-secondary hover:bg-secondary/80 text-text/60 rounded transition-colors"
            >
              {showPicker ? 'Cerrar' : 'Configurar'}
            </button>
          </div>
          <div 
            className="w-full h-8 rounded-xl border border-border shadow-inner cursor-pointer overflow-hidden transition-transform active:scale-95"
            style={{ background: safeGradientValue }}
            onClick={() => setShowPicker(!showPicker)}
          />
          
          {showPicker && (
            <div className="space-y-4 p-4 bg-secondary/30 rounded-2xl border border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
               <div className="space-y-3">
                 <InlineColorPicker 
                   label="Color 1 (Inicial)"
                   value={gradData.color1} 
                   onChange={(c) => onChange(stringifyGradient(gradData.angle, c, gradData.color2))} 
                   projectColors={projectColors}
                 />
                 <InlineColorPicker 
                   label="Color 2 (Final)"
                   value={gradData.color2} 
                   onChange={(c) => onChange(stringifyGradient(gradData.angle, gradData.color1, c))} 
                   projectColors={projectColors}
                 />
               </div>

               <div className="pt-2">
                 <div className="flex items-center justify-between mb-2">
                   <label className="text-[10px] font-black text-text/30 uppercase tracking-widest">Ángulo</label>
                   <span className="text-[10px] font-bold text-primary">{gradData.angle}°</span>
                 </div>
                 <input 
                   type="range" 
                   min="0" 
                   max="360"
                   value={gradData.angle}
                   onChange={(e) => onChange(stringifyGradient(Number(e.target.value), gradData.color1, gradData.color2))}
                   className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                 />
               </div>

               <div className="pt-3 border-t border-border/30">
                 <p className="text-[10px] font-black text-text/30 uppercase tracking-widest mb-2">Vista Previa</p>
                 <div 
                   className="w-full h-12 rounded-xl border border-black/10 shadow-lg"
                   style={{ background: stringifyGradient(gradData.angle, gradData.color1, gradData.color2) }}
                 />
               </div>
            </div>
          )}
        </div>
      );
    case 'icon':
      const [searchTerm, setSearchTerm] = useState('');
      const ALL_ICON_NAMES = Object.keys(LucideIcons).filter(name => 
        typeof (LucideIcons as any)[name] === 'function' || 
        (typeof (LucideIcons as any)[name] === 'object' && (LucideIcons as any)[name].$$typeof)
      );
      
      const filteredIcons = searchTerm 
        ? ALL_ICON_NAMES.filter(name => name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 100)
        : ALL_ICON_NAMES.slice(0, 60); // Show a subset initially for performance
      
      const SelectedIconComp = currentValue ? (LucideIcons as any)[currentValue] : null;

      return (
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text/40 uppercase tracking-wider">{setting.label}</label>
          
          <div className="relative">
            <button
              onClick={() => setShowPicker(!showPicker)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                showPicker ? 'border-primary bg-primary/5' : 'border-border bg-surface hover:border-border/80'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${currentValue ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-secondary text-text/20'}`}>
                {SelectedIconComp ? <SelectedIconComp size={20} /> : <Plus size={20} />}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-[11px] font-bold text-text truncate">
                  {currentValue || 'Seleccionar Ícono'}
                </p>
                <p className="text-[9px] text-text/40 font-medium">
                  {showPicker ? 'Cerrar selector' : 'Click para cambiar'}
                </p>
              </div>
              {currentValue && (
                <div 
                  onClick={(e) => { e.stopPropagation(); onChange(''); }}
                  className="p-1.5 hover:bg-red-50 text-text/30 hover:text-red-500 rounded-lg transition-colors"
                >
                  <X size={14} />
                </div>
              )}
            </button>

            <AnimatePresence>
              {showPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute left-0 right-0 top-full mt-2 z-50 p-3 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
                >
                  <div className="mb-3 px-1">
                    <input 
                      type="text" 
                      placeholder="Buscar ícono..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full p-2 text-[10px] border border-slate-100 rounded-lg bg-slate-50 focus:outline-none focus:border-primary/30"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="grid grid-cols-6 gap-2 max-h-[240px] overflow-y-auto custom-scrollbar pr-1">
                    {filteredIcons.map(iconName => {
                      const IconComp = (LucideIcons as any)[iconName];
                      const isSelected = currentValue === iconName;
                      return (
                        <button
                          key={iconName}
                          onClick={() => {
                            onChange(iconName);
                            setShowPicker(false);
                            setSearchTerm('');
                          }}
                          title={iconName}
                          className={`aspect-square flex items-center justify-center rounded-lg transition-all ${
                            isSelected 
                              ? 'bg-primary text-white shadow-md shadow-primary/20 scale-110 z-10' 
                              : 'bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 border border-slate-100'
                          }`}
                        >
                          {IconComp ? <IconComp size={16} /> : <span className="text-[8px]">{iconName}</span>}
                        </button>
                      );
                    })}
                  </div>
                  {filteredIcons.length === 0 && (
                    <div className="py-8 text-center">
                      <p className="text-[10px] text-slate-400">No se encontraron íconos.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      );

    case 'repeater':
      const items = Array.isArray(currentValue) ? currentValue : [];
      return (
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-text/40 uppercase tracking-wider">{setting.label}</label>
          <div className="space-y-2">
            {items.map((item: any, index: number) => (
              <div key={index} className="p-3 bg-secondary/30 border border-border rounded-xl space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-text/40">Item #{index + 1}</span>
                  <button 
                    onClick={() => {
                      const newItems = [...items];
                      newItems.splice(index, 1);
                      onChange(newItems);
                    }}
                    className="text-text/40 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="space-y-3">
                  {setting.fields?.map(field => (
                    <SettingControl 
                      key={field.id}
                      setting={field}
                      value={item[field.id]}
                      projectId={projectId}
                      products={products}
                      customers={customers}
                      onChange={(val) => {
                        const newItems = [...items];
                        newItems[index] = { ...item, [field.id]: val };
                        onChange(newItems);
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
            {!setting.disableAdd && (
              <button 
                onClick={() => {
                  const newItem: any = {};
                  setting.fields?.forEach(f => {
                    newItem[f.id] = f.defaultValue;
                  });
                  onChange([...items, newItem]);
                }}
                className="w-full py-2 bg-surface border border-dashed border-border rounded-xl text-[10px] font-bold text-primary hover:bg-primary/5 hover:border-primary/20 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={14} /> Agregar Item
              </button>
            )}
          </div>
        </div>
      );
    case 'button':
      return (
        <div className="p-2 bg-primary/5 border border-primary/10 rounded-lg">
          <p className="text-[10px] font-bold text-primary mb-2">{setting.label}</p>
          <button className="w-full py-1.5 bg-surface border border-primary/20 rounded-md text-[10px] font-bold text-primary hover:bg-primary/10 transition-all flex items-center justify-center gap-1.5">
            <Plus size={12} /> {setting.defaultValue}
          </button>
        </div>
      );
    case 'typography_size':
      const levels = setting.allowedLevels || ['t1', 't2', 't3', 'p', 's'];
      return (
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text/40 uppercase tracking-wider">{setting.label}</label>
          <div className="flex flex-wrap gap-1">
            {levels.map((level: any) => {
              const info = TYPOGRAPHY_SCALE[level as keyof typeof TYPOGRAPHY_SCALE];
              const isSelected = currentValue === level;
              return (
                <button
                  key={level}
                  onClick={() => onChange(level)}
                  className={`flex-1 min-w-[45px] py-2 px-1 rounded-lg border text-[10px] font-bold transition-all ${
                    isSelected 
                      ? 'bg-primary text-white border-primary shadow-sm' 
                      : 'bg-surface text-text/60 border-border hover:border-border/80'
                  }`}
                  title={info?.label}
                >
                  {level.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>
      );
    case 'font_weight':
      return (
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text/40 uppercase tracking-wider">{setting.label}</label>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(FONT_WEIGHTS).map(([key, info]) => {
              const isSelected = currentValue === key;
              return (
                <button
                  key={key}
                  onClick={() => onChange(key)}
                  className={`py-1.5 px-2 rounded-lg border text-[10px] transition-all text-left flex items-center justify-between ${
                    isSelected 
                      ? 'bg-primary/10 border-primary/30 text-primary font-bold' 
                      : 'bg-surface border-border text-text/60 hover:border-border/80'
                  }`}
                >
                  <span style={{ fontWeight: info.value }}>{info.label}</span>
                  {isSelected && <Check size={10} />}
                </button>
              );
            })}
          </div>
        </div>
      );
    case 'text_align':
      const alignments = [
        { id: 'left', icon: <AlignLeft size={14} /> },
        { id: 'center', icon: <AlignCenter size={14} /> },
        { id: 'right', icon: <AlignRight size={14} /> },
        { id: 'justify', icon: <AlignJustify size={14} /> }
      ];
      return (
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text/40 uppercase tracking-wider">{setting.label}</label>
          <div className="flex bg-secondary/50 p-1 rounded-xl border border-border/50">
            {alignments.map(align => {
              const isSelected = currentValue === align.id;
              return (
                <button
                  key={align.id}
                  onClick={() => onChange(align.id)}
                  className={`flex-1 flex items-center justify-center py-1.5 rounded-lg transition-all ${
                    isSelected 
                      ? 'bg-surface text-primary shadow-sm border border-border/30' 
                      : 'text-text/40 hover:text-text/60'
                  }`}
                >
                  {align.icon}
                </button>
              );
            })}
          </div>
        </div>
      );
    case 'text_decoration':
      const decorations = [
        { id: 'italic', icon: <Italic size={14} />, label: 'Itálica' },
        { id: 'underline', icon: <Underline size={14} />, label: 'Subrayado' },
        { id: 'strikethrough', icon: <Strikethrough size={14} />, label: 'Tachado' }
      ];
      const currentDecorations = Array.isArray(currentValue) ? currentValue : [];
      return (
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text/40 uppercase tracking-wider">{setting.label}</label>
          <div className="flex gap-1.5">
            {decorations.map(dec => {
              const isSelected = currentDecorations.includes(dec.id);
              return (
                <button
                  key={dec.id}
                  onClick={() => {
                    const newValue = isSelected 
                      ? currentDecorations.filter(id => id !== dec.id)
                      : [...currentDecorations, dec.id];
                    onChange(newValue);
                  }}
                  className={`flex-1 flex items-center justify-center py-2 rounded-xl border transition-all ${
                    isSelected 
                      ? 'bg-primary/10 border-primary/20 text-primary shadow-sm' 
                      : 'bg-surface border-border text-text/40 hover:border-border/80'
                  }`}
                  title={dec.label}
                >
                  {dec.icon}
                </button>
              );
            })}
          </div>
        </div>
      );
    case 'toggle_group':
      return (
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text/40 uppercase tracking-wider">{setting.label}</label>
          <div className="flex bg-secondary/50 p-1 rounded-xl border border-border/50">
            {setting.options?.map(opt => {
              const isSelected = currentValue === opt.value;
              const IconComp = opt.icon ? (LucideIcons as any)[opt.icon] : null;
              return (
                <button
                  key={opt.value}
                  onClick={() => onChange(opt.value)}
                  className={`flex-1 flex items-center justify-center py-1.5 px-2 rounded-lg transition-all text-[10px] font-bold ${
                    isSelected 
                      ? 'bg-surface text-primary shadow-sm border border-border/30' 
                      : 'text-text/40 hover:text-text/60'
                  }`}
                >
                  {IconComp ? <IconComp size={14} className="mr-1" /> : null}
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      );
    case 'textarea':
      return (
        <div className={`space-y-1.5 ${isDisabled ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-text/40">{setting.label}</label>
            {isDisabled && <span className="text-[8px] font-bold text-red-500/60 italic">{setting.disabledMessage}</span>}
          </div>
          <textarea 
            value={currentValue} 
            disabled={isDisabled}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            className="w-full p-2 border border-border rounded-xl text-[10px] font-medium focus:outline-none focus:border-primary/30 bg-surface min-h-[80px] resize-none" 
          />
        </div>
      );
    case 'text':
    default:
      return (
        <div className={`space-y-1.5 ${isDisabled ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-text/40">{setting.label}</label>
            {isDisabled && <span className="text-[8px] font-bold text-red-500/60 italic">{setting.disabledMessage}</span>}
          </div>
          <input 
            type="text" 
            value={currentValue} 
            disabled={isDisabled}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-1.5 border border-border rounded-md text-[10px] font-medium focus:outline-none focus:border-primary/30 bg-surface" 
          />
        </div>
      );
  }
};
