import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock,
  Trash2,
  Palette,
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
  PlusCircle,
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
  Megaphone,
  List,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  ArrowRightCircle,
  MapPin,
  ArrowUpDown,
  Rocket,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { APP_NAME, APP_LOGO_URL } from '../constants';
import { useSolutium } from '../hooks/useSolutium';
import { useAuth } from '../contexts/AuthContext';
import { ProductShowcase } from './ProductShowcase';

type Step = 'choice' | 'ai-form' | 'ai-style' | 'generating' | 'editor';
type ModuleType = 'hero' | 'features' | 'products' | 'contact' | 'about' | 'process' | 'gallery' | 'testimonials' | 'pricing' | 'faq';

interface CanvasModule {
  id: string;
  type: ModuleType;
  title: string;
  content: any;
}

const Builder: React.FC = () => {
  const navigate = useNavigate();
  const { config, saveData, publishSite } = useSolutium();
  const { isEmbedded } = useAuth();
  const [step, setStep] = useState<Step>('choice');
  const [mode, setMode] = useState<'ai' | 'blank'>('ai');
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [canvasModules, setCanvasModules] = useState<CanvasModule[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    description: '',
    objective: '',
    style: ''
  });

  const appLogo = APP_LOGO_URL;
  const appName = APP_NAME;

  const addModule = (type: ModuleType, title: string) => {
    const newModule: CanvasModule = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title,
      content: {}
    };
    setCanvasModules([...canvasModules, newModule]);
  };

  const removeModule = (id: string) => {
    setCanvasModules(canvasModules.filter(m => m.id !== id));
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await publishSite();
      alert('¡Sitio publicado con éxito!');
    } catch (error) {
      console.error('Error publishing:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveData({ modules: canvasModules, formData });
      alert('Progreso guardado.');
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderChoice = () => (
    <div className={cn("min-h-screen bg-gray-50 flex flex-col items-center px-4", isEmbedded ? "pt-6" : "pt-12")}>
      {/* Header Logo */}
      {!isEmbedded && (
        <div className="mb-12 flex flex-col items-center">
          <div className="flex items-center gap-3">
            <img src={appLogo} alt={appName} className="h-16 w-16 object-contain" referrerPolicy="no-referrer" />
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-gray-900 leading-none">Constructor</span>
              <span className="text-3xl font-bold text-[#1e3a8a] leading-none">Web</span>
              <span className="text-xs font-medium text-pink-500 self-end mt-1">by Solutium</span>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-4xl font-bold text-gray-900 mb-16">¿Cómo quieres crear tu página?</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        {/* Generar con IA */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setMode('ai'); setStep('ai-form'); }}
          className="bg-[#3b82f6] text-white p-10 rounded-[2.5rem] text-left flex flex-col h-full shadow-xl shadow-blue-100 relative overflow-hidden group"
        >
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-8">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Generar con IA</h2>
          <p className="text-blue-50 text-lg leading-relaxed">
            Describe tu negocio y deja que nuestra inteligencia artificial cree la estructura, textos e imágenes por ti en segundos.
          </p>
        </motion.button>

        {/* Usar Plantilla */}
        <div className="relative group">
          <div className="bg-white p-10 rounded-[2.5rem] text-left flex flex-col h-full border border-gray-100 shadow-sm opacity-60">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-8">
              <Layout className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-400 mb-4">Usar Plantilla</h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              Elige entre diseños pre-construidos profesionales optimizados para conversión. Ideal si quieres una base sólida rápida.
            </p>
          </div>
          <span className="absolute top-6 right-6 bg-gray-100 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Próximamente
          </span>
        </div>

        {/* Lienzo en Blanco */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setMode('blank'); setStep('ai-form'); }}
          className="bg-white p-10 rounded-[2.5rem] text-left flex flex-col h-full border border-gray-100 shadow-sm"
        >
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-8">
            <PlusSquare className="w-8 h-8 text-gray-900" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Lienzo en Blanco</h2>
          <p className="text-gray-500 text-lg leading-relaxed">
            Empieza desde cero. Añade secciones una a una y construye tu sitio con total control creativo sin distracciones.
          </p>
        </motion.button>
      </div>

      <button 
        onClick={() => window.history.back()}
        className="mt-16 text-gray-500 font-bold flex items-center gap-2 hover:text-gray-900 transition-colors"
      >
        Atrás
      </button>
    </div>
  );

  const renderAIForm = () => (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-10 relative"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Cuéntanos sobre tu proyecto</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">Nombre de la página</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Inicio, Servicios, Contacto..." 
              className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-lg transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">Sector o Industria</label>
            <div className="relative">
              <select 
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white text-lg text-gray-500"
              >
                <option value="">Selecciona una industria...</option>
                <option value="tech">Tecnología</option>
                <option value="health">Salud</option>
                <option value="edu">Educación</option>
                <option value="retail">Comercio</option>
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <ChevronRight className="w-5 h-5 rotate-90" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">Descripción breve (mínimo 10 palabras)</label>
            <textarea 
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe qué hace tu negocio y qué ofreces..." 
              className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-lg resize-none"
            />
            <p className="text-xs text-gray-400 mt-2">Palabras: {formData.description.split(/\s+/).filter(Boolean).length}/10</p>
          </div>

          <div className="flex items-center justify-between pt-6">
            <button 
              onClick={() => setStep('choice')}
              className="px-8 py-3 font-bold text-gray-900 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <div className="flex items-center gap-8">
              <button 
                onClick={() => setStep('ai-style')}
                className="font-bold text-gray-500 hover:text-gray-900 transition-colors"
              >
                Omitir
              </button>
              <button 
                onClick={() => setStep('ai-style')}
                disabled={!formData.name}
                className={cn(
                  "px-10 py-3 rounded-xl font-bold transition-all",
                  formData.name ? "bg-[#3b82f6] text-white shadow-lg shadow-blue-100" : "bg-blue-200 text-white cursor-not-allowed"
                )}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const handleStart = () => {
    if (mode === 'ai') {
      setStep('generating');
      setTimeout(() => {
        setStep('editor');
      }, 3000);
    } else {
      setStep('editor');
    }
  };

  const renderGenerating = () => (
    <div className="fixed inset-0 z-[90] bg-white flex flex-col items-center justify-center overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>

      <motion.div
        animate={{ 
          scale: [1, 1.05, 1],
          boxShadow: [
            "0 0 0 0 rgba(59, 130, 246, 0)",
            "0 0 40px 10px rgba(59, 130, 246, 0.1)",
            "0 0 0 0 rgba(59, 130, 246, 0)"
          ]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="mb-12 relative"
      >
        <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full" />
        <img src={appLogo} alt={appName} className="h-32 w-32 object-contain relative z-10" referrerPolicy="no-referrer" />
      </motion.div>

      <div className="text-center relative z-10">
        <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
          Diseñando tu <span className="text-blue-600">éxito digital</span>
        </h2>
        <p className="text-gray-500 text-xl max-w-md mx-auto leading-relaxed">
          Nuestra IA está analizando tu sector para crear la estructura perfecta para <span className="font-bold text-gray-800">{formData.name || 'tu proyecto'}</span>
        </p>
      </div>
      
      <div className="mt-16 w-80">
        <div className="flex justify-between mb-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
          <span>Progreso</span>
          <span>75%</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner p-0.5">
          <motion.div 
            initial={{ width: '0%' }}
            animate={{ width: '75%' }}
            transition={{ duration: 2.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full shadow-lg"
          />
        </div>
        <div className="mt-6 flex flex-col items-center gap-2">
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="w-1.5 h-1.5 bg-blue-600 rounded-full"
              />
            ))}
          </div>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Optimizando SEO y Conversión</span>
        </div>
      </div>
    </div>
  );

  const renderAIStyle = () => (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-10 relative"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Cuéntanos sobre tu proyecto</h2>
        
        <div className="space-y-8">
          <div>
            <p className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Objetivo principal</p>
            <div className="grid grid-cols-2 gap-3">
              {['Captar clientes', 'Vender productos', 'Presencia online', 'Informar / Educar', 'Portfolio / Galería', 'Reservas / Citas'].map(opt => (
                <button 
                  key={opt} 
                  onClick={() => setFormData({ ...formData, objective: opt })}
                  className={cn(
                    "px-4 py-4 rounded-xl border text-sm font-bold transition-all",
                    formData.objective === opt 
                      ? "border-blue-500 bg-blue-50 text-blue-600" 
                      : "border-gray-100 bg-gray-50 text-gray-600 hover:border-blue-200"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Estilo visual</p>
            <div className="grid grid-cols-4 gap-3">
              {['Moderno', 'Elegante', 'Divertido', 'Minimalista', 'Corporativo', 'Creativo', 'Clásico', 'Atrevido'].map(opt => (
                <button 
                  key={opt} 
                  onClick={() => setFormData({ ...formData, style: opt })}
                  className={cn(
                    "px-3 py-4 rounded-xl border text-xs font-bold transition-all",
                    formData.style === opt 
                      ? "border-blue-500 bg-blue-50 text-blue-600" 
                      : "border-gray-100 bg-gray-50 text-gray-600 hover:border-blue-200"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-6">
            <button 
              onClick={() => setStep('ai-form')}
              className="px-8 py-3 font-bold text-gray-900 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Atrás
            </button>
            <div className="flex items-center gap-8">
              <button 
                onClick={handleStart}
                className="font-bold text-gray-500 hover:text-gray-900 transition-colors"
              >
                Omitir
              </button>
              <button 
                onClick={handleStart}
                className="px-10 py-3 bg-[#3b82f6] text-white rounded-xl font-bold shadow-lg shadow-blue-100"
              >
                Comenzar
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderEditor = () => (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans text-gray-600">
      {/* 1. Leftmost Sidebar - Navigation */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col z-30 shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-1">
            <img src={appLogo} alt={appName} className="h-10 w-10 object-contain" referrerPolicy="no-referrer" />
            <div className="flex flex-col">
              <span className="text-xl font-black text-gray-900 leading-none">Constructor</span>
              <span className="text-xl font-black text-[#1e3a8a] leading-none text-blue-900">Web</span>
              <span className="text-[10px] font-bold text-pink-500 self-end mt-0.5">by Solutium</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">v1.0.0</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-2 custom-scrollbar">
          <div className="space-y-1">
            <button className="w-full flex items-center justify-between p-3 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <Layout className="w-5 h-5" />
                <span>Diseño</span>
              </div>
              <ChevronRight className="w-4 h-4 rotate-90" />
            </button>
            
            <div className="space-y-1">
              <button className="w-full flex items-center justify-between p-3 text-sm font-bold text-blue-600 bg-blue-50/50 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5" />
                  <span>Constructor</span>
                </div>
                <ChevronRight className="w-4 h-4 rotate-90" />
              </button>
              
              <div className="pl-4 space-y-6 mt-4">
                <section>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Navegación</h4>
                  <div className="space-y-2">
                    {[
                      { icon: Layout, label: 'Barra superior' },
                      { icon: Menu, label: 'Menú' },
                      { icon: Footprints, label: 'Pie de página' },
                      { icon: ArrowUpDown, label: 'Espaciadores' }
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-3 text-xs font-bold text-gray-500 hover:text-gray-900 cursor-pointer transition-colors">
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Contenido</h4>
                  <div className="space-y-2">
                    {[
                      { icon: Megaphone, label: 'Portada', type: 'hero' as ModuleType },
                      { icon: List, label: 'Características', type: 'features' as ModuleType },
                      { icon: Briefcase, label: 'Sobre Nosotros', type: 'about' as ModuleType },
                      { icon: Layers, label: 'Proceso', type: 'process' as ModuleType },
                      { icon: ImageIcon, label: 'Galería', type: 'gallery' as ModuleType },
                      { icon: Video, label: 'Video', type: 'video' as ModuleType }
                    ].map(item => (
                      <div 
                        key={item.label} 
                        onClick={() => addModule(item.type, item.label)}
                        className="flex items-center gap-3 text-xs font-bold text-gray-500 hover:text-gray-900 cursor-pointer transition-colors"
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Confianza</h4>
                  <div className="space-y-2">
                    {[
                      { icon: MessageSquare, label: 'Testimonios', type: 'testimonials' as ModuleType },
                      { icon: ShieldCheck, label: 'Clientes', type: 'clients' as ModuleType },
                      { icon: CheckCircle2, label: 'Estadísticas', type: 'stats' as ModuleType },
                      { icon: Users, label: 'Equipo', type: 'team' as ModuleType }
                    ].map(item => (
                      <div 
                        key={item.label} 
                        onClick={() => addModule(item.type, item.label)}
                        className="flex items-center gap-3 text-xs font-bold text-gray-500 hover:text-gray-900 cursor-pointer transition-colors"
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Ventas</h4>
                  <div className="space-y-2">
                    {[
                      { icon: Package, label: 'Productos', type: 'products' as ModuleType },
                      { icon: CreditCard, label: 'Planes', type: 'pricing' as ModuleType },
                      { icon: ArrowRightCircle, label: 'Call to Action (CTA)', type: 'cta' as ModuleType }
                    ].map(item => (
                      <div 
                        key={item.label} 
                        onClick={() => addModule(item.type, item.label)}
                        className="flex items-center gap-3 text-xs font-bold text-gray-500 hover:text-gray-900 cursor-pointer transition-colors"
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Contacto</h4>
                  <div className="space-y-2">
                    {[
                      { icon: MapPin, label: 'Contacto', type: 'contact' as ModuleType },
                      { icon: Mail, label: 'Newsletter', type: 'newsletter' as ModuleType },
                      { icon: HelpCircle, label: 'FAQ', type: 'faq' as ModuleType }
                    ].map(item => (
                      <div 
                        key={item.label} 
                        onClick={() => addModule(item.type, item.label)}
                        className="flex items-center gap-3 text-xs font-bold text-gray-500 hover:text-gray-900 cursor-pointer transition-colors"
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            <button 
              onClick={() => navigate('/data')}
              className="w-full flex items-center justify-between p-3 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors mt-4"
            >
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5" />
                <span>Datos</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <button className="w-full py-3 bg-[#1e3a8a] text-white rounded-xl font-bold flex items-center justify-center gap-2 text-xs shadow-lg shadow-blue-900/20 hover:bg-blue-800 transition-all active:scale-95">
            <Sparkles className="w-4 h-4" /> Generar con IA
          </button>
          
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between group cursor-pointer hover:bg-white hover:shadow-sm transition-all">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-bold text-blue-600 shadow-sm">N</div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-900">{formData.name || 'Negoioc'}</span>
                <span className="text-[10px] text-gray-400">Proyecto: Proyecto Local</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
          </div>
        </div>
      </div>

      {/* 2. Middle Panel - Structure & Module Editor */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col z-20 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-pink-100">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-bold text-gray-900">Estructura</h3>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {/* Module List */}
          <div className="space-y-3">
            {canvasModules.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sin módulos</p>
              </div>
            ) : (
              canvasModules.map((module) => (
                <div key={module.id} className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-blue-200 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <div className="w-1 h-1 bg-gray-300 rounded-full" />
                        <div className="w-1 h-1 bg-gray-300 rounded-full" />
                        <div className="w-1 h-1 bg-gray-300 rounded-full" />
                      </div>
                      <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                        <Layers className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-black text-gray-900">{module.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trash2 
                        className="w-4 h-4 text-gray-400 hover:text-red-500 cursor-pointer" 
                        onClick={() => removeModule(module.id)}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 3. Right Panel - Canvas Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f1f5f9]">
        {/* Canvas Header */}
        <div className="h-20 px-8 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900">Editor de Módulos</h2>
            <p className="text-xs text-gray-400 font-medium">Añade módulos desde el constructor a la izquierda para construir tu página.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-600 text-sm font-bold rounded-xl shadow-sm hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              <Save className={cn("w-4 h-4", isSaving && "animate-spin")} /> 
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
            <button 
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              <Rocket className={cn("w-4 h-4", isPublishing && "animate-spin")} /> 
              {isPublishing ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </div>

        {/* Canvas Container */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar flex flex-col items-center">
          <div className={cn(
            "bg-white shadow-2xl transition-all duration-500 overflow-hidden flex flex-col min-h-full border border-gray-100 relative",
            viewMode === 'desktop' ? "w-full max-w-5xl" : viewMode === 'tablet' ? "w-[768px]" : "w-[375px]"
          )}
          style={{ borderRadius: 'var(--border-radius)' }}
          >
            {canvasModules.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                  <Plus className="w-10 h-10 text-blue-400" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Tu lienzo está vacío</h3>
                <p className="text-gray-400 max-w-xs mx-auto">Añade módulos desde la barra lateral izquierda para empezar a construir tu sitio.</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {canvasModules.map((module) => (
                  <div key={module.id} className="relative group border-b border-gray-50 last:border-0">
                    {/* Module Controls */}
                    <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => removeModule(module.id)}
                        className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Module Content Rendering */}
                    {module.type === 'hero' && (
                      <div className="relative min-h-[500px] flex items-center justify-center p-20 text-center overflow-hidden bg-gray-900">
                        <img 
                          src="https://picsum.photos/seed/hero/1200/800" 
                          alt="Hero" 
                          className="absolute inset-0 w-full h-full object-cover opacity-40"
                          referrerPolicy="no-referrer"
                        />
                        <div className="relative z-10 max-w-3xl">
                          <h1 className="text-6xl font-black text-white mb-6 leading-tight">
                            {formData.name || 'Tu Gran Título Aquí'}
                          </h1>
                          <p className="text-xl text-gray-300 mb-10">
                            {formData.description || 'Describe tu propuesta de valor única en esta sección.'}
                          </p>
                          <button className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all">
                            Comenzar Ahora
                          </button>
                        </div>
                      </div>
                    )}

                    {module.type === 'features' && (
                      <div className="py-20 px-12 bg-white">
                        <h2 className="text-3xl font-black text-gray-900 mb-12 text-center">Características Principales</h2>
                        <div className="grid grid-cols-3 gap-10">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="text-center">
                              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Sparkles className="w-8 h-8 text-blue-600" />
                              </div>
                              <h4 className="text-xl font-bold text-gray-900 mb-3">Característica {i}</h4>
                              <p className="text-gray-500 leading-relaxed">Explicación detallada de cómo este beneficio ayuda a tu cliente.</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {module.type === 'products' && (
                      <ProductShowcase />
                    )}

                    {/* Fallback for other modules */}
                    {!['hero', 'features', 'products'].includes(module.type) && (
                      <div className="py-20 px-12 bg-gray-50 text-center border-y border-gray-100">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                          <Layers className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{module.title}</h3>
                        <p className="text-sm text-gray-400">Módulo en desarrollo</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add Module Button at bottom of canvas */}
            <div className="py-12 flex justify-center bg-gray-50/30 border-t border-gray-100">
              <button 
                onClick={() => addModule('hero', 'Nueva Sección')}
                className="flex items-center gap-3 px-8 py-4 bg-white border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all group shadow-sm"
              >
                <PlusCircle className="w-6 h-6 group-hover:scale-110 transition-transform" /> Añadir Módulo
              </button>
            </div>
          </div>
        </div>

        {/* 4. Footer - Status Bar */}
        <div className="h-12 bg-white border-t border-gray-200 px-6 flex items-center justify-between text-[10px] font-bold tracking-widest uppercase">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-green-500 bg-green-50 px-3 py-1 rounded-full">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span>Configuración Recibida</span>
            </div>
            <div className="text-gray-400 border-l border-gray-100 pl-6">
              ID: <span className="text-gray-600">5210c610</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-gray-400">
            <div className="flex items-center gap-2">
              <span>Ping:</span>
              <span className="text-green-500">70ms</span>
            </div>
            <div className="flex items-center gap-4 border-l border-gray-100 pl-6">
              <div className="flex items-center gap-1">
                <span>U:</span>
                <span className="text-gray-600">0,06 Mbit/s</span>
              </div>
              <div className="flex items-center gap-1">
                <span>D:</span>
                <span className="text-gray-600">0,05 Mbit/s</span>
              </div>
            </div>
            <div className="flex items-center gap-4 border-l border-gray-100 pl-6">
              <span className="text-gray-600">ESP</span>
              <span className="text-gray-600">16:44 26/3/2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Background Choice Screen (Blurred when modal is open) */}
      <div className={cn(
        "transition-all duration-300",
        (step === 'ai-form' || step === 'ai-style') && "blur-md pointer-events-none brightness-75"
      )}>
        {renderChoice()}
      </div>

      <AnimatePresence mode="wait">
        {step === 'ai-form' && (
          <motion.div 
            key="ai-form" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/20 backdrop-blur-sm"
          >
            {renderAIForm()}
          </motion.div>
        )}
        {step === 'ai-style' && (
          <motion.div 
            key="ai-style" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/20 backdrop-blur-sm"
          >
            {renderAIStyle()}
          </motion.div>
        )}
        {step === 'generating' && (
          <motion.div 
            key="generating" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
          >
            {renderGenerating()}
          </motion.div>
        )}
        {step === 'editor' && (
          <motion.div key="editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100]">
            {renderEditor()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Builder;
