import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { FONT_WEIGHTS } from '../../../constants/typography';
import { parseNumSafe } from '../utils';

type DynamicCard = {
  enabled?: boolean;
  backgroundType?: 'color' | 'gradient' | 'image';
  bgColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  gradientDirection?: string;
  bgImage?: string;
  overlayEnabled?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
  imageFit?: 'cover' | 'contain' | 'fill';
  imagePosition?: string;
  effect?: string;
  effectSpeed?: string;
  effectDensity?: string;
  effectDirection?: 'ltr' | 'rtl';
  titleText?: string;
  titleSize?: number;
  titleWeight?: string;
  titleColor?: string;
  titleAlign?: 'left' | 'center' | 'right';
  titleLineHeight?: number;
  titleLetterSpacing?: number;
  titleEnterAnimation?: string;
  titleExitAnimation?: string;
  titleEntryDuration?: number;
  titleVisibleDuration?: number;
  titleExitDuration?: number;
  bodyText?: string;
  bullets?: string;
  bulletIcon?: string;
  bodySize?: number;
  bodyWeight?: string;
  bodyColor?: string;
  bodyAlign?: 'left' | 'center' | 'right';
  bodyEnterAnimation?: string;
  bodyExitAnimation?: string;
  bodyEntryDuration?: number;
  bodyVisibleDuration?: number;
  bodyExitDuration?: number;
  ctaEnabled?: boolean;
  ctaText?: string;
  ctaUrl?: string;
  ctaSize?: 'sm' | 'md' | 'lg';
  ctaStyle?: 'solid' | 'outline' | 'glass';
  ctaPosition?: 'inline' | 'below' | 'bottom_right' | 'bottom_center';
  ctaColor?: string;
  ctaAnimation?: string;
  ctaExitAnimation?: string;
  ctaEntryDuration?: number;
  ctaVisibleDuration?: number;
  ctaExitDuration?: number;
};

const DEFAULT_CARD: DynamicCard = {
  enabled: true,
  backgroundType: 'gradient',
  bgColor: '#0F172A',
  gradientFrom: '#0F172A',
  gradientTo: '#2563EB',
  gradientDirection: '135deg',
  bgImage: '',
  overlayEnabled: true,
  overlayColor: '#020617',
  overlayOpacity: 25,
  imageFit: 'cover',
  imagePosition: 'center',
  effect: 'speed_lines',
  effectSpeed: 'fast',
  effectDensity: 'medium',
  effectDirection: 'ltr',
  titleText: 'Impulsa tu negocio',
  titleSize: 54,
  titleWeight: 'black',
  titleColor: '#FFFFFF',
  titleAlign: 'center',
  titleLineHeight: 0.98,
  titleLetterSpacing: 0,
  titleEnterAnimation: 'from_left',
  titleExitAnimation: 'fade',
  titleEntryDuration: 0.55,
  titleVisibleDuration: 4,
  titleExitDuration: 0.35,
  bodyText: 'Crea experiencias dinámicas con movimiento, velocidad y alto impacto visual.',
  bullets: 'Movimiento fluido\nFondos personalizables\nCTA por tarjeta',
  bulletIcon: 'Zap',
  bodySize: 18,
  bodyWeight: 'medium',
  bodyColor: '#E2E8F0',
  bodyAlign: 'center',
  bodyEnterAnimation: 'from_bottom',
  bodyExitAnimation: 'fade',
  bodyEntryDuration: 0.55,
  bodyVisibleDuration: 4,
  bodyExitDuration: 0.35,
  ctaEnabled: true,
  ctaText: 'Comenzar',
  ctaUrl: '#',
  ctaSize: 'md',
  ctaStyle: 'solid',
  ctaPosition: 'below',
  ctaColor: 'var(--primary-color, #2563EB)',
  ctaAnimation: 'zoom',
  ctaExitAnimation: 'fade',
  ctaEntryDuration: 0.55,
  ctaVisibleDuration: 4,
  ctaExitDuration: 0.35
};

const SPEED_DURATION: Record<string, number> = {
  slow: 13,
  normal: 8,
  fast: 4.6,
  very_fast: 2.8
};

const DENSITY_COUNT: Record<string, number> = {
  low: 12,
  medium: 22,
  high: 36
};

const SPEED_LINE_THICKNESS: Record<string, number> = {
  low: 2,
  medium: 3,
  high: 4
};

const SPEED_LINE_OPACITY: Record<string, number> = {
  low: 0.58,
  medium: 0.68,
  high: 0.76
};

const CTA_SIZE_CLASS: Record<string, string> = {
  sm: 'px-3 py-2 text-xs @md:px-4',
  md: 'px-5 py-2.5 text-sm @md:px-6 @md:py-3',
  lg: 'px-6 py-3 text-sm @md:px-8 @md:py-4 @md:text-base'
};

const toBoolean = (value: unknown, fallback = false) => {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return ['true', '1', 'yes', 'si'].includes(value.trim().toLowerCase());
  if (typeof value === 'number') return value === 1;
  return Boolean(value);
};

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, [query]);

  return matches;
};

