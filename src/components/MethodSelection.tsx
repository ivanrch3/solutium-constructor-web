import React from 'react';
import { Sparkles, Layout, PlusSquare, FileText, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export type CreationMethod = 'ai' | 'template' | 'scratch';

interface MethodSelectionProps {
  onSelect: (method: CreationMethod) => void;
  onBack: () => void;
  logoUrl?: string | null;
}

export const MethodSelection: React.FC<MethodSelectionProps> = ({ onSelect, onBack, logoUrl }) => {
  return (
    <div className="min-h-screen bg-secondary p-8 flex flex-col items-center">
      {/* Header Logo */}
      <div className="flex flex-col items-center mb-16">
        {logoUrl && (
          <img 
            src={logoUrl} 
            alt="Logo" 
            className="h-20 w-auto object-contain" 
            referrerPolicy="no-referrer" 
          />
        )}
      </div>

      <h2 className="text-2xl font-bold text-text mb-12 text-center">¿Cómo quieres crear tu página?</h2>

      {/* Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-12">
        {/* Generar con IA */}
        <motion.button
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('ai')}
          className="bg-solutium-dark rounded-3xl p-8 text-left flex flex-col h-[400px] shadow-xl shadow-primary/10 group transition-all border border-black/5"
        >
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-4">Generar con IA</h3>
          <p className="text-white/90 text-sm leading-relaxed">
            Describe tu negocio y deja que nuestra inteligencia artificial cree la estructura, textos e imágenes por ti en segundos.
          </p>
        </motion.button>

        {/* Usar Plantilla (Disabled) */}
        <div className="bg-surface rounded-3xl p-8 text-left flex flex-col h-[400px] border border-border opacity-60 relative cursor-not-allowed">
          <div className="absolute top-6 right-6 bg-secondary text-text/40 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Próximamente
          </div>
          <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-6">
            <Layout className="text-text/20 w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-text/40 mb-4">Usar Plantilla</h3>
          <p className="text-text/40 text-sm leading-relaxed">
            Elige entre diseños pre-construidos profesionales optimizados para conversión. Ideal si quieres una base sólida rápida.
          </p>
        </div>

        {/* Lienzo en Blanco */}
        <motion.button
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('scratch')}
          className="bg-surface rounded-3xl p-8 text-left flex flex-col h-[400px] shadow-sm border border-border group transition-all hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
        >
          <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
            <PlusSquare className="text-text w-6 h-6 group-hover:text-primary transition-colors" />
          </div>
          <h3 className="text-xl font-bold text-text mb-4 group-hover:text-primary transition-colors">Lienzo en Blanco</h3>
          <p className="text-text/60 text-sm leading-relaxed">
            Empieza desde cero. Añade secciones una a una y construye tu sitio con total control creativo sin distracciones.
          </p>
        </motion.button>
      </div>

      {/* Back Button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-text/60 hover:text-text font-bold text-base transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Atrás
      </button>
    </div>
  );
};
