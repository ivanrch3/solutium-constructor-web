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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-surface rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden"
      >
        <div className="p-8 md:p-10">
          <h2 className="text-xl font-bold text-text mb-8">Cuéntanos sobre tu proyecto</h2>

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
                  <label className="block text-base font-bold text-text">Nombre de la página</label>
                  <input
                    type="text"
                    placeholder="Ej: Inicio, Servicios, Contacto..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-0 outline-none transition-all text-sm text-text placeholder:text-text/30 bg-surface"
                  />
                </div>

                {/* Sector o Industria */}
                <div className="space-y-2">
                  <label className="block text-base font-bold text-text">Sector o Industria</label>
                  <div className="relative">
                    <select
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-0 outline-none transition-all text-sm text-text appearance-none bg-surface placeholder:text-text/30"
                    >
                      <option value="" disabled>Selecciona una industria...</option>
                      {INDUSTRIES.map((industry) => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-text/40 pointer-events-none w-4 h-4" />
                  </div>
                </div>

                {/* Descripción breve */}
                <div className="space-y-2">
                  <label className="block text-base font-bold text-text">Descripción breve (mínimo 10 palabras)</label>
                  <textarea
                    placeholder="Describe qué hace tu negocio y qué ofreces..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-0 outline-none transition-all text-sm text-text placeholder:text-text/30 bg-surface resize-none"
                  />
                  <div className="flex justify-between items-center px-1">
                    <span className={`text-xs font-bold uppercase tracking-wider ${isDescriptionValid ? 'text-green-500' : 'text-text/40'}`}>
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
                  <label className="block text-base font-bold text-text">Objetivo principal</label>
                  <div className="grid grid-cols-2 gap-2">
                    {GOALS.map((goal) => (
                      <button
                        key={goal}
                        onClick={() => setFormData({ ...formData, goal })}
                        className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all text-center ${
                          formData.goal === goal 
                            ? 'border-primary bg-primary/10 text-primary' 
                            : 'border-border text-text/40 hover:border-border/80'
                        }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Estilo visual */}
                <div className="space-y-4">
                  <label className="block text-base font-bold text-text">Estilo visual</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {STYLES.map((style) => (
                      <button
                        key={style}
                        onClick={() => setFormData({ ...formData, style })}
                        className={`py-2.5 px-3 rounded-lg border text-xs font-bold transition-all text-center ${
                          formData.style === style 
                            ? 'border-primary bg-primary/10 text-primary' 
                            : 'border-border text-text/40 hover:border-border/80'
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
              className="px-6 py-3 rounded-xl font-bold text-base text-text/40 hover:text-text/60 transition-all"
            >
              {step === 1 ? 'Cancelar' : 'Atrás'}
            </button>
            
            <div className="flex items-center gap-3">
              <button
                onClick={onSkip}
                className="px-6 py-3 rounded-xl font-bold text-base text-text/20 hover:text-text/40 transition-all"
              >
                Omitir
              </button>
              <button
                disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
                onClick={handleNext}
                className={`px-8 py-3 rounded-xl font-bold text-base transition-all shadow-lg border ${
                  (step === 1 ? isStep1Valid : isStep2Valid)
                    ? 'bg-solutium-dark text-white shadow-primary/10 hover:opacity-90 border-black/5' 
                    : 'bg-solutium-dark/30 text-white cursor-not-allowed shadow-none border-transparent'
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
