import React from 'react';
import { 
  Layers, 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp, 
  ChevronDown, 
  Layout, 
  GripVertical, 
  Trash2,
  Link,
  Image as ImageIcon,
  Type,
  Database,
  Box,
  Star,
  MousePointer2,
  Settings,
  Sparkles,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EditorState, WebModule, ModuleElement, SettingGroupType } from '../../types/constructor';
import { Product, Customer } from '../../types/schema';
import { useEditorStore } from '../../store/editorStore';
import { MODULE_INFO, GROUP_LABELS, BENTO_MODULE } from './registry';
import { SettingControl } from './SettingControl';
import { GlobalSettingsPanel } from './GlobalSettingsPanel';

interface StructurePanelProps {
  editorState: EditorState;
  setEditorState: React.Dispatch<React.SetStateAction<EditorState>>;
  onSettingChange: (elementId: string, settingId: string, value: any) => void;
  onRemoveModule: (moduleId: string) => void;
  onMoveModule: (moduleId: string, direction: 'up' | 'down') => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  projectId: string | null;
  products?: Product[];
  customers?: Customer[];
  isMobile?: boolean;
  activeTab?: string;
}

export const StructurePanel: React.FC<StructurePanelProps> = ({ 
  editorState, 
  setEditorState, 
  onSettingChange, 
  onRemoveModule, 
  onMoveModule,
  isCollapsed,
  onToggleCollapse,
  projectId,
  products,
  customers,
  isMobile,
  activeTab = 'constructor'
}) => {
  const { siteContent } = useEditorStore();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [shiningGroup, setShiningGroup] = React.useState<string | null>(null);
  const [expandedBentoItem, setExpandedBentoItem] = React.useState<number | null>(null);
  const [expandedBentoGroup, setExpandedBentoGroup] = React.useState<string | null>(null);
  
  const shiningIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const shiningTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Effect to scroll to selected module/element
  React.useEffect(() => {
    if (isCollapsed) return;

    const targetId = editorState.selectedElementId 
      ? `structure_el_${editorState.selectedElementId}` 
      : editorState.expandedModuleId 
        ? `structure_mod_${editorState.expandedModuleId}` 
        : null;

    if (targetId) {
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300); // Wait for animations
    }
  }, [editorState.expandedModuleId, editorState.selectedElementId, isCollapsed]);

  // Effect to handle shining animation
  React.useEffect(() => {
    // Only start shining if:
    // 1. A module was recently added (recentlyAddedModuleId is set)
    // 2. It's one of the first 3 modules added (totalModulesAdded <= 3)
    // 3. No group is currently expanded
    const isRecentlyAdded = editorState.recentlyAddedModuleId === editorState.expandedModuleId;
    const isWithinFirstThree = (editorState.totalModulesAdded || 0) <= 3;

    if (editorState.expandedModuleId && editorState.selectedElementId && isRecentlyAdded && isWithinFirstThree) {
      const elementId = editorState.selectedElementId;
      const module = editorState.addedModules.find(m => m.id === editorState.expandedModuleId);
      const element = module?.elements.find(e => e.id === elementId) || 
                      (elementId.endsWith('_global') ? { id: elementId, groups: module?.globalGroups || [] } : null);

      const availableGroups = element?.groups || [];
      const currentExpandedGroup = editorState.expandedGroupsByElement[elementId];

      if (availableGroups.length > 0 && !currentExpandedGroup) {
        let currentIndex = 0;
        setShiningGroup(availableGroups[0]);

        if (shiningIntervalRef.current) clearInterval(shiningIntervalRef.current);
        if (shiningTimeoutRef.current) clearTimeout(shiningTimeoutRef.current);
        
        shiningIntervalRef.current = setInterval(() => {
          const nextIndex = Math.floor(Math.random() * availableGroups.length);
          setShiningGroup(availableGroups[nextIndex]);
        }, 1500);

        // Auto-stop after 5 seconds
        shiningTimeoutRef.current = setTimeout(() => {
          stopShining();
          // Clear recentlyAddedModuleId from state to prevent re-triggering
          setEditorState(prev => ({ ...prev, recentlyAddedModuleId: null }));
        }, 5000);
      } else {
        setShiningGroup(null);
        if (shiningIntervalRef.current) {
          clearInterval(shiningIntervalRef.current);
          shiningIntervalRef.current = null;
        }
        if (shiningTimeoutRef.current) {
          clearTimeout(shiningTimeoutRef.current);
          shiningTimeoutRef.current = null;
        }
      }
    } else {
      setShiningGroup(null);
      if (shiningIntervalRef.current) {
        clearInterval(shiningIntervalRef.current);
        shiningIntervalRef.current = null;
      }
      if (shiningTimeoutRef.current) {
        clearTimeout(shiningTimeoutRef.current);
        shiningTimeoutRef.current = null;
      }
    }

    return () => {
      if (shiningIntervalRef.current) clearInterval(shiningIntervalRef.current);
      if (shiningTimeoutRef.current) clearTimeout(shiningTimeoutRef.current);
    };
  }, [editorState.expandedModuleId, editorState.selectedElementId, editorState.expandedGroupsByElement, editorState.recentlyAddedModuleId, editorState.totalModulesAdded]);

  const stopShining = () => {
    setShiningGroup(null);
    if (shiningIntervalRef.current) {
      clearInterval(shiningIntervalRef.current);
      shiningIntervalRef.current = null;
    }
    if (shiningTimeoutRef.current) {
      clearTimeout(shiningTimeoutRef.current);
      shiningTimeoutRef.current = null;
    }
    // Also clear the flag in global state if it exists
    if (editorState.recentlyAddedModuleId) {
      setEditorState(prev => ({ ...prev, recentlyAddedModuleId: null }));
    }
  };

  // Extract project theme colors for the ColorPicker
  const getProjectColors = () => {
    const settings = editorState.settingsValues;
    const colors = [
      settings['global_theme_primary_color'],
      settings['global_theme_secondary_color'],
      settings['global_theme_accent_color'],
      settings['global_theme_background_color'],
      settings['global_theme_text_color'],
    ].filter(Boolean) as string[];
    
    // Add default solutium primary if not exists
    if (colors.length === 0) return ['#3B82F6', '#8B5CF6', '#1E293B'];
    
    return Array.from(new Set(colors));
  };

  const projectColors = getProjectColors();

  const toggleModule = (moduleId: string) => {
    stopShining();
    setEditorState(prev => ({
      ...prev,
      expandedModuleId: prev.expandedModuleId === moduleId ? null : moduleId
    }));
  };

  const toggleElement = (elementId: string) => {
    stopShining();
    setEditorState(prev => ({
      ...prev,
      selectedElementId: prev.selectedElementId === elementId ? null : elementId
    }));
  };

  const toggleGroup = (elementId: string, group: SettingGroupType) => {
    stopShining();
    setEditorState(prev => ({
      ...prev,
      expandedGroupsByElement: {
        ...prev.expandedGroupsByElement,
        [elementId]: prev.expandedGroupsByElement[elementId] === group ? null : group
      }
    }));
  };

  const toggleMenuLink = (moduleId: string, moduleLabel: string) => {
    const menuModule = editorState.addedModules.find(m => m.type === 'navegacion');
    if (!menuModule) return;

    const elementId = `${menuModule.id}_el_menu_items`;
    const currentLinks = editorState.settingsValues[`${elementId}_links`] || [];
    const anchor = `#${moduleId}`;
    const isLinked = currentLinks.some((l: any) => l.url === anchor);

    let newLinks;
    if (isLinked) {
      newLinks = currentLinks.filter((l: any) => l.url !== anchor);
    } else {
      const module = editorState.addedModules.find(m => m.id === moduleId);
      const iconKey = module?.iconKey || module?.type || '';
      newLinks = [...currentLinks, { label: moduleLabel, url: anchor, icon: iconKey }];
    }

    onSettingChange(elementId, 'links', newLinks);
  };

  const isModuleLinked = (moduleId: string) => {
    const menuModule = editorState.addedModules.find(m => m.type === 'navegacion');
    if (!menuModule) return false;
    const currentLinks = editorState.settingsValues[`${menuModule.id}_el_menu_items_links`] || [];
    return currentLinks.some((l: any) => l.url === `#${moduleId}`);
  };

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon size={12} />;
      case 'text': return <Type size={12} />;
      case 'price': return <Database size={12} />;
      case 'badge': return <Box size={12} />;
      case 'rating': return <Star size={12} />;
      case 'button': return <MousePointer2 size={12} />;
      case 'global': return <Settings size={12} />;
      default: return <Layers size={12} />;
    }
  };

  return (
    <div className={`h-full bg-surface border-r border-border flex flex-col z-30 shadow-xl shadow-text/10 overflow-hidden transition-all duration-300 ${isMobile ? 'w-full' : (isCollapsed ? 'w-[70px]' : 'w-80')}`}>
      <div className={`p-4 flex items-center border-b border-border/60 ${isCollapsed && !isMobile ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <Layers className="text-white w-3.5 h-3.5" />
          </div>
          {(!isCollapsed || isMobile) && <span className="text-sm font-bold text-text">Estructura</span>}
        </div>
        {!isMobile && (
          <button 
            onClick={onToggleCollapse}
            className="text-text/40 hover:text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors"
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
        {(activeTab === 'design-style' || activeTab === 'design-animations') ? (
          <div className="h-full">
            <GlobalSettingsPanel 
              view={activeTab as any}
              settingsValues={editorState.settingsValues}
              onSettingChange={onSettingChange}
              projectId={projectId}
              project={{ id: projectId || '', name: '', brandColors: { primary: '', secondary: '' } } as any} // Minimal project object or pass it correctly
              isSidebarMode={true}
            />
          </div>
        ) : (
          <>
            {(!siteContent.sections || siteContent.sections.length === 0) && (
          <div className={`p-8 text-center space-y-4 ${isCollapsed ? 'px-2' : ''}`}>
            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto">
              <Layout className="text-text/40 w-6 h-6" />
            </div>
            {!isCollapsed && <p className="text-[11px] font-semibold text-text/60">No hay módulos añadidos aún.</p>}
          </div>
        )}

        {(editorState.addedModules || []).map((module, index) => {
          const isModuleExpanded = editorState.expandedModuleId === module.id;
          const isHeader = module.id.startsWith('mod_header_1');
          const isMenu = module.id.startsWith('mod_menu_1');
          const isFooter = module.id.startsWith('mod_footer_1');

          const canMoveUp = index > 0 && !isMenu && !isFooter;
          const canMoveDown = index < (editorState.addedModules?.length || 0) - 1 && !isHeader && !isMenu;
          const hasMultipleModules = (editorState.addedModules?.length || 0) > 1;
          
          const moduleInfo = (module.iconKey && MODULE_INFO[module.iconKey]) || MODULE_INFO[module.type] || { icon: Layout, label: module.name };
          
          // Virtual element for global configuration
          const globalElement: ModuleElement = {
            id: module.id + '_global',
            name: 'Configuración Global',
            type: 'global',
            groups: module.globalGroups
          };

          const allElements = [globalElement, ...module.elements];
          const isBento = module.id.startsWith('mod_bento_1');

          return (
            <div 
              key={module.id} 
              id={`structure_mod_${module.id}`}
              className={`p-3 border-b border-border/30 last:border-0 ${isCollapsed ? 'px-2' : ''}`}
            >
              <div 
                onClick={() => !isCollapsed && toggleModule(module.id)}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer group ${
                  isModuleExpanded && !isCollapsed
                    ? 'bg-primary/10 border-primary/20' 
                    : 'bg-secondary/50 border-border/50 hover:border-border'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? moduleInfo.label : undefined}
              >
                {!isCollapsed && (
                  <>
                    {hasMultipleModules ? (
                      <div className="flex flex-col gap-0.5">
                        {canMoveUp && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); onMoveModule(module.id, 'up'); }}
                            className="p-0.5 rounded hover:bg-primary/20 transition-colors text-text/40 hover:text-primary"
                          >
                            <ChevronUp size={12} />
                          </button>
                        )}
                        {canMoveDown && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); onMoveModule(module.id, 'down'); }}
                            className="p-0.5 rounded hover:bg-primary/20 transition-colors text-text/40 hover:text-primary"
                          >
                            <ChevronDown size={12} />
                          </button>
                        )}
                      </div>
                    ) : (
                      <GripVertical className={isModuleExpanded ? 'text-primary/30' : 'text-text/20'} size={14} />
                    )}
                  </>
                )}
                
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  isModuleExpanded && !isCollapsed ? 'bg-primary' : 'bg-surface border border-border/50'
                }`}>
                  {React.createElement(moduleInfo.icon, { 
                    size: 12, 
                    className: isModuleExpanded && !isCollapsed ? 'text-white' : 'text-text/40' 
                  })}
                </div>
                
                {!isCollapsed && (
                  <>
                    <span className={`text-[14px] font-bold flex-1 truncate ${
                      isModuleExpanded ? 'text-primary' : 'text-text'
                    }`}>
                      {moduleInfo.label}
                    </span>

                    {module.type !== 'navegacion' && editorState.addedModules.some(m => m.type === 'navegacion') && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMenuLink(module.id, moduleInfo.label);
                        }}
                        className={`p-1.5 rounded-lg transition-all ${
                          isModuleLinked(module.id) 
                            ? 'text-primary bg-primary/10 opacity-100' 
                            : 'text-text/20 hover:text-primary hover:bg-primary/5 opacity-0 group-hover:opacity-100'
                        }`}
                        title={isModuleLinked(module.id) ? "Quitar del menú" : "Agregar al menú"}
                      >
                        <Link size={14} />
                      </button>
                    )}
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveModule(module.id);
                      }}
                      className="p-1.5 text-text/20 hover:text-error hover:bg-error/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Eliminar módulo"
                    >
                      <Trash2 size={14} />
                    </button>

                    <ChevronDown size={14} className={`text-text/20 transition-transform ${isModuleExpanded ? 'rotate-180 text-primary' : ''}`} />
                  </>
                )}
              </div>

              {/* Bento Toolbox */}
              <AnimatePresence>
                {isModuleExpanded && isBento && !isCollapsed && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 mb-2 p-3 bg-primary/5 rounded-2xl border border-primary/10 overflow-hidden"
                  >
                    <div className="flex items-center gap-2 mb-3">
                       <Sparkles className="text-primary w-3 h-3" />
                       <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Bento Toolbox</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { type: 'text', label: 'Texto', icon: <Type size={14} /> },
                        { type: 'image', label: 'Imagen', icon: <ImageIcon size={14} /> },
                        { type: 'icon_text', label: 'Feature', icon: <Sparkles size={14} /> },
                        { type: 'stat', label: 'Dato', icon: <Database size={14} /> },
                        { type: 'cta', label: 'Botón', icon: <MousePointer2 size={14} /> },
                        { type: 'video', label: 'Video', icon: <Play size={14} /> }
                      ].map((item) => (
                        <div
                          key={item.type}
                          draggable={true}
                          unselectable="on"
                          onDragStart={(e) => {
                            e.dataTransfer.setData("text/plain", ""); // Required for FF
                            // Store the bento item type in a global or pass it via dataTransfer if RGL allows
                            (window as any)._draggingBentoType = item.type;
                          }}
                          onClick={() => {
                            const bentoItems = editorState.settingsValues[`${module.id}_el_bento_items_items`] || [];
                            const newItem = {
                              type: item.type,
                              title: item.type === 'stat' ? '99+' : (item.type === 'cta' ? '¡Únete ahora!' : 'Nuevo Bloque'),
                              description: 'Personaliza este bloque desde el panel de ajustes.',
                              col_span: item.type === 'image' || item.type === 'video' ? 6 : 4,
                              row_span: item.type === 'image' || item.type === 'video' ? 4 : 2,
                              x: (bentoItems.length * 4) % 12, // Simple placement logic
                              y: Infinity, // Add to bottom
                              card_style: 'solid',
                              card_radius: 28,
                              padding: 32,
                              content_align: 'center',
                              icon: item.type === 'stat' ? 'Zap' : 'Sparkles',
                              button_text: 'Explorar'
                            };
                            
                            const newItems = [...bentoItems, newItem];
                            onSettingChange(`${module.id}_el_bento_items`, 'items', newItems);
                            
                            // Auto-expand the newly added layer
                            setTimeout(() => {
                              setExpandedBentoItem(newItems.length - 1);
                            }, 100);
                          }}
                          className="droppable-element flex items-center gap-2 p-2 bg-surface border border-border/50 rounded-xl cursor-copy hover:border-primary/30 hover:shadow-md transition-all active:scale-95 group"
                          title="Haz clic o arrastra para añadir"
                        >
                          <div className="text-text/40 group-hover:text-primary transition-colors">
                            {item.icon}
                          </div>
                          <span className="text-[10px] font-bold text-text/60 group-hover:text-text transition-colors">
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[9px] text-text/40 mt-3 text-center italic border-b border-border/20 pb-4">Arrastra una pieza al Bento para construirlo</p>

                    {/* Bento Layers Navigator (Internal Structure) */}
                    <div className="mt-4 space-y-2">
                       <div className="flex items-center gap-2 mb-2">
                          <Layers className="text-primary w-3 h-3" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-text/60">Capas del Bento</span>
                       </div>
                       
                       {(() => {
                         // Look for the definition in the registry to ensure settings are always available
                         const bentoModuleId = module.type;
                         // Accessing registry info if available or falling back to module elements
                         const bentoItemsElement = module.elements.find(e => e.id === 'el_bento_items');
                         const bentoItems = editorState.settingsValues[`${module.id}_el_bento_items_items`] || [];
                         
                         if (bentoItems.length === 0) {
                           return <div className="p-4 border border-dashed border-border rounded-xl text-center text-[10px] text-text/40">No hay capas todavía</div>;
                         }

                         // Helper to organize items automatically
                         const organizeAutomatically = () => {
                            const sortedItems = [...bentoItems].sort((a, b) => {
                               if (a.y !== b.y) return a.y - b.y;
                               return a.x - b.x;
                            });
                            
                            // Re-calculate positions to be compact
                            let currentY = 0;
                            let currentX = 0;
                            const organizedItems = sortedItems.map((item) => {
                               const newItem = { ...item, x: currentX, y: currentY };
                               currentX += item.col_span;
                               if (currentX >= 12) {
                                  currentX = 0;
                                  currentY += 2; // Assuming default row height logic
                               }
                               return newItem;
                            });
                            onSettingChange(`${module.id}_el_bento_items`, 'items', organizedItems);
                         };

                         return (
                           <>
                             <button 
                               onClick={organizeAutomatically}
                               className="w-full flex items-center justify-center gap-2 p-2 mb-4 bg-primary/10 text-primary rounded-xl text-[10px] font-bold hover:bg-primary/20 transition-all border border-primary/20"
                             >
                                <Sparkles size={12} />
                                Organizar Automáticamente
                             </button>
                             
                             {bentoItems.map((item: any, itemIndex: number) => {
                               const isItemExpanded = expandedBentoItem === itemIndex;
                               const IconComponent = item.type === 'text' ? Type : 
                                                   item.type === 'image' ? ImageIcon : 
                                                   item.type === 'video' ? Play :
                                                   item.type === 'cta' ? MousePointer2 :
                                                   item.type === 'stat' ? Database : Sparkles;

                               const itemGroups: SettingGroupType[] = ['contenido', 'estructura', 'estilo', 'tipografia', 'multimedia', 'interaccion'].filter(g => {
                                  if (g === 'tipografia' && !['text', 'stat', 'icon_text', 'cta', 'image'].includes(item.type)) return false;
                                  if (g === 'multimedia' && !['image', 'video', 'text'].includes(item.type)) return false;
                                  return true;
                               }) as SettingGroupType[];

                               return (
                                 <div key={itemIndex} className="space-y-1">
                                    <div 
                                      onClick={() => setExpandedBentoItem(isItemExpanded ? null : itemIndex)}
                                      className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all cursor-pointer ${
                                        isItemExpanded ? 'bg-primary/5 border-primary/20' : 'bg-surface border-border/30 hover:border-border'
                                      }`}
                                    >
                                       <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                         isItemExpanded ? 'bg-primary text-white' : 'bg-secondary text-text/40'
                                       }`}>
                                         <IconComponent size={14} />
                                       </div>
                                       <div className="flex-1 min-w-0">
                                          <p className={`text-[11px] font-bold truncate ${isItemExpanded ? 'text-primary' : 'text-text'}`}>
                                            {item.admin_label || item.title || `Capa ${itemIndex + 1}`}
                                          </p>
                                          <p className="text-[9px] text-text/40 uppercase font-medium">{item.type}</p>
                                       </div>
                                       <ChevronDown size={14} className={`text-text/20 transition-transform ${isItemExpanded ? 'rotate-180 text-primary' : ''}`} />
                                    </div>

                                    <AnimatePresence>
                                      {isItemExpanded && (
                                        <motion.div 
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: 'auto', opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          className="ml-3 border-l-2 border-primary/20 pl-3 py-2 space-y-1.5 overflow-hidden"
                                        >
                                           {itemGroups.map(group => {
                                             const isGroupExpanded = expandedBentoGroup === `${itemIndex}_${group}`;
                                             // Robust lookup in BENTO_MODULE registry
                                             const bentoSettings = (BENTO_MODULE.elements.find(e => e.id === 'el_bento_items')?.settings as any) || {};
                                             const settingsForGroup = bentoSettings[group] || [];
                                             
                                             return (
                                               <div key={group} className="space-y-1">
                                                  <button 
                                                    onClick={() => setExpandedBentoGroup(isGroupExpanded ? null : `${itemIndex}_${group}`)}
                                                    className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${
                                                      isGroupExpanded ? 'bg-surface border border-border/50 shadow-sm' : 'hover:bg-secondary'
                                                    }`}
                                                  >
                                                    <span className={`text-[10px] tracking-wide ${isGroupExpanded ? 'font-bold text-primary' : 'font-medium text-text/60'}`}>
                                                      {GROUP_LABELS[group]}
                                                    </span>
                                                    <ChevronDown size={10} className={`text-text/20 transition-transform ${isGroupExpanded ? 'rotate-180 text-primary' : ''}`} />
                                                  </button>

                                                  <AnimatePresence>
                                                    {isGroupExpanded && (
                                                      <motion.div 
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="p-3 bg-surface rounded-xl border border-border/30 shadow-inner space-y-4"
                                                      >
                                                         {settingsForGroup.map((setting: any) => (
                                                            <SettingControl
                                                              key={setting.id}
                                                              setting={setting}
                                                              value={item[setting.id] ?? setting.defaultValue}
                                                              onChange={(value) => {
                                                                const newItems = [...bentoItems];
                                                                newItems[itemIndex] = { ...newItems[itemIndex], [setting.id]: value };
                                                                onSettingChange(`${module.id}_el_bento_items`, 'items', newItems);
                                                              }}
                                                              projectId={projectId}
                                                              products={products}
                                                              customers={customers}
                                                              projectColors={projectColors}
                                                            />
                                                         ))}
                                                      </motion.div>
                                                    )}
                                                  </AnimatePresence>
                                               </div>
                                             );
                                           })}
                                           
                                           <button 
                                              onClick={() => {
                                                const newItems = bentoItems.filter((_: any, idx: number) => idx !== itemIndex);
                                                onSettingChange(`${module.id}_el_bento_items`, 'items', newItems);
                                                setExpandedBentoItem(null);
                                              }}
                                              className="w-full flex items-center justify-center gap-2 p-2 mt-2 text-[10px] font-bold text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                                           >
                                              <Trash2 size={12} />
                                              Eliminar Capa
                                           </button>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                 </div>
                               );
                             })}
                           </>
                         );
                       })()}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Elements List */}
              <AnimatePresence>
                {isModuleExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-2 ml-4 border-l-2 border-border/30 pl-3 space-y-1.5 overflow-hidden"
                  >
                    {allElements.map(element => {
                      const isElementSelected = editorState.selectedElementId === element.id;
                      
                      return (
                        <div 
                          key={element.id} 
                          id={`structure_el_${element.id}`}
                          className="space-y-1"
                        >
                          <div 
                            onClick={() => toggleElement(element.id)}
                            className={`flex items-center gap-2.5 p-2 rounded-lg border transition-all cursor-pointer ${
                              isElementSelected 
                                ? 'bg-primary/5 border-primary/20' 
                                : 'bg-transparent border-transparent hover:bg-secondary'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                              isElementSelected ? 'bg-primary/20 text-primary' : 'bg-secondary text-text/40'
                            }`}>
                              {getElementIcon(element.type)}
                            </div>
                            <span className={`text-[11px] font-medium flex-1 ${
                              isElementSelected ? 'text-primary' : 'text-text/60'
                            }`}>
                              {element.name}
                            </span>
                            <ChevronDown size={12} className={`text-text/20 transition-transform ${isElementSelected ? 'rotate-180 text-primary' : ''}`} />
                          </div>

                          {/* Inline Configuration Groups */}
                          <AnimatePresence>
                            {isElementSelected && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="ml-2 space-y-1 overflow-hidden pb-2"
                              >
                                {(Object.keys(GROUP_LABELS) as SettingGroupType[]).map(group => {
                                  const isAvailable = element.groups.includes(group);
                                  const hasSettings = element.type === 'global' 
                                    ? !!module.globalSettings?.[group]?.length 
                                    : !!element.settings?.[group]?.length;
                                  
                                  if (!isAvailable || !hasSettings) return null;

                                  const isGroupExpanded = editorState.expandedGroupsByElement[element.id] === group;
                                  const isShining = shiningGroup === group;

                                  return (
                                    <div key={group} className={`border rounded-lg bg-surface overflow-hidden shadow-sm transition-all duration-500 ${
                                      isShining ? 'border-primary shadow-[0_0_15px_rgba(59,130,246,0.5)] ring-1 ring-primary/30' : 'border-border/30'
                                    }`}>
                                      <button 
                                        onClick={() => toggleGroup(element.id, group)}
                                        className={`w-full flex items-center justify-between p-2 hover:bg-secondary transition-colors relative overflow-hidden ${
                                          isShining ? 'bg-primary/5' : ''
                                        }`}
                                      >
                                        {isShining && (
                                          <motion.div 
                                            initial={{ x: '-100%' }}
                                            animate={{ x: '200%' }}
                                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/2 skew-x-[-20deg]"
                                          />
                                        )}
                                        <span className={`text-[12px] transition-all relative z-10 ${
                                          isGroupExpanded || isShining ? 'font-bold text-primary' : 'font-normal text-text/60'
                                        }`}>
                                          {GROUP_LABELS[group]}
                                        </span>
                                        <ChevronDown size={10} className={`text-text/20 transition-transform relative z-10 ${isGroupExpanded ? 'rotate-180 text-primary' : ''}`} />
                                      </button>
                                      
                                      <AnimatePresence>
                                        {isGroupExpanded && (
                                          <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                          >
                                            <div className="p-3 pt-0 space-y-4 border-t border-border/30 mt-1">
                                              {/* DYNAMIC SETTINGS FOR EACH GROUP */}
                                              {(() => {
                                                const evaluateCondition = (condition: any, currentSettings: Record<string, any>, prefix: string) => {
                                                  if (!condition) return { result: true };
                                                  
                                                  // Try with prefix first (element-specific), then without (global/module-wide)
                                                  let val = currentSettings[`${prefix}_${condition.settingId}`];
                                                  if (val === undefined) {
                                                    // Fallback to global setting of the same module if prefix is element-based
                                                    const modulePrefix = prefix.split('_').slice(0, 3).join('_') + '_global';
                                                    val = currentSettings[`${modulePrefix}_${condition.settingId}`];
                                                  }
                                                  
                                                  const op = condition.operator || 'eq';
                                                  let result = false;

                                                  switch (op) {
                                                    case 'eq': result = val === condition.value; break;
                                                    case 'neq': result = val !== condition.value; break;
                                                    case 'includes': result = Array.isArray(val) && val.includes(condition.value); break;
                                                    case 'not_includes': result = !Array.isArray(val) || !val.includes(condition.value); break;
                                                  }

                                                  return { result, message: condition.message };
                                                };

                                                const settingsToRender = element.type === 'global' 
                                                  ? module.globalSettings?.[group] 
                                                  : element.settings?.[group];

                                                return settingsToRender?.map(setting => {
                                                  const prefix = element.id;
                                                  const show = evaluateCondition(setting.showIf, editorState.settingsValues, prefix);
                                                  if (!show.result) return null;

                                                  const disabled = evaluateCondition(setting.disabledIf, editorState.settingsValues, prefix);
                                                  const finalSetting = {
                                                    ...setting,
                                                    disabledMessage: !disabled.result ? undefined : (disabled.message || setting.disabledMessage)
                                                  };

                                                  return (
                                                    <SettingControl 
                                                      key={setting.id} 
                                                      setting={finalSetting} 
                                                      value={editorState.settingsValues[`${prefix}_${setting.id}`]}
                                                      onChange={(val) => onSettingChange(prefix, setting.id, val)}
                                                      projectId={projectId}
                                                      products={products}
                                                      customers={customers}
                                                      projectColors={projectColors}
                                                    />
                                                  );
                                                });
                                              })()}
                                              
                                              {/* Fallback if no settings defined for this group */}
                                              {((element.type === 'global' && !module.globalSettings?.[group]?.length) || 
                                                (element.type !== 'global' && !element.settings?.[group]?.length)) && (
                                                <p className="text-[10px] text-text/40 italic pt-2">No hay opciones disponibles para este grupo.</p>
                                              )}
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
          </>
        )}
      </div>
    </div>
  );
};
