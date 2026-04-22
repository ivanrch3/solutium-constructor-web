import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface RotatingTextProps {
  fixedText: string;
  options: string[];
  color?: string;
  gradient?: string;
  speed?: number; // duration in ms
  animationType?: 'fade' | 'slide' | 'typewriter';
  className?: string;
}

export const RotatingText: React.FC<RotatingTextProps> = ({
  fixedText,
  options,
  color = '#3B82F6',
  gradient,
  speed = 3000,
  animationType = 'fade',
  className = ''
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (options.length <= 1) return;
    
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % options.length);
    }, speed);

    return () => clearInterval(interval);
  }, [options, speed]);

  const variants = {
    fade: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -10 }
    },
    slide: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 }
    },
    typewriter: {
      initial: { opacity: 0, width: 0 },
      animate: { opacity: 1, width: 'auto' },
      exit: { opacity: 0 }
    }
  };

  const currentVariant = variants[animationType] || variants.fade;

  const isSafeGradient = gradient && !String(gradient).includes('NaN');
  const textStyle: React.CSSProperties = {
    color: isSafeGradient ? 'transparent' : color,
    backgroundImage: isSafeGradient ? gradient : 'none',
    WebkitBackgroundClip: isSafeGradient ? 'text' : 'initial',
    backgroundClip: isSafeGradient ? 'text' : 'initial',
    display: 'inline-block'
  };

  return (
    <div className={`inline-flex flex-wrap items-center gap-[0.25em] ${className}`}>
      <span>{fixedText}</span>
      <div className="relative inline-block overflow-hidden align-bottom">
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            initial={currentVariant.initial}
            animate={currentVariant.animate}
            exit={currentVariant.exit}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={textStyle}
            className="whitespace-nowrap"
          >
            {options[index] || ''}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
};
