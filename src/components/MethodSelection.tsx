import React from 'react';
import { Sparkles, Layout, PlusSquare, FileText, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export type CreationMethod = 'ai' | 'template' | 'scratch';

interface MethodSelectionProps {
  onSelect: (method: CreationMethod) => void;
  onBack: () => void;
}

export const MethodSelection: React.FC<MethodSelectionProps> = ({ onSelect, onBack }) => {
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

      <h2 className="text-2xl font-bold text-[#0F172A] mb-12 text-center">¿Cómo quieres crear tu página?</h2>

      {/* Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-12">
        {/* Generar con IA */}
        <motion.button
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('ai')}
          className="bg-[#3B82F6] rounded-3xl p-8 text-left flex flex-col h-[400px] shadow-xl shadow-blue-100 group transition-all"
        >
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-4">Generar con IA</h3>
          <p className="text-white/80 text-sm leading-relaxed">
            Describe tu negocio y deja que nuestra inteligencia artificial cree la estructura, textos e imágenes por ti en segundos.
          </p>
        </motion.button>

        {/* Usar Plantilla (Disabled) */}
        <div className="bg-white rounded-3xl p-8 text-left flex flex-col h-[400px] border border-slate-100 opacity-60 relative cursor-not-allowed">
          <div className="absolute top-6 right-6 bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Próximamente
          </div>
          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-6">
            <Layout className="text-slate-400 w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-400 mb-4">Usar Plantilla</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Elige entre diseños pre-construidos profesionales optimizados para conversión. Ideal si quieres una base sólida rápida.
          </p>
        </div>

        {/* Lienzo en Blanco */}
        <motion.button
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('scratch')}
          className="bg-white rounded-3xl p-8 text-left flex flex-col h-[400px] shadow-sm border border-slate-100 group transition-all hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/50"
        >
          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-50 transition-colors">
            <PlusSquare className="text-slate-900 w-6 h-6 group-hover:text-blue-600 transition-colors" />
          </div>
          <h3 className="text-xl font-bold text-[#0F172A] mb-4 group-hover:text-blue-600 transition-colors">Lienzo en Blanco</h3>
          <p className="text-[#64748B] text-sm leading-relaxed">
            Empieza desde cero. Añade secciones una a una y construye tu sitio con total control creativo sin distracciones.
          </p>
        </motion.button>
      </div>

      {/* Back Button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-[#64748B] hover:text-[#1E293B] font-bold text-base transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Atrás
      </button>
    </div>
  );
};
