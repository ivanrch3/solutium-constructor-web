import React from 'react';
import { Sparkles, Layout, FilePlus, ArrowRight, Clock, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

import { Project } from '../types';

// Helper to get suggested palette based on business type
const getSuggestedPalette = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes('comida') || t.includes('restaurante') || t.includes('chef')) {
    return { primary: '#EA580C', secondary: '#F97316', name: 'Cálido Gastronómico' };
  }
  if (t.includes('salud') || t.includes('clínica') || t.includes('doctor') || t.includes('dental')) {
    return { primary: '#0EA5E9', secondary: '#38BDF8', name: 'Azul Clínico' };
  }
  if (t.includes('tecnología') || t.includes('software') || t.includes('app') || t.includes('digital')) {
    return { primary: '#6366F1', secondary: '#8B5CF6', name: 'Índigo Tech' };
  }
  if (t.includes('finanzas') || t.includes('abogado') || t.includes('legal') || t.includes('banco')) {
    return { primary: '#1E293B', secondary: '#475569', name: 'Gris Corporativo' };
  }
  if (t.includes('deporte') || t.includes('gym') || t.includes('fitness')) {
    return { primary: '#DC2626', secondary: '#171717', name: 'Rojo Energía' };
  }
  if (t.includes('arquitectura') || t.includes('construcción') || t.includes('diseño')) {
    return { primary: '#000000', secondary: '#525252', name: 'Minimalista' };
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
  onSelectOption: (option: 'ai' | 'template' | 'blank', pageName: string, pageDescription: string, palette?: { primary: string, secondary: string }) => void;
  onSelectProject: (projectId: string) => void;
  projects?: Project[];
  title?: string;
  nameLabel?: string;
  nameDescription?: string;
  namePlaceholder?: string;
  businessTypeLabel?: string;
  businessTypePlaceholder?: string;
  brandColors?: string[]; // Colors from mother app
}

