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
  AlertCircle,
  ArrowLeft,
  Settings,
  Save
} from 'lucide-react';
import { motion } from 'motion/react';
import { SettingControl } from './SettingControl';
import { useEditorStore } from '../../store/editorStore';
import { parseNumSafe } from './utils';
import { getMetaPixelStatus, isValidMetaPixelId, normalizeMetaPixelId } from '../../utils/metaPixel';
import * as registryModules from './registry';

interface GlobalSettingsPanelProps {
  view?: string;
  settingsValues: Record<string, any>;
  onSettingChange: (id: string, settingId: string, value: any) => void;
  onSaveConfiguration?: () => Promise<boolean> | boolean;
  project: any;
  projectId: string | null;
  isSidebarMode?: boolean;
  onBack?: () => void;
  siteName?: string;
  onSiteNameChange?: (name: string) => void;
  saveStatus?: 'idle' | 'loading' | 'success' | 'error';
  hasUnsavedChanges?: boolean;
  isSaving?: boolean;
}

const TEMPORARY_SAVE_INTERVAL_STORAGE_KEY = 'solutium_constructor_temporary_save_interval_minutes';
const TEMPORARY_SAVE_NOTICE_STORAGE_KEY = 'solutium_constructor_temporary_save_notice_enabled';
const VALID_TEMPORARY_SAVE_INTERVALS = new Set([1, 3, 10]);

const normalizeTemporarySaveInterval = (value: any) => {
  const numericValue = Number(value);
  return VALID_TEMPORARY_SAVE_INTERVALS.has(numericValue) ? numericValue : 3;
};

const normalizeBooleanPreference = (value: any, fallback: boolean) => {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return Boolean(value);
};

const getThemeSettingStorageKey = (settingId: string) => {
  if (settingId === 'metaPixelEnabled') return 'global_theme_meta_pixel_enabled';
  if (settingId === 'metaPixelId') return 'global_theme_meta_pixel_id';
  return `global_theme_${settingId}`;
};

const getLegacyThemeSettingStorageKey = (settingId: string) => {
  if (settingId === 'metaPixelEnabled') return 'global_theme_metaPixelEnabled';
  if (settingId === 'metaPixelId') return 'global_theme_metaPixelId';
  return null;
};

