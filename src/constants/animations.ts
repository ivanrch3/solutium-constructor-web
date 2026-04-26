import { Variants } from 'motion/react';

export const GLOBAL_ANIMATIONS: Record<string, Variants> = {
  'fade-in': {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } }
  },
  'slide-up': {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  },
  'slide-down': {
    hidden: { y: -50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  },
  'scale-up': {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] } }
  },
  'zoom-in': {
    hidden: { scale: 1.5, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } }
  },
  'flip': {
    hidden: { rotateX: 90, opacity: 0 },
    visible: { rotateX: 0, opacity: 1, transition: { duration: 0.8 } }
  },
  'blur-in': {
    hidden: { filter: 'blur(20px)', opacity: 0 },
    visible: { filter: 'blur(0px)', opacity: 1, transition: { duration: 1 } }
  },
  'bounce': {
    hidden: { y: 100, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 10 } }
  },
  'stagger': {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
  },
  'skew': {
    hidden: { skewX: 20, opacity: 0 },
    visible: { skewX: 0, opacity: 1, transition: { duration: 0.6 } }
  },
  'rotate': {
    hidden: { rotate: -180, opacity: 0, scale: 0.5 },
    visible: { rotate: 0, opacity: 1, scale: 1, transition: { duration: 1, ease: "easeOut" } }
  },
  'focus': {
    hidden: { scale: 2, opacity: 0, filter: 'blur(10px)' },
    visible: { scale: 1, opacity: 1, filter: 'blur(0px)', transition: { duration: 0.5 } }
  }
};

export const getGlobalAnimation = (type: string | undefined, moduleType?: string): Variants | null => {
  if (!type || type === 'custom') return null;
  
  if (type === 'random') {
    const keys = Object.keys(GLOBAL_ANIMATIONS);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return { ...GLOBAL_ANIMATIONS[randomKey] };
  }
  
  if (type === 'recommended') {
    if (moduleType?.includes('hero')) return GLOBAL_ANIMATIONS['scale-up'];
    if (moduleType?.includes('feature')) return GLOBAL_ANIMATIONS['slide-up'];
    if (moduleType?.includes('product')) return GLOBAL_ANIMATIONS['fade-in'];
    if (moduleType?.includes('cta')) return GLOBAL_ANIMATIONS['zoom-in'];
    if (moduleType?.includes('header')) return GLOBAL_ANIMATIONS['fade-in'];
    return GLOBAL_ANIMATIONS['slide-up'];
  }

  return GLOBAL_ANIMATIONS[type] || null;
};
