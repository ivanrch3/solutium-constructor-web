import React, { useEffect, useMemo, useState } from 'react';
import { Sparkles, Layout, PlusSquare, ArrowLeft, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { AI_PAGE_GENERATION_ENABLED } from '../constants/aiPageGeneration';

export type CreationMethod = 'ai' | 'template' | 'scratch';

const CONSTRUCTOR_WEB_LOGO_URL = 'https://nyc3.digitaloceanspaces.com/solutium-space/988cd339-a2c7-4951-b944-998d32dc349b-solutium-constructor-web-imagotipo.png';
export const AI_PAGE_GENERATOR_AVAILABLE_AT = '2026-06-15T00:00:00-06:00';

const TEXT = {
  aiCountdownSoon: 'La creaci\u00f3n de p\u00e1ginas web en minutos potenciada con IA estar\u00e1 disponible pronto.',
  aiCountdownLater: (countdown: string) => `La creaci\u00f3n de p\u00e1ginas web en minutos potenciada con IA se habilitar\u00e1 en ${countdown}.`,
  title: '\u00bfC\u00f3mo quieres crear tu p\u00e1gina?',
  soon: 'Pr\u00f3ximamente',
  aiDescription: 'Describe tu negocio y deja que nuestra inteligencia artificial cree la estructura, textos e im\u00e1genes por ti en minutos.',
  aiDisabled: 'Esta funci\u00f3n estar\u00e1 disponible pr\u00f3ximamente.',
  templateDescription: 'Elige entre dise\u00f1os preconstruidos profesionales optimizados para conversi\u00f3n. Ideal si quieres una base s\u00f3lida y r\u00e1pida.',
  scratchDescription: 'Empieza desde cero. A\u00f1ade secciones una a una y construye tu sitio con total control creativo sin distracciones.',
  back: 'Atr\u00e1s'
} as const;

const formatCountdown = (targetTimestamp: number) => {
  const remainingMs = Math.max(0, targetTimestamp - Date.now());
  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days} dias, ${hours} horas, ${minutes} minutos`;
  }

  if (hours > 0) {
    return `${hours} horas, ${minutes} minutos, ${seconds} segundos`;
  }

  if (minutes > 0) {
    return `${minutes} minutos, ${seconds} segundos`;
  }

  return `${seconds} segundos`;
};

const useCountdown = (targetDate: string) => {
  const targetTimestamp = useMemo(() => new Date(targetDate).getTime(), [targetDate]);
  const [countdown, setCountdown] = useState(() => formatCountdown(targetTimestamp));
  const [hasReachedTarget, setHasReachedTarget] = useState(() => Date.now() >= targetTimestamp);

  useEffect(() => {
    if (!Number.isFinite(targetTimestamp)) {
      setCountdown('');
      setHasReachedTarget(true);
      return;
    }

    const updateCountdown = () => {
      setHasReachedTarget(Date.now() >= targetTimestamp);
      setCountdown(formatCountdown(targetTimestamp));
    };

    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(intervalId);
  }, [targetTimestamp]);

  return { countdown, hasReachedTarget };
};

interface MethodSelectionProps {
  onSelect: (method: CreationMethod) => void;
  onBack: () => void;
  logoUrl?: string | null;
}

export const MethodSelection: React.FC<MethodSelectionProps> = ({ onSelect, onBack }) => {
  const displayLogo = CONSTRUCTOR_WEB_LOGO_URL;
  const { countdown, hasReachedTarget } = useCountdown(AI_PAGE_GENERATOR_AVAILABLE_AT);
  const aiCountdownMessage = hasReachedTarget ? TEXT.aiCountdownSoon : TEXT.aiCountdownLater(countdown);

  return (
    <div
      className="min-h-screen px-8 pb-8 pt-4 flex flex-col items-center"
      style={{ background: 'linear-gradient(180deg, var(--builder-bg) 0%, #EEF2FF 100%)' }}
    >
      <div className="w-full min-h-[170px] flex items-center justify-center">
        <img
          src={displayLogo}
          alt="Constructor Web"
          className="h-20 w-auto object-contain"
          referrerPolicy="no-referrer"
        />
      </div>

      <h2 className="text-2xl font-bold text-text mb-12 text-center">{TEXT.title}</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-12">
        <motion.button
          whileHover={AI_PAGE_GENERATION_ENABLED ? { y: -5 } : undefined}
          whileTap={AI_PAGE_GENERATION_ENABLED ? { scale: 0.98 } : undefined}
          onClick={() => {
            if (AI_PAGE_GENERATION_ENABLED) {
              onSelect('ai');
            }
          }}
          disabled={!AI_PAGE_GENERATION_ENABLED}
          aria-disabled={!AI_PAGE_GENERATION_ENABLED}
          className={`relative rounded-3xl p-8 text-left flex flex-col h-[400px] group transition-all border border-black/5 text-white ${
            AI_PAGE_GENERATION_ENABLED ? 'cursor-pointer' : 'cursor-not-allowed'
          }`}
          style={{
            backgroundColor: 'var(--builder-primary)',
            boxShadow: '0 20px 40px -20px color-mix(in srgb, var(--builder-primary) 45%, transparent)'
          }}
        >
          {!AI_PAGE_GENERATION_ENABLED && (
            <div className="absolute right-6 top-6 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white ring-1 ring-white/20">
              <Lock className="h-3 w-3" />
              {TEXT.soon}
            </div>
          )}
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-4">Generar con IA</h3>
          <p className="text-white/90 text-sm leading-relaxed">{TEXT.aiDescription}</p>
          <div className="mt-auto space-y-3">
            {AI_PAGE_GENERATION_ENABLED ? null : (
              <>
                <p className="rounded-2xl bg-white/12 p-4 text-sm font-semibold leading-relaxed text-white ring-1 ring-white/15">
                  {aiCountdownMessage}
                </p>
                <span className="block rounded-xl bg-white/10 px-4 py-3 text-center text-[11px] font-black uppercase tracking-widest text-white/70 ring-1 ring-white/10">
                  {TEXT.aiDisabled}
                </span>
              </>
            )}
          </div>
        </motion.button>

        <div className="bg-surface rounded-3xl p-8 text-left flex flex-col h-[400px] border border-border opacity-60 relative cursor-not-allowed">
          <div className="absolute top-6 right-6 bg-secondary text-text/40 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            {TEXT.soon}
          </div>
          <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-6">
            <Layout className="text-text/20 w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-text/40 mb-4">Usar Plantilla</h3>
          <p className="text-text/40 text-sm leading-relaxed">{TEXT.templateDescription}</p>
        </div>

        <motion.button
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect('scratch')}
          className="bg-surface rounded-3xl p-8 text-left flex flex-col h-[400px] shadow-sm border border-border group transition-all hover:shadow-xl"
          style={{
            borderColor: 'color-mix(in srgb, var(--builder-primary) 18%, var(--builder-border) 82%)',
            boxShadow: '0 18px 36px -28px color-mix(in srgb, var(--builder-primary) 20%, transparent)'
          }}
        >
          <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-6 transition-colors group-hover:bg-[var(--builder-primary-soft)]">
            <PlusSquare className="text-text w-6 h-6 transition-colors group-hover:text-[var(--builder-primary)]" />
          </div>
          <h3 className="text-xl font-bold text-text mb-4 transition-colors group-hover:text-[var(--builder-primary)]">Lienzo en Blanco</h3>
          <p className="text-text/60 text-sm leading-relaxed">{TEXT.scratchDescription}</p>
        </motion.button>
      </div>

      <button
        onClick={onBack}
        className="flex items-center gap-2 text-text/60 hover:text-text font-bold text-base transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {TEXT.back}
      </button>
    </div>
  );
};
