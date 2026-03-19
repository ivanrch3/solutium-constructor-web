import React, { useState, useEffect, useContext } from 'react';
import { X, Type, MousePointer2, Layout, ChevronDown, ChevronRight, Settings2, Share2, Sparkles, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getModuleSchema } from '../modules/schema';
import { getModuleDefinition } from '../modules/registry';
import { TypographyManager } from './ui/TypographyManager';
import { ButtonManager } from './ui/ButtonManager';
import { StructureManager } from './ui/StructureManager';
import { SocialNetworksManager } from './ui/SocialNetworksManager';
import { AdvancedManager } from './ui/AdvancedManager';
import { HeaderManager } from './ui/HeaderManager';
import { ProductManager } from './ui/ProductManager';
import { SolutiumContext } from '../context/SatelliteContext';

interface PropertyInspectorProps {
  selectedModule: any;
  onUpdate: (id: string, data: any) => void;
  onClose: () => void;
  onOpenImagePicker: (callback: (url: string) => void) => void;
  sidebarCollapsed: boolean;
  layersExpanded: boolean;
  isPinned: boolean;
  onTogglePin: () => void;
}

export const PropertyInspector = ({ 
  selectedModule, 
  onUpdate, 
  onClose, 
  onOpenImagePicker,
  sidebarCollapsed,
  layersExpanded,
  isPinned,
  onTogglePin
}: PropertyInspectorProps) => {
  const [expandedSectionsByModule, setExpandedSectionsByModule] = useState<Record<string, Record<string, boolean>>>({});

  const satellite = useContext(SolutiumContext);
  const projectSocials = satellite?.payload?.projectData?.socials;

  const moduleId = selectedModule?.id || 'default';
  const expandedSections = expandedSectionsByModule[moduleId] || {
    text: true,
    buttons: false,
    structure: false,
    products: false,
    socials: false,
    advanced: false
  };

  const schema = selectedModule ? getModuleSchema(selectedModule.type) : null;

  // Extract text elements for the TypographyManager
  const textElements = schema
    ?.filter(f => {
      return f.type === 'text' || f.type === 'textarea' || (f.type === 'object' && f.itemSchema?.some(s => s.name === 'text'));
    })
    .map(f => {
      const isButton = f.type === 'object' && f.itemSchema?.some(s => s.name === 'url');
      
      // Determine if the element is "disabled" (e.g. showCTA is false)
      let isDisabled = false;
      if (selectedModule) {
        if (isButton) {
          // Common patterns for disabling buttons in modules
          if (f.name === 'cta' && selectedModule.data.showCTA === false) isDisabled = true;
          if (f.name === 'secondaryCta' && selectedModule.data.showSecondaryCTA === false) isDisabled = true;
          if (f.name === 'button' && selectedModule.data.showButton === false) isDisabled = true;
        }

        // Special case for Header logoText
        if (selectedModule.type === 'header' && f.name === 'logoText') {
          const logoType = selectedModule.data.logoType || 'inherited';
          if (logoType !== 'none') {
            isDisabled = true;
          }
        }

        // Special case for Footer logoText
        if (selectedModule.type === 'footer' && f.name === 'logoText') {
          const projectLogo = satellite?.payload?.projectData?.logoUrl;
          const logoSrc = selectedModule.data.logoImage || projectLogo;
          if (logoSrc) {
            isDisabled = true;
          }
        }
      }

      const cleanLabel = f.label.replace('Editor de textos - ', '');

      if (f.type === 'object') {
        return {
          key: `${f.name}.text`,
          label: cleanLabel,
          defaultText: selectedModule.defaultData?.[f.name]?.text || '',
          isButton,
          isDisabled
        };
      }
      return {
        key: f.name,
        label: cleanLabel,
        defaultText: selectedModule.defaultData?.[f.name] || '',
        isButton: false,
        isDisabled
      };
    }) || [];

  // Extract button elements for the ButtonManager
  const buttonElements = schema
    ?.filter(f => f.type === 'object' && f.itemSchema?.some(s => s.name === 'url'))
    .map(f => ({
      key: f.name,
      label: f.label
    })) || [];

  const toggleSection = (section: string) => {
    setExpandedSectionsByModule(prev => {
      const currentModuleSections = prev[moduleId] || { text: false, buttons: false, structure: false, socials: false, advanced: false };
      const isCurrentlyOpen = currentModuleSections[section];
      
      // If it's already open, close it.
      // If it's closed, open it and close all others.
      return {
        ...prev,
        [moduleId]: {
          text: section === 'text' ? !isCurrentlyOpen : false,
          buttons: section === 'buttons' ? !isCurrentlyOpen : false,
          structure: section === 'structure' ? !isCurrentlyOpen : false,
          socials: section === 'socials' ? !isCurrentlyOpen : false,
          advanced: section === 'advanced' ? !isCurrentlyOpen : false,
          products: section === 'products' ? !isCurrentlyOpen : false,
        }
      };
    });
  };

  const ModuleIcon = selectedModule ? (getModuleDefinition(selectedModule.type)?.icon || Settings2) : Settings2;

  return (
    <div className="flex flex-col min-h-0 pointer-events-auto flex-1">
      {/* Header */}
      <div className={`h-12 border-b border-text/10 flex items-center ${layersExpanded ? 'justify-between px-4' : 'justify-center'} bg-surface/50 backdrop-blur-sm z-20 flex-shrink-0`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#FF0080] rounded-lg flex items-center justify-center text-white shadow-lg shadow-[#FF0080]/20 flex-shrink-0">
            <ModuleIcon className="w-4 h-4" />
          </div>
          {layersExpanded && (
            <h3 className="font-bold text-text text-base capitalize tracking-tight whitespace-nowrap">
              {selectedModule ? (getModuleDefinition(selectedModule.type)?.label || selectedModule.type.replace('-', ' ')) : 'Propiedades'}
            </h3>
          )}
        </div>
      </div>

      {/* Sections Container */}
      <div className={`flex-1 overflow-y-auto custom-scrollbar ${layersExpanded ? 'px-6 py-6 space-y-8' : 'py-6 flex flex-col items-center'}`}>
        {selectedModule ? (
          layersExpanded ? (
            <>
              {selectedModule.type === 'header' ? (
                <HeaderManager 
                  module={selectedModule}
                  data={selectedModule.data || {}}
                  onUpdate={(newData) => onUpdate(selectedModule.id, newData)}
                  onOpenImagePicker={onOpenImagePicker}
                  textElements={textElements}
                />
              ) : (
                <>
                  {/* TEXT SECTION */}
              {textElements.length > 0 && (
                <div className="space-y-4">
                  <button 
                    onClick={() => toggleSection('text')}
                    className="w-full flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                        <Type className="w-3 h-3" />
                      </div>
                      <span className="text-[10px] font-black text-text/60 uppercase tracking-widest group-hover:text-primary transition-colors">
                        Editor de textos
                      </span>
                    </div>
                    {expandedSections.text ? <ChevronDown className="w-3 h-3 text-text/30" /> : <ChevronRight className="w-3 h-3 text-text/30" />}
                  </button>
                  
                  {expandedSections.text && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <TypographyManager 
                        module={selectedModule}
                        data={selectedModule.data || {}}
                        onUpdate={(newData) => onUpdate(selectedModule.id, newData)}
                        textElements={textElements}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* BUTTONS SECTION */}
              {buttonElements.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-text/5">
                  <button 
                    onClick={() => toggleSection('buttons')}
                    className="w-full flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                        <MousePointer2 className="w-3 h-3" />
                      </div>
                      <span className="text-[10px] font-black text-text/60 uppercase tracking-widest group-hover:text-primary transition-colors">
                        Configuración de Botones
                      </span>
                    </div>
                    {expandedSections.buttons ? <ChevronDown className="w-3 h-3 text-text/30" /> : <ChevronRight className="w-3 h-3 text-text/30" />}
                  </button>
                  
                  {expandedSections.buttons && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <ButtonManager 
                        data={selectedModule.data || {}}
                        onUpdate={(newData) => onUpdate(selectedModule.id, newData)}
                        buttonElements={buttonElements}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* STRUCTURE SECTION */}
              <div className="space-y-4 pt-4 border-t border-text/5">
                <button 
                  onClick={() => toggleSection('structure')}
                  className="w-full flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                      <Layout className="w-3 h-3" />
                    </div>
                    <span className="text-[10px] font-black text-text/60 uppercase tracking-widest group-hover:text-primary transition-colors">
                      Estructura y Fondo
                    </span>
                  </div>
                  {expandedSections.structure ? <ChevronDown className="w-3 h-3 text-text/30" /> : <ChevronRight className="w-3 h-3 text-text/30" />}
                </button>
                
                {expandedSections.structure && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <StructureManager 
                      data={selectedModule.data || {}}
                      onUpdate={(newData) => onUpdate(selectedModule.id, newData)}
                      onOpenImagePicker={onOpenImagePicker}
                      moduleType={selectedModule.type}
                    />
                  </div>
                )}
              </div>

              {/* PRODUCTS SECTION */}
              {selectedModule.type === 'product-showcase' && (
                <div className="space-y-4 pt-4 border-t border-text/5">
                  <button 
                    onClick={() => toggleSection('products')}
                    className="w-full flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                        <Package className="w-3 h-3" />
                      </div>
                      <span className="text-[10px] font-black text-text/60 uppercase tracking-widest group-hover:text-primary transition-colors">
                        Selección de Productos
                      </span>
                    </div>
                    {expandedSections.products ? <ChevronDown className="w-3 h-3 text-text/30" /> : <ChevronRight className="w-3 h-3 text-text/30" />}
                  </button>
                  
                  {expandedSections.products && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <ProductManager 
                        data={selectedModule.data || {}}
                        onUpdate={(newData) => onUpdate(selectedModule.id, newData)}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* SOCIAL NETWORKS SECTION */}
              {selectedModule.type === 'top-bar' && (
                <div className="space-y-4 pt-4 border-t border-text/5">
                  <button 
                    onClick={() => toggleSection('socials')}
                    className="w-full flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                        <Share2 className="w-3 h-3" />
                      </div>
                      <span className="text-[10px] font-black text-text/60 uppercase tracking-widest group-hover:text-primary transition-colors">
                        Redes Sociales
                      </span>
                    </div>
                    {expandedSections.socials ? <ChevronDown className="w-3 h-3 text-text/30" /> : <ChevronRight className="w-3 h-3 text-text/30" />}
                  </button>
                  
                  {expandedSections.socials && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <SocialNetworksManager 
                        data={selectedModule.data || {}}
                        onUpdate={(newData) => onUpdate(selectedModule.id, newData)}
                        projectSocials={projectSocials}
                      />
                    </div>
                  )}
                </div>
              )}
              {/* ADVANCED SECTION */}
              {selectedModule.type === 'top-bar' && (
                <div className="space-y-4 pt-4 border-t border-text/5">
                  <button 
                    onClick={() => toggleSection('advanced')}
                    className="w-full flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                        <Sparkles className="w-3 h-3" />
                      </div>
                      <span className="text-[10px] font-black text-text/60 uppercase tracking-widest group-hover:text-primary transition-colors">
                        Opciones Avanzadas
                      </span>
                    </div>
                    {expandedSections.advanced ? <ChevronDown className="w-3 h-3 text-text/30" /> : <ChevronRight className="w-3 h-3 text-text/30" />}
                  </button>
                  
                  {expandedSections.advanced && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <AdvancedManager 
                        data={selectedModule.data || {}}
                        onUpdate={(newData) => onUpdate(selectedModule.id, newData)}
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      ) : null
    ) : (
          <div className="flex flex-col items-center justify-center h-full text-text/30 py-10">
            <Settings2 className="w-8 h-8 mb-2" />
            {layersExpanded && <p className="text-[10px] font-bold uppercase tracking-widest">Selecciona un módulo</p>}
          </div>
        )}
      </div>
    </div>
  );
};

