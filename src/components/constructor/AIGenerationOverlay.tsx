import React from 'react';
import { useEditorStore } from '../../store/editorStore';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Loader2, CheckCircle2, ShieldCheck, Zap, Palette, Image as ImageIcon } from 'lucide-react';

export const AIGenerationOverlay: React.FC = () => {
  const { isGenerating, generationStep, generationSteps } = useEditorStore();

  if (!isGenerating) return null;

  const STEP_ICONS = [
    <Zap className="text-blue-500" />,
    <ShieldCheck className="text-indigo-500" />,
    <Palette className="text-purple-500" />,
    <ImageIcon className="text-pink-500" />,
    <Sparkles className="text-amber-500" />
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-xl">
      <div className="max-w-md w-full p-8 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-8 relative"
        >
          <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-blue-500/20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="text-white w-12 h-12" />
            </motion.div>
          </div>
          
          {/* Decorative rings */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 -z-10 bg-blue-400/20 rounded-full blur-3xl"
          />
        </motion.div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Creando tu sitio inteligente</h2>
        <p className="text-gray-500 text-sm mb-10">Solutium AI Engine está procesando tu visión...</p>

        <div className="space-y-4 text-left">
          {generationSteps.map((step, index) => {
            const isActive = index === generationStep;
            const isCompleted = index < generationStep;

            return (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: (isActive || isCompleted) ? 1 : 0.3,
                  x: 0,
                  scale: isActive ? 1.02 : 1
                }}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                  isActive ? 'bg-white border-blue-100 shadow-sm' : 'border-transparent'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="text-green-500 w-5 h-5" />
                  ) : isActive ? (
                    <Loader2 className="text-blue-600 w-5 h-5 animate-spin" />
                  ) : (
                    <div className="grayscale opacity-50">{STEP_ICONS[index]}</div>
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${((generationStep + 1) / generationSteps.length) * 100}%` }}
          className="h-1.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mt-8"
        />
      </div>
    </div>
  );
};
