import React, { useState, useEffect, useLayoutEffect } from 'react';
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
  align?: 'left' | 'center' | 'right' | 'inherit';
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
  align = 'inherit',
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

  const isCentered = align === 'center';

  return (
    <span 
      className={`${isCentered ? 'flex flex-col items-center text-center w-full' : 'inline whitespace-normal'} ${className}`}
      style={{ 
        textAlign: align === 'inherit' ? 'inherit' : align,
      }}
    >
      {fixedText && (
        <span className={`${isCentered ? 'block' : 'inline'} mr-[0.25em]`}>
          {moduleId ? (
            <InlineEditableText
              moduleId={moduleId}
              elementId={`${moduleId}_el_hero_typography`}
              settingId="rotating_fixed"
              value={fixedText}
              isPreviewMode={isPreviewMode}
              onSave={onSaveFixed}
              tagName="span"
              className="inline"
            />
          ) : (
            <span>{fixedText}</span>
          )}
        </span>
      )}
      <span className="relative inline-flex items-baseline overflow-hidden py-[0.1em] -my-[0.1em] min-h-[1.1em] max-w-full align-baseline">
        <AnimatePresence mode="wait">
          <motion.span
            key={`${index}-${currentOptionValue}`}
            initial={currentVariant.initial}
            animate={currentVariant.animate}
            exit={currentVariant.exit}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="whitespace-nowrap inline-block align-baseline max-w-full"
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
      </span>
    </span>
  );
};

/**
 * ScaledOption handles the auto-fit scaling logic for individual words.
 * Using useLayoutEffect ensures measurement happens before the first paint,
 * avoiding the visual "jump" when text scales down.
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
  const [isReady, setIsReady] = useState(false);
  const ref = React.useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    let mounted = true;
    
    const measure = () => {
      if (!ref.current || !mounted) return;
      
      // Better measurement: look for the nearest container that defines the text width
      let container: HTMLElement | null = ref.current.parentElement;
      while (container && container.clientWidth === 0) {
        container = container.parentElement;
      }
      
      const availableWidth = container ? container.clientWidth - 20 : window.innerWidth - 60;
      
      // Temporal measurement without scaling to find natural width
      const originalFS = ref.current.style.fontSize;
      ref.current.style.fontSize = '1em';
      const actualWidth = ref.current.offsetWidth;
      ref.current.style.fontSize = originalFS;
      
      if (actualWidth > availableWidth && availableWidth > 0) {
        const newScale = Math.max(0.3, availableWidth / actualWidth);
        setScale(newScale);
      } else {
        setScale(1);
      }
      
      // All these state updates happen synchronously in the browser's layout phase
      setIsReady(true);
    };

    measure();
    
    window.addEventListener('resize', measure);
    
    return () => {
      mounted = false;
      window.removeEventListener('resize', measure);
    };
  }, [value]);

  return (
    <span 
      ref={ref}
      style={{
        ...style,
        fontSize: scale < 1 ? `${scale}em` : 'inherit',
        lineHeight: 1.1,
        opacity: isReady ? 1 : 0, 
        visibility: isReady ? 'visible' : 'hidden',
        transition: isReady ? 'opacity 0.3s ease-out' : 'none'
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

