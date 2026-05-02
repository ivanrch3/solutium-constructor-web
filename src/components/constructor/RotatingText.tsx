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
  const [fontSizeScale, setFontSizeScale] = useState(1);
  const wordRef = React.useRef<HTMLSpanElement>(null);

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

  // Logic for Auto-Fitting long words on mobile (Solutium v8.3)
  useEffect(() => {
    const measureAndScale = () => {
      if (!wordRef.current) return;
      
      // Calculate available width (90% of viewport width or parent container if we had a reliable ref)
      // We use viewport width as a safe boundary for mobile
      const viewportPadding = 48; // px
      const availableWidth = window.innerWidth - viewportPadding;
      
      // Reset scale to measure true width
      wordRef.current.style.fontSize = '1em';
      const actualWidth = wordRef.current.offsetWidth;
      
      if (actualWidth > availableWidth) {
        const ratio = availableWidth / actualWidth;
        setFontSizeScale(Math.max(0.4, ratio)); // Min scale 0.4 to keep it legible
      } else {
        setFontSizeScale(1);
      }
    };

    // Small delay to ensure text is rendered (especially with typewriter or fade)
    const timeout = setTimeout(measureAndScale, 50);
    
    window.addEventListener('resize', measureAndScale);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', measureAndScale);
    };
  }, [index, options, currentOptionValue]);

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
            ref={wordRef}
            initial={currentVariant.initial}
            animate={currentVariant.animate}
            exit={currentVariant.exit}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              ...textStyle,
              fontSize: fontSizeScale < 1 ? `${fontSizeScale}em` : 'inherit',
              lineHeight: 1.1
            }}
            className="whitespace-nowrap inline-block"
          >
            {moduleId ? (
              <InlineEditableText
                moduleId={moduleId}
                elementId={`${moduleId}_el_hero_typography`}
                settingId="rotating_options"
                value={currentOptionValue}
                isPreviewMode={isPreviewMode}
                onSave={(val) => {
                  onSaveOption?.(index, val);
                  setIsPaused(false);
                }}
                tagName="span"
                onClick={(e) => {
                  setIsPaused(true);
                  // Ensure we select the element too
                }}
              />
            ) : (
              currentOptionValue
            )}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
};
