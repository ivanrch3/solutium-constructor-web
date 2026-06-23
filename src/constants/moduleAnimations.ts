import { Variants } from 'motion/react';
import { resolveEffectiveAnimation } from '../utils/constructorAnimationPolicy';

export const OFFICIAL_SECTION_ANIMATIONS = [
  'none',
  'fade',
  'fade-up',
  'fade-down',
  'fade-left',
  'fade-right',
  'zoom',
  'blur',
  'clip'
] as const;

export type SectionAnimationType = typeof OFFICIAL_SECTION_ANIMATIONS[number];

const LEGACY_SECTION_ANIMATION_MAP: Record<string, SectionAnimationType> = {
  fade: 'fade',
  'fade-in': 'fade',
  fade_in: 'fade',
  'fade-up': 'fade-up',
  fade_up: 'fade-up',
  'slide-up': 'fade-up',
  slide_up: 'fade-up',
  'fade-down': 'fade-down',
  fade_down: 'fade-down',
  'slide-down': 'fade-down',
  slide_down: 'fade-down',
  'fade-left': 'fade-left',
  fade_left: 'fade-left',
  'fade-right': 'fade-right',
  fade_right: 'fade-right',
  reveal: 'fade-right',
  zoom: 'zoom',
  'zoom-in': 'zoom',
  zoom_in: 'zoom',
  'scale-up': 'zoom',
  scale_up: 'zoom',
  blur: 'blur',
  'blur-in': 'blur',
  blur_in: 'blur',
  clip: 'clip',
  clip_reveal: 'clip',
  'clip-reveal': 'clip',
  pop: 'zoom',
  'soft-pop': 'zoom',
  soft_pop: 'zoom',
  focus: 'blur',
  'focus-in': 'blur',
  focus_in: 'blur',
  recommended: 'fade-up',
  random: 'fade',
  custom: 'fade-up'
};

export const isSectionAnimationType = (
  value: string | undefined
): value is SectionAnimationType => {
  if (!value) return false;
  return (OFFICIAL_SECTION_ANIMATIONS as readonly string[]).includes(value);
};

export const normalizeSectionAnimation = (
  value: unknown,
  fallback: SectionAnimationType = 'fade-up'
): SectionAnimationType => {
  const effectiveValue = resolveEffectiveAnimation(value);

  if (effectiveValue === false || effectiveValue === 'false' || effectiveValue === 0 || effectiveValue === '0') {
    return 'none';
  }

  if (effectiveValue === true || effectiveValue === 'true' || effectiveValue === 1 || effectiveValue === '1') {
    return fallback;
  }

  const rawValue = String(effectiveValue || '').trim().toLowerCase();
  if (!rawValue) {
    return 'none';
  }

  if (isSectionAnimationType(rawValue)) {
    return rawValue;
  }

  return LEGACY_SECTION_ANIMATION_MAP[rawValue] || fallback;
};

export const SECTION_ANIMATION_VARIANTS: Record<Exclude<SectionAnimationType, 'none'>, Variants> = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.55, ease: 'easeOut' } }
  },
  'fade-up': {
    hidden: { opacity: 0, y: 32 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  },
  'fade-down': {
    hidden: { opacity: 0, y: -32 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  },
  'fade-left': {
    hidden: { opacity: 0, x: 32 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  },
  'fade-right': {
    hidden: { opacity: 0, x: -32 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  },
  zoom: {
    hidden: { opacity: 0, scale: 0.94 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.55, ease: 'easeOut' } }
  },
  blur: {
    hidden: { opacity: 0, filter: 'blur(10px)' },
    visible: { opacity: 1, filter: 'blur(0px)', transition: { duration: 0.65, ease: 'easeOut' } }
  },
  clip: {
    hidden: { opacity: 0, clipPath: 'inset(0 100% 0 0 round 24px)' },
    visible: { opacity: 1, clipPath: 'inset(0 0% 0 0 round 24px)', transition: { duration: 0.7, ease: 'easeOut' } }
  }
};

export const getSectionAnimationVariants = (
  animation: SectionAnimationType
): Variants | null => {
  if (animation === 'none') {
    return null;
  }

  return SECTION_ANIMATION_VARIANTS[animation];
};