const getWeight = (token?: string) =>
  FONT_WEIGHTS[token as keyof typeof FONT_WEIGHTS]?.value || Number(token) || 700;

const clampCards = (cards: unknown): DynamicCard[] => {
  const source = Array.isArray(cards) && cards.length > 0 ? cards : [DEFAULT_CARD];
  return source.slice(0, 5).map((card) => ({
    ...DEFAULT_CARD,
    ...(card && typeof card === 'object' ? card : {})
  }));
};

const getCssAnimationStyle = (
  animation: string | undefined,
  phase: 'enter' | 'exit',
  disabled: boolean,
  duration: number
): React.CSSProperties => {
  if (disabled || !animation || animation === 'none') return {};

  const normalized = animation.replace(/_/g, '-');
  return {
    animationName: `dc-${phase}-${normalized}`,
    animationDuration: `${Math.max(duration, 0.05)}s`,
    animationTimingFunction: phase === 'enter' ? 'ease-out' : 'ease-in',
    animationFillMode: 'both'
  };
};

const getAnimationTransform = (animation: string | undefined, phase: 'enter' | 'exit') => {
  if (!animation || animation === 'none' || animation === 'fade') return 'translate3d(0, 0, 0) scale(1)';

  const transforms: Record<string, string> = {
    from_left: 'translate3d(-42px, 0, 0) scale(1)',
    from_right: 'translate3d(42px, 0, 0) scale(1)',
    from_top: 'translate3d(0, -42px, 0) scale(1)',
    from_bottom: 'translate3d(0, 42px, 0) scale(1)',
    to_left: 'translate3d(-42px, 0, 0) scale(1)',
    to_right: 'translate3d(42px, 0, 0) scale(1)',
    to_top: 'translate3d(0, -42px, 0) scale(1)',
    to_bottom: 'translate3d(0, 42px, 0) scale(1)',
    zoom: 'translate3d(0, 0, 0) scale(.94)'
  };

  return transforms[animation] || (phase === 'enter' ? transforms.from_bottom : transforms.to_bottom);
};

const getLoopAnimationStyle = (
  enterAnimation: string | undefined,
  exitAnimation: string | undefined,
  disabled: boolean,
  duration: number
): React.CSSProperties => {
  if (disabled) return {};

  return {
    animationName: 'dc-loop-dynamic',
    animationDuration: `${Math.max(duration, 1)}s`,
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
    animationFillMode: 'both',
    ['--dc-enter-transform' as any]: getAnimationTransform(enterAnimation, 'enter'),
    ['--dc-exit-transform' as any]: getAnimationTransform(exitAnimation, 'exit')
  };
};

const renderDynamicEffect = (
  effect: string,
  speed: string,
  density: string,
  direction: string,
  reducedMotion: boolean
) => {
  if (effect === 'none' || reducedMotion) return null;

  const count = DENSITY_COUNT[density] || DENSITY_COUNT.medium;
  const duration = SPEED_DURATION[speed] || SPEED_DURATION.normal;
  const items = Array.from({ length: count });

  if (effect === 'speed_lines') {
    return (
      <div
        className={`dc-effect dc-speed-lines dc-flow-${direction}`}
        style={{
          ['--dc-duration' as any]: `${duration}s`,
          ['--dc-line-height' as any]: `${SPEED_LINE_THICKNESS[density] || SPEED_LINE_THICKNESS.medium}px`,
          ['--dc-line-opacity' as any]: SPEED_LINE_OPACITY[density] || SPEED_LINE_OPACITY.medium
        }}
      >
        {items.map((_, index) => (
          <span
            key={index}
            style={{
              top: `${12 + ((index * 37) % 76)}%`,
              width: `${120 + ((index * 53) % 190)}px`,
              animationDelay: `${-(index * duration) / count}s`,
              animationDuration: `${duration * (0.86 + (index % 5) * 0.06)}s`,
              filter: index % 3 === 0 ? 'blur(0.6px)' : undefined
            }}
          />
        ))}
      </div>
    );
  }

  if (effect === 'light_sweep') {
    return <div className={`dc-effect dc-light-sweep dc-flow-${direction}`} style={{ ['--dc-duration' as any]: `${duration * 1.25}s` }} />;
  }

  if (effect === 'particles') {
    return (
      <div className={`dc-effect dc-particles dc-flow-${direction}`} style={{ ['--dc-duration' as any]: `${duration * 1.4}s` }}>
        {items.map((_, index) => (
          <span
            key={index}
            style={{
              left: `${(index * 47) % 100}%`,
              top: `${(index * 31) % 100}%`,
              animationDelay: `${-(index * duration) / count}s`
            }}
          />
        ))}
      </div>
    );
  }

  if (effect === 'animated_gradient') {
    return <div className={`dc-effect dc-animated-gradient dc-flow-${direction}`} style={{ ['--dc-duration' as any]: `${duration * 1.6}s` }} />;
  }

  if (effect === 'waves') {
    return <div className={`dc-effect dc-waves dc-flow-${direction}`} style={{ ['--dc-duration' as any]: `${duration * 1.8}s` }} />;
  }

  if (effect === 'energy') {
    return (
      <div className={`dc-effect dc-energy dc-flow-${direction}`} style={{ ['--dc-duration' as any]: `${duration * 0.9}s` }}>
        {items.slice(0, Math.max(5, Math.floor(count * 0.6))).map((_, index) => (
          <span
            key={index}
            style={{
              left: `${(index * 19) % 96}%`,
              top: `${(index * 29) % 92}%`,
              animationDelay: `${-(index * duration) / count}s`
            }}
          />
        ))}
      </div>
    );
  }

  if (effect === 'grain') {
    return <div className="dc-effect dc-grain" style={{ ['--dc-duration' as any]: `${Math.max(duration * 0.45, 1.8)}s` }} />;
  }

  return null;
};

