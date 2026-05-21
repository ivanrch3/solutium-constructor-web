import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { getGlobalAnimation, isOfficialModuleAnimationType } from '../../constants/animations';

type ModuleAnimationWrapperProps = {
  animation?: unknown;
  moduleType?: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
};

const LEGACY_TO_ANIMATION: Record<string, string> = {
  fade_up: 'slide-up',
  reveal: 'fade-right',
  zoom: 'zoom-in',
  scale_up: 'zoom-in',
  'scale-up': 'zoom-in',
  blur: 'blur-in'
};

export const normalizeModuleAnimation = (
  value: unknown,
  fallback: string = 'slide-up'
): string => {
  if (value === false || value === 'false' || value === 0 || value === '0') {
    return 'none';
  }

  if (value === true || value === 'true' || value === 1 || value === '1') {
    return fallback;
  }

  const rawValue = String(value || '').trim().toLowerCase();
  if (!rawValue) return 'none';

  const normalized = LEGACY_TO_ANIMATION[rawValue] || rawValue;
  if (normalized === 'none') {
    return 'none';
  }

  if (isOfficialModuleAnimationType(normalized)) {
    return normalized;
  }

  return normalized;
};

const buildFallbackAnimation = (type: string) => {
  switch (type) {
    case 'fade-left':
      return {
        hidden: { opacity: 0, x: 40 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' as const } }
      };
    case 'fade-right':
      return {
        hidden: { opacity: 0, x: -40 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' as const } }
      };
    default:
      return null;
  }
};

export const ModuleAnimationWrapper: React.FC<ModuleAnimationWrapperProps> = ({
  animation,
  moduleType,
  children,
  className,
  disabled = false
}) => {
  const prefersReducedMotion = useReducedMotion();
  const normalizedAnimation = normalizeModuleAnimation(animation);

  if (disabled || prefersReducedMotion || normalizedAnimation === 'none') {
    return className ? <div className={className}>{children}</div> : <>{children}</>;
  }

  const animationVariants =
    getGlobalAnimation(normalizedAnimation, moduleType) ||
    buildFallbackAnimation(normalizedAnimation);

  if (!animationVariants) {
    return className ? <div className={className}>{children}</div> : <>{children}</>;
  }

  return (
    <motion.div
      className={className}
      variants={animationVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
};
