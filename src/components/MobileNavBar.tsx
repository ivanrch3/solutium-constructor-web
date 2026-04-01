import React from 'react';
import { Layout, Plus, Eye, Layers } from 'lucide-react';
import { motion } from 'motion/react';

export type MobileTab = 'constructor' | 'editor' | 'preview';

interface MobileNavBarProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}

export const MobileNavBar: React.FC<MobileNavBarProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'constructor' as const, label: 'Biblioteca', icon: Plus },
    { id: 'editor' as const, label: 'Edición', icon: Layers },
    { id: 'preview' as const, label: 'Vista Previa', icon: Eye },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-xl border-t border-text/10 px-6 py-3 pb-8 z-[100] md:hidden">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center gap-1 group"
            >
              <div className={`p-2 rounded-2xl transition-all duration-300 ${
                isActive 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' 
                  : 'text-text/40 hover:text-text/60'
              }`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 ${
                isActive ? 'text-primary' : 'text-text/30'
              }`}>
                {tab.label}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute -top-1 w-1 h-1 bg-primary rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