export const DynamicCardsModule: React.FC<{
  moduleId: string;
  settingsValues: Record<string, any>;
  isPreviewMode?: boolean;
}> = ({ moduleId, settingsValues, isPreviewMode = false }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [animationCycle, setAnimationCycle] = useState(0);
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'exit'>('enter');
  const [entrySettled, setEntrySettled] = useState(false);
  const transitionTimerRef = useRef<number | null>(null);
  const animationSettingsSignatureRef = useRef<string>('');
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const isMobile = useMediaQuery('(max-width: 640px)');

  const getVal = (elementId: string | null, settingId: string, defaultValue: any) => {
    const key = elementId ? `${elementId}_${settingId}` : `${moduleId}_global_${settingId}`;
    return settingsValues[key] !== undefined ? settingsValues[key] : defaultValue;
  };

  const navigationMode = getVal(null, 'navigation_mode', 'auto_dots');
  const intervalSeconds = parseNumSafe(getVal(null, 'interval_seconds', 5), 5);
  const useGlobalEffect = toBoolean(getVal(null, 'use_global_effect', true), true);
  const globalEffect = getVal(null, 'global_effect', 'speed_lines');
  const globalSpeed = getVal(null, 'global_speed', 'fast');
  const globalDensity = getVal(null, 'global_density', 'medium');
  const globalDirection = getVal(null, 'global_direction', 'ltr');
  const globalTitleEnter = getVal(null, 'global_title_enter_animation', 'from_left');
  const globalTitleExit = getVal(null, 'global_title_exit_animation', 'fade');
  const entryDuration = parseNumSafe(getVal(null, 'entry_duration', 0.55), 0.55);
  const visibleDuration = parseNumSafe(getVal(null, 'visible_duration', 4), 4);
  const exitDuration = parseNumSafe(getVal(null, 'exit_duration', 0.35), 0.35);
  const globalTitleEntryDuration = parseNumSafe(getVal(null, 'global_title_entry_duration', entryDuration), entryDuration);
  const globalTitleVisibleDuration = parseNumSafe(getVal(null, 'global_title_visible_duration', visibleDuration), visibleDuration);
  const globalTitleExitDuration = parseNumSafe(getVal(null, 'global_title_exit_duration', exitDuration), exitDuration);
  const globalBodyEnter = getVal(null, 'global_body_enter_animation', 'from_bottom');
  const globalBodyExit = getVal(null, 'global_body_exit_animation', 'fade');
  const globalBodyEntryDuration = parseNumSafe(getVal(null, 'global_body_entry_duration', entryDuration), entryDuration);
  const globalBodyVisibleDuration = parseNumSafe(getVal(null, 'global_body_visible_duration', visibleDuration), visibleDuration);
  const globalBodyExitDuration = parseNumSafe(getVal(null, 'global_body_exit_duration', exitDuration), exitDuration);
  const globalCtaEnter = getVal(null, 'global_cta_enter_animation', 'zoom');
  const globalCtaExit = getVal(null, 'global_cta_exit_animation', 'fade');
  const globalCtaEntryDuration = parseNumSafe(getVal(null, 'global_cta_entry_duration', entryDuration), entryDuration);
  const globalCtaVisibleDuration = parseNumSafe(getVal(null, 'global_cta_visible_duration', visibleDuration), visibleDuration);
  const globalCtaExitDuration = parseNumSafe(getVal(null, 'global_cta_exit_duration', exitDuration), exitDuration);
  const reduceMotionMobile = toBoolean(getVal(null, 'reduce_motion_mobile', true), true);
  const showArrowsSetting = toBoolean(getVal(null, 'show_arrows', true), true);
  const showDotsSetting = toBoolean(getVal(null, 'show_dots', true), true);
  const controlsStyle = getVal(null, 'controls_style', 'glass');

  const rawCards = getVal(`${moduleId}_el_dynamic_cards_cards`, 'cards', [DEFAULT_CARD]);
  const cards = useMemo(() => clampCards(rawCards).filter((card) => card.enabled !== false), [rawCards]);
  const safeCards = cards.length > 0 ? cards : [DEFAULT_CARD];
  const activeCard = safeCards[Math.min(activeIndex, safeCards.length - 1)] || safeCards[0];
  const reducedTextMotion = prefersReducedMotion || (reduceMotionMobile && isMobile);
  const reducedEffectMotion = prefersReducedMotion;
  const isAutoplay = ['auto', 'auto_dots', 'auto_controls'].includes(navigationMode);
  const showArrows = safeCards.length > 1 && showArrowsSetting && ['arrows', 'auto_controls'].includes(navigationMode);
  const showDots = safeCards.length > 1 && showDotsSetting && ['dots', 'auto_dots', 'auto_controls'].includes(navigationMode);
  const fallbackTotalDuration = entryDuration + visibleDuration + exitDuration;
  const effect = useGlobalEffect ? globalEffect : activeCard.effect || 'none';
  const speed = useGlobalEffect ? globalSpeed : activeCard.effectSpeed || globalSpeed;
  const density = useGlobalEffect ? globalDensity : activeCard.effectDensity || globalDensity;
  const direction = useGlobalEffect ? globalDirection : activeCard.effectDirection || globalDirection;
  const titleEnter = isMobile && reduceMotionMobile ? 'fade' : (useGlobalEffect ? globalTitleEnter : activeCard.titleEnterAnimation);
  const titleExit = isMobile && reduceMotionMobile ? 'fade' : (useGlobalEffect ? globalTitleExit : activeCard.titleExitAnimation);
  const bodyEnter = isMobile && reduceMotionMobile ? 'fade' : (useGlobalEffect ? globalBodyEnter : activeCard.bodyEnterAnimation);
  const bodyExit = isMobile && reduceMotionMobile ? 'fade' : (useGlobalEffect ? globalBodyExit : activeCard.bodyExitAnimation);
  const ctaEnter = isMobile && reduceMotionMobile ? 'fade' : (useGlobalEffect ? globalCtaEnter : activeCard.ctaAnimation || bodyEnter);
  const ctaExit = isMobile && reduceMotionMobile ? 'fade' : (useGlobalEffect ? globalCtaExit : activeCard.ctaExitAnimation || bodyExit);
  const titleEntryDuration = useGlobalEffect ? globalTitleEntryDuration : parseNumSafe(activeCard.titleEntryDuration, entryDuration);
  const titleVisibleDuration = useGlobalEffect ? globalTitleVisibleDuration : parseNumSafe(activeCard.titleVisibleDuration, visibleDuration);
  const titleExitDuration = useGlobalEffect ? globalTitleExitDuration : parseNumSafe(activeCard.titleExitDuration, exitDuration);
  const bodyEntryDuration = useGlobalEffect ? globalBodyEntryDuration : parseNumSafe(activeCard.bodyEntryDuration, entryDuration);
  const bodyVisibleDuration = useGlobalEffect ? globalBodyVisibleDuration : parseNumSafe(activeCard.bodyVisibleDuration, visibleDuration);
  const bodyExitDuration = useGlobalEffect ? globalBodyExitDuration : parseNumSafe(activeCard.bodyExitDuration, exitDuration);
  const ctaEntryDuration = useGlobalEffect ? globalCtaEntryDuration : parseNumSafe(activeCard.ctaEntryDuration, entryDuration);
  const ctaVisibleDuration = useGlobalEffect ? globalCtaVisibleDuration : parseNumSafe(activeCard.ctaVisibleDuration, visibleDuration);
  const ctaExitDuration = useGlobalEffect ? globalCtaExitDuration : parseNumSafe(activeCard.ctaExitDuration, exitDuration);
  const contentEntryDuration = Math.max(titleEntryDuration, bodyEntryDuration, ctaEntryDuration);
  const contentExitDuration = Math.max(titleExitDuration, bodyExitDuration, ctaExitDuration);
  const coordinatedInterval = Math.max(
    intervalSeconds,
    fallbackTotalDuration,
    titleEntryDuration + titleVisibleDuration + titleExitDuration,
    bodyEntryDuration + bodyVisibleDuration + bodyExitDuration,
    ctaEntryDuration + ctaVisibleDuration + ctaExitDuration
  );

  const clearTransitionTimer = () => {
    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
  };

  const goTo = (nextIndex: number) => {
    const normalizedIndex = (nextIndex + safeCards.length) % safeCards.length;

    clearTransitionTimer();

    if (reducedTextMotion || contentExitDuration <= 0) {
      setAnimationPhase('enter');
      setActiveIndex(normalizedIndex);
      setAnimationCycle((cycle) => cycle + 1);
      return;
    }

    setAnimationPhase('exit');
    transitionTimerRef.current = window.setTimeout(() => {
      setActiveIndex(normalizedIndex);
      setAnimationPhase('enter');
      setAnimationCycle((cycle) => cycle + 1);
      transitionTimerRef.current = null;
    }, Math.max(contentExitDuration, 0.05) * 1000);
  };

  useEffect(() => {
    clearTransitionTimer();
    setAnimationPhase('enter');
    setActiveIndex((current) => Math.min(current, safeCards.length - 1));
    setAnimationCycle((cycle) => cycle + 1);
  }, [safeCards.length]);

  useEffect(() => {
    if (!isAutoplay || prefersReducedMotion) return;
    const timer = window.setInterval(() => {
      goTo(safeCards.length > 1 ? activeIndex + 1 : activeIndex);
    }, coordinatedInterval * 1000);
    return () => window.clearInterval(timer);
  }, [activeIndex, coordinatedInterval, isAutoplay, prefersReducedMotion, safeCards.length]);

  useEffect(() => {
    if (animationPhase !== 'enter' || reducedTextMotion) {
      setEntrySettled(true);
      return;
    }

    setEntrySettled(false);
    const timer = window.setTimeout(() => setEntrySettled(true), Math.max(contentEntryDuration, 0.05) * 1000);
    return () => window.clearTimeout(timer);
  }, [activeIndex, animationCycle, animationPhase, contentEntryDuration, reducedTextMotion]);

  useEffect(() => () => clearTransitionTimer(), []);

  const effectSignature = `${effect}|${speed}|${density}|${direction}`;
  const animationSettingsSignature = [
    activeIndex,
    titleEnter,
    titleExit,
    bodyEnter,
    bodyExit,
    ctaEnter,
    ctaExit,
    titleEntryDuration,
    titleVisibleDuration,
    titleExitDuration,
    bodyEntryDuration,
    bodyVisibleDuration,
    bodyExitDuration,
    ctaEntryDuration,
    ctaVisibleDuration,
    ctaExitDuration,
    effectSignature
  ].join('|');

  useEffect(() => {
    if (!animationSettingsSignatureRef.current) {
      animationSettingsSignatureRef.current = animationSettingsSignature;
      return;
    }
    if (animationSettingsSignatureRef.current === animationSettingsSignature) return;

    animationSettingsSignatureRef.current = animationSettingsSignature;
    clearTransitionTimer();
    setAnimationPhase('enter');
    setAnimationCycle((cycle) => cycle + 1);
  }, [animationSettingsSignature]);

  const shouldAnimateContent = animationPhase === 'exit' || !entrySettled;
  const useSingleCardContentLoop = isAutoplay && safeCards.length === 1 && !reducedTextMotion;
  const titleAnimation = useSingleCardContentLoop
    ? getLoopAnimationStyle(titleEnter, titleExit, reducedTextMotion, titleEntryDuration + titleVisibleDuration + titleExitDuration)
    : shouldAnimateContent
    ? getCssAnimationStyle(animationPhase === 'enter' ? titleEnter : titleExit, animationPhase, reducedTextMotion, animationPhase === 'enter' ? titleEntryDuration : titleExitDuration)
    : {};
  const bodyAnimation = useSingleCardContentLoop
    ? getLoopAnimationStyle(bodyEnter, bodyExit, reducedTextMotion, bodyEntryDuration + bodyVisibleDuration + bodyExitDuration)
    : shouldAnimateContent
    ? getCssAnimationStyle(animationPhase === 'enter' ? bodyEnter : bodyExit, animationPhase, reducedTextMotion, animationPhase === 'enter' ? bodyEntryDuration : bodyExitDuration)
    : {};
  const ctaAnimation = useSingleCardContentLoop
    ? getLoopAnimationStyle(ctaEnter, ctaExit, reducedTextMotion, ctaEntryDuration + ctaVisibleDuration + ctaExitDuration)
    : shouldAnimateContent
    ? getCssAnimationStyle(animationPhase === 'enter' ? ctaEnter : ctaExit, animationPhase, reducedTextMotion, animationPhase === 'enter' ? ctaEntryDuration : ctaExitDuration)
    : {};

  const bgStyle: React.CSSProperties = {};
  if (activeCard.backgroundType === 'color') {
    bgStyle.background = activeCard.bgColor || '#0F172A';
  } else if (activeCard.backgroundType === 'image' && activeCard.bgImage) {
    bgStyle.backgroundImage = `url("${activeCard.bgImage}")`;
    bgStyle.backgroundSize = activeCard.imageFit || 'cover';
    bgStyle.backgroundPosition = activeCard.imagePosition || 'center';
    bgStyle.backgroundRepeat = 'no-repeat';
  } else {
    bgStyle.background = `linear-gradient(${activeCard.gradientDirection || '135deg'}, ${activeCard.gradientFrom || '#0F172A'} 0%, ${activeCard.gradientTo || 'var(--primary-color, #2563EB)'} 100%)`;
  }

  const titleStyle: React.CSSProperties = {
    color: activeCard.titleColor || '#FFFFFF',
    fontSize: `clamp(26px, 8cqw, ${parseNumSafe(activeCard.titleSize, 54)}px)`,
    fontWeight: getWeight(activeCard.titleWeight),
    lineHeight: parseNumSafe(activeCard.titleLineHeight, 0.98),
    letterSpacing: `${parseNumSafe(activeCard.titleLetterSpacing, 0)}px`,
    textAlign: activeCard.titleAlign || 'center',
    fontFamily: 'var(--font-heading, inherit)'
  };

  const bodyStyle: React.CSSProperties = {
    color: activeCard.bodyColor || '#E2E8F0',
    fontSize: `clamp(14px, 3.3cqw, ${parseNumSafe(activeCard.bodySize, 18)}px)`,
    fontWeight: getWeight(activeCard.bodyWeight),
    lineHeight: 1.55,
    textAlign: activeCard.bodyAlign || 'center'
  };

  const bullets = String(activeCard.bullets || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5);
  const BulletIcon = (LucideIcons as any)[activeCard.bulletIcon || 'Zap'] || LucideIcons.Zap;
  const ctaHref = String(activeCard.ctaUrl || '#').trim() || '#';
  const ctaPosition = activeCard.ctaPosition || 'below';
  const bodyAlign = activeCard.bodyAlign || 'center';
  const titleAlign = activeCard.titleAlign || 'center';
  const titleBlockClass = titleAlign === 'right' ? 'justify-self-end' : titleAlign === 'left' ? 'justify-self-start' : 'justify-self-center';
  const bodyBlockClass = bodyAlign === 'right' ? 'justify-self-end text-right' : bodyAlign === 'left' ? 'justify-self-start text-left' : 'justify-self-center text-center';
  const bulletJustifyClass = bodyAlign === 'right' ? 'justify-items-end' : bodyAlign === 'left' ? 'justify-items-start' : 'justify-items-center';
  const ctaJustifyClass = ctaPosition === 'bottom_right' || bodyAlign === 'right'
    ? 'justify-end'
    : ctaPosition === 'bottom_center' || bodyAlign === 'center'
      ? 'justify-center'
      : 'justify-start';
  const ctaBaseClass = `${CTA_SIZE_CLASS[activeCard.ctaSize || 'md']} inline-flex items-center justify-center gap-2 rounded-full font-black transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70`;
  const ctaStyle: React.CSSProperties = {
    color: activeCard.ctaStyle === 'solid' ? '#FFFFFF' : activeCard.ctaColor || 'var(--primary-color, #2563EB)',
    background: activeCard.ctaStyle === 'solid'
      ? activeCard.ctaColor || 'var(--primary-color, #2563EB)'
      : activeCard.ctaStyle === 'glass'
        ? 'rgba(255,255,255,0.16)'
        : 'transparent',
    border: activeCard.ctaStyle === 'outline'
      ? `1px solid ${activeCard.ctaColor || '#FFFFFF'}`
      : activeCard.ctaStyle === 'glass'
        ? '1px solid rgba(255,255,255,0.28)'
        : '1px solid transparent',
    backdropFilter: activeCard.ctaStyle === 'glass' ? 'blur(14px)' : undefined
  };

  const controlsClass = controlsStyle === 'minimal'
    ? 'bg-transparent text-white border border-white/25 hover:bg-white/10'
    : 'bg-white/14 text-white border border-white/20 backdrop-blur-xl hover:bg-white/22';
  const dynamicEffect = renderDynamicEffect(effect, speed, density, direction, reducedEffectMotion);

  const renderCta = () => {
    if (!activeCard.ctaEnabled) return null;
    return (
      <a
        key={`cta-${activeIndex}-${animationCycle}`}
        href={ctaHref}
        onClick={(event) => {
          if (isPreviewMode || ctaHref === '#') event.preventDefault();
        }}
        className={ctaBaseClass}
        style={{ ...ctaStyle, ...ctaAnimation }}
      >
        <span>{activeCard.ctaText || 'Comenzar'}</span>
        <ArrowRight size={18} />
      </a>
    );
  };

  return (
    <section id={moduleId} className="dynamic-cards-module w-full relative overflow-hidden @container">
      <style>{`
        .dynamic-cards-stage { height: 560px; }
        .dynamic-cards-content {
          display: grid;
          grid-template-rows: minmax(18px, 1fr) auto minmax(22px, .85fr) auto minmax(18px, 1fr);
          align-items: center;
          row-gap: clamp(14px, 3cqw, 30px);
        }
        .dynamic-cards-title { grid-row: 2; max-width: min(920px, 100%); }
        .dynamic-cards-body { grid-row: 4; width: min(760px, 100%); }
        .dynamic-cards-body p { overflow-wrap: anywhere; }
        .dynamic-cards-bullets { margin-top: clamp(10px, 2cqw, 16px); gap: clamp(6px, 1.5cqw, 10px); }
        .dynamic-cards-bullet { max-width: min(560px, 100%); overflow-wrap: anywhere; }
        @container (max-width: 900px) {
          .dynamic-cards-stage { height: 480px; }
          .dynamic-cards-content { row-gap: 16px; padding: 32px 32px; }
          .dynamic-cards-body { width: min(680px, 100%); }
        }
        @container (max-width: 520px) {
          .dynamic-cards-stage { height: 420px; }
          .dynamic-cards-content { grid-template-rows: minmax(10px, .8fr) auto minmax(14px, .55fr) auto minmax(10px, .8fr); row-gap: 12px; padding: 22px 18px; }
          .dynamic-cards-bullets { margin-top: 8px; gap: 5px; }
          .dynamic-cards-bullet { font-size: 12px; line-height: 1.35; }
        }
        .dc-effect { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
        .dc-speed-lines span { position: absolute; height: var(--dc-line-height, 3px); border-radius: 999px; background: linear-gradient(90deg, transparent, rgba(255,255,255,var(--dc-line-opacity, .68)), rgba(255,255,255,.92), rgba(255,255,255,var(--dc-line-opacity, .68)), transparent); box-shadow: 0 0 12px rgba(255,255,255,.22); animation-duration: var(--dc-duration); animation-timing-function: linear; animation-iteration-count: infinite; }
        .dc-flow-ltr.dc-speed-lines span { left: -35%; animation-name: dc-speed-ltr; }
        .dc-flow-rtl.dc-speed-lines span { right: -35%; animation-name: dc-speed-rtl; }
        .dc-light-sweep::before { content: ""; position: absolute; inset: -30% auto -30% -30%; width: 32%; transform: rotate(18deg); background: linear-gradient(90deg, transparent, rgba(255,255,255,.32), transparent); animation: dc-sweep-ltr var(--dc-duration) ease-in-out infinite; }
        .dc-flow-rtl.dc-light-sweep::before { inset: -30% -30% -30% auto; transform: rotate(-18deg); animation-name: dc-sweep-rtl; }
        .dc-particles span { position: absolute; width: 3px; height: 3px; border-radius: 999px; background: rgba(255,255,255,.72); animation: dc-particle-ltr var(--dc-duration) linear infinite; }
        .dc-flow-rtl.dc-particles span { animation-name: dc-particle-rtl; }
        .dc-animated-gradient { background: linear-gradient(115deg, transparent, rgba(255,255,255,.14), transparent, rgba(255,255,255,.1)); background-size: 220% 220%; animation: dc-gradient-ltr var(--dc-duration) ease-in-out infinite; mix-blend-mode: screen; }
        .dc-flow-rtl.dc-animated-gradient { animation-name: dc-gradient-rtl; }
        .dc-waves { background:
          repeating-linear-gradient(105deg, transparent 0 34px, rgba(255,255,255,.12) 35px 37px, transparent 38px 72px);
          animation: dc-waves-ltr var(--dc-duration) linear infinite;
          opacity: .85;
        }
        .dc-flow-rtl.dc-waves { animation-name: dc-waves-rtl; }
        .dc-energy span { position: absolute; width: 2px; height: 90px; transform: rotate(28deg); background: linear-gradient(180deg, transparent, rgba(255,255,255,.75), transparent); animation: dc-energy-ltr var(--dc-duration) ease-in-out infinite; }
        .dc-flow-rtl.dc-energy span { transform: rotate(-28deg); animation-name: dc-energy-rtl; }
        .dc-grain { opacity: .16; background-image: repeating-radial-gradient(circle at 20% 30%, rgba(255,255,255,.55) 0 1px, transparent 1px 4px); background-size: 120px 120px; animation: dc-grain var(--dc-duration) steps(4) infinite; }
        @keyframes dc-speed-ltr { from { transform: translateX(0); opacity: 0; } 8% { opacity: .95; } 78% { opacity: .75; } to { transform: translateX(170vw); opacity: 0; } }
        @keyframes dc-speed-rtl { from { transform: translateX(0); opacity: 0; } 8% { opacity: .95; } 78% { opacity: .75; } to { transform: translateX(-170vw); opacity: 0; } }
        @keyframes dc-sweep-ltr { 0% { transform: translateX(0) rotate(18deg); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateX(460%) rotate(18deg); opacity: 0; } }
        @keyframes dc-sweep-rtl { 0% { transform: translateX(0) rotate(-18deg); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateX(-460%) rotate(-18deg); opacity: 0; } }
        @keyframes dc-particle-ltr { from { transform: translate3d(-12vw, 10vh, 0) scale(.6); opacity: 0; } 15% { opacity: .85; } to { transform: translate3d(34vw, -22vh, 0) scale(1.2); opacity: 0; } }
        @keyframes dc-particle-rtl { from { transform: translate3d(12vw, 10vh, 0) scale(.6); opacity: 0; } 15% { opacity: .85; } to { transform: translate3d(-34vw, -22vh, 0) scale(1.2); opacity: 0; } }
        @keyframes dc-gradient-ltr { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes dc-gradient-rtl { 0%,100% { background-position: 100% 50%; } 50% { background-position: 0% 50%; } }
        @keyframes dc-waves-ltr { from { background-position: 0 0; } to { background-position: 220px 0; } }
        @keyframes dc-waves-rtl { from { background-position: 220px 0; } to { background-position: 0 0; } }
        @keyframes dc-energy-ltr { 0%,100% { opacity: 0; transform: translate(0, 24px) rotate(28deg); } 40% { opacity: .8; } 70% { opacity: 0; transform: translate(18px, -36px) rotate(28deg); } }
        @keyframes dc-energy-rtl { 0%,100% { opacity: 0; transform: translate(0, 24px) rotate(-28deg); } 40% { opacity: .8; } 70% { opacity: 0; transform: translate(-18px, -36px) rotate(-28deg); } }
        @keyframes dc-grain { from { background-position: 0 0; } to { background-position: 80px 60px; } }
        @keyframes dc-enter-from-left { from { opacity: 0; transform: translateX(-42px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes dc-enter-from-right { from { opacity: 0; transform: translateX(42px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes dc-enter-from-top { from { opacity: 0; transform: translateY(-42px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes dc-enter-from-bottom { from { opacity: 0; transform: translateY(42px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes dc-enter-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes dc-enter-zoom { from { opacity: 0; transform: scale(.94); } to { opacity: 1; transform: scale(1); } }
        @keyframes dc-exit-to-left { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(-42px); } }
        @keyframes dc-exit-to-right { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(42px); } }
        @keyframes dc-exit-to-top { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-42px); } }
        @keyframes dc-exit-to-bottom { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(42px); } }
        @keyframes dc-exit-fade { from { opacity: 1; } to { opacity: 0; } }
        @keyframes dc-exit-zoom { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(.94); } }
        @keyframes dc-loop-dynamic {
          0% { opacity: 0; transform: var(--dc-enter-transform, translate3d(0, 42px, 0) scale(1)); }
          12% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
          88% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
          100% { opacity: 0; transform: var(--dc-exit-transform, translate3d(0, 0, 0) scale(1)); }
        }
        @media (prefers-reduced-motion: reduce) {
          .dc-effect, .dc-effect * { animation: none !important; }
        }
      `}</style>

      <div className="dynamic-cards-stage relative w-full overflow-hidden" style={bgStyle}>
        {activeCard.backgroundType === 'image' && activeCard.overlayEnabled && (
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: activeCard.overlayColor || '#020617',
              opacity: parseNumSafe(activeCard.overlayOpacity, 25) / 100
            }}
          />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_38%),linear-gradient(90deg,rgba(2,6,23,0.26),transparent)]" />
        {React.isValidElement(dynamicEffect)
          ? React.cloneElement(dynamicEffect as React.ReactElement, { key: effectSignature })
          : null}

        <div
          key={`card-${activeIndex}-${animationPhase}-${animationCycle}`}
          className="dynamic-cards-content relative z-10 h-full w-full px-6 py-7 @md:px-12 @md:py-10 @5xl:px-16 @5xl:py-12"
        >
            <div
              className={`dynamic-cards-title ${titleBlockClass}`}
              style={titleAnimation}
            >
              <h2 style={titleStyle}>
                <span>{activeCard.titleText || ''}</span>
              </h2>
            </div>

            <div
              className={`dynamic-cards-body ${bodyBlockClass}`}
              style={bodyAnimation}
            >
              <p style={bodyStyle}>
                <span>{activeCard.bodyText || ''}</span>
              </p>

              {bullets.length > 0 && (
                <ul className={`dynamic-cards-bullets grid ${bulletJustifyClass}`}>
                  {bullets.map((bullet, index) => (
                    <li key={`${bullet}-${index}`} className={`dynamic-cards-bullet flex max-w-full items-start gap-2 text-sm @md:text-base ${bodyAlign === 'center' ? 'justify-center' : ''}`} style={{ color: activeCard.bodyColor || '#E2E8F0' }}>
                      <BulletIcon size={16} className="mt-1 shrink-0" style={{ color: activeCard.ctaColor || 'var(--primary-color, #2563EB)' }} />
                      <span className="break-words">{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}

              {activeCard.ctaEnabled && (
                <div className={`mt-4 flex @md:mt-6 ${ctaJustifyClass}`}>
                  {renderCta()}
                </div>
              )}
            </div>
        </div>

        {showArrows && (
          <div className="absolute inset-y-0 left-0 right-0 z-30 flex items-center justify-between px-3 pointer-events-none">
            <button
              type="button"
              aria-label="Tarjeta anterior"
              onClick={() => goTo(activeIndex - 1)}
              className={`pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full transition-colors ${controlsClass}`}
            >
              <ArrowLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Tarjeta siguiente"
              onClick={() => goTo(activeIndex + 1)}
              className={`pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full transition-colors ${controlsClass}`}
            >
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {showDots && (
          <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-black/15 px-3 py-2 backdrop-blur-xl">
            {safeCards.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Ver tarjeta ${index + 1}`}
                onClick={() => goTo(index)}
                className={`h-2 rounded-full transition-all ${index === activeIndex ? 'w-7 bg-white' : 'w-2 bg-white/45 hover:bg-white/70'}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
