import React from 'react';
import { Sparkles, Layout, FilePlus, ArrowRight, Clock, ExternalLink, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { Project } from '../types';
import { INDUSTRIES } from '../lib/industries';

// Helper to get suggested palette based on business type
const getSuggestedPalette = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes('agricultura') || t.includes('ganadería') || t.includes('campo')) {
    return { primary: '#166534', secondary: '#15803d', name: 'Verde Campo' };
  }
  if (t.includes('comida') || t.includes('restaurante') || t.includes('chef') || t.includes('gastronomía')) {
    return { primary: '#EA580C', secondary: '#F97316', name: 'Cálido Gastronómico' };
  }
  if (t.includes('arte') || t.includes('diseño') || t.includes('creativo')) {
    return { primary: '#D946EF', secondary: '#A21CAF', name: 'Arte Vibrante' };
  }
  if (t.includes('automotriz') || t.includes('coche') || t.includes('taller')) {
    return { primary: '#334155', secondary: '#0F172A', name: 'Gris Motor' };
  }
  if (t.includes('belleza') || t.includes('spa') || t.includes('estética')) {
    return { primary: '#F472B6', secondary: '#DB2777', name: 'Rosa Pétalo' };
  }
  if (t.includes('inmobiliaria') || t.includes('bienes raíces') || t.includes('casa')) {
    return { primary: '#0F172A', secondary: '#334155', name: 'Elegancia Urbana' };
  }
  if (t.includes('influencer') || t.includes('blog') || t.includes('personal')) {
    return { primary: '#8B5CF6', secondary: '#EC4899', name: 'Social Pop' };
  }
  if (t.includes('ecommerce') || t.includes('tienda online')) {
    return { primary: '#2563EB', secondary: '#1D4ED8', name: 'Azul Comercial' };
  }
  if (t.includes('construcción') || t.includes('reforma')) {
    return { primary: '#B45309', secondary: '#78350F', name: 'Tierra Fuerte' };
  }
  if (t.includes('salud') || t.includes('clínica') || t.includes('doctor') || t.includes('dental')) {
    return { primary: '#0EA5E9', secondary: '#38BDF8', name: 'Azul Clínico' };
  }
  if (t.includes('tecnología') || t.includes('software') || t.includes('app') || t.includes('digital')) {
    return { primary: '#6366F1', secondary: '#8B5CF6', name: 'Índigo Tech' };
  }
  if (t.includes('finanzas') || t.includes('banco') || t.includes('contabilidad') || t.includes('seguro')) {
    return { primary: '#1E293B', secondary: '#475569', name: 'Gris Corporativo' };
  }
  if (t.includes('legal') || t.includes('abogado')) {
    return { primary: '#451a03', secondary: '#78350f', name: 'Madera Legal' };
  }
  if (t.includes('deporte') || t.includes('gym') || t.includes('fitness')) {
    return { primary: '#DC2626', secondary: '#171717', name: 'Rojo Energía' };
  }
  if (t.includes('arquitectura') || t.includes('diseño')) {
    return { primary: '#000000', secondary: '#525252', name: 'Minimalista' };
  }
  if (t.includes('mascota') || t.includes('veterinaria')) {
    return { primary: '#10B981', secondary: '#059669', name: 'Verde Vida' };
  }
  if (t.includes('moda') || t.includes('ropa')) {
    return { primary: '#000000', secondary: '#D4D4D4', name: 'Vogue' };
  }
  if (t.includes('viaje') || t.includes('turismo') || t.includes('hotel')) {
    return { primary: '#F59E0B', secondary: '#D97706', name: 'Sol y Arena' };
  }
  return { primary: '#3B82F6', secondary: '#1E293B', name: 'Moderno Estándar' };
};

// Helper to get business image
const getBusinessImage = (type: string) => {
  const t = type.toLowerCase();
  // Using picsum with seed for deterministic but varied images
  if (t.includes('comida') || t.includes('restaurante')) return 'https://picsum.photos/seed/food/1200/800';
  if (t.includes('salud') || t.includes('clínica')) return 'https://picsum.photos/seed/health/1200/800';
  if (t.includes('tecnología') || t.includes('software')) return 'https://picsum.photos/seed/tech/1200/800';
  if (t.includes('finanzas') || t.includes('legal')) return 'https://picsum.photos/seed/finance/1200/800';
  if (t.includes('deporte') || t.includes('gym')) return 'https://picsum.photos/seed/sports/1200/800';
  if (t.includes('arquitectura')) return 'https://picsum.photos/seed/architecture/1200/800';
  return `https://picsum.photos/seed/${encodeURIComponent(t || 'business')}/1200/800`;
};

