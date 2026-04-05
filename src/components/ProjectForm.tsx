import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

export interface ProjectFormData {
  name: string;
  industry: string;
  description: string;
  goal: string;
  style: string;
}

interface ProjectFormProps {
  onSubmit: (data: ProjectFormData) => void;
  onCancel: () => void;
  onSkip: () => void;
}

const INDUSTRIES = [
  'Tecnología y Software',
  'Salud y Bienestar',
  'Educación',
  'E-commerce / Retail',
  'Servicios Profesionales',
  'Gastronomía / Restaurantes',
  'Inmobiliaria',
  'Turismo y Viajes',
  'Arte y Entretenimiento',
  'Otro'
];

const GOALS = [
  'Captar clientes',
  'Vender productos',
  'Presencia online',
  'Informar / Educar',
  'Portfolio / Galería',
  'Reservas / Citas'
];

const STYLES = [
  'Moderno',
  'Elegante',
  'Divertido',
  'Minimalista',
  'Corporativo',
  'Creativo',
  'Clásico',
  'Atrevido'
];

export const ProjectForm: React.FC<ProjectFormProps> = ({ onSubmit, onCancel, onSkip }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    industry: '',
    description: '',
    goal: '',
    style: ''
  });

  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    const words = formData.description.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [formData.description]);

  const isDescriptionValid = wordCount >= 10;
  const isStep1Valid = formData.name.trim() !== '' && formData.industry !== '' && isDescriptionValid;
  const isStep2Valid = formData.goal !== '' && formData.style !== '';

  const handleNext = () => {
    if (step === 1) setStep(2);
    else onSubmit(formData);
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    else onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden"
      >
        <div className="p-8 md:p-10">
          <h2 className="text-xl font-bold text-[#0F172A] mb-8">Cuéntanos sobre tu proyecto</h2>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Nombre de la página */}
                <div className="space-y-2">
                  <label className="block text-base font-bold text-[#1E293B]">Nombre de la página</label>
                  <input
                    type="text"
                    placeholder="Ej: Inicio, Servicios, Contacto..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-100 focus:border-blue-500 focus:ring-0 outline-none transition-all text-sm text-slate-700 placeholder:text-slate-300"
                  />
                </div>

                {/* Sector o Industria */}
                <div className="space-y-2">
                  <label className="block text-base font-bold text-[#1E293B]">Sector o Industria</label>
                  <div className="relative">
                    <select
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-100 focus:border-blue-500 focus:ring-0 outline-none transition-all text-sm text-slate-700 appearance-none bg-white placeholder:text-slate-300"
                    >
                      <option value="" disabled>Selecciona una industria...</option>
                      {INDUSTRIES.map((industry) => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-4 h-4" />
                  </div>
                </div>

                {/* Descripción breve */}
                <div className="space-y-2">
                  <label className="block text-base font-bold text-[#1E293B]">Descripción breve (mínimo 10 palabras)</label>
                  <textarea
                    placeholder="Describe qué hace tu negocio y qué ofreces..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-slate-100 focus:border-blue-500 focus:ring-0 outline-none transition-all text-sm text-slate-700 placeholder:text-slate-300 resize-none"
                  />
                  <div className="flex justify-between items-center px-1">
                    <span className={`text-xs font-bold uppercase tracking-wider ${isDescriptionValid ? 'text-green-500' : 'text-slate-400'}`}>
                      Palabras: {wordCount}/10
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* Objetivo principal */}
                <div className="space-y-4">
                  <label className="block text-base font-bold text-[#1E293B]">Objetivo principal</label>
                  <div className="grid grid-cols-2 gap-2">
                    {GOALS.map((goal) => (
                      <button
                        key={goal}
                        onClick={() => setFormData({ ...formData, goal })}
                        className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all text-center ${
                          formData.goal === goal 
                            ? 'border-blue-500 bg-blue-50 text-blue-600' 
                            : 'border-slate-100 text-slate-500 hover:border-slate-200'
                        }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Estilo visual */}
                <div className="space-y-4">
                  <label className="block text-base font-bold text-[#1E293B]">Estilo visual</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {STYLES.map((style) => (
                      <button
                        key={style}
                        onClick={() => setFormData({ ...formData, style })}
                        className={`py-2.5 px-3 rounded-lg border text-xs font-bold transition-all text-center ${
                          formData.style === style 
                            ? 'border-blue-500 bg-blue-50 text-blue-600' 
                            : 'border-slate-100 text-slate-500 hover:border-slate-200'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Buttons */}
          <div className="flex items-center justify-between mt-10">
            <button
              onClick={handleBack}
              className="px-6 py-3 rounded-xl font-bold text-base text-slate-400 hover:text-slate-600 transition-all"
            >
              {step === 1 ? 'Cancelar' : 'Atrás'}
            </button>
            
            <div className="flex items-center gap-3">
              <button
                onClick={onSkip}
                className="px-6 py-3 rounded-xl font-bold text-base text-slate-300 hover:text-slate-500 transition-all"
              >
                Omitir
              </button>
              <button
                disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
                onClick={handleNext}
                className={`px-8 py-3 rounded-xl font-bold text-base transition-all shadow-lg ${
                  (step === 1 ? isStep1Valid : isStep2Valid)
                    ? 'bg-[#3B82F6] text-white shadow-blue-100 hover:bg-blue-600' 
                    : 'bg-blue-200 text-white cursor-not-allowed shadow-none'
                }`}
              >
                {step === 1 ? 'Siguiente' : 'Comenzar'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
