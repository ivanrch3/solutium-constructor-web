import React from 'react';
import * as LucideIcons from 'lucide-react';
import { 
  Palette, 
  Type, 
  Maximize, 
  ShieldCheck, 
  Globe, 
  Smartphone,
  ChevronRight,
  Sparkles,
  MousePointer2,
  Layout,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { SettingControl } from './SettingControl';
import { useEditorStore } from '../../store/editorStore';
import { parseNumSafe } from './utils';

interface GlobalSettingsPanelProps {
  view?: string;
  settingsValues: Record<string, any>;
  onSettingChange: (id: string, settingId: string, value: any) => void;
  project: any;
  projectId: string | null;
  isSidebarMode?: boolean;
}

export const GlobalSettingsPanel: React.FC<GlobalSettingsPanelProps> = ({ 
  view = 'settings',
  settingsValues, 
  onSettingChange,
  project,
  projectId,
  isSidebarMode = false
}) => {
  const { siteContent, updateTheme } = useEditorStore();
  const theme = siteContent.theme;

  const getVal = (settingId: string, defaultValue: any) => {
    return settingsValues[`global_theme_${settingId}`] !== undefined 
      ? settingsValues[`global_theme_${settingId}`] 
      : defaultValue;
  };

  const handleThemeChange = (settingId: string, value: any) => {
    onSettingChange('global', `theme_${settingId}`, value);
    // Also update store theme for immediate access in modules
    updateTheme({ [settingId]: value });
  };

  const animations = [
    { id: 'fade-in', label: 'Fade In', desc: 'Sutil', icon: <LucideIcons.Eye size={18} /> },
    { id: 'slide-up', label: 'Slide Up', desc: 'Rápida', icon: <LucideIcons.ArrowUp size={18} /> },
    { id: 'slide-down', label: 'Slide Down', desc: 'Fluida', icon: <LucideIcons.ArrowDown size={18} /> },
    { id: 'scale-up', label: 'Scale Up', desc: 'Impactante', icon: <LucideIcons.Maximize size={18} /> },
    { id: 'zoom-in', label: 'Zoom In', desc: 'Llamativa', icon: <LucideIcons.Search size={18} /> },
    { id: 'flip', label: 'Flip', desc: 'Atrevida', icon: <LucideIcons.RotateCw size={18} /> },
    { id: 'blur-in', label: 'Blur In', desc: 'Elegante', icon: <LucideIcons.Cloud size={18} /> },
    { id: 'bounce', label: 'Bounce', desc: 'Divertida', icon: <LucideIcons.Activity size={18} /> },
    { id: 'stagger', label: 'Stagger', desc: 'Rítmica', icon: <LucideIcons.Layers size={18} /> },
    { id: 'skew', label: 'Skew', desc: 'Moderna', icon: <LucideIcons.Zap size={18} /> },
    { id: 'rotate', label: 'Rotate', desc: 'Dinámica', icon: <LucideIcons.RefreshCw size={18} /> },
    { id: 'focus', label: 'Focus', desc: 'Precisa', icon: <LucideIcons.Target size={18} /> },
  ];

  if (view === 'design-style') {
    return (
      <div className={`${isSidebarMode ? 'p-4 space-y-6' : 'max-w-2xl w-full mx-auto p-12 space-y-10'}`}>
        {!isSidebarMode && (
          <div className="flex flex-col space-y-2">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Palette className="text-primary w-8 h-8" />
              Configuración de Estilo Global
            </h2>
            <p className="text-slate-500 font-medium">Controla el comportamiento visual avanzado de tu sitio web.</p>
          </div>
        )}

        <div className="space-y-4">
          <div className={`${isSidebarMode ? 'p-3 rounded-xl' : 'p-4 rounded-2xl shadow-sm'} bg-white border border-slate-100 flex items-center gap-3 hover:border-primary/20 transition-all group`}>
            <div className={`${isSidebarMode ? 'w-8 h-8 rounded-lg' : 'w-12 h-12 rounded-xl'} bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-primary/5 transition-all`}>
              <LucideIcons.Moon size={isSidebarMode ? 16 : 22} />
            </div>
            <div className="flex-1">
              <h3 className={`${isSidebarMode ? 'text-xs' : 'text-sm'} font-bold text-slate-900`}>Modo Oscuro Alternado</h3>
              {!isSidebarMode && <p className="text-[10px] text-slate-500 font-medium">Alterna módulos entre claro y oscuro automáticamente.</p>}
            </div>
            <SettingControl
              setting={{ id: 'alternatingDarkMode', type: 'boolean', label: '', defaultValue: false }}
              value={theme.alternatingDarkMode || false}
              onChange={(val) => {
                updateTheme({ 
                  alternatingDarkMode: val,
                  alternatingThemeMode: val ? false : theme.alternatingThemeMode 
                });
                onSettingChange('global', 'theme_alternatingDarkMode', val);
                if (val) onSettingChange('global', 'theme_alternatingThemeMode', false);
              }}
              projectId={projectId}
            />
          </div>

          <div className={`${isSidebarMode ? 'p-3 rounded-xl' : 'p-4 rounded-2xl shadow-sm'} bg-white border border-slate-100 flex items-center gap-3 hover:border-primary/20 transition-all group`}>
            <div className={`${isSidebarMode ? 'w-8 h-8 rounded-lg' : 'w-12 h-12 rounded-xl'} bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-primary/5 transition-all`}>
              <Palette size={isSidebarMode ? 16 : 22} />
            </div>
            <div className="flex-1">
              <h3 className={`${isSidebarMode ? 'text-xs' : 'text-sm'} font-bold text-slate-900`}>Modo Proyecto Alternado</h3>
              {!isSidebarMode && <p className="text-[10px] text-slate-500 font-medium">Usa un color de marca para alternar secciones.</p>}
            </div>
            <SettingControl
              setting={{ id: 'alternatingThemeMode', type: 'boolean', label: '', defaultValue: false }}
              value={theme.alternatingThemeMode || false}
              onChange={(val) => {
                updateTheme({ 
                  alternatingThemeMode: val,
                  alternatingDarkMode: val ? false : theme.alternatingDarkMode
                });
                onSettingChange('global', 'theme_alternatingThemeMode', val);
                if (val) onSettingChange('global', 'theme_alternatingDarkMode', false);
              }}
              projectId={projectId}
            />
          </div>

          {(theme.alternatingDarkMode || theme.alternatingThemeMode) && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-2"
            >
              <button
                onClick={() => {
                  const newVal = !theme.invertedAlternatingMode;
                  updateTheme({ invertedAlternatingMode: newVal });
                  onSettingChange('global', 'theme_invertedAlternatingMode', newVal);
                }}
                className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-slate-200 text-[10px] font-bold uppercase tracking-wider transition-all ${
                  theme.invertedAlternatingMode 
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                    : 'bg-white text-slate-500 hover:border-primary/20 hover:text-primary'
                }`}
              >
                <LucideIcons.RefreshCw size={14} className={theme.invertedAlternatingMode ? 'animate-spin-slow' : ''} />
                Invertir Orden de Módulos
              </button>
            </motion.div>
          )}

          {theme.alternatingThemeMode && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${isSidebarMode ? 'p-4 rounded-2xl' : 'p-6 rounded-[2rem]'} bg-slate-50 border border-slate-100 space-y-3`}
            >
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Personalizar color del patrón</label>
              <SettingControl
                setting={{ id: 'themeBackgroundColor', type: 'color', label: 'Color de Fondo Oscuro', defaultValue: theme.secondaryColor }}
                value={theme.themeBackgroundColor || theme.secondaryColor}
                onChange={(val) => {
                  updateTheme({ themeBackgroundColor: val });
                  onSettingChange('global', 'theme_themeBackgroundColor', val);
                }}
                projectId={projectId}
                projectColors={[theme.primaryColor, theme.secondaryColor]}
              />
            </motion.div>
          )}
        </div>

        <div className={`${isSidebarMode ? 'p-4 rounded-xl' : 'p-6 rounded-2xl'} bg-amber-50 border border-amber-100 flex items-start gap-3`}>
          <LucideIcons.AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={isSidebarMode ? 16 : 20} />
          <p className={`${isSidebarMode ? 'text-[10px]' : 'text-xs'} text-amber-800 font-medium leading-relaxed`}>
            <span className="font-bold">Prioridad Visual:</span> Estas configuraciones forzarán un patrón visual rítmico, sobrescribiendo ajustes individuales.
          </p>
        </div>
      </div>
    );
  }

  if (view === 'design-animations') {
    return (
      <div className={`${isSidebarMode ? 'p-4 space-y-6' : 'max-w-2xl w-full mx-auto p-12 space-y-10'}`}>
        {!isSidebarMode && (
          <div className="flex flex-col space-y-2">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Sparkles className="text-primary w-8 h-8" />
              Animaciones Globales
            </h2>
            <p className="text-slate-500 font-medium">Define el comportamiento inicial de los módulos al cargar.</p>
          </div>
        )}

        <div className={`grid ${isSidebarMode ? 'grid-cols-1' : 'grid-cols-2'} gap-3 mb-6`}>
          {[
            { id: 'recommended', label: 'Recomendado', desc: 'Basado en estándares', icon: <LucideIcons.CheckCircle2 size={18} /> },
            { id: 'random', label: 'Aleatorio', desc: 'Mezcla dinámica', icon: <LucideIcons.Dice5 size={18} /> },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                updateTheme({ globalAnimationType: opt.id });
                onSettingChange('global', 'theme_globalAnimationType', opt.id);
              }}
              className={`flex items-center gap-3 ${isSidebarMode ? 'p-3 rounded-xl' : 'p-4 rounded-2xl shadow-lg shadow-primary/20'} border transition-all text-left ${
                theme.globalAnimationType === opt.id 
                  ? 'bg-primary text-white border-primary' 
                  : 'bg-white border-slate-100 text-slate-500 hover:border-primary/20'
              }`}
            >
              <div className={`${isSidebarMode ? 'w-8 h-8 rounded-lg' : 'w-10 h-10 rounded-xl'} flex items-center justify-center ${theme.globalAnimationType === opt.id ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-400'}`}>
                {React.cloneElement(opt.icon as React.ReactElement<any>, { size: isSidebarMode ? 14 : 18 })}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`${isSidebarMode ? 'text-xs' : 'text-sm'} font-bold truncate`}>{opt.label}</p>
                {!isSidebarMode && <p className={`text-[10px] ${theme.globalAnimationType === opt.id ? 'text-white/70' : 'text-slate-400'}`}>{opt.desc}</p>}
              </div>
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 mb-3 block">Animaciones Manuales</label>
          <div className={`grid grid-cols-1 gap-2 ${isSidebarMode ? 'max-h-[40vh]' : 'max-h-[50vh]'} overflow-y-auto pr-2 custom-scrollbar`}>
            {animations.map((anim) => (
              <button
                key={anim.id}
                onClick={() => {
                  updateTheme({ globalAnimationType: anim.id });
                  onSettingChange('global', 'theme_globalAnimationType', anim.id);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all border text-left group ${
                  theme.globalAnimationType === anim.id
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-transparent bg-slate-50/50 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className={`${isSidebarMode ? 'w-8 h-8 rounded-lg' : 'w-10 h-10 rounded-lg'} flex items-center justify-center transition-all ${
                  theme.globalAnimationType === anim.id ? 'bg-primary text-white' : 'bg-white text-slate-400 group-hover:text-primary'
                }`}>
                  {React.cloneElement(anim.icon as React.ReactElement<any>, { size: isSidebarMode ? 14 : 18 })}
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`${isSidebarMode ? 'text-xs' : 'text-sm'} font-bold ${theme.globalAnimationType === anim.id ? 'text-primary' : 'text-slate-900'} truncate block`}>{anim.label}</span>
                  {!isSidebarMode && <p className="text-[10px] text-slate-400 font-medium leading-none mt-1">{anim.desc}</p>}
                </div>
                {theme.globalAnimationType === anim.id && (
                  <LucideIcons.CheckCircle2 className="text-primary" size={isSidebarMode ? 14 : 18} />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center gap-2 justify-center">
            <LucideIcons.Info size={12} className="text-slate-300" />
            <span className="text-[9px] text-slate-400 font-medium italic">
                Cambio automático en tiempo real.
            </span>
        </div>
      </div>
    );
  }

  // DEFAULT VIEW: Settings (Colors, Typography, Layout)

  const projectColors = [
    getVal('primary_color', project?.brandColors?.primary || '#3B82F6'),
    getVal('secondary_color', '#F1F5F9'),
    getVal('accent_color', '#7C3AED'),
    getVal('background_color', '#F8FAFC'),
    getVal('text_color', '#0F172A'),
  ].filter(Boolean) as string[];

  const sections = [
    {
      id: 'colors',
      title: 'Paleta de Colores',
      description: 'Define los colores principales de tu identidad visual.',
      icon: <Palette className="w-5 h-5" />,
      settings: [
        {
          id: 'primary_color',
          label: 'Color Primario',
          type: 'color',
          defaultValue: project?.brandColors?.primary || '#3B82F6',
          description: 'Botones principales, acentos y llamadas a la acción.'
        },
        {
          id: 'secondary_color',
          label: 'Color Secundario',
          type: 'color',
          defaultValue: '#F1F5F9',
          description: 'Fondos alternos y elementos de apoyo.'
        },
        {
          id: 'accent_color',
          label: 'Color de Acento',
          type: 'color',
          defaultValue: '#7C3AED',
          description: 'Destacados y micro-interacciones.'
        },
        {
          id: 'background_color',
          label: 'Color de Fondo',
          type: 'color',
          defaultValue: '#F8FAFC',
          description: 'Color base de las secciones del sitio.'
        },
        {
          id: 'text_color',
          label: 'Color de Texto',
          type: 'color',
          defaultValue: '#0F172A',
          description: 'Color para el cuerpo de texto principal.'
        }
      ]
    },
    {
      id: 'typography',
      title: 'Tipografía Maestra',
      description: 'Selecciona las fuentes que darán voz a tu contenido.',
      icon: <Type className="w-5 h-5" />,
      settings: [
        {
          id: 'font_sans',
          label: 'Fuente del Cuerpo',
          type: 'select',
          defaultValue: 'Inter',
          options: [
            { label: 'Inter', value: 'Inter' },
            { label: 'Roboto', value: 'Roboto' },
            { label: 'Poppins', value: 'Poppins' },
            { label: 'Montserrat', value: 'Montserrat' },
            { label: 'Outfit', value: 'Outfit' },
            { label: 'Space Grotesk', value: 'Space Grotesk' }
          ]
        },
        {
          id: 'font_heading',
          label: 'Fuente de Títulos',
          type: 'select',
          defaultValue: 'Inter',
          options: [
            { label: 'Inter', value: 'Inter' },
            { label: 'Space Grotesk', value: 'Space Grotesk' },
            { label: 'Playfair Display', value: 'Playfair Display' },
            { label: 'Clash Display', value: 'Clash Display' },
            { label: 'Outfit', value: 'Outfit' }
          ]
        }
      ]
    },
    {
      id: 'layout',
      title: 'Estructura & Bordes',
      description: 'Ajusta la redondez y densidad del diseño.',
      icon: <Layout className="w-5 h-5" />,
      settings: [
        {
          id: 'radius',
          label: 'Radio de Esquinas',
          type: 'range',
          defaultValue: 12,
          min: 0,
          max: 32,
          unit: 'px'
        },
        {
          id: 'container_width',
          label: 'Ancho Máximo',
          type: 'range',
          defaultValue: 1400,
          min: 1000,
          max: 1800,
          unit: 'px'
        }
      ]
    }
  ];

  return (
    <div className="max-w-4xl w-full mx-auto p-8 space-y-12">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Sparkles className="text-primary w-8 h-8" />
          Ajustes Globales de Estilo
        </h2>
        <p className="text-slate-500 font-medium">Configura el ADN visual de tu proyecto para mantener la consistencia en todos los módulos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-4">
          <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <MousePointer2 className="w-4 h-4 text-primary" />
              Vista Previa
            </h3>
            <div className="space-y-3">
              <div 
                className="h-20 rounded-2xl flex items-center justify-center text-white font-bold p-4 text-center text-xs"
                style={{ 
                  backgroundColor: getVal('primary_color', project?.brandColors?.primary || '#3B82F6'),
                  borderRadius: `${parseNumSafe(getVal('radius', 12), 12)}px`
                }}
              >
                Botón Principal
              </div>
              <div className="flex gap-2">
                <div 
                  className="flex-1 h-10 rounded-xl border border-slate-200"
                  style={{ backgroundColor: getVal('secondary_color', '#F1F5F9'), borderRadius: `${parseNumSafe(getVal('radius', 12), 12) * 0.8}px` }}
                />
                <div 
                  className="flex-1 h-10 rounded-xl"
                  style={{ backgroundColor: getVal('accent_color', '#7C3AED'), borderRadius: `${parseNumSafe(getVal('radius', 12), 12) * 0.8}px` }}
                />
              </div>
              <div className="pt-2">
                <p 
                  className="text-lg font-bold"
                  style={{ fontFamily: getVal('font_heading', 'Inter'), color: getVal('text_color', '#0F172A') }}
                >
                  Título de Ejemplo
                </p>
                <p 
                  className="text-xs text-slate-400 mt-1"
                  style={{ fontFamily: getVal('font_sans', 'Inter') }}
                >
                  Este es un ejemplo de cómo se verá el cuerpo de texto en tu sitio web.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 space-y-2">
            <h4 className="text-xs font-black text-primary uppercase tracking-widest">Tip Pro</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Los cambios que realices aquí se aplicarán automáticamente a todos los módulos que no tengan configuraciones manuales de color.
            </p>
          </div>
        </div>

        <div className="md:col-span-2 space-y-10">
          {sections.map((section) => (
            <section key={section.id} className="space-y-6">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 bg-white rounded-2xl border border-slate-100 flex items-center justify-center shadow-sm text-primary">
                  {section.icon}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{section.title}</h3>
                  <p className="text-xs text-slate-500">{section.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                {section.settings.map((setting) => (
                  <div key={setting.id} className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      {setting.label}
                    </label>
                    <SettingControl
                      setting={setting as any}
                      value={getVal(setting.id, setting.defaultValue)}
                      onChange={(val) => handleThemeChange(setting.id, val)}
                      projectId={projectId}
                      projectColors={projectColors}
                    />
                    {setting.description && (
                      <p className="text-[10px] text-slate-400 font-medium italic mt-1">
                        {setting.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};
