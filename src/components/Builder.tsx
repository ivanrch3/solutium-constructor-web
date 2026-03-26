import React, { useState } from 'react';
import { 
  Sparkles, 
  Layout, 
  PlusSquare, 
  ArrowLeft,
  ChevronRight,
  Monitor,
  Smartphone,
  Tablet,
  Save,
  Eye,
  Plus,
  Type,
  Image as ImageIcon,
  Video,
  Users,
  Star,
  BarChart,
  Package,
  CreditCard,
  Mail,
  HelpCircle,
  MessageSquare,
  Menu,
  Navigation,
  Footprints,
  Maximize2,
  Layers,
  Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

type Step = 'choice' | 'ai-form' | 'ai-style' | 'editor';

const Builder: React.FC = () => {
  const [step, setStep] = useState<Step>('choice');
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const renderChoice = () => (
    <div className="p-8 max-w-5xl mx-auto text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-12">¿Cómo quieres crear tu página?</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={() => setStep('ai-form')}
          className="bg-blue-600 p-8 rounded-3xl text-white text-left flex flex-col h-full shadow-xl shadow-blue-100"
        >
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Generar con IA</h2>
          <p className="text-blue-100 text-sm leading-relaxed">
            Describe tu negocio y deja que nuestra inteligencia artificial cree la estructura, textos e imágenes por ti en segundos.
          </p>
        </motion.button>

        <div className="relative">
          <button className="bg-white p-8 rounded-3xl text-left flex flex-col h-full border border-gray-100 shadow-sm opacity-50 cursor-not-allowed">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-6">
              <Layout className="w-6 h-6 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Usar Plantilla</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Elige entre diseños pre-construidos profesionales optimizados para conversión. Ideal si quieres una base sólida rápida.
            </p>
          </button>
          <span className="absolute top-4 right-4 bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Próximamente</span>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={() => setStep('editor')}
          className="bg-white p-8 rounded-3xl text-left flex flex-col h-full border border-gray-100 shadow-sm"
        >
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-6">
            <PlusSquare className="w-6 h-6 text-gray-900" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Lienzo en Blanco</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Empieza desde cero. Añade secciones una a una y construye tu sitio con total control creativo sin distracciones.
          </p>
        </motion.button>
      </div>

      <button 
        onClick={() => window.history.back()}
        className="mt-12 text-gray-500 font-bold flex items-center gap-2 mx-auto hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" /> Atrás
      </button>
    </div>
  );

  const renderAIForm = () => (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-3xl shadow-sm border border-gray-100 mt-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Cuéntanos sobre tu proyecto</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Nombre de la página</label>
          <input 
            type="text" 
            placeholder="Ej: Inicio, Servicios, Contacto..." 
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Sector o Industria</label>
          <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white">
            <option>Selecciona una industria...</option>
            <option>Tecnología</option>
            <option>Salud</option>
            <option>Educación</option>
            <option>Comercio</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Descripción breve (mínimo 10 palabras)</label>
          <textarea 
            rows={4}
            placeholder="Describe qué hace tu negocio y qué ofreces..." 
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <p className="text-xs text-gray-400 mt-2">Palabras: 0/10</p>
        </div>

        <div className="flex justify-between pt-4">
          <button onClick={() => setStep('choice')} className="px-6 py-2 font-bold text-gray-500">Cancelar</button>
          <div className="flex gap-4">
            <button className="px-6 py-2 font-bold text-gray-500">Omitir</button>
            <button onClick={() => setStep('ai-style')} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold">Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAIStyle = () => (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-3xl shadow-sm border border-gray-100 mt-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Cuéntanos sobre tu proyecto</h2>
      
      <div className="space-y-8">
        <div>
          <p className="text-sm font-bold text-gray-700 mb-4">Objetivo principal</p>
          <div className="grid grid-cols-2 gap-3">
            {['Captar clientes', 'Vender productos', 'Presencia online', 'Informar / Educar', 'Portfolio / Galería', 'Reservas / Citas'].map(opt => (
              <button key={opt} className="px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-sm font-medium hover:border-blue-500 transition-all">{opt}</button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-bold text-gray-700 mb-4">Estilo visual</p>
          <div className="grid grid-cols-4 gap-3">
            {['Moderno', 'Elegante', 'Divertido', 'Minimalista', 'Corporativo', 'Creativo', 'Clásico', 'Atrevido'].map(opt => (
              <button key={opt} className="px-3 py-3 rounded-xl border border-gray-100 bg-gray-50 text-xs font-medium hover:border-blue-500 transition-all">{opt}</button>
            ))}
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <button onClick={() => setStep('ai-form')} className="px-6 py-2 font-bold text-gray-500">Atrás</button>
          <div className="flex gap-4">
            <button className="px-6 py-2 font-bold text-gray-500">Omitir</button>
            <button onClick={() => setStep('editor')} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold">Comenzar</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEditor = () => (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Left Panel - Modules */}
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Estructura</h3>
          <button className="p-1 hover:bg-gray-100 rounded"><Menu className="w-4 h-4" /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <section>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Navegación</h4>
            <div className="space-y-2">
              {[
                { icon: Navigation, label: 'Barra superior' },
                { icon: Menu, label: 'Menú' },
                { icon: Footprints, label: 'Pie de página' },
                { icon: Maximize2, label: 'Espaciadores' }
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer text-sm text-gray-600">
                  <item.icon className="w-4 h-4" /> {item.label}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Contenido</h4>
            <div className="space-y-2">
              {[
                { icon: Layout, label: 'Portada' },
                { icon: PlusSquare, label: 'Características' },
                { icon: Users, label: 'Sobre Nosotros' },
                { icon: Layers, label: 'Proceso' },
                { icon: ImageIcon, label: 'Galería' },
                { icon: Video, label: 'Video' }
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer text-sm text-gray-600">
                  <item.icon className="w-4 h-4" /> {item.label}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Confianza</h4>
            <div className="space-y-2">
              {[
                { icon: MessageSquare, label: 'Testimonios' },
                { icon: Users, label: 'Clientes' },
                { icon: BarChart, label: 'Estadísticas' },
                { icon: Users, label: 'Equipo' }
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer text-sm text-gray-600">
                  <item.icon className="w-4 h-4" /> {item.label}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="p-4 border-t border-gray-100">
          <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 text-sm">
            <Sparkles className="w-4 h-4" /> Generar con IA
          </button>
        </div>
      </div>

      {/* Main Content - Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-gray-900">Editor de Módulos</h2>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button onClick={() => setViewMode('desktop')} className={cn("p-1.5 rounded-md", viewMode === 'desktop' && "bg-white shadow-sm")}><Monitor className="w-4 h-4" /></button>
              <button onClick={() => setViewMode('tablet')} className={cn("p-1.5 rounded-md", viewMode === 'tablet' && "bg-white shadow-sm")}><Tablet className="w-4 h-4" /></button>
              <button onClick={() => setViewMode('mobile')} className={cn("p-1.5 rounded-md", viewMode === 'mobile' && "bg-white shadow-sm")}><Smartphone className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-lg">
              <Eye className="w-4 h-4" /> Vista Previa
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg shadow-lg shadow-gray-200">
              <Save className="w-4 h-4" /> Guardar
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-y-auto p-12 bg-gray-50 flex justify-center">
          <div className={cn(
            "bg-white shadow-2xl transition-all duration-300 overflow-hidden",
            viewMode === 'desktop' ? "w-full max-w-5xl" : viewMode === 'tablet' ? "w-[768px]" : "w-[375px]"
          )}>
            {/* Mock Page Content */}
            <div className="bg-gray-900 text-white p-20 text-center relative group">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button className="p-2 bg-white/10 rounded hover:bg-white/20"><Palette className="w-4 h-4" /></button>
                <button className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30">×</button>
              </div>
              <h1 className="text-6xl font-black mb-6">Bienvenido a Negoioc</h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Loquesea sdf asdf sd fsdf sdf sdf sdf sdf s
              </p>
              <div className="mt-10 flex justify-center gap-4">
                <button className="px-8 py-3 bg-blue-600 rounded-lg font-bold">EMPEZAR →</button>
              </div>
            </div>

            <div className="py-20 px-12 text-center border-t border-gray-100">
              <button className="flex items-center gap-2 mx-auto px-6 py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-bold hover:border-blue-300 hover:text-blue-500 transition-all">
                <Plus className="w-5 h-5" /> Añadir Módulo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <AnimatePresence mode="wait">
        {step === 'choice' && (
          <motion.div key="choice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {renderChoice()}
          </motion.div>
        )}
        {step === 'ai-form' && (
          <motion.div key="ai-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {renderAIForm()}
          </motion.div>
        )}
        {step === 'ai-style' && (
          <motion.div key="ai-style" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {renderAIStyle()}
          </motion.div>
        )}
        {step === 'editor' && (
          <motion.div key="editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60]">
            {renderEditor()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Builder;
