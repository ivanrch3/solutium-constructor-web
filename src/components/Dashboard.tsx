import React from 'react';
import { PlusSquare, FileText, ExternalLink } from 'lucide-react';
import { Asset } from '../types/schema';
import { motion } from 'motion/react';

interface DashboardProps {
  assets: Asset[];
  onNewPage: () => void;
  onSelectAsset: (asset: Asset) => void;
  logoUrl?: string | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ assets, onNewPage, onSelectAsset, logoUrl }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 flex flex-col items-center">
      {/* Header Logo */}
      <div className="flex flex-col items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#E11D48] rounded-xl flex items-center justify-center shadow-lg shadow-rose-200">
            <FileText className="text-white w-7 h-7" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-[#1E293B] leading-tight">Constructor</h1>
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold text-[#1E293B]">Web</span>
              <span className="text-xs text-[#64748B] font-medium mt-1">by Solutium</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
        {/* Nueva Página Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col h-[380px]"
        >
          <h2 className="text-xl font-bold text-[#0F172A] mb-4">Nueva página</h2>
          <p className="text-base text-[#64748B] leading-relaxed mb-auto">
            Crea una nueva página desde cero con nuestro constructor web o utilizando inteligencia artificial.
          </p>
          
          <button 
            onClick={onNewPage}
            className="flex items-center justify-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-blue-100 w-fit group"
          >
            <PlusSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-base">Crear nuevo</span>
          </button>
        </motion.div>

        {/* Activos Existentes Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col h-[380px]"
        >
          <h2 className="text-xl font-bold text-[#0F172A] mb-6">Activos existentes</h2>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {assets.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {assets.map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => onSelectAsset(asset)}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-100 transition-colors">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#1E293B] group-hover:text-blue-600 transition-colors">{asset.name}</h3>
                        <p className="text-[11px] text-slate-400 font-medium">Actualizado el {new Date(asset.updated_at || '').toLocaleDateString()}</p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-400 space-y-3">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-slate-200" />
                </div>
                <p className="text-sm font-medium">No existen activos.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #CBD5E1;
        }
      `}} />
    </div>
  );
};