export const WelcomeScreen = ({ 
  onSelectOption, 
  onSelectProject, 
  projects = [],
  title = "Elige la forma que mejor se adapte a tu flujo de trabajo.",
  brandColors
}: WelcomeScreenProps) => {
  const [step, setStep] = React.useState<'project' | 'options'>('project');
  const [selectedOption, setSelectedOption] = React.useState<'ai' | 'template' | 'blank' | null>(null);
  const [pageName, setPageName] = React.useState('');
  const [pageDescription, setPageDescription] = React.useState('');
  const [isCreating, setIsCreating] = React.useState(false);

  const wordCount = pageDescription.trim().split(/\s+/).filter(w => w.length > 0).length;
  const isDescriptionValid = wordCount >= 5;

  const handleOptionClick = (option: 'ai' | 'template' | 'blank') => {
    setSelectedOption(option);
    setStep('options');
  };

  const handleFinalContinue = () => {
    if (pageName.trim() && selectedOption && isDescriptionValid) {
      const palette = getSuggestedPalette(pageDescription);
      onSelectOption(selectedOption, pageName.trim(), pageDescription.trim(), palette);
    }
  };

  const Logo = () => (
    <div className="flex justify-center mb-12">
      <img 
        src="https://solutium.app/solutium-imagotipo.png" 
        alt="Solutium Logo" 
        className="h-10 w-auto object-contain"
        referrerPolicy="no-referrer"
      />
    </div>
  );

  if (step === 'project') {
    return (
      <div className="min-h-screen bg-background/50 p-8 font-sans">
        <Logo />
        <div className="max-w-5xl mx-auto">
          <div className="bg-surface p-8 rounded-3xl border border-text/10 shadow-sm">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-3xl font-black text-text mb-2">Nueva página</h1>
                <p className="text-text/60">Crea una nueva página desde cero o selecciona un activo existente para continuar.</p>
              </div>
              <button 
                onClick={() => setIsCreating(!isCreating)}
                className="bg-primary text-white py-2 px-6 rounded-xl hover:bg-primary/90 transition-all font-bold flex items-center"
              >
                <FilePlus className="w-4 h-4 mr-2" /> Crear nuevo
              </button>
            </div>

            {isCreating && (
              <div className="bg-background p-6 rounded-2xl border border-text/10 mb-8">
                <h3 className="font-bold text-text mb-4">Digite el nombre de la nueva página</h3>
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    autoFocus
                    value={pageName}
                    onChange={(e) => setPageName(e.target.value)}
                    placeholder="Ej: Inicio, Servicios..."
                    className="flex-1 px-4 py-3 bg-surface border border-text/10 rounded-xl"
                  />
                  <button 
                    onClick={() => setStep('options')}
                    disabled={!pageName.trim()}
                    className="px-8 py-3 bg-primary text-white font-bold rounded-xl disabled:opacity-50"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}

            <div className="mt-8">
              <h2 className="text-lg font-bold text-text mb-4">Activos existentes</h2>
              {(() => {
                const allAssets = projects.flatMap(p => (p.assets || []).map(a => ({ ...a, project_id: p.id })));
                if (allAssets.length === 0) {
                  return (
                    <div className="p-8 rounded-2xl border border-dashed border-text/20 text-center text-text/60">
                      No existen activos.
                    </div>
                  );
                }
                return (
                  <div className="space-y-3">
                    {allAssets.map((asset) => (
                      <div
                        key={asset.id}
                        className="flex items-center justify-between bg-background p-4 rounded-xl border border-text/10"
                      >
                        <span className="font-medium text-text">{asset.name}</span>
                        <button
                          onClick={() => onSelectProject(asset.project_id)}
                          className="px-4 py-2 bg-surface border border-text/10 rounded-lg hover:bg-primary hover:text-white transition-all font-bold text-sm"
                        >
                          Seleccionar
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
      <div className="min-h-screen bg-background/50 p-8 font-sans">
        <Logo />
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-black text-text mb-12 text-center">¿Cómo quieres crear tu página?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { id: 'ai', icon: Sparkles, title: 'Generar con IA', desc: 'Describe tu negocio y deja que nuestra inteligencia artificial cree la estructura, textos e imágenes por ti en segundos.', style: { background: `linear-gradient(135deg, ${primary}, ${secondary})`, color: 'white' } },
              { id: 'template', icon: Layout, title: 'Usar Plantilla', desc: 'Elige entre diseños pre-construidos profesionales optimizados para conversión. Ideal si quieres una base sólida rápida.', style: { backgroundColor: primary, color: 'white' } },
              { id: 'blank', icon: FilePlus, title: 'Lienzo en Blanco', desc: 'Empieza desde cero. Añade secciones una a una y construye tu sitio con total control creativo sin distracciones.', style: { backgroundColor: 'var(--surface)', color: 'var(--text)' } }
            ].map((option) => (
              <div 
                key={option.id}
                onClick={() => handleOptionClick(option.id as any)}
                style={option.style}
                className={`p-6 rounded-3xl border border-text/10 cursor-pointer transition-all hover:shadow-lg ${selectedOption === option.id ? 'ring-2 ring-primary' : ''}`}
              >
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <option.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg mb-2">{option.title}</h3>
                <p className="text-sm leading-relaxed opacity-80">{option.desc}</p>
              </div>
            ))}
          </div>
          
          {selectedOption && (
            <div className="max-w-md w-full mx-auto bg-surface p-8 rounded-[32px] border border-text/10 shadow-xl">
              <p className="text-text/60 mb-4">Describe brevemente el uso de la página para ayudarte a generar contenido (mínimo 5 palabras).</p>
              <textarea 
                value={pageDescription}
                onChange={(e) => setPageDescription(e.target.value)}
                placeholder="Ej: Página de servicios para una clínica dental..."
                className="w-full px-4 py-3 bg-background border border-text/10 rounded-xl mb-4"
              />
              <div className="flex gap-4">
                <button onClick={() => setStep('project')} className="flex-1 py-3 bg-background text-text/60 rounded-xl font-bold">Regresar</button>
                <button onClick={() => onSelectOption(selectedOption, pageName, 'Omitido', getSuggestedPalette(''))} className="flex-1 py-3 bg-background text-text/60 rounded-xl font-bold">Omitir</button>
                <button 
                  onClick={handleFinalContinue}
                  disabled={!isDescriptionValid}
                  className="flex-1 py-3 bg-primary text-white rounded-xl font-bold disabled:opacity-50"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};
