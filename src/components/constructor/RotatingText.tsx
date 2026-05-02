import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InlineEditableText } from './InlineEditableText';

interface RotatingTextProps {
  fixedText: string;
  options: string[];
  color?: string;
  gradient?: string;
  speed?: number; // duration in ms
  animationType?: 'fade' | 'slide' | 'typewriter';
  className?: string;
  moduleId?: string;
  isPreviewMode?: boolean;
  onSaveFixed?: (val: string) => void;
  onSaveOption?: (index: number, val: string) => void;
}

export const RotatingText: React.FC<RotatingTextProps> = ({
  fixedText,
  options,
  color = '#3B82F6',
  gradient,
  speed = 3000,
  animationType = 'fade',
  className = '',
  moduleId,
  isPreviewMode = false,
  onSaveFixed,
  onSaveOption
}) => {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (index >= options.length) {
      setIndex(0);
    }
  }, [options.length, index]);

  useEffect(() => {
    if (options.length <= 1 || isPaused) return;
    
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % options.length);
    }, speed);

    return () => clearInterval(interval);
  }, [options, speed, isPaused]);

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
  const currentOptionValue = options[index] || '';

  const isSafeGradient = gradient && !String(gradient).includes('NaN');
  const textStyle: React.CSSProperties = {
    color: isSafeGradient ? 'transparent' : color,
    backgroundImage: isSafeGradient ? gradient : 'none',
    WebkitBackgroundClip: isSafeGradient ? 'text' : 'initial',
    backgroundClip: isSafeGradient ? 'text' : 'initial',
    display: 'inline-block'
  };

  return (
    <div className={`inline-flex flex-wrap items-baseline gap-[0.25em] ${className}`}>
      {moduleId ? (
        <InlineEditableText
          moduleId={moduleId}
          elementId={`${moduleId}_el_hero_typography`}
          settingId="rotating_fixed"
          value={fixedText}
          isPreviewMode={isPreviewMode}
          onSave={onSaveFixed}
          tagName="span"
        />
      ) : (
        <span>{fixedText}</span>
      )}
      <div className="relative inline-flex overflow-hidden py-[0.1em] -my-[0.1em] items-baseline">
        <AnimatePresence mode="wait">
          <motion.span
            key={`${index}-${currentOptionValue}`}
            initial={currentVariant.initial}
            animate={currentVariant.animate}
            exit={currentVariant.exit}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="whitespace-nowrap inline-flex items-baseline"
          >
            <ScaledOption 
              value={currentOptionValue}
              index={index}
              moduleId={moduleId}
              isPreviewMode={isPreviewMode}
              onSaveOption={onSaveOption}
              style={textStyle}
              setIsPaused={setIsPaused}
            />
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
};

/**
 * ScaledOption handles the auto-fit scaling logic for individual words.
 * Moving this to a sub-component ensures measurement happens correctly 
 * when the word is actually mounted during transitions.
 */
const ScaledOption: React.FC<{
  value: string;
  index: number;
  moduleId?: string;
  isPreviewMode: boolean;
  onSaveOption?: (index: number, val: string) => void;
  style: React.CSSProperties;
  setIsPaused: (paused: boolean) => void;
}> = ({ value, index, moduleId, isPreviewMode, onSaveOption, style, setIsPaused }) => {
  const [scale, setScale] = useState(1);
  const ref = React.useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const measure = () => {
      if (!ref.current) return;
      
      const viewportPadding = 48; 
      const availableWidth = window.innerWidth - viewportPadding;
      
      const originalFS = ref.current.style.fontSize;
      ref.current.style.fontSize = '1em';
      const actualWidth = ref.current.offsetWidth;
      ref.current.style.fontSize = originalFS;

      if (actualWidth > availableWidth) {
        setScale(Math.max(0.4, availableWidth / actualWidth));
      } else {
        setScale(1);
      }
    };

    const timeout = setTimeout(measure, 50);
    window.addEventListener('resize', measure);
    
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', measure);
    };
  }, [value]);

  return (
    <span 
      ref={ref}
      style={{
        ...style,
        fontSize: scale < 1 ? `${scale}em` : 'inherit',
        lineHeight: 1.1
      }}
      className="inline-block"
    >
      {moduleId ? (
        <InlineEditableText
          moduleId={moduleId}
          elementId={`${moduleId}_el_hero_typography`}
          settingId="rotating_options"
          value={value}
          isPreviewMode={isPreviewMode}
          onSave={(val) => {
            onSaveOption?.(index, val);
            setIsPaused(false);
          }}
          tagName="span"
          onClick={() => setIsPaused(true)}
        />
      ) : (
        value
      )}
    </span>
  );
};
