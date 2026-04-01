import React, { useState } from 'react';
import { getModuleDefinition } from '../modules/registry';
import { 
  Layers, 
  GripVertical, 
  Trash2, 
  ChevronRight, 
  Layout,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Link,
  Unlink
} from 'lucide-react';
import { motion, Reorder, AnimatePresence, useDragControls } from 'motion/react';

interface LayersPanelProps {
  modules: any[];
  onReorder: (newModules: any[]) => void;
  onRemove: (id: string) => void;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  selectedModuleId: string | null;
  isPinned: boolean;
  onTogglePin: () => void;
  sidebarCollapsed: boolean;
  onHover: (hovered: boolean) => void;
  onUpdate: (id: string, data: any) => void;
  layersExpanded: boolean;
}

const LayerItem = ({ module, selectedModuleId, onSelect, onRemove, onUpdate, layersExpanded }: { module: any, selectedModuleId: string | null, onSelect: (id: string) => void, onRemove: (id: string) => void, onUpdate: (id: string, data: any) => void, layersExpanded: boolean, key?: any }) => {
  const dragControls = useDragControls();
  const Icon = getModuleDefinition(module.type)?.icon || Layout;
  const isHidden = module.data?.isHidden;

  return (
    <Reorder.Item
      value={module}
      dragListener={false}
      dragControls={dragControls}
      className={`
        group flex items-center transition-all
        ${layersExpanded ? 'gap-3 p-3 rounded-xl w-full' : 'justify-center p-2 rounded-lg w-12 h-12'}
        ${selectedModuleId === module.id ? 'bg-primary/5 border-primary/20 shadow-sm' : 'hover:bg-background border-transparent'}
        border
      `}
      onClick={() => onSelect(module.id)}
    >
      <div className={`flex items-center ${layersExpanded ? 'gap-3 flex-1 min-w-0' : 'justify-center'}`}>
        {layersExpanded ? (
          <div 
            onPointerDown={(e) => dragControls.start(e)}
            className="cursor-grab active:cursor-grabbing touch-none p-1 -ml-1"
          >
            <GripVertical className="w-4 h-4 text-text/30" />
          </div>
        ) : null}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
          selectedModuleId === module.id ? 'bg-primary text-white' : 'bg-background text-text/40'
        }`}>
          <Icon className="w-4 h-4" />
        </div>
        {layersExpanded && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-text truncate capitalize select-none">
              {getModuleDefinition(module.type)?.label || module.type}
            </p>
          </div>
        )}
      </div>

      {layersExpanded && (
        <div className={`flex items-center gap-1 transition-opacity ${selectedModuleId === module.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <button 
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onUpdate(module.id, { isHidden: !isHidden });
            }}
            className={`p-1.5 rounded-md transition-colors ${isHidden ? 'text-text/30 hover:text-text/60' : 'text-text/60 hover:text-text'}`}
            title={isHidden ? "Mostrar módulo" : "Ocultar módulo"}
          >
            {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
          
          {!['top-bar', 'header', 'footer', 'spacer'].includes(module.type) && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onUpdate(module.id, { hiddenInMenu: !module.data?.hiddenInMenu });
              }}
              className={`p-1.5 rounded-md transition-colors ${
                !module.data?.hiddenInMenu
                  ? 'text-primary hover:bg-primary/10'
                  : 'text-text/30 hover:text-text/60 hover:bg-text/5'
              }`}
              title={!module.data?.hiddenInMenu ? "Ocultar del menú de navegación" : "Mostrar en el menú de navegación"}
            >
              {!module.data?.hiddenInMenu ? <Link className="w-3.5 h-3.5" /> : <Unlink className="w-3.5 h-3.5" />}
            </button>
          )}

          <button 
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onRemove(module.id);
            }}
            className="p-1.5 text-text/40 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Eliminar módulo"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </Reorder.Item>
  );
};

export const LayersPanel = ({ 
  modules, 
  onReorder, 
  onRemove, 
  onSelect, 
  onEdit, 
  selectedModuleId,
  isPinned,
  onTogglePin,
  sidebarCollapsed,
  onHover,
  onUpdate,
  layersExpanded
}: LayersPanelProps) => {
  return (
    <div className="flex flex-col min-h-0 pointer-events-auto border-b border-text/5">
      {/* Header */}
      <div className={`h-12 flex items-center ${layersExpanded ? 'justify-between px-4' : 'justify-center'} border-b border-text/5 flex-shrink-0 bg-surface/50 backdrop-blur-sm`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FF0080] rounded-lg flex items-center justify-center text-white shadow-lg shadow-[#FF0080]/20 flex-shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          {layersExpanded && (
            <h3 className="font-bold text-text text-base whitespace-nowrap">
              Estructura
            </h3>
          )}
        </div>
        
        {layersExpanded && (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin();
              }}
              className={`p-1.5 rounded-md transition-colors ${
                isPinned 
                  ? 'bg-primary/10 text-primary hover:bg-primary/20' 
                  : 'text-text/40 hover:text-text hover:bg-text/5'
              }`}
              title={isPinned ? "Desfijar panel" : "Fijar panel"}
            >
              {isPinned ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      {/* Modules List */}
      <div className={`flex-1 overflow-y-auto custom-scrollbar ${layersExpanded ? 'p-4' : 'py-4 flex flex-col items-center'}`}>
          {modules.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-text/30 py-10">
              <Layout className="w-8 h-8 mb-2" />
              {layersExpanded && <p className="text-[10px] font-bold uppercase tracking-widest">Lienzo Vacío</p>}
            </div>
          ) : (
            <Reorder.Group axis="y" values={modules} onReorder={onReorder} className={`space-y-2 ${layersExpanded ? 'w-full' : 'w-12'}`}>
              {modules.map((module) => (
                <LayerItem 
                  key={module.id} 
                  module={module} 
                  selectedModuleId={selectedModuleId} 
                  onSelect={(id) => {
                    onSelect(id);
                  }}
                  onRemove={onRemove} 
                  onUpdate={onUpdate}
                  layersExpanded={layersExpanded}
                />
              ))}
            </Reorder.Group>
          )}
        </div>
    </div>
  );
};
