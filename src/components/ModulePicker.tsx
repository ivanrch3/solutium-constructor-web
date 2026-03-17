import React, { useState } from 'react';
import { MODULE_REGISTRY } from '../modules/registry';
import { ChevronDown } from 'lucide-react';

const CATEGORY_LABELS: Record<string, string> = {
  'navigation': 'Navegación y Estructura',
  'main-content': 'Contenido Principal',
  'social-proof': 'Confianza y Equipo',
  'sales': 'Ventas y Conversión',
  'contact': 'Contacto y Soporte'
};

export const ModulePicker = ({ onAdd }: { onAdd: (moduleId: string) => void }) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Group modules by category
  const groupedModules = MODULE_REGISTRY.reduce((acc, module) => {
    const category = module.category || 'main-content';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(module);
    return acc;
  }, {} as Record<string, typeof MODULE_REGISTRY>);

  // Define the order of categories
  const categoryOrder = ['navigation', 'main-content', 'social-proof', 'sales', 'contact'];

  return (
    <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
      {categoryOrder.map((category) => {
        const modules = groupedModules[category];
        if (!modules || modules.length === 0) return null;

        const is_expanded = !!expandedCategories[category];

        return (
          <div key={category} className="border border-text/5 rounded-2xl overflow-hidden bg-surface/30">
            <button 
              type="button"
              onClick={() => toggleCategory(category)}
              className="flex items-center gap-4 w-full p-4 group text-left cursor-pointer hover:bg-primary/5 transition-colors"
            >
              <div className={`p-1.5 rounded-lg bg-primary/10 text-primary transition-transform duration-300 ${is_expanded ? 'rotate-0' : '-rotate-90'}`}>
                <ChevronDown className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-black text-primary uppercase tracking-[0.2em] whitespace-nowrap">
                {CATEGORY_LABELS[category]}
              </h2>
              <div className="h-px w-full bg-primary/10" />
            </button>
            
            {is_expanded && (
              <div className="p-4 pt-0 border-t border-text/5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                  {modules.map((module) => (
                    <button
                      key={module.id}
                      type="button"
                      onClick={() => onAdd(module.id)}
                      className="group flex flex-col items-start p-5 bg-background border border-text/10 rounded-2xl hover:border-primary hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 text-left w-full"
                    >
                      <div className="w-12 h-12 bg-surface group-hover:bg-primary/10 rounded-xl flex items-center justify-center text-text/40 group-hover:text-primary mb-4 transition-colors">
                        <module.icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-text mb-1 group-hover:text-primary transition-colors text-sm">{module.label}</h3>
                      <p className="text-xs text-text/60 leading-relaxed line-clamp-2">{module.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

