import React from 'react';
import { Settings, Database, Sparkles, ChevronDown, Layout } from 'lucide-react';
import { motion } from 'motion/react';

interface MobileHeaderProps {
  projectName: string;
  assetName: string;
  onOpenSettings: () => void;
  onOpenData: () => void;
  onOpenAi: () => void;
  onOpenAssetSelector: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  projectName,
  assetName,
  onOpenSettings,
  onOpenData,
  onOpenAi,
  onOpenAssetSelector
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-surface/80 backdrop-blur-xl border-b border-text/10 px-4 py-3 z-[100] md:hidden">
      <div className="flex items-center justify-between gap-2">
        {/* AI Action */}
        <button
          onClick={onOpenAi}
          className="p-2.5 bg-primary/10 text-primary rounded-2xl hover:bg-primary hover:text-white transition-all active:scale-95"
          title="Generar con IA"
        >
          <Sparkles className="w-5 h-5" />
        </button>

        {/* Project/Asset Selector */}
        <button
          onClick={onOpenAssetSelector}
          className="flex-1 flex flex-col items-center justify-center min-w-0 px-2"
        >
          <span className="text-[9px] font-black text-text/30 uppercase tracking-[0.2em] truncate w-full text-center">
            {projectName}
          </span>
          <div className="flex items-center gap-1 max-w-full">
            <span className="text-xs font-bold text-text truncate">
              {assetName}
            </span>
            <ChevronDown className="w-3 h-3 text-text/40 flex-shrink-0" />
          </div>
        </button>

        {/* Management Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenData}
            className="p-2.5 text-text/40 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all active:scale-95"
            title="Datos"
          >
            <Database className="w-5 h-5" />
          </button>
          <button
            onClick={onOpenSettings}
            className="p-2.5 text-text/40 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all active:scale-95"
            title="Ajustes"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
