import React from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import {
  getSectionAnimationVariants,
  normalizeSectionAnimation,
  SectionAnimationType
} from '../../../constants/moduleAnimations';
import { ParallaxScrollContext } from '../ParallaxBackground';

type SectionAnimationProps = {
  animation?: unknown;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  speed?: number;
  viewport?: {
    once?: boolean;
    amount?: number;
  };
};

const DEFAULT_VIEWPORT = { once: true, amount: 0.45 } as const;

const scaleTransition = (transition: any, speed: number) => {
  if (!transition || typeof transition !== 'object') return transition;

  const next = Array.isArray(transition) ? [...transition] : { ...transition };

  Object.keys(next).forEach((key) => {
    const value = next[key];
    if ((key === 'duration' || key === 'delay') && typeof value === 'number') {
      next[key] = value * speed;
      return;
    }

    if (value && typeof value === 'object') {
      next[key] = scaleTransition(value, speed);
    }
  });

  return next;
};

const scaleVariants = (variants: any, speed: number) => {
  if (!variants || typeof variants !== 'object') return variants;

  const next: Record<string, any> = {};
  Object.entries(variants).forEach(([state, config]) => {
    if (!config || typeof config !== 'object') {
      next[state] = config;
      return;
    }

    next[state] = {
      ...config,
      transition: scaleTransition((config as any).transition, speed)
    };
  });

  return next;
};

export const SectionAnimation: React.FC<SectionAnimationProps> = ({
  animation,
  children,
  className,
  disabled = false,
  speed = 1,
  viewport
}) => {
  const prefersReducedMotion = useReducedMotion();
  const scrollContainerRef = React.useContext(ParallaxScrollContext);
  const sectionRef = React.useRef<HTMLDivElement | null>(null);
  const normalizedAnimation = normalizeSectionAnimation(animation);
  const viewportOptions = viewport || DEFAULT_VIEWPORT;
  const isInView = useInView(sectionRef, {
    once: viewportOptions.once,
    amount: viewportOptions.amount,
    root: scrollContainerRef || undefined
  });

  if (disabled || prefersReducedMotion || normalizedAnimation === 'none') {
    return className ? <div className={className}>{children}</div> : <>{children}</>;
  }

  const variants = getSectionAnimationVariants(normalizedAnimation as SectionAnimationType);

  if (!variants) {
    return className ? <div className={className}>{children}</div> : <>{children}</>;
  }

  const safeSpeed = Number.isFinite(speed) && speed > 0 ? speed : 1;
  const scaledVariants = safeSpeed === 1 ? variants : scaleVariants(variants, safeSpeed);

  return (
    <motion.div
      key={`${normalizedAnimation}-${safeSpeed}`}
      ref={sectionRef}
      className={className}
      variants={scaledVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
};
