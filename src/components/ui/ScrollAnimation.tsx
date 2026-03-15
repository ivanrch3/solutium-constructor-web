import React from 'react';
import { motion, Variants } from 'motion/react';

export type AnimationType = 
  | 'none'
  | 'fade-up' 
  | 'fade-in' 
  | 'slide-left' 
  | 'slide-right' 
  | 'zoom-in' 
  | 'zoom-out' 
  | 'flip-up';

interface ScrollAnimationProps {
  children: React.ReactNode;
  animation?: AnimationType;
  duration?: number;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
  viewport?: { once?: boolean; amount?: number };
  tag?: 'div' | 'section' | 'article' | 'main' | 'header' | 'footer';
}

const variants: Record<AnimationType, Variants> = {
  'none': {
    hidden: {},
    visible: {}
  },
  'fade-up': {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 }
  },
  'fade-in': {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  },
  'slide-left': {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 }
  },
  'slide-right': {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 }
  },
  'zoom-in': {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  },
  'zoom-out': {
    hidden: { opacity: 0, scale: 1.2 },
    visible: { opacity: 1, scale: 1 }
  },
  'flip-up': {
    hidden: { opacity: 0, rotateX: 90 },
    visible: { opacity: 1, rotateX: 0 }
  }
};

export const ScrollAnimation = ({
  children,
  animation = 'fade-up',
  duration = 0.5,
  delay = 0,
  className = '',
  style = {},
  viewport = { once: true, amount: 0.3 },
  tag = 'div'
}: ScrollAnimationProps) => {
  const Component = motion[tag] as any;
  const StaticComponent = tag;

  if (animation === 'none') {
    return <StaticComponent className={className} style={style}>{children}</StaticComponent>;
  }

  return (
    <Component
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={variants[animation]}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
      style={style}
    >
      {children}
    </Component>
  );
};
