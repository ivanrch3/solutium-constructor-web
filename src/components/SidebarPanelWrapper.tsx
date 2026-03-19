import React, { useState, useEffect } from 'react';
import { LayersPanel } from './LayersPanel';
import { PropertyInspector } from './PropertyInspector';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarPanelWrapperProps {
  modules: any[];
  onReorder: (newModules: any[]) => void;
  onRemove: (id: string) => void;
  onSelect: (id: string, source: 'canvas' | 'structure') => void;
  onEdit: (id: string | null) => void;
  selectedModuleId: string | null;
  editingModuleId: string | null;
  isSidebarCollapsed: boolean;
  isPinned: boolean;
  onTogglePin: () => void;
  updateModule: (id: string, data: any) => void;
  onOpenImagePicker: (callback: (url: string) => void) => void;
}

export const SidebarPanelWrapper: React.FC<SidebarPanelWrapperProps> = ({
  modules,
  onReorder,
  onRemove,
  onSelect,
  onEdit,
  selectedModuleId,
  editingModuleId,
  isSidebarCollapsed,
  isPinned,
  onTogglePin,
  updateModule,
  onOpenImagePicker
}) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isPinned) {
      setIsSidebarExpanded(true);
    } else {
      setIsSidebarExpanded(false);
    }
  }, [isPinned]);

  const handleSelectFromStructure = (id: string) => {
    onSelect(id, 'structure');
  };

  return (
    <div 
      onMouseEnter={() => !isPinned && setIsSidebarExpanded(true)}
      onMouseLeave={() => !isPinned && setIsSidebarExpanded(false)}
      className={`flex flex-col transition-all duration-300 z-[80] bg-surface border border-text/10 shadow-2xl rounded-[1.5rem] overflow-hidden ${
      isPinned
        ? 'h-full flex-shrink-0 relative' 
        : 'absolute pointer-events-auto'
    }`}
    style={{
      width: isSidebarExpanded ? (windowWidth <= 768 ? 'calc(100vw - 32px)' : '320px') : '64px',
      left: isPinned ? undefined : (windowWidth <= 768 ? '16px' : (isSidebarCollapsed ? '80px' : '256px')),
      top: isPinned ? undefined : (windowWidth <= 768 ? '80px' : '0px'),
      bottom: isPinned ? undefined : (windowWidth <= 768 ? '16px' : '0px')
    }}
    >
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex-[0_1_auto] max-h-[40%] flex flex-col min-h-0">
          <LayersPanel 
            modules={modules}
            onReorder={onReorder}
            onRemove={onRemove}
            onSelect={handleSelectFromStructure}
            onEdit={onEdit}
            onUpdate={updateModule}
            selectedModuleId={selectedModuleId}
            isPinned={isPinned}
            onTogglePin={onTogglePin}
            sidebarCollapsed={isSidebarCollapsed}
            onHover={() => {}}
            layersExpanded={isSidebarExpanded}
          />
        </div>
        
        <div className="flex-1 flex flex-col min-h-0">
          <PropertyInspector 
            selectedModule={modules.find(m => m.id === editingModuleId) || null}
            onUpdate={updateModule}
            onClose={() => onEdit(null)}
            onOpenImagePicker={onOpenImagePicker}
            sidebarCollapsed={isSidebarCollapsed}
            layersExpanded={isSidebarExpanded}
            isPinned={isPinned}
            onTogglePin={onTogglePin}
          />
        </div>
        
        {/* Spacer to push panels up and create empty space at the bottom */}
        <div className="h-20 flex-shrink-0" />
      </div>
    </div>
  );
};