interface WelcomeScreenProps {
  onSelectOption: (
    option: 'ai' | 'template' | 'blank', 
    pageName: string, 
    businessContext: {
      name: string;
      sector: string;
      description: string;
      objective: string;
      visualStyle: string;
    }, 
    palette?: { primary: string, secondary: string }
  ) => void;
  onSelectProject: (projectId: string) => void;
  projects?: Project[];
  title?: string;
  nameLabel?: string;
  nameDescription?: string;
  namePlaceholder?: string;
  businessTypeLabel?: string;
  businessTypePlaceholder?: string;
  brandColors?: string[]; // Colors from mother app
  industry?: string; // Industry from mother app
}

export const WelcomeScreen = ({ 
  onSelectOption, 
  onSelectProject, 
  projects = [],
  title = "Elige la forma que mejor se adapte a tu flujo de trabajo.",
  brandColors,
  industry
}: WelcomeScreenProps) => {
  const [step, setStep] = React.useState<'project' | 'options'>('project');
  const [selectedOption, setSelectedOption] = React.useState<'ai' | 'template' | 'blank' | null>(null);
  const [formStep, setFormStep] = React.useState<1 | 2>(1);
  const [pageName, setPageName] = React.useState('');
  const [pageDescription, setPageDescription] = React.useState('');
  const [selectedIndustryId, setSelectedIndustryId] = React.useState<string>('');
  const [manualIndustry, setManualIndustry] = React.useState('');
  const [objective, setObjective] = React.useState('');
  const [visualStyle, setVisualStyle] = React.useState('');
  const [isCreating, setIsCreating] = React.useState(false);

  // Initialize industry from props
  React.useEffect(() => {
    if (industry) {
      const found = INDUSTRIES.find(i => 
        i.id === industry || 
        i.label.toLowerCase() === industry.toLowerCase()
      );
      if (found) {
        setSelectedIndustryId(found.id);
      } else {
        setSelectedIndustryId('other');
        setManualIndustry(industry);
      }
    }
  }, [industry]);

  const sector = selectedIndustryId === 'other' 
    ? manualIndustry 
    : INDUSTRIES.find(i => i.id === selectedIndustryId)?.label || '';

  const wordCount = pageDescription.trim().split(/\s+/).filter(w => w.length > 0).length;
  const isDescriptionValid = wordCount >= 10;

  const handleOptionClick = (option: 'ai' | 'template' | 'blank') => {
    setSelectedOption(option);
    setFormStep(1);
  };

  const handleFinalContinue = () => {
    if (pageName.trim() && selectedOption && isDescriptionValid && sector && objective && visualStyle) {
      const businessContext = {
        name: pageName.trim(),
        sector,
        description: pageDescription.trim(),
        objective,
        visualStyle
      };
      const palette = getSuggestedPalette(sector + ' ' + pageDescription);
      onSelectOption(selectedOption, pageName.trim(), businessContext, palette);
    }
  };

  const Logo = () => (
    <div className="flex justify-center mb-16">
      <img 
        src="https://solutium.app/logos-de-apps/solutium-constructor-web-imagotipo.png" 
        alt="Constructor Web Logo" 
        className="h-12 w-auto object-contain"
        style={{ transform: 'scale(1.728)' }}
        referrerPolicy="no-referrer"
      />
    </div>
  );

  if (isCreating) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 font-sans text-center">
        <Logo />
        <div className="relative w-24 h-24 mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-4 border-primary/20 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 border-4 border-accent/40 rounded-full border-t-transparent"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          </div>
        </div>
        
        <h2 className="text-2xl font-black text-text mb-2">Preparando tu proyecto</h2>
        <p className="text-text/60 max-w-md">
          Estamos configurando el entorno y preparando las herramientas de IA para diseñar tu sitio web ideal.
        </p>
        
        <div className="mt-8 flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              className="w-2 h-2 bg-primary rounded-full"
            />
          ))}
        </div>
      </div>
    );
  }

  if (step === 'project') {
    return (
      <div className="min-h-screen bg-background/50 p-8 font-sans flex flex-col justify-center">
        <div className="w-full max-w-5xl mx-auto">
          <Logo />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Left Column: Nueva página */}
            <div className="bg-surface p-12 rounded-[2rem] border border-text/10 shadow-sm flex flex-col items-start min-h-[400px]">
              <h1 className="text-2xl font-black text-text mb-4">Nueva página</h1>
              <p className="text-text/60 mb-8 text-lg leading-relaxed">Crea una nueva página desde cero con nuestro constructor web o utilizando inteligencia artificial.</p>
              <button 
                onClick={() => setStep('options')}
                className="bg-primary text-white py-3 px-8 rounded-xl hover:bg-primary/90 transition-all font-bold flex items-center mt-auto text-lg"
              >
                <FilePlus className="w-5 h-5 mr-3" /> Crear nuevo
              </button>
            </div>

            {/* Right Column: Activos existentes */}
            <div className="bg-surface p-12 rounded-[2rem] border border-text/10 shadow-sm flex flex-col min-h-[400px]">
              <h2 className="text-2xl font-black text-text mb-8">Activos existentes</h2>
              {(() => {
                const allAssets = projects.flatMap(p => (p.assets || []).map(a => ({ ...a, projectId: p.id })));
                if (allAssets.length === 0) {
                  return (
                    <div className="p-8 rounded-2xl border border-dashed border-text/20 text-center text-text/60 flex-1 flex items-center justify-center text-lg">
                      No existen activos.
                    </div>
                  );
                }
                return (
                  <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 max-h-[400px] pr-2">
                    {allAssets.map((asset) => (
                      <div
                        key={asset.id}
                        className="flex items-center justify-between bg-background p-5 rounded-2xl border border-text/10 hover:border-text/20 transition-colors"
                      >
                        <span className="font-medium text-text truncate mr-4 text-lg">{asset.name}</span>
                        <button
                          onClick={() => onSelectProject(asset.projectId)}
                          className="px-6 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary hover:text-white transition-all font-bold whitespace-nowrap"
                        >
                          Abrir
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'options') {
    const primary = brandColors?.[0] || '#3B82F6';
    const secondary = brandColors?.[1] || '#1E293B';

    return (
      <div className="min-h-screen bg-background/50 p-8 font-sans flex flex-col justify-center">
        <div className="w-full max-w-6xl mx-auto">
          <Logo />
          <h2 className="text-3xl font-black text-text mb-12 text-center">¿Cómo quieres crear tu página?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              { id: 'ai', icon: Sparkles, title: 'Generar con IA', desc: 'Describe tu negocio y deja que nuestra inteligencia artificial cree la estructura, textos e imágenes por ti en segundos.', style: { background: `linear-gradient(135deg, ${primary}, ${secondary})`, color: 'white' } },
              { id: 'template', icon: Layout, title: 'Usar Plantilla', desc: 'Elige entre diseños pre-construidos profesionales optimizados para conversión. Ideal si quieres una base sólida rápida.', style: { backgroundColor: 'var(--surface)', color: 'var(--text)', opacity: 0.5 }, disabled: true, badge: 'Próximamente' },
              { id: 'blank', icon: FilePlus, title: 'Lienzo en Blanco', desc: 'Empieza desde cero. Añade secciones una a una y construye tu sitio con total control creativo sin distracciones.', style: { backgroundColor: 'var(--surface)', color: 'var(--text)' } }
            ].map((option) => (
              <div 
                key={option.id}
                onClick={() => !option.disabled && handleOptionClick(option.id as any)}
                style={option.style}
                className={`relative p-8 rounded-[2rem] border border-text/10 transition-all ${option.disabled ? 'cursor-not-allowed grayscale' : 'cursor-pointer hover:shadow-xl hover:-translate-y-1'} ${selectedOption === option.id ? 'ring-4 ring-primary ring-offset-4 ring-offset-background' : ''}`}
              >
                {option.badge && (
                  <span className="absolute top-6 right-6 bg-text/10 text-text text-xs font-bold px-3 py-1.5 rounded-full">
                    {option.badge}
                  </span>
                )}
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                  <option.icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-xl mb-3">{option.title}</h3>
                <p className="text-base leading-relaxed opacity-80">{option.desc}</p>
              </div>
            ))}
          </div>
          
          {selectedOption && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl w-full bg-surface p-8 rounded-[32px] border border-text/10 shadow-2xl"
              >
                <h3 className="text-2xl font-bold text-text mb-6">Cuéntanos sobre tu proyecto</h3>
                
                <div className="space-y-6">
                  {formStep === 1 && (
                    <motion.div 
                      key="step1"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
                      <div>
                        <label className="block text-sm font-bold text-text/80 mb-2">Nombre de la página</label>
                        <input 
                          type="text"
                          value={pageName}
                          onChange={(e) => setPageName(e.target.value)}
                          placeholder="Ej: Inicio, Servicios, Contacto..."
                          className="w-full px-4 py-3 bg-background border border-text/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                          autoFocus
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-text/80 mb-2">Sector o Industria</label>
                        <div className="relative">
                          <select 
                            value={selectedIndustryId}
                            onChange={(e) => setSelectedIndustryId(e.target.value)}
                            className="w-full px-4 py-3 bg-background border border-text/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                          >
                            <option value="" disabled>Selecciona una industria...</option>
                            {INDUSTRIES.map(ind => (
                              <option key={ind.id} value={ind.id}>{ind.label}</option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text/40">
                            <ChevronDown className="w-4 h-4" />
                          </div>
                        </div>
                        
                        <AnimatePresence>
                          {selectedIndustryId === 'other' && (
                            <motion.div
                              initial={{ opacity: 0, height: 0, marginTop: 0 }}
                              animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                              exit={{ opacity: 0, height: 0, marginTop: 0 }}
                              className="overflow-hidden"
                            >
                              <input 
                                type="text"
                                value={manualIndustry}
                                onChange={(e) => setManualIndustry(e.target.value)}
                                placeholder="Especifica tu industria (ej: Software B2B, Clínica Dental...)"
                                className="w-full px-4 py-3 bg-background border border-text/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                autoFocus
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-text/80 mb-2">Descripción breve (mínimo 10 palabras)</label>
                        <textarea 
                          value={pageDescription}
                          onChange={(e) => setPageDescription(e.target.value)}
                          placeholder="Describe qué hace tu negocio y qué ofreces..."
                          className="w-full px-4 py-3 bg-background border border-text/10 rounded-xl h-24 resize-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        />
                        <p className="text-xs text-text/50 mt-1">Palabras: {wordCount}/10</p>
                      </div>
                    </motion.div>
                  )}

                  {formStep === 2 && (
                    <motion.div 
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <label className="block text-sm font-bold text-text/80 mb-2">Objetivo principal</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {['Captar clientes', 'Vender productos', 'Presencia online', 'Informar / Educar', 'Portfolio / Galería', 'Reservas / Citas'].map(obj => (
                            <button
                              key={obj}
                              onClick={() => setObjective(obj)}
                              className={`py-2 px-4 rounded-xl border text-sm font-medium transition-all ${objective === obj ? 'bg-primary border-primary text-white shadow-md' : 'bg-background border-text/10 text-text hover:border-primary/50'}`}
                            >
                              {obj}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-text/80 mb-2">Estilo visual</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {['Moderno', 'Elegante', 'Divertido', 'Minimalista', 'Corporativo', 'Creativo', 'Clásico', 'Atrevido'].map(style => (
                            <button
                              key={style}
                              onClick={() => setVisualStyle(style)}
                              className={`py-2 px-4 rounded-xl border text-sm font-medium transition-all ${visualStyle === style ? 'bg-primary border-primary text-white shadow-md' : 'bg-background border-text/10 text-text hover:border-primary/50'}`}
                            >
                              {style}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="flex gap-4 mt-8 pt-6 border-t border-text/10">
                  {formStep === 1 ? (
                    <button onClick={() => setSelectedOption(null)} className="px-6 py-3 bg-surface border border-text/10 text-text/80 rounded-xl font-bold hover:bg-text/5 transition-colors">Cancelar</button>
                  ) : (
                    <button onClick={() => setFormStep(1)} className="px-6 py-3 bg-surface border border-text/10 text-text/80 rounded-xl font-bold hover:bg-text/5 transition-colors">Atrás</button>
                  )}
                  <div className="flex-1"></div>
                  <button 
                    onClick={() => onSelectOption(
                      selectedOption, 
                      pageName || 'Nueva Página', 
                      { name: pageName || 'Nueva Página', sector: 'General', description: 'Omitido', objective: 'Presencia online', visualStyle: 'Moderno' }, 
                      getSuggestedPalette('')
                    )} 
                    className="px-6 py-3 bg-background text-text/60 rounded-xl font-bold hover:bg-text/5 transition-colors"
                  >
                    Omitir
                  </button>
                  
                  {formStep === 1 ? (
                    <button 
                      onClick={() => setFormStep(2)}
                      disabled={!pageName.trim() || !isDescriptionValid || !sector}
                      className="px-8 py-3 bg-primary text-white rounded-xl font-bold disabled:opacity-50 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                    >
                      Siguiente
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        setIsCreating(true);
                        handleFinalContinue();
                      }}
                      disabled={!objective || !visualStyle}
                      className="px-8 py-3 bg-primary text-white rounded-xl font-bold disabled:opacity-50 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                    >
                      Comenzar
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          )}

          {!selectedOption && (
            <div className="mt-12 flex justify-center">
              <button 
                onClick={() => setStep('project')} 
                className="px-6 py-3 bg-surface border border-text/10 text-text/80 rounded-xl font-bold hover:bg-text/5 transition-colors"
              >
                Atrás
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};