export const GlobalSettingsPanel: React.FC<GlobalSettingsPanelProps> = ({
  view = 'settings',
  settingsValues,
  onSettingChange,
  onSaveConfiguration,
  project,
  projectId,
  isSidebarMode = false,
  onBack,
  siteName,
  onSiteNameChange,
  saveStatus = 'idle',
  hasUnsavedChanges = false,
  isSaving = false
}) => {
  const { siteContent, updateTheme, selectedSectionId } = useEditorStore();
  const theme = siteContent.theme;
  const [activeInternalTab, setActiveInternalTab] = React.useState<'seo' | 'marketing' | 'conversion' | 'style'>('style');
  const [backupSettingsSavedNotice, setBackupSettingsSavedNotice] = React.useState(false);
  const [metaPixelDraftId, setMetaPixelDraftId] = React.useState(() =>
    normalizeMetaPixelId(
      settingsValues[getThemeSettingStorageKey('metaPixelId')] ??
      settingsValues[getLegacyThemeSettingStorageKey('metaPixelId') || ''] ??
      theme?.metaPixelId ??
      ''
    )
  );
  const [metaPixelError, setMetaPixelError] = React.useState<string | null>(null);
  const [metaPixelSaveFeedback, setMetaPixelSaveFeedback] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const selectedSection = selectedSectionId
    ? siteContent.sections.find((section) => section.id === selectedSectionId)
    : null;

  const selectedModuleDef = selectedSection
    ? (Object.values(registryModules).find((module) => {
        if ('id' in module) {
          return selectedSection.id.startsWith((module as any).id);
        }
        return false;
      }) as any)
    : null;

  const selectedAnimationElement = selectedModuleDef?.elements?.find((element: any) =>
    element.id?.includes('animation_2')
  );

  const getVal = (settingId: string, defaultValue: any) => {
    const storageKey = getThemeSettingStorageKey(settingId);
    const legacyKey = getLegacyThemeSettingStorageKey(settingId);

    if (settingsValues[storageKey] !== undefined) {
      return settingsValues[storageKey];
    }

    if (legacyKey && settingsValues[legacyKey] !== undefined) {
      return settingsValues[legacyKey];
    }

    return defaultValue;
  };

  const handleThemeChange = (settingId: string, value: any) => {
    const storageKey = getThemeSettingStorageKey(settingId).replace('global_', '');
    onSettingChange('global', storageKey, value);
    if (
      settingId === 'builder_temporary_save_interval_minutes' ||
      settingId === 'builder_temporary_save_notice_enabled'
    ) {
      setBackupSettingsSavedNotice(false);
    }

    // Also update store theme for immediate access in modules
    updateTheme({ [settingId]: value });
  };

  React.useEffect(() => {
    setMetaPixelDraftId(normalizeMetaPixelId(
      settingsValues[getThemeSettingStorageKey('metaPixelId')] ??
      settingsValues[getLegacyThemeSettingStorageKey('metaPixelId') || ''] ??
      theme?.metaPixelId ??
      ''
    ));
  }, [settingsValues, theme?.metaPixelId]);

  React.useEffect(() => {
    if (!metaPixelSaveFeedback || metaPixelSaveFeedback.type !== 'success') return;
    const timer = window.setTimeout(() => setMetaPixelSaveFeedback(null), 3000);
    return () => window.clearTimeout(timer);
  }, [metaPixelSaveFeedback]);

  const handleSaveTemporaryBackupSettings = () => {
    try {
      const interval = normalizeTemporarySaveInterval(
        getVal('builder_temporary_save_interval_minutes', 3)
      );
      const noticeEnabled = normalizeBooleanPreference(getVal('builder_temporary_save_notice_enabled', true), true);

      window.localStorage.setItem(TEMPORARY_SAVE_INTERVAL_STORAGE_KEY, String(interval));
      window.localStorage.setItem(TEMPORARY_SAVE_NOTICE_STORAGE_KEY, String(noticeEnabled));
      onSettingChange('global', 'theme_builder_temporary_save_interval_minutes', interval);
      onSettingChange('global', 'theme_builder_temporary_save_notice_enabled', noticeEnabled);
      setBackupSettingsSavedNotice(true);
      window.setTimeout(() => setBackupSettingsSavedNotice(false), 3000);
    } catch (error) {
      console.warn('[LOCAL_DRAFT_SNAPSHOT] Unable to persist temporary backup settings:', error);
      setBackupSettingsSavedNotice(false);
    }
  };

  const persistMetaPixelId = () => {
    const normalized = normalizeMetaPixelId(metaPixelDraftId);
    if (!normalized) {
      handleThemeChange('metaPixelId', '');
      setMetaPixelError(null);
      return '';
    }

    if (!isValidMetaPixelId(normalized)) {
      handleThemeChange('metaPixelEnabled', false);
      setMetaPixelError('Ingresa un identificador numerico valido de Meta Pixel.');
      return null;
    }

    handleThemeChange('metaPixelId', normalized);
    setMetaPixelDraftId(normalized);
    setMetaPixelError(null);
    return normalized;
  };

  const handleMetaPixelInputChange = (rawValue: string) => {
    setMetaPixelDraftId(rawValue);
    if (metaPixelError) setMetaPixelError(null);
    if (metaPixelSaveFeedback) setMetaPixelSaveFeedback(null);
    handleThemeChange('metaPixelId', rawValue);
  };

  const toggleMetaPixel = (enabled: boolean) => {
    if (metaPixelSaveFeedback) setMetaPixelSaveFeedback(null);
    if (!enabled) {
      handleThemeChange('metaPixelEnabled', false);
      setMetaPixelError(null);
      return;
    }

    const persistedId = persistMetaPixelId();
    if (!persistedId) {
      handleThemeChange('metaPixelEnabled', false);
      if (persistedId === '') {
        setMetaPixelError('Ingresa primero el ID numerico de tu Pixel de Meta.');
      }
      return;
    }

    handleThemeChange('metaPixelEnabled', true);
  };

  const handleSaveMetaPixelConfiguration = async () => {
    if (!onSaveConfiguration || isSaving || saveStatus === 'loading') return;

    const normalized = normalizeMetaPixelId(metaPixelDraftId);
    const enabled = Boolean(getVal('metaPixelEnabled', theme?.metaPixelEnabled ?? false));

    if (!normalized) {
      if (enabled) {
        setMetaPixelError('Ingresa primero el ID numerico de tu Pixel de Meta.');
        setMetaPixelSaveFeedback({
          type: 'error',
          message: 'No pudimos guardar la configuración. Revisa el ID del Pixel.'
        });
        return;
      }

      handleThemeChange('metaPixelId', '');
      setMetaPixelDraftId('');
      setMetaPixelError(null);
    } else if (!isValidMetaPixelId(normalized)) {
      setMetaPixelError('Ingresa un identificador numerico valido de Meta Pixel.');
      setMetaPixelSaveFeedback({
        type: 'error',
        message: 'No pudimos guardar la configuración. Revisa el ID del Pixel.'
      });
      return;
    } else {
      handleThemeChange('metaPixelId', normalized);
      setMetaPixelDraftId(normalized);
      setMetaPixelError(null);
    }

    const saved = await onSaveConfiguration();
    setMetaPixelSaveFeedback(saved
      ? { type: 'success', message: 'Configuración guardada correctamente.' }
      : { type: 'error', message: 'No pudimos guardar la configuración. Intenta nuevamente.' });
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

  const ChecklistItem = ({ title, checked = false }: { title: string, checked?: boolean }) => (
    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 group hover:border-primary/20 transition-all">
      <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${checked ? 'bg-primary text-white' : 'bg-slate-50 text-slate-300 border border-slate-200 group-hover:border-primary/30'}`}>
        {checked && <LucideIcons.Check size={14} strokeWidth={3} />}
      </div>
      <span className={`text-sm font-medium ${checked ? 'text-slate-900' : 'text-slate-400 italic'}`}>
        {title}
      </span>
      {checked && (
        <div className="ml-auto flex items-center gap-1.5 px-2 py-0.5 bg-primary/5 text-primary rounded-full">
          <LucideIcons.Zap size={10} fill="currentColor" />
          <span className="text-[9px] font-black uppercase tracking-tighter">Motor Activo</span>
        </div>
      )}
    </div>
  );

  const TabButton = ({ id, label, icon: Icon, active, onClick }: { id: string, label: string, icon: any, active: boolean, onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border-2 text-sm font-bold ${
        active
          ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105 z-10'
          : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-600'
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );

  // SEO View Content
  const renderSEOView = () => (
    <div className="space-y-8">
      <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 space-y-3">
        <div className="flex items-center gap-3 text-blue-700">
          <Globe size={24} />
          <h3 className="text-lg font-black tracking-tight">Estrategia de SEO & Visibilidad</h3>
        </div>
        <p className="text-sm text-blue-800/70 font-medium">
          Controlamos cada aspecto técnico para garantizar que tu sitio escale posiciones en los motores de búsqueda de forma orgánica.
        </p>
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 block mb-4">Checklist de Implementación SEO</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ChecklistItem title="Configuración de Meta Títulos dinámicos" checked />
          <ChecklistItem title="Meta Descripciones optimizadas por página" checked />
          <ChecklistItem title="Sitemap.xml automatizado (vía Genoma)" checked />
          <ChecklistItem title="Robots.txt personalizable" checked />
          <ChecklistItem title="Marcado de Datos Estructurados (Schema.org)" />
          <ChecklistItem title="Atributos ALT automáticos (AI Engine)" />
          <ChecklistItem title="Gestión de Slugs y URLs amigables" checked />
          <ChecklistItem title="Etiquetas Canonical automáticas" />
          <ChecklistItem title="Compresión Activa de Imágenes (Punto de Crítica)" checked />
          <ChecklistItem title="Lazy Loading nativo para Core Web Vitals" checked />
        </div>
      </div>
    </div>
  );

  // Marketing View Content
  const renderMarketingView = () => (
    <div className="space-y-8">
      <div className="p-6 bg-purple-50 rounded-3xl border border-purple-100 space-y-3">
        <div className="flex items-center gap-3 text-purple-700">
          <MousePointer2 size={24} />
          <h3 className="text-lg font-black tracking-tight">Marketing, Tracking & Datos</h3>
        </div>
        <p className="text-sm text-purple-800/70 font-medium">
          Mide cada interacción del usuario para optimizar tus presupuestos publicitarios y entender el comportamiento de tu audiencia.
        </p>
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 block mb-4">Medición y Píxeles</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ChecklistItem title="Inyección de Meta Pixel (Eventos Estándar)" checked />
          <ChecklistItem title="Google Analytics 4 (Handshake ID)" checked />
          <ChecklistItem title="Contenedor Google Tag Manager" />
          <ChecklistItem title="API de Conversiones (CAPI) Server-side" />
          <ChecklistItem title="Verificación de Dominio DNS" checked />
          <ChecklistItem title="Seguimiento de Conversiones Personalizadas" />
          <ChecklistItem title="Parámetros UTM dinámicos para Campañas" />
          <ChecklistItem title="Retargeting Activo de Visitantes" />
        </div>
      </div>
    </div>
  );

  // Conversion View Content
  const renderConversionView = () => {
    const metaPixel = getMetaPixelStatus(
      getVal('metaPixelEnabled', theme?.metaPixelEnabled ?? false),
      getVal('metaPixelId', theme?.metaPixelId ?? '')
    );
    const metaPixelStateLabel = !metaPixel.hasPixelId
      ? 'No configurado'
      : metaPixel.active
        ? 'Activo'
        : 'Configurado pero desactivado';
    const metaPixelStateClass = !metaPixel.hasPixelId
      ? 'bg-slate-100 text-slate-600'
      : metaPixel.active
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-amber-100 text-amber-700';
    const metaPixelSaveDisabled = !onSaveConfiguration || isSaving || saveStatus === 'loading' || !hasUnsavedChanges;
    const metaPixelButtonLabel = saveStatus === 'loading'
      ? 'Guardando...'
      : hasUnsavedChanges
        ? 'Guardar configuración'
        : metaPixelSaveFeedback?.type === 'success'
          ? 'Configuración guardada'
          : 'Sin cambios pendientes';

    return (
      <div className="space-y-8">
        <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 space-y-3">
          <div className="flex items-center gap-3 text-emerald-700">
            <Sparkles size={24} />
            <h3 className="text-lg font-black tracking-tight">Conversión</h3>
          </div>
          <p className="text-sm text-emerald-800/70 font-medium">
            Configura medición base para tus páginas publicadas sin afectar el tráfico dentro del Constructor.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-5 shadow-sm">
          <div className="flex flex-col gap-3 @md:flex-row @md:items-start @md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="text-base font-black text-slate-900">Pixel de Meta</h4>
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${metaPixelStateClass}`}>
                  {metaPixelStateLabel}
                </span>
              </div>
              <p className="text-sm text-slate-500 font-medium max-w-2xl">
                Ingresa el identificador numerico de tu Pixel de Meta. Se instalara en todas las páginas publicadas de este sitio.
              </p>
            </div>
            <SettingControl
              setting={{ id: 'metaPixelEnabled', type: 'boolean', label: 'Activar Pixel de Meta', defaultValue: false }}
              value={getVal('metaPixelEnabled', theme?.metaPixelEnabled ?? false)}
              onChange={(val) => toggleMetaPixel(Boolean(val))}
              projectId={projectId}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text/40 uppercase tracking-wider">ID del Pixel</label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="123456789012345"
              value={metaPixelDraftId}
              onChange={(event) => handleMetaPixelInputChange(event.target.value)}
              onBlur={() => {
                const result = persistMetaPixelId();
                if (result === '') {
                  handleThemeChange('metaPixelEnabled', false);
                }
              }}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-primary/30 focus:bg-white focus:ring-2 focus:ring-primary/10"
            />
            {metaPixelError && (
              <p className="text-xs font-semibold text-rose-600">{metaPixelError}</p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-600 space-y-2">
            <p>El Pixel se activa únicamente en el sitio publicado. No registra visitas dentro del Constructor.</p>
            <p>No se inyecta en Canvas, Preview interno ni desarrollo local.</p>
          </div>

          <div className="flex flex-col gap-3 @md:items-end">
            <button
              type="button"
              onClick={() => { void handleSaveMetaPixelConfiguration(); }}
              disabled={metaPixelSaveDisabled}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition-all @md:w-auto ${
                metaPixelSaveDisabled
                  ? 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
                  : 'bg-primary text-white shadow-lg shadow-primary/20 hover:opacity-95'
              }`}
            >
              {saveStatus === 'loading' ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
              ) : (
                <Save size={16} />
              )}
              <span>{metaPixelButtonLabel}</span>
            </button>

            {metaPixelSaveFeedback && (
              <p className={`text-sm font-semibold ${metaPixelSaveFeedback.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {metaPixelSaveFeedback.message}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

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
    const moduleProjectColors = [
      getVal('primary_color', project?.brandColors?.primary || '#3B82F6'),
      getVal('secondary_color', '#F1F5F9'),
      getVal('accent_color', '#7C3AED'),
      getVal('background_color', '#F8FAFC'),
      getVal('text_color', '#0F172A'),
    ].filter(Boolean) as string[];
    const globalSectionAnimationSetting = {
      id: 'section_animation',
      label: 'Animacion Global de Seccion',
      type: 'select',
      defaultValue: 'fade-up',
      options: [
        { label: 'Sin animacion', value: 'none' },
        { label: 'Desvanecer', value: 'fade' },
        { label: 'Desvanecer hacia arriba', value: 'fade-up' },
        { label: 'Desvanecer hacia abajo', value: 'fade-down' },
        { label: 'Desvanecer desde izquierda', value: 'fade-left' },
        { label: 'Desvanecer desde derecha', value: 'fade-right' },
        { label: 'Zoom suave', value: 'zoom' },
        { label: 'Blur suave', value: 'blur' },
        { label: 'Clip reveal', value: 'clip' },
      ]
    };
    const globalSectionAnimationSpeedSetting = {
      id: 'section_animation_speed',
      label: 'Velocidad de Animacion',
      type: 'range',
      defaultValue: 1,
      min: 0.4,
      max: 2,
      step: 0.1,
      unit: 'x'
    };

    return (
      <div className={`${isSidebarMode ? 'p-4 space-y-6' : 'max-w-2xl w-full mx-auto p-12 space-y-10'}`}>
        {!isSidebarMode && (
          <div className="flex flex-col space-y-2">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Sparkles className="text-primary w-8 h-8" />
              Animaciones
            </h2>
            <p className="text-slate-500 font-medium">Define la animacion global del sistema nuevo para los modulos migrados.</p>
          </div>
        )}

        <div className="space-y-4">
          <div className={`${isSidebarMode ? 'p-3 rounded-xl' : 'p-5 rounded-2xl'} bg-white border border-slate-100`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                  Sistema nuevo
                </p>
                <h3 className={`${isSidebarMode ? 'text-sm' : 'text-lg'} font-black text-slate-900 tracking-tight`}>
                  Animacion global de seccion
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Este control reemplaza el uso del panel legacy para los modulos que migremos al sistema nuevo.
                </p>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-[0.15em]">
                Global
              </div>
            </div>
          </div>

          <div className={`${isSidebarMode ? 'p-3 rounded-xl' : 'p-5 rounded-2xl'} bg-white border border-slate-100`}>
            <SettingControl
              setting={globalSectionAnimationSetting as any}
              value={getVal('section_animation', 'fade-up')}
              onChange={(val) => handleThemeChange('section_animation', val)}
              projectId={projectId}
              projectColors={moduleProjectColors}
            />
          </div>

          <div className={`${isSidebarMode ? 'p-3 rounded-xl' : 'p-5 rounded-2xl'} bg-white border border-slate-100`}>
            <SettingControl
              setting={globalSectionAnimationSpeedSetting as any}
              value={getVal('section_animation_speed', 1)}
              onChange={(val) => handleThemeChange('section_animation_speed', val)}
              projectId={projectId}
              projectColors={moduleProjectColors}
            />
          </div>

          <div className={`${isSidebarMode ? 'p-4 rounded-xl' : 'p-6 rounded-2xl'} bg-primary/5 border border-primary/10`}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white text-primary flex items-center justify-center shrink-0 border border-primary/10">
                <AlertCircle size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Alcance actual</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  En esta fase, `Stats` ya responde a esta animacion global. Los demas modulos se iran migrando al mismo contrato nuevo sin depender de `entrance_anim`.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'design-animations-legacy-disabled') {
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
    },
    {
      id: 'autosave',
      description: 'Guarda el borrador en segundo plano para reducir el riesgo de perder cambios.',
      icon: <Save className="w-5 h-5" />,
      settings: [
        {
          id: 'builder_autosave_enabled',
          label: 'Activar guardado automático',
          type: 'boolean',
          defaultValue: true,
          description: 'Mantiene el borrador protegido con guardados silenciosos en segundo plano.'
        },
        {
          id: 'builder_autosave_interval_ms',
          label: 'Guardar cada',
          type: 'select',
          defaultValue: 180000,
          options: [
            { label: 'Desactivado', value: 'disabled' },
            { label: '1 minuto', value: 60000 },
            { label: '2 minutos', value: 120000 },
            { label: '3 minutos', value: 180000 },
            { label: '5 minutos', value: 300000 },
            { label: '10 minutos', value: 600000 }
          ],
          description: 'El guardado automático solo corre si detecta cambios sin guardar.'
        },
        {
          id: 'builder_autosave_show_indicator',
          label: 'Mostrar estado en la barra superior',
          type: 'boolean',
          defaultValue: true,
          description: 'Muestra mensajes discretos del guardado automático en la barra superior.'
        },
        {
          id: 'builder_temporary_save_notice_enabled',
          label: 'Mostrar aviso de guardado temporal',
          type: 'boolean',
          defaultValue: true,
          description: 'Muestra un aviso breve cuando los cambios quedan protegidos localmente.'
        },
        {
          id: 'builder_temporary_save_interval_minutes',
          label: 'Frecuencia del respaldo temporal',
          type: 'select',
          defaultValue: 3,
          options: [
            { label: 'Cada 1 minuto', value: 1 },
            { label: 'Cada 3 minutos', value: 3 },
            { label: 'Cada 10 minutos', value: 10 }
          ],
          description: 'El respaldo temporal se guarda solo en este navegador. Para conservar los cambios definitivamente, presione Guardar.'
        }
      ]
    }
  ];

  const normalizedSections = sections.map((section) => {
    if (section.id !== 'autosave') return section;

    const legacyRemoteAutosaveSettings = new Set([
      'builder_autosave_enabled',
      'builder_autosave_interval_ms',
      'builder_autosave_show_indicator'
    ]);

    return {
      ...section,
      title: 'Respaldo temporal local',
      description: 'Protege cambios en este navegador hasta que presiones Guardar.',
      settings: section.settings.filter((setting: any) => !legacyRemoteAutosaveSettings.has(setting.id)).map((setting: any) => {
        if (setting.id === 'builder_autosave_enabled') {
          return { ...setting, label: 'Activar guardado automático' };
        }

        if (setting.id === 'builder_autosave_interval_ms') {
          return {
            ...setting,
            description: 'Elige Desactivado para pausar el guardado automático sin afectar el guardado manual.'
          };
        }

        if (setting.id === 'builder_autosave_show_indicator') {
          return {
            ...setting,
            description: 'Muestra mensajes discretos del guardado automático en la barra superior.'
          };
        }

        return setting;
      })
    };
  });

  return (
    <div className="max-w-4xl w-full mx-auto p-8 space-y-10">
      {/* Tab Navigation */}
      <div className="flex flex-col space-y-6">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="self-start inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600 shadow-sm transition-all hover:-translate-x-0.5 hover:border-primary/40 hover:text-primary"
          >
            <ArrowLeft size={14} />
            Volver al Constructor
          </button>
        )}
        <div className="flex flex-col space-y-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Settings className="text-primary w-8 h-8" />
            Centro de Control Global
          </h2>
          <p className="text-slate-500 font-medium">Gestiona la identidad visual y las capacidades estratégicas de tu ecosistema digital.</p>
        </div>

        {onSiteNameChange && (
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">
              Nombre
            </label>
            <input
              type="text"
              value={siteName || ''}
              onChange={(event) => onSiteNameChange(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none transition-all focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/10"
              placeholder="Nombre del sitio"
            />
            <p className="mt-2 text-[10px] font-medium text-slate-400">
              Este nombre se guarda con el sitio al presionar Guardar.
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100 self-start">
          <TabButton
            id="style"
            label="Estilo"
            icon={Palette}
            active={activeInternalTab === 'style'}
            onClick={() => setActiveInternalTab('style')}
          />
          <TabButton
            id="seo"
            label="SEO"
            icon={Globe}
            active={activeInternalTab === 'seo'}
            onClick={() => setActiveInternalTab('seo')}
          />
          <TabButton
            id="marketing"
            label="Marketing"
            icon={MousePointer2}
            active={activeInternalTab === 'marketing'}
            onClick={() => setActiveInternalTab('marketing')}
          />
          <TabButton
            id="conversion"
            label="Conversión"
            icon={Sparkles}
            active={activeInternalTab === 'conversion'}
            onClick={() => setActiveInternalTab('conversion')}
          />
        </div>
      </div>

      <motion.div
        key={activeInternalTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeInternalTab === 'seo' && renderSEOView()}
        {activeInternalTab === 'marketing' && renderMarketingView()}
        {activeInternalTab === 'conversion' && renderConversionView()}

        {activeInternalTab === 'style' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-4">
              <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4 sticky top-6">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <MousePointer2 className="w-4 h-4 text-primary" />
                  Visualizador de Marca
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
            </div>

            <div className="lg:col-span-2 space-y-10">
              {normalizedSections.map((section) => (
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
                  {section.id === 'autosave' && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 [&_p:last-child]:hidden">
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                        El respaldo temporal local no publica la página ni persiste cambios finales en la base de datos. Presiona Guardar para conservarlos remotamente.
                      </p>
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <button
                          type="button"
                          onClick={handleSaveTemporaryBackupSettings}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/20 transition-all hover:opacity-90"
                        >
                          <Save size={14} />
                          Guardar ajustes de respaldo
                        </button>
                        <span className={`text-[11px] font-bold transition-opacity ${backupSettingsSavedNotice ? 'text-emerald-600 opacity-100' : 'text-slate-400 opacity-0'}`}>
                          Ajustes de respaldo guardados.
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                        El guardado automático no publica la página ni genera preview. Solo guarda el borrador y su estructura para reducir riesgo de pérdida de cambios.
                      </p>
                    </div>
                  )}
                </section>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
